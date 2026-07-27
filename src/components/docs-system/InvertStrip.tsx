/**
 * HEXLOADERS — docs-system inversion demo strip (usage.md §Theme & invert).
 * Three inline mini-loaders (Bit-Scanner / Mutating Matrix / Inversion Pulse
 * at 48px) in small ledger cells. The INVERT THIS ROW toggle flips
 * data-invert on the strip — an instant 0ms snap, no transition. The toggle
 * snap is the demo.
 */

import { useState } from 'react';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';

const CELLS = [
  { label: 'BIT-SCANNER', node: <BitScanner size={48} showMeta={false} /> },
  { label: 'MUTATING MATRIX', node: <MutatingMatrix cells={1} size={48} showMeta={false} /> },
  { label: 'INVERSION PULSE', node: <InversionPulse size={48} /> },
];

export default function InvertStrip() {
  const [invert, setInvert] = useState(false);

  return (
    <div className="border border-hexl-fg">
      <div className="flex h-10 items-stretch justify-between border-b border-hexl-fg">
        <span className="flex items-center px-3 font-mono text-mono-micro uppercase">
          LIVE — THREE LOADERS AT 48PX
        </span>
        <button
          type="button"
          onClick={() => setInvert(!invert)}
          aria-pressed={invert}
          className={`border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg${
            invert ? ' bg-hexl-fg text-hexl-bg' : ''
          }`}
        >
          INVERT THIS ROW
        </button>
      </div>
      {/* data-invert swaps --hexl-bg/--hexl-fg instantly — inversion is free. */}
      <div data-invert={invert ? '' : undefined} className="grid grid-cols-3 bg-hexl-bg text-hexl-fg">
        {CELLS.map((c, i) => (
          <div
            key={c.label}
            className={`flex flex-col items-center gap-3 p-4${i < CELLS.length - 1 ? ' border-r border-hexl-fg' : ''}`}
          >
            {c.node}
            <span className="font-mono text-mono-micro uppercase">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
