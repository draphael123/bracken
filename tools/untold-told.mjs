// tools/untold-told.mjs — NO UNTOLD HITS, IN THE PAGE (the combat pass, part 2, 2026-09-28; Daniel: "no untold hits").
//
// tools/answer-tags.mjs proves, from the tables, that every common foe that harms you has a told windup (UNTOLD is empty). This
// proves it on the screen: each of the foes that used to be on the UNTOLD list is set down alone beside a hero who stands still
// (no god mode: his health is topped up every frame) for eight seconds, and it fails when
//   - the foe never winds up on a mark (BK.telling, with the mark the screen shows over it: '!' or '!!'), or
//   - the hero loses health from it with no windup of its own in the three seconds before (an untold hit: the seed, the bomb or
//     the spore it throws is allowed its flight, a hit out of nothing is not), or
//   - the page throws.
// A foe that needs a place the flat floor cannot give it (the lamprey's water, the clinger's wall over a hero in the air) is named
// in SKIP with the reason; answer-tags still holds it to its table row.
//   node tools/untold-told.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

/* a told grab that has you: the hold that follows it is the same blow, still landing (the holdfast's roots, a latch) */
const HELD = new Set(['hold', 'latched']);
/* [type, dx tiles from the hero, dy tiles (up is negative), extra spawn fields, the hero faces AWAY from it (the shy dead move only then)] */
const FOES = [['spit', 5, 0], ['lurker', 3, 0], ['hopper', 6, 0], ['crow', 12, 0, { speed: 110 }], ['hound', 8, 0], ['sapper', 8, 0], ['sporeling', 5, 0],
  ['spitcap', 8, 0], ['weaver', 3, -4], ['thief', 6, 0], ['wight', 5, 0], ['holdfast', 0, 0], ['shardling', 4, 0], ['bonearcher', 9, 0],
  ['boo', 6, -1, null, true], ['husk', 4, 0], ['apprentice', 7, 0], ['emberwisp', 5, -1], ['kite', 0, -5], ['bale', 8, 0], ['sweep', 4, 0], ['horn', 6, 0]];
const SKIP = { lamprey: 'it lives in deep water and reaches only a swimming hero', clinger: 'it hangs on a wall over a hero in the air' };
const pg = await openPage({ audio: false, fonts: false });
const out = [];
try {
  await pg.reload();
  out.push(...await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false;
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 9, y]; }
    if (!spot) return [{ err: 'no flat floor' }];
    const res = [];
    const HELD = new Set(${JSON.stringify([...HELD])});
    for (const [t, dx, dy, extra, away] of ${JSON.stringify(FOES)}) {
      for (const e of BK.enemies()) e.alive = false;
      BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(200); BK.god = false; BK.P.hp = BK.P.maxHp;   /* the last one's arrows, bombs and spores land first */
      const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1] + dy, face: -1, ...(extra || {}) });
      if (!f) { res.push({ t, err: 'did not spawn' }); continue; }
      let tells = 0, marks = new Set(), lastTell = -99, was = false, hits = 0, untold = [], lost = 0;
      for (let k = 0; k < 480; k++) {
        const now = k / 60; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; BK.P.x = spot[0] * 16 + 8; BK.P.vx = 0;
        if (away) BK.P.face = Math.sign(BK.P.x - f.x) || 1; else BK.P.face = Math.sign(f.x - BK.P.x) || 1;
        const hp0 = BK.P.hp; BK.sim(1);
        const tel = f.alive && (BK.telling(f) || HELD.has(f.mode)); if (tel) { if (!was) { tells++; const m = BK.markOf(f); marks.add(m); } lastTell = now; } was = tel;
        if (BK.P.hp < hp0) { hits++; lost += hp0 - BK.P.hp; if (now - lastTell > 3) untold.push(now.toFixed(2) + 's'); }
        if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; }
      }
      res.push({ t, tells, marks: [...marks], hits, lost: Math.round(lost), untold: untold.slice(0, 4), nUntold: untold.length, alive: f.alive, mode: f.mode });
    }
    return res;
  })()`, 600000));
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
const bad = [];
for (const r of out) {
  console.log(JSON.stringify(r));
  if (r.err) { bad.push((r.t || '') + ': ' + r.err); continue; }
  if (!r.tells) bad.push(`${r.t}: never wound up on a mark in eight seconds beside the hero (last mode ${r.mode})`);
  else if (r.marks.some(m => m !== '!' && m !== '!!')) bad.push(`${r.t}: wound up with no mark over it (${JSON.stringify(r.marks)})`);
  if (r.nUntold) bad.push(`${r.t}: ${r.nUntold} hit(s) with no windup in the three seconds before (${r.untold.join(', ')}): an untold hit`);
}
assert.deepEqual(bad, [], 'untold hits:\n  ' + bad.join('\n  '));
console.log(`${out.length} foes that were untold each wound up on a mark, and none hurt the hero without one` +
  ` (skipped, answer-tags holds them: ${Object.entries(SKIP).map(([t, why]) => t + ' - ' + why).join('; ')})`);
