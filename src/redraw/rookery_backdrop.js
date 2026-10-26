// rookery_backdrop.js - THE ROOKERY's OWN SKY, FAR CRAGS, CLOUD SEA, MID STACKS, LANDMARKS and NEAR WISPS (claude/rookeryart). The greybox wore the stock desert crag. This is a HARPIES' CLIFF:
//   SKY       a cold pearl sky that goes lilac, then rose, as the road climbs toward the Roc (rookery_pal.js: five places crossfading), a pale sun in a halo, a few shafts of light
//   FAR (0.10) crag spires in haze, banded in strata and streaked white with guano; a few birds gliding between them (live)
//   THE ROC'S PEAK (landmark, 0.07)  a black spire with her eyrie on its crown, masts and torn banners, her own shape circling it: far and small at the foot of the road, growing and drawing
//             across as you climb (baked at three sizes) - the end of the road is in sight from the first frame
//   THE MONASTERY (landmark, 0.05)  its long roof, cloister wall and bell tower on a shelf of rock FAR BELOW AND BEHIND, a lit window, a thread of smoke: it SINKS into the cloud as you climb
//   CLOUD SEA (0.14 / 0.24)  two banks of cloud far under the road, lit on top, grey under; they fall away as you climb
//   MID (0.32) the place's own stacks: broad ledges and guano-capped needles with bone nests hung on them (terraces), tall flues the wind blows through (chimneys), giant bone arches
//             (the Bone Stair), banner-poles and rose-lit spires (the crag)
//   NEAR (0.7) rags of cloud drifting past, a feather or two falling, wind streaks
// Everything static is baked once (memo); a frame is a handful of drawImage calls.   drawSky(g, cx, cy, VW, VH, L, time, dY)   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)   drawNear(...)   bakeFG(w, h, seed)
import { canvas, rect as R, mulberry } from '../px.js';
import { PAL, ZONES, GUANO, BONE, TWIG, RED, airAt, zoneOf, hash, mix, rgbStr } from './rookery_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const progress = (cx, VW, L) => clamp((cx + VW / 2) / Math.max(1, ((L && L.W) || 416) * 16 - VW / 2), 0, 1);

/* ------------------------------------------------------------------ pixel shapes ------------------------------------------------------------------ */
/* a CRAG SPIRE: a tapering stack baked from the top down; its sides step in and out as the strata do, lit on the left, dark on the right; ledges jut with guano on them (and a nest) */
function spire(g, cx, base, wBase, hgt, seed, ramp, o = {}) {
  const r = mulberry(seed), top = base - hgt, wTop = Math.max(2, o.wTop || wBase * 0.22); let hw = wTop / 2, drift = 0; const ledges = [];
  for (let y = 0; y < hgt; y++) {
    const t = y / hgt; if (y % (6 + (seed & 3)) === 0) drift += r() < 0.55 ? (r() < 0.5 ? -1 : 1) * (1 + ((r() * 2) | 0)) : 0;
    const w = Math.max(1.5, lerp(wTop / 2, wBase / 2, Math.pow(t, 0.72)) + clamp(drift, -4, 4)), X0 = Math.round(cx - w), X1 = Math.round(cx + w), yy = top + y;
    R(g, X0, yy, X1 - X0, 1, ramp[1]);
    const lw = Math.max(1, Math.round((X1 - X0) * 0.3)), dw = Math.max(1, Math.round((X1 - X0) * 0.26));
    R(g, X0, yy, lw, 1, ramp[2]); R(g, X0, yy, 1, 1, ramp[3]); R(g, X1 - dw, yy, dw, 1, ramp[0]);
    if (y % (7 + ((y * 7 + seed) % 5)) === 0 && y > 4) { R(g, X0 + 1, yy, X1 - X0 - 2, 1, ramp[0]); if (r() < 0.6) R(g, X0 + 1, yy + 1, Math.max(1, lw - 1), 1, ramp[2]); }   /* a bed's line */
    if (o.guano && y > 3 && r() < 0.16) { const sx = X0 + 1 + ((r() * Math.max(1, X1 - X0 - 3)) | 0), ln = 3 + ((r() * 8) | 0); for (let q = 0; q < ln && y + q < hgt; q++) R(g, sx, yy + q, 1, 1, q % 3 === 2 ? GUANO[0] : GUANO[2]); }
    if (y > 8 && y < hgt - 10 && r() < 0.045) ledges.push([X1, yy, w]);
  }
  R(g, Math.round(cx - wTop / 2), top - 1, Math.round(wTop), 1, ramp[3]);
  for (const [lx, ly] of ledges) { const lw = 5 + ((r() * 7) | 0); R(g, lx - 1, ly, lw, 2, ramp[1]); R(g, lx - 1, ly, lw, 1, ramp[3]); R(g, lx - 1, ly + 2, lw - 2, 1, ramp[0]);
    if (o.guano) { R(g, lx, ly - 1, lw - 2, 1, GUANO[2]); R(g, lx + 1, ly - 2, Math.max(1, lw - 5), 1, GUANO[3]); }
    if (o.nest && r() < 0.8) nestSmall(g, lx + (lw >> 1), ly - 1, o.nestHaze || 0); }
  return top;
}
/* a small bone nest on a ledge, from far: a ring of pale sticks, a dark hollow, two cream dots */
function nestSmall(g, x, y, hz) { const tw = mix(TWIG[2], '#8a86a0', hz), bn = mix(BONE[2], '#c8c4d8', hz);
  R(g, x - 4, y - 2, 9, 3, tw); R(g, x - 5, y - 3, 3, 1, bn); R(g, x + 2, y - 3, 3, 1, tw); R(g, x - 3, y - 4, 1, 2, bn); R(g, x + 3, y - 4, 1, 2, bn); R(g, x - 2, y - 3, 5, 1, mix(TWIG[0], '#6a6684', hz)); R(g, x - 1, y - 4, 1, 1, EGGC); R(g, x + 1, y - 4, 1, 1, EGGC); }
const EGGC = '#efe8d2';
/* a puff of cloud: scanlines, lit crown, grey belly, ragged edge */
function puff(g, cx, cy, rx, ry, ramp, r) {
  for (let dy = -ry; dy <= ry; dy++) { const q = dy / ry, w = Math.round(rx * Math.sqrt(Math.max(0, 1 - q * q)) + (r() - 0.5) * 2.4), yy = cy + dy;
    const col = q < -0.5 ? ramp[0] : q < 0.15 ? ramp[1] : q < 0.6 ? ramp[2] : ramp[3];
    R(g, cx - w, yy, w * 2, 1, col); if (q < -0.2) R(g, cx - w, yy, Math.max(1, w >> 1), 1, ramp[0]); if (q > 0.3) R(g, cx + (w >> 1), yy, Math.max(1, w >> 1), 1, ramp[3]); }
}

/* ------------------------------------------------------------------ the spire strips (far, mid) ------------------------------------------------------------------ */
const STRIP_W = 960;
function rampFor(z, layer) { const P = PAL[z];
  if (layer === 'far') { const a = P.far[0], b = P.far[1]; return [mix(a, P.haze, 0.1), mix(a, b, 0.5), b, mix(b, '#ffffff', 0.35)]; }
  return [mix(P.mid[0], P.s[0], 0.3), P.mid[0], P.mid[1], P.mid[2]]; }
function bakeStrip(z, layer) {
  return once('st' + z + layer, () => {
    const far = layer === 'far', h = far ? 230 : 330, [c, g] = canvas(STRIP_W, h), r = mulberry(z * 131 + (far ? 7 : 29)), ramp = rampFor(z, layer), base = h - 2;
    const n = far ? 9 : 7;
    for (let i = 0; i < n; i++) {
      const x = Math.round((i + 0.5) * STRIP_W / n + (r() - 0.5) * 70), tall = far ? 70 + ((r() * 120) | 0) : 120 + ((r() * 190) | 0), wb = far ? 36 + ((r() * 40) | 0) : 40 + ((r() * 48) | 0), sd = z * 100 + i * 13 + (far ? 1 : 2);
      const o = { guano: true, nest: !far && (z === 1 || z === 0 || z === 3) || (!far && r() < 0.35), nestHaze: 0.1, wTop: far ? 6 : 8 };
      if (z === 2 && !far) { o.wTop = wb * 0.42; }                                                       /* the chimneys' stacks stand nearly square: flues */
      for (const off of [0, -STRIP_W, STRIP_W]) spire(g, x + off, base, wb, tall, sd, ramp, o);
      if (z === 3 && !far && i % 2 === 0) { const ax = x + 62 + ((r() * 10) | 0), top = base - 90 - ((r() * 40) | 0); bonePair(g, ax, top, base, r); }   /* the Bone Stair's tall ribs */
    }
    return c; });
}
/* a pair of giant ribs / an arch of bone standing on the crag (the Bone Stair): two long curved bones meeting overhead */
function bonePair(g, x, top, base, r) {
  const w = 26 + ((r() * 8) | 0), ramp = [mix(BONE[0], '#8a86a0', 0.35), mix(BONE[1], '#a8a4bc', 0.3), mix(BONE[2], '#c4c0d4', 0.3), mix(BONE[3], '#e0dcec', 0.3)];
  for (let y = top; y < base; y++) { const t = (y - top) / (base - top), cur = Math.round(Math.sin(t * Math.PI * 0.5) * w * 0.5 - 0), lx = x - Math.round((1 - Math.cos(t * 1.4)) * 2) , th = 3 - (t > 0.8 ? 1 : 0);
    R(g, x + cur - w, y, th, 1, ramp[1]); R(g, x + cur - w, y, 1, 1, ramp[3]); R(g, x - cur + 2, y, th, 1, ramp[1]); R(g, x - cur + 2 + th - 1, y, 1, 1, ramp[0]); if (y % 9 === 0) { R(g, x + cur - w - 1, y, th + 2, 1, ramp[2]); R(g, x - cur + 1, y, th + 2, 1, ramp[2]); } }
}

/* ------------------------------------------------------------------ the cloud sea ------------------------------------------------------------------ */
function bakeClouds(z, deep) {
  return once('cl' + z + deep, () => {
    const h = deep ? 150 : 120, [c, g] = canvas(STRIP_W, h), r = mulberry(z * 47 + (deep ? 3 : 11)), P = PAL[z];
    const lit = mix(P.sky[2], '#ffffff', 0.55), mid = mix(P.sky[2], P.haze, 0.2), under = mix(P.haze, P.s[3], deep ? 0.32 : 0.22), low = mix(P.haze, P.s[2], deep ? 0.5 : 0.38);
    const ramp = [lit, mix(lit, mid, 0.5), mid, under];
    /* a bank: many puffs along a line, bigger at the back, a flat floor under */
    R(g, 0, h - 40, STRIP_W, 40, low);
    for (let i = 0; i < 26; i++) { const x = Math.round(r() * STRIP_W), rx = 26 + ((r() * 40) | 0), ry = 10 + ((r() * 16) | 0), y = 28 + ((r() * (h - 70)) | 0);
      for (const off of [0, -STRIP_W, STRIP_W]) puff(g, x + off, y, rx, ry, ramp, r); }
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(0.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(' + rgbStr(P.haze) + ',0.55)'); g.fillStyle = gr; g.fillRect(0, 0, STRIP_W, h); g.globalCompositeOperation = 'source-over';
    return c; });
}

/* ------------------------------------------------------------------ THE MONASTERY (far below, behind) ------------------------------------------------------------------ */
function bakeMonastery(u) {
  return once('mon' + u, () => {
    const W = Math.round(190 * u), H = Math.round(130 * u), [c, g] = canvas(W, H), X = v => Math.round(v * u), base = H - 1;
    const hzc = '#b4b6d0', rk = [mix('#3a3a52', hzc, 0.35), mix('#585874', hzc, 0.3), mix('#7a7a96', hzc, 0.28), mix('#a0a0b8', hzc, 0.25)];
    const wall = [mix('#46465e', hzc, 0.3), mix('#6c6c86', hzc, 0.28), mix('#9090a8', hzc, 0.25), mix('#b4b4c4', hzc, 0.22)], roof = [mix('#2a3044', hzc, 0.3), mix('#40506a', hzc, 0.26), mix('#5c7088', hzc, 0.22), mix('#8aa0b0', hzc, 0.2)];
    const lamp = '#f4c474', rect = (x, y, w, h, col) => R(g, X(x), base - X(y) - Math.max(1, X(h)) + 1, Math.max(1, X(w)), Math.max(1, X(h)), col);
    /* the shelf of rock it stands on (a crag shelf with a few ledges) */
    for (let y = 0; y < 22; y++) { const w = 92 - y * 1.1 + ((y * 7) % 5); R(g, X(98 - w / 2 * 1.1), base - X(y), X(w * 1.1), 1, y < 2 ? rk[3] : y % 6 === 0 ? rk[0] : rk[1]); R(g, X(98 - w / 2 * 1.1), base - X(y), X(w * 0.3), 1, rk[2]); }
    /* the long roof: the refectory - a wall, the pitched roof, buttresses */
    rect(22, 22, 96, 22, wall[1]); rect(22, 22, 4, 22, wall[2]); rect(114, 22, 4, 22, wall[0]); for (const bx of [38, 62, 86]) { rect(bx, 22, 3, 22, wall[2]); rect(bx + 2, 22, 1, 22, wall[0]); }
    for (let q = 0; q < 12; q++) rect(18 + q, 44 + q, 104 - q * 2, 1, q < 2 ? roof[3] : q % 3 ? roof[1] : roof[2]); rect(18, 44, 104, 1, roof[3]);
    for (const wx of [46, 70, 94]) { rect(wx, 28, 3, 6, wall[0]); rect(wx, 28, 3, 1, lamp); }
    /* the cloister wall in front, with an arched gate */
    rect(0, 22, 36, 9, wall[1]); rect(0, 30, 36, 1, wall[3]); rect(8, 22, 8, 7, wall[0]); rect(10, 22, 4, 8, lamp);
    rect(120, 22, 50, 8, wall[1]); rect(120, 29, 50, 1, wall[3]); for (let i = 0; i < 6; i++) rect(124 + i * 8, 30, 3, 3, wall[2]);
    /* the bell tower: square, a belfry with an arch and a bell, a spire */
    rect(132, 30, 22, 52, wall[1]); rect(132, 30, 3, 52, wall[2]); rect(151, 30, 3, 52, wall[0]); for (const y of [38, 52, 66]) rect(132, y, 22, 1, wall[0]);
    rect(138, 70, 10, 10, wall[0]); rect(139, 70, 8, 9, '#1c1a2c'); rect(141, 73, 4, 5, roof[3]); rect(142, 70, 2, 1, lamp);
    for (let q = 0; q < 18; q++) rect(131 + (q >> 1), 82 + q, 24 - (q >> 1) * 2 + 0, 1, q % 4 === 0 ? roof[3] : roof[1]); rect(142, 100, 2, 6, roof[2]); rect(141, 106, 4, 1, lamp);
    rect(138, 45, 3, 4, lamp);
    /* the chapel gable behind the refectory */
    rect(122, 44, 12, 8, wall[0]); for (let q = 0; q < 7; q++) rect(120 + q, 52 + q, 16 - q * 2, 1, roof[1]);
    return c; });
}
/* ------------------------------------------------------------------ THE ROC'S PEAK (ahead, growing) ------------------------------------------------------------------ */
function bakePeak(z, u) {
  return once('pk' + z + '_' + u, () => {
    const W = Math.round(190 * u), H = Math.round(340 * u), [c, g] = canvas(W, H), X = v => Math.round(v * u), P = PAL[z], hzc = mix(P.haze, P.sky[1], 0.4);
    const ramp = [mix('#14101e', hzc, 0.22), mix('#28223a', hzc, 0.24), mix('#403850', hzc, 0.24), mix('#605874', hzc, 0.22)];
    /* the spire: black stone, steep, banded, stepping in toward the crown */
    const cx = X(92), top = X(60);
    for (let y = top; y < H; y++) { const t = (y - top) / (H - top), w = X(15 + 62 * Math.pow(t, 0.8) + Math.sin(y * 0.21) * 2.2 + (y % 27 < 3 ? 3 : 0)), x0 = cx - w, x1 = cx + w;
      R(g, x0, y, x1 - x0, 1, ramp[1]); R(g, x0, y, Math.max(1, (x1 - x0) * 0.28 | 0), 1, ramp[2]); R(g, x0, y, 1, 1, ramp[3]); R(g, x1 - Math.max(1, ((x1 - x0) * 0.3) | 0), y, Math.max(1, ((x1 - x0) * 0.3) | 0), 1, ramp[0]);
      if (y % X(11) === 0) R(g, x0 + 1, y, x1 - x0 - 2, 1, ramp[0]); if ((y * 13 + 5) % 41 < 2 && t > 0.1) { const gx = x0 + 2 + ((y * 7) % Math.max(1, x1 - x0 - 4)); for (let q = 0; q < X(10) && y + q < H; q++) R(g, gx, y + q, 1, 1, GUANO[q % 3 ? 2 : 1]); } }
    /* the EYRIE on the crown: a flat ring of black twig and bone, three masts, torn banners, a cold lamp */
    const ey = top - X(2), ew = X(34);
    R(g, cx - ew, ey, ew * 2, X(7), ramp[1]); R(g, cx - ew, ey, ew * 2, 1, ramp[3]); R(g, cx - ew - X(4), ey + X(2), X(6), X(4), ramp[0]); R(g, cx + ew - X(2), ey + X(2), X(6), X(4), ramp[0]);
    for (let k = 0; k < 9; k++) { const bx = cx - ew + X(3) + k * X(7); R(g, bx, ey - X(3) - (k % 3) * X(1), Math.max(1, X(3)), Math.max(2, X(4)), k % 2 ? mix(BONE[1], hzc, 0.4) : mix(TWIG[1], hzc, 0.4)); }
    for (const [mx, mh] of [[-20, 38], [4, 56], [24, 34]]) { R(g, cx + X(mx), ey - X(mh), Math.max(1, X(2)), X(mh), ramp[0]); R(g, cx + X(mx), ey - X(mh), 1, X(mh), ramp[2]);
      for (let q = 0; q < X(16); q++) R(g, cx + X(mx) + 1 + q, ey - X(mh) + X(2) + (q >> 2) + (q % 5 === 4 ? 1 : 0), 1, Math.max(1, X(6) - (q >> 2)), q > X(11) ? ramp[1] : mix(RED[1], hzc, 0.45)); }   /* a torn red banner */
    R(g, cx - X(2), ey - X(8), Math.max(2, X(4)), Math.max(2, X(3)), '#e8c47a');   /* the lamp in her nest */
    return c; });
}
/* the Roc herself, far off: a huge slow bird, wings spread, a long neck - drawn live, circling the peak (a few pixels per frame) */
function drawRoc(g, x, y, s, time, haze) {
  const a = time * 0.22, bx = Math.round(x + Math.cos(a) * 62 * s), by = Math.round(y + Math.sin(a * 1.3) * 22 * s), dir = Math.sin(a) > 0 ? 1 : -1, flap = Math.sin(time * 1.3) * 0.5 + 0.5;
  const col = mix('#14101e', haze, 0.35), col2 = mix('#2c2640', haze, 0.3), w = Math.round(46 * s), h = Math.max(2, Math.round(6 * s));
  g.fillStyle = col2; for (let i = 0; i < w; i++) { const t = i / w, lift = Math.round(Math.sin(t * 3.1) * (5 + 6 * flap) * s); g.fillRect(bx - i * dir, by - lift - (t > 0.55 ? Math.round((t - 0.55) * 10 * s) : 0), 1, Math.max(1, h - (t > 0.6 ? 2 : 0))); g.fillRect(bx + i * dir, by - lift - (t > 0.55 ? Math.round((t - 0.55) * 10 * s) : 0), 1, Math.max(1, h - (t > 0.6 ? 2 : 0))); }
  g.fillStyle = col; g.fillRect(bx - Math.round(5 * s), by - Math.round(2 * s), Math.round(10 * s), Math.max(3, Math.round(6 * s))); g.fillRect(bx + dir * Math.round(5 * s), by - Math.round(4 * s), Math.round(7 * s), Math.max(2, Math.round(3 * s))); g.fillRect(bx + dir * Math.round(11 * s), by - Math.round(3 * s), Math.max(2, Math.round(3 * s)), Math.max(1, Math.round(2 * s)));
}

/* ------------------------------------------------------------------ the frame ------------------------------------------------------------------ */
function skyFill(g, A, VW, VH, k, time, cx) {
  const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, A.sky[0]); gr.addColorStop(0.5, A.sky[1]); gr.addColorStop(0.86, A.sky[2]); gr.addColorStop(1, mix(A.sky[2], A.haze, 0.4)); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  /* a pale sun in a cold halo, setting toward rose as the climb goes on */
  const sx = Math.round(VW * 0.7 - cx * 0.012), sy = Math.round(VH * (0.3 + 0.1 * k)), rose = clamp((k - 0.55) * 2.2, 0, 1), sc = rose > 0 ? [255, 214 - rose * 40, 190 - rose * 60] : [255, 250, 240];
  const sg = g.createRadialGradient(sx, sy, 0, sx, sy, 170); sg.addColorStop(0, 'rgba(' + sc.map(Math.round) + ',0.55)'); sg.addColorStop(0.3, 'rgba(' + sc.map(Math.round) + ',0.2)'); sg.addColorStop(1, 'rgba(' + sc.map(Math.round) + ',0)'); g.fillStyle = sg; g.fillRect(sx - 170, sy - 170, 340, 340);
  g.fillStyle = 'rgba(' + sc.map(Math.round) + ',0.9)'; g.beginPath(); g.arc(sx, sy, 9, 0, 7); g.fill(); g.fillStyle = 'rgba(' + sc.map(Math.round) + ',0.4)'; g.beginPath(); g.arc(sx, sy, 13, 0, 7); g.fill();
  /* a few long shafts of light through the cloud (additive) */
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const x0 = sx - 120 + i * 90 + Math.sin(time * 0.06 + i) * 10, w = 14 + i * 8; g.globalAlpha = 0.045 + 0.02 * Math.sin(time * 0.3 + i * 2); g.fillStyle = '#fff4e0'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w - 160 + i * 40, VH); g.lineTo(x0 - 160 + i * 40, VH); g.fill(); } g.restore(); g.globalAlpha = 1;
}
/* THE SKY + THE TWO LANDMARKS: main.js calls it first (src/rookery-hands.js drawSky) */
export function drawSky(g, cx, cy, VW, VH, L, time, dY) {
  const tM = (cx + VW / 2) / 16, A = airAt(tM), k = progress(cx, VW, L);
  skyFill(g, A, VW, VH, k, time, cx);
  /* THE ROC'S PEAK: far and small and right of the frame at the foot of the road; larger, nearer and further left as you climb */
  { const s = 0.5 + 0.8 * k, u = s < 0.7 ? 0.55 : s < 1.05 ? 0.85 : 1.2, sp = bakePeak(A.z, u), ratio = s / u, w = Math.round(sp.width * ratio), h = Math.round(sp.height * ratio), px = Math.round(VW * (0.86 - 0.34 * k)), py = Math.round(VH * 0.96 + dY * 0.08 + 20 - k * 30);
    g.drawImage(sp, px - (w >> 1), py - h, w, h);
    drawRoc(g, px, py - h + Math.round(46 * ratio) - Math.round(40 * ratio), 0.55 + 0.7 * k, time, A.haze); }
  /* THE MONASTERY: far below and behind, sinking as you climb */
  { const u = 0.8, sp = bakeMonastery(u), mx = Math.round(VW * 0.26 - cx * 0.05), my = Math.round(VH * 0.9 + dY * 0.34 - 18);
    if (mx > -sp.width - 20 && mx < VW + 20) { g.drawImage(sp, mx - (sp.width >> 1), my - sp.height);
      g.globalAlpha = 0.28; for (let q = 0; q < 7; q++) { const t = (time * 0.1 + q * 0.14) % 1; g.fillStyle = mix('#e0e0f0', A.haze, 0.3); g.fillRect(mx + 38 + Math.round(Math.sin(time * 0.5 + q) * 3 + t * 12), my - sp.height + 56 - Math.round(t * 34), 3 + Math.round(t * 4), 3 + Math.round(t * 4)); } g.globalAlpha = 1; } }
}
/* the strips: a layer repeated across the view at its own parallax */
function strip(g, sp, f, cx, VW, y) { const w = sp.width; let x = Math.round(((-cx * f) % w + w) % w); if (x > 0) x -= w; for (let xx = x; xx < VW; xx += w) g.drawImage(sp, xx, y); }
function birds(g, cx, VW, VH, time, A, dY) {
  g.fillStyle = mix('#2c2840', A.haze, 0.45);
  for (let i = 0; i < 6; i++) { const hs = hash(i, 31), sp = 6 + (hs % 7), X = ((hs % 900) + time * sp - cx * 0.1) % (VW + 120), Y = Math.round(VH * (0.18 + (hs % 40) / 100) + Math.sin(time * 0.7 + i * 2) * 7 + dY * 0.06), up = Math.floor(time * 3 + i) % 2;
    const x = Math.round(X < 0 ? X + VW + 120 : X) - 60; g.fillRect(x, Y, 5, 1); g.fillRect(x - 2, Y - (up ? 2 : 0), 2, 1); g.fillRect(x + 5, Y - (up ? 2 : 0), 2, 1); g.fillRect(x - 3, Y + (up ? 0 : 1), 1, 1); g.fillRect(x + 7, Y + (up ? 0 : 1), 1, 1); }
}
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const tM = (cx + VW / 2) / 16, A = airAt(tM), [z, nz, kz] = zblend(tM);
  drawSky(g, cx, cy, VW, VH, L, time, dY);   /* (the level is dusk the whole way: the game paints its dusk wash before the backdrop chain, so the sky is drawn here, over it) */
  const farY = Math.round(VH * 0.74 + dY * 0.12), midY = Math.round(VH * 1.02 + dY * 0.2), cloudFar = Math.round(VH * 0.74 + dY * 0.26), cloudNear = Math.round(VH * 0.86 + dY * 0.36);
  /* FAR CRAGS (0.10), the place's own; a seam draws both */
  if (full) for (const [zz, al] of kz > 0.02 ? [[z, 1 - kz], [nz, kz]] : [[z, 1]]) { g.globalAlpha = al; strip(g, bakeStrip(zz, 'far'), 0.1, cx, VW, farY - 230); }
  g.globalAlpha = 1; if (full) birds(g, cx, VW, VH, time, A, dY);
  /* THE CLOUD SEA, far bank (0.14): it lies between the far crags and the mid stacks and falls away as you climb */
  for (const [zz, al] of kz > 0.02 ? [[z, 1 - kz], [nz, kz]] : [[z, 1]]) { g.globalAlpha = al; strip(g, bakeClouds(zz, true), 0.14, cx, VW, cloudFar - 70); }
  g.globalAlpha = 1;
  /* MID STACKS (0.32) */
  for (const [zz, al] of kz > 0.02 ? [[z, 1 - kz], [nz, kz]] : [[z, 1]]) { g.globalAlpha = al; strip(g, bakeStrip(zz, 'mid'), 0.32, cx, VW, midY - 330); }
  g.globalAlpha = 1;
  /* THE CLOUD SEA, near bank (0.24): it laps the mid stacks' feet */
  for (const [zz, al] of kz > 0.02 ? [[z, 1 - kz], [nz, kz]] : [[z, 1]]) { g.globalAlpha = al * 0.95; strip(g, bakeClouds(zz, false), 0.24, cx, VW, cloudNear - 40); }
  g.globalAlpha = 1;
  /* a bank of the place's air laid over the mid foot */
  { const gr = g.createLinearGradient(0, midY - 70, 0, midY + 10); gr.addColorStop(0, 'rgba(' + rgbStr(A.haze) + ',0)'); gr.addColorStop(1, 'rgba(' + rgbStr(A.haze) + ',0.22)'); g.fillStyle = gr; g.fillRect(0, midY - 70, VW, 80); }
}
/* the zone here, the neighbour it is melting into, and how far (0..0.5) over the 24 tiles at a seam */
function zblend(tM) { const z = zoneOf(tM), toEnd = ZONES[z].x1 - tM, fromStart = tM - ZONES[z].x0; if (toEnd < 24 && z < 4) return [z, z + 1, 0.5 * (1 - toEnd / 24)]; if (fromStart < 24 && z > 0) return [z, z - 1, 0.5 * (1 - fromStart / 24)]; return [z, z, 0]; }
/* ---------------- NEAR (0.7): rags of cloud drifting past, feathers falling, wind streaks ---------------- */
function bakeWisp(z, v) { return once('ws' + z + v, () => { const [c, g] = canvas(190, 36), r = mulberry(v * 17 + z), P = PAL[z], ramp = [mix(P.sky[2], '#ffffff', 0.7), mix(P.sky[2], '#ffffff', 0.4), mix(P.haze, '#ffffff', 0.15), mix(P.haze, P.s[3], 0.2)];
  for (let i = 0; i < 7; i++) puff(g, 22 + i * 24 + ((r() * 8) | 0), 14 + ((r() * 8) | 0), 14 + ((r() * 12) | 0), 5 + ((r() * 5) | 0), ramp, r); return c; }); }
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const tM = (cx + VW / 2) / 16, A = airAt(tM), z = A.z;
  for (let i = 0; i < 3; i++) { const sp = bakeWisp(z, i), X = ((i * 331 - cx * 0.7 - time * (8 + i * 3)) % (VW + 300) + VW + 300) % (VW + 300) - 200, Y = Math.round(VH * (0.78 + i * 0.07) + Math.min(60, dY * 0.2));
    g.globalAlpha = 0.34; g.drawImage(sp, Math.round(X), Y); }
  g.globalAlpha = 1;
  /* wind streaks: thin pale lines racing west to east */
  g.fillStyle = 'rgba(255,255,255,0.22)'; for (let i = 0; i < 6; i++) { const hs = hash(i, 91), X = ((hs % 700) - time * (110 + (hs % 5) * 25) - cx * 0.3) % (VW + 100), Y = 24 + (hs >> 3) % Math.round(VH * 0.6); const x = Math.round(X < 0 ? X + VW + 100 : X) - 50; g.fillRect(x, Y, 14 + (hs % 14), 1); }
  /* feathers falling (white, grey, one dark) */
  for (let i = 0; i < 4; i++) { const hs = hash(i, 55), t = (time * (0.09 + (hs % 4) * 0.02) + (hs % 100) / 100) % 1, X = Math.round(((hs % 500) + t * 120 + Math.sin(time * 1.4 + i) * 12 - cx * 0.5) % (VW + 60)), Y = Math.round(t * (VH + 20)) - 10, x = X < 0 ? X + VW + 60 : X;
    g.fillStyle = i === 3 ? '#4a4658' : '#eceaf2'; g.fillRect(x, Y, 3, 1); g.fillRect(x + 1, Y + 1, 2, 1); g.fillStyle = i === 3 ? '#6e6a80' : '#c6c4d4'; g.fillRect(x + 3, Y - 1, 1, 1); }
}
/* ---------------- THE FOREGROUND STRIP (BG.fg, behind the actors): dry crag grass bent east, a few thistle heads, a feather ---------------- */
export function bakeFG(w, h, seed) {
  const r = mulberry(seed), [c, g] = canvas(w, h), D = '#1c1a2a', M = '#34324a', Lt = '#58566e', Tp = '#8a8aa0';
  for (let i = 0; i < w / 6; i++) { const x = (r() * w) | 0, hh = 4 + ((r() * 9) | 0), lean = 1 + ((r() * 2) | 0);
    for (let q = 0; q < hh; q++) R(g, x + Math.round(q * q / hh * lean * 0.5), h - 1 - q, 1, 1, q > hh - 3 ? Lt : r() < 0.5 ? D : M);
    if (hh > 8 && r() < 0.4) { R(g, x + lean, h - hh - 1, 2, 2, Tp); R(g, x + lean, h - hh - 2, 1, 1, '#c8c0d8'); } }
  for (let i = 0; i < w / 90; i++) { const x = (r() * w) | 0, y = h - 3 - ((r() * 4) | 0); R(g, x, y, 4, 1, '#e8e6ee'); R(g, x + 1, y - 1, 2, 1, '#c4c2d4'); R(g, x + 4, y, 1, 1, '#9a98b0'); }   /* a fallen feather */
  return c;
}
