// src/redraw/sun_priest_icons.js - THE DESERT PRIEST'S TEN ACTIVE-SKILL ICONS (claude/priestart, 11-06), in the house style: a 10 x 12 grid of palette letters,
// baked with the 1 px dark outline (main.js pixIcon). They had fallen through skillIcon to the Pyromancer's flame. main.js: skillIcon(k) tries SP_ICONS[k] first.
import { canvas, outline } from '../px.js';

const PAL = { y: '#ffd36b', w: '#fff6c8', W: '#ffffff', o: '#e8a83a', G: '#b8862a', i: '#f2ead8', I: '#cdbf9c', L: '#2a5fb0', l: '#6aa0e0', g: '#cdf08a', b: '#8a6a44', k: '#cf9468', v: '#3a2a22', s: '#d9b878', S: '#a8844c', d: '#1b1626' };
const E = '..........';
/* keyed by the skill ids of progression-catalog.js (hero 'sunpriest', active) */
export const SP_ICON_ROWS = {
  /* SUN SHARD: a disc of light thrown along the row: the disc, and three streaks of speed behind it */
  spShard: [E, E, '.....yyy..', '....yywwy.', 'y..yywWWwy', 'ww.ywWWWWy', 'y..yywWWwy', '....yywwy.', '.....yyy..', E, E, E],
  /* HALLOWED STEP: two gold chevrons driving forward, a patch of light at both ends of the floor */
  spStep: [E, '.o..y.....', '..o..y....', '...o..y...', '....o..y..', '...o..y...', '..o..y....', '.o..y.....', E, 'yy......yy', 'ssssssssss', E],
  /* SUN-LAMP: a rayed orb of sun on a bronze dish, standing on the floor */
  spLamp: ['....y.....', '.y..y..y..', '..yyyyy...', 'yyywWwyyy.', '..yyyyy...', '.y..y..y..', '....b.....', '...bbbb...', '..bGGGGb..', 'ssssssssss', E, E],
  /* DAWN WARD: a ring of morning with the sun coming up over a line of horizon inside it */
  spWard: ['..yyyyyy..', '.y......y.', 'y...yy...y', 'y..yWWy..y', 'y.yywWWyyy', 'ysssssssSy', 'y........y', '.y......y.', '..yyyyyy..', E, E, E],
  /* PILLAR OF NOON: a column of light dropped from the sky, splashing on the floor */
  spPillar: ['....yy....', '...ywwy...', '...ywwy...', '...ywwy...', '...ywwy...', '..yywWyy..', '..yywWyy..', '.yywwWwyy.', 'oyyywWyyyo', '.o.oooo.o.', 'ssssssssss', E],
  /* MERCY: a plus of green-gold light, sparks of gold at the corners */
  spMercy: ['.y......y.', '....gg....', '....gg....', '..gggggg..', '..gwwwwg..', '....gg....', '....gg....', 'y........y', E, E, E, E],
  /* GLARE: a blinding star, its rays flung level */
  spGlare: ['....w.....', '.w..w..w..', '..w.w.w...', '...www....', 'wwwwWwwwww', '...www....', '..w.w.w...', '.w..w..w..', '....w.....', E, E, E],
  /* SOLAR WIND: three streaks of hot wind along the floor with gold dust in them */
  spWind: [E, E, 'wwwwwwy...', 'o.y.yo.o..', '.ywwwwwwwy', '..o...y.o.', 'wwwwwwy.yo', 'o.y.o.....', E, 'ssssssssss', E, E],
  /* HALO OF NOON: a head in the striped cloth with the gold ring stood over it */
  spHalo: ['..yyyyyy..', '.yw....wy.', '..yyyyyy..', E, '..yLyLyL..', '..LkkkkL..', '..LkvkvL..', '...kkkk...', '.yyyLLyyy.', '.iiiiiiii.', 'iiIiiiIiii', E],
  /* THE BURNING EYE: the almond eye of the sun, lashes of fire above it and a line of light falling from it */
  spEye: ['y..y..y..y', '...yyyy...', '.yywwwwyy.', 'ywwwooowwy', 'ywwoddowwy', 'ywwwooowwy', '.yywwwwyy.', '...yyyy...', '....ww....', '....ww....', '....yy....', E],
};
export function bakeIcons() {
  const out = {};
  for (const [id, rows] of Object.entries(SP_ICON_ROWS)) {
    const [c, g] = canvas(rows[0].length, rows.length);
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (PAL[ch]) { g.fillStyle = PAL[ch]; g.fillRect(x, y, 1, 1); } }));
    out[id] = outline(c, '#1b1626');
  }
  return out;
}
