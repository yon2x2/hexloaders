/**
 * HEXLOADERS — DocsManualSetup `/docs/manual-setup`
 * The copy-paste workflow: no CLI, no registry — lift the files directly.
 * Every CodeBlock is fed from the ?raw aggregates (src/lib/sources.ts) or a
 * direct ?raw import of the canonical dictionary — never hand-duplicated
 * source. Pure #000/#FFF, steps() motion only, radius 0.
 */

import { useState } from 'react';
import DocsShell from '@/components/DocsShell';
import type { TocItem } from '@/components/DocsShell';
import Kicker from '@/components/Kicker';
import CodeBlock from '@/components/CodeBlock';
import BitScanner from '@/registry/loaders/bit-scanner';
import { CSS_TOKENS_BLOCK, LOADER_SOURCES } from '@/lib/sources';
import hexagramsSource from '@/lib/hexagrams.ts?raw';
import Reveal from '@/components/docs-foundation/Reveal';
import {
  DocMotionStyle,
  DocSection,
  DocsFooterStrip,
  DocsPager,
  LedgerList,
} from '@/components/docs-foundation/DocBits';
import TypedCodeBlock from '@/components/docs-foundation/TypedCodeBlock';

const TOC: TocItem[] = [
  { id: 'when-to-go-manual', label: 'When to go manual' },
  { id: 'step-1-variables', label: 'Step 1 — Variables' },
  { id: 'step-2-the-dictionary', label: 'Step 2 — The dictionary' },
  { id: 'step-3-the-loader', label: 'Step 3 — The loader' },
  { id: 'step-4-verify', label: 'Step 4 — Verify' },
];

const WHEN_MANUAL: string[] = [
  'Your project does not use Tailwind (loaders degrade to plain CSS variables).',
  'You want to vendor a loader inside a design-system package.',
  'You are auditing source before it touches your repository — good instinct.',
  'You are porting a loader to another framework. The contract below is the spec.',
];

const CHECKLIST: string[] = [
  'The glyph renders STATE 26 — pattern 011010, top to bottom.',
  'One row snaps to full opacity per tick, moving top to bottom.',
  'The six-step cycle uses hard cuts, never a glide.',
  'data-invert on a parent flips the color space instantly.',
  'With reduced motion, the glyph renders statically.',
];

/** Mono ledger note row. */
function LedgerNote({ children }: { children: string }) {
  return (
    <div className="border border-hexl-fg px-3 py-3 font-mono text-mono-data">{children}</div>
  );
}

/** Live Bit-Scanner in a small ledger cell — the code's output, always beside it. */
function LiveSpecimen() {
  return (
    <div className="border border-hexl-fg">
      <div className="flex items-center justify-between gap-4 border-b border-hexl-fg px-3 py-2 font-mono text-mono-micro uppercase">
        <span>LIVE SPECIMEN</span>
        <span>STATE 26 · 011010</span>
      </div>
      <div className="flex items-center justify-center p-6">
        <BitScanner size={96} />
      </div>
    </div>
  );
}

/** Square-checkbox verification ledger — instant hard-state toggles. */
function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  return (
    <ul className="border border-hexl-fg">
      {items.map((text, i) => (
        <li key={i} className={i > 0 ? 'border-t border-hexl-fg' : ''}>
          <button
            type="button"
            aria-pressed={done[i]}
            onClick={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))}
            className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-hexl-fg hover:text-hexl-bg"
          >
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 border border-current${done[i] ? ' bg-current' : ''}`}
            />
            <span className="font-mono text-mono-data">{text}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function DocsManualSetup() {
  return (
    <DocsShell toc={TOC}>
      <DocMotionStyle />

      {/* PAGE HEADER — snap-in steps(2) 240ms, stagger 80ms */}
      <header>
        <Reveal>
          <Kicker>GETTING STARTED / MANUAL SETUP</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-grotesk text-display-md uppercase">MANUAL SETUP</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[62ch] text-[18px] leading-[1.6]">
            Everything the CLI does, by hand. Three files, five minutes, full ownership.
          </p>
        </Reveal>
      </header>

      {/* SEC.01 — When to go manual */}
      <DocSection id="when-to-go-manual" index={1} title="When to go manual">
        <LedgerList items={WHEN_MANUAL} stagger={80} />
      </DocSection>

      {/* SEC.02 — Step 1: Variables */}
      <DocSection id="step-1-variables" index={2} title="Step 1: Variables">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            Add the variable block to your global stylesheet. Every loader reads these and nothing
            else.
          </p>
        </Reveal>
        <Reveal className="mt-6">
          <CodeBlock code={CSS_TOKENS_BLOCK} filename="globals.css" language="css" />
        </Reveal>
        <Reveal className="mt-6">
          <LedgerNote>
            {'NOTE — the last line of this block is the entire reduced-motion implementation: --hexl-step: 0ms parks every steps() animation on a static frame. Do not delete it.'}
          </LedgerNote>
        </Reveal>
      </DocSection>

      {/* SEC.03 — Step 2: The dictionary */}
      <DocSection id="step-2-the-dictionary" index={3} title="Step 2: The dictionary">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            Copy the encoding helpers and the dictionary. One file, no dependencies.
          </p>
        </Reveal>
        <Reveal className="mt-6">
          <CodeBlock code={hexagramsSource} filename="lib/hexagrams.ts" language="tsx" />
        </Reveal>
      </DocSection>

      {/* SEC.04 — Step 3: The loader (reference implementation) */}
      <DocSection id="step-3-the-loader" index={4} title="Step 3: The loader (reference implementation)">
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-8">
          <div>
            <Reveal>
              <p className="max-w-[62ch] text-body-sm">
                This is the entire component. Zero dependencies. The styles ship inside the file;
                the motion is one CSS animation with steps(6). Read it — it is short on purpose.
              </p>
            </Reveal>

            <Reveal className="mt-6 lg:hidden">
              <LiveSpecimen />
            </Reveal>

            <div className="mt-6">
              <TypedCodeBlock
                code={LOADER_SOURCES['bit-scanner']}
                filename="components/loaders/bit-scanner.tsx"
                language="tsx"
              />
            </div>

            <Reveal className="mt-8">
              <p className="max-w-[62ch] text-body-sm">
                Optional fourth file — the shared 6-bit glyph the mechanic templates compose from.
                Bit-Scanner inlines its own bars to stay single-file; copy the glyph when you
                start adding states.
              </p>
            </Reveal>
            <Reveal className="mt-6">
              <CodeBlock
                code={LOADER_SOURCES['hex-glyph']}
                filename="components/loaders/hex-glyph.tsx"
                language="tsx"
              />
            </Reveal>

            <Reveal className="mt-8">
              <LedgerNote>
                {'THE CONTRACT — role="status", aria-label, data-invert, CSS vars only, steps() only, static frame under prefers-reduced-motion. Any loader honoring this is registry-compatible.'}
              </LedgerNote>
            </Reveal>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LiveSpecimen />
            </div>
          </div>
        </div>
      </DocSection>

      {/* SEC.05 — Step 4: Verify */}
      <DocSection id="step-4-verify" index={5} title="Step 4: Verify">
        <Reveal>
          <Checklist items={CHECKLIST} />
        </Reveal>
        <Reveal className="mt-6">
          <p className="max-w-[62ch] text-body-sm">
            If all five hold, the file is yours now. Rename it, restyle it, delete the metadata
            rail. That is the point.
          </p>
        </Reveal>
      </DocSection>

      <DocsPager
        prev={{
          to: '/docs/usage',
          label: 'USAGE',
          desc: 'Installation, configuration, and customization.',
        }}
        next={{
          to: '/loaders/bit-scanner',
          label: 'BIT-SCANNER (COMPONENT PAGE)',
          desc: 'STATE 26 · 011010 · MECHANIC: SCAN.',
        }}
      />

      <DocsFooterStrip />
    </DocsShell>
  );
}
