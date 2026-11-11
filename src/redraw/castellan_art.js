// src/redraw/castellan_art.js - THE CASTELLAN'S GHOST's art (claude/manorart, the SONNET ART PASS over claude/hollowmanor's greybox; MANOR_SHIPS stays false).
// The Castellan kept the manor's armoury and keeps it still: four suits of armour on four racks, and he wears one at a time. Each set is its own silhouette, so which one is live
// reads at a glance (the live visor burns ghost-green; the greybox POSE table in src/castellan-hands.js is the brief for every angle):
//   THE KNIGHT      broad plate, a flat great helm with a faded red plume, a sword and a KITE SHIELD (its height is the pose: low for a thrust, high for the bash)
//   THE HALBERD     green-grey plate and a tabard, a brimmed kettle helm, a long polearm (the reach the sweep and the chop need)
//   THE DUELIST     slim lilac steel, an open sallet and a feather, a crimson cape that streams, a rapier
//   THE GREATSWORD  huge dark plate, horned helm, spiked pauldrons, a slab of a blade (the whirl blurs it)
// THE GHOST: a pale steward with a ring of keys at his belt - half out of the helm in an opening (p.ghost), rising from a slumped suit when he LEAVES or SWAPS, crossing the hall as a WISP
// (the final's opening), and rising from the heap when he dies. Poses: sleep, wake, walk, recover, every move's windup and release, stumble / stuck (the blade in the floor) / winded
// (breath) / dizzy (stars) / knocked, leave, swap, wisp, dead. Rect-based (px.js primitives only). The boss draws into a scratch sheet so a hit can flash it white.
import { canvas, px, rect, line, circle, ellipse } from '../px.js';
import { MA, drawPile } from './manor_art.js';

const R = Math.round, GHOST = MA.ghost;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
export const SET = {
  knight: { b: '#8a9096', hi: '#c4cad0', lo: '#4a5056', dk: '#2a2e32', trim: '#b09a4a', w: 7, len: 17, blade: '#d8dce0' },
  halberd: { b: '#7a8478', hi: '#b0baa8', lo: '#454e44', dk: '#262c26', trim: '#6a8a5a', w: 6, len: 40, blade: '#c8d0c4' },
  duelist: { b: '#8a7e90', hi: '#c8bcd0', lo: '#4a4252', dk: '#2a2430', trim: '#a04a5a', w: 5, len: 27, blade: '#e8e8f0' },
  greatsword: { b: '#6e6e74', hi: '#a0a0aa', lo: '#32323a', dk: '#18181c', trim: '#4a4a52', w: 9, len: 31, blade: '#b8bcc4' },
  common: { b: '#707880', hi: '#a0a8b0', lo: '#3a4046', dk: '#1e2226', trim: '#6a5a3a', w: 6, len: 15, blade: '#b0b4b8' },
};
const EXTRA = { halberd: 14, greatsword: 10 };   /* the greybox's extra reach (the POSE table's brief) */
const thick = (g, x0, y0, x1, y1, c, w) => { const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) { const o = k - (w >> 1); if (steep) line(g, x0 + o, y0, x1 + o, y1, c); else line(g, x0, y0 + o, x1, y1 + o, c); } };
const ptOf = (ax, ay, f, deg, d) => { const a = deg * Math.PI / 180; return [ax + f * Math.cos(a) * d, ay + Math.sin(a) * d]; };

/* THE WEAPON: its tip stands out `reach` from the shoulder along the angle; the weapon is drawn from there back along itself (a small reach = cocked behind the body) */
function weapon(g, S, set, ax, ay, f, deg, reach, spin, time) {
  const len = S.len, tip = ptOf(ax, ay, f, deg, reach + (EXTRA[set] || 0)), tail = ptOf(tip[0], tip[1], f, deg + 180, len), mk = (tl, tp, alpha, deg) => {
    if (set === 'halberd') { thick(g, tl[0], tl[1], tp[0], tp[1], alpha < 1 ? al('#8a8e90', alpha) : '#8a8e90', 2); const hd = ptOf(tp[0], tp[1], f, deg + 180, 7), sp = ptOf(tp[0], tp[1], f, deg, 6);
      thick(g, hd[0], hd[1], tp[0], tp[1], alpha < 1 ? al(S.blade, alpha) : S.blade, 3); line(g, tp[0], tp[1], sp[0], sp[1], alpha < 1 ? al(S.hi, alpha) : S.hi); const ax2 = hd[0] + Math.sin(deg * Math.PI / 180) * 6 * -1, ay2 = hd[1] + Math.cos(deg * Math.PI / 180) * 6; thick(g, hd[0], hd[1], ax2, ay2, alpha < 1 ? al(S.blade, alpha) : S.blade, 2); return; }
    if (set === 'duelist') { line(g, tl[0], tl[1], tp[0], tp[1], alpha < 1 ? al(S.blade, alpha) : S.blade); px(g, tp[0], tp[1], '#ffffff'); const gd = ptOf(tl[0], tl[1], f, deg, 5); rect(g, gd[0] - 2, gd[1] - 2, 4, 4, alpha < 1 ? al(MA.brass, alpha) : MA.brass); rect(g, gd[0] - 1, gd[1] - 1, 2, 2, '#2a2430'); return; }
    thick(g, tl[0], tl[1], tp[0], tp[1], alpha < 1 ? al(S.blade, alpha) : S.blade, set === 'greatsword' ? 4 : alpha < 1 ? 3 : 2); const gd = ptOf(tl[0], tl[1], f, deg, set === 'greatsword' ? 9 : 5);
    thick(g, tl[0], tl[1], gd[0], gd[1], alpha < 1 ? al('#4a3a2a', alpha) : '#4a3a2a', 2); const cx = gd[0], cy = gd[1], pa = (deg + 90) * Math.PI / 180, cw = set === 'greatsword' ? 6 : 4; line(g, cx - Math.cos(pa) * cw, cy - Math.sin(pa) * cw, cx + Math.cos(pa) * cw, cy + Math.sin(pa) * cw, alpha < 1 ? al(MA.brass, alpha) : MA.brass, 2);
  };
  if (spin) { const sa = time * 20 * 57.3; for (let k = 4; k >= 0; k--) { const d2 = sa - k * 26, t2 = ptOf(ax, ay, f, d2, reach + (EXTRA[set] || 0)), l2 = ptOf(t2[0], t2[1], f, d2 + 180, len); mk(l2, t2, k ? 0.36 - k * 0.07 : 1, d2); } return; }
  mk(tail, tip, 1, deg);
  return ptOf(tail[0], tail[1], f, deg, len * 0.3);
}
/* THE HEAD of a set (hx, hy = the helm's top-centre) */
function helm(g, S, set, hx, hy, f, lit, time, o) {
  if (set === 'knight') { rect(g, hx - 5, hy, 10, 10, S.b); rect(g, hx - 5, hy, 10, 2, S.hi); rect(g, hx - 5, hy, 1, 10, S.hi); rect(g, hx + 4, hy, 1, 10, S.lo); rect(g, hx - 5, hy + 7, 10, 1, S.lo);
    rect(g, hx - 1, hy - 5, 3, 5, '#8a3a3a'); rect(g, hx - 1 - f * 2, hy - 4, 2, 6, '#6a2a2a'); rect(g, hx - 1 - f * 5, hy - 2, 3, 6, '#5a2020'); rect(g, hx - 4 + f * 2, hy + 3, 8, 2, '#0c1010'); rect(g, hx - 1, hy + 3, 2, 6, S.lo); }
  else if (set === 'halberd') { rect(g, hx - 4, hy, 8, 6, S.b); rect(g, hx - 4, hy, 8, 2, S.hi); rect(g, hx - 7, hy + 5, 14, 2, S.hi); rect(g, hx - 7, hy + 6, 14, 1, S.lo); rect(g, hx - 4, hy + 7, 8, 4, S.b); rect(g, hx - 3 + f, hy + 8, 6, 2, '#0c1010'); rect(g, hx - 1, hy + 7, 2, 4, S.lo); px(g, hx, hy - 1, S.trim); }
  else if (set === 'duelist') { rect(g, hx - 3, hy + 1, 7, 9, S.b); rect(g, hx - 3, hy + 1, 7, 2, S.hi); rect(g, hx - 3, hy + 1, 1, 9, S.hi); rect(g, hx - 4 - f * 2, hy + 6, 3, 4, S.lo); rect(g, hx - 2 + f * 2, hy + 5, 4, 2, '#0c1010');
    line(g, hx - f * 2, hy + 1, hx - f * 7, hy - 5, '#c8d0e0'); line(g, hx - f * 2, hy + 2, hx - f * 8, hy - 3, S.trim); px(g, hx - f * 7, hy - 5, '#ffffff'); }
  else if (set === 'greatsword') { rect(g, hx - 6, hy + 1, 12, 11, S.b); rect(g, hx - 6, hy + 1, 12, 2, S.hi); rect(g, hx - 6, hy + 1, 1, 11, S.hi); rect(g, hx + 5, hy + 1, 1, 11, S.lo); rect(g, hx - 6, hy + 8, 12, 1, S.lo);
    for (const s of [-1, 1]) { rect(g, hx + s * 6 - (s < 0 ? 2 : 0), hy - 1, 2, 4, S.hi); rect(g, hx + s * 7 - (s < 0 ? 2 : 0), hy - 4, 2, 4, S.hi); px(g, hx + s * 8 - (s < 0 ? 2 : 0), hy - 5, '#d8dce0'); }
    rect(g, hx - 4 + f * 2, hy + 4, 8, 2, '#0c1010'); rect(g, hx - 1, hy + 6, 2, 6, S.lo); }
  else { rect(g, hx - 4, hy + 1, 8, 9, S.b); rect(g, hx - 4, hy + 1, 8, 2, S.hi); rect(g, hx - 4, hy + 1, 1, 9, S.hi); rect(g, hx - 3 + f, hy + 4, 6, 2, '#0c1010'); rect(g, hx - 1, hy + 6, 2, 4, S.lo); if (o && o.rust) px(g, hx + 2, hy + 3, '#8a5a3a'); }
  const ey = hy + (set === 'knight' ? 3 : set === 'halberd' ? 8 : set === 'duelist' ? 5 : set === 'greatsword' ? 4 : 4), ex0 = hx - 3 + f * 2;
  if (lit) { rect(g, ex0 - 1, ey - 1, 8, 4, al(GHOST, 0.25 + 0.1 * Math.sin(time * 8))); rect(g, ex0, ey, 2, 1, GHOST); rect(g, ex0 + 4, ey, 2, 1, GHOST); px(g, ex0, ey, MA.ghostHi); px(g, ex0 + 4, ey, MA.ghostHi); }
  else { px(g, ex0, ey, '#2a3a32'); px(g, ex0 + 4, ey, '#2a3a32'); }
}
/* A SUIT OF ARMOUR in a pose (feet at x, y; f = facing; set; p = a POSE entry; o: lit, walk (frame), time, rust, broken) */
export function suitArt(g, x, y, f, set, p, o = {}) {
  x = R(x); y = R(y); const S = SET[set] || SET.common, w = S.w, cr = p.crouch || 0, sl = p.slump || 0, ln = (p.lean || 0) * f, t = o.time || 0, fr = o.frame || 0;
  const lg = o.walk ? (fr & 1 ? 2 : -2) : 0, lw = Math.max(3, R(w * 0.55)), top = y - 27 + cr + sl;
  if (set === 'duelist') { const wv = Math.sin(t * 7) * 2; for (let k = 0; k < 18; k++) { const sw = Math.sin(t * 6 + k * 0.4) * (1 + k * 0.12); rect(g, x - f * (w + 1 + (k >> 2)) + ln * 0.5 + sw, top + 1 + k, 3, 1, k < 10 ? '#7a2a3a' : '#5a1e2c'); } rect(g, x - f * (w + 1) + ln * 0.5, top, 3, 2, '#a04a5a'); void wv; }   /* the cape, streaming */
  rect(g, x - lw - 1 + lg, y - 12 + cr, lw, 12 - cr, S.b); rect(g, x + 1 - lg, y - 12 + cr, lw, 12 - cr, S.b); rect(g, x - lw - 1 + lg, y - 12 + cr, 1, 12 - cr, S.hi); rect(g, x + 1 - lg, y - 12 + cr, 1, 12 - cr, S.hi);
  rect(g, x - lw - 1 + lg, y - 7 + cr, lw, 2, S.hi); rect(g, x + 1 - lg, y - 7 + cr, lw, 2, S.hi);   /* knees */
  rect(g, x - lw - 1 + lg + (f > 0 ? 0 : -2), y - 2, lw + 2, 2, S.lo); rect(g, x + 1 - lg + (f > 0 ? 0 : -2), y - 2, lw + 2, 2, S.lo);   /* sabatons */
  rect(g, x - w + 1 + ln * 0.4, y - 15 + cr + sl * 0.5, 2 * w - 2, 4, S.lo); rect(g, x - w + 1 + ln * 0.4, y - 15 + cr + sl * 0.5, 2 * w - 2, 1, S.b);   /* tassets */
  rect(g, x - w + ln * 0.5, top, 2 * w, 13, S.b); rect(g, x - w + ln * 0.5, top, 2 * w, 2, S.hi); rect(g, x - w + ln * 0.5, top, 1, 13, S.hi); rect(g, x + w - 1 + ln * 0.5, top, 1, 13, S.lo);
  rect(g, x - 1 + ln * 0.5, top + 2, 2, 9, S.lo); rect(g, x - w + 1 + ln * 0.5, top + 9, 2 * w - 2, 1, S.lo); px(g, x - f * (w - 2) + ln * 0.5, top + 4, S.hi);
  if (set === 'halberd') { rect(g, x - 3 + ln * 0.5, top + 3, 6, 12, S.trim); rect(g, x - 3 + ln * 0.5, top + 3, 6, 1, '#8aaa7a'); rect(g, x - 1 + ln * 0.5, top + 6, 2, 3, '#c8d0c4'); }   /* a faded tabard */
  if (set === 'knight') { rect(g, x - 4 + ln * 0.5, top + 5, 8, 1, S.trim); px(g, x + ln * 0.5, top + 4, S.trim); }
  if (set === 'duelist') { rect(g, x - w + ln * 0.5, top + 9, 2 * w, 2, '#a04a5a'); }   /* a sash */
  if (set === 'greatsword') { rect(g, x - w + ln * 0.5, top + 9, 2 * w, 2, '#18181c'); for (const s of [-1, 1]) { rect(g, x + s * (w + 1) - (s < 0 ? 3 : 0) + ln * 0.6, top - 1, 3, 3, S.hi); px(g, x + s * (w + 2) - (s < 0 ? 1 : 0) + ln * 0.6, top - 3, '#d8dce0'); } }
  for (const s of [-1, 1]) rect(g, x + s * (w + 1) - (s < 0 ? 3 : 0) + ln * 0.6, top - 1 + (set === 'greatsword' ? 1 : 0), 4, 5, s === f ? S.hi : S.b);   /* pauldrons */
  rect(g, x - 2 + ln * 0.5 + (o.set === 'ring' ? 0 : 0), top + 11, 3, 2, MA.giltHi); px(g, x + ln * 0.5, top + 13, MA.brass); px(g, x + 2 + ln * 0.5, top + 13, MA.brass);   /* the key ring at the belt */
  /* the rear arm */
  const back = o.walk ? (fr & 1 ? -2 : 2) : 0; rect(g, x - f * (w + 1) + ln * 0.6 + (f > 0 ? -2 : 0) + back, top + 4, 3, 9, S.lo); rect(g, x - f * (w + 1) + ln * 0.6 + (f > 0 ? -2 : 0) + back, top + 12, 3, 2, S.dk);
  helm(g, S, set, x + ln, y - 37 + cr + sl, f, o.lit !== false, t, o);
  if (o.broken) { px(g, x - 3, top + 4, S.dk); px(g, x - 2, top + 5, S.dk); px(g, x + 3, top + 7, S.dk); rect(g, x - 1, top + 6, 1, 3, '#0c1010'); }
  if (o.rust) { px(g, x - 4, top + 6, '#8a5a3a'); px(g, x + 3, top + 3, '#8a5a3a'); px(g, x - 1, y - 8, '#8a5a3a'); px(g, x + 2, y - 4, '#8a5a3a'); }
  /* the shield (the knight's: its height is the pose) and the weapon arm */
  const ax = x + f * (6 + (p.lean || 0)), ay = y - 20 + cr + sl;
  if (set === 'knight') { const sh = p.shield || 14, sx = x + f * (w + 3) + ln * 0.5 - 3, sy = y - 12 + cr - sh + 6; rect(g, sx - 1, sy - 1, 7, sh + 2, S.lo); rect(g, sx, sy, 5, sh, '#a8b0b8'); rect(g, sx, sy, 5, 2, '#d8dce0'); rect(g, sx, sy, 1, sh, '#d8dce0'); rect(g, sx + 4, sy, 1, sh, '#6a7278'); const mid = sy + (sh >> 1); rect(g, sx + 1, mid - 1, 3, 3, S.trim); rect(g, sx + 2, sy + 2, 1, sh - 4, S.trim); rect(g, sx, sy + sh - 2, 5, 2, S.lo); }
  if (p.spin || p.arm !== undefined) {
    const deg = p.arm || 0, grip = weapon(g, S, set, ax, ay, f, deg, p.reach || 10, !!p.spin, t);
    const hand = p.spin ? [ax + f * 6, ay] : grip || [ax, ay]; thick(g, ax, ay, hand[0], hand[1], S.b, 3); rect(g, hand[0] - 1, hand[1] - 1, 3, 3, S.hi);
  }
}
/* THE GHOST'S BUST (x, y = the helm's top-centre): the steward rising out of the helm - a pale head, a high collar, mist where the suit should be */
export function ghostBust(g, x, y, h, time, a = 1) {
  x = R(x); y = R(y); if (h <= 0) return; const k = Math.min(1, h / 16), up = R(h * 0.9), wob = Math.sin(time * 6) * 1.5;
  for (let q = 0; q < up; q++) { const w = 10 - R(q / Math.max(1, up) * 4), sx0 = x - (w >> 1) + R(Math.sin(time * 5 + q * 0.35) * 1.2); rect(g, sx0, y + 4 - q, w, 1, al(GHOST, a * (0.3 + 0.22 * Math.sin(q * 0.8 + time * 6) ** 2))); }
  if (k < 0.45) return;
  const hy = y - up + 1 + R(wob);
  rect(g, x - 4, hy, 8, 9, al('#d0f4de', a * 0.92)); rect(g, x - 4, hy, 8, 2, al('#f0fff6', a * 0.9)); rect(g, x - 5, hy + 2, 1, 5, al(GHOST, a * 0.6)); rect(g, x + 4, hy + 2, 1, 5, al(GHOST, a * 0.6));
  rect(g, x - 3, hy + 3, 2, 2, al('#08140e', a)); rect(g, x + 1, hy + 3, 2, 2, al('#08140e', a)); px(g, x - 2, hy + 3, al(MA.ghostHi, a)); px(g, x + 2, hy + 3, al(MA.ghostHi, a));   /* sockets with a spark */
  rect(g, x - 3, hy + 6, 6, 1, al('#9ab0a4', a * 0.85)); rect(g, x - 1, hy + 7, 2, 2, al('#08140e', a * 0.9));   /* a grey moustache, a mouth */
  rect(g, x - 5, hy + 9, 10, 2, al('#e6fff0', a * 0.8)); rect(g, x - 1, hy + 9, 2, 2, al(MA.giltHi, a));   /* the steward's collar and chain of office */
}
/* THE GHOST CROSSING (the final's wisp; f = its heading): a floating steward trailing mist and keys */
export function ghostForm(g, x, y, f, time, a = 1) {
  x = R(x); y = R(y); const w = Math.sin(time * 12) > 0 ? 1 : 0;
  for (let k = 7; k >= 1; k--) { const aa = a * (0.46 - k * 0.05); rect(g, x - f * (k * 5 + 5), y + 2 + R(Math.sin(time * 8 + k) * 3), 6, 7 - (k > 4 ? 2 : 0), al(GHOST, Math.max(0.02, aa))); }
  rect(g, x - 8, y - 14 - w, 16, 26 + w, al(GHOST, a * 0.22)); rect(g, x - 6, y - 4, 12, 12, al(GHOST, a * 0.7)); rect(g, x - 5, y + 6, 10, 5, al(GHOST, a * 0.45));
  rect(g, x - 5, y - 13, 10, 10, al('#d8f8e4', a * 0.95)); rect(g, x - 5, y - 13, 10, 2, al('#ffffff', a * 0.9)); rect(g, x - 4, y - 9, 3, 3, al('#08140e', a)); rect(g, x + 1, y - 9, 3, 3, al('#08140e', a)); px(g, x - 3, y - 9, al(MA.ghostHi, a)); px(g, x + 2, y - 9, al(MA.ghostHi, a));
  rect(g, x - 4, y - 5, 8, 1, al('#9ab0a4', a)); rect(g, x - 1, y - 4, 2, 3, al('#08140e', a));
  rect(g, x - 7, y - 3, 14, 2, al('#e6fff0', a * 0.85)); rect(g, x - 1, y - 3, 2, 2, al(MA.giltHi, a));
  rect(g, x + f * 6, y + 3 + w, 4, 2, al(MA.giltHi, a)); rect(g, x + f * 7, y + 5 + w, 1, 4, al(MA.brass, a)); rect(g, x + f * 9, y + 5 + w, 1, 3, al(MA.brass, a));   /* the ring of keys, swinging */
}
/* THE HEAP he leaves when he dies (x, y = the floor), his ghost rising out of it (t = seconds since) */
function dead(g, x, y, set, t, time) {
  const S = SET[set] || SET.knight, a = Math.max(0, 1 - Math.max(0, t - 3.4) / 1.4);
  if (a <= 0) return; g.globalAlpha = a; drawPile(g, x, y, time); rect(g, x - 15, y - 3, 8, 3, S.b); rect(g, x + 8, y - 10, 9, 8, S.b); rect(g, x + 9, y - 8, 6, 2, '#0c1010'); rect(g, x - 12, y - 11, 10, 5, S.hi);
  thick(g, x - 20, y - 1, x + 12, y - 1, S.blade, 2); rect(g, x - 20, y - 3, 2, 5, MA.brass); g.globalAlpha = 1;
  if (t < 3.2) { const ga = t < 2 ? 1 : 1 - (t - 2) / 1.2; ghostBust(g, x, y - 14 - t * 16, 16 + t * 6, time, ga * 0.9); if (t < 1.2) rect(g, x - 3, y - 14, 6, 14 - R(t * 6), al(GHOST, 0.4 * (1 - t / 1.2))); }
}
let SC = null;
const scratch = () => { if (!SC) SC = canvas(240, 150); return SC; };
const OX = 120, OY = 118;
/* THE BOSS (ex, ey = his feet on screen; mode = e.mode; p = its POSE entry; o: set, final, flash, open, t (seconds since death), rackLit) */
export function drawCastellan(g, ex, ey, mode, p, f, time, o = {}) {
  ex = R(ex); ey = R(ey); const [sc, sg] = scratch(); sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.globalCompositeOperation = 'source-over'; sg.clearRect(0, 0, 240, 150);
  const set = o.set || 'knight';
  if (mode === 'dead') { dead(sg, OX, OY, set, o.t || 0, time); g.drawImage(sc, ex - OX, ey - OY); return; }
  if (p.wisp) { ghostForm(sg, OX, OY, f, time, 1); g.drawImage(sc, ex - OX, ey - OY); return; }
  const live = !(mode === 'leave' || mode === 'swap'), pose = { ...p };
  if (mode === 'sleep') pose.slump = 4;
  suitArt(sg, OX, OY, f, set, pose, { lit: live && mode !== 'sleep', walk: mode === 'walk', frame: Math.floor(time * 5), time, broken: false });
  if (p.ghost) ghostBust(sg, OX + (p.lean || 0) * f, OY - 37 + (p.crouch || 0) + (p.slump || 0), p.ghost * (mode === 'leave' || mode === 'swap' ? 1.15 : 1), time, 0.55 + 0.3 * Math.sin(time * 10));
  if (o.flash) { sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#ffffff'; sg.fillRect(0, 0, 240, 150); sg.globalCompositeOperation = 'source-over'; }
  g.drawImage(sc, ex - OX, ey - OY);
  /* THE OPENINGS' TELLS: dust, the blade in the floor, breath, stars, a gold glint */
  if (mode === 'stumble') for (let k = 0; k < 4; k++) { const ph = (time * 3 + k * 0.25) % 1; rect(g, ex - f * (6 + k * 5), ey - 2 - R(ph * 5), 3, 3, al('#b8bcb4', 0.6 * (1 - ph))); }
  if (mode === 'stuck') { const tip = ex + f * 44 + 4; rect(g, tip - 8, ey - 1, 18, 2, '#0c1010'); for (let k = 0; k < 3; k++) rect(g, tip + k * 4 * f - 6, ey + 1 + k, 4, 1, '#1c2020'); if ((time * 12) % 2 < 1) px(g, tip + f * 2, ey - 3, '#ffe0a0'); }
  if (mode === 'winded') for (let k = 0; k < 3; k++) { const ph = (time * 1.6 + k * 0.33) % 1; rect(g, ex + f * (5 + ph * 12), ey - 34 - ph * 7, 3 + k, 3, al('#d8e4dc', 0.55 * (1 - ph))); }
  if (mode === 'dizzy') for (let k = 0; k < 3; k++) { const a = time * 5 + k * 2.09; px(g, ex + Math.cos(a) * 9, ey - 44 + Math.sin(a) * 3, '#ffd36b'); rect(g, ex + Math.cos(a) * 9 - 1, ey - 44 + Math.sin(a) * 3 - 1, 3, 1, '#ffd36b'); rect(g, ex + Math.cos(a) * 9, ey - 45 + Math.sin(a) * 3, 1, 3, '#ffd36b'); }
  if (o.open) { for (let k = 0; k < 5; k++) { const a = time * 3 + k * 1.2566; px(g, ex + Math.cos(a) * 15, ey - 22 + Math.sin(a) * 15, '#ffd36b'); } rect(g, ex - 12, ey - 48, 24, 1, al('#ffd36b', 0.8)); rect(g, ex - 8, ey - 49, 16, 1, al('#fff6c8', 0.6)); }
}
/* A RACK'S SUIT in the great hall (x, y = its feet; broken = its set is spent; lit = the visor about to burn: he swaps into it) */
export function drawArenaRack(g, x, y, f, set, broken, lit, time) {
  rect(g, x - 11, y - 3, 22, 3, '#3a403e'); rect(g, x - 11, y - 3, 22, 1, '#6a746e'); rect(g, x - 8, y - 5, 16, 2, '#2e3432');
  suitArt(g, x, y - 3, f, set, broken ? { arm: 90, reach: 4, slump: 6, lean: 3 } : { arm: 80, reach: 6 }, { lit, time, broken });
}
