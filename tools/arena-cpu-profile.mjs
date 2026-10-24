// Diagnostic only: sample the real mobile arena without wrapping render methods.
import {openPage} from './cdp.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const id=process.argv[2];assert(id);mkdirSync('gate-data',{recursive:true});
process.env.BRACKEN_PROCESS_LOG='gate-data/cpu-'+id+'.processes.jsonl';
const pg=await openPage({audio:false,fonts:false,seed:1919});
try{
 await pg.send('Emulation.setDeviceMetricsOverride',{width:915,height:412,deviceScaleFactor:2.625,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});
 await pg.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await pg.send('Emulation.setCPUThrottlingRate',{rate:4});await pg.reload();
 await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));BK.start();BK.state='play';BK.god=true;BK.P.inv=999;const a=BK.L.arena;BK.P.x=a.start?a.start[0]*16+8:(a.x0+a.x1)/2;BK.P.y=a.start?(a.start[1]+1)*16:a.floor;BK.sim(120);BK.step(0);})()`);
 await pg.send('HeapProfiler.collectGarbage');await pg.evalp('BK.manualSimulation=false');
 await new Promise(r=>setTimeout(r,3000));
 await pg.send('Profiler.enable');await pg.send('Profiler.setSamplingInterval',{interval:500});await pg.send('Profiler.start');
 await new Promise(r=>setTimeout(r,10000));
 const stop=await pg.send('Profiler.stop'),profile=stop.profile||stop.result?.profile;assert(profile?.samples?.length);
 const state=await pg.evalp(`(()=>{BK.manualSimulation=true;return{arena:!!BK.bossActive,coarse:matchMedia('(pointer: coarse)').matches,dpr:devicePixelRatio,view:[BK.view.VW,BK.view.VH],display:[document.getElementById('c').width,document.getElementById('c').height]};})()`);
 assert(state.arena);assert(state.coarse);assert.equal(state.dpr,2.625);assert.deepEqual(pg.errors,[]);
 const nodes=new Map(profile.nodes.map(n=>[n.id,n])),times=new Map();let total=0;
 profile.samples.forEach((id,i)=>{const dt=profile.timeDeltas[i];times.set(id,(times.get(id)||0)+dt);total+=dt;});
 const rows=[...times].map(([id,us])=>{const c=nodes.get(id).callFrame;return{function:c.functionName||'(anonymous)',url:c.url,line:c.lineNumber+1,ms:us/1000,percent:100*us/total};}).sort((a,b)=>b.ms-a.ms);
 const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 writeFileSync('gate-data/cpu-'+id+'.cpuprofile',JSON.stringify(profile));
 const receipt={time:new Date().toISOString(),source,id,diagnosticOnly:true,cpu:4,...state,totalMs:total/1000,rows};
 writeFileSync('gate-data/cpu-'+id+'.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({...receipt,rows:rows.slice(0,25)}));
}finally{await pg.close();}
