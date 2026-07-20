/**
 * HEXLOADERS — Playground `/playground?loader=[slug]`
 * Full-screen configurator (playground.md): LOADER picker + STATE (BitEditor)
 * left, live STAGE center, PARAMETERS + OUTPUT right. Everything is live —
 * every control mutates the running loader and the generated JSX at once.
 * All feedback is stepped/instant: the playground obeys the rules it shows.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { LOADERS, MECHANICS, bySlug, loadersByMechanic } from '@/lib/registry';
import { HEXAGRAMS } from '@/lib/hexagrams';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';
import HexGlyph from '@/registry/loaders/hex-glyph';
import MechanicCell from '@/components/loaders/MechanicCell';
import BitEditor from '@/components/BitEditor';
import { copyText } from '@/components/CodeBlock';
import { PatternEditor, Segmented, SequenceInput, SteppedSlider, Toggle } from '@/components/interactive/controls';
import { reducedMotion } from '@/components/interactive/hooks';

/* --------------------------------- constants --------------------------------- */

const INTERVAL_VALUES = [120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440];
const SIZE_LABELS = ['S', 'M', 'L'] as const;
const SIZES_DEFAULT = [96, 144, 192];
const SIZES_MATRIX = [24, 40, 56];
const ZOOMS = [0.5, 1, 2];
const HOLD_INTERVAL = 3_600_000; // hold = clock stretched to 1h — a hard freeze
const DEFAULT_PATTERN = [7, 1, 7, 1, 3, 3, 0, 0];
const DEFAULT_SEQUENCE = [0, 17, 34, 42];
const MECHANIC_CLOCK: Record<string, number> = { INVERT: 240 }; // others 120 (MechanicCell CLOCK)

type MmMode = 'count' | 'kingwen' | 'random' | 'custom';
type IpMode = 'colorspace' | 'bitwise' | 'both';

const pascal = (slug: string): string =>
  slug
    .split('-')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');

const clampState = (n: number): number => ((Math.floor(n) % 64) + 64) % 64;

const trimPattern = (pattern: number[]): number[] => {
  let end = pattern.length;
  while (end > 1 && pattern[end - 1] === 0) end--;
  const trimmed = pattern.slice(0, end);
  return trimmed.some((w) => w > 0) ? trimmed : [1];
};

/* ------------------------------- URL (de)coding ------------------------------ */

interface InitialConfig {
  slug: string;
  value: number;
  sizeIdx: number;
  interval: number;
  invert: boolean;
  mmMode: MmMode;
  ipMode: IpMode;
  cells: 1 | 4 | 9;
  pattern: number[];
  sequence: number[];
}

function parseInitial(params: URLSearchParams): InitialConfig {
  const cfg: InitialConfig = {
    slug: 'bit-scanner',
    value: -1, // -1 = follow loader default
    sizeIdx: 2,
    interval: 120,
    invert: false,
    mmMode: 'count',
    ipMode: 'both',
    cells: 9,
    pattern: DEFAULT_PATTERN,
    sequence: DEFAULT_SEQUENCE,
  };
  const loader = params.get('loader');
  if (loader && bySlug(loader)) cfg.slug = loader;
  const state = params.get('state');
  if (state !== null && /^\d{1,2}$/.test(state) && Number(state) <= 63) cfg.value = Number(state);
  const size = params.get('size');
  if (size === 'S') cfg.sizeIdx = 0;
  else if (size === 'M') cfg.sizeIdx = 1;
  else if (size === 'L') cfg.sizeIdx = 2;
  const iv = params.get('interval');
  if (iv !== null) {
    const n = Number(iv);
    if (Number.isInteger(n) && n >= 120 && n <= 1440 && n % 120 === 0) cfg.interval = n;
  }
  if (params.get('invert') === '1') cfg.invert = true;
  const mode = params.get('mode');
  if (mode === 'count' || mode === 'kingwen' || mode === 'random' || mode === 'custom') cfg.mmMode = mode;
  if (mode === 'colorspace' || mode === 'bitwise' || mode === 'both') cfg.ipMode = mode;
  const cells = params.get('cells');
  if (cells === '1' || cells === '4' || cells === '9') cfg.cells = Number(cells) as 1 | 4 | 9;
  const pattern = params.get('pattern');
  if (pattern) {
    const beats = pattern
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 7);
    if (beats.length > 0) {
      const p = beats.slice(0, 8);
      while (p.length < 8) p.push(0);
      cfg.pattern = p;
    }
  }
  const seq = params.get('seq');
  if (seq) {
    const states = seq
      .split(',')
      .map((s) => Number(s))
      .filter((n) => Number.isInteger(n) && n >= 0 && n <= 63);
    if (states.length > 0) cfg.sequence = states;
  }
  return cfg;
}

/* ------------------------------ panel primitives ----------------------------- */

interface PanelHeaderProps {
  title: string;
  right?: ReactNode;
  open: boolean;
  onToggle: () => void;
  className?: string;
}

/** Ledger panel header — a collapse toggle on mobile, static row on desktop. */
function PanelHeader({ title, right, open, onToggle, className }: PanelHeaderProps) {
  return (
    <div className={`flex h-10 shrink-0 items-stretch justify-between border-b border-hexl-fg${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) onToggle();
        }}
        aria-expanded={open}
        className="flex items-center gap-2 px-3 font-mono text-mono-label uppercase lg:cursor-default"
      >
        <span aria-hidden="true" className="lg:hidden">
          {open ? '−' : '+'}
        </span>
        {title}
      </button>
      {right ? <div className="flex items-center gap-2 px-3 font-mono text-mono-micro uppercase">{right}</div> : null}
    </div>
  );
}

/** Square ledger micro-button (stage chrome, reset bar). */
function MicroButton({
  children,
  onClick,
  active,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`flex h-8 items-center border border-hexl-fg px-3 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg${
        active ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg text-hexl-fg'
      }${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  );
}

/* ----------------------------------- page ----------------------------------- */

export default function Playground() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [init] = useState(() => parseInitial(searchParams)); // mount-time deep link

  const firstMeta = bySlug(init.slug) ?? LOADERS[1];

  const [slug, setSlug] = useState(init.slug);
  const [value, setValue] = useState(init.value >= 0 ? init.value : firstMeta.value);
  const [sizeIdx, setSizeIdx] = useState(init.sizeIdx);
  const [intervalMs, setIntervalMs] = useState(init.interval);
  const [invert, setInvert] = useState(init.invert);
  const [showMeta, setShowMeta] = useState(true);
  const [mmMode, setMmMode] = useState<MmMode>(init.mmMode);
  const [mmCells, setMmCells] = useState<1 | 4 | 9>(init.cells);
  const [mmSeq, setMmSeq] = useState<number[]>(init.sequence);
  const [ipMode, setIpMode] = useState<IpMode>(init.ipMode);
  const [ipPattern, setIpPattern] = useState<number[]>(init.pattern);

  const [query, setQuery] = useState('');
  const [grid, setGrid] = useState(true);
  const [stageInvert, setStageInvert] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(1);
  const [held, setHeld] = useState(false);
  const [blip, setBlip] = useState(false);
  const [ruler, setRuler] = useState(0);
  const [shared, setShared] = useState(false);
  const [captured, setCaptured] = useState<'COPIED' | 'DOWNLOADED' | null>(null);

  const [open, setOpen] = useState({ loader: true, state: true, stage: true, params: true, output: true });
  const togglePanel = (k: keyof typeof open) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const stageRef = useRef<HTMLDivElement | null>(null);
  const loaderBoxRef = useRef<HTMLDivElement | null>(null);
  const stepTimeout = useRef<number | undefined>(undefined);
  const slotTimers = useRef<number[]>([]);
  const feedbackTimer = useRef<number | undefined>(undefined);

  const meta = bySlug(slug) ?? LOADERS[1];
  const hex = HEXAGRAMS[value];
  const isMm = slug === 'mutating-matrix';
  const isBs = slug === 'bit-scanner';
  const isIp = slug === 'inversion-pulse';
  const flagship = isMm || isBs || isIp;

  const sizePx = (isMm ? SIZES_MATRIX : SIZES_DEFAULT)[sizeIdx];
  const trimmedPattern = useMemo(() => trimPattern(ipPattern), [ipPattern]);
  const clock = flagship ? intervalMs : (MECHANIC_CLOCK[meta.mechanic] ?? 120);
  const effectiveInterval = held ? HOLD_INTERVAL : intervalMs;

  /* ------------------------------ URL serialization ------------------------------ */

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('loader', slug);
    p.set('state', String(value));
    p.set('size', SIZE_LABELS[sizeIdx]);
    if (flagship) p.set('interval', String(intervalMs));
    if (invert) p.set('invert', '1');
    if (isMm) {
      p.set('mode', mmMode);
      if (mmCells !== 9) p.set('cells', String(mmCells));
      if (mmMode === 'custom') p.set('seq', mmSeq.join(','));
    }
    if (isIp) {
      p.set('mode', ipMode);
      if (trimmedPattern.join(',') !== '7,1,7,1,3,3') p.set('pattern', trimmedPattern.join(','));
    }
    setSearchParams(p, { replace: true });
  }, [slug, value, sizeIdx, intervalMs, invert, mmMode, mmCells, mmSeq, ipMode, trimmedPattern, flagship, isMm, isIp, setSearchParams]);

  /* --------------------------- mutation blip (1 frame) --------------------------- */

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setBlip(true);
    const id = window.setTimeout(() => setBlip(false), 120);
    return () => window.clearTimeout(id);
  }, [slug, value, sizeIdx, intervalMs, invert, showMeta, mmMode, mmCells, mmSeq, ipMode, ipPattern]);

  /* -------------------------------- clock ruler -------------------------------- */

  useEffect(() => setRuler(0), [slug, clock]);
  useEffect(() => {
    if (held || reducedMotion()) return;
    const id = window.setInterval(() => setRuler((t) => t + 1), clock);
    return () => window.clearInterval(id);
  }, [clock, held]);

  useEffect(
    () => () => {
      window.clearTimeout(stepTimeout.current);
      window.clearTimeout(feedbackTimer.current);
      slotTimers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  /* --------------------------------- actions --------------------------------- */

  const selectLoader = (next: string) => {
    const m = bySlug(next);
    if (!m) return;
    setSlug(next);
    setValue(m.value); // registry default state = loader n°
    setHeld(false);
  };

  const resetDefaults = () => {
    setValue(meta.value);
    setSizeIdx(2);
    setIntervalMs(120);
    setInvert(false);
    setShowMeta(true);
    setMmMode('count');
    setMmCells(9);
    setMmSeq(DEFAULT_SEQUENCE);
    setIpMode('both');
    setIpPattern(DEFAULT_PATTERN);
    setHeld(false);
  };

  const share = async () => {
    await copyText(`${window.location.origin}${window.location.pathname}?${searchParams.toString()}`);
    setShared(true);
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setShared(false), 1200);
  };

  const randomizeSlot = () => {
    slotTimers.current.forEach((t) => window.clearTimeout(t));
    slotTimers.current = [];
    // Fixed 6-step deceleration — mechanical honesty, not a slot machine curve.
    for (let k = 1; k <= 6; k++) {
      slotTimers.current.push(window.setTimeout(() => setValue(Math.floor(Math.random() * 64)), k * 120));
    }
  };

  /* --------------------------- stage hold / single-step --------------------------- */

  const onStageClick = () => {
    if (!held) {
      setHeld(true); // first click holds the loop
      return;
    }
    // held: advance exactly one clock period, then freeze again
    window.clearTimeout(stepTimeout.current);
    setHeld(false);
    stepTimeout.current = window.setTimeout(() => setHeld(true), clock + 60);
  };

  const onStageDoubleClick = () => {
    window.clearTimeout(stepTimeout.current);
    setHeld(false); // resume loop
  };

  /* -------------------------------- PNG capture -------------------------------- */

  const capture = async () => {
    const root = stageRef.current;
    const svg = loaderBoxRef.current?.querySelector('svg');
    if (!root || !svg) return;
    const fg = getComputedStyle(root).color;
    const bg = getComputedStyle(root).backgroundColor;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.querySelectorAll('*').forEach((el) => {
      const f = el.getAttribute('fill');
      if (f && f.includes('--hexl-fg')) el.setAttribute('fill', fg);
    });
    const rect = svg.getBoundingClientRect();
    const xml = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(rect.width * scale));
      canvas.height = Math.max(1, Math.round(rect.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d context');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('no png');
      let feedback: 'COPIED' | 'DOWNLOADED' = 'DOWNLOADED';
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && 'write' in navigator.clipboard) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          feedback = 'COPIED';
        } catch {
          feedback = 'DOWNLOADED';
        }
      }
      if (feedback === 'DOWNLOADED') {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `hexloaders-${slug}-state-${value}.png`;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(a.href), 2400);
      }
      setCaptured(feedback);
    } catch {
      setCaptured(null);
    } finally {
      URL.revokeObjectURL(url);
    }
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCaptured(null), 1200);
  };

  /* ------------------------------ loader list (filtered) ------------------------------ */

  const q = query.trim().toLowerCase();
  const matches = (l: (typeof LOADERS)[number]): boolean =>
    !q ||
    l.name.toLowerCase().includes(q) ||
    l.slug.includes(q) ||
    l.binary.includes(q) ||
    l.mechanic.toLowerCase().includes(q);
  const matchCount = LOADERS.filter(matches).length;

  /* -------------------------------- generated JSX -------------------------------- */

  interface JLine {
    text: string;
    changed: boolean;
  }

  const jsxLines = useMemo((): JLine[] => {
    const name = pascal(slug);
    const out: JLine[] = [
      { text: `import ${name} from '@/loaders/${slug}';`, changed: false },
      { text: '', changed: false },
      { text: `<${name}`, changed: false },
    ];
    const push = (prop: string, changed: boolean) => out.push({ text: `  ${prop}`, changed });
    const pushInvert = () => (invert ? push('invert', true) : push('invert={false}', false));

    if (isBs) {
      push(`value={${value}}`, value !== 26);
      push(`step={${intervalMs}}`, intervalMs !== 120);
      push(`size={${sizePx}}`, sizePx !== 96);
      pushInvert();
      push(`showMeta={${showMeta}}`, !showMeta);
    } else if (isMm) {
      push(`mode="${mmMode}"`, mmMode !== 'count');
      if (mmMode === 'custom') push(`sequence={[${mmSeq.join(',')}]}`, true);
      push(`interval={${intervalMs}}`, intervalMs !== 120);
      push(`cells={${mmCells}}`, mmCells !== 9);
      push(`size={${sizePx}}`, sizePx !== 32);
      push(`showMeta={${showMeta}}`, !showMeta);
    } else if (isIp) {
      push(`mode="${ipMode}"`, ipMode !== 'both');
      push(`pattern={[${trimmedPattern.join(',')}]}`, trimmedPattern.join(',') !== '7,1,7,1,3,3');
      push(`interval={${intervalMs}}`, intervalMs !== 120);
      push(`value={${value}}`, value !== 42);
      push(`size={${sizePx}}`, sizePx !== 96);
      pushInvert();
    } else {
      push(`value={${value}}`, value !== meta.value);
      push(`size={${sizePx}}`, sizePx !== 96);
      pushInvert();
    }
    out.push({ text: '/>', changed: false });
    return out;
  }, [slug, value, sizePx, intervalMs, invert, showMeta, mmMode, mmCells, mmSeq, ipMode, trimmedPattern, isBs, isMm, isIp, meta.value]);

  const jsxText = useMemo(() => jsxLines.map((l) => l.text).join('\n'), [jsxLines]);

  // Changed lines flash invert once (120ms) on parameter change.
  const [flash, setFlash] = useState<number[]>([]);
  const prevLines = useRef<string[]>(jsxLines.map((l) => l.text));
  useEffect(() => {
    const prev = prevLines.current;
    const next = jsxLines.map((l) => l.text);
    const diff = next.map((t, i) => (t !== prev[i] ? i : -1)).filter((i) => i >= 0);
    prevLines.current = next;
    if (diff.length > 0) {
      setFlash(diff);
      const id = window.setTimeout(() => setFlash([]), 120);
      return () => window.clearTimeout(id);
    }
  }, [jsxLines]);

  // Terminal type-in on first mount only: 2 chars per 40ms tick, block cursor.
  const [typed, setTyped] = useState<number | null>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const full = jsxText;
    setTyped(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 2;
      if (n >= full.length) {
        window.clearInterval(id);
        setTyped(null);
      } else {
        setTyped(n);
      }
    }, 40);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [copiedJsx, setCopiedJsx] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const copyJsx = async () => {
    await copyText(jsxText);
    setCopiedJsx(true);
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCopiedJsx(false), 1200);
  };
  const copyInstall = async () => {
    await copyText(meta.install);
    setCopiedInstall(true);
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCopiedInstall(false), 1200);
  };

  /* --------------------------------- stage loader --------------------------------- */

  const stageLoader = (() => {
    if (isBs)
      return <BitScanner value={value} step={effectiveInterval} size={sizePx} invert={invert} showMeta={showMeta} />;
    if (isMm)
      return (
        <MutatingMatrix
          mode={mmMode}
          sequence={mmSeq}
          interval={effectiveInterval}
          cells={mmCells}
          size={sizePx}
          showMeta={showMeta}
        />
      );
    if (isIp)
      return (
        <InversionPulse
          mode={ipMode}
          pattern={trimmedPattern}
          interval={effectiveInterval}
          value={value}
          size={sizePx}
          invert={invert}
        />
      );
    return <MechanicCell value={value} mechanic={meta.mechanic} size={sizePx} invert={invert} active={!held} />;
  })();

  const rulerPos = ruler % 60;

  /* ------------------------------------ layout ------------------------------------ */

  return (
    <div className="flex flex-col border-b border-hexl-fg lg:grid lg:h-[calc(100dvh-56px)] lg:grid-cols-[340px_minmax(0,1fr)_380px] lg:grid-rows-[minmax(0,1fr)_auto]">
      {/* ============================== PANEL 1 — LOADER ============================== */}
      <section className="order-1 flex min-h-0 flex-col border-b border-hexl-fg lg:col-start-1 lg:row-start-1 lg:border-b lg:border-r" aria-label="Loader picker">
        <PanelHeader
          title="LOADER"
          right={<span>n° {String(matchCount).padStart(2, '0')}/64</span>}
          open={open.loader}
          onToggle={() => togglePanel('loader')}
        />
        <div className={open.loader ? 'flex min-h-0 flex-1 flex-col' : 'hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col'}>
          <div className="shrink-0 border-b border-hexl-fg px-3 py-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH STATES…"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Search loaders"
              className="h-8 w-full border border-hexl-fg bg-hexl-bg px-2 font-mono text-mono-data uppercase text-hexl-fg placeholder:opacity-[0.45]"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto max-h-72 lg:max-h-none">
            {matchCount === 0 ? (
              <div className="flex items-center gap-4 px-3 py-4">
                <HexGlyph value={0} size={32} aria-hidden="true" />
                <span className="font-mono text-mono-micro uppercase">NO STATES MATCH — 0/64</span>
              </div>
            ) : (
              MECHANICS.map((mech) => {
                const group = loadersByMechanic(mech).filter(matches);
                if (group.length === 0) return null;
                return (
                  <div key={mech}>
                    <div className="flex items-center justify-between border-t border-hexl-fg bg-hexl-bg px-3 py-1 font-mono text-mono-micro uppercase first:border-t-0">
                      <span>{mech}</span>
                      <span>{group.length}</span>
                    </div>
                    {group.map((l, i) => (
                      <button
                        key={l.slug}
                        type="button"
                        onClick={() => selectLoader(l.slug)}
                        aria-pressed={l.slug === slug}
                        className={`animate-hexl-snap flex w-full items-center justify-between gap-2 border-t border-hexl-fg px-3 py-2 text-left font-mono hover:bg-hexl-fg hover:text-hexl-bg${
                          l.slug === slug ? ' bg-hexl-fg text-hexl-bg' : ''
                        }`}
                        style={{ animationDelay: `${Math.min(i * 4, 240)}ms` }}
                      >
                        <span className="truncate text-mono-data">{l.name}</span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className="text-mono-data tabular-nums">{l.binary}</span>
                          <span className="text-mono-micro uppercase opacity-[0.45]">{l.mechanic.slice(0, 3)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ============================== PANEL 2 — STATE ============================== */}
      <section
        className="order-3 border-b border-hexl-fg lg:order-none lg:col-start-1 lg:row-start-2 lg:max-h-full lg:overflow-y-auto lg:border-b-0 lg:border-r"
        aria-label="State editor"
        onKeyDown={(e) => {
          const t = e.target as HTMLElement;
          if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
          if (e.key === '+') setValue((v) => clampState(v + 1));
          else if (e.key === '-') setValue((v) => clampState(v - 1));
          else if (e.key === 'i' || e.key === 'I') setValue((v) => v ^ 63);
          else if (e.key === 'r' || e.key === 'R') randomizeSlot();
        }}
      >
        <PanelHeader
          title="STATE"
          right={
            <span className="tabular-nums">
              n°{value} · {hex.binary}
            </span>
          }
          open={open.state}
          onToggle={() => togglePanel('state')}
        />
        <div className={open.state ? '' : 'hidden lg:block'}>
          <BitEditor value={value} onChange={setValue} size={128} className="border-0" />
          {/* 6-cell binary strip — a second way to edit the same word (print order top→bottom). */}
          <div className="flex border-t border-hexl-fg" role="group" aria-label="Binary strip — click a cell to toggle its bit">
            {[5, 4, 3, 2, 1, 0].map((bitIdx, i) => {
              const on = ((value >> bitIdx) & 1) === 1;
              return (
                <button
                  key={bitIdx}
                  type="button"
                  onClick={() => setValue(value ^ (1 << bitIdx))}
                  aria-pressed={on}
                  aria-label={`Bit ${bitIdx} — ${on ? '1 Yang' : '0 Yin'}. Toggle.`}
                  className={`flex h-12 flex-1 flex-col items-center justify-center gap-1 hover:bg-hexl-fg hover:text-hexl-bg${i > 0 ? ' border-l border-hexl-fg' : ''}`}
                >
                  <span aria-hidden="true" className={`block h-3 w-3${on ? ' bg-hexl-fg' : ' border border-hexl-fg'}`} />
                  <span className="font-mono text-mono-micro tabular-nums">{on ? 1 : 0}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={randomizeSlot}
              aria-label="Random state — steps through 6 rapid states before settling"
              className="flex h-12 flex-1 flex-col items-center justify-center gap-1 border-l border-hexl-fg font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg"
            >
              <span aria-hidden="true" className="block h-3 w-3 border border-current" />
              RND
            </button>
          </div>
          <div className="border-t border-hexl-fg px-3 py-2 font-mono text-mono-micro uppercase tabular-nums">
            KING WEN n°{hex.kingwen} — UPPER {hex.upper.toString(2).padStart(3, '0')} · LOWER {hex.lower.toString(2).padStart(3, '0')}
          </div>
        </div>
      </section>

      {/* ============================== PANEL 3 — STAGE ============================== */}
      <section className="order-2 flex min-h-[480px] flex-col lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:min-h-0" aria-label="Preview stage">
        <div className="flex h-10 shrink-0 items-stretch justify-between border-b border-hexl-fg">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) togglePanel('stage');
            }}
            aria-expanded={open.stage}
            className="flex min-w-0 items-center gap-2 px-3 font-mono text-mono-label uppercase lg:cursor-default"
          >
            <span aria-hidden="true" className="lg:hidden">
              {open.stage ? '−' : '+'}
            </span>
            <span className="truncate">
              PREVIEW — {meta.name.toUpperCase()}
              {held ? <span className="ml-2 bg-hexl-fg px-1 text-hexl-bg">HOLD</span> : null}
            </span>
          </button>
          <div className="flex shrink-0 items-stretch border-l border-hexl-fg">
            <button
              type="button"
              onClick={() => setGrid((g) => !g)}
              aria-pressed={grid}
              className={`border-r border-hexl-fg px-3 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg${grid ? ' bg-hexl-fg text-hexl-bg' : ''}`}
            >
              GRID
            </button>
            <button
              type="button"
              onClick={() => setStageInvert((v) => !v)}
              aria-pressed={stageInvert}
              className={`px-3 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg${stageInvert ? ' bg-hexl-fg text-hexl-bg' : ''}`}
            >
              INVERT
            </button>
            <div className="flex items-stretch border-l border-hexl-fg" role="group" aria-label="Zoom stepper">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                className="px-2 font-mono text-mono-micro hover:bg-hexl-fg hover:text-hexl-bg"
              >
                −
              </button>
              <span className="flex items-center border-l border-hexl-fg px-2 font-mono text-mono-micro uppercase tabular-nums">
                ZOOM {ZOOMS[zoomIdx]}×
              </span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))}
                className="border-l border-hexl-fg px-2 font-mono text-mono-micro hover:bg-hexl-fg hover:text-hexl-bg"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={capture}
              className="border-l border-hexl-fg px-3 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg"
              aria-live="polite"
            >
              {captured ?? 'EXPORT PNG'}
            </button>
          </div>
        </div>

        <div className={open.stage ? 'flex min-h-0 flex-1 flex-col' : 'hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col'}>
          <div
            ref={stageRef}
            role="application"
            aria-label="Loader stage. Click to hold the loop, click again to advance one step, double-click to resume."
            className="relative min-h-0 flex-1 cursor-crosshair select-none overflow-hidden bg-hexl-bg text-hexl-fg"
            data-invert={stageInvert ? '' : undefined}
            onClick={onStageClick}
            onDoubleClick={onStageDoubleClick}
          >
            {grid && (
              <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]">
                <defs>
                  <pattern id="pg-stage-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M32 .5H.5V32" fill="none" stroke="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pg-stage-grid)" />
              </svg>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={blip ? { filter: 'invert(1)' } : undefined}
            >
              <div ref={loaderBoxRef} style={{ transform: `scale(${ZOOMS[zoomIdx]})` }}>
                {stageLoader}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <MicroButton onClick={resetDefaults} ariaLabel="Reset registry defaults">
                RESET
              </MicroButton>
              <MicroButton onClick={share} ariaLabel="Copy deep-link URL">
                {shared ? 'LINK COPIED' : 'COPY LINK'}
              </MicroButton>
            </div>
            <div className="pointer-events-none absolute bottom-2 right-2 hidden font-mono text-mono-micro uppercase opacity-[0.45] md:block">
              CLICK HOLD/STEP · DBL-CLICK RESUME
            </div>
          </div>

          {/* Clock ruler — one cell per interval tick of the running loader, then clear. */}
          <div className="flex h-8 shrink-0 items-stretch border-t border-hexl-fg" aria-hidden="true">
            <span className="flex w-24 shrink-0 items-center border-r border-hexl-fg px-2 font-mono text-mono-micro uppercase tabular-nums">
              CLK {clock}MS
            </span>
            <div className="flex flex-1 items-stretch">
              {Array.from({ length: 60 }, (_, i) => (
                <span key={i} className={`flex-1${i > 0 ? ' border-l border-hexl-fg' : ''}${i <= rulerPos ? ' bg-hexl-fg' : ''}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PANELS 4 + 5 — PARAMETERS / OUTPUT ===================== */}
      <aside className="order-4 flex flex-col lg:order-none lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:min-h-0 lg:overflow-y-auto lg:border-l" aria-label="Parameters and output">
        <PanelHeader
          title="PARAMETERS"
          right={<span>{meta.mechanic}</span>}
          open={open.params}
          onToggle={() => togglePanel('params')}
        />
        <div className={open.params ? '' : 'hidden lg:block'}>
          {isBs && (
            <SteppedSlider label="STEP" values={INTERVAL_VALUES} value={intervalMs} onChange={setIntervalMs} format={(v) => `${v}MS`} hint />
          )}
          {(isMm || isIp) && (
            <SteppedSlider label="INTERVAL" values={INTERVAL_VALUES} value={intervalMs} onChange={setIntervalMs} format={(v) => `${v}MS`} hint />
          )}
          {!flagship && (
            <div className="flex items-center justify-between border-b border-hexl-fg px-3 py-3 font-mono text-mono-micro uppercase">
              <span>CLOCK</span>
              <span className="tabular-nums">{clock}MS · FIXED BY MECHANIC</span>
            </div>
          )}

          {isMm && (
            <>
              <Segmented
                label="MODE"
                options={[
                  { value: 'count', label: 'COUNT' },
                  { value: 'kingwen', label: 'K.WEN' },
                  { value: 'random', label: 'RANDOM' },
                  { value: 'custom', label: 'CUSTOM' },
                ]}
                value={mmMode}
                onChange={setMmMode}
              />
              {mmMode === 'custom' && <SequenceInput label="SEQUENCE" sequence={mmSeq} onChange={setMmSeq} />}
              <Segmented
                label="CELLS"
                options={[
                  { value: 1, label: '1' },
                  { value: 4, label: '4' },
                  { value: 9, label: '9' },
                ]}
                value={mmCells}
                onChange={setMmCells}
              />
            </>
          )}

          {isIp && (
            <>
              <Segmented
                label="MODE"
                options={[
                  { value: 'colorspace', label: 'COLOR' },
                  { value: 'bitwise', label: 'BITS' },
                  { value: 'both', label: 'BOTH' },
                ]}
                value={ipMode}
                onChange={setIpMode}
              />
              <PatternEditor label="PATTERN" pattern={ipPattern} onChange={setIpPattern} />
            </>
          )}

          <Segmented
            label="SIZE"
            options={SIZE_LABELS.map((s, i) => ({ value: i, label: s }))}
            value={sizeIdx}
            onChange={setSizeIdx}
          />
          {(isBs || isMm) && <Toggle label="META RAIL" checked={showMeta} onChange={setShowMeta} />}
          {!isMm && <Toggle label="INVERT LOADER" checked={invert} onChange={setInvert} />}
        </div>

        <PanelHeader
          title="OUTPUT"
          right={<span>JSX + INSTALL</span>}
          open={open.output}
          onToggle={() => togglePanel('output')}
          className="border-t border-hexl-fg lg:border-t"
        />
        <div className={open.output ? '' : 'hidden lg:block'}>
          {/* GENERATED JSX — changed props bold, defaults dim, changed lines flash once. */}
          <div className="border-b border-hexl-fg">
            <div className="flex h-10 items-stretch justify-between border-b border-hexl-fg">
              <span className="flex items-center px-3 font-mono text-mono-micro uppercase">{pascal(slug)}.tsx — GENERATED JSX</span>
              <button
                type="button"
                onClick={copyJsx}
                className="border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
                aria-live="polite"
              >
                {copiedJsx ? 'COPIED' : 'COPY JSX'}
              </button>
            </div>
            <div className="max-h-56 overflow-auto p-3 font-mono text-mono-data">
              {typed !== null ? (
                <pre className="whitespace-pre-wrap">
                  {jsxText.slice(0, typed)}
                  <span className="hexl-cursor" aria-hidden="true">▮</span>
                </pre>
              ) : (
                jsxLines.map((l, i) => (
                  <div
                    key={i}
                    className={`min-h-[1.5em] whitespace-pre${l.changed ? ' font-bold' : ' opacity-[0.45]'}${flash.includes(i) ? ' bg-hexl-fg text-hexl-bg' : ''}`}
                  >
                    {l.text || ' '}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* INSTALL */}
          <div className="border-b border-hexl-fg">
            <div className="flex h-10 items-center border-b border-hexl-fg px-3 font-mono text-mono-micro uppercase">INSTALL</div>
            <div className="flex items-stretch justify-between">
              <code className="truncate px-3 py-3 font-mono text-mono-data">{meta.install}</code>
              <button
                type="button"
                onClick={copyInstall}
                className="shrink-0 border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
                aria-live="polite"
              >
                {copiedInstall ? 'COPIED' : 'COPY'}
              </button>
            </div>
            <Link
              to={`/loaders/${slug}`}
              className="block border-t border-hexl-fg px-3 py-3 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
            >
              OPEN DOCUMENTATION →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
