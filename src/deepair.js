// src/deepair.js — WHERE THE AIR IS, in one place.
// The breath clock in main.js and the breath audit in tools/breath.mjs both need to know where a swimmer can take a
// lungful, and if they each kept their own list one of them would be wrong and nobody would know which (rules O, L).
// Everything is boxes in pixels, asked at the swimmer's feet minus eight: a box contains a point when l < x < r and
// t < y < b.
//   L.airRooms          [x0, x1, y0, y1] in tiles: a ship's hold, a pocket under a vault - the whole room is air
//   airBell decos       a bell standing on the bed, air under her rim (26 px either side, 22 up and down)
//   L.deep.vents        { x, y, h } a crack in the bed and the bubble column over it, h tiles tall, a tile wide
//   L.deep.clams        { x, y } a giant clam: struck, it lets a lungful go where it sits
//   L.deep.bulbs        { x, y } a kelp bladder: the same, off a stalk
//   L.deep.wrecks       { x, y } a diving bell on her side with the air still in her
export const TSZ = 16;
export function airBoxes(L) {
  const out = [];
  for (const [x0, x1, y0, y1] of (L.airRooms || [])) out.push({ l: x0 * TSZ, r: (x1 + 1) * TSZ, t: y0 * TSZ, b: (y1 + 1) * TSZ, kind: 'room' });
  for (const e of (L.ents || [])) if (e.t === 'deco' && e.kind === 'airBell') { const x = e.x * TSZ + 8, y = e.y * TSZ - 14; out.push({ l: x - 26, r: x + 26, t: y - 22, b: y + 22, kind: 'bell' }); }
  const D = L.deep || {};
  for (const v of (D.vents || [])) { const x = v.x * TSZ + 8, bed = (v.y + 1) * TSZ; out.push({ l: x - 12, r: x + 12, t: bed - v.h * TSZ, b: bed + 4, kind: 'vent' }); }
  for (const c of (D.clams || [])) { const x = c.x * TSZ + 8, bed = (c.y + 1) * TSZ; out.push({ l: x - 20, r: x + 20, t: bed - 40, b: bed + 4, kind: 'clam' }); }
  for (const c of (D.bulbs || [])) { const x = c.x * TSZ + 8, y = (c.y + 1) * TSZ; out.push({ l: x - 20, r: x + 20, t: y - 34, b: y + 10, kind: 'bulb' }); }
  for (const c of (D.wrecks || [])) { const x = c.x * TSZ + 8, bed = (c.y + 1) * TSZ; out.push({ l: x - 24, r: x + 24, t: bed - 30, b: bed + 4, kind: 'wreck' }); }
  return out;
}
