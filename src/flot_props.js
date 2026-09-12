// flot_props.js — THE FLOTILLA: the props for the pirate fleet lashed together into a floating town
// over the drowned city. Hot hard noon: the sun straight down, decks bleached white, tar black in the
// seams, canvas gone stiff with salt, paint flaking off carved work, brass too bright to look at.
// These are working ships that people live on — washing, cook pots, rum, hens, plunder in heaps.
// Every baker returns a canvas drawn with its BOTTOM-CENTRE on the ground (x - w/2, groundY - h)
// unless its comment says otherwise. Baked once, no anti-aliasing.
import { canvas, px, rect, line, ellipse, circle, fillPoly, fromGrid, outline, mulberry, rgb, hex } from './px.js';
import { OUT } from './art.js';

// The Flotilla palette. Everything here is the reef set one stop warmer and one stop brighter —
// the same timber and iron and brass, but out of the storm and into the noon sun.
const F = {
  // bleached deck plank: sun-scoured pine, the top of everything
  pl: '#e4d7b6', plM: '#c2b18c', plD: '#968560', plDD: '#6b5d41',
  // ship timber under the bleach, where the sun never reaches it
  wood: '#8a6f52', woodD: '#5c4836', woodDD: '#392d22',
  // tar black: seams, pitch, the black flag
  tar: '#221d22', tarL: '#383039',
  // salt-stiff canvas — it holds a crease like board
  cv: '#f0e8d4', cvM: '#cec4aa', cvD: '#9f9581', cvDD: '#6d6557',
  // hemp rope, everywhere, sun-yellowed
  hemp: '#d7bc84', hempD: '#a18b52', hempDD: '#6b5931',
  // brass in noon light
  brass: '#e0b552', brassL: '#ffeaa2', brassD: '#95701f',
  // iron: a hard white highlight over a nearly black body
  ir0: '#24272c', ir1: '#414853', ir2: '#5d6671', ir3: '#858f99', rust: '#9a4a28',
  // blood-red paint, flaking off the carved work
  red: '#c03c33', redL: '#e46c51', redD: '#7c221e',
  // ochre paint, the cheaper colour, on everything that is not red
  och: '#d89a36', ochL: '#f2c268', ochD: '#945f1b',
  // weed green along every waterline
  weed: '#5e8b3c', weedD: '#3f6329', weedDD: '#2a451c',
  // the sea, and the drowned city down in it
  sea0: '#114055', sea1: '#1d6a86', sea2: '#2f96ab', sea3: '#6ac8d0', foam: '#ecf7f4',
  // gilt on the carved work, and the glare of the sun on anything wet or bright
  gold: '#f0cc58', goldL: '#fff4b4', glare: '#fffdf0',
  // powder smoke and galley steam
  smoke: '#bcb7ae', smokeD: '#8b8780',
  // the livestock
  hen: '#b06a2c', henL: '#dc9a4a',
};
// Background pieces sit back in the noon glare off the water: their colours get mixed toward this.
const HAZE = '#bccdc8';
const OUTBG = '#3d4c4c';

// ---------- helpers ----------
// A stable per-pixel hash in [0,1): texture that does not depend on draw order.
function hsh(x, y, s = 0) { let t = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) >>> 0; t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; }
function mix(a, b, t) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
// Push a colour back into the glare: the further off a hull is, the paler and flatter it reads.
const far = (c, t = 0.3) => mix(c, HAZE, t);
// Repaint every pixel of colour `key` through fn(x, y) -> colour (or null to clear it).
function recolor(g, w, h, key, fn) {
  const img = g.getImageData(0, 0, w, h), d = img.data, [kr, kg, kb] = rgb(key);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!d[i + 3] || d[i] !== kr || d[i + 1] !== kg || d[i + 2] !== kb) continue;
    const col = fn(x, y);
    if (col === null) { d[i + 3] = 0; continue; }
    const [r, gg, b] = rgb(col); d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}
function maskOf(g, w, h) { const d = g.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) m[i] = d[i * 4 + 3] > 0 ? 1 : 0; return m; }
const KEY = '#ff00ff', KEY2 = '#00ff00', KEY3 = '#0000ff';

// Paint flaking off carved work: punch the bare wood back through a painted field, but only where
// that paint actually is, so a flake never lands on the sky or on the plank next door.
function flake(g, W, H, x0, y0, w, h, paint, wood, dark, seed) {
  const img = g.getImageData(0, 0, W, H), d = img.data, [pr, pg, pb] = rgb(paint);
  const [wr, wg, wb] = rgb(wood), [dr, dg, db] = rgb(dark);
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const i = (y * W + x) * 4;
    if (!d[i + 3] || d[i] !== pr || d[i + 1] !== pg || d[i + 2] !== pb) continue;
    const n = hsh(x, y, seed);
    if (n > 0.17) continue;
    const use = n < 0.11;
    d[i] = use ? wr : dr; d[i + 1] = use ? wg : dg; d[i + 2] = use ? wb : db;
  }
  g.putImageData(img, 0, 0);
}

// A length of hemp with the lay of it showing as alternating strands.
function ropeLine(g, x0, y0, x1, y1, light, dark) {
  light = light || F.hemp; dark = dark || F.hempD;
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, i = 0;
  for (;;) {
    px(g, x0, y0, (i & 1) ? dark : light); i++;
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
// A rope made fast at both ends and left to hang: a catenary, the lay showing along it.
function ropeSag(g, x0, x1, y0, y1, sag, light, dark) {
  light = light || F.hemp; dark = dark || F.hempD;
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / Math.max(1, x1 - x0);
    const y = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag);
    px(g, x, y, (x & 1) ? dark : light);
  }
}
// A whipped rope end hanging free and kinking as it goes.
function ropeEnd(g, x, y, len, drift, seed, light, dark) {
  light = light || F.hemp; dark = dark || F.hempD;
  let fx = x;
  for (let k = 0; k < len; k++) {
    const cx = Math.round(fx);
    px(g, cx, y + k, (k & 1) ? dark : light);
    if (k === len - 1) { px(g, cx, y + k, F.hempDD); px(g, cx + 1, y + k, dark); }
    fx += drift * (0.6 + hsh(cx, k, seed) * 0.8);
  }
}
// A turn of rope seized round something: a short fat band across it.
function seizing(g, x, y, w, h) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(g, xx, yy, ((xx + yy) & 1) ? F.hempD : F.hemp);
  for (let xx = x; xx < x + w; xx += 3) px(g, xx, y + h - 1, F.hempDD);
}
// An iron hoop round a cask: a hard bright edge over a nearly black body, standing a pixel proud of
// the staves either side. Two of these are what make a cask read as a cask at 1x.
function hoop(g, x0, x1, y, seed) {
  for (let x = x0; x <= x1; x++) {
    const f = (x - x0) / Math.max(1, x1 - x0);
    px(g, x, y, f < 0.24 ? F.ir3 : (f < 0.5 ? F.ir2 : F.ir0));
    px(g, x, y + 1, f < 0.2 ? F.ir1 : F.ir0);
  }
  for (let x = x0; x <= x1; x++) if (hsh(x, y, seed) < 0.14) px(g, x, y + 1, F.rust);
}

// A cask standing on its head: staves bulging at the waist, two hoops, the head on top. The brightest
// thing about it is the left shoulder, because the sun is straight up and a little behind the player.
function caskUp(g, x0, y0, w, h, seed, head) {
  const bulge = Math.max(2, Math.round(w * 0.21));
  const row = y => { const t = (y - y0) / Math.max(1, h - 1); const ins = Math.round((1 - Math.sin(t * Math.PI)) * bulge); return [x0 + ins, x0 + w - 1 - ins]; };
  for (let y = y0 + 1; y < y0 + h; y++) {
    const [a, b] = row(y);
    for (let x = a; x <= b; x++) {
      const f = (x - a) / Math.max(1, b - a);
      let col = f < 0.09 ? F.plD : (f < 0.34 ? F.pl : (f < 0.64 ? F.plM : (f < 0.86 ? F.plD : F.woodDD)));
      if ((x - x0) % 4 === 2 && f > 0.12 && f < 0.86) col = F.plD;
      if (hsh(x, y, seed) < 0.09) col = F.plD;
      px(g, x, y, col);
    }
  }
  const [fa, fb] = row(y0 + h - 1);
  for (let x = fa; x <= fb; x++) if (hsh(x, 3, seed + 1) < 0.4) px(g, x, y0 + h - 1, F.woodDD);
  if (head) {
    // the head laid in its croze: a disc of pale boards with the bung driven into it
    const [a, b] = row(y0 + 1);
    const cx = (a + b) / 2 + 0.5;
    ellipse(g, cx, y0 + 1.4, (b - a) / 2 + 0.4, 1.9, F.plM);
    ellipse(g, cx, y0 + 1.2, (b - a) / 2 - 0.9, 1.3, F.pl);
    for (let x = a + 1; x < b; x++) if (hsh(x, 1, seed + 4) < 0.35) px(g, x, y0 + 1, F.plD);
    px(g, Math.round(cx) + 1, y0 + 1, F.tar); px(g, Math.round(cx) + 2, y0 + 1, F.woodDD);
  }
  hoop(g, row(y0 + 3)[0], row(y0 + 3)[1], y0 + 3, seed + 2);
  hoop(g, row(y0 + h - 4)[0], row(y0 + h - 4)[1], y0 + h - 4, seed + 3);
}
// A cask lying on its bilge, axis across the view: the long side with the hoops standing up it and
// the head showing at the right-hand end.
function caskLying(g, x0, y0, w, h, seed) {
  const bulge = Math.max(1, Math.round(h * 0.16));
  const col = x => { const t = (x - x0) / Math.max(1, w - 1); const ins = Math.round((1 - Math.sin(t * Math.PI)) * bulge); return [y0 + ins, y0 + h - 1 - ins]; };
  for (let x = x0; x < x0 + w; x++) {
    const [a, b] = col(x);
    for (let y = a; y <= b; y++) {
      const f = (y - a) / Math.max(1, b - a);
      px(g, x, y, f < 0.14 ? F.pl : (f < 0.42 ? F.plM : (f > 0.86 ? F.woodDD : (f > 0.7 ? F.plDD : (hsh(x, y, seed) < 0.14 ? F.plD : F.plM)))));
    }
    if ((x - x0) % 5 === 3) { const [a2, b2] = col(x); for (let y = a2 + 1; y < b2; y++) if (hsh(x, y, seed + 5) < 0.7) px(g, x, y, F.plD); }
  }
  const hoops = w > 14 ? [x0 + 2, x0 + Math.round(w / 2) - 1, x0 + w - 4] : [x0 + 2, x0 + w - 4];
  for (const hx of hoops) { const [a, b] = col(hx); for (let y = a; y <= b; y++) { px(g, hx, y, F.ir1); px(g, hx + 1, y, F.ir0); } px(g, hx, a, F.ir3); px(g, hx + 1, a, F.ir2); px(g, hx, a + 1, F.ir3); }
  const [ha, hb] = col(x0 + w - 1);
  for (let y = ha; y <= hb; y++) { px(g, x0 + w - 1, y, F.woodD); px(g, x0 + w - 2, y, hsh(y, 2, seed + 7) < 0.4 ? F.plD : F.plM); }
  px(g, x0 + w - 2, ha + 1, F.pl);
}

// A cloud of powder smoke: bright in the middle, ragged at the rim.
function puff(g, cx, cy, r, seed) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.sqrt(dx * dx + dy * dy) / r;
    if (d > 1) continue;
    if (d > 0.58 && hsh(x, y, seed) < 0.5) continue;
    px(g, x, y, d < 0.34 ? F.glare : (d < 0.72 ? F.smoke : F.smokeD));
  }
}
// A wisp of steam or smoke going straight up in still noon air, thinning as it goes.
function wisp(g, x, y, len, drift, seed) {
  let fx = x;
  for (let k = 0; k < len; k++) {
    const cx = Math.round(fx);
    if (hsh(cx, y - k, seed) < 0.26) { fx += drift; continue; }
    const t = k / Math.max(1, len - 1);
    px(g, cx, y - k, t < 0.3 ? F.smoke : (t < 0.7 ? mix(F.smoke, F.glare, 0.5) : F.glare));
    fx += drift * (0.6 + hsh(cx, k, seed + 1) * 0.9);
  }
}
// The government powder mark stencilled on a keg: a broad arrow, 5x3.
function broadArrow(g, x, y, col) {
  px(g, x + 2, y, col);
  rect(g, x + 1, y + 1, 3, 1, col);
  px(g, x, y + 2, col); px(g, x + 2, y + 2, col); px(g, x + 4, y + 2, col);
}
// A tuft of weed left on something that has been in the water: the flotilla's own tide line.
function weedTuft(g, x, y, n, seed) {
  for (let k = 0; k < n; k++) {
    const dx = x + k, dy = y + (hsh(dx, y, seed) < 0.5 ? 0 : 1);
    px(g, dx, dy, hsh(dx, dy, seed + 1) < 0.4 ? F.weed : F.weedD);
    if (hsh(dx, dy, seed + 2) < 0.4) px(g, dx, dy + 1, F.weedDD);
  }
}

// ---------- the guns ----------

// A deck gun on a truck carriage, muzzle to the right: iron barrel, red carriage flaking, the quoin
// under her breech and the breeching rope round her cascabel. 30x18. `fired` shows her run back on
// the recoil with the smoke still at her muzzle.
export function bakeCannon(fired) {
  const W = 30, H = 18; const [c, g] = canvas(W, H);
  const ox = fired ? -4 : 0;
  // the carriage: a stepped bed of heavy timber, painted the fleet's red, the paint going
  fillPoly(g, [[9 + ox, 15], [9 + ox, 12], [15 + ox, 12], [15 + ox, 10], [27 + ox, 10], [27 + ox, 15]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    let top = 10; if (x < 15 + ox) top = 12;
    const d = y - top;
    if (d === 0) return F.redL;
    if (y >= 14) return F.woodDD;
    if (d % 3 === 2) return F.redD;
    return hsh(x, y, 3) < 0.18 ? F.redD : F.red;
  });
  flake(g, W, H, 9 + ox, 10, 19, 5, F.red, F.wood, F.woodD, 11);
  flake(g, W, H, 9 + ox, 10, 19, 5, F.redD, F.woodD, F.woodDD, 13);
  // the quoin: the wedge under her breech that gives her her elevation
  fillPoly(g, [[9 + ox, 12], [19 + ox, 12], [19 + ox, 10], [10 + ox, 10]], KEY2);
  recolor(g, W, H, KEY2, (x, y) => (y === 10 ? F.pl : (y === 11 ? F.plM : F.woodD)));
  px(g, 9 + ox, 11, F.woodDD); px(g, 19 + ox, 11, F.plDD);
  // the trucks: a big fore truck and a small after one, iron-shod on their axletrees
  for (const [tx, tr] of [[23 + ox, 2.9], [12 + ox, 2.3]]) {
    const cy = 17 - tr;
    circle(g, tx, cy, tr, F.ir1);
    circle(g, tx, cy, tr - 0.95, F.plD);
    px(g, tx - 1, Math.round(cy - tr) + 1, F.pl); px(g, tx - 1, Math.round(cy) - 1, F.plM);
    circle(g, tx, cy, 0.9, F.ir0);
    px(g, tx, Math.round(cy), F.brassD);
  }
  rect(g, 12 + ox, 14, 12, 1, F.ir0);
  // the barrel: cast iron, a hard white line along her top, breech heavy, a swell at her muzzle
  const bx0 = 8 + ox, bx1 = 28 + ox;
  for (let x = bx0; x <= bx1; x++) {
    const t = (x - bx0) / (bx1 - bx0);
    let half = 3.4 - t * 1.9;
    if (t < 0.12) half = 3.4;
    if (t > 0.88) half = 2.6;
    const a = Math.round(6 - half), b = Math.round(6 + half);
    for (let y = a; y <= b; y++) {
      const f = (y - a) / Math.max(1, b - a);
      px(g, x, y, f < 0.34 ? F.ir2 : (f > 0.78 ? F.ir0 : F.ir1));
    }
    px(g, x, a, F.ir3);
    if (hsh(x, 4, 7) < 0.1) px(g, x, a + 2, F.rust);
  }
  // the astragals standing round her, the vent on her breech and the dark of her bore
  for (const ax of [13, 19, 25]) for (let y = 2; y < 10; y++) { const xx = ax + ox; const d = g.getImageData(xx, y, 1, 1).data; if (d[3]) { px(g, xx, y, y < 4 ? F.ir3 : F.ir0); } }
  rect(g, 9 + ox, 2, 3, 1, F.ir0); px(g, 10 + ox, 2, F.ir3);
  // the muzzle: a bright ring of metal standing round a black bore
  rect(g, bx1 - 1, 3, 2, 7, F.ir2); px(g, bx1 - 1, 3, F.ir3); px(g, bx1, 3, F.ir3); px(g, bx1, 9, F.ir0);
  rect(g, bx1 - 1, 5, 2, 3, '#0d0f12');
  px(g, bx1 - 2, 4, F.ir3);
  // the cascabel and the breeching rope rove round its neck, running away over the side
  rect(g, 6 + ox, 4, 3, 5, F.ir1); px(g, 6 + ox, 4, F.ir3); px(g, 7 + ox, 4, F.ir3); px(g, 8 + ox, 8, F.ir0);
  circle(g, 4.5 + ox, 6.5, 2.3, F.ir1);
  px(g, 4 + ox, 5, F.ir3); px(g, 3 + ox, 6, F.ir2); px(g, 5 + ox, 8, F.ir0);
  for (let y = 5; y < 9; y++) px(g, 6 + ox, y, (y & 1) ? F.hempD : F.hemp);
  if (fired) { ropeLine(g, 6 + ox, 8, 0, 12); }
  else { ropeSag(g, 0, 6 + ox, 10, 8, 3); }
  // a handspike and a rammer stowed on the deck behind her, and a shot garland
  ropeLine(g, 24 + ox, 10, 27 + ox, 12);
  for (const [sx, sy] of [[1, 16], [4, 16]]) { circle(g, sx + 0.5, sy + 0.5, 1.4, F.ir1); px(g, sx, sy, F.ir3); px(g, sx + 1, sy + 1, F.ir0); }
  if (fired) {
    // run back on the recoil, her smoke still standing at the muzzle in the still air
    puff(g, bx1 + 3, 6, 3.6, 21);
    puff(g, bx1 + 5, 3, 2.4, 23);
    px(g, bx1 + 1, 6, F.glare); px(g, bx1 + 2, 5, F.ochL); px(g, bx1 + 2, 7, F.och);
    wisp(g, bx1 + 2, 2, 3, 0.4, 27);
  }
  return outline(c, OUT);
}

// A powder keg: iron hoops, the broad arrow stencilled on her, the bung sealed with tar. 14x14.
// `lit` has a fuse burning out of the bung and a glow on her shoulder — get clear of it.
export function bakeKeg(lit) {
  const W = 14, H = 14; const [c, g] = canvas(W, H);
  caskUp(g, 0, 0, 14, 14, 41, true);
  // the stencil: the powder mark, and a smear of tar where the cooper sealed her
  broadArrow(g, 3, 6, F.tar);
  px(g, 9, 7, F.tarL); px(g, 10, 8, F.tar);
  px(g, 2, 9, F.plDD); px(g, 11, 5, F.woodDD);
  weedTuft(g, 1, 12, 3, 43);
  if (lit) {
    // the fuse: a match coiled out of the bung, the last inch of it alight
    ropeLine(g, 8, 1, 10, -1, F.hempDD, F.hempD);
    px(g, 11, 0, F.och); px(g, 12, 0, F.ochL);
    px(g, 10, 0, F.glare); px(g, 11, 1, F.red);
    // the light it throws on her head and her near shoulder
    for (const [x, y] of [[7, 2], [9, 2], [6, 1], [10, 3], [11, 4]]) px(g, x, y, F.ochL);
    for (const [x, y] of [[8, 4], [10, 5], [6, 3]]) px(g, x, y, F.och);
    px(g, 12, 2, F.ochD);
  }
  return outline(c, OUT);
}

// Three kegs stacked two-and-one and lashed down so they do not walk about in a sea. 26x26.
export function bakeKegStack() {
  const W = 26, H = 26; const [c, g] = canvas(W, H);
  caskUp(g, 0, 13, 12, 13, 51, false);
  caskUp(g, 13, 13, 12, 13, 57, false);
  caskUp(g, 7, 0, 12, 13, 61, true);
  // the chocks wedged under the bottom pair
  rect(g, 11, 23, 4, 3, F.woodD); px(g, 11, 23, F.plM); px(g, 14, 25, F.woodDD);
  // the lashing: one rope over the top keg and down both sides, another round the bottom pair
  ropeSag(g, 1, 24, 14, 14, 1);
  ropeLine(g, 8, 1, 4, 13, F.hempD, F.hempDD); ropeLine(g, 17, 1, 21, 13, F.hempD, F.hempDD);
  ropeSag(g, 8, 17, 1, 1, 1);
  seizing(g, 12, 12, 2, 4);
  ropeEnd(g, 24, 15, 5, -0.3, 63);
  // the marks: two of them struck, one not, and the salt on all three
  broadArrow(g, 10, 6, F.tar);
  broadArrow(g, 2, 18, F.tar);
  px(g, 17, 19, F.tarL); px(g, 18, 20, F.tar);
  weedTuft(g, 1, 24, 4, 67); weedTuft(g, 19, 24, 3, 71);
  return outline(c, OUT);
}

// A boarding plank. `down` false: stowed upright against the rail, lashed on, 12x40 — the rail stub
// is at the foot. `down` true: lying flat as a bridge between two hulls, 40x10.
export function bakeGangplank(down) {
  if (down) {
    const W = 40, H = 10; const [c, g] = canvas(W, H);
    // the walking face, seen a little from above: bleached, with the battens across it
    rect(g, 0, 1, W, 6, KEY);
    recolor(g, W, H, KEY, (x, y) => {
      if (y === 1) return F.pl;
      if (y === 6) return F.plDD;
      if (x % 9 === 4) return F.woodD;
      return hsh(x, y, 3) < 0.16 ? F.plD : (y < 4 ? F.pl : F.plM);
    });
    // the battens nailed across her so a boot can hold in the wet
    for (const bx of [6, 15, 24, 33]) {
      rect(g, bx, 0, 2, 7, F.wood); rect(g, bx, 0, 2, 1, F.plM); px(g, bx + 1, 6, F.woodDD);
      px(g, bx, 2, F.ir0); px(g, bx + 1, 5, F.ir0);
    }
    // the edge of her, and the hard noon shadow she throws on the deck under her
    rect(g, 0, 7, W, 1, F.woodD);
    for (let x = 0; x < W; x++) px(g, x, 8, hsh(x, 1, 5) < 0.3 ? F.tar : F.woodDD);
    rect(g, 1, 9, W - 2, 1, F.tar);
    // the iron shoes at both ends and the lashings that keep her from walking off
    rect(g, 0, 1, 2, 7, F.ir1); rect(g, 0, 1, 2, 1, F.ir3); rect(g, W - 2, 1, 2, 7, F.ir1); px(g, W - 1, 2, F.ir3);
    seizing(g, 2, 1, 2, 7); seizing(g, W - 4, 1, 2, 7);
    ropeEnd(g, 3, 8, 2, 0.5, 73);
    weedTuft(g, 19, 7, 4, 77);
    return outline(c, OUT);
  }
  const W = 12, H = 40; const [c, g] = canvas(W, H);
  // stowed on end: the plank stood against the rail, a batten face to us
  rect(g, 2, 0, 8, 35, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (x === 2) return F.pl;
    if (x === 9) return F.woodDD;
    if (y % 9 === 4) return F.woodD;
    return hsh(x, y, 3) < 0.16 ? F.plD : (x < 5 ? F.pl : F.plM);
  });
  for (const by of [4, 13, 22, 31]) {
    rect(g, 1, by, 10, 2, F.wood); rect(g, 1, by, 10, 1, F.plM); px(g, 10, by + 1, F.woodDD);
    px(g, 3, by, F.ir0); px(g, 8, by + 1, F.ir0);
  }
  rect(g, 2, 0, 8, 1, F.plM); px(g, 5, 0, F.pl);
  // the rail she leans on, with the lashing round the both of them
  rect(g, 0, 35, 12, 3, F.plM); rect(g, 0, 35, 12, 1, F.pl); rect(g, 0, 37, 12, 1, F.woodD);
  rect(g, 1, 38, 3, 2, F.woodD); rect(g, 8, 38, 3, 2, F.woodD); px(g, 1, 39, F.woodDD); px(g, 10, 39, F.woodDD);
  rect(g, 4, 38, 4, 2, F.och); px(g, 4, 38, F.ochL); px(g, 7, 39, F.ochD);
  seizing(g, 1, 24, 10, 3);
  ropeEnd(g, 10, 27, 6, 0.3, 79);
  weedTuft(g, 2, 37, 4, 83);
  return outline(c, OUT);
}

// A rower's bench off one of the galleys they press the fisherfolk into: the thwart, a snapped oar
// stood against the end of it, and the open shackle and chain that was on somebody's ankle. 28x14.
// The middle of the seat is left plain — the game stands a figure in front of it.
export function bakeOarBench() {
  const W = 28, H = 14; const [c, g] = canvas(W, H);
  // the thwart: one heavy bleached plank, worn hollow in the middle where they sat
  rect(g, 2, 5, 24, 3, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y === 5) return (x > 8 && x < 20 && hsh(x, y, 3) < 0.5) ? F.plM : F.pl;
    if (y === 7) return F.woodD;
    return hsh(x, y, 5) < 0.2 ? F.plD : F.plM;
  });
  rect(g, 1, 5, 1, 3, F.plD); rect(g, 26, 5, 1, 3, F.woodD);
  // the legs and the stretcher between them
  for (const lx of [4, 21]) {
    rect(g, lx, 8, 3, 6, F.wood); rect(g, lx, 8, 1, 6, F.plM); px(g, lx + 2, 13, F.woodDD);
    px(g, lx + 1, 10, F.woodD);
  }
  rect(g, 7, 10, 14, 2, F.woodD); rect(g, 7, 10, 14, 1, F.plD);
  for (let x = 8; x < 20; x += 4) px(g, x, 11, F.woodDD);
  rect(g, 2, 13, 24, 1, F.tar);
  // the snapped oar, stood up against the after end: splinters where the blade went
  for (let y = 0; y < 13; y++) {
    const x = 26 - Math.round(y * 0.3);
    px(g, x, y, F.plM); px(g, x - 1, y, F.pl); px(g, x + 1, y, F.woodD);
  }
  for (const [sx, sy] of [[26, 0], [25, 1], [27, 1]]) { px(g, sx, sy, F.pl); px(g, sx, sy + 1, F.plM); }
  px(g, 26, 0, F.glare); px(g, 24, 3, F.woodDD);
  seizing(g, 23, 6, 3, 2);
  // the open shackle: the pin drawn, the bow gaping, three links of chain up to a ringbolt
  for (const [lx, ly] of [[6, 2], [7, 5], [6, 8]]) {
    for (let y = ly - 2; y <= ly + 2; y++) for (let x = lx - 2; x <= lx + 2; x++) {
      const dx = (x + 0.5 - lx) / 1.4, dy = (y + 0.5 - ly) / 2.1, r2 = dx * dx + dy * dy;
      if (r2 > 1 || r2 < 0.3) continue;
      px(g, x, y, y < ly ? F.ir3 : (x > lx ? F.ir0 : F.ir1));
    }
  }
  for (let y = 9; y < 13; y++) { px(g, 8, y, F.ir1); px(g, 9, y, F.ir0); }
  for (let y = 10; y < 13; y++) { px(g, 12, y, F.ir1); px(g, 11, y, F.ir0); }
  rect(g, 8, 12, 5, 1, F.ir2); px(g, 10, 12, F.ir3); px(g, 9, 11, F.rust);
  px(g, 13, 10, F.ir3); px(g, 13, 11, F.ir1);
  px(g, 6, 0, F.ir2);
  weedTuft(g, 14, 12, 4, 89);
  return outline(c, OUT);
}

// A single oar leaning where somebody left it: bleached blade with an ochre tip band, a leather
// sleeve at the balance, the grain standing up out of the shaft. 10x40.
export function bakeOar() {
  const W = 10, H = 40; const [c, g] = canvas(W, H);
  const sx = y => 2 + Math.round((39 - y) * 0.12);
  // the shaft, leaning in from the deck
  for (let y = 12; y < 40; y++) {
    const x = sx(y);
    px(g, x, y, F.pl); px(g, x + 1, y, F.plM); px(g, x + 2, y, F.woodD);
    if (hsh(x, y, 3) < 0.2) px(g, x + 1, y, F.plD);
  }
  // the blade: a wide flat spoon, the grain along it, the tip banded ochre and half knocked off
  fillPoly(g, [[3, 14], [7, 13], [9, 8], [9, 3], [7, 0], [4, 1], [1, 5], [1, 10]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y < 3) return F.och;
    if (x <= 3) return F.pl;
    if (x >= 8) return F.woodDD;
    if (x >= 6) return F.plD;
    return hsh(x, y, 7) < 0.22 ? F.plD : F.plM;
  });
  px(g, 6, 0, F.ochL); px(g, 8, 3, F.ochD); px(g, 5, 1, F.ochL); px(g, 4, 2, F.och);
  for (let y = 4; y < 13; y++) px(g, 4 + ((y & 1) ? 0 : 1), y, F.plD);
  px(g, 9, 6, F.woodDD); px(g, 1, 7, F.pl); px(g, 2, 11, F.plM);
  px(g, 1, 4, F.plDD); px(g, 8, 11, F.woodDD);
  // the leather at the balance, and the rope grommet below it
  const ly = 20;
  for (let y = ly; y < ly + 4; y++) { const x = sx(y); rect(g, x - 1, y, 4, 1, F.woodD); px(g, x - 1, y, F.wood); }
  px(g, sx(ly) + 2, ly + 1, F.woodDD); px(g, sx(ly) - 1, ly + 3, F.tar);
  seizing(g, sx(28) - 1, 28, 4, 2);
  // the butt on the deck, the grip worn pale, and the salt on the foot of her
  rect(g, sx(39) - 1, 37, 4, 3, F.plM); px(g, sx(39) - 1, 37, F.pl); px(g, sx(39) + 2, 39, F.woodDD);
  weedTuft(g, 1, 38, 3, 91);
  return outline(c, OUT);
}

// BACKGROUND. A hammock slung under the break of a deck, the clews gathered into their nettles and
// the canvas sagging with the weight of nothing. 34x16, hung from the top row — it does not stand on
// the ground. v 0..1: 0 sags empty, 1 has a blanket and a tarred hat rolled into her.
export function bakeHammock(v) {
  v = ((v % 2) + 2) % 2; const W = 34, H = 16; const [c, g] = canvas(W, H);
  const cv = far(F.cv, 0.24), cvM = far(F.cvM, 0.24), cvD = far(F.cvD, 0.2), cvDD = far(F.cvDD, 0.16);
  const hemp = far(F.hemp, 0.3), hempD = far(F.hempD, 0.26);
  const sag = v === 0 ? 7 : 5;
  // the lanyards down from the ringbolts to the clews at each end
  for (const [x0, x1] of [[1, 6], [32, 27]]) { ropeLine(g, x0, 0, x1, 4, hemp, hempD); px(g, x0, 0, far(F.ir2, 0.3)); }
  // the nettles: the fan of small lines that gather the head of the cloth into the clew
  for (const [cx, dir] of [[6, 1], [27, -1]]) {
    for (let k = 0; k < 4; k++) ropeLine(g, cx, 4, cx + dir * (2 + k), 6 + k, hemp, hempD);
    px(g, cx, 3, far(F.brassD, 0.3));
  }
  // the cloth: a shallow hammock, the head higher than the belly, hard creases across her
  const top = x => { const t = (x - 8) / 18; return 4 + Math.round(Math.sin(t * Math.PI) * sag * 0.55); };
  const bot = x => { const t = (x - 8) / 18; return 7 + Math.round(Math.sin(t * Math.PI) * sag); };
  for (let x = 8; x <= 26; x++) {
    const a = top(x), b = Math.min(H - 1, bot(x));
    for (let y = a; y <= b; y++) {
      const f = (y - a) / Math.max(1, b - a);
      let col = f < 0.22 ? cv : (f > 0.8 ? cvDD : (f > 0.58 ? cvD : cvM));
      if (x % 5 === 2) col = cvD;
      if (hsh(x, y, 3) < 0.07) col = cvDD;
      px(g, x, y, col);
    }
    px(g, x, a, (x & 1) ? cv : far(F.glare, 0.2));
  }
  if (v === 1) {
    // a blanket rolled into her and a tarred hat left on top of it
    for (let x = 12; x < 23; x++) { const a = top(x) + 1; rect(g, x, a, 1, 3, F.red); px(g, x, a, F.redL); px(g, x, a + 2, F.redD); }
    flake(g, W, H, 12, 4, 11, 5, F.red, F.ochD, F.redD, 13);
    ellipse(g, 17.5, 5.5, 3.2, 1.6, F.tar); px(g, 16, 5, F.tarL); px(g, 19, 6, F.tarL);
    rect(g, 15, 4, 5, 1, F.tar);
  }
  // the foot of her: the cloth gathered and a rope tail hanging out of the clew
  ropeEnd(g, 27, 8, 5, -0.3, 97, hemp, hempD);
  px(g, 8, 7, cvD); px(g, 26, 7, cvD);
  return outline(c, OUTBG);
}

// BACKGROUND. A line of washing across the deck, stiff with salt: two shirts, a pair of slops and a
// neckerchief, all dried hard and hanging like board. 48x20, hung from the line at the top.
export function bakeWashing() {
  const W = 48, H = 20; const [c, g] = canvas(W, H);
  const cv = far(F.cv, 0.22), cvM = far(F.cvM, 0.22), cvD = far(F.cvD, 0.18), cvDD = far(F.cvDD, 0.14);
  const hemp = far(F.hemp, 0.28), hempD = far(F.hempD, 0.24);
  // the line itself, sagging under the weight of wet canvas
  ropeSag(g, 0, 47, 1, 1, 2, hemp, hempD);
  const lineY = x => 1 + Math.round(Math.sin(x / 47 * Math.PI) * 2);
  // a shirt: a square body, short sleeves standing out stiff, a split at the neck
  const shirt = (x0, y0, h, body, shadow) => {
    rect(g, x0 + 2, y0, 8, h, body);
    rect(g, x0, y0 + 1, 2, 4, body); rect(g, x0 + 10, y0 + 1, 2, 4, body);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + 12; x++) {
      const d = g.getImageData(x, y, 1, 1).data; if (!d[3]) continue;
      if (x >= x0 + 10 || (x > x0 + 7 && hsh(x, y, 3) < 0.3)) px(g, x, y, shadow);
      if (x === x0 + 5 || x === x0 + 8) px(g, x, y, shadow);
      if (y === y0 + h - 1) px(g, x, y, shadow);
    }
    rect(g, x0 + 5, y0, 2, 3, cvDD);
    px(g, x0 + 2, y0, cv); px(g, x0 + 3, y0 + 1, cv); px(g, x0, y0 + 1, cv);
    for (let y = y0 + h - 2; y < y0 + h; y++) if (hsh(x0, y, 9) < 0.6) px(g, x0 + 3, y, cvDD);
  };
  shirt(2, lineY(8), 11, cv, cvD);
  shirt(28, lineY(34), 10, cvM, cvDD);
  // a pair of slops: wide sailors' trousers, the legs standing apart and stiff
  const sx = 15, sy = lineY(20);
  rect(g, sx, sy, 11, 5, cvM);
  rect(g, sx, sy + 5, 5, 8, cvM); rect(g, sx + 6, sy + 5, 5, 8, cvM);
  for (let y = sy; y < sy + 13; y++) for (let x = sx; x < sx + 11; x++) {
    const d = g.getImageData(x, y, 1, 1).data; if (!d[3]) continue;
    if (x >= sx + 9) px(g, x, y, cvDD);
    else if (x === sx + 3 || x === sx + 8) px(g, x, y, cvD);
    else if (hsh(x, y, 11) < 0.12) px(g, x, y, cvD);
  }
  rect(g, sx, sy, 11, 1, cv); rect(g, sx, sy + 12, 5, 1, cvDD); rect(g, sx + 6, sy + 12, 5, 1, cvDD);
  px(g, sx + 5, sy + 6, cvDD); px(g, sx + 5, sy + 7, cvDD);
  // a tarred-black neckerchief and a red one, knotted straight over the line
  for (const [nx, ny, col, dark] of [[41, lineY(43), F.red, F.redD], [45, lineY(46), F.tar, F.tarL]]) {
    fillPoly(g, [[nx, ny], [nx + 5, ny], [nx + 2, ny + 7]], far(col, 0.2));
    px(g, nx + 1, ny + 2, far(dark, 0.2)); px(g, nx + 3, ny + 4, far(dark, 0.2)); px(g, nx, ny, far(F.glare, 0.2));
  }
  // the clothes-stops: a turn of twine over the line at every shoulder
  for (const x of [3, 11, 15, 25, 29, 37, 41, 45]) { px(g, x, lineY(x), hempD); px(g, x, lineY(x) + 1, hemp); }
  // the salt: white rime dried into the hems, and one drip that never fell
  for (const [x, y] of [[4, 13], [9, 12], [18, 17], [23, 16], [31, 12], [36, 11]]) { px(g, x, y, far(F.glare, 0.1)); px(g, x + 1, y, cv); }
  return outline(c, OUTBG);
}

// The galley: a big iron pot hung over a firebox on a brick hearth, the fire in and the steam going
// straight up in the still noon air. 24x18.
export function bakeCookPot() {
  const W = 24, H = 18; const [c, g] = canvas(W, H);
  // the hearth: brick in courses on a bed of sand, the mortar white with heat
  rect(g, 1, 12, 22, 6, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const row = y - 12, jn = (x + row * 3) % 5;
    if (row === 5) return F.tar;
    if (jn === 0 || row % 2 === 1) return F.plM;
    return hsh(x, y, 3) < 0.3 ? F.redD : (hsh(x, y, 5) < 0.5 ? F.och : F.red);
  });
  rect(g, 0, 16, 24, 2, F.plD); rect(g, 0, 17, 24, 1, F.tar);
  // the firebox mouth, and the fire in it: ochre at the heart, red at the edges, black above
  rect(g, 7, 12, 10, 5, F.tar);
  fillPoly(g, [[8, 16], [8, 14], [10, 12.4], [14, 12.4], [16, 14], [16, 16]], '#100c10');
  for (let y = 13; y < 17; y++) for (let x = 8; x < 16; x++) {
    const t = (y - 12) / 5, n = hsh(x, y, 7);
    if (n > 0.5 + t * 0.4) continue;
    px(g, x, y, y > 14 ? (n < 0.3 ? F.ochL : F.och) : (n < 0.25 ? F.och : F.red));
  }
  px(g, 11, 15, F.glare); px(g, 12, 16, F.ochL); px(g, 9, 16, F.redD);
  for (const [x, y] of [[9, 15], [14, 14]]) { px(g, x, y, F.tar); px(g, x + 1, y + 1, F.tarL); }
  // the pot: a deep iron belly, bright along her top where the sun strikes her, two lugs
  fillPoly(g, [[4, 5], [19, 5], [20, 8], [18, 12], [6, 12], [4, 8]], KEY2);
  recolor(g, W, H, KEY2, (x, y) => {
    const f = (x - 4) / 16;
    if (y === 5) return F.ir3;
    if (y === 6 && f < 0.5) return F.ir2;
    if (f > 0.82) return '#191c20';
    if (y > 10) return '#191c20';
    return hsh(x, y, 9) < 0.2 ? F.ir0 : F.ir1;
  });
  rect(g, 3, 5, 18, 1, F.ir3); rect(g, 3, 6, 18, 1, F.ir1); px(g, 3, 5, F.glare); px(g, 20, 6, F.ir0);
  for (const lx of [4, 18]) { rect(g, lx, 7, 2, 2, F.ir2); px(g, lx, 7, F.ir3); px(g, lx + 1, 8, F.ir0); }
  // soot up her side, and what is in her coming over the rim
  for (let x = 6; x < 19; x++) if (hsh(x, 2, 11) < 0.4) px(g, x, 11, F.tar);
  px(g, 8, 4, F.plM); px(g, 9, 4, F.cvM); px(g, 14, 4, F.cvM);
  // the bail: an iron handle arching over her, hung from a crane off the hearth back
  for (let x = 5; x < 20; x++) { const y = 4 - Math.round(Math.sin((x - 5) / 14 * Math.PI) * 3); px(g, x, y, F.ir2); px(g, x, y + 1, F.ir0); }
  px(g, 12, 1, F.ir3); px(g, 13, 1, F.ir3);
  rect(g, 20, 1, 2, 11, F.ir1); px(g, 20, 1, F.ir3); px(g, 21, 9, F.ir0);
  rect(g, 19, 0, 3, 2, F.ir2); px(g, 21, 1, F.ir0);
  // the steam: three wisps going straight up, and a ladle hung off the crane
  wisp(g, 9, 3, 4, -0.3, 13);
  wisp(g, 13, 2, 3, 0.2, 17);
  wisp(g, 16, 3, 3, 0.4, 19);
  rect(g, 22, 4, 1, 5, F.wood); ellipse(g, 22.5, 10, 1.6, 1.2, F.ir1); px(g, 22, 10, F.ir3);
  return outline(c, OUT);
}

// Rum: casks on their bilges in a chock, one broached with a spigot and a tin under it. 28x16.
// v 0..1 — 0 is two casks full and bunged, 1 is one broached with the tin and a spill.
export function bakeRumBarrels(v) {
  v = ((v % 2) + 2) % 2; const W = 28, H = 16; const [c, g] = canvas(W, H);
  // the chock: two shaped beds of timber with a rail across their front
  rect(g, 1, 12, 26, 3, F.woodD); rect(g, 1, 12, 26, 1, F.plD);
  for (const cx of [3, 12, 22]) { rect(g, cx, 11, 3, 4, F.wood); px(g, cx, 11, F.plM); px(g, cx + 2, 14, F.woodDD); }
  rect(g, 0, 15, 28, 1, F.tar);
  if (v === 0) {
    caskLying(g, 1, 2, 18, 11, 101);
    caskLying(g, 19, 6, 8, 7, 107);
    // the bungs on top, and the chalk the steward keeps his count in
    px(g, 8, 2, F.tar); px(g, 9, 2, F.tarL); px(g, 8, 3, F.tar);
    px(g, 22, 6, F.tar);
    for (const x of [6, 8]) { px(g, x, 9, F.cv); px(g, x, 10, F.cv); }
    px(g, 12, 10, F.cv); px(g, 13, 9, F.cv);
  } else {
    caskLying(g, 0, 1, 20, 12, 103);
    caskLying(g, 20, 7, 7, 6, 109);
    // broached: the spigot driven into her head, the rum still going, a tin under it
    rect(g, 19, 8, 3, 1, F.brassD); px(g, 19, 8, F.brass); px(g, 21, 8, F.brassL);
    rect(g, 20, 6, 1, 2, F.brass); px(g, 20, 6, F.brassL);
    px(g, 22, 9, F.ochL); px(g, 22, 10, F.och); px(g, 22, 11, F.ochD);
    ellipse(g, 23, 13, 2.4, 1.4, F.ir1); ellipse(g, 23, 12.6, 1.8, 1, F.ochD);
    px(g, 22, 12, F.ir3); px(g, 25, 13, F.ir0); px(g, 23, 12, F.ochL);
    // the spill soaked into the deck, and the bung knocked out and left on top
    for (let x = 20; x < 27; x++) if (hsh(x, 1, 13) < 0.6) px(g, x, 14, F.woodD);
    px(g, 14, 1, F.tar); px(g, 15, 1, F.tarL);
    px(g, 7, 1, F.tar); px(g, 8, 2, F.tar);
    for (const x of [5, 7]) { px(g, x, 8, F.cv); px(g, x, 9, F.cv); }
    px(g, 9, 9, F.cv); px(g, 10, 8, F.cv);
  }
  // the lashing over the lot of them, and the weed on the chock where the sea comes aboard
  ropeSag(g, 1, 26, 11, 11, 1);
  ropeEnd(g, 26, 12, 4, -0.3, 113);
  weedTuft(g, 6, 14, 5, 117); weedTuft(g, 17, 14, 3, 119);
  return outline(c, OUT);
}

// A hen coop: a slat box with a stone on the lid to keep it shut, a hen looking out of the gap and
// her straw coming through the slats. 20x16.
export function bakeChickenCoop() {
  const W = 20, H = 16; const [c, g] = canvas(W, H);
  // the box: a frame with vertical slats, the dark of the inside between them
  rect(g, 1, 4, 18, 11, F.tar);
  for (let x = 2; x < 18; x++) {
    if ((x - 2) % 3 === 2) continue;
    for (let y = 5; y < 14; y++) px(g, x, y, x < 4 ? F.pl : (hsh(x, y, 3) < 0.18 ? F.plD : ((x - 2) % 3 === 0 ? F.plM : F.plD)));
  }
  for (let x = 2; x < 18; x += 3) for (let y = 5; y < 14; y++) if (hsh(x, y, 5) < 0.5) px(g, x + 2, y, '#16131a');
  // the rails across the front, top and bottom, and the corner posts
  rect(g, 1, 4, 18, 2, F.wood); rect(g, 1, 4, 18, 1, F.plM);
  rect(g, 1, 12, 18, 2, F.wood); rect(g, 1, 12, 18, 1, F.plD);
  rect(g, 1, 4, 2, 11, F.plM); rect(g, 17, 4, 2, 11, F.woodD); px(g, 1, 4, F.pl);
  rect(g, 1, 14, 18, 1, F.woodDD); rect(g, 2, 15, 16, 1, F.tar);
  // the lid, with a beach stone on it and an ochre mark daubed on the end
  rect(g, 0, 2, 20, 2, F.plM); rect(g, 0, 2, 20, 1, F.pl); rect(g, 0, 4, 20, 1, F.woodD);
  ellipse(g, 13, 1.6, 3, 1.8, F.ir2); px(g, 12, 0, F.ir3); px(g, 15, 2, F.ir0); px(g, 11, 2, F.ir1);
  rect(g, 2, 3, 3, 1, F.och); px(g, 2, 3, F.ochL);
  // the hen: her head and breast out of a gap in the slats, one hard black eye on you
  rect(g, 5, 5, 8, 8, '#16131a');
  g.drawImage(fromGrid([
    '..RR...',
    '.RRRR..',
    '.hhhhR.',
    '.hkhYY.',
    'Hhhhh..',
    'HHHhh..',
    'HHHHh..',
    '.HHH...',
  ], { R: F.red, h: F.henL, H: F.hen, k: F.tar, Y: F.och }, 0), 5, 5);
  px(g, 8, 7, F.glare); px(g, 6, 9, F.henL); px(g, 10, 11, F.hen);
  px(g, 7, 6, F.redL); px(g, 6, 8, F.goldL);
  // her straw coming out through the slats, and a feather stuck on the rail
  for (const [x, y] of [[4, 13], [7, 13], [12, 12], [15, 13], [9, 13]]) { px(g, x, y, F.hemp); px(g, x + 1, y + 1, F.hempD); }
  px(g, 16, 11, F.cv); px(g, 16, 10, F.cvM);
  px(g, 3, 12, F.hempD); px(g, 2, 13, F.hemp);
  return outline(c, OUT);
}

// The chart table: a trestle with the chart of the drowned city weighted down on it, the dividers
// left standing in it and a lantern to read it by. 28x18.
export function bakeChartTable() {
  const W = 28, H = 18; const [c, g] = canvas(W, H);
  // the legs and the stretcher
  for (const lx of [3, 21] ) {
    rect(g, lx, 11, 3, 7, F.wood); rect(g, lx, 11, 1, 7, F.plM); px(g, lx + 2, 17, F.woodDD);
  }
  rect(g, 5, 14, 17, 2, F.woodD); rect(g, 5, 14, 17, 1, F.plD);
  rect(g, 2, 17, 24, 1, F.tar);
  // the top: one bleached plank with the seams black with tar
  rect(g, 1, 9, 26, 3, KEY);
  recolor(g, W, H, KEY, (x, y) => (y === 9 ? F.pl : (y === 11 ? F.woodD : (hsh(x, y, 3) < 0.18 ? F.plD : F.plM))));
  rect(g, 0, 9, 1, 3, F.plD); rect(g, 27, 9, 1, 3, F.woodD);
  // the chart: a pale sheet curling at both ends, the drowned coast inked on it
  fillPoly(g, [[3, 9], [5, 6], [21, 6], [23, 9]], KEY2);
  recolor(g, W, H, KEY2, (x, y) => (y === 6 ? F.cv : (y === 9 ? F.cvD : (hsh(x, y, 5) < 0.1 ? F.cvM : F.cv))));
  px(g, 3, 9, F.cvM); px(g, 23, 9, F.cvDD); px(g, 4, 8, F.cvM); px(g, 22, 8, F.cvD);
  for (let x = 6; x < 20; x++) { const y = 8 - Math.round(Math.sin(x * 0.7) + Math.sin(x * 0.3) * 0.6); px(g, x, Math.max(6, y), F.sea0); if (hsh(x, 1, 7) < 0.4) px(g, x, Math.max(6, y) + 1, F.sea1); }
  for (const [x, y] of [[8, 8], [12, 7], [16, 8], [19, 7]]) { px(g, x, y, F.redD); }
  px(g, 14, 7, F.red); px(g, 14, 6, F.redD); px(g, 13, 7, F.redD); px(g, 15, 7, F.redD);
  // the dividers: brass legs stood open on the chart, and a shot to hold the corner down
  ropeLine(g, 9, 8, 11, 4, F.brassL, F.brass);
  ropeLine(g, 13, 8, 11, 4, F.brass, F.brassD);
  px(g, 11, 3, F.brassL); px(g, 9, 8, F.ir0); px(g, 13, 8, F.ir0);
  circle(g, 4.5, 7.5, 1.5, F.ir1); px(g, 4, 6, F.ir3);
  // the lantern at the after end of the table, burning even at noon because the cabin is dark
  rect(g, 22, 3, 5, 6, F.ir1); rect(g, 22, 3, 5, 1, F.ir2);
  rect(g, 23, 4, 3, 4, F.och); rect(g, 23, 4, 3, 1, F.ochL); px(g, 24, 5, F.glare); px(g, 25, 7, F.ochD);
  fillPoly(g, [[21, 3], [24.5, 0], [28, 3]], F.ir2); px(g, 24, 0, F.ir3); px(g, 26, 2, F.ir0);
  rect(g, 22, 8, 5, 1, F.ir0);
  for (const [x, y] of [[21, 5], [27, 6], [24, 9]]) px(g, x, y, F.ochD);
  return outline(c, OUT);
}

// Plunder in heaps, as it comes aboard and before anybody divides it. 24x14 each.
// v 0 = coin and plate, v 1 = bolts of cloth out of somebody's hold, v 2 = a pile of taken weapons.
export function bakePlunder(v) {
  v = ((v % 3) + 3) % 3; const W = 24, H = 14, rnd = mulberry(2203 + v * 89); const [c, g] = canvas(W, H);
  if (v === 0) {
    // the heap: a dune of loose coin, dithered so it reads as a thousand small bright things
    fillPoly(g, [[1, 13], [2, 9], [6, 6], [11, 5], [16, 7], [21, 9], [23, 13]], KEY);
    recolor(g, W, H, KEY, (x, y) => {
      const n = hsh(x, y, 3);
      if (y > 11) return n < 0.4 ? F.brassD : F.ochD;
      if (n < 0.18) return F.goldL;
      if (n < 0.5) return F.gold;
      return n < 0.8 ? F.brass : F.brassD;
    });
    // the edges of single coins standing out of it, so the heap has grain
    for (let i = 0; i < 22; i++) { const x = 2 + ((rnd() * 20) | 0), y = 6 + ((rnd() * 7) | 0); const d = g.getImageData(x, y, 1, 1).data; if (!d[3]) continue; px(g, x, y, F.brassD); px(g, x + 1, y, F.goldL); }
    // a great charger leaning against the heap, a goblet on its side, a string of pearls over it
    fillPoly(g, [[14, 12], [15, 6], [19, 4], [22, 6], [22, 11], [18, 13]], KEY2);
    recolor(g, W, H, KEY2, (x, y) => (x < 17 ? F.ir3 : (x > 20 ? F.ir1 : (hsh(x, y, 5) < 0.2 ? F.ir1 : F.ir2))));
    for (let y = 5; y < 12; y++) px(g, 17 + ((y & 1) ? 0 : 1), y, F.glare);
    px(g, 19, 4, F.glare); px(g, 20, 5, F.ir3); px(g, 21, 10, F.ir0);
    rect(g, 4, 8, 4, 2, F.brassD); rect(g, 4, 8, 4, 1, F.brass); px(g, 4, 8, F.goldL);
    rect(g, 7, 7, 1, 3, F.brass); ellipse(g, 9, 7, 1.6, 1.2, F.brassD); px(g, 9, 7, F.goldL);
    for (const [x, y] of [[10, 5], [12, 4], [14, 5], [16, 6]]) { px(g, x, y, F.cv); px(g, x + 1, y + 1, F.cvM); }
    px(g, 11, 4, F.glare);
  } else if (v === 1) {
    // three bolts of cloth on their ends, the lay of the roll showing in the cut end of each
    const bolts = [[2, 4, 7, 9, F.red, F.redD, F.redL], [9, 2, 8, 11, F.sea1, F.sea0, F.sea2], [17, 5, 6, 8, F.och, F.ochD, F.ochL]];
    for (const [x0, y0, w, h, base, dark, lightc] of bolts) {
      rect(g, x0, y0, w, h, base);
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        if (x > x0 + w - 3) px(g, x, y, dark);
        else if (hsh(x, y, 7) < 0.14) px(g, x, y, dark);
      }
      rect(g, x0, y0, w, 1, lightc);
      // the cut end: the cloth rolled round on itself in rings
      for (let k = 0; k < 3; k++) { const r = 1 + k * 1.4; for (let a = 0; a < 14; a++) { const t = a / 14 * Math.PI * 2; px(g, Math.round(x0 + w / 2 + Math.cos(t) * r), Math.round(y0 + 1 + Math.sin(t) * r * 0.6), k & 1 ? lightc : dark); } }
      rect(g, x0, y0 + h - 1, w, 1, dark);
    }
    // a length pulled off one of them and spilling down the heap, and the twine off another
    for (let x = 1; x < 12; x++) { const y = 11 + Math.round(Math.sin(x * 0.5) * 1.2); px(g, x, y, F.sea2); px(g, x, y + 1, F.sea1); if (hsh(x, 1, 9) < 0.3) px(g, x, y + 2, F.sea0); }
    rect(g, 0, 13, 24, 1, F.tar);
    ropeLine(g, 17, 6, 23, 9);
    px(g, 23, 10, F.hempDD);
  } else {
    // the weapons: cutlasses thrown in a heap, crossed, with a pistol and a boarding axe on top
    rect(g, 1, 12, 22, 2, F.tar);
    for (const [x0, y0, x1, y1, hilt] of [[2, 12, 21, 6, 1], [2, 9, 21, 11, 0], [4, 13, 19, 3, 1]]) {
      // each blade: a hard white edge over a dark back, a brass guard and a bound grip
      ropeLine(g, x0, y0 - 1, x1, y1 - 1, F.ir3, F.ir3);
      ropeLine(g, x0, y0, x1, y1, F.ir2, F.ir1);
      ropeLine(g, x0, y0 + 1, x1, y1 + 1, F.ir0, F.ir0);
      if (hilt) { rect(g, x0 - 1, y0 - 2, 3, 4, F.brass); px(g, x0, y0 - 2, F.brassL); px(g, x0 + 1, y0 + 1, F.brassD); rect(g, x0 - 3, y0, 2, 2, F.tar); }
      else { rect(g, x1 - 1, y1 - 2, 3, 4, F.brass); px(g, x1, y1 - 2, F.brassL); px(g, x1 + 1, y1 + 1, F.brassD); rect(g, x1 + 2, y1, 2, 2, F.tar); }
    }
    // a boarding axe across the top of the heap, and a pistol dropped on it
    ropeLine(g, 5, 8, 16, 3, F.wood, F.woodD);
    fillPoly(g, [[16, 1], [20, 2], [20, 5], [16, 5], [15, 3]], F.ir1);
    px(g, 17, 2, F.ir3); px(g, 19, 2, F.ir3); px(g, 19, 5, F.ir0); px(g, 16, 4, F.ir2);
    rect(g, 8, 9, 7, 1, F.ir2); rect(g, 8, 10, 7, 1, F.ir0);
    fillPoly(g, [[6, 9], [8, 9], [8, 13], [5, 12]], F.wood); px(g, 7, 10, F.woodDD); px(g, 6, 9, F.plM);
    rect(g, 9, 8, 2, 2, F.brassD); px(g, 9, 8, F.brassL);
    // a pike head and a powder flask sticking out of the bottom of it
    fillPoly(g, [[20, 8], [23, 9], [20, 11]], F.ir2); px(g, 22, 9, F.glare); px(g, 20, 10, F.ir0);
    ellipse(g, 3, 10, 2, 2.6, F.wood); px(g, 2, 8, F.plM); px(g, 4, 11, F.woodDD); rect(g, 2, 7, 2, 1, F.brassD);
  }
  return outline(c, OUT);
}

// The crow's nest: a barrel top seized to the masthead with a rack of glasses on the rim. 22x18.
// ITS BOTTOM ROW IS THE MASTHEAD, not a ground line — it hangs at the top of a mast. The middle of
// her is left open: the game draws the lookout standing in it.
export function bakeCrowNest() {
  const W = 22, H = 18; const [c, g] = canvas(W, H);
  // the far rim, seen across the open middle of her: the inside of the staves, in shadow
  for (let x = 1; x < 21; x++) { px(g, x, 5, F.plM); px(g, x, 6, F.woodDD); }
  px(g, 1, 5, F.pl); px(g, 20, 5, F.plD);
  for (let x = 2; x < 20; x += 3) px(g, x, 5, F.plD);
  // the sides of her, carried down from the rim to the turn of her bilge
  for (const [sx, lit] of [[1, 1], [19, 0]]) for (let y = 5; y < 14; y++) {
    px(g, sx, y, lit ? F.pl : F.woodDD); px(g, sx + (lit ? 1 : -1), y, lit ? F.plM : F.plDD);
  }
  // the near wall: a tub of bleached staves, narrowing to her floor, with an ochre band round her
  const bot = x => 15 - Math.round(Math.pow(Math.abs(x - 10.5) / 9.5, 2.2) * 3);
  for (let x = 1; x < 21; x++) for (let y = 8; y <= bot(x); y++) px(g, x, y, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const f = (x - 1) / 19;
    if (y === 8) return F.pl;
    if (y >= bot(x)) return F.woodDD;
    if ((x - 1) % 3 === 2) return F.plDD;
    if (f > 0.78) return F.plDD;
    if (f < 0.16) return F.pl;
    return hsh(x, y, 3) < 0.18 ? F.plD : F.plM;
  });
  rect(g, 2, 11, 18, 2, F.och); rect(g, 2, 11, 18, 1, F.ochL);
  flake(g, W, H, 2, 11, 18, 2, F.och, F.plD, F.ochD, 5);
  for (let x = 4; x < 19; x += 6) px(g, x, 12, F.ochD);
  // the hoops round her, and the floor she stands on with its knees under it
  hoop(g, 2, 19, 9, 7);
  hoop(g, 3, 18, 13, 11);
  rect(g, 5, 15, 12, 1, F.woodD);
  fillPoly(g, [[6, 15], [9, 15], [9, 17], [8, 17]], F.wood);
  fillPoly(g, [[16, 15], [13, 15], [13, 17], [14, 17]], F.woodD);
  // the masthead she is seized to, coming up from below
  rect(g, 9, 15, 4, 3, F.wood); rect(g, 9, 15, 1, 3, F.plM); px(g, 12, 17, F.woodDD);
  seizing(g, 8, 15, 6, 2);
  // the rack on her rim: two brass glasses and a speaking trumpet stood in it
  rect(g, 15, 2, 6, 4, F.woodD); rect(g, 15, 2, 6, 1, F.plM); px(g, 20, 5, F.woodDD);
  for (const [gx, gl] of [[16, 0], [18, 1]]) {
    rect(g, gx, gl ? 0 : 1, 1, gl ? 5 : 4, F.brass); px(g, gx, gl ? 0 : 1, F.brassL); px(g, gx, 4, F.brassD);
  }
  rect(g, 20, 1, 1, 4, F.ir2); px(g, 20, 1, F.ir3);
  // a rope tail over the rim and the lookout's dinner in a net bag hung off the side
  ropeEnd(g, 3, 10, 7, 0.3, 127);
  px(g, 19, 10, F.hempD); px(g, 20, 11, F.hemp); px(g, 20, 12, F.hempD);
  return outline(c, OUT);
}

// BACKGROUND. A standing mast with her yard across and the sail furled up on it in a fat bundle,
// the gaskets passed round it. 16x80, the bottom row at the deck. v 0..1 — the yard is higher on 1.
export function bakeMastTall(v) {
  v = ((v % 2) + 2) % 2; const W = 16, H = 80; const [c, g] = canvas(W, H);
  const pl = far(F.pl, 0.2), plM = far(F.plM, 0.2), plD = far(F.plD, 0.18), wood = far(F.wood, 0.16), woodD = far(F.woodD, 0.14), woodDD = far(F.woodDD, 0.1);
  const cv = far(F.cv, 0.24), cvM = far(F.cvM, 0.24), cvD = far(F.cvD, 0.2), cvDD = far(F.cvDD, 0.14);
  const hemp = far(F.hemp, 0.24), hempD = far(F.hempD, 0.2);
  const ir0 = far(F.ir0, 0.12), ir1 = far(F.ir1, 0.16), ir3 = far(F.ir3, 0.2), och = far(F.och, 0.2), ochD = far(F.ochD, 0.16);
  // the mast: round, tapering up, the sun down her left side and the tar up her right
  const lx = y => 6 - Math.round((y / H) * 1.9), rx = y => 9 + Math.round((y / H) * 1.9);
  for (let y = 2; y < H; y++) {
    const a = lx(y), b = rx(y);
    for (let x = a; x <= b; x++) {
      const t = (x - a) / Math.max(1, b - a);
      px(g, x, y, t < 0.13 ? plM : (t < 0.28 ? plD : (t < 0.5 ? wood : (t > 0.84 ? woodDD : (hsh(x, y, 3) < 0.24 ? woodDD : woodD)))));
    }
  }
  // the grain and the long checks in her
  for (const ox of [1, 3] ) for (let y = 6; y < H - 2; y++) if (hsh(ox, y, 5) < 0.6) px(g, lx(y) + ox + (y % 11 === 0 ? 1 : 0), y, wood);
  // the truck at her head, the iron bands down her, and the mast hoops on the lower part
  rect(g, 4, 0, 8, 2, plM); rect(g, 4, 0, 8, 1, pl); px(g, 11, 1, woodDD);
  for (const by of [34, 58]) { rect(g, lx(by) - 1, by, rx(by) - lx(by) + 3, 2, ir0); rect(g, lx(by) - 1, by, rx(by) - lx(by) + 3, 1, ir1); px(g, lx(by) - 1, by, ir3); }
  for (const by of [48]) { rect(g, lx(by) - 1, by, rx(by) - lx(by) + 3, 1, och); px(g, rx(by) + 1, by, ochD); }
  // the yard: a long spar across her, with her lifts going up and her braces down
  const yy = v === 0 ? 22 : 15;
  for (let x = 0; x < W; x++) {
    const ys = yy + (x < 8 ? Math.round((8 - x) * 0.12) : Math.round((x - 8) * 0.1));
    px(g, x, ys - 1, pl); px(g, x, ys, plD); px(g, x, ys + 1, woodDD); px(g, x, ys + 2, woodDD);
  }
  rect(g, 5, yy - 2, 6, 2, ir0); rect(g, 5, yy - 2, 6, 1, ir3);
  px(g, 0, yy, wood); px(g, 15, yy, wood);
  ropeLine(g, 1, yy, 7, yy - 8, hemp, hempD);
  ropeLine(g, 14, yy, 8, yy - 8, hemp, hempD);
  // the sail furled up on the yard: a fat roll of stiff canvas, tapering to the yardarms
  for (let x = 0; x < W; x++) {
    const ys = yy + 3 + (x < 8 ? Math.round((8 - x) * 0.12) : Math.round((x - 8) * 0.1));
    const t = Math.sin(Math.min(1, Math.max(0, (x + 0.5) / W)) * Math.PI);
    const h = 2 + Math.round(t * 5.2);
    for (let k = 0; k < h; k++) {
      const f = k / Math.max(1, h - 1);
      px(g, x, ys + k, f < 0.22 ? cv : (f > 0.72 ? cvDD : (hsh(x, k, 7) < 0.24 ? cvD : cvM)));
    }
    if (x % 4 === 1) for (let k = 1; k < h - 1; k++) px(g, x, ys + k, cvD);
    px(g, x, ys + h - 1, cvDD);
    px(g, x, ys + h, far(F.tar, 0.24));
  }
  // the gaskets: the turns of rope that hold the bundle up to the yard
  for (const gx of [2, 6, 10, 14]) { const ys = yy + 3 + (gx < 8 ? Math.round((8 - gx) * 0.12) : Math.round((gx - 8) * 0.1)); for (let k = -1; k < 5; k++) px(g, gx, ys + k, (k & 1) ? hempD : hemp); }
  // the clew lines coming down off the bundle, and a pair of shroud stubs at the foot
  ropeEnd(g, 3, yy + 8, 9, 0.2, 131, hemp, hempD);
  ropeEnd(g, 12, yy + 8, 7, -0.2, 137, hemp, hempD);
  ropeLine(g, lx(70), 70, 0, 79, hemp, hempD);
  ropeLine(g, rx(70), 70, 15, 79, hemp, hempD);
  // the weed and the tar at her foot, where the sea comes over the deck
  for (let x = lx(H - 1) - 1; x <= rx(H - 1) + 1; x++) px(g, x, H - 1, far(F.tar, 0.14));
  for (const [x, n] of [[3, 3], [10, 3]]) weedTuft(g, x, H - 3, n, 139);
  return outline(c, OUTBG);
}

// BACKGROUND. The fleet's colours on a short staff: two pennants and the black flag. 20x14 — the
// bottom row is the foot of the staff. v 0..2. The game sways them; this is the still frame.
export function bakePennant(v) {
  v = ((v % 3) + 3) % 3; const W = 20, H = 14; const [c, g] = canvas(W, H);
  const pl = far(F.pl, 0.24), plM = far(F.plM, 0.24), woodD = far(F.woodD, 0.2);
  const brass = far(F.brass, 0.22), brassL = far(F.brassL, 0.2);
  // the staff, and the brass truck on the head of it
  for (let y = 1; y < H; y++) { px(g, 1, y, pl); px(g, 2, y, plM); px(g, 3, y, woodD); }
  rect(g, 1, 0, 3, 1, brass); px(g, 2, 0, brassL);
  rect(g, 0, 12, 5, 2, far(F.ir1, 0.2)); px(g, 0, 12, far(F.ir3, 0.2));
  if (v === 0) {
    // a long red swallowtail, the fly split and the cloth frayed where it has whipped itself out
    fillPoly(g, [[4, 1], [19, 3], [14, 5], [19, 8], [4, 7]], KEY);
    recolor(g, W, H, KEY, (x, y) => {
      const n = hsh(x, y, 3);
      if (y <= 2) return far(F.redL, 0.2);
      if (x > 13) return far(F.redD, 0.18);
      return n < 0.22 ? far(F.redD, 0.18) : far(F.red, 0.2);
    });
    flake(g, W, H, 4, 1, 16, 7, far(F.red, 0.2), far(F.och, 0.22), far(F.redD, 0.18), 5);
    for (const [x, y] of [[18, 3], [13, 5], [18, 8]]) px(g, x, y, far(F.cvD, 0.2));
  } else if (v === 1) {
    // an ochre streamer with a black bend across it, the tail gone ragged
    fillPoly(g, [[4, 2], [18, 4], [19, 6], [15, 7], [4, 8]], KEY);
    recolor(g, W, H, KEY, (x, y) => {
      if ((x + y * 2) % 9 < 2) return far(F.tar, 0.18);
      if (y <= 3) return far(F.ochL, 0.2);
      if (x > 14) return far(F.ochD, 0.18);
      return hsh(x, y, 7) < 0.22 ? far(F.ochD, 0.18) : far(F.och, 0.2);
    });
    for (const [x, y] of [[19, 5], [16, 7], [18, 6]]) px(g, x, y, far(F.cvD, 0.2));
  } else {
    // the black flag: nearly square, a pale mark on it, the cloth sun-rotted to grey at the fly
    fillPoly(g, [[4, 1], [18, 2], [18, 10], [4, 10]], KEY);
    recolor(g, W, H, KEY, (x, y) => {
      const n = hsh(x, y, 9);
      if (x > 15) return n < 0.3 ? far(F.ir1, 0.2) : far(F.tarL, 0.18);
      if (y === 1 || y === 2) return far(F.tarL, 0.18);
      return n < 0.14 ? far(F.tarL, 0.18) : far(F.tar, 0.16);
    });
    // the mark: an hourglass over two crossed bones, in bleached bone white
    const bone = far(F.cv, 0.16), boneD = far(F.cvD, 0.18);
    for (const [x, y, w] of [[9, 3, 5], [10, 4, 3], [11, 5, 1], [10, 6, 3], [9, 7, 5]]) rect(g, x, y, w, 1, bone);
    px(g, 9, 3, boneD); px(g, 13, 7, boneD);
    ropeLine(g, 7, 9, 15, 9, bone, boneD);
    px(g, 7, 8, bone); px(g, 15, 8, bone); px(g, 7, 10, boneD); px(g, 15, 10, boneD);
    for (const [x, y] of [[17, 4], [17, 8], [18, 6]]) px(g, x, y, far(F.cvDD, 0.2));
  }
  // the halyard made fast down the staff
  ropeLine(g, 4, 1, 2, 11, far(F.hemp, 0.26), far(F.hempD, 0.24));
  return outline(c, OUTBG);
}

// BACKGROUND. A boarding net hung over a ship's side: hemp in diamond mesh, the knots standing at
// every crossing, a couple of meshes parted. 24x48, hung from the head rope at the top. No outline —
// the mesh must stay open. The climbable tiles are separate; this is only what you see.
export function bakeBoardingNet() {
  const W = 24, H = 48; const [c, g] = canvas(W, H);
  const hemp = far(F.hemp, 0.22), hempD = far(F.hempD, 0.2), hempDD = far(F.hempDD, 0.16);
  // the head rope, seized to the rail, the net's top meshes hitched over it
  for (let x = 0; x < W; x++) { px(g, x, 0, hemp); px(g, x, 1, hempD); }
  for (let x = 1; x < W; x += 4) px(g, x, 1, hempDD);
  const sway = y => Math.round(Math.sin(y * 0.062) * 1.6);
  const knot = (r, k) => [(r % 2) * 2 + k * 4 + sway(r * 4), r * 4 + 2];
  const holes = [[3, 1], [3, 2], [8, 4], [9, 4]];
  const gone = (r, k) => holes.some(([hr, hk]) => hr === r && hk === k);
  // the mesh: every knot joined down to the two under it, so the diamonds close properly
  for (let r = 0; r * 4 + 2 < H; r++) for (let k = -1; k < 8; k++) {
    const [x0, y0] = knot(r, k);
    if (x0 < -2 || x0 > W + 1) continue;
    for (const dk of [0, 1]) {
      const [x1, y1] = knot(r + 1, (r % 2) ? k + dk : k - 1 + dk);
      if (y1 >= H + 3) continue;
      if (gone(r, k) || gone(r + 1, (r % 2) ? k + dk : k - 1 + dk)) continue;
      ropeLine(g, x0, y0, x1, Math.min(H - 1, y1), hemp, hempD);
    }
  }
  // the knots themselves: a dark fat pixel at every crossing, which is what makes it read as net
  for (let r = 0; r * 4 + 2 < H; r++) for (let k = -1; k < 8; k++) {
    const [x0, y0] = knot(r, k);
    if (x0 < 0 || x0 >= W || gone(r, k)) continue;
    px(g, x0, y0, hempDD); px(g, x0, y0 - 1, hemp);
  }
  // the parted meshes: the broken ends curl back on themselves
  for (const [hr, hk] of holes) {
    const [x0, y0] = knot(hr, hk);
    if (x0 < 1 || x0 >= W - 1) continue;
    px(g, x0 - 1, y0 - 1, hempDD); px(g, x0 + 1, y0 + 1, hempDD);
  }
  // the foot: the bottom meshes hanging free, with their ends frayed and a weight seized in one
  for (let k = 0; k < 7; k++) {
    const [x0, y0] = knot(11, k);
    if (x0 < 0 || x0 >= W) continue;
    ropeEnd(g, x0, Math.min(H - 4, y0), 3, (k & 1) ? 0.3 : -0.3, 149 + k, hemp, hempD);
  }
  const [wx] = knot(11, 3);
  rect(g, Math.max(0, wx - 1), H - 3, 3, 2, far(F.ir1, 0.2)); px(g, Math.max(0, wx - 1), H - 3, far(F.ir3, 0.22));
  // the weed growing up the bottom of her where she trails in the water
  weedTuft(g, 4, H - 4, 4, 151); weedTuft(g, 16, H - 5, 3, 157);
  return c;
}

// A horn lantern on a deck post: tin cone, four panes of scraped horn, an iron pan under it.
// 12x24. `lit` has her burning and throwing light on the post and the deck.
export function bakeLanternDeck(lit) {
  const W = 12, H = 24; const [c, g] = canvas(W, H);
  // the post, and the foot bracket bolted through the deck
  rect(g, 5, 15, 2, 8, F.wood); px(g, 5, 15, F.plM); px(g, 6, 22, F.woodDD);
  for (let y = 16; y < 23; y++) px(g, 5, y, hsh(5, y, 3) < 0.3 ? F.plD : F.plM);
  rect(g, 3, 20, 6, 2, F.ir1); rect(g, 3, 20, 6, 1, F.ir2); px(g, 3, 21, F.ir0); px(g, 8, 21, F.ir0);
  rect(g, 2, 22, 8, 1, F.ir0); rect(g, 3, 23, 6, 1, F.tar);
  px(g, 4, 19, F.rust);
  // the body: an iron frame with the horn panes set into it
  rect(g, 2, 6, 8, 9, F.ir1);
  rect(g, 3, 7, 6, 7, KEY);
  if (lit) {
    recolor(g, W, H, KEY, (x, y) => {
      const dx = Math.abs(x - 5.5), dy = Math.abs(y - 10.5);
      const d = dx + dy * 0.8;
      if (d < 1.6) return F.glare;
      if (d < 3) return F.ochL;
      return hsh(x, y, 5) < 0.2 ? F.och : F.ochL;
    });
    // the flame itself, and the light on her frame, her post and the deck at her foot
    px(g, 5, 10, F.glare); px(g, 6, 10, F.glare); px(g, 5, 9, F.cv);
    for (const [x, y] of [[1, 8], [10, 8], [1, 12], [10, 12], [5, 4], [2, 16], [9, 16]]) px(g, x, y, F.ochD);
    for (const [x, y] of [[5, 16], [6, 17], [4, 18]]) px(g, x, y, F.och);
    rect(g, 2, 22, 8, 1, F.ochD);
  } else {
    recolor(g, W, H, KEY, (x, y) => {
      if (x < 5) return hsh(x, y, 7) < 0.3 ? F.cvD : F.cvM;
      return hsh(x, y, 9) < 0.3 ? F.cvDD : F.cvD;
    });
    px(g, 4, 8, F.cv); px(g, 7, 12, F.tarL); px(g, 5, 10, F.tar); px(g, 6, 11, F.ir0);
  }
  // the frame standing in front of the panes, and the soot she has laid on her own glass
  for (const fx of [2, 5, 9]) for (let y = 6; y < 15; y++) px(g, fx, y, fx === 2 ? F.ir2 : F.ir0);
  rect(g, 2, 6, 8, 1, F.ir2); rect(g, 2, 13, 8, 1, F.ir0);
  // the tin cone over her, the ring on top, and the pan under her to catch the drip
  fillPoly(g, [[1, 6], [5.5, 1], [10, 6]], F.ir2);
  fillPoly(g, [[5.5, 1], [10, 6], [6, 6]], F.ir0);
  px(g, 5, 2, F.ir3); px(g, 4, 3, F.ir3); px(g, 9, 5, F.ir0);
  rect(g, 5, 0, 2, 1, F.ir2);
  rect(g, 2, 14, 8, 2, F.ir1); rect(g, 2, 14, 8, 1, F.ir2); px(g, 9, 15, F.ir0);
  px(g, 3, 16, F.tar);
  return outline(c, OUT);
}

// The water butt: a cask standing open at the head with a dipper hooked on her rim, her canvas cover
// half off and the ration tin chained to her. 18x18.
export function bakeWaterButt() {
  const W = 18, H = 18; const [c, g] = canvas(W, H);
  caskUp(g, 1, 2, 16, 16, 163, false);
  // the head struck out of her: the water standing in her, and the glare straight down on it
  ellipse(g, 9, 3.6, 5.6, 2.2, F.plM);
  ellipse(g, 9, 3.8, 4.6, 1.7, F.woodDD);
  ellipse(g, 9, 4, 4.2, 1.4, F.sea0);
  for (let x = 5; x < 13; x++) if (hsh(x, 1, 5) < 0.5) px(g, x, 4, F.sea1);
  px(g, 7, 4, F.foam); px(g, 8, 4, F.glare); px(g, 11, 4, F.sea2); px(g, 6, 5, F.sea1);
  px(g, 4, 3, F.pl); px(g, 5, 2, F.pl); px(g, 13, 4, F.plDD);
  // the canvas cover, dragged off her head and left hanging down her side
  fillPoly(g, [[12, 3], [17, 4], [17, 10], [14, 8], [13, 5]], KEY);
  recolor(g, W, H, KEY, (x, y) => (y < 5 ? F.cv : (x > 15 ? F.cvDD : (hsh(x, y, 7) < 0.2 ? F.cvD : F.cvM))));
  px(g, 13, 4, F.glare); px(g, 16, 9, F.cvDD); px(g, 15, 6, F.cvD);
  ropeLine(g, 12, 4, 16, 5, F.hemp, F.hempD);
  // the dipper: a wooden cup on a long handle, hooked over her rim
  rect(g, 2, 5, 1, 6, F.wood); px(g, 2, 5, F.plM); px(g, 2, 10, F.woodDD);
  ellipse(g, 2, 12, 2.2, 1.8, F.plM); ellipse(g, 2, 11.6, 1.4, 1, F.woodD);
  px(g, 1, 11, F.pl); px(g, 3, 13, F.woodDD);
  px(g, 2, 4, F.ir2); px(g, 3, 4, F.ir1);
  // the ration tin on its chain, and the marks of every hand that has been at her
  for (let y = 8; y < 13; y++) { px(g, 15, y, (y & 1) ? F.ir0 : F.ir2); }
  ellipse(g, 15, 14, 1.8, 1.4, F.ir1); px(g, 14, 13, F.ir3); px(g, 16, 15, F.ir0);
  px(g, 6, 8, F.plDD); px(g, 10, 9, F.plDD); px(g, 8, 11, F.woodDD);
  weedTuft(g, 3, 16, 4, 167); weedTuft(g, 12, 16, 3, 169);
  return outline(c, OUT);
}

// Heavy cable coiled down on deck. 22x10, v 0..1 — 0 is a flat cheese coiled right-handed,
// 1 is a taller coil flaked down beside a small one, with the end tucked under.
export function bakeCoiledCable(v) {
  v = ((v % 2) + 2) % 2; const W = 22, H = 10; const [c, g] = canvas(W, H);
  // a coil is drawn as nested rings: the rope lay alternates along every ring, which is what makes
  // a flat ellipse read as rope and not as a painted target
  const coil = (cx, cy, rx, ry, turns, seed) => {
    for (let t = turns - 1; t >= 0; t--) {
      const a = rx * (t + 1) / turns, b = Math.max(0.9, ry * (t + 1) / turns);
      for (let y = Math.floor(cy - b - 1); y <= Math.ceil(cy + b + 1); y++) for (let x = Math.floor(cx - a - 1); x <= Math.ceil(cx + a + 1); x++) {
        const dx = (x + 0.5 - cx) / a, dy = (y + 0.5 - cy) / b, r2 = dx * dx + dy * dy;
        if (r2 > 1 || r2 < 0.52) continue;
        const lay = ((x * 2 + y * 3) % 5) < 2;
        let col = lay ? F.hemp : F.hempD;
        if (dy > 0.4) col = lay ? F.hempD : F.hempDD;
        if (dy < -0.5) col = lay ? F.glare : F.hemp;
        if (r2 > 0.84) col = F.hempDD;
        px(g, x, y, col);
      }
    }
  };
  if (v === 0) {
    coil(10, 5.5, 9.4, 4, 3, 173);
    // the end of her, tucked through the middle of the coil and lying out on the deck
    ropeLine(g, 10, 5, 17, 8);
    ropeEnd(g, 17, 8, 2, 0.8, 179);
    px(g, 9, 5, F.hempDD); px(g, 11, 5, F.hempD);
    rect(g, 2, 9, 18, 1, F.tar);
  } else {
    coil(7, 5.5, 6.6, 4, 3, 181);
    coil(16, 6.5, 5.2, 3, 2, 187);
    // a bight lifted off the top of the big coil, and the bitter end lying between them
    ropeSag(g, 4, 13, 2, 3, 2);
    ropeLine(g, 11, 7, 13, 9);
    ropeEnd(g, 19, 7, 3, 0.4, 191);
    rect(g, 1, 9, 20, 1, F.tar);
    px(g, 7, 4, F.glare); px(g, 16, 5, F.glare);
  }
  weedTuft(g, 2, 8, 3, 193);
  return outline(c, OUT);
}

// A gunport in a hull side. 18x16 — IT IS A HULL PATCH, not a ground prop: its bottom row is more
// hull. `open` swings the lid up and shows the muzzle run out; closed, the lid is shut and ringed.
export function bakeGunport(open) {
  const W = 18, H = 16; const [c, g] = canvas(W, H);
  // the hull round the port: planking with the seams paid black, the wale across her top
  rect(g, 0, 0, W, H, KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y < 2) return y === 0 ? F.plM : F.woodD;
    if ((y - 2) % 4 === 3) return F.tar;
    if ((x * 3 + Math.floor((y - 2) / 4) * 5) % 17 < 2) return F.plDD;
    return hsh(x, y, 3) < 0.2 ? F.plD : F.plM;
  });
  rect(g, 0, 0, W, 1, F.pl);
  for (let x = 0; x < W; x += 5) { px(g, x, 1, F.ir0); px(g, x + 1, 1, F.ir3); }
  // the port itself: a heavy frame and the dark of her gundeck behind it
  rect(g, 3, 4, 12, 9, F.woodDD);
  rect(g, 4, 5, 10, 7, '#0f0d12');
  rect(g, 3, 4, 12, 1, F.plM); rect(g, 3, 12, 12, 1, F.woodD);
  px(g, 3, 4, F.pl); px(g, 14, 12, F.tar);
  if (open) {
    // the lid swung up and lying back on the hull above, on its hinge straps
    fillPoly(g, [[2, 3], [16, 2], [16, 4], [2, 4]], KEY2);
    recolor(g, W, H, KEY2, (x, y) => (y === 2 ? F.plM : (y === 3 ? F.red : F.redD)));
    flake(g, W, H, 2, 2, 14, 3, F.red, F.wood, F.redD, 5);
    for (const sx of [5, 11]) { rect(g, sx, 2, 2, 3, F.ir1); px(g, sx, 2, F.ir3); px(g, sx + 1, 4, F.ir0); }
    // the muzzle run out: a bright ring of iron with the bore black in the middle of it
    circle(g, 9.5, 8.5, 3.4, F.ir2);
    circle(g, 9.5, 8.5, 2.6, F.ir1);
    circle(g, 9.5, 8.5, 1.6, '#0a0a0d');
    for (let x = 6; x < 13; x++) { const dy = Math.round(Math.sqrt(Math.max(0, 11.5 - (x - 9.5) * (x - 9.5)))); px(g, x, 8 - dy, F.ir3); }
    px(g, 7, 6, F.glare); px(g, 8, 6, F.ir3); px(g, 12, 11, F.ir0);
    rect(g, 13, 7, 2, 4, F.ir1); px(g, 13, 7, F.ir3); px(g, 14, 10, F.ir0);
    // the breeching rope coming out past her, and the glint off the deck behind
    ropeLine(g, 5, 7, 7, 9);
    px(g, 5, 6, F.hempD); px(g, 6, 11, F.och); px(g, 5, 11, F.ochD);
  } else {
    // the lid shut: a planked leaf painted red, its ring bolt in the middle, caulking all round
    rect(g, 3, 4, 12, 9, KEY3);
    recolor(g, W, H, KEY3, (x, y) => {
      if (y === 4) return F.redL;
      if (y === 12 || x === 14) return F.redD;
      if ((y - 4) % 3 === 2) return F.redD;
      return hsh(x, y, 7) < 0.2 ? F.redD : F.red;
    });
    flake(g, W, H, 3, 4, 12, 9, F.red, F.wood, F.woodD, 11);
    flake(g, W, H, 3, 4, 12, 9, F.redD, F.woodD, F.woodDD, 13);
    for (const sx of [5, 11]) { rect(g, sx, 3, 2, 4, F.ir1); px(g, sx, 3, F.ir3); px(g, sx + 1, 6, F.ir0); }
    for (let y = 4; y < 13; y++) { px(g, 2, y, F.tar); px(g, 15, y, F.tar); }
    rect(g, 2, 13, 14, 1, F.tar);
    for (let y = 7; y < 11; y++) for (let x = 8; x < 11; x++) { const dx = x + 0.5 - 9.5, dy = y + 0.5 - 8.5; const r2 = dx * dx + dy * dy; if (r2 <= 2.2 * 2.2 && r2 >= 0.9) px(g, x, y, y < 9 ? F.ir3 : F.ir1); }
    px(g, 9, 10, F.ir0);
  }
  // the weed and the salt line along the bottom of her, where she sits in the water
  for (let x = 0; x < W; x++) if (hsh(x, 2, 17) < 0.5) px(g, x, H - 1, F.weedD);
  weedTuft(g, 1, H - 3, 3, 19); weedTuft(g, 12, H - 2, 4, 23);
  return outline(c, OUT);
}

// BACKGROUND. The flagship's stern gallery, seen across the lashings from another deck: carved work
// with the gilt flaking off it, small panes in five lights, balusters under them. 72x44 —
// IT IS A HULL PATCH, not a ground prop: its bottom row is more of her counter.
export function bakeSternWindows() {
  const W = 72, H = 44; const [c, g] = canvas(W, H);
  const pl = far(F.pl), plM = far(F.plM), plD = far(F.plD, 0.26), woodD = far(F.woodD, 0.24), woodDD = far(F.woodDD, 0.2);
  const gold = far(F.gold, 0.22), goldL = far(F.goldL, 0.2), brassD = far(F.brassD, 0.22);
  const red = far(F.red, 0.24), redD = far(F.redD, 0.2), och = far(F.och, 0.24), ochD = far(F.ochD, 0.2);
  const s0 = far(F.sea0, 0.2), s1 = far(F.sea1, 0.22), s2 = far(F.sea2, 0.24), s3 = far(F.sea3, 0.22), glare = far(F.glare, 0.1);
  // the transom behind the whole gallery: her planking, so nothing floats
  rect(g, 0, 0, W, H, KEY);
  recolor(g, W, H, KEY, (x, y) => ((y % 5 === 4) ? woodDD : (hsh(x, y, 3) < 0.2 ? woodD : plD)));
  // the cornice across her head: a heavy moulding with gilt dentils under it
  rect(g, 0, 0, W, 5, plM); rect(g, 0, 0, W, 1, pl); rect(g, 0, 4, W, 1, woodDD);
  rect(g, 1, 1, W - 2, 1, plD);
  for (let x = 2; x < W - 2; x += 4) { px(g, x, 2, gold); px(g, x + 1, 2, brassD); px(g, x, 3, brassD); }
  for (let x = 0; x < W; x++) if (hsh(x, 2, 5) < 0.3) px(g, x, 2, plM);
  // the five lights, each with its small panes: the glare walks across them left to right
  for (let i = 0; i < 5; i++) {
    const x0 = 4 + i * 13;
    rect(g, x0 - 1, 5, 12, 24, woodDD);
    rect(g, x0, 6, 10, 22, s1);
    for (let y = 6; y < 28; y++) for (let x = x0; x < x0 + 10; x++) {
      const pr = Math.floor((y - 6) / 5.5), pc = Math.floor((x - x0) / 3.4);
      const lit = (i * 3 + pc) - pr * 1.2;
      let col = lit > 4 ? s3 : (lit > 2 ? s2 : (lit > 0 ? s1 : s0));
      if (hsh(x, y, 7) < 0.1) col = s3;
      px(g, x, y, col);
    }
    // the mullions and transoms between the panes, and the lead that holds the glass
    for (const mc of [3, 7]) for (let y = 6; y < 28; y++) px(g, x0 + mc, y, (y & 1) ? plD : plM);
    for (const tr of [11, 17, 23]) for (let x = x0; x < x0 + 10; x++) px(g, x, tr, (x & 1) ? plD : plM);
    // the frame: gilt on the carved bead round every light, most of it gone
    rect(g, x0 - 1, 5, 12, 1, gold); rect(g, x0 - 1, 28, 12, 1, brassD);
    for (let y = 5; y < 29; y++) { px(g, x0 - 1, y, y < 16 ? gold : brassD); px(g, x0 + 10, y, woodDD); }
    flake(g, W, H, x0 - 1, 5, 12, 24, gold, plD, brassD, 11 + i);
    px(g, x0 + 1, 7, glare); px(g, x0 + 2, 6, glare);
    px(g, x0 + 8, 26, s0);
  }
  // the carved rail under the lights: a row of turned balusters with the sea showing between them
  rect(g, 0, 29, W, 2, plM); rect(g, 0, 29, W, 1, pl);
  rect(g, 0, 33, W, 2, plM); rect(g, 0, 34, W, 1, woodD);
  for (let x = 0; x < W; x++) for (let y = 31; y < 33; y++) px(g, x, y, '#2a3436');
  for (let x = 2; x < W - 2; x += 4) {
    rect(g, x, 31, 2, 2, plM); px(g, x, 31, pl); px(g, x + 1, 32, woodD);
    if (hsh(x, 1, 13) < 0.35) { px(g, x, 31, gold); px(g, x + 1, 31, brassD); }
  }
  // the lower band: carved panels in red and ochre, the paint lifting off the carving
  rect(g, 0, 35, W, 9, KEY2);
  recolor(g, W, H, KEY2, (x, y) => ((y % 4 === 3) ? woodDD : (hsh(x, y, 17) < 0.2 ? plD : plM)));
  for (let i = 0; i < 4; i++) {
    const x0 = 6 + i * 16;
    rect(g, x0, 36, 13, 7, red); rect(g, x0, 36, 13, 1, F.redL ? far(F.redL, 0.22) : red); rect(g, x0, 42, 13, 1, redD);
    rect(g, x0 + 2, 38, 9, 3, och); px(g, x0 + 2, 38, far(F.ochL, 0.22)); rect(g, x0 + 2, 40, 9, 1, ochD);
    // a scroll carved into the middle of every panel, picked out in gilt
    for (const [dx, dy] of [[4, 39], [5, 38], [6, 39], [7, 38], [8, 39]]) px(g, x0 + dx, dy, gold);
    px(g, x0 + 6, 40, goldL);
    flake(g, W, H, x0, 36, 13, 7, red, woodD, redD, 19 + i);
    flake(g, W, H, x0 + 2, 38, 9, 3, och, plD, ochD, 23 + i);
  }
  // the quarter badges at her corners: a volute of carved scrollwork either side
  for (const [bx, dir] of [[2, 1], [69, -1]]) {
    for (let k = 0; k < 8; k++) { const x = bx + dir * Math.round(Math.sin(k * 0.8) * 1.6), y = 6 + k * 3; px(g, x, y, k & 1 ? gold : plM); px(g, x + dir, y + 1, brassD); }
    rect(g, bx - 1, 5, 3, 1, gold);
  }
  rect(g, 0, H - 1, W, 1, woodDD);
  return outline(c, OUTBG);
}

// A shark up under the surface: the fin breaking it, the body a shadow seen through moving water.
// 24x10, SOFT — no outline at all, and its bottom row is water, not a ground line. The lowest thing
// in the sprite is the tail shadow; sit it in the swell like a buoy.
export function bakeShark() {
  const W = 24, H = 10; const [c, g] = canvas(W, H);
  // the body: a long shadow under the water, read only as a darkening of the sea, its edge dissolved
  const body = (x) => {
    const t = (x - 1) / 20;
    if (t < 0 || t > 1) return 0;
    return Math.sin(Math.pow(t, 0.8) * Math.PI) * 2.6;
  };
  for (let x = 1; x < 22; x++) {
    const hh = body(x);
    if (hh <= 0) continue;
    const cy = 6.4;
    for (let y = Math.round(cy - hh); y <= Math.round(cy + hh); y++) {
      if (y < 0 || y >= H) continue;
      const f = Math.abs(y + 0.5 - cy) / Math.max(0.6, hh);
      const n = hsh(x, y, 3);
      if (f > 0.72 && n < 0.55) continue;
      px(g, x, y, f < 0.4 ? (n < 0.3 ? '#0d3346' : F.sea0) : (n < 0.4 ? F.sea1 : mix(F.sea0, F.sea1, 0.5)));
    }
  }
  // the tail, wider and fainter, and the pectorals as two soft smudges
  for (const [tx, ty] of [[22, 4], [22, 8], [23, 5], [23, 7], [21, 6], [22, 6]]) if (hsh(tx, ty, 5) < 0.82) px(g, tx, ty, mix(F.sea0, F.sea1, 0.4));
  for (const [sx, sy] of [[10, 9], [11, 9], [14, 4], [15, 4]]) if (hsh(sx, sy, 7) < 0.8) px(g, sx, sy, mix(F.sea0, F.sea1, 0.6));
  // the fin: the one hard thing, and even that soft along its back edge
  fillPoly(g, [[8, 5], [13, 5], [11, 1], [9, 2]], F.sea0);
  px(g, 10, 2, '#0d3346'); px(g, 9, 3, '#0d3346'); px(g, 11, 2, F.sea1);
  px(g, 12, 4, F.sea1); px(g, 13, 5, mix(F.sea1, F.sea2, 0.4));
  px(g, 10, 1, F.sea1);
  // the water breaking round the foot of the fin, and the wake she pushes ahead of herself
  for (const [x, y] of [[7, 5], [8, 4], [13, 4], [14, 5], [9, 5], [12, 5]]) px(g, x, y, hsh(x, y, 9) < 0.4 ? F.sea3 : F.sea2);
  for (let x = 3; x < 8; x++) { const y = 5 + Math.round((8 - x) * 0.3); if (hsh(x, y, 11) < 0.5) px(g, x, y, F.sea2); }
  for (const [x, y] of [[14, 6], [16, 5], [18, 6], [20, 5]]) if (hsh(x, y, 13) < 0.6) px(g, x, y, mix(F.sea1, F.sea2, 0.5));
  px(g, 8, 4, F.foam); px(g, 13, 4, F.sea3);
  return c;
}

// A bosun's call on its lanyard, hung on a hook. 10x12 — IT HANGS FROM THE TOP ROW: the hook is at
// the top and nothing of it stands on the ground.
export function bakeWhistle() {
  const W = 10, H = 12; const [c, g] = canvas(W, H);
  // the hook it hangs on, driven into a beam overhead
  rect(g, 4, 0, 3, 1, F.ir1); px(g, 4, 0, F.ir3);
  for (const [x, y] of [[6, 1], [6, 2], [5, 3], [4, 3], [3, 2]]) px(g, x, y, F.ir2);
  px(g, 3, 3, F.ir0); px(g, 6, 1, F.ir3);
  // the lanyard: a black-and-white fancy plait, doubled, the call swinging on the bight of it
  for (let y = 2; y < 6; y++) { px(g, 4, y, (y & 1) ? F.tar : F.cvM); px(g, 6, y, (y & 1) ? F.cvM : F.tar); }
  px(g, 5, 5, F.tar); px(g, 5, 6, F.cvM);
  // the call: the keel plate, the wind pipe lying along it, the buoy at the end, all of it brass
  rect(g, 0, 8, 9, 2, F.brass); rect(g, 0, 8, 9, 1, F.brassL);
  rect(g, 0, 10, 8, 1, F.brassD);
  rect(g, 1, 6, 5, 2, F.brass); rect(g, 1, 6, 5, 1, F.brassL); px(g, 5, 7, F.brassD);
  for (let y = 5; y < 11; y++) for (let x = 5; x < 10; x++) { const dx = x + 0.5 - 7.4, dy = y + 0.5 - 7.6; if (dx * dx + dy * dy > 2.7 * 2.7) continue; px(g, x, y, y < 7 ? (x < 8 ? F.brassL : F.brass) : (x > 8 ? F.brassD : F.brass)); }
  px(g, 6, 6, F.goldL); px(g, 7, 5, F.goldL); px(g, 9, 9, F.brassD);
  px(g, 3, 8, F.goldL); px(g, 2, 9, F.brassD);
  // the gap in the pipe that makes the note, and the tarnish in the angle of the keel
  px(g, 3, 6, F.tar); px(g, 3, 7, F.brassD); px(g, 0, 9, F.brassD); px(g, 6, 10, F.brassD);
  return outline(c, OUT);
}

// A four-fluke grapnel with a short tail of rope on its ring. 14x14, POINTING RIGHT — it is both
// dressing on a deck and the thing that flies across a gap, so it is drawn flying, not standing:
// no ground line.
export function bakeGrapple() {
  const W = 14, H = 14; const [c, g] = canvas(W, H);
  // the far pair of flukes first, sweeping wide and dark so the near pair stands off them
  for (const dy of [-1, 1]) {
    const arm = [[8, 7], [10, 7 + dy], [12, 7 + dy * 3], [13, 7 + dy * 5]];
    for (let k = 0; k + 1 < arm.length; k++) ropeLine(g, arm[k][0], arm[k][1], arm[k + 1][0], arm[k + 1][1], F.ir0, F.ir0);
    px(g, 13, 7 + dy * 5, F.ir1); px(g, 12, 7 + dy * 5, F.ir0);
  }
  // the shank, lying along the flight, with the crown at the right where the flukes spring from it
  for (let x = 4; x < 9; x++) { px(g, x, 6, F.ir2); px(g, x, 7, F.ir1); px(g, x, 8, F.ir0); }
  px(g, 3, 6, F.ir3); px(g, 6, 6, F.ir3);
  rect(g, 8, 5, 3, 5, F.ir1); rect(g, 8, 5, 3, 1, F.ir3); px(g, 10, 9, F.ir0);
  // the near pair: two heavy barbed arms out of the crown, up and down, bright along their backs
  for (const dy of [-1, 1]) {
    const arm = [[10, 7 + dy], [12, 7 + dy * 2], [13, 7 + dy * 4]];
    for (let k = 0; k + 1 < arm.length; k++) {
      ropeLine(g, arm[k][0], arm[k][1], arm[k + 1][0], arm[k + 1][1], F.ir2, F.ir1);
      ropeLine(g, arm[k][0], arm[k][1] + dy, arm[k + 1][0], arm[k + 1][1] + dy, dy < 0 ? F.ir3 : F.ir0, dy < 0 ? F.ir2 : F.ir0);
    }
    // the palm of it filled out, and the point, and the barb standing back off the point
    px(g, 11, 7 + dy * 2, F.ir1); px(g, 12, 7 + dy * 3, F.ir1);
    px(g, 13, 7 + dy * 4, F.glare); px(g, 13, 7 + dy * 3, F.ir3);
    px(g, 11, 7 + dy * 4, F.ir1); px(g, 12, 7 + dy * 5, F.ir0);
  }
  // the ring on her heel with the rope bent on, the tail of it streaming back to the left
  for (let y = 4; y < 11; y++) for (let x = 0; x < 5; x++) { const dx = (x + 0.5 - 2.6) / 2.4, dy = (y + 0.5 - 7) / 3.2; const r2 = dx * dx + dy * dy; if (r2 > 1 || r2 < 0.36) continue; px(g, x, y, y < 7 ? F.ir3 : (x > 3 ? F.ir0 : F.ir1)); }
  seizing(g, 0, 6, 2, 3);
  ropeLine(g, 0, 7, 2, 7);
  px(g, 0, 5, F.hempD); px(g, 0, 10, F.hempD);
  // the rust where the salt sits in the angle of every fluke, and the bright of a fresh scrape
  px(g, 10, 5, F.rust); px(g, 10, 9, F.rust); px(g, 8, 8, F.rust);
  px(g, 5, 6, F.glare); px(g, 9, 6, F.ir3);
  return outline(c, OUT);
}
