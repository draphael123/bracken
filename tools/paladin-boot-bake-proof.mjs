import {openPage} from './cdp.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync('src/main.js','utf8');
const start=source.indexOf('function palHeroSet(K)'),end=source.indexOf('h: 24 }; }',start)+'h: 24 }; }'.length;
if(start<0||end<start)throw Error('Paladin builder boundaries changed');
const builder=source.slice(start,end);
const pg=await openPage({audio:false,fonts:false,seed:1008}),rows=[];
try{
 await pg.evalp('BK.manualSimulation=true');
 for(let round=0;round<5;round++)for(const variant of ['before','shared','return']){
  const row=await pg.evalp(`(async()=>{
   const {bakePaladin}=await import('/src/chars.js'),PBG=await import('/src/paladin-boss.js'),PBA=await import('/src/redraw/paladin_boss_art.js');
   const {whiten,flipX,bakeScope,bakeScopeEnd}=await import('/src/px.js');${builder}
   const snap=async sets=>{const shape=[],parts=[];let size=0;const visit=(o,p)=>{if(!o||typeof o!=='object')return;if(o instanceof HTMLCanvasElement){const d=o.getContext('2d').getImageData(0,0,o.width,o.height).data;parts.push(d);size+=d.length;shape.push([p,o.width,o.height]);return;}for(const k of Object.keys(o).sort())visit(o[k],p+'.'+k);};visit(sets,'');const data=new Uint8Array(size);let n=0;for(const d of parts){data.set(d,n);n+=d.length;}return{shape,hash:[...new Uint8Array(await crypto.subtle.digest('SHA-256',data))].map(n=>n.toString(16).padStart(2,'0')).join(''),size};};
   const R=Math.random;let rng=0;Math.random=()=>{rng++;return R();};let owned;
   bakeScope();const start=performance.now();
   try{
    const first=bakePaladin({}),boss=palHeroSet(first),K0=${JSON.stringify(variant)}==='shared'?first:bakePaladin({}),cf=PBA.cardFrames(Array.isArray(K0.R.idle)?K0.R.idle[0]:K0.R.idle,K0.ax,K0.ay);
    const card={R:cf.R,L:cf.R.map(flipX),white:{R:cf.R.map(c=>whiten(c)),L:cf.R.map(c=>flipX(whiten(c)))},ax:cf.ax,ay:cf.ay,w:12,h:24};
    const ms=performance.now()-start;owned=bakeScopeEnd();Math.random=R;
    const pixels=await snap({boss,card}),production=await snap({boss:BK.SPR.paladinboss,card:BK.SPR.paladinbossCard});return{variant:${JSON.stringify(variant)},ms,rng,canvases:owned.length,pixels,productionSame:JSON.stringify(pixels)===JSON.stringify(production),anchors:[boss.ax,boss.ay,boss.w,boss.h,card.ax,card.ay,card.w,card.h],productionAnchors:[BK.SPR.paladinboss.ax,BK.SPR.paladinboss.ay,BK.SPR.paladinboss.w,BK.SPR.paladinboss.h,BK.SPR.paladinbossCard.ax,BK.SPR.paladinbossCard.ay,BK.SPR.paladinbossCard.w,BK.SPR.paladinbossCard.h]};
   }finally{Math.random=R;owned??=bakeScopeEnd();for(const c of owned){c.width=0;c.height=0;}}
  })()`,120000);
  rows.push({...row,round});assert.equal(row.rng,0);assert.deepEqual(row.pixels,rows[0].pixels);assert(row.productionSame);assert.deepEqual(row.anchors,row.productionAnchors);
  await pg.send('HeapProfiler.collectGarbage');
 }
 assert.deepEqual(pg.errors,[]);
 const receipt={time:new Date().toISOString(),complete:true,exactRGBAAndGeometry:true,rows};
 mkdirSync('gate-data/paladin-boot',{recursive:true});writeFileSync('gate-data/paladin-boot/receipt.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({complete:true,frames:rows[0].pixels.shape.length,rows:rows.map(({pixels,...r})=>r)}));
}finally{await pg.close();}
