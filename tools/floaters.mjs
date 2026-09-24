// tools/floaters.mjs — WHAT THE GROUNDING RULE CANNOT SET DOWN, AND EVERY CHECKPOINT DRAWN HANGING FROM NOTHING.
//
// `tools/newlevel.mjs` catches a CREATURE in the air. This catches a PROP in the air, which does not break the level,
// it just looks broken, and you only find it by walking past it.
//
// STANDING IS THE RULE NOW. main.js sets every standing thing down on the floor under it when a level loads
// (groundEnts): up out of rock, down a few rows, or along its own stretch a few tiles. What that cannot do is the
// failure, and this runs the same rule on the built level to find it:
//   DROPPED     a decoration with no floor within three rows or three tiles: the game leaves it out
//   IN THE AIR  a sign, a checkpoint, a lamp or a bell with no floor near it: the game leaves it where it was put
// The rule's own lists (HUNG_DECO, DECO_AIR, STANDS_T) are read out of src/main.js, so this cannot drift from it.
//
// HUNG IS NOT A PASS EITHER. The Long Water stood a diving bell on a chain to nothing over every one of its checkpoints:
// the reef marker was drawn hanging from its top row with nothing on its foot, and on dry ground there was no rock over
// it. A checkpoint's marker is read out of src/art.js: if its drawing does not reach its foot row, every checkpoint of
// that set needs rock over it. (The pixels of everything else are checked in the page: node tools/headless.mjs floats.)
import { readFileSync } from 'fs';
import { LEVELS, T } from '../src/level.js';

const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const setOf = name => { const m = MAIN.match(new RegExp('const ' + name + ' = new Set\\(\\[([\\s\\S]*?)\\]\\);')); return new Set(m ? [...m[1].matchAll(/'(\w+)'/g)].map(x => x[1]) : []); };
const HUNG_DECO = setOf('HUNG_DECO'), DECO_AIR = setOf('DECO_AIR'), STANDS_T = setOf('STANDS_T');
if (!HUNG_DECO.size || !DECO_AIR.size || !STANDS_T.size) { console.log('the grounding rule cannot be read out of src/main.js (HUNG_DECO, DECO_AIR, STANDS_T)'); process.exit(1); }
const decoHangs = e => !!e.hang || (HUNG_DECO.has(e.kind) && e.kind !== 'banner' && e.kind !== 'hangCage' && e.kind !== 'spire');   /* as decoHangs in main.js */
const decoStands = e => !decoHangs(e) && !DECO_AIR.has(e.kind);
const SOLID = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]);
const LEDGE = new Set([T.ONEWAY, T.REED, T.PLANK, T.BOUNCER, T.SHELF, T.RAIL, T.CRYST]);   /* a net is no floor: a keg does not sit on a rope */

// THE CHECKPOINT MARKERS, as main.js picks one for a level (keep in step with shrineKind there)
const markerOf = (R, id) => { const p = R.palette || {}, d = p.dress, st = p.set;
  if (st === 'ship') return 'ship'; if (st === 'city') return 'city'; if (st === 'reef' || st === 'shore') return 'reef';
  if (d === 'myc' || p.myc) return 'myc'; if (d === 'marsh') return 'marsh'; if (d === 'crag') return 'crag';
  if (p.hall || R.castle || id === 'crown' || id === 'storm' || id === 'stockade') return 'hall'; return 'wood'; };
// THE LOWEST ROW EACH MARKER'S DRAWING REACHES, read off its draw calls. They are 20x34 with the foot on row 33.
const ART = readFileSync(new URL('../src/art.js', import.meta.url), 'utf8');
const footOf = kind => {
  const m = kind === 'wood' ? ART.match(/export function bakeShrine\(lit\) \{([\s\S]*?)\n\}/) : ART.match(new RegExp("kind === '" + kind + "'\\) \\{([\\s\\S]*?)\\n  \\}"));
  if (!m) return -1;
  const src = m[1]; let foot = /\bbase\(\)/.test(src) ? 33 : -1; const at = (re, f) => { for (const x of src.matchAll(re)) foot = Math.max(foot, f(x.slice(1).map(Number))); };
  at(/rect\(g, (-?\d+), (-?\d+), (-?\d+), (-?\d+)/g, ([, y, , h]) => y + h - 1);
  at(/px\(g, (-?\d+), (-?\d+)/g, ([, y]) => y);
  at(/line\(g, (-?\d+), (-?\d+), (-?\d+), (-?\d+)/g, ([, y0, , y1]) => Math.max(y0, y1));
  at(/\[(-?\d+), (-?\d+), (-?\d+), (-?\d+)\]/g, ([, y, , h]) => y + h - 1);   /* a rect laid out as a table */
  at(/\[(-?\d+), (-?\d+)\]/g, ([, y]) => y);                                   /* a polygon's corners */
  at(/\[(-?[\d.]+), (-?[\d.]+), (-?[\d.]+), (-?[\d.]+), '#/g, ([, cy, , ry]) => Math.floor(cy + ry));   /* a cairnStones stone: [cx, cy, rx, ry, colour] - its bottom is cy + ry */
  return foot;
};
const FOOT_ROW = 31;   /* within two pixels of the bottom of the 34-row marker is standing on its foot */

const args = process.argv.slice(2);
let bad = 0, checked = 0, moved = 0, unhung = 0;

// THE SAND CASTLES (Daniel, 2026-09-23, a screenshot of the Monastery's rope bridge): a stoneLantern reading as a
// sandcastle turret was one bug and got fixed by name; this is the RULE it left unenforced. dressLevel()'s "is this
// spot standing ground" test (src/level.js, search "b !== T.SOLID && b !== T.PLANK") treats a one-tile PLANK bridge
// exactly like a mountain: legal ground for its sprinkler to scatter shrines, standing stones and cauldrons on. A
// bridge laid over a short drop is a floor - the same test the Monastery's own bell-tower floors pass. A bridge laid
// over open sky is not: nothing reads as "resting" on a single board hanging over a misty drop, it reads as floating.
// A heavy prop dropped there IS a sand castle - the game just did not have a name for the shape before. The sprinkler
// tags everything it places `dressed: true`, so this checks only its own placements, not the level's own hand-laid
// bridge furniture (bridgepost, bridgetower), which is placed and checked by eye already.
const PLANK_DROP = 6;   /* rows of open air under a plank before it reads as a drop, not a floor (the Monastery's own bell-tower floors clear this by 2+) */
const sandCastles = (R, tile) => { const { ents } = R, hits = [];
  for (const e of ents) { if (e.t !== 'deco' || !e.dressed || tile(e.x, e.y + 1) !== T.PLANK) continue;
    let d = 0, y = e.y + 2; while (d < PLANK_DROP && tile(e.x, y) === T.AIR) { d++; y++; }
    if (d >= PLANK_DROP) hits.push((e.kind || e.t) + '@' + e.x + ',' + e.y); }
  return hits; };

for (const lv of LEVELS) {
  if (args.length && !args.includes(lv.id)) continue;
  let R;
  try { R = lv.build(); } catch (e) { console.log('  ' + lv.id + ' will not build: ' + e.message); continue; }
  const { W, H, grid, ents } = R;
  const tile = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : grid[y * W + x];
  const gnd = (x, y) => SOLID.has(tile(x, y)) || LEDGE.has(tile(x, y));
  const settle = (x, y0) => { let y = y0, n = 0; while (gnd(x, y) && n++ < 3) y--; if (gnd(x, y)) return null; n = 0; while (!gnd(x, y + 1) && n++ < 3) y++; return gnd(x, y + 1) ? y : null; };
  const dropped = [], air = [], marks = [], castles = sandCastles(R, tile);
  for (const e of ents) {
    const dec = e.t === 'deco';
    if (dec && decoHangs(e)) { let k = 0; while (k < 5 && !SOLID.has(tile(e.x, e.y - 1 - k))) k++; if (k >= 5) unhung++; continue; }   /* main.js leaves it out: not in the air */
    if (dec ? !decoStands(e) : (!STANDS_T.has(e.t) || e.perch)) continue;
    checked++;
    let y = settle(e.x, e.y), found = y !== null;
    for (let dx = 1; dx <= 3 && !found; dx++) for (const sx of [e.x - dx, e.x + dx]) if (!found && settle(sx, e.y) !== null) found = true;
    if (!found) (dec ? dropped : air).push((e.kind || e.t) + '@' + e.x + ',' + e.y);
    else if (y !== e.y) moved++;
  }
  const mk = markerOf(R, lv.id), foot = footOf(mk);
  if (foot < 0) marks.push('the ' + mk + ' marker cannot be read out of src/art.js');
  else if (foot < FOOT_ROW) for (const e of ents) if (e.t === 'check' && !SOLID.has(tile(e.x, e.y - 2)) && !SOLID.has(tile(e.x, e.y - 3))) marks.push(mk + ' marker@' + e.x + ',' + e.y);   /* drawn hanging from its top, three rows up */
  const say = (list, what) => { if (!list.length) return; bad += list.length; console.log('  ' + lv.id.padEnd(10) + list.length + ' ' + what + ': ' + list.slice(0, 12).join(' ') + (list.length > 12 ? ' ...' : '')); };
  say(dropped, 'with no floor near them, left out'); say(air, 'with no floor near them, left in the air'); say(marks, 'checkpoints drawn hanging from nothing');
  say(castles, 'sprinkled onto a bridge over open sky (sand castles)');
}

console.log('\n' + checked + ' standing things checked (' + moved + ' set down a row or more at load; ' + unhung + ' hung ones with no rock over them are left out). ' + (bad ? bad + ' cannot be set down.' : 'every one can be set down.'));
process.exit(bad ? 1 : 0);
