/**
 * HEXLOADERS — interactive helpers (page-local, playground + showcase)
 * Stepped reveal / viewport-gating hooks. Mechanical only: observers toggle
 * class/state at thresholds; no easing anywhere.
 */

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Snap-in reveal: adds .is-on to a .hexl-reveal element at `threshold` visibility. */
export function useReveal<T extends HTMLElement>(threshold = 0.15): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      el.classList.add('is-on');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-on');
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/**
 * Hard on/off viewport gate (IntersectionObserver). Vignettes run only while
 * visible — the motion budget is enforced by the viewport, not by timers.
 */
export function useVisible<T extends HTMLElement>(threshold = 0.2): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}
