// work/claude/pyramidboss/dbg.mjs - why does his fight not start (a probe)
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { console.log(await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const out=[];
  BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.state = 'play'; BK.god = true; BK.sim(5);
  const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); for (let i = 0; i < 60; i++) BK.sim(1);
  out.push('P ' + BK.P.x + ',' + BK.P.y + ' ground ' + BK.P.ground + ' trig ' + A.trigger + ' y0 ' + A.y0 + ' floor ' + A.floor + ' boss ' + (BK.boss && BK.boss.t) + ' alive ' + (BK.boss && BK.boss.alive) + ' active ' + BK.bossActive + ' state ' + BK.state + ' dead ' + BK.P.dead);
  return out.join(' | '); })()`, 120000)); } finally { pg.close(); }
