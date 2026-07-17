/**
 * docs-foundation — motion helpers
 * Shared reduced-motion check + the snap-in reveal hook (non-component module,
 * so component files stay fast-refresh clean).
 */

import { useEffect, useRef } from 'react';

export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Adds .is-on to the referenced element the first time it enters the viewport. */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
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
