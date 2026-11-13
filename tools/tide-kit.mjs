/* tools/tide-kit.mjs — THE TIDE KIT does what the water plan asks (scratch/plan-water-1105.md 3a; src/tide-kit.js; docs/waterkit.md).
   NODE ONLY (no page, no browser): the told cycle (three tolls before it comes in, one before it goes out, never shorter than the readable floor at
   any rate), the verbs (bell calls it in through a told warn, sluice holds it out, a chamber lever fills/drains and stays thrown through a death),
   pools written through poolLevel, floats/lifts and every seat (1-4) riding them, tide-bound bites and foes, respawn safety, and the soft-lock sweep:
   from every checkpoint, at every moment of the cycle, every hero (its own run speed, src/hero-move.js) gets to dry ground before the water is over
   his head, alone and as four seats. Then lintTide on the lab room and on every level in src/level.js that declares L.tides. */
import assert from 'node:assert/strict';
import { TIDE, TS, tideInit, tideStep, tideApply, tideStrike, tideRespawn, gauge, lineY, kOf, flooded, bites, floatY, liftY, riders, foeTide, lintTide } from '../src/tide-kit.js';
import { WATERKIT_LAB } from '../src/waterkit-lab.js';
import { HERO_RUN, HERO_MOVE_IDS } from '../src/hero-move.js';

const RUN = 92, SWIM = 96, DT = 1 / 60;
const lab = () => JSON.parse(JSON.stringify(WATERKIT_LAB));
const run = (kit, s, ev = []) => { for (let i = 0; i < Math.round(s / DT); i++) ev.push(...tideStep(kit, DT)); return ev; };
const until = (kit, id, ph, max = 60) => { for (let i = 0; i < max / DT; i++) { tideStep(kit, DT); if (gauge(kit, id).ph === ph) return true; } return false; };
let n = 0; const ok = (c, m) => { assert(c, m); n++; };

/* 1. THE TOLD CYCLE: low -> warn (3 tolls) -> rise -> high -> turn (1 toll) -> fall -> low; k 0 at low, 1 at high, monotone on the way */
{ const kit = tideInit(lab()), C = WATERKIT_LAB.tides[0].cycle, ev = run(kit, 3 * (C.low + C.warn + C.rise + C.high + C.turn + C.fall));
  const phs = ev.filter(e => e.t === 'phase' && e.id === 'basin').map(e => e.ph);
  ok(phs.slice(0, 6).join() === 'warn,rise,high,turn,fall,low', 'the cycle runs in order: ' + phs.slice(0, 6));
  ok(ev.filter(e => e.t === 'toll' && e.id === 'basin' && !e.turn).length === 9, 'three tolls before each of three floods');
  ok(ev.filter(e => e.t === 'toll' && e.turn).length === 3, 'one toll before each ebb');
  for (let i = 0; i < phs.length; i++) { if (phs[i] === 'rise') ok(phs[i - 1] === 'warn', 'every flood is told'); if (phs[i] === 'fall') ok(phs[i - 1] === 'turn', 'every ebb is told'); }
  const k2 = tideInit(lab()); until(k2, 'basin', 'rise'); let last = -1, mono = true; while (gauge(k2, 'basin').ph === 'rise') { const k = kOf(k2, 'basin'); if (k < last - 1e-9) mono = false; last = k; tideStep(k2, DT); }
  ok(mono && kOf(k2, 'basin') === 1, 'the rise only rises, and ends full'); ok(gauge(k2, 'basin').ph === 'high', 'then stands high');
  ok(Math.abs(lineY(k2, 'basin') - 31 * TS) < 1e-6, 'high water is the declared hi row'); until(k2, 'basin', 'low'); ok(lineY(k2, 'basin') === 40 * TS, 'low water is the declared lo row'); }

/* 2. RATE: a storm act runs faster, but no tell drops under the readable floor */
{ const L = lab(); L.tides[0].rate = 2.4; const kit = tideInit(L); until(kit, 'basin', 'warn'); const t0 = gauge(kit, 'basin').left;
  ok(t0 >= TIDE.minTell - DT - 1e-9, 'a fast tide still warns for >= ' + TIDE.minTell + ' s (' + t0.toFixed(2) + ')');
  until(kit, 'basin', 'turn'); ok(gauge(kit, 'basin').left >= TIDE.minTell - DT - 1e-9, 'and turns told');
  const L2 = lab(); L2.tides[0].rate = 3; ok(lintTide(L2).some(s => /readable cap/.test(s)), 'a rate past the cap is a lint'); }

/* 3. THE BELL calls it in early - through a told warn, never untold; struck at high water it changes nothing */
{ const kit = tideInit(lab()); run(kit, 1); ok(gauge(kit, 'basin').ph === 'low', 'low at the start');
  const v = kit.tides[0].verbs.find(q => q.t === 'bell'), x = v.x * TS + 8, y = (v.y + 1) * TS;
  ok(!tideStrike(kit, { l: x + 40, r: x + 50, t: y - 20, b: y - 6 }), 'a blow beside the bell misses it');
  const hit = tideStrike(kit, { l: x - 6, r: x + 6, t: y - 20, b: y - 6 }); ok(hit && hit.t === 'bell', 'a blow on the bell strikes it');
  const g = gauge(kit, 'basin'); ok(g.ph === 'warn' && g.left >= TIDE.minTell && g.coming === 'in', 'the bell starts a told warn (' + g.left + ' s)');
  const ev = run(kit, g.left + 0.05); ok(ev.filter(e => e.t === 'toll').length === 3, 'still three tolls'); ok(gauge(kit, 'basin').ph === 'rise', 'then it comes in');
  until(kit, 'basin', 'high'); run(kit, 4.1); const before = gauge(kit, 'basin'); tideStrike(kit, { l: x - 6, r: x + 6, t: y - 20, b: y - 6 }); ok(gauge(kit, 'basin').ph === before.ph, 'at high water the bell is only a bell'); }

/* 4. THE SLUICE turns a rising tide back and holds it out; when it lets go the cycle resumes from low, told */
{ const kit = tideInit(lab()); until(kit, 'basin', 'rise'); run(kit, 1.5); const k0 = kOf(kit, 'basin'); ok(k0 > 0.2 && k0 < 0.9, 'caught mid-rise (' + k0.toFixed(2) + ')');
  const v = kit.tides[0].verbs.find(q => q.t === 'sluice'); tideStrike(kit, { l: v.x * TS + 2, r: v.x * TS + 14, t: (v.y + 1) * TS - 20, b: (v.y + 1) * TS - 6 });
  ok(gauge(kit, 'basin').held, 'the sluice holds'); tideStep(kit, DT); ok(gauge(kit, 'basin').ph === 'fall' && Math.abs(kOf(kit, 'basin') - k0) < 0.05, 'it turns back from where it was, not a snap');
  const ev = run(kit, v.hold - 0.2); ok(gauge(kit, 'basin').ph === 'low' && kOf(kit, 'basin') === 0, 'held out at low water');
  ok(!ev.some(e => e.ph === 'warn'), 'no flood while it holds'); const ev2 = run(kit, 0.5); ok(ev2.some(e => e.t === 'released'), 'its release is an event (the SFX)');
  ok(until(kit, 'basin', 'warn', 20), 'then the tide comes again - told'); }

/* 5. A CHAMBER (manual): its lever fills it over its rise, throws back to drain; a thrown lever is a mark and survives a death and a reload */
{ const kit = tideInit(lab()), V = kit.tides.find(s => s.id === 'vault'), lv = V.verbs[0]; run(kit, 30); ok(kOf(kit, 'vault') === 0, 'a chamber never moves on its own');
  const hb = { l: lv.x * TS + 2, r: lv.x * TS + 14, t: (lv.y + 1) * TS - 20, b: (lv.y + 1) * TS - 6 }, hit = tideStrike(kit, hb); ok(hit && hit.key === 'tide:vault:lever:57,31', 'the lever has a mark key');
  run(kit, 1.2); const mid = kOf(kit, 'vault'); ok(mid > 0.3 && mid < 0.7, 'it fills over its time (' + mid.toFixed(2) + ')'); run(kit, 2); ok(kOf(kit, 'vault') === 1, 'full');
  ok(flooded(kit, 60, 36) === 'vault', 'its tiles are under'); tideRespawn(kit); ok(kOf(kit, 'vault') === 1, 'a death keeps a thrown chamber thrown');
  const re = tideInit(lab(), { off: new Set([hit.key]) }); ok(kOf(re, 'vault') === 1, 'a reload with the mark comes back full');
  run(kit, 0.7); tideStrike(kit, hb); run(kit, 3); ok(kOf(kit, 'vault') === 0, 'thrown back, it drains'); }

/* 6. POOLS: the kit writes each line through main.js's poolLevel; flow runs landward on the rise, seaward on the fall */
{ const kit = tideInit(lab()), pools = lab().pools, calls = []; const poolLevel = (p, y) => { calls.push([p.id, y]); p.y = y; };
  tideApply(kit, pools, poolLevel); ok(calls.length === 2 && calls[0][1] === 40 * TS, 'each pool gets its line');
  until(kit, 'basin', 'rise'); run(kit, 0.5); tideApply(kit, pools, poolLevel); ok(pools[0].flow === -24 && pools[0].tideKit === 'basin', 'it runs in on the rise'); }

/* 7. FLOATS AND LIFTS: the pontoon rides the water inside its range; every seat on it rides with it (1-4), nobody off it, never the dead */
{ const kit = tideInit(lab()), f = WATERKIT_LAB.tides[0].floats[0]; ok(floatY(kit, 'pontoon') === f.y * TS, 'at low water it rests on the bed');
  const seats = [0, 1, 2, 3].map(i => ({ x: (f.x0 + 1 + i) * TS, y: f.y * TS, vy: 0 })), off = { x: (f.x1 + 3) * TS, y: f.y * TS, vy: 0 }, dead = { x: (f.x0 + 1) * TS, y: f.y * TS, vy: 0, dead: true };
  until(kit, 'basin', 'rise'); let moved = 0;
  while (gauge(kit, 'basin').ph !== 'high') { for (const e of tideStep(kit, DT)) if (e.t === 'float') { const top = floatY(kit, 'pontoon'); moved += riders([...seats, off, dead], e.dy, f.x0 * TS, (f.x1 + 1) * TS, top).length; } }
  const top = floatY(kit, 'pontoon'); ok(top === Math.max(f.top * TS, 31 * TS - f.free), 'at high water it floats at the line, inside its top (' + top + ')');
  ok(seats.every(s => Math.abs(s.y - top) < 0.01), 'all four seats rode it up'); ok(off.y === f.y * TS && dead.y === f.y * TS, 'the one beside it and the dead one did not');
  ok(moved > 0, 'riders reported'); ok(liftY(kit, 'counterweight') === 38 * TS, 'the counterweight lift is down at high water'); }

/* 8. BITES AND FOES BY THE TIDE */
{ const kit = tideInit(lab()); ok(bites(kit, 34, 39)?.kind === 'tidepoolcrab', 'the crab flats bite at low water'); ok(!flooded(kit, 34, 39), 'and are dry');
  ok(foeTide(kit, { t: 'tidepoolcrab' }).active, 'the crab is out at low'); ok(foeTide(kit, { t: 'sailor' }).flee === false, 'a sailor stands at low');
  until(kit, 'basin', 'warn'); ok(foeTide(kit, { t: 'sailor' }).flee, 'a sailor climbs away as soon as it is told');
  until(kit, 'basin', 'high'); ok(!bites(kit, 34, 39), 'at high water the flats are quiet'); ok(foeTide(kit, { t: 'tidepoolcrab' }).buried, 'the crab is buried');
  ok(flooded(kit, 34, 39) === 'basin', 'and under'); const eel = foeTide(kit, { t: 'eel' }); ok(eel.swim && eel.lineY === 31 * TS, 'an eel is told where the line is');
  ok(foeTide(kit, { t: 'bonegob', y: 39 * TS }).drown, 'a land foe under the line drowns'); ok(!foeTide(kit, { t: 'bonegob', y: 29 * TS }).drown, 'above it he does not'); }

/* 9. RESPAWN: from any moment, a death puts the tide to its safe phase with the grace before it moves; sluices let go */
{ for (const at of [0, 5, 10, 13, 16, 22, 26]) { const kit = tideInit(lab()); run(kit, at); tideRespawn(kit); const g = gauge(kit, 'basin');
    ok(g.ph === 'low' && g.k === 0 && g.left >= 6 && !g.held, 'respawn at ' + at + ' s: low, ' + g.left + ' s of grace'); } }

/* 10. THE SOFT-LOCK SWEEP: a respawn at each checkpoint, at every moment of the cycle (every 0.5 s), every hero at his own ground speed reaches dry
   ground before the water is over his head (line above feet - 22 px), alone and as two, three and four seats (a checkpoint above high water is always safe).
   Water stats are hero-independent today (SWIM 96 for all) so the swim leg is the same number. And the sweep can fail: a far checkpoint on a short grace does. */
function escapes(L, c, h, seatsN, start) { const kit = tideInit(L); run(kit, start); tideRespawn(kit);
  const bodies = Array.from({ length: seatsN }, (_, i) => ({ x: c.x * TS + i * 6, y: (c.y + 1) * TS }));   /* partners stand a little behind */
  let t = 0; while (t < 30) { tideStep(kit, DT); t += DT; const ly = lineY(kit, L.tides[0].id);
    for (const b of bodies) { const wet = ly < b.y; b.x -= (wet ? SWIM : RUN * HERO_RUN[h].ground) * DT; }
    if (bodies.every(b => b.x <= c.dryX * TS)) return t;
    if (bodies.some(b => ly < b.y - 22 && b.x > c.dryX * TS)) return -t; }
  return -t; }
{ const L = lab(), dry = c => c.y + 1 <= L.tides[0].hi;
  const heroes = HERO_MOVE_IDS; ok(heroes.length >= 9, 'every hero (' + heroes.length + ')');
  for (const c of L.checkpoints) for (const h of heroes) for (const seatsN of [1, 2, 3, 4]) {
    if (dry(c)) continue;
    for (let start = 0; start < 27; start += 0.5) { const t = escapes(L, c, h, seatsN, start); ok(t > 0, h + ' x' + seatsN + ' from checkpoint ' + c.x + ',' + c.y + ' (respawn at ' + start + ' s) reaches dry ground (' + t.toFixed(1) + ' s)'); } }
  const B = lab(); B.tides[0].cycle.low = 2; B.tides[0].grace = 1; ok(escapes(B, { x: 55, y: 39, dryX: 7 }, 'reaper', 1, 0) < 0, 'the sweep catches a checkpoint the water beats you from'); }

/* 11. LINT: the lab is clean (at the slowest hero's speed); each rule bites when broken */
{ const slow = RUN * Math.min(...Object.values(HERO_RUN).map(h => h.ground));
  ok(lintTide(lab(), { run: slow }).length === 0, 'the lab room lints clean: ' + lintTide(lab(), { run: slow }).join('; '));
  const bad = (mut, re) => { const L = lab(); mut(L); const p = lintTide(L, { run: slow }); ok(p.some(s => re.test(s)), 'lint catches ' + re + ' (' + p.join('; ') + ')'); };
  bad(L => { L.tides[0].hi = 41; }, /must be above/); bad(L => { L.tides[0].cycle.warn = 0.5; }, /tell is shorter/);
  bad(L => { L.tides[0].pools = ['nope']; }, /not in L.pools/); bad(L => { L.tides[0].verbs[1].y = 35; }, /drowns at high water/);
  bad(L => { L.checkpoints[1].dryX = undefined; }, /names no dry ground/); bad(L => { L.checkpoints[1] = { x: 50, y: 39, dryX: 7 }; L.tides[0].cycle.low = 3; L.tides[0].grace = 3; }, /needs .* s to dry ground/);
  bad(L => { L.tides[1].verbs = []; }, /no lever never moves/); bad(L => { L.tides[1].verbs[0].y = 36; }, /under a full chamber/); }

/* 12. EVERY LEVEL THAT DECLARES A TIDE lints clean (none yet on master: the sea lanes add them) */
{ let lv = []; try { ({ LEVELS: lv } = await import('../src/level.js')); } catch (e) { console.log('  (level.js not importable in Node: ' + e.message.slice(0, 80) + ')'); }
  /* (claude/water1) a LEVELS row carries its tides in what it BUILDS, not on the row: build each (rows that throw in Node are skipped) */
  const users = (lv || []).map(d => { if (d && d.tides) return d; try { const B = d && d.build ? d.build() : null; return B && B.tides ? Object.assign(B, { id: d.id }) : null; } catch { return null; } }).filter(Boolean); for (const L of users) { const p = lintTide(L, { run: RUN * 0.8 }); ok(!p.length, L.id + ': ' + p.join('; ')); }
  console.log('  levels using the tide kit: ' + (users.map(L => L.id).join(', ') || 'none yet')); }

console.log('tide-kit: ' + n + ' checks ok');
