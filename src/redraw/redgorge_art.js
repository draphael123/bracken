// src/redraw/redgorge_art.js - THE RED GORGE's CAST (claude/redgorge-art; the greybox's placeholders replaced). px.js primitives only. The contract is
// welltown_art.js's: every frame faces RIGHT (L is the flip), one canvas size per set, ax = the body's centre column, ay = the row under the feet, w/h = the hit box.
//   bakeRaptor()       THE CLIFF RAPTOR - its OWN bird: a lean rust hunter with a three-feather crest, a hooked beak, a long forked tail and a barred cream breast
//                      (frames follow the vulture's: 0 glide | 1 flap up | 2 flap down | 3 DIVE TELL (red eye) | 4 DIVE | 5 PERCHED, for ledges only)
//   gorgeSets(SPR)     the gorge's reskins of the bandits' sets: red-dust cutthroats (oxblood robe, ochre sash), slingers (ochre scarf), common scorpions in banded
//                      red clay, the elite in black-red armour (main.js swaps them in on L.redgorge)
//   bakeGorgeCrab()    THE GREAT RED CRAB - a crab as wide as a cart: barnacled, plated shell, jagged claws, eye-stalks, legs jointed in three; CRAB_F names the frames
//                      (15 = REAR: the front of him up, claws wide, mouth open and hissing - phase two's refusal at the held water)
//   bakeFeatherIcon()  a raptor's feather (the level's four quest pickups)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, rgb, mulberry } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
/* a three-stop colour ramp by luminance (0..1) */
const rampAt = (stops, l) => l < 0.5 ? lerpC(stops[0], stops[1], l * 2) : lerpC(stops[1], stops[2], (l - 0.5) * 2);
/* RECOLOUR a frame: pick(r,g,b,l) -> a ramp (three hex stops) or null to leave the pixel; the outline (very dark) always stays */
function recolor(c, pick) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const reskin = (set, pick) => pack(set.R.map(f => recolor(f, pick)), set.ax, set.ay, set.w, set.h);

/* ---------- THE CLIFF RAPTOR ---------- */
const RP = { f: '#a8472a', F: '#d0683a', d: '#5a2218', dd: '#341410', cream: '#f0dcb8', bar: '#8a3a22', beak: '#e8c060', beakD: '#8a6a28', eye: '#ffe27a', red: '#ff3a2a', leg: '#d8b050', crest: '#e8a040' };
export function bakeRaptor() {
  const W = 40, H = 30, gy = 28;
  const head = (g, x, y, pitch, eye) => { circle(g, x, y, 2.4, RP.d); px(g, x - 1, y - 1, RP.f); px(g, x + 1, y - 1, eye); px(g, x + 2, y - 1, RP.dd);
    fillPoly(g, [[x + 2, y - 1], [x + 6, y + 0.5 + pitch], [x + 3, y + 2]], RP.beak); px(g, x + 6, y + 1 + pitch, RP.beakD); px(g, x + 4, y + 1, RP.beakD);   /* the hooked beak */
    line(g, x - 1, y - 3, x - 4, y - 6 + pitch, RP.crest); line(g, x, y - 3, x - 2, y - 7 + pitch, RP.crest); line(g, x + 1, y - 3, x, y - 6, RP.F); };   /* the CREST: three feathers swept back */
  const tail = (g, x, y, up) => { fillPoly(g, [[x, y - 1], [x - 9, y - 1 + up], [x - 14, y - 3 + up * 1.4], [x - 10, y + 1 + up], [x - 14, y + 4 + up * 1.4], [x - 9, y + 3 + up], [x, y + 2]], RP.d);   /* the long forked tail */
    line(g, x - 2, y, x - 12, y - 1 + up, RP.bar); line(g, x - 2, y + 1, x - 12, y + 3 + up, RP.bar); };
  const body = (g, x, y, pitch, eye) => { ellipse(g, x, y, 7, 3.6, RP.f); ellipse(g, x - 1, y - 1, 5, 2, RP.F); ellipse(g, x + 2, y + 1.6, 4, 1.8, RP.cream);
    for (let k = -1; k <= 2; k++) px(g, x + k * 2, y + 2, RP.bar); head(g, x + 8, y - 3 + pitch, pitch, eye); };
  const wing = (g, x, y, lift, span, c1, c2) => { const tx = x - 3 + span * 0.2, ty = y - lift;
    fillPoly(g, [[x - 4, y - 1], [x + 4, y - 1], [tx + span * 0.5, ty], [tx - span * 0.5, ty - 1]], c1);
    for (let k = 0; k < 5; k++) line(g, tx - span * 0.5 + k * 2, ty - 1, tx - span * 0.5 + k * 2 - 2, ty - 3 - (k & 1), c2);   /* the long primaries */
    line(g, x - 4, y - 1, tx - span * 0.5, ty, RP.F); };
  const F = Array.from({ length: 6 }, (_, f) => { const [c, g] = canvas(W, H); const cx = 18, cy = 14;
    if (f === 5) {   /* PERCHED: upright on a ledge, wings shut like a cloak, crest up, tail hanging, claws on the stone */
      ellipse(g, cx, gy - 8, 4.5, 7, RP.f); ellipse(g, cx - 1, gy - 8, 3, 5, RP.F); ellipse(g, cx + 2, gy - 8, 2.4, 4.4, RP.cream); for (let k = 0; k < 3; k++) px(g, cx + 2, gy - 10 + k * 2, RP.bar);
      head(g, cx + 3, gy - 16, 0, RP.eye); fillPoly(g, [[cx - 3, gy - 4], [cx - 6, gy + 0], [cx - 4, gy + 0], [cx - 1, gy - 3]], RP.d); fillPoly(g, [[cx - 1, gy - 3], [cx - 3, gy], [cx - 1, gy]], RP.d);
      rect(g, cx - 1, gy - 2, 1, 3, RP.leg); rect(g, cx + 2, gy - 2, 1, 3, RP.leg); px(g, cx - 2, gy + 1, RP.leg); px(g, cx + 3, gy + 1, RP.leg); outline(c, OUT); return c; }
    if (f === 4) {   /* DIVE: wings folded back like a dart, head down, talons forward, the tail streaming up */
      ellipse(g, cx, cy + 2, 3.6, 7.5, RP.f); ellipse(g, cx - 1, cy + 1, 2, 5, RP.F); ellipse(g, cx + 1, cy + 4, 2, 4, RP.cream);
      circle(g, cx + 1, cy + 10, 2.3, RP.d); px(g, cx + 2, cy + 9, RP.red); fillPoly(g, [[cx, cy + 11], [cx + 3, cy + 15], [cx - 1, cy + 13]], RP.beak);
      line(g, cx - 3, cy - 4, cx - 6, cy + 4, RP.d); line(g, cx + 3, cy - 4, cx + 6, cy + 4, RP.d);
      fillPoly(g, [[cx - 2, cy - 5], [cx - 4, cy - 12], [cx, cy - 10], [cx + 4, cy - 12], [cx + 2, cy - 5]], RP.d); line(g, cx - 1, cy + 6, cx - 2, cy + 10, RP.leg); line(g, cx + 2, cy + 6, cx + 3, cy + 10, RP.leg); outline(c, OUT); return c; }
    const lift = [2, 9, -4, 5][f], span = [24, 17, 19, 13][f], pitch = f === 3 ? 2 : 0, eye = f === 3 ? RP.red : RP.eye;
    wing(g, cx + 1, cy, lift, span, RP.d, RP.dd); tail(g, cx - 6, cy + 1, f === 1 ? -1 : f === 2 ? 2 : 0); body(g, cx, cy, pitch, eye); wing(g, cx - 1, cy + 1, lift - 1, span, RP.f, RP.d);
    line(g, cx + 1, cy + 4, cx + 2, cy + 7, RP.leg); line(g, cx + 4, cy + 4, cx + 5, cy + 7, RP.leg); if (f === 3) { px(g, cx + 3, cy + 8, RP.beak); px(g, cx + 6, cy + 8, RP.beak); }
    outline(c, OUT); return c; });
  return pack(F, 18, H, 22, 10);
}

/* ---------- THE GORGE'S RESKINS (the bandits' AI under the gorge's own kit) ---------- */
export function gorgeSets(SPR) {
  const out = {}, OCH = ['#6a4410', '#c8902a', '#f0c860'];
  /* the cutthroat: the indigo robe goes oxblood/umber, the red sash ochre (the gorge's dust has eaten the blue); the black veil stays */
  out.cutthroat = reskin(SPR.cutthroat, (r, g, b) => b > r + 6 ? ['#2a0e0c', '#6a2a1c', '#a8583a'] : (r > 150 && g < 100 && b < 100) ? OCH : null);
  /* the slinger: the red headscarf ochre-gold, the sand tunic a dust-stained clay (so neither reads as the Well Town's) */
  out.slinger = reskin(SPR.slinger, (r, g, b) => (r > 150 && g < 100 && b < 110) ? OCH : (r > 190 && g > 150 && b > 90 && b < 170) ? ['#5a3a28', '#a8704a', '#d8a478'] : null);
  /* scorpions: banded red clay for the common sting, black-red lacquered armour for the elite KEEPER */
  out.scorpion = reskin(SPR.scorpion, (r, g, b, l) => (r > g && l > 0.2 && r > 90 && !(r > 200 && g < 90)) ? ['#3a1810', '#9a4428', '#d88858'] : null);
  out.scorpionElite = reskin(SPR.scorpion, (r, g, b, l) => (r > g && l > 0.2 && !(r > 200 && g < 90)) ? ['#120606', '#5a1410', '#b02a1e'] : null);
  return out;
}

/* ---------- THE GREAT RED CRAB ---------- */
export const CRAB_F = { stand: 0, walk: [1, 2], pinchTell: 3, pinch: 4, crushTell: 5, crush: 6, boulderTell: 7, boulder: 8, scuttleTell: 9, scuttle: 10, dug: 11, open: 12, hurt: 13, dead: 14, rear: 15 };
const CR = { shellD: '#4a0e0c', shell: '#8e2218', shellM: '#b43422', shellL: '#dc5836', rim: '#ff9060', belly: '#ecd0a4', bellyD: '#b8946a', bellyDD: '#8a6a48', leg: '#74201a', legL: '#a83a28', legD: '#4a1210', claw: '#b83a26', clawL: '#e8683e', clawD: '#6e1a14', tip: '#fff0d0', eye: '#ffe27a', eyeD: '#2a1410', barn: '#e0d2b0', barnD: '#a89878', rock: '#8a6a52', rockL: '#c0a080', wet: '#8ac8f0', mouth: '#2a0a08' };
export function bakeGorgeCrab() {
  const W = 128, H = 76, cx = 58, G = 74;
  const BIG = 1.45;
  const F = Array.from({ length: 16 }, (_, f) => { const [c, g] = canvas(W, H), r = mulberry(f * 31 + 5);
    const barnacles = (x, y, rx, ry, n) => { for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()), bx = x + Math.cos(a) * rx * d, by = y + Math.sin(a) * ry * d; px(g, bx, by, CR.barn); px(g, bx + 1, by + 1, CR.barnD); } };
    /* a leg of three segments: the thigh up and out, the knee, the shin down to a pointed foot */
    const leg = (x, y, dir, k, foot, th = 2) => { const kx = x + dir * (11 + k), ky = y - 5 + k, fx = x + dir * (14 + k * 0.5), fy = foot; line(g, x, y, kx, ky, CR.leg, 3); line(g, kx, ky, fx, fy, CR.legL, th); px(g, kx, ky - 1, CR.legL); px(g, kx + dir, ky, CR.legD); px(g, kx, ky - 1, CR.legL); px(g, fx, fy, CR.legD); };
    /* a claw: the arm from the shoulder, a heavy palm, two jagged pincers (open 0..9) */
    const claw = (sx, sy, x, y, s, open, arm = true) => { if (arm) { line(g, sx, sy, x - s * 3, y + 1, CR.legD, 4); line(g, sx, sy, x - s * 3, y + 1, CR.leg, 3); line(g, sx + 1, sy - 1, x - s * 3 + 1, y, CR.legL, 1); }
      ellipse(g, x, y, 7 * s, 6 * s, CR.clawD); ellipse(g, x, y - 0.5, 6.4 * s, 5.2 * s, CR.claw); ellipse(g, x - 1, y - 2.4 * s, 4.6 * s, 2 * s, CR.clawL);
      const L = 13 * s, up = [[x + 4 * s, y - 4 * s], [x + L, y - 3 * s - open], [x + L + 2 * s, y - 1 * s - open], [x + L - 2 * s, y - 0.5 * s - open * 0.4], [x + 6 * s, y]];
      const dn = [[x + 4 * s, y + 4 * s], [x + L - 1, y + 3 * s + open * 0.7], [x + L + 1 * s, y + 1 * s + open * 0.7], [x + L - 3 * s, y + 0 * s], [x + 6 * s, y]];
      fillPoly(g, up, CR.claw); fillPoly(g, dn, CR.clawD); for (let i = 0; i < 3; i++) { px(g, x + (7 + i * 2) * s, y - 1 * s - open * (0.3 + i * 0.2), CR.tip); px(g, x + (7 + i * 2) * s, y + 1 * s + open * (0.2 + i * 0.15), CR.tip); }
      px(g, x + L + 2 * s, y - 1 * s - open, CR.tip); line(g, x + 3 * s, y - 4 * s, x + L - 1, y - 3 * s - open, CR.clawL); };
    /* the shell: a domed plated carapace (rx 27), banded by ridges, barnacled, a lit rim */
    const shell = (x, y, sq = 0) => { const rx = 27, ry = 13 - sq; ellipse(g, x, y + 3, rx + 1, ry + 1, CR.shellD); ellipse(g, x, y, rx, ry, CR.shell); ellipse(g, x - 2, y - 1, rx - 4, ry - 3, CR.shellM); ellipse(g, x - 5, y - 4, 15, 4, CR.shellL);
      for (let i = -2; i <= 2; i++) line(g, x + i * 10, y - ry * 0.5 + Math.abs(i) * 1.5, x + i * 11, y + ry * 0.5, CR.shellD); for (let i = -2; i <= 2; i++) px(g, x + i * 8 - 4, y - ry + 2 + Math.abs(i), CR.rim);
      barnacles(x - 4, y, 20, ry - 2, 14); for (let i = 0; i < 6; i++) px(g, x - 20 + i * 8, y + ry - 1, CR.rim); };
    const eyes = (x, y) => { line(g, x + 6, y, x + 7, y - 8, CR.shellD, 2); line(g, x + 14, y + 1, x + 16, y - 7, CR.shellD, 2); circle(g, x + 7, y - 9, 2.4, CR.eyeD); circle(g, x + 16, y - 8, 2.4, CR.eyeD); circle(g, x + 7, y - 9, 1.6, CR.eye); circle(g, x + 16, y - 8, 1.6, CR.eye); px(g, x + 8, y - 9, CR.eyeD); px(g, x + 17, y - 8, CR.eyeD); };
    /* ---- ON HIS BACK: the pale belly up in plates, eight legs kicking, the claws out on the ground, water running off (open) or the legs curled (dead) ---- */
    if (f === CRAB_F.open || f === CRAB_F.dead) { const dead = f === CRAB_F.dead, by = G - 12;
      ellipse(g, cx, by + 4, 27, 8, CR.shellD); ellipse(g, cx, by, 24, 10, CR.belly); ellipse(g, cx - 2, by - 2, 18, 6, '#f6e2bc');
      for (let i = -4; i <= 4; i++) line(g, cx + i * 5, by - 8, cx + i * 5.5, by + 6, CR.bellyD); line(g, cx - 22, by, cx + 22, by, CR.bellyDD); ellipse(g, cx + 21, by - 1, 5, 4, CR.bellyD); px(g, cx + 22, by - 2, CR.mouth);
      for (let i = 0; i < 4; i++) { const k = dead ? 3 : (i % 2 ? 4 : -3), x0 = cx - 18 + i * 6, x1 = cx + 6 + i * 6; line(g, x0, by - 7, x0 - 4 + (dead ? 2 : 0), by - 20 + k, CR.leg, 2); line(g, x0 - 4 + (dead ? 2 : 0), by - 20 + k, x0 - 1, by - 28 + k, CR.legL, 2);
        line(g, x1, by - 7, x1 + 4, by - 20 - k, CR.leg, 2); line(g, x1 + 4, by - 20 - k, x1 + 1, by - 28 - k, CR.legL, 2); }
      claw(cx - 14, by + 3, cx - 34, G - 7, 1.1, dead ? 0 : 5, false); claw(cx + 14, by + 3, cx + 36, G - 8, 1.3, dead ? 0 : 3, false);
      if (f === CRAB_F.open) for (let i = 0; i < 12; i++) { px(g, cx - 24 + i * 4, by - 9 + (i % 3), CR.wet); px(g, cx - 24 + i * 4, by - 10 + (i % 3), '#e8f8ff'); }
      outline(c, OUT); return c; }
    const walk = f === 1 || f === 2, dug = f === CRAB_F.dug, rear = f === CRAB_F.rear, low = f === CRAB_F.scuttle || f === CRAB_F.scuttleTell || dug, bob = walk ? (f === 1 ? -1 : 0) : 0;
    const sy = G - (low ? 21 : 27) + bob, body = sy + 6;
    if (rear) {   /* ---- REAR (phase two's refusal): he stands back on his rear legs, the front of his shell up, claws spread wide, the mouth open and hissing, bubbles ---- */
      const ry = G - 36;
      for (let i = 0; i < 2; i++) { const x0 = cx - 24 + i * 7; line(g, x0, G - 16, x0 - 9, G - 6, CR.leg, 2); line(g, x0 - 9, G - 6, x0 - 11, G, CR.legL, 2); }
      for (let i = 0; i < 3; i++) { const x0 = cx - 16 + i * 8; line(g, x0 + 4, G - 16, x0 + 14, G - 12 - i * 3, CR.leg, 2); line(g, x0 + 14, G - 12 - i * 3, x0 + 19, G - 21 - i * 6, CR.legL, 2); }   /* the front legs thrashing in the air */
      ellipse(g, cx - 4, ry + 6, 25, 11, CR.shellD); ellipse(g, cx - 4, ry + 4, 24, 10, CR.shell); ellipse(g, cx - 6, ry + 2, 19, 7, CR.shellM); ellipse(g, cx - 9, ry - 1, 12, 3, CR.shellL);
      for (let i = -2; i <= 2; i++) line(g, cx - 4 + i * 8, ry - 3, cx - 4 + i * 9, ry + 9, CR.shellD); barnacles(cx - 6, ry + 4, 18, 8, 10);
      ellipse(g, cx + 19, ry + 12, 9, 6, CR.belly); ellipse(g, cx + 21, ry + 13, 5, 3.4, CR.mouth); for (let i = 0; i < 3; i++) px(g, cx + 18 + i * 2, ry + 11, CR.tip);   /* the open mouth, its teeth */
      eyes(cx + 4, ry + 2); claw(cx + 14, ry + 8, cx + 42, ry - 14, BIG, 9); claw(cx - 14, ry + 8, cx - 38, ry - 10, 0.9, 8);
      for (let i = 0; i < 9; i++) { const bx = cx + 28 + (i % 3) * 6 + (i >> 1), by = ry + 4 - i * 3; circle(g, bx, by, i % 3 === 0 ? 2 : 1, CR.wet); px(g, bx, by, '#ffffff'); }   /* the hiss: bubbles and spit */
      outline(c, OUT); return c; }
    /* the legs: four a side, three-segmented, splayed (dug in: buried to the knee in sand) */
    for (let i = 0; i < 4; i++) { const x0 = cx - 16 + i * 6, st = walk ? ((i + f) % 2 ? 2 : -2) : 0, foot = dug ? G - 3 : G; leg(x0, body + 4, -1, st, foot); leg(x0 + 6, body + 4, 1, -st, foot); }
    shell(cx, sy, low ? 3 : 0); eyes(cx, sy - 7);
    ellipse(g, cx + 22, sy + 8, 4, 3, CR.shellD); px(g, cx + 23, sy + 8, CR.mouth);   /* the mouth parts under the front of the shell */
    if (dug) { rect(g, cx - 34, G - 5, 68, 5, CR.rock); for (let i = 0; i < 20; i++) px(g, cx - 32 + i * 3, G - 6 + (i % 2), CR.rockL); for (let i = 0; i < 8; i++) px(g, cx - 26 + i * 7, G - 8 - (i % 3) * 2, CR.rock); }
    /* THE CLAWS: the great one forward (right), the small one low behind; each pose moves them */
    const sh = [cx + 19, sy + 8];
    if (f === CRAB_F.pinchTell) { claw(...sh, cx + 40, sy - 12, BIG, 9); }
    else if (f === CRAB_F.pinch) { claw(...sh, cx + 44, sy + 9, BIG, 0); for (let i = 0; i < 5; i++) px(g, cx + 62 + i * 2, sy + 6 + (i % 2) * 3, CR.rim); line(g, cx + 58, sy + 4, cx + 66, sy + 2, CR.tip); line(g, cx + 58, sy + 14, cx + 66, sy + 16, CR.tip); }
    else if (f === CRAB_F.crushTell) { claw(...sh, cx + 30, sy - 22, BIG, 3); claw(cx - 19, sy + 8, cx - 22, sy - 20, 0.9, 3); }
    else if (f === CRAB_F.crush) { claw(...sh, cx + 40, G - 8, BIG, 0); claw(cx - 19, sy + 8, cx + 16, G - 6, 0.9, 0); for (let i = 0; i < 10; i++) { px(g, cx + 30 + i * 3, G - 2 - (i % 3), CR.rockL); px(g, cx + 34 + i * 3, G - 8 - (i % 4) * 2, CR.rock); } }
    else if (f === CRAB_F.boulderTell) { claw(...sh, cx + 20, sy - 24, BIG, 3); circle(g, cx + 22, sy - 38, 9, CR.rock); circle(g, cx + 19, sy - 41, 4, CR.rockL); for (let i = 0; i < 5; i++) px(g, cx + 16 + i * 3, sy - 33 + (i % 2), '#5a4030'); claw(cx - 19, sy + 8, cx - 30, sy + 14, 0.9, 3); }
    else if (f === CRAB_F.boulder) { claw(...sh, cx + 42, sy - 16, BIG, 8); for (let i = 0; i < 5; i++) px(g, cx + 54 + i * 3, sy - 22 - i * 3, CR.rockL); claw(cx - 19, sy + 8, cx - 30, sy + 14, 0.9, 3); }
    else if (f === CRAB_F.scuttleTell) { claw(...sh, cx + 20, sy + 13, BIG, 2); claw(cx - 19, sy + 8, cx - 32, sy + 12, 0.9, 2); for (let i = 0; i < 4; i++) px(g, cx - 36 - i * 2, G - 3 - i, CR.rockL); }
    else if (f === CRAB_F.scuttle) { claw(...sh, cx + 42, sy + 14, BIG, 2); claw(cx - 19, sy + 8, cx - 34, sy + 12, 0.9, 1); for (let i = 0; i < 7; i++) rect(g, cx - 62 + i * 3, G - 6 - (i % 3) * 3, 6 - (i >> 1), 1, i % 2 ? CR.rockL : CR.rock); }
    else { claw(...sh, cx + 36, sy + 15, BIG, f === 0 ? 3 : 4); claw(cx - 19, sy + 8, cx - 32, sy + 14, 0.9, 2); }
    if (f === CRAB_F.hurt) for (let i = 0; i < 9; i++) { px(g, cx - 22 + i * 5, sy - 4 + (i % 3), '#ffffff'); px(g, cx - 22 + i * 5, sy - 3 + (i % 3), '#ffd0b0'); }
    outline(c, OUT); return c; });
  return pack(F, cx, G, 46, 28);
}

/* ---------- ICONS ---------- */
export function bakeFeatherIcon() { const [c, g] = canvas(10, 14); line(g, 2, 13, 7, 1, '#e8dcc0'); for (let i = 0; i < 6; i++) { line(g, 3 + i, 11 - i * 2, 1 + i, 9 - i * 2, '#c8643a'); line(g, 3 + i, 11 - i * 2, 6 + i * 0.5, 11 - i * 2, '#7a2e1c'); } px(g, 7, 1, '#f0dcb8'); outline(c, OUT); return c; }
