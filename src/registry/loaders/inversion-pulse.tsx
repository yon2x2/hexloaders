/**
 * HEXLOADERS — inversion-pulse
 * n° 42 · binary 101010 · mechanic: INVERT
 * registry: @hexloaders/inversion-pulse
 *
 * The module snaps to negative on a stepped rhythm — hard 0ms inversions of the
 * color space (filter: invert(1) on the root). In 'bitwise' mode colors stay
 * but every line flips (Yang⇄Yin: 101010 → 010101). In 'both' they alternate.
 * The rhythm is programmable: pattern = counts of base intervals per phase.
 * A 6-segment progress bar fills one segment per phase, tally-style.
 *
 * Zero dependencies. Single file. MIT License.
 */

import { useEffect, useState } from 'react';
import type { HTMLAttributes } from 'react';

export interface InversionPulseProps extends HTMLAttributes<HTMLDivElement> {
  /** 'colorspace' flips color · 'bitwise' flips bits · 'both' alternates. Default 'both'. */
  mode?: 'colorspace' | 'bitwise' | 'both';
  /** Counts of base intervals per phase. Default [7,1,7,1,3,3]. */
  pattern?: number[];
  /** Base interval in ms. Default 120. */
  interval?: number;
  /** 6-bit state 0–63. Default 42 (STATE 42 · 101010). */
  value?: number;
  /** Glyph width in px. Default 96. */
  size?: number;
  /** Start from inverted space. */
  invert?: boolean;
  className?: string;
}

const CSS = `
.hexl-ip, .hexl-ip * { transition: none !important; }
.hexl-ip {
  display: inline-block;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-ip-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-ip-flip { filter: invert(1); }
.hexl-ip-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--hexl-gap, 4px) * 4);
}
.hexl-ip svg { display: block; }
.hexl-ip-bar {
  display: flex;
  border-top: 1px solid var(--hexl-fg, #000000);
}
.hexl-ip-seg {
  flex: 1 1 0%;
  height: 8px;
  background: transparent;
}
.hexl-ip-seg + .hexl-ip-seg { border-left: 1px solid var(--hexl-fg, #000000); }
.hexl-ip-seg-on { background: var(--hexl-fg, #000000); }
`;

const W = 64;
const LINE_H = W / 8;
const GAP = W / 16;
const H = 6 * LINE_H + 5 * GAP;

const DEFAULT_PATTERN = [7, 1, 7, 1, 3, 3];

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function InversionPulse({
  mode = 'both',
  pattern = DEFAULT_PATTERN,
  interval = 120,
  value = 42,
  size = 96,
  invert = false,
  className,
  style,
  ...rest
}: InversionPulseProps) {
  const [tick, setTick] = useState(0);
  const [still] = useState(reducedMotion);

  useEffect(() => {
    if (still) return; // reduced motion: static glyph, bar full
    const id = window.setInterval(() => setTick((t) => t + 1), interval);
    return () => window.clearInterval(id);
  }, [interval, still]);

  const total = pattern.reduce((a, b) => a + b, 0);
  const t = tick % total;
  let phase = 0;
  let acc = 0;
  for (let p = 0; p < pattern.length; p++) {
    acc += pattern[p];
    if (t < acc) {
      phase = p;
      break;
    }
  }
  const active = phase % 2 === 0; // even phases inverted, odd phases normal
  const activeIndex = Math.floor(phase / 2); // 0,1,2… per active phase

  let flipColor = false;
  let flipBits = false;
  if (!still && active) {
    if (mode === 'colorspace') flipColor = true;
    else if (mode === 'bitwise') flipBits = true;
    else if (activeIndex % 2 === 0) flipColor = true;
    else flipBits = true;
  }

  const v = (flipBits ? value ^ 63 : value) & 63;

  return (
    <div
      className={`hexl-ip${invert ? ' hexl-ip-inv' : ''}${flipColor ? ' hexl-ip-flip' : ''}${className ? ` ${className}` : ''}`}
      style={style}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-ip-stage">
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
      </div>
      <div className="hexl-ip-bar" aria-hidden="true">
        {pattern.map((_, j) => (
          <div key={j} className={`hexl-ip-seg${still || j <= phase ? ' hexl-ip-seg-on' : ''}`} />
        ))}
      </div>
    </div>
  );
}
