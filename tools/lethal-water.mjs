// tools/lethal-water.mjs - LETHAL WATER MUST READ AS LETHAL (claude/towpathchurch, Daniel 10-16, live photo of the Towpath: "the lock water looks like the water you swim").
// A pool you can neither swim nor wade (no `swim`, not `shallow`) bites or drowns whoever falls in (main.js: the inPool pass - waterHurts hands you back at ~27% elsewhere
// DROWNED). Such a pool must LOOK like it: src/main.js drawDeadWater draws it near-black under a pale fog-skin, with churning froth, sucking eddies, drowned wreckage and a
// reaching hand, and says THE LOCK WATER DROWNS / THIS WATER DROWNS the first time it is on the screen. THIS CHECK is the list: every level's pools that take that look are
// pinned here, so a NEW lethal pool in a level not listed fails until it is read here on purpose (and the pools with their own look - fire, poison, deadly, tarn, mud, rapids,
// capped - stay out of it).
//   node tools/lethal-water.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { isCallout } from '../src/hint-lines.js';
const OWN_LOOK = p => p.harm || p.fire || p.mud || p.rapids || p.tarn || p.capped || p.streetTide;
const LISTED = { wood: 5, marsh: 9, canal: 11, towpath: 13 };   /* levels with pools drawn by drawDeadWater, and how many */
const found = {};
for (const l of LEVELS) { let L; try { L = l.build(); } catch (e) { continue; }
  const n = (L.pools || []).filter(p => !p.swim && !p.shallow && !p.dry && !OWN_LOOK(p)).length; if (n) found[l.id] = n; }
console.log('lethal-looking water by level:', JSON.stringify(found));
assert.deepEqual(found, LISTED, 'a level gained or lost pools you can neither swim nor wade: list it here (and read it: the lethal look is src/main.js drawDeadWater)');
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const fn = src.slice(src.indexOf('function drawDeadWater('), src.indexOf('// AND THE CURRENT, DRAWN'));
for (const [what, re] of [['a pale fog-skin', /fog-skin/], ['churning froth', /churn/], ['sucking eddies', /eddies/], ['drowned wreckage and a hand', /pale hand reaching/], ['a told first sight', /L\.drownTold/]]) assert.ok(re.test(fn), 'drawDeadWater lacks ' + what);
assert.ok(isCallout('THE LOCK WATER DROWNS') && isCallout('THIS WATER DROWNS'), 'the drowning lines are hint lines (they draw in the hint box)');
assert.ok(!/ p\.swim && !p\.shallow\) \{[^}]*drawDeadWater/.test(src), 'a swimmable pool is never drawn lethal');
const tp = LEVELS.find(l => l.id === 'towpath').build(); assert.ok(tp.waterHurts, 'the Towpath\'s water still bites and hands you back (waterHurts)');
console.log('lethal-water: ok');
