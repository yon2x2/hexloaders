/**
 * HEXLOADERS — sequence (generated mechanic template)
 * mechanic: SEQUENCE
 * serves states 27 35 43 51 58 61 63 (+ 19 via the bespoke flagship mutating-matrix)
 * registry: pending
 *
 * King Wen stepping: the glyph starts at the King Wen position of `value` and
 * advances one sequence position per clock tick — a hard steps(1) cut per
 * frame, the historical permutation running as a loader.
 * Cycle: 64 ticks × var(--hexl-step) = 7680ms @ 120ms.
 *
 * Parameterized — one file serves 8 states.
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface SequenceLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63 — the King Wen walk starts at its sequence position. */
  value: number;
  /** Glyph width in px. Default 96. */
  size?: number;
  /** Base clock in ms. Default 120. */
  step?: number;
  /** Swap the module into inverted space. */
  invert?: boolean;
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

const CSS = `
.hexl-g-seq {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-seq-stage { margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-seq-stage > svg { display: block; }
.hexl-g-rail {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--hexl-fg, #000000);
  padding: 6px 8px;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
`;

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function SequenceLoader({
  value,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: SequenceLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);
  const safeStep = Math.max(120, step);

  useEffect(() => {
    if (still) return; // reduced motion: static first state
    const id = window.setInterval(() => setTick((t) => t + 1), safeStep);
    return () => window.clearInterval(id);
  }, [safeStep, still]);

  const v = value & 63;
  const start = Math.max(0, KING_WEN.indexOf(v));
  const pos = (start + tick) % 64;
  const shown = still ? v : KING_WEN[pos];
  const binary = [5, 4, 3, 2, 1, 0].map((b) => (shown >> b) & 1).join('');

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${safeStep}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-seq${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-seq-stage">
        <HexGlyph value={shown} size={size} />
      </div>
      <div className="hexl-g-rail" aria-hidden="true">
        <span>KW n°{pos + 1}</span>
        <span>{binary}</span>
      </div>
    </div>
  );
}
