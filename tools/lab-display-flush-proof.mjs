import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { pauseGameAtBoot, installLabRenderClock } from './manual-lab-boot.mjs';
const root = process.cwd(), reference = resolve('../flush-reference'), out = 'gate-data/display-flush';
mkdirSync(out, { recursive: true });
const added = spawnSync('git', ['worktree','add','--detach',reference,'3ea61398a0164d0acd1b3e0a8e481b604dfa62eb'], { encoding:'utf8' });
assert.equal(added.status,0,added.stderr);
const rows = [];
for (const id of ['wood','spire','canal']) for (const [name,cwd] of [['reference',reference],['flush',root]]) {
  const { openPage } = await import(pathToFileURL(join(cwd,'tools/cdp.mjs')));
  const pg = await openPage({ audio:false,fonts:false,seed:1919 });
  try {
    await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'}); await pg.reload();
    await pg.evalp('('+installLabRenderClock.toString()+')(BK)');
    const result = await pg.evalp(`(async()=>{
      const {LEVELS}=await import('/src/level.js');let seed=1919,count=0;
      Math.random=()=>{count++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===${JSON.stringify(id)}));BK.start();BK.state='play';BK.god=true;
      const trace=[],pixels=[];
      const hash=async c=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',c.getContext('2d').getImageData(0,0,c.width,c.height).data))].map(x=>x.toString(16).padStart(2,'0')).join('');
      for(let f=0;f<512;f++){
        for(const k in BK.keys)BK.keys[k]=false;BK.keys.right=true;BK.keys.jump=f>=20&&f<45;
        if(f===20)BK.press('jump');if(f%80===60)BK.press('atk');BK.step(1);
        const p=BK.P;trace.push({p:['x','y','vx','vy','hp','st','ground','atk','dead'].map(k=>p[k]),rng:[seed,count],time:BK.time});
        if([239,479,511].includes(f))pixels.push({f,frame:await hash(BK.view.buf),display:await hash(document.getElementById('c'))});
      }
      return{trace,pixels};
    })()`,300000);
    assert.deepEqual(pg.errors,[]);rows.push({id,name,...result});
  } finally { await pg.close(); }
}
const comparisons = ['wood','spire','canal'].map(id=>{
  const pair=rows.filter(r=>r.id===id);const {name:a,...before}=pair[0],{name:b,...after}=pair[1];
  return{id,frames:512,exact:JSON.stringify(before)===JSON.stringify(after)};
});
writeFileSync(out+'/receipt.json',JSON.stringify({time:new Date().toISOString(),comparisons,complete:comparisons.every(r=>r.exact)},null,2)+'\n');
console.log(JSON.stringify(comparisons));assert(comparisons.every(r=>r.exact),'display flush must preserve every game/RNG sample and exact frame/display pixels');
