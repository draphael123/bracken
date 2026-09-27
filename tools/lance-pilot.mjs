/* tools/lance-pilot.mjs [passes=2] [label] - STORMHOLD's fight, THE QUEEN'S LANCE, through BK.bossLab (src/lab.js): every hero
   (the geomancer too), dice pinned per row, one salt per pass so pass two is not pass one again (docs/INTEGRATOR.md). The
   ranking's settings (the ranking's audit-bosslab tool, on the claude/audit branch: refill health, a 150 s cap, speed 1, modes on) for passes 0..n-1,
   then one pass at NORMAL health (one life, 300 s) for a win rate a player would recognise. Prints a row per fight (outcome,
   seconds, damage taken, which modes did the damage, how many of his archers were up and how many the hands cut down) and a
   summary, and writes work/lance/pilot-<label>.json. Run before and after a change to him (docs/briefs/lance-support.md).
   Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const passes = +(process.argv[2] || 2), label = process.argv[3] || 'run';
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }), rows = [];
const one = async (p, mode, secs) => {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const o=await BK.bossLab({bosses:['storm'],heroes:${JSON.stringify(HEROES)},healthMode:'${mode}',maxSecs:${secs},modes:true,salt:'lance-pass-${p}'});
    return o.rows.map(r=>({pass:${JSON.stringify(p)},mode:'${mode}',h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,left:r.hpLeftPct,archers:r.archers,archersCut:r.archersCut,hitBy:r.hitBy}));})()`, 1800000);
  rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
};
try {
  for (let p = 0; p < passes; p++) await one(p, 'refill', 150);
  await one('normal', 'normal', 300);
  const sum = mode => { const rs = rows.filter(r => r.mode === mode), w = rs.filter(r => r.out === 'win'), s = w.map(r => r.secs).sort((a, c) => a - c), t = rs.map(r => r.taken).filter(x => x !== null).sort((a, c) => a - c);
    return { mode, fights: rs.length, wins: w.length, medianWin: s.length ? s[s.length >> 1] : null, medianTaken: t.length ? t[t.length >> 1] : null,
      byHero: Object.fromEntries(HEROES.map(h => [h, rs.filter(r => r.h === h).map(r => r.out + ' ' + r.secs + 's ' + r.taken).join(' | ')])) }; };
  const out = { label, at: new Date().toISOString(), summary: [sum('refill'), sum('normal')], rows };
  for (const s of out.summary) console.log(JSON.stringify(s));
  mkdirSync(new URL('../work/lance/', import.meta.url), { recursive: true });
  writeFileSync(new URL('../work/lance/pilot-' + label + '.json', import.meta.url), JSON.stringify(out, null, 1));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
