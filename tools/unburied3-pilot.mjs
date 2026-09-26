/* tools/unburied3-pilot.mjs [tag] [seeds=3] — THE UNBURIED FIELD's boss, the bot against him: all SEVEN heroes, REFILL health, 150 s,
   `seeds` pinned rolls each (docs/briefs/unburied-deathknight.md; claude/unburied3's before/after). Whatever L.arena.boss names is
   fought, so the same command measured THE FIRST DEATH KNIGHT before the lane and THE DEATH KNIGHT after it. Prints a row per fight
   (outcome, seconds, how often he was OPENED, the damage taken a minute, which of his moves did it) and the summary; with a tag the
   rows and the summary go to work/unburied3/pilot-<tag>.txt as well. Not in the suite: it is a pilot, and it is long. */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || '', seeds = +(process.argv[3] || 3), HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }), rows = [], lines = [];
const say = s => { console.log(s); lines.push(s); };
try {
  for (let s = 1; s <= seeds; s++) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;
      const o=await BK.bossLab({bosses:['unburied'],heroes:${JSON.stringify(HEROES)},healthMode:'refill',maxSecs:150,modes:true,seed:${s}});
      return o.rows.map(r=>({boss:r.boss,h:r.h,won:r.killed,out:r.outcome,secs:r.secs,left:r.hpLeftPct,opened:r.opened,perMin:r.takenPerMin,swings:r.swings,hitBy:r.hitBy,modes:r.modes}));})()`, 900000);
    for (const x of r) { rows.push({ ...x, seed: s }); say(JSON.stringify({ seed: s, ...x })); } }
  const wins = rows.filter(r => r.won), secs = wins.map(r => r.secs).sort((a, b) => a - b), med = secs.length ? secs[secs.length >> 1] : null;
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0, 0]; by[r.h][1]++; if (r.won) by[r.h][0]++; by[r.h][2] += r.perMin; }
  say('boss ' + (rows[0] && rows[0].boss) + ': fights ' + rows.length + ', kills in 150 s ' + wins.length + ' (' + Math.round(100 * wins.length / Math.max(1, rows.length)) + '%), median kill ' + med + ' s, opened ' + rows.reduce((a, r) => a + (r.opened || 0), 0) + ' times');
  say('by hero ' + Object.entries(by).map(([h, [w, n, pm]]) => h + ' ' + w + '/' + n + ' (' + Math.round(pm / n) + ' hp/min)').join(', '));
  say('errors ' + JSON.stringify(pg.errors.slice(0, 3)));
  if (tag) { const d = join(ROOT, 'work/unburied3'); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'pilot-' + tag + '.txt'), lines.join('\n') + '\n'); }
} finally { pg.close(); }
