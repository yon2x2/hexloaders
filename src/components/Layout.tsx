import { Outlet } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Shared chrome. The nav is fixed (h-14) — the Layout owns the offset:
 * content starts below the nav (pt-14). Full-bleed heroes opt out inside
 * the page, not by removing this offset.
 */
export default function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-hexl-bg text-hexl-fg">
      <Navbar />
      <main className="flex-1 pt-14">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
