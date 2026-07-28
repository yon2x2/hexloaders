import { Link } from 'react-router';
import { HEXAGRAMS } from '@/lib/hexagrams';
import { MECHANICS, LOADERS } from '@/lib/registry';
import HexGlyph from '@/registry/loaders/hex-glyph';
import Ticker from './Ticker';

const DOCS_LINKS = [
  { to: '/docs/introduction', label: 'Introduction' },
  { to: '/docs/usage', label: 'Usage' },
  { to: '/docs/manual-setup', label: 'Manual setup' },
  { to: '/docs/architecture', label: 'Architecture' },
];

const RESOURCE_LINKS: ({ to: string; label: string } | { href: string; label: string })[] = [
  { to: '/playground', label: 'Playground' },
  { to: '/showcase', label: 'Showcase' },
  { href: 'https://github.com/yon2x2/hexloaders', label: 'GitHub' },
];

export default function Footer() {
  const binaryItems = HEXAGRAMS.map((h) => ({ label: h.binary }));

  return (
    <footer data-invert="" className="border-t border-hexl-fg bg-hexl-bg text-hexl-fg">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10">
        <div className="font-grotesk text-display-lg uppercase leading-none">
          HEXLOADERS<sup className="font-mono text-mono-data align-super">®</sup>
        </div>

        <div className="mt-12 grid grid-cols-4 gap-px border border-hexl-fg bg-hexl-fg sm:grid-cols-8">
          {MECHANICS.map((m) => {
            const rep = LOADERS.find((l) => l.mechanic === m);
            return (
              <div key={m} className="flex flex-col items-center gap-3 bg-hexl-bg px-2 py-6">
                <HexGlyph value={rep?.value ?? 63} size={32} aria-hidden="true" />
                <span className="font-mono text-mono-micro uppercase">{m}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-3 font-mono text-mono-label uppercase">DOCS</div>
            <ul className="space-y-2">
              {DOCS_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="inline-flex min-h-11 min-w-11 items-center font-mono text-mono-data underline-offset-4 hover:bg-hexl-fg hover:text-hexl-bg lg:min-h-0 lg:min-w-0">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-3 font-mono text-mono-label uppercase">RESOURCES</div>
            <ul className="space-y-2">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.label}>
                  {'to' in l ? (
                    <Link to={l.to} className="inline-flex min-h-11 min-w-11 items-center font-mono text-mono-data underline-offset-4 hover:bg-hexl-fg hover:text-hexl-bg lg:min-h-0 lg:min-w-0">
                      {l.label}
                    </Link>
                  ) : (
                    <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 min-w-11 items-center font-mono text-mono-data underline-offset-4 hover:bg-hexl-fg hover:text-hexl-bg lg:min-h-0 lg:min-w-0">
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-3 font-mono text-mono-label uppercase">REGISTRY</div>
            <ul className="space-y-2 font-mono text-mono-data">
              <li>npm i nothing</li>
              <li>MIT License</li>
              <li>v0.1.0</li>
            </ul>
          </div>
        </div>
      </div>

      <Ticker items={binaryItems} variant="plain" duration={48} steps={64} ariaLabel="Binary ticker — all 64 states, 000000 to 111111" />

      <div className="border-t border-hexl-fg">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 font-mono text-mono-micro uppercase md:px-10">
          <span>@hexloaders — by the community</span>
          <span>MIT · v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
