/**
 * HEXLOADERS — BitEditor (site-internal, design.md §10)
 * Interactive 6-row glyph editor: click a line to toggle Yang⇄Yin (instant
 * re-render + hard 2px nudge). Readouts: STATE n°, binary (top→bottom),
 * upper/lower trigram bits, King Wen n°. Buttons: +1 −1 INVERT RANDOM COPY.
 */

import { useState } from 'react';
import { HEXAGRAMS, bitsOf } from '@/lib/hexagrams';
import { copyText } from './CodeBlock';

export interface BitEditorProps {
  value?: number;
  onChange?: (value: number) => void;
  /** glyph width px (default 128) */
  size?: number;
  className?: string;
}

const LINE_H = 8;
const GAP = 4;
const W = 64;

export default function BitEditor({ value, onChange, size = 128, className }: BitEditorProps) {
  const [internal, setInternal] = useState(26);
  const [copied, setCopied] = useState(false);
  const v = (value ?? internal) & 63;

  const set = (nv: number) => {
    const x = ((nv % 64) + 64) % 64;
    if (onChange) onChange(x);
    else setInternal(x);
  };

  const hex = HEXAGRAMS[v];
  const bits = bitsOf(v);

  const btn =
    'border border-hexl-fg px-3 py-2 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg active:translate-x-[2px]';

  return (
    <div className={`border border-hexl-fg${className ? ` ${className}` : ''}`}>
      <div className="flex h-10 items-center justify-between border-b border-hexl-fg px-3 font-mono text-mono-micro uppercase">
        <span>BIT EDITOR</span>
        <span>LSB = BOTTOM LINE</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="flex items-center justify-center border-b border-hexl-fg p-4 sm:border-b-0 sm:border-r">
          <div role="group" aria-label="Toggle hexagram lines" style={{ width: size }}>
            {[5, 4, 3, 2, 1, 0].map((i) => {
              const bit = bits[i];
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={bit === 1}
                  aria-label={`Line ${i + 1} — ${bit === 1 ? 'Yang (solid)' : 'Yin (broken)'}. Toggle.`}
                  onClick={() => set(v ^ (1 << i))}
                  className="block w-full hover:bg-hexl-fg hover:text-hexl-bg active:translate-x-[2px]"
                  style={{ marginBottom: i === 0 ? 0 : (size * GAP) / W }}
                >
                  <svg width={size} height={(size * LINE_H) / W} viewBox={`0 0 ${W} ${LINE_H}`} className="block">
                    {bit === 1 ? (
                      <rect x={0} y={0} width={W} height={LINE_H} fill="currentColor" />
                    ) : (
                      <>
                        <rect x={0} y={0} width={(W - GAP) / 2} height={LINE_H} fill="currentColor" />
                        <rect x={(W + GAP) / 2} y={0} width={(W - GAP) / 2} height={LINE_H} fill="currentColor" />
                      </>
                    )}
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col justify-between p-4 font-mono text-mono-data">
          <dl className="space-y-1">
            <div className="flex justify-between"><dt>STATE</dt><dd>n°{hex.value}</dd></div>
            <div className="flex justify-between"><dt>BINARY</dt><dd>{hex.binary}</dd></div>
            <div className="flex justify-between"><dt>UPPER</dt><dd>{hex.upper.toString(2).padStart(3, '0')}</dd></div>
            <div className="flex justify-between"><dt>LOWER</dt><dd>{hex.lower.toString(2).padStart(3, '0')}</dd></div>
            <div className="flex justify-between"><dt>KING WEN</dt><dd>n°{hex.kingwen}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => set(v + 1)}>+1</button>
            <button type="button" className={btn} onClick={() => set(v - 1)}>−1</button>
            <button type="button" className={btn} onClick={() => set(v ^ 63)}>INVERT BITS</button>
            <button type="button" className={btn} onClick={() => set(Math.floor(Math.random() * 64))}>RANDOM</button>
            <button
              type="button"
              className={btn}
              onClick={async () => {
                await copyText(String(v));
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }}
            >
              {copied ? 'COPIED' : 'COPY VALUE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
