# HEXLOADERS — Original Build Swarm Roster

The site was built by a 7-agent swarm orchestrated by a main agent (Kimi K3),
following a design-first multi-agent workflow (design → scaffold → parallel pages →
merge/build → deliver → hotfix).

| Agent | Role | TLDR of work |
|---|---|---|
| **Orchestrator** (main agent) | Coordination | plan.md, core-spec (canonical KING_WEN/HEX_NAMES tables), branch/merge ops, build gates, delivery + 2 hotfix rounds (empty dist snapshot; memory leak) |
| **Pro_Designer** | Design | The entire design system: `design/design.md` + 9 per-page designs — 5 design laws, tokens, motion vocabulary, 64-loader registry table, flagship specs, CLI roadmap content |
| **Scaffold** | Core + home | `hexagrams.ts`/`registry.ts`/`sources.ts`, `--hexl-*` tokens, the 3 flagship zero-dep loaders, shared chrome (Navbar/Footer/DocsShell/CodeBlock/PreviewCard/BitEditor…), the full landing page with live 8×8 matrix |
| **docs-foundation** | Docs | Introduction page (6-bit thesis, Leibniz anchor) + Manual Setup (copy-paste workflow fed by `?raw` sources) |
| **docs-system** | Docs | Architecture page (encoding, dictionary, interactive Fu Xi map) + Usage page (install, tokens, inversion, reduced motion, 3-phase CLI roadmap) |
| **loaders** | Registry depth | 8 generated zero-dep mechanic templates (`src/registry/loaders/generated/`), `loaderFilesFor()` source aggregation, 64 data-driven detail pages with install strips, props tables, deep-dives |
| **interactive** | Tools | Playground (live configurator: BitEditor, stepped params, generated JSX, PNG capture) + Showcase (8 in-context vignettes) |
| **leak-hunter** (forensic) | Hotfix | Root-caused the "Aw, Snap" tab crash: non-`/g` KEYWORDS regexes in CodeBlock → infinite `exec()` loop → renderer OOM. Fixed + verified flat heap on 9 routes |

## Mapping: one-shot agents → standing skills

The build agents were one-shot crews. Their *durable knowledge* lives on as skills:

- Pro_Designer's laws → **hexl-design-guardian** (audit script + fix table)
- Scaffold + loaders' component/registry craft → **hexl-loader-forge**
- docs-foundation + docs-system's sync discipline → **hexl-docs-keeper**
- leak-hunter + the delivery incidents → **hexl-qa-sentinel** (gates + postmortem)
- Orchestrator's ritual → `agents/README.md` pre-merge sequence
