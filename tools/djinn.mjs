// tools/djinn.mjs - THE DJINN OF THE GREAT WELL, held to Daniel's brief (claude/welltown5, 2026-10-03). Node only: the pure fight (src/djinn.js) is
// stepped against a fake world, no page; and the level and the tables that wire him.
//   EVERY MOVE TOLD          his moves by phase, each told mode wearing its mark in src/marks.js (! blockable, !! not), the breath HIGH (a duck goes under)
//   EVERY CYCLE CHANGES      no two cycles of a phase play the same order
//   HE ALWAYS FIGHTS         stepped alone for minutes in each phase he is never idle longer than his longest gap, and a minute alone opens nothing
//   EVERY OPENING IS WATER   P1 a pour turns him to MUD (and whirling, after, water is flung off: told); P2 he burns, a pour DOUSES him, and he FLARES back
//                            (told); P3 the flood rises and the great bucket down the shaft BAILS him out onto a ledge; his slammed hand glints and is struck;
//                            each opening >= 3 s, x openMul, capped; OPEN_RULE.djinn is the same predicate; the lines are in src/hint-lines.js
//   THE LEVEL                THE WELL TOWN's boss is the Djinn in the old well's hall; the Queen is benched (her module and stage are still callable)
// node tools/djinn.mjs
import assert from 'node:assert/strict';
import * as DJG from '../src/djinn.js';
import { MARK, HEIGHT, BY_HAND } from '../src/marks.js';
import { OPEN_RULE } from '../src/boss-greed.js';
import { CALL_LINES } from '../src/hint-lines.js';
import { LEVELS } from '../src/level.js';
import * as CQG from '../src/cistern-queen.js';
const { DJ, CYCLES, MOVES } = DJG;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };

/* THE BRIEF'S MOVES, by phase */
const SPEC = { 1: { 'sand lash': 'lash', 'sand blast': 'blast', 'dust devil': 'devil', 'SAND SPEARS (djinn2)': 'spears' }, 2: { 'fire lash': 'flash', 'fire breath': 'breath', 'flame pillars': 'pillars', 'THE FIRE DEVIL (djinn2)': 'firedevil' }, 3: { 'water spout grab': 'spout', 'wave': 'wave', 'hand slam': 'slam', 'THE WHIRLPOOL (djinn2)': 'whirl' } };
for (const ph of [1, 2, 3]) { const used = new Set(CYCLES[ph].flat()); for (const [nm, k] of Object.entries(SPEC[ph])) ok(used.has(k), 'P' + ph + ' ' + nm + ' (' + k + ') is in his phase-' + ph + ' cycles'); }
for (const [mode, m] of Object.entries(MOVES)) { const k = 'djinn|' + mode; ok(BY_HAND[k] === m.mark && MARK[k] === m.mark, k + ' wears ' + m.mark + ' (src/marks.js agrees)'); if (m.h === 'high') ok(HEIGHT[k] === 'high', k + ' is HIGH: a duck goes under it'); }
for (const ph of [1, 2, 3]) { const keys = CYCLES[ph].map(c => c.join(',')); ok(new Set(keys).size === keys.length && keys.length >= 3, 'phase ' + ph + ': ' + keys.length + ' cycles, no two the same order'); }

/* A FAKE WORLD */
const A = { djinn: { sx: 528, F: 56, vault: 40, top: 28, lr: 48 } }, G = DJG.geom(A, 16);
const said = [];
const world = () => ({ hit() {}, band() {}, number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, pull: (x, v, dt) => { pulls.push([x, v]); } });
const pulls = [];
function run(secs, o = {}) {
  const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid + 80, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'wake', modeT: 2, open: 0, alive: true };
  const hero = [{ x: o.x ?? G.mid - 60, y: G.floor, ground: true, alive: true, onLedge: o.ledge || null, pp: { snare: 0 } }], seen = new Set(); let idle = 0, maxIdle = 0, maxOpen = 0; const c = world();
  for (let t = 0; t < secs; t += 1 / 60) { if (o.hp) e.hp = o.hp(t, e); if (o.each) o.each(t, e, S, c, hero[0]); DJG.stepDjinn(e, S, 1 / 60, hero, c); seen.add(e.mode);
    if (e.mode === 'walk' || e.mode === 'hover') { idle += 1 / 60; maxIdle = Math.max(maxIdle, idle); } else idle = 0; maxOpen = Math.max(maxOpen, e.open || 0); }
  return { S, e, seen, maxIdle, maxOpen, c, hero: hero[0] };
}
{ const r = run(120); ok(r.maxOpen === 0 && r.maxIdle <= 0.8, 'P1, two minutes alone: nothing opens him and he is never idle more than ' + r.maxIdle.toFixed(2) + ' s'); ok(['lashTell', 'blastTell', 'devilTell', 'spearsTell'].every(m => r.seen.has(m)), 'P1: the lash, the blast, the dust devil and the SAND SPEARS come'); }
{ const r = run(120, { hp: () => 600 }); ok(r.seen.has('firedevilTell'), 'P2: THE FIRE DEVIL comes'); }
{ const r = run(120, { hp: () => 600 }); ok(r.S.ph === 2 && r.S.burn && r.maxOpen === 0 && ['flashTell', 'breathTell', 'pillarTell'].every(m => r.seen.has(m)), 'P2: he catches fire and stays alight alone; the fire lash, the breath and the pillars come');
  ok(said.includes('HE CATCHES FIRE: DOUSE HIM WITH WATER'), 'P2 is told: HE CATCHES FIRE: DOUSE HIM WITH WATER'); }
{ const r = run(120, { hp: () => 300 }); ok(r.S.ph === 3 && r.S.flood && r.S.water >= DJ.waterH - 0.5 && r.S.pose === 'column' && ['spoutTell', 'waveTell', 'slamTell'].every(m => r.seen.has(m)) && r.maxOpen === 0, 'P3: the hall floods, he rises in the shaft, the spout, the wave and the hand slam come - and alone nothing opens him');
  ok(r.S.n.hands > 0 && said.includes('HIS HAND RESTS THERE: STRIKE IT'), 'P3: his slammed hand stays on the ledge, told (HIS HAND RESTS THERE: STRIKE IT)'); }
/* THE OPENINGS */
ok(DJ.openT >= 3 && DJ.bailT >= 3 && DJ.mudT >= 2.4 && DJ.mudT < 3 && DJ.openCap > 0 && DJ.openCap <= 0.15, 'his openings: mud ' + DJ.mudT + ' s (Daniel 10-03: 3.2 -> ~2.5, flung off sooner), the douse ' + DJ.openT + ' s, the bail ' + DJ.bailT + ' s (you wade in); one takes no more than ' + DJ.openCap * 100 + '% of him');
{ const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }, c = world();
  ok(DJG.pourAim(e, S, { x: G.mid - 50, y: G.floor, face: 1 }) && !DJG.pourAim(e, S, { x: G.mid - 50, y: G.floor, face: -1 }) && !DJG.pourAim(e, S, { x: G.mid - 200, y: G.floor, face: 1 }), 'a pour reaches him only facing him, near');
  ok(DJG.pourAt(e, S, { x: G.mid - 50, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'mud' && e.open >= 2.4 && DJG.djOpen(e) && OPEN_RULE.djinn(e), 'P1: a pour turns him to MUD - open (OPEN_RULE agrees)');
  for (let i = 0; i < 60 * (DJ.mudT + 0.2); i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.mid - 50, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(!DJG.djOpen(e) && S.ward > DJ.wardT - 0.5 && said.includes('HE DRIES BACK TO SAND') && said.includes(DJG.WARD_LINE[1][0]), 'he dries back to sand and WARDS (told: ' + DJG.WARD_LINE[1][0] + ')');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'off' && !DJG.djOpen(e) && said.includes('THE SAND HARDENS: THE WATER RUNS OFF'), 'warded, a pour runs off him (told): no re-mud');
  for (let i = 0; i < 60 * DJ.wardT + 5; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: e.x - 50, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(S.ward === 0 && said.includes('HIS WARD FALLS') && DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open', 'his ward falls (told) after ' + DJ.wardT + ' s, and a pour takes again'); }
{ const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 600, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }, c = world(), H = [{ x: G.mid - 50, y: G.floor, ground: true, alive: true, pp: {} }];
  for (let i = 0; i < 90; i++) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.ph === 2 && S.burn, 'into phase two: he burns');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'doused' && !S.burn && said.includes('DOUSED: SMOKE AND CLAY. CUT HIM'), 'P2: a pour DOUSES him - open, the fire out (told)');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'wasted' || !DJG.pourAim(e, S, { x: e.x - 50, y: G.floor, face: 1 }), 'open, a second pour is not taken');
  let t = 0; for (; t < 20 && !(S.ward > 0); t += 1 / 60) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.burn && S.ward > DJ.wardT - 0.1 && said.includes(DJG.WARD_LINE[2][0]) && t >= DJ.openT - 0.05, 'he FLARES WHITE-HOT (his ward, told) ' + t.toFixed(1) + ' s after the douse, alight again');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'off' && !DJG.djOpen(e) && said.includes('WHITE-HOT: THE WATER HISSES AWAY'), 'white-hot, a pour hisses away (told): no re-douse');
  for (let i = 0; i < 60 * DJ.wardT + 5; i++) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.ward === 0 && S.burn && DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open', 'his ward falls and he burns: a pour douses him again'); }
/* P3: THE BUCKET BAILS HIM WHERE HE IS (claude/djinn2, Daniel 10-03: no teleport - nothing moves you, him, or a platform: you wade in) */
{ let x0 = null, hx = null; const r = run(40, { hp: () => 300, each: (t, e, S, c, h) => { if (S.pose === 'column' && e.mode === 'hover' && S.bucket.st === 'up' && !S.struck) { S.struck = 1; x0 = e.x; hx = h.x; S.bucket.who = { x: G.ledgeE[0] + 30, onLedge: 'E' }; DJG.strikeWindlass(e, S, c); }
    if (e.mode === 'bailed') { S.bx = e.x; S.by = e.y; } if (S.n.bailed && e.mode !== 'bailed' && S.ward > 0 && S.wardSeen == null) S.wardSeen = S.ward; } });
  ok(r.S.n.bailed >= 1 && said.includes('THE BUCKET BAILS HIM OUT: WADE IN AND CUT HIM'), 'P3: the great bucket down the shaft BAILS him out (told: WADE IN AND CUT HIM)');
  ok(r.S.bx === x0 && Math.abs(r.S.bx - G.mid) < 1 && r.S.by === G.floor && r.hero.x === hx, 'he is bailed out WHERE HE IS - under the shaft, in the flood (x ' + r.S.bx + ' = the shaft ' + G.mid + '); the hero is not moved');
  ok(r.maxOpen >= 3, 'he lies spilled in the flood, open ' + r.maxOpen.toFixed(1) + ' s');
  ok(r.S.wardSeen > DJ.wardT - 0.2 && said.includes(DJG.WARD_LINE[3][0]), 'then A SHROUD OF WATER spins round him (his ward, told)'); }
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'hover', modeT: 5, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.ward = 2;
  DJG.strikeWindlass(e, S, c); for (let i = 0; i < 60; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.windlass, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(!DJG.djOpen(e) && said.includes('HIS SHROUD TURNS THE BUCKET'), 'warded, the bucket is turned (told): no re-bail'); }
/* THE WARD: after EVERY opening, >= 2.5 s, told; nothing re-opens him in it (each phase checked above) */
ok(DJ.wardT >= 2.5 && DJ.wardT <= 3.5 && [1, 2, 3].every(p => DJG.WARD_LINE[p] && CALL_LINES.has(DJG.WARD_LINE[p][0])), 'his ward is ' + DJ.wardT + ' s after every opening, a told line for each phase');
/* THE NEW MOVES, one a phase (claude/djinn2) */
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid + 80, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 0.01, open: 0, alive: true }, hero = { x: G.mid - 40, y: G.floor, ground: true, alive: true, pp: {} };
  S.script = ['spears']; S.step = 0; S.cycle = 0; const marks = [], hits = []; c.hit = (bx, d, name) => { if (name === DJG.MOVE_NAME.spear) hits.push(bx); };
  for (let i = 0; i < 60 * 4; i++) { if (i % 20 === 0) hero.x += 30; DJG.stepDjinn(e, S, 1 / 60, [hero], c); for (const m of S.marks) if (m.k === 'spear' && !marks.some(q => q.key === m.key)) marks.push({ key: m.key, x: m.x, hx: hero.x }); }
  ok(marks.length === DJ.spearN && marks.every(m => Math.abs(m.x - m.hx) < 1) && hits.length > 0, 'SAND SPEARS: ' + marks.length + ' glows, each under the hero where he stood, then they erupt');
  ok(DJG.MOVES.spearsTell.mark === '!!' && DJ.spearTell >= 0.6, 'each spear glows ' + DJ.spearTell + ' s before it erupts (!!: move)'); }
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 600, maxHp: 1000, face: -1, mode: 'walk', modeT: 0.01, open: 0, alive: true }; S.ph = 2; S.burn = true; S.script = ['firedevil']; S.step = 0;
  let born = null, turns = 0, dir = 0, out = false; for (let i = 0; i < 60 * 8; i++) { DJG.stepDjinn(e, S, 1 / 60, [{ x: G.x0 + 40, y: G.floor, ground: true, alive: true, pp: {} }], c); const b = S.bands.find(q => q.k === 'firedevil');
    if (b) { if (born == null) born = i; if (dir && b.dir !== dir) turns++; dir = b.dir; if (b.x < G.x0 || b.x > G.x1) out = true; } else if (born != null && S.lifeEnd == null) S.lifeEnd = (i - born) / 60; }
  ok(born != null && turns >= 1 && !out && Math.abs(S.lifeEnd - DJ.fdevilLife) < 0.2, 'THE FIRE DEVIL roams the floor ' + S.lifeEnd + ' s, turning at the walls (' + turns + ' turns), never past one'); }
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'hover', modeT: 0.01, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.script = ['whirl']; S.step = 0; pulls.length = 0;
  for (let i = 0; i < 60 * 5; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.windlass, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(pulls.length >= 60 * (DJ.whirlT - 0.1) && pulls.every(([x]) => x === G.mid) && DJ.whirlPull < 100, 'THE WHIRLPOOL pulls toward the shaft for ' + (pulls.length / 60).toFixed(1) + ' s at ' + DJ.whirlPull + ' px/s (a walk against it wins)'); }
/* THE HIGH RIPPLES (claude/djinn2 - P3 bug): every wave runs where it is drawn and hits - the floor's bore inside the hall, each ledge's crest on its ledge,
   nothing in the open air over the hall, nothing past a wall; and the bore is low enough to jump */
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'hover', modeT: 0.01, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.script = ['wave']; S.step = 0;
  const bad = [], seenL = { W: 0, E: 0 }, bandsHit = []; c.band = (kind, y, x0, x1, d, name, key) => bandsHit.push({ y, x0, x1, key });
  for (let i = 0; i < 60 * 4; i++) { DJG.stepDjinn(e, S, 1 / 60, [{ x: G.windlass, y: G.floor, ground: true, alive: true, pp: {} }], c);
    for (const b of S.bands) { if (b.delay > 0) continue; const [lo, hi] = DJG.bandSpan(S, b); if (b.x < lo - 4 || b.x > hi + 4) bad.push(b.k + (b.ledge ? ' ledge' : '') + ' at ' + b.x.toFixed(0));
      if (b.ledge) { const L = b.dir < 0 ? G.ledgeW : G.ledgeE; seenL[b.dir < 0 ? 'W' : 'E']++; if (b.x < L[0] || b.x > L[1]) bad.push('a ledge crest off its ledge at ' + b.x.toFixed(0)); } } }
  const highHits = bandsHit.filter(h => h.y[1] <= G.ledgeY + 1), offLedge = highHits.filter(h => { const x = (h.x0 + h.x1) / 2; return !((x >= G.ledgeW[0] && x <= G.ledgeW[1]) || (x >= G.ledgeE[0] && x <= G.ledgeE[1])); });
  ok(!bad.length && seenL.W > 0 && seenL.E > 0 && offLedge.length === 0, 'THE HIGH RIPPLES: each ledge crest runs on its ledge only (W ' + seenL.W + ' / E ' + seenL.E + ' frames), none hits over the open hall (' + offLedge.length + '), none past a wall ' + JSON.stringify(bad.slice(0, 3)));
  ok(DJ.boreH <= 36 && DJ.crestH <= 20, 'the floor bore is ' + DJ.boreH + ' px high and the ledge crest ' + DJ.crestH + ': both jumpable'); }
{ const S = DJG.newShow(G); S.hand = { x: G.ledgeE[0] + 30, y: G.ledgeY - 6, stay: 1, landed: true }; ok(DJG.handOut(S) && OPEN_RULE.djinn({ mode: 'reach', open: 0, hand: 1 }) && !OPEN_RULE.djinn({ mode: 'reach', open: 0, hand: 0 }), 'his slammed hand is out (and OPEN_RULE lets a blow on it land)'); }
/* THE LINES, THE LEVEL, THE BENCH */
const lines = [...new Set(said)].filter(s => !/^!+$/.test(s)); ok(lines.every(s => CALL_LINES.has(s)), 'every line he says is a teaching line in src/hint-lines.js (' + lines.length + ')');
{ const lv = LEVELS.find(l => l.id === 'welltown'), L = lv.build(); ok(L.arena.boss === 'djinn' && L.ents.some(e => e.t === 'djinn') && !L.ents.some(e => e.t === 'cisternqueen'), "THE WELL TOWN's boss is THE DJINN in the old well's hall; the Cistern Queen is not placed");
  ok(typeof CQG.stageCisternQueen === 'function' && typeof CQG.stepQueen === 'function', 'the Cistern Queen is benched, not deleted: her stage and her fight are still callable (tools/cistern-queen.mjs holds her)'); }
console.log('djinn: ' + n + ' checks pass');
