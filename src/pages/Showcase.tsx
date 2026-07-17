/**
 * HEXLOADERS — Showcase `/showcase`
 * Proof-of-context: the 64 loaders inside real interface situations — buttons,
 * boot sequences, tables, terminals, forms, page veils. Every specimen is live,
 * viewport-gated, and a single file installed from the registry.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MECHANICS } from '@/lib/registry';
import type { Mechanic } from '@/lib/registry';
import Kicker from '@/components/Kicker';
import Specimen, { Reveal } from '@/components/interactive/Specimen';
import { useVisible } from '@/components/interactive/hooks';
import {
  BootSequence,
  CheckoutButton,
  CliStatusLine,
  DataTableRefresh,
  FormValidation,
  PageTransition,
  SkeletonLedger,
  UploadCard,
} from '@/components/interactive/vignettes';
import type { VignetteProps } from '@/components/interactive/vignettes';
import type { ComponentType } from 'react';

type Filter = 'ALL' | Mechanic;

interface SpecimenDef {
  title: string;
  context: string;
  slug: string;
  mechanic: Mechanic;
  Component: ComponentType<VignetteProps>;
}

const SPECIMENS: SpecimenDef[] = [
  { title: 'CHECKOUT BUTTON', context: 'CHECKOUT', slug: 'bit-scanner', mechanic: 'SCAN', Component: CheckoutButton },
  { title: 'BOOT SEQUENCE', context: 'TERMINAL', slug: 'mutating-matrix', mechanic: 'SEQUENCE', Component: BootSequence },
  { title: 'DATA TABLE REFRESH', context: 'ADMIN', slug: 'tally-counter', mechanic: 'COUNT', Component: DataTableRefresh },
  { title: 'UPLOAD CARD', context: 'FILES', slug: 'six-stack', mechanic: 'STACK', Component: UploadCard },
  { title: 'PAGE TRANSITION', context: 'ROUTING', slug: 'inversion-pulse', mechanic: 'INVERT', Component: PageTransition },
  { title: 'FORM VALIDATION', context: 'FORMS', slug: 'bit-flip', mechanic: 'INVERT', Component: FormValidation },
  { title: 'SKELETON LEDGER', context: 'DATA', slug: 'falling-edge', mechanic: 'CASCADE', Component: SkeletonLedger },
  { title: 'CLI STATUS LINE', context: 'TERMINAL', slug: 'ripple-counter', mechanic: 'COUNT', Component: CliStatusLine },
];

const FILTERS: Filter[] = ['ALL', ...MECHANICS];

/* ------------------------- community strip (black band) ------------------------- */

function CommunityStrip() {
  const [ref, visible] = useVisible<HTMLElement>(0.3);
  const [blink, setBlink] = useState(-1); // reserved frames blink in sequence once

  useEffect(() => {
    if (!visible || blink >= 4) return;
    const id = window.setTimeout(() => setBlink((b) => b + 1), 120);
    return () => window.clearTimeout(id);
  }, [visible, blink]);

  return (
    <section ref={ref} data-invert="" className="border-t border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-end">
          <h2 className="font-grotesk text-display-md uppercase">YOUR BUILD HERE.</h2>
          <div>
            <p className="max-w-[62ch] text-body-sm">
              Shipped something with a hexloader? Open a PR with a screenshot and a link. The best specimens join this
              page — mechanic-tagged and credited.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="https://github.com/yon2x2/hexloaders"
                target="_blank"
                rel="noreferrer"
                className="border border-hexl-fg px-6 py-3 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
              >
                SUBMIT A SPECIMEN
              </a>
              <Link
                to="/"
                className="border border-hexl-fg px-6 py-3 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
              >
                BROWSE THE 64
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-px border border-hexl-fg bg-hexl-fg md:grid-cols-4">
          {[1, 2, 3, 4].map((n, i) => (
            <div
              key={n}
              className={`flex h-32 items-center justify-center bg-hexl-bg font-mono text-mono-micro uppercase${
                blink === i ? ' bg-hexl-fg text-hexl-bg' : ''
              }`}
            >
              RESERVED — n°{String(n).padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- page ----------------------------------- */

export default function Showcase() {
  const [filter, setFilter] = useState<Filter>('ALL');

  return (
    <div>
      {/* docs-style breadcrumb row */}
      <div className="border-b border-hexl-fg">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-2 font-mono text-mono-micro uppercase md:px-10">
          <span className="opacity-[0.45]">RESOURCES</span>
          <span aria-hidden="true">/</span>
          <span>SHOWCASE</span>
        </div>
      </div>

      {/* page header */}
      <header className="mx-auto max-w-[1440px] px-6 pb-16 pt-16 md:px-10 md:pt-24">
        <Reveal>
          <Kicker>■ SHOWCASE</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-grotesk text-display-lg uppercase">IN THE FIELD.</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[68ch] text-body">
            Loaders earning their keep — in buttons, boot sequences, tables, and terminals. Every specimen below is
            live. Every one is a single file installed from the registry.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter specimens by mechanic">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`animate-hexl-snap border border-hexl-fg px-3 py-2 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg${
                  filter === f ? ' bg-hexl-fg text-hexl-bg' : ''
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>
      </header>

      {/* specimen grid — masonry-like ledger, 2 columns desktop / 1 mobile */}
      <section className="mx-auto max-w-[1440px] px-6 pb-24 md:px-10" aria-label="Specimens">
        <div className="columns-1 gap-6 md:columns-2">
          {SPECIMENS.map((s, i) => {
            const dimmed = filter !== 'ALL' && s.mechanic !== filter;
            return (
              <Reveal key={s.slug} delay={(i % 2) * 80} className="mb-6 break-inside-avoid">
                <Specimen title={s.title} context={s.context} slug={s.slug} dimmed={dimmed}>
                  {(active) => <s.Component active={active} />}
                </Specimen>
              </Reveal>
            );
          })}
        </div>
      </section>

      <CommunityStrip />
    </div>
  );
}
