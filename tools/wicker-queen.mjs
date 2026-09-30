// tools/wicker-queen.mjs - THE WICKER QUEEN, the Harvest Fair's boss (claude/fair3, L3), ON HER CAROUSEL (claude/fairboss). src/wicker-queen.js is the fight,
// src/wicker-carousel.js the ride, docs/briefs/harvest-fair.md the brief.
// PURE (src/wicker-queen.js and src/wicker-carousel.js, no page):
//   - FROZEN WHEN FACED: over a long fuzz with the hero turning at random, her FEET never move on a frame a hero looks at her; CO-OP any hero facing her
//     freezes her, and she creeps only when every hero has his back to her. THE RIDE carries her all the same, frozen or not, at its speed
//   - THE RIBBONS TURN WHILE SHE IS FROZEN: a hero who never takes his eyes off her is still lashed, low and high, and the floor still burns (but she never
//     throws her sickle at a hero who is looking at her)
//   - EVERY ATTACK IS TOLD, with the right mark, answer and height: the reap (!!, dodge = look, low), the low lash (!!, jump, low), the high lash (!!, duck,
//     high), THE FLOOR BURNS (!!, jump - up on a horse, low), HER SICKLE thrown (!!, duck, high), the crowning (no mark); each blow comes only after its
//     own windup has run its full told time. THE READ BETWEEN UP AND DOWN: the floor blows (low lash, burning floor) miss a hero on any horse and in a
//     jump, and catch him on the boards; the high blows (high lash, thrown sickle) catch a rider on any horse and a standing hero, and miss a ducked one
//   - HER SICKLE is thrown only at a turned back from across the ride (never near, never at a hero looking at her); it flies out and comes BACK to her
//   - THE FIRE, ONLY BY FREEZING HER ON THE EMBERS: lured against the ride and frozen on them she catches and burns open (a blow worth more); UPSTREAM of
//     the fire, held in the look, THE RIDE BRINGS HER ONTO IT (the carousel's half of the opening); after a burn she is flung off the ride's way and the
//     embers are banked; crossing them unseen, frozen short of them, left alone for a minute, or frozen on them banked, opens nothing
//   - PHASE 2 (full dark): the look freezes her only NEAR the hero; PHASE 3 (alight): faster, and the floor burns more often; every phase QUICKENS THE
//     RIDE, told first (RING.warn), and changes the horses' bob
//   - THE HORSES: always inside a jump (their saddles 16-40 px up; a jump rises 51), above the low ribbon, one never far from any point of the boards, the
//     front run the platforms and the back not
//   - THE CROWNING never has more than two of hers alive
// THE LEVEL: the green is her carousel (the arena, its ten horses, the firebox by the centre column, her UPSTREAM of it: the first burn is the ride's), the door checkpoint stands
//   before it, the elite still guards the door, her relic (the fair's one relic slot) waits for her death, and the gate ends the level after it
// IN THE PAGE: the fight wakes past the door and the ride starts; faced her feet do not move (the ride carries her) and co-op one facing holds her; the
//   boards carry a hero; a hero jumps onto a horse and it carries him up, down and along; her lash hurts a standing hero and passes over a jumping one or a
//   rider (low), passes under a ducked one and hurts a rider (high); the burning floor hurts a hero on the boards and not a rider; her sickle hurts a
//   standing hero and not a ducked one; the reap from behind hurts; lured onto the embers she burns and a blow bites harder; held upstream the ride brings
//   her onto them; phase two darkens the green, only a near look holds her, and the ride quickens (told); phase three quickens it again; the crowning keeps
//   two at most; her death stops the ride, drops the relic, the gate opens and walking to it clears the level.
//   node tools/wicker-queen.mjs        (PORT from tools/ports.mjs)
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import * as W from '../src/wicker-queen.js';
import * as C from '../src/wicker-carousel.js';
import { MARK, ANSWER, HEIGHT } from '../src/marks.js';
import { CALL_LINES } from '../src/hint-lines.js';
import { LEVELS } from '../src/level.js';

const bad = [], ok = (c, m) => { if (!c) bad.push(m); };
const DT = 1 / 60, FLOOR = 448;
const A = { x0: 9968, x1: 10672, floor: FLOOR }, EMB = W.embersOf(10360);
const hero = (x, face, o = {}) => ({ x, y: FLOOR, face, alive: true, ...o });
const QUIETCD = { lashCd: 1e9, crownCd: 1e9, floorCd: 1e9, throwCd: 1e9 };
/* a queen and a world. The host moves her by vx and, on a ride (o.ride px/s), carries her the ride's way; `log` counts what the world was asked to do */
function rig(o = {}) {
  const e = W.newWickerQueen({ t: 'wickerqueen', x: o.x ?? 10600, y: FLOOR, hp: o.hp ?? W.WQ.hp, maxHp: W.WQ.hp, alive: true, face: -1 });
  e.mode = o.mode || 'still'; for (const k of ['lashCd', 'crownCd', 'floorCd', 'throwCd']) if (o[k] !== undefined) e[k] = o[k];
  const log = { hits: [], lash: [], sickle: [], summons: 0, adds: 0, says: [] }, ride = o.ride || 0;
  const c = { heroes: o.heroes || [hero(10300, -1)], A, embers: o.embers === undefined ? EMB : o.embers, ringDir: ride ? 1 : 0, canStep: () => true,
    number: (x, y, t) => log.says.push(t), sound: () => {}, hit: (box, d, name) => log.hits.push({ box, d, name }), lash: (kind, r0, r1) => log.lash.push({ kind, r0, r1 }),
    sickle: (x0, x1, pass) => log.sickle.push({ x0, x1, pass }), summon: n => { log.summons += n; log.adds = Math.min(99, log.adds + n); }, adds: () => log.adds };
  const step = () => { const ev = W.updateWickerQueen(e, DT, c); e.x = Math.max(A.x0 + 16, Math.min(A.x1 - 16, e.x + (e.vx + (e.mode === 'rise' || e.mode === 'creep' ? 0 : ride)) * DT)); return ev; };
  return { e, c, log, step };
}

// ---- FROZEN WHEN FACED (fuzz), THE RIDE CARRIES HER ALL THE SAME, and CO-OP ----
{ let movedSeen = 0, moves = 0, frames = 0; const r = rig({ ...QUIETCD, embers: null });
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60 * 90; i++) { if (rnd() < 0.03) r.c.heroes[0].face *= -1; if (rnd() < 0.01) r.c.heroes[0].x = 10000 + rnd() * 600;
    const x0 = r.e.x; r.step(); frames++; const seen = r.e.seen; if (r.e.x !== x0) { moves++; if (seen && r.e.mode !== 'rise') movedSeen++; }
    if (r.e.mode === 'sickle' || r.e.mode === 'recover') { r.e.mode = 'still'; r.e.x = 10600; } }
  ok(moves > 200, 'the fuzz never let her move (' + moves + ' moving frames): the test is not testing anything');
  ok(movedSeen === 0, 'her feet moved on ' + movedSeen + ' frames a hero was looking at her (of ' + frames + ')');
  const ride = rig({ ...QUIETCD, embers: null, ride: 20, x: 10100, heroes: [hero(10000, 1)] }); let feet = 0; const x0 = ride.e.x;
  for (let i = 0; i < 120; i++) { ride.step(); feet = Math.max(feet, Math.abs(ride.e.vx)); }
  ok(feet === 0 && Math.abs(ride.e.x - x0 - 40) < 1, 'THE RIDE: looked at for two seconds on a 20 px/s ride her feet moved (' + feet + ') or the ride did not carry her 40 px: ' + (ride.e.x - x0));
  const one = rig({ ...QUIETCD, heroes: [hero(10300, -1), hero(10400, 1)] }); const x1 = one.e.x; for (let i = 0; i < 120; i++) one.step();
  ok(one.e.x === x1 && one.e.mode === 'still', 'co-op: one hero facing her did not hold her: moved ' + (x1 - one.e.x));
  const both = rig({ ...QUIETCD, heroes: [hero(10300, -1), hero(10400, -1)] }); const x2 = both.e.x; for (let i = 0; i < 60; i++) both.step();
  ok(both.e.x < x2 - 20 && both.e.mode === 'creep', 'co-op: with both backs turned she did not creep: ' + (x2 - both.e.x) + ' px, ' + both.e.mode);
  const dead = rig({ ...QUIETCD, heroes: [hero(10300, -1), hero(10400, 1, { alive: false })] }); const x3 = dead.e.x; for (let i = 0; i < 60; i++) dead.step();
  ok(dead.e.x < x3 - 20, 'co-op: a dead partner facing her held her'); }

// ---- THE RIBBONS AND THE FLOOR WHILE SHE IS FROZEN; every attack told, with its mark, answer and height ----
{ const r = rig({ heroes: [hero(10300, 1)], crownCd: 1e9, embers: null }); const kinds = new Set(); let tellFrames = {}, cur = null, blowAfterShort = 0, moved = 0, floors = 0;
  for (let i = 0; i < 60 * 30; i++) { const x0 = r.e.x; const ev = r.step(); if (r.e.x !== x0) moved++;
    if (r.e.mode.endsWith('Tell')) { tellFrames[r.e.mode] = (tellFrames[r.e.mode] || 0) + 1; cur = r.e.mode; }
    for (const v of ev) { if (v.t === 'lash') { kinds.add(v.kind); const want = v.kind === 'low' ? 'lashLowTell' : 'lashHighTell'; if (cur !== want || (tellFrames[want] || 0) < W.WQ.lashTell * 60 - 1) blowAfterShort++; tellFrames[want] = 0; }
      if (v.t === 'floor') { floors++; if (cur !== 'floorTell' || (tellFrames.floorTell || 0) < W.WQ.floorTell * 60 - 1) blowAfterShort++; tellFrames.floorTell = 0; } } }
  ok(moved === 0, 'she moved while a hero looked at her the whole time (' + moved + ' frames)');
  ok(kinds.has('low') && kinds.has('high'), 'the ribbons did not turn while she was frozen, low and high: ' + [...kinds]);
  ok(floors >= 2 && r.e.n.floor >= 2, 'the floor did not burn while she was frozen (' + floors + ' in 30 s)');
  ok(r.e.n.thrown === 0 && !r.log.sickle.length, 'she threw her sickle at a hero who was looking at her (' + r.e.n.thrown + ')');
  ok(r.log.lash.length > 20 && r.log.lash.some(l => l.r1 >= W.WQ.lashReach - 1), 'the lash never swept the green');
  ok(blowAfterShort === 0, blowAfterShort + ' lash(es) or burning floor(s) came without their full told windup'); }
{ const r = rig({ heroes: [hero(10560, -1)], ...QUIETCD, embers: null }); let glowFrames = 0, hitAt = null;   // the reap, from behind
  for (let i = 0; i < 240 && hitAt === null; i++) { r.step(); if (r.e.mode === 'sickleTell') glowFrames++; if (r.log.hits.length) hitAt = i; }
  ok(hitAt !== null && r.log.hits[0].name === 'THE SICKLE' && r.log.hits[0].d === W.WQ.dmg.sickle, 'the reap never came from behind: ' + JSON.stringify(r.log.hits));
  ok(glowFrames >= W.WQ.glow * 60 - 1, 'the reap came after only ' + glowFrames + ' frames of its red glow');
  const q = rig({ heroes: [hero(10560, -1)], ...QUIETCD, embers: null }); let glowed = false;
  for (let i = 0; i < 240; i++) { q.step(); if (q.e.mode === 'sickleTell' && !glowed) { glowed = true; q.c.heroes[0].face = 1; } }
  ok(glowed && q.log.hits.length === 0 && q.e.mode === 'still', 'a look during the glow did not cancel the reap: ' + JSON.stringify({ glowed, hits: q.log.hits.length, mode: q.e.mode })); }
{ // HER SICKLE, THROWN: at a turned back from across the ride, told in full, out past him and back to her hand; a look during the tell does not stop it (she is not walking)
  const r = rig({ heroes: [hero(10300, -1)], ...QUIETCD, throwCd: 0, embers: null }); let tellF = 0, thrownAt = null, back = null, h = r.c.heroes[0];
  for (let i = 0; i < 60 * 6; i++) { const ev = r.step(); if (r.e.mode === 'throwTell') { tellF++; if (tellF === 5) h.face = 1; }
    for (const v of ev) if (v.t === 'throw') thrownAt = i; if (thrownAt !== null && back === null && !r.e.sk && i > thrownAt) back = i; }
  const crossed = p => r.log.sickle.some(s => s.pass === p && s.x0 <= 10300 && s.x1 >= 10300);
  ok(thrownAt !== null && tellF >= W.WQ.throwTell * 60 - 1, 'HER SICKLE: not thrown, or thrown after only ' + tellF + ' frames of its tell (a look during the tell must not stop it)');
  ok(crossed(2) && crossed(3) && back !== null, 'HER SICKLE did not fly out past the hero and back to her hand: ' + JSON.stringify({ out: crossed(2), back: crossed(3), home: back }));
  /* nothing new while it is in the air: a LOW blow (the floor, the low lash) told under a flying sickle would have no answer */
  const busy = rig({ heroes: [hero(10300, -1)], crownCd: 1e9, throwCd: 0, lashCd: 1.2, floorCd: 1.2, embers: null }); let under = 0, flew = 0;
  for (let i = 0; i < 60 * 8; i++) { const ev = busy.step(), had = !!busy.e.sk; if (had) flew++; for (const v of ev) if (had && (v.t === 'lashTell' || v.t === 'floorTell' || v.t === 'throwTell')) under++; }
  ok(flew > 60 && under === 0, 'a blow was told while her sickle was in the air (' + under + ', over ' + flew + ' frames of flight)');
  const near = rig({ heroes: [hero(10540, -1)], ...QUIETCD, throwCd: 0, embers: null }); for (let i = 0; i < 60; i++) near.step();
  ok(near.e.n.thrown === 0, 'she threw her sickle at a hero ' + 60 + ' px away (it is thrown only from across the ride; near, she walks and reaps)'); }
{ ok(MARK['wickerqueen|sickleTell'] === '!!' && ANSWER['wickerqueen|sickleTell'] === 'dodge' && HEIGHT['wickerqueen|sickleTell'] === 'low', 'THE REAP is not !! / dodge (the look) / low in src/marks.js');
  ok(MARK['wickerqueen|lashLowTell'] === '!!' && ANSWER['wickerqueen|lashLowTell'] === 'jump' && HEIGHT['wickerqueen|lashLowTell'] === 'low', 'THE LOW LASH is not !! / jump / low in src/marks.js');
  ok(MARK['wickerqueen|lashHighTell'] === '!!' && ANSWER['wickerqueen|lashHighTell'] === 'duck' && HEIGHT['wickerqueen|lashHighTell'] === 'high', 'THE HIGH LASH is not !! / duck / high in src/marks.js');
  ok(MARK['wickerqueen|floorTell'] === '!!' && ANSWER['wickerqueen|floorTell'] === 'jump' && HEIGHT['wickerqueen|floorTell'] === 'low', 'THE FLOOR BURNS is not !! / jump (up on a horse) / low in src/marks.js');
  ok(MARK['wickerqueen|throwTell'] === '!!' && ANSWER['wickerqueen|throwTell'] === 'duck' && HEIGHT['wickerqueen|throwTell'] === 'high', 'HER SICKLE (thrown) is not !! / duck / high in src/marks.js');
  ok(MARK['wickerqueen|crownTell'] === '' && !ANSWER['wickerqueen|crownTell'], 'THE CROWNING wears a mark (it throws no blow)');
  ok(W.WQ_TELLS.every(m => m in { sickleTell: 1, lashLowTell: 1, lashHighTell: 1, floorTell: 1, throwTell: 1, crownTell: 1 }) && W.WQ_TELLS.length === 6, 'WQ_TELLS is not her six windups');
  /* THE READ BETWEEN UP AND DOWN, in hurt boxes: a hero stands 14, ducks 8; a rider stands on a saddle 16-40 px up; a jump puts his feet 18+ up */
  const stand = { t: FLOOR - 14, b: FLOOR }, duck = { t: FLOOR - 8, b: FLOOR }, jump = { t: FLOOR - 40, b: FLOOR - 18 };
  const riders = [C.RING.lo, (C.RING.lo + C.RING.hi) / 2, C.RING.hi].map(s => ({ t: FLOOR - s - 14, b: FLOOR - s }));
  ok(W.lashCatches('low', FLOOR, stand) && W.lashCatches('low', FLOOR, duck) && !W.lashCatches('low', FLOOR, jump) && riders.every(b => !W.lashCatches('low', FLOOR, b)), 'the LOW ribbon: catches a hero on the boards, misses a jumping one and every rider');
  ok(W.lashCatches('high', FLOOR, stand) && !W.lashCatches('high', FLOOR, duck) && riders.every(b => W.lashCatches('high', FLOOR, b)), 'the HIGH ribbon: catches a standing hero and every rider, misses a ducked one');
  ok(W.sickleCatches(FLOOR, stand) && !W.sickleCatches(FLOOR, duck) && riders.every(b => W.sickleCatches(FLOOR, b)), 'HER SICKLE: catches a standing hero and every rider, misses a ducked one');
  ok(W.floorCatches(FLOOR, FLOOR, false) && !W.floorCatches(FLOOR, FLOOR - C.RING.lo, true) && !W.floorCatches(FLOOR, FLOOR - 20, false), 'THE FLOOR BURNS: a hero on the boards, not a rider, not a hero in the air');
  for (const l of ['HIGH: DUCK IT', 'LOW: JUMP IT', 'THE FLOOR BURNS: RIDE A HORSE', 'HER SICKLE FLIES: DUCK', 'SHE BURNS: CUT HER', 'THE RIDE BRINGS HER TO THE FIRE', 'LEAD HER ONTO THE FIRE, THEN FACE HER', 'FULL DARK: THE RIDE QUICKENS', 'SHE IS ALIGHT: THE RIDE QUICKENS'])
    ok(CALL_LINES.has(l), 'her teaching line "' + l + '" is not in src/hint-lines.js (number() would drop it: the archfix lesson)');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), wu = main.split('\n').find(l => l.startsWith('const windingUp ='));
  ok(/e\.t === 'wickerqueen' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(wu), 'her tells are not in windingUp() (rule A2: they would wind up in silence)'); }

// ---- THE FIRE: the only opening, and only by freezing her ON the embers ----
const lure = (turnAt, o = {}) => { const r = rig({ ...QUIETCD, ...o }); const h = r.c.heroes[0]; let turned = false, open = 0, modes = new Set();
  for (let i = 0; i < 60 * 12; i++) { if (!turned && turnAt(r.e)) { h.face = 1; turned = true; } r.step(); modes.add(r.e.mode); open = Math.max(open, r.e.open || 0); if (r.e.mode === 'burn') break; }
  return { r, modes, open, x: r.e.x }; };
{ const on = lure(e => W.onEmbers(e.x, EMB) && e.x < EMB.mid);
  ok(on.modes.has('catch') && on.r.e.mode === 'burn' && on.open > 2.5, 'lured across and frozen on the embers she did not burn open: ' + JSON.stringify({ modes: [...on.modes], open: on.open }));
  ok(W.wqTake(on.r.e) === W.WQ.burnMul && W.wqTake({ mode: 'still' }) === W.WQ.ward && W.WQ.burnMul / W.WQ.ward > 5, 'a blow in the burn is not worth far more than against the standing wicker');
  const early = lure(e => e.x < EMB.x1 + 30 && !W.onEmbers(e.x, EMB));   // turned while she is still short of the embers: frozen off them
  for (let i = 0; i < 120; i++) early.r.step();
  ok(!early.modes.has('catch') && early.r.e.mode === 'still', 'frozen SHORT of the embers she caught anyway: ' + [...early.modes]);
  const unseen = rig({ ...QUIETCD, heroes: [hero(10200, -1)] }); const um = new Set(); for (let i = 0; i < 60 * 8; i++) { unseen.step(); um.add(unseen.e.mode); if (unseen.e.mode === 'sickleTell') break; }
  ok(unseen.e.x < EMB.x0 && !um.has('catch') && !um.has('burn'), 'crossing the embers UNSEEN opened her: ' + [...um]);
  const alone = rig({ heroes: [hero(10300, 1)], embers: null }); let op = 0; for (let i = 0; i < 60 * 60; i++) { alone.step(); op = Math.max(op, alone.e.open || 0); if (alone.e.mode === 'sickle') alone.e.mode = 'still'; }
  ok(op === 0 && !alone.e.n.burn, 'A11: left to her own attacks for a minute she opened by herself: ' + op);
  const r = on.r; for (let i = 0; i < 60 * 5 && r.e.mode !== 'still'; i++) r.step();
  ok(r.e.bank > 0 && !W.onEmbers(r.e.x, EMB), 'after the burn she was not flung off the embers, or they were not banked: ' + JSON.stringify({ x: r.e.x, bank: r.e.bank }));
  r.e.x = EMB.mid; r.c.heroes[0].face = 1; r.c.heroes[0].x = EMB.mid - 150; for (let i = 0; i < 30; i++) r.step();
  ok(r.e.mode !== 'catch' && r.e.mode !== 'burn', 'frozen on BANKED embers she caught again at once');
  // ON THE RIDE: lured AGAINST it (she walks to you across the fire) she still burns; UPSTREAM, held in the look, THE RIDE BRINGS HER ONTO IT
  const against = lure(e => W.onEmbers(e.x, EMB) && e.x < EMB.mid, { ride: 20, x: EMB.x1 + 70, heroes: [hero(EMB.x0 - 60, -1)] });
  ok(against.r.e.mode === 'burn', 'on the ride, lured against it across the fire and frozen on it she did not burn: ' + JSON.stringify({ modes: [...against.modes], x: Math.round(against.x) }));
  const brought = rig({ ...QUIETCD, ride: 20, x: EMB.x0 - 60, heroes: [hero(EMB.x1 + 90, -1)] }); let feet = 0;
  for (let i = 0; i < 60 * 8 && brought.e.mode !== 'burn'; i++) { brought.step(); if (brought.e.mode !== 'rise') feet = Math.max(feet, Math.abs(brought.e.vx)); }
  ok(brought.e.mode === 'burn' && feet === 0, 'held in the look UPSTREAM of the fire, the ride did not bring her onto it (or her own feet did): ' + JSON.stringify({ mode: brought.e.mode, feet, x: Math.round(brought.e.x) }));
  for (let i = 0; i < 60 * 5 && brought.e.mode !== 'still'; i++) brought.step();
  ok(brought.e.x > EMB.x1 && brought.e.bank > 0, 'on the ride, after the burn she was not flung off the fire the RIDE\'S way: ' + Math.round(brought.e.x - EMB.x1)); }

// ---- PHASE 2: the look holds her only near; PHASE 3: faster, and the floor burns more often ----
{ const far = rig({ hp: W.WQ.hp * 0.6, ...QUIETCD, heroes: [hero(10400, 1)], embers: null, x: 10620 }); const x0 = far.e.x; for (let i = 0; i < 30; i++) far.step();
  ok(far.e.phase === 2 && far.e.x < x0 - 10, 'PHASE 2: a hero facing her from ' + (x0 - 10400) + ' px (past the near look) still held her');
  ok(far.log.says.includes('FULL DARK: THE RIDE QUICKENS'), 'PHASE 2 did not say the ride quickens');
  const nearr = rig({ hp: W.WQ.hp * 0.6, ...QUIETCD, heroes: [hero(10540, 1)], embers: null, x: 10620 }); const x1 = nearr.e.x; for (let i = 0; i < 60; i++) nearr.step();
  ok(nearr.e.x === x1 && nearr.e.mode === 'still', 'PHASE 2: a hero facing her from 80 px did not hold her');
  const ribbon = rig({ hp: W.WQ.hp * 0.6, ...QUIETCD, heroes: [hero(10620 - 130, 1, { reach: 1.5 })], embers: null, x: 10620 }); const xr = ribbon.e.x; for (let i = 0; i < 60; i++) ribbon.step();
  ok(ribbon.e.x === xr, 'PHASE 2: with the Maypole Ribbon (144 px) a look from 130 px did not hold her');
  const p1 = rig({ ...QUIETCD, heroes: [hero(10400, 1)], embers: null, x: 10620 }); const x2 = p1.e.x; for (let i = 0; i < 30; i++) p1.step();
  ok(p1.e.x === x2, 'PHASE 1: the same far look did not hold her (the near rule leaked into phase one)');
  const p3 = rig({ hp: W.WQ.hp * 0.3, ...QUIETCD, heroes: [hero(10100, -1)], embers: null, x: 10620 }), p1b = rig({ ...QUIETCD, heroes: [hero(10100, -1)], embers: null, x: 10620 });
  for (let i = 0; i < 90; i++) { p3.step(); p1b.step(); }
  ok(p3.e.phase === 3 && (10620 - p3.e.x) > (10620 - p1b.e.x) * 1.3, 'PHASE 3: she is not faster: ' + Math.round(10620 - p3.e.x) + ' vs ' + Math.round(10620 - p1b.e.x));
  const fl1 = rig({ heroes: [hero(10300, 1)], lashCd: 1e9, crownCd: 1e9, embers: null }), fl3 = rig({ hp: W.WQ.hp * 0.3, heroes: [hero(10300, 1)], lashCd: 1e9, crownCd: 1e9, embers: null });
  for (let i = 0; i < 60 * 60; i++) { fl1.step(); fl3.step(); }
  ok(fl3.e.n.floor > fl1.e.n.floor, 'PHASE 3: the floor does not burn more often (' + fl3.e.n.floor + ' a minute, against ' + fl1.e.n.floor + ' in phase one)');
  const p3s = rig({ hp: W.WQ.hp * 0.3, ...QUIETCD, heroes: [hero(10100, 1)], embers: null, x: 10620 }); const x3 = p3s.e.x; for (let i = 0; i < 30; i++) p3s.step();
  ok(p3s.e.x === x3, 'PHASE 3: alight, the look across the green does not hold her again'); }

// ---- THE RIDE AND ITS HORSES (src/wicker-carousel.js) ----
{ const R = C.RING, r = C.newRing(A);
  ok(R.speed[0] > 0 && R.speed[1] > R.speed[0] && R.speed[2] > R.speed[1] && R.speed[2] < 92 * 0.6, 'the ride does not quicken phase by phase, or outruns a walking hero: ' + R.speed);
  ok(R.lo > W.WQ.lowTop && R.lo >= 15 && R.hi <= 51 - 8 && R.hi > R.lo + 12, 'the horses\' bob is not above the low ribbon and inside a jump (51): ' + [R.lo, R.hi]);
  ok(R.bob[1] < R.bob[0] && R.bob[2] < R.bob[1], 'the horses\' bob timing does not change with her phase: ' + R.bob);
  ok(C.ringFor(r, true, 1) === 'start', 'the ride did not start'); for (let i = 0; i < 120; i++) C.ringStep(r, DT);
  ok(Math.abs(r.speed - R.speed[0]) < 0.01, 'the ride did not come up to its first speed: ' + r.speed);
  ok(C.ringFor(r, true, 2) === 'quicken', 'a new phase did not TELL the quickening');
  let told = 0; for (let i = 0; i < 60 * 4; i++) { C.ringStep(r, DT); if (i < R.warn * 60 - 1 && Math.abs(r.speed - R.speed[0]) < 0.01) told++; }
  ok(told >= R.warn * 60 - 2 && Math.abs(r.speed - R.speed[1]) < 0.01, 'the ride quickened before its warning ran (' + told + ' frames), or never reached its phase-two speed: ' + r.speed);
  ok(C.organRate(r) > 1.4, 'the band organ\'s rate did not rise with the ride: ' + C.organRate(r));
  let fronts = new Set(), lifts = [], worst = 0, badLift = 0;
  for (let i = 0; i < 60 * 40; i++) { C.ringStep(r, DT); const hs = Array.from({ length: R.horses }, (_, k) => C.horseAt(r, k)), fr = hs.filter(h => h.front);
    fronts.add(fr.length); for (const h of fr) { lifts.push(h.lift); if (h.lift < R.lo - 0.01 || h.lift > R.hi + 0.01) badLift++; }
    if (i % 10 === 0) for (let x = r.x0; x <= r.x1; x += 8) worst = Math.max(worst, Math.min(...fr.map(h => Math.abs(h.x - x)))); }
  ok([...fronts].every(n => n >= 3 && n <= 5), 'the front run does not always hold three to five horses: ' + [...fronts]);
  ok(badLift === 0 && Math.max(...lifts) - Math.min(...lifts) > (R.hi - R.lo) * 0.9, 'a horse bobbed outside its pole, or did not bob: ' + badLift);
  /* the horses ride the boards as he does, so what counts is his run against the ring (92 px/s) through the floor's told time */
  ok(worst <= 92 * W.WQ.floorTell, 'a point of the boards stood ' + Math.round(worst) + ' px from the nearest horse: more than a run of ' + W.WQ.floorTell + ' s (a burning floor must leave one in reach)');
  ok(C.ringFor(r, false, 3) === 'stop', 'the ride did not stop'); for (let i = 0; i < 60 * 4; i++) C.ringStep(r, DT);
  ok(r.speed === 0, 'the ride did not wind down to a stop: ' + r.speed); }

// ---- THE CROWNING: at most two of hers alive ----
{ const r = rig({ heroes: [hero(10300, 1)], lashCd: 1e9, floorCd: 1e9, crownCd: 0.5, embers: null }); let maxAlive = 0, calls = 0;
  for (let i = 0; i < 60 * 80; i++) { const ev = r.step(); for (const v of ev) if (v.t === 'crown') calls++; if (i % 600 === 300) r.log.adds = Math.max(0, r.log.adds - 1); maxAlive = Math.max(maxAlive, r.log.adds); }
  ok(calls >= 3 && r.log.summons >= 3, 'the crowning did not call (' + calls + ' calls, ' + r.log.summons + ' mummers)');
  ok(maxAlive <= W.WQ.crownCap && W.WQ.crownCap === 2, 'the crowning left ' + maxAlive + ' of hers alive (at most two)'); }

// ---- THE LEVEL ----
const lv = LEVELS.find(l => l.id === 'fair'), L = lv.build(), G = L.green, Ar = L.arena;
{ ok(Ar && Ar.boss === 'wickerqueen', 'the green is not her arena: ' + JSON.stringify(Ar));
  if (Ar) {
    ok(Ar.wallL > G.door && Ar.wallR < 669 && Ar.trigger > Ar.wallL * 16 + 16 && Ar.x1 - Ar.x0 <= 46 * 16, 'the arena walls, trigger or width are wrong: ' + JSON.stringify(Ar));
    ok(Ar.music && Ar.music !== L.music, 'she has no music of her own (the arena plays the level track)');
    ok(G.carousel && G.maypole * 16 > Ar.x0 && G.bonfire * 16 < Ar.x1 && Math.abs((G.maypole + G.bonfire) * 8 - (Ar.x0 + Ar.x1) / 2) < 5 * 16, 'the green is not her carousel, with its column and firebox near its middle: ' + JSON.stringify(G));
    const hs = (L.moversExtra || []).filter(m => m.kind === 'carhorse');
    ok(hs.length === C.RING.horses && hs.every(m => m.x >= Ar.x0 && m.x + m.w <= Ar.x1 && m.y < Ar.floor - C.RING.lo + 1) && hs.filter(m => !m.broken).length >= 3, 'the carousel\'s horses are not on the ride: ' + JSON.stringify(hs));
    const q = L.ents.filter(e => e.t === 'wickerqueen'); ok(q.length === 1 && q[0].x * 16 > Ar.x0 && q[0].x * 16 < Ar.x1 && Math.sign(G.bonfire - q[0].x) === C.RING.dir, 'she is not on the ride, upstream of her fire (the first burn is the ride to give): ' + JSON.stringify(q));
    const cks = L.ents.filter(e => e.t === 'check').map(e => e.x);
    ok(cks.some(x => x < G.door && x >= G.door - 40) && !cks.some(x => x * 16 > Ar.x0 && x * 16 < Ar.x1), 'no door checkpoint before the green, or one inside it: ' + cks);
    ok(L.ents.some(e => e.t === 'hobbyhorse' && e.elite && e.gate === G.door), 'the elite hobby-horse no longer guards the door');
    const rel = L.ents.filter(e => e.t === 'relic'); ok(rel.length === 1 && rel[0].bossDrop && rel[0].x * 16 > Ar.x0 && rel[0].x * 16 < Ar.x1, 'her reward is not the fair\'s one relic slot, waiting in the green for her death: ' + JSON.stringify(rel));
    ok(L.gateAfterBoss && L.ents.some(e => e.t === 'gate' && e.x * 16 > Ar.x0 && e.x * 16 < Ar.x1), 'the level does not end at the gate after her death (gateAfterBoss)');
  } }

if (bad.length) { console.error('WICKER-QUEEN (pure + level): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('wicker-queen pure + level: ok');

// ---- IN THE PAGE ----
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'), out = {};
    const K = BK.keys, none = () => { for (const k of ['left', 'right', 'up', 'down', 'jump', 'block', 'atk']) K[k] = false; };
    const boot = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.god = true; BK.sim(5); none();
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.P.face = 1; BK.sim(150); return BK.boss; };
    const q = boot(), A = BK.L.arena, G = BK.L.green, fl = A.floor, emb = { x0: G.bonfire * 16 + 8 - 40, x1: G.bonfire * 16 + 8 + 40, mid: G.bonfire * 16 + 8 };
    for (const e of BK.enemies()) if (e !== q) e.alive = false;
    const quiet = () => { q.lashCd = 99; q.crownCd = 99; q.floorCd = 99; q.throwCd = 99; q.rest = 0; };
    const ring = () => BK.fairRing(), horses = () => BK.movers().filter(m => m.kind === 'carhorse' && !m.broken);
    out.woke = { active: BK.bossActive, t: q && q.t, mode: q && q.mode, ring: ring() };
    const hold = (x, face) => { BK.P.x = x; BK.P.y = fl; BK.P.vx = 0; BK.P.vy = 0; BK.P.face = face; BK.P.onMover = null; };
    quiet();
    // 1. FACED: her feet do not move (the ride carries her)
    q.x = A.x0 + 200; let x0 = q.x, feet = 0; for (let i = 0; i < 120; i++) { hold(q.x - 150, 1); BK.sim(1); feet = Math.max(feet, Math.abs(q.vx)); } out.faced = { feet, carried: Math.round(q.x - x0), mode: q.mode, speed: ring().speed };
    // 2. BACK TURNED: she creeps (against the ride, to him)
    x0 = q.x; for (let i = 0; i < 60; i++) { hold(x0 - 200, -1); BK.sim(1); } out.away = { moved: Math.round(x0 - q.x), mode: q.mode };
    // 3. THE BOARDS CARRY A HERO; A HERO JUMPS ONTO A HORSE (real keys) AND IT CARRIES HIM UP, DOWN AND ALONG
    { hold(A.x0 + 120, 1); none(); const b0 = BK.P.x; BK.sim(60); out.boards = Math.round(BK.P.x - b0);
      const h = horses().sort((a, b) => a.x - b.x).find(m => m.x > A.x0 + 80 && m.x < A.x1 - 260); hold(h.x - 30, 1); let rode = null, ys = [], xs = [];
      for (let i = 0; i < 150; i++) { none(); if (!rode) { K.right = Math.abs(BK.P.x - (h.x + h.w / 2)) > 3; if (BK.P.ground && !BK.P.onMover && i % 20 === 0) { BK.press('jump'); K.jump = true; } else K.jump = !BK.P.ground; }
        BK.sim(1); if (BK.P.onMover === h && !rode) rode = i; if (rode !== null) { ys.push(BK.P.y); xs.push(BK.P.x); } }
      none(); out.horse = { rode, onIt: BK.P.onMover === h, rise: ys.length ? Math.round(Math.max(...ys) - Math.min(...ys)) : 0, along: xs.length ? Math.round(xs[xs.length - 1] - xs[0]) : 0 }; }
    // 4. THE RIBBONS while he looks at her: on the boards, in a jump, ducked, and up on a horse
    const onHorse = () => { const h = horses().sort((a, b) => Math.abs(a.x - (A.x0 + 200)) - Math.abs(b.x - (A.x0 + 200)))[0]; BK.P.x = h.x + h.w / 2; BK.P.y = h.y; BK.P.vx = 0; BK.P.vy = 0; BK.P.onMover = h; BK.P.ground = true; return h; };
    const lashAs = (kind, act) => { quiet(); q.x = emb.x1 + 60; q.mode = 'still'; q.lashCd = 0; q.lashN = kind === 'low' ? 0 : 1; BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; let hp = BK.P.hp;
      if (act === 'ride') onHorse();
      for (let i = 0; i < 150; i++) { const standX = G.maypole * 16 + 8 - 100; if (act !== 'ride' && !(act === 'jump' && !BK.P.ground)) { BK.P.x = standX; BK.P.vx = 0; } BK.P.face = 1; BK.P.inv = 0; none();
        if (q.mode === 'lash' || (q.mode.startsWith('lash') && q.modeT < 0.12)) { if (act === 'duck') K.down = true; if (act === 'jump' && BK.P.ground && q.lashR < 60) { BK.press('jump'); K.jump = true; } }
        if (act === 'jump' && !BK.P.ground) K.jump = true;
        BK.sim(1); if (q.mode === 'still' && i > 70) break; }
      none(); const lost = hp - BK.P.hp; BK.god = true; BK.P.hp = BK.P.maxHp; BK.P.onMover = null; return lost; };
    out.lash = { lowStand: lashAs('low', 'stand'), lowJump: lashAs('low', 'jump'), lowRide: lashAs('low', 'ride'), highStand: lashAs('high', 'stand'), highDuck: lashAs('high', 'duck'), highRide: lashAs('high', 'ride') };
    // 5. THE FLOOR BURNS: on the boards it hurts; up on a horse it does not
    const floorAs = act => { quiet(); q.x = A.x1 - 60; q.mode = 'still'; q.floorCd = 0; BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; const hp = BK.P.hp, told = { frames: 0 };
      if (act === 'ride') onHorse(); else hold(A.x0 + 200, 1);
      for (let i = 0; i < 60 * 4; i++) { none(); BK.P.face = 1; BK.P.inv = 0; if (act !== 'ride' && BK.P.ground) { BK.P.x = A.x0 + 200; BK.P.vx = 0; } if (q.mode === 'floorTell') told.frames++; BK.sim(1); if (q.mode === 'still' && i > 60) break; }
      const lost = hp - BK.P.hp; BK.god = true; BK.P.hp = BK.P.maxHp; BK.P.onMover = null; return { lost, told: told.frames, mark: null }; };
    out.floor = { stand: floorAs('stand'), ride: floorAs('ride') };
    // 6. HER SICKLE, thrown at a turned back from across the ride: standing it hurts, ducked it passes over
    const throwAs = act => { quiet(); q.x = A.x1 - 60; q.mode = 'still'; q.throwCd = 0; BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; const hp = BK.P.hp; let mark = null;
      for (let i = 0; i < 60 * 4; i++) { hold(A.x1 - 280, -1); BK.P.inv = 0; none(); if (act === 'duck') K.down = true; if (q.mode === 'throwTell' && !mark) mark = BK.markOf(q); BK.sim(1); if (q.n.thrown && !q.sk && i > 30) break; }
      none(); const lost = hp - BK.P.hp; BK.god = true; BK.P.hp = BK.P.maxHp; return { lost, mark, thrown: q.n.thrown }; };
    out.thrown = { stand: throwAs('stand'), duck: throwAs('duck') };
    quiet();
    // 7. THE REAP from behind hurts (and wore its red mark)
    BK.god = false; BK.P.hp = BK.P.maxHp; BK.P.inv = 0; q.mode = 'still'; q.x = emb.x0 - 60; let mark = null, hurt = 0;
    for (let i = 0; i < 180; i++) { hold(q.x - 18, -1); BK.P.inv = 0; const h0 = BK.P.hp; BK.sim(1); if (q.mode === 'sickleTell' && !mark) mark = BK.markOf(q); hurt += Math.max(0, h0 - BK.P.hp); if (q.mode === 'recover') break; }
    out.sickle = { mark, hurt }; BK.god = true; BK.P.hp = BK.P.maxHp;
    // 8. THE FIRE: lure her across against the ride, turn on the embers: she burns, and a blow bites harder than against the standing wicker
    quiet(); q.mode = 'still'; q.x = emb.x1 + 70; q.bank = 0; let modes = new Set(), turned = false;
    for (let i = 0; i < 60 * 6; i++) { const f = !turned && q.x < emb.mid ? (turned = true, 1) : turned ? 1 : -1; hold(emb.x0 - 60, f); BK.sim(1); modes.add(q.mode); if (q.mode === 'burn') break; }
    out.burn = { modes: [...modes], open: q.open, mode: q.mode };
    const bite = () => { const h0 = q.hp; q.inv = 0; BKT.hurtEnemy(q, 10, q.x - 10, false); const d = h0 - q.hp; q.hp = h0; return d; };
    out.burn.bite = bite(); q.mode = 'still'; q.open = 0; out.burn.cold = bite();
    // 9. THE RIDE BRINGS HER: upstream of the fire, held in the look, she is carried onto it
    for (let i = 0; i < 60 * 8 && q.mode !== 'still'; i++) { quiet(); hold(emb.x0 - 60, 1); BK.sim(1); }   /* (her burn plays out: the opening runs in the game's slow beat) */
    quiet(); q.mode = 'still'; q.bank = 0; q.vx = 0; q.x = emb.x0 - 50; let bfeet = 0, bmodes = new Set(), fmode = null;
    for (let i = 0; i < 60 * 8 && q.mode !== 'burn'; i++) { hold(emb.x1 + 90, -1); BK.sim(1); bmodes.add(q.mode); if (q.mode !== 'rise' && Math.abs(q.vx) > bfeet) { bfeet = Math.abs(q.vx); fmode = q.mode + '@' + i; } }
    out.brought = { mode: q.mode, feet: bfeet, fmode, modes: [...bmodes] };
    for (let i = 0; i < 60 * 10 && q.mode !== 'still'; i++) { hold(emb.x1 + 90, -1); BK.sim(1); } out.brought.flung = Math.round(q.x - emb.x1);
    // 10. PHASE TWO: the green goes dark, only a near look holds her, and the ride quickens - told first
    quiet(); q.bank = 0; q.hp = Math.floor(q.maxHp * 0.6); q.mode = 'still'; q.x = emb.x1 + 40; let quickT = 0, s0 = ring().speed;
    for (let i = 0; i < 20; i++) { hold(q.x - 200, 1); BK.sim(1); quickT = Math.max(quickT, ring().quicken); }
    x0 = q.x; for (let i = 0; i < 40; i++) { hold(x0 - 200, 1); BK.sim(1); } out.dark = { phase: q.phase, dark: +(BK.L.dark || 0).toFixed(2), farMoved: Math.round(x0 - q.x), quickT: +quickT.toFixed(2), s0 };
    q.mode = 'still'; let nfeet = 0; for (let i = 0; i < 60; i++) { quiet(); hold(q.x - 70, 1); BK.sim(1); nfeet = Math.max(nfeet, Math.abs(q.vx)); } out.dark.nearFeet = nfeet;
    for (let i = 0; i < 180; i++) { quiet(); hold(q.x - 70, 1); BK.sim(1); } out.dark.speed = ring().speed;
    // 11. PHASE THREE: alight, and the ride quickens again
    quiet(); q.hp = Math.floor(q.maxHp * 0.3); q.mode = 'still'; q.x = A.x1 - 40; for (let i = 0; i < 60 * 4; i++) { quiet(); hold(A.x0 + 60, 1); BK.sim(1); }
    out.alight = { phase: q.phase, dark: +(BK.L.dark || 0).toFixed(2), speed: ring().speed };
    // 12. THE CROWNING: at most two of hers
    q.mode = 'still'; q.x = A.x1 - 40; let maxQ = 0; q.crownCd = 0;
    for (let i = 0; i < 60 * 40; i++) { hold(A.x0 + 60, 1); q.lashCd = 99; q.floorCd = 99; q.throwCd = 99; if (q.crownCd > 0.5) q.crownCd = 0.5; BK.P.inv = 99; BK.sim(1); maxQ = Math.max(maxQ, BK.enemies().filter(e => e.alive && e.fromQueen).length); if (i === 1200) for (const e of BK.enemies()) if (e.fromQueen) e.alive = false; }
    out.crown = { calls: q.n.crown, max: maxQ };
    // 13. CO-OP: the warden facing her holds her feet while the knight's back is turned
    for (const e of BK.enemies()) if (e.fromQueen) e.alive = false;
    q.hp = q.maxHp; q.mode = 'still'; q.x = emb.x1 + 60; BK.coopStart('warden', false); BK.sim(2); const [PA, PB] = BK.players(); quiet();
    const place = (fa, fb) => { PA.x = q.x - 150; PA.y = fl; PA.vx = 0; PA.face = fa; PB.x = q.x - 120; PB.y = fl; PB.vx = 0; PB.face = fb; };
    let m1 = 0; for (let i = 0; i < 300; i++) { quiet(); place(-1, 1); BK.sim(1); m1 = Math.max(m1, Math.abs(q.vx)); }   /* (long enough for the ride to settle back to phase one's pace: her health was put back) */
    let m2 = 0; const q0x = q.x; for (let i = 0; i < 60; i++) { quiet(); PA.x = q0x - 150; PA.y = fl; PA.vx = 0; PA.face = -1; PB.x = q0x - 120; PB.y = fl; PB.vx = 0; PB.face = -1; BK.sim(1); m2 = Math.max(m2, q0x - q.x); }
    out.coop = { oneFacing: m1, bothAway: Math.round(m2) }; BK.coopEnd();
    // 14. HER DEATH: the ride stops, the relic, the gate, the level cleared at the gate
    for (const e of BK.enemies()) if (e.fromQueen) e.alive = false;
    const rel = () => BK.props().find(p => p.t === 'relic'); out.death = { relicHidden: !!(rel() && rel().hidden) };
    q.hp = 1; q.mode = 'burn'; q.modeT = 2; q.inv = 0; BKT.hurtEnemy(q, 50, q.x - 10, false); for (let i = 0; i < 420 && !BK.L.gateOpen; i++) { BK.P.inv = 99; BK.sim(1); }   /* the slow beat of her fall, then THE ROAD GOES ON */
    for (let i = 0; i < 240; i++) BK.sim(1); out.death.ring = ring();
    out.death.dead = !q.alive; out.death.active = BK.bossActive; out.death.relicShown = !!(rel() && !rel().hidden); out.death.relicKind = rel() && rel().kind; out.death.gateOpen = !!BK.L.gateOpen;
    const gt = BK.L.ents.find(e => e.t === 'gate'); if (rel()) { BK.P.x = rel().x; BK.P.y = fl; BK.sim(3); } out.death.gotRelic = !!(rel() && rel().got);
    BK.tp(gt.x, gt.y); for (let i = 0; i < 60 && BK.state === 'play'; i++) BK.sim(1); out.death.state = BK.state;
    out.errors = window.__errs || null;
    return out;
  })()`, 900000);
} finally { pg.close(); }
console.log(JSON.stringify(R));
ok(R.woke.active && R.woke.t === 'wickerqueen' && R.woke.ring && R.woke.ring.on && R.woke.ring.speed > 0, 'the fight (and the ride) did not wake past the door: ' + JSON.stringify(R.woke));
ok(R.faced.feet === 0 && R.faced.carried > 10, 'faced, her feet moved (' + R.faced.feet + ') or the ride did not carry her (' + R.faced.carried + ' px)');
ok(R.away.moved > 20 && R.away.mode === 'creep', 'with his back turned she did not creep in the page: ' + JSON.stringify(R.away));
ok(R.boards > 6, 'the ride\'s boards did not carry a hero standing on them: ' + R.boards);
ok(R.horse.rode !== null && R.horse.onIt && R.horse.rise > 8 && R.horse.along > 10, 'a hero did not jump onto a horse and ride it up, down and along: ' + JSON.stringify(R.horse));
ok(R.lash.lowStand > 0 && R.lash.highStand > 0, 'the ribbons did not hurt a standing hero who was looking at her: ' + JSON.stringify(R.lash));
ok(R.lash.lowJump === 0 && R.lash.lowRide === 0, 'a hero who jumped the LOW ribbon, or rode a horse over it, was hurt: ' + JSON.stringify(R.lash));
ok(R.lash.highDuck === 0 && R.lash.highRide > 0, 'the HIGH ribbon hurt a ducked hero, or missed a rider: ' + JSON.stringify(R.lash));
ok(R.floor.stand.lost > 0 && R.floor.ride.lost === 0 && R.floor.stand.told >= 80, 'THE FLOOR BURNS: on the boards it must hurt, on a horse not, told first: ' + JSON.stringify(R.floor));
ok(R.thrown.stand.thrown && R.thrown.stand.lost > 0 && R.thrown.duck.lost === 0 && R.thrown.stand.mark === '!!', 'HER SICKLE: thrown at a turned back it must hurt a standing hero and pass over a ducked one: ' + JSON.stringify(R.thrown));
ok(R.sickle.mark === '!!' && R.sickle.hurt > 0, 'the reap from behind: ' + JSON.stringify(R.sickle));
ok(R.burn.mode === 'burn' && R.burn.modes.includes('catch') && R.burn.open > 2, 'lured onto the embers against the ride and faced she did not burn in the page: ' + JSON.stringify(R.burn));
ok(R.burn.bite > R.burn.cold * 4, 'a blow while she burns does not bite far harder than against the standing wicker: ' + JSON.stringify(R.burn));
ok(R.brought.mode === 'burn' && R.brought.feet === 0 && R.brought.flung > 0, 'held in the look upstream of the fire, the ride did not bring her onto it (and fling her off downstream) in the page: ' + JSON.stringify(R.brought));
ok(R.dark.phase === 2 && R.dark.dark >= 0.5 && R.dark.farMoved > 10 && R.dark.nearFeet === 0, 'PHASE 2 in the page (dark green, near look only): ' + JSON.stringify(R.dark));
ok(R.dark.quickT > 1 && R.dark.speed > R.dark.s0 + 5, 'PHASE 2: the ride did not quicken, or not told first: ' + JSON.stringify(R.dark));
ok(R.alight.phase === 3 && R.alight.dark < 0.2 && R.alight.speed > R.dark.speed + 5, 'PHASE 3 in the page (alight, the ride quicker again): ' + JSON.stringify(R.alight));
ok(R.crown.calls >= 2 && R.crown.max > 0 && R.crown.max <= 2, 'the crowning in the page: ' + JSON.stringify(R.crown));
ok(R.coop.oneFacing === 0 && R.coop.bothAway > 10, 'co-op in the page: ' + JSON.stringify(R.coop));
ok(R.death.relicHidden && R.death.dead && !R.death.active && R.death.relicShown && R.death.relicKind && R.death.gateOpen && R.death.gotRelic, 'her death: ' + JSON.stringify(R.death));
ok(R.death.ring && !R.death.ring.on && R.death.ring.speed === 0, 'her death did not stop the ride: ' + JSON.stringify(R.death.ring));
ok(R.death.state === 'win', 'walking to the gate after her death did not clear the level: ' + R.death.state);
ok(!pg.errors || !pg.errors.length, 'page errors: ' + JSON.stringify(pg.errors));
if (bad.length) { console.error('WICKER-QUEEN (page): ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('wicker-queen: ok (pure, level and page)');
