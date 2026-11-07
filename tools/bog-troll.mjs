// tools/bog-troll.mjs - THE BOG TROLL, pure (claude/fenroad; src/bog-troll.js). Node only, a second:
//   B15 floor (never under 0.4x outside his openings; warded 0.4x), STUCK pays x2 up to its purse; under the boards no blow reaches him; the lure (a burst under
//   a standing rotten section = STUCK, under sound boards = up, through his ward = it breaks but does not hold him); phase two at half (the rip, once, told);
//   every told move has its own windup and release pose (B16); the bot steps off a set bulge, jumps the drag, swims out of the fen; his lines are routed.
//   (claude/bogtroll2) THE WAVE SLAP (P1: told at the far edge, the crest throws a hero on the boards, not one in the air) and THE PILING SWING (P2 only: told, the post pulled where
//   the road says, the club's box a standing or ducking hero is in and a jumping one clears); STUCK = PINNED (its own pose); the bot jumps the crest, rolls/jumps the post, fetches + lays planks.
import assert from 'node:assert/strict';
import * as M from '../src/bog-troll.js';
import { POSE } from '../src/bog-troll-hands.js';
import { isCallout } from '../src/hint-lines.js';
const { BT } = M, TS = 16;
const A = { x0: 407 * TS, x1: 450 * TS, floor: 18 * TS, water: 19 * TS, rip: [[419, 421], [434, 436]], w0: 410 * TS, w1: 446 * TS };
const G = M.geom(A, TS); let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const world = (sec = null, log = []) => ({ number: (x, y, t) => log.push(t), sound: () => {}, shake: () => {}, music: () => {}, mark: m => log.push('mark ' + m), fx: k => log.push('fx ' + k), splash: () => {},
  sectionAt: () => sec, collapse: s => { if (s) s.st = 'gone'; log.push('collapse'); return true; }, rip: () => log.push('rip'), hit: (b, d, name) => log.push('hit ' + name), hitHero: () => {} });
const troll = () => ({ x: G.mid, y: G.floorY + BT.up, hp: BT.hp, maxHp: BT.hp, mode: 'up', modeT: 0, face: -1, alive: true });
const hero = x => [{ x, y: G.floorY, ground: true, alive: true }];
// 1. B15
{ const S = M.newFight(G), e = troll();
  ok(M.takeBlow(e, S, 100)[0] === Math.round(100 * BT.hide) && BT.hide >= 0.4, 'his hide: x' + BT.hide + ' (B15 floor 0.4)');
  ok(M.takeBlow(e, S, 100)[1] === M.BT_SAY.hide, 'a turned blow says PEAT HIDE');
  S.ward = 1; ok(M.takeBlow(e, S, 100)[0] === 40 && M.takeBlow(e, S, 100)[1] === 'WARDED', 'warded: x0.4, told'); S.ward = 0;
  e.mode = 'under'; ok(M.takeBlow(e, S, 100)[0] === 0, 'under the boards no blow reaches him (he is out of reach, not warded: the hands never let one through)');
  e.mode = 'stuck'; e.modeT = 3; S.purse = e.maxHp * BT.stuck.cap; ok(M.takeBlow(e, S, 50)[0] === 100, 'STUCK: x2');
  let got = 0; for (let i = 0; i < 40 && e.mode === 'stuck' && e.modeT > 0; i++) got += M.takeBlow(e, S, 50)[0];
  ok(e.modeT === 0 && Math.abs(got + 100 - e.maxHp * BT.stuck.cap) < 2, 'one stuck is worth at most ' + BT.stuck.cap + ' of him, then he tears free (got ' + (got + 100) + ')'); }
// 2. the lure
const burstOn = (sec, ward = 0) => { const S = M.newFight(G), e = troll(), log = []; S.ward = ward; e.mode = 'burstTell'; e.modeT = BT.burst.lock; e.locked = false; e.lockX = e.x; e.x = G.mid;
  for (let f = 0; f < 200 && (e.mode === 'burstTell' || e.mode === 'burst' || e.mode === 'stuckIn'); f++) M.stepTroll(e, S, 1 / 60, hero(e.x + 200), world(sec, log)); return { e, S, log }; };
{ const r = burstOn({ id: 'rot1', st: 'up' }); ok(r.e.mode === 'stuck' && r.log.includes('collapse') && r.S.n.stuck === 1, 'a burst under a standing rotten section: it collapses round him, STUCK (' + r.e.mode + ')'); }
{ const r = burstOn(null); ok(r.e.mode === 'up' && !r.log.includes('collapse'), 'a burst under sound boards: he is up through them, not stuck'); }
{ const r = burstOn({ id: 'rot1', st: 'gone' }); ok(r.e.mode === 'up', 'a burst where the section is already gone: up, not stuck'); }
{ const r = burstOn({ id: 'rot1', st: 'up' }, 2); ok(r.e.mode === 'up' && r.S.n.bounced === 1 && r.log.includes(M.BT_SAY.bounce), 'through his ward the rotten boards break on him but do not hold him (told)'); }
{ const S = M.newFight(G), e = troll(), log = []; e.mode = 'burstTell'; e.modeT = BT.burst.track + BT.burst.lock; e.x = G.mid;
  let lockedAt = null; for (let f = 0; f < 120 && e.mode === 'burstTell'; f++) { const px = G.mid + f * 1.5; M.stepTroll(e, S, 1 / 60, hero(px), world(null, log)); if (e.locked && lockedAt === null) lockedAt = e.lockX; }
  ok(lockedAt !== null && Math.abs(e.x - lockedAt) < 1 && log.includes('mark !!'), 'the bulge follows you, then SETS (red !!) and stays where it set'); }
// 3. phase two: the rip, once, from up
{ const S = M.newFight(G), e = troll(), log = []; e.hp = e.maxHp * 0.49; S.restT = 5;
  for (let f = 0; f < 300; f++) M.stepTroll(e, S, 1 / 60, hero(G.mid + 120), world(null, log));
  ok(S.ph === 2 && log.filter(t => t === 'rip').length === 1 && log.includes(M.BT_SAY.p2) && S.ripped, 'at half he RIPS THE ROAD, once, told (' + log.filter(t => t === 'rip').length + ')'); }
{ const S = M.newFight(G), e = troll(); e.hp = e.maxHp * 0.49; e.mode = 'stuck'; e.modeT = 2; M.stepTroll(e, S, 1 / 60, hero(G.mid + 60), world()); ok(S.ph === 1, 'never through a stuck: the phase waits for him to be up'); }
{ const S = M.newFight(G), e = troll(), log = []; S.ph = 2; S.restT = 0; S.moves = 0; e.mode = 'up';
  let hurls = 0; for (let f = 0; f < 4000; f++) { M.stepTroll(e, S, 1 / 60, hero(G.mid + 190), world(null, log)); if (e.mode === 'hurl' && e.modeT > 0.34) hurls = Math.max(hurls, S.clods.length); }
  ok(hurls === 2, 'his phase-two hurl is two clods (' + hurls + ')'); }
// 4. B16: every told move its own windup and release pose
for (const [w, r] of [['dragTell', 'drag'], ['hurlTell', 'hurl'], ['ripTell', 'rip'], ['stuck', 'heave']]) ok(POSE[w] && POSE[r] && JSON.stringify(POSE[w]) !== JSON.stringify(POSE[r]), 'B16: ' + w + ' and ' + r + ' are two pictures');
for (const m of ['up', 'wake', 'burst', 'stuck', 'sink', 'recover', 'roar']) ok(POSE[m], 'a pose for ' + m);
// 5. the bot
{ const S = M.newFight(G), e = { ...troll(), mode: 'burstTell', locked: true, lockX: 7000, modeT: 0.4 }; const mem = {};
  let o; for (const t of [0, 0.1, 0.2]) o = M.btPlan({ P: { x: 7002, y: G.floorY, ground: true, face: 1, atk: -1 }, e, S, reach: 24, secs: [], holes: [], t, mem, rng: () => 0.5 });
  ok(Math.abs(o.gx - 7002) > BT.burst.r && /step off/.test(o.why), 'the bot steps off a set bulge (' + o.why + ')'); }
{ const S = M.newFight(G), e = { ...troll(), x: 7000, mode: 'dragTell', modeT: 0.1, face: 1 }; const mem = {};
  let o; for (const t of [0, 0.3]) o = M.btPlan({ P: { x: 7060, y: G.floorY, ground: true, face: -1, atk: -1 }, e, S, reach: 24, secs: [], holes: [], t, mem, rng: () => 0.5 });
  ok(o.jump || o.dodge, 'the bot jumps (or rolls) the drag (' + o.why + ')'); }
{ const S = M.newFight(G), e = troll(); const o = M.btPlan({ P: { x: 6900, y: G.floorY + 20, ground: false, face: 1, atk: -1 }, e, S, reach: 24, secs: [], holes: [[6880, 6930]], t: 0, mem: {}, rng: () => 0.5 });
  ok(o.jump && o.swim && (o.gx <= 6876 || o.gx >= 6934), 'in the fen the bot swims for the boards and jumps out (' + o.gx + ')'); }
{ const S = M.newFight(G), e = { ...troll(), mode: 'under' }; const o = M.btPlan({ P: { x: 6700, y: G.floorY, ground: true, face: 1, atk: -1 }, e, S, reach: 24, secs: [{ x0: 413 * TS, x1: 417 * TS, ok: true, bow: 0, hold: 3.6 }], holes: [], t: 0, mem: {}, rng: () => 0.5 });
  ok(o.gx > 413 * TS && o.gx < 417 * TS, 'while he is under, the bot goes and stands on a rotten section (the lure)'); }
// 6. lines routed (hint-shown)
for (const [k, t] of Object.entries(M.BT_SAY)) if (k !== 'hide') ok(isCallout(t), 'routed: ' + t);
// 7. the rip leaves islands every hero can jump between
for (const [a, b] of A.rip) ok(b - a + 1 <= 3, 'a ripped stretch is at most 3 columns of water (48 px: the paladin clears 58)');
// 8. (claude/bogtroll2) THE WAVE SLAP
const hitsOf = log => log.filter(t => typeof t === 'string' && t.startsWith('hit '));
{ const S = M.newFight(G), e = troll(), log = []; S.restT = 0; S.moves = 1; S.sinceWave = BT.wave.every; let tell = false, slap = false, sawWave = false;
  for (let f = 0; f < 600 && !sawWave; f++) { M.stepTroll(e, S, 1 / 60, hero(G.mid - 150), world(null, log)); if (e.mode === 'waveTell') tell = true; if (e.mode === 'waveSlap') slap = true; if (S.wave) sawWave = true; }
  ok(tell && slap && sawWave && log.includes('mark !!') && log.includes(M.BT_SAY.wave), 'THE WAVE SLAP: a dive becomes the slap - told (!!, JUMP THE WAVE), then the wave runs');
  ok(e.x >= G.w1 - BT.wave.edge - 1 || e.x <= G.w0 + BT.wave.edge + 1, 'he surfaces at the crossing\'s edge for it (' + Math.round(e.x / TS) + ')');
  ok(Math.abs(e.x - (G.mid - 150)) > 200, 'the far edge from the hero (the wave has the whole road to be read)'); }
{ /* the crest: a hero standing on the boards is thrown; one in the air over it is not */
  const run = (feetUp) => { const S = M.newFight(G), log = [], boxes = []; S.wave = { x: G.w0 + 30, dir: 1, t: 0, key: 'wvT' }; const w = world(null, log); w.hit = (b, d, name, o) => { if (name === 'wave') boxes.push(b); };
    const hx = G.w0 + 200, hb = { l: hx - 5, r: hx + 5, t: G.floorY - feetUp - 24, b: G.floorY - feetUp }; let hit = false;
    for (let f = 0; f < 200 && S.wave; f++) { M.stepTroll({ mode: 'sleep' }, S, 1 / 60, hero(hx), w); const b = boxes.at(-1); if (b && b[0] < hb.r && b[1] > hb.l && b[2] < hb.b && b[3] > hb.t) hit = true; } return hit; };
  ok(run(0), 'the crest throws a hero standing on the boards'); ok(!run(BT.wave.clear + 2), 'a hero in the air over the crest clears it (JUMP THE WAVE)');
  ok(BT.wave.v * 0.25 < 60 && BT.wave.crest * 2 / BT.wave.v < 0.2, 'the crest passes under you in under 0.2 s: a jump at it clears it'); }
// 9. (claude/bogtroll2) THE PILING SWING (phase two only)
{ const S = M.newFight(G), e = troll(), log = []; S.restT = 0; S.moves = 0; let pile = false; for (let f = 0; f < 3000 && !pile; f++) { M.stepTroll(e, S, 1 / 60, hero(G.mid + 60), world(null, log)); if (e.mode.startsWith('pile')) pile = true; }
  ok(!pile && S.ph === 1, 'phase one never swings the post'); }
{ const S = M.newFight(G), e = troll(), log = [], pulled = []; S.ph = 2; S.restT = 0; S.moves = 0; S.sincePile = BT.pile.every + 1; const w = world(null, log); w.postAt = () => 425; w.pull = c => { pulled.push(c); return true; };
  const boxes = []; w.hit = (b, d, name) => { if (name === 'pile') boxes.push(b); };
  const seen = new Set(); for (let f = 0; f < 400 && !(seen.has('pileSwing') && e.mode === 'recover'); f++) { M.stepTroll(e, S, 1 / 60, hero(e.x + 60), w); seen.add(e.mode); }
  ok(seen.has('pileTell') && seen.has('pileWind') && seen.has('pileSwing') && log.includes('mark !!') && log.includes(M.BT_SAY.post), 'THE PILING SWING: told (!!, HE WRENCHES A POST OUT), wound back, swung');
  ok(pulled.length === 1 && pulled[0] === 425 && S.n.posts === 1, 'the post he wrenches leaves one more gap where the road says (' + pulled + ')');
  const b = boxes[0], stand = { t: G.floorY - 24, b: G.floorY }, duck = { t: G.floorY - 14, b: G.floorY }, jump = { t: G.floorY - BT.pile.top - 26, b: G.floorY - BT.pile.top - 2 };
  const ov = q => b[2] < q.b && b[3] > q.t;
  ok(b && ov(stand) && ov(duck) && !ov(jump) && b[1] - b[0] >= 140, 'the club: a wide arc (' + (b ? Math.round(b[1] - b[0]) : 0) + ' px) a standing or ducking hero is in, a jump clears (roll its i-frames)'); }
// 10. B16 for the new moves + PINNED
for (const [w, r] of [['waveTell', 'waveSlap'], ['pileTell', 'pileSwing'], ['pileWind', 'pileSwing']]) ok(POSE[w] && POSE[r] && JSON.stringify(POSE[w]) !== JSON.stringify(POSE[r]), 'B16: ' + w + ' and ' + r + ' are two pictures');
ok(POSE.stuck.pinned && POSE.pileWind.post === 'wind' && POSE.pileSwing.post === 'swing', 'STUCK is drawn PINNED (the beams on his shoulders); the post is in his fists');
// 11. (claude/bogtroll2) the bot: the crest, the post, the planks
{ const S = M.newFight(G), e = troll(); S.wave = { x: 7000, dir: 1, key: 'k' }; const mem = {}; let o;
  for (const t of [0, 0.1, 0.2]) o = M.btPlan({ P: { x: 7025, y: G.floorY, ground: true, face: 1, atk: -1 }, e, S, reach: 24, secs: [], holes: [], t, mem, rng: () => 0.5 });
  ok(o.jump && /wave/.test(o.why), 'the bot jumps the wave\'s crest (' + o.why + ')'); }
{ const S = M.newFight(G); S.ph = 2; const e = { ...troll(), x: 7000, mode: 'pileWind', modeT: 0.1, face: 1 }; const mem = {}; let o;
  for (const t of [0, 0.3]) o = M.btPlan({ P: { x: 7050, y: G.floorY, ground: true, face: -1, atk: -1 }, e, S, reach: 24, secs: [], holes: [], t, mem, rng: () => 0.5, dodge: true });
  ok(o.dodge || o.jump, 'the bot rolls (or jumps) the post (' + o.why + ')'); }
{ const S = M.newFight(G), e = { ...troll(), mode: 'up' }; S.restT = 1; const slot = { x0: 428 * TS, x1: 430 * TS };
  let o = M.btPlan({ P: { x: 412 * TS, y: G.floorY, ground: true, face: 1, atk: -1 }, e, S, reach: 24, secs: [], holes: [[slot.x0, slot.x1]], slots: [slot], bundles: [{ x: 408 * TS + 8, y: G.floorY, stock: 2 }], held: false, t: 0, mem: {}, rng: () => 0.5 });
  ok(o.gx === 408 * TS + 8 && /bundle/.test(o.why), 'no rotten section standing: the bot goes for a bank\'s bundle (' + o.why + ')');
  o = M.btPlan({ P: { x: 408 * TS + 10, y: G.floorY, ground: true, face: 1, atk: -1 }, e, S, reach: 24, secs: [], holes: [[slot.x0, slot.x1]], slots: [slot], bundles: [{ x: 408 * TS + 8, y: G.floorY, stock: 2 }], held: false, t: 0, mem: {}, rng: () => 0.5 });
  ok(o.talk, 'at the bundle: E takes a plank');
  o = M.btPlan({ P: { x: slot.x0 - 7, y: G.floorY, ground: true, face: 1, atk: -1 }, e, S, reach: 24, secs: [], holes: [[slot.x0, slot.x1]], slots: [slot], bundles: [], held: true, t: 0, mem: {}, rng: () => 0.5 });
  ok(o.talk && o.face === 1 && !o.atk && !o.jump, 'carried to the broken edge, facing it: E lays it (never a swing, never a jump with it)'); }
{ const S = M.newFight(G), e = troll();   // (claude/bogtroll2b) THE PLANK STUN
  for (const m of ['under', 'burstTell', 'sink', 'sleep', 'wake', 'stuck', 'stuckIn', 'heave', 'ripTell']) { e.mode = m; ok(!M.plankStun(e, S) && e.mode === m, 'a plank does nothing in ' + m + ' (under water / pinned / not up)'); }
  e.mode = 'up'; S.ward = 2; ok(!M.plankStun(e, S), 'warded: no stun'); S.ward = 0;
  e.mode = 'hurlTell'; e.modeT = 0.4; ok(M.plankStun(e, S) && e.mode === 'stun' && e.modeT === BT.stun.t && BT.stun.t === 1.5, 'above water: STUNNED ' + BT.stun.t + ' s (it stops his told move)');
  ok(M.takeBlow(e, S, 100)[0] === Math.round(100 * BT.stun.mul) && BT.stun.mul === 1.5, 'stun: blows x' + BT.stun.mul);
  let got = 0; for (let i = 0; i < 60 && e.mode === 'stun'; i++) got += M.takeBlow(e, S, 60)[0]; ok(got <= e.maxHp * BT.stun.cap + 1 && e.mode === 'stun' && e.modeT === 0, 'the per-stun cap (' + BT.stun.cap + ' of his hp) holds and ends the stun');
  M.stepTroll(e, S, 1 / 60, hero(G.mid + 80), world()); ok(e.mode === 'up', 'then he is back among his moves');
  ok(!M.plankStun(e, S) && S.stunCd > 0, 'and he shrugs a second plank for ' + BT.stun.cd + ' s after');
  const e2 = troll(), S2 = M.newFight(G); e2.mode = 'up'; ok(M.plankStun(e2, S2), 'a fresh fight stuns'); for (let i = 0; i < 60 * 1.6; i++) M.stepTroll(e2, S2, 1 / 60, hero(G.mid + 80), world()); ok(e2.mode !== 'stun', 'the stun runs out by itself in about ' + BT.stun.t + ' s'); }
console.log('ok  bog-troll   ' + n + ' checks: B15 floor 0.4 / warded 0.4 / stuck x2 (purse ' + BT.stuck.cap + '), the lure, the phase-two rip, B16 poses, the bot, routed lines');
