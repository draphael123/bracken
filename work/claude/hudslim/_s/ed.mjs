// usage: node ed.mjs <file> <edits.mjs>   edits.mjs default-exports [[old,new,count?],...]; CRLF preserved
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [file, ef] = process.argv.slice(2);
let s = readFileSync(file, 'utf8'); const crlf = s.includes('\r\n'); if (crlf) s = s.replace(/\r\n/g, '\n');
const edits = (await import(pathToFileURL(ef).href)).default; let bad = 0;
for (const [o, n, c = 1] of edits) { const k = s.split(o).length - 1; if (k !== c) { console.log('MISMATCH x' + k + ' (want ' + c + '):', o.slice(0, 90)); bad++; continue; } s = s.split(o).join(n); }
if (bad) { console.log(bad + ' bad; nothing written'); process.exit(1); }
writeFileSync(file, crlf ? s.replace(/\n/g, '\r\n') : s); console.log('ok', edits.length);
