/* tools/level-walk-selftest.mjs - THE LEVEL WALKER RUNS AND REPORTS (claude/walker). A light check of tools/level-walk.mjs, not a difficulty gate:
   one short walk of the marsh (knight, seed 1, 1500 frames) at its campaign level, and the row it hands back has the hero it was promised
   (campaign level, typical build, tonics, the human eyes on level foes) and every field the baseline table reads. ~20 s with the page. */
import { walkCfg, runWalks, summarize, table, line, TARGET } from './level-walk.mjs';
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const cfg = walkCfg('marsh', 'knight', 1, { frames: 1500, stuck: 1400 });
ok(cfg.lvl >= 3, 'campaign level ' + cfg.lvl + ' (boss-level floor is L3)'); ok(cfg.route.length > 20, 'a route of ' + cfg.route.length + ' nodes');
ok(cfg.tonics >= 1 && cfg.profile === 'human', 'tonics ' + cfg.tonics + ', profile ' + cfg.profile);
const [r] = await runWalks([cfg], { jobs: 1 });
if (!r || r.err) fails.push('the walk failed: ' + (r && r.err));
else {
  console.log(line(r));
  ok(r.frames > 0 && r.frames <= 1500, 'frames ' + r.frames);
  ok(r.maxHp > 105, 'max hp ' + r.maxHp + ' (a campaign-level knight with the typical card is over a fresh save\'s 100-102)');
  ok(Array.isArray(r.kit) && r.kit.length >= 1, 'a skill in the slot (' + JSON.stringify(r.kit) + ')');
  ok(r.tonics === cfg.tonics, 'tonics carried');
  ok(r.eyes && typeof r.eyes.reads === 'number', 'the human eyes ran on the level foes (' + JSON.stringify(r.eyes) + ')');
  ok(Array.isArray(r.sections) && r.sections.length >= 1 && ['lost', 'small', 'drinks', 'deaths', 'hits', 'kills', 'secs'].every(k => k in r.sections[0]), 'per-section fields');
  ok(Array.isArray(r.arrivals) && Array.isArray(r.deathLog) && typeof r.walked === 'number' && r.walked > 0, 'arrivals, deaths and walked% reported (walked ' + r.walked + '%)');
  ok(['frames', 'stuck', 'route', 'boss', 'gate', 'wall'].includes(r.end), 'end ' + r.end);
  ok(!r.pageErrors, 'no page errors: ' + JSON.stringify(r.pageErrors));
  const t = table(summarize([r])); ok(t.includes('marsh') && TARGET.arriveHp === 50, 'the table reads the row');
}
if (fails.length) { console.log('level-walk-selftest: FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('level-walk-selftest: ok');
