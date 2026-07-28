/**
 * HEXLOADERS — strobe-loader
 * mechanic: STROBE
 * Binary blink: the register strobes around its resting value in hard 0/1
 * beats — REST → full flash (STATE 63 · 111111) → REST → empty flash
 * (STATE 0 · 000000). No fades; every beat is a hard cut.
 * A four-segment beat bar under the glyph tallies the pattern. Each beat
 * holds for two clock ticks to remain below three flashes per second.
 * Cycle: 8 ticks × var(--hexl-step) = 960ms @ 120ms.
 *
 * No extra packages beyond React. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface StrobeLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63 — the resting value between flashes. */
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

export default function StrobeLoader({
  value = 0,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: StrobeLoaderProps) {
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
    if (reduce) return; // reduced motion: static resting value, beat bar full
    const id = window.setInterval(() => setTick((t) => t + 1), safeStep);
    return () => window.clearInterval(id);
  }, [safeStep]);

  const v = value & 63;
  const beat = Math.floor(tick / 2) % 4; // each visual beat holds two clock ticks
  const shown = still || beat % 2 === 0 ? v : beat === 1 ? 63 : 0;

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${safeStep}ms`,
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
        <HexGlyph value={shown} size={size} aria-hidden="true" />
      </div>
      <div className="hexl-g-bar" aria-hidden="true">
        {[0, 1, 2, 3].map((j) => (
          <span key={j} className={`hexl-g-seg${still || j <= beat ? ' hexl-g-seg-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
