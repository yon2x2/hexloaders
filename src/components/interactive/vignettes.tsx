/**
 * HEXLOADERS — showcase vignettes (page-local)
 * Eight live UI mockups, each with a registry loader doing its job. Every
 * control is real and replayable. All motion is stepped / hard-cut; vignettes
 * freeze when offscreen (`active = false`) or filtered out.
 */

import { useEffect, useRef, useState } from 'react';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';
import HexGlyph from '@/registry/loaders/hex-glyph';
import { GENERATED_LOADERS } from '@/lib/generated-loaders';
import { HEXAGRAMS } from '@/lib/hexagrams';
import { reducedMotion } from './hooks';

export interface VignetteProps {
  active: boolean;
}

/** Small white-on-black ledger button for inverted (terminal) surfaces. */
function InvButton({ children, onClick, ariaLabel }: { children: string; onClick: () => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="shrink-0 border border-hexl-fg px-3 py-1 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg"
    >
      {children}
    </button>
  );
}

/* ============================ 1 — CHECKOUT BUTTON ============================ */

export function CheckoutButton({ active }: VignetteProps) {
  const [phase, setPhase] = useState<'idle' | 'processing' | 'confirmed'>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const run = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPhase('processing');
    timers.current.push(window.setTimeout(() => setPhase('confirmed'), 2400));
    timers.current.push(window.setTimeout(() => setPhase('idle'), 3600));
  };

  return (
    <button
      type="button"
      onClick={run}
      aria-live="polite"
      className={`flex h-12 items-center justify-center gap-3 border border-hexl-fg px-6 font-mono text-mono-label uppercase${
        phase === 'confirmed' ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg text-hexl-fg hover:bg-hexl-fg hover:text-hexl-bg'
      }`}
    >
      {phase === 'idle' && 'PAY NOW'}
      {phase === 'processing' && (
        <>
          {active ? (
            <BitScanner size={20} showMeta={false} aria-hidden="true" />
          ) : (
            <HexGlyph value={26} size={20} aria-hidden="true" />
          )}
          <span>PROCESSING</span>
        </>
      )}
      {phase === 'confirmed' && <span>CONFIRMED [OK]</span>}
    </button>
  );
}

/* ============================= 2 — BOOT SEQUENCE ============================= */

const BOOT_LINES = [
  '> MOUNT /dev/state0 ......... OK',
  '> LOAD 64 STATES ............ OK',
  '> LINK KING_WEN.TABLE ....... OK',
  '> CALIBRATE CLOCK 120MS ..... OK',
  '> SYSTEM READY ',
];
const BOOT_TOTAL = BOOT_LINES.join('\n').length;

export function BootSequence({ active }: VignetteProps) {
  const [chars, setChars] = useState(0);
  const done = chars >= BOOT_TOTAL;

  useEffect(() => {
    if (!active || done) return;
    if (reducedMotion()) {
      setChars(BOOT_TOTAL);
      return;
    }
    const id = window.setInterval(() => setChars((c) => Math.min(BOOT_TOTAL, c + 6)), 120);
    return () => window.clearInterval(id);
  }, [active, done]);

  // Render typed prefix line by line.
  let rest = chars;
  const shown = BOOT_LINES.map((line) => {
    const n = Math.max(0, Math.min(line.length, rest));
    rest -= line.length + 1; // +1 = newline
    return line.slice(0, n);
  });

  return (
    <div data-invert="" className="w-full max-w-md border border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="flex h-9 items-center justify-between border-b border-hexl-fg px-3">
        <span className="font-mono text-mono-micro uppercase">TTY0 — BOOT</span>
        <InvButton onClick={() => setChars(0)} ariaLabel="Reboot the boot sequence">
          REBOOT
        </InvButton>
      </div>
      <div className="flex items-start justify-between gap-4 p-4">
        <pre className="whitespace-pre-wrap font-mono text-mono-micro">
          {shown.map((line, i) => (
            <span key={i} className="block min-h-[1.4em]">
              {line}
              {i === BOOT_LINES.length - 1 && done && (
                <span className="hexl-cursor" aria-hidden="true">
                  ▮
                </span>
              )}
            </span>
          ))}
        </pre>
        <div aria-hidden="true">
          {active ? (
            <MutatingMatrix cells={1} mode="count" interval={120} size={40} showMeta={false} />
          ) : (
            <HexGlyph value={0} size={40} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ========================== 3 — DATA TABLE REFRESH ========================== */

const TABLE_VALUES = [42, 7, 63, 18, 26, 0, 53, 34, 11, 48, 21, 60];
const lockTickOf = (k: number) => 2 * (k + 1); // cascade order, one cell every 2 ticks

export function DataTableRefresh({ active }: VignetteProps) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [tick, setTick] = useState(0);
  const maxTick = lockTickOf(TABLE_VALUES.length - 1);

  useEffect(() => {
    if (phase !== 'running' || !active) return;
    if (reducedMotion()) {
      setTick(maxTick + 1);
      return;
    }
    const id = window.setInterval(() => setTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, [phase, active, maxTick]);

  useEffect(() => {
    if (phase === 'running' && tick > maxTick) setPhase('done');
  }, [phase, tick, maxTick]);

  const refresh = () => {
    setTick(0);
    setPhase('running');
  };

  return (
    <div className="w-full max-w-md border border-hexl-fg">
      <div className="flex h-9 items-center justify-between border-b border-hexl-fg px-3">
        <span className="font-mono text-mono-micro uppercase">STATES.TABLE — 4 ROWS</span>
        <button
          type="button"
          onClick={refresh}
          disabled={phase === 'running'}
          className="border border-hexl-fg px-3 py-1 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg disabled:opacity-[0.15]"
        >
          {phase === 'running' ? 'COUNTING…' : 'REFRESH'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-mono-micro uppercase">
          <tbody>
            {Array.from({ length: 4 }, (_, r) => (
              <tr key={r}>
                <td className="border-b border-r border-hexl-fg px-2 py-1 tabular-nums">0{r}</td>
                {Array.from({ length: 3 }, (_, c) => {
                  const k = r * 3 + c;
                  const locked = phase !== 'running' || tick >= lockTickOf(k);
                  return (
                    <td key={c} className="border-b border-r border-hexl-fg px-2 py-1">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="inline-flex w-7 justify-center">
                          {locked || !active ? (
                            <HexGlyph value={TABLE_VALUES[k]} size={24} />
                          ) : (
                            <GENERATED_LOADERS.COUNT value={34} size={24} aria-hidden="true" />
                          )}
                        </span>
                        <span className="tabular-nums">{locked ? `n°${TABLE_VALUES[k]}` : '——'}</span>
                      </span>
                    </td>
                  );
                })}
                <td className="border-b border-hexl-fg px-2 py-1 tabular-nums">
                  {phase === 'running' && tick < lockTickOf(r * 3 + 2) ? 'COUNT' : 'LOCK'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 font-mono text-mono-micro uppercase">
        {phase === 'done' ? 'REFRESH COMPLETE — 12 CELLS LOCKED' : phase === 'running' ? `CASCADE — TICK ${tick}` : 'IDLE — 12 CELLS'}
      </div>
    </div>
  );
}

/* ============================== 4 — UPLOAD CARD ============================== */

export function UploadCard({ active }: VignetteProps) {
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== 'uploading' || !active) return;
    if (reducedMotion()) {
      setStep(6);
      return;
    }
    const id = window.setInterval(() => setStep((s) => Math.min(6, s + 1)), 240);
    return () => window.clearInterval(id);
  }, [phase, active]);

  useEffect(() => {
    if (phase !== 'uploading' || step < 6) return;
    const id = window.setTimeout(() => setPhase('done'), 240); // one beat at 99.6%, then hard swap
    return () => window.clearTimeout(id);
  }, [phase, step]);

  const pct = Math.min(100, Math.round(step * 16.6 * 10) / 10);

  return (
    <button
      type="button"
      onClick={() => {
        setStep(0);
        setPhase('uploading'); // replays from any phase
      }}
      aria-live="polite"
      className="flex h-44 w-64 flex-col items-center justify-center gap-3 border border-hexl-fg bg-hexl-bg px-6 text-hexl-fg hover:bg-hexl-fg hover:text-hexl-bg"
    >
      {phase === 'idle' && (
        <>
          <span className="font-mono text-mono-label uppercase">DROP FILE</span>
          <span className="font-mono text-mono-micro uppercase opacity-[0.55]">CLICK TO SIMULATE</span>
        </>
      )}
      {phase === 'uploading' && (
        <>
          {active ? (
            <GENERATED_LOADERS.STACK value={11} size={48} aria-hidden="true" />
          ) : (
            <HexGlyph value={11} size={48} aria-hidden="true" />
          )}
          <span className="font-mono text-mono-data tabular-nums">{pct.toFixed(1)}%</span>
        </>
      )}
      {phase === 'done' && (
        <>
          <HexGlyph value={42} size={40} aria-hidden="true" />
          <span className="font-mono text-mono-label uppercase">DONE</span>
          <span className="font-mono text-mono-micro uppercase">state_42.bin — 6 BITS RECEIVED</span>
        </>
      )}
    </button>
  );
}

/* ============================ 5 — PAGE TRANSITION ============================ */

export function PageTransition({ active }: VignetteProps) {
  const [page, setPage] = useState<0 | 1>(0);
  const [tick, setTick] = useState<number | null>(null); // null = idle

  useEffect(() => {
    if (tick === null || !active) return;
    if (reducedMotion()) {
      setTick(null);
      setPage((p) => (p === 0 ? 1 : 0));
      return;
    }
    const id = window.setInterval(() => setTick((t) => (t === null ? null : t + 1)), 120);
    return () => window.clearInterval(id);
  }, [tick, active]);

  useEffect(() => {
    if (tick !== null && tick > 7) {
      setTick(null); // reveal the next page after two negative snaps
      setPage((p) => (p === 0 ? 1 : 0));
    }
  }, [tick]);

  // Inversion Pulse pattern [3,1]: negative 3 ticks, normal 1 — run twice, then reveal.
  const flip = tick !== null && (tick < 3 || (tick >= 4 && tick < 7));

  return (
    <div data-invert="" className="w-full max-w-md border border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="flex h-9 items-center justify-between border-b border-hexl-fg px-3">
        <span className="font-mono text-mono-micro uppercase">ROUTE — /states/{page === 0 ? '26' : '42'}</span>
        <InvButton onClick={() => tick === null && setTick(0)} ariaLabel="Navigate to the next page">
          NAVIGATE
        </InvButton>
      </div>
      <div className="relative p-6" style={flip ? { filter: 'invert(1)' } : undefined}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-mono-label uppercase">{page === 0 ? 'PAGE A' : 'PAGE B'} — ARRIVED VIA HARD CUT</div>
            <div className="mt-2 font-mono text-mono-micro uppercase tabular-nums">
              STATE {page === 0 ? '26' : '42'} · {page === 0 ? '011010' : '101010'}
            </div>
          </div>
          <HexGlyph value={page === 0 ? 26 : 42} size={48} aria-hidden="true" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-hexl-fg pt-3">
          <span className="font-mono text-mono-micro uppercase opacity-[0.55]">a page turn with no easing curve in sight</span>
          <span aria-hidden="true">
            {active ? (
              <InversionPulse mode="colorspace" pattern={[3, 1]} interval={120} value={42} size={24} />
            ) : (
              <HexGlyph value={42} size={24} />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================ 6 — FORM VALIDATION ============================ */

export function FormValidation({ active }: VignetteProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ ok: boolean; value: number } | null>(null);
  const [strobe, setStrobe] = useState(0); // 0 = idle; 1..6 strobing (3 invert blips)

  useEffect(() => {
    if (strobe === 0 || !active) return;
    if (strobe >= 6) {
      const id = window.setTimeout(() => setStrobe(0), 120);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStrobe((s) => s + 1), 120);
    return () => window.clearTimeout(id);
  }, [strobe, active]);

  const submit = () => {
    const n = Number(text.trim());
    const ok = text.trim() !== '' && Number.isInteger(n) && n >= 0 && n <= 63;
    setResult({ ok, value: ok ? n : 0 });
    if (!ok) setStrobe(reducedMotion() ? 6 : 1); // 3 instant invert blips on the field
  };

  const inverted = strobe % 2 === 1;
  const hex = result?.ok ? HEXAGRAMS[result.value] : null;

  return (
    <div className="w-full max-w-md">
      <div className="flex items-stretch">
        <div className={`flex flex-1 items-stretch border border-hexl-fg${inverted ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg text-hexl-fg'}`}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="ENTER STATE (0–63)"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            inputMode="numeric"
            aria-label="Enter a state from 0 to 63"
            className="h-11 w-full bg-transparent px-3 font-mono text-mono-data placeholder:opacity-[0.55]"
          />
          <span aria-hidden="true" className="flex w-10 items-center justify-center border-l border-hexl-fg">
            {strobe > 0 && active ? (
              <GENERATED_LOADERS.INVERT value={17} size={20} aria-hidden="true" />
            ) : (
              <HexGlyph value={17} size={20} dim={0.15} />
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={submit}
          className="ml-2 border border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
        >
          VALIDATE
        </button>
      </div>
      <div className="mt-3 flex min-h-12 items-center gap-4 border border-hexl-fg px-3 py-2">
        {result === null ? (
          <span className="font-mono text-mono-micro uppercase opacity-[0.55]">AWAITING INPUT — 6 BITS, LSB = BOTTOM LINE</span>
        ) : result.ok && hex ? (
          <>
            <HexGlyph value={hex.value} size={32} aria-hidden="true" />
            <span className="font-mono text-mono-micro uppercase tabular-nums">
              STATE n°{hex.value} · {hex.binary} · KING WEN n°{hex.kingwen}
            </span>
          </>
        ) : (
          <span className="font-mono text-mono-micro uppercase">ERR — NOT A STATE (0–63 INTEGER ONLY)</span>
        )}
      </div>
    </div>
  );
}

/* ============================ 7 — SKELETON LEDGER ============================ */

const SKELETON_TICKS = 15; // 15 × 120ms = 1.8s

export function SkeletonLedger({ active }: VignetteProps) {
  const [tick, setTick] = useState(0);
  const done = tick >= SKELETON_TICKS;

  useEffect(() => {
    if (!active || done) return;
    if (reducedMotion()) {
      setTick(SKELETON_TICKS);
      return;
    }
    const id = window.setInterval(() => setTick((t) => Math.min(SKELETON_TICKS, t + 1)), 120);
    return () => window.clearInterval(id);
  }, [active, done]);

  return (
    <div className="w-full max-w-sm border border-hexl-fg">
      <div className="flex h-9 items-center justify-between border-b border-hexl-fg px-3">
        <span className="font-mono text-mono-micro uppercase">LEDGER — ACCOUNT 042</span>
        <button
          type="button"
          onClick={() => setTick(0)}
          className="border border-hexl-fg px-3 py-1 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg"
        >
          REPLAY
        </button>
      </div>
      <div className="min-h-32">
        {done ? (
          <table className="w-full border-collapse font-mono text-mono-micro uppercase">
            <tbody>
              {[
                ['STATE', 'n°42 · 101010'],
                ['BALANCE', '63 UNITS'],
                ['KING WEN', 'n°63 — AFTER COMPLETION'],
              ].map(([k, v], i) => (
                <tr key={k}>
                  <td className={`border-r border-hexl-fg px-3 py-2${i < 2 ? ' border-b' : ''}`}>{k}</td>
                  <td className={`px-3 py-2 tabular-nums${i < 2 ? ' border-b border-hexl-fg' : ''}`}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-3 py-6">
            {active ? (
              <GENERATED_LOADERS.CASCADE value={2} size={96} aria-hidden="true" />
            ) : (
              <HexGlyph value={2} size={96} aria-hidden="true" />
            )}
            <span className="font-mono text-mono-micro uppercase opacity-[0.55]">LOADING LEDGER…</span>
          </div>
        )}
      </div>
      <div className="border-t border-hexl-fg px-3 py-2 font-mono text-mono-micro uppercase opacity-[0.55]">
        skeletons, but honest about being machinery
      </div>
    </div>
  );
}

/* ============================= 8 — CI STATUS LINE ============================ */

export function CliStatusLine({ active }: VignetteProps) {
  const [tick, setTick] = useState(0); // 0..8 — 8 cells per 120ms
  const done = tick >= 8;

  useEffect(() => {
    if (!active || done) return;
    if (reducedMotion()) {
      setTick(8);
      return;
    }
    const id = window.setInterval(() => setTick((t) => Math.min(8, t + 1)), 120);
    return () => window.clearInterval(id);
  }, [active, done]);

  const filled = Math.min(64, tick * 8);
  const cells = Array.from({ length: 64 }, (_, i) => i < filled);

  return (
    <div data-invert="" className="w-full max-w-md border border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="flex min-h-9 items-center justify-between gap-3 border-b border-hexl-fg px-3 py-2">
        <span className="min-w-0 break-all font-mono text-mono-micro uppercase">CI — REGISTRY INTEGRITY</span>
        <InvButton onClick={() => setTick(0)} ariaLabel="Rerun the integrity check">
          RERUN
        </InvButton>
      </div>
      <div className="p-4 font-mono text-mono-micro uppercase">
        <div>$ npm run check:integrity</div>
        <div className="mt-2 flex items-start gap-3">
          <span className="min-w-0 break-all leading-none tracking-[0.12em]" aria-hidden="true">
            <span className="block">[{cells.slice(0, 32).map((c) => (c ? '■' : '□')).join('')}]</span>
            <span className="mt-1 block">[{cells.slice(32).map((c) => (c ? '■' : '□')).join('')}]</span>
          </span>
          <span aria-hidden="true" className="shrink-0">
            {done || !active ? (
              <HexGlyph value={18} size={20} />
            ) : (
              <GENERATED_LOADERS.COUNT value={18} size={20} aria-hidden="true" />
            )}
          </span>
        </div>
        <div className="mt-2 tabular-nums">
          {done ? '64/64 PRESETS VERIFIED' : `${filled}/64 VERIFYING…`}
        </div>
      </div>
    </div>
  );
}
