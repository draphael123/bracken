import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';import{writeFileSync}from'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const{skillsFor}=await import('/src/progression.js'),{xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;const rows=[],shots=[];
for(const h of ['knight','pyro','paladin','pirate','reaper','warden','geomancer']){
 BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(16);const ns=skillsFor(h),a=ns.find(n=>n.active),p=ns.find(n=>!n.active);BKT.PROG.skillOwned[h]={[a.id]:true,[p.id]:true};BKT.PROG.loadouts[h]=[p.id,a.id];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.sim(180);window.__textRec=[];BK.step(0);const hud=window.__textRec.filter(r=>r.kind==='text');window.__textRec=null;
 if(hud.some(r=>/^Q  /.test(r.s)))throw Error('Q badge remains');if(hud.some(r=>r.s==='F'&&r.y0>=25&&r.y0<=30&&r.x0>74&&r.x0<88))throw Error('passive HUD key');if(!hud.some(r=>r.s==='G'&&r.y0>=25&&r.y0<=30))throw Error('active HUD key missing');
 if(h==='knight')shots.push({name:'hud',png:BK.view.buf.toDataURL()});
 BK.state='map';dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));BK.ui.treeTab=0;const active=BKT.treeNodes();if(!active.every(n=>n.active))throw Error('active category');BK.press('right');BK.sim(1);const passive=BKT.treeNodes();if(!passive.every(n=>!n.active)||passive.length+active.length!==ns.length)throw Error('passive category');
 BK.ui.treeI=passive.length-1;BK.step(120);BK.step(1);if(h==='knight')shots.push({name:'passives',png:BK.view.buf.toDataURL()});BK.press('left');BK.sim(1);if(BK.ui.treeTab!==0||BK.ui.treeI!==0)throw Error('tab selection reset');BK.step(120);BK.step(1);if(h==='knight')shots.push({name:'actives',png:BK.view.buf.toDataURL()});
 rows.push({hero:h,actives:active.length,passives:passive.length,activeKey:'G',passiveHudHidden:true,qBadgeHidden:true});
}return{rows,shots};})()`);assert.equal(r.rows.length,7);assert.deepEqual(pg.errors,[]);if(process.env.SKILL_SCREEN)for(const s of r.shots)writeFileSync(process.env.SKILL_SCREEN+'-'+s.name+'.png',Buffer.from(s.png.split(',')[1],'base64'));console.log(JSON.stringify({rows:r.rows}));
}finally{pg.close();}
