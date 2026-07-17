/**
 * HEXLOADERS — docs-system CLI roadmap (usage.md §CLI roadmap, #cli-roadmap).
 * Three ledger bands with state chips: PHASE 1 — SHIPPED [NOW] (chip blinks
 * twice, then steady) · PHASE 2 — NEXT [Q3] · PHASE 3 — LATER [Q4+]. Bands
 * snap-in staggered 120ms, connectors draw in steps(4), commands type-in on
 * first view and carry hover copy chips. Bands hover-invert (hexl-cell).
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Badge from '@/components/Badge';
import { copyText } from '@/components/CodeBlock';
import { GlyphList } from './DocsBlocks';
import { Reveal, reducedMotion } from './Reveal';

/* ------------------------------ PhaseConnector ---------------------------- */

/** Vertical connector between bands — draws scaleY 0→1 in steps(4), 480ms. */
function PhaseConnector() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="flex h-6 items-stretch justify-center">
      <div
        className="w-px origin-top bg-hexl-fg"
        style={{
          transform: on ? 'scaleY(1)' : 'scaleY(0)',
          transition: 'transform 480ms steps(4, end)',
        }}
      />
    </div>
  );
}

/* -------------------------------- PhaseBand ------------------------------- */

interface PhaseBandProps {
  head: string;
  chip: string;
  /** NOW chip blinks twice (steps(1) ×2), then steady. */
  blink?: boolean;
  children: ReactNode;
}

function PhaseBand({ head, chip, blink = false, children }: PhaseBandProps) {
  return (
    <div className="hexl-cell border border-hexl-fg">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-hexl-fg px-3 py-2">
        <span className="font-mono text-mono-label uppercase">{head}</span>
        {blink ? (
          <span className="hexl-motion" style={{ animation: 'hexl-blink 480ms steps(1, end) 2' }}>
            <Badge variant="solid">{chip}</Badge>
          </span>
        ) : (
          <Badge variant="solid">{chip}</Badge>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ------------------------------- CommandList ------------------------------ */

interface CliCommand {
  cmd: string;
  note: string;
}

/** One CLI line: types in 2 chars/40ms after `start`, then its # note snaps on. */
function CommandRow({ cmd, note, index, start }: CliCommand & { index: number; start: boolean }) {
  const [n, setN] = useState(0);
  const [copied, setCopied] = useState(false);
  const done = n >= cmd.length;

  useEffect(() => {
    if (!start) return;
    if (reducedMotion()) {
      setN(cmd.length);
      return;
    }
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setN((x) => {
          if (x >= cmd.length) {
            window.clearInterval(interval);
            return x;
          }
          return Math.min(cmd.length, x + 2);
        });
      }, 40);
    }, index * 240);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [start, cmd, index]);

  return (
    <div className="group flex items-center justify-between gap-3 border-b border-hexl-fg px-3 py-2 last:border-b-0">
      <span className="min-w-0 font-mono text-mono-data">
        <span className="break-all">
          {cmd.slice(0, n)}
          {!done && (
            <span aria-hidden="true" className="hexl-cursor">
              ▮
            </span>
          )}
        </span>
        {done && <span className="opacity-[0.45]">{`  # ${note}`}</span>}
      </span>
      <button
        type="button"
        tabIndex={done ? 0 : -1}
        onClick={async () => {
          await copyText(cmd);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
        className={`shrink-0 border border-hexl-fg px-2 py-0.5 font-mono text-mono-micro uppercase hover:bg-hexl-fg hover:text-hexl-bg${
          done ? ' opacity-0 focus-visible:opacity-100 group-hover:opacity-100' : ' invisible'
        }`}
      >
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}

/** Phase-2 command block: types in on first view, hover copy chips per command. */
function CommandList({ commands }: { commands: CliCommand[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState(() => reducedMotion());

  useEffect(() => {
    if (start) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [start]);

  return (
    <div ref={ref} className="border border-hexl-fg">
      <div className="flex h-10 items-center justify-between border-b border-hexl-fg px-3 font-mono text-mono-micro uppercase">
        <span>TERMINAL — HEXLOADERS CLI</span>
        <span>PREVIEW</span>
      </div>
      {commands.map((c, i) => (
        <CommandRow key={c.cmd} cmd={c.cmd} note={c.note} index={i} start={start} />
      ))}
    </div>
  );
}

/* -------------------------------- Roadmap --------------------------------- */

const PHASE_2_COMMANDS: CliCommand[] = [
  { cmd: 'npx hexloaders@latest init', note: 'writes hexloaders.json, detects tailwind/css paths' },
  { cmd: 'npx hexloaders add bit-scanner', note: 'copies one file, prints the css vars it needs' },
  { cmd: 'npx hexloaders add --mechanic scan', note: 'batch by mechanic' },
  { cmd: 'npx hexloaders add --all', note: 'the whole address space' },
  { cmd: 'npx hexloaders list', note: 'the 64 states, with install status' },
];

export default function Roadmap() {
  return (
    <div>
      <Reveal>
        <PhaseBand head="PHASE 1 — SHIPPED · shadcn registry" chip="NOW" blink>
          <GlyphList
            items={[
              'Static registry at r.hexloaders.dev/{name}.json, schema-compatible with shadcn.',
              'npx shadcn@latest add @hexloaders/<slug> for all 64 states.',
              'cssVars auto-injected into globals.css when missing.',
            ]}
          />
        </PhaseBand>
      </Reveal>

      <PhaseConnector />

      <Reveal delay={120}>
        <PhaseBand head="PHASE 2 — NEXT · the hexloaders CLI" chip="Q3">
          <CommandList commands={PHASE_2_COMMANDS} />
          <GlyphList
            className="mt-4"
            items={[
              <>
                {'hexloaders.json: '}
                <code className="border border-hexl-fg px-1">
                  {'{ "loaderDir": "components/loaders", "css": "app/globals.css", "typescript": true }'}
                </code>
              </>,
              'Interactive picker when run bare: npx hexloaders → searchable list of 64, space to select.',
              'Conflict handling: diff view, keep/overwrite/skip — never silent.',
            ]}
          />
        </PhaseBand>
      </Reveal>

      <PhaseConnector />

      <Reveal delay={240}>
        <PhaseBand head="PHASE 3 — LATER · the ecosystem" chip="Q4+">
          <GlyphList
            items={[
              'Community registry: hexloaders publish (signed entries, mechanic-tagged).',
              'Variant transforms: npx hexloaders add hex-stepper --mechanic invert rewrites the motion primitive before copying.',
              'MCP server so coding agents can search and install states autonomously.',
            ]}
          />
        </PhaseBand>
      </Reveal>
    </div>
  );
}
