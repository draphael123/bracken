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
import * as GB from '../src/boss-greed.js';
import * as MARKS from '../src/marks.js';
import { readFileSync } from 'node:fs';
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

/* ---- 4b. THE DEATH KNIGHT (the boss: the hero 'reaper' turned on you; rebuilt from the hero's kit, claude/dk3 2026-10-04 -
   Daniel 10-03: "look at his kit to see what he should actually do" / "he should play like the player character") ---- */
{ const A = { x0: L.arena.x0, x1: L.arena.x1, floor: L.arena.floor }, X = (A.x0 + A.x1) / 2, S = UNB.bk;
  assert.equal(L.arena.boss, 'bloodknight', 'the Unburied Field ends in THE DEATH KNIGHT');
  assert.ok(L.ents.some(e => e.t === 'bloodknight') && !L.ents.some(e => e.t === 'deathknight'), 'he is placed, and the old scythe is not');
  const mk = o => ({ t: 'bloodknight', alive: true, x: X, y: A.floor, hp: UNB.hp.bloodknight, maxHp: UNB.hp.bloodknight, mode: 'stalk', modeT: 0, cd: 99, phase: 1, turn: 0, face: -1, anim: 0, ...o });
  /* a seeded die, so a run is the same run every time (bossLab pins Math.random the same way in the page) */
  const seeded = (s = 7) => { s = Math.imul(s, 2654435761) >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
  const bk = (P, adds = [], extra = {}) => world(P, { A, adds: e => adds.filter(q => q.from === e && q.alive), raise: (x, fl, who) => adds.push({ t: 'corpse', x, alive: true, from: who, mode: 'riseTell' }), dodging: () => !!P.dodge, stand: () => false, rand: seeded(), ...extra });
  const force = (e, what, c) => { U.bkForce(e, what, c); };
  const tell = (e, c, secs) => run(U.updateBloodKnight, e, c, secs);
  /* THE MOVE LIST: every move of his is a named skill of the hero's kit - and there is no rush */
  { const SRC = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/progression-catalog.js', import.meta.url), 'utf8'), MOD = readFileSync(new URL('../src/unburied-foes.js', import.meta.url), 'utf8');
    const moves = [...new Set([...S.order, ...S.orderP2, 'cleave', 'nova', 'pass', 'punish', 'raise', 'call', 'surge'])];
    for (const m of moves) { const skill = U.BK_KIT[m]; assert.ok(skill, 'his move "' + m + '" names no hero skill (BK_KIT)'); const name = skill.replace(/\s*\(.*\)$/, '');
      assert.ok(name === 'greatsword cleave' || SRC.includes(name), 'his move "' + m + '" claims the hero skill ' + name + ', which the hero does not have'); }
    assert.ok(!moves.some(m => /rush|charge/i.test(m)) && !/rushTell|'rush'|GREATSWORD RUSH/.test(MOD.slice(MOD.indexOf('THE DEATH KNIGHT (boss'), MOD.indexOf('export function bbFrame'))), 'THE GREATSWORD RUSH is deleted (Daniel 10-03: not in his kit)');
    for (const t of ['swingTell', 'cleaveTell', 'bladeTell', 'gripTell', 'boilTell', 'coilTell', 'tideTell', 'wardTell', 'novaTell', 'raiseTell', 'callTell', 'surgeTell']) assert.ok(('bloodknight|' + t) in MARKS.MARK, 'his tell ' + t + ' has no mark over it (src/marks.js)'); }
  /* THE DAMAGE MODEL (FULL DAMAGE, DEFENDS HIMSELF): outside the ward every blow whole; the ward's face 0 and it fills; behind it whole; FULL and struck again it breaks and he is open */
  { const P = { x: X - 60, y: A.floor, dead: false }, e = mk(), c = bk(P);
    assert.equal(U.bkHurt(e, 20, X - 30), 20, 'outside the ward a blow lands whole'); assert.ok(!GB.chipped(e, true), 'and the boss rule never chips him (src/boss-greed.js FULL_DAMAGE)');
    force(e, 'ward', c); tell(e, c, S.tell.ward + 0.02); assert.equal(e.mode, 'ward');
    assert.equal(U.bkHurt(e, 20, X - 30), 0, 'a blow on the ward\'s face is stopped'); assert.equal(e.wardFill, 1, 'and fills it');
    assert.equal(U.bkHurt(e, 20, X + 30), 20, 'from behind it finds the man, whole'); assert.equal(c.hits.length, 0, 'the ward strikes nobody');
    U.bkHurt(e, 20, X - 30); U.bkHurt(e, 20, X - 30); assert.equal(e.wardFill, S.wardFull, 'three blows fill it'); assert.ok(!U.bkOpen(e), 'full is not open yet');
    assert.equal(U.bkHurt(e, 20, X - 30), 0, 'the breaking blow is kept'); tell(e, c, 0.02); assert.equal(e.mode, 'reel', 'a FULL ward struck again BREAKS: he reels'); assert.ok(U.bkOpen(e) && GB.openOf(e), 'and he is OPEN (the boss rule agrees)');
    assert.equal(U.bkHurt(e, 20, X - 30), Math.round(20 * S.openMul), 'open, a blow takes x' + S.openMul);
    tell(e, c, S.reelT + 0.05); assert.equal(e.mode, 'ward', 'B3: after the opening he GUARDS'); assert.ok(e.wardLock, 'a guard that will not break');
    for (let i = 0; i < 6; i++) U.bkHurt(e, 20, e.x + e.wardFace * 30); tell(e, c, 0.02); assert.notEqual(e.mode, 'reel', 'B3: the guard after an opening cannot be broken into another (no chain-lock)');
    tell(e, c, S.guardT + 0.1); assert.notEqual(e.mode, 'novaTell', 'and the guard pays out no nova');
    /* left alone the ward pays out as the NOVA, bigger for every blow it kept */
    const Q = { x: X - 50, y: A.floor, dead: false }, e2 = mk(), c2 = bk(Q); force(e2, 'ward', c2); tell(e2, c2, S.tell.ward + 0.02); U.bkHurt(e2, 10, X - 30); U.bkHurt(e2, 10, X - 30);
    tell(e2, c2, S.wardT + 0.05); assert.equal(e2.mode, 'novaTell', 'left alone, BLOOD NOVA'); tell(e2, c2, S.tell.nova + 0.02);
    assert.equal(c2.hits.length, 1, 'the nova finds a hero close by'); assert.equal(c2.hits[0].hard, true); assert.equal(c2.hits[0].d, UNB.dmg.bkNova + 2 * UNB.dmg.bkNovaPer, 'two blows kept: two more in it'); }
  /* HIS GREATSWORD: a string of one to three cuts, a shield turns each, and the last is always THE CLEAVE */
  { const seen = new Set(); for (let s = 1; s <= 24; s++) { const P = { x: X - 36, y: A.floor, dead: false }, e = mk(), c = bk(P, [], { rand: seeded(s) }); force(e, 'string', c);
      let cuts = 0, last = null, m0 = e.mode; for (let i = 0; i < 60 * 6 && e.mode !== 'stalk'; i++) { U.updateBloodKnight(e, 1 / 60, c); if (e.mode !== m0 && (e.mode === 'swing' || e.mode === 'cleave')) { cuts++; last = e.mode; } m0 = e.mode; e.cd = 99; }
      assert.ok(cuts >= 1 && cuts <= 3, 'a string is one to three cuts: ' + cuts); assert.equal(last, 'cleave', 'the last cut of a string is the Cleave'); seen.add(cuts);
      assert.ok(c.hits.length >= 1 && c.hits.every(h => !h.hard), 'every cut of the string a shield turns'); }
    assert.ok(seen.size >= 2, 'strings come in more than one length: ' + [...seen]); }
  /* THE CLEAVE: guarded (yellow), and it only sticks when it is DODGED - in reach at the commit, out of it (or rolling) when it lands */
  { const P = { x: X - 40, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'cleave', c); tell(e, c, S.tell.cleave + 0.05);
    assert.equal(c.hits.length, 1, 'the Cleave finds a hero who stays under it'); assert.equal(c.hits[0].hard, false, 'a shield turns the Cleave'); assert.notEqual(e.mode, 'stuck', 'A11: a Cleave that lands sticks nothing');
    const Q = { x: X - 200, y: A.floor, dead: false }, e2 = mk(), c2 = bk(Q); force(e2, 'cleave', c2); tell(e2, c2, S.tell.cleave + 0.05); assert.equal(c2.hits.length, 0); assert.notEqual(e2.mode, 'stuck', 'A11: a Cleave nobody was under sticks nothing');
    const R = { x: X - 40, y: A.floor, dead: false }, e3 = mk(), c3 = bk(R); force(e3, 'cleave', c3); tell(e3, c3, S.tell.cleave - S.tell.commit + 0.05); assert.ok(e3.committed, 'he commits before it lands');
    R.x = X - 120; tell(e3, c3, S.tell.commit); assert.equal(c3.hits.length, 0, 'out of it when it lands'); assert.equal(e3.mode, 'stuck', 'A11: a Cleave committed on you and dodged goes into the floor');
    assert.ok(e3.open >= S.stuckT - 0.1, 'and he is open ~1.5 s: ' + e3.open); assert.equal(U.bkHurt(e3, 10, X - 30), Math.round(10 * S.openMul), 'stuck, he takes more');
    tell(e3, c3, S.stuckT + 0.5); assert.notEqual(e3.mode, 'stuck', 'he wrenches it free');
    const D = { x: X - 40, y: A.floor, dead: false }, e4 = mk(), c4 = bk(D); force(e4, 'cleave', c4); tell(e4, c4, S.tell.cleave - S.tell.commit + 0.05); D.dodge = 0.2; tell(e4, c4, S.tell.commit);
    assert.equal(e4.mode, 'stuck', 'dodging THROUGH it counts as out of it'); assert.equal(c4.hits.length, 0);
    const T2 = { x: X + 40, y: A.floor, dead: false }, e5 = mk({ face: -1 }), c5 = bk(T2); force(e5, 'cleave', c5); tell(e5, c5, S.tell.cleave + 0.05); assert.equal(c5.hits.length, 1, 'he turns to you while he lifts it'); }
  /* THE PLANTED BLADE: a fan of bolts, red, landing round where you stood - three, and five wider in phase two - with gaps to stand in */
  { const P = { x: X - 90, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'blade', c);
    assert.equal(e.boltAt.length, S.bolts, 'three bolts'); const span1 = Math.max(...e.boltAt) - Math.min(...e.boltAt);
    tell(e, c, S.tell.blade + 0.02); assert.equal(e.bolts.length, S.bolts); tell(e, c, S.boltT + 0.4); assert.equal(c.hits.length, 1, 'standing still on the mark, one finds you'); assert.equal(c.hits[0].hard, true, 'no guard turns a bolt');
    const Q = { x: X - 90, y: A.floor, dead: false }, e2 = mk(), c2 = bk(Q); force(e2, 'blade', c2); Q.x = X - 90 + S.gap / 2; tell(e2, c2, S.tell.blade + S.boltT + 0.5); assert.equal(c2.hits.length, 0, 'in the gap between two bolts, nothing');
    const e3 = mk({ phase: 2, hp: UNB.hp.bloodknight * 0.4 }), c3 = bk({ x: X - 90, y: A.floor, dead: false }); force(e3, 'blade', c3); assert.equal(e3.boltAt.length, S.boltsP2, 'phase two: five');
    assert.ok(Math.max(...e3.boltAt) - Math.min(...e3.boltAt) > span1 * 1.4, 'A10: and the fan is WIDER'); }
  /* DEATH GRIP: the chain along the floor - jumped or dodged it passes; caught, you are dragged to his feet and the Cleave follows */
  { const P = { x: X - 120, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'grip', c); tell(e, c, S.tell.grip + 0.6);
    assert.equal(c.hits.length, 1, 'the chain catches a hero on the floor'); assert.equal(c.hits[0].hard, true); assert.ok(Math.abs(P.x - (e.x - 30)) < 4, 'and drags him to his feet: ' + Math.round(P.x - e.x));
    assert.equal(e.mode, 'cleaveTell', 'and the Cleave follows');
    const J = { x: X - 120, y: A.floor - 40, dead: false }, e2 = mk(), c2 = bk(J); force(e2, 'grip', c2); tell(e2, c2, S.tell.grip + 0.6); assert.equal(c2.hits.length, 0, 'jumped, the chain passes under');
    const D = { x: X - 120, y: A.floor, dead: false, dodge: 1 }, e3 = mk(), c3 = bk(D); force(e3, 'grip', c3); tell(e3, c3, S.tell.grip + 0.6); assert.equal(c3.hits.length, 0, 'dodged through, the chain passes'); }
  /* BLOOD BOIL: told where you stand, it boils and cuts while you stay; out of it, nothing */
  { const P = { x: X - 90, y: A.floor, dead: false }, e = mk(), c = bk(P); force(e, 'boil', c); tell(e, c, S.tell.boil + 1.2); assert.ok(c.hits.length >= 2 && c.hits.every(h => h.hard), 'stood in the boil it cuts over and over: ' + c.hits.length);
    const Q = { x: X - 90, y: A.floor, dead: false }, e2 = mk(), c2 = bk(Q); force(e2, 'boil', c2); tell(e2, c2, S.tell.boil - 0.1); Q.x -= S.boilR + 20; tell(e2, c2, 2); assert.equal(c2.hits.filter(h => h.name === 'BLOOD BOIL').length, 0, 'stepped out, it boils empty'); }
  /* DEATH COIL: it seeks you; landing it HEALS him; a guard turns it (no heal); a dodge goes through it; a blade cuts it down */
  { const P = { x: X - 110, y: A.floor, dead: false }, e = mk({ hp: 500 }), c = bk(P); force(e, 'coil', c); tell(e, c, S.tell.coil + 2);
    assert.equal(c.hits.length, 1, 'the coil finds a hero who stands'); assert.equal(c.hits[0].hard, false, 'a shield turns it'); assert.equal(e.hp, 500 + S.coilHeal, 'landed, it heals him ' + S.coilHeal);
    const Q = { x: X - 110, y: A.floor, dead: false }, e2 = mk({ hp: 500 }), c2 = bk(Q, [], { hit: (x, d, hard, name) => { c2.hits.push({ d, hard, name }); return 'blocked'; } }); force(e2, 'coil', c2); tell(e2, c2, S.tell.coil + 2);
    assert.equal(c2.hits.length, 1); assert.equal(e2.hp, 500, 'guarded, it heals him nothing');
    const D = { x: X - 110, y: A.floor, dead: false, dodge: 9 }, e3 = mk({ hp: 500 }), c3 = bk(D); force(e3, 'coil', c3); tell(e3, c3, S.tell.coil + S.coilT + 0.1); assert.equal(c3.hits.length, 0, 'dodging, it goes through'); assert.equal(e3.hp, 500);
    const K = { x: X - 110, y: A.floor, dead: false }, e4 = mk({ hp: 500 }), c4 = bk(K, [], { struck: () => true }); force(e4, 'coil', c4); tell(e4, c4, S.tell.coil + 2); assert.equal(c4.hits.length, 0, 'cut down, it lands nothing'); assert.equal(e4.hp, 500);
    /* it turns, only so fast: it follows a hero who walks off its line */
    const M = { x: X - 150, y: A.floor, dead: false }, e5 = mk(), c5 = bk(M); force(e5, 'coil', c5); tell(e5, c5, S.tell.coil + 0.3); M.x = X - 150 + 40; tell(e5, c5, 2); assert.equal(c5.hits.filter(h => h.name === 'DEATH COIL').length, 1, 'it seeks: a step off its line does not lose it'); }
  /* GRAVE TIDE (phase two): hands up out of the floor along a line toward you, one after another - off the floor, or out of the line */
  { const P = { x: X - 120, y: A.floor, dead: false }, e = mk({ phase: 2 }), c = bk(P); force(e, 'tide', c); assert.ok(e.tideAt.length >= 5, 'a line of hands: ' + e.tideAt.length);
    tell(e, c, S.tell.tide * S.p2 + 1.2); assert.equal(c.hits.length, 1, 'on the floor in its line, one hand holds and tears'); assert.equal(c.hits[0].hard, true);
    const J = { x: X - 120, y: A.floor - 40, dead: false }, e2 = mk({ phase: 2 }), c2 = bk(J); force(e2, 'tide', c2); tell(e2, c2, S.tell.tide * S.p2 + 1.2); assert.equal(c2.hits.length, 0, 'off the floor, the hands find nothing');
    const B = { x: X + 60, y: A.floor, dead: false }, e3 = mk({ phase: 2, face: -1 }), c3 = bk(B); force(e3, 'tide', c3); B.x = X - 60; tell(e3, c3, S.tell.tide * S.p2 + 1.2); assert.equal(c3.hits.filter(h => h.name === 'GRAVE TIDE').length, 0, 'stepped round behind him, out of its line, nothing'); }
  /* THE PASSING: he reads a heavy wound up within reach and passes it SOME of the time - never every time - and comes out of it with a cut */
  { let passed = 0, read = 0; const N = 60;
    for (let s = 1; s <= N; s++) { const P = { x: X - 50, y: A.floor, dead: false }, e = mk({ cd: 9, mode: 'stalk' }), W = { charge: 0, atk: -1, combo: 0 }, c = bk(P, [], { rand: seeded(s * 31), heroWind: () => W });
      for (let i = 0; i < 30; i++) { W.charge = i / 60; U.updateBloodKnight(e, 1 / 60, c); if (e.mode === 'pass') break; }
      if (e.reads) read++; if (e.mode === 'pass') { passed++; const x0 = e.x; tell(e, c, S.dodge.t + 0.02); assert.ok(Math.sign(e.x - P.x) !== Math.sign(x0 - P.x) || Math.abs(e.x - P.x) > Math.abs(x0 - P.x), 'the passing goes through you, or off you');
        assert.equal(e.mode, 'swingTell', 'and he comes out of it into a cut'); assert.ok(e.punish); } }
    assert.equal(read, N, 'he reads every heavy wound up within reach'); assert.ok(passed > N * 0.2 && passed < N * 0.8, 'he passes a telegraphed heavy SOME of the time, never always: ' + passed + '/' + N);
    /* never twice running: the cooldown */
    const P = { x: X - 50, y: A.floor, dead: false }, e = mk({ cd: 9 }), W = { charge: 0.5, atk: -1, combo: 0 }, c = bk(P, [], { rand: () => 0, heroWind: () => W }); U.updateBloodKnight(e, 1 / 60, c); assert.equal(e.mode, 'pass');
    tell(e, c, S.dodge.t + S.tell.punish + S.swingRec + 0.55); e.mode = 'stalk'; W.charge = 0; U.updateBloodKnight(e, 1 / 60, c); W.charge = 0.5; U.updateBloodKnight(e, 1 / 60, c); assert.notEqual(e.mode, 'pass', 'not again inside his cooldown');
    /* out of reach he does not pass at all, and a single plain cut (no string) he does not read */
    const F = { x: X - 200, y: A.floor, dead: false }, ef = mk({ cd: 9 }), cf = bk(F, [], { rand: () => 0, heroWind: () => ({ charge: 0.5, atk: -1, combo: 0 }) }); U.updateBloodKnight(ef, 1 / 60, cf); assert.notEqual(ef.mode, 'pass', 'out of reach, no passing');
    const C1 = { x: X - 40, y: A.floor, dead: false }, ec = mk({ cd: 9 }), Wc = { charge: 0, atk: -1, combo: 1 }, cc = bk(C1, [], { rand: () => 0, heroWind: () => Wc }); U.updateBloodKnight(ec, 1 / 60, cc); Wc.atk = 0; U.updateBloodKnight(ec, 1 / 60, cc); assert.notEqual(ec.mode, 'pass', 'a first cut he takes (the string is what he reads)'); }
  /* PRESSED, HE WARDS: blows outside an opening heat him, and pressed hard he may raise the ward */
  { const P = { x: X - 40, y: A.floor, dead: false }, e = mk({ cd: 9 }), c = bk(P, [], { rand: () => 0, heroWind: () => ({ charge: 0, atk: -1, combo: 0 }) }); for (let i = 0; i < S.wardHeat; i++) U.bkHurt(e, 5, X - 30);
    U.updateBloodKnight(e, 1 / 60, c); assert.equal(e.mode, 'wardTell', 'pressed by ' + S.wardHeat + ' blows, he raises the ward'); }
  /* RAISE in phase one is one of his dead; GRAVECALL in phase two up to three; never more than addsMax standing */
  { const adds = [], e = mk(), c = bk({ x: X - 90, y: A.floor, dead: false }, adds); force(e, 'raise', c); tell(e, c, S.tell.raise + 0.02); assert.equal(adds.length, S.raise, 'SUMMON SKELETON: one gets up');
    const e2 = e; e2.phase = 2; force(e2, 'call', c); tell(e2, c, S.tell.call * S.p2 + 0.02); assert.equal(adds.length, S.addsMax, 'GRAVECALL, and never more than three: ' + adds.length);
    force(e2, 'call', c); tell(e2, c, S.tell.call * S.p2 + 0.02); assert.equal(adds.length + 0, S.addsMax, 'still three'); }
  /* A10: at three-fifths he SURGES (told, red) and everything after it comes sooner */
  { const P = { x: X - 50, y: A.floor, dead: false }, e = mk({ cd: 0, hp: UNB.hp.bloodknight * (S.p2At - 0.01) }), c = bk(P); U.updateBloodKnight(e, 0.02, c); assert.equal(e.phase, 2); assert.equal(e.mode, 'surgeTell', 'at ' + S.p2At + ', BLOOD SURGE');
    tell(e, c, S.tell.surge + 0.02); assert.equal(c.hits.length, 1, 'the surge finds a hero close by'); assert.equal(c.hits[0].hard, true);
    const e2 = mk({ phase: 2 }), c2 = bk({ x: X - 40, y: A.floor, dead: false }); force(e2, 'cleave', c2); assert.ok(Math.abs(e2.modeT - S.tell.cleave * S.p2) < 1e-9, 'phase two: the Cleave is told sooner'); }
  /* A3: from a cold start (the spawn case's own fields) both phases reach every move of theirs - a hero who keeps moving, winds up heavies and cuts */
  for (const phase of [1, 2]) { const e = mk({ cd: undefined, phase, mode: phase === 1 ? 'wake' : 'stalk', modeT: 1.2 }); if (phase === 2) { e.hp = e.maxHp * 0.4; e.surged = true; }   /* (he wakes in phase one: phase two starts on its feet) */
    const P = { x: X - 60, y: A.floor, dead: false }, W = { charge: 0, atk: -1, combo: 0 }, adds = [], c = bk(P, adds, { heroWind: () => W }), seen = new Set();
    for (let i = 0; i < 60 * 150; i++) { U.updateBloodKnight(e, 1 / 60, c); seen.add(e.mode); P.x = clamp(e.x + Math.sin(i / 70) * 150, A.x0 + 20, A.x1 - 20); W.charge = (i % 200) > 150 ? ((i % 200) - 150) / 60 : 0; W.atk = (i % 40) < 8 ? (i % 40) / 60 : -1; W.combo = (i / 40 | 0) % 3; if (i % 600 === 0) adds.length = 0; }
    for (const m of phase === 1 ? ['swingTell', 'cleaveTell', 'bladeTell', 'gripTell', 'coilTell', 'boilTell', 'wardTell', 'raiseTell', 'pass'] : ['swingTell', 'cleaveTell', 'tideTell', 'coilTell', 'bladeTell', 'gripTell', 'surgeTell', 'boilTell', 'wardTell', 'callTell', 'pass'])
      assert.ok(seen.has(m), 'phase ' + phase + ' never reached ' + m + ': ' + [...seen]);
    assert.ok(!seen.has(phase === 1 ? 'tideTell' : 'raiseTell'), 'phase ' + phase + ' keeps its own moves (one new move a phase): ' + [...seen]); }
  ok('the death knight', 'his kit only (no rush): string+cleave, blade, grip, boil, coil (heals), tide, ward/nova, passing; full damage; A3, A10, A11, B3'); }

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
