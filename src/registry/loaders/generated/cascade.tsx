/**
 * HEXLOADERS — cascade (generated mechanic template)
 * mechanic: CASCADE
 * serves states 02 03 06 10 13 22 29 37
 * registry: pending
 *
 * Propagation wave: a front travels bottom→top one row per clock tick —
 * rows behind the front are full, the leading row rides at mid opacity,
 * rows ahead stay dim. The wave arrives, holds one tick, then breaks.
 * Cycle: 6 propagation steps + 1 arrive + 1 break = 8 × var(--hexl-step) = 960ms @ 120ms.
 *
 * Parameterized — one file serves 8 states.
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface CascadeLoaderProps extends HTMLAttributes<HTMLDivElement> {
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
.hexl-g-csc {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-csc-stage { position: relative; margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-csc-stage > svg { display: block; }
.hexl-g-layer { position: absolute; inset: 0; display: block; }
.hexl-g-layer > svg { display: block; }
.hexl-g-bar { display: flex; border-top: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg { flex: 1 1 0%; height: 8px; background: transparent; }
.hexl-g-seg + .hexl-g-seg { border-left: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg-on { background: var(--hexl-fg, #000000); }
`;

/* Glyph geometry: 64×68 units — row r (0 = bottom) spans y 60−12r … 68−12r. */
const H_OVER_W = 68 / 64;

/** clip-path inset() keeping glyph rows lo…hi inclusive (bit indices). */
function rowsClip(lo: number, hi: number): string {
  const top = ((60 - 12 * hi) / 68) * 100;
  const bottom = ((12 * lo) / 68) * 100;
  return `inset(${top}% 0% ${bottom}% 0%)`;
}

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function CascadeLoader({
  value,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: CascadeLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (still) return; // reduced motion: static glyph, wave arrived
    const id = window.setInterval(() => setTick((t) => t + 1), step);
    return () => window.clearInterval(id);
  }, [step, still]);

  const v = value & 63;
  const frame = tick % 8; // 0–5 wave at row p · 6 arrive (all full) · 7 break (all dim)
  const p = frame;

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${step}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-csc${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-csc-stage" style={{ width: size, height: size * H_OVER_W }}>
        <HexGlyph value={v} size={size} dim={still ? 1 : 0.15} />
        {!still && p <= 6 && (
          <span
            className="hexl-g-layer"
            style={{ clipPath: rowsClip(0, Math.min(p, 5)) }}
            aria-hidden="true"
          >
            <HexGlyph value={v} size={size} />
          </span>
        )}
        {!still && p <= 5 && (
          <span
            className="hexl-g-layer"
            style={{ clipPath: rowsClip(p, p), opacity: 'var(--hexl-mid, 0.45)' }}
            aria-hidden="true"
          >
            <HexGlyph value={v} size={size} />
          </span>
        )}
      </div>
      <div className="hexl-g-bar" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <span key={j} className={`hexl-g-seg${still || j < p ? ' hexl-g-seg-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
