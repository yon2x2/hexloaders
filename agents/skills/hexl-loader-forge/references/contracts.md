# HEXLOADERS — Component API & Registry Contracts

## Loader component contract

```tsx
export interface LoaderProps {
  value?: number;       // 0–63, LSB = bottom line; every distributable has a
                        // representative default and presets pass their named state
  size?: number;        // px glyph width; sets --hexl-line-h/--hexl-gap inline
  step?: number;        // ms per tick; MUST be clamped Math.max(120, step)
  invert?: boolean;     // renders in negative color space (adds .hexl-invert)
  className?: string;   // Tailwind composition; spread ...rest onto root
}
```

- Root element: `role="status"`, `aria-label="Loading"` (overrideable), decorative
  metadata `aria-hidden`.
- Colors ONLY through `var(--hexl-fg)` / `var(--hexl-bg)`; dim via `var(--hexl-dim)`,
  mid via `var(--hexl-mid)`. No hard-coded hex except in the file-header comment.
- Reduced motion: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` →
  render static frame, skip interval creation entirely.
- SSR-safe: no window access during render; timers only inside `useEffect`.

## Registry entry (`src/lib/registry.ts`)

```ts
{
  value: number;              // 0–63 — also the 8×8 grid position (row=upper, col=lower)
  name: string;               // "Barrel Shift"
  slug: string;               // "barrel-shift" — named preset used in /loaders/[slug]
  component: string;          // "shift-loader" — canonical distributable registry item
  mechanic: Mechanic;         // one of the 8 (see mechanics.md)
  flagship?: boolean;         // only the 3 bespoke loaders
}
```

Derived display data comes from `hexagrams.ts` (`binaryOf(value)`, `kingwenOf(value)`,
`HEX_NAMES`) — never duplicate it into the registry row.

## sources.ts wiring

```ts
import myLoaderSource from '@/registry/loaders/my-loader.tsx?raw';
// flagship:  loaderFilesFor(slug) → [{ path, source: myLoaderSource }]
// generated: loaderFilesFor(slug) → [GENERATED_SOURCES[mechanic], hexGlyphSource]
```

The docs/detail/playground Code tabs read ONLY through this module — that is what
keeps shown source identical to shipped source.

## File-header block (copy exactly)

```tsx
/**
 * HEXLOADERS — <Name> · STATE <n> · <binary top→bottom> · mechanic <MECHANIC>
 * Registry: pending until consumer proof · Files: [<file>, hex-glyph.tsx]
 * Zero additional runtime dependencies beyond React.
 * License: MIT — install one, copy the code, make it yours.
 */
```
