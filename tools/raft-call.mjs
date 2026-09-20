import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
import {writeFileSync} from 'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(()=>{
 BK.manualSimulation=true;BK.SET.speed=1;BK.reset({fresh:true});BK.load(1);BK.start();BK.sim(300);BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
 const rows=[];
 for(const pr of BK.props().filter(p=>p.raftCall)){
  const m=BK.movers().find(m=>m.callId===pr.raftCall);
  BK.tp(pr.x/16-.5,pr.y/16-1);BK.sim(3);m.x=m.x1;m.moving=false;m.done=true;m.returning=false;m.paid=!!m.ferry;
  const from=m.x,paid=m.paid;BK.press('talk');BK.sim(1);
  if(!m.called||!m.returning||BK.state!=='play')throw Error('winch did not call '+pr.raftCall);
  BK.press('talk');BK.sim(1);if(m.x<=m.x0)throw Error('call teleported raft');
  BK.sim(360);if(m.x!==m.x0||m.called||m.returning||m.paid!==paid)throw Error('dock/payment '+pr.raftCall);
  BK.press('talk');BK.sim(1);if(m.called)throw Error('docked call must be harmless');
  BK.P.x=m.x+12;BK.P.y=m.y;BK.P.vy=0;BK.P.onMover=m;BK.P.ground=true;BK.sim(60);if(m.x<=m.x0)throw Error('cannot reboard '+pr.raftCall);
  BK.P.onMover=null;BK.tp(pr.x/16-.5,pr.y/16-1);BK.sim(3);BK.press('talk');BK.sim(1);if(!m.called)throw Error('cannot call again');BK.sim(360);
  rows.push({id:pr.raftCall,from,dock:m.x,paidPreserved:m.paid===paid,reboarded:true,reusable:true});
 }
 const pr=BK.props().find(p=>p.raftCall==='marsh-grove'),m=BK.movers().find(m=>m.callId===pr.raftCall);
 BK.coopStart('warden',false);BK.tp(pr.x/16-.5,pr.y/16-1);const q=BK.players()[1];m.x=m.x0+70;m.done=false;m.returning=false;m.called=false;m.moving=true;q.x=m.x+20;q.y=m.y;q.onMover=m;q.ground=true;q.vy=0;
 BK.press('talk');BK.sim(1);if(m.called||m.returning)throw Error('stole occupied raft');BK.sim(80);if(m.returning)throw Error('auto return stole partner raft');BK.coopEnd();
 const shrine=BK.L.ents.find(e=>e.t==='check'&&e.x===392);if(!shrine)throw Error('dock checkpoint missing');BK.tp(shrine.x,shrine.y);BK.sim(3);BK.P.dead=.01;BK.sim(3);
 const recovered=BK.props().find(p=>p.raftCall==='marsh-grove'),freshRaft=BK.movers().find(m=>m.callId==='marsh-grove');if(!recovered||BK.P.dead||Math.abs(BK.P.x-(shrine.x*16+8))>16)throw Error('checkpoint recovery');
 BK.enemies().forEach(e=>e.alive=false);BK.tp(recovered.x/16-.5,17);freshRaft.x=freshRaft.x1;freshRaft.done=true;BK.press('talk');BK.sim(1);if(!freshRaft.called)throw Error('winch lost after respawn');BK.sim(360);if(freshRaft.x!==freshRaft.x0)throw Error('post-respawn recall');
 return {rows,coopOccupiedProtected:true,checkpointRetry:true};
})()`);assert.equal(r.rows.length,2);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(r));
if(process.env.RAFT_SCREEN){await pg.evalp(`BK.load(1);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const pr=BK.props().find(p=>p.raftCall==='marsh-grove');BK.tp(pr.x/16-1.5,17);BK.step(180)`);const d=await pg.evalp(`document.querySelector('canvas').toDataURL('image/png')`);writeFileSync(process.env.RAFT_SCREEN,Buffer.from(d.split(',')[1],'base64'));}
}finally{pg.close();}
