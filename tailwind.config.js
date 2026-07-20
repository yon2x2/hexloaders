/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    /* ABSOLUTE MONOCHROMATICITY — corners always 0, no shadows, no grays. */
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    boxShadow: {
      sm: 'none',
      DEFAULT: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
      '2xl': 'none',
      inner: 'none',
      none: 'none',
    },
    extend: {
      colors: {
        hexl: {
          bg: 'var(--hexl-bg)',
          fg: 'var(--hexl-fg)',
          'bg-inv': 'var(--hexl-bg-inv)',
          'fg-inv': 'var(--hexl-fg-inv)',
        },
      },
      fontFamily: {
        grotesk: ['Archivo', 'Helvetica Neue', 'Helvetica', 'Akzidenz-Grotesk', 'Arial', 'sans-serif'],
        mono: ['Space Mono', 'SF Mono', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(56px, 9.5vw, 136px)', { lineHeight: '0.92', letterSpacing: '-0.03em', fontWeight: '900' }],
        'display-lg': ['clamp(40px, 6vw, 88px)', { lineHeight: '0.95', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['clamp(28px, 4vw, 48px)', { lineHeight: '1.0', letterSpacing: '-0.01em', fontWeight: '800' }],
        head: ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.55', fontWeight: '400' }],
        'mono-data': ['13px', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '400' }],
        'mono-label': ['11px', { lineHeight: '1.4', letterSpacing: '0.14em', fontWeight: '700' }],
        'mono-micro': ['10px', { lineHeight: '1.4', letterSpacing: '0.12em', fontWeight: '400' }],
      },
      transitionTimingFunction: {
        'step-1': 'steps(1,end)',
        'step-2': 'steps(2,end)',
        'step-4': 'steps(4,end)',
        'step-6': 'steps(6,end)',
        'step-8': 'steps(8,end)',
        'step-12': 'steps(12,end)',
      },
      keyframes: {
        'hexl-scan': { to: { transform: 'translateY(100%)' } }, /* used w/ steps(6) */
        'hexl-blink': { '50%': { opacity: '0' } }, /* steps(1) */
        'hexl-ticker': { to: { transform: 'translateX(-50%)' } }, /* steps(120) */
        'hexl-snap': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'hexl-scan': 'hexl-scan 720ms steps(6,end) infinite',
        'hexl-blink': 'hexl-blink 480ms steps(1,end) infinite',
        'hexl-ticker': 'hexl-ticker 24s steps(120,end) infinite',
        'hexl-snap': 'hexl-snap 240ms steps(2,end) both',
      },
    },
  },
  plugins: [],
};
