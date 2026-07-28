# HEXLOADERS — Component API & Registry Contracts

## Loader component contract

```tsx
export interface LoaderProps {
  value?: number;       // 0–63, LSB = bottom line
  size?: number;        // px glyph width
  invert?: boolean;     // negative color space
  className?: string;   // composition; spread ...rest onto root
}
```

- Generated mechanic templates expose `step`.
- Flagships expose only the specialized props declared by their source, such as
  `interval`, `pattern`, `cells`, `mode`, or `showMeta`.
- Every timer input must normalize finite values into
  `120..2_147_483_647`; invalid values use the component fallback.
- Root element: `role="status"`, `aria-label="Loading"` (overrideable), decorative
  metadata `aria-hidden`.
- Colors ONLY through `var(--hexl-fg)` / `var(--hexl-bg)`; dim via `var(--hexl-dim)`,
  mid via `var(--hexl-mid)`. No hard-coded hex except in the file-header comment.
- Reduced motion: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` →
  render static frame, skip interval creation entirely.
- SSR-safe: no window access during render; timers only inside `useEffect`.

## Registry entry (`src/lib/registry.ts`)

```ts
type RegistryRow = readonly [
  name: string,
  slug: string,
  mechanic: Mechanic,
];
```

The tuple index is the value. `component`, `flagship`, `hexagram`, `binary`,
`registry`, and `install` are derived in `src/lib/registry.ts`; never duplicate
them into the row. Component source and `check:components` are the authority for
specialized props.

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
 * Files: [<file>, hex-glyph.tsx]
 * Zero additional runtime dependencies beyond React.
 * License: MIT — install one, copy the code, make it yours.
 */
```

Publication state belongs only in `docs/internal/distribution-guide.md`; never
include roadmap or pending status in source headers exposed by the Code panels.
