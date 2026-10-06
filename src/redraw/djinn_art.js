// src/redraw/djinn_art.js - THE DJINN OF THE GREAT WELL, drawn (claude/welltown5). Drawn live from his pose, like the Cistern Queen: a broad bare
// torso with gold-banded arms and BROKEN SHACKLES on both wrists (he was bound at the bottom of the well), a bald head with a topknot, pointed ears and
// burning eyes, a crescent beard - and from the waist down a WHIRL that tapers to the floor. The silhouette is the read: a man's shoulders twice a
// hero's height on a spinning cone. His stuff changes with the phase: SAND (ochre, grains streaming round the cone), MUD (brown, solid, cracked,
// dripping), FIRE (dark coal skin with flame running off it), SMOKE (grey, guttering), WATER (a blue glassy column rising out of the flood, bigger).
//   drawDjinn(g, e, S, x, y, time)   x, y = his base on screen.   drawOver(g, e, S, cx, cy, time) his tells and what he throws.   bakeDjinn() -> a sprite set
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';
import { DJ } from '../djinn.js'; import * as DJG from '../djinn.js';
const DJ_SPEAR_TELL = DJ.spearTell;

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
export function lookOf(e, S) { if (e.mode === 'hiss') return 'smoke'; if (e.mode === 'collapse') return 'sand'; if (S.ph === 3 || e.mode === 'bailed') return 'water'; if (e.mode === 'mud') return 'mud'; if (S.ph === 2) return S.burn || S.flare > 0 ? 'fire' : 'smoke'; return 'sand'; }

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
  const o = { t: time, look, arm: 'rest', breath: false, flare: S.flare > 0 || (S.ph === 2 && S.ward > 0) };
  if (m === 'lashTell' || m === 'flashTell') o.arm = 'cast'; if (m === 'lash' || m === 'flash') o.arm = 'lash';
  if (m === 'blastTell' || m === 'blast' || m === 'devilTell' || m === 'pillarTell' || m === 'pillar' || m === 'catch' || m === 'rise') o.arm = 'up';
  if (m === 'spearsTell' || m === 'spears' || m === 'whirlTell' || m === 'whirl') o.arm = 'slam'; if (m === 'firedevilTell' || m === 'firedevil') o.arm = 'cast';   /* (claude/djinn2: his new moves - both fists down for the spears and the well's turn, a cast for the fire devil) */
  if (m === 'breathTell' || m === 'breath') o.breath = true; if (m === 'slamTell' || m === 'spoutTell') o.arm = 'up'; if (m === 'slam' || m === 'reach') o.arm = 'slam';
  if (m === 'mud' || m === 'doused' || m === 'bailed' || m === 'choked') o.slump = true;   /* (claude/djinn4: and choked on the pail) */
  if (m === 'upsurgeTell' || m === 'upsurge') o.arm = 'slam'; if (m === 'drawing') o.arm = 'up';   /* (claude/djinn3) both fists down for the blow from below; arms up to drink the well */
  g.save(); g.translate(x, y);
  if (S.pose === 'column') { o.k = 1.5; g.translate(0, -Math.min(40, (S.water || 0) * 0.6)); }
  if (m === 'sleep') { g.restore(); return; }
  /* THE TURNS (claude/djinn3): P1 -> P2 the sand COLLAPSES (he sinks into a heap, grains streaming off) and RE-FORMS out of it as fire (rising, flames
     catching from the feet up); P2 -> P3 the fire HISSES OUT (grey, smoking, sinking into the sump), then he rises in the flood (the 'rise' below) */
  if (m === 'collapse' || m === 'reform' || m === 'hiss') {
    const T = m === 'collapse' ? DJ.collapseT : m === 'reform' ? DJ.reformT : DJ.hissT, k = Math.max(0, Math.min(1, 1 - Math.max(0, e.modeT) / T));
    const down = m === 'reform' ? 1 - k : k;   /* 0 = standing, 1 = gone into the heap / the sump */
    g.save(); g.beginPath(); g.rect(-90, -200, 180, 200); g.clip(); g.translate(0, down * 70); g.globalAlpha = 1 - 0.55 * down; g.scale(face, 1);
    drawBody(g, { ...o, look: m === 'reform' ? 'fire' : m === 'hiss' ? 'smoke' : 'sand', arm: m === 'reform' ? 'up' : 'rest', slump: down > 0.3 }); g.restore(); g.globalAlpha = 1;
    /* the heap he falls into and rises out of, and what comes off him */
    const hw = 34 * (m === 'hiss' ? 1 - k * 0.6 : m === 'reform' ? 1 - k * 0.7 : 0.3 + 0.7 * k), hh = 16 * (m === 'reform' ? 1 - k : m === 'hiss' ? 0.5 : k);
    if (hh > 0.5) poly(g, m === 'hiss' ? '#6a6460' : '#c9a46a', [[-hw, 0], [hw, 0], [0, -hh]]);
    for (let i = 0; i < 12; i++) { const ph = (time * 1.6 + i / 12) % 1, xx = (i - 6) * 5 + Math.sin(time * 5 + i) * 3;
      if (m === 'collapse') fr(g, i % 2 ? '#d8b070' : '#f2dca0', xx, -70 + ph * 70, 2, 2);
      else if (m === 'reform') { g.globalAlpha = 1 - ph; fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', xx, -ph * 80, 2, 4); g.globalAlpha = 1; }
      else { g.globalAlpha = 0.6 * (1 - ph); ell(g, i % 2 ? '#e8f4f8' : '#c8d0d8', xx, -20 - ph * 90, 4 + ph * 6, 3 + ph * 4); g.globalAlpha = 1; } }
    g.restore(); return; }
  if (m === 'wake') { /* (claude/djinn2) the seal cracks (the first second: nothing of him yet), sand pours down the shaft and heaps, and he forms out of the heap */
    const T = 3.4, el = T - Math.max(0, e.modeT); if (el < 1.0) { g.restore(); return; }
    const k = Math.min(1, (el - 1.0) / (T - 1.4)); g.translate(0, (1 - k) * 60); g.globalAlpha = 0.15 + 0.85 * k; }
  g.scale(face, 1);
  if ((tellHot && Math.floor(time * 14) % 2 === 0 && e.modeT < 0.3) || e.flash > 0) { g.globalAlpha *= 0.85; }
  drawBody(g, o);
  g.restore(); g.globalAlpha = 1;
  /* HIS WARD (claude/djinn2), after every opening - drawn so it reads at a glance, and it thins as it runs out (the last half-second blinks):
     P1 THE SAND HARDENS: a glittering shell of packed sand round him; P2 WHITE-HOT: a white core and a halo as wide as his heat now reaches; P3 A SHROUD
     OF WATER: rings spinning round the column */
  if (S.ward > 0 && !(e.open > 0) && !(S.ward < 0.5 && Math.floor(time * 12) % 2)) { const w = Math.min(1, S.ward / 1.0), col = S.pose === 'column';
    const cy0 = col ? y - 80 - Math.min(40, (S.water || 0) * 0.6) : y - 38, rx = col ? 44 : 30, ry = col ? 92 : 44;
    if (S.ph === 1) { g.globalAlpha = 0.28 * w + 0.12; ell(g, '#e8d8a0', x, cy0, rx, ry); g.globalAlpha = 1; g.strokeStyle = '#fff2c0'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, cy0, rx, ry, 0, 0, Math.PI * 2); g.stroke();
      for (let i = 0; i < 14; i++) { const a = i * 0.45 + time * 0.6, gl = Math.sin(time * 9 + i * 1.7) > 0.4; fr(g, gl ? '#ffffff' : '#c9a46a', x + Math.cos(a) * rx * 0.92, cy0 + Math.sin(a) * ry * 0.92, gl ? 2 : 1, gl ? 2 : 1); } }
    else if (S.ph === 2) { g.globalAlpha = 0.18 + 0.12 * Math.abs(Math.sin(time * 10)); ell(g, '#fff2c0', x, y - 34, 17 + 34, 40); g.globalAlpha = 0.5; ell(g, '#ffffff', x, y - 40, 16, 30); g.globalAlpha = 1;
      g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 34, 17 + 34, 40, 0, 0, Math.PI * 2); g.stroke(); }
    else { g.strokeStyle = '#bfe4ff'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { const yy = cy0 - ry * 0.7 + i * ry * 0.45, ph = time * 7 + i * 1.3; g.globalAlpha = 0.5 + 0.3 * w; g.beginPath(); g.ellipse(x, yy, rx, 7, 0, ph % (Math.PI * 2), ph % (Math.PI * 2) + Math.PI * 1.3); g.stroke(); } g.globalAlpha = 1; } }
  /* (claude/djinn4) HE REARS UP: his CORE lights in the column - a white-gold heart, pulsing - the pail's target. CHOKED: water gouts out of it */
  if (S.pose === 'column' && (DJG.REAR.has(m) || m === 'choked')) { const lift = Math.min(40, (S.water || 0) * 0.6), cy0 = y - 96 - lift, p = 0.5 + 0.5 * Math.sin(time * 16);
    if (m === 'choked') { for (let i = 0; i < 8; i++) { const ph = (time * 2.2 + i / 8) % 1; g.globalAlpha = 1 - ph; fr(g, i % 2 ? '#e8f8ff' : '#7ab8e8', x + Math.sin(i * 2.1 + time * 5) * 10 * ph, cy0 - 4 - ph * 34, 2, 3); } g.globalAlpha = 1; }
    else if (!(S.ward > 0)) { g.globalAlpha = 0.35 + 0.35 * p; ell(g, '#fff6c8', x, cy0, 11 + 3 * p, 11 + 3 * p); g.globalAlpha = 1; ell(g, '#ffd36b', x, cy0, 6, 6); fr(g, '#ffffff', x - 1, cy0 - 3, 2, 2);
      g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x, cy0, 16 + 3 * p, 0, Math.PI * 2); g.stroke(); } }
  /* a blade through him: grains (sand), sparks (fire) or a splash (water) where it went */
  if (e.passFx > 0) { const c = look === 'fire' ? '#ffd36b' : look === 'water' ? '#e8f8ff' : '#f2dca0'; for (let i = 0; i < 5; i++) fr(g, c, x + (i - 2) * 6, y - 40 - i * 4, 2, 2); }
}

/* OVER EVERYTHING: the flood, his marks on the floor, what runs and flies, his hand, the opening's clock */
export function drawOver(g, e, S, cx, cy, time) {
  const G = S.G, F = G.floor - cy, X = x => R(x - cx), blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
  if (S.water > 0.5) { const top = R(F - S.water); g.globalAlpha = 0.5; g.fillStyle = '#2a5a7a'; g.fillRect(X(G.x0), top, X(G.x1) - X(G.x0), R(S.water) + 2); g.globalAlpha = 0.85; g.fillStyle = '#7ab8e8';
    for (let x = G.x0; x < G.x1; x += 6) g.fillRect(X(x), top + R(Math.sin(time * 4 + x * 0.1)), 4, 1); g.globalAlpha = 1;
    /* THE DEEP WATER (claude/djinn3): over the ledges, a darker band where it is deep - the floor is the drowning part */
    if (S.water > G.floor - G.ledgeY + 4) { g.globalAlpha = 0.25; g.fillStyle = '#0e2a44'; g.fillRect(X(G.x0), R(G.ledgeY - cy) + 8, X(G.x1) - X(G.x0), R(G.floor - G.ledgeY) - 8); g.globalAlpha = 1; } }
  /* THE SURGE, TOLD (claude/djinn3): a foam line blinks where the water will reach, over the ledges, and bubbles boil up along the floor */
  if (S.tide && S.tide.st === 'surge') { const hy = R(F - ((G.floor - G.ledgeY) + DJ.overLedge)), on = Math.floor(time * 8) % 2;
    g.globalAlpha = on ? 0.95 : 0.45; for (let x = G.x0 + 4; x < G.x1 - 4; x += 10) { fr(g, '#e8f8ff', X(x), hy + R(Math.sin(time * 6 + x * 0.07)), 6, 1); fr(g, '#7ab8e8', X(x) + 2, hy + 2, 3, 1); } g.globalAlpha = 1;
    for (let i = 0; i < 16; i++) { const ph = (time * 1.8 + i / 16) % 1, bx = X(G.x0 + 20 + ((i * 97) % (G.x1 - G.x0 - 40))), by = R(F - ph * Math.max(10, S.water)); g.globalAlpha = 0.8 - ph * 0.5; g.strokeStyle = '#e8f8ff'; g.lineWidth = 1; g.beginPath(); g.arc(bx, by, 1 + (i % 3), 0, Math.PI * 2); g.stroke(); }
    g.globalAlpha = 1; }
  /* EVERYTHING BELOW IS CLIPPED TO THE HALL (claude/djinn2: the high ripples ran out over the walls) */
  g.save(); g.beginPath(); g.rect(X(G.x0), R(G.vault - cy) - 200, X(G.x1) - X(G.x0), R(G.floor - G.vault) + 210); g.clip();
  /* HE FORMS (claude/djinn2): after the last seal cracks, sand pours out of it in a stream and heaps on the floor where he rises */
  if (e.mode === 'wake') { const el = DJ.wakeT - Math.max(0, e.modeT); if (el > 0.8) { const k = Math.min(1, (el - 0.8) / 1.6), x0 = X(e.x), top = R(G.seal.y - cy) + 10, fl = R(G.floor - cy);
    g.globalAlpha = 0.85 * (el < DJ.wakeT - 0.6 ? 1 : Math.max(0, (DJ.wakeT - el) / 0.6)); for (let i = 0; i < 16; i++) { const yy = top + ((time * 260 + i * 37) % Math.max(10, fl - top)); fr(g, i % 2 ? '#d8b070' : '#f2dca0', x0 - 6 + (i * 5) % 12, yy, 2, 4); }
    g.globalAlpha = 1; poly(g, '#c9a46a', [[x0 - 30 * k, fl], [x0 + 30 * k, fl], [x0, fl - 14 * k]]); } }
  /* THE WHIRLPOOL (claude/djinn2): told - the water starts to turn round the shaft; turning - spirals drawn in to it, and a dark eye under the shaft */
  if ((e.mode === 'whirlTell' || e.mode === 'whirl') && S.water > 4) { const top = R(F - S.water), mx = X(G.mid), on = e.mode === 'whirl';
    for (let i = 0; i < (on ? 7 : 3); i++) { const ph = ((time * (on ? 0.9 : 0.4) + i / 7) % 1), r = (1 - ph) * 230, a = 0.25 + 0.55 * ph;
      g.globalAlpha = a; g.strokeStyle = i % 2 ? '#bfe4ff' : '#e8f8ff'; g.lineWidth = 1; g.beginPath(); g.ellipse(mx, top + 3, Math.max(2, r), Math.max(1, r * 0.06), 0, 0, Math.PI * 2); g.stroke(); }
    if (on) { g.globalAlpha = 0.55; ell(g, '#163a5a', mx, top + 3, 22, 4); g.globalAlpha = 0.8; for (let i = 0; i < 10; i++) { const a = time * 6 + i * 0.63, r = 8 + (i % 4) * 7; fr(g, '#e8f8ff', mx + Math.cos(a) * r, top + 2 + Math.sin(a) * 2 + (i * 5) % R(Math.max(6, S.water - 6)), 2, 1); } }
    g.globalAlpha = 1; }
  for (const mk of S.marks) { const x = X(mk.x), y = R(mk.y - cy), k = Math.max(0, Math.min(1, 1 - mk.t / 0.9));
    /* SAND SPEARS (claude/djinn2): told - a glow under your feet, brighter as it comes; then the spears erupt from the floor */
    if (mk.k === 'spear') { if (mk.fire > 0) { for (let i = -2; i <= 2; i++) { const h = 26 + 12 * (1 - Math.abs(i) / 2); poly(g, i % 2 ? '#c9a46a' : '#e8c98a', [[x + i * 6 - 3, y], [x + i * 6 + 3, y], [x + i * 6, y - h]]); fr(g, '#fff2c0', x + i * 6, y - h, 1, 3); } continue; }
      const kk = Math.max(0, Math.min(1, 1 - mk.t / DJ_SPEAR_TELL)); g.globalAlpha = 0.3 + 0.6 * kk; ell(g, '#ffd36b', x, y - 1, 6 + kk * 10, 2 + kk * 2); g.globalAlpha = 1;
      for (let i = 0; i < 4; i++) fr(g, '#f2dca0', x - 9 + i * 6, y - 2 - R(kk * 6 * Math.abs(Math.sin(time * 18 + i))), 1, 2);
      g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 17, 4, 0, 0, Math.PI * 2); g.stroke(); continue; }
    if (mk.fire > 0 || (e.mode === 'pillar' && mk.k === 'pillar')) { for (let i = -3; i <= 3; i++) { const h = 30 + 30 * Math.abs(Math.sin(time * 14 + i)); fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', x + i * 4 - 1, y - h, 3, h); } continue; }
    /* HE STRIKES UP FROM BELOW (claude/djinn3): bubbles boil up through the water where his fist is coming - more and faster as it comes, a ring blinking */
    if (mk.k === 'bubbles') { const kk = Math.max(0, Math.min(1, 1 - mk.t / DJ.upTell)), n = 4 + R(kk * 10);
      for (let i = 0; i < n; i++) { const ph = (time * (1.4 + kk * 2) + i / n) % 1, bx = x - 14 + ((i * 7) % 28), by = y + 4 - ph * (20 + kk * 30); g.globalAlpha = 0.9 - ph * 0.6; g.strokeStyle = '#e8f8ff'; g.lineWidth = 1; g.beginPath(); g.arc(bx, by, 1 + (i % 3), 0, Math.PI * 2); g.stroke(); }
      g.globalAlpha = 1; g.strokeStyle = blink; g.beginPath(); g.ellipse(x, y - 1, DJ.upR + 2, 5, 0, 0, Math.PI * 2); g.stroke(); continue; }
    const col = mk.k === 'spout' ? '#7ab8e8' : mk.k === 'slam' ? '#3a7ab8' : '#ff9a3c';
    g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = col; g.beginPath(); g.ellipse(x, y - 1, 8 + k * 14, 3 + k * 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 22, 5, 0, 0, Math.PI * 2); g.stroke(); }
  if (e.mode === 'upsurge' && S.cur && S.cur.x != null) { const x = X(S.cur.x), y = R(S.cur.y - cy); for (let i = 0; i < 7; i++) fr(g, i % 2 ? '#3a7ab8' : '#8cc8f0', x - 14 + i * 4, y - 56 + R(4 * Math.sin(time * 18 + i)), 3, 56); ell(g, '#2c68a8', x, y - 58, 13, 9); fr(g, IRON, x - 6, y - 52, 12, 4); }
  if (e.mode === 'spout' && S.cur && S.cur.x != null) { const x = X(S.cur.x), y = R(S.cur.y - cy); for (let i = 0; i < 6; i++) fr(g, i % 2 ? '#7ab8e8' : '#e8f8ff', x - 10 + i * 4, y - 50 - R(6 * Math.sin(time * 16 + i)), 3, 50); }
  if (S.held && S.cur && S.cur.x != null) { const x = X(S.cur.x), y = R(S.cur.y - cy); g.globalAlpha = 0.6; fr(g, '#3a7ab8', x - 12, y - 46, 24, 46); g.globalAlpha = 1; }
  if (e.mode === 'breathTell' || e.mode === 'breath') { const fx = e.face || 1, x0 = fx > 0 ? e.x + 10 : e.x - 150, w = 140; if (e.mode === 'breathTell') { g.globalAlpha = 0.25 + 0.3 * Math.abs(Math.sin(time * 14)); fr(g, '#ffb84a', X(x0), R(F - 24), w, 3); g.globalAlpha = 1; }
    else for (let i = 0; i < 14; i++) { const xx = x0 + ((i * 11 + time * 300) % w); fr(g, i % 2 ? '#ff9a3c' : '#ffd36b', X(xx), R(F - 32 + (i % 4) * 4), 6, 4); } }
  for (const b of S.bands) { if (b.delay > 0) continue; const x = X(b.x), y0 = R(b.y[0] - cy), y1 = R(b.y[1] - cy);
    if (b.k === 'devil') { for (let i = 0; i < 8; i++) { const yy = y1 - i * ((y1 - y0) / 8), w = 3 + i * 1.6, a = time * 18 + i; fr(g, i % 2 ? '#d8b070' : '#f2dca0', x + Math.cos(a) * w - 1, yy, 3, 3); } }
    else if (b.k === 'firedevil') { /* THE FIRE DEVIL (claude/djinn2): a burning whirl as tall as its hit, embers flung off it */
      for (let i = 0; i < 10; i++) { const yy = y1 - i * ((y1 - y0) / 10), w = 3 + i * 1.5, a = time * 20 + i; fr(g, i % 3 === 0 ? '#ffd36b' : i % 3 === 1 ? '#ff9a3c' : '#d84a14', x + Math.cos(a) * w - 1, yy, 3, 3); }
      g.globalAlpha = 0.3; ell(g, '#ff9a3c', x, y1 - 2, 14, 3); g.globalAlpha = 1; for (let i = 0; i < 3; i++) fr(g, '#ffd36b', x + Math.cos(time * 7 + i * 2) * 16, y0 + 4 + ((time * 40 + i * 9) % (y1 - y0)), 1, 1); }
    else if (b.ledge) { /* A CREST running its ledge: a curl of water on the ledge's stone, as tall as its hit */
      g.fillStyle = '#7ab8e8'; g.beginPath(); g.moveTo(x - b.dir * 16, y1); g.quadraticCurveTo(x - b.dir * 2, y0 - 2, x + b.dir * 8, y1); g.fill(); fr(g, '#e8f8ff', x - 2, y0, 4, 2); fr(g, '#e8f8ff', x + b.dir * 4, y0 + 4, 2, 1); }
    else { /* THE BORE on the floor: white water as tall as its hit, under the flood's skin, and a hump on the surface over it */
      g.globalAlpha = 0.85; g.fillStyle = '#9ad0f4'; g.beginPath(); g.moveTo(x - b.dir * 22, y1); g.quadraticCurveTo(x - b.dir * 4, y0 - 2, x + b.dir * 8, y1); g.fill(); g.globalAlpha = 1;
      for (let i = 0; i < 4; i++) fr(g, '#e8f8ff', x - b.dir * (10 - i * 4), y0 + i * 2, 3, 1);
      if (S.water > 4) { const top = R(F - S.water); g.fillStyle = '#7ab8e8'; g.beginPath(); g.moveTo(x - 14, top + 1); g.quadraticCurveTo(x, top - 6, x + 14, top + 1); g.fill(); } } }
  for (const s of S.shots) { fr(g, '#8a6a3e', X(s.x) - 2, R(s.y - cy) - 2, 4, 4); fr(g, '#f2dca0', X(s.x) - 2, R(s.y - cy) - 2, 2, 1); }
  g.restore();
  /* HIS HAND resting on a ledge: a fist of water, glinting - strike it */
  if (S.hand && S.hand.stay > 0) { const x = X(S.hand.x), y = R(S.hand.y - cy), p = 0.5 + 0.5 * Math.sin(time * 14);
    g.globalAlpha = 0.85; ell(g, '#2c68a8', x, y - 6, 13, 9); ell(g, '#8cc8f0', x - 3, y - 9, 6, 3); g.globalAlpha = 1; fr(g, IRON, x - 6, y - 16, 12, 4);
    g.strokeStyle = 'rgba(255,255,255,' + (0.55 + 0.45 * p) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(x, y - 6, 16 + p * 3, 0, Math.PI * 2); g.stroke();
    const k2 = 2 + R(p * 2); fr(g, '#ffffff', x, y - 28 - k2, 1, 2 * k2 + 1); fr(g, '#ffffff', x - k2, y - 28, 2 * k2 + 1, 1);
    g.fillStyle = '#1b1626'; g.fillRect(x - 12, y + 4, 24, 2); g.fillStyle = '#8fd160'; g.fillRect(x - 12, y + 4, R(24 * Math.max(0, S.hand.stay / 1.5)), 2); }
  /* THE PAILS in flight (claude/djinn4): a brimming pail tumbling at his core, water streaming off it */
  for (const p of S.pails || []) { const px = X(p.x), py = R(p.y - cy); drawPail(g, px, py + 4, true, time); for (let i = 0; i < 3; i++) fr(g, '#e8f8ff', px - (p.tx > p.x0 ? 1 : -1) * (4 + i * 4), py + 1 + i, 2, 1); }
  /* OPEN (design standard B10 - the one read every boss shares; claude/djinn4): a GOLD RING round him, OPEN over him, a gold clock running down under it */
  if (e.open > 0) { const T = e.mode === 'mud' ? DJ.mudT : e.mode === 'bailed' ? DJ.bailT : e.mode === 'choked' ? DJ.chokeT : DJ.openT, k = Math.max(0, e.open / T), p = 0.5 + 0.5 * Math.sin(time * 10);
    const o = openRing(e, S), bx = X(e.x), by = R(o.y - cy), rx = o.rx, ry = o.ry;
    g.globalAlpha = 0.55 + 0.4 * p; g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
    const ty = by - ry - 12; g.fillStyle = '#1b1626'; g.fillRect(bx - 20, ty + 4, 40, 3); g.fillStyle = '#ffd36b'; g.fillRect(bx - 20, ty + 4, R(40 * k), 3);
  }
  /* HIS WARD's clock (claude/djinn2): a pale bar over him that runs down - when it is gone, the water takes again */
  if (S.ward > 0 && !(e.open > 0)) { const x = X(e.x), y = R(e.y - (S.pose === 'column' ? 190 : 100) - cy), k = Math.max(0, S.ward / DJ.wardT); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y, 40, 3); g.fillStyle = S.ph === 2 ? '#fff2c0' : S.ph === 3 ? '#bfe4ff' : '#e8d8a0'; g.fillRect(x - 20, y, R(40 * k), 3); }
}

/* (claude/djinn3) THE SHAFT'S LIGHT: a pale fall of daylight down the old well onto the flood - where the great bucket lands. In the flood it brightens
   while he stands in it (the bucket's moment) */
export function drawShaftLight(g, mx, vy, fy, S, e, time) {
  if (!S) return; const on = S.ph === 3 && e && Math.abs(e.x - S.G.mid) <= DJ.shaftR && S.pose === 'column', w = 2 * DJ.shaftR + 8;
  g.globalAlpha = on ? 0.22 + 0.06 * Math.sin(time * 6) : 0.08; g.fillStyle = '#fff6d8'; g.beginPath(); g.moveTo(mx - w / 2 + 6, vy - 40); g.lineTo(mx + w / 2 - 6, vy - 40); g.lineTo(mx + w / 2 + 6, fy); g.lineTo(mx - w / 2 - 6, fy); g.closePath(); g.fill();
  if (on) { g.globalAlpha = 0.5; ell(g, '#fff6d8', mx, fy - 1, w / 2 + 4, 3); }
  g.globalAlpha = 1;
}
/* THE WINDLASS (and the crank on the east ledge): its handle spins while the bucket winds up or drops; a blue glint while the bucket hangs ready */
export function drawWindlass(g, x, y, b, time) {
  fr(g, '#4a3424', x - 9, y - 20, 3, 20); fr(g, '#4a3424', x + 6, y - 20, 3, 20); fr(g, '#6a4a30', x - 8, y - 18, 16, 7); fr(g, '#c9b27c', x - 8, y - 16, 16, 2);
  const a = b.st === 'fall' ? time * 30 : b.st === 'wind' ? -time * 12 : 0; fr(g, '#2a1c12', x + 8 + R(Math.cos(a) * 3), y - 15 + R(Math.sin(a) * 3), 5, 2);
  ln(g, '#c9b27c', 1, [[x, y - 18], [x, y - 40]]);
  if (b.st === 'up') { const p = 0.5 + 0.5 * Math.sin(time * 8); fr(g, '#7ab8e8', x - 1, y - 26, 3, 3); g.globalAlpha = p; fr(g, '#ffffff', x, y - 30, 1, 3); fr(g, '#ffffff', x - 1, y - 29, 3, 1); g.globalAlpha = 1; }
  else if (b.st === 'down' && !(b.t > 0)) { fr(g, '#ffd36b', x - 1, y - 26, 3, 3); }   /* (in the flood: down and ready to wind - a gold pip) */
}
/* THE OPEN RING's place round him, by pose (the word OPEN goes over it: src/djinn-hands.js drawOver) */
export function openRing(e, S) { const col = S.pose === 'column', sp = S.pose === 'spilled'; const ry = col ? 84 : sp ? 22 : 40;
  return { y: e.y - (col ? 80 + Math.min(40, (S.water || 0) * 0.6) : sp ? 16 : 34), rx: col ? 34 : sp ? 34 : 24, ry, top: e.y - (col ? 80 + Math.min(40, (S.water || 0) * 0.6) : sp ? 16 : 34) - ry - 12 }; }
/* (claude/djinn4) THE PAIL: a little wooden pail - staves, two hoops, a rope bail - brimming blue with a glint when it is full */
export function drawPail(g, x, y, full, time) { fr(g, '#4a3222', x - 4, y - 8, 8, 8); fr(g, '#6a4a2a', x - 3, y - 8, 2, 8); fr(g, '#6a4a2a', x + 1, y - 8, 2, 8); fr(g, IRON, x - 4, y - 7, 8, 1); fr(g, IRON, x - 4, y - 2, 8, 1);
  fr(g, '#c9b27c', x - 4, y - 11, 1, 3); fr(g, '#c9b27c', x + 3, y - 11, 1, 3); fr(g, '#c9b27c', x - 3, y - 12, 6, 1);
  if (full) { fr(g, '#3a7ab8', x - 3, y - 9, 6, 2); fr(g, '#bfe6f5', x - 2, y - 9, 2, 1); if (Math.sin(time * 6) > 0.6) fr(g, '#ffffff', x + 1, y - 10, 1, 1); } }
/* THE GREAT BUCKET down the shaft: hanging high (up), dropping (fall), winding up out of the flood (wind), lying in it (down) */
export function drawBucket(g, mx, vy, fy, S, time) {
  const b = S.bucket, topY = vy - 60, lowY = S.ph === 3 && S.flood ? fy - 16 : vy + 30;
  const y = b.st === 'up' ? topY : b.st === 'fall' ? topY + (lowY - topY) * (1 - Math.max(0, b.t) / DJ.bucketFall) : b.st === 'wind' ? lowY + (topY - lowY) * (1 - Math.max(0, b.t) / DJ.windT) : lowY;
  ln(g, '#c9b27c', 1, [[mx, vy - 200], [mx, R(y)]]);
  fr(g, '#5a3a22', mx - 9, R(y), 18, 14); fr(g, '#8a5a32', mx - 8, R(y) + 2, 16, 3); fr(g, '#3a7ab8', mx - 7, R(y) + 1, 14, 2); fr(g, IRON, mx - 9, R(y) + 6, 18, 1);
  if (b.st === 'wind') for (let i = 0; i < 3; i++) fr(g, '#7ab8e8', mx - 6 + i * 5, R(y) + 14 + ((time * 60 + i * 7) % 18), 1, 3);   /* it comes up streaming */
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

/* A BINDING SEAL (claude/djinn2): a ring carved in the stone - an outer ring, eight glyphs round it, a shackle-mark in the middle - that glows from inside.
   The binding works under the Kasbah carry them down to his hall, brighter as you go (glow 0..1); his hall's LAST SEAL is whole and burning while he
   sleeps (st < 0), and cracks when he wakes (st = seconds since): the cracks run out from the centre in the first second, and it goes dark. */
export function drawSeal(g, x, y, st, time, glow = 1) {
  const broken = st >= 0, crack = broken ? Math.min(1, st / 0.9) : 0, pulse = 0.75 + 0.25 * Math.sin(time * 3 + x * 0.01);
  const lit = broken ? Math.max(0, 1 - st / 1.4) : glow * pulse, r = 22;
  g.save();
  ell(g, '#2a2420', x, y, r + 3, r + 3); ell(g, '#3e3630', x, y, r, r);
  if (lit > 0.02) { g.globalAlpha = Math.min(1, 0.25 + 0.55 * lit); ell(g, '#ff9a3c', x, y, r + 8, r + 8); g.globalAlpha = 1; }
  const c = lit > 0.02 ? (lit > 0.6 ? '#ffe8a0' : '#ffb84a') : '#6a5e52';
  g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r - 3, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; g.beginPath(); g.arc(x, y, r - 9, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, gx = x + Math.cos(a) * (r - 6), gy = y + Math.sin(a) * (r - 6); fr(g, c, gx - 1, gy - 2, 2, 4); if (i % 2) fr(g, c, gx - 2, gy - 1, 4, 1); }
  /* the shackle-mark: two cuffs and a link */
  g.strokeStyle = c; g.beginPath(); g.arc(x - 5, y, 3, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(x + 5, y, 3, 0, Math.PI * 2); g.stroke(); fr(g, c, x - 2, y, 4, 1);
  if (broken) { g.strokeStyle = '#120c0a'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.4, L = (r + 4) * crack; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L * 0.5 + Math.sin(i * 7) * 3, y + Math.sin(a) * L * 0.5); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    if (st < 1.6) { g.globalAlpha = Math.max(0, 1 - st / 1.6); for (let i = 0; i < 10; i++) fr(g, '#e8c98a', x - 12 + (i * 7) % 24, y + 6 + ((st * 90 + i * 13) % 40), 2, 2); g.globalAlpha = 1; } }
  g.restore();
}
