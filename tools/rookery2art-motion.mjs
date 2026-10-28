/* tools/rookery2art-motion.mjs - the sisters IN MOTION, headless (claude/rookery2art): fights a god-mode knight for N seconds in phase 1, then kills two sisters (every order) and fights the survivor,
   rendering every frame (BK.step) and tallying, per role, the POSE each mode wore and how long it held, plus page errors / NaN lines. Fails (exit 1) on any page error or a mode with no pose.
   Not in the suite.  SECS=40 PORT=<port> node tools/rookery2art-motion.mjs */
import { openPage } from './cdp.mjs';
const SECS = +(process.env.SECS || 40);
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='rookery');BK.manualSimulation=true;
    const SHm=await import('/src/shriek-sisters-hands.js');const POSE=SHm.POSE;const nameOf=p=>Object.keys(POSE).find(k=>POSE[k]===p)||'??';
    const out={};const runOrder=async(order,secs)=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(420);const P=BK.P,SH=BK.shriekSistersHands();BK.tp(380,10);BK.sim(300);P.x=SH.show().G.mid-60;BK.sim(2);
      const S=SH.show(),G=S.G,dummy={diver:{},shrieker:{},snatcher:{}},seen={};let t0=BK.time;const modes={};
      const tally=()=>{for(const r of ['diver','shrieker','snatcher']){const s=S.sis[r];if(!s.alive)continue;const p=SHm.poseOf(s,dummy[r],BK.time,false,G);const k=r+':'+s.mode+'>'+nameOf(p);seen[k]=(seen[k]||0)+1;modes[r+':'+s.mode]=1;}};
      const step=n=>{for(let i=0;i<n;i++){P.hp=P.maxHp;BK.step(1);tally();}};
      step(Math.round(secs*60/2));
      for(const r of order){S.sis[r].hp=0;step(6);}
      step(Math.round(secs*60/2));
      return {order:order.join('+'),seen,alive:['diver','shrieker','snatcher'].filter(r=>S.sis[r].alive),p2:S.p2,errs:(globalThis.__rkNaN||[]).length};};
    out.a=await runOrder(['diver','shrieker'],${SECS});out.b=await runOrder(['shrieker','snatcher'],${SECS});out.c=await runOrder(['diver','snatcher'],${SECS});
    BK.manualSimulation=false;return out;})()`, 1200000);
  for (const k of Object.keys(r)) { const o = r[k]; console.log('order', o.order, 'survivor', o.p2, 'alive', o.alive.join(','), 'NaN lines', o.errs); const keys = Object.keys(o.seen).sort(); console.log('  ' + keys.map(q => q + 'x' + o.seen[q]).join('  ')); if (keys.some(q => q.endsWith('>??'))) { bad++; console.log('  !! a mode with no pose'); } }
  if (pg.errors.length) { bad++; console.log('PAGE ERRORS', pg.errors.slice(0, 6)); }
} finally { await pg.close(); }
process.exit(bad ? 1 : 0);
