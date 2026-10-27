// rookery_props_art.js - THE ROOKERY'S OWN CHECKPOINT SHRINE AND SIGN (claude/rookery2art; Daniel 10-27 photos: "a hanging lantern gibbet on nothing", a wooden post and plank signs in a level with
// no wood). Both fall back to the game's 'wood' kit anywhere else; here they are bone, iron and rock:
//   THE SHRINE  a pedestal of crag stone (guano-capped, streaked) that the lantern stands ON; a bone mast lashed to it with sinew; a curved horn arm; a cage lantern of iron bars hung by three links
//               of chain from the horn's tip. Lit: the flame and a glow. The bone mast has its foot IN the stone - it hangs from something and stands on something.
//   THE SIGN    a limestone tablet leaning in a stone stub, three carved lines, guano on its top edge, two feathers tied to a bone peg.
// bakeShrine(lit) -> 20x34 (drawn at x-10, y-34, the game's shrine slot);  signArt() -> 18x18 (drawn at x-9, y-18).
import { canvas, rect as R, line as L, outline, ellipse } from '../px.js';
import { PAL, GUANO, BONE, IRON } from './rookery_pal.js';
const OUT = '#1b1626', S = PAL[1].s, SINEW = ['#5a4a32', '#8a7650', '#b8a47a', '#d8c8a0'];
const px = (g, x, y, c) => R(g, x, y, 1, 1, c);
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export function bakeShrine(lit) {
  return once('sh' + (lit ? 1 : 0), () => {
    const [c, g] = canvas(20, 34), fire = lit ? '#ffd36b' : '#2a2f3d', fireL = lit ? '#fff1c0' : '#3a4050';
    /* the stone pedestal: a squat hoodoo, lit on the west, a guano cap and a drip */
    for (let y = 0; y < 9; y++) { const hw = 5 + Math.round(y * 0.45), x0 = 10 - hw, x1 = 10 + hw; for (let x = x0; x < x1; x++) { const u = (x - x0) / (hw * 2); px(g, x, 25 + y, S[u < 0.25 ? 5 : u < 0.55 ? 4 : u < 0.8 ? 3 : 1]); } px(g, x0, 25 + y, S[6]); px(g, x1 - 1, 25 + y, S[0]); }
    R(g, 5, 24, 11, 2, GUANO[2]); R(g, 6, 23, 7, 1, GUANO[3]); px(g, 14, 24, GUANO[1]); R(g, 7, 26, 1, 4, GUANO[2]); px(g, 7, 30, GUANO[1]); R(g, 12, 27, 1, 2, GUANO[1]);
    R(g, 8, 29, 4, 1, S[1]); R(g, 9, 31, 5, 1, S[1]);
    /* the bone mast, set in the stone and lashed with sinew; a horn arm curving out over */
    R(g, 9, 6, 2, 19, BONE[2]); R(g, 9, 6, 1, 19, BONE[3]); px(g, 10, 14, BONE[1]); px(g, 10, 19, BONE[1]);
    for (const y of [20, 22]) { R(g, 8, y, 4, 1, SINEW[1]); px(g, 8, y, SINEW[3]); px(g, 11, y, SINEW[0]); }   /* the lashing at the foot */
    R(g, 8, 5, 4, 2, BONE[3]); L(g, 11, 5, 15, 3, BONE[2], 2); L(g, 11, 4, 15, 2, BONE[3], 1); px(g, 16, 3, BONE[1]); px(g, 16, 4, BONE[2]);   /* the horn arm */
    R(g, 8, 8, 4, 1, SINEW[2]); R(g, 8, 9, 4, 1, SINEW[1]);
    /* the cage lantern: three links of chain from the arm's tip, an iron cap, bars round the fire */
    for (const y of [5, 7, 9]) { R(g, 15, y, 1, 2, IRON[2]); px(g, 15, y, IRON[3]); }
    R(g, 13, 11, 5, 1, IRON[1]); R(g, 14, 10, 3, 1, IRON[2]); R(g, 13, 12, 5, 7, '#14121a'); R(g, 14, 12, 3, 7, fire); if (lit) { R(g, 15, 14, 1, 3, fireL); px(g, 15, 13, '#fff6e0'); }
    R(g, 13, 12, 1, 7, IRON[1]); R(g, 17, 12, 1, 7, IRON[0]); R(g, 15, 12, 1, 7, IRON[1]); R(g, 13, 19, 5, 1, IRON[1]);
    return outline(c, OUT); });
}
export function signArt() {
  return once('sign', () => {
    const [c, g] = canvas(18, 18);
    for (let y = 0; y < 6; y++) { const hw = 3 + (y >> 1); R(g, 9 - hw, 12 + y, hw * 2, 1, y < 1 ? S[4] : y > 3 ? S[1] : S[3]); px(g, 9 - hw, 12 + y, S[5]); }   /* the stub */
    R(g, 6, 11, 6, 1, GUANO[2]); px(g, 11, 12, GUANO[1]);
    R(g, 2, 1, 14, 10, S[5]); R(g, 2, 1, 14, 1, S[6]); R(g, 2, 10, 14, 1, S[3]); R(g, 15, 2, 1, 8, S[3]); R(g, 2, 2, 1, 8, S[6]);   /* the limestone tablet */
    R(g, 4, 3, 9, 1, S[1]); R(g, 4, 5, 10, 1, S[1]); R(g, 4, 7, 7, 1, S[1]);   /* three carved lines */
    R(g, 3, 0, 8, 1, GUANO[3]); R(g, 5, 1, 4, 1, GUANO[2]); px(g, 12, 1, GUANO[1]);
    px(g, 3, 9, BONE[3]); px(g, 14, 9, BONE[3]);   /* bone pegs */
    L(g, 15, 10, 16, 14, SINEW[2], 1); px(g, 16, 14, '#e6e4ec'); px(g, 16, 15, '#c0bece'); px(g, 15, 15, '#e6e4ec');   /* a feather tied on */
    return outline(c, OUT); });
}
