// src/redraw/lesser_djinn_art.js - THE LESSER DJINN, drawn (claude/djinn3). Little cousins of the Djinn of the Great Well: a tiny bald head with a
// topknot and burning eyes over a WHIRL that tapers to a point - his silhouette at a hero's knee height. THE SAND SPIRIT is ochre sand with grains
// streaming round it; THE FIRE SPIRIT is coal and flame. Open (the pour landed), the sand spirit is a MUD lump with two dim eyes, the fire spirit a grey
// smoking CLAY lump. Baked as a sprite set (frames below) so the living foe, its hurt flash and its corpse all draw the same skin (tools/corpses.mjs).
//   bakeLesserDjinn(kind) -> { R, L, white, ax, ay, w, h }   kind 'sanddjinn' | 'firedjinn'
export const LDJ_F = { whirl0: 0, whirl1: 1, flare: 2, open: 3, hurt: 4, dead: 5 };
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';

const LOOK = {
  sanddjinn: { skin: '#c99a5a', skinD: '#8a6438', skinL: '#ecc98a', cone: '#d8b070', coneD: '#a8804a', grain: '#f2dca0', eye: '#fff2a0', lump: '#6e4a2c', lumpD: '#4a3018', lumpL: '#8e6a44', lumpEye: '#e8c060' },
  firedjinn: { skin: '#3a1a14', skinD: '#200c08', skinL: '#7a2e18', cone: '#d84a14', coneD: '#7a2410', grain: '#ffd36b', eye: '#ffffff', lump: '#6a6460', lumpD: '#46403c', lumpL: '#8e8884', lumpEye: '#ffb84a' },
};
const W = 22, H = 26, AX = 11, AY = 24;
const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(AX + x, AY + y, w, h); };

/* one frame, drawn in its own frame: origin at the foot, -y up */
function frame(g, L, f, fire) {
  if (f === LDJ_F.open || f === LDJ_F.dead) {   /* THE LUMP: mud (sand) or clay (fire) on the floor */
    const flat = f === LDJ_F.dead ? 1 : 0;
    px(g, L.lumpD, -7, -4 + flat * 2, 14, 4 - flat * 2); px(g, L.lump, -6, -6 + flat * 3, 12, 3); px(g, L.lump, -4, -8 + flat * 4, 8, 2); px(g, L.lumpL, -3, -8 + flat * 4, 3, 1);
    if (!flat) { px(g, L.lumpEye, -3, -6, 1, 1); px(g, L.lumpEye, 2, -6, 1, 1); }
    if (fire) { px(g, '#9aa39a', -2, -11 + flat * 4, 1, 2); px(g, '#c8d0d8', 1, -13 + flat * 4, 1, 2); }   /* the clay still smokes */
    else { px(g, L.lumpD, -5, -1, 1, 1); px(g, L.lumpD, 4, -1, 1, 1); }                                       /* the mud slumps */
    return; }
  /* THE WHIRL: a cone to a point at the floor, its bands turning (frame 0/1 alternate the bands) */
  const ph = f === LDJ_F.whirl1 ? 1 : 0;
  for (let y = -12; y < 0; y++) { const w = Math.max(1, Math.round((y + 12) / 12 * -6 + 6)); px(g, L.coneD, -w, y, w * 2, 1); px(g, L.cone, -w + 1, y, Math.max(1, w * 2 - 2), 1); }
  for (let i = 0; i < 3; i++) { const y = -11 + ((i * 4 + ph * 2) % 11), w = Math.max(1, Math.round(6 - (y + 12) / 2)); px(g, L.grain, -w + ((i + ph) % 2), y, Math.max(1, w), 1); }
  px(g, L.grain, -8 + ph, -9, 1, 1); px(g, L.grain, 7 - ph, -6, 1, 1); px(g, L.grain, -7, -3 + ph, 1, 1);
  /* THE LITTLE TORSO, ARMS AND HEAD: his shoulders, his topknot, his eyes */
  px(g, L.skinD, -5, -16, 10, 4); px(g, L.skin, -4, -16, 8, 3); px(g, L.skinL, -3, -15, 2, 1);
  const up = f === LDJ_F.flare; px(g, L.skin, -7, up ? -20 : -15, 2, up ? 5 : 3); px(g, L.skin, 5, up ? -20 : -15, 2, up ? 5 : 3);
  px(g, '#4a4e56', -7, up ? -20 : -13, 2, 1); px(g, '#4a4e56', 5, up ? -20 : -13, 2, 1);   /* his shackle-cuffs, small */
  px(g, L.skinD, -3, -22, 6, 6); px(g, L.skin, -2, -22, 4, 5); px(g, L.skinD, -1, -24, 2, 2); px(g, L.skinD, -4, -20, 1, 2); px(g, L.skinD, 3, -20, 1, 2);
  const eye = f === LDJ_F.flare ? '#ffffff' : L.eye; px(g, eye, -2, -20, 1, 1); px(g, eye, 1, -20, 1, 1);
  if (fire) { for (const [x, y, h] of [[-4, -14, 3], [3, -13, 3], [0, -25, 2], [-2, -9, 2], [2, -7, 2]]) px(g, (x + y) % 2 ? '#ffd36b' : '#ff9a3c', x, y - h, 1, h); }
  if (f === LDJ_F.flare) { px(g, fire ? '#fff2c0' : '#fff6d8', -1, -26, 2, 1); }
}
const SETS = {};
export function bakeLesserDjinn(kind) {
  if (SETS[kind]) return SETS[kind];
  const L = LOOK[kind] || LOOK.sanddjinn, fire = kind === 'firedjinn';
  const F = [0, 1, 2, 3, 4, 5].map(f => { const [c, g] = canvas(W, H); frame(g, L, f === LDJ_F.hurt ? LDJ_F.whirl0 : f, fire); outline(c, OUT); return c; });
  SETS[kind] = { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax: AX, ay: AY, w: 12, h: 14 };
  return SETS[kind];
}
