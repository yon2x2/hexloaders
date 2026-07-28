import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import HexGlyph from '@/registry/loaders/hex-glyph';

const LINKS = [
  { to: '/docs/introduction', label: 'DOCS' },
  { to: '/playground', label: 'PLAYGROUND' },
  { to: '/showcase', label: 'SHOWCASE' },
];

const isLinkActive = (pathname: string, to: string) =>
  to.startsWith('/docs/') ? pathname.startsWith('/docs/') : pathname === to;

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/** Half-black / half-white square — the INVERT toggle icon. */
function InvertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="0.5" y="0.5" width="13" height="13" fill="none" stroke="currentColor" />
      <rect x="0.5" y="0.5" width="6.5" height="13" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [logoValue, setLogoValue] = useState(63);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [inverted, setInverted] = useState(false);
  const logoLinkRef = useRef<HTMLAnchorElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  // Living logo: on hover, step through random states every 120ms (steps(1)).
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!hover || motionQuery.matches) {
      setLogoValue(63);
      return;
    }
    const id = window.setInterval(() => setLogoValue(Math.floor(Math.random() * 64)), 120);
    return () => window.clearInterval(id);
  }, [hover]);

  useEffect(() => {
    if (!open) return;

    const menuButton = menuButtonRef.current;
    const logoLink = logoLinkRef.current;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const background = Array.from(document.querySelectorAll<HTMLElement>('main, footer'));
    const previousInert = background.map((element) => element.inert);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    background.forEach((element) => {
      element.inert = true;
    });
    const desktopQuery = window.matchMedia('(min-width: 1024px)');

    const firstLink = mobileNavRef.current?.querySelector<HTMLElement>('a[href]');
    firstLink?.focus();

    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [
        menuButton,
        ...Array.from(mobileNavRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []),
      ].filter((element): element is HTMLElement => Boolean(element));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    desktopQuery.addEventListener('change', onDesktop);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      desktopQuery.removeEventListener('change', onDesktop);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      background.forEach((element, index) => {
        element.inert = previousInert[index];
      });
      (menuButton?.getClientRects().length ? menuButton : logoLink)?.focus();
    };
  }, [open]);

  const toggleInvert = () => {
    const next = !inverted;
    setInverted(next);
    document.documentElement.toggleAttribute('data-invert', next);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="flex h-14 items-stretch justify-between">
        <Link
          ref={logoLinkRef}
          to="/"
          inert={open ? true : undefined}
          className="flex items-center gap-3 px-4 hover:bg-hexl-fg hover:text-hexl-bg"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <HexGlyph value={logoValue} size={20} aria-hidden="true" />
          <span className="font-mono text-mono-label uppercase">HEXLOADERS</span>
        </Link>

        <nav className="hidden items-stretch lg:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const active = isLinkActive(pathname, l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg${
                  active ? ' bg-hexl-fg text-hexl-bg' : ''
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href="https://github.com/yon2x2/hexloaders"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex items-center border-l border-hexl-fg px-4 hover:bg-hexl-fg hover:text-hexl-bg"
          >
            <GitHubMark />
          </a>
          <button
            type="button"
            onClick={toggleInvert}
            inert={open ? true : undefined}
            aria-pressed={inverted}
            aria-label="Invert page colors"
            className="flex items-center gap-2 border-l border-hexl-fg px-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
          >
            <InvertIcon />
            INVERT
          </button>
        </nav>

        <div className="flex items-stretch lg:hidden">
          <button
            type="button"
            onClick={toggleInvert}
            inert={open ? true : undefined}
            aria-pressed={inverted}
            aria-label="Invert page colors"
            className="flex min-w-11 items-center justify-center border-l border-hexl-fg px-3 hover:bg-hexl-fg hover:text-hexl-bg"
          >
            <InvertIcon />
          </button>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex min-w-16 items-center justify-center border-l border-hexl-fg px-3 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
          >
            {open ? 'CLOSE' : 'MENU'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          ref={mobileNavRef}
          id="mobile-navigation"
          className="fixed inset-0 top-14 z-50 flex flex-col overflow-y-auto overscroll-contain border-t border-hexl-fg bg-hexl-bg pb-[env(safe-area-inset-bottom)] lg:hidden"
          aria-label="Mobile"
        >
          {LINKS.map((l, i) => {
            const active = isLinkActive(pathname, l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`hexl-reveal is-on flex items-center justify-between border-b border-hexl-fg px-6 py-5 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg${
                  active ? ' bg-hexl-fg text-hexl-bg' : ''
                }`}
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <span>{l.label}</span>
                <span className="text-mono-micro">0{i + 1}</span>
              </Link>
            );
          })}
          <a
            href="https://github.com/yon2x2/hexloaders"
            target="_blank"
            rel="noreferrer"
            className="hexl-reveal is-on flex items-center justify-between border-b border-hexl-fg px-6 py-5 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
            style={{ transitionDelay: `${LINKS.length * 40}ms` }}
          >
            <span>GITHUB</span>
            <GitHubMark />
          </a>
        </nav>
      )}
    </header>
  );
}
