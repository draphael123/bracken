// undercrown_skins.js - THE UNDERCROWN'S FOES, OUT OF GOBLIN SKINS (claude/goblinsweep, Daniel 10-02/10-03: NO LIVING GOBLINS past the Goblin Queen,
// and the Undercrown counts as past her). The goblins' proven AI stays; only the body changes, and it is read straight off the base sheet:
// every frame of the goblin set is recoloured pixel for pixel (the goblin's green skin and shadow become the new skin), so the frame order,
// anchors and boxes are the base set's own and the AI's frame picks are untouched. (The same trick the canal's toughs use, by recolour here
// because the silhouettes - the pick over the shoulder, the prop, the spear, the rock held up - already read the foe from across the screen.)
//   THE NAVVY       (the goblin miner)     a man in a dark flat cap with a candle, stubble gone to a beard, a collarless shirt, navy trousers
//   THE BONE-CHUCKER (the rock goblin)     bones: a skull and ribs under the same rock and lantern. Undead goblin, so allowed (claude/goblinsweep)
//   THE TIMBERMAN   (the propman)          a pitman in a leather cap and a brown jerkin with the prop on his shoulder
//   THE MINE WARDEN (the castle sentry)    the sentry's kettle helm and bell-run on a man in the mine company's ochre tabard
import { canvas, flipX, whiten } from '../px.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
/* the goblin colours the base sheets are drawn in (src/chars.js EP/KG): skin g, skin shadow G, the tan cap/tunic c9b27c and its shade 8a7a5a, the purple tabard 5a2a7a/3a1850 */
const recolour = (c, map) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, m = Object.entries(map).map(([k, v]) => [hex(k), hex(v)]);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue;
    for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0); return o; };
export const SKIN_MAPS = {
  navvy: { '#6faa4a': '#d09a74', '#3f6e2c': '#4a3426', '#c9b27c': '#6a5a8a', '#8a7a5a': '#3e3458' },   /* skin; beard and trousers; the shirt and cap both go to a woad-blue wool (the candle and the pick stay) */
  bonechucker: { '#6faa4a': '#e8e0c8', '#3f6e2c': '#b8ac8c', '#c9b27c': '#cfc7ad', '#8a7a5a': '#9a9078', '#f3f0d2': '#120e14' },   /* bone, shadowed bone, ribs, sockets for the goblin's eyes */
  timberman: { '#6faa4a': '#d09a74', '#3f6e2c': '#5a4a3a', '#c9b27c': '#7a5a3a' },
  lampsnuffer: { '#1c2c44': '#2c2a30', '#2e4668': '#4a464e', '#101a2a': '#1a181c' },   /* Lamplit Street: the snuffer as a night-warden, the lamplighter's coat gone black (the brass and the cup stay) */
  gravehound: { '#5a4a3a': '#8a96a8', '#3a2e22': '#4a5668' },   /* the Witchlight Stair's one hound: bone-grey with a blue shadow, a grave hound */
  minewarden: { '#6faa4a': '#d09a74', '#3f6e2c': '#4a3a2c', '#5a2a7a': '#b8862a', '#3a1850': '#7a5a1c' },
};
const FOR = { navvy: 'miner', bonechucker: 'rockgoblin', timberman: 'propman', minewarden: 'sentry', lampsnuffer: 'lamplighter', gravehound: 'hound' };
export function bakeUndercrownSkins(SPR) {
  const out = {};
  for (const [skin, base] of Object.entries(FOR)) { const s = SPR[base]; if (!s || !s.R) continue;
    out[skin] = pack(s.R.map(c => recolour(c, SKIN_MAPS[skin])), s.ax, s.ay, s.w, s.h); }
  return out;
}
