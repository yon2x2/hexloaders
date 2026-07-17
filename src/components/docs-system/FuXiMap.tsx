/**
 * HEXLOADERS — docs-system 8×8 Fu Xi map (architecture.md §The 8×8 map).
 * Static mini matrix, cells 28px, each a tiny static glyph of its state, built
 * from src/lib/registry.ts + src/lib/hexagrams.ts. Axis labels 000–111 on both
 * tracks (row = upper trigram bits 3–5, col = lower trigram bits 0–2). Hover
 * highlights row+column tracks (instant invert) and drives the readout:
 * STATE · UPPER · LOWER · KING WEN. Click copies the value. Assembles in
 * raster order on entry (hard steps, 6ms/cell).
 */

import { Fragment, useEffect, useRef, useState } from 'react';
import { HEXAGRAMS } from '@/lib/hexagrams';
import { LOADERS } from '@/lib/registry';
import HexGlyph from '@/registry/loaders/hex-glyph';
import { copyText } from '@/components/CodeBlock';
import { reducedMotion } from './Reveal';

const AXIS = Array.from({ length: 8 }, (_, i) => i.toString(2).padStart(3, '0'));

export default function FuXiMap() {
  const [hover, setHover] = useState(26); // default readout: STATE 26 · 011010
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(() => (reducedMotion() ? 64 : 0));
  const ref = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* Raster assemble on first visibility: one cell per 6ms tick, hard cut (steps(1) feel). */
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) {
      setShown(64);
      return;
    }
    let interval: number | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        interval = window.setInterval(() => {
          setShown((s) => {
            if (s >= 64) {
              window.clearInterval(interval);
              return s;
            }
            return s + 1;
          });
        }, 6);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  const hex = HEXAGRAMS[hover];
  const loader = LOADERS[hover];
  const upper = (hover >> 3) & 7;
  const lower = hover & 7;

  const onPick = async (v: number) => {
    setHover(v);
    await copyText(String(v));
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div ref={ref} className="border border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="flex h-10 items-center justify-between border-b border-hexl-fg px-3 font-mono text-mono-micro uppercase">
        <span>FIG — THE 8×8 MAP · FU XI ORDER</span>
        <span className="hidden sm:block">ROW = UPPER · COL = LOWER</span>
      </div>

      <div className="overflow-x-auto p-3">
        <div className="grid w-max cursor-crosshair grid-cols-[repeat(9,28px)] gap-px border border-hexl-fg bg-hexl-fg p-px">
          {/* top-left corner registration mark */}
          <div
            aria-hidden="true"
            className="flex h-[28px] w-[28px] items-center justify-center bg-hexl-bg font-mono text-mono-micro opacity-[0.45]"
          >
            +
          </div>
          {/* column axis: lower trigram bits 000–111 */}
          {AXIS.map((b, c) => (
            <div
              key={`col-${b}`}
              aria-hidden="true"
              className={`flex h-[28px] w-[28px] items-center justify-center font-mono text-mono-micro${
                c === lower ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg'
              }`}
            >
              {b}
            </div>
          ))}
          {/* rows: upper trigram axis cell + 8 state cells */}
          {AXIS.map((rb, r) => (
            <Fragment key={`row-${rb}`}>
              <div
                aria-hidden="true"
                className={`flex h-[28px] w-[28px] items-center justify-center font-mono text-mono-micro${
                  r === upper ? ' bg-hexl-fg text-hexl-bg' : ' bg-hexl-bg'
                }`}
              >
                {rb}
              </div>
              {AXIS.map((cb, c) => {
                const v = (r << 3) | c; // value = (upper << 3) | lower
                return (
                  <button
                    key={cb}
                    type="button"
                    onMouseEnter={() => setHover(v)}
                    onFocus={() => setHover(v)}
                    onClick={() => void onPick(v)}
                    aria-label={`State ${v} — ${LOADERS[v].name}. Activate to copy the value.`}
                    className="hexl-cell flex h-[28px] w-[28px] cursor-crosshair items-center justify-center"
                    style={{ opacity: v < shown ? 1 : 0 }}
                  >
                    <HexGlyph value={v} size={14} aria-hidden="true" />
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-hexl-fg px-3 py-2 font-mono">
        <span className="text-mono-data tabular-nums" aria-live="polite">
          {`STATE ${hex.value} · UPPER ${hex.upper.toString(2).padStart(3, '0')} · LOWER ${hex.lower
            .toString(2)
            .padStart(3, '0')} · KING WEN n°${hex.kingwen}`}
        </span>
        <span className="text-mono-micro uppercase">
          {copied
            ? `VALUE ${hex.value} COPIED`
            : `n°${String(loader.value).padStart(2, '0')} — ${loader.name} · ${loader.mechanic} · CLICK COPIES THE VALUE`}
        </span>
      </div>
    </div>
  );
}
