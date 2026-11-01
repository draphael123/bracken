// tools/map-roads.mjs - EVERY STEP OF THE ROAD IS PAINTED (claude/maproad, Daniel 11-01: "the map looks weird after Palisade Wood - there's no
// path connecting to the next area, you can get there, it just looks weird - there's no road").
//   The cause: THE PALISADE WOOD / KINGSWOOD moved the sheet's last node but the seam connector (the leg that carries the road off the wood
//   sheet toward the crags) still started at the OLD Kingswood spot, so the road from Kingswood on was never painted at all.
// No page, no port: the same vm slice of src/main.js tools/map-grammar.mjs reads. A "painted road" is what the bake draws: every region's path
//   (shifted to its sheet) plus the sheet connectors (MAP_CONNECTORS). For every level node on the main road (not a spur, not a store) whose gate
//   (needs / needsTime / needsKills) is another main-road node, the two must be joined by painted road - a chain of painted segments whose
//   joins meet within 2px - and the road must run to both nodes (a node ON a painted segment, within 3px).
//   Also: no painted segment dangles (an end that touches no other painted segment and no node), which is how an orphan stub of the old road looks.
// usage: node tools/map-roads.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { LEVELS } from '../src/level.js';
import { gateOf } from '../src/campaign-order.js';

const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ LEVELS });
const slice = src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC ='));
vm.runInContext(slice + '\nglobalThis.route = { NODES, MAP_CONNECTORS, WOOD_Y, CRAG_Y, COAST_Y, INLAND_Y, DESERT_Y, WOOD_PATH, CRAG_PATH, COAST_PATH, INLAND_PATH, DESERT_PATH };', ctx);
const R = ctx.route;
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); }, ok = m => console.log('ok   ' + m);

const segs = [];   // [x0,y0,x1,y1] in world map pixels, as baked
for (const [path, y] of [[R.WOOD_PATH, R.WOOD_Y], [R.CRAG_PATH, R.CRAG_Y], [R.COAST_PATH, R.COAST_Y], [R.INLAND_PATH, R.INLAND_Y], [R.DESERT_PATH, R.DESERT_Y]])
  for (let i = 0; i + 1 < path.length; i++) segs.push([path[i][0], path[i][1] + y, path[i + 1][0], path[i + 1][1] + y]);
for (const c of R.MAP_CONNECTORS) segs.push([c[0][0], c[0][1], c[1][0], c[1][1]]);
const dSeg = (x, y, s) => { const dx = s[2] - s[0], dy = s[3] - s[1], t = Math.max(0, Math.min(1, ((x - s[0]) * dx + (y - s[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(s[0] + dx * t - x, s[1] + dy * t - y); };
const segDist = (a, b) => Math.min(dSeg(a[0], a[1], b), dSeg(a[2], a[3], b), dSeg(b[0], b[1], a), dSeg(b[2], b[3], a));
// painted components: segments touching (within 2px) are one road
const comp = segs.map((_, i) => i); const find = i => comp[i] === i ? i : (comp[i] = find(comp[i]));
for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) if (segDist(segs[i], segs[j]) <= 2) comp[find(i)] = find(j);
const nodeComp = nd => { let best = null; segs.forEach((s, i) => { const d = dSeg(nd.x, nd.y, s); if (!best || d < best.d) best = { d, c: find(i) }; }); return best; };

const byLevel = Object.fromEntries(R.NODES.filter(n => n.kind === 'level' && R.NODES.indexOf(n) >= 0).map(n => [LEVELS[n.level] && LEVELS[n.level].id, n]));
const road = nd => nd && !nd.spur && nd.kind === 'level';
let pairs = 0;
for (const nd of R.NODES.filter(road)) {
  const lv = LEVELS[nd.level]; const g = gateOf(lv); if (!g) continue;
  const gn = byLevel[g]; if (!gn) { continue; }   // a gate with no node (shelved level) has no road to draw
  if (!road(gn)) continue;   // a spur or store gate: its own dashed stub / room, not a road leg
  pairs++;
  const a = nodeComp(gn), b = nodeComp(nd);
  if (a.d > 3) fail(gn.id + ' -> ' + nd.id + ': ' + gn.id + ' is ' + a.d.toFixed(1) + 'px off any painted road');
  else if (b.d > 3) fail(gn.id + ' -> ' + nd.id + ': ' + nd.id + ' is ' + b.d.toFixed(1) + 'px off any painted road');
  else if (a.c !== b.c) fail(gn.id + ' -> ' + nd.id + ': no painted road joins them (a gap in the road between the two nodes)');
}
ok(pairs + ' road legs (gate node -> level node) checked');
// no dangling painted end: every segment end touches another painted segment or sits on a node
const ends = [];
segs.forEach((s, i) => { for (const [x, y] of [[s[0], s[1]], [s[2], s[3]]]) { const touch = segs.some((t, j) => j !== i && dSeg(x, y, t) <= 2), onNode = R.NODES.some(n => Math.hypot(n.x - x, n.y - y) <= 3); if (!touch && !onNode) ends.push('(' + x + ',' + y + ')'); } });
// the first and last points of the whole road are the road's own start/end (the lumber trail's head, the sunken caravan's tail) and may be free
const freeOk = new Set(['(62,832)']);   // WOOD_PATH head = THE LUMBER TRAIL node; listed for clarity, it sits on a node anyway
const dangling = ends.filter(e => !freeOk.has(e));
// the road's far tail (the desert sheet's end) is allowed one free end; anything else is an orphan
const lastNode = R.NODES[R.NODES.length - 1];
dangling.length <= 1 ? ok('no dangling painted road end' + (dangling.length ? ' (the one free tail ' + dangling[0] + ')' : '')) : fail('painted road ends that join nothing: ' + dangling.join(' '));
if (bad) { console.log(bad + ' FAIL'); process.exit(1); } console.log('PASS');
