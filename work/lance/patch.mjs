// work/lance/patch.mjs - asserted exact-match replacements (the repo's patch discipline, in Node: there is no Python here).
// Every pattern must match exactly once, or its replacement must already be there exactly once (a re-run is a no-op).
// Nothing is written unless every replacement in the set succeeds. Patterns are written with LF and converted to the
// file's own line endings (the working tree is CRLF).
import { readFileSync, writeFileSync } from 'node:fs';
const count = (s, t) => { let n = 0, i = 0; while ((i = s.indexOf(t, i)) >= 0) { n++; i += t.length; } return n; };
export function patch(file, reps) {
  let s = readFileSync(file, 'utf8'); const crlf = s.includes('\r\n'), eol = t => crlf ? t.replace(/\r?\n/g, '\r\n') : t;
  let changed = 0;
  for (const [a0, b0] of reps) { const a = eol(a0), b = eol(b0), na = count(s, a), nb = b ? count(s, b) : 0;
    if (na === 1) { s = s.replace(a, () => b); changed++; }
    else if (na === 0 && nb >= 1) continue;
    else throw new Error(file + ': pattern matched ' + na + ' times (replacement present ' + nb + '): ' + a0.slice(0, 120)); }
  if (changed) writeFileSync(file, s);
  console.log(file + ': ' + changed + ' of ' + reps.length + ' applied');
}
