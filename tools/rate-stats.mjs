/* tools/rate-stats.mjs - THE NOISE MODEL FOR THE BOT'S NUMBERS (claude/botstats, 11-03). No browser.
   A boss rate of 4/6 is not "67%": its 95% interval is 30-90. Every rate the tools print is `rate% [lo-hi] n=N` (Wilson score interval), and a boss is
   called IN BAND / LOW / HIGH only when the interval says so; near an edge the tools add fights (boss-rates --adaptive, cap 20 a hero).
     wilson(w, n)                  -> { p, lo, hi } as percents
     fmtRate(w, n)                 -> '67% [30-90] n=6'
     bandVerdict(w, n, [lo, hi])   -> { v: 'LOW'|'HIGH'|'IN'|'UNSURE', note, need }
         LOW   the whole interval is under the band's lower edge     HIGH  the whole interval is over the upper edge
         IN    the whole interval sits inside the band (needs a big n: a 10-point band is narrower than any n<=60 interval, so IN is rare - by design)
         UNSURE the interval spans an edge; `note` says which side the point estimate falls on ('point in band' / 'point under' / 'point over') and `need` is
                 roughly how many fights would make the interval clear that edge if the point estimate holds
     runStats([..])                -> { mean, sd, se, n }   (the level pilot's per-run values)
     node tools/rate-stats.mjs --selftest */
export const Z = 1.959964;
export function wilson(w, n, z = Z) {
  if (!n) return { p: null, lo: null, hi: null };
  const p = w / n, z2 = z * z, d = 1 + z2 / n, c = (p + z2 / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n)) / d;
  return { p: 100 * p, lo: 100 * Math.max(0, c - h), hi: 100 * Math.min(1, c + h) };
}
export const fmtRate = (w, n) => { if (!n) return '-'; const x = wilson(w, n); return Math.round(x.p) + '% [' + Math.round(x.lo) + '-' + Math.round(x.hi) + '] n=' + n; };
export function bandVerdict(w, n, [blo, bhi]) {
  if (!n) return { v: 'UNSURE', note: 'no fights', need: null };
  const x = wilson(w, n), side = x.p < blo ? 'point under' : x.p > bhi ? 'point over' : 'point in band';
  if (x.hi < blo) return { v: 'LOW', note: '', need: 0 };
  if (x.lo > bhi) return { v: 'HIGH', note: '', need: 0 };
  if (x.lo >= blo && x.hi <= bhi) return { v: 'IN', note: '', need: 0 };
  /* fights until the interval clears the nearest edge it spans, holding the point estimate (normal approximation) */
  const p = x.p / 100; const edges = [blo, bhi].filter(e => x.lo < e && x.hi > e).map(e => e / 100);
  const need = Math.min(...edges.map(e => { const dist = Math.abs(p - e); return dist < 0.005 ? Infinity : Math.ceil(Z * Z * p * (1 - p) / (dist * dist)); }));
  return { v: 'UNSURE', note: side, need: need === Infinity ? null : need };
}
/* does the pooled interval still span a band edge (the adaptive rule: keep adding fights while it does and the cap is not hit) */
export const spansEdge = (w, n, [blo, bhi]) => { if (!n) return true; const x = wilson(w, n); return (x.lo < blo && x.hi > blo) || (x.lo < bhi && x.hi > bhi); };
export function runStats(v) {
  const n = v.length; if (!n) return { mean: null, sd: null, se: null, n: 0 };
  const mean = v.reduce((a, b) => a + b, 0) / n, sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
  return { mean: Math.round(mean * 10) / 10, sd: Math.round(sd * 10) / 10, se: Math.round(sd / Math.sqrt(n) * 10) / 10, n };
}
/* two measurements of the same thing (a restamp's rerun) disagree by more than their noise? */
export const disagree = (a, b) => Math.abs(a.mean - b.mean) > 2 * Math.sqrt(a.se * a.se + b.se * b.se);

if (process.argv[1] && process.argv[1].split(String.fromCharCode(92)).join('/').endsWith('tools/rate-stats.mjs') && process.argv.includes('--selftest')) {
  let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL ' + m); } };
  const near = (a, b, t, m) => ok(Math.abs(a - b) <= t, m + ' got ' + a + ' want ' + b);
  /* known Wilson 95% values (textbook / R binom.confint): 4/6 -> 30.0-90.3; 0/10 -> 0-27.8; 10/10 -> 72.2-100; 50/100 -> 40.4-59.6; 13/20 -> 43.3-81.9 */
  let x = wilson(4, 6); near(x.lo, 30.0, 0.3, '4/6 lo'); near(x.hi, 90.3, 0.3, '4/6 hi');
  x = wilson(0, 10); near(x.lo, 0, 0.01, '0/10 lo'); near(x.hi, 27.8, 0.3, '0/10 hi');
  x = wilson(10, 10); near(x.lo, 72.2, 0.3, '10/10 lo'); near(x.hi, 100, 0.01, '10/10 hi');
  x = wilson(50, 100); near(x.lo, 40.4, 0.2, '50/100 lo'); near(x.hi, 59.6, 0.2, '50/100 hi');
  x = wilson(13, 20); near(x.lo, 43.3, 0.3, '13/20 lo'); near(x.hi, 81.9, 0.3, '13/20 hi');
  ok(fmtRate(4, 6) === '67% [30-90] n=6', 'fmt ' + fmtRate(4, 6));
  /* coverage: simulate binomials, the 95% interval should contain the true p ~95% of the time (seeded LCG) */
  let s = 12345; const rnd = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  for (const [p, n] of [[0.65, 18], [0.5, 30], [0.3, 12]]) { let hit = 0; const T = 4000; for (let t = 0; t < T; t++) { let w = 0; for (let i = 0; i < n; i++) if (rnd() < p) w++; const q = wilson(w, n); if (q.lo / 100 <= p && p <= q.hi / 100) hit++; } near(hit / T, 0.95, 0.03, 'coverage p=' + p + ' n=' + n); }
  /* verdicts */
  ok(bandVerdict(0, 12, [60, 70]).v === 'LOW', 'LOW'); ok(bandVerdict(18, 18, [60, 70]).v === 'HIGH', 'HIGH'); ok(bandVerdict(4, 6, [60, 70]).v === 'UNSURE', 'UNSURE 4/6');
  ok(bandVerdict(4, 6, [60, 70]).note === 'point in band', 'note'); ok(bandVerdict(390, 600, [60, 70]).v === 'IN', 'IN at n=600');
  ok(spansEdge(4, 6, [60, 70]) && !spansEdge(0, 12, [60, 70]), 'spansEdge');
  const rs = runStats([10, 20, 30]); ok(rs.mean === 20 && rs.sd === 10 && rs.se === 5.8, 'runStats ' + JSON.stringify(rs));
  ok(disagree({ mean: 100, se: 5 }, { mean: 130, se: 5 }) && !disagree({ mean: 100, se: 10 }, { mean: 110, se: 10 }), 'disagree');
  console.log(bad ? 'rate-stats selftest FAIL (' + bad + ')' : 'rate-stats selftest ok'); process.exit(bad ? 1 : 0);
}
