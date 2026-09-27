// undead-mage.js — THE UNDEAD ARCHMAGE, fought in the sky over the Falling Tower from the magic carpet (batch 4,
// 2026-09-21). He FLOATS: e.y is the bottom of his trailing hem, and nothing about him ever stands. Every spell is told
// and every spell can be out-flown; `!` blockable, the red cross (marks.js '!!') unblockable, per the touch rule, and
// touching him never hurts (main.js's contact exclusion list).
//   FIREBOLT     (the first fight's bolt)  aimed; enraged, three          !
//   ICE LANCES   (the first fight's frost) a fan of five                  !
//   STORM        (the first fight's mark)  a column where you were        ✕  leave it
//   POISON CLOUD  slow green orbs that burst into a cloud that poisons you while you are in it (P.venomT): the sky denied
//   DEATH HAND    a black-green hand that homes slowly: out-fly it, or take it on the shield     !
//   DEATH MARK    a ring laid on you that goes off in two seconds         ✕  fly out of it
// THE OPENING IS YOURS (tools/boss-openings.mjs): a DEATH MARK that goes off on nobody comes back on him, and he hangs
// in the air re-gathering for 2.5 s, open, taking double. Left to land on you, the same mark opens nothing.
// ENRAGED (under 40%): he moves and casts 1.6x faster, blinks every ~3 s instead of ~8, casts his spells in pairs, and
// the storm walls close the sky in (carpetBox squeeze).
//
// HIS PORTALS (Falling Tower round 2, docs/briefs/falling-tower-round2.md §3; added, not replacing). His rings (e.rings) come in pairs,
// an ENTRY by him and an EXIT somewhere else, and every one of them has THE DESERT inside it (src/sanctum.js drawDesertOval), the same
// desert the level ends in.
//   THE PORTAL STEP  stepTell  the EXIT ring opens near you and FLARES; then he steps into his entry ring and comes out of the exit
//                    mid-cast - the next spell's tell already half gone. Get out of the flared ring's reach, or dodge through it
//   BENT BOLTS       bendTell  an entry ring by his hand and an exit above or behind you, both glowing the bolt's colour; he casts
//                    into the one and the bolts come out of the other at you, from a new angle                     !
//   THE OPENING IS CAUSED (A11): HIS RINGS WORK BOTH WAYS. Dodge through an open exit ring and you come out beside him: his spell is
//                    broken and he is BREACHED, open for MAGE.breachT at double damage. Left alone, a ring opens nothing.
//   THE STAGES (A10) 1 over 70%: one pair at a time. 2 (70-40%) "HIS RINGS STAY OPEN": rings live 1.6x longer, a spare exit stays
//                    open near you after a step or a bent bolt (three rings at once), and his fire comes out of it. 3 (his enrage)
//                    "HE FIGHTS RING TO RING": his blink is a ring pair, and his fire comes across the room out of a ring behind you.
import { canvas, flipX, whiten } from './px.js';
import { drawDesertOval } from './sanctum.js';
export { bakeUndeadMage, UNDEADMAGE_F } from './redraw/lich.js';

export function smallerFamiliar(s) {
  const scale = c => { const [n, g] = canvas(Math.round(c.width * .7), Math.round(c.height * .7)); g.drawImage(c, 0, 0, n.width, n.height); return n; };
  return { ...s, R: s.R.map(scale), L: s.L.map(scale), white: { R: s.white.R.map(scale), L: s.white.L.map(scale) }, ax: Math.round(s.ax * .7), ay: Math.round(s.ay * .7), w: 39, h: 42 };
}
void flipX; void whiten;

export const MAGE = {
  enrageAt: 0.4, fast: 1.6, blinkEvery: 8, blinkEnraged: 3, openT: 2.5, openMul: 2,
  order: ['fire', 'ice', 'step', 'poison', 'mark', 'bend', 'storm', 'hand', 'step', 'fire', 'mark', 'bend'],
  tell: { fire: 0.9, ice: 0.9, storm: 1.2, poison: 1.0, hand: 0.9, mark: 0.6, step: 1.0, bend: 1.0 },
  dmg: { fire: 14, ice: 12, storm: 22, orb: 8, hand: 16, mark: 28, bent: 13 },
  markR: 36, markFuse: 2.0, cloudR: 26, cloudLife: 4, handSpeed: 72, hover: 1.0, boltV: 150,   /* the bolt is slower than the carpet: every spell can be out-flown */
  /* THE RINGS: stage 2 below 70%; a ring's size; how near you the step's exit opens; how long a used ring stays; the spare's life; the
     breach (the opening a dodge through a ring makes); how far through a ring you come out beside him */
  stage2: 0.7, ringW: 12, ringH: 17, stepNear: 56, ringStay: 0.5, spareLife: 3.2, stayMul: 1.6, breachT: 2.0, beside: 30,
};
const TELL = { fire: 'fireTell', ice: 'iceTell', storm: 'stormTell', poison: 'poisonTell', hand: 'handTell', mark: 'markTell', step: 'stepTell', bend: 'bendTell' };
const SAY = { fireTell: 'FIRE: GUARD OR FLY', iceTell: 'FROST: FLY ACROSS IT', stormTell: 'LIGHTNING: LEAVE THE MARK', poisonTell: 'POISON: KEEP OUT OF THE CLOUD', handTell: 'DEATH: OUT-FLY THE HAND', markTell: 'THE DEATH MARK: FLY OUT OF THE RING',
  stepTell: 'HE OPENS A RING BY YOU', bendTell: 'HIS BOLTS BEND THROUGH THE RINGS' };
export const RING_COL = { rim: '#6fe08a', rimL: '#c8ffd8', fire: '#ff9b49', flare: '#ffffff' };
export const mageOpen = e => e.mode === 'gather' || e.mode === 'breached';
export const mageSpeed = e => e.enraged ? MAGE.fast : 1;
/* HIS STAGE: 1, 2 under 70%, 3 once he burns (his enrage, under 40%) */
export const mageStage = e => e.enraged ? 3 : e.hp <= (e.hp0 || e.maxHp || e.hp) * MAGE.stage2 ? 2 : 1;
/* where he wants to be: well off to one side of you, a little over you, and inside the sky */
function station(e, P, box) {
  let side = Math.sign(e.x - P.x) || 1; if (P.x + side * 120 > box.x1 - 20 || P.x + side * 120 < box.x0 + 20) side = -side;   /* he keeps his side of you, until the sky runs out on it */
  return [Math.max(box.x0 + 20, Math.min(box.x1 - 20, P.x + side * 120)), Math.max(box.y0 + 44, Math.min(box.y1 - 10, P.y - 24))];
}
function blinkTo(e, P, box, rnd) {
  for (let i = 0; i < 12; i++) { const x = box.x0 + 30 + rnd() * (box.x1 - box.x0 - 60), y = box.y0 + 50 + rnd() * Math.max(10, box.y1 - box.y0 - 70); if (Math.hypot(x - P.x, y - P.y) > 110) return [x, y]; }
  return [P.x < (box.x0 + box.x1) / 2 ? box.x1 - 40 : box.x0 + 40, box.y0 + 60];
}
// ---- the rings ----
const inBox = (box, x, y) => [Math.max(box.x0 + 20, Math.min(box.x1 - 20, x)), Math.max(box.y0 + 22, Math.min(box.y1 - 12, y))];
function ring(e, kind, x, y, life, o) { const r = { kind, x, y, t: 0, life, on: 0, glow: null, flare: false, used: false, ...(o || {}) }; e.rings.push(r); return r; }
/* the pair he opens: the entry by him (or by his hand) and the exit where it is wanted. At most THREE open at once (stage 2's spare) */
function pair(e, ex, ey, xx, xy, life) { e.rings = e.rings.filter(r => r.spare && r.t < r.life).slice(-1); const a = ring(e, 'entry', ex, ey, life), b = ring(e, 'exit', xx, xy, life); a.to = b; b.to = a; return [a, b]; }
const stayOf = e => MAGE.ringStay * (mageStage(e) >= 2 ? MAGE.stayMul : 1);
/* stage 2 on: the exit he leaves open is a spare - it stays by you, and his fire can come out of it */
function keepSpare(e, r) { if (mageStage(e) < 2 || !r) return; r.spare = true; r.flare = false; r.glow = null; r.t = 0; r.life = MAGE.spareLife * MAGE.stayMul; }
function begin(e, spell, c, half) {
  const k = mageSpeed(e), P = c.P, py = P.y - 8, box = c.box, st = mageStage(e);
  e.mode = TELL[spell]; e.modeT = MAGE.tell[spell] / k * (half ? 0.5 : 1); e.spell = spell; e.face = Math.sign(P.x - e.x) || 1;
  if (spell === 'storm') e.markX = P.x;                 /* the column is where you were when he raised his hands */
  if (spell === 'step') { const toward = Math.sign(e.x - P.x) || 1, [xx, xy] = inBox(box, P.x + toward * MAGE.stepNear, py - 8);
    const [, b] = pair(e, e.x, e.y - 24, xx, xy, e.modeT + stayOf(e)); b.flare = true; }   /* THE EXIT FLARES FIRST: that is the tell */
  if (spell === 'bend') { const toward = Math.sign(e.x - P.x) || 1, above = ((e.bendN = (e.bendN || 0) + 1) % 2) === 1;
    const [xx, xy] = inBox(box, above ? P.x + ((c.rnd || Math.random)() - 0.5) * 40 : P.x - toward * 64, above ? py - 72 : py - 6);
    const [a, b] = pair(e, e.x + e.face * 16, e.y - 34, xx, xy, e.modeT + stayOf(e)); a.glow = b.glow = RING_COL.fire; }   /* BOTH RINGS GLOW THE BOLT'S COLOUR */
  if (spell === 'fire' && st >= 2) { let r = e.rings.find(q => q.spare && q.kind === 'exit' && q.t < q.life);
    if (st >= 3) { const toward = Math.sign(e.x - P.x) || 1; let far = Math.max(box.x0 + 30, Math.min(box.x1 - 30, P.x - toward * 220)); if (Math.abs(far - P.x) < 100) far = P.x + toward * 220;   /* behind you if the room has it, else past him */
      r = ring(e, 'exit', ...inBox(box, far, py - 10), e.modeT + stayOf(e), { across: true }); }   /* ACROSS THE ROOM, out of a ring behind you */
    if (r) { r.glow = RING_COL.fire; e.fireRing = r; } else e.fireRing = null; }
  c.say(SAY[e.mode], spell === 'storm' || spell === 'mark');
}
/* HIS RINGS WORK BOTH WAYS: a dodge through an open exit ring comes out beside him - his spell broken, he is open */
function breach(e, r, c) {
  const side = Math.sign(c.P.x - e.x) || 1, [bx, by] = inBox(c.box, e.x + side * MAGE.beside, e.y - 26);
  r.used = true; if (c.carry) c.carry(bx, by);
  e.mode = 'breached'; e.modeT = MAGE.breachT; e.open = MAGE.breachT; e.chained = false; e.fireRing = null;
  for (const q of e.rings) { q.life = Math.min(q.life, q.t + 0.3); q.flare = false; }
  c.say('THROUGH HIS OWN RING: HE IS OPEN', true); c.sound('crack');
}
export function updateUndeadMage(e, dt, c) {
  const { P, box, hit, say, sound } = c, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.open = mageOpen(e) ? Math.max(0, e.modeT) : 0;
  e.shots ??= []; e.clouds ??= []; e.rings ??= []; e.turn ??= 0; e.blinkT ??= MAGE.blinkEvery; e.squeeze ??= 0; e.flashT = Math.max(0, (e.flashT || 0) - dt);
  const k = mageSpeed(e), py = P.y - 8;
  if (!e.enraged && e.hp <= e.hp0 * MAGE.enrageAt) { e.enraged = true; e.blinkT = Math.min(e.blinkT, 1); say('HE BURNS. THE SKY CLOSES. HE FIGHTS RING TO RING', true); sound('mageBolt'); }
  if (!e.enraged && !e.stage2 && mageStage(e) === 2) { e.stage2 = true; say('HIS RINGS STAY OPEN', true); sound('mageBolt'); }
  if (e.enraged) e.squeeze = Math.min(1, e.squeeze + dt / 3);
  // ---- his rings: they open, they close, and an open EXIT carries a dodge through it to him ----
  for (const r of e.rings) { r.t += dt; r.on = r.t < r.life ? Math.min(1, r.on + dt * 4) : Math.max(0, r.on - dt * 4); }
  e.rings = e.rings.filter(r => r.t < r.life || r.on > 0);
  if (!P.dead && c.dodging && c.dodging() && e.mode !== 'breached' && e.mode !== 'wake') {
    const r = e.rings.find(q => q.kind === 'exit' && !q.used && q.on >= 0.8 && q.t < q.life && Math.abs(P.x - q.x) < MAGE.ringW + 6 && Math.abs(py - q.y) < MAGE.ringH + 8);
    if (r) breach(e, r, c); }
  // ---- what he has thrown ----
  for (const q of e.shots) {
    q.t -= dt;
    if (q.kind === 'hand') {   /* it turns toward you at a limited rate: a hard turn on the carpet leaves it behind */
      const want = Math.atan2(py - q.y, P.x - q.x); let d = want - q.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      q.a += Math.max(-1.6 * dt, Math.min(1.6 * dt, d)); q.vx = Math.cos(q.a) * q.sp; q.vy = Math.sin(q.a) * q.sp; }
    q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.kind === 'feed') { if (q.t <= 0) q.gone = true; continue; }   /* a bolt going INTO his ring: it is in the other one now */
    if (q.kind === 'orb' && (q.t <= 0 || Math.hypot(P.x - q.x, py - q.y) < 22)) { e.clouds.push({ x: q.x, y: q.y, r: MAGE.cloudR, t: MAGE.cloudLife }); sound('hiss'); q.t = 0; q.gone = true; }
    if (!q.gone && !q.hit && !P.dead && Math.abs(P.x - q.x) < q.r + 6 && Math.abs(py - q.y) < q.r + 9) { hit(q.x, q.y, q.dmg, false, q.kind); q.hit = true; q.t = 0; }
  }
  e.shots = e.shots.filter(q => q.t > 0);
  for (const cl of e.clouds) { cl.t -= dt; if (!P.dead && Math.hypot(P.x - cl.x, py - cl.y) < cl.r) c.venom(); }
  e.clouds = e.clouds.filter(cl => cl.t > 0);
  // ---- the death mark on the air where you were ----
  /* e.deathMark, NOT e.mark: the Death Knight hero's markFoe() writes e.mark = 6 (a number) on whatever he strikes, and a
     number here crashed the fight on `.t` (tools/audit-bosslab, 2026-09-24). Two systems, one field name. */
  if (e.deathMark) { e.deathMark.t -= dt;
    if (e.deathMark.t <= 0) { const m = e.deathMark; e.deathMark = null; e.flashT = 0.3; e.flashX = m.x; e.flashY = m.y; sound('heavy');
      if (!P.dead && Math.hypot(P.x - m.x, py - m.y) < m.r) { hit(m.x, m.y, MAGE.dmg.mark, true, 'mark'); if (e.mode !== 'breached') { e.mode = 'hover'; e.modeT = 0.8 / k; } }
      else if (e.mode !== 'breached') { e.mode = 'gather'; e.modeT = MAGE.openT; e.open = MAGE.openT; say('THE MARK FINDS NO ONE. IT COMES BACK ON HIM', true); sound('crack'); } } }
  // ---- the blink ----
  e.blinkT -= dt;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = MAGE.hover; } return; }
  if (e.mode === 'blinkOut') { if (e.modeT <= 0) { e.x = e.teleX; e.y = e.teleY; e.mode = 'blinkIn'; e.modeT = 0.25 / k; sound('mageBolt'); } return; }
  if (e.mode === 'blinkIn') { if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.35 / k; } return; }
  if (e.mode === 'gather' || e.mode === 'breached') { e.y += Math.sin(e.anim * 2) * 4 * dt; if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.4; e.blinkT = 0; } return; }   /* then he goes: the window closes on a blink */
  if (e.mode === 'markWait') { return; }
  if (e.mode === 'hover') {
    const [tx, ty] = station(e, P, box), sp = 70 * k;
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > 2) { e.x += dx / d * Math.min(d, sp * dt); e.y += dy / d * Math.min(d, sp * dt); }
    e.y += Math.sin(e.anim * 2.3) * 6 * dt; e.face = Math.sign(P.x - e.x) || 1;
    const crowded = Math.hypot(P.x - e.x, py - (e.y - 20)) < 34 && e.blinkT < MAGE.blinkEvery - 3;
    if ((e.blinkT <= 0 || crowded) && e.modeT <= 0.2) { [e.teleX, e.teleY] = blinkTo(e, P, box, rnd); e.mode = 'blinkOut'; e.modeT = 0.55 / k; e.blinkT = e.enraged ? MAGE.blinkEnraged : MAGE.blinkEvery; say('TELEPORT', false);
      if (mageStage(e) >= 3) pair(e, e.x, e.y - 24, e.teleX, e.teleY - 24, e.modeT + 0.3)[1].flare = true;   /* RING TO RING: his blink is a pair of rings now, and its exit works both ways too */
      return; }
    if (e.modeT <= 0) begin(e, MAGE.order[e.turn++ % MAGE.order.length], c);
    return;
  }
  if (e.modeT > 0) { if (e.mode === 'stormTell') e.face = Math.sign(P.x - e.x) || 1; return; }
  // ---- the spell goes ----
  const hx = e.x + e.face * 12, hy = e.y - 34, aim = Math.atan2(py - hy, P.x - hx);
  const shot = (a, sp, r, dmg, kind, col, life = 4, from) => e.shots.push({ x: from ? from.x : hx, y: from ? from.y : hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, sp, r, dmg, kind, col, t: life });
  const spell = e.spell;
  if (spell === 'fire') { const fr = e.fireRing && e.fireRing.t < e.fireRing.life ? e.fireRing : null, a0 = fr ? Math.atan2(py - fr.y, P.x - fr.x) : aim;
    if (fr) shot(Math.atan2(fr.y - hy, fr.x - hx), 260, 4, 0, 'feed', RING_COL.fire, Math.hypot(fr.x - hx, fr.y - hy) / 260);   /* into his hand's glow, out of the ring */
    for (const s of e.enraged ? [-0.24, 0, 0.24] : [0]) shot(a0 + s, MAGE.boltV, 5, MAGE.dmg.fire, 'fire', '#ff9b49', 4, fr); if (fr) fr.glow = null; e.fireRing = null; sound('mageBolt'); }
  else if (spell === 'ice') { for (let i = -2; i <= 2; i++) shot(aim + i * 0.3, 120, 4, MAGE.dmg.ice, 'ice', '#9be2ff');   /* wide enough to fly between two of them */ sound('hiss'); }
  else if (spell === 'storm') { if (!P.dead && Math.abs(P.x - e.markX) < 18) hit(e.markX, py, MAGE.dmg.storm, true, 'storm'); e.flashX = e.markX; e.flashY = null; e.flashT = 0.3; sound('heavy'); }
  else if (spell === 'poison') { for (const s of [-0.5, 0, 0.5]) shot(aim + s, 55, 5, MAGE.dmg.orb, 'orb', '#8fd160', 2.4); sound('hiss'); }
  else if (spell === 'hand') { shot(aim, MAGE.handSpeed * (e.enraged ? 1.3 : 1), 7, MAGE.dmg.hand, 'hand', '#2a4a2a', 4.5); sound('heavy'); }
  else if (spell === 'mark') { e.deathMark = { x: P.x, y: py, r: MAGE.markR, t: MAGE.markFuse / (e.enraged ? 1.25 : 1), T: MAGE.markFuse / (e.enraged ? 1.25 : 1) }; e.mode = 'markWait'; e.modeT = 99; sound('crack'); return; }
  else if (spell === 'step') {   /* HE STEPS THROUGH: out of the exit, mid-cast - the next spell's tell is already half gone */
    const b = e.rings.find(r => r.kind === 'exit' && r.flare && !r.used); if (b) { e.x = b.x; e.y = b.y + 24; b.flare = false; b.life = b.t + stayOf(e); keepSpare(e, b); if (b.to) b.to.life = b.t + 0.2; }
    let next = MAGE.order[e.turn++ % MAGE.order.length]; if (next === 'step' || next === 'bend') next = 'fire';   /* out of a ring, a spell - never another ring */
    sound('mageBolt'); e.chained = false; begin(e, next, c, true); return; }
  else if (spell === 'bend') {   /* INTO ONE RING AND OUT OF THE OTHER: from above you, or from behind */
    const b = e.rings.find(r => r.kind === 'exit' && r.glow && !r.used && !r.spare), a = b && b.to;
    if (b) { const n = mageStage(e) === 1 ? 1 : mageStage(e) === 2 ? 2 : 3, a0 = Math.atan2(py - b.y, P.x - b.x);
      if (a) shot(Math.atan2(a.y - hy, a.x - hx), 260, 4, 0, 'feed', RING_COL.fire, Math.hypot(a.x - hx, a.y - hy) / 260);
      for (let i = 0; i < n; i++) shot(a0 + (i - (n - 1) / 2) * 0.2, MAGE.boltV, 5, MAGE.dmg.bent, 'bent', '#ff9b49', 4, b);
      b.glow = null; if (a) { a.glow = null; a.life = a.t + 0.2; } b.life = b.t + stayOf(e); keepSpare(e, b); }
    sound('mageBolt'); }
  // IN PAIRS when he burns: the next spell's tell straight away, then he drifts
  if (e.enraged && !e.chained) { e.chained = true; begin(e, MAGE.order[e.turn++ % MAGE.order.length], c); return; }
  e.chained = false; e.mode = 'hover'; e.modeT = MAGE.hover / k;
}
export function undeadFrame(e, F) {
  if (e.hurtT > 0) return F.hurt;
  return ({ fireTell: F.fire, iceTell: F.ice, stormTell: F.storm, poisonTell: F.poison, handTell: F.death, markTell: F.death, markWait: F.death, stepTell: F.blinkOut, bendTell: F.fire, blinkOut: F.blinkOut, blinkIn: F.blinkIn, gather: F.open, breached: F.open, wake: F.idle[Math.floor(e.anim * 2.5) % 2] })[e.mode]
    ?? (e.enraged ? F.enraged[Math.floor(e.anim * 4) % 2] : F.idle[Math.floor(e.anim * 2.5) % 2]);
}
/* ONE RING: the desert inside it, and a rim of sparks in his green - the bolt's colour when a bolt is coming through it, and bright and
   fast when it is the exit he is about to step out of (THE FLARE: the tell) */
export function drawMageRing(g, r, cx, cy, time) {
  const k = Math.max(0, Math.min(1, r.on)), rw = Math.round(MAGE.ringW * k), rh = Math.round(MAGE.ringH * k); if (rw < 2 || rh < 2) return;
  const x = Math.round(r.x - cx), y = Math.round(r.y - cy);
  if (r.flare || r.glow) { g.globalCompositeOperation = 'lighter'; g.fillStyle = r.flare ? 'rgba(200,255,220,' + (0.10 + 0.08 * Math.sin(time * 18)).toFixed(3) + ')' : 'rgba(255,155,73,0.14)'; const R = rh + 5, Q = rw + 5; for (let dy = -R; dy <= R; dy++) { const half = Math.round(Q * Math.sqrt(Math.max(0, 1 - (dy / R) * (dy / R)))); if (half > 0) g.fillRect(x - half, y + dy, half * 2, 1); } g.globalCompositeOperation = 'source-over'; }   /* an oval of light round it, not a box */
  drawDesertOval(g, x, y, rw, rh, time, r.x * 0.01);
  const col = r.flare ? (Math.floor(time * 14) % 2 ? RING_COL.flare : RING_COL.rim) : r.glow || RING_COL.rim, n = 24;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + time * (r.flare ? 4 : 1.6) * (r.kind === 'entry' ? -1 : 1);
    g.fillStyle = i % 6 === 0 ? RING_COL.rimL : col; g.fillRect(x + Math.round(Math.cos(a) * (rw + 1)), y + Math.round(Math.sin(a) * (rh + 1)), r.flare ? 2 : 1, r.flare ? 2 : 1); }
}
export function drawUndeadMage(g, e, cx, cy, time) {
  if (!e?.alive) return; g.save();
  for (const r of e.rings || []) drawMageRing(g, r, cx, cy, time);
  if (e.mode === 'blinkOut' && !(e.rings || []).some(r => r.flare)) { g.strokeStyle = Math.floor(time * 10) % 2 ? '#8fffb0' : '#3fe08a'; g.strokeRect(Math.round(e.teleX - cx) - 12, Math.round(e.teleY - cy) - 44, 24, 44); }   /* his destination glows first */
  if (e.mode === 'stormTell' || (e.flashT > 0 && e.flashY === null)) { g.fillStyle = e.mode === 'stormTell' ? 'rgba(210,209,255,.28)' : '#e9e9ff'; g.fillRect(Math.round((e.mode === 'stormTell' ? e.markX : e.flashX) - cx) - 18, 0, 36, g.canvas.height); }
  for (const cl of e.clouds || []) { const a = Math.min(1, cl.t) * 0.5; g.fillStyle = `rgba(110,170,60,${a.toFixed(2)})`; g.beginPath(); g.arc(Math.round(cl.x - cx), Math.round(cl.y - cy), cl.r + Math.sin(time * 3 + cl.x) * 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(166,224,74,${(a * 0.8).toFixed(2)})`; for (let i = 0; i < 6; i++) { const t = time * 0.8 + i; g.fillRect(Math.round(cl.x - cx + Math.cos(t * 1.3 + i) * cl.r * 0.7), Math.round(cl.y - cy + Math.sin(t + i * 2) * cl.r * 0.6), 2, 2); } }
  if (e.deathMark) { const m = e.deathMark, k = 1 - m.t / m.T, r = m.r; g.strokeStyle = Math.floor(time * (6 + k * 14)) % 2 ? '#1a2a1a' : '#6fe08a'; g.lineWidth = 2; g.beginPath(); g.arc(Math.round(m.x - cx), Math.round(m.y - cy), r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(20,40,20,${(0.15 + k * 0.3).toFixed(2)})`; g.beginPath(); g.arc(Math.round(m.x - cx), Math.round(m.y - cy), r * k, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; }
  if (e.flashT > 0 && e.flashY !== null && e.flashY !== undefined) { g.fillStyle = '#d8ffe0'; g.beginPath(); g.arc(Math.round(e.flashX - cx), Math.round(e.flashY - cy), MAGE.markR, 0, Math.PI * 2); g.fill(); }
  for (const q of e.shots || []) { const x = Math.round(q.x - cx), y = Math.round(q.y - cy);
    if (q.kind === 'hand') { g.fillStyle = '#10180f'; g.fillRect(x - 7, y - 5, 14, 10); g.fillStyle = '#3a6a3a'; for (let i = 0; i < 4; i++) g.fillRect(x + Math.round(Math.cos(q.a) * 6) - 6 + i * 4, y - 8 + Math.round(Math.sin(time * 12 + i) * 1.5), 2, 5); g.fillStyle = '#8fffb0'; g.fillRect(x - 2, y - 1, 4, 2); continue; }
    if (q.kind === 'ice') { g.fillStyle = q.col; const ex = Math.round(Math.cos(q.a) * 7), ey = Math.round(Math.sin(q.a) * 7); for (let i = 0; i < 4; i++) g.fillRect(x - Math.round(ex * i / 4) - 1, y - Math.round(ey * i / 4) - 1, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 2, 2); continue; }
    if (q.kind === 'feed') { g.fillStyle = q.col; g.fillRect(x - 2, y - 2, 4, 4); continue; }
    g.fillStyle = q.col; g.fillRect(x - q.r, y - q.r, q.r * 2, q.r * 2); g.fillStyle = q.kind === 'orb' ? '#d8ffb0' : '#fff0c0'; g.fillRect(x - 1, y - 2, 2, 2); }
  g.restore();
}
