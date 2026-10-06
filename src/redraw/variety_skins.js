// variety_skins.js - THE VARIETY LANE'S RECOLOURS (claude/variety, Daniel 10-03). Same trick as undercrown_skins.js: the proven foe's own sheet recoloured
// pixel for pixel, so the frame order, anchors and boxes are the base set's and the AI's frame picks are untouched (and a body dies in its own skin:
// main.js reskinSet() reads SPR[e.cnSkin]).
//   FIRE IMP      (the Folly's imp)   ember-red body, white-hot flame: the Archmage's fire realm, foreshadowed on the Falling Tower
//   VENOM IMP     (the Folly's imp)   bottle-green body, a green flame: its orb poisons (the Archmage's poison realm)
//   POWDER MONKEY (the dynamite bandit)  a flotilla powder-boy in a navy jersey with a bandolier of sticks: the bandit's AI, lit and thrown on a told mark (src/main.js isDyn)
//   TIDE CRAB     (the shore crab)    a sea-green mud crab with sand-pale claw tips: it lies buried at low water and comes up with the flood (src/main.js tideCrab)
//   STRONGMAN     the fair's strongman: (claude/fairfix6) NO LONGER A RECOLOUR - the goblin brute's sheet in a tan skin kept the goblin's hunched silhouette and ears (Daniel's
//                 10-05 playtest: 'orangish goblin-looking foes'). He is drawn as a man now (src/redraw/fair_folk.js bakeStrongman, baked by src/main.js), in the brute's five frames
import { canvas, flipX, whiten } from '../px.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const recolour = (c, map) => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data, m = Object.entries(map).map(([k, v]) => [hex(k), hex(v)]);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue;
    for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0); return o; };
export const VARIETY_MAPS = {
  /* the imp's IMP ramp (#4a1030 #8a2a5a #c04a7a #f090b0), its yellow eyes and its flame (#ff6b2c #ffa040 #ffe080) */
  fireimp: { '#4a1030': '#5a1408', '#8a2a5a': '#b83a14', '#c04a7a': '#ee6a22', '#f090b0': '#ffc47a', '#ff6b2c': '#ffb030', '#ffa040': '#ffd860', '#ffe080': '#fff4c0' },
  venomimp: { '#4a1030': '#10301a', '#8a2a5a': '#1f5a2a', '#c04a7a': '#4a9a34', '#f090b0': '#a8dc68', '#ffe080': '#e8ff50', '#ff6b2c': '#4ad02a', '#ffa040': '#90f060' },
  /* the dynamite bandit's vest, its facing and its head-cloth -> a flotilla powder-boy's navy jersey and a white bandana (the sticks, the soot-black face and the boots stay) */
  /* the eel's EE ramp: body a/m/d, belly b -> electric blue with a yellow belly (the eye, the teeth and the mouth stay) */
  shockeel: { '#5e7672': '#5a7cf0', '#3e5452': '#2e48b0', '#2a3a3a': '#1a2a6a', '#4e6664': '#3a58c8', '#a8b8a0': '#f0e070' },
  /* the crab's CR ramp: shell r/R/h/d (red-brown) -> a mud-green shell, claw tips t stay sand-pale */
  tidecrab: { '#b8483a': '#5f8a6c', '#8a3028': '#3e5f48', '#e07060': '#9cc8a0', '#5a2018': '#2a4030', '#f0d8c0': '#e8e0b0' },
  powderboy: { '#9a3a22': '#2a4a7a', '#6a2214': '#1c3252', '#a8583a': '#4a6a9a', '#c8902a': '#e8e0d0' },
};
const FOR = { fireimp: 'imp', venomimp: 'imp', powderboy: 'dynamiter', shockeel: 'eel', tidecrab: 'crab' };
export function bakeVarietySkins(SPR) {
  const out = {};
  for (const [skin, base] of Object.entries(FOR)) { const s = SPR[base]; if (!s || !s.R) continue;
    out[skin] = pack(s.R.map(c => recolour(c, VARIETY_MAPS[skin])), s.ax, s.ay, s.w, s.h); }
  return out;
}
