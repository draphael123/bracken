// tools/crouch-a.mjs — THE CROUCH TWISTS, PART A (claude/croucha, src/crouch-a.js): the knight's LOW GUARD and SHIELD TRIP, the
// warden's SET SPEAR and LOW POKE, the freebooter's DUCK AND RELOAD. On flat Stockade floor, this fails when:
//   KNIGHT - crouched, a yellow low swipe (a soldier's slash) finds him, is not counted on the low guard, or slides him back; the armour's
//            HIGH swing does not still go over him by the duck (or is taken on the guard); a RED pounce (a hound's) does not go
//            through; a swipe from BEHIND is turned; a crouched X does not knock a sprig down (floored), or knocks a soldier down (poise
//            heavy: it must HOLD); the sprig tripped in its bite's windup lands the bite while it lies there
//   WARDEN - set (crouched), a badger's yellow CHARGE onto the point is not impaled (or it hurts her); a badger flagged as a mini is
//            stopped (a boss takes a plain hit and comes on); a hound's RED pounce is impaled; a crouched X at a shield from the front
//            does not hurt it (under the guard), while a standing thrust at the same shield still does not
//   FREEBOOTER - crouched with the pistol empty the reload does not run at CROUCH.pirate.reload x (measured against standing); a shot
//            from the crouch does not reach a foe 190 px off that a standing shot misses, or throws him back
//   OTHERS - the paladin, the death knight and the geomancer still duck with no low guard, no set, no reload; their crouched X is
//            the plain low sweep; the knight and the warden walking with down + X still sweep (not trip / poke)
//   the page throws
//   node tools/crouch-a.mjs            (PORT from tools/ports.mjs)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const bad = [];
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    if (!BK.crouchA) return { err: 'no BK.crouchA: there are no crouch twists' };
    const { LEVELS } = await import('/src/level.js');
    const { CROUCH } = await import('/src/crouch-a.js');
    const out = {};
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); };
    setUp('knight');
    const L = BK.L, W = L.W, at = (x, y) => L.grid[y * W + x];
    let spot = null;
    for (let x0 = Math.floor(BK.P.x / 16); x0 < W - 40 && !spot; x0++) for (let y = 7; y < L.H - 2 && !spot; y++) {
      let ok = true; for (let x = x0; x < x0 + 34 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(k => at(x, y - k) === 0);
      if (ok) spot = [x0 + 12, y]; }
    if (!spot) return { err: 'no flat floor' };
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; for (const s of BK.seeds()) s.dead = true; };
    const home = () => { clear(); none(); BK.god = true; BK.tp(spot[0], spot[1]); BK.sim(40); BK.god = false; const P = BK.P; P.hp = P.maxHp; P.st = P.maxSt; P.vx = 0; P.hurt = 0; P.face = 1; BK.sim(30); BK.crouchAReset(); };
    const seedRandom = n => { let s = n; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
    const C = () => BK.crouchA();
    /* one fight: the hero crouched (down held) or not, a foe dx tiles off, the hero's x pinned unless drift is measured */
    const fight = (t, dx, secs, o = {}) => { home(); if (o.seed) seedRandom(o.seed); const x0 = BK.P.x;
      const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: dx > 0 ? -1 : 1, ...(o.flags || {}) }); if (!f) return { err: t + ' did not spawn' };
      if (o.mini) f.mini = true;
      let lost = 0, drift = 0, hp0f = f.hp; const fx = f.x;
      for (let k = 0; k < secs * 60; k++) { const hp0 = BK.P.hp; K.down = o.down !== false; BK.P.face = o.face || 1; if (!o.free) { BK.P.x = x0; } BK.P.st = BK.P.maxSt; BK.P.inv = 0; if (o.pin) { f.x = fx; f.face = Math.sign(BK.P.x - fx) || 1; }
        BK.sim(1); drift = Math.max(drift, Math.abs(BK.P.x - x0)); if (!o.free) BK.P.vx = 0;
        if (BK.P.hp < hp0) { lost += hp0 - BK.P.hp; BK.P.hp = BK.P.maxHp; }
        if (BK.P.dead) { BK.P.dead = 0; BK.P.hp = BK.P.maxHp; }
        if (o.stopAt && o.stopAt(f, k)) break; }
      none(); return { t, lost: Math.round(lost), drift: Math.round(drift), fHit: hp0f - (f.hp || 0), fAlive: f.alive, broken: f.broken || 0, stats: C().stats, ducked: BK.duck().ducked }; };
    // ---- THE KNIGHT ----
    out.kLow = fight('soldier', 2, 8, { free: true, stopAt: () => C().stats.lowBlocks >= 2 });
    out.kHigh = fight('armour', 2, 6, {});
    out.kRed = fight('hound', 8, 6, { stopAt: () => C().stats.lowThrough >= 1 });
    out.kBack = fight('soldier', -2, 6, { face: 1, stopAt: (f, k) => false });
    /* THE TRIP: crouched and still, X at a sprig beside him - and at a soldier */
    const trip = (t, dx, flags) => { home(); const [f] = BK.spawnFoe({ t, x: spot[0] + dx, y: spot[1], face: -1, ...(flags || {}) }); if (!f) return { err: t };
      K.down = true; BK.sim(8); const d0 = BK.duck().ducking; let floored = 0, lost = 0, tripAt = -1;
      if (flags && flags.tell) { f.mode = 'biteTell'; f.modeT = 0.4; }
      for (let k = 0; k < 150; k++) { const hp0 = BK.P.hp; K.down = true; if (k === 0) BK.press('atk'); BK.P.st = BK.P.maxSt; BK.sim(1);
        if (f.floored > 0 && f.floored > BK.crouchA().now && tripAt < 0) tripAt = k;
        if (tripAt >= 0 && f.floored > BK.crouchA().now) floored++;
        if (tripAt >= 0 && BK.P.hp < hp0) lost += hp0 - BK.P.hp; BK.P.hp = BK.P.maxHp; }
      none(); return { t, ducked0: d0, floored, lost, tripAt, broken: f.broken || 0, stats: C().stats }; };
    out.kTrip = trip('sprig', 1.3, { tell: true });
    out.kHold = trip('soldier', 1.5);
    // walking with down + X: the old low sweep
    { home(); const [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 3, y: spot[1], face: -1 }); K.down = true; K.right = true; BK.sim(6); BK.press('atk'); BK.sim(2); out.kWalk = { trip: !!BK.P.caTrip, kind: BK.P.swingKind }; none(); }
    // ---- THE WARDEN ----
    setUp('warden');
    out.wSet = fight('badger', 6, 5, { stopAt: () => C().stats.impaled >= 1 });
    out.wMini = fight('badger', 6, 5, { mini: true, stopAt: () => C().stats.bossHits >= 1 });
    out.wRed = fight('hound', 7, 5, { stopAt: (f) => false });
    /* THE POKE, at a shield facing her; and the standing thrust at the same shield */
    const poke = (down) => { home(); const [f] = BK.spawnFoe({ t: 'shield', x: spot[0] + 2.4, y: spot[1], face: -1 }); if (!f) return { err: 'shield' };
      f.cd = 99; f.shoveCd = 99; K.down = down; BK.sim(8); const hp0 = f.hp; BK.press('atk');
      for (let k = 0; k < 30; k++) { K.down = down; f.x = spot[0] * 16 + 8 + 2.4 * 16; f.face = -1; BK.sim(1); }
      none(); return { hit: hp0 - f.hp, poke: C().stats.pokes, under: C().stats.under }; };
    out.wPoke = poke(true); out.wThrust = poke(false);
    { home(); const [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 3, y: spot[1], face: -1 }); K.down = true; K.right = true; BK.sim(6); BK.press('atk'); BK.sim(2); out.wWalk = { poke: !!BK.P.caPoke, kind: BK.P.swingKind }; none(); }
    // ---- THE FREEBOOTER ----
    setUp('pirate');
    { home(); const P = BK.P, r = {}; P.loaded = false; P.barrels = 0; P.reloadT = 8; none(); BK.sim(60); r.stand = +(8 - P.reloadT).toFixed(2);
      P.reloadT = 8; K.down = true; BK.sim(60); r.crouch = +(8 - P.reloadT).toFixed(2); r.reloading = C().reloading; none();
      P.reloadT = 0.5; K.down = true; BK.sim(40); r.loadedAfter = !!P.loaded; none(); out.pReload = r; }
    const shoot = down => { home(); const P = BK.P; const [f] = BK.spawnFoe({ t: 'sprig', x: spot[0] + 190 / 16, y: spot[1], face: -1 }); if (!f) return { err: 'sprig' }; f.hp = 999;
      P.loaded = true; P.barrels = 1; K.down = down; BK.sim(10); const x0 = P.x, trials0 = C().stats.steady;
      P.atkHeld = 5; P.charge = 5; K.atk = false; BK.sim(1); const vx = P.vx, blast = P.blastT, hitNow = 999 - f.hp; BK.sim(8);
      none(); return { steady: C().stats.steady - trials0, fired: !P.loaded, vx: Math.round(vx), blast, flash: hitNow }; };
    out.pShotCrouch = shoot(true); out.pShotStand = shoot(false);
    // ---- OTHERS: the plain duck ----
    out.others = [];
    for (const h of ['paladin', 'reaper', 'geomancer']) { setUp(h); home(); const r = { h }; K.down = true; BK.sim(12); r.ducking = BK.duck().ducking; const c = C(); r.low = c.lowGuard; r.set = c.set; r.reloading = c.reloading;
      BK.press('atk'); BK.sim(2); r.kind = BK.P.swingKind; r.trip = !!BK.P.caTrip; r.poke = !!BK.P.caPoke; none(); BK.sim(20); out.others.push(r); }
    return out;
  })()`, 600000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }

if (R.err) bad.push(R.err);
else {
  for (const [k, v] of Object.entries(R)) console.log(k, JSON.stringify(v));
  const e = (o, name) => { if (o.err) { bad.push(name + ': ' + o.err); return false; } return true; };
  if (e(R.kLow, 'kLow')) { if (R.kLow.lost > 0) bad.push(`knight: a yellow low swipe found him crouched for ${R.kLow.lost}`); if (!(R.kLow.stats.lowBlocks > 0)) bad.push('knight: the low guard turned nothing'); if (R.kLow.drift > 2) bad.push(`knight: the low guard slid him back ${R.kLow.drift} px (no knockback)`); }
  if (e(R.kHigh, 'kHigh')) { if (R.kHigh.lost > 0) bad.push(`knight: the armour's high swing found him crouched for ${R.kHigh.lost}`); if (!(R.kHigh.ducked > 0)) bad.push('knight: the high swing did not go over by the duck'); if (R.kHigh.stats.lowBlocks > 0) bad.push('knight: a high swing was taken on the low guard'); }
  if (e(R.kRed, 'kRed')) { if (!(R.kRed.lost > 0) || !(R.kRed.stats.lowThrough > 0)) bad.push(`knight: a RED pounce did not go through the low guard (lost ${R.kRed.lost}, through ${R.kRed.stats.lowThrough})`); }
  if (e(R.kBack, 'kBack')) { if (!(R.kBack.lost > 0)) bad.push('knight: a swipe from behind was turned by the low guard'); }
  if (e(R.kTrip, 'kTrip')) { if (!R.kTrip.ducked0) bad.push('knight: not ducked before the trip'); if (!(R.kTrip.stats.tripped > 0) || !(R.kTrip.floored > 0)) bad.push(`knight: the shield trip did not knock the sprig down: ${JSON.stringify(R.kTrip)}`); if (R.kTrip.lost > 0) bad.push(`knight: the tripped sprig's bite landed while it lay there (${R.kTrip.lost})`); }
  if (e(R.kHold, 'kHold')) { if (R.kHold.floored > 0) bad.push('knight: the shield trip floored a soldier (poise heavy: it must hold)'); if (!(R.kHold.stats.held > 0) && !(R.kHold.stats.trips > 0)) bad.push('knight: no trip was thrown at the soldier'); }
  if (R.kWalk.trip || R.kWalk.kind !== 'sweep') bad.push(`knight: walking + down + X is not the plain low sweep: ${JSON.stringify(R.kWalk)}`);
  if (e(R.wSet, 'wSet')) { if (!(R.wSet.stats.impaled > 0)) bad.push(`warden: the badger's yellow charge was not impaled on the set spear: ${JSON.stringify(R.wSet)}`); if (R.wSet.lost > 0) bad.push(`warden: the impaled charge hurt her for ${R.wSet.lost}`); }
  if (e(R.wMini, 'wMini')) { if (R.wMini.stats.impaled > 0) bad.push('warden: a mini was impaled (a boss takes a plain hit and is not stopped)'); if (!(R.wMini.stats.bossHits > 0)) bad.push('warden: the mini took no hit off the set point'); }
  if (e(R.wRed, 'wRed')) { if (R.wRed.stats.impaled > 0) bad.push('warden: a RED pounce was impaled'); }
  if (e(R.wPoke, 'wPoke')) { if (!(R.wPoke.poke > 0) || !(R.wPoke.hit > 0)) bad.push(`warden: the low poke did not go under the shield: ${JSON.stringify(R.wPoke)}`); if (!(R.wPoke.under > 0)) bad.push('warden: the poke under the shield was not counted'); }
  if (e(R.wThrust, 'wThrust')) { if (R.wThrust.hit > 0) bad.push(`warden: a standing thrust went through the shield's guard (${R.wThrust.hit}) - the poke proves nothing`); if (R.wThrust.poke > 0) bad.push('warden: a standing X was a poke'); }
  if (R.wWalk.poke || R.wWalk.kind !== 'sweep') bad.push(`warden: walking + down + X is not the plain low sweep: ${JSON.stringify(R.wWalk)}`);
  const pr = R.pReload, ratio = pr.crouch / Math.max(0.01, pr.stand);
  if (!(Math.abs(ratio - 2) < 0.15)) bad.push(`freebooter: crouched reload runs ${ratio.toFixed(2)}x standing (want 2x): ${JSON.stringify(pr)}`);
  if (!pr.loadedAfter) bad.push('freebooter: the crouched reload never seated a ball');
  const sc = R.pShotCrouch, ss = R.pShotStand;
  if (sc.err || ss.err) bad.push('shot: ' + (sc.err || ss.err)); else {
    if (!sc.fired || !ss.fired) bad.push(`freebooter: the pistol did not fire (crouch ${sc.fired}, stand ${ss.fired})`);
    if (!(sc.steady > 0)) bad.push('freebooter: the crouched shot was not steady');
    if (ss.steady > 0) bad.push('freebooter: a standing shot was steady');
    if (!(sc.flash > 0)) bad.push('freebooter: the steady shot did not reach the dummy 190 px off');
    if (ss.flash > 0) bad.push('freebooter: a standing shot reached 190 px (the test proves nothing)');
    if (sc.vx !== 0) bad.push(`freebooter: the steady shot threw him back (vx ${sc.vx})`); }
  for (const o of R.others) { if (!o.ducking) bad.push(`${o.h}: down no longer ducks`); if (o.low || o.set || o.reloading) bad.push(`${o.h}: has a part-A twist`); if (o.trip || o.poke || o.kind !== 'sweep') bad.push(`${o.h}: crouched X is not the plain low sweep (${o.kind})`); }
}
assert.deepEqual(bad, [], 'the crouch twists (part A):\n  ' + bad.join('\n  '));
console.log("the crouch twists hold: the knight low-guards a yellow low blow with no step back (high still over, red and behind through), his crouched X trips a sprig and a soldier holds; the warden's set spear impales a yellow charge, only hits a mini, lets a red pounce by, and her crouched X goes under a shield a thrust cannot; the freebooter reloads twice as fast crouched and his crouched shot carries farther and does not kick; the others keep the plain duck and sweep");
