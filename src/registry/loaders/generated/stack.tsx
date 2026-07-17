/**
 * HEXLOADERS — stack (generated mechanic template)
 * mechanic: STACK
 * serves states 04 11 14 20 28 30 38
 * registry: @hexloaders/stack
 *
 * Build-up: lines stack bottom→top one row per clock tick out of the dim
 * field, hold one tick fully built, then reset to dim and start over.
 * A six-segment ledger bar under the glyph fills as the stack rises.
 * Cycle: 6 build steps + 1 hold + 1 reset = 8 × var(--hexl-step) = 960ms @ 120ms.
 *
 * Parameterized — one file serves 8 states.
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface StackLoaderProps extends HTMLAttributes<HTMLDivElement> {
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
.hexl-g-stk {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-stk-stage { position: relative; margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-stk-stage > svg { display: block; }
.hexl-g-layer { position: absolute; inset: 0; display: block; }
.hexl-g-layer > svg { display: block; }
.hexl-g-bar { display: flex; border-top: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg { flex: 1 1 0%; height: 8px; background: transparent; }
.hexl-g-seg + .hexl-g-seg { border-left: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg-on { background: var(--hexl-fg, #000000); }
`;

/* Glyph geometry: 64×68 units — rows 0…top (bottom-up) start at y 60−12·top. */
const H_OVER_W = 68 / 64;

/** clip-path inset() keeping glyph rows 0…top (bit indices, 0 = bottom). */
function stackClip(top: number): string {
  return `inset(${((60 - 12 * top) / 68) * 100}% 0% 0% 0%)`;
}

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function StackLoader({
  value,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: StackLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (still) return; // reduced motion: static fully-built stack
    const id = window.setInterval(() => setTick((t) => t + 1), step);
    return () => window.clearInterval(id);
  }, [step, still]);

  const v = value & 63;
  const frame = tick % 8; // 0–5 build · 6 hold · 7 reset
  const top = still ? 5 : frame <= 5 ? frame : frame === 6 ? 5 : -1;

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${step}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-stk${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-stk-stage" style={{ width: size, height: size * H_OVER_W }}>
        <HexGlyph value={v} size={size} dim={still ? 1 : 0.15} />
        {top >= 0 && (
          <span className="hexl-g-layer" style={{ clipPath: stackClip(top) }} aria-hidden="true">
            <HexGlyph value={v} size={size} />
          </span>
        )}
      </div>
      <div className="hexl-g-bar" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <span key={j} className={`hexl-g-seg${still || j <= top ? ' hexl-g-seg-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
