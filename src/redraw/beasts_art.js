// beasts_art.js - SNOWRUNNER, GREYMANE and BRUIN (claude/beastsbones): PALETTE-BLOCK PLACEHOLDERS in the right silhouettes. The art lane redraws them to the Frog King bar
// (plan section 4: Snowrunner 24x16 x13 frames, Greymane 32x20 x14, Bruin 40x32 x16 + a frost recolour). Made from px.js primitives only, in the contract hornsman_art.js keeps:
// every frame faces RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the body's centre column, ay = the row under the lowest pixel, w/h = the hit box.
// The LAST frame is the death (HAS_HURT: the corpse lies in it); the frame before it is the hurt flash.
//   snowrunner  0,1 idle | 2-5 run | 6 SNAP TELL (half-crouch, ears back) | 7 SNAP (darting, jaws open) | 8 LEAP TELL (rears back) | 9 LEAP (stretched in the air) | 10 skid | 11 hurt | 12 death
//   greymane    0,1 idle | 2-5 walk | 6 BITE TELL (head low, paw scrape) | 7 BITE (lunge, jaws wide) | 8 POUNCE COIL | 9 POUNCE AIR | 10 PIN (on top) | 11 winded | 12 hurt | 13 death
//   bruin       0,1 idle | 2-5 walk | 6,7 STAND + ROAR | 8 MAUL (both paws down) | 9 CHARGE TELL (fours, head low) | 10-12 charge run | 13 dazed | 14 hurt | 15 death
import { canvas, rect, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });

export const BEAST_PAL = {
  snowrunner: { coat: '#cfe0ee', coatL: '#f2f8ff', coatD: '#8aa4bc', tip: '#1c2230', eye: '#9ed8ff', mouth: '#7a2a2a', frost: '#e8f6ff' },
  greymane: { coat: '#7c828c', coatL: '#aab0bc', coatD: '#4a4e58', ruff: '#c8d8e6', eye: '#ffd36b', mouth: '#6a2222', scar: '#c8b0a0' },
  bruin: { coat: '#4a3424', coatL: '#6e4e34', coatD: '#2a1c12', claw: '#e8dcc0', eye: '#ffb04a', mouth: '#7a2a22', frost: '#c8cfd6' },
};

/* a four-legged block body: body rect, legs, head with jaw, ears, tail at the pose given */
function quad(g, P, o) {
  const { x, y, bw, bh, lh } = o;                       // body left x, body top y, body size, leg length
  const hx = x + bw - 2 + (o.reach || 0), hy = y + (o.headDy || 0), hw = o.hw, hh = o.hh;
  for (const [lx, dy] of o.legs || [[x + 2, 0], [x + 5, 0], [x + bw - 7, 0], [x + bw - 4, 0]]) { rect(g, lx, y + bh - 1, 2, lh + dy, P.coatD); rect(g, lx, y + bh - 1 + lh + dy - 1, 3, 1, P.coatD); }
  rect(g, x - (o.tail || 3), y + 1 + (o.tailDy || 0), (o.tail || 3), 2, P.coat);
  rect(g, x, y, bw, bh, P.coat); rect(g, x, y, bw, 1, P.coatL); rect(g, x, y + bh - 1, bw, 1, P.coatD);
  if (P.ruff) rect(g, x + bw - 7, y - 1, 7, bh + 1, P.ruff);
  rect(g, hx, hy, hw, hh, P.coat); rect(g, hx, hy, hw, 1, P.coatL); rect(g, hx + hw - 1, hy + Math.floor(hh / 2), 2, Math.max(1, hh - Math.floor(hh / 2) - 1), P.coatD);
  rect(g, hx + hw - 4, hy + 1, 2, 1, P.eye);
  if (o.jaw) { rect(g, hx + 2, hy + hh, hw - 1, o.jaw, P.mouth); rect(g, hx + 2, hy + hh + o.jaw, hw - 1, 1, P.coatD); }
  rect(g, hx + 1 + (o.earBack || 0), hy - 2, 2, 2, P.tip || P.coatD); rect(g, hx + 3 + (o.earBack || 0), hy - 2, 2, 2, P.tip || P.coatD);
  if (o.frost) { rect(g, hx + hw + 1, hy + 1, 3, 1, P.frost || '#e8f6ff'); rect(g, hx + hw + 2, hy + 3, 2, 1, P.frost || '#e8f6ff'); }
}

export function bakeSnowrunner() {
  const P = BEAST_PAL.snowrunner, W = 26, H = 18;
  const F = frames(W, H, 13, (g, f) => {
    const run = f >= 2 && f <= 5, k = (f - 2) % 4;
    const base = { x: 4, y: 5, bw: 12, bh: 5, lh: 3, hw: 6, hh: 4 };
    if (f === 0 || f === 1) quad(g, P, { ...base, headDy: f === 1 ? 1 : 0 });
    else if (run) { const s = [[0, 2], [2, 0], [0, -2], [-2, 0]][k]; quad(g, P, { ...base, y: 5 - (k % 2), tail: 5, legs: [[3 + s[0], 0], [6 + s[1], 0], [11 - s[0], 0], [14 - s[1], 0]], reach: 1 }); }
    else if (f === 6) quad(g, P, { ...base, y: 7, bh: 4, lh: 2, headDy: 1, earBack: -2, tailDy: 1 });
    else if (f === 7) quad(g, P, { ...base, x: 6, y: 5, reach: 3, jaw: 2, tail: 6 });
    else if (f === 8) quad(g, P, { ...base, y: 3, bh: 6, lh: 2, headDy: -2, reach: -2, frost: true, legs: [[4, 0], [7, 0], [12, 1], [14, 1]] });
    else if (f === 9) quad(g, P, { ...base, x: 6, y: 2, bh: 4, lh: 3, reach: 3, headDy: 0, jaw: 1, tail: 6, legs: [[2, -1], [4, -1], [14, -1], [16, -1]] });
    else if (f === 10) quad(g, P, { ...base, y: 6, bh: 4, lh: 2, tail: 2, legs: [[4, 0], [7, 0], [12, 0], [15, 0]] });
    else if (f === 11) quad(g, P, { ...base, y: 4, headDy: -1, reach: -1, earBack: -2 });
    else { rect(g, 3, 11, 14, 4, P.coat); rect(g, 3, 11, 14, 1, P.coatL); rect(g, 15, 10, 5, 4, P.coat); rect(g, 6, 15, 8, 1, P.coatD); rect(g, 2, 14, 3, 1, P.coatD); }
  });
  return pack(F, 13, H - 1, 18, 10);
}

export function bakeGreymane() {
  const P = BEAST_PAL.greymane, W = 34, H = 22;
  const F = frames(W, H, 14, (g, f) => {
    const walk = f >= 2 && f <= 5, k = (f - 2) % 4;
    const base = { x: 5, y: 6, bw: 17, bh: 7, lh: 5, hw: 8, hh: 6, tail: 4 };
    if (f === 0 || f === 1) quad(g, P, { ...base, headDy: 2 + (f === 1 ? 1 : 0) });
    else if (walk) { const s = [[0, 2], [2, 0], [0, -2], [-2, 0]][k]; quad(g, P, { ...base, y: 6 - (k % 2), headDy: 2, legs: [[7 + s[0], 0], [11 + s[1], 0], [16 - s[0], 0], [19 - s[1], 0]] }); }
    else if (f === 6) quad(g, P, { ...base, y: 7, bh: 6, headDy: 5, jaw: 2, earBack: -1, legs: [[7, 0], [11, 0], [16, 0], [19, 0]] });
    else if (f === 7) quad(g, P, { ...base, x: 8, y: 6, reach: 5, jaw: 3, headDy: 3, tail: 6 });
    else if (f === 8) quad(g, P, { ...base, y: 8, bh: 6, lh: 3, headDy: 0, reach: -3, tailDy: 2, legs: [[5, 2], [9, 2], [16, 0], [19, 0]] });
    else if (f === 9) quad(g, P, { ...base, x: 7, y: 3, lh: 4, reach: 4, jaw: 2, headDy: 0, tail: 7, legs: [[3, -2], [6, -2], [19, -1], [22, -1]] });
    else if (f === 10) quad(g, P, { ...base, x: 6, y: 5, reach: 6, jaw: 3, headDy: 1, legs: [[8, 1], [12, 1], [17, 1], [20, 1]] });
    else if (f === 11) { quad(g, P, { ...base, y: 8, bh: 6, lh: 3, headDy: 5, legs: [[7, 0], [11, 0], [16, 0], [19, 0]] }); for (const sx of [10, 16, 22]) { rect(g, sx, 2, 2, 2, '#ffd36b'); rect(g, sx, 1, 2, 1, '#fff6c8'); } }
    else if (f === 12) quad(g, P, { ...base, y: 5, headDy: 0, reach: -2, earBack: -2 });
    else { rect(g, 4, 13, 20, 6, P.coat); rect(g, 4, 13, 20, 1, P.coatL); rect(g, 20, 12, 8, 6, P.coat); rect(g, 7, 19, 12, 1, P.coatD); rect(g, 22, 15, 5, 1, P.scar); }
  });
  return pack(F, 17, H - 1, 26, 15);
}

export function bakeBruin() {
  const P = BEAST_PAL.bruin, W = 44, H = 36;
  const F = frames(W, H, 16, (g, f) => {
    const walk = f >= 2 && f <= 5, k = (f - 2) % 4, run = f >= 10 && f <= 12, kr = f - 10;
    const base = { x: 6, y: 12, bw: 22, bh: 12, lh: 8, hw: 10, hh: 8, tail: 3 };
    // standing on the hind legs (the maul's tell): a tall bulk, the forepaws up
    const stand = (up, jaw) => { const x = 14; rect(g, x, 12, 12, 18, P.coat); rect(g, x, 12, 12, 1, P.coatL); rect(g, x + 1, 30, 4, 4, P.coatD); rect(g, x + 7, 30, 4, 4, P.coatD);
      rect(g, x + 7, 3, 10, 9, P.coat); rect(g, x + 7, 3, 10, 1, P.coatL); rect(g, x + 14, 6, 4, 4, P.coatD); rect(g, x + 13, 5, 2, 1, P.eye);
      rect(g, x + 8, 1, 2, 2, P.coatD); rect(g, x + 13, 1, 2, 2, P.coatD); if (jaw) rect(g, x + 9, 11, 7, 3, P.mouth);
      for (const [px_, py_] of up) { rect(g, px_, py_, 4, 9, P.coat); rect(g, px_, py_ - 2, 4, 2, P.claw); } };
    if (f === 0 || f === 1) quad(g, P, { ...base, headDy: 3 + (f === 1 ? 1 : 0) });
    else if (walk) { const s = [[0, 2], [2, 0], [0, -2], [-2, 0]][k]; quad(g, P, { ...base, y: 12 - (k % 2), headDy: 3, legs: [[9 + s[0], 0], [14 + s[1], 0], [22 - s[0], 0], [26 - s[1], 0]] }); }
    else if (f === 6) stand([[28, 14], [31, 16]], false);
    else if (f === 7) stand([[28, 8], [31, 6]], true);
    else if (f === 8) { stand([[30, 22], [33, 22]], true); rect(g, 33, 30, 8, 2, '#c8cfd6'); }
    else if (f === 9) quad(g, P, { ...base, y: 14, bh: 11, headDy: 6, earBack: -1, legs: [[9, 0], [14, 0], [22, 0], [26, 0]] });
    else if (run) quad(g, P, { ...base, x: 8, y: 12 + (kr % 2), headDy: 5, reach: 3, tail: 5, legs: [[5 + kr, -1], [9, -2], [24 - kr, -1], [28, -2]] });
    else if (f === 13) { quad(g, P, { ...base, y: 14, bh: 11, headDy: 7, legs: [[9, 0], [14, 0], [22, 0], [26, 0]] }); for (const sx of [14, 22, 30]) { rect(g, sx, 4, 2, 2, '#ffd36b'); rect(g, sx, 3, 2, 1, '#fff6c8'); } }
    else if (f === 14) quad(g, P, { ...base, y: 11, headDy: 1, reach: -2, earBack: -2 });
    else { rect(g, 4, 22, 28, 9, P.coat); rect(g, 4, 22, 28, 1, P.coatL); rect(g, 28, 20, 10, 10, P.coat); rect(g, 8, 31, 18, 2, P.coatD); rect(g, 36, 24, 2, 2, P.claw); }
  });
  return pack(F, 22, H - 1, 28, 16);
}
