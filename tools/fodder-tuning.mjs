// tools/fodder-tuning.mjs — THE FODDER'S HEALTH, MEASURED FOR ALL SIX HEROES (docs/combat-tuning.md recommends x2.4 on the fodder
// alone; only the knight and the Freebooter had been measured). One headless pass: the game's own fight bot puts every hero against
// every fodder type in an early, a middle and a late level, first at the health the game ships and then at the scaled health, and
// prints both. The rule it is checking: the middle and late fights should take 2-4 blows, and NO HERO MAY START DYING WHERE IT DID NOT.
//   node tools/fodder-tuning.mjs [multiplier=2.4] [reps=1]
import { openPage } from './cdp.mjs';
const MUL = +(process.argv[2] || 2.4), REPS = +(process.argv[3] || 1);
const FODDER = ['sprig', 'shield', 'cutlass', 'crab', 'scout', 'archer', 'harpy'];
const pg = await openPage({ audio: false, fonts: false });
const pass = async mul => pg.evalp(`(async()=>{
  BK.manualSimulation = true;
  window.__E0 = window.__E0 || Object.fromEntries(${JSON.stringify(FODDER)}.map(t => [t, BK.EHP[t]]));
  for (const t of ${JSON.stringify(FODDER)}) BK.EHP[t] = Math.round(__E0[t] * ${mul});
  const o = await BK.fightLab({ levels: ['wood', 'spire', 'waymeet'], heroes: ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper'], foes: ${JSON.stringify(FODDER)}, reps: ${REPS} });
  return { rows: o.rows.map(r => ({ lvl: r.lvl, h: r.h, t: r.t, kills: r.kills, deaths: r.deaths, ttk: r.ttk, swings: r.swings, takenPct: r.takenPct })), summary: o.summary };
})()`, 3600000);
try {
  const before = await pass(1), after = await pass(MUL);
  const one = rows => rows.filter(r => r.swings != null && r.swings <= 1.2).length + '/' + rows.length;
  const avg = (rows, k) => +(rows.filter(r => r[k] != null).reduce((s, r) => s + r[k], 0) / Math.max(1, rows.filter(r => r[k] != null).length)).toFixed(2);
  const sum = (rows, k) => rows.reduce((s, r) => s + (r[k] || 0), 0);
  console.log('hero        | one-swing fights   | swings/kill | time to kill | health lost % | deaths');
  for (const h of ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper']) {
    const b = before.rows.filter(r => r.h === h), a = after.rows.filter(r => r.h === h);
    console.log(h.padEnd(11) + ' | now ' + one(b).padEnd(6) + ' x' + MUL + ' ' + one(a).padEnd(6) + '| ' + avg(b, 'swings') + ' -> ' + avg(a, 'swings') + ' | ' + avg(b, 'ttk') + ' -> ' + avg(a, 'ttk') + ' s | ' + avg(b, 'takenPct') + ' -> ' + avg(a, 'takenPct') + ' | ' + sum(b, 'deaths') + ' -> ' + sum(a, 'deaths'));
  }
  const newDeaths = after.rows.filter(a => a.deaths > 0 && !before.rows.some(b => b.h === a.h && b.t === a.t && b.lvl === a.lvl && b.deaths > 0));
  console.log(newDeaths.length ? 'NEW DEATHS (a hero dying where it did not): ' + newDeaths.map(r => r.h + ' v ' + r.t + ' in ' + r.lvl + ' ' + r.deaths).join(', ') : 'no hero dies where it did not before');
  const late = r => r.lvl !== 'wood';
  console.log('middle and late game, swings per kill: now ' + avg(before.rows.filter(late), 'swings') + ' -> ' + avg(after.rows.filter(late), 'swings') + ' (the aim is 2-4)');
  console.log(JSON.stringify({ before: before.summary, after: after.summary }));
} finally { pg.close(); }
