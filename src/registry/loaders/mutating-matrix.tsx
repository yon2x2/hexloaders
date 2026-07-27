/**
 * HEXLOADERS — mutating-matrix
 * n° 19 · binary 010011 · mechanic: SEQUENCE
 * A 3×3 bank of hexagram glyphs stepping through a state sequence — a system
 * visibly computing configurations. Every cell advances on the same clock with
 * a hard steps(1) jump; cell k renders sequence[i + k], a diagonal wave.
 * Header readout flips tally-style: STATE n° + 6-bit binary + loop counter.
 *
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

export interface MutatingMatrixProps extends HTMLAttributes<HTMLDivElement> {
  /** Sequence source. Default 'count'. */
  mode?: 'count' | 'kingwen' | 'random' | 'custom';
  /** Custom state sequence (mode = 'custom'). */
  sequence?: number[];
  /** Clock interval in ms. Default 120. */
  interval?: number;
  /** Bank size: 1, 4 or 9 cells. Default 9. */
  cells?: 1 | 4 | 9;
  /** PRNG seed for mode = 'random' (deterministic). */
  seed?: number;
  /** Glyph width per cell in px. Default 32. */
  size?: number;
  /** Show the tally readout header. Default true. */
  showMeta?: boolean;
  className?: string;
}

/** KING_WEN[i] = value of the hexagram at King Wen sequence position i+1. */
const KING_WEN: readonly number[] = [
  63,  0, 17, 34, 23, 58,  2, 16,
  55, 59,  7, 56, 61, 47,  4,  8,
  25, 38,  3, 48, 41, 37, 32,  1,
  57, 39, 33, 30, 18, 45, 28, 14,
  60, 15, 40,  5, 53, 43, 20, 10,
  35, 49, 31, 62, 24,  6, 26, 22,
  29, 46,  9, 36, 52, 11, 13, 44,
  54, 27, 50, 19, 51, 12, 42, 21,
] as const;

/** Deterministic seeded PRNG (mulberry32). */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSequence(mode: string, custom: number[] | undefined, seed: number): number[] {
  if (mode === 'custom' && custom && custom.length > 0) return custom.map((v) => v & 63);
  if (mode === 'kingwen') return [...KING_WEN];
  if (mode === 'random') {
    const rand = mulberry32(seed);
    const arr = Array.from({ length: 64 }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  return Array.from({ length: 64 }, (_, i) => i); // count 0→63
}

const CSS = `
.hexl-mm {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-mm-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--hexl-fg, #000000);
  padding: 8px;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.hexl-mm-grid { display: grid; }
.hexl-mm-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--hexl-gap, 4px) * 2);
}
.hexl-mm svg { display: block; }
`;

const W = 64;
const LINE_H = W / 8;
const GAP = W / 16;
const H = 6 * LINE_H + 5 * GAP;

function Glyph({ value, size }: { value: number; size: number }) {
  const v = value & 63;
  return (
    <svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => {
        const bit = (v >> i) & 1;
        const y = H - (i + 1) * LINE_H - i * GAP;
        const half = (W - GAP) / 2;
        return bit === 1 ? (
          <rect key={i} x={0} y={y} width={W} height={LINE_H} fill="var(--hexl-fg, #000000)" />
        ) : (
          <g key={i}>
            <rect x={0} y={y} width={half} height={LINE_H} fill="var(--hexl-fg, #000000)" />
            <rect x={half + GAP} y={y} width={half} height={LINE_H} fill="var(--hexl-fg, #000000)" />
          </g>
        );
      })}
    </svg>
  );
}

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MutatingMatrix({
  mode = 'count',
  sequence,
  interval = 120,
  cells = 9,
  seed = 1,
  size = 32,
  showMeta = true,
  className,
  style,
  ...rest
}: MutatingMatrixProps) {
  const seq = useMemo(() => buildSequence(mode, sequence, seed), [mode, sequence, seed]);
  const [tick, setTick] = useState(0);
  const safeInterval = Math.max(120, interval);

  useEffect(() => {
    if (reducedMotion()) return; // static first state
    const id = window.setInterval(() => setTick((t) => t + 1), safeInterval);
    return () => window.clearInterval(id);
  }, [safeInterval]);

  const i = tick % seq.length;
  const loop = Math.floor(tick / seq.length);
  const cols = cells === 1 ? 1 : cells === 4 ? 2 : 3;
  const current = seq[i] & 63;
  const binary = [5, 4, 3, 2, 1, 0].map((b) => (current >> b) & 1).join('');

  const rootStyle: CSSProperties = {
    ['--hexl-interval' as string]: `${safeInterval}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-mm${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      {showMeta && (
        <div className="hexl-mm-head" aria-hidden="true">
          <span>
            STATE {current} · {binary}
          </span>
          <span>LOOP {loop}</span>
        </div>
      )}
      <div
        className="hexl-mm-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        aria-hidden="true"
      >
        {Array.from({ length: cells }, (_, k) => (
          <div className="hexl-mm-cell" key={k}>
            <Glyph value={seq[(i + k) % seq.length]} size={size} />
          </div>
        ))}
      </div>
    </div>
  );
}
