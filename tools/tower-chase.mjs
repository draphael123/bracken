// tools/tower-chase.mjs - THE SPIRAL STAIR: THE UNDEAD ARCHMAGE CHASED UP TO HIS CARPET (src/spiral-chase.js; Daniel, 2026-09-29: "a section
// climbing up the tower after the mini boss (the Sexton) where you go through a PORTAL and CHASE THE ARCHMAGE UP A SPIRAL TOWER as he shoots
// bolts at you like the fight. You eventually reach a PORTAL with a MAGIC CARPET and the fight commences as usual.")
//   PORTAL   the crown's parapet holds HIS RING (a ringdoor) where the door into his hall stood, and it lets you out at the spiral's foot; the
//            reach fill follows it, and it is LOAD-BEARING - take its `to` away and neither the stair nor the carpet is reached
//   SPIRAL   six flights round a newel, turning at the walls; walkable with a REAL jump (tools/checkpoint-stand.mjs's model, 5 columns): the
//            fill from the foot stands on every step, every landing and the carpet. THE RULE BITES: with a jump of 2 columns it does not get
//            up - the gaps are jumps, not walks - and no gap is wider than 2 tiles (towerscroll: a missed jump under a rising kill is a death).
//            ONE checkpoint, at the stair's FOOT (towerscroll; it was the middle landing); no creature but him
//   RISE     (claude/towerscroll, Daniel 2026-09-29: "the fire looks odd" - the climb is an UPWARD AUTO-SCROLLER now) the level hands
//            src/chase.js ONE chase: up the y axis, AUTOSCROLL on, KILL on contact, drawn as his dark magic (look 'dark', no fire), kept to
//            the stair tower (zone); the engine's lint passes it (a shrine within its gap under the start line, every speed-up told, a band
//            that fits the screen); it starts on the first step and stops just under the top floor; its fastest (curve top x rubber.catch)
//            is under a fair climb; in Node a hero who stands is caught, a hero who climbs at a fair pace never is, and every speed-up is
//            warned first. NO BRAZIER, NO SEAL, NO SNUFF: his wards, their braziers and fire walls and the snuffed brazier are gone from
//            the level, the module, the marks, the bot and the draw
//   SPELLS   his chase in Node: asleep until you are through; over the landing ahead of you, never within reach; he casts nothing while he
//            or you are off the screen; every spell from its fight's tell, and only what the flight teaches (the first: fire alone); fire and
//            ice turn on a shield, the death mark does not - and stepped out of it finds no one and he flinches open; a stone wall stops a
//            bolt; he moves on when you reach his landing; paired bolts from the third flight; at the top he goes through the door
//   MUSIC    his fight's track from the first step of the stair (the ring's far side), and on into the fight without a break
//   PAGE     walk into the ring on the parapet and come out at the foot, zoomed out; the dark starts when you climb and the CAMERA RISES
//            with it (the screen's bottom never more than the engine's edge under its front); a speed-up is told before the dark quickens;
//            the lab's stair bot climbs all six flights (god mode) and every tell begins with him on the screen; the carpet at the top
//            starts his fight as it always did and the dark is gone; EVERY HERO (no god mode, health held up) climbs to the carpet under
//            the scroll without the dark catching it; a hero who stands on the stair is killed by it and wakes at the foot, the dark
//            back at rest and him over the first landing again
//   ARCHMAGE2 (claude/archmage2b, Daniel 10-02: "the chase up to the Undead Archmage has poison - it doesn't do anything"; audit-stuck #1):
//            THE DARK MATTERS - it starts AT ENTRY (you come out of his ring onto the stair's floor and it is already rising), at 30 px/s and
//            surging (told), drawn as a band on the screen's bottom edge the whole climb; contact HURTS (21, about 28 after the damage scale) and THROWS you up onto the nearest
//            step over it (src/chase.js knockTo), then holds; it never rises past the landing over a hero who has not stood on it (caps) - in
//            Node a hero who stands on the floor is hurt again and again but the dark never passes the first landing, a hero who climbs at a
//            fair 20 px/s is never touched; in the page a hero who stands is hurt and thrown UP (never down), and dies of it at last and wakes
//            at the foot. NINE FLIGHTS: THE PENDULUM (two clock weights over its gaps, swinging against each other: at the bottom of the swing
//            they reach a hero on the gap's lips, at its ends they clear him), THE ICE STAIR (his frost freezes the step under you and the next
//            one up, slick), THE BOOK GAUNTLET (his books, told in a niche on the far wall, fly down the flight at you; a shield turns them)
//   ARCHMAGE3 (claude/archmage3, Daniel 10-04: "the climb is a bit short"): TEN FLIGHTS - THE ORRERY LOFT under the last stair, where no stair crosses
//            the void: two brass wheels of worlds (src/spiral-chase.js orrery). THE RULE BITES: without its worlds the fill reaches neither its pier, its
//            landing nor the carpet; its voids are wider than any jump (the only gaps over 2 tiles on the stair, and only there); a world comes round to
//            each boarding ledge every few seconds; the turning is TOLD (its sign, its line, the next world marked and the pawl's click as it comes
//            level); the dark is capped under its landing like every other. You come out of his ring on the LEFT now (ten flights: the first runs right)
// usage: node tools/tower-chase.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { TOWER } from '../src/tower-ascent.js';
import { SPIRAL, FLIGHTS, TOP, CHASE, perchOf, updateMageChase, PENDS, pendPos, pendReach, pendSafe, PEND, BOOK, FROST, newStairFx, updateStairFx, frostSteps, ORRERY, orreryPos } from '../src/spiral-chase.js';
import * as SC from '../src/spiral-chase.js';
import { chaseSpec, chaseStep, chaseProblems, newChase, CHECKPOINT_GAP, chaseSafeAbove } from '../src/chase.js';
import { MAGE } from '../src/undead-mage.js';
import { MARK, ANSWER } from '../src/marks.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), W = L.W, TS = 16, at = (x, y) => L.grid[y * W + x];
const S = L.spiral, inS = e => e.x >= S.x0 && e.x <= S.x1 && e.y >= S.top && e.y < S.floor;
const std = (x, y) => [T.SOLID, T.ONEWAY, T.PLANK].includes(at(x, y + 1)) && at(x, y) === T.AIR;   /* somewhere to stand: floor under, air in */
// ---- PORTAL ----
const rings = L.ents.filter(e => e.t === 'ringdoor'), way = rings.find(e => e.to), foot = rings.find(e => e.id === (way && way.to));
assert.ok(way && foot && rings.length === 2, 'his ring on the parapet and the one it lets you out of: ' + JSON.stringify(rings));
assert.ok(way.x === 36 && way.y === TOWER.SKY && at(way.x, way.y + 1) === T.SOLID, 'his ring stands on the parapet where the door into his hall stood: ' + way.x + ',' + way.y);
assert.ok(inS(foot) && std(foot.x, foot.y) && foot.y === S.floor - 1, 'it lets you out on the spiral stair\'s floor: ' + foot.x + ',' + foot.y);
assert.ok(W > TOWER.W && S.x0 > TOWER.W + 4, 'the stair tower stands east of the tower\'s own wall, solid rock between: ' + S.x0);
for (let y = S.top; y < S.floor; y++) for (let x = TOWER.X1 + 1; x < S.x0; x++) assert.equal(at(x, y), T.SOLID, 'rock between the tower and the stair at ' + x + ',' + y);
assert.ok(L.sanctum.rug && L.carpetAt.x === L.sanctum.in.x && L.carpetAt.y === L.sanctum.in.y, 'the carpet lies at the door into his hall');
assert.ok(L.carpetAt.x >= S.x0 * TS && L.carpetAt.x <= S.x1 * TS && L.carpetAt.y === TOP.row * TS, 'and both are at the top of the spiral stair, not on the parapet: ' + JSON.stringify(L.carpetAt));
const R = floodReach(L, T, { rides: true, across: 5 });
assert.ok(R.seen.has(foot.x + ',' + foot.y), 'the fill (a real jump) does not come through his ring to the stair\'s foot');
assert.ok(R.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the fill does not climb the stair to the carpet');
{ const shut = floodReach({ ...L, ents: L.ents.map(e => e === way ? { ...e, to: null } : e) }, T, { rides: true });
  assert.ok(![...shut.seen].some(k => { const [x, y] = k.split(',').map(Number); return inS({ x, y }); }), 'the stair is reached WITHOUT his ring: the portal is not the way in');
  assert.ok(!shut.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the carpet is reached without his ring'); }
// ---- SPIRAL ----
assert.ok(L.interiors.some(i => i[4] === 'spiral' && i[0] === S.x0 && i[1] === S.x1), 'the stair tower is a room of its own (the newel is painted: fallen_tower.js \'spiral\')');
assert.equal(FLIGHTS.length, 10, 'ten flights (archmage2: three new ones; archmage3: THE ORRERY LOFT)'); FLIGHTS.forEach((F, k) => { if (k) assert.equal(F.dir, -FLIGHTS[k - 1].dir, F.name + ' runs the same way as the flight under it: it does not wind');
  const [lx, ll] = F.land; assert.ok(lx === S.x0 || lx + ll - 1 === S.x1, F.name + '\'s landing is not against a wall');
  if (k) assert.ok(F.land[2] < FLIGHTS[k - 1].land[2], F.name + ' does not climb'); });
assert.equal(new Set(FLIGHTS.map(F => JSON.stringify(F.steps.map(s => [s[1], s[3] || ''])))).size, 10, 'two flights are the same shape (no repeated shapes in a level)');
const up = floodReach({ ...L, START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 5 });
for (const F of FLIGHTS) { for (const [x0, len, row] of [...F.steps, F.land]) assert.ok([...Array(len)].some((_, i) => up.seen.has((x0 + i) + ',' + (row - 1))), F.name + ': the step at ' + x0 + ',' + row + ' is never stood on with a real jump'); }
assert.ok(up.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'from the foot, a real jump does not reach the carpet');
{ const short = floodReach({ ...L, START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 2 });
  assert.ok(!short.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'THE RULE BITES: a jump of two columns climbs the whole stair - its gaps are walks, not jumps'); }
/* NO GAP OVER 2 TILES (towerscroll): under the rising dark a missed jump is a death, and the paladin cleared the old 3-tile gaps by a hair */
const gaps = [];
FLIGHTS.forEach((F, k) => { const seq = [k ? FLIGHTS[k - 1].land : null, ...F.steps, F.land].filter(Boolean);
  for (let i = 1; i < seq.length; i++) { const [a0, al] = seq[i - 1], [b0, bl] = seq[i], g = F.dir > 0 ? b0 - (a0 + al) : a0 - (b0 + bl); gaps.push([F.name, g]); } });
/* (archmage3) THE ORRERY LOFT's voids are the one place a gap is wider than a jump: they are ridden, on its worlds, and nowhere else is one over 2 tiles */
const KO = FLIGHTS.findIndex(F => F.orrery);
assert.ok(gaps.every(([n, g]) => g <= 2 || n === 'THE ORRERY LOFT'), 'a gap on the stair is wider than 2 tiles: ' + JSON.stringify(gaps.filter(([n, g]) => g > 2 && n !== 'THE ORRERY LOFT')));
assert.ok(gaps.filter(([n, g]) => n === 'THE ORRERY LOFT' && g >= 5).length === 2, 'the two voids of the orrery loft are not wider than any jump: ' + JSON.stringify(gaps.filter(([n]) => n === 'THE ORRERY LOFT')));
// ---- THE ORRERY LOFT (archmage3) ----
{ assert.ok(KO === FLIGHTS.length - 2 && FLIGHTS[KO].name === 'THE ORRERY LOFT', 'the orrery loft is not the flight under the last stair (near the top): ' + KO);
  const O = FLIGHTS[KO], worlds = (L.moversExtra || []).filter(m => m.orrery);
  assert.ok(O.orrery.length === 2 && ['A', 'B'].every(id => worlds.filter(m => m.orrery === id).length >= 3 && worlds.every(m => m.kind === 'wheel' && m.planet && m.w >= 32)), 'the orrery has not two wheels of three worlds (32 px bars): ' + worlds.length);
  const noW = floodReach({ ...L, moversExtra: L.moversExtra.filter(m => !m.orrery), START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 5 }), stood = (R2, q) => [...Array(q[1])].some((_, i) => R2.seen.has((q[0] + i) + ',' + (q[2] - 1)));
  assert.ok(!stood(noW, O.steps[1]) && !stood(noW, O.land) && !noW.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'THE RULE BITES: without the worlds of the orrery the fill still crosses the loft');
  /* each wheel brings a world level with the ledge it is boarded from (A: the board step, B: the pier), on its RISING side, every period/n s */
  for (const [j, ledge] of [[0, O.steps[0]], [1, O.steps[1]]]) { const ms = worlds.filter(m => m.orrery === 'AB'[j]), y = ledge[2] * TS, near = O.dir > 0 ? (ledge[0] + ledge[1]) * TS : ledge[0] * TS; const times = [];
    for (let t = 0; t < 2 * Math.abs(ms[0].period); t += 1 / 60) for (const m of ms) { const p = orreryPos(m, t), q = orreryPos(m, t + 1 / 60), edge = O.dir > 0 ? p.x : p.x + m.w;
      if (Math.abs(p.y - y) < 2 && q.y < p.y && Math.abs(edge - near) <= 12) times.push(t); }
    const ts = times.filter((t, i) => !i || t - times[i - 1] > 0.3), gap = Math.max(...ts.slice(1).map((t, i) => t - ts[i]));
    assert.ok(ts.length >= 4 && gap <= 3, 'wheel ' + 'AB'[j] + ' does not bring a world level with its boarding ledge, rising, every few seconds: ' + JSON.stringify({ n: ts.length, gap })); }
  /* the next world round is marked (its glint) and the pawl clicks as one comes level; the flight is told on its first step */
  { const H = newStairFx(), said = [], snd = []; const st = O.steps[0], P = { x: (st[0] + 1) * TS, y: st[2] * TS, ground: true, dead: 0 }; const ms = worlds.map(m => ({ ...m }));
    for (let i = 0; i < 60 * 8; i++) updateStairFx(H, 1 / 60, { P, on: true, movers: ms, time: i / 60, hit: () => {}, say: m => said.push(m), sound: k => snd.push(k) });
    assert.ok(said.some(m => /ORRERY/.test(m)) && snd.filter(k => k === 'ratchet').length >= 3, 'the turning of the orrery is not told (its line, and the click of its pawl as a world comes level): ' + JSON.stringify({ said, clicks: snd.filter(k => k === 'ratchet').length }));
    assert.ok(['A', 'B'].every(id => ms.filter(m => m.orrery === id && m.next).length === 1), 'not exactly one world marked next on each wheel'); }
  assert.ok(L.ents.some(e => e.t === 'sign' && inS(e) && /ORRERY/.test(e.text)), 'the orrery loft is not signed where it begins'); }
assert.ok(gaps.some(([, g]) => g === 2), 'no gap on the stair is a jump at all');
const checks = L.ents.filter(e => e.t === 'check' && inS(e));
assert.equal(checks.length, 1, 'ONE checkpoint on the stair: ' + checks.map(e => e.x + ',' + e.y));
assert.ok(checks[0].y === S.floor - 1 && std(checks[0].x, checks[0].y) && up.seen.has(checks[0].x + ',' + checks[0].y), 'the stair\'s checkpoint is not at its FOOT (towerscroll: a death restarts the short climb): ' + checks.map(e => e.x + ',' + e.y));
assert.ok(std(L.carpetAt.x / TS - 5, TOP.row), 'the carpet\'s retry spot (five tiles back from it) is not on the top floor');
assert.ok(L.crumbles.filter(c => c.kind === 'spiral').length >= 3, 'the tower\'s failing stone is on the stair (its last use)');
const foes = L.ents.filter(e => inS(e) && !['check', 'sign', 'coin', 'silver', 'ringdoor', 'mend', 'deco'].includes(e.t));
assert.deepEqual(foes.map(e => e.t), ['magechase'], 'the stair is his chase and nothing else\'s: ' + foes.map(e => e.t));
// ---- NO BRAZIER, NO SEAL, NO SNUFF (towerscroll: "the fire looks odd") ----
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lab = readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8'), reach = readFileSync(new URL('../src/reachcore.js', import.meta.url), 'utf8');
  const gone = ['seals', 'SEAL', 'wardOf', 'lightBrazier', 'updateSeals', 'sealPerch', 'drawSeals'].filter(k => k in SC);
  assert.deepEqual(gone, [], 'his wards and braziers are still in spiral-chase.js: ' + gone);
  assert.ok(!(S.seals && S.seals.length) && !L.ents.some(e => e.t === 'ward'), 'the stair still has his wards: ' + JSON.stringify((S.seals || []).map(s => s.k)));
  assert.ok(!L.ents.some(e => e.t === 'sign' && inS(e) && /BRAZIER|WARD/.test(e.text)), 'a sign on the stair still teaches the brazier or the ward');
  assert.ok(!('magechase|snuffTell' in MARK), 'his snuff is still in the marks');
  assert.ok(!/drawSeals|lightBrazier|spiral\.seals|wardfire/.test(src), 'main.js still draws, strikes or resets his wards and braziers');
  assert.ok(!/spiral\.seals|s\.wall|burnt/.test(lab.slice(lab.indexOf('export function chaseClimb'), lab.indexOf('export function chaseClimb') + 4000)), 'the stair bot still strikes braziers or jumps their fire');
  assert.ok(!/e\.t === 'ward'/.test(reach), 'the reach fill still opens a ward'); }
// ---- RISE: the climb is an upward auto-scroller on src/chase.js ----
const RL = L.chases || [];
assert.equal(RL.length, 1, 'the stair hands the chase engine no chase (L.chases): ' + RL.length);
const sp = chaseSpec(RL[0]), cps = L.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * TS + 8, y: (e.y + 1) * TS }));
assert.ok(sp.axis === 'y' && sp.dir === -1 && sp.autoscroll, 'the dark does not rise up the stair with the camera (axis y, dir -1, autoscroll): ' + [sp.axis, sp.dir, sp.autoscroll]);
assert.ok(sp.contact === 'hurt' && sp.dmg >= 18 && sp.dmg <= 24 && sp.hold >= 0.7, 'the rising dark does not HURT (18-24, about 25-30 after the damage scale) on contact and hold after it: ' + [sp.contact, sp.dmg, sp.hold]);
assert.ok(sp.band, 'the dark is not banded on the screen\'s edge the whole climb');
assert.ok(sp.caps && sp.caps.length === FLIGHTS.length && sp.caps.every((q, i) => q.stop === (FLIGHTS[i].land[2] + 1) * TS + 6 && q.reach <= FLIGHTS[i].land[2] * TS - 7), 'the dark is not capped under every landing: ' + JSON.stringify(sp.caps));
assert.ok(sp.knockTo && FLIGHTS.every(F => [...F.steps, F.land].every(q => sp.knockTo.some(k => k[0] === q[0] && k[2] === q[2]))), 'the dark does not know the stair\'s ledges to throw you onto');
assert.ok(sp.look === 'dark' && !/fire|brazier/i.test(sp.name + ' ' + sp.look), 'the riser looks like fire, or like nothing of his: ' + sp.look + ' ' + sp.name);
assert.ok(sp.zone && sp.zone[0] <= S.x0 * TS && sp.zone[1] >= (S.x1 + 1) * TS && sp.zone[0] > TOWER.X1 * TS, 'the dark is not kept to the stair tower (the tower\'s own floors share its rows): ' + sp.zone);
assert.deepEqual(chaseProblems(RL, cps), [], 'the chase engine\'s lint fails the stair');
const ck = cps.find(c => c.x === checks[0].x * TS + 8); assert.ok(ck && ck.y - sp.trigger >= 0 && ck.y - sp.trigger <= CHECKPOINT_GAP, 'the stair\'s checkpoint is not the one just under the start line: ' + JSON.stringify(ck) + ' ' + sp.trigger);
const f0 = FLIGHTS[0].steps[0][2], LAST = FLIGHTS[FLIGHTS.length - 1], topLand = LAST.land[2], mid = row => row * TS - 7;   /* the hero's middle, feet on a ledge's top */
assert.ok(mid(S.floor) <= sp.trigger && sp.trigger < S.floor * TS, 'the dark does not start AT ENTRY - standing on the stair\'s floor, where his ring lets you out (archmage2): ' + sp.trigger);
assert.ok(mid(topLand) <= sp.end && mid(LAST.steps[1][2]) > sp.end && sp.end > topLand * TS + TS, 'the dark\'s safe line is not the top floor (it stops just under it): ' + sp.end);
assert.ok(sp.from > S.floor * TS, 'the dark does not rise from under the stair\'s floor: ' + sp.from);
const fastest = Math.max(...sp.curve.map(r => r.speed)) * sp.rubber.slow;   /* (archmage2) its fastest CLOSE UNDER YOU: what a climbing hero has to outclimb */
assert.ok(sp.curve[0].speed >= 28 && sp.curve[0].speed <= 34, 'the dark does not rise at about 30 px/s (audit-stuck #1: 11-15 never reached a moving hero): ' + sp.curve[0].speed);
assert.ok(sp.curve.length >= 3 && sp.curve.slice(1).every(r => r.warn && r.speed > 0), 'the dark does not quicken (told) at least twice: ' + JSON.stringify(sp.curve));
{ /* a hero who STANDS on the stair's floor is reached - hurt, and hurt again after the hold, never killed outright - and the dark never rises past
     the first landing over him (the cap); one who climbs steadily at a fair 20 px/s never is, and every surge is told first */
  const st = newChase(); let hero = mid(S.floor), caught = -1, hits = 0, top = 1e9; const ev0 = [];
  for (let i = 0; i < 60 * 60; i++) { for (const e of chaseStep(sp, st, hero, 1 / 60, true)) { ev0.push(e.k); if (e.k === 'contact') { hits++; if (caught < 0) caught = i / 60; } } if (st.phase === 'run') top = Math.min(top, st.pos); }
  assert.ok(ev0[0] === 'start' && caught > 1 && caught < 12, 'a hero standing at the foot is not reached by the dark soon (or at once): ' + caught);
  assert.ok(hits >= 3 && !ev0.includes('end'), 'a hero who stays is not hurt again after the hold: ' + hits);
  assert.ok(top >= sp.caps[0].stop - 0.01, 'the dark rose past the first landing over a hero who never stood on it: ' + top + ' vs ' + sp.caps[0].stop);
  { const st3 = newChase(); let top3 = 1e9; for (let i = 0; i < 60 * 30; i++) { chaseStep(sp, st3, mid(S.floor) - 60, 1 / 60, false); if (st3.phase === 'run') top3 = Math.min(top3, st3.pos); }
    assert.ok(top3 >= sp.caps[0].stop - 0.01, 'a JUMP counts as standing on a landing: the cap lets the dark by'); }
  { const fr = mid(FLIGHTS[1].steps[1][2]) + 2, to = chaseSafeAbove(sp, fr, FLIGHTS[1].steps[1][0] * TS + 8);
    assert.ok(to && to.y / TS < FLIGHTS[1].steps[1][2] && mid(to.y / TS) < fr - 10, 'the dark does not throw you UP, onto a ledge over its front: ' + JSON.stringify(to)); }
  const st2 = newChase(), ev = []; let h = mid(S.floor), minGap = 1e9, prevSpeed = 0;
  for (let i = 0; i < 60 * 120; i++) { h = Math.max(sp.end - 1, h - 20 / 60); for (const e of chaseStep(sp, st2, h, 1 / 60, true)) ev.push({ ...e, speedNow: st2.speed });
    if (st2.phase === 'run') minGap = Math.min(minGap, (st2.pos - h)); if (st2.phase === 'done') break; }
  assert.ok(!ev.some(e => e.k === 'contact') && ev.some(e => e.k === 'end'), 'a hero climbing a steady 20 px/s (a fair climb) is caught by the dark: ' + JSON.stringify(ev.map(e => e.k)));
  const warns = ev.filter(e => e.k === 'warn'), ups = ev.filter(e => e.k === 'speedup');
  assert.ok(warns.length >= 2 && ups.length >= 2, 'the dark does not quicken twice on a climb: ' + JSON.stringify(ev.map(e => e.k)));
  for (const u of ups) { const w = ev.findIndex(e => e.k === 'warn' && e.at <= u.dist + 1); assert.ok(w >= 0 && w < ev.indexOf(u), 'the dark quickens with no warning first at ' + Math.round(u.dist)); } }
// ---- SPELLS: the chase in Node ----
assert.ok(MARK['magechase|fireTell'] === '!' && MARK['magechase|iceTell'] === '!' && MARK['magechase|markTell'] === '!!', 'his marks are not his fight\'s');
assert.ok(ANSWER['magechase|fireTell'] === 'block' && ANSWER['magechase|markTell'] === 'dodge', 'the answers: guard the fire, step out of the mark');
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(/\(e\.t === 'magechase' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)\)/.test(src.split('\n').find(l => l.startsWith('const windingUp =')) || ''), 'his tells are not windups: no mark is drawn over him');
  assert.ok(/function hurtEnemy0\([^)]*\) \{[\s\S]{0,600}if\(e\.t==='magechase'\)return;/.test(src), 'a blow that reaches him does something: he is chased, not fought'); }
const rig = (o = {}) => { const P = { x: foot.x * TS + 8, y: (foot.y + 1) * TS, ground: true, dead: 0 }, hits = [], said = [];
  const e = { t: 'magechase', alive: true, mode: 'sleep', modeT: 0, x: 0, y: 0, face: -1, anim: 0 };
  const c = { P, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: m => said.push(m), sound: () => {}, onScreen: () => o.seen !== false,
    solid: (x, y) => at(Math.floor(x / TS), Math.floor(y / TS)) === T.SOLID, freeze: () => {}, inSpiral: p => p.x >= S.x0 * TS && p.x < (S.x1 + 1) * TS && p.y >= S.top * TS && p.y <= S.floor * TS };
  const run = (s, each) => { for (let i = 0; i < s * 60; i++) { updateMageChase(e, 1 / 60, c); if (each) each(); } };
  return { P, e, c, hits, said, run }; };
const stand = (P, x, row) => { P.x = x * TS + 8; P.y = row * TS; P.ground = true; };
{ const r = rig(); r.P.x = 20 * TS; r.P.y = 60 * TS; r.run(3); assert.equal(r.e.mode, 'sleep', 'he wakes before you are through his ring');
  stand(r.P, foot.x, foot.y + 1); r.run(0.1); const p = perchOf(0); assert.ok(r.e.mode === 'wake' && r.e.x === p.x && r.e.y === p.y, 'through the ring, he is not over the first landing: ' + [r.e.mode, r.e.x, r.e.y]); }
const ON = (k, i = 1) => { const q = FLIGHTS[k].steps[Math.min(i, FLIGHTS[k].steps.length - 1)]; return [q[0] + (q[1] >> 1), q[2]]; };   /* the middle of flight k's step i */
{ const r = rig({ seen: false }), tells = new Set(); stand(r.P, ...ON(0)); r.run(20, () => { if (/Tell$/.test(r.e.mode)) tells.add(r.e.mode); });
  assert.equal(tells.size + r.e.shots.length + r.hits.length, 0, 'he casts from off the screen: ' + [...tells]); }
{ const r = rig(), tells = new Set(), starts = []; let last = ''; stand(r.P, ...ON(0));
  r.run(20, () => { if (/Tell$/.test(r.e.mode)) { tells.add(r.e.mode); if (r.e.mode !== last) starts.push(r.e.modeT); } last = r.e.mode; });
  assert.deepEqual([...tells], ['fireTell'], 'the first flight is FIRE alone, and it is cast: ' + [...tells]);
  assert.ok(starts.every(t => t >= MAGE.tell.fire - 0.02), 'the fire is told for less than his fight tells it: ' + starts);
  assert.ok(r.hits.length >= 3 && r.hits.every(h => !h.hard && h.blow === 'fire' && h.d === MAGE.dmg.fire), 'the fire lands as his fight\'s own blockable bolt: ' + JSON.stringify(r.hits.slice(0, 3)));
  const p = perchOf(0), [, , lr] = FLIGHTS[0].land; assert.ok(p.y <= (lr - CHASE.up) * TS && (lr * TS - p.y) / TS >= 4, 'he waits within reach of his landing');
  stand(r.P, FLIGHTS[0].land[0] + 1, lr); r.run(0.05); assert.equal(r.e.mode, 'fly', 'you reach his landing and he does not move on');
  r.run(3); const q = perchOf(1); assert.ok(Math.hypot(r.e.x - q.x, r.e.y - q.y) < 6, 'he does not wait over the next landing'); }
{ const r = rig(); stand(r.P, FLIGHTS[0].land[0] + 1, FLIGHTS[0].land[2]); r.run(0.1); r.e.reached = 0; stand(r.P, ...ON(1)); const kinds = new Set(); r.run(12, () => { for (const s of r.e.shots) kinds.add(s.kind); });
  assert.ok(kinds.has('ice') && kinds.has('fire'), 'the broken stair is fire and frost: ' + [...kinds]); assert.ok(r.hits.every(h => !h.hard), 'the frost is not blockable'); }
const FS = FLIGHTS.findIndex(F => F.name === 'THE FAILING STAIR');
{ const q = rig(); stand(q.P, FLIGHTS[FS - 1].land[0] + 1, FLIGHTS[FS - 1].land[2]); q.run(0.1); stand(q.P, ...ON(FS, 2)); let laid = false;
  for (let i = 0; i < 600 && !q.e.deathMark; i++) updateMageChase(q.e, 1 / 60, q.c); laid = !!q.e.deathMark; assert.ok(laid, 'the failing stair has no death mark');
  q.run(CHASE.markFuse + 0.1); assert.ok(q.hits.some(h => h.blow === 'mark' && h.hard && h.d === MAGE.dmg.mark), 'left in it, the mark does not land unblockable');
  const s = rig(); stand(s.P, FLIGHTS[FS - 1].land[0] + 1, FLIGHTS[FS - 1].land[2]); s.run(0.1); stand(s.P, ...ON(FS, 2));
  for (let i = 0; i < 600 && !s.e.deathMark; i++) updateMageChase(s.e, 1 / 60, s.c); stand(s.P, ...ON(FS, 3)); s.run(CHASE.markFuse + 0.1);
  assert.ok(!s.hits.some(h => h.blow === 'mark'), 'stepped out of, the mark still lands'); assert.equal(s.e.mode, 'gather', 'the mark that finds no one does not open him (the fight\'s opening, shown)'); }
{ const r = rig(); stand(r.P, ...ON(0)); r.run(0.1); r.e.shots.push({ x: (S.x1 + 0.5) * TS, y: 115 * TS, vx: 150, vy: 0, r: 5, dmg: 14, kind: 'fire', t: 4 }); r.run(0.2); assert.ok(!r.e.shots.some(q => q.x > (S.x1 + 1) * TS), 'a bolt flies on through the stone wall'); }
{ const r = rig(); stand(r.P, TOP.check, TOP.row + 1); r.run(0.1); assert.ok(!r.e.alive, 'a retry at the top finds him still on the stair: he is through his door');
  const q = rig(); stand(q.P, FLIGHTS[FLIGHTS.length - 2].land[0] + 1, FLIGHTS[FLIGHTS.length - 2].land[2]); q.run(0.1); stand(q.P, TOP.check + 2, TOP.row + 1); q.run(4); assert.ok(!q.e.alive, 'you reach the top and he does not go through his door'); }
assert.ok(CHASE.gap <= 0.6 && CHASE.settle <= 0.35 && CHASE.pairFrom <= 2, 'his spells are no closer together than they were (gap ' + CHASE.gap + ', settle ' + CHASE.settle + ')');
{ const r = rig(); stand(r.P, FLIGHTS[FS - 1].land[0] + 1, FLIGHTS[FS - 1].land[2]); r.run(0.1); r.run(1.2); let pair = 0; stand(r.P, ...ON(FS, 2));
  r.run(15, () => { const f = r.e.shots.filter(q => q.kind === 'fire' && q.t > 3.9).length; pair = Math.max(pair, f); });
  assert.equal(pair, 2, 'from the third flight his firebolt does not come in a pair: ' + pair); }
// ---- THE NEW FLIGHTS (archmage2) ----
{ const KP = FLIGHTS.findIndex(F => F.name === 'THE PENDULUM'), KI = FLIGHTS.findIndex(F => F.name === 'THE ICE STAIR'), KB = FLIGHTS.findIndex(F => F.name === 'THE BOOK GAUNTLET');
  assert.ok(KP > 0 && KI > KP && KB > KI && KB < FLIGHTS.length - 1, 'the three new flights are not on the stair, in order, under the last: ' + [KP, KI, KB]);
  /* THE PENDULUM: two weights over two gaps of its flight, low at chest height over each gap's HIGHER lip; at the bottom of the swing a weight
     sweeps a hero on that lip, at its ends it clears him; each ledge has somewhere it never reaches; they swing against each other; and a hero
     who goes as one turns over him gets across untouched (the rhythm exists), one who walks on blind does not always */
  const PP = PENDS.filter(p => p.k === KP); assert.equal(PP.length, 2, 'the pendulum flight has not two weights: ' + PP.length);
  assert.ok(PENDS.every(p => p.k === KP), 'a weight hangs somewhere other than the pendulum flight');
  const seq = [FLIGHTS[KP - 1].land, ...FLIGHTS[KP].steps, FLIGHTS[KP].land], dirP = FLIGHTS[KP].dir;
  const reachAny = (p, x, y) => { for (let t = 0; t < PEND.period; t += 0.02) if (pendReach(pendPos(p, t), x, y)) return true; return false; };
  for (const p of PP) { const i = seq.findIndex((q, j) => { if (!j) return false; const [A, B] = [seq[j - 1], q].sort((u, v) => u[0] - v[0]); return p.x >= A[0] + A[1] && p.x <= B[0]; });
    assert.ok(i > 0, 'a weight does not hang over a gap of its flight: ' + JSON.stringify(p));
    const lo = seq[i - 1], hi = seq[i]; assert.ok(hi[2] === p.row && lo[2] > hi[2], 'a weight is not low over the higher lip of its gap: ' + JSON.stringify([p, lo, hi]));
    const lipX = (dirP > 0 ? hi[0] + 0.5 : hi[0] + hi[1] - 0.5) * TS, y = p.row * TS;
    assert.ok(reachAny(p, lipX, y), 'low in its swing a weight does not sweep a hero on its gap\'s higher lip');
    assert.ok(!pendReach(pendPos({ ...p, ph: Math.PI / 2 }, 0), lipX, y) && !pendReach(pendPos({ ...p, ph: -Math.PI / 2 }, 0), lipX, y), 'at the ends of its swing a weight still reaches the lip');
    let safeLo = false, safeHi = false; for (let c = lo[0]; c < lo[0] + lo[1]; c++) if (!reachAny(p, c * TS + 8, lo[2] * TS)) safeLo = true; for (let c = hi[0]; c < hi[0] + hi[1]; c++) if (!reachAny(p, c * TS + 8, hi[2] * TS)) safeHi = true;
    assert.ok(safeLo && safeHi, 'a ledge by a weight has nowhere it never reaches (nowhere to wait): ' + JSON.stringify({ lo, hi, safeLo, safeHi })); }
  { const a = pendPos(PP[0], 0.3), b = pendPos(PP[1], 0.3); assert.ok(Math.sign(a.a) !== Math.sign(b.a), 'the two weights swing together, not against each other'); }
  { /* crossing the first gap at a run (85 px/s) from the near end of the ledge under it to the far end of the one over it, starting at each moment of a swing */
    const p = PP[0], i = seq.findIndex((q, j) => j && Math.min(q[0], seq[j - 1][0]) < p.x && Math.max(q[0], seq[j - 1][0]) >= p.x), lo = seq[i - 1], hi = seq[i];
    const x0 = (dirP > 0 ? lo[0] + 0.5 : lo[0] + lo[1] - 0.5) * TS, x1 = (dirP > 0 ? hi[0] + hi[1] - 0.5 : hi[0] + 0.5) * TS, yAt = x => ((x - p.x * TS) * dirP < 0 ? lo[2] : hi[2]) * TS;
    let clean = 0, hit = 0; for (let t0 = 0; t0 < PEND.period; t0 += 0.05) { let got = false; for (let s = 0; s <= Math.abs(x1 - x0) / 85; s += 0.02) { const x = x0 + dirP * 85 * s; if (pendReach(pendPos(p, t0 + s), x, yAt(x))) got = true; } got ? hit++ : clean++; }
    assert.ok(clean >= 4 && hit >= 4, 'the swing has no rhythm to it: crossing at a run is always clean, or never (' + clean + ' clean, ' + hit + ' hit)'); }
  { const H = newStairFx(), hits = []; const P = { x: 0, y: 0, ground: true, dead: 0 }, p = PP[0], hi = seq.find(q => q[2] === p.row);
    P.x = (dirP > 0 ? hi[0] + 0.5 : hi[0] + hi[1] - 0.5) * TS; P.y = p.row * TS; for (let i = 0; i < 60 * PEND.period; i++) updateStairFx(H, 1 / 60, { P, on: true, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: () => {}, sound: () => {} });
    assert.ok(hits.length >= 1 && hits.every(h => h.hard && h.blow === 'pend' && h.d === PEND.dmg), 'a hero standing in the swing is not hit by the weight (hard): ' + JSON.stringify(hits)); }
  /* THE ICE STAIR: his frost freezes the step you stand on and the next one up, for FROST.secs - and only on that flight */
  { const r = rig(), frozen = []; r.c.freeze = (x0, x1, row, secs) => frozen.push([x0, x1, row, secs]); stand(r.P, FLIGHTS[KI - 1].land[0] + 1, FLIGHTS[KI - 1].land[2]); r.run(0.1); stand(r.P, ...ON(KI, 0));
    r.run(10); const st0 = FLIGHTS[KI].steps[0], st1 = FLIGHTS[KI].steps[1];
    assert.ok(frozen.some(z => z[0] === st0[0] && z[2] === st0[2] && z[3] === FROST.secs) && frozen.some(z => z[0] === st1[0] && z[2] === st1[2]), 'his frost does not freeze the step under you and the next one up: ' + JSON.stringify(frozen));
    assert.ok(r.said.some(m => /FREEZES/.test(m)), 'his frost on the ice stair is not told as freezing the steps: ' + r.said);
    const q = rig(), fz = []; q.c.freeze = (...a) => fz.push(a); stand(q.P, FLIGHTS[0].land[0] + 1, FLIGHTS[0].land[2]); q.run(0.1); stand(q.P, ...ON(1)); q.run(12);
    assert.equal(fz.length, 0, 'his frost freezes steps on a flight that is not the ice stair'); }
  { const L2 = L; assert.ok(frostSteps({ x: (FLIGHTS[KI].steps[0][0] + 1) * TS, y: FLIGHTS[KI].steps[0][2] * TS }, KI).length === 2, 'frostSteps does not give the step under you and the next'); }
  /* THE BOOK GAUNTLET: while you are on it, his books are told in a niche on the wall the flight runs to, then fly at you; a shield turns them (not hard); off it, none come */
  { const H = newStairFx(), hits = [], said = []; const st = FLIGHTS[KB].steps[1], P = { x: (st[0] + (st[1] >> 1)) * TS + 8, y: st[2] * TS, ground: true, dead: 0 }; let told = 0, flew = 0, from = null;
    for (let i = 0; i < 60 * 6; i++) { updateStairFx(H, 1 / 60, { P, on: true, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: m => said.push(m), sound: () => {} });
      for (const b of H.books) { if (b.tell > 0) { told++; from ??= b.x; } else flew++; } }
    assert.ok(told > 0 && flew > 0 && hits.length >= 2 && hits.every(h => !h.hard && h.blow === 'book' && h.d === BOOK.dmg), 'his books are not told, then flown at you, blockable: ' + JSON.stringify({ told, flew, hits }));
    assert.ok(FLIGHTS[KB].dir < 0 ? from < (S.x0 + 1) * TS : from > S.x1 * TS, 'his books do not come off the wall the flight runs to: ' + from);
    const H2 = newStairFx(), h2 = []; const st2 = FLIGHTS[KP].steps[1], P2 = { x: (st2[0] + 1) * TS, y: st2[2] * TS, ground: true, dead: 0 };
    for (let i = 0; i < 60 * 6; i++) updateStairFx(H2, 1 / 60, { P: P2, on: true, hit: (x, y, d, hard, blow) => h2.push(blow), say: () => {}, sound: () => {} });
    assert.ok(!H2.books.length && !h2.includes('book'), 'his books fly on a flight that is not the gauntlet'); }
  assert.ok(L.ents.filter(e => e.t === 'sign' && inS(e) && /WEIGHTS|FROST FREEZES|BOOKS FLY/.test(e.text)).length === 3, 'the three new flights are not each signed where they begin'); }
// ---- PAGE ----
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const AU=await import('/src/audio.js');const LB=await import('/src/lab.js');BK.manualSimulation=true;const out={casts:[],offCast:0,heroes:{},cam:{frames:0,bad:null,rose:0},told:[],up:{}};
   const boot=(h='knight',god=true)=>{BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';AU.music.play(BK.L.music||'theme');BK.god=god;BK.sim(10);};   /* (the level's own track, as a start from the map plays it: BK.load leaves the music alone) */
   const through=()=>{BK.tp(33,${TOWER.SKY});BK.sim(5);out.tune0??=AU.music.want;for(let i=0;i<90;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;BK.sim(20);BK.step(1);};
   const chase=()=>BK.enemies().find(e=>e.t==='magechase'),D=()=>BK.chase.states()[0],DS=()=>BK.chase.specs()[0];
   /* 1. THE CLIMB (the lab's stair bot, god mode): the dark starts, the camera rises with it, a speed-up is told before it comes */
   boot();through();
   out.foot=[Math.floor(BK.P.x/16),Math.round(BK.P.y/16)-1];out.view=BK.view.VW;out.tuneFoot=AU.music.want;out.idleAtFoot=D()&&D().phase;
   const m=chase();out.woke=m&&m.mode!=='sleep';let last='',cam0=null,warn0=0;
   const res=LB.chaseClimb(BK,m,{secs:150,each:t=>{if(t%3===0)BK.step(1);const s=D(),sp=DS(),v=BK.view;
     if(s.phase==='run'){out.started=true;out.cam.frames++;cam0??=v.y;out.cam.rose=Math.max(out.cam.rose,cam0-v.y);
       if(v.y+v.VH>s.pos+sp.edge+1&&v.y+v.VH<${L.H * TS}-1)out.cam.bad??=('the screen\\'s bottom '+Math.round(v.y+v.VH)+' is more than the edge under the front '+Math.round(s.pos));
       if(t>3&&v.VH>240){if(s.pos<${S.floor * TS}&&s.pos>v.y+v.VH-4&&BK.P.y-7-s.pos>-(0.4*v.VH-${sp.show}-4))out.cam.bad??=('the dark is under the screen, unseen: '+Math.round(s.pos)+' vs '+Math.round(v.y+v.VH));if(BK.P.y-26<v.y||BK.P.y>v.y+v.VH)out.cam.bad??=('the hero is off the screen: '+Math.round(BK.P.y)+' in '+Math.round(v.y)+'..'+Math.round(v.y+v.VH));}   /* (the frame is drawn every third step: VH is the real one; under the stair's floor it is in the stone) */
       if(s.warnT>warn0+0.5)out.told.push({speed:Math.round(s.speed),dist:Math.round(s.dist)});warn0=s.warnT;   /* a warning told (its banner starts) */
       for(let i=1;i<sp.curve.length;i++)if(out.up[i]===undefined&&s.speed>sp.curve[i-1].speed+0.5)out.up[i]=out.told.length;}   /* the warnings told before the dark first ran faster than row i-1 */
     if(s.phase==='done')out.done='done';
     if(m.alive&&/Tell$/.test(m.mode)&&m.mode!==last){const on=m.x>v.x&&m.x<v.x+v.VW&&m.y-46>v.y&&m.y<v.y+v.VH;out.casts.push(m.mode+(BK.telling(m)?BK.markOf(m):'?'));if(!on)out.offCast++;}last=m.alive?m.mode:'gone';}});
   out.secs=Math.round(res.t/60);out.spec={look:DS().look,contact:DS().contact,autoscroll:DS().autoscroll};
   BK.sim(30);const A=BK.L.arena;out.fight=!!BK.bossActive;out.carpet=!!BK.carpet();out.inHall=BK.P.x>A.x0&&BK.P.x<A.x1&&BK.P.y>A.y0&&BK.P.y<A.floor;out.chaseGone=!m.alive;out.darkAfter=D().phase;
   out.tuneFight=AU.music.want;out.musicGap=BK.bossMusicT;
   /* 2. EVERY HERO GETS UP IT UNDER THE SCROLL: no god mode, health held up (his spells counted, not fatal) - the dark must never catch it */
   for(const h of ${JSON.stringify(HEROES)}){boot(h,false);through();const q=LB.chaseClimb(BK,chase(),{secs:150,refill:true});out.heroes[h]={carpet:!!BK.carpet(),secs:Math.round(q.t/60),taken:Math.round(q.taken),died:q.died,dark:D().hits};}
   /* 3. STAND ON THE STAIR AND THE DARK HURTS YOU AND THROWS YOU UP - again and again, until it has killed you: you wake at the foot, the dark back under the floor, him over the first landing (archmage2) */
   boot('knight',false);through();for(let i=0;i<90&&BK.P.x<${checks[0].x * TS + 16};i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;out.lit=BK.P.x>=${checks[0].x * TS + 8};   /* (out of the ring and past the foot's shrine, as the way to the first step goes: to the RIGHT since archmage3) */
   BK.tp(${FLIGHTS[0].steps[1][0] + 1},${FLIGHTS[0].steps[1][2] - 1});let died=-1,h0=D().hits;out.thrown=[];for(let i=0;i<60*90&&died<0;i++){const y0=BK.P.y;BK.sim(1);if(D().hits>h0){h0=D().hits;if(!(BK.P.dead>0))out.thrown.push([Math.round(y0),Math.round(BK.P.y),i]);}if(BK.P.dead>0)died=i;}
   out.standDied=died>=0?Math.round(died/60):null;out.standPhase=D().phase;for(let i=0;i<900&&BK.P.dead>0;i++)BK.sim(1);out.posAfter=Math.round(D().pos);BK.sim(90);
   const m2=chase();out.respawn=[Math.floor(BK.P.x/16),Math.round(BK.P.y/16)-1];out.after=D().phase;out.m2=m2&&[m2.mode,Math.round(m2.x/16),Math.round(m2.y/16)];out.tuneRespawn=AU.music.want;
   return out;})()`, 1500000);
  assert.deepEqual(pg.errors, [], 'page errors');
} finally { pg.close(); }
const tune = L.arena.music || 'boss';
console.log(JSON.stringify({ ...r, casts: r.casts.length }));
assert.ok(Math.abs(r.foot[0] - foot.x) <= 2 && r.foot[1] === foot.y, 'walking into his ring on the parapet does not put you at the spiral\'s foot: ' + JSON.stringify(r.foot));
assert.ok(r.woke, 'he does not wake when you come through'); assert.ok(r.view > 320, 'the stair is not seen zoomed out: ' + r.view);
assert.equal(r.idleAtFoot, 'run', 'the dark is not already rising when you come out of his ring at the stair\'s foot (archmage2: it starts AT ENTRY)');
assert.ok(r.tune0 !== tune && r.tuneFoot === tune, 'HIS MUSIC is not up from the first step of the stair (' + r.tune0 + ' on the parapet, ' + r.tuneFoot + ' at the foot, want ' + tune + ')');
assert.ok(r.tuneFight === tune && !(r.musicGap > 0), 'his music breaks off when the fight starts: ' + [r.tuneFight, r.musicGap]);
assert.equal(r.tuneRespawn, tune, 'a death on the stair and his music is not back on waking at its foot');
assert.ok(r.started && r.cam.frames > 60 && r.cam.bad === null, 'AUTOSCROLL: the dark does not run, or the camera lets it (or you) off the screen: ' + JSON.stringify(r.cam));
assert.ok(r.cam.rose > 400, 'the camera does not rise with the climb: ' + r.cam.rose);
assert.ok(r.told.length >= 1 && Object.keys(r.up).length >= 1 && Object.entries(r.up).every(([i, n]) => n >= +i), 'the dark quickens with no warning told first: ' + JSON.stringify({ told: r.told, up: r.up }));
assert.ok(r.spec.look === 'dark' && r.spec.contact === 'hurt' && r.spec.autoscroll, 'the page\'s chase is not the dark that kills and scrolls: ' + JSON.stringify(r.spec));
assert.ok(r.fight && r.carpet && r.inHall && r.chaseGone, 'the climb with the game\'s own jump does not reach the carpet, or the carpet does not start his fight: ' + JSON.stringify(r));
assert.ok(r.done === 'done' && r.darkAfter === 'idle', 'the dark does not stop at the top floor, or follows you into his hall: ' + [r.done, r.darkAfter]);
assert.ok(r.casts.length >= 6 && r.casts.some(c => c.startsWith('fireTell')) && r.casts.some(c => c.startsWith('markTell')), 'he hardly casts on the way up: ' + r.casts);
assert.ok(r.casts.every(c => c.startsWith('markTell') ? c.endsWith('!!') : c.endsWith('!') && !c.endsWith('!!')), 'a spell told with the wrong mark (or none): ' + r.casts);
assert.equal(r.offCast, 0, 'a spell begun with him off the screen');
const riseRows = (sp.from - sp.end);   /* px from where the dark starts to where it stops */
for (const h of HEROES) { const q = r.heroes[h]; assert.ok(q && q.carpet && q.died === 0, h + ' does not get up the stair under the scroll without the dark catching it: ' + JSON.stringify(q)); }
const slowest = Math.max(...HEROES.map(h => r.heroes[h].secs)), FAIR = (sp.trigger - sp.end) / slowest;
/* (archmage2) the old "its fastest is under the slowest hero's average climb" is gone: the dark is MEANT to be faster than a hero who stops
   (30 px/s and surging, Daniel's "it doesn't do anything"). Its fairness is measured where it bites: a climbing hero is caught a few times at
   most (below), close under you it creeps (the engine's lint: speed x slow well under a hero's run), and the caps leave no soft-lock. */
const medSecs = HEROES.map(h => r.heroes[h].secs).sort((p, q) => p - q)[HEROES.length >> 1];   /* (archmage3) the median climb is the brief's number; the slowest hero (the geomancer, knocked about by his bolts) gets slack */
assert.ok(slowest <= 130 && medSecs >= 60 && medSecs <= 100 && Math.min(...HEROES.map(h => r.heroes[h].secs)) >= 55, 'the climb is not 60-110 s-ish for the stair bot (archmage3 brief: ~80-100 s for a player, with THE ORRERY LOFT; the bot waits for no world it can take): ' + HEROES.map(h => r.heroes[h].secs));
assert.ok(HEROES.every(h => r.heroes[h].dark <= 4), 'the dark catches a hero who keeps climbing more than a few times: ' + HEROES.map(h => h + ' ' + r.heroes[h].dark));
assert.ok(r.thrown.length >= 2 && r.thrown.every(([a, b]) => b < a - 8) && r.standDied !== null && r.standDied >= 6, 'a hero who stands on the stair is not hurt and thrown UP by the dark, again, until it kills him (and not at once): ' + JSON.stringify([r.thrown, r.standDied]));
assert.ok(r.respawn[1] === S.floor - 1 && Math.abs(r.respawn[0] - checks[0].x) <= 2, 'a death on the stair does not wake you at its foot: ' + JSON.stringify(r.respawn));
assert.ok(r.posAfter > S.floor * TS && r.m2 && r.m2[0] !== 'sleep' && Math.abs(r.m2[1] * TS - perchOf(0).x) < 24 && Math.abs(r.m2[2] * TS - perchOf(0).y) < 24, 'waking at the foot, the dark is not back under the floor or he is not over the first landing: ' + JSON.stringify([r.posAfter, r.m2]));
console.log(`ok  tower-chase   his ring on the parapet to a ${S.x1 - S.x0 + 1}x${S.floor - S.top}-tile spiral stair (ten flights - the pendulum, the ice stair, the book gauntlet and THE ORRERY LOFT new - no gap over 2 tiles but the orrery voids, ridden, one checkpoint at its foot), his music from the first step, no brazier or ward left; HIS DARK MAGIC rises up it from ENTRY (${sp.curve.map(q => q.speed).join('/')} px/s, surges told, rubber ${sp.rubber.min}-${sp.rubber.max}, hurt ${sp.dmg} + thrown up, capped under every landing) and the camera with it (${Math.round(r.cam.rose)} px); the bot climbs in ${r.secs} s with ${r.casts.length} told casts (${[...new Set(r.casts)].join(' ')}), none off the screen; every hero up it under the scroll (${HEROES.map(h => h + ' ' + r.heroes[h].secs + 's/' + r.heroes[h].taken + 'hp/' + r.heroes[h].dark + ' dark').join(', ')}; fair climb ${FAIR.toFixed(1)} px/s, the dark close under you ${fastest.toFixed(1)}); a hero who stands is hurt and thrown up ${r.thrown.length} times, dies of it in ${r.standDied} s and wakes at the foot; the carpet at the top starts his fight`);
