/**
 * docs-foundation — TypedCodeBlock
 * CodeBlock that renders with a one-time terminal type-in when first viewed
 * (manual-setup.md §Step 3). The unit is the design's type-in clock — a fixed
 * chunk per 40ms tick, hard stop, block cursor ▮ while typing; the chunk is
 * scaled up (64 chars) so the full Bit-Scanner source still lands in ~3s.
 * COPY always copies exactly what is currently rendered. Reduced motion: the
 * full source renders instantly.
 */

import { useEffect, useRef, useState } from 'react';
import CodeBlock from '@/components/CodeBlock';
import { reducedMotion } from './motion';

/** chars per 40ms tick (design unit: 2 chars/40ms, batched ×32 for long sources). */
const CHUNK = 64;

export interface TypedCodeBlockProps {
  code: string;
  filename?: string;
  language?: 'bash' | 'tsx' | 'json' | 'css' | 'text';
  className?: string;
}

export default function TypedCodeBlock({ code, filename, language = 'tsx', className }: TypedCodeBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);
  const done = n >= code.length;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      // deferred to a task — never a synchronous setState inside the effect
      const id = window.setTimeout(() => setN(code.length), 0);
      return () => window.clearTimeout(id);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [code.length]);

  useEffect(() => {
    if (!started || done) return;
    const id = window.setInterval(() => {
      setN((x) => Math.min(x + CHUNK, code.length));
    }, 40);
    return () => window.clearInterval(id);
  }, [started, done, code.length]);

  const shown = code.slice(0, n) + (done ? '' : '▮');

  return (
    <div ref={ref} className={className}>
      <CodeBlock code={shown} filename={filename} language={language} />
    </div>
  );
}
