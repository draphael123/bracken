// Profile every campaign level at its entry and live boss room. Measurements are evidence, not a relaxed release gate.
import{openPage}from'./cdp.mjs';import{LEVELS}from'../src/level.js';import{mkdirSync,writeFileSync}from'node:fs';
import{spawnSync}from'node:child_process';import{join}from'node:path';import assert from'node:assert/strict';
const arg=process.argv.find(a=>a.startsWith('--shard='))?.slice(8)||'1/8';const[index,count]=arg.split('/').map(Number);
assert(index>=1&&index<=count&&count>=1);
const campaign=LEVELS.filter(l=>!(l.hidden&&!l.secret)&&! /^(shop|trial_|custom)/.test(l.id)).map(l=>l.id);
const ids=campaign.filter((_,i)=>i%count===index-1),dir='gate-data';mkdirSync(dir,{recursive:true});
process.env.BRACKEN_PROCESS_LOG=join(dir,'probe-'+index+'.processes.jsonl');process.env.BRACKEN_RUN=('perf'+index).padEnd(6,'0');
const report={commit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),node:process.version,cpu:4,shard:[index,count],ids,rows:[],complete:false};
const save=()=>writeFileSync(join(dir,'probe-'+index+'.json'),JSON.stringify(report,null,2)+'\n');save();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function measure(pg,id,scene){
 await pg.send('Performance.enable');
 const metrics=async()=>{const m=(await pg.send('Performance.getMetrics')).result.metrics;return Object.fromEntries(m.map(x=>[x.name,x.value]));};
 await pg.evalp(`(()=>{const a=window.__perf={on:true,n:0,dts:[],last:performance.now()};const f=t=>{if(!a.on)return;a.n++;a.dts.push(t-a.last);a.last=t;requestAnimationFrame(f);};requestAnimationFrame(f);})()`);
 await sleep(600);await pg.evalp('window.__perf.n=0;window.__perf.dts=[]');const m0=await metrics();await sleep(5000);const m1=await metrics();
 const frames=await pg.evalp(`(()=>{const a=window.__perf;a.on=false;const d=a.dts.sort((x,y)=>x-y);return{n:a.n,p95:d[Math.floor(d.length*.95)]||0,worst:d.at(-1)||0,position:[BK.P.x,BK.P.y],arenaActive:!!BK.bossActive};})()`);
 const row={id,scene,fps:+(frames.n/(m1.Timestamp-m0.Timestamp)).toFixed(2),p95:+frames.p95.toFixed(2),worst:+frames.worst.toFixed(2),
  busyMs:+((m1.TaskDuration-m0.TaskDuration)*1000/Math.max(1,frames.n)).toFixed(2),position:frames.position,arenaActive:frames.arenaActive};
 await pg.send('Profiler.enable');await pg.send('Profiler.setSamplingInterval',{interval:500});await pg.send('Profiler.start');await sleep(4000);
 const profile=(await pg.send('Profiler.stop')).result.profile;writeFileSync(join(dir,id+'-'+scene+'.cpuprofile'),JSON.stringify(profile));
 const nodes=new Map(profile.nodes.map(n=>[n.id,n])),self=new Map();let total=0;
 profile.samples.forEach((sid,i)=>{const c=nodes.get(sid).callFrame,key=(c.functionName||'(anonymous)')+' '+c.url.split('/').pop()+':'+(c.lineNumber+1),t=profile.timeDeltas[i]||0;self.set(key,(self.get(key)||0)+t);total+=t;});
 row.top=[...self].sort((a,b)=>b[1]-a[1]).slice(0,16).map(([fn,us])=>({fn,percent:+(100*us/total).toFixed(2)}));
 console.log(JSON.stringify(row));return row;
}
for(const id of ids){
 console.log('START '+id+' controller pid='+process.pid);const pg=await openPage({audio:false,fonts:false,seed:1919});
 try{
  await pg.send('Emulation.setDeviceMetricsOverride',{width:915,height:412,deviceScaleFactor:2.625,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
  await pg.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await pg.send('Emulation.setCPUThrottlingRate',{rate:4});
  // Match mobile-perf's cold mobile navigation. Booting desktop then changing metrics leaves
  // desktop backing stores/settings and is not a valid phone baseline.
  await pg.reload();
  const display=await pg.evalp("({coarse:matchMedia('(pointer: coarse)').matches,megapixels:document.getElementById('c').width*document.getElementById('c').height/1e6,view:[BK.view.VW,BK.view.VH]})");
  assert(display.coarse&&display.megapixels<=1.3,'the mobile renderer must be active: '+JSON.stringify(display));
  console.log('display '+JSON.stringify(display));
  const arena=await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));BK.start();BK.state='play';BK.god=true;BK.P.inv=999;return BK.L.arena?JSON.parse(JSON.stringify(BK.L.arena)):null;})()`);
  await sleep(2000);report.rows.push(await measure(pg,id,'entry'));save();
  if(arena){await pg.evalp(`(()=>{const a=BK.L.arena;const x=a.start?a.start[0]*16+8:(a.x0+a.x1)/2;const y=a.start?(a.start[1]+1)*16:a.floor;BK.P.x=x;BK.P.y=y;BK.P.inv=999;BK.sim(120);BK.state='play';})()`);await sleep(2000);report.rows.push(await measure(pg,id,'arena'));save();}
  assert.deepEqual(pg.errors,[],id+' page exceptions');
 }finally{await pg.close();}
}
report.complete=true;report.finishedAt=new Date().toISOString();save();
