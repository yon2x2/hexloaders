import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';

const PAGE_TITLES: Record<string, string> = {
  '/': 'HEXLOADERS — 64 open-source loaders for every app.',
  '/docs/introduction': 'Introduction — HEXLOADERS',
  '/docs/architecture': 'Architecture — HEXLOADERS',
  '/docs/usage': 'Usage — HEXLOADERS',
  '/docs/manual-setup': 'Manual Setup — HEXLOADERS',
  '/playground': 'Playground — HEXLOADERS',
  '/showcase': 'Showcase — HEXLOADERS',
};

/**
 * Shared chrome. The nav is fixed (h-14) — the Layout owns the offset:
 * content starts below the nav (pt-14). Full-bleed heroes opt out inside
 * the page, not by removing this offset.
 */
export default function Layout() {
  const { hash, pathname } = useLocation();
  const navigationType = useNavigationType();
  const mainRef = useRef<HTMLElement>(null);
  const previousRoute = useRef<string | null>(null);

  useEffect(() => {
    const route = `${pathname}${hash}`;
    if (previousRoute.current === route) return;
    const initialRoute = previousRoute.current === null;
    previousRoute.current = route;
    if (initialRoute && !hash) return;
    if (navigationType === 'POP' && !hash) return;
    const frame = window.requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView();
      else {
        window.scrollTo(0, 0);
        mainRef.current?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash, navigationType, pathname]);

  useEffect(() => {
    if (pathname.startsWith('/loaders/')) return;
    document.title = PAGE_TITLES[pathname] ?? 'Not Found — HEXLOADERS';
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-hexl-bg text-hexl-fg">
      <Navbar />
      <main ref={mainRef} tabIndex={-1} className="flex-1 pt-14 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
