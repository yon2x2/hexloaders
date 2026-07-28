# HEXLOADERS

HEXLOADERS is a collection of 64 free and open-source React loaders built from
the I Ching hexagrams as six-bit states. Preview them live, copy the source, and
make one yours.

The verified components below install from the public GitHub registry. Every
loader also exposes its source for manual installation.

```bash
npx shadcn@latest add yon2x2/hexloaders/bit-scanner
npx shadcn@latest add yon2x2/hexloaders/cascade-loader
npx shadcn@latest add yon2x2/hexloaders/mutating-matrix
npx shadcn@latest add yon2x2/hexloaders/inversion-pulse
npx shadcn@latest add yon2x2/hexloaders/invert-loader
npx shadcn@latest add yon2x2/hexloaders/scan-loader
npx shadcn@latest add yon2x2/hexloaders/sequence-loader
```

## Requirements

- Node.js 24
- npm 10 or newer

The repository includes an `.nvmrc` file. With nvm installed, run `nvm use` before
installing dependencies.

## Local development

```bash
npm ci
npm run dev
```

The development server runs at <http://127.0.0.1:4317>. The port is strict: Vite
will stop instead of switching to another port when `4317` is unavailable.

## Commands

```bash
npm run dev              # Start the local Vite server on port 4317
npm run lint             # Run ESLint
npm run build            # Type-check and create the production build
npm run check:integrity  # Validate the 64-state dictionary and registry
npm run check:components # Render every public registry entry and verify runtime contracts
npm run check:registry:consumer # Install every public registry item into a clean Vite app
npm run check:design     # Audit the HEXLOADERS design laws
npm run check            # Run the complete non-browser gate sequence
npm run preview          # Preview the production build
```

## Product surface

- `/` — catalogue and Fu Xi matrix
- `/docs/*` — introduction, architecture, usage, and manual setup
- `/playground` — interactive loader configuration
- `/showcase` — contextual examples
- `/loaders/:slug` — 64 data-driven loader detail pages

## Architecture

- `src/lib/hexagrams.ts` is the canonical 64-state dictionary.
- `src/lib/registry.ts` is the loader metadata source of truth.
- `src/lib/sources.ts` exposes real component source through Vite raw imports.
- `src/registry/loaders/` contains the loader sources used by the catalogue.
- `agents/skills/` contains the project-specific design, documentation, loader,
  and QA workflows.

The non-negotiable design constraints are pure black and white, rigid ledger
geometry, technical typography, stepped mechanical motion, and zero-dependency
loader components.

Maintainer documentation lives under [`docs/internal/`](docs/internal/).

## License

MIT. See [`LICENSE`](LICENSE).
