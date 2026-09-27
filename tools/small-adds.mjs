// tools/small-adds.mjs — THE BOTS CUT SMALL ADDS PROPERLY. Every boss lab row now counts the pilot's swings at small foes (FAMILY 'small'
// in main.js: the Mother's sporelings, the Abbot's and the Grandmother's small adds, the Bullfrog's hoppers) and how many of them met air
// (src/lab.js, the small-foe ledger: smallSwings / smallMissed). This runs the boss lab (refill, dice pinned) on every boss whose fight
// puts small foes in front of the bot, all seven heroes, and requires a sane miss rate.
//
// WHY. The Mother pilot cut her sporelings with the plain cut. For most heroes that was harmless; for the Death Knight, whose cut lands a
// third of a second late, it was most of a 154 s fight (claude/dkmother). Nothing said so: the only symptom was one hero's clock. The
// family table's key verb for a small foe is the low sweep, and the pilot now uses it - this is the check that the next pilot does too.
//
// THE THRESHOLD, derived from the heroes that fight well (claude/dk2, 2026-09-24): over the four bosses below, the worst row with four
// or more swings at small foes missed 20% (the warden on the Bullfrog, 1 of 5; the pirate on the Abbot 2 of 11, the pyromancer 3 of 21),
// and all 12 misses in 119 swings are 10%. The pre-dkmother pilot (the plain cut at sporelings) makes the Death Knight miss 5 of 12 on
// the Mother, 42%. A row fails above ONE IN THREE, and only a row with at least four such swings is judged (one miss in two swings is
// noise, not a habit). Proved red: with the pilot's sweep taken out again, this fails on exactly that row. (After the generic strike
// stopped swinging facing away, same lane: 7 of 124 miss, worst judged row 23% - the limit still stands clear of both.)
//   node tools/small-adds.mjs            SMALL_ADDS_OUT=file.json keeps the table
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'node:fs';
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer'];
/* the Mother at mother-pilot's 180 s (her fight is ~110 s; cut at 120 a slow hero's last sporelings would go uncounted) */
const BOSSES = [['spore', 180], ['spire', 120], ['underleaf', 120], ['marsh', 120]];
const MIN_SWINGS = 4, MAX_MISS = 1 / 3;
const pg = await openPage({ audio: false, fonts: false }); const rows = [];
try {
  for (const [lvl, secs] of BOSSES) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const r=await BK.bossLab({bosses:[${JSON.stringify(lvl)}],heroes:${JSON.stringify(HEROES)},maxSecs:${secs}});
      return r.rows.map(x=>({lvl:x.lvl,boss:x.boss,h:x.h,skipped:x.skipped,secs:x.secs,killed:x.killed,smallSwings:x.smallSwings,smallMissed:x.smallMissed}));})()`, 1800000);
    rows.push(...r);
  }
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (process.env.SMALL_ADDS_OUT) writeFileSync(process.env.SMALL_ADDS_OUT, JSON.stringify(rows, null, 1));
const bad = [];
for (const x of rows) {
  assert(!x.skipped, x.lvl + ' ' + x.h + ' was skipped: ' + x.skipped);
  assert(Number.isInteger(x.smallSwings) && Number.isInteger(x.smallMissed), x.lvl + ' ' + x.h + ': the row carries no small-foe ledger');
  if (x.smallSwings >= MIN_SWINGS && x.smallMissed / x.smallSwings > MAX_MISS) bad.push(`${x.lvl}/${x.boss} ${x.h}: missed ${x.smallMissed} of ${x.smallSwings} swings at small foes`);
}
assert.deepEqual(bad, [], 'the pilot misses small foes: ' + bad.join('; '));
/* NOT VACUOUS: a ledger that counts nothing passes everything. The Mother's sporelings must be seen being swung at (35 swings today,
   over seven heroes), and the table as a whole must hold enough swings for a rate to mean anything (119 today). */
const tot = rows.reduce((a, x) => a + x.smallSwings, 0), missed = rows.reduce((a, x) => a + x.smallMissed, 0);
const spore = rows.filter(x => x.lvl === 'spore').reduce((a, x) => a + x.smallSwings, 0);
assert(spore >= 20, 'only ' + spore + ' swings at the Mother\'s sporelings: the ledger is not seeing them');
assert(tot >= 60, 'only ' + tot + ' swings at small foes in the whole table');
console.log(rows.filter(x => x.smallSwings).length + ' rows swung at small foes; ' + missed + ' of ' + tot + ' swings missed (' + Math.round(100 * missed / tot) + '%); worst judged row ' +
  Math.round(100 * Math.max(0, ...rows.filter(x => x.smallSwings >= MIN_SWINGS).map(x => x.smallMissed / x.smallSwings))) + '% (limit ' + Math.round(100 * MAX_MISS) + '%)');
