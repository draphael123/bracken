// The syntax gate, shared by serial and sharded runners. A named subset retains the changed-files optimization.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const files = [];
function walk(dir) { for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
  const p = join(dir, e.name); if (e.isDirectory()) walk(p); else if (/\.m?js$/.test(e.name)) files.push(p);
} }
walk('src'); walk('tools');
const changed = process.argv.includes('--changed');
const status = changed ? spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }) : null;
if (status && status.status !== 0) throw new Error('could not inspect changed files: ' + status.stderr);
const touched = new Set((status?.stdout || '').split(/\r?\n/).map(l => l.slice(3).trim().replace(/\\/g, '/')));
const selected = files.filter(f => !changed || touched.has(f.replace(/\\/g, '/')));
let bad = 0;
for (const f of selected) { const r = spawnSync(process.execPath, ['--check', f], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) { bad++; console.error(f + ': ' + (r.stderr || r.error?.message || 'parse failed')); }
}
console.log(bad ? bad + ' files do not parse' : selected.length + ' files parse');
process.exitCode = bad ? 1 : 0;
