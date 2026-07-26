/**
 * HEXLOADERS — DocsIntroduction `/docs/introduction`
 * What/why: the 6-bit thesis (Leibniz 1703 anchor), the ownership model
 * ("install one, copy the code, make it yours"), stack fit, quick-start links.
 * DocsShell with ON THIS PAGE scroll-spy. Motion: snap-in reveals (steps(2),
 * 240ms), tally flips, one assembling figure — mechanical only, pure #000/#FFF.
 */

import { Link } from 'react-router';
import DocsShell from '@/components/DocsShell';
import type { TocItem } from '@/components/DocsShell';
import Kicker from '@/components/Kicker';
import PreviewCard from '@/components/PreviewCard';
import BitScanner from '@/registry/loaders/bit-scanner';
import { bySlug } from '@/lib/registry';
import Reveal from '@/components/docs-foundation/Reveal';
import {
  CopyChip,
  DocMotionStyle,
  DocSection,
  DocsFooterStrip,
  DocsPager,
  LedgerList,
  TallyFlip,
} from '@/components/docs-foundation/DocBits';
import FigureSixBit from '@/components/docs-foundation/FigureSixBit';

const TOC: TocItem[] = [
  { id: 'what-this-project-is', label: 'What this project is' },
  { id: 'the-6-bit-thesis', label: 'The 6-bit thesis' },
  { id: 'why-it-exists', label: 'Why it exists' },
  { id: 'how-it-fits-your-stack', label: 'How it fits your stack' },
  { id: 'start-here', label: 'Start here' },
];

const STATS: [string, string][] = [
  ['64', 'PRESETS'],
  ['11', 'COMPONENTS'],
  ['8', 'MECHANICS'],
  ['0', 'EXTRA DEPS'],
];

const WHY: string[] = [
  'Focused loading components instead of a full design framework.',
  'Open source code you own after installation — no package, no lock-in.',
  'Registry distribution that fits existing shadcn-style workflows.',
  'Primitives that adapt to your spacing, color, and motion tokens through CSS custom properties.',
];

const STACK: [string, string][] = [
  ['REACT 18+/19', '✓'],
  ['TYPESCRIPT STRICT', '✓'],
  ['TAILWIND 3.4', '✓'],
  ['VITE / NEXT / REMIX', '✓'],
  ['FRAMER / GSAP', 'NOT REQUIRED'],
];

type StartCard =
  | { to: string; label: string; desc: string }
  | { href: string; label: string; desc: string };

const START_CARDS: StartCard[] = [
  { to: '/docs/usage', label: 'USAGE', desc: 'Install your first loader in under a minute.' },
  { to: '/docs/architecture', label: 'ARCHITECTURE', desc: 'How 64 states become one dictionary.' },
  { href: '/#matrix', label: 'THE MATRIX', desc: 'Preview all 64 primitives live.' },
];

const INSTALL_CMD = bySlug('bit-scanner')?.install ?? 'npx shadcn@latest add yon2x2/hexloaders/bit-scanner';

/** Ledger link-card: hover = instant invert, arrow shifts 4px with a hard cut. */
function CardInner({ label, desc, index }: { label: string; desc: string; index: number }) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-mono-label uppercase">
          {label}{' '}
          <span aria-hidden="true" className="inline-block group-hover:translate-x-1">
            →
          </span>
        </span>
        <span aria-hidden="true" className="font-mono text-mono-micro">
          0{index + 1}
        </span>
      </div>
      <p className="mt-3 text-body-sm">{desc}</p>
    </>
  );
}

export default function DocsIntroduction() {
  return (
    <DocsShell toc={TOC}>
      <DocMotionStyle />

      {/* PAGE HEADER — snap-in steps(2) 240ms, stagger 80ms */}
      <header>
        <Reveal>
          <Kicker>GETTING STARTED / INTRODUCTION</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-grotesk text-display-md uppercase">INTRODUCTION</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[62ch] text-[18px] leading-[1.6]">
            HEXLOADERS is a component registry built around the 64 hexagrams — the earliest
            recorded 6-bit binary system. Install loaders from the registry and ship loading
            states that are designed, lightweight, and owned by you.
          </p>
        </Reveal>
      </header>

      {/* SEC.01 — What this project is */}
      <DocSection id="what-this-project-is" index={1} title="What this project is">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            HEXLOADERS follows the install model many teams already use with shadcn: pull a
            component into your codebase, then edit it like local code. Eleven real components
            produce 64 named presets — one per state of a 6-bit word — and stay compact on purpose
            so loading states blend into your UI language instead of forcing a separate aesthetic.
          </p>
        </Reveal>

        {/* ledger data row — cells snap-in staggered 60ms, values tally-flip once */}
        <div className="mt-8 grid grid-cols-2 gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-4">
          {STATS.map(([value, label], i) => (
            <div key={label} className="bg-hexl-bg px-4 py-6">
              <div className="font-mono text-head font-bold">
                <TallyFlip delay={i * 60}>{value}</TallyFlip>
              </div>
              <Reveal delay={i * 60}>
                <div className="mt-1 font-mono text-mono-micro uppercase">{label}</div>
              </Reveal>
            </div>
          ))}
        </div>
      </DocSection>

      {/* SEC.02 — The 6-bit thesis */}
      <DocSection id="the-6-bit-thesis" index={2} title="The 6-bit thesis">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            A hexagram is six lines, read bottom to top. A solid line is 1; a broken line is 0.
            Six lines give 2<sup>6</sup> = 64 states — an address space recorded millennia before
            Leibniz published his binary arithmetic in 1703 and recognized its mirror in the Fu Xi
            ordering. HEXLOADERS treats the hexagrams exactly as that: bits. Every preset renders,
            counts, scans, or inverts those bits through its component. Nothing here is symbolic;
            everything is structural.
          </p>
        </Reveal>
        <div className="mt-8">
          <FigureSixBit />
        </div>
      </DocSection>

      {/* SEC.03 — Why it exists */}
      <DocSection id="why-it-exists" index={3} title="Why it exists">
        <LedgerList items={WHY} stagger={80} />

        {/* the page's single live motion moment */}
        <Reveal className="mt-8">
          <PreviewCard
            preview={({ size, invert }) => <BitScanner size={size} invert={invert} />}
          />
          <div className="flex items-center justify-between gap-3 border border-t-0 border-hexl-fg px-3 py-2">
            <span className="font-mono text-mono-micro uppercase">
              BIT-SCANNER — STATE 26 · 011010 · 0 DEPS
            </span>
            <CopyChip command={INSTALL_CMD} />
          </div>
        </Reveal>
      </DocSection>

      {/* SEC.04 — How it fits your stack */}
      <DocSection id="how-it-fits-your-stack" index={4} title="How it fits your stack">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            The setup works best in React apps already using Tailwind CSS with a shadcn-compatible
            components.json. In that environment onboarding is three commands: add the registry,
            install a loader, style it to match your product. Without Tailwind, install manually —
            every loader degrades to plain CSS variables.
          </p>
        </Reveal>

        <Reveal className="mt-8">
          <div className="border border-hexl-fg font-mono text-mono-data">
            {STACK.map(([req, status], i) => (
              <div
                key={req}
                className={`flex items-center justify-between px-3 py-2 hover:bg-hexl-fg hover:text-hexl-bg${
                  i > 0 ? ' border-t border-hexl-fg' : ''
                }`}
              >
                <span>{req}</span>
                <span>{status}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </DocSection>

      {/* SEC.05 — Start here */}
      <DocSection id="start-here" index={5} title="Start here">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            64 states. One dictionary. Install one, copy the code, make it yours.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-3">
          {START_CARDS.map((card, i) => (
            <div key={card.label} className="bg-hexl-bg">
              <Reveal delay={i * 120} className="h-full">
                {'to' in card ? (
                  <Link
                    to={card.to}
                    className="group block h-full p-6 hover:bg-hexl-fg hover:text-hexl-bg"
                  >
                    <CardInner label={card.label} desc={card.desc} index={i} />
                  </Link>
                ) : (
                  <a
                    href={card.href}
                    className="group block h-full p-6 hover:bg-hexl-fg hover:text-hexl-bg"
                  >
                    <CardInner label={card.label} desc={card.desc} index={i} />
                  </a>
                )}
              </Reveal>
            </div>
          ))}
        </div>
      </DocSection>

      <DocsPager
        next={{
          to: '/docs/usage',
          label: 'USAGE',
          desc: 'Installation, configuration, and the distribution roadmap.',
        }}
      />

      <DocsFooterStrip />
    </DocsShell>
  );
}
