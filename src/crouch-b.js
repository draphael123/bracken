// src/crouch-b.js — PER-HERO CROUCH TWISTS, PART B (claude/crouchb, Daniel approved the CROUCH PLAN, 2026-09-29): the PALADIN,
// the GEOMANCER and the DEATH KNIGHT. One module for the three because they share their shape: each is the universal duck
// (src/duck.js - DOWN held on the ground, stood still: the hurt box drops to DUCK_H and a high blow goes over) with something
// more while the hero stays down, and each leaves him EXPOSED - a duck is no guard (P.ducking is false while he blocks), so a
// low blow finds him and a hit (P.hurt) stands him up and breaks it off.
//   THE PALADIN - KNEEL IN PRAYER, AT A HOLY LIGHT (claude/crouchfix, Daniel 10-11: kneeling anywhere was a chore between fights): down and
//     still for KNEEL.settle s WITHIN HOLY.R px (two tiles) OF A HOLY LIGHT, and his LIGHT fills KNEEL.rate a second (empty to full in
//     about three and a half seconds, a soft gold glow and a chant while it does). Anywhere else the kneel is the plain duck: no prayer,
//     no glow, no chant. WHICH LIGHTS COUNT is one table, HOLY, below: a shrine, a lit brazier, a candle or candelabra, the grand candle,
//     and whatever api.extraHoly() adds (the Lit Church's lit lamps and its votive stands, so the sanctuary's lamps feed his Light too -
//     LIT CHURCH 2 hooks in there). The light he is near glows and pulses gold (stronger while he kneels); the chant and the pooled
//     gold are only for a prayer that is filling. It is the whole bar of JUDGEMENT on his knees with no guard - bought between fights.
//   THE GEOMANCER - EARTH SENSE: down, and what hides in the ground near her SHOWS - a buried dead man, a sand-cloak under his
//     mound, a lurker, a pumpkin, an assassin in his shadow, a breakable wall - within SENSE.R px (eight tiles), outlined and
//     pulsing for as long as she stays down and SENSE.after s after. A pulse sounds when something new is found. No damage and
//     no waking: only knowing.
//   THE DEATH KNIGHT - BLOOD HARVEST: down over a body (the ones his kills leave lying, main.js leaveBody: a body lies 24 s), and
//     after HARVEST.time s he draws HARVEST.hp health and HARVEST.blood BLOOD (his harvest bar) out of it. A body gives once.
//     Red motes run from it into him while he draws, a wet sound, and a gulp at the end.
// Every other hero is untouched (the ember ward is the pyromancer's, src/ember-ward.js). main.js binds it (makeCrouchB) and calls:
// update (in updatePlayer, right after P.ducking is set), pose (the hero's pose pick), draw (after the hero), clear (a level
// load). State lives on the hero (P.kneel*, P.sense*, P.harv*), so a co-op second hero carries his own; the reveal list is the
// level's. BK.crouchB() reads it for tools/crouch-b.mjs and the bot (src/lab.js crouchBPlan).
/* (PALADIN 4, Daniel 10-15 ~17:20) PRAYER: he kneels ANYWHERE now - after HG.pray.settle s down and still, +1 CONVICTION pip every HG.pray.every s, HG.pray.holyMul
   times as fast BY A HOLY LIGHT (the table below). A hit, a step or a swing breaks it (the duck's own rules: P.ducking). Was: only by a holy light, 30 Light a second */
export const KNEEL = {
  settle: HG.pray.settle,                    // down and still this long before the prayer takes
  rate: HG.conv.pip / HG.pray.every,         // LIGHT a second while he prays anywhere (a pip every 2.5 s); x HG.pray.holyMul by a holy light
  chantEvery: 0.9,    // the chant's beat
};
/* WHAT IS A HOLY LIGHT (claude/crouchfix): the one table. R: how near he must be (px, 2 tiles; |dy| up to dy). shrines: any shrine that is not broken.
   props: prop type -> is it burning. deco: the dressing kinds that are a flame (the church's and the keeps' candles). The Lit Church's lit lamps
   and sources come in through api.extraHoly() ([{ x, y }] in world px, the light's foot) */
import { HG } from './holy-ground.js';
export const HOLY = {
  R: 32, dy: 36,
  shrines: true,
  props: { brazier: p => p.lit !== false && !p.tipped, grancandle: p => !p.fallen },
  deco: new Set(['candelabra', 'candle']),
};
export const SENSE = {
  R: 128,             // px from her: eight tiles (Daniel, 2026-09-30: was six, 96)
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
  paladin: ['kneelTold', 'PRAYER: HOLD DOWN AND STAY STILL. CONVICTION COMES - THREE TIMES AS FAST BY A SHRINE OR A FLAME.'],
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
  /* ALL THE HOLY LIGHTS IN THE LEVEL, as [{ x, y, kind }] (x centre, y the foot) - read from the world every call, so a lamp lit or a brazier tipped counts at once */
  function holyLights() { const out = [];
    if (HOLY.shrines) for (const s of api.shrines()) if (!s.broken) out.push({ x: s.x, y: s.y, kind: 'shrine' });
    for (const q of api.props()) { const ok = HOLY.props[q.t]; if (ok && ok(q)) out.push({ x: q.x, y: q.y, kind: q.t }); }
    for (const d of api.deco()) if (HOLY.deco.has(d.kind) && d.c) out.push({ x: d.x + d.c.width / 2, y: d.y + d.c.height, kind: d.kind });
    for (const x of (api.extraHoly ? api.extraHoly() : [])) out.push({ x: x.x, y: x.y, kind: 'lamp' });
    return out; }
  /* THE NEAREST HOLY LIGHT WITHIN REACH of the hero, or null */
  function holyNear(p) { let best = null, bd = 1e9; for (const l of holyLights()) { const dx = Math.abs(l.x - p.x); if (dx <= HOLY.R && Math.abs(l.y - p.y) <= HOLY.dy && dx < bd) { bd = dx; best = l; } } return best; }
  const foesNear = (p, r) => api.enemies.some(e => e.alive && !e.harmless && !hiding(e) && Math.abs(e.x - p.x) < r && Math.abs(e.y - p.y) < 80);

  /* ---- THE PALADIN: KNEEL IN PRAYER ---- */
  function kneel(dt, p) {
    const light = p.light || 0, hl = p.dead ? null : holyNear(p); p.holyLight = hl;
    if (!p.ducking) { if (p.kneelT > KNEEL.settle) api.SFX.kneelRise && api.SFX.kneelRise(); p.kneelT = 0; p.chantT = 0;
      /* THE TEACH: his Conviction is low, nothing hostile is near, and he is stood still a moment - the first time, say what kneeling does */
      calmT = !p.ducking && light < 40 && p.ground && !p.dead && Math.abs(p.vx || 0) < 5 && !foesNear(p, 200) ? calmT + dt : 0; if (calmT > 1.5) teach('paladin'); return; }
    const was = p.kneelT || 0; p.kneelT = was + dt; calmT = 0;
    if (p.kneelT < KNEEL.settle) return;
    if (was < KNEEL.settle) { stats.prayers = (stats.prayers || 0) + 1; api.number(p.x, p.y - 26, 'PRAY', '#fff6c8'); api.ringAt(p.x, p.y - 8, 14, '#fff6c8', 0.3); }
    if (light < 100) {
      const add = Math.min(100 - light, KNEEL.rate * (hl ? HG.pray.holyMul : 1) * dt), pip0 = Math.floor(light / HG.conv.pip + 1e-6); p.light = light + add; stats.lightGiven += add; stats.kneelT += dt;
      if (Math.floor(p.light / HG.conv.pip + 1e-6) > pip0) { stats.pips = (stats.pips || 0) + 1; if (api.prayPip) api.prayPip(p); }
      if (p.light >= 100) api.lightReady();
      p.chantT = (p.chantT || 0) - dt; if (p.chantT <= 0) { p.chantT = KNEEL.chantEvery; api.SFX.kneelChant(p.light / 100); }
      if (Math.random() < dt * (hl ? 14 : 7)) addParts({ x: p.x + (Math.random() - 0.5) * 18, y: p.y - 2 - Math.random() * 6, vx: (Math.random() - 0.5) * 6, vy: -16 - Math.random() * 18, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? '#fff6c8' : '#ffd36b', size: 1, grav: -6, glow: true });
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
    if (h === 'reaper' && R.graveKneel) return ['graveKneel', api.time - (p.dkKneelHit ?? -9) < 0.24 ? 2 : Math.floor(api.time * 1.6) % 2];   /* (claude/dk2art: the third beat - a low blow turned on the blade) */   /* (claude/dk2b) GRAVE KNEEL: the blade planted point-down in front of him (src/dk2.js) */
    return null; }

  /* DRAWN (after the hero): his prayer's glow; what her sense has shown, outlined and pulsing; the draw going out of a body */
  function draw(g, cx, cy) {
    const p = P(), h = api.hero(), t = api.time;
    if (h === 'paladin' && p.holyLight && !p.dead) {   /* THE LIGHT HE IS NEAR glows and pulses gold: faintly as he walks up, strongly while he kneels, a thread to him while the prayer fills */
      const l = p.holyLight, x = Math.round(l.x - cx), y = Math.round(l.y - cy) - 8, kn = p.ducking ? 1 : 0, filling = kn && p.kneelT >= KNEEL.settle && (p.light || 0) < 100;
      const pulse = 0.5 + 0.5 * Math.sin(t * (filling ? 7 : 4)), R = 9 + 4 * pulse + (kn ? 3 : 0);
      g.globalAlpha = (kn ? 0.22 : 0.11) + 0.1 * pulse; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
      g.globalAlpha = (kn ? 0.5 : 0.25) * (0.6 + 0.4 * pulse); g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(x, y, Math.max(2, R * 0.4), 0, Math.PI * 2); g.fill();
      if (filling) { g.globalAlpha = 0.5; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(Math.round(p.x - cx), Math.round(p.y - cy) - 8); g.stroke(); }   /* the light drawn across to him */
      g.globalAlpha = 1; }
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
  function clear() { seen.clear(); P().holyLight = null; taughtIn = null; calmT = 0; }
  /* FOR THE TOOLS (BK.crouchB) */
  const read = () => { const p = P(); return { hero: api.hero(), ducking: !!p.ducking, holy: p.holyLight ? { kind: p.holyLight.kind, x: Math.round(p.holyLight.x), y: Math.round(p.holyLight.y) } : null, holyCount: holyLights().length, kneelT: p.kneelT || 0, praying: api.hero() === 'paladin' && !!p.ducking && (p.kneelT || 0) >= KNEEL.settle, holyPray: !!p.holyLight, light: p.light || 0,
    senseT: p.senseT || 0, seen: [...seen.keys()].map(k => k.x0 !== undefined ? { wall: true, x0: k.x0, y0: k.y0 } : { t: k.t, x: Math.round(k.x), y: Math.round(k.y), mode: k.mode }),
    lights: holyLights().filter(l => Math.abs(l.x - p.x) < 200 && Math.abs(l.y - p.y) < HOLY.dy).map(l => ({ kind: l.kind, x: Math.round(l.x), y: Math.round(l.y) })),
    harvT: p.harvT || 0, drawing: !!p.harvBody, bodies: api.bodies.filter(b => !b.drained && b.life > 0).map(b => ({ x: Math.round(b.x), y: Math.round(b.y), life: +b.life.toFixed(1) })), stats: { ...stats } }; };
  return { update, pose, draw, clear, read, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
