/* tools/bell-pilot.mjs [seeds=3] [label] - THE DIVING BELL (the Deep's boss) through BK.bossLab (src/lab.js): every hero (the
   geomancer too), the ranking's settings (refill health, a 150 s cap, speed 1, modes on), and one pinned roll per seed (opts.seed)
   so seed two is not seed one again (docs/INTEGRATOR.md) - and a start nudged 7 px a seed, because the Deep's fight replays the same under any roll (lab.js opts.nudge). Prints a row per fight (outcome, seconds, damage taken, how often he
   VENTED and how many stones hit his crown, which modes did the damage) and a summary, and writes work/deep2/pilot-<label>.json.
   Run before and after a change to him (docs/briefs/deep-rework-2.md). Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const seeds = +(process.argv[2] || 3), label = process.argv[3] || 'run';
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }), rows = [];
const one = async s => {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const o=await BK.bossLab({bosses:['deep'],heroes:${JSON.stringify(HEROES)},healthMode:'refill',maxSecs:150,modes:true${s ? `,seed:'bell-seed-${s}',nudge:${s * 7}` : ''}});
    return o.rows.map(r=>({seed:${s},h:r.h,out:r.outcome||r.skipped,secs:r.secs,hp:r.bossHp,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,left:r.hpLeftPct,
      vents:(r.modes||{}).vent||0,crowned:r.crowned||0,cracked:((r.modes||{}).crack||0)>0?1:0,hitBy:r.hitBy,modes:r.modes}));})()`, 1800000);
  rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
};
try {
  for (let s = 0; s < seeds; s++) await one(s);
  const w = rows.filter(r => r.out === 'win'), sec = w.map(r => r.secs).sort((a, c) => a - c), t = rows.map(r => r.taken).filter(x => x !== null).sort((a, c) => a - c);
  const summary = { label, fights: rows.length, wins: w.length, medianWin: sec.length ? sec[sec.length >> 1] : null, medianTaken: t.length ? t[t.length >> 1] : null,
    vents: rows.reduce((a, r) => a + r.vents, 0), crowned: rows.reduce((a, r) => a + r.crowned, 0), cracked: rows.filter(r => r.cracked).length, bossHp: rows[0] && rows[0].hp };
  console.log(JSON.stringify(summary));
  mkdirSync(new URL('../work/deep2/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../work/deep2/pilot-' + label + '.json', import.meta.url), JSON.stringify({ label, at: new Date().toISOString(), summary, rows }, null, 1));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
