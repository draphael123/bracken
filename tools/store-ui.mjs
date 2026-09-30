/* STORE UI + LIVE ABILITY PREVIEWS (item 17a): the skills store shows the highlighted ability performed by the hero on a
   training post. The preview is pure draw, so cycling it must change nothing but pixels; buying is untouched. */
import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';import{writeFileSync}from'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const{skillsFor,SKILLS}=await import('/src/progression.js'),{xpFloor}=await import('/src/xp.js'),AP=await import('/src/ability-preview.js');BK.manualSimulation=true;
const out={heroes:[],shots:[]};const snap=()=>JSON.stringify({ls:Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])),prog:BKT.PROG,ent:BK.enemies().length});
const box=()=>{const c=BK.view.buf,g=c.getContext('2d');return g.getImageData(207,51,104,76).data;};
const diff=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n;};
// every ability in the game has a named shape (a new one is a plain cast, on purpose visible here)
out.unshaped=SKILLS.filter(s=>s.active&&!AP.SHAPE[s.id]).map(s=>s.id);

for(const h of ['knight','pyro','paladin','pirate','reaper','warden','geomancer']){
 BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(20);BKT.PROG.coins=5000;BK.applyUpgrades();BK.load(0);BK.state='map';
 const acts=skillsFor(h).filter(n=>n.active);BK.ui.storeOpen('map','skills');BK.ui.treeTab=0;BK.step(1);
 const before=snap();let drawn=0,animated=0;const hashes=new Set();
 for(let i=0;i<BKT.treeNodes().length;i++){BK.ui.treeI=i;BK.step(20);const a=box();BK.step(40);const b=box();hashes.add(a.join(',').length+':'+a.reduce((s,v,k)=>s+v*(k%97),0));if(diff(a,b)>0)animated++;drawn++;}
 BK.ui.treeTab=1;BK.step(30);BK.ui.treeTab=0;
 // pad/keyboard: down moves the highlight and the picture follows
 BK.ui.treeI=0;BK.step(1);dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowDown'}));const moved=BK.ui.treeI===1;
 // the store: every tab, every item, all draw
 BK.ui.storeOpen('map','heroes');BK.step(40);let items=0;for(let t=0;t<BK.ui.tabs();t++){BK.ui.storeTab=t;const n=BK.ui.items();for(let i=0;i<Math.max(1,n);i++){BK.ui.storeI=i;BK.step(30);items++;}}
 const after=snap();
 out.heroes.push({h,acts:acts.length,drawn,animated,distinct:hashes.size,moved,items,pure:before===after});
 if(h==='knight'){BK.ui.storeOpen('map','skills');BK.ui.treeI=2;BK.step(90);out.shots.push(BK.view.buf.toDataURL());}
}
{let rand=0;const R=Math.random;Math.random=()=>{rand++;return R()};const cv=document.createElement('canvas');cv.width=146;cv.height=76;const cg=cv.getContext('2d');const fr=document.createElement('canvas');fr.width=16;fr.height=26;for(const s of SKILLS.filter(s=>s.active))for(let t=0;t<4;t+=.1)AP.drawAbilityPreview(cg,0,0,146,76,{id:s.id,hero:s.hero,t,idle:[fr],atk:[fr,fr],icon:null});AP.drawAbilityPreview(cg,0,0,146,76,{id:'nope',hero:'x',t:1,idle:[],atk:[],icon:null});Math.random=R;out.rand=rand;}
// buying still works: an ability from the tree (at the map), a skin from the store
BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(12);BKT.PROG.coins=1000;BK.applyUpgrades();BK.load(0);BK.state='map';dispatchEvent(new KeyboardEvent('keydown',{key:'q'}));BK.sim(1);dispatchEvent(new KeyboardEvent('keyup',{key:'q'}));out.treeOpen=BK.state;BK.ui.treeTab=0;BK.ui.treeI=0;
const n0=BKT.treeNodes()[0],c0=BKT.PROG.coins;BK.press('confirm');BK.sim(1);out.msg=BK.ui.treeMsg;out.boughtSkill=!!BKT.PROG.skillOwned.knight[n0.id]&&BKT.PROG.coins===c0-n0.price;
BK.ui.storeOpen('map','skins');BK.ui.storeI=1;const c1=BKT.PROG.coins;BK.step(2);BK.press('confirm');BK.sim(1);out.boughtSkin=BKT.PROG.coins<c1;
return out;})()`);
assert.deepEqual(r.unshaped,[],'an ability has no preview shape: '+r.unshaped);
assert.equal(r.heroes.length,7);
for(const h of r.heroes){assert.ok(h.drawn>=3,h.h+' drew '+h.drawn);assert.ok(h.animated>=h.drawn*0.5,h.h+' preview does not move: '+h.animated+'/'+h.drawn);assert.ok(h.distinct>=Math.min(h.drawn,3),h.h+' previews all look alike');assert.ok(h.moved,h.h+' down did not move the highlight');assert.ok(h.pure,h.h+' the store / previews changed the save or the game');assert.ok(h.items>=8);}
assert.equal(r.rand,0,'the preview must not use randomness');
assert.ok(r.boughtSkill,'buying an ability from the tree broke: '+r.treeOpen+' '+r.msg);assert.ok(r.boughtSkin,'buying from the store broke');
assert.deepEqual(pg.errors,[]);
if(process.env.STORE_SCREEN)writeFileSync(process.env.STORE_SCREEN,Buffer.from(r.shots[0].split(',')[1],'base64'));
console.log(JSON.stringify(r.heroes));
}finally{pg.close();}
