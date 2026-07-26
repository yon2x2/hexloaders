/**
 * HEXLOADERS — scan (generated mechanic template)
 * mechanic: SCAN
 * serves states 07 09 15 23 31 39 47 55 (+ 01 via the bespoke flagship bit-scanner)
 * registry: pending
 *
 * The active row crosses the hexagram top→bottom in six discrete steps;
 * every row snaps from dim to full for exactly one step, then back.
 * Cycle: 6 sweep steps + 2 hold steps = 8 × var(--hexl-step) = 960ms @ 120ms.
 *
 * Parameterized — one file serves 8 states.
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface ScanLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63. LSB = bottom line. */
  value: number;
  /** Glyph width in px. Default 96. */
  size?: number;
  /** Base clock in ms. Default 120. */
  step?: number;
  /** Swap the module into inverted space. */
  invert?: boolean;
  className?: string;
}

const CSS = `
.hexl-g-scan {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-scan-stage { position: relative; margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-scan-stage > svg { display: block; }
.hexl-g-layer { position: absolute; inset: 0; display: block; }
.hexl-g-layer > svg { display: block; }
`;

/* Glyph geometry: 64×68 units — row r (0 = bottom) spans y 60−12r … 68−12r. */
const H_OVER_W = 68 / 64;

/** clip-path inset() isolating glyph row `r` (bit index, 0 = bottom). */
function rowClip(r: number): string {
  const top = ((60 - 12 * r) / 68) * 100;
  const bottom = ((12 * r) / 68) * 100;
  return `inset(${top}% 0% ${bottom}% 0%)`;
}

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ScanLoader({
  value,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: ScanLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);
  const safeStep = Math.max(120, step);

  useEffect(() => {
    if (still) return; // reduced motion: static glyph
    const id = window.setInterval(() => setTick((t) => t + 1), safeStep);
    return () => window.clearInterval(id);
  }, [safeStep, still]);

  const v = value & 63;
  const frame = tick % 8; // 0–5 sweep (top→bottom) · 6–7 hold · instant reset
  const active = !still && frame < 6 ? 5 - frame : -1;

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${safeStep}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-scan${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-scan-stage" style={{ width: size, height: size * H_OVER_W }}>
        <HexGlyph value={v} size={size} dim={still ? 1 : 0.15} />
        {active >= 0 && (
          <span className="hexl-g-layer" style={{ clipPath: rowClip(active) }} aria-hidden="true">
            <HexGlyph value={v} size={size} />
          </span>
        )}
      </div>
    </div>
  );
}
