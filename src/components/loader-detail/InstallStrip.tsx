/**
 * HEXLOADERS — InstallStrip (loader-detail local)
 * Single-row install command strip: PM tabs (npm/pnpm/yarn/bun), the command
 * typed-in at 2 chars per 40ms tick with a blinking block cursor, COPY button
 * with a hard COPIED swap (1200ms). No fades, instant everything.
 */

import { useEffect, useRef, useState } from 'react';
import { copyText } from '@/components/CodeBlock';

type Pm = 'npm' | 'pnpm' | 'yarn' | 'bun';
const PMS: Pm[] = ['npm', 'pnpm', 'yarn', 'bun'];
const PM_PREFIX: Record<Pm, string> = {
  npm: 'npx ',
  pnpm: 'pnpm dlx ',
  yarn: 'yarn dlx ',
  bun: 'bunx ',
};

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface InstallStripProps {
  /** Bare command after the PM prefix, e.g. "shadcn@latest add owner/repo/bit-scanner". */
  command: string;
  className?: string;
}

export default function InstallStrip({ command, className }: InstallStripProps) {
  const [pm, setPm] = useState<Pm>('npm');
  const [n, setN] = useState(0);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const full = `${PM_PREFIX[pm]}${command}`;

  useEffect(() => {
    if (reducedMotion()) {
      setN(full.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 2;
      setN(Math.min(i, full.length));
      if (i >= full.length) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [full]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    await copyText(full);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={`flex h-14 items-stretch justify-between${className ? ` ${className}` : ''}`}>
      <div className="flex items-stretch" role="tablist" aria-label="Package manager">
        {PMS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pm === p}
            onClick={() => setPm(p)}
            className={`border-r border-hexl-fg px-3 font-mono text-mono-label uppercase${
              pm === p ? ' bg-hexl-fg text-hexl-bg' : ''
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 items-center truncate px-4 font-mono text-mono-data" aria-live="polite">
        <span className="truncate">{full.slice(0, n)}</span>
        <span aria-hidden="true" className="hexl-cursor ml-1 shrink-0">
          ▮
        </span>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
      >
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}
