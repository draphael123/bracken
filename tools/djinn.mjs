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
const banners = [];
const world = () => ({ hit() {}, band() {}, banner: (t, sub) => banners.push(t), number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {}, pull: (x, v, dt) => { pulls.push([x, v]); } });
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
ok(DJ.openT >= 3.8 && DJ.bailT >= 4.8 && DJ.mudT >= 3.3 && DJ.mudT <= 5.0 && DJ.openMul >= 2.4 && DJ.openMul <= 2.6 && DJ.openCap > 0 && DJ.openCap <= 0.1, 'his openings (claude/djinn3, Daniel 10-04 "a little too hard": stunned longer, more damage): mud ' + DJ.mudT + ' s (was 2.5), the douse ' + DJ.openT + ' s (was 3.2), the bail ' + DJ.bailT + ' s (was 4.2); x' + DJ.openMul + ' (was x1.9), one takes no more than ' + DJ.openCap * 100 + '% of him (no one-shot)');
{ const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }, c = world();
  ok(DJG.pourAim(e, S, { x: G.mid - 50, y: G.floor, face: 1 }) && !DJG.pourAim(e, S, { x: G.mid - 50, y: G.floor, face: -1 }) && !DJG.pourAim(e, S, { x: G.mid - 200, y: G.floor, face: 1 }), 'a pour reaches him only facing him, near');
  ok(DJG.pourAt(e, S, { x: G.mid - 50, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'mud' && e.open >= 2.4 && DJG.djOpen(e) && OPEN_RULE.djinn(e), 'P1: a pour turns him to MUD - open (OPEN_RULE agrees)');
  for (let i = 0; i < 60 * (DJ.mudT + 0.2); i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.mid - 50, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(!DJG.djOpen(e) && S.ward > DJ.wardT - 0.5 && said.includes('HE DRIES BACK TO SAND') && said.includes(DJG.WARD_LINE[1][0]), 'he dries back to sand and WARDS (told: ' + DJG.WARD_LINE[1][0] + ')');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'off' && !DJG.djOpen(e) && said.includes('THE SAND HARDENS: THE WATER RUNS OFF'), 'warded, a pour runs off him (told): no re-mud');
  for (let i = 0; i < 60 * DJ.wardT + 5; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: e.x - 50, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(S.ward === 0 && said.includes('HIS WARD FALLS') && DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open', 'his ward falls (told) after ' + DJ.wardT + ' s, and a pour takes again'); }
{ const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 600, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }, c = world(), H = [{ x: G.mid - 50, y: G.floor, ground: true, alive: true, pp: {} }];
  for (let i = 0; i < 90; i++) DJG.stepDjinn(e, S, 1 / 60, H, c); for (let i = 0; i < 600 && DJG.TURNING.has(e.mode) || i < 90 && e.mode !== 'walk'; i++) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.ph === 2 && S.burn && !DJG.TURNING.has(e.mode), 'into phase two (after his turn): he burns');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'doused' && !S.burn && said.includes('DOUSED: SMOKE AND CLAY. CUT HIM'), 'P2: a pour DOUSES him - open, the fire out (told)');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'wasted' || !DJG.pourAim(e, S, { x: e.x - 50, y: G.floor, face: 1 }), 'open, a second pour is not taken');
  let t = 0; for (; t < 20 && !(S.ward > 0); t += 1 / 60) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.burn && S.ward > DJ.wardT - 0.1 && said.includes(DJG.WARD_LINE[2][0]) && t >= DJ.openT - 0.05, 'he FLARES WHITE-HOT (his ward, told) ' + t.toFixed(1) + ' s after the douse, alight again');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'off' && !DJG.djOpen(e) && said.includes('WHITE-HOT: THE WATER HISSES AWAY'), 'white-hot, a pour hisses away (told): no re-douse');
  for (let i = 0; i < 60 * DJ.wardT + 5; i++) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.ward === 0 && S.burn && DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open', 'his ward falls and he burns: a pour douses him again'); }
/* P3: THE BUCKET BAILS HIM WHERE HE IS (claude/djinn2, Daniel 10-03: no teleport - nothing moves you, him, or a platform: you wade in) */
ok(DJ.bailCap > DJ.openCap && DJ.bailCap <= 0.1, 'a bail (two steps to earn) takes up to ' + DJ.bailCap * 100 + '% of him, a mud or a douse ' + DJ.openCap * 100 + '%');
/* HE IS FAST - BUT EVERY BLOW IS READABLE (claude/djinn3, Daniel 10-04: "incredibly FAST in the other sections - probably okay, but make sure he's balanced"): every
   P1/P2 tell is >= 0.5 s (a human's quarter-second to see it and a quarter to answer), the gaps between blows >= 0.5 s */
{ const tells = { lash: DJ.lashTell, blast: DJ.blastTell, devil: DJ.devilTell, spear: DJ.spearTell, breath: DJ.breathTell, pillar: DJ.pillarTell, firedevil: DJ.fdevilTell };
  ok(Object.values(tells).every(t => t >= 0.5) && DJ.gap[0] >= 0.5 && DJ.gap[1] >= 0.5, 'his phase-one and phase-two tells: ' + Object.entries(tells).map(([k, t]) => k + ' ' + t).join(', ') + ' s; gaps ' + DJ.gap.slice(0, 2).join(' / ') + ' s - all readable'); }
/* THE TWO-STEP BAIL (claude/djinn3): in the flood the bucket lies DOWN - a strike winds it up, a strike drops it; on him only under the shaft */
{ let x0 = null, hx = null, wound = 0; const r = run(60, { hp: () => 300, each: (t, e, S, c, h) => {
    if (S.pose === 'column' && S.bucket.st === 'down' && !(S.bucket.t > 0) && !S.n.bailed && e.mode !== 'rise') { if (DJG.strikeWindlass(e, S, c)) wound++; }
    if (S.pose === 'column' && S.bucket.st === 'up' && DJG.underShaft(e, S) && !(S.ward > 0) && !S.n.bailed && !S.struck) { S.struck = 1; hx = h.x; S.bucket.who = { x: G.ledgeE[0] + 30, onLedge: 'E' }; DJG.strikeWindlass(e, S, c); }
    if (S.bucket.st === 'fall') x0 = e.x;
    if (e.mode === 'bailed') { S.bx = e.x; S.by = e.y; } if (S.n.bailed && e.mode !== 'bailed' && S.ward > 0 && S.wardSeen == null) S.wardSeen = S.ward; } });
  ok(wound >= 1 && said.includes('THE BUCKET WINDS UP: STRIKE OR E AGAIN TO DROP IT') && said.includes('THE BUCKET HANGS READY: DROP IT WHEN HE IS UNDER THE SHAFT'), 'P3: the bucket lies in the flood - a strike WINDS it up (told), and it hangs ready (told): the bail is two steps');
  ok(r.S.n.bailed >= 1 && said.includes('THE BUCKET BAILS HIM OUT: WADE IN AND CUT HIM'), 'P3: dropped while he is under the shaft, the great bucket BAILS him out (told: WADE IN AND CUT HIM)');
  ok(r.S.bx === x0 && Math.abs(r.S.bx - G.mid) <= DJ.shaftR && r.S.by === G.floor && r.hero.x === hx, 'he is bailed out WHERE HE IS - under the shaft, in the flood (x ' + r.S.bx.toFixed(0) + ', the shaft ' + G.mid + '); the hero is not moved');
  ok(r.maxOpen >= 3, 'he lies spilled in the flood, open ' + r.maxOpen.toFixed(1) + ' s');
  ok(r.S.wardSeen > DJ.wardT - 0.2 && said.includes(DJG.WARD_LINE[3][0]), 'then A SHROUD OF WATER spins round him (his ward, told)'); }
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'hover', modeT: 5, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.ward = 2;
  DJG.strikeWindlass(e, S, c); for (let i = 0; i < 60; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.windlass, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(!DJG.djOpen(e) && said.includes('HIS SHROUD TURNS THE BUCKET'), 'warded, the bucket is turned (told): no re-bail'); }
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid + 120, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'hover', modeT: 5, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.bucket = { st: 'up', t: 0 };
  DJG.strikeWindlass(e, S, c); for (let i = 0; i < 60; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.windlass, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(!DJG.djOpen(e) && S.n.misses === 1 && said.includes('IT MISSES: HE WAS NOT UNDER THE SHAFT') && S.bucket.st === 'down', 'dropped while he is away from the shaft, the bucket MISSES (told) and lies in the flood again: wind it again'); }
/* (claude/archmage4, Daniel approved 10-05) THE WINDLASS BY HAND: in the flood E at the windlass winds it and drops it as a strike does; away from it, or
   before the flood, E does nothing to it (it keeps its pour) */
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'hover', modeT: 5, open: 0, alive: true }, w = { x: G.windlass, y: G.floor };
  S.ph = 2; const before = DJG.windByHand(e, S, { x: G.windlass, y: G.floor }, w, c) || S.bucket.st !== 'up';
  S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.bucket = { st: 'down', t: 0 };
  const far = DJG.windByHand(e, S, { x: G.windlass + DJG.WIND_R + 12, y: G.floor }, w, c), wound = DJG.windByHand(e, S, { x: G.windlass + 10, y: G.floor }, w, c) && S.bucket.st === 'wind';
  for (let i = 0; i < 60 * DJ.windT + 5; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.windlass, y: G.floor, ground: true, alive: true, pp: {} }], c);
  const up = S.bucket.st === 'up', dropped = up && DJG.windByHand(e, S, { x: G.windlass - 10, y: G.floor }, w, c) && S.bucket.st === 'fall';
  ok(!before && !far && wound && up && dropped && S.n.byHand === 2, 'P3: E at the windlass WINDS the bucket up and DROPS it, as a strike does (2 by hand); out of reach (' + (DJG.WIND_R + 12) + ' px) or before the flood, E leaves it alone'); }
/* THE TIDE (claude/djinn3, Daniel 10-04: "make the flood work against you"): low -> the surge told -> over the ledges -> it ebbs, again and again */
{ const hits = []; let maxW = 0, minAfter = 1e9, sawSurge = false, cyc = 0, last = null; const r = run(70, { hp: () => 300, x: G.ledgeE[0] + 30, ledge: 'E', each: (t, e, S, c, h) => { h.y = G.ledgeY;
    if (!c.tapped) { c.tapped = 1; c.hit = (bx, d, name, o = {}) => { if (o.flood && h.y > bx[2] - 2 && h.y < bx[3] + 24) hits.push({ t, name, w: S.water }); }; }
    maxW = Math.max(maxW, S.water); if (S.tide.st === 'surge') sawSurge = true; if (last === 'ebb' && S.tide.st === 'low') cyc++; last = S.tide.st; if (cyc >= 1) minAfter = Math.min(minAfter, S.water); } });
  const ledgeHits = hits.filter(q => q.name === DJG.MOVE_NAME.flood && q.w > G.floor - G.ledgeY);
  ok(sawSurge && said.includes('THE WELL SURGES: THE LEDGES GO UNDER') && maxW >= DJG.highWater(G) - 0.5 && DJG.highWater(G) > G.floor - G.ledgeY, 'THE TIDE: the surge is told and the water rises OVER THE LEDGES (' + maxW.toFixed(0) + ' px, the ledges at ' + (G.floor - G.ledgeY) + ')');
  ok(ledgeHits.length === 0 && DJ.dmg.flood === 0, 'while the well is high a hero on a ledge stands in it - wet, and SAFE: the flood itself costs nothing (claude/djinn4, Daniel 10-05 "no damage from the flood without a tell": a safe spot always exists; ' + ledgeHits.length + ' ticks)');
  ok(cyc >= 1 && minAfter <= DJ.waterH + 0.5 && said.includes('THE WATER FALLS BACK: THE LEDGES ARE DRY'), 'and it ebbs back to ' + minAfter.toFixed(0) + ' px (told): the ledges come back - ' + cyc + ' full cycle(s) in a minute');
  ok(DJ.surgeTell >= 1.2 && DJ.tideRise >= 1.0, 'the surge is told ' + DJ.surgeTell + ' s before it rises, and it takes ' + DJ.tideRise + ' s to reach the ledges: time to climb'); }
/* (claude/djinn5, Daniel 10-06: "you should never take damage just from being in the water ... not a fair mechanic" - djinn4's 'the deep floor bites' is gone by
   his design, not weakened): a hero who stands on the floor by the windlass through two full tides - low, the surge, HIGH over the ledges, the ebb - and
   never answers anything: every blow that reaches him is one of his told moves; nothing comes from the water itself */
{ const got = [], sts = new Set(); run(70, { hp: () => 300, x: G.windlass, each: (t, e, S, c, h) => { sts.add(S.tide.st); if (!c.tapped) { c.tapped = 1; c.hit = (bx, d, name, o = {}) => { if (d > 0 && S.ph === 3 && h.y >= bx[2] && h.y <= bx[3] + 24) got.push({ name, flood: !!o.flood, key: o.key || '' }); }; } } });
  const water = got.filter(q => q.name === 'THE FLOOD' || q.name === 'THE DEEP WATER' || (q.flood && q.name !== DJG.MOVE_NAME.whirl));
  ok(sts.has('high') && sts.has('ebb') && water.length === 0 && !('deep' in DJ.dmg) && !('deep' in DJG.P3_HARMS) && !('deep' in DJG.MOVE_NAME) && DJ.dmg.flood === 0,
    'NO PASSIVE WATER DAMAGE: on the floor through the high water and the low, a hero who never answers takes nothing from the water itself (' + water.length + ' water blows; ' + got.length + ' told blows: ' + [...new Set(got.map(q => q.name))].join(', ') + ') - no DEEP WATER in his table, his harms or his names'); }
/* HE STRIKES UP FROM BELOW (claude/djinn3): bubbles under you on your ledge, then his fist, then it rests (his hand) */
{ const S = DJG.newShow(G), c = world(), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 300, maxHp: 1000, face: 1, mode: 'hover', modeT: 0.01, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.script = ['upsurge']; S.step = 0; S.tide = { st: 'low', t: 99 };
  const hero = { x: G.ledgeE[0] + 40, y: G.ledgeY, ground: true, alive: true, onLedge: 'E', pp: {} }; let mark = null, hit = null, hand = null; c.hit = (bx, d, name) => { if (name === DJG.MOVE_NAME.upsurge) hit = bx; };
  for (let i = 0; i < 60 * 6 && !hand; i++) { DJG.stepDjinn(e, S, 1 / 60, [hero], c); const m = S.marks.find(q => q.k === 'bubbles'); if (m && !mark) mark = { ...m }; if (S.hand && hit) hand = { ...S.hand }; }
  ok(mark && Math.abs(mark.x - hero.x) < 1 && mark.y === G.ledgeY && DJG.MOVES.upsurgeTell.mark === '!!' && DJ.upTell >= 0.8, 'HE STRIKES UP FROM BELOW: bubbles boil under the hero ON HIS LEDGE (' + DJ.upTell + ' s, !!) - told');
  ok(hit && hit[0] < hero.x && hit[1] > hero.x && hand && Math.abs(hand.x - hero.x) < 1 && said.includes('BUBBLES UNDER YOU: HE STRIKES FROM BELOW'), 'his fist bursts up there, and rests on the ledge (his hand: strike it)'); }
/* THE COLUMN ROAMS (claude/djinn3): he moves through the flood between blows, and goes to the shaft for the wave, the whirlpool and his draw */
{ const xs = [], atShaft = {}; const r = run(90, { hp: () => 300, x: G.ledgeE[0] + 30, each: (t, e, S) => { if (S.pose === 'column') xs.push(e.x); for (const k of ['waveTell', 'whirlTell', 'drawing']) if (e.mode === k) atShaft[k] = (atShaft[k] || 0) + (Math.abs(e.x - G.mid) <= 6 ? 0 : 1); } });
  const span = Math.max(...xs) - Math.min(...xs);
  ok(span > 120 && r.seen.has('glide') && r.S.n.draws > 0 && Object.keys(atShaft).length >= 2 && Object.values(atShaft).every(v => v === 0), 'in the flood he ROAMS (' + span.toFixed(0) + ' px across the hall) and the wave, the whirlpool and his draw come from under the shaft');
  ok(said.includes('HE DRAWS UNDER THE SHAFT: DROP THE BUCKET'), 'he DRAWS under the shaft once a cycle, told: HE DRAWS UNDER THE SHAFT: DROP THE BUCKET'); }
/* THE TURNS (claude/djinn3, Daniel 10-04: "no phase-transition animation"): told, a banner, and a breather */
{ banners.length = 0; const modes = []; let hitIn = 0; const r = run(40, { hp: (t) => t < 6 ? 1000 : t < 20 ? 600 : 300, each: (t, e, S, c) => { if (!c.tapped) { c.tapped = 1; const h0 = c.hit; c.hit = (...a) => { if (DJG.TURNING.has(e.mode)) hitIn++; }; c.band = (...a) => { if (DJG.TURNING.has(e.mode)) hitIn++; }; }
    if (!modes.length || modes[modes.length - 1] !== e.mode) modes.push(e.mode); } });
  const i1 = modes.indexOf('collapse'), i2 = modes.indexOf('reform'), i3 = modes.indexOf('hiss'), i4 = modes.indexOf('rise');
  ok(i1 >= 0 && i2 === i1 + 1 && i3 > i2 && i4 === i3 + 1, 'the turns: the sand COLLAPSES then RE-FORMS as fire (' + DJ.collapseT + ' + ' + DJ.reformT + ' s); the fire HISSES OUT and he RISES from the water (' + DJ.hissT + ' + ' + DJ.floodT + ' s)');
  ok(banners.includes(DJG.TURN_LINE[2][0]) && banners.includes(DJG.TURN_LINE[3][0]) && r.S.n.turns === 2, 'each turn has its banner: ' + banners.join(' / '));
  ok(hitIn === 0, 'nothing hits you while he turns (a breather): ' + hitIn + ' blows'); }
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
/* ======== claude/djinn4 (Daniel 10-05, "the Djinn is in much better shape" - the flood): EVERY P3 HIT AVOIDABLE, A SLOWER P3, LESS P3 DAMAGE, THE PAIL ======== */
/* the flood as djinn3 shipped it, for the ratios */
const P3_WAS = { tell: { upTell: 0.9, spoutTell: 0.85, waveTell: 0.8, slamTell: 0.8, whirlTell: 0.9, surgeTell: 1.6 }, gap: 0.65, colWalk: 100,
  dmg: { spout: 16, held: 24, wave: 26, slam: 26, whirl: 10, deep: 4, upsurge: 22, flood: 1 } };
ok(Object.entries(P3_WAS.tell).every(([k, v]) => DJ[k] >= v * 1.18 - 1e-9) && DJ.gap[2] >= P3_WAS.gap * 1.18 && DJ.colWalk <= P3_WAS.colWalk * 0.85,
  'P3 SLOWER (~20%): every windup x' + Math.min(...Object.entries(P3_WAS.tell).map(([k, v]) => DJ[k] / v)).toFixed(2) + '+ (' + Object.keys(P3_WAS.tell).map(k => k + ' ' + DJ[k]).join(', ') + '), the gap ' + P3_WAS.gap + ' -> ' + DJ.gap[2] + ' s, his glide ' + P3_WAS.colWalk + ' -> ' + DJ.colWalk + ' px/s');
{ const D = k => DJ.dmg[k] || 0, ks = Object.keys(P3_WAS.dmg).filter(k => k !== 'flood'),   /* (claude/djinn5: the deep water is gone - it counts as 0) */ mean = ks.reduce((a, k) => a + D(k) / P3_WAS.dmg[k], 0) / ks.length;
ok(ks.every(k => D(k) <= P3_WAS.dmg[k] * 0.9) && mean <= 0.86 && DJ.dmg.flood === 0, 'P3 LESS DAMAGE (~15%: x' + mean.toFixed(3) + ' on average, none less than 10% off): ' + Object.keys(P3_WAS.dmg).map(k => k + ' ' + P3_WAS.dmg[k] + '->' + DJ.dmg[k]).join(', ') + ' (the shallow flood costs nothing)'); }
/* EVERY P3 HARM IS LISTED, TOLD >= 0.6 s, AND HAS AN ANSWER */
{ const names = new Set(Object.keys(DJG.P3_HARMS).map(k => DJG.MOVE_NAME[k]));
  for (const [k, h] of Object.entries(DJG.P3_HARMS)) ok(h.t() >= 0.6 && ['dodge', 'jump', 'duck', 'block'].includes(h.answer) && h.where && h.how && (h.tell === 'surge' || (MOVES[h.tell] && MOVES[h.tell].mark === '!!')),
    'P3 harm ' + k.toUpperCase() + ' (' + DJG.MOVE_NAME[k] + '): told ' + h.t().toFixed(2) + ' s by ' + h.where + ' - answer ' + h.answer + ': ' + h.how);
  ok(Object.keys(DJG.P3_HARMS).every(k => DJ.dmg[k] > 0 && k !== 'deep' && k !== 'flood'), 'every listed P3 harm is one of his BLOWS (claude/djinn5: no harm from the water itself - the deep floor is off the list): ' + Object.keys(DJG.P3_HARMS).join(', '));
  /* nothing else hurts in the flood: two minutes of P3 against a hero who never answers - every blow that lands is on the list */
  const got = new Set(); run(120, { hp: () => 300, each: (t, e, S, c) => { if (!c.tap2) { c.tap2 = 1; c.hit = (bx, d, name) => { if (S.ph === 3 && d > 0) got.add(name); }; c.band = (k2, y, x0, x1, d, name) => { if (S.ph === 3 && d > 0) got.add(name); }; } } });
  ok(got.size >= 4 && [...got].every(n2 => names.has(n2)), 'two minutes of the flood: every blow he throws is a listed P3 harm (' + [...got].join(', ') + ')'); }
/* THE ANSWERING HERO: a player who reads every tell a third of a second late and answers it as P3_HARMS says - steps off the rings, jumps the bore
   and the crests, wades out of the whirlpool, climbs a ledge when the well surges - at the game's own RUN (92 px/s), climb (74) and jump (JUMPV -320,
   GRAV 1000). Six homes across the hall, two minutes each: he is never hit. (No pail: the answers alone are enough) */
{ const RUN = 92, CLIMB = 74, JV = -320, GR = 1000, REACT = 0.3, dt = 1 / 60, total = {}; let maxHits = 0;
  for (const home of [G.x0 + 60, G.x0 + 200, G.mid - 40, G.mid + 70, G.x1 - 180, G.x1 - 50]) {
    const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid + 80, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode: 'wake', modeT: 2, open: 0, alive: true };
    const h = { x: home, y: G.floor, base: G.floor, vy: 0, air: false, onLedge: null, climb: null, snare: 0 }, seenAt = new Map(), hits = [], dodge = new Map(); let tNow = 0;
    const box = () => [h.x - 6, h.x + 6, h.y - 26, h.y];
    const lap = (a, b) => a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2];
    const keys = new Set(), hurt = (name, key) => { if (keys.has(key)) return; keys.add(key); hits.push(name); };
    const c = { ...world(), hit: (bx, d, name, o = {}) => { if (!(d > 0)) return; if (o.flood && h.y < G.floor - S.water + 4) return; if (lap(bx, box())) hurt(name, o.key || name); },
      band: (kind, [t0, b0], x0, x1, d, name, key) => { if (h.x < x0 || h.x > x1) return; const bb = box(); if (bb[3] > t0 && bb[2] < b0) hurt(name, key); },
      grab: (bx, key) => { if (lap(bx, box())) { hurt(DJG.MOVE_NAME.spout, key + 'g'); h.snare = 1; return { pp: {} }; } return null; },
      pull: (x, v, dt2) => { if (!h.onLedge && !h.climb && DJG.inFlood(S, h)) h.x += Math.sign(x - h.x) * Math.min(Math.abs(x - h.x), v * dt2); } };
    const seen = k => { if (!seenAt.has(k)) seenAt.set(k, tNow); return tNow - seenAt.get(k) >= REACT; };
    const span = () => h.onLedge === 'W' ? [G.ledgeW[0] + 8, G.ledgeW[1] - 4] : h.onLedge === 'E' ? [G.ledgeE[0] + 4, G.ledgeE[1] - 8] : [G.x0 + 8, G.x1 - 8];
    for (; tNow < 125; tNow += dt) {
      DJG.stepDjinn(e, S, dt, [{ x: h.x, y: h.y, ground: !h.air && !h.climb, alive: true, onLedge: h.onLedge, climb: !!h.climb, pp: { snare: h.snare } }], c);
      if (S.ph !== 3 || !S.flood) continue;
      let gx = null; const [lo, hi] = span(), high = DJG.tideHigh(S), lad = Math.abs(h.x - G.ladderW) <= Math.abs(h.x - G.ladderE) ? 'W' : 'E', lx = lad === 'W' ? G.ladderW : G.ladderE;
      if (h.climb) { h.y -= CLIMB * dt; if (h.y <= G.ledgeY) { h.y = h.base = G.ledgeY; h.onLedge = h.climb; h.climb = null; h.x = h.onLedge === 'W' ? G.ledgeW[1] - 24 : G.ledgeE[0] + 24; } continue; }
      /* the tide: surging - to the nearest ladder and up; low again - down to the floor */
      const bore = () => Math.min(9, ...S.bands.filter(b => !b.ledge && Math.sign(h.x - b.x) === b.dir).map(b => (Math.abs(b.x - h.x) - 20) / (b.speed + RUN) + Math.max(0, b.delay || 0)));
      const climbing = false && high && !h.onLedge && seen('surge' + S.n.surges);   /* (claude/djinn5: the high water costs nothing - the hero stays on the floor through it) */
      if (climbing) { const wv = e.mode === 'waveTell' && Math.abs(h.x - G.mid) < 260 || bore() < 0.9; if (Math.abs(h.x - lx) < 2 && !h.air && !wv) { h.climb = lad; continue; } gx = lx; }
      else if (h.onLedge && S.tide.st === 'low' && S.tide.t < DJ.tideLow - 1.5 && !S.marks.length && !S.bands.length) { h.x = h.onLedge === 'W' ? G.ledgeW[1] + 12 : G.ledgeE[0] - 12; h.onLedge = null; h.y = h.base = G.floor; }
      /* the wave: told under the shaft - stand off it, then jump the bore (or the crest) as it comes */
      if (e.mode === 'waveTell' && !h.onLedge && !climbing && Math.abs(h.x - G.mid) < 100 && seen('wt' + S.act)) gx = G.mid + (Math.sign(h.x - G.mid) || 1) * 110;
      for (const b of S.bands) { if (Math.sign(h.x - b.x) !== b.dir && !(b.delay > 0)) continue; if (!(h.base > b.y[0] - 4 && h.base - 20 < b.y[1])) continue;
        const tc = (Math.abs(b.x - h.x) - 20) / b.speed + Math.max(0, b.delay || 0); if (!h.air && tc > 0.16 && tc < 0.26) { h.air = true; h.vy = JV; } }
      /* the whirlpool: out from under the shaft, and hold there against the pull */
      if ((e.mode === 'whirlTell' || e.mode === 'whirl') && !h.onLedge && !climbing && Math.abs(h.x - G.mid) < 100 && seen('wh' + S.act)) gx = G.mid + (Math.sign(h.x - G.mid) || 1) * 110;
      /* his rings: off the ring (toward the ladder when the well surges; the other way at a wall), and stay off it until his blow is done */
      for (const m of S.marks) if (!dodge.has(m.key) && Math.abs(m.x - h.x) < 40 && Math.abs(m.y - h.base) < 30) dodge.set(m.key, { seenT: tNow, x: null, m });
      for (const [k2, d] of dodge) { const live = S.marks.some(m => m.key === k2); if (!live && d.gone == null) d.gone = tNow; if (d.gone != null && tNow - d.gone > (d.m.k === 'spout' ? 0.6 : 0.1)) { dodge.delete(k2); continue; }
        if (tNow - d.seenT < REACT) continue;
        if (d.x == null || (high && !d.hi && !h.onLedge)) { d.hi = high; const away = h.x <= d.m.x ? -1 : 1, pref = high && !h.onLedge ? Math.sign(lx - h.x) || away : away; let tx = h.x + pref * 60; if (tx < lo || tx > hi || Math.abs(tx - d.m.x) < 40) tx = h.x - pref * 60; if (Math.abs(tx - d.m.x) < 40) tx = d.m.x + (tx > d.m.x ? 46 : -46); d.x = Math.max(lo, Math.min(hi, tx)); }
        gx = d.x; }
      if (gx == null && !h.onLedge && !high) gx = home;
      /* (claude/djinn5) his wave or whirlpool told under the shaft: never walk back in under it - wait out there, 110 px off (as a player would) */
      if (gx != null && !h.onLedge && (e.mode === 'waveTell' || e.mode === 'whirlTell' || e.mode === 'whirl') && Math.abs(gx - G.mid) < 110 && Math.abs(h.x - G.mid) >= 110) gx = h.x;
      if (!h.onLedge && bore() < 0.8) gx = h.x;   /* a bore coming: stand and time the jump */
      if (gx != null) { gx = Math.max(lo, Math.min(hi, gx)); h.x += Math.sign(gx - h.x) * Math.min(Math.abs(gx - h.x), RUN * dt); }
      if (h.air) { h.vy += GR * dt; h.y += h.vy * dt; if (h.y >= h.base) { h.y = h.base; h.air = false; h.vy = 0; } }
      h.snare = 0; }
    for (const n2 of hits) total[n2] = (total[n2] || 0) + 1; maxHits = Math.max(maxHits, hits.length); }
  ok(maxHits === 0, 'EVERY P3 HIT AVOIDABLE: a hero who answers every tell (a third of a second late, at RUN/climb/jump speed, from six homes, two minutes each) is never hit ' + JSON.stringify(total)); }
/* THE PAIL (claude/djinn4, Daniel picked SCOOP + THROW) */
{ const mk = (mode) => { const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid + 60, y: G.floor, hp: 300, maxHp: 1000, face: -1, mode, modeT: 0.9, open: 0, alive: true }; S.ph = 3; S.pose = 'column'; S.flood = true; S.water = DJ.waterH; S.tide = { st: 'low', t: 99 }; S.act = 7; S.cur = { k: 'slam', id: 7, x: G.mid - 20, y: G.floor }; S.marks = [{ x: G.mid - 20, y: G.floor, t: 0.9, k: 'slam', key: 'sl7' }]; return { S, e }; };
  const hero = { x: G.mid - 20, y: G.floor, face: 1 }, dryHero = { x: G.ledgeE[0] + 30, y: G.ledgeY, face: -1 };
  { const { S } = mk('hover'), p = { full: false }, p2 = { full: false }; S.ph = 2; const before = DJG.scoopPail(S, p2, hero); S.ph = 3;
    ok(!before && !DJG.scoopPail(S, p, dryHero) && DJG.scoopPail(S, p, hero) && p.full && !DJG.scoopPail(S, p, hero), 'THE PAIL: scooped full in the flood, at once (not on a dry ledge, not before the flood, not twice)'); }
  for (const rear of ['slamTell', 'spoutTell', 'slam']) { const { S, e } = mk(rear), p = { full: true }, c = world(); let hurt = 0, slams = 0; c.hurtBoss = (b, d) => { hurt += d; }; c.hit = (bx, d, name) => { if (name === DJG.MOVE_NAME.slam || name === DJG.MOVE_NAME.spout) slams++; }; c.grab = () => { slams++; return null; };
    if (rear === 'spoutTell') { S.cur = { k: 'spout', id: 7, x: hero.x, y: G.floor }; S.marks = [{ x: hero.x, y: G.floor, t: 0.9, k: 'spout', key: 'sp7' }]; }
    ok(DJG.rearing(e, S) && DJG.throwPail(e, S, hero, p, c) && !p.full, 'he REARS UP (' + rear + '): the pail is thrown at his core');
    let peak = 0; for (let i = 0; i < 60 * 4; i++) { DJG.stepDjinn(e, S, 1 / 60, [{ x: hero.x, y: G.floor, ground: true, alive: true, pp: {} }], c); peak = Math.max(peak, e.mode === 'choked' ? e.open : 0); if (S.ward > 0) break; }
    ok(peak >= DJ.chokeT - 0.1 && OPEN_RULE.djinn({ mode: 'choked', open: 1 }) && slams === 0 && hurt === Math.round(1000 * DJ.chokeHit) && said.includes('HE CHOKES: CUT HIM') && S.ward > 0,
      '... it goes down his core: he CHOKES (' + peak.toFixed(1) + ' s still, open, OPEN_RULE agrees), the throw takes ' + (DJ.chokeHit * 100) + '% of him, his ' + rear + ' never lands, then his shroud (the ward)'); }
  /* (claude/djinn5, Daniel 10-06 "another way to hit him in the water"): thrown when he is UP but not rearing, he REELS - a short told stagger, his blow cut
     off, the throw takes reelHit, he turns to the thrower, then his shroud. Was: it splashed off (djinn4) - a design change, asserted to the new design */
  for (const m0 of ['hover', 'glide', 'upsurgeTell', 'whirl', 'drawing']) { const { S, e } = mk(m0), p = { full: true }, c = world(); let hurt = 0, blows = 0; e.face = 1; S.marks = []; S.cur = { k: 'upsurge', id: 7, x: hero.x, y: G.floor }; S.goX = G.mid + 200; S.pend = 'wave';
    if (m0 === 'upsurgeTell') S.marks = [{ x: hero.x, y: G.floor, t: 0.9, k: 'bubbles', key: 'up7' }];
    c.hurtBoss = (b, d) => { hurt += d; }; c.hit = (bx, d, name) => { if (d > 0) blows++; }; const x0 = e.x;
    ok(!DJG.rearing(e, S) && DJG.upInFlood(e, S) && DJG.throwPail(e, S, hero, p, c), 'he is UP (' + m0 + '), not rearing: the pail is thrown at him');
    let peak = 0, xs = []; for (let i = 0; i < 60 * 3; i++) { DJG.stepDjinn(e, S, 1 / 60, [{ x: hero.x, y: G.floor, ground: true, alive: true, pp: {} }], c); if (e.mode === 'reel') { peak = Math.max(peak, e.open); xs.push(e.x); } if (S.ward > 0) break; }
    ok(peak >= DJ.reelT - 0.1 && DJ.reelT >= 1.0 && DJ.reelT <= 2.0 && OPEN_RULE.djinn({ mode: 'reel', open: 1 }) && hurt === Math.round(1000 * DJ.reelHit) && blows === 0 && e.face === -1 && said.includes('THE PAIL HITS HIM: HE REELS. CUT HIM') && S.ward > 0 && xs.length && Math.max(...xs) - Math.min(...xs) < 1,
      '... it hits his core: he REELS (' + peak.toFixed(1) + ' s, still, open, OPEN_RULE agrees), the throw takes ' + (DJ.reelHit * 100).toFixed(1) + '% of him, his ' + m0 + ' cut off (no blow lands), he turns to the thrower, then his shroud'); }
  /* the pail flies AT HIM: one gliding to the shaft is hit where he has got to */
  { const { S, e } = mk('glide'), p = { full: true }, c = world(); S.marks = []; S.goX = G.mid - 200; S.pend = 'wave'; S.rush = true; e.x = hero.x + 200; DJG.throwPail(e, S, hero, p, c);
    for (let i = 0; i < 60 && e.mode !== 'reel'; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: hero.x, y: G.floor, ground: true, alive: true, pp: {} }], c);
    ok(e.mode === 'reel' && Math.abs(e.x - (hero.x + 200)) > 20, 'the pail follows him: thrown at him gliding past (he had moved ' + Math.abs(e.x - (hero.x + 200)).toFixed(0) + ' px), it still hits - he reels'); }
  { const { S, e } = mk('hover'), p = { full: true }, c = world(); DJG.openUp(e, S, 'bailed', c, hero); const o0 = e.open; DJG.throwPail(e, S, hero, p, c); for (let i = 0; i < 40; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: hero.x, y: G.floor, ground: true, alive: true, pp: {} }], c);
    ok(e.mode === 'bailed' && S.n.splashed === 1 && !S.n.reels && said.includes('IT SPLASHES OFF HIM: THROW WHEN HE IS UP'), 'spilled in the flood (bailed out), he is not UP: the pail splashes off him (told) - his bail is not cut short'); }
  { const { S, e } = mk('slamTell'), p = { full: true }, c = world(); S.ward = 2; DJG.throwPail(e, S, hero, p, c); for (let i = 0; i < 40; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: hero.x, y: G.floor, ground: true, alive: true, pp: {} }], c);
    ok(!DJG.djOpen(e) && said.includes('HIS SHROUD TURNS THE PAIL'), 'warded, his shroud turns the pail (told): no chain-lock'); }
  { const { S, e } = mk('slamTell'), p = { full: true }, c = world(); e.x = hero.x + DJ.pailR + 40; DJG.throwPail(e, S, hero, p, c); for (let i = 0; i < 40; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: hero.x, y: G.floor, ground: true, alive: true, pp: {} }], c);
    ok(e.mode !== 'choked' && !p.full, 'out of a throw (' + DJ.pailR + ' px), the pail falls short into the flood'); }
  ok(DJ.reelHit + DJ.reelCap < DJ.chokeHit + DJ.chokeCap && DJ.reelT < DJ.chokeT, 'the reel is the SMALLEST (' + ((DJ.reelHit + DJ.reelCap) * 100).toFixed(1) + '% at most, ' + DJ.reelT + ' s): the choke at a rear stays the better throw');
  ok(DJ.chokeHit + DJ.chokeCap < DJ.bailCap && DJ.chokeT < DJ.bailT, 'the pail is the SMALL opening (' + ((DJ.chokeHit + DJ.chokeCap) * 100).toFixed(1) + '% at most, ' + DJ.chokeT + ' s), the windlass bail the BIG one (' + DJ.bailCap * 100 + '%, ' + DJ.bailT + ' s)');
  ok([...DJG.REAR].every(m => m === 'slam' || (MOVES[m] && MOVES[m].mark === '!!' && MOVES[m].alt === 'throw')), 'his rears (the slam, the spout) are told !!; their answer is a dodge - or the pail (MOVES alt: throw)'); }
/* LONGER STAGGERS (claude/djinn5, Daniel 10-06 "increase the time he's staggered"): djinn4's windows, each now ~+30-40% (the choke 2 -> 3 s); the ward after each still 3 s */
{ const WAS = { mudT: 3.5, openT: 4.0, bailT: 5.5, chokeT: 2.0 }, k = Object.fromEntries(Object.entries(WAS).map(([q, v]) => [q, DJ[q] / v]));
  ok(['mudT', 'openT', 'bailT'].every(q => k[q] >= 1.3 && k[q] <= 1.4) && DJ.chokeT >= 2.8 && DJ.chokeT <= 3.2 && DJ.wardT === 3.0, 'LONGER STAGGERS: ' + Object.keys(WAS).map(q => q + ' ' + WAS[q] + ' -> ' + DJ[q] + ' (x' + k[q].toFixed(2) + ')').join(', ') + '; the ward after each ' + DJ.wardT + ' s'); }
/* (claude/djinn6, Daniel 10-06 "the Djinn is TOO HARD still" - he picked LESS DAMAGE + MORE / EASIER OPENINGS; not an hp cut, not a closer checkpoint) */
{ const D5 = { lash: 17, blast: 8, devil: 24, flash: 17 }, ALL5 = { spear: 19, breath: 22, pillar: 20, fdevil: 11, heat: 6, spout: 14, held: 20, wave: 22, slam: 22, whirl: 9, upsurge: 19 };
  const r12 = Object.keys(D5).map(k => DJ.dmg[k] / D5[k]), m12 = r12.reduce((a, b) => a + b) / r12.length;
  ok(r12.every(x => x <= 0.85) && m12 <= 0.82 && DJ.dmg.devil <= 19 && Object.keys(ALL5).every(k => DJ.dmg[k] <= ALL5[k]), 'LESS DAMAGE from what he dies to in P1-P2 (the dust devil, the lash and fire lash, the sand): x' + m12.toFixed(2) + ' (' + Object.keys(D5).map(k => k + ' ' + D5[k] + '->' + DJ.dmg[k]).join(', ') + '); nothing else hits harder');
  ok(DJ.lashTell >= 0.5 && DJ.blastTell >= 0.5 && DJ.devilTell >= 0.7, 'his P1 tells unchanged or longer: lash ' + DJ.lashTell + ', sand ' + DJ.blastTell + ', devil ' + DJ.devilTell + ' s');
  ok(DJ.openCap >= 0.051 && DJ.bailCap >= 0.07 && DJ.pourR >= 66 && DJ.reelT >= 1.2 * 1.25 && DJ.hp === 1000, 'his openings are no smaller (a mud or a douse ' + (DJ.openCap * 100).toFixed(1) + '%, a bail ' + (DJ.bailCap * 100).toFixed(1) + '%), his surfacing reel longer (' + DJ.reelT + ' s, was 1.2); his health unchanged');
  const p = { full: true }, e = { t: 'djinn', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, alive: true, face: -1 }, S = DJG.newShow(G); S.ph = 3; S.flood = true; S.pose = 'column';
  DJG.throwPail(e, S, { x: G.mid - 80, y: G.floor, face: 1 }, p, world()); let t = 0, got = false; for (; t < 3 && !got; t += 1 / 60) got = DJG.refillPail(p, 1 / 60);
  ok(got && p.full && Math.abs(t - DJ.pailRefill) < 0.05 && DJ.pailRefill <= 1.0 && DJ.pailR >= 280, 'THE PAIL REFILLS ITSELF ' + t.toFixed(2) + ' s after a throw (no scoop needed); a throw reaches ' + DJ.pailR + ' px (was 230)'); }
/* NO LONG WAIT FOR HIM TO REACH THE MIDDLE (claude/djinn5): to the shaft he crosses at colRush; from the far wall he is there in under 3 s */
ok(DJ.colRush >= 110 && (G.mid - (G.x0 + 64)) / DJ.colRush + 0.25 <= 3.0, 'to the shaft he crosses at ' + DJ.colRush + ' px/s: from the far side of the hall in ' + ((G.mid - (G.x0 + 64)) / DJ.colRush).toFixed(1) + ' s (and a pail reaches him on the way)');
{ run(60, { hp: () => 300 }); ok(said.includes('HE REARS UP: THROW THE PAIL INTO HIS CORE'), 'the first time he rears up in the flood it is told: HE REARS UP: THROW THE PAIL INTO HIS CORE'); }
/* THE LINES, THE LEVEL, THE BENCH */
const lines = [...new Set(said)].filter(s => !/^!+$/.test(s)); ok(lines.every(s => CALL_LINES.has(s)), 'every line he says is a teaching line in src/hint-lines.js (' + lines.length + ')');
{ const lv = LEVELS.find(l => l.id === 'welltown'), L = lv.build(); ok(L.arena.boss === 'djinn' && L.ents.some(e => e.t === 'djinn') && !L.ents.some(e => e.t === 'cisternqueen'), "THE WELL TOWN's boss is THE DJINN in the old well's hall; the Cistern Queen is not placed");
  ok(typeof CQG.stageCisternQueen === 'function' && typeof CQG.stepQueen === 'function', 'the Cistern Queen is benched, not deleted: her stage and her fight are still callable (tools/cistern-queen.mjs holds her)'); }
console.log('djinn: ' + n + ' checks pass');
