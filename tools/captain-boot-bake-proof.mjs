// Compare the overwritten duplicate bake with one bake, including exact art and production geometry.
import {openPage} from './cdp.mjs';import {mkdirSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';
const pg=await openPage({audio:false,fonts:false,seed:1008}),rows=[];
try{
 await pg.evalp('BK.manualSimulation=true');
 for(let round=0;round<5;round++)for(const variant of ['before','single','return']){
  const row=await pg.evalp(`(async()=>{
   const{bakeCaptain}=await import('/src/redraw/pirates.js'),{bakeScope,bakeScopeEnd}=await import('/src/px.js');
   const snap=async set=>{const shape=[],parts=[];let size=0;const visit=(o,p)=>{if(o instanceof HTMLCanvasElement){const data=o.getContext('2d').getImageData(0,0,o.width,o.height).data;parts.push(data);size+=data.length;shape.push([p,o.width,o.height]);}else if(o&&typeof o==='object'){for(const k of Object.keys(o).sort())visit(o[k],p+'.'+k);}else if(typeof o!=='function')shape.push([p,o]);};visit(set,'');const data=new Uint8Array(size);let n=0;for(const p of parts){data.set(p,n);n+=p.length;}return{shape,size,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(v=>v.toString(16).padStart(2,'0')).join('')};};
   const random=Math.random;let rng=0,owned;Math.random=()=>{rng++;return random();};bakeScope();
   try{const start=performance.now();if(${JSON.stringify(variant)}!=='single')bakeCaptain();const set=bakeCaptain(),ms=performance.now()-start;owned=bakeScopeEnd();Math.random=random;const pixels=await snap(set),production=await snap(BK.SPR.captain);return{variant:${JSON.stringify(variant)},ms,rng,canvases:owned.length,pixels,productionSame:JSON.stringify(pixels)===JSON.stringify(production)};}
   finally{Math.random=random;owned??=bakeScopeEnd();for(const c of owned){c.width=0;c.height=0;}}
  })()`,120000);
  rows.push({...row,round});assert.equal(row.rng,0);assert.deepEqual(row.pixels,rows[0].pixels);assert(row.productionSame);await pg.send('HeapProfiler.collectGarbage');
 }
 assert.deepEqual(pg.errors,[]);const controls=rows.filter(r=>r.variant!=='single'),single=rows.filter(r=>r.variant==='single');for(const r of single)assert.equal(r.canvases*2,controls[0].canvases);
 const receipt={time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:true,exactRGBAAndGeometry:true,rows};mkdirSync('gate-data/captain-boot',{recursive:true});writeFileSync('gate-data/captain-boot/receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({...receipt,rows:rows.map(({pixels,...r})=>r)}));
}finally{await pg.close();}
