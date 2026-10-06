/* tools/boss-rates.mjs - THE BOSS STANDARD, ONE COMMAND (claude/bot2; a measuring tool, not a check).
   Per boss, per hero, at the boss's CAMPAIGN LEVEL (tools/boss-level.mjs campaignLevel: depth or the road's XP, never under L3), NORMAL health,
   the boss bot with the standard profile (src/bot-profile.js STANDARD, the calibrated player), four ways:
     practiced  the bot knows the fight (bare build: the even card, no skills) - THE STANDARD the 50-60% band is read on
     first      a FIRST ATTEMPT: the same, but it has not seen his tells or his opening (profile '+first')
     built      practiced, with a TYPICAL build: the card a player picks (health and damage first, milestone perks) and his best skills
                in the slots his level has (src/bot-profile.js typicalCard / TYPICAL_SKILLS), cast by the lab's skill hands
   ("bare" is practiced: the floor.)
     PORT=8644 node tools/boss-rates.mjs <level>[:mini][,<level>[:mini]..] | --all  [--ways=practiced,first,built] [--seeds=6] [--first-seeds=N]
        [--built-seeds=N] [--heroes=knight,warden,pyro] [--profile=human] [--secs=240] [--jobs=2] [--out=file.json] [--level=N]
   --all: every live boss and mini (BOSS_ROWS below). --jobs: pages run side by side (each its own headless Chrome). Prints a row a fight
   and a table: boss, hero level, then per way the wins per hero and overall, and the band (bosses 50-60%, minis 70-75%; no hero at 0). */
import { writeFileSync } from 'node:fs';
import { runFights, line, won } from './boss-run.mjs';
import { STANDARD } from '../src/bot-profile.js';
import { BOSS_ROWS } from './boss-rows.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const rowsArg = args.includes('--all') ? BOSS_ROWS : args.filter(a => !a.startsWith('-')).flatMap(a => a.split(','));
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 6), secs = +opt('secs', 240), jobs = Math.max(1, +opt('jobs', 2));
const ways = opt('ways', 'practiced,first,built').split(','), prof = opt('profile', STANDARD), OUT = opt('out', '');
const seedsOf = { practiced: seeds, first: +opt('first-seeds', Math.max(2, Math.ceil(seeds / 2))), built: +opt('built-seeds', Math.max(2, Math.ceil(seeds / 2))) };
const fights = [];
for (const r of rowsArg) for (const way of ways) for (const h of heroes) for (let s = 1; s <= seedsOf[way]; s++) fights.push({ r, way, h, s, profile: prof });
const t0 = Date.now();
const out = await runFights(fights, { jobs, secs, onRow: (x, all) => { console.log(line(x)); if (OUT && all.length % 6 === 0) writeFileSync(OUT, JSON.stringify(all)); } });
if (OUT) writeFileSync(OUT, JSON.stringify(out));
export function summarize(rows) {
  const by = {}; for (const x of rows) { if (x.err) continue; const k = x.row; const B = by[k] = by[k] || { row: k, lvl: x.lvl, ways: {} }; const W = B.ways[x.way] = B.ways[x.way] || {};
    const H = W[x.hero] = W[x.hero] || { w: 0, n: 0 }; H.n++; if (won(x)) H.w++; }
  return Object.values(by);
}
const band = r => r.includes(':mini') ? [70, 75] : [50, 60];
console.log('\nBOSS RATES  profile ' + prof + '  (' + out.length + ' fights, ' + Math.round((Date.now() - t0) / 60000) + ' min)');
console.log('row'.padEnd(18) + 'L'.padStart(3) + '  ' + ways.map(w => (w + ' ' + heroes.map(h => h.slice(0, 2)).join('/')).padEnd(26)).join('') + 'band');
for (const B of summarize(out)) { const cells = ways.map(w => { const W = B.ways[w] || {}; let tw = 0, tn = 0; const per = heroes.map(h => { const H = W[h] || { w: 0, n: 0 }; tw += H.w; tn += H.n; return H.w + '/' + H.n; });
    return (per.join(' ') + ' = ' + (tn ? Math.round(100 * tw / tn) : '-') + '%').padEnd(26); });
  const W = B.ways.practiced || {}, tw = heroes.reduce((s, h) => s + ((W[h] || {}).w || 0), 0), tn = heroes.reduce((s, h) => s + ((W[h] || {}).n || 0), 0), pct = tn ? 100 * tw / tn : null, [lo, hi] = band(B.row);
  const zero = heroes.filter(h => W[h] && W[h].n && !W[h].w), st = pct === null ? '' : pct < lo ? 'LOW ' + Math.round(pct - lo) : pct > hi ? 'HIGH +' + Math.round(pct - hi) : 'in band';
  console.log(B.row.padEnd(18) + String(B.lvl).padStart(3) + '  ' + cells.join('') + st + (zero.length ? '  zero: ' + zero.join(',') : '')); }
