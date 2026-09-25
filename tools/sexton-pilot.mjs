// tools/sexton-pilot.mjs [salts=1,2,3] [heroes] — THE SEXTON (the Falling Tower's mini, src/sexton.js) at NORMAL health, all seven heroes,
// one pass per salt: bossLab pins its dice per row and the salt makes each pass its own fight (docs/INTEGRATOR.md §6). One life per fight,
// no refills. Prints a row a fight (outcome, seconds, health left, how often he went into THE BELL PIT - the opening - and which of his
// attacks did the damage) and the summary against the house band (60-75% wins, median win 90-150 s for a boss; a mini runs shorter).
// Not in the suite: it is too long.   usage: node tools/sexton-pilot.mjs            (3 salts x 7 heroes = 21 fights)
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1,2,3').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const o=await BK.bossLab({bosses:['fallingtower'],mini:true,heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:240,modes:true,salt:${salt}});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),left:r.hpLeftPct,pits:(r.modes||{}).pit||0,hitBy:r.hitBy}));})()`, 1800000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b), all = rows.map(r => r.secs).sort((a, b) => a - b);
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.out === 'win') by[r.h][0]++; }
  const hit = {}; for (const r of rows) for (const [k, v] of Object.entries(r.hitBy || {})) hit[k] = (hit[k] || 0) + v;
  console.log(JSON.stringify({ mini: 'sexton', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    medianFight: all.length ? all[all.length >> 1] : null, pitsAvg: +(rows.reduce((a, r) => a + r.pits, 0) / Math.max(1, rows.length)).toFixed(1),
    byHero: Object.fromEntries(Object.entries(by).map(([h, [w, n]]) => [h, w + '/' + n])), hitBy: Object.fromEntries(Object.entries(hit).map(([k, v]) => [k, Math.round(v)])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
