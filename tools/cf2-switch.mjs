// tools/cf2-switch.mjs - proves BOSS_CF2=on|off (boss-run.mjs) reaches the page's REAL main.js module: the same snippet fightJs injects, then a short hop's airtime.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
const res = {};
try {
  for (const m of ['off', 'on']) {
    res[m] = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
      {const CF=await import('/src/cf-platform.js');CF.setCF2(${m === 'on'});}
      const i = LEVELS.findIndex(l => l.id === 'wood'); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.sim(40); for (const k in BK.keys) BK.keys[k] = false; BK.P.inv = 99;
      const P = BK.P; const out = [];
      for (const hold of [1, 3, 6]) { for (let i = 0; i < 90 && !P.ground; i++) BK.sim(1); BK.sim(20); const y0 = P.y; BK.press('jump'); BK.keys.jump = true; let air = 0, peak = 0; for (let f = 0; f < 120; f++) { if (f >= hold) BK.keys.jump = false; BK.sim(1); air++; peak = Math.max(peak, y0 - P.y); if (P.ground && f > 2) break; } BK.keys.jump = false; out.push([hold, air, +peak.toFixed(2)]); }
      return { ships: (await import('/src/cf-platform.js')).CF2_SHIPS, hops: out }; })()`, 120000);
    console.log(m, JSON.stringify(res[m]));
  }
} finally { await pg.close().catch(() => {}); }
const same = JSON.stringify(res.off.hops) === JSON.stringify(res.on.hops);
console.log(same ? 'SWITCH NOT REACHING GAME (hops identical)' : 'switch reaches game: hops differ OFF vs ON'); process.exit(same || res.off.ships || !res.on.ships ? 1 : 0);
