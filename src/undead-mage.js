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
import { canvas, flipX, whiten } from './px.js';
export { bakeUndeadMage, UNDEADMAGE_F } from './redraw/lich.js';

export function smallerFamiliar(s) {
  const scale = c => { const [n, g] = canvas(Math.round(c.width * .7), Math.round(c.height * .7)); g.drawImage(c, 0, 0, n.width, n.height); return n; };
  return { ...s, R: s.R.map(scale), L: s.L.map(scale), white: { R: s.white.R.map(scale), L: s.white.L.map(scale) }, ax: Math.round(s.ax * .7), ay: Math.round(s.ay * .7), w: 39, h: 42 };
}
void flipX; void whiten;

export const MAGE = {
  enrageAt: 0.4, fast: 1.6, blinkEvery: 8, blinkEnraged: 3, openT: 2.5, openMul: 2,
  order: ['fire', 'ice', 'poison', 'mark', 'storm', 'hand', 'fire', 'mark'],
  tell: { fire: 0.9, ice: 0.9, storm: 1.2, poison: 1.0, hand: 0.9, mark: 0.6 },
  dmg: { fire: 14, ice: 12, storm: 22, orb: 8, hand: 16, mark: 28 },
  markR: 36, markFuse: 2.0, cloudR: 26, cloudLife: 4, handSpeed: 72, hover: 1.0, boltV: 150,   /* the bolt is slower than the carpet: every spell can be out-flown */
};
const TELL = { fire: 'fireTell', ice: 'iceTell', storm: 'stormTell', poison: 'poisonTell', hand: 'handTell', mark: 'markTell' };
const SAY = { fireTell: 'FIRE: GUARD OR FLY', iceTell: 'FROST: FLY ACROSS IT', stormTell: 'LIGHTNING: LEAVE THE MARK', poisonTell: 'POISON: KEEP OUT OF THE CLOUD', handTell: 'DEATH: OUT-FLY THE HAND', markTell: 'THE DEATH MARK: FLY OUT OF THE RING' };
export const mageOpen = e => e.mode === 'gather';
export const mageSpeed = e => e.enraged ? MAGE.fast : 1;
/* where he wants to be: well off to one side of you, a little over you, and inside the sky */
function station(e, P, box) {
  let side = Math.sign(e.x - P.x) || 1; if (P.x + side * 120 > box.x1 - 20 || P.x + side * 120 < box.x0 + 20) side = -side;   /* he keeps his side of you, until the sky runs out on it */
  return [Math.max(box.x0 + 20, Math.min(box.x1 - 20, P.x + side * 120)), Math.max(box.y0 + 44, Math.min(box.y1 - 10, P.y - 24))];
}
function blinkTo(e, P, box, rnd) {
  for (let i = 0; i < 12; i++) { const x = box.x0 + 30 + rnd() * (box.x1 - box.x0 - 60), y = box.y0 + 50 + rnd() * Math.max(10, box.y1 - box.y0 - 70); if (Math.hypot(x - P.x, y - P.y) > 110) return [x, y]; }
  return [P.x < (box.x0 + box.x1) / 2 ? box.x1 - 40 : box.x0 + 40, box.y0 + 60];
}
function begin(e, spell, c) {
  const k = mageSpeed(e); e.mode = TELL[spell]; e.modeT = MAGE.tell[spell] / k; e.spell = spell; e.face = Math.sign(c.P.x - e.x) || 1;
  if (spell === 'storm') e.markX = c.P.x;                 /* the column is where you were when he raised his hands */
  c.say(SAY[e.mode], spell === 'storm' || spell === 'mark');
}
export function updateUndeadMage(e, dt, c) {
  const { P, box, hit, say, sound } = c, rnd = c.rnd || Math.random;
  if (!e.alive || e.mode === 'sleep') return;
  e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.open = mageOpen(e) ? Math.max(0, e.modeT) : 0;
  e.shots ??= []; e.clouds ??= []; e.turn ??= 0; e.blinkT ??= MAGE.blinkEvery; e.squeeze ??= 0; e.flashT = Math.max(0, (e.flashT || 0) - dt);
  const k = mageSpeed(e), py = P.y - 8;
  if (!e.enraged && e.hp <= e.hp0 * MAGE.enrageAt) { e.enraged = true; e.blinkT = Math.min(e.blinkT, 1); say('HE BURNS. THE SKY CLOSES', true); sound('mageBolt'); }
  if (e.enraged) e.squeeze = Math.min(1, e.squeeze + dt / 3);
  // ---- what he has thrown ----
  for (const q of e.shots) {
    q.t -= dt;
    if (q.kind === 'hand') {   /* it turns toward you at a limited rate: a hard turn on the carpet leaves it behind */
      const want = Math.atan2(py - q.y, P.x - q.x); let d = want - q.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      q.a += Math.max(-1.6 * dt, Math.min(1.6 * dt, d)); q.vx = Math.cos(q.a) * q.sp; q.vy = Math.sin(q.a) * q.sp; }
    q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.kind === 'orb' && (q.t <= 0 || Math.hypot(P.x - q.x, py - q.y) < 22)) { e.clouds.push({ x: q.x, y: q.y, r: MAGE.cloudR, t: MAGE.cloudLife }); sound('hiss'); q.t = 0; q.gone = true; }
    if (!q.gone && !q.hit && !P.dead && Math.abs(P.x - q.x) < q.r + 6 && Math.abs(py - q.y) < q.r + 9) { hit(q.x, q.y, q.dmg, false, q.kind); q.hit = true; q.t = 0; }
  }
  e.shots = e.shots.filter(q => q.t > 0);
  for (const cl of e.clouds) { cl.t -= dt; if (!P.dead && Math.hypot(P.x - cl.x, py - cl.y) < cl.r) c.venom(); }
  e.clouds = e.clouds.filter(cl => cl.t > 0);
  // ---- the death mark on the air where you were ----
  if (e.mark) { e.mark.t -= dt;
    if (e.mark.t <= 0) { const m = e.mark; e.mark = null; e.flashT = 0.3; e.flashX = m.x; e.flashY = m.y; sound('heavy');
      if (!P.dead && Math.hypot(P.x - m.x, py - m.y) < m.r) { hit(m.x, m.y, MAGE.dmg.mark, true, 'mark'); e.mode = 'hover'; e.modeT = 0.8 / k; }
      else { e.mode = 'gather'; e.modeT = MAGE.openT; e.open = MAGE.openT; say('THE MARK FINDS NO ONE. IT COMES BACK ON HIM', true); sound('crack'); } } }
  // ---- the blink ----
  e.blinkT -= dt;
  if (e.mode === 'wake') { if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = MAGE.hover; } return; }
  if (e.mode === 'blinkOut') { if (e.modeT <= 0) { e.x = e.teleX; e.y = e.teleY; e.mode = 'blinkIn'; e.modeT = 0.25 / k; sound('mageBolt'); } return; }
  if (e.mode === 'blinkIn') { if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.35 / k; } return; }
  if (e.mode === 'gather') { e.y += Math.sin(e.anim * 2) * 4 * dt; if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = 0.4; e.blinkT = 0; } return; }   /* then he goes: the window closes on a blink */
  if (e.mode === 'markWait') { return; }
  if (e.mode === 'hover') {
    const [tx, ty] = station(e, P, box), sp = 70 * k;
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d > 2) { e.x += dx / d * Math.min(d, sp * dt); e.y += dy / d * Math.min(d, sp * dt); }
    e.y += Math.sin(e.anim * 2.3) * 6 * dt; e.face = Math.sign(P.x - e.x) || 1;
    const crowded = Math.hypot(P.x - e.x, py - (e.y - 20)) < 34 && e.blinkT < MAGE.blinkEvery - 3;
    if ((e.blinkT <= 0 || crowded) && e.modeT <= 0.2) { [e.teleX, e.teleY] = blinkTo(e, P, box, rnd); e.mode = 'blinkOut'; e.modeT = 0.55 / k; e.blinkT = e.enraged ? MAGE.blinkEnraged : MAGE.blinkEvery; say('TELEPORT', false); return; }
    if (e.modeT <= 0) begin(e, MAGE.order[e.turn++ % MAGE.order.length], c);
    return;
  }
  if (e.modeT > 0) { if (e.mode === 'stormTell') e.face = Math.sign(P.x - e.x) || 1; return; }
  // ---- the spell goes ----
  const hx = e.x + e.face * 12, hy = e.y - 34, aim = Math.atan2(py - hy, P.x - hx);
  const shot = (a, sp, r, dmg, kind, col, life = 4) => e.shots.push({ x: hx, y: hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, sp, r, dmg, kind, col, t: life });
  const spell = e.spell;
  if (spell === 'fire') { for (const s of e.enraged ? [-0.24, 0, 0.24] : [0]) shot(aim + s, MAGE.boltV, 5, MAGE.dmg.fire, 'fire', '#ff9b49'); sound('mageBolt'); }
  else if (spell === 'ice') { for (let i = -2; i <= 2; i++) shot(aim + i * 0.3, 120, 4, MAGE.dmg.ice, 'ice', '#9be2ff');   /* wide enough to fly between two of them */ sound('hiss'); }
  else if (spell === 'storm') { if (!P.dead && Math.abs(P.x - e.markX) < 18) hit(e.markX, py, MAGE.dmg.storm, true, 'storm'); e.flashX = e.markX; e.flashY = null; e.flashT = 0.3; sound('heavy'); }
  else if (spell === 'poison') { for (const s of [-0.5, 0, 0.5]) shot(aim + s, 55, 5, MAGE.dmg.orb, 'orb', '#8fd160', 2.4); sound('hiss'); }
  else if (spell === 'hand') { shot(aim, MAGE.handSpeed * (e.enraged ? 1.3 : 1), 7, MAGE.dmg.hand, 'hand', '#2a4a2a', 4.5); sound('heavy'); }
  else if (spell === 'mark') { e.mark = { x: P.x, y: py, r: MAGE.markR, t: MAGE.markFuse / (e.enraged ? 1.25 : 1), T: MAGE.markFuse / (e.enraged ? 1.25 : 1) }; e.mode = 'markWait'; e.modeT = 99; sound('crack'); return; }
  // IN PAIRS when he burns: the next spell's tell straight away, then he drifts
  if (e.enraged && !e.chained) { e.chained = true; begin(e, MAGE.order[e.turn++ % MAGE.order.length], c); return; }
  e.chained = false; e.mode = 'hover'; e.modeT = MAGE.hover / k;
}
export function undeadFrame(e, F) {
  if (e.hurtT > 0) return F.hurt;
  return ({ fireTell: F.fire, iceTell: F.ice, stormTell: F.storm, poisonTell: F.poison, handTell: F.death, markTell: F.death, markWait: F.death, blinkOut: F.blinkOut, blinkIn: F.blinkIn, gather: F.open, wake: F.idle[Math.floor(e.anim * 2.5) % 2] })[e.mode]
    ?? (e.enraged ? F.enraged[Math.floor(e.anim * 4) % 2] : F.idle[Math.floor(e.anim * 2.5) % 2]);
}
export function drawUndeadMage(g, e, cx, cy, time) {
  if (!e?.alive) return; g.save();
  if (e.mode === 'blinkOut') { g.strokeStyle = Math.floor(time * 10) % 2 ? '#8fffb0' : '#3fe08a'; g.strokeRect(Math.round(e.teleX - cx) - 12, Math.round(e.teleY - cy) - 44, 24, 44); }   /* his destination glows first */
  if (e.mode === 'stormTell' || (e.flashT > 0 && e.flashY === null)) { g.fillStyle = e.mode === 'stormTell' ? 'rgba(210,209,255,.28)' : '#e9e9ff'; g.fillRect(Math.round((e.mode === 'stormTell' ? e.markX : e.flashX) - cx) - 18, 0, 36, g.canvas.height); }
  for (const cl of e.clouds || []) { const a = Math.min(1, cl.t) * 0.5; g.fillStyle = `rgba(110,170,60,${a.toFixed(2)})`; g.beginPath(); g.arc(Math.round(cl.x - cx), Math.round(cl.y - cy), cl.r + Math.sin(time * 3 + cl.x) * 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = `rgba(166,224,74,${(a * 0.8).toFixed(2)})`; for (let i = 0; i < 6; i++) { const t = time * 0.8 + i; g.fillRect(Math.round(cl.x - cx + Math.cos(t * 1.3 + i) * cl.r * 0.7), Math.round(cl.y - cy + Math.sin(t + i * 2) * cl.r * 0.6), 2, 2); } }
  if (e.mark) { const m = e.mark, k = 1 - m.t / m.T, r = m.r; g.strokeStyle = Math.floor(time * (6 + k * 14)) % 2 ? '#1a2a1a' : '#6fe08a'; g.lineWidth = 2; g.beginPath(); g.arc(Math.round(m.x - cx), Math.round(m.y - cy), r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = `rgba(20,40,20,${(0.15 + k * 0.3).toFixed(2)})`; g.beginPath(); g.arc(Math.round(m.x - cx), Math.round(m.y - cy), r * k, 0, Math.PI * 2); g.fill(); g.lineWidth = 1; }
  if (e.flashT > 0 && e.flashY !== null && e.flashY !== undefined) { g.fillStyle = '#d8ffe0'; g.beginPath(); g.arc(Math.round(e.flashX - cx), Math.round(e.flashY - cy), MAGE.markR, 0, Math.PI * 2); g.fill(); }
  for (const q of e.shots || []) { const x = Math.round(q.x - cx), y = Math.round(q.y - cy);
    if (q.kind === 'hand') { g.fillStyle = '#10180f'; g.fillRect(x - 7, y - 5, 14, 10); g.fillStyle = '#3a6a3a'; for (let i = 0; i < 4; i++) g.fillRect(x + Math.round(Math.cos(q.a) * 6) - 6 + i * 4, y - 8 + Math.round(Math.sin(time * 12 + i) * 1.5), 2, 5); g.fillStyle = '#8fffb0'; g.fillRect(x - 2, y - 1, 4, 2); continue; }
    if (q.kind === 'ice') { g.fillStyle = q.col; const ex = Math.round(Math.cos(q.a) * 7), ey = Math.round(Math.sin(q.a) * 7); for (let i = 0; i < 4; i++) g.fillRect(x - Math.round(ex * i / 4) - 1, y - Math.round(ey * i / 4) - 1, 3, 3); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 2, 2); continue; }
    g.fillStyle = q.col; g.fillRect(x - q.r, y - q.r, q.r * 2, q.r * 2); g.fillStyle = q.kind === 'orb' ? '#d8ffb0' : '#fff0c0'; g.fillRect(x - 1, y - 2, 2, 2); }
  g.restore();
}
