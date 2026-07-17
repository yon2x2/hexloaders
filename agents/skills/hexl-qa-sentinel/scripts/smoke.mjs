// HEXLOADERS QA Sentinel — jsdom memory smoke harness.
// Usage: npm i -D jsdom && npm run build &&
//        node --max-old-space-size=3072 agents/skills/hexl-qa-sentinel/scripts/smoke.mjs <route>
// Exit 0 = bounded heap 30s · Exit 2 = heap explosion · Exit 3 = eval error.
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const route = process.argv[2] || '/';
const root = process.cwd();
const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost' + route, runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
// Fire IO once async, like a real browser revealing sections:
window.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { setTimeout(() => this.cb([{ isIntersecting: true, target: el }], this), 50); }
  unobserve() {} disconnect() {}
};
window.ResizeObserver = window.IntersectionObserver;
window.scrollTo = () => {};

const jsFile = fs.readdirSync(path.join(root, 'dist/assets')).find((f) => f.endsWith('.js'));
const js = fs.readFileSync(path.join(root, 'dist/assets', jsFile), 'utf8');

let peak = 0;
const timer = setInterval(() => {
  const m = process.memoryUsage().heapUsed / 1048576;
  peak = Math.max(peak, m);
  if (m > 2500) { console.log(route, 'FAIL heap>2.5GB — runaway allocation'); process.exit(2); }
}, 1000);
setTimeout(() => {
  clearInterval(timer);
  const rootEl = window.document.getElementById('root');
  console.log(route, 'OK 30s peak=' + peak.toFixed(0) + 'MB root=' + (rootEl ? rootEl.children.length : '?'));
  process.exit(0);
}, 30000);
try { window.eval(js); } catch (e) { console.log(route, 'EVAL ERROR:', e.message); process.exit(3); }
