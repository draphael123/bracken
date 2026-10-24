// Diagnostic before/after/return: omit GC only when setHero reused the same live art.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
import {pauseGameAtBoot} from './manual-lab-boot.mjs';
import {installLabCollection} from './lab-collect.mjs';
const source=readFileSync('tools/textfit.mjs','utf8'),body=source.slice(source.indexOf('async function pageTextFit('),source.indexOf('// Scope bodies'));
if(!body.startsWith('async function pageTextFit(')||!body.trimEnd().endsWith('}'))throw Error('Layout body boundaries changed');
const cases=[['talk',12],['levelcard',6],['plates',6],['boss',4]],rows=[];mkdirSync('gate-data/layout-gc',{recursive:true});
for(const variant of ['before','after','return'])for(const [scope,batch] of cases){
 const pg=await openPage({audioFiles:false,seed:1008,gcHelpers:false});
 try{
  await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'});await pg.reload();
  for(const type of ['keyDown','keyUp'])await pg.send('Input.dispatchKeyEvent',{type,key:'F8',code:'F8',windowsVirtualKeyCode:119});
  const ids=await pg.evalp(`(()=>{
   window.__gcCost={calls:0,skipped:0,ms:0,random:0};let stable=false;const select=BK.setHero;
   BK.setHero=function(...a){const before=BK.heroSet,result=select.apply(this,a);stable=!!before&&before===BK.heroSet;return result;};
   (${installLabCollection.toString()})(BK,()=>{const omit=stable&&${JSON.stringify(variant)}==='after';stable=false;if(omit){__gcCost.skipped++;return;}const t=performance.now();gc();__gcCost.calls++;__gcCost.ms+=performance.now()-t;});
   const random=Math.random;Math.random=()=>{__gcCost.random++;return random();};
   return import('/src/level.js').then(m=>m.LEVELS.filter(l=>(!l.hidden||l.secret)&&l.id!=='custom').map(l=>l.id));
  })()`);
  const start=Date.now(),r=await pg.evalp('('+body+')('+JSON.stringify({only:[scope],hints:[],levels:ids.slice(0,batch),talkHeroes:['knight'],maxShots:120})+')',240000);
  const details=await pg.evalp('({gc:__gcCost,state:[BK.state,BK.time,BK.PROG.hero,...["x","y","vx","vy","hp","st","dead"].map(k=>BK.P[k])]})');
  rows.push({variant,scope,batch,ms:Date.now()-start,...details,stats:r.stats,issues:r.issues.map(({type,screen,s})=>({type,screen,s})),pageErrors:pg.errors});
  writeFileSync('gate-data/layout-gc/receipt.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:rows.length===cases.length*3,diagnosticOnly:true,rows},null,2)+'\n');
  assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(rows.at(-1)));
 }finally{await pg.close();}
}
const comparison=[];for(const [scope] of cases){const [a,b,c]=['before','after','return'].map(v=>rows.find(r=>r.variant===v&&r.scope===scope));for(const r of[b,c]){assert.deepEqual(r.stats,a.stats,scope+' coverage');assert.deepEqual(r.issues,a.issues,scope+' issues');assert.deepEqual(r.state,a.state,scope+' game state');assert.equal(r.gc.random,a.gc.random,scope+' random stream');}comparison.push({scope,before:a.ms,after:b.ms,return:c.ms,beforeCollections:a.gc.calls,afterCollections:b.gc.calls,skipped:b.gc.skipped,fasterThanBoth:b.ms<a.ms&&b.ms<c.ms});}
writeFileSync('gate-data/layout-gc/comparison.json',JSON.stringify({time:new Date().toISOString(),exactStatisticsIssuesStateAndRng:true,comparison},null,2)+'\n');
