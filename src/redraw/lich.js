// lich.js — THE UNDEAD ARCHMAGE (batch 4, 2026-09-21). A new baker, not a recolour: the old sprite was the Folly's
// archmage run through a blue filter, and a blue wizard does not read as dead. This one is a skull in a hood: the jaw
// torn and hanging off one hinge, grave-green light in the sockets, the ribs showing through a hole rotted in the robe,
// and under the robe NO LEGS - a shredded hem that trails and never touches anything, because he floats. His staff is
// cracked down its length with green fire in the crack and more burning in its head.
// Frames face RIGHT (L is the flip) on one 60x68 canvas so the anchor holds; the anchor is the bottom of the hem.
//    0, 1  idle float (the hem and the fire move)      2 fire tell (staff thrust forward, orange in the head)
//    3 ice tell (a hand out, blue)                     4 storm tell (both arms up, white-violet)
//    5 poison tell (a green orb in the hand)           6 death tell (both hands out, black-green) - the hand, the mark
//    7 blink out (coming apart in bands)               8 blink in (gathering)
//    9 OPEN: re-gathering after the mark came back on him (slumped, the eyes and the staff gone dim)
//   10, 11 enraged float (the flame crown)             12 dead (the robe fallen in, the skull on it)   13 hurt (LAST)
//   canvas 60x68   anchor ax 30, ay 66   pack w/h 16x40
import { canvas, rect, fillPoly, line, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

export const UNDEADMAGE_F = { idle: [0, 1], fire: 2, ice: 3, storm: 4, poison: 5, death: 6, blinkOut: 7, blinkIn: 8, open: 9, enraged: [10, 11], dead: 12, hurt: 13 };
const ROBE = ['#1e1a2a', '#2e2840', '#463c5c', '#5e5278'], ROT = '#3e4a30', BONE = ['#6e6a58', '#a8a48c', '#d9d6c0', '#f0eedc'];
const GREEN = ['#1f6a3a', '#3fe08a', '#8fffb0', '#e0ffe8'], WOOD = ['#2a2019', '#4a3a2c', '#6a5540'];
const SPELL = { fire: ['#c9463d', '#ff9b49', '#ffe0a0'], ice: ['#3a7aa0', '#9be2ff', '#ffffff'], storm: ['#6a60c0', '#c8c4ff', '#ffffff'], poison: ['#3a6a1a', '#8fd160', '#d8ffb0'], death: ['#0a100a', '#2a4a2a', '#8fffb0'] };

function flame(g, x, y, h, ph, cols) {   /* a lick of fire: three tongues, the colours stepping up the middle */
  for (let i = -1; i <= 1; i++) { const hh = h - Math.abs(i) * 2 + ((ph + i * 2) % 3 === 0 ? 1 : 0);
    rect(g, x + i * 2, y - hh, 2, hh, cols[0]); rect(g, x + i * 2, y - hh + 2, 1, Math.max(1, hh - 3), cols[1]); }
  rect(g, x, y - h + 2, 1, 2, cols[2]);
}
function mage(o) {
  const [c, g] = canvas(60, 68), ax = 30, ay = 66, ph = o.ph || 0, sink = o.sink || 0, lean = o.lean || 0;
  const sy = ay - 40 + sink;                                   // the shoulders
  // ---- THE HEM: five shredded tails, trailing and moving, nothing under them ----
  for (let i = 0; i < 5; i++) { const x = ax - 10 + i * 5, len = 11 + ((i * 7 + ph * 3) % 6), sw = Math.round(Math.sin(ph * 1.6 + i) * 2);
    fillPoly(g, [[x, ay - 18 + sink], [x + 4, ay - 18 + sink], [x + 2 + sw, ay - 18 + len + sink], [x + 1 + sw, ay - 18 + len + sink]], i % 2 ? ROBE[1] : ROBE[0]);
    rect(g, x + 1 + Math.round(sw / 2), ay - 16 + sink, 1, Math.max(2, len - 6), ROBE[2]); }
  // ---- THE ROBE: shoulders to hem, rotted through at the chest ----
  fillPoly(g, [[ax - 8, sy], [ax + 8, sy], [ax + 12, ay - 17 + sink], [ax - 12, ay - 17 + sink]], ROBE[1]);
  fillPoly(g, [[ax - 6, sy + 1], [ax + 2, sy + 1], [ax + 1, ay - 18 + sink], [ax - 9, ay - 18 + sink]], ROBE[2]);
  line(g, ax - 6, sy + 2, ax - 8, ay - 19 + sink, ROBE[3]);
  for (const [x, y, w] of [[ax + 4, sy + 16, 4], [ax - 9, sy + 20, 3], [ax + 6, sy + 8, 2]]) rect(g, x, y, w, 2, ROT);   /* the grave got into it */
  // THE RIBS, through the hole: dark behind, four bars and a spine
  fillPoly(g, [[ax - 4, sy + 4], [ax + 4, sy + 3], [ax + 5, sy + 12], [ax - 1, sy + 15], [ax - 5, sy + 11]], '#120e18');
  rect(g, ax, sy + 4, 1, 11, BONE[1]);
  for (let r = 0; r < 4; r++) { line(g, ax - 4, sy + 5 + r * 3, ax + 4, sy + 4 + r * 3, BONE[2]); rect(g, ax - 4, sy + 6 + r * 3, 1, 1, BONE[0]); }
  // ---- THE STAFF, behind the far arm: cracked, green fire in the crack and in its head ----
  const stx = ax + 11 + (o.staffX || 0), sty = sy - 18 + (o.staffY || 0), stb = ay - 6 + sink;
  line(g, stx, sty, stx - Math.round(lean * 4), stb, WOOD[1], 2); line(g, stx + 1, sty, stx + 1 - Math.round(lean * 4), stb, WOOD[2]);
  for (let y = sty + 6; y < stb - 4; y += 5) { const cx = stx - Math.round(lean * 4 * (y - sty) / (stb - sty)); rect(g, cx, y, 1, 3, o.dim ? WOOD[0] : GREEN[1]); rect(g, cx + 1, y + 2, 1, 2, WOOD[0]); }
  rect(g, stx - 3, sty - 2, 7, 4, BONE[1]); rect(g, stx - 2, sty - 1, 5, 2, BONE[0]);   /* a claw of bone holds the fire */
  if (!o.dim) flame(g, stx, sty - 1, o.spell ? 7 : 5, ph, o.spell && o.spell !== 'storm' ? SPELL[o.spell] : GREEN); else rect(g, stx - 1, sty - 3, 2, 2, GREEN[0]);
  // ---- THE ARMS: bone out of rotted sleeves ----
  const arm = (x0, y0, x1, y1, orb) => { line(g, x0, y0, (x0 + x1) >> 1, (y0 + y1) >> 1, ROBE[1], 3); line(g, (x0 + x1) >> 1, (y0 + y1) >> 1, x1, y1, BONE[1], 1);
    rect(g, x1 - 1, y1 - 1, 3, 3, BONE[2]); rect(g, x1 + 1, y1 - 2, 1, 2, BONE[3]);
    if (orb) { circle(g, x1 + 3, y1 - 1, 3, orb[0]); circle(g, x1 + 3, y1 - 1, 2, orb[1]); rect(g, x1 + 3, y1 - 2, 1, 1, orb[2]); } };
  const P = o.pose || 'idle', orb = o.spell ? SPELL[o.spell] : null;
  if (P === 'idle') { arm(ax + 6, sy + 2, stx - 1, sy + 12); arm(ax - 6, sy + 2, ax - 8, sy + 16); }
  else if (P === 'cast') { arm(ax + 6, sy + 2, stx - 1, sy + 10); arm(ax - 2, sy + 2, ax + 15, sy + 5, orb); }
  else if (P === 'raise') { arm(ax + 6, sy + 1, stx - 1, sy - 6); arm(ax - 6, sy + 1, ax - 10, sy - 14, orb); }
  else if (P === 'both') { arm(ax + 6, sy + 2, ax + 16, sy + 3, orb); arm(ax - 2, sy + 3, ax + 13, sy + 8, orb); }
  else if (P === 'slump') { arm(ax + 6, sy + 3, stx - 2, sy + 16); arm(ax - 6, sy + 3, ax - 6, sy + 19); }
  // ---- THE HOOD AND THE SKULL ----
  const hx = ax + (o.headX || 0), hy = sy - 3 + (o.headY || 0);
  fillPoly(g, [[hx - 8, hy + 2], [hx - 6, hy - 11], [hx + 1, hy - 14], [hx + 7, hy - 9], [hx + 8, hy + 2], [hx + 4, hy + 4], [hx - 5, hy + 4]], ROBE[0]);
  for (const [x, y] of [[hx - 8, hy + 3], [hx + 7, hy + 3], [hx - 7, hy - 4]]) rect(g, x, y, 1, 2, ROBE[1]);   /* the hood's ragged edge */
  fillPoly(g, [[hx - 4, hy - 9], [hx + 2, hy - 10], [hx + 5, hy - 7], [hx + 5, hy - 2], [hx + 2, hy], [hx - 4, hy - 1]], BONE[2]);
  rect(g, hx - 4, hy - 9, 2, 8, BONE[1]); rect(g, hx + 1, hy - 10, 2, 1, BONE[3]);
  const eye = o.dim ? GREEN[0] : o.flame ? GREEN[3] : GREEN[2];
  rect(g, hx - 2, hy - 7, 2, 2, '#0a100c'); rect(g, hx + 2, hy - 7, 2, 2, '#0a100c'); rect(g, hx - 1, hy - 7, 1, 1, eye); rect(g, hx + 3, hy - 7, 1, 1, eye);
  if (!o.dim) { rect(g, hx + 4, hy - 7, 1, 1, GREEN[1]); rect(g, hx, hy - 7, 1, 1, GREEN[1]); }
  rect(g, hx + 1, hy - 4, 1, 1, '#1a1612');                        /* the nose hole */
  // THE JAW: torn off its hinge on the near side, hanging down and back, teeth still in it
  fillPoly(g, [[hx - 3, hy], [hx + 4, hy - 1], [hx + 3, hy + 3 + (o.jaw || 0)], [hx - 2, hy + 4 + (o.jaw || 0)]], BONE[1]);
  for (let i = 0; i < 3; i++) rect(g, hx - 2 + i * 2, hy + (i === 2 ? 0 : 1), 1, 1, BONE[3]);
  rect(g, hx - 3, hy + 1, 1, 2, '#120e18');
  if (o.flame) for (let i = 0; i < 5; i++) flame(g, hx - 6 + i * 3, hy - 10 - (i === 2 ? 2 : i % 2), 5 + (i === 2 ? 2 : 0), ph + i, GREEN);   /* THE FLAME CROWN */
  return c;
}
function fade(c, keep) {   /* the blink: he comes apart in bands (or gathers out of them) */
  const g = c.getContext('2d'); for (let y = 0; y < c.height; y++) if ((y % 4) >= keep) g.clearRect(0, y, c.width, 1);
  return c;
}
function dead() {
  const [c, g] = canvas(60, 68), ax = 30, ay = 66;
  fillPoly(g, [[ax - 16, ay], [ax + 16, ay], [ax + 10, ay - 7], [ax - 12, ay - 8]], ROBE[1]);
  fillPoly(g, [[ax - 10, ay - 2], [ax + 6, ay - 2], [ax + 2, ay - 7], [ax - 8, ay - 7]], ROBE[2]);
  line(g, ax - 22, ay - 1, ax + 20, ay - 3, WOOD[1], 2); for (let x = ax - 18; x < ax + 16; x += 7) rect(g, x, ay - 3, 2, 1, WOOD[0]);   /* the staff, snapped across the heap */
  fillPoly(g, [[ax - 3, ay - 13], [ax + 4, ay - 13], [ax + 5, ay - 8], [ax - 3, ay - 7]], BONE[2]); rect(g, ax - 1, ay - 11, 1, 1, '#0a100c'); rect(g, ax + 2, ay - 11, 1, 1, '#0a100c');
  rect(g, ax + 8, ay - 3, 4, 2, BONE[1]);                          /* and the jaw, come off at last */
  return c;
}
export function bakeUndeadMage() {
  const F = [
    mage({ ph: 0 }), mage({ ph: 1, sink: 1 }),
    mage({ ph: 2, pose: 'cast', spell: 'fire', staffX: 2, headX: 1 }),
    mage({ ph: 0, pose: 'cast', spell: 'ice', headX: 1 }),
    mage({ ph: 1, pose: 'raise', spell: 'storm', staffY: -6, headY: -1, jaw: 1 }),
    mage({ ph: 2, pose: 'cast', spell: 'poison', headX: 1 }),
    mage({ ph: 0, pose: 'both', spell: 'death', headX: 2, jaw: 2 }),
    fade(mage({ ph: 1 }), 2), fade(mage({ ph: 2 }), 3),
    mage({ ph: 0, pose: 'slump', dim: true, sink: 3, headY: 3, headX: -1, lean: 1, jaw: 2 }),
    mage({ ph: 1, flame: true }), mage({ ph: 2, flame: true, sink: 1 }),
    dead(),
    mage({ ph: 1, headX: -2, headY: -1, jaw: 3, lean: -1 }),
  ].map(c => outline(c, OUT));
  const W = F.map(c => whiten(c));
  return { R: F, L: F.map(flipX), white: { R: W, L: W.map(flipX) }, ax: 30, ay: 66, w: 16, h: 40 };
}
