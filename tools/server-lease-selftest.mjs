import{serverLeases}from'./server-lease.mjs';import assert from'node:assert/strict';import{EventEmitter}from'node:events';
let ready=false,starts=0,kills=0,releaseBoot;const boot=new Promise(r=>releaseBoot=r),s=serverLeases();const opts={up:async()=>ready,start(){starts++;return{kill(){kills++;}};},sleep:async()=>{await boot;ready=true;}};
const a=s.acquire('owned',opts),b=s.acquire('owned',opts);releaseBoot();const[ra,rb]=await Promise.all([a,b]);assert.equal(starts,1);ra();ra();assert.equal(kills,0);rb();assert.equal(kills,1);
const external=await s.acquire('external',{up:async()=>true,start(){throw Error('must never own external server');}});external();assert.equal(kills,1);
await assert.rejects(s.acquire('failed',{up:async()=>false,start:()=>({kill(){kills++;}}),sleep:async()=>{},polls:1}),/did not come up/);assert.equal(kills,2);
const retry=await s.acquire('failed',{up:async()=>true,start(){throw Error('already up');}});retry();s.closeAll();assert.equal(kills,2);
console.log('PASS server leases: concurrent boots share one child; one page cannot stop another; repeated release is safe; external server is never killed; failed acquisition cleans up and can retry');

let listening=false,ownedStarts=0;const delayed=serverLeases(),options={up:async()=>listening,start(){ownedStarts++;listening=true;const c=new EventEmitter();c.kill=()=>{setTimeout(()=>{listening=false;c.emit('exit');},5);};return c;},sleep:async()=>{}};const first=await delayed.acquire('restart',options),closing=first(),next=delayed.acquire('restart',options);await closing;const last=await next;assert.equal(ownedStarts,2,'a new lease must wait for the previously owned server to exit, rather than adopt it as external');await last();
