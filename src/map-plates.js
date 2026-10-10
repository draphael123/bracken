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

/* THE INFO PANEL and the screen furniture. The selected node's box (name / best / medal / what is left) is drawn in SCREEN space over the map:
   218 x 58 (a store's 218 x 26) in one of four corners, and the camera may put the node anywhere from a fifth to the bottom of the screen.
   Header bar on top, footer strip under. placePanel picks the first (anchor, corner) whose panel, header and footer cover no node box and no plate
   in view; the game and tools/map-spacing.mjs both call it, so what the lint proves is what is drawn. */
export const SCREEN = { VW: 320, VH: 180, HEADER: 19, FOOTER: 11, MAPH: 900 };
export const NEAR = 0;   // what counts as "around the selected node": anything within this many px of it, and its road neighbours, must stay readable
export const ANCHORS = [0.55, 0.4, 0.7, 0.3, 0.8, 0.25, 0.9, 0.2, 0.35, 0.45, 0.6, 0.65, 0.75, 0.85];   // the node's screen height, as a fraction of VH (0.55 = the map's own default)
export function panelSize(nd) { return { w: Math.min(SCREEN.VW - 12, 218), h: nd.kind === 'store' ? 26 : 58 }; }
export function plateNodes(NODES, nameOf) { return NODES.map(n => ({ id: n.id, x: n.x, y: n.y, kind: n.kind, spur: !!n.spur, plate: n.plate, label: n.kind === 'store' ? (n.id === 'highstore' ? 'HIGH STORE' : 'STORE') : n.board || nameOf(n),   /* (claude/deeprails2) n.board: a short board name where the full one will not fit (the full name stays on the info panel) */ twoLine: n.kind === 'level' })); }
const hitR = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
/* the nodes beside this one on the road: the last and next ROAD node in list order (a spur: the one it hangs off, and nothing else) */
export function neighbours(nd, nodes) {
  const road = nodes.filter(n => !n.spur), i = road.findIndex(n => n.id === nd.id);
  if (i >= 0) return [road[i - 1], road[i + 1]].filter(Boolean).map(n => n.id).concat(nodes.filter(n => n.spur && Math.hypot(n.x - nd.x, n.y - nd.y) < 40).map(n => n.id));
  let best = null; for (const n of road) if (!best || Math.hypot(n.x - nd.x, n.y - nd.y) < Math.hypot(best.x - nd.x, best.y - nd.y)) best = n; return best ? [best.id] : [];
}
export function placePanel(nd, nodes, plates, S = SCREEN) {
  const { w, h } = panelSize(nd), rects = [];
  for (const n of nodes) { rects.push({ id: n.id, what: 'node', ...nodeBox(n) }); const p = plates.get(n.id); rects.push({ id: n.id, what: 'plate', x: p.x, y: p.y, w: p.w, h: p.h }); }
  const care = new Set([nd.id, ...neighbours(nd, nodes)]); let first = null;
  for (const a of ANCHORS) {
    const camY = Math.max(0, Math.min(S.MAPH - S.VH, nd.y - S.VH * a));
    const spots = []; for (const right of [nd.x < S.VW / 2, nd.x >= S.VW / 2]) for (const low of [nd.y - camY <= S.VH * 0.55, nd.y - camY > S.VH * 0.55]) spots.push([right ? S.VW - w - 6 : 6, low ? S.VH - S.FOOTER - 1 - h : 21]);
    for (let y = 21; y <= S.VH - S.FOOTER - 1 - h; y += 6) for (let x = 6; x <= S.VW - w - 6; x += 8) spots.push([x, y]);
    for (const [px, py] of spots) {
      const pr = { x: px, y: py, w, h };
      const blocked = [pr, { x: 0, y: 0, w: S.VW, h: S.HEADER }, { x: 0, y: S.VH - S.FOOTER, w: S.VW, h: S.FOOTER }];
      const hits = rects.filter(r => { if (!care.has(r.id) && Math.hypot(Math.max(0, r.x - nd.x, nd.x - r.x - r.w), Math.max(0, r.y - nd.y, nd.y - r.y - r.h)) > NEAR) return false; const q = { x: r.x, y: r.y - camY, w: r.w, h: r.h }; return q.y < S.VH && q.y + q.h > 0 && blocked.some(b => hitR(q, b)); });
      const self = nodes.find(n => n.id === nd.id), sy = nd.y - camY;
      if (!hits.length && sy > S.HEADER + 8 && sy < S.VH - S.FOOTER - 8) return { ok: true, camY, anchor: a, ...pr, hits: [] };
      if (!first || hits.length < first.hits.length) first = { ok: false, camY, anchor: a, ...pr, hits };
    }
  }
  return first;
}
