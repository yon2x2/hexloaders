/**
 * HEXLOADERS — LoaderLive (loader-detail local)
 * Resolves a preset to the same component its install command delivers.
 */

import type { LoaderMeta } from '@/lib/registry';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';
import { GENERATED_LOADERS } from '@/lib/generated-loaders';

export interface LoaderLiveProps {
  meta: LoaderMeta;
  size: number;
  invert?: boolean;
  showMeta?: boolean;
}

export default function LoaderLive({ meta, size, invert = false, showMeta = false }: LoaderLiveProps) {
  if (meta.slug === 'bit-scanner') {
    return <BitScanner size={size} showMeta={showMeta} invert={invert} aria-hidden="true" />;
  }
  if (meta.slug === 'mutating-matrix') {
    return (
      <span aria-hidden="true" className={invert ? 'hexl-invert' : undefined} style={{ display: 'inline-block' }}>
        <MutatingMatrix cells={9} size={Math.max(8, Math.round(size / 3))} showMeta={showMeta} />
      </span>
    );
  }
  if (meta.slug === 'inversion-pulse') {
    return <InversionPulse size={size} invert={invert} aria-hidden="true" />;
  }
  const GeneratedLoader = GENERATED_LOADERS[meta.mechanic];
  return <GeneratedLoader value={meta.value} size={size} invert={invert} aria-hidden="true" />;
}
