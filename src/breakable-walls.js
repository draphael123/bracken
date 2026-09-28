// breakable-walls.js — THE BREAKABLE-WALL ENGINE (Daniel's playtest, 2026-09-28, decision 1: "ore walls you mine
// through"). Built ONCE so every level that wants one - THE ORE ROAD first, a later lane's 'secret' wall, and the
// future minecart level - shares the same look, the same hit feel and the same rule, instead of each one inventing
// its own. A wall is ordinary SOLID rock at BUILD time (so the route reads right on sight, and no tool needs
// teaching a new tile), plus one small runtime record in the level's own `walls` array. src/main.js's thin hook
// (wallsStep, breakWall, the respawn reset) is the only thing that turns a struck wall into open air and back -
// this module stays pure: no DOM, no globals, a rect and a kind in, a rect and a kind out.
//
// THE FEEL IS THE VEIN'S (src/ore-road.js's oreVeinsStep, src/main.js): struck the way anything in this game is
// struck - the player's own attack box against the wall's rect - a few blows and it gives. WHERE IT DIFFERS FROM A
// VEIN: a vein is a decal on a solid tile that was never in anyone's way; a wall IS the rock in the way, so breaking
// one actually opens the grid (main.js sets its tiles to air), and ONE HEAVY BLOW (a ground slam, the same blow
// that breaks a crate in one) skips the count and breaks it outright.
//
// NEVER A SOFT-LOCK: a breakable wall is never the only way back the way it came, and it STAYS BROKEN FOR THE
// ATTEMPT but RESETS ON DEATH OR RELOAD - main.js's respawn() mends every broken wall the way it already mends a
// cut bridge span, so a wall gating the main route can be relied on to be there again next attempt, never skipped
// once and left open for good (which would make "mine through" a one-time toll instead of a standing part of the
// route).
//
// KINDS (a table, so a later lane's 'secret' wall reuses this rather than copying it):
//   ore      the ordinary wall: cracked rock, told from a distance (the crack shows before you have swung once),
//            in the section's own ore colour - it pops that ore as it goes, the same coin-burst a mined vein pops.
//   secret   Daniel's approved breakable-wall secret: plain, undressed rock - no crack shown until the FIRST blow
//            lands, so it reads as ordinary wall until you find it - and it pops coins, not ore, when it gives.
export const WALL_KINDS = {
  ore:    { hits: 3, pop: 'ore', tell: true },
  secret: { hits: 3, pop: 'coins', tell: false },
};

/* makeWall: a run of solid tiles the level already carved as rock - x0..x1, y0..y1, inclusive, tile coordinates -
   the kind ('ore' or 'secret'), and (kind 'ore') which of the level's ore indices it pops. Runtime state (hits,
   broken, flash) starts here at zero/false and is owned by main.js's hook from the moment the level is built. */
export function makeWall(x0, x1, y0, y1, kind, ore, colour) {
  return { x0, x1, y0, y1, kind: WALL_KINDS[kind] ? kind : 'ore', ore: ore || 0, colour: colour || null, hits: 0, broken: false, flash: 0 };
}
export const wallHits = w => (WALL_KINDS[w.kind] || WALL_KINDS.ore).hits;
export const wallPop = w => (WALL_KINDS[w.kind] || WALL_KINDS.ore).pop;
export const wallTold = w => !!(WALL_KINDS[w.kind] || WALL_KINDS.ore).tell || w.hits > 0;   /* a 'secret' wall tells only once struck */
/* the wall's rect in PIXELS, given the tile size - what an attack box is checked against */
export const wallRect = (w, TS) => ({ l: w.x0 * TS, r: (w.x1 + 1) * TS, t: w.y0 * TS, b: (w.y1 + 1) * TS });
export const wallCentre = (w, TS) => [(w.x0 + w.x1 + 1) / 2 * TS, (w.y0 + w.y1 + 1) / 2 * TS];

/* THE LOOK: cracked rock, more cracked with every blow, in the wall's own colour once told. Drawn on top of the
   ordinary solid-tile rock underneath it (which the level's own backdrop/tile renderer already draws), the same
   way drawOreVeins overlays a vein on the rock behind it - this never touches the tile renderer itself. */
export function drawWalls(g, walls, cx, cy, TS, time) {
  for (const w of walls) {
    if (w.broken || !wallTold(w)) continue;
    const col = w.colour || ['#3a3a42', '#9aa0ac', '#eef0f6'];
    const need = wallHits(w), flash = w.flash > 0;
    for (let ty = w.y0; ty <= w.y1; ty++) for (let tx = w.x0; tx <= w.x1; tx++) {
      const x = Math.round(tx * TS - cx), y = Math.round(ty * TS - cy);
      if (x < -TS || y < -TS) continue;
      g.globalAlpha = 0.55; g.fillStyle = flash ? '#fff6e0' : col[0]; g.fillRect(x + 1, y + 1, TS - 2, TS - 2); g.globalAlpha = 1;
      g.strokeStyle = col[2]; g.lineWidth = 1;
      const n = 1 + w.hits, seed0 = (tx * 13 + ty * 7) % 7;
      for (let k = 0; k < n && k < need + 1; k++) { const s = (seed0 + k * 5) % 11;
        g.beginPath(); g.moveTo(x + 2 + (s % 5) * 2, y + 1); g.lineTo(x + 3 + ((s * 3) % 6) * 2, y + TS - 1); g.stroke(); }
      if (w.hits > 0) { g.fillStyle = col[1]; for (let k = 0; k < w.hits; k++) { const s = (seed0 + k * 3) % 9; g.fillRect(x + 2 + (s % 6) * 2, y + 3 + ((s * 5) % 8), 1, 1); } }
    }
  }
}
