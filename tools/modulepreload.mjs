// tools/modulepreload.mjs - THE MODULE LIST THE PAGE PRELOADS (claude/mobile2, 2026-10-03: Daniel's phone, "load under 30 s but feels long").
// The game is ~246 unbundled ES modules, ten imports deep. A browser finds a module's imports only after it has fetched and parsed it, so the
// fetches ran as a ten-step waterfall of round trips - slow on a phone's network. <link rel="modulepreload"> for every module in index.html
// (between the two marker comments) lets the browser fetch them ALL in parallel from the first byte of the page. Order does not matter and
// nothing executes early: it only warms the module map.
//   node tools/modulepreload.mjs            check: every listed file exists; fails when more than 15 reachable modules are missing from the list
//   node tools/modulepreload.mjs --write    rewrite the block in index.html from the real import graph (run it when a lane adds modules / at release)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)), HTML = join(ROOT, 'index.html');
const BEGIN = '<!-- modulepreload:begin (tools/modulepreload.mjs --write) -->', END = '<!-- modulepreload:end -->';
const seen = new Set();
function walk(f) {
  if (seen.has(f) || !existsSync(f)) return; seen.add(f);
  const s = readFileSync(f, 'utf8'), re = /(?:^|[\n;}\s])(?:import|export)\s[^'"`;]*?from\s*['"](\.[^'"]+)['"]|(?:^|[\n;])\s*import\s*['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  let m; while ((m = re.exec(s))) { const t = m[1] || m[2] || m[3]; if (t) walk(resolve(dirname(f), t)); }
}
walk(join(ROOT, 'src/loading-screen.js')); walk(join(ROOT, 'src/main.js'));
/* dynamic import()s are followed too, but a module only ever pulled in by a tool or on demand would be fetched for nothing: keep those out of the list */
const staticSeen = new Set();
function walkStatic(f) {
  if (staticSeen.has(f) || !existsSync(f)) return; staticSeen.add(f);
  const s = readFileSync(f, 'utf8'), re = /(?:^|[\n;}\s])(?:import|export)\s[^'"`;()]*?from\s*['"](\.[^'"]+)['"]|(?:^|[\n;])\s*import\s*['"](\.[^'"]+)['"]/g;
  let m; while ((m = re.exec(s))) { const t = m[1] || m[2]; if (t) walkStatic(resolve(dirname(f), t)); }
}
walkStatic(join(ROOT, 'src/loading-screen.js')); walkStatic(join(ROOT, 'src/main.js'));
const want = [...staticSeen].map(f => './' + relative(ROOT, f).replace(/\\/g, '/')).filter(f => f !== './src/main.js' && f !== './src/loading-screen.js').sort();
const html = readFileSync(HTML, 'utf8'), crlf = html.includes('\r\n'), NL = crlf ? '\r\n' : '\n';
const block = [BEGIN, ...want.map(f => '<link rel="modulepreload" href="' + f + '">'), END].join(NL);
if (process.argv.includes('--write')) {
  const a = html.indexOf(BEGIN), b = html.indexOf(END);
  let out;
  if (a >= 0 && b > a) out = html.slice(0, a) + block + html.slice(b + END.length);
  else { const tag = '<script type="module" src="./src/loading-screen.js"></script>'; out = html.replace(tag, block + NL + tag); }
  if (!out.includes(BEGIN)) { console.log('FAIL could not find the loading-screen script tag to put the list before'); process.exit(1); }
  writeFileSync(HTML, out); console.log('modulepreload: ' + want.length + ' modules written to index.html'); process.exit(0);
}
const a = html.indexOf(BEGIN), b = html.indexOf(END), fails = [];
if (a < 0 || b < a) { console.log('FAIL index.html has no modulepreload block (node tools/modulepreload.mjs --write)'); process.exit(1); }
const have = [...html.slice(a, b).matchAll(/href="([^"]+)"/g)].map(m => m[1]);
for (const h of have) if (!existsSync(join(ROOT, h))) fails.push('index.html preloads ' + h + ', which does not exist');
const missing = want.filter(f => !have.includes(f));
if (missing.length > 15) fails.push(missing.length + ' modules are imported but not preloaded (e.g. ' + missing.slice(0, 3).join(', ') + '): run node tools/modulepreload.mjs --write');
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('modulepreload: ' + have.length + ' modules listed, ' + missing.length + ' reachable ones not yet in the list (budget 15).');
