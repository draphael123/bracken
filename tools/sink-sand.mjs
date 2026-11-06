/* tools/sink-sand.mjs - SINKING SAND (src/sink-sand.js; docs/desertkit.md) on src/quicksand.js. NODE ONLY (no page, no browser).
   Proves: a pit IS quicksand.js (same frames); held never under; 6 taps a second out, 2 never (quicksand's rule) for EVERY hero in 1-4 seats each on
   his own depth, the dead let go; the player's clock (Game speed); DUNE SAND is footing while you run, takes you after STOP.grace slow (told by the
   ripple), then the same jump verb; FOES held (no walk), sink, haul out after FOE.out (heavy x2) the way they face, sand kin never sink, never killed;
   lintSinkSand on the lab + broken cases + every LEVELS entry with sinkSand. */
import assert from 'node:assert/strict';
import { QS, qsStep } from '../src/quicksand.js';
import { STOP, FOE, RUN, sinkInit, sinkAt, sinkHero, sinkFoe, sinkBodies, lintSinkSand } from '../src/sink-sand.js';
import { labLevel } from '../src/desertkit-lab.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';

const DT = 1 / 60, HEROES = [...HERO_MOVE_IDS, 'sunpriest', 'rimebinder'];
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const L = labLevel(), K = sinkInit(L), PIT = K.patches[0].q, DUNE = K.patches[1].q;
const inPit = (x = PIT.x0 + 30) => ({ x, y: PIT.y, vx: 0, vy: 0 });
/* tap jump `rate` a second for s seconds; returns { out, t } */
function taps(b, rate, s, speed = 1) { let t = 0, next = 0; while (t < s) { const jp = t >= next; if (jp) next += 1 / rate; const r = sinkHero(b, K, DT * speed, { jumpPress: jp }, speed); t += DT; if (r.out) return { out: true, t }; } return { out: false, t }; }

/* 1. a pit IS quicksand.js */
{ const a = inPit(), b = inPit(); let same = true; for (let i = 0; i < 120; i++) { const jp = i % 20 === 0; const r1 = sinkHero(a, K, DT, { jumpPress: jp, move: 1 }), r2 = qsStep(b, PIT, DT, { jumpPress: jp, move: 1 }); if (a.y !== b.y || a.vx !== b.vx || r1.held !== r2.held) same = false; }
  ok(same, 'a pit runs quicksand.js frame for frame'); ok(sinkAt(K, 10, PIT.y) === null && sinkAt(K, PIT.x0 + 4, PIT.y).def.id === 'pit', 'sinkAt finds the patch'); }

/* 2. held, never under; out by tapping (6/s), never at 2/s - every hero, every seat count, each his own depth */
{ const b = inPit(); for (let i = 0; i < 600; i++) sinkHero(b, K, DT, {}); ok(b.y - PIT.y === QS.maxDepth && QS.maxDepth < 14, 'ten seconds still: chest-deep ' + (b.y - PIT.y) + ' px and never under');
  for (const h of HEROES) { const p = inPit(); p.hero = h; for (let i = 0; i < 300; i++) sinkHero(p, K, DT, {}); const r = taps(p, 6, 4); ok(r.out && r.t < 1.5, h + ': from chest-deep, 6 taps a second out in ' + r.t.toFixed(2) + ' s');
    const q = inPit(); for (let i = 0; i < 300; i++) sinkHero(q, K, DT, {}); ok(!taps(q, 2, 6).out, h + ': 2 taps a second never'); }
  for (let seats = 1; seats <= 4; seats++) { const ps = [...Array(seats)].map((_, i) => ({ ...inPit(PIT.x0 + 8 + i * 16), hero: HEROES[i] }));
    if (seats === 4) ps[3].dead = true;
    for (let i = 0; i < 60; i++) sinkBodies(K, ps, [], DT, { input: p => ({ jumpPress: p === ps[0] && i === 50 }) });
    ok(ps.slice(1, 3).every(p => p.qsDepth > ps[0].qsDepth) && (seats < 4 || ps[3].qsDepth === 0), seats + ' seat(s): each his own depth, the dead let go'); } }

/* 3. the player's clock: half Game speed, the same taps get out (quicksand.js decision A) */
{ const p = inPit(); for (let i = 0; i < 300; i++) sinkHero(p, K, DT * 0.5, {}, 0.5); const r = taps(p, 6, 4, 0.5); ok(r.out && r.t < 1.5, 'at Game speed 0.5 the taps still get out (' + r.t.toFixed(2) + ' s)'); }

/* 4. DUNE SAND: footing while you run, a ripple when slow, it takes you after the grace, then the same verb */
{ const b = { x: DUNE.x0 + 8, y: DUNE.y, vx: RUN, vy: 0 }; let held = false;
  for (let i = 0; i < 90; i++) { b.x += b.vx * DT; const r = sinkHero(b, K, DT, {}); if (r.held) held = true; if (b.x > DUNE.x1 - 10) break; }
  ok(!held && b.y === DUNE.y, 'running over the dune: footing all the way');
  const s = { x: DUNE.x0 + 40, y: DUNE.y, vx: 0, vy: 0 }; let first = null, rip = 0;
  for (let t = 0; t < 2; t += DT) { const r = sinkHero(s, K, DT, {}); if (!r.held) rip = Math.max(rip, r.ripple); if (r.held && first === null) first = t; }
  ok(Math.abs(first - STOP.grace) < 0.05 && rip > 0.8, `stopped: the ripple tells (${rip.toFixed(2)}), it takes you at ${first.toFixed(2)} s`);
  ok(taps(s, 6, 4).out, 'and the same jump verb gets you out');
  const w = { x: DUNE.x0 + 40, y: DUNE.y, vx: STOP.keep * RUN * 1.05, vy: 0 }; let hw = false; for (let i = 0; i < 120; i++) if (sinkHero(w, K, DT, {}).held) hw = true; ok(!hw, 'a walk over STOP.keep of the run keeps you up');
  for (const h of HEROES) { const p = { x: DUNE.x0 + 8, y: DUNE.y, vx: RUN * 0.8, vy: 0, hero: h }; let hh = false; for (let i = 0; i < 60; i++) if (sinkHero(p, K, DT, {}).held) hh = true; ok(!hh, h + ' crosses it at his run'); } }

/* 5. FOES: held, sink, never killed, haul out the way they face; heavy slower; sand kin never; the dead nothing */
{ const e = { t: 'bandit', x: PIT.x0 + 30, y: PIT.y, vx: 40, face: 1, alive: true, hp: 10 }; let first = null, maxD = 0;
  for (let t = 0; t < 6; t += DT) { const r = sinkFoe(e, K, DT); if (r.held) maxD = Math.max(maxD, r.depth); if (r.out && first === null) { first = t; break; } }
  ok(maxD > 4 && maxD <= QS.maxDepth && e.hp === 10, `a bandit held to ${maxD.toFixed(1)} px, unhurt`);
  ok(Math.abs(first - FOE.out) < 0.05 && e.x > PIT.x1 && e.vy < 0, `out after ${first.toFixed(2)} s on the side it faced`);
  const h = { t: 'mummy', heavy: true, x: PIT.x0 + 30, y: PIT.y, face: -1, alive: true }; let ht = null; for (let t = 0; t < 10; t += DT) if (sinkFoe(h, K, DT).out) { ht = t; break; }
  ok(Math.abs(ht - FOE.out * FOE.heavyOut) < 0.05 && h.x < PIT.x0, 'a heavy one: ' + ht.toFixed(2) + ' s, out west');
  const held = { t: 'bandit', x: PIT.x0 + 30, y: PIT.y, vx: 50, alive: true }; sinkFoe(held, K, DT); ok(held.vx === 0 && held.sandHeld, 'held: no walk (it can still strike: not a stun)');
  for (const t of ['scorpion', 'duneworm', 'sandgrasper', 'skiffbandit']) { const k = { t, x: PIT.x0 + 30, y: PIT.y, alive: true }; ok(!sinkFoe(k, K, DT).held, t + ' is sand kin: never sinks'); }
  ok(!sinkFoe({ t: 'bat', flying: true, x: PIT.x0 + 30, y: PIT.y }, K, DT).held && !sinkFoe({ t: 'bandit', alive: false, x: PIT.x0 + 30, y: PIT.y }, K, DT).held, 'flyers and the dead: nothing');
  const run = { t: 'bandit', x: DUNE.x0 + 30, y: DUNE.y, vx: RUN, alive: true }; ok(!sinkFoe(run, K, DT).held, 'a charging foe crosses dune sand');
  const st = { t: 'bandit', x: DUNE.x0 + 30, y: DUNE.y, vx: 0, alive: true }; ok(sinkFoe(st, K, DT).held, 'a standing one sinks in it'); }

/* 6. LINT */
{ const at = L.tileAt; ok(lintSinkSand(L, at).length === 0, 'the lab lints clean: ' + lintSinkSand(L, at).join('; '));
  const br = (f, g) => { const M = labLevel(); f(M.sinkSand[0], M); if (g) g(M); return lintSinkSand(M, M.tileAt).length; };
  ok(br(s => { s.mode = 'bog'; }) > 0, 'bad mode caught'); ok(br(s => { s.y = 21; }) > 0, 'no rock under caught');
  ok(br(() => {}, M => { M.grid[22 * M.W + 37] = 0; M.grid[23 * M.W + 37] = 0; }) > 0, 'no footing to jump out onto caught');
  ok(br(() => {}, M => { M.grid[21 * M.W + 36] = 3; }) > 0, 'spikes in reach caught'); ok(br(s => { s.x1 = 200; }) > 0, 'off the map caught');
  ok(br((s, M) => { M.sinkSand.push({ ...s }); }) > 0, 'duplicate id caught');
  let lv = 0; const { LEVELS } = await import('../src/level.js'); for (const l of Object.values(LEVELS)) if (l && l.sinkSand) { lv++; ok(lintSinkSand(l).length === 0, (l.id || '?') + ' lints clean'); }
  console.log('  levels with sinkSand: ' + lv); }

console.log('sink-sand: ' + n + ' checks ok');
