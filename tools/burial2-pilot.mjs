/* tools/burial2-pilot.mjs [tag] [seeds=3] — THE BURIED DEAD, the bot against him: all SEVEN heroes, REFILL health, 150 s, `seeds`
   pinned rolls each (claude/burial2's before/after, docs/briefs/burial-rework-2.md). Prints a row per fight (outcome, seconds, how
   often he was OPENED and by what, the damage taken a minute, which of his moves did it) and the summary; with a tag the rows go to
   work/burial2/pilot-<tag>.txt too (BURIAL2_OUT overrides the folder). Not in the suite: it is a pilot, and it is long. */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || '', seeds = +(process.argv[3] || 3), HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }), rows = [], lines = [];
const say = s => { console.log(s); lines.push(s); };
try {
  for (let s = 1; s <= seeds; s++) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;const opened={};
      const o=await BK.bossLab({bosses:['burial'],heroes:${JSON.stringify(HEROES)},healthMode:'refill',maxSecs:150,modes:true,seed:${s},
        onFrame:({boss,h})=>{const k=h;boss.__o=boss.__o||{};const m=boss.mode;if((m==='stuck'||m==='scorched')&&boss.__last!==m){opened[k]=opened[k]||{};opened[k][m]=(opened[k][m]||0)+1;}boss.__last=m;}});
      return o.rows.map(r=>({h:r.h,won:r.killed,out:r.outcome,secs:r.secs,left:r.hpLeftPct,opened:opened[r.h]||{},perMin:r.takenPerMin,swings:r.swings,hitBy:r.hitBy}));})()`, 1800000);
    for (const x of r) { rows.push({ ...x, seed: s }); say(JSON.stringify({ seed: s, ...x })); } }
  const wins = rows.filter(r => r.won), secs = wins.map(r => r.secs).sort((a, b) => a - b), med = secs.length ? secs[secs.length >> 1] : null;
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0, 0]; by[r.h][1]++; if (r.won) by[r.h][0]++; by[r.h][2] += r.perMin || 0; }
  const op = {}; for (const r of rows) for (const [k, v] of Object.entries(r.opened || {})) op[k] = (op[k] || 0) + v;
  say('THE BURIED DEAD: fights ' + rows.length + ', kills in 150 s ' + wins.length + ' (' + Math.round(100 * wins.length / Math.max(1, rows.length)) + '%), median kill ' + med + ' s, opened ' + JSON.stringify(op));
  say('by hero ' + Object.entries(by).map(([h, [w, n, pm]]) => h + ' ' + w + '/' + n + ' (' + Math.round(pm / n) + ' hp/min)').join(', '));
  const hit = {}; for (const r of rows) for (const [m, v] of Object.entries(r.hitBy || {})) hit[m] = (hit[m] || 0) + v;
  say('damage by his mode: ' + JSON.stringify(Object.fromEntries(Object.entries(hit).sort((a, b) => b[1] - a[1]))));
  say('errors ' + JSON.stringify(pg.errors.slice(0, 3)));
  if (tag) { const d = process.env.BURIAL2_OUT || join(ROOT, 'work/burial2'); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'pilot-' + tag + '.txt'), lines.join('\n') + '\n'); }
} finally { pg.close(); }
