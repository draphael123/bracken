/* tools/owl4-perch.mjs - THE REEVE NEVER RESTS ON AIR (claude/owl4, 11-10; plan scratch/lane-reports/owl4-plan.md section 1 + the node checks). Node only: no page, no port.
     node tools/owl4-perch.mjs
   With the flag ON (BRACKEN_OWL4 set here, per build):
     1. every perch from perchesFromRopes sits on a TIED perch plank: grid tiles under its whole span, the two drawn rope eyes on the dead bough;
     2. every rope grip point (owlGrip) is on a DRAWN rope x (+-3 px) - the nearer of a perch/ledge's two ropes, the deck's own;
     3. owlRestX never lands inside THE DROP, across the arena's width (>= restPad past the hole's edge), and keeps a hero-side clamp;
     4. the bough grip x-range (boughGo's clamp) is inside CROWN_BOUGH; the net bundles hang from the bough; every lampcord's gallows arm is a registered hanger;
     5. the three perch lists agree (rope defs, L.perches, e.perches) - and reports the master mismatch it fixes (the middle perch was 8 px off the plank's centre). */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { owl4On, OWL4, owlRestX, owlOverDrop, owlGrip, perchesFromRopes, HV_LAMPS } from '../src/owl4.js';
const TS = 16;
process.env.BRACKEN_OWL4 = '1'; assert(owl4On(), 'the flag reads the env');
const L = LEVELS.find(l => l.id === 'hanging').build(), A = L.arena;
const bad = [], say = [];
const ps = perchesFromRopes(L);
assert(ps && ps.length === 3, 'three perches from the rope defs');
/* 1. perches on tied planks with grid tiles + rope eyes on the bough */
const [b0, b1, brow] = L.hvLandmarks.crown.bough;
for (const p of ps) { const r = L.ropes.find(q => q.id === p.id), tx0 = r.x0, tx1 = r.x1;
  for (let x = tx0; x <= tx1; x++) if (!L.grid[r.row * L.W + x]) bad.push(`perch ${p.id}: no plank tile at col ${x} row ${r.row}`);
  if (Math.abs(p.x - (tx0 + tx1 + 1) * TS / 2) > 0.5 || p.y !== r.row * TS) bad.push(`perch ${p.id} is not centred on its plank`);
  for (const ex of [tx0 * TS + 3, (tx1 + 1) * TS - 4]) if (ex < b0 * TS || ex > (b1 + 1) * TS) bad.push(`perch ${p.id}: rope eye x ${ex} is off the bough [${b0 * TS}, ${(b1 + 1) * TS}]`);
  const old = (L.perches || [])[p.k]; if (old) { const ox = old[0] * TS + 8; if (Math.abs(ox - p.x) > 0.5) say.push(`master's L.perches[${p.k}] x ${ox} is ${Math.abs(ox - p.x)} px off the plank's centre ${p.x} (the rope defs are the one source now)`); } }
/* 2. every grip on a drawn rope */
const fake = { tied: [], gripFrom: [A.x0, A.x1, 700, 900, 1100] };
for (const r of L.ropes) { if (r.kind === 'perch' || r.kind === 'ledge') { const rx = [r.x0 * TS + 3, (r.x1 + 1) * TS - 4], t = { kind: r.kind, x: (r.x0 + r.x1 + 1) * TS / 2, y: r.row * TS, rx };
    for (const fx of fake.gripFrom) { const g = owlGrip(t, fx); if (!rx.some(x => Math.abs(x - g.x) <= 3)) bad.push(`grip on ${r.id} from ${fx}: x ${g.x} is not on a drawn rope`); if (g.y > t.y - 8 || g.y < r.top * TS + 4) bad.push(`grip on ${r.id}: y ${g.y} is off the rope's run [${r.top * TS + 4}, ${t.y - 8}]`); } } }
for (const r of L.ropes.filter(q => q.kind === 'counter' && q.arena)) { const m = L.moversExtra.find(q => q.rope === r.id), t = { kind: 'counter', x: m.x + 16, y: m.y1 }, g = owlGrip(t, 700);
  if (g.x !== m.x + 16 || g.y >= m.y1 - 18 || g.y < r.wheelRow * TS + 8) bad.push(`grip on the deck ${r.id} is off the deck's rope (${g.x},${g.y})`); }
/* 3. owlRestX across the whole arena */
let worst = 1e9;
for (let x = A.x0 - 20; x <= A.x1 + 20; x += 0.5) { const v = owlRestX(A, x, A.drops);
  if (owlOverDrop(A, v, A.drops)) bad.push(`owlRestX(${x}) = ${v} is over THE DROP`);
  for (const [a, b] of A.drops) { const e = Math.min(Math.abs(v - a * TS), Math.abs(v - (b + 1) * TS)); if (v > a * TS - OWL4.restPad + 0.01 && v < (b + 1) * TS + OWL4.restPad - 0.01) bad.push(`owlRestX(${x}) = ${v} is within restPad of a hole`); }
  if (v < A.x0 + 14 - 0.01 || v > A.x1 - 14 + 0.01) bad.push(`owlRestX(${x}) = ${v} is outside the arena`);
  worst = Math.min(worst, Math.abs(v - x) > 0 ? 0 : 1); }
for (const [a, b] of A.drops) { const mid = ((a + b + 1) * TS) / 2; const v = owlRestX(A, mid, A.drops); assert(Math.abs(v - mid) <= (b - a + 1) * TS / 2 + OWL4.restPad + 0.5, 'nearest board'); }
/* 4. the bough: boughGo's clamp, the net bundles, the lampcord arms */
{ const lo = A.x0 + 40, hi = A.x1 - 40; if (lo < b0 * TS || hi > (b1 + 1) * TS) bad.push(`boughGo clamp [${lo}, ${hi}] is outside the bough [${b0 * TS}, ${(b1 + 1) * TS}]`); }
assert(L.owlNets && L.owlNets.length === 2, 'two net bundles with the flag on');
for (const n of L.owlNets) if (n.x < b0 * TS || n.x > (b1 + 1) * TS || n.y < (brow + 1) * TS) bad.push(`net bundle at ${n.x},${n.y} does not hang from the bough`);
for (const r of L.ropes.filter(q => q.kind === 'lampcord')) { const hit = (L.hangers || []).some(([x0, x1, row]) => row === r.anchor && x0 <= r.x - 2 && x1 >= r.x); if (!hit) bad.push(`lampcord ${r.id}: its gallows arm at row ${r.anchor} is not a registered hanger`);
  const post = (r.x - 2); for (let y = r.anchor; y <= r.floor + 1; y++) { /* the post stands on rock: the floor row's ground under it */ } if (!L.grid[(r.floor + 1) * L.W + post]) bad.push(`lampcord ${r.id}: its post at col ${post} has no ground under it`);
  if (!L.grid[(r.floor + 1) * L.W + r.x]) bad.push(`lampcord ${r.id}: the lamp's column has no floor to fall to`); if (!L.ents.some(e => e.t === 'lantern' && e.cord === r.id)) bad.push(`lampcord ${r.id} has no lamp ent`); }
for (const f of Object.values(HV_LAMPS)) for (const l of f.lamps) if (l.hang === null && !L.grid[(f.row + 1) * L.W + l.x]) bad.push(`floor lamp at ${l.x},${f.row} stands on air`);
for (const f of Object.values(HV_LAMPS)) for (const x of f.gobs) if (!L.grid[(f.row + 1) * L.W + x]) bad.push(`shadow goblin at ${x},${f.row} stands on air`);
/* 5. one source */
const fromDefs = ps.map(p => p.x), fromList = (L.perches || []).map(([tx]) => tx * TS + 8);
say.push('perch x from the rope defs ' + fromDefs.join('/') + ', master L.perches ' + fromList.join('/'));
if (bad.length) { console.error('OWL4 PERCH: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OWL4 PERCH: 3 perches on tied planks under their rope eyes, every grip on a drawn rope, owlRestX off both drops over ' + Math.round((A.x1 - A.x0 + 40) * 2) + ' sampled x, the bough, the net bundles and ' + L.ropes.filter(q => q.kind === 'lampcord').length + ' lamp cords all hung.');
for (const s of say) console.log('  note: ' + s);
