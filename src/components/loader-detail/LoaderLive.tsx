/**
 * HEXLOADERS — LoaderLive (loader-detail local)
 * Resolves a preset to the same live visual used by its Home matrix card.
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
  compact?: boolean;
}

export default function LoaderLive({ meta, size, invert = false, showMeta = false, compact = false }: LoaderLiveProps) {
  const compactProps = compact ? { 'data-hexl-compact': 'true' } : {};
  if (meta.slug === 'bit-scanner') {
    return <BitScanner key={meta.slug} size={size} showMeta={showMeta} invert={invert} aria-hidden="true" {...compactProps} />;
  }
  if (meta.slug === 'mutating-matrix') {
    return (
      <span aria-hidden="true" className={invert ? 'hexl-invert' : undefined} style={{ display: 'inline-block' }}>
        <MutatingMatrix key={meta.slug} cells={9} size={Math.max(8, Math.round(size / 3))} showMeta={showMeta} {...compactProps} />
      </span>
    );
  }
  if (meta.slug === 'inversion-pulse') {
    return <InversionPulse key={meta.slug} size={size} invert={invert} aria-hidden="true" {...compactProps} />;
  }
  return (
    <MechanicCell
      key={meta.slug}
      value={meta.value}
      mechanic={meta.mechanic}
      size={size}
      invert={invert}
    />
  );
}
