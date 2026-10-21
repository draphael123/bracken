/* tools/raft-recall.mjs - RAFT RECALL (claude/frogking2; scratch/brief-playtest-1021b.md item 2, Daniel 10-21: "the raft call-back must be INSTANT
   when you die mid-section - the raft is back at the start / your shrine side right away"). Page check. For EVERY raft in EVERY level (the marsh's
   grove raft and ferry, its two current rafts in the reed run and at the boom, the Long Water's free ferry), it fails when:
     - a fall into the water from the raft mid-crossing, and the climb back out on her dock side (the marsh's biting water is a swim, claude/deadwater),
       does not leave her AT HER DOCK on the frame you stand up (she used to crawl home - or, on the current, never come home: a soft-lock), or a frog
       that climbed aboard rides back with her
     - a ferry's paid toll is forgotten by the recall
     - a DEATH mid-crossing does not wake you with her at her dock
     - a raft a living hero still rides is recalled under him, or one is recalled when you climb out on the FAR side
   PORT=<port> node tools/raft-recall.mjs */
import { LEVELS, TS } from '../src/level.js';
import { openPage } from './cdp.mjs';
const rafts = [];
for (const [i, lv] of LEVELS.entries()) { let L; try { L = lv.build(); } catch { continue; }
  (L.moversExtra || []).forEach((m, k) => { if (m.kind === 'raft') rafts.push({ i, id: lv.id, k, x0: m.x0 }); }); }
const bad = [], ok = (c, m) => { if (!c) bad.push(m); }, out = [];
const pg = await openPage({ audio: false, fonts: false }); const E = (e, t = 120000) => pg.evalp(e, t);
try {
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/' });
  for (let i = 0; i < 300; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false)) break; await new Promise(r => setTimeout(r, 200)); }
  for (const r of rafts) {
    const res = await E(`(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(${r.i});BK.state='play';BK.start();BK.god=false;BK.SET.invincible=false;BK.SET.godmode=false;
      const kill=()=>{BK.enemies().forEach(e=>{e.alive=false;});BK.ambushes().forEach(a=>a.st='done');};kill();BK.sim(10);kill();const P=BK.P;
      const m0=()=>BK.movers().find(m=>m.kind==='raft'&&m.x0===${r.x0});let m=m0();if(!m)return{err:'no raft'};
      const bankX=m.x0-10,mid=m.x0+(m.x1-m.x0)*0.5;
      const land=x=>{P.x=x;P.y=m.y-6;P.vx=0;P.vy=0;P.onMover=null;let f=0;for(;f<60&&!P.ground;f++){P.x=x;BK.sim(1);}return f;};
      land(bankX);const bankOk=P.ground&&!P.swim;
      /* she is out on the water mid-crossing with you aboard, a frog climbed on */
      m.x=mid;m.moving=!m.current;m.offT=0;if(m.ferry)m.paid=true;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.onMover=m;P.ground=true;BK.sim(3);
      const frog={t:'hopper',color:'green',x:m.x+8,y:m.y,vx:0,vy:0,w:8,h:6,hp:3,face:-1,alive:true,dying:0,anim:0,flash:0,stagger:0,timer:9,air:false,raft:m,drone:true};BK.enemies().push(frog);
      /* you fall in beside her */
      const pool=(BK.L.pools||[]).find(q=>!q.shallow&&!q.dry&&m.x+m.w+20>q.x0&&m.x+m.w+20<q.x1);
      P.onMover=null;P.ground=false;P.x=m.x+m.w+20;P.y=(pool?pool.y:m.y)+20;P.vy=60;P.hp=P.maxHp;P.inv=0;let g=0;for(;g<20&&!P.swim&&Math.abs(P.x-bankX)>2;g++)BK.sim(1);
      const swam=!!P.swim,handed=!P.swim&&Math.abs(P.x-bankX)<40;const xb=m.x;
      /* and climb out on her dock side (or were handed back to it) */
      if(!handed){P.vy=0;land(bankX);BK.sim(1);}
      const fall={swam,handed,at:Math.round(m.x),from:Math.round(xb),dock:Math.round(m.x0),docked:Math.abs(m.x-m.x0)<0.6&&!m.moving&&!m.done&&!m.returning,frogGone:!frog.alive,paid:m.ferry?!!m.paid:null};
      /* a raft a living hero rides is never recalled under him */
      m.x=mid;m.done=false;m.moving=!m.current;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.onMover=m;P.ground=true;P.raftSwam=true;BK.sim(2);const ridden=Math.abs(m.x-mid)<40;
      /* out on the FAR side after a swim: she stays where she is */
      P.onMover=null;m.x=mid;m.moving=false;m.done=true;P.raftSwam=true;const farX=m.x1+m.w+24;const fl=land(farX);const farKept=fl>=60||Math.abs(m.x-mid)<1;
      /* and a DEATH mid-crossing */
      m.x=mid;m.done=false;P.x=m.x+m.w/2;P.y=m.y;P.onMover=m;P.ground=true;P.dead=0.01;let d=0;for(;d<600&&(P.dead||BK.state!=='play');d++)BK.sim(1);
      const m2=m0();const death={woke:!P.dead,at:m2?Math.round(m2.x):null,docked:!!m2&&Math.abs(m2.x-m2.x0)<0.6&&!m2.moving&&!m2.done,cp:Math.round(P.x/16)};
      return{bankOk,fall,ridden,farKept,death};})()`);
    out.push({ id: r.id, raft: r.k, x0: r.x0 / TS, ...res });
    const tag = r.id + ' raft@' + r.x0 / TS;
    if (res.err) { bad.push(tag + ': ' + res.err); continue; }
    ok(res.fall.swam || res.fall.handed, tag + ': the fall put you neither in the water nor back on the bank ' + JSON.stringify(res.fall));
    ok(res.fall.docked, tag + ': NOT AT HER DOCK the frame you stood up on her dock side ' + JSON.stringify(res.fall));
    ok(res.fall.frogGone, tag + ': a frog aboard rode back with her');
    ok(res.fall.paid !== false, tag + ': the recall forgot the paid toll');
    ok(res.ridden, tag + ': recalled under a living rider');
    ok(res.farKept, tag + ': recalled when you climbed out on the far side');
    ok(res.death && res.death.woke && res.death.docked, tag + ': a death mid-crossing did not wake you with her at her dock ' + JSON.stringify(res.death));
  }
} finally { pg.close(); }
for (const o of out) console.log(JSON.stringify(o));
if (bad.length) { console.log('RAFT RECALL: ' + bad.length + ' FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('raft-recall: ' + out.length + ' rafts in ' + new Set(out.map(o => o.id)).size + ' levels - out of the water on her dock side and she is AT her dock that frame (toll kept, frogs off), a death wakes you with her docked, a ridden raft and the far side keep her.');
process.exit(0);
