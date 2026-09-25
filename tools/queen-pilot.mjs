/* tools/queen-pilot.mjs [maxSecs=300] [seeds=1] — THE GOBLIN QUEEN, piloted by the boss-lab hands with every hero: the settings
   6ac9c23 used (bossLab crown, refill health, a 300 s cap), plus how she was opened - how often a chandelier and how often a
   pillar pinned her, and which of her attacks did the damage. Not in the suite: it is too long. Prints one row a fight and a
   summary: wins, and the median time of a win. `seeds` > 1 repeats every hero on a different pinned roll (opts.seed). */
import { openPage } from './cdp.mjs';
const maxSecs = +(process.argv[2] || 300), seeds = +(process.argv[3] || 1);
const HEROES = ['knight', 'warden', 'geomancer', 'pyro', 'paladin', 'pirate', 'reaper'];
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let s = 0; s < seeds; s++) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;
      /* count what pinned her: the pin callout names its cause, so the lab row does not have to know */
      const pins={};let last=null;
      const o=await BK.bossLab({bosses:['crown'],heroes:${JSON.stringify(HEROES)},maxSecs:${maxSecs},modes:true${s ? ",seed:'s" + s + "'" : ''},
        onFrame:({boss,h})=>{const p=pins[h]=pins[h]||{};if(boss.mode==='pinned'&&last!=='pinned'){const c=boss.pinBy||'other';p[c]=(p[c]||0)+1;}last=boss.mode;},
        });
      return o.rows.map(r=>({h:r.h,out:r.outcome,secs:r.secs,left:r.hpLeftPct,perMin:r.takenPerMin,swings:r.swings,pins:pins[r.h]||{},charges:r.modes&&r.modes.charge||0,hitBy:r.hitBy}));})()`, 3600000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
  }
  const wins = rows.filter(r => r.out === 'win' || r.out === 'trade'), secs = wins.map(r => r.secs).sort((a, b) => a - b), med = secs.length ? secs[secs.length >> 1] : null;
  console.log('fights ' + rows.length + ', wins ' + wins.length + ' (' + Math.round(100 * wins.length / rows.length) + '%), median win ' + med + ' s, range ' + (secs[0] ?? '-') + '-' + (secs[secs.length - 1] ?? '-') + ' s');
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
