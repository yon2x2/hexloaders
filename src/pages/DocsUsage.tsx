/**
 * HEXLOADERS — Usage `/docs/usage` (design/usage.md).
 * CLI install via the shadcn-compatible registry (pkg-manager tabs), Tailwind
 * / CSS-vars setup, using a loader, global theming + inversion (data-invert),
 * the reduced-motion contract, and the custom CLI roadmap (3 ledger phases).
 * Conversion-oriented: every section ends with something copyable.
 */

import DocsShell from '@/components/DocsShell';
import Kicker from '@/components/Kicker';
import CodeBlock from '@/components/CodeBlock';
import PropsTable from '@/components/PropsTable';
import { CSS_TOKENS_BLOCK } from '@/lib/sources';
import Reveal from '@/components/docs-foundation/Reveal';
import {
  SectionHead,
  LedgerNote,
  LedgerTable,
  DocsPager,
  TypedCodeBlock,
} from '@/components/docs-system/DocsBlocks';
import InvertStrip from '@/components/docs-system/InvertStrip';
import Roadmap from '@/components/docs-system/Roadmap';

const TOC = [
  { id: 'install-a-loader', label: 'Install a loader' },
  { id: 'configure', label: 'Configure' },
  { id: 'use', label: 'Use' },
  { id: 'theme-and-invert', label: 'Theme & invert' },
  { id: 'reduced-motion', label: 'Reduced motion' },
  { id: 'cli-roadmap', label: 'CLI roadmap' },
];

/* components.json — registry registration (usage.md). */
const COMPONENTS_JSON = `{
  "registries": {
    "@hexloaders": "https://r.hexloaders.dev/{name}.json"
  }
}`;

/* tailwind.config.ts — excerpt (design.md §9). */
const TAILWIND_EXCERPT = `// tailwind.config.ts — excerpt
export default {
  theme: {
    extend: {
      colors: { hexl: { bg: 'var(--hexl-bg)', fg: 'var(--hexl-fg)' } },
      fontFamily: {
        grotesk: ['Archivo', 'Helvetica Neue', 'Helvetica', 'Akzidenz-Grotesk', 'Arial', 'sans-serif'],
        mono: ['Space Mono', 'SF Mono', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        'step-1': 'steps(1,end)', 'step-2': 'steps(2,end)',
        'step-4': 'steps(4,end)', 'step-6': 'steps(6,end)', 'step-8': 'steps(8,end)',
      },
      keyframes: {
        'hexl-scan':   { to: { transform: 'translateY(100%)' } },   /* used w/ steps(6) */
        'hexl-blink':  { '50%': { opacity: '0' } },                 /* steps(1) */
        'hexl-ticker': { to: { transform: 'translateX(-50%)' } },   /* steps(120) */
      },
      animation: {
        'hexl-scan': 'hexl-scan 720ms steps(6,end) infinite',
        'hexl-blink': 'hexl-blink 480ms steps(1,end) infinite',
        'hexl-ticker': 'hexl-ticker 24s steps(120,end) linear infinite',
      },
      borderRadius: { none: '0' },
    },
  },
} satisfies Config;`;

const CSS_VARS: string[][] = [
  ['--hexl-fg', '#000', 'ink'],
  ['--hexl-bg', '#FFF', 'ground'],
  ['--hexl-dim', '0.15', 'resting line opacity'],
  ['--hexl-mid', '0.45', 'intermediate step'],
  ['--hexl-step', '120ms', 'base clock'],
  ['--hexl-scale', '1', 'global scale'],
  ['--hexl-line-h', '8px', 'bar height'],
  ['--hexl-gap', '4px', 'bar gap'],
];

/* app.tsx — using a loader inside a pending button (usage.md). */
const APP_TSX = `import { BitScanner } from "@/components/loaders/bit-scanner";

export function SubmitButton() {
  const [pending, setPending] = useState(false);
  return (
    <button disabled={pending}>
      {pending ? <BitScanner state={26} size={24} showMeta={false} /> : "SUBMIT"}
    </button>
  );
}`;

/* data-invert on any ancestor swaps the color space (usage.md). */
const INVERT_HTML = `<section data-invert> <!-- everything inside renders negative -->
  <InversionPulse mode="colorspace" />
</section>`;

const REDUCED_CSS = `@media (prefers-reduced-motion: reduce) { :root { --hexl-step: 0ms; } }`;

const STATIC_FRAMES: string[][] = [
  ['Bit-Scanner', 'full glyph, no active row'],
  ['Mutating Matrix', 'first sequence state'],
  ['Inversion Pulse', 'normal colorspace, full progress'],
];

export default function DocsUsage() {
  return (
    <DocsShell toc={TOC}>
      {/* ------------------------------ PAGE HEADER ------------------------------ */}
      <header>
        <Reveal>
          <Kicker>GETTING STARTED / USAGE</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-grotesk text-display-md uppercase">USAGE</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[62ch] text-body">
            Install one loader, copy the code, and make it yours. The registry is shadcn-compatible;
            the CLI copies source files into your repository. There is no package to depend on.
          </p>
        </Reveal>
      </header>

      {/* ---------------------------- INSTALL A LOADER --------------------------- */}
      <section id="install-a-loader" className="mt-16 scroll-mt-20">
        <SectionHead index={1} title="INSTALL A LOADER" />
        <Reveal delay={100} className="mt-6">
          <TypedCodeBlock packageManager language="bash" code="shadcn@latest add @hexloaders/bit-scanner" />
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            The command resolves the registry item, copies loaders/bit-scanner.tsx into your
            components directory, and reports the CSS variables the loader reads. Nothing is added
            to node_modules.
          </p>
        </Reveal>
        <Reveal delay={300} className="mt-6">
          <CodeBlock filename="components.json" language="json" code={COMPONENTS_JSON} />
        </Reveal>
        <Reveal delay={400} className="mt-6">
          <LedgerNote>
            ONE COMMAND PER LOADER. Sixty-four states, sixty-four files. Install only what you ship.
          </LedgerNote>
        </Reveal>
      </section>

      {/* ------------------------------- CONFIGURE ------------------------------- */}
      <section id="configure" className="mt-16 scroll-mt-20">
        <SectionHead index={2} title="CONFIGURE" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            Loaders read a small set of CSS custom properties. Define them once in globals.css and
            every installed loader obeys them.
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <CodeBlock filename="globals.css" language="css" code={CSS_TOKENS_BLOCK} />
        </Reveal>
        <Reveal delay={240} className="mt-6">
          <CodeBlock filename="tailwind.config.ts" language="tsx" code={TAILWIND_EXCERPT} />
        </Reveal>
        <Reveal delay={320} className="mt-6">
          <LedgerTable columns={['VARIABLE', 'DEFAULT', 'EFFECT']} rows={CSS_VARS} />
        </Reveal>
      </section>

      {/* ---------------------------------- USE ---------------------------------- */}
      <section id="use" className="mt-16 scroll-mt-20">
        <SectionHead index={3} title="USE" />
        <Reveal delay={80} className="mt-6">
          <CodeBlock filename="app.tsx" language="tsx" code={APP_TSX} />
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            Every loader accepts state, size, invert, showMeta (where applicable), className, and
            spreads the rest onto the root. Sizing is preferential through CSS variables so a
            parent can scale a whole tree of loaders at once.
          </p>
        </Reveal>
      </section>

      {/* ----------------------------- THEME & INVERT ---------------------------- */}
      <section id="theme-and-invert" className="mt-16 scroll-mt-20">
        <SectionHead index={4} title="THEME & INVERT" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            There is no dark mode — there is inversion. Set data-invert on any ancestor (or pass
            the invert prop) and the color space swaps instantly. Because loaders only read
            --hexl-fg and --hexl-bg, inversion is free.
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <CodeBlock filename="invert.html" language="text" code={INVERT_HTML} />
        </Reveal>
        <Reveal delay={240} className="mt-6">
          <InvertStrip />
        </Reveal>
      </section>

      {/* ----------------------------- REDUCED MOTION ---------------------------- */}
      <section id="reduced-motion" className="mt-16 scroll-mt-20">
        <SectionHead index={5} title="REDUCED MOTION" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            Every loader ships a static frame. When prefers-reduced-motion is detected, --hexl-step
            resolves to 0ms and animations collapse to their representative frame. You can also
            force it:
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <CodeBlock filename="globals.css" language="css" code={REDUCED_CSS} />
        </Reveal>
        <Reveal delay={240} className="mt-6">
          <PropsTable
            rows={[
              {
                prop: 'reducedMotion',
                type: '"static" | "auto"',
                default: '"auto"',
                description: '"static" forces the representative frame; "auto" follows the media query.',
              },
            ]}
          />
        </Reveal>
        <Reveal delay={320} className="mt-6">
          <LedgerTable columns={['LOADER', 'STATIC FRAME']} rows={STATIC_FRAMES} />
        </Reveal>
      </section>

      {/* ------------------------------ CLI ROADMAP ------------------------------ */}
      <section id="cli-roadmap" className="mt-16 scroll-mt-20">
        <SectionHead index={6} title="CLI ROADMAP" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            Phase 1 works today through the shadcn CLI. The dedicated hexloaders CLI removes the
            last friction: discovery, batch installs, and variant transforms.
          </p>
        </Reveal>
        <div className="mt-6">
          <Roadmap />
        </div>
      </section>

      <DocsPager
        prev={{ to: '/docs/architecture', label: 'ARCHITECTURE' }}
        next={{ to: '/docs/manual-setup', label: 'MANUAL SETUP' }}
      />
    </DocsShell>
  );
}
