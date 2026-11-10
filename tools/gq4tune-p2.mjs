/* GQ4TUNE-d: run the Queen row with the escape SKIPPED (P2 only) so P2 can be read alone. node tools/gq4tune-p2.mjs [hero] [seed] */
import { runFights, line } from './boss-run.mjs';
const h = process.argv[2] || 'knight', s = +(process.argv[3] || 1);
const out = await runFights([{ r: 'crown', way: 'practiced', h, s, profile: { base: 'human', gqEscape: 'skip' }, flasks: 'kit' }], { jobs: 1, secs: 360 });
for (const x of out) console.log(line(x));
