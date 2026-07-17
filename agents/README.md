# agents/ — Standing skills for HEXLOADERS maintenance

This folder holds four portable agent skills (SKILL.md format) distilled from the
swarm that built this repo. They turn any general-purpose coding agent (Kimi, Codex,
Cursor, Claude Code, etc.) into a specialist for the recurring jobs of this project.

## The skills

| Skill | Job | Trigger examples |
|---|---|---|
| `skills/hexl-design-guardian` | Enforce the 5 design laws (pure B/W, ledger grid, steps()-only motion) | "review this PR", "audit the new page", "something looks off-brand" |
| `skills/hexl-loader-forge` | Add loaders / mechanics end-to-end (registry → sources → playground) | "add loader #65", "invent a 9th mechanic", "promote cascade to flagship" |
| `skills/hexl-docs-keeper` | Keep docs ↔ code ↔ registry in sync (single source of truth, `?raw`) | "I changed a prop", "docs show stale source", "add a docs section" |
| `skills/hexl-qa-sentinel` | Pre-merge gates: build, integrity, memory-leak smoke (jsdom) | "before we merge", "the tab crashes", "review this timer code" |

## How to use with any agent

Point the agent at the skill folder and give the task, e.g.:

```
Read agents/skills/hexl-qa-sentinel/SKILL.md and follow it. Then run the full
gate sequence on this branch before I merge.
```

```
Read agents/skills/hexl-loader-forge/SKILL.md (+ its references/) and add a new
COUNT-mechanic loader named "Parity Drum" (state 12), fully registered.
```

The skills are self-contained: scripts are runnable as-is from the repo root, and
`references/` files are loaded only when the task needs them.

## Pre-merge ritual (recommended)

1. `npm run build`
2. `node agents/skills/hexl-qa-sentinel/scripts/validate-hexagrams.mjs`
3. `bash agents/skills/hexl-design-guardian/scripts/audit-design-laws.sh`
4. jsdom smoke on all 9 routes (see qa-sentinel SKILL.md)

## History

See `ROSTER.md` for the original build swarm and how each agent's knowledge maps
into these standing skills.
