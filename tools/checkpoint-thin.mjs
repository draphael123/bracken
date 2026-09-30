/* tools/checkpoint-thin.mjs - PICKS THE CHECKPOINTS EACH LEVEL KEEPS (claude/checkpoints, 2026-09-29; Daniel: "too many checkpoints is part of the problem").
   node tools/checkpoint-thin.mjs            print the plan for every level (what would be dropped)
   node tools/checkpoint-thin.mjs --write    rewrite src/checkpoint-thin.js
   Builds each level with every checkpoint standing (THIN.off), walks its main route (tools/pacing.mjs) and keeps the FEWEST that
   leave no run longer than PICK_MAX route tiles, never two non-door ones closer than MIN, and ALWAYS the last one before each boss, mini or ambush
   room (the door checkpoint). Ties go to the most even spacing. A checkpoint off the route is dropped (it held no run), unless a door needs it. */
import fs from 'node:fs';
import { THIN, CHECK_PIN } from '../src/checkpoint-thin.js';
import { MIN, arenaOutside } from './checkpoint-rule.mjs';
THIN.off = true;
const { LEVELS } = await import('../src/level.js');
const { pacing } = await import('./pacing.mjs');
export const PICK_MAX = 175, IDEAL = 145;   /* the picker aims under the rule's ceiling (MAX 200, Daniel 2026-09-30; it was 150 under 175) so the walk can differ a little */
export function pick(r, id, L) {
  const s = r.stats, end = s.endAt, pinned = (CHECK_PIN[id] || []), cands = s.checkList.filter(c => c.at !== null && (c.at > 0 || pinned.some(([x, y]) => x === c.x && y === c.y)) && c.at <= end + 30).map(c => ({ ...c, at: Math.min(c.at, end) })).sort((a, b) => a.at - b.at);
  const prot = new Set(); const need = [];
  /* WHAT STAYS BECAUSE THE LEVEL NEEDS IT WHERE IT STANDS: a pinned one (src/checkpoint-thin.js CHECK_PIN, with the tool that pins it) and the one just outside the arena (B6) */
  for (const [x, y] of CHECK_PIN[id] || []) { const c = cands.find(q => q.x === x && q.y === y); if (c) prot.add(c); else need.push('pinned checkpoint ' + x + ',' + y + ' is not on the route or not built'); }
  for (const e of arenaOutside(L)) { const c = cands.find(q => q.x === e.x && q.y === e.y); if (c) prot.add(c); else need.push('the checkpoint outside the arena (' + e.x + ',' + e.y + ') is off the route'); }
  for (const d0 of s.doors) { const d = d0.at === null && d0.c === 'B' ? { ...d0, at: end } : d0; if (d.at === null) continue; const before = cands.filter(c => c.at <= d.at); if (!before.length) { need.push(d.c + (d.name ? ' ' + d.name : '') + ' door at route ' + d.at + ': no checkpoint before it'); continue; }
    const c = before[before.length - 1]; if (d.at - c.at > PICK_MAX) need.push(d.c + ' door at route ' + d.at + ': nearest checkpoint ' + (d.at - c.at) + ' back'); prot.add(c); }
  const nodes = [{ at: 0, start: true }, ...cands.map(c => ({ ...c, prot: prot.has(c) })), { at: end, end: true }];
  const n = nodes.length, dp = Array(n).fill(Infinity), from = Array(n).fill(-1); dp[0] = 0;
  for (let j = 1; j < n; j++) {
    let lastForced = 0; for (let k = 1; k < j; k++) if (nodes[k].prot) lastForced = k;
    for (let i = lastForced; i < j; i++) { if (dp[i] === Infinity) continue; const g = nodes[j].at - nodes[i].at; let c = dp[i];
      if (g > PICK_MAX) c += 1e6 + (g - PICK_MAX) * 100;   /* infeasible: allowed only so a level with a hole is still reported */
      const door = nodes[i].prot || nodes[j].prot || nodes[i].start || nodes[j].end; if (!door && g < MIN) continue;
      if (g < MIN && (nodes[i].prot || nodes[j].prot) && !nodes[i].start && !nodes[j].end) c += 400;   /* two shrines close: allowed for a door, but dear */
      if (!nodes[j].end) c += 1000; c += (g - IDEAL) * (g - IDEAL) / 100;
      if (c < dp[j]) { dp[j] = c; from[j] = i; } } }
  const keep = []; for (let j = n - 1; j > 0; j = from[j]) { if (from[j] < 0) return null; if (!nodes[j].end) keep.push(nodes[j]); }
  keep.reverse(); const isProt = k => nodes.some(nn => nn.prot && nn.x === k.x && nn.y === k.y); for (let i = 1; i < nodes.length; i++) if (nodes[i].at - nodes[i - 1].at > PICK_MAX) { /* reported by the caller from the kept list */ } return { keep, isProt, drop: s.checkList.filter(c => !keep.some(k => k.x === c.x && k.y === c.y)), need, prot };
}
const write = process.argv.includes('--write'); const out = {}; let before = 0, after = 0;
const done = [];
for (const lv of LEVELS) { if (lv.hidden && !lv.secret) continue; let r; try { r = pacing(lv); } catch (e) { console.log(lv.id + ' could not be measured: ' + e.message); continue; }
  const p = pick(r, lv.id, lv.build()); if (!p) { console.log(lv.id + ' no feasible pick'); continue; }
  done.push(lv.id); before += r.stats.checksTotal; after += p.keep.length; if (p.drop.length) out[lv.id] = p.drop.map(c => [c.x, c.y]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const at = [0, ...p.keep.map(k => k.at), r.stats.endAt]; let mg = 0; for (let i = 1; i < at.length; i++) { mg = Math.max(mg, at[i] - at[i - 1]); if (at[i] - at[i - 1] > PICK_MAX) p.need.push('a run of ' + (at[i] - at[i - 1]) + ' from route ' + at[i - 1]); }
  console.log(lv.id.padEnd(12), 'route', String(r.stats.routeTiles).padStart(5), 'checks', String(r.stats.checksTotal).padStart(2), '->', String(p.keep.length).padStart(2), 'worst', String(mg).padStart(3), 'at', p.keep.map(k => k.at + (p.isProt(k) ? '*' : '')).join(','), p.need.length ? '  NEEDS: ' + p.need.join('; ') : '');
}
console.log('total checkpoints ' + before + ' -> ' + after);
if (write) { const NL = String.fromCharCode(13, 10), body = Object.entries(out).map(([id, l]) => '  ' + id + ': ' + JSON.stringify(l) + ',').join(NL);
  let s = fs.readFileSync('src/checkpoint-thin.js', 'utf8');
  const a = s.indexOf('export const CHECK_DROP'), b = s.length;
  s = s.slice(0, a) + 'export const CHECK_DROP = {' + NL + body + NL + '};' + NL;
  fs.writeFileSync('src/checkpoint-thin.js', s); console.log('wrote src/checkpoint-thin.js'); }
