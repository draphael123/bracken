// tools/light.mjs — sunlight as a mechanic (src/light.js), proved on small rooms before the Sun Temple, the King's Pyramid or the
// Skeleton King lean on it. usage: node tools/light.mjs     exit 1 on any failure
import { T } from '../src/level.js';
import { isSlope } from '../src/slopes.js';
import { trace, turnMirror, reflect, litAt, litBox, burn, visible, solve, makeOpaque, templeSun, LIGHT } from '../src/light.js';
let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const opaque = makeOpaque(T, isSlope);
/* a room from rows of text: # rock, . air, / and \ mirrors (turnable), S a sun shaft pointing down, R a receiver (a sun-door) */
function room(rows) { const H = rows.length, W = rows[0].length, g = new Uint8Array(W * H), mirrors = [], sources = [], receivers = [];
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '#') g[y * W + x] = T.SOLID; if (ch === '/' || ch === '\\' || ch === 'b') mirrors.push({ x, y, state: ch === 'b' ? '\\' : ch, turnable: true });   /* 'b' = a backslash mirror: a backslash in a test row is an escape waiting to happen (it ate two mirrors once) */
    if (ch === 'S') sources.push({ x, y, dir: 'S' }); if (ch === 'R') receivers.push({ x, y }); }));
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x];
  return { W, H, g, tileAt, mirrors, sources, receivers, opts: { opaque, W, H } }; }

log('BEAMS');
{ const Rm = room(['#S#####', '#.....#', '#.....#', '#######']); const r = trace(Rm.tileAt, Rm.sources, [], [], Rm.opts);
  ok(litAt(r, 1, 1) && litAt(r, 1, 2) && !litAt(r, 2, 2) && r.segs.length === 1, 'a shaft lights straight down its column to the floor, and nothing beside it'); }
{ const Rm = room(['#S#####', '#.....#', '#\\...R#', '#######']); const r = trace(Rm.tileAt, Rm.sources, Rm.mirrors, Rm.receivers, Rm.opts);
  ok(r.hit.has(0) && litAt(r, 3, 2) && r.segs.length === 2, 'a mirror turns it along the room to a sun-door, and the door takes it'); }
{ const Rm = room(['#S#####', '#.....#', '#\\.#.R#', '#######']); const r = trace(Rm.tileAt, Rm.sources, Rm.mirrors, Rm.receivers, Rm.opts);
  ok(!r.hit.has(0) && !litAt(r, 4, 2), 'rock stops it: a beam never passes through a wall'); }
{ const Rm = room(['########', '#S.....#', '#\\....//', '#......#', '#/....\\#', '########']); Rm.sources[0].dir = 'S';
  const r = trace(Rm.tileAt, [{ x: 1, y: 1, dir: 'S' }], [{ x: 1, y: 2, state: '\\' }, { x: 6, y: 2, state: '\\' }, { x: 6, y: 4, state: '/' }, { x: 1, y: 4, state: '/' }], [], Rm.opts);
  ok(r.steps < 200, `four mirrors in a square make a loop: the trace stops after ${r.steps} steps instead of running forever`); }
ok(reflect('/', 'E') === 'N' && reflect('/', 'S') === 'W' && reflect('\\', 'E') === 'S' && reflect('\\', 'N') === 'W', "the mirrors turn the way they look: '/' sends a rightward beam up, '\\' sends it down");
{ const Rm = room(['#S#####', '#.....#', '#\\....#', '#######']); const r = trace(Rm.tileAt, Rm.sources, Rm.mirrors, [], Rm.opts);
  ok(visible(r, 4, 2) && visible(r, 4, 1) && !visible(r, 4, 0) && !visible({ lit: new Set() }, 3, 3) && visible({ lit: new Set() }, 3, 3, [{ x: 3, y: 3, r: 2 }]),
    'THE DARK: a lit tile and a tile of glow beside it can be seen, two tiles off it is black; an unlit room is black except round a carried light'); }

log('SUNLIGHT BURNS THE DEAD');
{ const Rm = room(['#S#####', '#.....#', '#\\....#', '#######']); const r = trace(Rm.tileAt, Rm.sources, Rm.mirrors, [], Rm.opts);
  const mummyIn = { x: 4 * 16 + 8, y: 3 * 16, w: 10, h: 14, undead: true }, mummyOut = { x: 4 * 16 + 8, y: 2 * 16, w: 10, h: 12, undead: true }, knight = { ...mummyIn, undead: false };
  let a = 0, b = 0, k = 0; for (let i = 0; i < 60; i++) { a += burn(r, mummyIn, 1 / 60); b += burn(r, mummyOut, 1 / 60); k += burn(r, knight, 1 / 60); }
  ok(Math.abs(a - LIGHT.burnDps) < 0.01 && b === 0 && k === 0, `a mummy standing in the beam burns ${a.toFixed(0)} a second; one a row above it, nothing; the knight in it, nothing`); }

log('MIRROR ROOMS (the puzzle check the level tools will use)');
{ /* THE GALLERY ROOM: a shaft, three mirrors, a sun-door. As built the first two mirrors throw the beam into the walls; the right
     turns carry it down, along, down and along to the door. (A second door on the same single beam can never be lit: a door takes
     the beam, so one beam opens one door - the check must say that room cannot be solved.) */
  const rows = [
    '##S#########',
    '#..........#',
    '#./..../...#',
    '#..........#',
    '#......b..R#',
    '#...R......#',
    '############'];
  const Rm = room(rows), doorA = [Rm.receivers.find(r => r.y === 4)], both = Rm.receivers;
  const before = trace(Rm.tileAt, Rm.sources, Rm.mirrors, doorA, Rm.opts), s2 = solve(Rm.tileAt, Rm.sources, Rm.mirrors, doorA, Rm.opts);
  ok(before.hit.size === 0 && s2 && s2.turns === 2, `one shaft, three mirrors, one door: shut as built, opened in ${s2?.turns} turns of ${JSON.stringify(s2?.turn)}`);
  ok(solve(Rm.tileAt, Rm.sources, Rm.mirrors, both, Rm.opts) === null, 'the same room with a second door on the one beam: the check says it cannot be solved'); }
{ /* two shafts, two doors, three mirrors (one of them a red herring off both beams): both beams must be routed */
  const Rm = room([
    '#S######S####',
    '#...........#',
    '#/...R......#',
    '#...........#',
    '#..R....b...#',
    '#...........#',
    '#........../#',
    '#############']);
  const s = solve(Rm.tileAt, Rm.sources, Rm.mirrors, Rm.receivers, Rm.opts), t0 = trace(Rm.tileAt, Rm.sources, Rm.mirrors, Rm.receivers, Rm.opts);
  ok(t0.hit.size === 0 && s && s.turns === 2, `two shafts, two doors, ${Rm.mirrors.length} mirrors: ${t0.hit.size} door(s) lit as built; the fewest turns that open both: ${s ? s.turns : '-'} (the third mirror is not one of them)`);
  if (s) { for (const [x, y] of s.turn) turnMirror(Rm.mirrors.find(m => m.x === x && m.y === y)); ok(trace(Rm.tileAt, Rm.sources, Rm.mirrors, Rm.receivers, Rm.opts).hit.size === 2, 'turning exactly those mirrors lights both doors'); } }

log('THE SUN TEMPLE: THE SUN MOVES');
{ const windows = [0, 1, 2, 3, 4].map(i => ({ x: 2 + i * 3, y: 0, dir: 'S' })); const seen = new Set(); let night = 0;
  for (let t = -5; t < 65; t += 0.5) { const s = templeSun(windows, t, 60); if (s) seen.add(s.x); else night++; }
  ok(seen.size === 5 && night > 0, `over a 60 s day the sun comes through all ${seen.size} windows in turn, and then it is dark`); }

console.log(fails ? `\nlight: ${fails} FAILED` : '\nlight: all passed');
process.exit(fails ? 1 : 0);
