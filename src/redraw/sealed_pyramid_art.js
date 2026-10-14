// src/redraw/sealed_pyramid_art.js - THE SEALED PYRAMID's cast, bake entry (claude/spart: the art pass; the greybox's recoloured base sheets are gone).
// main.js bakes them once: const K = SPA.bakeSealedPyramidSets(SPR); for (const k in K) SPR[k] = K[k]. Each set keeps the CONTRACT of the machine under it (every frame faces
// RIGHT, L is the flip; ax = the body's centre column; ay = the row under the lowest pixel; w/h = the hit box), so every tell, hurt frame and corpse is where its AI expects it
// (tools/corpses.mjs). The drawings: src/redraw/sealed_pyramid_cast.js (mummy, warden, dart-blower, jackal, scarab, seal) and sealed_pyramid_mother.js (her card).
//   mummy / mummywarden   THE MUMMY (src/mummy.js, 8 frames) and THE TOMB-WARDEN, the elite's own sheet (the same frames: a gold death mask, a nemes, a bronze pectoral)
//   dartblower / jackal / scarab   the reskins (cnSkin), each its own drawing
//   scarabmother          her bestiary card; she draws herself in her fight (src/scarab-mother-hands.js, poses baked by sealed_pyramid_mother.js)
import * as CAST from './sealed_pyramid_cast.js';
import * as MOM from './sealed_pyramid_mother.js';
import { bakeTombKingCard } from '../tomb-king-hands.js';   /* (claude/pyramidboss) THE COFFIN KING's card: a placeholder until lane C */
export const bakeMummy = CAST.bakeMummy;
export const bakeScarabMotherCard = MOM.bakeCard;
export function bakeSealedPyramidSets(SPR) {
  return { mummy: CAST.bakeMummy(), mummywarden: CAST.bakeMummy('warden'), scarabmother: MOM.bakeCard(), tombking: bakeTombKingCard(), dartblower: CAST.bakeDartBlower(), jackal: CAST.bakeJackal(), scarab: CAST.bakeScarab(), scarabseal: CAST.bakeSealIcon(), tombskel: CAST.bakeSkeleton() };   /* (claude/pyramidlevel) THE TOMB GUARD - a placeholder sheet on the mummy's contract */
}
