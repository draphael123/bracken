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
//      plunge and the ground slam were two signs 26 columns apart); the rising cut is taught on the ridge's HIGH foes (kite goblins / pine moths hung over
//      head within reach of its sign - claude/oldtusker: they were wasps); the old
//      lesson-bay clones (a 26-column flat with a stump, a fern and one foe) are gone.
//   E  FIVE NAMED AREAS + the clearing, a shrine closing each area (A10c: one in the last 12 columns of each), and one before the boss door.
//   F  OLD TUSKER (claude/oldtusker, Daniel 10-19 21:42 - he replaced THE HORNET QUEEN, who is parked): THE FELLING CLEARING keeps the old clearing's frame to the
//      column (gate, walls, floor, trigger), with no floating tree and no yellow bridge (no ledge, plank or felltree inside it); four marked pines stand at its
//      edges, two a side, each leaning in over the floor (arena.pines) and inside the walls; OLD TUSKER sleeps in the middle, on his own theme; his hands are wired.
//   H  NO WASPS (Daniel 10-20 07:39): no wasp foe on the trail - the old wasp posts hold on-theme foes (pine moths: the wasp's hover under a moth's skin; kite
//      goblins; crows; boars), no hornet, no hive; the PLUNGE lesson still has its stepping stones over the ford (three pine moths, pogo); the TARN EXAM still has
//      foes over its bridge and a charger on its far bank; and every badger is a BOAR (cnSkin 'boar', the badger's told charge and its plunge-on-the-back lesson).
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
ok(pines.filter(p => p.mark).length >= 4 && pines.every(p => p.mark), 'every trail pine carries the woodsman\'s mark');
const gate = ents.find(e => e.t === 'gate'); ok(gate && gate.x === GATE_COL, 'the clearing\'s gate stands at ' + GATE_COL);
const reachGate = (without) => { const L2 = { ...L, ents: ents.filter(e => e !== without) }; return floodReach(L2, T, { rides: true }).jumpNear(gate.x, gate.y); };
ok(reachGate(null), 'with every pine down the reach fill gets to the clearing\'s gate');
for (const p of [g, lt, tn]) ok(p.req && !reachGate(p), 'the ' + p.role + ' pine is a LOCK: left standing, the reach fill does not get past it');
ok(!dr.req && reachGate(dr), 'the drop is optional: the gate is reached without it');
const under = ents.filter(e => !['sign', 'coin', 'deco', 'check', 'felltree', 'silver', 'vault', 'cage'].includes(e.t) && underTrunk(dr, e.x * TS + 8, (e.y + 1) * TS));
ok(under.length >= 2, 'at least two foes stand under the drop\'s line (a fight during the rule): ' + under.map(e => e.t + '@' + e.x).join(' '));
const st = pine('sett');   /* (the reviewer's gap: no fell from the gully to the camp) the ford's far bank drops a small pine on the crew's hollow by col 160 */
ok(st && st.drop && st.x <= 160 && !st.req && ents.filter(e => !['sign', 'coin', 'deco', 'check', 'felltree'].includes(e.t) && underTrunk(st, e.x * TS + 8, (e.y + 1) * TS)).length >= 2, 'the verb comes back by col 160: a drop over the ford crew (optional, two foes under it)');
for (let i = 1, xs = pines.map(p => p.x).sort((a, b) => a - b); i < xs.length; i++) ok(xs[i] - xs[i - 1] <= 130, 'no stretch of more than 130 columns without a marked pine (' + xs[i - 1] + ' -> ' + xs[i] + ')');
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
const high = e => (e.t === 'kite' || (e.t === 'wasp' && e.cnSkin === 'pinemoth') || e.t === 'crow') && e.y <= rise.y - 3;
ok(rise && ents.filter(e => high(e) && Math.abs(e.x - rise.x) <= 22).length >= 2, 'the rising cut is taught on the ridge\'s high foes: two or more kite goblins / pine moths / crows hung three rows or more over the ground within 22 columns of its sign (claude/oldtusker: the wasps went)');
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

/* ---- F. OLD TUSKER in THE FELLING CLEARING (claude/oldtusker) ---- */
const A = L.arena;
ok(A.boss === 'oldtusker' && A.music === 'oldtusker' && A.x0 / TS === GATE_COL + 4 && A.x1 / TS === GATE_COL + 37 && A.floor / TS === 9 && A.trigger / TS === GATE_COL + 8 && A.wallL === GATE_COL + 3 && A.wallR === GATE_COL + 37, 'THE FELLING CLEARING keeps the old clearing\'s frame to the column, OLD TUSKER\'s, on his own theme');
const ot = ents.find(e => e.t === 'oldtusker'); ok(ot && ot.x > GATE_COL + 12 && ot.x < GATE_COL + 30 && ot.y === 8, 'OLD TUSKER roots in the middle of the clearing, on its floor');
ok(!ents.some(e => e.t === 'queen'), 'THE HORNET QUEEN is parked: not in the clearing');
{ let solidIn = 0; for (let x = A.x0 / TS; x < A.x1 / TS; x++) for (let y = 0; y < 9; y++) if (L.grid[y * W + x] !== T.AIR) solidIn++;
  ok(solidIn === 0 && !pines.some(p => p.x * TS >= A.x0 - TS && p.x * TS <= A.x1), 'no floating tree and no yellow bridge: nothing but air over the clearing\'s floor, no felltree in it (' + solidIn + ' cells)'); }
ok(Array.isArray(A.pines) && A.pines.length >= 3 && A.pines.length <= 4 && A.pines.filter(p => p.dir > 0).length >= 1 && A.pines.filter(p => p.dir < 0).length >= 1, 'three or four marked pines, at both edges (arena.pines)');
for (const p of A.pines) { const x = p.col * TS + 8, edge = p.dir > 0 ? x - A.x0 : A.x1 - x; ok(edge >= 24 && edge <= 10 * TS && p.dir === (x < (A.x0 + A.x1) / 2 ? 1 : -1), 'the pine at ' + p.col + ' stands at an edge (' + edge + ' px in, room behind it) and leans in over the floor'); }
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(/case 'oldtusker': \{ const a = OTH \? OTH\.spawnBoss\(base\)/.test(main) && /OTH\.strike\(hb\)/.test(main) && /oldtusker: OTM\.OT\.hp/.test(main), 'OLD TUSKER\'s hands are wired in main.js (spawn, strokes on his pines, health)');

/* ---- G. the felling code ---- */
ok(/import \{ fellCells, fellRamp, underTrunk, FELL_STROKES \} from '\.\/felling\.js'/.test(main), 'main.js lays a pine through src/felling.js');
ok(/marks\.has\('tree:' \+ e\.x\)\) for \(const \[x, y, t\] of fellCells\(e,/.test(main) && /function fellLay\(pr\) \{ for \(const \[x, y, t\] of fellCells\(/.test(main), 'the fall and the save\'s marks lay the same cells');
ok(/P\.rgArrows \|\| \[\]\)\.find\(a => a\.state === 'fly'/.test(main.slice(main.indexOf("if (pr.t === 'felltree' && !pr.felled)"))), 'the ranger\'s arrow strikes a marked pine (every hero can fell)');
ok(/function fellStroke\(pr\) \{ pr\.hp--; pr\.lean =/.test(main) && /SFX\.creak\(\)/.test(main.slice(main.indexOf('function fellStroke('), main.indexOf('function fellLay('))), 'a stroke creaks and leans the pine');
ok(/function drawFellLine\(/.test(main) && /the stroke tally/.test(main), 'the line it will lie along and the stroke tally are drawn (A3)');
ok(/rampFoot\(prevY\)/.test(main) && /L\.fellRamps/.test(main) && L.fellRamps === true, 'a lean-to and a drop are walked as ramps (main.js rampFoot reads the felled pines)');
for (const s of ['THE PINE CREAKS AND LEANS', 'THE PINE FALLS: A BRIDGE', 'THE PINE FALLS: A WAY UP', 'TIMBER: IT CRUSHES WHAT STOOD UNDER IT']) ok(isCallout(s), 'the hint box says: ' + s);
ok(Math.abs(rampYAt(lr, lr.foot[0] * TS) - lr.foot[1] * TS) < 1, 'a ramp starts at its foot');

/* ---- H. no wasps (claude/oldtusker, Daniel 10-20 07:39) ---- */
const foes = ents.filter(e => !['sign', 'coin', 'deco', 'check', 'felltree', 'silver', 'vault', 'cage', 'gate', 'mover', 'pushblock', 'swing'].includes(e.t));
ok(!foes.some(e => e.t === 'wasp' && e.cnSkin !== 'pinemoth') && !foes.some(e => /hornet|queen|drone/.test(e.t + (e.cnSkin || ''))), 'no wasp, hornet or drone on the trail (the old posts hold pine moths, kites, crows and boars)');
for (const x of [46, 48, 114, 119, 123, 291, 308, 314, 323, 362, 368, 375, 420, 424, 463]) ok(foes.some(e => Math.abs(e.x - x) <= 2 && ['wasp', 'kite', 'crow', 'badger'].includes(e.t)), 'the old wasp post at ' + x + ' holds an on-theme foe');
const ford = foes.filter(e => e.t === 'wasp' && e.cnSkin === 'pinemoth' && e.x >= 112 && e.x <= 126 && e.pogo);
ok(ford.length >= 3 && signs.some(s => /DOWN\+X/.test(s.text) && s.x >= 105 && s.x <= 112), 'the PLUNGE lesson keeps its stepping stones over the ford: three pine moths (pogo), its sign at the ford');
ok(foes.filter(e => e.x >= 416 && e.x <= 430 && e.y <= 10 && ['kite', 'crow'].includes(e.t)).length >= 2 && foes.some(e => e.t === 'badger' && e.cnSkin === 'boar' && e.x > 428 && e.x < 441), 'THE TARN EXAM: foes over its bridge and a boar charging back along it');
ok(!foes.some(e => e.t === 'badger' && e.cnSkin !== 'boar') && foes.filter(e => e.cnSkin === 'boar').length >= 5, 'every badger is a BOAR now (cnSkin boar), five or more of them');
ok(/cnSkin === 'boar'/.test(main) && /SPR\.boar = bakeBoar\(\)/.test(main) && /SPR\.pinemoth = bakePineMoth\(\)/.test(main), 'the boar and the pine moth have their own sheets and the boar its heavier body (main.js)');

console.log('lumber-trail: ' + n + ' checks - the verb in minute one, three fells (bridge, lean-to, drop; the bridges and the lean-to locks), guides, the lessons as work, five areas and their shrines, OLD TUSKER\'s clearing, the felling drawn, no wasps.');
