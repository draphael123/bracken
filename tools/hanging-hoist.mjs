/* tools/hanging-hoist.mjs - THE HANGING VILLAGE's machine and what the Reeve does to it (docs/briefs/hanging-village-rework.md §3-§4).
   Node only: no page. Three parts, each a rule that a playtest found or would have found slowly.

   1. THE HOISTS AS BUILT. Every hoist's deck rests on its floor and tops out with head room and a floor beside it; its well is on the
      floor; it has at least `need` loads; and THE WELL IS ON THE FAR SIDE OF THE DECK FROM THE LOADS - carried the other way, a load
      drops in as you walk past the well and the deck leaves without you (it did, in tools/hanging-hoist-walk.mjs, on the first try).
      The arena's hoist is not the only way to the Reeve's middle perch (B4: the rope she cuts is never the only route).
   2. THE HOIST'S RULES, run (src/main.js, THE HOIST, in a sandbox): a basket short of `need` does not move; loaded, it creaks and the
      deck rises; the deck holds at the top while anyone stands on it and tips once they are off; tipped loads go home; DOWN - and only
      DOWN - picks a load up and sets it down; a blow knocks it out of your hands; a lost load goes home; a peg cut drops its sack in;
      a cut hoist drops its deck for good, takes its loads, and leaves the iron block hanging, once.
   3. THE REEVE'S PHASE TWO (A10), run: phase one never touches the rope; the first thing phase two does is go for it, TOLD (a quiet
      windup of at least a second, THE ROPE over her), FAIR (nothing strikes the hero while she does it), ONCE; a lit lamp that dazzles
      her off the wheel sends her back for it later. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LEVELS, T, TS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { QUIET } from '../src/marks.js';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const L = LEVELS.find(l => l.id === 'hanging').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const stand = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.SHELF;

/* ---- 1. AS BUILT ---- */
const decks = (L.moversExtra || []).filter(m => m.hoist);
assert(decks.length >= 4, 'the Hanging Village has ' + decks.length + ' hoists: its machine is one it uses in varied ways (F5), four at least');
assert.deepEqual([...new Set(decks.map(m => m.hoist))].length, decks.length, 'every hoist has its own id');
const loads = L.ents.filter(e => e.t === 'load');
for (const m of decks) {
  const dx = m.x / TS, low = Math.round((m.y0 + 8) / TS) - 1, high = Math.round(m.y1 / TS) - 1, id = m.hoist;
  assert(m.y0 > m.y1, id + ': the deck rises');
  for (const x of [dx, dx + 1]) assert(stand(at(x, low + 1)), id + ': the deck rests on its floor at column ' + x);
  assert(stand(at(m.well, low + 1)) && at(m.well, low) === T.AIR, id + ': the well stands on the floor beside the deck');
  for (let y = high - 1; y <= low; y++) for (const x of [dx, dx + 1]) assert(!stand(at(x, y)) || at(x, y) === T.ONEWAY, id + ': the deck\'s shaft is open at ' + x + ',' + y + ' (a hero riding it would be pushed into the rock)');
  assert(at(dx, high - 1) === T.AIR && at(dx + 1, high - 1) === T.AIR, id + ': head room at the top');
  const off = [dx - 1, dx - 2, dx + 2, dx + 3].filter(x => stand(at(x, high + 1)) && at(x, high) === T.AIR);
  assert(off.length, id + ': there is floor to step or hop onto within two tiles of the deck at the top');
  const mine = loads.filter(e => e.hoist === id);
  assert(mine.length >= (m.need || 1), id + ': ' + mine.length + ' loads for a basket that wants ' + (m.need || 1));
  const mid = dx + 1;
  for (const e of mine) if (!e.peg) assert(Math.sign(e.x - mid) !== Math.sign(m.well - mid), id + ': the load at ' + e.x + ',' + e.y + ' is carried PAST the well (at ' + m.well + ') to reach the deck - it would drop in and the deck would leave without you');
  for (const e of mine) if (e.peg) assert(Math.abs(e.x - m.well) <= 0 && stand(at(e.peg, e.y + 1)), id + ': a pegged sack hangs over its well and its peg stands on a floor');
  assert(Number.isFinite(m.top) && Number.isFinite(m.wheelX) && Number.isFinite(m.wheelY), id + ': the wheel has a place');
}
const arenaHoist = decks.find(m => m.arena);
assert(arenaHoist, 'the Reeve\'s crown has a hoist (the one she cuts)');
{ const A = L.arena; assert(arenaHoist.x >= A.x0 && arenaHoist.x + 32 <= A.x1, 'the crown hoist stands in her arena');
  /* B4: without the hoist she cuts, the middle perch is still reached by the side climbs and the vines */
  const without = { ...L, START: { x: Math.round(A.trigger / TS) + 1, y: Math.round(A.floor / TS) - 1 }, moversExtra: L.moversExtra.filter(m => m !== arenaHoist) }, R = floodReach(without, T);   /* from her floor: the fill from the roots does not follow every ride up seven floors */
  const perch = [51, 52, 53, 54, 55, 56].some(x => R.seen.has(x + ',11'));
  assert(perch, 'with the crown hoist cut, the middle perch (51-56, row 12) can still be reached: the rope she cuts must never be the only way up'); }

/* ---- 2. THE HOIST'S RULES ---- */
const a0 = src.indexOf('// THE HOIST: THE HANGING VILLAGE'), a1 = src.indexOf("// THE DEEP'S WATER");
assert(a0 > 0 && a1 > a0, 'THE HOIST section is in src/main.js');
const section = src.slice(src.lastIndexOf('\n', a0), src.lastIndexOf('// ====', a1));
function sandbox() {
  const noop = () => {};
  const c = { TS: 16, LW: 200, LH: 200, movers: [], props: [], keys: {}, PROG: {}, P: null, players: null, hb: null, hintT: 0, hintMsg: '', numbers: [],
    SFX: new Proxy({}, { get: () => noop }), burst: noop, shakeCam: noop, sparks: noop, dust: noop,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, tileAt: (x, y) => (y >= 50 ? 1 : 0), isSolid: (x, y) => y >= 50, isOneWay: () => false,
    Math, Object, Array, Set };
  c.number = (x, y, s) => c.numbers.push(s); c.attackBox = () => c.hb;
  c.P = { x: 100, y: 800, face: 1, ground: true, dead: 0, hurt: 0, climb: false, ballast: null, onMover: null, hitSet: new Set() }; c.players = [c.P];
  vm.createContext(c); vm.runInContext(section + '\n;this.api = { hoistDeck, cutHoist, updateHoists, hoistOf };', c);
  return c;
}
const step = (c, n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) { for (const m of c.movers) if (m.hoist) { const oy = m.y; c.api.hoistDeck(m, dt); m.dy = m.y - oy; } c.api.updateHoists(dt); } };
const press = (c, k) => { c.keys[k] = true; step(c, 1); c.keys[k] = false; step(c, 1); };
const deck = o => ({ kind: 'lift', hoist: 'h', x: 64, y: 792, y0: 792, y1: 600, w: 32, h: 8, speed: 60, well: 2, need: 1, top: 560, wheelX: 60, wheelY: 570, ...o });
const load = (x, o = {}) => ({ t: 'load', kind: 'sack', hoist: 'h', x, y: 800, home: [x, 800], floorY: 800, state: 'free', vy: 0, vx: 0, cd: 0, ...o });
{ /* a load is carried in, the deck rises, holds while stood on, tips once left, and comes home */
  const c = sandbox(), m = deck({ need: 2 }), a = load(140), b = load(170); c.movers.push(m); c.props.push(a, b);
  c.P.x = 140; step(c, 5); assert.equal(a.state, 'free', 'walking onto a load does not pick it up (a stone in the crown slowed every hero who crossed it)');
  press(c, 'down'); assert.equal(c.P.ballast, a, 'DOWN picks a load up'); assert.equal(a.state, 'held');
  c.P.x = 40 - 6; step(c, 1); assert.equal(a.state, 'basket', 'carried to the well, it goes in the basket'); assert.equal(c.api.hoistOf(m).load, 1);
  step(c, 120); assert.equal(c.api.hoistOf(m).state, 'rest', 'a basket short of `need` does not move'); assert.equal(m.y, m.y0);
  c.P.x = 170; press(c, 'down'); c.P.x = 34; step(c, 1); assert.equal(c.api.hoistOf(m).load, 2);
  step(c, 2); assert.equal(c.api.hoistOf(m).state, 'creak', 'loaded, the basket creaks before the deck goes (time to hop on)');
  c.P.onMover = m; c.P.x = 80; c.P.y = m.y; step(c, 400); assert.equal(m.y, m.y1, 'the deck reaches the top'); assert.equal(c.api.hoistOf(m).state, 'top');
  step(c, 600); assert.equal(c.api.hoistOf(m).state, 'top', 'it holds at the top while anyone stands on it');
  c.P.onMover = null; step(c, 120); assert.equal(c.api.hoistOf(m).state, 'down', 'left, the basket tips and the deck comes home');
  assert(a.state === 'return' || a.state === 'free', 'the tipped loads go home'); step(c, 600);
  assert.equal(c.api.hoistOf(m).state, 'rest'); assert.equal(m.y, m.y0); assert.deepEqual([a.state, a.x, b.state, b.x], ['free', 140, 'free', 170], 'and each is back on its pile');
  c.P.x = 140; press(c, 'down'); assert.equal(c.P.ballast, a); press(c, 'down'); assert.equal(c.P.ballast, null, 'DOWN sets it down again'); assert.equal(a.state, 'free');
  step(c, 40); press(c, 'down'); assert.equal(c.P.ballast, a, 'and picks it up again once it has settled'); c.P.hurt = 0.3; step(c, 1); assert.equal(c.P.ballast, null, 'a blow knocks it out of your hands'); c.P.hurt = 0;
  a.state = 'free'; a.y = 800 + 5 * 16; a.vy = 0; step(c, 60); assert.equal(a.x, 140, 'a load lost off its floor goes back to its pile'); }
{ /* the mill's peg */
  const c = sandbox(), m = deck({ well: 6, x: 64 }), s = load(104, { peg: true, pegX: 40, hy: 700, ropeTop: 600, state: 'hung', y: 700 }); c.movers.push(m); c.props.push(s);
  step(c, 30); assert.equal(s.state, 'hung', 'a pegged sack stays hung'); assert.equal(c.api.hoistOf(m).load, 0);
  c.hb = { l: 30, r: 50, t: 780, b: 800 }; step(c, 1); c.hb = null; step(c, 40); assert.equal(s.state, 'basket', 'a cut peg drops its sack into the basket under it');
  step(c, 900); assert.equal(s.state, 'hung', 'and after the ride it is hauled back up onto its peg'); assert.equal(c.api.hoistOf(m).state, 'rest'); }
{ /* the Reeve's cut */
  const c = sandbox(), m = deck({ arena: true }), a = load(140); c.movers.push(m); c.props.push(a); c.P.x = 140; press(c, 'down');
  c.api.cutHoist(m); step(c, 120); const s = c.api.hoistOf(m);
  assert.equal(s.state, 'cut'); assert(s.landed && m.broken && m.gone, 'a cut hoist\'s deck falls and is nobody\'s footing'); assert.equal(m.y, m.y0);
  assert.equal(a.state, 'gone', 'its loads go with it'); assert.equal(c.P.ballast, null, 'including the one in your hands');
  const blk = c.props.filter(p => p.t === 'deadfall' && p.block); assert.equal(blk.length, 1, 'the iron block is left hanging, as a deadfall'); assert(blk[0].once, 'and it falls once');
  c.api.cutHoist(m); assert.equal(c.props.filter(p => p.t === 'deadfall' && p.block).length, 1, 'cutting twice leaves one block'); }
assert(/ow\.modeT = pr\.block \? 3\.4 : /.test(src) && /pr\.block \? 0\.08 : 0\.05/.test(src) && /if \(pr\.once\) pr\.downT = 9/.test(src), 'the block pins her longer and harder than a bough, and is never hauled back up');

/* ---- 3. THE REEVE'S PHASE TWO ---- */
const o0 = src.indexOf('function lightOwlLamp'), o1 = src.indexOf('// The Forgemaster.', o0);
function owlBox(phase, lamp) {
  const noop = () => {}; let seed = 7; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const A = { x0: 20 * 16, x1: 90 * 16, floor: 20 * 16 }, H = { hoist: 'crown', arena: true, x: 57 * 16, wheelX: 916, wheelY: 90, hs: { state: 'rest' } };
  const c = { L: { arena: A, perches: [[42, 9], [54, 12], [65, 9]] }, props: lamp ? [lamp] : [], movers: [H], TS: 16, enemies: [], P: { x: 30 * 16, y: 320, dead: false }, seeds: [], hits: [], cuts: [], flash: 0,
    SFX: new Proxy({}, { get: () => noop }), number: noop, burst: noop, ringAt: noop, dust: noop, shakeCam: noop, zoomKick: noop, sparks: noop, parts: [], camX: 0, VW: 320, DMG: new Proxy({}, { get: () => 10 }), EHP: { spider: 10 }, COLS: { owl: [] } };
  c.damagePlayer = (...a) => c.hits.push(a); c.cutHoist = m => { c.cuts.push(m); m.hs.state = 'cut'; };
  c.Math = Object.create(Math); c.Math.random = rnd; vm.createContext(c); vm.runInContext(src.slice(o0, o1), c);
  const e = { t: 'owl', mode: 'sit', modeT: 1, phase, hp: 100, maxHp: 200, x: 54 * 16 + 8, y: 12 * 16, face: 1, hitT: 0, anim: 0, alive: true };
  return { c, e, H };
}
{ const { c, e } = owlBox(1); const modes = new Set(); for (let i = 0; i < 60 * 40; i++) { c.updateOwl(e, 1 / 60); modes.add(e.mode); }
  assert(!modes.has('ropeGo') && !modes.has('ropeTell') && !c.cuts.length, 'phase one never goes for the rope'); }
{ const { c, e, H } = owlBox(2); let t = 0, tell = 0, hitDuring = 0; const seen = [];
  for (let i = 0; i < 60 * 12 && !c.cuts.length; i++) { const n = c.hits.length; c.updateOwl(e, 1 / 60); t += 1 / 60; if (e.mode === 'ropeTell') tell += 1 / 60; if ((e.mode === 'ropeGo' || e.mode === 'ropeTell') && c.hits.length > n) hitDuring++; if (seen[seen.length - 1] !== e.mode) seen.push(e.mode); }
  assert.equal(seen[0], 'ropeGo', 'the FIRST thing phase two does is go for the hoist (was: ' + seen.slice(0, 4).join(', ') + ')');
  assert.equal(c.cuts.length, 1, 'and she cuts it'); assert.equal(c.cuts[0], H);
  assert(tell >= 1.0, 'told: she is on the wheel for ' + tell.toFixed(2) + ' s before the rope goes (a second at least)');
  assert.equal(hitDuring, 0, 'fair: nothing strikes the hero while she goes for the rope');
  assert(QUIET.has('updateOwl|ropeTell'), 'ropeTell is a QUIET windup in src/marks.js: it strikes nobody, so it wears no guard mark');
  for (let i = 0; i < 60 * 30; i++) c.updateOwl(e, 1 / 60); assert.equal(c.cuts.length, 1, 'once'); }
{ /* a lit lamp by the wheel dazzles her off it, and she comes back for the rope */
  const lamp = { t: 'lantern', owl: true, perch: true, lit: false, x: 916, y: 90 + 40 };
  const { c, e } = owlBox(2, lamp); let dazzled = false;
  for (let i = 0; i < 60 * 12 && !c.cuts.length; i++) { if (e.mode === 'ropeTell' && !dazzled) { lamp.lit = true; lamp.lampT = 14; } c.updateOwl(e, 1 / 60); if (e.mode === 'dazzled') { dazzled = true; lamp.lit = false; } }
  assert(dazzled, 'a lamp lit by the wheel dazzles her off the rope'); assert(!e.ropeDone || c.cuts.length, 'dazzled off it, she has not given the rope up');
  for (let i = 0; i < 60 * 40 && !c.cuts.length; i++) c.updateOwl(e, 1 / 60); assert.equal(c.cuts.length, 1, 'and she comes back for it'); }
console.log('hanging-hoist  ' + decks.length + ' hoists (' + decks.map(m => m.hoist + (m.arena ? '*' : '') + ':' + (m.need || 1)).join(', ') + '), every well on the far side of its deck from its loads; the rules run; the Reeve cuts the crown\'s rope once, told and fair, in phase two only.');
