import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
 const rows=await pg.evalp(`(async()=>{
  BK.manualSimulation=true;const {LEVELS,T}=await import('/src/level.js'),rows=[];
  for(const hero of ['knight','warden','pyro','paladin','pirate','reaper']){
   BK.setHero(hero);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='keep'));BK.start();
   for(const e of BK.enemies())e.alive=false;
   const A=BK.L.arena;BK.tp(Math.floor((A.x0+A.x1)/32),Math.floor(A.floor/16)-10);BK.sim(5);
   const P=BK.P;P.st=100;BK.keys.down=true;BK.press('atk');BK.sim(1);
   const began={swim:P.swim,plunge:P.plunge,chain:P.plungeN,st:P.st};
   BK.keys.down=false;BK.keys.up=true;BK.sim(30);BK.keys.up=false;
   const ended={swim:P.swim,plunge:P.plunge,chain:P.plungeN,st:P.st};BK.sim(120);
   rows.push({hero,began,ended,rested:{swim:P.swim,chain:P.plungeN,st:P.st}});
  }return rows;
 })()`);
 for(const r of rows){assert.equal(r.began.swim,true,r.hero);assert.equal(r.began.plunge,true,r.hero);assert.equal(r.began.chain,1,r.hero);assert.equal(r.ended.plunge,false,r.hero);assert.equal(r.ended.chain,0,r.hero);assert.ok(r.rested.st>r.began.st+10,r.hero+' recovers stamina after ending the swimming downstroke');}
 assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(rows));
}finally{pg.close()}
