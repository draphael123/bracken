import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {openPage} from './cdp.mjs';
const pg=await openPage({noWait:true,audio:false,fonts:false});
const transforms=[[1,0,0,1,0,0],[1,0,0,1,-517,-293],[1,0,0,1,-517.4,-293.6],[.65,0,0,.65,-210,-120],[1.5,0,0,1.5,-900,-600],[.93,.31,-.31,.93,-240,-120],[1,.25,.4,1,-600,-300],[-1,0,0,1,710,-250],[.05,0,0,.05,-20,-10],[0,0,0,0,10,10]];
const rows=[];let mutantFailures=0;
try {
  await pg.send('Page.navigate',{url:'http://localhost:'+pg.PORT+'/tools/fixtures/canvas-only.html'});
  for(let i=0;i<100;i++){if(await pg.evalp("location.pathname.endsWith('/canvas-only.html')&&document.readyState==='complete'"))break;await new Promise(r=>setTimeout(r,20));if(i===99)throw Error('fixture did not load');}
  await pg.evalp(`import('/src/visible-room-masonry.js').then(m=>window.__masonry=m.drawVisibleRoomMasonry)`);
  const compare=async(matrix,mutant=false)=>pg.evalp(`(()=>{
    const reference=(g,sx,sy,w,h)=>{g.fillStyle='#16262a';g.fillRect(sx,sy,w,h);for(let yy=sy;yy<sy+h;yy+=8){for(let xx=sx+(((yy/8)&1)?12:0);xx<sx+w;xx+=24){g.fillStyle='#1e343a';g.fillRect(xx,yy,22,7);g.fillStyle='#152a2e';g.fillRect(xx,yy+6,22,1);}g.fillStyle='#0e1c1e';g.fillRect(sx,yy+7,w,1);}};
    const candidate=${mutant?"new Function('return ('+__masonry.toString().replace('((yy / 8) & 1)','0')+')')()":"__masonry"};
    const rows=[];for(const [sx,sy]of[[0,0],[-19,-11],[.3,.7]])for(const [w,h]of[[47,31],[700,600],[2400,1600]])for(const alpha of[1,.4]){
      const draw=fn=>{const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d',{willReadFrequently:true});g.fillStyle='rgba(171,67,103,.3)';g.fillRect(0,0,320,180);let calls=0;const fill=g.fillRect;g.fillRect=function(...a){calls++;return fill.apply(this,a);};g.setTransform(...${JSON.stringify(matrix)});g.globalAlpha=alpha;g.beginPath();g.rect(sx,sy,w,h);g.clip();fn(g,sx,sy,w,h);return{pixels:g.getImageData(0,0,320,180).data,calls,style:g.fillStyle};};
      const a=draw(reference),b=draw(candidate);let differences=0;for(let i=0;i<a.pixels.length;i++)if(a.pixels[i]!==b.pixels[i])differences++;
      rows.push({sx,sy,w,h,alpha,differences,beforeCalls:a.calls,afterCalls:b.calls,styleEqual:a.style===b.style});
    }return rows;})()`,180000);
  for(const matrix of transforms){const r=await compare(matrix);rows.push(...r.map(x=>({matrix,...x})));console.log(JSON.stringify({matrix,cases:r.length,differences:r.reduce((n,x)=>n+x.differences,0)}));await pg.send('HeapProfiler.collectGarbage');}
  const negative=await compare(transforms[1],true);mutantFailures=negative.filter(x=>x.differences>0).length;
  assert.deepEqual(pg.errors,[]);
} finally {await pg.close();}
const receipt={time:new Date().toISOString(),cases:rows.length,failed:rows.filter(x=>x.differences||!x.styleEqual),mutantFailures,rows};
mkdirSync('gate-data',{recursive:true});writeFileSync('gate-data/visible-room-masonry-proof.json',JSON.stringify(receipt,null,2)+'\n');
assert.equal(receipt.failed.length,0,'every RGBA byte and final fill style must match');assert(mutantFailures>0,'the pixel oracle must reject incorrect course alignment');
assert(rows.some(r=>r.afterCalls<r.beforeCalls/4),'the large translated room must omit substantial off-canvas work');
console.log(JSON.stringify({cases:receipt.cases,failed:0,mutantFailures}));
