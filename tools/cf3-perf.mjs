// PAGE TOOL: launches headless Chrome
// tools/cf3-perf.mjs - CF3 frame cost + console check (claude/cf3proof): 8 foes mid-flash in one room, ms per step with the flag ON vs OFF, and any page error.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{const CF=await import('/src/cf-foe.js');const errs=[];window.addEventListener('error',e=>errs.push(String(e.message)));const oe=console.error;console.error=(...a)=>{errs.push(a.join(' '));oe(...a)};
    BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
    BK.tp(10,21);BK.sim(60);BK.P.hp=BK.P.maxHp=9999;BK.P.inv=99999;
    for(let i=0;i<8;i++)BK.spawnEnt({t:['sprig','soldier','brute','wolf'][i%4],x:(BK.P.x+30+i*14)/16,y:21});const es=BK.enemies().filter(e=>e.alive);es.forEach(e=>e.hp=e.hp0=9999);
    const run=on=>{CF.setCF3(on);const t0=performance.now();for(let k=0;k<20;k++){es.forEach(e=>BKT.hurtEnemy(e,3,e.x-10,false));BK.step(6);}return (performance.now()-t0)/120;};
    run(true);run(false);const a=[],b=[];for(let k=0;k<3;k++){a.push(run(false));b.push(run(true));}
    return {n:es.length,offMs:a.map(x=>+x.toFixed(2)),onMs:b.map(x=>+x.toFixed(2)),errs};})()`, 100000);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
