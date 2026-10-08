// church_art.js - THE LIT CHURCH's CAST (claude/churchart): the clergy and their escort in their own dress. Each skin is the proven machine's sheet recoloured pixel for pixel (frame order,
// anchors and boxes are the base's own, so every AI pick and hit box is untouched) and then dressed with pixels laid on by hand:
//   THE PRIEST      cream alb with a gold hem, a gold stole down the front and a little cross at the breast, the hood edged in gold
//   THE ARCHDEACON  a violet cope orphreyed in gold at both edges and the collar, and a tall MITRE (cream with a gold band) - he is drawn half as big again (the elite)
//   THE ACOLYTE     a white surplice over a red cassock (the cassock shows below the hem), a lace hem, a red collar
//   THE CHAPEL KNIGHT  the sworn sword in a white surcoat with a red cross on the breast, cream shield
//   THE TEMPLAR     the hedge knight in white over the plate, the gold trim and a red cross
//   THE CHAPEL CROSSBOW  the crossbowman's white with a red cross on the chest
import { canvas, flipX, whiten } from '../px.js';

const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const recolour = (c, map) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, m = Object.entries(map).map(([k, v]) => [hex(k), hex(v)]);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0); return [o, g]; };
/* the opaque bounding box of a frame (outline included) */
const bbox = c => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, x1, y0, y1 }; };
const solid = (g, x, y) => g.getImageData(x, y, 1, 1).data[3] > 0;
/* lay a pixel only on the sprite itself (never in the air round it) unless `free` */
const dot = (g, x, y, c, free) => { if (x < 0 || y < 0) return; if (!free && !solid(g, x, y)) return; g.fillStyle = c; g.fillRect(x, y, 1, 1); };
const GOLD = '#d8b040', GOLDLO = '#8a6a1c', GOLDHI = '#fff0a8', RED = '#b8342c', CREAM = '#f2ecdc', CREAMLO = '#cfc7b0';

export const CHURCH_SKINS = {
  priest: { base: 'banditmystic', map: { '#8a3a2a': '#d8d0bc', '#6a2a1e': '#a49c88', '#b0583e': '#f2ecdc', '#5a2218': '#7a7262', '#40160e': '#544c40' },
    fx: (fi, g, b) => { const mid = (b.x0 + b.x1) >> 1;
      for (let x = b.x0 + 1; x < b.x1; x++) dot(g, x, b.y1 - 2, x & 1 ? GOLD : GOLDLO);   /* the gold hem */
      for (let y = b.y0 + 9; y < b.y1 - 2; y++) { dot(g, mid, y, GOLD); dot(g, mid + 1, y, GOLDLO); }   /* the stole */
      dot(g, mid, b.y0 + 7, GOLDHI); dot(g, mid - 1, b.y0 + 8, GOLD); dot(g, mid, b.y0 + 8, GOLDHI); dot(g, mid + 1, b.y0 + 8, GOLD); dot(g, mid, b.y0 + 9, GOLD);   /* the breast cross */
      for (let x = b.x0 + 2; x < b.x1 - 1; x += 2) dot(g, x, b.y0 + 1, GOLDLO); } },   /* the hood's gold edge */
  archdeacon: { base: 'banditmystic', map: { '#8a3a2a': '#5a3a7a', '#6a2a1e': '#3e2858', '#b0583e': '#7c5c9c', '#5a2218': '#2e1e44', '#40160e': '#1e1430' },
    fx: (fi, g, b) => { const mid = (b.x0 + b.x1) >> 1;
      for (let k = 0; k < 6; k++) for (let x = mid - 3 + (k > 3 ? k - 3 : 0); x <= mid + 2 - (k > 3 ? k - 3 : 0); x++) dot(g, x, b.y0 - 1 - k, k === 2 ? GOLD : k === 0 ? CREAMLO : CREAM, true);   /* the mitre */
      dot(g, mid - 1, b.y0 - 5, GOLD, true); dot(g, mid, b.y0 - 6, GOLDHI, true);
      for (let y = b.y0 + 7; y < b.y1 - 1; y++) { dot(g, b.x0 + 1, y, GOLD); dot(g, b.x1 - 1, y, GOLD); }   /* the cope's orphrey */
      for (let x = b.x0 + 1; x < b.x1; x++) dot(g, x, b.y0 + 7, GOLD);   /* the collar */
      dot(g, mid, b.y0 + 10, GOLDHI); dot(g, mid - 1, b.y0 + 11, GOLD); dot(g, mid + 1, b.y0 + 11, GOLD); dot(g, mid, b.y0 + 12, GOLD); } },
  acolyte: { base: 'runner', map: { '#6a4a2a': '#8a2a2a', '#43301c': '#5a1a1a' },
    fx: (fi, g, b) => { const h = b.y1 - b.y0; for (let y = b.y0 + Math.round(h * 0.45); y < b.y1 - 2; y++) for (let x = b.x0 + 1; x < b.x1; x++) if (solid(g, x, y) && isTunic(g, x, y)) dot(g, x, y, y === b.y1 - 3 ? CREAMLO : CREAM);   /* the surplice */
      for (let x = b.x0 + 1; x < b.x1; x += 2) dot(g, x, b.y1 - 3, '#ffffff'); } },
  chapelknight: { base: 'swornsword', map: { '#3a5a8a': '#e4dccc', '#22355a': '#a49c88' }, fx: (fi, g, b) => cross(g, b) },
  templar: { base: 'hedgeknight', map: { '#9a3a3a': '#e4dccc', '#8a6a4a': '#c9a050' }, fx: (fi, g, b) => cross(g, b) },
  chapelbow: { base: 'crossbow', map: { '#3a5a8a': '#e4dccc', '#22355a': '#a49c88' }, fx: (fi, g, b) => cross(g, b) },
};
const isTunic = (g, x, y) => { const d = g.getImageData(x, y, 1, 1).data; return d[0] > d[2] + 30 && d[0] > 70; };   /* a red/brown body pixel (not skin, steel or outline) */
function cross(g, b) { const mx = (b.x0 + b.x1) >> 1, my = b.y0 + Math.round((b.y1 - b.y0) * 0.5); for (const [dx, dy] of [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]]) dot(g, mx + dx, my + dy, RED); }
export function bakeChurchSkins(SPR) {
  const out = {};
  for (const [skin, { base, map, fx }] of Object.entries(CHURCH_SKINS)) { const s = SPR[base]; if (!s || !s.R) continue;
    out[skin] = pack(s.R.map((c, fi) => { const [o, g] = recolour(c, map); if (fx) { const b = bbox(o); if (b.x1 >= 0) fx(fi, g, b); } return o; }), s.ax, s.ay, s.w, s.h); }
  return out;
}
export async function sheetItems() {
  const C = await import('../chars.js'), M = await import('./mystic_art.js'), SPR = { banditmystic: M.bakeBanditMystic(), runner: C.bakeRunner(), swornsword: C.bakeSwornSword(), hedgeknight: C.bakeHedgeKnight(), crossbow: C.bakeCrossbowman() };
  const S = bakeChurchSkins(SPR), out = [];
  for (const k of ['priest', 'archdeacon']) out.push(...S[k].R); for (const [k, b] of [['acolyte', 'runner'], ['chapelknight', 'swornsword'], ['templar', 'hedgeknight'], ['chapelbow', 'crossbow']]) out.push(...SPR[b].R.slice(0, 3), ...S[k].R.slice(0, 3));
  return out; }
