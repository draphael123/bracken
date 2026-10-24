// Controlled diagnosis, never release proof: vary only the seeded stream prefix before the original mage fight.
// Every teleport, frame cap, pose comparison and landing observation inside FIGHT is taken from mark-integrity.mjs.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const original=readFileSync('tools/mark-integrity.mjs','utf8').replaceAll('\r\n','\n');
const start=original.indexOf('const FIGHT = String.raw`')+'const FIGHT = String.raw`'.length,end=original.indexOf('`;\nconst fails',start);
assert(start>20&&end>start);let fight=original.slice(start,end);
const replace=(a,b)=>{assert.equal(fight.split(a).length,2);fight=fight.replace(a,b);};
replace("BK.manualSimulation = true; const M = await import('/src/marks.js');","BK.manualSimulation = true; const M = await import('/src/marks.js'),UM=await import('/src/undead-mage.js');const diagnostics=[];");
replace('return n; }\n    finally',`const fields=o=>Object.fromEntries(['mode','modeT','spell','anim','hurtT','x','y','w','h'].map(k=>[k,o[k]??null]));diagnostics.push({pixels:n,time:BK.time,actual:fields(snap),counterfactual:fields(e),frames:[UM.undeadFrame(snap,UM.UNDEADMAGE_F),UM.undeadFrame(e,UM.UNDEADMAGE_F)],player:[BK.P.x,BK.P.y],view:Object.fromEntries(Object.entries(BK.view).filter(([k,v])=>v==null||!['object','function'].includes(typeof v)))});return n; }\n    finally`);
replace('return { rows };','return { rows,diagnostics };');
if(process.argv.includes('--verify-only')){execFileSync(process.execPath,['--input-type=module','--check'],{input:'const fight='+fight+';'});console.log('PASS controlled prefix diagnostic keeps original fight body and all thresholds/caps');process.exit(0);}
const out=process.env.MAGE_PREFIX_OUT||'gate-data/mage-prefix';mkdirSync(out,{recursive:true});process.env.BRACKEN_PROCESS_LOG=out+'/processes.jsonl';
const pg=await openPage({audio:false,fonts:false,seed:20261007}),rows=[];
try{
 await pg.evalp('BK.manualSimulation=true');
 const row=await pg.evalp("BK.bossJump.table().find(r=>r.t==='undeadmage')");assert(row);
 for(const prefix of [0,1,2,3,4,5,8,16]){
  await pg.evalp(`(()=>{let s=20261007;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};for(let i=0;i<${prefix};i++)Math.random();})()`);
  const r=await pg.evalp('('+fight+')('+JSON.stringify(row)+',40)',180000);assert(!r.err,r.err);
  rows.push({prefix,...r});
  writeFileSync(out+'/receipt.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),diagnosticOnly:true,originalFightSeconds:40,originalPoseThreshold:20,controlledRandomPrefixes:true,fixtureMovementUnchanged:true,rows,complete:rows.length===8,pageErrors:pg.errors},null,2)+'\n');
  console.log(JSON.stringify({prefix,zeros:r.diagnostics.filter(d=>d.pixels===0),poses:r.diagnostics.map(d=>({mode:d.actual.mode,pixels:d.pixels}))}));
 }
 assert.deepEqual(pg.errors,[]);
}finally{await pg.close();}
