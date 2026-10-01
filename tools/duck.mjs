// tools/duck.mjs — THE UNIVERSAL DUCK (claude/duck, Daniel 2026-09-29: "crouch = universal duck").
//
// Down held on the ground, standing still, crouches every hero, and a HIGH blow goes over him (src/duck.js, src/marks.js HEIGHT).
// This fails when:
//   - THE TABLE: a told blow of the ANSWER table (every common foe's, answer-tags holds that) has no HEIGHT row, a row is not
//     'high' or 'low', a HEIGHT row names no blow in MARK, a 'duck' answer is not high or a 'jump' answer is not low
//   - THE BODY, for every hero: down held does not duck him, his hurt box (BK.duck().box) is not DUCK_H tall ducked and his full
//     height standing, or he ducks while walking, while holding a guard, or in the air
//   - THE BLOWS, on flat ground with a hero who does not guard: an archer's arrow or a crossbow's bolt finds a ducked hero (and
//     finds him standing - the control), a suit of armour's head-high swing finds him ducked, or a topiary's low swipe misses him
//     ducked (a low blow must still land)
//   - WHAT STAYS: down no longer braces (a gust), down + jump on a board no longer drops through it, or a harbour lookout sees
//     a ducked hero in front of him (the hide) while he sees a standing one
//   - THE TELL: an archer's draw is drawn without the DUCK lane beside its mark, or a hound's pounce without the JUMP lane
//   - the page throws
//   node tools/duck.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { DUCK_H } from '../src/duck.js';

const bad = [];
// ---- THE TABLE ----
for (const k of Object.keys(ANSWER)) if (!(k in HEIGHT)) bad.push(`${k}: an answered blow with no HEIGHT row`);
for (const [k, v] of Object.entries(HEIGHT)) {
  if (v !== 'high' && v !== 'low') bad.push(`${k}: HEIGHT '${v}' is not high or low`);
  if (!(MARK[k] === '!' || MARK[k] === '!!')) bad.push(`${k}: a HEIGHT row for no told blow (MARK says ${JSON.stringify(MARK[k])})`);
  if (ANSWER[k] === 'duck' && v !== 'high') bad.push(`${k}: answered 'duck' but ${v}`);
  if (ANSWER[k] === 'jump' && v !== 'low') bad.push(`${k}: answered 'jump' but ${v}`);
}
const highs = Object.keys(HEIGHT).filter(k => HEIGHT[k] === 'high');
/* the blows Daniel named (2026-09-29): arrows, bolts, the Lance's high thrust - and the low sweep beside it that is still jumped */
for (const [k, v] of [['archer|draw', 'high'], ['crossbow|aim', 'high'], ['lance|thrustTell', 'high'], ['lance|sweepTell', 'low']]) if (HEIGHT[k] !== v) bad.push(`${k}: HEIGHT ${HEIGHT[k]}, not ${v}`);

const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    const out = { heroes: [], blows: {}, kept: {}, tells: {} };
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); };
    setUp('knight');
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 9, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = () => { clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.vx = 0; };
    // ---- THE BODY, every hero ----
    for (const h of ${JSON.stringify(HEROES)}) {
      setUp(h); home(); const P = BK.P, r = { h };
      r.stand = BK.duck().box.b - BK.duck().box.t;
      K.down = true; BK.sim(12); r.ducked = BK.duck().ducking; r.duckH = BK.duck().box.b - BK.duck().box.t;
      K.block = true; BK.sim(30); r.guardUp = !!(P.block || P.aegis || P.warding); r.guardDucks = r.guardUp && BK.duck().ducking; K.block = false;
      { const x0 = P.x; K.right = true; BK.sim(20); r.walkDucks = BK.duck().ducking; r.walkMoved = Math.round(Math.abs(P.x - x0)); r.walkWard = !!(BK.ember && BK.ember() && BK.ember().up); K.right = false; }
      none(); BK.sim(20); K.down = true; BK.press('jump'); K.jump = true; BK.sim(8); r.airDucks = BK.duck().ducking; none(); BK.sim(60);
      r.after = BK.duck().ducking;
      out.heroes.push(r); }
    // ---- THE BLOWS: the warden holds no guard, so only the duck is between her and each blow (the pyromancer's duck is her EMBER WARD now,
    //      claude/ember-ward, which blocks and melts what the duck lets through: tools/ember-flare.mjs holds that) ----
    setUp('warden');
    const trial = (t, dx, duck, extra, secs = 8) => { home(); BK.P.face = 1;
      const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1, ...(extra || {}) }); if (!f) return { err: t + ' did not spawn' };
      let lost = 0, hits = [], d0 = BK.duck().ducked, tells = 0, was = false;
      for (let k = 0; k < secs * 60; k++) { const hp0 = BK.P.hp; K.down = duck; BK.P.vx = 0; BK.P.x = spot[0] * 16 + 8; BK.P.face = 1; BK.P.inv = 0; BK.sim(1);
        const tl = f.alive && BK.telling(f); if (tl && !was) tells++; was = tl;
        if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; hits.push(f.toldK || f.mode); BK.P.hp = BK.P.maxHp; }
        if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; } }
      K.down = false; return { t, duck, lost: Math.round(lost), hits: [...new Set(hits)], over: BK.duck().ducked - d0, tells, alive: f.alive }; };
    out.blows.arrowDucked = trial('archer', 9, true); out.blows.arrowStanding = trial('archer', 9, false);
    out.blows.boltDucked = trial('crossbow', 10, true); out.blows.boltStanding = trial('crossbow', 10, false);
    out.blows.swingDucked = trial('armour', 2, true); out.blows.swingStanding = trial('armour', 2, false);
    out.blows.lowDucked = trial('topiary', 2, true);
    // ---- WHAT STAYS ----
    home(); K.down = true; BK.sim(10); out.kept.braced = BK.duck().braced; none();
    { home(); const G = BK.L.grid, bx = spot[0] - 1, by = spot[1] - 3; for (let x = bx; x < bx + 3; x++) G[by * W + x] = 2;   /* (BK.L: the level was loaded again for the pyromancer) */
      BK.tp(bx + 1, by - 1); BK.sim(30); const y0 = BK.P.y; out.kept.onBoard = BK.P.ground && Math.abs(y0 - by * 16) < 3;
      K.down = true; BK.sim(10); out.kept.boardDucks = BK.duck().ducking; BK.press('jump'); K.jump = true; BK.sim(4); K.jump = false; BK.sim(40); none();
      out.kept.dropped = BK.P.y > y0 + 30; for (let x = bx; x < bx + 3; x++) G[by * W + x] = 0; }
    const look = duck => { home(); const [f] = BK.spawnFoe({ t: 'lookout', x: spot[0] + 6, y: spot[1], face: -1 }); if (!f) return 'no lookout'; f.face = -1; f.mode = 'scan'; f.modeT = 3; let saw = false;
      for (let k = 0; k < 90; k++) { K.down = duck; BK.P.vx = 0; BK.sim(1); if (f.mode === 'spot' || f.mode === 'shout') saw = true; } none(); return saw; };
    out.kept.seesStanding = look(false); out.kept.seesDucked = look(true);
    // ---- THE TELL: the lane beside the mark, as drawn ----
    const lanes = (t, dx) => { home(); const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (!f) return 'no ' + t; const seen = new Set();
      for (let k = 0; k < 360; k++) { BK.P.hp = BK.P.maxHp; BK.P.x = spot[0] * 16 + 8; BK.step(1); if (f.alive && BK.telling(f)) for (const d of BK.duck().tells) seen.add(d.txt + ':' + d.lane); } return [...seen]; };
    out.tells.archer = lanes('archer', 9); out.tells.hound = lanes('hound', 8);
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const r of R.heroes) {
    console.log('body', JSON.stringify(r));
    if (!r.ducked) bad.push(`${r.h}: down held on the ground did not duck`);
    if (r.duckH !== DUCK_H) bad.push(`${r.h}: ducked hurt box ${r.duckH} px tall, not DUCK_H ${DUCK_H}`);
    if (!(r.stand > DUCK_H)) bad.push(`${r.h}: standing hurt box ${r.stand} px, not taller than the duck`);
    if (r.guardDucks) bad.push(`${r.h}: ducked with a guard up`);
    if (r.walkDucks && !(r.h === 'pyro' && r.walkWard && r.walkMoved <= 1)) bad.push(`${r.h}: ducked while walking`);   /* (the pyromancer's EMBER WARD turns her on a way held, and she does not walk: tools/ember-flare.mjs) */
    if (r.airDucks) bad.push(`${r.h}: ducked in the air`);
    if (r.after) bad.push(`${r.h}: still ducked with down let go`);
  }
  const B = R.blows; for (const [k, v] of Object.entries(B)) console.log('blow', k, JSON.stringify(v));
  for (const [k, v] of Object.entries(B)) if (v.err) bad.push(k + ': ' + v.err);
  const pair = (duck, stand, what) => {
    if (!(stand.lost > 0)) bad.push(`${what}: never found the standing hero (the control): ${JSON.stringify(stand)}`);
    if (duck.lost > 0) bad.push(`${what}: found the ducked hero for ${duck.lost} (${duck.hits.join(', ')})`);
    if (!(duck.tells > 0)) bad.push(`${what}: never loosed at the ducked hero`); };
  pair(B.arrowDucked, B.arrowStanding, 'a high arrow'); if (!(B.arrowDucked.over > 0)) bad.push('a high arrow: none went over the ducked hero by seedOver (it should dip into his box and fly on)'); if (!(B.swingDucked.over > 0)) bad.push('a head-high swing: none went over the ducked hero by its HEIGHT row'); pair(B.boltDucked, B.boltStanding, 'a high bolt'); pair(B.swingDucked, B.swingStanding, 'a head-high swing');
  if (!(B.lowDucked.lost > 0)) bad.push(`a low swipe (the topiary) never found the ducked hero: ${JSON.stringify(B.lowDucked)}`);
  const Kp = R.kept; console.log('kept', JSON.stringify(Kp));
  if (!Kp.braced) bad.push('down no longer braces');
  if (!Kp.onBoard) bad.push('could not stand the hero on the test board');
  else { if (!Kp.boardDucks) bad.push('no duck on a board'); if (!Kp.dropped) bad.push('down + jump on a board no longer drops through it'); }
  if (Kp.seesStanding !== true) bad.push(`the lookout never saw a standing hero (the control): ${Kp.seesStanding}`);
  if (Kp.seesDucked !== false) bad.push(`the lookout saw a ducked hero: ${Kp.seesDucked}`);
  console.log('tells', JSON.stringify(R.tells));
  if (!Array.isArray(R.tells.archer) || !R.tells.archer.includes('!:duck')) bad.push(`an archer's draw showed no DUCK lane: ${JSON.stringify(R.tells.archer)}`);
  if (!Array.isArray(R.tells.hound) || !R.tells.hound.includes('!!:jump')) bad.push(`a hound's pounce showed no JUMP lane: ${JSON.stringify(R.tells.hound)}`);
}
assert.deepEqual(bad, [], 'the universal duck:\n  ' + bad.join('\n  '));
console.log(`the duck holds: ${Object.keys(HEIGHT).length} blows tagged (${highs.length} high), ${R.heroes.length} heroes duck to ${DUCK_H} px, arrows, bolts and a head-high swing go over, a low swipe still lands, brace, drop-through and the lookout's hide kept, and the marks show the lane`);
