// src/gq4l.js - GQ4L: HIGHCROWN PASS 4, THE LEVEL HALF (Daniel 11-10 07:45, scratch gq4-plan.md sections 1 + 3). One switch, default OFF: OFF = master's Highcrown cell for cell.
// ON: the Battlements +40 columns (G1 THE GATEHOUSE, G2 THE LEADS WALK), the Princess's bell tower 26 -> 46 columns (a SHELL: GQ4P fills the room), the Queen's Stair +36
// (B3b THE ARMOURY LANDING, B3c THE ROOF LEADS), the early Geomancers (E1 the switchback crag, E2 the chapel loft), the new foes (stilt-walkers, fire mages, castle hounds,
// THE QUEEN'S KNIGHT = cnSkin 'gobknight' on the hedge knight), the burning tower 5 -> 7 storeys with the OUTSIDE stretch up its face (src/gq3-tower.js, gqueen-hands.js TOWER section).
// The override for review and the lanes: ?gq4l=1 on the page, globalThis.BRACKEN_GQ4L = true (tools/cdp.mjs sets it from the env BRACKEN_GQ4L=1), or BRACKEN_GQ4L=1 in a Node tool's env.
export const GQ4L_SHIPS = true;
export function gq4lOn() {
  if (GQ4L_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ4L === true || globalThis.BRACKEN_GQ4L === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq4l=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ4L === '1') return true; } catch { /* no node */ }
  return false;
}
/* the column arithmetic every pinned column rides on (ON): battlements +40 (G1/G2) and the bell tower +20 sit before the Queen's Stair (STAIR_AT shifts +60); the stair's +36 and the
   two insert blocks together shift the Queen's hall, her escape and the tower top +96. Read at import (the page's ?gq4l=1 and a tool's env are both set before the first import). */
export const G4 = gq4lOn();
export const SHIFT = { battle: G4 ? 40 : 0, bell: G4 ? 20 : 0, stair: G4 ? 36 : 0 };
export const SH_STAIR = SHIFT.battle + SHIFT.bell;                 // columns east of the bell tower's old east wall slide this far (the Queen's Stair AT: 652 -> 712)
export const SH_HALL = SH_STAIR + SHIFT.stair;                     // the Queen's hall, her escape, the tower top: 96
