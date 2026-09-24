import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';import{writeFileSync}from'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const {SKILLS}=await import('/src/progression.js'),{xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;BK.SET.speed=1;const rows=[],catalog=[];
const prep=(h,ids)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BKT.PROG.xp[h]=xpFloor(24);/* every passive is on at 24: they arrive one a level up to it */BKT.PROG.skillOwned[h]=Object.fromEntries(ids.map(id=>[id,true]));BKT.PROG.loadouts[h]=ids;BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');BK.tp(3,21);BK.sim(3);BK.P.hp=BK.P.maxHp/2;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.hurt=0;};
for(const h of ['knight','pyro','paladin','pirate','reaper','warden','geomancer']){
 prep(h,[]);for(const n of SKILLS.filter(n=>n.hero===h&&!n.active)){/* PASSIVES COME WITH LEVELS (hero-kits 1b): on at level 24 with nothing owned or slotted, never in a slot, and off when its level is out of reach */if(BKT.tal(n.id)!==1)throw Error('passive not on at its level '+n.id);BKT.PROG.loadouts[h]=[n.id];if(BKT.skillAt(0)!==null)throw Error('passive in a slot '+n.id);BKT.PROG.loadouts[h]=[];const lv=n.level;n.level=99;const off=BKT.tal(n.id);n.level=lv;if(off!==0)throw Error('passive on above its level '+n.id);catalog.push(h+'/'+n.id);}
}
for(const [h,id]of[['knight','flurry'],['pyro','heatShield'],['paladin','sanctuary'],['pirate','shareOut'],['reaper','gleaner'],['warden','keenPoint'],['geomancer','geoRumble']]){const values=[];const node=SKILLS.find(n=>n.hero===h&&n.id===id),lv0=node.level;for(const enabled of [false,true]){
 /* OFF is the passive's level moved out of reach (it is on at 24 by its level alone now); ON is its own level */node.level=enabled?lv0:99;prep(h,[]);let value;
 if(h==='knight'){const st=BK.P.st;BK.press('atk');BK.sim(1);value=st-BK.P.st;}
 if(h==='pyro'){BK.P.heat=60;const hp=BK.P.hp;BKT.damagePlayer(BK.P.x-30,40,{unblockable:true});value=hp-BK.P.hp;}
 if(h==='paladin'){const hp=BK.P.hp;BK.keys.block=true;BK.sim(60);BK.keys.block=false;value=BK.P.hp-hp;}
 if(h==='pirate'){const hp=BK.P.hp;BKT.acorns().push({x:BK.P.x,y:BK.P.y-6,got:false,ph:0});BK.sim(3);value=BK.P.hp-hp;}
 if(h==='reaper'){BKT.PROG.skillOwned[h].summonSkeleton=true;BKT.PROG.loadouts[h]=[null,'summonSkeleton'];BK.press('skill2');BK.sim(1);value=BK.P.cds.summonSkeleton;}
 if(h==='geomancer'){BK.P.tremor=0;BK.geo().gainTremor(10);value=BK.P.tremor;}   /* RUMBLE: the same ten of TREMOR is fifteen */
 if(h==='warden'){const e={x:BK.P.x+35,y:BK.P.y,w:8,h:14,alive:true,t:'sprig'};value=BKT.tipPay(e);}
 values.push(+value.toFixed(3));}node.level=lv0;
 rows.push({hero:h,id,baseline:values[0],equipped:values[1]});}
prep('reaper',['deathGrip']);const st=BK.P.st;BK.press('throw');BK.sim(1);if(BK.P.st!==st||BK.P.cds?.deathGrip)throw Error('empty grip spent resource');
return {catalog,rows,emptyGripFree:true};})()`);
assert.equal(r.catalog.length,144);   /* 134, and THE GEOMANCER's ten (2026-09-24) */for(const r0 of r.rows)assert.notEqual(r0.baseline,r0.equipped,r0.id);assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(r));
}finally{pg.close();}
