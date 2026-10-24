// Component comparison of explicit eviction and retaining the same level's derived art.
import {openPage} from './cdp.mjs';import {pauseGameAtBoot} from './manual-lab-boot.mjs';import {mkdirSync,writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
const cases=[['buriedcity','buried_city','bcTile'],['skyroad','skyroad','skyTile'],['rootway','rootway','rootTile'],['redgorge','redgorge','gorgeTile'],['sealedpyramid','sealed_pyramid','spTile'],['underwell','underwell','wellTile'],['undercrown','undercrown','ucTile']],rows=[];
mkdirSync('gate-data/tile-warm',{recursive:true});process.env.BRACKEN_PROCESS_LOG='gate-data/tile-warm/processes.jsonl';
writeFileSync('gate-data/tile-warm/receipt.json',JSON.stringify({time:new Date().toISOString(),complete:false,diagnosticOnly:true,rows})+'\n');
const pg=await openPage({audio:false,fonts:false,seed:1008});
try{
 await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'});await pg.reload();
 for(const [id,module,fn] of cases){
  const row=await pg.evalp(`(async()=>{
   const{LEVELS,T}=await import('/src/level.js'),{resetLevelTileCaches}=await import('/src/level-tile-cache.js'),{bakeScope,bakeScopeEnd}=await import('/src/px.js'),tile=(await import('/src/redraw/${module}_tiles.js')).${fn};
   const index=LEVELS.findIndex(l=>l.id===${JSON.stringify(id)});BK.load(index);BK.start();const L=BK.L,W=L.W,H=L.H,at=(x,y)=>x<0||x>=W?T.SOLID:y<0||y>=H?T.AIR:L.grid[y*W+x],results=[];
   const random=Math.random;let rng=0;Math.random=()=>{rng++;return random();};const state=JSON.stringify([BK.P.x,BK.P.y,BK.P.hp,BK.time]);
   try{for(const variant of ['before','warm','return']){results.push(await(async()=>{
    if(variant==='warm')resetLevelTileCaches(index);else resetLevelTileCaches();
    if(window.__brackenLabCollect)await window.__brackenLabCollect();else if(typeof gc==='function')gc();
    const take=()=>{const cells=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)cells.push(tile(at(x,y),x,y,at,T,L));return cells;};
    if(variant==='warm'){take();resetLevelTileCaches(index);}
    bakeScope();const start=performance.now(),cells=take(),ms=performance.now()-start,owned=bakeScopeEnd(),count=owned.length;
    const cache=new Map(),entries=[];let bytes=0;for(const c of cells){if(!c){entries.push(null);continue;}if(!cache.has(c)){const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',pixels))].map(n=>n.toString(16).padStart(2,'0')).join('');cache.set(c,[c.width,c.height,hash]);bytes+=pixels.length;}entries.push(cache.get(c));}
    const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(entries))))].map(n=>n.toString(16).padStart(2,'0')).join('');return{variant,ms,canvases:count,cells:cells.length,unique:cache.size,bytes,hash:digest};
   })());if(window.__brackenLabCollect)await window.__brackenLabCollect();else if(typeof gc==='function')gc();}return{id:${JSON.stringify(id)},results,rng,stateSame:state===JSON.stringify([BK.P.x,BK.P.y,BK.P.hp,BK.time])};}finally{Math.random=random;}
  })()`,180000);
  assert.equal(row.rng,0);assert(row.stateSame);assert.equal(row.results[1].hash,row.results[0].hash);assert.equal(row.results[2].hash,row.results[0].hash);assert.equal(row.results[1].canvases,0);assert(row.results[0].canvases>0);rows.push(row);writeFileSync('gate-data/tile-warm/receipt.json',JSON.stringify({time:new Date().toISOString(),complete:rows.length===cases.length,diagnosticOnly:true,rows},null,2)+'\n');console.log(JSON.stringify(row));await pg.send('HeapProfiler.collectGarbage');
 }
 assert.deepEqual(pg.errors,[]);
}finally{await pg.close();}
