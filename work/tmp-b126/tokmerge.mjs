// token-level 3-way merge: node tokmerge.mjs <file> <ourRef> <baseRef> <theirRef>
import { execSync, spawnSync } from 'child_process'; import fs from 'fs'; import path from 'path';
const [file, ours, base, theirs] = process.argv.slice(2);
const T = process.env.TMPDIR_B || 'work/tmp-b125';
const get = ref => execSync(`git show ${ref}:${file}`, { maxBuffer: 1 << 28 }).toString('utf8');
const tok = s => s.replace(/\r/g, '\u0001').split(/(?<=[ \n;,(){}\[\]])/).map(t => t.replace(/\n/g, '\u0002')).join('\n') + '\n';
const untok = s => s.split('\n').slice(0, -1).join('').replace(/\u0002/g, '\n').replace(/\u0001/g, '\r');
const files = { o: ours, b: base, t: theirs }; const p = {};
for (const k in files) { p[k] = path.join(T, `tm_${k}.txt`); fs.writeFileSync(p[k], tok(get(files[k]))); }
const r = spawnSync('git', ['merge-file', '-p', '--diff3', p.o, p.b, p.t], { maxBuffer: 1 << 29 });
const out = r.stdout.toString('utf8');
console.error('conflicts:', r.status);
if (r.status === 0) fs.writeFileSync(file, untok(out)); else { fs.writeFileSync(path.join(T, 'tm_conflict.txt'), out); console.error('CONFLICT see tm_conflict.txt'); }
