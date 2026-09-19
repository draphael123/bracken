// Reproducible acceptance audit, separate from structural regression checks.
// node tools/combat-acceptance.mjs boss|ambush|strategy output.json [level,level]
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { writeFileSync } from 'node:fs';
const [kind,out,selection]=process.argv.slice(2);
if(!['boss','ambush','strategy'].includes(kind)||!out)throw Error('Usage: node tools/combat-acceptance.mjs boss|ambush|strategy output.json [level,level]');
const ids=selection?selection.split(','):kind==='strategy'?['marsh','scree']:LEVELS.filter(l=>kind==='ambush'?l.build().ambushes?.length:(!l.hidden||l.secret)&&l.build().arena).map(l=>l.id);
const heroes=['knight','warden','pyro','paladin','pirate','reaper'];
const report={kind,seed:1919,started:new Date().toISOString(),limits:kind==='ambush'?[15,35]:[90,150],rows:[],complete:false};
const pg=await openPage();
try{
  await pg.evalp('window.acceptanceBase=JSON.parse(JSON.stringify(BKT.PROG));');
  for(const id of ids)for(const h of heroes)for(const style of kind==='strategy'?['plunge','mixed']:[null]){
    const args=kind==='ambush'?{levels:[id],heroes:[h],maxSecs:90}:{bosses:[id],heroes:[h],maxSecs:180,modes:true,...(style?{attackStyle:style}:{})};
    const row=await pg.evalp(`(async()=>{
      const p=BKT.PROG;for(const k of Object.keys(p))delete p[k];Object.assign(p,JSON.parse(JSON.stringify(window.acceptanceBase)));
      p.xp={};p.skillOwned={};p.loadouts={};p.items={};p.ranks={};
      for(const k of Object.keys(BK.keys))BK.keys[k]=false;BK.coopEnd();
      const random=Math.random;let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      try{return (await BK.${kind==='ambush'?'ambushLab':'bossLab'}(${JSON.stringify(args)})).rows[0];}finally{Math.random=random;}
    })()`);
    if(style)row.style=style;
    report.rows.push(row);writeFileSync(out,JSON.stringify(report,null,2)+'\n');
    console.log(`${id}/${h}${style?'/'+style:''}: ${row.opened||row.killed?row.secs+'s':'unfinished'}`);
  }
  if(pg.errors.length)throw Error(pg.errors.join('\n'));
  const rows=report.rows;
  report.summary={samples:rows.length,completed:rows.filter(r=>r.opened||r.killed).length,inTarget:kind==='strategy'?rows.filter(r=>r.style==='mixed'&&r.killed&&(r.damage?.plunge||0)<(r.damage?.other||0)).length:rows.filter(r=>(r.opened||r.killed)&&r.secs>=report.limits[0]&&r.secs<=report.limits[1]).length};
  report.passed=kind==='strategy'?report.summary.inTarget===ids.length*heroes.length:report.summary.inTarget===rows.length;
  report.complete=true;report.finished=new Date().toISOString();writeFileSync(out,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.summary));process.exitCode=report.passed?0:1;
}finally{pg.close();}
