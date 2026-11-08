// beasts_art.js - THE FROST BEASTS (claude/foes): CODE PLACEHOLDERS - palette blocks in the right silhouettes, drawn from px.js primitives only, in the contract hornsman_art.js keeps:
// every frame faces RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the body's centre column, ay = the row under the lowest pixel, w/h = the hit box.
// The ART LANE redraws these to the Frog King bar (docs: scratch/lane-reports/wolves-plan.md section 4). Frame lists (src/beasts.js BEAST_FRAMES):
//   SNOWRUNNER 24x16 (13): 0-1 idle | 2-5 run | 6 snap tell (half-crouch, ears back) | 7 snap | 8 leap tell (rears back, frost puff) | 9 leap | 10 skid | 11 hurt | 12 death
//   GREYMANE   32x20 (14): 0-1 idle | 2-5 walk | 6 bite tell (head low, jaws wide) | 7 bite | 8 pounce coil | 9 pounce air | 10 pin | 11 winded | 12 hurt | 13 death
//   BRUIN      40x32 (16): 0-1 idle | 2-5 walk | 6 stand + roar | 7 stood, open | 8 maul | 9 charge tell (head low, scrape) | 10-12 charge | 13 dazed | 14 hurt | 15 death
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });

export const BC = {
  snow: '#dfeaf2', snowL: '#f6fbff', snowD: '#a9bccb', ear: '#1c2230', eye: '#9ed8ff', nose: '#222a38', breath: '#e8f4ff',
  grey: '#6e7480', greyL: '#9aa2ae', greyD: '#454a55', ice: '#bfe8ff', scar: '#c8c0b4', eyeG: '#ffd36b',
  brown: '#5a3a26', brownL: '#7e5a3a', brownD: '#34211a', snout: '#a8845c', claw: '#e8e0d0', fur: '#8a8478', furL: '#b4ad9c' };

/* a four-legged body, facing right. o: { bx, by (body centre), rx, ry, c, cL, cD, head:{x,y,r}, snout, ear, tail:[dx,dy], legs:[[hx,len,dx] ...] (hip x offset, length, foot dx), mouth: open px, lowered: head dy } */
function quad(g, o) {
  const { bx, by, rx, ry, c, cL, cD } = o;
  for (const [hx, len, dx, back] of o.legs) { const x = bx + hx; rect(g, x + dx * 0.5, by + ry - 2, 3, len, back ? cD : c); rect(g, x + dx, by + ry - 2 + len, 4, 1, cD); }
  if (o.tail) { line(g, bx - rx + 1, by - 1, bx - rx + o.tail[0], by + o.tail[1], c, 2); }
  ellipse(g, bx, by, rx, ry, c); ellipse(g, bx - 1, by - ry * 0.4, rx * 0.8, ry * 0.5, cL);
  if (o.ruff) { ellipse(g, bx + rx * 0.45, by - 1, o.ruff, ry + 1, o.ruffCol || cL); }
  const hx = bx + rx + (o.head.x || 0), hy = by - ry * 0.5 + (o.head.y || 0), r = o.head.r || 4;
  ellipse(g, hx, hy, r, r - 0.5, c); rect(g, hx + r - 2, hy - 1, (o.snout || 4), 3, c); rect(g, hx + r - 2, hy - 1, (o.snout || 4), 1, cL);
  px(g, hx + r + (o.snout || 4) - 3, hy - 1, o.nose || '#222a38');
  if (o.mouth) { rect(g, hx + r - 1, hy + 2, (o.snout || 4) + 1, 1, '#2a1018'); rect(g, hx + r - 1, hy + 1 + o.mouth, (o.snout || 4) + 1, 1, c); px(g, hx + r + 1, hy + 1, '#ffffff'); px(g, hx + r + 2, hy + 2 + o.mouth, '#ffffff'); }
  const ex = o.earBack ? hx - 2 : hx - 1; fillPoly(g, [[ex, hy - r + 1], [ex + 2, hy - r - (o.earH || 3)], [ex + 3, hy - r + 1]], o.ear || cD);
  px(g, hx + 1, hy - 1, o.eye || '#fff');
  return { hx, hy };
}

export function bakeSnowrunner() {
  const W = 24, H = 16;
  const F = frames(W, H, 13, (g, f) => {
    const C = { c: BC.snow, cL: BC.snowL, cD: BC.snowD, ear: BC.ear, eye: BC.eye, nose: BC.nose };
    const run = f >= 2 && f <= 5, k = f - 2, st = run ? [3, -3, 2, -2][k] : 0;
    let o = { bx: 10, by: 9, rx: 8, ry: 3.5, ...C, head: { x: 0, y: 0, r: 3.5 }, snout: 3, tail: [-4, 1], legs: [[-5, 4, st, 1], [-3, 4, -st, 1], [3, 4, -st, 0], [5, 4, st, 0]] };
    if (f === 6) o = { ...o, by: 11, ry: 3, head: { x: -1, y: 1 }, earBack: true, legs: [[-5, 2, -2, 1], [-3, 2, 1, 1], [3, 2, 2, 0], [5, 2, 3, 0]] };               // snap tell: half-crouch, ears back
    else if (f === 7) o = { ...o, bx: 12, by: 10, rx: 9, head: { x: 3, y: 1 }, mouth: 2, snout: 4, legs: [[-6, 4, -3, 1], [-4, 4, -2, 1], [4, 3, 3, 0], [6, 3, 4, 0]] };    // snap: darting in, jaws open
    else if (f === 8) o = { ...o, bx: 9, by: 9, rx: 7, ry: 3.5, head: { x: 1, y: -3, r: 3.5 }, tail: [-3, 3], legs: [[-5, 2, -2, 1], [-3, 2, -1, 1], [2, 5, 1, 0], [4, 5, 2, 0]] };   // leap tell: hindquarters low, head up
    else if (f === 9) o = { ...o, bx: 11, by: 7, rx: 9, ry: 3, head: { x: 3, y: -1 }, mouth: 1, snout: 4, tail: [-5, 0], legs: [[-6, 3, -5, 1], [-4, 3, -4, 1], [4, 3, 4, 0], [6, 3, 6, 0]] };   // leap: stretched, airborne
    else if (f === 10) o = { ...o, bx: 11, by: 10, head: { x: 0, y: 1 }, legs: [[-5, 4, -1, 1], [-3, 4, 0, 1], [3, 4, 4, 0], [5, 4, 5, 0]] };       // skid: forelegs braced out
    else if (f === 11) o = { ...o, bx: 9, by: 10, head: { x: -2, y: 2 }, earBack: true, eye: '#ffffff', legs: [[-5, 3, -2, 1], [-3, 3, -1, 1], [3, 3, 1, 0], [5, 3, 2, 0]] };     // hurt
    else if (f === 12) o = { ...o, bx: 11, by: 12, rx: 9, ry: 2.6, head: { x: 1, y: 2 }, eye: BC.snowD, legs: [[-5, 1, -5, 1], [-3, 1, -4, 1], [3, 1, 5, 0], [5, 1, 6, 0]] };    // death: lying
    const { hx, hy } = quad(g, o);
    if (f === 8) { for (const [dx, dy] of [[5, -1], [8, -3], [11, -2]]) px(g, hx + dx, hy + dy, BC.breath); }   // the frost puff of the rear-back
    if (f === 6) px(g, hx + 6, hy + 1, BC.breath);
  });
  return pack(F, 10, H - 1, 18, 10);
}

export function bakeGreymane() {
  const W = 32, H = 20;
  const F = frames(W, H, 14, (g, f) => {
    const C = { c: BC.grey, cL: BC.greyL, cD: BC.greyD, ear: BC.greyD, eye: BC.eyeG, nose: '#1a1c22', ruff: 5, ruffCol: BC.ice };
    const walk = f >= 2 && f <= 5, k = f - 2, st = walk ? [3, -2, 2, -3][k] : 0;
    let o = { bx: 14, by: 11, rx: 11, ry: 5, ...C, head: { x: 0, y: 1, r: 5 }, snout: 5, tail: [-6, 3], legs: [[-7, 5, st, 1], [-4, 5, -st, 1], [4, 5, -st, 0], [7, 5, st, 0]] };
    if (f === 6) o = { ...o, by: 12, head: { x: 1, y: 4 }, mouth: 3, snout: 6, legs: [[-7, 4, -2, 1], [-4, 4, 0, 1], [4, 4, 3, 0], [7, 4, 4, 0]] };          // bite tell: head low, jaws wide, a paw scraping
    else if (f === 7) o = { ...o, bx: 16, by: 12, head: { x: 3, y: 3 }, mouth: 3, snout: 6, legs: [[-7, 4, -3, 1], [-4, 4, -1, 1], [4, 4, 4, 0], [7, 4, 5, 0]] };   // bite: the lunge
    else if (f === 8) o = { ...o, bx: 12, by: 12, ry: 5, head: { x: 1, y: -1 }, tail: [-5, 4], legs: [[-7, 3, -3, 1], [-4, 3, -2, 1], [4, 5, 1, 0], [7, 5, 2, 0]] };   // pounce coil: hindquarters tucked
    else if (f === 9) o = { ...o, bx: 15, by: 8, rx: 12, ry: 4, head: { x: 3, y: -1 }, mouth: 2, snout: 6, tail: [-7, 0], legs: [[-8, 4, -6, 1], [-5, 4, -5, 1], [5, 4, 5, 0], [8, 4, 7, 0]] };   // pounce air
    else if (f === 10) o = { ...o, by: 11, head: { x: 1, y: 3 }, mouth: 2, snout: 6, legs: [[-7, 5, -1, 1], [-4, 5, 0, 1], [4, 5, 5, 0], [7, 5, 6, 0]] };     // pin: standing over, head down
    else if (f === 11) o = { ...o, by: 13, ry: 4.5, head: { x: 0, y: 3 }, earBack: true, legs: [[-7, 3, -2, 1], [-4, 3, -1, 1], [4, 3, 2, 0], [7, 3, 3, 0]] };   // winded: slumped (the host draws the gold stars)
    else if (f === 12) o = { ...o, bx: 12, by: 12, head: { x: -2, y: 3 }, earBack: true, eye: '#ffffff', legs: [[-7, 4, -3, 1], [-4, 4, -1, 1], [4, 4, 1, 0], [7, 4, 2, 0]] };
    else if (f === 13) o = { ...o, by: 15, ry: 3.4, head: { x: 1, y: 3 }, eye: BC.greyD, legs: [[-7, 1, -6, 1], [-4, 1, -5, 1], [4, 1, 6, 0], [7, 1, 7, 0]] };
    const { hx, hy } = quad(g, o);
    rect(g, hx + 4, hy - 1, 1, 3, BC.scar);   // the scarred muzzle
    if (f === 6) { px(g, hx + 9, hy + 4, '#c9b27c'); px(g, hx + 11, hy + 5, '#c9b27c'); }
  });
  return pack(F, 14, H - 1, 26, 15);
}

export function bakeBruin() {
  const W = 40, H = 32;
  const F = frames(W, H, 16, (g, f) => {
    const C = { c: BC.brown, cL: BC.brownL, cD: BC.brownD, ear: BC.brownD, eye: '#ffd36b', nose: '#120c0a' };
    const walk = f >= 2 && f <= 5, k = f - 2, st = walk ? [3, -2, 2, -3][k] : 0, ch = f >= 10 && f <= 12, cs = ch ? [4, -4, 3][f - 10] : 0;
    const four = (o) => quad(g, { bx: 18, by: 21, rx: 13, ry: 8, ...C, head: { x: 0, y: 1, r: 6 }, snout: 6, tail: [-4, 0], legs: [[-9, 7, st + cs, 1], [-5, 7, -st - cs, 1], [5, 7, -st - cs, 0], [9, 7, st + cs, 0]], ...o });
    const standing = (arm, mouth, lean = 0) => {   // up on the hind legs: a tall body, the arms raised
      for (const hx of [-3, 3]) { rect(g, 17 + hx, 24, 4, 7, C.cD); rect(g, 16 + hx, 30, 6, 1, C.cD); }
      fillPoly(g, [[12 + lean, 24], [16 + lean, 8], [26 + lean, 8], [28 + lean, 24]], C.c); ellipse(g, 20 + lean, 17, 7, 9, C.c); ellipse(g, 19 + lean, 13, 5, 5, C.cL);
      const hx = 24 + lean, hy = 6; ellipse(g, hx, hy, 6, 5.5, C.c); rect(g, hx + 3, hy, 6, 4, C.snout); rect(g, hx + 3, hy, 6, 1, '#c8a47c'); px(g, hx + 8, hy, C.nose); px(g, hx + 2, hy - 2, C.eye);
      fillPoly(g, [[hx - 4, hy - 4], [hx - 3, hy - 8], [hx - 1, hy - 4]], C.cD);
      if (mouth) { rect(g, hx + 3, hy + 4, 6, 3, '#3a0e14'); px(g, hx + 4, hy + 4, '#fff'); px(g, hx + 7, hy + 4, '#fff'); }
      for (const [ax, ay, bx, by] of arm) { line(g, ax + lean, ay, bx + lean, by, C.c, 3); rect(g, bx + lean - 1, by - 1, 3, 3, C.cD); px(g, bx + lean + 2, by - 1, BC.claw); px(g, bx + lean + 2, by + 1, BC.claw); }
    };
    if (f <= 5) four({});
    else if (f === 6) standing([[18, 14, 12, 4], [26, 14, 32, 4]], true);                                // stand + roar: arms up
    else if (f === 7) standing([[18, 14, 14, 8], [26, 14, 30, 8]], false);                                // stood, open (parried)
    else if (f === 8) standing([[18, 12, 14, 24], [26, 12, 34, 24]], true, 2);                            // the maul: both paws down
    else if (f === 9) four({ by: 23, head: { x: 1, y: 5, r: 6 }, mouth: 1, legs: [[-9, 5, -2, 1], [-5, 5, 0, 1], [5, 5, 3, 0], [9, 5, 4, 0]] });   // charge tell: head low, a paw scraping
    else if (ch) four({ by: 20, head: { x: 2, y: 3, r: 6 }, legs: [[-9, 8, cs, 1], [-5, 8, -cs, 1], [5, 8, -cs, 0], [9, 8, cs, 0]] });
    else if (f === 13) four({ by: 22, head: { x: 0, y: 4, r: 6 }, earBack: true, legs: [[-9, 6, -3, 1], [-5, 6, -1, 1], [5, 6, 3, 0], [9, 6, 5, 0]] });   // dazed (the host draws the stars)
    else if (f === 14) four({ by: 22, head: { x: -2, y: 3, r: 6 }, eye: '#ffffff', legs: [[-9, 7, -3, 1], [-5, 7, -1, 1], [5, 7, 2, 0], [9, 7, 3, 0]] });
    else four({ by: 26, ry: 6, head: { x: 0, y: 4, r: 6 }, eye: BC.brownD, legs: [[-9, 2, -8, 1], [-5, 2, -7, 1], [5, 2, 7, 0], [9, 2, 8, 0]] });
  });
  return pack(F, 18, H - 1, 28, 16);
}

/* the frost recolour for act VI: the same sheets, the coat grizzled pale (cnSkin 'frost') - a placeholder tint until the art lane draws it */
export function bakeBruinFrost() {
  const set = bakeBruin(), tint = c => { const g = c.getContext('2d'); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.45; g.fillStyle = '#cfd8e0'; g.fillRect(0, 0, c.width, c.height); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; return c; };
  set.R.forEach(tint); set.L.forEach(tint); return set;
}
