// winchmaster.js — THE WINCHMASTER's sprite (src/winchmaster.js is the fight). px.js primitives only; rendered in Node by
// tools/winchmaster-art.mjs. The shore.js contract: frames face RIGHT, one canvas each, grounded frames settled so ay = H.
//
// THE SILHOUETTE IS THE CREATURE at 320x180, so he is three shapes nothing else on the road has:
//   THE SHOULDERS   a yoke of muscle wider than he is tall, the head sunk between them - all shoulders and iron
//   THE APRON       a leather apron to the shins, dark and square, where every other goblin is a tunic
//   THE BELT        the counterweights: three iron cheeses hung round his waist, the widest thing about him
// and the tool of the moment in his hands: the brake bar, the release hook, the hatchet he cuts spans with.
//
// bakeWinchmaster()  0 idle | 1,2 pace | 3 LEVER TELL (the bar up over his head) | 4 LEVER (brought down) | 5 REVERSE (both hands
//                    hauling the brake back) | 6 SEND (a boot on the release, the hook up) | 7 CUT TELL (hatchet up) | 8 CUT
//                    (through) | 9 THROWN (tumbling, weights flying) | 10 DOWNED (THE OPENING: flat on his back on his own
//                    ledge) | 11 CLIMB (hauling up) | 12 hurt
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const C = {
  g: '#6faa4a', G: '#3f6e2c', gd: '#2a4a1e', eye: '#f3f0d2', pup: '#241a10',
  ap: '#5a3a22', apD: '#3a2414', apL: '#7a5234',                  // the apron: oiled leather
  sh: '#8a6a44', shD: '#5a4428',                                   // the shirt under it, sleeves rolled
  ir: ['#2a2a30', '#4a4a52', '#6a6a74', '#9a9aa4'],               // iron: the weights, the bar, the hook
  wood: '#8a5a32', woodD: '#5a3a1d',
};
function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(flipX), white = frames.map(whiten); return { R, L, white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; }
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }

export function bakeWinchmaster() {
  const W = 64, H = 48, cx = 28;
  const head = (g, x, y) => { ellipse(g, x, y, 5, 4.5, C.g); fillPoly(g, [[x - 4, y - 1], [x - 10, y - 4], [x - 9, y + 2], [x - 4, y + 2]], C.G);
    rect(g, x + 1, y - 2, 3, 2, C.eye); px(g, x + 3, y - 2, C.pup); rect(g, x - 2, y - 4, 6, 1, C.gd);           // a heavy brow
    rect(g, x - 1, y + 2, 6, 1, C.gd); px(g, x + 4, y + 1, '#e8e0c0'); px(g, x + 1, y + 1, '#e8e0c0'); };      // tusks
  /* THE YOKE: shoulders and arms-tops, a wide low hump the head sits down into */
  const yoke = (g, x, y) => { ellipse(g, x, y + 4, 13, 7, C.g); ellipse(g, x, y + 5, 12, 5, C.G); rect(g, x - 6, y + 7, 12, 4, C.sh); rect(g, x - 6, y + 10, 12, 1, C.shD); };
  const apron = (g, x, y, lean = 0) => { fillPoly(g, [[x - 8 + lean, y], [x + 8 + lean, y], [x + 9, y + 17], [x - 9, y + 17]], C.ap);
    rect(g, x - 8, y + 16, 17, 1, C.apD); line(g, x + lean, y + 1, x, y + 15, C.apL); rect(g, x - 2 + lean, y + 4, 5, 3, C.apD); };   // the bib pocket
  /* THE COUNTERWEIGHT BELT: three iron cheeses on a chain round his middle */
  const belt = (g, x, y, fly = 0) => { rect(g, x - 11, y, 22, 2, C.ir[0]);
    for (const [dx, dy] of [[-12, 1], [11, 1], [0, 3]]) { const X = x + dx + (fly ? Math.sign(dx || 1) * fly : 0), Y = y + dy - (fly ? fly : 0);
      ellipse(g, X, Y + 3, 4, 3, C.ir[1]); rect(g, X - 3, Y + 1, 6, 1, C.ir[3]); rect(g, X - 4, Y + 5, 8, 1, C.ir[0]); } };
  const legs = (g, x, y, step = 0) => { rect(g, x - 6 + step, y, 5, 7, C.G); rect(g, x + 2 - step, y, 5, 7, C.G); rect(g, x - 7 + step, y + 6, 7, 2, C.apD); rect(g, x + 1 - step, y + 6, 7, 2, C.apD); };
  const arm = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, C.g, 3); ellipse(g, x1, y1, 2.5, 2.5, C.G); };
  const bar = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, C.ir[1], 2); line(g, x0, y0, x1, y1, C.ir[3]); rect(g, x1 - 2, y1 - 2, 5, 5, C.ir[0]); };
  const hatchet = (g, x, y, up) => { line(g, x, y, x + (up ? -2 : 8), y + (up ? -12 : 6), C.wood, 2); const hx = x + (up ? -3 : 9), hy = y + (up ? -14 : 6);
    fillPoly(g, [[hx - 3, hy - 2], [hx + 4, hy - 4], [hx + 4, hy + 3], [hx - 3, hy + 1]], C.ir[2]); rect(g, hx + 3, hy - 4, 1, 7, C.ir[3]); };
  const F = [];
  for (let f = 0; f <= 12; f++) {
    const [c, g] = canvas(W, H); const base = H - 2, step = f === 1 ? 2 : f === 2 ? -2 : 0;
    if (f === 10) {   /* DOWNED: flat on his back, weights spilled, boots up */
      ellipse(g, cx, base - 5, 15, 5, C.ap); ellipse(g, cx - 2, base - 6, 12, 4, C.g); head(g, cx + 15, base - 6); rect(g, cx - 18, base - 12, 4, 8, C.G); rect(g, cx - 13, base - 14, 4, 9, C.G);
      for (const X of [cx - 6, cx + 3, cx + 26]) { ellipse(g, X, base - 2, 4, 3, C.ir[1]); rect(g, X - 3, base - 4, 6, 1, C.ir[3]); }
      line(g, cx + 20, base - 12, cx + 24, base - 18, '#ffd36b'); line(g, cx + 24, base - 14, cx + 28, base - 18, '#ffd36b');   // seeing stars
      outline(c, OUT); F.push(settle(c)); continue; }
    const tilt = f === 9 ? 5 : 0, y0 = base - 34 - (f === 11 ? 3 : 0);
    if (f !== 9) legs(g, cx, base - 8, step); else { rect(g, cx - 12, base - 12, 5, 7, C.G); rect(g, cx + 6, base - 16, 5, 7, C.G); }
    apron(g, cx, y0 + 16, f === 5 ? -3 : f === 4 || f === 8 ? 2 : 0);
    yoke(g, cx + (f === 5 ? -2 : 0), y0 + 6 + tilt);
    head(g, cx + 3 + (f === 5 ? -3 : f === 4 || f === 8 ? 2 : 0), y0 + 3 + tilt);
    belt(g, cx, y0 + 17, f === 9 ? 4 : 0);
    switch (f) {
      case 3: arm(g, cx + 6, y0 + 9, cx + 3, y0 - 2); arm(g, cx - 6, y0 + 9, cx - 2, y0 - 2); bar(g, cx - 10, y0 - 4, cx + 14, y0 - 6); break;
      case 4: arm(g, cx + 8, y0 + 9, cx + 16, y0 + 18); bar(g, cx + 10, y0 + 4, cx + 26, y0 + 28); break;
      case 5: arm(g, cx - 8, y0 + 9, cx - 16, y0 + 10); arm(g, cx - 4, y0 + 10, cx - 14, y0 + 13); bar(g, cx - 14, y0 + 12, cx - 6, y0 - 10); break;   // hauling the brake back
      case 6: arm(g, cx + 7, y0 + 9, cx + 12, y0 + 1); line(g, cx + 12, y0 + 1, cx + 12, y0 - 8, C.ir[2], 2); rect(g, cx + 10, y0 - 10, 5, 2, C.ir[3]);
              rect(g, cx + 6, base - 12, 8, 3, C.apD); break;                                                          // the hook up, a boot on the release
      case 7: arm(g, cx + 6, y0 + 9, cx + 4, y0 - 1); hatchet(g, cx + 4, y0 - 1, true); break;
      case 8: arm(g, cx + 8, y0 + 9, cx + 15, y0 + 14); hatchet(g, cx + 15, y0 + 14, false); break;
      case 9: arm(g, cx + 6, y0 + 9, cx + 14, y0 - 2); arm(g, cx - 6, y0 + 9, cx - 14, y0 - 1); break;             // thrown: arms flung up
      case 11: arm(g, cx + 6, y0 + 9, cx + 10, y0 - 6); arm(g, cx - 4, y0 + 9, cx + 4, y0 - 7); break;             // hauling up
      case 12: arm(g, cx + 6, y0 + 9, cx + 14, y0 + 16); arm(g, cx - 6, y0 + 9, cx - 12, y0 + 15); break;
      default: arm(g, cx + 7, y0 + 9, cx + 11, y0 + 17 + (step > 0 ? 1 : 0)); bar(g, cx + 11, y0 + 17, cx + 20, y0 + 26); arm(g, cx - 7, y0 + 9, cx - 10, y0 + 17);   // the brake bar carried low
    }
    outline(c, OUT); F.push(f === 9 ? c : settle(c));
  }
  return pack(F, cx, H, 24, 36);
}

// bakeWinchHook() — THE HOOK ITSELF, on its own two frames: not his hatchet (src/winchmaster.js drew it as bare rects until
// 2026-09-24; wired into drawWinchFx for both the tell and the throw). 0 COILED (still on the chain, the wind-up and the
// retrieve) | 1 OPEN (barb out, flying and embedded). Small enough it needs no settle() - it never touches the ground.
export function bakeWinchHook() {
  const W = 14, H = 14, cx = 7, cy = 7;
  const F = [];
  { // 0: COILED - a tight iron curl, straight up its own short length of chain
    const [c, g] = canvas(W, H);
    line(g, cx, 0, cx, 6, C.ir[1], 2); line(g, cx, 0, cx, 6, C.ir[3]);
    fillPoly(g, [[cx - 3, 6], [cx + 3, 6], [cx + 3, 10], [cx, 13], [cx - 3, 10]], C.ir[2]);
    rect(g, cx - 1, 7, 2, 3, C.ir[3]); rect(g, cx - 2, 9, 4, 1, C.ir[0]);
    outline(c, OUT); F.push(c); }
  { // 1: OPEN - swung wide, barb forward, the chain trailing behind at an angle
    const [c, g] = canvas(W, H);
    line(g, cx - 4, 0, cx, 5, C.ir[1], 2); line(g, cx - 4, 0, cx, 5, C.ir[3]);
    fillPoly(g, [[cx - 2, 5], [cx + 5, 4], [cx + 6, 9], [cx + 2, 13], [cx - 3, 10]], C.ir[2]);
    rect(g, cx + 2, 6, 2, 3, C.ir[3]); rect(g, cx - 1, 8, 3, 1, C.ir[0]);
    outline(c, OUT); F.push(c); }
  return pack(F, cx, cy, W, H);
}
