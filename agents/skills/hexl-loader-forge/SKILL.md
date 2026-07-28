---
name: hexl-loader-forge
description: >
  Create or extend HEXLOADERS loaders end-to-end — new mechanic-template instances,
  new bespoke flagship loaders, or entirely new motion mechanics — and register them
  across registry.ts, sources.ts, detail pages and playground. Use when the user asks
  to add a loader, invent a new animation mechanic, promote a generated loader to
  flagship quality, or grow the 64-preset registry. Repo: HEXLOADERS (React 19 + TS +
  Vite + Tailwind, zero-dep distributable loaders).
---

# HEXL Loader Forge

Every loader is a mechanical machine built on the 6-bit glyph grid. Adding one is a
registry-wide operation, not just a new file.

## 1. Pick the path

**CRITICAL: the address space is FULL.** Values are 0–63 and all 64 registry rows
exist (that completeness is the product's thesis — a 6-bit address space). You can
never "add loader #65". Growth means one of:

| Request | Path |
|---|---|
| Rename/re-theme an existing row | A — edit its registry row (name/slug/mechanic) only |
| Bespoke/flagship-quality loader for an existing value | B — new single file in `src/registry/loaders/`, add the existing slug to `FLAGSHIP_SLUGS`, and wire `loaderFilesFor` to the single file |
| New motion mechanic (9th+) | C — new template in `src/registry/loaders/generated/` + `Mechanic` type + `MechanicCell` variant + CLOCK entry, then RE-TAG appropriate existing rows to it |

If a user asks to "add a new loader", clarify which existing state it replaces or
upgrades before touching anything. Duplicate values in the registry break the 8×8
matrix and the Fu Xi map.

## 2. Geometry & invariants (never violate)

- Glyph grid: `W=64`, `LINE_H=W/8 (8px)`, `GAP=W/16 (4px)`, `H=6·LINE_H+5·GAP (68px)`.
  Line 1 (LSB) = bottom row. Yin = two bars with a GAP void; Yang = one solid bar.
- Motion: JS-clock hard cuts or CSS `steps()` only. Durations = 120ms multiples.
- **Timer law:** every `setInterval` delay must be guarded: `Math.max(120, step)` —
  an undefined/0 delay spins a 0ms loop and kills the tab (see qa-sentinel postmortem).
- Zero runtime dependencies. No imports beyond `../hex-glyph` (or fully inline).
- Reduced motion: render a static representative frame via `matchMedia` guard.

## 3. Component contract (all paths)

```tsx
/**
 * HEXLOADERS — <name> · STATE <n> · <binary> · mechanic <MECHANIC>
 * Zero additional dependencies beyond React · MIT
 */
// props: value?: number (0–63, representative default), size?, step? (ms, ≥120), invert?, className?
// styling ONLY via --hexl-* CSS vars (+ inline style from size prop)
// root: role="status" aria-label="Loading", spreads ...rest
```

Track publication sequencing only in `docs/internal/distribution-guide.md`.
Effective publication state must agree between `PUBLISHED_REGISTRY_COMPONENTS` and
`registry.json`; source headers are public through the loader Code panels.

Read `agents/skills/hexl-loader-forge/references/contracts.md` for the full API and
registry-entry schema, and `references/mechanics.md` for the 8-mechanic taxonomy.

## 4. Registration checklist

1. Edit the existing `TABLE` tuple only when its name, slug, or mechanic changes.
   Never add a 65th row.
2. For a bespoke promotion, add the existing slug to `FLAGSHIP_SLUGS`.
3. Wire the exact raw source and manual file set in `src/lib/sources.ts`.
4. If publishing the component, update both `PUBLISHED_REGISTRY_COMPONENTS` and
   `registry.json`; they must remain identical.
5. Detail routes and Playground are data-driven. Verify the component symbol,
   installed path, preview, and parameters instead of adding route-specific metadata.
6. Only for a new mechanic: extend `Mechanic`, its generated component,
   `MechanicCell`, timing references, and the existing rows assigned to it.

## 5. Gates before committing

1. `bash agents/skills/hexl-design-guardian/scripts/audit-design-laws.sh` → clean.
2. `npm run build` → passes (your loader is compiled — zero type errors).
3. `node agents/skills/hexl-qa-sentinel/scripts/validate-hexagrams.mjs` → registry intact.
4. If you touched shared components: run the qa-sentinel smoke harness on
   `/loaders/<slug>` and `/`.

## 6. Voice & naming

Loader names: two-word mechanical/ledger metaphors (Barrel Shift, Tally Counter).
Slugs: kebab-case. Header comment carries state n°, binary (top→bottom print),
mechanic, registry name, MIT.
