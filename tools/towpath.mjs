// tools/towpath.mjs - THE TOWPATH's own check (claude/towpath; THE TOWPATH 2 + THE FOG KNIGHT 2, claude/towpath2). Node only: no page, no port, no Chrome. The
// built level, the pure fight, the wraith and the hands in a fake world (src/towpath-hands.js takes a context; here it is the built grid, its pools and movers,
// and a list of men):
//   - the rule line is the code's (LEVELS row == src/towpath.js); the road: waymeet > towpath > canal; it is appended to LEVELS (saves count by index);
//     the arcs teach -> test -> exam for the lock, the fog, the bridge, the lantern and the platforming; eight sections; the lychgate stands at the start (the church fork is gone: WAYMEET's votive lamps)
//   - THE FOG ON THE LOW WATER (claude/towpath2): every lock's low water and every pound carries a bank FOG_H rows deep; a punt at its lock's low water lies IN
//     the fog and at its high water ABOVE it (the lock lifts you out); in the fog a watchman sees only the lit, above it he sees a dim hero too; the last lock's
//     floor of irons lies in thick fog; every wraith stands in a bank
//   - THE LOCKS in the hands: a paddle fills a low chamber and drains a high one; the lower gate shuts as the water rises over its pound and opens when it is
//     back; a punt's deck rides the water (and rests on a dry bed); a man in a chamber that fills is drowned; every punt has a paddle in reach of its end and
//     one on the near side; the race stills the wheel and its paddles become a stair; a swing bridge's deck is footing only while it stands across; the lantern
//     is taken at the hut; THE SACK HOIST, THE AQUEDUCT'S BARGE and THE BASIN CRANE's hook go where their winch, sluice and capstan send them, each with its
//     gadget in reach of both its ends, and each is a ride for the reach model; THE BROKEN ARCHES are a jump-sized pier run over water (A14)
//   - THE FOG WRAITH (src/fog-wraith.js): never above its bank; dim, a blade passes through it and it chills (hp only); lit, it is cut; it smothers a lit
//     lantern unless a guard is raised to it
//   - the cast: ONE new foe (the fog wraith - the grindylow goes back to the canal), reskins by cnSkin, a ranged one, role mix; three shrines between start
//     and boss; the exam's old gate irons kill (examSpans), nowhere else does a spike but the hurt-spike teach
//   - THE FOG KNIGHT 2 (src/fog-knight.js, a fake world): his stance turns the wrong angle and lets the right one through; his own blows' recovery lets
//     everything through; the lantern burns him OPEN and a ward follows; the bridge swung through him scatters him OPEN; the lock drained grounds his double;
//     the arena lock lifts its punt out of his fog line (phase two) and sinks it into it; Daniel's call: the lash in phase one, the surge and the double in
//     two, the spears, the dissolve plunge and the shroud's step in three (eight told answers, B17); THE TOWROPE hooks a hero on the floor and drags him in,
//     passes a jumping or rolling one; THE SURGE sweeps the floor and passes a bollard; THE SPEARS hit the marked line and not off it; THE DISSOLVE PLUNGE
//     drops on the lit hero (dim: on a lamp) and is his once-a-cycle blink, never right after his opening; the bot's reading answers each; his marks are
//     src/marks.js's; boss-greed duelist rows; the synth themes
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { SECTIONS, ARCS, RULE, TOWPATH, O, FOG_H } from '../src/towpath.js';
import * as FK from '../src/fog-knight.js';
import * as FW from '../src/fog-wraith.js';
import { makeTowpathHands, TP } from '../src/towpath-hands.js';
import { MARK, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { SYNTH_BOSS, SYNTH_VARIANT } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
import { AMBIENT_NAMES } from '../src/audio.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'towpath'); ok(lv, 'towpath is in LEVELS');
ok(lv.needs === 'waymeet' && LEVELS.find(l => l.id === 'canal').needs === 'towpath', 'the road: WAYMEET > THE TOWPATH > THE FOG CANAL');
ok(LEVELS[LEVELS.length - 1].id === 'towpath' || LEVELS.findIndex(l => l.id === 'towpath') > LEVELS.findIndex(l => l.id === 'ksar'), 'appended to LEVELS (saves count levels by index)');
ok(lv.rule === RULE, 'the rule line is the code\'s');
const L = lv.build(), D = L.towpath, at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
ok(L.W === TOWPATH.W && L.H === TOWPATH.H && L.H <= 60, 'the sheet is TOWPATH\'s size (and a walk: 60 rows or fewer, not a tall level)');
/* THE ARCS */
for (const [verb, a] of Object.entries(ARCS)) { ok(a.teach && a.test && a.exam, verb + ': taught, tested, examined'); ok(a.teach[0] < a.test[0] && a.test[0] < a.exam[0], verb + ': in that order'); }
ok(SECTIONS.length === 8 && SECTIONS.every((s, i) => !i || s[1] > SECTIONS[i - 1][1]), 'eight sections, in order');
/* THE FORK */
/* STATED ASSERTION CHANGE (claude/towpathchurch, Daniel 10-08 / 10-16): the hill path to THE LIT CHURCH is no longer the Towpath's first-screen fork (the church road opens on WAYMEET's three votive lamps, src/votive-hands.js). The first screen keeps the lychgate and has NO church door, no hill path, and the LEVELS row for the church no longer hangs off the Towpath */
ok(L.ents.some(e => e.t === 'tplychgate' && e.x < 40) && !L.ents.some(e => e.t === 'tpchurch') && !D.fork, 'the first screen: the lychgate, the river road - and no church door (the church road is the votive lamps of WAYMEET)');
{ const ch = LEVELS.find(l => l.id === 'church'); ok(ch.needs === 'waymeet' && ch.spurOf === 'waymeet' && ch.votiveLamps === 'waymeet' && !ch.opensOn, 'the church hangs off WAYMEET (needs + spurOf), opens on its votive lamps, and has no Towpath medal gate'); }
/* THE PIECES */
const ents = t => L.ents.filter(e => e.t === t);
for (const k of D.locks) ok(ents('tppaddle').some(p => p.lock === k.id), 'lock ' + k.id + ' has a paddle');
for (const b of D.bridges) ok(ents('tpcapstan').some(c => c.bridge === b.id), 'bridge ' + b.id + ' has a capstan');
for (const m of L.moversExtra.filter(q => q.kind === 'punt')) { const k = D.locks.find(q => q.id === m.towpath), end = (m.x + m.w) / TS;
  ok(ents('tppaddle').some(p => p.lock === k.id && p.x >= k.x0 && p.x <= k.x1 + 1 && Math.abs(p.x + 0.5 - end) <= 2), 'punt ' + k.id + ': a paddle in reach of its end');
  ok(ents('tppaddle').some(p => p.lock === k.id && p.x < k.x0), 'punt ' + k.id + ': a paddle on the near side (a punt that rides away comes back)'); }
const rides = L.moversExtra.filter(q => q.towpath);
ok(L.rigBands.length === rides.length && ['punt', 'hoist', 'barge', 'hook'].every(k => rides.some(m => m.kind === k)), 'every ride (punts, the hoist, the barge, the hook) is a ride for the reach model');
/* the exam's irons, and no spike outside it - but the HURT-SPIKE TEACH (survival, Daniel 10-09): at most four spike tiles, on the bank path before the first lock */
let spikes = 0, spikesOut = 0, teachSpikes = 0; for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (at(x, y) === T.SPIKE) { spikes++; if (!L.examSpans.some(s => x >= s[0] && x <= s[1])) { if (x < 47) teachSpikes++; else spikesOut++; } }
ok(spikes > teachSpikes && spikesOut === 0 && teachSpikes >= 1 && teachSpikes <= 4, 'the old gate irons are in the exam only (bar the hurt-spike teach before the first lock): ' + JSON.stringify({ spikes, teachSpikes, spikesOut }));
/* SHRINES (the walked spacing is tools/checkpoint-gaps.mjs's: 80-200 route tiles; here the order) */
const cps = ents('check').map(e => e.x).sort((a, b) => a - b); ok(cps.length === 3, 'three shrines (after the mill\'s exam, at the foot of the broken arches, after the last lock)');
ok(cps[0] >= 140 && cps[0] <= 260 && cps[2] - cps[1] <= 200 && cps[1] - cps[0] <= 200, 'the first shrine 140-260 columns in, each next within 200');
const elite = sq => L.ents.find(e => e.squad === sq && e.elite);
ok(cps[0] > elite('millExam').x && cps[1] > 312 && cps[2] > elite('foreman').x, 'each shrine stands AFTER its exam (the hedge champion, the arches, the deck foreman)');
ok(cps[2] < L.arena.wallL, 'the last shrine stands before the Fog Knight');
/* THE CAST */
const FOES = ['swornsword', 'hedgeknight', 'crossbow', 'gaffer', 'archer', 'grindylow', 'fogwraith'], foes = L.ents.filter(e => FOES.includes(e.t));
ok(foes.length >= 18 && foes.length <= 32, 'fewer, weightier foes: ' + foes.length);
ok(foes.some(e => e.t === 'archer' || e.t === 'crossbow'), 'a ranged foe');
ok(!foes.some(e => e.t === 'grindylow') && foes.filter(e => e.t === 'fogwraith').length >= 5, 'the one new foe is THE FOG WRAITH (the grindylow is the canal\'s again): ' + foes.filter(e => e.t === 'fogwraith').length + ' wraiths');
ok(foes.filter(e => e.t === 'fogwraith').length / foes.length <= 0.35, 'no type over ~35% (the wraiths)');
ok(foes.filter(e => e.t === 'gaffer').every(e => e.cnSkin) && foes.filter(e => e.t === 'archer').every(e => e.cnSkin === 'watchman' && e.tp && e.tp.tpSight), 'the bargemen and the watchmen are reskins (cnSkin) with their eyes in the fog');
ok(foes.some(e => e.elite && e.t === 'hedgeknight') && foes.some(e => e.elite && e.t === 'gaffer'), 'the section exams\' elites: a hedge knight champion, the deck foreman');
ok(!L.ents.some(e => /gob|goblin|sprig/.test(e.t)), 'no living goblins past the Goblin Queen');
/* THE FOG ON THE LOW WATER: the banks */
const bankOver = (x0, x1, top) => D.banks.some(b => b.x0 <= x0 && b.x1 >= x1 && b.top === top);
for (const k of D.locks.filter(q => !q.arena)) ok(bankOver(k.x0, k.x1, Math.min(k.lo, k.bed) - FOG_H), 'lock ' + k.id + ': a fog bank FOG_H rows over its low water');
for (const p of L.pools.filter(q => q.tp && !D.locks.some(k => k.id === q.tp) && q.tp !== 'fkCut')) { const surf = Math.round((p.y - 4) / TS); ok(bankOver(Math.round(p.x0 / TS), Math.round(p.x1 / TS) - 1, surf - FOG_H), 'pound ' + p.tp + ': a fog bank FOG_H rows over its water'); }
for (const e of ents('fogwraith')) ok(D.banks.some(b => e.x >= b.x0 && e.x <= b.x1 && e.y + 1 > b.top), 'the wraith at ' + e.x + ' stands in a fog bank');
/* THE HANDS, IN A FAKE WORLD */
{
  const movers = L.moversExtra.map(m => ({ ...m, dx: 0, dy: 0 })), men = [];
  const ctx = { L, TS, T, players: [], hero: () => ({ x: 0, y: 0, face: 1 }), movers: () => movers, enemies: () => men, sfx: {}, number: () => {}, text: () => {}, burst: () => {},
    cellSet: (x, y, t) => { L.grid[y * L.W + x] = t; }, resolve: () => {}, bodies: () => men.filter(e => e.alive), box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), overlap: () => false,
    attackBox: () => null, near: () => false, asPlayer: (p, f) => f(), mark: () => {}, drown: e => { e.alive = false; e.drowned = true; return true; }, VW: () => 400, VH: () => 240, time: () => 0 };
  const H = makeTowpathHands(ctx); H.reset(); ok(H.on(), 'the hands bind to the level');
  const run = s => { for (let i = 0; i < s * 60; i++) { H.update(1 / 60); for (const m of movers) H.mover(m, 1 / 60); } };
  const A = H.lock('A'), gx = A.gate.x;
  ok(H.lockLevel('A') === 'lo' && at(gx, A.gate.top) === T.AIR, 'lock A starts low, its lower gate open');
  /* THE FOG RULE ON A PUNT: low, in the fog; high, above it */
  const pp = { n: 1, x: 50 * TS, y: 40 * TS, dead: false, face: 1 }; ctx.players.push(pp); ctx.hero = () => pp;
  const onPunt = id => { const m = movers.find(q => q.towpath === id && q.kind === 'punt'); pp.x = m.x + m.w / 2; pp.y = m.y; };
  for (const id of ['A', 'F1', 'F2', 'F3', 'Y']) { const k = H.lock(id); k.y = k.to = k.loY; for (const m of movers) H.mover(m, 0); onPunt(id); const low = H.inFog(pp);
    k.y = k.to = k.hiY; for (const m of movers) H.mover(m, 0); onPunt(id); const high = H.inFog(pp); ok(low && !high, 'lock ' + id + ': its punt at the low water lies IN the fog, at the high water ABOVE it'); }
  for (const k of [H.lock('A'), H.lock('F1'), H.lock('F2'), H.lock('F3'), H.lock('Y')]) { k.y = k.to = (k.init === 'hi' ? k.hiY : k.loY); }
  for (const m of movers) H.mover(m, 0); pp.x = 0; pp.y = 0;
  ok(H.work('A') === 'fill', 'its paddle fills a low chamber'); run(5);
  ok(H.lockLevel('A') === 'hi' && at(gx, A.gate.top) === T.SOLID, 'filled: high, and the lower gate shut behind it');
  const pA = movers.find(m => m.towpath === 'A'); ok(Math.abs(pA.y - (A.hiY - 6)) < 1, 'the punt rides the water up to the upper bank');
  ok(H.work('A') === 'drain', 'struck again, it drains'); run(5); ok(H.lockLevel('A') === 'lo' && at(gx, A.gate.top) === T.AIR, 'drained: the gate opens again');
  const F2 = H.lock('F2'); ok(H.lockLevel('F2') === 'dry', 'F2 starts dry');
  const pF2 = movers.find(m => m.towpath === 'F2'); ok(Math.abs(pF2.y - (F2.bedY - 8)) < 1, 'its punt rests on the dry bed');
  const pair = L.ents.filter(e => e.squad === 'dryChamber').map(e => ({ t: 'gaffer', x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true }));
  men.push(...pair); H.work('F2'); run(8); ok(pair.every(e => e.drowned), 'F2 filled over the pair on its bed: the water takes them');
  ok(H.lockLevel('F2') === 'hi', 'F2 filled to the landing\'s height');
  const w = D.wheels[0]; ok(H.lockLevel('race') === 'hi', 'the race runs');
  ok(w.steps.every(([a, b, r]) => at(a, r) === T.AIR), 'the turning wheel is no stair');
  H.work('race'); run(8); ok(H.handsState('wheel.mill') === 'still' && w.steps.every(([a, b, r]) => at(a, r) === T.ONEWAY), 'the race drained: the wheel stands still, its paddles a stair');
  const tail = D.bridges.find(b => b.id === 'tail'); ok(at(tail.x0, tail.row) === T.AIR, 'the tail race\'s bridge starts clear of the cut');
  H.swing('tail'); run(2); ok(at(tail.x0, tail.row) === T.ONEWAY && H.handsState('bridge.tail') === 'across', 'its capstan swings it across: footing');
  H.swing('tail'); run(0.1); ok(at(tail.x0, tail.row) === T.AIR, 'swung clear, the deck is gone at once (whoever stands on it goes in)');
  /* THE RIDES: the hoist, the barge, the hook - each where its gadget sends it, a gadget in reach at each end */
  { const h = D.hoists[0], m = movers.find(q => q.kind === 'hoist'); ok(Math.abs(m.y - h.botPx) < 1 && m.y > h.bot * TS && at(h.x0, h.bot) === T.AIR, 'the sack hoist rests in its notch, a step down from the loft floor (boarded from above)');
    const wn = ents('tpwinch').filter(e => e.hoist === h.id); ok(wn.length === 2 && wn.some(e => e.y + 1 === h.bot) && wn.some(e => e.y + 1 === h.top) && wn.every(e => e.x >= h.x0 + h.w && e.x <= h.x0 + h.w + 1), 'a winch beside the shaft on each floor, in reach of the deck');
    ok(H.wind('sack') === 'up', 'its winch sends it up'); run(1); ok(H.rideState('hoist', 'sack') === 'moving', 'it rides'); run(5); ok(H.rideState('hoist', 'sack') === 'top' && Math.abs(m.y - h.topPx) < 1 && h.topPx === h.top * TS, 'up at the sack floor, flush with its boards');
    ok(at(h.x0, h.top) === T.AIR && at(h.x0 - 1, h.top) === T.ONEWAY, 'the shaft is open through the sack floor'); H.wind('sack'); run(6); ok(H.rideState('hoist', 'sack') === 'bot', 'and back down'); }
  { const q = D.troughs[0], m = movers.find(z => z.kind === 'barge'), sl = ents('tpsluice'); ok(H.rideState('trough', 'aq') === 'west' && m.y >= q.bed * TS - 9 && m.y > (q.bed - 1) * TS, 'the barge lies moored on the dry channel bed, a step down from the walkway (boarded from above)');
    ok(sl.some(e => e.x === q.stopW - 1) && sl.some(e => e.x === q.stopE + q.w), 'a sluice at each end, by the barge\'s end');
    let gap = 0; for (let x = q.stopW + q.w; x < q.stopE; x++) if (at(x, q.bed) !== T.SOLID) gap++; ok(gap >= 18, 'the span is broken: ' + gap + ' columns no jump crosses');
    ok(H.sluice('aq', false) === null && H.rideState('trough', 'aq') === 'west', 'the far sluice does not send a barge that is not at its stop');
    ok(H.sluice('aq', true) === 'sent', 'the west sluice opens'); run(0.5); ok(H.rideState('trough', 'aq') === 'moving', 'the trough runs');
    run(20); ok(H.rideState('trough', 'aq') === 'east' && Math.abs(m.x - q.stopE * TS) < 1 && Math.abs(m.y - (q.surf * TS - 2)) < 1, 'the barge floats over the break to the east stop, on the water');
    ok(H.sluice('aq', false) === 'sent', 'the east sluice sends it back'); run(20); ok(H.rideState('trough', 'aq') === 'west', 'and it is back at the west stop'); }
  /* THE MISSED BOAT (claude/towpathchurch, Daniel 10-16): strike the west sluice, do NOT board - the barge docks empty at the east stop and the far sluice is across the
     break. The bargeman poles it back to the hero stranded at the west end; a hero aboard (or at the east end) is never robbed of it */
  { const q = D.troughs[0], keep = ctx.players.slice(); ctx.players.length = 0;
    const west = { n: 1, x: (q.stopW - 3) * TS, y: (q.bed - 2) * TS, dead: false, face: 1 }; ctx.players.push(west); ctx.hero = () => west;
    ok(H.sluice('aq', true) === 'sent', 'missed boat: the west sluice sends the barge with nobody aboard'); run(20);
    ok(H.rideState('trough', 'aq') === 'east' || H.rideState('trough', 'aq') === 'west' || H.rideState('trough', 'aq') === 'moving', 'missed boat: the barge ran');
    run(TP.bargeBackT + 20); ok(H.rideState('trough', 'aq') === 'west', 'missed boat: docked empty at the east stop with the hero left at the west, the barge comes BACK to him (never a dead end)');
    ok(H.sluice('aq', true) === 'sent', 'and the boat can be tried again'); run(1);
    const m2 = movers.find(z => z.kind === 'barge'); for (let i = 0; i < 4 * (TP.bargeBackT + 25); i++) { west.x = m2.x + 20; west.y = m2.y - 10; run(0.25); }
    ok(H.rideState('trough', 'aq') === 'east', 'a hero aboard is carried across and the barge is not poled away from under him');
    const east = { n: 1, x: (q.stopE + q.w + 3) * TS, y: (q.bed - 2) * TS, dead: false, face: -1 }; ctx.players.length = 0; ctx.players.push(east); ctx.hero = () => east;
    run(TP.bargeBackT + 3); ok(H.rideState('trough', 'aq') === 'east', 'a hero standing at the far end: it waits for him');
    ctx.players.length = 0; ctx.players.push(...keep); ctx.hero = () => keep[0] || { x: 0, y: 0, face: 1 }; H.sluice('aq', false); run(20); }
  { const c = D.cranes[0], m = movers.find(z => z.kind === 'hook'), caps = ents('tpcrane'); ok(H.rideState('crane', 'jib') === 'quay' && Math.abs(m.y - c.fromPx) < 1 && m.y > (c.from[1] - 1) * TS, 'the hook hangs in its notch, a step down from the quay (boarded from above)');
    ok(caps.some(e => Math.abs(e.x - c.from[0]) <= 1 && e.y + 1 === c.from[1] - 1) && caps.some(e => Math.abs(e.x - (c.to[0] + c.w)) <= 3 && e.y + 1 === c.to[1]), 'a capstan by the hook at the quay and on the roof');
    ok(H.jib('jib') === 'up', 'the capstan swings the jib'); run(4); ok(H.rideState('crane', 'jib') === 'roof' && Math.abs(m.y - c.toPx) < 1 && c.toPx === c.to[1] * TS && at(c.to[0] + c.w, c.to[1]) === T.SOLID, 'the hook rides up to the roof\'s edge, flush with it');
    let wall = 0; for (let y = c.to[1]; y < c.from[1]; y++) if (at(c.to[0] + c.w, y) === T.SOLID) wall++; ok(wall >= 12, 'the warehouse wall it lifts you over is no climb: ' + wall + ' rows'); H.jib('jib'); run(4); }
  /* THE BROKEN ARCHES (A14): a real platforming run - pier to pier, every gap a jump (two columns) over water */
  { let piers = 0, x = 290; for (; x < 322; x++) if (at(x, 30) === T.SOLID && at(x - 1, 30) !== T.SOLID && x > 291) piers++;
    ok(piers >= 5, 'the broken arches: ' + piers + ' piers off the east span to the quay');
    const tops = []; for (let x = 290; x < 322; x++) { let y = 0; while (y < L.H && at(x, y) !== T.SOLID) y++; tops.push(y); }
    ok(tops.some((t, i) => i && t > tops[i - 1] + 6), 'between the piers the drop is to the water, not a floor'); }
  const X = H.lock('X'); H.work('X'); run(10); ok(H.lockLevel('X') === 'dry', 'the last lock drains to its floor of irons');
  /* THE IRONS IN THE FOG: the drained floor lies in thick fog, its irons in clusters with walkable floor between */
  { const floor = X.bed; let walk = 0, iron = 0; for (let x = X.x0; x <= X.x1; x++) { if (at(x, floor - 1) === T.SPIKE) iron++; else walk++; }
    ok(iron >= 4 && walk >= 5, 'the floor: ' + iron + ' iron tiles among ' + walk + ' walkable');
    ok(H.fogAt((X.x0 + 4) * TS, (floor - 1) * TS - 4) >= 0.8, 'the floor lies in thick fog: only a light shows the irons'); }
  /* THE LANTERN AND THE EYES */
  pp.x = (D.lantern.x - 2) * TS; pp.y = 38 * TS; K0();
  function K0() { H.setLantern(pp, false, false); }
  ok(!H.lanternOf(pp).has, 'no lantern before the hut'); pp.x = (D.lantern.x + 1) * TS; run(0.1); ok(H.lanternOf(pp).has && H.lanternOf(pp).lit, 'past the hut the lock-keeper\'s lantern is yours, lit');
  ok(D.lantern.x < 47, 'the lantern is taken before the first lock (the fog rule needs it from the start)');
  const bs = D.banks.find(b => b.x0 <= 330 && b.x1 >= 342), bx = 334 * TS, by = (bs.top + 3) * TS;
  pp.x = bx; pp.y = by; ok(H.inFog(pp), 'on the basin quay you stand in the fog');
  const watch = { x: bx + 150, y: by, tpSight: true, alive: true };
  ok(H.seen(watch, pp), 'lit, the watchman sees you'); H.interact(pp); ok(!H.lanternOf(pp).lit, 'E dims it'); ok(!H.seen(watch, pp), 'dimmed in the fog, he does not');
  pp.x = watch.x - 30; ok(H.seen(watch, pp), 'at his elbow he does');
  pp.x = bx; pp.y = (bs.top - 2) * TS; ok(!H.inFog(pp) && H.seen(watch, pp), 'ABOVE the fog he sees you, dim or not');
  /* (claude/towpath fix, review M3a) THE LANTERN IS TAKEN WALKING THROUGH THE HUT: at its hook, no E */
  const p2 = { n: 2, x: D.lantern.x * TS + 2, y: 38 * TS, dead: false, face: 1 }; ctx.players.push(p2); run(0.05); ok(H.lanternOf(p2).has && H.lanternOf(p2).lit, 'at the hut\'s hook the lantern is yours, lit (no E)');
  ctx.players.pop();
  /* (review M3b) A REQUIRED LIT USE: THE LAST LOCK's paddle stands in the dark under an unlit lamp - found only in a light */
  const xp = L.ents.find(e => e.t === 'tppaddle' && e.lock === 'X'); ok(xp && xp.dark && D.lamps.some(l => Math.abs(l.x - xp.x) <= 1 && !l.lit), 'the last lock\'s paddle is a dark one, an unlit lamp by it');
  ok(!D.lamps.some(l => l.lit && Math.hypot((l.x - xp.x) * TS, (l.y - xp.y) * TS) < TP.lampR + 16), 'and it stands in the dark: no lamp alight near it (claude/towpath2: the fog lies on the low water now, and the bank above the full lock is out of it - the dark is the night, the lantern still the way to it)');
  pp.x = xp.x * TS + 8 - 10; pp.y = (xp.y + 1) * TS; H.setLantern(pp, true, false);
  H.work('X'); run(12); ok(H.lockLevel('X') === 'hi', 'X refilled (the tool\'s own hand)');
  ok(H.handsState('lamp.x') === 'out' && !H.litAt(xp.x * TS + 8, (xp.y + 1) * TS - 14), 'dim, at the full lock: the paddle is in the dark (the glint names the lamp)');
  H.interact(pp); ok(H.lanternOf(pp).lit && H.lockLevel('X') === 'hi' && H.lock('X').to <= H.lock('X').hiY + 1, 'E at the dark paddle lights your lantern first - the lock does not move');
  ok(H.handsState('lamp.x') === 'lit', 'lit: the paddle is found'); H.interact(pp); run(10); ok(H.lockLevel('X') === 'dry', 'and E then drains the last lock');
  H.work('X'); run(12); H.setLantern(pp, false, false); H.interact(pp); run(2); ok(H.lockLevel('X') === 'hi', 'no lantern, no lamp: the dark paddle does nothing');
  H.state().lamps.find(l => Math.abs(l.x - xp.x) <= 1).lit = true; H.interact(pp); run(10); ok(H.lockLevel('X') === 'dry', 'the lamp struck alight: the paddle drains it');
  /* (review M5) F3's lower gate waits on a HERO in its doorway, or a foe stood IN it - not on a foe fighting on the landing beside it */
  const F3 = H.lock('F3'), g3 = F3.gate; ok(L.ents.some(e => e.squad === 'f2Landing' && e.x < g3.x - 1), 'the F2 landing\'s river rat stands off F3\'s gate column');
  const rat = { t: 'gaffer', x: g3.x * TS - 3, y: (g3.bot + 1) * TS, alive: true }; men.push(rat);
  H.work('F3'); run(8); ok(H.lockLevel('F3') === 'hi' && at(g3.x, g3.top) === T.SOLID, 'a foe at the gate\'s edge (his middle on the landing): the gate shuts, F3 fills');
  H.work('F3'); run(8); rat.x = g3.x * TS + 8; H.work('F3'); run(8); ok(H.lockLevel('F3') !== 'hi' && at(g3.x, g3.top) === T.AIR, 'a foe stood IN the doorway: the gate waits, the water with it');
  rat.alive = false;
  /* THE FOG WRAITH, in the hands' fog: never above its bank; dim it is fog; lit it is cut; it smothers a lit lantern unless a guard is raised */
  { const we = L.ents.find(e => e.t === 'fogwraith' && e.squad === 'sunk'), top = H.fogTop(we.x * TS + 8);
    const e = FW.newWraith({ t: 'fogwraith', x: we.x * TS + 8, y: (we.y + 1) * TS, hp: FW.WRAITH.hp, alive: true }); let chills = 0, smothers = 0, guard = false;
    const hero = { n: 1, x: e.x + 60, y: (we.y + 1) * TS, dead: false, face: -1 }; ctx.players.length = 0; ctx.players.push(hero); ctx.hero = () => hero; H.setLantern(hero, true, false);
    const X = { hero: () => hero, heroes: () => [hero], lightAt: (x, y) => H.hardLight(x, y), fogTop: x => H.fogTop(x), litOf: q => H.lanternOf(q).lit, smother: q => { const r = H.smother(q); if (r) smothers++; return r; },
      guards: () => guard, chill: () => { chills++; }, mark: () => {}, sfx: {}, number: () => {} };
    let hi = 1e9; for (let i = 0; i < 600; i++) { FW.stepWraith(e, 1 / 60, X); hi = Math.min(hi, e.y); hero.y = (we.y + 1) * TS - 200; }
    ok(top !== null && hi >= top, 'a wraith never rises above its bank (a hero lifted out of the fog leaves it under him)');
    hero.y = (we.y + 1) * TS; e.x = hero.x; e.y = hero.y - 10;
    ok(!FW.wraithHard(e, X) && FW.wraithTake(e, 20, X) === 0, 'dim, a blade passes through it');
    for (let i = 0; i < 120; i++) { e.x = hero.x; e.y = hero.y - 12; FW.stepWraith(e, 1 / 60, X); } ok(chills >= 1, 'dim, it drifts through you and chills');
    H.setLantern(hero, true, true); ok(FW.wraithHard(e, X) && FW.wraithTake(e, 20, X) === 20, 'in your lit lantern\'s light it is solid, and cut');
    e.smCd = 0; e.recoil = 0; e.mode = 'drift'; for (let i = 0; i < 90 && e.mode !== 'smotherTell'; i++) { e.x = hero.x + 20; e.y = hero.y - 12; FW.stepWraith(e, 1 / 60, X); } ok(e.mode === 'smotherTell', 'close to a lit lantern it reaches for the flame (told)');
    guard = true; for (let i = 0; i < 60; i++) FW.stepWraith(e, 1 / 60, X); ok(smothers === 0 && H.lanternOf(hero).lit, 'a guard raised toward it shields the flame');
    guard = false; e.smCd = 0; e.recoil = 0; e.mode = 'drift'; for (let i = 0; i < 300 && !smothers; i++) { e.x = hero.x + 20; e.y = hero.y - 12; FW.stepWraith(e, 1 / 60, X); } ok(smothers === 1 && !H.lanternOf(hero).lit, 'let it close and the lantern goes out'); }
}
/* THE GLINT: every route need in STUCK_HANDS.towpath targets a gadget (or, after a stall, its climb) */
const onThing = s => s.key === 'wheel' ? D.wheels.some(w => w.steps.some(([a, b, r]) => s.at[0] >= a && s.at[0] <= b && s.at[1] === r - 1)) : s.key === 'ladder' ? at(s.at[0], s.at[1]) === T.NET
  : s.key === 'culvert' ? L.interiors.some(q => q[4] === 'tpCulvert' && s.at[0] >= q[0] && s.at[0] <= q[1] && s.at[1] >= q[2] && s.at[1] <= q[3]) && at(s.at[0], s.at[1]) === T.AIR : false;
const GADGETS = new Set(['tppaddle', 'tpcapstan', 'tpwinch', 'tpsluice', 'tpcrane']);
for (const sp of STUCK_HANDS.towpath) for (const s of sp.steps) ok(L.ents.some(e => GADGETS.has(e.t) && e.x === s.at[0] && e.y === s.at[1]) || (s.glint === 'stall' && onThing(s)), 'the glint ' + s.key + ' is on its gadget (or its climb)');
for (const id of ['tp-hoist', 'tp-aq', 'tp-crane']) ok(STUCK_HANDS.towpath.some(s => s.id === id), 'the new ride ' + id + ' glints until it is worked');
/* THE FOG KNIGHT */
const A = L.arena; ok(A && A.boss === 'fogknight' && L.ents.some(e => e.t === 'fogknight'), 'THE FOG KNIGHT stands at the towpath\'s end');
const G = FK.geom(A);
ok(at(Math.floor(G.cut[0] / TS), A.fk.R) === T.ONEWAY, 'his cut is spanned by the swing bridge'); ok(G.caps.length === 2 && L.ents.filter(e => e.t === 'tpcapstan' && e.arena).length === 2, 'a capstan on each bank');
/* THE EXIT (claude/towpathchurch, Daniel 10-16: "you cannot leave the boss room"): the gate was buried in the upper quay's solid block (W-2 at row R-1, the quay's top is R-6).
   It must stand on the arena FLOOR, in clear air, with a floor under it, inside the room east of the cut, before the arena lock's gate - walkable once he falls (gateAfterBoss) */
{ const gts = L.ents.filter(e => e.t === 'gate'), g = gts[0], R = A.fk.R, sx = A.fk.sx; ok(gts.length === 1 && L.gateAfterBoss, 'one gate, opened by his fall (gateAfterBoss)');
  ok(g.x === sx + FK.FK_STAGE.exit && g.y === R - 1, 'the gate stands on the boss floor row (the hero row)');
  ok(g.x > sx + FK.FK_STAGE.cut[1] + 2 && g.x < sx + FK.FK_STAGE.lock.gate, 'east of the cut and its bridge, west of the arena lock gate: reachable on foot from the floor');
  ok([0, -1, -2].every(d => at(g.x, g.y + d) === T.AIR) && at(g.x, g.y + 1) === T.SOLID, 'in clear air (three rows) with solid floor under it - never inside a block (the old gate was)');
  ok(g.x < A.wallR, 'inside the arena walls'); }
ok(FK.FK_STAGE.beams.every(b => at(A.fk.sx + b.x0, A.fk.R - b.dy) === T.ONEWAY), 'the gate beams: the plunge\'s heights, over the surge');
ok(FK.FK_STAGE.bollards.every(c => at(A.fk.sx + c, A.fk.R - 2) === T.SOLID && at(A.fk.sx + c, A.fk.R - 3) === T.AIR), 'the bollards: two rows over the towpath, a step up out of the surge');
const AL = D.locks.find(k => k.id === 'fkLock'); ok(AL && AL.arena && AL.gate && L.moversExtra.some(m => m.towpath === 'fkLock' && m.kind === 'punt') && ents('tppaddle').filter(p => p.lock === 'fkLock').length === 3, 'THE ARENA LOCK: a real chamber, its punt, its gate, a paddle on the bank, the punt and the quay');
const world = () => { const c = { said: [], hits: [], hooks: [], drags: 0, knocks: 0, number: (x, y, t) => c.said.push(t), word: () => {}, mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, time: () => 0,
  hit: (b, d, nm) => { c.hits.push({ nm, b }); return true; }, hook: (pp, d, nm) => { c.hooks.push(pp); return true; }, drag: () => { c.drags++; }, knock: () => { c.knocks++; }, lockFull: () => true, lamps: () => [], light: () => 0 }; return c; };
const fresh = () => { const S = FK.newFight(G), e = { x: G.x0 + 520, y: G.floorY, hp: 2000, maxHp: 2000, alive: true, mode: 'walk', modeT: 1, face: -1, open: 0 }; return { S, e }; };
{ const { S, e } = fresh();
  for (const [st, good, bad] of [['high', ['low'], ['mid', 'high', 'plunge']], ['low', ['high', 'plunge'], ['mid', 'low']], ['full', ['plunge'], ['mid', 'low', 'high']]]) { S.stance = st;
    for (const a of good) ok(FK.takeAt(e, S, a).k === 1, st + ': a ' + a + ' blow lands');
    for (const a of bad) { const r = FK.takeAt(e, S, a); ok(r.k === 0 && r.word === FK.STANCE_WORD[st], st + ': a ' + a + ' blow is turned and named'); } }
  S.stance = 'full'; ok(FK.takeAt(e, S, 'plunge').reel, 'a plunge breaks the full guard');
  for (const m of ['cutRec', 'lashRec', 'surgeRec', 'spearRec', 'plungeRec']) { e.mode = m; ok(FK.takeAt(e, S, 'mid').k === 1, 'in his ' + m + ' every angle lands'); }
  for (const m of ['sinkTell', 'gone', 'plungeTell']) { e.mode = m; ok(FK.takeAt(e, S, 'mid').k === 0 && FK.takeAt(e, S, 'mid').word === 'NOT THERE', 'in the fog (' + m + ') a blade finds nothing, and is told'); } }
{ const { S, e } = fresh(), c = world(), hero = [{ x: e.x - 40, y: e.y, alive: true, lit: true, face: 1 }]; let t = 0;
  while (!FK.fkOpen(e) && t < 8) { FK.stepFogKnight(e, S, 1 / 60, hero, c); t += 1 / 60; hero[0].x = e.x - 40; hero[0].y = e.y; S.lash = null; S.hooked = null; S.wave = null; S.spears = null; }
  ok(FK.fkOpen(e) && S.n.burns === 1, 'a lit lantern at his side burns the fog out of him: OPEN (' + t.toFixed(1) + ' s)');
  const x0 = e.x; let open = 0; while (FK.fkOpen(e)) { FK.stepFogKnight(e, S, 1 / 60, hero, c); open += 1 / 60; }
  ok(open >= 3 && e.x === x0, 'the opening lasts >= 3 s and he stands still in it (B4)'); ok(S.ward > 2.5 && FK.takeAt(e, S, 'low').word === 'WARDED', 'a told ward follows (B3)'); }
{ const { S, e } = fresh(), c = world(); e.x = G.cutMid; ok(FK.bridgeSwung(e, S, c) === 'scatter' && FK.fkOpen(e) && e.open >= 3, 'the bridge swung through him scatters him: OPEN 3 s');
  const f2 = fresh(); f2.e.x = G.x0 + 40; ok(FK.bridgeSwung(f2.e, f2.S, c) === 'miss', 'away from the cut the bridge misses him'); }
{ const { S, e } = fresh(), c = world(); S.dbl = { x: 0 }; ok(FK.lockDrained(e, S, c) && !S.dbl, 'the lock drained grounds the double'); }
/* THE FOG LINE: knee-deep at dusk, over your head as it rises; the arena lock's punt filled stands above it, drained in it */
{ const { S } = fresh(); const eye = y => y - 20; S.ph = 1; ok(eye(G.floorY) < FK.fogTop(S), 'phase one: the fog lies knee-deep - a hero on the towpath sees over it');
  S.ph = 2; ok(eye(G.floorY) > FK.fogTop(S), 'phase two: the fog is over your head on the towpath');
  ok(eye(G.floorY - 32) < FK.fogTop(S) && G.beams.every(b => eye(b.y) < FK.fogTop(S)), 'a bollard and every gate beam stand above it');
  const hiDeck = AL.hi * TS - 2, loDeck = AL.lo * TS - 2; ok(eye(hiDeck) < FK.fogTop(S) && eye(loDeck) > FK.fogTop(S), 'the arena lock FILLED lifts its punt out of the fog; DRAINED it sinks it in (fill to see him, drain to hide)'); }
/* HIS MOVES: Daniel's call - more than one new a phase; eight told answers (B17) */
const moves = ph => new Set(FK.CYCLES[ph].flat());
for (const ph of [1, 2, 3]) for (const m of FK.PHASE_NEW[ph]) { ok(moves(ph).has(m), 'phase ' + ph + ' brings ' + m); for (const q of [1, 2, 3].filter(p => p < ph)) ok(!moves(q).has(m), m + ' is not in phase ' + q); }
ok(['lash'].every(m => moves(1).has(m)) && ['surge', 'double'].every(m => moves(2).has(m)) && ['spears', 'dplunge', 'step'].every(m => moves(3).has(m)), 'the lash (1), the surge and the double (2), the spears, the dissolve plunge and the shroud\'s step (3)');
const told = Object.entries(FK.MOVES).filter(([, v]) => v.mark).map(([k]) => k); ok(told.length >= 7 && new Set(told.map(k => ANSWER['fogknight|' + k])).size >= 3, 'his told blows: ' + told.join(', ') + ' (block, dodge and jump answers)');
for (const [m, v] of Object.entries(FK.MOVES)) { ok(MARK['fogknight|' + m] === v.mark, 'his ' + m + ' mark is src/marks.js\'s'); if (v.answer) ok(ANSWER['fogknight|' + m] === v.answer, 'his ' + m + ' answer is src/marks.js\'s'); }
ok(MARK['fogwraith|smotherTell'] === '!' && ANSWER['fogwraith|smotherTell'] === 'block', 'the wraith\'s smother: a yellow !, a guard answers it');
ok(typeof OPEN_RULE.fogknight === 'function' && FULL_DAMAGE.fogknight, 'src/boss-greed.js: his opening (OPEN_RULE) and a duelist\'s full damage');
/* THE TOWROPE: a hero on the towpath in its line is hooked and dragged in, then told a cut; a jumping or rolling one is passed */
const lashAt = (h0, up = 0) => { const { S, e } = fresh(), c = world(); S.ph = 1; const h = [{ x: e.x - 120, y: G.floorY, alive: true, lit: true, face: 1, pp: { id: 1 }, ...h0 }];
  e.mode = 'recover'; e.modeT = 0; S.script = ['lash']; S.step = 0; let t = 0; while (t < 3 && !S.hooked && !(e.mode === 'lashRec')) { if (e.mode === 'lash') h[0].y = G.floorY - up; FK.stepFogKnight(e, S, 1 / 60, h, c); t += 1 / 60; } return { S, e, c, h }; };   /* (up: he leaves the floor as the chain is thrown - a jump) */
{ const r = lashAt({}); ok(r.c.hooks.length === 1 && r.S.hooked, 'the towrope hooks a hero standing in its line');
  let t = 0; while (t < 2 && r.e.mode !== 'cutTell') { r.h[0].x = Math.min(r.h[0].x + 4, r.e.x - 20); FK.stepFogKnight(r.e, r.S, 1 / 60, r.h, r.c); t += 1 / 60; } ok(r.c.drags > 0 && r.e.mode === 'cutTell', 'drags him in, and follows with a told cut');
  ok(lashAt({}, 40).c.hooks.length === 0, 'a hero who jumps as it is thrown is passed (jump it)'); ok(lashAt({ dodge: true }).c.hooks.length === 0, 'a rolling hero is passed (roll it)'); }
{ const { S, e } = fresh(), c = world(); S.ph = 1; e.mode = 'recover'; e.modeT = 0; S.script = ['cut']; S.step = 0; const h = [{ x: G.beams[1].x0 + 20, y: G.beams[1].y, alive: true, lit: false, ground: true, pp: {} }];
  FK.stepFogKnight(e, S, 1 / 60, h, c); ok(e.mode === 'lashTell' && S.n.highLashes === 1, 'up on a beam above the fog and seen: he lashes you down');
  const f2 = fresh(); f2.S.ph = 1; f2.e.mode = 'recover'; f2.e.modeT = 0; f2.S.script = ['cut']; f2.S.step = 0; FK.stepFogKnight(f2.e, f2.S, 1 / 60, [{ ...h[0], ground: false }], c); ok(f2.S.n.highLashes === 0, 'a hero only in a jump is not lashed for it'); }
/* THE SURGE: the wall of water sweeps the towpath and passes a bollard */
{ const { S, e } = fresh(), c = world(); S.ph = 2; const bx = (G.bollards[1].x0 + G.bollards[1].x1) / 2; const floor = { x: bx - 40, y: G.floorY, alive: true, pp: { a: 1 } }, perch = { x: bx, y: G.bollards[1].y, alive: true, pp: { b: 1 } };
  e.mode = 'recover'; e.modeT = 0; S.script = ['surge']; S.step = 0; let t = 0; while (t < 6 && !(S.n.surges && !S.wave && e.mode !== 'surgeTell' && e.mode !== 'surge')) { FK.stepFogKnight(e, S, 1 / 60, [floor, perch], c); t += 1 / 60; }
  ok(c.hits.filter(q => q.nm === FK.MOVE_NAME.surge).length === 1 && c.knocks === 1, 'the surge sweeps the hero on the towpath (and only him: the bollard is over it)'); }
/* THE SPEARS: the marked line is hit, a step off it is not */
const spearRun = (dx) => { const { S, e } = fresh(), c = world(); S.ph = 3; const tx = G.x0 + 200, me = { x: tx, y: G.floorY, alive: true, lit: true, pp: { a: 1 } };
  e.mode = 'recover'; e.modeT = 0; S.script = ['spears']; S.step = 0; FK.stepFogKnight(e, S, 1 / 60, [me], c); const spots = S.spears.spots.map(q => q.x);
  me.x = dx === null ? tx : Math.max(...spots) + dx; let t = 0; while (t < 3 && (S.spears || e.mode === 'spearTell')) { FK.stepFogKnight(e, S, 1 / 60, [me], c); t += 1 / 60; }
  return { spots, tx, n: c.hits.filter(q => q.nm === FK.MOVE_NAME.spear).length }; };
{ const a = spearRun(null); ok(a.spots.length === FK.FK.spearN && Math.min(...a.spots) < a.tx && Math.max(...a.spots) > a.tx, 'the spears mark a line round where he sees you');
  ok(a.n === 1, 'a lance finds the hero who stays on the line (once)'); ok(spearRun(40).n === 0, 'a step off the line and none does'); }
/* THE DISSOLVE PLUNGE: on the lit hero; dim, on a lamp alight; his once-a-cycle blink, never right after an opening */
const dplungeOn = (lit, lamps, sinceOpen = 99) => { const { S, e } = fresh(), c = world(); c.lamps = () => lamps; S.ph = 3; S.sinceOpen = sinceOpen; e.hp = 600;
  const h = [{ x: G.x0 + 160, y: G.floorY, alive: true, lit, pp: {} }]; e.mode = 'recover'; e.modeT = 0; S.script = ['dplunge', 'step']; S.step = 0; let t = 0, first = null;
  while (t < 4 && e.mode !== 'plungeRec') { FK.stepFogKnight(e, S, 1 / 60, h, c); if (!first) first = e.mode; t += 1 / 60; } return { S, e, c, first }; };
{ const r = dplungeOn(true, []); ok(r.first === 'sinkTell' && r.e.mode === 'plungeRec' && Math.abs(r.e.x - (G.x0 + 160)) < 20 && r.c.hits.some(q => q.nm === FK.MOVE_NAME.plunge), 'the dissolve plunge: he sinks (told), and drops on the lit hero');
  const lampX = G.x0 + 240, r2 = dplungeOn(false, [{ x: lampX, lit: true }]); ok(Math.abs(r2.e.x - lampX) < 20, 'dim, he drops on the lamp alight instead (dim your lantern by a lamp)');
  ok(dplungeOn(true, [], 1).first !== 'sinkTell', 'never right after his opening (B12)');
  const r3 = dplungeOn(true, []); r3.e.mode = 'recover'; r3.e.modeT = 0; FK.stepFogKnight(r3.e, r3.S, 1 / 60, [{ x: G.x0 + 160, y: G.floorY, alive: true, lit: true, pp: {} }], r3.c); ok(r3.e.mode !== 'shroudTell', 'it is his blink for the cycle: no shroud step after it'); }
/* THE BOT'S READING */
{ const { S, e } = fresh(), P = { x: e.x - 20, y: e.y, face: 1, ground: true, atk: -1, lit: true, has: true }, base = { P, e, S, reach: 30, shield: true, t: 9, v2: true, gadgetNear: false, bridgeOpen: false };
  S.stance = 'high'; let o = FK.fkPlan(base); ok(o.down && o.atk, 'the bot answers GUARDS HIGH low');
  S.stance = 'low'; o = FK.fkPlan(base); ok(o.jump, 'the bot answers GUARDS LOW from a jump');
  S.stance = 'full'; P.x = e.x - 4; o = FK.fkPlan(base); ok(o.jump, 'the bot goes up for the plunge');
  P.ground = false; P.y = e.y - 40; o = FK.fkPlan(base); ok(o.down && o.atk, 'and comes down on him');
  P.ground = true; P.y = e.y; P.x = e.x - 80; e.mode = 'lash'; S.lash = { x: P.x + 40, y: P.y - 14, back: false }; o = FK.fkPlan({ ...base, rng: () => 0.1 }); ok(o.jump, 'the bot jumps the chain as it comes');
  e.mode = 'surgeTell'; e.modeT = 1; S.lash = null; P.x = G.bollards[1].x0 - 30; const mem = {}; FK.fkPlan({ ...base, mem }); o = FK.fkPlan({ ...base, mem, t: base.t + 0.5 }); ok(o.gx !== null && Math.abs(o.gx - (G.bollards[1].x0 + G.bollards[1].x1) / 2) < 20, 'at the surge it makes for a bollard');
  e.mode = 'spearTell'; S.spears = { spots: [P.x - 20, P.x, P.x + 20].map(x => ({ x })) }; o = FK.fkPlan(base); ok(o.gx !== null && (o.gx < P.x - 30 || o.gx > P.x + 30), 'at the spears it steps off the line');
  e.mode = 'plungeTell'; S.spears = null; S.plunge = { x: P.x }; o = FK.fkPlan(base); ok(o.gx !== null && Math.abs(o.gx - P.x) > FK.FK.plungeR, 'at the plunge it moves off the shadow'); }
/* THE MUSIC, THE AIR, THE LINES */
ok(SYNTH_BOSS.towpath && SYNTH_BOSS.fogknight && SYNTH_VARIANT['fogknight:p2'] && SYNTH_VARIANT['fogknight:p3'], 'the level bed and his three-phase theme are composed in code');
ok(L.music === 'towpath' && A.music === 'fogknight' && AMBIENT_NAMES.includes('towpath') && L.ambient.some(a => a.kind === 'towpath'), 'its own music and its own air (not the forest\'s)');
for (const f of ['towpath-hands.js', 'fog-knight.js', 'fog-knight-hands.js', 'fog-wraith.js']) { const src = readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
  for (const m of src.matchAll(/(?:number|hint)\([^;()]*?(?:'([A-Z](?:[^'\\]|\\.)*)'|"([A-Z][^"]*)")/g)) { const line = (m[1] || m[2]).replace(/\\'/g, "'"); if (line.length > 3) ok(isCallout(line), f + ': the line "' + line + '" is in src/hint-lines.js'); } }
void O;
console.log('towpath: ' + n + ' checks ok');
