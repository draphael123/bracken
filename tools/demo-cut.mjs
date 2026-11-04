/* tools/demo-cut.mjs - THE DEMO CUT (claude/demoend, Daniel 11-03 18:45): the DEMO flag ends the game after King Gorm / Kingswood and locks everything past it; flag OFF is the full game.
   Node only, no page. Asserts:
     SLICE   the live `needs:` chain wood -> hornetsnest -> marsh -> fenroad -> stockade -> spore -> rootway -> underleaf -> palisadewood -> kings, the burning spur (opens on Gorm) and the arena yard are
             exactly the demo's levels (src/demo-slots.js DEMO_IDS); every one is reachable with the demo lock on (none is locked by it), in chain order
     LOCKED  every campaign level that is not in the slice - the Scree Path (needs kings) and everything after it, every other act, every secret - is demoLocked; a hidden shop / trial / tavern with no road is not
     END     the last boss of the slice is Kingswood and only Kingswood ends the demo; the road out of it (scree) is locked, so the card is the only way on
     OFF     with the flag off nothing is locked (demoLocked is false for every level), the flag is read from ?demo=1 only, DEMO_BUILD ships false, and a save that is not a demo save imports as the SAME STRING;
             every use of the flag in src/main.js is pinned (a new use must be added here on purpose, and must be of the form that is a no-op when off)
     NAMES   the new shipped file names carry no ad-block word (EasyList / EasyPrivacy: src/admiral.js stalled the load at 14%, 10-27) */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { DEMO_IDS } from '../src/demo-slots.js';
import * as F from '../src/demo-flag.js';
import { prepareImport, demoShaped, tag } from '../src/demo-save.js';

const byId = Object.fromEntries(LEVELS.map(l => [l.id, l]));
/* ---- SLICE ---- */
const CHAIN = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings'];
CHAIN.forEach((id, i) => { assert.ok(byId[id], 'the chain level exists: ' + id); if (i) assert.equal(byId[id].needs, CHAIN[i - 1], id + ' needs ' + CHAIN[i - 1] + ' (the live chain moved: update the slice on purpose)'); });
assert.equal(byId.burning.opensOn && byId.burning.opensOn.level, 'kings', 'the Burning Village spur opens on Gorm (Kingswood)');
assert.deepEqual([...DEMO_IDS].sort(), [...CHAIN, 'burning', 'arena_yard'].sort(), 'DEMO_IDS is the chain + the spur + the arena yard');
for (const id of DEMO_IDS) assert.ok(byId[id], 'the demo level exists: ' + id);
console.log('ok  SLICE   ' + CHAIN.join(' > ') + ' + burning (spur) + arena_yard: the live needs chain');
/* ---- LOCKED (flag ON) ---- */
const on = lv => F.outOfSlice(lv);
const lockedIds = LEVELS.filter(on).map(l => l.id);
for (const id of DEMO_IDS) assert.equal(on(byId[id]), false, id + ' is in the slice and must not be locked');
for (const l of LEVELS) if (!DEMO_IDS.has(l.id) && (!l.hidden || l.secret)) assert.equal(on(l), true, l.id + ' is past the slice and must be locked');
for (const l of LEVELS) if (l.hidden && !l.secret && !DEMO_IDS.has(l.id)) assert.equal(on(l), false, 'hidden ' + l.id + ' (a shop / trial / tavern) stays reachable from the slice');
/* the road out of Kingswood: every level that needs (transitively) a locked level, and scree itself, is locked */
assert.equal(byId.scree.needs, 'kings'); assert.ok(on(byId.scree), 'the Scree Path (the road out of Kingswood) is locked');
let grew = true; const afterKings = new Set(['scree']);
while (grew) { grew = false; for (const l of LEVELS) if (l.needs && afterKings.has(l.needs) && !afterKings.has(l.id)) { afterKings.add(l.id); grew = true; } }
for (const id of afterKings) assert.ok(on(byId[id]), id + ' hangs off the road past Kingswood and must be locked');
console.log('ok  LOCKED  ' + lockedIds.length + ' campaign levels locked (the Scree Path and all after it, ' + afterKings.size + ' hang off it), ' + LEVELS.length + ' levels in all');
/* ---- END ---- */
assert.equal(F.DEMO_LAST, 'kings');
assert.equal(F.demoEndsHere('kings'), F.DEMO, 'demoEndsHere follows the flag');
const endsWith = (flag, id) => flag && id === F.DEMO_LAST;
assert.ok(endsWith(F.flagFrom('?demo=1'), 'kings') && !endsWith(true, 'palisadewood') && !endsWith(true, 'burning') && !endsWith(true, 'scree'), 'only Kingswood ends the demo');
console.log('ok  END     the last boss of the slice is King Gorm (kings); the card follows his win card');
/* ---- OFF ---- */
assert.equal(F.DEMO_BUILD, false, 'DEMO_BUILD ships false');
assert.equal(F.DEMO, false, 'no ?demo=1 in node: the flag is off');
for (const l of LEVELS) assert.equal(F.demoLocked(l), false, 'flag off: demoLocked(' + l.id + ') is false');
for (const s of ['', '?', '?demo=0', '?demo=', '?undemo=1', '?x=1&demo=10', '?dev=1']) assert.equal(F.flagFrom(s), false, 'flag off for "' + s + '"');
for (const s of ['?demo=1', '?x=1&demo=1', '?demo=1&x=2']) assert.equal(F.flagFrom(s), true, 'flag on for "' + s + '"');
assert.equal(F.flagFrom('', true), true, 'the build constant turns it on');
const full = JSON.stringify({ hero: 'knight', coins: 5, scree: { cleared: true }, hangingOpen: true, wood: { cleared: true } }, null, 2);
assert.equal(prepareImport(full, LEVELS), full, 'a save with no demo tag imports as the SAME STRING');
assert.equal(prepareImport('not json', LEVELS), 'not json', 'junk comes back for the importer to refuse');
assert.equal(demoShaped(JSON.parse(full), LEVELS), false, 'a full-game save (Scree cleared) is never tagged');
assert.equal(tag({ wood: { cleared: true } }, LEVELS).demoSave, 1); assert.equal(tag({ scree: { cleared: true } }, LEVELS).demoSave, undefined);
/* every use of the flag in src/main.js: pinned, each of the shape that is a no-op when the flag is off */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const uses = main.split(/\r?\n/).flatMap((ln, i) => [...ln.matchAll(/\bDS\.(DEMO\b|demoLocked|demoEndsHere)[^;]{0,70}/g)].map(m => ({ i, t: m[0] })));
const PINNED = [
  [/^DS\.DEMO && DS\.demoLocked\(lv\)\) \|\|/, 'levelLocked: the lock first, then the full rule untouched'],
  [/^DS\.DEMO && DS\.demoLocked\(LEVELS\[to\]\)\) return false/, 'trnBegin: no walk-out to a locked wood'],
  [/^DS\.DEMO \? bossTable\(\)\.filter/, 'boss select: the slice only'],
  [/^DS\.DEMO \? \[\] : \['THE EDITOR'\]/, 'title: no editor'],
  [/^DS\.DEMO\) DSV\.tag\(PROG, LEVELS\)/, 'progDefaults: tag a demo save'],
  [/^DS\.demoEndsHere\(LEVELS\[levelIndex\]\.id\) \? -1 : partyNextLevel\(\)/, 'win card: no party-next past Gorm'],
  [/^DS\.demoEndsHere\(LEVELS\[levelIndex\]\.id\) && !bossSelectFight/, 'win card: the end card'],
  [/^DS\.DEMO\b/, 'title: no boss rush'],
];
const left = uses.slice();
for (const [re, why] of PINNED) { const k = left.findIndex(u => re.test(u.t)); assert.ok(k >= 0, 'pinned use missing: ' + why + ' | have: ' + uses.map(u => u.t).join(' || ')); left.splice(k, 1); }
assert.equal(left.length, 0, 'an unpinned use of the demo flag in src/main.js (add it to tools/demo-cut.mjs on purpose): ' + left.map(u => 'L' + (u.i + 1) + ' ' + u.t).join(' | '));
console.log('ok  OFF     flag off = nothing locked, untagged saves import as the same string, ' + uses.length + ' pinned uses of the flag in main.js');
/* ---- NAMES ---- */
const NEW_FILES = ['src/demo-flag.js', 'src/demo-save.js', 'src/demo-end.js', 'src/demo-end-config.js', 'tools/demo-cut.mjs', 'tools/demo-save-carry.mjs'];
const ADBLOCK = /(^|[^a-z])(ad|ads|adv|advert|admiral|banner|sponsor|track|tracker|tracking|analytics|beacon|pixel|promo|popup|affiliate|click|stats)([^a-z]|$)/i;
for (const f of NEW_FILES) { const base = f.split('/').pop().replace(/\.m?js$/, ''); assert.ok(!ADBLOCK.test(base), 'ad-block word in ' + f); }
const shipped = readFileSync(new URL('../src/demo-end.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/demo-save.js', import.meta.url), 'utf8');
assert.ok(!/analytics|googletag|doubleclick|gtag\(/.test(shipped), 'no analytics code');
console.log('ok  NAMES   ' + NEW_FILES.map(f => f.split('/').pop()).join(', ') + ': no ad-block word');
console.log('demo-cut: all green');
