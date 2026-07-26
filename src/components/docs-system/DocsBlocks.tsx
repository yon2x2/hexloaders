/**
 * HEXLOADERS — docs-system ledger primitives (page-local, design.md §4/§10).
 * SectionHead (numbered SEC kicker + index glyph + docs H2), LedgerNote,
 * LedgerTable, BulletGlyph (3-line mini-glyph list marker), DocsPager,
 * TypedCodeBlock (terminal type-in wrapper around the shared CodeBlock).
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import CodeBlock from '@/components/CodeBlock';
import type { CodeBlockProps } from '@/components/CodeBlock';
import HexGlyph from '@/registry/loaders/hex-glyph';
import Reveal from '@/components/docs-foundation/Reveal';
import { reducedMotion } from '@/components/docs-foundation/motion';

/* ------------------------------- SectionHead ------------------------------ */

/** Numbered docs section opener: SEC.nn + small glyph of its own binary index. */
export function SectionHead({ index, title }: { index: number; title: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-3 font-mono text-mono-label uppercase">
        <HexGlyph value={index & 63} size={16} aria-hidden="true" />
        <span className="shrink-0">SEC.{String(index).padStart(2, '0')}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-hexl-fg" />
      </div>
      <h2 className="mt-4 font-grotesk text-head uppercase">{title}</h2>
    </Reveal>
  );
}

/* ------------------------------- LedgerNote ------------------------------- */

/** Mono-micro hairline box note. */
export function LedgerNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`border border-hexl-fg p-3 font-mono text-mono-micro uppercase${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------- LedgerTable ------------------------------ */

const COLS: Record<number, string> = {
  2: 'grid-cols-[1fr_2fr]',
  3: 'grid-cols-[1.2fr_0.8fr_2fr]',
  4: 'grid-cols-[1fr_1.2fr_1fr_2fr]',
};

/** Generic ledger table: uppercase header row, mono-data rows, row hover invert. */
export function LedgerTable({
  columns,
  rows,
  className,
}: {
  columns: string[];
  rows: string[][];
  className?: string;
}) {
  const cols = COLS[columns.length] ?? COLS[2];
  return (
    <div className={`border border-hexl-fg font-mono text-mono-data${className ? ` ${className}` : ''}`}>
      <div className={`grid ${cols} border-b border-hexl-fg`}>
        {columns.map((c, i) => (
          <div
            key={c}
            className={`px-3 py-2 text-mono-micro uppercase${i > 0 ? ' border-l border-hexl-fg' : ''}`}
          >
            {c}
          </div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div
          key={ri}
          className={`grid ${cols} border-b border-hexl-fg last:border-b-0 hover:bg-hexl-fg hover:text-hexl-bg`}
        >
          {r.map((cell, ci) => (
            <div key={ci} className={`px-3 py-2${ci > 0 ? ' border-l border-hexl-fg' : ''}`}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- BulletGlyph ------------------------------ */

/** 3-line mini-glyph docs list marker (design.md §6). Pattern = low 3 bits of i. */
export function BulletGlyph({ i }: { i: number }) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true" className="mt-1 shrink-0">
      {[0, 1, 2].map((r) => {
        const bit = (i >> r) & 1;
        const y = 8 - r * 4;
        return bit === 1 ? (
          <rect key={r} x={0} y={y} width={12} height={2} fill="currentColor" />
        ) : (
          <g key={r}>
            <rect x={0} y={y} width={5} height={2} fill="currentColor" />
            <rect x={7} y={y} width={5} height={2} fill="currentColor" />
          </g>
        );
      })}
    </svg>
  );
}

/** Bulleted mono-data list with mini-glyph markers. */
export function GlyphList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-2 font-mono text-mono-data${className ? ` ${className}` : ''}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <BulletGlyph i={i + 1} />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------- DocsPager ------------------------------- */

export interface PagerLink {
  to: string;
  label: string;
}

/** Prev/next ledger cards (design.md §10 Pager): hover invert, hard cut. */
export function DocsPager({ prev, next }: { prev?: PagerLink; next?: PagerLink }) {
  const cell = 'hexl-cell block p-4';
  return (
    <nav aria-label="Pager" className="mt-16 grid grid-cols-2 border border-hexl-fg">
      {prev ? (
        <Link to={prev.to} className={`${cell} border-r border-hexl-fg`}>
          <span className="block font-mono text-mono-micro uppercase">← PREV</span>
          <span className="mt-1 block font-mono text-mono-label uppercase">{prev.label}</span>
        </Link>
      ) : (
        <div className="border-r border-hexl-fg" />
      )}
      {next ? (
        <Link to={next.to} className={`${cell} text-right`}>
          <span className="block font-mono text-mono-micro uppercase">NEXT →</span>
          <span className="mt-1 block font-mono text-mono-label uppercase">{next.label}</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

/* ----------------------------- TypedCodeBlock ----------------------------- */

/**
 * CodeBlock that types in on first visibility — 6 chars per 120ms tick for
 * short listings (terminal spec, design.md §5); longer listings raise the
 * chunk so the sweep stays under ~2.4s. Runs once; block cursor ▮ while typing.
 */
export function TypedCodeBlock(props: CodeBlockProps) {
  const { code } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const [n, setN] = useState(() => (reducedMotion() ? code.length : 0));
  const done = n >= code.length;

  useEffect(() => {
    if (done) return;
    const el = ref.current;
    if (!el) return;
    let interval: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const chunk = Math.max(6, Math.ceil(code.length / 20));
        interval = window.setInterval(() => {
          setN((x) => {
            if (x >= code.length) {
              window.clearInterval(interval);
              return x;
            }
            return Math.min(code.length, x + chunk);
          });
        }, 120);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(interval);
    };
  }, [code.length, done]);

  return (
    <div ref={ref}>
      <CodeBlock {...props} code={done ? code : `${code.slice(0, n)}▮`} />
    </div>
  );
}
