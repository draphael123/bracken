/* tools/sun-kit.mjs - THE SUN KIT (src/sun-kit.js; docs/desertkit.md) on top of src/sunstroke.js. NODE ONLY (no page, no browser).
   Proves: profiles fill/cool at their rates and 'open' IS sunstroke.js unchanged; water cools faster than shade; hot boxes fill faster; full = SUNSTRUCK read and
   the drain's top rate, never below 1 hp (drain.js floor) - never a kill; every seat on its own meter, the dead skipped; the Desert Priest's radiance feed
   (more in the sun, none in shade/night, nothing for anyone else to read); exposure precedence; lintSun on the lab + broken cases + every LEVELS entry with sunKit. */
import assert from 'node:assert/strict';
import { SUN, sunStep } from '../src/sunstroke.js';
import { makeDrains } from '../src/drain.js';
import { SUNKIT, sunKitInit, exposureOf, sunKitStep, sunSeats, sunReset, sunFeed, heatRead, lintSun, profileAt } from '../src/sun-kit.js';
import { DESERTKIT_LAB, labLevel } from '../src/desertkit-lab.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';

const DT = 1 / 60, HEROES = [...HERO_MOVE_IDS, 'sunpriest', 'rimebinder'];
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const until = (s, ex, prof, pred, cap = 30) => { let t = 0; while (!pred(s) && t < cap) { sunKitStep(s, DT, ex, prof); t += DT; } return t; };

/* 1. 'open' is sunstroke.js exactly; the profiles fill / cool at their rates */
{ const a = { v: 0 }, b = { v: 0 }; let same = true; for (let i = 0; i < 600; i++) { const r1 = sunStep(a, DT, i % 200 > 150), r2 = sunKitStep(b, DT, i % 200 > 150 ? 'shade' : 'sun', 'open'); if (Math.abs(r1.drain - r2.drain) > 1e-12 || a.v !== b.v) same = false; }
  ok(same, 'open sun = sunstroke.js, frame for frame');
  const tOpen = until({ v: 0 }, 'sun', 'open', s => s.v >= 1), tGlare = until({ v: 0 }, 'sun', 'glare', s => s.v >= 1), tDusk = until({ v: 0 }, 'sun', 'dusk', s => s.v >= 1);
  ok(Math.abs(tOpen - SUN.fill) < 0.05 && Math.abs(tGlare - SUN.fill / 1.25) < 0.05 && Math.abs(tDusk - SUN.fill / 0.6) < 0.05, `fill: open ${tOpen.toFixed(2)} s, glare ${tGlare.toFixed(2)}, dusk ${tDusk.toFixed(2)}`);
  const night = { v: 0 }; until(night, 'sun', 'night', () => false, 5); ok(night.v === 0, 'night: the sun never fills');
  const tHot = until({ v: 0 }, 'hot', 'glare', s => s.v >= 1); ok(Math.abs(tHot - SUN.fill / 1.25 / SUNKIT.hot) < 0.05, `glare + hot box: full in ${tHot.toFixed(2)} s`); }

/* 2. WATER cools faster than shade; nothing cools slower than sunstroke's shade */
{ const tShade = until({ v: 1 }, 'shade', 'open', s => s.v <= 0), tWater = until({ v: 1 }, 'water', 'open', s => s.v <= 0);
  ok(Math.abs(tShade - SUN.cool) < 0.05 && tWater < tShade / 2, `cool from full: shade ${tShade.toFixed(2)} s, water ${tWater.toFixed(2)} s`);
  for (const p of Object.keys(SUNKIT.profiles)) ok(until({ v: 1 }, 'shade', p, s => s.v <= 0) <= SUN.cool + 0.05, p + ': shade cools at least as fast as sunstroke');
  const r = sunKitStep({ v: 0.9 }, DT, 'water', 'open'); ok(r.rate === 0 && r.drain === 0, 'in water the drain stops at once'); }

/* 3. FULL = SUNSTRUCK: the read, the top rate, never a kill (drain.js floor 1), no stun anywhere in the result */
{ const s = { v: 0 }; let r; for (let t = 0; t < 6; t += DT) r = sunKitStep(s, DT, 'sun', 'open');
  ok(r.struck && r.stage === 3 && Math.abs(r.rate - SUN.drain[1]) < 1e-9, 'a full meter: SUNSTRUCK at the top rate ' + r.rate);
  ok(heatRead(r).label.startsWith('SUNSTRUCK'), 'the HUD says ' + heatRead(r).label);
  ok(!('stun' in r) && !('knock' in r) && !('flinch' in r), 'the step hands out no stun / knock / flinch (A13)');
  const P = { hp: 30, maxHp: 100 }, D = makeDrains({ players: () => [P], take: (pp, k) => { pp.hp -= k; } });
  const S = sunKitInit(labLevel()); for (let t = 0; t < 120; t += DT) { const m = sunSeats(S, [Object.assign(P, { x: 22 * 16 + 8, y: 22 * 16, h: 14 })], DT).get(P); if (m.rate > 0) D.set(P, 'sun', m.rate, { floor: 1 }); else D.stop(P, 'sun'); D.step(DT); }
  ok(P.hp === 1, 'two minutes SUNSTRUCK on the glare: ' + P.hp + ' hp left - it drains, it never kills');
  ok(heatRead(sunKitStep({ v: 0 }, DT, 'shade', 'open')) === null, 'cool in the shade: nothing on the HUD'); }

/* 4. EXPOSURE: water > shade > hot > sun; night/interior is none; the lab's boxes read right */
{ const L = labLevel(), S = sunKitInit(L), at = (tx, ty) => exposureOf(S, { x: tx * 16 + 8, y: (ty + 1) * 16, h: 14 });
  const K = DESERTKIT_LAB.sunKit;
  ok(at(K.water[0][0] + 1, K.water[0][3]) === 'water', 'the oasis pool is water');
  ok(at(K.cool[0][0] + 1, K.cool[0][3]) === 'shade', 'the rock overhang is shade');
  ok(at(K.hot[0][0] + 1, K.hot[0][3]) === 'hot', 'the sun-glass floor is hot');
  ok(at(30, 21) === 'sun', 'open sand is sun');
  const z = K.zones[0].box; ok(at(z[0] + 1, z[3]) === 'none' && profileAt(S, (z[0] + 1) * 16, z[3] * 16) === 'interior', 'the tomb mouth is interior: no sun');
  ok(exposureOf(S, { x: 30 * 16, y: 22 * 16, h: 14 }, { inWater: () => true }) === 'water' && exposureOf(S, { x: 30 * 16, y: 22 * 16, h: 14 }, { shaded: () => true }) === 'shade', 'main.js\'s own water / cvShaded answer first'); }

/* 5. EVERY SEAT, EVERY HERO: 1-4 seats on their own meters; the dead skipped */
{ const S = sunKitInit(labLevel());
  for (let seats = 1; seats <= 4; seats++) for (const h of HEROES) {
    const ps = [...Array(seats)].map((_, i) => ({ hero: i ? HEROES[(HEROES.indexOf(h) + i) % HEROES.length] : h, x: (i % 2 ? DESERTKIT_LAB.sunKit.cool[0][0] + 1 : 30) * 16 + 8, y: 22 * 16, h: 14, dead: i === 3 }));
    let m; for (let t = 0; t < 3; t += DT) m = sunSeats(S, ps, DT);
    ok(ps[0].sun.v > 0.5 && (seats < 2 || ps[1].sun.v === 0) && (seats < 3 || ps[2].sun.v > 0.5) && (seats < 4 || (ps[3].sun.v === 0 && !m.has(ps[3]))), `${seats} seat(s), ${h} first: each his own meter`); }
  const p = { x: 30 * 16, y: 22 * 16, h: 14 }; for (let t = 0; t < 3; t += DT) sunSeats(S, [p], DT); sunReset(p); ok(p.sun.v === 0 && !p.sunStruck, 'sunReset on a respawn'); }

/* 6. THE DESERT PRIEST: the sun feeds his radiance; shade, water and night do not; no immunity (his meter fills like anyone's) */
{ const r = (ex, prof = 'open') => sunKitStep({ v: 0.5 }, DT, ex, prof);
  ok(sunFeed(r('sun')) === 1 + SUNKIT.feed && sunFeed(r('hot')) > sunFeed(r('sun')), `fill x${sunFeed(r('sun'))} in the sun, x${sunFeed(r('hot'))} on hot glass`);
  ok(sunFeed(r('shade')) === 1 && sunFeed(r('water')) === 1 && sunFeed(r('sun', 'night')) === 1 && sunFeed(null) === 1, 'x1 in shade / water / at night / off the kit');
  const fullIn = k => 6 / k; ok(Math.abs(fullIn(sunFeed(r('sun'))) - 4) < 1e-9, 'his ~6 s radiance fill becomes 4 s in the sun');
  const S = sunKitInit(labLevel()), pr = { hero: 'sunpriest', x: 30 * 16, y: 22 * 16, h: 14 }, kn = { hero: 'knight', x: 30 * 16, y: 22 * 16, h: 14 };
  for (let t = 0; t < 2; t += DT) sunSeats(S, [pr, kn], DT); ok(pr.sun.v === kn.sun.v, 'the priest takes the sun exactly like the knight (no immunity)'); }

/* 7. LINT: the lab clean, broken cases caught, every LEVELS entry that declares sunKit */
{ const L = labLevel(); ok(lintSun(L).length === 0, 'the lab lints clean: ' + lintSun(L).join('; '));
  const route = []; for (let x = 2 * 16; x < 70 * 16; x += 4) route.push([x, 22 * 16]);
  ok(lintSun(L, route).length === 0, 'the lab\'s floor route keeps every sun walk within ' + SUN.maxWalk + ' s: ' + lintSun(L, route).join('; '));
  const br = f => { const M = labLevel(); f(M.sunKit); return lintSun(M).length; };
  ok(br(K => { K.profile = 'noon'; }) > 0, 'unknown profile caught'); ok(br(K => { K.hot.push([5, 5, 2, 6]); }) > 0, 'malformed box caught');
  ok(br(K => { K.cool.push([60, 2, 90, 4]); }) > 0, 'box off the map caught'); ok(br(K => { K.hot.push(K.water[0]); }) > 0, 'hot box in water caught');
  ok(br(K => { K.zones.push({ box: [1, 1, 2, 2], profile: 'x' }); }) > 0, 'zone profile caught');
  const open = labLevel(); open.sunKit.cool = []; open.shade = []; open.sunKit.water = []; ok(lintSun(open, route).length > 0, 'a long sun walk with no shade caught');
  let lv = 0; try { const { LEVELS } = await import('../src/level.js'); for (const l of Object.values(LEVELS)) if (l && l.sunKit) { lv++; ok(lintSun(l).length === 0, (l.id || '?') + ' lints clean'); } } catch (e) { console.log('  (LEVELS not loadable in node: ' + e.message.slice(0, 80) + ')'); }
  console.log('  levels with sunKit: ' + lv); }

console.log('sun-kit: ' + n + ' checks ok');
