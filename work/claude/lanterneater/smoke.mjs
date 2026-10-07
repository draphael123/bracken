import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='canal'));BK.start();BK.god=true;BK.sim(10);
    const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(60*4);const e=BK.boss;const LH=BK.lanternEaterHands();const S=LH.show();
    const out={active:BK.bossActive,t:e&&e.t,mode:e&&e.mode,raft:S&&Math.round(S.raft.x),mid:S&&S.A.moorMid,onRaft:BK.P.onMover&&!!BK.P.onMover.leRaft,modes:{}};
    for(let i=0;i<60*60;i++){BK.P.hp=BK.P.maxHp;if(i%300===0)BK.step(1);else BK.sim(1);out.modes[e.mode]=(out.modes[e.mode]||0)+1;}
    out.n=S.n;out.read=LH.read();return out;})()`, 300000);
  console.log(JSON.stringify(r)); console.log('errors', pg.errors.slice(0, 5));
} finally { pg.close(); }
