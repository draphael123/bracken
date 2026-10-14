// tools/sun-floor.mjs - THE SUN NEVER KILLS (Daniel 10-14): the sun's drain (src/sun-hands.js on the shared src/drain.js) stops at 1 hp. Breath is NOT floored.
//   node tools/sun-floor.mjs      (pure; no browser)
import { makeSunHands } from '../src/sun-hands.js';
import { makeDrains } from '../src/drain.js';
let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
function run(maxHp, hp0, secs, shaded) {
  const pp = { x: 0, y: 0, h: 18, hp: hp0, maxHp, dead: false, vx: 0 }; let died = false, taken = 0;
  const H = makeSunHands({ players: [pp], hero: () => pp, asPlayer: (p, f) => f(), TS: 16, sfx: {}, VW: () => 480, VH: () => 270, calm: () => true,
    shaded: () => shaded, zones: () => [], drain: n => { taken += n; pp.hp = Math.max(0, pp.hp - n); if (pp.hp <= 0) { pp.dead = true; died = true; } }, god: () => false,
    number() {}, part() {}, standable: () => false, solid: () => false });
  H.reset();
  for (let t = 0; t < secs; t += 1 / 60) H.update(1 / 60);
  return { hp: pp.hp, died, taken };
}
for (const [mx, hp] of [[100, 8], [100, 1], [100, 100], [120, 3]]) { const r = run(mx, hp, 30, false); ok(!r.died && r.hp >= 1, `30 s in open sun, max ${mx}, start ${hp} hp -> hp ${r.hp}, died ${r.died}`); if (hp <= 8) ok(r.hp === 1, `  ...and it drained all the way down to exactly 1 (took ${r.taken})`); }
{ const r = run(100, 100, 60, false); ok(!r.died && r.hp === 1, `60 s from full: sun drains to 1 and holds (hp ${r.hp})`); }
{ const r = run(100, 100, 30, true); ok(r.hp === 100, 'shade: no drain at all'); }
{ const r = run(100, 1, 30, false); ok(r.hp === 1 && r.taken === 0, 'at 1 hp the sun does no further damage'); }
/* the shared helper: an unfloored source (OUT OF BREATH) still takes the last hp */
{ const pp = { hp: 5, maxHp: 100 }; let died = false; const D = makeDrains({ players: () => [pp], take: (p, n) => { p.hp = Math.max(0, p.hp - n); if (p.hp <= 0) died = true; } });
  D.set(pp, 'breath', 0.04, { name: 'OUT OF BREATH' }); for (let t = 0; t < 5; t += 1 / 60) D.step(1 / 60); ok(died && pp.hp === 0, 'breath (no floor) still drowns'); }
{ const pp = { hp: 5, maxHp: 100 }; let died = false; const D = makeDrains({ players: () => [pp], take: (p, n) => { p.hp = Math.max(0, p.hp - n); if (p.hp <= 0) died = true; } });
  D.set(pp, 'sun', 0.04, { floor: 1 }); D.set(pp, 'breath', 0.04, { name: 'OUT OF BREATH' }); for (let t = 0; t < 10; t += 1 / 60) D.step(1 / 60); ok(died, 'sun + breath together: breath still kills'); }
console.log(bad ? `sun-floor: ${bad} FAIL` : 'sun-floor: all green'); process.exit(bad ? 1 : 0);
