import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({port:5995});
try {
  const res=await pg.evalp(`(async()=>{const {LEVELS}=await import('./src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=true;for(const p of BK.props())if(p.unstable)p.unstable=false;const foes=BK.enemies().filter(e=>e.balcony),rows=[];for(const e of foes){BK.P.x=e.x-48;BK.P.y=320;const start=e.y;BK.sim(30);const warned=e.balcony?.state==='warn';BK.sim(240);rows.push({start,end:e.y,warned,released:!e.balcony,alive:e.alive});}const lo=Math.min(...foes.map(e=>e.x)),hi=Math.max(...foes.map(e=>e.x)),javs=BK.enemies().filter(e=>e.t==='javelin'&&e.x>lo&&e.x<hi),jav=[];for(const e of javs){BK.P.x=e.x-48;BK.P.y=320;const start=e.y;BK.sim(240);jav.push({start,end:e.y,alive:e.alive,balcony:!!e.balcony});}return {rows,jav};})()`);
  /* The Captains Hall has three balconies: the outer two soldiers drop (balcony:true); the middle guard is a javelineer who stands
     and throws (Highcrown design audit plan 1, batch40) - he must NOT drop. */
  const {rows,jav}=res;
  assert.equal(rows.length,2,JSON.stringify(rows));
  assert.equal(jav.length,1,JSON.stringify(jav));
  for(const j of jav){assert(!j.balcony&&j.alive&&Math.abs(j.end-j.start)<8,JSON.stringify(j));}
  for(const r of rows){assert(r.warned,JSON.stringify(r));assert(r.released,JSON.stringify(r));assert(r.end>r.start+40,JSON.stringify(r));assert(r.alive,JSON.stringify(r));}
  assert.deepEqual(pg.errors,[]);
  console.log('Two gallery goblins warn, drop from supported balconies and survive to join the fight; the middle javelineer holds his balcony.');
} finally {pg.close();}
