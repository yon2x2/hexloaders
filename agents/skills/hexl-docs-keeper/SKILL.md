---
name: hexl-docs-keeper
description: >
  Keep HEXLOADERS documentation, registry metadata and copy-pasteable sources in
  sync when code changes. Use when editing any loader, hexagrams.ts, CSS tokens,
  registry.ts, or docs pages; when adding docs sections; when a docs page shows
  stale source/props; or before releases to audit docs-vs-code drift. Repo:
  HEXLOADERS (React 19 + TS + Vite + Tailwind).
---

# HEXL Docs Keeper

The site's core promise — "install one, copy the code, make it yours" — breaks the
moment docs drift from code. Your job: enforce single-source-of-truth.

## The truth map (what feeds what)

| Truth | File | Consumed by |
|---|---|---|
| 64-state dictionary | `src/lib/hexagrams.ts` | everything (never edit constants without qa-sentinel validate) |
| Loader metadata | `src/lib/registry.ts` | matrix, DocsShell sidebar, `/loaders/[slug]`, playground, footer |
| Raw sources + tokens | `src/lib/sources.ts` (`?raw`) | every CodeBlock on the site |
| Design laws | `design/design.md` | all pages (voice, tokens, motion) |

**Golden rule:** docs NEVER hand-duplicate code. Every source block comes from a
`?raw` import or a `sources.ts` aggregate. If you find a hand-copied listing, replace
it with the raw import (or a programmatic excerpt, like the architecture page's
dictionary excerpt that elides HEX_NAMES from the raw text).

## Sync checklist (run after any code change)

1. Changed a loader's props/defaults? → update its props table in
   `src/pages/LoaderDetail.tsx` (`loader-detail` components) and any usage snippet.
   The shipped prop is `value` — never document it as `state`.
2. Changed `--hexl-*` tokens? → update `CSS_TOKENS_BLOCK` in `sources.ts`, the Usage
   variables table, and Manual Setup step 1 (all three read the same block — verify).
3. Added/removed a registry row? → verify sidebar grouping, related-loaders rows,
   and pager wrap (63↔0) still behave; update Introduction's data row if counts change
   (64 LOADERS · 8 MECHANICS · 0 DEPENDENCIES · 1 DICTIONARY).
4. Changed a mechanic? → docs mechanics table in `DocsArchitecture.tsx` + Usage
   reduced-motion table + Footer mechanic glyph row.
5. Changed CLI messaging? → Usage `#cli-roadmap`, home distribution section, and the
   install strip on detail pages must tell the same story.

## Adding a docs section

1. Use `DocsShell` (sidebar + ON THIS PAGE scroll-spy) — register the new anchor in
   the page's TOC list.
2. Section header: `Kicker` + display-md, mono SEC index, glyph index motif.
3. Code = `CodeBlock` fed from raw sources; commands = pkg-manager tab variant.
4. Pager at bottom: PREV/NEXT ledger cards.

## Voice (design.md §11)

Technical, declarative, dry. Short sentences. No exclamation marks, no spirituality,
no marketing adjectives. Binary/data metaphors only. Mono labels uppercase with
markers (`//`, `n°`, `■`). States print as `STATE 26 · 011010`.

## Drift audit (periodic)

- Grep pages for hardcoded `011010`/`STATE 26` strings that should derive from helpers.
- Confirm every `<CodeBlock code=` traces to `sources.ts`/raw import, not a literal.
- Confirm published items use `npx shadcn@latest add yon2x2/hexloaders/<slug>`.
- Confirm unpublished items say `MANUAL SOURCE` and never expose a copyable CLI command.
