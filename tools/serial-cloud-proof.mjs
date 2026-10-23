// Full fresh serial verification of public source; no local checkpoint or computer data is uploaded.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,appendFileSync,openSync,closeSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
const SOURCE='5f4fe2e4b8a2cac2fe3009ac9177b0ed856fb946',out=resolve('gate-data');
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),save=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
if(process.argv.includes('--compare')){
 const serial=read(join(out,'serial.json')),refs=[];assert.equal(serial.commit,SOURCE);
 const walk=d=>{for(const e of readdirSync(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())walk(p);else if(/^shard-\d+\.json$/.test(e.name))refs.push(read(p));}};
 walk(join(out,'reference'));const ci=new Map();for(const s of refs){assert.equal(s.commit,SOURCE);for(const r of s.results){assert(!ci.has(r.name));ci.set(r.name,r);}}
 const local=new Map(serial.results.map(r=>[r.name,r])),differences=[];for(const[n,r]of local)if(ci.has(n)&&ci.get(n).ok!==r.ok)differences.push({name:n,serial:r.ok?'PASS':'FAIL',ci:ci.get(n).ok?'PASS':'FAIL'});
 const comparison={time:new Date().toISOString(),source:SOURCE,referenceRun:39875180754,serialVerdicts:local.size,serialComplete:serial.complete,ciVerdicts:ci.size,ciMissing:serial.expected.filter(n=>!ci.has(n)),serialMissing:serial.expected.filter(n=>!local.has(n)),differences,identicalComplete:serial.complete&&ci.size===serial.expected.length&&!differences.length,note:'Fresh Linux serial run of the same public source. Comparisons use actual shard verdicts only; missing checks are Unknown.'};
 save(join(out,'comparison.json'),comparison);if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Same-source comparison\n\n```json\n'+JSON.stringify(comparison,null,2)+'\n```\n');console.log(JSON.stringify(comparison,null,2));process.exit(0);
}
mkdirSync(out,{recursive:true});const checkpoint=join(out,'serial.json');assert(!existsSync(checkpoint),'a fresh run must not import any previous checkpoint');
const game=resolve('frozen-serial-source');if(!existsSync(join(game,'.git')))execFileSync('git',['worktree','add','--detach',game,SOURCE],{stdio:'inherit'});
assert.equal(execFileSync('git',['rev-parse','HEAD'],{cwd:game,encoding:'utf8'}).trim(),SOURCE);
const names=JSON.parse(execFileSync(process.execPath,['tools/check.mjs','--list'],{cwd:game,encoding:'utf8'}));assert.equal(names.length,425);
const startedAt=Date.now(),deadline=startedAt+330*60000,attempts=[];save(join(out,'start-receipt.json'),{time:new Date().toISOString(),source:SOURCE,expected:names.length,fresh:true,importedLocalVerdicts:0});
if(process.argv.includes('--prepare')){console.log('Verified frozen public source '+SOURCE+' and all425 registered checks; no local data imported.');process.exit(0);}
let child;const stop=()=>{if(child&&child.exitCode===null)child.kill('SIGTERM');};process.on('SIGTERM',stop);process.on('SIGINT',stop);let code=2;
for(let attempt=1;attempt<=2&&Date.now()<deadline;attempt++){
 const before=attempt===1?null:read(checkpoint),fd=openSync(join(out,'serial.log'),'a'),entry={attempt,startedAt:new Date().toISOString(),retainedBefore:before?.results.length||0};
 child=spawn(process.execPath,['tools/check.mjs','--jobs=1','--max-browsers=1',attempt===1?'--progress':'--resume',checkpoint],{cwd:game,env:process.env,stdio:['ignore',fd,fd]});entry.pid=child.pid;attempts.push(entry);console.log('Fresh public-source serial proof '+SOURCE+'; attempt '+attempt+'.');
 const timer=setTimeout(stop,Math.max(1,deadline-Date.now())),heartbeat=setInterval(()=>{try{const s=read(checkpoint);console.log(JSON.stringify({time:new Date().toISOString(),verdicts:s.results.length,active:s.active?.map(x=>x.name),waiting:s.waiting}));}catch{}},60000);
 const result=await new Promise((res,rej)=>{child.on('error',rej);child.on('close',(code,signal)=>res({code,signal}));});clearTimeout(timer);clearInterval(heartbeat);closeSync(fd);Object.assign(entry,result,{endedAt:new Date().toISOString()});
 const state=read(checkpoint);if(before)for(const r of before.results)assert.deepEqual(state.results.find(x=>x.name===r.name),r,'saved verdict changed: '+r.name);
 save(join(out,'serial-receipt.json'),{time:new Date().toISOString(),source:SOURCE,expected:425,fresh:true,importedLocalVerdicts:0,attempts,complete:state.complete,actualVerdicts:state.results.length,passed:state.results.filter(r=>r.ok).length,failed:state.results.filter(r=>!r.ok).map(r=>r.name),missing:state.expected.filter(n=>!state.results.some(r=>r.name===n)),note:'One missing-only recovery within the original combined330-minute serial budget. Existing PASS/FAIL verdicts remain unchanged.'});
 code=result.code??2;if(code!==2)break;
}
const s=read(checkpoint),summary='## Fresh full serial proof\n\nPublic source: `'+SOURCE+'`. All425 checks run serially on Linux; no local checkpoint imported.\n\n'+s.results.length+'/'+s.expected.length+' actual verdicts; '+s.results.filter(r=>!r.ok).length+' FAIL; '+(s.complete?'complete':'incomplete')+'.\n\n```text\n'+(existsSync(checkpoint+'.summary.txt')?readFileSync(checkpoint+'.summary.txt','utf8'):'INCOMPLETE: inspect the retained checkpoint and raw log.')+'\n```\n';
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,summary);console.log(summary);process.exitCode=code;
