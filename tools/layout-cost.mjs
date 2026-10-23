// Read-only cost breakdown of original layout batches. No measured frame or layout oracle changes.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {openPage} from './cdp.mjs';
const source=readFileSync('tools/textfit.mjs','utf8');
const body=source.slice(source.indexOf('async function pageTextFit('),source.indexOf('// Scope bodies'));
if(!body.startsWith('async function pageTextFit(')||!body.trimEnd().endsWith('}'))throw Error('Layout body boundaries changed');
const cases=[['talk',12],['levelcard',6],['plates',6],['boss',4]],rows=[];
mkdirSync('gate-data',{recursive:true});
for(const [scope,batch] of cases){
 const boot=Date.now(),pg=await openPage({audioFiles:false});
 try{
  const ids=await pg.evalp(`(()=>{BK.manualSimulation=true;const metrics={};window.__layoutCosts=metrics;for(const name of ['setHero','load','sim','reset','step']){const f=BK[name];BK[name]=function(...args){const t=performance.now();try{return f.apply(this,args);}finally{const r=metrics[name]||=( {n:0,ms:0,max:0});const ms=performance.now()-t;r.n++;r.ms+=ms;r.max=Math.max(r.max,ms);}};}const f=window.__brackenLabCollect;if(f)window.__brackenLabCollect=async()=>{const t=performance.now();try{return await f();}finally{const r=metrics.nativeCollect||=({n:0,ms:0,max:0}),ms=performance.now()-t;r.n++;r.ms+=ms;r.max=Math.max(r.max,ms);}};return import('/src/level.js').then(m=>m.LEVELS.filter(l=>(!l.hidden||l.secret)&&l.id!=='custom').map(l=>l.id));})()`);
  const bootMs=Date.now()-boot,start=Date.now();
  const result=await pg.evalp('('+body+')('+JSON.stringify({only:[scope],hints:[],levels:ids.slice(0,batch),talkHeroes:['knight'],maxShots:120})+')',240000);
  const row={scope,batch,bootMs,ms:Date.now()-start,metrics:await pg.evalp('window.__layoutCosts'),stats:result.stats,issues:result.issues.map(({type,screen,s})=>({type,screen,s})),pageErrors:pg.errors};
  rows.push(row);writeFileSync('gate-data/layout-cost.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:rows.length===cases.length,rows},null,2)+'\n');console.log(JSON.stringify(row));
 }finally{await pg.close();}
}
