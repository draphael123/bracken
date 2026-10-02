// src/redraw/welltown_props.js - THE WELL TOWN's WATER MACHINES, drawn (claude/welltown3). src/well-town-hands.js drawWorld owns WHERE and WHEN;
// this file owns HOW each thing looks. Every function draws in SCREEN pixels at (x, y) = the thing's foot (the floor line under it), and is
// pure drawing (no game state is changed). The greybox shapes moved here unchanged from well-town-hands.js; the art pass replaces the bodies.
//   drawWell(g, x, y, s, time)      s = { deep, up, wind (0..1 of the wind-up), jar, left, glint (0..1: it can fill your skin now), cistern }
//   drawMudWall(g, x, y, w, h, s, time)   x, y = the wall's top-left; s = { open, wet (0..1: you carry water - show where it would take) }
//   drawFire(g, x, y, h, s, time)   x, y = the column's top-left; s = { lit, wet (0..1: you carry water - it smoulders and hisses toward you) }
//   drawWindlass(g, x, y, s, time)  s = { top, deep, struck (0..1 just after a blow) }
//   drawBucket(g, x, y, w, ropeTopY)   the great well's bucket (a lift) and its rope up to the windlass
//   drawCistern(g, x, y, s)         THE DRY CISTERN's basin: s = { full, got (water-skins in hand) }
//   drawVaultDoor(g, x, y, h)       its vault's door while it is shut

const R = Math.round;
const fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };

/* A WELL: a stone ring, a beam on two posts, the blue of water (the only blue in the town). A deep well's bucket rope while it winds; a jar */
export function drawWell(g, x, y, s, time) {
  if (s.jar) { fr(g, '#a8603a', x - 4, y - 12, 8, 12); fr(g, '#a8603a', x - 2, y - 15, 4, 3); fr(g, s.left > 0 ? '#3a7ab8' : '#5a3a22', x - 2, y - 14, 4, 1); return; }
  if (s.deep) { const k = s.up ? 1 : s.wind || 0; fr(g, '#c9b27c', x - 1, y - 22, 1, 10); if (k > 0) fr(g, '#6a4426', x - 4, y - 8 - 6 * k, 8, 4); }
  fr(g, '#d8ccb0', x - 10, y - 9, 20, 9); fr(g, '#a89878', x - 10, y - 9, 20, 2); fr(g, '#3a7ab8', x - 8, y - 8, 16, 3);
  fr(g, '#7ab8e8', x - 6 + (Math.floor(time * 2) % 3), y - 8, 3, 1);
  fr(g, '#6a4426', x - 10, y - 22, 2, 13); fr(g, '#6a4426', x + 8, y - 22, 2, 13); fr(g, '#6a4426', x - 11, y - 23, 22, 2);
}
/* A MUD WALL (a bricked doorway): dark brown, cracked where water would take it; opened, a heap of mud on the floor */
export function drawMudWall(g, x, y, w, h, s, time) {
  if (s.open) { fr(g, '#5e3a1c', x - 2, y + h - 4, w + 4, 4); return; }
  fr(g, '#5e3a1c', x, y, w, h); for (let k = 0; k < h; k += 7) fr(g, '#3a2410', x + 2 + (k % 5), y + k + 3, w - 5, 1);
  fr(g, '#2a1a0a', x + w / 2 - 1, y + 2, 1, h - 4); fr(g, '#2a1a0a', x + 3, y + h / 2, w - 6, 1);
}
/* A FIRE (a burning barricade): flames up the column; out, charred timber */
export function drawFire(g, x, y, h, s, time) {
  fr(g, s.lit ? '#5a3a1a' : '#2a2018', x + 3, y, 10, h);
  if (s.lit) for (let k = 0; k < h; k += 6) { const fl = Math.sin(time * 14 + k) * 2; fr(g, k % 12 ? '#ff9a3c' : '#ffd36b', x + 1 + fl, y + k, 14, 5); fr(g, '#d84a14', x + 4 - fl, y + k + 2, 8, 3); }
}
/* A WINDLASS: two posts, a drum, a crank */
export function drawWindlass(g, x, y, s, time) {
  fr(g, '#6a4426', x - 7, y - 18, 2, 18); fr(g, '#6a4426', x + 5, y - 18, 2, 18); fr(g, '#8a5a32', x - 6, y - 16, 12, 6); fr(g, '#c9b27c', x - 6, y - 14, 12, 2);
  fr(g, '#3a2a1a', x + 6, y - 13, 5, 2);
}
/* THE GREAT WELL's BUCKET (a lift w px wide) and its rope up to the windlass (ropeTopY, or null) */
export function drawBucket(g, x, y, w, ropeTopY) {
  if (ropeTopY != null) fr(g, '#c9b27c', x + 15, ropeTopY, 1, Math.max(0, y - ropeTopY));
  fr(g, '#6a4426', x, y, w, 6); fr(g, '#8a5a32', x + 1, y + 1, w - 2, 2); fr(g, '#3a7ab8', x + 4, y + 4, w - 8, 1);
}
/* THE DRY CISTERN: a stone basin, blue when it is full; a blue tick a water-skin in hand */
export function drawCistern(g, x, y, s) {
  fr(g, '#b8a888', x - 14, y - 10, 28, 10); fr(g, s.full ? '#3a7ab8' : '#6a5a40', x - 12, y - 9, 24, 4);
  if (!s.full) for (let i = 0; i < s.got; i++) fr(g, '#7ab8e8', x - 10 + i * 6, y - 15, 4, 3);
}
/* THE VAULT's door, shut */
export function drawVaultDoor(g, x, y, h) { fr(g, '#8a7a5a', x, y, 16, h); fr(g, '#c9962a', x + 6, y + h / 2 - 3, 4, 6); }
