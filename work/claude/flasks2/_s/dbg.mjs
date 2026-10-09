import { openPage } from '../../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='play';BK.start();BK.enemies().forEach(e=>{e.alive=false;});BK.sim(20);
   const P=BK.P;P.flasks=2;P.hp=30;P.inv=0;P.hurt=0;BK.sim(5);BK.drinkFlask();BK.sim(6);const log=[];log.push(['pre',P.hp,P.drinkT,P.drinkHp,P.down,P.inv]);P.inv=0;const res=BKT.damagePlayer(P.x+20,10,{unblockable:true});log.push(['hit',res,P.hp,P.drinkT,P.drinkHp,P.down,P.hurt]);
   for(let i=0;i<6;i++){BK.sim(1);log.push([i,P.hp,P.drinkT,P.drinkHp,BK.flaskHud.spills.length,BK.flaskHud.spillT,P.flasks]);}return log;})()`, 60000);
  console.log(JSON.stringify(r)); console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
