# Internal distribution guide

This document is for maintainers. Do not expose roadmap phases, rollout sequencing,
or possible CLI work in the public website.

## Current state

- `bit-scanner` and `cascade-loader` are public GitHub registry items.
- Every loader page exposes its real source for manual installation.
- Public copy should describe only actions available now: install or copy source.

## Release sequence

1. Keep the two published sources covered by the clean-consumer gate.
2. Verify and publish the two remaining flagship sources.
3. Verify and publish the seven remaining mechanic sources.
4. Keep all 64 loader routes and source panels available throughout.
5. Require the clean-consumer install and production-build gate for every item.

## Dedicated CLI

Consider a HEXLOADERS CLI only after the registry catalogue is complete and user
demand demonstrates a need for discovery, batch installs, or conflict handling.

## Public-copy boundary

- Never publish roadmap phases, dates, rollout states, or speculative features.
- Never label a loader `pending`; state only what the user can do now.
- Keep implementation counts and release sequencing in internal docs.
- When distribution changes, update this guide before changing public copy.
