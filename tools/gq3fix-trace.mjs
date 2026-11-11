/* tools/gq3fix-trace.mjs - a one-fight TRACE of the Goblin Queen row (claude/gq3tune, GQ3FIX): samples the hero, the boss and the stage every 0.5 s of game time
   so a stall (the tower) or a hero who never lands a blow (P2) can be read. A measuring tool, not a check.   PORT=8644 node tools/gq3fix-trace.mjs knight 1 [stage=escape|roof|all] [secs=360] */
import { openRetry, fightJs, diffJs } from './boss-run.mjs';
import { STANDARD } from '../src/bot-profile.js';
const [h = 'knight', s = '1', only = 'all', secs = '360'] = process.argv.slice(2);
const { js } = fightJs({ r: 'crown', way: 'built', h, s: +s, profile: STANDARD, flasks: 'kit' }, +secs);
const hook = `(()=>{window.__dense=${process.env.DENSE?JSON.stringify(process.env.DENSE.split(',').map(Number)):'null'};window.__fastP1=${process.env.FASTP1?1:0};BK.__tr=[];let nx=0;const smp=()=>{const t=BK.time||0;if(t<nx)return;nx=t+(window.__dense&&t>window.__dense[0]&&t<window.__dense[1]?0.1:0.5);const b=BK.boss,P=BK.P,st=BK.gqStage?BK.gqStage():'?';if(window.__fastP1&&st==='hall'&&b&&b.hp>60)b.hp=60;
  BK.__tr.push([+t.toFixed(1),st,b?b.mode:null,b?Math.round(b.hp):null,b?Math.round(b.x):null,b?Math.round(b.y):null,b&&b.hidden?1:0,Math.round(P.x),Math.round(P.y),Math.round(P.hp),P.ground?1:0,BK.state+'/'+(P.drink>0?'drink':'')+(P.hurt>0?'hurt':'')+(P.block?'blk':'')+(P.atk>=0?'atk':'')+(P.dodge>0?'dod':'')+(P.vx|0),Object.keys(BK.keys).filter(k=>BK.keys[k]).join('+')]);};
  for(const n of ['step','sim']){const f=BK[n];BK[n]=function(...a){const r=f.apply(this,a);smp();return r;};}})();`;
const keeper = await openRetry(); const pg = await openRetry({ browserPort: keeper.browserPort });
try { await pg.evalp(diffJs()); await pg.evalp(hook); const row = await pg.evalp(js, 1200000);
  const tr = await pg.evalp('BK.__tr');
  for (const r of tr) if (only === 'all' || r[1] === only) console.log(r.join(' '));
  console.log('ROW', JSON.stringify({ outcome: row.outcome, secs: row.secs, gq: row.gq })); console.log(pg.errors.slice(0, 3));
} finally { await pg.close(); await keeper.close(); }
