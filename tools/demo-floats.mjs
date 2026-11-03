/* tools/demo-floats.mjs - NO DECK IN THE DEMO HANGS IN THE AIR (claude/floatfix, Daniel 11-03: "I noticed a lot of floating geometry when playing").
   The other gates ask "does this island have ANY drawn support anywhere" (tools/solid-islands.mjs) or are report-only. This asks the player's question for the
   12 DEMO levels: for every board / slab cell with open air under it, how far (in columns) is the nearest thing that visibly holds it up?
     ANCHOR   a drawn post / pile / pole under it (L.routeSupports, not tapering free), a column of ground or a wall at the board's own end, a hung rope / chain /
              hanger / bridge / hoist / declared structure over it, or a floor of solid under the cell
   Rules (every demo level, ceilings ignored):
     DECK     a run of boards (ONEWAY / PLANK / REED / SHELF) wider than 8 tiles with a cell more than 4 columns from any anchor: FAIL
     SLAB     a run of boards 3..8 wide with no anchor within 4 columns of its middle: FAIL (a board with a post at one end is held; one with none is floating)
     CEILING  cave roofs are ignored by construction: only boards (ONEWAY / PLANK / REED / SHELF) are read, never a SOLID run (a roof of rock is not a deck)
   DECOR (the same 12 levels): the load-time grounding rule (groundEnts in src/main.js) silently SETS DOWN a prop placed off its floor and silently DROPS a hung decoration with no rock
   over it - a prop in the wrong place, or a decoration that never draws, reads as a level that lost something. DROPPED must be 0 (an ent the engine would leave out: a hung kind with no rock
   over it and no `stand: true`, a standing kind with no floor within 3 rows / 3 columns); SET DOWN is ratcheted per level in SET_DOWN with a reason (data that is levelHash-bound).
   A RATCHET, NOT A PASS: ALLOW lists, per level, the runs that are floating ON PURPOSE with a reason a player can read (a hung chain, a rope swing, a cloud).
   The count may only go DOWN (a new floater fails; a fixed one fails until its entry is removed, so the list cannot outlive what it excuses).
     node tools/demo-floats.mjs            the gate and the table
     node tools/demo-floats.mjs <id> ...   only those levels, every run listed */
import { pathToFileURL } from 'url';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { runsOf as runsOfL, floating, DECK_W, REACH } from '../src/demo-supports.js';

export const DEMO = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings', 'burning', 'arena_yard'];
/* id -> [{ x0, x1, y, why }]: runs that float on purpose, each with a reason a player can read on screen. The ratchet is the length of the list. */
const BARN = 'an upper floor inside the burning barn: its great frame (wall timbers, rafters, ladders) is drawn behind and round it, it is a building interior and not a deck over open air';
/* id -> [how many props the grounding rule sets down at load, why they are still in the data]. The count may only go down. */
const HASH_BOUND = 'placed 1-3 rows / columns off its floor in the level data; the load-time rule stands it on the floor (it is NOT in the air on screen). Moving the data moves the level hash (the pilot / curve / mash stamps): it waits for the next restamp';
export const SET_DOWN = { marsh: [3, HASH_BOUND], stockade: [2, HASH_BOUND], spore: [3, HASH_BOUND], kings: [1, HASH_BOUND], underleaf: [2, HASH_BOUND], palisadewood: [3, HASH_BOUND] };
export const ALLOW = {
  burning: [{ x0: 340, x1: 341, y: 16, why: BARN }, { x0: 343, x1: 357, y: 16, why: BARN }, { x0: 359, x1: 375, y: 16, why: BARN }, { x0: 377, x1: 380, y: 16, why: BARN },
    { x0: 327, x1: 357, y: 20, why: BARN }, { x0: 359, x1: 393, y: 20, why: BARN }],
};

export const runsOf = L => runsOfL(L, T);

/* the findings: DECK = wider than 8 with a cell > 4 columns from any anchor, SLAB = 2..8 wide with nothing holding it within 4 */
export function findings(L) {
  return runsOf(L).filter(floating).map(r => ({ ...r, kind: r.w > DECK_W ? 'DECK' : 'SLAB', why: r.w + ' wide, ' + (r.worst > 90 ? 'nothing holds it' : r.worst + ' columns from the nearest post / wall / rope') }));
}

/* the engine's own grounding rule, read out of src/main.js so this cannot drift from it (as tools/floaters.mjs does) */
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const setOf = name => { const i = MAIN.indexOf('const ' + name + ' = new Set(['), j = MAIN.indexOf(']);', i); return new Set([...MAIN.slice(i, j).matchAll(/'([A-Za-z]+)'/g)].map(x => x[1])); };
const HUNG_DECO = setOf('HUNG_DECO'), DECO_AIR = setOf('DECO_AIR'), STANDS_T = setOf('STANDS_T');
const decoHangs = e => !e.stand && (!!e.hang || (HUNG_DECO.has(e.kind) && e.kind !== 'banner' && e.kind !== 'hangCage' && e.kind !== 'spire'));
export function decorFindings(L) {
  const W = L.W, H = L.H, g = L.grid, tile = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : g[y * W + x];
  const SOLID = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]), LEDGE = new Set([T.ONEWAY, T.REED, T.PLANK, T.BOUNCER, T.SHELF, T.RAIL, T.CRYST]);
  const gnd = (x, y) => SOLID.has(tile(x, y)) || LEDGE.has(tile(x, y));
  const settle = (x, y0) => { let y = y0, n = 0; while (gnd(x, y) && n++ < 3) y--; if (gnd(x, y)) return null; n = 0; while (!gnd(x, y + 1) && n++ < 3) y++; return gnd(x, y + 1) ? y : null; };
  const dropped = [], moved = [];
  for (const e of L.ents) { const dec = e.t === 'deco';
    if (dec && decoHangs(e)) { let k = 0; while (k < 5 && !SOLID.has(tile(e.x, e.y - 1 - k))) k++; if (k >= 5) dropped.push((e.kind || e.t) + '@' + e.x + ',' + e.y + ' hung with no rock over it'); continue; }
    if (dec ? (decoHangs(e) || DECO_AIR.has(e.kind)) : (!STANDS_T.has(e.t) || e.perch)) continue;
    let y = settle(e.x, e.y), nx = e.x;
    for (let dx = 1; dx <= 3 && y === null; dx++) for (const sx of [e.x - dx, e.x + dx]) if (y === null) { const yy = settle(sx, e.y); if (yy !== null) { y = yy; nx = sx; } }
    if (y === null) { if (dec) dropped.push((e.kind || e.t) + '@' + e.x + ',' + e.y + ' no floor within 3 rows / 3 columns'); }
    else if (y !== e.y || nx !== e.x) moved.push((e.kind || e.t) + '@' + e.x + ',' + e.y + '->' + nx + ',' + y);
  }
  return { dropped, moved };
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
    const dc = decorFindings(L), sd = SET_DOWN[id] || [0, ''];
    for (const d of dc.dropped) { console.log('  ' + id.padEnd(13) + 'DROPPED ' + d + ' (the engine leaves it out: it never draws)'); bad++; }
    if (dc.moved.length !== sd[0]) { console.log('  ' + id.padEnd(13) + 'SET DOWN ' + dc.moved.length + ' prop(s), ratchet ' + sd[0] + (dc.moved.length > sd[0] ? ': a prop is placed off its floor - put it on the floor in the data' : ': fewer now - lower SET_DOWN') + ' [' + dc.moved.join(' ') + ']'); bad++; }
    else if (list && dc.moved.length) console.log('  ' + id.padEnd(13) + 'set down (allowed, ' + sd[1].slice(0, 40) + '...): ' + dc.moved.join(' '));
    rows.push([id, f.length, allow.length, left.length, stale.length, dc.dropped.length, dc.moved.length]);
    for (const a of allow) if (!a.why || a.why.length < 12) { console.log('  ' + id + ': allowance @' + a.x0 + '-' + a.x1 + ',' + a.y + ' has no readable reason'); bad++; }
    bad += left.length + stale.length;
    if (list || left.length || stale.length) {
      for (const r of left) console.log('  ' + id.padEnd(13) + r.kind + ' @' + r.x0 + '-' + r.x1 + ',' + r.y + '  ' + r.why);
      for (const a of stale) console.log('  ' + id.padEnd(13) + 'STALE allowance @' + a.x0 + '-' + a.x1 + ',' + a.y + ' (' + a.why + '): the run is held now - remove the entry');
    }
  }
  console.log('level          found  allowed  LEFT  stale  dropped  set-down');
  for (const [id, n, a, l, s, d, m] of rows) console.log(id.padEnd(14) + String(n).padStart(5) + String(a).padStart(9) + String(l).padStart(6) + String(s).padStart(7) + String(d).padStart(9) + String(m).padStart(10));
  console.log(bad ? 'demo-floats: ' + bad + ' floating run(s) / stale entries' : 'ok  demo-floats: every deck in the 12 demo levels is held (or allowed with a reason) and no decoration is silently dropped');
  process.exit(bad ? 1 : 0);
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
