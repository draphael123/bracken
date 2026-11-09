// tools/gqmusic.mjs - THE GOBLIN QUEEN'S TOWER-TOP MUSIC, THE NODE HALF (claude/gqmusic, Daniel 11-08). No page, no browser.
//   The roof stage lifts the track (music.lift(1): x1.06 + the told stinger, King Gorm's own), her crown circling her steps it up (lift(2): x1.10 + a higher stinger),
//   and every way out lets it go (lift(false)): her death, every hero down, a death / retry / level load (H.reset, H.load), the fight ending, the stage left.
//   node tools/gqmusic.mjs
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => readFileSync(path.join(ROOT, f), 'utf8');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js');
const { makeGQueenHands } = await imp('src/gqueen-hands.js');
const make = () => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, A = Lw.arena;
  const st = { time: 0, lifts: [], active: true };
  const hero = { x: A.x0 + 14 * 16, y: A.floor, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, hitSet: new Set(), box: null };
  const e = { t: 'gqueen', alive: true, x: A.x0 + 38 * 16, y: A.floor, w: 68, h: 52, hp: 1750, maxHp: 1750, mode: 'wake', modeT: 1.6, face: -1, phase: 3, stage: 'roof', anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99 };
  const noop = () => {};
  const ctx = { L: Lw, TS: 16, T, sfx: new Proxy({}, { get: () => noop }), P: () => hero, boss: () => e, bossActive: () => st.active, enemies: () => [e], props: () => [], time: () => st.time,
    number: noop, burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop, damage: () => 'hit', parries: () => 0, hurt: noop, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, hurtBox: () => ({ l: hero.x - 5, r: hero.x + 5, t: hero.y - 14, b: hero.y }), endFight: noop, shutWest: noop, layEscape: noop, tiles: noop,
    spawnEnt: noop, setCheckpoint: noop, flaskMax: () => 3, music: noop, lift: n => st.lifts.push(n), hint: noop, enterRoof: noop, wave: noop, ducking: () => false,
    eachHero: fn => { if (!hero.dead) fn(hero); }, allHeroes: fn => fn(hero), target: () => hero, attackBox: () => null, bell: () => null, grate: noop, pin: noop, westGate: noop, slamDmg: () => 14 };
  const H = makeGQueenHands(ctx); H.load(); H.reset(); st.lifts.length = 0;
  const step = n => { for (let i = 0; i < n; i++) { st.time += 1 / 60; e.modeT -= 1 / 60; e.anim += 1 / 60; H.tick(e, 1 / 60); H.roofStep(e, 1 / 60); H.update(1 / 60); } };
  return { H, st, e, hero, step };
};
const last = w => w.st.lifts.length ? w.st.lifts[w.st.lifts.length - 1] : undefined;

console.log('== the roof stage lifts the track once her wake card is done');
{ const w = make(); w.step(60);
  ok(w.st.lifts.length === 0 && w.H.musicLevel() === 0, 'during the wake card (1.6 s) the track is as it was');
  w.step(60); ok(w.st.lifts.join() === '1' && w.H.musicLevel() === 1, 'the card ends, THE TOWER TOP begins: lift(1) once (x1.06, King Gorm\'s step)');
  w.step(60 * 5); ok(w.st.lifts.join() === '1', 'it is not asked for again while the fight runs');

  console.log('== the final stretch (her crown circles her) steps it up');
  w.e.hp = w.e.maxHp * 0.2; w.e.mode = 'roofStand'; w.e.modeT = 0; w.step(1);
  ok(w.e.mode === 'stormTell', 'under 30%: the crown storm is told');
  ok(w.st.lifts.join() === '1', 'the step waits for the storm itself, not the tell');
  w.step(60); ok(w.st.lifts.join() === '1,2' && w.H.musicLevel() === 2, 'the crown circles her: lift(2) (x1.10, the second stinger)');
  w.step(60 * 4); ok(w.st.lifts.join() === '1,2', 'one step up, no re-fire');
  console.log('== a parry that breaks the storm does not drop the tension (monotonic)');
  w.H.test.roof().storm = null; w.step(60); ok(w.H.musicLevel() === 2 && last(w) === 2, 'storm gone, level still 2');

  console.log('== her death lets it go');
  w.e.alive = false; w.step(1); ok(last(w) === 0 && w.H.musicLevel() === 0, 'she dies: lift(0)');
}
console.log('== every hero down lets it go, a revive lifts it back (co-op)');
{ const w = make(); w.step(130); w.hero.dead = true; w.step(1); ok(last(w) === 0, 'the player dies: lift(0)');
  w.step(30); ok(w.st.lifts.join() === '1,0', 'and it stays down while he is');
  w.hero.dead = false; w.step(1); ok(last(w) === 1 && w.H.musicLevel() === 1, 'a revive in the same stage lifts it again');
}
console.log('== a death / retry (H.reset) and a level load (H.load) let it go, at level 1 and at 2');
for (const lvl of [1, 2]) for (const way of ['reset', 'load']) {
  const w = make(); w.step(130); if (lvl === 2) { w.e.hp = w.e.maxHp * 0.2; w.e.mode = 'roofStand'; w.e.modeT = 0; w.step(80); }
  ok(w.H.musicLevel() === lvl, 'set-up: at level ' + lvl);
  w.H[way](); ok(last(w) === 0 && w.H.musicLevel() === 0, 'H.' + way + '() at level ' + lvl + ': lift(0)');
}
console.log('== the arena left / the fight ended (bossActive false), and a stage change');
{ const w = make(); w.step(130); w.st.active = false; w.step(1); ok(last(w) === 0, 'the fight ends (bossActive false): lift(0)');
  const v = make(); v.step(130); v.e.stage = 'escape'; v.step(1); ok(last(v) === 0, 'she leaves the roof stage (a retry from the escape): lift(0)'); }

console.log('== audio.js: lift(true) / lift(1) x1.06, lift(2) x1.10, lift(false) x1; the stinger only on a step up');
{ const a = rd('src/audio.js'); const m = a.match(/lift\(on\) \{[^\n]*\n[^\n]*\n/)[0];
  ok(/on === 2 \? 1\.10 : on \? 1\.06 : 1/.test(m), 'rates: 2 -> 1.10, truthy -> 1.06, falsy -> 1');
  ok(/if \(k === liftRate\) return/.test(m) && /const up = k > liftRate/.test(m) && /if \(up && musicGain && musicOn\)/.test(m), 'no change = no-op; the stinger is for a step up only (lift(false) stays silent)');
  ok(/music\.play|play\(name\) \{ liftRate = 1/.test(a), 'a new track still starts at x1 (play resets liftRate)'); }

console.log('== wiring: main.js hands her music.lift; Gorm\'s hook is unchanged');
{ const m = rd('src/main.js');
  ok(/lift: n => music\.lift && music\.lift\(n\), hint:/.test(m), 'makeGQueenHands gets lift');
  ok(/music: on => music\.lift && music\.lift\(on\)/.test(m), 'makeGormHands still gets music: on => music.lift(on)'); }
console.log(fails ? '\n' + fails + ' FAIL' : '\nall ok');
process.exit(fails ? 1 : 0);
