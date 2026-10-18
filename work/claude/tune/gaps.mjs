import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='flotilla');BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.sim(5);
 return BK.movers().filter(q=>q.flot).map(q=>({id:q.bench||('yard'+Math.round(q.x0/16)),x0:Math.round(q.x0??q.x),w:q.w,y0:Math.round(q.y0??q.y),rise:q.rise,dx:q.dx,rx:q.range||q.swing||q.ax||null})).sort((a,b)=>a.x0-b.x0);})()`, 600000); for (const r of R) console.log(JSON.stringify(r)); } finally { pg.close(); }
