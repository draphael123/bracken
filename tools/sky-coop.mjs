/* tools/sky-coop.mjs (claude/skytune): the sky fight with an AI partner seated beside the bot hero. node tools/sky-coop.mjs [--seeds=6] [--hero=knight] [--ally=warden] [--solo]
   bossLab as boss-rates runs it (L40, kit flasks, human profile), but with BK.aiComp.arm(ally) first so the party starts in the lab. Prints a row a fight + the pooled rate. */
import { fightJs, openRetry, diffJs, won } from './boss-run.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
process.env.HERO_LEVEL = process.env.HERO_LEVEL || '40';
const seeds = +opt('seeds', 6), hero = opt('hero', 'knight'), ally = opt('ally', 'warden'), solo = args.includes('--solo'), hpMul = +opt('allyhp', 0);
const keeper = await openRetry(); let w = 0, n = 0;
try { for (let s = 1; s <= seeds; s++) {
  const { js } = fightJs({ r: 'skylab', way: 'practiced', h: hero, s, profile: 'human', flasks: 'kit' }, 240);
  const js2 = solo ? js : js.replace('BK.manualSimulation=true;', "BK.manualSimulation=true;BK.aiComp.arm(" + JSON.stringify(ally) + ",'balanced',1);await BK.allyReady();");
  const pg = await openRetry({ browserPort: keeper.browserPort }); let row;
  try { await pg.evalp(diffJs()); row = await pg.evalp(js2, 1200000); } catch (e) { row = { err: String(e.message).slice(0, 100) }; } finally { await pg.close(); }
  if (!row.err) { n++; if (won(row)) w++; }
  console.log((solo ? 'solo ' : 'coop+' + ally + ' ') + hero + ' s' + s + ': ' + (row.err ? 'ERR ' + row.err : row.outcome + ' ' + row.secs + 's left ' + row.bossLeft + '% taken ' + row.taken));
} } finally { await keeper.close(); }
console.log('POOLED ' + (solo ? 'solo ' : 'coop ') + hero + ': ' + w + '/' + n);
