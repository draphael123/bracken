// tools/undead-moves.mjs - THE UNDEAD ARCHMAGE'S THREE NEW MOVES (claude/archmage2b; Daniel picked all three, 10-02). One new move per stage
// (scratch/design-standard.md B5), every one told, readable, and answered by flying:
//   BONE STORM       stage 1 on (boneTell, a red !!): his skulls are drawn round you as a ring with its GAPS shown, the ring follows you
//                    through the tell and is set where you are when it goes; then it closes in, turning. A hero who stays in the middle is
//                    hit (unblockable); one who flies out along a gap is not. Every cycle of his order changes it: one wide gap, then two
//                    narrow ones turning the other way
//   PHYLACTERY ECHO  stage 2 on: after his fire (and frost, poison, hand, lightning) a ghost of him stays where he cast and casts the same
//                    spell again MAGE.echo.delay s later, at where you are then - never in stage 1, never after a ring move or the mark
//   GRAVE PULL       stage 3 only (pullTell, a red !!): a void opens at the sky's edge behind you; then it drags the carpet toward it for a
//                    few seconds while he goes on casting; touched, it hurts (unblockable) and throws you back out; it never comes before
//                    stage 3 (his order passes over it)
// usage: node tools/undead-moves.mjs
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { updateUndeadMage, MAGE, boneSkulls, boneGaps, pullV } from '../src/undead-mage.js';
import { carpetBox } from '../src/carpet.js';
import { MARK, ANSWER } from '../src/marks.js';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), A = L.arena, HP = 600;
function rig(o = {}) {
  const P = { x: (A.x0 + A.x1) / 2 - 120, y: (A.y0 + A.floor) / 2, dead: 0, carpet: { hitT: 0 }, dodge: 0, vx: 0, vy: 0 };
  const e = { t: 'undeadmage', alive: true, hp: o.hp ?? HP, hp0: HP, maxHp: HP, mode: 'hover', modeT: 0.3, x: (A.x0 + A.x1) / 2 + 100, y: (A.y0 + A.floor) / 2, face: -1, anim: 0, turn: 0, blinkT: 99, realmN: 3, ...o.e };
  const log = { hits: [], says: [], tells: [], t: 0 };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const c = () => ({ P, A, box: carpetBox(A, 0), rnd, hit: (x, y, d, hard, blow) => log.hits.push({ t: log.t, d, hard, blow }), venom: () => {}, say: m => log.says.push(m), sound: () => {}, dodging: () => false, carry: () => {}, pull: () => {}, leave: () => {} });
  let last = '';
  const step = (dt = 1 / 60) => { updateUndeadMage(e, dt, c()); log.t += dt; if (e.mode !== last && /Tell$/.test(e.mode)) log.tells.push([log.t, e.mode]); last = e.mode; };
  const run = (s, each) => { for (let i = 0; i < Math.round(s * 60); i++) { step(); if (each && each()) return true; } return false; };
  return { P, e, log, run, step };
}
const at = (r, spell) => { r.e.turn = MAGE.order.indexOf(spell); r.e.mode = 'hover'; r.e.modeT = 0.05; r.e.blinkT = 99; };
// ---- THE TABLES ----
assert.ok(MAGE.order.includes('bone') && MAGE.order.includes('pull'), 'the bone storm and the grave pull are not in his order: ' + MAGE.order);
assert.ok(MARK['undeadmage|boneTell'] === '!!' && MARK['undeadmage|pullTell'] === '!!', 'the bone storm and the grave pull are not red !! (nothing turns a skull or the void)');
assert.ok(MAGE.tell.bone >= 0.9 && MAGE.tell.pull >= 0.9, 'a new move is told for under 0.9 s: ' + [MAGE.tell.bone, MAGE.tell.pull]);
// ---- BONE STORM ----
{ const r = rig(); at(r, 'bone'); let tellAt = -1, P0 = null;
  r.run(3, () => { if (r.e.mode === 'boneTell' && tellAt < 0) { tellAt = r.log.t; } if (r.e.mode === 'boneTell') { r.P.x += 1; } return r.e.bones && r.e.bones.live; });   /* (it drifts a little through the tell: the ring follows) */
  const B = r.e.bones; assert.ok(tellAt >= 0 && B && B.live, 'he does not tell and loose a bone storm');
  assert.ok(r.log.t - tellAt >= MAGE.tell.bone - 0.03, 'the storm is told for less than its tell');
  assert.ok(Math.abs(B.cx - r.P.x) < 1 && Math.abs(B.cy - (r.P.y - 8)) < 1, 'the ring is not set where you are when it goes');
  assert.ok(r.log.says.some(m => /BONE STORM/.test(m)), 'the storm is not said');
  const sk = boneSkulls(B, 0), gaps = boneGaps(B, 0);
  assert.equal(sk.length, MAGE.bone.n - B.slots.size, 'the ring has the wrong number of skulls'); assert.ok(gaps.length >= 1, 'the ring has no gap');
  assert.ok(sk.every(([x, y]) => Math.abs(Math.hypot(x - B.cx, y - B.cy) - MAGE.bone.r0) < 0.5), 'the skulls do not start on the ring');
  /* stay in the middle: hit, hard, by a skull */
  r.run(MAGE.bone.secs + 0.2); assert.ok(r.log.hits.some(h => h.blow === 'skull' && h.hard && h.d === MAGE.dmg.skull), 'a hero who stays in the middle of the storm is not hit: ' + JSON.stringify(r.log.hits));
  assert.ok(!r.e.bones && r.e.mode !== 'boneWait', 'the storm does not end'); }
{ const r = rig(); at(r, 'bone'); r.run(3, () => r.e.bones && r.e.bones.live); const B = r.e.bones, hits0 = r.log.hits.length;
  /* fly out along the gap at the carpet's speed */
  const sp = 160; r.run(MAGE.bone.secs + 0.2, () => { if (!r.e.bones) return true; const k = r.e.bones.t / MAGE.bone.secs, g = boneGaps(B, Math.min(1, k + 0.15)); const me = Math.atan2(r.P.y - 8 - B.cy, r.P.x - B.cx);
    let best = g[0], bd = 9; for (const a of g) { const d = Math.abs(((a - me) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); if (d < bd) { bd = d; best = a; } }
    const R = MAGE.bone.r0 + (MAGE.bone.r1 - MAGE.bone.r0) * k, tx = B.cx + Math.cos(best) * (R + 40), ty = B.cy + Math.sin(best) * (R + 40), dx = tx - r.P.x, dy = ty - (r.P.y - 8), d = Math.hypot(dx, dy) || 1;
    if (Math.hypot(r.P.x - B.cx, r.P.y - 8 - B.cy) < R + 30) { r.P.x += dx / d * sp / 60; r.P.y += dy / d * sp / 60; } });
  assert.equal(r.log.hits.filter(h => h.blow === 'skull').length, 0, 'flown out through a gap, the storm still hits: there is no way out'); }
{ /* EVERY CYCLE CHANGES: the next time round his order the storm has two gaps and turns the other way */
  const a = rig(); at(a, 'bone'); a.run(3, () => a.e.bones && a.e.bones.live);
  const b = rig(); b.e.turn = MAGE.order.length + MAGE.order.indexOf('bone'); b.e.mode = 'hover'; b.e.modeT = 0.05; b.run(3, () => b.e.bones && b.e.bones.live);
  assert.ok(a.e.bones.spin !== b.e.bones.spin && boneGaps(a.e.bones).length !== boneGaps(b.e.bones).length, 'the storm is the same every cycle'); }
// ---- PHYLACTERY ECHO ----
{ const s1 = rig(); at(s1, 'fire'); s1.run(4); assert.ok(!(s1.e.echoes || []).length && !s1.log.says.some(m => /ECHO/.test(m)), 'his echo comes in stage 1');
  const r = rig({ hp: Math.floor(HP * 0.65) }); r.e.stage2 = true; at(r, 'fire'); let castAt = -1, echoAt = -1, ghost = null;
  r.run(4, () => { if (castAt < 0 && r.e.shots.some(q => q.kind === 'fire' && !q.echo)) castAt = r.log.t; if (castAt >= 0 && !ghost && (r.e.echoes || []).length) ghost = { ...r.e.echoes[0] };
    if (echoAt < 0 && r.e.shots.some(q => q.echo)) echoAt = r.log.t; return echoAt >= 0; });
  assert.ok(castAt >= 0 && echoAt >= 0 && ghost, 'stage 2: his fire is not cast again by his echo');
  assert.ok(Math.abs(echoAt - castAt - MAGE.echo.delay) < 0.05, 'the echo does not cast ' + MAGE.echo.delay + ' s after him: ' + (echoAt - castAt).toFixed(2));
  const q = r.e.shots.find(s => s.echo); assert.ok(Math.abs(q.x - (ghost.x + ghost.face * 12)) < 6, 'the echo does not cast from where he was');
  assert.ok(r.log.says.some(m => /ECHO/.test(m)), 'his echo is not said the first time');
  const m = rig({ hp: Math.floor(HP * 0.65) }); m.e.stage2 = true; at(m, 'mark'); m.run(1.5); assert.ok(!(m.e.echoes || []).length, 'his echo repeats the death mark'); }
// ---- GRAVE PULL ----
{ const r = rig({ hp: Math.floor(HP * 0.6) }); r.e.stage2 = true; r.e.turn = MAGE.order.indexOf('pull') - 1; r.e.mode = 'hover'; r.e.modeT = 0.05; const seen = new Set();
  r.run(1.5, () => { seen.add(r.e.spell); return r.e.mode === 'hover' && r.log.t > 0.5; }); r.run(0.5, () => { seen.add(r.e.spell); });
  assert.ok(!seen.has('pull') && !r.e.void, 'the grave pull comes before stage 3: ' + [...seen]); }
{ const r = rig({ hp: Math.floor(HP * 0.3) }); r.e.enraged = true; r.e.stage2 = true; at(r, 'pull'); let tellAt = -1;
  r.run(3, () => { if (r.e.mode === 'pullTell' && tellAt < 0) tellAt = r.log.t; return r.e.void && r.e.void.live; });
  const V = r.e.void; assert.ok(tellAt >= 0 && V && V.live && r.log.t - tellAt >= MAGE.tell.pull / MAGE.fast - 0.03, 'stage 3: the grave pull is not told (his burning pace) and opened');
  const box = carpetBox(A, 0); assert.ok(V.x <= box.x0 + 8 || V.x >= box.x1 - 8, 'the void does not open at the edge of the sky');
  assert.ok(Math.sign(V.x - r.e.x) === Math.sign(r.P.x - r.e.x), 'the void does not open behind you (your side of him)');
  assert.ok(r.log.says.some(m => /GRAVE/.test(m)), 'the pull is not said');
  const x0 = r.P.x; r.run(1); assert.ok(Math.abs(r.P.x - V.x) < Math.abs(x0 - V.x) - 30, 'the void does not drag you toward it: ' + [x0, r.P.x, V.x]);
  assert.ok(r.e.mode !== 'pullTell', 'he stops casting while the void drags');
  r.P.x = V.x; r.P.y = V.y + 8; r.run(0.1); assert.ok(r.log.hits.some(h => h.blow === 'void' && h.hard && h.d === MAGE.dmg.void) && Math.abs(r.P.x - V.x) > 30, 'touched, the void does not hurt (hard) and throw you back out');
  r.run(MAGE.pull.secs + 0.5); assert.ok(!r.e.void, 'the pull does not end');
  assert.ok(pullV(MAGE.pull.secs) < 160 * 0.5, 'the pull is stronger than half the carpet\'s speed: it cannot be flown against'); }
console.log('ok  undead-moves  bone storm (told ' + MAGE.tell.bone + ' s, ' + MAGE.bone.n + ' skulls, gaps shown, flown out of untouched, sat in hit; changes every cycle), phylactery echo (stage 2, ' + MAGE.echo.delay + ' s after, from where he cast), grave pull (stage 3 only, told ' + MAGE.tell.pull + ' s, ' + MAGE.pull.v + ' px/s for ' + MAGE.pull.secs + ' s, the void hurts and throws you out)');
