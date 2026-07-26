/**
 * HEXLOADERS — invert (generated mechanic template)
 * mechanic: INVERT
 * serves states 17 25 33 41 48 49 56 (+ 40 via the bespoke flagship inversion-pulse)
 * registry: pending
 *
 * Periodic bitwise complement: every clock tick all six lines negate —
 * Yang⇄Yin, a hard 0ms cut, no transition anywhere. A two-segment beat bar
 * under the glyph tallies the NORMAL / COMPLEMENT phases.
 * Cycle: 2 ticks × var(--hexl-step) = 240ms @ 120ms.
 *
 * Parameterized — one file serves 8 states.
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import HexGlyph from '../hex-glyph';

export interface InvertLoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63. Alternating values (e.g. 42 · 101010) read best. */
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
.hexl-g-not, .hexl-g-not * { transition: none !important; }
.hexl-g-not {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-g-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-g-not-stage { margin: calc(var(--hexl-gap, 4px) * 3); }
.hexl-g-not-stage > svg { display: block; }
.hexl-g-bar { display: flex; border-top: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg { flex: 1 1 0%; height: 8px; background: transparent; }
.hexl-g-seg + .hexl-g-seg { border-left: 1px solid var(--hexl-fg, #000000); }
.hexl-g-seg-on { background: var(--hexl-fg, #000000); }
`;

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function InvertLoader({
  value,
  size = 96,
  step = 120,
  invert = false,
  className,
  style,
  ...rest
}: InvertLoaderProps) {
  const [still] = useState(reducedMotion);
  const [tick, setTick] = useState(0);
  const safeStep = Math.max(120, step);

  useEffect(() => {
    if (still) return; // reduced motion: static glyph, beat bar full
    const id = window.setInterval(() => setTick((t) => t + 1), safeStep);
    return () => window.clearInterval(id);
  }, [safeStep, still]);

  const v = value & 63;
  const phase = tick % 2; // 0 = NORMAL · 1 = COMPLEMENT
  const shown = still || phase === 0 ? v : v ^ 63;

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${safeStep}ms`,
    ...style,
  };

  return (
    <div
      className={`hexl-g-not${invert ? ' hexl-g-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-g-not-stage">
        <HexGlyph value={shown} size={size} />
      </div>
      <div className="hexl-g-bar" aria-hidden="true">
        {[0, 1].map((j) => (
          <span key={j} className={`hexl-g-seg${still || j <= phase ? ' hexl-g-seg-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
