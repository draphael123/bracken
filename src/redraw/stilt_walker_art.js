// stilt_walker_art.js - THE GOBLIN STILT-WALKER, drawn (claude/fenroadart, the SONNET art pass over the greybox claude/fenroad). ART ONLY: the frame list is the contract (src/stilt-walker.js):
//   0 idle  1-2 stilt stride  3 JAB WINDUP (gaff up and back over his head)  4 JAB (driven down and forward)  5 HORN (gaff grounded, horn at his mouth)
//   6 TOPPLE (a stilt snapped, tipping)  7 DOWN (on his back, stilts broken)  8-9 stiltless walk  10 STAB WINDUP  11 STAB  12 hurt
// Every frame: baked once, alpha-snapped, outlined. A lookout goblin in a reed hat and a ragged purple tunic, a horn at his belt, on two lashed poles with footplates, a long iron boat-hook gaff.
import { outline } from '../px.js';

const SW = { sk: '#7aa04a', skL: '#9cc462', skD: '#4e7034', sk0: '#35502a', cl: '#74509a', clL: '#9068b8', clD: '#4a3266', lea: '#7a5a36', leaD: '#4a3420', st: '#a88450', stL: '#d2b070', stD: '#6a4c2c', ro: '#dcc88c', roD: '#a8925c',
  gaff: '#a8946a', gaffD: '#74603e', hook: '#d2dae4', hookD: '#8a929c', horn: '#eee2c4', hornD: '#b8a888', hat: '#d2b868', hatD: '#a08c44', hatDD: '#6a5a2a', eye: '#ffd36b', mouth: '#2a1210' };
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
function ln(g, x0, y0, x1, y1, c, th = 1) {   /* a crisp pixel line, th px thick (the extra pixel goes to the right) */
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy;
  for (;;) { for (let t = 0; t < th; t++) px(g, x0 + t, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
}
/* the head, shoulders and torso of a goblin whose feet are at (bx, fy); o.hat (default on), o.mouth open, o.eyes 'x' (hurt), o.lean px */
function gobBody(g, bx, fy, o = {}) {
  const hx = bx + (o.lean || 0);
  rc(g, bx - 3, fy - 11, 6, 7, SW.cl); rc(g, bx - 3, fy - 11, 2, 7, SW.clL); rc(g, bx - 3, fy - 5, 6, 1, SW.clD); for (let i = 0; i < 6; i += 2) px(g, bx - 3 + i, fy - 4, SW.clD);   /* the tunic, lit left, ragged hem */
  rc(g, bx - 3, fy - 7, 6, 1, SW.lea); px(g, bx, fy - 7, SW.ro);                                                                                                                      /* belt + buckle */
  ln(g, bx - 3, fy - 11, bx + 2, fy - 6, SW.leaD);                                                                                                                                      /* a strap across the chest */
  rc(g, hx - 3, fy - 17, 7, 6, SW.sk); rc(g, hx - 3, fy - 17, 7, 1, SW.skL); rc(g, hx - 3, fy - 12, 7, 1, SW.skD);                                                                      /* the head */
  rc(g, hx + 3, fy - 15, 3, 2, SW.sk); px(g, hx + 5, fy - 14, SW.skD);                                                                                                                  /* a long nose */
  rc(g, hx - 5, fy - 17, 2, 3, SW.skD); px(g, hx - 6, fy - 17, SW.skD); px(g, hx - 5, fy - 17, SW.skL);                                                                                  /* the ear, back and up */
  if (o.eyes === 'x') { for (const [a, b] of [[1, -15], [2, -14], [2, -15], [1, -14]]) px(g, hx + a, fy + b, SW.sk0); } else { px(g, hx + 1, fy - 15, SW.eye); px(g, hx + 2, fy - 15, SW.eye); px(g, hx + 2, fy - 14, SW.mouth); }
  if (o.mouth) rc(g, hx + 1, fy - 13, 3, 2, SW.mouth); else { rc(g, hx, fy - 12, 4, 1, SW.mouth); px(g, hx + 2, fy - 13, '#f2ead2'); }
  if (o.hat !== false) {   /* a lookout's reed hat: a wide brim, a low cone */
    rc(g, hx - 6, fy - 18, 13, 1, SW.hatD); rc(g, hx - 5, fy - 19, 11, 1, SW.hat); rc(g, hx - 3, fy - 20, 7, 1, SW.hat); rc(g, hx - 1, fy - 21, 3, 1, SW.hatD);
    px(g, hx - 6, fy - 17, SW.hatDD); px(g, hx + 6, fy - 17, SW.hatDD); px(g, hx - 2, fy - 19, SW.hatD); px(g, hx + 2, fy - 20, SW.hatD); }
}
const gobLegs = (g, bx, fy, k) => { const a = k ? 1 : 0; rc(g, bx - 3 - a, fy - 4, 2, 4, SW.skD); rc(g, bx + 1 + (k ? -a * 2 : 1), fy - 4, 2, 4, SW.skD); rc(g, bx - 3 - a, fy - 1, 3, 1, SW.leaD); rc(g, bx + 1 + (k ? -a * 2 : 1), fy - 1, 3, 1, SW.leaD); };
/* the horn at his belt (a curved cream horn on a cord) */
const beltHorn = (g, bx, fy) => { px(g, bx - 4, fy - 8, SW.horn); px(g, bx - 5, fy - 7, SW.horn); px(g, bx - 5, fy - 6, SW.hornD); px(g, bx - 4, fy - 5, SW.hornD); px(g, bx - 3, fy - 8, SW.ro); };
/* the stilts: two tall poles lashed to a footplate under each foot; stride swings the tips; broken = the near one snapped short with a splintered end */
function stilts(g, bx, fy, floor, stride, broken) {
  const sw = stride === 1 ? 3 : stride === 2 ? -2 : 0;
  const pole = (x0, x1, y1, c, cl) => { ln(g, x0, fy + 2, x1, y1, c, 2); ln(g, x0, fy + 2, x1, y1, cl, 1); px(g, x1, y1, c); px(g, x1 + 1, y1, c); };
  pole(bx - 5, bx - 5 - Math.round(sw * 0.6), floor, SW.stD, SW.st);                                            /* the far pole (darker) */
  if (!broken) pole(bx + 3, bx + 3 + sw, floor, SW.st, SW.stL);
  else { ln(g, bx + 3, fy + 2, bx + 6, fy + 9, SW.st, 2); px(g, bx + 7, fy + 10, SW.stL); px(g, bx + 6, fy + 11, SW.stD); px(g, bx + 8, fy + 9, SW.stD); }   /* snapped */
  for (const fx of [bx - 7, bx + 1]) { rc(g, fx, fy, 6, 2, SW.stD); rc(g, fx, fy, 6, 1, SW.st); rc(g, fx + 2, fy + 2, 2, 1, SW.ro); }   /* the footplates + the rope wraps */
  rc(g, bx - 4, fy - 3, 2, 1, SW.ro); rc(g, bx + 1, fy - 3, 2, 1, SW.ro);                                                                                             /* shin lashings */
}
/* the gaff: a long haft with an iron boat-hook; from the hand (hx,hy) to the end (ex,ey); the hook at the end */
function gaff(g, hx, hy, ex, ey) {
  ln(g, hx, hy, ex, ey, SW.gaff, 1); ln(g, hx, hy + 1, ex, ey + 1, SW.gaffD, 1);
  const dx = Math.sign(ex - hx) || 1, dy = Math.sign(ey - hy) || 1;
  px(g, ex + dx, ey + dy, SW.hook); px(g, ex + dx * 2, ey + dy, SW.hook); px(g, ex + dx * 2, ey, SW.hook); px(g, ex + dx, ey - dy, SW.hookD); px(g, ex + dx * 3, ey, SW.hook);   /* the iron hook */
}
const armTo = (g, sx, sy, hx, hy) => { ln(g, sx, sy, hx, hy, SW.sk, 2); px(g, sx, sy, SW.cl); px(g, sx + 1, sy, SW.cl); rc(g, hx - 1, hy - 1, 2, 2, SW.skL); };

export function bakeStiltSheet(canvasFn, flipX, whiten, STILT) {
  const CW = 44, CH = 48, ax = 22, ay = 46, frames = [];   /* the poles' tips at ay - 1; the goblin's feet 17 above them */
  const mk = fn => { const [c, g] = canvasFn(CW, CH); g.imageSmoothingEnabled = false; fn(g); const img = g.getImageData(0, 0, CW, CH), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(img, 0, 0); frames.push(outline(c, '#161a0e')); };
  const tall = (stride, mid, o = {}) => g => { const bx = ax, fy = ay - 17, floor = ay - 1; stilts(g, bx, fy, floor, stride, !!o.broken); gobLegs(g, bx, fy, !!stride); gobBody(g, bx, fy, o); beltHorn(g, bx, fy); mid(g, bx, fy); };
  const rest = (g, bx, fy) => { armTo(g, bx + 2, fy - 10, bx + 5, fy - 8); gaff(g, bx + 5, fy - 9, bx + 15, fy + 13); };
  mk(tall(0, rest));                                                                          // 0 idle
  mk(tall(1, rest)); mk(tall(2, rest));                                                       // 1-2 stride
  mk(tall(0, (g, bx, fy) => { armTo(g, bx + 2, fy - 10, bx + 4, fy - 15); gaff(g, bx + 4, fy - 15, bx - 9, fy - 26); px(g, bx + 4, fy - 16, SW.skL); }, { mouth: true }));    // 3 JAB WINDUP: the gaff drawn up and back over his head
  mk(tall(1, (g, bx, fy) => { armTo(g, bx + 2, fy - 10, bx + 7, fy - 6); gaff(g, bx + 6, fy - 9, bx + 24, fy + 7); ln(g, bx + 9, fy - 12, bx + 14, fy - 6, '#e8f0ec'); }, { lean: 2, mouth: true }));   // 4 JAB: driven down and forward, a flash along it
  mk(tall(0, (g, bx, fy) => { gaff(g, bx - 4, fy - 6, bx - 6, fy + 15); armTo(g, bx - 3, fy - 10, bx - 4, fy - 6);   // 5 HORN: the gaff grounded behind him, the horn to his mouth, the blast
    armTo(g, bx + 2, fy - 10, bx + 5, fy - 12); rc(g, bx + 4, fy - 14, 5, 2, SW.horn); rc(g, bx + 8, fy - 16, 2, 5, SW.horn); px(g, bx + 10, fy - 17, SW.hornD); px(g, bx + 10, fy - 11, SW.hornD); rc(g, bx + 4, fy - 12, 4, 1, SW.hornD);
    px(g, bx + 12, fy - 18, '#e6efe6'); px(g, bx + 13, fy - 15, '#e6efe6'); px(g, bx + 12, fy - 12, '#e6efe6'); }));
  mk(g => { g.save(); g.translate(ax, ay - 1); g.rotate(0.42); g.translate(-ax - 5, -(ay - 1)); const bx = ax, fy = ay - 17; stilts(g, bx, fy, ay - 1, 0, true); gobLegs(g, bx, fy, true); gobBody(g, bx, fy, { mouth: true, eyes: 'x' }); beltHorn(g, bx, fy); armTo(g, bx + 2, fy - 10, bx + 7, fy - 14); gaff(g, bx + 7, fy - 14, bx + 17, fy - 4); g.restore();
    px(g, ax - 14, ay - 8, '#e6efe6'); px(g, ax - 16, ay - 5, '#e6efe6'); });                  // 6 TOPPLE
  mk(g => { const y0 = ay - 6, x0 = ax - 5;   // 7 DOWN: on his back, legs up and kicking, the snapped stilts beside him, the hat off, gold glints of dizziness
    rc(g, x0, y0, 9, 5, SW.cl); rc(g, x0, y0, 9, 1, SW.clL); rc(g, x0, y0 + 4, 9, 1, SW.clD); rc(g, x0 + 9, y0 - 2, 6, 5, SW.sk); rc(g, x0 + 9, y0 - 2, 6, 1, SW.skL); px(g, x0 + 15, y0, SW.sk); px(g, x0 + 16, y0, SW.skD); rc(g, x0 + 7, y0 - 4, 2, 3, SW.skD);
    for (const [a, b] of [[12, -1], [13, 0], [13, -1], [12, 0]]) px(g, x0 + a, y0 + b, SW.sk0); rc(g, x0 + 11, y0 + 2, 3, 1, SW.mouth);
    ln(g, x0 + 1, y0 - 1, x0 - 4, y0 - 6, SW.skD, 2); ln(g, x0 + 4, y0 - 1, x0 + 2, y0 - 8, SW.skD, 2); rc(g, x0 - 5, y0 - 7, 3, 1, SW.leaD); rc(g, x0 + 1, y0 - 9, 3, 1, SW.leaD);
    ln(g, x0 - 3, ay - 3, x0 - 14, ay - 2, SW.st, 2); ln(g, x0 + 20, ay - 2, x0 + 14, ay - 8, SW.stD, 2); px(g, x0 - 14, ay - 3, SW.stL); px(g, x0 + 14, ay - 9, SW.stL);
    ln(g, x0 + 6, y0 - 8, x0 + 18, y0 - 10, SW.gaff, 1); px(g, x0 + 19, y0 - 10, SW.hook);
    rc(g, x0 + 18, ay - 3, 6, 2, SW.hatD); rc(g, x0 + 20, ay - 4, 3, 1, SW.hat);
    px(g, x0 + 10, y0 - 7, '#ffd36b'); px(g, x0 + 14, y0 - 9, '#ffd36b'); px(g, x0 + 6, y0 - 11, '#ffd36b'); });
  const low = (stride, arm, o = {}) => g => { const bx = ax, fy = ay - 2; gobLegs(g, bx, fy, !!stride); gobBody(g, bx, fy, o); beltHorn(g, bx, fy); arm(g, bx, fy); };
  const hobble = (g, bx, fy) => { armTo(g, bx + 2, fy - 10, bx + 5, fy - 7); ln(g, bx + 5, fy - 8, bx + 10, fy - 7, SW.gaffD, 1); px(g, bx + 11, fy - 7, SW.hook); };
  mk(low(0, hobble)); mk(low(1, hobble));                                                     // 8-9 stiltless walk (his broken haft held like a club)
  mk(low(0, (g, bx, fy) => { armTo(g, bx + 2, fy - 10, bx - 2, fy - 15); ln(g, bx - 2, fy - 15, bx - 6, fy - 19, SW.gaffD, 1); px(g, bx - 7, fy - 20, SW.hook); px(g, bx - 6, fy - 20, SW.hook); }, { mouth: true }));     // 10 STAB WINDUP
  mk(low(1, (g, bx, fy) => { armTo(g, bx + 3, fy - 9, bx + 10, fy - 7); ln(g, bx + 10, fy - 7, bx + 17, fy - 7, SW.hookD, 1); px(g, bx + 18, fy - 7, SW.hook); px(g, bx + 19, fy - 7, SW.hook); px(g, bx + 20, fy - 7, '#e8f0ec'); }, { lean: 1, mouth: true }));    // 11 STAB
  mk(g => { const bx = ax - 1, fy = ay - 17; stilts(g, bx, fy, ay - 1, 0, false); gobLegs(g, bx, fy, false); gobBody(g, bx, fy, { lean: -2, eyes: 'x', mouth: true }); beltHorn(g, bx, fy); armTo(g, bx + 2, fy - 10, bx + 6, fy - 14); gaff(g, bx + 6, fy - 14, bx + 14, fy + 8); });   // 12 hurt
  const L = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R: frames, L, white: { R: white, L: white.map(flipX) }, ax, ay, w: STILT.w, h: STILT.h };
}
