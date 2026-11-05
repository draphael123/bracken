import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, seed: 5 });
try {
  for (const [a, b] of [['warden','knight'],['knight','warden'],['pyro','berserker']]) {
    const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const DI=LEVELS.findIndex(l=>l.id==='duel_pit');BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('${a}');BK.reset({fresh:true});BK.applyUpgrades();BK.load(DI);BK.start();BK.coopStart('${b}',false);BK.sim(10);
      const D=BK.duel();D.begin({bots:'all',seed:31});const log=[];let f=0;const seen={};
      while(f<21600&&D.debug().m&&D.debug().m.phase!=='over'){BK.sim(30);f+=30;const d=D.debug();if(f%120===0)log.push(d.seats.map(s=>s.hero+' hp'+s.hp+' x'+s.x+' dl'+s.dealt).join(' | '));}
      const d=D.debug();return {seats:d.seats,stats:d.stats,log:log.slice(0,14),rounds:d.m.log.map(x=>JSON.stringify(x))};})()`);
    console.log(a, 'v', b, JSON.stringify(r.stats)); console.log(r.seats.map(s => s.hero + ' dealt ' + s.dealt).join('  ')); console.log(r.log.join('\n')); console.log(r.rounds.join('\n'));
  }
} finally { pg.close(); }
