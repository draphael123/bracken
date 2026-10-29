// rookery_pal.js - THE ROOKERY's ONE PALETTE (claude/rookeryart). A harpies' cliff high over the cloud: the stone is WIND-SCOURED, grey-lilac and bone, STREAKED WHITE with GUANO
// where the birds have lived for a thousand years; the nests are BONE AND TWIG (pale bone, grey-brown twig, a cream egg); the air is cold, pearl, silver, and gets bruised and
// rose-lit as the road climbs toward the Roc. Gold stays the game's TARGET colour (the open ring, the glint on a mark) - nothing here is the glint's #ffd36b.
// ZONES follow the level's own sections (src/rookery.js SECTIONS) so a tile, a backdrop and a prop agree on which place they are in.
export const ZONES = [
  { id: 'ledges', name: 'THE GUANO LEDGES', x0: 0, x1: 106 },
  { id: 'terraces', name: 'THE NEST TERRACES', x0: 106, x1: 206 },
  { id: 'chimneys', name: 'THE UPDRAFT CHIMNEYS', x0: 206, x1: 316 },
  { id: 'stair', name: 'THE BONE STAIR', x0: 316, x1: 440 },   /* (claude/rookery3: the stair goes on 72 columns - src/rookery.js EXT) */
  { id: 'crag', name: "THE SISTERS' CRAG", x0: 440, x1: 9999 },
];
export const zoneOf = x => { for (let i = 0; i < ZONES.length; i++) if (x < ZONES[i].x1) return i; return ZONES.length - 1; };
/* GUANO: the white the birds leave (a lit crust, a body, a grey shadow side) and BONE: a nest's pale sticks, a skull, an egg */
export const GUANO = ['#9a9aa6', '#c6c6cc', '#e6e4e0', '#f8f6f0'];
export const BONE = ['#6e6450', '#a89a7c', '#d4c8a8', '#ece4cc'], TWIG = ['#2c2218', '#4a3a28', '#6e5a40', '#8e7852'], EGG = ['#a89e84', '#d8ceb0', '#efe8d2'];
export const IRON = ['#1e1c22', '#3e3c46', '#6c6a78', '#a4a2b0'], RED = ['#5a1a1a', '#8f2f28', '#c4463a', '#ff5a4a'];
/* each place's STONE (a ramp of seven, s0 deepest .. s6 the lit lip), its LICHEN, and the air: sky = [top, mid, horizon], haze = the colour of the air, far/mid = silhouettes */
export const PAL = [
  { s: ['#1b1a26', '#2e2c3c', '#4a4860', '#6c6a82', '#908ea4', '#b4b2c4', '#d8d6e0'], lichen: ['#8a9a5a', '#b0a050'], tuft: ['#6a6a48', '#9a9a68'],
    sky: ['#94a4c8', '#c0cae0', '#ece8f0'], haze: '#d4d6e6', far: ['#8e98b8', '#a6aec8'], mid: ['#6a7092', '#838aa8', '#9ea4bc'] },
  { s: ['#1e1b20', '#322d36', '#4e4650', '#6e6470', '#908690', '#b4a8aa', '#d8cece'], lichen: ['#9aa056', '#c4a048'], tuft: ['#6e6244', '#a09468'],
    sky: ['#9aa4c4', '#c8c8dc', '#eee4e8'], haze: '#dcd2de', far: ['#9a9ab4', '#b0aac0'], mid: ['#746c88', '#8e869c', '#aaa2b0'] },
  { s: ['#121a20', '#1e2b34', '#31434f', '#4a6170', '#6b8493', '#91a8b4', '#bacdd4'], lichen: ['#6a9a74', '#8ab08a'], tuft: ['#5a6a58', '#80907a'],
    sky: ['#8498bc', '#b0c0d8', '#e0e8f0'], haze: '#c8d6e4', far: ['#7e92b0', '#98aac4'], mid: ['#586c88', '#70859e', '#8ea0b4'] },
  { s: ['#1c1820', '#322c36', '#524a54', '#786e72', '#a09488', '#c8bca8', '#e8e0cc'], lichen: ['#a49a58', '#c8b060'], tuft: ['#70664c', '#a49a74'],
    sky: ['#8c88b4', '#bcb4d0', '#eadcdc'], haze: '#d8ccd8', far: ['#8a84a8', '#a49cbc'], mid: ['#68608a', '#827aa0', '#a29ab4'] },
  { s: ['#1c161e', '#30242c', '#4e3c46', '#725a62', '#987c80', '#bf9fa0', '#e4c8c4'], lichen: ['#b09a58', '#d0a858'], tuft: ['#76644e', '#a8946e'],
    sky: ['#7a6a9c', '#b890ac', '#f2c8b8'], haze: '#e0bcc0', far: ['#8a7098', '#a88aa8'], mid: ['#6a5282', '#866a9a', '#a88aa8'] },
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
/* the zone's air at a (fractional) column, crossfaded over 24 tiles each side of a seam: { sky: [top, mid, hor], haze, far: [2], mid: [3] } */
export function airAt(mx) {
  const z = zoneOf(mx); let nz = z, k = 0; const toEnd = ZONES[z].x1 - mx, fromStart = mx - ZONES[z].x0;
  if (toEnd < 24 && z < ZONES.length - 1) { nz = z + 1; k = 0.5 * (1 - toEnd / 24); } else if (fromStart < 24 && z > 0) { nz = z - 1; k = 0.5 * (1 - fromStart / 24); }
  const A = PAL[z], B = PAL[nz], m3 = (a, b) => a.map((c, i) => mix(c, b[i] || b[b.length - 1], k));
  return { z, sky: m3(A.sky, B.sky), haze: mix(A.haze, B.haze, k), far: m3(A.far, B.far), mid: m3(A.mid, B.mid) };
}
