// Reproducible acceptance audit, separate from structural regression checks.
// node tools/combat-acceptance.mjs boss|ambush|strategy output.json [level,level]
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { writeFileSync } from 'node:fs';
import { completed, summarize } from './combat-results.mjs';
const [kind,out,selection]=process.argv.slice(2);
if(!['boss','ambush','strategy'].includes(kind)||!out)throw Error('Usage: node tools/combat-acceptance.mjs boss|ambush|strategy output.json [level,level]');
const ids=selection?selection.split(','):kind==='strategy'?['marsh','scree']:LEVELS.filter(l=>kind==='ambush'?l.build().ambushes?.length:(!l.hidden||l.secret)&&l.build().arena).map(l=>l.id);
for (const id of ids) {
  const level = LEVELS.find(l => l.id === id);
  if (!level) throw Error('Unknown level: ' + id);
  if (!(kind === 'ambush' ? level.build().ambushes?.length : level.build().arena)) throw Error('No ' + kind + ' encounter in ' + id);
}
const heroes=['knight','warden','pyro','paladin','pirate','reaper'];
const report={kind,seed:1919,started:new Date().toISOString(),limits:kind==='ambush'?[15,35]:[90,150],rows:[],complete:false};
const pg=await openPage({audio:false});
try{
  await pg.evalp('window.acceptanceBase=JSON.parse(JSON.stringify(BKT.PROG));');
  for(const id of ids)for(const h of heroes)for(const style of kind==='strategy'?['plunge','mixed']:[null]){
    await pg.reload();
    await pg.evalp('window.acceptanceBase=JSON.parse(JSON.stringify(BKT.PROG));');
    const args=kind==='ambush'?{levels:[id],heroes:[h],maxSecs:90}:{bosses:[id],heroes:[h],maxSecs:180,modes:true,...(style?{attackStyle:style}:{})};
    const row=await pg.evalp(`(async()=>{
      BK.manualSimulation=true;
      const p=BKT.PROG;for(const k of Object.keys(p))delete p[k];Object.assign(p,JSON.parse(JSON.stringify(window.acceptanceBase)));
      p.xp={};p.skillOwned={};p.loadouts={};p.items={};p.ranks={};
      for(const k of Object.keys(BK.keys))BK.keys[k]=false;BK.coopEnd();
      const random=Math.random;let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      try{return (await BK.${kind==='ambush'?'ambushLab':'bossLab'}(${JSON.stringify(args)})).rows[0];}finally{Math.random=random;}
    })()`);
    if(style)row.style=style;
    report.rows.push(row);writeFileSync(out,JSON.stringify(report,null,2)+'\n');
    console.log(`${id}/${h}${style?'/'+style:''}: ${completed(kind,row)?row.secs+'s':'unfinished'}`);
  }
  if(pg.errors.length)throw Error(pg.errors.join('\n'));
  const rows=report.rows;
  report.summary=summarize(kind,rows,report.limits);
  report.passed=kind==='strategy'?report.summary.inTarget===ids.length*heroes.length:report.summary.inTarget===rows.length;
  report.complete=true;report.finished=new Date().toISOString();writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.summary));process.exitCode=report.passed?0:1;
}finally{pg.close();}
