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

// what each creature is worth as a threat. Not health: how much ATTENTION it takes.
const THREAT = {
  sprig: 1, spit: 1, wasp: 1.5, hopper: 1, shield: 2, archer: 2, thorn: 2, spitter: 1.5, turtle: 1.5,
  brute: 3.5, sapper: 3, hound: 2.5, pike: 3, soldier: 3, javelin: 2.5, heavy: 4, crow: 1, bat: 1,
  sporeling: 1.5, lurker: 2.5, spitcap: 2, weaver: 3, shaman: 3, thief: 1, folk: 0, squirrel: 0,
  goat: 2, ram: 4, harpy: 2.5, troll: 4, spider: 3, sailer: 2, snuffer: 2.5, cutter: 3, hearthgob: 3,
  shardling: 2, suncatcher: 3, sentry: 2, lookout: 1.5, bosun: 3, cutlass: 2.5, boarder: 3, marine: 2.5,
  eel: 2, urchin: 1, angler: 2.5, siren: 3, crab: 1.5, scout: 2, tideguard: 3, petrel: 1.5, gull: 1,
  watch: 3, wight: 3, lance: 6, rockgoblin: 2.5, golem: 5, windcaller: 6, roc: 6, owl: 6, king: 6,
  frog: 5, chief: 5, queen: 4, mother: 5, greathound: 4, forgemaster: 5, gqueen: 6, herald: 6,
  reefmaw: 6, quarter: 6, captain: 6, lampreeve: 5, tollmaster: 6, dummy: 0, bale: 0.5, fisher: 0,
};
const HAZ = new Set([T.SPIKE]);

const rows = [];
for (const lv of LEVELS) {
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
  for (let i = 0; i < R.grid.length; i++) if (HAZ.has(R.grid[i])) hazTiles++;
  for (const p of (R.pools || [])) { if (p.harm) hazTiles += Math.round((p.x1 - p.x0) / TS / 4);
    else if (p.swim) hazTiles += Math.round((p.x1 - p.x0) / TS / 8); }   // breath is a hazard with nothing in it
  // the worst run of level with no checkpoint in it
  const cx = (R.ents || []).filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
  let gap = cx.length ? cx[0] : cols;
  for (let i = 1; i < cx.length; i++) gap = Math.max(gap, cx[i] - cx[i - 1]);
  gap = Math.max(gap, cols - (cx[cx.length - 1] || 0));
  const span = cols + Math.max(0, R.H - 30) * 3;   // a tall level is long, it is just long upwards
  const per100 = threat / (span / 100);
  const index = Math.round(per100 * 2 + kinds.size * 3 + hazTiles / (span / 100) * 1.5 + gap / 20);
  rows.push({ id: lv.id, cols: span, foes, threat: Math.round(threat), kinds: kinds.size, per100: +per100.toFixed(1), haz: hazTiles, checks, gap, index });
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
  if (d < -6) { console.log(`  ${rows[i].id} is ${-d} EASIER than ${rows[i - 1].id} before it`); bad++; }
  if (d > 26) { console.log(`  ${rows[i].id} is ${d} harder than ${rows[i - 1].id} before it - a wall`); bad++; }
}
console.log(bad ? `\n${bad} step(s) out of line.` : '\nthe ramp climbs.');
