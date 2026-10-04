// tools/xp.mjs — THE CURVE, WALKED. Does a straight run still stand at the level the woods used to give?
// The hero's level is XP now (src/xp.js), and the curve it climbs was fitted to the campaign, not typed. This walks every campaign
// wood in the order it opens, in the page, with the real spawns (placed foes, the garrison, the ambush waves, the one mini and the
// boss) priced by the real xpFoe, and prints per stage: what the wood holds, what a straight run has banked by the end of it (four
// foes in five, every mini and boss, the wood's share), the level that is, and the level the old count of woods gave. Then the same
// for a full clear: every foe, every quest, and both secret woods where they open.
//   node tools/xp.mjs            the table; exit 1 if a straight run is more than one level off the old count at any stage,
//                                or a full clear finishes the campaign outside one to three levels ahead
//   node tools/xp.mjs --fit      also search XP_C and XP_P for the best fit to the walk (run it after adding a wood)
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const fit = process.argv.includes('--fit');
const out = execFileSync(process.execPath, ['tools/headless.mjs', 'expr', 'BK.xpSim()'], { cwd: ROOT, env: { ...process.env, PORT: process.env.PORT || '5860' }, encoding: 'utf8', maxBuffer: 64e6 });
const rows = JSON.parse(out.slice(out.indexOf('[')));
const { xpFloor, levelOfXp, XP_C, XP_P } = await import('../src/xp.js');

const pad = (s, n) => String(s).padEnd(n), padl = (s, n) => String(s).padStart(n);
console.log('\nTHE CURVE, WALKED  (XP floor of level n = ' + XP_C + ' * n^' + XP_P + ')\n');
console.log(pad('stage', 13) + padl('foes', 5) + padl('foe xp', 8) + padl('mini+boss', 10) + padl('share', 7) + padl('quest', 6) + padl('RUN XP', 8) + padl('LV', 4) + padl('old', 5) + padl('FULL XP', 9) + padl('LV', 4) + padl('old', 5));
let bad = 0;
for (const r of rows) {
  const off = r.secret ? 0 : r.level - r.old;
  console.log(pad((r.secret ? '  (secret) ' : padl(r.stage, 2) + ' ') + r.id, 13) + padl(r.foes, 5) + padl(r.foeXp, 8) + padl(r.bossXp, 10) + padl(r.clear, 7) + padl(r.quest, 6)
    + (r.secret ? padl('', 17) : padl(r.run, 8) + padl(r.level, 4) + padl(r.old, 5)) + padl(r.full, 9) + padl(r.fullLevel, 4) + padl(r.oldFull, 5) + '');
}
/* THE ROAD AGAINST ITS DEPTH (LEVELING, 2026-10-04). The array is an append log (burning, oreroad, harbor... sit late in it), so the stage count
   above is NOT the level a wood expects. The judgement walks the GATE CHAIN's road (src/campaign-order.js chainOf) in order and asks that a straight
   run finishing each road wood stands within -1..+2 of its expected level, depth + 1 (+2 is the soft cap's last full-pay level) - with no catch-up (the 400*n^1.365 refit's promise). */
const { LEVELS } = await import('../src/level.js');
const { chainOf, depthsOf } = await import('../src/campaign-order.js');
const vis = LEVELS.filter(l => !l.hidden || l.secret), C = chainOf(vis), depth = depthsOf(vis), byId = Object.fromEntries(rows.map(r => [r.id, r]));
console.log('\nTHE ROAD (gate chain), a straight run against depth + 1');
let road = 0; const offs = [];
for (const id of C.road) { const r = byId[id]; if (!r || r.secret) continue; road += Math.round(0.8 * r.foeXp) + r.bossXp + r.clear;
  const lv = levelOfXp(road), want = (depth[id] || 0) + 1, off = lv - want; offs.push(off); if (off < -1 || off > 2) bad++;   /* behind by more than one, or past E+2 where THE SOFT CAP starts halving it (src/xp.js) */
  console.log(pad(id, 13) + padl(depth[id], 4) + padl(road, 8) + padl(lv, 4) + padl(want, 5) + (off < -1 || off > 2 ? '   <- ' + (off > 0 ? '+' : '') + off : '')); }
console.log('road offsets: ' + offs.join(' '));
const last = rows[rows.length - 1], lastStage = [...rows].reverse().find(r => !r.secret), ahead = last.fullLevel - lastStage.old;
console.log('\nlevels 1-50: ' + Array.from({ length: 50 }, (_, i) => (i + 1) + ':' + xpFloor(i + 1)).join(' '));
console.log('a full clear (every wood, branch and secret) ends at level ' + last.fullLevel + ', ' + ahead + ' level(s) over the count of woods (want 1 to 3).');
if (ahead < 1 || ahead > 3) bad++;

if (fit) {   /* the smallest worst miss, then the most stages exactly on, then the full clear nearest two ahead */
  const stages = rows.filter(r => !r.secret);
  let best = null;
  for (let p = 1.0; p <= 1.6; p += 0.005) for (let c = 200; c <= 900; c += 5) {
    const fl = n => n <= 0 ? 0 : Math.round(c * Math.pow(n, p) / 10) * 10, lv = xp => { let n = 0; while (n < 99 && fl(n + 1) <= xp) n++; return n; };
    let worst = 0, on = 0; for (const r of stages) { const d = Math.abs(lv(r.run) - r.old); worst = Math.max(worst, d); if (!d) on++; }
    const score = [worst, -on, Math.abs(lv(last.full) - lastStage.old - 2)];
    if (!best || cmp(score, best.score) < 0) best = { c, p: +p.toFixed(3), score, ahead: lv(last.full) - lastStage.old };
  }
  console.log('\nbest fit: XP_C = ' + best.c + ', XP_P = ' + best.p + '  (worst miss ' + best.score[0] + ', ' + -best.score[1] + ' of ' + stages.length + ' stages exact, a full clear ends ' + best.ahead + ' ahead)');
}
function cmp(a, b) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }
console.log(bad ? '\n' + bad + ' problem(s).' : '\nthe curve holds.');
process.exitCode = bad ? 1 : 0;
