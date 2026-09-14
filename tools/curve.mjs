// curve.mjs — THE RAMP, measured instead of felt.
//
// Nobody had ever looked at the difficulty curve as a curve. This walks the campaign in order and prints,
// per level: how long it is, how much is in it, how dangerous what is in it is, and how far you can be from
// a checkpoint. The last column is a single index so the shape of the ramp is readable down the page.
//
//   node tools/curve.mjs
//
// The index is deliberately crude and deliberately STATIC - it is what the level contains, not how a player
// does. It is for spotting a level that is out of order with its neighbours, not for tuning a number.
import { LEVELS, T, TS } from '../src/level.js';
import { THREAT, spanOf, indexOf, worstGap, RAMP_DROP, RAMP_WALL } from '../src/threat.js';

const HAZ = new Set([T.SPIKE]);

const rows = [];
for (const lv of LEVELS) {
  // THE RAMP IS THE CAMPAIGN'S. A secret level is a bonus hanging off the side of act one, not the
  // seventeenth step of a sixteen-step slope, and counting it makes every reading after it a lie.
  if (lv.hidden) continue;
  const R = lv.build();
  const cols = R.W;
  let foes = 0, threat = 0, kinds = new Set(), checks = 0, hazTiles = 0;
  for (const e of (R.ents || [])) {
    if (e.t === 'check') { checks++; continue; }
    const w = THREAT[e.t];
    if (w === undefined) continue;
    if (w > 0) { foes++; threat += w * (e.mini ? 2 : 1); kinds.add(e.t); }
  }
  /* AN AMBUSH IS IN THE LEVEL even though it is not in the entity list until the room shuts */
  for (const A of (R.ambushes || [])) for (const w of A.waves) for (const [t] of w) { const v = THREAT[t]; if (v > 0) { foes++; threat += v; kinds.add(t); } }
  for (let i = 0; i < R.grid.length; i++) if (HAZ.has(R.grid[i])) hazTiles++;
  for (const p of (R.pools || [])) { if (p.harm) hazTiles += Math.round((p.x1 - p.x0) / TS / 4);
    else if (p.swim) hazTiles += Math.round((p.x1 - p.x0) / TS / 8); }   // breath is a hazard with nothing in it
  // the worst run of level with no checkpoint in it
  const gap = worstGap(R.ents, cols, R.H, R.arena);
  const span = spanOf(cols, R.H);
  const per100 = threat / (span / 100);
  const index = indexOf({ threat, kinds: kinds.size, hazTiles, gap, span });
  rows.push({ id: lv.id, arc: lv.arc || null, cols: span, foes, threat: Math.round(threat), kinds: kinds.size, per100: +per100.toFixed(1), haz: hazTiles, checks, gap, index });
}

const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);
console.log('\nTHE RAMP, in the order they are walked\n');
console.log(pad('level', 12) + padl('cols', 6) + padl('foes', 6) + padl('threat', 8) + padl('kinds', 7) + padl('thr/100', 9) + padl('hazard', 8) + padl('checks', 8) + padl('gap', 6) + padl('INDEX', 7) + '   ramp');
let prev = null;
for (const r of rows) {
  const bar = '#'.repeat(Math.max(1, Math.round(r.index / 4)));
  const arrow = prev === null ? '  ' : r.index > prev ? ' /' : r.index < prev ? ' \\' : ' -';
  console.log(pad(r.id, 12) + padl(r.cols, 6) + padl(r.foes, 6) + padl(r.threat, 8) + padl(r.kinds, 7) + padl(r.per100, 9) + padl(r.haz, 8) + padl(r.checks, 8) + padl(r.gap, 6) + padl(r.index, 7) + arrow + ' ' + bar);
  prev = r.index;
}
// where the ramp goes backwards by more than a little
console.log('');
let bad = 0;
for (let i = 1; i < rows.length; i++) {
  const d = rows[i].index - rows[i - 1].index;
  // A NEW ARC IS ALLOWED TO BREATHE. The ramp was one line because the game was one road; a campaign of
  // fifty levels is four or five roads, and the first level of a new one being quieter than the last boss
  // of the old one is the breath between chapters, not a mistake. Inside an arc the rule is unchanged.
  if (rows[i].arc) { console.log(`  ${rows[i].id} opens ${rows[i].arc.toUpperCase()} at ${rows[i].index} (${rows[i - 1].id} closed the last one at ${rows[i - 1].index})`); continue; }
  if (d < RAMP_DROP) { console.log(`  ${rows[i].id} is ${-d} EASIER than ${rows[i - 1].id} before it`); bad++; }
  if (d > RAMP_WALL) { console.log(`  ${rows[i].id} is ${d} harder than ${rows[i - 1].id} before it - a wall`); bad++; }
}
console.log(bad ? `\n${bad} step(s) out of line.` : '\nthe ramp climbs.');
