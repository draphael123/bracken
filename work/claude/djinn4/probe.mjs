// one boss-lab fight on the Djinn, campaign level, and what the flood did (scratch probe, not a check)
import { openPage } from '../../../tools/cdp.mjs';
import { LEVELS } from '../../../src/level.js';
import { depthsOf } from '../../../src/campaign-order.js';
const h = process.argv[2] || 'knight', seed = +(process.argv[3] || 1), lvl = Math.max(1, depthsOf(LEVELS).welltown ?? 1);
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
  BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();let ph={},why={};
  const r=(await BK.bossLab({bosses:['welltown'],heroes:[h],maxSecs:240,healthMode:'normal',seed:${seed},onFrame:async(o)=>{const d=BK.djinn();if(d){ph[d.ph]=(ph[d.ph]||0)+1;if(d.ph===3)why[o.why]=(why[o.why]||0)+1;const S=BK.djinnHands().show();if(o.why==='throw the pail into his core'||(S.pails&&S.pails.length)||S.n.splashed!==(ph.sp||0)){ph.sp=S.n.splashed;(ph.log=ph.log||[]).push([o.f,o.why,o.boss.mode,+o.boss.modeT.toFixed(2),S.ward&&+S.ward.toFixed(2),S.pails&&S.pails.length,S.n.splashed||0,S.n.chokes||0,Math.round(o.P.x-o.boss.x)]);}}}})).rows[0]||{};
  const d=BK.djinn();return {lvl:${lvl},outcome:r.outcome,secs:r.secs,left:r.hpLeftPct,taken:r.health&&Math.round(r.health.damageTaken),n:d&&d.n,hurt:d&&d.hurt,ph,why};})()`, 900000);
  console.log(JSON.stringify(r)); } finally { pg.close(); }
