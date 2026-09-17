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
const shadeHex = (h, k) => { const n = parseInt(h.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); };
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
  return { id: 'deep', far: deepFar, back: deepBack, wall: bakeTrenchWall(), whale: bakeWhale(), hoard: bakeHoard(), murk: { back: canvas(320, 1)[0], front: canvas(320, 1)[0] },
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
// THE REEF — THE SHALLOWS WITH THE SUN IN THEM. The storm is over the top of it, but under the water the light still comes down
// in shafts from wherever the surface is (the tide's line, or the hollows in the shelf's roof where the air has gathered), it
// runs in bright ripples over every floor the water covers, the coral is the colour coral is, and behind the whole of the
// shelf a GALLEON lies on her side, the biggest ship that ever came to the reef: you swim the length of her.
// ============================================================================================
const RC = { hull: '#4a4232', hullL: '#62583f', hullD: '#2e2a22', rib: '#3a3428', gun: '#1c1a16', gild: '#a88a3a', sail: '#8a8a7a', sailD: '#6a6a5c', cor: ['#ff7a8a', '#ffb050', '#e070d0', '#ffd860', '#70d0c0'] };
/* THE GALLEON, 620x200, lying heeled over to the right on the reef: three decks of gunports, her stern castle with its windows at
   the left, her broken foremast lying out to the right, the bottom of her stove in so her ribs show, weed and coral all over */
function bakeGalleon() {
  const W = 620, H = 200; const [c, g] = canvas(W, H);
  const keel = x => 150 + Math.sin(x / W * Math.PI) * -26 + x * 0.04;   /* the line of her lower hull */
  const rail = x => 38 + Math.sin(x / W * Math.PI) * -6 + x * 0.1;
  for (let x = 20; x < W - 30; x++) { const top = Math.round(rail(x) + (x < 150 ? -(150 - x) * 0.32 : 0)), bot = Math.round(keel(x));
    rect(g, x, top, 1, bot - top, (Math.floor((x + 3) / 9) % 2) ? RC.hull : RC.hullD);
    for (let y = top + 4; y < bot; y += 11) px(g, x, y, RC.hullD);   /* the strakes */
    px(g, x, top, RC.hullL); px(g, x, top + 1, RC.hullL); }
  // the stern castle, its gallery windows lit by nothing, and the gilding still on it
  fillPoly(g, [[18, 20], [70, 8], [150, 26], [150, 60], [20, 60]], RC.hull);
  for (let k = 0; k < 4; k++) { rect(g, 34 + k * 24, 26 - k * 3, 12, 14, RC.gun); rect(g, 34 + k * 24, 26 - k * 3, 12, 2, RC.gild); }
  rect(g, 20, 58, 130, 3, RC.gild);
  // three rows of gunports, some with their lids hanging
  for (let row = 0; row < 3; row++) for (let x = 170 + row * 14; x < W - 70; x += 34) { const y = Math.round(rail(x) + 24 + row * 30);
    rect(g, x, y, 10, 8, RC.gun); if ((x + row) % 3 === 0) { rect(g, x - 1, y + 8, 12, 3, RC.hullL); } }
  // her bottom stove in: the ribs through the hole
  fillPoly(g, [[300, 150], [360, 118], [430, 126], [470, 156], [380, 172]], '#141c1c');
  for (let x = 316; x < 462; x += 12) line(g, x, 170 - Math.abs(x - 385) * 0.2, x + 6, 124 + Math.abs(x - 390) * 0.12, RC.rib, 3);
  // the foremast, broken and lying out along the reef, a rag of sail on it
  line(g, 440, 46, 612, 176, RC.hullD, 5); line(g, 440, 44, 612, 174, RC.hullL, 1);
  fillPoly(g, [[500, 96], [540, 112], [520, 150], [494, 128]], RC.sail); fillPoly(g, [[510, 132], [520, 150], [498, 136]], RC.sailD);
  line(g, 250, 36, 196, -40, RC.hullD, 4);   /* the mainmast stump, standing out of her at the angle she lies */
  // weed and coral all over her
  for (let i = 0; i < 90; i++) { const x = 24 + Math.floor(hsh(i, 1, 71) * (W - 60)), y = Math.round(rail(x) + hsh(i, 2, 72) * (keel(x) - rail(x)));
    if (hsh(i, 3, 73) < 0.5) { rect(g, x, y, 2, 2, RC.cor[i % 5]); px(g, x + 1, y - 1, RC.cor[(i + 2) % 5]); } else { px(g, x, y, '#4e7a3a'); px(g, x, y - 1, '#4e7a3a'); px(g, x + 1, y - 2, '#6e9a48'); } }
  return c;
}
/* THE CAUSTICS: a strip of rippling light 64 wide, four frames, laid on the top of every floor the water covers */
function bakeCaustics() {
  return [0, 1, 2, 3].map(f => { const [c, g] = canvas(64, 6);
    for (let x = 0; x < 64; x++) { const v = Math.sin(x * 0.4 + f * 1.57) + Math.sin(x * 0.23 - f * 1.1 + 1) + Math.sin(x * 0.71 + f * 0.8 + 2);
      if (v > 1.2) { px(g, x, 0, '#dffaf0'); px(g, x, 1, '#9fe0d8'); } else if (v > 0.6) px(g, x, 1, '#7fc8c0');
      if (Math.sin(x * 0.3 + f * 1.57 + 3) + Math.sin(x * 0.53 - f) > 1.3) px(g, x, 3, '#6fb8b0'); }
    return c; });
}
/* A SHAFT OF SUN, as a column of fading light baked once and stretched and leaned where it falls */
function bakeShaft() { const [c, g] = canvas(8, 128); const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(236,250,220,0.9)'); gr.addColorStop(0.5, 'rgba(190,236,220,0.35)'); gr.addColorStop(1, 'rgba(160,220,210,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 8, 128); const e = g.createLinearGradient(0, 0, 8, 0); e.addColorStop(0, 'rgba(0,0,0,1)'); e.addColorStop(0.3, 'rgba(0,0,0,0)'); e.addColorStop(0.7, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = e; g.fillRect(0, 0, 8, 128); return c; }
/* CORAL IN ITS COLOURS: a branching head, a fan, a tube sponge, an anemone; stood on the floors under the water */
function bakeReefCoral(v) {
  const [c, g] = canvas(14, 14); const col = RC.cor[v % 5], dark = shadeHex(col, -0.4), lit = shadeHex(col, 0.4), k = v % 4;
  if (k === 0) { for (const [x0, a] of [[7, -1.57], [6, -2.2], [8, -0.9], [5, -2.6], [9, -0.5]]) { let x = x0, y = 13; for (let i = 0; i < 5; i++) { px(g, Math.round(x), Math.round(y), i < 2 ? dark : col); x += Math.cos(a) * 1.3; y += Math.sin(a) * 1.8; } px(g, Math.round(x), Math.round(y), lit); } }
  else if (k === 1) { fillPoly(g, [[7, 13], [1, 5], [3, 2], [7, 1], [11, 2], [13, 5]], col); for (let x = 3; x < 12; x += 2) line(g, 7, 13, x, 3, dark); px(g, 7, 1, lit); }
  else if (k === 2) { for (const [x, h] of [[4, 9], [7, 12], [10, 7]]) { rect(g, x, 14 - h, 3, h, col); rect(g, x, 14 - h, 1, h, lit); rect(g, x + 1, 14 - h, 1, 1, dark); } }
  else { ellipse(g, 7, 12, 4, 2, dark); for (let i = 0; i < 7; i++) line(g, 7, 11, 2 + i * 1.7, 5 + (i % 2) * 2, i % 2 ? col : lit); }
  return c;
}
function reefLook() {
  const S0 = { id: 'reef', far: reefFar, back: reefBack, wet: reefWet, galleon: bakeGalleon(), caus: bakeCaustics(), shaft: bakeShaft(), coral: [0, 1, 2, 3, 4, 5, 6, 7].map(bakeReefCoral), galleonAt: { x: 272 * TS, y: 37 * TS }, corals: [], shafts: [] };
  // coral on the floors under the water: one in five of them, hashed off the tile
  for (let tx = 13; tx < L.W - 1; tx++) for (let ty = 2; ty < L.H - 1; ty++) {
    if (tileAt(tx, ty) !== 0 || !SOLIDT.has(tileAt(tx, ty + 1)) || !inSwim(tx * TS + 8, ty * TS + 12)) continue;
    const onBed = ty >= 30 || (tx > 212 && tx < 331);   /* the reef bed and the shelf, not a deck of the carrack that the tide covers */
    if (onBed && hsh(tx, ty, 81) < 0.34) S0.corals.push({ x: tx * TS + 1 + Math.floor(hsh(tx, ty, 82) * 4), y: (ty + 1) * TS - 14, v: Math.floor(hsh(tx, ty, 83) * 8), ph: hsh(tx, ty, 84) * 6 });
    if (onBed && hsh(tx, ty, 85) < 0.2) S0.corals.push({ x: tx * TS + 8 + Math.floor(hsh(tx, ty, 86) * 5), y: (ty + 1) * TS - 14, v: Math.floor(hsh(tx, ty, 87) * 8), ph: hsh(tx, ty, 88) * 6 });
  }
  // shafts: every so often along the tideway and the carrack, down from wherever the water's top is; and on the shelf from the hollows in its roof
  for (let tx = 14; tx < 210; tx += 5) if (hsh(tx, 1, 89) < 0.5) S0.shafts.push({ x: tx * TS + Math.floor(hsh(tx, 2, 90) * 60), w: 10 + Math.floor(hsh(tx, 3, 91) * 16), ph: hsh(tx, 4, 92) * 6, roof: null });
  for (const [x0, x1, y0] of (L.deep && L.deep.pockets) || []) if (x0 > 212 && x0 < 331) S0.shafts.push({ x: (x0 + x1 + 1) / 2 * TS, w: 26, ph: x0 * 0.3, roof: (y0 + 2) * TS });
  return S0;
}
function reefFar(g, cx, cy, VW, VH, time) {
  const gl = S.galleon, f = 0.9, ax = S.galleonAt.x, ay = S.galleonAt.y;
  const sx = Math.round(ax - gl.width / 2 - cx * f - ax * (1 - f) + (VW / 2) * (1 - f)), sy = Math.round(ay - gl.height - cy * f - ay * (1 - f) + (VH / 2) * (1 - f));
  if (sx < VW && sx + gl.width > 0 && sy < VH && sy + gl.height > 0) { g.globalAlpha = 0.75; g.drawImage(gl, sx, sy); g.globalAlpha = 1; }
}
function reefBack(g, cx, cy, VW, VH, time) {
  // THE SHAFTS: a column of sun from the top of the water down, leaning with the light and breathing with the swell
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const s of S.shafts) {
    if (s.x < cx - 120 || s.x > cx + VW + 60) continue;
    let top = s.roof, bot = null;
    if (top === null) { const p = (L.pools || []).find(q => q.swim && s.x > q.x0 && s.x < q.x1); if (!p) continue; top = p.y + 2; bot = p.bottom; }
    else { const p = (L.pools || []).find(q => q.swim && s.x > q.x0 && s.x < q.x1); bot = p ? p.bottom : top + 20 * TS; }
    const h = Math.max(0, (bot || top + 200) - top); if (h < 24 || top > cy + VH || top + h < cy) continue;
    const a = (0.22 + 0.08 * Math.sin(time * 0.6 + s.ph)) * (s.roof !== null ? 0.8 : 1), lean = 0.28;
    g.globalAlpha = a; g.setTransform(s.w / 8, 0, lean, h / 128, Math.round(s.x - cx - s.w / 2 + Math.sin(time * 0.3 + s.ph) * 4), Math.round(top - cy));
    g.drawImage(S.shaft, 0, 0); g.setTransform(1, 0, 0, 1, 0, 0);
  }
  g.restore();
  // THE CORAL, and it moves a little with the water
  for (const k of S.corals) { if (k.x < cx - 16 || k.x > cx + VW || k.y < cy - 16 || k.y > cy + VH) continue;
    if (!inSwim(k.x + 6, k.y + 6)) { g.globalAlpha = 0.8; g.drawImage(S.coral[k.v], Math.round(k.x - cx), Math.round(k.y - cy)); g.globalAlpha = 1; continue; }
    const sway = Math.sin(time * 1.3 + k.ph) > 0.6 ? 1 : 0; g.drawImage(S.coral[k.v], Math.round(k.x - cx) + sway, Math.round(k.y - cy)); }
}
function reefWet(g, cx, cy, VW, VH, time) {
  // THE CORAL, BACK THROUGH THE WASH at two thirds, the way a swimmer is: the water is over it, and its colours still come through
  for (const k of S.corals) { if (k.x < cx - 16 || k.x > cx + VW || k.y < cy - 16 || k.y > cy + VH || !inSwim(k.x + 6, k.y + 6)) continue;
    g.globalAlpha = 0.62; g.drawImage(S.coral[k.v], Math.round(k.x - cx) + (Math.sin(time * 1.3 + k.ph) > 0.6 ? 1 : 0), Math.round(k.y - cy)); }
  g.globalAlpha = 1;
  // THE LIGHT ON THE FLOOR: bright ripples along the top of everything the water covers, moving
  const fr = S.caus[Math.floor(time * 5) % 4], tx0 = Math.max(0, Math.floor(cx / TS)), tx1 = Math.min(L.W - 1, Math.floor((cx + VW) / TS)), ty0 = Math.max(1, Math.floor(cy / TS)), ty1 = Math.min(L.H - 1, Math.floor((cy + VH) / TS));
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    if (!SOLIDT.has(tileAt(tx, ty)) || tileAt(tx, ty - 1) !== 0 || !inSwim(tx * TS + 8, ty * TS - 6)) continue;
    const u = ((Math.floor(tx * TS + time * 7) % 64) + 64) % 64, dark = tx > 261 && tx < 331 ? 0.5 : 1;
    g.globalAlpha = 0.5 * dark; const w = Math.min(TS, 64 - u); g.drawImage(fr, u, 0, w, 6, tx * TS - cx, ty * TS - cy + 2, w, 6); if (w < TS) g.drawImage(fr, 0, 0, TS - w, 6, tx * TS - cx + w, ty * TS - cy + 2, TS - w, 6);
  }
  g.restore();
}

// ============================================================================================
// THE LIVING WATER. Built once, configured per level (LIFE below): schools of fish that scatter when you swim through them and
// come back together behind you, crabs going about their business on the ledges, kelp that leans out of your way, jellyfish
// drifting in the far water, strings of bubbles going up a long way off, and now and then something very big going past
// behind all of it. ALL OF IT IS SCENERY: drawn behind the tiles and under the water's own wash, dimmer than any creature,
// touching nothing. The FAR bubbles are only ever far and faint and have no white core, because a bright trickle of bubbles
// is the game's word for AIR (airPlume) and must never be said by something that is not.
// ============================================================================================
const LIFE = {
  reef:      { fish: ['#ffd36b', '#8fd8ec', '#ff9a5c', '#e8f0e0'], schools: 1, kelp: ['#2e5a36', '#5e8a48'], kelpP: 0.16, crab: '#b8583a', crabP: 0.035, jelly: '255,214,236', jellyP: 0.3, shadow: 'whale', bubbles: 1 },
  deep:      { fish: ['#9fe8e0', '#c8a8ff', '#dff4fa'], schools: 0.45, kelp: ['#1e3a34', '#3e6a52'], kelpP: 0.05, crab: '#8a8e9e', crabP: 0.03, jelly: '190,160,255', jellyP: 0.22, shadow: 'leviathan', bubbles: 0.6 },
  lamplit:   { fish: ['#5e8a70', '#8a8a5e', '#6a8a88'], schools: 0.9, kelp: ['#24463a', '#4e7a58'], kelpP: 0.12, crab: '#6e7e74', crabP: 0.03, jelly: null, shadow: null, bubbles: 0.5 },
  longwater: { fish: ['#a8a870', '#c8b890', '#90a880'], schools: 1, kelp: ['#3e5a24', '#6e8a3a'], kelpP: 0.14, crab: '#b86a3a', crabP: 0.03, jelly: '230,236,255', jellyP: 0.18, jellyFromX: 330, shadow: null, bubbles: 0.5 },
  causeway:  { fish: ['#b8c0b0', '#8aa8a8', '#d8d0b0'], schools: 0.8, kelp: ['#4e4a26', '#7a7038'], kelpP: 0.12, crab: '#9a5a3a', crabP: 0.035, jelly: '220,230,236', jellyP: 0.2, shadow: 'whale', bubbles: 0.7 },
};
const SOLIDT = new Set([1, 4, 7, 8, 11, 12, 13, 15, 16, 18]);   /* what a crab can walk on and a strand can root in (T.SOLID, CRATE, PALISADE, PLANK, SHELF, PORT, CLIMB, SOFT, ICE, CRYST) */
const FISH_ART = {};
function fishArt(col) {   /* a fish 7x4 facing right: a light back, a darker belly, an eye, and two frames of its tail; each flipped */
  if (FISH_ART[col]) return FISH_ART[col];
  const lit = shadeHex(col, 0.45), dark = shadeHex(col, -0.45);
  const mk = f => { const [c, g] = canvas(7, 4); rect(g, 2, 1, 4, 2, col); rect(g, 3, 0, 2, 1, lit); rect(g, 2, 1, 3, 1, lit); rect(g, 2, 3, 3, 1, dark); px(g, 6, 2, col); px(g, 5, 1, '#1b1626');
    px(g, 1, 2, col); if (f) { px(g, 0, 1, col); px(g, 0, 3, dark); } else { px(g, 0, 2, col); px(g, 1, 1, col); } return c; };
  return (FISH_ART[col] = [mk(0), mk(1)].map(c => [c, flipX(c)]));
}
const CRAB_ART = {};
function crabArt(col) {   /* a crab 7x4 seen from the side, two frames of legs */
  if (CRAB_ART[col]) return CRAB_ART[col];
  const mk = f => { const [c, g] = canvas(7, 4); rect(g, 1, 1, 5, 2, col); px(g, 0, 0, col); px(g, 6, 0, col); px(g, 2, 0, '#e8e0d0'); px(g, 4, 0, '#e8e0d0');
    for (let k = 0; k < 3; k++) px(g, 1 + k * 2 + (f ? 1 : 0), 3, col); return c; };
  return (CRAB_ART[col] = [mk(0), mk(1)]);
}
const JELLY_ART = {};
function jellyArt(rgb) {   /* a far jelly 9x11: three frames of its bell opening and closing */
  if (JELLY_ART[rgb]) return JELLY_ART[rgb];
  const col = 'rgb(' + rgb + ')';
  return (JELLY_ART[rgb] = [0, 1, 2].map(f => { const [c, g] = canvas(9, 11); const w = 7 - f;
    rect(g, (9 - w) >> 1, 1, w, 3, col); rect(g, ((9 - w) >> 1) + 1, 0, w - 2, 1, col); g.globalAlpha = 0.6;
    for (let k = 0; k < 4; k++) { const x = 2 + k * 2 - (f === 2 ? 0 : k < 2 ? -1 + f : 1 - f); for (let y = 4; y < 9 + (k % 2) * 2; y++) if ((y + k) % 3) px(g, x, y, col); }
    g.globalAlpha = 1; return c; }));
}
const SHADOW_ART = {};
function shadowArt(kind) {   /* the thing going past, far behind: a whale, or in the trench something longer */
  if (SHADOW_ART[kind]) return SHADOW_ART[kind];
  const [c, g] = canvas(kind === 'leviathan' ? 260 : 170, 60); const W = c.width;
  if (kind === 'leviathan') { fillPoly(g, [[0, 30], [30, 16], [120, 10], [200, 18], [238, 26], [260, 10], [256, 32], [260, 52], [236, 36], [190, 42], [110, 48], [30, 44]], '#000');
    fillPoly(g, [[90, 44], [120, 58], [134, 46]], '#000'); }
  else { fillPoly(g, [[0, 30], [18, 18], [70, 12], [120, 18], [148, 28], [170, 14], [166, 32], [170, 50], [146, 36], [110, 42], [60, 46], [16, 42]], '#000');
    fillPoly(g, [[56, 44], [80, 58], [88, 44]], '#000'); }
  return (SHADOW_ART[kind] = [c, flipX(c)]);
}

function lifeLoad(id) {
  const C = LIFE[id]; if (!C) return null;
  const W = L.W, H = L.H, fish = [], kelp = [], crabs = [];
  const wet = (tx, ty) => tx >= 0 && ty >= 0 && tx < W && ty < H && tileAt(tx, ty) === 0 && inSwim(tx * TS + 8, ty * TS + 8);
  for (let tx = 1; tx < W - 1; tx++) for (let ty = 1; ty < H - 1; ty++) {
    if (!wet(tx, ty)) continue;
    const floor = SOLIDT.has(tileAt(tx, ty + 1)), h = hsh(tx, ty, 41);
    // A STRAND OF KELP on a floor under water, two to six tiles of it where the water is that deep
    if (floor && h < C.kelpP) { let room = 0; while (room < 6 && wet(tx, ty - room)) room++; if (room >= 2) kelp.push({ x: tx * TS + 3 + Math.floor(hsh(tx, ty, 42) * 10), y: (ty + 1) * TS, h: (Math.min(room, 2 + Math.floor(hsh(tx, ty, 43) * 5)) - 0.4) * TS, ph: hsh(tx, ty, 44) * 6, push: 0, tx, ty }); }
    // A CRAB on the ledge, walking its own stretch of it
    else if (floor && h > 1 - C.crabP) { let a = tx, b = tx; while (a > tx - 4 && wet(a - 1, ty) && SOLIDT.has(tileAt(a - 1, ty + 1))) a--; while (b < tx + 4 && wet(b + 1, ty) && SOLIDT.has(tileAt(b + 1, ty + 1))) b++;
      if (b > a) crabs.push({ x0: a * TS + 4, x1: (b + 1) * TS - 11, y: (ty + 1) * TS - 4, ph: hsh(tx, ty, 45) * 20, sp: 6 + hsh(tx, ty, 46) * 8, col: C.crab, tx, ty }); }
    // A SCHOOL, where there is water round it: on a coarse grid of the world so two never start on top of each other
    if (tx % 9 === 4 && ty % 3 === 1 && hsh(tx, ty, 47) < 0.2 * C.schools && wet(tx - 2, ty) && wet(tx + 2, ty) && wet(tx, ty - 1) && wet(tx, ty + 1)) {
      let a = tx, b = tx; while (a > tx - 6 && wet(a - 1, ty)) a--; while (b < tx + 6 && wet(b + 1, ty)) b++;
      const n = 5 + Math.floor(hsh(tx, ty, 48) * 7), col = C.fish[Math.floor(hsh(tx, ty, 49) * C.fish.length)];
      const sc = { hx: (a + b + 1) / 2 * TS, hy: ty * TS + 8, R: Math.max(0, Math.min(44, (b - a + 1) * TS / 2 - 18)), ph: hsh(tx, ty, 53) * 6, fx: 0, fy: 0, fear: 0, members: [] };
      for (let i = 0; i < n; i++) sc.members.push({ ox: (hsh(i, tx, 50) - 0.5) * 22, oy: (hsh(ty, i, 51) - 0.5) * 10, col, ph: hsh(tx + i, ty, 52) * 6 });
      fish.push(sc);
    }
  }
  const bucket = (list, xOf) => { const m = new Map(); for (const it of list) { const k = Math.floor(xOf(it) / 256); if (!m.has(k)) m.set(k, []); m.get(k).push(it); } return m; };
  return { C, fish, kelp: bucket(kelp, k => k.x), crabs: bucket(crabs, c => c.x0), t: null, counts: { schools: fish.length, fish: fish.reduce((s, q) => s + q.members.length, 0), kelp: kelp.length, crabs: crabs.length } };
}
const inView = (m, cx, VW, fn) => { for (let k = Math.floor((cx - 96) / 256); k <= Math.floor((cx + VW + 96) / 256); k++) { const a = m.get(k); if (a) for (const it of a) fn(it); } };

/* THE FAR LIFE, drawn with the far water: jellies at half the world's speed, bubble strings at six tenths, and the shadow */
function lifeFar(g, cx, cy, VW, VH, time) {
  const F = S.life, C = F.C;
  if (C.jelly) { const f = 0.5, cell = 110, fx0 = cx * f, fy0 = cy * f, art = jellyArt(C.jelly);
    for (let j = Math.floor(fy0 / cell) - 1; j <= Math.floor((fy0 + VH) / cell) + 1; j++) for (let i = Math.floor(fx0 / cell) - 1; i <= Math.floor((fx0 + VW) / cell) + 1; i++) {
      const h = hsh(i, j, 61); if (h > C.jellyP) continue;
      const sx = Math.round(i * cell + hsh(i, j, 62) * cell + Math.sin(time * 0.2 + h * 30) * 16 - fx0), sy = Math.round(j * cell + hsh(i, j, 63) * cell - ((time * (3 + h * 4)) % 40) + Math.sin(time * 0.5 + h * 9) * 3 - fy0);
      if (sx < -10 || sx > VW || sy < -12 || sy > VH) continue;
      if (C.jellyFromX && sx + cx < C.jellyFromX * TS) continue;   /* only once the river is the sea */
      if (!inSwim(sx + cx, sy + cy)) continue;
      g.globalAlpha = 0.28 + 0.12 * Math.sin(time + h * 20); g.drawImage(art[Math.floor(time * 2 + h * 9) % 3], sx, sy); }
    g.globalAlpha = 1; }
  if (C.bubbles) { const f = 0.6, cell = 150, fx0 = cx * f;
    g.fillStyle = '#bfe0e8';
    for (let i = Math.floor(fx0 / cell) - 1; i <= Math.floor((fx0 + VW) / cell) + 1; i++) { const h = hsh(i, 3, 64); if (h > 0.45 * C.bubbles) continue;
      const sx = Math.round(i * cell + hsh(i, 4, 65) * cell - fx0), base = VH - 10 - Math.floor(hsh(i, 5, 66) * 40);
      for (let k = 0; k < 7; k++) { const t = (time * (0.18 + h * 0.2) + k / 7) % 1, by = Math.round(base - t * 110), bx = sx + Math.round(Math.sin(t * 8 + k + h * 9) * 2);
        if (!inSwim(bx + cx, by + cy)) continue; g.globalAlpha = 0.22 * (1 - t); g.fillRect(bx, by, 1, 1); } }
    g.globalAlpha = 1; }
  // SOMETHING BIG, now and then: once a minute and a bit, for twenty seconds, far off and slower than anything, only where the view is sea
  if (C.shadow) { const per = 70, t = (time + 23) % per; if (t < 22) {
    const [a0, a1] = shadowArt(C.shadow), dir = Math.floor((time + 23) / per) % 2 ? -1 : 1, k = t / 22, w = a0.width;
    const sx = Math.round(dir > 0 ? -w + k * (VW + w) : VW - k * (VW + w)), sy = Math.round(VH * 0.28 + Math.sin(k * 3) * 10);
    let wetN = 0; for (const [px2, py2] of [[0.2, 0.3], [0.5, 0.3], [0.8, 0.3], [0.3, 0.6], [0.7, 0.6]]) if (inSwim(cx + VW * px2, cy + VH * py2)) wetN++;
    if (wetN >= 4) { g.globalAlpha = 0.09 * Math.sin(k * Math.PI) * (wetN / 5); g.drawImage(dir > 0 ? a1 : a0, sx, sy); g.globalAlpha = 1; } } }
}

/* THE NEAR LIFE, behind the tiles: the kelp and the crabs, and the schools, which are the only things here with any memory */
function lifeBack(g, cx, cy, VW, VH, time, hero) {
  const F = S.life, C = F.C, dt = F.t === null ? 0 : Math.max(0, Math.min(0.1, time - F.t)); F.t = time;
  const hx = hero ? hero.x : -1e9, hy = hero ? hero.y - 10 : -1e9;
  // KELP, leaning away from you as you go past and swinging back after
  inView(F.kelp, cx, VW, k => {
    if (k.y - k.h > cy + VH || k.y < cy) return;
    const wetNow = inSwim(k.x, k.y - 6), d = Math.abs(hx - k.x), near = d < 30 && hy > k.y - k.h - 16 && hy < k.y + 8;
    k.push += ((near ? Math.sign(k.x - hx || 1) * 11 * (1 - d / 30) : 0) - k.push) * Math.min(1, dt * (near ? 6 : 1.6));
    const n = Math.max(3, Math.round(k.h / 5)), hgt = wetNow ? k.h : k.h * 0.35;
    let lx = k.x - cx, ly = k.y - cy;
    for (let i = 1; i <= n; i++) { const t = i / n, nx = k.x + (wetNow ? Math.sin(time * 1.1 + k.ph + t * 3) * 4 * t * t : 4 * t) + k.push * t * t - cx, ny = k.y - hgt * t - cy;
      g.fillStyle = C.kelp[0]; g.fillRect(Math.round(nx) - 1, Math.round(ny), 2, Math.ceil(ly - ny) + 1);
      if (i % 2 === 0 && i < n) { g.fillStyle = C.kelp[1]; const s = (i >> 1) % 2 ? 1 : -1; g.fillRect(Math.round(nx) + (s > 0 ? 1 : -4), Math.round(ny) + 1, 3, 1); }
      lx = nx; ly = ny; }
  });
  // CRABS, along their ledges and stopping to think about it
  inView(F.crabs, cx, VW, c => {
    if (c.y < cy - 8 || c.y > cy + VH) return;
    const span = c.x1 - c.x0, u = (time * c.sp / Math.max(8, span) + c.ph) % 4, walk = u < 1 || (u >= 2 && u < 3), pos = u < 1 ? u : u < 2 ? 1 : u < 3 ? 3 - u : 0;
    const x = Math.round(c.x0 + pos * span - cx), y = Math.round(c.y - cy); if (x < -8 || x > VW) return;
    g.globalAlpha = 0.75; g.drawImage(crabArt(c.col)[walk ? Math.floor(time * 8) % 2 : 0], x, y); g.globalAlpha = 1;
  });
  // THE SCHOOLS: a school swims a slow loop of the water round its home, every fish holding its place in it, and when you come
  // through it they all break away from you, spread out, and drift back together behind you. Where the school is, is a
  // function of time; only the scare is remembered, so it looks the same however often it is drawn.
  for (const sc of F.fish) {
    if (sc.hx < cx - 160 || sc.hx > cx + VW + 160 || sc.hy < cy - 100 || sc.hy > cy + VH + 100) continue;
    const t = time * 0.35 + sc.ph, bx = sc.hx + Math.cos(t) * sc.R, by = sc.hy + Math.sin(t * 1.7) * 5, dirX = -Math.sin(t) * sc.R;
    if (dt > 0) {
      const dx = bx + sc.fx - hx, dy = by + sc.fy - hy, d = Math.hypot(dx, dy), scared = d < 56;
      sc.fear = scared ? 1 : Math.max(0, sc.fear - dt * 0.5);
      const tx = scared ? (dx / (d || 1)) * 64 : 0, ty = scared ? (dy / (d || 1)) * 24 : 0;
      sc.fx += (tx - sc.fx) * Math.min(1, dt * (scared ? 5 : 0.7)); sc.fy += (ty - sc.fy) * Math.min(1, dt * (scared ? 5 : 0.7));
    }
    const spread = 1 + sc.fear * 1.6, face = sc.fear > 0.4 ? Math.sign(sc.fx || 1) : Math.sign(dirX || 1);
    for (const f of sc.members) {
      const x = bx + sc.fx + f.ox * spread + Math.sin(time * 2 + f.ph) * 2, y = by + sc.fy + f.oy * spread + Math.cos(time * 1.6 + f.ph) * 1.5;
      const sx = Math.round(x - cx), sy = Math.round(y - cy); if (sx < -6 || sx > VW || sy < -4 || sy > VH) continue;
      if (!inSwim(x, y) || tileAt(Math.floor(x / TS), Math.floor(y / TS)) !== 0) continue;
      const fr = fishArt(f.col)[Math.floor(time * (sc.fear > 0.3 ? 16 : 6) + f.ph * 3) % 2];
      g.globalAlpha = 0.9; g.drawImage(face < 0 ? fr[1] : fr[0], sx - 3, sy - 2); }
    g.globalAlpha = 1;
  }
}

// ============================================================================================
// THE HOOKS main.js calls
// ============================================================================================
const LOOKS = { deep: deepLook, reef: reefLook };
/* at load: what this level looks like, and anything main.js has to swap for it (a parallax layer or, in a dark level, the murk) */
export function seaLoad(id, lv) {
  L = lv; S = LOOKS[id] ? LOOKS[id]() : LIFE[id] ? { id } : null;
  if (S) S.life = lifeLoad(id);
  return S ? { mid: S.mid || null, murk: S.murk || null } : null;
}
export function seaFar(g, cx, cy, VW, VH, time) { if (!S || globalThis.__noSea) return; if (S.far) S.far(g, cx, cy, VW, VH, time); if (S.life) lifeFar(g, cx, cy, VW, VH, time); }
export function seaBack(g, cx, cy, VW, VH, time, hero) { if (!S || globalThis.__noSea) return; if (S.back) S.back(g, cx, cy, VW, VH, time); if (S.life) lifeBack(g, cx, cy, VW, VH, time, hero); }
export function seaOver(g, cx, cy, VW, VH, time) { if (!S || globalThis.__noSea) return; S.cam = [cx, cy, VW, VH, time]; if (S.over) S.over(g, cx, cy, VW, VH, time); }
/* AFTER THE WATER'S WASH (drawSwimmers calls it first): what has to read through the water, put back over it, in this frame's camera */
export function seaWet(g) { if (!S || globalThis.__noSea || !S.cam || !S.wet) return; const [cx, cy, VW, VH, time] = S.cam; S.wet(g, cx, cy, VW, VH, time); S.cam = null; }
/* what the living water has in it, for a harness (seaLife(true) is all of it). globalThis.__noSea = true draws a frame without any of this, for a before-and-after by the pixels */
export function seaLife(all) { return S && S.life ? (all ? S.life : S.life.counts) : null; }
/* THE RING round a swimmer: the silhouette grown by a pixel each way, in one colour, with the body cut back out of it, so a lit
   edge can be drawn at full strength without washing the body's own colours out. Kept on the frame's canvas. */
export function seaRing(c, col) { const k = '__ring' + col; if (c[k]) return c[k];
  const w = whiten(c, col), [r, g] = canvas(c.width, c.height); for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1]]) g.drawImage(w, ox, oy);
  g.globalCompositeOperation = 'destination-out'; g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-over'; return (c[k] = r); }
/* THE DEEP'S OWN LIGHT ON WHAT SWIMS IN IT: the ring round a creature is the glow's colour, and its body a breath of it, because at
   the bottom of the trench the only light on anything is what the water makes */
export function seaRim() { return S && S.id === 'deep' ? { line: '#8ff4e6', lineA: 0.95, sheen: '#9fe8e0', sheenA: 0.14 } : null; }
