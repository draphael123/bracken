/* tools/seawalk-krprobe.mjs [hero] [seed] - one Causeway 2 Kraken fight with a position / health / mode trace every ~1.5 s (claude/seawalk1). BRACKEN_CW3=1 CW3=1 */
import { fightJs, openRetry, diffJs } from './boss-run.mjs';
const [h = 'warden', s = '2'] = process.argv.slice(2);
const { js } = fightJs({ r: 'causeway', way: 'practiced', h, s: +s, profile: 'human', flasks: 'kit' }, 300);
const hook = 'onFrame:async o=>{const q=window.__kt=window.__kt||{n:0,rows:[]};if(++q.n%90===0)q.rows.push([Math.round(q.n/60*10)/10,Math.round(o.P.x/16),Math.round(o.P.y/16),Math.round(o.P.hp),o.boss&&o.boss.mode,o.why,!!o.P.ground,o.P.swim||o.P.inWater||0,o.boss&&Math.round(o.boss.hp)]);},';
const pg = await openRetry(); await pg.evalp(diffJs());
const row = await pg.evalp(js.replace('BK.bossLab({', 'BK.bossLab({' + hook), 600000);
console.log(h, 's' + s, row.outcome, row.secs + 's left', row.bossLeft + '% taken', row.taken);
console.log(JSON.stringify(await pg.evalp('window.__kt.rows')));
await pg.close();
