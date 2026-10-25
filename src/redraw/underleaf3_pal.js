// underleaf3_pal.js - UNDERLEAF 3's one palette (claude/underleafart). EARTHY + OLD, NOT GAUDY: the village is the Grandmother's craft, so the ground is root-brown soil and
// leaf-litter, the roofs are dried giant leaves and thatch, the light is CANDLE-AMBER, and the ONE strong accent in the whole level is HER POTION GLOW (a witch-light green-gold
// for the ambient: lantern jars, cauldron steam, the beds' seeds; her three jars' own colours - green vine, blue bubble, red fire - are the rule's state and stay the loudest
// things on screen precisely because nothing else is saturated). Gold stays the game's TARGET colour (the open ring, a silver) and red its danger colour.
// SECTIONS is the level's own (src/underleaf3.js); the zones here follow it so a tile, a backdrop and a prop agree on which place they are in.
export const ZONES = [
  { id: 'garden', name: 'THE HERB GARDEN', x0: 0, x1: 96 },
  { id: 'lofts', name: 'THE DRYING LOFTS', x0: 96, x1: 189 },
  { id: 'hedges', name: 'THE THORN HEDGES', x0: 189, x1: 279 },
  { id: 'yard', name: 'THE CAULDRON YARD', x0: 279, x1: 372 },
  { id: 'leaf', name: 'HER GREAT LEAF', x0: 372, x1: 427 },
  { id: 'cottage', name: "THE GRANDMOTHER'S COTTAGE", x0: 427, x1: 9999 },
];
export const zoneOf = x => { for (let i = 0; i < ZONES.length; i++) if (x < ZONES[i].x1) return i; return ZONES.length - 1; };
/* the one ambient glow (her potion-light) and her three jars' colours (the rule's state: potion-hands.js COL uses the same three) */
export const GLOW = { c: '#b8f070', hi: '#eeffc0', mid: '#7cc43e', lo: '#3c6a22', rgb: '184,240,112' };
export const JARC = { green: ['#5fae3a', '#9be06a', '#2e5a1c', '#d8ffb0'], blue: ['#4a8fd8', '#a8d8ff', '#24406a', '#e8f6ff'], red: ['#d8502a', '#ffb070', '#6a2014', '#ffe6c0'] };
export const CANDLE = { c: '#ffc860', hi: '#fff0b0', mid: '#e0983a', lo: '#8a5a22', rgb: '255,200,96' };
/* each place: s = a ramp of seven for its soil (s0 deepest ... s6 lit lip), fung = the lip's moss (dark, mid, lit), thread = pale root fibre, sky = [top, bottom] of its back colour,
   leaf = the giant leaves (dark, mid, lit), rush = the dried leaf / straw boards (dark, mid, lit), haze = the air */
export const PAL = [
  { s: ['#120e08', '#231a0f', '#392a18', '#523c22', '#6f5230', '#8f6e42', '#b89560'], fung: ['#2e4a1e', '#58802c', '#98bc50'], thread: '#d8c8a0', sky: ['#7e9a5c', '#d0d090'], leaf: ['#2a4a22', '#4c7a34', '#86b050'], rush: ['#6a5230', '#a88a50', '#d8c07c'], haze: '#9ab070' },
  { s: ['#150d07', '#2a1b0d', '#44301a', '#634526', '#86602f', '#aa8040', '#d0a65e'], fung: ['#4a4a1e', '#82802c', '#c0b850'], thread: '#e8d29a', sky: ['#a8864a', '#e8c070'], leaf: ['#4a4a1e', '#8a8030', '#c8b04a'], rush: ['#74561e', '#b8903a', '#ecc868'], haze: '#c8a468' },
  { s: ['#0d0e08', '#1a1e10', '#2a3118', '#3e4a24', '#556532', '#728846', '#94ac60'], fung: ['#243a1a', '#3e6224', '#6a9a38'], thread: '#c4c8a0', sky: ['#4a5a3a', '#8a9066'], leaf: ['#1e3a1c', '#365e2a', '#5a8a3a'], rush: ['#4a4228', '#7e7040', '#b0a060'], haze: '#788a5c' },
  { s: ['#0e0b0a', '#1f1814', '#352a22', '#4e3e32', '#6b5644', '#8c7358', '#b09878'], fung: ['#2a3a22', '#4a6a30', '#7a9c44'], thread: '#d8c4a4', sky: ['#5a4030', '#b87a44'], leaf: ['#2a3a1e', '#4a6a2c', '#7a9a40'], rush: ['#5a4228', '#946838', '#cc9a50'], haze: '#a07a54' },
  { s: ['#0a0e08', '#141c0e', '#202d14', '#32441e', '#48612a', '#668638', '#88ac4c'], fung: ['#1e3a18', '#386a26', '#68a43a'], thread: '#c8d4a0', sky: ['#2e4a2c', '#70904a'], leaf: ['#183a1a', '#2e6226', '#559a38'], rush: ['#4a4a24', '#80802e', '#b8b44a'], haze: '#6a8a4c' },
  { s: ['#0a0705', '#17100a', '#291c12', '#3d2b1b', '#563c25', '#745132', '#98703f'], fung: ['#26361a', '#445c26', '#728e3c'], thread: '#d0b890', sky: ['#1c1a10', '#3c3018'], leaf: ['#1c2e18', '#324c24', '#58763a'], rush: ['#4a3622', '#7e5c32', '#b08848'], haze: '#4a3c24' },
];
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
export const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + hx(A[0] + (B[0] - A[0]) * t) + hx(A[1] + (B[1] - A[1]) * t) + hx(A[2] + (B[2] - A[2]) * t); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* the palette AT a tile column: the two nearest places crossfaded over 14 tiles at each seam (a backdrop that changes colour smoothly) */
export function palAt(tx) {
  const z = zoneOf(tx), P = PAL[z]; let near = -1, k = 0;
  if (z > 0 && tx - ZONES[z].x0 < 14) { near = z - 1; k = 0.5 * (1 - (tx - ZONES[z].x0) / 14); }
  else if (z < ZONES.length - 1 && ZONES[z].x1 - tx < 14) { near = z + 1; k = 0.5 * (1 - (ZONES[z].x1 - tx) / 14); }
  if (near < 0) return { z, P, k: 0, Q: P, nz: z };
  return { z, P, k, Q: PAL[near], nz: near };
}
