import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { MECHANICS, loadersByMechanic } from '@/lib/registry';

const GETTING_STARTED = [
  { to: '/docs/introduction', label: 'Introduction' },
  { to: '/docs/usage', label: 'Usage' },
  { to: '/docs/manual-setup', label: 'Manual setup' },
  { to: '/docs/architecture', label: 'Architecture' },
];

const RESOURCES: ({ to: string; label: string } | { href: string; label: string })[] = [
  { to: '/playground', label: 'Playground' },
  { to: '/showcase', label: 'Showcase' },
  { href: 'https://github.com/yon2x2/hexloaders', label: 'GitHub' },
];

export interface TocItem {
  id: string;
  label: string;
}

export interface DocsShellProps {
  children: React.ReactNode;
  toc?: TocItem[];
}

function SidebarNav() {
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-1 font-mono text-mono-data hover:bg-hexl-fg hover:text-hexl-bg${isActive ? ' bg-hexl-fg text-hexl-bg' : ''}`;
  return (
    <nav aria-label="Docs" className="font-mono">
      <div className="px-3 pb-2 pt-4 text-mono-label uppercase">GETTING STARTED</div>
      {GETTING_STARTED.map((l) => (
        <NavLink key={l.to} to={l.to} className={linkCls}>
          {l.label}
        </NavLink>
      ))}
      <div className="px-3 pb-2 pt-6 text-mono-label uppercase">THE 64 LOADERS</div>
      {MECHANICS.map((m) => (
        <div key={m}>
          <div className="px-3 pb-1 pt-3 text-mono-micro uppercase opacity-[0.55]">{m}</div>
          {loadersByMechanic(m).map((l) => (
            <NavLink key={l.slug} to={`/loaders/${l.slug}`} className={linkCls}>
              <span className="mr-2 opacity-[0.55]">{String(l.value).padStart(2, '0')}</span>
              {l.name}
              {l.flagship ? ' · BESPOKE' : ''}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="px-3 pb-2 pt-6 text-mono-label uppercase">RESOURCES</div>
      {RESOURCES.map((l) =>
        'to' in l ? (
          <NavLink key={l.to} to={l.to} className={linkCls}>
            {l.label}
          </NavLink>
        ) : (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="block px-3 py-1 font-mono text-mono-data hover:bg-hexl-fg hover:text-hexl-bg">
            {l.label}
          </a>
        ),
      )}
    </nav>
  );
}

/**
 * Docs 3-column shell: left sidebar (w-64, sticky, hairline right), main
 * (max-w-[760px]), right ON THIS PAGE TOC (w-48, sticky, black-square marker,
 * scroll-threshold spy). Mobile: sidebar becomes a top collapsible ledger row.
 */
export default function DocsShell({ children, toc = [] }: DocsShellProps) {
  const [active, setActive] = useState<string>(toc[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (toc.length === 0) return;
    const onScroll = () => {
      let current = toc[0]?.id ?? '';
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 96) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  return (
    <div className="mx-auto max-w-[1440px] md:px-10">
      <div className="border-b border-hexl-fg lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex w-full items-center justify-between px-6 py-4 font-mono text-mono-label uppercase hover:bg-hexl-fg hover:text-hexl-bg"
        >
          <span>DOCS INDEX</span>
          <span>{open ? '−' : '+'}</span>
        </button>
        {open && (
          <div className="max-h-[60dvh] overflow-y-auto border-t border-hexl-fg">
            <SidebarNav />
          </div>
        )}
      </div>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-64 shrink-0 overflow-y-auto border-r border-hexl-fg pb-16 lg:block">
          <SidebarNav />
        </aside>
        <div className="w-full max-w-[760px] flex-1 px-6 py-10 md:px-10">{children}</div>
        {toc.length > 0 && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-56px)] w-48 shrink-0 border-l border-hexl-fg px-4 py-10 xl:block">
            <div className="mb-4 font-mono text-mono-label uppercase">ON THIS PAGE</div>
            <ul>
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`flex min-h-6 items-center gap-2 py-1 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg${active === item.id ? ' font-bold' : ''}`}
                  >
                    <span aria-hidden="true" className={`inline-block h-2 w-2${active === item.id ? ' bg-hexl-fg' : ''}`} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}
