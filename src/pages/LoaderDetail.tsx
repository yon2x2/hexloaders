/**
 * HEXLOADERS — LoaderDetail `/loaders/:slug`
 * The preset page template instantiated for all 64 named states (loader-detail.md).
 * Data-driven from registry.ts + hexagrams.ts: header ledger block, live
 * PreviewCard (the same component delivered by install), genuine copy-pasteable
 * sources via loaderFilesFor, install block, props, CSS vars, examples,
 * related states, prev/next pager. Flagships get the MECHANIC deep-dive
 * (cycle diagrams, rhythm patterns, reduced-motion frames).
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import DocsShell from '@/components/DocsShell';
import type { TocItem } from '@/components/DocsShell';
import Kicker from '@/components/Kicker';
import Badge from '@/components/Badge';
import CodeBlock from '@/components/CodeBlock';
import PreviewCard from '@/components/PreviewCard';
import PropsTable from '@/components/PropsTable';
import type { PropRow } from '@/components/PropsTable';
import { bySlug, byValue } from '@/lib/registry';
import type { LoaderMeta, Mechanic } from '@/lib/registry';
import { HEX_NAMES, kingwenOf } from '@/lib/hexagrams';
import { loaderFilesFor, presetMetadataFor } from '@/lib/sources';
import { GENERATED_LOADERS } from '@/lib/generated-loaders';
import { publicComponentFor } from '@/lib/registry';
import LoaderLive from '@/components/loader-detail/LoaderLive';
import InstallStrip from '@/components/loader-detail/InstallStrip';
import ExampleCell from '@/components/loader-detail/ExampleCell';
import CssVarsTable from '@/components/loader-detail/CssVarsTable';
import type { CssVarRow } from '@/components/loader-detail/CssVarsTable';
import RelatedRow from '@/components/loader-detail/RelatedRow';
import DeepDive from '@/components/loader-detail/DeepDive';
import BitScanner from '@/registry/loaders/bit-scanner';
import MutatingMatrix from '@/registry/loaders/mutating-matrix';
import InversionPulse from '@/registry/loaders/inversion-pulse';

const pad = (n: number) => String(n).padStart(2, '0');

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function SubLabel({ children }: { children: ReactNode }) {
  return <div className="mb-3 font-mono text-mono-label uppercase opacity-[0.55]">{children}</div>;
}

/* ------------------------------ registry data ------------------------------ */

/** Cycle length (ms at the 120ms base clock) of each loader mechanic. */
const MECHANIC_CYCLE: Record<Mechanic, number> = {
  SCAN: 960,
  SEQUENCE: 7680,
  INVERT: 240,
  SHIFT: 720,
  COUNT: 7680,
  STACK: 960,
  CASCADE: 960,
  STROBE: 960,
};

const GENERATED_DEFAULT: Record<Mechanic, number> = {
  SCAN: 7,
  SEQUENCE: 27,
  INVERT: 17,
  SHIFT: 36,
  COUNT: 18,
  STACK: 4,
  CASCADE: 2,
  STROBE: 0,
};

/** Component default states of the flagships (independent of registry n° — do not "fix"). */
const FLAGSHIP_STATE: Record<string, number | undefined> = {
  'bit-scanner': 26,
  'mutating-matrix': undefined, // cycles the whole space
  'inversion-pulse': 42,
};

/* -------------------------------- page copy -------------------------------- */

const FLAGSHIP_BODY: Record<string, string> = {
  'bit-scanner':
    'A static hexagram in a technical ledger. One row snaps from dim to full per tick, moving top to bottom in six discrete steps. A readout, not an ornament.',
  'mutating-matrix':
    'A bank of glyphs stepping through the state space on a shared clock. Each cell is offset by its index, so configurations sweep the bank diagonally. A system visibly computing.',
  'inversion-pulse':
    'The module snaps to negative on a programmable rhythm — color space, bit states, or both. Transitions are banned inside this component: state changes are instantaneous, like a relay, not a fade.',
};

/** Generation-note formula: [Mechanic verb] applied to [state pattern]. [One structural sentence]. */
const MECHANIC_BODY: Record<Mechanic, string> = {
  SCAN: 'Scan applied to {b}. One row snaps from dim to full per tick, moving top to bottom in six discrete steps.',
  SEQUENCE: 'Sequence applied to {b}. The glyph walks the King Wen order one position per tick — the historical permutation as a clock.',
  INVERT: 'Inversion applied to {b}. Every line negates on the clock — Yang opens, Yin closes, zero transition.',
  SHIFT: 'Shift applied to {b}. Lines rotate like a register, one position per clock tick.',
  COUNT: 'Count applied to {b}. The state increments by one per tick, rolling over at 64 — an odometer in six bits.',
  STACK: 'Stack applied to {b}. Lines build bottom to top out of the dim field, hold, and reset.',
  CASCADE: 'Cascade applied to {b}. A propagation wave travels bottom to top, one row per tick, then breaks.',
  STROBE: 'Strobe applied to {b}. The register blinks between full (63) and empty (0) in hard beats around its resting value.',
};

function specLineFor(meta: LoaderMeta, kw: number): string {
  if (meta.slug === 'bit-scanner') return `STATE 26 · BINARY 011010 · KW n°${kw} · CYCLE 960MS · MECHANIC SCAN`;
  if (meta.slug === 'mutating-matrix') return `STATES 0–63 · INTERVAL 120MS · KW n°${kw} · MECHANIC SEQUENCE`;
  if (meta.slug === 'inversion-pulse')
    return `STATE 42 · BINARY 101010 · KW n°${kw} · PATTERN [7,1,7,1,3,3] · MECHANIC INVERT`;
  return `STATE ${meta.value} · BINARY ${meta.binary} · KW n°${kw} · CYCLE ${MECHANIC_CYCLE[meta.mechanic]}MS · MECHANIC ${meta.mechanic}`;
}

/* --------------------------------- tables ---------------------------------- */

function propRowsFor(meta: LoaderMeta): PropRow[] {
  const size: PropRow = {
    prop: 'size',
    type: 'number',
    default: '96',
    description: 'Glyph width px · height derives 17/16 × size',
  };
  const invert: PropRow = {
    prop: 'invert',
    type: 'boolean',
    default: 'false',
    description: 'Swap the module into inverted space',
  };
  const cls: PropRow = {
    prop: 'className',
    type: 'string',
    default: '—',
    description: 'Tailwind composition on the root',
  };
  const rest: PropRow = {
    prop: '...rest',
    type: 'HTMLAttributes',
    default: '—',
    description: 'Spread onto the root element',
  };

  if (meta.slug === 'bit-scanner') {
    return [
      { prop: 'value', type: 'number', default: '26', description: '6-bit value 0–63 · LSB = bottom line' },
      { prop: 'step', type: 'number', default: '120', description: 'ms per scan row (6 rows per sweep)' },
      { prop: 'showMeta', type: 'boolean', default: 'true', description: 'Renders the metadata rail (ST / R / binary)' },
      size,
      invert,
      cls,
      rest,
    ];
  }
  if (meta.slug === 'mutating-matrix') {
    return [
      { prop: 'mode', type: "'count' | 'kingwen' | 'random' | 'custom'", default: "'count'", description: 'Sequence source' },
      { prop: 'sequence', type: 'number[]', default: '—', description: 'Custom state list (mode custom)' },
      { prop: 'interval', type: 'number', default: '120', description: 'ms per state advance' },
      { prop: 'cells', type: '1 | 4 | 9', default: '9', description: 'Bank size · cell k renders sequence[i + k]' },
      { prop: 'seed', type: 'number', default: '1', description: 'Deterministic PRNG seed (mode random)' },
      { prop: 'size', type: 'number', default: '32', description: 'Glyph width per cell px' },
      { prop: 'showMeta', type: 'boolean', default: 'true', description: 'Renders the tally readout header' },
      cls,
      rest,
    ];
  }
  if (meta.slug === 'inversion-pulse') {
    return [
      { prop: 'mode', type: "'colorspace' | 'bitwise' | 'both'", default: "'both'", description: 'What gets negated' },
      { prop: 'pattern', type: 'number[]', default: '[7,1,7,1,3,3]', description: 'Rhythm: base-interval counts per phase' },
      { prop: 'interval', type: 'number', default: '120', description: 'Base interval ms' },
      { prop: 'value', type: 'number', default: '42', description: 'State to pulse (alternating reads best)' },
      size,
      invert,
      cls,
      rest,
    ];
  }
  return [
    {
      prop: 'value',
      type: 'number',
      default: String(GENERATED_DEFAULT[meta.mechanic]),
      description: '6-bit value 0–63 · LSB = bottom line',
    },
    { prop: 'step', type: 'number', default: '120', description: 'Base clock ms · all durations are multiples' },
    size,
    invert,
    cls,
    rest,
  ];
}

function cssVarRowsFor(meta: LoaderMeta): CssVarRow[] {
  const fg: CssVarRow = { variable: '--hexl-fg', defaultValue: '#000000', effect: 'Ink — bars, borders, readouts' };
  const bg: CssVarRow = { variable: '--hexl-bg', defaultValue: '#FFFFFF', effect: 'Module ground · swapped by inversion' };
  const step: CssVarRow = { variable: '--hexl-step', defaultValue: '120ms', effect: 'Base clock · every duration is a multiple' };
  const dim: CssVarRow = { variable: '--hexl-dim', defaultValue: '0.15', effect: 'Resting row opacity — never gray' };
  const mid: CssVarRow = { variable: '--hexl-mid', defaultValue: '0.45', effect: 'Leading-edge row opacity' };
  const lineH: CssVarRow = { variable: '--hexl-line-h', defaultValue: 'size / 8', effect: 'Row height — sizing is modular' };
  const gap: CssVarRow = { variable: '--hexl-gap', defaultValue: 'size / 16', effect: 'Row gap + Yin void + stage rhythm' };

  if (meta.slug === 'bit-scanner') return [fg, bg, step, dim, lineH, gap];
  if (meta.slug === 'mutating-matrix') {
    return [fg, bg, { variable: '--hexl-interval', defaultValue: '120ms', effect: 'State advance clock' }, gap];
  }
  if (meta.slug === 'inversion-pulse') return [fg, bg, gap];
  const rows = [fg, bg, step, gap];
  if (meta.mechanic === 'CASCADE') rows.push(mid);
  if (meta.mechanic === 'SCAN' || meta.mechanic === 'STACK' || meta.mechanic === 'CASCADE') rows.push(dim);
  return rows;
}

/* -------------------------------- examples --------------------------------- */

interface ExampleDef {
  title: string;
  caption: string;
  jsx: string;
  dark?: boolean;
  node: ReactNode;
}

function flagshipExamples(meta: LoaderMeta): ExampleDef[] {
  if (meta.slug === 'bit-scanner') {
    return [
      {
        title: 'BUTTON STATE',
        caption: 'inline, meta off',
        jsx: '<BitScanner size={24} showMeta={false} />',
        node: (
          <span className="inline-flex items-center gap-3 border border-hexl-fg px-3 py-2">
            <BitScanner size={24} showMeta={false} />
            <span className="font-mono text-mono-label uppercase">PROCESSING</span>
          </span>
        ),
      },
      {
        title: 'FULL LEDGER',
        caption: 'the readout as ornament',
        jsx: '<BitScanner size={128} value={42} />',
        node: <BitScanner size={128} value={42} />,
      },
      {
        title: 'INVERTED',
        caption: 'negative space, free of charge',
        jsx: '<BitScanner invert />',
        dark: true,
        node: <BitScanner size={72} invert />,
      },
    ];
  }
  if (meta.slug === 'mutating-matrix') {
    return [
      {
        title: 'COUNT',
        caption: 'the address space, running',
        jsx: '<MutatingMatrix mode="count" cells={9} />',
        node: <MutatingMatrix mode="count" cells={9} size={24} />,
      },
      {
        title: 'KING WEN',
        caption: 'the historical permutation',
        jsx: '<MutatingMatrix mode="kingwen" cells={9} />',
        node: <MutatingMatrix mode="kingwen" cells={9} size={24} />,
      },
      {
        title: 'SEEDED RANDOM',
        caption: 'deterministic noise',
        jsx: '<MutatingMatrix mode="random" cells={4} seed={7} />',
        node: <MutatingMatrix mode="random" cells={4} seed={7} size={28} />,
      },
    ];
  }
  return [
    {
      title: 'COLORSPACE',
      caption: 'processing, signaled by violence',
      jsx: '<InversionPulse mode="colorspace" />',
      node: <InversionPulse mode="colorspace" size={72} />,
    },
    {
      title: 'BITWISE',
      caption: 'Yang opens, Yin closes',
      jsx: '<InversionPulse mode="bitwise" />',
      node: <InversionPulse mode="bitwise" size={72} />,
    },
    {
      title: 'CUSTOM RHYTHM',
      caption: 'morse for machines',
      jsx: '<InversionPulse pattern={[3,1,1,1]} />',
      node: <InversionPulse pattern={[3, 1, 1, 1]} size={72} />,
    },
  ];
}

const GENERATED_CAPTION: Record<Mechanic, string> = {
  SCAN: 'six-step sweep + hold',
  SEQUENCE: 'kingwen walk from the registry state',
  INVERT: 'complement metronome',
  SHIFT: 'barrel rotation, one bit per tick',
  COUNT: 'the address space, counting',
  STACK: 'build, hold, reset',
  CASCADE: 'propagation wave, bottom to top',
  STROBE: '0/63 blink beats',
};

function generatedExamples(meta: LoaderMeta): ExampleDef[] {
  const G = GENERATED_LOADERS[meta.mechanic];
  const name = publicComponentFor(meta).name;
  return [
    {
      title: 'DEFAULT STATE',
      caption: GENERATED_CAPTION[meta.mechanic],
      jsx: `<${name} value={${meta.value}} />`,
      node: <G value={meta.value} size={64} />,
    },
    {
      title: 'SLOW CLOCK',
      caption: 'step 240 · half speed',
      jsx: `<${name} value={${meta.value}} step={240} />`,
      node: <G value={meta.value} size={64} step={240} />,
    },
    {
      title: 'INVERTED',
      caption: 'negative space, free of charge',
      jsx: `<${name} value={${meta.value}} invert />`,
      dark: true,
      node: <G value={meta.value} size={64} invert />,
    },
  ];
}

/* ---------------------------------- page ----------------------------------- */

export default function LoaderDetail() {
  const { slug } = useParams<{ slug: string }>();
  const meta = slug ? bySlug(slug) : undefined;

  const [stag, setStag] = useState(3);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowSource(false);
    if (reducedMotion()) {
      setStag(3);
      return;
    }
    setStag(0);
    const ids = [1, 2, 3].map((k) => window.setTimeout(() => setStag(k), 120 * k));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [slug]);

  useEffect(() => {
    document.title = meta ? `${meta.name} — HEXLOADERS` : 'UNKNOWN STATE — HEXLOADERS';
    return () => {
      document.title = 'HEXLOADERS — 64 open-source loaders for every app.';
    };
  }, [meta]);

  if (!meta) {
    return (
      <DocsShell>
        <div className="border border-hexl-fg">
          <div className="flex h-10 items-center justify-between border-b border-hexl-fg px-3 font-mono text-mono-label uppercase">
            <span>■ REGISTRY / NOT FOUND</span>
            <span>n°?? · OUT OF RANGE</span>
          </div>
          <div className="p-6">
            <h1 className="font-grotesk text-display-md uppercase">UNKNOWN STATE</h1>
            <p className="mt-6 max-w-[62ch] text-body-sm">
              No loader is registered at <span className="font-mono font-bold">{slug}</span>. The
              address space is six bits — it ends at STATE 63.
            </p>
            <Link
              to="/"
              className="mt-8 inline-block border border-hexl-fg px-4 py-3 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
            >
              ← RETURN TO THE MATRIX
            </Link>
          </div>
        </div>
      </DocsShell>
    );
  }

  const displayState = FLAGSHIP_STATE[meta.slug] ?? meta.value;
  const kw = kingwenOf(displayState);
  const [chinese, pinyin, wilhelm] = HEX_NAMES[kw - 1];

  const files = loaderFilesFor(meta.slug);
  const previewFile = files[0];
  const kb = `${(files.reduce((total, file) => total + file.source.length, 0) / 1024).toFixed(1)} KB`;

  const prev = byValue((meta.value + 63) % 64);
  const next = byValue((meta.value + 1) % 64);

  const toc: TocItem[] = [
    { id: 'preview', label: 'Preview' },
    ...(meta.flagship ? [{ id: 'mechanic', label: 'Mechanic' }] : []),
    { id: 'installation', label: 'Installation' },
    { id: 'props', label: 'Props' },
    { id: 'css-variables', label: 'CSS variables' },
    { id: 'examples', label: 'Examples' },
    { id: 'related', label: 'Related states' },
  ];

  const reveal = (i: number) => ` hexl-reveal${stag > i ? ' is-on' : ''}`;
  const examples = meta.flagship ? flagshipExamples(meta) : generatedExamples(meta);

  return (
    <DocsShell toc={toc}>
      {/* ------------------------------ header ledger block ------------------------------ */}
      <header className="border border-hexl-fg">
        <div className={`flex min-h-10 flex-col border-b border-hexl-fg sm:flex-row sm:items-center sm:justify-between sm:gap-3${reveal(0)}`}>
          <div className="min-w-0 break-words px-3 py-3 font-mono text-mono-label uppercase sm:truncate sm:py-0">
            LOADERS / {meta.mechanic} / {meta.slug.toUpperCase()}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-hexl-fg px-3 py-2 sm:border-t-0 sm:py-0">
            <Badge variant="solid">{meta.mechanic}</Badge>
            <Badge>0 DEPS</Badge>
            <Badge>{kb}</Badge>
            {meta.flagship && <Badge>BESPOKE SOURCE</Badge>}
          </div>
        </div>

        <div className={`flex min-h-40 flex-wrap items-center justify-between gap-6 p-6${reveal(1)}`}>
          <div className="min-w-0">
            <div className="font-mono text-mono-micro uppercase opacity-[0.55]">
              n°{pad(meta.value)} · {meta.registry ?? 'MANUAL SOURCE'}
            </div>
            <h1 className="mt-1 font-grotesk text-display-md uppercase">{meta.name}</h1>
            <p className="mt-3 font-mono text-mono-data">{specLineFor(meta, kw)}</p>
            <p className="mt-1 font-mono text-mono-micro uppercase opacity-[0.55]">
              {chinese} · {pinyin} · {wilhelm} · KING WEN n°{kw}
            </p>
          </div>
          <div className="shrink-0">
            <LoaderLive meta={meta} size={96} />
          </div>
        </div>

        <div className={`border-t border-hexl-fg${reveal(2)}`}>
          {meta.install ? (
            <InstallStrip command={meta.install.replace(/^npx /, '')} />
          ) : (
            <div className="flex h-14 items-center px-4 font-mono text-mono-label uppercase">
              MANUAL SOURCE AVAILABLE
            </div>
          )}
        </div>
      </header>

      {/* --------------------------------- preview --------------------------------- */}
      <section id="preview" className="mt-16 scroll-mt-20">
        <Kicker>■ PREVIEW</Kicker>
        <div className="mt-6">
          <PreviewCard
            preview={({ size, invert }) => <LoaderLive meta={meta} size={size} invert={invert} showMeta />}
            code={previewFile.source}
            filename={previewFile.path}
            language="tsx"
          />
        </div>
        <p className="mt-6 max-w-[62ch] text-body-sm">
          {meta.flagship ? FLAGSHIP_BODY[meta.slug] : MECHANIC_BODY[meta.mechanic].replace('{b}', meta.binary)}
        </p>
      </section>

      {/* ---------------------------- mechanic deep-dive ---------------------------- */}
      {meta.flagship && (
        <section id="mechanic" className="mt-16 scroll-mt-20">
          <Kicker>■ MECHANIC — {meta.mechanic}</Kicker>
          <div className="mt-6">
            <DeepDive slug={meta.slug} />
          </div>
        </section>
      )}

      {/* ------------------------------- installation ------------------------------- */}
      <section id="installation" className="mt-16 scroll-mt-20">
        <Kicker>■ INSTALLATION</Kicker>
        <div className="mt-6 space-y-8">
          {meta.install && (
            <div>
              <SubLabel>{'// CLI — GITHUB REGISTRY'}</SubLabel>
              <CodeBlock
                code={meta.install.replace(/^npx /, '')}
                packageManager
                language="bash"
                showLineNumbers={false}
              />
            </div>
          )}
          <div>
            <SubLabel>{'// MANUAL — COPY-PASTE, OWN THE FILE'}</SubLabel>
            <div className="border border-hexl-fg">
              <button
                type="button"
                onClick={() => setShowSource(!showSource)}
                aria-expanded={showSource}
                className="flex min-h-11 w-full items-center justify-between px-3 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
              >
                <span>{showSource ? 'HIDE FULL SOURCE' : 'SHOW FULL SOURCE'}</span>
                <span>{showSource ? '−' : '+'}</span>
              </button>
              {showSource && (
                <div className="border-t border-hexl-fg">
                  <div className="space-y-px bg-hexl-fg">
                    {files.map((file) => (
                      <CodeBlock
                        key={file.path}
                        code={file.source}
                        filename={file.path}
                        language="tsx"
                        className="border-0"
                      />
                    ))}
                  </div>
                  <div className="border-t border-hexl-fg px-3 py-2 font-mono text-mono-micro uppercase opacity-[0.55]">
                    SOURCE INCLUDED · 0 DEPENDENCIES · MIT
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <SubLabel>{'// PRESET METADATA'}</SubLabel>
            <CodeBlock code={presetMetadataFor(meta.slug)} filename="preset-metadata.json" language="json" />
          </div>
        </div>
      </section>

      {/* ---------------------------------- props ---------------------------------- */}
      <section id="props" className="mt-16 scroll-mt-20">
        <Kicker>■ PROPS</Kicker>
        <div className="mt-6">
          <PropsTable rows={propRowsFor(meta)} />
        </div>
      </section>

      {/* ------------------------------- css variables ------------------------------- */}
      <section id="css-variables" className="mt-16 scroll-mt-20">
        <Kicker>■ CSS VARIABLES</Kicker>
        <div className="mt-6">
          <CssVarsTable rows={cssVarRowsFor(meta)} />
        </div>
        <p className="mt-2 font-mono text-mono-micro uppercase opacity-[0.55]">
          OPTIONAL OVERRIDES — EACH COMPONENT INCLUDES SAFE FALLBACK VALUES.
        </p>
      </section>

      {/* --------------------------------- examples --------------------------------- */}
      <section id="examples" className="mt-16 scroll-mt-20">
        <Kicker>■ EXAMPLES</Kicker>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {examples.map((e) => (
            <ExampleCell key={e.title} title={e.title} caption={e.caption} jsx={e.jsx} dark={e.dark}>
              {e.node}
            </ExampleCell>
          ))}
        </div>
      </section>

      {/* ------------------------------- related states ------------------------------- */}
      <section id="related" className="mt-16 scroll-mt-20">
        <Kicker>■ RELATED STATES</Kicker>
        <div className="mt-6">
          <RelatedRow meta={meta} />
        </div>
      </section>

      {/* ----------------------------------- pager ----------------------------------- */}
      <nav aria-label="Pager" className="mt-16 grid grid-cols-2 gap-px border border-hexl-fg bg-hexl-fg">
        <Link to={`/loaders/${prev.slug}`} className="hexl-cell min-w-0 bg-hexl-bg px-4 py-4">
          <div className="font-mono text-mono-micro uppercase opacity-[0.55]">
            ← PREV · n°{pad(prev.value)}
          </div>
          <div className="mt-1 break-words font-grotesk text-head uppercase">{prev.name}</div>
        </Link>
        <Link to={`/loaders/${next.slug}`} className="hexl-cell min-w-0 bg-hexl-bg px-4 py-4 text-right">
          <div className="font-mono text-mono-micro uppercase opacity-[0.55]">
            NEXT · n°{pad(next.value)} →
          </div>
          <div className="mt-1 break-words font-grotesk text-head uppercase">{next.name}</div>
        </Link>
      </nav>
    </DocsShell>
  );
}
