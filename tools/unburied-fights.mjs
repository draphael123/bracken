/* tools/unburied-fights.mjs — THE UNBURIED FIELD's creatures and fights, driven in Node (no page, no port, no Chrome), the way
   tools/buried-dead.mjs drives the Buried Dead. src/unburied-foes.js imports nothing of main.js, so every rule is asked of the
   real update functions with a hand-made world round them.
     1 THE BANNER RULE: the fallen stay down with no standard; rise under a planted one; only FALL when cut under it; are
       finished lying down or burning; lie down for good when their bearer is cut.
     2 THE BANNER-BEARER plants when you come near, and his pole is a told blow a shield turns.
     3 THE STANDARD-BEARER: every attack forced (A3) and answered; the plant raises a wave; three blows on the BANNER tear it
       and open him (the caused opening); a plant left alone ends and opens nothing.
     4 THE FIRST DEATH KNIGHT: every attack forced (A3) and answered by its one answer; A11 - the Reaping that drags one of
       his own risen dead in opens him, the same Reaping with nothing of his in it does not; A10 (proposed) - past half he is
       the banner over his chapel; A12 - the Reaping's answer (a tomb ledge) is really in his room; both rotations reach
       every attack.
     5 THE FIELD: a volley hurts in the open and not behind cover or in a trench; a quiet ridge fires nothing; the cavalry
       rides down a hero on the trench floor and not one on a wreck; a volley stands the pegs out of a palisade.
   Every assertion here was run red against a broken module before it was trusted (see the commit that added this file). */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import * as U from '../src/unburied-foes.js';
const { UNB } = U;
const L = LEVELS.find(l => l.id === 'unburied').build(), TS = 16, G = 36;
const ok = (what, extra = '') => console.log('  ok  ' + what.padEnd(52) + extra);
const FLOOR = (G + 1) * TS;

/* a flat world: floor at FLOOR, nothing solid above it */
function world(P, extra = {}) {
  const hits = [];
  const c = { P, hits, hit: (x, d, hard, name) => hits.push({ d, hard, name }), say: () => {}, sound: () => {}, shake: () => {}, ring: () => {},
    move: (q, dx, dy) => { q.x += dx; q.y = Math.min(FLOOR, q.y + dy); return { ground: q.y >= FLOOR }; },
    solid: (x, y) => y >= FLOOR, cover: () => null, finish: q => { q.alive = false; q.finished = true; }, ...extra };
  return c;
}
const corpse = (x, o = {}) => ({ t: 'corpse', alive: true, x, y: FLOOR, w: 10, h: 7, hp: UNB.hp.corpse, mode: 'down', modeT: 0, face: -1, anim: 0, ...o });
const run = (fn, e, c, secs, dt = 1 / 60) => { for (let i = 0; i < secs / dt; i++) fn(e, dt, c); };

/* ---- 1. THE BANNER RULE ---- */
{ const P = { x: 900, y: FLOOR, dead: false }, bearer = { t: 'bannerbearer', alive: true, planted: true, flagX: 100, flagY: FLOOR };
  const z = corpse(140), c = world(P, { cover: q => U.coverOf(q, [bearer]) });
  const lone = corpse(600), cl = world(P, { cover: q => U.coverOf(q, [bearer]) });
  run(U.updateCorpse, lone, cl, 3); assert.equal(lone.mode, 'down', 'a corpse with no standard over it got up');
  run(U.updateCorpse, z, c, 0.05); assert.equal(z.mode, 'riseTell', 'a planted standard 40px away did not raise the fallen');
  run(U.updateCorpse, z, c, UNB.riseT + 0.1); assert.equal(z.mode, 'walk'); assert.equal(z.h, 24, 'risen, it stands its full height');
  /* cut down under the standard it only falls */
  let r = U.corpseHurt(z, z.hp + 5, U.coverOf(z, [bearer]), false); assert.equal(r, false, 'cut under a standard, a corpse must only fall'); assert.equal(z.mode, 'down'); assert.equal(z.hp, z.hp0 || UNB.hp.corpse);
  run(U.updateCorpse, z, c, UNB.downT + 0.2); assert.notEqual(z.mode, 'down', 'a fallen corpse under the standard must get up again');
  /* struck while it lies there, it is finished */
  const y = corpse(120); r = U.corpseHurt(y, 1, bearer, false); assert.ok(r > y.hp, 'any blow on a corpse lying down finishes it');
  /* burned, it stays down */
  const b = corpse(130, { burn: 2 }); run(U.updateCorpse, b, world(P, { cover: () => bearer }), 0.1); assert.ok(b.finished, 'a burning corpse must be finished, not raised');
  /* uncovered, the killing blow kills */
  const u = corpse(500, { mode: 'walk', h: 24 }); assert.ok(U.corpseHurt(u, u.hp + 1, null, false) > 0, 'with no standard, a killing blow kills');
  /* cut the bearer: his raised dead lie down and stay down */
  const w = corpse(110, { mode: 'walk', raisedBy: bearer, h: 24 }); const n = U.bannerFalls(bearer, [w]); assert.equal(n, 1); assert.equal(w.mode, 'down'); assert.equal(bearer.planted, false);
  run(U.updateCorpse, w, world(P, { cover: q => U.coverOf(q, [bearer]) }), 5); assert.equal(w.mode, 'down', 'with its bearer cut, the corpse got up again');
  /* its cut is told and a shield turns it */
  const s = corpse(100, { mode: 'walk', h: 24 }), P2 = { x: 115, y: FLOOR, dead: false }, cs = world(P2);
  run(U.updateCorpse, s, cs, 0.02); assert.equal(s.mode, 'cutTell'); assert.equal(cs.hits.length, 0, 'the cut landed before its tell');
  run(U.updateCorpse, s, cs, 0.8); assert.equal(cs.hits.length, 1); assert.equal(cs.hits[0].hard, false, 'a dead man\'s cut must be one a shield turns');
  ok('the banner rule', 'rise, fall, finish, burn, lie down with the bearer'); }

/* ---- 2. THE BANNER-BEARER ---- */
{ const P = { x: 300, y: FLOOR, dead: false }, e = { t: 'bannerbearer', alive: true, x: 420, y: FLOOR, mode: 'walk', modeT: 0, cd: 1, planted: false, face: -1, anim: 0 }, c = world(P);
  run(U.updateBannerbearer, e, c, 0.05); assert.equal(e.mode, 'plantTell', 'within 150px he plants');
  run(U.updateBannerbearer, e, c, 1.0); assert.ok(e.planted && Number.isFinite(e.flagX), 'the standard is planted');
  P.x = e.x - 20; e.cd = 0; run(U.updateBannerbearer, e, c, 0.02); assert.equal(e.mode, 'poleTell');
  run(U.updateBannerbearer, e, c, 0.8); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, false, 'the pole is a blow a shield turns');
  ok('the banner-bearer', 'plants in range, a told pole'); }

/* ---- 3. THE STANDARD-BEARER ---- */
{ const A = { x0: 266 * TS, x1: 295 * TS, floor: FLOOR };
  const mk = () => ({ t: 'standardbearer', alive: true, x: 284 * TS, y: FLOOR, hp: UNB.hp.standardbearer, maxHp: UNB.hp.standardbearer, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0 });
  const sb = (P, extra = {}) => { const raised = []; let strikes = 0; const c = world(P, { A, adds: () => raised, raise: x => raised.push({ t: 'corpse', alive: true, x, y: FLOOR, mode: 'walk' }), collapse: e => U.bannerFalls(e, raised),
    struck: () => strikes-- > 0, ...extra }); c.raised = raised; c.strike = n => { strikes = n; }; return c; };
  const force = (e, m) => { e.mode = m; e.modeT = 0; };
  { const P = { x: 284 * TS - 40, y: FLOOR, dead: false }, e = mk(), c = sb(P); force(e, 'sweepTell'); U.updateStandardBearer(e, 0.02, c); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, false, 'the sweep is guardable');
    const Q = { x: 284 * TS - 100, y: FLOOR, dead: false }, e2 = mk(), c2 = sb(Q); force(e2, 'sweepTell'); U.updateStandardBearer(e2, 0.02, c2); assert.equal(c2.hits.length, 0, 'stepping back answers the sweep'); }
  { const P = { x: 284 * TS - 120, y: FLOOR, dead: false }, e = mk(), c = sb(P); force(e, 'chargeTell'); run(U.updateStandardBearer, e, c, 1.4); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, true, 'the charge is at the ankles: no shield');
    const Q = { x: 284 * TS - 120, y: FLOOR - 40, dead: false }, e2 = mk(), c2 = sb(Q); force(e2, 'chargeTell'); run(U.updateStandardBearer, e2, c2, 1.4); assert.equal(c2.hits.length, 0, 'a jump answers the charge'); }
  { const P = { x: 284 * TS - 100, y: FLOOR, dead: false }, e = mk(), c = sb(P); force(e, 'plantTell'); U.updateStandardBearer(e, 0.02, c);
    assert.equal(e.mode, 'planted'); assert.equal(c.raised.length, UNB.sb.raise, 'the plant raises a wave');
    run(U.updateStandardBearer, e, c, UNB.sb.plantT + 0.2); assert.notEqual(e.mode, 'torn'); assert.equal(e.open, 0, 'a plant left alone must open nothing'); }
  { const P = { x: 284 * TS - 100, y: FLOOR, dead: false }, e = mk(), c = sb(P); force(e, 'plantTell'); U.updateStandardBearer(e, 0.02, c);
    for (const q of c.raised) q.raisedBy = e;
    for (let i = 0; i < UNB.sb.flagHits; i++) { c.strike(1); U.updateStandardBearer(e, 0.05, c); }
    assert.equal(e.mode, 'torn', 'three blows on the banner must tear it'); assert.ok(e.open > 2, 'the torn banner is the window: ' + e.open);
    assert.ok(c.raised.every(q => q.mode === 'down'), 'with the banner torn his wave lies down'); }
  { const e = mk(), P = { x: 200 * TS, y: FLOOR, dead: false }, c = sb(P); e.cd = 0; e.hp = e.maxHp * 0.4; const seen = new Set();
    for (let i = 0; i < 60 * 90; i++) { U.updateStandardBearer(e, 1 / 60, c); seen.add(e.mode); P.x = 284 * TS + Math.sin(i / 90) * 150; c.raised.length = 0; }
    for (const m of ['sweepTell', 'chargeTell', 'plantTell']) assert.ok(seen.has(m), 'the Standard-Bearer never reached ' + m); assert.equal(e.phase, 2); }
  ok('the standard-bearer', 'sweep, charge, plant, bash; the banner torn is the window'); }

/* ---- 4. THE FIRST DEATH KNIGHT ---- */
{ const A = { x0: L.arena.x0, x1: L.arena.x1, floor: L.arena.floor }, X = 396 * TS + 8;
  const mk = () => ({ t: 'deathknight', alive: true, x: X, y: A.floor, hp: UNB.hp.deathknight, maxHp: UNB.hp.deathknight, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0, marks: [] });
  const dk = (P, adds = []) => { const c = world(P, { A, adds: () => adds.filter(q => q.alive), raise: x => adds.push({ t: 'corpse', alive: true, x, y: A.floor, mode: 'riseTell' }), cut: q => { q.alive = false; q.cut = true; },
    pull: (x, r, v, dt) => { if (P.y >= A.floor - 20 && Math.abs(P.x - x) < r && Math.abs(P.x - x) > 12) P.x += Math.sign(x - P.x) * v * dt; } }); return c; };
  const force = (e, what, c) => { U.dkForce(e, what, c); e.modeT = 0; };
  /* THE SWATHE: outside it cuts hard; inside it barely cuts, and a shield turns that; over it, nothing */
  { const P = { x: X - 70, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'swathe', c); U.updateDeathKnight(e, 0.02, c); assert.equal(c.hits.length, 1); assert.ok(c.hits[0].hard && c.hits[0].d === UNB.dmg.swathe, 'the swathe outside cuts hard');
    const Q = { x: X - 18, y: A.floor, dead: false }, e2 = mk(), c2 = dk(Q); force(e2, 'swathe', c2); U.updateDeathKnight(e2, 0.02, c2); assert.equal(c2.hits.length, 1); assert.ok(!c2.hits[0].hard && c2.hits[0].d < 6, 'inside the swathe it barely cuts: ' + JSON.stringify(c2.hits));
    const J = { x: X - 70, y: A.floor - 52, dead: false }, e3 = mk(), c3 = dk(J); force(e3, 'swathe', c3); U.updateDeathKnight(e3, 0.02, c3); assert.equal(c3.hits.length, 0, 'a jump over the swathe'); }
  /* THE REAPING drags and cuts at the ankles: on the floor it lands, on a tomb ledge it does not */
  { const P = { x: X - 130, y: A.floor, dead: false }, e = mk(), c = dk(P); U.dkForce(e, 'reap', c); const x0 = P.x; run(U.updateDeathKnight, e, c, UNB.dk.tell.reap + 0.05);
    assert.ok(P.x > x0 + 40, 'the reaping must drag you in: ' + (P.x - x0)); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, true);
    assert.equal(e.mode, 'reap'); run(U.updateDeathKnight, e, c, 0.5); assert.equal(e.open, 0, 'A11: the Reaping unprovoked opens NOTHING');
    const Q = { x: X - 60, y: A.floor - 32, dead: false }, e2 = mk(), c2 = dk(Q); U.dkForce(e2, 'reap', c2); run(U.updateDeathKnight, e2, c2, UNB.dk.tell.reap + 0.05); assert.equal(c2.hits.length, 0, 'a hero on a tomb ledge (32px up) is over the reaping'); }
  /* A11: THE CAUSED OPENING */
  { const P = { x: X - 60, y: A.floor - 32, dead: false }, add = { t: 'corpse', alive: true, x: X + 130, y: A.floor, mode: 'walk' }, e = mk(), c = dk(P, [add]); U.dkForce(e, 'reap', c);
    run(U.updateDeathKnight, e, c, UNB.dk.tell.reap + 0.05); assert.ok(add.cut, 'his own risen dead, dragged in from 130px, must be cut by the circle');
    assert.equal(e.mode, 'open', 'A11: cutting his own dead leaves him OPEN'); assert.ok(e.open > 3, 'the window: ' + e.open);
    const lying = { t: 'corpse', alive: true, x: X + 40, y: A.floor, mode: 'down' }, e2 = mk(), c2 = dk({ x: X - 60, y: A.floor - 32, dead: false }, [lying]); U.dkForce(e2, 'reap', c2);
    run(U.updateDeathKnight, e2, c2, UNB.dk.tell.reap + 0.05); assert.ok(lying.cut, 'a corpse lying in the circle is scythed too'); assert.notEqual(e2.mode, 'open', 'a corpse lying down is not a raised dead: no opening'); }
  /* THE PASSING: the mark goes off where you stood, and leaving it answers it */
  { const P = { x: X - 80, y: A.floor, dead: false }, e = mk(), c = dk(P); U.dkForce(e, 'pass', c); const mx = e.markX; run(U.updateDeathKnight, e, c, UNB.dk.tell.pass + 0.4);
    assert.ok(Math.abs(e.x - mx) > 40 && Math.sign(e.x - mx) === -Math.sign(X - mx), 'he steps THROUGH you to the far side'); assert.equal(c.hits.length, 0, 'the passing itself strikes nobody (the touch rule)');
    run(U.updateDeathKnight, e, c, UNB.dk.markT); assert.equal(c.hits.length, 1, 'standing on the mark, it goes off on you'); assert.equal(c.hits[0].hard, true);
    const Q = { x: X - 80, y: A.floor, dead: false }, e2 = mk(), c2 = dk(Q); U.dkForce(e2, 'pass', c2); run(U.updateDeathKnight, e2, c2, UNB.dk.tell.pass + 0.4); Q.x -= 90; run(U.updateDeathKnight, e2, c2, UNB.dk.markT); assert.equal(c2.hits.length, 0, 'leaving the mark answers it'); }
  /* THE CUT, guarded; RAISE */
  { const P = { x: X - 25, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'cut', c); U.updateDeathKnight(e, 0.02, c); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, false, 'the short cut is the guardable one');
    const adds = [], e2 = mk(), c2 = dk({ x: X - 90, y: A.floor, dead: false }, adds); force(e2, 'raise', c2); U.updateDeathKnight(e2, 0.02, c2); assert.equal(adds.length, UNB.dk.raise, 'RAISE calls up two'); }
  /* A10 (PROPOSED): past half he is the banner, and his raise is bigger */
  { const e = mk(); e.hp = e.maxHp * 0.49; const adds = [], c = dk({ x: X - 90, y: A.floor, dead: false }, adds); U.updateDeathKnight(e, 0.02, c); assert.equal(e.phase, 2); assert.equal(e.mode, 'rally');
    assert.ok(U.coverOf({ x: X + 50, y: A.floor }, [e], { bossLive: true, arena: A }), 'phase two: he is the banner over his own chapel');
    assert.equal(U.coverOf({ x: X + 50, y: A.floor }, [{ ...e, phase: 1 }], { bossLive: true, arena: A }), null, 'phase one: he holds nothing up');
    force(e, 'raise', c); U.updateDeathKnight(e, 0.02, c); assert.equal(adds.length, UNB.dk.raiseP2, 'phase two raises three'); }
  /* A3: both rotations reach every attack, from a cold start (every cooldown initialised) */
  for (const phase of [1, 2]) { const e = mk(); e.cd = undefined; e.phase = phase; if (phase === 2) e.hp = e.maxHp * 0.4; const P = { x: X - 60, y: A.floor, dead: false }, c = dk(P, []), seen = new Set();
    for (let i = 0; i < 60 * 120; i++) { U.updateDeathKnight(e, 1 / 60, c); seen.add(e.mode); P.x = X + Math.sin(i / 70) * 120; }
    for (const m of ['swatheTell', 'reapTell', 'passTell', 'raiseTell', 'cutTell']) assert.ok(seen.has(m), 'phase ' + phase + ' never reached ' + m); }
  /* A12: the Reaping's answer is a ledge 32px up, and his room has one each side */
  { let n = 0; for (let x = L.arena.x0 / TS; x < L.arena.x1 / TS; x++) if (L.grid[(G - 2) * L.W + x] !== 0) n++; assert.ok(n >= 6, 'A12: the tomb ledges (row G-2) are missing from his room: ' + n); }
  ok('the first death knight', 'four told attacks and a raise, A3, A10 (proposed), A11, A12'); }

/* ---- 5. THE FIELD ---- */
{ const F = U.newField(L, TS), P = { x: 90 * TS, y: FLOOR, dead: false }, hits = [], pegs = [];
  let alive = true; const c = { P, sound: () => {}, say: () => {}, foes: () => [], bearerAlive: () => alive, hurtP: (x, d, name) => hits.push(name), hurtFoe: () => {}, struck: () => false,
    wallStands: () => true, pegs: (p, on) => pegs.push([p.x, on]), spill: () => {}, breach: () => {} };
  const v = F.volleys[1]; v.t = v.period - v.horn - 0.01; U.stepField(F, 0.02, c); assert.ok(v.warn, 'the horn sounds before the volley');
  U.stepField(F, v.horn, c); assert.equal(hits.filter(h => h === 'THE VOLLEY').length, 1, 'in the open, the volley lands');
  assert.ok(pegs.some(([x, on]) => x === 104 && on), 'the volley stands its arrows out of the palisade at 104');
  const cv = F.covers.find(q => q.x > v.x0 && q.x < v.x1 && q.ty === G); P.x = cv.x; P.y = cv.y; v.t = v.period - 0.01; hits.length = 0; U.stepField(F, 0.02, c); assert.equal(hits.length, 0, 'behind cover, the volley does not land');
  P.x = 100 * TS; P.y = (G + 5) * TS; v.t = v.period - 0.01; U.stepField(F, 0.02, c); assert.equal(hits.length, 0, 'down in the trench, the volley does not land');
  alive = false; P.x = 90 * TS; P.y = FLOOR; v.t = v.period - 0.01; U.stepField(F, 0.02, c); assert.ok(v.quiet, 'its bearer cut, the stretch goes quiet'); U.stepField(F, 7, c); assert.equal(hits.length, 0, 'a quiet ridge fires nothing');
  /* THE CAVALRY: the trench floor is ridden down, a wreck is not */
  const cav = F.cav; alive = true; P.x = 190 * TS; P.y = (G + 6) * TS; hits.length = 0; cav.t = cav.period - U.HORN_CAV - 0.01; U.stepField(F, 0.02, c); assert.ok(cav.warn, 'horns before the charge');
  for (let i = 0; i < 60 * 8; i++) U.stepField(F, 1 / 60, c); assert.ok(hits.includes('THE GHOST CAVALRY'), 'on the trench floor the cavalry rides you down');
  hits.length = 0; P.y = (G + 3) * TS; P.x = 184 * TS; cav.x = null; cav.t = cav.period - 0.01; for (let i = 0; i < 60 * 8; i++) U.stepField(F, 1 / 60, c); assert.ok(!hits.includes('THE GHOST CAVALRY'), 'on a wreck in the lane the cavalry passes under you');
  let wreck = 0; for (let x = 150; x <= 226; x++) if (L.grid[(G + 3) * L.W + x] !== 0) wreck++; assert.ok(wreck >= 15, 'C5: the lane has wrecks to get up onto: ' + wreck);
  ok('the field', 'volley and cover, trench shelter, quiet ridge, pegs, cavalry and wrecks'); }
console.log('ok  unburied-fights the banner rule, the Standard-Bearer, the First Death Knight and the field hold');
