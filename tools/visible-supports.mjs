/* tools/visible-supports.mjs - EVERY OVERHANG NEEDS SUPPORT THE PLAYER CAN SEE.
   The Unburied Field taught the difference between a declared footing and a drawn one: at 320 by 180 a 1-2 px leg,
   a disconnected pair of shores or a facade in the BACKGROUND leaves the deck looking as if it floats. This runs that
   stricter rule on every built LEVELS entry. The browser half removes the structure layer for one frame and measures the
   pixels that vanish, using the game's own renderer and an eight-connected path from its top to its foot. A true visual
   exception must be KEYED by level and coordinates with the reason a player can read it as held.
   `node tools/visible-supports.mjs [levelId ...] [--list] [--json] [--strict]`.
   Until the art lanes clear the backlog, ordinary runs report and exit zero. --strict makes findings a gate. */
import { LEVELS } from '../src/level.js';
import { sweepLevels } from './sweep-pages.mjs';

const args = process.argv.slice(2), only = args.filter(a => !a.startsWith('-'));
const ids = only.length ? only : LEVELS.map(l => l.id), list = args.includes('--list'), json = args.includes('--json');
/* (redcleanup 10-26) a fresh page every 6 levels and a hard limit per level that names the level and goes red (was: one page for all 66 levels and a 1800 s limit PER level - the
   whole sweep timed out at 1500 s on master with no line saying where). tools/sweep-pages.mjs. SWEEP_LEVEL_MS overrides the 150 s limit. */
const rows = [];
const got = await sweepLevels(ids, (pg, id, ms) => pg.evalp(`(async()=>{const m=await import('/tools/visible-supports-page.js');return m.sweep(${JSON.stringify(id)});})()`, ms), { label: 'visible-supports', chunk: 6, perLevelMs: +(process.env.SWEEP_LEVEL_MS || 150000) });
for (const g of got) {
  const r = g.error ? { id: g.id, error: g.error } : g.result; rows.push(r);
  if (!json) {
    console.log(g.id + ': ' + (r.error || r.findings.length + ' overhang(s) without a verified visible support out of ' + r.total + ', ' + r.keyed + ' keyed'));
    if (list && r.findings) for (const f of r.findings) console.log('  ' + f.tile + ' @' + f.x0 + (f.x1 > f.x0 ? '-' + f.x1 : '') + ',' + f.row + ': ' + f.reason);
  }
}
if (json) console.log(JSON.stringify(rows));
const n = rows.reduce((s, r) => s + (r.findings?.length || 0), 0), errors = rows.filter(r => r.error);
console.log('visible-supports REPORT-ONLY: ' + n + ' overhang findings in ' + rows.length + ' level(s)' + (errors.length ? '; ' + errors.length + ' level error(s)' : ''));
if (errors.some(r => /TIMEOUT|LOST PAGE/.test(r.error))) process.exitCode = 1;   /* a level that did not finish is a red even in the report: a hang must not look like a pass */
if (args.includes('--strict') && (n || errors.length)) process.exitCode = 1;
