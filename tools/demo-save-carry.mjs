/* tools/demo-save-carry.mjs - A DEMO SAVE CARRIES OVER TO THE FULL GAME, AND CANNOT BREAK IT (claude/demoend, Daniel 11-03 18:50; src/demo-save.js, src/progression.js). Node only, no page.
   The save-safety test demo -> full:
     A. EXPORT   the demo's save (tagged `demoSave`) goes through exportProgress -> a file -> the full game's importProgress, and the full game's IMPORT SAVE reads it through prepareImport:
                 the hero's xp / skills / loadout / unlocked heroes / coins / the slice's clears and medals / boss records come across EXACTLY; the tag stays and `demoImported` is added
     B. LOCKED   anything past Kingswood in the file (a level record, a done-mark, a road-open flag - a hand-edited or leaked entry) is dropped, so the road beyond opens only by reaching it; the
                 Scree Path (needs kings) is open by the chain alone: kings cleared, scree has no record
     C. SAFE     the full game's own slot is backed up before the import (before-import copy, the exact text), the source file is kept, a damaged file is refused and leaves the slot as it was,
                 a slot left from a later version is refused, and the imported save loads clean (migrateProgress takes it, slotHealth says ok) and re-exports to the same thing
     D. OFF      a file with no tag (the full game's own export) imports byte for byte as before: prepareImport returns the same string, and the stored slot equals a plain importProgress */
import assert from 'node:assert/strict';
import { migrateProgress, exportProgress, importProgress } from '../src/progression.js';
import { slotHealth } from '../src/save-safety.js';
import { LEVELS } from '../src/level.js';
import { prepareImport, tag, DEMO_TAG, IMPORT_TAG } from '../src/demo-save.js';

class Fake { constructor() { this.m = new Map(); }
  get length() { return this.m.size; } key(i) { return [...this.m.keys()][i] ?? null; } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } }
const K = 'bracken.progress.2', IDS = LEVELS.filter(l => !l.hidden).map(l => l.id);

/* the demo player: levels, skills, an unlocked hero, coins, a clear of every slice wood, Gorm beaten */
const demo = migrateProgress(null).progress;
demo.hero = 'ranger'; demo.heroes = { knight: true, ranger: true, pyro: true }; demo.coins = 431;
demo.xp = { knight: 900, ranger: 4200, pyro: 150 };
demo.done = { ranger: { wood: 1, hornetsnest: 1, marsh: 1, fenroad: 1, stockade: 1, spore: 1, rootway: 1, underleaf: 1, palisadewood: 1, kings: 1 }, knight: { wood: 1 } };
for (const id of ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings', 'burning']) demo[id] = { cleared: true, best: 100 + id.length, gold: 3, medal: 1 };
demo.burningOpen = true; demo.kingsOpen = true; demo.palisadeOpen = true;
tag(demo, LEVELS); assert.equal(demo[DEMO_TAG], 1, 'a save that cleared nothing past the slice is tagged by the demo');
const fileA = exportProgress(demo);   /* what END CARD > KEEP YOUR PROGRESS (and SETTINGS > EXPORT SAVE) writes */
assert.ok(JSON.parse(fileA)[DEMO_TAG] === 1, 'the file carries the tag');

/* ---- A. EXPORT -> IMPORT ---- */
const full = new Fake(); const prevFull = JSON.stringify(migrateProgress(null).progress); full.setItem(K, prevFull);   /* a slot the full game already had */
const prepared = prepareImport(fileA, LEVELS), res = importProgress(full, K, prepared, IDS);
const got = JSON.parse(full.getItem(K));
for (const k of ['hero', 'heroes', 'coins', 'xp', 'done', 'skillOwned', 'loadouts']) assert.deepEqual(got[k], demo[k] ?? got[k], 'carried: ' + k);
assert.equal(got.coins, 431); assert.deepEqual(got.xp, demo.xp); assert.deepEqual(got.heroes, demo.heroes); assert.equal(got.hero, 'ranger');
for (const id of ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings', 'burning']) assert.deepEqual(got[id], demo[id], 'carried: the clear of ' + id);
assert.equal(got[DEMO_TAG], 1, 'the tag stays: this save began as a demo save'); assert.equal(got[IMPORT_TAG], 1, 'and says it was imported');
assert.equal(got.burningOpen, true); assert.equal(got.kingsOpen, true); assert.equal(got.palisadeOpen, true);
console.log('ok  A EXPORT  hero ranger, 3 heroes, xp, coins, 11 clears + medals + the in-slice road flags come across; tagged demoSave + demoImported');

/* ---- B. LOCKED ---- */
const leaky = JSON.parse(fileA); leaky.scree = { cleared: true }; leaky.hanging = { cleared: true }; leaky.crown = { cleared: true }; leaky.hangingOpen = true; leaky.crownOpen = true; leaky.skyOpen = true; leaky.done.ranger.scree = 1; leaky.done.knight.crown = 1;
const full2 = new Fake(); importProgress(full2, K, prepareImport(JSON.stringify(leaky), LEVELS), IDS);
const g2 = JSON.parse(full2.getItem(K));
for (const id of ['scree', 'hanging', 'crown']) assert.equal(g2[id], undefined, id + ' (past Kingswood) has no record after the import');
for (const k of ['hangingOpen', 'crownOpen', 'skyOpen']) assert.equal(g2[k], undefined, k + ' dropped');
assert.equal(g2.done.ranger.scree, undefined); assert.equal(g2.done.knight.crown, undefined); assert.equal(g2.done.ranger.kings, 1, 'the slice done-marks stay');
assert.ok(g2.kings.cleared && !g2.scree, 'Kingswood cleared, the Scree Path not: it opens by the chain (needs kings), by being reached');
const byId = Object.fromEntries(LEVELS.map(l => [l.id, l])); assert.equal(byId.scree.needs, 'kings');
console.log('ok  B LOCKED  scree / hanging / crown records, their done-marks and 3 road-open flags are dropped; the road past Kingswood opens only by the chain');

/* ---- C. SAFE ---- */
assert.equal(full.getItem(K + '.before-import.' + [...full.m.keys()].find(k => k.includes('.before-import.')).split('.before-import.')[1]), prevFull, 'the slot the full game had is backed up, the exact text');
assert.ok([...full.m.keys()].some(k => k.includes('.import-source.')), 'the imported file text is kept');
assert.equal(slotHealth(full.getItem(K), IDS).state, 'ok', 'the imported slot reads healthy');
const again = migrateProgress(full.getItem(K), IDS); assert.equal(again.changed, false, 'it needs no further migration');
assert.deepEqual(JSON.parse(exportProgress(again.progress)), got, 'and re-exports to the same thing');
const cut = new Fake(); cut.setItem(K, prevFull);
assert.throws(() => importProgress(cut, K, prepareImport(fileA.slice(0, fileA.length - 20), LEVELS), IDS), /Unreadable|Original/, 'a truncated file is refused');
assert.equal(cut.getItem(K), prevFull, 'and the slot is exactly as it was');
const newer = JSON.parse(fileA); newer.progressionVersion = 99;
assert.throws(() => importProgress(cut, K, prepareImport(JSON.stringify(newer), LEVELS), IDS), /newer version/, 'a demo file from a LATER game is refused');
assert.equal(cut.getItem(K), prevFull);
const evil = fileA.replace('{', '{"__proto__": {"x": 1},');
assert.throws(() => importProgress(cut, K, prepareImport(evil, LEVELS), IDS), /Unsafe|Unreadable|Original/, 'an unsafe key is refused');
assert.equal(cut.getItem(K), prevFull);
console.log('ok  C SAFE    the old slot backed up byte for byte, the source kept, the result healthy and stable; truncated / later-version / unsafe files refused with the slot untouched');

/* ---- D. OFF ---- */
const plainFile = exportProgress(migrateProgress(JSON.stringify({ hero: 'knight', coins: 12, wood: { cleared: true }, scree: { cleared: true } }), IDS).progress);
assert.equal(prepareImport(plainFile, LEVELS), plainFile, 'an untagged file passes through as the same string');
const s1 = new Fake(), s2 = new Fake(); importProgress(s1, K, prepareImport(plainFile, LEVELS), IDS); importProgress(s2, K, plainFile, IDS);
assert.equal(s1.getItem(K), s2.getItem(K), 'and the stored slot equals a plain import');
assert.equal(JSON.parse(s1.getItem(K)).scree.cleared, true, 'a full save keeps its Scree Path clear'); assert.equal(JSON.parse(s1.getItem(K))[DEMO_TAG], undefined);
console.log('ok  D OFF     an untagged (full-game) file imports exactly as before; its later clears stay');
console.log('demo-save-carry: all green');
