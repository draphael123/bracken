// reach-gaps.js - THE GAPS PASS (claude/gaps, Daniel 10-09/10): REACHCORE's per-hero model (tools/reach-heroes.mjs, src/reach-hero.js) found 23 FRAME-PERFECT crossings in
// 12 levels: a jump that only a take-off from the very edge lands (a toe on the lip), because the old levels' four-wide gaps were a hair past what the slower legs carry.
// Each is closed here by the smallest change - a ledge a tile longer, a pit a tile narrower, a step a row lower - so EVERY hero (the 7, base movement) crosses with a
// margin of more than 2 px past a hand's slack. Applied to the FINISHED level (after every grow, like src/scree-rework.js), so no build coordinate moves.
// The gate is tools/reach-heroes.mjs (in check.mjs): its KNOWN list is empty but for witchlight's, so a crossing that goes frame-perfect again fails there.
// Margins (px past a hand's slack, per hero) are in work/claude/lane-done/claude-gaps.md. Two things learned: a ceiling over the take-off caps the jump (Scree's
// ridge ledges sat on row 3 under the map's top: LOWERED, not narrowed; the Monastery's corridor under the low floor), and a NET is footing, so a rope can be widened.

export const GAPS = {
  /* THE SCREE PATH, the ridge road's three stepping ledges (218-220 > 224-226 > 230-232 > 236-238): each landing ledge a tile longer toward the one before, gaps 3 -> 2 */
  scree: c => { c.fill(217, 238, 3, 3, c.T.AIR); c.ledge(218, 220, 4); c.ledge(223, 226, 4); c.ledge(229, 232, 4); c.ledge(235, 238, 4); },
  /* THE HANGING VILLAGE, the rope net (103-104) to the rock lip (99): the net a column wider (the lip a tile out shortened the route past the bridge set-piece: hanging-exam) */
  hanging: c => { c.col(103, 102, 38); },
  /* THE MONASTERY, the stair slab (60,138) back to the corridor floor (50-57, row 137) under the low floor: the corridor a tile longer */
  spire: c => { c.ledge(58, 59, 137); },
  /* HIGHCROWN: the scaffold 166-168 > the wall block 173 (gap 4); the scaffold 139 from the rampart block 131-135 (gap 3, up 1) */
  crown: (c, L) => { c.ledge(169, 169, 60, c.T.PLANK); for (const e of c.ents) if (e.t === 'scaffold' && e.x === 166 && e.y === 60) e.x1 = 169; c.col(135, 136, 64); },
  /* THE SHIPWRECK REEF: the rock shelf (462) two tiles toward the rope net (456-457) */
  reef: c => { c.col(462, 461, 16); c.col(462, 460, 16); },
  /* WAYMEET: the first spike of the pit before the step (140-142) is paved */
  waymeet: c => { c.set(140, 36, c.T.SOLID); },
  /* THE HEXED FIELDS: the spike pit 34-37 two tiles narrower; the bough ledges (131-135, 147-151) a tile longer */
  fields: c => { c.fill(34, 34, 34, 36, c.T.SOLID); c.ledge(130, 130, 23); c.ledge(146, 146, 23); },
  /* THE MAGE'S FOLLY: the library ledge 574-576 a tile longer */
  mage: c => { c.ledge(573, 573, 11); },
  /* THE UNBURIED FIELD: the first spike of the strip is paved */
  unburied: c => { c.set(34, 37, c.T.SOLID); },
  /* THE HARVEST FAIR: the gallery's far plank a tile longer; the stall pit's first spike tile paved; the carousel pit's near lip a tile out */
  fair: c => { c.ledge(590, 590, 14); c.fill(259, 259, 28, 29, c.T.SOLID); c.fill(280, 281, 26, 27, c.T.SOLID); },
};

export function applyReachGaps(id, L, T) {
  const fix = GAPS[id]; if (!fix) return L;
  const W = L.W, at = (x, y) => L.grid[y * W + x], set = (x, y, t) => { L.grid[y * W + x] = t; };
  const ctx = {
    set, at,
    /* a ledge run longer: one-way (or the given tile) over air from x0 to x1 on row y */
    ledge: (x0, x1, y, t = T.ONEWAY) => { for (let x = x0; x <= x1; x++) if (at(x, y) === T.AIR) set(x, y, t); },
    /* rock a column wider: copy column sx to dx from row y0 down while the source is not air */
    col: (sx, dx, y0, y1 = L.H - 1) => { for (let y = y0; y <= y1 && at(sx, y) !== T.AIR; y++) if (at(dx, y) === T.AIR) set(dx, y, at(sx, y)); },
    fill: (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); },
    ents: L.ents, T,
  };
  fix(ctx, L); return L;
}
