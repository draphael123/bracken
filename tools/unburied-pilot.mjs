/* tools/unburied-pilot.mjs [passes=4] [boss] — THE UNBURIED FIELD's mini (whatever L.mini names) or FIRST DEATH KNIGHT (boss, arg 2 = boss) at NORMAL health: all six heroes, `passes` seeded passes each (four is
   twenty-four fights, over the brief's twenty-one). One life per fight, no refills: what the bot loses it keeps. Prints a row
   per fight (outcome, seconds, health left, whether he was OPENED, which of his attacks did the damage) and the summary the
   brief asks for - the win rate and the median time of a win against the 90-150 s band. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const passes = +(process.argv[2] || 4), pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let p = 0; p < passes; p++) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=${4051 + p * 173};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
      const o=await BK.bossLab({bosses:['unburied'],mini:${JSON.stringify(process.argv[3] !== 'boss')},healthMode:'normal',maxSecs:240,modes:true,salt:${p + 1}});   /* bossLab pins each row's dice; without a salt every pass replays pass one (docs/INTEGRATOR.md 6) */
      return o.rows.map(r=>({h:r.h,won:r.outcome==='win',out:r.outcome,secs:r.secs,hp:r.health&&Math.round(r.health.endHp),taken:Math.round(r.health?r.health.damageTaken:0),opened:r.opened,left:r.hpLeftPct,hitBy:r.hitBy,modes:r.modes}));})()`, 1200000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x)); }
  const wins = rows.filter(r => r.won), secs = wins.map(r => r.secs).sort((a, b) => a - b), med = secs.length ? secs[secs.length >> 1] : null;
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.won) by[r.h][0]++; }
  console.log('fights ' + rows.length + ', wins ' + wins.length + ' (' + Math.round(100 * wins.length / rows.length) + '%), median win ' + med + ' s; by hero ' + Object.entries(by).map(([h, [w, n]]) => h + ' ' + w + '/' + n).join(', '));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
