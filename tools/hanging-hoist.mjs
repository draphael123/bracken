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
   3. THE REEVE REBUILT ON ROPES (claude/hanging3, Daniel 10-24; src/hanging-ropes.js), run: phase one never cuts a rope; the first thing phase
      two does is go for one, TOLD (a quiet windup of at least 0.8 s - SHE CUTS THE ROPE, the fray), FAIR (nothing strikes the hero while she
      does it), and again later on a cooldown; a perch cut under her brings her down OPEN (gold read, a bigger take, then her ward), and a perch
      that is down is no seat for her. The crown's hoist became two counterweight decks (the ropes she cuts are never the only way up, B4). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LEVELS, T, TS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { QUIET } from '../src/marks.js';
import { THROW_KIND } from '../src/throwables.js';
import { duckBox } from '../src/duck.js';

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const L = LEVELS.find(l => l.id === 'hanging').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const stand = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.SHELF;

/* ---- 1. AS BUILT ---- */
const decks = (L.moversExtra || []).filter(m => m.hoist);
assert(decks.length >= 3, 'the Hanging Village has ' + decks.length + ' hoists: its machine is one it uses in varied ways (F5), three at least beside the ropes (claude/hanging3)');
const ropes = L.ropes || [], kinds = new Set(ropes.map(r => r.kind));
for (const k of ['net', 'bridge', 'counter', 'line', 'perch', 'ledge']) assert(kinds.has(k), 'CUT IT AND RIDE IT: the village has a ' + k + ' rope (src/hanging-ropes.js)');
assert(ropes.filter(r => r.kind !== 'perch' && r.kind !== 'ledge').length >= 8, 'the verb is on every floor: ' + ropes.length + ' ropes');
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
assert(!decks.some(m => m.arena), 'the crown hoist is gone: two counterweight decks stand in its place (claude/hanging3)');
const arenaDecks = (L.moversExtra || []).filter(m => m.rope && m.arena);
assert(arenaDecks.length >= 2, 'the Reeve\'s crown has counterweight decks (the ones she cuts)');
for (const r of ropes.filter(r => r.knot)) { const [kx, ky] = r.knot; if (r.high) continue; assert(stand(at(kx, ky + 1)) && at(kx, ky) === T.AIR, r.id + ': its knot stands on a floor (' + kx + ',' + ky + ')'); }
for (const r of ropes.filter(r => r.kind === 'perch')) assert(L.perches.some(([px, py]) => px >= r.x0 && px <= r.x1 && py === r.row), r.id + ': a perch rope hangs one of her perches');
{ const A = L.arena; for (const m of arenaDecks) assert(m.x >= A.x0 && m.x + 32 <= A.x1, 'the crown deck ' + m.rope + ' stands in her arena'); const arenaHoist = arenaDecks[0];
  /* B4: without the hoist she cuts, the middle perch is still reached by the side climbs and the vines */
  const without = { ...L, START: { x: Math.round(A.trigger / TS) + 1, y: Math.round(A.floor / TS) - 1 }, moversExtra: L.moversExtra.filter(m => !arenaDecks.includes(m)) }, R = floodReach(without, T);   /* from her floor: the fill from the roots does not follow every ride up seven floors */
  const perch = [51, 52, 53, 54, 55, 56].some(x => R.seen.has(x + ',11'));
  assert(perch, 'with the crown decks cut, the middle perch (51-56, row 12) can still be reached: the rope she cuts must never be the only way up'); }

/* ---- 2. THE HOIST'S RULES ---- */
const a0 = src.indexOf('// THE HOIST: THE HANGING VILLAGE'), a1 = src.indexOf("// THE DEEP'S WATER");
assert(a0 > 0 && a1 > a0, 'THE HOIST section is in src/main.js');
const section = src.slice(src.lastIndexOf('\n', a0), src.lastIndexOf('// ====', a1));
function sandbox() {
  const noop = () => {};
  const c = { TS: 16, LW: 200, LH: 200, movers: [], props: [], keys: {}, PROG: {}, P: null, players: null, hb: null, hintT: 0, hintMsg: '', numbers: [],
    talkPress: false, atkPress: false, THROW_KIND,   /* CARRY & THROW (2026-09-28): INTERACT picks a load up, ATTACK throws it */
    SFX: new Proxy({}, { get: () => noop }), hintSay: noop, burst: noop, shakeCam: noop, sparks: noop, dust: noop,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, tileAt: (x, y) => (y >= 50 ? 1 : 0), isSolid: (x, y) => y >= 50, isOneWay: () => false,
    Math, Object, Array, Set };
  c.number = (x, y, s) => c.numbers.push(s); c.attackBox = () => c.hb;
  c.P = { x: 100, y: 800, face: 1, ground: true, dead: 0, hurt: 0, climb: false, ballast: null, onMover: null, hitSet: new Set() }; c.players = [c.P];
  vm.createContext(c); vm.runInContext(section + '\n;this.api = { hoistDeck, cutHoist, updateHoists, hoistOf, throwLoad };', c);
  return c;
}
const step = (c, n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) { for (const m of c.movers) if (m.hoist) { const oy = m.y; c.api.hoistDeck(m, dt); m.dy = m.y - oy; } c.api.updateHoists(dt); } };
const press = (c, k) => { c.keys[k] = true; step(c, 1); c.keys[k] = false; step(c, 1); };
const interact = c => { c.talkPress = true; step(c, 1); c.talkPress = false; step(c, 1); };   /* CARRY & THROW's pick-up key, edge-triggered like DOWN */
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
{ /* CARRY & THROW (src/throwables.js, 2026-09-28): INTERACT picks a load up same as DOWN, and a throw that LANDS IN THE BASKET
     counts exactly like carrying it in - Daniel's live report was a hero who stood on the deck, hit it and jumped on it, but
     never carried a load to the basket, because nothing told him to */
  const c = sandbox(), m = deck({ need: 1 }), a = load(140); c.movers.push(m); c.props.push(a);
  c.P.x = 140; interact(c); assert.equal(c.P.ballast, a, 'INTERACT picks a load up, same as DOWN'); assert.equal(a.state, 'held');
  c.P.x = 60; c.P.face = -1; step(c, 5);   /* well off to the left of the deck, out of carrying range - only a throw reaches it from here */
  c.api.throwLoad(a); assert.equal(c.P.ballast, null, 'thrown, it leaves the hero\'s hands'); assert(a.vx < 0 && a.vy < 0, 'and launches the way he faced, up and out');
  step(c, 20); assert.equal(a.state, 'basket', 'a THROWN load that lands in the well fills the basket exactly like a carried one'); assert.equal(c.api.hoistOf(m).load, 1);
  assert.equal(c.api.hoistOf(m).state, 'creak', 'and the deck answers a thrown load the same way it answers a carried one');
  step(c, 40); assert(c.api.hoistOf(m).state === 'up' && m.y < m.y0, 'and rises off a thrown load exactly as it would off a carried one'); }
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
function owlBox(phase, opt = {}) {
  const noop = () => {}; let seed = 7; const rnd = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
  const A = { x0: 20 * 16, x1: 90 * 16, floor: 20 * 16 }, down = new Set(opt.down || []);
  const targets = opt.targets || [{ id: 'ledge-29', kind: 'ledge', x: 30 * 16 + 8, y: 14 * 16, top: 48 }, { id: 'ledge-79', kind: 'ledge', x: 80 * 16 + 8, y: 14 * 16, top: 48 }];
  const c = { L: { arena: A, perches: [[42, 9], [54, 12], [65, 9]] }, props: [], movers: [], TS: 16, enemies: [], P: { x: 30 * 16, y: 320, w: 10, h: 14, dead: false }, duckBox, seeds: [], hits: [], cuts: [], flash: 0, bossActive: true,
    SFX: new Proxy({}, { get: () => noop }), hintSay: noop, number: noop, burst: noop, ringAt: noop, dust: noop, shakeCam: noop, zoomKick: noop, sparks: noop, parts: [], camX: 0, VW: 320, DMG: new Proxy({}, { get: () => 10 }), EHP: { spider: 10 }, COLS: { owl: [] } };
  c.HVR = { on: () => true, perchUp: k => !down.has(k), owlTargets: () => targets.filter(t => !c.cuts.includes(t.id)), owlCut: id => { c.cuts.push(id); return true; }, ropeOf: () => ({}) };
  c.damagePlayer = (...a) => c.hits.push(a);
  c.Math = Object.create(Math); c.Math.random = rnd; vm.createContext(c); vm.runInContext(src.slice(o0, o1) + ';this.owlPerchCut = owlPerchCut; this.owlTake = owlTake; this.OWL_OPEN = OWL_OPEN;', c);
  const e = { t: 'owl', mode: 'sit', modeT: 1, phase, hp: 100, maxHp: 200, x: 54 * 16 + 8, y: 12 * 16, face: 1, hitT: 0, anim: 0, alive: true };
  c.boss = e; return { c, e, down };
}
{ const { c, e } = owlBox(1); const modes = new Set(); for (let i = 0; i < 60 * 40; i++) { c.updateOwl(e, 1 / 60); modes.add(e.mode); }
  assert(!modes.has('ropeGo') && !modes.has('ropeTell') && !c.cuts.length, 'phase one never cuts a rope'); }
{ const { c, e } = owlBox(2); let tell = 0, hitDuring = 0; const seen = [];
  for (let i = 0; i < 60 * 12 && !c.cuts.length; i++) { const n = c.hits.length; c.updateOwl(e, 1 / 60); if (e.mode === 'ropeTell') tell += 1 / 60; if ((e.mode === 'ropeGo' || e.mode === 'ropeTell') && c.hits.length > n) hitDuring++; if (seen[seen.length - 1] !== e.mode) seen.push(e.mode); }
  assert.equal(seen[0], 'ropeGo', 'the FIRST thing phase two does is go for a rope (was: ' + seen.slice(0, 4).join(', ') + ')');
  assert.equal(c.cuts.length, 1, 'and she cuts it'); assert.equal(c.cuts[0], 'ledge-29', 'the hung ledge nearest the hero');
  assert(tell >= 0.79, 'told: she is on the rope for ' + tell.toFixed(2) + ' s before it goes (0.8 s at least - the creak and the fray)');
  assert.equal(hitDuring, 0, 'fair: nothing strikes the hero while she goes for the rope');
  assert(QUIET.has('updateOwl|ropeTell'), 'ropeTell is a QUIET windup in src/marks.js: it strikes nobody, so it wears no guard mark');
  let again = 0; for (let i = 0; i < 60 * 120; i++) { c.updateOwl(e, 1 / 60); if (e.mode === 'ropeTell') again++; } assert(c.cuts.length >= 2, 'and she cuts again later (' + c.cuts.length + ' cuts in two minutes): phase two keeps changing the room'); }
{ /* the deck you ride, before any ledge */
  const { c, e } = owlBox(2, { targets: [{ id: 'ledge-29', kind: 'ledge', x: 30 * 16 + 8, y: 224, top: 48 }, { id: 'cw-crown-e', kind: 'counter', x: 69 * 16, y: 144, top: 64, ridden: true }] });
  for (let i = 0; i < 60 * 12 && !c.cuts.length; i++) c.updateOwl(e, 1 / 60); assert.equal(c.cuts[0], 'cw-crown-e', 'she goes for the deck the hero rides first'); }
{ /* HER PERCH FALLS: a cut under her brings her down with it, OPEN, and a perch that is down is no seat */
  const { c, e, down } = owlBox(1); e.perches = [[42, 9], [54, 12], [65, 9]].map(([x, y]) => ({ x: x * 16 + 8, y: y * 16 })); e.perchI = 1; e.mode = 'sit'; e.modeT = 1; e.x = e.perches[1].x; e.y = e.perches[1].y;
  assert.equal(c.owlPerchCut(0), false, 'a cut perch she is not on leaves her be');
  assert.equal(c.owlPerchCut(1), true, 'a cut under her takes her'); assert.equal(e.mode, 'perchFall'); down.add(1);
  let t = 0; while (e.mode === 'perchFall' && t < 3) { c.updateOwl(e, 1 / 60); t += 1 / 60; }
  assert.equal(e.mode, 'perchDown', 'she lands in the planks'); assert(c.OWL_OPEN.includes('perchDown'), 'perchDown is an OPENING (the gold ring and bar, B10)');
  assert(e.hp < 100, 'the fall hurts her'); assert(c.owlTake(e) >= 1.8, 'and a blow on her there takes ' + c.owlTake(e) + 'x (about double)');
  const open = e.modeT; assert(open >= 2.4 && open <= 3.4, 'the opening lasts ' + open.toFixed(2) + ' s (about three)');
  while (e.mode === 'perchDown') c.updateOwl(e, 1 / 60); assert(e.ward > 0, 'and she gathers herself after (B3: a told ward)');
  for (let i = 0; i < 60 * 3 && e.mode !== 'sit'; i++) c.updateOwl(e, 1 / 60); assert(e.mode !== 'sit' || e.perchI !== 1, 'she does not sit on the perch that is down');
  down.add(0); down.add(2); e.mode = 'fly'; e.next = 0; e.modeT = 3; c.updateOwl(e, 1 / 60); assert.equal(e.mode, 'descend', 'with all three down she has NOWHERE TO SIT and comes down'); }
/* ---- 4. THE WEAVER'S ROOM (§5): a room, not a box. Thirty-eight wide against the fifty-five it was (A7); she starts where the door can see
   her; and her reel - which a hero on a net beats ("THE LINE HOLDS", src/main.js) - has nets in her room to beat it with (A12) ---- */
{ const M = L.mini, W0 = M.x0 / TS, W1 = M.x1 / TS, fy = M.floor / TS - 1, wv = L.ents.find(e => e.t === 'spider' && e.big && e.mini);
  assert.equal(M.boss, 'spider'); assert(W1 - W0 <= 40, 'the Weaver\'s room is ' + (W1 - W0) + ' wide: about forty (A7), it was fifty-five');
  assert(wv && wv.x > W0 && wv.x < W1 && Math.abs(wv.x - M.trigger / TS) <= 18, 'she hangs where the doorway can see her: within 18 tiles of where the fight starts');
  assert(/THE LINE HOLDS/.test(src) && /t === T\.NET \|\| t === T\.CLIMB/.test(src), 'a hero on a net beats her line');
  const R = floodReach({ ...L, START: { x: Math.round(M.trigger / TS) + 1, y: fy } }, T);
  const nets = []; for (let x = W0; x < W1; x++) for (let y = fy - 12; y <= fy; y++) if (at(x, y) === T.NET && R.seen.has(x + ',' + y)) { nets.push(x); break; }
  assert(new Set(nets).size >= 2, 'her room has nets a hero can reach from its floor (' + nets.join(',') + '): the answer to her line is in the room');
  let ledges = 0; for (let x = W0; x < W1; x++) for (let y = fy - 6; y < fy; y++) if (at(x, y + 1) === T.ONEWAY && R.seen.has(x + ',' + y)) ledges++;
  assert(ledges >= 6, 'and footing off her webbed boards (' + ledges + ' reachable ledge tiles)'); }
console.log('hanging-hoist  ' + decks.length + ' hoists (' + decks.map(m => m.hoist + (m.arena ? '*' : '') + ':' + (m.need || 1)).join(', ') + '), every well on the far side of its deck from its loads; the rules run; ' + ropes.length + ' ropes (' + [...kinds].join(', ') + '); the Reeve comes down with her perch, and cuts ropes told and fair in phase two only; the Weaver\'s room is ' + (L.mini.x1 - L.mini.x0) / TS + ' wide with its nets in reach.');
