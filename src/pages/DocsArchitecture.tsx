/**
 * HEXLOADERS — Architecture `/docs/architecture` (design/architecture.md).
 * The blueprint for the 64 variations: the 6-bit encoding spec, the generated
 * hexagrams.ts dictionary (CodeBlock fed from the ?raw source — never
 * hand-duplicated), the registry model, the 8 mechanics taxonomy with live
 * micro-demos, the interactive BitEditor + full 8×8 Fu Xi map, and the
 * "adding a new loader" recipe.
 */

import DocsShell from '@/components/DocsShell';
import Kicker from '@/components/Kicker';
import CodeBlock from '@/components/CodeBlock';
import BitEditor from '@/components/BitEditor';
import hexagramsRaw from '@/lib/hexagrams.ts?raw';
import { registryEntryFor } from '@/lib/sources';
import Reveal from '@/components/docs-foundation/Reveal';
import {
  SectionHead,
  LedgerNote,
  LedgerTable,
  DocsPager,
  TypedCodeBlock,
} from '@/components/docs-system/DocsBlocks';
import MechanicRows from '@/components/docs-system/MechanicRows';
import FuXiMap from '@/components/docs-system/FuXiMap';

const TOC = [
  { id: 'encoding', label: 'Encoding' },
  { id: 'the-dictionary', label: 'The dictionary' },
  { id: 'the-registry', label: 'The registry' },
  { id: 'mechanics', label: 'Mechanics' },
  { id: 'the-map', label: 'The 8×8 map' },
  { id: 'adding-a-loader', label: 'Adding a loader' },
];

/* encoding.ts — the full address space in one expression (architecture.md). */
const ENCODING_TS = `export type Line = 0 | 1; // 0 = Yin (broken) · 1 = Yang (solid)
export type Bits = [Line, Line, Line, Line, Line, Line]; // bottom → top

export const bitsOf = (value: number): Bits =>
  [0, 1, 2, 3, 4, 5].map((i) => ((value >> i) & 1) as Line) as Bits;

export const upperOf = (value: number) => (value >> 3) & 7; // matrix row
export const lowerOf = (value: number) => value & 7;        // matrix column
export const addressOf = (upper: number, lower: number) => (upper << 3) | lower;`;

/**
 * hexagrams.ts — excerpt. Sliced from the ?raw source of src/lib/hexagrams.ts
 * (always in sync, never hand-duplicated): everything except the HEX_NAMES
 * table, which is elided with a marker comment.
 */
const HEXAGRAMS_EXCERPT = (() => {
  const start = hexagramsRaw.indexOf('/** HEX_NAMES');
  const end = hexagramsRaw.indexOf('/** The 64 generated dictionary entries');
  if (start === -1 || end === -1 || end <= start) return hexagramsRaw.trim();
  return `${hexagramsRaw.slice(0, start).trimEnd()}

/** HEX_NAMES[position - 1] = [chinese, pinyin, wilhelm] — full 64-entry table ships in source. */

${hexagramsRaw.slice(end).trim()}`.trimEnd();
})();

/* registry/index.json — the Bit-Scanner entry, built from the registry meta. */
const BIT_SCANNER_ENTRY = registryEntryFor('bit-scanner');

const REGISTRY_FIELDS: string[][] = [
  ['slug', 'file + route name'],
  ['state', 'default 6-bit value'],
  ['mechanic', 'taxonomy tag for filtering'],
  ['files', 'paths copied into the consumer repo'],
  ['cssVars', 'variables the CLI injects if missing'],
  ['dependencies', 'always []'],
];

const ADD_STEPS: { title: string; text: string }[] = [
  { title: 'PICK A STATE', text: 'Choose its default value, 0–63. Mixed patterns read best in motion.' },
  { title: 'PICK A MECHANIC', text: 'One of the eight. Compose at most two.' },
  {
    title: 'WRITE THE FILE',
    text: 'Single .tsx, zero deps, consume bitsOf(state). Contract in the template below.',
  },
  {
    title: 'REGISTER IT',
    text: 'Add the entry to registry/index.json. The docs, matrix, and CLI pick it up from there.',
  },
];

/* loader-template.tsx — the condensed contract (architecture.md). */
const LOADER_TEMPLATE = `/** STATE 26 · 011010 · MECHANIC: SCAN · @hexloaders/my-loader */
import { bitsOf } from "./hexagrams";

export function MyLoader({ state = 26, size = 96, invert = false, className, ...rest }) {
  const bits = bitsOf(state); // bottom → top
  return (
    <div role="status" aria-label="Loading"
         style={{ "--hexl-scale": size / 96 } as React.CSSProperties}
         data-invert={invert || undefined} className={className} {...rest}>
      {/* render bits as SVG rects; animate with CSS steps() only */}
    </div>
  );
}`;

export default function DocsArchitecture() {
  return (
    <DocsShell toc={TOC}>
      {/* ------------------------------ PAGE HEADER ------------------------------ */}
      <header>
        <Reveal>
          <Kicker>GETTING STARTED / ARCHITECTURE</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-grotesk text-display-md uppercase">ARCHITECTURE</h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[62ch] text-body">
            Scalability here is not a plugin system — it is arithmetic. Sixty-four loaders are
            addressed, generated, and documented from one 6-bit encoding and one dictionary file.
          </p>
        </Reveal>
      </header>

      {/* ------------------------------- ENCODING -------------------------------- */}
      <section id="encoding" className="mt-16 scroll-mt-20">
        <SectionHead index={1} title="ENCODING" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            A hexagram is six lines, bottom to top. Yang (solid) = 1. Yin (broken) = 0. One hexagram
            is therefore one 6-bit integer, 0–63, with the least-significant bit at the bottom line.
            The upper trigram is bits 3–5; the lower trigram is bits 0–2. The full address space
            fits in one expression:
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <CodeBlock filename="encoding.ts" language="tsx" code={ENCODING_TS} />
        </Reveal>
        <Reveal delay={240} className="mt-6">
          <BitEditor size={200} />
        </Reveal>
      </section>

      {/* ----------------------------- THE DICTIONARY ---------------------------- */}
      <section id="the-dictionary" className="mt-16 scroll-mt-20">
        <SectionHead index={2} title="THE DICTIONARY" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            HEXAGRAMS is the single source of truth: 64 entries generated from the encoding plus
            one constant — the King Wen permutation, the historical sequence of the states.
            Everything else (bits, trigrams, print strings) is derived. Loaders never hardcode
            drawings; they consume bits.
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <TypedCodeBlock filename="hexagrams.ts — excerpt" language="tsx" code={HEXAGRAMS_EXCERPT} />
        </Reveal>
        <Reveal delay={240} className="mt-6">
          <LedgerNote>
            NOTE — Fu Xi order = binary counting 0→63. King Wen order = KING_WEN lookup. The grid on
            the home page ships in Fu XI order by default; the sort toggle re-indexes client-side.
          </LedgerNote>
        </Reveal>
      </section>

      {/* ------------------------------ THE REGISTRY ----------------------------- */}
      <section id="the-registry" className="mt-16 scroll-mt-20">
        <SectionHead index={3} title="THE REGISTRY" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            Each loader is an addressable registry item — the same contract shadcn uses. Metadata
            declares the default state, the mechanic, the files to copy, and the CSS variables it
            reads. The CLI (or a human) resolves the item, copies the files, and injects the
            variable block.
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <CodeBlock
            filename="registry/index.json — @hexloaders/bit-scanner"
            language="json"
            code={BIT_SCANNER_ENTRY}
          />
        </Reveal>
        <Reveal delay={240} className="mt-6">
          <LedgerTable columns={['FIELD', 'PURPOSE']} rows={REGISTRY_FIELDS} />
        </Reveal>
      </section>

      {/* ------------------------------- MECHANICS ------------------------------- */}
      <section id="mechanics" className="mt-16 scroll-mt-20">
        <SectionHead index={4} title="MECHANICS" />
        <Reveal delay={80}>
          <p className="mt-6 max-w-[62ch] text-body-sm">
            Every loader is one mechanic applied to bits. Eight mechanics cover the registry; each
            is a pure function of state and clock. Composing a new loader = picking a mechanic and
            a state.
          </p>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <MechanicRows />
        </Reveal>
      </section>

      {/* ------------------------------ THE 8×8 MAP ------------------------------ */}
      <section id="the-map" className="mt-16 scroll-mt-20">
        <SectionHead index={5} title="THE 8×8 MAP" />
        <Reveal delay={80} className="mt-6">
          <FuXiMap />
        </Reveal>
      </section>

      {/* ----------------------------- ADDING A LOADER --------------------------- */}
      <section id="adding-a-loader" className="mt-16 scroll-mt-20">
        <SectionHead index={6} title="ADDING A LOADER" />
        <Reveal delay={80} className="mt-6">
          <div className="border border-hexl-fg">
            {ADD_STEPS.map((s, i) => (
              <div
                key={s.title}
                className="grid grid-cols-[48px_1fr] border-b border-hexl-fg last:border-b-0"
              >
                <div className="flex items-center justify-center border-r border-hexl-fg font-mono text-mono-label">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="p-3">
                  <div className="font-mono text-mono-label uppercase">{s.title}</div>
                  <p className="mt-1 max-w-[62ch] text-body-sm">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={160} className="mt-6">
          <CodeBlock filename="loader-template.tsx" language="tsx" code={LOADER_TEMPLATE} />
        </Reveal>
      </section>

      <DocsPager
        prev={{ to: '/docs/introduction', label: 'INTRODUCTION' }}
        next={{ to: '/docs/usage', label: 'USAGE' }}
      />
    </DocsShell>
  );
}
