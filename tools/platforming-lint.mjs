// tools/platforming-lint.mjs - EVERY LEVEL HAS PLATFORMING SECTIONS (Daniel 10-29, definition approved 10-31, scratch/platforming-audit-1101.md).
// REPORT-ONLY: always exits 0. One row per campaign level; the fix lanes shrink the 0 and 1 rows, then `sections >= 1` becomes a gate.
//
//   node tools/platforming-lint.mjs                 the table, all campaign levels (about 30 s, no browser)
//   node tools/platforming-lint.mjs --where fair    the sections, the 3-4 beat near-misses and the swim runs of one level
//   node tools/platforming-lint.mjs --json=out.json also write the rows as JSON
//   node tools/platforming-lint.mjs --self-test     fixtures: one passing, one failing, one hazard swim
//
// A SECTION = 5+ required beats (gap jump, 2+ row hop, 3+ row drop, ride, climb run, spike, moving/crumbling piece), no two more than 16 route tiles
// apart, 24+ tiles long, no fight/ambush/mini/boss stretch inside, MAIN ROUTE ONLY. A HAZARD SWIM (48+ route tiles of swimming through harm-water, a
// current or spikes, no fight; plain swimming does not) counts too and is shown apart ("swim"). Verdict: 0 = FAIL (report-only), 1 = WARN, 2+ = ok.
// The finder itself is platforming() in tools/pacing.mjs (it reads the route, the strip and the gadget lists that pacing() already builds).
import { writeFileSync } from 'fs';
import { LEVELS, T, TS } from '../src/level.js';
import { ACTS } from '../src/foe-react.js';
import { chainOf } from '../src/campaign-order.js';
import { install } from './node-canvas.mjs'; install();
import { pacing, platforming, PLAT } from './pacing.mjs';

export const LIM = {   /* the numbers are PLAT in pacing.mjs (one source); sectionsMin gates later, sectionsWant stays a WARN */
  ...PLAT,   // beats 5 (one or two jumps is a step, five is a stretch with a beginning, middle and end; the Mage's Folly runs 5-9), gap 16 (<3 s of running), minLen 24 (one screen), swimLen 48 (6 route stretches)
  sectionsMin: 1, sectionsWant: 2,
};
const verdict = n => n >= LIM.sectionsWant ? '2+' : String(n);
const fmt = s => (s.type === 'swim' ? 'swim ' + s.len + 't' : s.beats + 'b/' + s.len + 't') + ' x' + s.from[0] + (s.from[1] !== s.to[1] ? ',y' + s.from[1] : '') + '-' + s.to[0] + (s.from[1] !== s.to[1] ? ',y' + s.to[1] : '') + ' ' + s.pct[0] + '-' + s.pct[1] + '%';

/* ---------- FIXTURES (a synthetic pacing() result, no level build) ---------- */
function fixture(kindOf, o = {}) {   // kindOf(i) -> step kind; a route of 80 steps, 5 tiles apart on one row; a footing gap before every 'jump'
  const W = 500, H = 30, n = 80, pts = [], cum = [0], kind = [], foot = new Uint8Array(W * H);
  for (let x = 0; x < W; x++) foot[20 * W + x] = 1;
  for (let i = 0; i < n; i++) { pts.push([i * 5, 20]); kind.push(i ? kindOf(i) : 'start'); if (i) cum.push(cum[i - 1] + 5); }
  for (let i = 1; i < n; i++) if (kind[i] === 'jump') for (let x = pts[i - 1][0] + 1; x < pts[i][0]; x++) foot[20 * W + x] = 0;
  const strip = Array.from({ length: Math.ceil(cum[n - 1] / 8) + 1 }, (_, b) => (o.fight && b >= o.fight[0] && b <= o.fight[1]) ? 'F' : '.').join('');
  return { id: 'fixture', name: 'fixture', W, H, tall: false, strip, route: pts, cum, kind, foot, spikeSeen: [], Lref: { pools: o.pools || [], ents: [] } };
}
function selfTest() {
  let bad = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
  const jumps = (a, b) => i => (i >= a && i <= b ? 'jump' : 'walk');
  const pass = platforming(fixture(jumps(10, 16)));          // 7 gap jumps 5 tiles apart: one section of 7
  ok(pass.jumpSections === 1 && pass.sections[0].beats === 7 && pass.sections[0].len >= LIM.minLen, 'passing: 7 gap jumps in a row = 1 section of 7 beats (' + pass.sections.map(fmt) + ')');
  const few = platforming(fixture(jumps(10, 13)));           // 4 beats: a ledge, not a section
  ok(few.jumpSections === 0 && few.nearMiss.length === 1, 'failing: 4 beats = no section, listed as a near-miss');
  const fought = platforming(fixture(jumps(10, 16), { fight: [8, 10] }));   // a fight stretch in the middle of the same 7 jumps
  ok(fought.jumpSections === 0, 'failing: a fight stretch inside the 7 jumps breaks it (' + fought.jumpSections + ' sections)');
  const far = platforming(fixture(i => (i >= 10 && i <= 15 || i >= 50 && i <= 55) ? 'jump' : 'walk'));
  ok(far.jumpSections === 2, 'two clumps 40 tiles apart = 2 sections (' + far.jumpSections + ')');
  const swimPool = [{ x0: 0, x1: 500 * TS, y: 19 * TS, swim: true, harm: true, bottom: 24 * TS }];
  const swim = platforming(fixture(i => (i >= 10 && i <= 30 ? 'swim' : 'walk'), { pools: swimPool }));   // 20 steps x 5 = 100 tiles of hazard swim
  ok(swim.swimSections === 1 && swim.jumpSections === 0 && swim.sections.length === 1, 'swim: 100 tiles of harm-water swim = 1 hazard-swim section');
  const plain = platforming(fixture(i => (i >= 10 && i <= 30 ? 'swim' : 'walk'), { pools: [{ x0: 0, x1: 500 * TS, y: 19 * TS, swim: true, bottom: 24 * TS }] }));
  ok(plain.sections.length === 0 && plain.plainSwims === 1, 'swim: the same swim with no harm/current/spike does NOT count (plain swim)');
  const swimFight = platforming(fixture(i => (i >= 10 && i <= 30 ? 'swim' : 'walk'), { pools: swimPool, fight: [9, 14] }));
  ok(swimFight.swimSections === 0, 'swim: a fight stretch in the swim cuts it below the length (' + swimFight.swimSections + ')');
  return bad;
}

const args = process.argv.slice(2);
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  if (args.includes('--self-test')) { const bad = selfTest(); console.log(bad ? 'platforming-lint self-test: ' + bad + ' FAILED' : 'platforming-lint self-test: all ok'); process.exit(bad ? 1 : 0); }
  const wi = args.indexOf('--where'), where = wi >= 0 ? args[wi + 1] : null;
  const jsonOut = (args.find(a => a.startsWith('--json=')) || '').slice(7);
  const chain = chainOf(LEVELS), ord = chain.order, actOf = id => (ACTS.find(a => a.levels.includes(id)) || {}).act || 0;
  const rows = [];
  for (const lv of LEVELS) {
    const act = actOf(lv.id); if (!act) continue; if (where && lv.id !== where) continue;
    try { const r = pacing(lv); const p = platforming(r); rows.push({ id: lv.id, name: lv.name, act, idx: ord.indexOf(lv.id), ...p }); }
    catch (e) { rows.push({ id: lv.id, name: lv.name, act, idx: ord.indexOf(lv.id), error: e.message, sections: [], jumpSections: 0, swimSections: 0, nearMiss: [] }); }
  }
  rows.sort((a, b) => a.act - b.act || a.idx - b.idx);
  console.log('PLATFORMING LINT (REPORT-ONLY): section = ' + LIM.beats + '+ beats, <= ' + LIM.gap + ' route tiles apart, >= ' + LIM.minLen + ' tiles long, no fight inside, main route; hazard swim = ' + LIM.swimLen + '+ tiles through harm-water/current/spikes, no fight. Want ' + LIM.sectionsMin + ', ideally ' + LIM.sectionsWant + '.\n');
  if (where) {
    for (const r of rows) {
      console.log(r.id + ' ' + r.name + (r.error ? '  ERROR ' + r.error : '') + '  sections ' + r.sections.length + ' (jump ' + r.jumpSections + ', hazard swim ' + r.swimSections + '), ' + r.nBeats + ' beats on open route, ' + r.underFire + ' events under fire, plain swims ' + r.plainSwims + ', route ' + r.total + ' tiles');
      for (const s of r.sections) console.log('  SECTION  ' + fmt(s));
      for (const s of r.nearMiss) console.log('  near-miss ' + fmt(s) + '  (join these)');
    }
    process.exit(0);
  }
  console.log('act  id              sections  jump swim  longest              verdict   open/fire   where');
  const tally = { 0: 0, 1: 0, '2+': 0 }, tallyJump = { 0: 0, 1: 0, '2+': 0 };
  for (const r of rows) {
    const n = r.sections.length, v = verdict(n); tally[v]++; tallyJump[verdict(r.jumpSections)]++;
    const lg = r.sections.reduce((m, s) => (s.len > (m ? m.len : -1) ? s : m), null);
    console.log(('A' + r.act).padEnd(5) + r.id.padEnd(16) + String(n).padStart(4) + String(r.jumpSections).padStart(8) + String(r.swimSections).padStart(5) + '  ' + (lg ? (lg.type === 'swim' ? 'swim ' + lg.len + 't' : lg.beats + 'b/' + lg.len + 't') : '-').padEnd(20) + (v === '0' ? 'FAIL(rpt)' : v === '1' ? 'WARN' : 'ok').padEnd(10) + (String(r.nBeats) + '/' + r.underFire).padEnd(12) + (r.error ? 'ERROR ' + r.error : r.sections.map(s => (s.type === 'swim' ? '[swim ' : '[') + 'x' + s.from[0] + '-' + s.to[0] + ' ' + s.pct[0] + '-' + s.pct[1] + '%]').join(' ')));
  }
  console.log('\nLEVELS WITH 0 / 1 / 2+ SECTIONS (hazard swims counted): ' + tally[0] + ' / ' + tally[1] + ' / ' + tally['2+'] + '   of ' + rows.length);
  console.log('(jump sections only, swims not counted):                ' + tallyJump[0] + ' / ' + tallyJump[1] + ' / ' + tallyJump['2+']);
  console.log('0 sections: ' + rows.filter(r => !r.sections.length).map(r => r.id).join(' '));
  console.log('1 section : ' + rows.filter(r => r.sections.length === 1).map(r => r.id).join(' '));
  if (jsonOut) { writeFileSync(jsonOut, JSON.stringify(rows)); console.log('wrote ' + jsonOut); }
  process.exit(0);
}
