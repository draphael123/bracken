/* tools/great-hound.mjs - THE GREAT HOUND IS NEVER INVULNERABLE (claude/hound, Daniel 10-07: "too difficult simply because he's invincible
   outside of very small windows. There's no reason for that. He should NOT be invincible."). Node only, no page:
     - he is off the mini chip (src/boss-greed.js: not on CHIP_MINI, on FULL_DAMAGE) and every hero blow from every side takes real health
     - he GUARDS BY ANGLE (B11): a blow into his face at his height is turned in part (GO ROUND), from behind or from the air it lands whole
     - his skid and his whine are BONUS openings (x openMul, from any side), each followed by a TOLD ward that shuts only the bonus (B3)
     - his pups are KEPT (Daniel, 10-07 via the coordinator: "the Great Hound KEEPS his pup summons")
     - THE BOUGHS, his new told move (B5): three red rings, a '!!' mark, a dodge answer, a word in the hint box, and the wood lands on the rings
   node tools/great-hound.mjs */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GH, houndTake, houndWardStep, boughSpots, boughHits } from '../src/great-hound.js';
import { CHIP_MINI, FULL_DAMAGE, chipped, OPEN_RULE } from '../src/boss-greed.js';
import { MARK, ANSWER, BY_HAND } from '../src/marks.js';
import { CALL_LINES } from '../src/hint-lines.js';
import { TURN_WORD } from '../src/boss-read.js';
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/* never on the chip */
assert.ok(!CHIP_MINI.has('greathound'), 'the Great Hound must not be on CHIP_MINI (Daniel 10-07: never invulnerable)');
assert.ok(FULL_DAMAGE.greathound, 'the Great Hound is a duelist on FULL_DAMAGE');
assert.ok(!chipped({ t: 'greathound', xpRole: 'mini' }, false), 'no chip applies to him');
assert.ok(OPEN_RULE.greathound && OPEN_RULE.greathound({ open: 1 }) && !OPEN_RULE.greathound({ open: 0 }), 'his bonus openings are still named (greed counts outside them)');

/* every side takes real health */
const hound = (o = {}) => ({ t: 'greathound', x: 100, y: 200, face: 1, mode: 'idle', open: 0, broken: 0, ...o });
for (const fromX of [60, 99, 100, 101, 140]) for (const air of [false, true]) {
  const r = houndTake(hound(), 20, fromX, air, true);
  assert.ok(r.dmg >= Math.round(20 * 0.3), 'a blow of 20 from x=' + fromX + (air ? ' in the air' : '') + ' took ' + r.dmg + ': never a scratch');
}
assert.equal(houndTake(hound(), 20, 140, false, true).turned, true, 'a blow into his face at his height is turned in part');
assert.equal(houndTake(hound(), 20, 140, false, true).dmg, Math.round(20 * GH.front), 'and lands at GH.front');
assert.ok(GH.front >= 0.3, 'GH.front ' + GH.front + ': the frontal guard must stay a guard, not a wall');
assert.equal(houndTake(hound(), 20, 60, false, true).dmg, 20, 'from behind it lands whole');
assert.equal(houndTake(hound(), 20, 140, true, true).dmg, 20, 'from the air over him it lands whole');
assert.equal(houndTake(hound({ open: 2 }), 20, 140, false, true).dmg, Math.round(20 * GH.openMul), 'in a bonus opening, from any side, x openMul');
assert.ok(GH.openMul > 1, 'an opening is a bonus');

/* the told ward after an opening shuts only the bonus */
{ const e = hound({ open: 0.01 }); let told = 0; houndWardStep(e, 0.016, () => told++); e.open = 0; houndWardStep(e, 0.016, () => told++);
  assert.equal(told, 1, 'the ward is told once when an opening ends'); assert.ok(e.ghWard > 0 && Math.abs(e.ghWard - GH.wardT) < 0.05, 'the ward runs GH.wardT');
  assert.equal(houndTake(e, 20, 60, false, true).dmg, 20, 'in his ward he is still hit for real');
  assert.ok(/res === 'blocked' && e\.ghWard > 0\) \{ e\.mode = 'skid'; e\.modeT = 0\.6;/.test(src), 'a lunge blocked in his ward is a plain skid (no new bonus)'); }

/* the pups are kept (Daniel) */
assert.ok(/e\.mode === 'howlTell'[\s\S]{0,1400}pup: true/.test(src), 'his howl still calls the pups (kept per Daniel)');

/* THE BOUGHS */
assert.equal(MARK['greathound|boughTell'], '!!', 'THE BOUGHS wears a red !! (no shield turns a bough)');
assert.equal(BY_HAND['greathound|boughTell'], '!!', 'BY_HAND knows the bough tell');
assert.equal(ANSWER['greathound|boughTell'], 'dodge', 'the bot answers THE BOUGHS with a dodge');
assert.ok(CALL_LINES.has('THE BOUGHS: GET CLEAR') && CALL_LINES.has('HIS WARD: HE SHAKES IT OFF'), 'the bough word and the ward word are shown (hint box)');
assert.ok(/tell\('!!', '#ff6b6b', bt, 'boughTell'\); number\(e\.x, e\.y - e\.h - 24, 'THE BOUGHS: GET CLEAR'/.test(src), 'the bough tell has its mark and its word');
assert.ok(/else if \(e\.mode === 'boughTell'\) \{ if \(e\.modeT <= 0\)/.test(src), 'the bough tell resolves');
assert.ok(GH.bough.tell >= 0.75 && GH.bough.tellP2 >= 0.6, 'THE BOUGHS is told long enough to leave the rings');
{ const s = boughSpots(300, 100, 600); assert.equal(s.length, 3, 'three rings'); assert.ok(s.includes(300), 'one where you stand');
  assert.ok(boughHits(300, 305, 200, 200) && !boughHits(300, 300 + GH.bough.r + 2, 200, 200), 'a bough hits on its ring only');
  const free = [...Array(81).keys()].map(i => 260 + i).filter(x => s.every(b => !boughHits(b, x, 200, 200))); assert.ok(free.length > 10, 'there is floor between the rings to stand on'); }
assert.equal(TURN_WORD.greathound, 'GO ROUND', 'his turned blow says GO ROUND');
console.log('great-hound: never on the chip, hit for real from every side (front x' + GH.front + ', behind and above whole, open x' + GH.openMul + '), a told ward, the pups kept, THE BOUGHS told and answered');
