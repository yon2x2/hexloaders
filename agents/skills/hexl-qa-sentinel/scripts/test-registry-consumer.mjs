// HEXLOADERS QA Sentinel — external registry consumer proof.
// Usage:
//   node agents/skills/hexl-qa-sentinel/scripts/test-registry-consumer.mjs [registry-address]
// Example branch proof:
//   ... yon2x2/hexloaders/bit-scanner#codex/phase-2a-distribution-contract

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

const registry = JSON.parse(readFileSync('registry.json', 'utf8'));
const shadcn = `shadcn@${process.env.SHADCN_VERSION || '4.15.0'}`;
const explicitAddress = process.argv[2];
const repository = process.env.REGISTRY_REPOSITORY || 'yon2x2/hexloaders';
const ref = process.env.REGISTRY_REF ? `#${process.env.REGISTRY_REF}` : '';
const addresses = explicitAddress
  ? [explicitAddress]
  : registry.items.map((item) => `${repository}/${item.name}${ref}`);

const packageNames = (manifest) =>
  new Set([...Object.keys(manifest.dependencies || {}), ...Object.keys(manifest.devDependencies || {})]);

const resolveTarget = (target, config, app) => {
  const placeholders = {
    '@components/': 'components',
    '@ui/': 'ui',
    '@lib/': 'lib',
    '@hooks/': 'hooks',
  };
  const prefix = Object.keys(placeholders).find((candidate) => target.startsWith(candidate));
  if (!prefix) throw new Error(`Unsupported registry target: ${target}`);

  const alias = config.aliases?.[placeholders[prefix]];
  if (!alias?.startsWith('@/')) throw new Error(`Unsupported consumer alias for ${prefix}: ${alias}`);

  const relative = `${alias.slice(2)}/${target.slice(prefix.length)}`;
  return {
    file: join(app, 'src', relative),
    importPath: `@/${relative.slice(0, -extname(relative).length)}`,
  };
};

for (const address of addresses) {
  const itemName = address.split('#', 1)[0].split('/').at(-1);
  const item = registry.items.find((candidate) => candidate.name === itemName);
  if (!item) throw new Error(`Registry item not found locally: ${itemName}`);

  const workspace = mkdtempSync(join(tmpdir(), 'hexloaders-consumer-'));
  const app = join(workspace, 'app');
  const run = (command, args, cwd = workspace) => {
    console.log(`> ${command} ${args.join(' ')}`);
    execFileSync(command, args, { cwd, stdio: 'inherit' });
  };

  try {
    run('npx', [
      '--yes',
      shadcn,
      'init',
      '-t',
      'vite',
      '-b',
      'radix',
      '-p',
      'nova',
      '-n',
      'app',
      '--no-monorepo',
      '-y',
    ]);

    const before = packageNames(JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')));
    const config = JSON.parse(readFileSync(join(app, 'components.json'), 'utf8'));
    const targets = item.files.map((file) => {
      if (!file.target) throw new Error(`Registry file is missing an explicit target: ${file.path}`);
      return resolveTarget(file.target, config, app);
    });

    run('npx', ['--yes', shadcn, 'add', address, '-y'], app);

    const after = packageNames(JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')));
    const addedPackages = [...after].filter((name) => !before.has(name));
    if (addedPackages.length) throw new Error(`Registry item added runtime packages: ${addedPackages.join(', ')}`);
    console.log('PASS  zero additional packages');

    const sources = targets.map(({ file }) => readFileSync(file, 'utf8'));
    console.log(`PASS  installed ${sources.length} declared file${sources.length === 1 ? '' : 's'}`);

    const entrySource = sources[0];
    const checks = [
      ['accessible status role', /role=["']status["']/.test(entrySource)],
      ['accessible name', /aria-label=/.test(entrySource)],
      ['reduced-motion guard', entrySource.includes('prefers-reduced-motion: reduce')],
      ['default export', /export default function\s+\w+/.test(entrySource)],
      [
        'safe timer',
        !entrySource.includes('setInterval') ||
          (entrySource.includes('Math.max(120,') && entrySource.includes('clearInterval')),
      ],
    ];
    for (const [label, passed] of checks) {
      console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
      if (!passed) throw new Error(`Installed source failed check: ${label}`);
    }

    writeFileSync(
      join(app, 'src/App.tsx'),
      `import LoaderUnderTest from '${targets[0].importPath}'\n\nexport default function App() {\n  return <LoaderUnderTest />\n}\n`,
    );
    run('npm', ['run', 'build'], app);
    console.log(`PASS  consumer install and production build (${address})`);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
