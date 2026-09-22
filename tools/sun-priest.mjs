// tools/sun-priest.mjs — THE SUN PRIEST's kit (src/sun-priest.js) proved in Node, on src/light.js:
//   RADIANCE fills and drains at the design's rates; THE BEAM is a real light (lit, stopped, turned by a mirror, a plate powered, UP a
//   column); CONSECRATE, THE FLARE, SUNRISE and SUNFALL do what the card says at the price it says; the dark is a weakness, not a wall;
//   THE SKELETON KING: the beam chips him and never opens him, and the sun still does.
//   THE ROOMS HE SOLVES ALONE: every gallery of THE KING'S PYRAMID and chamber of THE SUN TEMPLE with his beam as the only light,
//   from every tile he can stand on, against the sun's own answer. Written to docs/sun-priest-rooms.md (a decision per room).
// usage: node tools/sun-priest.mjs
import { writeFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
install();
const { T } = await import('../src/level.js');
const { trace, solve, turnMirror, makeOpaque, visible } = await import('../src/light.js');
const S = await import('../src/sun-priest.js');
const { PRIEST, newPriest, beamOn, beamOff, lights, stepPriest, consecrate, sunfall, sunrise, flare, beamDamage, patchBurn, kingBeam, radMult, lit } = S;
const K_ = await import('../src/skeleton-king.js');
let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60, opaque = makeOpaque(T), near = (a, b, e) => Math.abs(a - b) <= e;

// a test room: 30 x 8, floor at row 7, walls at 0 and 29
const RW = 30, RH = 8, room = new Uint8Array(RW * RH); for (let x = 0; x < RW; x++) room[7 * RW + x] = T.SOLID; for (let y = 0; y < RH; y++) { room[y * RW] = T.SOLID; room[y * RW + RW - 1] = T.SOLID; }
const rAt = (x, y) => (x < 0 || y < 0 || x >= RW || y >= RH) ? T.SOLID : room[y * RW + x], ropts = { opaque, W: RW, H: RH };
const at = (tx, fy = 7) => newPriest(tx * 16 + 8, fy * 16);                         // a priest standing on the floor of tile column tx

log('RADIANCE');
{ const P = at(5); const L = { lit: new Set(['5,6']) }; let t = 0; while (P.rad < 1 && t < 20) { stepPriest(P, L, DT); t += DT; }
  ok(near(t, 6, 0.1), `standing in light fills him from empty in ${t.toFixed(2)} s (the design: ~6)`);
  const D = { lit: new Set() }; t = 0; while (P.rad > 0 && t < 40) { stepPriest(P, D, DT); t += DT; }
  ok(near(t, 20, 0.1), `the dark drains him from full in ${t.toFixed(2)} s (~20)`);
  P.rad = 0; const lo = radMult(P); P.rad = 1; const hi = radMult(P); P.rad = 0.5; const mid = radMult(P);
  ok(lo === 0.75 && hi === 1.15 && mid > lo && mid < hi, `his blows and beam: x${lo} empty, x${mid.toFixed(2)} half, x${hi} full`); }

log('THE BEAM: a real light');
{ const P = at(3); P.face = 1; beamOn(P); const M = [{ x: 20, y: 6, state: '/', turnable: true }], plate = { x: 20, y: 1 };
  const L = lights(rAt, [], M, [plate], ropts, P);
  ok(L.all.lit.has('10,6') && L.all.lit.has('19,6'), 'it lights the dark row in front of him');
  ok(L.all.hit.has(0) && L.all.lit.has('20,3'), 'the room\'s mirror turns it (E to N, up the column) onto a plate: powered');
  turnMirror(M[0]); const L2 = lights(rAt, [], M, [plate], ropts, P); ok(!L2.all.hit.size && !L2.all.lit.has('25,6'), 'turned the other way it goes down into the floor: the plate is dark, and nothing past the mirror is lit');
  ok(L.sun.lit.size === 0, 'and none of it is the SUN (the sun-only trace is empty in a dark room)');
  const W = at(3); W.face = 1; beamOn(W); room[6 * RW + 12] = T.SOLID; const L3 = lights(rAt, [], [], [], ropts, W); room[6 * RW + 12] = 0;
  ok(L3.all.lit.has('11,6') && !L3.all.lit.has('13,6'), 'it stops at the first wall');
  const U = at(8); beamOn(U, true); const L4 = lights(rAt, [], [], [], ropts, U); ok(L4.all.lit.has('8,1') && !L4.all.lit.has('9,6'), 'UP+beam: up the column, not along the row');
  const dead = { x: 15 * 16 + 8, y: 7 * 16, w: 12, h: 14, undead: true }, live = { ...dead, undead: false }; P.rad = 1;
  const dd = beamDamage(P, rAt, [], ropts, dead, 1), dl = beamDamage(P, rAt, [], ropts, live, 1);
  ok(near(dd, 22 * 1.15, 1e-9) && near(dl, 6 * 1.15, 1e-9), `a second of it at a full bar: ${dd.toFixed(1)} to the dead, ${dl.toFixed(1)} to the living (22 / 6 x1.15)`);
  beamOff(P); ok(beamDamage(P, rAt, [], ropts, dead, 1) === 0, 'let go of X and it is gone'); }

log('CONSECRATE, SUNFALL');
{ const P = at(10); P.rad = 0.3; ok(!consecrate(P) && P.patches.length === 0, 'with under a third of the bar it does nothing');
  P.rad = 0.5; ok(consecrate(P) && near(P.rad, 0.5 - 1 / 3, 1e-9), 'with a third it lays the patch and costs a third');
  const L = lights(rAt, [], [], [], ropts, P); ok(['9,6', '10,6', '11,6'].every(k => L.all.lit.has(k)) && !L.all.lit.has('12,6'), 'three tiles of light on the floor, lit (visible, doors see it, he fills on it)');
  ok(visible(L.all, 10, 6) && !visible(L.all, 14, 6), 'the dark round it can be seen, farther off it cannot');
  P.hp = 50; let t = 0; while (t < 1) { stepPriest(P, lights(rAt, [], [], [], ropts, P).all, DT); t += DT; } ok(near(P.hp, 54, 0.1), `standing in it mends him 4 a second (${(P.hp - 50).toFixed(1)} in 1 s)`);
  const dead = { x: 11 * 16 + 8, y: 7 * 16, w: 12, h: 14, undead: true };
  ok(near(patchBurn(P, dead, 1), 12, 1e-9) && patchBurn(P, { ...dead, undead: false }, 1) === 0 && patchBurn(P, { ...dead, x: 14 * 16 }, 1) === 0, 'it burns the dead on it 12 a second, not the living, not the dead beside it');
  while (t < 6.1) { stepPriest(P, { lit: new Set() }, DT); t += DT; } ok(P.patches.length === 0, 'and it is gone after 6 s');
  const Q = at(4); sunfall(Q); ok(Q.patches.length === 1 && Q.patches[0].x1 - Q.patches[0].x0 === 2, 'SUNFALL: the plunge lands in a patch of light (3 tiles here, the talent widens it)'); }

log('THE FLARE');
{ const P = at(10); P.rad = 0.4; ok(flare(P, [], () => {}) === null, 'under half a bar: nothing');
  P.rad = 1; const foes = [{ id: 'a', x: P.x + 40, winding: true }, { id: 'b', x: P.x - 60, winding: true }, { id: 'c', x: P.x + 20, winding: false }];
  const stopped = []; const r = flare(P, foes, f => stopped.push(f.id));
  ok(r.join() === 'a' && near(P.rad, 0.5, 1e-9), `it stops the wind-up in reach (2.5 tiles), not the one at ~4 tiles, not a foe not winding up; half the bar (${r.join()})`);
  P.rad = 1; for (let i = 0; i < 60 * 5; i++) stepPriest(P, { lit: new Set(['10,6']) }, DT); const again = flare(P, [{ id: 'a', x: P.x + 40, winding: true }, { id: 'd', x: P.x + 40, winding: true }], () => {});
  ok(again.join() === 'd', 'the same foe 5 s later is not stopped again (8 s), a new one is: no locking a boss');
  for (let i = 0; i < 60 * 4; i++) stepPriest(P, { lit: new Set(['10,6']) }, DT); P.rad = 1; ok(flare(P, [{ id: 'a', x: P.x + 40, winding: true }], () => {}).join() === 'a', 'and after 8 s it is');
  // on the desert bosses' engine: a flare in a tell cancels it
  const { makeBoss, bossStep, BOSSES } = await import('../src/desert-bosses.js'); const B = makeBoss(BOSSES.BANDIT_KING, P.x + 30); let told = false;
  for (let i = 0; i < 600 && !told; i++) told = bossStep(B, { px: P.x, trail: [P.x] }, DT).some(e => e.t === 'tell');
  P.rad = 1; P.locks.clear(); flare(P, [{ id: 'bk', x: B.x, winding: B.mode === 'tell' }], () => { B.mode = 'recover'; B.t = PRIEST.flare.dazzle; B.a = null; });
  let hit = false; for (let i = 0; i < 30; i++) hit = hit || bossStep(B, { px: P.x, trail: [P.x] }, DT).some(e => e.t === 'hit');
  ok(told && !hit, 'on a desert boss mid-tell: the attack never lands (it recovers, dazzled, 0.8 s)'); }

log('SUNRISE');
{ const P = at(3); P.rad = 0.99; ok(!sunrise(P), 'not until the bar is full'); P.rad = 1; ok(sunrise(P) && P.rad === 0, 'at full: the whole bar');
  const L = lights(rAt, [], [], [], ropts, P); ok(lit(L.all, [300, 310, 20, 30]) && !lit(L.sun, [300, 310, 20, 30]), 'the whole screen is in the light (and still none of it is the sun)');
  P.face = 1; beamOn(P); const dead = { x: 15 * 16 + 8, y: 7 * 16, w: 12, h: 14, undead: true }; ok(near(beamDamage(P, rAt, [], ropts, dead, 1), 22 * 0.75 * 2, 1e-9), 'his beam burns double');
  let t = 0; while (P.sunrise > 0) { stepPriest(P, lights(rAt, [], [], [], ropts, P).all, DT); t += DT; } ok(near(t, 6, 0.05), `for ${t.toFixed(2)} s`); }

log('THE DARK IS A WEAKNESS, NOT A WALL');
{ const P = at(10); P.face = 1; let t = 0; beamOn(P); while (P.rad < 1 / 3 && t < 10) { stepPriest(P, lights(rAt, [], [], [], ropts, P).all, DT); t += DT; }
  ok(t <= 2.1, `from an empty bar in a black room, holding his own beam (he stands in its light) earns a CONSECRATE in ${t.toFixed(2)} s`);
  beamOff(P); consecrate(P); let t2 = 0; while (P.patches.length && t2 < 7) { stepPriest(P, lights(rAt, [], [], [], ropts, P).all, DT); t2 += DT; }
  ok(P.rad > 0.9, `and standing in the patch it makes, the bar is at ${(P.rad * 100).toFixed(0)}% when it goes out (he climbs out of the dark by his own light)`);
  const Q = at(10); Q.rad = 1; let t3 = 0; while (Q.rad > 0) { stepPriest(Q, { lit: new Set() }, DT); t3 += DT; } ok(radMult(Q) === 0.75, `left in the dark, doing nothing, he is at x0.75 in ${t3.toFixed(0)} s: weaker, never helpless`); }

log('THE SKELETON KING: the beam chips him and never opens him');
{ const W = 40, H = 14, F = K_.KING.floor, g = new Uint8Array(W * H);
  for (let x = 0; x < W; x++) { g[x] = x === 20 ? 0 : T.SOLID; for (let y = F; y < H; y++) g[y * W + x] = T.SOLID; } for (let y = 0; y < F; y++) { g[y * W] = y === 5 ? 0 : T.SOLID; g[y * W + W - 1] = y === 5 ? 0 : T.SOLID; }
  const kAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x], kopts = { opaque, W, H };
  const run = (useAll, secs, setup) => {
    const K = K_.newKing(8 * 16), M = K_.ARENA_MIRRORS(), win = K_.ARENA_WINDOWS(), P = newPriest(26 * 16 + 8, F * 16); P.face = -1; P.rad = 1; beamOn(P);
    K.capstone = false; setup && setup(K, M, win); let opens = 0, chip = 0, hp0 = K.hp;
    for (let i = 0; i < secs * 60; i++) {
      const L = lights(kAt, K_.kingSources(K, win), M, [], kopts, P);
      for (const ev of K_.kingStep(K, { px: P.x, lightRes: useAll ? L.all : L.sun }, DT, S.lit)) if (ev.t === 'open') opens++;
      chip += kingBeam(K, P, kAt, M, kopts, DT, K_.kingHurt, K_.kingBox); P.rad = 1; K.x = Math.min(K.x, 20 * 16);   // keep him in the beam, at arm's length
    }
    return { opens, chip, lost: hp0 - K.hp, mode: K.mode };
  };
  const A = run(false, 20);
  ok(A.opens === 0 && A.chip > 0, `twenty seconds in his beam in the dark: opened ${A.opens} times, chipped ${A.chip.toFixed(0)} hp (x${K_.KING.armour} armour: ${(A.chip / 20).toFixed(1)} a second)`);
  const Bw = run(true, 5); ok(Bw.opens > 0, `(the wiring matters: handing kingStep the combined light would open him ${Bw.opens} times in 5 s. lights().sun, never .all)`);
  const C = run(false, 5, (K, M, win) => { win[0].open = true; M[1].state = '\\'; K.x = 6 * 16 + 8; });
  ok(C.opens > 0, `and the SUN still opens him (the west window through the west mirror onto him: ${C.opens})`); }

log('THE ROOMS HE SOLVES ALONE');
const standTiles = (at, x0, x1, y0, y1) => { const out = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = at(x, y), b = at(x, y + 1); if (!opaque(t) && t !== T.ONEWAY && t !== T.PLANK && (opaque(b) || b === T.ONEWAY || b === T.PLANK)) out.push([x, y]); } return out; };
function priestBest(at, opts, tiles, mirrors, plate) {
  let best = null;
  for (const [x, y] of tiles) for (const dir of ['E', 'W', 'N']) { const s = solve(at, [{ x, y, dir }], mirrors, [plate], opts); if (s && (!best || s.turns < best.turns)) best = { turns: s.turns, x, y, dir }; }
  return best;
}
const rows = []; let zero = 0, fewer = 0, total = 0;
{ const D = await import('../src/draft/kings-pyramid.js'), L = D.build(T), at = (x, y) => (x < 0 || x >= L.W) ? T.SOLID : (y < 0 || y >= L.H) ? T.AIR : L.grid[y * L.W + x], opts = { opaque, W: L.W, H: L.H };
  for (const g of L.galleries) {
    const sun = solve(at, g.ports, g.mirrors, [g.plate], opts), tiles = standTiles(at, 3, L.W - 4, g.f - 8, g.f - 1), me = priestBest(at, opts, tiles, g.mirrors, g.plate);
    total++; if (me && me.turns === 0) zero++; if (me && sun && me.turns < sun.turns) fewer++;
    rows.push(['King\'s Pyramid', `gallery ${g.k + 1}`, sun ? sun.turns : '-', me ? me.turns : 'never', me ? `${me.dir === 'N' ? 'UP' : me.dir} from (${me.x},${me.y - g.f + 1})` : '']); } }
{ const D = await import('../src/draft/sun-temple.js'), L = D.build(T), at = (x, y) => (x < 0 || x >= L.W) ? T.SOLID : (y < 0 || y >= L.H) ? T.AIR : L.grid[y * L.W + x], opts = { opaque, W: L.W, H: L.H }, CW = L.rooms[1].cx - L.rooms[0].cx;
  for (const r of L.rooms) {
    const hours = r.win.map(src => solve(at, [src], r.mirrors, [r.plate], opts)).filter(Boolean), sun = hours.length ? hours.reduce((a, b) => a.turns <= b.turns ? a : b) : null;
    const tiles = standTiles(at, r.cx, r.cx + CW - 2, r.win[0].y + 1, r.plate.y + 3), me = priestBest(at, opts, tiles, r.mirrors, r.plate);
    total++; if (me && me.turns === 0) zero++; if (me && sun && me.turns < sun.turns) fewer++;
    rows.push(['Sun Temple', `chamber ${r.k + 1}`, sun ? sun.turns : '-', me ? me.turns : 'never', me ? `${me.dir === 'N' ? 'UP' : me.dir} from (${me.x - r.cx},${me.y})` : '']); } }
log(rows.map(r => `    ${r[0].padEnd(15)} ${r[1].padEnd(11)} sun ${String(r[2]).padEnd(2)} priest ${String(r[3]).padEnd(5)} ${r[4]}`).join('\n'));
ok(rows.length === 35, `all ${rows.length} rooms measured (21 galleries, 14 chambers)`);
log(`    => he opens ${zero} of ${total} with NO turn at all, and ${fewer} with fewer turns than the sun needs`);
{ /* THE RULE (Daniel, 2026-09-21): doors answer to the sun. Every room again with his beam from every tile and every direction, doors
     read through doorsLit (the sun's receivers): none opens, and the sun still opens each one */
  const P = newPriest(0, 0); let opened = 0, sunOpens = 0;
  for (const [lvl, D0] of [['kp', await import('../src/draft/kings-pyramid.js')], ['st', await import('../src/draft/sun-temple.js')]]) { const L = D0.build(T), at = (x, y) => (x < 0 || x >= L.W) ? T.SOLID : (y < 0 || y >= L.H) ? T.AIR : L.grid[y * L.W + x], opts = { opaque, W: L.W, H: L.H };
    for (const r of (L.galleries || L.rooms)) { const plate = r.plate, mirrors = r.mirrors, suns = r.ports || r.win, box = r.ports ? [3, L.W - 4, r.f - 8, r.f - 1] : [r.cx, r.cx + (L.rooms[1].cx - L.rooms[0].cx) - 2, r.win[0].y + 1, plate.y + 3];
      if (solve(at, r.ports ? suns : [suns[0]], mirrors, [plate], opts) || (!r.ports && suns.some(src => solve(at, [src], mirrors, [plate], opts)))) sunOpens++;
      for (const [x, y] of standTiles(at, ...box)) for (const up of [false, true]) for (const face of [1, -1]) { P.x = x * 16 + 8; P.y = (y + 1) * 16; P.face = face; beamOn(P, up);
        if (S.doorsLit(lights(at, [], mirrors, [plate], opts, P)).size) opened++; } } }
  ok(opened === 0 && sunOpens === 35, `THE RULE: sun-doors answer to the sun. His beam, from every tile, either way and UP, opens ${opened} of 35 rooms; the sun still opens all ${sunOpens}`); }
writeFileSync(new URL('../docs/sun-priest-rooms.md', import.meta.url), `# The rooms the Sun Priest solves alone (\`node tools/sun-priest.mjs\`)

His beam powers sun-doors (docs/sun-priest-design.md), so in the two light levels some rooms are his without the sun. This is the
table the class batch decides from, room by room ("a Priest shortcut is fine if the room still says what it says"). **sun** = the
fewest mirror turns that open it with the sun (the best hour, in the temple); **priest** = the fewest with his beam alone, from the
best tile he can stand on, and where (E/W along the row, UP the column; the pyramid's y is rows above the gallery floor, the
temple's is the tile row).

**If his beam powered the doors, he would open ${zero} of ${total} with no turn at all, and ${fewer} with fewer turns than the sun.** Decided (Daniel, 2026-09-21): **sun-doors and plates answer to the sun only** (doorsLit), so the table below is the case against it, kept for the record.
${zero > total / 2 ? `
**So as designed, his beam skips the arc's light puzzles.** A mirror always turns a beam 90 degrees, and he can come at it from
any side (UP from under it, or along its row from a ledge), so whatever state a mirror is in, some line of his reaches the plate.
The rule taken: **sun-doors and plates answer to the SUN only** (\`lights().sun.hit\`, the same rule as the Skeleton King). His beam
still lights the dark, burns the dead, shows the way and chips the King: it is his answer to the DARK, not to the puzzles.
(Alternatives: a few "priest rooms" per level where his beam is the intended key, or plates that need the sun AND his beam.)
` : ''}
| level | room | sun | priest | from |
|---|---|---|---|---|
${rows.map(r => `| ${r.join(' | ')} |`).join('\n')}

Levers if a room is too easy for him: move its plate off every row and column he can stand in line with; hang a pillar across his
line (the temple's chamber 6 does this to the sun already); or make the door a SUN-door proper (it answers to \`lights().sun\` only,
like the Skeleton King). The last is a one-word change per door and keeps the puzzle whole for everyone.
`);
log('  wrote docs/sun-priest-rooms.md');
log(fails ? `\n${fails} FAILED` : '\nall Sun Priest checks pass'); process.exit(fails ? 1 : 0);
