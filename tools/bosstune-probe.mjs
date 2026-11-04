// tools/bosstune-probe.mjs (claude/bosstune) - ONE fight with a per-second trace of hero + boss + the hands' stated reason. usage: node tools/bosstune-probe.mjs <row> <hero> <seed> [way=built]
import { fightJs, openRetry, diffJs } from './boss-run.mjs';
const [r, h, s, way = 'built'] = process.argv.slice(2);
const { js } = fightJs({ r, way, h, s: +s, profile: process.env.PROFILE || 'human', flasks: 'kit' }, +process.env.SECS || 60);
const trace = "window.__tr=[];const _of=(o)=>{if(o.f%60===0)window.__tr.push([Math.round(o.f/60),Math.round(o.P.x),Math.round(o.P.y),o.P.hp|0,o.boss.mode,Math.round(o.boss.x),Math.round(o.boss.y),Math.round(o.boss.hp||0),o.why||'']);};";
const js2 = js.replace('const r=(await BK.bossLab({', trace + 'const r=(await BK.bossLab({onFrame:_of,').replace('return {stk', 'return {tr:window.__tr,stk');
const keeper = await openRetry(); const pg = await openRetry({ browserPort: keeper.browserPort });
try { await pg.evalp(diffJs()); const row = await pg.evalp(js2, 600000); for (const t of row.tr || []) console.log(t.join(' ')); console.log(row.outcome, row.secs, 'left', row.bossLeft, 'taken', row.taken, JSON.stringify(row.casts)); }
finally { await pg.close(); await keeper.close(); }
