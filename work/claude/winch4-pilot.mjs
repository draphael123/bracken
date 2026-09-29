// work/claude/winch4-pilot.mjs - THE WINCHMASTER, knight / warden / pyro x 1 seed (3100), normal health: the lane pilot (claude/winch4).
// The same run as tools/winchmaster-pilot.mjs's first pass, three heroes only (the cost rules). usage: node work/claude/winch4-pilot.mjs
import { openPage } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=3100;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const o=await BK.bossLab({bosses:['oreroad'],heroes:['knight','warden','pyro'],healthMode:'normal',maxSecs:300,modes:true,salt:0});
    return o.rows.map(r=>({h:r.h,out:r.outcome||(r.won?'win':r.dead?'death':''),secs:r.secs,taken:r.health&&r.health.damageTaken,opened:r.opened,left:r.hpLeftPct,falls:r.falls,hitBy:r.hitBy,modes:r.modes,phase3:r.phase3}));})()`, 900000);
  for (const x of r) console.log(JSON.stringify(x));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
