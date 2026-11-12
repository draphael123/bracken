/* GQ4TUNE-d: the Queen row with the escape SKIPPED (P2 alone, the tower climb is the level walker's), n a hero.
   node tools/gq4tune-p2.mjs [--seeds=6] [--heroes=knight,warden,pyro] [--jobs=3] [--row=crown] [--out=file.json] */
import { writeFileSync } from 'node:fs';
import { runFights, line, won } from './boss-run.mjs';
const a = process.argv.slice(2), opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
const seeds = +opt('seeds', 6), heroes = opt('heroes', 'knight,warden,pyro').split(','), row = opt('row', 'crown'), fights = [];
for (const h of heroes) for (let s = +opt('seed0', 0) + 1; s <= +opt('seed0', 0) + seeds; s++) fights.push({ r: row, way: 'practiced', h, s, profile: { base: 'human', gqEscape: 'skip' }, flasks: 'kit' });
const out = await runFights(fights, { jobs: +opt('jobs', 3), secs: 360, onRow: x => console.log(line(x).slice(0, 260)) });
if (opt('out', '')) writeFileSync(opt('out', ''), JSON.stringify(out));
const by = {}; for (const x of out) if (!x.err) { const b = by[x.hero] = by[x.hero] || { w: 0, n: 0, p2: [] }; b.n++; if (won(x)) b.w++; if (x.gq && x.gq.stage !== 'hall') b.p2.push(x.gq.barLeft); }
console.log('P2-ONLY (escape skipped): ' + Object.entries(by).map(([h, b]) => h + ' ' + b.w + '/' + b.n + ' reachedP2 ' + b.p2.length + ' barLeft ' + b.p2.join(',')).join(' | '));
