import{admitBrowser}from'./browser-admission.mjs';import assert from'node:assert/strict';
let t=0,waits=0,notes=0;const low=[900,1600,3500];const r=await admitBrowser({reserve:512,renderer:1536,free:()=>low.shift(),now:()=>t,sleep:async ms=>{waits++;t+=ms;},onWait:()=>notes++});assert.deepEqual(r,{available:3500,required:3072,waited:true});assert.equal(waits,2);assert.equal(notes,1);
let clock=0;await assert.rejects(admitBrowser({reserve:512,renderer:1536,free:()=>700,now:()=>clock,sleep:async ms=>clock+=ms,timeout:2000}),e=>e.resourceStop&&/suite stopped/.test(e.message));assert.equal(clock,2000);
assert.equal((await admitBrowser({reserve:512,renderer:1536,free:()=>4000,sleep:async()=>assert.fail('unnecessary wait')})).waited,false);
console.log('PASS browser admission: waits for renderer plus reserve, bounded stop preserves incomplete status, ready path does not wait');
