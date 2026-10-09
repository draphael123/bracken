// tools/huntmaster-diag.mjs - THE GOBLIN HUNTMASTER's fight, looked inside (claude/rootway; a measuring tool, not a check): one human-bot fight per
// hero and seed at the campaign level, and what happened in it - his shots (gold, red), the arrows struck home, the breaks and staggers, the cages,
// how much of the hero each of his blows took, and why the bot did what it did (the plan's reasons, counted).
//   PORT=<port> node tools/huntmaster-diag.mjs [knight,warden,pyro] [seeds=1]
import { openPage } from './cdp.mjs';
import { campaignLevel } from './boss-level.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), seeds = +(process.argv[3] || 1), lvl = campaignLevel('rootway');
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) for (let s = 1; s <= seeds; s++) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
      BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const why={};
      const row=(await BK.bossLab({bosses:['rootway'],heroes:[h],maxSecs:240,healthMode:'normal',seed:${s},profile:'human',modes:true,onFrame:async o=>{why[o.why]=(why[o.why]||0)+1;}})).rows[0]||{};
      const R=BK.huntmaster().read(),RW=BK.rootway().read();return {rw:RW&&RW.n,hs:RW&&RW.hoists.filter(q=>/^hm/.test(q.id)).map(q=>q.id+":"+q.state).join(" "),out:row.outcome,secs:row.secs,left:row.hpLeftPct,taken:row.health&&Math.round(row.health.damageTaken),maxHp:BK.P.maxHp,n:R&&R.n,hurt:R&&R.hurt,ph:R&&R.ph,why:Object.entries(why).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>k+':'+v).join(', ')};})()`, 900000);
    console.log(h + ' s' + s + ' L' + lvl + ': ' + r.out + ' ' + r.secs + 's left ' + r.left + '% taken ' + r.taken + '/' + r.maxHp + ' ph' + r.ph);
    console.log('   n ' + JSON.stringify(r.n)); console.log('   hurt ' + JSON.stringify(r.hurt)); console.log('   why ' + r.why); console.log('   rw ' + JSON.stringify(r.rw) + ' ' + r.hs);
  }
} finally { pg.close(); }
