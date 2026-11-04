// CLOUD ONLY. New-source controlled whole-Game guide, separate from original qualification.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {freemem} from 'node:os';
import {OUT,openFixedArtPage} from './skyroad-span-guide-page-nov04.mjs';
import {installLabRenderClock} from './manual-lab-boot.mjs';
assert(process.env.CI);
for(const k of ['BRACKEN_RENDERER_MB','BRACKEN_RECYCLE_MB','BRACKEN_LAB_GC'])assert.equal(process.env[k],undefined);
const game=path.resolve(process.env.FIXED_ART_GAME),sha=x=>createHash('sha256').update(x).digest('hex');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const hashes=()=>Object.fromEntries(walk(game+'/tools').sort().map(f=>[path.relative(game,f).replaceAll('\\','/'),sha(fs.readFileSync(f))]));
const tools=hashes();assert.equal(Object.keys(tools).length,921);
const manifest=JSON.parse(fs.readFileSync(new URL('./skyroad-span-guide-nov04/manifest.json',import.meta.url)));
fs.mkdirSync(OUT,{recursive:true});assert(!fs.existsSync(OUT+'/receipt.json'));
const r={time:new Date().toISOString(),controller:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),proof:manifest.proof,
 status:'Running controlled Skyroad mass-span guide',rows:[],rounds:3,variants:['before','after','return'],levels:['skyroad'],loads:['first','repeat'],
 rendererMb:1536,admissionMb:4352,complete:false,adopted:false,overallWorkComplete:false,
 materialPolicy:'At least32MB median renderer reduction at fixed postload/readback checkpoints OR10percent load+first-frame improvement; return timing and memory drift<=10percent; exact frame/display/state/RNG; all candidate loads optimized>100. This supplementary guide is not retained-native-byte attribution or the64level audit/loading/FPS/full gates.'};
const save=()=>fs.writeFileSync(OUT+'/receipt.json',JSON.stringify(r,null,2)+'\n');
const median=a=>[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)];
async function rendererPids(pg){
 const v=await(await fetch('http://127.0.0.1:'+pg.dbg+'/json/version',{signal:AbortSignal.timeout(5000)})).json();
 const ws=new WebSocket(v.webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 try{return await new Promise((res,rej)=>{const t=setTimeout(()=>rej(Error('Process inventory timeout')),10000);ws.onmessage=e=>{const v=JSON.parse(e.data);if(v.id===1){clearTimeout(t);v.error?rej(Error(v.error.message)):res(v.result.processInfo.filter(p=>p.type==='renderer').map(p=>p.id));}};ws.send(JSON.stringify({id:1,method:'SystemInfo.getProcessInfo'}));});}finally{ws.close();}
}
const memory=pids=>Math.max(0,...pids.map(pid=>{const v=/RssAnon:\s+(\d+)/.exec(fs.readFileSync('/proc/'+pid+'/status','utf8'));assert(v);return Math.round(+v[1]/1024);}));
save();
try{
 for(let round=1;round<=3;round++)for(const variant of r.variants){
  const admission={time:new Date().toISOString(),freeMb:Math.floor(freemem()/1048576),requiredMb:4352};assert(admission.freeMb>=4352);
  process.env.BRACKEN_PROCESS_LOG=OUT+'/'+round+'-'+variant+'.processes.jsonl';let pg;
  try{
   pg=await openFixedArtPage(variant==='after',{audio:false,fonts:false,seed:1919});
   const pids=await rendererPids(pg);assert(pids.length);
   assert.deepEqual(await pg.evalp("({time:BK.time,game:[BK.view.buf.width,BK.view.buf.height],display:[document.getElementById('c').width,document.getElementById('c').height],dpr:devicePixelRatio})"),{time:0,game:[320,180],display:[2402,1082],dpr:2.625});
   await pg.evalp('('+installLabRenderClock.toString()+')(BK)');
   await pg.evalp("(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});let seed=1919,rng=0;Math.random=()=>{rng++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};window.__spanRng=()=>({rng,seed});})()");
   for(const load of r.loads){
    const memoryBeforeMb=memory(pids);
    const row=await pg.evalp(`(async()=>{
     const {LEVELS}=await import('/src/level.js');const i=LEVELS.findIndex(x=>x.id==='skyroad');if(i<0)throw Error('Original Skyroad missing');
     const helper=${variant==='after'}?await import('/src/skyroad-opaque-rows.js'):null;
     const prior=helper?.readOpaqueRowStats();const start=performance.now();BK.load(i);const loadMs=performance.now()-start;
     const after=helper?.readOpaqueRowStats();BK.state='play';const firstFrameStart=performance.now();BK.step(0);const firstFrameMs=performance.now()-firstFrameStart;
     const hash=async c=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))).map(n=>n.toString(16).padStart(2,'0')).join('');
     return {loadMs,firstFrameMs,readyMs:loadMs+firstFrameMs,activation:helper?Object.fromEntries(Object.keys(after).map(k=>[k,after[k]-prior[k]])):null,
      exact:{...__spanRng(),time:BK.time,p:['x','y','vx','vy','hp','st','dead','ground','face'].map(k=>BK.P[k]),enemies:BK.enemies().map(e=>[e.t,e.x,e.y,e.hp,e.alive,e.mode,e.modeT]),frame:await hash(BK.view.buf),display:await hash(document.getElementById('c'))}};
    })()`,180000);
    r.rows.push({round,variant,load,admission,memoryBeforeMb,memoryAfterMb:memory(pids),freshStartupReadyMs:pg.freshStartupReadyMs,...row});save();
   }
   assert.deepEqual(pg.errors,[]);assert.deepEqual(pg.paletteErrors,[]);
   assert(pg.paletteServed.includes('/src/main.js')&&pg.paletteServed.includes('/src/puppeteer-hands.js'));
   if(variant==='after')for(const f of manifest.candidate)assert(pg.paletteServed.includes('/'+f.file));
  }finally{if(pg)await pg.close();}
 }
 for(let round=1;round<=3;round++)for(const load of r.loads){
  const [a,b,c]=r.variants.map(v=>r.rows.find(x=>x.round===round&&x.load===load&&x.variant===v));
  assert.deepEqual(b.exact,a.exact,'Candidate frame/display/state/RNG exact');assert.deepEqual(c.exact,a.exact,'Return control exact');
  assert(b.activation.optimized>100&&b.activation.pixels===256*b.activation.optimized&&b.activation.spans<b.activation.pixels/2,'Actual whole-Game span activation');
 }
 r.exactReadbacks=r.rows.length;
 r.guides=r.loads.map(load=>{const rows=r.rows.filter(x=>x.load===load),m=v=>median(rows.filter(x=>x.variant===v).map(x=>x.readyMs)),mem=v=>median(rows.filter(x=>x.variant===v).map(x=>x.memoryAfterMb)),a=m('before'),b=m('after'),c=m('return');return {load,beforeReadyMs:a,candidateReadyMs:b,returnReadyMs:c,readySaving:1-b/a,returnDrift:Math.abs(c/a-1),beforeRendererMb:mem('before'),candidateRendererMb:mem('after'),returnRendererMb:mem('return'),rendererSavingMb:mem('before')-mem('after'),rendererReturnDrift:Math.abs(mem('return')/mem('before')-1)};});
 r.complete=true;r.materialQualified=r.guides.every(x=>x.returnDrift<=0.10&&x.rendererReturnDrift<=0.10&&(x.rendererSavingMb>=32||x.readySaving>=0.10));
 r.status=r.materialQualified?'PASS supplementary controlled material/exactness guide; original gates remain':'Controlled guide complete but material/control qualification FAIL';
 if(!r.materialQualified)process.exitCode=1;
}catch(e){r.error=e.stack;r.complete=false;r.status='Controlled guide failed or interrupted';process.exitCode=1;}
finally{
 r.original921ToolHashesMatch=JSON.stringify(hashes())===JSON.stringify(tools);
 r.gameSourceUnchanged=execFileSync('git',['status','--porcelain'],{cwd:game,encoding:'utf8'}).trim()==='';
 const events=fs.readdirSync(OUT).filter(f=>f.endsWith('.processes.jsonl')).flatMap(f=>fs.readFileSync(OUT+'/'+f,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse));
 const launches=events.filter(x=>x.type==='launch'),closures=events.filter(x=>x.type==='closed');
 r.processes={launches:launches.length,closures:closures.length,allClosed:launches.every(x=>closures.some(y=>y.pid===x.pid&&y.profile===x.profile)),profileAbsences:launches.map(x=>({profile:x.profile,absent:!fs.existsSync(x.profile)})),interruptions:events.filter(x=>x.type==='interrupted'),peakRendererMb:Math.max(0,...closures.map(x=>x.peak.rendererMb)),events};
 r.guardReadbacks=fs.existsSync(process.env.BRACKEN_GUARD_READBACK)?fs.readFileSync(process.env.BRACKEN_GUARD_READBACK,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
 r.strictGuardVerified=r.guardReadbacks.length>0&&r.guardReadbacks.every(x=>x.kind==='strict-profile'&&x.hardLimitMb===1536&&x.sha256===manifest.proof.strictProfileSha256);
 if(!r.original921ToolHashesMatch||!r.gameSourceUnchanged||!r.strictGuardVerified||!r.processes.allClosed||r.processes.profileAbsences.some(x=>!x.absent)||r.processes.interruptions.length){r.complete=false;process.exitCode=1;}
 r.time=new Date().toISOString();save();console.log(JSON.stringify({complete:r.complete,material:r.materialQualified,rows:r.rows.length,guides:r.guides,error:r.error,peak:r.processes.peakRendererMb}));
}
