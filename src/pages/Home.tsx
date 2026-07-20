/**
 * HEXLOADERS — Home `/`
 * Hero + install chip → name ticker → the live 8×8 Fu Xi matrix of all 64
 * states → flagship deep-dives → philosophy → architecture summary →
 * distribution/CLI → FAQ → CTA. Pure #000/#FFF, stepped mechanical motion.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { LOADERS, MECHANICS } from '@/lib/registry';
import type { LoaderMeta, Mechanic } from '@/lib/registry';
import { LOADER_SOURCES } from '@/lib/sources';
import HexGlyph from '@/registry/loaders/hex-glyph';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';
import MechanicCell from '@/components/loaders/MechanicCell';
import Ticker from '@/components/Ticker';
import CodeBlock, { copyText } from '@/components/CodeBlock';
import PreviewCard from '@/components/PreviewCard';
import Kicker from '@/components/Kicker';
import BitEditor from '@/components/BitEditor';

const INSTALL_CMD = 'npx shadcn@latest add @hexloaders/bit-scanner';

/* ---------------------------------- hooks ---------------------------------- */

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      el.classList.add('is-on');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-on');
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`hexl-reveal${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ------------------------- perpetual micro-components ------------------------- */

/** SYS.CLOCK 00:00:00 — tally-flip seconds, invert blip at :00. */
const SysClock = memo(function SysClock() {
  const [now, setNow] = useState(() => new Date());
  const [blip, setBlip] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (now.getSeconds() !== 0) return;
    setBlip(true);
    const id = window.setTimeout(() => setBlip(false), 120);
    return () => window.clearTimeout(id);
  }, [now]);

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span
      className="font-mono text-mono-label uppercase tabular-nums"
      style={blip ? { filter: 'invert(1)' } : undefined}
    >
      SYS.CLOCK {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
    </span>
  );
});

/** Inline logo glyph stepping through random states every 120ms, continuously. */
const CycleGlyph = memo(function CycleGlyph({ size = 64 }: { size?: number }) {
  const [v, setV] = useState(63);
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => setV(Math.floor(Math.random() * 64)), 120);
    return () => window.clearInterval(id);
  }, []);
  return <HexGlyph value={v} size={size} aria-hidden="true" />;
});

/** Terminal type-in: 2 chars per 40ms tick, block cursor, hides 1200ms after done. */
function useTypeIn(text: string, start: boolean) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    if (!start) return;
    if (reducedMotion()) {
      setN(text.length);
      setDone(true);
      setCursor(false);
      return;
    }
    const id = window.setInterval(() => {
      setN((x) => {
        if (x >= text.length) {
          window.clearInterval(id);
          setDone(true);
          return x;
        }
        return x + 2;
      });
    }, 40);
    return () => window.clearInterval(id);
  }, [start, text]);
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setCursor(false), 1200);
    return () => window.clearTimeout(id);
  }, [done]);
  return { shown: text.slice(0, n), cursor };
}

/** Code caption that types in once when first visible. */
const TypedCode = memo(function TypedCode({ code, filename }: { code: string; filename: string }) {
  const ref = useReveal<HTMLDivElement>(0.3);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  const { shown, cursor } = useTypeIn(code, started);
  return (
    <div ref={ref} className="border border-hexl-fg">
      <div className="flex h-10 items-center justify-between border-b border-hexl-fg px-3 font-mono text-mono-micro uppercase">
        <span>{filename}</span>
        <span>SINGLE SOURCE OF TRUTH</span>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-mono-data">
        <code>
          {shown}
          {cursor && <span className="hexl-cursor">▮</span>}
        </code>
      </pre>
    </div>
  );
});

/** Mini 8×8 address map stepping through random cells every 240ms. */
const MiniMap = memo(function MiniMap({ onPick }: { onPick?: (v: number) => void }) {
  const [active, setActive] = useState(26);
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => setActive(Math.floor(Math.random() * 64)), 240);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="grid w-[120px] grid-cols-8 gap-px border border-hexl-fg bg-hexl-fg p-px" role="img" aria-label="8×8 address map">
      {Array.from({ length: 64 }, (_, v) => (
        <button
          key={v}
          type="button"
          tabIndex={-1}
          aria-label={`Cell ${v}`}
          onClick={() => onPick?.(v)}
          className={`aspect-square w-full ${v === active ? 'bg-hexl-fg' : 'bg-hexl-bg'}`}
        />
      ))}
    </div>
  );
});

/** Micro cycler through the 8 mechanic tags (steps(8) loop). */
const MechanicCycler = memo(function MechanicCycler() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % MECHANICS.length), 240);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-3">
      <HexGlyph value={(i * 8 + 7) & 63} size={32} aria-hidden="true" />
      <span className="font-mono text-mono-label uppercase tabular-nums">{MECHANICS[i]}</span>
    </div>
  );
});

/* --------------------------------- matrix --------------------------------- */

function FlagshipLive({ slug }: { slug: string }) {
  if (slug === 'bit-scanner') return <BitScanner size={56} showMeta={false} />;
  if (slug === 'mutating-matrix') return <MutatingMatrix cells={9} size={12} showMeta={false} />;
  return <InversionPulse size={56} />;
}

interface CellProps {
  meta: LoaderMeta;
  order: number;
  revealed: boolean;
  matched: boolean;
  flash: boolean;
  tabIx: number;
  registerRef: (i: number, el: HTMLAnchorElement | null) => void;
  onFocus: (i: number) => void;
}

const MatrixCell = memo(function MatrixCell({
  meta,
  order,
  revealed,
  matched,
  flash,
  tabIx,
  registerRef,
  onFocus,
}: CellProps) {
  const [visible, setVisible] = useState(false);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const setRefs = useCallback(
    (el: HTMLAnchorElement | null) => {
      registerRef(order, el);
      ioRef.current?.disconnect();
      if (el) {
        ioRef.current = new IntersectionObserver(
          (entries) => setVisible(entries[0].intersectionRatio >= 0.1),
          { threshold: [0, 0.1] },
        );
        ioRef.current.observe(el);
      }
    },
    [order, registerRef],
  );
  useEffect(() => () => ioRef.current?.disconnect(), []);

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await copyText(meta.install);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      role="gridcell"
      aria-label={`n°${meta.value} ${meta.name} — ${meta.mechanic}`}
      className={`hexl-cell group relative aspect-square${
        meta.flagship ? ' border-2 border-hexl-fg' : ''
      }${flash ? ' hexl-cell-flash' : ''}`}
      style={{ opacity: !revealed ? 0 : matched ? 1 : 0.08 }}
    >
      <Link
        ref={setRefs}
        to={`/loaders/${meta.slug}`}
        tabIndex={tabIx}
        onFocus={() => onFocus(order)}
        data-cell={meta.value}
        aria-label={`Open n°${meta.value} ${meta.name} details — ${meta.mechanic}`}
        className="absolute inset-0 cursor-pointer"
      >
        <span className="absolute left-1.5 top-1.5 font-mono text-mono-micro">
          n°{String(meta.value).padStart(2, '0')}
          {meta.flagship ? ' ★' : ''}
        </span>
        <span className="absolute bottom-1.5 left-1.5 font-mono text-mono-micro">{meta.binary}</span>
        <span className="absolute bottom-1.5 right-1.5 font-mono text-mono-micro">{meta.mechanic}</span>
        <span className="flex h-full w-full items-center justify-center">
          {meta.flagship ? (
            <FlagshipLive slug={meta.slug} />
          ) : (
            <span className="hexl-mech block w-[45%] max-w-[64px]">
              <MechanicCell value={meta.value} mechanic={meta.mechanic} size={64} active={visible && matched && revealed} />
            </span>
          )}
        </span>
      </Link>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 border-t border-hexl-fg bg-hexl-bg px-1.5 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <span className="truncate font-mono text-mono-micro">{meta.install}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy install command for ${meta.name}`}
          className="pointer-events-auto shrink-0 border border-hexl-fg px-1 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg"
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
    </div>
  );
});

type SortKey = 'fuxi' | 'kingwen' | 'mechanic';

function Matrix() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortKey>('fuxi');
  const [mech, setMech] = useState<Mechanic | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [revealedCount, setRevealedCount] = useState(0);
  const [blank, setBlank] = useState(false);
  const [focusIx, setFocusIx] = useState(0);
  const [flashValue, setFlashValue] = useState<number | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const cellRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  const order = useRef<LoaderMeta[]>([]);
  order.current = (() => {
    if (sort === 'kingwen') return [...LOADERS].sort((a, b) => a.hexagram.kingwen - b.hexagram.kingwen);
    if (sort === 'mechanic')
      return [...LOADERS].sort(
        (a, b) => MECHANICS.indexOf(a.mechanic) - MECHANICS.indexOf(b.mechanic) || a.value - b.value,
      );
    return [...LOADERS];
  })();

  const q = query.trim().toLowerCase();
  const matches = (m: LoaderMeta): boolean => {
    if (mech !== 'ALL' && m.mechanic !== mech) return false;
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || m.slug.includes(q) || m.binary.includes(q);
  };
  const matchCount = order.current.filter(matches).length;

  // CRT raster-order stepped assembly; re-scan on sort change (blank flash first).
  useEffect(() => {
    setBlank(true);
    setRevealedCount(0);
    const t0 = window.setTimeout(() => setBlank(false), 120);
    if (reducedMotion()) {
      setRevealedCount(64);
      return () => window.clearTimeout(t0);
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setRevealedCount(n);
      if (n >= 64) window.clearInterval(id);
    }, 12);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(id);
    };
  }, [sort]);

  const flashCell = useCallback((v: number) => {
    document.getElementById('matrix')?.scrollIntoView({ behavior: 'auto' });
    setFlashValue(v);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setFlashOn(n % 2 === 1);
      if (n >= 4) {
        window.clearInterval(id);
        setFlashOn(false);
        setFlashValue(null);
      }
    }, 120);
  }, []);

  // Name ticker / mini-map locator: flash a cell in the matrix.
  useEffect(() => {
    const h = (e: Event) => flashCell((e as CustomEvent<number>).detail);
    window.addEventListener('hexl:flash-cell', h);
    return () => window.removeEventListener('hexl:flash-cell', h);
  }, [flashCell]);

  const registerRef = useCallback((i: number, el: HTMLAnchorElement | null) => {
    cellRefs.current[i] = el;
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cols = window.innerWidth >= 1024 ? 8 : window.innerWidth >= 640 ? 4 : 2;
    let next = focusIx;
    if (e.key === 'ArrowRight') next = Math.min(63, focusIx + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, focusIx - 1);
    else if (e.key === 'ArrowDown') next = Math.min(63, focusIx + cols);
    else if (e.key === 'ArrowUp') next = Math.max(0, focusIx - cols);
    else if (e.key === 'Enter') {
      navigate(`/loaders/${order.current[focusIx].slug}`);
      return;
    } else if (e.key.toLowerCase() === 'c') {
      void copyText(order.current[focusIx].install);
      return;
    } else return;
    e.preventDefault();
    setFocusIx(next);
    cellRefs.current[next]?.focus();
  };

  const axisLabels = Array.from({ length: 8 }, (_, i) => i.toString(2).padStart(3, '0'));

  return (
    <section id="matrix" ref={sectionRef} className="border-b border-hexl-fg">
      <div className="mx-auto max-w-[1440px] px-6 pt-24 md:px-10">
        <Reveal>
          <div className="flex items-center justify-between">
            <Kicker className="flex-1">■ THE MATRIX</Kicker>
            <span className="ml-6 hidden font-mono text-mono-data md:block">8 TRIGRAMS × 8 TRIGRAMS = 64 STATES</span>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-8 font-grotesk text-display-lg uppercase">SIXTY-FOUR STATES. ONE GRID.</h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-6 max-w-[68ch] text-body-sm">
            Row = upper trigram (bits 3–5). Column = lower trigram (bits 0–2). Address = (upper &lt;&lt; 3) |
            lower. Every cell is a loader you can install, copy, and own.
          </p>
        </Reveal>
      </div>

      {/* filter bar — sticky under the navbar */}
      <div className="sticky top-14 z-40 mt-12 border-y border-hexl-fg bg-hexl-bg">
        <div className="mx-auto flex h-12 max-w-[1440px] items-stretch justify-between px-6 md:px-10">
          <div className="flex items-stretch overflow-x-auto">
            {(['ALL', ...MECHANICS] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMech(m)}
                aria-pressed={mech === m}
                className={`border-r border-hexl-fg px-3 font-mono text-mono-label uppercase first:border-l hover:bg-hexl-fg hover:text-hexl-bg${
                  mech === m ? ' bg-hexl-fg text-hexl-bg' : ''
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-3 border-l border-hexl-fg pl-3 md:flex">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH STATES…"
              aria-label="Search states by name, slug or binary"
              className="w-44 border border-hexl-fg bg-hexl-bg px-2 py-1 font-mono text-mono-data uppercase placeholder:opacity-[0.45]"
            />
            <span className="font-mono text-mono-micro uppercase tabular-nums">
              n° {String(matchCount).padStart(2, '0')}/64
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10">
        <div
          role="grid"
          aria-label={sort === 'fuxi' ? 'The 64 loaders, Fu Xi arrangement' : `The 64 loaders, sorted by ${sort}`}
          onKeyDown={onKeyDown}
          className={`relative grid grid-cols-2 gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-4${
            sort === 'fuxi' ? ' lg:grid-cols-[32px_repeat(8,minmax(0,1fr))]' : ' lg:grid-cols-8'
          }`}
        >
          {sort === 'fuxi'
            ? [
                <span key="axis-corner" className="hidden h-8 bg-hexl-bg lg:block" aria-hidden="true" />,
                ...axisLabels.map((label) => (
                  <span
                    key={`column-${label}`}
                    role="columnheader"
                    className="hidden h-8 items-center justify-center bg-hexl-bg font-mono text-mono-micro lg:flex"
                  >
                    {label}
                  </span>
                )),
              ]
            : null}
          {Array.from({ length: 8 }, (_, row) => row).flatMap((row) => [
            sort === 'fuxi' ? (
              <span
                key={`row-${row}`}
                role="rowheader"
                className="hidden items-center justify-center bg-hexl-bg font-mono text-mono-micro lg:flex"
              >
                {axisLabels[row]}
              </span>
            ) : null,
            ...order.current.slice(row * 8, row * 8 + 8).map((m, column) => {
              const i = row * 8 + column;
              return (
                <MatrixCell
                  key={m.slug}
                  meta={m}
                  order={i}
                  revealed={i < revealedCount}
                  matched={matches(m)}
                  flash={flashValue === m.value && flashOn}
                  tabIx={i === focusIx ? 0 : -1}
                  registerRef={registerRef}
                  onFocus={setFocusIx}
                />
              );
            }),
          ])}
          {blank && <div className="absolute inset-0 bg-hexl-fg" aria-hidden="true" />}
        </div>

        <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border border-hexl-fg px-4 py-3 font-mono text-mono-data sm:flex-row sm:items-center">
          <a
            href="https://github.com/yon2x2/hexloaders/issues"
            target="_blank"
            rel="noreferrer"
            className="uppercase hover:bg-hexl-fg hover:text-hexl-bg"
          >
            IMPROVE A LOADER → OPEN AN ISSUE
          </a>
          <label className="flex items-center gap-2 text-mono-label uppercase">
            SORT:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-hexl-fg bg-hexl-bg px-2 py-1 font-mono text-mono-data uppercase"
            >
              <option value="fuxi">FU XI (BINARY)</option>
              <option value="kingwen">KING WEN (SEQUENCE)</option>
              <option value="mechanic">MECHANIC</option>
            </select>
          </label>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- hero ---------------------------------- */

const TICKS = [0, 8, 16, 24, 32, 40, 48, 56, 64];

function CornerMarks() {
  const cls = 'absolute font-mono text-mono-data leading-none select-none';
  return (
    <>
      <span aria-hidden="true" className={`${cls} -left-2 -top-2`}>+</span>
      <span aria-hidden="true" className={`${cls} -right-2 -top-2`}>+</span>
      <span aria-hidden="true" className={`${cls} -bottom-2 -left-2`}>+</span>
      <span aria-hidden="true" className={`${cls} -bottom-2 -right-2`}>+</span>
    </>
  );
}

function Hero() {
  const { shown, cursor } = useTypeIn(INSTALL_CMD, true);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await copyText(INSTALL_CMD);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const rail = [
    { tag: '★ FLAGSHIP 01 — SCAN', node: <BitScanner size={72} showMeta={false} /> },
    { tag: '★ FLAGSHIP 02 — SEQUENCE', node: <MutatingMatrix cells={9} size={14} showMeta={false} /> },
    { tag: '★ FLAGSHIP 03 — INVERT', node: <InversionPulse size={64} /> },
  ];

  return (
    <section className="relative border-b border-hexl-fg">
      <div className="relative mx-auto flex min-h-[92vh] max-w-[1440px] flex-col justify-center px-6 py-16 md:px-10">
        <CornerMarks />
        <Reveal>
          <div className="flex items-center justify-between gap-6">
            <span className="font-mono text-mono-label uppercase">■ OPEN-SOURCE LOADER REGISTRY — 64 STATES / 6 BITS</span>
            <span className="hidden md:block"><SysClock /></span>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 className="font-grotesk text-display-xl uppercase">
              <Reveal delay={120}>
                <span className="block">
                  HEXAGRAM{' '}
                  <span className="hexl-hero-glyph inline-block align-baseline">
                    <CycleGlyph size={64} />
                  </span>{' '}
                  LOADERS
                </span>
              </Reveal>
              <Reveal delay={240}>
                <span className="block">FOR EVERY</span>
              </Reveal>
              <Reveal delay={360}>
                <span className="block">APP.</span>
              </Reveal>
            </h1>

            <Reveal delay={480}>
              <p className="mt-8 max-w-[560px] text-body">
                64 free and open-source loaders, built with React, TypeScript, and Tailwind CSS — on the oldest
                binary system ever recorded. Install one, copy the code, and make it yours.
              </p>
            </Reveal>

            <Reveal delay={600}>
              <div className="mt-8 flex h-14 max-w-[640px] items-stretch border border-hexl-fg">
                <div className="flex min-w-0 flex-1 items-center overflow-x-auto px-4 font-mono text-[15px]">
                  <span className="whitespace-nowrap">
                    {shown}
                    {cursor && <span className="hexl-cursor">▮</span>}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copy}
                  className="shrink-0 border-l border-hexl-fg px-6 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </Reveal>

            <Reveal delay={720}>
              <div className="mt-4 flex max-w-[640px] flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={() => document.getElementById('matrix')?.scrollIntoView({ behavior: 'auto' })}
                  className="flex h-14 flex-1 items-center justify-center border border-hexl-fg bg-hexl-fg px-6 font-mono text-mono-label uppercase text-hexl-bg hover:bg-hexl-bg hover:text-hexl-fg"
                >
                  BROWSE THE 64 →
                </button>
                <Link
                  to="/playground"
                  className="flex h-14 flex-1 items-center justify-center border border-hexl-fg px-6 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg sm:border-l-0"
                >
                  PLAYGROUND
                </Link>
              </div>
            </Reveal>
          </div>

          {/* right rail — flagship cells, live */}
          <div className="grid grid-cols-3 gap-px border border-hexl-fg bg-hexl-fg lg:col-span-4 lg:grid-cols-1">
            {rail.map((r) => (
              <div key={r.tag} className="flex flex-col bg-hexl-bg">
                <div className="border-b border-hexl-fg px-2 py-1 font-mono text-mono-micro uppercase">{r.tag}</div>
                <div className="flex flex-1 items-center justify-center p-4">{r.node}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom ruler axis */}
      <div className="border-t border-hexl-fg">
        <div className="mx-auto flex max-w-[1440px] justify-between px-6 md:px-10">
          {TICKS.map((t) => (
            <span key={t} className="flex flex-col items-center gap-1 py-1 font-mono text-mono-micro tabular-nums">
              <span aria-hidden="true" className="h-2 w-px bg-hexl-fg" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- flagship deep-dives ---------------------------- */

const FLAGSHIPS: {
  n: string;
  slug: string;
  name: string;
  mech: Mechanic;
  spec: string;
  body: string;
  render: (size: number) => ReactNode;
}[] = [
  {
    n: '01',
    slug: 'bit-scanner',
    name: 'BIT-SCANNER',
    mech: 'SCAN',
    spec: 'STATE 26 · BINARY 011010 · CYCLE 960MS · DEPS 0 · SIZE 1.8KB',
    body: 'A static hexagram in a ledger block. One row snaps from dim to full per tick, moving top to bottom in six discrete steps. A readout, not an ornament.',
    render: (size) => <BitScanner size={size} showMeta />,
  },
  {
    n: '02',
    slug: 'mutating-matrix',
    name: 'MUTATING MATRIX',
    mech: 'SEQUENCE',
    spec: 'STATE 19 · BINARY 010011 · CLOCK 120MS · DEPS 0 · SIZE 2.4KB',
    body: 'A 3×3 bank of glyphs stepping through the state space every 120ms — counting, sequencing, or seeded-random. A system visibly computing configurations.',
    render: (size) => <MutatingMatrix cells={9} size={Math.max(10, Math.round(size / 5))} showMeta />,
  },
  {
    n: '03',
    slug: 'inversion-pulse',
    name: 'INVERSION PULSE',
    mech: 'INVERT',
    spec: 'STATE 42 · BINARY 101010 · BASE 120MS · DEPS 0 · SIZE 2.1KB',
    body: 'The module snaps to negative on a programmable rhythm — colorspace, bitwise, or both. Zero transitions. Processing signaled by violence, not easing.',
    render: (size) => <InversionPulse size={size} />,
  },
];

function Flagships() {
  return (
    <section className="border-b border-hexl-fg">
      {FLAGSHIPS.map((f) => (
        <div key={f.slug} className="border-b border-hexl-fg last:border-b-0">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 py-24 md:px-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <PreviewCard
                preview={({ size }) => f.render(size)}
                code={LOADER_SOURCES[f.slug]}
                filename={`loaders/${f.slug}.tsx`}
                language="tsx"
              />
            </Reveal>
            <div className="lg:col-span-7">
              <Reveal>
                <Kicker>{`★ FLAGSHIP ${f.n} / 03 — MECHANIC: ${f.mech}`}</Kicker>
              </Reveal>
              <Reveal delay={80}>
                <h3 className="mt-6 font-grotesk text-display-md uppercase">{f.name}</h3>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-6 border-y border-hexl-fg py-2 font-mono text-mono-data">{f.spec}</div>
              </Reveal>
              <Reveal delay={240}>
                <p className="mt-6 max-w-[62ch] text-body-sm">{f.body}</p>
              </Reveal>
              <Reveal delay={320}>
                <CodeBlock
                  className="mt-6"
                  packageManager
                  language="bash"
                  showLineNumbers={false}
                  code={`shadcn@latest add @hexloaders/${f.slug}`}
                />
              </Reveal>
              <Reveal delay={400}>
                <Link
                  to={`/loaders/${f.slug}`}
                  className="mt-6 inline-block font-mono text-mono-label uppercase underline-offset-4 hover:bg-hexl-fg hover:text-hexl-bg"
                >
                  FULL DOCUMENTATION →
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------- philosophy ------------------------------- */

const GW = 64;
const GLH = GW / 8;
const GG = GW / 16;
const GH = 6 * GLH + 5 * GG;

function Philosophy() {
  const ref = useRef<HTMLElement | null>(null);
  const [lines, setLines] = useState(6);
  const [blip, setBlip] = useState(false);
  const [comp, setComp] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      setFlipped(true);
      return;
    }
    setLines(0);
    let interval: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        setBlip(true); // the page's single most violent moment
        window.setTimeout(() => setBlip(false), 120);
        let n = 0;
        interval = window.setInterval(() => {
          n += 1;
          setLines(n);
          if (n >= 6) window.clearInterval(interval);
        }, 120);
      },
      { threshold: 0.25 },
    );
    const io2 = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFlipped(true);
          io2.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    io2.observe(el);
    return () => {
      io.disconnect();
      io2.disconnect();
      if (interval) window.clearInterval(interval);
    };
  }, []);

  const v = comp ? 21 : 42; // hover steps to the bitwise complement
  const cells = ['2⁶ = 64 STATES', '≈ 3000 BCE — FIRST RECORD', '1703 CE — LEIBNIZ, BINARY ARITHMETIC'];

  return (
    <section
      ref={ref}
      data-invert=""
      className="border-b border-hexl-fg bg-hexl-bg text-hexl-fg"
      style={blip ? { filter: 'invert(1)' } : undefined}
    >
      <div className="mx-auto max-w-[1440px] px-6 py-32 md:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-grotesk text-display-lg uppercase">
              {['THE FIRST BINARY CODE', 'WAS DRAWN AS', 'SIX LINES.'].map((l, i) => (
                <Reveal key={l} delay={i * 120}>
                  <span className="block">{l}</span>
                </Reveal>
              ))}
            </h2>
            <Reveal delay={360}>
              <p className="mt-8 max-w-[560px] text-body">
                Five thousand years before the transistor, the 64 hexagrams encoded every configuration of a 6-bit
                word — solid for 1, broken for 0. In 1703 Leibniz published his binary arithmetic and recognized its
                mirror in the Fu Xi ordering. HEXLOADERS treats the 64 states exactly as that: an address space.
                Sixty-four states. Zero mysticism. One registry.
              </p>
            </Reveal>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 lg:col-span-5">
            <button
              type="button"
              onMouseEnter={() => setComp(true)}
              onMouseLeave={() => setComp(false)}
              onFocus={() => setComp(true)}
              onBlur={() => setComp(false)}
              aria-label="State 42 glyph. Hover to step to its bitwise complement."
              className="cursor-crosshair"
            >
              <svg width={240} height={(240 * GH) / GW} viewBox={`0 0 ${GW} ${GH}`} className="block max-w-full">
                {Array.from({ length: 6 }, (_, i) => {
                  const bit = (v >> i) & 1;
                  const y = GH - (i + 1) * GLH - i * GG;
                  const half = (GW - GG) / 2;
                  if (i >= lines) return null; // assemble bottom-to-top
                  return bit === 1 ? (
                    <rect key={i} x={0} y={y} width={GW} height={GLH} fill="currentColor" />
                  ) : (
                    <g key={i}>
                      <rect x={0} y={y} width={half} height={GLH} fill="currentColor" />
                      <rect x={half + GG} y={y} width={half} height={GLH} fill="currentColor" />
                    </g>
                  );
                })}
              </svg>
            </button>
            <div className="flex w-[240px] max-w-full justify-between font-mono text-mono-micro uppercase">
              <span>BIT 0</span>
              <span>BIT 5</span>
            </div>
            <div className="font-mono text-mono-micro uppercase">STATE 42 · 101010 · LSB = BOTTOM LINE</div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-3">
          {cells.map((c) => (
            <div key={c} className="bg-hexl-bg px-4 py-6 text-center font-mono text-mono-label uppercase">
              {flipped ? c : '··········'}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ architecture ------------------------------ */

const HEX_EXCERPT = `export type Line = 0 | 1;                        // 0 = Yin (broken) · 1 = Yang (solid)
export type Bits = [Line, Line, Line, Line, Line, Line]; // bottom → top

export interface Hexagram {
  value: number;        // 0–63, LSB = bottom line
  bits: Bits;           // derived
  upper: number;        // 0–7 trigram (bits 3–5)
  lower: number;        // 0–7 trigram (bits 0–2)
  kingwen: number;      // 1–64, sequence position
  binary: string;       // "011010" (top→bottom, print order)
}

export const bitsOf = (v: number): Bits =>
  [0,1,2,3,4,5].map(i => ((v >> i) & 1) as Line) as Bits;

export const HEXAGRAMS: readonly Hexagram[] = /* 64 generated entries */;`;

function Architecture() {
  const flash = (v: number) => window.dispatchEvent(new CustomEvent('hexl:flash-cell', { detail: v }));
  return (
    <section className="border-b border-hexl-fg">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10">
        <Reveal>
          <Kicker>■ ARCHITECTURE</Kicker>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-8 font-grotesk text-display-lg uppercase">SIXTY-FOUR STATES. ONE DICTIONARY.</h2>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-6 max-w-[68ch] text-body-sm">
            Every loader reads its configuration from a single generated dictionary — 64 entries, each a 6-bit
            value. Add a loader by composing mechanics over bits; never by drawing pixels.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px border border-hexl-fg bg-hexl-fg lg:grid-cols-3">
          <Reveal className="bg-hexl-bg">
            <div className="flex h-full flex-col p-6">
              <div className="font-mono text-mono-label uppercase">ENCODE</div>
              <div className="mt-2 font-mono text-mono-data">bitsOf(26) → [0,1,0,1,1,0]</div>
              <div className="mt-4">
                <BitEditor size={96} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={120} className="bg-hexl-bg">
            <div className="flex h-full flex-col p-6">
              <div className="font-mono text-mono-label uppercase">ADDRESS</div>
              <div className="mt-2 font-mono text-mono-data">value = (upper &lt;&lt; 3) | lower</div>
              <div className="mt-4">
                <MiniMap onPick={flash} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={240} className="bg-hexl-bg">
            <div className="flex h-full flex-col p-6">
              <div className="font-mono text-mono-label uppercase">COMPOSE</div>
              <div className="mt-2 font-mono text-mono-data">SCAN × SEQUENCE × INVERT × …</div>
              <div className="mt-4">
                <MechanicCycler />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-8">
          <TypedCode code={HEX_EXCERPT} filename="lib/hexagrams.ts — EXCERPT" />
        </Reveal>
        <Reveal delay={120}>
          <Link
            to="/docs/architecture"
            className="mt-6 inline-block font-mono text-mono-label uppercase underline-offset-4 hover:bg-hexl-fg hover:text-hexl-bg"
          >
            READ THE ARCHITECTURE →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ distribution ------------------------------ */

function Distribution() {
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const copyRow = async (i: number, text: string) => {
    await copyText(text);
    setCopiedRow(i);
    window.setTimeout(() => setCopiedRow(null), 1200);
  };

  const rows = [
    {
      n: '01',
      head: 'INSTALL',
      body: INSTALL_CMD,
      note: 'One file lands in your repo: components/loaders/bit-scanner.tsx.',
      copy: INSTALL_CMD,
    },
    {
      n: '02',
      head: 'OWN',
      body: 'No package. No lock-in.',
      note: 'The source is yours — rename it, break it, ship it.',
    },
    {
      n: '03',
      head: 'CUSTOMIZE',
      body: '--hexl-fg, --hexl-bg, --hexl-step',
      note: 'Scale or invert globally via CSS custom properties.',
      copy: ':root { --hexl-fg: #000000; --hexl-bg: #FFFFFF; --hexl-step: 120ms; }',
    },
  ];

  const phases = [
    { tag: 'PHASE 1 — SHIPPED', chip: 'NOW', body: 'shadcn-compatible registry, all 64 addressable.', blink: true },
    { tag: 'PHASE 2 — NEXT', chip: 'Q3', body: 'npx hexloaders add <slug> — dedicated CLI: interactive picker, --all, --list, hexloaders.json, registry at r.hexloaders.dev.', blink: false },
    { tag: 'PHASE 3 — LATER', chip: 'Q4+', body: 'Community registry, variant transforms (--mechanic scan), MCP server for agent-driven installs.', blink: false },
  ];

  return (
    <section className="border-b border-hexl-fg">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10">
        <Reveal>
          <Kicker>■ DISTRIBUTION</Kicker>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-8 font-grotesk text-display-lg uppercase">OWN YOUR LOADERS.</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {rows.map((r, i) => (
              <Reveal key={r.n} delay={i * 120}>
                <div className="flex items-stretch border border-hexl-fg border-b-0 last:border-b">
                  <div className="flex w-16 shrink-0 items-center justify-center border-r border-hexl-fg font-mono text-head">
                    {r.n}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="font-mono text-mono-label uppercase">{r.head}</div>
                    {r.copy ? (
                      <button
                        type="button"
                        onClick={() => void copyRow(i, r.copy!)}
                        className="mt-2 font-mono text-mono-data hover:bg-hexl-fg hover:text-hexl-bg"
                        title="Copy"
                      >
                        {copiedRow === i ? 'COPIED' : r.body}
                      </button>
                    ) : (
                      <div className="mt-2 font-mono text-mono-data">{r.body}</div>
                    )}
                    <div className="mt-2 text-body-sm">{r.note}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="lg:col-span-5">
            <Reveal>
              <div className="border border-hexl-fg">
                <div className="border-b border-hexl-fg px-4 py-2 font-mono text-mono-label uppercase">CLI ROADMAP</div>
                {phases.map((p) => (
                  <div key={p.tag} className="border-b border-hexl-fg p-4 last:border-b-0 hover:bg-hexl-fg hover:text-hexl-bg">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-mono-label uppercase">{p.tag}</span>
                      <span
                        className="border border-hexl-fg px-1 py-0.5 font-mono text-mono-micro uppercase"
                        style={p.blink ? { animation: 'hexl-blink 960ms steps(1,end) 2' } : undefined}
                      >
                        {p.chip}
                      </span>
                    </div>
                    <p className="mt-2 text-body-sm">{p.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <Link
                to="/docs/usage#cli-roadmap"
                className="mt-6 inline-block font-mono text-mono-label uppercase underline-offset-4 hover:bg-hexl-fg hover:text-hexl-bg"
              >
                READ THE FULL ROADMAP →
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- faq ---------------------------------- */

const FAQ = [
  {
    q: 'IS THIS AN NPM PACKAGE?',
    a: 'No. HEXLOADERS is a registry of source files. The CLI copies the file into your repository. You own it — there is nothing to upgrade and nothing to break.',
  },
  {
    q: 'DO THE LOADERS HAVE DEPENDENCIES?',
    a: 'Zero. Each loader is a single .tsx file using inline SVG and CSS custom properties. Tailwind is used for layout only; the motion is plain CSS steps().',
  },
  {
    q: 'CAN I USE THEM WITHOUT TAILWIND?',
    a: 'Yes. Every loader falls back to its CSS variables. Install manually and keep only the style block you need.',
  },
  {
    q: 'WHAT ABOUT REDUCED MOTION?',
    a: 'Every loader ships a static frame for prefers-reduced-motion. Mechanical does not mean hostile.',
  },
  {
    q: 'WHY HEXAGRAMS?',
    a: 'Because they are the oldest 6-bit address space we know of. Sixty-four states, solid and broken lines, one clean dictionary. The math was always there.',
  },
  {
    q: 'LICENSE?',
    a: 'MIT. Use them anywhere. Attribution appreciated, never required.',
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-hexl-fg last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-14 w-full items-center justify-between px-4 text-left font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
      >
        <span>{q}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] [transition-duration:240ms] ease-step-4 ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[68ch] px-4 pb-6 pt-2 text-body-sm">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="border-b border-hexl-fg">
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-10">
        <Reveal>
          <Kicker>■ F.A.Q.</Kicker>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="mt-8 font-grotesk text-display-md uppercase">SIX QUESTIONS. SIX ANSWERS.</h2>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-12 border border-hexl-fg">
            {FAQ.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------- cta ---------------------------------- */

function Cta() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="group border-b border-hexl-fg hover:bg-hexl-fg hover:text-hexl-bg">
      <div className="mx-auto flex min-h-24 max-w-[1440px] flex-col items-stretch justify-between gap-4 px-6 py-6 md:flex-row md:items-center md:px-10">
        <h2 className="font-grotesk text-display-md uppercase">STOP SHIPPING SPINNERS.</h2>
        <div className="flex flex-col sm:flex-row">
          <button
            type="button"
            onClick={async () => {
              await copyText(INSTALL_CMD);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            }}
            className="flex h-14 items-center justify-center border border-hexl-fg bg-hexl-fg px-6 font-mono text-mono-label uppercase text-hexl-bg group-hover:border-hexl-bg group-hover:bg-hexl-bg group-hover:text-hexl-fg hover:!bg-hexl-fg hover:!text-hexl-bg"
          >
            {copied ? 'COPIED' : 'COPY INSTALL COMMAND'}
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('matrix')?.scrollIntoView({ behavior: 'auto' })}
            className="flex h-14 items-center justify-center border border-hexl-fg px-6 font-mono text-mono-label uppercase group-hover:border-hexl-bg hover:bg-hexl-bg hover:text-hexl-fg sm:border-l-0"
          >
            BROWSE THE 64
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function Home() {
  const tickerItems = LOADERS.map((l) => ({
    label: `${l.name.toUpperCase()} ${l.binary}`,
    value: l.value,
  }));

  return (
    <>
      <Hero />
      <Ticker
        items={tickerItems}
        duration={36}
        steps={240}
        ariaLabel="All 64 loader names with their binary strings"
        onItemClick={(item) =>
          window.dispatchEvent(new CustomEvent('hexl:flash-cell', { detail: item.value }))
        }
      />
      <Matrix />
      <Flagships />
      <Philosophy />
      <Architecture />
      <Distribution />
      <Faq />
      <Cta />
    </>
  );
}
