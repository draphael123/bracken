// hl_goblin_skins.js - THE HIGH LINES' GOBLIN CROSSBOWMAN (claude/hlfix, Daniel 11-12: "we need to use goblin enemies rather than human ones. You can reskin if needed").
// The level's crossbowmen are the crossbow foe's own machine (every AI pick, frame, anchor and hit box untouched) in a goblin's skin: the game's goblin green (#6faa4a, the foes'
// own), narrow red eyes, and a long leaf ear swept back and up over the pavise. Same recolour-and-dress method as src/redraw/church_art.js; wired as cnSkin 'hlgobbow' by the level's L.reskin
// table (a table is not in the level hash, and nothing about the foe's behaviour changes).
import { canvas, flipX, whiten } from '../px.js';
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export const GOB = { skin: '#6faa4a', hi: '#8fc760', lo: '#3f6e2c', eye: '#ff4030', tooth: '#f3f0d2' };
export const HL_GOB_MAP = { '#f3d2a8': GOB.skin, '#2a2f3d': GOB.eye };   /* the crossbowman's face and his slit-eye (chars.js WM: f, j) */
function skin(c) {
  const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, m = Object.entries(HL_GOB_MAP).map(([k, v]) => [hex(k), hex(v)]); let fx0 = 1e9, ey = -1, ex = -1;
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0);
  const sk = hex(GOB.skin), ey0 = hex(GOB.eye);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!d[i + 3]) continue;
    if (d[i] === sk[0] && d[i + 1] === sk[1] && d[i + 2] === sk[2] && x < fx0) fx0 = x; if (d[i] === ey0[0] && d[i + 1] === ey0[1] && d[i + 2] === ey0[2]) { ey = y; ex = x; } }
  if (ey >= 0 && fx0 < 1e9) {   /* the ear: a leaf swept back and up from the face's back edge (drawn over the pavise: it is the goblin's own) */
    const px = (x, y, col) => { if (x >= 0 && y >= 0) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } };
    px(fx0 - 1, ey, GOB.skin); px(fx0 - 1, ey + 1, GOB.lo); px(fx0 - 2, ey - 1, GOB.skin); px(fx0 - 2, ey, GOB.lo); px(fx0 - 3, ey - 2, GOB.hi); px(fx0 - 4, ey - 3, GOB.hi);
    px(ex + 1, ey + 2, GOB.tooth); }   /* and a tusk under the eye */
  return o;
}
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
/* SPR: the sheets already baked (needs SPR.crossbow); returns { hlgobbow } with the base's frame order, anchors and size */
export function bakeHlGoblinSkins(SPR) {
  const s = SPR && SPR.crossbow; if (!s || !s.R) return {};
  return { hlgobbow: pack(s.R.map(skin), s.ax, s.ay, s.w, s.h) };
}
