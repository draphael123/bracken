/* tools/gq5q2-p2.mjs - GQ5Q2 TUNE: THE TOWER TOP ALONE (the escape SKIPPED, same precedent as tools/gq4tune-p2.mjs:
   profile {base:'human', gqEscape:'skip'} - the lab goes straight from the hall's flee to the roof at her full second bar,
   so every fight measures ONLY the phase-2 tower-top mechanics GQ5Q2 adds (teach shard, bell perch + rope, sceptre sweep,
   hatch eruption), not the hall. Needs BRACKEN_GQ5Q2=1 in the env (tools/cdp.mjs hook) or the OFF boss is measured.
   --out/--resume: same one-fight-per-kill cost as tools/boss-rates.mjs (claude/browserleak) - a kill mid-table only
   costs the fight in flight, not the whole run.
   node tools/gq5q2-p2.mjs [--row=crown] [--seeds=6] [--heroes=knight,warden,pyro] [--jobs=1] [--secs=360] [--out=file.json [--resume]]
   Band read here: 60-65% WITH flasks (tighter than the generic boss band; this lane's own brief, not rate-stats' bandOf). */
import { writeFileSync, renameSync, existsSync, readFileSync } from 'node:fs';
import { runFights, line, won } from './boss-run.mjs';
import { fmtRate, bandVerdict } from './rate-stats.mjs';
const a = process.argv.slice(2), opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
const seeds = +opt('seeds', 6), heroes = opt('heroes', 'knight,warden,pyro').split(','), row = opt('row', 'crown'), jobs = Math.max(1, +opt('jobs', 1)), secs = +opt('secs', 360);
const OUT = opt('out', ''), seed0 = +opt('seed0', 0);
const fights = []; for (const h of heroes) for (let s = seed0 + 1; s <= seed0 + seeds; s++) fights.push({ r: row, way: 'practiced', h, s, profile: { base: 'human', gqEscape: 'skip' }, flasks: 'kit' });
const keyOf = x => [x.row ?? x.r, x.way, x.hero ?? x.h, x.seed ?? x.s].join('|');
let done = [];
if (OUT && a.includes('--resume') && existsSync(OUT)) { try { done = JSON.parse(readFileSync(OUT, 'utf8')).filter(x => x && !x.err); } catch (e) { console.log('resume: ' + OUT + ' unreadable (' + e.message + '), starting afresh'); } }
const have = new Set(done.map(keyOf)), todo = fights.filter(f => !have.has(keyOf(f)));
if (done.length) console.log('resume: ' + done.length + ' finished rows kept from ' + OUT + ', ' + todo.length + ' of ' + fights.length + ' fights to play');
const save = rows => { if (!OUT) return; try { writeFileSync(OUT + '.tmp', JSON.stringify(rows)); renameSync(OUT + '.tmp', OUT); } catch (e) { console.log('save failed: ' + e.message); } };
const out = done.concat(await runFights(todo, { jobs, secs, onRow: (x, all) => { console.log(line(x).slice(0, 300)); save(done.concat(all)); } }));
save(out);
const by = {}; for (const x of out) if (!x.err) { const b = by[x.hero] = by[x.hero] || { w: 0, n: 0, p2: [], reached: 0 }; b.n++; if (won(x)) b.w++; if (x.gq && x.gq.stage !== 'hall') { b.reached++; b.p2.push(x.gq.barLeft); } }
let tw = 0, tn = 0; for (const h of heroes) { const b = by[h] || { w: 0, n: 0 }; tw += b.w; tn += b.n; }
const bv = bandVerdict(tw, tn, [60, 65]);
console.log('\nGQ5Q2 P2-ONLY (escape skipped, roof start) row=' + row + ' heroes=' + heroes.join(',') + ' (' + out.length + ' fights)');
for (const h of heroes) { const b = by[h] || { w: 0, n: 0, reached: 0 }; console.log('  ' + h + ' ' + b.w + '/' + b.n + '  reachedRoof ' + b.reached + '/' + b.n); }
console.log('TOTAL ' + fmtRate(tw, tn) + '  band 60-65: ' + (bv.v === 'IN' ? 'IN BAND' : bv.v === 'LOW' ? 'LOW' : bv.v === 'HIGH' ? 'HIGH' : 'UNSURE, ' + bv.note + (bv.need ? ', ~' + bv.need + ' more' : '')));
const zero = heroes.filter(h => by[h] && by[h].n && !by[h].w); if (zero.length) console.log('ZERO WINS: ' + zero.join(','));
