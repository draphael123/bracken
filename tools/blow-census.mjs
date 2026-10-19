/* tools/blow-census.mjs - THE BIGGEST SINGLE BLOW OF EVERY BOSS AND MINI, AFTER THE DIAL (claude/oneshotcap; a measuring tool, not a check).
   Plays the boss-rates fights (campaign level hero, campaign kit flasks, profile human) with BK.blowRec on (src/main.js damagePlayer0 writes, per boss/mini + blow name,
   the biggest blow he threw - landed, blocked or dodged - after BOSS_HIT, the act dial, the tier and the difficulty), and prints, per row, the top blows as a share of
   each hero's max hp. Flags blows over CAP% (default 45) of the hero's max hp.
     PORT=8905 node tools/blow-census.mjs <row[,row..]> | --all  [--heroes=knight,warden,pyro] [--seeds=1] [--cap=45] [--jobs=1] [--out=file.json]
   THE COMMON-FOE CAP (claude/curvec2, brief-curvefix-1018 2c "COMMON_BLOW_CAP", REPORT-ONLY): no COMMON foe's blow may take more than COMMON_BLOW_CAP (25) % of the hero's max hp at campaign level.
   The boss census above only records bosses and minis (BK.blowRec), so the common-foe read comes from the level walker's per-hit record (tools/level-walk.mjs hitBy: [hits, total %hp, BIGGEST single hit %hp],
   keyed by the nearest foe at the blow - an estimate; 'other' = hazards and range). It needs no browser when it is handed a walker json:
     node tools/blow-census.mjs --walk=work/x.json [--common-cap=25]                (read walker rows: the biggest single hit of each common foe, per level, vs the cap)
     PORT=8905 node tools/blow-census.mjs --walk-levels=canal,theatre [--heroes=..] [--seeds=1]   (walk them first, one Chrome)
   Prints OVER rows and always exits 0 (report-only; it becomes a check when Daniel says so). */
import { writeFileSync, readFileSync } from 'node:fs';
export const COMMON_BLOW_CAP = 25;   /* percent of the hero's max hp; REPORT-ONLY */
/* rows = level-walk.mjs rows (r.id, r.hero, r.maxHp, r.hitBy {foe: [hits, total%, biggest%]}) -> { level: { foe: { max, n, hero } } } */
export function commonBlows(rows) {
  const by = {}; for (const r of rows) { if (r.err || !r.hitBy) continue; for (const [foe, v] of Object.entries(r.hitBy)) { if (foe === 'other' || v.length < 3) continue; const L = by[r.id] || (by[r.id] = {}), c = L[foe] || (L[foe] = { max: 0, n: 0, hero: '' }); c.n += v[0]; if (v[2] > c.max) { c.max = v[2]; c.hero = r.hero; } } }
  return by; }
export function commonReport(rows, cap = COMMON_BLOW_CAP) {
  const by = commonBlows(rows), out = [], over = [], overElite = [];   /* (a '*' foe is an elite: listed apart, an elite's weight is its exam's (tools/elites.mjs); the cap is for the common run) */
  for (const [id, L] of Object.entries(by)) { const top = Object.entries(L).sort((a, b) => b[1].max - a[1].max).slice(0, 4); out.push(id.padEnd(14) + top.map(([k, c]) => k + ' ' + c.max + '%' + (c.max > cap ? ' OVER' : '') + ' (' + c.hero.slice(0, 2) + ', ' + c.n + ' hits)').join(' | ')); for (const [k, c] of Object.entries(L)) if (c.max > cap) (k.endsWith('*') ? overElite : over).push(id + ' ' + k + ' ' + c.max + '% (n=' + c.n + ')'); }
  return { lines: out, over, overElite }; }
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
if (opt('walk', '') || opt('walk-levels', '')) {
  const cap = +opt('common-cap', COMMON_BLOW_CAP); let rows = [];
  if (opt('walk', '')) for (const f of opt('walk').split(',')) rows = rows.concat(JSON.parse(readFileSync(f, 'utf8')));
  else { const { walkCfg, runWalks } = await import('./level-walk.mjs'), heroes = opt('heroes', 'knight,warden,pyro').split(','), cfgs = [];
    for (const id of opt('walk-levels').split(',')) for (const h of heroes) for (let sd = 1; sd <= +opt('seeds', 1); sd++) cfgs.push(walkCfg(id, h, sd, { frames: 36000, stuck: 1500, deaths: 8, profile: 'human+first', skills: true, legacy: [], duel: true, fight: true, subs: true, mini: true }));
    rows = await runWalks(cfgs, { jobs: 1 }); if (opt('out', '')) writeFileSync(opt('out'), JSON.stringify(rows, null, 1)); }
  const R = commonReport(rows, cap); console.log('COMMON BLOW CENSUS (the biggest single hit of a common foe, % of the hero max hp; walker estimate by nearest foe)  cap ' + cap + '%  REPORT-ONLY'); console.log(R.lines.join(String.fromCharCode(10)));
  console.log(R.over.length ? String.fromCharCode(10) + 'OVER the cap (' + R.over.length + ' common): ' + R.over.join(', ') + (R.overElite.length ? String.fromCharCode(10) + 'elites over (not counted): ' + R.overElite.join(', ') : '') : String.fromCharCode(10) + 'no common blow over the cap'); process.exit(0);
}
process.env.BLOW_CENSUS = '1';
const { runFights } = await import('./boss-run.mjs');
const { BOSS_ROWS } = await import('./boss-rows.mjs');
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
