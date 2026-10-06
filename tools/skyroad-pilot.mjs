// tools/skyroad-pilot.mjs [salts=1] [heroes=knight,warden,pyro] - THE ROC on her EYRIE (src/roc-eyrie.js) at NORMAL health, one pass per salt (claude/skyroad).
// One life per fight; the HUMAN bot (src/roc-eyrie.js rocEyriePlan: a quarter-second late). The hero is the level the campaign expects at THE SKY ROAD (its depth on the
// gate chain, BKT.setHeroLevel, no skills). Prints a row a fight and a summary against the band for a NEW boss (50-60% wins, no hero at 0). Not in the suite: too long.
//   node tools/skyroad-pilot.mjs 1,2,3 knight,warden,pyro
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const lvl = Math.max(1, depthsOf(LEVELS).skyroad ?? 1);
let pg = await openPage({ audio: false, fonts: false }); const rows = [];
/* a fresh page for every fight; a page that will not come back ("the fresh lab page did not initialize", under load) is replaced by a new browser */
const fresh = async () => { for (let k = 0; ; k++) { try { await pg.reload(); return; } catch (e) { if (k >= 2) throw e; try { pg.close(); } catch {} pg = await openPage({ audio: false, fonts: false }); } } };
try {
  for (const salt of salts) for (const h of heroes) { await fresh();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
      const phases={},ns={};
      const o=await BK.bossLab({bosses:['skyroad'],heroes:[h],healthMode:'normal',maxSecs:300,modes:true,salt:${salt},onFrame:({boss,h})=>{phases[h]=Math.max(phases[h]||1,boss.phase||1);const k=BK.rocEyrie().read();if(k)ns[h]={n:k.n};}});
      return o.rows.map(r=>{const q=ns[r.h]||{n:{}};return {h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,phase:phases[r.h],cycles:q.cyc,
        opens:q.n.opens,plunges:q.n.plunges,sticks:q.n.sticks,bolts:q.n.bolts,snatches:q.n.snatches,hitBy:r.hitBy};});})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'roc', heroLevel: lvl, fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    byHero: Object.fromEntries(heroes.map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
