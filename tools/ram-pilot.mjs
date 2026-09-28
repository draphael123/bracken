// tools/ram-pilot.mjs [salt] [heroes] — THE RAM LORD at normal health (the Scree Path lane, A11 rework: the fold widened from 16
// to about 30 tiles with a scree bank on one wall, so his wall crash is a CAUSED opening now, not a guaranteed one). Three
// heroes, one salt, before/after the change - not a standing check, a one-off pilot for the lane report.
// usage: node tools/ram-pilot.mjs                 (salt 1, knight/warden/pyro)
//        node tools/ram-pilot.mjs 2 paladin,pirate,reaper
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
const salt = Number(process.argv[2] || 1);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
    const o=await BK.bossLab({bosses:['scree'],heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:240,modes:true,salt:${salt}});
    return o.rows.map(r=>({h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),opens:r.opened,hitBy:r.hitBy}));})()`, 1800000);
  for (const x of r) console.log(JSON.stringify(x));
  const wins = r.filter(x => x.out === 'win');
  console.log(JSON.stringify({ boss: 'ram', fights: r.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, r.length)), medianTaken: wins.length ? wins.map(x => x.taken).sort((a, b) => a - b)[wins.length >> 1] : null }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
