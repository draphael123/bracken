// tools/deploy-surface.mjs - THE DEPLOY LEAVES THE WORKSHOP OUT, AND KEEPS WHAT THE GAME LOADS (claude/shipfix).
// .vercelignore hides tools/, docs/, work/, audits/, src/benched and the root design notes from the public site. This check reads that file with a small
// gitignore matcher (the subset it uses: '#', '!', a leading '/', a trailing '/', '*' inside a name) and asserts, against the tree itself:
//   - everything the page really loads stays reachable: index.html, sw.js, the manifest, favicon.ico, icons/, fonts/, audio/, EVERY src/ file the game imports (src/draft
//     is imported by the caravan and the unburied field, so it is NOT hidden), and the two data files it fetches by name (docs/updates.json, tools/fixtures/campaign-xp.json)
//   - the workshop IS hidden: tools/*.mjs, docs/DESIGN.md, work/, audits/, src/benched/, the root *.md
//   - every fetch('...') literal in src/ names a reachable file, so a new data file cannot be hidden by accident.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const rules = readFileSync(join(ROOT, '.vercelignore'), 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
const ESC = /[.+^${}()|[\]\\]/g;
const rx = pat => {
  const anchored = pat.startsWith('/') || pat.slice(0, -1).includes('/'), p = pat.replace(/^\//, '').replace(/\/$/, '');
  const body = p.split('/').map(seg => seg.replace(ESC, c => '\\' + c).replace(/\*/g, '[^/]*')).join('/');
  return new RegExp((anchored ? '^' : '(^|/)') + body + '(/.*)?$');
};
const compiled = rules.map(r => { const neg = r.startsWith('!'), pat = neg ? r.slice(1) : r; return { neg, re: rx(pat) }; });
/* gitignore: the LAST matching rule wins (a '*' rule hides the files under a directory, which is why the negations name files and dirs separately) */
const ignored = path => { let hide = false; for (const { neg, re } of compiled) if (re.test(path)) hide = !neg; return hide; };

const files = (dir, out = []) => { for (const n of readdirSync(dir)) { if (n === '.git' || n === 'node_modules') continue; const p = join(dir, n), s = statSync(p); if (s.isDirectory()) files(p, out); else out.push(relative(ROOT, p).replace(/\\/g, '/')); } return out; };
const all = files(ROOT);
const mustServe = ['index.html', 'sw.js', 'manifest.webmanifest', 'favicon.ico', 'docs/updates.json', 'tools/fixtures/campaign-xp.json', 'audio/manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png', 'fonts/PressStart2P-Regular.ttf', 'fonts/Silkscreen-Regular.ttf'];
for (const f of mustServe) { assert.ok(existsSync(join(ROOT, f)), 'the page names ' + f + ' but it is not in the tree'); assert.ok(!ignored(f), f + ' is hidden by .vercelignore but the game loads it'); }
const srcFiles = all.filter(f => f.startsWith('src/') && !f.startsWith('src/benched/'));
const hiddenSrc = srcFiles.filter(ignored); assert.deepEqual(hiddenSrc, [], 'src files hidden from the deploy: ' + hiddenSrc.slice(0, 5).join(', '));
for (const dir of ['audio', 'fonts', 'icons']) { const bad = all.filter(f => f.startsWith(dir + '/') && ignored(f)); assert.deepEqual(bad, [], dir + '/ files hidden: ' + bad.slice(0, 5).join(', ')); }
/* no src file imports from the hidden benches (comments do not count) */
for (const f of srcFiles.filter(f => f.endsWith('.js'))) { const t = readFileSync(join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ''); assert.ok(!/(?:from|import\()\s*['"][^'"]*\/benched\//.test(t), f + ' imports from src/benched, which the deploy hides'); }
/* every fetch of a literal path in src/ stays reachable (a variable URL, TRACKS[name], is audio/: checked above) */
const fetched = new Set();
for (const f of srcFiles.filter(f => f.endsWith('.js'))) for (const m of readFileSync(join(ROOT, f), 'utf8').matchAll(/fetch\(\s*['"]([^'"?]+)['"]/g)) if (!/^https?:/.test(m[1]) && !m[1].startsWith('/')) fetched.add(m[1].replace(/^\.\//, ''));
for (const f of fetched) assert.ok(existsSync(join(ROOT, f)) && !ignored(f), 'src fetches ' + f + ': it must exist and not be hidden');
/* the workshop is hidden */
const workshop = all.filter(f => /^(tools\/[^/]+\.(mjs|py|sh|cjs)|docs\/(DESIGN|PLAYTEST|INTEGRATOR)\.md|work\/|audits\/|src\/benched\/|[^/]+\.md$)/.test(f));
assert.ok(workshop.length > 50, 'expected the workshop to have files to hide');
const shown = workshop.filter(f => !ignored(f)); assert.deepEqual(shown, [], 'workshop files still deployed: ' + shown.slice(0, 8).join(', '));
console.log('ok  deploy surface: ' + all.filter(f => !ignored(f)).length + ' files deployed, ' + all.filter(ignored).length + ' hidden; fetched by name: ' + [...fetched].join(', '));
