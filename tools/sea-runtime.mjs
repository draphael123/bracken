import {openPage} from './cdp.mjs';
import assert from 'node:assert/strict';
const pg=await openPage({port:5996});
try{
 const results=await pg.evalp(`(async()=>{const{LEVELS}=await import('./src/level.js');const out=[];
 for(const kind of ['orb','bell','cargo']){BK.load(LEVELS.findIndex(l=>l.id==='causeway'));BK.state='play';BK.god=true;BK.sim(300);const e=BK.boss,A=BK.L.arena;BK.tp(A.trigger/16+2,A.floor/16-1);BK.sim(700);for(const a of e.arms){a.severed=true;a.hp=0;a.st='gone';a.low=false;a.ae.alive=false;}e.stage=2;e.stageFloor=0;e.hp=1;e.modeT=4;e.near=e.nearWant=1;e.far=e.farWant=0;
 if(kind==='orb'){e.mode='orbs';e.orbs=[{i:0,t:1,dur:1,mx:200,done:false,ret:.69}];}
 if(kind==='bell'){e.mode='breath';e.knellHit=true;}
 if(kind==='cargo'){e.mode='look';e.shards=[{k:'crate',x0:e.x,y0:e.y,x:e.x,y:e.y,tx:e.x,ty:e.y,t:.99,dur:1,spin:0,sc:1}];}
 BK.sim(5);out.push({kind,alive:e.alive,hp:e.hp});}
 return out;})()`);
 for(const r of results)assert.equal(r.alive,false,JSON.stringify(r));assert.deepEqual(pg.errors,[]);console.log('Kraken final blow: reflected water, bell and cargo all trigger defeat.');
}finally{pg.close();}
