// tools/map-spacing.mjs - THE WORLD MAP MUST BE READABLE: no two level nodes may sit so close that their name plates
// stack. Reads the node tables out of src/main.js (the same vm slice tools/map-grammar.mjs uses), lays the plates out with the
// game's OWN placement function (src/map-plates.js), at the map's real draw size (1 map px = 1 buffer px, plates at their
// two-line size with the medal/silver/quest strip, the worst case) and fails on:
//   1. two nodes closer than MIN_NODE_GAP (their discs and flags read as one blob);
//   2. a plate that found no free side (it is drawn on its default spot, on top of something);
//   3. any final overlap: plate-plate, plate-node box (any other node), node box-node box;
//   5. THE INFO PANEL (218x58, the box that opens on the node you stand on), the top HUD bar and the footer strip are BLOCKED rects: for every node
//      selected, at the camera height the game would choose, the panel, header and footer may cover no node box or board of the selected node, its
//      road neighbours (or the node it hangs off) - src/map-plates.js placePanel, the same function the game draws with.
//   4. a plate pushed more than FAR px from its node (it reads as another node's plate even with the leader line).
// New campaign nodes (the welltown desert nodes, the redgorge branch...) must pass this at merge.
import fs from 'node:fs';
import vm from 'node:vm';
import { LEVELS } from '../src/level.js';
import { layoutPlates, nodeBox, MIN_NODE_GAP, PLATE_PAD, placePanel, plateNodes } from '../src/map-plates.js';

const FAR = 26, VW = 320;
const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ LEVELS });
vm.runInContext(src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC =')) + '\nglobalThis.route = { NODES };', ctx);
const NODES = ctx.route.NODES;

const nodes = plateNodes(NODES, n => LEVELS[n.level].name);
const plates = layoutPlates(nodes, VW);
const over = (a, b, pad) => a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;
const bad = [];
for (let i = 0; i < nodes.length; i++) {
  const a = nodes[i], pa = plates.get(a.id);
  if (!pa.fits) bad.push(a.id + ': no free side for its plate "' + a.label + '" (' + a.x + ',' + a.y + ')');
  { const bx = Math.max(pa.x, Math.min(pa.x + pa.w, a.x)), by = Math.max(pa.y, Math.min(pa.y + pa.h, a.y)), far = Math.hypot(bx - a.x, by - a.y);
    if (far > FAR) bad.push(a.id + ': plate is ' + far.toFixed(0) + 'px from its node (max ' + FAR + ')'); }
  for (let j = i + 1; j < nodes.length; j++) {
    const b = nodes[j], pb = plates.get(b.id), d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < MIN_NODE_GAP) bad.push(a.id + ' <-> ' + b.id + ': nodes only ' + d.toFixed(1) + 'px apart (min ' + MIN_NODE_GAP + ')');
    if (over(nodeBox(a), nodeBox(b), 0)) bad.push(a.id + ' <-> ' + b.id + ': node boxes overlap');
    if (over(pa, pb, 0)) bad.push(a.id + ' <-> ' + b.id + ': name plates overlap ("' + a.label + '" / "' + b.label + '")');
    if (over(pa, nodeBox(b), 0)) bad.push(a.id + ' plate covers node ' + b.id);
    if (over(pb, nodeBox(a), 0)) bad.push(b.id + ' plate covers node ' + a.id);
  }
}
for (const n of nodes) { const r = placePanel(n, nodes, plates); if (!r.ok) bad.push(n.id + ": the info panel / header / footer would hide " + [...new Set(r.hits.map(h => h.id + " " + h.what))].join(", ") + " (best try: camera anchor " + r.anchor + ", panel at " + r.x + "," + r.y + ")"); }
if (bad.length) { console.error('map-spacing FAIL (' + bad.length + ' offences, nodes: ' + nodes.length + '):\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('map-spacing ok: ' + nodes.length + ' nodes, every plate clear (min node gap ' + MIN_NODE_GAP + ', pad ' + PLATE_PAD + ')');
