/* tools/drill-gears.mjs - THE GREAT DRILL 4's GEARS, MEASURED (claude/deeprails4; a measuring tool, not a check). The boss bot fights the drill (tools/boss-run.mjs, the
   same fight boss-rates runs: campaign level, the kit's flasks, profile human) and, sampled as it fights, the drill's own ledger (src/great-drill.js S.n): gears broken,
   blows on gears against blows on the cab, damage dealt to the gears against the body, the stalls, the held blows and what the gates gave - THE 50-50 (Daniel 10-12:
   "the fight split about half gears, half body") read as the share of the hero's blows and of the fight's time spent on each.
     PORT=8868 node tools/drill-gears.mjs [--heroes=knight,warden,pyro] [--seeds=3] [--profile=human] [--jobs=1] */
import { fightJs, openRetry, won } from './boss-run.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 3), prof = opt('profile', 'human');
const pg = await openRetry(); const rows = [];
try {
  for (const h of heroes) for (let s = 1; s <= seeds; s++) {
    const { lvl, js } = fightJs({ r: 'minecart', way: 'practiced', h, s, profile: prof, flasks: 'kit' }, 240);
    await pg.reload();
    const r = await pg.evalp(`(async()=>{ const box = { n: null, ph: 1, why: {} }; const iv = setInterval(() => { try { const S = BK.drillHands && BK.drillHands().show(); if (S && S.n) { box.n = { ...S.n }; box.ph = S.ph; } } catch {} }, 20);
      try { const r = await (${js}); return { ...r, gd: box }; } finally { clearInterval(iv); } })()`, 1200000);
    const n = (r.gd && r.gd.n) || {}, blows = (n.gearBlows || 0) + (n.cab || 0);
    const row = { h, s, lvl, outcome: r.outcome, secs: r.secs, left: r.bossLeft, taken: r.taken, ph: r.gd && r.gd.ph, gears: n.gears, stalls: n.stalls, jams: n.jams, gearBlows: n.gearBlows, cabBlows: n.cab, gearShare: blows ? Math.round(100 * (n.gearBlows || 0) / blows) : null, gearDmg: Math.round(n.gearDmg || 0), held: Math.round(n.held || 0), gave: Math.round(n.gave || 0), thrown: n.thrown, dyn: n.dynamite, lunge: n.lunge, chain: n.chain, collapse: n.collapse, rocks: n.rocks };
    rows.push(row); console.log(JSON.stringify(row));
  }
} finally { pg.close(); }
const W = rows.filter(r => won(r)).length;
console.log('\nGREAT DRILL 4 gears: ' + W + '/' + rows.length + ' won; gears broken ' + rows.map(r => r.gears).join('/') + '; share of blows on gears ' + rows.map(r => r.gearShare + '%').join('/') + '; fights ' + rows.map(r => r.secs + 's').join('/'));
for (const h of heroes) { const R0 = rows.filter(r => r.h === h); console.log('  ' + h.padEnd(8) + R0.filter(won).length + '/' + R0.length); }
