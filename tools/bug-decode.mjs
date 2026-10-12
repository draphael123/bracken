// tools/bug-decode.mjs - READ A BUG REPORT CODE (claude/shipfix). The game's REPORT A BUG row copies a 'BRK1-...' line to the clipboard; paste it here.
//   node tools/bug-decode.mjs BRK1-xxxxxxxx        the report, readable
//   node tools/bug-decode.mjs --json BRK1-xxxx      the raw JSON
//   node tools/bug-decode.mjs                       reads the code from stdin (or the whole message the player sent: the first BRK1- in it is used)
import { decodeReport, formatReport } from '../src/bug-report.js';

const args = process.argv.slice(2), json = args.includes('--json'), rest = args.filter(a => a !== '--json');
let text = rest.join(' ');
if (!text) { const chunks = []; for await (const c of process.stdin) chunks.push(c); text = Buffer.concat(chunks).toString('utf8'); }
try { const r = await decodeReport(text); console.log(json ? JSON.stringify(r, null, 2) : formatReport(r)); }
catch (e) { console.error('bug-decode: ' + e.message + ' (is the whole code there? a chat app may have cut it)'); process.exit(1); }
