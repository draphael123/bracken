/* src/mon3-flag.js - THE MONASTERY 3 FLAG (claude/monastery3-1105). OFF on master: the Monastery keeps its old layout until the new one
   (src/monastery3.js) is proven and arted (art before live). On for a look: ?mon3=1 in the page, or MON3=1 for a Node tool
   (MON3=1 node tools/level-quality.mjs spire). Flip MON3_SHIPS when the art pass and the tune have merged. */
export const MON3_SHIPS = false;
export const MON3 = MON3_SHIPS || (typeof location !== 'undefined' && /[?&]mon3=1(?:&|#|$)/.test(location.search || '')) || (typeof process !== 'undefined' && !!process.env && process.env.MON3 === '1');
