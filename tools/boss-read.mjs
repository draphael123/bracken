/* tools/boss-read.mjs - THE TURNED BLOW'S CHECK (claude/sweep1, src/boss-read.js, design-standard B10/B11). No browser.
   1. turned(): a clank, a flash (ring + sparks), and a word over him - once a frame per boss, whoever calls it.
   2. auto(): a blow that took nothing and changed nothing is turned; one that hurt, moved him off his mode or broke him is not; a sleeping boss is not.
   3. beats(): a 'front' duelist is beaten from behind only; a boss not in GUARD never is.
   4. main.js wires it: hurtEnemy calls BR.auto after every hero blow on a boss or a mini, and the angle blow skips the chip. */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { makeBossRead, TURN, GUARD } from '../src/boss-read.js';
let t = 1; const log = [];
const BR = makeBossRead({ time: () => t, clank: () => log.push('clank'), sparks: () => log.push('sparks'), ring: () => log.push('ring'), word: (x, y, w) => log.push('word:' + w), hitstop: () => {} });
const ram = { t: 'ram', x: 100, y: 200, w: 30, h: 30, face: 1, alive: true, hp: 300, mode: 'pace' };
assert.ok(BR.turned(ram, 140)); assert.deepStrictEqual(log, ['clank', 'ring', 'sparks', 'word:' + TURN.ROUND], 'a turned blow clanks, flashes and says GO ROUND from his front');
assert.ok(BR.turned(ram, 140)); assert.strictEqual(log.length, 4, 'once a frame');
t = 2; log.length = 0; assert.ok(BR.auto(ram, 140, { hp: 300, mode: 'pace', broken: 0 })); assert.ok(log.includes('clank') && log.some(w => w.startsWith('word:')), 'auto: nothing taken -> turned');
t = 3; log.length = 0; assert.ok(!BR.auto(ram, 140, { hp: 310, mode: 'pace', broken: 0 }), 'a blow that hurt is not turned');
assert.ok(!BR.auto(ram, 140, { hp: 300, mode: 'charge', broken: 0 }), 'a blow that moved him off his mode is not turned');
assert.ok(!BR.auto({ ...ram, mode: 'sleep' }, 140, { hp: 300, mode: 'sleep', broken: 0 }), 'a sleeping boss is not turned');
assert.strictEqual(log.length, 0);
assert.strictEqual(GUARD.ram, 'horns'); assert.ok(BR.beats(ram, 60) && !BR.beats(ram, 140) && BR.beats(ram, 140, true), "the ram's horns (claude/scree2, Daniel's brief: flank/behind/above land): beaten from behind or from the air, never from his front on the ground");
assert.ok(!BR.beats({ t: 'golem', x: 0, face: 1, alive: true }, -50), 'a boss not in GUARD is never beaten by angle');
assert.strictEqual(BR.wordOf({ t: 'golem' }, 0), TURN.STONE); assert.strictEqual(BR.wordOf({ t: 'nobody' }, 0), TURN.WARDED);
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(/BR\.auto\(e, fromX, \{ hp: hp0, mode: mode0, broken: br0 \}\)/.test(main), 'main.js hurtEnemy calls BR.auto');
assert.ok(/angB \? Math\.max\(1, Math\.round\(wardedDamage\(e, dmg(?:, blow)?\) \* BR_ANGLE\.mul\)\) : bossChip\(/.test(main), 'the angle blow skips the chip');
console.log('boss-read: ok (turned / auto / beats / wired)');
