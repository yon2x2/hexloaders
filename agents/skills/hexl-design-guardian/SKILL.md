---
name: hexl-design-guardian
description: >
  Audit and enforce the HEXLOADERS design system — the 5 non-negotiable laws
  (pure #000/#FFF only, rigid ledger grid, technical typography, mechanical
  steps()-only motion, zero-dependency CSS-var loaders). Use when reviewing
  PRs/commits, adding or editing any component/page/style, before releases,
  or whenever something "looks off-brand" (grays, smooth easings, rounded
  corners, shadows). Repo: HEXLOADERS (React 19 + TS + Vite + Tailwind).
---

# HEXL Design Guardian

The HEXLOADERS aesthetic is *Rationalist Bauhaus × Minimal Ledger*. It survives only
through relentless enforcement. Your job: find violations, cite file:line, propose the
exact compliant fix.

## The 5 Laws

Canonical source: `design/design.md` — **which may not exist in your checkout**
(it is generated during the original build and is not committed). In that case the
law table below IS the operative canon — treat it as complete.

1. **Absolute monochromaticity** — only `#000000` / `#FFFFFF`. No grays, gradients,
   shadows, blurs. "Dim" = opacity step (`var(--hexl-dim)` 0.15, `var(--hexl-mid)` 0.45)
   on solid black, never a gray color.
2. **Strict rigid geometry** — 1px hairlines, 8px modular scale, `border-radius: 0`
   everywhere. Nothing floats off-grid.
3. **Technical typography** — Archivo/grotesk for statements, Space Mono for data/labels.
   Mono labels uppercase with markers (`//`, `n°`, `■`). Tabular nums in readouts.
4. **Mechanical motion** — ONLY `steps(n,end)` timing, hard cuts (`transition: none`),
   instant inversion. Durations are integer multiples of `--hexl-step: 120ms`.
   No `ease`, `ease-in-out`, `cubic-bezier`, no smooth-scroll libraries.
5. **Ownership** — code is the hero. Components add no runtime packages: flagships are
   single-file; mechanic templates share only the local `hex-glyph` primitive.

## Workflow

1. Run `bash agents/skills/hexl-design-guardian/scripts/audit-design-laws.sh` from the
   repo root. It greps for the common violation classes and exits 1 on findings.
2. Triage every hit: real violation vs. allowed exception (see below).
3. For each real violation, report `file:line → law broken → exact fix`.
4. If asked to fix: apply the minimal compliant edit, re-run the audit until clean,
   then `npm run build`.

## Allowed exceptions

- `src/components/ui/` (pre-seeded shadcn primitives) — excluded from greps, but if a
  primitive is *surfaced* in the UI it must be restyled to pure B/W ledger first.
- Raw source strings shown inside CodeBlocks (documented code may quote anything).
- `dist/` build output and `node_modules/` — never audit these.

## Common violations → compliant fixes

| Violation | Fix |
|---|---|
| `#111`, `#666`, `gray-*`, `zinc-*` | `#000`/`#FFF` or opacity step on solid black |
| `transition: all 200ms ease` | `transition: none` (hover = instant invert) |
| `duration-300` + default easing | steps-based timing fn (`ease-step-*` Tailwind tokens) |
| `rounded`/`rounded-md` | `rounded-none` |
| `shadow-*`, `blur-*`, `bg-gradient-*` | delete — flat hairline blocks instead |
| non-120ms-multiple durations (100/150/300ms) | nearest 120ms multiple (120/240/360…) |
| new gray scrollbar/selection/focus ring | `::selection` B/W swap; focus `2px solid currentColor` |

## New-component checklist

- Hover/focus = instant invert or 2px hard border shift; focus-visible identical to hover.
- Cursor `crosshair` over loader stages only; no custom cursor graphics.
- `prefers-reduced-motion` static frame defined.
- No new dependencies for loader code (`src/registry/loaders/` stays zero-dep).
