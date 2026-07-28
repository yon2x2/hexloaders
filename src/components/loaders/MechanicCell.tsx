/**
 * HEXLOADERS — MechanicCell (site-internal)
 * Generic live cell for the 61 non-flagship matrix entries: given value +
 * mechanic, renders one of 8 distinct stepped mechanical animations composed
 * from glyph primitives. CSS/SVG only, zero libraries, hard cuts everywhere.
 */

import { memo, useEffect, useState } from 'react';
import { KING_WEN, kingwenOf } from '@/lib/hexagrams';
import type { Mechanic } from '@/lib/registry';

export interface MechanicCellProps {
  value: number; // 0–63
  mechanic: Mechanic;
  size?: number; // glyph width px (default 56)
  invert?: boolean;
  /** false freezes the cell on its current frame (offscreen / filtered out). */
  active?: boolean;
  className?: string;
}

const W = 64;
const LINE_H = W / 8;
const GAP = W / 16;
const H = 6 * LINE_H + 5 * GAP;
const DIM = 0.15;
const MID = 0.45;

const rowY = (i: number) => H - (i + 1) * LINE_H - i * GAP;

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CLOCK: Record<Mechanic, number> = {
  SCAN: 120,
  SEQUENCE: 120,
  INVERT: 240,
  SHIFT: 120,
  COUNT: 120,
  STACK: 120,
  CASCADE: 120,
  STROBE: 120,
};

interface Row {
  bit: number;
  o: number;
  dx: number;
}

function frame(mechanic: Mechanic, value: number, t: number): { v: number; rows: Row[] } {
  let v = value & 63;
  const rows: Row[] = [];
  for (let i = 0; i < 6; i++) rows.push({ bit: i, o: 1, dx: 0 });

  switch (mechanic) {
    case 'SCAN': {
      const active = 5 - (t % 6);
      rows.forEach((r) => (r.o = r.bit === active ? 1 : DIM));
      break;
    }
    case 'SEQUENCE': {
      const kw0 = kingwenOf(v) - 1;
      v = KING_WEN[(kw0 + t) % 64];
      break;
    }
    case 'INVERT': {
      v = t % 2 === 1 ? v ^ 63 : v;
      break;
    }
    case 'SHIFT': {
      rows.forEach((r) => (r.dx = (t + r.bit) % 2 === 0 ? 0 : W / 8));
      break;
    }
    case 'COUNT': {
      v = (v + t) & 63;
      break;
    }
    case 'STACK': {
      const p = t % 14;
      const top = p <= 6 ? p : 13 - p; // build 0→5, hold, tear down
      rows.forEach((r) => (r.o = r.bit <= top ? 1 : DIM));
      break;
    }
    case 'CASCADE': {
      const p = t % 8;
      rows.forEach((r) => {
        r.o = p >= 7 ? DIM : r.bit < p ? 1 : r.bit === p ? MID : DIM;
      });
      break;
    }
    case 'STROBE': {
      const beat = Math.floor(t / 2) % 4;
      v = beat % 2 === 0 ? v : beat === 1 ? 63 : 0;
      break;
    }
  }
  return { v, rows };
}

function MechanicCell({ value, mechanic, size = 56, invert = false, active = true, className }: MechanicCellProps) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!active || reducedMotion()) return;
    const id = window.setInterval(() => setT((x) => x + 1), CLOCK[mechanic]);
    return () => window.clearInterval(id);
  }, [active, mechanic]);

  const { v, rows } = frame(mechanic, value, t);

  return (
    <span
      className={`inline-block${invert ? ' hexl-invert' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
    >
      <svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ display: 'block' }}>
        {rows.map((r) => {
          const bit = (v >> r.bit) & 1;
          const y = rowY(r.bit);
          const half = (W - GAP) / 2;
          return bit === 1 ? (
            <rect key={r.bit} x={r.dx} y={y} width={W} height={LINE_H} fill="var(--hexl-fg, #000000)" opacity={r.o} />
          ) : (
            <g key={r.bit} opacity={r.o}>
              <rect x={r.dx} y={y} width={half} height={LINE_H} fill="var(--hexl-fg, #000000)" />
              <rect x={r.dx + half + GAP} y={y} width={half} height={LINE_H} fill="var(--hexl-fg, #000000)" />
            </g>
          );
        })}
      </svg>
    </span>
  );
}

export default memo(MechanicCell);
