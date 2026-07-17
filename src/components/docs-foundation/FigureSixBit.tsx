/**
 * docs-foundation — FigureSixBit
 * FIG.01 of the Introduction page: HexGlyph STATE 21 (010101) at 160px, flanked
 * by mono annotations with 1px leader lines (LSB — BOTTOM LINE · BIT 5 — TOP
 * LINE), caption, and the binary→decimal conversion strip.
 * Motion (introduction.md): rows assemble bottom-to-top on entry (6 × steps(1),
 * 100ms apart); leader lines draw scaleX 0→1 in steps(4) 240ms. Keyframes come
 * from <DocMotionStyle/>. Reduced motion: fully assembled static figure.
 */

import { useEffect, useRef } from 'react';

const W = 64;
const LINE_H = W / 8; // 8
const GAP = W / 16; // 4
const H = 6 * LINE_H + 5 * GAP; // 68

const VALUE = 21; // STATE 21 · 010101

function rowY(bitIndex: number): number {
  // bit 0 = bottom line
  return H - (bitIndex + 1) * LINE_H - bitIndex * GAP;
}

export default function FigureSixBit() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-on');
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className="hexl-doc-fig">
      <div className="flex items-stretch justify-center gap-3 sm:gap-4">
        {/* left annotation — LSB, aligned to the bottom row */}
        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2">
            <span className="text-right font-mono text-mono-micro uppercase leading-tight">
              LSB —<br />
              BOTTOM LINE
            </span>
            <span aria-hidden="true" className="hexl-doc-leader h-px w-6 origin-right bg-hexl-fg sm:w-10" />
          </div>
        </div>

        <svg
          width={160}
          height={(160 * H) / W}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Hexagram state 21 — binary 010101"
          className="h-auto max-w-full"
          style={{ display: 'block' }}
        >
          {Array.from({ length: 6 }, (_, i) => {
            const bit = (VALUE >> i) & 1;
            const y = rowY(i);
            const half = (W - GAP) / 2;
            return (
              <g key={i} className="hexl-doc-row" style={{ animationDelay: `${i * 100}ms` }}>
                {bit === 1 ? (
                  <rect x={0} y={y} width={W} height={LINE_H} fill="currentColor" />
                ) : (
                  <>
                    <rect x={0} y={y} width={half} height={LINE_H} fill="currentColor" />
                    <rect x={half + GAP} y={y} width={half} height={LINE_H} fill="currentColor" />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* right annotation — BIT 5, aligned to the top row */}
        <div className="flex flex-col justify-start">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="hexl-doc-leader h-px w-6 origin-left bg-hexl-fg sm:w-10" />
            <span className="font-mono text-mono-micro uppercase leading-tight">
              BIT 5 —<br />
              TOP LINE
            </span>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-center font-mono text-mono-micro uppercase">
        FIG.01 — ONE STATE OF SIXTY-FOUR
      </figcaption>

      <div className="mt-6 border border-hexl-fg px-3 py-2 text-center font-mono text-mono-data tabular-nums">
        0 1 0 1 0 1 → 16+4+1 = 21
      </div>
    </figure>
  );
}
