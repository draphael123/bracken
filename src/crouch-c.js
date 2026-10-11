// src/crouch-c.js — PER-HERO CROUCH TWISTS, PART C (claude/berserker, Daniel 2026-10-03): THE BERSERKER WORKS HIMSELF UP. The pattern of
// src/crouch-b.js: the universal duck (src/duck.js - DOWN held on the ground, stood still: the hurt box drops to DUCK_H and a high blow goes
// over) with something more while he stays down, and it leaves him EXPOSED - a duck is no guard, so a low blow finds him, and a hit (P.hurt)
// stands him up and breaks it off.
//   WORKING UP: crouched and STILL for WORK.settle s, he grinds his axe heads together and growls, and his RAGE FILLS SLOWLY (WORK.rate a
//   second, SLOW BURN doubles it) up to WORK.cap - he may load it before a fight (it answers rage draining between fights) but never all the
//   way to a frenzy: that is earned in the fight. Its price is told: the GROWL (SFX.bzGrowl) every WORK.growlEvery s and a RING on the floor,
//   and the noise carries - every foe within WORK.R px (eight tiles) wakes and turns on him (a sleeper is roused, a creature that has not seen
//   him has), and on a hushed level it is a noise like any other (main.js noiseAt).
// main.js binds it (makeCrouchC) and calls: update (in updatePlayer, right after P.ducking is set, beside crouch-b), pose (the hero's pose
// pick), draw (after the hero), clear (a level load). State is on the hero (P.workT), so a co-op partner carries his own.
export const WORK = {
  settle: 0.4,        // down and still this long before he starts
  rate: 6,            // rage a second (SLOW BURN: x2): 0 -> the cap in about 12 s
  cap: 75,            // never past this from the crouch: a FRENZY is the fight's
  growlEvery: 1.3,    // the growl's beat - and the noise's
  R: 128,             // px: the growl carries eight tiles
};
const TEACH = ['workTold', 'WORKING UP: CROUCH AND STAY STILL, AND YOUR RAGE FILLS. THE GROWL DRAWS THEM IN.'];

export function makeCrouchC(api) {
  const stats = { workT: 0, rageGiven: 0, growls: 0, drawn: 0, broken: 0 };
  const P = () => api.P;
  let taughtIn = null, calmT = 0;
  function teach() { const PROG = api.PROG, [k, msg] = TEACH;
    if ((PROG[k] || 0) >= 2 || taughtIn === api.levelIndex) return; taughtIn = api.levelIndex; PROG[k] = (PROG[k] || 0) + 1; api.hint(msg); }
  function growl(p) { stats.growls++; api.SFX.bzGrowl && api.SFX.bzGrowl(); api.ringAt(p.x, p.y - 1, WORK.R * 0.35, '#ff6b4a', 0.35); api.ringAt(p.x, p.y - 1, WORK.R, '#7a3a1c', 0.55);
    api.noiseAt(p.x, p.y - 8, WORK.R);
    for (const e of api.enemies) { if (!e.alive || e.harmless || e.turncoat || Math.hypot(e.x - p.x, e.y - p.y) > WORK.R) continue;
      const drawn = !e.seenP || e.mode === 'asleep' || e.sleeper; if (e.mode === 'asleep' || e.sleeper) { e.woke = 1; e.sleeper = false; }
      e.seenP = true; e.alertT = Math.max(e.alertT || 0, 3); if (!e.maxHp) e.face = Math.sign(p.x - e.x) || e.face;
      if (drawn) { stats.drawn++; e.emote = 'shock'; e.emoteT = 0.6; } } }
  function update(dt) {
    const p = P(); if (api.hero() !== 'berserker') { p.workT = 0; return; }
    if (!p.ducking || p.dead) { if (p.workT > WORK.settle && p.hurt > 0) stats.broken++; p.workT = 0; p.growlT = 0;
      calmT = (p.rage || 0) < 30 && p.ground && !p.dead && !api.enemies.some(e => e.alive && !e.harmless && Math.abs(e.x - p.x) < 200 && Math.abs(e.y - p.y) < 80) ? calmT + dt : 0;
      if (calmT > 2 && api.levelIndex > 0) teach(); return; }
    p.workT = (p.workT || 0) + dt; calmT = 0;
    if (p.workT < WORK.settle) return;
    if (p.frenzyT > 0) return;
    const was = p.rage || 0;
    if (was < WORK.cap) { const add = Math.min(WORK.cap - was, WORK.rate * (api.tal().burn ? 2 : 1) * dt); p.rage = was + add; stats.rageGiven += add; stats.workT += dt; }
    p.growlT = (p.growlT || 0) - dt; if (p.growlT <= 0) { p.growlT = WORK.growlEvery; growl(p); }
    if (Math.random() < dt * 20) api.parts.push({ x: p.x + p.face * 6 + (Math.random() - 0.5) * 4, y: p.y - 18, vx: (Math.random() - 0.5) * 50, vy: -30 - Math.random() * 30, life: 0.25, max: 0.25, col: Math.random() < 0.5 ? '#ffd36b' : '#fff6c8', size: 1, grav: 120 });   /* the sparks off the edges */
  }
  /* HIS POSE while it works: [key, frame] or null (the plain crouch) */
  function pose(R) { const p = P(); if (api.hero() !== 'berserker' || !p.ducking || !(p.workT >= WORK.settle) || !R.grind) return null; return ['grind', Math.floor(p.workT * 6) % 2]; }
  /* DRAWN: a dull red heat on him as it builds */
  function draw(g, cx, cy) { const p = P(); if (api.hero() !== 'berserker' || !p.ducking || !(p.workT >= WORK.settle)) return;
    const k = Math.min(1, (p.workT - WORK.settle) / 0.5) * (0.12 + 0.12 * ((p.rage || 0) / 100)), x = Math.round(p.x - cx), y = Math.round(p.y - cy);
    g.globalAlpha = k + 0.05 * Math.sin(api.time * 9); g.fillStyle = '#ff4a3a'; g.beginPath(); g.ellipse(x, y - 6, 11, 9, 0, Math.PI, 0); g.fill(); g.globalAlpha = 1; }
  function clear() { taughtIn = null; calmT = 0; }
  const read = () => { const p = P(); return { ducking: !!p.ducking, workT: p.workT || 0, working: !!p.ducking && (p.workT || 0) >= WORK.settle, rage: p.rage || 0, stats: { ...stats } }; };
  return { update, pose, draw, clear, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
