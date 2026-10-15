// src/fog-wraith.js - THE FOG WRAITH, THE TOWPATH's one brand-new foe (claude/towpath2, Daniel 10-10: "at least one unique enemy type, better use of
// fog"; scratch/brief-towpath2.md section 3; design standard A9: the level's ONE new type, the rest reskins). The greybox: its AI, its take, its look.
//
// WHAT IT IS: a drifting shape of the fog that lies on the low water - a hood and two long arms, no legs, the fog bank's own stuff. It LIVES IN THE FOG
//   BANKS (src/towpath-hands.js fogTop): it never rises above a bank's top edge, so a lock filled - you lifted out of the fog - leaves it under you, and a
//   lock drained brings you down to it. The lock choice decides where you meet them.
// SOLID ONLY IN LIGHT. Dim (no lantern's light, no lamp's on it) it is fog: it drifts THROUGH you - a small CHILL (a drain: hp only, no stagger, no
//   flinch, no knock: design standard A13) - and nothing you swing finds it (the blow passes through: "ONLY FOG: LIGHT IT"). Inside your lantern's light or
//   a lamp's it HARDENS (drawn: the edges sharpen, the eyes glow) and a blade cuts it.
// IT SMOTHERS YOUR LANTERN: close to a LIT hero it reaches for the flame (told: a yellow ! and the long arm out toward it, WRAITH.smother s) - in your light
//   it is solid then, so CUT IT while it reaches, or raise your guard toward it and the flame is shielded (the yellow !'s answer); let it close and your
//   lantern goes out (E lights it again) and the thing is fog once more.
// PURE: no DOM, no main.js. step(e, dt, X) with X = { hero(), heroes(), lightAt(x, y), fogTop(x) (px, or null: no bank here), litOf(pp), smother(pp), guards(pp, e),
//   chill(pp, n), mark(e, txt, col), sfx, hint(key, line) }. take(e, dmg, X) -> the damage that lands (0: it passed through).

import * as ART from './redraw/fog_wraith_art.js';   /* (claude/towpath2art) its look: every frame its own (B16) */
export const WRAITH = { hp: 30, w: 14, h: 20, notice: 150, drift: 30, hardDrift: 14, chill: 5, chillR: 12, chillCd: 1.1, smotherR: 34, smotherTell: 0.8, smotherCd: 3.2,
  hardAt: 0.18, home: 120, below: 6, recoil: 0.6 };

export const isWraith = e => !!e && e.t === 'fogwraith';
export function newWraith(e) { Object.assign(e, { hx: e.x, hy: e.y - 10, y: e.y - 10, mode: 'drift', modeT: 0, noGrav: true, cd: 0, chillCd: 0, smCd: 1.5, hard: 0, anim: Math.random() * 6 }); return e; }
/* is it solid this frame: in a lit lantern's clearing or a lamp's */
export const wraithHard = (e, X) => (X.lightAt ? X.lightAt(e.x, e.y - 4) : 0) > WRAITH.hardAt;

export function stepWraith(e, dt, X) {
  const W = WRAITH; e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.chillCd = Math.max(0, (e.chillCd || 0) - dt); e.smCd = Math.max(0, (e.smCd || 0) - dt); e.recoil = Math.max(0, (e.recoil || 0) - dt); e.rel = Math.max(0, (e.rel || 0) - dt); if (!(e.recoil > 0)) e.shielded = false;
  const hard = wraithHard(e, X); e.hard = hard ? Math.min(1, (e.hard || 0) + dt * 6) : Math.max(0, (e.hard || 0) - dt * 4);
  const top = X.fogTop ? X.fogTop(e.x) : null, roof = top == null ? e.hy - 40 : top + W.below;   /* it cannot leave the fog: never above its bank's top edge */
  const P = nearest(e, X), dx = P ? P.x - e.x : 0, dy = P ? (P.y - 12) - e.y : 0, d = Math.hypot(dx, dy);
  const go = (tx, ty, sp) => { const ex = tx - e.x, ey = ty - e.y, dd = Math.hypot(ex, ey) || 1, k = Math.min(dd, sp * dt); e.x += ex / dd * k; e.y += ey / dd * k; if (e.y < roof) e.y = roof; if (ex) e.face = ex < 0 ? -1 : 1; };
  /* THE SMOTHER: it reaches for a lit lantern (told); it closes, the flame goes out */
  if (e.mode === 'smotherTell') { if (!P || P.dead || !X.litOf(P) || d > W.smotherR + 24) { e.mode = 'drift'; e.smCd = 1.2; return; }
    go(P.x - (Math.sign(dx) || 1) * 10, P.y - 14, W.hardDrift * 0.6);
    if (e.modeT <= 0) { e.mode = 'drift'; e.smCd = W.smotherCd; e.recoil = W.recoil; e.recoil0 = W.recoil;
      if (X.guards && X.guards(P, e)) { e.recoil = W.recoil * 2; e.recoil0 = W.recoil * 2; e.shielded = true; if (X.number) X.number(e.x, e.y, 'YOU SHIELD THE FLAME: IT DRAWS BACK'); return; }   /* (a guard raised toward it: the flame is shielded - the yellow !'s answer) */
      if (X.smother(P)) { e.rel = 0.3; X.sfx && X.sfx.hiss && X.sfx.hiss(); if (X.number) X.number(e.x, e.y, 'IT SMOTHERS YOUR LANTERN: E LIGHTS IT'); } } return; }
  if (!P || P.dead || d > W.notice || (top != null && P.y - 20 < top - 4 && Math.abs(dx) > 40)) {   /* nobody in its fog: back toward where it rose */
    const hx = e.hx + Math.sin(e.anim * 0.7) * 18; go(hx, Math.max(roof, e.hy + Math.sin(e.anim * 1.3) * 4), W.drift * 0.5); return; }
  if (Math.hypot(e.x - e.hx, e.y - e.hy) > W.home && d > 60) { go(e.hx, e.hy, W.drift); return; }
  /* close to a LIT hero: it reaches for the flame */
  if (X.litOf(P) && d < W.smotherR && e.smCd <= 0 && e.recoil <= 0) { e.mode = 'smotherTell'; e.modeT = W.smotherTell; X.mark && X.mark(e, '!', '#ffd36b'); X.sfx && X.sfx.tell && X.sfx.tell(false);
    if (X.number) X.number(e.x, e.y, 'IT REACHES FOR YOUR FLAME: CUT IT WHILE YOUR LIGHT HOLDS IT'); return; }
  /* it drifts at you - slower once your light has it - and, fog, through you */
  if (e.recoil > 0) { go(e.x - (Math.sign(dx) || 1) * 30, e.y - 4, W.drift); return; }
  go(P.x, P.y - 12, hard ? W.hardDrift : W.drift);
  if (!hard && d < W.chillR && e.chillCd <= 0) { e.chillCd = W.chillCd; X.chill(P, W.chill); if (X.number) X.number(e.x, e.y, 'A FOG WRAITH: ONLY LIGHT MAKES IT SOLID'); }
}
function nearest(e, X) { const hs = (X.heroes ? X.heroes() : [X.hero()]).filter(q => q && !q.dead); let best = null, bd = 1e9; for (const q of hs) { const dd = Math.hypot(q.x - e.x, q.y - e.y); if (dd < bd) { bd = dd; best = q; } } return best; }
/* A BLOW ON IT: dim, it is fog - the blade passes through (0); in light it is cut */
export function wraithTake(e, dmg, X) { return wraithHard(e, X) ? dmg : 0; }

/* ================= THE GREYBOX LOOK (the art lane draws it: scratch/brief-towpath2.md section 3) =================
   drawn live (like the ember wisp): a hood and two arms of grey fog, translucent and soft-edged while it is fog; in light, sharp-edged with two glowing eyes.
   The SMOTHER pose: the near arm long and out toward the flame, the hood bowed. g: a 2d context, x/y: its centre-bottom on screen */
export function drawWraith(g, e, x, y, time) { ART.drawWraith(g, e, x, y, time); }
/* THE CARD / THE CORPSE SET: soft (0), hard (1), then the DEATH in four frames (2-5); faced right; L is the flip. A wraith cut down comes apart upward (main.js: a spirit's death) */
export function bakeWraith(canvas, flipX) {
  const W = 30, H = 40, ax = 15, ay = 34;
  const mk = fn => { const [c, g] = canvas(W, H); fn(g); return c; };
  const R = [mk(g => ART.drawWraith(g, { hard: 0, face: 1, anim: 0.5, mode: 'drift' }, ax, ay, 0)), mk(g => ART.drawWraith(g, { hard: 1, face: 1, anim: 0.5, mode: 'drift' }, ax, ay, 0)),
    ...[0.12, 0.38, 0.62, 0.86].map(u => mk(g => ART.drawDeath(g, ax, ay, 1, u)))], L = R.map(c => flipX(c));
  return { R, L, white: { R, L }, ax, ay, w: WRAITH.w, h: WRAITH.h };
}
export const wraithFrame = e => ((e.hard || 0) > 0.5 ? 1 : 0);
