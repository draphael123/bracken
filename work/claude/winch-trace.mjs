// work/claude/winch-trace.mjs [secs] - TRACE BEFORE PILOTING (the old bot needed seven pilots and never converged). One lab row
// of THE WINCHMASTER at normal health, and twice a second: time, hero tile x/y, ground/air/climb, the line he is riding, the
// boss's mode and housing, both drum lines' direction, and both health bars - so where the hands go wrong is READ, not guessed.
// env: H=hero (knight), S=seed (0 = the page's own Math.random), EVERY=frames between lines (30)
// usage: node work/claude/winch-trace.mjs 120
import { openPage } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
try { await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const ev=[];let seed=${+(process.env.S || 0)};if(seed)Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const o=await BK.bossLab({bosses:['oreroad'],heroes:['${process.env.H || 'knight'}'],healthMode:'normal',maxSecs:${+(process.argv[2] || 60)},modes:true,onFrame:({boss,P,f})=>{
      if(f%${+(process.env.EVERY || 30)}===0){const ls=BK.L.cableway.lines,lo=ls.find(l=>l.id==='low'),hi=ls.find(l=>l.id==='high');const on=P.onMover&&P.onMover.kind==='bucket'?ls[P.onMover.line].id:'-';
        ev.push([(f/60).toFixed(1),(P.x/16).toFixed(1),(P.y/16).toFixed(1),P.climb?'c':P.ground?'g':'a',on,boss.mode,'@'+'ABC'[boss.at||0],'lo'+lo.dir+(lo.jam>0?'J':''),'hi'+hi.dir+(hi.jam>0?'J':''),'hp'+(boss.hp|0),'P'+(P.hp|0)].join(' '));}}});
    return {ev,rows:o.rows.map(r=>({h:r.h,secs:r.secs,out:r.outcome||(r.won?'win':r.dead?'death':''),opened:r.opened,hitBy:r.hitBy,modes:r.modes}))};})()`, 900000);
  console.log(JSON.stringify(r.rows)); console.log(r.ev.join('\n'));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
