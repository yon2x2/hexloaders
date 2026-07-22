# HEXLOADERS

HEXLOADERS is a React and TypeScript loader system built from the 64 I Ching
hexagrams interpreted as six-bit states. The repository contains the component
source, a live catalogue, documentation, a playground, and a showcase.

The website is functional. `bit-scanner` is the first public GitHub registry
item; the remaining loaders expose their source for manual installation while
their registry entries are prepared and verified.

```bash
npx shadcn@latest add yon2x2/hexloaders/bit-scanner
```

## Requirements

- Node.js 20.19 or newer in the Node 20 release line
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
npm run check:registry:consumer # Install Bit Scanner into a clean Vite app and build it
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
- `src/registry/loaders/` contains three flagship loaders and eight mechanic
  templates used by the catalogue.
- `agents/skills/` contains the project-specific design, documentation, loader,
  and QA workflows.

The non-negotiable design constraints are pure black and white, rigid ledger
geometry, technical typography, stepped mechanical motion, and zero-dependency
loader components.

Additional context lives in [`docs/plan.md`](docs/plan.md) and
[`spec/core-spec.md`](spec/core-spec.md).

## License

MIT. See [`LICENSE`](LICENSE).
