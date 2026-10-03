// src/redraw/djinn_art.js - THE DJINN OF THE GREAT WELL, drawn (claude/welltown5). Drawn live from his pose, like the Cistern Queen: a broad bare
// torso with gold-banded arms and BROKEN SHACKLES on both wrists (he was bound at the bottom of the well), a bald head with a topknot, pointed ears and
// burning eyes, a crescent beard - and from the waist down a WHIRL that tapers to the floor. The silhouette is the read: a man's shoulders twice a
// hero's height on a spinning cone. His stuff changes with the phase: SAND (ochre, grains streaming round the cone), MUD (brown, solid, cracked,
// dripping), FIRE (dark coal skin with flame running off it), SMOKE (grey, guttering), WATER (a blue glassy column rising out of the flood, bigger).
//   drawDjinn(g, e, S, x, y, time)   x, y = his base on screen.   drawOver(g, e, S, cx, cy, time) his tells and what he throws.   bakeDjinn() -> a sprite set
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';

const R = Math.round;
const fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const ell = (g, c, x, y, rx, ry) => { g.fillStyle = c; g.beginPath(); g.ellipse(R(x), R(y), Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2); g.fill(); };
const poly = (g, c, pts) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
const ln = (g, c, w, pts) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
export const LOOK = {
  sand: { skin: '#c99a5a', skinD: '#8a6438', skinL: '#ecc98a', cone: '#d8b070', coneD: '#a8804a', grain: '#f2dca0', eye: '#fff2a0' },
  mud: { skin: '#6e4a2c', skinD: '#4a3018', skinL: '#8e6a44', cone: '#5e3e24', coneD: '#3e2814', grain: '#7a5a3a', eye: '#e8c060' },
  fire: { skin: '#3a1a14', skinD: '#200c08', skinL: '#7a2e18', cone: '#d84a14', coneD: '#7a2410', grain: '#ffd36b', eye: '#ffffff' },
  smoke: { skin: '#6a6460', skinD: '#46403c', skinL: '#8e8884', cone: '#7a7470', coneD: '#504a46', grain: '#a8a29e', eye: '#ffb84a' },
  water: { skin: '#3a7ab8', skinD: '#1c4a80', skinL: '#8cc8f0', cone: '#2c68a8', coneD: '#1a4a7a', grain: '#d8f0ff', eye: '#e8ffff' },
};
const GOLD = '#e0b040', GOLDD = '#9a7420', IRON = '#4a4e56', IRONL = '#8a909a';
export function lookOf(e, S) { if (S.ph === 3 || e.mode === 'bailed') return 'water'; if (e.mode === 'mud') return 'mud'; if (S.ph === 2) return S.burn || S.flare > 0 ? 'fire' : 'smoke'; return 'sand'; }

/* THE BODY in his own frame: origin at his base, +x forward, -y up. o = { t, look, arm: 'rest'|'lash'|'up'|'slam'|'cast', breath, k (scale), slump } */
export function drawBody(g, o) {
  const L = LOOK[o.look] || LOOK.sand, t = o.t || 0, k = o.k || 1;
  g.save(); g.scale(k, k);
  const sl = o.slump ? 18 : 0, top = -78 + sl;
  /* THE WHIRL: a cone from the waist to the floor, its bands turning */
  const ws = 22, waistY = -38 + sl;
  poly(g, L.coneD, [[-ws, waistY], [ws, waistY], [5, 0], [-5, 0]]);
  poly(g, L.cone, [[-ws + 3, waistY], [ws - 5, waistY], [3, -2], [-3, -2]]);
  for (let i = 0; i < 6; i++) { const ph = (t * 2.4 + i / 6) % 1, y = waistY + ph * (-waistY), w = ws * (1 - ph * 0.8); ln(g, L.grain, 1.2, [[-w, y], [w * 0.2, y + 2], [w, y]]); }
  if (o.look === 'sand' || o.look === 'smoke') for (let i = 0; i < 10; i++) { const a = t * 5 + i * 0.63, r = 10 + (i % 4) * 5; fr(g, L.grain, Math.cos(a) * r, waistY + 6 + (i * 7) % 30, 1.5, 1.5); }
  if (o.look === 'mud') for (let i = 0; i < 4; i++) { const yy = waistY + ((t * 30 + i * 9) % (-waistY)); fr(g, L.coneD, -8 + i * 5, yy, 2, 3); }
  /* THE TORSO: broad shoulders, the chest, a sash at the waist */
  poly(g, L.skinD, [[-24, top + 22], [24, top + 22], [17, waistY + 2], [-17, waistY + 2]]);
  poly(g, L.skin, [[-22, top + 23], [22, top + 23], [15, waistY], [-15, waistY]]);
  ell(g, L.skinL, -8, top + 30, 7, 5); ell(g, L.skinL, 8, top + 30, 7, 5); fr(g, L.skinD, -1, top + 26, 2, 14);
  fr(g, '#b8302a', -17, waistY - 4, 34, 5); fr(g, GOLD, -17, waistY - 4, 34, 1); fr(g, '#8a2020', 12, waistY, 4, 9);
  /* THE ARMS: gold bands, and the shackles he broke - an iron cuff and a hanging link on each wrist */
  const arm = o.arm || 'rest';
  const sh = [[-22, top + 25], [22, top + 25]];
  const hands = { rest: [[-30, top + 52], [30, top + 52]], lash: [[-30, top + 50], [58, top + 34]], up: [[-30, top + 2], [30, top + 2]], slam: [[-8, top - 6], [8, top - 6]], cast: [[-34, top + 36], [40, top + 30]] }[arm] || [[-30, top + 52], [30, top + 52]];
  for (let s = 0; s < 2; s++) { const [ax, ay] = sh[s], [hx, hy] = hands[s], ex = (ax + hx) / 2 + (s ? 6 : -6), ey = (ay + hy) / 2 + 4;
    ln(g, '#120c0a', 11, [[ax, ay], [ex, ey], [hx, hy]]); ln(g, L.skinD, 9, [[ax, ay], [ex, ey], [hx, hy]]); ln(g, L.skin, 6, [[ax, ay], [ex, ey], [hx, hy]]);
    ell(g, GOLD, (ax + ex) / 2, (ay + ey) / 2, 4, 3); ell(g, IRON, hx, hy - 2, 5, 4); fr(g, IRONL, hx - 4, hy - 4, 8, 1);
    const sw = Math.sin(t * 4 + s) * 3; ell(g, IRON, hx + sw, hy + 5, 2.4, 3); ell(g, IRON, hx + sw * 1.5, hy + 10, 2.4, 3); ell(g, L.skinL, hx, hy - 7, 4, 3); }
  /* THE HEAD: bald, a topknot, pointed ears, burning eyes, a crescent beard */
  const hy = top + 10; ell(g, '#120c0a', 0, hy, 12, 13); ell(g, L.skin, 0, hy, 11, 12); ell(g, L.skinL, -3, hy - 5, 5, 4);
  poly(g, L.skin, [[-10, hy - 2], [-19, hy - 9], [-10, hy + 3]]); poly(g, L.skin, [[10, hy - 2], [19, hy - 9], [10, hy + 3]]);
  ell(g, L.skinD, 0, hy - 13, 4, 4); poly(g, L.skinD, [[-2, hy - 15], [2, hy - 15], [6, hy - 26], [0, hy - 21]]); fr(g, GOLD, -3, hy - 14, 6, 2);
  poly(g, L.skinD, [[-9, hy + 4], [9, hy + 4], [4, hy + 18], [0, hy + 22], [-4, hy + 18]]);
  const eg = o.breath ? '#fff2c0' : L.eye; fr(g, eg, -6, hy - 2, 4, 2); fr(g, eg, 3, hy - 2, 4, 2);
  if (o.breath) { ell(g, '#ffd36b', 12, hy + 6, 4, 3); }
  /* FIRE runs off him, and smoke from him guttering */
  if (o.look === 'fire') for (let i = 0; i < 9; i++) { const fx = -20 + ((i * 13 + R(t * 40)) % 40), fy = top + 18 + (i * 11) % 50, h = 6 + 6 * Math.abs(Math.sin(t * 9 + i)); g.globalAlpha = 0.9; fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', fx, fy - h, 3, h); g.globalAlpha = 1; }
  if (o.look === 'smoke' || o.flare) for (let i = 0; i < 5; i++) { const a = (t * 0.8 + i * 0.2) % 1; g.globalAlpha = 0.5 * (1 - a); ell(g, o.flare ? '#ff9a3c' : '#9aa39a', -10 + i * 5, top - a * 26, 4 + a * 4, 3 + a * 3); g.globalAlpha = 1; }
  if (o.look === 'water') { g.globalAlpha = 0.5; for (let i = 0; i < 6; i++) fr(g, '#e8f8ff', -16 + i * 6, top + 26 + ((t * 40 + i * 13) % 40), 1, 6); g.globalAlpha = 1; }
  if (o.look === 'mud') for (let i = 0; i < 5; i++) fr(g, L.skinD, -14 + i * 7, top + 34 + (i % 3) * 6, 4, 1);
  g.restore();
}

/* HIM ON THE SCREEN */
export function drawDjinn(g, e, S, x, y, time) {
  const m = e.mode, look = lookOf(e, S), tellHot = /Tell$/.test(m), face = e.face || 1;
  const o = { t: time, look, arm: 'rest', breath: false, flare: S.flare > 0 };
  if (m === 'lashTell' || m === 'flashTell') o.arm = 'cast'; if (m === 'lash' || m === 'flash') o.arm = 'lash';
  if (m === 'blastTell' || m === 'blast' || m === 'devilTell' || m === 'pillarTell' || m === 'pillar' || m === 'catch' || m === 'rise') o.arm = 'up';
  if (m === 'breathTell' || m === 'breath') o.breath = true; if (m === 'slamTell' || m === 'spoutTell') o.arm = 'up'; if (m === 'slam' || m === 'reach') o.arm = 'slam';
  if (m === 'mud' || m === 'doused' || m === 'bailed') o.slump = true;
  g.save(); g.translate(x, y);
  if (S.pose === 'column') { o.k = 1.5; g.translate(0, -Math.min(40, (S.water || 0) * 0.6)); }
  if (m === 'sleep') { g.restore(); return; }
  if (m === 'wake') { const k = Math.min(1, 1 - Math.max(0, e.modeT) / 2.0); g.translate(0, (1 - k) * 60); g.globalAlpha = 0.3 + 0.7 * k; }
  g.scale(face, 1);
  if ((tellHot && Math.floor(time * 14) % 2 === 0 && e.modeT < 0.3) || e.flash > 0) { g.globalAlpha *= 0.85; }
  drawBody(g, o);
  g.restore(); g.globalAlpha = 1;
  /* WHIRLING (phase one, dried back to sand): a storm round him - water is flung off */
  if (S.wary > 0 && S.ph === 1 && !(e.open > 0)) for (let i = 0; i < 18; i++) { const a = time * 9 + i * 0.35, r = 26 + (i % 3) * 6; fr(g, i % 2 ? '#d8b070' : '#f2dca0', x + Math.cos(a) * r, y - 10 - (i * 5) % 70 + Math.sin(a) * 3, 2, 2); }
  /* a blade through him: grains (sand), sparks (fire) or a splash (water) where it went */
  if (e.passFx > 0) { const c = look === 'fire' ? '#ffd36b' : look === 'water' ? '#e8f8ff' : '#f2dca0'; for (let i = 0; i < 5; i++) fr(g, c, x + (i - 2) * 6, y - 40 - i * 4, 2, 2); }
}

/* OVER EVERYTHING: the flood, his marks on the floor, what runs and flies, his hand, the opening's clock */
export function drawOver(g, e, S, cx, cy, time) {
  const G = S.G, F = G.floor - cy, X = x => R(x - cx), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
  if (S.water > 0.5) { const top = R(F - S.water); g.globalAlpha = 0.5; g.fillStyle = '#2a5a7a'; g.fillRect(X(G.x0), top, X(G.x1) - X(G.x0), R(S.water) + 2); g.globalAlpha = 0.85; g.fillStyle = '#7ab8e8';
    for (let x = G.x0; x < G.x1; x += 6) g.fillRect(X(x), top + R(Math.sin(time * 4 + x * 0.1)), 4, 1); g.globalAlpha = 1; }
  for (const mk of S.marks) { const x = X(mk.x), y = R(mk.y - cy), k = Math.max(0, Math.min(1, 1 - mk.t / 0.9));
    if (mk.fire > 0 || (e.mode === 'pillar' && mk.k === 'pillar')) { for (let i = -3; i <= 3; i++) { const h = 30 + 30 * Math.abs(Math.sin(time * 14 + i)); fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', x + i * 4 - 1, y - h, 3, h); } continue; }
    const col = mk.k === 'spout' ? '#7ab8e8' : mk.k === 'slam' ? '#3a7ab8' : '#ff9a3c';
    g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = col; g.beginPath(); g.ellipse(x, y - 1, 8 + k * 14, 3 + k * 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 22, 5, 0, 0, Math.PI * 2); g.stroke(); }
  if (e.mode === 'spout' && S.cur && S.cur.x != null) { const x = X(S.cur.x), y = R(S.cur.y - cy); for (let i = 0; i < 6; i++) fr(g, i % 2 ? '#7ab8e8' : '#e8f8ff', x - 10 + i * 4, y - 50 - R(6 * Math.sin(time * 16 + i)), 3, 50); }
  if (S.held && S.cur && S.cur.x != null) { const x = X(S.cur.x), y = R(S.cur.y - cy); g.globalAlpha = 0.6; fr(g, '#3a7ab8', x - 12, y - 46, 24, 46); g.globalAlpha = 1; }
  if (e.mode === 'breathTell' || e.mode === 'breath') { const fx = e.face || 1, x0 = fx > 0 ? e.x + 10 : e.x - 150, w = 140; if (e.mode === 'breathTell') { g.globalAlpha = 0.25 + 0.3 * Math.abs(Math.sin(time * 14)); fr(g, '#ffb84a', X(x0), R(F - 24), w, 3); g.globalAlpha = 1; }
    else for (let i = 0; i < 14; i++) { const xx = x0 + ((i * 11 + time * 300) % w); fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', X(xx), R(F - 32 + (i % 4) * 4), 6, 4); } }
  for (const b of S.bands) { const x = X(b.x), y0 = R(b.y[0] - cy), y1 = R(b.y[1] - cy);
    if (b.k === 'devil') { for (let i = 0; i < 8; i++) { const yy = y1 - i * ((y1 - y0) / 8), w = 3 + i * 1.6, a = time * 18 + i; fr(g, i % 2 ? '#d8b070' : '#f2dca0', x + Math.cos(a) * w - 1, yy, 3, 3); } }
    else { g.fillStyle = '#7ab8e8'; g.beginPath(); g.moveTo(x - b.dir * 20, y1); g.quadraticCurveTo(x - b.dir * 4, y0 - 2, x + b.dir * 6, y1); g.fill(); fr(g, '#e8f8ff', x - 2, y0, 3, 2); } }
  for (const s of S.shots) { fr(g, '#8a6a3e', X(s.x) - 2, R(s.y - cy) - 2, 4, 4); fr(g, '#f2dca0', X(s.x) - 2, R(s.y - cy) - 2, 2, 1); }
  /* HIS HAND resting on a ledge: a fist of water, glinting - strike it */
  if (S.hand && S.hand.stay > 0) { const x = X(S.hand.x), y = R(S.hand.y - cy), p = 0.5 + 0.5 * Math.sin(time * 14);
    g.globalAlpha = 0.85; ell(g, '#2c68a8', x, y - 6, 13, 9); ell(g, '#8cc8f0', x - 3, y - 9, 6, 3); g.globalAlpha = 1; fr(g, IRON, x - 6, y - 16, 12, 4);
    g.strokeStyle = 'rgba(255,255,255,' + (0.55 + 0.45 * p) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 6, 16 + p * 3, 0, Math.PI * 2); g.stroke();
    const k2 = 2 + R(p * 2); fr(g, '#ffffff', x, y - 28 - k2, 1, 2 * k2 + 1); fr(g, '#ffffff', x - k2, y - 28, 2 * k2 + 1, 1);
    g.fillStyle = '#1b1626'; g.fillRect(x - 12, y + 4, 24, 2); g.fillStyle = '#8fd160'; g.fillRect(x - 12, y + 4, R(24 * Math.max(0, S.hand.stay / 1.5)), 2); }
  if (e.open > 0) { const x = X(e.x), y = R(e.y - 100 - cy), k = Math.max(0, e.open / 3.2); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y, 40, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 20, y, R(40 * k), 3); }
}

/* THE SPRITE SET for the bestiary card and the body he leaves (frame 0 sand, 1 fire, 2 spent - he goes back down the well as mud) */
export const DJ_F = { stand: 0, fire: 1, dead: 2 };
let SET = null;
export function bakeDjinn() {
  if (SET) return SET;
  const W = 140, H = 130, ax = 70, ay = 124;
  const F = [0, 1, 2].map(f => { const [c, g] = canvas(W, H); g.save(); g.translate(ax, ay); drawBody(g, { t: 0.3, look: f === 1 ? 'fire' : f === 2 ? 'mud' : 'sand', arm: f === 1 ? 'up' : 'rest', slump: f === 2 }); g.restore(); outline(c, OUT); return c; });
  SET = { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax, ay, w: 44, h: 80 };
  return SET;
}
