// tools/comments.mjs — find code swallowed by a // comment.
// Bracken packs whole behaviours onto single long lines; a patch that appends "// note" mid-line comments out the
// rest of the line silently when what follows still parses (a missing sprite assignment, a missing stair call).
// This flags line comments whose text looks like code: a statement end followed by an assignment or a call.
// usage: node tools/comments.mjs
import fs from 'fs';
let n = 0;
for (const f of ['src/main.js', 'src/level.js', 'src/audio.js', 'src/art.js', 'src/chars.js', 'src/px.js', 'src/reachcore.js']) {
  const lines = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8').split('\n');
  lines.forEach((ln, i) => {
    let q = null;
    for (let k = 0; k < ln.length - 1; k++) {
      const c = ln[k];
      if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
      if (c === "'" || c === '"' || c === '`') { q = c; continue; }
      if (c === '/' && ln[k + 1] === '*') { const e = ln.indexOf('*/', k + 2); if (e < 0) break; k = e + 1; continue; }
      if (c === '/' && ln[k + 1] === '/') {
        const cm = ln.slice(k + 2);
        const t = cm.trim();
        // three shapes of swallowed code: a statement end followed by an assignment or call; a bare call that
        // ends like a statement; and ANY comment whose tail still holds a brace or a semicolon-brace, which is
        // what a swallowed `e.wuWas = wu; }` looks like (that one cost an hour).
        const looksCode = (/[;}]\s*[A-Za-z_$][\w.[\]']*\s*(=[^=]|\()/.test(cm) && /[;{}]\s*$/.test(t))
          || /[A-Za-z_$][\w.]*\(\s*['"\[{\d][^)]*\)\s*;\s*$/.test(t)
          || /[;)]\s*[}\])]+\s*;?\s*$/.test(t)
          || /[A-Za-z_$][\w.]*\s*=\s*[^=].*[;}]\s*$/.test(t);
        if (looksCode) { console.log(`${f}:${i + 1}: ${cm.slice(0, 150)}`); n++; }
        break;
      }
    }
  });
}
console.log(n ? `\n${n} comment(s) that may be hiding code.` : 'no swallowed code found.');
