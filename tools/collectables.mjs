// tools/collectables.mjs — CAN EVERY PICKUP BE PICKED UP?
// Every silver, key, relic and quest stray in every level is asked two separate questions.
//   GEOMETRY  is there any ground - a tile you can stand on, a rung, a swimmable cell - from which the hero's own pickup
//             box reaches it, standing or at the top of a jump? And is it inside rock? This needs no model of how you got
//             there, so it holds for the levels the reach fill cannot enter (pads, pogo chains, wind).
//   ROUTE     does the reach fill (src/reachcore.js) get to that ground from the start? A level the model cannot follow
//             comes back ASSISTED, and that is a note, not a failure.
// A GEOMETRY failure is a real bug: nothing in the game can collect that item. It fails npm run check.
//   node tools/collectables.mjs            every level: failures, then the route notes
//   node tools/collectables.mjs <id> -v    one level, every item
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const TS = 16, want = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : null, verbose = process.argv.includes('-v');
/* the pickup boxes as main.js checks them, in pixels from the hero's feet (P.x, P.y), and how high a jump lifts the feet */
const BOX = { silver: { dx: 13, up: 7 + 15, down: -7 + 15 }, stray: { dx: 15, up: 22, down: 22 }, key: { dx: 15, up: 22 + 6, down: 22 - 6 }, relic: { dx: 15, up: 20 + 2, down: 20 - 2 },
  mend: { dx: 9, up: 16, down: 10 } };   /* a dead-end stash heart (updateHealths: |dx| < 10, |feet - 8 - (y - 5)| < 14) */
const JUMP_PX = 49;
let bad = 0; const notes = [];
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  if (want && lv.id !== want) continue;
  let L; try { L = lv.build(); } catch (e) { console.log('== ' + lv.id + ': build failed ' + e.message); bad++; continue; }
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB;
  const { seen, footing: tileFooting, assisted } = floodReach(L, T, { rides: true });
  /* THE RIDES ARE GROUND TOO. A silver on a swing's arc is got from the swing; one over a mover's run, from the mover. */
  const footing = new Set(tileFooting), rideAt = new Set();
  for (const m of (L.moversExtra || [])) if (m.kind === 'swing') for (let k2 = -8; k2 <= 8; k2++) { const th = 0.95 * k2 / 8, sx = Math.floor((m.px + Math.sin(th) * m.arm) / TS), sy = Math.floor((m.py + Math.cos(th) * m.arm) / TS) - 1; for (const dx of [-1, 0, 1]) { footing.add((sx + dx) + ',' + sy); rideAt.add((sx + dx) + ',' + sy); } }
  for (const e of (L.ents || [])) if (e.t === 'mover') { const cells = e.vert ? Array.from({ length: (e.rise || e.range || 4) + 1 }, (_, i) => [0, -i]) : Array.from({ length: (e.range || 0) + 1 }, (_, i) => [i, 0]);
    for (const [ox, oy] of cells) for (let w = 0; w < (e.len || 2); w++) { const key = (e.x + ox + w) + ',' + (e.y + oy - 1); footing.add(key); rideAt.add(key); } }
  for (const m of (L.moversExtra || [])) if (m.kind === 'lift' && m.y0 !== undefined) for (let y = Math.floor(Math.min(m.y0, m.y1) / TS); y <= Math.floor(Math.max(m.y0, m.y1) / TS); y++) for (let x = Math.floor(m.x / TS); x < Math.floor((m.x + (m.w || 32)) / TS); x++) { footing.add(x + ',' + (y - 1)); rideAt.add(x + ',' + (y - 1)); }
  const rows = [];
  for (const e of L.ents) {
    const kind = e.t === 'silver' ? 'silver' : e.t === 'stray' ? 'stray' : e.t === 'key' ? 'key' : e.t === 'relic' ? 'relic' : e.t === 'mend' ? 'mend' : null;
    if (!kind) continue;
    if (e.kind === 'sheep' || e.kind === 'fisher' || e.kind === 'folk') continue;   /* a creature that walks to you, not a thing lying in the level */
    const B = BOX[kind], ix = e.x * TS + 8, iy = e.y * TS + (kind === 'silver' ? 0 : TS);   /* ents sit on their row: a stray's y is its feet */
    const embedded = solid(at(e.x, e.y)) && (kind === 'silver' ? true : solid(at(e.x, e.y - 1)));
    /* any footing cell whose standing feet (bottom of that cell), raised by up to a jump, puts the item inside the box */
    let from = null, routed = false;
    for (let x = e.x - 3; x <= e.x + 3 && !(from && routed); x++) for (let y = e.y - 2; y <= e.y + 5; y++) {
      const k = x + ',' + y; if (!footing.has(k)) continue;
      /* standing, the box reaches B.dx; a running jump off that tile carries it up to three tiles sideways by its apex */
      const px = x * TS + 8, feet = (y + 1) * TS, above = iy < feet; if (Math.abs(px - ix) > (above ? 3 * TS + B.dx : B.dx + 8)) continue;
      /* feet anywhere from standing to the top of a jump: the item must fall inside [feet - up, feet + down] for one of them */
      const lo = feet - JUMP_PX - B.up, hi = feet + B.down;
      if (iy >= lo && iy <= hi) { if (!from) from = k; if (seen.has(k)) { from = k; routed = true; break; } }
    }
    rows.push({ kind: kind + (e.kind ? ':' + e.kind : ''), at: e.x + ',' + e.y, embedded, from, routed });
  }
  const fails = rows.filter(r => r.embedded || !r.from);
  for (const r of fails) { bad++; console.log('== ' + lv.id + ': ' + r.kind + ' at ' + r.at + ' - ' + (r.embedded ? 'INSIDE ROCK' : 'NO GROUND IT CAN BE PICKED UP FROM')); }
  const unrouted = rows.filter(r => !r.embedded && r.from && !r.routed);
  if (unrouted.length) notes.push('  ' + lv.id.padEnd(11) + (assisted ? 'ASSISTED  ' : 'NOT ROUTED') + ' ' + unrouted.map(r => r.kind + '@' + r.at).join(' '));
  if (verbose) for (const r of rows) console.log('  ' + r.kind.padEnd(14) + r.at.padEnd(9) + (r.embedded ? 'INSIDE ROCK' : r.from ? 'from ' + r.from + (r.routed ? ' (routed)' : ' (not routed)') : 'NO GROUND'));
}
if (notes.length) console.log('\nroute notes (the reach fill does not get to these from the start; ASSISTED levels ride, pogo or fly there):\n' + notes.join('\n'));
console.log(bad ? '\n' + bad + ' pickup(s) nothing can collect.' : '\nevery pickup can be picked up from some ground.');
process.exitCode = bad ? 1 : 0;
