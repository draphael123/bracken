import { openPage } from '../../bracken/tools/cdp.mjs';
const pg = await openPage({ port: 5995, audio: false, fonts: false });
try { await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const ev=[];let seed=${+(process.env.S||0)};if(seed)Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const o=await BK.bossLab({bosses:['oreroad'],heroes:['${process.env.H||'knight'}'],healthMode:'normal',maxSecs:${+(process.argv[2]||40)},modes:true,onFrame:({boss,P,f})=>{
      if(f%60===0){const dl=BK.L.cableway&&BK.L.cableway.lines.find(l=>l.drum);ev.push([f/60|0,Math.round(P.x/16*10)/10,Math.round(P.y/16*10)/10,P.ground?'g':'a',P.onMover?P.onMover.kind:'-',boss.mode,Math.round(boss.x/16),Math.round(boss.y/16),dl?dl.dir:'?',dl?Math.round(dl.t):'?',boss.hp|0,P.hp|0,P.atk>0?'A':'-',boss.revCd|0].join(' '));}}});
    return {ev,rows:o.rows.map(r=>[r.h,r.secs,r.outcome])};})()`, 900000);
  console.log(JSON.stringify(r.rows)); console.log(r.ev.join('\n'));
} finally { pg.close(); }
