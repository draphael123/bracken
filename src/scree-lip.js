/* src/scree-lip.js - THE SCREE PATH's OVERHANGS, DRAWN AS ROCK (claude/screefix, Daniel 2026-10-15 "this looks bad": the crag arm was one flat brown polygon 200 px
   tall and the lip a brown slab with plank-like cracks - it read as a wooden beam on a stick).
   Draw only: src/ram-lord.js keeps every box, timer and number. Three baked sprites, one per size, drawn with drawImage:
     THE CRAG ARM   a buttress of the hill's own rock leaning up out of the view - strata that run on from the ground tiles (CRAG_PAL.scree), a lit west rim, a dark
                    east face, cracks, shelves with grass on them, notches in the outline - NOT a plank and not a flat colour
     THE LIP        a slab of the same rock out of the arm, its underside a fringe of stalactite teeth and its top rim lit by the low sun
     THE PROP       the dry-stone pier under it (courses of stone, a crack up the middle) in the same rock colours
   Colours are the ground's, so lip, arm and floor are one rock. */
import { canvas } from './px.js';
const C = { r: ['#8a7a70', '#9c8b7e', '#7a6a62', '#6c5d56'], crack: '#4a3e3a', rim: '#d8aa7c', rimD: '#b88a68', shade: '#5a4a58', out: '#3a2e38', deep: '#2e2432', grass: '#7a8a3a', grassL: '#b0bc50', grassD: '#4e5a2a', peb: '#b0a090' };
const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const wave = (x, s) => Math.round(Math.sin((x + s * 7) * 0.45) * 0.8 + Math.sin((x + s * 3) * 0.19) * 0.9);
const BAND = [C.r[0], C.r[1], C.r[0], C.r[2], C.r[0], C.r[3]];
const cache = new Map();
const fill = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

/* THE ARM: sprite AW x AH, the root (where it meets the lip's outer end) at (RX, AH - 16); it leans toward -x as it climbs, as the old polygon did */
const AW = 76, AH = 214, RX = 52;
function bakeArm() {
  const [c, g] = canvas(AW, AH), rows = AH - 16, sd = 77;
  for (let r = 0; r < rows; r++) {
    const y = AH - 16 - r - 1, t = r / rows, lean = t * 34, notch = hash(sd, r >> 3) < 0.22 ? 2 : 0, bulge = Math.round(Math.sin(t * 9) * 2 + Math.sin(t * 23 + 1) * 1.4);
    const l = Math.round(RX - 15 - lean - bulge - notch), rr = Math.round(RX + 15 - lean * 0.9 + bulge * 0.5 - (hash(sd + 3, r >> 3) < 0.2 ? 2 : 0));
    for (let x = l; x <= rr; x++) {
      const e0 = x - l, e1 = rr - x, band = BAND[(((y + 400 + wave(x, 5)) / 4) | 0) % 6];
      let col = band; if (e0 <= 1) col = e0 === 0 ? C.rim : C.r[1]; else if (e1 <= 3) col = e1 === 0 ? C.out : e1 === 1 ? C.deep : C.r[3]; else if (e1 <= 7) col = hash(x, y) < 0.4 ? C.r[3] : C.r[2];
      fill(g, x, y, 1, 1, col); }
    fill(g, l - 1, y, 1, 1, C.out); fill(g, rr + 1, y, 1, 1, C.out);
    if (r % 46 === 20) { const sl = l - 3, sw = rr - l + 7; fill(g, sl, y, sw, 1, C.rim); fill(g, sl, y + 1, sw, 2, C.r[2]); fill(g, sl, y + 3, sw, 1, C.out); fill(g, l + 1, y - 1, 5, 1, C.grassD); fill(g, l + 2, y - 2, 3, 1, C.grassL); }   /* a shelf of the strata with a tuft of grass on it */
  }
  for (let k = 0; k < 7; k++) { let x = RX - 12 + ((hash(sd, k + 50) * 20) | 0) - Math.round((k * 29 / rows) * 34), y = 20 + ((hash(sd, k + 60) * (rows - 40)) | 0); for (let n = 0; n < 16 && y < AH - 24; n++, y++) { fill(g, x, y, 1, 1, C.crack); if (hash(sd + k, y) < 0.45) x += hash(sd, y + k) < 0.5 ? -1 : 1; } }   /* fractures running down the face */
  for (let k = 0; k < 90; k++) fill(g, RX - 12 - (((hash(sd, k + 100) * 34) | 0)) + ((hash(sd, k + 130) * 26) | 0), 2 + ((hash(sd, k + 150) * (rows - 6)) | 0), 1, 1, hash(sd, k) < 0.5 ? C.r[3] : C.r[1]);   /* speckle */
  /* the root: the arm bleeds into the lip's top, so its foot is a wide dark joint */
  fill(g, RX - 17, AH - 18, 35, 3, C.shade); fill(g, RX - 17, AH - 15, 35, 1, C.out);
  return c;
}
/* THE LIP: sprite (w + 4) x 24: top at row 2. Its rim lit, a body of strata, a fringe of teeth hanging from the underside, cracks, a few tufts */
function bakeLip(w) {
  const [c, g] = canvas(w + 4, 26), sd = 5 + w;
  for (let x = 0; x < w; x++) for (let y = 0; y < 16; y++) {
    const band = BAND[(((y + wave(x, 2) + 24) / 4) | 0) % 6]; let col = band;
    if (y === 0) col = C.rim; else if (y === 1) col = C.rimD; else if (y >= 13) col = y === 15 ? C.out : C.shade; else if (y >= 10) col = C.r[3]; else if (x < 2) col = C.r[1];
    fill(g, x + 2, y + 2, 1, 1, col); }
  for (let x = 0; x < w; x += 3) { const d = 2 + ((hash(sd, x) * 6) | 0), ww = 2 + (hash(sd, x + 9) < 0.4 ? 1 : 0); fill(g, x + 2, 18, ww, d, C.r[3]); fill(g, x + 2, 18 + d - 1, ww, 1, C.out); if (x % 6 === 0) fill(g, x + 2, 18, 1, d - 1, C.r[2]); }   /* the stalactite teeth */
  fill(g, 2, 18, w, 1, C.out);
  for (let x = 6; x < w - 4; x += 11 + ((hash(sd, x) * 5) | 0)) { fill(g, x + 2, 6, 1, 6, C.crack); fill(g, x + 3, 11, 1, 3, C.crack); }   /* its cracks */
  for (let x = 8; x < w - 6; x += 19) { fill(g, x + 2, 1, 4, 1, C.grassD); fill(g, x + 3, 0, 2, 1, C.grassL); }
  fill(g, 1, 3, 1, 12, C.out); fill(g, w + 2, 3, 1, 12, C.out);
  return c;
}
/* THE PROP: a dry-stone pier, its stones in courses of the same rock, wider at the foot, a crack up its middle. Sprite 20 x 32, its foot at row 31. */
function bakeProp() {
  const [c, g] = canvas(20, 32);
  for (let k = 0; k < 7; k++) { const y = 27 - k * 4, w = 14 - Math.floor(k / 2) * 2, off = k % 2 ? 1 : -1;
    for (let q = 0; q < 3; q++) { const bw = Math.ceil(w / 3), bx = Math.round(10 - w / 2 + q * bw + off); fill(g, bx, y, bw - 1, 4, (k + q) % 2 ? C.r[2] : C.r[0]); fill(g, bx, y, bw - 1, 1, C.rim); fill(g, bx, y + 3, bw - 1, 1, C.out); fill(g, bx + bw - 2, y + 1, 1, 3, C.r[3]); } }
  fill(g, 9, 10, 1, 6, C.crack); fill(g, 10, 16, 1, 6, C.crack); fill(g, 9, 22, 1, 5, C.crack);
  fill(g, 4, 29, 3, 1, C.grassD); fill(g, 13, 29, 2, 1, C.grassD); fill(g, 12, 28, 1, 1, C.grassL);
  return c;
}
const get = (k, fn) => cache.get(k) || (cache.set(k, fn()), cache.get(k));

/* g the frame; wx the arm's root on screen (the lip's outer end), ay the lip's top row; side the way the lip runs from the prop (+1: the arm leans left) */
export function drawArm(g, wx, ay, side) {
  const s = get('arm', bakeArm), top = ay + 16 - (AH - 16);
  if (side > 0) g.drawImage(s, wx - RX, top);
  else { g.save(); g.translate(wx, top); g.scale(-1, 1); g.drawImage(s, -RX, 0); g.restore(); }
}
export function drawSlab(g, x, y, w) { g.drawImage(get('lip' + w, () => bakeLip(w)), x - 2, y - 2); }
export function drawProp(g, px, fy) { g.drawImage(get("prop", bakeProp), px - 10, fy - 31); }
