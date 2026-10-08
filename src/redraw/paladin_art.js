// paladin_art.js - THE PALADIN, painted (claude/churchart). He used to be rectangles. Now he is a RIG: a figure of plates drawn each frame from a handful of pose numbers that
// glide toward the target pose of whatever he is doing - so a told blow RISES (the hammer climbs over his head), a slam FALLS, a bash THRUSTS, and nothing pops from one pose to the next.
//   BODY      white-and-gold plate (greaves, cuirass with a gilt cross, pauldrons, a great helm with a gold crest and a visor slit), a cream surcoat that sways, a red mantle that lags behind him
//   AEGIS     a gold-rimmed kite shield on his left arm (a white face, a gilt cross): it comes forward to guard, is pulled back to bash, is lowered when he falters; a ward arc glows round it
//   HAMMER    a great maul: ash shaft, steel head with a gold band; carried over the shoulder, raised overhead to tell, slammed down to strike, its head on the floor when he kneels
//   LIGHT     a NIMBUS behind his head and a glow in his chest that grow and fade with his light bar (PB.light); cracks of light in the plate in phase three
//   POSES     sleep (kneeling in prayer) / wake / guard (walk, recover) / chain / bash / mend / kindle / radiance / leap (crouch, tuck, land) / reel / FALTER (one knee, the maul's head on the floor, his head bowed)
// Everything is baked with px.js primitives into a 96 x 96 frame per call (outline included), so tools/lit-church-art-sheet.mjs can draw it in Node.
import { canvas, px, rect, line, fillPoly, circle, ellipse, outline, whiten } from '../px.js';

export const PA = { plate: '#dfe3ec', shade: '#9aa2b4', deep: '#6a7288', hi: '#ffffff', gold: '#d8b040', goldHi: '#fff0a8', goldLo: '#8a6a1c', cream: '#efe6d0', creamLo: '#c4b898', red: '#8a1c1c', redLo: '#5a1010', redHi: '#c0382c',
  steel: '#8e98aa', steelHi: '#d0d8e8', shaft: '#6a4a2a', shaftHi: '#a47a44', dark: '#1b1626', glow: '#fff6c8' };
export const FW = 96, FH = 96, OX = 48, OY = 80;   /* the frame: his feet at (OX, OY) */
const rad = d => d * Math.PI / 180;

/* ---------------- THE POSE NUMBERS and the target of every mode ---------------- */
export const POSE0 = { lean: 0, crouch: 0, kneel: 0, hamA: 120, shReach: 6, shY: 0, bow: 0, glow: 0, tuck: 0, rear: 0 };
const T = {
  sleep: { kneel: 1, crouch: 11, hamA: -90, shReach: -2, shY: 7, bow: 1 },
  wake: { kneel: 0.5, crouch: 6, hamA: -80, shReach: 2, shY: 3, bow: 0.4 },
  walk: { lean: 1, crouch: 1, hamA: 112, shReach: 9, shY: -1 }, kindleWalk: { lean: 1, crouch: 1, hamA: 112, shReach: 9, shY: -1, glow: 0.3 },
  recover: { lean: 0, crouch: 1, hamA: 118, shReach: 8, shY: 0 },
  chainTell: { lean: -3, crouch: 2, hamA: 92, shReach: 3, shY: 0 }, chainBeatTell: { lean: -3, crouch: 2, hamA: 92, shReach: 3, shY: 0 }, chain: { lean: 5, crouch: 3, hamA: -38, shReach: 7, shY: 1 },
  bashTell: { lean: -4, crouch: 3, hamA: 140, shReach: -3, shY: 0, rear: 1 }, bash: { lean: 5, crouch: 2, hamA: 128, shReach: 16, shY: -1 },
  mendTell: { kneel: 0.6, crouch: 6, hamA: -88, shReach: 1, shY: 4, bow: 1, glow: 1 },
  kindleTell: { kneel: 0.2, crouch: 2, hamA: 140, shReach: 15, shY: -5, glow: 0.8 },
  radTell: { lean: -2, crouch: 0, hamA: 86, shReach: 6, shY: -8, glow: 1 }, rad: { lean: 3, crouch: 4, hamA: -62, shReach: 8, shY: -2, glow: 1 },
  leapTell: { lean: -4, crouch: 8, hamA: 150, shReach: 3, shY: 2, glow: 0.5 }, leap: { lean: 3, crouch: -2, hamA: 88, shReach: 8, shY: -3, tuck: 1, glow: 0.6 }, land: { lean: 2, crouch: 9, hamA: -72, shReach: 6, shY: 3, glow: 0.4 },
  reel: { lean: -6, crouch: 3, hamA: 150, shReach: -3, shY: 1, rear: 1 },
  falter: { kneel: 1, crouch: 11, hamA: -82, shReach: -4, shY: 8, bow: 1 },
};
const RATE = { chain: 28, bash: 26, rad: 22, land: 20, leap: 18, reel: 15, falter: 14, wake: 6, sleep: 8, chainTell: 11, chainBeatTell: 16, bashTell: 12, mendTell: 8, kindleTell: 9, radTell: 8, leapTell: 9, walk: 12, recover: 9, kindleWalk: 12 };
export const newPose = () => ({ ...POSE0, t: 0, ph: 0, lx: null, moving: 0, cape: 0, mode: 'sleep' });
/* glide the pose toward the mode's target (dt in s) */
export function stepPose(p, mode, dt, x, o = {}) {
  const tg = { ...POSE0, ...(T[mode] || T.walk) }; if (o.ward) { tg.shReach = Math.max(tg.shReach, 10); tg.glow = Math.max(tg.glow, 0.5); }
  const k = 1 - Math.exp(-(RATE[mode] || 12) * Math.min(0.06, dt));
  for (const n of Object.keys(POSE0)) p[n] += (tg[n] - p[n]) * k;
  const vx = p.lx == null ? 0 : (x - p.lx) / Math.max(dt, 1e-3); p.lx = x; p.moving += ((Math.abs(vx) > 14 ? 1 : 0) - p.moving) * Math.min(1, dt * 10);
  p.ph += dt * 9 * p.moving; p.cape += (Math.max(-1, Math.min(1, vx / 160)) - p.cape) * Math.min(1, dt * 7); p.t += dt; p.mode = mode; return p; }

/* ---------------- THE FIGURE ---------------- */
const poly = (g, pts, col) => fillPoly(g, pts, col);
/* one frame of him facing RIGHT (flip for left). opts: { light: 0..1, flash, phase3, ward, guard } */
export function bakeFigure(p, o = {}) {
  const [c, g] = canvas(FW, FH), L = Math.max(0, Math.min(1, o.light == null ? 0.8 : o.light)), cr = p.crouch, kn = p.kneel, lean = p.lean;
  const hipY = OY - 13 + Math.round(cr * (1 - 0.0)), chestY = OY - 31 + Math.round(cr), headY = OY - 40 + Math.round(cr) + Math.round(p.bow * 4), tx = OX + Math.round(lean);
  /* --- the NIMBUS and the chest glow (behind everything): his light made visible --- */
  const gl = Math.max(L * 0.75, p.glow);
  const nim = gl > 0.05 ? { x: tx, y: headY + 2, r: Math.round(10 + gl * 10), gl, rays: L > 0.5 } : null; let hamC = null;
  /* --- the MANTLE: red, from the shoulders, trailing behind (opposite his facing) with the lag of his stride --- */
  { const sway = Math.round(p.cape * 5 + Math.sin(p.t * 2.4) * 0.8 - p.lean * 0.6), bot = OY - 2 + Math.round(cr * 0.2) - (kn > 0.5 ? 6 : 0);
    poly(g, [[tx - 4, chestY - 1], [tx - 8 - sway, chestY + 4], [tx - 11 - sway * 1.4, bot - 4], [tx - 5 - sway * 0.6, bot], [tx - 2, bot - 2], [tx + 1, chestY + 3]], PA.red);
    poly(g, [[tx - 4, chestY - 1], [tx - 7 - sway, chestY + 5], [tx - 8 - sway, bot - 8], [tx - 3, chestY + 10]], PA.redHi); line(g, tx - 5, chestY + 6, tx - 9 - sway * 1.3, bot - 6, PA.redLo); }
  /* --- the LEGS --- */
  const sabaton = (fx, fy, col) => { rect(g, fx - 2, fy - 3, 8, 3, col); rect(g, fx - 2, fy - 3, 8, 1, PA.plate); };
  const walkK = Math.sin(p.ph) * p.moving * 3;
  if (kn > 0.5) {   /* one knee on the floor: the back leg lies along it, the front leg bent */
    poly(g, [[OX - 5, hipY + 2], [OX - 11, OY - 4], [OX - 6, OY - 2], [OX - 1, hipY + 6]], PA.shade); rect(g, OX - 13, OY - 3, 7, 3, PA.deep);   /* the back (kneeling) leg */
    poly(g, [[OX + 1, hipY + 1], [OX + 8, hipY + 4], [OX + 8, OY - 3], [OX + 4, OY - 3], [OX + 3, hipY + 7]], PA.plate); sabaton(OX + 4, OY, PA.shade); rect(g, OX + 5, hipY + 2, 4, 3, PA.goldLo); }
  else if (p.tuck > 0.5) { poly(g, [[OX - 5, hipY], [OX + 6, hipY], [OX + 8, OY - 14], [OX + 2, OY - 12], [OX - 1, OY - 16], [OX - 7, OY - 12]], PA.shade); sabaton(OX - 6, OY - 11, PA.deep); sabaton(OX + 3, OY - 12, PA.shade); }
  else { const sp = Math.round(Math.max(2, 4 - cr * 0.12)), a = Math.round(walkK), b = -a;
    poly(g, [[OX - sp - 1 + a, hipY], [OX - sp + 5 + a, hipY], [OX - sp + 5 + a, OY - 3], [OX - sp - 1 + a, OY - 3]], PA.deep); sabaton(OX - sp - 2 + a, OY, PA.deep);
    poly(g, [[OX + sp - 4 + b, hipY], [OX + sp + 2 + b, hipY], [OX + sp + 2 + b, OY - 3], [OX + sp - 4 + b, OY - 3]], PA.shade); sabaton(OX + sp - 4 + b, OY, PA.shade);
    rect(g, OX - sp - 1 + a, hipY + 4, 6, 1, PA.goldLo); rect(g, OX + sp - 4 + b, hipY + 4, 6, 1, PA.gold); }
  /* --- the SURCOAT hanging from the belt, swaying --- */
  { const sw = Math.round(p.cape * -2 + Math.sin(p.t * 3) * 0.6), top = chestY + 11, bot = Math.min(OY - 4, hipY + 8) + (kn > 0.5 ? 2 : 0);
    poly(g, [[tx - 6, top], [tx + 6, top], [tx + 7 + sw, bot], [tx - 7 + sw, bot]], PA.cream); rect(g, tx - 1, top, 2, bot - top, PA.gold); rect(g, tx - 7 + sw, bot - 1, 15, 1, PA.gold); line(g, tx - 4, top + 2, tx - 5 + sw, bot - 2, PA.creamLo); }
  /* --- the TORSO: a cuirass with a gilt cross --- */
  poly(g, [[tx - 8, chestY], [tx + 8, chestY], [tx + 7, chestY + 12], [tx + 5, chestY + 14], [tx - 5, chestY + 14], [tx - 7, chestY + 12]], PA.plate);
  poly(g, [[tx + 2, chestY + 1], [tx + 8, chestY + 1], [tx + 7, chestY + 12], [tx + 5, chestY + 14], [tx + 2, chestY + 14]], PA.shade);
  rect(g, tx - 8, chestY, 16, 1, PA.hi); rect(g, tx - 6, chestY + 11, 12, 2, PA.gold); rect(g, tx - 6, chestY + 11, 12, 1, PA.goldHi);
  rect(g, tx - 1, chestY + 2, 2, 8, PA.gold); rect(g, tx - 4, chestY + 4, 8, 2, PA.gold); px(g, tx - 1, chestY + 2, PA.goldHi); px(g, tx - 4, chestY + 4, PA.goldHi);
  if (gl > 0.2) { g.globalAlpha = Math.min(1, gl); px(g, tx, chestY + 5, PA.glow); px(g, tx - 1, chestY + 5, PA.glow); px(g, tx, chestY + 4, PA.glow); px(g, tx, chestY + 6, PA.glow); g.globalAlpha = 1; }
  if (o.phase3) { for (const [x0, y0, x1, y1] of [[-5, 3, -2, 8], [3, 8, 6, 12], [-3, 11, 0, 14]]) { line(g, tx + x0, chestY + y0, tx + x1, chestY + y1, PA.goldHi); } px(g, tx + 5, chestY + 2, PA.glow); }   /* the plate cracks and the light shows through */
  /* --- the far (rear) arm, the hammer arm --- */
  const hx0 = tx + 5, hy0 = chestY + 7;   /* the hand's pivot: his right hand on the haft */
  const A = rad(p.hamA), len = 25, dx = Math.cos(A), dy = -Math.sin(A), hx = hx0 + dx * 3, hy = hy0 + dy * 3, ex = hx0 + dx * len, ey = hy0 + dy * len;
  /* the shaft, behind the hand: a lashed ash haft with a gold ring */
  line(g, Math.round(hx0 - dx * 4), Math.round(hy0 - dy * 4), Math.round(ex), Math.round(ey), PA.shaft, 2); line(g, Math.round(hx0 - dx * 4), Math.round(hy0 - dy * 4 - 1), Math.round(ex), Math.round(ey - 1), PA.shaftHi);
  { const mx = hx0 + dx * 12, my = hy0 + dy * 12; px(g, Math.round(mx), Math.round(my), PA.gold); px(g, Math.round(mx + dy), Math.round(my - dx), PA.goldHi); }
  /* the head: a block set across the haft's end */
  { const px0 = -dy, py0 = dx, hl = 3.6, hw = 6, cx0 = ex + dx * 3, cy0 = ey + dy * 3;
    poly(g, [[cx0 - dx * hl + px0 * hw, cy0 - dy * hl + py0 * hw], [cx0 + dx * hl + px0 * hw, cy0 + dy * hl + py0 * hw], [cx0 + dx * hl - px0 * hw, cy0 + dy * hl - py0 * hw], [cx0 - dx * hl - px0 * hw, cy0 - dy * hl - py0 * hw]], PA.steel);
    poly(g, [[cx0 - dx * hl + px0 * hw, cy0 - dy * hl + py0 * hw], [cx0 + dx * 1 + px0 * hw, cy0 + dy * 1 + py0 * hw], [cx0 + dx * 1 - px0 * hw, cy0 + dy * 1 - py0 * hw], [cx0 - dx * hl - px0 * hw, cy0 - dy * hl - py0 * hw]], PA.steelHi);
    line(g, Math.round(cx0 - dx * 0.5 + px0 * hw), Math.round(cy0 - dy * 0.5 + py0 * hw), Math.round(cx0 - dx * 0.5 - px0 * hw), Math.round(cy0 - dy * 0.5 - py0 * hw), PA.gold);
    if (p.glow > 0.4 || o.hammerGlow) hamC = { x: Math.round(cx0), y: Math.round(cy0), k: Math.min(1, Math.max(p.glow, o.hammerGlow || 0)) }; }
  /* the arm and the gauntlet over the haft */
  poly(g, [[tx + 3, chestY + 1], [tx + 8, chestY + 2], [Math.round(hx0 + dx * 2) + 2, Math.round(hy0 + dy * 2) + 1], [Math.round(hx0 + dx * 2) - 1, Math.round(hy0 + dy * 2) + 3]], PA.shade); rect(g, Math.round(hx0 + dx * 2) - 2, Math.round(hy0 + dy * 2) - 1, 4, 4, PA.plate); px(g, Math.round(hx0 + dx * 2), Math.round(hy0 + dy * 2), PA.gold);
  /* --- the HELM: a great helm, a crest and a plume, a visor slit that glows with his light --- */
  const hx1 = tx + Math.round(p.bow * 2), hy1 = headY;
  poly(g, [[hx1 - 5, hy1 + 1], [hx1 + 5, hy1 + 1], [hx1 + 5, hy1 + 8], [hx1 + 3, hy1 + 11], [hx1 - 3, hy1 + 11], [hx1 - 5, hy1 + 8]], PA.plate);
  rect(g, hx1 - 5, hy1 + 1, 2, 9, PA.hi); rect(g, hx1 + 2, hy1 + 1, 3, 10, PA.shade); rect(g, hx1 - 4, hy1, 8, 1, PA.plate); rect(g, hx1 - 3, hy1 - 1, 6, 1, PA.plate);
  rect(g, hx1 - 1, hy1 - 3, 2, 14, PA.gold); rect(g, hx1 - 5, hy1 + 5, 10, 1, PA.gold);   /* the gilt cross on the face */
  rect(g, hx1 + 1, hy1 + 3, 4, 2, PA.dark); if (L > 0.3 || gl > 0.3) { g.globalAlpha = Math.min(1, 0.5 + gl * 0.6); rect(g, hx1 + 2, hy1 + 3, 3, 1, PA.glow); g.globalAlpha = 1; }   /* the slit */
  poly(g, [[hx1 - 2, hy1 - 1], [hx1 + 2, hy1 - 1], [hx1 + 1, hy1 - 6 - Math.round(p.cape * -1)], [hx1 - 4, hy1 - 3 + Math.round(p.cape * 3)]], PA.red);   /* the plume */
  /* --- the PAULDRON --- */
  poly(g, [[tx - 9, chestY - 1], [tx + 1, chestY - 2], [tx + 3, chestY + 5], [tx - 8, chestY + 6]], PA.plate); rect(g, tx - 9, chestY - 1, 9, 1, PA.hi); rect(g, tx - 7, chestY + 4, 8, 1, PA.gold);
  poly(g, [[tx + 4, chestY - 1], [tx + 10, chestY], [tx + 10, chestY + 6], [tx + 4, chestY + 5]], PA.shade); rect(g, tx + 4, chestY - 1, 6, 1, PA.hi);
  /* --- the AEGIS: a kite shield on the left arm, in front --- */
  { const sx = tx + 6 + Math.round(p.shReach * 0.8), sy = chestY + 6 + Math.round(p.shY), w = 10, h = 19, sc = o.guard ? 1 : 0;
    poly(g, [[sx - w / 2, sy - h / 2], [sx + w / 2, sy - h / 2], [sx + w / 2, sy + 3], [sx, sy + h / 2 + 2], [sx - w / 2, sy + 3]], PA.goldLo);
    poly(g, [[sx - w / 2 + 1, sy - h / 2 + 1], [sx + w / 2 - 1, sy - h / 2 + 1], [sx + w / 2 - 1, sy + 3], [sx, sy + h / 2], [sx - w / 2 + 1, sy + 3]], PA.cream);
    poly(g, [[sx - w / 2 + 1, sy - h / 2 + 1], [sx - 1, sy - h / 2 + 1], [sx - 1, sy + h / 2 - 1], [sx - w / 2 + 1, sy + 3]], PA.hi);
    rect(g, sx - 1, sy - 6, 2, 12, PA.gold); rect(g, sx - 3, sy - 3, 6, 2, PA.gold); px(g, sx - 1, sy - 6, PA.goldHi); rect(g, sx - w / 2, sy - h / 2, w, 1, PA.gold);
    if (gl > 0.4 || sc) { g.globalAlpha = 0.25 + 0.3 * gl; rect(g, sx - 1, sy - 5, 2, 10, PA.glow); g.globalAlpha = 1; }
    o._sh = [sx, sy]; }
  outline(c, PA.dark);
  /* the light itself is laid UNDER and OVER the outlined figure (no dark rim round a glow) */
  const [d, gd] = canvas(FW, FH);
  if (nim) { gd.globalAlpha = 0.3 * nim.gl; circle(gd, nim.x, nim.y, nim.r, PA.goldHi); gd.globalAlpha = 0.4 * nim.gl; circle(gd, nim.x, nim.y, nim.r - 4, PA.glow); gd.globalAlpha = 1;
    if (nim.rays) { gd.globalAlpha = 0.6; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2; rect(gd, Math.round(nim.x + Math.cos(a) * (nim.r + 2)), Math.round(nim.y + Math.sin(a) * (nim.r + 2)), 1, 1, PA.goldHi); } gd.globalAlpha = 1; } }
  gd.drawImage(c, 0, 0);
  if (hamC) { gd.globalAlpha = hamC.k * 0.6; circle(gd, hamC.x, hamC.y, 7, PA.glow); gd.globalAlpha = hamC.k * 0.8; circle(gd, hamC.x, hamC.y, 3, '#ffffff'); gd.globalAlpha = 1; }
  return o.flash ? whiten(d) : d;
}
/* the sheet: a row of poses */
export function sheetItems() { const out = [], modes = ['sleep', 'walk', 'chainTell', 'chain', 'bashTell', 'bash', 'mendTell', 'kindleTell', 'radTell', 'rad', 'leapTell', 'leap', 'land', 'reel', 'falter'];
  for (const m of modes) { const p = newPose(); for (let i = 0; i < 80; i++) stepPose(p, m, 1 / 60, 0); p.t = 1; out.push(bakeFigure(p, { light: m === 'falter' ? 0 : 0.8, phase3: m === 'rad' })); }
  const a = newPose(), b = newPose(); for (let i = 0; i < 200; i++) stepPose(a, 'walk', 1 / 60, 0); stepPose(b, 'walk', 1 / 60, 0);
  for (const m of ['chainTell', 'chain']) { const p = newPose(); for (let i = 0; i < 80; i++) stepPose(p, 'walk', 1 / 60, 0); for (let i = 0; i < 12; i++) { stepPose(p, m, 1 / 60, 0); if (i % 3 === 0) out.push(bakeFigure(p, { light: 0.7 })); } }
  return out; }

/* ---------------- THE EFFECTS (drawn on the live canvas, fillRect only) ---------------- */
/* THE LIGHT BAR: a gilt frame, a two-tone fill with a bright leading edge, quarter ticks; x,y the centre-top; w the width. up/down: the recent change (gold flare / red notch) */
export function drawLightBar(g, x, y, w, k, o = {}) {
  const ww = w + 4; g.fillStyle = PA.dark; g.fillRect(x - ww / 2 - 1, y - 2, ww + 2, 8); g.fillStyle = PA.goldLo; g.fillRect(x - ww / 2, y - 1, ww, 6); g.fillStyle = '#10101c'; g.fillRect(x - w / 2, y, w, 4);
  const fw = Math.round(w * k); if (fw > 0) { g.fillStyle = o.open ? '#5a5a6a' : o.up ? '#ffffff' : PA.gold; g.fillRect(x - w / 2, y, fw, 4); g.fillStyle = o.open ? '#7a7a8a' : PA.goldHi; g.fillRect(x - w / 2, y, fw, 1); if (!o.open) { g.fillStyle = '#ffffff'; g.fillRect(x - w / 2 + fw - 1, y, 1, 4); } }
  g.fillStyle = '#10101c'; for (const q of [0.25, 0.5, 0.75]) g.fillRect(Math.round(x - w / 2 + w * q), y, 1, 4);
  if (o.down) { g.fillStyle = '#ff6b6b'; g.fillRect(x - w / 2 + fw, y, 3, 4); }
  g.fillStyle = PA.gold; g.fillRect(x - ww / 2 - 2, y + 1, 2, 4); g.fillRect(x + ww / 2, y + 1, 2, 4); g.fillRect(x - ww / 2 - 1, y - 1, 1, 2); g.fillRect(x + ww / 2, y - 1, 1, 2); }
/* a column of RADIANCE: a core, soft sides, rising motes, a flare of a cross at the top where the rose window is, and a lit pool at the foot */
export function drawColumn(g, x, top, floor, halfW, time, k = 1) {
  const h = floor - top; if (h < 4) return;
  g.globalAlpha = 0.22 * k; g.fillStyle = PA.goldHi; g.fillRect(x - halfW - 3, top, (halfW + 3) * 2, h); g.globalAlpha = 0.45 * k; g.fillStyle = PA.glow; g.fillRect(x - halfW, top, halfW * 2, h);
  g.globalAlpha = 0.85 * k; g.fillStyle = '#ffffff'; g.fillRect(x - Math.max(2, halfW - 5), top, Math.max(4, (halfW - 5) * 2), h); g.globalAlpha = 1;
  for (let i = 0; i < 9; i++) { const yy = floor - ((time * 70 + i * 37) % h), xx = x - halfW + 2 + ((i * 53) % (halfW * 2 - 3)); g.fillStyle = i & 1 ? PA.goldHi : '#ffffff'; g.fillRect(Math.round(xx), Math.round(yy), 1, 2); }
  g.globalAlpha = 0.7 * k; g.fillStyle = PA.gold; g.fillRect(x - 1, top, 2, 14); g.fillRect(x - 5, top + 4, 10, 2); g.fillRect(x - halfW - 4, floor - 2, (halfW + 4) * 2, 2); g.globalAlpha = 1; }
/* the HOLY FLOOR: tongues of gold fire along the floor with embers rising */
export function drawHolyFloor(g, x, floor, half, time, k = 1) {
  for (let i = -half; i < half; i += 2) { const ph = time * 11 + i * 0.9, h = Math.round((4 + 7 * Math.abs(Math.sin(ph)) + 3 * Math.abs(Math.sin(ph * 0.37))) * k), c = Math.abs(i) < half * 0.45 ? PA.glow : PA.goldHi;
    g.fillStyle = '#ff9a3c'; g.fillRect(x + i, floor - h, 2, h); g.fillStyle = PA.gold; g.fillRect(x + i, floor - Math.max(1, h - 2), 2, Math.max(1, h - 2)); g.fillStyle = c; g.fillRect(x + i, floor - Math.max(1, h - 4), 2, Math.max(1, h - 4)); }
  for (let j = 0; j < 6; j++) { const yy = floor - ((time * 38 + j * 23) % 28), xx = x - half + ((j * 31 + Math.floor(time * 3)) % (half * 2)); g.fillStyle = PA.goldHi; g.fillRect(xx, Math.round(yy), 1, 1); } }
