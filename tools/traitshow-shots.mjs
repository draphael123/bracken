// PAGE TOOL: launches headless Chrome
/* (claude/traitshow) stills of the ACTIVES tab's TRAITS strip: node tools/traitshow-shots.mjs <outdir>; asserts the strip is drawn */
import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';import{writeFileSync,mkdirSync}from'node:fs';
const out=process.argv[2]||'.';mkdirSync(out,{recursive:true});
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const{xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;const shots=[],rec=[];
for(const [h,lv,name] of [['knight',12,'knight-l12'],['knight',22,'knight-l22'],['geomancer',22,'geomancer-l22'],['pyro',5,'pyro-l5']]){
 BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(lv);BK.applyUpgrades();BK.state="map";
 dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));BK.ui.treeTab=0;window.__textRec=[];BK.step(120);BK.step(1);
 const t=window.__textRec.filter(q=>q.kind==='text').map(q=>q.s);rec.push({h,lv,t});
 shots.push({name,png:(()=>{const b=BK.view.buf,c=document.createElement('canvas');c.width=b.width*3;c.height=b.height*3;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(b,0,0,c.width,c.height);return c.toDataURL();})()});}
return{shots,rec};})()`);
assert.deepEqual(pg.errors,[]);
for(const s of r.shots)writeFileSync(out+'/'+s.name+'.png',Buffer.from(s.png.split(',')[1],'base64'));
console.log(JSON.stringify(r.rec));
}finally{pg.close();}
