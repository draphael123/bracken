// probe: run the boss lab on the canal with the human profile at its campaign level and print per fight what hit the hero and the show's counters
import { openRetry, fightJs } from '../../../tools/boss-run.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 2), secs = +opt('secs', 240);
const pg = await openRetry();
try { for (const h of heroes) for (let s = 1; s <= seeds; s++) {
  const { lvl, js } = fightJs({ r: 'canal', way: 'practiced', h, s, profile: 'human' }, secs);
  const js2 = js.replace("profile:", "modes:true,profile:").replace('return {maxHp', 'const LS=BK.lanternEaterHands().show();return {n:LS&&LS.n,hurt:LS&&LS.hurt,modes:r.modes,hitBy:r.hitBy,maxHp');
  await pg.reload(); const r = await pg.evalp(js2, 1200000);
  console.log(h, 's' + s, 'L' + lvl, r.outcome, r.secs + 's', 'left ' + r.bossLeft + '%', 'taken ' + r.taken + '/' + r.maxHp, 'hurt ' + JSON.stringify(r.hurt), 'hitBy ' + JSON.stringify(r.hitBy));
  console.log('   n ' + JSON.stringify(r.n));
} } finally { pg.close(); }
