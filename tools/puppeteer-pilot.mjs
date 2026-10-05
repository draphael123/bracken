// tools/puppeteer-pilot.mjs [salts=1] [heroes=knight,warden,pyro] [level=theatre] [--depth] - THE PUPPETEER (src/puppeteer.js) at NORMAL health, one pass per
// salt (bossLab pins its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills. Prints a row a fight (outcome, seconds, health taken,
// his health left, the phase and cycle reached, the show's counts - drops, slack bars, bar cuts, clanks, flails, props - what did the damage, and how the
// bot spent its time) and a summary against the house band (60-75% wins). --depth: the hero at the level's campaign depth, no skills (as
// tools/combat-pilots.mjs); without it, the page's fresh hero. Not in the suite: it is too long.
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { levelOverride, campaignLevel } from './boss-level.mjs';   /* --level=N overrides the campaign level (tools/boss-level.mjs) */
const pos = process.argv.slice(2).filter(a => !a.startsWith('--')), DEPTH = !process.argv.includes('--l1');   /* campaign level by default (--l1 = the old fresh level-1 hero; --level=N any level) */
const salts = (pos[0] || '1').split(',').map(Number);
const heroes = (pos[1] || 'knight,warden,pyro').split(',');
const level = pos[2] || 'theatre', lvl = levelOverride() ?? campaignLevel(level);
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) for (const h of heroes) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const phases={},ns={},why={};let cyc=0;
      ${DEPTH ? `{const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;BKT.setHeroLevel(${JSON.stringify(h)},${lvl});P0.skillOwned[${JSON.stringify(h)}]={};P0.loadouts[${JSON.stringify(h)}]=[];if(P0.talents)P0.talents[${JSON.stringify(h)}]={};}` : ''}
      const o=await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:[${JSON.stringify(h)}],healthMode:'normal',maxSecs:360,modes:true,salt:${salt},onFrame:({boss,h,why:w})=>{phases[h]=Math.max(phases[h]||1,boss.phase||1);why[w||'-']=(why[w||'-']||0)+1;const sh=BK.puppeteerHands().show();if(sh){cyc=sh.cycle;ns[h]={bossHp:Math.round(boss.hp)+'/'+boss.maxHp,n:Object.fromEntries(Object.entries(sh.n).filter(([k,v])=>v)),hurt:{...(sh.hurt||{})}};}}});
      const top=Object.entries(why).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>k+':'+Math.round(v/60)+'s');
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),maxHp:BK.P.maxHp,bossLeft:r.hpLeftPct,phase:phases[r.h],cycle:cyc,n:ns[r.h],hitBy:r.hitBy,why:top}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'puppeteer', depth: DEPTH ? lvl : 'fresh', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
