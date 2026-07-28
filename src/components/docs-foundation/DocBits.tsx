/**
 * docs-foundation — DocBits
 * Small ledger building blocks shared by the docs-foundation pages
 * (Introduction / Manual Setup): section headers, glyph-bulleted ledger lists,
 * pager cards, the thin docs footer strip, a copy chip, and the injected
 * stepped keyframes used by doc-level motion (tally flip, figure assembly).
 * Pure #000/#FFF via the --hexl-* vars; steps() timing only; radius 0.
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router';
import HexGlyph from '@/registry/loaders/hex-glyph';
import { copyText } from '@/components/CodeBlock';
import Reveal from './Reveal';
import { reducedMotion } from './motion';

/* ------------------------- injected stepped keyframes ------------------------- */

const DOC_CSS = `
/* Tally flip — hard cut + one-frame -2px jump, steps() only. */
@keyframes hexl-doc-tally {
  0% { opacity: 0; transform: translateY(-2px); }
  50% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 1; transform: translateY(0); }
}
.hexl-doc-tally { opacity: 0; }
.hexl-doc-tally.is-on { animation: hexl-doc-tally 240ms steps(3, end) both; }

/* 6-bit figure — rows assemble bottom-to-top, hard cuts 100ms apart. */
@keyframes hexl-doc-line { from { opacity: 0; } to { opacity: 1; } }
.hexl-doc-fig .hexl-doc-row { opacity: 0; }
.hexl-doc-fig.is-on .hexl-doc-row { animation: hexl-doc-line 120ms steps(1, end) both; }

/* Figure leader lines draw scaleX 0→1 in steps(4) 240ms. */
@keyframes hexl-doc-leader { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.hexl-doc-fig .hexl-doc-leader { transform: scaleX(0); }
.hexl-doc-fig.is-on .hexl-doc-leader { animation: hexl-doc-leader 240ms steps(4, end) both; }

@media (prefers-reduced-motion: reduce) {
  .hexl-doc-tally,
  .hexl-doc-fig .hexl-doc-row,
  .hexl-doc-fig .hexl-doc-leader {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

/** Injects the doc-level stepped keyframes once per page. */
export function DocMotionStyle() {
  return <style>{DOC_CSS}</style>;
}

/* --------------------------------- tally flip --------------------------------- */

/** Value that tally-flips once when it first enters the viewport. */
export function TallyFlip({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      el.classList.add('is-on');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-on');
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style: CSSProperties = delay ? { animationDelay: `${delay}ms` } : {};
  return (
    <span ref={ref} className="hexl-doc-tally inline-block tabular-nums" style={style}>
      {children}
    </span>
  );
}

/* ------------------------------- mini-glyph bullet ------------------------------- */

/** 3-line mini glyph — docs list marker (design.md §6). Encodes the row index. */
export function MiniGlyph({ index }: { index: number }) {
  const v = index & 7; // 3 bits, LSB = bottom row
  const W = 12;
  const LINE_H = 2;
  const GAP = 1;
  const H = 3 * LINE_H + 2 * GAP; // 8
  const rows = [2, 1, 0]; // render top → bottom
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="shrink-0"
      style={{ display: 'block' }}
    >
      {rows.map((bit, row) => {
        const y = row * (LINE_H + GAP);
        const on = ((v >> bit) & 1) === 1;
        const half = (W - GAP) / 2;
        return on ? (
          <rect key={bit} x={0} y={y} width={W} height={LINE_H} fill="currentColor" />
        ) : (
          <g key={bit}>
            <rect x={0} y={y} width={half} height={LINE_H} fill="currentColor" />
            <rect x={half + GAP} y={y} width={half} height={LINE_H} fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

/** Ledger list — hairline rows, mini-glyph bullets, staggered snap-in. */
export function LedgerList({ items, stagger = 80 }: { items: string[]; stagger?: number }) {
  return (
    <ul>
      {items.map((text, i) => (
        <li key={i} className={i > 0 ? '-mt-px' : ''}>
          <Reveal delay={i * stagger} className="flex items-center gap-3 border border-hexl-fg px-3 py-3">
            <MiniGlyph index={i} />
            <span className="text-body-sm">{text}</span>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------- doc section --------------------------------- */

export interface DocSectionProps {
  id: string;
  /** 1-based section index — rendered as SEC.0n + a glyph of its binary value. */
  index: number;
  title: string;
  children: ReactNode;
}

/** Docs H2 section: binary-index glyph + SEC.0n kicker row + uppercase head. */
export function DocSection({ id, index, title, children }: DocSectionProps) {
  return (
    <section id={id} className="mt-16 scroll-mt-24 border-t border-hexl-fg pt-16 md:mt-24 md:pt-24">
      <Reveal>
        <div className="flex items-center gap-3">
          <HexGlyph value={index} size={16} aria-hidden="true" />
          <span className="font-mono text-mono-label uppercase">
            SEC.{String(index).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-hexl-fg" />
        </div>
        <h2 className="mt-4 font-grotesk text-head uppercase">{title}</h2>
      </Reveal>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ----------------------------------- pager ----------------------------------- */

export interface PagerLink {
  to: string;
  label: string;
  desc: string;
}

function PagerCell({ dir, link, span }: { dir: 'prev' | 'next'; link: PagerLink; span: boolean }) {
  return (
    <Link
      to={link.to}
      className={`group block bg-hexl-bg p-6 hover:bg-hexl-fg hover:text-hexl-bg${span ? ' sm:col-span-2' : ''}`}
    >
      <div className={`font-mono text-mono-micro uppercase${dir === 'next' ? ' text-right' : ''}`}>
        {dir === 'prev' ? '← PREV' : 'NEXT →'}
      </div>
      <div
        className={`mt-2 font-mono text-mono-label uppercase${dir === 'next' ? ' text-right' : ''}`}
      >
        {link.label}
      </div>
      <div className={`mt-2 text-body-sm${dir === 'next' ? ' text-right' : ''}`}>{link.desc}</div>
    </Link>
  );
}

/** Docs pager — prev/next ledger cards, hover = instant invert. */
export function DocsPager({ prev, next }: { prev?: PagerLink; next?: PagerLink }) {
  return (
    <nav
      aria-label="Pager"
      className="mt-16 grid gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-2"
    >
      {prev && <PagerCell dir="prev" link={prev} span={!next} />}
      {next && <PagerCell dir="next" link={next} span={!prev} />}
    </nav>
  );
}

/* ------------------------------- docs footer strip ------------------------------- */

const DOC_LINKS = [
  { to: '/docs/introduction', label: 'Introduction' },
  { to: '/docs/usage', label: 'Usage' },
  { to: '/docs/manual-setup', label: 'Manual setup' },
  { to: '/docs/architecture', label: 'Architecture' },
];

/** Thin docs footer strip: mono-micro colophon + doc links. */
export function DocsFooterStrip() {
  return (
    <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hexl-fg py-4">
      <span className="font-mono text-mono-micro uppercase">@hexloaders · v0.1.0 · MIT</span>
      <nav aria-label="Docs" className="flex flex-wrap gap-4">
        {DOC_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="inline-flex min-h-11 min-w-11 items-center font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg lg:min-h-0 lg:min-w-0"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/* ---------------------------------- copy chip ---------------------------------- */

/** Inline copy chip — label hard-swaps to COPIED for 1200ms. */
export function CopyChip({ command, label = 'COPY COMMAND' }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onCopy = async () => {
    await copyText(command);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-live="polite"
      className="min-h-11 min-w-11 shrink-0 border border-hexl-fg px-2 py-1 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
    >
      {copied ? 'COPIED' : label}
    </button>
  );
}
