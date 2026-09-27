// tools/duneworm-pilot.mjs [salts=1,2,3] [heroes] — THE DUNE WORM at NORMAL health (docs/briefs/dune-worm.md), all seven heroes (the
// Geomancer too: src/lab.js's own list stops at six), one pass per salt. bossLab pins its dice per row and the salt makes each pass its
// own fight (docs/INTEGRATOR.md §6: a pilot that loops passes without a salt measures pass 1 again). The house band is 60-75% wins with
// the median win at 90-150 s; the arc brief asks for >= 21 runs. `tangles` is how many times a breach came up into the rolled-out shade
// (THE OPENING), `hitBy` which of his modes did the damage. Not in the suite: it is too long.
// usage: node tools/duneworm-pilot.mjs            (salts 1,2,3 x 7 heroes = 21 fights)
//        node tools/duneworm-pilot.mjs 1 knight,warden
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
const salts = (process.argv[2] || '1,2,3').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const level = process.env.LEVEL || 'caravan';   /* LEVEL=fallingtower measures the Undead Archmage the same way, for the comparison */
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
const rows = [];
try {
  for (const salt of salts) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const o=await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:300,modes:true,salt:${salt}});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,hp:r.health&&Math.round(r.health.endHp),taken:r.health&&Math.round(r.health.damageTaken),tangles:r.opened,left:r.hpLeftPct,swings:r.swings,hitBy:r.hitBy,modes:r.modes}));})()`, 1800000);
    for (const x of r) console.log(JSON.stringify(x));
    rows.push(...r);
  }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b), all = rows.map(r => r.secs).sort((a, b) => a - b);
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.out === 'win') by[r.h][0]++; }
  const hit = {}; for (const r of rows) for (const [k, v] of Object.entries(r.hitBy || {})) hit[k] = (hit[k] || 0) + v;
  console.log(JSON.stringify({ level, fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    medianFight: all.length ? all[all.length >> 1] : null, band: '60-75% wins, median win 90-150 s', tanglesAvg: +(rows.reduce((a, r) => a + (r.tangles || 0), 0) / Math.max(1, rows.length)).toFixed(1),
    byHero: Object.fromEntries(Object.entries(by).map(([h, [w, n]]) => [h, w + '/' + n])), hitBy: Object.fromEntries(Object.entries(hit).map(([k, v]) => [k, Math.round(v)])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
