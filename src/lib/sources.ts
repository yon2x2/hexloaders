/**
 * HEXLOADERS — sources.ts
 * Aggregates raw loader sources via Vite `?raw` imports (always in sync, never
 * duplicated), the distributable CSS token block, and a registry-entry JSON
 * builder for the copy-paste UX. Page agents import from here.
 */

import hexGlyphSource from '@/registry/loaders/hex-glyph.tsx?raw';
import bitScannerSource from '@/registry/loaders/bit-scanner.tsx?raw';
import mutatingMatrixSource from '@/registry/loaders/mutating-matrix.tsx?raw';
import inversionPulseSource from '@/registry/loaders/inversion-pulse.tsx?raw';
import scanSource from '@/registry/loaders/generated/scan.tsx?raw';
import sequenceSource from '@/registry/loaders/generated/sequence.tsx?raw';
import invertSource from '@/registry/loaders/generated/invert.tsx?raw';
import shiftSource from '@/registry/loaders/generated/shift.tsx?raw';
import countSource from '@/registry/loaders/generated/count.tsx?raw';
import stackSource from '@/registry/loaders/generated/stack.tsx?raw';
import cascadeSource from '@/registry/loaders/generated/cascade.tsx?raw';
import strobeSource from '@/registry/loaders/generated/strobe.tsx?raw';
import { bySlug } from './registry';
import type { Mechanic } from './registry';

/** globals.css — required block (design.md §9), shipped via registry cssVars. */
export const CSS_TOKENS_BLOCK = `/* globals.css — required block */
:root {
  --hexl-bg: #FFFFFF;
  --hexl-fg: #000000;
  --hexl-dim: 0.15;
  --hexl-mid: 0.45;
  --hexl-step: 120ms;      /* base clock */
  --hexl-scale: 1;         /* global loader scale */
  --hexl-line-h: 8px;
  --hexl-gap: 4px;
}
[data-invert], .hexl-invert { --hexl-bg: #000000; --hexl-fg: #FFFFFF; }
@media (prefers-reduced-motion: reduce) { :root { --hexl-step: 0ms; } }`;

/** Raw single-file sources, keyed by slug. Flagships + shared primitive only. */
export const LOADER_SOURCES: Record<string, string> = {
  'hex-glyph': hexGlyphSource,
  'bit-scanner': bitScannerSource,
  'mutating-matrix': mutatingMatrixSource,
  'inversion-pulse': inversionPulseSource,
};

/** Raw source for a slug, if the loader ships as a distributable file. */
export const sourceFor = (slug: string): string | undefined => LOADER_SOURCES[slug];

/**
 * Raw sources of the 8 generated mechanic templates
 * (src/registry/loaders/generated/*). Each parameterized file serves the 8
 * states of its mechanic (7 where the 8th is a bespoke flagship).
 */
export const GENERATED_SOURCES: Record<Mechanic, string> = {
  SCAN: scanSource,
  SEQUENCE: sequenceSource,
  INVERT: invertSource,
  SHIFT: shiftSource,
  COUNT: countSource,
  STACK: stackSource,
  CASCADE: cascadeSource,
  STROBE: strobeSource,
};

/** One distributable file of a loader package: registry path + raw source. */
export interface LoaderFile {
  path: string;
  source: string;
}

/**
 * The genuine copy-pasteable file set for a loader page: the bespoke single
 * file for the 3 flagships; [mechanic template + hex-glyph primitive] for
 * the other 61 (registry entries list both files).
 */
export function loaderFilesFor(slug: string): LoaderFile[] {
  const meta = bySlug(slug);
  if (!meta) throw new Error(`Unknown loader slug: ${slug}`);
  if (meta.flagship) {
    return [{ path: `loaders/${meta.slug}.tsx`, source: LOADER_SOURCES[meta.slug] }];
  }
  return [
    { path: `loaders/${meta.slug}.tsx`, source: GENERATED_SOURCES[meta.mechanic] },
    { path: 'loaders/hex-glyph.tsx', source: hexGlyphSource },
  ];
}

/** registry/index.json entry for a slug, as a formatted JSON string. */
export function registryEntryFor(slug: string): string {
  const meta = bySlug(slug);
  if (!meta) throw new Error(`Unknown loader slug: ${slug}`);
  const entry = {
    slug: meta.slug,
    name: meta.name,
    state: meta.value,
    binary: meta.binary,
    mechanic: meta.mechanic,
    family: { upper: meta.hexagram.upper, lower: meta.hexagram.lower },
    registry: meta.registry,
    files: meta.flagship
      ? [`loaders/${meta.slug}.tsx`]
      : [`loaders/${meta.slug}.tsx`, 'loaders/hex-glyph.tsx'],
    dependencies: [],
    cssVars: ['--hexl-fg', '--hexl-bg', '--hexl-step', '--hexl-dim'],
  };
  return JSON.stringify(entry, null, 2);
}
