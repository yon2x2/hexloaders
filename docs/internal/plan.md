# PLAN — "HEX" — I Ching Binary Loader Library (COMPLETE / HISTORICAL)

> Status: all five stages are complete. This file records the original build plan;
> current release policy and remaining quality work live in
> `docs/internal/distribution-guide.md`.

## Goal
Open-source, scalable UI library ecosystem of 64 animated presets based on I Ching hexagrams
treated as a 6-bit binary system. Three flagships plus eight mechanic templates are the 11
distributable components. Distribution = copy-paste / shadcn source registry.
Design = Rationalist Bauhaus × Minimal Ledger: pure #000/#FFF only, rigid grid, mono/type indexing,
mechanical stepped motion (CSS `steps()`), zero-dependency, CSS-custom-property-driven.
Deliverable: a production-grade React+TS+Tailwind webapp = landing page + live component previews +
  source viewer + copy/install UX + the actual registry architecture (data model, tokens, 3 flagship loaders,
  8 mechanic templates, source ownership UX).

## Stage 1 — Orchestration skill load + design foundation
- Load skill: `vibecoding-webapp-swarm` (web UI task).
- Orchestrator defines (shared spec for all subagents):
  - Hexagram data model: `Hexagram { kingWen: number; name: string; pinyin?: string; bits: readonly [6] }`
    bits bottom-to-top, 1 = Yang (solid), 0 = Yin (broken). Full King Wen 64 table.
  - Design tokens as CSS custom properties: `--hex-fg`, `--hex-bg`, `--hex-line-w`, `--hex-line-h`,
    `--hex-gap`, `--hex-break-ratio`, `--hex-step-ms`, `--hex-cell`.
  - Motion law: ONLY `steps()` timing or 0/1 keyframes. Forbidden: ease, ease-in-out, gray, gradients,
    shadows, blur, border-radius (except 0).
- Output: SPEC block passed to every subagent.

## Stage 2 — Scaffold + core library layer (swarm per skill workflow)
- Subagent A (scaffold/core): Vite React TS + Tailwind project; `src/lib/hexagrams.ts` (64 King Wen
  entries generated from canonical table); `HexGlyph` primitive (SVG/div renderer, pure B/W, CSS-var
  sized); design tokens stylesheet.
- Subagent B (3 flagship loaders): `BitScanner`, `MutatingMatrix`, `InversionPulse` — zero-dep,
  prop-driven (`hexagram`, `speed`, `inverted`, `className`), mechanical stepped motion.
- Output: integrated core code in shared repo.

## Stage 3 — Landing page + registry UX
- Subagent C: Dot Matrix/shadcn-style site — header, hero (mono type, ledger grid), live preview cards
  with Preview/Code tabs + copy button, install command block
  (`npx shadcn@latest add yon2x2/hexloaders/bit-scanner`), full 64-hexagram index grid,
  architecture section, install/source ownership section.
- Output: complete pages wired to Stage 2 components.

## Stage 4 — Validate, build, deliver (superseded delivery tooling)
- `npm run build` must pass; visual check (screenshot) for strict B/W compliance.
- Fix loop via reviewer subagent if needed.
- Delivery now runs through the Vercel project and exact-SHA production checks.

## Stage 5 — Internal distribution guide
- Keep roadmap and release sequencing internal in `docs/internal/distribution-guide.md`.
- Public pages describe only what users can install or copy today.
