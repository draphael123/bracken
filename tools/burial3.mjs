/* tools/burial3.mjs — THE BURIAL CAVERNS, ROUND 3 (claude/burial3, Daniel 2026-09-27). Node only; the page half is tools/burial3-keys.mjs.
   FAILS when:
     1. GRAVE HANDS rise inside a burning vent's light (96 px), or do not rise outside it; or are not told (a crack along the line first),
        or are not in phase one;
     2. GRAVE BREATH does not snuff every burning vent in the lair and the FIRE IN YOUR HAND, or comes before he is enraged, or the lair
        has no candle at a wall to take fire again;
     3. THE BURIED DEAD WEARS A CROWN: any pixel of the old crown's gold on his sprite, or on the effigy in the 'procession' backdrop;
     4. THE ARCADE WALK (the Drowned Ossuary's upper walkway) cannot be crossed by the reach model end to end, from its chain to the hoard,
        with every gap 3 tiles or less and no step up of more than one; or is not optional (the east pier must be reachable without it);
        or its hoard pays less than 8 coins (S7); or any ledge in the ossuary is still drawn as timber;
     5. A FLOATING BIER does not hold a moment and then sink under you, or does not come back up when you leave it;
     6. A DROWNED HAND grabs without a tell, misses a swimmer who stays over it, or reaches a hero on a pier. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { updateBuriedDead, HANDS, BREATH } from '../src/buried-dead.js';
import { VENT, stepBier, BIER, updateDrownedHands, DROWN } from '../src/burial-expansion.js';
import { WALK, BIERS, HANDS_AT, DESCENT } from '../src/burial-caverns.js';
import { floodReach } from '../src/reachcore.js';
import { install, newCanvas } from './node-canvas.mjs';
install();
const out = [];
const L = LEVELS.find(l => l.id === 'burial').build();
const A = { x0: 0, x1: 672, floor: 496 };
const boss = (mode, phase = 1) => ({ alive: true, hp: 100, hp0: 100, phase, mode, modeT: 0, x: 300, y: 496, anim: 0, turn: 0, markX: 320, face: 1 });
const run = (e, c, secs) => { for (let f = 0; f < secs * 60; f++) { e.hp = 100; updateBuriedDead(e, 1 / 60, c); } };
// 1. GRAVE HANDS
{ const lit = x => ({ x: Math.floor(x / 16), y: A.floor / 16, litT: 20, burnt: true, phase: 0, period: 3.4 });
  const trial = (px, vents) => { const P = { x: px, y: A.floor, dead: false }, hits = [], c = { P, A, hit: (...v) => hits.push(v), summon: () => {}, say: () => {}, sound: () => {}, vents };
    const e = boss('walk'); e.turn = 2; e.modeT = 0; updateBuriedDead(e, 1 / 60, c);   /* phase one's third turn */
    const told = e.mode === 'handsTell' && e.handLine && e.handLine.t < 0 && e.handLine.arms.every(a => Math.sign(a.x - e.x) === Math.sign(px - e.x));
    for (let f = 0; f < 60 * 3; f++) { P.x = px; updateBuriedDead(e, 1 / 60, c); } return { told, hits: hits.length, hard: hits[0] && hits[0][2] }; };
  const open = trial(420, []), inLight = trial(420, [lit(420)]), past = trial(560, [lit(420)]);
  assert(open.told, 'GRAVE HANDS is not phase one\'s third turn, or is not told along the line towards the hero: ' + JSON.stringify(open));
  assert.equal(open.hits, 1, 'the arms did not reach a hero standing on the line'); assert.equal(open.hard, true, 'the arms must be unblockable: your feet are the answer');
  assert.equal(inLight.hits, 0, 'GRAVE HANDS rose inside a burning vent\'s light (' + VENT.light + ' px)');
  assert.equal(past.hits, 1, 'past the vent\'s light the arms must come up again');
  { const P = { x: 420, y: A.floor - HANDS.high - 4, dead: false }, hits = [], c = { P, A, hit: () => hits.push(1), summon: () => {}, say: () => {}, sound: () => {}, vents: [] }; const e = boss('walk'); e.turn = 2; e.modeT = 0;
    for (let f = 0; f < 60 * 3; f++) updateBuriedDead(e, 1 / 60, c); assert.equal(hits.length, 0, 'a jump (' + (HANDS.high + 4) + ' px up) does not clear the arms'); }
  out.push('GRAVE HANDS: told ' + HANDS.tell + ' s along the line, unblockable, none in a lit vent\'s light, cleared by a jump'); }
// 2. GRAVE BREATH
{ const vents = [80, 300, 560].map(x => ({ x: Math.floor(x / 16), y: A.floor / 16, litT: 15, burnt: true, phase: 0, period: 3.4 }));
  const P = { x: 600, y: A.floor, dead: false, candle: 10 }, hits = [], c = { P, A, hit: (...v) => hits.push(v), summon: () => {}, say: () => {}, sound: () => {}, vents };
  const e = boss('breathTell', 2); e.modeT = 0; updateBuriedDead(e, 1 / 60, c); run(e, c, 3);
  assert.deepEqual(vents.map(v => v.litT), [0, 0, 0], 'GRAVE BREATH left a vent burning: ' + vents.map(v => v.litT));
  assert.equal(P.candle, 0, 'GRAVE BREATH did not put out the fire in your hand');
  assert(vents.every(v => !v.burnt), 'a snuffed vent must be lightable again');
  const seen1 = new Set(), seen2 = new Set(), c2 = { ...c, vents: [] };
  for (const [ph, seen] of [[1, seen1], [2, seen2]]) { const b = boss('walk', ph); for (let f = 0; f < 60 * 90; f++) { b.hp = ph === 1 ? 100 : 40; updateBuriedDead(b, 1 / 60, c2); seen.add(b.mode); } }
  assert(!seen1.has('breathTell') && seen2.has('breathTell'), 'GRAVE BREATH is phase two\'s, and only phase two\'s (A10)');
  assert(seen1.has('handsTell') && seen2.has('handsTell'), 'GRAVE HANDS in both phases');
  const Ar = L.arena, cand = (L.candles || []).filter(k => k.x * 16 >= Ar.x0 && k.x * 16 < Ar.x1);
  assert(cand.some(k => k.x * 16 < Ar.x0 + 64) && cand.some(k => k.x * 16 > Ar.x1 - 80), 'the lair needs a candle at each wall to relight from');
  out.push('GRAVE BREATH: snuffs ' + vents.length + ' vents and the hand, phase two only, candles at both walls'); }
// 3. NO CROWN
{ const OLD = [[0x8a, 0x6a, 0x2a], [0xd4, 0xa8, 0x4a], [0x5a, 0x44, 0x18], [0xa8, 0x9a, 0x5a]];   /* the crown's gold, its shine and shade; the effigy's crown */
  const count = d => { let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && OLD.some(([r, g, b]) => d[i] === r && d[i + 1] === g && d[i + 2] === b)) n++; return n; };
  const { bakeBuriedDeadKing } = await import('../src/buried-dead-art.js'); const S = bakeBuriedDeadKing(); let spr = 0; for (const c of S.R) spr += count(c._d);
  assert.equal(spr, 0, 'THE BURIED DEAD still wears his crown: ' + spr + ' crown-gold pixels on his sprite');
  const { paintBurialRoom } = await import('../src/burial-looks.js'); const cv = newCanvas(400, 240), g = cv.getContext('2d'); for (const k of ['beginPath', 'ellipse', 'fill', 'stroke', 'moveTo', 'quadraticCurveTo']) g[k] = () => {};   /* the niche's round head is a path; the crown was rects, and rects are all this counts */ paintBurialRoom(g, 'procession', 0, 0, 400, 240, 0, 0, 0);
  const eff = count(g.getImageData(0, 0, 400, 240).data); assert.equal(eff, 0, 'the effigy in the procession backdrop is still crowned: ' + eff + ' px');
  out.push('no crown: 0 px on ' + S.R.length + ' frames and on the procession'); }
// 4. THE ARCADE WALK
{ const at = (x, y) => L.grid[y * L.W + x], segs = WALK.segs;
  for (const [a, b, row] of segs) for (let x = a; x <= b; x++) assert.equal(at(x, row), T.ONEWAY, 'the walk has a hole at ' + x + ',' + row);
  for (let i = 1; i < segs.length; i++) { const gap = segs[i][0] - segs[i - 1][1] - 1, up = segs[i - 1][2] - segs[i][2];
    assert(gap >= 1 && gap <= 3 && up <= 1, 'the walk\'s gap before ' + segs[i][0] + ' is ' + gap + ' tiles, up ' + up + ' (a real jump is 3.2 at worst)'); }
  for (let y = WALK.top; y <= DESCENT.pier + 1; y++) assert.equal(at(WALK.chain, y), T.NET, 'the chain up to the walk is broken at row ' + y);
  const seen = floodReach(L, T, { rides: true }).seen, stand = ([a, b, row]) => { for (let x = a; x <= b; x++) if (!seen.has(x + ',' + (row - 1))) return x; return null; };
  for (const s of segs) assert.equal(stand(s), null, 'the reach model cannot stand on the walk at ' + stand(s) + ',' + (s[2] - 1));
  const last = segs[segs.length - 1], hoard = L.ents.filter(e => e.t === 'coin' && e.x >= last[0] && e.x <= last[1] && e.y < last[2]).length;
  assert(hoard >= 8, 'the walk\'s hoard pays ' + hoard + ' coins (S7: 8 or more)');
  /* OPTIONAL: take the walk out, and the east pier is still reached */
  const L2 = { ...L, grid: L.grid.slice() }; for (const [a, b, row] of segs) for (let x = a; x <= b; x++) L2.grid[row * L.W + x] = T.AIR; for (let y = WALK.top; y <= DESCENT.pier + 1; y++) L2.grid[y * L.W + WALK.chain] = T.AIR;
  const seen2 = floodReach(L2, T, { rides: true }).seen; assert(seen2.has(DESCENT.piers[1][0] + 1 + ',' + (DESCENT.pier - 1)), 'without the walk the east pier cannot be reached: it is not optional');
  const zones = L.ledgeZones || []; let wood = 0; const [ox0, ox1, oy0, oy1] = DESCENT.oss;
  for (let y = oy0; y <= oy1; y++) for (let x = ox0; x <= ox1; x++) if (at(x, y) === T.ONEWAY && !zones.some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3] && z[4] === 'cryptStone')) wood++;
  assert.equal(wood, 0, wood + ' ledge tiles in the Drowned Ossuary are still the mine\'s staging (wood)');
  assert(!L.structures.some(z => z.kind === 'arch' && z.x0 >= ox0 && z.x1 <= ox1 && z.top >= oy0), 'a timber-post arch still stands in the ossuary');
  out.push('THE ARCADE WALK: ' + segs.length + ' stone ledges, gaps <= 3, reached end to end, optional, hoard ' + hoard); }
// 5. FLOATING BIERS
{ assert(BIERS.length >= 8 && (L.moversExtra || []).filter(m => m.bier).length === BIERS.length, 'the black water has ' + (L.moversExtra || []).filter(m => m.bier).length + ' biers');
  const m = { bier: true, y: 1050, y0: 1050, w: 32, h: 8 }; let t = 0; const step = (on, s) => { for (let f = 0; f < s * 60; f++) { stepBier(m, on, 1 / 60, t); t += 1 / 60; } };
  step(false, 4); assert(Math.abs(m.y - m.y0) <= 1, 'an empty bier does not stay afloat');
  step(true, BIER.hold - 0.1); assert(m.y - m.y0 <= 1, 'a bier sank at once: it must hold a moment (' + BIER.hold + ' s)');
  step(true, 1.2); assert(m.y - m.y0 >= BIER.depth - 1, 'a bier stood on did not go under: ' + (m.y - m.y0) + ' px');
  step(false, BIER.back + BIER.depth / BIER.riseV + 1); assert(Math.abs(m.y - m.y0) <= 1 && m.state === 'float', 'a bier left on the bottom did not come back up: ' + m.state + ' ' + (m.y - m.y0));
  out.push(BIERS.length + ' biers: hold ' + BIER.hold + ' s, then under ' + BIER.depth + ' px, back up when left'); }
// 6. DROWNED HANDS
{ assert(HANDS_AT.length >= 5 && (L.drownedHands || []).length === HANDS_AT.length, 'drowned hands: ' + (L.drownedHands || []).length);
  const H = () => ({ drownedHands: [{ x: 400, y: 1056 }] }), sim = (Lh, P, s, move) => { const ev = []; for (let f = 0; f < s * 60; f++) { if (move) move(P, f); updateDrownedHands(Lh, P, 1 / 60, { tell: () => ev.push(['tell', f]), grab: () => ev.push(['grab', f]) }); } return ev; };
  const stay = sim(H(), { x: 404, y: 1070, swim: true }, 2);
  assert(stay[0] && stay[0][0] === 'tell' && stay.some(e => e[0] === 'grab'), 'a swimmer over a hand is not grabbed, or not told first: ' + JSON.stringify(stay));
  assert(stay.find(e => e[0] === 'grab')[1] - stay[0][1] >= DROWN.tell * 60 - 2, 'the grab came before its tell ran out');
  const left = sim(H(), { x: 404, y: 1070, swim: true }, 2, (P, f) => { if (f === 20) P.x = 470; });
  assert(!left.some(e => e[0] === 'grab'), 'a swimmer who left on the tell was grabbed anyway');
  const bier = sim(H(), { x: 404, y: 1050, swim: false }, 2); assert(bier.some(e => e[0] === 'grab'), 'a hero on a bier at the surface is out of the hands\' reach');
  const pier = sim(H(), { x: 404, y: 1024, swim: false }, 2); assert.equal(pier.length, 0, 'a hand reached a hero on a pier');
  out.push(HANDS_AT.length + ' drowned hands: told ' + DROWN.tell + ' s, grab who stays, not who leaves, not on a pier'); }
console.log('burial3  ' + out.join('; '));
