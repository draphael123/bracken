import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const LM=await import('/src/lantern-eater.js');BK.manualSimulation=true;BK.SET.speed=1;
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='canal'));BK.start();BK.god=true;BK.sim(10);const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(60*4);
    const e2=BK.boss,S2=BK.lanternEaterHands().show();e2.hp=e2.maxHp*0.3;e2.phase=3;e2.mode='idle';e2.modeT=99;S2.lights=[];S2.lantern.lit=true;S2.lantern.cd=0;const lx2=LM.lanternX(S2);BK.P.x=lx2-16;BK.P.y=S2.A.deck;BK.P.face=1;BK.sim(4);
    const log=[];BK.press('atk');for(let i=0;i<30;i++){e2.mode='idle';e2.modeT=99;BK.sim(1);const hb=BKT.attackBox?BKT.attackBox():null;log.push([BK.P.atk.toFixed(2),hb&&[hb.l|0,hb.r|0,hb.t|0,hb.b|0],S2.lantern.lit,BK.bossActive,[...(BK.P.hitSet||[])].map(String).join('/')]);}
    return {lx:lx2,box:LM.lanternBox(S2),P:[BK.P.x|0,BK.P.y|0],log:log.slice(0,14),hasAB:!!BKT.attackBox};})()`, 300000);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
