// sporewood2_mother.js - THE MOTHER CAP 2's BAKED FRAMES (claude/sporewood2art; B16: every ability has ITS OWN windup + release pose from her kit). The greybox drew the old sallow cap and
// stalk with rotate/scale tricks; here every pose is its own picture, painted once at the level load (src/mother-cap2.js picks the frame by her mode and how far into it she is):
//   idle      the plum cap closed over cream gills, the stalk root-barked, her eyes under the gills; a breath
//   lashTell  she HUNKERS: the cap dips, her roots rise off the floor like cobras with ember tips        lash     the roots flung flat along the floor to one side, the cap tilting after
//   crushTell the cap LIFTS off its stalk (a gap, the gills spread down) to be dropped              crush    the cap slammed back down, wide and squat, dust at the floor
//   bloomTell the gills FLARE and light violet, spore plumes streaming off the rim                    bloom    the gills let go: a spray of spores from the whole rim
//   broodTell the cap tips back and puffballs SWELL under the gills (pale lumps)                    brood    the lumps dropped: empty pockets, the cap tipping forward
//   witherTell a root-limb rises from her side, its tip blighted violet, her stalk leaning to the cap she means   wither   the limb slashed down, a cloud of blight
//   open      HER KNOT TORN: the crown split, the hot heart showing, the cap thrown back (2 frames, pulsing)        ward   the cap sealed and pearl-bright (the told ward)
//   phaseRise the second phase: she rises taller, her roots erupting round her, the gills lit            wake   up out of the floor
// Every pose has a P1 and a P2 picture; P2 wears the NET: foxfire veins down the stalk and across the cap, scars. The one glow is foxfire; gold stays the target (her knot's seam).
// frames(phase) -> { name: canvas } sized W x H with the foot at (AX, AY).   frameFor(e, pose, phase) -> { c, flip } for the mode / progress main draws.
import { canvas, mulberry, outline } from '../px.js';
import { PAL, GLOW, mix, hash } from './sporewood2_pal.js';

export const MW = 200, MH = 172, AX = 100, AY = 168;
const CAP = PAL[5].cap, DEEP = '#2a1636', HI = '#e8d0f0', VEIL = '#e8ddc0', VEILD = '#a89870';
const BARK = ['#1e1218', '#3c2a2e', '#5e4642', '#86685c', '#b09480'];
const memo = {};
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };

/* P: the pose's numbers. defaults = idle */
const D = { capDy: 0, capDx: 0, capSx: 1, capSy: 1, tilt: 0, gill: 0, glow: 0, lean: 0, sy: 1, roots: 0, rootDir: 0, rootGlow: 0, arm: 0, blight: 0, plumes: 0, puffs: 0, drop: 0, open: 0, shell: 0, rage: 0, dust: 0, shake: 0, low: 0, burst: 0 };
function paint(Pin, net) {
  const P = { ...D, ...Pin }, [c, g] = canvas(MW, MH), r = mulberry(33);
  const stalkTop = AY - Math.round(78 * P.sy) + P.low, rimY = AY - 82 + P.capDy + P.low - Math.round((P.sy - 1) * 40), capCx = AX + P.capDx + P.shake;
  const domeW = Math.round(64 * P.capSx), domeH = Math.round(40 * P.capSy), gillD = 6 + Math.round(12 * P.gill);
  const rimAt = u => rimY + Math.round(P.tilt * u * 0.5), topAt = u => rimAt(u) - Math.round(domeH * Math.sqrt(Math.max(0, 1 - u * u))) + Math.round(P.tilt * u * 0.5);
  /* ---- ROOTS at the foot, behind the stalk ---- */
  for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, idx = i >> 1, lash = P.rootDir === side, len = (24 + idx * 11) * (lash ? 2.2 : 1) * (P.rootDir && !lash ? 0.7 : 1) * (P.low ? 0.9 : 1), arc = lash ? 3 + idx : 4 + idx * 2 + P.roots * (14 + idx * 7), th = 4 - (idx > 1 ? 1 : 0), n = Math.round(len);
    for (let k = 0; k < n; k++) { const t = k / n, x = AX + side * (8 + k), y = AY - 2 - Math.round(Math.sin(t * Math.PI * (P.roots > 0.3 && !lash ? 0.75 : 1)) * arc) + (P.roots > 0.3 && !lash ? Math.round(t * t * -arc * 0.6) : 0), w = Math.max(1, Math.round(th * (1 - t * 0.7)));
      R(g, t > 0.9 && (P.rootGlow || lash && P.rootDir) ? '#ff9a6b' : BARK[2], x, y - w + 1, 1, w); R(g, BARK[3], x, y - w + 1, 1, 1); R(g, BARK[0], x, y + 1, 1, 1);
      if (t > 0.94 && P.rootGlow) R(g, '#ffd36b', x, y - 1, 2, 1); } }
  /* ---- THE STALK: root-barked, leaning, a ruffled veil under the cap ---- */
  { const h = AY - stalkTop; for (let y = stalkTop; y <= AY; y++) { const t = (y - stalkTop) / h, lx = AX + Math.round(P.lean * Math.pow(1 - t, 1.5)), hw = 10 + Math.round(7 * t * t) + (y > AY - 12 ? Math.round((y - (AY - 12)) * 0.9) : 0), xl = lx - hw, wd = hw * 2 + 1;
      R(g, BARK[1], xl, y, wd, 1); R(g, BARK[3], xl, y, Math.max(2, wd >> 3), 1); R(g, BARK[4], xl + 1, y, 1, 1); R(g, BARK[0], xl + wd - Math.max(2, wd >> 3), y, Math.max(2, wd >> 3), 1);
      for (let f = 1; f < 4; f++) if (((y >> 2) + f * 3) % 5 !== 0) R(g, (hash(f, y >> 3) % 3) ? BARK[2] : BARK[0], xl + Math.round(wd * f / 4), y, 1, 1); }
    for (const [bx, by] of [[-6, 0.45], [5, 0.62], [-3, 0.8]]) { const y = Math.round(stalkTop + h * by), x = AX + Math.round(P.lean * Math.pow(1 - by, 1.5)) + bx; R(g, '#6a8a4a', x, y, 3, 2); R(g, '#9ac060', x, y, 1, 1); }   /* moss and a toadstool or two on her */
    const rx = AX + Math.round(P.lean), ry = stalkTop + 4; for (let k = -15; k <= 15; k++) { const dr = 3 + (hash(k, 9) % 3); R(g, VEIL, rx + k, ry, 1, 1); R(g, '#c8b898', rx + k, ry + 1, 1, dr - 1); R(g, VEILD, rx + k, ry + dr, 1, 1); } }   /* the ragged ring (the veil) */
  /* ---- HER FACE on the stalk's neck, under the gills: eyes and a seam of a mouth ---- */
  { const fx = AX + Math.round(P.lean * 0.9), fy = stalkTop + 12, ang = P.rage > 0, col = ang ? '#ff6b6b' : '#ffd0ff';
    R(g, '#1a0e1c', fx - 10, fy - 2, 7, 5); R(g, '#1a0e1c', fx + 4, fy - 2, 7, 5); R(g, col, fx - 9, fy - 1, 5, 3); R(g, col, fx + 5, fy - 1, 5, 3); R(g, '#ffffff', ang ? fx - 9 : fx - 8, fy - 1, 1, 1); R(g, '#ffffff', ang ? fx + 5 : fx + 6, fy - 1, 1, 1); if (ang) { R(g, '#1a0e1c', fx - 10, fy - 3, 7, 1); R(g, '#1a0e1c', fx + 4, fy - 3, 7, 1); R(g, '#1a0e1c', fx - 7, fy - 4, 4, 1); R(g, '#1a0e1c', fx + 6, fy - 4, 4, 1); }
    R(g, '#1a0e1c', fx - 1, fy + 5, 2, 7 + (P.glow > 0.5 || P.gill > 0.7 ? 3 : 0)); }
  /* ---- THE ARM (wither): a root-limb from her right flank up and out, its tip blighted ---- */
  if (P.arm > 0) { const k = P.arm, x0 = AX + 12, y0 = AY - 36, x1 = AX + 12 + Math.round(54 * k), y1 = AY - 36 - Math.round(46 * (1 - P.blight * 0.55) * k);
    for (let t = 0; t <= 1; t += 0.012) { const bx = x0 + (x1 - x0) * t + Math.sin(t * 3.4) * 4, by = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 14 * k, w = Math.max(2, Math.round(6 * (1 - t * 0.7)));
      R(g, BARK[2], bx, by, w, w); R(g, BARK[3], bx, by, 1, 1); if (t > 0.88) R(g, mix('#5a2a7a', '#c9a0ff', (t - 0.88) / 0.12), bx, by, w, w); }
    for (let i = 0; i < 7; i++) R(g, i % 2 ? '#c9a0ff' : '#7a3a9a', x1 - 5 + ((r() * 11) | 0), y1 - 5 + ((r() * 11) | 0), 1, 1); }
  /* ---- THE GILLS under the cap ---- */
  for (let x = -domeW + 2; x <= domeW - 2; x++) { const u = x / domeW, ry0 = rimAt(u), gd = Math.max(2, Math.round(gillD * Math.sqrt(Math.max(0.05, 1 - u * u * 0.8))));
    R(g, DEEP, capCx + x, ry0, 1, gd); if (x % 3 === 0 || x % 3 === -1) { const lit = P.glow > 0 && ((x >> 1) % 2 === 0); R(g, lit ? (P.glow > 0.6 ? '#f0d0ff' : '#c9a0ff') : (x % 6 === 0 ? VEIL : '#b8a888'), capCx + x, ry0, 1, Math.max(1, gd - 1)); if (lit) R(g, '#ffffff', capCx + x, ry0 + gd - 2, 1, 1); } }
  /* the puffballs swelling under the gills (brood) and their pockets once dropped */
  if (P.puffs > 0) for (const [px0, rr] of [[-38, 5], [-14, 6], [12, 6], [36, 5]]) { const rad = Math.round(rr * P.puffs), cx0 = capCx + px0, cy0 = rimAt(px0 / domeW) + gillD + rad - 1; if (rad < 1) continue;
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { if (dx * dx + dy * dy > rad * rad) continue; const lit = (-dx * 0.6 - dy * 0.8) / rad; R(g, lit > 0.4 ? '#f6f2e2' : lit > -0.2 ? '#d6d0bc' : '#8a8670', cx0 + dx, cy0 + dy, 1, 1); } R(g, '#6a5a48', cx0 - 1, cy0 - rad - 1, 3, 1); }
  if (P.drop > 0) for (const px0 of [-38, -14, 12, 36]) { const cx0 = capCx + px0, cy0 = rimAt(px0 / domeW) + gillD; R(g, '#8a8670', cx0 - 2, cy0, 5, 1); R(g, '#d6d0bc', cx0 - 1, cy0 + 1, 3, 1); R(g, DEEP, cx0 - 1, cy0 - 1, 3, 1); }
  /* ---- THE CAP ---- */
  const shellMix = (col) => P.shell > 0 ? mix(col, '#e8e0f4', 0.38 * P.shell) : col;
  for (let x = -domeW; x <= domeW; x++) { const u = x / domeW, top = topAt(u), bot = rimAt(u); if (bot <= top) continue;
    for (let y = top; y < bot; y++) { const t = (y - top) / Math.max(1, bot - top); let ci = t < 0.1 ? 3 : t < 0.38 ? 2 : t < 0.72 ? 1 : 0; const lit = u < -0.4 && t < 0.55 ? 1 : 0, shade = u > 0.55 ? -1 : 0; ci = Math.max(0, Math.min(3, ci + lit + shade));
      let col = ci === 3 ? HI : ci === 2 ? CAP[2] : ci === 1 ? CAP[1] : CAP[0]; if (t > 0.9) col = DEEP; if (((x + y) & 1) && Math.abs(t - [0.1, 0.38, 0.72][Math.min(2, ci)]) < 0.04) col = ci > 0 ? [DEEP, CAP[0], CAP[1], CAP[2]][ci] : col;
      R(g, shellMix(col), capCx + x, y, 1, 1); } }
  /* the spots: pale lilac, lit top-left */
  for (const [su, sv, sr] of [[-0.62, 0.45, 4.5], [-0.2, 0.28, 5.5], [0.3, 0.38, 5], [0.68, 0.62, 3.5], [-0.82, 0.72, 3], [0.05, 0.7, 4], [0.5, 0.15, 3], [-0.45, 0.78, 2.5]]) { const sx = capCx + Math.round(su * domeW), top = topAt(su), bot = rimAt(su), sy = top + Math.round((bot - top) * sv), rr = Math.round(sr * (1 - Math.abs(su) * 0.35));
    for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (dx * dx * 0.8 + dy * dy * 1.4 <= rr * rr) R(g, shellMix(dx + dy < -rr * 0.5 ? '#f4e6f4' : '#c8a8d4'), sx + dx, sy + dy, 1, 1); }
  /* the rim: a pale ragged veil */
  for (let x = -domeW; x <= domeW; x++) { const u = x / domeW, y = rimAt(u); R(g, VEIL, capCx + x, y - 1, 1, 1); if (hash(x, 21) % 3 === 0) R(g, VEILD, capCx + x, y, 1, 1 + (hash(x, 5) % 2)); }
  R(g, DEEP, capCx - domeW - 1, rimAt(-1) - 1, 1, 2); R(g, DEEP, capCx + domeW, rimAt(1) - 1, 1, 2);
  /* ---- PLUMES off the rim (bloom): puffs of the cap's own lilac gathering under each rim edge and drifting down, motes between ---- */
  if (P.plumes > 0) { const pl = P.plumes; for (const side of [-1, 1]) { for (let j = 0; j < 4; j++) { const t = j / 3, bx = capCx + side * Math.round(domeW * (0.45 + 0.5 * t)), by = rimAt(side * (0.45 + 0.5 * t)) + gillD + 3 + Math.round(j * 5 * pl) + (j % 2) * 3, rr = Math.max(2, Math.round((2 + (j % 3)) * (0.6 + 0.5 * pl)));
      for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (dx * dx + dy * dy <= rr * rr) R(g, dx + dy < -rr * 0.5 ? '#efe6ff' : dx + dy > rr * 0.6 ? '#9a6ac8' : '#c9a0ff', bx + dx, by + dy, 1, 1); }
    for (let i = 0; i < 6; i++) R(g, i % 2 ? '#ffffff' : '#c9a0ff', capCx + side * (domeW * 0.3 + hash(i, 3) % Math.round(domeW * 0.9)), rimAt(side * 0.6) + gillD + 10 + (hash(i, 7) % 24) * pl, 1, 1); } }
  /* ---- THE KNOT on the crown ---- */
  { const ky = topAt(0) + 3, kx = capCx; const w = 11 + Math.round(P.open * 5), h = 6 + Math.round(P.open * 2);
    for (let dy = -h; dy <= h; dy++) for (let dx = -w; dx <= w; dx++) { const d = (dx * dx) / (w * w) + (dy * dy) / (h * h); if (d > 1) continue; R(g, d > 0.8 ? BARK[0] : hash(dx, dy) % 5 < 2 ? BARK[3] : dy < -2 ? BARK[3] : BARK[2], kx + dx, ky + dy, 1, 1); }
    for (let k = -8; k <= 8; k += 4) R(g, BARK[0], kx + k, ky - 1, 1, 4);
    if (P.open <= 0) { R(g, '#ffd36b', kx - 5, ky - 6, 10, 1); R(g, '#fff1a8', kx - 2, ky - 6, 4, 1); R(g, GLOW.mid, kx, ky - 2, 1, 3); }
    else { const o = P.open; for (let dy = -h - 4; dy <= h + 3; dy++) { const ww = Math.round((w - 2 + Math.sin(dy * 0.8) * 2.5) * o * (1 - Math.abs(dy) / (h + 6) * 0.35)); for (let dx = -ww; dx <= ww; dx++) { const d2 = Math.abs(dx) / Math.max(1, ww); R(g, d2 < 0.35 ? '#fff6d0' : d2 < 0.7 ? '#ff9a7a' : '#c9463d', kx + dx, ky + dy - 2, 1, 1); } R(g, BARK[0], kx - ww - 1, ky + dy - 2, 1, 1); R(g, BARK[0], kx + ww + 1, ky + dy - 2, 1, 1); }
      for (let i = 0; i < 6; i++) { let x = kx + (i - 3) * 6, y = ky + 6; for (let k = 0; k < 10; k++) { R(g, DEEP, x, y + k, 1, 1); x += (hash(i + k, 3) % 3) - 1; } } } }
  /* ---- THE NET (P2): foxfire veins over the stalk and the cap, a crack or two ---- */
  if (net) { for (const [sx, dir] of [[-26, 1], [22, -1], [-6, 1], [34, -1]]) { let x = capCx + sx, y = topAt(sx / domeW) + 6; for (let k = 0; k < 26; k++) { R(g, GLOW.lo, x, y, 1, 1); if (k % 2 === 0) R(g, GLOW.c, x, y, 1, 1); x += dir * (hash(sx + k, 6) % 2); y += 1; if (y > rimAt(x / domeW)) break; } }
    for (const dx of [-8, 3, 11]) { let x = AX + P.lean * 0.4 + dx, y = stalkTop + 14; while (y < AY - 2) { R(g, GLOW.lo, x, y, 1, 1); R(g, GLOW.c, x, y, 1, 1); x += (hash(y, dx) % 3) - 1; x = Math.max(AX - 14, Math.min(AX + 14, x)); y++; if (hash(y, dx) % 9 === 0) y++; } } }
  /* ---- DUST (the crush's landing) ---- */
  if (P.dust > 0) for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, x = AX + side * (30 + (i >> 1) * 11 * P.dust), y = AY - 2 - (hash(i, 2) % 5), rr = 2 + (i >> 2); R(g, '#9a8aa0', x - rr, y - rr, rr * 2, rr + 1); R(g, '#c8b8cc', x - rr, y - rr, rr, 1); }
  outline(c, '#120a18');
  return c;
}

/* THE POSES: [name, [params per frame]] - progress frames for the windups, two for each release */
const POSES = {
  idle: [{}, { capDy: -1, gill: 0.1 }],
  lashTell: [{ capDy: 2, capSy: 0.97, roots: 0.4, rage: 1, low: 1 }, { capDy: 5, capSy: 0.94, roots: 0.8, rage: 1, low: 2, lean: 3, rootGlow: 1 }, { capDy: 7, capSy: 0.91, roots: 1, rage: 1, low: 3, lean: 5, tilt: 3, rootGlow: 1, shake: 1 }],
  lash: [{ capDy: 5, capSy: 0.92, rage: 1, low: 2, lean: 6, tilt: 5, rootDir: 1, rootGlow: 1 }, { capDy: 3, capSy: 0.95, rage: 1, low: 1, lean: 3, tilt: 2, rootDir: 1, rootGlow: 1 }],
  crushTell: [{ capDy: -6, gill: 0.3, rage: 1, sy: 1.02 }, { capDy: -12, gill: 0.5, rage: 1, sy: 1.05, tilt: -2 }, { capDy: -19, gill: 0.7, rage: 1, sy: 1.08, tilt: -3, shake: 1 }],
  crush: [{ capDy: 9, capSx: 1.06, capSy: 0.84, rage: 1, dust: 0.4, gill: 0.2 }, { capDy: 5, capSx: 1.03, capSy: 0.9, rage: 1, dust: 1 }],
  bloomTell: [{ capDy: -2, gill: 0.5, glow: 0.3, plumes: 0.3 }, { capDy: -4, gill: 0.8, glow: 0.6, plumes: 0.6, capSx: 1.02 }, { capDy: -6, gill: 1, glow: 1, plumes: 0.9, capSx: 1.04, shake: 1 }],
  bloom: [{ capDy: -3, gill: 1, glow: 1, plumes: 1.3, burst: 1, capSx: 1.04 }, { capDy: 0, gill: 0.5, glow: 0.4, plumes: 0.8, burst: 1 }],
  broodTell: [{ capDy: -1, tilt: -3, gill: 0.5, puffs: 0.35 }, { capDy: -2, tilt: -5, gill: 0.8, puffs: 0.7, shake: 1 }, { capDy: -3, tilt: -7, gill: 1, puffs: 1, shake: 1, glow: 0.2 }],
  brood: [{ capDy: 2, tilt: 5, gill: 0.8, drop: 1 }, { capDy: 1, tilt: 2, gill: 0.4, drop: 1 }],
  witherTell: [{ lean: 3, arm: 0.45, blight: 0.3, rage: 1 }, { lean: 5, arm: 0.8, blight: 0.7, rage: 1, shake: 1 }, { lean: 6, arm: 1, blight: 1, rage: 1, shake: 1, capDy: -2 }],
  wither: [{ lean: 8, arm: 0.7, blight: 1, rage: 1, capDy: 2, plumes: 0.5 }, { lean: 3, arm: 0.3, blight: 1, rage: 1 }],
  open: [{ open: 1, tilt: -4, capDy: -2, gill: 0.6, capSx: 1.02, rage: 0 }, { open: 0.85, tilt: -3, capDy: -1, gill: 0.7, capSx: 1.03 }],
  ward: [{ shell: 1, gill: 0 }],
  phaseRise: [{ sy: 1.06, roots: 1, gill: 0.5, glow: 0.6, rage: 1, shake: 1, capDy: -5 }, { sy: 1.08, roots: 0.8, gill: 0.9, glow: 1, rage: 1, shake: -1, capDy: -7 }],
  wake: [{ low: 14, capSy: 0.8, gill: 0 }, { low: 6, capSy: 0.92, gill: 0.2 }],
};
export const canvasOf = (w, h) => canvas(w, h);
export const POSE_NAMES = Object.keys(POSES);
export function frames(phase) { const key = phase >= 2 ? 'p2' : 'p1';
  if (memo[key]) return memo[key]; const net = phase >= 2, out = {};
  for (const [name, list] of Object.entries(POSES)) out[name] = list.map(p => paint(p, net));
  return memo[key] = out; }
export function warm() { frames(1); frames(2); }
/* which picture: by her mode ('lashTell', 'lash', 'crushTell', ... 'open', 'phaseRise', 'wake', 'idle' / walk / anything else) and k = how far into it (0..1) */
export function frameFor(e, kind, tell, k, phase, ward, time) {
  const F = frames(phase), list = (n) => F[n] || F.idle;
  let name = kind, i = 0;
  if (kind === 'open') { name = 'open'; i = Math.floor(time * 5) % 2; }
  else if (ward > 0 && (kind === 'idle' || !F[kind])) { name = 'ward'; i = 0; }
  else if (kind === 'lash' || kind === 'crush' || kind === 'bloom' || kind === 'brood' || kind === 'wither') { name = kind; i = k < 0.45 ? 0 : 1; }
  else if (tell && F[kind + 'Tell']) { name = kind + 'Tell'; const n = F[name].length; i = Math.min(n - 1, Math.floor(k * n)); }
  else if (kind === 'phaseRise') { name = 'phaseRise'; i = Math.floor(time * 6) % 2; }
  else if (kind === 'wake') { name = 'wake'; i = k < 0.5 ? 0 : 1; }
  else { name = 'idle'; i = Math.floor(time * 0.9) % 2; }
  const L = list(name); return L[Math.min(i, L.length - 1)];
}

/* THE BESTIARY / MAP PORTRAIT: her idle frame boxed down to 56 x 52 (area average, hard alpha), outlined; the foes' set shape */
export function bakeIcon() {
  const src = frames(1).idle[0], sg = src.getContext('2d'), sd = sg.getImageData(0, 0, src.width, src.height).data, x0 = 30, y0 = 30, sw = 140, sh = 138, ow = 56, oh = 52, [c, g] = canvas(ow, oh), img = g.createImageData(ow, oh), d = img.data;
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) { let r = 0, gg = 0, b = 0, a = 0, n = 0; const ax0 = x0 + Math.floor(x * sw / ow), ax1 = x0 + Math.max(Math.floor(x * sw / ow) + 1, Math.floor((x + 1) * sw / ow)), ay0 = y0 + Math.floor(y * sh / oh), ay1 = y0 + Math.max(Math.floor(y * sh / oh) + 1, Math.floor((y + 1) * sh / oh));
    for (let yy = ay0; yy < ay1; yy++) for (let xx = ax0; xx < ax1; xx++) { const i = (yy * src.width + xx) * 4; n++; if (sd[i + 3] > 20) { r += sd[i]; gg += sd[i + 1]; b += sd[i + 2]; a++; } }
    if (a * 2 >= n && a) { const o = (y * ow + x) * 4; d[o] = r / a; d[o + 1] = gg / a; d[o + 2] = b / a; d[o + 3] = 255; } }
  g.putImageData(img, 0, 0); outline(c, '#1b1626'); return { R: [c], L: [c], white: { R: [c], L: [c] }, ax: ow >> 1, ay: oh, w: 40, h: 40 };
}
