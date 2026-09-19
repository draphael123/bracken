import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({port:5995});
try{
 const r=await pg.evalp(`(async()=>{const {LEVELS,T}=await import('./src/level.js');const rows=[];for(const h of ['knight','pyro','paladin','pirate','reaper','warden']){BK.setHero(h);BK.load(LEVELS.findIndex(l=>l.id==='trial_open'));BK.state='play';BK.god=true;BK.sim(200);for(let y=2;y<25;y++)for(let x=7;x<16;x++)BK.L.grid[y*BK.L.W+x]=x===12?T.SOLID:T.AIR;Object.assign(BK.P,{x:12*16-6,y:12*16,vx:0,vy:0,ground:false,climb:false,swim:false,plunge:false,hurt:0,atk:-1,relic:'spurs'});BK.keys.right=true;BK.sim(60);const held=BK.P.cling&&Math.abs(BK.P.y-192)<1;BK.press('jump');BK.sim(1);const kicked=BK.P.vy<0;BK.keys.right=false;rows.push({h,held,kicked});}return rows;})()`);
 assert.equal(r.length,6);for(const row of r){assert(row.held,JSON.stringify(row));assert(row.kicked,JSON.stringify(row));}assert.deepEqual(pg.errors,[]);
 console.log('All six heroes hold an ordinary stone wall with the climbing spurs and can jump away.');
}finally{pg.close();}
