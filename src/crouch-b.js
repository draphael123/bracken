// src/crouch-b.js — PER-HERO CROUCH TWISTS, PART B (claude/crouchb, Daniel approved the CROUCH PLAN, 2026-09-29): the PALADIN,
// the GEOMANCER and the DEATH KNIGHT. One module for the three because they share their shape: each is the universal duck
// (src/duck.js - DOWN held on the ground, stood still: the hurt box drops to DUCK_H and a high blow goes over) with something
// more while the hero stays down, and each leaves him EXPOSED - a duck is no guard (P.ducking is false while he blocks), so a
// low blow finds him and a hit (P.hurt) stands him up and breaks it off.
//   THE PALADIN - KNEEL IN PRAYER: down and still for KNEEL.settle s, and his LIGHT fills KNEEL.rate a second (empty to full in
//     four seconds, a soft gold glow and a chant while it does). It is the whole bar of JUDGEMENT for four seconds on his knees
//     with no guard - bought between fights, never inside one.
//   THE GEOMANCER - EARTH SENSE: down, and what hides in the ground near her SHOWS - a buried dead man, a sand-cloak under his
//     mound, a lurker, a pumpkin, an assassin in his shadow, a breakable wall - within SENSE.R px (six tiles), outlined and
//     pulsing for as long as she stays down and SENSE.after s after. A pulse sounds when something new is found. No damage and
//     no waking: only knowing.
//   THE DEATH KNIGHT - BLOOD HARVEST: down over a body (the ones his kills leave lying, main.js leaveBody: a body lies 24 s), and
//     after HARVEST.time s he draws HARVEST.hp health and HARVEST.blood BLOOD (his harvest bar) out of it. A body gives once.
//     Red motes run from it into him while he draws, a wet sound, and a gulp at the end.
// Every other hero is untouched (the ember ward is the pyromancer's, src/ember-ward.js). main.js binds it (makeCrouchB) and calls:
// update (in updatePlayer, right after P.ducking is set), pose (the hero's pose pick), draw (after the hero), clear (a level
// load). State lives on the hero (P.kneel*, P.sense*, P.harv*), so a co-op second hero carries his own; the reveal list is the
// level's. BK.crouchB() reads it for tools/crouch-b.mjs and the bot (src/lab.js crouchBPlan).
export const KNEEL = {
  settle: 0.3,        // down and still this long before the prayer takes
  rate: 25,           // LIGHT a second while he prays: 0 -> 100 in 4 s
  chantEvery: 0.9,    // the chant's beat
};
export const SENSE = {
  R: 96,              // px from her: six tiles
  after: 1.5,         // what she found stays outlined this long after she stands
  settle: 0.12,       // down this long before the earth answers (a duck under an arrow is not a look)
};
export const HARVEST = {
  time: 0.6,          // down over the body this long
  hp: 7,              // health drawn out of it
  blood: 12,          // BLOOD (P.harvest) drawn out of it - a kill gives 7, a marked kill 16
  reachX: 14,         // the body must be this close under him...
  reachUp: 20, reachDown: 6,   // ...and lying at his feet (a flyer's body left in the air cannot be reached)
};
/* WHAT HIDES: a common foe in a mode that keeps it out of sight - under the dirt (the buried dead, the husk), under a mound (the sand
   goblin and the sand-cloak, whose state is e.st), shut or tucked away (the mimic's lid, the pumpkin, the feeler, the lurker, the
   chimney sweep gone up his flue), or in the shadows (the assassin, the gar under the water). Bosses keep their own tells */
const HIDE_MODES = { buried: 1, hide: 1, lurk: 1, shut: 1, under: 1 };
const HIDERS = new Set(['zombie', 'husk', 'pumpkin', 'feeler', 'lurker', 'sweep', 'assassin', 'gar', 'mimic', 'sandgob', 'ambusher']);
export const hiding = e => !!(e && e.alive && !e.maxHp && !e.mini && HIDERS.has(e.t) && (HIDE_MODES[e.mode] || (e.st && HIDE_MODES[e.st.mode]) || (e.gone || 0) > 0.5));
const TEACH = {
  paladin: ['kneelTold', 'KNEEL: HOLD DOWN AND STAY STILL, AND YOUR LIGHT FILLS. NO GUARD WHILE YOU PRAY.'],
  geomancer: ['senseTold', 'EARTH SENSE: HOLD DOWN, AND WHAT HIDES IN THE GROUND NEAR YOU SHOWS ITSELF.'],
  reaper: ['harvestTold', 'BLOOD HARVEST: CROUCH OVER A BODY. IT GIVES UP HEALTH AND BLOOD, ONCE.'],
};

export function makeCrouchB(api) {
  const stats = { kneelT: 0, lightGiven: 0, senses: 0, found: 0, foundFoes: 0, foundWalls: 0, harvests: 0, hpGiven: 0, bloodGiven: 0, harvestBroken: 0 };
  const P = () => api.P;
  const seen = new Map();   /* what earth sense has shown: a creature or a wall -> the time it stops showing */
  let taughtIn = null, calmT = 0;
  const addParts = (...a) => api.parts.push(...a);

  function teach(h) { const [k, msg] = TEACH[h]; const PROG = api.PROG;
    if ((PROG[k] || 0) >= 2 || taughtIn === api.levelIndex + ':' + h) return; taughtIn = api.levelIndex + ':' + h; PROG[k] = (PROG[k] || 0) + 1; api.hint(msg); }
  const foesNear = (p, r) => api.enemies.some(e => e.alive && !e.harmless && !hiding(e) && Math.abs(e.x - p.x) < r && Math.abs(e.y - p.y) < 80);

  /* ---- THE PALADIN: KNEEL IN PRAYER ---- */
  function kneel(dt, p) {
    const light = p.light || 0;
    if (!p.ducking) { if (p.kneelT > KNEEL.settle) api.SFX.kneelRise && api.SFX.kneelRise(); p.kneelT = 0; p.chantT = 0;
      /* THE TEACH: his light is low and nothing is near - the first time, say what kneeling does */
      calmT = light < 50 && p.ground && !p.dead && !foesNear(p, 200) ? calmT + dt : 0; if (calmT > 1.5) teach('paladin'); return; }
    p.kneelT = (p.kneelT || 0) + dt; calmT = 0;
    if (p.kneelT < KNEEL.settle) return;
    if (light < 100) {
      const add = Math.min(100 - light, KNEEL.rate * dt); p.light = light + add; stats.lightGiven += add; stats.kneelT += dt;
      if (p.light >= 100) api.lightReady();
      p.chantT = (p.chantT || 0) - dt; if (p.chantT <= 0) { p.chantT = KNEEL.chantEvery; api.SFX.kneelChant(p.light / 100); }
      if (Math.random() < dt * 14) addParts({ x: p.x + (Math.random() - 0.5) * 18, y: p.y - 2 - Math.random() * 6, vx: (Math.random() - 0.5) * 6, vy: -16 - Math.random() * 18, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? '#fff6c8' : '#ffd36b', size: 1, grav: -6, glow: true });
    }
  }

  /* ---- THE GEOMANCER: EARTH SENSE ---- */
  function sense(dt, p) {
    if (!p.ducking) { p.senseT = 0;
      /* THE TEACH: the first time something hidden lies within ten tiles of her, say she can look for it */
      if (!p.dead && (api.enemies.some(e => hiding(e) && Math.hypot(e.x - p.x, e.y - p.y) < 160) || (api.L.walls || []).some(w => !w.broken && wallDist(w, p) < 160))) teach('geomancer');
      return; }
    const was = p.senseT || 0; p.senseT = was + dt;
    if (p.senseT < SENSE.settle) return;
    if (was < SENSE.settle) { stats.senses++; api.ringAt(p.x, p.y - 1, SENSE.R * 0.5, '#e8a83a', 0.35); api.ringAt(p.x, p.y - 1, SENSE.R, '#8c6a3a', 0.5); api.SFX.earthListen(); api.dust(p.x - 6, p.y, 2); api.dust(p.x + 6, p.y, 2); }
    const until = api.time + SENSE.after; let found = 0;
    for (const e of api.enemies) if (hiding(e) && Math.hypot(e.x - p.x, e.y - (e.h || 12) / 2 - (p.y - 6)) < SENSE.R) { if (!(seen.get(e) > api.time)) { found++; stats.foundFoes++; } seen.set(e, until); }
    for (const w of api.L.walls || []) if (!w.broken && wallDist(w, p) < SENSE.R) { if (!(seen.get(w) > api.time)) { found++; stats.foundWalls++; } seen.set(w, until); }
    if (found) { stats.found += found; api.SFX.earthSense(); api.shakeCam(1); }
  }
  /* how far a wall's nearest edge is from her, in px */
  const wallDist = (w, p) => { const TS = api.TS, l = w.x0 * TS, r = (w.x1 + 1) * TS, t = w.y0 * TS, b = (w.y1 + 1) * TS, y = p.y - 6;
    return Math.hypot(p.x < l ? l - p.x : p.x > r ? p.x - r : 0, y < t ? t - y : y > b ? y - b : 0); };

  /* ---- THE DEATH KNIGHT: BLOOD HARVEST ---- */
  const bodyUnder = p => { let best = null, bd = 1e9; for (const b of api.bodies) { if (b.drained || !(b.life > 0)) continue; const dx = Math.abs(b.x - p.x), dy = b.y - p.y;
    if (dx <= HARVEST.reachX && dy >= -HARVEST.reachUp && dy <= HARVEST.reachDown && dx < bd) { bd = dx; best = b; } } return best; };
  function harvest(dt, p) {
    const b = p.ducking && !p.dead ? bodyUnder(p) : null;
    if (!b || (p.harvBody && p.harvBody !== b)) { if (p.harvT > 0.08 && p.harvBody && !p.harvBody.drained) stats.harvestBroken++; p.harvT = 0; p.harvBody = null;
      if (!p.ducking && !p.dead && api.bodies.some(q => !q.drained && q.life > 0 && Math.abs(q.x - p.x) < 60 && Math.abs(q.y - p.y) < 30)) teach('reaper');
      if (!b) return; }
    if (!p.harvBody) { p.harvBody = b; p.harvT = 0; api.SFX.bloodDraw(); }
    p.harvT += dt;
    if (Math.random() < dt * 40) { const k = Math.random(); addParts({ x: b.x + (Math.random() - 0.5) * 10, y: b.y - 2, vx: (p.x - b.x) * 2 + (Math.random() - 0.5) * 10, vy: -40 - k * 40, life: 0.4, max: 0.4, col: k < 0.5 ? '#c0283a' : '#ff4a5a', size: 1, grav: 60 }); }
    if (p.harvT >= HARVEST.time) {   /* DRAWN: the body gives up what it had, and is empty */
      b.drained = true; b.life = Math.min(b.life, 0.6); p.harvT = 0; p.harvBody = null;
      const hp0 = p.hp; p.hp = Math.min(p.maxHp, p.hp + HARVEST.hp); const got = p.hp - hp0;
      const was = (p.harvest || 0) >= 100; p.harvest = Math.min(100, (p.harvest || 0) + HARVEST.blood); if (!was && p.harvest >= 100) api.meterReady('#c0283a');
      stats.harvests++; stats.hpGiven += got; stats.bloodGiven += HARVEST.blood;
      api.SFX.bloodHarvest(); api.number(p.x, p.y - 24, got > 0 ? '+' + got : 'BLOOD', '#ff6b6b'); api.ringAt(b.x, b.y - 3, 12, '#c0283a', 0.3);
      api.burst(b.x, b.y - 3, 8, ['#c0283a', '#7a1020', '#ff4a5a'], 50, 0.45, -30, 1);
    }
  }

  /* EVERY FRAME, right after the duck is known (main.js updatePlayer) */
  function update(dt) {
    const p = P(), h = api.hero();
    for (const [k, t] of seen) if (t <= api.time || (k.alive === false) || k.broken || (k.alive !== undefined && !hiding(k))) seen.delete(k);   /* a creature that has come up is plain to see */
    if (h === 'paladin') kneel(dt, p); else if (h === 'geomancer') sense(dt, p); else if (h === 'reaper') harvest(dt, p);
  }
  /* HIS POSE while it works: [key, frame] or null (the plain crouch) */
  function pose(R) { const p = P(), h = api.hero(); if (!p.ducking) return null;
    if (h === 'paladin' && R.kneel && p.kneelT >= KNEEL.settle) return ['kneel', (p.light || 0) >= 100 ? 1 : Math.floor(api.time * 2.2) % 2];
    if (h === 'geomancer' && R.sense && p.senseT >= SENSE.settle) return ['sense', Math.floor(p.senseT * 3) % 2];
    if (h === 'reaper' && R.harvest && p.harvBody) return ['harvest', p.harvT > HARVEST.time * 0.5 ? 1 : 0];
    return null; }

  /* DRAWN (after the hero): his prayer's glow; what her sense has shown, outlined and pulsing; the draw going out of a body */
  function draw(g, cx, cy) {
    const p = P(), h = api.hero(), t = api.time;
    if (h === 'paladin' && p.ducking && p.kneelT >= KNEEL.settle) {   /* A SOFT GLOW round him, brighter as the light fills */
      const k = Math.min(1, (p.kneelT - KNEEL.settle) / 0.4), f = (p.light || 0) / 100, x = Math.round(p.x - cx), y = Math.round(p.y - cy);
      g.globalAlpha = k * (0.1 + 0.08 * f + 0.04 * Math.sin(t * 5)); g.fillStyle = '#fff6c8'; g.beginPath(); g.ellipse(x, y - 6, 12 + 2 * f, 10 + 2 * f, 0, Math.PI, 0); g.fill();
      g.globalAlpha = k * 0.35; g.fillStyle = '#ffd36b'; g.fillRect(x - 10, y, 21, 1);   /* the light pooled on the ground he kneels on */
      g.globalAlpha = 1; }
    if (seen.size) for (const [k, until] of seen) {   /* WHAT THE EARTH TOLD HER: an outline that pulses, fading in its last half second */
      const a = Math.min(1, (until - t) / 0.5) * (0.55 + 0.35 * Math.sin(t * 9)), TS = api.TS;
      let l, r, top, b; if (k.x0 !== undefined) { l = k.x0 * TS; r = (k.x1 + 1) * TS; top = k.y0 * TS; b = (k.y1 + 1) * TS; } else { const w = Math.max(8, k.w || 12), hh = Math.max(8, k.h || 12); l = k.x - w / 2 - 2; r = k.x + w / 2 + 2; top = k.y - hh - 2; b = k.y + 1; }
      l = Math.round(l - cx); r = Math.round(r - cx); top = Math.round(top - cy); b = Math.round(b - cy);
      g.globalAlpha = a; g.strokeStyle = '#e8a83a'; g.lineWidth = 1; g.strokeRect(l + 0.5, top + 0.5, r - l - 1, b - top - 1);
      g.fillStyle = '#ffc860'; for (const [qx, qy] of [[l, top], [r - 2, top], [l, b - 2], [r - 2, b - 2]]) g.fillRect(qx, qy, 2, 2);   /* the four corners picked out */
      g.globalAlpha = a * 0.18; g.fillStyle = '#e8a83a'; g.fillRect(l + 1, top + 1, r - l - 2, b - top - 2);
      g.globalAlpha = 1; }
    if (h === 'reaper' && p.harvBody) { const b = p.harvBody, k = Math.min(1, p.harvT / HARVEST.time), x = Math.round(b.x - cx), y = Math.round(b.y - cy) - 3;   /* the draw, filling round the body */
      g.globalAlpha = 0.8; g.strokeStyle = '#c0283a'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 7, -Math.PI / 2, -Math.PI / 2 + 6.283 * k); g.stroke(); g.globalAlpha = 1; }
  }
  function clear() { seen.clear(); taughtIn = null; calmT = 0; }
  /* FOR THE TOOLS (BK.crouchB) */
  const read = () => { const p = P(); return { hero: api.hero(), ducking: !!p.ducking, kneelT: p.kneelT || 0, praying: api.hero() === 'paladin' && !!p.ducking && (p.kneelT || 0) >= KNEEL.settle, light: p.light || 0,
    senseT: p.senseT || 0, seen: [...seen.keys()].map(k => k.x0 !== undefined ? { wall: true, x0: k.x0, y0: k.y0 } : { t: k.t, x: Math.round(k.x), y: Math.round(k.y), mode: k.mode }),
    harvT: p.harvT || 0, drawing: !!p.harvBody, bodies: api.bodies.filter(b => !b.drained && b.life > 0).map(b => ({ x: Math.round(b.x), y: Math.round(b.y), life: +b.life.toFixed(1) })), stats: { ...stats } }; };
  return { update, pose, draw, clear, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
