/* tools/botfix-pilot.mjs [maxSecs=150] — THE FULL BOSS LAB, BEFORE/AFTER (Daniel, 2026-09-25, claude/botfix, task 4).
   Every arena boss AND every mini, all 7 heroes, refill health, a 150 s cap, one seed - the ranking's settings. Discovers
   its own boss list by loading every level and asking it whether it has an arena boss or a mini boss, rather than a
   hand-kept list (LEVELS is an append log; a hand-kept list of "every boss" goes stale the same way). Prints one line a
   fight and a per-boss summary table: wins, median time to kill, median damage taken. Not in the suite: far too long
   for `npm run check`, same as queen-pilot.mjs and reefmaw-pilot.mjs. Run it once on master (BEFORE) and once with the
   botfix branch's changes (AFTER) and diff the two tables - this script does not tune anything itself. */
import { openPage } from './cdp.mjs';
const maxSecs = +(process.argv[2] || 150);
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const disc = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    const arena = [], mini = [];
    for (const lvl of LEVELS) { let b; try { b = lvl.build(); } catch { continue; }
      if (b.arena && b.arena.boss) arena.push(lvl.id);
      if (b.mini && b.mini.boss) mini.push(lvl.id);
    }
    return { arena, mini };
  })()`, 120000);
  console.log('arena bosses (' + disc.arena.length + '): ' + disc.arena.join(', '));
  console.log('minis (' + disc.mini.length + '): ' + disc.mini.join(', '));

  const runPass = async (bosses, mini) => {
    if (!bosses.length) return [];
    return await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;
      const o = await BK.bossLab({bosses:${JSON.stringify(bosses)},heroes:${JSON.stringify(HEROES)},maxSecs:${maxSecs},healthMode:'refill'${mini ? ',mini:true' : ''}});
      return o.rows;})()`, 3600000);
  };
  const arenaRows = await runPass(disc.arena, false);
  const miniRows = await runPass(disc.mini, true);
  const rows = [...arenaRows.map(r => ({ ...r, kind: 'arena' })), ...miniRows.map(r => ({ ...r, kind: 'mini' }))];
  for (const r of rows) console.log(JSON.stringify(r));

  const median = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : null; };
  const byBoss = new Map();
  for (const r of rows) { const key = r.kind + ':' + r.lvl; if (!byBoss.has(key)) byBoss.set(key, []); byBoss.get(key).push(r); }
  console.log('\nboss                        kind   wins  median win(s)  median dmg taken');
  for (const [key, rs] of byBoss) {
    const wins = rs.filter(r => r.outcome === 'win' || r.outcome === 'trade');
    const medSecs = median(wins.map(r => r.secs));
    const medDmg = median(rs.map(r => r.health.damageTaken));
    console.log(key.padEnd(28) + (wins.length + '/' + rs.length).padEnd(7) + String(medSecs ?? '-').padEnd(15) + (medDmg == null ? '-' : Math.round(medDmg)));
  }
  const allWins = rows.filter(r => r.outcome === 'win' || r.outcome === 'trade');
  console.log('\nTOTAL: ' + rows.length + ' fights, ' + allWins.length + ' wins (' + Math.round(100 * allWins.length / rows.length) + '%), median win ' + median(allWins.map(r => r.secs)) + ' s, median dmg taken ' + Math.round(median(rows.map(r => r.health.damageTaken))));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
