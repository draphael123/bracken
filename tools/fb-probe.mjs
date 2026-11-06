/* tools/fb-probe.mjs - one Freebooter fight with a tally of the lab bot's reasons and where its health went (claude/tune3).
     HITLOG=1 node tools/fb-probe.mjs [hero] [seed] [level] */
import { fightJs, openRetry, diffJs } from './boss-run.mjs';
const [h = 'knight', s = '1', lvl = '25'] = process.argv.slice(2); process.argv.push('--level=' + lvl);
const { js } = fightJs({ r: 'piratefleet', way: 'practiced', h, s: +s, profile: 'human', flasks: 'kit' }, 240);
const hook = 'onFrame:async o=>{const w=window.__fbW=window.__fbW||{};w[o.why||"?"]=(w[o.why||"?"]||0)+1;const q=window.__fbL=window.__fbL||{last:o.P.hp,d:{}};if(o.P.hp<q.last-0.5){const kk=o.boss.mode+"|"+(o.why||"?");q.d[kk]=Math.round(((q.d[kk]||0)+q.last-o.P.hp)*10)/10;}q.last=o.P.hp;},';
const j2 = js.replace('BK.bossLab({', 'BK.bossLab({' + hook);
const pg = await openRetry(); await pg.evalp(diffJs());
const row = await pg.evalp(j2, 600000);
const why = await pg.evalp('window.__fbW'), dl = await pg.evalp('window.__fbL&&window.__fbL.d');
const fr = await pg.evalp('(()=>{const r=BK.freebooter();return r&&{n:r.n,hurt:r.hurt,ph:r.ph}})()').catch(() => null);
await pg.close();
if (row.hits) { const c = {}; for (const x of row.hits) { const k = JSON.stringify(x).slice(0, 140); c[k] = (c[k] || 0) + 1; } console.log(Object.entries(c).slice(0, 30).map(([a, b]) => b + 'x ' + a).join('\n')); }
console.log('DMG by mode|why', JSON.stringify(dl));
console.log(h, 's' + s, row.outcome, row.secs + 's left', row.bossLeft + '% taken', row.taken, 'opened', row.opened, 'swings', row.swings);
console.log(JSON.stringify(why)); console.log(JSON.stringify(fr));
