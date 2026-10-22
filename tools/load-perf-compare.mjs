// Same-runner before/after comparison: original 4x CPU phone setup, three FPS samples, exact pixels.
import{spawnSync}from'node:child_process';import{mkdirSync,copyFileSync,writeFileSync}from'node:fs';import{resolve,join}from'node:path';import{pathToFileURL}from'node:url';import assert from'node:assert/strict';
const id=process.argv[2];assert(id);const root=process.cwd(),out=resolve('gate-data/'+id),before=resolve('../perf-before');mkdirSync(out,{recursive:true});
const added=spawnSync('git',['worktree','add','--detach',before,'5e44cddd'],{encoding:'utf8'});assert.equal(added.status,0,added.stderr);
for(const f of ['cdp.mjs','browser-profile.mjs','process-memory.mjs','ports.mjs'])copyFileSync(join(root,'tools',f),join(before,'tools',f));
const rows={},sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(const[name,cwd]of[['before',before],['after',root]]){
 process.env.BRACKEN_PROCESS_LOG=join(out,name+'.processes.jsonl');process.env.BRACKEN_CHECK=id+'-'+name;
 const{openPage}=await import(pathToFileURL(join(cwd,'tools/cdp.mjs')));const pg=await openPage({audio:false,fonts:false,seed:1919,gcLoads:false});
 try{
  await pg.send('Emulation.setDeviceMetricsOverride',{width:915,height:412,deviceScaleFactor:2.625,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});await pg.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await pg.send('Emulation.setCPUThrottlingRate',{rate:4});await pg.reload();
  const setup=`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));BK.start();BK.state='play';BK.god=true;BK.P.inv=999;const a=BK.L.arena;if(a){BK.P.x=a.start?a.start[0]*16+8:(a.x0+a.x1)/2;BK.P.y=a.start?(a.start[1]+1)*16:a.floor;}BK.sim(120);BK.step(0);})()`;
  await pg.evalp(setup);  await pg.evalp('BK.manualSimulation=false');await sleep(3000);const samples=[];await pg.send('Performance.enable');
  for(let i=0;i<3;i++){
   await pg.evalp(`(()=>{const a=window.__fpsProbe={on:true,n:0};function f(){if(!a.on)return;a.n++;requestAnimationFrame(f);}requestAnimationFrame(f);})()`);
   const metrics=async()=>Object.fromEntries((await pg.send('Performance.getMetrics')).result.metrics.map(r=>[r.name,r.value]));const a=await metrics();await sleep(5000);const b=await metrics();const n=await pg.evalp('window.__fpsProbe.on=false;window.__fpsProbe.n');samples.push({fps:+(n/(b.Timestamp-a.Timestamp)).toFixed(2),busyMs:+((b.TaskDuration-a.TaskDuration)*1000/Math.max(n,1)).toFixed(2)});
  }
  await pg.evalp(setup);const pixels=[];for(let f=0;f<120;f++){const p=await pg.evalp(`(async()=>{BK.step(1);const c=BK.view.buf,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return [...new Uint8Array(await crypto.subtle.digest('SHA-256',d))].map(n=>n.toString(16).padStart(2,'0')).join('');})()`);pixels.push(p);}
  const png=await pg.evalp('BK.view.buf.toDataURL("image/png")');writeFileSync(join(out,name+'.png'),Buffer.from(png.split(',')[1],'base64'));

  rows[name]={pixels,samples,arena:await pg.evalp('!!BK.bossActive')};assert.deepEqual(pg.errors,[]);
 }finally{await pg.close();}
}
const median=a=>a.slice().sort((a,b)=>a-b)[1];const receipt={id,time:new Date().toISOString(),commit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),cpu:4,
 before:median(rows.before.samples.map(r=>r.fps)),after:median(rows.after.samples.map(r=>r.fps)),samples:{before:rows.before.samples,after:rows.after.samples},samePixels:JSON.stringify(rows.before.pixels)===JSON.stringify(rows.after.pixels),arena:{before:rows.before.arena,after:rows.after.arena}};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));assert(receipt.samePixels,'renderer change must preserve every sampled pixel');
