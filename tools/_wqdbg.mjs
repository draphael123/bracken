import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(`(async()=>{BK.manualSimulation=true; const tr=[];
  const o=await BK.bossLab({bosses:['fair'],heroes:['knight'],healthMode:'normal',maxSecs:60,modes:true,salt:1,onFrame:({boss,P,f})=>{ if(f>1700&&f<1800&&f%3===0) tr.push([f, Math.round(boss.x), Math.round(P.x), boss.mode, P.face, P.atk, JSON.stringify(BK.keys), BK.enemies().filter(e=>e.alive&&e.t==="mummer").map(e=>[Math.round(e.x),e.mode,e.hp])]); }});
  return {tr, mid: BK.L.green.bonfire*16+8, A:[BK.L.arena.x0,BK.L.arena.x1]};})()`, 900000);
  console.log('mid', r.mid, r.A); for (const t of r.tr) console.log(JSON.stringify(t)); } finally { pg.close(); }
