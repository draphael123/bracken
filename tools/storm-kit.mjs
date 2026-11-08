/* tools/storm-kit.mjs - THE STORM KIT (src/storm-kit.js; docs/desertkit.md) on desert-rules.js's sandstorm. NODE ONLY (no page, no browser).
   Proves: the default cycle IS desert-rules' stormStep frame for frame; every gust told >= warnMin; sight never under STORM.sightMin; braced < a tile a gust,
   open / air carry; per-body carry (4 seats + foes, each whole px, no shared remainder); weights (foe / heavy / anchored / dead); lee boxes; shots bend; the
   view per seat; every hero walks against a gust braced and holds; phase offsets; lintStorms on the lab + broken cases + every LEVELS entry with storms. */
import assert from 'node:assert/strict';
import { STORM, newStorm, stormStep } from '../src/desert-rules.js';
import { STORMKIT, stormInit, stormKitStep, stormBodies, stormShots, stormSight, stormView, lintStorms } from '../src/storm-kit.js';
import { labLevel } from '../src/desertkit-lab.js';
import { HERO_MOVE_IDS, heroRunMul, MOVE } from '../src/hero-move.js';

const DT = 1 / 60, HEROES = [...HERO_MOVE_IDS, 'sunpriest', 'rimebinder'];
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const one = (dirs = [1], extra = {}) => stormInit({ storms: [{ id: 's', box: [0, 0, 200, 40], dirs, ...extra }] });
const toGust = K => { while (K.storms[0].now.phase !== 'gust') stormKitStep(K, DT); };
const wholeGust = (K, f) => { toGust(K); while (K.storms[0].now.phase === 'gust') { stormKitStep(K, DT); f(); } };

/* 1. the default cycle is desert-rules' frame for frame */
{ const K = one([1, 1, -1]), S = newStorm([1, 1, -1]); let same = true;
  for (let i = 0; i < 60 * 40; i++) { stormKitStep(K, DT); const a = K.storms[0].now, b = stormStep(S, DT); if (a.phase !== b.phase || a.dir !== b.dir || Math.abs(a.push - b.push) > 1e-9 || Math.abs(a.sight - b.sight) > 1e-9) same = false; }
  ok(same, 'the kit\'s default storm = desert-rules stormStep, 40 s frame for frame'); }

/* 2. TOLD: every gust after >= warnMin of warning; sight never under the floor; the wind changes its mind; events said once */
{ const K = stormInit(labLevel()); let warnAt = null, minWarn = 99, gusts = 0, minSight = 999; const dirs = new Set(); const evs = [];
  for (let t = 0; t < 60; t += DT) { for (const e of stormKitStep(K, DT)) { evs.push(e); if (e.ev === 'warn') { warnAt = t; dirs.add(e.dir); } if (e.ev === 'gust') { gusts++; if (warnAt !== null) minWarn = Math.min(minWarn, t - warnAt); } }
    minSight = Math.min(minSight, K.storms[0].now.sight); }
  ok(gusts >= 8 && minWarn >= STORMKIT.warnMin, `${gusts} gusts a minute, each told ${minWarn.toFixed(2)}+ s`);
  ok(minSight >= STORM.sightMin, 'sight at worst ' + Math.round(minSight) + ' px (floor ' + STORM.sightMin + ')'); ok(dirs.size === 2, 'both ways');
  ok(evs.every((e, i) => i === 0 || e.ev !== evs[i - 1].ev), 'each phase change said once'); }

/* 3. BRACED / OPEN / AIR over one gust; each body its own carry, whole px */
{ const drift = io => { const K = one(), b = { x: 100, y: 100 }; wholeGust(K, () => stormBodies(K, [b], DT, io)); return b.x - 100; };
  const br = drift({ braced: () => true }), op = drift({}), air = drift({ grounded: () => false });
  ok(br < 16 && op > 32 && air > op, `one gust: braced ${br} px, open ${op} px, in the air ${air} px`);
  ok([br, op, air].every(Number.isInteger), 'bodies move in whole px (moveBody-safe)');
  const K = one(), seats = [0, 1, 2, 3].map(i => ({ x: 100 + i * 40, y: 100 })), foes = [{ x: 300, y: 100, kind: 'foe' }, { x: 340, y: 100, kind: 'heavy' }, { x: 380, y: 100, kind: 'anchored' }, { x: 420, y: 100, kind: 'foe', alive: false }];
  seats[2].dead = true; const x0 = [...seats, ...foes].map(b => b.x);
  wholeGust(K, () => stormBodies(K, [...seats, ...foes], DT, { braced: b => b === seats[1] }));
  const d = [...seats, ...foes].map((b, i) => b.x - x0[i]);
  ok(d[0] === d[3] && d[0] > 32, 'P1 and P4 (open) carried the same ' + d[0] + ' px: their own remainders');
  ok(d[1] < 16 && d[2] === 0, 'P2 braced holds (' + d[1] + '), dead P3 untouched');
  ok(d[4] > 0 && d[4] < d[0] && d[5] < d[4] && d[6] === 0 && d[7] === 0, `foe ${d[4]}, heavy ${d[5]}, anchored ${d[6]}, dead foe ${d[7]}`);
  const moves = []; const K2 = one(); const b = { x: 50, y: 100 }; wholeGust(K2, () => stormBodies(K2, [b], DT, { move: (q, dx) => moves.push(dx) }));
  ok(moves.length > 0 && b.x === 50, 'io.move gets the px (main.js moveBody: walls stop it), the body is left to it'); }

/* 4. LEE + outside the box + shots bend + per-storm weights */
{ const L = labLevel(), K = stormInit(L), lee = { x: 49 * 16 + 8, y: 22 * 16 }, open = { x: 40 * 16, y: 22 * 16 }, out = { x: 10 * 16, y: 22 * 16 };
  const xs = [lee.x, open.x, out.x]; while (K.storms[0].now.phase !== 'gust') stormKitStep(K, DT); for (let i = 0; i < 40; i++) { stormKitStep(K, DT); stormBodies(K, [lee, open, out], DT); }
  ok(lee.x === xs[0] && open.x !== xs[1] && out.x === xs[2], 'the lee holds, the open sand is pushed, outside the storm nothing');
  const shot = { x: 40 * 16, y: 20 * 16, vx: 0 }, far = { x: 5 * 16, y: 20 * 16, vx: 0 }; stormShots(K, [shot, far], DT); ok(shot.vx !== 0 && far.vx === 0, 'a shot in the gust bends, one outside does not');
  const K3 = one([1], { weight: { hero: 0.5 } }), a = { x: 0, y: 100 }, K4 = one(), c = { x: 0, y: 100 }; wholeGust(K3, () => stormBodies(K3, [a], DT)); wholeGust(K4, () => stormBodies(K4, [c], DT));
  ok(a.x < c.x * 0.7, 'a storm\'s own weight table (hero 0.5) is read'); }

/* 5. SIGHT and the per-seat view */
{ const K = stormInit(labLevel()); toGust(K); for (let i = 0; i < 20; i++) stormKitStep(K, DT);
  ok(stormSight(K, 40 * 16, 20 * 16) < 260 && stormSight(K, 5 * 16, 20 * 16) === Infinity, 'sight closes in the storm, nothing outside');
  const v = stormView(K, [{ x: 40 * 16, y: 22 * 16 }, { x: 5 * 16, y: 22 * 16 }, { x: 45 * 16, y: 22 * 16, dead: true }, { x: 30 * 16, y: 22 * 16 }]);
  ok(v.length === 2 && v.every(c => c.r >= STORM.sightMin), 'one circle per live seat inside the storm (' + v.length + ')'); }

/* 6. EVERY HERO walks INTO a gust: open he still makes headway at his run (the push 150 < his run? no - so he is pushed back), braced he holds his place */
{ for (const h of HEROES) { const K = one([-1]), b = { x: 500, y: 100, hero: h }, run = MOVE.RUN * heroRunMul(h, true); let walked = 0;
    wholeGust(K, () => { b.x += run * DT; walked += run * DT; stormBodies(K, [b], DT); });
    const br = { x: 500, y: 100 }; const K2 = one([-1]); wholeGust(K2, () => stormBodies(K2, [br], DT, { braced: () => true }));
    ok(500 - br.x < 16, h + ': braced on the ground he holds within a tile (' + (500 - br.x) + ' px) - every hero has block (C)');
    ok(b.x - 500 < walked, h + ': walking into it the gust takes ground off him (' + (b.x - 500).toFixed(0) + ' of ' + walked.toFixed(0) + ' px)'); } }

/* 7. PHASE offsets: two storms out of step */
{ const K = stormInit({ storms: [{ id: 'a', box: [0, 0, 9, 9] }, { id: 'b', box: [10, 0, 19, 9], phase: 2 }] }); stormKitStep(K, 1.5);
  ok(K.storms[0].now.phase === 'calm' && K.storms[1].now.phase === 'warn', 'a phase offset puts a storm out of step'); }

/* 8. LINT */
{ const L = labLevel(); ok(lintStorms(L).length === 0, 'the lab lints clean: ' + lintStorms(L).join('; '));
  const br = f => { const M = labLevel(); f(M.storms[0], M); return lintStorms(M).length; };
  ok(br(s => { s.cycle.warn = 0.6; }) > 0, 'a short tell caught'); ok(br(s => { s.sight.gust = 40; }) > 0, 'a blind gust caught');
  ok(br(s => { s.push = 600; }) > 0, 'a push bracing cannot hold caught'); ok(br(s => { s.box = [0, 0, 99, 9]; }) > 0, 'off the map caught');
  ok(br(s => { s.lee = [[0, 0, 2, 2]]; }) > 0, 'a lee outside its storm caught'); ok(br(s => { s.dirs = [2]; }) > 0, 'bad dirs caught');
  ok(br((s, M) => { M.storms.push({ ...s }); }) > 0, 'duplicate id caught'); ok(br(s => { s.cycle.calm = 0.2; }) > 0, 'no calm to move in caught');
  let lv = 0; const { LEVELS } = await import('../src/level.js'); for (const l of Object.values(LEVELS)) if (l && l.storms) { lv++; ok(lintStorms(l).length === 0, (l.id || '?') + ' lints clean'); }
  console.log('  levels with storms: ' + lv); }

console.log('storm-kit: ' + n + ' checks ok');
