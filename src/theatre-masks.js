// src/theatre-masks.js - THE THEATRE'S MUMMERS SWAP MASKS (claude/theatre4, Daniel 10-05). Pure rules + the mask drawing; src/main.js updateMummer and
// hurtEnemy0 call it for THE MASKWRIGHT'S THEATRE's mummers only (the Harvest Fair's MIME you instead - src/mummer.js MIME, claude/fairfix6 - and never swap).
//
// THE RULE KEPT: a theatre mummer still moves only while nobody looks at it, and what stands in a limelight is SEEN (src/mummer.js, src/theatre-hands.js).
// THE TWIST: every time a mummer is LIT or LOOKED AT afresh (after MASK.blink s unseen - a flick of the eyes is not a new look) it SNAPS ON THE NEXT MASK of
// its round (told: a wooden click, a white flash, the mask drawn big and clear in its own colour, its name over it a moment). Read the mask, answer it:
//   TRAGEDY  pale blue, the down-turned mouth and a tear: IT GUARDS ITS FRONT. A light blow from the side it faces is turned (a clank, GUARDS). Go round -
//            a frozen mummer cannot turn, and a tragedy is slow to turn even when it wakes (MASK.turnT) - or break it with a HELD HEAVY (GUARD BROKEN) or a plunge.
//   COMEDY   gold, the grin: OPEN - but the first blow it sees coming it CARTWHEELS AWAY from (no damage, CARTWHEEL), once a mask. Follow it and cut.
//   VILLAIN  red, the black brows and moustache: a TOLD RED LUNGE OUT OF THE LIGHT - frozen or not, when a hero is near it winds up (!!, MASK.lunge.tell s)
//            and lunges at him (unblockable), once a mask, then stands spent (lungeRecover). Step out of its line (or over it), then cut it.
// A mummer's round starts at its own first mask (the level gives it: { mask: 'comedy' }), so the teach is ordered. State: e.mk (newMask).
export const MASKS = ['tragedy', 'comedy', 'villain'];
export const MASK = {
  blink: 0.6,          // unseen this long, then seen again, is a NEW look (a new mask)
  swapT: 0.45,         // the swap's flash
  nameT: 1.1,          // its name over it
  turnT: 0.5,          // a TRAGEDY is this slow to turn and come on when your back turns (so you can go round it)
  cart: { dist: 56, t: 0.38 },                                        // COMEDY's cartwheel: away from the blow, this far, this fast (out of reach while it flips)
  lunge: { range: 112, tell: 0.7, speed: 280, dist: 84, dmg: 20, recover: 1.0, h: 22 },   // VILLAIN's told lunge
  col: { tragedy: ['#bfd8ff', '#3a4a6a'], comedy: ['#ffd36b', '#6a4a10'], villain: ['#e0302c', '#1a0608'] },
  name: { tragedy: 'TRAGEDY', comedy: 'COMEDY', villain: 'VILLAIN' },
};
/* THE THEATRE'S OWN PLAYER (claude/theatre4, Daniel 10-05: the level was too easy): src/mummer.js's MUMMER with a harder strike and a quicker creep - deadly through
   what it does, never more health (as the fair's FAIR_MUMMER, src/fair-keys.js) */
import { MUMMER } from './mummer.js';
export const TH_MUMMER = { ...MUMMER, dmg: 18, creep: 46 };
export const newMask = (first) => ({ i: Math.max(0, MASKS.indexOf(first || 'tragedy')) - 1, mask: null, seen: false, unseenT: 99, swapT: 0, nameT: 0, n: 0,
  cartUsed: false, lungeUsed: false, cart: null, lunge: null, sayW: '', sayT: 0 });
/* THE LOOK: called every frame with whether any hero (or a lamp) sees it now. Returns 'swap' when it snaps on a new mask */
export function maskLook(m, seen, dt) {
  let ev = null; m.swapT = Math.max(0, m.swapT - dt); m.nameT = Math.max(0, m.nameT - dt); m.sayT = Math.max(0, m.sayT - dt);
  if (seen) { if (!m.seen && m.unseenT >= MASK.blink && !m.lunge && !m.cart) { m.i = (m.i + 1) % MASKS.length; m.mask = MASKS[m.i]; m.n++; m.swapT = MASK.swapT; m.nameT = MASK.nameT; m.cartUsed = false; m.lungeUsed = false; ev = 'swap'; }
    m.unseenT = 0; }
  else m.unseenT += dt;
  m.seen = seen; return ev;
}
/* A BLOW ON IT (fromX: where the blow came from; heavy: a held heavy; plunge: from above). Returns 'guard' (turned), 'cartwheel' (dodged), 'break'
   (a heavy breaks the tragedy's guard: it lands, and the mask is off until the next look) or 'land' */
export function maskBlow(m, x, face, fromX, heavy, plunge) {
  if (!m || !m.mask || m.cart) return m && m.cart ? 'cartwheel' : 'land';
  if (m.mask === 'tragedy') { const front = Math.sign(fromX - x) === (face >= 0 ? 1 : -1) || fromX === x;
    if (!front || plunge) return 'land'; if (heavy) { m.mask = null; return 'break'; } return 'guard'; }
  if (m.mask === 'comedy' && !m.cartUsed) { m.cartUsed = true; m.cart = { t: MASK.cart.t, dir: Math.sign(x - fromX) || -face }; return 'cartwheel'; }
  return 'land';
}
/* THE HELD BEATS: the cartwheel and the lunge run instead of the facing rule's step. s = the mummer's state (src/mummer.js); near = the nearest REAL hero
   ({x, y} or null); canStep(dir). Sets s.vx (px/s) and s.mode; returns { hold, evs } - hold: the facing rule waits this frame */
export function maskStep(m, s, near, dt, canStep) {
  const evs = []; s.vx = 0;
  if (m.cart) { const C = MASK.cart; m.cart.t -= dt; s.mode = 'cartwheel'; if (!canStep || canStep(m.cart.dir)) s.vx = m.cart.dir * C.dist / C.t;
    if (m.cart.t <= 0) { m.cart = null; s.mode = 'still'; s.face = near ? Math.sign(near.x - s.x) || s.face : s.face; evs.push({ t: 'landed' }); } return { hold: true, evs }; }
  const G = MASK.lunge;
  if (!m.lunge && m.mask === 'villain' && !m.lungeUsed && near && Math.abs(near.x - s.x) <= G.range && Math.abs((near.y || 0) - (s.y || 0)) < 40) {
    m.lunge = { ph: 'tell', t: G.tell, dir: Math.sign(near.x - s.x) || s.face, run: 0, hit: false }; s.face = m.lunge.dir; evs.push({ t: 'lungeTell' }); }
  if (!m.lunge) return { hold: false, evs };
  const L = m.lunge; L.t -= dt;
  if (L.ph === 'tell') { s.mode = 'lungeTell'; if (L.t <= 0) { L.ph = 'lunge'; L.t = G.dist / G.speed; evs.push({ t: 'lunge' }); } }
  else if (L.ph === 'lunge') { s.mode = 'lunge'; if (!canStep || canStep(L.dir)) s.vx = L.dir * G.speed; else L.t = 0;
    const x0 = L.dir > 0 ? s.x - 4 : s.x - 18; evs.push({ t: 'lungeBox', box: [x0, x0 + 22, s.y - G.h, s.y], dmg: G.dmg });
    if (L.t <= 0) { L.ph = 'recover'; L.t = G.recover; } }
  else { s.mode = 'lungeRecover'; if (L.t <= 0) { m.lunge = null; m.lungeUsed = true; s.mode = 'still'; evs.push({ t: 'lungeDone' }); } }
  return { hold: true, evs };
}
/* A TRAGEDY IS SLOW TO TURN: unseen for less than MASK.turnT it holds where it stands, facing the way it was (go round it and strike its back) */
export const slowTurn = m => !!m && m.mask === 'tragedy' && !m.seen && m.unseenT < MASK.turnT;

/* ---------- DRAWING: the mask over its face, clear at 1x; the flash of a swap; its name; the word of a turned or dodged blow ---------- */
export function drawMask(g, e, cx, cy, time, text) {
  const m = e.mk; if (!m || !e.alive) return;
  const f = e.face || 1, hx = Math.round(e.x - cx + f * 1), hy = Math.round(e.y - cy - (e.h || 22) + 3), R = Math.round;
  if (m.mask) { const [c, ink] = MASK.col[m.mask];
    g.fillStyle = '#120a10'; g.fillRect(hx - 5, hy - 1, 10, 10);                  /* a dark edge, so the mask reads against any room */
    g.fillStyle = c; g.fillRect(hx - 4, hy, 8, 8); g.fillRect(hx - 3, hy + 8, 6, 1);
    g.fillStyle = ink;
    if (m.mask === 'tragedy') { g.fillRect(hx - 3, hy + 3, 2, 1); g.fillRect(hx + 1, hy + 3, 2, 1); g.fillRect(hx - 3, hy + 2, 1, 1); g.fillRect(hx + 2, hy + 2, 1, 1);   /* eyes, brows lifted in the middle */
      g.fillRect(hx - 2, hy + 6, 4, 1); g.fillRect(hx - 3, hy + 7, 1, 1); g.fillRect(hx + 2, hy + 7, 1, 1);   /* the mouth turned down */
      g.fillStyle = '#7ab0ff'; g.fillRect(hx + 2, hy + 4, 1, 2); }                                             /* a tear */
    else if (m.mask === 'comedy') { g.fillRect(hx - 3, hy + 3, 2, 1); g.fillRect(hx + 1, hy + 3, 2, 1);
      g.fillRect(hx - 3, hy + 5, 1, 1); g.fillRect(hx + 2, hy + 5, 1, 1); g.fillRect(hx - 2, hy + 6, 4, 1); }   /* the grin turned up */
    else { g.fillRect(hx - 4, hy + 1, 3, 1); g.fillRect(hx + 1, hy + 1, 3, 1); g.fillRect(hx - 2, hy + 2, 1, 1); g.fillRect(hx + 1, hy + 2, 1, 1);   /* brows down in a V */
      g.fillStyle = '#fff6c8'; g.fillRect(hx - 3, hy + 3, 2, 1); g.fillRect(hx + 1, hy + 3, 2, 1);                   /* bright eyes */
      g.fillStyle = ink; g.fillRect(hx - 3, hy + 5, 6, 1); g.fillRect(hx - 4, hy + 6, 1, 1); g.fillRect(hx + 3, hy + 6, 1, 1); }   /* the moustache */
    if (m.mask === 'villain' && m.lunge && m.lunge.ph === 'tell') { g.globalAlpha = 0.35 + 0.35 * Math.sin(time * 30); g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(hx, hy + 4, 9, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (m.mask === 'tragedy' && !m.seen) { g.globalAlpha = 0.6; g.fillStyle = c; g.fillRect(R(e.x - cx + f * 6), R(e.y - cy - 16), 2, 12); g.globalAlpha = 1; }   /* its guard, on the side it faces */
  }
  if (m.swapT > 0) { const k = m.swapT / MASK.swapT; g.globalAlpha = 0.8 * k; g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy + 4, 7 + (1 - k) * 10, 0, 7); g.stroke();
    g.fillStyle = '#ffffff'; g.fillRect(hx - 4, hy, 8, 8); g.globalAlpha = 1; }
  if (text && m.nameT > 0 && m.mask) { g.globalAlpha = Math.min(1, m.nameT / 0.3); text(MASK.name[m.mask], hx, hy - 9, MASK.col[m.mask][0], 'center', 6); g.globalAlpha = 1; }
  else if (text && m.sayT > 0) { g.globalAlpha = Math.min(1, m.sayT / 0.3); text(m.sayW, hx, hy - 9 - R((0.9 - m.sayT) * 10), '#c9d1dc', 'center', 6); g.globalAlpha = 1; }
}
