/* tools/reefmaw-pilot.mjs [passes=1] [label] - THE REEFMAW (the Shipwreck Reef's boss) through BK.bossLab (src/lab.js): every hero
   (the geomancer too), the ranking's settings (refill health, a 150 s cap, speed 1, modes on), dice pinned per row, one salt per
   pass so pass two is not pass one again (docs/INTEGRATOR.md). Prints a row per fight (outcome, seconds, damage taken, how often his
   jaw STUCK in the coral and how often he BEACHED himself on land, which modes did the damage) and a summary, and writes
   work/reef2/pilot-<label>.json. Run before and after a change to him (docs/briefs/reef-longer.md). Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const passes = +(process.argv[2] || 1), label = process.argv[3] || 'run';
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }), rows = [];
const one = async (p, mode, secs) => {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const o=await BK.bossLab({bosses:['reef'],heroes:${JSON.stringify(HEROES)},healthMode:'${mode}',maxSecs:${secs},modes:true${p ? `,salt:'reefmaw-pass-${p}'` : ''}});
    return o.rows.map(r=>({pass:${JSON.stringify(p)},mode:'${mode}',h:r.h,out:r.outcome||r.skipped,secs:r.secs,hp:r.bossHp,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,left:r.hpLeftPct,
      stuck:(r.modes||{}).stuck||0,beached:(r.modes||{}).beached||0,lunges:(r.modes||{}).lunge||0,rolls:(r.modes||{}).roll||0,land:((r.modes||{}).crawl||0)>0?1:0,smash:(r.modes||{}).smash||0,hitBy:r.hitBy,modes:r.modes}));})()`, 1800000);
  rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
};
try {
  for (let p = 0; p < passes; p++) await one(p, 'refill', 150);
  const rs = rows, w = rs.filter(r => r.out === 'win'), s = w.map(r => r.secs).sort((a, c) => a - c), t = rs.map(r => r.taken).filter(x => x !== null).sort((a, c) => a - c);
  const summary = { label, fights: rs.length, wins: w.length, medianWin: s.length ? s[s.length >> 1] : null, medianTaken: t.length ? t[t.length >> 1] : null,
    stuck: rs.reduce((a, r) => a + r.stuck, 0), beached: rs.reduce((a, r) => a + r.beached, 0), reachedLand: rs.filter(r => r.land > 0).length, bossHp: rs[0] && rs[0].hp };
  const out = { label, at: new Date().toISOString(), summary, rows };
  console.log(JSON.stringify(summary));
  mkdirSync(new URL('../work/reef2/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../work/reef2/pilot-' + label + '.json', import.meta.url), JSON.stringify(out, null, 1));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
