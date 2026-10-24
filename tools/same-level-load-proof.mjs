// Before/after/return on the real loader: explicit eviction versus a warm same-level reload.
import {openPage} from './cdp.mjs';import {pauseGameAtBoot,installLabRenderClock} from './manual-lab-boot.mjs';import {mkdirSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';
const selected=process.argv.find(a=>a.startsWith('--only='))?.slice(7),ids=['buriedcity','skyroad','rootway','redgorge','sealedpyramid','underwell','undercrown'].filter(id=>!selected||selected===id),rows=[];assert(ids.length);
mkdirSync('gate-data/same-level-load',{recursive:true});process.env.BRACKEN_PROCESS_LOG='gate-data/same-level-load/processes.jsonl';
 for(const id of ids)for(let round=0;round<3;round++)for(const variant of ['before','warm','return']){
  // A fresh document holds the renderer's private lighting/sky state identical in all three controls.
  // Prime the same actual level in every document without drawing, then only vary tile eviction.
  const pg=await openPage({audio:false,fonts:false,seed:1008});try{
  await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'});await pg.reload();await pg.evalp('('+installLabRenderClock.toString()+')(BK)');
  await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));})()`);
  const row=await pg.evalp(`(async()=>{
   const{LEVELS}=await import('/src/level.js'),{resetLevelTileCaches}=await import('/src/level-tile-cache.js');
   BK.setHero('knight');BK.reset({fresh:true});let seed=1008,rng=0,rngHash=2166136261;Math.random=()=>{rng++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;rngHash=Math.imul(rngHash^seed,16777619)>>>0;return seed/4294967296;};
   if(${JSON.stringify(variant)}!=='warm')resetLevelTileCaches();
   const t=performance.now();BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));const ms=performance.now()-t;
   BK.state='play';BK.step(0);const p=BK.P,state={time:BK.time,state:BK.state,hero:['x','y','vx','vy','hp','maxHp','st','dead','face'].map(k=>p[k]),enemies:BK.enemies().map(e=>['t','x','y','hp','alive','mode','modeT','vx','vy'].map(k=>e[k])),stats:BK.stats()};
   const hashCanvas=async c=>{const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return[...new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))].map(n=>n.toString(16).padStart(2,'0')).join('');};return{ms,rng,rngHash,state,hash:await hashCanvas(BK.view.buf),displayHash:await hashCanvas(document.getElementById('c'))};
  })()`,180000);
  rows.push({id,round,variant,...row});writeFileSync('gate-data/same-level-load/receipt.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),ids,freshDocuments:true,complete:false,rows},null,2)+'\n');
  console.log(JSON.stringify({id,round,variant,ms:row.ms,rng:row.rng,hash:row.hash}));assert.deepEqual(pg.errors,[]);await pg.send('HeapProfiler.collectGarbage');
  }finally{await pg.close();}}
 for(const id of ids)for(let round=0;round<3;round++){const pair=rows.filter(r=>r.id===id&&r.round===round),base=pair[0];for(const r of pair.slice(1))for(const k of ['rng','rngHash','state','hash','displayHash'])assert.deepEqual(r[k],base[k],id+' '+k);}
 writeFileSync('gate-data/same-level-load/receipt.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),ids,freshDocuments:true,complete:true,exactFrameStateAndRng:true,rows},null,2)+'\n');
