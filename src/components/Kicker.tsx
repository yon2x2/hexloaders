import type { ReactNode } from 'react';

/** mono-label with leading black square ■ + trailing hairline filling width. */
export default function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 font-mono text-mono-label uppercase${className ? ` ${className}` : ''}`}>
      <span aria-hidden="true">■</span>
      <span className="shrink-0">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-hexl-fg" />
    </div>
  );
}
