// Same game, inputs, seed and pixels; compare the existing backend with an early CPU-canvas lab setup.
import assert from'node:assert/strict';import{mkdirSync,writeFileSync}from'node:fs';import{join}from'node:path';import{openPage}from'./cdp.mjs';
const dir='gate-data/canvas';mkdirSync(dir,{recursive:true});const rows=[];
for(const id of ['wood','spire','canal'])for(const cpuCanvas of [false,true]){
 const label=id+'-'+(cpuCanvas?'cpu':'existing');process.env.BRACKEN_PROCESS_LOG=join(dir,label+'.processes.jsonl');process.env.BRACKEN_CHECK=label;
 const pg=await openPage({audio:false,fonts:false,seed:1919,cpuCanvas});
 try{const data=await pg.evalp(`(async()=>{
  BK.manualSimulation=true;await document.fonts.ready;const{LEVELS}=await import('/src/level.js');
  let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));BK.start();BK.state='play';BK.god=true;
  const trace=[];for(let f=0;f<120;f++){for(const k in BK.keys)BK.keys[k]=false;BK.keys.right=true;BK.keys.jump=f>=20&&f<45;if(f===20)BK.press('jump');BK.sim(1);const p=BK.P;trace.push([p.x,p.y,p.vx,p.vy,p.hp,p.st,!!p.ground]);}
  BK.step(0);const c=BK.view.buf,px=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  const pixels=[...new Uint8Array(await crypto.subtle.digest('SHA-256',px))].map(n=>n.toString(16).padStart(2,'0')).join('');
  return{trace,pixels,png:c.toDataURL('image/png')};})()`,120000);
  writeFileSync(join(dir,label+'.png'),Buffer.from(data.png.split(',')[1],'base64'));delete data.png;rows.push({id,cpuCanvas,...data});
  assert.deepEqual(pg.errors,[]);
 }finally{await pg.close();}
}
const receipt={time:new Date().toISOString(),comparisons:[],complete:false};
for(const id of ['wood','spire','canal']){const pair=rows.filter(r=>r.id===id),same=JSON.stringify(pair[0].trace)===JSON.stringify(pair[1].trace)&&pair[0].pixels===pair[1].pixels;receipt.comparisons.push({id,same,beforePixels:pair[0].pixels,afterPixels:pair[1].pixels});}
receipt.complete=receipt.comparisons.every(r=>r.same);writeFileSync(join(dir,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
assert(receipt.complete,'early CPU-canvas setup must preserve exact gameplay and pixels');
