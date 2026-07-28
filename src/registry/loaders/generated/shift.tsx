/**
 * HEXLOADERS — shift-loader
 * mechanic: SHIFT
 * Barrel rotation: the 6-bit register rotates left one position per clock
 * tick — bit 5 wraps to bit 0 — a hard cut per frame, like a relay bank
 * stepping. The rail prints the rotation offset and live binary.
 * Cycle: 6 ticks × var(--hexl-step) = 720ms @ 120ms.
 *
 * No extra packages beyond React. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface ShiftLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63. LSB = bottom line. */
  value?: number;
  /** Glyph width in px. Default 96. */
  size?: number;
  /** Base clock in ms. Default 120. */
  step?: number;
  /** Swap the module into inverted space. */
  invert?: boolean;
  className?: string;
}

const CSS = `
.hexl-g-shf {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-shf-stage { margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-shf-stage > svg { display: block; }
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

/** Barrel-rotate a 6-bit register left by k positions (bit 5 wraps to bit 0). */
const rotl6 = (v: number, k: number): number => ((v << k) | (v >> (6 - k))) & 63;

export default function ShiftLoader({
  value = 36,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: ShiftLoaderProps) {
  const [still, setStill] = useState(true);
  const [tick, setTick] = useState(0);
  const safeStep = Number.isFinite(step)
    ? Math.min(2_147_483_647, Math.max(120, Math.floor(step)))
    : 120;

  useEffect(() => {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setStill(reduce);
    if (reduce) return; // reduced motion: static register, offset 0
    const id = window.setInterval(() => setTick((t) => t + 1), safeStep);
    return () => window.clearInterval(id);
  }, [safeStep]);

  const v = value & 63;
  const k = still ? 0 : tick % 6;
  const shown = rotl6(v, k);
  const binary = [5, 4, 3, 2, 1, 0].map((b) => (shown >> b) & 1).join('');

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${safeStep}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-shf${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-shf-stage">
        <HexGlyph value={shown} size={size} aria-hidden="true" />
      </div>
      <div className="hexl-g-rail" aria-hidden="true">
        <span>ROT −{k}</span>
        <span>{binary}</span>
      </div>
    </div>
  );
}
