// palisade_pal.js - THE PALISADE WOOD's ONE PALETTE (claude/palisadeart). An AUTUMN wood being walled in: the ground is leaf-litter loam (russet and gold on umber), the new work is FRESH-CUT TIMBER
// (pale honey, sharp-edged, still weeping sap) against WEATHERED old timber (grey-brown), and the goblins' mark on all of it is ROPE (pale hemp lashings) and one RUST-RED (pennants, lashings' tags).
// Gold stays the game's TARGET colour (the glint on a prop that holds, the open ring) - the leaf-gold here is a duller ochre, never the glint's #ffd36b.
// ZONES follow the level's own sections (src/palisade-wood.js SECTIONS) so a tile, a backdrop and a prop agree on which place they are in.
export const ZONES = [
  { id: 'edge', name: 'THE FELLED EDGE', x0: 0, x1: 104 },
  { id: 'yard', name: 'THE STAKE YARD', x0: 104, x1: 204 },
  { id: 'scaf', name: 'THE SCAFFOLDS', x0: 204, x1: 306 },
  { id: 'gatehouse', name: 'THE HALF-BUILT GATEHOUSE', x0: 306, x1: 390 },
  { id: 'gate', name: 'THE OLD FOREST GATE', x0: 390, x1: 9999 },
];
export const zoneOf = x => { for (let i = 0; i < ZONES.length; i++) if (x < ZONES[i].x1) return i; return ZONES.length - 1; };
/* the leaves: deep russet, rust, orange, ochre, gold, pale gold */
export const LEAF = ['#6a2a14', '#8a3a18', '#b8582a', '#d8862e', '#e8b04a', '#f4d078'];
/* TIMBER: weathered (old posts), seasoned (the standing work), FRESH-CUT (the new boards and stakes): each a ramp dark..lit of five */
export const WOOD = {
  old: ['#241a14', '#3e2e22', '#5c4632', '#7c6246', '#9c8260'],
  mid: ['#2e1c10', '#52341c', '#7a5030', '#a07040', '#c49a5c'],
  fresh: ['#6a4220', '#a06c34', '#cc9a52', '#e8c27a', '#f6e0a4'],
};
export const ROPE = ['#8a7448', '#b8a068', '#dcc890'], RUST = ['#5a1e12', '#9a3a22', '#d0603a'], IRON = ['#1e1c22', '#3e3c46', '#6c6a78', '#a4a2b0'];
/* each place's SOIL (a ramp of seven, s0 deepest .. s6 the lit lip), its LITTER (the leaves lying on it), and the air: sky = [top, mid, horizon], haze = the colour of the air, far/mid = silhouettes */
export const PAL = [
  { s: ['#150d08', '#26170d', '#3c2514', '#573520', '#744a2c', '#946438', '#b88444'], litter: [LEAF[1], LEAF[2], LEAF[3], LEAF[4]], grass: ['#5a4a1c', '#8a742c', '#c0a444'],
    sky: ['#e2a868', '#f0c488', '#f8dca0'], haze: '#e8b070', far: ['#a05a30', '#c47a3a'], mid: ['#6a3a1c', '#8e5226', '#b4742e'] },
  { s: ['#160e08', '#271910', '#3f2a1a', '#5a3d26', '#785438', '#9a7048', '#bc9060'], litter: [LEAF[2], LEAF[3], '#d8a85a', LEAF[4]], grass: ['#5c4c24', '#907a38', '#c4aa58'],
    sky: ['#dc9a5c', '#ecb87a', '#f6d496'], haze: '#e4a468', far: ['#9a5430', '#be7238'], mid: ['#664020', '#8c5a2c', '#b4803c'] },
  { s: ['#18100a', '#2a1c12', '#42301e', '#5e4430', '#7c5e44', '#9c7c5c', '#bc9c78'], litter: [LEAF[1], LEAF[2], LEAF[3], '#c8a05a'], grass: ['#584424', '#86683a', '#b8944e'],
    sky: ['#d48a54', '#e8a870', '#f4c88a'], haze: '#dc9660', far: ['#92502c', '#b66a34'], mid: ['#5e3a1e', '#84522a', '#a8743a'] },
  { s: ['#1a120c', '#2e2016', '#483626', '#664c36', '#846650', '#a48a6c', '#c4ac8a'], litter: [LEAF[0], LEAF[1], LEAF[2], LEAF[3]], grass: ['#52401e', '#7c6030', '#a88a46'],
    sky: ['#c87848', '#e09462', '#f0b87c'], haze: '#d08658', far: ['#8a4a28', '#ac6030'], mid: ['#58361c', '#7c4c28', '#9c6a34'] },
  { s: ['#1a110b', '#2e1e14', '#46301f', '#644430', '#84603f', '#a48052', '#c4a068'], litter: [LEAF[0], LEAF[1], LEAF[2], LEAF[4]], grass: ['#523e1c', '#7a5c2c', '#a48444'],
    sky: ['#bc6a40', '#d8885a', '#eeae72'], haze: '#c87a50', far: ['#824424', '#a4582c'], mid: ['#52321a', '#764826', '#966432'] },
];
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
export const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + hx(A[0] + (B[0] - A[0]) * t) + hx(A[1] + (B[1] - A[1]) * t) + hx(A[2] + (B[2] - A[2]) * t); };
export const rgbStr = h => rgbOf(h).join(',');
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* the palette AT a tile column: the two nearest places crossfaded over 16 tiles at each seam */
export function palAt(tx) {
  const z = zoneOf(tx); let nz = z, k = 0;
  const toEnd = ZONES[z].x1 - tx, fromStart = tx - ZONES[z].x0;
  if (toEnd < 8 && z < ZONES.length - 1) { nz = z + 1; k = 0.5 * (1 - toEnd / 8); }
  else if (fromStart < 8 && z > 0) { nz = z - 1; k = 0.5 * (1 - fromStart / 8); }
  return { z, nz, k, P: PAL[z], Q: PAL[nz] };
}
