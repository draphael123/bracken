// work/claude/winch-seen.mjs [secs] - IS HE ON THE SCREEN WHEN HE TELLS? One lab row of the Winchmaster (knight, normal health) with
// the game's own camera read every frame (BK.cam). For each told attack, the share of its wind-up frames in which his body was
// inside the 320x180 view, and where the hero was when he was not. The Node renders cannot answer this: they frame by hand.
// usage: node work/claude/winch-seen.mjs 240
import { openPage } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
try { await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=3100;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const seen={},miss=[];
    await BK.bossLab({bosses:['oreroad'],heroes:['${process.env.H || 'knight'}'],healthMode:'normal',maxSecs:${+(process.argv[2] || 240)},onFrame:({boss,P})=>{
      if(!/Tell$/.test(boss.mode))return;const [cx,cy]=BK.cam,inV=boss.x+12>cx&&boss.x-12<cx+320&&boss.y>cy&&boss.y-36<cy+180;
      const s=seen[boss.mode]||(seen[boss.mode]={frames:0,inView:0});s.frames++;if(inV)s.inView++;else if(miss.length<12&&Math.random()<0.05)miss.push([boss.mode,'ABC'[boss.at],Math.round(P.x/16),Math.round(P.y/16),Math.round((boss.x-cx)),Math.round(boss.y-cy)]);}});
    return {seen,miss};})()`, 900000);
  for (const [m, s] of Object.entries(r.seen)) console.log(m.padEnd(12), (100 * s.inView / s.frames).toFixed(0) + '% of', s.frames, 'wind-up frames on screen');
  console.log('off screen, sampled: [mode, housing, hero tile x, y, his x and y in the view]'); for (const q of r.miss) console.log('  ', JSON.stringify(q));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
