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
import { updateUndeadMage, MAGE, boneSkulls, boneGaps, pullV, orbitWorlds, scriptBand, scriptHits, mageOpen, staffTip, reflectable } from '../src/undead-mage.js';
import { wardUp } from '../src/archmage-acts.js';
import { REALM } from '../src/mage-realms.js';
import { readFileSync } from 'node:fs';
import { carpetBox } from '../src/carpet.js';
import { MARK, ANSWER } from '../src/marks.js';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), A = L.arena, HP = 600;
function rig(o = {}) {
  const P = { x: (A.x0 + A.x1) / 2 - 120, y: (A.y0 + A.floor) / 2, dead: 0, carpet: { hitT: 0 }, dodge: 0, vx: 0, vy: 0 };
  const e = { t: 'undeadmage', alive: true, hp: o.hp ?? HP, hp0: HP, maxHp: HP, mode: 'hover', modeT: 0.3, x: (A.x0 + A.x1) / 2 + 100, y: (A.y0 + A.floor) / 2, face: -1, anim: 0, turn: 0, blinkT: 99, realmN: 3, ...o.e };
  const log = { hits: [], says: [], tells: [], t: 0 };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const c = () => ({ P, A, box: carpetBox(A, 0), rnd, hit: (x, y, d, hard, blow) => log.hits.push({ t: log.t, d, hard, blow }), venom: () => {}, say: m => log.says.push(m), sound: () => {}, dodging: () => false, carry: () => {}, pull: () => {}, leave: () => {}, strike: () => log.strike || null });
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
  const q = r.e.shots.find(s => s.echo); assert.ok(Math.abs(q.x - (ghost.x + ghost.face * MAGE.staff.dx)) < 6, 'the echo does not cast from where he was');
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
// ---- ARCHMAGE3 (claude/archmage3, Daniel 10-04): TWO NEW TOLD MOVES, HIS WARD READS, HIS PHASE CHANGES ARE SET PIECES ----
assert.ok(MAGE.order.includes('orbit') && MAGE.order.includes('script') && MARK['undeadmage|orbitTell'] === '!!' && MARK['undeadmage|scriptTell'] === '!!', 'his orrery and the grave script are not in his order, red !! (nothing turns a world or a line)');
assert.ok(MAGE.tell.orbit >= 1 && MAGE.tell.script >= 1, 'a new move is told for under a second');
{ /* HIS ORRERY: told (the orbits and worlds drawn through the tell), then worlds swing round HIM; between two orbits you are never touched, on one you are */
  const r = rig(); at(r, 'orbit'); let tellAt = -1; r.run(3, () => { if (r.e.mode === 'orbitTell' && tellAt < 0) tellAt = r.log.t; return r.e.orbit && r.e.orbit.live; });
  const O = r.e.orbit; assert.ok(tellAt >= 0 && O && O.live && r.log.t - tellAt >= MAGE.tell.orbit - 0.03, 'his orrery is not told for its tell, then loosed');
  assert.ok(r.log.says.some(m => /ORRERY/.test(m)) && O.worlds.length === 3 && Math.hypot(O.cx - r.e.x, O.cy - (r.e.y - 24)) < 2, 'the orrery is not said, or its worlds are not round him (three in stage 1)');
  assert.ok(new Set(O.worlds.map(w => w.spin)).size === 2, 'every orbit turns the same way');
  const gap = (O.worlds[0].R + O.worlds[1].R) / 2; r.P.x = O.cx + gap; r.P.y = O.cy + 8; const h0 = r.log.hits.length; r.run(MAGE.orbit.secs + 0.2);
  assert.equal(r.log.hits.slice(h0).filter(h => h.blow === 'world').length, 0, 'between two orbits the worlds still hit: there is nowhere to be');
  assert.ok(!r.e.orbit && r.e.mode !== 'orbitWait', 'his orrery does not end');
  const q = rig(); at(q, 'orbit'); q.run(3, () => q.e.orbit && q.e.orbit.live); const O2 = q.e.orbit; q.P.x = O2.cx + O2.worlds[1].R; q.P.y = O2.cy + 8; q.run(MAGE.orbit.secs);
  assert.ok(q.log.hits.some(h => h.blow === 'world' && h.hard && h.d === MAGE.dmg.world), 'sat on an orbit, a world never hits (hard)');
  const s3 = rig({ hp: Math.floor(HP * 0.3) }); s3.e.enraged = true; s3.e.stage2 = true; at(s3, 'orbit'); s3.run(3, () => s3.e.orbit); assert.equal(s3.e.orbit.worlds.length, 4, 'his third stage has no fourth world'); }
{ /* THE GRAVE SCRIPT: told, the whole sky in lines but one dark one that is not yours; in a written line you are hit, in the dark one not; stage 2 writes it twice */
  const r = rig(); at(r, 'script'); let tellAt = -1; r.run(2, () => { if (r.e.mode === 'scriptTell' && tellAt < 0) tellAt = r.log.t; return r.e.mode === 'scriptTell'; });
  const S = r.e.script, mine = scriptBand(S, r.P.y - 8); assert.ok(S && S.safe !== mine && Math.abs(S.safe - mine) >= 2, 'the dark line is the one you are in (or next to it): ' + JSON.stringify([S && S.safe, mine]));
  assert.ok(r.log.says.some(m => /GRAVE SCRIPT/.test(m)) && S.n >= 4, 'the grave script is not said, or the sky is not in lines');
  r.run(MAGE.tell.script + 0.2); assert.ok(r.log.hits.some(h => h.blow === 'script' && h.hard && h.d === MAGE.dmg.script) && r.log.t - tellAt >= MAGE.tell.script - 0.03, 'left in a written line, the script does not hit (hard) after its tell');
  const q = rig(); at(q, 'script'); q.run(2, () => q.e.mode === 'scriptTell'); const S2 = q.e.script; q.P.y = S2.y0 + (S2.safe + 0.5) * S2.h + 8; q.run(MAGE.tell.script + 0.3);
  assert.equal(q.log.hits.filter(h => h.blow === 'script').length, 0, 'in the dark line, the script still hits');
  const t2 = rig({ hp: Math.floor(HP * 0.65) }); t2.e.stage2 = true; at(t2, 'script'); t2.run(5, () => t2.log.t > 0.2 && t2.e.mode === 'hover'); const writes = t2.log.says.filter(m => /GRAVE SCRIPT/.test(m)).length;
  assert.ok(writes >= 2, 'his second stage does not write the script twice: ' + writes); }
{ /* HIS WARD READS: up by default, down while he is open; a turned blow flares it (main.js greedHit, and for his wake and his tear hurtEnemy0) */
  const r = rig(); assert.ok(wardUp(r.e) && !mageOpen(r.e), 'his ward is not up by default');
  r.e.mode = 'gather'; r.e.modeT = 2; r.step(); assert.ok(!wardUp(r.e) && r.e.wardDropT > 0, 'opened, his ward does not come down (and shatter)');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(src.includes("if (e.t === 'undeadmage' && e.chipHit === time) { e.wardHitT = LICH.ward.hitT;") && src.includes('e.wardHitY = e.y - 26; SFX.aegis(); }'), 'a blow his ward turns does not flare it and sound it (main.js greedHit)');
  assert.ok(src.includes('drawMageActs(g,boss,'), 'his ward is not drawn (main.js drawMageActs)'); }
{ /* HIS PHASE CHANGES: each realm's tear is its own set piece - its own words, at least two seconds, nothing of his left in the sky through it (a breather) */
  const says = new Set();
  for (let k = 0; k < 3; k++) { const r = rig({ hp: Math.floor(HP * REALM.at[k]), e: { realmN: k } }); r.e.shots = [{ x: r.P.x + 200, y: r.P.y, vx: 0, vy: 0, r: 4, dmg: 9, kind: 'fire', t: 9 }]; r.e.orbit = { cx: 0, cy: 0, worlds: [], t: 0, live: true, cd: 0 };
    let tellAt = -1, cast = 0; r.run(6, () => { if (r.e.mode === 'realmTell') { if (tellAt < 0) tellAt = r.log.t; cast += r.e.shots.length + (r.e.orbit ? 1 : 0) + (r.e.bones ? 1 : 0); } return !!r.e.realm; });
    const T = MAGE.trans[REALM.kinds[k]]; assert.ok(r.e.realm && tellAt >= 0 && T.secs >= 2, REALM.kinds[k] + ': the phase change is not a set piece of 2 s or more');
    assert.equal(cast, 0, REALM.kinds[k] + ': something of his is still in the sky through the phase change (it is a breather)');
    const said = r.log.says.find(m => m === T.say); assert.ok(said && said.includes(REALM.name[REALM.kinds[k]].replace('THE ', '')), REALM.kinds[k] + ': the phase change does not say itself (and its realm)'); says.add(said); }
  assert.equal(says.size, 3, 'two phase changes are the same'); }
// ---- DANIEL'S NOTES 10-05: HIS WARD BROKEN BY HIS OWN BOLT STRUCK BACK; THE HOLD AFTER; YELLOW/RED; LESS HECTIC LATE; THE STAFF ----
{ const r = rig(); at(r, 'fire'); r.run(2, () => r.e.shots.some(q => q.kind === 'fire'));
  const q = r.e.shots.find(s => s.kind === 'fire'), [tx, ty] = staffTip({ ...r.e }); assert.ok(q && reflectable(q), 'his firebolt is not one that can be struck back');
  assert.ok(Math.hypot(q.x - tx, q.y - ty) < 6, 'his bolt does not leave the head of his staff: ' + [q.x, q.y, tx, ty]);
  q.x = r.P.x + 10; q.y = r.P.y - 8; r.log.strike = { l: r.P.x - 4, r: r.P.x + 30, t: r.P.y - 30, b: r.P.y + 2 }; r.step(); r.log.strike = null;
  assert.ok(q.reflected && r.log.says.includes('STRUCK BACK'), 'a blow that meets his firebolt does not strike it back');
  r.run(2, () => mageOpen(r.e)); assert.ok(r.e.mode === 'reflected' && mageOpen(r.e) && r.log.says.some(m => /BREAKS HIS WARD/.test(m)), 'his own bolt struck back does not break his ward: ' + r.e.mode);
  assert.ok(!r.log.hits.some(h => h.blow === 'fire' && r.log.t > 0), 'the struck-back bolt hurt you');
  r.run(MAGE.openT + 0.3, () => !mageOpen(r.e)); r.step(); assert.ok(r.e.wardHold > 0, 'after the opening his ward does not HOLD (the told anti-spam ward)');
  r.e.shots.push({ x: r.e.x - 40, y: r.e.y - 26, vx: 200, vy: 0, a: 0, sp: 200, r: 5, dmg: 14, kind: 'fire', col: '#fff', t: 3, reflected: true }); r.run(0.5);
  assert.ok(!mageOpen(r.e) && r.e.wardHitT > 0, 'while his ward holds, a bolt struck back opens him again (or is not seen to ring off)'); }
{ /* (claude/archmage4) A MARK MISSED WHILE HIS WARD HOLDS rings off it, and he fights on (it left him in markWait for good) */
  const r = rig({ hp: Math.floor(HP * 0.3) }); r.e.enraged = true; r.e.stage2 = true; at(r, 'mark'); r.run(1, () => r.e.mode === 'markWait'); r.e.wardHold = 9;
  r.P.x = r.e.deathMark ? r.e.deathMark.x + 120 : r.P.x; r.run(MAGE.markFuse + 0.2, () => !r.e.deathMark); r.run(1.5);
  assert.ok(r.log.t > 0 && r.e.mode !== 'markWait' && !mageOpen(r.e) && !r.log.hits.some(h => h.blow === 'mark'), 'a mark missed while his ward holds leaves him stuck in ' + r.e.mode + ' (or opens him)'); }
{ const e = rig().e; assert.ok(!reflectable({ kind: 'ice' }) && !reflectable({ kind: 'fire', echo: true }) && !reflectable({ kind: 'bent' }), 'something other than his own firebolt can be struck back'); }
{ /* LESS HECTIC LATE: no echo in his last stage, no spells in pairs */
  const r = rig({ hp: Math.floor(HP * 0.3) }); r.e.enraged = true; r.e.stage2 = true; at(r, 'fire'); let tells = 0, last = '';
  r.run(3, () => { if (/Tell$/.test(r.e.mode) && r.e.mode !== last) tells++; last = r.e.mode; return r.e.shots.some(q => q.kind === 'fire'); }); r.run(0.05);
  assert.ok(!/Tell$/.test(r.e.mode) && !(r.e.echoes || []).length, 'in his last stage he still casts in pairs, or his echo still repeats: ' + r.e.mode); }
console.log('ok  undead-moves  (Daniel 10-05) his firebolt struck back breaks his ward (then it HOLDS, told); only that bolt can be; bolts leave his staff head; his last stage one windup at a time');
console.log('ok  undead-moves  (archmage3) his orrery (told ' + MAGE.tell.orbit + ' s, worlds round him, safe between orbits) and the grave script (told ' + MAGE.tell.script + ' s, every line but a dark one, twice from stage 2); his ward up by default, down and shattered when open, flared and sounded when it turns a blow; three phase changes, each its own set piece and a breather');
console.log('ok  undead-moves  bone storm (told ' + MAGE.tell.bone + ' s, ' + MAGE.bone.n + ' skulls, gaps shown, flown out of untouched, sat in hit; changes every cycle), phylactery echo (stage 2, ' + MAGE.echo.delay + ' s after, from where he cast), grave pull (stage 3 only, told ' + MAGE.tell.pull + ' s, ' + MAGE.pull.v + ' px/s for ' + MAGE.pull.secs + ' s, the void hurts and throws you out)');
