// src/rookery-anchors.js - EVERY PERCH, ROOST AND ARM IN THE ROOKERY HANGS ON SOMETHING (claude/rookery2, Daniel 10-27 live: "stone ledges and pillars that end in mid-air,
// a lantern gibbet on nothing"; brief scratch/brief-rookery2-1027.md A3). Pure: the build (src/rookery.js) asks it for L.rkAnchors, the hands draw them (greybox), and
// tools/anchor-lint.mjs checks every one against the grid.
// AN ANCHOR for a thing at cell (x, y) - a harpy's ROOST (a bone nest she lives in), a gale harpy's PERCH, a hung nest's ARM - is the first of:
//   stand    footing right under it (it sits on the ledge)
//   bracket  a crag face within BRACKET tiles beside it, at its row or the row under (a stone corbel / bracket into the face, the nest lashed on it)
//   spire    footing somewhere under it (any depth): a ROCK SPIRE rises from that footing to it, the nest LASHED to its tip with rope and sinew, bones in the lashing
//   chain    rock over it within CHAIN rows: chains hang it from the overhang
//   (none)   nothing holds it: tools/anchor-lint.mjs fails the level
export const BRACKET = 3, CHAIN = 14;
export function anchorAt(L, T, x, y) {
  const W = L.W, H = L.H, g = L.grid, at = (cx, cy) => (cx < 0 || cy < 0 || cx >= W || cy >= H) ? T.SOLID : g[cy * W + cx];
  const foot = t => t !== T.AIR, solid = t => t === T.SOLID;
  if (foot(at(x, y + 1))) return { kind: 'stand', x, y, foot: y + 1 };
  for (let d = 1; d <= BRACKET; d++) for (const s of [-1, 1]) for (const yy of [y, y + 1]) if (solid(at(x + s * d, yy)) && solid(at(x + s * d, yy + 1))) return { kind: 'bracket', x, y, side: s, wall: x + s * d, row: yy };
  for (let yy = y + 1; yy < H; yy++) if (foot(at(x, yy))) return { kind: 'spire', x, y, foot: yy };
  for (let yy = y - 1; yy >= Math.max(0, y - CHAIN); yy--) if (solid(at(x, yy))) return { kind: 'chain', x, y, top: yy };
  return null;
}
/* what in the rookery needs an anchor: [{ what, id, x, y }] - roosts (cracked rocks' and rides'), gale perches, hung nests' arms */
export function anchorNeeds(L) {
  const out = [];
  for (const h of L.hoists || []) { if (h.roost) out.push({ what: 'roost', id: h.id, x: h.roost[0], y: h.roost[1] }); if (h.load === 'nest' && h.x !== undefined && h.top !== undefined) out.push({ what: 'arm', id: h.id, x: h.x, y: h.top }); }
  for (const d of L.rkRides || []) out.push({ what: 'roost', id: d.id, x: d.roost[0], y: d.roost[1] });
  for (const e of L.ents || []) if (e.t === 'galeharpy') out.push({ what: 'perch', id: e.squad || 'gale', x: e.x, y: e.y });
  return out;
}
export function rookeryAnchors(L, T) { return anchorNeeds(L).map(n => ({ ...n, a: anchorAt(L, T, n.x, n.y) })); }
