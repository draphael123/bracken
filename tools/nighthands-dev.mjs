/* tools/nighthands-dev.mjs - ONE boss-bot fight on a night-road boss with the lab's samples printed (claude/nighthands; a dev tool, not a check).
   BRACKEN_ROAD=ww,sk,mn,ac PORT=8644 node --import ./tools/road-on.mjs tools/nighthands-dev.mjs <level> <hero> <seed> [secs] [every]  */
import { openRetry, fightJs, diffJs } from './boss-run.mjs';
const [r, h, s, secs = '120', every = '1'] = process.argv.slice(2);
const F = { r, way: 'built', h, s: +s, profile: 'human', flasks: 'kit' };
const { js } = fightJs(F, +secs);
const pg = await openRetry();
try {
  await pg.evalp(diffJs());
  const res = await pg.evalp(js.replace("healthMode:'normal'", "healthMode:'normal',samples:true,modes:true" + (process.env.NH_HP ? ',nhHp:' + process.env.NH_HP : '')), 1200000);
  const smp = await pg.evalp('(window.__bossLab&&window.__bossLab.samples)||[]');
  const st = n => smp.filter((_, i) => i % +every === 0).slice(-n);
  console.log(JSON.stringify({ outcome: res.outcome, secs: res.secs, bossLeft: res.bossLeft, taken: res.taken, opened: res.opened, swings: res.swings, modes: res.modes, hitBy: res.hitBy, drank: res.drank }));
  if (process.env.SAMPLES) console.log(st(+process.env.SAMPLES).join('\n'));
} finally { await pg.close(); }
process.exit(0);
