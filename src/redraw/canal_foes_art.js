// canal_foes_art.js - the canal's foes, redrawn for READABILITY (claude/canalart). Same frames, anchors and boxes as the greybox (src/canal-foes.js owns the numbers):
//   THE GRINDYLOW  a hunched imp, weed-slick, long thin arms with long fingers, weed hair, needle teeth, big pale eyes - and a PALE RIM LIGHT round the whole body, because the
//                  water is near-black and a dark-green imp on it was a hole. 0 surfaced | 1 the reach (the grab) | 2 hurt | 3 stranded (flat on the wall)
//   THE WISP       a COLD flame with no wick: green, white-cored, a faint face in it, flecks trailing - the false lantern. Every real lantern in the level is amber, square-caged and on a post.
//   THE LAMPLIGHTER  the snuffer's walk, reskinned: a long dark-blue coat with brass buttons, a flat cap, a lamplighter's pole (frames as the snuffer: 0 stand, 1 walk, 2 relight, 3 swipe, 4 walk2, 5 hurt)
import { canvas, px, rect, line, ellipse, fillPoly, outline, flipX, whiten } from '../px.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });

export function bakeGrindylow(GW, GH) {
  const W = 26, H = 20, cx = 12, C = { b: '#2c5a3c', bL: '#4a8a58', bD: '#183424', weed: '#1e4a28', weedL: '#3a7a3c', eye: '#f4ffc8', pup: '#0a100a', claw: '#d8e8a8', tooth: '#f0f8e0', rim: '#86d4b4' };
  const fr = [0, 1, 2, 3].map(f => { const [c, g] = canvas(W, H), y0 = f === 3 ? 10 : 6;
    ellipse(g, cx, y0 + 7, 6, 5, C.b); ellipse(g, cx - 1, y0 + 6, 4, 3, C.bL); rect(g, cx - 4, y0 + 10, 8, 1, C.bD);                         /* the body, hunched, slick */
    ellipse(g, cx + 2, y0 + 1, 4, 3.5, C.b); rect(g, cx + 1, y0 - 1, 5, 1, C.bD); ellipse(g, cx + 1, y0, 2, 1, C.bL);                          /* the head */
    for (const [dx, dy, ex, ey] of [[0, -1, -4, -5], [2, -2, -1, -6], [4, -2, 3, -6], [-1, 0, -5, -3]]) line(g, cx + 2 + dx, y0 + dy, cx + 2 + ex, y0 + ey, C.weed);   /* weed hair, straggling */
    px(g, cx - 2, y0 - 5, C.weedL); px(g, cx + 5, y0 - 6, C.weedL);
    if (f === 2) { line(g, cx + 2, y0, cx + 4, y0 + 1, C.pup); line(g, cx + 5, y0, cx + 7, y0 + 1, C.pup); }
    else { rect(g, cx + 2, y0 - 1, 2, 2, C.eye); rect(g, cx + 5, y0 - 1, 2, 2, C.eye); px(g, cx + 3, y0, C.pup); px(g, cx + 6, y0, C.pup); }                 /* big pale eyes */
    for (let k = 0; k < 4; k++) px(g, cx + 3 + k, y0 + 3, k % 2 ? C.tooth : C.pup);                                                               /* needle teeth */
    for (let k = 0; k < 4; k++) { px(g, cx - 5 + k * 3, y0 + 11, C.weed); px(g, cx - 5 + k * 3, y0 + 12, C.weedL); }                              /* weed trailing off it */
    const arm = (x0, y1, x1, y2, col) => { line(g, x0, y1, (x0 + x1) >> 1, (y1 + y2) / 2 - 1, col); line(g, (x0 + x1) >> 1, (y1 + y2) / 2 - 1, x1, y2, col); px(g, x1 + 1, y2 + 1, C.claw); px(g, x1, y2 + 1, C.claw); px(g, x1 - 1, y2 + 1, C.claw); };
    if (f === 1) { arm(cx + 4, y0 + 5, cx + 12, y0 + 9, C.bL); arm(cx - 3, y0 + 6, cx + 8, y0 + 11, C.b); }                                           /* the reach: both arms out low, fingers spread */
    else if (f === 2) { arm(cx + 3, y0 + 5, cx + 8, y0 + 1, C.bL); arm(cx - 3, y0 + 5, cx - 8, y0 + 1, C.bL); }
    else if (f === 3) { arm(cx - 5, y0 + 5, cx - 11, y0 + 8, C.bL); arm(cx + 5, y0 + 5, cx + 11, y0 + 8, C.bL); }
    else { arm(cx + 4, y0 + 6, cx + 8, y0 + 10, C.bL); arm(cx - 4, y0 + 6, cx - 7, y0 + 10, C.b); }
    outline(c, C.rim); return c; });
  return pack(fr, 12, H - 1, GW, GH);
}
export function bakeWisp(WW, WH) {
  const W = 14, H = 16, C = { o: '#1c6a52', m: '#6ae8b0', c: '#eafff0', rim: '#a0ffd2' };
  const fr = [0, 1, 2].map(f => { const [c, g] = canvas(W, H), lean = f === 1 ? 1 : 0, big = f === 2 ? 1 : 0;
    fillPoly(g, [[7 + lean, 0 - big], [11 + big, 8], [10, 13], [4, 13], [3 - big, 8]], C.o);
    fillPoly(g, [[7 + lean, 3 - big], [9 + big, 9], [8, 12], [5, 12], [5 - big, 9]], C.m);
    ellipse(g, 7, 10, 1 + big, 1.5 + big, C.c);
    px(g, 6, 9, '#0a3a2a'); px(g, 8, 9, '#0a3a2a'); px(g, 7, 11, '#0a3a2a');                                    /* a faint face */
    px(g, 2, 14, C.rim); px(g, 11, 15, C.rim); px(g, 5, 15, C.rim);                                             /* flecks trailing off it */
    outline(c, 'rgba(160,255,210,0.5)'); return c; });
  return pack(fr, 7, H - 1, WW, WH);
}
export function bakeLamplighter() {
  const W = 16, H = 16, x0 = 7, F = 15, C = { skin: '#4a7a3a', skinD: '#2e5024', coat: '#1c2c44', coatL: '#2e4668', coatD: '#101a2a', brass: '#e0b84a', cap: '#14181c', pole: '#6a5a3a', eye: '#ffd060', cup: '#8a8a94', smoke: '#8a8a9a' };
  const gob = (g, { step = 0, pole = 'none', lean = 0 } = {}) => { const x = x0 + lean;
    fillPoly(g, [[x - 3, F - 10], [x + 3, F - 10], [x + 5, F - 1], [x - 5, F - 1]], C.coat); line(g, x + 3, F - 9, x + 5, F - 2, C.coatL); rect(g, x - 3, F - 10, 6, 1, C.coatL); rect(g, x - 1, F - 7, 1, 1, C.brass); rect(g, x - 1, F - 5, 1, 1, C.brass); rect(g, x - 1, F - 3, 1, 1, C.brass);    /* the long coat, three buttons */
    rect(g, x - 5, F - 1, 10, 1, C.coatD); rect(g, x - 3 + step, F, 2, 1, C.skinD); rect(g, x + 1 - step, F, 2, 1, C.skinD);
    ellipse(g, x, F - 12, 3, 2.6, C.skin); rect(g, x - 4, F - 15, 8, 2, C.cap); rect(g, x - 3, F - 16, 6, 1, C.cap); rect(g, x - 5, F - 14, 10, 1, C.cap); px(g, x + 1, F - 12, C.eye); px(g, x + 3, F - 11, C.skinD);        /* a flat cap, a lamp-eye */
    if (pole === 'up') { line(g, x + 2, F - 9, x + 3, F - 16, C.pole); rect(g, x + 2, F - 16, 3, 2, C.cup); px(g, x + 3, F - 16, C.smoke); px(g, x + 5, F - 16, C.smoke); }      /* the pole raised to the lamp */
    else if (pole === 'swipe') { line(g, x + 3, F - 8, x + 10, F - 7, C.pole); rect(g, x + 10, F - 8, 3, 2, C.cup); for (let k = 0; k < 3; k++) px(g, x + 6 + k * 2, F - 11 + k, '#ffffff'); } };
  const mk = fn => { const [c, g] = canvas(W, H); fn(g); return outline(c, '#0a0e14'); };
  const Fr = [g => gob(g, {}), g => gob(g, { step: 1, lean: 1 }), g => gob(g, { pole: 'up' }), g => gob(g, { pole: 'swipe', lean: 1 }), g => gob(g, { step: -1, lean: 1 }), g => { gob(g, { lean: -2 }); px(g, 3, 3, C.smoke); }].map(mk);
  return pack(Fr, 7, 15, 10, 14);
}
