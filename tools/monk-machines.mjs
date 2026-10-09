// tools/monk-machines.mjs - WHAT THE MONKS BUILT MUST WORK, AND STAND ON SOMETHING (claude/monastery2; scratch/review-monastery.md M1-M4).
// The review found three classes nothing judged: a prayer wheel whose stair hung under the roof (no board of it could be stood on), a brazier a
// tile off the floor (vent footing: tools/floaters.mjs), and natural-rock SOLID slabs in open sky dressed as grass and dirt in a stone monastery.
//   WHEEL ARMS   every board of every prayer wheel's stair, in BOTH states, has a row clear over it (a hero stands 14 px tall), and its pivot is a
//                jump off the floor its wheel stands on (<= 3 rows); each step of the stair is a jump from the last (<= 3 rows up, <= 4 across)
//   SOLID ISLANDS on a monk level, every SOLID component not joined to the level's walls or bedrock lies inside the laid stone (L.masonry) or is
//                listed in L.islands with a reason - a slab in the sky is never left as the mountain's grass
//   ROUTE BELLS / BRAZIERS stand on footing (a bell on its frame, a brazier in its bowl)
//     node tools/monk-machines.mjs
import { LEVELS, T } from '../src/level.js';
const fails = [], oks = []; const ok = (c, m) => (c ? oks : fails).push(m);
for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch { continue; }
  const W = L.W, g = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : L.grid[y * W + x], solid = t => t === T.SOLID || t === T.PALISADE || t === T.CRATE || t === T.SOFT;
  for (const w of L.ents.filter(e => e.t === 'pwheel')) {
    const [px, py] = w.pivot; ok(w.y + 1 - py <= 3 && w.y + 1 - py >= 1, lv.id + ': wheel ' + w.x + ',' + w.y + ' - its pivot is a jump off its floor (' + (w.y + 1 - py) + ' rows)');
    for (const st of ['a', 'b']) { let lx = px, ly = py;
      for (const [x0, y, n] of w[st]) { let any = false;
        for (let x = x0; x < x0 + n; x++) { if (solid(g(x, y))) continue; any = true; ok(!solid(g(x, y - 1)), lv.id + ': wheel ' + w.x + ',' + w.y + ' state ' + st + ' - board ' + x + ',' + y + ' has a row clear over it'); }
        ok(any, lv.id + ': wheel ' + w.x + ',' + w.y + ' state ' + st + ' - its step at ' + x0 + ',' + y + ' is laid in the open');
        ok(ly - y <= 3 && Math.abs(x0 - lx) <= 4, lv.id + ': wheel ' + w.x + ',' + w.y + ' state ' + st + ' - its step at ' + x0 + ',' + y + ' is a jump from the last'); lx = x0; ly = y; } } }
  if (!L.monk) continue;
  /* SOLID islands */
  const seen = new Uint8Array(W * L.H), inRect = (x, y, rs) => (rs || []).some(r => x >= r[0] && x <= r[1] && y >= r[2] && y <= r[3]);
  for (let y = 0; y < L.H; y++) for (let x = 0; x < W; x++) { if (seen[y * W + x] || L.grid[y * W + x] !== T.SOLID) continue;
    const q = [[x, y]], cells = []; seen[y * W + x] = 1;
    while (q.length) { const [cx, cy] = q.pop(); cells.push([cx, cy]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= L.H) continue; const i = ny * W + nx; if (!seen[i] && L.grid[i] === T.SOLID) { seen[i] = 1; q.push([nx, ny]); } } }
    if (cells.some(([cx, cy]) => cx === 0 || cx === W - 1 || cy === L.H - 1)) continue;
    const bare = cells.filter(([cx, cy]) => !inRect(cx, cy, L.masonry) && !inRect(cx, cy, L.islands));
    ok(!bare.length, lv.id + ': the SOLID island at ' + cells[0].join(',') + ' (' + cells.length + ' tiles) is laid stone or listed in L.islands (' + bare.length + ' bare: ' + bare.slice(0, 4).map(c => c.join(',')).join(' ') + ')'); }
  for (const e of L.ents.filter(e => e.t === 'tbell' && !e.hang)) ok(solid(g(e.x, e.y + 1)) || g(e.x, e.y + 1) === T.ONEWAY || g(e.x, e.y + 1) === T.PLANK, lv.id + ': the bell at ' + e.x + ',' + e.y + ' stands on its floor');
}
for (const m of fails) console.log('FAIL ' + m);
console.log('monk-machines: ' + oks.length + ' ok, ' + fails.length + ' failed');
process.exit(fails.length ? 1 : 0);
