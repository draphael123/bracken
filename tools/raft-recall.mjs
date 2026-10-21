/* tools/raft-recall.mjs - RAFT RECALL (claude/frogking2; scratch/brief-playtest-1021b.md item 2, Daniel 10-21: "the raft call-back must be INSTANT
   when you die mid-section - the raft is back at the start / your shrine side right away"). Page check. For EVERY raft in EVERY level (the marsh's
   grove raft and ferry, its two current rafts in the reed run and at the boom, the Long Water's free ferry), it fails when:
     - a fall into a hurting water from the raft mid-crossing (the hand-back to the bank) does not leave her AT HER DOCK on the same frame you stand up
       (she used to crawl home, or - on the current - never come home: a soft-lock), or a frog that climbed aboard rides back with her
     - a ferry's paid toll is forgotten by the recall
     - a DEATH mid-crossing does not wake you with her at her dock
     - a raft a living hero still rides is recalled under him
   PORT=<port> node tools/raft-recall.mjs */
import { LEVELS, TS } from '../src/level.js';
import { openPage } from './cdp.mjs';
const rafts = [];
for (const [i, lv] of LEVELS.entries()) { let L; try { L = lv.build(); } catch { continue; }
  (L.moversExtra || []).forEach((m, k) => { if (m.kind === 'raft') rafts.push({ i, id: lv.id, k, hurts: !!L.waterHurts, x0: m.x0 }); }); }
const bad = [], ok = (c, m) => { if (!c) bad.push(m); }, out = [];
const pg = await openPage({ audio: false, fonts: false }); const E = (e, t = 120000) => pg.evalp(e, t);
try {
  for (const r of rafts) {
    const res = await E(`(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(${r.i});BK.state='play';BK.start();BK.god=false;BK.SET.invincible=false;BK.SET.godmode=false;
      BK.enemies().forEach(e=>{e.alive=false;});BK.ambushes().forEach(a=>a.st='done');BK.sim(10);const P=BK.P,TS=${TS};
      const raftsNow=()=>BK.movers().filter(m=>m.kind==='raft'),m0=()=>raftsNow().find(m=>m.x0===${r.x0});let m=m0();if(!m)return{err:'no raft'};
      /* stand on her dock bank (the last dry footing), then she is out on the water mid-crossing with you aboard */
      const bankX=m.x0-10;P.x=bankX;P.y=m.y;let ty=Math.floor((m.y-4)/TS);P.vy=0;
      for(let i=0;i<40&&!P.ground;i++)BK.sim(1);for(let i=0;i<30;i++){P.x=bankX;P.vx=0;BK.sim(1);}
      const safe=P.safe?{x:P.safe.x}:null;
      if(BK.L.ents)for(const e of BK.enemies())e.alive=false;
      const mid=m.x0+(m.x1-m.x0)*0.5;m.x=mid;m.moving=!m.current;m.offT=0;m.paid=m.ferry?true:m.paid;
      P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.onMover=m;P.ground=true;BK.sim(5);
      const frog={t:'hopper',color:'green',x:m.x+8,y:m.y,vx:0,vy:0,w:8,h:6,hp:3,face:-1,alive:true,dying:0,anim:0,flash:0,stagger:0,timer:9,air:false,raft:m,drone:true};BK.enemies().push(frog);
      const pool=(BK.L.pools||[]).find(q=>!q.shallow&&!q.dry&&P.x>q.x0&&P.x<q.x1);
      let hand=null;
      if(${r.hurts}&&pool){const xb=m.x;P.onMover=null;P.ground=false;P.x=Math.min(pool.x1-8,Math.max(pool.x0+8,m.x+m.w+20));P.y=pool.y+24;P.vy=60;P.hp=P.maxHp;P.inv=0;
        let f=0;for(;f<6&&Math.abs(P.x-(safe?safe.x:bankX))>2;f++)BK.sim(1);
        hand={handedBack:!!safe&&Math.abs(P.x-safe.x)<=2,frames:f,from:Math.round(xb),at:Math.round(m.x),dock:Math.round(m.x0),docked:Math.abs(m.x-m.x0)<0.6&&!m.moving&&!m.done&&!m.returning,frogGone:!frog.alive,paid:m.ferry?!!m.paid:null};}
      /* a raft a living hero rides is never recalled under him */
      m.x=mid;m.done=false;m.moving=!m.current;P.x=m.x+m.w/2;P.y=m.y;P.vy=0;P.onMover=m;P.ground=true;BK.sim(1);const rx=m.x;
      const q=BK.players&&BK.players();const ridden=Math.abs(m.x-rx)<40;
      /* and a DEATH mid-crossing */
      P.x=m.x+m.w/2;P.onMover=m;P.dead=0.01;let g=0;for(;g<400&&(P.dead||BK.state!=='play');g++)BK.sim(1);
      const m2=m0();const death={woke:!P.dead,at:m2?Math.round(m2.x):null,docked:!!m2&&Math.abs(m2.x-m2.x0)<0.6&&!m2.moving&&!m2.done,cp:Math.round(P.x)};
      return{safe,hand,ridden,death};})()`);
    out.push({ id: r.id, raft: r.k, x0: r.x0 / TS, ...res });
    if (res.err) { bad.push(r.id + ' raft ' + r.k + ': ' + res.err); continue; }
    if (r.hurts) { ok(res.hand && res.hand.handedBack, r.id + ' raft@' + r.x0 / TS + ': the fall did not hand you back to the bank ' + JSON.stringify(res.hand));
      ok(res.hand && res.hand.docked, r.id + ' raft@' + r.x0 / TS + ': NOT AT HER DOCK the frame you stood up ' + JSON.stringify(res.hand));
      ok(res.hand && res.hand.frogGone, r.id + ' raft@' + r.x0 / TS + ': a frog aboard rode back with her');
      ok(!res.hand || res.hand.paid !== false, r.id + ' raft@' + r.x0 / TS + ': the recall forgot the paid toll'); }
    ok(res.ridden, r.id + ' raft@' + r.x0 / TS + ': recalled under a living rider');
    ok(res.death && res.death.woke && res.death.docked, r.id + ' raft@' + r.x0 / TS + ': a death mid-crossing did not wake you with her at her dock ' + JSON.stringify(res.death));
  }
} finally { pg.close(); }
for (const o of out) console.log(JSON.stringify(o));
if (bad.length) { console.log('RAFT RECALL: ' + bad.length + ' FAIL\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('raft-recall: ' + out.length + ' rafts in ' + new Set(out.map(o => o.id)).size + ' levels - a fall hands you back with her at her dock that frame (toll kept, frogs off), a death wakes you with her docked, a ridden raft stays.');
process.exit(0);
