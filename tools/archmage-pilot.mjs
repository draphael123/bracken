// tools/archmage-pilot.mjs [salts=1,2,3] [heroes] — THE UNDEAD ARCHMAGE (the Falling Tower's boss, fought from the carpet) through
// BK.bossLab, all seven heroes, one pass per salt (bossLab pins its dice per row; the salt makes each pass its own fight -
// docs/INTEGRATOR.md §6). Round 2 of the tower (docs/briefs/falling-tower-round2.md) measures him before and after his portals:
// REFILL health (the bot is topped up, so the number is how long HE takes, not how long the bot lasts) and a 150 s cap.
// `opened` is how many openings the bot had (the mark that finds no one; after round 2 also THE DODGE-THROUGH), `hitBy` which of
// his modes did the damage. Not in the suite: it is too long.
// usage: node tools/archmage-pilot.mjs            (salts 1,2,3 x 7 heroes = 21 fights)
//        HEALTH=normal CAP=300 node tools/archmage-pilot.mjs 1 knight,warden
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1,2,3').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const health = process.env.HEALTH || 'refill', cap = +(process.env.CAP || 150);
const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  for (const salt of salts) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const o=await BK.bossLab({bosses:['fallingtower'],heroes:${JSON.stringify(heroes)},healthMode:${JSON.stringify(health)},maxSecs:${cap},modes:true,salt:${salt}});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),opened:r.opened,left:r.hpLeftPct,swings:r.swings,hitBy:r.hitBy,portal:r.portal}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x));
    rows.push(...r);
  }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  const by = {}; for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.out === 'win') by[r.h][0]++; }
  const hit = {}; for (const r of rows) for (const [k, v] of Object.entries(r.hitBy || {})) hit[k] = (hit[k] || 0) + v;
  const left = rows.filter(r => r.out !== 'win' && typeof r.left === 'number').map(r => r.left).sort((a, b) => a - b);
  console.log(JSON.stringify({ health, cap, fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    medianLeftOnLoss: left.length ? left[left.length >> 1] : null, openedAvg: +(rows.reduce((a, r) => a + (r.opened || 0), 0) / Math.max(1, rows.length)).toFixed(1),
    byHero: Object.fromEntries(Object.entries(by).map(([h, [w, n]]) => [h, w + '/' + n])), hitBy: Object.fromEntries(Object.entries(hit).map(([k, v]) => [k, Math.round(v)])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
