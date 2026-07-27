/**
 * HEXLOADERS — count (generated mechanic template)
 * mechanic: COUNT
 * serves states 18 26 34 42 45 50 57 59
 * Binary counting: the state increments by one per clock tick —
 * (value + tick) mod 64 — rolling over at 64 like a six-bit odometer.
 * Every carry is a hard cut; the rail prints the live state and binary.
 * Cycle: 64 ticks × var(--hexl-step) = 7680ms @ 120ms.
 *
 * Parameterized — one template serves 8 states.
 * Zero dependencies beyond React and the shared hex-glyph primitive. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface CountLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63 — the count starts here. LSB = bottom line. */
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
.hexl-g-cnt {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-cnt-stage { margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-cnt-stage > svg { display: block; }
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

export default function CountLoader({
  value = 18,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: CountLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);
  const safeStep = Math.max(120, step);

  useEffect(() => {
    if (still) return; // reduced motion: static starting state
    const id = window.setInterval(() => setTick((t) => t + 1), safeStep);
    return () => window.clearInterval(id);
  }, [safeStep, still]);

  const v = value & 63;
  const shown = still ? v : (v + tick) & 63;
  const binary = [5, 4, 3, 2, 1, 0].map((b) => (shown >> b) & 1).join('');

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${safeStep}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-cnt${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-cnt-stage">
        <HexGlyph value={shown} size={size} />
      </div>
      <div className="hexl-g-rail" aria-hidden="true">
        <span>n°{shown}</span>
        <span>{binary}</span>
      </div>
    </div>
  );
}
