// tools/keep-passages.mjs — THE KEEP'S NARROWS, PROVED (src/keep-passages.js, batch 2 of work/claude/KICKOFF.md).
// Built: the approach is 560 tiles, the new stretch is passages and not a hall, every siphon is a mouth in rock on a
// passage and nowhere near air, blight lies on water, every place in the narrows combines three hazards or more, the
// water there is never far from air, and the checkpoints and the inner keep can be reached.
// Unit: a siphon drinks harder close than far, not at all in air, pulls you toward its mouth, and the bubbles it takes
// out of you fly AT it; blight poisons. Page: the same, in the running game, through main.js's own hook.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { airBoxes } from '../src/deepair.js';
import { SIPHON, siphonNear, inBlight, updateKeepPassages } from '../src/keep-passages.js';
import { KEEP_APPROACH as N } from '../src/keep-expansion.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'keep').build(), W = L.W, at = (x, y) => L.grid[y * W + x];
assert.equal(N, 560); assert.equal(W, N + 200);
const secs = L.keepSections.map(s => s.name);
for (const n of ['THE SIPHON GALLERIES', 'THE BLIGHTED CISTERN']) assert(secs.includes(n), n);
assert(L.deep.zones.length >= 8 && new Set(L.deep.zones.map(z => z.col.join())).size >= 8, 'each place has its own light');

// NARROW: open water per column, the old hall against the new stretch
const openCol = x => { let n = 0; for (let y = 24; y <= 58; y++) if (at(x, y) === T.AIR) n++; return n; };
const median = a => a.slice().sort((p, q) => p - q)[a.length >> 1];
const hall = median(Array.from({ length: 60 }, (_, i) => openCol(1 + i))), narrows = Array.from({ length: N - 400 }, (_, i) => openCol(400 + i));
const tight = narrows.filter(n => n <= 8).length / narrows.length;
assert(hall >= 30, 'the outer court is still a hall: ' + hall); assert(tight >= 0.5, 'the narrows are passages: ' + tight.toFixed(2));
assert(openCol(100) <= 18, 'the Countercurrent high road is a slot'); assert(openCol(380) <= 14, 'the Bell Approach narrows');

// SIPHONS: a mouth in rock, beside a passage, never over air
const boxes = airBoxes(L), inAirBox = (x, y) => boxes.some(b => x > b.l && x < b.r && y > b.t && y < b.b);
assert(L.siphons.length >= 7, 'siphons ' + L.siphons.length);
for (const s of L.siphons) {
  assert.notEqual(at(s.x, s.y), T.AIR, 'siphon mouth in rock ' + s.x + ',' + s.y);
  const cx = s.x * 16 + 8, cy = s.y * 16 + 8; let water = 0;
  for (let a = 0; a < 64; a++) for (const r of [16, 32, 48]) { const x = cx + Math.cos(a / 10.19) * r, y = cy + Math.sin(a / 10.19) * r;
    assert(!inAirBox(x, y + 12 - 8), 'siphon ' + s.x + ',' + s.y + ' reaches air at ' + Math.round(x) + ',' + Math.round(y));
    if (at(Math.floor(x / 16), Math.floor(y / 16)) === T.AIR) water++; }
  assert(water > 20, 'siphon ' + s.x + ',' + s.y + ' reaches a passage');
}
// BLIGHT: on water, not on air
for (const [x0, x1, y0, y1] of L.blight) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (at(x, y) === T.AIR) assert(!inAirBox(x * 16 + 8, y * 16 + 8), 'blight on air ' + x + ',' + y);
assert(L.blight.length >= 5 && L.gasVents.length >= 7);

// COMBINED: every place from the Countercurrent on has two hazards or more; the two new places three or more
const kinds = (a, b) => { const k = new Set();
  if (L.siphons.some(s => s.x >= a && s.x <= b)) k.add('siphon'); if (L.blight.some(r => r[0] <= b && r[1] >= a)) k.add('blight');
  if (L.gasVents.some(v => v.x >= a && v.x <= b)) k.add('grate'); if (L.deep.currents.some(c => c.x0 <= b && c.x1 >= a)) k.add('current');
  if (L.deep.vents.some(v => v.hot && v.x >= a && v.x <= b)) k.add('lift'); if (L.deep.gates.some(g => g.col >= a && g.col <= b)) k.add('sluice');
  /* and the rework's (docs/briefs/keep-rework-2.md): a whirlpool, failing stone, a roof that drops */
  if ((L.whirlpools || []).some(w => w.x >= a && w.x <= b)) k.add('whirlpool'); if ((L.crumbles || []).some(c => c.x0 <= b && c.x1 >= a)) k.add('failing stone'); if (L.ents.some(e => e.t === 'rockfall' && e.x >= a && e.x <= b)) k.add('rockfall'); return k; };
for (const s of L.keepSections.filter(s => s.x0 >= 66 && s.x0 < N)) { const k = kinds(s.x0, s.x1), need = s.x0 >= 400 ? 3 : 2; assert(k.size >= need, s.name + ' has only ' + [...k]); }

// AIR IS NEVER FAR: a flood through the narrows' water from every air cell, in tiles
const dist = new Int32Array(W * L.H).fill(-1), q = [];
for (let y = 24; y <= 58; y++) for (let x = 380; x < N + 10; x++) if (at(x, y) === T.AIR && inAirBox(x * 16 + 8, (y + 1) * 16 - 8)) { dist[y * W + x] = 0; q.push(y * W + x); }
for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (y + dy) * W + x + dx; if (x + dx >= 380 && x + dx < N + 10 && at(x + dx, y + dy) === T.AIR && dist[j] < 0) { dist[j] = dist[i] + 1; q.push(j); } } }
let far = 0; for (let y = 24; y <= 58; y++) for (let x = 400; x < N; x++) if (at(x, y) === T.AIR) { assert(dist[y * W + x] >= 0, 'water cut off from air ' + x + ',' + y); far = Math.max(far, dist[y * W + x]); }
assert(far <= 34, 'furthest water from air in the narrows: ' + far + ' tiles');

// REACH: the checkpoints of the narrows and the inner keep's door
const reach = floodReach(L, T, { rides: true });
for (const e of L.ents.filter(e => e.x >= 400 && e.x < N && ['check', 'coin'].includes(e.t))) assert(reach.jumpNear(e.x, e.y), e.t + ' ' + e.x + ',' + e.y);
assert(reach.jumpNear(N + 2, 58), 'through the narrows into the inner keep');

// UNIT: the hazard itself
const s0 = L.siphons.find(s => s.x >= 400), m = { x: s0.x * 16 + 8, y: s0.y * 16 + 8 };
const run = (dx, dy, air = false) => { const P = { x: m.x + dx, y: m.y + dy + 12, swim: true, breath: 18, dead: false }, moves = [], parts = [];
  const LL = { siphons: [s0], blight: [] }; for (let f = 0; f < 60; f++) updateKeepPassages(LL, P, 1 / 60, f / 60, { breathMax: 18, inAir: () => air, move: (x, y) => { moves.push([x, y]); P.x += x; P.y += y; }, emit: p => parts.push(p), poison: () => {} });
  return { P, moves, parts }; };
const near = run(0, 20), edge = run(0, 50), none = run(0, 20, true), outside = run(0, SIPHON.r + 20);
assert(18 - near.P.breath > 18 - edge.P.breath && 18 - edge.P.breath > 0.5, 'drinks harder close: ' + near.P.breath.toFixed(2) + ' vs ' + edge.P.breath.toFixed(2));
assert.equal(none.P.breath, 18, 'no drain in air'); assert.equal(outside.P.breath, 18, 'no drain out of reach');
assert(near.moves.length && near.P.y - 12 < m.y + 20, 'pulled toward the mouth');
assert(near.parts.length > 3 && near.parts.every(p => (m.x - p.x) * p.vx + (m.y - p.y) * p.vy > 0), 'the bubbles fly at the siphon');
let poisoned = 0; const bl = L.blight.find(r => r[0] >= 400); updateKeepPassages({ blight: [bl] }, { x: bl[0] * 16 + 20, y: (bl[3] + 1) * 16, swim: true, breath: 18 }, 1 / 60, 0, { breathMax: 18, inAir: () => false, move() {}, emit() {}, poison: () => poisoned++ });
assert.equal(poisoned, 1, 'blight poisons'); assert(inBlight(L, bl[0] * 16 + 20, (bl[3] + 1) * 16) && !siphonNear(L, 20, 20));

// PAGE: through main.js's hook, in the running game
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='keep'));BK.start();BK.sim(10);for(const e of BK.enemies())e.alive=false;BK.god=false;
   const P=BK.P,S=BK.L.siphons.find(s=>s.x>=400),hold=(tx,ty,n)=>{BK.tp(tx,ty);P.breath=18;const x0=P.x,y0=P.y;for(let f=0;f<n;f++)BK.sim(1);return{b:P.breath,dx:P.x-x0,dy:P.y-y0,swim:P.swim};};
   const away=hold(404,55,120),at=hold(S.x+1,S.y+2,120);
   const B=BK.L.blight.find(r=>r[0]>=480);BK.tp(B[0]+1,B[3]);P.venomT=0;BK.sim(20);const venom=P.venomT;
   return{away,at,venom};})()`);
  assert(r.away.swim && r.at.swim, 'swimming'); assert(18 - r.at.b > 3 * (18 - r.away.b), 'the siphon drinks in the game: ' + JSON.stringify(r));
  assert(r.venom > 0, 'blight poisons in the game'); assert.deepEqual(pg.errors, []);
  console.log('Keep narrows: approach ' + N + ' tiles, ' + Math.round(tight * 100) + '% of the new stretch is passage (hall median ' + hall + '), ' + L.siphons.length + ' siphons, ' + L.blight.length + ' blights, ' + L.gasVents.length + ' grates, air never more than ' + far + ' tiles off; in game 2s by a siphon costs ' + (18 - r.at.b).toFixed(1) + ' breath vs ' + (18 - r.away.b).toFixed(1) + ' away.');
} finally { pg.close(); }
