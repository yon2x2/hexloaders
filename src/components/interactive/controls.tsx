/**
 * HEXLOADERS — playground control vocabulary (page-local)
 * Every control is stepped/mechanical: notch tracks with hard cuts, segmented
 * options with instant invert, OFF/ON two-cell switches, a step-sequencer
 * pattern editor. No easing, no gray, square corners.
 */

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

/* ------------------------------ SteppedSlider ------------------------------ */

export interface SteppedSliderProps {
  label: string;
  /** Discrete notch values (rendered left→right). */
  values: number[];
  value: number;
  onChange: (v: number) => void;
  /** Readout formatter, e.g. (v) => `${v}MS`. */
  format?: (v: number) => string;
  /** Show the keyboard hint micro-label under the track. */
  hint?: boolean;
}

export function SteppedSlider({ label, values, value, onChange, format, hint }: SteppedSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const idx = Math.max(0, values.indexOf(value));

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const i = Math.min(values.length - 1, Math.max(0, Math.floor(ratio * values.length)));
    if (values[i] !== value) onChange(values[i]);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(values[Math.min(values.length - 1, idx + 1)]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(values[Math.max(0, idx - 1)]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(values[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(values[values.length - 1]);
    }
  };

  return (
    <div className="border-b border-hexl-fg px-3 py-3">
      <div className="flex items-center justify-between font-mono text-mono-micro uppercase">
        <span>{label}</span>
        <span className="tabular-nums">{format ? format(value) : value}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={values[0]}
        aria-valuemax={values[values.length - 1]}
        aria-valuenow={value}
        aria-valuetext={format ? format(value) : String(value)}
        className="mt-2 flex h-9 cursor-ew-resize touch-none select-none border border-hexl-fg"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {values.map((v, i) => (
          <div
            key={v}
            aria-hidden="true"
            className={`flex-1${i > 0 ? ' border-l border-hexl-fg' : ''}${i <= idx ? ' bg-hexl-fg' : ' bg-hexl-bg'}`}
          />
        ))}
      </div>
      {hint && <div className="mt-2 font-mono text-mono-micro uppercase opacity-[0.45]">DRAG · ← → STEPS</div>}
    </div>
  );
}

/* ------------------------------- Segmented -------------------------------- */

export interface SegmentedProps<T extends string | number> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

export function Segmented<T extends string | number>({ label, options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="border-b border-hexl-fg px-3 py-3">
      <div className="flex items-center justify-between font-mono text-mono-micro uppercase">
        <span>{label}</span>
        <span className="tabular-nums">{options.find((o) => o.value === value)?.label}</span>
      </div>
      <div className="mt-2 flex border border-hexl-fg" role="group" aria-label={label}>
        {options.map((o, i) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`h-9 flex-1 font-mono text-mono-label uppercase${i > 0 ? ' border-l border-hexl-fg' : ''}${
              o.value === value ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg text-hexl-fg hover:bg-hexl-fg hover:text-hexl-bg'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Toggle --------------------------------- */

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-stretch justify-between border-b border-hexl-fg">
      <div className="flex items-center px-3 py-3 font-mono text-mono-micro uppercase">{label}</div>
      <div className="flex items-stretch border-l border-hexl-fg" role="group" aria-label={label}>
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={checked === v}
            onClick={() => onChange(v)}
            className={`w-14 font-mono text-mono-label uppercase${
              checked === v ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg text-hexl-fg hover:bg-hexl-fg hover:text-hexl-bg'
            }${v ? ' border-l border-hexl-fg' : ''}`}
          >
            {v ? 'ON' : 'OFF'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- PatternEditor ------------------------------ */

const CYCLE = [1, 3, 7, 0]; // click cycles each beat's weight 1→3→7→0

export interface PatternEditorProps {
  label: string;
  /** 8 beat weights (0 = rest, 1/3/7 = counts of base intervals). */
  pattern: number[];
  onChange: (pattern: number[]) => void;
}

export function PatternEditor({ label, pattern, onChange }: PatternEditorProps) {
  const cycleBeat = (i: number) => {
    const next = pattern.slice();
    const cur = CYCLE.indexOf(next[i]);
    next[i] = CYCLE[(cur + 1) % CYCLE.length];
    onChange(next);
  };

  return (
    <div className="border-b border-hexl-fg px-3 py-3">
      <div className="flex items-center justify-between font-mono text-mono-micro uppercase">
        <span>{label}</span>
        <span className="tabular-nums">[{pattern.join(',')}]</span>
      </div>
      <div className="mt-2 flex border border-hexl-fg" role="group" aria-label={`${label} — step sequencer`}>
        {pattern.map((w, i) => (
          <button
            key={i}
            type="button"
            onClick={() => cycleBeat(i)}
            aria-label={`Beat ${i + 1} — weight ${w}. Click to cycle 1, 3, 7, 0.`}
            className="relative h-12 flex-1 border-hexl-fg bg-hexl-bg text-hexl-fg hover:bg-hexl-fg hover:text-hexl-bg"
            style={i > 0 ? { borderLeft: '1px solid var(--hexl-fg)' } : undefined}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 bg-hexl-fg"
              style={{ height: `${(Math.min(7, Math.max(0, w)) / 7) * 100}%` }}
            />
            <span className="absolute left-1 top-1 font-mono text-mono-micro tabular-nums">{w}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 font-mono text-mono-micro uppercase opacity-[0.45]">CLICK BEAT — CYCLES 1 → 3 → 7 → 0</div>
    </div>
  );
}

/* ----------------------------- SequenceInput ------------------------------ */

export interface SequenceInputProps {
  label: string;
  sequence: number[];
  onChange: (seq: number[]) => void;
}

/** Mono text field accepting "0,17,34,42" — validated to 6-bit states 0–63. */
export function SequenceInput({ label, sequence, onChange }: SequenceInputProps) {
  const [text, setText] = useState(sequence.join(','));
  const [invalid, setInvalid] = useState(false);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(sequence.join(','));
  }, [sequence]);

  const commit = () => {
    const parts = text.split(/[\s,]+/).filter(Boolean);
    const nums = parts.map((p) => Number(p));
    const ok = nums.length > 0 && nums.every((n) => Number.isInteger(n) && n >= 0 && n <= 63);
    if (ok) {
      setInvalid(false);
      onChange(nums);
    } else {
      setInvalid(true);
    }
  };

  return (
    <div className="border-b border-hexl-fg px-3 py-3">
      <div className="flex items-center justify-between font-mono text-mono-micro uppercase">
        <span>{label}</span>
        <span className={invalid ? 'bg-hexl-fg text-hexl-bg' : ''}>{invalid ? 'INVALID — 0–63 ONLY' : `${sequence.length} STATES`}</span>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        inputMode="numeric"
        aria-label={`${label} — comma-separated states 0 to 63`}
        placeholder="0,17,34,42"
        className="mt-2 h-9 w-full border border-hexl-fg bg-hexl-bg px-2 font-mono text-mono-data text-hexl-fg placeholder:opacity-[0.45]"
      />
    </div>
  );
}
