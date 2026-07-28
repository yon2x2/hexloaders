// HEXLOADERS QA Sentinel — external registry consumer proof.
// Usage:
//   node agents/skills/hexl-qa-sentinel/scripts/test-registry-consumer.mjs [registry-address ...]
// With multiple registry items, the script verifies every item alone and all items together.

import { execFileSync } from 'node:child_process';
import { globSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { tmpdir } from 'node:os';

const registry = JSON.parse(readFileSync('registry.json', 'utf8'));
const shadcn = `shadcn@${process.env.SHADCN_VERSION || '4.15.0'}`;
const repository = process.env.REGISTRY_REPOSITORY || 'yon2x2/hexloaders';
const ref = process.env.REGISTRY_REF ? `#${process.env.REGISTRY_REF}` : '';
const requestedAddresses = process.argv.slice(2);
const addresses = requestedAddresses.length
  ? requestedAddresses
  : registry.items.map((item) => `${repository}/${item.name}${ref}`);
const groups = addresses.map((address) => [address]);
if (addresses.length > 1) groups.push(addresses);

const itemNameFromAddress = (address) =>
  decodeURIComponent(address.split('#', 1)[0].split('/').at(-1)).replace(/\.json$/, '');

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
    sourcePath: `src/${relative}`,
    importPath: `@/${relative.slice(0, -extname(relative).length)}`,
  };
};

const sourceFiles = (app) =>
  new Set(globSync('src/**/*', { cwd: app }).filter((file) => extname(file)));

const sourceSnapshot = (app) =>
  new Map([...sourceFiles(app)].map((file) => [file, readFileSync(join(app, file), 'utf8')]));

const sameSet = (left, right) =>
  left.size === right.size && [...left].every((value) => right.has(value));

for (const group of groups) {
  const items = group.map((address) => {
    const itemName = itemNameFromAddress(address);
    const item = registry.items.find((candidate) => candidate.name === itemName);
    if (!item) throw new Error(`Registry item not found locally: ${itemName}`);
    return item;
  });

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
      '-d',
      '-y',
    ]);

    const configPath = join(app, 'components.json');
    const packagePath = join(app, 'package.json');
    const lockPath = join(app, 'package-lock.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const before = {
      config: readFileSync(configPath, 'utf8'),
      manifest: readFileSync(packagePath, 'utf8'),
      lockfile: readFileSync(lockPath, 'utf8'),
      sources: sourceSnapshot(app),
    };

    const targets = new Map();
    const entries = items.map((item) => {
      const itemTargets = item.files.map((file) => {
        if (!file.target) throw new Error(`Registry file is missing an explicit target: ${file.path}`);
        const target = resolveTarget(file.target, config, app);
        targets.set(target.sourcePath, target);
        return target;
      });
      return { item, target: itemTargets[0] };
    });

    run('npx', ['--yes', shadcn, 'add', ...group, '-y'], app);

    if (readFileSync(packagePath, 'utf8') !== before.manifest) {
      throw new Error('Registry install changed package.json');
    }
    if (readFileSync(lockPath, 'utf8') !== before.lockfile) {
      throw new Error('Registry install changed package-lock.json');
    }
    if (readFileSync(configPath, 'utf8') !== before.config) {
      throw new Error('Registry install changed components.json');
    }
    console.log('PASS  package manifest, lockfile, and shadcn config unchanged');

    const afterSources = sourceSnapshot(app);
    for (const [file, source] of before.sources) {
      if (afterSources.get(file) !== source) {
        throw new Error(`Registry install changed or removed existing source: ${file}`);
      }
    }
    console.log('PASS  existing consumer source files unchanged');

    const addedFiles = new Set([...afterSources.keys()].filter((file) => !before.sources.has(file)));
    const expectedFiles = new Set(targets.keys());
    if (!sameSet(addedFiles, expectedFiles)) {
      throw new Error(
        `Installed files differ from registry declaration: expected ${[...expectedFiles].join(', ')}; got ${[...addedFiles].join(', ')}`,
      );
    }
    console.log(`PASS  installed exactly ${expectedFiles.size} unique declared file${expectedFiles.size === 1 ? '' : 's'}`);

    for (const { item, target } of entries) {
      const entrySource = readFileSync(target.file, 'utf8');
      const checks = [
        ['accessible status role', /role=["']status["']/.test(entrySource)],
        ['accessible name', /aria-label=/.test(entrySource)],
        ['reduced-motion guard', entrySource.includes('prefers-reduced-motion: reduce')],
        ['default export', /export default function\s+\w+/.test(entrySource)],
        [
          'safe timer',
          !entrySource.includes('setInterval') ||
            (entrySource.includes('Number.isFinite') &&
              entrySource.includes('2_147_483_647') &&
              entrySource.includes('clearInterval')),
        ],
      ];
      for (const [label, passed] of checks) {
        console.log(`${passed ? 'PASS' : 'FAIL'}  ${item.name}: ${label}`);
        if (!passed) throw new Error(`Installed source failed check: ${item.name}: ${label}`);
      }
    }

    const imports = entries
      .map(({ target }, index) => `import Loader${index} from '${target.importPath}'`)
      .join('\n');
    const loaders = entries.map((_, index) => `      <Loader${index} />`).join('\n');
    writeFileSync(
      join(app, 'src/App.tsx'),
      `${imports}\n\nexport default function App() {\n  return (\n    <main>\n${loaders}\n    </main>\n  )\n}\n`,
    );
    run('npm', ['run', 'build'], app);

    const label = items.map((item) => item.name).join(', ');
    console.log(`PASS  consumer install and production build (${label})`);
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
}
