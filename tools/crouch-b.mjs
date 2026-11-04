// tools/crouch-b.mjs — PER-HERO CROUCH TWISTS, PART B (claude/crouchb): the paladin's KNEEL IN PRAYER, the geomancer's EARTH SENSE and
// the blood knight's crouch (src/crouch-b.js), each the universal duck plus a twist (claude/bloodknight: HIS HARVEST IS GONE - Daniel 10-17, crouch option 1). On flat Stockade floor, with the hero held
// where he stands, this fails when:
//   - THE PALADIN (claude/crouchfix: AT A HOLY LIGHT ONLY, src/crouch-b.js HOLY - the test lays a brazier at his feet): down held there does not pray
//     (after KNEEL.settle), his LIGHT does not fill at KNEEL.rate a second, or it fills with no holy light within HOLY.R (a brazier five tiles off, a tipped
//     one, none at all), or he is not the plain duck there; the bot does not kneel at one or walk to one four tiles off,
//     it fills while he stands or walks, the pose is not his kneel, the kneel is not the duck (hurt box DUCK_H, the armour's high swing
//     still goes over), or he is not EXPOSED (a topiary's low swipe must still find him, and the hit must break the prayer)
//   - THE GEOMANCER (claude/geocrouch: STONE SKIN is her crouch; EARTH SENSE below is tested with GEO.pop.skin = false): the skin does not set after SKIN.settle, a yellow blow does not land at SKIN.mulCommon (SKIN.mulBoss from a
//     boss / mini), throws her or stands her up, the third blow does not crack it (she stands, it re-forms SKIN.reform s later), a RED blow does not land whole and break it, the stamina does not come back SKIN.regenMul times as fast,
//     the pose is not gSkin, a high swing does not go over her, or releasing down / a jump leaves the skin up
//   - THE GEOMANCER, EARTH SENSE (GEO.pop.skin = false): down held does not show a buried dead man inside SENSE.R (and one outside it is shown), it wakes or hurts him (a
//     sense is information only), it does not show a breakable wall inside SENSE.R, something is shown while she stands, what she found
//     is gone before SENSE.after has run or still there well after it, or the pose is not her sense
//   - THE BLOOD KNIGHT (claude/bloodknight): crouched over the body of what he killed he gets ANY health or blood (the harvest is gone), he is
//     drawn drawing from it, his crouch is not the duck (DUCK_H) in his kneel pose, his ward comes up, or a low swipe that is no 'low' tell
//     does not find him (his low guard turns only told low blows - tools/dk2.mjs, tools/blood-kit.mjs)
//   - THE BOT (src/lab.js crouchBPlan): calm with his light low the paladin does not kneel (or kneels with a foe three tiles off), calm
//     the geomancer does not look, or the blood knight walks to a body (he draws none now)
//   - OTHER HEROES: the knight, the warden and the pyromancer pray, sense or harvest anything, or no longer duck / walk on down + a way
//   - the page throws
//   node tools/crouch-b.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { DUCK_H } from '../src/duck.js';
import { KNEEL, SENSE, SKIN } from '../src/crouch-b.js';
import { HG } from '../src/holy-ground.js';   /* (claude/paladin4) PRAYER: anywhere at KNEEL.rate, x HG.pray.holyMul by a holy light */

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
    const mine = [];   /* the holy lights this test laid (claude/crouchfix) */
    const holy = (dx, o = {}) => { const q = { t: 'brazier', x: spot[0] * 16 + 8 + dx, y: BK.P.y, lit: true, tipped: false, ...o }; BK.props().push(q); mine.push(q); return q; };
    const home = () => { for (const q of mine) { const i = BK.props().indexOf(q); if (i >= 0) BK.props().splice(i, 1); } mine.length = 0; clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.vx = 0; P.hurt = 0; P.face = 1; P.light = 0; P.harvest = 0; BK.sim(30); BK.crouchBReset(); };
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
    { home(); holy(0); const P = BK.P, r = {}; P.light = 0;
      K.down = true; BK.sim(Math.round(${KNEEL.settle} * 60) - 2); r.lightSettle = P.light; r.prayingEarly = C().praying;
      BK.sim(60); r.l1 = P.light; BK.sim(60); r.l2 = P.light; r.praying = C().praying; r.box = box(); r.aegis = !!P.aegis; r.block = !!P.block;
      BK.step(2); r.pose = P.lastKey;
      BK.sim(150); r.l4 = P.light; r.given = C().stats.lightGiven;
      K.down = false; P.light = 30; BK.sim(60); r.stood = P.light;
      K.down = true; K.right = true; BK.sim(60); r.walked = P.light; r.walkPray = C().praying; none(); BK.sim(10);
      out.pal = r; }
    /* NOT BY A HOLY LIGHT: five tiles off, tipped, unlit-and-none: the plain duck - no prayer, no light, no kneel pose, still the duck */
    { const R2 = {}; const trial = (name, lay) => { home(); lay(); const P = BK.P; P.light = 0; K.down = true; BK.sim(240); const c = C(); R2[name] = { light: P.light, praying: c.praying, kneelT: c.kneelT, holy: !!c.holy, box: box() }; BK.step(2); R2[name].pose = P.lastKey; K.down = false; BK.sim(10); };
      trial('none', () => {}); trial('far', () => holy(80)); trial('tipped', () => holy(0, { tipped: true })); trial('unlit', () => holy(0, { lit: false })); trial('edge', () => holy(40));
      trial('near', () => holy(24)); trial('shrine', () => { const q = { x: spot[0] * 16 + 8 + 20, y: BK.P.y, lit: false }; BK.shrines().push(q); mine.push({ t: 'shrine', _s: q }); });
      for (const q of BK.shrines().slice()) if (q.x === spot[0] * 16 + 8 + 20) BK.shrines().splice(BK.shrines().indexOf(q), 1);
      out.palElse = R2; }
    out.palLow = fight('topiary', 2, 8, { light: 0, pre: () => holy(0), stopAt: k => false });
    out.palHigh = fight('armour', 2, 6, { light: 0, pre: () => holy(0), stopAt: k => false });

    // ================= THE GEOMANCER =================
    setUp('geomancer'); BK.geoK.pop.skin = false;   /* (claude/geocrouch) EARTH SENSE is the crouch behind the switch; STONE SKIN is tested below */
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
    BK.geoK.pop.skin = true;

    // ================= THE GEOMANCER: STONE SKIN (claude/geocrouch) =================
    setUp('geomancer'); BK.geoK.pop.skin = true;
    { const P = BK.P, r = {}; const blow = (d, o = {}) => { P.inv = 0; const hp0 = P.hp; BK.holyHurt(P, P.x + 24, d, o); const lost = hp0 - P.hp; P.hp = P.maxHp; return lost; };
      const big = (e, on) => { e.maxHp = on ? 200 : undefined; return e; };
      const foe = () => BK.spawnFoe({ t: 'sprig', x: spot[0] + 12, y: spot[1], face: -1 })[0];
      const fresh = () => { home(); P.hp = P.maxHp; P.st = P.maxSt; P.skinHits = 0; P.skinHitAt = -99; P.skinReformT = 0; P.inv = 0; };
      const down = n => { K.down = true; for (let k = 0; k < n; k++) { hold(); BK.sim(1); } };
      const SET = Math.round(${SKIN.settle} * 60);
      // the blows she is measured against: standing, then down but not yet set
      fresh(); K.down = false; BK.sim(10); hold(); r.baseY = blow(20); r.baseR = blow(20, { unblockable: true });
      fresh(); { const early = foe(); down(SET - 5); r.earlyUp = C().skin.up; r.earlyLost = blow(20, { who: early }); early.alive = false; }
      fresh(); down(SET + 4); r.up = C().skin.up; r.box = box(); BK.step(2); r.pose = P.lastKey;
      // a yellow blow from a common foe: half, no throw, she stays down and the skin stays
      { const e = foe(); r.yLost = blow(20, { who: e }); BK.sim(15); r.yVx = Math.abs(P.vx); r.yDuck = !!P.ducking;   /* (past the hit-stop) */ r.yUp = C().skin.up; r.yHits = C().skin.hits; r.yHurt = P.hurt || 0; e.alive = false; }
      // the third cracks it: she stands, it re-forms in SKIN.reform s
      { const e = foe(); blow(20, { who: e }); r.afterTwo = { up: C().skin.up, hits: C().skin.hits }; BK.sim(15); r.twoDuck = !!P.ducking; blow(20, { who: e }); BK.sim(15); r.crack = { up: C().skin.up, hits: C().skin.hits, reform: C().skin.reform, ducking: !!P.ducking, cracks: C().stats.cracks, vx: Math.abs(P.vx) }; e.alive = false;
        P.hurt = 0; P.inv = 0; down(Math.round((${SKIN.reform} - 0.5) * 60)); r.mid = { up: C().skin.up, reform: C().skin.reform }; down(30 + SET + 8); r.reformed = { up: C().skin.up, hits: C().skin.hits, reform: C().skin.reform }; none(); }
      // a boss or a mini: three quarters
      fresh(); down(SET + 4); { const e = big(foe(), true); r.bLost = blow(20, { who: e }); e.alive = false; }
      // a RED blow: whole, thrown, and it breaks the skin
      fresh(); down(SET + 4); { const e = foe(); r.redLost = blow(20, { who: e, unblockable: true }); BK.sim(3); r.red = { up: C().skin.up, reform: C().skin.reform, breaks: C().stats.breaks, vx: Math.abs(P.vx), ducking: !!P.ducking }; e.alive = false; }
      // a hazard's share is not the skin's business
      fresh(); down(SET + 4); r.hazUp0 = C().skin.up; { BK.holyHurt(P, P.x + 24, 5, { pct: 0.1, unblockable: true }); P.hp = P.maxHp; r.hazHits = C().skin.hits; }
      // the stamina comes back SKIN.regenMul times as fast
      { const gain = on => { fresh(); BK.geoK.pop.skin = on; P.winded = false; down(SET + 4); P.st = P.maxSt * 0.2; P.stDelay = 0; const s0 = P.st; down(12); const g = P.st - s0; K.down = false; return g; };
        r.regenOn = gain(true); r.regenOff = gain(false); BK.geoK.pop.skin = true; }
      // the exits: release down; a jump
      fresh(); down(SET + 4); K.down = false; hold(); BK.sim(2); r.exitRelease = C().skin.up;
      fresh(); down(SET + 4); BK.press('jump'); BK.sim(3); r.exitJump = C().skin.up; none(); BK.sim(40);
      // let go of down after two blows: the count is kept for a while (no fresh skin by tapping down)
      fresh(); down(SET + 4); { const e = foe(); blow(20, { who: e }); blow(20, { who: e }); e.alive = false; } K.down = false; hold(); BK.sim(20); down(SET + 6); r.kept = { up: C().skin.up, hits: C().skin.hits }; none();
      out.skin = r; }
    out.skinHigh = fight('armour', 2, 6, { stopAt: k => false });

    // ================= THE DEATH KNIGHT =================
    setUp('reaper');
    { home(); const P = BK.P, r = {};
      const kill = dx => { const [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + dx, y: spot[1], face: -1 }); f.hp = 1; BK.combat2().strike(f, 'light', 99); BK.sim(20); return f; };
      const f1 = kill(0.2); r.killed = !f1.alive; r.bodies = C().bodies.length;
      P.harvest = 0; P.hp = P.maxHp - 30; const hp0 = P.hp;
      K.down = true; for (let k = 0; k < 30; k++) { hold(); BK.sim(1); } r.early = { hp: P.hp - hp0, blood: P.harvest, drawing: C().drawing };
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
      setUp('paladin'); home(); holy(0); BK.P.light = 10; out.bot.pal = { planned: drive('paladin', 240), light: Math.round(BK.P.light) };
      home(); holy(-64); BK.P.light = 10; { const x0 = BK.P.x; out.bot.palWalk = { planned: drive('paladin', 420), light: Math.round(BK.P.light), walked: Math.round(BK.P.x - x0) }; }
      home(); BK.P.light = 10; out.bot.palNone = { planned: drive('paladin', 120), light: Math.round(BK.P.light) };
      home(); holy(0); BK.P.light = 10; BK.spawnFoe({ t: 'topiary', x: spot[0] + 3, y: spot[1], face: -1 }); out.bot.palNear = { planned: drive('paladin', 30), light: Math.round(BK.P.light) };
      setUp('geomancer'); home(); out.bot.geo = { planned: drive('geomancer', 60), senses: C().stats.senses + C().stats.skins };   /* (claude/geocrouch) the look is a skin set, or a sense with the switch off */
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
  /* (claude/paladin4, Daniel 10-15 ~17:20 - a DESIGN CHANGE, stated: PRAYER works ANYWHERE now at KNEEL.rate (a pip every HG.pray.every s), x HG.pray.holyMul by a holy light;
   was: only by a holy light, at KNEEL.rate. The not-by-a-light trials below now want the SLOW prayer, not the plain duck) */
const HOLYRATE = KNEEL.rate * HG.pray.holyMul, SLOWLIGHT = (4 - KNEEL.settle) * KNEEL.rate;
if (!(Math.abs(rate - HOLYRATE) < 2)) bad.push(`paladin: his light filled ${rate.toFixed(1)} a second kneeling by a holy light (want ${HOLYRATE})`);
  if (!(Pa.l4 >= 99.9)) bad.push(`paladin: four and a half seconds on his knees from empty did not fill his light (${Pa.l4.toFixed(1)})`);
  if (!Pa.praying) bad.push('paladin: down held by a holy light did not pray');
  for (const [k, W] of Object.entries(R.palElse)) { const should = k === 'near' || k === 'shrine';
    if (should) { if (!(W.light >= SLOWLIGHT * HG.pray.holyMul - 3) || !W.praying || W.pose !== 'pray' || !W.holy) bad.push('paladin: by a ' + k + ' light he did not pray three times as fast: ' + JSON.stringify(W)); }
    else { if (!(Math.abs(W.light - SLOWLIGHT) < 3) || !W.praying || W.holy) bad.push('paladin: with ' + k + ' (no holy light) he did not pray at the slow rate (want ~' + SLOWLIGHT.toFixed(1) + '): ' + JSON.stringify(W)); if (W.pose !== 'pray') bad.push('paladin: with ' + k + ' he was not drawn kneeling'); }
    if (W.box !== DUCK_H) bad.push('paladin: with ' + k + ' the kneel is not even the plain duck (box ' + W.box + ')'); }

  if (Pa.box !== DUCK_H) bad.push(`paladin: the kneel is not the duck (hurt box ${Pa.box}, DUCK_H ${DUCK_H})`);
  if (Pa.aegis || Pa.block) bad.push('paladin: a guard stood up while he knelt');
  if (Pa.pose !== 'pray') bad.push(`paladin: praying, he is drawn as '${Pa.pose}', not his prayer pose`);
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
  // ---- THE GEOMANCER: STONE SKIN ----
  { const S = R.skin, near = (a, b, t = 1) => Math.abs(a - b) <= t;
    if (SKIN.settle !== 0.15 || SKIN.mulCommon !== 0.5 || SKIN.mulBoss !== 0.75 || SKIN.hp !== 3 || SKIN.reform !== 3.0 || SKIN.regenMul !== 1.5) bad.push('skin: the numbers are not the approved plan: ' + JSON.stringify(SKIN));
    if (S.earlyUp) bad.push('skin: set before SKIN.settle (' + SKIN.settle + ' s)');
    if (!S.earlyUp && !near(S.earlyLost, S.baseY, 1)) bad.push('skin: a blow before the skin set did not land whole (' + S.earlyLost + ' vs ' + S.baseY + ' standing)');
    if (!S.up) bad.push('skin: down held past SKIN.settle did not set the skin');
    if (S.box !== DUCK_H) bad.push('skin: the stone skin is not the duck (hurt box ' + S.box + ')');
    if (S.pose !== 'gSkin') bad.push("skin: skinned, she is drawn as '" + S.pose + "', not her stone-skin pose");
    if (!near(S.yLost, S.baseY * SKIN.mulCommon, 1.5) || !(S.yLost < S.baseY)) bad.push('skin: a yellow blow from a common foe cost ' + S.yLost + ' (standing ' + S.baseY + ', want ~' + S.baseY * SKIN.mulCommon + ')');
    if (S.yVx > 5) bad.push('skin: a blow on the skin threw her (vx ' + S.yVx + '); no knock-back');
    if (!S.yDuck || !S.yUp || S.yHurt > 0) bad.push('skin: a yellow blow stood her up out of the skin: ' + JSON.stringify({ duck: S.yDuck, up: S.yUp, hurt: S.yHurt }));
    if (S.yHits !== 1) bad.push('skin: one blow counted ' + S.yHits + ' hits');
    if (!S.afterTwo.up || S.afterTwo.hits !== 2 || !S.twoDuck) bad.push('skin: two blows (the yellow one above and this) should leave the skin up and her down: ' + JSON.stringify({ afterTwo: S.afterTwo, duck: S.twoDuck }));
    if (S.crack.up || S.crack.ducking || S.crack.cracks !== 1 || !near(S.crack.reform, SKIN.reform, 0.4) || S.crack.vx > 5) bad.push('skin: the third blow should crack it, stand her, start the ' + SKIN.reform + ' s re-form and throw her nowhere: ' + JSON.stringify(S.crack));
    if (S.mid.up || !(S.mid.reform > 0)) bad.push('skin: it re-formed before SKIN.reform s: ' + JSON.stringify(S.mid));
    if (!S.reformed.up || S.reformed.hits !== 0) bad.push('skin: it did not re-form SKIN.reform s after the crack: ' + JSON.stringify(S.reformed));
    if (!near(S.bLost, S.baseY * SKIN.mulBoss, 1.5) || !(S.bLost > S.yLost)) bad.push('skin: a blow from a boss / mini cost ' + S.bLost + ' (standing ' + S.baseY + ', want ~' + S.baseY * SKIN.mulBoss + ', more than a common foe\'s ' + S.yLost + ')');
    if (!near(S.redLost, S.baseR, 1)) bad.push('skin: a RED blow did not land whole (' + S.redLost + ' vs ' + S.baseR + ' standing)');
    if (S.red.up || S.red.breaks !== 1 || !(S.red.reform > 0)) bad.push('skin: a RED blow did not break the skin: ' + JSON.stringify(S.red));
    if (!S.hazUp0 || S.hazHits) bad.push('skin: a hazard share counted as a blow on the skin: ' + JSON.stringify({ up: S.hazUp0, hits: S.hazHits }));
    if (!(S.regenOn > 0) || !near(S.regenOn / S.regenOff, SKIN.regenMul, 0.15)) bad.push('skin: the stamina did not come back ' + SKIN.regenMul + 'x as fast (' + S.regenOn.toFixed(2) + ' vs ' + S.regenOff.toFixed(2) + ')');
    if (S.exitRelease) bad.push('skin: releasing down left the skin up'); if (S.exitJump) bad.push('skin: a jump left the skin up');
    if (S.kept.hits !== 2) bad.push('skin: tapping down again gave a fresh skin (its blows should still count): ' + JSON.stringify(S.kept));
    if (R.skinHigh.lost > 0 || !(R.skinHigh.ducked > 0)) bad.push("skin: the armour's high swing did not go over her skinned (lost " + R.skinHigh.lost + ")");
    console.log('skin', JSON.stringify(S)); }
  // ---- THE DEATH KNIGHT ----
  const D = R.dk;
  if (!D.killed || !(D.bodies > 0)) bad.push(`blood knight: the sprig he killed left no body (${D.bodies})`);
  if (D.early.hp > 0 || D.early.blood > 0 || D.early.drawing) bad.push(`blood knight: crouched over a body it paid him or he drew from it (the harvest is gone): ${JSON.stringify(D.early)}`);
  if (D.pose !== 'graveKneel') bad.push(`blood knight: crouched, he is drawn as '${D.pose}', not his kneel`);
  if (D.warding) bad.push('blood knight: his blood ward was up while he crouched');
  if (D.box !== DUCK_H) bad.push(`blood knight: the crouch is not the duck (hurt box ${D.box})`);
  if (D.got.hp !== 0 || D.got.harvests !== 0 || D.twice.hp !== 0 || D.resumed.hp !== 0 || D.broken.hp !== 0) bad.push(`blood knight: a body gave him something: ${JSON.stringify({ got: D.got, twice: D.twice, broken: D.broken, resumed: D.resumed })}`);
  const DL = R.dkLow;
  if (DL.err) bad.push(DL.err); else { if (!(DL.lost > 0)) bad.push('blood knight: a low swipe did not find him crouched (he must be exposed to an untold one)'); if (DL.wardUp) bad.push('death knight: a guard came up while he crouched'); }
  if (R.dkHigh.lost > 0 || !(R.dkHigh.ducked > 0)) bad.push(`blood knight: the armour's high swing did not go over him crouched (lost ${R.dkHigh.lost})`);
  // ---- THE BOT ----
  const Bt = R.bot;
  if (!(Bt.pal.planned > 60) || !(Bt.pal.light > 50)) bad.push(`bot: calm with his light low, the paladin did not kneel for it: ${JSON.stringify(Bt.pal)}`);
  if (!(Bt.palWalk.walked < -20) || !(Bt.palWalk.light > 50)) bad.push(`bot: the paladin did not walk to a holy light four tiles off and kneel there: ${JSON.stringify(Bt.palWalk)}`);
  if (!(Bt.palNone.light > 10) || !(Bt.palNone.planned > 0)) bad.push(`bot: with no holy light near, calm and low, the paladin did not PRAY where he stood (claude/paladin4: prayer works anywhere now - a design change, stated; was: he must not kneel): ${JSON.stringify(Bt.palNone)}`);
  if (Bt.palNear.planned > 0) bad.push(`bot: the paladin knelt with a topiary three tiles off: ${JSON.stringify(Bt.palNear)}`);
  if (!(Bt.geo.senses > 0)) bad.push(`bot: calm, the geomancer did not look: ${JSON.stringify(Bt.geo)}`);
  if (Bt.dk.planned > 0 || Math.abs(Bt.dk.walked) > 4) bad.push(`bot: the blood knight walked to a body (he draws none now): ${JSON.stringify(Bt.dk)}`);
  // ---- OTHER HEROES ----
  for (const o of R.others) {
    if (o.light || o.kneelT || o.senseT || o.harvT || o.seen || o.stats.found || o.stats.harvests || o.stats.lightGiven) bad.push(`${o.h}: a crouch twist ran: ${JSON.stringify(o)}`);
    if (!o.ducking || o.box !== DUCK_H) bad.push(`${o.h}: down no longer ducks (box ${o.box})`);
    if (o.duckWalking && o.h !== 'pyro') bad.push(`${o.h}: still ducked with down + a way`);
    if (!(o.walked > 4) && o.h !== 'pyro') bad.push(`${o.h}: down + a way no longer walks (${o.walked} px)`);
  }
}
assert.deepEqual(bad, [], 'the crouch twists (part B):\n  ' + bad.join('\n  '));
console.log('the crouch twists hold: the paladin PRAYS anywhere (a pip every 2.5 s, three times as fast by a holy light), exposed to a low blow that breaks it; the geomancer\'s sense shows a buried dead man and a breakable wall inside six tiles and nothing outside, wakes nothing and lingers its after-glow; the blood knight draws nothing from the dead (his harvest is gone); each is still the duck, and the knight, the warden and the pyromancer are untouched');
