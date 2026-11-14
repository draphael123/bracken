// node-only: checks the PAGE TOOL label on tools/ (no browser)
/* page-tool-lint: every tool in tools/ that launches headless Chrome - it imports tools/cdp.mjs or tools/boss-level.mjs (or tools/browser-profile.mjs, the launcher under them),
   directly or through another tool (static import, export-from, or a string-literal import() ), or spawns one as a child process on a spawn/exec/fork line - carries the first-line header
       // PAGE TOOL: launches headless Chrome
   (after a #! line, if the file has one), and no tool that is NOT such a page tool carries it. The label is how a lane, on a machine with little RAM, tells a
   browser tool from a node-only one before it runs it (the desktop rules: one headless browser at a time, >= 1500 MB free before each).
     node tools/page-tool-lint.mjs            check (exit 1 and a list on any miss)
     node tools/page-tool-lint.mjs --list     print the page tools (one per line) and exit 0
     node tools/page-tool-lint.mjs --fix      add the header to a page tool that lacks it, take it off a tool that should not have it
   Scope: tools/*.mjs and tools/*.js|cjs at the top level (the subfolders are fixtures and data). tools/check.mjs, the suite runner, starts the browser itself and is a root below. */
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const dir = path.dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
export const HEADER = '// PAGE TOOL: launches headless Chrome';
const ROOTS = new Set(['cdp.mjs', 'boss-level.mjs', 'browser-profile.mjs']);
const files = fs.readdirSync(dir).filter(f => /\.(mjs|cjs|js)$/.test(f) && fs.statSync(path.join(dir, f)).isFile());
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');   /* comments out, so a name in prose is not an import */
const edges = new Map();
for (const f of files) {
  const s = strip(fs.readFileSync(path.join(dir, f), 'utf8')), to = new Set();
  const re = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)(['"])(\.\/[^'"]+?)\1/g; let m;
  while ((m = re.exec(s))) { const t = path.basename(m[2]); if (files.includes(t)) to.add(t); }
  /* a tool that SPAWNS a page tool as a child (spawn/exec/fork line naming tools/x.mjs or x.mjs in a string) launches the browser through it */
  for (const ln of s.split('\n')) if (/\b(?:spawn|spawnSync|exec|execSync|execFile|execFileSync|fork)\b/.test(ln)) for (const q of ln.matchAll(/['"`](?:\.\/|tools[\/\\])?([\w.-]+\.m?js)['"`]/g)) if (files.includes(q[1]) && q[1] !== f) to.add(q[1]);
  edges.set(f, to);
}
const page = new Set(ROOTS);
for (let changed = true; changed;) { changed = false; for (const [f, to] of edges) if (!page.has(f) && [...to].some(t => page.has(t))) { page.add(f); changed = true; } }
for (const f of ['check.mjs', 'restamp.mjs']) if (files.includes(f)) page.add(f); /* restamp.mjs spawns its page tools from a table of argument lists, which the line scan cannot read */ // /* the suite runner launches the shared browser itself (it lends it to its children: BRACKEN_BROWSER_PORT) */
const lines = f => fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/);
const firstReal = f => { const L = lines(f); return L[0] && L[0].startsWith('#!') ? 1 : 0; };
const labelled = f => (lines(f)[firstReal(f)] || '').trim() === HEADER;
if (args.includes('--list')) { [...page].filter(f => files.includes(f)).sort().forEach(f => console.log(f)); process.exit(0); }
const missing = [...page].filter(f => files.includes(f) && f !== 'page-tool-lint.mjs' && !labelled(f)).sort();
const extra = files.filter(f => !page.has(f) && labelled(f)).sort();
if (args.includes('--fix')) {
  /* byte-exact: only the header line is added or removed; every other line keeps the file's own line ends (several tools have mixed CRLF/LF, and a rewrite would touch every line) */
  const eol = (raw, from) => { const k = raw.indexOf('\n', from); return k > 0 && raw[k - 1] === '\r' ? '\r\n' : '\n'; };
  for (const f of missing) { const p = path.join(dir, f), raw = fs.readFileSync(p, 'utf8'), at = firstReal(f) ? raw.indexOf('\n') + 1 : 0; fs.writeFileSync(p, raw.slice(0, at) + HEADER + eol(raw, at) + raw.slice(at)); }
  for (const f of extra) { const p = path.join(dir, f), raw = fs.readFileSync(p, 'utf8'), at = firstReal(f) ? raw.indexOf('\n') + 1 : 0, end = raw.indexOf('\n', at) + 1; fs.writeFileSync(p, raw.slice(0, at) + raw.slice(end)); }
  console.log('page-tool-lint --fix: labelled ' + missing.length + ', unlabelled ' + extra.length); process.exit(0);
}
if (missing.length || extra.length) {
  console.log('page-tool-lint FAIL: ' + missing.length + ' page tool(s) without the header, ' + extra.length + ' non-page tool(s) carrying it');
  missing.slice(0, 40).forEach(f => console.log('  missing  tools/' + f)); if (missing.length > 40) console.log('  ... ' + (missing.length - 40) + ' more');
  extra.forEach(f => console.log('  extra    tools/' + f));
  console.log('  Fix: node tools/page-tool-lint.mjs --fix'); process.exit(1);
}
console.log('page-tool-lint OK: ' + [...page].filter(f => files.includes(f)).length + ' page tools labelled, ' + (files.length - [...page].filter(f => files.includes(f)).length) + ' node-only tools unlabelled');
