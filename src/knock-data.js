// src/knock-data.js - THE PER-ACT KNOCK-INTO DATA PASS (claude/kifollow, scratch/brief-combat2.md '!! 10-11 16:35').
// src/knock-into.js reads what every level already carries (tiles, pools, props, fires). A hazard a level DRAWS ITSELF - lava painted by a
// decor row, quicksand held in L.quicksand - is not in those tables; this file turns that data into the rows `L.knockHazards` takes:
// { kind, x0, x1, y0, y1 } in px. NO per-level CODE: a level either has rows here or has none. loadLevel installs them (main.js).
//
// AUDITED, one line per act (what holds a real hazard a throw should know, and what was found already covered):
//   ACT I   wood / marsh / stockade / mill / reeds ... spikes + pits = tiles; the marsh and mere pools carry harm / poison (pools); bog 'foul'. Covered.
//   ACT II  ore road / oreroad mines / the Deep Rails .. LAVA under the ramp (decor 'lava', minecart.js) - ROWS BELOW. Crushers + hot plates + firevents = props. Covered.
//   ACT III reef / keep / canal / harbour ......... water = pools (deep = kill, harm = share). The canal's lock drop = the world's floor. Covered.
//   ACT IV  fair / theatre / hexed fields ......... spikes = tiles, the fair's fire jugglers' braziers = props. Covered.
//   DESERT  caravan / buried city / dune ........ QUICKSAND (L.quicksand) = held ('INTO THE SAND', never a kill) - AUTO-LISTED below; the sun is not a hazard to a foe.
//   TOWER   falling tower cistern = pools (deadly / poison). The sanctum's arcane floor is a CARPET-FLIGHT arena with no common foes. Nothing to add.
//   LATE    frost / fire volcano / demon act (not built yet): add their lava, ice-melt and brimstone rows HERE when they land.
export const KNOCK_DATA = {
  /* THE DEEP RAILS: the glow cavern's lava under the ramp. Its surface is the decor row; below it is lava to the floor of the world. */
  minecart: (L, TS, LH) => (L.decor || []).filter(d => d.kind === 'lava').map(d => ({ kind: 'lava', x0: d.x0 * TS, x1: (d.x1 + 1) * TS, y0: d.row * TS + 2, y1: LH * TS })),
};
/* QUICKSAND (auto): every patch in L.quicksand holds a thrown foe. y is the patch's surface; a foe is in it from just above to the depth it can sink. */
const sandRows = L => (L.quicksand || []).map(q => ({ kind: 'sand', x0: q.x0, x1: q.x1, y0: q.y - 3, y1: q.y + 16 }));
export function knockRows(id, L, TS, LH) {
  const own = L.knockHazards || [], data = KNOCK_DATA[id] ? KNOCK_DATA[id](L, TS, LH) : [];
  return [...own, ...data, ...sandRows(L)];
}
