/**
 * HEXLOADERS — hexagrams.ts
 * The canonical 6-bit dictionary. Single source of truth shipped with the library.
 *
 * Encoding law: one hexagram = 6 lines, bottom→top. Yang (solid) = 1, Yin (broken) = 0.
 * Value = 6-bit int 0–63, LSB = bottom line. upper = bits 3–5, lower = bits 0–2.
 * Fu Xi 8×8 grid: row = upper, col = lower. Address = (upper << 3) | lower.
 *
 * MIT License — tables verified against core-spec (do not alter constants).
 */

export type Line = 0 | 1; // 0 = Yin (broken) · 1 = Yang (solid)
export type Bits = [Line, Line, Line, Line, Line, Line]; // bottom → top

export interface Hexagram {
  value: number; // 0–63, LSB = bottom line
  bits: Bits; // derived, bottom → top
  upper: number; // 0–7 trigram (bits 3–5)
  lower: number; // 0–7 trigram (bits 0–2)
  kingwen: number; // 1–64, sequence position (lookup table)
  binary: string; // "011010" (top→bottom, print order)
}

export const bitsOf = (v: number): Bits =>
  [0, 1, 2, 3, 4, 5].map((i) => ((v >> i) & 1) as Line) as Bits;

/** Print string in traditional TOP→BOTTOM order. binaryOf(26) === "011010". */
export const binaryOf = (v: number): string =>
  bitsOf(v)
    .slice()
    .reverse()
    .join('');

/** KING_WEN[i] = value of the hexagram at King Wen sequence position i+1. */
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

/** HEX_NAMES[position - 1] = [chinese, pinyin, wilhelm]. */
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

/** The 64 generated dictionary entries, in Fu Xi (value) order 0–63. */
export const HEXAGRAMS: readonly Hexagram[] = Array.from({ length: 64 }, (_, v) => ({
  value: v,
  bits: bitsOf(v),
  upper: (v >> 3) & 7,
  lower: v & 7,
  kingwen: KING_WEN.indexOf(v) + 1,
  binary: binaryOf(v),
}));

/** Hexagram at King Wen sequence position n (1–64). */
export const byKingwen = (n: number): Hexagram => HEXAGRAMS[KING_WEN[n - 1]];

/** King Wen sequence position (1–64) of a 6-bit value (0–63). */
export const kingwenOf = (value: number): number => KING_WEN.indexOf(value) + 1;

/* Sanity anchors (core-spec §2): position 1 → 63 乾 · position 2 → 0 坤 ·
   position 63 → 42 既濟 (101010) · position 64 → 21 未濟 (010101). */
