/* src/scree-lip.js - THE SCREE PATH's OVERHANGS, DRAWN AS ROCK (claude/screefix, Daniel 2026-10-15 "this looks bad": the crag arm was one flat brown polygon 200 px
   tall and the lip a brown slab with plank-like cracks - it read as a wooden beam on a stick).
   Draw only: src/ram-lord.js keeps every box, timer and number. Three baked sprites, one per size, drawn with drawImage:
     THE CRAG ARM   a buttress of the hill's own rock leaning up out of the view - strata that run on from the ground tiles (CRAG_PAL.scree), a lit west rim, a dark
                    east face, cracks, shelves with grass on them, notches in the outline - NOT a plank and not a flat colour
     THE LIP        a slab of the same rock out of the arm, its underside a fringe of stalactite teeth and its top rim lit by the low sun
     THE PROP       the CHOCK CAIRN under it (claude/scree3art): three flat stones, a wedge chock jammed in at the top, a chalk mark; seven baked states (armed, glint, knock0/1, spent, rearm1/2)
   Colours are the ground's, so lip, arm and floor are one rock. */
import { canvas, px, outline } from './px.js';
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
/* THE CHOCK CAIRN (claude/scree3art, Daniel's SCREE 3 ask 2): the prop is a shepherds' cairn under the overhang - three flat ochre-grey stones stacked, a pale WEDGE chock jammed in at the top on the fold's side (the part you hit),
   a chalk shepherd's mark on the middle stone, the lip's crack line running up from it. Stone only, no timber. Sprite 32 x 32, the cairn centred on column 16 (so a flip keeps it on its box), its foot on row 31; the wedge juts
   toward +x (drawProp mirrors it for a lip that runs the other way). States: armed, glint (the wedge gold: he is in the fall line), knock0 / knock1 (the blow: the wedge flies out and the stack topples, 2 frames),
   spent (a rubble heap), rearm1 / rearm2 (the stones settling back up over LIP.rearm: the bottom course, then the stack with the wedge still lying at its foot). */
const CH = { stone: ['#8a7a70', '#9c8b7e', '#7a6a62'], rim: '#d8aa7c', shade: '#5a4a58', out: '#2e2432', chalk: '#efe8d0', wedge: '#d8aa7c', wedgeL: '#f0cfa0', wedgeD: '#a8825c', gold: '#ffd36b', goldL: '#fff6c8', goldD: '#b8862a' };
function bakeCairn(st) {
  const [c, g] = canvas(32, 32), sd = 91;
  /* a flat stone: x,y its top-left, w x h, tone 0..2; corners knocked off, lit top edge, a shaded right end, a chinking underside */
  const stone = (x, y, w, h, tn = 0, o = {}) => { const base = CH.stone[tn];
    fill(g, x + 1, y, w - 2, h, base); fill(g, x, y + 1, w, h - 2, base); fill(g, x + 1, y, w - 2, 1, CH.rim); fill(g, x, y + 1, 1, h - 3, CH.stone[1]); fill(g, x + w - 2, y + 2, 2, h - 3, CH.stone[2]); fill(g, x + 1, y + h - 1, w - 2, 1, CH.shade);
    for (let i = 0; i < w * h / 14; i++) { const sx = x + 2 + ((hash(sd + x, i + y) * (w - 4)) | 0), sy = y + 2 + ((hash(i + x, sd + y) * (h - 4)) | 0); fill(g, sx, sy, 1, 1, hash(i, sx) < 0.5 ? CH.stone[2] : CH.stone[1]); } };
  const wedge = (x, y, col, tilt = 0) => { const [a, b, d] = col === 'gold' ? [CH.gold, CH.goldL, CH.goldD] : [CH.wedge, CH.wedgeL, CH.wedgeD];   /* a wedge-shaped chock, thick end toward the cairn, its point out; tilt flips it point-up (flying) */
    const rows = tilt ? [[0, 2], [0, 4], [0, 6], [0, 7], [1, 7]] : [[0, 7], [0, 6], [0, 4], [0, 2], [0, 1]];
    rows.forEach(([o, w], r) => { fill(g, x + o, y + r, w, 1, a); px(g, x + o, y + r, b); px(g, x + o + w - 1, y + r, d); }); fill(g, x, y + (tilt ? 0 : 4), 7, 1, d); };
  const mark = (x, y) => { px(g, x, y, CH.chalk); px(g, x + 2, y, CH.chalk); px(g, x + 1, y + 1, CH.chalk); px(g, x, y + 2, CH.chalk); px(g, x + 2, y + 2, CH.chalk); };   /* the shepherd's X */
  const crack = (x, y0, y1) => { for (let y = y0; y <= y1; y++) px(g, x + ((y >> 1) & 1), y, CH.shade); };   /* the lip's crack line */
  const rubble = (list) => list.forEach(([x, y, w, h, tn]) => stone(x, y, w, h, tn));
  const grass = () => { fill(g, 5, 31, 3, 1, '#4e5a2a'); fill(g, 24, 31, 2, 1, '#4e5a2a'); px(g, 25, 30, '#b0bc50'); };
  if (st === 'armed' || st === 'glint') {
    stone(7, 22, 18, 9, 0); stone(9, 14, 14, 8, 1); stone(11, 7, 10, 7, 2); mark(13, 17); crack(15, 0, 6);
    wedge(20, 5, st === 'glint' ? 'gold' : 'wedge');   /* jammed in at the top, toward the fold */
    if (st === 'glint') { for (const [x, y] of [[27, 4], [23, 3], [26, 9]]) { px(g, x, y, CH.goldL); } px(g, 27, 3, CH.gold); px(g, 27, 5, CH.gold); px(g, 26, 4, CH.gold); px(g, 28, 4, CH.gold); }
  } else if (st === 'knock0') {   /* the blow: the wedge is out and flying, the top stone shoved off to the side, the stack just leaning */
    stone(7, 22, 18, 9, 0); stone(10, 14, 14, 8, 1); stone(14, 8, 10, 7, 2); mark(14, 17); wedge(25, 1, 'wedge', 1);
    for (const [x, y] of [[24, 6], [27, 8], [23, 3], [29, 3]]) px(g, x, y, CH.rim);   /* the streak behind it */
  } else if (st === 'knock1') {   /* the topple: the top stone on its way down, the middle one slipping, the wedge down at the foot, dust */
    stone(6, 24, 18, 7, 0); stone(10, 18, 13, 6, 1); stone(21, 20, 9, 6, 2); wedge(26, 27, 'wedge'); for (const [x, y, k] of [[4, 28, 0], [3, 25, 1], [29, 17, 1], [27, 16, 0], [31, 22, 0]]) fill(g, x, y, 2, 1, k ? CH.stone[1] : CH.rim);
  } else if (st === 'spent') {   /* rubble heap: loose stones low and tumbled, the chalk-marked one half under, the wedge on its side */
    rubble([[5, 26, 9, 5, 2], [12, 25, 12, 6, 0], [21, 27, 8, 4, 1], [9, 22, 8, 5, 1], [16, 22, 7, 4, 2]]); mark(15, 27); wedge(25, 24, 'wedge'); fill(g, 3, 30, 2, 1, CH.stone[1]); fill(g, 28, 30, 2, 1, CH.stone[0]); grass();
  } else if (st === 'rearm1') {   /* the foot course is back */
    stone(7, 22, 18, 9, 0); mark(13, 25); rubble([[3, 27, 6, 4, 2], [24, 26, 7, 5, 1], [11, 18, 9, 4, 1]]); wedge(25, 27, 'wedge');
  } else {   /* rearm2: the stack is up, the top stone hanging a hair high, the wedge still on the ground to be set */
    stone(7, 22, 18, 9, 0); stone(9, 14, 14, 8, 1); stone(11, 6, 10, 7, 2); mark(13, 17); rubble([[26, 27, 5, 4, 1]]); wedge(25, 27, 'wedge'); px(g, 12, 13, CH.rim); px(g, 20, 13, CH.rim);
  }
  return outline(c, CH.out);
}
const get = (k, fn) => cache.get(k) || (cache.set(k, fn()), cache.get(k));

/* g the frame; wx the arm's root on screen (the lip's outer end), ay the lip's top row; side the way the lip runs from the prop (+1: the arm leans left) */
export function drawArm(g, wx, ay, side) {
  const s = get('arm', bakeArm), top = ay + 16 - (AH - 16);
  if (side > 0) g.drawImage(s, wx - RX, top);
  else { g.save(); g.translate(wx, top); g.scale(-1, 1); g.drawImage(s, -RX, 0); g.restore(); }
}
export function drawSlab(g, x, y, w) { g.drawImage(get('lip' + w, () => bakeLip(w)), x - 2, y - 2); }
/* state: armed | glint | knock0 | knock1 | spent | rearm1 | rearm2 (see bakeCairn); side the way the lip runs from it (+1 = wedge toward +x); (px, fy) the cairn's centre and foot on screen */
export function drawProp(g, x, fy, state = 'armed', side = 1) {
  const s = get('cairn' + state, () => bakeCairn(state));
  if (side > 0) g.drawImage(s, x - 16, fy - 31); else { g.save(); g.translate(x, fy - 31); g.scale(-1, 1); g.drawImage(s, -16, 0); g.restore(); }
}
