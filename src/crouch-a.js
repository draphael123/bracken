// src/crouch-a.js — THE CROUCH TWISTS, PART A (claude/croucha; Daniel approved the CROUCH PLAN, HANDOFF item 14): THE KNIGHT,
// THE WARDEN AND THE FREEBOOTER. (Part B - the paladin, the geomancer, the death knight - is its own lane; the pyromancer's is
// src/ember-ward.js.)
//
// Every hero ducks (src/duck.js): DOWN held on the ground, stood still, and the hurt box drops to DUCK_H and a HIGH blow goes over.
// These three keep that duck exactly as it is and each gets one twist on top of it:
//
//   THE KNIGHT - LOW GUARD. Crouched, his shield is down in front of his shins: a YELLOW blow from the front that did not go over him
//     (every blow that reaches a ducker is a low one - a sweep, a bite, a charge at the legs) is TURNED, at a raised shield's price in
//     wind (ST.blockHit), and with NO knockback - he is not slid back as a standing guard is (guardPush). Out of wind the guard breaks
//     (half the blow finds him), a RED blow goes through, a piercing bolt goes through, a blow from behind finds him (PLATED: the
//     shield at his back too, as it is standing). It is not a parry: the beat is the standing shield's.
//     A crouched X is THE SHIELD TRIP: a short low bash along the floor (it is his low sweep when he is crouched and still). A
//     standing common foe it reaches is KNOCKED DOWN (CROUCH.knight.down s, on its back, open - main.js floorFoe) and what it was
//     winding up is TOLD AGAIN when it gets up (src/poise-break.js broke: never thrown from where it stopped). The blow itself is
//     modest (tripMul of a swing). What POISE calls heavy - the heavy infantry (POISE_HEAVY, POISE_EXTRA_HEAVY), an elite, anything
//     big, a mini or a boss - HOLDS its feet: the bash leans on its bar instead (tripPoise), and it is rocked. A foe tripped once is
//     not tripped again for tripImm s (the sweep's rule: an opening, not a lock).
//   THE WARDEN - SET THE SPEAR. Crouched, the spear is levelled low in front of her, the heel in the turf. A foe that CHARGES or LEAPS
//     onto the point - coming at her fast (warden.fast px/s), on the spear's line, its near edge at the point - with a YELLOW blow
//     told (or a run her brace has always stopped, main.js BRACE_STOPS) is IMPALED: main.js impale (broken, stopped dead, the tip's
//     ring, VIGIL) and the set point's own bite on top (setDmg of a swing). A BOSS or a mini takes a plain hit off it (bossDmg) and
//     is NOT stopped - unless its own rule says so (BRACE_STOPS: the Lance's rush, the Ram Lord, the Hound Master), when it is
//     impaled as that rule has always done. A RED charge runs straight through - the rule the brace was built on, absolute.
//     A crouched X is THE LOW POKE: the point driven along the floor at ankle height out to the full reach of her thrust (pokeReach),
//     UNDER a shield (the hit pass lets every low blow under a guard held in front - it is her sweep's kind), with the tip's pay
//     where the point lands. It is a thrust, not a sweep: it trips nothing.
//   THE FREEBOOTER - DUCK AND RELOAD. Crouched with the pistol empty, he reloads TWICE as fast (pirate.reload: the eight seconds are
//     four), a ramrod in the barrel. A shot fired from the crouch is STEADY: braced, it carries half as far again (pirate.reach: 150
//     px to 225, 300 to 450 with LONG BARREL) and it does not throw him back a step. (The ball is a line struck at once - main.js
//     firePistol - so "faster" has nothing to add; the steadier shot is the longer, recoil-free one.)
// Each is taught once a level, twice a save, on the first thing it answers: a yellow low blow told near the knight, a yellow charge
// told near the warden, the freebooter's pistol run dry.
// main.js binds it (makeCrouchA) and calls: update (updatePlayer, after P.ducking is known), takes (damagePlayer0, after the duck),
// lowSwing (lowSweep), box (attackBox), trip / poke (swingKindHit), steady (firePistol), onTell (a windup's first frame), the poses
// (the hero's draw), draw. State lives on the hero (P.ca*), so a co-op second hero carries his own. BK.crouchA() reads it for
// tools/crouch-a.mjs.
import { MARK, HEIGHT, tellKey } from './marks.js';
import { DUCK_WINDOW } from './duck.js';

export const CROUCH = {
  knight: { resolve: 8, tripMul: 0.6, down: 1.2, tripImm: 3.2, tripPoise: 18, reach: 26, slide: 20, live: [0.02, 0.15] },
  warden: { point: 46, near: 4, line: [-11, -3], fast: 70, setDmg: 0.9, bossDmg: 1.0, again: 1.0, pokeReach: 46, slide: 15, live: [0.03, 0.16] },
  pirate: { reload: 2, reach: 1.5 },
};
/* A YELLOW TELL THAT IS A RUN AT HER: what the warden is taught to set the spear for (and what the lab's warden sets it against) */
export const CHARGE_TELL = /charge|leap|lunge|rush|pounce|dash|butt|ram/i;
/* WHAT A GUARD HOLDS IN FRONT OF IT, for the word over a poke that went under it (the family table's guard kinds, less the heavy knight:
   his plate is all round him, and the poke is turned by it as any blow is) */
const GUARDS = new Set(['shield', 'soldier', 'watch', 'pike', 'turtle', 'crab', 'tideguard', 'merrowbrute']);

export function makeCrouchA(api) {
  const stats = { lowGuards: 0, lowBlocks: 0, lowThrough: 0, lowBroken: 0, trips: 0, tripped: 0, held: 0, sets: 0, impaled: 0, bossHits: 0, redThrough: 0, pokes: 0, under: 0, reloads: 0, steady: 0 };
  const P = () => api.P, K = CROUCH.knight, W = CROUCH.warden, R = CROUCH.pirate;
  const said = (p, k, txt, col, gap = 0.6) => { const t = api.time; p.caSaid = p.caSaid || {}; if (t - (p.caSaid[k] ?? -9) < gap) return false; p.caSaid[k] = t; api.number(p.x, p.y - 24, txt, col); return true; };
  const lowUp = p => api.hero() === 'knight' && (!!p.ducking || (!!p.caTrip && p.atk >= 0));

  /* TAUGHT: once a level, twice a save, never in a yard */
  const taughtIn = {};
  function teach(h, msg) { const G = api.PROG, k = 'crouchTold_' + h; if (!api.L || api.L.trial || (G[k] || 0) >= 2 || taughtIn[h] === api.levelIndex) return false;
    taughtIn[h] = api.levelIndex; G[k] = (G[k] || 0) + 1; api.hint(msg); return true; }
  const TEACH = {
    knight: 'A YELLOW MARK LOW AT YOU: HOLD DOWN AND THE SHIELD GOES LOW - IT TAKES THE BLOW WITHOUT A STEP BACK. X FROM THERE TRIPS THEM.',
    warden: 'A CHARGE: HOLD DOWN AND THE SPEAR IS SET - WHAT RUNS ONTO THE POINT IS IMPALED. X FROM THERE GOES UNDER A SHIELD.',
    pirate: 'EMPTY: HOLD DOWN AND HE RELOADS TWICE AS FAST. A SHOT FROM THE CROUCH CARRIES FARTHER AND DOES NOT KICK.',
  };
  /* A WINDUP'S FIRST FRAME (main.js, where the duck is taught): the knight is taught on a yellow low blow near him, the warden on a
     yellow charge */
  function onTell(e) {
    const p = P(), h = api.hero(); if (p.dead || Math.abs(e.x - p.x) > 200 || Math.abs(e.y - p.y) > 60) return;
    const k = tellKey(e);
    if (h === 'knight' && MARK[k] === '!' && HEIGHT[k] !== 'high') teach(h, TEACH.knight);
    else if (h === 'warden' && MARK[k] === '!' && CHARGE_TELL.test(String(e.mode || ''))) teach(h, TEACH.warden);
  }

  /* EVERY FRAME (updatePlayer, once P.ducking is known for this frame) */
  function update(dt) {
    const p = P(), h = api.hero();
    p.caBlockT = Math.max(0, (p.caBlockT || 0) - dt); p.caSteadyT = Math.max(0, (p.caSteadyT || 0) - dt); p.caSetFlash = Math.max(0, (p.caSetFlash || 0) - dt);
    if (p.atk < 0) { p.caTrip = false; p.caPoke = false; }
    if (h === 'knight') { if (p.ducking && !p.caLowWas) stats.lowGuards++; p.caLowWas = !!p.ducking; }
    if (h === 'warden') {
      if (p.ducking && !api.wardJav()) { if (!(p.caSetT > 0)) { stats.sets++; api.SFX.spearSet(); api.dust(p.x + p.face * 10, p.y, 2); } p.caSetT = (p.caSetT || 0) + dt; setWatch(p); }
      else p.caSetT = 0; }
    if (h === 'pirate') {
      p.caReloading = !!(p.ducking && !p.loaded && p.reloadT > 0);
      if (p.caReloading) {   /* DUCK AND RELOAD: the clock runs R.reload times as fast (main.js already took one dt off it this frame) */
        p.reloadT = Math.max(0, p.reloadT - dt * (R.reload - 1));
        p.caRamT = (p.caRamT || 0) - dt; if (p.caRamT <= 0) { p.caRamT = 0.5; api.SFX.ramrod(); }
        if (p.reloadT <= 0) { stats.reloads++; api.reloadPistol('LOADED'); api.SFX.pistolSeat(); } }
      else p.caRamT = 0;
      if (!p.loaded && !p.caEmptyWas && !p.dead) teach(h, TEACH.pirate);
      p.caEmptyWas = !p.loaded; }
    p.caWasDucked = !!p.ducking;
  }

  /* ---- THE KNIGHT'S LOW GUARD (damagePlayer0, after the duck let a high blow go over). 'blocked', 'half' (out of wind: it breaks, and
     half the blow finds him), or null (it is not the low guard's) ---- */
  function takes(fromX, dmg, unblockable, who, pierce) {
    const p = P(); if (!lowUp(p)) return null;
    const front = Math.sign(fromX - p.x) === p.face || fromX === p.x;
    if (!(front || api.tal('plated'))) return null;   /* from behind it finds him (PLATED: the shield at his back too, as standing) */
    if (unblockable) { stats.lowThrough++; said(p, 'thru', 'UNDER THE SHIELD', '#ff6b6b'); return null; }   /* RED: no shield, low or high */
    if (pierce) return null;   /* a piercing bolt goes through a shield already set; only one raised on the beat turns it */
    const cost = Math.round(api.ST.blockHit * (1 - 0.15 * api.tal('steady')));
    if (p.st < cost) { stats.lowBroken++; p.st = 0; p.stFlash = 0.5; p.hurt = Math.max(p.hurt || 0, 0.55); api.SFX.guardBreak(); api.SFX.gasp(); api.shakeCam(4, -p.face * 3); api.hitstop(0.1); api.number(p.x, p.y - 22, 'GUARD BREAK', '#ffd36b'); return 'half'; }
    p.st -= cost; p.stDelay = api.ST.delay; api.gainResolve(K.resolve); stats.lowBlocks++; p.caBlockT = 0.16;
    if (api.tal('vengeance')) p.venge = Math.min(30, (p.venge || 0) + Math.round(dmg * 0.5));   /* VENGEANCE keeps what the shield took, low or high */
    const sd = Math.sign(fromX - p.x) || p.face;
    api.blockFx(p.x + sd * 9, p.y - 5, sd); api.SFX.lowGuard();   /* NO KNOCKBACK: he is not slid back - that is the whole of the low guard */
    said(p, 'low', 'LOW GUARD', '#c9d1dc', 1.2);
    return 'blocked';
  }

  /* ---- A CROUCHED X (lowSweep, once it is a sweep): the knight's is the SHIELD TRIP and the warden's the LOW POKE; anyone else's, and
     either of theirs walking, is the low sweep as it was ---- */
  function lowSwing(ducked) {
    const p = P(), h = api.hero(); p.caTrip = false; p.caPoke = false;
    if (!ducked) return;
    if (h === 'knight') { p.caTrip = true; p.vx = p.face * K.slide; p.swingMul = K.tripMul; stats.trips++; api.SFX.shieldTrip(); api.dust(p.x + p.face * 12, p.y, 4); }
    else if (h === 'warden' && !api.wardJav()) { p.caPoke = true; p.vx = p.face * W.slide; stats.pokes++; api.SFX.lowPoke(); api.dust(p.x + p.face * 8, p.y, 2); }
  }
  /* THE BOX: the trip is the shield's rim along the floor, the poke the point out to her full thrust at the ankles. null: not ours */
  function box() {
    const p = P(), f = p.face;
    if (p.caTrip) { if (p.atk < K.live[0] || p.atk >= K.live[1]) return 'none'; return f > 0 ? { l: p.x - 4, r: p.x + K.reach, t: p.y - 9, b: p.y + 2 } : { l: p.x - K.reach, r: p.x + 4, t: p.y - 9, b: p.y + 2 }; }
    if (p.caPoke) { if (p.atk < W.live[0] || p.atk >= W.live[1]) return 'none'; return f > 0 ? { l: p.x + 2, r: p.x + W.pokeReach, t: p.y - 9, b: p.y + 1 } : { l: p.x - W.pokeReach, r: p.x - 2, t: p.y - 9, b: p.y + 1 }; }
    return null;
  }
  /* THE TRIP LANDED (swingKindHit, after the blow). can: main.js's own test for a body a sweep may trip (not a boss, a mini, a flier) */
  function trip(e, can) {
    const p = P(); api.sparks(e.x - p.face * ((e.w || 12) / 2), e.y - 3, p.face, 5); api.SFX.shieldSlam();
    if (!can || api.heavy(e)) {   /* IT HOLDS ITS FEET: weight - the bash leans on its bar instead, and rocks it */
      stats.held++; api.poiseLean(e, K.tripPoise); if (e.alive) e.stagger = Math.max(e.stagger || 0, 0.25);
      api.number(e.x, e.y - (e.h || 16) - 8, 'HOLDS', '#9aa39a'); return; }
    if (e.tripImm > api.time) { e.stagger = Math.max(e.stagger || 0, 0.3); return; }   /* a second trip waits */
    if (!api.floorFoe(e, K.down)) return;   /* on its back and open (and told again when it gets up: broke) */
    e.tripImm = api.time + K.tripImm; stats.tripped++;
    api.number(e.x, e.y - (e.h || 16) - 8, 'TRIPPED', '#ffd36b'); api.trialEvent('sweep');
  }
  /* THE POKE LANDED: under the guard it would have turned (the hit pass already let it through), and said so */
  function poke(e) {
    const p = P();
    if (GUARDS.has(e.t) && e.face && Math.sign(p.x - e.x) === e.face && !(e.broken > 0)) { stats.under++; api.number(e.x, e.y - (e.h || 16) - 8, 'UNDER THE SHIELD', '#8fd160'); api.SFX.tipRing(); }
    api.sparks(e.x - p.face * ((e.w || 12) / 2), e.y - 3, p.face, 4);
  }

  /* ---- THE WARDEN'S SET SPEAR: what runs onto the point ---- */
  function setWatch(p) {
    for (const e of api.enemies) {
      if (!e.alive || e.harmless || e.gone > 0 || e.turncoat || e.pointHit > 0 || (e.caSetAt || -9) > api.time - W.again) continue;
      if (Math.sign(e.x - p.x) !== p.face) continue;
      const d = api.tipReach(e); if (d > W.point || d < W.near) continue;                         /* its near edge is at the point */
      const b = api.box(e); if (b.b < p.y + W.line[0] || b.t > p.y + W.line[1]) continue;           /* its body crosses the spear's line, low */
      if (!((e.x - p.x) * (e.vx || 0) < 0 && Math.abs(e.vx || 0) > W.fast)) continue;               /* and it is coming, fast */
      const own = api.braceStops(e), told = !!e.toldK && (api.time - (e.toldAt ?? -9) < DUCK_WINDOW || (!!e.blowMode && e.mode === e.blowMode));
      const mark = told ? MARK[e.toldK] : undefined;
      if (!own && mark === '!!') { if ((e.caRedAt || -9) < api.time - 1) { e.caRedAt = api.time; stats.redThrough++; } continue; }   /* RED runs through */
      if (!own && mark !== '!') continue;                                                             /* nothing told: not a charge */
      e.caSetAt = api.time; p.caSetFlash = 0.25;
      if (!own && api.big(e)) {   /* A BOSS OR A MINI: a plain hit off the point, and on it comes */
        stats.bossHits++; api.hurtAs('light', e, Math.max(1, Math.round(api.swordDmg() * W.bossDmg)), p.x, false);
        api.SFX.tipRing(); api.sparks(e.x - p.face * ((e.w || 12) / 2), e.y - (e.h || 16) / 2, -p.face, 6); continue; }
      stats.impaled++; api.impale(e);   /* main.js impale: broken, stopped dead, the ring, VIGIL - a boss here only by its own rule */
      if (e.alive && !api.big(e)) api.hurtAs('heavy', e, Math.max(1, Math.round(api.swordDmg() * W.setDmg)), p.x, false);   /* and the set point's own bite */
      api.number(e.x, e.y - (e.h || 16) - 30, 'IMPALED', '#8fd160');
    }
  }

  /* ---- THE FREEBOOTER'S STEADY SHOT (firePistol): true when he fires it from the crouch ---- */
  function steady() { const p = P(); if (api.hero() !== 'pirate' || !(p.ducking || p.caWasDucked) || !p.ground) return false; stats.steady++; p.caSteadyT = 0.34; return true; }

  /* ---- THE POSES (the hero's draw): [key, frame] or null ---- */
  function atkPose(Rr) { const p = P();
    if (p.caTrip && Rr.trip) return ['trip', p.atk < 0.06 ? 0 : 1];
    if (p.caPoke && Rr.lowPoke) return ['lowPoke', p.atk < 0.06 ? 0 : 1];
    return null; }
  function shotPose(Rr) { const p = P(); return p.caSteadyT > 0 && p.blastT > 0 && Rr.crouchShot ? ['crouchShot', p.blastT > 0.2 ? 0 : 1] : null; }
  function crouchPose(Rr) { const p = P(), h = api.hero();
    if (h === 'knight' && Rr.lowGuard) return ['lowGuard', p.caBlockT > 0 ? 1 : 0];
    if (h === 'warden' && Rr.set && !api.wardJav()) return ['set', p.caSetFlash > 0 ? 1 : 0];
    if (h === 'pirate' && Rr.reload && !p.loaded) return ['reload', Math.floor(api.time * 4) % 2];
    return null; }
  /* DRAWN over the hero: the set point's glint (it winks while set, and flares white as something runs onto it), and the ramrod's puff */
  function draw(g, cx, cy) {
    const p = P(), h = api.hero(); if (p.dead || !p.ducking) return;
    if (h === 'warden' && !api.wardJav()) { const x = Math.round(p.x + p.face * 43 - cx), y = Math.round(p.y - 5 - cy), on = p.caSetFlash > 0 || Math.floor(api.time * 3) % 3 === 0;
      if (on) { g.fillStyle = p.caSetFlash > 0 ? '#ffffff' : '#dff0d8'; g.fillRect(x, y - 1, 1, 3); g.fillRect(x - 1, y, 3, 1); } }
  }

  const read = () => { const p = P(); return { now: api.time, lowGuard: lowUp(p), set: !!(api.hero() === 'warden' && p.ducking && !api.wardJav()), reloading: !!p.caReloading, trip: !!p.caTrip, poke: !!p.caPoke, steadyT: p.caSteadyT || 0, reloadT: p.reloadT || 0, loaded: !!p.loaded, stats: { ...stats }, K, W, R }; };
  return { update, takes, lowSwing, box, trip, poke, setWatch, steady, onTell, atkPose, shotPose, crouchPose, draw, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
