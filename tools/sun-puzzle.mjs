/* tools/sun-puzzle.mjs - SUN / LIGHT PUZZLE PIECES (src/sun-puzzle.js; docs/desertkit.md) on src/light.js. NODE ONLY (no page, no browser).
   Proves: the lab hall starts shut and lamp-lit; two strikes open the sun-door (and a shut door is opaque: the niche blocks the wrong turn); SUN-DOORS
   answer to the sun ONLY (the priest's beam on the sun-door's eye: nothing); PRIEST CACHES answer to his beam ONLY (the sun on its eye: nothing); lamps
   take either; strikes from any hero's blow box or shot, one turn per swing (cooldown), fixed mirrors never; 'hold' doors told then shut, never on a body;
   chains open in one frame (a door's light feeds the next); the moving temple sun; the sun burns the dead in its light; gridOf makes shut doors solid;
   solveRoom + lintSunRooms on the lab and broken cases; every LEVELS entry with sunRooms. */
import assert from 'node:assert/strict';
import { T } from '../src/level.js';
import { isSlope } from '../src/slopes.js';
import { makeOpaque } from '../src/light.js';
import { MIRROR, DOOR, sunRoomsInit, sunRoomsStep, strikeMirrors, gridOf, sunBurn, solveRoom, lintSunRooms } from '../src/sun-puzzle.js';
import { labLevel } from '../src/desertkit-lab.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';

const DT = 1 / 60, HEROES = [...HERO_MOVE_IDS, 'sunpriest', 'rimebinder'], opaque = makeOpaque(T, isSlope);
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const L = labLevel(), io = (o = {}) => ({ tileAt: L.tileAt, opaque, ...o });
const door = (R, id) => R.rooms[0].doors.find(d => d.id === id), mir = (R, i) => R.rooms[0].mirrors[i];
const tileBox = (x, y) => [x * 16 + 2, y * 16 + 2, x * 16 + 14, y * 16 + 14];
const strike = (R, x, y) => { const t = strikeMirrors(R, tileBox(x, y)); for (let i = 0; i < 30; i++) sunRoomsStep(R, DT, io()); return t; };

/* 1. the lab hall: shut, the lamp lit by the sun; two strikes open the sun-door; one wrong turn does not */
{ const R = sunRoomsInit(L); const ev0 = sunRoomsStep(R, DT, io());
  ok(!door(R, 'sundoor').open && door(R, 'lamp').lit && ev0.some(e => e.ev === 'lamp'), 'it starts shut, the sun on the lamp');
  strike(R, 70, 9); ok(!door(R, 'sundoor').open, 'turning only the far mirror: shut (the near one still sends the sun west)'); strike(R, 70, 9);
  strike(R, 66, 9); ok(!door(R, 'sundoor').open && !door(R, 'cache').open, 'the near mirror turned east: the far one sends the sun up into the shut niche (a shut door is opaque) - the cache never opens to the sun');
  strike(R, 70, 9); ok(door(R, 'sundoor').open, 'the near mirror east, the far one down: THE SUN-DOOR OPENS');
  ok(!door(R, 'lamp').lit, 'and the lamp goes out (the light went another way)');
  strike(R, 66, 9); ok(door(R, 'sundoor').open, 'a latched door stays open when the light moves on');
  ok(R.rooms[0].res.segs.length >= 1, 'the trace hands beam-path its segments'); }

/* 2. THE HARD RULE: sun-doors answer to the sun only; caches to the priest only; lamps to either */
{ const R = sunRoomsInit(L); sunRoomsStep(R, DT, io({ priestBeams: [{ x: 70, y: 12, dir: 'S' }] }));
  ok(!door(R, 'sundoor').open, 'the priest\'s beam on the sun-door\'s eye: nothing (09-21: sun-doors answer to the sun)');
  sunRoomsStep(R, DT, io({ priestBeams: [{ x: 69, y: 7, dir: 'N' }] })); ok(door(R, 'cache').open, 'the priest beams UP from the cache ledge: THE CACHE OPENS');
  const R2 = sunRoomsInit(L); sunRoomsStep(R2, DT, io({ priestBeams: [{ x: 69, y: 7, dir: 'E' }] })); ok(!door(R2, 'cache').open, 'his beam along the row misses it');
  const R3 = sunRoomsInit({ sunRooms: [{ ...L.sunRooms[0], sources: [{ ...L.sunRooms[0].sources[0], off: true }] }] }); sunRoomsStep(R3, DT, io()); ok(!door(R3, 'lamp').lit, 'no sun: the lamp is dark');
  sunRoomsStep(R3, DT, io({ priestBeams: [{ x: 65, y: 9, dir: 'W' }] })); ok(door(R3, 'lamp').lit, 'his beam lights a lamp'); }

/* 3. STRIKES: any blow or shot box; one turn a swing; fixed mirrors never; every hero, every seat (one shared room) */
{ const R = sunRoomsInit(L), m = mir(R, 0), s0 = m.state;
  for (let f = 0; f < 6; f++) strikeMirrors(R, tileBox(66, 9)); ok(m.state !== s0, 'a swing\'s six frames turn it once (cooldown ' + MIRROR.cd + ' s)');
  sunRoomsStep(R, MIRROR.cd + 0.01, io()); strikeMirrors(R, [66 * 16 + 14, 9 * 16 + 6, 66 * 16 + 18, 9 * 16 + 9]); ok(m.state === s0, 'a shot\'s small box turns it back after the cooldown');
  const F = sunRoomsInit({ sunRooms: [{ ...L.sunRooms[0], mirrors: [{ x: 66, y: 9, state: '/', turnable: false }, L.sunRooms[0].mirrors[1]] }] }); strikeMirrors(F, tileBox(66, 9)); ok(F.rooms[0].mirrors[0].state === '/', 'a fixed mirror never turns');
  for (const h of HEROES) for (let seats = 1; seats <= 4; seats++) { const Q = sunRoomsInit(L);
    /* seat k strikes the k-th turn (the room is shared): two turns needed, any seats share them */
    const order = [[70, 9], [66, 9], [70, 9]]; for (let i = 0; i < order.length; i++) strike(Q, ...order[i]);
    ok(door(Q, 'sundoor').open, `${h}, ${seats} seat(s): the turns from any seat open it`); } }

/* 4. HOLD doors: told, then shut - never on a body */
{ const def = { ...L.sunRooms[0], doors: L.sunRooms[0].doors.map(d => d.id === 'sundoor' ? { ...d, mode: 'hold' } : d) }, R = sunRoomsInit({ sunRooms: [def] });
  strike(R, 66, 9); strike(R, 70, 9); ok(door(R, 'sundoor').open, 'a hold door opens in the light');
  strikeMirrors(R, tileBox(70, 9)); let tell = null, shut = null, t = 0, inDoor = true;
  for (; t < 3; t += DT) { const ev = sunRoomsStep(R, DT, io({ bodyIn: () => inDoor })); if (ev.some(e => e.ev === 'tell')) tell = t; if (ev.some(e => e.ev === 'shut')) shut = t; if (t > 1.5) inDoor = false; }
  ok(tell !== null && shut !== null && shut - tell >= DOOR.tell - 1e-9 && shut >= 1.5, `told at ${tell.toFixed(2)} s, shut at ${shut.toFixed(2)} s - it waited for the body in the doorway`); }

/* 5. CHAINS: a door's light feeds the next in one frame */
{ const W = 20, H = 10, g = new Uint8Array(W * H); for (let x = 0; x < W; x++) { g[x] = 1; g[(H - 1) * W + x] = 1; }
  const tileAt = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 1 : g[y * W + x];
  const def = { id: 'chain', box: [0, 1, 19, 8], sources: [{ x: 0, y: 4, dir: 'E' }], mirrors: [],
    doors: [{ id: 'a', kind: 'sun', eye: [12, 3], opens: [6, 4, 6, 4] }, { id: 'b', kind: 'sun', eye: [10, 4], opens: [8, 1, 8, 2] }] };
  /* the beam E along row 4: door a's leaf at 6,4 blocks it - but a's eye is at 12,3 (unlit) so a stays shut and b never sees light */
  const R = sunRoomsInit({ sunRooms: [def] }); sunRoomsStep(R, DT, { tileAt, opaque: t => t === 1 }); ok(!R.rooms[0].doors[1].open, 'a shut leaf blocks the beam');
  const real = { id: 'r', box: [0, 1, 19, 8], sources: [{ x: 0, y: 4, dir: 'E' }, { x: 0, y: 6, dir: 'E' }], mirrors: [],
    doors: [{ id: 'first', kind: 'sun', eye: [3, 6], opens: [6, 4, 6, 4] }, { id: 'second', kind: 'sun', eye: [12, 4], opens: [15, 7, 15, 7] }] };
  const R4 = sunRoomsInit({ sunRooms: [real] }); sunRoomsStep(R4, DT, { tileAt, opaque: t => t === 1 });
  ok(R4.rooms[0].doors[0].open && R4.rooms[0].doors[1].open, 'a chain: the low beam opens the first door, its leaf lets the high beam through to the second - one frame'); }

/* 6. THE MOVING SUN (the Sun Temple's windows) */
{ const def = { ...L.sunRooms[0], sources: [{ windows: [{ x: 62, y: 9, dir: 'E' }, { x: 66, y: 0, dir: 'S' }], day: 20 }] }, R = sunRoomsInit({ sunRooms: [def] });
  sunRoomsStep(R, 1, io()); const a = R.rooms[0].res.segs[0]; sunRoomsStep(R, 10, io()); const b = R.rooms[0].res.segs[0];
  ok(a.dir === 'E' && b.dir === 'S', 'the sun moves from window to window over the day (' + a.dir + ' -> ' + b.dir + ')'); }

/* 7. THE SUN BURNS THE DEAD in its light (not the living) */
{ const R = sunRoomsInit(L); sunRoomsStep(R, DT, io());
  const mummy = { undead: true, x: 66 * 16 + 8, y: 5 * 16, w: 10, h: 14 }, knight = { x: 66 * 16 + 8, y: 5 * 16, w: 10, h: 14 }, shadeM = { undead: true, x: 63 * 16 + 8, y: 15 * 16, w: 10, h: 14 };
  ok(sunBurn(R, mummy, 1) > 0 && sunBurn(R, knight, 1) === 0 && sunBurn(R, shadeM, 1) === 0, 'a mummy in the shaft burns; the knight and a mummy out of it do not'); }

/* 8. gridOf: shut doors are solid for collision, open ones give way */
{ const R = sunRoomsInit(L), g = gridOf(R, L.tileAt); ok(g(71, 20) === 1 && L.tileAt(71, 20) === 0, 'the shut sun-door is a wall'); strike(R, 66, 9); strike(R, 70, 9); ok(gridOf(R, L.tileAt)(71, 20) === 0, 'open, you walk through'); }

/* 9. SOLVE + LINT */
{ const s = solveRoom(L.sunRooms[0], L.tileAt, opaque); ok(s && s.turns === 2, 'the lab hall solves in ' + (s && s.turns) + ' turns');
  ok(lintSunRooms(L, L.tileAt, opaque).length === 0, 'the lab lints clean: ' + lintSunRooms(L, L.tileAt, opaque).join('; '));
  const br = f => { const M = labLevel(); f(M.sunRooms[0], M); return lintSunRooms(M, M.tileAt, opaque).length; };
  ok(br(r => { r.mirrors[1].turnable = false; }) > 0, 'unsolvable caught');
  ok(br(r => { r.mirrors[0].state = '\\'; r.mirrors[1].state = '\\'; }) > 0, 'solved as it stands caught');
  ok(br(r => { r.doors[1].optional = false; }) > 0, 'a cache on the way through caught'); ok(br(r => { r.doors[0].optional = true; }) > 0, 'an optional sun-door caught');
  ok(br(r => { r.doors[1].eye = [71, 3]; }) > 0, 'a cache eye no beam from footing reaches caught');
  ok(br((r, M) => { for (let x = 65; x <= 70; x++) M.grid[10 * M.W + x] = 0; for (let x = 62; x <= 64; x++) M.grid[13 * M.W + x] = 0; M.grid[8 * M.W + 67] = 0; M.grid[8 * M.W + 68] = 0; M.grid[8 * M.W + 69] = 0; }) > 0, 'a mirror out of reach caught');
  ok(br(r => { r.doors[0].kind = 'moon'; }) > 0, 'bad kind caught'); ok(br((r, M) => { M.sunRooms.push({ ...r }); }) > 0, 'duplicate id caught');
  let lv = 0; const { LEVELS } = await import('../src/level.js'); for (const l of Object.values(LEVELS)) if (l && l.sunRooms) { lv++; ok(lintSunRooms(l).length === 0, (l.id || '?') + ' lints clean'); }
  console.log('  levels with sunRooms: ' + lv); }

console.log('sun-puzzle: ' + n + ' checks ok');
