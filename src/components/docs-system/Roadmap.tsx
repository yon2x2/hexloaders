/**
 * HEXLOADERS — docs-system distribution roadmap (#cli-roadmap).
 * Three ledger bands with state chips: shipped registry proof, component-source
 * rollout, then a dedicated CLI only if the verified registry needs one.
 */

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Badge from '@/components/Badge';
import { GlyphList } from './DocsBlocks';
import Reveal from '@/components/docs-foundation/Reveal';
import { reducedMotion } from '@/components/docs-foundation/motion';

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
        className="hexl-motion w-px origin-top bg-hexl-fg"
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

/* -------------------------------- Roadmap --------------------------------- */

export default function Roadmap() {
  return (
    <div>
      <Reveal>
        <PhaseBand head="PHASE 1 — SHIPPED · GitHub registry proof" chip="NOW" blink>
          <GlyphList
            items={[
              'Public GitHub source registry, schema-compatible with shadcn.',
              'Bit-Scanner is verified in a clean Vite consumer.',
              'Every other loader keeps its manual source available during rollout.',
            ]}
          />
        </PhaseBand>
      </Reveal>

      <PhaseConnector />

      <Reveal delay={120}>
        <PhaseBand head="PHASE 2 — NEXT · registry rollout" chip="NEXT">
          <GlyphList
            items={[
              'Expand one-command installs across the collection.',
              'Keep all 64 loader pages and source panels available during rollout.',
              'Verify every release in a clean consumer before publishing it.',
            ]}
          />
        </PhaseBand>
      </Reveal>

      <PhaseConnector />

      <Reveal delay={240}>
        <PhaseBand head="PHASE 3 — LATER · dedicated HEXLOADERS CLI" chip="LATER">
          <GlyphList
            items={[
              'Consider a dedicated CLI only after the registry rollout is complete.',
              'Discovery, batch installs, and conflict handling must answer proven user needs.',
              'Community publishing and agent-driven installs remain later explorations.',
            ]}
          />
        </PhaseBand>
      </Reveal>
    </div>
  );
}
