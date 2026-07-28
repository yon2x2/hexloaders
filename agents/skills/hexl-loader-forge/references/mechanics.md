# HEXLOADERS — The 8 Motion Mechanics (taxonomy)

Each mechanic is one template in `src/registry/loaders/generated/` and one branch in
`MechanicCell.frame()`. All operate on the 64×68 glyph grid at 120ms-multiple clocks.

| Mechanic | Behavior | Cycle |
|---|---|---|
| SCAN | 1px scanline travels top→bottom in steps(6); crossed row snaps dim→full for one step | 720–960ms |
| SEQUENCE | steps through states (count / kingwen / seeded PRNG / custom list), hard cut per advance | per mode |
| INVERT | periodic `value ^ 63` bitwise complement and/or color-space snap (`filter: invert(1)`), `transition: none !important` | 240–480ms |
| SHIFT | barrel rotate `rotl6` — bits rotate 1 position per tick | 720ms |
| COUNT | odometer: `(value + tick) & 63` | 7680ms full sweep |
| STACK | rows build up 1→6, hold, instant reset | 960ms |
| CASCADE | propagation wave: rows light full→mid→dim in sequence | 960ms |
| STROBE | binary blink beats: REST→63→REST→0 patterns, two ticks per visual beat | 960ms |

## Inventing a 9th mechanic — rules

1. Must be expressible as `frame(mechanic, value, t) → { v, rows[6], scan }` —
   pure function of the tick. If it needs continuous easing, it is off-philosophy:
   reject or re-quantize into steps.
2. Must read as a *machine* (register, counter, printer, relay) — not organic.
3. Name it as equipment/process (PARITY, DRUM, LATCH, PUNCH…), add to:
   - `Mechanic` union + `MECHANICS` in `src/lib/registry.ts`
   - `CLOCK` in `src/components/loaders/MechanicCell.tsx` (≥120ms)
   - new template `src/registry/loaders/generated/<mechanic>.tsx`
   - Footer mechanic glyph row (8→9) and docs mechanics table.
4. Cycle duration must divide evenly into 120ms multiples and be documented in the
   file header.

## Flagship promotion checklist (generated → bespoke)

- Programmable rhythm/pattern props (beyond value/size/step/invert).
- Metadata rail or tally readout that reports live state.
- Deep-dive section content for the detail page (cycle diagram, frame strip).
- Reduced-motion static frame explicitly designed (not just "stop animating").
