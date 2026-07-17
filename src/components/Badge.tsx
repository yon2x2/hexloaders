import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  /** outline (default) or solid invert. */
  variant?: 'outline' | 'solid';
  className?: string;
}

/** mono-micro uppercase chip — 1px border, square corners. */
export default function Badge({ children, variant = 'outline', className }: BadgeProps) {
  return (
    <span
      className={`inline-block border border-hexl-fg px-1 py-0.5 font-mono text-mono-micro uppercase leading-none${
        variant === 'solid' ? ' bg-hexl-fg text-hexl-bg' : ''
      }${className ? ` ${className}` : ''}`}
    >
      {children}
    </span>
  );
}
