/* tools/demo-floats.mjs - NO DECK IN THE DEMO HANGS IN THE AIR (claude/floatfix, Daniel 11-03: "I noticed a lot of floating geometry when playing").
   The other gates ask "does this island have ANY drawn support anywhere" (tools/solid-islands.mjs) or are report-only. This asks the player's question for the
   12 DEMO levels: for every board / slab cell with open air under it, how far (in columns) is the nearest thing that visibly holds it up?
     ANCHOR   a drawn post / pile / pole under it (L.routeSupports, not tapering free), a column of ground or a wall at the board's own end, a hung rope / chain /
              hanger / bridge / hoist / declared structure over it, or a floor of solid under the cell
   Rules (every demo level, ceilings ignored):
     DECK     a run of boards (ONEWAY / PLANK / REED / SHELF) wider than 8 tiles with a cell more than 4 columns from any anchor: FAIL
     SLAB     a run of boards 3..8 wide with no anchor within 4 columns of its middle: FAIL (a board with a post at one end is held; one with none is floating)
     CEILING  a SOLID run with rock directly over it within 2 rows is a cave roof, not a deck: ignored (not counted)
   A RATCHET, NOT A PASS: ALLOW lists, per level, the runs that are floating ON PURPOSE with a reason a player can read (a hung chain, a rope swing, a cloud).
   The count may only go DOWN (a new floater fails; a fixed one fails until its entry is removed, so the list cannot outlive what it excuses).
     node tools/demo-floats.mjs            the gate and the table
     node tools/demo-floats.mjs <id> ...   only those levels, every run listed */
import { pathToFileURL } from 'url';
import { LEVELS, T } from '../src/level.js';
import { runsOf as runsOfL, floating, DECK_W, REACH } from '../src/demo-supports.js';

export const DEMO = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings', 'burning', 'arena_yard'];
/* id -> [{ x0, x1, y, why }]: runs that float on purpose, each with a reason a player can read on screen. The ratchet is the length of the list. */
const BARN = 'an upper floor inside the burning barn: its great frame (wall timbers, rafters, ladders) is drawn behind and round it, it is a building interior and not a deck over open air';
export const ALLOW = {
  burning: [{ x0: 340, x1: 341, y: 16, why: BARN }, { x0: 343, x1: 357, y: 16, why: BARN }, { x0: 359, x1: 375, y: 16, why: BARN }, { x0: 377, x1: 380, y: 16, why: BARN },
    { x0: 327, x1: 357, y: 20, why: BARN }, { x0: 359, x1: 393, y: 20, why: BARN }],
};

export const runsOf = L => runsOfL(L, T);

/* the findings: DECK = wider than 8 with a cell > 4 columns from any anchor, SLAB = 2..8 wide with nothing holding it within 4 */
export function findings(L) {
  return runsOf(L).filter(floating).map(r => ({ ...r, kind: r.w > DECK_W ? 'DECK' : 'SLAB', why: r.w + ' wide, ' + (r.worst > 90 ? 'nothing holds it' : r.worst + ' columns from the nearest post / wall / rope') }));
}

export function levels(ids) { return DEMO.filter(id => !ids.length || ids.includes(id)).map(id => ({ id, lv: LEVELS.find(l => l.id === id) })); }

function main() {
  const ids = process.argv.slice(2), list = ids.length > 0;
  let bad = 0; const rows = [];
  for (const { id, lv } of levels(ids)) {
    if (!lv) { console.log('  ' + id + ': not a level'); bad++; continue; }
    const L = lv.build(), f = findings(L), allow = ALLOW[id] || [];
    const left = f.filter(r => !allow.some(a => a.y === r.y && r.x0 <= a.x1 && r.x1 >= a.x0));
    const stale = allow.filter(a => !f.some(r => r.y === a.y && r.x0 <= a.x1 && r.x1 >= a.x0));
    rows.push([id, f.length, allow.length, left.length, stale.length]);
    for (const a of allow) if (!a.why || a.why.length < 12) { console.log('  ' + id + ': allowance @' + a.x0 + '-' + a.x1 + ',' + a.y + ' has no readable reason'); bad++; }
    bad += left.length + stale.length;
    if (list || left.length || stale.length) {
      for (const r of left) console.log('  ' + id.padEnd(13) + r.kind + ' @' + r.x0 + '-' + r.x1 + ',' + r.y + '  ' + r.why);
      for (const a of stale) console.log('  ' + id.padEnd(13) + 'STALE allowance @' + a.x0 + '-' + a.x1 + ',' + a.y + ' (' + a.why + '): the run is held now - remove the entry');
    }
  }
  console.log('level          found  allowed  LEFT  stale');
  for (const [id, n, a, l, s] of rows) console.log(id.padEnd(14) + String(n).padStart(5) + String(a).padStart(9) + String(l).padStart(6) + String(s).padStart(7));
  console.log(bad ? 'demo-floats: ' + bad + ' floating run(s) / stale entries' : 'ok  demo-floats: every deck in the 12 demo levels is held (or allowed with a reason)');
  process.exit(bad ? 1 : 0);
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
