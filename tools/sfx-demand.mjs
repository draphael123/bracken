import{openPage}from'./cdp.mjs';import{mkdirSync,writeFileSync}from'node:fs';import assert from'node:assert/strict';
mkdirSync('gate-data',{recursive:true});process.env.BRACKEN_PROCESS_LOG='gate-data/sfx.processes.jsonl';const pg=await openPage({audio:false,fonts:false,seed:1919});
try{
 const result=await pg.evalp(`(async()=>{
  BK.manualSimulation=true;const A=await import('/src/audio.js'),{LEVELS}=await import('/src/level.js'),man=await(await fetch('/audio/manifest.json')).json();
  A.initAudio();A.setVolume(0);A.setMusicVolume(0);
  await A.prepareCoreSfx();
  const core=A.sfxDemandStatus();if(core.stats.fetched>10)throw Error('Audio start fetched beyond its 10 first-take core');
  const heroes=Object.keys(A.sfxCatalog().heroes),rows=[];
  for(const d of LEVELS.filter(l=>!(l.hidden&&!l.secret)&&! /^(shop|trial_|custom)/.test(l.id))){
   const l={...d.build(),id:d.id};const names=await A.levelSfxPools(l,heroes);await A.prepareLevelSfx(l,heroes);
   if(!A.levelSfxReady(l,heroes))throw Error(d.id+' not ready after decode');
   const loaded=A.sfxDemandStatus().loaded;const missing=names.filter(n=>!loaded.includes(n));if(missing.length)throw Error(d.id+' missing '+missing.join(','));
   // All required pool promises have resolved after actual fetch and decode.
   rows.push({id:d.id,pools:names.length,clips:names.reduce((n,k)=>n+man[k].length,0),ready:true});
  }
  return{core,rows,status:A.sfxDemandStatus(),allUrls:new Set(Object.values(man).flat()).size};
 })()`,1200000);
 assert.equal(result.rows.length,48);assert(result.rows.every(r=>r.ready));assert(result.status.stats.maxActive<=8);assert.equal(result.status.stats.failed,0);assert(result.status.stats.fetched<=result.allUrls,'aliases fetched twice');assert.deepEqual(pg.errors,[]);
 const receipt={time:new Date().toISOString(),complete:true,...result};writeFileSync('gate-data/sfx-demand.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
}finally{await pg.close();}
