// src/dk-lift-art.js - THE DEATH KNIGHT'S "TOPPLE THE STANDARD" ART (claude/dkart, BOSSLIFT-DKART). Code-drawn pixel art in the house style: flat fillRects, no anti-aliasing, the
// same #1b1626 outline as every baked set. Nothing here is read by the fight: src/unburied-foes.js calls these only behind its lift flag (bkLiftOn), from its draw code.
//   - the CUT POLE'S FALL: three keyframes (the cloth lagging, snapping straight, whipping past) pivoting on the splintered foot, then lying; the stump left standing in the stone
//   - the POLE ACROSS HIS BACK while he is PINNED (any lean: the pole is baked per angle, once)
//   - the FALL SHADOW the pole will cast (chevrons running out from the foot to where the tip lands), red on the side he stands in
//   - the WARD SHATTER (a crack web, the shards flying, the sparks), the DUST of a landing, the CRACK in the stone under a pin
//   - the THREAD that binds each raised dead man to his pole (a braid with a bead at the thrall, a ring at the pole, beads running up it), and the SNAP of it
// Only rect() and drawImage() are used, so tools/dkart-sheet.mjs renders every frame in Node with tools/node-canvas.mjs - no browser.
import { canvas, rect, outline, flipX } from './px.js';

export const POLE = { len: 60, fw: 22, fh: 16, stub: 6 };
const WOOD = '#4a3222', WOOD_L = '#6a4a32', WOOD_D = '#2e1e14', CUT = '#e0d0a8', CUT_D = '#b8a47c', GOLD = '#d8b04a', GOLD_L = '#f0d06a', MARK = '#e8c35a';
const CLOTH = '#8e2a26', CLOTH_L = '#a8342c', CLOTH_D = '#5e1a1a', STONE = '#8a7a68', STONE_D = '#5a4e40';
const VIOLET = '#9a7aff', VIOLET_L = '#c8b6ff', VIOLET_D = '#4a3a8a', RED = '#c0283a', PINK = '#ff6b6b', HOT = '#ffd0d0', DRED = '#7a1020';
const FX = 10, FY = 78, CW = 88, CH = 84;   /* the foot's pixel in a pole sprite, and the sprite's size */
const px = (g, x, y, c) => rect(g, Math.round(x), Math.round(y), 1, 1, c);
const clampY = y => Math.min(FY + 1, y);

/* ONE POLE AT ANGLE aDeg FROM UPRIGHT (toward +x), its cloth bent by `whip` radians (negative: lagging behind the fall; positive: thrown on past it), on a foot at (FX, FY).
   Forward-splatted at twice the density so a diagonal has no holes. */
function bakePole(aDeg, whip, up = false) {
  const [c, g] = canvas(CW, CH), a = aDeg * Math.PI / 180, ux = Math.sin(a), uy = -Math.cos(a), nx = Math.cos(a), ny = Math.sin(a), L = POLE.len;
  const at = (s, p) => [FX + ux * s + nx * p, FY + uy * s + ny * p];
  /* the pole: two through, a lit edge on the upper side and a dark one on the lower */
  for (let t = POLE.stub; t <= L; t += 0.5) { const [x, y] = at(t, 0); px(g, x, y, WOOD); px(g, x + (Math.abs(ux) > 0.7 ? 0 : 1), y + (Math.abs(ux) > 0.7 ? 1 : 0), WOOD_D); const [lx, ly] = at(t, -1); if (((t * 2) | 0) % 5) px(g, lx, ly, WOOD_L); }
  /* the foot: the cut - pale split wood, a few ragged teeth where the blade went through */
  for (let t = 0; t < POLE.stub; t += 0.5) { const [x, y] = at(t, 0); px(g, x, y, t < 3 ? CUT : CUT_D); px(g, x + (Math.abs(ux) > 0.7 ? 0 : 1), y + (Math.abs(ux) > 0.7 ? 1 : 0), CUT_D); }
  const [t1x, t1y] = at(POLE.stub + 1, 3); px(g, t1x, t1y, CUT); const [t2x, t2y] = at(POLE.stub + 3, -2); px(g, t2x, t2y, CUT_D);
  /* the finial: gold ball and the cap */
  { const [x, y] = at(L + 2, 0); rect(g, Math.round(x) - 1, Math.round(y) - 1, 3, 3, GOLD); px(g, x - 1, y - 1, GOLD_L); const [qx, qy] = at(L - 1, 0); px(g, qx, qy, GOLD); }
  /* the cloth, hung from the top of the pole as drawStandard hangs it: fw columns, fh tall, the swallow-tail cut in the last four; each column swung about the pole's top by whip x its distance out */
  const top = L - 2, [ox, oy] = at(top, 0);
  for (let lx = 0; lx < POLE.fw; lx += 0.5) { const col = lx | 0, b = whip * (up ? -1 : 1) * Math.pow(lx / POLE.fw, 1.1), cb = Math.cos(b), sb = Math.sin(b), hh = POLE.fh - (col > POLE.fw - 4 ? (col % 2) * 3 : 0);
    for (let ly = 0; ly < hh; ly += 0.5) {
      const p = (up ? -1 : 1) * (1 + lx), s = -ly;   /* along the flag, down the flag (up: the cloth on the UPPER side of a lying pole, clear of what is under it) */
      const vx = nx * p + ux * s, vy = ny * p + uy * s, x = ox + vx * cb - vy * sb, y = oy + vx * sb + vy * cb;
      if (y > FY + 1) continue;
      let k = col % 5 === 0 ? CLOTH_L : CLOTH; if (ly >= hh - 1.5) k = CLOTH_D;
      if ((col >= 3 && col <= 8 && ly >= 3.5 && ly < 5.5) || (col >= 5 && col <= 6 && ly >= 6 && ly < 10)) k = MARK;   /* the order's gold mark */
      px(g, x, y, k); } }
  return { c: outline(c), ax: FX, ay: FY };
}
const POLES = new Map();
export const poleSprite = (aDeg, whip = 0, up = false) => { const k = Math.round(aDeg / 4) * 4 + ':' + Math.round(whip * 10) + (up ? 'u' : ''); let s = POLES.get(k); if (!s) { s = bakePole(Math.round(aDeg / 4) * 4, Math.round(whip * 10) / 10, up); s.L = { c: flipX(s.c), ax: s.c.width - 1 - s.ax, ay: s.ay }; POLES.set(k, s); } return s; };

/* THE FALL: three keyframes held a third of the cut-to-landing each - the cloth hanging back (it has not been told yet), snapped straight along the pole, flung on past it - then lying */
export const FALL = [{ a: 12, w: -0.55 }, { a: 38, w: -0.12 }, { a: 66, w: 0.32 }];
let LIE = null;
function bakeLie() {
  const [c, g] = canvas(CW, 24), fy = 20;   /* foot at (FX, fy), lying along +x */
  for (let x = POLE.stub; x <= POLE.len; x++) { px(g, FX + x, fy - 1, x % 9 ? WOOD : WOOD_D); px(g, FX + x, fy, WOOD_D); if (x % 5) px(g, FX + x, fy - 2, WOOD_L); }
  for (let x = 0; x < POLE.stub; x++) { px(g, FX + x, fy - 1, x < 3 ? CUT : CUT_D); px(g, FX + x, fy, CUT_D); } px(g, FX + POLE.stub + 1, fy - 3, CUT); px(g, FX + POLE.stub + 3, fy + 1, CUT_D);
  rect(g, FX + POLE.len, fy - 3, 3, 4, GOLD); px(g, FX + POLE.len, fy - 3, GOLD_L);   /* the finial on its side */
  /* the cloth torn off the tail and lying in folds on the stone, the gold mark showing in one of them */
  for (let x = 0; x < 26; x++) { const h = 4 + ((x * 5) % 4 === 0 ? 1 : 0) + (x % 9 < 3 ? 1 : 0) + (x > 20 ? -(x % 2) * 2 : 0), y0 = fy - 1 - h + (x % 7 === 0 ? 1 : 0);
    for (let y = 0; y < h; y++) px(g, FX + 22 + x, y0 + y, y === h - 1 ? CLOTH_D : x % 5 === 0 ? CLOTH_L : CLOTH); }
  for (let x = 4; x < 9; x++) px(g, FX + 22 + x, fy - 5, MARK); px(g, FX + 22 + 6, fy - 4, MARK); px(g, FX + 22 + 6, fy - 3, MARK);
  return { c: outline(c), ax: FX, ay: fy };
}
export const lieSprite = () => LIE || (LIE = (s => (s.L = { c: flipX(s.c), ax: s.c.width - 1 - s.ax, ay: s.ay }, s))(bakeLie()));
const put = (g, s, x, y, dir) => { const q = dir < 0 ? s.L : s; g.drawImage(q.c, Math.round(x - q.ax), Math.round(y - q.ay)); };

/* THE CUT POLE, foot at (sx, fy-3) in the chapel stone. ft: seconds since the blade went through; dir +-1, the way it falls. At the landing a puff of stone dust runs out along the floor. */
export function drawPoleFall(g, sx, fy, dir, ft, fallT, time, onHim = false) {
  /* the stump left standing in the stone, split pale across the top */
  const stump = () => { rect(g, sx - 2, fy - 8, 4, 6, WOOD); rect(g, sx - 2, fy - 8, 1, 6, WOOD_L); rect(g, sx - 2, fy - 9, 4, 1, CUT); px(g, sx + dir, fy - 10, CUT_D); px(g, sx - dir, fy - 10, CUT); };
  const fall = Math.min(1, ft / fallT);
  if (ft >= fallT) { if (!onHim) put(g, lieSprite(), sx, fy - 3, dir); stump(); drawPuff(g, sx + dir * 34, fy, ft - fallT, 1); return; }
  const k = FALL[Math.min(FALL.length - 1, Math.floor(fall * FALL.length))], s = poleSprite(k.a, k.w);
  put(g, s, sx, fy - 3, dir); stump();
  if (fall < 0.7) for (let i = 0; i < 4; i++) { const t = fall * 1.4 + i * 0.1; px(g, sx + dir * (2 + i * 2 + t * 6), fy - 9 - i * 2 + t * 8, i % 2 ? CUT : CUT_D); }   /* the chips thrown off the cut */
}

/* THE POLE ACROSS HIS BACK. Foot at the stone (sx), the pole lifting from it to the heap of him at x (tx): the angle is what it needs to lie across a man of backH. The cloth hangs down over him. */
export function drawPinPole(g, sx, fy, dir, tx, time, backH = 26) {
  const d = Math.max(14, Math.abs(tx - sx)), th = Math.atan2(backH, d), aDeg = Math.max(52, Math.min(80, 90 - th * 180 / Math.PI));
  const s = poleSprite(aDeg, 0.2 + 0.1 * Math.round(Math.sin(time * 5)), true); put(g, s, sx, fy - 3, dir);
}

/* THE FALL SHADOW: chevrons on the floor out from the foot, lengthening toward the tip (arc0..arc1), a bar where the tip lands. Violet while the pole stands; red and breathing on the side he is in. */
export function drawFallShadow(g, sx, fy, LF, hotDir, time, k) {
  for (const d of [-1, 1]) { const hot = hotDir === d, base = hot ? PINK : VIOLET, dim = hot ? RED : VIOLET_D;
    g.globalAlpha = hot ? 0.55 + 0.35 * k : 0.38;
    for (let x = LF.arc0; x < LF.arc1; x += 6) { const u = (x - LF.arc0) / (LF.arc1 - LF.arc0), len = 1 + Math.round(u * 2);   /* the chevrons grow toward the tip */
      for (let j = 0; j < len + 1; j++) { px(g, sx + d * (x + j), fy - 2 - j, base); px(g, sx + d * (x + j), fy - 2 + j, dim); }   /* a > pointing out toward the tip, growing */
      px(g, sx + d * (x + len + 2), fy - 2, base); }
    g.globalAlpha = hot ? 0.7 : 0.3; rect(g, sx + d * LF.arc1 - (d < 0 ? 0 : 1), fy - 6, 1, 5, hot ? HOT : VIOLET_L); rect(g, sx + d * LF.arc1 - (d < 0 ? 0 : 1), fy - 7, 1, 1, hot ? HOT : VIOLET_L);   /* where the tip will land */
    g.globalAlpha = 1; }
}

/* THE WARD SHATTERS: t seconds since it broke; the face is at wx (the lens' base at floor), wf the way it faces. 0.5 s: a white crack web, then shards thrown out and spinning down, then sparks. */
export function drawWardShatter(g, wx, fy, wf, t) {
  if (t < 0 || t > 0.55) return; const H = 56, top = fy - H - 2, a = t < 0.14 ? 1 : Math.max(0, 1 - (t - 0.14) / 0.41);
  g.globalAlpha = a;
  if (t < 0.14) { for (let i = 0; i < H; i += 3) { const x = wx + wf * (1 + Math.round(Math.sin(i * 0.9) * 5)); px(g, x, top + i, i % 2 ? '#ffffff' : HOT); px(g, x + wf, top + i + 1, PINK); }   /* the web of cracks: it is whole and it is broken */
    for (let j = 0; j < 4; j++) for (let i = 0; i < 9; i++) px(g, wx + wf * (1 + i), top + 10 + j * 12 + Math.round((i % 3 - 1) * 2), i % 2 ? PINK : '#ffffff'); }
  else { const u = (t - 0.14) / 0.41;
    for (let i = 0; i < 12; i++) { const sx = wx + wf * (2 + i * 2.5 * (0.5 + u)), sy = top + 4 + ((i * 17) % 46) + u * u * (30 + (i % 4) * 8) - Math.sin(i * 1.7) * 6 * u, sz = 1 + (i % 3 === 0 ? 1 : 0) + (u < 0.4 && i % 2 ? 1 : 0);
      if (sy > fy - 2) continue; rect(g, sx, sy, sz + 1, sz, i % 3 ? RED : PINK); px(g, sx, sy, HOT); px(g, sx + wf * (sz + 1), sy + sz, DRED); }   /* the shards: bright face, dark underside */
    for (let i = 0; i < 6; i++) px(g, wx + wf * (3 + i * 3 + u * 10), fy - 4 - ((i * 7 + t * 60) % 10), i % 2 ? '#ffffff' : PINK); }   /* the sparks off the floor */
  g.globalAlpha = 1;
}

/* DUST: stone dust from a landing or a laying-down, t seconds in, running out along the floor either side of x; big = the pole */
export function drawPuff(g, x, fy, t, big) {
  if (t < 0 || t > 0.6) return; const u = t / 0.6, n = big ? 7 : 4, w = big ? 5 : 3;
  g.globalAlpha = 0.75 * (1 - u);
  for (let i = 0; i < n; i++) { const d = (i % 2 ? 1 : -1) * (2 + Math.floor(i / 2) * w * (0.5 + u)), h = Math.max(2, Math.round((big ? 9 : 5) * (1 - u) * (1 - Math.abs(d) / (n * w * 1.5)))), yy = fy - 1 - Math.round(u * 3) - h;
    rect(g, x + d, yy, w - 1, h, i % 3 ? '#b8aca0' : '#d8cfc4'); px(g, x + d, yy, '#ece6dc'); }
  g.globalAlpha = 1;
}

/* THE CRACK UNDER A PIN: the stone splitting out from under him, fading as he holds it. t seconds since the pin; width 22 each side */
export function drawPinCrack(g, x, fy, t) {
  const grow = Math.min(1, t / 0.12), a = t < 1.2 ? 0.85 : Math.max(0.35, 0.85 - (t - 1.2) * 0.2); g.globalAlpha = a;
  for (const d of [-1, 1]) for (let i = 1; i <= Math.round(22 * grow); i++) { const y = fy - 1 - (i % 5 === 0 ? 1 : 0) + (i > 12 ? 1 : 0) * 0; px(g, x + d * i, y, i % 3 ? '#1b1626' : '#3a2e22'); if (i % 4 === 0 && i < 18) px(g, x + d * i, y + 1, '#1b1626'); }
  g.globalAlpha = 1;
}

/* THE BOUND DEAD: a braided thread from the thrall (bx, by-12) up in a curve to a ring on his pole (px_, py): two strands taking turns, a bead at the thrall, a ring at the pole, beads running up it.
   cut = true draws the SNAP - the thread parting in the middle and both halves falling away; u seconds in (0..0.4). */
export function drawThread(g, bx, by, ex, ey, time, k, cut = false, u = 0) {
  const mx = (bx + ex) / 2, my = Math.min(by, ey) - 14 - 3 * Math.sin(time * 4), N = Math.max(10, Math.round(Math.abs(ex - bx) / 3));
  const at = q => { const v = 1 - q; return [v * v * bx + 2 * v * q * mx + q * q * ex, v * v * by + 2 * v * q * my + q * q * ey]; };
  g.globalAlpha = cut ? Math.max(0, 1 - u / 0.4) : 0.8 + 0.2 * k;
  for (let i = 0; i <= N; i++) { const q = i / N; if (cut && Math.abs(q - 0.5) < 0.08 + u) continue; let [x, y] = at(q); if (cut) y += (q < 0.5 ? q : 1 - q) * 0 + u * 30 * Math.pow(Math.abs(q - 0.5) * 2, 2);
    const w = Math.sin(q * 40 + time * 3) > 0 ? 0 : 1; px(g, x, y + w, VIOLET_D); px(g, x, y + 1 - w, i % 2 ? VIOLET : VIOLET_L); px(g, x, y - 1 + w * 2, VIOLET_D); }
  if (!cut) for (let i = 0; i < 3; i++) { const [x, y] = at((time * 0.9 + i / 3) % 1); px(g, x, y - 1, '#ffffff'); px(g, x + 1, y - 1, VIOLET_L); }   /* beads of violet running up to the pole */
  g.globalAlpha = 1;
  rect(g, Math.round(bx) - 1, Math.round(by) - 1, 3, 3, VIOLET_D); px(g, bx, by - 1, VIOLET_L); px(g, bx, by + 1, VIOLET);   /* the bead tied at the thrall */
  if (!cut) { rect(g, Math.round(ex) - 2, Math.round(ey) - 2, 5, 5, VIOLET_D); rect(g, Math.round(ex) - 1, Math.round(ey) - 1, 3, 3, '#000000'); px(g, ex - 2, ey - 2, VIOLET_L); px(g, ex + 2, ey + 2, VIOLET); px(g, ex, ey, VIOLET_D); }   /* the ring on the pole it is tied through */
}

export function bakeDkLiftSheet() {   /* for tools/dkart-sheet.mjs: every baked sprite, in the order of the fall */
  return { fall: FALL.map(k => poleSprite(k.a, k.w).c), lie: lieSprite().c, pin: [56, 64, 72].map(a => poleSprite(a, 0.2, true).c) };
}
