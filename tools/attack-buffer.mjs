import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try{const r=await pg.evalp(`(async()=>{
 BK.manualSimulation=true;BK.SET.speed=1;const {LEVELS}=await import('/src/level.js'),yard=LEVELS.findIndex(l=>l.id==='trial_open');const rows=[];
 const prepare=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.load(yard);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.tp(10,21);BK.sim(30);BK.reset();BK.P.st=BK.P.maxSt;};
 const rate=h=>h==='reaper'?.34:h==='paladin'?.56:h==='pirate'?1.35:1;
 for(const h of ['knight','warden','pyro','paladin','pirate','reaper']){
  for(const kind of ['rise','sweep'])for(const face of [-1,1]){
   prepare(h);const p=BK.P;p.face=face;BK.press('atk');BK.sim(1);let n=0;
   while(p.atk>=0&&p.atk<.3-rate(h)*.10&&n++<180)BK.sim(1);
   if(p.atk<0||n>=180)throw Error('first swing setup '+h);
   BK.keys[kind==='rise'?'up':'down']=true;BK.press('atk');BK.sim(1);BK.keys.up=BK.keys.down=false;
   let next=false,prev=p.atk;for(let i=0;i<30;i++){BK.sim(1);if(p.atk>=0&&(prev<0||p.atk<prev)){next=true;break;}prev=p.atk;}
   if(!next||p.swingKind!==kind)throw Error(h+' queued '+kind+' became '+p.swingKind+' atk='+p.atk);
   rows.push({h,kind,face});
  }
  prepare(h);BK.press('atk');BK.sim(1);BK.press('atk');BK.press('dodge');BK.sim(1);
  if(BK.P.dodge>0||BK.P.atk<0)throw Error('committed swing was cancelled '+h);
  BK.sim(150);if(BK.P.atk>=0||BK.P.abuf>0)throw Error('expired input fired late '+h);
 }
 prepare('knight');BK.coopStart('warden',false);const p=BK.P,q=BK.players()[1];q.x=p.x+20;q.y=p.y;q.ground=true;q.st=q.maxSt;
 BK.press('atk');q.press.atk=true;BK.sim(13);BK.keys.up=true;q.keys.down=true;BK.press('atk');q.press.atk=true;BK.sim(1);BK.keys.up=false;q.keys.down=false;
 let first=false,second=false;for(let i=0;i<25;i++){BK.sim(1);first ||=p.swingKind==='rise';second ||=q.swingKind==='sweep';}
 if(!first||!second)throw Error('co-op directions crossed or dropped');BK.coopEnd();return{rows,coop:true,expiryAndCommitment:6};
})()`);assert.equal(r.rows.length,24);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(r));}finally{pg.close();}
