// tools/road-map.mjs - THE NEW ROAD AREAS' MAP STRETCH (claude/nightroad). WISPWOOD, THE SILK UNDERCROFT, THE HOLLOW MANOR and THE MAGE ACADEMY are four flag-off areas
// that all sit between THE BURIAL CAVERNS and THE MAGE'S FOLLY. They ride a batch together or one at a time, so this runs EVERY one of the 16 flag combinations
// (a child node per combination: each flag is read when src/level.js is imported) and asserts, for each:
//   1. NO TWO MAP NODES OVERLAP: node boxes, name plates (the game's own layout, src/map-plates.js), a plate over another node, and the nodes' own discs (min gap);
//   2. THE STRETCH READS IN ROAD ORDER: burial > wispwood > silk > manor > the stair > academy > the Folly (only those present) - in the node list, along the painted
//      road (NODE_AT never goes backwards) and by `needs` (each area needs the one before it; the Folly needs the academy, or the stair);
//   3. with every flag off the stretch is master's exactly: burial, the stair, the Folly and none of the four new nodes.
// node tools/road-map.mjs   (no browser, no flags needed; it sets them itself)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const FLAGS = [['wispwood', '__WW'], ['silk', '__SK'], ['manor', '__MN'], ['academy', '__AC']];
const ROAD = ['burial', 'wispwood', 'silk', 'manor', 'witchlight', 'academy', 'mage'];
const ci = process.argv.indexOf('--child');

if (ci < 0) {
  const bad = [];
  for (let mask = 0; mask < 16; mask++) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--child', String(mask)], { encoding: 'utf8' });
    if (r.status !== 0) bad.push('flags ' + (FLAGS.filter((_, i) => mask & (1 << i)).map(f => f[0]).join('+') || 'none') + ': ' + ((r.stderr || r.stdout || '').trim().split('\n').slice(0, 6).join(' | ')));
  }
  if (bad.length) { console.error('road-map FAIL (' + bad.length + ' of 16 combinations):\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('road-map ok: all 16 flag combinations - no two map nodes overlap, the stretch burial > wispwood > silk > manor > stair > academy > Folly reads in order (nodes, painted road, needs)');
} else {
  const mask = +process.argv[ci + 1];
  for (let i = 0; i < FLAGS.length; i++) if (mask & (1 << i)) globalThis[FLAGS[i][1]] = true;
  const fs = await import('node:fs'); const vm = await import('node:vm');
  const { LEVELS } = await import('../src/level.js');
  const { layoutPlates, nodeBox, MIN_NODE_GAP, plateNodes } = await import('../src/map-plates.js');
  const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const ctx = vm.createContext({ LEVELS });
  vm.runInContext(src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC =')) + '\nglobalThis.route = { NODES, NODE_AT };', ctx);
  const { NODES, NODE_AT } = ctx.route;
  const on = FLAGS.filter((_, i) => mask & (1 << i)).map(f => f[0]);
  // 3. flag off = master: none of the four nodes (or levels) exist
  for (const [id] of FLAGS) {
    assert.equal(NODES.some(n => n.id === id), on.includes(id), id + ' node present exactly when its flag is on');
    assert.equal(LEVELS.some(l => l.id === id), on.includes(id), id + ' level present exactly when its flag is on');
  }
  // 1. no two nodes overlap (the game's own plate layout, as tools/map-spacing.mjs)
  const nodes = plateNodes(NODES, n => LEVELS[n.level].name), plates = layoutPlates(nodes, 320);
  const over = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i], pa = plates.get(a.id);
    assert(pa.fits, a.id + ': no free side for its plate');
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j], pb = plates.get(b.id);
      assert(Math.hypot(a.x - b.x, a.y - b.y) >= MIN_NODE_GAP, a.id + ' <-> ' + b.id + ': nodes closer than ' + MIN_NODE_GAP);
      assert(!over(nodeBox(a), nodeBox(b)), a.id + ' <-> ' + b.id + ': node boxes overlap');
      assert(!over(pa, pb), a.id + ' <-> ' + b.id + ': name plates overlap');
      assert(!over(pa, nodeBox(b)), a.id + ' plate covers node ' + b.id);
      assert(!over(pb, nodeBox(a)), b.id + ' plate covers node ' + a.id);
    }
  }
  // 2. the stretch in road order: node list, painted road, needs
  const road = ROAD.filter(id => id === 'burial' || id === 'witchlight' || id === 'mage' || on.includes(id));
  const idx = road.map(id => NODES.findIndex(n => n.id === id));
  assert(idx.every(i => i >= 0), 'every road id has a node: ' + road.join(','));
  for (let k = 1; k < road.length; k++) {
    assert(idx[k] > idx[k - 1], road[k] + ' is listed after ' + road[k - 1] + ' in NODES');
    assert(NODE_AT[idx[k]] > NODE_AT[idx[k - 1]], road[k] + ' sits further along the painted road than ' + road[k - 1]);
    assert.equal(LEVELS.find(l => l.id === road[k]).needs, road[k - 1], road[k] + ' needs ' + road[k - 1]);
  }
  console.log('ok ' + (on.join('+') || 'none'));
}
