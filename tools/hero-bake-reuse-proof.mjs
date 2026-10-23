// Compare live-art reuse with the unchanged fresh baker, for every pose and supported input axis.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {openPage} from './cdp.mjs';
import {pauseGameAtBoot} from './manual-lab-boot.mjs';
const heroes=(process.argv[2]||'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger').split(',');
const pg=await openPage({audio:false,fonts:false,seed:1008}),rows=[];
mkdirSync('gate-data/hero-reuse',{recursive:true});
try{
 await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')()'});await pg.reload();
 const cases=await pg.evalp(`(()=>{const rows=[];for(const h of ${JSON.stringify(heroes)}){for(const s of BK.SKINS)rows.push([h,s.id,'steel',1]);for(const w of BK.SWORDS)if(w.id!=='steel')rows.push([h,'bracken',w.id,1]);for(const lv of [10,20,30,50])rows.push([h,'bracken','steel',lv]);}return rows;})()`);
 await pg.evalp(`(()=>{window.__heroCanvasAllocations=0;const original=Document.prototype.createElement;Document.prototype.createElement=function(name,...args){const c=original.call(this,name,...args);if(String(name).toLowerCase()==='canvas')__heroCanvasAllocations++;return c;};})()`);
 for(const input of cases){
  const row=await pg.evalp(`(async()=>{
   const [h,skin,sword,lv]=${JSON.stringify(input)};BK.PROG.skin=skin;BK.PROG.sword=sword;BKT.setHeroLevel(h,lv);
   const R=Math.random;let rng=0;Math.random=()=>{rng++;return R();};
   const t=performance.now(),reference=BKT.heroSet(skin,sword,false,h,BKT.gearNow(h)),freshMs=performance.now()-t;
   BK.setHero(h);const first=BK.heroSet,st=JSON.stringify([BK.P.hp,BK.P.maxHp,BK.P.maxSt,BK.PROG.hero,BK.PROG.charm]),alloc=__heroCanvasAllocations,start=performance.now();
   BK.setHero(h);const warmMs=performance.now()-start,warmAllocations=__heroCanvasAllocations-alloc,warm=BK.heroSet,statsEqual=st===JSON.stringify([BK.P.hp,BK.P.maxHp,BK.P.maxSt,BK.PROG.hero,BK.PROG.charm]);Math.random=R;
   const snap=async set=>{const pieces=[],shape=[];let total=0;const walk=(o,path)=>{if(!o||typeof o!=='object')return;if(o instanceof HTMLCanvasElement){const d=o.getContext('2d').getImageData(0,0,o.width,o.height).data;pieces.push(d);total+=d.length;shape.push([path,o.width,o.height,o.feet??null,o.wp??null]);return;}if(ArrayBuffer.isView(o))return;for(const k of Object.keys(o).sort())if(!k.startsWith('_'))walk(o[k],path+'.'+k);};walk(set,'');const bytes=new Uint8Array(total);let n=0;for(const p of pieces){bytes.set(p,n);n+=p.length;}return{shape,sha256:[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join(''),gearT:set.gearT,bytes:total};};
   const a=await snap(reference),b=await snap(warm);return{input:[h,skin,sword,lv],sameArt:JSON.stringify(a)===JSON.stringify(b),sameObject:first===warm,warmAllocations,statsEqual,rng,frames:b.shape.length,bytes:b.bytes,sha256:b.sha256,freshMs,warmMs};
  })()`,120000);
  rows.push(row);writeFileSync('gate-data/hero-reuse/receipt.json',JSON.stringify({time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),complete:rows.length===cases.length,rows},null,2)+'\n');
  assert(row.sameArt,'RGBA bytes or pose geometry changed: '+input);assert(row.sameObject,'unchanged live art rebuilt: '+input);assert.equal(row.warmAllocations,0,'unchanged selection allocated canvases');assert(row.statsEqual,'non-art setHero effects changed');assert.equal(row.rng,0,'hero baking must not change the random stream');
  await pg.send('HeapProfiler.collectGarbage'); // The fresh reference and readback arrays are retired; retain only live game art.
 }
 assert.deepEqual(pg.errors,[]);console.log(JSON.stringify({heroes,cases:rows.length,poses:rows.reduce((n,r)=>n+r.frames,0),complete:true}));
}finally{await pg.close();}
