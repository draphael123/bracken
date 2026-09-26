/* tools/deep-rework.mjs — THE DEEP, REWORKED (docs/briefs/deep-rework-2.md), held to what it says:
     THE HOLDS     no hold in the Wreck Stack, the Kelp Forest or the Coral Garden is the one orlop any more: each depth's are its own
                   kind (cargo hold, galley, gun deck), and each paint is fixed to its room, not the camera, and clipped to it
     THE STRAKE    every deck board in the Deep laid on a slab with water under it has HULL under it: that slab is in L.hullZones (B9,
                   rule N) - the rule, for every deck, not the review's one screenshot
     THE SHIP      THE SUNK TRIBUTE SHIP's band is in the level (+44 rows), each of her decks runs wall to wall so a hatch is the only
                   way down, every hatch blows hot across its whole width, and every deck with a hatch has a stone on it to carry down
     THE KNIGHTS   drowned knights in the Deep (Daniel: "they'll also be in the Deep level"), each by a hatch or a throat (S1), and no
                   Drowned Captain: he is the Keep's new foe (F10) and would not be if the Deep met him first
     THE RACKS     the Bell Grave hangs stone racks over his floor (A12): each platform hung by rope to the rock (B9), high enough over
                   the floor that he stands under it, and its stone a rack's
     THE BELL      updateBellcrab vents in exactly one place (the crown valve); every attack he makes, forced and left alone, leaves him
                   shut; a stone on his crown opens him; at half THE PRISE POUR OUT (told, once, topped up after a vent) and swim for
                   the stone in your hands; at a third of his health he CRACKS, comes out (his own frame table, smaller,
                   soft) and his three told attacks of phase three each land when forced (A1, A11) */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { LEVELS, T } from '../src/level.js';
import { HOLD_KINDS, paintHold } from '../src/deep-holds.js';
import { HOLD_BANDS, SHIP, RACKS } from '../src/tribute-ship.js';
import { BELL, BELL_OUT_F } from '../src/bellcrab.js';

const L = LEVELS.find(l => l.id === 'deep').build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
const inHull = (x, y) => (L.hullZones || []).some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);

// ---- THE HOLDS ----
for (const b of HOLD_BANDS) {
  const rooms = L.interiors.filter(r => r[2] >= b.y0 && r[2] <= b.y1);
  assert.ok(rooms.length >= 3, b.kind + ': the band has its holds (' + rooms.length + ')');
  for (const r of rooms) assert.equal(r[4], b.kind, 'the hold at ' + r.slice(0, 4) + ' is a ' + b.kind + ', not ' + r[4]);
}
assert.ok(!L.interiors.some(r => r[4] === 'ship' && r[2] >= 34 && r[2] <= 157), 'no middle hold is the old orlop');
for (const st of HOLD_KINDS) {
  let calls = [];
  const g = new Proxy({}, { set(o, k, v) { o[k] = v; calls.push([k, v]); return true; }, get(o, k) { return o[k] ?? ((...a) => { calls.push([k, ...a]); }); } });
  const paint = (sx, sy) => { calls = []; assert.ok(paintHold(g, st, sx, sy, 464, 64, 31, 38, 4), st + ' is painted'); return calls.filter(c => c[0] === 'fillRect').map(c => [c[1] - sx, c[2] - sy, c[3], c[4]]); };
  const a = paint(0, 0), b = paint(-117, -53);
  assert.deepEqual(a, b, st + ' is fixed to its room, not the camera');
  assert.ok(a.length > 60, st + ' has a room in it (' + a.length + ' marks)');
  for (const [x, y, w, h] of a) assert.ok(x < 464 && x + w > 0 && y < 64 && y + h > 0, st + ' paints nothing wholly outside its room (a pattern may cross the edge; drawRoom clips it): ' + [x, y, w, h]);
}
assert.equal(paintHold({}, 'ship', 0, 0, 10, 10, 0, 0, 0), false, 'any other room is main.js\'s to paint');

// ---- THE STRAKE: the rule, every deck ----
{ const bad = [];
  for (let y = 0; y < L.H - 1; y++) for (let x = 0; x < W; x++) if (at(x, y) === T.PLANK && at(x, y + 1) === T.SOLID && x >= 6 && x <= 105 && !inHull(x, y + 1)) { let n = 0; while (n < 5 && at(x, y + 1 + n) === T.SOLID) n++; if (n <= 3) bad.push(x + ',' + y); }   /* a deck on a slab three rows thick or less, with water under it, is a SHIP's deck; a dock on the shelf rock is not */
  assert.deepEqual(bad.slice(0, 12), [], bad.length + ' deck board(s) in the trench laid on rock, not on a hull strake (B9, rule N)'); }

// ---- THE SHIP ----
const Y = SHIP.at, zone = L.deep.zones.find(z => z.name === 'THE TRIBUTE SHIP');
assert.ok(zone && zone.y0 === Y && zone.y1 === Y + SHIP.rows - 1, 'the tribute ship\'s band is in the level');
assert.equal(L.H, 204 + SHIP.rows, 'the Deep is ' + SHIP.rows + ' rows deeper (+' + Math.round(SHIP.rows / 189 * 100) + '% of its descent)');
for (const [a, b, dy] of SHIP.hatches) {
  const deck = Y + dy;
  for (let x = SHIP.x0; x <= SHIP.x1; x++) { const open = x >= a && x <= b; assert.equal(at(x, deck) === T.AIR, open, 'deck ' + deck + ' at ' + x + (open ? ' is the hatch' : ' is deck')); }
  assert.ok(at(SHIP.x0 - 1, deck) === T.SOLID && at(SHIP.x1 + 1, deck) === T.SOLID, 'deck ' + deck + ' is wedged wall to wall');
  const hot = L.deep.currents.find(c => c.kind === 'hot' && c.x0 <= a && c.x1 >= b && c.y0 <= deck - 2 && c.y1 >= deck + 3 && c.fy < -100);
  assert.ok(hot, 'the hatch at ' + a + '-' + b + ' blows hot across its whole width');
  const stones = L.ents.filter(e => e.t === 'ballast' && e.y === deck - 1 && e.x >= SHIP.x0 && e.x <= SHIP.x1);
  for (const st of stones) { assert.ok(st.rack, 'the stone at ' + st.x + ' over a hatch is racked: it goes home, so the deck is never left without one');
    assert.notEqual(at(st.x, st.y), T.SOLID, 'the stone at ' + st.x + ',' + st.y + ' is not inside the timber');
    for (let x = Math.min(st.x, a); x <= Math.max(st.x, b); x++) assert.ok(at(x, deck - 1) !== T.SOLID && at(x, deck - 2) !== T.SOLID, 'nothing a heavy hero cannot climb between the stone at ' + st.x + ' and the hatch at ' + a + ' (' + x + ')'); }
  assert.ok(stones.length >= 2, 'the deck over the hatch at ' + a + '-' + b + ' has stones to carry down it (' + stones.length + ')');
}
{ const [a, b] = SHIP.breach, keel = Y + SHIP.rows - 5; for (let x = a; x <= b; x++) assert.equal(at(x, keel), T.AIR, 'her bilge is stove in at ' + x); }
assert.ok(L.ents.filter(e => e.t === 'check' && e.y >= Y && e.y < Y + SHIP.rows).length >= 3, 'the ship carries its checkpoints');

/* AND THE WAY THROUGH HER IS OPEN: a body two tiles tall floods from the start to the Bell Grave's door (the first cut stood a mast from her deck
   to the rock and sealed the throat's landing off from the rest of her; tools/breath.mjs saw it as 'not reachable through the water') */
{ const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const open = (x, y) => !solid(at(x, y)) && !solid(at(x, y - 1)), seen = new Uint8Array(W * L.H), q = [[L.START.x, L.START.y]]; seen[L.START.y * W + L.START.x] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 1 || nx >= W || ny >= L.H || seen[ny * W + nx] || !open(nx, ny)) continue; seen[ny * W + nx] = 1; q.push([nx, ny]); } }
  const door = [Math.floor(L.arena.x0 / 16) - 3, Math.floor(L.arena.floor / 16) - 1]; assert.ok(seen[door[1] * W + door[0]], 'the Bell Grave\'s door is open water from the start');
  for (const [a, b, dy] of SHIP.hatches) assert.ok([a, b].some(x => seen[(Y + dy) * W + x]), 'the hatch at ' + a + '-' + b + ' is reached'); }

// ---- THE KNIGHTS ----
{ const dk = L.ents.filter(e => e.t === 'drownedknight'), openings = [...SHIP.hatches.map(([a, b, dy]) => [(a + b) / 2, Y + dy]), [18, 151], [78, 73], [34, 113]];
  assert.ok(dk.length >= 3 && dk.length <= 5, 'a few drowned knights in the Deep: ' + dk.length);
  assert.ok(!L.ents.some(e => e.t === 'drownedcaptain'), 'the Drowned Captain stays the Keep\'s new foe (F10)');
  for (const e of dk) { assert.notEqual(at(e.x, e.y), T.SOLID, 'knight in rock at ' + e.x + ',' + e.y);
    assert.ok(openings.some(([x, y]) => Math.abs(e.x - x) <= 6 && Math.abs(e.y - y) <= 12), 'S1: the knight at ' + e.x + ',' + e.y + ' guards a hatch or a throat'); } }

// ---- THE RACKS ----
{ const A = L.arena, top = Math.round(A.y0 / 16), floorRow = Math.round(A.floor / 16);
  const racks = L.ents.filter(e => e.t === 'ballast' && e.rack && e.rope);
  assert.equal(racks.length, RACKS.length, 'a stone a rack');
  for (const [a, b] of RACKS) { let row = -1; for (let y = top; y < floorRow; y++) if (at(a, y) === T.PLANK) { row = y; break; }
    assert.ok(row > 0, 'the rack at ' + a + ' has a platform');
    assert.ok(floorRow - row >= 5, 'high enough that he stands under it (' + (floorRow - row) + ' rows)');
    for (let y = row + 1; y < floorRow; y++) for (let x = a; x <= b; x++) assert.equal(at(x, y), T.AIR, 'open water under the rack at ' + x + ',' + y);
    const hung = racks.find(s => s.x >= a && s.x <= b && s.rope);
    assert.ok(hung && hung.rope[0] === a && hung.rope[1] === b, 'B9: the rack is hung by rope from both its ends');
    assert.equal(at(a, hung.rope[2] - 1), T.SOLID, 'and the rope is tied to rock');
    for (const x of [a, b]) for (let y = hung.rope[2]; y < row; y++) assert.equal(at(x, y), T.AIR, 'the rope is drawn, not a ladder tile, at ' + x + ',' + y);
    assert.ok(racks.some(s => s.x >= a && s.x <= b && s.y === row - 1), 'its stone is on it'); } }

// ---- THE BELL ----
const s = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const fn = s.slice(s.indexOf('function updateBellcrab('), s.indexOf('function drawBellcrabMarks('));
assert.equal(fn.split('vent();').length - 1, 1, 'A11: he vents in exactly one place (the crown valve), not after every attack');
const noop = () => {}, hits = [];
const c = vm.createContext({ BELL, props: [], enemies: [], TS: 16, spawnEnt: q => c.enemies.push({ ...q, alive: true, x: q.x * 16 + 8, y: (q.y + 1) * 16 }), L: { arena: { x0: 0, x1: 640, floor: 320 } }, P: { x: 330, y: 320, dead: false },
  DMG: { bellClaw: 26, bellSlam: 34, bellPressure: 24, bellCharge: 32, bellSnip: 18, bellLeap: 24 }, SFX: new Proxy({}, { get: () => noop }),
  number: noop, shakeCam: noop, ringAt: noop, burst: noop, moveBody: () => ({ ground: true }), damagePlayer: (x, d, o) => hits.push({ x, d, o }) });
vm.runInContext(fn, c);
const bell = (mode, o) => ({ x: 300, y: 320, vx: 0, vy: 0, face: 1, phase: 1, mode, modeT: 0, open: 0, turn: 0, hit: false, bellMark: { x: 330, y: 310 }, w: 42, h: 43, hp: 750, maxHp: 750, ...(o || {}) });
for (const m of ['clawTell', 'ballastTell', 'pressureTell', 'scuttle']) { const e = bell(m); for (let i = 0; i < 300; i++) c.updateBellcrab(e, 0.01); assert.ok(!(e.open > 0), m + ' left alone leaves him shut'); }
{ const e = bell('idle', { modeT: 9 }); c.props.push({ t: 'ballast', x: 301, y: 320 - 43 - 3, vy: 70, held: false }); c.updateBellcrab(e, 0.01);
  assert.equal(e.mode, 'vent'); assert.ok(e.open >= BELL.ventT - 0.02, 'a stone on his crown opens him for ' + BELL.ventT + ' s'); c.props.length = 0; }
{ const e = bell('idle', { modeT: 9 }); c.props.push({ t: 'ballast', x: 301, y: 320 - 43 - 3, vy: 70, held: true }); c.updateBellcrab(e, 0.01);
  assert.notEqual(e.mode, 'vent', 'a stone still in your hands opens nothing: it has to be let go'); c.props.length = 0; }
/* PHASE TWO (Daniel, 2026-09-25): THE PRISE POUR OUT OF HIS BELL - told, then a brood that goes for your stone, topped up after a vent */
{ c.enemies.length = 0; const e = bell('idle', { modeT: 9, phase: 2, hp: 370 }); c.updateBellcrab(e, 0.01);
  assert.equal(e.mode, 'broodTell', 'at half health his rim lifts first: the brood is TOLD'); assert.equal(c.enemies.length, 0, 'and nothing has come out yet');
  for (let i = 0; i < 130 && !c.enemies.length; i++) c.updateBellcrab(e, 0.01);
  assert.equal(c.enemies.filter(q => q.t === 'prise' && q.brood).length, BELL.brood.n, 'then ' + BELL.brood.n + ' prise pour out');
  for (let i = 0; i < 300; i++) c.updateBellcrab(e, 0.01); assert.equal(c.enemies.length, BELL.brood.n, 'once only: they do not keep coming on his clock');
  c.enemies.forEach(q => { q.alive = false; }); e.mode = 'vent'; e.modeT = 0.01; c.updateBellcrab(e, 0.02);
  assert.equal(c.enemies.filter(q => q.alive && q.brood).length, BELL.brood.keep, 'a vent in phase two tops the brood back up to ' + BELL.brood.keep);
  const p1 = bell('idle', { modeT: 9 }); c.enemies.length = 0; for (let i = 0; i < 200; i++) c.updateBellcrab(p1, 0.01); assert.equal(c.enemies.length, 0, 'phase one pours nothing'); c.enemies.length = 0; }
/* AND THE BROOD SWIMS FOR THE STONE: a brood prise rises to a carrier over it; a plain prise does not */
{ const pf = s.slice(s.indexOf('function updatePrise('), s.indexOf('\n}', s.indexOf('function updatePrise(')) + 2);
  const cx = vm.createContext({ BELL, P: { x: 200, y: 100, swim: true, ballast: {}, dead: false }, time: 0, SFX: new Proxy({}, { get: () => noop }), number: noop, shakeCam: noop, damagePlayer: noop, dropBallast: noop, DMG: {},
    moveBody: (q, dx, dy) => { q.x += dx; q.y += dy; return { ground: false }; } });
  vm.runInContext(pf, cx);
  const pr = o => ({ t: 'prise', x: 180, y: 200, vx: 0, vy: 0, mode: 'walk', modeT: 1, hitT: 0, snapT: 2, home: 180, ...o });
  const b = pr({ brood: true }), w = pr({}); for (let i = 0; i < 120; i++) { cx.updatePrise(b, 1 / 60); cx.updatePrise(w, 1 / 60); }
  assert.ok(b.y < 150, 'a brood prise swims up to the stone in your hands (' + Math.round(b.y) + ')'); assert.ok(w.y >= 200, 'a plain prise stays on its floor'); }
/* PHASE THREE: the crack, and what comes out */
{ const e = bell('idle', { modeT: 9, phase: 2, hp: 240 }); c.updateBellcrab(e, 0.01); assert.equal(e.mode, 'crack', 'at a third of his health the bell cracks');
  for (let i = 0; i < 140; i++) c.updateBellcrab(e, 0.01);
  assert.equal(e.phase, 3, 'and he comes out'); assert.ok(e.shell, 'leaving the bell on the floor'); assert.equal(e.w, BELL.out.w); assert.equal(e.h, BELL.out.h);
  assert.ok(BELL.out.soft > 1 && BELL.out.run > BELL.walk2 * 1.5, 'soft, and fast'); }
for (const [m, near] of [['snipTell', 20], ['leapTell', 0], ['scuttleTell', 10]]) {
  hits.length = 0; c.P.x = 300 + near; const e = bell(m, { phase: 3, w: 30, h: 22, leapX: 300 + near }); for (let i = 0; i < 160 && !hits.length; i++) c.updateBellcrab(e, 0.01);
  assert.ok(hits.length >= 1, 'phase three: ' + m + ' lands when forced'); }
c.P.x = 330;
for (const k of ['snipTell', 'snip', 'scuttleTell', 'scuttle', 'leapTell', 'leap', 'hurt']) assert.ok(Number.isInteger(BELL_OUT_F[k]), 'his own frame for ' + k);
assert.equal(BELL_OUT_F.hurt, 8, 'the hurt frame is his set\'s last');
console.log('THE DEEP, REWORKED: ' + HOLD_KINDS.length + ' hold kinds (' + HOLD_KINDS.join(', ') + '), every deck on a strake, the tribute ship (+' + SHIP.rows + ' rows, ' + SHIP.hatches.length +
  ' hot hatches), ' + L.ents.filter(e => e.t === 'drownedknight').length + ' drowned knights by the ways down, ' + RACKS.length + ' hung stone racks, and a Bell that opens only to a stone, pours out his prise at half and cracks at a third.');
