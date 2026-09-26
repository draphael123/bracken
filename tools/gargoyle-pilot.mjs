/* tools/gargoyle-pilot.mjs [passes=4] [--refill] [--secs N] [--heroes all|a,b] [--out file.json] — THE GATE GARGOYLE (the Witchlight
   Stair's boss). By default NORMAL health, the six lab heroes, `passes` seeded passes each: one life per fight, no refills, what the bot
   loses it keeps. --refill is the ranking's measure instead (health refilled every frame, so every fight runs until he dies or the cap):
   how long he takes and how much he takes off you. --heroes all adds the Geomancer (seven). Each pass is its own roll (bossLab's
   opts.seed): without it every pass replays pass one, because bossLab seeds each row from its own key (docs/INTEGRATOR.md, lesson 1).
   Prints a row per fight (outcome, seconds, health lost, how often he was OPEN, which of his attacks did the damage) and a summary:
   wins, median win, median taken, damage per minute, openings per fight. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
import { writeFileSync } from 'fs';
const argv = process.argv.slice(2), flag = k => argv.includes(k), val = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const passes = +(argv.find(a => /^\d+$/.test(a)) || 4), refill = flag('--refill'), secs = +val('--secs', refill ? 150 : 300);
const hv = val('--heroes', ''), heroes = hv === 'all' ? ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'] : hv ? hv.split(',') : undefined;
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let p = 0; p < passes; p++) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const o=await BK.bossLab({bosses:['witchlight'],healthMode:'${refill ? 'refill' : 'normal'}',maxSecs:${secs},modes:true,seed:'pass${p}'${heroes ? ',heroes:' + JSON.stringify(heroes) : ''}});
      return o.rows.map(r=>({pass:${p},h:r.h,won:r.outcome==='win',out:r.outcome,secs:r.secs,taken:Math.round(r.health?r.health.damageTaken:0),opened:r.opened,left:r.hpLeftPct,hitBy:r.hitBy,modes:r.modes}));})()`, 1800000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x)); }
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
  const wins = rows.filter(r => r.won), by = {};
  for (const r of rows) { by[r.h] = by[r.h] || [0, 0]; by[r.h][1]++; if (r.won) by[r.h][0]++; }
  const perMin = rows.map(r => r.secs > 0 ? r.taken / (r.secs / 60) : 0), opened = rows.map(r => r.opened || 0);
  console.log((refill ? 'REFILL' : 'NORMAL') + ' ' + secs + ' s cap: fights ' + rows.length + ', wins ' + wins.length + ' (' + Math.round(100 * wins.length / rows.length) + '%), median win ' + med(wins.map(r => r.secs)) + ' s, median taken ' + med(rows.map(r => r.taken)) + ', median taken/min ' + Math.round(med(perMin)) + ', median openings ' + med(opened) + '; by hero ' + Object.entries(by).map(([h, [w, n]]) => h + ' ' + w + '/' + n).join(', '));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  const out = val('--out', null); if (out) writeFileSync(out, JSON.stringify({ refill, secs, passes, rows }, null, 1));
} finally { pg.close(); }
