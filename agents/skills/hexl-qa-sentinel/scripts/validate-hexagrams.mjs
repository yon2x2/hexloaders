// HEXLOADERS QA Sentinel — hexagram/registry integrity validation.
// Usage: node agents/skills/hexl-qa-sentinel/scripts/validate-hexagrams.mjs
// Parses src/lib/hexagrams.ts and src/lib/registry.ts as text (no TS toolchain needed).
import fs from 'fs';

let fail = 0;
const check = (ok, label) => { console.log((ok ? 'PASS' : 'FAIL') + '  ' + label); if (!ok) fail = 1; };

// ── hexagrams.ts ──
const hex = fs.readFileSync('src/lib/hexagrams.ts', 'utf8');
const kwMatch = hex.match(/KING_WEN[^=]*=\s*\[([\s\S]*?)\]/);
check(!!kwMatch, 'KING_WEN table found');
if (kwMatch) {
  const kw = kwMatch[1].split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
  check(kw.length === 64, `KING_WEN has 64 entries (got ${kw.length})`);
  check(new Set(kw).size === 64 && kw.every((n) => n >= 0 && n <= 63), 'KING_WEN is a permutation of 0..63');
  check(kw[0] === 63 && kw[1] === 0, 'anchors: pos1=63 (Qian), pos2=0 (Kun)');
  check(kw[62] === 42 && kw[63] === 21, 'anchors: pos63=42 (After Completion), pos64=21 (Before Completion)');
}
const namesMatch = hex.match(/HEX_NAMES[^=]*=\s*\[([\s\S]*?)\]\s*as const/);
check(!!namesMatch && (namesMatch[1].match(/\["/g) || []).length === 64, 'HEX_NAMES has 64 entries');

// ── registry.ts — TABLE of ['Name', 'slug', 'MECHANIC'] tuples, value = tuple index ──
const reg = fs.readFileSync('src/lib/registry.ts', 'utf8');
const tableMatch = reg.match(/TABLE[^=]*=\s*\[([\s\S]*?)\]\s*(?:as const|;)/);
check(!!tableMatch, 'registry TABLE found');
if (tableMatch) {
  const tuples = [...tableMatch[1].matchAll(/\[\s*'([^']+)',\s*'([a-z0-9-]+)',\s*'([A-Z]+)'\s*\]/g)];
  check(tuples.length === 64, `registry TABLE has 64 rows (got ${tuples.length})`);
  const slugs = tuples.map((t) => t[2]);
  check(new Set(slugs).size === slugs.length, 'registry slugs unique');
  check(['bit-scanner', 'mutating-matrix', 'inversion-pulse'].every((s) => slugs.includes(s)), '3 flagship slugs present');
  const MECHS = new Set(['SCAN', 'SEQUENCE', 'INVERT', 'SHIFT', 'COUNT', 'STACK', 'CASCADE', 'STROBE']);
  const bad = tuples.map((t) => t[3]).filter((m) => !MECHS.has(m));
  check(bad.length === 0, bad.length ? `unknown mechanics: ${[...new Set(bad)].join(',')}` : 'all mechanics valid (8 known)');
}

// ── registry.json — public GitHub source registry ──
const publicRegistry = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
check(publicRegistry.$schema === 'https://ui.shadcn.com/schema/registry.json', 'public registry uses the shadcn schema');
check(publicRegistry.name === 'hexloaders', 'public registry name is hexloaders');
const publicItems = Array.isArray(publicRegistry.items) ? publicRegistry.items : [];
check(publicItems.length === 1, `public registry has one verified item (got ${publicItems.length})`);
const bitScanner = publicItems.find((item) => item.name === 'bit-scanner');
check(!!bitScanner, 'public registry contains bit-scanner');
const bitScannerFile = bitScanner?.files?.[0];
check(
  bitScannerFile?.path === 'src/registry/loaders/bit-scanner.tsx' && fs.existsSync(bitScannerFile.path),
  'bit-scanner registry source exists',
);
check(
  bitScannerFile?.target === '@components/loaders/bit-scanner.tsx',
  'bit-scanner installs through the consumer components alias',
);

process.exit(fail);
