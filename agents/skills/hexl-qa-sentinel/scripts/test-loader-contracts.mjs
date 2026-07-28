// HEXLOADERS QA Sentinel — runtime contracts for every published registry entry.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const registry = JSON.parse(readFileSync('registry.json', 'utf8'));
const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { hmr: false, middlewareMode: true },
});

const count = (source, pattern) => source.match(pattern)?.length ?? 0;
const check = (label, assertion) => {
  assertion();
  console.log(`PASS  ${label}`);
};

const timedSources = [
  'src/registry/loaders/bit-scanner.tsx',
  'src/registry/loaders/mutating-matrix.tsx',
  'src/registry/loaders/inversion-pulse.tsx',
  'src/registry/loaders/hex-glyph.tsx',
  ...['cascade', 'count', 'invert', 'scan', 'sequence', 'shift', 'stack', 'strobe'].map(
    (name) => `src/registry/loaders/generated/${name}.tsx`,
  ),
];

try {
  const registryModule = await server.ssrLoadModule('/src/lib/registry.ts');
  const sourcesModule = await server.ssrLoadModule('/src/lib/sources.ts');
  const registryByName = new Map(registry.items.map((item) => [item.name, item]));

  check('all 64 presets resolve to the public component symbol and installed path', () => {
    assert.equal(registryModule.LOADERS.length, 64);
    for (const meta of registryModule.LOADERS) {
      const item = registryByName.get(meta.component);
      assert.ok(item, `${meta.slug}: missing registry item ${meta.component}`);
      const identity = registryModule.publicComponentFor(meta);
      const entry = item.files[0];
      const expectedImport = entry.target
        .replace(/^@components\//, '@/components/')
        .replace(/\.tsx$/, '');
      const source = readFileSync(entry.path, 'utf8');
      const exportedName = source.match(/export default function\s+(\w+)/)?.[1];

      assert.equal(identity.importPath, expectedImport, `${meta.slug}: import path`);
      assert.equal(identity.name, exportedName, `${meta.slug}: component symbol`);
    }
  });

  check('all 64 manual file sets match their registry item', () => {
    for (const meta of registryModule.LOADERS) {
      const item = registryByName.get(meta.component);
      const manualPaths = sourcesModule.loaderFilesFor(meta.slug).map((file) => file.path);
      const installedPaths = item.files.map((file) => file.target.replace(/^@components\//, 'components/'));
      assert.deepEqual(manualPaths, installedPaths, `${meta.slug}: manual file set`);
    }
  });

  check('public previews use installed components instead of the matrix simulator', () => {
    for (const path of [
      'src/pages/Playground.tsx',
      'src/components/loader-detail/LoaderLive.tsx',
      'src/components/interactive/vignettes.tsx',
    ]) {
      assert.doesNotMatch(readFileSync(path, 'utf8'), /\bMechanicCell\b/, path);
    }
    const playground = readFileSync('src/pages/Playground.tsx', 'utf8');
    assert.match(playground, /publicComponentFor\(meta\)/);
    assert.match(playground, /const clock = flagship \? intervalMs : 120/);
    assert.match(playground, /const effectiveInterval = held \? HOLD_INTERVAL : clock/);
    assert.doesNotMatch(playground, /@\/loaders\//);
  });

  for (const item of registry.items) {
    const entry = item.files[0];
    const module = await server.ssrLoadModule(`/${entry.path}`);
    const html = renderToStaticMarkup(createElement(module.default));

    check(`${item.name} renders without browser globals`, () => assert.ok(html.length > 0));
    check(`${item.name} exposes one status`, () => assert.equal(count(html, /role="status"/g), 1));
    check(`${item.name} exposes an accessible name`, () => assert.match(html, /aria-label="Loading"/));
    check(`${item.name} hides nested glyph semantics`, () => {
      if (html.includes('role="img"')) assert.match(html, /role="img"[^>]*aria-hidden="true"/);
    });
  }

  const inversionModule = await server.ssrLoadModule('/src/registry/loaders/inversion-pulse.tsx');
  for (const [label, pattern, expectedSegments] of [
    ['empty pattern falls back', [], 6],
    ['zero pattern normalizes', [0, 0], 2],
    ['negative pattern normalizes', [-1, 1], 2],
    ['non-finite pattern normalizes', [Number.NaN, Number.POSITIVE_INFINITY], 2],
  ]) {
    const html = renderToStaticMarkup(createElement(inversionModule.default, { pattern }));
    check(label, () => {
      assert.equal(count(html, /class="hexl-ip-seg/g), expectedSegments);
      assert.doesNotMatch(html, /NaN|Infinity/);
    });
  }

  const glyphModule = await server.ssrLoadModule('/src/registry/loaders/hex-glyph.tsx');
  const first = renderToStaticMarkup(createElement(glyphModule.default, { animated: 'cycle', value: 42 }));
  const second = renderToStaticMarkup(createElement(glyphModule.default, { animated: 'cycle', value: 42 }));
  check('HexGlyph cycle render is deterministic', () => assert.equal(first, second));

  for (const path of timedSources) {
    const source = readFileSync(path, 'utf8');
    check(`${path} clamps invalid timer input`, () => {
      assert.match(source, /Number\.isFinite\((?:step|interval)\)/);
      assert.match(source, /2_147_483_647/);
    });
  }

  for (const path of [
    'src/registry/loaders/inversion-pulse.tsx',
    ...['cascade', 'count', 'invert', 'scan', 'sequence', 'shift', 'stack', 'strobe'].map(
      (name) => `src/registry/loaders/generated/${name}.tsx`,
    ),
  ]) {
    const source = readFileSync(path, 'utf8');
    check(`${path} starts from a static SSR frame`, () => assert.match(source, /useState\(true\)/));
  }

  for (const name of ['cascade', 'count', 'invert', 'scan', 'sequence', 'shift', 'stack', 'strobe']) {
    const source = readFileSync(`src/registry/loaders/generated/${name}.tsx`, 'utf8');
    const glyphs = source.match(/<HexGlyph\b[^>]*\/>/g) ?? [];
    check(`${name}-loader hides every nested glyph`, () => {
      assert.ok(glyphs.length > 0);
      assert.ok(glyphs.every((glyph) => glyph.includes('aria-hidden="true"')));
    });
  }

  const strobeSource = readFileSync('src/registry/loaders/generated/strobe.tsx', 'utf8');
  const loaderDetailSource = readFileSync('src/pages/LoaderDetail.tsx', 'utf8');
  const mechanicCellSource = readFileSync('src/components/loaders/MechanicCell.tsx', 'utf8');
  const mechanicsReference = readFileSync(
    'agents/skills/hexl-loader-forge/references/mechanics.md',
    'utf8',
  );
  check('strobe keeps its safe 960ms cycle in sync', () => {
    assert.match(strobeSource, /Math\.floor\(tick\s*\/\s*2\)\s*%\s*4/);
    assert.match(mechanicCellSource, /Math\.floor\(t\s*\/\s*2\)\s*%\s*4/);
    assert.match(loaderDetailSource, /STROBE:\s*960/);
    assert.match(mechanicsReference, /\| STROBE \|[^\n]+\| 960ms \|/);
  });

  for (const item of registry.items) {
    const entry = item.files[0];
    const module = await server.ssrLoadModule(`/${entry.path}`);
    const timerProp = ['mutating-matrix', 'inversion-pulse'].includes(item.name) ? 'interval' : 'step';
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_VALUE]) {
      const html = renderToStaticMarkup(createElement(module.default, { [timerProp]: value }));
      check(`${item.name} safely renders ${timerProp}=${String(value)}`, () => {
        assert.doesNotMatch(html, /NaN|Infinity/);
      });
    }
  }
} finally {
  await server.close();
}
