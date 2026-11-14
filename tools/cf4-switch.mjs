// PAGE TOOL: launches headless Chrome
// tools/cf4-switch.mjs - proves BOSS_CF4=on|off (boss-run.mjs cf4Js) reaches the page's REAL main.js module: the same snippet fightJs injects, then the module flag is read back
// (a hurt foe) and read back: ON numbers carry popAt/popK (CF4.popNum), OFF numbers do not. Exit 0 = the switch works.
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
const res = {};
try {
  for (const m of ['off', 'on']) {
    res[m] = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1;
      {const CF=await import('/src/cf-hud.js');CF.setCF4(${m === 'on'});}
      const i = LEVELS.findIndex(l => l.id === 'wood'); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.sim(40); BK.P.inv = 99;
      return { ships: (await import('/src/cf-hud.js')).CF4_SHIPS,  }; })()`, 120000);
    console.log(m, JSON.stringify(res[m]));
  }
} finally { await pg.close().catch(() => {}); }
const ok = res.off.ships === false && res.on.ships === true;
console.log(ok ? 'switch reaches the module: CF4_SHIPS follows BOSS_CF4' : 'SWITCH NOT REACHING GAME'); process.exit(ok ? 0 : 1);
