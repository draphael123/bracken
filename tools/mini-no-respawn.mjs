// tools/mini-no-respawn.mjs - MINIS NEVER RESPAWN (B18; claude/sealedpyramid3). Node only, no page.
//   A  src/mini-keep.js, pure: one mini, two minis (the Deep Rails), boss rush, the Unburied Field's gate, no save
//   B  main.js wires it ONCE at the shared lifecycle: spawnEntities() reads the save after its reset and before anything is spawned (behind MINIS_STAY_DOWN)
//   C  EVERY LEVEL WITH A MINI: her placed row is the one spawnEnt's guard skips once the save says she is down; her gate column has the PORT cells it opens
//      (or the level keeps its gate shut on purpose); a death after her win (PROG written by miniEnd before any shrine) keeps her down and her gate open
//     node tools/mini-no-respawn.mjs [--v]
import fs from 'fs';
import { miniKeep, miniStaysDown } from '../src/mini-keep.js';
import { LEVELS, T } from '../src/level.js';
import * as SP3 from '../src/sealed-pyramid3.js';

let fails = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fails++; console.log('  FAIL ' + m); } else if (process.argv.includes('--v')) console.log('  ok   ' + m); };

console.log('== A. src/mini-keep.js (pure)');
{ const L = { mini: { boss: 'x', gate: 40 } };
  ok(!miniKeep(L, undefined).done && miniKeep(L, undefined).gates.length === 0, 'no save: she stands, her gate shut');
  ok(miniKeep(L, { mini: true }).done && miniKeep(L, { mini: true }).gates[0] === 40, 'beaten: she stays down and her gate opens');
  ok(!miniKeep(L, { mini: true }, true).done, 'boss rush: every mini every time');
  ok(miniKeep({ ...L, unburied: true }, { mini: true }).done && miniKeep({ ...L, unburied: true }, { mini: true }).gates.length === 0, 'the Unburied Field: down, but its gate is the chapel\'s');
  const m1 = { boss: 'a', gate: 10 }, m2 = { boss: 'b', gate: 20 }, L2 = { mini: m1, mini2: m2 };
  ok(miniKeep(L2, {}).mini === m1 && !miniKeep(L2, {}).done, 'two minis, none down: the road meets the first');
  ok(miniKeep(L2, { mini: true }).mini === m2 && !miniKeep(L2, { mini: true }).done && miniKeep(L2, { mini: true }).gates.join() === '10', 'the first down: the road meets the second, the first gate open');
  ok(miniKeep({ mini: m2, mini1: m1, mini2: m2 }, { mini: true, mini2: true }).done && miniKeep({ mini: m2, mini1: m1, mini2: m2 }, { mini: true, mini2: true }).gates.join() === '10,20', 'both down (asked mid-level, L.mini already the second): both gates open');
  ok(miniStaysDown(L, { mini: true }, { t: 'x' }) && !miniStaysDown(L, {}, { t: 'x' }), 'the spawn row: skipped once she is down, spawned before');
  ok(miniStaysDown(L2, { mini: true }, { t: 'a', mini: true }) && !miniStaysDown(L2, { mini: true }, { t: 'b', mini: true }), 'two minis: the first skipped, the second still spawns'); }

console.log('== B. main.js: one place, the shared lifecycle');
{ const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const fn = src.indexOf('function spawnEntities() {'), reset = src.indexOf('miniActive = false; miniDone = false;', fn), hook = src.indexOf('const mk = miniKeep(L, PROG[curId()], false)', fn), loop = src.indexOf('forEach((e, k) => { const n0 = enemies.length; spawnEnt(e);', fn);
  ok(fn > 0 && reset > fn && hook > reset && loop > hook, 'spawnEntities: the reset, THEN the save is read, THEN the level is spawned');
  ok(src.split('miniKeep(').length - 1 === 1, 'miniKeep is called once in main.js (one fix, every mini)');
  ok(/SP3\.minisStayOn\(\) && L\.mini && !rushOn\(\)/.test(src), 'behind MINIS_STAY_DOWN (src/sealed-pyramid3.js) and never in a boss rush');
  ok(/PROG\[id\]\.mini = true; saveProgress\(\)/.test(src.slice(src.indexOf('function miniEnd('), src.indexOf('function miniEnd(') + 2000)), 'miniEnd writes the save the moment she falls (before any shrine): a death after the win keeps her down'); }

console.log('== C. every level with a mini');
let levels = 0;
for (const lv of LEVELS) {
  let L; try { L = lv.build(); } catch (err) { continue; }
  if (!L || !L.mini) continue; levels++;
  const rows = (L.ents || []).filter(e => e.t === L.mini.boss), marked = rows.filter(e => e.mini);
  ok(rows.length > 0, lv.id + ': her row is placed (' + L.mini.boss + ')');
  const skip = e => miniStaysDown(L, L.mini2 ? { mini: true, mini2: true } : { mini: true }, e);
  ok(rows.filter(e => marked.length ? e.mini : true).every(skip), lv.id + ': once down, every row that is her is skipped on a respawn');
  if (L.mini.gate !== undefined && !L.unburied) { let port = 0; for (let y = 0; y < L.H; y++) if (L.grid[y * L.W + L.mini.gate] === T.PORT) port++;
    ok(port > 0 || L.mini.gate === L.mini.wallL || L.harborSections || L.reverseTower, lv.id + ': her gate column ' + L.mini.gate + ' has the cells a respawn opens (' + port + (L.mini.gate === L.mini.wallL ? '; it is her wall, no portcullis' : '') + ')'); }
  const k = miniKeep(L, L.mini2 ? { mini: true, mini2: true } : { mini: true });
  ok(k.done, lv.id + ': a death after her win: she stays down');
}
ok(levels >= 8, 'mini levels found: ' + levels);
ok(typeof SP3.MINIS_STAY_DOWN === 'boolean', 'the flag exists (MINIS_STAY_DOWN = ' + SP3.MINIS_STAY_DOWN + ')');

console.log(fails ? '\nFAIL mini-no-respawn: ' + fails + ' of ' + n : '\nok  mini-no-respawn: ' + n + ' checks (' + levels + ' mini levels)');
process.exit(fails ? 1 : 0);
