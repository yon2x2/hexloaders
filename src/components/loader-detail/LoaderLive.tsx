/**
 * HEXLOADERS — LoaderLive (loader-detail local)
 * Resolves a registry entry to its live renderer: the bespoke flagship
 * component for the 3 flagships, MechanicCell (site-internal) for the other
 * 61 — always running, never a screenshot.
 */

import type { LoaderMeta } from '@/lib/registry';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';
import MechanicCell from '@/components/loaders/MechanicCell';

export interface LoaderLiveProps {
  meta: LoaderMeta;
  size: number;
  invert?: boolean;
  showMeta?: boolean;
}

export default function LoaderLive({ meta, size, invert = false, showMeta = false }: LoaderLiveProps) {
  if (meta.slug === 'bit-scanner') {
    return <BitScanner size={size} showMeta={showMeta} invert={invert} />;
  }
  if (meta.slug === 'mutating-matrix') {
    return (
      <span className={invert ? 'hexl-invert' : undefined} style={{ display: 'inline-block' }}>
        <MutatingMatrix cells={9} size={Math.max(8, Math.round(size / 3))} showMeta={showMeta} />
      </span>
    );
  }
  if (meta.slug === 'inversion-pulse') {
    return <InversionPulse size={size} invert={invert} />;
  }
  return <MechanicCell value={meta.value} mechanic={meta.mechanic} size={size} invert={invert} />;
}
