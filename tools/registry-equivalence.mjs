// Exact before/after gameplay and pixel proof in isolated browsers, using the same transport and fixed input/seed.
import assert from'node:assert/strict';import{spawnSync}from'node:child_process';import{mkdirSync,copyFileSync,writeFileSync,readFileSync}from'node:fs';
import{resolve,join}from'node:path';import{pathToFileURL}from'node:url';import{createHash}from'node:crypto';
const root=process.cwd(),out=resolve('gate-data/registry-equivalence'),base=process.argv[2]||'5e44cddda959fb6e0e8a6b7a4d85f116f0e94e4a';
mkdirSync(out,{recursive:true});const beforeRoot=resolve('../registry-before');
const added=spawnSync('git',['worktree','add','--detach',beforeRoot,base],{encoding:'utf8'});assert.equal(added.status,0,added.stderr);
for(const file of ['cdp.mjs','browser-profile.mjs','ports.mjs','process-owner.mjs'])copyFileSync(join(root,'tools',file),join(beforeRoot,'tools',file));
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const snapshots={};
for(const[name,cwd]of[['before',beforeRoot],['after',root]]){
 process.env.BRACKEN_PROCESS_LOG=join(out,name+'.processes.jsonl');process.env.BRACKEN_RUN=name==='before'?'regbef':'regaft';
 const{openPage}=await import(pathToFileURL(join(cwd,'tools/cdp.mjs')));const pg=await openPage({audio:false,fonts:false,seed:1919});
 try{
  const data=await pg.evalp(`(async()=>{
   BK.manualSimulation=true;
   const {LEVELS}=await import('/src/level.js'),M=await import('/src/marks.js');
   const canon=o=>o instanceof Set?[...o].sort():Array.isArray(o)?o.map(canon):o&&typeof o==='object'?Object.fromEntries(Object.keys(o).sort().map(k=>[k,canon(o[k])])):o;
   const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
   const tells=canon(Object.fromEntries(['THROWN','QUIET','BY_HAND','MARK','ANSWER','HEIGHT','HARMLESS','UNTOLD'].map(k=>[k,M[k]])));
   const levels=await digest(new TextEncoder().encode(JSON.stringify(LEVELS.map(l=>[l.id,l.W,l.H,l.grid,l.ents,l.moversExtra,l.ambushes]))));
   const rows=[];
   for(const id of ['wood','spire','canal']){
    let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    BK.setHero('knight');BK.reset({fresh:true});BK.SET.speed=0.6;BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.state='play';BK.god=true;
    const trace=[];
    for(let f=0;f<180;f++){
     for(const k in BK.keys)BK.keys[k]=false;BK.keys.right=f<120;BK.keys.left=f>=120;BK.keys.jump=f>=20&&f<50;if(f===20)BK.press('jump');
     BK.sim(1);const p=BK.P;trace.push([p.x,p.y,p.vx,p.vy,p.hp,p.st,!!p.ground]);
    }
    BK.step(0);const c=BK.view.buf,px=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    rows.push({id,trace,enemies:BK.enemies().map(e=>[e.t,e.x,e.y,e.hp,e.mode,e.modeT,!!e.alive]),pixels:await digest(px),png:c.toDataURL('image/png')});
   }
   return {tells,levels,rows};
  })()`,240000);
  for(const row of data.rows){writeFileSync(join(out,name+'-'+row.id+'.png'),Buffer.from(row.png.split(',')[1],'base64'));delete row.png;}
  snapshots[name]=data;writeFileSync(join(out,name+'.json'),JSON.stringify(data));
  assert.deepEqual(pg.errors,[],name+' page errors');
 }finally{await pg.close();}
}
const before=snapshots.before,after=snapshots.after,receipt={base,commit:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),
 time:new Date().toISOString(),node:process.version,beforeHash:sha(before),afterHash:sha(after),
 comparisons:{tells:sha(before.tells)===sha(after.tells),levelData:before.levels===after.levels,
  gameplay:sha(before.rows.map(({pixels,...r})=>r))===sha(after.rows.map(({pixels,...r})=>r)),pixels:sha(before.rows.map(r=>r.pixels))===sha(after.rows.map(r=>r.pixels))}};
receipt.complete=Object.values(receipt.comparisons).every(Boolean);writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));assert.deepEqual(after,before,'game state, tells and pixels must be exactly unchanged');
