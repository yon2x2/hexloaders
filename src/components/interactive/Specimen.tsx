/**
 * HEXLOADERS — Specimen (page-local, showcase)
 * A framed UI vignette cell: header row (title + context tag), live vignette
 * area, footer row (loader slug + install command, click to copy). Viewport
 * gating is hard on/off — vignettes only run while visible.
 */

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { bySlug } from '@/lib/registry';
import { copyText } from '@/components/CodeBlock';
import { useReveal, useVisible } from './hooks';

/** Snap-in reveal wrapper (steps(2) 240ms via .hexl-reveal, optional stagger). */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`hexl-reveal${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export interface SpecimenProps {
  title: string;
  /** Context tag, e.g. 'CHECKOUT'. */
  context: string;
  /** Registry slug of the loader on duty. */
  slug: string;
  /** Filtered out → opacity 0.15 + freeze (instant, no fade). */
  dimmed?: boolean;
  /** Vignette body; receives `active` (visible && !dimmed) to gate motion. */
  children: (active: boolean) => ReactNode;
}

export default function Specimen({ title, context, slug, dimmed = false, children }: SpecimenProps) {
  const [ref, visible] = useVisible<HTMLDivElement>(0.2);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const meta = bySlug(slug);
  const active = visible && !dimmed;

  const onCopy = async () => {
    if (!meta?.install) return;
    await copyText(meta.install);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <figure
      ref={ref}
      inert={dimmed ? true : undefined}
      className={`m-0 flex break-inside-avoid flex-col border border-hexl-fg bg-hexl-bg text-hexl-fg${dimmed ? ' opacity-[0.15]' : ''}`}
      aria-label={`${title} — specimen using ${slug}`}
    >
      <header className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-hexl-fg px-3 py-2">
        <span className="font-mono text-mono-label uppercase">{title}</span>
        <span className="font-mono text-mono-micro uppercase">CONTEXT: {context}</span>
      </header>
      <div className="flex min-h-56 items-center justify-center p-4 sm:p-8">{children(active)}</div>
      <button
        type="button"
        onClick={onCopy}
        disabled={!meta?.install}
        title={meta?.install ? 'Copy install command' : 'Manual source available on the loader page'}
        aria-live="polite"
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-between gap-3 border-t border-hexl-fg px-3 py-2 font-mono text-mono-micro uppercase enabled:hover:bg-hexl-fg enabled:hover:text-hexl-bg"
      >
        <span className="shrink-0">{copied ? 'COPIED' : slug}</span>
        <span className="truncate opacity-[0.55]">{meta?.install ?? 'MANUAL SOURCE'}</span>
      </button>
    </figure>
  );
}
