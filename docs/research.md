# Research — Distribution-model references (for design fidelity)

## Dot Matrix (https://dotmatrix.zzzzshawn.cloud/) — primary reference
A shadcn-style loader registry. Observed conventions to emulate:
- Hero: tiny mono kicker + huge statement headline ("Dotmatrix loaders for every app."), subline:
  "55+ free and open-source loaders, built with React, TypeScript, Tailwind CSS, and shadcn.
   Install one, copy the code, and make it yours."
- A prominent install command chip: `npx shadcn@latest add @dotmatrix/dotm-square-3` with copy affordance.
- Top nav links: Introduction · Usage · Manual setup · Playground · Showcase.
- Docs pages follow the shadcn/ui docs pattern: left sidebar (Getting Started section + full component
  index list), main column with a large bordered Preview card, "Preview / Code" tab toggle, copy button
  on code blocks, install-command block with package-manager tabs.
- Aesthetic: extreme minimalism, white ground, black ink, mono type for metadata, grid of component
  cards each showing a live animated loader.

## shadcn/ui (ui.shadcn.com) — secondary reference
- Registry JSON concept: each component is addressable (`npx shadcn add <name>`), files land in the
  user's own repo (`components/ui/...`), user owns the code.
- Docs: component preview card with Preview/Code tabs; "Open in v0"; CLI install block; manual-setup
  section showing full source to copy; props table; examples section.

## Adaptation for HEXLOADERS (this project)
- Same registry/docs skeleton, but the design language is STRICTER: pure #000/#FFF only (no grays —
  hairline borders are solid 1px black, or white on inverted blocks), monospace + grotesk type,
  ledger/grid layout, stepped mechanical motion everywhere (marquee tickers, counters, loaders).
- HEXLOADERS consolidates the public navigation to Docs · Playground · Showcase. The complete
  documentation index remains available inside the docs shell and footer.
- Signature motif: the 6-bit hexagram glyph (six stacked rows; solid bar = 1, split bar = 0) used as
  logo mark, bullets, dividers, section indices, and the loaders themselves.
