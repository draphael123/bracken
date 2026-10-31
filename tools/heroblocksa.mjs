// tools/heroblocksa.mjs - THE FREEBOOTER'S HOOK CATCH + THE BLOOD KNIGHT'S BLOCK (claude/heroblocksa, scratch/brief-pyrokit-1101.md 7a/7b; src/hook-catch.js, src/blood-kit.js GUARD).
// Pure (Node) this fails when: a catch is not perfect for its first CATCH.perfect s / a block after / nothing after CATCH.snap; a heavy does not break through a plain catch (and does on the beat);
//   a red blow is caught; a pierce is caught off the beat; a thrown thing is not flung on the beat / dropped after; the guard's blood is not ALL debt; three notches do not lift the tier by one (never past
//   T5, never before T1) or do not run dry.
// In the page (Stockade floor), the Freebooter: TAP C raises the snap on the press; HOLD C is still the hook throw (no catch left up); a perfect catch turns the blow, seats the ball, snags (staggers) the
//   foe and makes the next ball instant + point-blank; a late catch blocks for wind; a heavy late one breaks through at half; a red one lands; an arrow in the perfect half is flung back at its archer, in the
//   late half dropped. The Blood Knight: a blow on the ward leaves its blood as DEBT (all of it), fills a notch, three notches lift the next held heavy a tier and are spent on it; the ward-release parry
//   BLEEDS the foe. Page parts need a free ~1.5 GB of RAM: PORT=<free port> node tools/heroblocksa.mjs
import { CATCH, catchVerdict, seedVerdict, shotMulFor } from '../src/hook-catch.js';
import { BLOOD, GUARD, guardPay, notchDrink, notchesOf, boostTier, debtStep } from '../src/blood-kit.js';
import { openPage } from './cdp.mjs';
const bad = [], ok = (c, m) => { if (!c) bad.push(m); }, near = (a, b, e = 0.6) => Math.abs(a - b) <= e;

/* ---------------- PURE ---------------- */
{ const V = (age, o = {}) => catchVerdict({ age, dmg: 10, ...o });
  ok(V(0.01) === 'perfect' && V(CATCH.perfect) === 'perfect', 'the first ' + CATCH.perfect + ' s of the snap is not a perfect catch');
  ok(V(CATCH.perfect + 0.02) === 'block' && V(CATCH.snap) === 'block', 'the rest of the snap is not a plain block');
  ok(V(CATCH.snap + 0.05) === 'none' && V(-1) === 'none', 'a blow after the snap (or before it) was caught');
  ok(V(0.3, { dmg: CATCH.heavy }) === 'heavy' && V(0.3, { dmg: CATCH.heavy - 1 }) === 'block', 'the heavy line is not CATCH.heavy (' + CATCH.heavy + ')');
  ok(V(0.1, { dmg: 40 }) === 'perfect', 'a heavy blow met on the beat is not caught');
  ok(V(0.05, { red: true }) === 'none' && V(0.3, { red: true }) === 'none', 'a red blow was caught');
  ok(V(0.3, { pierce: true }) === 'none' && V(0.1, { pierce: true }) === 'perfect', 'a piercing bolt: only the beat catches it');
  ok(V(0.05, { front: false }) === 'none', 'a blow from behind was caught');
  ok(seedVerdict({ age: 0.1 }) === 'fling' && seedVerdict({ age: 0.3 }) === 'drop' && seedVerdict({ age: 0.5 }) === 'none' && seedVerdict({ age: 0.1, red: true }) === 'none' && seedVerdict({ age: 0.3, pierce: true }) === 'none', 'a thrown thing is not flung on the beat / dropped after / missed late / red-proof');
  ok(CATCH.snap >= 0.35 && CATCH.snap <= 0.45 && CATCH.hold <= CATCH.perfect + 1e-9 && CATCH.shotMul > 1 && shotMulFor(true, 10) === CATCH.shotMul && shotMulFor(true, CATCH.pbR + 1) === 1 && shotMulFor(false, 1) === 1, 'the snap is not ~0.4 s, the hold line is past the beat, or the point-blank ball is off');
  const p = { hp: 90, maxHp: 95 }; debtStep(p, 0); guardPay(p, 7); debtStep(p, 0.016);
  ok(p.hp === 83 && near(p.bd, 7 * GUARD.share, 0.2) && GUARD.share >= BLOOD.debt.share, 'the ward\'s blood is not all debt: ' + JSON.stringify(p));
  const q = { hp: 90, maxHp: 95 }; let n = 0; for (let i = 0; i < 4; i++) n = notchDrink(q, 1 + i);
  ok(n === GUARD.notches && notchesOf(q, 4) === GUARD.notches && notchesOf(q, 4 + GUARD.life + 1) === 0, 'the notches do not cap at ' + GUARD.notches + ' or run dry after ' + GUARD.life + ' s');
  ok(boostTier(0, 3) === 0 && boostTier(1, 3) === 2 && boostTier(5, 3) === 5 && boostTier(3, 2) === 3 && boostTier(4, 3) === 5, 'the drunk blade does not lift a tier by one (T1.. only, to T5 at most, only at ' + GUARD.notches + ')');
}

/* ---------------- PAGE ---------------- */
let R; const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  R = await pg.evalp(`(async()=>{
    BK.SET.speed = 1; const { LEVELS } = await import('/src/level.js'); const out = {}, P = () => BK.P, D = () => BK.dk2();
    const keysOff = () => { for (const k in BK.keys) BK.keys[k] = false; };
    const setUp = h => { BK.setHero(h); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'stockade')); BK.start(); BK.god = false; BK.sim(5); for (const e of D().enemies) e.alive = false; };
    const findSpot = () => { const L0 = BK.L, W = L0.W, at = (x, y) => L0.grid[y * W + x]; let spot = null;
      for (let x0 = 8; x0 < W - 30 && !spot; x0++) for (let y = 7; y < L0.H - 2 && !spot; y++) { let ok = true; for (let x = x0; x < x0 + 20 && ok; x++) ok = at(x, y + 1) === 1 && [0, 1, 2, 3, 4, 5].every(k => at(x, y - k) === 0); if (ok) spot = { x: x0 + 8, y }; } return spot; };
    setUp('pirate'); let spot = findSpot(); if (!spot) return { err: 'no flat floor' };
    const place = hp => { const p = P(); p.x = spot.x * 16 + 8; p.y = (spot.y + 1) * 16; p.vx = p.vy = 0; p.face = 1; p.hp = hp ?? p.maxHp; p.st = p.maxSt; p.atk = -1; p.atkRec = 0; p.heavy = false; p.combo = 0; p.dodge = 0; p.hurt = 0; p.inv = 0; p.parryW = 0; p.parryCd = 0; p.hookCd = 0; p.hookT = null; p.catchShotT = 0; p.catchHit = false; p.cHeld = 0; p.cWas = false;
      p.bd = 0; p.bdLast = p.hp; p.bkNotch = 0; p.wardG = 0; p.novaCd = 0; keysOff(); BK.sim(20); p.bd = 0; p.bdLast = p.hp; p.parryW = 0; p.parryCd = 0; };
    const foe = (dx = 18) => { const n0 = D().enemies.length; D().spawn({ t: 'brute', x: spot.x + 1, y: spot.y }); const e = D().enemies[n0]; delete e.maxHp; e.x = P().x + dx; e.y = P().y; e.mode = 'idle'; e.hp = 400; return e; };
    const blow = (dmg, o) => { P().inv = 0; P().hurt = 0; return String(D().hit(P().x + 20, dmg, o || {})); };
    const tap = frames => { BK.keys.block = true; BK.sim(frames); BK.keys.block = false; };
    /* FREEBOOTER */
    place(); tap(3); out.tapUp = { w: P().parryW > 0, at: P().catchAt !== undefined, hook: !!P().hookT || P().hookCd > 0 };
    BK.sim(40); out.snapEnds = P().parryW === 0;
    place(); BK.keys.block = true; BK.sim(30); out.hold = { hookCd: P().hookCd, hookT: !!P().hookT, w: P().parryW }; keysOff(); BK.sim(10);
    place(); let f = foe(); P().loaded = false; tap(2); BK.sim(3); const st0 = P().st; out.perfect = { r: blow(10, { who: f }), shot: P().catchShotT > BK.time, loaded: !!P().loaded, snag: (f.stagger || 0) >= 0.9 || (f.rpHold || 0) > 0, st: P().st >= st0 - 0.5, hp: P().hp === P().maxHp }; f.alive = false;
    place(); f = foe(); tap(2); BK.sim(14); const s1 = P().st; out.late = { r: blow(10, { who: f }), shot: P().catchShotT > BK.time, cost: s1 - P().st, hp: P().hp === P().maxHp }; f.alive = false;
    place(); f = foe(); tap(2); BK.sim(14); out.heavy = { r: blow(34, { who: f }), lost: P().maxHp - P().hp, w: P().parryW }; f.alive = false;
    place(); f = foe(); tap(2); BK.sim(40); out.expired = { r: blow(10, { who: f }), lost: P().maxHp - P().hp }; f.alive = false;
    place(); f = foe(); tap(2); BK.sim(3); out.red = { r: blow(10, { who: f, unblockable: true }), lost: P().maxHp - P().hp }; f.alive = false;
    place(); f = foe(80); const sd = { x: P().x + 22, y: P().y - 8, vx: -140, vy: 0, g: 0, life: 2, dead: false, arrow: true, owner: f }; BK.seeds().push(sd); tap(2); for (let i = 0; i < 12 && !sd.reflected && !sd.dead; i++) BK.sim(1);
    out.flung = { reflected: !!sd.reflected, vx: sd.vx, dead: sd.dead, shot: P().catchShotT > BK.time, hp: P().hp === P().maxHp }; sd.dead = true; f.alive = false;
    place(); f = foe(80); const sd2 = { x: P().x + 46, y: P().y - 8, vx: -60, vy: 0, g: 0, life: 3, dead: false, arrow: true, owner: f }; BK.seeds().push(sd2); tap(2); for (let i = 0; i < 40 && !sd2.reflected && !sd2.dead; i++) BK.sim(1);
    out.dropped = { reflected: !!sd2.reflected, dead: sd2.dead, hp: P().hp === P().maxHp }; sd2.dead = true; f.alive = false;
    /* the ball after a perfect catch: instant and point-blank */
    const fireOn = (setup, frames) => { place(); const d = foe(30); d.hp = d.maxHp = 9999; d.guardT = 0; setup && setup(); P().loaded = true; P().barrels = 1; BK.keys.atk = true; BK.press && BK.press('atk'); BK.sim(frames); BK.keys.atk = false; BK.sim(12); const lost = 9999 - d.hp; d.alive = false; return lost; };
    out.shotQuickPlain = fireOn(null, 12); out.shotPlain = fireOn(null, 26); out.shotCatch = fireOn(() => { P().catchShotT = BK.time + 3; }, 12);
    /* BLOOD KNIGHT */
    setUp('reaper'); spot = findSpot();
    place(); f = foe(); BK.keys.block = true; BK.sim(12); const hp0 = P().hp; const r1 = blow(14, { who: f }); BK.sim(2);
    out.ward = { r: r1, paid: hp0 - P().hp, bd: +(P().bd || 0).toFixed(2), notch: P().bkNotch || 0, bar: P().bkPayAt !== undefined };
    BK.sim(20); blow(14, { who: f }); BK.sim(20); blow(14, { who: f }); BK.sim(2); out.notches3 = P().bkNotch;
    keysOff(); BK.sim(5); P().wardG = 0;
    const tierOf = (secs) => { place(P().maxHp - 40); if (secs.drunk) { P().bkNotch = 3; P().bkNotchAt = BK.time; } const d2 = foe(34); d2.hp = d2.maxHp = 9999; BK.keys.atk = true; for (let n = 0; n < Math.round(secs.t * 60); n++) { BK.sim(1); if (P().heavy) break; } BK.keys.atk = false; BK.sim(1); const r = { tier: P().bkTier || 0, left: P().bkNotch || 0 }; BK.sim(60); d2.alive = false; return r; };
    out.t1 = tierOf({ t: BLOOD_T1 }); out.t1drunk = tierOf({ t: BLOOD_T1, drunk: true }); out.t1after = tierOf({ t: BLOOD_T1 });
    place(70); f = foe(); f.bleed = 0; BK.keys.block = true; BK.sim(12); BK.keys.block = false; BK.sim(1); P().bd = 12; P().bdLast = P().hp; out.crimson = { r: blow(10, { who: f }), bleed: f.bleed || 0, bd: +(P().bd || 0).toFixed(2) };
    return out; })()`.replace(/BLOOD_T1/g, String(BLOOD.tiers.at[0] + 0.08)), 240000);
  console.log(JSON.stringify(R, null, 1));
  if (R.err) bad.push(R.err); else {
    ok(R.tapUp.w && R.tapUp.at && !R.tapUp.hook, 'TAP C did not raise the snap on the press (or threw the hook): ' + JSON.stringify(R.tapUp));
    ok(R.snapEnds, 'the snap did not end by itself (it is not holdable)');
    ok(R.hold.hookCd > 0 || R.hold.hookT, 'HOLD C is not the hook throw: ' + JSON.stringify(R.hold)); ok(R.hold.w === 0, 'a held C left the snap up');
    ok(R.perfect.r === 'blocked' && R.perfect.shot && R.perfect.loaded && R.perfect.snag && R.perfect.hp, 'the perfect catch did not turn the blow, seat the ball, snag the foe and ready the shot: ' + JSON.stringify(R.perfect));
    ok(R.late.r === 'blocked' && !R.late.shot && R.late.cost > 0 && R.late.hp, 'the late catch did not block for wind (and without the shot): ' + JSON.stringify(R.late));
    ok(R.heavy.r === 'hit' && R.heavy.lost > 0 && R.heavy.w === 0, 'a heavy blow did not break through the late catch: ' + JSON.stringify(R.heavy));
    ok(R.expired.r === 'hit' && R.expired.lost > 0, 'a blow after the snap was caught: ' + JSON.stringify(R.expired));
    ok(R.red.r === 'hit' && R.red.lost > 0, 'a red blow was caught: ' + JSON.stringify(R.red));
    ok(R.flung.reflected && R.flung.vx > 0 && R.flung.shot && R.flung.hp, 'an arrow in the perfect half was not flung back: ' + JSON.stringify(R.flung));
    ok(!R.dropped.reflected && R.dropped.dead && R.dropped.hp, 'an arrow in the late half was not caught and dropped: ' + JSON.stringify(R.dropped));
    ok(R.shotPlain >= 26 && R.shotQuickPlain < 20 && R.shotCatch >= R.shotPlain * (CATCH.shotMul - 0.1), 'the ball after a perfect catch is not instant and point-blank x' + CATCH.shotMul + ': quick ' + R.shotQuickPlain + ', full wind ' + R.shotPlain + ', after a catch ' + R.shotCatch);
    ok(R.ward.r === 'blocked' && R.ward.paid > 0 && near(R.ward.bd, R.ward.paid * GUARD.share, 1.2) && R.ward.notch === 1 && R.ward.bar, 'a blow on the ward did not leave its blood as debt and drink a notch: ' + JSON.stringify(R.ward));
    ok(R.notches3 === GUARD.notches, 'three blows on the ward did not fill ' + GUARD.notches + ' notches: ' + R.notches3);
    ok(R.t1.tier === 1 && R.t1drunk.tier === 2 && R.t1drunk.left === 0 && R.t1after.tier === 1, 'the drunk blade did not lift the first tier to T2 and spend itself: ' + JSON.stringify([R.t1, R.t1drunk, R.t1after]));
    ok(R.crimson.r === 'blocked' && R.crimson.bleed > 0 && R.crimson.bd < 0.01, 'the ward-release parry did not bleed the foe and reclaim all the debt: ' + JSON.stringify(R.crimson));
  }
} catch (e) { bad.push('page threw: ' + e.message); } finally { try { pg.close(); } catch {} }
if (bad.length) { console.log('\nFAIL (' + bad.length + ')'); for (const b of bad) console.log(' - ' + b); process.exit(1); }
console.log('\nheroblocksa: ok');
