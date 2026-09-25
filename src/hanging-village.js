// ============================================================================================
// THE HANGING VILLAGE: ITS OWN LOOK, FLOOR BY FLOOR (docs/briefs/hanging-village-rework.md §2).
// The review found every tier the same picture - one grass slab over one plank band, one stilt house, and no cliff anywhere,
// so the "town on a cliff" read as slabs in the sky. This gives each floor its own ground (top, rock, the bough's underside and
// its ledges), its own ground scatter, and draws the CLIFF FACE the whole village hangs from behind it, strata changing with
// height, with each floor's landmark on it. Everything here is art: the level's shape is in src/level.js (hangingVillage).
//   hvGround(look)                   -> the SET2 shape resolveTiles() reads (as crag_redress's bakeCragGround), plus `under`
//                                       (the bough's underside) and `kit` (the ground scatter and its sprites)
//   drawHangingBack(g, L, cx, cy, t) -> the cliff face and the landmarks, world-anchored, behind the tiles
//   hvDeco(kind)                     -> the floors' own hand-placed props (a rope coil, a hemp bale, flour sacks)
// A floor's look is named by L.groundZones ([{ y0, y1, look }], in tile rows) and read here by name.
// ============================================================================================
import { canvas, px, rect, fillPoly, line, ellipse, circle, mulberry, rgb, hex, shade } from './px.js';

const T = 16;
/* THE SEVEN FLOORS AND THE HOLLOW. r: the rock's strata, top to deep. face: the cliff behind, a step darker so it sits back. */
export const HV_LOOKS = {
  roots:   { r: ['#46504a', '#525e56', '#3c453f', '#2f3631'], face: ['#262c28', '#2c342e', '#20261f', '#1a1f1b'], surf: 'moss', a: '#3e6a34', b: '#62904a', d: '#27451f', soil: '#231c16', rim: '#6a7a68', under: 'roots', ledge: 'root' },
  rope:    { r: ['#8c6c48', '#9c7c56', '#7c5e3e', '#6a5034'], face: ['#6e5438', '#7a5e40', '#624a32', '#54402a'], surf: 'hemp', a: '#b89858', b: '#d8bc78', d: '#7a6038', soil: '#5a4430', rim: '#d8b888', under: 'lashed', ledge: 'lashed' },
  market:  { r: ['#aa9470', '#baa47e', '#9a8462', '#887252'], face: ['#8e7a5c', '#9a8664', '#806c50', '#6e5c44'], surf: 'cobble', a: '#9a8c78', b: '#c0b29a', d: '#5a5048', soil: '#6a5a46', rim: '#e8d8b0', under: 'joist', ledge: 'awning' },
  mill:    { r: ['#c2beb0', '#d0ccbe', '#b0ac9e', '#9e9a8e'], face: ['#a4a094', '#b0ac9e', '#96928a', '#88847a'], surf: 'chalk', a: '#88a45a', b: '#b4cc7e', d: '#5e7a3a', soil: '#b8b4a6', rim: '#f4f0e4', under: 'corbel', ledge: 'slab' },
  rook:    { r: ['#6e7078', '#7e8088', '#60626a', '#52545c'], face: ['#585a62', '#62646c', '#4e5058', '#44464e'], surf: 'guano', a: '#6a8450', b: '#8aa468', d: '#465a36', soil: '#4a4c52', rim: '#b8bcc4', under: 'logs', ledge: 'branch' },
  lantern: { r: ['#3c3e52', '#46485e', '#34364a', '#2c2e40'], face: ['#2c2e3e', '#323446', '#262838', '#202230'], surf: 'slate', a: '#4a4c62', b: '#6a6c84', d: '#26283a', soil: '#2a2c3a', rim: '#d8a860', under: 'dark', ledge: 'hook' },
  crown:   { r: ['#6c5c4c', '#7c6c5a', '#5e4e40', '#504236'], face: ['#5a4c40', '#645446', '#4e4238', '#44382e'], surf: 'needles', a: '#8a6a3a', b: '#b08a50', d: '#5a4428', soil: '#4a3a2c', rim: '#d8c8a8', under: 'bark', ledge: 'bark' },
  hollow:  { r: ['#3c3028', '#46382e', '#342a22', '#2a211b'], face: ['#241c17', '#2a211b', '#201813', '#1a1410'], surf: 'web', a: '#5a4a3e', b: '#d8d0c0', d: '#2e241c', soil: '#2a2019', rim: '#8a7a6a', under: 'roots', ledge: 'web' },
};

const tile = fn => { const [c, g] = canvas(T, T); fn(g); return c; };
const wave = (x, s) => Math.round(Math.sin((x + s * 7) * 0.45) * 0.8 + Math.sin((x + s * 3) * 0.19) * 0.9);
function strata(g, r, rnd, s, y0 = 0) {
  const band = [r[0], r[1], r[0], r[2], r[0], r[3]];
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) px(g, x, y, band[(((y + y0 + wave(x, s) + 24) / 4) | 0) % band.length]);
  for (let k = 0; k < 10; k++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? r[3] : r[1]);
}
/* THE TOP OF A FLOOR: what you stand on says which floor you are on */
function surface(g, P, rnd) {
  const s = P.surf;
  if (s === 'moss') { for (let x = 0; x < T; x++) { const d = 2 + ((rnd() * 3) | 0); rect(g, x, 0, 1, d, P.a); px(g, x, d, P.d); if (rnd() < 0.4) px(g, x, 0, P.b); }
    for (let k = 0; k < 2; k++) { let x = (rnd() * T) | 0; for (let y = 3; y < 9; y++) { px(g, x, y, '#4a3424'); if (rnd() < 0.4) x += rnd() < 0.5 ? -1 : 1; } }   /* a root through the turf */
    if (rnd() < 0.5) px(g, 3 + ((rnd() * 10) | 0), 1, '#a8e0c8'); }   /* a bead of water */
  else if (s === 'hemp') { rect(g, 0, 0, T, 4, P.soil); for (let x = 0; x < T; x++) { if (rnd() < 0.6) px(g, x, 0, P.a); if (rnd() < 0.3) px(g, x, 1, P.b); }
    for (let k = 0; k < 3; k++) { const x = (rnd() * 12) | 0, y = (rnd() * 3) | 0; line(g, x, y, x + 3, y + ((rnd() * 2) | 0), P.b); } }   /* loose hemp strands on packed earth */
  else if (s === 'cobble') { rect(g, 0, 0, T, 6, P.d); for (let k = 0, x = -((rnd() * 3) | 0); x < T; k++) { const w = 3 + ((rnd() * 2) | 0), y = k % 2; rect(g, x + 1, y, w - 1, 3, P.a); px(g, x + 1, y, P.b); px(g, x + 2, y, P.b); x += w; }
    for (let k = 0, x = -((rnd() * 2) | 0); x < T; k++) { const w = 3 + ((rnd() * 2) | 0); rect(g, x + 1, 3 + (k % 2), w - 1, 2, P.a); x += w; } }
  else if (s === 'chalk') { rect(g, 0, 0, T, 5, P.soil); for (let x = 0; x < T; x++) { const d = 1 + ((rnd() * 2) | 0); rect(g, x, 0, 1, d, P.a); if (rnd() < 0.5) px(g, x, 0, P.b); }
    for (let k = 0; k < 2; k++) { const x = 2 + ((rnd() * 11) | 0), y = 6 + ((rnd() * 7) | 0); rect(g, x, y, 2, 2, '#3a3a44'); px(g, x, y, '#6a6a78'); } }   /* flint in the chalk */
  else if (s === 'guano') { rect(g, 0, 0, T, 2, P.soil); for (let x = 0; x < T; x++) if (rnd() < 0.35) { rect(g, x, 0, 1, 1 + ((rnd() * 2) | 0), P.a); if (rnd() < 0.4) px(g, x, 0, P.b); }
    for (let k = 0; k < 5; k++) px(g, (rnd() * T) | 0, (rnd() * 6) | 0, '#e8e8e0'); rect(g, 0, 2, T, 1, P.r[3]); }   /* granite flags, white-spattered */
  else if (s === 'slate') { rect(g, 0, 0, T, 3, P.a); rect(g, 0, 0, T, 1, P.b); for (let x = (rnd() * 6) | 0; x < T; x += 5 + ((rnd() * 4) | 0)) rect(g, x, 0, 1, 3, P.d);
    if (rnd() < 0.5) { const x = (rnd() * 12) | 0; rect(g, x, 1, 3, 1, '#4a6a4a'); } }   /* dark slate flags, a thread of moss in a joint */
  else if (s === 'needles') { rect(g, 0, 0, T, 3, P.soil); for (let k = 0; k < 10; k++) { const x = (rnd() * 15) | 0, y = (rnd() * 3) | 0; px(g, x, y, rnd() < 0.5 ? P.a : P.b); px(g, x + 1, y + (rnd() < 0.5 ? 0 : 1), P.a); } }
  else if (s === 'web') { rect(g, 0, 0, T, 2, P.soil); for (let k = 0; k < 3; k++) { const x = (rnd() * 12) | 0; line(g, x, 0, x + 4, 2, P.b); } }
}
function topTile(P, seed, eL, eR) { const rnd = mulberry(seed);
  return tile(g => { strata(g, P.r, rnd, seed, 6); surface(g, P, rnd);
    for (const [open, side] of [[eL, 0], [eR, 1]]) { if (!open) continue; const x = side ? T - 1 : 0;
      g.clearRect(x, 0, 1, 1); rect(g, x, 6, 1, T - 6, side ? P.r[3] : P.rim); } }); }
function edgeTile(P, seed, eL, eR) { const rnd = mulberry(seed);
  return tile(g => { strata(g, P.r, rnd, seed, 0);
    if (eL) { rect(g, 0, 0, 1, T, P.rim); rect(g, 1, 0, 1, T, P.r[1]); }
    if (eR) { rect(g, T - 1, 0, 1, T, P.r[3]); rect(g, T - 2, 0, 1, T, P.r[2]); } }); }
function fillTile(P, seed) { const rnd = mulberry(seed); return tile(g => strata(g, P.r, rnd, seed, 0)); }
/* THE UNDERSIDE OF A BOUGH: what you see over your head from the floor below. Timber on the working floors, stone on the mill's */
function underTile(P, seed) { const rnd = mulberry(seed), u = P.under;
  return tile(g => { strata(g, P.r, rnd, seed, 0);
    if (u === 'roots') { for (let k = 0; k < 4; k++) { let x = (rnd() * T) | 0; for (let y = 6; y < T; y++) { px(g, x, y, '#3e2c1e'); if (rnd() < 0.3) x += rnd() < 0.5 ? -1 : 1; } } rect(g, 0, T - 1, T, 1, '#1a140e'); }
    else if (u === 'lashed') { rect(g, 0, 9, T, 6, '#6e5236'); rect(g, 0, 9, T, 1, '#9a7a52'); rect(g, 0, 14, T, 1, '#3e2c1c'); for (const x of [3, 11]) { rect(g, x, 9, 2, 6, '#c8a860'); px(g, x, 11, '#8a6a38'); } }
    else if (u === 'joist') { rect(g, 0, 10, T, 5, '#5e4632'); rect(g, 0, 10, T, 1, '#8a6a4a'); rect(g, 0, 15, T, 1, '#2e2016'); rect(g, 6, 10, 4, 6, '#4a3624'); rect(g, 6, 10, 4, 1, '#7a5c3c'); rect(g, 0, 12, T, 1, '#7a3a2a'); }   /* squared joists with a red-painted fascia */
    else if (u === 'corbel') { rect(g, 0, 10, T, 6, P.r[2]); for (const x of [0, 8]) { fillPoly(g, [[x + 1, 16], [x + 1, 12], [x + 4, 10], [x + 7, 12], [x + 7, 16]], '#6e6a60'); } rect(g, 0, 10, T, 1, P.rim); }   /* the mill ledge is carried on stone arches */
    else if (u === 'logs') { for (const y of [9, 12]) { rect(g, 0, y, T, 3, '#4e3e30'); rect(g, 0, y, T, 1, '#6e5a46'); } for (let k = 0; k < 4; k++) line(g, (rnd() * 12) | 0, 15, ((rnd() * 12) | 0) + 3, 13, '#8a7a5a'); }   /* rough logs, a nest's twigs in them */
    else if (u === 'dark') { rect(g, 0, 10, T, 6, '#2a2020'); rect(g, 0, 10, T, 1, '#4a3a30'); rect(g, 7, 13, 2, 3, '#8a6a3a'); px(g, 7, 15, '#ffcf70'); }   /* dark timber, a lantern hook */
    else { rect(g, 0, 10, T, 6, '#4e3e30'); for (let x = 0; x < T; x += 3) rect(g, x, 10, 1, 6, '#3a2c22'); rect(g, 0, 10, T, 1, '#6e5a46'); } }); }
/* A LEDGE belongs to its floor: lashed planks at the ropewalk, an awning board at the market, a stone slab at the mill, a branch at the rookery */
function ledgeTile(P, seed, end) { const rnd = mulberry(seed), k = P.ledge;
  return tile(g => { const x0 = end === 'L' ? 1 : 0, x1 = end === 'R' ? T - 1 : T, w = x1 - x0;
    if (k === 'lashed') { rect(g, x0, 3, w, 5, '#8a6a44'); rect(g, x0, 3, w, 1, '#b8946a'); rect(g, x0, 7, w, 1, '#4e3a26'); for (let x = x0 + 3; x < x1; x += 7) rect(g, x, 3, 2, 5, '#d8bc78'); }
    else if (k === 'awning') { rect(g, x0, 3, w, 5, '#7a5a3c'); rect(g, x0, 3, w, 1, '#a88460'); for (let x = x0; x < x1; x += 4) rect(g, x, 8, 2, 2, (x >> 2) % 2 ? '#c8463c' : '#e8d8b0'); }   /* a board with a striped valance */
    else if (k === 'slab') { rect(g, x0, 3, w, 6, P.r[1]); rect(g, x0, 3, w, 1, P.rim); rect(g, x0, 8, w, 1, P.r[3]); rect(g, x0, 9, w, 2, '#6e6a60'); }
    else if (k === 'branch') { rect(g, x0, 4, w, 4, '#5a4636'); rect(g, x0, 4, w, 1, '#7e6650'); rect(g, x0, 7, w, 1, '#3a2c22'); if (rnd() < 0.6) { const x = x0 + 2 + ((rnd() * 8) | 0); px(g, x, 3, '#6a8450'); px(g, x + 1, 2, '#8aa468'); } }
    else if (k === 'hook') { rect(g, x0, 3, w, 5, '#3a3040'); rect(g, x0, 3, w, 1, '#5a4c5e'); rect(g, x0, 7, w, 1, '#1e1824'); if (rnd() < 0.4) { rect(g, x0 + 6, 8, 1, 3, '#8a6a3a'); rect(g, x0 + 5, 11, 3, 3, '#ffcf70'); } }
    else if (k === 'bark') { rect(g, x0, 4, w, 5, '#5a4636'); for (let x = x0; x < x1; x += 3) px(g, x, 5 + (x % 2), '#3e3024'); rect(g, x0, 4, w, 1, '#8a7258'); rect(g, x0, 8, w, 1, '#2e2218'); }
    else if (k === 'web') { rect(g, x0, 5, w, 2, '#b8b0a0'); for (let x = x0; x < x1; x += 3) line(g, x, 7, x + 2, 11, '#d8d0c0'); rect(g, x0, 5, w, 1, '#e8e0d0'); }
    else { rect(g, x0, 4, w, 4, '#4a3424'); rect(g, x0, 4, w, 1, '#6a4a34'); for (let x = x0; x < x1; x += 4) px(g, x + 1, 8, '#3a2618'); }   /* a root */
    if (end === 'L') { g.clearRect(x0, 3, 1, 1); } if (end === 'R') { g.clearRect(x1 - 1, 3, 1, 1); } }); }

/* THE GROUND SCATTER, one kit a floor: small things that grow or lie on it, never taller than a tile or two */
const mk = (w, h, fn) => { const [c, g] = canvas(w, h); fn(g); return c; };
function kitProps(P) {
  return {
    hvTuft: mk(8, 5, g => { for (const [x, h] of [[1, 3], [3, 5], [4, 4], [6, 3]]) { rect(g, x, 5 - h, 1, h, P.a); px(g, x, 5 - h, P.b); } }),
    hvFern: mk(12, 8, g => { for (let k = 0; k < 5; k++) line(g, 6, 7, 1 + k * 2.5, 1 + Math.abs(2 - k), k % 2 ? '#3e6a34' : '#5a8a46'); }),
    hvShroom: mk(7, 6, g => { rect(g, 3, 3, 1, 3, '#d8d0c0'); ellipse(g, 3, 2, 3, 1.6, '#c8e8d0'); px(g, 2, 1, '#f0fff4'); }),
    hvHemp: mk(10, 5, g => { for (let k = 0; k < 4; k++) line(g, 0, 4 - k % 2, 9, 3 - (k % 3), k % 2 ? '#d8bc78' : '#b89858'); }),
    hvPeg: mk(6, 8, g => { rect(g, 2, 2, 2, 6, '#7a5a3c'); rect(g, 1, 2, 4, 1, '#a88460'); rect(g, 0, 3, 6, 2, '#c8a860'); }),
    hvCrate: mk(10, 8, g => { rect(g, 0, 0, 10, 8, '#8a6a44'); rect(g, 0, 0, 10, 1, '#b8946a'); line(g, 0, 0, 9, 7, '#5a4430'); rect(g, 0, 7, 10, 1, '#4a3626'); }),
    hvCabbage: mk(7, 5, g => { ellipse(g, 3, 3, 3, 2, '#6a9a4a'); px(g, 2, 2, '#9aca6a'); }),
    hvFlint: mk(6, 4, g => { ellipse(g, 3, 2, 2.5, 1.6, '#3a3a44'); px(g, 2, 1, '#8a8a98'); }),
    hvWindGrass: mk(10, 7, g => { for (const [x, h] of [[1, 5], [3, 7], [5, 6], [7, 4]]) line(g, x, 7, x + 3, 7 - h, P.a); for (const x of [4, 6]) px(g, x + 2, 1, P.b); }),
    hvFeather: mk(6, 3, g => { line(g, 0, 2, 5, 0, '#1e1e24'); px(g, 5, 0, '#4a4a58'); }),
    hvEgg: mk(5, 4, g => { ellipse(g, 2, 2, 2, 1.8, '#c8d8d0'); px(g, 1, 1, '#f0f8f4'); }),
    hvCandle: mk(4, 7, g => { rect(g, 1, 2, 2, 5, '#e8dcc0'); px(g, 1, 1, '#ffcf70'); px(g, 2, 0, '#fff0a0'); }),
    hvNeedles: mk(10, 3, g => { for (let k = 0; k < 7; k++) line(g, k, 2, k + 2, 0 + (k % 2), k % 2 ? '#b08a50' : '#8a6a3a'); }),
    hvBone: mk(8, 3, g => { rect(g, 1, 1, 6, 1, '#d8d0c0'); for (const x of [0, 6]) rect(g, x, 0, 2, 3, '#e8e0d0'); }),
  };
}
const KITS = { roots: ['hvFern', 'hvFern', 'hvShroom', 'hvTuft'], rope: ['hvHemp', 'hvHemp', 'hvPeg', 'hvTuft'], market: ['hvCrate', 'hvCabbage', 'hvTuft'],
  mill: ['hvWindGrass', 'hvWindGrass', 'hvFlint', 'hvTuft'], rook: ['hvFeather', 'hvEgg', 'hvTuft', 'hvFeather'], lantern: ['hvCandle', 'hvTuft'], crown: ['hvNeedles', 'hvNeedles', 'hvTuft'], hollow: ['hvBone', 'hvShroom'] };
/* the kinds each floor scatters, as data - src/level.js hands them to L.groundZones and tools/dressing.mjs holds them to the allowlist */
export const HV_KIT_KINDS = KITS;

const GROUND = {};
export function hvGround(look) {
  if (GROUND[look]) return GROUND[look];
  const P = HV_LOOKS[look], s0 = 9300 + Object.keys(HV_LOOKS).indexOf(look) * 97, top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) { const k = eL + '' + eR; top[k] = [0, 1, 2, 3].map(i => topTile(P, s0 + i * 3 + eL * 11 + eR * 17, eL, eR)); if (eL || eR) edge[k] = [0, 1].map(i => edgeTile(P, s0 + 40 + i + eL * 5 + eR * 7, eL, eR)); }
  const fill = [0, 1, 2, 3].map(i => fillTile(P, s0 + 60 + i));
  return (GROUND[look] = { top, edge, fill, silt: fill.slice(0, 3), wet: fill.slice(0, 3), ledge: [0, 1, 2].map(i => ledgeTile(P, s0 + 80 + i, null)), ledgeL: ledgeTile(P, s0 + 85, 'L'), ledgeR: ledgeTile(P, s0 + 86, 'R'),
    under: [0, 1, 2].map(i => underTile(P, s0 + 90 + i)), kit: { kinds: KITS[look] || [], density: look === 'crown' ? 0.12 : 0.3, props: kitProps(P) } });
}

/* ---- THE FLOORS' OWN PROPS (hand-placed decos) ---- */
const DECO = {};
export function hvDeco(kind) {
  if (DECO[kind]) return DECO[kind];
  let c = null;
  if (kind === 'ropeCoil') c = mk(16, 11, g => { for (let k = 0; k < 4; k++) ellipse(g, 8, 8 - k * 2, 7 - k * 0.5, 2.4, k % 2 ? '#c8a860' : '#a88848'); ellipse(g, 8, 2, 3, 1, '#6a5030'); line(g, 14, 8, 16, 10, '#c8a860'); });
  else if (kind === 'hempBale') c = mk(20, 13, g => { rect(g, 0, 2, 20, 11, '#c8b070'); rect(g, 0, 2, 20, 1, '#e8d498'); for (let y = 4; y < 13; y += 3) rect(g, 0, y, 20, 1, '#a89050'); for (const x of [5, 14]) rect(g, x, 2, 1, 11, '#6a5030'); line(g, 2, 1, 6, 0, '#e8d498'); });
  else if (kind === 'cocoon0' || kind === 'cocoon1' || kind === 'cocoon2') {   /* THE WEAVER'S LARDER: a webbed sack, a webbed goat, a small bundle - each on its thread from the top row */
    const v = +kind.slice(-1), w = [14, 22, 10][v], h = [30, 34, 20][v];
    c = mk(w, h, g => { rect(g, (w >> 1), 0, 1, h - [18, 20, 12][v], '#d8d0c0'); const cy = h - [9, 10, 6][v], rx = w / 2 - 1, ry = [9, 10, 6][v];
      ellipse(g, w / 2, cy, rx, ry, '#c8c0b0'); ellipse(g, w / 2 - 1, cy - 2, rx - 2, ry - 3, '#e0d8c8');
      for (let k = -ry; k < ry; k += 3) rect(g, 2, cy + k, w - 4, 1, '#a8a090');
      if (v === 0) { rect(g, w / 2 - 3, cy - 2, 6, 5, '#b8a878'); px(g, w / 2, cy - 5, '#8a7a5a'); }   /* a sack showing through */
      if (v === 1) { rect(g, 3, cy - 3, 3, 2, '#5a4a3a'); px(g, 4, cy - 5, '#3a2e24'); px(g, w - 5, cy + 6, '#3a2e24'); } }); }   /* a horn and a hoof */
  else if (kind === 'flourSacks') c = mk(22, 14, g => { for (const [x, y, w] of [[0, 4, 10], [9, 3, 11], [4, 0, 10]]) { ellipse(g, x + w / 2, y + 5, w / 2, 5, '#e0dccc'); rect(g, x + 2, y + 3, w - 4, 6, '#ece8da'); px(g, x + w / 2, y + 1, '#8a7a5a'); rect(g, x + w / 2 - 1, y + 5, 3, 2, '#b8a878'); } rect(g, 0, 13, 22, 1, '#8a8474'); });
  return (DECO[kind] = c);
}

// ---------------- THE CLIFF, BEHIND EVERYTHING ----------------
/* One canvas per floor band, the full width of the level, baked the first time the camera reaches it: the strata, the joints,
   the scrub, the brackets that carry each bough into the rock, and the floor's own marks on the face. The landmarks that move
   or glow are drawn over it each frame (drawLandmarks). */
const FACE = new Map();
/* THE FACE SITS BACK: the floor's own rock, pushed toward the valley haze and darkened, so the walkway always stands off it */
const mix = (a, b, k) => { const p = rgb(a), q = rgb(b); return hex(p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k); };
const faceCols = P => P.r.map(c => shade(mix(c, '#56607a', 0.28), -0.42));
function bakeFace(L, z) {
  const W = L.W * T, H = (z.y1 - z.y0 + 1) * T, [c, g] = canvas(W, H), P = HV_LOOKS[z.look], f = faceCols(P), rnd = mulberry(4400 + z.y0 * 13);
  rect(g, 0, 0, W, H, f[0]);
  /* THE ROCK IN BLOCKS: courses of fractured stone, each with a lit top edge and a shadowed foot, the courses tilted a little - a cliff, not a wall */
  for (let y = -8, row = 0; y < H; row++) { const h = 12 + ((rnd() * 14) | 0), tilt = (rnd() - 0.5) * 4;
    for (let x = -((rnd() * 30) | 0); x < W; ) { const w = 26 + ((rnd() * 70) | 0), hh = h + ((rnd() * 6) | 0) - 3, col = f[[0, 1, 0, 2, 1][(rnd() * 5) | 0]], j = () => (rnd() - 0.5) * 5;
      fillPoly(g, [[x + j(), y + tilt * x / W + j()], [x + w + j(), y + tilt * (x + w) / W + j()], [x + w + j(), y + hh + j()], [x + j(), y + hh + j()]], col);
      rect(g, x + 2, y + tilt * x / W + 1, w - 6 - ((rnd() * 10) | 0), 1, shade(col, 0.12)); rect(g, x + ((rnd() * 8) | 0), y + hh - 1, w - ((rnd() * 12) | 0), 2, f[3]); if (rnd() < 0.45) rect(g, x + w - 1, y + 3, 1, hh - 5, f[2]);
      if (rnd() < 0.3) { const px0 = x + 3 + ((rnd() * (w - 6)) | 0); line(g, px0, y + 3, px0 + ((rnd() * 6) | 0) - 3, y + h - 3, f[3]); }
      x += w; }
    y += h; }
  for (let k = 0; k < W * H / 140; k++) px(g, (rnd() * W) | 0, (rnd() * H) | 0, rnd() < 0.5 ? f[3] : f[1]);
  /* and break the courses up: weathered blotches, and fissures that run down through several of them */
  for (let k = 0; k < W * H / 5000; k++) { g.globalAlpha = 0.22; ellipse(g, (rnd() * W) | 0, (rnd() * H) | 0, 20 + rnd() * 50, 10 + rnd() * 26, rnd() < 0.5 ? f[2] : f[1]); } g.globalAlpha = 1;
  for (let k = 0; k < W / 55; k++) { let x = (rnd() * W) | 0; const y0 = (rnd() * H) | 0, n = 40 + ((rnd() * 110) | 0); for (let y = y0; y < y0 + n && y < H; y++) { rect(g, x, y, 2, 1, f[3]); px(g, x - 1, y, shade(f[1], 0.1)); if (rnd() < 0.18) x += rnd() < 0.5 ? -1 : 1; } }
  /* joints down the face, and ledges across it with something growing on them */
  for (let k = 0; k < W / 70; k++) { let x = (rnd() * W) | 0; const y0 = (rnd() * H * 0.6) | 0, n = 20 + ((rnd() * 60) | 0); for (let y = y0; y < y0 + n && y < H; y++) { px(g, x, y, f[3]); if (rnd() < 0.2) x += rnd() < 0.5 ? -1 : 1; } }
  for (let k = 0; k < W / 120; k++) { const x = (rnd() * W) | 0, y = 8 + ((rnd() * (H - 30)) | 0), w = 20 + ((rnd() * 50) | 0); rect(g, x, y, w, 1, P.rim + '66'); rect(g, x, y + 1, w, 2, f[3]); for (let i = 0; i < w; i += 3 + ((rnd() * 4) | 0)) rect(g, x + i, y - 2, 2, 2, P.a + 'aa'); }
  /* THE BRACKETS: every bough is carried into the rock on timber (or on stone, at the mill), in the air under its band - so they hang
     at the TOP of the floor below it, in the style of the floor above (z.ceilLook) */
  if (z.ceilLook) { const under = 0;
    for (let x = 40 + ((rnd() * 30) | 0); x < W - 20; x += 150 + ((rnd() * 60) | 0)) {
      if (z.ceilLook === 'mill') { fillPoly(g, [[x - 10, under], [x + 10, under], [x + 4, under + 22], [x - 4, under + 22]], '#8a867a'); rect(g, x - 10, under, 20, 2, '#b4b0a2'); }
      else { const wd = z.ceilLook === 'lantern' ? '#2a2020' : z.ceilLook === 'crown' ? '#4a3c30' : '#5a4430'; line(g, x - 14, under, x + 2, under + 26, wd, 3); line(g, x + 14, under, x - 2, under + 26, wd, 3); rect(g, x - 3, under + 24, 6, 4, '#3a2a1c'); } } }
  /* THE FLOOR'S OWN MARKS ON THE FACE */
  const floorY = z.floor !== undefined ? (z.floor + 1 - z.y0) * T : H;
  if (z.look === 'roots') {   /* root curtains down from the bough above, a thin fall of water, glowing fungus */
    for (let x = 6; x < W; x += 9 + ((rnd() * 14) | 0)) { let xx = x; const n = 18 + ((rnd() * 40) | 0); for (let y = 0; y < n; y++) { rect(g, xx, y, 2, 1, y < n - 4 ? '#3e2c1e' : '#5a4430'); if (rnd() < 0.25) xx += rnd() < 0.5 ? -1 : 1; } }
    for (const wx of [18 * T + 6, 91 * T + 4]) { for (let y = 0; y < floorY; y++) { rect(g, wx + Math.round(Math.sin(y * 0.3)), y, 3, 1, y % 5 ? '#6a9aa0' : '#a8d8e0'); } ellipse(g, wx + 1, floorY - 2, 7, 2, '#a8d8e0'); }
    for (let k = 0; k < W / 40; k++) { const x = (rnd() * W) | 0, y = floorY - 10 - ((rnd() * 60) | 0); px(g, x, y, '#8af0c8'); px(g, x + 1, y, '#4aa088'); } }
  else if (z.look === 'rope') {   /* iron rings in the rock, coils hung on pegs */
    for (let x = 30; x < W; x += 90 + ((rnd() * 60) | 0)) { const y = floorY - 60 - ((rnd() * 30) | 0); circle(g, x, y, 3, '#2a2420'); circle(g, x, y, 2, f[1]); if (rnd() < 0.6) { for (let k = 0; k < 3; k++) ellipse(g, x, y + 8 + k * 2, 5 - k, 2, k % 2 ? '#a88848' : '#c8a860'); } } }
  else if (z.look === 'market') {   /* painted signs and niches cut in the stone */
    const cols = ['#8a3a2a', '#3a5a7a', '#6a7a3a', '#8a6a2a'];
    for (let x = 60; x < W; x += 110 + ((rnd() * 80) | 0)) { const y = floorY - 70 - ((rnd() * 40) | 0), w = 18 + ((rnd() * 12) | 0); rect(g, x, y, w, 9, cols[(x >> 4) % 4]); rect(g, x + 2, y + 3, w - 4, 1, '#e8d8b0'); rect(g, x + 2, y + 5, (w - 4) * 0.6, 1, '#e8d8b0'); }
    for (let x = 100; x < W; x += 170 + ((rnd() * 70) | 0)) { const y = floorY - 110; fillPoly(g, [[x, y + 26], [x, y + 6], [x + 7, y], [x + 14, y + 6], [x + 14, y + 26]], f[3]); rect(g, x + 4, y + 10, 6, 14, '#b8a27c'); circle(g, x + 7, y + 9, 3, '#c8b28c'); } }
  else if (z.look === 'mill') {   /* the wind combs the chalk: streaks, and grass bent the one way */
    for (let k = 0; k < W / 25; k++) { const x = (rnd() * W) | 0, y = (rnd() * (floorY - 10)) | 0; rect(g, x, y, 10 + ((rnd() * 30) | 0), 1, '#ffffff22'); }
    for (let k = 0; k < W / 60; k++) { const x = (rnd() * W) | 0, y = 10 + ((rnd() * (floorY - 30)) | 0); for (let i = 0; i < 4; i++) line(g, x + i * 2, y + 4, x + i * 2 + 4, y, P.a); } }
  else if (z.look === 'rook') {   /* white runs under every crack a rook sits in, and the nests */
    for (let x = 20; x < W; x += 50 + ((rnd() * 70) | 0)) { const y = 14 + ((rnd() * (floorY - 50)) | 0);
      rect(g, x - 5, y, 12, 3, '#3a2e24'); for (let i = 0; i < 6; i++) line(g, x - 6 + i * 2, y + 1, x - 4 + i * 2, y - 1, '#6a5a44');
      for (let yy = y + 3; yy < y + 16 + ((rnd() * 20) | 0); yy++) rect(g, x + ((rnd() * 3) | 0) - 1, yy, 1 + ((rnd() * 2) | 0), 1, '#d8dcd8'); } }
  else if (z.look === 'lantern') {   /* THE LANTERN STAIR: a stair cut in the slate, climbing the face behind the floor */
    let sx = 92 * T, sy = floorY - 2;
    while (sx > 18 * T && sy > 16) { rect(g, sx - 24, sy - 6, 24, 6, f[1]); rect(g, sx - 24, sy - 6, 24, 1, '#5a5c74'); rect(g, sx - 24, sy, 24, 2, f[3]); sx -= 24; sy -= 6; } }   /* (its lamps are L.hvLandmarks.lanterns, lit each frame) */
  else if (z.look === 'hollow') {   /* under the roots: roots through the ceiling and web in every corner */
    for (let x = 4; x < W; x += 7 + ((rnd() * 10) | 0)) { let xx = x; const n = 10 + ((rnd() * 50) | 0); for (let y = 0; y < n; y++) { px(g, xx, y, '#4a3424'); if (rnd() < 0.3) xx += rnd() < 0.5 ? -1 : 1; } } }
  return c;
}
function faceOf(L, z) { const k = z.look + ':' + z.y0; if (!FACE.has(k) || FACE.get(k).L !== L) FACE.set(k, { L, c: bakeFace(L, z) }); return FACE.get(k).c; }

/* THE LANDMARKS: what makes each floor a PLACE you would tell someone to meet you at. Drawn every frame over the face, culled
   to the view, behind the tiles. They are scenery: nothing here is footing or a foe. */
function drawLandmarks(g, L, cx, cy, time, VW, VH) {
  const on = (x0, y0, x1, y1) => x1 - cx > -8 && x0 - cx < VW + 8 && y1 - cy > -8 && y0 - cy < VH + 8, R = Math.round;
  const lm = L.hvLandmarks || {};
  /* THE ROPEWALK: a long frame of posts and hooks, the ropes laid along it, and the great wheel that twists them */
  if (lm.ropewalk) { const [x0, x1, fy] = lm.ropewalk, X0 = x0 * T, X1 = x1 * T, Y = (fy + 1) * T;
    if (on(X0 - 40, Y - 60, X1, Y)) { for (let x = X0; x <= X1; x += 6 * T) { g.fillStyle = '#4a3624'; g.fillRect(R(x - cx), R(Y - 34 - cy), 3, 34); g.fillStyle = '#6a5034'; g.fillRect(R(x - 3 - cx), R(Y - 34 - cy), 9, 2); }
      g.strokeStyle = '#c8a860'; g.lineWidth = 1; for (const dy of [30, 26, 22]) { g.beginPath(); g.moveTo(R(X0 - cx), R(Y - dy - cy) + 0.5); g.quadraticCurveTo(R((X0 + X1) / 2 - cx), R(Y - dy + 4 - cy), R(X1 - cx), R(Y - dy - cy) + 0.5); g.stroke(); }
      const wx = X0 - 22, wy = Y - 30, a = time * 1.6; g.strokeStyle = '#5a4430'; g.lineWidth = 2; g.beginPath(); g.arc(R(wx - cx), R(wy - cy), 16, 0, 7); g.stroke();
      for (let k = 0; k < 6; k++) { const q = a + k * Math.PI / 3; g.beginPath(); g.moveTo(R(wx - cx), R(wy - cy)); g.lineTo(R(wx - cx + Math.cos(q) * 16), R(wy - cy + Math.sin(q) * 16)); g.stroke(); }
      g.fillStyle = '#4a3624'; g.fillRect(R(wx - 2 - cx), R(wy - cy), 4, Y - wy); g.lineWidth = 1; } }
  /* THE MILL: a stone tower behind the paddles at the trunk, a cap, a door on the market floor, so the sails read as a mill */
  if (lm.mill) { const [mx, top, foot] = lm.mill, X = mx * T + 8, Y0 = top * T, Y1 = (foot + 1) * T;
    if (on(X - 30, Y0 - 30, X + 30, Y1)) { const x = R(X - cx), y0 = R(Y0 - cy), y1 = R(Y1 - cy);
      g.fillStyle = '#8a8478'; g.beginPath(); g.moveTo(x - 20, y1); g.lineTo(x - 14, y0); g.lineTo(x + 14, y0); g.lineTo(x + 20, y1); g.closePath(); g.fill();
      g.fillStyle = '#a49e90'; g.fillRect(x - 12, y0, 6, y1 - y0); g.fillStyle = '#6e695e'; for (let y = y0 + 10; y < y1; y += 12) g.fillRect(x - 18, y, 36, 1);
      g.fillStyle = '#5a3a2a'; g.beginPath(); g.moveTo(x - 18, y0 + 2); g.lineTo(x, y0 - 22); g.lineTo(x + 18, y0 + 2); g.closePath(); g.fill(); g.fillStyle = '#3a2418'; g.fillRect(x - 18, y0 + 1, 36, 2);
      for (const wy of [y0 + 40, y0 + 110]) { g.fillStyle = '#2a2230'; g.fillRect(x - 4, wy, 8, 10); g.fillStyle = '#ffcf70'; g.fillRect(x - 3, wy + 1, 6, 8); }
      g.fillStyle = '#3a2618'; g.fillRect(x - 6, y1 - 20, 12, 20); g.fillStyle = '#5a3a24'; g.fillRect(x - 5, y1 - 19, 10, 19); } }
  /* THE ROOKERY'S DOVECOTE: a round tower of nest holes, and rooks coming and going */
  if (lm.dovecote) { const [dx, fy] = lm.dovecote, X = dx * T + 8, Y = (fy + 1) * T;
    if (on(X - 30, Y - 110, X + 30, Y)) { const x = R(X - cx), y = R(Y - cy);
      g.fillStyle = '#7c7e86'; g.fillRect(x - 14, y - 84, 28, 84); g.fillStyle = '#92949c'; g.fillRect(x - 12, y - 84, 6, 84);
      g.fillStyle = '#3a3040'; g.beginPath(); g.moveTo(x - 18, y - 82); g.lineTo(x, y - 104); g.lineTo(x + 18, y - 82); g.closePath(); g.fill();
      g.fillStyle = '#1e1e24'; for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) g.fillRect(x - 9 + k * 8, y - 76 + r * 12, 4, 4);
      g.fillStyle = '#e8e8e0'; for (let r = 0; r < 5; r++) g.fillRect(x - 9 + (r % 3) * 8, y - 72 + r * 12, 2, 3);
      for (let k = 0; k < 3; k++) { const t = time * 0.4 + k * 0.37, u = t % 1, bx = x - 60 + u * 150 + k * 20, by = y - 110 + Math.sin(t * 6.3) * 10 + k * 14, flap = Math.floor(time * 8 + k) % 2;
        g.fillStyle = '#16161c'; g.fillRect(R(bx), R(by), 4, 2); g.fillRect(R(bx) - 2, R(by) - (flap ? 2 : -1), 3, 1); g.fillRect(R(bx) + 3, R(by) - (flap ? 2 : -1), 3, 1); } } }
  /* THE LANTERN STAIR's lamps: warm pools on the face that breathe */
  if (lm.lanterns) for (const [lx, ly] of lm.lanterns) { const X = lx * T + 8, Y = ly * T; if (!on(X - 30, Y - 30, X + 30, Y + 30)) continue;
    const k = 0.75 + 0.25 * Math.sin(time * 3 + lx); g.globalAlpha = 0.16 * k; g.fillStyle = '#ffb860'; g.beginPath(); g.arc(R(X - cx), R(Y - cy), 22, 0, 7); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#2a2028'; g.fillRect(R(X - cx) - 3, R(Y - cy) - 4, 6, 7); g.fillStyle = '#ffcf70'; g.fillRect(R(X - cx) - 2, R(Y - cy) - 3, 4, 5); }
  /* THE WEB HOLE: the great root arch the roots road passes under, where the village lost its loads */
  if (lm.rootArch) { const [ax0, ax1, fy] = lm.rootArch, X0 = ax0 * T, X1 = (ax1 + 1) * T, Y = (fy + 1) * T;
    if (on(X0 - 20, Y - 120, X1 + 20, Y)) { g.strokeStyle = '#3e2c1e'; for (const [w, o] of [[7, 0], [4, 10], [3, -8]]) { g.lineWidth = w; g.beginPath(); g.moveTo(R(X0 - cx) + o, R(Y - cy)); g.bezierCurveTo(R(X0 - cx) + o, R(Y - 130 - cy), R(X1 - cx) - o, R(Y - 130 - cy), R(X1 - cx) - o, R(Y - cy)); g.stroke(); }
      g.lineWidth = 1; g.strokeStyle = '#d8d0c088'; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(R(X0 + 20 - cx), R(Y - 70 - cy)); g.lineTo(R(X0 + 20 + k * 22 - cx), R(Y - 96 + (k % 2) * 10 - cy)); g.stroke(); } } }
  /* THE CROWN: the great dead pine the Reeve roosts in. A trunk up the middle, a bough across the top, and a limb or a rope to every
     ledge in the room - the ledges were stone floating in the sky (the review, B9) */
  if (lm.crown) { const { trunk, bough, ledges } = lm.crown, TX = trunk * T + 8, BY = bough[2] * T;
    if (on(bough[0] * T - 40, 0, bough[1] * T + 40, 24 * T)) {
      g.fillStyle = '#4a3c30'; g.fillRect(R(TX - 10 - cx), R(BY - cy), 20, 21 * T - BY); g.fillStyle = '#5e4c3c'; g.fillRect(R(TX - 8 - cx), R(BY - cy), 5, 21 * T - BY);
      g.fillStyle = '#3a2e24'; for (let y = BY + 6; y < 20 * T; y += 11) g.fillRect(R(TX - 10 - cx) + (y % 3) * 4, R(y - cy), 3, 5);
      g.fillStyle = '#4a3c30'; g.fillRect(R(bough[0] * T - cx), R(BY - 4 - cy), (bough[1] - bough[0]) * T, 8); g.fillStyle = '#5e4c3c'; g.fillRect(R(bough[0] * T - cx), R(BY - 4 - cy), (bough[1] - bough[0]) * T, 2);
      for (const [lx0, lx1, ly] of ledges) { const Y = ly * T + 4, X0 = lx0 * T + 3, X1 = (lx1 + 1) * T - 4;
        if (Math.abs((lx0 + lx1) / 2 - trunk) < 9) { g.strokeStyle = '#4a3c30'; g.lineWidth = 4; g.beginPath(); g.moveTo(R(TX - cx), R(Y + 30 - cy)); g.lineTo(R((X0 + X1) / 2 - cx), R(Y + 2 - cy)); g.stroke(); g.lineWidth = 1; }
        else { g.fillStyle = '#b09a70'; for (const rx of [X0, X1]) g.fillRect(R(rx - cx), R(BY - cy), 1, Y - BY); } } } }
}

/* THE WHOLE BACK: each floor's face where the camera is, then the landmarks. Called from drawWorld in src/main.js, after the far
   and middle layers and before the interiors and the tiles. */
export function drawHangingBack(g, L, cx, cy, time, VW, VH) {
  for (const z of (L.groundZones || [])) { if (z.noFace) continue;
    const y0 = z.y0 * T, y1 = (z.y1 + 1) * T; if (y1 - cy < 0 || y0 - cy > VH) continue;
    const c = faceOf(L, z), sx = Math.max(0, Math.floor(cx)), sy = Math.max(0, Math.floor(cy - y0)), w = Math.min(VW + 1, c.width - sx), h = Math.min(VH + 1, c.height - sy);
    if (w > 0 && h > 0) g.drawImage(c, sx, sy, w, h, Math.round(sx - cx), Math.round(y0 + sy - cy), w, h); }
  drawLandmarks(g, L, cx, cy, time, VW, VH);
}
