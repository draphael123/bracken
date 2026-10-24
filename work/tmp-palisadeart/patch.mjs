// helper: exact-string edits that keep a file's line endings. usage (from a script): import { edit } from './patch.mjs'; edit(file, old, new)
import { readFileSync, writeFileSync } from 'node:fs';
export function edit(file, oldS, newS, opt = {}) {
  let s = readFileSync(file, 'utf8'); const crlf = s.includes('\r\n');
  const o = crlf ? oldS.replace(/\r?\n/g, '\r\n') : oldS, n = crlf ? newS.replace(/\r?\n/g, '\r\n') : newS;
  const cnt = s.split(o).length - 1;
  if (cnt !== 1 && !opt.all) throw new Error(file + ': expected 1 match, found ' + cnt + ' for ' + JSON.stringify(oldS.slice(0, 80)));
  if (cnt === 0) throw new Error('no match');
  s = opt.all ? s.split(o).join(n) : s.replace(o, () => n);
  writeFileSync(file, s); return cnt;
}
