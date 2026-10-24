// Actual loader A/B/A against an explicit old game source; all timing, allocation and exactness results are retained.
import fs from 'node:fs';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';
import {copyLabHarness} from './copy-lab-harness.mjs';import {pauseGameAtBoot,installLabRenderClock} from './manual-lab-boot.mjs';
const root=process.cwd(),before=resolve(process.env.ORNAMENT_REFERENCE||'../outline-before-local'),out=resolve(process.env.ORNAMENT_LOAD_OUT||'gate-data/ornament-load');fs.mkdirSync(out,{recursive:true});
const baseline=execFileSync('git',['rev-parse','HEAD'],{cwd:before,encoding:'utf8'}).trim();assert(baseline.startsWith('675b4bd5'));copyLabHarness(root,before);
const rows=[];for(let round=1;round<=3;round++)for(const [variant,cwd]of [['before',before],['after',root],['return',before]]){
 process.env.BRACKEN_PROCESS_LOG=join(out,round+'-'+variant+'.processes.jsonl');const {openPage}=await import(pathToFileURL(join(cwd,'tools/cdp.mjs')));const pg=await openPage({audio:false,fonts:false,seed:1919});
 try{
  await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'});await pg.reload();assert.equal(await pg.evalp('BK.time'),0);await pg.evalp('('+installLabRenderClock.toString()+')(BK)');
  const r=await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});let seed=1919,rng=0,made=0;const random=Math.random,create=Document.prototype.createElement;Math.random=()=>{rng++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};Document.prototype.createElement=function(t,...a){if(t==='canvas')made++;return create.call(this,t,...a);};
   let ms;try{const start=performance.now();BK.load(0);ms=performance.now()-start;}finally{Document.prototype.createElement=create;}
   BK.state='play';BK.step(0);const hash=async c=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))].map(x=>x.toString(16).padStart(2,'0')).join('');
   try{return{ms,canvases:made,exact:{rng,seed,time:BK.time,p:['x','y','vx','vy','hp','st','dead','ground','face'].map(k=>BK.P[k]),enemies:BK.enemies().map(e=>[e.t,e.x,e.y,e.hp,e.alive,e.mode,e.modeT]),frame:await hash(BK.view.buf),display:await hash(document.getElementById('c'))}};}finally{Math.random=random;}})()`,180000);
  assert.deepEqual(pg.errors,[]);rows.push({round,variant,...r});fs.writeFileSync(join(out,'receipt.json'),JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),baseline,level:'wood',rounds:3,rows,complete:rows.length===9},null,2)+'\n');console.log(JSON.stringify({round,variant,ms:r.ms,canvases:r.canvases}));
 }finally{await pg.close();}
}
for(let round=1;round<=3;round++){const [a,b,c]=['before','after','return'].map(v=>rows.find(r=>r.round===round&&r.variant===v));assert.deepEqual(b.exact,a.exact);assert.deepEqual(c.exact,a.exact);assert.equal(a.canvases-b.canvases,16);assert.equal(c.canvases,a.canvases);}
console.log('PASS all9loader comparisons: exact frame, display, tested state and RNG;16 fewer temporary canvases');
