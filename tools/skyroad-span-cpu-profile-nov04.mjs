// CLOUD ONLY. One whole-Game load+first-frame CPU profile, not a comparative timing trial.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {freemem} from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {OUT,openFixedArtPage} from './skyroad-span-guide-page-nov04.mjs';
import {installLabRenderClock} from './manual-lab-boot.mjs';
assert(process.env.CI);
for(const name of ['BRACKEN_RENDERER_MB','BRACKEN_RECYCLE_MB','BRACKEN_LAB_GC'])assert.equal(process.env[name],undefined);
const game=path.resolve(process.env.FIXED_ART_GAME),sha=x=>createHash('sha256').update(x).digest('hex');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const hashes=()=>Object.fromEntries(walk(game+'/tools').sort().map(f=>[path.relative(game,f).replaceAll('\\','/'),sha(fs.readFileSync(f))]));
const original=hashes();assert.equal(Object.keys(original).length,921);
const manifestBytes=fs.readFileSync(new URL('./skyroad-span-guide-nov04/manifest.json',import.meta.url)),manifest=JSON.parse(manifestBytes);
assert.equal(sha(manifestBytes),'5945712e1e8a5bcb7d97d8c0400157df666ce3d86ed75cd9314453018dbd06c0');
fs.mkdirSync(OUT,{recursive:true});assert(!fs.existsSync(OUT+'/receipt.json'));
fs.writeFileSync(OUT+'/original-tool-hashes.json',JSON.stringify(original,null,2)+'\n');
process.env.BRACKEN_PROCESS_LOG=OUT+'/cpu.processes.jsonl';
const r={time:new Date().toISOString(),controller:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),manifestSha256:sha(manifestBytes),proof:manifest.proof,
 status:'One candidate-only whole-Game CPU profile running',scope:'Exact studied reset+Skyroad load+first frame at existing320x180lab,4xCPU,915x412,DPR2.625,2402x1082display. No original assertions/snapshots/timing trials repeated, no baseline/return retiming, no intrinsic-cause or avoidable-time claim from samples alone.',
 originalComparativeGuide:41869873212,rendererMb:1536,admissionMb:4352,originalChecksRepeated:0,comparativeTimingTrials:0,complete:false,adopted:false,overallWorkComplete:false};
const save=()=>fs.writeFileSync(OUT+'/receipt.json',JSON.stringify(r,null,2)+'\n');save();
let pg,profiling=false;
try{
 r.admission={freeMb:Math.floor(freemem()/1048576),requiredMb:4352};assert(r.admission.freeMb>=4352);
 pg=await openFixedArtPage(true,{audio:false,fonts:false,seed:1919});
 r.viewport=await pg.evalp("({time:BK.time,game:[BK.view.buf.width,BK.view.buf.height],display:[document.getElementById('c').width,document.getElementById('c').height],dpr:devicePixelRatio})");
 assert.deepEqual(r.viewport,{time:0,game:[320,180],display:[2402,1082],dpr:2.625});
 await pg.evalp('('+installLabRenderClock.toString()+')(BK)');
 await pg.evalp("(()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});let seed=1919,rng=0;Math.random=()=>{rng++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};window.__spanProfileRng=()=>({rng,seed});})()");
 const before=await pg.evalp("(async()=>{const h=await import('/src/skyroad-opaque-rows.js');const {LEVELS}=await import('/src/level.js');const i=LEVELS.findIndex(x=>x.id==='skyroad');if(i<0)throw Error('Original Skyroad missing');window.__spanProfileIndex=i;return h.readOpaqueRowStats();})()");
 await pg.send('Profiler.enable');await pg.send('Profiler.setSamplingInterval',{interval:1000});await pg.send('Profiler.start');profiling=true;
 try{r.returned=await pg.evalp("(()=>{BK.load(window.__spanProfileIndex);BK.state='play';BK.step(0);return {time:BK.time,...__spanProfileRng()};})()",240000);}
 finally{const envelope=await pg.send('Profiler.stop');profiling=false;assert(envelope.result?.profile);const profile=envelope.result.profile;fs.writeFileSync(OUT+'/skyroad-load-first-frame.cpuprofile',JSON.stringify(profile));r.profileSha256=sha(fs.readFileSync(OUT+'/skyroad-load-first-frame.cpuprofile'));r.profileNodes=profile.nodes.length;r.profileSamples=profile.samples.length;r.fullCdpEnvelopeHandled=true;}
 const after=await pg.evalp("(async()=>{const h=await import('/src/skyroad-opaque-rows.js');return h.readOpaqueRowStats();})()");
 r.activation=Object.fromEntries(Object.keys(after).map(k=>[k,after[k]-before[k]]));
 assert(r.activation.optimized>100&&r.activation.pixels===256*r.activation.optimized&&r.activation.spans<r.activation.pixels/2);
 assert.deepEqual(pg.errors,[]);assert.deepEqual(pg.paletteErrors,[]);
 for(const file of manifest.candidate)assert(pg.paletteServed.includes('/'+file.file));
 r.complete=true;r.status='CPU profile collected only. No causal regression, native-byte attribution, benefit/FPS or original gate pass implied.';
}catch(error){r.error=error.stack;r.complete=false;process.exitCode=1;}
finally{
 if(pg){if(profiling)try{await pg.send('Profiler.stop');}catch{}try{await pg.close();}catch(error){r.closeError=error.stack;r.complete=false;process.exitCode=1;}}
 const events=fs.existsSync(process.env.BRACKEN_PROCESS_LOG)?fs.readFileSync(process.env.BRACKEN_PROCESS_LOG,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[],launches=events.filter(x=>x.type==='launch'),closures=events.filter(x=>x.type==='closed');
 r.processes={launches:launches.length,closures:closures.length,allClosed:launches.every(x=>closures.some(y=>y.pid===x.pid&&y.profile===x.profile)),profileAbsences:launches.map(x=>({profile:x.profile,absent:!fs.existsSync(x.profile)})),interruptions:events.filter(x=>x.type==='interrupted'),peakRendererMb:Math.max(0,...closures.map(x=>x.peak.rendererMb)),events};
 r.original921ToolHashesMatch=JSON.stringify(hashes())===JSON.stringify(original);r.gameSourceUnchanged=execFileSync('git',['status','--porcelain'],{cwd:game,encoding:'utf8'}).trim()==='';
 r.guardReadbacks=fs.existsSync(process.env.BRACKEN_GUARD_READBACK)?fs.readFileSync(process.env.BRACKEN_GUARD_READBACK,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
 r.strictGuardVerified=r.guardReadbacks.length>0&&r.guardReadbacks.every(x=>x.kind==='strict-profile'&&x.hardLimitMb===1536&&x.sha256==='9d38b09c585f0054e40125c63b2435e61e8cd6f5cc53e6011edf62178c8c2184');
 if(launches.length!==1||closures.length!==1||!r.processes.allClosed||r.processes.profileAbsences.some(x=>!x.absent)||r.processes.interruptions.length||!r.original921ToolHashesMatch||!r.gameSourceUnchanged||!r.strictGuardVerified){r.complete=false;process.exitCode=1;}
 r.time=new Date().toISOString();save();console.log(JSON.stringify({complete:r.complete,nodes:r.profileNodes,samples:r.profileSamples,activation:r.activation,peak:r.processes.peakRendererMb,error:r.error}));
}
