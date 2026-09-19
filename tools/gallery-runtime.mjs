import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({port:5995});
try {
  const rows=await pg.evalp(`(async()=>{const {LEVELS}=await import('./src/level.js');BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=true;for(const p of BK.props())if(p.unstable)p.unstable=false;const foes=BK.enemies().filter(e=>e.balcony),rows=[];for(const e of foes){BK.P.x=e.x-48;BK.P.y=320;const start=e.y;BK.sim(30);const warned=e.balcony?.state==='warn';BK.sim(240);rows.push({start,end:e.y,warned,released:!e.balcony,alive:e.alive});}return rows;})()`);
  assert.equal(rows.length,3);
  for(const r of rows){assert(r.warned,JSON.stringify(r));assert(r.released,JSON.stringify(r));assert(r.end>r.start+40,JSON.stringify(r));assert(r.alive,JSON.stringify(r));}
  assert.deepEqual(pg.errors,[]);
  console.log('Three gallery goblins warn, drop from supported balconies and survive to join the fight.');
} finally {pg.close();}
