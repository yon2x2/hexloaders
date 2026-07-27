/**
 * HEXLOADERS — registry.ts
 * The 64 loader metadata rows (design.md §7 table, n° = value) + the 8 mechanics.
 * Single source of truth for the matrix, docs sidebar, and routes.
 */

import { HEXAGRAMS } from './hexagrams';
import type { Hexagram } from './hexagrams';

export const MECHANICS = [
  'SCAN',
  'SEQUENCE',
  'INVERT',
  'SHIFT',
  'COUNT',
  'STACK',
  'CASCADE',
  'STROBE',
] as const;

export type Mechanic = (typeof MECHANICS)[number];

export interface LoaderMeta {
  value: number; // registry n° = 6-bit state value (0–63), Fu Xi grid address
  name: string;
  slug: string; // kebab-case
  component: string; // Canonical distributable: flagship slug or <mechanic>-loader.
  mechanic: Mechanic;
  flagship: boolean;
  binary: string; // top→bottom print string of value
  hexagram: Hexagram; // dictionary entry for value
  registry: string | null; // Published GitHub registry address, null while manual-only.
  install: string | null; // Exact public command, null while manual-only.
}

const FLAGSHIP_SLUGS = new Set(['bit-scanner', 'mutating-matrix', 'inversion-pulse']);
const PUBLISHED_REGISTRY_COMPONENTS = new Set(['bit-scanner']);
export const GITHUB_REGISTRY = 'yon2x2/hexloaders';

/** [name, slug, mechanic] in value order 0–63 (row = upper 000→111, col = lower 000→111). */
const TABLE: readonly (readonly [string, string, Mechanic])[] = [
  ['Strobe Stack', 'strobe-stack', 'STROBE'],
  ['Bit-Scanner', 'bit-scanner', 'SCAN'],
  ['Falling Edge', 'falling-edge', 'CASCADE'],
  ['Relay Lines', 'relay-lines', 'CASCADE'],
  ['Ledger Build', 'ledger-build', 'STACK'],
  ['Square Wave', 'square-wave', 'STROBE'],
  ['Step Ladder', 'step-ladder', 'CASCADE'],
  ['Solid Sweep', 'solid-sweep', 'SCAN'],
  ['Blink Register', 'blink-register', 'STROBE'],
  ['Row Sweep', 'row-sweep', 'SCAN'],
  ['Signal Chain', 'signal-chain', 'CASCADE'],
  ['Six Stack', 'six-stack', 'STACK'],
  ['Duty Cycle', 'duty-cycle', 'STROBE'],
  ['Domino Six', 'domino-six', 'CASCADE'],
  ['Line Stacker', 'line-stacker', 'STACK'],
  ['Gate Scan', 'gate-scan', 'SCAN'],
  ['Terminal Bell', 'terminal-bell', 'STROBE'],
  ['Bit Flip', 'bit-flip', 'INVERT'],
  ['Ripple Counter', 'ripple-counter', 'COUNT'],
  ['Mutating Matrix', 'mutating-matrix', 'SEQUENCE'],
  ['Build Order', 'build-order', 'STACK'],
  ['Clock Signal', 'clock-signal', 'STROBE'],
  ['Cascade Row', 'cascade-row', 'CASCADE'],
  ['Line Rake', 'line-rake', 'SCAN'],
  ['Frame Blink', 'frame-blink', 'STROBE'],
  ['Negative Snap', 'negative-snap', 'INVERT'],
  ['Binary Counter', 'binary-counter', 'COUNT'],
  ['Hex Stepper', 'hex-stepper', 'SEQUENCE'],
  ['Collapse Stack', 'collapse-stack', 'STACK'],
  ['Propagate', 'propagate', 'CASCADE'],
  ['Strata', 'strata', 'STACK'],
  ['Axis Scan', 'axis-scan', 'SCAN'],
  ['Alternator', 'alternator', 'STROBE'],
  ['Mirror State', 'mirror-state', 'INVERT'],
  ['Tally Counter', 'tally-counter', 'COUNT'],
  ['State Cycle', 'state-cycle', 'SEQUENCE'],
  ['Shift Register', 'shift-register', 'SHIFT'],
  ['Chain Reaction', 'chain-reaction', 'CASCADE'],
  ['Raise Ledger', 'raise-ledger', 'STACK'],
  ['Scan Register', 'scan-register', 'SCAN'],
  ['Inversion Pulse', 'inversion-pulse', 'INVERT'],
  ['Polarity Clock', 'polarity-clock', 'INVERT'],
  ['Odometer Six', 'odometer-six', 'COUNT'],
  ['Config Runner', 'config-runner', 'SEQUENCE'],
  ['Barrel Shift', 'barrel-shift', 'SHIFT'],
  ['Full Adder', 'full-adder', 'COUNT'],
  ['Column Shift', 'column-shift', 'SHIFT'],
  ['Trace Line', 'trace-line', 'SCAN'],
  ['Inverse Ledger', 'inverse-ledger', 'INVERT'],
  ['Complement Grid', 'complement-grid', 'INVERT'],
  ['Gray Counter', 'gray-counter', 'COUNT'],
  ['Sequence Ledger', 'sequence-ledger', 'SEQUENCE'],
  ['Register Rotate', 'register-rotate', 'SHIFT'],
  ['Carry Chain', 'carry-chain', 'SHIFT'],
  ['Offset Step', 'offset-step', 'SHIFT'],
  ['Rail Pulse', 'rail-pulse', 'SCAN'],
  ['Phase Reverse', 'phase-reverse', 'INVERT'],
  ['Mod Sixty-Four', 'mod-sixty-four', 'COUNT'],
  ['Glyph Iterator', 'glyph-iterator', 'SEQUENCE'],
  ['Count Ledger', 'count-ledger', 'COUNT'],
  ['Line Shifter', 'line-shifter', 'SHIFT'],
  ['Permutation Cell', 'permutation-cell', 'SEQUENCE'],
  ['Tally Shift', 'tally-shift', 'SHIFT'],
  ['Epoch Ticker', 'epoch-ticker', 'SEQUENCE'],
] as const;

export const LOADERS: readonly LoaderMeta[] = TABLE.map(([name, slug, mechanic], value) => {
  const hexagram = HEXAGRAMS[value];
  const flagship = FLAGSHIP_SLUGS.has(slug);
  const component = flagship ? slug : `${mechanic.toLowerCase()}-loader`;
  const registry = PUBLISHED_REGISTRY_COMPONENTS.has(component) ? `${GITHUB_REGISTRY}/${component}` : null;
  return {
    value,
    name,
    slug,
    component,
    mechanic,
    flagship,
    binary: hexagram.binary,
    hexagram,
    registry,
    install: registry ? `npx shadcn@latest add ${registry}` : null,
  };
});

export const bySlug = (slug: string): LoaderMeta | undefined =>
  LOADERS.find((l) => l.slug === slug);

export const byValue = (value: number): LoaderMeta => LOADERS[value & 63];

export const loadersByMechanic = (mechanic: Mechanic): LoaderMeta[] =>
  LOADERS.filter((l) => l.mechanic === mechanic);
