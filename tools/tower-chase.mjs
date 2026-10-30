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
//   FALLING TOWER 3 (claude/fallingtower3, Daniel 10-27: "the Undead Archmage fight becomes a CHASE THROUGH THE TOWER"; extended here, not forked):
//            the stair's top holds HIS RING where his carpet lay - through it, THE CHASE (src/archmage-chase.js): four rooms stacked under the stair, each
//            its own ledges, and THE CORE under them where his carpet waits. In Node: the rooms and the core are built and walled, the ring pair joins
//            the top to the first room, the fill goes DOWN through every floor (L.reachOpens) to the carpet and not without the ring, the first room
//            holds him and its sign; HIS SPELLS ARE HIS FIGHT'S (every room casts only spells of MAGE.order, at their fight tells); a struck-back
//            shot (and a mark that finds no one) makes him FALL to the room's floor, open x2 for CH.downT s, then he FLEES - in a 'strike' room he
//            sinks through the floor and its cracked pillar is ARMED (struck before, it rings off and holds), in a 'pour' room the floor breaks
//            under you, told CH.tearT s first; he waits in the room under and wakes there only once you are down in it; the last floor pours you
//            into the core; he is never taken under CH.hpFloor in the rooms (main.js); his hall's realms come at marks cut from what is left
//            (e.realmAt). In the page: through the ring at the stair's top the fight starts in the first room; a struck-back bolt drops him;
//            the lab's chase hands play it down the four rooms onto his carpet and the fight goes on in his hall
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
const rings = L.ents.filter(e => e.t === 'ringdoor'), way = rings.find(e => e.id === 'crown-ring'), foot = rings.find(e => e.id === (way && way.to));
/* (claude/fallingtower3) FOUR rings now: the parapet's and the stair's foot, and the stair's top and THE CHASE's first room */
assert.ok(way && foot && rings.length === 4 && rings.some(e => e.id === 'chase-in' && e.to === 'chase-top') && rings.some(e => e.id === 'chase-top'), 'his ring on the parapet and the one it lets you out of, and his ring at the stair\'s top into the chase: ' + JSON.stringify(rings));
assert.ok(way.x === 36 && way.y === TOWER.SKY && at(way.x, way.y + 1) === T.SOLID, 'his ring stands on the parapet where the door into his hall stood: ' + way.x + ',' + way.y);
assert.ok(inS(foot) && std(foot.x, foot.y) && foot.y === S.floor - 1, 'it lets you out on the spiral stair\'s floor: ' + foot.x + ',' + foot.y);
assert.ok(W > TOWER.W && S.x0 > TOWER.W + 4, 'the stair tower stands east of the tower\'s own wall, solid rock between: ' + S.x0);
for (let y = S.top; y < S.floor; y++) for (let x = TOWER.X1 + 1; x < S.x0; x++) assert.equal(at(x, y), T.SOLID, 'rock between the tower and the stair at ' + x + ',' + y);
assert.ok(L.sanctum.rug && L.carpetAt.x === L.sanctum.in.x && L.carpetAt.y === L.sanctum.in.y, 'the carpet lies at the door into his hall');
/* (claude/fallingtower3) and both are in THE CORE under the chase's last room now (they were at the stair's top, where his ring stands) */
assert.ok(L.chase3 && L.carpetAt.x >= S.x0 * TS && L.carpetAt.x <= S.x1 * TS && L.carpetAt.y > L.chase3.core.top * TS && L.carpetAt.y < L.chase3.core.bot * TS, 'and both are in the core under the chase, not on the parapet or the stair: ' + JSON.stringify(L.carpetAt));
{ const top = rings.find(e => e.id === 'chase-in'); assert.ok(top && top.y === TOP.row && top.x === TOP.carpet && std(top.x, top.y), 'his ring into the chase does not stand on the stair\'s top floor where the carpet lay: ' + JSON.stringify(top)); }
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
assert.ok(L.chase3 && std(Math.floor(L.chase3.check.x / TS), Math.round(L.chase3.check.y / TS) - 1) && Math.round(L.chase3.check.y / TS) - 1 === TOP.row, 'the fight\'s retry spot (main.js bossStart sets it) is not on the stair\'s top floor: ' + JSON.stringify(L.chase3 && L.chase3.check));   /* (claude/fallingtower3: it was the carpet's, five tiles back from it) */
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
const RL = (L.chases || []).filter(c => c.id === 'towerscroll');   /* (claude/ft4b: the tower's acts II and III have their own COLLAPSE FRONTS after it in L.chases - tools/fallingtower4.mjs; the stair's is the first) */
assert.equal(RL.length, 1, 'the stair hands the chase engine no chase (L.chases): ' + RL.length); assert.equal(L.chases[0].id, 'towerscroll', 'the stairs chase is not the first (BK.chase.states()[0] below)');
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
/* FALLING TOWER 4 (claude/ft4a, Daniel 10-29 #6): THROW IT BACK ON THE CLIMB - his fight's strike-back rule on his stair (undead-mage.js blowMeets/sendHome/homeStep,
   shared): a blow that meets his fire strikes it home; home, HE REELS for CHASE.reel s (no damage: he has none to take), off his perch, casting nothing; a PERFECT
   PARRY sends it home too and pays CHASE.perfect s; one stun a flight; after it his ward holds CHASE.ward s and he ANSWERS (his mark, or fire and frost) */
{ const UM = await import('../src/undead-mage.js'); assert.ok(UM.blowMeets && UM.sendHome && UM.homeStep, 'the strike-back rule is not one shared helper');
  const src = readFileSync(new URL('../src/undead-mage.js', import.meta.url), 'utf8'), sp = readFileSync(new URL('../src/spiral-chase.js', import.meta.url), 'utf8');
  assert.ok(src.includes('blowMeets(q, b)) { sendHome(q, e)') && src.includes('homeStep(q, e, dt)') && sp.includes('blowMeets(q, blow)') && sp.includes('homeStep(q, e, dt)'), 'the fight and the stair do not share the strike-back rule');
  assert.ok(CHASE.reel === 5 && CHASE.perfect === 7 && CHASE.ward >= 3, 'the stun is not 5 s (7 s on a perfect parry) with a ward after it');
  const live = o => { const r = rig(o); let blow = null, parry = false; r.c.strike = () => blow; r.c.parried = res => parry && res === 'blocked'; r.c.hit = (x, y, d, hard, b) => { r.hits.push({ d, hard, blow: b }); return parry ? 'blocked' : 'hit'; };
    const reels = []; r.c.reel = (m, T) => reels.push(T); stand(r.P, ...ON(0)); return { ...r, reels, setBlow: b => { blow = b; }, setParry: v => { parry = v; } }; };
  /* struck back: he reels 5 s, nothing cast, no damage taken by anyone */
  { const r = live(); r.run(4, () => {}); let q = null; for (let i = 0; i < 600 && !q; i++) { updateMageChase(r.e, 1 / 60, r.c); q = r.e.shots.find(s => UM.reflectable(s)); }
    assert.ok(q && q.kind === 'fire', 'the first flight casts no fire to strike back');
    r.setBlow({ l: q.x - 12, r: q.x + 12, t: q.y - 12, b: q.y + 12 }); updateMageChase(r.e, 1 / 60, r.c); r.setBlow(null); assert.ok(q.reflected, 'a blow that meets his fire on the stair does not strike it back');
    let reeled = false; for (let i = 0; i < 400 && !reeled; i++) { updateMageChase(r.e, 1 / 60, r.c); reeled = r.e.mode === 'reel'; }
    assert.ok(reeled && r.reels[0] === CHASE.reel && r.e.modeT > CHASE.reel - 0.5, 'his fire struck home does not stun him for ' + CHASE.reel + ' s: ' + [r.e.mode, r.reels]);
    const y0 = r.e.y, n0 = r.e.shots.filter(s => !s.reflected).length, tells = []; r.run(CHASE.reel - 0.3, () => { if (/Tell$/.test(r.e.mode)) tells.push(r.e.mode); });
    assert.ok(!tells.length && r.e.shots.filter(s => !s.reflected).length <= n0, 'he casts while he reels: ' + tells); assert.ok(r.e.y > y0 - 1 && r.e.mode === 'reel', 'he is not knocked off his perch while he reels');
    r.run(0.6); assert.ok(r.e.mode !== 'reel' && r.e.stunWard > 0, 'the stun does not end in his told ward');
    /* one stun a flight: the next one rings off */
    let q2 = null; for (let i = 0; i < 900 && !q2; i++) { updateMageChase(r.e, 1 / 60, r.c); q2 = r.e.shots.find(s => UM.reflectable(s)); }
    assert.ok(q2, 'after the stun he never casts again on the flight'); r.e.stunWard = 0; r.setBlow({ l: q2.x - 12, r: q2.x + 12, t: q2.y - 12, b: q2.y + 12 }); updateMageChase(r.e, 1 / 60, r.c); r.setBlow(null);
    r.run(3); assert.ok(r.reels.length === 1 && r.e.mode !== 'reel', 'two stuns on one flight: ' + r.reels); }
  /* a perfect parry: home, and the long stun */
  { const r = live(); r.setParry(true); let reeled = false; for (let i = 0; i < 60 * 12 && !reeled; i++) { updateMageChase(r.e, 1 / 60, r.c); reeled = r.e.mode === 'reel'; }
    assert.ok(reeled && r.reels[0] === CHASE.perfect, 'a perfect parry of his fire does not send it home for the long stun: ' + r.reels); }
  /* the answer: on a flight with his mark, his mark; on one without, fire and frost together */
  { const r = live(); r.e.answer = true; r.run(6, () => {}); assert.ok(r.e.shots.some(s => s.kind === 'ice') || r.hits.some(h => h.blow === 'ice'), 'after a stun on the first flight he does not answer with fire and frost'); }
  /* the stair says so where it starts */
  assert.ok(L.ents.some(e => e.t === 'sign' && /STRIKE HIS FIRE BACK/.test(e.text) && e.y === S.floor - 1), 'the first flight does not sign the throw-back'); }
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
// ---- THE CHASE (claude/fallingtower3) ----
{ const CC = await import('../src/archmage-chase.js'), UM = await import('../src/undead-mage.js'), { CH, ROOMS, CORE, roomOf, roomAt, chaseLeg, chaseBox, CHASE_MODES } = CC, C3 = L.chase3;
  assert.ok(C3 && C3.rooms.length === 4 && ROOMS.filter(R => R.follow === 'strike').length === 2 && ROOMS.filter(R => R.follow === 'pour').length === 2 && ROOMS[ROOMS.length - 1].follow === 'pour', 'the chase is not four rooms, two you break after him and two he breaks under you, the last pouring you into the core');
  for (const R of C3.rooms) { for (let y = R.top; y < R.floor; y++) for (const x of [CH.x0 - 1, CH.x1 + 1]) assert.equal(at(x, y), T.SOLID, R.name + ' is not walled at ' + x + ',' + y);
    for (let x = CH.x0; x <= CH.x1; x++) { assert.equal(at(x, R.floor), T.SOLID, R.name + '\'s floor has a hole at ' + x); assert.equal(at(x, R.top - 1), T.SOLID, R.name + ' is open to the room over it at ' + x); }
    assert.ok(R.ledges.length >= 3 && R.ledges.every(([x0, len, up]) => up >= 3 && up <= 6 && at(x0, R.floor - up) === T.ONEWAY), R.name + ' has not its own ledges, a real jump up');
    assert.ok(L.interiors.some(i => i[0] === CH.x0 && i[2] === R.top), R.name + ' is not a room (interiors)'); }
  assert.equal(new Set(ROOMS.map(R => JSON.stringify(R.ledges.map(l => [l[1], l[2]])))).size, 4, 'two rooms of the chase are the same shape');
  for (let y = CORE.top; y < CORE.bot; y++) assert.equal(at(CH.x0 + 3, y), T.AIR, 'the core is not open at row ' + y);
  assert.ok(C3.rooms[0].top > S.floor + 1, 'the chase is not under the stair (rock between)');
  /* THE WAY: the ring at the stair's top, and down through every floor to the carpet - and not without the ring */
  const Rf = floodReach(L, T, { rides: true, across: 5 }); for (const R of C3.rooms) assert.ok(Rf.seen.has(((CH.x0 + CH.x1) >> 1) + ',' + (R.floor - 1)) || [...Array(CH.x1 - CH.x0)].some((_, i) => Rf.seen.has((CH.x0 + i) + ',' + (R.floor - 1))), 'the fill does not stand in ' + R.name);
  assert.ok(Rf.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the fill does not come down the chase to the carpet');
  { const noRing = { ...L, ents: L.ents.map(e => e.id === 'chase-in' ? { ...e, to: null } : e) }; assert.ok(!floodReach(noRing, T, { rides: true, across: 5 }).jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the carpet is reached without his ring at the stair\'s top: the ring is not the way in'); }
  { const noOpen = { ...L, reachOpens: [] }; assert.ok(!floodReach(noOpen, T, { rides: true, across: 5 }).jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the carpet is reached with every floor of the chase whole: the floors are not the way down'); }
  const him = L.ents.find(e => e.t === 'undeadmage'); assert.ok(him && roomAt(him.x * TS, him.y * TS) === 0, 'he is not in the first room of the chase');
  assert.ok(L.ents.some(e => e.t === 'sign' && roomAt(e.x * TS, e.y * TS) === 0 && /STRIKE HIS SPELLS BACK/.test(e.text)) && L.ents.some(e => e.t === 'sign' && roomAt(e.x * TS, e.y * TS) === 0 && /CRACKED PILLAR/.test(e.text)), 'the first room does not sign the opening and the pillar');
  for (const R of ROOMS) assert.ok(R.order.every(s => UM.MAGE.order.includes(s) && UM.MAGE.tell[s] > 0), R.name + ' casts a spell that is not his fight\'s: ' + R.order);
  assert.ok(L.arena.chase && L.arena.trigger > CH.x0 * TS && L.arena.y0 === C3.rooms[0].top * TS && L.arena.hallArena && L.arena.hallArena.carpet, 'the arena is not the chase\'s first room with his hall laid by for the carpet');
  /* THE STATE OF HIM, in Node: a rig on updateUndeadMage with THE CHASE's leg */
  const rig = (k = 0) => { const R = roomOf(k), P = { x: (CH.x0 + 6) * TS, y: R.floor * TS, ground: true, dead: 0, dodge: 0 }, log = { says: [], hits: [], armed: [], cleared: [], rooms: [], away: 0 };
    const e = { t: 'undeadmage', alive: true, hp: 2800, hp0: 2800, maxHp: 2800, mode: 'hover', modeT: 0.4, x: (CH.x1 - 5) * TS, y: (R.floor - CH.hover - 2) * TS, face: -1, anim: 0, turn: 0, blinkT: 99, leg: 'chase', room: k };
    const cc = { P, say: m => log.says.push(m), callout: m => log.says.push(m), sound: () => {}, shake: () => {}, dust: () => {}, arm: k => log.armed.push(k), clearRoom: k => log.cleared.push(k), setRoom: k => log.rooms.push(k), away: () => log.away++ };
    let strike = null; const c = () => ({ P, A: L.arena, box: chaseBox(e.room || 0), rnd: () => 0.5, hit: (x, y, d, hard, blow) => log.hits.push(blow), venom: () => {}, say: m => log.says.push(m), sound: () => {}, dodging: () => false, carry: () => {}, strike: () => strike, chase: (m, d) => chaseLeg(m, d, cc) });
    const step = () => UM.updateUndeadMage(e, 1 / 60, c()); const run = (s, each) => { for (let i = 0; i < Math.round(s * 60); i++) { step(); if (each && each()) return true; } return false; };
    return { P, e, log, run, step, setStrike: b => { strike = b; } }; };
  { const r = rig(0), tells = new Set(); r.run(12, () => { if (/Tell$/.test(r.e.mode)) tells.add(r.e.mode.replace('Tell', '')); });
    assert.ok([...tells].every(s => ROOMS[0].order.includes(s)) && tells.size >= 2, 'the first room casts a spell not its own, or not two of its own: ' + [...tells]); }
  { const r = rig(0); r.run(3, () => r.e.shots && r.e.shots.some(q => UM.reflectable(q)));
    const q = r.e.shots.find(q => UM.reflectable(q)); assert.ok(q, 'in 3 s of the first room he casts nothing to strike back');
    r.setStrike({ l: q.x - 20, r: q.x + 20, t: q.y - 20, b: q.y + 20 }); r.step(); r.setStrike(null); assert.ok(q.reflected, 'a blow that meets his bolt does not strike it back');
    assert.ok(r.run(4, () => r.e.mode === 'fall'), 'his bolt struck home does not make him FALL: ' + r.e.mode);
    assert.ok(r.run(3, () => r.e.mode === 'down'), 'he does not come down on the floor: ' + r.e.mode + ' y ' + r.e.y);
    assert.ok(Math.abs(r.e.y - roomOf(0).floor * TS) < 1 && UM.mageOpen(r.e) && r.e.open > CH.downT - 0.2, 'down, he is not on the floor or not open: ' + [r.e.y, r.e.open]);
    const t0 = r.log.says.length; r.run(CH.downT + 0.05); assert.ok(r.e.mode === 'rise' || r.e.mode === 'sink', 'after ' + CH.downT + ' s he does not flee: ' + r.e.mode);
    r.run(CH.riseT + CH.sinkT + 0.2); assert.ok(r.e.mode === 'below' && r.log.armed.includes(0) && !r.log.cleared.length, 'in a strike room he does not sink through and light its pillar (the floor is yours to break): ' + JSON.stringify({ m: r.e.mode, a: r.log.armed, c: r.log.cleared }));
    assert.ok(r.log.says.slice(t0).some(m => /PILLAR/.test(m)), 'the lit pillar is not told');
    r.run(2); assert.equal(r.e.mode, 'below', 'he wakes under you before you are down in his room');
    r.P.y = roomOf(1).floor * TS; r.P.ground = true; r.run(0.1); assert.ok(r.e.mode === 'wake' && r.e.room === 1 && r.log.rooms.includes(1), 'down in the room under, he does not wake there: ' + r.e.mode); }
  { const r = rig(1); r.e.mode = 'gather'; r.e.modeT = 2; r.run(4, () => r.e.mode === 'down'); r.run(CH.downT + CH.riseT + 0.1); assert.equal(r.e.mode, 'tear', 'in a pour room he does not break the floor (his mark come back on him drops him too)');
    assert.ok(r.log.says.some(m => /BREAKS THE FLOOR/.test(m)) && !r.log.cleared.length, 'the floor breaks untold'); r.run(CH.tearT + 0.05); assert.deepEqual(r.log.cleared, [1], 'his tear does not take the floor'); assert.equal(r.e.mode, 'below'); }
  { const r = rig(3); r.e.mode = 'reflected'; r.run(4, () => r.e.mode === 'down'); r.run(CH.downT + CH.riseT + CH.tearT + 0.2); assert.ok(r.e.mode === 'away' && r.log.away === 1 && r.log.cleared[0] === 3, 'the last floor does not pour you into the core with him gone up: ' + r.e.mode); }
  { const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
    assert.ok(src.includes("e.leg==='chase'){const f=chase3FloorHp(e);dmg=Math.max(0,Math.min(dmg,e.hp-f));") && CC.floorHp({ hp: 100, maxHp: 1000, hp0: 5000 }) === Math.ceil(1000 * CH.hpFloor) && CH.hpFloor >= 0.3 && CH.hpFloor <= 0.7 && CC.ASC.hpFloor <= CH.hpFloor && CC.ASC.hpFloor >= 0.3, 'the chase (or the ascent under it) can take him lower than its floor, or reads it off anything but the bar (his hall would have nothing left)');   /* (ft4a: maxHp - the bar - not hp0) */
    assert.ok(/e\.realmAt=\[r\*0\.9,r\*0\.6,r\*0\.3\]/.test(src), 'his realms do not come at marks cut from what the chase left of him');
    const MR = await import('../src/mage-realms.js'); assert.equal(MR.realmDue({ hp: 1200, hp0: 2800, realmN: 0, realmAt: [0.45, 0.3, 0.15] }), 0, 'his first realm does not come at its cut mark'); assert.equal(MR.realmDue({ hp: 1300, hp0: 2800, realmN: 0, realmAt: [0.45, 0.3, 0.15] }), -1, 'his first realm comes before its cut mark'); }
  /* the floor's pillar: armed only once he is through (src/tower-supports.js) */
  { const SU = await import('../src/tower-supports.js'), L3 = { ftSupports: L.ftSupports.filter(s => s.kind === 'floor').map(s => ({ ...s })) }; SU.supportsReset(L3);
    const s = L3.ftSupports[0], P = { x: s.x - 10, y: s.y, dead: 0 }, set = [], says = []; let hb = { l: s.x - 8, r: s.x + 8, t: s.y - 20, b: s.y };
    const c = { T, strike: () => hb, set: (x, y, t) => set.push([x, y, t]), resolve: () => {}, foes: () => [], hurt: () => {}, say: (x, y, m) => says.push(m), callout: m => says.push(m), sound: () => {}, shake: () => {}, dust: () => {}, burst: () => {} };
    SU.supportsUpdate(L3, P, 1 / 60, c); hb = null; SU.supportsUpdate(L3, P, 1 / 60, c); assert.ok(s.st === 'whole' && !set.length && says.some(m => /HOLDS/.test(m)), 'the chase\'s pillar breaks before he is through it');
    s.armed = true; hb = { l: s.x - 8, r: s.x + 8, t: s.y - 20, b: s.y }; SU.supportsUpdate(L3, P, 1 / 60, c); assert.equal(s.st, 'tell', 'struck once he is through, the pillar does not give');
    hb = null; for (let i = 0; i < 60 * 1.3; i++) SU.supportsUpdate(L3, P, 1 / 60, c); assert.ok(s.st === 'down' && set.some(([x, y, t]) => y === roomOf(s.room).floor && t === T.AIR), 'the pillar does not take its floor with it'); } }
/* FALLING TOWER 4 (claude/ft4a, Daniel 10-29 #4): THE CHASE ROOMS COLLAPSE AROUND YOU - in Node (src/archmage-chase.js chaseRoomStep, FALL4) */
{ const CC = await import('../src/archmage-chase.js'), UM = await import('../src/undead-mage.js'), { CH, ROOMS, roomOf, FALL4, chaseRoomStep, chaseLeg, coverOf, roomClear } = CC;
  /* every room: a VAULT PILLAR inside it, floor to vault, with a crush box in the room and a cover spot on its floor clear of every sign, ringdoor and the floor pillar */
  for (let k = 0; k < ROOMS.length; k++) { const R = roomOf(k), v = L.ftSupports.find(s => s.vault && s.room === k), cv = coverOf(k);
    assert.ok(v && v.kind === 'crush' && v.col > CH.x0 && v.col < CH.x1 + 1 && v.h >= 8 && v.crush[0] >= CH.x0 && v.crush[1] <= CH.x1 && v.crush[2] === R.top && v.crush[3] === R.floor - 1, R.name + ' has no vault pillar over its own room: ' + JSON.stringify(v && [v.col, v.crush]));
    assert.ok(cv[0] >= CH.x0 && cv[1] <= CH.x1 && cv[3] === R.floor - 1 && !(R.pillar >= cv[0] && R.pillar <= cv[1]) && !L.ents.some(e => (e.t === 'sign' || e.t === 'ringdoor') && e.y === R.floor - 1 && e.x >= cv[0] && e.x <= cv[1]), R.name + '\'s fallen column would lie on its pillar or a sign');
    assert.ok(roomClear(k).some(([a, b, c, d]) => a === cv[0] && b === cv[1] && c === cv[2] && d === cv[3]), R.name + '\'s cover does not go with its floor (or come back on a retry)');
    for (let x = cv[0]; x <= cv[1]; x++) for (let y = cv[2]; y <= cv[3]; y++) assert.equal(at(x, y), T.AIR, R.name + ': the cover spot is not open before the column falls'); }
  assert.ok(L.ents.some(e => e.t === 'sign' && /HOLDS THE VAULT/.test(e.text) && e.y === roomOf(0).floor - 1), 'the first room does not sign the vault pillar');
  const rig = (k = 0) => { const R = roomOf(k), P = { x: (CH.x0 + 6) * TS, y: R.floor * TS, ground: true, dead: 0 }, log = { debris: [], cleared: [], says: [] };
    const e = { t: 'undeadmage', alive: true, hp: 2800, hp0: 2800, maxHp: 2800, mode: 'hover', modeT: 0.4, x: (CH.x1 - 5) * TS, y: (R.floor - CH.hover - 2) * TS, face: -1, anim: 0, turn: 0, blinkT: 99, leg: 'chase', room: k, shots: [] };
    const c = { P, solid: (x, y) => at(Math.floor(x / TS), Math.floor(y / TS)) === T.SOLID, standable: (tx, ty) => at(tx, ty) === T.SOLID || at(tx, ty) === T.ONEWAY,
      debris: (x, y, top) => { const d = { x, y, top, st: 'tell', t: 1.1, ry: top }; log.debris.push(d); return d; }, clearLedge: (x0, x1, row) => log.cleared.push([x0, x1, row]), say: m => log.says.push(m), sound: () => {}, shake: () => {}, dust: () => {} };
    return { R, P, e, c, log, run: (sec, each) => { for (let i = 0; i < Math.round(sec * 60); i++) { chaseRoomStep(e, 1 / 60, c); if (each && each()) return true; } return false; } }; };
  /* 1. a missed firebolt stops on the floor's stone and shakes masonry loose over it - told, on the footing; never more than debMax at once */
  { const r = rig(0), x = (CH.x0 + 15) * TS + 4; r.e.shots.push({ x, y: r.R.floor * TS + 4, vx: 0, vy: 150, kind: 'fire', r: 5, t: 2, free: true }); r.run(1 / 60);
    assert.ok(r.e.shots[0].gone && r.log.debris.length === 1, 'his bolt that hits the stone does not stop or shake nothing loose');
    const d = r.log.debris[0]; assert.ok(Math.abs(d.x - (CH.x0 + 15) * TS - 8) < 1 && d.y === r.R.floor * TS && d.top === r.R.top * TS && d.st === 'tell', 'the stone does not come down told, over where it struck: ' + JSON.stringify(d));
    for (let i = 0; i < 6; i++) { r.e.shots.push({ x: x + i * 20, y: r.R.floor * TS + 4, vx: 0, vy: 150, kind: 'ice', r: 4, t: 2, free: true }); r.run(0.05); }
    assert.ok(r.log.debris.filter(q => q.st !== 'land').length <= FALL4.debMax, 'more stone than debMax hangs at once'); }
  { const r = rig(0), q = { x: (CH.x0 + 15) * TS, y: (r.R.top - 1) * TS, vx: 0, vy: 150, kind: 'fire', r: 5, t: 2 }; r.e.shots.push(q); r.run(1 / 60); assert.ok(!q.gone, 'a bolt born in the vault stone (his staff high under the ceiling) dies at birth'); q.y = r.R.floor * TS - 20; r.run(1 / 60); q.y = r.R.floor * TS + 4; r.run(1 / 60); assert.ok(q.gone, 'out of the stone it was born in, his bolt does not stop on the floor'); }
  { const r = rig(0); r.e.shots.push({ x: (CH.x0 + 10) * TS, y: (r.R.floor - 5) * TS, vx: 0, vy: 150, kind: 'fire', r: 5, t: 2, reflected: true }); r.run(1 / 60); assert.ok(!r.log.debris.length && !r.e.shots[0].gone, 'his struck-back bolt breaks on stone (it must fly home)'); }
  /* ...and stone that falls on him drops him (his own spell's opening) */
  { const r = rig(0); r.e.rfx = { k: 0, t: 0, debT: 0, mine: [{ x: r.e.x, y: r.R.floor * TS, ry: r.e.y - 20, st: 'fall' }], next: 99, drop: null, gone: [] }; r.run(1 / 60);
    assert.equal(r.e.mode, 'crushed', 'his own stone coming down on him does not drop him');
    const c2 = { P: r.P, say: () => {}, callout: () => {}, sound: () => {}, shake: () => {}, dust: () => {}, arm: () => {}, clearRoom: () => {}, setRoom: () => {}, away: () => {} };
    chaseLeg(r.e, 1 / 60, c2); assert.equal(r.e.mode, 'fall', 'crushed, he does not FALL (an opening like his struck-back spell)'); }
  /* 2. stage two: from stage2 s the ledges go, one at a time, each told dropTell s - never the one you stand on */
  { const r = rig(0); r.run(FALL4.stage2 - 0.5); assert.ok(!r.e.rfx.drop && !r.log.cleared.length, 'a ledge goes before stage two');
    const [x0, len, up] = r.R.ledges[0]; r.P.x = (x0 + 1) * TS; r.P.y = (r.R.floor - up) * TS; r.P.ground = true;
    r.run(1); const d = r.e.rfx.drop; assert.ok(d && !(d.row === r.R.floor - up && d.x0 === x0), 'stage two does not start, or picks the ledge you stand on: ' + JSON.stringify(d));
    assert.ok(!r.log.cleared.length && r.log.says.some(m => /LEDGE GIVES/.test(m)), 'the ledge goes untold'); r.run(FALL4.dropTell); assert.equal(r.log.cleared.length, 1, 'the told ledge does not go');
    r.run(FALL4.dropEvery + FALL4.dropTell + 0.2); assert.equal(r.log.cleared.length, 2, 'the ledges do not go one at a time, dropEvery apart'); }
  /* the vault: tower-supports' fall hands it to main.js (c.vault) */
  { const SU = await import('../src/tower-supports.js'), L3 = { ftSupports: L.ftSupports.filter(s => s.vault && s.room === 0).map(s => ({ ...s })) }; SU.supportsReset(L3); const s = L3.ftSupports[0]; let got = null;
    const c = { T, strike: () => ({ l: s.x - 8, r: s.x + 8, t: s.y - 20, b: s.y }), set: () => {}, resolve: () => {}, foes: () => [], hurt: () => {}, say: () => {}, callout: () => {}, sound: () => {}, shake: () => {}, dust: () => {}, burst: () => {}, vault: q => { got = q; } };
    SU.supportsUpdate(L3, { x: s.x - 10, y: s.y, dead: 0 }, 1 / 60, c); c.strike = () => null; for (let i = 0; i < 80; i++) SU.supportsUpdate(L3, { x: s.x - 10, y: s.y, dead: 0 }, 1 / 60, c);
    assert.ok(s.st === 'down' && got === s, 'the vault pillar struck does not come down, told, and hand its vault to the fight'); }
  { const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); assert.ok(src.includes("function chase3Vault(s){") && src.includes("e.mode='crushed';e.modeT=1;number(e.x,e.y-52,'THE VAULT COMES DOWN ON HIM'") && src.includes('vault:s=>chase3Vault(s)'), 'the vault does not come down on him in the game'); }
  /* the floor: at it, HE HOLDS ON - his 'down' is cut short */
  { const r = rig(1); r.e.hp = CC.floorHp(r.e); r.e.mode = 'reflected'; const says = []; const c2 = { P: r.P, say: m => says.push(m), callout: () => {}, sound: () => {}, shake: () => {}, dust: () => {}, arm: () => {}, clearRoom: () => {}, setRoom: () => {}, away: () => {} };
    for (let i = 0; i < 240 && r.e.mode !== 'down'; i++) chaseLeg(r.e, 1 / 60, c2); assert.ok(r.e.mode === 'down' && r.e.modeT <= FALL4.heldDown + 0.01 && says.some(m => /HOLDS ON/.test(m)), 'at the rooms\' floor he still lies open the full time, a gold window that does nothing: ' + r.e.modeT); } }
/* FALLING TOWER 4 (claude/ft4a, Daniel 10-29 #1 A): THE ASCENT - no cut from the rooms to his sky. In Node: boarded in the core, the box you fly in rises up the
   well, the four broken rooms, through the stair's floor (told) and his spiral stair, and out of its broken top into his hall's box (which stands over the spiral
   tower now), never jumping: its bottom only ever rises, a frame at a time, and its sides only widen in the sky; he fights in the well with his fire, ice and hand
   only and flees up ahead after; the stone off the walls is told before it falls; it takes 15-35 s */
{ const CC = await import('../src/archmage-chase.js'), UM = await import('../src/undead-mage.js'), { CH, CORE, ASC, PLUG, CROWN, ascentStep, ascentLeg, ascentBand, coreHang, newAscent } = CC, H = L.arena.hallArena;
  assert.equal(ASC.crownTop, TOWER.SKY, 'the spiral tower\'s roof is not cut up to the sky rows');
  assert.ok(H.x0 <= CH.x0 * TS && H.x1 >= (CH.x1 + 1) * TS && H.floor < SPIRAL.top * TS, 'his hall does not stand over the spiral tower (the ascent would have to jump sideways into it)');
  for (const [x0, x1, y0, y1] of [PLUG(), CROWN()]) { assert.ok(x0 === CH.x0 && x1 === CH.x1 && y1 >= y0, 'the ascent cuts outside the well'); for (let y = y0; y <= y1; y++) assert.equal(at(CH.x0 + 5, y), T.SOLID, 'the stone the ascent breaks is not there to break at row ' + y); }
  const q = coreHang(); assert.ok(q.y > CORE.top * TS && q.y < CORE.bot * TS && q.x > CH.x0 * TS && q.x < (CH.x1 + 1) * TS, 'he does not wait IN the core');
  const A = { ...L.arena }, P = { x: CORE.carpet.x, y: CORE.carpet.y, dead: 0 }, cleared = [], calls = [], locks = []; let hall = 0, hurt = 0;
  const e = { t: 'undeadmage', alive: true, hp: 2000, hp0: 2800, maxHp: 2800, leg: 'ascent', mode: 'away', modeT: 99, x: q.x, y: q.y, face: -1, anim: 0, shots: [] };
  const c = { P, rnd: () => 0.5, clear: r => cleared.push(r), say: () => {}, callout: m => calls.push(m), sound: () => {}, shake: () => {}, dust: () => {}, hurt: () => hurt++, lock: (a, b) => locks.push([a, b]), toHall: () => hall++ };
  let t = 0, last = null, phases = [], tellsOk = true; const seenRocks = new Set();
  for (; t < 60 && !hall; t += 1 / 60) { const ph = ascentStep(e, A, H, 1 / 60, c); if (phases[phases.length - 1] !== ph) phases.push(ph);
    P.y = Math.max(A.y0 + 24, Math.min(A.floor - 4, P.y)); P.x = Math.max(A.x0 + 12, Math.min(A.x1 - 12, P.x));   /* the carpet held in its box, as carpetBox holds it */
    if (last) { assert.ok(A.floor <= last.floor + 1e-6 && last.floor - A.floor <= ASC.spiral / 60 + 1e-6, 'the ascent\'s box jumps or goes back down at ' + t.toFixed(2) + ' s');
      assert.ok(A.x0 <= last.x0 + 1e-6 && A.x1 >= last.x1 - 1e-6, 'the box narrows at ' + t.toFixed(2)); }
    if (ph === 'well' || ph === 'plug' || ph === 'spiral') assert.ok(A.x0 === CH.x0 * TS && A.x1 === (CH.x1 + 1) * TS, 'out of the well before the sky');
    for (const r of (e.asc && e.asc.rocks) || []) { if (r.st === 'tell') seenRocks.add(r); else if (r.st === 'fall' && !seenRocks.has(r)) tellsOk = false; }
    if (e.asc && e.asc.ph === 'well' && e.mode === 'away') ascentLeg(e, 1 / 60, { P, A });
    last = { ...A }; }
  assert.ok(hall === 1, 'the ascent never reaches his hall');
  assert.deepEqual(phases, ['well', 'plug', 'spiral', 'sky', 'hall'], 'the ascent is not well, the stair\'s floor, the spiral, the sky: ' + phases);
  assert.ok(t >= 15 && t <= 35, 'the ascent takes ' + t.toFixed(1) + ' s (15-35)');
  assert.ok(cleared.length === 2 && JSON.stringify(cleared) === JSON.stringify([PLUG(), CROWN()]), 'the stair\'s floor and the spiral\'s top are not broken through, in that order');
  assert.ok(calls.some(m => /CRACKS/.test(m)), 'the stair\'s floor goes untold');
  assert.ok(Math.abs(A.x0 - H.x0) < 1 && Math.abs(A.x1 - H.x1) < 1 && A.floor <= H.floor - 26, 'the ascent does not end in his hall\'s box, over its fire: ' + [A.x0, A.x1, A.floor]);
  assert.ok(seenRocks.size >= 3 && tellsOk, 'the stone off the walls is not told before it falls (or never falls): ' + seenRocks.size);
  /* him: in the well his fire, ice and hand at their fight tells; out of it he flees, casting nothing */
  { const e2 = { ...e, leg: 'ascent', asc: newAscent(), mode: 'away', modeT: 99, anim: 0, shots: [], rings: [], clouds: [], turn: 0, blinkT: 99 }, A2 = { ...A }; Object.assign(A2, CC.ascentBox(e2.asc.y, H, 0)); const tells = new Set();
    const cc = { P: { x: (CH.x0 + 6) * TS, y: A2.floor - 30, dead: 0 }, A: A2, box: ascentBand(A2), rnd: () => 0.5, hit: () => {}, venom: () => {}, say: () => {}, sound: () => {}, dodging: () => false, carry: () => {}, strike: () => null, chase: (m, d) => ascentLeg(m, d, { P: cc.P, A: A2 }) };
    for (let i = 0; i < 60 * 14; i++) { UM.updateUndeadMage(e2, 1 / 60, cc); if (/Tell$/.test(e2.mode)) tells.add(e2.mode.replace('Tell', '')); }
    assert.ok(tells.size >= 2 && [...tells].every(k => ASC.order.includes(k)), 'in the well he casts more than his fire, ice and hand (or nothing): ' + [...tells]);
    e2.asc.ph = 'spiral'; e2.shots = []; for (let i = 0; i < 60 * 3; i++) UM.updateUndeadMage(e2, 1 / 60, cc); assert.ok(e2.mode === 'flee' && !e2.shots.length, 'up his stair he casts, rather than flee ahead: ' + e2.mode); } }
// ---- PAGE ----
if (process.env.TOWER_CHASE_NODE) { console.log('tower-chase: node part OK (TOWER_CHASE_NODE: page part skipped)'); process.exit(0); }
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
   /* (claude/fallingtower3) THE TOP IS HIS RING NOW: the stair bot hands back as it comes out in THE CHASE's first room; a few steps on and the fight starts there */
   BK.sim(30);out.inChase=BK.P.y>${L.chase3.rooms[0].top * TS}&&BK.P.y<=${L.chase3.rooms[0].floor * TS}+2;for(let i=0;i<180&&!BK.bossActive;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;BK.sim(10);
   {const A=BK.L.arena,b=BK.enemies().find(e=>e.t==='undeadmage');out.fight=!!BK.bossActive;out.chaseArena=!!A.chase;out.inArena=BK.P.x>A.x0&&BK.P.x<A.x1&&BK.P.y>A.y0&&BK.P.y<=A.floor+2;out.bossIn=b&&b.y>A.y0&&b.y<A.floor;out.chaseGone=!m.alive;out.darkAfter=D().phase;
     /* HE FALLS when his own spell staggers him, lies open on the floor, and sinks through it; its pillar lights, a blow brings the floor down, and he wakes in the room under */
     for(let i=0;i<240&&b.mode==='wake';i++)BK.sim(1);b.mode='reflected';b.modeT=2;BK.sim(2);out.fell=b.mode;for(let i=0;i<180&&b.mode!=='down';i++)BK.sim(1);out.down=b.mode;out.downOpen=b.open>0;
     const h0=b.hp;b.flash=0;BKT.hurtEnemy(b,20,b.x-10,false);out.downDmg=h0-b.hp;
     for(let i=0;i<600&&b.mode!=='below';i++)BK.sim(1);const s=BK.L.ftSupports.find(q=>q.room===0&&q.kind==='floor');out.armed=!!(s&&s.armed);
     BK.tp(Math.floor(s.x/16)-1,Math.round(s.y/16)-1);BK.sim(5);BK.P.face=1;BK.press('atk');for(let i=0;i<120;i++)BK.sim(1);out.pillar=s.st;for(let i=0;i<240&&b.mode!=='wake';i++)BK.sim(1);out.room1=[b.mode,b.room,Math.round(BK.P.y/16)];}
   out.tuneFight=AU.music.want;out.musicGap=BK.bossMusicT;
   /* 2. EVERY HERO GETS UP IT UNDER THE SCROLL: no god mode, health held up (his spells counted, not fatal) - the dark must never catch it */
   for(const h of ${JSON.stringify(HEROES)}){boot(h,false);through();const m0=chase();const q=LB.chaseClimb(BK,m0,{secs:150,refill:true});out.heroes[h]={ring:BK.P.y>${L.chase3.rooms[0].top * TS},secs:Math.round(q.t/60),taken:Math.round(q.taken),died:q.died,dark:D().hits,returned:m0.returned||0,stuns:m0.stuns||0};}   /* (claude/ft4a: and the shots it struck back, and his stuns) */   /* (fallingtower3: up to his ring into the chase - it was the carpet) */
   /* (claude/fallingtower3) THE LAB PLAYS THE CHASE: the bossLab's chase hands (health held up) go down all four rooms, onto his carpet and on into his hall */
   {const seen=new Set(),legs=new Set(),asc={camJump:0,pJump:0,t:0,hallWake:false,hallBox:null,lastCam:null,lastP:null,inHall:0};const o=await BK.bossLab({bosses:['fallingtower'],heroes:['warden'],healthMode:'refill',maxSecs:240,onFrame:({boss,P})=>{seen.add(boss.room);legs.add(boss.leg);
      /* (claude/ft4a) THE ASCENT, in the page: from the board to two seconds into his hall the camera and the hero never jump (no cut), and he is never in a 'wake' freeze in his hall */
      const c=BK.cam,cam=c?[c[0],c[1]]:null,watch=boss.leg==='ascent'||(boss.leg==='hall'&&asc.inHall<120);if(boss.leg==='hall')asc.inHall++;
      if(watch&&cam&&asc.lastCam){asc.camJump=Math.max(asc.camJump,Math.hypot(cam[0]-asc.lastCam[0],cam[1]-asc.lastCam[1]));if(boss.leg==='ascent'||asc.inHall<=1)asc.pJump=Math.max(asc.pJump,Math.hypot(P.x-asc.lastP[0],P.y-asc.lastP[1]));   /* (the hero: in the ascent and across into the hall - his hall's ring carries are its own) */}
      if(boss.leg==='ascent')asc.t++;if(boss.leg==='hall'&&asc.inHall<120&&boss.mode==='wake')asc.hallWake=true;if(boss.leg==='hall'&&!asc.hallBox){const A=BK.L.arena;asc.hallBox=[A.x0,A.x1];}
      asc.lastCam=cam;asc.lastP=[P.x,P.y];}});delete asc.lastCam;delete asc.lastP;out.lab={rooms:[...seen].sort(),legs:[...legs],outcome:o.rows[0]&&(o.rows[0].outcome||o.rows[0].skipped),asc};}
   /* 3. STAND ON THE STAIR AND THE DARK HURTS YOU AND THROWS YOU UP - again and again, until it has killed you: you wake at the foot, the dark back under the floor, him over the first landing (archmage2) */
   boot('knight',false);through();for(let i=0;i<90&&BK.P.x<${checks[0].x * TS + 16};i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;out.lit=BK.P.x>=${checks[0].x * TS + 8};   /* (out of the ring and past the foot's shrine, as the way to the first step goes: to the RIGHT since archmage3) */
   BK.tp(${FLIGHTS[0].steps[1][0] + 1},${FLIGHTS[0].steps[1][2] - 1});BK.P.maxHp=BK.P.hp=400;/* (batch128: 200 -> 400 - fallingtower3 marks hit 60, so two marks plus one dark contact (60) left 20 hp and the cast clock, not the dark, decided if a second contact was ever thrown) (batch71) a stander with a bigger bar: archmage3/4 made his death mark 38, and three marks plus one dark contact were a whole 100-hp bar, so a mark landing before the second contact killed him on it and the test passed or failed on the cast clock. Twice the health, and it is the dark that has to go on hurting and throwing until it kills */ let died=-1,h0=D().hits;out.thrown=[];for(let i=0;i<60*90&&died<0;i++){const y0=BK.P.y;BK.sim(1);if(D().hits>h0){h0=D().hits;if(!(BK.P.dead>0))out.thrown.push([Math.round(y0),Math.round(BK.P.y),i]);}if(BK.P.dead>0)died=i;}
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
assert.ok(r.inChase && r.fight && r.chaseArena && r.inArena && r.bossIn && r.chaseGone, '(fallingtower3) the climb with the game\'s own jump does not come through his ring into the chase, or the fight does not start in its first room: ' + JSON.stringify(r));
assert.ok(r.fell === 'fall' && r.down === 'down' && r.downOpen && r.downDmg >= 30, '(fallingtower3) staggered, he does not fall to the floor open (x2): ' + JSON.stringify([r.fell, r.down, r.downOpen, r.downDmg]));
assert.ok(r.armed && r.pillar === 'down' && r.room1[0] === 'wake' && r.room1[1] === 1, '(fallingtower3) through the floor, its pillar is not lit, or a blow does not bring the floor down and him awake in the room under: ' + JSON.stringify([r.armed, r.pillar, r.room1]));
assert.ok(r.lab && [0, 1, 2, 3].every(k => r.lab.rooms.includes(k)) && r.lab.legs.includes('hall'), '(fallingtower3) the lab\'s chase hands do not play him down the four rooms and into his hall (a fresh page-level hero, health held up: how the fight ends is boss-rates\' to measure): ' + JSON.stringify(r.lab));
/* (claude/ft4a) THE ASCENT in the page: the lab's fight goes chase -> ascent -> hall with no camera cut (the FT3 cut was 2,923 px in one frame), the hero carried, not snapped; his hall over the spiral tower; no 'wake' freeze in it */
{ const a = r.lab.asc; assert.ok(r.lab.legs.includes('ascent') && a.t > 60 * 12 && a.camJump < 40 && a.pJump < 100 &&   /* (a ring's carry is a few tiles; the FT3 cut was 2,923 px) */  !a.hallWake && a.hallBox && a.hallBox[0] <= 80 * TS && a.hallBox[1] >= 106 * TS, '(ft4a) the climb out of the core into his hall is not one continuous ascent: ' + JSON.stringify(a)); }
assert.ok(r.done === 'done' && ['idle', 'done'].includes(r.darkAfter), 'the dark does not stop at the top floor, or follows you through his ring into the chase: '   /* (fallingtower3: it stays stopped - 'done' - through his ring; the carpet's board used to reset it to 'idle') */ + [r.done, r.darkAfter]);
assert.ok(r.casts.length >= 6 && r.casts.some(c => c.startsWith('fireTell')) && r.casts.some(c => c.startsWith('markTell')), 'he hardly casts on the way up: ' + r.casts);
assert.ok(r.casts.every(c => c.startsWith('markTell') ? c.endsWith('!!') : c.endsWith('!') && !c.endsWith('!!')), 'a spell told with the wrong mark (or none): ' + r.casts);
assert.equal(r.offCast, 0, 'a spell begun with him off the screen');
const riseRows = (sp.from - sp.end);   /* px from where the dark starts to where it stops */
for (const h of HEROES) { const q = r.heroes[h]; assert.ok(q && q.ring && q.died === 0, h + ' does not get up the stair under the scroll without the dark catching it: ' + JSON.stringify(q)); }
/* (claude/ft4a) THROW IT BACK: the stair bot has the fight's strike-back hand, and every hero returns at least one of his shots on the climb (the rule is the hero's own blow box) */
for (const h of HEROES) assert.ok(r.heroes[h].returned >= 1, h + ' strikes none of his shots back on the stair: ' + JSON.stringify(r.heroes[h]));
assert.ok(HEROES.reduce((n, h) => n + r.heroes[h].stuns, 0) >= HEROES.length, 'his stair stuns are rare: ' + HEROES.map(h => h + ' ' + r.heroes[h].stuns));
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
