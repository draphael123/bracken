import{copyLabHarness}from'./copy-lab-harness.mjs';
// One bounded same-runner diagnostic. Both original release budgets remain fully enabled.
import{spawnSync}from'node:child_process';import{mkdirSync,copyFileSync,writeFileSync}from'node:fs';import{resolve,join}from'node:path';import assert from'node:assert/strict';
const root=process.cwd(),before=resolve('../mobile-before'),out=resolve('gate-data');mkdirSync(out,{recursive:true});
const add=spawnSync('git',['worktree','add','--detach',before,'5e44cddd'],{encoding:'utf8'});assert.equal(add.status,0,add.stderr);
copyLabHarness(root,before);
const results=[];for(const[name,cwd]of[['before',before],['after',root]]){
 mkdirSync(join(cwd,'gate-data'),{recursive:true});const r=spawnSync(process.execPath,['tools/mobile-perf.mjs'],{cwd,encoding:'utf8',timeout:600000,env:{...process.env,MP_WRITE:'1',MP_OUT:'gate-data/mobile.json',BRACKEN_PROCESS_LOG:join(out,'mobile-'+name+'.processes.jsonl')}});
 const log=(r.stdout||'')+(r.stderr||'');writeFileSync(join(out,'mobile-'+name+'.log'),log);try{copyFileSync(join(cwd,'gate-data/mobile.json'),join(out,'mobile-'+name+'.json'));}catch{}
 results.push({name,exitCode:r.status,signal:r.signal,error:r.error?.message||null});console.log(name+' '+JSON.stringify(results.at(-1))+'\n'+log);
}
writeFileSync(join(out,'mobile-comparison.json'),JSON.stringify({time:new Date().toISOString(),source:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),results},null,2)+'\n');if(results[1].exitCode!==0)process.exitCode=1;
