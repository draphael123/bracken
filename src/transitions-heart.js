/* src/transitions-heart.js - THE PICTURES OF THE HEART'S TWO SCENES (lane SC SCENES, claude/scenes). ART ONLY: the timing, cues and positions are src/heart-scenes.js's (pure); the flow is main.js's.
   Both draw the whole screen (the letterbox bars and the skip hint are the shared overlay's) from pieces other lanes drew:
     drawSealScene(env, s)   SCENE A "THE SEAL BREAKS": the caldera floor, the split seal (fire_drake_set), the drake lying on it (fire_drake_art 'down' -> 'rise' -> 'walk' -> 'takeoff' -> 'hover'),
                             the white light column + the eruption plume (sky_layers_art sealLight / plume), a column of black fire, the DEMON KING half-formed (demon_king_art phase 1) rising out of it and up
                             the throat, the party climbing on, the drake lifting off.
     drawEscapeScene(env, s) SCENE B "THE ESCAPE": the sky over the erupting volcano (sky_layers_art, the 'ash' altitude), the drake's back (sky_mount_art, the real mount), the King knocked down on its neck,
                             the party running up the back, the drake's blast, the King's smoke wings + laugh + dive, the crater cracking open (breachCrack), the rim rising to meet the landing
                             (rimLanding), the party stepping off, THE BREACH card.
   env: { g, VW, VH, time, n, reduce, drawHero(i, x, feetY, face, key, frame), text(str, x, y, col, align, size) }. Reduce-motion (env.reduce): no shake, no flash, no flicker, a calm single dip. No hash/random: every wobble is
   a function of s or time, so a frame is reproducible (the shots tool relies on it). The bars cover 22 px top and bottom: the picture keeps its subject inside 24..156. */
import * as HS from './heart-scenes.js';
import * as SL from './redraw/sky_layers_art.js';
import * as DA from './redraw/fire_drake_art.js';
import * as DSET from './redraw/fire_drake_set.js';
import * as KA from './redraw/demon_king_art.js';
import { POSE as DRAKE_POSE } from './fire-drake.js';
import { drawDrake as paintDrake } from './sky-mount-draw.js';
import { newBack, SKY, layerShift } from './sky-mount.js';
import { canvas, circle, line } from './px.js';

const clamp01 = v => Math.max(0, Math.min(1, v));
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, k) => a + (b - a) * k;
const R = Math.round;
const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, c, x, y) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const hash = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
let bad = null;   /* a sprite that throws once is not retried every frame: the scene falls back to flat shapes and says so on the console once */
const safe = (what, fn) => { if (bad) return; try { fn(); } catch (e) { bad = what; if (typeof console !== 'undefined') console.warn('heart scene art failed (' + what + '):', e && e.message); } };

/* blit a sprite { c } by its anchor (ax, ay) at (x, y), facing right unless flip */
function blit(g, c, ax, ay, x, y, flip, alpha = 1) {
  g.save(); if (alpha < 1) g.globalAlpha = alpha; g.translate(R(x), R(y)); if (flip) g.scale(-1, 1); g.drawImage(c, -ax, -ay); g.restore();
}
const fadeIn = (g, VW, VH, s, T = 0.45) => { const a = s < T ? 1 - s / T : 0; if (a > 0) { g.fillStyle = 'rgba(8,6,14,' + (a * a).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); } };

/* ------------------------------------------------------------------ SCENE A: THE SEAL BREAKS */
/* the caldera: baked once per size - a dark red sky with the throat's ring of rim, the far crater walls, the basalt floor with ember cracks */
function calderaBack(VW, VH, fy) {
  return once('cal|' + VW + 'x' + VH, () => {
    const [c, g] = canvas(VW, VH);
    const sky = g.createLinearGradient(0, 0, 0, fy); sky.addColorStop(0, '#14080e'); sky.addColorStop(0.55, '#2a0e12'); sky.addColorStop(1, '#5a1c10'); g.fillStyle = sky; g.fillRect(0, 0, VW, VH);
    /* the far walls of the caldera: two ridges of black rock, a lava thread along the lower one */
    for (const [base, amp, col, rimc] of [[fy - 50, 16, '#1a0c10', null], [fy - 26, 12, '#120a0e', '#8a2a14']]) {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, fy);
      for (let x = 0; x <= VW; x += 4) g.lineTo(x, base - Math.abs(Math.sin(x * 0.031 + base)) * amp - Math.sin(x * 0.11) * 3 - (x > VW * 0.30 && x < VW * 0.70 ? 8 : 0));
      g.lineTo(VW, fy); g.fill();
      if (rimc) for (let x = 0; x <= VW; x += 4) if (hash(x + base) < 0.45) dot(g, rimc, x, base - Math.abs(Math.sin(x * 0.031 + base)) * amp - Math.sin(x * 0.11) * 3 - (x > VW * 0.30 && x < VW * 0.70 ? 8 : 0) + 1);
    }
    /* the floor: basalt, a lit lip, ember cracks */
    const fl = g.createLinearGradient(0, fy, 0, VH); fl.addColorStop(0, '#2a1a1c'); fl.addColorStop(1, '#0e0709'); g.fillStyle = fl; g.fillRect(0, fy, VW, VH - fy);
    rect(g, '#5a3a34', 0, fy, VW, 1); rect(g, '#3a2424', 0, fy + 1, VW, 1);
    for (let i = 0; i < 46; i++) { const x = hash(i + 3) * VW, y = fy + 3 + hash(i + 9) * (VH - fy - 4); rect(g, i % 4 ? '#190f12' : '#3e2a2a', x, y, 2 + (i % 4), 1); }
    for (let i = 0; i < 9; i++) { let x = hash(i + 41) * VW, y = fy + 4 + hash(i + 51) * 12; for (let k = 0; k < 9; k++) { dot(g, k % 3 ? '#a8301a' : '#ff7a2a', x, y); x += hash(i * 9 + k) < 0.5 ? 1 : -1; y += hash(i * 5 + k) < 0.4 ? 1 : 0; x += 1; } }
    return c;
  });
}
/* BLACK FIRE: dark billows with ember edges rising from (x, y) to k * h, width w, drawn at alpha a - a low cloud the King steps out of (behind him) and a thin puff in front of his smoke */
function blackFire(g, x, y, h, w, k, time, reduce, a = 1) {
  if (k <= 0.01) return;
  g.globalAlpha = a;
  for (let i = 0; i < 26; i++) {
    const t = ((reduce ? 0 : time * 0.45) + i / 26) % 1, up = t * h * k, r = 2 + (1 - Math.abs(t - 0.4)) * 4 * (w / 24), px_ = x + Math.sin(i * 2.3 + (reduce ? 0 : time * 1.3)) * (w * 0.45) * (0.4 + t);
    circle(g, px_, y - up, r, i % 3 ? '#0c0509' : '#1a0c14', '#050204'); if (i % 4 === 0) circle(g, px_ - r * 0.3, y - up - r * 0.3, r * 0.45, '#2a1420');
    if (i % 5 === 0) dot(g, '#ff7a2a', px_ + r, y - up); if (i % 7 === 0) dot(g, '#ffb04a', px_ - r, y - up + 1);
  }
  g.globalAlpha = 1;
}
export function drawSealScene(env, s) {
  const { g, VW, VH, time, n, reduce } = env, fy = R(VH * 0.78), sealX = R(VW * HS.SEAL.layout.seal), drakeX = R(VW * HS.SEAL.layout.drake), calm = !!reduce;
  const shk = HS.shakeA(s, calm), sx = shk ? R(Math.sin(time * 61) * shk) : 0, sy2 = shk ? R(Math.cos(time * 47) * shk * 0.6) : 0;
  g.save(); g.translate(sx, sy2);
  g.drawImage(calderaBack(VW, VH, fy), 0, 0);
  /* the eruption: the sky behind the throat goes orange, the plume stands over the rim */
  const ek = HS.sealEruptK(s);
  if (ek > 0.01) { g.fillStyle = 'rgba(255,110,40,' + (0.30 * ek).toFixed(3) + ')'; g.fillRect(0, 0, VW, fy); safe('plume', () => SL.plume(g, R(VW * 0.5), R(VH * 0.50), 0.7 + 0.8 * ek, time)); }
  /* the split seal and the light through it */
  const lk = HS.sealLightK(s), glow = s > HS.SEAL.lightAt;
  safe('seal', () => { const sp = DSET.sealSprite(3, glow); g.drawImage(sp, sealX - 42, fy - 10); });
  if (lk > 0.01) safe('light', () => SL.sealLight(g, sealX, fy + 2, fy - 8, lk, calm ? 0.5 : time));
  const fk = HS.sealFireK(s) * (1 - smooth((s - HS.SEAL.kingAt - 2.4) / 2) * 0.55);
  blackFire(g, sealX, fy + 3, 34, 26, fk, time, calm, 0.8);
  /* the drake, lying on the seal's right edge, then up, then away */
  const dm = HS.drakePoseA(s), lift = HS.drakeLiftA(s);
  safe('drake', () => { const sp = DA.drakeSprite(dm, DRAKE_POSE[dm] || DRAKE_POSE.walk, time, false), A = DA.DRAKE_ANCHOR; blit(g, sp.c, A.ax, A.ay, drakeX, fy + 6 - lift, false); });
  /* the King: half-formed, up out of the seal and on up the throat (his smoke tail IS his legs: the thin puff of fire stands in front of its root) */
  const rk = HS.kingRiseK(s);
  if (rk > 0.001 && rk < 0.999) safe('king', () => {
    const pose = HS.kingPoseA(s), spec = pose === 'laugh' ? { body: 'float', arm: 'spread', scream: true, ph: 1, frame: Math.floor(time * 3) % 2 } : { body: 'rise', arm: 'down', ph: 1, frame: Math.floor(time * 3) % 2 };
    const k = KA.kingSprite(spec), A = KA.KING_ANCHOR, ky = HS.kingYA(s, fy);
    g.globalAlpha = clamp01(rk * 6) * 0.55; g.drawImage(KA.kingHalo ? KA.kingHalo(k) : k.c, R(sealX - A.ax), R(ky - A.ay)); g.globalAlpha = 1; blit(g, k.c, k.ax, k.ay, sealX, ky, false); });
  blackFire(g, sealX + 2, fy + 5, 10, 22, fk, time + 3, calm, 0.9);
  /* the party */
  for (let i = 0; i < n; i++) { const h = HS.heroA(i, n, s, VW); env.drawHero(i, R(h.x), R(fy + 6 - h.y), 1, h.walking ? 'run' : 'idle', h.walking ? Math.floor(time * 12) + i * 2 : Math.floor(time * 4.5) + i); }
  /* embers off the floor, more after the break */
  { const cnt = 8 + R(24 * clamp01((s - HS.SEAL.lightAt) / 2)); for (let i = 0; i < cnt; i++) { const t = (((calm ? 0 : time) * (0.12 + hash(i + 1) * 0.18)) + hash(i + 5)) % 1; dot(g, i % 3 ? '#ff7a2a' : '#ffe08a', hash(i + 7) * VW + Math.sin(i + t * 6) * 4, fy - t * (fy - 10)); } }
  g.restore();
  /* the break itself: a white flash (reduce-motion: a gentle brightening, no strobe) */
  { const f = calm ? 0.18 * smooth(1 - Math.abs(s - HS.SEAL.lightAt - 0.3) / 1.2) : Math.max(0, 1 - Math.abs(s - HS.SEAL.lightAt - 0.15) / 0.28) * 0.75; if (f > 0.01) { g.fillStyle = 'rgba(255,248,224,' + f.toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); } }
  fadeIn(g, VW, VH, s);
}

/* ------------------------------------------------------------------ SCENE B: THE ESCAPE */
const BACK_Y = 112;   /* the drake's back line while it flies level (screen px) */
let bb = null;   /* the one back the scene draws (reset at the start of each watch) */
function backFor(s) {
  if (!bb || s < 0.05) bb = newBack({ x0: HS.ESCAPE.backX0, y: BACK_Y, len: 192, phase: 3 }, () => 0.5);
  return bb;
}
/* the near cone with its crater mouth at (cx, my); k = the crack: violet-black CORRUPTION pours down the flank from the mouth */
function volcano(g, VH, cx, my, k) {
  const W = 150;
  g.fillStyle = '#1a0e12'; g.beginPath(); g.moveTo(cx - W, VH + 70); g.lineTo(cx - 34, my + 2); g.lineTo(cx + 34, my + 2); g.lineTo(cx + W, VH + 70); g.fill();
  g.fillStyle = '#2c1a1c'; g.beginPath(); g.moveTo(cx - W + 24, VH + 70); g.lineTo(cx - 34, my + 2); g.lineTo(cx - 22, my + 2); g.lineTo(cx - W + 60, VH + 70); g.fill();
  for (let i = 0; i < 6; i++) line(g, cx - 30 + i * 12, my + 4, R(lerp(cx - 30, cx - W + 40, (i + 0.5) / 6) + (i - 2) * 6), VH + 60, i % 2 ? '#7a2a14' : '#a8401a');
  rect(g, '#3a2020', cx - 34, my, 68, 2);
  rect(g, '#ff5a1a', cx - 28, my + 1, 56, 1); rect(g, '#ffb04a', cx - 14, my + 1, 28, 1);
  if (k > 0.01) for (let i = 0; i < 7; i++) { const t = i / 6, x0 = cx + (t - 0.5) * 56, ex = cx + (t - 0.5) * W * 2.0, cl = Math.min(1, k * 1.4 - t * 0.2); if (cl <= 0) continue;
    line(g, R(x0), my + 3, R(lerp(x0, ex, cl)), R(lerp(my + 3, VH + 60, cl)), i % 2 ? '#3a0f3a' : '#1a0818'); line(g, R(x0), my + 3, R(lerp(x0, ex, cl)), R(lerp(my + 3, VH + 60, cl)) - 1, i % 2 ? '#7a2a6a' : '#5a1a50'); }
}
export function drawEscapeScene(env, s) {
  const { g, VW, VH, time, n, reduce } = env, calm = !!reduce, E = HS.ESCAPE, b = backFor(s), ck = HS.crackK(s);
  const cxm = R(VW * 0.74), my = R(HS.mouthYB(s, VH)), yOff = HS.drakeYB(s), gk = HS.glideK(s);
  /* the sky: the 'ash' altitude, scrolling left past a drake flying right */
  safe('sky', () => SL.paintAltitude(g, SKY.ash, { scroll: calm ? 40 : s * 60 }, VW, VH, time, 0, 1, true, layerShift));
  /* the crater and the cone; the crack opens in its mouth and the corruption pours down it */
  if (my < VH + 10) { volcano(g, VH, cxm, my, ck); if (ck > 0.01) safe('breach', () => SL.breachCrack(g, cxm, my - 1, 52, ck, calm ? 0.5 : time)); }
  /* the rim, under the drake as it lands */
  if (gk > 0.01) safe('rim', () => SL.rimLanding(g, -6, R(BACK_Y + E.drakeLand + 28), 230, time));
  /* the drake (the real mount), flown up out of frame while the camera follows the King down, and back in to land */
  b.t = s; b.y0 = BACK_Y + yOff; b.bob = gk > 0.95 ? 0 : Math.sin(s * Math.PI * 2 * 0.55) * 2; b.bank.state = s >= E.twistAt && s < E.blastAt + 0.9 ? 'tell' : 'level'; b.bank.t = s >= E.blastAt - 0.2 ? 0.7 : 0.3; b.bank.ang = 0;
  const sY = b.y0 + b.bob;
  if (yOff > -125) safe('drake', () => { paintDrake(g, b, 0, 0, time); });
  /* the King: down on the neck, flung off, smoke wings + laugh over the back, the dive into the crater */
  const kp = HS.kingPoseB(s), neckX = b.x1 - 10, hoverX = R(VW * 0.52 + Math.sin(time * 1.6) * 5), hoverY = R(96 + Math.sin(time * 2.1) * 3);
  if (kp !== 'gone') safe('king', () => {
    let x = neckX, y = sY, flip = false, spec = { body: 'prone', arm: 'out', ph: 3, frame: 0 };
    if (kp === 'tumble') { const t = HS.kingFlyK(s); x = lerp(neckX, VW * 0.52, t); y = lerp(sY, 96, t) - Math.sin(t * Math.PI) * 54; spec = { body: 'tumble', arm: 'flail', scream: true, ph: 3, frame: Math.floor(time * 6) % 2 }; }
    else if (kp === 'wings' || kp === 'laugh') { x = hoverX; y = hoverY; flip = true; spec = kp === 'laugh' ? { body: 'float', arm: 'spread', cape: 'flare', scream: true, ph: 3, frame: Math.floor(time * 4) % 2 } : { body: 'rise', arm: 'spread', cape: 'flare', ph: 3, frame: Math.floor(time * 3) % 2 }; }
    else if (kp === 'dive') { const t = HS.diveK(s), q = t * t; x = lerp(VW * 0.52, cxm, q); y = lerp(96, my + 8, q); flip = false; spec = { body: 'flat', arm: 'clawFwd', cape: 'flare', ph: 3, frame: Math.floor(time * 8) % 2 }; }
    const k = KA.kingSprite(spec); blit(g, k.c, k.ax, k.ay, x, y, flip); });
  /* the drake's blast: a cone of fire from its jaws toward where he was, a breath's worth */
  { const bt = s - E.blastAt; if (bt > -0.1 && bt < 0.9) { const k = clamp01(bt / 0.35) * (1 - clamp01((bt - 0.5) / 0.4)), hx = b.x1 + 78, hy = sY - 6;
      for (let i = 0; i < 26; i++) { const t = (i / 26 + (calm ? 0 : time * 2.2)) % 1, x = hx + t * 120 * k, y = hy - t * 38 * k + Math.sin(i * 2.7 + time * 9) * (2 + t * 6), r = 2 + t * 6 * k; circle(g, R(x), R(y), r, t < 0.25 ? '#fff0c0' : t < 0.55 ? '#ffb04a' : '#c8501a', t < 0.55 ? '#a8301a' : '#3a1a14'); } } }
  /* the party: running up the back, then stood; walking back to the tail and dropping onto the rim at the end */
  if (yOff > -125) for (let i = 0; i < n; i++) { const h = HS.heroB(i, n, s, VW); env.drawHero(i, R(h.x), R(sY + 1 + h.drop), h.face, h.running ? 'run' : 'idle', h.running ? Math.floor(time * 12) + i * 2 : Math.floor(time * 4.5) + i); }
  /* ash and sparks across everything */
  for (let i = 0; i < 26; i++) { const sp = 30 + hash(i + 3) * 50, x = (((hash(i) * (VW + 40)) - (calm ? 0 : s * sp)) % (VW + 40) + VW + 40) % (VW + 40) - 10, y = (hash(i + 7) * VH + (calm ? 0 : s * 10 * (i % 2 ? 1 : -1))) % VH; dot(g, i % 3 ? '#7a6a64' : '#ff9a3a', x, (y + VH) % VH); }
  /* the breach's violet bloom */
  if (ck > 0.01) { g.fillStyle = 'rgba(90,20,90,' + (0.16 * ck).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH); }
  /* the card */
  const cd = HS.cardK(s);
  if (cd > 0.01) { g.fillStyle = 'rgba(5,4,10,' + (0.82 * cd).toFixed(3) + ')'; g.fillRect(0, 0, VW, VH);
    g.globalAlpha = cd; if (env.text) { env.text(HS.ESCAPE_CARD.title, VW / 2, R(VH * 0.40), '#ffd36b', 'center', 12); env.text(HS.ESCAPE_CARD.line, VW / 2, R(VH * 0.40) + 24, '#d9d2b8', 'center', 6); } g.globalAlpha = 1; }
  fadeIn(g, VW, VH, s);
}
