// Prove raw navigation and reload keep collection, and explicit leak controls keep it off.
import {openPage} from './cdp.mjs';import assert from 'node:assert/strict';
for(const enabled of [true,false]){const p=await openPage({audio:false,fonts:false,gcLoads:enabled});try{
 const check=async()=>{for(let i=0;i<300;i++){if(await p.evalp('!!window.BK?.lookPass').catch(()=>false))break;await new Promise(r=>setTimeout(r,100));}const r=await p.evalp(`(()=>{const d=Object.getOwnPropertyDescriptor(window,'BK');return {wrapped:['load','setHero','reset'].map(k=>!!BK[k].__labGc),ordinary:!!d.writable&&!d.get&&!d.set};})()`);assert.deepEqual(r,{wrapped:[enabled,enabled,enabled],ordinary:true});};
 await check();await p.send('Page.navigate',{url:'http://localhost:'+p.PORT+'/?navigationProof=1'});await check();await p.reload();await check();assert.deepEqual(p.errors,[]);
 }finally{await p.close();}}
console.log('PASS raw Page.navigate and reload retain lab collection; ordinary BK property; leak opt-out remains unwrapped');
