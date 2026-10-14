// work/claude/pyramidboss/trace.mjs - one boss-lab fight, its plan's reasons over time (a probe)
//   PORT=8895 node work/claude/pyramidboss/trace.mjs <hero> [mini] [secs] [seed]
import { openLevelPage as openPage, campaignLevel } from '../../../tools/boss-level.mjs';
import { fightFlasks } from '../../../tools/boss-run.mjs';
const [h = 'knight', mini = '', secs = '60', seed = '1'] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false });
try { const fk = fightFlasks('sealedpyramid'), lvl = campaignLevel('sealedpyramid');
  console.log(await pg.evalp(`(async()=>{ BK.manualSimulation = true; const P0 = BKT.PROG; BKT.setHeroLevel(${JSON.stringify(h)}, ${lvl}); P0.flaskItems = ${JSON.stringify(fk)}; BK.setHero(${JSON.stringify(h)}); BK.reset({ fresh: true }); BK.applyUpgrades();
    const log = []; let last = '', lastF = 0;
    const r = await BK.bossLab({ bosses: ['sealedpyramid'], heroes: [${JSON.stringify(h)}], maxSecs: ${+secs}, healthMode: 'normal', seed: ${+seed}, profile: 'human', ${mini ? 'mini: true,' : ''}
      onFrame: q => { const k = (q.why || '').replace(/[0-9.]+/g, '#') + ' | ' + q.boss.mode; if (k !== last || q.f - lastF > 120) { log.push((q.f / 60).toFixed(1) + 's ' + k + ' P ' + Math.round(q.P.x / 16) + ',' + Math.round(q.P.y / 16) + ' hp ' + Math.round(q.P.hp) + ' B ' + Math.round(q.boss.x / 16) + ' ' + Math.round(100 * q.boss.hp / q.boss.maxHp) + '%'); last = k; lastF = q.f; } } });
    const row = r.rows[0] || {}; return log.slice(0, 400).join('\\n') + '\\n' + JSON.stringify({ outcome: row.outcome, secs: row.secs, left: row.hpLeftPct, opened: row.opened, swings: row.swings, read: ${mini ? "BK.scarabMother()" : "BK.tombKing()"} }).slice(0, 900); })()`, 600000)); } finally { pg.close(); }
