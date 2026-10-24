// underleaf3_dress.js - UNDERLEAF 3's DRESSING (claude/underleafart): what stands on her ground and hangs from her boards.
//   decoOf(e)            the level's own sprinkled deco kinds (src/level.js KITS.underleaf: hideRack, barrels, fence, idol, cauldron, boneChime) redrawn in HER craft: no timber, no war camp -
//                        herb-drying racks on bone poles, clay storage jars, wattle-and-bone fences, a straw charm-doll, a little iron pot on embers, a bone chime on a pole
//   planDress / drawDress floor tufts and herb bushes, mushrooms, empty clay jars, bones and shards, briars in the hedges, ash and ladles in the yard, glow-caps under her leaf, strewn rushes in her room;
//                        and what hangs: herb bundles and bone charms under the drying boards and ceilings, lantern jars in the dark places (cached on the level, ~0 cost per frame)
// ART ONLY: the level hash is the greybox's (nothing here is level data: the plan is derived from the grid at the load).
import { canvas, mulberry } from '../px.js';
import { PAL, GLOW, CANDLE, JARC, zoneOf, hash, mix } from './underleaf3_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const rc = Math.round;
const halo = rgb => once('halo' + rgb, () => { const [c, g] = canvas(48, 48), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(' + rgb + ',0.5)'); gr.addColorStop(0.4, 'rgba(' + rgb + ',0.16)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return c; });
const BONE = ['#8a7c5e', '#cdbf9a', '#efe6c8'];

/* a leafy herb tuft: a fan of blades with now and then a flower; 20 x 14 */
const tuft = (z, v) => once('tf' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(20, 14), r = mulberry(v * 7 + z + 3), F = P.fung;
  for (let i = 0; i < 7; i++) { const x = 3 + i * 2 + ((r() * 2) | 0), h = 5 + ((r() * 7) | 0), lean = r() < 0.5 ? -1 : 1; for (let k = 0; k < h; k++) R(g, k > h - 3 ? F[2] : k > 2 ? F[1] : F[0], x + (k > h / 2 ? lean : 0), 13 - k, 1, 1); }
  if (z === 0 || z === 4) for (let i = 0; i < 2; i++) { const x = 4 + ((r() * 12) | 0), y = 2 + ((r() * 3) | 0); const col = v % 2 ? '#b08ac0' : '#f0ecd0'; R(g, col, x, y, 1, 1); R(g, col, x - 1, y + 1, 3, 1); R(g, '#e0b040', x, y + 1, 1, 1); R(g, F[1], x, y + 2, 1, 4); }
  return c; });
/* a taller herb: fennel / angelica with an umbel head; 20 x 34 */
const fennel = (z, v) => once('fn' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(22, 36), r = mulberry(v * 11 + 5), F = P.fung;
  for (const [x, h] of [[6, 22 + ((r() * 6) | 0)], [11, 30 + ((r() * 4) | 0)], [16, 20 + ((r() * 6) | 0)]]) { R(g, F[1], x, 35 - h, 1, h); R(g, F[0], x + 1, 35 - h + 4, 1, h - 4);
    for (let k = -4; k <= 4; k++) { R(g, z === 1 ? '#d8c068' : '#e8e4a8', x + k, 35 - h - 1 - (4 - Math.abs(k)) * 0.5, 1, 1); if (Math.abs(k) % 2 === 0) R(g, F[1], x + (k >> 1), 35 - h + 2, 1, 2); }
    for (let k = 4; k < h - 4; k += 6) { R(g, F[2], x - 3, 35 - k, 3, 1); R(g, F[2], x + 1, 35 - k - 2, 3, 1); } }
  return c; });
/* a clay jar standing empty or half-buried, with a leaf lid and twine; 12 x 14 */
const clayJar = v => once('cj' + v, () => { const [c, g] = canvas(13, 15), r = mulberry(v + 2), cl = ['#5a3a22', '#946238', '#c48a52'];
  for (let y = 3; y < 15; y++) { const t = (y - 3) / 11, w = Math.round(3 + 3 * Math.sin(Math.min(1, t * 1.3) * Math.PI * 0.6)); R(g, cl[1], 6 - w, y, w * 2, 1); R(g, cl[2], 6 - w, y, 2, 1); R(g, cl[0], 6 + w - 2, y, 2, 1); }
  R(g, cl[0], 3, 2, 7, 2); R(g, cl[2], 3, 2, 7, 1); R(g, '#3a2414', 4, 1, 5, 1);
  if (v % 2) { R(g, PAL[0].leaf[1], 3, 0, 7, 2); R(g, PAL[0].leaf[2], 3, 0, 3, 1); R(g, '#cbb888', 3, 3, 7, 1); }
  R(g, '#3a2414', 4, 7, 5, 1); R(g, '#3a2414', 3, 9, 1, 1); for (let i = 0; i < 4; i++) R(g, cl[0], 3 + ((r() * 7) | 0), 5 + ((r() * 8) | 0), 1, 1);
  return c; });
/* a mushroom pair (a scrap of the wood's own): 14 x 10 */
const mush = (z, v) => once('mu' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(14, 10), cp = ['#5a3a22', '#a8683a', '#d89458'];
  for (const [x, h, w] of [[4, 6, 3], [10, 4, 2]]) { R(g, '#d8ccac', x, 9 - h, 1, h); R(g, '#a8987c', x + 1, 9 - h, 1, h); R(g, cp[0], x - w, 9 - h - 1, w * 2 + 2, 2); R(g, cp[1], x - w + 1, 9 - h - 2, w * 2, 2); R(g, cp[2], x - w + 1, 9 - h - 2, w, 1); R(g, '#f0e6c8', x + 1, 9 - h - 2, 1, 1); }
  if (z === 4 || z === 3) R(g, GLOW.c, 5, 3, 1, 1); void P; void v; return c; });
/* a glow-cap: a pale capped fungus with a green-gold glow (the great leaf's own lanterns); 14 x 14 */
const glowcap = v => once('gc' + v, () => { const [c, g] = canvas(14, 14), r = mulberry(v + 31);
  for (const [x, h] of [[4, 7 + ((r() * 3) | 0)], [9, 5 + ((r() * 3) | 0)]]) { R(g, '#b8c8a0', x, 13 - h, 2, h); R(g, GLOW.mid, x - 3, 13 - h - 3, 8, 3); R(g, GLOW.c, x - 2, 13 - h - 4, 6, 2); R(g, GLOW.hi, x - 1, 13 - h - 4, 2, 1); R(g, GLOW.lo, x - 3, 13 - h, 8, 1); }
  return c; });
/* bones and shards on the ground; 16 x 8 */
const bones = v => once('bn' + v, () => { const [c, g] = canvas(18, 9), r = mulberry(v * 3 + 1);
  R(g, BONE[1], 2, 6, 8, 2); R(g, BONE[2], 2, 6, 8, 1); R(g, BONE[1], 0, 5, 3, 3); R(g, BONE[1], 9, 5, 3, 3); R(g, BONE[0], 3, 8, 7, 1);
  if (v % 2) { R(g, BONE[1], 12, 3, 5, 5); R(g, BONE[2], 12, 3, 5, 1); R(g, '#1b1626', 13, 5, 1, 1); R(g, '#1b1626', 15, 5, 1, 1); R(g, BONE[0], 13, 8, 3, 1); }
  else { for (let i = 0; i < 3; i++) { R(g, '#b89268', 11 + i * 2, 6 - (i % 2), 2, 2); R(g, '#8a6a4a', 11 + i * 2, 7, 2, 1); } }
  void r; return c; });
/* a bramble clump (the hedges' floor): dark canes with pale thorns; 26 x 14 */
const brier = v => once('br' + v, () => { const [c, g] = canvas(26, 14), r = mulberry(v * 17 + 4);
  for (let i = 0; i < 5; i++) { let x = 1 + i * 5, y = 13; const dir = i % 2 ? 1 : -1; for (let k = 0; k < 9 + ((r() * 5) | 0); k++) { R(g, '#2a180c', x, y, 2, 1); R(g, '#4a2a16', x, y, 1, 1); if (k % 3 === 1) { R(g, '#e8dcc0', x + (dir > 0 ? 2 : -1), y - 1, 1, 1); } y--; x += dir * (k % 2); if (y < 1) break; } }
  for (let i = 0; i < 14; i++) R(g, i % 3 ? '#243a16' : '#386a24', 2 + ((r() * 22) | 0), 3 + ((r() * 10) | 0), 2, 1);
  R(g, '#14100c', 0, 13, 26, 1); return c; });
/* a sheaf of dried herbs leaned on its heel; 14 x 22 (the lofts) */
const sheaf = v => once('sh' + v, () => { const [c, g] = canvas(16, 24), r = mulberry(v * 5 + 9), P = PAL[1];
  for (let i = 0; i < 9; i++) { const x0 = 6 + ((r() * 5) | 0) - 2, top = 2 + ((r() * 6) | 0), lean = (i - 4) * 0.35; for (let y = top; y < 23; y++) R(g, y < top + 5 ? P.rush[2] : y % 5 === 0 ? P.rush[0] : P.rush[1], x0 + Math.round(lean * (23 - y) / 4), y, 1, 1); }
  R(g, '#cbb888', 3, 14, 10, 2); R(g, '#a8946a', 4, 15, 8, 1); return c; });
/* an ash heap with a live ember, a ladle stuck in it; 22 x 12 (the yard) */
const ashHeap = v => once('ah' + v, () => { const [c, g] = canvas(24, 13), r = mulberry(v + 12);
  for (let y = 4; y < 13; y++) { const w = Math.round(3 + (y - 4) * 1.2); R(g, y < 7 ? '#6a6258' : '#3a342e', 12 - w, y, w * 2, 1); } for (let i = 0; i < 6; i++) R(g, '#8a8278', 5 + ((r() * 14) | 0), 5 + ((r() * 6) | 0), 1, 1);
  R(g, CANDLE.mid, 9, 8, 2, 1); R(g, CANDLE.c, 10, 7, 1, 1); R(g, '#e8dcc0', 16, 0, 1, 8); R(g, '#b89a58', 14, 0, 4, 3); R(g, '#7a5a2a', 14, 0, 4, 1); return c; });
/* a strewn rush bed / a hearth rug (her room); 28 x 6 */
const rushes = v => once('rs' + v, () => { const [c, g] = canvas(30, 7), r = mulberry(v * 3 + 5), P = PAL[5];
  for (let i = 0; i < 16; i++) { const x = (r() * 28) | 0, h = 1 + ((r() * 2) | 0); R(g, r() < 0.5 ? P.rush[1] : P.rush[2], x, 6 - h, 1 + ((r() * 3) | 0), 1); } R(g, P.rush[0], 0, 6, 30, 1); return c; });
/* HANGING: a herb bundle (12 x 28), a bone charm (12 x 26), a lantern jar (10 x 26) */
const hBundle = (z, v) => once('hb' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(12, 28), r = mulberry(v * 5 + z); R(g, '#7a6240', 5, 0, 1, 8); R(g, '#cbb888', 4, 6, 3, 2);
  const lc = z === 1 ? [P.rush[1], P.rush[2], P.leaf[1]] : [P.leaf[0], P.leaf[1], P.leaf[2]]; for (let j = 0; j < 17; j++) { const w = Math.max(2, 8 - (j >> 1)); R(g, lc[(j + v) % 3 === 0 ? 2 : j % 4 === 0 ? 0 : 1], 6 - (w >> 1), 8 + j, w, 1); if (r() < 0.2) R(g, '#b08ac0', 6 - (w >> 1) + ((r() * w) | 0), 8 + j, 1, 1); } return c; });
const hCharm = v => once('hc' + v, () => { const [c, g] = canvas(14, 28), r = mulberry(v * 7 + 3); R(g, '#5a4430', 6, 0, 1, 10); R(g, '#cbb888', 4, 9, 5, 1);
  for (let k = 0; k < 3; k++) { const x = 3 + k * 3, len = 8 + ((r() * 8) | 0); R(g, '#7a6240', x + 1, 10, 1, 3); R(g, BONE[1], x, 12, 2, len); R(g, BONE[2], x, 12, 1, len); R(g, BONE[0], x, 12 + len, 2, 1); }
  R(g, '#a85a3a', 6, 14, 1, 7); R(g, '#d89458', 5, 18, 3, 2); return c; });
const hLantern = (col, v) => once('hl' + col + v, () => { const [c, g] = canvas(12, 28), J = col === 'glow' ? [GLOW.mid, GLOW.c, GLOW.lo, GLOW.hi] : JARC[col]; R(g, '#5a4430', 5, 0, 1, 12 + (v % 3) * 2); const y = 12 + (v % 3) * 2;
  R(g, '#cbb888', 3, y - 2, 5, 2); R(g, '#8a98a0', 2, y, 8, 11); R(g, J[0], 3, y + 1, 6, 9); R(g, J[1], 3, y + 1, 2, 6); R(g, J[3], 3, y + 2, 1, 2); R(g, J[2], 8, y + 1, 1, 9); R(g, '#8a5a2a', 3, y - 3, 5, 1); return c; });

/* ------------------------------------------------------------------ the level's own deco kinds, redrawn ------------------------------------------------------------------ */
/* a drying rack: two bone poles, a twine-lashed rush rod across, herb bundles of three kinds hung at different lengths; 44 x 36 */
const rack = (z, v) => once('rk' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(46, 38), r = mulberry(v * 11 + z + 1);
  for (const px0 of [3, 41]) { R(g, BONE[1], px0, 2, 3, 36); R(g, BONE[2], px0, 2, 1, 36); R(g, BONE[0], px0 + 2, 2, 1, 36); R(g, BONE[1], px0 - 1, 0, 5, 2); R(g, '#cbb888', px0, 6, 3, 2); }
  R(g, P.rush[1], 3, 5, 41, 2); R(g, P.rush[2], 3, 5, 41, 1); R(g, '#cbb888', 6, 4, 2, 4); R(g, '#cbb888', 39, 4, 2, 4);
  const n = 5 + (v % 2); for (let k = 0; k < n; k++) { const x = 8 + k * (31 / n), len = 11 + ((r() * 12) | 0), kind = (k + v) % 3, col = kind === 0 ? [P.leaf[0], P.leaf[1], P.leaf[2]] : kind === 1 ? [P.rush[0], P.rush[1], P.rush[2]] : ['#5a3a6a', '#8a64a0', '#b08ac0'];
    R(g, '#cbb888', x, 7, 1, 2); for (let j = 0; j < len; j++) { const w = Math.max(2, 6 - (j >> 2)); R(g, j % 4 === 0 ? col[0] : j % 3 === 0 ? col[2] : col[1], x + 1 - (w >> 1), 9 + j, w, 1); } }
  return c; });
/* clay storage jars, two or three, one lidded with a leaf, one open and full of dried stuff; 30 x 22 */
const jarsDeco = v => once('jd' + v, () => { const [c, g] = canvas(32, 24), cl = ['#5a3a22', '#946238', '#c48a52'];
  const big = (x, w, h, lid) => { for (let y = 0; y < h; y++) { const t = y / h, ww = Math.round(w * (0.5 + 0.5 * Math.sin(Math.min(1, t * 1.2 + 0.1) * Math.PI * 0.62))); R(g, cl[1], x - ww, 23 - h + y, ww * 2, 1); R(g, cl[2], x - ww, 23 - h + y, 2, 1); R(g, cl[0], x + ww - 3, 23 - h + y, 3, 1); } R(g, cl[0], x - w + 2, 22 - h, w * 2 - 4, 2); R(g, cl[2], x - w + 2, 22 - h, w * 2 - 4, 1);
    R(g, '#3a2414', x - 3, 23 - h + 5, 6, 1); R(g, '#3a2414', x - 4, 23 - h + 8, 1, 1);
    if (lid) { R(g, PAL[0].leaf[1], x - w + 2, 20 - h, w * 2 - 4, 2); R(g, PAL[0].leaf[2], x - w + 2, 20 - h, 4, 1); R(g, '#cbb888', x - w + 3, 22 - h, w * 2 - 6, 1); } else { R(g, '#a8883a', x - w + 3, 21 - h, w * 2 - 6, 2); R(g, '#d0b050', x - w + 4, 20 - h, 3, 1); } };
  big(10, 8, 18, v % 2 === 0); big(24, 6, 13, v % 2 === 1); R(g, '#14100c', 0, 23, 32, 1); return c; });
/* a wattle-and-bone fence: woven rush between bone stakes, the stake tops pale; 28 x 20 */
const fence = v => once('fe' + v, () => { const [c, g] = canvas(30, 22), P = PAL[0];
  for (const x of [2, 14, 26]) { R(g, BONE[1], x, 3, 3, 19); R(g, BONE[2], x, 3, 1, 19); R(g, BONE[0], x + 2, 3, 1, 19); R(g, BONE[2], x, 1, 3, 2); R(g, BONE[1], x + 1, 0, 1, 1); }
  for (let y = 8; y < 21; y += 3) for (let x = 0; x < 30; x++) R(g, (x + y) % 6 < 3 ? P.rush[1] : P.rush[0], x, y + ((x >> 2) % 2), 1, 2);
  for (let y = 8; y < 21; y += 3) R(g, P.rush[2], 0, y, 30, 1); return c; });
/* a charm-doll: bound straw, a bone head with painted eyes, moss hair, charms hung, on a bone pole; 14 x 28 */
const doll = v => once('dl' + v, () => { const [c, g] = canvas(16, 30), P = PAL[0];
  R(g, BONE[1], 7, 14, 2, 16); R(g, BONE[0], 8, 14, 1, 16);
  R(g, P.rush[2], 3, 15, 10, 2); R(g, P.rush[1], 5, 17, 6, 7); R(g, P.rush[2], 5, 17, 2, 7); R(g, P.rush[0], 9, 17, 2, 7); R(g, '#cbb888', 5, 20, 6, 1); R(g, '#a85a3a', 6, 21, 4, 1);
  R(g, BONE[1], 5, 8, 6, 6); R(g, BONE[2], 5, 8, 6, 1); R(g, '#1b1626', 6, 10, 1, 2); R(g, '#1b1626', 9, 10, 1, 2); R(g, GLOW.c, 6, 10, 1, 1); R(g, GLOW.c, 9, 10, 1, 1); R(g, '#1b1626', 7, 13, 2, 1);
  R(g, P.fung[1], 4, 6, 8, 3); R(g, P.fung[2], 5, 5, 4, 2); R(g, P.fung[0], 10, 7, 2, 4);
  R(g, BONE[1], 3, 18, 1, 5); R(g, BONE[1], 12, 18, 1, 5); return c; });
/* a little iron cauldron on embers (the deco): 24 x 22 */
const potDeco = () => once('pd', () => { const [c, g] = canvas(26, 24);
  R(g, '#2a2420', 3, 18, 3, 6); R(g, '#2a2420', 20, 18, 3, 6); for (let y = 5; y < 20; y++) { const t = (y - 5) / 15, w = Math.round(10 * Math.sin(Math.min(1, 0.4 + t * 0.7) * Math.PI / 2 + 0.3)); R(g, '#34302a', 13 - w, y, w * 2, 1); R(g, '#5a544c', 13 - w, y, 2, 1); R(g, '#1a1612', 13 + w - 2, y, 2, 1); }
  R(g, '#56504a', 2, 4, 22, 3); R(g, '#8a8070', 2, 4, 22, 1); R(g, GLOW.lo, 3, 3, 20, 2); R(g, GLOW.mid, 4, 3, 18, 1); R(g, '#46403a', 0, 6, 3, 2); R(g, '#46403a', 23, 6, 3, 2); R(g, '#ff9a5c', 8, 21, 3, 2); R(g, '#ffd36b', 15, 21, 3, 2); return c; });
/* a bone chime on a pole: bones and a skull-charm hanging from a crossbar, a feather; 16 x 30 */
const chime = v => once('bc' + v, () => { const [c, g] = canvas(18, 32);
  R(g, BONE[1], 8, 4, 2, 28); R(g, BONE[0], 9, 4, 1, 28); R(g, BONE[1], 2, 3, 14, 2); R(g, BONE[2], 2, 3, 14, 1);
  for (let k = 0; k < 4; k++) { const x = 3 + k * 4, len = 6 + (k % 2) * 4; R(g, '#7a6240', x, 5, 1, 3); R(g, BONE[1], x - 1, 8, 3, len); R(g, BONE[2], x - 1, 8, 1, len); }
  R(g, '#a85a3a', 15, 4, 1, 9); R(g, '#d89458', 14, 9, 3, 2); return c; });
/* a cooking fire: three bone poles lashed into a tripod, a little pot hung over a ring of stones and a low fire; 26 x 26 */
const spit = () => once('cs', () => { const [c, g] = canvas(28, 28);
  for (const [x0, x1] of [[4, 12], [23, 15], [14, 14]]) { const n = 20; for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = 26 - i; R(g, BONE[1], x, y, 2, 1); R(g, BONE[0], x + 1, y, 1, 1); } }
  R(g, '#cbb888', 12, 4, 5, 2); R(g, '#5a4430', 14, 6, 1, 4);
  R(g, '#34302a', 10, 10, 10, 6); R(g, '#5a544c', 10, 10, 10, 1); R(g, '#1a1612', 18, 11, 2, 5); R(g, GLOW.mid, 11, 10, 8, 1);
  for (let i = 0; i < 7; i++) { R(g, '#5a5048', 5 + i * 3, 25 - (i % 2), 3, 3); R(g, '#8a8070', 5 + i * 3, 25 - (i % 2), 3, 1); }
  R(g, '#ff9a5c', 11, 21, 3, 4); R(g, '#d8502a', 15, 22, 3, 3); R(g, '#ffd36b', 12, 22, 1, 3); return c; });
/* a heap of her stores: herb sacks tied at the neck, a broken jar, a coil of twine; 34 x 20 */
const heap = v => once('lh' + v, () => { const [c, g] = canvas(34, 20), P = PAL[1], cl = ['#5a3a22', '#946238', '#c48a52'];
  const sack = (x, w, h) => { for (let y = 0; y < h; y++) { const t = y / h, ww = Math.round(w * (0.55 + 0.45 * Math.sin(Math.min(1, t * 1.3 + 0.2) * Math.PI * 0.55))); R(g, P.rush[1], x - ww, 19 - h + y, ww * 2, 1); R(g, P.rush[2], x - ww, 19 - h + y, 2, 1); R(g, P.rush[0], x + ww - 2, 19 - h + y, 2, 1); } R(g, '#cbb888', x - 2, 19 - h + 2, 5, 1); R(g, P.rush[0], x - 2, 18 - h, 5, 2); R(g, P.leaf[1], x - 1, 17 - h, 3, 2); };
  sack(9, 7, 14); sack(21, 6, 11); sack(15, 6, 8); for (let i = 0; i < 4; i++) { R(g, cl[1], 26 + i * 2, 15 + (i % 2), 2, 3); R(g, cl[2], 26 + i * 2, 15 + (i % 2), 2, 1); } R(g, '#cbb888', 28, 12, 5, 2); R(g, '#a8946a', 29, 13, 3, 1); return c; });
/* decoOf(e): [sprite, bg flag] in main.js's deco table form, for the kinds this level's art owns; null = the shared kit draws it */
export function decoOf(e) {
  const z = zoneOf(e.x), v = e.v || 0;
  switch (e.kind) {
    case 'hideRack': return [rack(z, v), true];
    case 'barrels': return [jarsDeco(v), false];
    case 'fence': return [fence(v), true];
    case 'idol': return [doll(v), false];
    case 'cauldron': return [potDeco(), false];
    case 'boneChime': return [chime(v), true];
    case 'cookSpit': return [spit(), false];
    case 'lootHeap': return [heap(v), false];
    default: return null;
  }
}

/* ------------------------------------------------------------------ the plan: what stands on the ground and hangs from the boards ------------------------------------------------------------------ */
const plans = new WeakMap();
export function planDress(L, T) {
  if (plans.has(L)) return plans.get(L);
  const W = L.W, H = L.H, gr = L.grid, ar = L.arena, items = [], busy = new Set(), at = (x, y) => gr[y * W + x], solid = (x, y) => at(x, y) === T.SOLID, air = (x, y) => at(x, y) === T.AIR;
  /* keep the floor clear where the level has something to read: a shelf, a bed, a well, a sign, a shrine, a hedge, a door */
  for (const e of L.ents || []) { if (!['jarshelf', 'brewpot', 'vinebed', 'floatwell', 'sign', 'check', 'gate', 'silver', 'grandmother'].includes(e.t)) continue; for (let k = -2; k <= 2; k++) busy.add(e.x + k); }
  for (const e of L.ents || []) if (e.t === 'thornhedge') for (let k = e.x0 - 2; k <= e.x1 + 2; k++) busy.add(k);
  for (let x = 3; x < W - 3; x++) { const z = zoneOf(x);
    for (let y = 2; y < H - 1; y++) { const h = hash(x, y * 3 + 1), p = h % 100, q = (h >> 12) % 100, v = (h >> 8) % 3;
      if (solid(x, y) && air(x, y - 1) && air(x, y - 2) && air(x, y - 3)) {   /* a floor with headroom */
        if (busy.has(x)) continue; const dens = [34, 26, 30, 26, 32, 20][z]; if (p >= dens) continue; let k = null;
        if (z === 0) k = q < 35 ? 'tuft' : q < 55 ? 'fennel' : q < 72 ? 'jar' : q < 88 ? 'mush' : 'bones';
        else if (z === 1) k = q < 30 ? 'sheaf' : q < 55 ? 'tuft' : q < 75 ? 'jar' : q < 90 ? 'fennel' : 'bones';
        else if (z === 2) k = q < 55 ? 'brier' : q < 72 ? 'bones' : q < 85 ? 'mush' : 'jar';
        else if (z === 3) k = q < 35 ? 'ash' : q < 60 ? 'jar' : q < 78 ? 'bones' : q < 90 ? 'tuft' : 'mush';
        else if (z === 4) k = q < 40 ? 'glowcap' : q < 70 ? 'tuft' : q < 85 ? 'mush' : 'fennel';
        else k = 'rush';
        if (k) items.push({ x: x * 16 + 8 + ((h >> 4) % 5) - 2, y: y * 16, k, z, v, ph: (h % 628) / 100 }); }
      else if ((solid(x, y) || at(x, y) === T.ONEWAY) && air(x, y + 1) && air(x, y + 2) && air(x, y + 3)) {   /* a ceiling or a drying board with room under it */
        const board = at(x, y) === T.ONEWAY, dens = [board ? 22 : 8, board ? 34 : 10, board ? 14 : 14, board ? 16 : 14, board ? 12 : 14, 0][z]; if (p >= dens) continue;
        const k = z <= 1 ? (q < 70 ? 'hbundle' : 'hcharm') : z === 2 ? (q < 50 ? 'hcharm' : q < 80 ? 'hlantern' : 'hbundle') : z === 3 ? (q < 50 ? 'hlantern' : q < 80 ? 'hbundle' : 'hcharm') : (q < 60 ? 'hlantern' : 'hbundle');
        items.push({ x: x * 16 + 8, y: (y + 1) * 16 - (board ? 8 : 0), k, z, v, ph: (h % 628) / 100, hang: true }); } } }
  items.sort((a, b) => a.x - b.x); plans.set(L, items); return items;
}
export function drawDress(g, cx, cy, VW, time, plan) {
  let lo = 0, hi = plan.length; const xmin = cx - 40; while (lo < hi) { const m = (lo + hi) >> 1; if (plan[m].x < xmin) lo = m + 1; else hi = m; }
  for (let i = lo; i < plan.length; i++) { const it = plan[i]; if (it.x > cx + VW + 40) break; const sx = rc(it.x - cx), sy = rc(it.y - cy); if (sy < -40 || sy > 420) continue; let sp = null, ox = 0, oy = 0, glow = null;
    switch (it.k) {
      case 'tuft': sp = tuft(it.z, it.v); ox = 10 - rc(Math.sin(time * 1.1 + it.ph) * 0.6); oy = 14; break;
      case 'fennel': sp = fennel(it.z, it.v); ox = 11 - rc(Math.sin(time * 0.9 + it.ph) * 0.8); oy = 36; break;
      case 'jar': sp = clayJar(it.v); ox = 6; oy = 15; break;
      case 'mush': sp = mush(it.z, it.v); ox = 7; oy = 10; break;
      case 'bones': sp = bones(it.v % 2); ox = 9; oy = 9; break;
      case 'brier': sp = brier(it.v); ox = 13; oy = 14; break;
      case 'sheaf': sp = sheaf(it.v); ox = 8; oy = 24; break;
      case 'ash': sp = ashHeap(it.v); ox = 12; oy = 13; glow = CANDLE.rgb; break;
      case 'glowcap': sp = glowcap(it.v); ox = 7; oy = 14; glow = GLOW.rgb; break;
      case 'rush': sp = rushes(it.v); ox = 15; oy = 7; break;
      case 'hbundle': sp = hBundle(it.z, it.v); ox = 6 - rc(Math.sin(time * 0.7 + it.ph)); oy = 0; break;
      case 'hcharm': sp = hCharm(it.v); ox = 7 - rc(Math.sin(time * 0.8 + it.ph) * 1.2); oy = 0; break;
      case 'hlantern': sp = hLantern(it.z === 4 ? 'glow' : ['glow', 'green', 'blue', 'red'][(it.v + it.z) % 4], it.v); ox = 6; oy = 0; glow = 'L'; break;
      default: continue; }
    g.drawImage(sp, sx - ox, sy - oy);
    if (glow) { const tw = 0.6 + 0.4 * Math.sin(time * 1.8 + it.ph); g.save(); g.globalCompositeOperation = 'lighter';
      if (glow === 'L') { const col = (it.z === 4 ? 'glow' : ['glow', 'green', 'blue', 'red'][(it.v + it.z) % 4]); g.globalAlpha = 0.32 * tw; g.drawImage(halo(col === 'glow' ? GLOW.rgb : JARC[col][0].slice(1).match(/../g).map(q => parseInt(q, 16)).join(',')), sx - 20, sy + 8, 40, 36); }
      else { g.globalAlpha = 0.3 * tw; g.drawImage(halo(glow), sx - 18, sy - oy - 8, 36, 30); } g.restore(); g.globalAlpha = 1; } }
}
export function warmDress() { for (let z = 0; z < 6; z++) for (let v = 0; v < 3; v++) { tuft(z, v); mush(z, v); hBundle(z, v); } for (let v = 0; v < 3; v++) { clayJar(v); hCharm(v); rack(0, v); jarsDeco(v); fence(v); doll(v); chime(v); } potDeco(); spit(); heap(0); heap(1); halo(CANDLE.rgb); halo(GLOW.rgb); }
