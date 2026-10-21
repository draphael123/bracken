// tools/bogtroll-diag.mjs - THE BOG TROLL's fight, looked inside (claude/fenroad; a measuring tool, not a check): one human-bot fight per hero and seed
// at the campaign level (the campaign kit's flasks), and what happened in it - his moves, the stucks, the drags, how much of the hero each of his blows
// (and the fen's water) took, the road's sections, and why the bot did what it did (the plan's reasons, counted).
//   PORT=<port> node tools/bogtroll-diag.mjs [knight,warden,pyro] [seeds=1] [--dry]
import { openPage } from './cdp.mjs';
import { campaignLevel } from './boss-level.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), seeds = +(process.argv[3] || 1), lvl = campaignLevel('fenroad'), prof = process.argv.includes('--dry') ? 'human+dry' : 'human';
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of heroes) for (let s = 1; s <= seeds; s++) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${JSON.stringify(h)};BKT.setHeroLevel(h,${lvl});P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
      BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const why={},trail=[];let wf=0,wl=0,dr=0,lastHp=null;
      const row=(await BK.bossLab({bosses:['fenroad'],heroes:[h],maxSecs:240,healthMode:'normal',seed:${s},profile:${JSON.stringify(prof)},modes:true,onFrame:async o=>{why[o.why]=(why[o.why]||0)+1;if(o.P.y>292){wf++;if(lastHp!==null&&o.P.hp<lastHp)wl+=lastHp-o.P.hp;}if(o.P.drinkT>0)dr++;if(lastHp!==null&&o.P.hp<lastHp-0.5&&trail.length<80)trail.push('HIT '+Math.round(o.f/6)/10+'s -'+Math.round(lastHp-o.P.hp)+' '+o.boss.mode+' P'+Math.round(o.P.x)+','+Math.round(o.P.y)+' B'+Math.round(o.boss.x)+' '+o.why+' '+(o.P.lastHurtBy||''));lastHp=o.P.hp;
        if(false)trail.push(Math.round(o.f/60)+'s '+o.boss.mode+' P'+Math.round(o.P.x)+','+Math.round(o.P.y)+' hp'+Math.round(o.P.hp)+' '+o.why);}})).rows[0]||{};
      const R=BK.bogTrollHands().read(),F=BK.fenRoad();return {hitBy:row.hitBy,water:Math.round(wf/60)+'s in the fen, '+Math.round(wl)+' hp lost there, drink frames '+dr,maxHp:BK.P.maxHp,out:row.outcome,secs:row.secs,left:row.hpLeftPct,taken:row.health&&Math.round(row.health.taken||0),ph:R&&R.ph,n:R&&R.n,hurt:R&&R.hurt,fen:F&&F.n,sags:F&&F.sags.filter(q=>q.arena).map(q=>q.id+':'+q.st).join(' '),
        why:Object.entries(why).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>k+' '+v).join(' | '),trail:trail.join('\\n     ')};})()`, 600000);
    console.log(h + ' s' + s + ' L' + lvl + ' ' + prof + ': ' + r.out + ' ' + r.secs + 's left ' + r.left + '% taken ' + r.taken + ' ph' + r.ph);
    console.log('   ' + r.water + ' maxHp ' + r.maxHp); console.log('   n ' + JSON.stringify(r.n) + ' fen ' + JSON.stringify(r.fen) + ' ' + r.sags); console.log('   hurt ' + JSON.stringify(r.hurt) + ' byMode ' + JSON.stringify(r.hitBy)); console.log('   why ' + r.why);
    if (process.argv.includes('--trail')) console.log('   trail\n     ' + r.trail);
  }
} finally { pg.close(); }
