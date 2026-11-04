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
//   THE GEOMANCER - STONE SKIN (claude/geocrouch, Daniel 11-03; GEO.pop.skin, SKIN below): down 0.15 s and her mantle goes to stone - blows land at half (a boss's or a mini's three quarters), do not throw her and do not stand her up; the third cracks it and she stands, and it re-forms
//     3 s later; a RED blow breaks it at once and lands whole. Stamina comes back half as fast again while it holds. Release DOWN, X, C or a jump and it is gone. (EARTH SENSE, below, is kept behind GEO.pop.skin = false.)
//   THE GEOMANCER - EARTH SENSE (the old crouch; only with GEO.pop.skin false): down, and what hides in the ground near her SHOWS - a buried dead man, a sand-cloak under his
//     mound, a lurker, a pumpkin, an assassin in his shadow, a breakable wall - within SENSE.R px (eight tiles), outlined and
//     pulsing for as long as she stays down and SENSE.after s after. A pulse sounds when something new is found. No damage and
//     no waking: only knowing.
//   (claude/bloodknight, Daniel 10-17 crouch option 1: THE BLOOD KNIGHT's BLOOD HARVEST IS GONE - the dead linger as normal and his crouch is the low
//   block, with BLOOD SPIKE on the beat, src/main.js dkKneelTakes. What it was:) THE DEATH KNIGHT - BLOOD HARVEST: down over a body (the ones his kills leave lying, main.js leaveBody: a body lies 24 s), and
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
export const SKIN = { settle: 0.15, mulCommon: 0.5, mulBoss: 0.75, hp: 3, reform: 3.0, regenMul: 1.5 };   /* (claude/geocrouch) STONE SKIN: down this long before it sets; the blow's share taken (commons / bosses + minis); blows it holds before it cracks; s to re-form; the stamina regen multiplier while it holds */
export const SENSE = {
  R: 128,             // px from her: eight tiles (Daniel, 2026-09-30: was six, 96)
  after: 1.5,         // what she found stays outlined this long after she stands
  settle: 0.12,       // down this long before the earth answers (a duck under an arrow is not a look)
};
/* (claude/bloodknight) HARVEST is gone with the harvest (it was: 0.6 s over a body for 7 health and 12 blood) */
/* WHAT HIDES: a common foe in a mode that keeps it out of sight - under the dirt (the buried dead, the husk), under a mound (the sand
   goblin and the sand-cloak, whose state is e.st), shut or tucked away (the mimic's lid, the pumpkin, the feeler, the lurker, the
   chimney sweep gone up his flue), or in the shadows (the assassin, the gar under the water). Bosses keep their own tells */
const HIDE_MODES = { buried: 1, hide: 1, lurk: 1, shut: 1, under: 1 };
const HIDERS = new Set(['zombie', 'husk', 'pumpkin', 'feeler', 'lurker', 'sweep', 'assassin', 'gar', 'mimic', 'sandgob', 'ambusher']);
export const hiding = e => !!(e && e.alive && !e.maxHp && !e.mini && HIDERS.has(e.t) && (HIDE_MODES[e.mode] || (e.st && HIDE_MODES[e.st.mode]) || (e.gone || 0) > 0.5));
const TEACH = {
  paladin: ['kneelTold', 'PRAYER: HOLD DOWN AND STAY STILL. CONVICTION COMES - THREE TIMES AS FAST BY A SHRINE OR A FLAME.'],
  geomancer: ['senseTold', 'EARTH SENSE: HOLD DOWN, AND WHAT HIDES IN THE GROUND NEAR YOU SHOWS ITSELF.'],
};

export function makeCrouchB(api) {
  const stats = { skins: 0, skinDrops: 0, glances: 0, cracks: 0, breaks: 0, absorbed: 0, kneelT: 0, lightGiven: 0, senses: 0, found: 0, foundFoes: 0, foundWalls: 0, harvests: 0, hpGiven: 0, bloodGiven: 0, harvestBroken: 0 };
  const P = () => api.P;
  const seen = new Map();   /* what earth sense has shown: a creature or a wall -> the time it stops showing */
  let taughtIn = null, calmT = 0;
  const skinOn = () => !!(api.skinOn ? api.skinOn() : false);
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

  /* EVERY FRAME, right after the duck is known (main.js updatePlayer) */
  function update(dt) {
    const p = P(), h = api.hero();
    for (const [k, t] of seen) if (t <= api.time || (k.alive === false) || k.broken || (k.alive !== undefined && !hiding(k))) seen.delete(k);   /* a creature that has come up is plain to see */
    if (h === 'paladin') kneel(dt, p); else if (h === 'geomancer') { if (skinOn()) skin(dt, p); else { skinOff(p); sense(dt, p); } } else skinOff(p);
  }
  /* ---- THE GEOMANCER: STONE SKIN ---- */
  function skinOff(p) { p.skinUp = false; p.skinRegen = 1; }
  function skin(dt, p) {
    if ((p.skinReformT || 0) > 0) p.skinReformT = Math.max(0, p.skinReformT - dt);
    if (!p.ducking || p.dead) { if (p.skinUp) { p.skinUp = false; stats.skinDrops++; api.dust(p.x, p.y, 3); } p.skinT = 0; p.skinRegen = 1;
      if (!(p.skinHits > 0) || api.time - (p.skinHitAt ?? -99) > SKIN.reform) p.skinHits = 0;   /* a skin let go of is not a fresh one: its blows are still counted for SKIN.reform s */
      return; }
    const was = p.skinT || 0; p.skinT = was + dt;
    if ((p.skinReformT || 0) > 0 || p.skinT < SKIN.settle) { p.skinUp = false; p.skinRegen = 1; return; }
    if (!p.skinUp) { p.skinUp = true; if (!(p.skinHits > 0) || api.time - (p.skinHitAt ?? -99) > SKIN.reform) p.skinHits = 0; stats.skins++;   /* SETTLES: a grey ripple, grit, a low thrum */
      api.ringAt(p.x, p.y - 6, 13, '#b9b6a4', 0.3); api.ringAt(p.x, p.y - 1, 18, '#5f5d54', 0.24); api.dust(p.x - 6, p.y, 2); api.dust(p.x + 6, p.y, 2); api.SFX.geoSkinSet && api.SFX.geoSkinSet(); }
    p.skinRegen = SKIN.regenMul; }
  /* A BLOW ON THE SKIN (main.js damagePlayer0, after the duck let a high blow go over): null = no skin, else { mul, noKnock, stay }.
     YELLOW: lands x mulCommon (x mulBoss from a boss or a mini), no knock-back, she is NOT stood up (stay) - until the SKIN.hp-th, which cracks it (she stands, it re-forms in SKIN.reform s).
     RED (unblockable): full damage, thrown as ever, and the skin breaks at once. Hazards (pct) and a skin not yet set are not its business. */
  function takes(fromX, dmg, o = {}) {
    const p = P(); if (api.hero() !== 'geomancer' || !skinOn() || !p.skinUp || !p.ducking || p.dead || o.pct > 0) return null;
    const src = o.src, big = !!(src && (src.maxHp || src.mini || src.xpRole === 'mini')), x = p.x, y = p.y;
    const shards = n => { api.burst(x, y - 7, n, ['#b9b6a4', '#8c8a7e', '#5f5d54', '#ffb23a'], 80, 0.45, 300); };
    p.skinHitAt = api.time;
    if (o.unblockable) { p.skinUp = false; p.skinReformT = SKIN.reform; p.skinHits = 0; stats.breaks++; shards(6); api.number(x, y - 26, 'SKIN BROKEN', '#ff6b6b'); api.SFX.geoSkinCrack && api.SFX.geoSkinCrack(); return { mul: 1, noKnock: false, stay: false }; }
    const mul = big ? SKIN.mulBoss : SKIN.mulCommon; p.skinHits = (p.skinHits || 0) + 1; stats.glances++; stats.absorbed += Math.max(0, dmg - Math.max(1, Math.round(dmg * mul)));
    if (p.skinHits >= SKIN.hp) { p.skinUp = false; p.skinReformT = SKIN.reform; p.skinHits = 0; stats.cracks++; shards(4); api.number(x, y - 26, 'CRACKED', '#ffb23a'); api.ringAt(x, y - 6, 16, '#ffb23a', 0.3); api.SFX.geoSkinCrack && api.SFX.geoSkinCrack(); api.shakeCam(2, 0); return { mul, noKnock: true, stay: false }; }
    shards(3); api.number(x, y - 26, 'GLANCE', '#b9b6a4'); api.ringAt(x + Math.sign(fromX - x) * 6, y - 7, 8, '#fff0c0', 0.16); api.SFX.geoGlance && api.SFX.geoGlance();
    return { mul, noKnock: true, stay: true }; }
  /* HIS POSE while it works: [key, frame] or null (the plain crouch) */
  function pose(R) { const p = P(), h = api.hero(); if (!p.ducking) return null;
    if (h === 'paladin' && R.pray && p.kneelT >= KNEEL.settle) return ['pray', (p.light || 0) >= 100 ? 1 : Math.floor(api.time * 2.2) % 2];   /* (claude/paladin4art) PRAYER's own pose: both hands clasped on the haft, a halo over the bowed helm */
    if (h === 'paladin' && R.kneel && p.kneelT >= KNEEL.settle) return ['kneel', (p.light || 0) >= 100 ? 1 : Math.floor(api.time * 2.2) % 2];
    if (h === 'geomancer' && skinOn() && R.gSkin && p.skinUp) return ['gSkin', Math.floor(api.time * 2) % 2];   /* (claude/geocrouch) STONE SKIN's own pose: the mantle gone to stone, the staff planted */
    if (h === 'geomancer' && !skinOn() && R.sense && p.senseT >= SENSE.settle) return ['sense', Math.floor(p.senseT * 3) % 2];
    if (h === 'reaper' && R.price && api.time - (p.bkPriceAt ?? -9) < 0.5) { const el = api.time - p.bkPriceAt; return ['price', el < 0.14 ? 0 : el < 0.3 ? 1 : 2]; }   /* (claude/bloodknightart) BLOOD PRICE's own pose: the palm drawn along the blade, the blood running, the blade soaked */
    if (h === 'reaper' && R.bloodSpike && api.time - (p.bkSpikeAt ?? -9) < 0.42) { const el = api.time - p.bkSpikeAt; return ['bloodSpike', Math.min(R.bloodSpike.length - 1, el < 0.1 ? 0 : el < 0.26 ? 1 : 2)]; }   /* (claude/bloodknight) BLOOD SPIKE's own pose; (claude/bkkit2) three beats held 0.42 s (BLOOD.spike.pose): the spikes short, full, and the blade wrenched up out of them as they crumble */
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
    if (h === 'geomancer' && skinOn() && !p.dead && p.ducking) {   /* STONE SKIN, DRAWN over the pose: the cracks it has taken (one amber seam per blow), and while it re-forms a grey bar filling under her */
      const f = p.face || 1, X = Math.round(p.x - cx), Y = Math.round(p.y - cy), at = (dx, dy, w = 1, hh = 1) => g.fillRect(X + (f > 0 ? dx : -dx - w + 1), Y + dy, w, hh);
      if (p.skinUp) { const n = Math.min(3, p.skinHits || 0), pulse = 0.7 + 0.3 * Math.sin(t * 6);
        g.globalAlpha = 0.16; g.fillStyle = '#b9b6a4'; at(-6, -12, 12, 11); g.globalAlpha = 1;
        for (let i = 0; i < n; i++) { g.globalAlpha = pulse; g.fillStyle = '#ffb23a'; const S = [[[-5, -9], [-4, -8], [-4, -7], [-3, -6]], [[-1, -12], [0, -11], [0, -10], [1, -9]], [[2, -7], [1, -6], [2, -5], [3, -4]]][i]; for (const [dx, dy] of S) at(dx, dy); g.fillStyle = '#5f5d54'; at(S[0][0] - 1, S[0][1]); g.globalAlpha = 1; } }
      else if ((p.skinReformT || 0) > 0) { const k = 1 - p.skinReformT / SKIN.reform; g.globalAlpha = 0.7; g.fillStyle = 'rgba(14,12,8,0.75)'; g.fillRect(X - 7, Y + 3, 14, 3); g.fillStyle = '#8c8a7e'; g.fillRect(X - 6, Y + 4, Math.round(12 * k), 1); g.globalAlpha = 1; } }
    if (seen.size) for (const [k, until] of seen) {   /* WHAT THE EARTH TOLD HER: an outline that pulses, fading in its last half second */
      const a = Math.min(1, (until - t) / 0.5) * (0.55 + 0.35 * Math.sin(t * 9)), TS = api.TS;
      let l, r, top, b; if (k.x0 !== undefined) { l = k.x0 * TS; r = (k.x1 + 1) * TS; top = k.y0 * TS; b = (k.y1 + 1) * TS; } else { const w = Math.max(8, k.w || 12), hh = Math.max(8, k.h || 12); l = k.x - w / 2 - 2; r = k.x + w / 2 + 2; top = k.y - hh - 2; b = k.y + 1; }
      l = Math.round(l - cx); r = Math.round(r - cx); top = Math.round(top - cy); b = Math.round(b - cy);
      g.globalAlpha = a; g.strokeStyle = '#e8a83a'; g.lineWidth = 1; g.strokeRect(l + 0.5, top + 0.5, r - l - 1, b - top - 1);
      g.fillStyle = '#ffc860'; for (const [qx, qy] of [[l, top], [r - 2, top], [l, b - 2], [r - 2, b - 2]]) g.fillRect(qx, qy, 2, 2);   /* the four corners picked out */
      g.globalAlpha = a * 0.18; g.fillStyle = '#e8a83a'; g.fillRect(l + 1, top + 1, r - l - 2, b - top - 2);
      g.globalAlpha = 1; }
  }
  function clear() { seen.clear(); { const p = P(); p.skinUp = false; p.skinReformT = 0; p.skinHits = 0; p.skinT = 0; p.skinRegen = 1; } P().holyLight = null; taughtIn = null; calmT = 0; }
  /* FOR THE TOOLS (BK.crouchB) */
  const read = () => { const p = P(); return { hero: api.hero(), ducking: !!p.ducking, holy: p.holyLight ? { kind: p.holyLight.kind, x: Math.round(p.holyLight.x), y: Math.round(p.holyLight.y) } : null, holyCount: holyLights().length, kneelT: p.kneelT || 0, praying: api.hero() === 'paladin' && !!p.ducking && (p.kneelT || 0) >= KNEEL.settle, holyPray: !!p.holyLight, light: p.light || 0,
    senseT: p.senseT || 0, skin: { on: skinOn(), up: !!p.skinUp, t: p.skinT || 0, hits: p.skinHits || 0, reform: p.skinReformT || 0, regen: p.skinRegen || 1 }, seen: [...seen.keys()].map(k => k.x0 !== undefined ? { wall: true, x0: k.x0, y0: k.y0 } : { t: k.t, x: Math.round(k.x), y: Math.round(k.y), mode: k.mode }),
    lights: holyLights().filter(l => Math.abs(l.x - p.x) < 200 && Math.abs(l.y - p.y) < HOLY.dy).map(l => ({ kind: l.kind, x: Math.round(l.x), y: Math.round(l.y) })),
    harvT: p.harvT || 0, drawing: !!p.harvBody, bodies: api.bodies.filter(b => !b.drained && b.life > 0).map(b => ({ x: Math.round(b.x), y: Math.round(b.y), life: +b.life.toFixed(1) })), stats: { ...stats } }; };
  return { update, pose, draw, clear, read, takes, resetStats: () => { for (const k in stats) stats[k] = 0; } };
}
