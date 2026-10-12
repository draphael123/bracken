// src/crouch-c.js — PER-HERO CROUCH TWISTS, PART C: THE BERSERKER (claude/berserker 2026-10-03; REWORKED claude/berserker2 2026-10-11,
// scratch/brief-berserker2.md 4). The pattern of src/crouch-b.js: the universal duck (src/duck.js - DOWN held on the ground, stood still: the
// hurt box drops to DUCK_H and a high blow goes over) with something more while he stays down. A duck is no guard: a low blow finds him, and
// a hit (P.hurt) stands him up and breaks it off.
//   THE COIL: crouched, he COILS - his rage TICKS UP slowly (COIL.rate a second, SLOW BURN doubles it, never past COIL.cap: a frenzy is the
//   fight's). Coiled, a way held only TURNS him (he stays down, his axes forward).
//   THE POUNCE: coiled at least COIL.min s, HOLD A WAY AND LET GO OF DOWN - a low fast leap axes-first that way (POUNCE: the longer the coil,
//   the further, to COIL.full). Its blow is a DASH (the shooter's and the crew's key, main.js FAMILY: the gap-closer for archers and casters),
//   it knocks SMALL foes along (src/knock-into.js rules, through main.js kiWhy's dash) and goes on through them, and a bigger one stops it
//   dead. It LANDS COMMITTED: POUNCE.rec s he can do nothing but stand up. Let go with no way held and he only stands up - a duck under an
//   arrow, a brace against a gust, never a pounce by accident. It costs stamina, never health, and it never carries him off a ledge into a
//   drop, the spikes or a deadly pool (it is shortened, or refused: HE NEVER KILLS HIMSELF).
//   THE WHETSTONE (was WORKING UP, moved off the crouch into his idle): stood still between fights (main.js P.calmFor: the fidget clock's own
//   'calm') for WHET.settle s, he whets one axe on the other in a small dance and his rage creeps up (WHET.rate a second, SLOW BURN doubles
//   it) to WHET.cap - a small top-up, never a frenzy. Quiet: no growl, no noise.
// main.js binds it (makeCrouchC) and calls: update (in updatePlayer, right after P.ducking is set), coiled (P.ducking's turn rule), pose (the
// hero's pose pick), draw (after the hero), clear (a level load). State is on the hero (P.coilT, P.pounceT, P.whetT), so a co-op partner
// carries his own.
export const COIL = {
  settle: 0.12,       // down and still this long before he is coiled (and a way only turns him)
  min: 0.3,           // coiled this long before letting go pounces
  full: 0.6,          // coiled this long past min: the longest leap
  rate: 4,            // rage a second while coiled (SLOW BURN: x2)
  cap: 75,            // never past this from the coil
};
export const POUNCE = {
  vx: 270, more: 70,  // px/s along: COIL.min .. full adds `more`
  vy: -150,           // px/s up: a LOW leap (about six tiles on the flat)
  st: 14,             // stamina (a roll is 22)
  dmg: 1.3,           // x his chop's damage, tagged 'dash'
  t: 0.7,             // s: the most a leap lasts in the air
  rec: 0.22,          // s: the committed landing
  air: 0.42,          // s: about how long the leap is in the air on the flat, a little over (its landing is checked there, at half and a quarter, a body's half-width on)
};
export const WHET = {
  settle: 1.5,        // s calm before he takes the whetstone to it
  rate: 4,            // rage a second (SLOW BURN: x2)
  cap: 50,            // a small top-up: half a bar
};
const TEACH = ['workTold', 'STAND STILL BETWEEN FIGHTS: HE WHETS HIS AXES AND HIS RAGE CREEPS UP.'];

export function makeCrouchC(api) {
  const stats = { workT: 0, rageGiven: 0, growls: 0, drawn: 0, broken: 0, coilT: 0, coilRage: 0, pounces: 0, pounceHits: 0, pounceStops: 0, shortened: 0, refused: 0, whetT: 0, whetRage: 0 };
  const P = () => api.P;
  let taughtIn = null;
  function teach() { const PROG = api.PROG, [k, msg] = TEACH;
    if ((PROG[k] || 0) >= 2 || taughtIn === api.levelIndex) return; taughtIn = api.levelIndex; PROG[k] = (PROG[k] || 0) + 1; api.hint(msg); }
  const coiled = () => { const p = P(); return api.hero() === 'berserker' && (p.coilT || 0) >= COIL.settle; };
  /* THE LEAP'S LANDING, checked before he goes: a pit, the spikes or a deadly pool under it and it is shorter, or he does not go */
  function safeVx(p, vx) { for (const k of [1, 0.6, 0.3]) { const v = vx * k; if ([1, 0.5, 0.25].every(f => api.landsSafe(p.x + v * POUNCE.air * f + Math.sign(v) * 6, p.y))) return v; } return 0; }
  function pounce(p, dir) {
    const k = Math.max(0, Math.min(1, ((p.coilT || 0) - COIL.min) / COIL.full)), want = dir * (POUNCE.vx + POUNCE.more * k), vx = safeVx(p, want);
    if (!vx) { stats.refused++; api.dust(p.x + dir * 4, p.y, 2); return false; }   /* (no footing out there: he only stands up) */
    if (!api.spend(POUNCE.st)) { api.tired(); return false; }
    if (Math.abs(vx) < Math.abs(want)) stats.shortened++;
    stats.pounces++; p.face = dir; p.pounceVx = vx; p.pounceT = 1e-4; p.pounceHit = new Set(); p.vy = POUNCE.vy; p.ground = false; p.braceT = 0;
    api.SFX.bzThrow && api.SFX.bzThrow(); api.dust(p.x - dir * 5, p.y, 4); api.streaks(p.x, p.y - 8, -dir, ['#ff9a5c', '#e8dcc0'], 120); api.squash(1.18, 0.86, 0.1); api.noteVerb('dash');
    return true; }
  function stepPounce(p, dt) {
    if (p.pounceRec > 0) { p.pounceRec = Math.max(0, p.pounceRec - dt); if (p.ground) p.vx *= Math.pow(0.02, dt); }
    if (!(p.pounceT > 0)) return;
    p.pounceT += dt;
    if (p.dead || p.hurt > 0 || p.swim || p.climb || p.cling) { p.pounceT = 0; return; }
    if ((p.ground && p.pounceT > 0.06) || p.pounceT > POUNCE.t) { p.pounceT = 0; p.pounceRec = POUNCE.rec; api.dust(p.x, p.y, 4); api.SFX.land && api.SFX.land(); return; }   /* LANDED: committed */
    if (api.isSolid(Math.floor((p.x + Math.sign(p.pounceVx) * 7) / api.TS), Math.floor((p.y - 8) / api.TS))) { p.pounceVx = 0; }   /* into a wall: it stops there */
    /* AXES FIRST: the box out ahead of him, low */
    const d = Math.sign(p.pounceVx) || p.face, hb = d > 0 ? { l: p.x - 4, r: p.x + 17, t: p.y - 18, b: p.y + 2 } : { l: p.x - 17, r: p.x + 4, t: p.y - 18, b: p.y + 2 };
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.gone > 0 || p.pounceHit.has(e) || !api.overlap(hb, api.box(e))) continue; p.pounceHit.add(e); stats.pounceHits++;
      const small = api.small(e);
      api.hurtAs('dash', e, Math.round(api.swordDmg() * POUNCE.dmg), p.x - d * 10, false); api.sparks(e.x, e.y - (e.h || 16) / 2, d, 7); api.hitstop(0.04);
      if (!small) { stats.pounceStops++; p.pounceVx = -d * 60; if (e.alive && !e.maxHp && !e.mini) e.stagger = Math.max(e.stagger || 0, 0.35); api.shakeCam(2, d * 2); break; } } }   /* a bigger one stops him dead: he bounces off it */
  function update(dt) {
    const p = P(); if (api.hero() !== 'berserker') { p.workT = 0; p.coilT = 0; p.whetT = 0; return; }
    stepPounce(p, dt);
    /* THE COIL, and its letting go */
    if (!p.ducking || p.dead) {
      if ((p.coilT || 0) >= COIL.min && !api.keys.down && p.ground && !api.keys.jump && !(p.hurt > 0) && !p.dead && !(p.atk >= 0) && !(p.dodge > 0)) {
        const dir = (api.keys.right ? 1 : 0) - (api.keys.left ? 1 : 0); if (dir) pounce(p, dir); }
      if (p.coilT > COIL.settle && p.hurt > 0) stats.broken++; p.coilT = 0; p.workT = 0;
    } else {
      p.coilT = (p.coilT || 0) + dt; p.workT = 0;
      if (p.coilT >= COIL.settle) { const dir = (api.keys.right ? 1 : 0) - (api.keys.left ? 1 : 0); if (dir) p.face = dir;   /* coiled, a way turns him */
        stats.coilT += dt;
        if (!(p.frenzyT > 0)) { const was = p.rage || 0; if (was < COIL.cap) { const add = Math.min(COIL.cap - was, COIL.rate * (api.tal().burn ? 2 : 1) * dt); p.rage = was + add; stats.coilRage += add; stats.rageGiven += add; } }
        if (Math.random() < dt * 10) api.parts.push({ x: p.x + p.face * 7 + (Math.random() - 0.5) * 4, y: p.y - 7, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 20, life: 0.25, max: 0.25, col: Math.random() < 0.5 ? '#ff6b4a' : '#ffd36b', size: 1, grav: 60 }); }
    }
    /* THE WHETSTONE: stood calm between fights */
    const calm = !p.ducking && p.ground && !p.dead && (p.calmFor || 0) >= WHET.settle && !(p.frenzyT > 0) && !p.bzAxe;
    p.whetHold = calm && (p.rage || 0) <= WHET.cap;   /* (the drain is held while the whetstone tops him up - above its cap it drains down to it as ever) */
    if (calm) { p.whetT = (p.whetT || 0) + dt; stats.whetT += dt;
      const was = p.rage || 0; if (was < WHET.cap) { const add = Math.min(WHET.cap - was, WHET.rate * (api.tal().burn ? 2 : 1) * dt); p.rage = was + add; stats.whetRage += add; stats.rageGiven += add; }
      if (Math.random() < dt * 6) api.parts.push({ x: p.x + p.face * 5 + (Math.random() - 0.5) * 3, y: p.y - 13, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 20, life: 0.2, max: 0.2, col: Math.random() < 0.5 ? '#ffd36b' : '#fff6c8', size: 1, grav: 120 });   /* the sparks off the edge */
      if (p.whetT > 0.6 && api.levelIndex > 0 && (p.rage || 0) < 30) teach(); }
    else { p.whetT = 0; p.whetHold = false; }
  }
  /* HIS POSE: [key, frame] or null. Coiled: the coil (placeholder: the grind); whetting: the whetstone (placeholder: the grind, stood) */
  function pose(R) { const p = P(); if (api.hero() !== 'berserker') return null;
    if (p.ducking && (p.coilT || 0) >= COIL.settle) { const k = R.bzCoil ? 'bzCoil' : R.grind ? 'grind' : null; return k ? [k, Math.floor(p.coilT * 6) % R[k].length] : null; }
    if (!p.ducking && (p.whetT || 0) > 0) { const k = R.bzWhet ? 'bzWhet' : R.grind ? 'grind' : null; return k ? [k, Math.floor(p.whetT * 5) % R[k].length] : null; }
    return null; }
  /* THE LEAP'S OWN POSE, read before the air poses (main.js): the leap, then the committed landing */
  function leapPose(R) { const p = P(); if (api.hero() !== 'berserker') return null;
    if (p.pounceT > 0) { const k = R.bzPounce ? 'bzPounce' : R.dashAtk ? 'dashAtk' : null; return k ? [k, p.pounceT < 0.08 ? 0 : Math.min(R[k].length - 1, 1)] : null; }
    if (p.pounceRec > 0 && p.ground) { const k = R.bzPLand ? 'bzPLand' : R.land ? 'land' : null; return k ? [k, p.pounceRec > 0.11 ? 0 : Math.min(1, R[k].length - 1)] : null; }   /* (claude/bzart: the heads in the turf, then the heave up) */
    return null; }
  /* DRAWN: a dull red heat on him while he is coiled */
  function draw(g, cx, cy) { const p = P(); if (api.hero() !== 'berserker' || !p.ducking || !((p.coilT || 0) >= COIL.settle)) return;
    const k = Math.min(1, (p.coilT - COIL.settle) / 0.5) * (0.12 + 0.12 * ((p.rage || 0) / 100)), x = Math.round(p.x - cx), y = Math.round(p.y - cy);
    g.globalAlpha = k + 0.05 * Math.sin(api.time * 9); g.fillStyle = (p.coilT || 0) >= COIL.min ? '#ff6b4a' : '#ff4a3a'; g.beginPath(); g.ellipse(x, y - 6, 11, 9, 0, Math.PI, 0); g.fill(); g.globalAlpha = 1; }
  function clear() { taughtIn = null; const p = P(); if (p) { p.coilT = 0; p.pounceT = 0; p.pounceRec = 0; p.whetT = 0; } }
  const read = () => { const p = P(); return { ducking: !!p.ducking, coilT: p.coilT || 0, coiled: coiled(), pounceT: p.pounceT || 0, pounceRec: p.pounceRec || 0, whetT: p.whetT || 0, whetting: (p.whetT || 0) > 0,
    workT: p.workT || 0, working: false, rage: p.rage || 0, stats: { ...stats } }; };
  return { update, coiled, pose, leapPose, draw, clear, read, small: e => api.small(e), resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
