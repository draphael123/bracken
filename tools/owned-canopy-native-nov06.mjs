// CLOUD ONLY. Fresh native component for a genuinely different exact source.
import fs from'node:fs';import path from'node:path';import assert from'node:assert/strict';import{createHash}from'node:crypto';import{execFileSync,spawnSync}from'node:child_process';import{pathToFileURL}from'node:url';import{freemem}from'node:os';
import{OUT,openFixedArtPage}from'./owned-canopy-native-nov06-page.mjs';
import{compareOwnedCanopy}from'./owned-canopy-native-nov06-cases.mjs';
assert(process.env.CI);for(const key of['BRACKEN_RENDERER_MB','BRACKEN_RECYCLE_MB','BRACKEN_LAB_GC'])assert.equal(process.env[key],undefined);
const game=path.resolve(process.env.FIXED_ART_GAME),sha=b=>createHash('sha256').update(b).digest('hex'),mb=fs.readFileSync(new URL('./owned-canopy-native-nov06/manifest.json',import.meta.url)),m=JSON.parse(mb),walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]),toolHashes=()=>Object.fromEntries(walk(game+'/tools').sort().map(f=>[path.relative(game,f).replaceAll('\\','/'),sha(fs.readFileSync(f))])),before=toolHashes();
assert.equal(Object.keys(before).length,921);fs.writeFileSync(OUT+'/manifest.json',mb);fs.writeFileSync(OUT+'/original-tool-hashes.json',JSON.stringify(before,null,2)+'\n');
const r={time:new Date().toISOString(),controller:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),manifestSha256:sha(mb),proof:m.proof,documents:[],nodeFixtures:[],nodeFallback:null,complete:false,originalBrowserFixturesExecuted:0,originalTimingTrials:0,adopted:false,overallWorkComplete:false},save=()=>fs.writeFileSync(OUT+'/receipt.json',JSON.stringify(r,null,2)+'\n'),events=()=>walk(OUT).filter(f=>f.endsWith('.processes.jsonl')).flatMap(f=>fs.readFileSync(f,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse));save();
for(const mode of['cpu','gpu']){
 let pg;const row={mode,complete:false};r.documents.push(row);save();
 try{
  row.admission={freeMb:Math.floor(freemem()/1048576),requiredMb:4352};assert(row.admission.freeMb>=4352);process.env.BRACKEN_PROCESS_LOG=OUT+'/'+mode+'.processes.jsonl';pg=await openFixedArtPage(true,{audio:false,fonts:false,seed:1919,startupQuery:mode==='gpu'?'?gpucv=1':''});
  row.actual=await pg.evalp("({query:location.search,time:BK.time,game:[BK.view.buf.width,BK.view.buf.height],display:[document.getElementById('c').width,document.getElementById('c').height],dpr:devicePixelRatio})");assert.equal(row.actual.query,mode==='gpu'?'?gpucv=1':'');assert.equal(row.actual.time,0);assert.deepEqual(row.actual.display,[2402,1082]);assert.equal(row.actual.dpr,2.625);
  row.result=await pg.evalp('('+compareOwnedCanopy.toString()+')('+JSON.stringify({cases:m.proof.cases})+','+JSON.stringify(mode)+')',600000);
  assert(row.result.complete&&row.result.allExact);assert.equal(row.result.rows.length,m.proof.cases.length);assert.equal(row.result.globalRng,0);assert.equal(row.result.fallbacks.length,mode==='cpu'?m.proof.observerFallbackControls:0);assert.equal(row.result.foreignFallbacks.length,m.proof.foreignInputPaletteFallbacks);assert.deepEqual(pg.errors,[]);assert.deepEqual(pg.paletteErrors,[]);row.complete=true;
 }catch(e){row.error=e.stack;process.exitCode=1;if(pg)try{row.partial=await pg.evalp('window.__ownedCanopyDiagnostic||null',10000);}catch(e){row.partialError=e.message;}}
 finally{if(pg)try{await pg.close();}catch(e){row.closeError=e.stack;row.complete=false;process.exitCode=1;}save();}
}
// The three unchanged original Node fixtures run on these exact candidate bytes,
// restored in finally before the final Game/source readback.
const changed=m.candidate.filter(f=>f.file!=='src/puppeteer-hands.js'),saved=[];
try{
 for(const f of changed){const dest=path.resolve(game,f.file);assert(dest.startsWith(game+path.sep));const exists=fs.existsSync(dest),original=exists?fs.readFileSync(dest):null;if(exists)assert.equal(sha(original),f.originalSha256);else assert.equal(f.originalSha256,undefined);saved.push({dest,original,existed:exists});fs.writeFileSync(dest,Buffer.from(f.contentBase64,'base64'));}
 const nodeSource=m.nodeFallbackSource;const nodeFile=OUT+'/node-fallback.mjs';fs.writeFileSync(nodeFile,nodeSource);assert.equal(sha(nodeSource),m.proof.nodeFallbackSha256);
 const fallback=spawnSync(process.execPath,[nodeFile],{cwd:game,encoding:'utf8',timeout:240000,env:{...process.env,OWNED_CANOPY_GAME:game,OWNED_CANOPY_OUT:OUT}});fs.writeFileSync(OUT+'/node-fallback.log',(fallback.stdout||'')+(fallback.stderr||''));r.nodeFallback={exitCode:fallback.status,error:fallback.error?.message,logSha256:sha(fs.readFileSync(OUT+'/node-fallback.log'))};if(fallback.status!==0)process.exitCode=1;
 if(fs.existsSync(OUT+'/node-fallback.json'))r.nodeFallback.result=JSON.parse(fs.readFileSync(OUT+'/node-fallback.json'));
 for(const name of['canvas-retirement-selftest','skins','dressing']){
  const file=game+'/tools/'+name+'.mjs';assert.equal(sha(fs.readFileSync(file)),before['tools/'+name+'.mjs']);const result=spawnSync(process.execPath,[file],{cwd:game,encoding:'utf8',timeout:600000});const log=OUT+'/node-'+name+'.log';fs.writeFileSync(log,(result.stdout||'')+(result.stderr||''));r.nodeFixtures.push({name,exitCode:result.status,error:result.error?.message,fixtureSha256:sha(fs.readFileSync(file)),logSha256:sha(fs.readFileSync(log)),unchangedOriginalFixture:true});if(result.status!==0)process.exitCode=1;save();
 }
}catch(e){r.nodeError=e.stack;process.exitCode=1;}
finally{for(const f of saved.reverse())if(f.existed)fs.writeFileSync(f.dest,f.original);else{assert(f.dest.startsWith(game+path.sep));fs.unlinkSync(f.dest);}save();}
const es=events(),launches=es.filter(x=>x.type==='launch'),closed=es.filter(x=>x.type==='closed');
r.processes={launches:launches.length,closures:closed.length,allClosed:launches.every(x=>closed.some(y=>y.pid===x.pid&&y.profile===x.profile)),profileAbsences:launches.map(x=>({profile:x.profile,absent:!fs.existsSync(x.profile)})),interruptions:es.filter(x=>x.type==='interrupted'),peakRendererMb:Math.max(0,...closed.map(x=>x.peak.rendererMb)),events:es};
r.guardReadbacks=fs.existsSync(process.env.BRACKEN_GUARD_READBACK)?fs.readFileSync(process.env.BRACKEN_GUARD_READBACK,'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse):[];
r.strictProfileVerified=r.guardReadbacks.length>0&&r.guardReadbacks.every(x=>x.kind==='strict-profile'&&x.hardLimitMb===1536&&x.sha256===m.proof.strictProfileSha256);
r.all921OriginalToolHashesMatch=JSON.stringify(before)===JSON.stringify(toolHashes());r.gameSourceRestoredUnchanged=execFileSync('git',['status','--porcelain'],{cwd:game,encoding:'utf8'}).trim()==='';
r.complete=r.documents.length===2&&r.documents.every(x=>x.complete)&&r.nodeFixtures.length===3&&r.nodeFixtures.every(x=>x.exitCode===0)&&r.nodeFallback?.exitCode===0&&r.strictProfileVerified&&r.all921OriginalToolHashesMatch&&r.gameSourceRestoredUnchanged&&launches.length===2&&closed.length===2&&r.processes.allClosed&&r.processes.profileAbsences.every(x=>x.absent)&&!r.processes.interruptions.length&&r.processes.peakRendererMb<=1536;
if(!r.complete)process.exitCode=1;r.time=new Date().toISOString();save();console.log(JSON.stringify({complete:r.complete,documents:r.documents.map(x=>({mode:x.mode,complete:x.complete,rows:x.result?.rows.length,nativePairs:x.result?.nativePairs,error:x.error})),node:r.nodeFixtures.map(x=>({name:x.name,exitCode:x.exitCode})),nodeFallback:r.nodeFallback?.exitCode,closed:closed.length,peak:r.processes.peakRendererMb,overallWorkComplete:false}));

