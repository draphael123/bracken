// tools/pal-smite.mjs - THE PALADIN'S THIRD HIT IS THE COMBO FINISHER SMITE (claude/palsmite + palsmite3, Daniel 11-04 11:50). NODE ONLY: no browser. Checks the numbers in src/holy-ground.js
// (HG.smite3) against Daniel's wording ("a heavier hammer smite: short stagger on foes, chip + stagger on bosses, builds Conviction like BK DEBT DRAIN's third hit") and reads src/main.js as
// text for the rules the numbers cannot show (only the Paladin's plain third ground cut, a guarded boss gets none of the chip, FX dice are fxRand, Conviction paid once per swing, a hint line).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HG } from '../src/holy-ground.js';
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const S = HG.smite3;
check('numbers: slower wind-up (a told, heavier blow), short stagger, a boss only nudged', () => {
  assert(S.windRate > 0 && S.windRate < 1, 'heavier = slower wind-up'); assert(S.stagger > 0 && S.stagger <= 1, 'short stagger on foes (the old third cut was 1.2)');
  assert(S.bossStagger > 0 && S.bossStagger <= 0.4, 'a boss stagger is short'); assert(S.bossChip > 0 && S.bossChip <= 0.5, 'chip, not a second blow'); assert(S.poise > 0 && S.poise <= 15);
  assert(S.conv > 0 && S.conv <= 1, 'builds Conviction by a pip or less');
});
check('rules in main.js: Paladin ground third cut only; flagged once per swing; a guarded boss gets none', () => {
  assert(/isPaladin\(\) && P\.heavySwing && !P\.heavy && !rip && !P\.swingKind && !P\.dashCut && \(P\.ground \|\| P\.swim\)\) \{ P\.palSmite3 = true;/.test(main), 'flag set only on the plain third ground cut');
  const rider = main.slice(main.indexOf('function palSmiteRider(e)'), main.indexOf('function heroCut(e)'));
  assert(/P\.heavy \|\| P\.swingRiposte \|\| P\.swingKind \|\| P\.dashCut\) return/.test(rider), 'not the heavy, riposte, kind or dash cuts'); assert(/if \(!P\.palSmGain\) \{ P\.palSmGain = true; convGain\(S\.conv, false\);/.test(rider), 'Conviction once per swing');
  assert(/if \(lcBig\(e\) \|\| e\.maxHp\) \{ if \(guardedFoe\(e\)\) return;/.test(rider), 'a guarded boss: no chip, no stagger, no guard break'); assert(/hurtAs\('light'/.test(rider), 'the chip is a light blow, so the boss resist floor applies');
  assert(/Math\.random = fxRand/.test(rider), 'FX dice are fxRand (game dice untouched)'); assert(!/invul|\.inv\s*=/.test(rider), 'no invulnerability');
});
check('the hero blurb and the first-time hint name the smite', () => { assert(/the third blow is THE OVERHEAD, a told holy smite/.test(main), 'blurb'); assert(/SMITE|smite/i.test(main.slice(main.indexOf('palSmite3 = true') - 200, main.indexOf('palSmite3 = true') + 1600)), 'hint near the flag'); });
if (bad.length) { console.log('PAL-SMITE: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('PAL-SMITE: the third-hit smite holds - short stagger, boss chip only on an unguarded boss (resist floor applies), half a pip of Conviction once per swing, Paladin ground cut only.');
