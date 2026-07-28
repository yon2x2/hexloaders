import type { CSSProperties, ReactNode } from 'react';

export interface TickerItem {
  label: string;
}

export interface TickerProps {
  items: TickerItem[];
  /** 'band' = white ink on black band (inverted space) · 'plain' = black on white. */
  variant?: 'band' | 'plain';
  /** Marquee loop duration in seconds. Default 36. */
  duration?: number;
  /** steps() count per loop — the visible tick jumps. Default 240. */
  steps?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Full-bleed stepped marquee band (h-11, hairlines top/bottom).
 * Content duplicated ×2; translateX 0→-50% in hard steps. Pauses on hover.
 */
export default function Ticker({
  items,
  variant = 'band',
  duration = 36,
  steps = 240,
  className,
  ariaLabel,
}: TickerProps) {
  const trackStyle: CSSProperties = {
    animation: `hexl-ticker ${duration}s steps(${steps}, end) infinite`,
  };

  const half = (key: string): ReactNode => (
    <span className="flex h-11 shrink-0 items-center" aria-hidden="true" key={key}>
      {items.map((item, i) => (
        <span key={i} className="flex h-11 items-center px-3 font-mono text-mono-label uppercase">
          {item.label}
          <span aria-hidden="true" className="px-3">·</span>
        </span>
      ))}
    </span>
  );

  return (
    <div
      className={`hexl-ticker overflow-hidden border-y border-hexl-fg${variant === 'band' ? ' hexl-invert bg-hexl-bg text-hexl-fg' : ' bg-hexl-bg text-hexl-fg'}${
        className ? ` ${className}` : ''
      }`}
      role="marquee"
      aria-label={ariaLabel}
    >
      <div className="hexl-ticker-track" style={trackStyle}>
        {half('a')}
        {half('b')}
      </div>
    </div>
  );
}
