// sporewood2_world.js - SPOREWOOD 2's PROPS AND MACHINES, DRAWN (claude/sporewood2art). The greybox drew every machine as a flat rectangle and its spore clouds as grey ellipses.
//   THE BUDS (the growcap mover): a cream stalk and a domed cap in the area's own fungus - plain; DARK (grey-indigo with a shut eye until a lantern lights it, then foxfire-spotted); SEED (amber, a
//     gold fleck waiting for the blow, a gold seam); HER seed caps plum; a leaning stalk bends out over its gap; a withering cap greys and sags
//   LANTERN CAP     a stalk, a cap hung with foxfire buds; lit it burns cold teal-white with a breathing halo (additive), unlit it sleeps grey with a slow blink
//   MEND PUFF       a pale green puffball breathing spores; a green cloud of motes while it mends; a collapsed stump after
//   PUFFBALL        a cream-grey sphere with pores and a vent; SPRING SPORE a hovering disc of spores with a foxfire rim that squashes under a foot
//   ROOT KNOT       a gnarl of roots with a glowing seam on top and the dotted line down onto it (the target, FIRST); shut it is dark wood, open a split root with the door's light in it
//   SPORE CLOUDS    puffy, drawn as spores in a ring: the harmful ones sickly olive with red motes, the mild (her brood's) and helpful ones pale teal
//   DECO            toadstools, spore pods, tiny caps, root tangles in the area's own colours (deco kinds sporePod, tinyCap, mushroom, rootDecor, cobweb)
// Made from px.js primitives, baked once; per frame a few drawImage calls and fills.  ART ONLY.
import { canvas, mulberry } from '../px.js';
import { PAL, GLOW, zoneOf, mix, hash } from './sporewood2_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const rc = Math.round;
const TS = 16;
const halo = (rgb) => once('halo' + rgb, () => { const [c, g] = canvas(64, 64), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(' + rgb + ',0.55)'); gr.addColorStop(0.45, 'rgba(' + rgb + ',0.18)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; });

/* ------------------------------------------------------------------ THE BUDS ------------------------------------------------------------------ */
const STALK = ['#6a6248', '#cdbf9a', '#efe6c8'];
function fleshOf(m) {
  const z = zoneOf(m.x / TS);
  if (m.state === 'wither') return ['#2c2824', '#4a4238', '#6a6050', '#8a7e68'];
  if (m.mother) return ['#4e2a5e', '#7e4e94', '#b488c8', '#e8d0f0'];
  if (m.seed) return ['#5a3a1c', '#8a5a2c', '#bc8a48', '#ecc878'];
  if (m.dark && !m.lit) return ['#14141e', '#26263a', '#363654', '#4c4c72'];
  const c = PAL[z].cap; return [mix(c[0], '#000000', 0.3), c[1], c[2], mix(c[2], '#fff6e0', 0.55)];
}
export function drawGrowcap(g, m, cx, cy, time) {
  const x = rc(m.x - cx), cxm = x + m.w / 2, top = rc(m.y - cy), base = rc(m.y0 + 8 - cy), wob = m.state === 'up' && m.upT < 1.5 ? rc(Math.sin(time * 30)) : 0;
  const fl = fleshOf(m), withered = m.state === 'wither', lit = !!(m.dark && m.lit), sag = withered ? 2 : 0;
  const stk = (sx, sy, w) => { R(g, STALK[0], sx - w + wob, sy - 2, w * 2, 3); R(g, STALK[1], sx - w + wob, sy - 2, w * 2 - 2, 3); R(g, STALK[2], sx - w + 1 + wob, sy - 2, 1, 3); };
  if (m.lean) { const bxm = rc(m.bx - cx) + m.w / 2, dx = cxm - bxm, dy = top + 6 - base, n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 2) + 1;   /* A LEANING STALK: up from its root, bending out over the gap */
    for (let i = 0; i <= n; i++) { const t = i / n, sx = rc(bxm + dx * t * t), sy = rc(base + dy * t); stk(sx, sy, 3); if (i % 5 === 2) R(g, STALK[0], sx - 2 + wob, sy - 1, 4, 1); } }
  else { const h = Math.max(0, base - top - 6); R(g, STALK[0], cxm - 3 + wob, top + 6, 6, h); R(g, STALK[1], cxm - 3 + wob, top + 6, 5, h); R(g, STALK[2], cxm - 2 + wob, top + 6, 1, h);
    for (let yy = top + 8; yy < base - 2; yy += 6) R(g, STALK[0], cxm - 3 + wob, yy, 6, 1);
    if (h > 14) { R(g, STALK[1], cxm - 5 + wob, top + 12, 10, 2); R(g, STALK[0], cxm - 5 + wob, top + 14, 10, 1); } }   /* the ring on the stalk (the annulus) */
  /* the foot flares into root fingers in the soil, a thread of mycelium running off */
  { const bx = m.lean ? rc(m.bx - cx) + m.w / 2 : cxm; R(g, STALK[0], bx - 6, base - 2, 12, 2); R(g, STALK[0], bx - 8, base, 3, 1); R(g, STALK[0], bx + 5, base, 3, 1); R(g, STALK[1], bx - 5, base - 3, 10, 1); R(g, '#d8e0c4', bx - 10, base + 1, 3, 1); R(g, '#d8e0c4', bx + 8, base + 1, 4, 1); }
  /* the cap: a dome, lit top-left, gills under it, spots */
  g.fillStyle = fl[0]; g.beginPath(); g.ellipse(cxm + wob, top + 4 + sag, m.w / 2, 6, 0, Math.PI, 0); g.fill(); R(g, fl[0], x + wob, top + 3 + sag, m.w, 3);
  g.fillStyle = fl[1]; g.beginPath(); g.ellipse(cxm + wob, top + 4 + sag, m.w / 2 - 1, 5, 0, Math.PI, 0); g.fill(); R(g, fl[1], x + 1 + wob, top + 3 + sag, m.w - 2, 2);
  g.fillStyle = fl[2]; g.beginPath(); g.ellipse(cxm - 3 + wob, top + 3 + sag, m.w / 2 - 5, 3, 0, Math.PI, 0); g.fill();
  if (lit) { for (const dx of [-9, -2, 6]) { R(g, GLOW.c, cxm + dx + wob, top + 1 - (dx === -2 ? 2 : 0) + sag, 2, 2); R(g, GLOW.hi, cxm + dx + wob, top + 1 - (dx === -2 ? 2 : 0) + sag, 1, 1); } }
  else { R(g, fl[3], cxm - 9 + wob, top + 1 + sag, 2, 2); R(g, fl[3], cxm - 2 + wob, top - 1 + sag, 2, 2); R(g, fl[3], cxm + 6 + wob, top + 1 + sag, 2, 2); R(g, fl[3], cxm - 7 + wob, top + 2 + sag, 4, 1); }
  R(g, withered ? '#1c1814' : '#ece0c0', x + wob, top + 5 + sag, m.w, 1); g.fillStyle = withered ? '#14100e' : '#9c8c66'; for (let xx = x + 2; xx < x + m.w - 1; xx += 2) g.fillRect(xx + wob, top + 6 + sag, 1, 1);
  /* a DARK bud unlit: a shut eye (a pale slit) and the cold of it; lit: it is the foxfire that shows */
  if (m.dark && !m.lit && m.state === 'bud') { R(g, '#6a6a96', cxm - 4, top + 2, 8, 1); R(g, '#8a8ab8', cxm - 2, top + 1, 4, 1); if (Math.floor(time * 1.2 + m.x) % 5 === 0) R(g, '#8a8ab8', cxm - 1, top + 3, 2, 1); }
  if (lit && m.state === 'bud') { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.28 + 0.1 * Math.sin(time * 4 + m.x); g.drawImage(halo(GLOW.rgb), cxm - 24, top - 20, 48, 40); g.restore(); g.globalAlpha = 1; }
  /* a SEED cap: its seed, a gold fleck and a green sprout, waiting for a blow (never when it has been struck) */
  if (m.seed && m.state === 'bud' && !(m.cd > 0) && !m.noSeed) { const gl = Math.floor(time * 3 + m.x) % 2; R(g, gl ? '#fff1a8' : '#ffd36b', cxm - 2, top - 4, 4, 3); R(g, '#fff6d0', cxm - 1, top - 4, 1, 1); R(g, '#8fd160', cxm - 1, top - 6, 2, 2);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.22 + 0.1 * gl; g.drawImage(halo('255,211,107'), cxm - 14, top - 18, 28, 28); g.restore(); g.globalAlpha = 1; }
  /* a ready bud blinks a little arrow of spores over it (the old tell, in the cap's own colour) */
  if (m.state === 'bud' && !(m.cd > 0) && !m.seed && !(m.dark && !m.lit) && Math.floor(time * 2) % 2) { g.globalAlpha = 0.6; g.strokeStyle = fl[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(cxm - 3, top - 5); g.lineTo(cxm, top - 9); g.lineTo(cxm + 3, top - 5); g.stroke(); g.globalAlpha = 1; }
  if (m.shiver > 0) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 30); R(g, '#9a5aa8', x - 1 + rc(Math.sin(time * 40) * 2), top - 3, m.w + 2, 6); g.globalAlpha = 1; }   /* HER WITHER TELL: the cap shudders violet */
}

/* ------------------------------------------------------------------ THE LANTERN CAP (main.js's glowbud prop) ------------------------------------------------------------------ */
const bakeLantern = on => once('lant' + on, () => { const [c, g] = canvas(22, 26), r = mulberry(on ? 5 : 6), cap = on ? ['#1f8a7c', '#6ee0c8', '#d6fff0'] : ['#1c2c34', '#33505a', '#4f7480'];
  R(g, '#5a5a48', 10, 12, 3, 13); R(g, STALK[1], 10, 12, 2, 13); R(g, STALK[0], 8, 24, 7, 2);            /* the stalk and its foot */
  for (let y = 0; y < 9; y++) { const w = Math.round(10 * Math.sqrt(1 - Math.pow(1 - (y + 1) / 9, 2))); R(g, y < 2 ? cap[2] : y < 6 ? cap[1] : cap[0], 11 - w, 3 + y, w * 2, 1); }
  R(g, cap[2], 6, 4, 4, 1); R(g, on ? '#ffffff' : cap[2], 6, 4, 2, 1);
  R(g, on ? '#e8fff6' : '#6a8a94', 3, 12, 16, 1); for (let k = 4; k < 18; k += 2) R(g, on ? '#8ad8c0' : '#3a5058', k, 13, 1, 2);   /* the gills */
  for (let i = 0; i < 4; i++) { const x = 4 + ((r() * 14) | 0), y = 14 + ((r() * 6) | 0); R(g, cap[1], x, y, 2, 2); R(g, on ? '#ffffff' : cap[2], x, y, 1, 1); }   /* the foxfire buds hung round the stalk */
  return c; });
export function drawLantern(g, pr, cx, cy, time) {
  const on = pr.lit > 0, x = rc(pr.x - cx), y = rc(pr.y - cy);
  if (on) { const k = pr.lit < 2 ? pr.lit / 2 : 1, br = 0.8 + 0.2 * Math.sin(time * 3 + pr.x), r = (pr.light ? pr.light.r : 60) * 1.1;
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * k * br; g.drawImage(halo(GLOW.rgb), x - r, y - 8 - r, r * 2, r * 2); g.restore(); g.globalAlpha = 1;
    /* motes lifting off it */
    for (let i = 0; i < 5; i++) { const t = (time * 0.5 + i * 0.2 + pr.x * 0.01) % 1; g.globalAlpha = (1 - t) * 0.8 * k; R(g, GLOW.hi, x - 8 + ((i * 7 + pr.x) % 16) + Math.sin(t * 6 + i) * 2, y - 14 - t * 26, 1, 1); } g.globalAlpha = 1; }
  else if (Math.floor(time * 1.6 + pr.x) % 4 === 0) { g.globalAlpha = 0.7; R(g, '#8ad8c0', x - 5, y - 12, 1, 1); R(g, '#8ad8c0', x + 4, y - 10, 1, 1); g.globalAlpha = 1; }   /* asleep: a slow blink of its buds */
  g.drawImage(bakeLantern(on), x - 11, y - 25);
}

/* ------------------------------------------------------------------ THE PUFFS, SPORES AND KNOTS (drawn from sporewood-hands.js) ------------------------------------------------------------------ */
const bakePuffSpr = (kind) => once('puff' + kind, () => { const [c, g] = canvas(20, 20), mend = kind === 'mend', base = mend ? '#a8d890' : '#d6d0bc', hi = mend ? '#e4ffc8' : '#f6f2e2', lo = mend ? '#5e8a48' : '#8a8670', cx0 = 10, cy0 = 11, rad = 7;
  for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) { const d = Math.hypot(x, y * 1.05); if (d > rad) continue; const lit = (-x * 0.6 - y * 0.8) / rad; R(g, lit > 0.45 ? hi : lit > -0.1 ? base : lit > -0.55 ? mix(base, lo, 0.5) : lo, cx0 + x, cy0 + y, 1, 1); }
  R(g, lo, cx0 - 1, cy0 - rad + 1, 3, 1); R(g, lo, cx0 - 3, cy0 + rad, 7, 2); R(g, '#6a6248', cx0 - 2, cy0 + rad + 1, 5, 1);
  for (let i = 0; i < 6; i++) R(g, mix(lo, base, 0.4), cx0 + ((hash(i, 3) % 11) - 5), cy0 + ((hash(i, 7) % 9) - 4), 1, 1);
  if (mend) { R(g, '#ffffff', cx0 - 1, cy0 - 1, 3, 1); R(g, '#ffffff', cx0, cy0 - 2, 1, 3); }   /* a pale cross: it mends */
  return c; });
const bakeStump = () => once('stump', () => { const [c, g] = canvas(14, 6); R(g, '#4a4a38', 2, 3, 10, 3); R(g, '#6a6a52', 3, 2, 8, 1); R(g, '#8a8670', 5, 1, 4, 1); return c; });
export function drawWorld(g, S, SP, cx, cy, VW, VH, time) {
  /* MEND PUFFS */
  for (const q of S.mends) { const x = rc(q.x - cx), b = rc(q.y - cy); if (x < -30 || x > VW + 30) continue;
    if (q.state === 'whole') { const bob = rc(Math.sin(time * 2 + q.x) * 0.7); g.drawImage(bakePuffSpr('mend'), x - 10, b - 19 + bob);
      for (let i = 0; i < 3; i++) { const t = (time * 0.55 + i / 3 + q.x * 0.01) % 1; g.globalAlpha = (1 - t) * 0.9; R(g, '#dfffa0', x - 4 + i * 4 + Math.sin(t * 7 + i) * 2, b - 14 - t * 18, 1, 1); } g.globalAlpha = 1; }
    else if (q.state === 'mending') { const k = Math.min(1, q.t / (SP.mendT + 0.6)); g.globalAlpha = 0.5 * (1 - k); g.fillStyle = '#a6e04a'; g.beginPath(); g.ellipse(x, b - 10, 14 + 10 * k, 9 + 6 * k, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + time * 2, rr = 6 + 10 * k + (i % 3) * 2; g.globalAlpha = (1 - k) * 0.9; R(g, i % 2 ? '#dfffa0' : '#ffffff', x + Math.cos(a) * rr, b - 10 + Math.sin(a) * rr * 0.6 - k * 6, 1, 1); } g.globalAlpha = 1; }
    else g.drawImage(bakeStump(), x - 7, b - 6); }
  /* PUFFBALLS */
  for (const q of S.puffs) { const x = rc(q.x - cx), b = rc(q.y - cy); if (x < -30 || x > VW + 30) continue;
    if (q.state === 'whole') { const bob = rc(Math.sin(time * 2 + q.x) * 0.6); g.drawImage(bakePuffSpr('spring'), x - 10, b - 19 + bob); if (Math.floor(time * 1.5 + q.x) % 4 === 0) { g.globalAlpha = 0.7; R(g, '#efe6ff', x + 1, b - 17 + bob - ((time * 8) % 5), 1, 1); g.globalAlpha = 1; } }
    else g.drawImage(bakeStump(), x - 7, b - 6); }
  /* SPRING SPORES: a hovering disc of spores with a foxfire rim, squashing under a foot, fading as it goes */
  for (const s of S.springs) { const x = rc(s.x - cx), y = rc(s.y - cy); if (x < -30 || x > VW + 30) continue; const a = Math.min(1, s.life / 1.2), sq = s.t > 0 ? (s.t -= 1 / 60) * 6 : 0;
    g.globalAlpha = 0.4 * a; g.fillStyle = '#d8d0f0'; g.beginPath(); g.ellipse(x, y + 2 + sq * 0.3, 16, 7 - sq * 0.4, 0, 0, 7); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * a; g.drawImage(halo(GLOW.rgb), x - 22, y - 16, 44, 34); g.restore();
    g.globalAlpha = 0.95 * a; R(g, GLOW.hi, x - SP.springW, y - 4 + rc(sq), SP.springW * 2, 1); R(g, GLOW.c, x - SP.springW + 2, y - 3 + rc(sq), SP.springW * 2 - 4, 1); R(g, '#e8e0d0', x - SP.springW + 3, y - 2 + rc(sq), SP.springW * 2 - 6, 2);
    for (let i = 0; i < 7; i++) { g.globalAlpha = a * (0.6 + 0.4 * Math.sin(time * 5 + i)); R(g, i % 2 ? '#fff1ff' : GLOW.c, x - 12 + i * 4, y - 6 - rc(Math.abs(Math.sin(time * 4 + i)) * 4), 1, 1); }
    g.globalAlpha = 1; }
  /* ROOT KNOTS: the target first (a dotted line straight down onto it); shut it is a gnarl with a glowing seam, open a split root */
  for (const k of S.knots) { const x = rc(k.px - cx), b = rc(k.py - cy); if (x < -30 || x > VW + 30) continue;
    if (!k.open) { const sp = once('rknot', () => { const [c, g2] = canvas(24, 16), r = mulberry(11);
        for (let y = 0; y < 12; y++) { const w = Math.round(10 - Math.abs(y - 6) * 0.5 - (y < 3 ? 3 - y : 0)); R(g2, y < 3 ? '#8a6a56' : y < 8 ? '#5e4236' : '#3a2a22', 12 - w, 3 + y, w * 2, 1); }
        for (let i = 0; i < 6; i++) R(g2, i % 2 ? '#7a5648' : '#2a1e18', 4 + ((r() * 16) | 0), 4 + ((r() * 8) | 0), 4, 1); R(g2, '#2a1e18', 3, 14, 18, 2); return c; });
      g.drawImage(sp, x - 12, b - 15); const gl = Math.floor(time * 3) % 2;
      R(g, gl ? '#fff1a8' : '#ffd36b', x - 4, b - 14, 8, 1); R(g, GLOW.c, x - 1, b - 13, 2, 1); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.3 + 0.15 * gl; g.drawImage(halo('255,211,107'), x - 16, b - 28, 32, 28); g.restore(); g.globalAlpha = 1;
      g.fillStyle = 'rgba(255,233,160,0.5)'; for (let y = b - 44; y < b - 18; y += 5) g.fillRect(x, y, 1, 2);
      R(g, '#ffd36b', x - 2, b - 48, 5, 1); R(g, '#ffd36b', x - 1, b - 47, 3, 1); R(g, '#ffd36b', x, b - 46, 1, 1); }
    else { R(g, '#2a1e18', x - 10, b - 3, 20, 3); R(g, '#5e4236', x - 8, b - 4, 6, 1); R(g, '#5e4236', x + 3, b - 4, 5, 1); R(g, GLOW.lo, x - 3, b - 2, 6, 1); } }
  /* the area banner (the level's own text line): the greybox's, a little taller, in the area's own colour */
}
/* the dark buds' and seed caps' own marks are part of drawGrowcap now */

/* ------------------------------------------------------------------ SPORE CLOUDS (main.js's clouds2 list: x, y, r, life, mild, sleep) ------------------------------------------------------------------ */
export function drawCloud(g, c, cx, cy, time) {
  const x = rc(c.x - cx), y = rc(c.y - cy), a = Math.min(1, c.life * 0.9), r = c.r;
  const col = c.sleep ? ['#9a5aa8', '#c9a0e0', '#efe0ff'] : c.mild ? ['#6ab0a0', '#a8e0d0', '#e0fff4'] : ['#7a8a30', '#b0c050', '#e4ec90'], dots = c.sleep ? '#f0d8ff' : c.mild ? GLOW.hi : '#d85a3a';
  /* the body: seven soft lobes turning slowly */
  for (let i = 0; i < 7; i++) { const an = i / 7 * 6.283 + time * (i % 2 ? 0.7 : -0.5) + c.x * 0.1, rr = r * (0.2 + 0.5 * ((i * 37) % 10) / 10), lr = r * (0.42 + 0.12 * Math.sin(time * 1.3 + i));
    g.globalAlpha = 0.3 * a; g.fillStyle = i % 3 === 0 ? col[2] : i % 3 === 1 ? col[1] : col[0]; g.beginPath(); g.ellipse(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.6, lr, lr * 0.72, 0, 0, 7); g.fill(); }
  /* the edge, drawn as a ring of spores so the reach reads: you are in it if you stand inside the ring */
  const n = Math.max(10, Math.round(r * 0.9)); for (let i = 0; i < n; i++) { const an = i / n * 6.283 + time * 0.4, rr = r * (0.92 + 0.06 * Math.sin(time * 2 + i * 1.7)); g.globalAlpha = (0.55 + 0.3 * Math.sin(time * 3 + i)) * a; R(g, i % 3 === 0 ? col[2] : col[1], x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.72, 1, 1); }
  /* motes drifting up through it */
  for (let i = 0; i < 6; i++) { const t = (time * 0.6 + i / 6) % 1, an = i * 2.1 + c.x; g.globalAlpha = (1 - t) * 0.85 * a; R(g, dots, x + Math.cos(an) * r * 0.6 * (0.4 + t * 0.6), y + r * 0.3 - t * r * 0.9, 1, 1); }
  g.globalAlpha = 1;
}

/* ------------------------------------------------------------------ DECO (the level's own deco kinds, in the area's colours) ------------------------------------------------------------------ */
const toadCluster = (z, v) => once('tc' + z + '_' + v, () => { const P = PAL[z], r = mulberry(v * 7 + z), [c, g] = canvas(26, 20), caps = P.cap;
  const one = (x, h, w, i) => { R(g, STALK[1], x - 1, 20 - h, 3, h); R(g, STALK[0], x + 1, 20 - h, 1, h); for (let y = 0; y < 4; y++) { const ww = Math.round(w * Math.sqrt(1 - Math.pow(1 - (y + 1) / 4, 2))); R(g, y < 1 ? caps[2] : caps[1], x - ww, 20 - h - 3 + y, ww * 2 + 1, 1); } R(g, caps[0], x - w, 20 - h + 1, w * 2 + 1, 1); R(g, '#ece0c0', x - w + 1, 20 - h + 2, w * 2 - 1, 1);
    R(g, mix(caps[2], '#ffffff', 0.4), x - 1, 20 - h - 2, 1, 1); if (z === 1 || z === 5) R(g, GLOW.c, x + 1, 20 - h - 1, 1, 1); void i; };
  one(8, 8 + ((r() * 4) | 0), 5, 0); one(15, 5 + ((r() * 3) | 0), 3, 1); one(20, 7 + ((r() * 3) | 0), 4, 2); return c; });
const tinyCapSpr = (z, v) => once('tn' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(12, 12), caps = P.cap, col = v % 3 === 0 ? caps : v % 3 === 1 ? [caps[0], mix(caps[1], '#d8bc84', 0.5), mix(caps[2], '#f4e6c0', 0.5)] : [mix(caps[0], '#2a1a30', 0.3), mix(caps[1], '#8a6a98', 0.4), mix(caps[2], '#d8c0e0', 0.4)];
  R(g, STALK[1], 5, 6, 2, 5); R(g, STALK[0], 6, 6, 1, 5); for (let y = 0; y < 4; y++) { const w = Math.round(5 * Math.sqrt(1 - Math.pow(1 - (y + 1) / 4, 2))); R(g, y < 1 ? col[2] : col[1], 6 - w, 3 + y, w * 2, 1); } R(g, col[0], 1, 7, 10, 1); R(g, '#f0e4c4', 3, 4, 2, 1); if (z === 1 || z === 5) R(g, GLOW.c, 7, 4, 1, 1); return c; });
const podSpr = (z, v) => once('pd' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(18, 22), r = mulberry(v + z * 9);
  for (const [x, h] of [[4, 12 + ((r() * 4) | 0)], [9, 17 + ((r() * 3) | 0)], [14, 10 + ((r() * 4) | 0)]]) { R(g, '#6a6248', x, 22 - h, 1, h); R(g, STALK[1], x - 1, 22 - h + 4, 1, h - 4);
    const rd = 3; for (let dy = -rd; dy <= rd; dy++) for (let dx = -rd; dx <= rd; dx++) if (dx * dx + dy * dy <= rd * rd) R(g, dx + dy < -1 ? P.cap[2] : dx + dy > 1 ? P.cap[0] : P.cap[1], x + dx, 22 - h + dy, 1, 1); R(g, '#f4ecd0', x - 1, 22 - h - 1, 1, 1); if (z === 1 || z === 5 || z === 4) R(g, GLOW.c, x, 22 - h, 1, 1); }
  return c; });
const rootTangle = (z, v) => once('rt' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(28, 14), r = mulberry(v * 5 + z);
  for (let i = 0; i < 5; i++) { let x = 2 + i * 5, y = 13; const dir = i % 2 ? 1 : -1; for (let k = 0; k < 10 + ((r() * 6) | 0); k++) { R(g, P.s[3], x, y, 2, 2); R(g, P.s[5], x, y, 1, 1); y -= 1; x += dir * (k % 2); if (y < 1) break; } }
  R(g, P.s[1], 0, 12, 28, 2); return c; });
const webSpr = (v) => once('cw' + v, () => { const [c, g] = canvas(24, 22), r = mulberry(v + 40); R(g, '#bab69e', 0, 0, 24, 1);
  for (let i = 0; i < 6; i++) { const x0 = 2 + i * 4, len = 8 + ((r() * 12) | 0); for (let k = 0; k < len; k++) R(g, k % 3 ? '#e6e2d2' : '#a8a490', x0 + Math.sin(k * 0.5 + i) * 1.2, 1 + k, 1, 1); }
  for (let y = 5; y < 20; y += 5) for (let x = 2; x < 22; x += 2) R(g, '#cfcbb8', x, y + ((x >> 1) % 2), 1, 1); return c; });
/* decoOf(e): [sprite, bg flag] in main.js's deco table form, for the kinds this level's art owns; null = the shared kit draws it */
export function decoOf(e) {
  const z = zoneOf(e.x), v = e.v || 0;
  switch (e.kind) {
    case 'mushroom': return [toadCluster(z, v % 3), true];
    case 'sporePod': return [podSpr(z, v % 3), true];
    case 'tinyCap': return [tinyCapSpr(z, v), true];
    case 'rootDecor': return [rootTangle(z, v % 3), true];
    case 'cobweb': return [webSpr(v % 3), true];
    default: return null;
  }
}
/* bake the lot at the level load (no hitch in the first frames) */
export function warm() { for (let z = 0; z < 6; z++) { for (let v = 0; v < 3; v++) { toadCluster(z, v); podSpr(z, v); tinyCapSpr(z, v); rootTangle(z, v); } } bakeLantern(true); bakeLantern(false); bakePuffSpr('mend'); bakePuffSpr('spring'); halo(GLOW.rgb); halo('255,211,107'); }
