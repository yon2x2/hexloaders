# CORE SPEC — HEXLOADERS canonical data + file contracts (MANDATORY, do not alter constants)

## 1. Encoding law
- One hexagram = 6 lines, bottom→top. Yang(solid)=1, Yin(broken)=0. Value = 6-bit int 0–63, LSB = bottom line.
- `bitsOf(v) = [0..5].map(i => (v>>i)&1)` (bottom→top order).
- `binary` print string = TOP→BOTTOM (traditional print order): for v=26 → "011010"; v=42 → "101010"; v=63 → "111111".
- `upper = (v>>3)&7`, `lower = v&7`. Fu Xi 8×8 grid: row=upper, col=lower.

## 2. Canonical KING_WEN table (verified — copy EXACTLY)
`KING_WEN[i]` = value of the hexagram at King Wen sequence position i+1 (index 0 = position 1 乾):

```ts
export const KING_WEN: readonly number[] = [
  63,  0, 17, 34, 23, 58,  2, 16,
  55, 59,  7, 56, 61, 47,  4,  8,
  25, 38,  3, 48, 41, 37, 32,  1,
  57, 39, 33, 30, 18, 45, 28, 14,
  60, 15, 40,  5, 53, 43, 20, 10,
  35, 49, 31, 62, 24,  6, 26, 22,
  29, 46,  9, 36, 52, 11, 13, 44,
  54, 27, 50, 19, 51, 12, 42, 21,
] as const;
```

Sanity anchors (must hold): position 1 → 63 (乾 all Yang); position 2 → 0 (坤 all Yin);
position 63 → 42 既濟 (print 101010); position 64 → 21 未濟 (print 010101).

## 3. Names table (King Wen position → [chinese, pinyin, wilhelm]) — copy EXACTLY
```ts
export const HEX_NAMES: readonly (readonly [string, string, string])[] = [
  ["乾","Qián","The Creative"],["坤","Kūn","The Receptive"],["屯","Zhūn","Difficulty at the Beginning"],
  ["蒙","Méng","Youthful Folly"],["需","Xū","Waiting"],["訟","Sòng","Conflict"],["師","Shī","The Army"],
  ["比","Bǐ","Holding Together"],["小畜","Xiǎo Chù","The Taming Power of the Small"],["履","Lǚ","Treading"],
  ["泰","Tài","Peace"],["否","Pǐ","Standstill"],["同人","Tóng Rén","Fellowship"],["大有","Dà Yǒu","Great Possession"],
  ["謙","Qiān","Modesty"],["豫","Yù","Enthusiasm"],["隨","Suí","Following"],["蠱","Gǔ","Work on the Decayed"],
  ["臨","Lín","Approach"],["觀","Guān","Contemplation"],["噬嗑","Shì Kè","Biting Through"],["賁","Bì","Grace"],
  ["剝","Bō","Splitting Apart"],["復","Fù","Return"],["無妄","Wú Wàng","Innocence"],["大畜","Dà Chù","Great Taming"],
  ["頤","Yí","Nourishment"],["大過","Dà Guò","Great Exceeding"],["坎","Kǎn","The Abysmal"],["離","Lí","The Clinging"],
  ["咸","Xián","Influence"],["恆","Héng","Duration"],["遯","Dùn","Retreat"],["大壯","Dà Zhuàng","Great Power"],
  ["晉","Jìn","Progress"],["明夷","Míng Yí","Darkening of the Light"],["家人","Jiā Rén","The Family"],["睽","Kuí","Opposition"],
  ["蹇","Jiǎn","Obstruction"],["解","Xiè","Deliverance"],["損","Sǔn","Decrease"],["益","Yì","Increase"],
  ["夬","Guài","Breakthrough"],["姤","Gòu","Coming to Meet"],["萃","Cuì","Gathering Together"],["升","Shēng","Pushing Upward"],
  ["困","Kùn","Oppression"],["井","Jǐng","The Well"],["革","Gé","Revolution"],["鼎","Dǐng","The Cauldron"],
  ["震","Zhèn","The Arousing"],["艮","Gèn","Keeping Still"],["漸","Jiàn","Development"],["歸妹","Guī Mèi","The Marrying Maiden"],
  ["豐","Fēng","Abundance"],["旅","Lǚ","The Wanderer"],["巽","Xùn","The Gentle"],["兌","Duì","The Joyous"],
  ["渙","Huàn","Dispersion"],["節","Jié","Limitation"],["中孚","Zhōng Fú","Inner Truth"],["小過","Xiǎo Guò","Small Exceeding"],
  ["既濟","Jì Jì","After Completion"],["未濟","Wèi Jì","Before Completion"],
] as const;
```

## 4. File layout contract (scaffold owns these — page agents consume, never redefine)
```
src/lib/hexagrams.ts          # Line, Bits, Hexagram, bitsOf, binaryOf, KING_WEN, HEX_NAMES,
                              # HEXAGRAMS (64 generated entries), byKingwen(n), kingwenOf(value)
src/lib/registry.ts           # LoaderMeta[] — 64 named presets mapped to 11 distributable components
                              # (3 flagship slugs + 8 <mechanic>-loader templates). Single source for routes/UI.
src/index.css                 # --hexl-* tokens (design.md §9), fonts, selection, scrollbar, [data-invert]
src/registry/loaders/bit-scanner.tsx       # zero-dep flagship (design.md §8.1) — default export BitScanner
src/registry/loaders/mutating-matrix.tsx   # zero-dep flagship (design.md §8.2) — default export MutatingMatrix
src/registry/loaders/inversion-pulse.tsx   # zero-dep flagship (design.md §8.3) — default export InversionPulse
src/registry/loaders/hex-glyph.tsx         # zero-dep shared glyph primitive (SVG rects, CSS-var sized)
src/registry/loaders/generated/*.tsx       # 8 zero-dep mechanic templates; each imports ../hex-glyph
src/components/loaders/MechanicCell.tsx    # SITE-INTERNAL generic live cell: given value+mechanic renders
                                           # a mechanical animation (8 variants) — used for the 61 non-flagship
                                           # matrix cells. May import hex-glyph.tsx primitives inline.
```

## 5. Source-exposure contract (copy-paste UX)
- Registry loader sources are shown in Code tabs via Vite raw imports, e.g.:
  `import bitScannerSource from "@/registry/loaders/bit-scanner.tsx?raw"` — ALWAYS in sync, never duplicated.
- A `src/lib/sources.ts` (scaffold) aggregates: the 3 flagship raw sources + 8 mechanic-template raw sources
  + hex-glyph raw + the CSS token block string + a `registryEntryFor(slug)` JSON-string builder.
  Generated manifests preserve `loaders/generated/<mechanic>.tsx` beside `loaders/hex-glyph.tsx`.
  Page agents import from here.

## 6. Motion & color enforcement (build-team lint of honor)
- No gray hex values anywhere (`grep -Ei "#[0-9a-f]{6}" src | grep -viE "#000000|#ffffff"` must be empty,
  excluding shadcn ui/ primitives dir if pre-seeded — restyle to B/W where surfaced).
- No `ease`, `ease-in-out`, `cubic-bezier`, `linear` alone for element transitions (ticker keyframe may use
  `steps()`); allowed: `steps(n,end)`, `transition: none`, duration multiples of 120ms.
- `border-radius: 0` everywhere; no `box-shadow`, no `blur()`, no `gradient`.
