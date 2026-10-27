// src/redraw/powder_monkey_art.js - THE POWDER MONKEY's look (claude/flotilla4, GREYBOX: the Sonnet art lane redraws every pose here; src/powder-monkey.js is the foe).
// A ship's boy who runs powder: SMALL (12 px feet to cap, the big pirates are 22-25), hunched and quick, a dark knitted cap pulled down, a soot-black face with white eyes,
// a too-big striped jersey with the sleeves rolled, a canvas BANDOLIER of grenades across it, bare feet, and a LIT GRENADE (an iron ball, a wooden fuse plug, a spark).
// Poses (each its own; B16): idle (crouched, a grenade in hand), scurry 0/1 (low, legs wide, arms back), lightTell (the grenade held up over his cap, the fuse SPARKING -
// the told '!!'), lob (the throwing arm forward and empty), flee (turned, running bent double), hurt (knocked back, cap flying), and the body (on its back).
// drawMonkey(g, x, y, face, pose, time, flash) draws him live at his feet (x, y); drawGrenade(g, x, y, fuseLeft, fuseMax, time, kicked) a grenade; bakeMonkeySet() his
// sheet for the body and the bestiary card: frames 0 idle, 1 scurry, 2 lightTell, 3 lob, 4 hurt.
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';
const R = Math.round;
const pack = (Rf, ax, ay, w, h) => ({ R: Rf, L: Rf.map(c => flipX(c)), white: { R: Rf.map(c => whiten(c)), L: Rf.map(c => flipX(whiten(c))) }, ax, ay, w, h });
export const PMA_POSES = ['idle', 'scurry', 'lightTell', 'lob', 'hurt'];
export function drawMonkey(g, x, y, f, pose, time, flash) {
  const c = flash ? { j: '#fff', j2: '#eee', cap: '#fff', sk: '#fff', sk2: '#eee', p: '#fff', ban: '#fff', gr: '#fff', ft: '#fff' }
    : { j: '#e6dcc0', j2: '#7a2a2a', cap: '#2a2a3a', sk: '#3a2e2a', sk2: '#241c1a', p: '#4a4038', ban: '#9a8458', gr: '#2c2c34', ft: '#8a6a50' };
  const fr = (u, v, w, h, col) => { g.fillStyle = col; g.fillRect(f > 0 ? x + u : x - u - w, y - v - h, w, h); };
  const run = pose === 'scurry' || pose === 'flee', ph = run ? Math.floor(time * 14) % 2 : 0, low = pose === 'idle' ? 1 : run ? 2 : 0, back = pose === 'hurt' ? -2 : 0;
  /* legs: short, bare feet, wide when he runs */
  if (run) { fr(-4 + ph * 2, 0, 2, 4, c.p); fr(2 - ph * 2, 0, 2, 4, c.p); fr(-5 + ph * 2, 0, 3, 1, c.ft); fr(2 - ph * 2, 0, 3, 1, c.ft); }
  else { fr(-3 + back, 0, 2, 4 - low, c.p); fr(1 + back, 0, 2, 4 - low, c.p); fr(-4 + back, 0, 3, 1, c.ft); fr(1 + back, 0, 3, 1, c.ft); }
  /* the jersey: too big, striped, hunched forward when he runs */
  const ty = 4 - low, lean = run ? (pose === 'flee' ? -1 : 1) : 0;
  fr(-3 + lean + back, ty, 7, 5, c.j); fr(-3 + lean + back, ty + 1, 7, 1, c.j2); fr(-3 + lean + back, ty + 3, 7, 1, c.j2);
  /* the bandolier: a canvas strap with three little grenades on it */
  for (let i = 0; i < 3; i++) fr(-2 + i * 2 + lean + back, ty + 4 - i, 1, 1, c.ban);
  fr(-2 + lean + back, ty + 1, 2, 2, c.gr);
  /* the head: a soot-black face, white eyes, the knitted cap pulled down (it flies off when he is hurt) */
  const hx = -2 + lean * 2 + back, hy = ty + 5;
  fr(hx, hy, 5, 4, c.sk); fr(hx, hy, 1, 4, c.sk2); fr(hx + 3, hy + 2, 1, 1, '#f4f0e0');
  if (pose === 'hurt') fr(hx - 3, hy + 6, 4, 2, c.cap); else { fr(hx - 1, hy + 3, 6, 2, c.cap); fr(hx - 2, hy + 3, 1, 1, c.cap); }
  /* the arms and the grenade */
  const lit = Math.floor(time * 18) % 2 ? '#ffd36b' : '#ff6b2c';
  if (pose === 'lightTell') { fr(1 + back, ty + 4, 1, 6, c.sk); fr(0 + back, ty + 10, 3, 3, c.gr); fr(1 + back, ty + 13, 1, 1, '#9a7444'); fr(1 + back + (ph ? 1 : 0), ty + 14 + (Math.floor(time * 24) % 2), 1, 1, lit); }
  else if (pose === 'lob') { fr(3 + lean, ty + 3, 4, 1, c.sk); fr(7 + lean, ty + 3, 1, 1, c.sk2); }
  else if (run) { fr(-4 + lean, ty + 2, 2, 1, c.sk); fr(3 + lean, ty + 1, 2, 1, c.sk); }
  else if (pose === 'hurt') { fr(-5, ty + 4, 2, 1, c.sk); fr(3, ty + 5, 2, 1, c.sk); }
  else { fr(3, ty + 1, 1, 3, c.sk); fr(3, ty, 2, 2, c.gr); }   /* idle: a grenade held at his hip */
}
export function drawGrenade(g, x, y, fuse, fuseMax, time, kicked) {
  x = R(x); y = R(y); const k = fuseMax > 0 ? Math.max(0, fuse / fuseMax) : 0, blink = Math.floor(time * (6 + 26 * (1 - k))) % 2;
  g.fillStyle = '#1c1c24'; g.fillRect(x - 3, y - 6, 6, 6); g.fillStyle = kicked ? '#8fd160' : '#3e3e4a'; g.fillRect(x - 2, y - 6, 3, 1); g.fillStyle = '#6c4a28'; g.fillRect(x - 1, y - 8, 2, 2);
  g.fillStyle = blink ? '#fff2a0' : '#ff6b2c'; g.fillRect(x - 1 + (blink ? 1 : 0), y - 10, 1, 2);
  if (k < 0.45) { g.globalAlpha = 0.35 + 0.4 * blink; g.strokeStyle = '#ff4a3a'; g.lineWidth = 1; g.beginPath(); g.arc(x + 0.5, y - 3, 6 + 10 * k, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   /* the last of the fuse: a red ring closing */
}
export function bakeMonkeySet() {
  const fr = PMA_POSES.map(p => { const [c, g] = canvas(22, 20); drawMonkey(g, 10, 18, 1, p, 0.1, false); return outline(c, OUT); });
  return pack(fr, 10, 19, 8, 12);
}
