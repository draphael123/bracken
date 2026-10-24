// Exercise complete derived tile kits before/after eviction, including held references and revisits.
import {openPage} from './cdp.mjs';
import {pauseGameAtBoot} from './manual-lab-boot.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const cases=[['buriedcity','buried_city','bcTile'],['skyroad','skyroad','skyTile'],['rootway','rootway','rootTile'],['redgorge','redgorge','gorgeTile'],['sealedpyramid','sealed_pyramid','spTile'],['underwell','underwell','wellTile'],['undercrown','undercrown','ucTile']];
const pg=await openPage({audio:false,fonts:false,seed:1008}),rows=[];
mkdirSync('gate-data/tile-cache',{recursive:true});
try{
 await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'});await pg.reload();
 for(const [id,module,fn] of [...cases,...cases.slice().reverse()]){
  const row=await pg.evalp(`(async()=>{
   const {LEVELS,T}=await import('/src/level.js'),{resetLevelTileCaches}=await import('/src/level-tile-cache.js'),tile=(await import('/src/redraw/${module}_tiles.js')).${fn};
   const index=LEVELS.findIndex(l=>l.id===${JSON.stringify(id)});if(index<0)throw Error('Missing level');BK.load(index);BK.start();BK.manualSimulation=true;
   const L=BK.L,W=L.W,H=L.H,at=(x,y)=>x<0||x>=W?T.SOLID:y<0||y>=H?T.AIR:L.grid[y*W+x];
   const sha=async data=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(v=>v.toString(16).padStart(2,'0')).join('');
   const hashCanvas=async c=>sha(c.getContext('2d').getImageData(0,0,c.width,c.height).data);
   let held=null;const take=async()=>{const entries=[],memo=new WeakMap();let drawn=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=tile(at(x,y),x,y,at,T,L);if(!c){entries.push(null);continue;}drawn++;held??=c;let hash=memo.get(c);if(!hash){hash=await hashCanvas(c);memo.set(c,hash);}entries.push([c.width,c.height,hash]);}return{cells:W*H,drawn,unique:memo,hash:await sha(new TextEncoder().encode(JSON.stringify(entries)))};};
   const R=Math.random;let rng=0;Math.random=()=>{rng++;return R();};const state=JSON.stringify([BK.P.x,BK.P.y,BK.P.hp,BK.time]);
   try{const a=await take(),heldHash=await hashCanvas(held);resetLevelTileCaches();const heldIntact=held.width>0&&await hashCanvas(held)===heldHash,b=await take();
    return{id:${JSON.stringify(id)},cells:a.cells,drawn:a.drawn,before:a.hash,after:b.hash,heldIntact,rng,stateSame:state===JSON.stringify([BK.P.x,BK.P.y,BK.P.hp,BK.time])};
   }finally{Math.random=R;}
  })()`,180000);
  assert(row.drawn>0,id+' exercised no tiles');assert.equal(row.after,row.before,id+' changed exact per-cell RGBA or geometry');assert(row.heldIntact,id+' invalidated held tile');assert.equal(row.rng,0);assert(row.stateSame);
  const earlier=rows.find(r=>r.id===id);if(earlier)assert.equal(row.before,earlier.before,id+' changed after another level');rows.push(row);
  writeFileSync('gate-data/tile-cache/receipt.json',JSON.stringify({time:new Date().toISOString(),complete:rows.length===cases.length*2,localCandidate:true,rows},null,2)+'\n');
  await pg.send('HeapProfiler.collectGarbage');console.log(JSON.stringify(row));
 }
 assert.deepEqual(pg.errors,[]);
}finally{await pg.close();}
