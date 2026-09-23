import {openPage} from '../../bracken/tools/cdp.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
const lv=process.argv[2],n=+(process.argv[3]||10),dir=new URL('./tour/'+lv+'/',import.meta.url);mkdirSync(dir,{recursive:true});
const pg=await openPage({port:+(process.env.PORT||5994),audio:false});
async function page(lv,n){const lvm=await import('./src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(lvm.LEVELS.findIndex(l=>l.id===lv));BK.start();BK.god=true;BK.step(320);
 const L=BK.L,T=lvm.T,W=L.W,H=L.H,shots=[];const st=L.START.x,end=L.arena?Math.round(L.arena.x0/16):W-4,dirn=end>st?1:-1;
 for(let i=0;i<n;i++){const tx=Math.round(st+(end-st)*i/(n-1));let ty=-1;
  // lowest standable spot near the hero path: search from START.y band
  for(let y=4;y<H-1;y++){if(L.grid[y*W+tx]===T.AIR&&L.grid[(y-1)*W+tx]===T.AIR&&(L.grid[(y+1)*W+tx]===T.SOLID||L.grid[(y+1)*W+tx]===T.ONEWAY||L.grid[(y+1)*W+tx]===T.PLANK)){ty=y;if(Math.abs(y-L.START.y)<14)break;}}
  if(ty<0)continue;BK.tp(tx,ty);BK.P.face=dirn;BK.step(50);const c=document.querySelector('canvas');shots.push({tx,ty,url:c.toDataURL('image/png')});}
 return shots;}
try{const shots=await pg.evalp(`(${page})(${JSON.stringify(lv)},${n})`,600000);for(const [i,s] of shots.entries())writeFileSync(new URL(String(i).padStart(2,'0')+'-x'+s.tx+'.png',dir),Buffer.from(s.url.split(',')[1],'base64'));console.log(lv,shots.length,'shots',pg.errors.slice(0,3));}finally{pg.close();}
