// tools/one-dodge.mjs - THERE IS ONE DODGE (2026-09-24). The dash (tap a way twice) and the dodge (V) were two moves; Daniel:
// "why not just make it a standard dodge like when you double tap the keys. Doesn't really make sense to have two separate
// dodges." This holds the merge to its promises, in the running game:
//   the double tap IS the dodge: the grace, the way you tapped, one wind cost - the same cost as the button's
//   the button goes the way you hold, else the way you face
//   once in the air before you land (a second only with SLIPSTREAM)
//   X early in it is the DASH ATTACK, and ends it; a jump out of it is a running jump
//   the Warden's button is her back-step (no turn, no dash in it); her double tap forward carries the vault
//   the Geomancer burrows on the floor and dashes in the air
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.SET.speed = 1; const out = {};
    const P = () => BK.P;
    const prep = (h, face) => { for (const k in BK.keys) BK.keys[k] = false; BK.setHero(h); BK.reset({ fresh: true }); BK.load(0); BK.state = 'play';
      BK.enemies().forEach(e => e.alive = false); BK.ambushes().forEach(a => a.st = 'done'); BK.tp(6, 21); BK.sim(20);
      Object.assign(P(), { st: P().maxSt, inv: 0, hurt: 0, vx: 0, face: face || 1, dodgeCd: 0, dashCd: 0, dodge: 0, dash: 0 }); BK.sim(1); P().st = P().maxSt; };
    const tapTwice = d => { BK.press(d); BK.sim(3); BK.press(d); BK.sim(1); };
    const snap = () => ({ dodge: +P().dodge.toFixed(3), inv: +(P().dodgeInv || 0).toFixed(3), dash: +(P().dash || 0).toFixed(3), vx: Math.round(P().vx), face: P().face, ground: !!P().ground, st: Math.round(P().st) });

    /* the double tap is the dodge, pointed */
    prep('knight', -1); const st0 = P().st; tapTwice('right'); out.tap = { ...snap(), cost: Math.round(st0 - P().st) };
    /* the button: the way you face, and the way you hold */
    prep('knight', 1); const st1 = P().st; BK.press('dodge'); BK.sim(1); out.button = { ...snap(), cost: Math.round(st1 - P().st) };
    prep('knight', 1); BK.keys.left = true; BK.press('dodge'); BK.sim(1); BK.keys.left = false; out.held = snap();
    /* once in the air */
    prep('knight', 1); BK.press('jump'); BK.keys.jump = true; BK.sim(6); tapTwice('right'); out.air1 = { ...snap(), dashedAir: !!P().dashedAir };
    Object.assign(P(), { dodge: 0, dodgeCd: 0, dash: 0 }); tapTwice('left'); out.air2 = snap(); BK.keys.jump = false;
    /* X early in it: the dash attack, and the dodge is over */
    prep('knight', 1); tapTwice('right'); BK.sim(1); BK.press('atk'); BK.sim(1); out.cut = { ...snap(), dashCut: !!P().dashCut, dashAtk: +(P().dashAtk || 0).toFixed(3) };
    /* a jump out of it */
    prep('knight', 1); tapTwice('right'); BK.sim(2); BK.press('jump'); BK.sim(3); out.jump = snap();
    /* the Warden: her button steps back and does not turn; tapped forward it carries the vault */
    prep('warden', 1); BK.press('dodge'); BK.sim(1); out.wBack = snap();
    prep('warden', 1); tapTwice('right'); out.wFwd = snap(); BK.press('jump'); BK.sim(2); out.wVault = { vaultT: +(P().vaultT || 0).toFixed(3), ground: !!P().ground };
    /* the Geomancer: under the floor on the ground, a plain dash in the air */
    prep('geomancer', 1); BK.press('dodge'); BK.sim(1); out.gFloor = { ...snap(), burrow: !!P().geoBurrow }; BK.sim(40);
    prep('geomancer', 1); BK.press('jump'); BK.keys.jump = true; BK.sim(6); BK.press('dodge'); BK.sim(1); out.gAir = { ...snap(), burrow: !!P().geoBurrow }; BK.keys.jump = false;
    BK.manualSimulation = false; return out; })()`);
  const fail = [];
  const t = (ok, msg) => { if (!ok) fail.push(msg); };
  t(r.tap.dodge > 0 && r.tap.inv > 0, 'a double tap is the dodge, with its grace: ' + JSON.stringify(r.tap));
  t(r.tap.vx > 0 && r.tap.face === 1, 'a double tap goes the way it was tapped: ' + JSON.stringify(r.tap));
  t(r.tap.dash > 0, 'a double tap carries the dash in it (the dash attack is X early in it): ' + JSON.stringify(r.tap));
  t(r.tap.cost > 0 && r.tap.cost === r.button.cost, 'one wind cost, the same for the tap and the button: ' + r.tap.cost + ' vs ' + r.button.cost);
  t(r.button.dodge > 0 && r.button.vx > 0 && r.button.dash > 0, 'the button with nothing held goes the way you face, and is the same move: ' + JSON.stringify(r.button));
  t(r.held.dodge > 0 && r.held.vx < 0 && r.held.face === -1, 'the button goes the way you hold: ' + JSON.stringify(r.held));
  t(!r.air1.ground && r.air1.dodge > 0 && r.air1.inv > 0 && r.air1.dashedAir, 'a dodge in the air, with its grace, spends the air: ' + JSON.stringify(r.air1));
  t(!r.air2.ground && r.air2.dodge === 0, 'only once before you land: ' + JSON.stringify(r.air2));
  t(r.cut.dashCut && r.cut.dashAtk > 0 && r.cut.dodge === 0, 'X early in the dodge is the dash attack and ends it: ' + JSON.stringify(r.cut));
  t(!r.jump.ground && r.jump.dodge === 0, 'a jump out of the dodge is taken, and ends it: ' + JSON.stringify(r.jump));
  t(r.wBack.dodge > 0 && r.wBack.vx < 0 && r.wBack.face === 1 && r.wBack.dash === 0, 'the Warden\'s button is her back-step: no turn, no dash in it: ' + JSON.stringify(r.wBack));
  t(r.wFwd.dodge > 0 && r.wFwd.vx > 0 && r.wFwd.dash > 0 && r.wVault.vaultT > 0, 'the Warden tapped forward steps in, and a jump out of it vaults: ' + JSON.stringify(r.wFwd) + ' ' + JSON.stringify(r.wVault));
  t(r.gFloor.burrow && r.gFloor.dash === 0, 'the Geomancer burrows on the floor: ' + JSON.stringify(r.gFloor));
  t(!r.gAir.ground && r.gAir.dodge > 0 && !r.gAir.burrow && r.gAir.dash > 0, 'in the air her dodge is a plain dash: ' + JSON.stringify(r.gAir));
  assert.deepEqual(pg.errors, []);
  if (fail.length) { console.log(fail.join('\n')); process.exit(1); }
  console.log('one dodge: the double tap and the button are one move - grace, direction, one cost, once in the air, the dash attack and the jump out of it; the Warden steps and the Geomancer burrows');
} finally { pg.close(); }
