/**
 * HEXLOADERS — RelatedRow (loader-detail local)
 * RELATED STATES: the 7 other cells of the same matrix row (same upper
 * trigram) + the bitwise complement state — 8 live mini LoaderCards at 32px,
 * click-through to their pages, hover = instant invert.
 */

import { Link } from 'react-router';
import { byValue } from '@/lib/registry';
import type { LoaderMeta } from '@/lib/registry';
import LoaderLive from './LoaderLive';

export interface RelatedRowProps {
  meta: LoaderMeta;
}

export default function RelatedRow({ meta }: RelatedRowProps) {
  const upper = meta.hexagram.upper;
  const complement = meta.value ^ 63;
  const cells: LoaderMeta[] = [];
  for (let lower = 0; lower < 8; lower++) {
    const v = (upper << 3) | lower;
    if (v !== meta.value) cells.push(byValue(v));
  }
  cells.push(byValue(complement));

  const rowBits = upper.toString(2).padStart(3, '0');

  return (
    <div>
      <div className="grid grid-cols-4 gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-8">
        {cells.map((m) => (
          <Link
            key={m.slug}
            to={`/loaders/${m.slug}`}
            className="hexl-cell relative flex aspect-square items-center justify-center bg-hexl-bg"
            aria-label={`n°${m.value} ${m.name}`}
          >
            <span aria-hidden="true" className="absolute left-1 top-1 font-mono text-mono-micro opacity-[0.55]">
              {String(m.value).padStart(2, '0')}
            </span>
            {m.value === complement && (
              <span aria-hidden="true" className="absolute right-1 top-1 font-mono text-mono-micro">
                ¬63
              </span>
            )}
            <LoaderLive meta={m} size={32} />
          </Link>
        ))}
      </div>
      <p className="mt-2 font-mono text-mono-micro uppercase opacity-[0.55]">
        SAME UPPER TRIGRAM · ROW {rowBits} · + BITWISE COMPLEMENT n°{complement}
      </p>
    </div>
  );
}
