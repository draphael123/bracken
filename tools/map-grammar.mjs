// tools/map-grammar.mjs — THE GRAMMAR OF docs/briefs/map-redesign.md §3, ENFORCED.
// "The road is a spine, and a spur is a limb — and the map must never draw a spine as a limb." This is the sibling
// tool §9 asks for: tools/additional-areas.mjs already checks the map (every node on its road to the pixel, every
// spur 4–25px off its junction, at least three spurs, the `needs` chain in NODES order) but the Harbor and Burial
// levels are that file's real subject and the map rules are a tenant in it. This file's whole subject IS the map.
// No page, no port: `vm.runInContext` on the slice of src/main.js between the region tables and MAPC, same trick
// additional-areas.mjs uses to read NODES/NODE_AT/PATH without loading the game.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { LEVELS } from '../src/level.js';

const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ LEVELS });
const slice = src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC ='));
vm.runInContext(slice + '\nglobalThis.route = { NODES, NODE_AT, PATH, MAPW, MAPH,'
  + ' DESERT_Y, INLAND_Y, COAST_Y, CRAG_Y, WOOD_Y,'
  + ' DESERT_NODES, INLAND_NODES, COAST_NODES, CRAG_NODES, WOOD_NODES,'
  + ' DESERT_PATH, INLAND_PATH, COAST_PATH, CRAG_PATH, WOOD_PATH };', ctx);
const { NODES, NODE_AT, PATH, MAPW, MAPH,
  DESERT_Y, INLAND_Y, COAST_Y, CRAG_Y, WOOD_Y,
  DESERT_NODES, INLAND_NODES, COAST_NODES, CRAG_NODES, WOOD_NODES,
  DESERT_PATH, INLAND_PATH, COAST_PATH, CRAG_PATH, WOOD_PATH } = ctx.route;

const REGIONS = [
  { name: 'DESERT', y: DESERT_Y, nodes: DESERT_NODES, path: DESERT_PATH },
  { name: 'INLAND', y: INLAND_Y, nodes: INLAND_NODES, path: INLAND_PATH },
  { name: 'COAST', y: COAST_Y, nodes: COAST_NODES, path: COAST_PATH },
  { name: 'CRAG', y: CRAG_Y, nodes: CRAG_NODES, path: CRAG_PATH },
  { name: 'WOOD', y: WOOD_Y, nodes: WOOD_NODES, path: WOOD_PATH },
];
const SHEET_W = 320, SHEET_H = 180, MARGIN = 24, SPUR_MIN = 4, SPUR_MAX = 25;

// 1. THE STACK ITSELF: five sheets, 180px apart, MAPH the sum of them. Catches the "CRAG_H declared and never
//    read" class of rot — an offset that drifted out of step with MAPH would put a whole sheet off the bottom
//    of the baked canvas and nothing would say so until it was scrolled to.
{
  const ys = [DESERT_Y, INLAND_Y, COAST_Y, CRAG_Y, WOOD_Y];
  for (let i = 1; i < ys.length; i++) assert.equal(ys[i] - ys[i - 1], SHEET_H, 'sheets must stack ' + SHEET_H + 'px apart: ' + ys.join(','));
  assert.equal(MAPH, WOOD_Y + SHEET_H, 'MAPH must be the bottom sheet + ' + SHEET_H);
  assert.equal(MAPW, SHEET_W, 'MAPW must stay ' + SHEET_W);
}

// 2. NO ROAD POLYLINE REVISITS A POINT. Every out-and-back in PATH existed to serve a spur that a dashed stub
//    already serves better; both retraces the brief found (the Undercrown's, Waymeet's) are this rule, once.
{
  const seen = new Map();
  for (let i = 0; i < PATH.length; i++) { const k = PATH[i][0] + ',' + PATH[i][1];
    if (seen.has(k)) throw new Error('PATH revisits ' + k + ' at indices ' + seen.get(k) + ' and ' + i + ' — a road polyline must never retrace a point');
    seen.set(k, i); }
}

// 3. REQUIRED NODES RESOLVE FORWARD. Within one region, walking the region's own node list in array order, the
//    global PATH index each node snaps to (NODE_AT) must never go backwards. This is the Undercrown's exact old
//    bug: it resolved to segment 38 while Highcrown, later in the array, resolved to 40 — the one node in the
//    game whose road position went backwards as its array index went forwards, reached only by overshoot-and-snap.
for (const r of REGIONS) {
  const req = r.nodes.filter(n => !n.spur);
  let prevIdx = -1, prevId = null;
  for (const n of req) { const gi = NODES.findIndex(x => x.id === n.id);
    const idx = NODE_AT[gi];
    if (prevIdx >= 0) assert(idx >= prevIdx, r.name + ': ' + n.id + ' resolves to PATH[' + idx + '], behind ' + prevId + ' at PATH[' + prevIdx + '] — a required node must not sit behind the one before it on its own road');
    prevIdx = idx; prevId = n.id; }
}

// 4. THE MARGIN RULE. No road point within 24px of its 320×180 sheet's edge, except the first and last point of
//    the region's own path — its entry and exit. This is the Ore Road's old corner: 18px from the edge of the
//    sheet, six pixels off the edge of the canvas, and no re-drawn polyline around it took it out of the margin.
// WAYMEET IS THE ONE NAMED EXCEPTION. Daniel, on the first draft of this brief: the town's location is fine, and
// nothing in the fix moves it — §6 2b keeps it at (40,162), 18px off the bottom edge, because the road now runs
// THROUGH it (full continuity on both sides) rather than diving into a corner and stopping. The margin rule is
// about corners reading as limbs, which distance-from-edge alone cannot tell apart from a town at the edge of its
// own sheet by design — so this is a named carve-out, not a loophole: one id, cited to the line that approved it.
const MARGIN_BLESSED = new Set(['40,162']);
for (const r of REGIONS) {
  r.path.forEach(([x, y], i) => { const entry = i === 0 || i === r.path.length - 1;
    if (entry || MARGIN_BLESSED.has(x + ',' + y)) return;
    const bad = x < MARGIN || x > SHEET_W - MARGIN || y < MARGIN || y > SHEET_H - MARGIN;
    assert(!bad, r.name + ' PATH[' + i + '] (' + x + ',' + y + ') is within ' + MARGIN + 'px of the sheet edge — required nodes belong in the body of the sheet'); });
}

// 5. EVERY NODE'S LEVEL INDEX IS ≥ 0. LEVELS.findIndex(...) is -1 for a level not yet landed; nodeLocked derefs
//    LEVELS[-1] and throws on the map's first frame if a node for it is ever added ahead of its level (§8).
for (const n of NODES) if (n.kind === 'level') assert(n.level >= 0, n.id + ' has no matching entry in LEVELS (level === -1) — a node cannot exist before its level does');

// 6. THE SPUR BAND: 4–25px off the junction (tightened from 4–44, §6 item 5 — 25 is the map's own worst case,
//    24.2px, rounded up), and the SECOND-nearest road point must be a real margin beyond the stub, not a near
//    tie — a junction a pixel from flipping to the wrong point is not one a later polyline edit can be trusted
//    to leave alone. (The brief's own worked table has two spurs — the Church, the re-sited Undercrown — whose
//    next-nearest point is barely more than the stub itself, so this is "clearly more", not literally double.)
for (const r of REGIONS) for (const n of r.nodes) { if (!n.spur || !r.path.length) continue;
  const dists = r.path.map(p => Math.hypot(p[0] - n.x, p[1] - n.y)).sort((a, b) => a - b);
  const [stub, next] = dists;
  assert(stub > SPUR_MIN && stub < SPUR_MAX, r.name + ': ' + n.id + ' is ' + stub.toFixed(1) + 'px off its junction, wanted ' + SPUR_MIN + '-' + SPUR_MAX);
  if (next !== undefined) assert(next > stub * 1.15, r.name + ': ' + n.id + "'s next-nearest road point (" + next.toFixed(1) + 'px) is too close to its stub (' + stub.toFixed(1) + 'px) — the NODE_AT junction can flip under a later polyline edit'); }

// 7. mapToSaved's LEGACY EXCLUSION LIST NAMES REAL NODES. It reconciles an old numeric PROG.mapNode save against
//    nodes added since by dropping the ones that would shift the index — an id in that list which is no longer
//    in NODES is dead weight nobody will notice; a node added since without being added there is the failure
//    mode itself (§2e), but this half is checkable without knowing "since when" a node was added.
{
  const m = src.match(/const legacy\s*=\s*NODES\.filter\(n\s*=>\s*!\[([^\]]*)\]/);
  assert(m, 'mapToSaved\'s legacy filter array not found — has its shape changed?');
  const ids = m[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
  const known = new Set(NODES.map(n => n.id));
  // 'harbor' is the one deliberate exception: STORMWRECK HARBOR came OFF the road on purpose and mapToSaved
  // remaps an old save's 'harbor' to 'causeway' by name, right above the legacy filter this reads.
  for (const id of ids) if (id !== 'harbor') assert(known.has(id), "mapToSaved's legacy list names '" + id + "', which is not a node in NODES — stale entry");
}

console.log('The map grammar holds: no retraced road, required nodes resolve forward, the margin and spur bands hold, every node has a real level, and mapToSaved\'s legacy list names real nodes.');
