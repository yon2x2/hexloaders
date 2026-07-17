/**
 * HEXLOADERS — bit-scanner
 * n° 26 · binary 011010 · mechanic: SCAN
 * registry: @hexloaders/bit-scanner
 *
 * A static hexagram inside a technical ledger block. The active row travels
 * top→bottom in 6 discrete steps; each row snaps opacity dim → 1 for exactly
 * one step, then back. Right rail prints metadata.
 *
 * Cycle: 6 steps × var(--hexl-step) = 720ms sweep + 240ms hold + instant reset.
 * Zero dependencies. Single file. MIT License.
 */

import type { CSSProperties, HTMLAttributes } from 'react';

export interface BitScannerProps extends HTMLAttributes<HTMLDivElement> {
  /** 6-bit state 0–63. Default 26 (STATE 26 · 011010). */
  value?: number;
  /** Base clock in ms. Default 120. */
  step?: number;
  /** Glyph width in px. Default 96. */
  size?: number;
  /** Swap the module into inverted space. */
  invert?: boolean;
  /** Show the metadata rail. Default true. */
  showMeta?: boolean;
  className?: string;
}

const CSS = `
.hexl-bs {
  --hexl-bs-cycle: calc(var(--hexl-step, 120ms) * 8);
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--hexl-fg, #000000);
  background: var(--hexl-bg, #FFFFFF);
  color: var(--hexl-fg, #000000);
  font-family: 'Space Mono', 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
}
.hexl-bs-inv { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
.hexl-bs-stage {
  position: relative;
  padding: calc(var(--hexl-gap, 4px) * 4);
}
.hexl-bs svg { display: block; }
.hexl-bs-row {
  opacity: var(--hexl-dim, 0.15);
  animation: hexl-bs-row var(--hexl-bs-cycle) steps(1, end) infinite;
}
.hexl-bs-rail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-left: 1px solid var(--hexl-fg, #000000);
  padding: 8px;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.hexl-bs-tag {
  display: block;
  opacity: var(--hexl-dim, 0.15);
  animation: hexl-bs-row var(--hexl-bs-cycle) steps(1, end) infinite;
}
@keyframes hexl-bs-row {
  0% { opacity: 1; }
  12.5% { opacity: var(--hexl-dim, 0.15); }
  100% { opacity: var(--hexl-dim, 0.15); }
}
@media (prefers-reduced-motion: reduce) {
  .hexl-bs-row, .hexl-bs-tag { animation: none; opacity: 1; }
}
`;

const W = 64;
const LINE_H = W / 8;
const GAP = W / 16;
const H = 6 * LINE_H + 5 * GAP;

export default function BitScanner({
  value = 26,
  step = 120,
  size = 96,
  invert = false,
  showMeta = true,
  className,
  style,
  ...rest
}: BitScannerProps) {
  const v = value & 63;
  const binary = [5, 4, 3, 2, 1, 0].map((i) => (v >> i) & 1).join('');

  const rootStyle: CSSProperties = {
    ['--hexl-step' as string]: `${step}ms`,
    ['--hexl-line-h' as string]: `${size / 8}px`,
    ['--hexl-gap' as string]: `${size / 16}px`,
    ...style,
  };

  return (
    <div
      className={`hexl-bs${invert ? ' hexl-bs-inv' : ''}${className ? ` ${className}` : ''}`}
      style={rootStyle}
      role="status"
      aria-label="Loading"
      {...rest}
    >
      <style>{CSS}</style>
      <div className="hexl-bs-stage">
        <svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => {
            const bit = (v >> i) & 1;
            const y = H - (i + 1) * LINE_H - i * GAP;
            const half = (W - GAP) / 2;
            const delay = `calc(var(--hexl-step, 120ms) * ${-3 - i})`;
            return (
              <g
                key={i}
                className="hexl-bs-row"
                style={{ animationDelay: delay }}
              >
                {bit === 1 ? (
                  <rect x={0} y={y} width={W} height={LINE_H} fill="var(--hexl-fg, #000000)" />
                ) : (
                  <>
                    <rect x={0} y={y} width={half} height={LINE_H} fill="var(--hexl-fg, #000000)" />
                    <rect x={half + GAP} y={y} width={half} height={LINE_H} fill="var(--hexl-fg, #000000)" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {showMeta && (
        <div className="hexl-bs-rail" aria-hidden="true">
          <span>STATE {v}</span>
          <span>{binary}</span>
          <span>
            {[5, 4, 3, 2, 1, 0].map((r) => (
              <span
                key={r}
                className="hexl-bs-tag"
                style={{ animationDelay: `calc(var(--hexl-step, 120ms) * ${-3 - r})` }}
              >
                R{r}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
