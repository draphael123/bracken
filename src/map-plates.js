// src/map-plates.js - WHERE EACH NODE'S NAME PLATE GOES ON THE WORLD MAP, one pure function shared by the game (drawMap in
// main.js) and the lint (tools/map-spacing.mjs), so the lint measures exactly what the player sees.
// A node is a 16x26 box (a store's hut 24x28) around its disc and flag; its plate hangs under it, or is pushed to the
// first free side. A node may carry `plate: 'above' | 'below' | 'left' | 'right'` to try that side first (a crowded road
// is relaid by giving the plate a side, not only by moving the node). Plates never move across sheets: coordinates are the
// whole map's (sheet y + region offset), so two sheets' edges are measured together too.
import { PLATE_SPOTS } from './map-plate-spots.js';
export const PLATE_PAD = 2;          // the clear gap kept between any two boxes
export const MIN_NODE_GAP = 16;      // two node discs closer than this read as one blob
export function nodeBox(n) { return n.kind === 'store' ? { x: n.x - 12, y: n.y - 22, w: 24, h: 28 } : { x: n.x - 8, y: n.y - 20, w: 16, h: 26 }; }
/* THE OTHER THINGS A NODE DRAWS, as boxes a plate must keep off (claude/mapscale): its signpost (10x12, hung off the disc's right) and, for the nine places that
   have one, the landmark critter or castle drawn beside them (tools/map-scale.mjs measures the real draws and fails if one grows past these boxes). [dx, dy, w, h] from the node. */
export function signBox(n) { return { x: n.x + 8, y: n.y - 12, w: 10, h: 12 }; }
export const LANDMARKS = {
  wood: [[15, -35, 30, 27]], hanging: [[14, -27, 31, 23]], crown: [[-26, -58, 52, 42], [13, -13, 34, 22]], scree: [[16, -7, 22, 17]],
  marsh: [[-35, -8, 18, 14]], stockade: [[-28, -9, 16, 16]], spore: [[18, -7, 17, 16]], kings: [[-41, -11, 36, 18]],
};
export function landmarkRects(nodes) { const out = []; for (const n of nodes) for (const [dx, dy, w, h] of LANDMARKS[n.id] || []) out.push({ x: n.x + dx, y: n.y + dy, w, h, of: n.id }); return out; }
/* THE NAME ON A BOARD: the place's name without its article (THE GLASS SEA -> GLASS SEA). A map label is a tag, not a sentence; the card, the list and the loading screen keep the whole name. A
   board 24 pixels shorter finds a side to sit on that is not on top of its own node. */
export const plateLabel = name => String(name || '').replace(/^THE /, '');
export function plateSize(label, twoLine) { return { tw: Math.max(label.length * 6 + 10, twoLine ? 44 : 0), th: twoLine ? 17 : 10 }; }
const SIDE_ORDER = { below: 0, left: 1, right: 2, above: 3, farbelow: 4, leftup: 5, rightup: 6 };
function tries(tw, th) {
  return [['below', 0, 12], ['left', -tw / 2 - 4, 12], ['right', tw / 2 + 4, 12], ['above', 0, -22 - th], ['farbelow', 0, 22], ['leftup', -tw / 2 - 4, -10], ['rightup', tw / 2 + 4, -10]];
}
/* nodes: [{ id, x, y, kind, plate?, label, twoLine }] (secret/hidden ones left out by the caller). Returns Map id -> { x, y, w, h, fits }
   where (x, y) is the plate's top-left; fits=false means no side was free and the plate sits on its default spot, overlapping. */
function layoutBase(nodes, VW) {
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
/* THE COLLISION PASS (claude/mapscale). The first layout (above) puts each board on the first free side; this pass looks at every board again with a cost, and slides each to the
   cheapest spot until nothing improves. The cost is what a player sees: a board over ANOTHER node or board is a wall (1000: it hides something), over its OWN disc, flag or hut is
   nearly as bad (400: "THE GLASS SEA sits over its node"), over its own signpost 100, over another node's signpost or a landmark critter 30, and a spot further from the node, or
   above it (where a node near the top of a sheet runs it up under the header), a little more. A move is taken only if every info card that was fine stays fine (placePanel, below). */
const OVER = (p, r, pad = PLATE_PAD) => p.x < r.x + r.w + pad && p.x + p.w + pad > r.x && p.y < r.y + r.h + pad && p.y + p.h + pad > r.y;
export function plateCost(p, i, nodes, boxes, signs, lms, plates, near) {
  let c = 0;
  for (const j of near || nodes.map((_, k) => k)) { if (j === i) continue; if (OVER(p, boxes[j])) c += 1000; if (OVER(p, plates[j])) c += 1000; if (OVER(p, signs[j])) c += 30; }
  if (OVER(p, boxes[i])) c += 400; if (OVER(p, signs[i], 0)) c += 100;
  for (const r of lms) if (OVER(p, r)) c += 30;
  const n = nodes[i], bx = Math.max(p.x, Math.min(p.x + p.w, n.x)), by = Math.max(p.y, Math.min(p.y + p.h, n.y)), d = Math.hypot(bx - n.x, by - n.y);
  return c + d * 0.6 + (p.y + p.h < n.y - 8 ? 8 : 0);
}
export function plateCandidates(nd, VW = 320) { const { tw, th } = plateSize(nd.label, nd.twoLine), list = [];
  for (let dy = -22 - th - 6; dy <= 34; dy += 2) for (let dx = -tw - 14; dx <= tw + 14; dx += 2) {
    const x = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x + dx)), p = { x: Math.round(x - tw / 2), y: nd.y + dy, w: tw, h: th };
    const bx = Math.max(p.x, Math.min(p.x + p.w, nd.x)), by = Math.max(p.y, Math.min(p.y + p.h, nd.y)); if (Math.hypot(bx - nd.x, by - nd.y) <= 25) list.push(p); }
  return list; }
export function layoutPlates(nodes, VW = 320) {
  const out = layoutBase(nodes, VW), boxes = nodes.map(nodeBox), signs = nodes.map(signBox), lms = landmarkRects(nodes);
  const plates = nodes.map(n => out.get(n.id));
  const cands = nd => { const { tw, th } = plateSize(nd.label, nd.twoLine), list = [];
    for (let dy = -22 - th - 6; dy <= 34; dy += 3) for (let dx = -tw - 14; dx <= tw + 14; dx += 3) {
      const x = Math.max(tw / 2 + 6, Math.min(VW - tw / 2 - 6, nd.x + dx)), p = { x: Math.round(x - tw / 2), y: nd.y + dy, w: tw, h: th };
      const bx = Math.max(p.x, Math.min(p.x + p.w, nd.x)), by = Math.max(p.y, Math.min(p.y + p.h, nd.y)); if (Math.hypot(bx - nd.x, by - nd.y) <= 25) list.push(p); }
    return list; };
  const nearOf = nodes.map((nd, i) => nodes.map((m, j) => j).filter(j => Math.hypot(nodes[j].x - nd.x, nodes[j].y - nd.y) < 190));   /* (a board can only reach ~120 px from its node) */
  const lmsOf = nodes.map(nd => lms.filter(r => Math.hypot(r.x + r.w / 2 - nd.x, r.y + r.h / 2 - nd.y) < 150));
  const costOf = i => plateCost(plates[i], i, nodes, boxes, signs, lmsOf[i], plates, nearOf[i]);
  /* THE SOLVED SPOTS (src/map-plate-spots.js, written by tools/map-plates-solve.mjs): where the board of each crowded node sits, found by a seeded annealing that also keeps every info card clear.
     Each is applied only if it is still valid for the node's current place (clear of every box); a node added or moved since is simply not in the table and gets the sweep below. */
  for (let i = 0; i < nodes.length; i++) { const sp = PLATE_SPOTS[nodes[i].id]; if (!sp) continue; const { tw, th } = plateSize(nodes[i].label, nodes[i].twoLine);
    if (sp[2] !== tw || sp[3] !== th) continue; const p = { x: nodes[i].x + sp[0], y: nodes[i].y + sp[1], w: tw, h: th };
    if (p.x < 0 || p.x + p.w > VW || nodes.some((n, j) => j !== i && OVER(p, boxes[j]))) continue; Object.assign(plates[i], p); }
  const wasOk = new Map(nodes.map(n => [n.id, placePanel(n, nodes, out, SCREEN, true).ok]));
  for (let sweep = 0; sweep < 5; sweep++) { let moved = 0;
    const order = nodes.map((n, i) => [i, costOf(i)]).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    for (const i of order) { const nd = nodes[i], cur = plates[i], c0 = costOf(i); if (c0 < 3) continue;
      const opts = cands(nd).map(p => [plateCost(p, i, nodes, boxes, signs, lmsOf[i], plates, nearOf[i]), p]).filter(e => e[0] < c0 - 0.5).sort((a, b) => a[0] - b[0]);
      for (const [, p] of opts.slice(0, 6)) {
        const was = { x: cur.x, y: cur.y, w: cur.w, h: cur.h }; Object.assign(cur, p);
        const aff = nodes.filter(n => n.id === nd.id || neighbours(n, nodes).includes(nd.id));
        if (aff.every(n => !wasOk.get(n.id) || placePanel(n, nodes, out, SCREEN, true).ok)) { moved++; break; }
        Object.assign(cur, was); } }
    if (!moved) break; }
  nodes.forEach((n, i) => { const c = costOf(i); Object.assign(out.get(n.id), { fits: c < 1000, strict: c < 30 }); });
  return out;
}

/* THE INFO PANEL and the screen furniture. The selected node's box (name / best / medal / what is left) is drawn in SCREEN space over the map:
   218 x 58 (a store's 218 x 26) in one of four corners, and the camera may put the node anywhere from a fifth to the bottom of the screen.
   Header bar on top, footer strip under. placePanel picks the first (anchor, corner) whose panel, header and footer cover no node box and no plate
   in view; the game and tools/map-spacing.mjs both call it, so what the lint proves is what is drawn. */
export const SCREEN = { VW: 320, VH: 180, HEADER: 19, FOOTER: 11, MAPH: 900 };
export const NEAR = 0;   // what counts as "around the selected node": anything within this many px of it, and its road neighbours, must stay readable
export const ANCHORS = [0.55, 0.4, 0.7, 0.3, 0.8, 0.25, 0.9, 0.2, 0.35, 0.45, 0.6, 0.65, 0.75, 0.85];   // the node's screen height, as a fraction of VH (0.55 = the map's own default)
export function panelSize(nd) { return { w: Math.min(SCREEN.VW - 12, 208), h: nd.kind === 'store' ? 26 : 54 }; }   /* 54 of 180 = 30% of the screen (the style guide's cap; it was 58) */
export function plateNodes(NODES, nameOf) { return NODES.map(n => ({ id: n.id, x: n.x, y: n.y, kind: n.kind, spur: !!n.spur, plate: n.plate, label: n.kind === 'store' ? (n.id === 'highstore' ? 'HIGH STORE' : 'STORE') : plateLabel(n.board || nameOf(n)) /* (claude/deeprails2) n.board: a short board name where the full one will not fit (the full name stays on the info card) */, twoLine: false }   /* ONE-LINE BOARDS (Daniel 10-09): the name only; medal, silver and quest live on the selected node's info card */)); }
const hitR = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
/* the nodes beside this one on the road: the last and next ROAD node in list order (a spur: the one it hangs off, and nothing else) */
export function neighbours(nd, nodes) {
  const road = nodes.filter(n => !n.spur), i = road.findIndex(n => n.id === nd.id);
  if (i >= 0) return [road[i - 1], road[i + 1]].filter(Boolean).map(n => n.id).concat(nodes.filter(n => n.spur && Math.hypot(n.x - nd.x, n.y - nd.y) < 40).map(n => n.id));
  let best = null; for (const n of road) if (!best || Math.hypot(n.x - nd.x, n.y - nd.y) < Math.hypot(best.x - nd.x, best.y - nd.y)) best = n; return best ? [best.id] : [];
}
export function placePanel(nd, nodes, plates, S = SCREEN, quick = false) {   /* quick: the first panel that hides nothing it must not (what the layout needs to know); not the one that lies over the fewest other boards */
  const { w, h } = panelSize(nd), rects = [];
  for (const n of nodes) { rects.push({ id: n.id, what: 'node', ...nodeBox(n) }); const p = plates.get(n.id); rects.push({ id: n.id, what: 'plate', x: p.x, y: p.y, w: p.w, h: p.h }); }
  const care = new Set([nd.id, ...neighbours(nd, nodes)]); let first = null, bestOk = null;
  const mustKeep = r => care.has(r.id) || Math.hypot(Math.max(0, r.x - nd.x, nd.x - r.x - r.w), Math.max(0, r.y - nd.y, nd.y - r.y - r.h)) <= NEAR;
  const must = rects.filter(mustKeep), others = rects.filter(r => !mustKeep(r));
  for (const a of ANCHORS) {
    const camY = Math.max(0, Math.min(S.MAPH - S.VH, nd.y - S.VH * a)), ai = ANCHORS.indexOf(a), sy = nd.y - camY;
    if (!(sy > S.HEADER + 8 && sy < S.VH - S.FOOTER - 8) && bestOk) continue;
    const view = r => { const q = { x: r.x, y: r.y - camY, w: r.w, h: r.h }; return q.y < S.VH && q.y + q.h > 0 ? { ...q, id: r.id, what: r.what } : null; };
    const mustV = must.map(view).filter(Boolean), othersV = quick ? [] : others.map(view).filter(Boolean);
    const spots = []; for (const right of [nd.x < S.VW / 2, nd.x >= S.VW / 2]) for (const low of [nd.y - camY <= S.VH * 0.55, nd.y - camY > S.VH * 0.55]) spots.push([right ? S.VW - w - 6 : 6, low ? S.VH - S.FOOTER - 1 - h : 21]);
    for (let y = 21; y <= S.VH - S.FOOTER - 1 - h; y += 6) for (let x = 6; x <= S.VW - w - 6; x += 8) spots.push([x, y]);
    for (const [px, py] of spots) {
      const pr = { x: px, y: py, w, h };
      const blocked = [pr, { x: 0, y: 0, w: S.VW, h: S.HEADER }, { x: 0, y: S.VH - S.FOOTER, w: S.VW, h: S.FOOTER }];
      const hits = mustV.filter(q => blocked.some(b => hitR(q, b)));
      if (!hits.length && sy > S.HEADER + 8 && sy < S.VH - S.FOOTER - 8) {
        if (quick) return { ok: true, camY, anchor: a, ...pr, hits: [], soft: 0, cost: 0 };
        /* it hides nothing it must not; how many OTHER boards and nodes does it still lie over (the ones further round the node)? Fewest wins, and a camera that stays near its default wins a tie */
        const soft = othersV.filter(q => hitR(q, pr)).length, cost = soft + 0.15 * ai;
        if (!bestOk || cost < bestOk.cost) bestOk = { ok: true, camY, anchor: a, ...pr, hits: [], soft, cost };
        if (soft === 0 && ai === 0) return bestOk; continue; }
      if (!first || hits.length < first.hits.length) first = { ok: false, camY, anchor: a, ...pr, hits: hits.map(q => ({ id: q.id, what: q.what })) };
    }
  }
  return bestOk || first;
}
