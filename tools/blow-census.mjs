/* tools/blow-census.mjs - THE BIGGEST SINGLE BLOW OF EVERY BOSS AND MINI, AFTER THE DIAL (claude/oneshotcap; a measuring tool, not a check).
   Plays the boss-rates fights (campaign level hero, campaign kit flasks, profile human) with BK.blowRec on (src/main.js damagePlayer0 writes, per boss/mini + blow name,
   the biggest blow he threw - landed, blocked or dodged - after BOSS_HIT, the act dial, the tier and the difficulty), and prints, per row, the top blows as a share of
   each hero's max hp. Flags blows over CAP% (default 45) of the hero's max hp.
     PORT=8905 node tools/blow-census.mjs <row[,row..]> | --all  [--heroes=knight,warden,pyro] [--seeds=1] [--cap=45] [--jobs=1] [--out=file.json] */
import { writeFileSync } from 'node:fs';
process.env.BLOW_CENSUS = '1';
const { runFights } = await import('./boss-run.mjs');
const { BOSS_ROWS } = await import('./boss-rows.mjs');
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const rows = args.includes('--all') ? BOSS_ROWS : args.filter(a => !a.startsWith('-')).flatMap(a => a.split(','));
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 1), cap = +opt('cap', 45), jobs = +opt('jobs', 1), OUT = opt('out', '');
const fights = []; for (const r of rows) for (const h of heroes) for (let s = 1; s <= seeds; s++) fights.push({ r, way: 'practiced', h, s, profile: 'human', flasks: 'kit' });
const out = await runFights(fights, { jobs, secs: +opt('secs', 240), onRow: (x, all) => { console.log(x.row + ' ' + x.hero + ' L' + x.lvl + ' hp' + x.maxHp + ' ' + (x.err || x.outcome)); if (OUT && all.length % 3 === 0) writeFileSync(OUT, JSON.stringify(all)); } });
if (OUT) writeFileSync(OUT, JSON.stringify(out));
const by = {}; for (const x of out) { if (x.err) continue; const B = by[x.row] || (by[x.row] = { lvl: x.lvl, hp: {}, blows: {} }); B.hp[x.hero] = x.maxHp;
  for (const [k, v] of Object.entries(x.blows || {})) { const c = B.blows[k] || (B.blows[k] = { max: 0, n: 0 }); c.max = Math.max(c.max, v.max); c.n += v.n; } }
console.log('\nBLOW CENSUS (blow = hp after the dial; % = of the hero max hp)  cap ' + cap + '%');
for (const [r, B] of Object.entries(by)) { const low = Math.min(...Object.values(B.hp)), top = Object.entries(B.blows).sort((a, b) => b[1].max - a[1].max).slice(0, 3);
  console.log(r.padEnd(20) + 'L' + B.lvl + ' hp ' + Object.entries(B.hp).map(([h, v]) => h.slice(0, 2) + v).join('/') + '  ' + top.map(([k, c]) => { const pc = Math.round(100 * c.max / low); return k + ' ' + c.max + ' (' + pc + '%' + (pc > cap ? ' OVER' : '') + ')'; }).join(' | ')); }
