# Internal distribution guide

This document is for maintainers. Do not expose roadmap phases, rollout sequencing,
or possible CLI work in the public website.

## Current state

- All canonical components are public GitHub registry items: `bit-scanner`,
  `cascade-loader`, `mutating-matrix`, `inversion-pulse`, `invert-loader`,
  `scan-loader`, `sequence-loader`, `shift-loader`, `count-loader`,
  `stack-loader`, and `strobe-loader`.
- Every loader page exposes its real source for manual installation.
- Public copy should describe only actions available now: install or copy source.

## Release policy

1. Keep every published source covered by the clean-consumer gate.
2. Verify every registry item alone and all items together.
3. Keep all 64 loader routes and source panels available.
4. Require clean-consumer builds and an exact-SHA production check for every change.

## Dedicated CLI

Consider a HEXLOADERS CLI only after the registry catalogue is complete and user
demand demonstrates a need for discovery, batch installs, or conflict handling.

## Measurement baseline

- Use Vercel Web Analytics for aggregate page and route interest.
- Do not treat a command copy as a successful install.
- Keep custom install-copy events out until the project plan supports them and
  there is a concrete decision they will inform.
- Collect at least 30 days of baseline traffic before proposing a dedicated CLI
  or expanding the registry surface.

## Post-registry quality roadmap

Completed safeguards:

- Playground JSX, detail previews, Showcase specimens, and manual file copy
  resolve to the exact components and paths installed by the registry.
- Public setup and reduced-motion documentation describe the shipped source.
- The dense 64-cell catalogue keeps its lightweight renderer; public detail and
  configuration surfaces are covered by the installed-component contract gate.

Next:

1. Audit the remaining public interactive controls against the 44px mobile
   target, then verify representative routes at 390px and desktop width.
2. Reassess discovery or CLI work only from measured demand.

## Public-copy boundary

- Never publish roadmap phases, dates, rollout states, or speculative features.
- Never label a loader `pending`; state only what the user can do now.
- Keep implementation counts and release sequencing in internal docs.
- When distribution changes, update this guide before changing public copy.
