// Controlled old/new calibration. Retain the historical mover rows, cite intentional content changes,
// and require the original one-character negative control before accepting any new stamp.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
mkdirSync('gate-data',{recursive:true});
const run=spawnSync(process.execPath,['tools/trace-context-probe.mjs'],{stdio:'inherit'});assert.equal(run.status,0);
const old=JSON.parse(readFileSync('gate-data/old.json')),current=JSON.parse(readFileSync('gate-data/current.json'));
for(const id of ['keep','welltown']){assert.deepEqual(current[id],old[id],id+' must retain the historical mover equivalence');assert.equal(current[id+':steps'],old[id+':steps']);}
const changed={wood:['c16af026','3c30b273','7729bcd2'],kings:['bc14ff36','b497d195'],burial:['9fd45022'],canal:['9fd45022','53c5225f']};
const proposed={};for(const id of ['wood','kings','keep','burial','canal','welltown'])for(const suffix of ['',':steps'])proposed[id+suffix]=(changed[id]?current:old)[id+suffix];
const original=readFileSync('docs/slopes-trace.json');writeFileSync('docs/slopes-trace.json',JSON.stringify(proposed));
const receipt={time:new Date().toISOString(),changed,passes:[],negative:null,complete:false};
function check(label){const r=spawnSync(process.execPath,['tools/slopes-trace.mjs'],{encoding:'utf8',timeout:240000});writeFileSync('gate-data/'+label+'.log',(r.stdout||'')+(r.stderr||''));return r;}
try{
 for(let i=1;i<=3;i++){const r=check('positive-'+i);assert.equal(r.status,0,r.stdout+r.stderr);receipt.passes.push({label:'positive-'+i,status:r.status});}
 const p='src/slopes.js',bytes=readFileSync(p),s=bytes.toString();assert.equal(s.split('b.y - lip <= 6').length-1,2);
 try{writeFileSync(p,s.replace('b.y - lip <= 6','b.y - lip <= 5'));const r=check('negative-control');assert.equal(r.status,1,r.stdout+r.stderr);assert.match(r.stdout,/FAIL .*frame/);receipt.negative={status:r.status,detected:true};}
 finally{writeFileSync(p,bytes);}
 assert.equal(check('restored').status,0);receipt.complete=true;writeFileSync('gate-data/slopes-trace-proposed.json',JSON.stringify(proposed));
}finally{writeFileSync('docs/slopes-trace.json',original);writeFileSync('gate-data/calibration-receipt.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));}
