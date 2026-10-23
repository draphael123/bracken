// Compare the actual masonry painter and its compositing fallback with the previous source.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {openPage} from './cdp.mjs';
import assert from 'node:assert/strict';
const old=execFileSync('git',['show','c8dc7c18:src/main.js'],{encoding:'utf8',maxBuffer:16<<20}),now=readFileSync('src/main.js','utf8');
const start=old.indexOf("  if (st === 'drowned') {"),end=old.indexOf("    g.fillStyle = '#24402c';",start);
const reference=old.slice(start,end).replace("  if (st === 'drowned') {",''),helpers=now.slice(now.indexOf('let drownedWallTile'),now.indexOf('let HALLWALL'));
assert(helpers.includes('function paintDrownedMasonry'));
const code=process.argv.includes('--no-transform-guard')?helpers.replace(/  if \(matrix\.a[^\n]+\n/,''):helpers;
const pg=await openPage({audio:false,fonts:false});let result;
try{result=await pg.evalp(`(async()=>{BK.manualSimulation=true;const {canvas}=await import('/src/px.js');let g;${code}
 const rows=[];for(const w of [1,11,12,13,23,24,47,48,49,1600])for(const h of [1,6,7,8,9,15,16,17,160])for(const alpha of [1,.5])for(const transform of ['identity','fractional','zoom']){
  const [a,x]=canvas(w,h),[b,y]=canvas(w,h);for(const c of [x,y]){c.fillStyle='#a14b9d';c.fillRect(0,0,w,h);c.globalAlpha=alpha;if(transform==='fractional')c.translate(.25,.5);if(transform==='zoom')c.scale(1.03,1.03);}
  const sx=0,sy=0;g=x;${reference}g=y;if(!paintDrownedMasonry(sx,sy,w,h)){${reference}}
  const p=x.getImageData(0,0,w,h).data,q=y.getImageData(0,0,w,h).data;let diff=0;for(let i=0;i<p.length;i++)if(p[i]!==q[i])diff++;rows.push({w,h,alpha,transform,differingBytes:diff});a.width=b.width=0;
 }return{rows,tile:[drownedWallTile.width,drownedWallTile.height],bytes:drownedWallTile.width*drownedWallTile.height*4};})()`,120000);
}finally{await pg.close();}
mkdirSync('gate-data',{recursive:true});writeFileSync('gate-data/drowned-masonry-proof.json',JSON.stringify({time:new Date().toISOString(),...result},null,2)+'\n');
assert(result.rows.every(r=>r.differingBytes===0),'masonry and fallback must preserve every pixel');assert.equal(result.bytes,3072);console.log('PASS '+result.rows.length+' room-edge/compositing comparisons; exact pixels, fixed 3072-byte tile');
