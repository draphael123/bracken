// Real startGame path: delayed fetch/decode must hold play until its sound catalog is ready.
import{openPage}from'./cdp.mjs';import{mkdirSync,writeFileSync}from'node:fs';import assert from'node:assert/strict';
mkdirSync('gate-data',{recursive:true});const pg=await openPage({audio:false,fonts:false,seed:1919});
try{
 const held=await pg.evalp(`(async()=>{const A=await import('/src/audio.js');const original=window.fetch;const gate=new Promise(r=>window.__releaseAudio=r);window.fetch=(...a)=>/\\.ogg(?:$|[?])/.test(String(a[0]))?gate.then(()=>original(...a)):original(...a);A.initAudio();A.setVolume(0);A.setMusicVolume(0);BK.load(0);BK.manualSimulation=false;BK.state='map';BK.start();return{busy:BKLoad.busy,state:BK.state,ready:A.levelSfxReady()};})()`);
 assert(held.busy&&!held.ready&&held.state!=='play',JSON.stringify(held));
 await new Promise(r=>setTimeout(r,300));assert.equal(await pg.evalp('BKLoad.busy && BK.state !== "play"'),true);
 await pg.evalp('window.__releaseAudio()');let ready=false;for(let i=0;i<480&&!ready;i++){ready=await pg.evalp('BK.state === "play" && !BKLoad.busy');if(!ready)await new Promise(r=>setTimeout(r,250));}assert(ready,'play never resumed after decode');
 const after=await pg.evalp(`(async()=>{BK.manualSimulation=true;const A=await import('/src/audio.js');return{ready:A.levelSfxReady(),status:A.sfxDemandStatus()};})()`);assert(after.ready);assert.deepEqual(after.status.late,[]);assert.deepEqual(pg.errors,[]);
 writeFileSync('gate-data/sfx-entry.json',JSON.stringify({time:new Date().toISOString(),held,after,complete:true},null,2)+'\n');console.log('PASS real start: pending sound holds play; successful decode releases it with no missing pool');
}finally{await pg.close();}
