// src/map-plates.js - WHERE EACH NODE'S NAME PLATE GOES ON THE WORLD MAP, one pure function shared by the game (drawMap in
// main.js) and the lint (tools/map-spacing.mjs), so the lint measures exactly what the player sees.
// A node is a 16x26 box (a store's hut 24x28) around its disc and flag; its plate hangs under it, or is pushed to the
// first free side. A node may carry `plate: 'above' | 'below' | 'left' | 'right'` to try that side first (a crowded road
// is relaid by giving the plate a side, not only by moving the node). Plates never move across sheets: coordinates are the
// whole map's (sheet y + region offset), so two sheets' edges are measured together too.
export const PLATE_PAD = 2;          // the clear gap kept between any two boxes
export const MIN_NODE_GAP = 16;      // two node discs closer than this read as one blob
export function nodeBox(n) { return n.kind === 'store' ? { x: n.x - 12, y: n.y - 22, w: 24, h: 28 } : { x: n.x - 8, y: n.y - 20, w: 16, h: 26 }; }
export function plateSize(label, twoLine) { return { tw: Math.max(label.length * 6 + 10, twoLine ? 44 : 0), th: twoLine ? 17 : 10 }; }
const SIDE_ORDER = { below: 0, left: 1, right: 2, above: 3, farbelow: 4, leftup: 5, rightup: 6 };
function tries(tw, th) {
  return [['below', 0, 12], ['left', -tw / 2 - 4, 12], ['right', tw / 2 + 4, 12], ['above', 0, -22 - th], ['farbelow', 0, 22], ['leftup', -tw / 2 - 4, -10], ['rightup', tw / 2 + 4, -10]];
}
/* nodes: [{ id, x, y, kind, plate?, label, twoLine }] (secret/hidden ones left out by the caller). Returns Map id -> { x, y, w, h, fits }
   where (x, y) is the plate's top-left; fits=false means no side was free and the plate sits on its default spot, overlapping. */
export function layoutPlates(nodes, VW = 320) {
  const placed = nodes.map(nodeBox), out = new Map();
  const hit = (x, y, w, h) => placed.some(r => r && x < r.x + r.w + PLATE_PAD && x + w + PLATE_PAD > r.x && y < r.y + r.h + PLATE_PAD && y + h + PLATE_PAD > r.y);
  nodes.forEach((nd, i) => {
    const { tw, th } = plateSize(nd.label, nd.twoLine);
    const mine = placed[i]; placed[i] = null;                          // its own box is not an obstacle to its own plate
    let lx = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x)), ly = nd.y + 12, fits = false;
    const list = tries(tw, th);
    if (nd.plate && SIDE_ORDER[nd.plate] !== undefined) { const k = list.findIndex(t => t[0] === nd.plate); list.unshift(list.splice(k, 1)[0]); }
    for (const [, dx, dy] of list) { const x = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x + dx)), y = nd.y + dy; if (!hit(x - tw / 2, y, tw, th)) { lx = x; ly = y; fits = true; break; } }
    placed[i] = mine; placed.push({ x: lx - tw / 2, y: ly, w: tw, h: th });
    out.set(nd.id, { x: lx - tw / 2, y: ly, w: tw, h: th, fits });
  });
  return out;
}
