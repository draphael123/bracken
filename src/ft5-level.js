// src/ft5-level.js - FALLING TOWER 5, THE LEVEL'S RUNTIME (claude/ft5a; scratch/lane-reports/ft5-plan.md sec 1, 2, 4). Pure: no DOM, no main.js - main.js hands in
// its hands (ctx) on single tagged hook lines, as src/tower-front.js does. tools/fallingtower5.mjs drives all of it headless.
//   THE ROLL       the frame's lean (deg) eases to the act's (1.5 / 3.5 / 5.5, the run 0); IT GOES OVER kicks it to +6 and lets it settle; reduceMotion = 0 (main.js)
//   THE ACTS       a banner as you enter each act (once a life)
//   THE PIECES     told, then done: 'lay' (cases / ribs come down as ledges), 'shear' (the gallery drops two rows, a body on it rides down), 'bell' (after
//                  the Sexton: the deck under it breaks), 'over' (the tip-over), 'say' (the Act I teaser). Every one told >= 1.0 s (the teaser says only)
//   THE PEEL       Outer Face planks under the Act III poison come off (the top plank never: it is the bend's step)
//   THE POISON     failing stone it has risen past is gone (it does not grow back into the poison); a BRACED LEDGE holds it once a life (a breather)
//   THE SLAB       a floor section that tears loose under weight (told 0.8 s), slides down the lean and is back at its socket 6 s after it went
//   CO-OP          the poison's rubber band follows the LOWEST living human seat, and its touch is tested per seat (main.js asSeat hook)
//   THE FOLLY      his death in THE MAGE'S FOLLY sets the tower going over (follyStep): two lines, the lurch, the roll 0 -> 2.5 - FT5 only
import { SLAB, FOLLY_LINES, FT5_SAY } from './ft5-lines.js';
export { FT5_SAY };

const TS = 16;
export const ROLL = { ease: 1.2, kick: 6, kickT: 1.5 };   /* deg/s the roll eases at; IT GOES OVER: +6 for 1.5 s, then settling to the run's 0 */
export const FOLLY = { line2: 0.8, roll: 2.5, rollT: 1.2, lines: FOLLY_LINES };

const inBox = (b, tx, ty) => tx >= b[0] && tx <= b[1] && ty >= b[2] && ty <= b[3];
const tileOf = P => [Math.floor(P.x / TS), Math.floor((P.y - 1) / TS)];
/* which act (1..4) a tile is in; 0 outside them */
export function actAt(F, tx, ty) { for (const a of (F && F.acts) || []) if (inBox(a.box, tx, ty)) return a.n; return 0; }

/* A LIFE STARTS: every changed tile back (pieces, peel, the failing stone's own tiles), every piece waiting, the slabs at their sockets.
   restore(x, y) puts the built tile back (main.js: grid0). The roll keeps what it shows (a respawn is not a cut). */
export function ft5Reset(L, restore) {
  const F = L && L.ft5; if (!F) return;
  if (F.rt && restore) for (const k of F.rt.changed.keys()) { const [x, y] = k.split(',').map(Number); restore(x, y); }
  if (restore) for (const c of L.crumbles || []) for (let y = c.row; y < c.row + (c.rows || 1); y++) for (let x = c.x0; x <= c.x1; x++) restore(x, y);
  for (const m of L.moversExtra || []) if (m.ft5 === 'slab') slabReset(m);
  const roll = F.rt ? F.rt.roll : F.roll0;
  F.rt = { act: 0, roll, kickT: 0, changed: new Map(), peeled: {}, breathed: {}, said: {}, pieces: Object.fromEntries((F.pieces || []).map(p => [p.id, { st: 'wait', t: 0 }])) };
}
/* ONE FRAME. c: { set(x, y, t), tile(x, y), T, say(s), sound(k), shake(n), dust(x, y, n), onMover() -> mover|null, sextonDown() -> bool,
   crumbleBreak(x0, x1, row), chases() -> [{ sp, st }], carry(dy), reduce } */
export function ft5Update(L, P, dt, c) {
  const F = L && L.ft5; if (!F) return; if (!F.rt) ft5Reset(L, null);
  const R = F.rt, [tx, ty] = tileOf(P);
  const change = (x, y, t) => { const k = x + ',' + y; if (!R.changed.has(k)) R.changed.set(k, c.tile(x, y)); c.set(x, y, t); };
  // ---- THE ACTS and THE ROLL ----
  const n = P.dead ? 0 : actAt(F, tx, ty);
  if (n > R.act) { R.act = n; const a = F.acts.find(q => q.n === n); if (a && !R.said[a.say]) { R.said[a.say] = true; c.say(a.say); } }
  R.kickT = Math.max(0, R.kickT - dt);
  const want = R.kickT > 0 ? ROLL.kick : (F.acts.find(q => q.n === R.act) || { roll: F.acts[0].roll }).roll;
  R.roll = R.kickT > 0 && R.roll < want ? Math.min(want, R.roll + ROLL.kick / 0.4 * dt) : ease(R.roll, want, ROLL.ease * dt);
  // ---- THE PIECES ----
  for (const p of F.pieces || []) { const S = R.pieces[p.id]; if (!S || S.st === 'done') continue;
    if (S.st === 'wait') { if (!trigger(p, P, tx, ty, c)) continue; S.st = 'tell'; S.t = p.tell || 0; c.say(p.say); c.shake(p.shake || 3); c.sound(p.kind === 'over' ? 'rumble' : 'crack');
      if (p.kind === 'over') R.kickT = ROLL.kickT + (p.tell || 0); }
    if (S.st === 'tell') { S.t -= dt; if (S.t > 0) continue; S.st = 'done'; apply(L, p, P, c, change); }
  }
  // ---- THE PEEL: Outer Face planks under the Act III poison come off (never the top one) ----
  const chs = c.chases ? c.chases() : [];
  const ch3 = chs.find(q => q.sp.id === (F.outer && F.outer.front));
  if (ch3 && ch3.st.phase === 'run') { const top = F.outer.planks[F.outer.planks.length - 1];
    for (const [x0, len, row] of F.outer.planks) { const k = x0 + ',' + row; if (R.peeled[k] || row === top[2] || row * TS < ch3.st.pos + 8) continue;
      R.peeled[k] = true; for (let x = x0; x < x0 + len; x++) change(x, row, c.T.AIR); c.dust((x0 + len / 2) * TS, row * TS, 6); } }
  // ---- THE POISON: what it has risen past is gone; a braced ledge holds it ----
  for (const q of chs) { if (!q.sp.ft5 || q.st.phase !== 'run' || q.sp.axis !== 'y') continue; const z = q.sp.zone;
    for (const cr of L.crumbles || []) if (!cr.gone && cr.st !== 'count' && cr.row * TS > q.st.pos + 24 && (!z || (cr.x0 * TS < z[1] && (cr.x1 + 1) * TS > z[0]))) cr.gone = true; }
  for (const b of F.breathers || []) { if (R.breathed[b.id] || P.dead || !P.ground || !inBox(b.box, tx, ty)) continue;
    let held = false; for (const q of chs) if (q.sp.ft5 && q.st.phase === 'run') { q.st.hold = Math.max(q.st.hold || 0, b.hold); held = true; }
    if (held) { R.breathed[b.id] = true; c.say(b.say); } }
}
const ease = (v, to, step) => v < to ? Math.min(to, v + step) : Math.max(to, v - step);
function trigger(p, P, tx, ty, c) {
  if (P.dead) return false;
  if (p.mover) { const m = c.onMover && c.onMover(); return !!m && m.ft5 === p.mover; }
  if (p.after === 'sexton' && !(c.sextonDown && c.sextonDown())) return false;
  return !!p.zone && inBox(p.zone, tx, ty);
}
function apply(L, p, P, c, change) {
  const T = c.T, R = L.ft5.rt;
  if (p.kind === 'lay') for (const [x0, x1, row] of p.lay || []) { for (let x = x0; x <= x1; x++) if (c.tile(x, row) === T.AIR) change(x, row, T.ONEWAY); c.dust((x0 + x1 + 1) * TS / 2, row * TS, 10); }
  if (p.kind === 'shear') { let rode = false;
    for (const [x0, x1, row] of p.ledges) { if (!P.dead && P.ground && Math.abs(P.y - row * TS) < 3 && P.x > x0 * TS - 4 && P.x < (x1 + 1) * TS + 4) rode = true;
      for (let x = x0; x <= x1; x++) { change(x, row, T.AIR); change(x, row + p.rows, T.ONEWAY); } }
    for (const [x0, x1, row] of p.lay || []) for (let x = x0; x <= x1; x++) if (c.tile(x, row) === T.AIR) change(x, row, T.ONEWAY);
    if (rode && c.carry) c.carry(p.rows * TS); }
  if (p.kind === 'bell') { c.crumbleBreak(p.bays[0], p.bays[1], p.deck); if (p.after2) c.say(p.after2); }
  if (p.kind === 'over') c.sound('crack');
  void R;
}
/* ---------------- THE SLAB (a mover: main.js updates it on one hook line and computes its dx/dy so a rider is carried) ---------------- */
export function slabReset(m) { Object.assign(m, { st: 'wait', t: 0, x: m.sx, y: m.sy, vx: 0, vy: 0 }); }
/* riders: how many heroes stand on it now. Returns an event ('tell' | 'go' | 'gone' | 'back') or null */
export function slabStep(m, dt, riders) {
  m.t = (m.t || 0) + dt;
  if (m.st === 'wait') { if (riders > 0) { m.st = 'tell'; m.t = 0; return 'tell'; } return null; }
  if (m.st === 'tell') { if (m.t >= SLAB.tell) { m.st = 'slide'; m.t = 0; m.vx = 0; m.vy = 0; return 'go'; } return null; }
  if (m.st === 'slide') { m.vx += (m.dir || 1) * SLAB.acc * dt; m.vy = Math.min(SLAB.fall * 2, m.vy + SLAB.fall * dt); m.x += m.vx * dt; m.y += m.vy * dt;
    if (m.t >= SLAB.ride) { m.st = 'gone'; m.t = 0; m.y = m.sy + 4000; return 'gone'; } return null; }
  if (m.st === 'gone') { if (m.t >= SLAB.back) { slabReset(m); return 'back'; } return null; }
  return null;
}
/* ---------------- CO-OP: which seat the poison follows, and whom it touches ---------------- */
const along = (sp, s) => sp.axis === 'x' ? s.x : s.y - 7;
/* THE LOWEST living human seat (nobody is left in it): the one least far along the chase */
export function leadHero(sp, seats) { let best = null;
  for (const s of seats || []) { if (!s || s.dead || s.ai) continue; const v = along(sp, s); if (best === null || (v - best) * sp.dir < 0) best = v; }
  return best; }
/* after a contact (chaseStep has moved the front back to hero - dir * rubber.min): every living human seat as far back as the one it caught */
export function seatsCaught(sp, st, seats, slack = 8) { const hero = st.pos + sp.dir * sp.rubber.min;
  return (seats || []).filter(s => s && !s.dead && !s.ai && (along(sp, s) - hero) * sp.dir <= slack); }
/* ---------------- THE FOLLY'S END (plan sec 4): his death sets the tower going over. st lives on L (L.follyFt5 is set by level.js only with FT5 on) ---------------- */
export function follyStep(L, dt, c) {
  if (!L || !L.follyFt5) return; const S = L.follyRt || (L.follyRt = { t: 0, said: 0 }); S.t += dt;
  if (S.said === 0) { S.said = 1; c.say(FOLLY.lines[0]); c.shake(5); c.sound('rumble'); c.sound('crack'); c.burst && c.burst(); }
  if (S.said === 1 && S.t >= FOLLY.line2) { S.said = 2; c.say(FOLLY.lines[1]); c.shake(4); c.sound('crack'); }
  L.follyTip = Math.min(FOLLY.roll, FOLLY.roll * S.t / FOLLY.rollT);   /* main.js seaTilt hook: the Folly's frame tips and stays */
}
/* THE FRAME'S TILT for main.js seaTilt (radians come from the caller): the act's roll, none in the boss fight or on a carpet; the Folly's tip once he is dead */
export function tiltOf(L, bossActive, onCarpet) {
  if (L.follyTip) return -L.follyTip;
  if (!L.ft5 || !L.ft5.rt || bossActive || onCarpet) return 0;
  return -(L.ft5.rt.roll || 0);
}
export const SLAB_SAY = 'THE FLOOR TEARS LOOSE: RIDE IT';
