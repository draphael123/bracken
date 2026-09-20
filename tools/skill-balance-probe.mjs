import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';import{writeFileSync}from'node:fs';
const pg=await openPage({audio:false,fonts:false});try{
const r=await pg.evalp(`(async()=>{const {SKILLS}=await import('/src/progression.js'),{xpFloor}=await import('/src/xp.js');BK.manualSimulation=true;BK.SET.speed=1;const rows=[];
for(const n of SKILLS.filter(n=>n.active)){
 BK.setHero(n.hero);BK.reset({fresh:true});BKT.PROG.xp[n.hero]=xpFloor(16);BKT.PROG.skillOwned[n.hero]={[n.id]:true};BKT.PROG.loadouts[n.hero]=[null,n.id];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
 const L=BK.L;for(let x=2;x<35;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(3);BK.P.hp=BK.P.maxHp/2;BK.P.st=BK.P.maxSt;BK.P.heat=60;BK.P.face=1;
 const foes=[];for(const dx of [30,65,100]){BK.spawnEnt({t:'sprig',x:(BK.P.x+dx-8)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=10000;e.stagger=999;foes.push(e);}
 const st=BK.P.st,hp=BK.P.hp;BK.press('skill2');BK.sim(1);const cast=BK.P.cds?.[n.id]||0,cost=st-BK.P.st;
 for(let f=0;f<360;f++){foes.forEach(e=>{e.stagger=999;});BK.sim(1);}
 rows.push({hero:n.hero,id:n.id,cast:cast>0||n.id==='shieldThrow'&&cost>0,cooldown:+cast.toFixed(2),stamina:+cost.toFixed(2),damage:foes.reduce((a,e)=>a+10000-e.hp,0),healing:+(BK.P.hp-hp).toFixed(2)});
}return rows})()`);assert.equal(r.length,34);assert(r.every(n=>n.cast),'every active must execute in a valid setup');assert(r.every(n=>Number.isFinite(n.damage)&&Number.isFinite(n.stamina)),'finite combat results');assert.deepEqual(pg.errors,[]);if(process.env.SKILL_BALANCE_OUT)writeFileSync(process.env.SKILL_BALANCE_OUT,JSON.stringify(r,null,2));console.log(JSON.stringify(r));
}finally{pg.close();}
