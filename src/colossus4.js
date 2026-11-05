// src/colossus4.js - THE GLASS SEA + COLOSSUS 4 FLAG and its numbers (claude/colossus4, 11-05, the OPUS GREYBOX; brief scratch/brief-colossus4-1014.md,
// plan scratch/plan-desert-1105.md section 1.5 "THE SUN IS A BEAM YOU AIM"). Pure data + the flag: no imports, so src/glass-colossus.js and src/glass-sea.js
// can both read it without a cycle.
//
// OFF (COL4_SHIPS false, no override) = master exactly: the 64-wide arena, the 200 px giant, the old openings, the old level.
// ON:
//   * THE BEAM PATH (src/beam-path.js): every light that can open him is DRAWN - brazier/sun -> mirror -> where it lands. The moment it lands ON him he
//     CRACKS (instant: flash, shatter, 'THE DAWN BURNS HIM' / 'THE FIRE BURNS HIM'); lined up but he is not there = the beam ends short at a station + a
//     marker 'HE COMES TO THE LIGHT' and he walks to it next (never a silent wait). P1 keeps the lance (his own sun, bent back by a FACING mirror) and
//     the lance comes next once a facing mirror waits on your side.
//   * SIZE x1.6 (Daniel 10-14: he should match the backdrop silhouette): 115 x 320, five rows of holds (3/6/9/12/15, each a plain 3-row jump), the arena
//     80 wide (stations 20/40/60, mirrors 10/30/50/70, braziers on each mirror's outer side).
//   * THE LEVEL: THE SHATTER-PANES (a platforming section down the back of the Sunken Head, crystal panes that craze under you), THE GLYPH COURT at the
//     fork (a sun-lamp on the Temple door: the told SUN TEMPLE find, on the main road) + one optional DESERT PRIEST CACHE (src/sun-puzzle.js), one checkpoint
//     fewer, a light-touch mirage.
// The override for review and the tune lane: ?col4=1 on the page, globalThis.BRACKEN_COL4 = true (tools/cdp.mjs sets it from the env BRACKEN_COL4=1, so
// boss-rates' reloads keep it), or BRACKEN_COL4=1 in a Node tool's env.
export const COL4_SHIPS = false;
export function col4On() {
  if (COL4_SHIPS) return true;
  try { if (globalThis.BRACKEN_COL4 === true || globalThis.BRACKEN_COL4 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]col4=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_COL4 === '1') return true; } catch { /* no node */ }
  return false;
}
/* THE STAGE at x1.6 (columns from the arena's west wall; holds as [from, to] columns from his centre column; rows over the floor) */
export const STAGE4 = { W: 80, cc: 40, stations: [20, 40, 60], mirrors: [10, 30, 50, 70], fires: [8, 28, 52, 72],
  knee: 3, kneeW: [-8, -5], kneeE: [4, 7], thigh: 6, thighW: [-7, -4], thighE: [3, 6], hip: 9, hipW: [-6, -3], hipE: [2, 5],
  shoulder: 12, shoulderW: [-7, -3], shoulderE: [2, 6], collar: 15, collarW: [-5, -3], collarE: [2, 4], crown: 19, crack: [-5, 4],
  zoneLegs: 4.5, zoneChest: 10.5, eyeH: 280, scale: 1.6, c4: true };
/* the fight's numbers that scale with him (the rest of COL is untouched: the tune lane owns hp, damage and timing) */
export const COL4 = { floor: 0.4, w: 115, h: 320, stompFoot: 48, sweepIn: 64, crackFoot: 48, footOut: 45, trampleW: 24, walkV: 68, lungeReach: 520 };
/* THE LIGHT: the dawn sun stands in the EAST (a sky-mirror throws it WEST, onto his crown at the station 10 columns on); a brazier sits on its mirror's OUTER
   side and a mirror TO THE FIRE throws its light on along the floor INWARD (onto his crack at the station 10 columns on) */
export const LIGHT4 = { throwCols: 10, sunRay: [6, 26], burnWord: 'THE DAWN BURNS HIM', fireWord: 'THE FIRE BURNS HIM: HIS SHOULDERS BLAZE', comesWord: 'HE COMES TO THE LIGHT',
  wallWord: 'THE LIGHT FALLS ON THE WALL', lanceNext: 'HIS LANCE COMES NEXT: STAND BEHIND THE MIRROR' };
