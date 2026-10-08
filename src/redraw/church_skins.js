// src/redraw/church_skins.js - THE LIT CHURCH's CAST, out of proven sheets (claude/litchurch, the greybox: recolours only - the art pass draws them properly).
// Every frame of the base sheet is recoloured pixel for pixel (the same trick src/redraw/undercrown_skins.js uses), so the frame order, anchors and boxes are
// the base's own and the AI's frame picks are untouched:
//   THE PRIEST      (the bandit mystic's caster sheet, itself the goblin mage's machine)   a cream alb and a gold stole
//   THE ARCHDEACON  (the same)                                                              a violet cope (he is drawn half as big again: the elite)
//   THE ACOLYTE     (Waymeet's runner)                                                      a red cassock under the white surplice, a taper in his hand
//   THE CHAPEL KNIGHT (Waymeet's sworn sword)                                               a white surcoat over the mail
//   THE TEMPLAR     (Waymeet's hedge knight)                                                white over the plate, gold at the trim
//   THE CHAPEL CROSSBOW (Waymeet's crossbowman)                                             the same white
import { canvas, flipX, whiten } from '../px.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const recolour = (c, map) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, m = Object.entries(map).map(([k, v]) => [hex(k), hex(v)]);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue;
    for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0); return o; };
/* the base sheets' own colours (read off the baked sheets): the mystic's dust-red robe 8a3a2a / 6a2a1e / b0583e / 5a2218 / 40160e; the runner's tunic 6a4a2a / 43301c;
   the sworn sword's and the crossbowman's blue 3a5a8a / 22355a; the hedge knight's red 9a3a3a and his leather 8a6a4a */
export const CHURCH_SKINS = {
  priest: { base: 'banditmystic', map: { '#8a3a2a': '#d8d0bc', '#6a2a1e': '#a49c88', '#b0583e': '#f2ecdc', '#5a2218': '#7a7262', '#40160e': '#544c40' } },
  archdeacon: { base: 'banditmystic', map: { '#8a3a2a': '#5a3a7a', '#6a2a1e': '#3e2858', '#b0583e': '#7c5c9c', '#5a2218': '#2e1e44', '#40160e': '#1e1430' } },
  acolyte: { base: 'runner', map: { '#6a4a2a': '#8a2a2a', '#43301c': '#5a1a1a' } },
  chapelknight: { base: 'swornsword', map: { '#3a5a8a': '#e4dccc', '#22355a': '#a49c88' } },
  templar: { base: 'hedgeknight', map: { '#9a3a3a': '#e4dccc', '#8a6a4a': '#c9a050' } },
  chapelbow: { base: 'crossbow', map: { '#3a5a8a': '#e4dccc', '#22355a': '#a49c88' } },
};
export function bakeChurchSkins(SPR) {
  const out = {};
  for (const [skin, { base, map }] of Object.entries(CHURCH_SKINS)) { const s = SPR[base]; if (!s || !s.R) continue;
    out[skin] = pack(s.R.map(c => recolour(c, map)), s.ax, s.ay, s.w, s.h); }
  return out;
}
