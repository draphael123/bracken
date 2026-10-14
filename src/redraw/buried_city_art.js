// buried_city_art.js - THE BURIED CITY's cast (claude/bc2art, the art pass): every sprite is its own drawing now (src/redraw/buried_city_cast.js) on the contract of the machine it replaced - the
// greybox's recoloured caravan sheets are gone. main.js bakes them once: for (const k in K) SPR[k] = K[k].
//   construct      THE CLOCKWORK CONSTRUCT  (src/construct.js: a clock-face head, an escapement in its chest)
//   sanddrowned    THE SAND-DROWNED         (the ambusher's frames: a bleached citizen in a gilded collar)
//   sandslinger    THE SAND-FOLK SLINGER    (the slinger's frames: a lean man in dust-blue, goggles on his wrap)
//   brassscorpion  THE BRASS SCORPION       (the scorpion's frames: plated brass, a cog and a key in its back)
//   hourglassking  the king's bestiary card (his idle frames); he draws himself in his fight (src/hourglass-king-hands.js)
import * as CAST from './buried_city_cast.js';

/* every set at once (main.js: for (const k in K) SPR[k] = K[k]) */
export function bakeBuriedCitySets() {
  const out = { construct: CAST.bakeConstruct(), constructelite: CAST.bakeConstruct(true) };
  const king = CAST.bakeHourglassKing(0); out.hourglassking = { R: [king.R[0], king.R[1]], L: [king.L[0], king.L[1]], white: { R: [king.white.R[0], king.white.R[1]], L: [king.white.L[0], king.white.L[1]] }, ax: king.ax, ay: king.ay, w: king.w, h: king.h };
  out.sanddrowned = CAST.bakeSandDrowned(); out.sandslinger = CAST.bakeSandSlinger(); out.brassscorpion = CAST.bakeBrassScorpion(); out.sandbound = CAST.bakeSandBound();   /* (claude/buriedcity4) THE SAND-BOUND (finished: claude/bc4art) */
  { const sb = out.sandbound, pick = (a, ix) => ix.map(i => a[i]); out.sandboundCard = { R: pick(sb.R, [2, 3, 4, 5]), L: pick(sb.L, [2, 3, 4, 5]), white: { R: pick(sb.white.R, [2, 3, 4, 5]), L: pick(sb.white.L, [2, 3, 4, 5]) }, ax: sb.ax, ay: sb.ay, w: sb.w, h: sb.h }; }   /* (its bestiary card walks and slams: not the mound) */
  return out;
}
