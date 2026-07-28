/**
 * HEXLOADERS — DocsManualSetup `/docs/manual-setup`
 * The copy-paste workflow: no CLI, no registry — lift the files directly.
 * Every CodeBlock is fed from the ?raw aggregates in src/lib/sources.ts —
 * never hand-duplicated source.
 */

import { useState } from 'react';
import DocsShell from '@/components/DocsShell';
import type { TocItem } from '@/components/DocsShell';
import Kicker from '@/components/Kicker';
import CodeBlock from '@/components/CodeBlock';
import BitScanner from '@/registry/loaders/bit-scanner';
import { CSS_TOKENS_BLOCK, LOADER_SOURCES } from '@/lib/sources';
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
  { id: 'step-1-the-loader', label: 'Step 1 — Copy listed files' },
  { id: 'step-2-variables', label: 'Step 2 — Theme overrides' },
  { id: 'step-3-verify', label: 'Step 3 — Verify' },
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
            Copy the exact files listed on a loader page, keep their relative paths, and own every
            line in your repository.
          </p>
        </Reveal>
      </header>

      {/* SEC.01 — When to go manual */}
      <DocSection id="when-to-go-manual" index={1} title="When to go manual">
        <LedgerList items={WHEN_MANUAL} stagger={80} />
      </DocSection>

      {/* SEC.02 — Step 1: Copy the loader's listed files */}
      <DocSection id="step-1-the-loader" index={2} title="Step 1: Copy the listed files">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-8">
          <div className="min-w-0">
            <Reveal>
              <p className="max-w-[62ch] text-body-sm">
                A loader page lists its exact manual file set. Bit-Scanner is the single-file
                example below; shared mechanic presets list both their component and hex-glyph
                files, each with its own path and copy action.
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
                Shared glyph source — copy this only when the selected loader page lists it.
                Bit-Scanner stays single-file and does not need it.
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

      {/* SEC.03 — Step 2: Optional theme overrides */}
      <DocSection id="step-2-variables" index={3} title="Step 2: Theme overrides (optional)">
        <Reveal>
          <p className="max-w-[62ch] text-body-sm">
            Every loader includes safe black-and-white defaults. Add this block only when you want
            one shared place to override its color, spacing, or clock tokens.
          </p>
        </Reveal>
        <Reveal className="mt-6">
          <CodeBlock code={CSS_TOKENS_BLOCK} filename="globals.css" language="css" />
        </Reveal>
        <Reveal className="mt-6">
          <LedgerNote>
            {'REDUCED MOTION IS BUILT INTO EACH COMPONENT — keep its prefers-reduced-motion handling intact when editing the source.'}
          </LedgerNote>
        </Reveal>
      </DocSection>

      {/* SEC.04 — Step 3: Verify */}
      <DocSection id="step-3-verify" index={4} title="Step 3: Verify">
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
