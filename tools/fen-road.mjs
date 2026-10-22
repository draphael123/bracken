// tools/fen-road.mjs - THE FEN ROAD, its beats pinned (claude/fenroad; src/fen-road.js, src/fen-road-hands.js, src/stilt-walker.js). Node only, a few seconds.
//   A. the road: marsh -> fenroad -> stockade (needs, act I list, TIER between them), its sections, its shrines (one closing each area + one before the boss)
//   B. THE VERB: every bowed section on the route has its lashing (but the stilt-post steps and the crossing's rotten ones), THE BARRICADE stands on one and
//      is the only way on (a flood with it shut does not reach the crossing; with it gone it does), and the hands work it: weight bows -> it goes under after
//      its hold, a goblin does not bow it, a struck lashing drops it at once with its load, it floats back, the footing is kept on sound boards only
//   C. the crew gaps: piles every hero hops (no gap of open water over 3 columns), each with its layer, and the hands lay the road toward you while he works
//   D. THE STILT-WALKER: a general foe - his told jab (high: a duck goes under its box, a block turns it), a low blow cuts a stilt and he topples, his horn
//      sounds only after its told draw; the first horn lookout stands on dry ground and calls sprigs only (the horn taught warm)
//   E. THE TROLL'S CROSSING: three rotten sections, each on an island the rip leaves, every ripped stretch a jump for every hero
//   F. (claude/fenroad2) LAY THE ROAD: every peat hole is a LOCK for every hero (shut, the crossing is not reached; laid, it is), each has a bundle on the road before it
//      (no other hole between), its bog is mud (no swim), teach -> test -> exam with the exam's two holes before its shrine; the hands: slotAhead at the edge only,
//      lay makes a LAID section that bows and goes under and comes back laid, a crew gap and a sunk section can be laid; the planks: E takes one, E at the edge lays it,
//      a thrown one topples a stilt-walker and staggers a foe
//   G. (claude/fenroad2) THE STILT-WALKER MOVES: a beat walked in told high steps (footX before every step), each step a stomp (an event the road bows to: a section
//      already bowing goes under), a told unblockable stomp on a hero under him
//   H. (claude/fenroad2) THE BOG LEECH: lurks untouchable, wakes on a bowing section near it, a told rear (!!), the lunge latches (a bite + the drain), a roll shakes it off
//      onto the boards (x2 there), it drops off sated at last
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { ACTS } from '../src/foe-react.js';
import { floodReach } from '../src/reachcore.js';
import { SECTIONS, ARENA, ROAD } from '../src/fen-road.js';
import { makeFenRoadHands, SAG } from '../src/fen-road-hands.js';
import * as SW from '../src/stilt-walker.js';
import { HOLES, BUNDLES } from '../src/fen-road.js';
import { makeFenPlanks } from '../src/fen-planks.js';
import * as BL from '../src/bog-leech.js';
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
const sags = L.ents.filter(e => e.t === 'sag' || e.t === 'rotten'), lashes = L.ents.filter(e => e.t === 'lashing');
for (const id of ['b', 'e', 'f', 'i', 'j']) { const s = sags.find(q => q.id === id);   /* the crews' sections and the barricade's: each lashed at its near end (the first bowed boards, a, teach the bow alone) */
  ok(s && lashes.some(l => l.sag === s.id && l.x < s.x && s.x - l.x <= 4), 'the bowed section ' + id + ' has its lashing at its near end'); }
ok(sags.filter(s => !s.arena).length >= 10 && lashes.length >= 4, 'the verb is everywhere: ' + sags.length + ' bowed sections, ' + lashes.length + ' lashings');
const bar = sags.find(s => s.load && s.load.length); ok(bar && bar.load.every(([x, y]) => at(x, y) === T.PORT) && bar.load.filter(([x]) => x === bar.load[0][0]).length >= 4, 'THE BARRICADE: four crates high on its bowed section (no jump clears 64 px)');
const laySpans = g => { for (const [x0, x1, row] of L.reachSpans) for (let x = x0; x <= x1; x++) if (g[row * W + x] === T.AIR) g[row * W + x] = T.PLANK; return g; };   /* (claude/fenroad2) the peat holes laid: the barricade is read alone */
{ const g1 = laySpans(L.grid.slice()); for (const [x, y] of [...bar.load, ...bar.load.filter(([, y]) => y === ROAD - 1).map(([x]) => [x, ROAD])]) g1[y * W + x] = T.SOLID; const R = floodReach({ ...L, grid: g1 }, T, { noAssist: true }); const arenaIn = [...R.seen].some(k => +k.split(',')[0] > ARENA.trigger);
  const g2 = laySpans(L.grid.slice()); for (const [x, y] of bar.load) g2[y * W + x] = T.AIR; for (const [x] of bar.load) g2[ROAD * W + x] = T.PLANK; const R2 = floodReach({ ...L, grid: g2 }, T, { noAssist: true }); const arenaIn2 = [...R2.seen].some(k => +k.split(',')[0] > ARENA.trigger);
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
ok(gaps.length >= 1, gaps.length + ' crew gap(s): the crews still lay their own road (fenroad2: the other two are peat holes now)');
for (const g of gaps) { const feet = [g.x - 1, ...g.piles, g.x + g.w].sort((a, b) => a - b); for (let i = 1; i < feet.length; i++) ok(feet[i] - feet[i - 1] - 1 <= 3, 'crew gap ' + g.id + ': no hop over 3 columns of water (' + feet.join(',') + ')');
  ok(L.ents.some(e => e.layer === g.id && e.x > g.x + g.w - 1 && e.x < g.x + g.w + 4), 'crew gap ' + g.id + ' has its layer on the far bank'); }
{ const w = mkWorld(), g = gaps[0], lay = L.ents.find(e => e.layer === g.id); const layer = { alive: true, x: lay.x * TS + 8, y: (lay.y + 1) * TS }; w.enemies.push(layer); w.players.push({ x: (g.x - 4) * TS, y: ROAD * TS, ground: true, dead: false });
  for (let f = 0; f < 60 * 6; f++) w.H.update(1 / 60); const laid = []; for (let x = g.x; x < g.x + g.w; x++) if (w.grid[ROAD * W + x] === T.PLANK) laid.push(x);
  ok(laid.length === g.w - g.piles.length && w.log.includes('THE CREW LAYS THE ROAD'), 'the layer lays the road toward you (' + laid.join(',') + ')');
  const w2 = mkWorld(); w2.enemies.push({ alive: false, x: layer.x, y: layer.y }); w2.players.push({ x: (g.x - 4) * TS, y: ROAD * TS, ground: true, dead: false }); for (let f = 0; f < 300; f++) w2.H.update(1 / 60);
  ok(![...Array(g.w).keys()].some(i => w2.grid[ROAD * W + g.x + i] === T.PLANK), 'no layer, no road: hop the piles'); }
// ---- D
const sws = L.ents.filter(e => e.t === 'stiltwalker'); ok(sws.length >= 4 && sws.filter(e => e.horn).length >= 2, sws.length + ' stilt-walkers, ' + sws.filter(e => e.horn).length + ' with horns');
ok(sws.every(e => e.beat > 0), 'every stilt-walker walks a beat (a mover, not a post)');
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
// ---- F. LAY THE ROAD (claude/fenroad2)
const holes = L.ents.filter(e => e.t === 'broken').sort((a, b) => a.x - b.x), HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];
ok(holes.length === HOLES.length && holes.every(h => h.req) && L.reachSpans.length === holes.length, holes.length + ' peat holes, every one required');
const arenaReached = R => [...R.seen].some(k => +k.split(',')[0] > ARENA.trigger);
for (const h of holes) {
  ok((L.pools || []).some(p => p.mud && p.x0 === h.x * TS && p.x1 === (h.x + h.w) * TS) && !(L.pools || []).some(p => !p.mud && p.x1 > h.x * TS && p.x0 < (h.x + h.w) * TS), 'hole ' + h.id + ': its bog is mud (no swimming across), no fen water over it');
  for (let x = h.x; x < h.x + h.w; x++) ok(at(x, ROAD) === T.AIR, 'hole ' + h.id + ': no road at ' + x);
  const shut = { ...L, reachSpans: L.reachSpans.filter(([x0]) => x0 !== h.x) };
  for (const hero of HEROES) ok(!arenaReached(floodReach(shut, T, { hero })), 'hole ' + h.id + ' is a LOCK for the ' + hero + ' (shut: no crossing)');
  const b = BUNDLES.filter(([bx]) => bx < h.x).sort((p, q) => q[0] - p[0])[0];
  ok(b && h.x - b[0] <= 26 && !holes.some(o => o.x > b[0] && o.x < h.x) && [T.PLANK, T.SOLID].includes(at(b[0], b[1] + 1)), 'hole ' + h.id + ' has its bundle on the road before it (' + (b && b[0]) + ')'); }
ok(arenaReached(floodReach(L, T, { hero: 'knight' })), 'every hole laid: the crossing is reached');
{ const cps = checks; ok(holes[0].x > SECTIONS[1][1] && holes[0].x < SECTIONS[1][1] + 12, 'TEACH: the first hole opens THE WORK CREWS (' + holes[0].x + ')');
  const ex = holes.filter(h => h.x >= SECTIONS[3][1] && h.x <= SECTIONS[3][2]); ok(ex.length >= 2 && cps.some(c => c > ex.at(-1).x && c <= SECTIONS[3][2]), 'EXAM: two holes on THE PALISADE ROAD, a shrine after them'); }
{ const w = mkWorld(), h = holes[0], P = { x: h.x * TS - 6, y: ROAD * TS, ground: true, dead: false, face: 1 }; w.players.push(P);
  ok(w.H.slotAhead(P) && w.H.slotAhead(P).id === h.id, 'stood at the near edge facing the hole: it is the slot ahead');
  P.face = -1; ok(!w.H.slotAhead(P), 'facing away: no slot'); P.face = 1; P.x = h.x * TS - 40; ok(!w.H.slotAhead(P), 'two tiles back: no slot'); P.x = h.x * TS - 6;
  ok(w.H.lay(w.H.slotAhead(P)) && [...Array(h.w).keys()].every(i => w.grid[ROAD * W + h.x + i] === T.PLANK) && w.H.sag('laid:' + h.id) && !w.H.slotAhead(P), 'E LAYS IT: the hole is road, a laid section, no slot now');
  P.x = (h.x + 3) * TS; for (let f = 0; f < 60 * (SAG.holdLaid - 0.2); f++) w.H.update(1 / 60); ok(w.H.sag('laid:' + h.id).st === 'bow', 'a laid plank SAGS LIKE THE REST (bowing under you, ' + SAG.holdLaid + ' s hold)');
  for (let f = 0; f < 30; f++) w.H.update(1 / 60); ok(w.H.sag('laid:' + h.id).st === 'under' && w.grid[ROAD * W + h.x + 3] === T.AIR, 'held past its hold it goes under');
  P.y = 30 * TS; P.ground = false; for (let f = 0; f < 60 * (SAG.under + 0.5); f++) w.H.update(1 / 60); ok(w.H.sag('laid:' + h.id).st === 'up' && w.grid[ROAD * W + h.x + 3] === T.PLANK, 'and floats back, still laid'); }
{ const w = mkWorld(), g = gaps[0], P = { x: g.x * TS - 6, y: ROAD * TS, ground: true, dead: false, face: 1 }; w.players.push(P);
  const sl = w.H.slotAhead(P); ok(sl && sl.kind === 'crewgap' && w.H.lay(sl) && g.piles.every(x => w.grid[ROAD * W + x] !== T.PLANK) && [...Array(g.w).keys()].map(i => g.x + i).filter(x => !g.piles.includes(x)).every(x => w.grid[ROAD * W + x] === T.PLANK), 'a crew gap takes your plank (its piles kept)'); }
{ const w = mkWorld(), s = sags.find(q => q.id === 'c'), P = { x: (s.x + 1) * TS, y: ROAD * TS, ground: true, dead: false, face: 1 }; w.players.push(P); for (let f = 0; f < 60 * (SAG.hold + 0.1); f++) w.H.update(1 / 60);
  P.x = (s.x - 1) * TS + 6; P.y = ROAD * TS; P.ground = true; const sl = w.H.slotAhead(P); ok(sl && sl.kind === 'sunk' && w.H.lay(sl) && w.H.sag('c').st === 'up' && w.grid[ROAD * W + s.x] === T.PLANK, 'a bowed section gone under can be laid back at once'); }
{ const w = mkWorld(), s = sags.find(q => q.id === 'a'); w.H.stomp((s.x + 1) * TS + 8, ROAD * TS); ok(w.H.sag('a').st === 'bow', 'a stilt-walker\'s stomp bows a section with nobody on it');
  for (let k = 0; k < 4 && w.H.sag('a').st !== 'under'; k++) w.H.stomp((s.x + 1) * TS + 8, ROAD * TS); ok(w.H.sag('a').st === 'under', 'stomps on a bowing section put it under'); }
{ const w = mkWorld(), s = sags.find(q => q.id === 'c'), P = { x: (s.x + 1) * TS, y: ROAD * TS, ground: true, dead: false }; w.players.push(P); ok(!w.H.astir(91 * TS, 72), 'nobody on the boards: the leech sleeps');
  for (let f = 0; f < 20; f++) w.H.update(1 / 60); ok(w.H.astir(91 * TS, 72) && !w.H.astir(140 * TS, 72), 'a section bowing under a hero stirs the water near it, only near it'); }
{ /* THE PLANKS (src/fen-planks.js) on a fake world: take, lay, throw at a stilt-walker */
  const w = mkWorld(), h = holes[0], P = { x: BUNDLES[0][0] * TS + 8, y: (BUNDLES[0][1] + 1) * TS, ground: true, dead: false, face: 1, hurt: 0 }; w.players.push(P); const log = [];
  const sw = { t: 'stiltwalker', alive: true, x: P.x + 60, y: P.y, w: 10, h: 30, st: SW.newStilt(P.x + 60, P.y) }, tops = [];
  const FP = makeFenPlanks({ L: () => w.Lw, P: () => P, keys: () => ({}), enemies: () => [sw], fen: () => w.H, solidPx: (x, y) => [T.SOLID, T.PLANK].includes(w.grid[Math.floor(y / TS) * W + Math.floor(x / TS)]),
    number: (x, y, t) => log.push(t), text: () => {}, burst: () => {}, dust: () => {}, sfx: {}, hint: m => log.push(m), told: () => false, tell: () => {}, hurtFoe: () => log.push('hurt'), topple: e => { tops.push(e); return SW.cutStilt(e.st); } });
  FP.reset(); ok(FP.on() && FP.canTake() && FP.interact(P) && P.carry && P.carry.t === 'fplank' && P.carry.noClimb && log.some(t => /E LAYS IT/.test(t)), 'E at a bundle takes a plank (carried: no climbing; the hint says how)');
  P.x = h.x * TS - 6; FP.update(1 / 60); ok(FP.read().ahead && FP.read().ahead.id === h.id, 'carried to the edge: the ghost plank shows where it goes');
  ok(FP.interact(P) && !P.carry && w.grid[ROAD * W + h.x + 2] === T.PLANK, 'E at the edge lays it');
  P.x = BUNDLES[0][0] * TS + 8; FP.interact(P); const q = P.carry; q.state = 'fly'; q.vx = 175; q.vy = -60; P.carry = null; sw.x = P.x + 40; sw.st.x = sw.x;
  for (let f = 0; f < 90 && !tops.length; f++) FP.update(1 / 60); ok(tops.length === 1 && !sw.st.stilts, 'a thrown plank takes a stilt-walker off his stilts'); }
// ---- G. THE STILT-WALKER MOVES (claude/fenroad2)
{ const s = SW.newStilt(400, 288, { face: -1, beat: 3 }); const xs = [], steps = []; let toldFirst = true;
  for (let f = 0; f < 60 * 8; f++) { const ev = SW.stiltStep(s, { px: 2000, py: 288, time: f / 60 }, 1 / 60); for (const v of ev) if (v.t === 'step') { steps.push(v); } if (s.ph === 'lift' && s.footX === null) toldFirst = false; xs.push(s.x); }
  ok(Math.max(...xs) - Math.min(...xs) > 40 && Math.max(...xs) <= 400 + 3 * 16 + SW.STILT.stride && Math.min(...xs) >= 400 - 3 * 16 - SW.STILT.stride, 'unseeing, he walks his beat (' + Math.round(Math.min(...xs)) + '-' + Math.round(Math.max(...xs)) + ')');
  ok(steps.length >= 6 && toldFirst, steps.length + ' told high steps in 8 s (every lift tells where it comes down), each a stomp event'); }
{ const s = SW.newStilt(400, 288, { face: 1 }); s.cd = 0; let tell = null, hit = null;
  for (let f = 0; f < 120 && !hit; f++) for (const v of SW.stiltStep(s, { px: 406, py: 288, time: f / 60 }, 1 / 60)) { if (v.t === 'tell' && v.what === 'stomp') tell = v; if (v.t === 'hit') hit = v; }
  ok(tell && tell.mark === '!!' && hit && hit.what === 'stomp' && !hit.blockable && hit.box[0] < 406 && hit.box[1] > 406, 'a hero under him: a told (!!) unblockable stomp where he stood'); }
// ---- H. THE BOG LEECH (claude/fenroad2)
{ const sy = 304, H = { x: 400, y: 288, dead: false, face: 1, dodge: 0 }; let astir = false; const log = [];
  const X = { hero: () => H, heroes: () => [H], surfaceAt: () => sy, solidAt: (x, y) => y >= 288 && y < 304, astir: () => astir, inWater: () => false, rolling: pp => pp.dodge > 0,
    bite: (e, pp, d) => log.push('bite ' + d), latch: () => log.push('latch'), unlatch: (e, pp, why) => log.push('unlatch ' + why), mark: (e, t) => log.push(t), ring: () => {}, sfx: {}, hint: (k, m) => log.push(m) };
  const e = BL.newLeech({ x: 420, y: sy, hp: BL.LEECH.hp }); for (let f = 0; f < 120; f++) BL.stepLeech(e, 1 / 60, X); ok(e.mode === 'lurk' && BL.leechTake(e) === 0, 'it lurks, untouchable, while the boards are still');
  astir = true; let rear = false; for (let f = 0; f < 200 && e.mode !== 'latched'; f++) { BL.stepLeech(e, 1 / 60, X); if (e.mode === 'rear') rear = true; }
  ok(rear && log.includes('!!') && e.mode === 'latched' && log.includes('latch') && log.some(t => /^bite/.test(t)) && H.leech === e, 'a bowing section wakes it: a told rear (!!), the lunge, it LATCHES (a bite, then the drain)');
  H.dodge = 0.3; BL.stepLeech(e, 1 / 60, X); ok(e.mode === 'flop' && !H.leech && log.includes('unlatch shaken') && BL.leechTake(e) === BL.LEECH.weak, 'a ROLL shakes it off onto the boards, where it is weak');
  H.dodge = 0; e.mode = 'latched'; e.host = H; H.leech = e; e.latchT = 0; for (let f = 0; f < 60 * (BL.LEECH.sated + 0.2); f++) BL.stepLeech(e, 1 / 60, X); ok(e.mode !== 'latched' && log.includes('unlatch sated'), 'it lets go sated at last (' + BL.LEECH.sated + ' s)'); }
ok(L.ents.filter(e => e.t === 'leech').length >= 5 && L.ents.filter(e => e.t === 'leech').every(e => (L.pools || []).some(p => e.x * TS + 8 > p.x0 && e.x * TS + 8 < p.x1)), 'the leeches lie in the water by the boards');
console.log('ok  fen-road    ' + n + ' checks: the road, the shrines, the verb (bow, sink, lashings, the barricade as the required use), the crew gaps, the stilt-walker, the crossing; LAY THE ROAD (locks, bundles, lay, throw), the stomping stilt-walker, the bog leech');
