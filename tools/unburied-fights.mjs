/* tools/unburied-fights.mjs — THE UNBURIED FIELD's creatures and fights, driven in Node (no page, no port, no Chrome), the way
   tools/buried-dead.mjs drives the Buried Dead. src/unburied-foes.js imports nothing of main.js, so every rule is asked of the
   real update functions with a hand-made world round them.
     1 THE BANNER RULE: the fallen stay down with no standard; rise under a planted one; only FALL when cut under it; are
       finished lying down or burning; lie down for good when their bearer is cut.
     2 THE BANNER-BEARER plants when you come near, and his pole is a told blow a shield turns.
     3 THE BARROW RIDER: every move forced (A3) and answered by its one answer; the ride-through goes THROUGH you and on to
       the wall; A11 - struck in the ride he is out of the saddle, and in phase two the bones crawling back break when struck,
       and either left alone opens nothing; A10 - at half the horse falls apart, he fights on foot, remounts, and comes apart again.
     4 THE FIRST DEATH KNIGHT, with the hero's kit (2026-09-24): every move forced (A3) and answered by its one answer; A11 -
       a ward left alone opens nothing, a FULL ward struck again breaks and opens him; A10 - past half he is the banner over his
       chapel, GRAVECALL calls three, BLOOD SURGE joins, his own nova finishes his dead; A12 - the tomb ledges are in his room;
       both rotations reach every move.
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
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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

/* ---- 3. THE BARROW RIDER ---- */
{ const A = { x0: L.mini.x0, x1: L.mini.x1, floor: L.mini.floor }, X = A.x0 + 18 * TS + 8;   /* where he stands in his barrow (284 before the bridges grew in) */
  const mk = o => ({ t: 'barrowrider', alive: true, x: X, y: A.floor, hp: UNB.hp.barrowrider, maxHp: UNB.hp.barrowrider, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0, mounted: true, bolts: [], lances: [], ...o });
  const br = P => { let strikes = 0; const c = world(P, { A, struck: () => strikes-- > 0 }); c.strike = n => { strikes = n; }; return c; };
  const force = (e, what, c) => { U.brForce(e, what, c); e.modeT = 0; };
  /* THE RIDE-THROUGH: red, the length of the room, THROUGH you and on - it does not stop at you */
  { const P = { x: X - 120, y: A.floor, dead: false }, e = mk(), c = br(P); force(e, 'ride', c); run(U.updateBarrowRider, e, c, 1.3);
    assert.equal(c.hits.length, 1, 'the ride-through lands once on a hero on the floor in its lane'); assert.equal(c.hits[0].hard, true, 'no shield turns the ride-through');
    assert.ok(e.x < P.x - 60, 'he rides THROUGH you and on to the wall - he does not stop at you: ' + Math.round(e.x - P.x));
    assert.ok(e.x <= A.x0 + 40, 'the ride goes the room\'s length: ' + Math.round(e.x - A.x0));
    assert.equal(e.open, 0, 'A11: a ride left alone opens nothing');
    const J = { x: X - 120, y: A.floor - 40, dead: false }, e2 = mk(), c2 = br(J); force(e2, 'ride', c2); run(U.updateBarrowRider, e2, c2, 2.5); assert.equal(c2.hits.length, 0, 'a jump answers the ride-through'); }
  /* A11: THE CAUSED OPENING - struck as he rides through, he is out of the saddle */
  { const P = { x: X - 150, y: A.floor - 40, dead: false }, e = mk(), c = br(P); force(e, 'ride', c); run(U.updateBarrowRider, e, c, 0.2);
    assert.equal(e.mode, 'ride'); assert.equal(U.brHurt(e, 10), 10, 'the blow that unsaddles him lands at its own weight');
    run(U.updateBarrowRider, e, c, 0.05); assert.equal(e.mode, 'unsaddled', 'struck in the ride, he is out of the saddle'); assert.equal(e.mounted, false); assert.ok(e.open > 3, 'the window: ' + e.open);
    assert.equal(U.brHurt(e, 10), Math.round(10 * UNB.br.openMul), 'open, he takes more');
    run(U.updateBarrowRider, e, c, UNB.br.openT + 0.7); assert.equal(e.mounted, true, 'the horse comes back for him'); }
  /* REARING TRAMPLE: yellow, close round the horse */
  { const P = { x: X - 30, y: A.floor, dead: false }, e = mk(), c = br(P); force(e, 'trample', c); U.updateBarrowRider(e, 0.02, c); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, false, 'a shield turns the trample');
    const Q = { x: X - 90, y: A.floor, dead: false }, e2 = mk(), c2 = br(Q); force(e2, 'trample', c2); U.updateBarrowRider(e2, 0.02, c2); assert.equal(c2.hits.length, 0, 'the trample is for the hero who stands under him'); }
  /* GRAVE-FIRE: two slow bolts, three in phase two, yellow */
  { const P = { x: X - 110, y: A.floor, dead: false }, e = mk(), c = br(P); force(e, 'fire', c); U.updateBarrowRider(e, 0.02, c); assert.equal(e.bolts.length, UNB.br.bolts, 'two bolts from the saddle');
    run(U.updateBarrowRider, e, c, 2.2); assert.ok(c.hits.length >= 1 && c.hits.every(h => !h.hard), 'grave-fire lands, and a shield turns it: ' + JSON.stringify(c.hits));
    const e2 = mk({ phase: 2, hp: UNB.hp.barrowrider * 0.4, mounted: false }), c2 = br({ x: X - 110, y: A.floor, dead: false }); force(e2, 'fire', c2); U.updateBarrowRider(e2, 0.02, c2); assert.equal(e2.bolts.length, UNB.br.boltsP2, 'three in phase two'); }
  /* THE LANCE LINE: red, a row out of the ground toward you */
  { const P = { x: X - 100, y: A.floor, dead: false }, e = mk(), c = br(P); force(e, 'lance', c); U.updateBarrowRider(e, 0.02, c); run(U.updateBarrowRider, e, c, 1.0);
    assert.equal(c.hits.length, 1, 'the lance line finds a hero standing in it'); assert.equal(c.hits[0].hard, true, 'no shield turns a lance out of the ground');
    const J = { x: X - 100, y: A.floor - 40, dead: false }, e2 = mk(), c2 = br(J); force(e2, 'lance', c2); U.updateBarrowRider(e2, 0.02, c2); run(U.updateBarrowRider, e2, c2, 1.0); assert.equal(c2.hits.length, 0, 'over the line, nothing');
    const S2 = { x: X - 100, y: A.floor, dead: false }, e3 = mk(), c3 = br(S2); force(e3, 'lance', c3); S2.x = X + 60; U.updateBarrowRider(e3, 0.02, c3); run(U.updateBarrowRider, e3, c3, 1.0); assert.equal(c3.hits.length, 0, 'stepped out of the line, nothing'); }
  /* ON FOOT: the banner thrust, yellow */
  { const P = { x: X - 40, y: A.floor, dead: false }, e = mk({ mounted: false, phase: 2, hp: UNB.hp.barrowrider * 0.4 }), c = br(P); force(e, 'thrust', c); U.updateBarrowRider(e, 0.02, c); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, false, 'a shield turns the thrust'); }
  /* A10: at half, the horse falls apart; the bones crawl back and he remounts - and struck, they scatter and he is OPEN */
  { const P = { x: X - 90, y: A.floor, dead: false }, e = mk({ cd: 0 }), c = br(P); e.hp = e.maxHp * 0.49; U.updateBarrowRider(e, 0.02, c);
    assert.equal(e.phase, 2); assert.equal(e.mode, 'collapse', 'at half the horse falls apart under him'); assert.equal(e.mounted, false);
    const seen = new Set(); for (let i = 0; i < 60 * (UNB.br.footT + 4); i++) { U.updateBarrowRider(e, 1 / 60, c); seen.add(e.mode); if (e.mode === 'remountTell') break; }
    assert.equal(e.mode, 'remountTell', 'on foot a while, then the bones crawl back: ' + [...seen]);
    run(U.updateBarrowRider, e, c, UNB.br.tell.remount + 0.1); assert.equal(e.mounted, true, 'left alone, he is back in the saddle'); assert.equal(e.open, 0, 'the remount left alone opens nothing');
    const e2 = mk({ cd: 0 }), c2 = br({ x: X - 90, y: A.floor, dead: false }); e2.hp = e2.maxHp * 0.49; U.updateBarrowRider(e2, 0.02, c2); run(U.updateBarrowRider, e2, c2, 1.3);
    e2.footLeft = 0; e2.cd = 0; U.updateBarrowRider(e2, 0.02, c2); assert.equal(e2.mode, 'remountTell');
    for (let i = 0; i < UNB.br.boneHits; i++) { c2.strike(1); U.updateBarrowRider(e2, 0.05, c2); }
    assert.equal(e2.mode, 'scattered', 'A11: the bones struck, the remount breaks'); assert.equal(e2.mounted, false); assert.ok(e2.open > 3, 'and he is open: ' + e2.open);
    /* back in the saddle, the horse holds for three moves, then comes apart again */
    const e3 = mk({ cd: 0, phase: 2, hp: UNB.hp.barrowrider * 0.4, mountLeft: UNB.br.mountMoves }), c3 = br({ x: X - 90, y: A.floor, dead: false }); let moves = 0;
    for (let i = 0; i < 60 * 30 && e3.mounted; i++) { const m = e3.mode; U.updateBarrowRider(e3, 1 / 60, c3); if (e3.mode !== m && /Tell$/.test(e3.mode)) moves++; }
    assert.equal(e3.mounted, false, 'in phase two the horse comes apart again'); assert.equal(moves, UNB.br.mountMoves, 'after three moves in the saddle: ' + moves); }
  /* A3: from a cold start (the spawn case's timers) both phases reach every move */
  for (const phase of [1, 2]) { const e = mk({ cd: undefined, phase }); if (phase === 2) { e.hp = e.maxHp * 0.4; e.mounted = false; e.footLeft = 0; } delete e.bolts; delete e.lances;
    const P = { x: X - 60, y: A.floor, dead: false }, c = br(P), seen = new Set();
    for (let i = 0; i < 60 * 150; i++) { U.updateBarrowRider(e, 1 / 60, c); seen.add(e.mode); P.x = clamp(e.x + Math.sin(i / 70) * 120, A.x0 + 20, A.x1 - 20); }   /* a hero who comes and goes: under him, and a lance's length off */
    for (const m of phase === 1 ? ['rideTell', 'trampleTell', 'fireTell', 'lanceTell'] : ['thrustTell', 'lanceTell', 'remountTell', 'rideTell', 'fireTell']) assert.ok(seen.has(m), 'phase ' + phase + ' never reached ' + m + ': ' + [...seen]); }
  ok('the barrow rider', 'ride-through, trample, grave-fire, lance line, thrust, remount; A3, A10, A11'); }

/* ---- 4. THE FIRST DEATH KNIGHT ---- */
{ const A = { x0: L.arena.x0, x1: L.arena.x1, floor: L.arena.floor }, X = A.x0 + 22 * TS + 8;   /* the arena's own columns (396 before the bridges grew in) */
  const mk = () => ({ t: 'deathknight', alive: true, x: X, y: A.floor, hp: UNB.hp.deathknight, maxHp: UNB.hp.deathknight, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0, pools: [] });
  const dk = (P, adds = []) => world(P, { A, adds: () => adds.filter(q => q.alive), raise: x => adds.push({ t: 'corpse', alive: true, x, y: A.floor, mode: 'riseTell' }), cut: q => { q.alive = false; q.cut = true; } });
  const force = (e, what, c) => { U.dkForce(e, what, c); e.modeT = 0; };
  /* THE CLEAVE: in front, and a shield turns it */
  { const P = { x: X - 40, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'cleave', c); U.updateDeathKnight(e, 0.02, c); assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, false, 'the cleave is the guardable one');
    const Q = { x: X - 110, y: A.floor, dead: false }, e2 = mk(), c2 = dk(Q); force(e2, 'cleave', c2); U.updateDeathKnight(e2, 0.02, c2); assert.equal(c2.hits.length, 0, 'out of reach of the cleave, nothing'); }
  /* DEATH GRIP: the chain along the floor catches you and brings you to his feet, and the cleave follows; a jump clears it */
  { const P = { x: X - 150, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'grip', c); run(U.updateDeathKnight, e, c, 0.5);
    assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, true, 'no shield holds the grip'); assert.ok(Math.abs(P.x - (X - 26)) < 2, 'dragged to his feet: ' + (P.x - X)); assert.equal(e.mode, 'cleaveTell', 'and the cleave follows');
    const J = { x: X - 150, y: A.floor - 40, dead: false }, e2 = mk(), c2 = dk(J); force(e2, 'grip', c2); run(U.updateDeathKnight, e2, c2, 1); assert.equal(c2.hits.length, 0, 'a jump clears the chain'); assert.equal(J.x, X - 150, 'and nothing drags you');
    const B = { x: X + 60, y: A.floor, dead: false }, e3 = mk(), c3 = dk(B); U.dkForce(e3, 'grip', c3); e3.face = -1; e3.modeT = 0; run(U.updateDeathKnight, e3, c3, 1); assert.equal(c3.hits.length, 0, 'the chain does not reach behind him'); }
  /* BLOOD BOIL: where you stood, it cuts while you stay; step out and it does not */
  { const P = { x: X - 90, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'boil', c); run(U.updateDeathKnight, e, c, 1.6);
    assert.ok(c.hits.length >= 3 && c.hits.every(h => h.hard), 'standing in the boil, it keeps cutting: ' + c.hits.length);
    const Q = { x: X - 90, y: A.floor, dead: false }, e2 = mk(), c2 = dk(Q); force(e2, 'boil', c2); Q.x -= 50; run(U.updateDeathKnight, e2, c2, 1.6); assert.equal(c2.hits.length, 0, 'stepped out of it, nothing'); }
  /* THE LONG PASSING: through you and far past; a jump clears it */
  { const P = { x: X - 80, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'pass', c); run(U.updateDeathKnight, e, c, UNB.dk.passT + 0.1);
    assert.equal(c.hits.length, 1); assert.equal(c.hits[0].hard, true, 'the passing throws a guard wide'); assert.ok(e.x < P.x - 60, 'he goes through you and a long way past: ' + (e.x - P.x));
    const J = { x: X - 80, y: A.floor - 40, dead: false }, e2 = mk(), c2 = dk(J); force(e2, 'pass', c2); run(U.updateDeathKnight, e2, c2, UNB.dk.passT + 0.1); assert.equal(c2.hits.length, 0, 'a jump over the passing'); }
  /* BLOOD WARD and NOVA - A11, the hero's own rule: left alone the ward opens nothing; filled and struck again it BREAKS */
  { const P = { x: X - 50, y: A.floor, dead: false }, e = mk(), c = dk(P); force(e, 'ward', c); U.updateDeathKnight(e, 0.02, c); assert.equal(e.mode, 'ward');
    assert.equal(U.dkHurt(e, 20), 0, 'a blow on the ward is kept, not taken'); assert.equal(e.wardFill, 1);
    run(U.updateDeathKnight, e, c, UNB.dk.wardT + UNB.dk.tell.nova + 0.1); assert.equal(e.open, 0, 'A11: a ward left to run out opens nothing');
    assert.equal(c.hits.length, 1, 'the nova goes out'); assert.equal(c.hits[0].hard, true); assert.equal(c.hits[0].d, UNB.dmg.nova + UNB.dmg.novaPer, 'and pays out what it kept');
    const Q = { x: X - 50, y: A.floor, dead: false }, e2 = mk(), c2 = dk(Q); force(e2, 'ward', c2); U.updateDeathKnight(e2, 0.02, c2);
    for (let i = 0; i < UNB.dk.wardFull; i++) { U.dkHurt(e2, 20); U.updateDeathKnight(e2, 0.02, c2); } assert.equal(e2.mode, 'ward', 'a FULL ward still stands');
    U.dkHurt(e2, 20); U.updateDeathKnight(e2, 0.02, c2); assert.equal(e2.mode, 'open', 'A11: a FULL ward struck again BREAKS'); assert.ok(e2.open > 3, 'the window: ' + e2.open);
    assert.equal(U.dkHurt(e2, 20), Math.round(20 * UNB.dk.openMul), 'open, he takes more');
    const J = { x: X - 50, y: A.floor - 40, dead: false }, e3 = mk(), c3 = dk(J); force(e3, 'ward', c3); run(U.updateDeathKnight, e3, c3, UNB.dk.wardT + UNB.dk.tell.nova + 0.2); assert.equal(c3.hits.length, 0, 'a jump over the nova'); }
  /* SUMMON SKELETON: one */
  { const adds = [], e = mk(), c = dk({ x: X - 90, y: A.floor, dead: false }, adds); force(e, 'raise', c); U.updateDeathKnight(e, 0.02, c); assert.equal(adds.length, UNB.dk.raise, 'SUMMON SKELETON calls up one'); }
  /* A10: past half he is the banner; GRAVECALL calls three; BLOOD SURGE; and his own nova finishes his own dead */
  { const e = mk(); e.hp = e.maxHp * 0.49; const adds = [], c = dk({ x: X - 90, y: A.floor, dead: false }, adds); U.updateDeathKnight(e, 0.02, c); assert.equal(e.phase, 2); assert.equal(e.mode, 'rally');
    assert.ok(U.coverOf({ x: X + 50, y: A.floor }, [e], { bossLive: true, arena: A }), 'phase two: he is the banner over his own chapel');
    assert.equal(U.coverOf({ x: X + 50, y: A.floor }, [{ ...e, phase: 1 }], { bossLive: true, arena: A }), null, 'phase one: he holds nothing up');
    force(e, 'call', c); U.updateDeathKnight(e, 0.02, c); assert.equal(adds.length, UNB.dk.call, 'GRAVECALL raises three');
    const P = { x: X - 60, y: A.floor, dead: false }, e2 = mk(), c2 = dk(P); e2.phase = 2; force(e2, 'surge', c2); U.updateDeathKnight(e2, 0.02, c2); assert.equal(c2.hits.length, 1); assert.equal(c2.hits[0].hard, true, 'no shield against the surge');
    const Q = { x: X - 160, y: A.floor, dead: false }, e3 = mk(), c3 = dk(Q); e3.phase = 2; force(e3, 'surge', c3); U.updateDeathKnight(e3, 0.02, c3); assert.equal(c3.hits.length, 0, 'away from him, the surge finds nothing');
    const add = { t: 'corpse', alive: true, x: X + 40, y: A.floor, mode: 'walk' }, e4 = mk(), c4 = dk({ x: X - 200, y: A.floor, dead: false }, [add]); e4.phase = 2; force(e4, 'ward', c4); run(U.updateDeathKnight, e4, c4, UNB.dk.wardT + UNB.dk.tell.nova + 0.1); assert.ok(add.cut, 'his own nova finishes his own dead'); }
  /* A3: both rotations reach every move, from a cold start (every cooldown initialised) */
  for (const phase of [1, 2]) { const e = mk(); e.cd = undefined; delete e.pools; e.phase = phase; if (phase === 2) e.hp = e.maxHp * 0.4; const P = { x: X - 60, y: A.floor, dead: false }, c = dk(P, []), seen = new Set();
    for (let i = 0; i < 60 * 160; i++) { U.updateDeathKnight(e, 1 / 60, c); seen.add(e.mode); P.x = clamp(e.x + Math.sin(i / 70) * 150, A.x0 + 20, A.x1 - 20); P.y = A.floor; }
    for (const m of phase === 1 ? ['cleaveTell', 'gripTell', 'boilTell', 'passTell', 'wardTell', 'novaTell', 'raiseTell'] : ['callTell', 'surgeTell', 'wardTell', 'novaTell', 'gripTell', 'boilTell', 'passTell', 'cleaveTell'])
      assert.ok(seen.has(m), 'phase ' + phase + ' never reached ' + m + ': ' + [...seen]); }
  /* A12: the tomb ledges (row G-2) are still in his room: the nova and the passing are answered from them as well as by a jump */
  { let n = 0; for (let x = L.arena.x0 / TS; x < L.arena.x1 / TS; x++) if (L.grid[(G - 2) * L.W + x] !== 0) n++; assert.ok(n >= 6, 'A12: the tomb ledges (row G-2) are missing from his room: ' + n); }
  ok('the reaper (benched)', 'the old scythe, kept honest in a room of his size: cleave, grip, boil, passing, ward/nova, summon; A3, A10, A11, A12'); }

/* ---- 4b. THE DEATH KNIGHT (the boss since 2026-09-25: the hero 'reaper' turned on you, docs/briefs/unburied-deathknight.md) ---- */
{ const A = { x0: L.arena.x0, x1: L.arena.x1, floor: L.arena.floor }, X = (A.x0 + A.x1) / 2, S = UNB.bk;
  assert.equal(L.arena.boss, 'bloodknight', 'the Unburied Field ends in THE DEATH KNIGHT');
  assert.ok(L.ents.some(e => e.t === 'bloodknight') && !L.ents.some(e => e.t === 'deathknight'), 'he is placed, and the old scythe is not');
  const mk = o => ({ t: 'bloodknight', alive: true, x: X, y: A.floor, hp: UNB.hp.bloodknight, maxHp: UNB.hp.bloodknight, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0, ...o });
  const bk = (P, adds = [], extra = {}) => world(P, { A, adds: e => adds.filter(q => q.from === e && q.alive), raise: (x, fl, who) => adds.push({ t: 'corpse', x, alive: true, from: who, mode: 'riseTell' }), dodging: () => !!P.dodge, stand: () => false, ...extra });
  const force = (e, what, c) => { U.bkForce(e, what, c); };
  const tell = (e, c, secs) => run(U.updateBloodKnight, e, c, secs);
  /* THE CLEAVE: guarded (yellow), and it only sticks when it is DODGED - in reach at the commit, out of it (or rolling) when it lands */
  { const P = { x: X - 40, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'cleave', c); tell(e, c, S.tell.cleave + 0.05);
    assert.equal(c.hits.length, 1, 'the Cleave finds a hero who stays under it'); assert.equal(c.hits[0].hard, false, 'a shield turns the Cleave'); assert.notEqual(e.mode, 'stuck', 'A11: a Cleave that lands sticks nothing');
    const Q = { x: X - 200, y: A.floor, dead: false }, e2 = mk(), c2 = bk(Q); force(e2, 'cleave', c2); tell(e2, c2, S.tell.cleave + 0.05); assert.equal(c2.hits.length, 0); assert.notEqual(e2.mode, 'stuck', 'A11: a Cleave nobody was under sticks nothing');
    const R = { x: X - 40, y: A.floor, dead: false }, e3 = mk(), c3 = bk(R); force(e3, 'cleave', c3); tell(e3, c3, S.tell.cleave - S.tell.commit + 0.05); assert.ok(e3.committed, 'he commits before it lands');
    R.x = X - 120; tell(e3, c3, S.tell.commit); assert.equal(c3.hits.length, 0, 'out of it when it lands'); assert.equal(e3.mode, 'stuck', 'A11: a Cleave committed on you and dodged goes into the floor');
    assert.ok(e3.open >= S.stuckT - 0.1, 'and he is open ~2 s: ' + e3.open); assert.equal(U.bkHurt(e3, 10, X - 30), Math.round(10 * S.openMul), 'stuck, he takes more');
    tell(e3, c3, S.stuckT + 0.5); assert.notEqual(e3.mode, 'stuck', 'he wrenches it free');
    const D = { x: X - 40, y: A.floor, dead: false }, e4 = mk(), c4 = bk(D); force(e4, 'cleave', c4); tell(e4, c4, S.tell.cleave - S.tell.commit + 0.05); D.dodge = 0.2; tell(e4, c4, S.tell.commit);
    assert.equal(e4.mode, 'stuck', 'dodging THROUGH it counts as out of it'); assert.equal(c4.hits.length, 0);
    /* and he turns on you while he lifts it: the commit is where you are, not where you were when he began */
    const T2 = { x: X + 40, y: A.floor, dead: false }, e5 = mk({ face: -1 }), c5 = bk(T2); force(e5, 'cleave', c5); tell(e5, c5, S.tell.cleave + 0.05); assert.equal(c5.hits.length, 1, 'he turns to you while he lifts it'); }
  /* THE PLANTED BLADE: a fan of bolts, red, landing round where you stood - three, and five wider in phase two - with gaps to stand in */
  { const P = { x: X - 90, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'blade', c);
    assert.equal(e.boltAt.length, S.bolts, 'three bolts'); const span1 = Math.max(...e.boltAt) - Math.min(...e.boltAt);
    tell(e, c, S.tell.blade + 0.02); assert.equal(e.bolts.length, S.bolts); tell(e, c, S.boltT + 0.4); assert.equal(c.hits.length, 1, 'standing still on the mark, one finds you'); assert.equal(c.hits[0].hard, true, 'no guard turns a bolt');
    const Q = { x: X - 90, y: A.floor, dead: false }, e2 = mk(), c2 = bk(Q); force(e2, 'blade', c2); Q.x = X - 90 + S.gap / 2; tell(e2, c2, S.tell.blade + S.boltT + 0.5); assert.equal(c2.hits.length, 0, 'in the gap between two bolts, nothing');
    const e3 = mk({ phase: 2, hp: UNB.hp.bloodknight * 0.4 }), c3 = bk({ x: X - 90, y: A.floor, dead: false }); force(e3, 'blade', c3); assert.equal(e3.boltAt.length, S.boltsP2, 'phase two: five');
    assert.ok(Math.max(...e3.boltAt) - Math.min(...e3.boltAt) > span1 * 1.4, 'A10: and the fan is WIDER'); }
  /* THE BLOOD WARD: its face keeps every blow; his back does not */
  { const P = { x: X - 60, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'ward', c); tell(e, c, S.tell.ward + 0.02); assert.equal(e.mode, 'ward');
    assert.equal(U.bkHurt(e, 20, X - 30), 0, 'a blow on the ward\'s face is stopped'); assert.equal(U.bkHurt(e, 20, X + 30), 20, 'from behind it finds the man'); assert.equal(c.hits.length, 0, 'the ward strikes nobody');
    tell(e, c, S.wardT + 0.1); assert.notEqual(e.mode, 'ward', 'the ward comes down'); assert.equal(U.bkHurt(e, 20, X - 30), 20); }
  /* THE GREATSWORD RUSH: red, through you and the room's length - a jump answers it */
  { const P = { x: X - 100, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'rush', c); tell(e, c, S.tell.rush + S.rushT);
    assert.equal(c.hits.length, 1, 'the rush finds a hero on the floor'); assert.equal(c.hits[0].hard, true); assert.ok(e.x < P.x, 'and goes through you');
    const J = { x: X - 100, y: A.floor - 40, dead: false }, e2 = mk(), c2 = bk(J); force(e2, 'rush', c2); tell(e2, c2, S.tell.rush + S.rushT); assert.equal(c2.hits.length, 0, 'jumped, it passes under'); }
  /* RISE: two of the field's dead, never more than three standing */
  { const adds = [], e = mk(), c = bk({ x: X - 90, y: A.floor, dead: false }, adds); force(e, 'raise', c); tell(e, c, S.tell.raise + 0.02); assert.equal(adds.length, S.raise, 'two get up');
    force(e, 'raise', c); tell(e, c, S.tell.raise + 0.02); assert.equal(adds.length, S.addsMax, 'never more than three: ' + adds.length); }
  /* A10: at half he SURGES (told, red) and everything after it comes sooner */
  { const P = { x: X - 50, y: A.floor, dead: false }, e = mk({ cd: 0, hp: UNB.hp.bloodknight * 0.49 }), c = bk(P); U.updateBloodKnight(e, 0.02, c); assert.equal(e.phase, 2); assert.equal(e.mode, 'surgeTell', 'at half, BLOOD SURGE');
    tell(e, c, S.tell.surge + 0.02); assert.equal(c.hits.length, 1, 'the surge finds a hero close by'); assert.equal(c.hits[0].hard, true);
    const e2 = mk({ phase: 2 }), c2 = bk({ x: X - 40, y: A.floor, dead: false }); force(e2, 'cleave', c2); assert.ok(Math.abs(e2.modeT - S.tell.cleave * S.p2) < 1e-9, 'phase two: the Cleave is told sooner'); }
  /* A3: from a cold start (the spawn case's own fields) both phases reach every move */
  for (const phase of [1, 2]) { const e = mk({ cd: undefined, phase, mode: 'wake', modeT: 1.2 }); if (phase === 2) e.hp = e.maxHp * 0.4;
    const P = { x: X - 60, y: A.floor, dead: false }, c = bk(P, []), seen = new Set();
    for (let i = 0; i < 60 * 150; i++) { U.updateBloodKnight(e, 1 / 60, c); seen.add(e.mode); P.x = clamp(e.x + Math.sin(i / 70) * 150, A.x0 + 20, A.x1 - 20); }
    for (const m of ['cleaveTell', 'bladeTell', 'wardTell', 'rushTell', 'raiseTell']) assert.ok(seen.has(m), 'phase ' + phase + ' never reached ' + m + ': ' + [...seen]); }
  ok('the death knight', 'cleave (and the stuck blade), planted blade, ward, rush, rise; A3, A10, A11'); }

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
/* ---- 5b. THE BROKEN BRIDGES' TOLD VOLLEY (2026-09-25): a whistle and the shadows first, then the arrows onto the shadows; out of
   your shadow, behind cover or under a guard held up, nothing lands. Off the bridges the clock waits. ---- */
{ const F = U.newField(L, TS), bv = F.bv; assert.ok(bv, 'the level carries its bridges\' volley (L.bridgeVolley)');
  const deck = x => Math.floor(x / TS) >= 0 ? FLOOR : FLOOR;   /* the decks lie flush with the field */
  const P = { x: 283 * TS + 12, y: FLOOR, dead: false }, got = [], says = [];
  let guard = false; const c = { P, sound: s => says.push(s), say: () => {}, foes: () => [], bearerAlive: () => true, hurtP: () => {}, hurtFoe: () => {}, struck: () => false, wallStands: () => true, pegs: () => {}, spill: () => {}, breach: () => {},
    surface: x => deck(x), arrowP: (x, d, name) => { got.push(name); return guard ? 'blocked' : true; } };
  const whistle = () => { bv.marks = []; bv.t = bv.period - bv.whistle - 0.001; U.stepBridgeVolley(F, 0.01, c); };
  /* off the bridges the clock never gets to a whistle */
  { const Q = { ...P, x: 200 * TS }, c0 = { ...c, P: Q }; bv.t = 0; for (let i = 0; i < 60 * 12; i++) U.stepBridgeVolley(F, 1 / 60, c0); assert.equal(bv.marks.length, 0, 'off the bridges, no volley'); }
  whistle(); assert.equal(bv.marks.length, 3, 'three shadows'); assert.ok(says.includes('whistle'), 'the whistle comes first');
  assert.ok(bv.marks.some(m => Math.abs(m.x - P.x) < 1), 'one shadow on you'); assert.ok(bv.marks.every(m => m.y === FLOOR), 'the shadows lie on the planks');
  U.stepBridgeVolley(F, bv.whistle - 0.05, c); assert.equal(got.length, 0, 'nothing lands during the whistle');
  U.stepBridgeVolley(F, 0.1, c); assert.equal(got.length, 1, 'standing in your shadow, the arrows find you'); assert.equal(bv.marks.length, 0);
  /* stepped out of it: between the shadows, nothing */
  whistle(); P.x += bv.spread / 2; U.stepBridgeVolley(F, bv.whistle + 0.05, c); assert.equal(got.length, 1, 'out of your shadow, the arrows miss');
  /* behind cover: the broken mantlet on the second deck */
  const cv = F.covers.find(q => q.kind === 'brokenMantlet' && q.x > bv.x0 && q.x < bv.x1); assert.ok(cv, 'a broken mantlet on the bridges');
  P.x = cv.x; P.y = cv.y; whistle(); U.stepBridgeVolley(F, bv.whistle + 0.05, c); assert.equal(got.length, 1, 'behind cover, the arrows do not land');
  /* a guard held up: the blow comes (from straight overhead) and the guard turns it */
  P.x = 283 * TS + 12; P.y = FLOOR; guard = true; whistle(); U.stepBridgeVolley(F, bv.whistle + 0.05, c); assert.equal(got.length, 2, 'under a guard the blow still comes...'); assert.equal(bv.turned, 1, '...and the guard turns it');
  /* the shadows move: never the same three twice running */
  const a = (whistle(), bv.marks.map(m => Math.round(m.x - P.x))); U.stepBridgeVolley(F, bv.whistle + 0.05, c); const b = (whistle(), bv.marks.map(m => Math.round(m.x - P.x)));
  assert.notDeepEqual(a, b, 'the same shadows twice: ' + a + ' / ' + b);
  ok('the broken bridges', 'whistle, shadows, then arrows; step out, cover, or a guard overhead'); }
console.log('ok  unburied-fights the banner rule, the Barrow Rider, the Death Knight (and the benched Reaper), the bridges and the field hold');
