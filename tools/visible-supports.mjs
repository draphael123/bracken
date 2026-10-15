/* tools/visible-supports.mjs - EVERY OVERHANG NEEDS SUPPORT THE PLAYER CAN SEE.
   The Unburied Field taught the difference between a declared footing and a drawn one: at 320 by 180 a 1-2 px leg,
   a disconnected pair of shores or a facade in the BACKGROUND leaves the deck looking as if it floats. This runs that
   stricter rule on every built LEVELS entry. The browser half removes the structure layer for one frame and measures the
   pixels that vanish, using the game's own renderer and an eight-connected path from its top to its foot. A true visual
   exception must be KEYED by level and coordinates with the reason a player can read it as held.
   `node tools/visible-supports.mjs [levelId ...] [--list] [--json] [--strict]`.
   Until the art lanes clear the backlog, ordinary runs report and exit zero. --strict makes findings a gate. */
import { LEVELS } from '../src/level.js';
import { openPage } from './cdp.mjs';

const args = process.argv.slice(2), only = args.filter(a => !a.startsWith('-'));
const ids = only.length ? only : LEVELS.map(l => l.id), list = args.includes('--list'), json = args.includes('--json');
const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  for (const id of ids) {
    const r = await pg.evalp(`(async()=>{const m=await import('/tools/visible-supports-page.js');return m.sweep(${JSON.stringify(id)});})()`, 1800000);
    rows.push(r);
    if (!json) {
      console.log(id + ': ' + (r.error || r.findings.length + ' overhang(s) without a verified visible support out of ' + r.total + ', ' + r.keyed + ' keyed'));
      if (list && r.findings) for (const f of r.findings) console.log('  ' + f.tile + ' @' + f.x0 + (f.x1 > f.x0 ? '-' + f.x1 : '') + ',' + f.row + ': ' + f.reason);
    }
  }
} finally { await pg.close(); }
if (json) console.log(JSON.stringify(rows));
const n = rows.reduce((s, r) => s + (r.findings?.length || 0), 0), errors = rows.filter(r => r.error);
console.log('visible-supports REPORT-ONLY: ' + n + ' overhang findings in ' + rows.length + ' level(s)' + (errors.length ? '; ' + errors.length + ' level error(s)' : ''));
if (args.includes('--strict') && (n || errors.length)) process.exitCode = 1;
