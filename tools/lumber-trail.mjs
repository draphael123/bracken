// tools/lumber-trail.mjs - THE LUMBER TRAIL's BEATS (claude/lumbertrail; scratch/brief-first2.md sec.1, scratch/review-first2.md). Node only, no page.
// BRACKEN WOOD (level id 'wood', the game's FIRST level) became one felled-timber trail. This pins what the rework is FOR, so a later merge cannot quietly lose it:
//   A  THE VERB IN MINUTE ONE: the first marked pine stands within the first 40 columns, a sign naming the woodsman's mark and the four strokes before it, and
//      the rule line (one sentence) says what main.js does: a marked pine falls the way it leans.
//   B  THREE DIFFERENT FELLS: a BRIDGE (level trunk), a LEAN-TO (a ramp UP onto a ledge) and a DROP (a ramp DOWN with foes under its line) - and the required ones
//      are LOCKS: with that one pine left standing the reach fill (src/reachcore.js) does not get past it; felled, it does. The drop is optional (the gate is
//      reached without it) and has at least two foes under its line (a fight during the rule, A5).
//   C  GUIDES ON EVERY REQUIRED VERB (A6): each required pine has a stuck-spot glint that is done when it is felled; the first moving platform (the log raft) has a
//      sign at its landing and a glint.
//   D  THE LESSONS ARE THE TRAIL's WORK, NOT BAYS: the heavy, down and parry lesson stretches stand on the trail's ground; ONE sign teaches the down attack (the
//      plunge and the ground slam were two signs 26 columns apart); the rising cut is taught on the wasp stretch (a wasp within reach of its sign); the old
//      lesson-bay clones (a 26-column flat with a stump, a fern and one foe) are gone.
//   E  FIVE NAMED AREAS + the clearing, a shrine closing each area (A10c: one in the last 12 columns of each), and one before the boss door.
//   F  THE QUEEN KEEPS HER NUMBERS: her clearing is the old one to the column relative to its gate (her 200 hp in main.js EHP), and her west-wall pine stands at
//      comb height inside the vines - the pine her comb hangs from.
//   G  THE FELLING CODE: main.js lays a pine through src/felling.js (on the fall and from the save's marks), the ranger's arrow strikes a trunk, every hero's
//      stroke is drawn (the lean, the tally, the line it will lie along), and the fall's lines are hint-box lines (src/hint-lines.js).
//   node tools/lumber-trail.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { STUCK } from '../src/stuck-spots.js';
import { fellRamp, fellCells, underTrunk, rampYAt } from '../src/felling.js';
import { SECTIONS, FELLS, GATE_COL } from '../src/lumber-trail.js';
import { isCallout } from '../src/hint-lines.js';

let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'wood'); ok(lv, 'the wood is in LEVELS');
const L = lv.build(), TS = 16, W = L.W;
const ents = L.ents, signs = ents.filter(e => e.t === 'sign'), pines = ents.filter(e => e.t === 'felltree');
const pine = role => pines.find(e => e.role === role);

/* ---- A. the verb in minute one ---- */
ok(lv.name === 'THE LUMBER TRAIL' && !lv.needs, 'level 1 is THE LUMBER TRAIL, with no needs (the first level)');
ok(/FELL/.test(lv.rule) && /LEANS/.test(lv.rule) && (lv.rule.match(/\./g) || []).length === 1, 'the rule line is one sentence and names the fell and the lean: ' + lv.rule);
const first = pines.slice().sort((a, b) => a.x - b.x)[0];
ok(first && first.role === 'gully' && first.x <= 40 && first.mark, 'the first marked pine stands in the first 40 columns (minute one), at the cabin gully');
ok(signs.some(s => s.x < first.x && s.x >= first.x - 12 && /MARK/.test(s.text) && /FOUR STROKES/.test(s.text)), 'a sign by the cabin names the woodsman\'s mark and the four strokes, before the first pine');

/* ---- B. three different fells, the required ones locks ---- */
const g = pine('gully'), lt = pine('leanto'), dr = pine('drop'), tn = pine('tarn');
ok(g && !g.head && tn && !tn.head, 'the gully and the tarn pines lie LEVEL: bridges');
const lr = lt && fellRamp(lt); ok(lr && lr.head[1] < lt.y + 1 - 3, 'the camp pine lies as a LEAN-TO: a ramp up at least four rows onto the cliff');
const dRamp = dr && fellRamp(dr); ok(dr && dr.drop && dRamp && dRamp.head[1] > dr.y + 1 + 3, 'the ridge pine is a DROP: a ramp down at least four rows over the hollow');
ok(pines.filter(p => p.mark).length >= 4 && pines.every(p => p.mark || p.role === 'hive'), 'every trail pine carries the woodsman\'s mark (the arena pine is the Queen\'s)');
const gate = ents.find(e => e.t === 'gate'); ok(gate && gate.x === GATE_COL, 'the hive gate stands at ' + GATE_COL);
const reachGate = (without) => { const L2 = { ...L, ents: ents.filter(e => e !== without) }; return floodReach(L2, T, { rides: true }).jumpNear(gate.x, gate.y); };
ok(reachGate(null), 'with every pine down the reach fill gets to the hive gate');
for (const p of [g, lt, tn]) ok(p.req && !reachGate(p), 'the ' + p.role + ' pine is a LOCK: left standing, the reach fill does not get past it');
ok(!dr.req && reachGate(dr), 'the drop is optional: the gate is reached without it');
const under = ents.filter(e => !['sign', 'coin', 'deco', 'check', 'felltree', 'silver', 'vault', 'cage'].includes(e.t) && underTrunk(dr, e.x * TS + 8, (e.y + 1) * TS));
ok(under.length >= 2, 'at least two foes stand under the drop\'s line (a fight during the rule): ' + under.map(e => e.t + '@' + e.x).join(' '));
for (const p of [g, lt, dr, tn]) ok(fellCells(p, L.grid, W, T).length >= 6, 'the ' + p.role + ' pine lays a trunk of at least six cells');

/* ---- C. guides on every required verb, the first ride signed ---- */
const spots = STUCK.wood || [];
for (const p of [g, lt, tn]) ok(spots.some(s => s.done && s.done[0] === 'felltree' && s.done[1] === p.x && s.done[2] === p.y && s.zone[0] <= p.x && s.zone[2] >= p.x - 1), 'the ' + p.role + ' pine has a glint + stall nudge, done when it is felled');
const raft = ents.filter(e => e.t === 'mover').sort((a, b) => a.x - b.x)[0];
ok(raft && raft.x < 200, 'the first moving platform (the log raft) is on the trail before column 200');
ok(signs.some(s => Math.abs(s.x - raft.x) <= 4 && /RAFT/.test(s.text) && /RIDE/.test(s.text)), 'the first moving platform is SIGNED at its landing');
ok(spots.some(s => (s.ats || []).some(([x]) => Math.abs(x - raft.x) <= 2)), 'the raft has a glint');

/* ---- D. the lessons are the trail's work ---- */
for (const k of ['heavyblow', 'down', 'parry']) ok((L.lessons || []).some(z => z.kind === k), 'the ' + k + ' lesson stretch is on the trail');
ok(signs.filter(s => /DOWN\+X/.test(s.text)).length === 1, 'ONE sign teaches the down attack (the plunge and the ground slam on one sign)');
const rise = signs.find(s => /UP\+X/.test(s.text) && /RISING CUT/.test(s.text));
ok(rise && ents.some(e => e.t === 'wasp' && Math.abs(e.x - rise.x) <= 12), 'the rising cut is taught on the wasp stretch (a wasp within 12 columns of its sign)');
const par = (L.lessons || []).find(z => z.kind === 'parry');
ok(signs.some(s => s.x >= par.x0 && s.x <= par.x1 && /RIPOSTE/.test(s.text)) && ents.some(e => e.t === 'swornsword' && e.lesson === 'parry' && e.x >= par.x0 && e.x <= par.x1), 'the parry is the camp gate\'s sworn sword, its sign in the stretch');
const flatBay = z => { let flat = true; for (let x = z.x0; x <= z.x1; x++) if (L.grid[22 * W + x] !== T.SOLID || L.grid[21 * W + x] !== T.AIR) flat = false; return flat && z.x1 - z.x0 >= 20; };
ok(!(L.lessons || []).some(flatBay), 'no lesson is a cloned 26-column flat bay on the old row-22 floor');
ok(!signs.some(s => /^C BLOCKS AND STAGGERS/.test(s.text)), 'the duplicate C-blocks sign (superseded by the parry lesson) is cut');

/* ---- E. named areas and shrines ---- */
ok(SECTIONS.length === 6 && L.sections && L.sections.length === 6, 'six named areas (five + the clearing) in L.sections');
const checks = ents.filter(e => e.t === 'check');
for (const [name, , x1] of SECTIONS.slice(0, 5)) ok(checks.some(c => c.x <= x1 && c.x >= x1 - 12), 'a shrine closes ' + name + ' (in its last 12 columns)');
ok(checks.some(c => c.x < GATE_COL && c.x >= GATE_COL - 8), 'a shrine stands before the boss door');
for (const [name, x0] of SECTIONS.slice(1, 5)) ok(signs.some(s => s.x >= x0 - 8 && s.x <= x0 + 14), name + ' opens with a sign at its point of use');

/* ---- F. the Queen keeps her numbers ---- */
const A = L.arena;
ok(A.boss === 'queen' && A.x0 / TS === GATE_COL + 4 && A.x1 / TS === GATE_COL + 37 && A.floor / TS === 9 && A.trigger / TS === GATE_COL + 8 && A.wallL === GATE_COL + 3 && A.wallR === GATE_COL + 37, 'the Queen\'s clearing is the old one to the column, relative to its gate');
const q = ents.find(e => e.t === 'queen'); ok(q && q.x === GATE_COL + 20 && q.y === 3, 'the Queen sleeps where she did');
const hp = pine('hive'); ok(hp && hp.x === GATE_COL + 5 && hp.y === 6 && hp.len === 10 && !hp.head, 'her west-wall pine (the one her comb hangs from) stands at comb height inside the vines');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/[^a-z]queen: 200[,\s]/.test(main), 'the Queen\'s health is 200 (EHP), as tuned to 67% with flasks');

/* ---- G. the felling code ---- */
ok(/import \{ fellCells, fellRamp, underTrunk, FELL_STROKES \} from '\.\/felling\.js'/.test(main), 'main.js lays a pine through src/felling.js');
ok(/marks\.has\('tree:' \+ e\.x\)\) for \(const \[x, y, t\] of fellCells\(e,/.test(main) && /function fellLay\(pr\) \{ for \(const \[x, y, t\] of fellCells\(/.test(main), 'the fall and the save\'s marks lay the same cells');
ok(/P\.rgArrows \|\| \[\]\)\.find\(a => a\.state === 'fly'/.test(main.slice(main.indexOf("if (pr.t === 'felltree' && !pr.felled)"))), 'the ranger\'s arrow strikes a marked pine (every hero can fell)');
ok(/function fellStroke\(pr\) \{ pr\.hp--; pr\.lean =/.test(main) && /SFX\.creak\(\)/.test(main.slice(main.indexOf('function fellStroke('), main.indexOf('function fellLay('))), 'a stroke creaks and leans the pine');
ok(/function drawFellLine\(/.test(main) && /the stroke tally/.test(main), 'the line it will lie along and the stroke tally are drawn (A3)');
ok(/rampFoot\(prevY\)/.test(main) && /L\.fellRamps/.test(main) && L.fellRamps === true, 'a lean-to and a drop are walked as ramps (main.js rampFoot reads the felled pines)');
for (const s of ['THE PINE CREAKS AND LEANS', 'THE PINE FALLS: A BRIDGE', 'THE PINE FALLS: A WAY UP', 'TIMBER: IT CRUSHES WHAT STOOD UNDER IT']) ok(isCallout(s), 'the hint box says: ' + s);
ok(Math.abs(rampYAt(lr, lr.foot[0] * TS) - lr.foot[1] * TS) < 1, 'a ramp starts at its foot');

console.log('lumber-trail: ' + n + ' checks - the verb in minute one, three fells (bridge, lean-to, drop; the bridges and the lean-to locks), guides, the lessons as work, five areas and their shrines, the Queen kept, the felling drawn.');
