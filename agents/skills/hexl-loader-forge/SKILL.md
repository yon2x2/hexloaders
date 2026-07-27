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
| Bespoke/flagship-quality loader for an existing value | B — new single file in `src/registry/loaders/`, flip `flagship: true` on that row, wire `loaderFilesFor` to the single file |
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

Track publication state only in `docs/internal/distribution-guide.md`; source
headers are public through the loader Code panels.

Read `agents/skills/hexl-loader-forge/references/contracts.md` for the full API and
registry-entry schema, and `references/mechanics.md` for the 8-mechanic taxonomy.

## 4. Registration checklist (paths B & C; path A = step 1 only)

1. `src/lib/registry.ts` — add LoaderMeta row (n° = value, slug kebab-case, name,
   mechanic, flagship flag only if truly bespoke). Keep 8×8 grid order by value.
2. `src/lib/sources.ts` — add the `?raw` import and wire `loaderFilesFor(slug)` so the
   detail page Code tab shows the real source (flagship → single file; generated →
   [template + hex-glyph]). Never hand-duplicate source.
3. `src/components/loaders/MechanicCell.tsx` — only path C: add the mechanic's frame
   branch + CLOCK entry so matrix/detail previews render it.
4. Detail page (`/loaders/[slug]`) is data-driven — no edits needed beyond registry.
5. Playground picks up new registry rows automatically; verify the loader renders in
   its stage and the parameter panel offers `step/size/invert`.

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
