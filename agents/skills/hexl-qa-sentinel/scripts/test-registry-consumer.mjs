// HEXLOADERS QA Sentinel — external registry consumer proof.
// Usage:
//   node agents/skills/hexl-qa-sentinel/scripts/test-registry-consumer.mjs [registry-address]
// Example branch proof:
//   ... yon2x2/hexloaders/bit-scanner#codex/bit-scanner-registry-proof

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const address = process.argv[2] || 'yon2x2/hexloaders/bit-scanner';
const workspace = mkdtempSync(join(tmpdir(), 'hexloaders-consumer-'));
const app = join(workspace, 'app');

const run = (command, args, cwd = workspace) => {
  console.log(`> ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
};

try {
  run('npx', [
    '--yes',
    'shadcn@latest',
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
  run('npx', ['--yes', 'shadcn@latest', 'add', address, '-y'], app);

  const installed = join(app, 'src/components/loaders/bit-scanner.tsx');
  const source = readFileSync(installed, 'utf8');
  const checks = [
    ['accessible status role', source.includes('role="status"')],
    ['reduced-motion rule', source.includes('prefers-reduced-motion: reduce')],
    ['default export', source.includes('export default function BitScanner')],
  ];
  for (const [label, passed] of checks) {
    console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
    if (!passed) throw new Error(`Installed source failed check: ${label}`);
  }

  writeFileSync(
    join(app, 'src/App.tsx'),
    `import BitScanner from '@/components/loaders/bit-scanner'\n\nexport default function App() {\n  return <BitScanner value={26} size={96} showMeta />\n}\n`,
  );
  run('npm', ['run', 'build'], app);
  console.log(`PASS  consumer install and production build (${address})`);
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
