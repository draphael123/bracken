// tools/ember-ward.mjs — THE EMBER WARD (claude/ember-ward, Daniel 2026-09-29: "I like it"): the pyromancer's crouch is a half-dome
// of fire that runs on heat (src/ember-ward.js). On flat Stockade floor, with the hero held where she stands, this fails when:
//   - THE BODY: down held does not raise it (and duck her to DUCK_H), or left/right while it is up walks her instead of turning her
//     (she must face the other way and not move), or it stays up with down let go
//   - A YELLOW BLOW (a topiary's low swipe) finds her through a ward held long before it landed, adds no heat, or singes nothing -
//     or FLARES (it was raised far too early to be perfect)
//   - A HIGH yellow blow (the armour's head-high swing) is not still let go over her by the duck: the ward is the duck and more
//   - AN ARROW is not melted by the ward (none melted, or it found her)
//   - A RED blow (a hound's pounce) does not break through it
//   - THE PERFECT WARD: raised a few frames before the swipe lands (the same fight replayed with the dice pinned, the landing frame
//     measured with no ward), it does not flare, the swiper is not burnt and thrown back, or the ward's heat is not vented; and an
//     arrow met on the beat is not thrown back (reflected, as an ember)
//   - OVERHEAT: a ward at 90 heat that takes a blow does not burst (count), stagger her (P.hurt), lock (down does not raise it while
//     locked), or throw back the foe beside her
//   - WATER: a ward that is up does not go out when she is stood in a pool (wading), or one asked for in the pool lights
//   - OTHER HEROES: the knight, the warden and the paladin raise no ward, still duck on down, and still walk on down + a way
//   - the page throws
//   node tools/ember-ward.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { DUCK_H } from '../src/duck.js';

const bad = [];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.ember) return { err: 'no BK.ember: there is no ember ward' };
    const { LEVELS } = await import('/src/level.js');
    const out = {};
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); };
    setUp('pyro');
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 9, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = () => { clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.vx = 0; P.emberHeat = 0; P.emberLock = 0; P.hurt = 0; P.face = 1; BK.sim(30); };
    const hold = () => { BK.P.vx = 0; BK.P.x = spot[0] * 16 + 8; BK.P.inv = 0; };
    const seedRandom = n => { let s = n; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
    const W0 = () => BK.ember();
    // ---- THE BODY ----
    home(); { const P = BK.P, r = {}; K.down = true; BK.sim(12); r.up = W0().up; r.ducking = BK.duck().ducking; r.h = BK.duck().box.b - BK.duck().box.t;
      const x0 = P.x; K.left = true; BK.sim(20); r.faceL = P.face; r.movedL = Math.abs(P.x - x0); r.upL = W0().up; K.left = false; K.right = true; BK.sim(20); r.faceR = P.face; r.movedR = Math.abs(P.x - x0); r.upR = W0().up; K.right = false;
      K.down = false; BK.sim(10); r.after = W0().up; out.body = r; }
    // ---- A YELLOW BLOW on a ward held from the start (not perfect) ----
    const fight = (t, dx, secs, o = {}) => { home(); BK.emberReset(); if (o.seed) seedRandom(o.seed); if (o.heat) BK.P.emberHeat = o.heat;
      const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (!f) return { err: t + ' did not spawn' };
      let lost = 0, firstLoss = -1, heatAt1 = null, b0 = 0, fx0 = f.x, maxAway = 0, hurtSeen = 0, lockSeen = 0, upInLock = false, returned = 0, heatBefore = null;
      for (let k = 0; k < secs * 60; k++) { const hp0 = BK.P.hp;
        K.down = o.raiseAt === undefined ? !!o.ward : k >= o.raiseAt; if (o.dropAfterBurst && W0().stats.overheats > 0) K.down = true;
        if (o.raiseAt !== undefined && k === o.raiseAt) { if (o.heat) BK.P.emberHeat = o.heat; heatBefore = BK.P.emberHeat || 0; }   /* (a ward that is down cools: its heat is set as it goes up) */
        hold(); if (o.heat && k === 0 && o.raiseAt === undefined) BK.P.emberHeat = o.heat; BK.sim(1);
        const w = W0(); if (w.stats.blocks > b0 && heatAt1 === null) heatAt1 = w.heat; b0 = w.stats.blocks;
        if (f.alive) maxAway = Math.max(maxAway, Math.abs(f.x - BK.P.x) - Math.abs(fx0 - BK.P.x));
        if (BK.P.hurt > 0) hurtSeen++; if (w.lock > 0) { lockSeen++; if (w.up) upInLock = true; }
        returned += BK.seeds().filter(s => s.reflected && s.ember && !s._counted && (s._counted = true)).length;
        if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; if (firstLoss < 0) firstLoss = k; BK.P.hp = BK.P.maxHp; }
        if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; }
        if (o.stopAt && o.stopAt(w, k)) break; }
      none(); const w = W0(); return { t, lost: Math.round(lost), firstLoss, heatAt1, heatEnd: Math.round(w.heat), heatBefore, stats: w.stats, burn: f.burn || 0, fAlive: f.alive, maxAway: Math.round(maxAway), hurtSeen, lockSeen, upInLock, returned, ducked: BK.duck().ducked }; };
    out.swipe = fight('topiary', 2, 9, { ward: true, stopAt: w => w.stats.blocks >= 2 });
    out.high = fight('armour', 2, 6, { ward: true, stopAt: w => false });
    out.arrow = fight('archer', 9, 6, { ward: true, stopAt: w => w.stats.melted >= 1 });
    out.red = fight('hound', 8, 6, { ward: true, stopAt: w => w.stats.through >= 1 });
    // ---- THE PERFECT WARD: when does the swipe land with no ward? the same fight again, the ward raised 5 frames before ----
    const dry = fight('topiary', 2, 8, { ward: false, seed: 77, stopAt: (w, k) => k > 0 && BK.P.hp < BK.P.maxHp });
    out.dry = { firstLoss: dry.firstLoss };
    if (dry.firstLoss > 0) out.perfect = fight('topiary', 2, 9, { seed: 77, raiseAt: Math.max(0, dry.firstLoss - 5), heat: 60, stopAt: (w, k) => k > dry.firstLoss + 20 });
    // an arrow on the beat: the ward raised as it comes into reach
    { home(); BK.emberReset(); const [f] = BK.spawnFoe({ t: 'archer', x: spot[0] + 9, y: spot[1], face: -1 }); let raised = -1, ret = 0, lost = 0;
      for (let k = 0; k < 6 * 60 && !ret; k++) { const hp0 = BK.P.hp; hold();
        const near = BK.seeds().some(s => !s.dead && !s.reflected && (s.x - BK.P.x) * (s.vx || 0) < 0 && Math.abs(s.x - BK.P.x) < 18 + Math.abs(s.vx || 0) * 0.08 && Math.abs(s.y - (BK.P.y - 6)) < 22);
        if (near && raised < 0) raised = k; K.down = raised >= 0 && k - raised < 30; BK.sim(1);
        ret = BK.seeds().filter(s => s.reflected && s.ember && !s.dead).length; if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; BK.P.hp = BK.P.maxHp; } }
      none(); out.arrowBeat = { raised, ret, lost, stats: W0().stats, archerAlive: f.alive }; }
    // ---- OVERHEAT: a ward at 90 takes a blow ----
    out.hot = fight('topiary', 2, 5, { ward: true, heat: 90, dropAfterBurst: true, stopAt: (w, k) => w.stats.overheats > 0 && w.lock <= 0 });
    // ---- WATER ----
    { home(); BK.emberReset(); const P = BK.P, r = {}; K.down = true; BK.sim(10); r.upDry = W0().up;
      const pool = { x0: P.x - 40, x1: P.x + 40, y: P.y - 6, bottom: P.y + 2, shallow: true, emberTest: true }; (BK.L.pools = BK.L.pools || []).push(pool);
      BK.sim(3); r.upWet = W0().up; r.doused = W0().stats.doused; r.swim = !!P.swim; K.down = false; BK.sim(10); K.down = true; BK.sim(20); r.relit = W0().up;
      BK.L.pools.splice(BK.L.pools.indexOf(pool), 1); BK.sim(5); r.upAfter = W0().up; none(); out.water = r; }
    // ---- OTHER HEROES: no ward, the plain duck ----
    out.others = [];
    for (const h of ['knight', 'warden', 'paladin']) { setUp(h); home(); const P = BK.P, r = { h }; K.down = true; BK.sim(12); r.ducking = BK.duck().ducking; r.ward = W0().up;
      const x0 = P.x; K.right = true; BK.sim(30); r.walked = Math.abs(P.x - x0); r.duckWalking = BK.duck().ducking; none(); BK.sim(10); out.others.push(r); }
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  const B = R.body;
  if (!B.up) bad.push('down held did not raise the ward');
  if (!B.ducking || B.h !== DUCK_H) bad.push(`the ward is not the duck: ducking ${B.ducking}, hurt box ${B.h} px (DUCK_H ${DUCK_H})`);
  if (B.faceL !== -1 || B.faceR !== 1) bad.push(`left/right did not turn her while warded (faced ${B.faceL}, then ${B.faceR})`);
  if (B.movedL > 1 || B.movedR > 1) bad.push(`she walked while warded (${B.movedL}, ${B.movedR} px)`);
  if (!B.upL || !B.upR) bad.push('turning dropped the ward');
  if (B.after) bad.push('the ward stayed up with down let go');
  const S = R.swipe;
  if (S.err) bad.push(S.err); else {
    if (S.lost > 0) bad.push(`a yellow swipe found her through the ward for ${S.lost}`);
    if (!(S.stats.blocks > 0)) bad.push('the ward blocked no yellow swipe');
    if (!(S.heatAt1 > 0)) bad.push('a blocked blow added no heat');
    if (!(S.burn > 0) && S.fAlive) bad.push('the swiper was not singed');
    if (S.stats.flares > 0) bad.push('a ward held long before the blow FLARED (it is not perfect)'); }
  const Hh = R.high;
  if (Hh.err) bad.push(Hh.err); else { if (Hh.lost > 0) bad.push(`the armour's high swing found the warded (ducked) pyromancer for ${Hh.lost}`); if (!(Hh.ducked > 0)) bad.push('the armour\'s high swing did not go over her by the duck'); if (Hh.stats.blocks > 0) bad.push('the high swing was taken on the ward (heat) instead of going over by the duck'); }
  const A = R.arrow;
  if (A.err) bad.push(A.err); else { if (!(A.stats.melted > 0)) bad.push('no arrow melted in the ward'); if (A.lost > 0) bad.push(`an arrow found her through the ward for ${A.lost}`); if (!(A.heatEnd > 0)) bad.push('a melted arrow added no heat'); }
  const Rd = R.red;
  if (Rd.err) bad.push(Rd.err); else if (!(Rd.lost > 0) || !(Rd.stats.through > 0)) bad.push(`a red blow (the hound's pounce) did not break through the ward: lost ${Rd.lost}, through ${Rd.stats.through}`);
  if (!(R.dry.firstLoss > 0)) bad.push('the dry run never took the swipe (no landing frame to time the perfect ward by)');
  else { const Pf = R.perfect;
    if (!Pf || Pf.err) bad.push('perfect: ' + (Pf && Pf.err));
    else { if (!(Pf.stats.flares > 0)) bad.push(`a ward raised 5 frames before the swipe did not FLARE: ${JSON.stringify(Pf.stats)}`);
      if (Pf.lost > 0) bad.push(`the perfect ward let the swipe through for ${Pf.lost}`);
      if (!(Pf.burn > 0) && Pf.fAlive) bad.push('the flare did not burn the swiper');
      if (!(Pf.maxAway > 8)) bad.push(`the flare did not throw the swiper back (${Pf.maxAway} px)`);
      if (!(Pf.heatEnd < Pf.heatBefore)) bad.push(`the flare did not vent the heat (${Pf.heatBefore} -> ${Pf.heatEnd})`); } }
  const Ab = R.arrowBeat;
  if (!(Ab.ret > 0) && !(Ab.stats.returned > 0)) bad.push(`an arrow met on the beat was not thrown back: ${JSON.stringify(Ab)}`);
  if (Ab.lost > 0) bad.push(`the arrow on the beat found her for ${Ab.lost}`);
  const Ho = R.hot;
  if (Ho.err) bad.push(Ho.err); else {
    if (!(Ho.stats.overheats > 0)) bad.push(`a ward at 90 heat took a blow and did not overheat: ${JSON.stringify(Ho.stats)}`);
    else { if (!(Ho.hurtSeen > 0)) bad.push('the overheat did not stagger her'); if (!(Ho.lockSeen > 0)) bad.push('the overheat did not lock the ward'); if (Ho.upInLock) bad.push('the ward rose while it was locked');
      if (!(Ho.maxAway > 8) && Ho.fAlive) bad.push(`the overheat burst did not throw back the foe beside her (${Ho.maxAway} px)`); } }
  const Wt = R.water;
  if (!Wt.upDry) bad.push('water: the ward did not rise on dry ground first');
  if (Wt.swim) bad.push('water: the test pool made her swim (it should be wading)');
  if (Wt.upWet || !(Wt.doused > 0)) bad.push(`water: the ward did not go out in the pool (up ${Wt.upWet}, doused ${Wt.doused})`);
  if (Wt.relit) bad.push('water: the ward lit again in the pool');
  if (!Wt.upAfter) bad.push('water: out of the pool, the ward did not come back');
  for (const o of R.others) { if (o.ward) bad.push(`${o.h}: raised an ember ward`); if (!o.ducking) bad.push(`${o.h}: down no longer ducks`); if (o.duckWalking) bad.push(`${o.h}: still ducked with down + a way`); if (!(o.walked > 4)) bad.push(`${o.h}: down + a way no longer walks (${o.walked} px)`); }
}
assert.deepEqual(bad, [], 'the ember ward:\n  ' + bad.join('\n  '));
console.log('the ember ward holds: down raises it (and ducks her), she turns and does not walk, a yellow swipe is blocked and heats it, a high swing still goes over, an arrow melts, a red pounce breaks through, a ward raised on the beat flares, throws the swiper back, vents and returns an arrow, a full ward overheats, staggers and locks, water puts it out, and the other heroes keep the plain duck');
