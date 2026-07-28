---
name: hexl-qa-sentinel
description: >
  Pre-merge verification for the HEXLOADERS repo — build gate, hexagram/registry
  integrity validation, and a jsdom memory-leak smoke harness that reproduces
  tab-crash ("Aw, Snap" renderer OOM) bugs without a browser. Use before merging
  any PR, after dependency upgrades, when the site freezes/crashes a browser tab,
  when pages go blank, or when reviewing timer/regex/animation code. Repo:
  HEXLOADERS (React 19 + TS + Vite + Tailwind).
---

# HEXL QA Sentinel

## The incident that defines this skill (postmortem 2026-07-17)

A `while (km = kw.exec(text))` tokenize loop in `src/components/CodeBlock.tsx` used
regexes **without the `/g` flag** → `exec` ignored `lastIndex` → infinite loop
allocating tokens synchronously during render → renderer OOM → Chrome killed the tab
("Aw, Snap! Error code: 5"). Every page with a CodeBlock died in <1s. Build passed;
only runtime memory profiling caught it.

**Lesson:** type-checking never catches runaway runtime loops. Always run the gates below.

## Gate sequence (run all, in order)

1. **Base gate:** `npm run check`.
2. **Clean consumer:** if registry metadata, public source, install targets, or a
   release changed, run `npm run check:registry:consumer`.
3. **Memory smoke:** if regex loops, timers, effects, or shared runtime/rendering
   code changed, record `git status --short`, then install jsdom without changing
   package metadata:
   `npm install --no-save --package-lock=false jsdom`.
   Run `npm run build`, then for EACH route run
   `node --max-old-space-size=3072 agents/skills/hexl-qa-sentinel/scripts/smoke.mjs <route>`.
   Routes: `/` `/docs/introduction` `/docs/architecture` `/docs/usage`
   `/docs/manual-setup` `/playground` `/showcase` `/loaders/bit-scanner` `/loaders/cascade-row`.
   Pass = `OK 30s` with bounded heap. Fail = `FAIL heap>2.5GB` or EVAL ERROR.
   `git status --short` must be identical before and after.

## Known-fragile patterns (audit these in every diff)

| Pattern | Rule |
|---|---|
| `while (re.exec(s))` | regex MUST have `/g` + reset `re.lastIndex = 0` before each reuse |
| `setInterval(fn, delay)` | finite delay MUST be floored and clamped to `120..2_147_483_647`; invalid input uses a safe fallback |
| `useEffect` without dep array that sets state | infinite render loop — must have deps |
| state updated per tick | must replace, never append/accumulate (`setX([...x, v])` in a timer = leak) |
| recursion in components | must have a depth/value guard |

## Triage playbook: "the tab crashes / page is blank"

1. Reproduce with the smoke harness per route → the failing route set localizes the
   culprit component (control group = routes that survive).
2. If heap explodes in <1s with no timer logs: **synchronous** allocation loop during
   render (regex/exec, while/for without exit). Grep the table patterns.
3. If heap climbs steadily: **per-tick accumulation** or unclamped fast interval.
4. If blank without OOM: render exception — check EVAL ERROR output and error
   boundaries; suspect setState-during-render (React throws max update depth).
5. Fix root cause, re-run all 9 routes, confirm package metadata stayed unchanged,
   then commit.

## Harness notes

The smoke harness stubs `IntersectionObserver` to fire once (like a real browser),
`matchMedia`, `ResizeObserver`, `scrollTo`. jsdom heap is inflated vs. real browsers
(≈2–3×); what matters is *bounded*, not small — a stable sawtooth passes, a rising
slope fails.
