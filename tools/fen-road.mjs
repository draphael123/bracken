// tools/fen-road.mjs - THE FEN ROAD, its beats pinned (claude/fenroad; src/fen-road.js, src/fen-road-hands.js, src/stilt-walker.js). Node only, a few seconds.
//   A. the road: marsh -> fenroad -> stockade (needs, act I list, TIER between them), its sections, its shrines (one closing each area + one before the boss)
//   B. THE VERB: every bowed section on the route has its lashing (but the stilt-post steps and the crossing's rotten ones), THE BARRICADE stands on one and
//      is the only way on (a flood with it shut does not reach the crossing; with it gone it does), and the hands work it: weight bows -> it goes under after
//      its hold, a goblin does not bow it, a struck lashing drops it at once with its load, it floats back, the footing is kept on sound boards only
//   C. the crew gaps: piles every hero hops (no gap of open water over 3 columns), each with its layer, and the hands lay the road toward you while he works
//   D. THE STILT-WALKER: a general foe - his told jab (high: a duck goes under its box, a block turns it), a low blow cuts a stilt and he topples, his horn
//      sounds only after its told draw; the first horn lookout stands on dry ground and calls sprigs only (the horn taught warm)
//   E. THE TROLL'S CROSSING: three rotten sections, each on an island the rip leaves, every ripped stretch a jump for every hero
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { ACTS } from '../src/foe-react.js';
import { floodReach } from '../src/reachcore.js';
import { SECTIONS, ARENA, ROAD } from '../src/fen-road.js';
import { makeFenRoadHands, SAG } from '../src/fen-road-hands.js';
import * as SW from '../src/stilt-walker.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'fenroad'), L = lv.build(), W = L.W, at = (x, y) => L.grid[y * W + x];
// ---- A
ok(lv.needs === 'marsh' && LEVELS.find(l => l.id === 'stockade').needs === 'fenroad', 'the road: marsh -> fenroad -> stockade');
const act1 = ACTS[0].levels; ok(act1.indexOf('marsh') < act1.indexOf('fenroad') && act1.indexOf('fenroad') < act1.indexOf('stockade'), 'act I lists it between the marsh and the stockade');
ok(SECTIONS[0][1] === 0 && SECTIONS.at(-1)[2] === W - 1 && SECTIONS.every((s, i) => !i || s[1] === SECTIONS[i - 1][2] + 1), 'the named areas cover the road end to end');
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(checks.length === SECTIONS.length - 1, 'a shrine per area (' + checks.length + ')');
SECTIONS.slice(0, -1).forEach(([nm, x0, x1], i) => ok(checks[i] >= x0 && checks[i] <= x1 + 2 && x1 - checks[i] < 12, 'the shrine closes ' + nm + ' (' + checks[i] + ')'));
ok(checks.at(-1) < ARENA.gate && ARENA.gate - checks.at(-1) < 10, 'the last shrine stands before the crossing');
// ---- B
const sags = L.ents.filter(e => e.t === 'sag'), lashes = L.ents.filter(e => e.t === 'lashing');
for (const id of ['b', 'e', 'f', 'i', 'j']) { const s = sags.find(q => q.id === id);   /* the crews' sections and the barricade's: each lashed at its near end (the first bowed boards, a, teach the bow alone) */
  ok(s && lashes.some(l => l.sag === s.id && l.x < s.x && s.x - l.x <= 4), 'the bowed section ' + id + ' has its lashing at its near end'); }
ok(sags.filter(s => !s.arena).length >= 10 && lashes.length >= 4, 'the verb is everywhere: ' + sags.length + ' bowed sections, ' + lashes.length + ' lashings');
const bar = sags.find(s => s.load && s.load.length); ok(bar && bar.load.every(([x, y]) => at(x, y) === T.SOLID) && bar.load.filter(([x]) => x === bar.load[0][0]).length >= 4, 'THE BARRICADE: four crates high on its bowed section (no jump clears 64 px)');
{ const R = floodReach(L, T); const arenaIn = [...R.seen].some(k => +k.split(',')[0] > ARENA.trigger);
  const g2 = L.grid.slice(); for (const [x, y] of bar.load) g2[y * W + x] = T.AIR; const R2 = floodReach({ ...L, grid: g2 }, T); const arenaIn2 = [...R2.seen].some(k => +k.split(',')[0] > ARENA.trigger);
  ok(!arenaIn && arenaIn2, 'the barricade is THE REQUIRED USE: shut, the crossing is not reached (' + arenaIn + '); dropped, it is (' + arenaIn2 + ')'); }
// the hands, on a fake world
const mkWorld = () => { const grid = L.grid.slice(), Lw = { ...L, grid }, players = [], enemies = [], log = [];
  const ctx = { L: Lw, TS, T, sfx: {}, players: () => players, enemies: () => enemies, time: () => 0, VW: () => 640, number: (x, y, t) => log.push(t), burst: () => {}, dust: () => {}, shake: () => {}, hint: m => log.push('hint ' + m),
    cellSet: (x, y, t) => { grid[y * W + x] = t; }, tileAt: (x, y) => grid[y * W + x], solidAt: (x, y) => [T.SOLID, T.CRATE].includes(grid[y * W + x]) };
  const H = makeFenRoadHands(ctx); H.reset(); return { H, grid, players, enemies, log, Lw }; };
{ const w = mkWorld(), s = sags.find(q => q.id === 'a'), P = { x: (s.x + 1) * TS + 8, y: ROAD * TS, ground: true, dead: false }; w.players.push(P);
  for (let f = 0; f < 30; f++) w.H.update(1 / 60); ok(w.H.sag('a').st === 'bow' && w.log.some(t => /BOW/.test(t)), 'a hero\'s weight bows it (told: ' + w.log[0] + ')');
  for (let f = 0; f < 60 * SAG.hold; f++) w.H.update(1 / 60); ok(w.H.sag('a').st === 'under' && w.grid[ROAD * W + s.x] === T.AIR && !P.ground, 'held past its hold it goes under, and the hero with it');
  P.y = 22 * TS; P.ground = false; for (let f = 0; f < 60 * (SAG.under + 0.2); f++) w.H.update(1 / 60); P.y = 30 * TS; for (let f = 0; f < 30; f++) w.H.update(1 / 60);
  ok(w.H.sag('a').st === 'up' && w.grid[ROAD * W + s.x] === T.PLANK, 'it floats back'); }
{ const w = mkWorld(), s = sags.find(q => q.id === 'b'); w.enemies.push({ alive: true, x: (s.x + 1) * TS + 8, y: ROAD * TS });
  for (let f = 0; f < 200; f++) w.H.update(1 / 60); ok(w.H.sag('b').st === 'up', 'a goblin is too light to bow it');
  const l = lashes.find(q => q.sag === 'b'); w.H.strike({ l: l.x * TS, r: l.x * TS + 16, t: ROAD * TS - 16, b: ROAD * TS });
  ok(w.H.sag('b').st === 'under' && w.grid[ROAD * W + s.x] === T.AIR && w.log.includes('THE LASHING PARTS'), 'a struck lashing drops it at once (told)'); }
{ const w = mkWorld(), l = lashes.find(q => q.sag === bar.id); w.H.strike({ l: l.x * TS, r: l.x * TS + 16, t: ROAD * TS - 16, b: ROAD * TS });
  ok(bar.load.every(([x, y]) => w.grid[y * W + x] === T.AIR) && w.H.sag(bar.id).loadGone, 'the barricade goes under with its section, for good');
  for (let f = 0; f < 60 * (SAG.under + 1); f++) w.H.update(1 / 60); ok(w.H.sag(bar.id).st === 'up' && bar.load.every(([x, y]) => w.grid[y * W + x] === T.AIR), 'the section floats back; the barricade does not'); }
{ const w = mkWorld(), s = sags.find(q => q.id === 'c'), P = { x: (s.x - 2) * TS + 8, y: ROAD * TS, ground: true, dead: false }; w.players.push(P); w.H.update(1 / 60);
  ok(P.safe && Math.floor(P.safe.x / TS) === s.x - 2, 'the footing is kept on a sound board');
  P.x = (s.x + 1) * TS + 8; w.H.update(1 / 60); ok(Math.floor(P.safe.x / TS) === s.x - 2, 'never on a bowed one'); }
// ---- C
const gaps = L.ents.filter(e => e.t === 'crewgap');
ok(gaps.length >= 3, gaps.length + ' crew gaps');
for (const g of gaps) { const feet = [g.x - 1, ...g.piles, g.x + g.w].sort((a, b) => a - b); for (let i = 1; i < feet.length; i++) ok(feet[i] - feet[i - 1] - 1 <= 3, 'crew gap ' + g.id + ': no hop over 3 columns of water (' + feet.join(',') + ')');
  ok(L.ents.some(e => e.layer === g.id && e.x > g.x + g.w - 1 && e.x < g.x + g.w + 4), 'crew gap ' + g.id + ' has its layer on the far bank'); }
{ const w = mkWorld(), g = gaps[0], lay = L.ents.find(e => e.layer === g.id); const layer = { alive: true, x: lay.x * TS + 8, y: (lay.y + 1) * TS }; w.enemies.push(layer); w.players.push({ x: (g.x - 4) * TS, y: ROAD * TS, ground: true, dead: false });
  for (let f = 0; f < 60 * 6; f++) w.H.update(1 / 60); const laid = []; for (let x = g.x; x < g.x + g.w; x++) if (w.grid[ROAD * W + x] === T.PLANK) laid.push(x);
  ok(laid.length === g.w - g.piles.length && w.log.includes('THE CREW LAYS THE ROAD'), 'the layer lays the road toward you (' + laid.join(',') + ')');
  const w2 = mkWorld(); w2.enemies.push({ alive: false, x: layer.x, y: layer.y }); w2.players.push({ x: (g.x - 4) * TS, y: ROAD * TS, ground: true, dead: false }); for (let f = 0; f < 300; f++) w2.H.update(1 / 60);
  ok(![...Array(g.w).keys()].some(i => w2.grid[ROAD * W + g.x + i] === T.PLANK), 'no layer, no road: hop the piles'); }
// ---- D
const sws = L.ents.filter(e => e.t === 'stiltwalker'); ok(sws.length >= 4 && sws.filter(e => e.horn).length >= 2, sws.length + ' stilt-walkers, ' + sws.filter(e => e.horn).length + ' with horns');
{ const first = sws.filter(e => e.horn).sort((a, b) => a.x - b.x)[0]; ok(first.pack.every(p => p.t === 'sprig') && !(L.pools || []).some(p => first.x * TS + 8 > p.x0 && first.x * TS + 8 < p.x1), 'the first horn is taught warm: on dry ground, it calls sprigs only'); }
{ const s = SW.newStilt(100, 288, { face: 1 }); let hit = null, tell = false; for (let f = 0; f < 200 && !hit; f++) for (const v of SW.stiltStep(s, { px: 135, py: 288, time: f / 60 }, 1 / 60)) { if (v.t === 'tell' && v.what === 'jab') tell = true; if (v.t === 'hit') hit = v; }
  ok(tell && hit && hit.what === 'gaff' && hit.blockable, 'his gaff jab is told and a shield turns it');
  const stand = { l: 131, r: 139, t: 288 - 14, b: 288 }, duck = { l: 131, r: 139, t: 288 - 8, b: 288 }, [l, r, t, b] = hit.box, over = q => l < q.r && r > q.l && t < q.b && b > q.t;
  ok(over(stand) && !over(duck), 'it comes down at a standing hero\'s head and shoulders: a ducked hero is under it'); }
ok(SW.cutsStilt('sweep', true) && SW.cutsStilt(['heavy'], true) && !SW.cutsStilt('heavy', false) && !SW.cutsStilt('light', true), 'a LOW blow cuts a stilt: the sweep and the slide, a heavy from the ground - not a cut');
{ const s = SW.newStilt(100, 288, {}); ok(SW.cutStilt(s) && s.mode === 'topple' && !SW.cutStilt(s), 'a cut stilt topples him, once'); let m = new Set(); for (let f = 0; f < 400; f++) { SW.stiltStep(s, { px: 160, py: 288, time: f / 60 }, 1 / 60); m.add(s.mode); } ok(m.has('down') && m.has('walkLow'), 'down, then up again stiltless'); }
{ const s = SW.newStilt(100, 288, { horn: true }); let horn = 0, f = 0; for (; f < 600 && !horn; f++) for (const v of SW.stiltStep(s, { px: 200, py: 288, time: f / 60 }, 1 / 60)) if (v.t === 'horn') horn = f;
  ok(horn && horn / 60 >= SW.STILT.horn - 0.05, 'his horn sounds only after its told draw (' + (horn / 60).toFixed(2) + ' s)'); }
// ---- E
const rot = sags.filter(s => s.arena); ok(rot.length === 3 && rot.every(s => s.w === 4), 'three rotten sections, four boards each, at the crossing');
for (const s of rot) ok(!ARENA.rip.some(([a, b]) => s.x + s.w - 1 >= a && s.x <= b), 'rotten section ' + s.id + ' stands on an island the rip leaves');
for (const [a, b] of ARENA.rip) ok(b - a + 1 <= 3 && at(a - 1, ROAD) === T.PLANK && at(b + 1, ROAD) === T.PLANK, 'the ripped stretch ' + a + '-' + b + ' is a jump every hero makes');
ok(L.arena && L.arena.boss === 'bogtroll' && L.ents.some(e => e.t === 'bogtroll' && e.x > ARENA.x0 && e.x < ARENA.x1), 'THE BOG TROLL holds the crossing');
console.log('ok  fen-road    ' + n + ' checks: the road, the shrines, the verb (bow, sink, lashings, the barricade as the required use), the crew gaps, the stilt-walker, the crossing');
