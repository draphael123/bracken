import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// THE LIVING SWIM HOME: real keyboard input, real collision and water; remove foes to isolate the crossing.
// The river current, four rocks and bore stay. No god mode, no health refill, no teleport after first boarding.
// node tools/rafts-live.mjs [screenshot-directory]
function raftRide() {
 const out=[], shots=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg+' '+JSON.stringify(out));};
 const shot=name=>{BK.step(0);shots.push({name,png:BK.view.buf.toDataURL('image/png')});};
 const key=(k,on)=>window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{key:k,bubbles:true}));
 const snap=()=>({x:BK.P.x,y:BK.P.y,hp:BK.P.hp,dead:BK.P.dead,swim:BK.P.swim,ground:BK.P.ground,ride:!!BK.P.onMover});
 BK.load(11); BK.setHero('knight'); BK.state='play'; BK.enemies().splice(0); BK.god=false;
 const m=BK.movers().find(m=>m.kind==='raft');
 Object.assign(BK.P,{x:m.x+48,y:m.y-1,vx:0,vy:0,onMover:null,ground:false}); BK.sim(120); out.push({step:'board',m:{x:m.x,moving:m.moving},p:snap()});
 key('ArrowLeft',true); BK.sim(65); key('ArrowLeft',false); BK.sim(80); out.push({step:'fell',m:{x:m.x,returning:m.returning,offT:m.offT},p:snap()});
 key('ArrowLeft',true); key('ArrowUp',true); BK.sim(120); key('ArrowUp',false); key('z',true); BK.sim(40); key('z',false); key('ArrowLeft',false); BK.sim(20); out.push({step:'bank',m:{x:m.x,returning:m.returning},p:snap()});
 shot('returning'); BK.sim(400);out.push({step:'wait',m:{x:m.x,returning:m.returning,done:m.done},p:snap()});
 key('ArrowRight',true);key('z',true);BK.sim(35);key('z',false);key('ArrowRight',false);BK.sim(35);out.push({step:'reboard',m:{x:m.x,moving:m.moving},p:snap()});
 BK.sim(100);out.push({step:'settled',m:{x:m.x,moving:m.moving},p:snap()});
 shot('reboarded'); const rocks=[166,198,232,258].map(x=>x*16);
 for(let f=0;f<8000&&!m.done&&!BK.P.dead;f++) {
  const p=BK.P, next=rocks.find(x=>x+32>p.x-4), near=next&&next-p.x<22&&next-p.x>-36, goal=near?next+44:m.x+m.w/2;
  key('ArrowRight',p.x<goal-4);key('ArrowLeft',p.x>goal+4);
  if(next&&next-p.x<22&&next-p.x>-36&&p.ground&&p.onMover) {key('z',false);key('z',true);}
  if(!p.ground&&p.vy>=0)key('z',false);
  BK.sim(1); if(m.returning){out.push({step:'first-return',p:snap(),m:{x:m.x,offT:m.offT},next});break;}
 }
 key('ArrowRight',false);key('ArrowLeft',false);key('z',false);out.push({step:'cross',m:{x:m.x,x1:m.x1,done:m.done,returning:m.returning},p:snap()});
 check(out.find(r=>r.step==='fell').p.swim,'walk-off enters swimming');
 check(out.find(r=>r.step==='bank').m.returning,'raft returns while hero lives');
 check(out.find(r=>r.step==='wait').p.ground&&out.find(r=>r.step==='wait').m.x===m.x0,'swimmer reaches bank and raft reaches dock');
 check(out.find(r=>r.step==='settled').p.ride,'real input boards returned raft');
 check(m.done&&BK.P.onMover===m&&!BK.P.dead&&BK.P.hp===100,'recovered raft crosses all four rocks, with bore enabled');
 shot('crossed');
 for(const level of [1,11]) {
  BK.load(level);BK.state='play';BK.enemies().splice(0);
  const rafts=BK.movers().filter(r=>r.kind==='raft');
  for(const r of rafts)Object.assign(r,{x:r.x1,moving:false,done:true,returning:true,offT:2,bored:true,frogT:7});
  BK.P.dead=0.01;BK.sim(3);
  const reset=BK.movers().filter(r=>r.kind==='raft');
  check(reset.every(r=>r.x===r.x0&&!r.moving&&!r.done&&!r.returning&&!r.offT&&!r.bored),'respawn resets every raft ahead of checkpoint');
  out.push({step:'respawn',level,rafts:reset.length,pass:true});
 }
 return {out,shots};
}
const r=spawnSync(process.execPath,['tools/headless.mjs','expr','('+raftRide.toString()+')()'],{cwd:fileURLToPath(new URL('..',import.meta.url)),encoding:'utf8',env:{...process.env,PORT:process.env.PORT||'5992'},maxBuffer:16*1024*1024,timeout:180000});
if(r.status!==0){console.error(r.stdout,r.stderr,r.error||'');process.exit(1);}
const result=JSON.parse(r.stdout);
if(process.argv[2]){mkdirSync(process.argv[2],{recursive:true});for(const s of result.shots)writeFileSync(join(process.argv[2],s.name+'.png'),Buffer.from(s.png.split(',')[1],'base64'));}
console.log(JSON.stringify(result.out,null,2));
console.log('live raft recovery, bank exit, reboarding, full crossing and all three respawn resets pass.');
