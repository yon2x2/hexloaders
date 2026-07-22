/**
 * HEXLOADERS — strobe (generated mechanic template)
 * mechanic: STROBE
 * serves states 00 05 08 12 16 21 24 32
 * registry: pending
 *
 * Binary blink: the register strobes around its resting value in hard 0/1
 * beats — REST → full flash (STATE 63 · 111111) → REST → empty flash
 * (STATE 0 · 000000). No fades; every beat is a hard cut.
 * A four-segment beat bar under the glyph tallies the pattern.
 * Cycle: 4 ticks × var(--hexl-step) = 480ms @ 120ms.
 *
 * Parameterized — one file serves 8 states.
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface StrobeLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63 — the resting value between flashes. */
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
.hexl-g-stb, .hexl-g-stb * { transition: none !important; }
.hexl-g-stb {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-stb-stage { margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-stb-stage > svg { display: block; }
.hexl-g-bar { display: flex; border-top: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg { flex: 1 1 0%; height: 8px; background: transparent; }
.hexl-g-seg + .hexl-g-seg { border-left: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg-on { background: var(--hexl-fg, #000000); }
`;

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function StrobeLoader({
  value,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: StrobeLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (still) return; // reduced motion: static resting value, beat bar full
    const id = window.setInterval(() => setTick((t) => t + 1), step);
    return () => window.clearInterval(id);
  }, [step, still]);

  const v = value & 63;
  const beat = tick % 4; // 0 REST · 1 full 63 · 2 REST · 3 empty 0
  const shown = still || beat % 2 === 0 ? v : beat === 1 ? 63 : 0;

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${step}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-stb${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-stb-stage">
        <HexGlyph value={shown} size={size} />
      </div>
      <div className="hexl-g-bar" aria-hidden="true">
        {[0, 1, 2, 3].map((j) => (
          <span key={j} className={`hexl-g-seg${still || j <= beat ? ' hexl-g-seg-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
