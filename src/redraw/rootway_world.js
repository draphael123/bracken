// rootway_world.js - THE ROOTWAY's WORLD ART (claude/rootway art pass). Art only: nothing here is a tile, an entity, a hitbox or a number - it is read OFF the built level
// (L.grid, L.hoists, L.decor, the rockfall props) and drawn from src/rootway-hands.js drawWorld and src/main.js's hooks, so the level hash, the routes and the marks do not move.
//   THE HOISTS   the goblins' machines, drawn as machines: a PULLEY BLOCK hung from a LIMB that drops out of the canopy, a twisted ROPE, a carved horn CLEAT with the rope wound on it
//                (the glint ring kept: a cleat an arrow must cut glints gold), the LASHED SPAN of logs, the CAGE of bound bars with its trophy skull, a RAISED CLEAT POST where the cleat stands in
//                the open (the Huntmaster's perches, the high cleat, the lookout's)
//   THE FURNITURE the larder's drying beam (hung from a bough on ropes, skulls and hides and two lanterns), the lookout's thatched hut, the gold-fletched arrows in the roots, the loft door
//   THE GROWCAP  the buds and the caps are CAP FLESH: warm amber flesh (rose in the dark cellar), cream gills, a fibrous stalk flaring into root fingers
//   THE CHASMS   the exam's floorless gaps are a MIST that thickens into a dark with no bottom, wisps drifting, leaves falling - never the floored teach wells
//   SPORE DROPS  a hanging root-clump over every rockfall, a spore pod that swells on its told beat
//   SUPPORTS     every ledge is held: a socketed bracket where it is let into the root wall, a lashed root post that runs down to a floor, or a rope to a peg (tools/rootway-aloft.mjs)
//   DRESSING     leaf litter, root knees, bones, hide racks, lantern posts, hanging root hair - read off the grid, nothing sprinkled on a tile that is not a floor
// planRoot(L, T) -> { chasms, supports, items, lights, drops, cleats, pulleys }  (cached on the level)
import { canvas, rect, px, outline, mulberry } from '../px.js';
import { ZONE, zoneOf, hash, timberTile } from './rootway_tiles.js';

const TS = 16, OUTC = '#1c1214';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const P = (g, x, y, c) => px(g, x, y, c);
const ell = (g, cx, cy, rx, ry, col) => { for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1)))); rect(g, cx - hw, cy + dy, hw * 2 + 1, 1, col); } };
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };
const C = { barkD: '#3a2618', bark: '#5a3c26', barkM: '#7a5434', barkL: '#a07448', barkH: '#c89a5c', cord: '#cdb88a', cordD: '#8a7648', bone: '#e8dcc0', boneD: '#b8a888', red: '#b8403a', redD: '#7a2420', redL: '#e8685a',
  iron: '#3a3438', ironL: '#8a8490', gold: '#ffd36b', goldL: '#fff6c8', hide: '#8a6a48', hideD: '#5a4230' };

/* ----------------------------------------------------------------- THE SPRITES ----------------------------------------------------------------- */
const SPR = {
  /* THE WARNING POST: bone and red bands up a bark post, a skull on top with a red rag streaming, the goblins' mark at the lip of THE FALL */
  warnPost(v) { const [c, g] = canvas(14, 32);
    rect(g, 5, 8, 4, 24, C.bark); rect(g, 5, 8, 1, 24, C.barkL); rect(g, 8, 8, 1, 24, C.barkD);
    for (const y of [11, 17, 23]) { rect(g, 5, y, 4, 3, C.bone); rect(g, 5, y, 4, 1, '#fff6e0'); rect(g, 5, y + 2, 4, 1, C.boneD); rect(g, 5, y + 1, 4, 1, C.red); }
    ell(g, 7, 5, 4, 3, C.bone); rect(g, 4, 5, 7, 2, C.bone); P(g, 5, 4, '#2a1a12'); P(g, 5, 5, '#2a1a12'); P(g, 9, 4, '#2a1a12'); P(g, 9, 5, '#2a1a12'); rect(g, 6, 7, 3, 1, C.boneD); P(g, 7, 7, '#2a1a12');   /* the skull */
    for (let k = 0; k < 5; k++) { rect(g, 9 + k, 9 + (k >> 1), 1, 3, k & 1 ? C.red : C.redL); } rect(g, 9, 9, 5, 1, C.redD);   /* the red rag */
    rect(g, 4, 12, 1, 2, C.cord); rect(g, 3, 14, 3, 1, C.bone); P(g, 3, 13, C.bone);   /* a bone hung on a cord */
    rect(g, 3, 30, 8, 2, C.barkD); rect(g, 3, 30, 8, 1, C.barkM);
    if (v & 1) { rect(g, 1, 0, 1, 8, C.barkD); rect(g, 1, 0, 4, 1, C.barkD); rect(g, 2, 1, 2, 3, '#ffcf6a'); rect(g, 2, 1, 2, 1, '#fff2b0'); }   /* a lantern on a hook, lit */
    return outline(c, OUTC); },
  /* a goblin pennant: a bone-topped pole, a tattered red-and-hide pennant */
  gobPennant(v) { const [c, g] = canvas(22, 30); rect(g, 3, 4, 2, 26, C.bark); rect(g, 3, 4, 1, 26, C.barkL); rect(g, 2, 1, 4, 3, C.bone); P(g, 3, 1, '#fff6e0'); rect(g, 1, 29, 6, 1, C.barkD);
    const pc = [[C.red, C.redD], ['#c8883a', '#7a5226'], [C.red, C.redD], [C.hide, C.hideD]][v & 3];
    for (let x = 0; x < 15; x++) { const h = Math.max(2, 9 - (x >> 1) - ((x * 5 + v) % 3 === 0 ? 1 : 0)), y0 = 5 + (x > 9 ? 1 : 0) + ((x * 7) % 4 === 0 ? 1 : 0); rect(g, 5 + x, y0, 1, h, x % 5 === 4 ? pc[1] : pc[0]); P(g, 5 + x, y0, mix(pc[0], '#ffffff', 0.25)); }
    rect(g, 6, 8, 3, 2, C.bone); P(g, 6, 8, '#fff6e0'); P(g, 7, 9, C.barkD); P(g, 8, 9, C.barkD);   /* a bone sigil stitched on */
    return outline(c, OUTC); },
  /* the trophy rack: two bark posts, a crossbeam, skulls and hides hung from it on cords */
  trophyRack(v) { const [c, g] = canvas(30, 26); for (const x of [2, 25]) { rect(g, x, 2, 3, 24, C.bark); rect(g, x, 2, 1, 24, C.barkL); rect(g, x - 1, 24, 5, 2, C.barkD); }
    rect(g, 0, 3, 30, 3, C.barkM); rect(g, 0, 3, 30, 1, C.barkH); rect(g, 0, 5, 30, 1, C.barkD); rect(g, 7, 3, 2, 3, C.cord); rect(g, 19, 3, 2, 3, C.cord);
    for (const [x, kind] of [[8, 0], [14, 1], [20, 0]]) { rect(g, x + 1, 6, 1, 3 + (kind ? 2 : 0), C.cord); if (kind === 0) { ell(g, x + 1, 12, 3, 3, C.bone); rect(g, x - 1, 12, 5, 2, C.bone); P(g, x, 11, '#2a1a12'); P(g, x + 2, 11, '#2a1a12'); rect(g, x, 14, 3, 1, C.boneD); P(g, x - 1, 8, C.bone); P(g, x + 3, 8, C.bone); }
      else { fillHide(g, x - 2, 9, 7, 11, C.hide, C.hideD); } }
    return outline(c, OUTC); },
  /* the gibbet: a cage on a post, a skull in it (the standing cage: a hung one is the hoists') */
  gibbet() { const [c, g] = canvas(16, 30); rect(g, 7, 12, 2, 18, C.bark); rect(g, 7, 12, 1, 18, C.barkL); rect(g, 4, 28, 8, 2, C.barkD); rect(g, 4, 28, 8, 1, C.barkM);
    rect(g, 6, 11, 4, 1, C.iron); rect(g, 2, 10, 12, 1, C.iron); rect(g, 2, 10, 12, 1, C.ironL); for (const x of [2, 5, 8, 11, 13]) rect(g, x, 11, 1, 10, C.iron); rect(g, 2, 21, 12, 1, C.iron); rect(g, 2, 16, 12, 1, C.iron); rect(g, 3, 11, 1, 10, C.ironL);
    ell(g, 7, 18, 2, 2, C.bone); rect(g, 6, 19, 3, 1, C.boneD); P(g, 6, 17, '#2a1a12'); P(g, 8, 17, '#2a1a12'); rect(g, 6, 8, 4, 2, C.iron); rect(g, 7, 6, 2, 3, C.iron); return outline(c, OUTC); },
  skullPile(v) { const [c, g] = canvas(18, 12); const sk = (x, y, s) => { ell(g, x, y, s, s, C.bone); rect(g, x - s + 1, y, s * 2 - 1, 2, C.bone); P(g, x - 1, y - 1, '#2a1a12'); P(g, x + 1, y - 1, '#2a1a12'); rect(g, x - 1, y + 2, 3, 1, C.boneD); P(g, x, y - s, '#fff6e0'); };
    sk(5, 8, 3); sk(12, 8, 3); sk(8, 4, 3); if (v & 1) { sk(15, 9, 2); } rect(g, 1, 10, 16, 1, C.boneD); for (const x of [2, 9, 14]) rect(g, x, 10, 1, 2, C.bone); return outline(c, OUTC); },
  /* a root knee: a root that comes up out of the floor in a loop and goes back in */
  rootDecor(v) { const w = [26, 22, 30][v % 3], h = [20, 26, 16][v % 3], [c, g] = canvas(w, h);
    for (let x = 0; x < w; x++) { const t = x / (w - 1), y = h - 1 - Math.round(Math.sin(t * Math.PI) * (h - 5)), th = 4 + Math.round(Math.sin(t * Math.PI) * 2);
      rect(g, x, y, 1, th, C.barkM); rect(g, x, y, 1, 1, C.barkH); rect(g, x, y + th - 1, 1, 1, C.barkD); if ((x + v) % 4 === 0) rect(g, x, y + 1, 1, th - 2, C.bark); }
    for (let x = 0; x < w; x++) { const t = x / (w - 1); const y = h - 1; rect(g, x, y, 1, 1, C.barkD); }
    for (let k = 0; k < 3; k++) { const fx = 3 + ((k * 7 + v * 3) % (w - 5)); rect(g, fx, h - 3, 1, 3, C.bark); } return outline(c, OUTC); },
  /* leaf litter */
  leaves(z, v) { const [c, g] = canvas(14, 5), cols = z < 2 ? ['#5a3a48', '#8a5a58', '#3a2a40'] : z < 3 ? ['#8a5a28', '#c8883a', '#5a3a1a'] : ['#c8883a', '#e8b050', '#8a5a28'];
    const r = mulberry(v * 13 + z); for (let i = 0; i < 9; i++) { const x = (r() * 12) | 0, y = 1 + ((r() * 3) | 0); rect(g, x, y, 2, 1, cols[i % 3]); P(g, x + 1, y - 1, cols[(i + 1) % 3]); } rect(g, 0, 4, 14, 1, cols[2]); return c; },
  bonescrap(v) { const [c, g] = canvas(14, 7); if (v & 1) { rect(g, 2, 5, 10, 1, C.bone); P(g, 1, 4, C.bone); P(g, 1, 6, C.bone); P(g, 12, 4, C.bone); P(g, 12, 6, C.bone); for (let i = 0; i < 3; i++) rect(g, 4 + i * 2, 2 + (i & 1), 1, 3, C.boneD); }
    else { ell(g, 6, 3, 3, 2, C.bone); rect(g, 4, 3, 5, 2, C.bone); P(g, 5, 2, '#2a1a12'); P(g, 7, 2, '#2a1a12'); rect(g, 5, 5, 3, 1, C.boneD); rect(g, 1, 5, 12, 1, C.bone); P(g, 0, 4, C.bone); P(g, 0, 6, C.bone); P(g, 13, 4, C.bone); P(g, 13, 6, C.bone); } return outline(c, OUTC); },
  /* a hide rack: three bark posts leant together, a hide stretched on a frame */
  rack() { const [c, g] = canvas(20, 22); rect(g, 2, 2, 2, 20, C.bark); rect(g, 15, 2, 2, 20, C.bark); rect(g, 2, 2, 1, 20, C.barkL); rect(g, 1, 2, 18, 2, C.barkM); rect(g, 1, 2, 18, 1, C.barkH); rect(g, 2, 15, 15, 2, C.barkM);
    fillHide(g, 4, 5, 11, 10, C.hide, C.hideD); for (const [x, y] of [[4, 5], [14, 5], [4, 14], [14, 14]]) { P(g, x, y, C.cord); P(g, x - 1, y - 1, C.cord); } return outline(c, OUTC); },
  /* a lantern on a root pole: the goblins' light */
  lantern() { const [c, g] = canvas(10, 26); rect(g, 4, 6, 2, 20, C.bark); rect(g, 4, 6, 1, 20, C.barkL); rect(g, 2, 24, 6, 2, C.barkD); rect(g, 2, 5, 6, 1, C.iron); rect(g, 1, 5, 1, 4, C.iron);
    rect(g, 2, 1, 6, 1, C.iron); rect(g, 2, 2, 6, 6, '#3a2410'); rect(g, 3, 3, 4, 4, '#ffcf6a'); rect(g, 3, 3, 4, 1, '#fff2b0'); rect(g, 2, 8, 6, 1, C.iron); P(g, 4, 0, C.iron); P(g, 5, 0, C.iron); return outline(c, OUTC); },
  bracket(l) { const [c, g] = canvas(14, 9); for (let k = 0; k < 8; k++) rect(g, 0, k, 13 - k * 1.4, 1, k === 0 ? C.barkH : C.barkM); rect(g, 0, 0, 2, 9, C.barkD); rect(g, 6, 1, 2, 2, C.cord); P(g, 6, 1, '#f0e0b0'); return outline(c, OUTC); },
  /* a root post to a ledge: a thick bark pole, lashed, a foot of flared roots */
  post(h, z) { const [c, g] = canvas(10, h), Z = ZONE[z]; rect(g, 1, 0, 8, h, Z.s[3]); rect(g, 1, 0, 2, h, Z.s[5]); rect(g, 7, 0, 2, h, Z.s[1]); for (let y = 5; y < h - 4; y += 7) { rect(g, 1, y, 8, 1, Z.s[1]); rect(g, 1, y + 1, 8, 1, Z.s[4]); }
    for (let y = 3; y < h - 6; y += 13) { rect(g, 0, y, 10, 3, Z.cord); rect(g, 0, y, 10, 1, '#f0e0b0'); P(g, 2, y + 1, Z.s[0]); P(g, 5, y + 1, Z.s[0]); P(g, 8, y + 1, Z.s[0]); }
    rect(g, 0, h - 4, 10, 4, Z.s[2]); rect(g, 0, h - 4, 10, 1, Z.s[5]); P(g, 0, h - 1, Z.s[0]); P(g, 9, h - 1, Z.s[0]); return outline(c, OUTC); },
  /* a hanging limb: out of the canopy, bark-ridged, ending in the pulley's bracket; w wide, h tall */
  limb(h, z) { const [c, g] = canvas(14, h), Z = ZONE[z]; for (let y = 0; y < h; y++) { const w = 8 + Math.round(Math.sin(y * 0.12) * 1) + (y < 8 ? 1 : 0); rect(g, 7 - (w >> 1), y, w, 1, Z.s[3]); rect(g, 7 - (w >> 1), y, 2, 1, Z.s[5]); rect(g, 7 + (w >> 1) - 2, y, 2, 1, Z.s[1]); if (y % 6 === 3) P(g, 6 + (y % 3), y, Z.s[0]); }
    for (let k = 0; k < 4; k++) { const ly = 10 + k * 16; if (ly + 3 < h) { rect(g, 8, ly, 5, 2, Z.moss[1]); P(g, 12, ly + 1, Z.moss[2]); P(g, 9, ly - 1, Z.moss[2]); } }
    return outline(c, OUTC); },
  /* a spore clump: a mass of root hanging, a pod in it, the spores' pale dust. v is 0 resting, 1 swollen on the beat */
  sporeDrop(swell) { const [c, g] = canvas(22, 24); const r = mulberry(77);
    for (let y = 0; y < 8; y++) { const w = 3 + y; rect(g, 11 - (w >> 1), y, w, 1, y < 2 ? C.barkD : C.bark); P(g, 11 - (w >> 1), y, C.barkM); }
    for (let k = 0; k < 6; k++) { const fx = 4 + k * 3, fl = 6 + ((r() * 8) | 0); for (let y = 0; y < fl; y++) P(g, fx + (y > 4 ? (k & 1 ? 1 : -1) : 0), 6 + y, y > fl - 3 ? C.barkD : C.barkM); }
    const pr = swell ? 5 : 4; ell(g, 11, 15, pr, pr - 1, swell ? '#d8b8ff' : '#a888c8'); ell(g, 11, 14, pr - 2, pr - 3, swell ? '#f0e0ff' : '#c8a8e0'); P(g, 9, 13, '#ffffff'); P(g, 12, 18, swell ? '#8a60b8' : '#6a4a90'); rect(g, 8, 18, 6, 1, '#5a3a78');
    for (let k = 0; k < 5; k++) P(g, 4 + k * 3 + (swell ? (k & 1 ? 1 : -1) : 0), 20 + (k % 2), swell ? '#e8d8ff' : '#a888c8');
    return outline(c, OUTC); },
};
function fillHide(g, x, y, w, h, col, dk) { for (let yy = 0; yy < h; yy++) { const ins = yy < 2 || yy > h - 3 ? 1 : 0, wob = (yy * 5 % 3 === 0) ? 1 : 0; rect(g, x + ins + wob, y + yy, w - ins * 2 - wob, 1, col); } rect(g, x + 1, y + h - 2, w - 2, 1, dk); rect(g, x + 2, y + 2, 1, h - 5, dk); rect(g, x + w - 3, y + 3, 1, h - 6, mix(col, '#ffffff', 0.12)); }
const spr = (k, a, b) => once(k + ':' + a + ':' + b, () => SPR[k](a, b));

/* the deco kinds the Rootway re-skins (src/main.js asks decoOf for each 'deco' ent; null = the game's own picture) */
export function decoOf(e) {
  switch (e.kind) {
    case 'warnPost': return [spr('warnPost', (e.v || 0) & 1), true];
    case 'gobPennant': return [spr('gobPennant', e.v || 0), true];
    case 'trophyRack': return [spr('trophyRack', (e.v || 0) & 1), true];
    case 'hangCage': return [spr('gibbet'), true];
    case 'skullPile': return [spr('skullPile', e.v || 0), true];
    case 'rootDecor': return [spr('rootDecor', e.v || 0), true];
  }
  return null;
}
export const RW_SPRITES = SPR;
export const spriteOf = (k, a, b) => spr(k, a, b);

/* ----------------------------------------------------------------- THE PLAN ----------------------------------------------------------------- */
const AVOID = new Set(['sign', 'check', 'loft', 'silver', 'stray', 'gate', 'vent', 'coin', 'hoist', 'glow', 'deco', 'rockfall']);
const FOES = new Set(['archer', 'shield', 'brute', 'sapper', 'trophyhunter', 'huntmaster', 'weaver', 'spider', 'lurker', 'spitcap', 'sporeling']);
export function planRoot(L, T) {
  if (L.__rwPlan) return L.__rwPlan;
  const W = L.W, H = L.H, gr = L.grid, tt = (x, y) => x < 0 || y < 0 || x >= W || y >= H ? T.SOLID : gr[y * W + x];
  const air = (x, y) => tt(x, y) === T.AIR, solid = (x, y) => tt(x, y) === T.SOLID, standable = v => v === T.SOLID || v === T.ONEWAY, standTop = (x, y) => solid(x, y) && tt(x, y - 1) !== T.SOLID;
  /* THE CHASMS: a column that is air all the way to the foot of the level, from the lip on */
  const chasms = []; { let x = 0; while (x < W) { let open = true; for (let y = 12; y < H; y++) if (tt(x, y) !== T.AIR) { open = false; break; } if (!open) { x++; continue; }
    const x0 = x; while (x < W) { let o = true; for (let y = 12; y < H; y++) if (tt(x, y) !== T.AIR) { o = false; break; } if (!o) break; x++; } const x1 = x - 1;
    let lip = H; for (const cxl of [x0 - 1, x1 + 1]) for (let y = 0; y < H; y++) if (standable(tt(cxl, y)) && tt(cxl, y - 1) === T.AIR) { lip = Math.min(lip, y); break; }
    chasms.push({ x0, x1, lip }); } }
  /* THE SUPPORTS of every ledge run */
  const supports = [];
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { if (tt(x, y) !== T.ONEWAY) { x++; continue; } const x0 = x; while (tt(x, y) === T.ONEWAY) x++; const x1 = x - 1, ends = [];
    for (const ex of x0 === x1 ? [x0] : [x0, x1]) {
      if (solid(ex + (ex === x0 ? -1 : 1), y) || solid(ex, y + 1)) { ends.push({ x: ex, how: 'rock' }); continue; }
      let fy = -1; for (let k = 1; k <= 14; k++) { if (standTop(ex, y + k)) { fy = y + k; break; } if (tt(ex, y + k) === T.ONEWAY) break; }
      if (fy > 0) { ends.push({ x: ex, how: 'post', y0: y + 1, y1: fy }); continue; }
      let best = null; for (let dx = -9; dx <= 9; dx++) for (let dy = -3; dy <= 14; dy++) { const ax = ex + dx, ay = y + dy; if (!standTop(ax, ay)) continue; const d = Math.hypot(dx, dy * 0.8); if (!best || d < best.d) best = { d, ax, ay }; }
      ends.push(best ? { x: ex, how: 'stay', ax: best.ax, ay: best.ay } : { x: ex, how: 'none' }); }
    if (x1 - x0 + 1 > 8) for (let mx = x0 + 6; mx < x1 - 2; mx += 6) for (let k = 1; k <= 14; k++) if (standTop(mx, y + k)) { ends.push({ x: mx, how: 'post', y0: y + 1, y1: y + k, mid: true }); break; }
    supports.push({ x0, x1, y, ends, ok: ends.every(e => e.how !== 'none') }); } }
  /* THE HOISTS' hardware: a limb to every pulley, a cleat peg in the wall or a post to the floor under it */
  const pulleys = [], cleats = [];
  for (const h of (L.hoists || [])) { pulleys.push({ id: h.id, x: h.x, top: h.top });
    const [ccx, ccy] = h.cleat, wall = solid(ccx - 1, ccy) || solid(ccx - 1, ccy + 1) ? -1 : solid(ccx + 1, ccy) || solid(ccx + 1, ccy + 1) ? 1 : 0;
    let below = -1; if (!wall && !solid(ccx, ccy + 1)) for (let y = ccy + 1; y < H; y++) if (solid(ccx, y)) { below = y; break; }
    cleats.push({ id: h.id, x: ccx, y: ccy, wall, post: below > 0 ? below : 0, arrow: !!h.arrow, boss: !!h.boss }); }
  /* THE SPORE DROPS: a root clump over every spore rockfall */
  const drops = (L.ents || []).filter(e => e.t === 'rockfall' && e.spore).map(e => ({ x: e.x * TS + 8, y: e.y * TS }));
  /* DRESSING: floors */
  const items = [], lights = [], ex = (L.ents || []).filter(e => AVOID.has(e.t) || FOES.has(e.t)).map(e => [e.x, e.y, e.t === 'vent' ? 2 : 1]);
  const nearEnt = (x, y) => ex.some(([a, b, r]) => Math.abs(a - x) <= r && Math.abs(b - (y - 1)) <= 2);
  const inChasm = x => chasms.some(c => x >= c.x0 - 2 && x <= c.x1 + 2);
  const pick = (list, h) => { let tot = 0; for (const [, w] of list) tot += w; let q = h % tot; for (const [k, w] of list) { if (q < w) return k; q -= w; } return list[0][0]; };
  const KINDS = [[['leaves', 5], ['bonescrap', 1], ['rack', 0]], [['leaves', 4], ['bonescrap', 2], ['rack', 1]], [['leaves', 4], ['bonescrap', 3], ['rack', 2]], [['leaves', 5], ['bonescrap', 2], ['rack', 1]], [['leaves', 3], ['bonescrap', 4], ['rack', 0]]];
  const last = new Map();
  for (let y = 2; y < H - 1; y++) for (let x = 2; x < W - 2; x++) {
    if (!standable(tt(x, y)) || !air(x, y - 1) || !air(x, y - 2) || inChasm(x)) continue;
    const z = zoneOf(x), h = hash(x * 3 + 1, y * 7 + 2), r = h % 100, lx = last.get(y) ?? -99, onLedge = tt(x, y) === T.ONEWAY, gap = onLedge ? 6 : 3; if (x - lx < gap || nearEnt(x, y)) continue;
    if (r > (onLedge ? 30 : 60)) continue;
    let k = pick(KINDS[z], h >>> 7); if (onLedge && k === 'rack') k = 'leaves';
    if (k === 'rack' && !(standable(tt(x - 1, y)) && standable(tt(x + 1, y)) && air(x, y - 3))) k = 'leaves';
    last.set(y, x); items.push({ k, x: x * TS + 8, y: y * TS, v: (h >>> 11) & 3, z, ph: (h >>> 3) % 100 }); }
  /* lanterns: a lit post at every checkpoint (both sides), by the larder, at the lookout and the loft; and by the arena door */
  const top = (x, y0) => { for (let y = y0 - 3; y <= y0 + 3; y++) if (standable(tt(x, y)) && air(x, y - 1) && air(x, y - 2)) return y; return -1; };
  const place = (k, x, y) => { const y2 = top(x, y); if (y2 < 0) return; const j = items.findIndex(i => Math.abs(i.x - (x * TS + 8)) < 20 && Math.abs(i.y - y2 * TS) < 40); if (j >= 0) items.splice(j, 1); items.push({ k, x: x * TS + 8, y: y2 * TS, v: 0, z: zoneOf(x), ph: (x * 7) % 100 }); };
  for (const e of L.ents) if (e.t === 'check') { place('lantern', e.x + 2, e.y + 1); place('lantern', e.x - 2, e.y + 1); }
  for (const [x, y] of [[8, 41], [102, 34], [206, 44], [308, 20], [318, 20], [378, 18], [391, 18], [443, 18]]) place('lantern', x, y + 1);
  /* WALLS: knotted pegs and nailed hides on the faces of the root walls the sun can see */
  for (let y = 4; y < H - 6; y++) for (let x = 3; x < W - 3; x++) {
    if (!solid(x, y) || !solid(x, y - 1) || !solid(x, y + 1)) continue; const eL = air(x - 1, y), eR = air(x + 1, y); if (!eL && !eR) continue;
    const h = hash(x * 13 + 5, y * 17 + 3); if (h % 100 > 2) continue; if (nearEnt(x, y + 1)) continue;
    items.push({ k: ['peg', 'nailhide', 'skullnail'][(h >>> 9) % 3], x: eL ? x * TS : (x + 1) * TS, y: y * TS + 2, side: eL ? -1 : 1, z: zoneOf(x), v: (h >>> 13) & 3 }); }
  /* UNDER: root hair and moss hanging from the underside of a ledge over open air */
  for (let y = 2; y < H - 3; y++) for (let x = 2; x < W - 2; x++) { if (tt(x, y) !== T.ONEWAY || !air(x, y + 1) || !air(x, y + 2)) continue; const h = hash(x * 5 + 9, y * 11 + 1); if (h % 100 > 22) continue;
    items.push({ k: 'hair', x: x * TS + 3 + (h % 9), y: y * TS + 10, n: 8 + (h >>> 8) % 10, z: zoneOf(x), ph: (h >>> 3) % 100 }); }
  items.sort((a, b) => a.x - b.x);
  for (const it of items) if (it.k === 'lantern') lights.push({ x: it.x + 0, y: it.y - 20, r: 40, a: 0.3, c: '255,200,110', fl: 0.5 });
  for (const d of (L.decor || [])) if (d.kind === 'larder') { for (const lx of [d.x0 * TS + 12, (d.x1 + 1) * TS - 12]) lights.push({ x: lx, y: d.y * TS + 24, r: 56, a: 0.34, c: '255,190,100', fl: 0.7 }); }
  return (L.__rwPlan = { chasms, supports, items, lights, drops, cleats, pulleys, solid });
}

/* ----------------------------------------------------------------- THE HARDWARE ----------------------------------------------------------------- */
const R = Math.round;
const glow = (g, x, y, r, a, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
/* A TWISTED ROPE from (x0,y0) to (x1,y1): a dark line, a light twist along it */
export function rope(g, x0, y0, x1, y1, col = C.cord, dk = C.cordD) {
  x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)), vert = Math.abs(y1 - y0) >= Math.abs(x1 - x0);
  for (let i = 0; i <= n; i++) { const t = n ? i / n : 0, x = R(x0 + (x1 - x0) * t), y = R(y0 + (y1 - y0) * t); g.fillStyle = (i >> 1) & 1 ? col : dk; if (vert) { g.fillRect(x, y, 2, 1); } else { g.fillRect(x, y, 1, 2); } }
}
/* the PULLEY: a limb out of the canopy, a bracket arm under it, a wooden block and its wheel */
export const zoneOfX = x => zoneOf(x), ROPE_D = C.cordD;
export function drawPulley(g, px0, py, time, zone) {
  const limb = spr('limb', 90, zone), lh = limb.height;
  for (let yy = py - 4; yy > -lh; yy -= lh - 1) g.drawImage(limb, px0 - 7, yy - lh + 1);   /* the limb comes down out of the canopy, tiled up as far as the frame goes */
  /* the bracket arm: a short bark beam across, lashed to the limb */
  g.fillStyle = C.barkM; g.fillRect(px0 - 10, py - 4, 20, 4); g.fillStyle = C.barkH; g.fillRect(px0 - 10, py - 4, 20, 1); g.fillStyle = C.barkD; g.fillRect(px0 - 10, py - 1, 20, 1);
  g.fillStyle = C.cord; g.fillRect(px0 - 2, py - 5, 4, 6); g.fillStyle = '#f0e0b0'; g.fillRect(px0 - 2, py - 5, 4, 1); g.fillStyle = C.cordD; g.fillRect(px0 - 2, py - 3, 4, 1);
  /* the block: two cheeks of wood, the wheel between */
  g.fillStyle = C.barkD; g.fillRect(px0 - 4, py, 8, 8); g.fillStyle = C.barkM; g.fillRect(px0 - 3, py, 2, 8); g.fillStyle = C.barkL; g.fillRect(px0 - 4, py, 1, 8);
  g.fillStyle = C.bone; g.beginPath(); g.arc(px0, py + 4, 3, 0, 7); g.fill(); g.fillStyle = C.barkD; g.fillRect(px0, py + 4, 1, 1); g.fillStyle = C.boneD; g.fillRect(px0 - 1, py + 6, 3, 1);
}
/* the CLEAT: a carved horn peg, the rope wound figure-of-eight on it; a post under it where it stands in the open */
export function drawCleat(g, ccx, ccy, o) {
  const { time, up, glint, arrow, post, wall, floorY } = o;
  if (post > 0 && floorY !== undefined) { const h = floorY - ccy; if (h > 2) { g.fillStyle = C.barkD; g.fillRect(ccx - 3, ccy, 6, h); g.fillStyle = C.barkM; g.fillRect(ccx - 3, ccy, 2, h); g.fillStyle = C.barkL; g.fillRect(ccx - 3, ccy, 1, h);
      for (let yy = ccy + 5; yy < floorY - 3; yy += 9) { g.fillStyle = C.cord; g.fillRect(ccx - 4, yy, 8, 2); g.fillStyle = '#f0e0b0'; g.fillRect(ccx - 4, yy, 8, 1); }
      g.fillStyle = C.barkD; g.fillRect(ccx - 5, floorY - 3, 10, 3); g.fillStyle = C.barkM; g.fillRect(ccx - 5, floorY - 3, 10, 1); } }
  /* the peg: a horn of wood out of the post or the wall, bone-tipped */
  const dir = wall === 1 ? 1 : wall === -1 ? -1 : 0;
  g.fillStyle = C.barkD; g.fillRect(ccx - 3, ccy - 12, 6, 7); g.fillStyle = C.barkM; g.fillRect(ccx - 3, ccy - 12, 6, 2); g.fillStyle = C.barkL; g.fillRect(ccx - 3, ccy - 12, 1, 7);
  g.fillStyle = C.bone; g.fillRect(ccx - 5, ccy - 13, 2, 3); g.fillRect(ccx + 3, ccy - 13, 2, 3); g.fillStyle = '#fff6e0'; g.fillRect(ccx - 5, ccy - 13, 1, 1); g.fillRect(ccx + 4, ccy - 13, 1, 1);
  if (dir) { g.fillStyle = C.barkD; g.fillRect(ccx - 3 + dir * 4, ccy - 10, 3, 3); }
  if (up) { g.fillStyle = C.cord; g.fillRect(ccx - 4, ccy - 10, 8, 2); g.fillRect(ccx - 3, ccy - 7, 6, 2); g.fillStyle = C.cordD; g.fillRect(ccx - 4, ccy - 9, 8, 1); g.fillRect(ccx - 1, ccy - 7, 1, 2); g.fillStyle = '#f0e0b0'; g.fillRect(ccx - 4, ccy - 10, 3, 1); g.fillRect(ccx + 1, ccy - 7, 3, 1); }
  else { g.fillStyle = C.cordD; g.fillRect(ccx - 1, ccy - 10, 2, 5); g.fillRect(ccx, ccy - 6, 2, 4); }   /* a cut rope end hangs from it */
  if (glint) { const k = 0.5 + 0.5 * Math.sin(time * 5 + ccx); g.globalAlpha = 0.35 + 0.4 * k; g.strokeStyle = arrow ? C.gold : C.goldL; g.lineWidth = 1; g.beginPath(); g.arc(ccx, ccy - 9, arrow ? 9 : 6, 0, 7); g.stroke(); g.globalAlpha = 1; }
}
/* A LANDED SPAN: a hoist's span stays as one-way cells, but cellSet clears their picture, so the logs are drawn here, cell by cell, the same timber as the level's ledges */
export function drawLandedSpan(g, span, cx, cy, time) { const [x0, x1, row] = span, zone = zoneOf(x0); for (let x = x0; x <= x1; x++) g.drawImage(timberTile(zone, x === x0, x === x1, ((x * 5 + row) % 3 + 3) % 3), R(x * TS - cx), R(row * TS - cy)); }
/* A LASHED SPAN hanging (w px wide): a row of logs bound with cord, the ends' rope slings */
export function drawSpanLoad(g, x0, y, w, down, time) {
  if (down) { /* landed: the lashings and the slack of its slings lie on it (the logs are the ledge tiles) */ for (let x = x0 + 4; x < x0 + w - 3; x += 14) { g.fillStyle = C.cord; g.fillRect(x, y, 3, 8); g.fillStyle = '#f0e0b0'; g.fillRect(x, y, 3, 1); g.fillStyle = C.cordD; g.fillRect(x + 1, y + 3, 1, 1); g.fillRect(x + 1, y + 6, 1, 1); }
    g.fillStyle = C.cord; g.fillRect(x0 - 1, y + 4, 3, 3); g.fillRect(x0 + w - 2, y + 4, 3, 3); return; }
  for (let k = 0; k < 2; k++) { const yy = y + 2 + k * 5; g.fillStyle = k ? C.barkM : C.barkL; g.fillRect(x0, yy, w, 5); g.fillStyle = C.barkH; g.fillRect(x0, yy, w, 1); g.fillStyle = C.barkD; g.fillRect(x0, yy + 4, w, 1);
    g.fillStyle = mixc(C.bark, C.barkM); for (let xx = x0 + 3; xx < x0 + w - 2; xx += 7) g.fillRect(xx, yy + 1 + (xx % 3), 2, 1); g.fillStyle = C.bone; g.fillRect(x0, yy + 1, 2, 3); g.fillRect(x0 + w - 2, yy + 1, 2, 3); g.fillStyle = C.boneD; g.fillRect(x0 + 1, yy + 2, 1, 1); g.fillRect(x0 + w - 2, yy + 2, 1, 1); }
  for (let x = x0 + 5; x < x0 + w - 3; x += 14) { g.fillStyle = C.cord; g.fillRect(x, y + 1, 3, 12); g.fillStyle = '#f0e0b0'; g.fillRect(x, y + 1, 3, 1); g.fillStyle = C.cordD; g.fillRect(x + 1, y + 4, 1, 1); g.fillRect(x + 1, y + 8, 1, 1); g.fillRect(x + 1, y + 11, 1, 1); }
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x0 + 2, y + 13, w - 4, 2);
}
const mixc = mix;
/* THE CAGE: bound bars, iron straps, a trophy skull, a ring to hang from (32 wide) */
export function drawCage(g, x, b, time, down) {
  const w = 2 * TS, t = b - 2 * TS; g.fillStyle = 'rgba(20,12,10,0.4)'; g.fillRect(x - w / 2 + 1, t + 1, w - 2, w - 2);
  g.fillStyle = C.barkM; for (let k = 0; k <= 5; k++) { const bx = x - w / 2 + 1 + k * 6; g.fillRect(bx, t, 3, w); g.fillStyle = C.barkL; g.fillRect(bx, t, 1, w); g.fillStyle = C.barkM; }
  g.fillStyle = C.barkD; for (let k = 0; k <= 5; k++) g.fillRect(x - w / 2 + 3 + k * 6, t, 1, w);
  g.fillStyle = C.iron; g.fillRect(x - w / 2, t, w, 3); g.fillRect(x - w / 2, b - 3, w, 3); g.fillRect(x - w / 2, t + 10, w, 2); g.fillStyle = C.ironL; g.fillRect(x - w / 2, t, w, 1); g.fillRect(x - w / 2, b - 3, w, 1);
  g.fillStyle = C.ironL; for (let k = 0; k < 6; k++) { g.fillRect(x - w / 2 + 2 + k * 6, t + 1, 1, 1); g.fillRect(x - w / 2 + 2 + k * 6, b - 2, 1, 1); }
  g.fillStyle = C.bone; g.fillRect(x - 3, t + 15, 7, 6); g.fillRect(x - 2, t + 14, 5, 1); g.fillStyle = '#2a1a12'; g.fillRect(x - 2, t + 17, 2, 2); g.fillRect(x + 1, t + 17, 2, 2); g.fillStyle = C.boneD; g.fillRect(x - 1, t + 21, 3, 1);   /* the skull inside */
  g.fillStyle = C.cord; g.fillRect(x - 5, t + 11, 3, 1); g.fillRect(x + 3, t + 11, 3, 1);
  if (!down) { g.fillStyle = C.iron; g.fillRect(x - 2, t - 6, 4, 6); g.fillRect(x - 3, t - 7, 6, 2); g.fillStyle = C.ironL; g.fillRect(x - 3, t - 7, 6, 1); g.fillStyle = '#0c0808'; g.fillRect(x - 1, t - 5, 2, 2); }
}
/* the TROPHY LOFT's door (a vault door of timber and bone) at tile x, y0..y1 */
export function drawLoftDoor(g, x, y0, y1, got) {
  const h = y1 - y0; g.fillStyle = C.barkD; g.fillRect(x, y0, TS, h); g.fillStyle = C.barkM; for (let yy = y0; yy < y1; yy += 8) { g.fillRect(x + 1, yy + 1, TS - 2, 6); g.fillStyle = C.barkL; g.fillRect(x + 1, yy + 1, TS - 2, 1); g.fillStyle = C.barkM; }
  g.fillStyle = C.iron; g.fillRect(x, y0, TS, 2); g.fillRect(x, y1 - 2, TS, 2); g.fillRect(x + 6, y0, 4, h);
  g.fillStyle = C.bone; g.fillRect(x + 2, y0 + 8, 5, 5); g.fillRect(x + 9, y0 + 8, 5, 5); g.fillStyle = '#2a1a12'; g.fillRect(x + 3, y0 + 10, 1, 2); g.fillRect(x + 5, y0 + 10, 1, 2); g.fillRect(x + 10, y0 + 10, 1, 2); g.fillRect(x + 12, y0 + 10, 1, 2);
  for (let k = 0; k < 4; k++) { const sx = x + 3 + (k & 1) * 6, sy = y0 + 20 + (k >> 1) * 8; g.fillStyle = '#1a1010'; g.fillRect(sx, sy, 4, 5); g.fillStyle = k < (got || 0) ? C.bone : '#3a2a22'; g.fillRect(sx + 1, sy + 1, 2, 3); }   /* four tag sockets */
}
/* the LARDER's drying beam: held off a bough by ropes, skulls and hides hung from it, lit by lanterns at its ends */
export function drawLarder(g, x0, x1, y, time, zone) {
  const w = x1 - x0, bough = y - 52;
  for (const bx of [x0 + 8, (x0 + x1) >> 1, x1 - 8]) { rope(g, bx, y, bx, bough + 6); }
  g.fillStyle = C.barkD; g.fillRect(x0 - 4, bough, w + 8, 9); g.fillStyle = C.barkM; g.fillRect(x0 - 4, bough, w + 8, 6); g.fillStyle = C.barkH; g.fillRect(x0 - 4, bough, w + 8, 1); for (let xx = x0; xx < x1; xx += 9) { g.fillStyle = C.barkD; g.fillRect(xx, bough + 2 + (xx % 3), 3, 1); }
  g.fillStyle = ZONE[zone].moss[1]; for (let xx = x0 - 2; xx < x1 + 4; xx += 5) g.fillRect(xx, bough - 1, 3, 2);
  g.fillStyle = C.barkM; g.fillRect(x0, y, w, 5); g.fillStyle = C.barkH; g.fillRect(x0, y, w, 1); g.fillStyle = C.barkD; g.fillRect(x0, y + 4, w, 1);
  for (const bx of [x0 + 8, (x0 + x1) >> 1, x1 - 8]) { g.fillStyle = C.cord; g.fillRect(bx - 1, y - 1, 3, 7); g.fillStyle = '#f0e0b0'; g.fillRect(bx - 1, y - 1, 3, 1); }
  /* what hangs: skulls, a hide, a string of teeth, swaying a little */
  const sw = k => Math.round(Math.sin(time * 1.4 + k) * 0.8);
  for (let k = 0, xx = x0 + 18; xx < x1 - 14; xx += 24, k++) { const len = 6 + (k % 3) * 4, sx = xx + sw(k); g.fillStyle = C.cord; g.fillRect(sx, y + 5, 1, len);
    if (k % 3 === 1) { g.fillStyle = C.hide; g.fillRect(sx - 4, y + 5 + len, 9, 10); g.fillStyle = C.hideD; g.fillRect(sx - 3, y + 6 + len + 7, 7, 2); g.fillRect(sx - 1, y + 7 + len, 1, 6); }
    else { g.fillStyle = C.bone; g.fillRect(sx - 3, y + 5 + len, 7, 5); g.fillRect(sx - 2, y + 4 + len, 5, 1); g.fillStyle = '#2a1a12'; g.fillRect(sx - 2, y + 7 + len, 2, 2); g.fillRect(sx + 1, y + 7 + len, 2, 2); g.fillStyle = C.boneD; g.fillRect(sx - 1, y + 10 + len, 3, 1); } }
  /* the lanterns at each end, lit */
  for (const lx of [x0 + 2, x1 - 2]) { g.fillStyle = C.cord; g.fillRect(lx, y + 5, 1, 4); g.fillStyle = C.iron; g.fillRect(lx - 3, y + 9, 7, 1); g.fillStyle = '#3a2410'; g.fillRect(lx - 3, y + 10, 7, 8); g.fillStyle = '#ffcf6a'; g.fillRect(lx - 2, y + 11, 5, 6); g.fillStyle = '#fff2b0'; g.fillRect(lx - 2, y + 11, 5, 2); g.fillStyle = C.iron; g.fillRect(lx - 3, y + 18, 7, 1); }
}
/* the LOOKOUT's hut: a thatch roof on bark posts, a rail, a lantern, a goblin's flag. posts: the left to y, the right three tiles lower (as the greybox's) */
export function drawLookout(g, x0, x1, y, time, zone) {
  const w = x1 - x0;
  for (const [px0, ph] of [[x0, 40], [x1 - 3, 40 + 3 * TS]]) { g.fillStyle = C.barkD; g.fillRect(px0, y - 40, 3, ph); g.fillStyle = C.barkM; g.fillRect(px0, y - 40, 2, ph); g.fillStyle = C.barkL; g.fillRect(px0, y - 40, 1, ph); for (let yy = y - 34; yy < y - 40 + ph; yy += 12) { g.fillStyle = C.cord; g.fillRect(px0 - 1, yy, 5, 2); g.fillStyle = '#f0e0b0'; g.fillRect(px0 - 1, yy, 5, 1); } }
  g.fillStyle = C.barkM; g.fillRect(x0, y - 12, w, 2); g.fillStyle = C.barkH; g.fillRect(x0, y - 12, w, 1);   /* the rail */
  for (let xx = x0 + 8; xx < x1 - 6; xx += 12) { g.fillStyle = C.barkD; g.fillRect(xx, y - 11, 2, 10); }
  /* the thatch: layered, ragged at the eaves */
  const mid = (x0 + x1) / 2; for (let row = 0; row < 5; row++) { const yy = y - 54 + row * 4 + 4, half = (w / 2 + 8) * (row + 2) / 6 + 2; g.fillStyle = [C.barkH, '#b08a4a', C.barkL, '#8a6a3a', C.barkM][row]; g.fillRect(R(mid - half), yy, R(half * 2), 4);
    g.fillStyle = C.barkD; for (let xx = R(mid - half); xx < mid + half; xx += 3) g.fillRect(xx, yy + 3 + (xx % 2), 1, 2); }
  g.fillStyle = C.barkH; g.fillRect(R(mid - 3), y - 56, 6, 3); g.fillStyle = C.bone; g.fillRect(R(mid - 1), y - 62, 3, 6); P2(g, mid - 1, y - 62, '#fff6e0');
  /* a lantern under the eave, a goblin flag on the post */
  const lx = R(x0 + 8); g.fillStyle = C.cord; g.fillRect(lx, y - 36, 1, 4); g.fillStyle = C.iron; g.fillRect(lx - 3, y - 32, 7, 1); g.fillStyle = '#3a2410'; g.fillRect(lx - 3, y - 31, 7, 8); g.fillStyle = '#ffcf6a'; g.fillRect(lx - 2, y - 30, 5, 6); g.fillStyle = '#fff2b0'; g.fillRect(lx - 2, y - 30, 5, 2);
  const fl = Math.sin(time * 3) * 2; g.fillStyle = C.red; g.beginPath(); g.moveTo(x1 - 1, y - 38); g.lineTo(x1 + 11, y - 36 + fl); g.lineTo(x1 + 18, y - 31 + fl); g.lineTo(x1 + 10, y - 28 + fl); g.lineTo(x1 - 1, y - 28); g.closePath(); g.fill(); g.fillStyle = C.bone; g.fillRect(x1 + 3, y - 34, 6, 2);
}
const P2 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
/* the gold-fletched arrows left in the roots: gold shaft glinting, a pale fletch, the head sunk in the root */
export function drawGoldArrow(g, x, y, time) {
  g.fillStyle = C.barkL; g.fillRect(x, y - 11, 1, 11); g.fillStyle = C.gold; g.fillRect(x - 1, y - 10, 3, 1);
  g.fillStyle = C.goldL; g.fillRect(x - 2, y - 14, 2, 4); g.fillRect(x + 1, y - 14, 2, 4); g.fillStyle = C.gold; g.fillRect(x - 3, y - 13, 1, 2); g.fillRect(x + 3, y - 13, 1, 2);
  const k = Math.max(0, Math.sin(time * 3 + x * 0.3)); if (k > 0.7) { g.fillStyle = '#ffffff'; g.fillRect(x, y - 16, 1, 3); g.fillRect(x - 1, y - 15, 3, 1); }
}

/* ----------------------------------------------------------------- THE GROWCAP ----------------------------------------------------------------- */
/* a bud or a cap: warm flesh (rose in the cellar, amber in the sun), cream gills, a stalk of fibre that flares into root fingers at the foot. (m.x, m.y, m.w, m.state, m.lean ... as main.js's) */
export function drawGrowcap(g, m, cx, cy, time) {
  const x = R(m.x - cx), cxm = x + m.w / 2, top = R(m.y - cy), base = R(m.y0 + 8 - cy), wob = m.state === 'up' && m.upT < 1.5 ? R(Math.sin(time * 30)) : 0;
  const z = zoneOf(m.x / TS), flesh = z === 0 ? ['#7a2a5a', '#b04878', '#e07aa0', '#ffc0d4'] : z === 1 ? ['#8a3a1c', '#c8641e', '#f09a3a', '#ffd48a'] : ['#8a4a14', '#d08a24', '#f6c050', '#fff0a8'];
  const stalk = ['#7a6a4a', '#c8b88a', '#efe0b8'], withered = m.state === 'wither';
  const fl = withered ? ['#3a3030', '#5a4a40', '#7a6a58', '#9a8a74'] : flesh;
  const stk = (sx, sy, w) => { g.fillStyle = stalk[0]; g.fillRect(sx - w + wob, sy - 2, w * 2, 3); g.fillStyle = stalk[1]; g.fillRect(sx - w + wob, sy - 2, w * 2 - 2, 3); g.fillStyle = stalk[2]; g.fillRect(sx - w + 1 + wob, sy - 2, 1, 3); };
  if (m.lean) { const bxm = R(m.bx - cx) + m.w / 2, dx = cxm - bxm, dy = top + 6 - base, n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 2) + 1;   /* A LEANING STALK: up from its root, bending out over the gap */
    for (let i = 0; i <= n; i++) { const t = i / n, sx = R(bxm + dx * t * t), sy = R(base + dy * t); stk(sx, sy, 3); if (i % 5 === 2) { g.fillStyle = stalk[0]; g.fillRect(sx - 2 + wob, sy - 1, 4, 1); } } }
  else { const h = Math.max(0, base - top - 6); g.fillStyle = stalk[0]; g.fillRect(cxm - 3 + wob, top + 6, 6, h); g.fillStyle = stalk[1]; g.fillRect(cxm - 3 + wob, top + 6, 5, h); g.fillStyle = stalk[2]; g.fillRect(cxm - 2 + wob, top + 6, 1, h);
    g.fillStyle = stalk[0]; for (let yy = top + 8; yy < base - 2; yy += 6) g.fillRect(cxm - 3 + wob, yy, 6, 1); }
  /* the foot flares into root fingers in the soil */
  { const bx = m.lean ? R(m.bx - cx) + m.w / 2 : cxm; g.fillStyle = stalk[0]; g.fillRect(bx - 6, base - 2, 12, 2); g.fillRect(bx - 8, base, 3, 1); g.fillRect(bx + 5, base, 3, 1); g.fillStyle = stalk[1]; g.fillRect(bx - 5, base - 3, 10, 1); }
  /* the cap: dome of flesh, lit top-left, gills under it, spots */
  g.fillStyle = fl[0]; g.beginPath(); g.ellipse(cxm + wob, top + 4, m.w / 2, 6, 0, Math.PI, 0); g.fill(); g.fillRect(x + wob, top + 3, m.w, 3);
  g.fillStyle = fl[1]; g.beginPath(); g.ellipse(cxm + wob, top + 4, m.w / 2 - 1, 5, 0, Math.PI, 0); g.fill(); g.fillRect(x + 1 + wob, top + 3, m.w - 2, 2);
  g.fillStyle = fl[2]; g.beginPath(); g.ellipse(cxm - 3 + wob, top + 3, m.w / 2 - 5, 3, 0, Math.PI, 0); g.fill();
  g.fillStyle = fl[3]; for (const dx of [-9, -2, 6]) g.fillRect(cxm + dx + wob, top + 1 - (dx === -2 ? 2 : 0), 2, 2); g.fillRect(cxm - 7 + wob, top + 2, 4, 1);
  g.fillStyle = withered ? '#2a2020' : '#f0dcb0'; g.fillRect(x + wob, top + 5, m.w, 1); g.fillStyle = withered ? '#1a1214' : '#a88860'; for (let xx = x + 2; xx < x + m.w - 1; xx += 2) g.fillRect(xx + wob, top + 5, 1, 1); g.fillStyle = C.barkD; g.fillRect(x + wob, top + 6, m.w, 1);   /* the gills and the dark under it */
  if (m.state === 'bud' && !(m.cd > 0) && Math.floor(time * 2) % 2) { g.globalAlpha = 0.6; g.strokeStyle = fl[3]; g.lineWidth = 1; g.beginPath(); g.moveTo(cxm - 3, top - 5); g.lineTo(cxm, top - 9); g.lineTo(cxm + 3, top - 5); g.stroke(); g.globalAlpha = 1; }   /* the up-arrow over a bud that is ready */
}

/* ----------------------------------------------------------------- THE DRAW ----------------------------------------------------------------- */
export function drawSupports(g, cx, cy, VW, time, plan) {
  for (const s of plan.supports) {
    if ((s.x1 + 1) * TS < cx - 140 || s.x0 * TS > cx + VW + 140) continue;
    const zone = zoneOf(s.x0);
    for (const e of s.ends) {
      if (e.how === 'post') { const h = (e.y1 - e.y0) * TS; if (h < 6) continue; const sp = spr('post', h, zone), off = e.mid ? 0 : e.x === s.x0 ? 2 : -2; g.drawImage(sp, R(e.x * TS + 8 - 5 + off - cx), R(e.y0 * TS - cy)); }
      else if (e.how === 'stay') { const x0 = e.x * TS + 8 - cx, y0 = (s.y + 1) * TS - cy, x1 = e.ax * TS + 8 - cx, y1 = e.ay * TS + 2 - cy, sag = Math.min(8, Math.abs(x1 - x0) * 0.08 + 1);
        g.lineWidth = 1; for (const [col, w] of [[OUTC, 3], [C.cord, 1]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.quadraticCurveTo(R((x0 + x1) / 2) + 0.5, R((y0 + y1) / 2 + sag) + 0.5, R(x1) + 0.5, R(y1) + 0.5); g.stroke(); }
        g.fillStyle = C.barkD; g.fillRect(R(x1) - 3, R(y1) - 1, 7, 3); g.fillStyle = C.bone; g.fillRect(R(x1) - 3, R(y1) - 2, 7, 1); g.fillRect(R(x0) - 1, R(y0) - 1, 3, 3); }
      else if (e.how === 'rock') { const sp = spr('bracket', 0), left = e.x === s.x0 && plan.solid(e.x - 1, s.y), right = e.x === s.x1 && plan.solid(e.x + 1, s.y);
        if (left || right) { g.save(); if (right) { g.translate(R(e.x * TS + 16 - cx), R((s.y + 1) * TS - cy)); g.scale(-1, 1); } else g.translate(R(e.x * TS - cx), R((s.y + 1) * TS - cy)); g.drawImage(sp, 0, 0); g.restore(); } }
    } }
}
const hairSpr = n => once('hair' + n, () => { const [c, g] = canvas(9, n); for (let i = 0; i < 4; i++) { const l = n - 1 - ((i * 3) % 4); rect(g, 1 + i * 2, 0, 1, l, i & 1 ? C.barkM : C.barkD); P(g, 1 + i * 2, l - 1, C.cord); } rect(g, 0, 0, 9, 1, C.barkD); return c; });
export function drawDress(g, cx, cy, VW, time, plan) {
  const items = plan.items; let lo = 0, hi = items.length; const xmin = cx - 140; while (lo < hi) { const m = (lo + hi) >> 1; if (items[m].x < xmin) lo = m + 1; else hi = m; }
  const wind = a => Math.sin(time * 1.6 + a) * 0.5 + Math.sin(time * 4.1 + a * 2) * 0.25;
  for (let i = lo; i < items.length; i++) { const it = items[i]; if (it.x > cx + VW + 40) break; const sx = R(it.x - cx), sy = R(it.y - cy); if (sy < -60 || sy > 440) continue;
    switch (it.k) {
      case 'leaves': { const s = spr('leaves', it.z, it.v); g.drawImage(s, sx - 7, sy - s.height + 1); break; }
      case 'bonescrap': { const s = spr('bonescrap', it.v & 1); g.drawImage(s, sx - 7, sy - s.height + 1); break; }
      case 'rack': { const s = spr('rack'); g.drawImage(s, sx - 10, sy - s.height + 1); break; }
      case 'lantern': { const s = spr('lantern'); g.drawImage(s, sx - 5, sy - s.height + 1); break; }
      case 'peg': { g.fillStyle = C.barkD; g.fillRect(sx + (it.side > 0 ? -7 : 0), sy, 7, 4); g.fillStyle = C.barkL; g.fillRect(sx + (it.side > 0 ? -7 : 0), sy, 7, 1); g.fillStyle = C.bone; g.fillRect(sx + (it.side > 0 ? -9 : 7), sy - 1, 2, 3); g.fillStyle = C.cord; g.fillRect(sx + (it.side > 0 ? -5 : 2), sy - 1, 2, 6); break; }
      case 'nailhide': { const hx = sx + (it.side > 0 ? -9 : 0); fillHide(g, hx, sy, 9, 12, C.hide, C.hideD); g.fillStyle = C.iron; g.fillRect(hx + 1, sy, 1, 1); g.fillRect(hx + 7, sy, 1, 1); break; }
      case 'skullnail': { const hx = sx + (it.side > 0 ? -7 : 0); g.fillStyle = C.bone; g.fillRect(hx, sy, 7, 6); g.fillRect(hx + 1, sy - 1, 5, 1); g.fillStyle = '#2a1a12'; g.fillRect(hx + 1, sy + 2, 2, 2); g.fillRect(hx + 4, sy + 2, 2, 2); g.fillStyle = C.boneD; g.fillRect(hx + 2, sy + 5, 3, 1); break; }
      case 'hair': { const s = hairSpr(it.n), sw = wind(it.ph); g.save(); g.translate(sx, sy); g.transform(1, 0, sw * 0.14, 1, 0, 0); g.drawImage(s, 0, 0); g.restore(); break; }
    } }
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const l of plan.lights) { if (l.x < cx - 70 || l.x > cx + VW + 70) continue; const f = 1 + (l.fl ? 0.12 * Math.sin(time * 9 + l.x) + 0.06 * Math.sin(time * 19 + l.x * 2) : 0); glow(g, R(l.x - cx), R(l.y - cy), R(l.r * f), l.a, l.c); }
  g.restore();
}
/* THE CHASMS: a mist that thickens into a dark with no bottom. The lip of each is told by its posts and its sign; here the drop itself reads as a drop. */
export function drawChasms(g, cx, cy, VW, VH, time, plan) {
  for (const c of plan.chasms) { const x0 = c.x0 * TS - cx, x1 = (c.x1 + 1) * TS - cx; if (x1 < -4 || x0 > VW + 4) continue; const y0 = c.lip * TS - cy, wd = x1 - x0, ytop = R(y0 + 4), hgt = Math.max(0, VH - ytop + 8); if (hgt <= 0) continue;
    g.save(); g.beginPath(); g.rect(R(x0), Math.max(0, ytop - 10), R(wd), VH); g.clip();
    /* the dark: nothing under it - a gradient from a violet haze at the lip to black */
    const gr = g.createLinearGradient(0, ytop, 0, ytop + 130); gr.addColorStop(0, 'rgba(110,80,140,0.0)'); gr.addColorStop(0.08, 'rgba(60,38,84,0.7)'); gr.addColorStop(0.3, 'rgba(18,10,28,0.94)'); gr.addColorStop(0.6, 'rgba(8,4,12,0.99)'); gr.addColorStop(1, 'rgba(4,2,8,1)');
    g.fillStyle = gr; g.fillRect(R(x0), ytop, R(wd), 130); g.fillStyle = 'rgba(4,2,8,1)'; g.fillRect(R(x0), ytop + 130, R(wd), Math.max(0, VH - ytop - 130 + 8));
    /* the mist: pale bands drifting across the drop, banded like a bank of cloud (a floor never looks like this) */
    for (let k = 0; k < 7; k++) { const by = ytop + 10 + k * 15 + Math.sin(time * 0.5 + k * 1.7) * 3, drift = Math.sin(time * 0.3 + k * 2.3) * 14, a = 0.22 - k * 0.032; if (a <= 0.02) continue;
      g.globalAlpha = a; g.fillStyle = k % 2 ? '#c4aadc' : '#e0d0ea'; for (let xx = -20; xx < wd + 20; xx += 22) { const ex = x0 + xx + drift + (k * 9 % 14), w = 26 + ((xx * 7 + k * 5) % 14); g.fillRect(R(ex), R(by + (xx % 3)), w, 3); g.fillRect(R(ex + 4), R(by - 1), w - 8, 1); g.fillRect(R(ex + 4), R(by + 3), w - 8, 1); } }
    g.globalAlpha = 1;
    /* leaves and spores falling, forever (a floor would stop them) */
    for (let k = 0; k < 9; k++) { const fx = x0 + ((k * 37 + 11) % Math.max(1, R(wd))), fy = ytop + ((time * (12 + k * 3) + k * 41) % 140); g.fillStyle = k % 3 === 0 ? '#e8b050' : k % 3 === 1 ? '#c8a8e0' : '#8a5a28'; g.globalAlpha = Math.max(0, 0.75 - (fy - ytop) / 190); g.fillRect(R(fx + Math.sin(time * 1.5 + k) * 3), R(fy), 2, 1); g.fillRect(R(fx + Math.sin(time * 1.5 + k) * 3) + 1, R(fy) + 1, 1, 1); }
    g.globalAlpha = 1; g.restore();
    /* the lip's own shadow: the near wall's edge is darkened where it drops */
    g.fillStyle = 'rgba(8,4,12,0.28)'; g.fillRect(R(x0), R(y0), 3, Math.max(0, VH - R(y0))); g.fillRect(R(x1) - 3, R(y0), 3, Math.max(0, VH - R(y0))); }
}
/* THE SPORE DROPS' sources: a root clump over each, a pod that swells on its told beat (src/main.js rockfall: timer < tellT) */
export function drawDrops(g, cx, cy, VW, time, plan, props) {
  const by = new Map(); for (const pr of (props || [])) if (pr.t === 'rockfall' && pr.spore) by.set(pr.x + ':' + pr.y, pr);
  for (const d of plan.drops) { const sx = R(d.x - cx); if (sx < -20 || sx > VW + 20) continue; const pr = by.get((d.x) + ':' + (d.y + 8)) || [...by.values()].find(q => Math.abs(q.x - d.x) < 12 && Math.abs(q.y - d.y) < 24);
    const swell = pr && pr.timer < (pr.tellT || 0.8); const s = spr('sporeDrop', swell ? 1 : 0), sy = R(d.y - cy); const wob = swell ? R(Math.sin(time * 40)) : 0;
    /* the root it hangs from runs up out of the frame */
    g.fillStyle = C.barkD; g.fillRect(sx - 3 + wob, -4, 6, Math.max(0, sy - 6 + 4)); g.fillStyle = C.barkM; g.fillRect(sx - 3 + wob, -4, 2, Math.max(0, sy - 6 + 4)); for (let yy = ((sy) % 11) - 11; yy < sy - 6; yy += 11) { g.fillStyle = C.barkD; g.fillRect(sx - 3 + wob, yy, 6, 1); }
    g.drawImage(s, sx - 11 + wob, sy - 6);
    if (swell) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, sx, sy + 8, 24, 0.35, '200,160,255'); g.restore(); } }
}
