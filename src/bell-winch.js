// src/bell-winch.js - HIGHCROWN'S TWO RULES AS ONE PIECE OF CODE (claude/highcrown3, scratch/lane-reports/hcplan.md sec 7: "the Princess is the 2nd caller, so
// extraction pays now"). Highcrown's rule is EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT; GQ2-MECH (Daniel 11-06 20:19) made both the player's tools:
//   THE BELL LURE   a blow on a bell (any seat) rings it; it has a cooldown (a ring inside it is STILL SWINGING) and a ring heard while the hearer is busy is
//                   queued a moment, then goes stale. Who answers it, and how (the Queen STORMS to it, the Princess FLEES to the hatch under it, her Captain
//                   walks to it), is the caller's.
//   THE GRATE TELL  the column over the bell's grate glows for `tell` s before it drops: told, every time.
//   THE WINCH WAVE  a gate rises for guards and a horn clock runs; N blows on its winch, each inside `win` s of the last, from ANY seat (a slow hand starts
//                   again), drop the gate and keep them out; fail and at the horn they come through, and the gate drops behind them `closeAfter` s later.
// Used by src/gqueen-hands.js (her hall: GQ3.mech) and src/goblin-princess.js (the banquet rehearsal, the battlements' towers, the Princess's bell tower).
// PURE: no ctx, no drawing - state in, verdict out; the callers tell it, sound it and spawn the guards. tools/gprincess.mjs and tools/gq2mech.mjs test it.

/* a blow from this hero on this box, once per blow (the hero's own hitSet keyed by `key`, as every struck thing in main.js is). attackBox: () => the
   current seat's blow box or null; overlap: (a, b) => bool. */
export function struck(attackBox, overlap, P1, box, key) {
  const hb = attackBox ? attackBox() : null;
  if (!hb || !P1 || !P1.hitSet || P1.hitSet.has(key) || !overlap(hb, box)) return false;
  P1.hitSet.add(key); return true;
}

/* ---------- THE BELL ---------- M: { cd, queued, rings }. 'swinging' (inside the cooldown: nothing happens) or 'rung' (heard; queued until t + queue) */
export function ringBell(M, t, cd, queue = 0) {
  if (t < (M.cd || 0)) return 'swinging';
  M.cd = t + cd; M.queued = queue > 0 ? t + queue : 0; M.rings = (M.rings || 0) + 1;
  return 'rung';
}
/* is a queued ring still fresh? (false once it has gone stale: it is cleared) */
export function ringFresh(M, t) { if (!(M.queued > 0)) return false; if (t > M.queued) { M.queued = 0; return false; } return true; }
export function bellReady(M, t) { return t >= (M.cd || 0); }

/* ---------- THE GRATE TELL ---------- the glow as the hearer closes (eta s from the grate) or waits under it (left s of the tell): 0..1, 0 = not told */
export function grateGlow(eta, tell) { return eta >= tell ? 0 : Math.max(0, Math.min(1, 1 - eta / tell)); }
/* under the grate? (x: the hearer, gx: the grate's centre, px) */
export function underGrate(x, gx, under) { return Math.abs(x - gx) < under; }

/* ---------- THE WINCH WAVE ---------- */
export function waveOpen(t, delay, extra = {}) { return { at: t + delay, state: 'open', n: 0, last: -9, closeAt: 0, ...extra }; }
/* a blow on the winch: 'kept' (the gate drops, the wave is kept out) or the count so far. A blow more than `win` s after the last starts again at one. */
export function crankWinch(W, t, need, win) {
  if (!W || W.state !== 'open') return 0;
  W.n = (t - W.last > win ? 0 : W.n) + 1; W.last = t;
  if (W.n >= need) { W.state = 'kept'; return 'kept'; }
  return W.n;
}
/* per frame: 'spawn' when the horn runs out (they come through), 'close' when the gate drops behind them, else null. A crank count that has gone cold resets. */
export function waveTick(W, t, win, closeAfter) {
  if (!W) return null;
  if (W.state === 'open') {
    if (W.n && t - W.last > win) W.n = 0;
    if (t >= W.at) { W.state = 'in'; W.closeAt = t + closeAfter; return 'spawn'; }
  } else if (W.state === 'in' && t >= W.closeAt) { W.state = 'closed'; return 'close'; }
  return null;
}
/* the horn clock left, 0..1 (1 = just opened) */
export function hornLeft(W, t, delay) { return W && W.state === 'open' ? Math.max(0, Math.min(1, (W.at - t) / delay)) : 0; }
/* the guards a wave sends: the base kinds, plus one soldier at 3-4 seats (HCPLAN sec 2 co-op) */
export function waveKinds(kinds, seats) { return seats >= 3 ? kinds.concat(['soldier']) : kinds.slice(); }
