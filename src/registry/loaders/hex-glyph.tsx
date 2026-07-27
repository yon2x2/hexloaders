/**
 * HEXLOADERS — hex-glyph
 * n° 00–63 · binary 000000–111111 · mechanic: PRIMITIVE
 * The pure-SVG 6-bit glyph every loader is composed from. Zero dependencies.
 * Sized by CSS custom properties (--hexl-line-h, --hexl-gap) or the `size` prop.
 *
 * MIT License
 */

import { useEffect, useState } from 'react';
import type { CSSProperties, SVGProps } from 'react';

export interface HexGlyphProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /** 6-bit state 0–63. LSB = bottom line. Yang 1 = solid bar, Yin 0 = broken bar. */
  value?: number;
  /** Glyph width in px. Height derives as 17/16 × size (modular grid). */
  size?: number;
  /** Resting opacity of the bars (dim state is opacity on solid ink, never gray). */
  dim?: number;
  /** 'none' static · 'scan' rows light top→bottom · 'cycle' random states. */
  animated?: 'none' | 'scan' | 'cycle';
  /** Base clock in ms for animated modes. Default 120. */
  step?: number;
  className?: string;
  style?: CSSProperties;
}

const W = 64;
const LINE_H = W / 8; // 8
const GAP = W / 16; // 4
const H = 6 * LINE_H + 5 * GAP; // 68

function rowY(bitIndex: number): number {
  // bit 0 = bottom line
  return H - (bitIndex + 1) * LINE_H - bitIndex * GAP;
}

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HexGlyph({
  value = 63,
  size = W,
  dim = 1,
  animated = 'none',
  step = 120,
  className,
  style,
  ...rest
}: HexGlyphProps) {
  const [frame, setFrame] = useState(0);
  const safeStep = Math.max(120, step);

  useEffect(() => {
    if (animated === 'none' || reducedMotion()) return;
    const id = window.setInterval(() => setFrame((f) => f + 1), safeStep);
    return () => window.clearInterval(id);
  }, [animated, safeStep]);

  const shown =
    animated === 'cycle' ? Math.floor(Math.random() * 64) : value & 63;
  const activeRow = animated === 'scan' ? 5 - (frame % 6) : -1;

  const bars: { x: number; y: number; w: number; o: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const bit = (shown >> i) & 1;
    const y = rowY(i);
    const o = animated === 'scan' ? (i === activeRow ? 1 : dim) : dim;
    if (bit === 1) {
      bars.push({ x: 0, y, w: W, o });
    } else {
      const half = (W - GAP) / 2;
      bars.push({ x: 0, y, w: half, o });
      bars.push({ x: half + GAP, y, w: half, o });
    }
  }

  return (
    <svg
      width={size}
      height={(size * H) / W}
      viewBox={`0 0 ${W} ${H}`}
      role={animated === 'none' ? 'img' : 'status'}
      aria-label={animated === 'none' ? `Hexagram state ${shown}` : 'Loading'}
      className={className}
      style={{ display: 'block', ...style }}
      {...rest}
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={LINE_H}
          fill="var(--hexl-fg, #000000)"
          opacity={b.o}
        />
      ))}
    </svg>
  );
}
