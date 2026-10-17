import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='flotilla');BK.setHero('pyro');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);for(const e of BK.enemies())e.alive=false;const P=BK.P;const out=[];
 for(const c of [204,205,206,207,208]){BK.tp(c,23);BK.sim(40);out.push([c,Math.round(P.x),Math.round(P.y),P.ground?1:0,P.climb?1:0,BK.L.grid[24*BK.L.W+c],BK.L.grid[23*BK.L.W+c]]);}
 return out;})()`, 600000); console.log(JSON.stringify(R)); } finally { pg.close(); }
