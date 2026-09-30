// tools/crouch-b.mjs — PER-HERO CROUCH TWISTS, PART B (claude/crouchb): the paladin's KNEEL IN PRAYER, the geomancer's EARTH SENSE and
// the death knight's BLOOD HARVEST (src/crouch-b.js), each the universal duck plus a twist. On flat Stockade floor, with the hero held
// where he stands, this fails when:
//   - THE PALADIN: down held does not pray (after KNEEL.settle), his LIGHT does not fill at KNEEL.rate a second (empty to full in 4 s),
//     it fills while he stands or walks, the pose is not his kneel, the kneel is not the duck (hurt box DUCK_H, the armour's high swing
//     still goes over), or he is not EXPOSED (a topiary's low swipe must still find him, and the hit must break the prayer)
//   - THE GEOMANCER: down held does not show a buried dead man inside SENSE.R (and one outside it is shown), it wakes or hurts him (a
//     sense is information only), it does not show a breakable wall inside SENSE.R, something is shown while she stands, what she found
//     is gone before SENSE.after has run or still there well after it, or the pose is not her sense
//   - THE DEATH KNIGHT: crouched over the body of what he killed he gets no HARVEST.hp health and HARVEST.blood BLOOD by HARVEST.time
//     (or gets it early), the body gives twice, a body a stride away is drawn, a draw broken off part way still pays, the pose is not his
//     harvest, or he is not EXPOSED while he draws (a low swipe finds him; his blood ward is not up)
//   - THE BOT (src/lab.js crouchBPlan): calm with his light low the paladin does not kneel (or kneels with a foe three tiles off), calm
//     the geomancer does not look, or the death knight does not walk to a body three tiles off and draw it
//   - OTHER HEROES: the knight, the warden and the pyromancer pray, sense or harvest anything, or no longer duck / walk on down + a way
//   - the page throws
//   node tools/crouch-b.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { DUCK_H } from '../src/duck.js';
import { KNEEL, SENSE, HARVEST } from '../src/crouch-b.js';

const bad = [];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.crouchB) return { err: 'no BK.crouchB: there are no crouch twists' };
    BK.SET.speed = 1;   /* the world's clock at 1: KNEEL.rate and HARVEST.time are in the world's seconds */
    const { LEVELS } = await import('/src/level.js');
    const out = {};
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); };
    setUp('paladin');
    const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 26 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 9, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = () => { clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.vx = 0; P.hurt = 0; P.face = 1; P.light = 0; P.harvest = 0; BK.sim(30); BK.crouchBReset(); };
    const hold = () => { BK.P.vx = 0; BK.P.x = spot[0] * 16 + 8; BK.P.inv = 0; };
    const C = () => BK.crouchB();
    const box = () => { const b = BK.duck().box; return b.b - b.t; };
    /* A FOE AT HIM while down is held: what it took off him, and whether a blow went over by the duck */
    const fight = (t, dx, secs, o = {}) => { home(); if (o.pre) o.pre(); if (o.light !== undefined) BK.P.light = o.light;
      const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1 }); if (!f) return { err: t + ' did not spawn' };
      let lost = 0, firstLoss = -1, prayBefore = false, prayAfterHit = null, lightAtHit = null, wardUp = false, drawAtHit = false;
      for (let k = 0; k < secs * 60; k++) { const hp0 = BK.P.hp; K.down = true; hold(); if (o.body) o.body(); BK.sim(1);
        const c = C(); if (BK.P.warding || BK.P.aegis || BK.P.block) wardUp = true;
        if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; if (firstLoss < 0) { firstLoss = k; prayBefore = c.praying || c.drawing; drawAtHit = c.drawing; lightAtHit = c.light; } BK.P.hp = BK.P.maxHp; }
        else if (firstLoss >= 0 && k - firstLoss <= 20) prayAfterHit = Math.min(prayAfterHit ?? 9, c.kneelT);   /* (the hit's hitstop holds him a few frames first) */
        if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; }
        if (o.stopAt && o.stopAt(k)) break; }
      none(); f.alive = false; return { t, lost: Math.round(lost), firstLoss, prayBefore, prayAfterHit, lightAtHit, wardUp, drawAtHit, ducked: BK.duck().ducked }; };

    // ================= THE PALADIN =================
    { home(); const P = BK.P, r = {}; P.light = 0;
      K.down = true; BK.sim(Math.round(${KNEEL.settle} * 60) - 2); r.lightSettle = P.light; r.prayingEarly = C().praying;
      BK.sim(60); r.l1 = P.light; BK.sim(60); r.l2 = P.light; r.praying = C().praying; r.box = box(); r.aegis = !!P.aegis; r.block = !!P.block;
      BK.step(2); r.pose = P.lastKey;
      BK.sim(150); r.l4 = P.light; r.given = C().stats.lightGiven;
      K.down = false; P.light = 30; BK.sim(60); r.stood = P.light;
      K.down = true; K.right = true; BK.sim(60); r.walked = P.light; r.walkPray = C().praying; none(); BK.sim(10);
      out.pal = r; }
    out.palLow = fight('topiary', 2, 8, { light: 0, stopAt: k => false });
    out.palHigh = fight('armour', 2, 6, { light: 0, stopAt: k => false });

    // ================= THE GEOMANCER =================
    setUp('geomancer');
    { home(); const P = BK.P, r = {};
      const [near] = BK.spawnFoe({ t: 'zombie', x: spot[0] + 5.5, y: spot[1], face: -1, buried: true });
      const [mid] = BK.spawnFoe({ t: 'zombie', x: spot[0] + 7.5, y: spot[1] - 0, face: -1, buried: true });   /* 7.5 tiles: past the old six-tile sense, inside the eight-tile one */
      const [far] = BK.spawnFoe({ t: 'zombie', x: spot[0] - 9, y: spot[1], face: 1, buried: true });
      const wall = { x0: spot[0] - 4, x1: spot[0] - 4, y0: spot[1] - 1, y1: spot[1], kind: 'secret', ore: 0, colour: null, hits: 0, broken: false, flash: 0, crouchTest: true };
      (BK.L.walls = BK.L.walls || []).push(wall);
      r.nearMode0 = near && near.mode; r.farMode0 = far && far.mode;
      for (let k = 0; k < 30; k++) { hold(); BK.sim(1); } r.seenStanding = C().seen.length;
      K.down = true; for (let k = 0; k < 30; k++) { hold(); BK.sim(1); }
      const c = C(); r.seen = c.seen; r.nearSeen = c.seen.some(s => s.t === 'zombie' && Math.abs(s.x - near.x) < 2); r.midSeen = c.seen.some(s => s.t === 'zombie' && Math.abs(s.x - mid.x) < 2); r.farSeen = c.seen.some(s => s.t === 'zombie' && Math.abs(s.x - far.x) < 2);
      r.wallSeen = c.seen.some(s => s.wall && s.x0 === wall.x0); r.found = c.stats.found; r.nearMode = near.mode; r.nearHp = near.hp; r.nearHp0 = near.hp0 ?? near.hp; r.hp = P.hp; r.box = box();
      BK.step(2); r.pose = P.lastKey;
      K.down = false; for (let k = 0; k < Math.round((${SENSE.after} - 0.5) * 60); k++) { hold(); BK.sim(1); } r.seenAfter = C().seen.length;
      for (let k = 0; k < 60; k++) { hold(); BK.sim(1); } r.seenLate = C().seen.length; r.nearModeEnd = near.mode;
      BK.L.walls.splice(BK.L.walls.indexOf(wall), 1); none(); out.geo = r; }
    out.geoHigh = fight('armour', 2, 6, { stopAt: k => false });

    // ================= THE DEATH KNIGHT =================
    setUp('reaper');
    { home(); const P = BK.P, r = {};
      const kill = dx => { const [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + dx, y: spot[1], face: -1 }); f.hp = 1; BK.combat2().strike(f, 'light', 99); BK.sim(20); return f; };
      const f1 = kill(0.2); r.killed = !f1.alive; r.bodies = C().bodies.length;
      P.harvest = 0; P.hp = P.maxHp - 30; const hp0 = P.hp;
      K.down = true; for (let k = 0; k < Math.round(${HARVEST.time} * 60) - 6; k++) { hold(); BK.sim(1); } r.early = { hp: P.hp - hp0, blood: P.harvest, drawing: C().drawing };
      BK.step(1); r.pose = P.lastKey; r.warding = !!P.warding; r.box = box();
      for (let k = 0; k < 14; k++) { hold(); BK.sim(1); } r.got = { hp: P.hp - hp0, blood: Math.round(P.harvest), harvests: C().stats.harvests };
      for (let k = 0; k < 60; k++) { hold(); BK.sim(1); } r.twice = { hp: P.hp - hp0, harvests: C().stats.harvests, bodies: C().bodies.length };
      K.down = false; BK.sim(10);
      // a body a stride away is not drawn
      const f2 = kill(2.2); P.hp = P.maxHp - 30; const hpA = P.hp; K.down = true; for (let k = 0; k < 60; k++) { hold(); BK.sim(1); } r.far = { hp: P.hp - hpA, harvests: C().stats.harvests, bodies: C().bodies.length };
      K.down = false; BK.sim(10);
      // a draw broken off part way pays nothing, and starts again from the beginning
      const f3 = kill(0.3); P.hp = P.maxHp - 30; const hpB = P.hp; const n0 = C().stats.harvests;
      K.down = true; for (let k = 0; k < 24; k++) { hold(); BK.sim(1); } K.down = false; for (let k = 0; k < 6; k++) { hold(); BK.sim(1); }
      K.down = true; for (let k = 0; k < 24; k++) { hold(); BK.sim(1); } r.broken = { hp: P.hp - hpB, harvests: C().stats.harvests - n0, brokenCount: C().stats.harvestBroken };
      for (let k = 0; k < 20; k++) { hold(); BK.sim(1); } r.resumed = { hp: P.hp - hpB, harvests: C().stats.harvests - n0 };
      none(); out.dk = r; }
    // exposed while he draws: a low swipe finds him, and his ward is not up
    out.dkLow = fight('topiary', 2, 8, { pre: () => { const [s] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 0.2, y: spot[1], face: -1 }); s.hp = 1; BK.combat2().strike(s, 'light', 99); BK.sim(2); }, stopAt: k => false });
    out.dkHigh = fight('armour', 2, 6, { stopAt: k => false });

    // ================= THE BOT (src/lab.js crouchBPlan): calm, each does it; with a foe near, none does =================
    { const { crouchBPlan, crouchBKeys } = await import('/src/lab.js'); out.bot = {};
      const drive = (h, n) => { let planned = 0; for (let k = 0; k < n; k++) { none(); if (crouchBKeys(BK, crouchBPlan(BK, h))) planned++; BK.sim(1); } none(); return planned; };
      setUp('paladin'); home(); BK.P.light = 10; out.bot.pal = { planned: drive('paladin', 240), light: Math.round(BK.P.light) };
      home(); BK.P.light = 10; BK.spawnFoe({ t: 'topiary', x: spot[0] + 3, y: spot[1], face: -1 }); out.bot.palNear = { planned: drive('paladin', 30), light: Math.round(BK.P.light) };
      setUp('geomancer'); home(); out.bot.geo = { planned: drive('geomancer', 60), senses: C().stats.senses };
      setUp('reaper'); home(); { const [s] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 3, y: spot[1], face: -1 }); s.hp = 1; BK.combat2().strike(s, 'light', 99); BK.sim(20); }
      BK.P.hp = BK.P.maxHp - 30; BK.P.harvest = 0; const x0 = BK.P.x; out.bot.dk = { planned: drive('reaper', 150), harvests: C().stats.harvests, walked: Math.round(BK.P.x - x0) }; }
    // ================= OTHER HEROES: the plain duck, and nothing more =================
    out.others = [];
    for (const h of ['knight', 'warden', 'pyro']) { setUp(h); home(); const P = BK.P, r = { h }; P.light = 0; K.down = true; BK.sim(200); r.light = P.light || 0; r.ducking = BK.duck().ducking; r.box = box();
      const c = C(); r.kneelT = c.kneelT; r.senseT = c.senseT; r.harvT = c.harvT; r.seen = c.seen.length; r.stats = c.stats;
      const x0 = P.x; K.right = true; BK.sim(30); r.walked = Math.abs(P.x - x0); r.duckWalking = BK.duck().ducking; none(); BK.sim(10); out.others.push(r); }
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  // ---- THE PALADIN ----
  const Pa = R.pal;
  if (Pa.lightSettle > 0.5 || Pa.prayingEarly) bad.push(`paladin: the prayer took before he had settled (${KNEEL.settle} s): light ${Pa.lightSettle}`);
  const rate = Pa.l2 - Pa.l1;
  if (!(Math.abs(rate - KNEEL.rate) < 2)) bad.push(`paladin: his light filled ${rate.toFixed(1)} a second kneeling (want ${KNEEL.rate})`);
  if (!(Pa.l4 >= 99.9)) bad.push(`paladin: four and a half seconds on his knees from empty did not fill his light (${Pa.l4.toFixed(1)})`);
  if (!Pa.praying) bad.push('paladin: down held did not pray');
  if (Pa.box !== DUCK_H) bad.push(`paladin: the kneel is not the duck (hurt box ${Pa.box}, DUCK_H ${DUCK_H})`);
  if (Pa.aegis || Pa.block) bad.push('paladin: a guard stood up while he knelt');
  if (Pa.pose !== 'kneel') bad.push(`paladin: praying, he is drawn as '${Pa.pose}', not his kneel`);
  if (Pa.stood !== 30) bad.push(`paladin: his light moved while he stood (30 -> ${Pa.stood})`);
  if (Pa.walked !== 30 || Pa.walkPray) bad.push(`paladin: his light moved while he walked with down held (30 -> ${Pa.walked})`);
  const PL = R.palLow;
  if (PL.err) bad.push(PL.err); else { if (!(PL.lost > 0)) bad.push('paladin: a low swipe did not find him kneeling (he must be exposed)');
    else { if (!PL.prayBefore) bad.push('paladin: he was not yet praying when the swipe landed (the test proves nothing)'); if (!(PL.prayAfterHit === 0)) bad.push(`paladin: the hit did not break his prayer (kneelT after ${PL.prayAfterHit})`); }
    if (PL.wardUp) bad.push('paladin: a guard came up while he knelt'); }
  const PH = R.palHigh;
  if (PH.err) bad.push(PH.err); else { if (PH.lost > 0) bad.push(`paladin: the armour's high swing found him kneeling for ${PH.lost}`); if (!(PH.ducked > 0)) bad.push('paladin: the high swing did not go over him by the duck'); }
  // ---- THE GEOMANCER ----
  const G = R.geo;
  if (G.nearMode0 !== 'buried' || G.farMode0 !== 'buried') bad.push(`geomancer: the test's dead men did not start buried (${G.nearMode0}, ${G.farMode0})`);
  if (G.seenStanding) bad.push(`geomancer: ${G.seenStanding} shown while she stood`);
  if (!G.nearSeen) bad.push(`geomancer: a buried dead man 5.5 tiles off (inside ${SENSE.R} px) was not shown: ${JSON.stringify(G.seen)}`);
  if (!G.midSeen) bad.push(`geomancer: a buried dead man 7.5 tiles off (inside the ${SENSE.R} px, eight-tile sense) was not shown`);
  if (SENSE.R !== 128) bad.push(`geomancer: the sense reach is ${SENSE.R} px, the design is eight tiles (128)`);
  if (G.farSeen) bad.push('geomancer: a buried dead man 9 tiles off (outside the sense) was shown');
  if (!G.wallSeen) bad.push('geomancer: a breakable wall four tiles off was not shown');
  if (!(G.found >= 2)) bad.push(`geomancer: the find counted ${G.found} (want the dead man and the wall)`);
  if (G.nearMode !== 'buried' || G.nearHp !== G.nearHp0 || G.nearModeEnd !== 'buried') bad.push(`geomancer: the sense woke or hurt what it found (mode ${G.nearMode}/${G.nearModeEnd}, hp ${G.nearHp}/${G.nearHp0})`);
  if (G.box !== DUCK_H) bad.push(`geomancer: the sense is not the duck (hurt box ${G.box})`);
  if (G.pose !== 'sense') bad.push(`geomancer: sensing, she is drawn as '${G.pose}', not her sense`);
  if (!(G.seenAfter >= 2)) bad.push(`geomancer: what she found was gone before the after-glow (${SENSE.after} s) ran (${G.seenAfter} left)`);
  if (G.seenLate) bad.push(`geomancer: ${G.seenLate} still shown well after the after-glow`);
  if (R.geoHigh.lost > 0 || !(R.geoHigh.ducked > 0)) bad.push(`geomancer: the armour's high swing did not go over her sensing (lost ${R.geoHigh.lost})`);
  // ---- THE DEATH KNIGHT ----
  const D = R.dk;
  if (!D.killed || !(D.bodies > 0)) bad.push(`death knight: the sprig he killed left no body (${D.bodies})`);
  if (D.early.hp > 0 || D.early.blood > 0) bad.push(`death knight: the body paid before ${HARVEST.time} s: ${JSON.stringify(D.early)}`);
  if (!D.early.drawing) bad.push('death knight: crouched over the body he was not drawing from it');
  if (D.pose !== 'harvest') bad.push(`death knight: drawing, he is drawn as '${D.pose}', not his harvest`);
  if (D.warding) bad.push('death knight: his blood ward was up while he drew');
  if (D.box !== DUCK_H) bad.push(`death knight: the harvest is not the duck (hurt box ${D.box})`);
  if (D.got.hp !== HARVEST.hp || D.got.blood !== HARVEST.blood || D.got.harvests !== 1) bad.push(`death knight: the harvest gave ${JSON.stringify(D.got)} (want +${HARVEST.hp} health, ${HARVEST.blood} blood, once)`);
  if (D.twice.hp !== HARVEST.hp || D.twice.harvests !== 1) bad.push(`death knight: the body gave twice: ${JSON.stringify(D.twice)}`);
  if (D.far.hp !== 0 || D.far.harvests !== 1) bad.push(`death knight: a body two tiles off was drawn: ${JSON.stringify(D.far)}`);
  if (D.broken.hp !== 0 || D.broken.harvests !== 0 || !(D.broken.brokenCount > 0)) bad.push(`death knight: a draw broken off (0.4 s, stood, 0.4 s) paid: ${JSON.stringify(D.broken)}`);
  if (D.resumed.hp !== HARVEST.hp || D.resumed.harvests !== 1) bad.push(`death knight: kept down after, the body never gave: ${JSON.stringify(D.resumed)}`);
  const DL = R.dkLow;
  if (DL.err) bad.push(DL.err); else { if (!(DL.lost > 0)) bad.push('death knight: a low swipe did not find him crouched (he must be exposed)'); if (DL.wardUp) bad.push('death knight: a guard came up while he crouched'); }
  if (R.dkHigh.lost > 0 || !(R.dkHigh.ducked > 0)) bad.push(`death knight: the armour's high swing did not go over him crouched (lost ${R.dkHigh.lost})`);
  // ---- THE BOT ----
  const Bt = R.bot;
  if (!(Bt.pal.planned > 60) || !(Bt.pal.light > 50)) bad.push(`bot: calm with his light low, the paladin did not kneel for it: ${JSON.stringify(Bt.pal)}`);
  if (Bt.palNear.planned > 0) bad.push(`bot: the paladin knelt with a topiary three tiles off: ${JSON.stringify(Bt.palNear)}`);
  if (!(Bt.geo.senses > 0)) bad.push(`bot: calm, the geomancer did not look: ${JSON.stringify(Bt.geo)}`);
  if (!(Bt.dk.harvests > 0) || !(Bt.dk.walked > 20)) bad.push(`bot: the death knight did not walk to the body three tiles off and draw it: ${JSON.stringify(Bt.dk)}`);
  // ---- OTHER HEROES ----
  for (const o of R.others) {
    if (o.light || o.kneelT || o.senseT || o.harvT || o.seen || o.stats.found || o.stats.harvests || o.stats.lightGiven) bad.push(`${o.h}: a crouch twist ran: ${JSON.stringify(o)}`);
    if (!o.ducking || o.box !== DUCK_H) bad.push(`${o.h}: down no longer ducks (box ${o.box})`);
    if (o.duckWalking && o.h !== 'pyro') bad.push(`${o.h}: still ducked with down + a way`);
    if (!(o.walked > 4) && o.h !== 'pyro') bad.push(`${o.h}: down + a way no longer walks (${o.walked} px)`);
  }
}
assert.deepEqual(bad, [], 'the crouch twists (part B):\n  ' + bad.join('\n  '));
console.log('the crouch twists hold: the paladin kneels and his light fills 25 a second, exposed to a low blow that breaks it; the geomancer\'s sense shows a buried dead man and a breakable wall inside six tiles and nothing outside, wakes nothing and lingers its after-glow; the death knight draws 7 health and 12 blood from a body in 0.6 s, once, and a broken draw pays nothing; each is still the duck, and the knight, the warden and the pyromancer are untouched');
