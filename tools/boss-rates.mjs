// PAGE TOOL: launches headless Chrome
/* tools/boss-rates.mjs - THE BOSS STANDARD, ONE COMMAND (claude/bot2; a measuring tool, not a check).
   Per boss, per hero, at the boss's CAMPAIGN LEVEL (tools/boss-level.mjs campaignLevel: depth or the road's XP, never under L3), NORMAL health,
   the boss bot with the standard profile (src/bot-profile.js STANDARD, the calibrated player), four ways:
     practiced  the bot knows the fight (bare build: the even card, no skills) - THE STANDARD the 50-60% band is read on
     first      a FIRST ATTEMPT: the same, but it has not seen his tells or his opening (profile '+first')
     built      practiced, with a TYPICAL build: the card a player picks (health and damage first, milestone perks) and his best skills
                in the slots his level has (src/bot-profile.js typicalCard / TYPICAL_SKILLS), cast by the lab's skill hands
   ("bare" is practiced: the floor.)  (claude/botbuilt, Daniel 11-03 Q2) built now runs the SAME n as practiced (--built-seeds still overrides) and the table prints a built-minus-bare column: the band is read on the built way as a one-off report, bare is the printed floor, NO automatic retune. Every built row carries the cast counts (casts.ult = ultimates fired) and a !!BUILD-GAP flag when the hero's kit has a skill with no SKILL_RANGE entry or no typical skills at all.
     PORT=8644 node tools/boss-rates.mjs <level>[:mini][,<level>[:mini]..] | --all  [--ways=practiced,first,built] [--seeds=6] [--first-seeds=N]
        [--built-seeds=N] [--adaptive [--cap=20] [--step=6]] [--band-way=practiced] [--heroes=knight,warden,pyro] [--profile=human] [--secs=240] [--jobs=2] [--out=file.json [--resume]] [--level=N]
   --all: every live boss and mini (BOSS_ROWS below). --jobs: pages run side by side (each its own headless Chrome). Prints a row a fight
   and a table: boss, hero level, then per way the wins per hero and overall, and the band (bosses 60-70%, minis 75-85% with flasks; no hero at 0). */
import { writeFileSync, renameSync, existsSync, readFileSync } from 'node:fs';
import { runFights, line, won } from './boss-run.mjs';
import { STANDARD } from '../src/bot-profile.js';
import { BOSS_ROWS } from './boss-rows.mjs';
import { fmtRate, bandVerdict, spansEdge } from './rate-stats.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const rowsArg = args.includes('--all') ? BOSS_ROWS : args.filter(a => !a.startsWith('-')).flatMap(a => a.split(','));
const heroes = opt('heroes', 'knight,warden,pyro').split(','), seeds = +opt('seeds', 6), secs = +opt('secs', 240), jobs = Math.max(1, +opt('jobs', 2));
const ways = opt('ways', 'practiced,first,built').split(','), prof = opt('profile', STANDARD), OUT = opt('out', ''), flasks = opt('flasks', process.env.BOSS_FLASKS || 'kit');   /* (claude/flasks2) kit: the campaign kit's flasks (B6); bare: one flask at 35% (the old rows) */
if (opt('difficulty', '')) process.env.DIFFICULTY = opt('difficulty', '');   /* (claude/difficulty) --difficulty=easy|normal|master (default normal) */
const seedsOf = { practiced: seeds, first: +opt('first-seeds', Math.max(2, Math.ceil(seeds / 2))), built: +opt('built-seeds', seeds) };
const fights = [];
for (const r of rowsArg) for (const way of ways) for (const h of heroes) for (let s = 1 + (+process.env.SEED0 || 0); s <= (+process.env.SEED0 || 0) + seedsOf[way]; s++) fights.push({ r, way, h, s, profile: prof, flasks });
const t0 = Date.now();
/* (claude/browserleak 11-12) A KILL COSTS ONE FIGHT, NOT THE TABLE: every finished fight is written to --out at once (temp file + rename, so a kill mid-write cannot corrupt it), and --resume reads
   that file first and plays only the fights it does not hold a finished row for (error rows are played again). Same fight key = row|way|hero|seed|tag. Without --resume the file is started afresh, as before. */
const keyOf = x => [x.row ?? x.r, x.way, x.hero ?? x.h, x.seed ?? x.s, x.tag ?? ''].join('|');
let done = [];
if (OUT && args.includes('--resume') && existsSync(OUT)) { try { done = JSON.parse(readFileSync(OUT, 'utf8')).filter(x => x && !x.err); } catch (e) { console.log('resume: ' + OUT + ' unreadable (' + e.message + '), starting afresh'); } }
const have = new Set(done.map(keyOf)), todo = fights.filter(f => !have.has(keyOf(f)));
if (done.length) console.log('resume: ' + done.length + ' finished rows kept from ' + OUT + ', ' + todo.length + ' of ' + fights.length + ' fights to play');
const save = rows => { if (!OUT) return; try { writeFileSync(OUT + '.tmp', JSON.stringify(rows)); renameSync(OUT + '.tmp', OUT); } catch (e) { console.log('save failed: ' + e.message); } };
let out = done.concat(await runFights(todo, { jobs, secs, onRow: (x, all) => { console.log(line(x)); save(done.concat(all)); } }));
/* (claude/botstats, Daniel 11-03) ADAPTIVE N: every rate is printed with its 95% interval, and a boss is called IN BAND / LOW / HIGH only when the interval says so.
   --adaptive adds --step fights a hero (new seeds) to every row whose BAND-WAY pooled interval still spans a band edge, until it clears or --cap a hero (20) is reached. --band-way picks the way the band is read on (default practiced, the standing way; Q2 'which build' is undecided: any way can be read). */
const BAND_WAY = opt('band-way', 'practiced'), ADAPT = args.includes('--adaptive'), CAP = +opt('cap', 20), STEP = Math.max(1, +opt('step', 6));
const bandOf = r => r.includes(':mini') ? [75, 85] : [60, 70];   /* B6 amended: with flasks bosses 60-70, minis 75-85 */
const pooled = (rows, r, way) => { let w = 0, n = 0; for (const x of rows) if (!x.err && x.row === r && x.way === way) { n++; if (won(x)) w++; } return { w, n }; };
if (ADAPT && ways.includes(BAND_WAY)) for (let round = 0; ; round++) {
  const more = [];
  for (const r of rowsArg) { const { w, n } = pooled(out, r, BAND_WAY); const used = Math.max(0, ...out.filter(x => x.row === r && x.way === BAND_WAY).map(x => x.seed)) - (+process.env.SEED0 || 0), perHero = Math.ceil(n / heroes.length);
    if (!spansEdge(w, n, bandOf(r)) || perHero >= CAP || used >= CAP + 8) continue;   /* (used: seeds that errored still count, so a dead seed cannot loop forever) */
    const add = Math.min(STEP, CAP - perHero); console.log('adaptive: ' + r + ' ' + BAND_WAY + ' ' + fmtRate(w, n) + ' spans a band edge: +' + add + ' a hero');
    for (const h of heroes) for (let s = used + 1; s <= used + add; s++) more.push({ r, way: BAND_WAY, h, s: s + (+process.env.SEED0 || 0), profile: prof, flasks }); }
  if (!more.length) break;
  { const base = out; out = base.concat(await runFights(more, { jobs, secs, onRow: (x, all) => { console.log(line(x)); save(base.concat(all)); } })); save(out); }
}
save(out);
export function summarize(rows) {
  const by = {}; for (const x of rows) { if (x.err) continue; const k = x.row; const B = by[k] = by[k] || { row: k, lvl: x.lvl, ways: {} }; const W = B.ways[x.way] = B.ways[x.way] || {};
    const H = W[x.hero] = W[x.hero] || { w: 0, n: 0 }; H.n++; if (won(x)) H.w++; }
  return Object.values(by);
}
console.log('\nBOSS RATES  profile ' + prof + '  flasks ' + flasks + '  difficulty ' + (process.env.DIFFICULTY || 'normal') + '  (' + out.length + ' fights, ' + Math.round((Date.now() - t0) / 60000) + ' min)');
const gapSeen = new Set(); for (const x of out) if (x.gaps && (x.gaps.noRange.length || x.gaps.empty)) gapSeen.add(x.hero + (x.gaps.empty ? ': no typical skills (casts nothing but its ultimate)' : '') + (x.gaps.noRange.length ? ': no SKILL_RANGE for ' + x.gaps.noRange.join(',') : ''));
console.log('row'.padEnd(18) + 'L'.padStart(3) + '  ' + ways.map(w => (w + ' ' + heroes.map(h => h.slice(0, 2)).join('/') + ' (rate [95%] n)').padEnd(46)).join('') + 'band');
for (const B of summarize(out)) { const cells = ways.map(w => { const W = B.ways[w] || {}; let tw = 0, tn = 0; const per = heroes.map(h => { const H = W[h] || { w: 0, n: 0 }; tw += H.w; tn += H.n; return H.w + '/' + H.n; });
    return (per.join(' ') + ' = ' + fmtRate(tw, tn)).padEnd(46); });
  const W = B.ways[BAND_WAY] || {}, tw = heroes.reduce((s, h) => s + ((W[h] || {}).w || 0), 0), tn = heroes.reduce((s, h) => s + ((W[h] || {}).n || 0), 0), pct = tn ? 100 * tw / tn : null, bd = bandOf(B.row), [lo, hi] = bd;
  const zero = heroes.filter(h => W[h] && W[h].n && !W[h].w), bv = bandVerdict(tw, tn, bd), st = pct === null ? '' : (bv.v === 'IN' ? 'IN BAND' : bv.v === 'LOW' ? 'LOW (' + BAND_WAY + ' ' + Math.round(pct - lo) + ')' : bv.v === 'HIGH' ? 'HIGH (' + BAND_WAY + ' +' + Math.round(pct - hi) + ')' : 'UNSURE, ' + bv.note + (bv.need ? ', ~' + bv.need + ' fights to clear the edge' : '') + (tn >= CAP * heroes.length ? ' [cap reached]' : ''));
  console.log(B.row.padEnd(18) + String(B.lvl).padStart(3) + '  ' + cells.join('') + st + (zero.length ? '  zero: ' + zero.join(',') : '') + (() => { const a = B.ways.practiced, b = B.ways.built; if (!a || !b) return ''; const tot = W2 => heroes.reduce((s, h) => ({ w: s.w + ((W2[h] || {}).w || 0), n: s.n + ((W2[h] || {}).n || 0) }), { w: 0, n: 0 }), A = tot(a), Bt = tot(b); return A.n && Bt.n ? '  built-bare ' + (Math.round(100 * Bt.w / Bt.n - 100 * A.w / A.n) >= 0 ? '+' : '') + Math.round(100 * Bt.w / Bt.n - 100 * A.w / A.n) + ' pts' : ''; })()); }
const casts = {}; for (const x of out) if (x.way === 'built' && x.casts) { const c = casts[x.hero] = casts[x.hero] || { fights: 0 }; c.fights++; for (const k in x.casts) c[k] = (c[k] || 0) + x.casts[k]; }
if (Object.keys(casts).length) console.log('BUILT CASTS (summed over the built fights): ' + Object.entries(casts).map(([h, c]) => h + ' ' + JSON.stringify(c)).join('  '));
for (const g of gapSeen) console.log('!!BUILD-GAP ' + g);
