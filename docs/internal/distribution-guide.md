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

## Public-copy boundary

- Never publish roadmap phases, dates, rollout states, or speculative features.
- Never label a loader `pending`; state only what the user can do now.
- Keep implementation counts and release sequencing in internal docs.
- When distribution changes, update this guide before changing public copy.
