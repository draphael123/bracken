/* tools/mother-hard-pilot.mjs [passes=4] — THE HARDER MOTHER CAP at NORMAL health (batch 4a): all six heroes, `passes` seeded passes
   each (four is twenty-four fights, over the brief's twenty-one). One life per fight, no refills. Prints a row per fight and the
   summary the brief asks for: the win rate (target about 60-75%, where the old Mother was 6 of 6 untouched), the median win, and
   how much damage she lands. Not in the suite: it is too long (tools/mother-pilot.mjs is the suite's short one). */
import { openPage } from './cdp.mjs';
const passes = +(process.argv[2] || 4), pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let p = 0; p < passes; p++) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=${3031 + p * 197};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
      const o=await BK.bossLab({bosses:['spore'],healthMode:'normal',maxSecs:240,modes:true});
      return o.rows.map(r=>({h:r.h,won:r.outcome==='win',out:r.outcome,secs:r.secs,hp:r.health&&Math.round(r.health.endHp),taken:Math.round(r.health?r.health.damageTaken:0),hitBy:r.hitBy}));})()`, 1200000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x)); }
  const wins = rows.filter(r => r.won), secs = wins.map(r => r.secs).sort((a, b) => a - b), med = secs.length ? secs[secs.length >> 1] : null;
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.won) by[r.h][0]++; }
  const hurt = rows.filter(r => r.taken > 0).length, avg = Math.round(rows.reduce((a, r) => a + r.taken, 0) / rows.length);
  console.log('fights ' + rows.length + ', wins ' + wins.length + ' (' + Math.round(100 * wins.length / rows.length) + '%), median win ' + med + ' s; she drew blood in ' + hurt + ', ' + avg + ' damage a fight; by hero ' + Object.entries(by).map(([h, [w, n]]) => h + ' ' + w + '/' + n).join(', '));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
