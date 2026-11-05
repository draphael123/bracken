// work/falseabbot/rep.mjs <file> <pairs.json> - exact-string replacements, each must match once (lane helper)
import { readFileSync, writeFileSync } from 'node:fs';
const [f, pj] = process.argv.slice(2); let s = readFileSync(f, 'utf8'); const pairs = JSON.parse(readFileSync(pj, 'utf8'));
for (const [a, b] of pairs) { const n = s.split(a).length - 1; if (n !== 1) { console.error('match x' + n + ': ' + a.slice(0, 90)); process.exit(1); } s = s.replace(a, () => b); }
writeFileSync(f, s); console.log('ok ' + pairs.length);
