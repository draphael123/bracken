// sporewood2_pal.js - SPOREWOOD 2's one palette (claude/sporewood2art). EARTH + FUNGUS, ONE GLOW: the ground is soil, peat, bone and root (olive-umber -> indigo -> peat -> bone ->
// root-red -> plum as you climb to her), the fungi are cream and tan and ochre, and the single glow in the whole wood is FOXFIRE (a cold teal-green) - lantern caps, the veins of
// mycelium, the rims of the spring spores, the knot's seam. Gold stays the game's TARGET colour (the plunge mark, a seed's fleck, the open ring) and red its danger colour.
// SECTIONS is the level's own (src/sporewood.js); the zones here follow it so a tile, a backdrop and a prop agree on which place they are in.
export const ZONES = [
  { id: 'glade', name: 'THE MYCELIUM GLADE', x0: 0, x1: 100 },
  { id: 'hollows', name: 'THE LANTERN HOLLOWS', x0: 100, x1: 198 },
  { id: 'bog', name: 'THE PUFFBALL BOG', x0: 198, x1: 298 },
  { id: 'larder', name: 'THE WEB LARDER', x0: 298, x1: 358 },
  { id: 'knot', name: "THE MOTHER'S KNOT", x0: 358, x1: 408 },
  { id: 'hollow', name: "THE MOTHER'S HOLLOW", x0: 408, x1: 9999 },
];
export const zoneOf = x => { for (let i = 0; i < ZONES.length; i++) if (x < ZONES[i].x1) return i; return ZONES.length - 1; };
/* the one glow */
export const GLOW = { c: '#7fe8c8', hi: '#d6fff0', mid: '#3fb89c', lo: '#1f6a62', rgb: '127,232,200' };
/* each place: s = a ramp of seven for its soil (s0 deepest ... s6 lit lip), fung = the lip's growth (dark, mid, lit), thread = the mycelium's colour, sky = [top, bottom] of its back colour,
   far/mid/near = the backdrop's silhouettes (dark..lit), haze = the air, tint = [r,g,b,a] laid over the whole view (the level's own tints, kept soft) */
export const PAL = [
  { s: ['#13100b', '#241c12', '#3a2d1b', '#55412a', '#765f3c', '#9c8458', '#c8b47e'], fung: ['#3a4a22', '#6a8038', '#b0c468'], thread: '#d8e0c4', sky: ['#5a6a52', '#a8b48a'], stem: ['#5c5a44', '#8c8a6c', '#bcb894'], cap: ['#6a5238', '#a88a5a', '#d8c08a'], haze: '#a8b890' },
  { s: ['#09080f', '#14111d', '#231c2c', '#362a3e', '#4d3d56', '#6c5a74', '#93809a'], fung: ['#1f4a4a', '#3f8a84', '#8fe0cc'], thread: '#9cc8bc', sky: ['#0a0d16', '#1a2230'], stem: ['#20202e', '#363448', '#56506a'], cap: ['#2c2a42', '#4a4668', '#7a74a0'], haze: '#2a3a4c' },
  { s: ['#0e100a', '#1a2012', '#2c361d', '#434f2c', '#5f6e3d', '#82945a', '#aabc7c'], fung: ['#34502a', '#5a8a3e', '#a4d064'], thread: '#c8d2b0', sky: ['#4a5a48', '#8a9c80'], stem: ['#4a5238', '#788060', '#a8b088'], cap: ['#5a6a48', '#8a9c66', '#c0d08c'], haze: '#8a9c86' },
  { s: ['#12100c', '#241f17', '#3c342a', '#594d3e', '#7c6d58', '#a29278', '#cdbf9e'], fung: ['#3a3a2c', '#6a6a52', '#b4b494'], thread: '#ece8d8', sky: ['#464a44', '#8a8c7c'], stem: ['#4a463c', '#78725e', '#aaa488'], cap: ['#5a5244', '#8e8468', '#c4b894'], haze: '#8c8c7c' },
  { s: ['#150b0b', '#291511', '#43231b', '#64352a', '#874f38', '#ab714e', '#d19a6e'], fung: ['#4a2a2a', '#8a4a4a', '#d49a8a'], thread: '#e6c8b0', sky: ['#3a2630', '#7a5460'], stem: ['#4a2c2c', '#7a4a42', '#a8786a'], cap: ['#5a3446', '#8e5870', '#c48ca4'], haze: '#8a6a74' },
  { s: ['#0d0810', '#1b0f1f', '#2f182d', '#4a2640', '#6b3a59', '#8e5575', '#b37c98'], fung: ['#3a1e44', '#7a3e8a', '#c488d0'], thread: '#d8b8e0', sky: ['#0e060f', '#2a1230'], stem: ['#1e1019', '#33202e', '#503448'], cap: ['#3a2046', '#5e3a74', '#8a64a4'], haze: '#3a2248' },
];
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
export const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + hx(A[0] + (B[0] - A[0]) * t) + hx(A[1] + (B[1] - A[1]) * t) + hx(A[2] + (B[2] - A[2]) * t); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* the palette AT a tile column: the two nearest places crossfaded over 16 tiles at each seam (a backdrop that changes colour smoothly) */
export function palAt(tx) {
  const z = zoneOf(tx), P = PAL[z]; let near = -1, k = 0;
  if (z > 0 && tx - ZONES[z].x0 < 14) { near = z - 1; k = 0.5 * (1 - (tx - ZONES[z].x0) / 14); }
  else if (z < ZONES.length - 1 && ZONES[z].x1 - tx < 14) { near = z + 1; k = 0.5 * (1 - (ZONES[z].x1 - tx) / 14); }
  if (near < 0) return { z, P, k: 0, Q: P, nz: z };
  return { z, P, k, Q: PAL[near], nz: near };
}
