import type { ComponentType, HTMLAttributes } from 'react';
import CascadeLoader from '@/registry/loaders/generated/cascade';
import CountLoader from '@/registry/loaders/generated/count';
import InvertLoader from '@/registry/loaders/generated/invert';
import ScanLoader from '@/registry/loaders/generated/scan';
import SequenceLoader from '@/registry/loaders/generated/sequence';
import ShiftLoader from '@/registry/loaders/generated/shift';
import StackLoader from '@/registry/loaders/generated/stack';
import StrobeLoader from '@/registry/loaders/generated/strobe';
import type { Mechanic } from './registry';

export type GeneratedLoader = ComponentType<
  HTMLAttributes<HTMLDivElement> & {
    value?: number;
    size?: number;
    step?: number;
    invert?: boolean;
  }
>;

/** Runtime component installed by each non-bespoke mechanic registry item. */
export const GENERATED_LOADERS: Record<Mechanic, GeneratedLoader> = {
  SCAN: ScanLoader,
  SEQUENCE: SequenceLoader,
  INVERT: InvertLoader,
  SHIFT: ShiftLoader,
  COUNT: CountLoader,
  STACK: StackLoader,
  CASCADE: CascadeLoader,
  STROBE: StrobeLoader,
};
