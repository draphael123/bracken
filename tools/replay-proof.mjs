// Real keyboard -> frame inputs -> fresh-page replay, pixel equality, tamper detection and save isolation.
import{openPage}from'./cdp.mjs';import{writeFileSync,mkdirSync}from'node:fs';import assert from'node:assert/strict';
mkdirSync('gate-data',{recursive:true});const receipt={time:new Date().toISOString(),rows:[],complete:false};
for(const level of ['wood','spire','canal']){
 let replay,images=[];let pg=await openPage({audio:false,fonts:false,seed:1919});
 try{
  await pg.evalp('BK.manualSimulation=true;window.__saveBefore=JSON.stringify(localStorage)');
  await pg.evalp('BK.replay.record('+JSON.stringify({level,hero:'knight',seed:1919,hud:true,namecards:true,debug:false})+')');
  for(let f=0;f<180;f++){
   for(const[type,key,code]of f===0?[['keyDown','ArrowRight','ArrowRight']]:f===20?[['keyDown','z','KeyZ']]:f===45?[['keyUp','z','KeyZ']]:f===90?[['keyDown','x','KeyX']]:f===110?[['keyUp','x','KeyX']]:f===140?[['keyUp','ArrowRight','ArrowRight']]:[])
    await pg.send('Input.dispatchKeyEvent',{type,key,code});
   await pg.evalp('BK.sim(1)');if([0,30,90,179].includes(f))images.push(await pg.evalp('BK.replay.png(2)'));
  }
  replay=await pg.evalp('BK.replay.pause();BK.replay.export()');assert.equal(replay.frames.length,180);
  // Audio unlock writes no save; capture's progress writer is locked through the page's lifetime.
  assert.equal(await pg.evalp('JSON.stringify(localStorage)===__saveBefore'),true,'capture changed persisted data');assert.deepEqual(pg.errors,[]);
  writeFileSync('gate-data/'+level+'.replay.json',JSON.stringify(replay));
 }finally{await pg.close();}
 pg=await openPage({audio:false,fonts:false,seed:1919});
 try{
  await pg.evalp('BK.manualSimulation=true');await pg.evalp('BK.replay.replay('+JSON.stringify(replay)+')');const got=[];
  for(let f=0;f<180;f++){await pg.evalp('BK.sim(1)');if([0,30,90,179].includes(f))got.push(await pg.evalp('BK.replay.png(2)'));}
  assert.deepEqual(got,images,level+' pixels');assert.deepEqual(pg.errors,[]);receipt.rows.push({level,frames:180,pixels:4,exact:true});
 }finally{await pg.close();}
 // A changed input must fail its stored state hash; it cannot silently produce different footage.
 pg=await openPage({audio:false,fonts:false,seed:1919});
 try{replay.frames[0].input.keys.left=true;replay.frames[0].input.keys.right=false;await pg.evalp('BK.manualSimulation=true');await pg.evalp('BK.replay.replay('+JSON.stringify(replay)+')');await assert.rejects(pg.evalp('BK.sim(1)'),/Replay diverged at frame 0/);}
 finally{await pg.close();}
}
receipt.complete=true;writeFileSync('gate-data/replay-proof.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
