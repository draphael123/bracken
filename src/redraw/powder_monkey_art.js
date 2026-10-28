// src/redraw/powder_monkey_art.js - THE POWDER MONKEY, HAND-DRAWN (claude/flotilla4art; the greybox of claude/flotilla4 is replaced, the API is kept - src/powder-monkey.js is the foe).
// A ship's boy who runs powder: SMALL (13 px feet to cap, the big pirates are 22-25), quick and hunched - a navy knitted cap with a red band and a floppy red pompom, a soot-black face
// with big white eyes and a cheeky grin, a too-big cream jersey with red stripes and the sleeves rolled to bare brown arms, canvas trousers rolled to the knee, bare feet, a leather BANDOLIER
// with three spare grenades across his chest. His own LIT GRENADE: an iron ball, a riveted band, a tarred fuse cord that BURNS SHORT, a spark.
// Poses (each its own; B16): idle 0/1 (breathing, the grenade at his hip), scurry 0/1 (low run, arms pumping), holdLit (crouched, both hands cradling the grenade, the match touched to
// the fuse: the first half of the told '!!'), lightTell (up on his toes, one arm straight up with the grenade over his cap, the fuse sparking: the second half of the tell), lob (the arm
// thrown forward and EMPTY, weight forward), flee (turned, bent double, sweat flying), hurt (knocked back, cap flying, eyes crossed), dead (on his back, a limp hand, the cap beside him).
// drawMonkey(g, x, y, face, pose, time, flash) draws him live at his feet (x, y) (baked bodies, cached; the spark is live); drawGrenade(g, x, y, fuseLeft, fuseMax, time, kicked) a grenade;
// bakeMonkeySet() his sheet for the body and the bestiary card: frames 0 idle, 1 scurry, 2 lightTell, 3 lob, 4 hurt (last = hurt, the corpse convention).
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';
const R = Math.round;
const pack = (Rf, ax, ay, w, h) => ({ R: Rf, L: Rf.map(c => flipX(c)), white: { R: Rf.map(c => whiten(c)), L: Rf.map(c => flipX(whiten(c))) }, ax, ay, w, h });
export const PMA_POSES = ['idle', 'scurry', 'lightTell', 'lob', 'hurt'];
export const PMA_ALL = ['idle', 'scurry', 'holdLit', 'lightTell', 'lob', 'flee', 'hurt', 'dead'];
const CW = 28, CH = 30, OX = 14, OY = 28;
const K = { cap: '#2a3258', cap2: '#44508a', cap3: '#1a1f3a', band: '#b83a3a', pom: '#d84a42', sk: '#4e3c34', sk2: '#6e5648', sk3: '#2e2420', eye: '#fbf6e6', pup: '#14141c', teeth: '#fff8e8',
  j: '#ece0c0', j2: '#b83a3a', j3: '#b8a888', arm: '#a8704c', arm2: '#c48e68', arm3: '#7a4c30', tr: '#8a7a5a', tr2: '#5e5238', ft: '#a8704c', ban: '#7a5230', ban2: '#a47a48',
  gr: '#34343e', gr2: '#585866', gr3: '#16161c', fuse: '#8a6a3a', spark: '#ffd36b', spark2: '#fff6c8', hot: '#ff6b2c', brass: '#d8b04a' };
/* the body of one pose, drawn facing right with his feet at (OX, OY): u forward, v up. ph = the run/idle phase (0/1). */
function body(g, pose, ph) {
  const b = (u, v, w, h, col) => { g.fillStyle = col; g.fillRect(OX + u, OY - v - h, w, h); };
  const run = pose === 'scurry' || pose === 'flee', lob = pose === 'lob', hurt = pose === 'hurt', tell = pose === 'lightTell', hold = pose === 'holdLit';
  const lean = tell ? -1 : run ? (pose === 'flee' ? 2 : 1) : lob ? 2 : hurt ? -2 : hold ? 1 : 0;
  const lo = hold ? 1 : pose === 'idle' ? ph : run ? 1 : 0, up = hurt ? 1 : 0;   /* crouch, and a hop when he is hit */
  /* legs: rolled canvas trousers over bare shins and feet */
  if (run) {
    const a = ph ? 3 : -3;   /* the stride: one foot reaching, one kicked back */
    b(a - 1, 2 + up, 3, 2, K.tr); b(a - 1, 1 + up, 3, 1, K.tr2); b(a, 0 + up, 2, 1, K.ft); b(a + 1, 0 + up, 2, 1, K.ft);
    b(-a - 1, 2 + up, 3, 2, K.tr); b(-a, 0 + up, 2, 2, K.ft); b(-a - 2, 0 + up, 2, 1, K.ft);
  } else if (lob) {
    b(2, 2, 3, 2, K.tr); b(3, 0, 3, 2, K.ft); b(2, 0, 1, 1, K.ft);   /* the front foot planted */
    b(-5, 1, 3, 2, K.tr); b(-6, 0, 3, 1, K.ft);   /* the back leg trailing */
  } else if (hurt) {
    b(-4, 2, 3, 2, K.tr); b(-5, 1, 3, 1, K.ft); b(0, 2, 3, 2, K.tr); b(1, 1, 3, 1, K.ft);
  } else {
    const kn = tell ? 0 : lo;
    b(-3, 2, 3, 2 - kn, K.tr); b(-3, 1, 3, 1, K.tr2); b(-4, 0, 4, 1, K.ft); b(1, 2, 3, 2 - kn, K.tr); b(1, 1, 3, 1, K.tr2); b(1, 0, 4, 1, K.ft);
    if (tell) { b(-4, 0, 4, 1, K.ft); }
  }
  const ty = 3 + (run ? 0 : -lo) + up, tu = lean;   /* the torso's foot and lean */
  /* the jersey: too big, cream with red stripes, a rolled hem; the lean carries the whole upper body */
  b(-3 + tu, ty, 7, 6, K.j); b(-3 + tu, ty, 7, 1, K.j3); b(-3 + tu, ty + 1, 7, 1, K.j2); b(-3 + tu, ty + 3, 7, 1, K.j2); b(-3 + tu, ty + 5, 7, 1, K.j2); b(3 + tu, ty + 1, 1, 4, K.j3); b(-4 + tu, ty + 1, 1, 4, K.j3);
  /* the bandolier: a leather strap corner to corner, three grenades in it */
  for (let i = 0; i < 6; i++) b(-2 + tu + i, ty + 5 - i, 1, 1, K.ban);
  if (pose !== 'holdLit') { b(-2 + tu, ty + 1, 2, 2, K.gr); b(-2 + tu, ty + 2, 1, 1, K.gr2); b(0 + tu, ty + 2, 2, 2, K.gr); b(0 + tu, ty + 3, 1, 1, K.gr2); }
  b(0 + tu, ty + 2, 1, 1, K.ban2);
  /* the head: soot-black face, white eyes, a grin; the cap pulled low, the pompom flopping */
  const hy = ty + 6, hu = tu + (hold ? 1 : 0) - (hurt ? 1 : 0), hh = hold ? hy - 1 : hy;
  b(hu - 3, hh, 7, 5, K.sk3); b(hu - 2, hh, 6, 5, K.sk); b(hu + 2, hh + 1, 2, 3, K.sk2); b(hu - 4, hh + 2, 1, 2, K.sk2);   /* the face and an ear */
  if (hurt) { b(hu + 1, hh + 3, 1, 1, K.pup); b(hu + 3, hh + 3, 1, 1, K.pup); b(hu + 2, hh + 2, 1, 1, K.pup); b(hu + 2, hh + 4, 1, 1, K.pup); b(hu + 1, hh + 1, 3, 1, K.teeth); }   /* crossed eyes, a gritted mouth */
  else { b(hu + 1, hh + 2, 3, 3, K.eye); b(hu + 3, hh + 2, 1, 2, K.pup); if (hold) b(hu + 3, hh + 1, 1, 1, K.pup); b(hu + 1, hh + 1, 3, 1, tell || lob ? K.sk3 : K.teeth); if (tell || lob) b(hu + 1, hh, 3, 1, K.teeth); else b(hu + 2, hh, 1, 1, K.sk3); }
  const cy = hh + 4;
  if (hurt) { b(hu - 6, cy + 3, 6, 3, K.cap); b(hu - 6, cy + 5, 6, 1, K.cap2); b(hu - 7, cy + 4, 1, 1, K.pom); b(hu - 5, cy + 3, 5, 1, K.band); }   /* the cap flying off backwards */
  else {
    b(hu - 3, cy - 1, 8, 3, K.cap); b(hu - 3, cy + 1, 7, 1, K.cap2); b(hu - 2, cy + 2, 5, 1, K.cap2); b(hu - 3, cy - 1, 8, 1, K.band); b(hu + 3, cy, 2, 1, K.cap3);
    const fl = tell || run ? 2 : 0;   /* the pompom flops back when he runs */
    b(hu - 4 - fl, cy + 1 - (run ? 0 : -1), 2, 2, K.pom); b(hu - 3 - fl, cy + 2 - (run ? 0 : -1), 1, 1, K.hot);
  }
  /* arms and what is in them */
  const sh = [tu + 2, ty + 5];   /* the shoulder */
  const arm = (u0, v0, u1, v1) => { const n = Math.max(Math.abs(u1 - u0), Math.abs(v1 - v0), 1); for (let i = 0; i <= n; i++) { const u = R(u0 + (u1 - u0) * i / n), v = R(v0 + (v1 - v0) * i / n); b(u, v, 2, 2, K.arm); b(u, v + 1, 2, 1, K.arm2); b(u, v, 1, 1, K.arm3); } b(u1, v1, 2, 2, K.arm2); b(u0, v0 + 1, 2, 1, K.j3); };
  const grenade = (u, v) => { b(u, v, 4, 4, K.gr3); b(u + 1, v + 1, 3, 3, K.gr); b(u + 1, v + 3, 2, 1, K.gr2); b(u, v + 1, 4, 1, K.gr3); b(u + 1, v + 1, 1, 1, K.brass); b(u + 1, v + 4, 2, 1, K.fuse); };
  if (tell) { arm(sh[0], sh[1], tu + 2, ty + 12); grenade(tu + 1, ty + 13); arm(tu - 2, ty + 4, tu - 4, ty + 1); }
  else if (hold) { arm(sh[0], sh[1] - 1, tu + 5, ty + 3); arm(tu - 1, ty + 4, tu + 4, ty + 2); grenade(tu + 4, ty + 3); }
  else if (lob) { arm(sh[0], sh[1], tu + 8, ty + 6); arm(tu - 2, ty + 3, tu - 5, ty + 7); b(tu + 10, ty + 5, 2, 1, K.sk2); b(tu + 11, ty + 8, 2, 1, K.sk2); }   /* thrown: the hand empty, the speed lines after it */
  else if (hurt) { arm(sh[0], sh[1], tu + 6, ty + 7); arm(tu - 2, ty + 4, tu - 6, ty + 6); }
  else if (run) { arm(sh[0], sh[1], ph ? tu + 5 : tu - 2, ph ? ty + 6 : ty + 1); arm(tu - 2, ty + 4, ph ? tu - 5 : tu + 2, ph ? ty + 2 : ty + 5); if (pose === 'flee') { b(tu + 5, ty + 11, 1, 2, '#bfe6f5'); b(tu - 5, ty + 10, 1, 1, '#bfe6f5'); } }
  else { arm(sh[0], sh[1], tu + 3, ty + 2); grenade(tu + 3, ty + 1); arm(tu - 2, ty + 4, tu - 4, ty + 1); }   /* idle: a grenade held at his hip */
}
/* the fuse spark's place (u forward, v up from his feet) for the poses that hold a lit grenade, or null */
function sparkAt(pose) { return pose === 'lightTell' ? [2, 21] : pose === 'holdLit' ? [7, 12] : null; }
const CACHE = new Map();
function frame(pose, ph, face, flash) {
  const key = pose + ph + face + (flash ? 'w' : '');
  let c = CACHE.get(key);
  if (!c) {
    if (pose === 'dead') { const [cc, g] = canvas(CW, CH); deadBody(g); c = outline(cc, OUT); }
    else { const [cc, g] = canvas(CW, CH); body(g, pose, ph); c = outline(cc, OUT); }
    if (face < 0) c = flipX(c);
    if (flash) c = whiten(c);
    CACHE.set(key, c);
  }
  return c;
}
/* on his back, the cap beside him, one hand open, a dropped grenade's fuse gone dark */
function deadBody(g) {
  const b = (u, v, w, h, col) => { g.fillStyle = col; g.fillRect(OX + u, OY - v - h, w, h); };
  b(-7, 0, 15, 4, K.j); b(-7, 3, 15, 1, K.j3); b(-4, 1, 1, 3, K.j2); b(0, 0, 1, 4, K.j2); b(4, 0, 1, 4, K.j2);   /* the jersey, lying */
  b(-9, 0, 3, 3, K.tr); b(-12, 0, 3, 2, K.ft); b(-12, 2, 2, 1, K.ft);   /* the legs, feet up-left */
  b(8, 0, 6, 5, K.sk3); b(8, 1, 5, 4, K.sk); b(10, 3, 2, 2, K.eye); b(11, 3, 1, 1, K.pup); b(8, 1, 2, 1, K.teeth);   /* the head, the eyes to the sky */
  b(14, 0, 4, 3, K.cap); b(14, 2, 4, 1, K.cap2); b(14, 0, 4, 1, K.band); b(18, 1, 2, 2, K.pom);   /* the cap rolled off */
  b(-2, 4, 6, 2, K.arm); b(-2, 5, 6, 1, K.arm2); b(3, 4, 2, 2, K.arm2);   /* a limp arm across him */
  b(-1, 1, 2, 2, K.ban); b(1, 2, 2, 2, K.gr);
}
export function drawMonkey(g, x, y, f, pose, time, flash) {
  x = R(x); y = R(y); f = f > 0 ? 1 : -1;
  const ph = pose === 'idle' ? (Math.floor(time * 2.2) % 2) : (pose === 'scurry' || pose === 'flee') ? (Math.floor(time * 14) % 2) : 0;
  g.drawImage(frame(pose, ph, f, flash), x - OX, y - OY);
  const s = sparkAt(pose);
  if (s && !flash) {   /* the fuse sparks, live: a flicker and a few flying flecks */
    const sx = x + f * s[0], sy = y - s[1], n = Math.floor(time * 22);
    g.fillStyle = n % 2 ? K.spark2 : K.spark; g.fillRect(sx - 1, sy - 1 - (n % 2), 2, 2); g.fillStyle = n % 3 ? K.hot : K.spark; g.fillRect(sx + (n % 3) - 1, sy - 3 - (n % 2), 1, 1);
    g.fillStyle = K.spark2; g.fillRect(sx - 2 + (n % 4), sy - 4 - (n % 3), 1, 1);
  }
}
export function drawGrenade(g, x, y, fuse, fuseMax, time, kicked) {
  x = R(x); y = R(y); const k = fuseMax > 0 ? Math.max(0, Math.min(1, fuse / fuseMax)) : 0, blink = Math.floor(time * (6 + 26 * (1 - k))) % 2;
  /* the iron ball: outlined, a lit top-left, a riveted band round the middle (green when it has been struck back) */
  g.fillStyle = '#0c0c12'; g.fillRect(x - 4, y - 7, 8, 8); g.fillRect(x - 3, y - 8, 6, 10);
  g.fillStyle = '#34343e'; g.fillRect(x - 3, y - 7, 6, 8); g.fillRect(x - 2, y - 8, 4, 9);
  g.fillStyle = '#585866'; g.fillRect(x - 3, y - 6, 2, 2); g.fillRect(x - 2, y - 7, 2, 1); g.fillStyle = '#16161c'; g.fillRect(x - 3, y - 1, 6, 1); g.fillRect(x + 1, y - 5, 2, 4);
  g.fillStyle = kicked ? '#8fd160' : '#d8b04a'; g.fillRect(x - 3, y - 4, 6, 1); g.fillStyle = kicked ? '#4f8a3a' : '#8a6a28'; g.fillRect(x - 3, y - 3, 6, 1);
  g.fillStyle = '#fff6c8'; g.fillRect(x - 1, y - 4, 1, 1);   /* a rivet */
  /* the fuse: a tarred cord from a brass collar that burns SHORT as the time runs out, the spark at its tip */
  const L = 2 + R(5 * k), tipx = x + 1 + (L > 4 ? 1 : 0), tipy = y - 9 - L;
  g.fillStyle = '#d8b04a'; g.fillRect(x - 1, y - 9, 3, 1);
  g.fillStyle = '#8a6a3a'; for (let i = 0; i < L; i++) g.fillRect(x + (i > 3 ? 1 : 0), y - 10 - i, 1, 1);
  g.fillStyle = '#2a1e12'; g.fillRect(x + 1, y - 11, 1, Math.max(0, L - 2));
  g.fillStyle = blink ? '#fff2a0' : '#ff6b2c'; g.fillRect(tipx - 1, tipy - 1, 2, 2);
  g.fillStyle = blink ? '#ff6b2c' : '#ffd36b'; g.fillRect(tipx + (blink ? 1 : -2), tipy - 2, 1, 1); g.fillRect(tipx - (blink ? 2 : 0), tipy - 3, 1, 1);
  if (k < 0.45) { g.globalAlpha = 0.35 + 0.4 * blink; g.strokeStyle = '#ff4a3a'; g.lineWidth = 1; g.beginPath(); g.arc(x + 0.5, y - 3, 6 + 10 * k, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   /* the last of the fuse: a red ring closing */
}
export function bakeMonkeySet() {
  const fr = PMA_POSES.map(p => { const [c, g] = canvas(CW, CH); body(g, p, 0); return outline(c, OUT); });
  return pack(fr, OX, OY + 1, 8, 12);
}
