// sea_looks.js — EVERY SEA LEVEL A LOOK OF ITS OWN. The reef, the Deep, the Lamplit Street, the Long Water and the Causeway
// were one set of coral and one wash of teal apart. This is what each of them has that the others do not, painted in layers
// main.js calls at fixed points of drawWorld:
//   seaFar   behind the haze and the depth gloom (so it sinks into them): trench walls, the whale, a bell tower, a galleon
//   seaBack  after the near parallax, behind the tiles: the living layer and each level's own lights
//   seaOver  over the tiles, under the creatures: light on the sand, lamps
//   seaHoles in the dark pass: what glows opens the black round it
//   seaRim   how a creature in the water is picked out (the Deep lights its creatures with its own glow)
// RULES: everything here is scenery - no collision, no gameplay, nothing a creature or the hero reads. Every detail's identity
// is hashed from its WORLD position (never the screen's), so it is the same thing in the same place however you arrive, and
// every animation is a function of `time` or baked, so a frame drawn twice is the same frame (the readability pass does that).
import { canvas, px, rect, line, ellipse, circle, fillPoly, flipX, whiten } from './px.js';

const TS = 16;
const hsh = (x, y, s) => { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };
let S = null;            /* the level's look, or null for a level that has none */
let L = null;

/* GLOW SPRITES: a soft round light, baked once per colour and radius, drawn with 'lighter'. A createRadialGradient per mote
   per frame is what a sea of them would cost otherwise. */
const GLOW = new Map();
function glowOf(rgb, r) {
  const k = rgb + '/' + r; let c = GLOW.get(k); if (c) return c;
  const [cv, g] = canvas(r * 2, r * 2); const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(0.35, 'rgba(' + rgb + ',0.45)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
  g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); GLOW.set(k, cv); return cv;
}
const inSwim = (x, y) => { for (const p of (L.pools || [])) if (p.swim && !p.dry && x > p.x0 && x < p.x1 && y > p.y + 4 && (p.bottom === undefined || p.bottom === null || y <= p.bottom + 12)) return true; return false; };
const tileAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= L.W || ty >= L.H) ? 1 : L.grid[ty * L.W + tx];

// ============================================================================================
// THE DEEP — A DARK TRENCH. Its walls going down either side of you in the far water, lit in patches by what grows on them;
// the skeleton of a whale hanging in the black of the Glowing Drop; marine snow coming down through all of it; the tribute's
// gold glinting on the floor far below; and a glow of its own that catches every creature in the water.
// ============================================================================================
const DC = { rock: '#2a5566', rockM: '#234a5a', rockL: '#3a6a7a', rim: '#56929e', bone: '#5d7478', boneL: '#90aaa6', boneD: '#34464e', boneDD: '#22323a', gold: '#c9a83a', goldL: '#f2d88e', goldD: '#6a5420' };
const BIO = ['120,240,220', '170,140,255', '150,255,150', '110,200,255'];

/* THE TRENCH WALL, 320 wide and 384 tall and seamless top to bottom: a cliff down the left, a cliff down the right, ledges
   off both, and the colonies that glow on them (their places kept, lit at draw time so they pulse) */
function bakeTrenchWall() {
  const W = 320, H = 384; const [c, g] = canvas(W, H); const lights = [];
  const prof = (y, s) => { const t = y / H * Math.PI * 2; return Math.sin(t * 2 + s) * 14 + Math.sin(t * 5 + s * 3) * 7 + Math.sin(t * 11 + s * 5) * 3 + (Math.sin(t * 7 + s) > 0.82 ? 26 : 0); };
  for (let y = 0; y < H; y++) {
    const a = Math.round(52 + prof(y, 0.7)), b = Math.round(W - 58 - prof(y, 2.3));
    rect(g, 0, y, a, 1, DC.rock); rect(g, b, y, W - b, 1, DC.rock);
    rect(g, Math.max(0, a - 10), y, 10, 1, DC.rockM); rect(g, b, y, 10, 1, DC.rockM);
    const up = Math.round(52 + prof(y - 1, 0.7)), ub = Math.round(W - 58 - prof(y - 1, 2.3));
    if (a > up + 1) rect(g, up, y, a - up, 1, DC.rim); else px(g, a - 1, y, DC.rockL);   /* a ledge's top catches what light there is */
    if (b < ub - 1) rect(g, b, y, ub - b, 1, DC.rim); else px(g, b, y, DC.rockL);
    if (y % 23 === 0) { rect(g, 4, y, a - 14, 1, DC.rockM); rect(g, b + 12, y, W - b - 16, 1, DC.rockM); }   /* the strata */
  }
  for (let i = 0; i < 26; i++) { const left = i % 2 === 0, y = Math.floor(hsh(i, 3, 1) * H);
    const edge = left ? Math.round(52 + prof(y, 0.7)) : Math.round(W - 58 - prof(y, 2.3));
    const x = left ? edge - 3 - Math.floor(hsh(i, 5, 2) * 16) : edge + 3 + Math.floor(hsh(i, 5, 2) * 16);
    lights.push({ x, y, col: BIO[i % BIO.length], ph: hsh(i, 9, 4) * 6, n: 2 + (i % 3) });
    for (let k = 0; k < 3 + (i % 3); k++) px(g, x + Math.round((hsh(i, k, 7) - 0.5) * 6), y + Math.round((hsh(k, i, 8) - 0.5) * 5), '#2e6a72'); }
  /* the ledges wide enough to hold something: where a step out of the cliff is four pixels or more */
  const ledges = []; for (let y = 8; y < H; y += 2) { const a = Math.round(52 + prof(y, 0.7)), up = Math.round(52 + prof(y - 2, 0.7)); if (a > up + 12 && ledges.every(q => Math.abs(q.y - y) > 40)) ledges.push({ x: a - 20, y }); }
  for (let y = 8; y < H; y += 2) { const b = Math.round(W - 58 - prof(y, 2.3)), ub = Math.round(W - 58 - prof(y - 2, 2.3)); if (b < ub - 12 && ledges.every(q => q.x < 160 || Math.abs(q.y - y) > 40)) ledges.push({ x: b + 20, y }); }
  c.lights = lights; c.ledges = ledges; return c;
}

/* THE WHALE, 300x128: a skull and its long jaw at the left, the spine arching back to the flukes, ribs hanging off the
   front half, a flipper's bones; drawn cold and dim, because it is far off in the black */
function bakeWhale() {
  const W = 300, H = 128; const [c, g] = canvas(W, H);
  const spine = x => 40 + Math.sin((x - 60) / 240 * Math.PI) * -22 + (x > 230 ? (x - 230) * 0.35 : 0);
  // the skull: a long wedge of a head, the jaw under it hanging a little open
  fillPoly(g, [[4, 44], [18, 34], [48, 28], [74, 30], [80, 40], [70, 50], [40, 52], [12, 50]], DC.bone);
  fillPoly(g, [[10, 52], [40, 56], [72, 54], [76, 60], [44, 64], [14, 60]], DC.boneD);
  line(g, 8, 44, 74, 32, DC.boneL); line(g, 14, 58, 70, 57, DC.bone);
  ellipse(g, 60, 40, 5, 4, DC.boneDD); px(g, 59, 39, '#0c1c26');   /* the eye socket */
  rect(g, 22, 40, 26, 2, DC.boneD);
  // the spine: a vertebra every six pixels, smaller towards the tail
  for (let x = 78; x < 292; x += 6) { const y = Math.round(spine(x)), s = x < 200 ? 4 : x < 250 ? 3 : 2;
    rect(g, x - s, y - s, s * 2, s * 2, DC.bone); rect(g, x - s, y - s, s * 2, 1, DC.boneL); rect(g, x - 1, y - s - 3, 2, 3, DC.boneD); }
  // the flukes
  fillPoly(g, [[286, 92], [298, 78], [296, 100], [298, 118], [284, 104]], DC.boneD);
  // the ribs, hanging in long curves off the front of the spine
  for (let k = 0; k < 11; k++) { const x0 = 88 + k * 11, y0 = Math.round(spine(x0)) + 3, len = 58 - Math.abs(k - 4) * 4;
    let lx = x0, ly = y0; for (let t = 1; t <= len; t++) { const nx = x0 - Math.sin(t / len * 1.6) * 12 + t * 0.12, ny = y0 + t; line(g, lx, ly, nx, ny, t < 6 ? DC.boneL : DC.bone, 2); lx = nx; ly = ny; }
    if (k === 3 || k === 8) { rect(g, Math.round(lx) - 3, Math.round(ly) + 2, 3, 2, DC.boneD); } }   /* two of them broken, the ends lying below */
  // a flipper's bones
  line(g, 96, 56, 84, 86, DC.bone, 3); for (let f = 0; f < 4; f++) line(g, 84, 86, 72 + f * 6, 104 + (f % 2) * 4, DC.boneD, 2);
  c.lights = [[30, 36], [118, 36], [160, 54], [212, 44], [252, 60], [100, 90], [140, 96], [70, 58]].map(([x, y], i) => ({ x, y, col: BIO[i % 3], ph: i * 1.3 }));
  return c;
}

/* THE TRIBUTE, far below: thirty years of it went over the side, and it lies on the ledges of the trench walls in slopes of coin
   with the coffers it came in. 36x10, stood on a ledge of the far wall */
function bakeHoard() {
  const W = 36, H = 10; const [c, g] = canvas(W, H);
  fillPoly(g, [[0, 10], [10, 5], [18, 3], [27, 5], [36, 10]], DC.goldD);
  for (let i = 0; i < 26; i++) { const x = Math.floor(hsh(i, 1, 3) * 32) + 2, top = 10 - Math.max(0, 7 - Math.abs(x - 18) * 0.4); const y = Math.floor(top + hsh(i, 2, 3) * (10 - top)); px(g, x, y, i % 3 ? DC.gold : DC.goldL); }
  rect(g, 11, 1, 7, 5, '#3a2618'); rect(g, 11, 1, 7, 1, '#5a3a24'); px(g, 14, 3, DC.gold);
  return c;
}

/* THE DEEP'S OWN DRESSING (stood on its floors by the level's sprinkler): tube worms off the vents' warmth, coral that makes
   its own light, sea lilies, the bones of things that sank, and the tribute spilt where a coffer burst */
function bakeTubeWorms(v) {
  const W = 16, H = 18; const [c, g] = canvas(W, H);
  const tubes = v ? [[3, 10], [6, 14], [9, 9], [12, 12]] : [[2, 12], [5, 8], [8, 15], [11, 10], [14, 7]];
  for (const [x, h] of tubes) { rect(g, x, H - h, 2, h, '#c8c0b0'); rect(g, x, H - h, 1, h, '#e8e0d0'); rect(g, x + 1, H - h + 2, 1, h - 2, '#8a8478');
    rect(g, x - 1, H - h - 2, 4, 2, '#b82a3a'); px(g, x, H - h - 3, '#e8505a'); px(g, x + 1, H - h - 3, '#b82a3a'); }
  rect(g, 0, H - 2, W, 2, '#3a3a38'); return c;
}
function bakeGlowCoral(v) {
  const W = 18, H = 16; const [c, g] = canvas(W, H); const tip = v % 2 ? '#c8a8ff' : '#9ffff0', mid = v % 2 ? '#6a50a8' : '#2e8a86';
  const br = (x, y, a, n) => { let cx = x, cy = y; for (let i = 0; i < n; i++) { const nx = cx + Math.cos(a) * 2, ny = cy - 2; line(g, cx, cy, nx, ny, i < n - 2 ? '#1e3a44' : mid); cx = nx; cy = ny; a += (i % 2 ? 0.5 : -0.5) * (v === 2 ? -1 : 1); }
    px(g, Math.round(cx), Math.round(cy) - 1, tip); return [cx, cy]; };
  br(9, 15, -Math.PI / 2, 6); br(8, 12, -2.3, 4); br(10, 11, -0.8, 5); br(6, 9, -2.6, 3); br(12, 8, -0.4, 3);
  rect(g, 5, 14, 9, 2, '#1e3a44'); return c;
}
function bakeSeaLily(v) {
  const W = 14, H = 22; const [c, g] = canvas(W, H);
  for (let y = 8; y < H; y++) px(g, 7 + Math.round(Math.sin(y * 0.4 + v) * 0.6), y, y % 3 ? '#7a5a8a' : '#a888b8');
  for (let k = 0; k < 7; k++) { const a = -Math.PI + (k / 6) * Math.PI; let x = 7, y = 8; for (let t = 0; t < 5; t++) { x += Math.cos(a) * 1.2; y += Math.sin(a) * 1.2 + t * 0.35; px(g, Math.round(x), Math.round(y), t < 3 ? '#c8a0d8' : '#f0c8f0'); } }
  rect(g, 5, H - 1, 5, 1, '#4a3a58'); return c;
}
function bakeBoneHeap(v) {
  const W = 22, H = 10; const [c, g] = canvas(W, H);
  fillPoly(g, [[1, 10], [4, 6], [10, 5], [16, 7], [21, 10]], '#4e5a58');
  line(g, 2, 7, 18, 3 + v, '#b8b0a0', 2); rect(g, 1, 6, 3, 3, '#d8cfb8'); rect(g, 17, 2 + v, 3, 3, '#d8cfb8');
  if (v) { ellipse(g, 12, 7, 4, 2, '#aea288'); px(g, 11, 7, '#34464e'); } else { line(g, 8, 9, 13, 4, '#aea288'); line(g, 11, 9, 16, 4, '#aea288'); }
  return c;
}
function bakeTributeSpill(v) {
  const W = 22, H = 11; const [c, g] = canvas(W, H);
  rect(g, v ? 11 : 2, 2, 9, 7, '#3a2618'); rect(g, v ? 11 : 2, 2, 9, 2, '#5a3a24'); rect(g, v ? 11 : 2, 5, 9, 1, '#8a919c');   /* a coffer, burst */
  fillPoly(g, [[0, 11], [6, 8], [14, 8], [22, 11]], DC.goldD);
  for (let i = 0; i < 12; i++) px(g, Math.floor(hsh(i, v, 5) * 20) + 1, 8 + Math.floor(hsh(v, i, 6) * 3), i % 3 ? DC.gold : DC.goldL);
  return c;
}
const DECO = { tubeWorms: bakeTubeWorms, glowCoral: bakeGlowCoral, seaLily: bakeSeaLily, boneHeap: bakeBoneHeap, tributeSpill: bakeTributeSpill };
const DECO_ART = {};
/* a sea deco's sprite, for main.js's deco table */
export function seaDeco(kind, v) { const n = kind === 'glowCoral' ? 3 : 2; const k = kind + ((v || 0) % n); return DECO_ART[k] || (DECO_ART[k] = DECO[kind]((v || 0) % n)); }

function deepLook() {
  return { id: 'deep', wall: bakeTrenchWall(), whale: bakeWhale(), hoard: bakeHoard(), murk: { back: canvas(320, 1)[0], front: canvas(320, 1)[0] },
    whaleAt: { x: 58 * TS, y: 172 * TS } };
}
function deepFar(g, cx, cy, VW, VH, time) {
  const midY = cy + VH / 2;
  // THE WALLS OF THE TRENCH, at a third of the speed of the world, fading out where the trench opens on to his castle's yard
  const k = Math.max(0, Math.min(1, (150 * TS - (cx + VW / 2)) / (30 * TS))) * 0.55 + 0.45, w = S.wall;
  if (midY > 30 * TS) {
    g.globalAlpha = k * Math.min(1, (midY - 30 * TS) / (8 * TS));
    const ox = -((cx * 0.35) % w.width + w.width) % w.width, oy = -((cy * 0.35) % w.height + w.height) % w.height;
    for (let x = ox; x < VW; x += w.width) for (let y = oy; y < VH; y += w.height) g.drawImage(w, Math.round(x), Math.round(y));
    g.globalCompositeOperation = 'lighter';
    for (const l of w.lights) { const a = (0.5 + 0.5 * Math.sin(time * 0.9 + l.ph)) * 0.5 * k;
      for (let x = ox; x < VW; x += w.width) for (let y = oy; y < VH; y += w.height) { const sx = Math.round(x + l.x), sy = Math.round(y + l.y); if (sx < -12 || sx > VW + 12 || sy < -12 || sy > VH + 12) continue;
        g.globalAlpha = a * 0.8; g.drawImage(glowOf(l.col, 16), sx - 16, sy - 16); g.globalAlpha = Math.min(1, a * 1.8); g.fillStyle = 'rgb(' + l.col + ')'; g.fillRect(sx, sy, 1, 1); g.fillRect(sx + 2, sy - 1, 1, 1); g.fillRect(sx - 2, sy + 2, 1, 1); } }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // AND THE GOLD: the deeper you are, the more of the far ledges have the tribute lying on them, glinting
    const gk = Math.max(0, Math.min(1, (midY / TS - 120) / 50));
    if (gk > 0) for (let n = 0; n < w.ledges.length; n++) { const l = w.ledges[n]; if (hsh(n, 7, 31) > gk * 0.8) continue;
      for (let x = ox; x < VW; x += w.width) for (let y = oy; y < VH; y += w.height) { const sx = Math.round(x + l.x - 18), sy = Math.round(y + l.y - 10); if (sx > VW || sx < -36 || sy > VH || sy < -10) continue;
        g.globalAlpha = 0.8 * k; g.drawImage(S.hoard, sx, sy);
        const t = (time * 0.7 + hsh(n, 3, 32) * 4) % 4; if (t < 0.5) { g.globalAlpha = Math.sin(t / 0.5 * Math.PI); const gx = sx + 8 + Math.floor(hsh(n, 4, 33) * 20), gy = sy + 4; g.fillStyle = '#fff3bc'; g.fillRect(gx - 2, gy, 5, 1); g.fillRect(gx, gy - 2, 1, 5); } } }
    g.globalAlpha = 1;
  }
  // THE WHALE, hung in the black of the drop, moving a little slower than the world does
  { const wh = S.whale, f = 0.85, sx = Math.round(S.whaleAt.x - wh.width / 2 - (cx + VW / 2) * f + VW / 2 - S.whaleAt.x * (1 - f)), sy = Math.round(S.whaleAt.y - wh.height / 2 - (cy + VH / 2) * f + VH / 2 - S.whaleAt.y * (1 - f));
    if (sx < VW && sx + wh.width > 0 && sy < VH && sy + wh.height > 0) {
      g.drawImage(wh, sx, sy);
      g.globalCompositeOperation = 'lighter';
      for (const l of wh.lights) { const a = 0.35 + 0.3 * Math.sin(time * 0.7 + l.ph); g.globalAlpha = a; g.drawImage(glowOf(l.col, 14), sx + l.x - 14, sy + l.y - 14); g.globalAlpha = 1; g.fillStyle = 'rgb(' + l.col + ')'; g.fillRect(sx + l.x, sy + l.y, 1, 1); }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } }
}
/* MARINE SNOW: a pale fleck in most cells of a 40-pixel grid of the world, each falling through its own cell and fading at both
   ends of it, so nothing pops; and the DRIFTING LIGHTS, thicker the deeper you are */
function deepBack(g, cx, cy, VW, VH, time) {
  const C = 40, x0 = Math.floor(cx / C), y0 = Math.floor(cy / C);
  g.fillStyle = '#c8dce0';
  for (let cy2 = y0; cy2 <= y0 + Math.ceil(VH / C); cy2++) for (let cx2 = x0; cx2 <= x0 + Math.ceil(VW / C); cx2++) {
    const h = hsh(cx2, cy2, 11); if (h > 0.7) continue;
    const fall = 5 + h * 9, t = ((hsh(cy2, cx2, 12) * C + time * fall) % C) / C;
    const wx = cx2 * C + hsh(cx2, cy2, 13) * C + Math.sin(time * 0.6 + h * 20) * 3, wy = cy2 * C + t * C;
    if (!inSwim(wx, wy)) continue;
    g.globalAlpha = (0.25 + 0.35 * hsh(cx2, cy2, 14)) * Math.sin(t * Math.PI);
    g.fillRect(Math.round(wx - cx), Math.round(wy - cy), h < 0.12 ? 2 : 1, 1);
  }
  g.globalAlpha = 1;
  const M = 56, mx0 = Math.floor(cx / M) - 1, my0 = Math.floor(cy / M) - 1;
  g.globalCompositeOperation = 'lighter';
  for (let my = my0; my <= my0 + Math.ceil(VH / M) + 2; my++) for (let mx = mx0; mx <= mx0 + Math.ceil(VW / M) + 2; mx++) {
    const row = my * M / TS, p = Math.max(0.12, Math.min(0.85, (row - 40) / 110)), h = hsh(mx, my, 21), r = row > 150 ? 22 : 14; if (h > p) continue;
    const wx = mx * M + hsh(mx, my, 22) * M + Math.sin(time * 0.25 + h * 40) * 14, wy = my * M + hsh(mx, my, 23) * M + Math.cos(time * 0.19 + h * 30) * 10;
    if (!inSwim(wx, wy)) continue;
    const sx = Math.round(wx - cx), sy = Math.round(wy - cy); if (sx < -r || sx > VW + r || sy < -r || sy > VH + r) continue;
    const col = BIO[Math.floor(hsh(mx, my, 24) * 4)], a = 0.45 + 0.55 * Math.sin(time * (0.8 + h * 2) + h * 50);
    g.globalAlpha = Math.max(0, a) * 0.6; g.drawImage(glowOf(col, r), sx - r, sy - r);
    g.globalAlpha = Math.max(0.2, a); g.fillStyle = 'rgb(' + col + ')'; g.fillRect(sx, sy, 1, 1); if (h < p * 0.4) g.fillRect(sx + 1, sy, 1, 1);
  }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
}

// ============================================================================================
// THE HOOKS main.js calls
// ============================================================================================
const LOOKS = { deep: deepLook };
/* at load: what this level looks like, and anything main.js has to swap for it (a parallax layer this level paints itself) */
export function seaLoad(id, lv) {
  L = lv; S = LOOKS[id] ? LOOKS[id]() : null;
  return S ? { mid: S.mid || null, murk: S.murk || null } : null;
}
export function seaFar(g, cx, cy, VW, VH, time) { if (!S) return; if (S.id === 'deep') deepFar(g, cx, cy, VW, VH, time); }
export function seaBack(g, cx, cy, VW, VH, time) { if (!S) return; if (S.id === 'deep') deepBack(g, cx, cy, VW, VH, time); }
/* THE DEEP'S OWN LIGHT ON WHAT SWIMS IN IT: the line round a creature is the glow's colour and stronger, and the body carries
   a sheen of it, because at the bottom of the trench the only light on anything is what the water makes */
/* the ring itself: the silhouette grown by a pixel each way, in one colour, with the body cut back out of it. Kept on the frame's canvas */
export function seaRing(c, col) { const k = '__ring' + col; if (c[k]) return c[k];
  const w = whiten(c, col), [r, g] = canvas(c.width, c.height); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1]]) g.drawImage(w, ox, oy);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-over'; return (c[k] = r); }
export function seaRim() { return S && S.id === 'deep' ? { line: '#8ff4e6', lineA: 0.95, sheen: '#9fe8e0', sheenA: 0.14 } : null; }
