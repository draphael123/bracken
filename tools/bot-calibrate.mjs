/* tools/bot-calibrate.mjs - FIT THE BOSS BOT TO DANIEL (claude/bot2; a measuring tool, not a check).
   The boss bot's human model has three knobs that decide how hard a fight feels to it (src/bot-profile.js): REACTION (rtMode, with rtMin /
   rtMax around it), MISREAD (a tell answered wrong) and GREED (staying in after a hit). This tool finds the values under which the bot's per-boss
   numbers match Daniel's.
     With LOGS (the playtest recorder's files, src/playrec.js; docs/PLAYTEST.md):
       node tools/bot-calibrate.mjs playtest-logs/a.json [b.json ..] [--seeds=3] [--jobs=3] [--grid=0.2,0.45,0.7] [--write]
       Per boss in the logs, Daniel's numbers: fights, WIN RATE, deaths per fight, damage taken a minute, and his first attempt apart. The bot
       plays the same bosses, the same heroes at the same hero levels, once per grid point, and the point whose win rates and damage a minute
       sit closest to his (the band: +-15 points of win rate, +-35% damage a minute) is the fit.
     Without logs, his REPORTED FEEL (Daniel 10-05) is the target (FEEL below):  node tools/bot-calibrate.mjs --feel [--seeds=3] ...
   The grid is one dial, d (0 = a sharp player, 1 = a sloppy one), that moves all three knobs together (dialProfile): the data a few fights
   give cannot tell the three apart, and one dial cannot over-fit them. --write prints the fitted profile as a src/bot-profile.js entry.
   Prints a table per grid point and the fit; the residual per boss is the part no profile explains - a boss the bot plays worse or better
   than a person does (a bot gap or a perception gap), which is its own retune-list note. */
import { readFileSync, writeFileSync } from 'node:fs';
import { runFights, won } from './boss-run.mjs';
import { PROFILES } from '../src/bot-profile.js';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const seeds = +opt('seeds', 3), jobs = +opt('jobs', 3), grid = opt('grid', '0.15,0.4,0.65').split(',').map(Number), heroesArg = opt('heroes', 'knight,warden,pyro').split(',');
/* DANIEL'S FEEL, 10-05 (brief-bot2.md): the Death Knight hard, Jenny easy, the Puppeteer (PUPPETEER2) good, the Djinn a little too hard.
   As win rates for a practiced player over knight / warden / pyro: hard ~30, a little too hard ~42, good ~55 (the band's middle), easy ~80. */
export const FEEL = { unburied: { said: 'hard', want: 30 }, welltown: { said: 'a little too hard', want: 42 }, theatre: { said: 'good', want: 55 } };   /* (claude/lanterneater: canal: { said: 'easy', want: 80 } was Daniel's feel of JENNY GREENTEETH - she is benched and the canal's boss is new, so the row is out until he plays it) */
/* ONE DIAL: d=0 reacts at 200-260-380 ms, misreads 2%, greedy 8%; d=1 at 260-400-600 ms, misreads 16%, greedy 45% */
export const dialProfile = d => ({ base: 'human', name: 'human@' + d, rtMin: Math.round(200 + 60 * d), rtMode: Math.round(260 + 140 * d), rtMax: Math.round(380 + 220 * d), misread: +(0.02 + 0.14 * d).toFixed(3), greed: +(0.08 + 0.37 * d).toFixed(3) });
/* THE LOGS: the recorder's files, one row per fight; grouped by level[:mini] */
function readLogs(files) { const fights = []; for (const f of files) { const j = JSON.parse(readFileSync(f, 'utf8')); for (const x of (j.fights || j)) fights.push(x); } return fights; }
function targetsFromLogs(fights) {
  const by = {}; for (const x of fights) { if (x.outcome === 'in progress' || x.outcome === 'left') continue; const k = x.level + (x.mini ? ':mini' : ''); (by[k] = by[k] || []).push(x); }
  const T = {}; for (const [k, L] of Object.entries(by)) { const wins = L.filter(x => x.outcome === 'win' || x.outcome === 'trade').length, mins = L.reduce((s, x) => s + x.t / 60, 0), taken = L.reduce((s, x) => s + (x.taken || 0), 0);
    const heroes = {}; for (const x of L) heroes[x.hero] = Math.max(heroes[x.hero] || 0, x.heroLevel || 0);
    T[k] = { fights: L.length, want: Math.round(100 * wins / L.length), deaths: L.filter(x => x.outcome === 'death').length, tpm: mins ? Math.round(taken / mins) : null, heroes, first: L[0].outcome, said: 'logged' }; }
  return T; }
const files = args.filter(a => !a.startsWith('-'));
const T = files.length ? targetsFromLogs(readLogs(files)) : FEEL;
if (!files.length && !args.includes('--feel')) console.log('(no log files given: fitting to Daniel\'s reported feel, --feel)');
const rows = Object.keys(T), results = [];
for (const d of grid) {
  const prof = dialProfile(d), list = [];
  for (const r of rows) { const hs = files.length ? Object.keys(T[r].heroes).filter(h => heroesArg.includes(h) || true) : heroesArg; for (const h of hs) for (let s = 1; s <= seeds; s++) list.push({ r, way: 'practiced', h, s, profile: prof, tag: d }); }
  const out = await runFights(list, { jobs, onRow: x => process.stdout.write(x.err ? 'E' : won(x) ? 'w' : '.') });
  const per = {}; for (const r of rows) { const X = out.filter(x => x.row === r && !x.err), w = X.filter(won).length, secs = X.reduce((s, x) => s + (x.secs || 0), 0), tk = X.reduce((s, x) => s + (x.taken || 0), 0);
    per[r] = { n: X.length, rate: X.length ? Math.round(100 * w / X.length) : null, tpm: secs ? Math.round(tk / secs * 60) : null, byHero: Object.fromEntries(heroesArg.map(h => [h, X.filter(x => x.hero === h).filter(won).length + '/' + X.filter(x => x.hero === h).length])) }; }
  const loss = rows.reduce((s, r) => s + Math.pow(((per[r].rate ?? 50) - T[r].want) / 15, 2) + (T[r].tpm && per[r].tpm ? Math.pow(Math.log(per[r].tpm / T[r].tpm) / Math.log(1.35), 2) : 0), 0);
  results.push({ d, prof, per, loss: +loss.toFixed(2) });
  console.log('\nd=' + d + ' ' + JSON.stringify(prof) + '  loss ' + loss.toFixed(2));
  for (const r of rows) console.log('  ' + r.padEnd(12) + ' bot ' + String(per[r].rate).padStart(3) + '%  want ' + String(T[r].want).padStart(3) + '% (' + T[r].said + ')  ' + JSON.stringify(per[r].byHero) + (per[r].tpm ? '  tpm ' + per[r].tpm + (T[r].tpm ? ' vs ' + T[r].tpm : '') : ''));
}
/* A BOSS NO DIAL EXPLAINS (its residual over 20 points at every grid point) is a bot or perception gap, not a reading of the player: it is
   left out of the fit (and named), so one outlier cannot drag every other boss off (claude/bot2: the Death Knight, whose hands read his hidden
   commit flag and bolt marks, sat at 63-100% for every dial while Daniel calls him hard) */
const lossOf = (R, keep) => keep.reduce((s, r) => s + Math.pow(((R.per[r].rate ?? 50) - T[r].want) / 15, 2) + (T[r].tpm && R.per[r].tpm ? Math.pow(Math.log(R.per[r].tpm / T[r].tpm) / Math.log(1.35), 2) : 0), 0);
const outliers = rows.filter(r => results.every(R => Math.abs((R.per[r].rate ?? 50) - T[r].want) > 20)), keep = rows.filter(r => !outliers.includes(r));
for (const R of results) R.fitLoss = +lossOf(R, keep.length ? keep : rows).toFixed(2);
if (outliers.length) console.log('\nleft out of the fit (no dial explains them): ' + outliers.join(', '));
const best = results.slice().sort((a, b) => a.fitLoss - b.fitLoss)[0];
console.log('\nFIT: d=' + best.d + '  ' + JSON.stringify(best.prof) + '  (loss ' + best.fitLoss + ' on ' + (keep.length ? keep : rows).join(',') + '; ' + seeds + ' seeds x ' + heroesArg.length + ' heroes a boss: +-15 points of noise)');
for (const r of rows) { const res = (best.per[r].rate ?? 0) - T[r].want; console.log('  residual ' + r.padEnd(12) + (res > 0 ? '+' : '') + res + ' points' + (Math.abs(res) > 20 ? '   <- no dial explains it: the bot plays this boss ' + (res > 0 ? 'better' : 'worse') + ' than Daniel feels it (a bot or a perception gap; see the retune list)' : '')); }
if (args.includes('--write')) console.log('\n  ' + JSON.stringify({ ...PROFILES.human, ...best.prof, base: undefined }).replace(/"(\w+)":/g, '$1: ') + ',');
if (opt('out', '')) writeFileSync(opt('out', ''), JSON.stringify({ targets: T, results, best }, null, 1));
