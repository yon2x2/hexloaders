/**
 * HEXLOADERS — docs-system mechanics taxonomy (architecture.md §Mechanics).
 * Eight ledger rows: mono header + one-line spec + a 32px live micro-demo of
 * the motion on a single glyph (shared MechanicCell). Rows snap-in staggered
 * 60ms; hovering a row freezes its demo on the current frame (instant).
 */

import { useState } from 'react';
import { MECHANICS, LOADERS } from '@/lib/registry';
import type { Mechanic } from '@/lib/registry';
import MechanicCell from '@/components/loaders/MechanicCell';
import { Reveal } from './Reveal';

const SPECS: Record<Mechanic, string> = {
  SCAN: 'A 1px line crosses the glyph in steps(6); crossed lines snap to full opacity.',
  SEQUENCE: 'The glyph steps through a state list every N ms; steps(1) jumps.',
  INVERT: 'Colorspace and/or bitwise negation on a programmable rhythm; 0ms transitions.',
  SHIFT: 'Lines translate/rotate like a register: shift, rotate, barrel, carry.',
  COUNT: 'The glyph counts 0→63 (or Gray code); bits toggle in counting order.',
  STACK: 'Lines build up bottom-to-top and tear down; discrete pile states.',
  CASCADE: 'A state change propagates line-by-line, domino order.',
  STROBE: 'Binary blink patterns: duty cycles, square waves, clock signals.',
};

export default function MechanicRows() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="border border-hexl-fg">
      {MECHANICS.map((m, i) => {
        const rep = LOADERS.find((l) => l.mechanic === m);
        return (
          <Reveal key={m} delay={i * 60}>
            <div
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 p-3 sm:grid-cols-[140px_1fr_auto]${
                i < MECHANICS.length - 1 ? ' border-b border-hexl-fg' : ''
              }`}
            >
              <div className="font-mono text-mono-label uppercase">
                {String(i + 1).padStart(2, '0')} {m}
              </div>
              <p className="col-span-2 text-body-sm sm:col-span-1">{SPECS[m]}</p>
              <div className="col-start-2 row-start-1 flex w-16 items-center justify-center sm:col-start-3">
                <MechanicCell value={rep?.value ?? 0} mechanic={m} size={32} active={hover !== i} />
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
