/**
 * HEXLOADERS — ExampleCell (loader-detail local)
 * One live example composition: the real loader running in a ledger cell,
 * title + caption, and a COPY JSX chip that appears on hover/focus (hard
 * opacity swap, no fade) and copies the exact props.
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { copyText } from '@/components/CodeBlock';

export interface ExampleCellProps {
  title: string;
  caption: string;
  /** Exact JSX copied by the chip. */
  jsx: string;
  /** Render the cell in inverted (black) space. */
  dark?: boolean;
  children: ReactNode;
  className?: string;
}

export default function ExampleCell({ title, caption, jsx, dark = false, children, className }: ExampleCellProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    await copyText(jsx);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={`group flex flex-col border border-hexl-fg bg-hexl-bg text-hexl-fg${
        dark ? ' hexl-invert' : ''
      }${className ? ` ${className}` : ''}`}
    >
      <div className="flex aspect-[1/1.1] items-center justify-center overflow-hidden p-4">
        {children}
      </div>
      <div className="flex h-12 items-stretch justify-between border-t border-hexl-fg">
        <div className="flex min-w-0 flex-col justify-center px-3">
          <span className="font-mono text-mono-micro uppercase">{title}</span>
          <span className="truncate font-mono text-mono-micro uppercase opacity-[0.45]">{caption}</span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 border-l border-hexl-fg px-3 font-mono text-mono-label uppercase opacity-0 hover:bg-hexl-fg hover:text-hexl-bg focus-visible:opacity-100 group-hover:opacity-100"
        >
          {copied ? 'COPIED' : 'COPY JSX'}
        </button>
      </div>
    </div>
  );
}
