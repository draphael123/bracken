// tools/gq6geo.mjs - GQ6GEO, THE NODE HALF (claude/gq6geo, scratch/lane-reports/gq6-plan.md section C / slice S1). No page, no browser.
//   OFF   (flag default) Highcrown is master's cell for cell: the level hash is the pinned master hash, ten Geomancers, nothing at the three new perches
//   ON    (BRACKEN_GQ6GEO=1, run as a child of this tool) thirteen Geomancers: for each new perch - a one-way ledge to stand on with three rows of air over it, floor under his leash, a pier or a chain
//         drawn under it, his sight to the route (>= 8 columns of the route in his band with a clear line), no shrine within 12 tiles and no arena round it, no other foe beside him, 30+ columns
//         from every other Geomancer; the level with the three perches taken OUT hashes to the master hash (nothing else moved: the seeded sprinkles are unchanged); the route (the flood fill)
//         still reaches the arena and every shrine, and the only new standing tiles are the ledges themselves
//   node tools/gq6geo.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { install } from './node-canvas.mjs';
install();
globalThis.window = globalThis.window || {};
const { LEVELS, T } = await import('../src/level.js');
const { floodReach } = await import('../src/reachcore.js');
const LQ = await import('./level-quality.mjs');
const { G6GEO, GEO6 } = await import('../src/gq6geo.js');
const MASTER_HASH = '3e2c11ae45a2';   /* levelHash of 'crown' on master 76e05f9c4 (flag OFF). A later Highcrown edit moves it: re-pin it here, in the same commit. */
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'crown'), L = lv.build();
const hashOf = (L0) => createHash('sha1').update(JSON.stringify([L0.W, L0.H, Array.from(L0.grid), L0.ents.filter(e => !e.stuck && e.t !== 'lostbanner'), L0.moversExtra || null, L0.ambushes || null], (k, v) => k === 'stand' ? undefined : v)).digest('hex').slice(0, 12);
const geos = () => L.ents.filter(e => e.t === 'gobgeo');
const NEW = ['CRAG', 'BAKE', 'KEEP'].map(k => ({ k, ...GEO6[k] }));

if (!G6GEO) {
  ok(hashOf(L) === LQ.levelHash(lv), 'the tool hashes a level exactly as tools/level-quality.mjs does');
  ok(LQ.levelHash(lv) === MASTER_HASH, 'FLAG OFF: Highcrown is master cell for cell (hash ' + LQ.levelHash(lv) + ')');
  ok(geos().length === 10, 'ten Geomancers today (' + geos().length + ')');
  for (const P of NEW) ok(!geos().some(e => e.x === P.geo), P.k + ': nobody at column ' + P.geo);
  ok(!(L.routeSupports || []).some(s => NEW.some(P => s.x === P.ledge[0] && s.y === P.ledge[2])), 'no piers or chains laid');
  console.log('gq6geo OFF: ' + n + ' checks');
  const r = spawnSync(process.execPath, [new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' ')], { env: { ...process.env, BRACKEN_GQ6GEO: '1' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  process.stdout.write(r.stdout || ''); if (r.status !== 0) { process.stderr.write(r.stderr || ''); process.exit(r.status || 1); }
  process.exit(0);
}

/* ---------------- ON ---------------- */
const W = L.W, g = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H) ? T.SOLID : L.grid[y * W + x];
const floor = v => v === T.SOLID || v === T.ONEWAY || v === T.PLANK;
const blocks = v => v === T.SOLID || v === T.CRATE || v === T.PALISADE || v === T.PORT;
ok(geos().length === 13, 'FLAG ON: thirteen Geomancers (' + geos().length + ')');
ok(LQ.levelHash(lv) !== MASTER_HASH, 'and the level is no longer the master level');
const R1 = floodReach(L, T, { rides: true });
/* the level with the three perches taken OUT = master */
const bare = lv.build();
for (const P of NEW) { for (let x = P.ledge[0]; x <= P.ledge[1]; x++) bare.grid[P.ledge[2] * W + x] = T.AIR; }
bare.ents = bare.ents.filter(e => !(e.t === 'gobgeo' && NEW.some(P => P.geo === e.x && P.row === e.y)) && !(e.t === 'sign' && NEW.some(P => P.sign[0] === e.x && P.sign[1] === e.y)));
ok(hashOf(bare) === MASTER_HASH, 'take the three perches out and the level hashes to master: nothing else moved (' + hashOf(bare) + ')');
const R0 = floodReach(bare, T, { rides: true });
const added = [...R1.seen].filter(k => !R0.seen.has(k)), lost = [...R0.seen].filter(k => !R1.seen.has(k));
ok(lost.length === 0, 'the route lost nothing (' + lost.length + ')');
ok(added.every(k => { const [x, y] = k.split(',').map(Number); return NEW.some(P => x >= P.ledge[0] && x <= P.ledge[1] && y === P.row); }), 'the only new standing tiles are the ledges themselves (' + added.length + ')');
const trig = Math.floor(L.arena.trigger / 16);
ok([...R1.seen].some(k => +k.split(',')[0] >= trig), 'the route still reaches the Queen\'s arena');
for (const c of L.ents.filter(e => e.t === 'check')) ok(R1.seen.has(c.x + ',' + c.y) === R0.seen.has(c.x + ',' + c.y), 'shrine ' + c.x + '/' + c.y + ' reached exactly as before');
const route = [...R1.seen].map(k => k.split(',').map(Number)).filter(([x, y]) => floor(g(x, y + 1)) && !NEW.some(P => x >= P.ledge[0] && x <= P.ledge[1] && y === P.row));
const los = (ax, ay, bx, by) => { const m = Math.ceil(Math.hypot(bx - ax, by - ay) / 4); for (let i = 1; i < m; i++) { const x = ax + (bx - ax) * i / m, y = ay + (by - ay) * i / m; if (blocks(g(Math.floor(x / 16), Math.floor(y / 16)))) return false; } return true; };
const arenas = [L.arena, L.mini].filter(Boolean);
const report = [];
for (const P of NEW) {
  const e = geos().find(q => q.x === P.geo && q.y === P.row); ok(!!e, P.k + ': he is in the level at ' + P.geo + '/' + P.row);
  ok(P.sign && L.ents.some(q => q.t === 'sign' && q.x === P.sign[0] && q.y === P.sign[1]), P.k + ': his sign stands there');
  for (let x = P.ledge[0]; x <= P.ledge[1]; x++) ok(g(x, P.ledge[2]) === T.ONEWAY, P.k + ': ledge tile ' + x + ' laid');
  ok(P.ledge[1] - P.ledge[0] + 1 >= 3 && P.geo > P.ledge[0] + 1 && P.geo < P.ledge[1] - 1, P.k + ': the ledge is wide and he stands inside it (floor under his leash)');
  ok(P.row === P.ledge[2] - 1, P.k + ': he stands on the row over the ledge');
  for (let r = 1; r <= 3; r++) for (let x = P.geo - 1; x <= P.geo + 1; x++) ok(g(x, P.row - r + 1) === T.AIR, P.k + ': air at ' + x + '/' + (P.row - r + 1));
  const sup = (L.routeSupports || []).filter(s => s.y === P.ledge[2] && (s.x === P.ledge[0] || s.x === P.ledge[1]));
  ok(sup.length === 2 && sup.every(s => P.pier !== undefined ? s.kind === 'hcpier' && s.bottom === P.pier : s.kind === 'hcchain' && s.top === P.chainTop), P.k + ': a ' + (P.pier !== undefined ? 'pier' : 'chain') + ' under each end of the ledge');
  if (P.pier !== undefined) { ok(floor(g(P.ledge[0], P.pier)) && floor(g(P.ledge[1], P.pier)), P.k + ': both piers stand on something'); for (let y = P.ledge[2] + 1; y < P.pier; y++) ok(g(P.ledge[0], y) === T.AIR, P.k + ': pier shaft clear'); }
  /* his sight (src/gob-geomancer.js geoStep: a perch sees dx < sight, dy in (-260, 320) from his feet) and a clear line to the hero's chest */
  const gx = P.geo * 16 + 8, gy = (P.row + 1) * 16 - 30, feet = (P.row + 1) * 16, cols = new Set(), band = [];
  for (const [rx, ry] of route) { const dx = Math.abs(rx * 16 + 8 - gx), dy = (ry + 1) * 16 - feet; if (dx < 60 || dx >= P.sight || dy <= -260 || dy >= 320) continue; if (los(gx, gy, rx * 16 + 8, (ry + 1) * 16 - 12)) { cols.add(rx); band.push(rx); } }
  ok(cols.size >= 8, P.k + ': he sees ' + cols.size + ' route columns with a clear line');
  const w2 = [...cols].sort((a, b) => a - b); report.push(P.k + ' ' + P.geo + '/' + P.row + ' sees x ' + w2[0] + '..' + w2[w2.length - 1] + ' (' + cols.size + ' cols)' + (R1.seen.has(P.geo + ',' + P.row) ? ', reachable by a drop' : ', off the route'));
  if (P.k !== 'KEEP') ok(!R1.seen.has(P.geo + ',' + P.row), P.k + ': off the route (a plain jump cannot reach him)');
  for (const c of L.ents.filter(q => q.t === 'check')) ok(Math.max(Math.abs(c.x - P.geo), Math.abs(c.y - P.row)) >= 12, P.k + ': 12+ tiles from shrine ' + c.x + '/' + c.y);
  for (const A of arenas) { const x0 = A.x0 / 16 - 2, x1 = A.x1 / 16 + 2; ok(P.geo < x0 || P.geo > x1, P.k + ': outside every arena'); }
  for (const q of L.ents.filter(q => !['coin', 'deco', 'torch', 'sign', 'scaffold'].includes(q.t) && !(q.t === 'gobgeo' && q.x === P.geo && q.y === P.row))) ok(!(Math.abs(q.x - P.geo) < 4 && Math.abs(q.y - P.row) < 5), P.k + ': no ' + q.t + ' at ' + q.x + '/' + q.y + ' beside him');
  for (const o of geos()) if (o !== e) ok(Math.abs(o.x - P.geo) >= 30, P.k + ': 30+ columns from the Geomancer at ' + o.x);
  /* the sign is on the route, standable and read BEFORE he can see you */
  ok(R1.seen.has(P.sign[0] + ',' + P.sign[1]), P.k + ': his sign is on a standing tile of the route');
}
/* the order along the level: the new ones fill the gap the plan named (nothing between 93 and 345 today) */
const xs = geos().map(q => q.x).sort((a, b) => a - b);
ok(xs.filter(x => x > 93 && x < 345).length === 2 && xs.includes(140) && xs.includes(300) && xs.includes(406), 'the Geomancers along the level: ' + xs.join(' '));
console.log('gq6geo ON: ' + n + ' checks');
for (const r of report) console.log('  ' + r);
