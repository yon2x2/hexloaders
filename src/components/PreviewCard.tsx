import { useState } from 'react';
import type { ReactNode } from 'react';
import CodeBlock from './CodeBlock';

type SizeKey = 'S' | 'M' | 'L';
const SIZES: Record<SizeKey, number> = { S: 48, M: 72, L: 96 };

export interface PreviewCardProps {
  /** Static node, or render-prop receiving the current control state. */
  preview: ReactNode | ((opts: { size: number; invert: boolean }) => ReactNode);
  code?: string;
  filename?: string;
  language?: 'bash' | 'tsx' | 'json' | 'css' | 'text';
  className?: string;
}

/**
 * Ledger block: PREVIEW | CODE tabs when source is available, plus invert
 * and S/M/L preview controls.
 */
export default function PreviewCard({ preview, code, filename, language = 'tsx', className }: PreviewCardProps) {
  const [tab, setTab] = useState<'PREVIEW' | 'CODE'>('PREVIEW');
  const [invert, setInvert] = useState(false);
  const [size, setSize] = useState<SizeKey>('M');

  const tabBtn = (t: 'PREVIEW' | 'CODE') =>
    `min-h-11 flex-1 px-4 py-2 font-mono text-mono-label uppercase sm:flex-none${tab === t ? ' bg-hexl-fg text-hexl-bg' : ''}`;
  const ctl = 'min-h-11 border-l border-hexl-fg px-3 py-2 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg';

  return (
    <div className={`border border-hexl-fg bg-hexl-bg text-hexl-fg${className ? ` ${className}` : ''}`}>
      <div className="flex min-h-11 flex-col items-stretch border-b border-hexl-fg sm:flex-row sm:justify-between">
        {code === undefined ? (
          <span className="flex min-h-11 items-center border-r border-hexl-fg px-4 py-2 font-mono text-mono-label uppercase">PREVIEW</span>
        ) : (
          <div className="flex min-h-11 w-full items-stretch sm:w-auto" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 'PREVIEW'} onClick={() => setTab('PREVIEW')} className={`${tabBtn('PREVIEW')} border-r border-hexl-fg`}>
              PREVIEW
            </button>
            <button type="button" role="tab" aria-selected={tab === 'CODE'} onClick={() => setTab('CODE')} className={`${tabBtn('CODE')} border-r border-hexl-fg`}>
              CODE
            </button>
          </div>
        )}
        <div className="flex min-h-11 w-full items-stretch border-t border-hexl-fg sm:w-auto sm:border-t-0">
          <button
            type="button"
            onClick={() => setInvert(!invert)}
            aria-pressed={invert}
            aria-label="Invert preview"
            className={`${ctl} flex-1 sm:flex-none${invert ? ' bg-hexl-fg text-hexl-bg' : ''}`}
          >
            INVERT
          </button>
          <div className="flex flex-1 items-stretch sm:flex-none" role="group" aria-label="Size">
            {(['S', 'M', 'L'] as SizeKey[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`${ctl} min-w-11 flex-1${size === s ? ' bg-hexl-fg text-hexl-bg' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'PREVIEW' ? (
        <div
          className={`flex min-h-[320px] items-center justify-center${invert ? ' hexl-invert bg-hexl-bg text-hexl-fg' : ''}`}
        >
          {typeof preview === 'function' ? preview({ size: SIZES[size], invert }) : preview}
        </div>
      ) : (
        <CodeBlock code={code ?? ''} filename={filename} language={language} showLineNumbers className="border-0" />
      )}
    </div>
  );
}
