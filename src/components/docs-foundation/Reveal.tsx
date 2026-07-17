/**
 * docs-foundation — Reveal
 * Snap-in reveal (opacity 0→1 + translateY 8px→0, steps(2,end), 240ms) driven by
 * IntersectionObserver. One-time. Reduced motion: instant visibility.
 * Mirrors the Home page convention (.hexl-reveal + .is-on from index.css).
 */

import type { ReactNode } from 'react';
import { useReveal } from './motion';

export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`hexl-reveal${className ? ` ${className}` : ''}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
