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
  const flagships = new Set(['bit-scanner', 'mutating-matrix', 'inversion-pulse']);
  const components = tuples.map((tuple) =>
    flagships.has(tuple[2]) ? tuple[2] : `${tuple[3].toLowerCase()}-loader`,
  );
  check(new Set(components).size === 11, '64 presets resolve to 11 distributable components');
}

// ── generated source bundle — mechanic template + sibling primitive ──
const sources = fs.readFileSync('src/lib/sources.ts', 'utf8');
check(
  sources.includes('loaders/generated/${meta.mechanic.toLowerCase()}.tsx') &&
    sources.includes("'loaders/hex-glyph.tsx'"),
  'generated manifests preserve template + primitive paths',
);
for (const mechanic of ['scan', 'sequence', 'invert', 'shift', 'count', 'stack', 'cascade', 'strobe']) {
  const source = fs.readFileSync(`src/registry/loaders/generated/${mechanic}.tsx`, 'utf8');
  check(source.includes("from '../hex-glyph'"), `${mechanic}-loader resolves the shared primitive`);
}

// ── registry.json — public GitHub source registry ──
const publicRegistry = JSON.parse(fs.readFileSync('registry.json', 'utf8'));
check(publicRegistry.$schema === 'https://ui.shadcn.com/schema/registry.json', 'public registry uses the shadcn schema');
check(publicRegistry.name === 'hexloaders', 'public registry name is hexloaders');
const publicItems = Array.isArray(publicRegistry.items) ? publicRegistry.items : [];
check(publicItems.length > 0, `public registry has verified items (got ${publicItems.length})`);
check(
  new Set(publicItems.map((item) => item.name)).size === publicItems.length,
  'public registry item names are unique',
);
const publishedMatch = reg.match(/PUBLISHED_REGISTRY_COMPONENTS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
const publishedComponents = publishedMatch ? [...publishedMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]) : [];
const publicNames = publicItems.map((item) => item.name);
check(
  publishedComponents.length === publicNames.length &&
    publishedComponents.every((name) => publicNames.includes(name)),
  'public registry matches components marked as published',
);
const bitScanner = publicItems.find((item) => item.name === 'bit-scanner');
check(!!bitScanner, 'public registry contains bit-scanner');
for (const item of publicItems) {
  const files = Array.isArray(item.files) ? item.files : [];
  check(files.length > 0, `${item.name} declares files`);
  check(
    files.every((file) => typeof file.path === 'string' && fs.existsSync(file.path)),
    `${item.name} registry sources exist`,
  );
  check(
    files.every((file) => /^@(components|ui|lib|hooks)\//.test(file.target ?? '')),
    `${item.name} uses explicit portable targets`,
  );
  check(
    new Set(files.map((file) => file.target)).size === files.length,
    `${item.name} targets are unique`,
  );
}

process.exit(fail);
