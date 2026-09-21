// sun_priest.js — CONCEPT sprites for THE SUN PRIEST (docs/sun-priest-design.md): the look and the key poses, so Daniel can say yes
// or no before the class batch bakes the real hero set to the hero contract. Not wired in. px.js primitives only
// (tools/sun-priest-art.mjs renders it in Node). Frames face RIGHT, one 28x26 canvas each, settled on the floor.
//   0 idle | 1,2 walk | 3 jab | 4 sweep | 5 THE FLASH (third blow) | 6 SUNBEAM (planted, the beam out along the ground) |
//   7 SUNBEAM UP | 8 CONSECRATE (the patch laid) | 9 THE FLARE | 10 SUNFALL (landing) | 11 hurt | 12 in the dark (dimmed, the disc dull)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const C = { robe: '#f2ead8', robeD: '#cfc3a4', robeS: '#a89878', gold: '#e8c24a', goldL: '#ffe89a', goldD: '#b08a2a', skin: '#b87a52', skinD: '#8e5a3a',
  hood: '#e8dcc0', staff: '#8a6a44', staffD: '#6e5234', sun: '#ffd36b', sunL: '#fff6c8', sunD: '#e8a040', dim: '#8a8478', beam: '#fff2b0' };
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low >= 0 && n) { g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); } return c; }
export function bakeSunPriest() {
  const W = 28, H = 26, cx = 11;
  const disc = (g, x, y, lit) => { circle(g, x, y, 2.6, lit ? C.sun : C.dim); if (lit) { px(g, x, y, C.sunL); for (let a = 0; a < 8; a++) px(g, x + Math.cos(a * Math.PI / 4) * 4, y + Math.sin(a * Math.PI / 4) * 4, C.sunD); } };
  const body = (g, f, dark) => {
    const step = f === 1 ? 1 : f === 2 ? -1 : 0, bob = f === 1 || f === 2 ? 0 : 0, crouch = f === 6 || f === 8 || f === 10 ? 2 : 0;
    const R = dark ? C.robeS : C.robe, RD = dark ? C.robeS : C.robeD;
    // the robe: a long bell to the ankles, a gold band at the hem and a sash
    fillPoly(g, [[cx - 4, 12 + crouch], [cx + 4, 12 + crouch], [cx + 6 + step, 24], [cx - 6 - step, 24]], R);
    line(g, cx - 6 - step, 23, cx + 6 + step, 23, dark ? C.goldD : C.gold); rect(g, cx - 4, 16 + crouch, 8, 1, dark ? C.goldD : C.gold);
    line(g, cx + 1, 13 + crouch, cx + 3 + step, 23, RD);
    rect(g, cx - 3 + step, 24, 2, 2, C.skinD); rect(g, cx + 1 - step, 24, 2, 2, C.skinD);   // sandalled feet
    // the head: a hood, a bronze face, the sun-mark on the brow
    ellipse(g, cx, 8 + crouch, 4, 4.5, dark ? C.robeS : C.hood); ellipse(g, cx + 1, 9 + crouch, 2.4, 3, C.skin); px(g, cx + 2, 8 + crouch, '#2a1a10'); px(g, cx + 1, 6 + crouch, dark ? C.goldD : C.gold);
    return crouch; };
  const staff = (g, x0, y0, x1, y1, lit) => { line(g, x0, y0, x1, y1, C.staff); line(g, x0 + 1, y0, x1 + 1, y1, C.staffD); disc(g, x1, y1, lit); };
  const F = [];
  for (let f = 0; f < 13; f++) { const [c, g] = canvas(W, H), dark = f === 12, lit = !dark;
    if (f === 8) { rect(g, 0, 24, W, 2, C.sun); for (let x = 0; x < W; x += 3) px(g, x, 23, C.sunL); }                                   // CONSECRATE: the patch on the ground
    if (f === 10) { for (let a = 0; a < 16; a++) px(g, cx + Math.cos(a / 16 * Math.PI) * 10, 24 - Math.sin(a / 16 * Math.PI) * 3, C.sunL); rect(g, cx - 10, 24, 20, 2, C.sun); }   // SUNFALL: the ring
    const cr = body(g, f, dark);
    const hand = [cx + 3, 14 + cr];
    if (f === 0 || f === 1 || f === 2 || f === 12) staff(g, cx + 5, 24, cx + 6, 3, lit);                         // the staff held upright, the disc over his head
    else if (f === 3) staff(g, hand[0], hand[1], cx + 15, 12, lit);                                              // jab
    else if (f === 4) staff(g, hand[0], hand[1], cx + 13, 20, lit);                                              // sweep, low
    else if (f === 5) { staff(g, hand[0], hand[1], cx + 14, 9, lit); circle(g, cx + 14, 9, 4, C.sunL); for (let a = 0; a < 12; a++) px(g, cx + 14 + Math.cos(a * Math.PI / 6) * 6, 9 + Math.sin(a * Math.PI / 6) * 6, C.sun); }   // THE FLASH
    else if (f === 6) { staff(g, cx + 4, 24, cx + 8, 12, lit); rect(g, cx + 10, 11, W - cx - 10, 3, C.beam); rect(g, cx + 10, 12, W - cx - 10, 1, C.sunL); }   // SUNBEAM: planted, the beam out along the row
    else if (f === 7) { staff(g, cx + 4, 24, cx + 4, 8, lit); rect(g, cx + 3, 0, 3, 5, C.beam); px(g, cx + 4, 2, C.sunL); }   // SUNBEAM UP
    else if (f === 8) staff(g, cx + 3, 16, cx + 9, 22, lit);                                                     // CONSECRATE: the disc touched to the ground
    else if (f === 9) { staff(g, cx + 4, 22, cx + 5, 2, lit); circle(g, cx + 5, 2, 5, C.sunL); for (let a = 0; a < 16; a++) { const r = 9 + (a % 2) * 2; px(g, cx + 5 + Math.cos(a * Math.PI / 8) * r, 4 + Math.sin(a * Math.PI / 8) * r, C.sun); } }   // THE FLARE
    else if (f === 10) staff(g, cx + 2, 20, cx + 10, 14, lit);                                                   // SUNFALL: landed, staff out
    else if (f === 11) staff(g, cx - 2, 20, cx - 8, 10, lit);                                                    // hurt: thrown back
    F.push(settle(outline(c, OUT))); }
  const L = F.map(c => flipX(c)), white = F.map(c => whiten(c));
  return { R: F, L, white: { R: white, L: white.map(c => flipX(c)) }, ax: cx, ay: H, w: 10, h: 16 };
}
