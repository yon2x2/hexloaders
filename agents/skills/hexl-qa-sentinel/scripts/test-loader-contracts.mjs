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
