/* tools/rule-fights.mjs - THE LEVEL-SIDE CHECKS OF THE COMBAT PASS, PART 2, as a campaign report (claude/combat2). The measures live in tools/rule-state.mjs
   (imported by tools/level-quality.mjs as two REPORT-ONLY rows). Lists the levels that miss (a) FIGHT DURING THE RULE and (b) THE MEASURED CURVE.
     node tools/rule-fights.mjs */
import { ACTS, actOf } from '../src/foe-react.js';
import { RULE, curveVerdict } from './rule-state.mjs';
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const { LEVELS } = await import('../src/level.js'), { measure, levelHash } = await import('./level-quality.mjs'), { depthsOf } = await import('../src/campaign-order.js');
  const depth = depthsOf(LEVELS), camp = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id)), missA = [], noData = [], missB = [], byAct = new Map();
  console.log('THE COMBAT PASS, PART 2 - level-side checks (REPORT-ONLY)\n\nlevel        act  (a) fights during the rule                          (b) level-1 knight curve');
  for (const d of camp.sort((a, b) => (depth[a.id] ?? 99) - (depth[b.id] ?? 99))) { let m; try { m = measure(d); } catch (e) { console.log(d.id + ': ' + e.message); continue; }
    const a = m.ruleFight, b = curveVerdict(d.id, levelHash(d), depth[d.id]);
    if (!a.data) noData.push(d.id); else if (!a.ok) missA.push(d.id + ' (' + a.n + ')'); if (!b.ok) missB.push(d.id + ' (' + b.state + (b.lost !== undefined ? ' ' + b.lost + '%/' + b.deaths + 'd' : '') + ')');
    if (b.lost !== undefined && b.state !== 'stale') { const l = byAct.get(b.act) || []; l.push(b.lost); byAct.set(b.act, l); }
    console.log(d.id.padEnd(13) + String(actOf(d.id, depth[d.id]).act).padEnd(5) + (a.data ? (a.ok ? 'ok   ' : 'MISS ') + a.n + '/' + a.of : 'no rule data').padEnd(52) + (b.ok ? 'ok   ' : (b.state === 'out' ? 'OUT  ' : b.state.toUpperCase() + ' ')) + (b.lost !== undefined ? b.lost + '% / ' + b.deaths + 'd' : '')); }
  const med = l => { const s = [...l].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; }, meds = ACTS.map(a => [a.act, med(byAct.get(a.act) || [])]);
  const rising = meds.filter(([, v]) => v !== null).every(([, v], i, arr) => i === 0 || v >= arr[i - 1][1]);
  console.log('\n(a) MISS (fewer than ' + RULE.min + ' designed encounters where the rule is active): ' + (missA.join(', ') || 'none'));
  console.log('(a) the rule state is not in the level data: ' + (noData.join(', ') || 'none'));
  console.log('(b) out of the act band / not measured: ' + (missB.join(', ') || 'none'));
  console.log('(b) median health lost a run by act: ' + meds.map(([a, v]) => 'act ' + a + ' ' + (v === null ? '-' : v + '%')).join(', ') + (rising ? ' - RISES' : ' - DOES NOT RISE'));
}
