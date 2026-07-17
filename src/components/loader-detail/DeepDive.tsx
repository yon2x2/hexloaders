/**
 * HEXLOADERS — DeepDive (loader-detail local)
 * Flagship-only MECHANIC section: cycle diagrams (frame-by-frame ledger
 * strips), rhythm patterns, and the reduced-motion frame — all drawn live
 * from the glyph primitive, pure #000/#FFF, mechanical only.
 */

import type { ReactNode } from 'react';
import HexGlyph from '@/registry/loaders/hex-glyph';

/* Glyph geometry: 64×68 units — row r (0 = bottom) spans y 60−12r … 68−12r. */
const rowClip = (r: number): string =>
  `inset(${((60 - 12 * r) / 68) * 100}% 0% ${(12 * r / 68) * 100}% 0%)`;

function SubLabel({ children }: { children: ReactNode }) {
  return <div className="mb-3 font-mono text-mono-label uppercase opacity-[0.45]">{children}</div>;
}

function RhythmRow({ children }: { children: ReactNode }) {
  return (
    <div className="border border-hexl-fg px-3 py-2 font-mono text-mono-data">{children}</div>
  );
}

function ReducedFrame({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div>
      <div className="flex h-32 items-center justify-center border border-hexl-fg">{children}</div>
      <p className="mt-2 font-mono text-mono-micro uppercase opacity-[0.45]">
        prefers-reduced-motion — {caption}
      </p>
    </div>
  );
}

/* ------------------------------- bit-scanner ------------------------------ */

function ScanFrame({ active, scanline }: { active: number; scanline: 'row' | 'top' | 'none' }) {
  const size = 32;
  const scanY = scanline === 'top' ? 0 : active >= 0 ? ((60 - 12 * active) / 64) * size : -1;
  return (
    <span style={{ position: 'relative', display: 'block', width: size, height: (size * 68) / 64 }}>
      <HexGlyph value={26} size={size} dim={0.15} />
      {active >= 0 && (
        <span style={{ position: 'absolute', inset: 0, display: 'block', clipPath: rowClip(active) }} aria-hidden="true">
          <HexGlyph value={26} size={size} />
        </span>
      )}
      {scanline !== 'none' && scanY >= 0 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'var(--hexl-fg, #000000)',
            transform: `translateY(${scanY}px)`,
          }}
        />
      )}
    </span>
  );
}

function BitScannerDeepDive() {
  const frames = [
    ...[0, 1, 2, 3, 4, 5].map((k) => ({
      label: `T${k} · R${5 - k}`,
      node: <ScanFrame active={5 - k} scanline="row" />,
    })),
    { label: 'T6 · HOLD', node: <ScanFrame active={-1} scanline="none" /> },
    { label: 'T7 · RESET', node: <ScanFrame active={-1} scanline="top" /> },
  ];
  return (
    <div className="space-y-8">
      <div>
        <SubLabel>{'// CYCLE DIAGRAM — 8 TICKS'}</SubLabel>
        <div className="grid grid-cols-4 gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-8">
          {frames.map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2 bg-hexl-bg px-1 py-3">
              {f.node}
              <span className="font-mono text-mono-micro uppercase">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>{'// RHYTHM'}</SubLabel>
        <RhythmRow>6 × 120MS SWEEP + 240MS HOLD + 0MS RESET → 960MS CYCLE · steps(6,end)</RhythmRow>
      </div>
      <div>
        <SubLabel>{'// REDUCED-MOTION FRAME'}</SubLabel>
        <ReducedFrame caption="static glyph, scanline parked at row 0, all lines full opacity.">
          <span style={{ position: 'relative', display: 'block' }}>
            <HexGlyph value={26} size={48} dim={1} />
            <span
              aria-hidden="true"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'var(--hexl-fg, #000000)' }}
            />
          </span>
        </ReducedFrame>
      </div>
    </div>
  );
}

/* ----------------------------- mutating-matrix ---------------------------- */

function MutatingMatrixDeepDive() {
  return (
    <div className="space-y-8">
      <div>
        <SubLabel>{'// OFFSET DIAGRAM — CELL k RENDERS SEQUENCE[i + k] (COUNT MODE, i = 0)'}</SubLabel>
        <div className="grid max-w-[360px] grid-cols-3 gap-px border border-hexl-fg bg-hexl-fg">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
            <div key={k} className="flex flex-col items-center gap-2 bg-hexl-bg px-1 py-3">
              <HexGlyph value={k} size={24} dim={1} />
              <span className="font-mono text-mono-micro uppercase">+{k}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-mono-micro uppercase opacity-[0.45]">
          EVERY CELL SHARES THE CLOCK; THE INDEX OFFSET DRAWS A DIAGONAL WAVE OF CONFIGURATIONS.
        </p>
      </div>
      <div>
        <SubLabel>{'// SEQUENCE MODES'}</SubLabel>
        <div className="border border-hexl-fg font-mono text-mono-data">
          {[
            ['COUNT', '0 → 63 · +1 PER TICK · DEFAULT'],
            ['KINGWEN', 'THE HISTORICAL PERMUTATION · 64-ENTRY LOOKUP TABLE'],
            ['RANDOM', 'SEEDED PRNG (mulberry32) · DETERMINISTIC'],
            ['CUSTOM', 'USER number[] · mode="custom"'],
          ].map(([m, d]) => (
            <div
              key={m}
              className="grid grid-cols-[1fr_2fr] border-b border-hexl-fg last:border-b-0 hover:bg-hexl-fg hover:text-hexl-bg"
            >
              <div className="px-3 py-2 font-bold">{m}</div>
              <div className="border-l border-hexl-fg px-3 py-2">{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>{'// RHYTHM'}</SubLabel>
        <RhythmRow>64 STATES × 120MS INTERVAL = 7680MS LOOP · setInterval INDEX STATE · HARD steps(1) CUT PER ADVANCE</RhythmRow>
      </div>
      <div>
        <SubLabel>{'// REDUCED-MOTION FRAME'}</SubLabel>
        <ReducedFrame caption="renders state 0 (or first custom state) statically.">
          <HexGlyph value={0} size={48} dim={1} />
        </ReducedFrame>
      </div>
    </div>
  );
}

/* ----------------------------- inversion-pulse ---------------------------- */

const PATTERN = [7, 1, 7, 1, 3, 3];

function InversionPulseDeepDive() {
  const ticks: boolean[] = [];
  PATTERN.forEach((len, phase) => {
    for (let i = 0; i < len; i++) ticks.push(phase % 2 === 0);
  });
  return (
    <div className="space-y-8">
      <div>
        <SubLabel>{'// RHYTHM PATTERN — [7,1,7,1,3,3] = 22 TICKS'}</SubLabel>
        <div
          className="grid gap-px border border-hexl-fg bg-hexl-fg"
          style={{ gridTemplateColumns: 'repeat(22, minmax(0, 1fr))' }}
        >
          {ticks.map((on, i) => (
            <div key={i} className={`h-5 ${on ? 'bg-hexl-fg' : 'bg-hexl-bg'}`} aria-hidden="true" />
          ))}
        </div>
        <div
          className="grid gap-px border-x border-b border-hexl-fg bg-hexl-fg"
          style={{ gridTemplateColumns: 'repeat(22, minmax(0, 1fr))' }}
        >
          {PATTERN.map((len, phase) => (
            <div
              key={phase}
              style={{ gridColumn: `span ${len} / span ${len}` }}
              className="bg-hexl-bg px-1 py-1 text-center font-mono text-mono-micro uppercase"
            >
              {len} {phase % 2 === 0 ? 'ON' : 'OFF'}
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>{'// MODES — WHAT GETS NEGATED'}</SubLabel>
        <div className="border border-hexl-fg font-mono text-mono-data">
          {[
            ['COLORSPACE', 'filter: invert(1) ON THE MODULE ROOT · BITS UNCHANGED'],
            ['BITWISE', 'value ^ 63 EVERY ACTIVE PHASE · COLORS UNCHANGED'],
            ['BOTH', 'ALTERNATES COLORSPACE / BITWISE PER ACTIVE PHASE · DEFAULT'],
          ].map(([m, d]) => (
            <div
              key={m}
              className="grid grid-cols-[1fr_2.4fr] border-b border-hexl-fg last:border-b-0 hover:bg-hexl-fg hover:text-hexl-bg"
            >
              <div className="px-3 py-2 font-bold">{m}</div>
              <div className="border-l border-hexl-fg px-3 py-2">{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>{'// RHYTHM'}</SubLabel>
        <RhythmRow>PATTERN [7,1,7,1,3,3] = 22 × 120MS = 2640MS LOOP · transition: none !important INSIDE THE MODULE</RhythmRow>
      </div>
      <div>
        <SubLabel>{'// REDUCED-MOTION FRAME'}</SubLabel>
        <ReducedFrame caption="static glyph in normal color space, progress bar full.">
          <span style={{ display: 'block' }}>
            <HexGlyph value={42} size={48} dim={1} />
            <span className="mt-2 block h-2 border border-hexl-fg bg-hexl-fg" aria-hidden="true" />
          </span>
        </ReducedFrame>
      </div>
    </div>
  );
}

/* --------------------------------- switch --------------------------------- */

export default function DeepDive({ slug }: { slug: string }) {
  if (slug === 'bit-scanner') return <BitScannerDeepDive />;
  if (slug === 'mutating-matrix') return <MutatingMatrixDeepDive />;
  if (slug === 'inversion-pulse') return <InversionPulseDeepDive />;
  return null;
}
