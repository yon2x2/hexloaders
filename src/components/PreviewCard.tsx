import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import CodeBlock from './CodeBlock';

type SizeKey = 'S' | 'M' | 'L';
type TabKey = 'PREVIEW' | 'CODE';
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
  const [tab, setTab] = useState<TabKey>('PREVIEW');
  const [invert, setInvert] = useState(false);
  const [size, setSize] = useState<SizeKey>('M');
  const tabsetId = useId();
  const previewTabRef = useRef<HTMLButtonElement>(null);
  const codeTabRef = useRef<HTMLButtonElement>(null);
  const previewTabId = `${tabsetId}-preview-tab`;
  const codeTabId = `${tabsetId}-code-tab`;
  const previewPanelId = `${tabsetId}-preview-panel`;
  const codePanelId = `${tabsetId}-code-panel`;

  const tabBtn = (t: TabKey) =>
    `min-h-11 px-0.5 py-2 font-mono text-[8px] uppercase min-[240px]:px-4 min-[240px]:text-mono-label sm:flex-none${tab === t ? ' bg-hexl-fg text-hexl-bg' : ''}`;
  const ctl = 'min-h-11 break-all border-l border-hexl-fg px-1 py-2 font-mono text-mono-micro uppercase leading-none hover:bg-hexl-fg hover:text-hexl-bg min-[240px]:px-3 min-[240px]:text-mono-label';
  const selectTab = (next: TabKey) => {
    setTab(next);
    (next === 'PREVIEW' ? previewTabRef : codeTabRef).current?.focus();
  };
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: TabKey | undefined;
    if (event.key === 'Home') next = 'PREVIEW';
    else if (event.key === 'End') next = 'CODE';
    else if (event.key.startsWith('Arrow')) next = tab === 'PREVIEW' ? 'CODE' : 'PREVIEW';
    if (!next) return;
    event.preventDefault();
    selectTab(next);
  };

  return (
    <div className={`border border-hexl-fg bg-hexl-bg text-hexl-fg${className ? ` ${className}` : ''}`}>
      <div className="flex min-h-11 flex-col items-stretch border-b border-hexl-fg sm:flex-row sm:justify-between">
        {code === undefined ? (
          <span className="flex min-h-11 items-center border-r border-hexl-fg px-4 py-2 font-mono text-mono-label uppercase">PREVIEW</span>
        ) : (
          <div className="grid min-h-11 w-full grid-cols-2 items-stretch sm:flex sm:w-auto" role="tablist" aria-label="Preview and source">
            <button
              ref={previewTabRef}
              id={previewTabId}
              type="button"
              role="tab"
              aria-selected={tab === 'PREVIEW'}
              aria-controls={previewPanelId}
              tabIndex={tab === 'PREVIEW' ? 0 : -1}
              onClick={() => setTab('PREVIEW')}
              onKeyDown={onTabKeyDown}
              className={`${tabBtn('PREVIEW')} border-r border-hexl-fg`}
            >
              PREVIEW
            </button>
            <button
              ref={codeTabRef}
              id={codeTabId}
              type="button"
              role="tab"
              aria-selected={tab === 'CODE'}
              aria-controls={codePanelId}
              tabIndex={tab === 'CODE' ? 0 : -1}
              onClick={() => setTab('CODE')}
              onKeyDown={onTabKeyDown}
              className={`${tabBtn('CODE')} border-r border-hexl-fg`}
            >
              CODE
            </button>
          </div>
        )}
        <div className="grid min-h-11 w-full grid-cols-4 items-stretch border-t border-hexl-fg sm:flex sm:w-auto sm:border-t-0">
          <button
            type="button"
            onClick={() => setInvert(!invert)}
            aria-pressed={invert}
            aria-label="Invert preview"
            className={`${ctl}${invert ? ' bg-hexl-fg text-hexl-bg' : ''}`}
          >
            INVERT
          </button>
          <div className="col-span-3 grid grid-cols-3 items-stretch sm:flex sm:flex-none" role="group" aria-label="Size">
            {(['S', 'M', 'L'] as SizeKey[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`${ctl} min-[240px]:min-w-11${size === s ? ' bg-hexl-fg text-hexl-bg' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        id={previewPanelId}
        role={code === undefined ? undefined : 'tabpanel'}
        aria-labelledby={code === undefined ? undefined : previewTabId}
        hidden={code !== undefined && tab !== 'PREVIEW'}
        className={`${tab === 'PREVIEW' ? 'flex' : 'hidden'} min-h-[320px] items-center justify-center${invert ? ' hexl-invert bg-hexl-bg text-hexl-fg' : ''}`}
      >
        {tab === 'PREVIEW' && (typeof preview === 'function' ? preview({ size: SIZES[size], invert }) : preview)}
      </div>
      {code !== undefined && (
        <div id={codePanelId} role="tabpanel" aria-labelledby={codeTabId} hidden={tab !== 'CODE'}>
          {tab === 'CODE' && <CodeBlock code={code} filename={filename} language={language} showLineNumbers className="border-0" />}
        </div>
      )}
    </div>
  );
}
