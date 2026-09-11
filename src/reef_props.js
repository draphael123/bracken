// reef_props.js — THE SHIPWRECK REEF: the props for the coral reef out at sea where the drowned
// elven kingdom's tribute fleet went down. Grey storm light, no sun: salvage, rot, brass gone green,
// sailcloth torn to rags, coral growing up through every plank of it.
// Every baker returns a canvas drawn with its BOTTOM-CENTRE on the ground (x - w/2, groundY - h)
// unless its comment says otherwise. Baked once, no anti-aliasing.
import { canvas, px, rect, line, ellipse, circle, fillPoly, fromGrid, outline, mulberry, rgb, hex } from './px.js';
import { OUT } from './art.js';

// The Shipwreck Reef palette. Storm-lit: everything a little colder and greyer than the river coast.
const R = {
  tar: '#241f22', tarL: '#3a3238',
  wood: '#6a5748', woodD: '#4a3c32', woodDD: '#2e2620',
  bone: '#cfc6b0', boneM: '#a89c84', boneD: '#7b7160',
  pale: '#bcb6ac', paleM: '#948d82', paleD: '#68625a',
  brass: '#c8a24a', brassL: '#f2d88e', brassD: '#8a6a28',
  verd: '#4fa08c', verdL: '#84cfb6', verdD: '#2d6a5e', verdDD: '#1d4640',
  sail: '#d6d2c2', sailM: '#aea898', sailD: '#868072', sailDD: '#5e5a52',
  cb: '#e6dcc2', cbM: '#bfb39a', cbD: '#8d8370',
  cr: '#e0915a', crM: '#bf6a3c', crD: '#8b4428',
  cv: '#c295d0', cvM: '#96689f', cvD: '#64406e',
  kelp: '#4e7a3a', kelpD: '#35592a', kelpDD: '#22401c',
  rk0: '#2f363e', rk1: '#48515c', rk2: '#606b78', rk3: '#7c8894',
  sea0: '#17414e', sea1: '#275e6c', sea2: '#3f8c96', sea3: '#6fb8bc', foam: '#dcece8',
  rope: '#c0a875', ropeD: '#8e784a', ropeDD: '#5e4e2e',
  lamp: '#ffd36b', lampL: '#fff3bc', lampG: '#8a7a48',
  gold: '#e8c24c', goldL: '#fff0a8', wax: '#8e2a2a', waxD: '#5a1820',
  urch: '#2a2334', urchL: '#5b4a6e',
  storm: '#4e5a66',
};
// Background pieces sit back in the storm haze: their colours get mixed toward this.
const HAZE = '#56626e';
const OUTBG = '#262d36';

// ---------- helpers ----------
// A stable per-pixel hash in [0,1): texture that does not depend on draw order.
function hsh(x, y, s = 0) { let t = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) >>> 0; t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; }
function mix(a, b, t) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
// Push a colour back into the storm: the further a wreck is, the flatter and bluer it reads.
const far = (c, t = 0.34) => mix(c, HAZE, t);
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
// Punch holes: clear every pixel where fn(x, y) is true. One pass, so it is cheap.
function clearPixels(g, w, h, fn) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fn(x, y)) d[(y * w + x) * 4 + 3] = 0;
  g.putImageData(img, 0, 0);
}
// Lay a pale growing tip on the top pixel of every column of a coral shape.
function tipEdge(g, w, h, col, seed) {
  const m = maskOf(g, w, h);
  for (let x = 0; x < w; x++) for (let y = 0; y < h - 1; y++) {
    if (!m[y * w + x]) continue;
    if ((y === 0 || !m[(y - 1) * w + x]) && hsh(x, y, seed) < 0.72) px(g, x, y, col);
    break;
  }
}
const KEY = '#ff00ff', KEY2 = '#00ff00', KEY3 = '#0000ff';

// Wet reef rock, lit from a flat grey sky: a pale wet crown, dark dither along the foot and the right.
function shadeRock(g, w, h, key) {
  const m = maskOf(g, w, h), at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  let x0 = w, x1 = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (at(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  recolor(g, w, h, key, (x, y) => {
    let top = y; while (at(x, top - 1)) top--;
    let bot = y; while (at(x, bot + 1)) bot++;
    const fx = (x - x0) / Math.max(1, x1 - x0), d = y - top, b = bot - y;
    if (d === 0) return fx < 0.6 ? (hsh(x, y, 3) < 0.22 ? R.rk3 : R.rk2) : R.rk2;
    if (d === 1 && fx < 0.5) return R.rk2;
    if (!at(x + 1, y) || b <= 1) return R.rk0;
    if (b <= 3 || fx > 0.8) return ((x + y) & 1) ? R.rk0 : R.rk1;
    if (!at(x - 1, y)) return R.rk2;
    return hsh(x, y, 1) < 0.1 ? R.rk2 : R.rk1;
  });
  return m;
}

// Sodden ship timber, planked: bands running with the local top edge, seams between them, dark at the
// foot and along the right. Used for both wreck halves so they read as one hull.
function plankShade(g, W, H, key, o) {
  const m = maskOf(g, W, H), at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  const pitch = o.pitch || 5, seed = o.seed || 1;
  recolor(g, W, H, key, (x, y) => {
    let top = y; while (at(x, top - 1)) top--;
    let bot = y; while (at(x, bot + 1)) bot++;
    const d = y - top, b = bot - y;
    if (o.rail && d < 2) return d === 0 ? o.rail : o.railD;
    const dd = d - (o.rail ? 2 : 0);
    if (b < 2 || !at(x + 1, y)) return o.darker;
    if (dd % pitch === pitch - 1) return o.darker;
    if ((x * 2 + Math.floor(dd / pitch) * 3) % 23 < 2) return o.dark;
    if (dd % pitch === 0) return o.light || o.base;
    return hsh(x, y, seed) < 0.16 ? o.dark : o.base;
  });
  return m;
}

// The reef banked against a wreck, seen from across the water: the same three hues knocked back into
// the rock and the haze so the bank reads as one mass and not as confetti.
const BANK = [
  [far(mix(R.cb, R.rk2, 0.34), 0.24), far(mix(R.cbM, R.rk1, 0.38), 0.24), far(mix(R.cbD, R.rk0, 0.44), 0.2)],
  [far(mix(R.cr, R.rk2, 0.42), 0.24), far(mix(R.crM, R.rk1, 0.46), 0.24), far(mix(R.crD, R.rk0, 0.5), 0.2)],
  [far(mix(R.cv, R.rk2, 0.42), 0.24), far(mix(R.cvM, R.rk1, 0.46), 0.24), far(mix(R.cvD, R.rk0, 0.5), 0.2)],
];
// A soft patch of coral laid over whatever is under it: a rounded clump with a ragged edge, pale
// along its top where it is growing. Patches, never confetti — confetti reads as static at 1x.
function coralPatch(g, W, H, m, cx, cy, rx, ry, p, seed) {
  const inside = (x, y) => { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy; };
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    if (m && !m[y * W + x]) continue;
    const r2 = inside(x, y);
    if (r2 > 1 || (r2 > 0.5 && hsh(x, y, seed) < 0.4)) continue;
    const topEdge = inside(x, y - 1) > 1 || (y > 0 && m && !m[(y - 1) * W + x]);
    px(g, x, y, topEdge ? p[0] : (hsh(x, y, seed + 1) < 0.4 ? p[1] : p[2]));
  }
}
// Paint a filled key shape as the reef banked against a wreck: dead grey rock under a crust of
// coral heads, so it reads as the same stuff the foreground boulders are made of.
function coralBank(g, W, H, key, seed, heads) {
  const rock = [far(R.rk3, 0.3), far(R.rk2, 0.3), far(R.rk1, 0.26), far(R.rk0, 0.2)];
  const m = maskOf(g, W, H), at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  recolor(g, W, H, key, (x, y) => {
    let top = y; while (at(x, top - 1)) top--;
    const d = y - top;
    if (d === 0) return hsh(x, y, seed) < 0.5 ? rock[0] : rock[1];
    if (d < 3) return hsh(x, y, seed + 1) < 0.4 ? rock[1] : rock[2];
    if (hsh(x, y, seed + 2) < 0.12) return rock[1];
    return hsh(x, y, seed + 3) < 0.42 ? rock[3] : rock[2];
  });
  const m2 = maskOf(g, W, H);
  heads.forEach(([hx, hy, rx, ry, hue], i) => coralPatch(g, W, H, m2, hx, hy, rx, ry, BANK[hue], seed + 7 + i * 3));
}

// A nub of coral growing out of something: 2x2 or 3x3, in one of the three reef hues.
function coralNub(g, x, y, hue, big, pal) {
  const p = pal || [[R.cb, R.cbM, R.cbD], [R.cr, R.crM, R.crD], [R.cv, R.cvM, R.cvD]][hue % 3];
  if (big) { px(g, x + 1, y, p[0]); px(g, x, y + 1, p[1]); px(g, x + 1, y + 1, p[0]); px(g, x + 2, y + 1, p[1]); px(g, x, y + 2, p[2]); px(g, x + 2, y + 2, p[2]); }
  else { px(g, x, y, p[0]); px(g, x + 1, y, p[1]); px(g, x, y + 1, p[1]); px(g, x + 1, y + 1, p[2]); }
}
// Scatter coral over the solid pixels of mask m between rows ya..yb: the reef eating the wreck.
function encrust(g, w, h, m, rnd, n, ya, yb, xa, xb, tint) {
  const at = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  for (let i = 0, tries = 0; i < n && tries < n * 24; tries++) {
    const x = xa + ((rnd() * (xb - xa - 3)) | 0), y = ya + ((rnd() * (yb - ya)) | 0), big = rnd() < 0.45;
    if (!at(x, y) || !at(x + 1, y) || !at(x, y + 1)) continue;
    if (big && (!at(x + 2, y + 1) || !at(x + 2, y + 2) || !at(x, y + 2))) continue;
    coralNub(g, x, y, (rnd() * 3) | 0, big, tint);
    i++;
  }
}
// A hanging strand of weed: a wavy 1px ribbon with a lighter edge, from (x, y) down `len` rows.
function weed(g, x, y, len, rnd, light, dark) {
  light = light || R.kelp; dark = dark || R.kelpD;
  let cx = x;
  for (let k = 0; k < len; k++) {
    px(g, cx, y + k, k < len - 1 ? dark : light);
    if (k < len - 2 && k % 2 === 0) px(g, cx + 1, y + k, light);
    if (rnd() < 0.3) cx += rnd() < 0.5 ? -1 : 1;
    if (cx < x - 1) cx = x - 1;
    if (cx > x + 1) cx = x + 1;
  }
}
// A rope end trailing and kinking: from (x, y) down `len` rows, drifting `drift` px per row.
function ropeEnd(g, x, y, len, drift, rnd, light, dark) {
  light = light || R.rope; dark = dark || R.ropeD;
  let fx = x;
  for (let k = 0; k < len; k++) {
    const cx = Math.round(fx);
    px(g, cx, y + k, (k & 1) ? dark : light);
    if (k === len - 1) { px(g, cx, y + k, R.ropeDD); px(g, cx + 1, y + k, dark); }
    fx += drift * (0.6 + rnd() * 0.8);
  }
}
// Verdigris run down a brass face: green streaks under a fitting.
function verdigris(g, x0, x1, y0, len, seed) {
  for (let x = x0; x <= x1; x++) {
    if (hsh(x, seed, 5) > 0.55) continue;
    const n = 1 + ((hsh(x, seed + 1, 6) * len) | 0);
    for (let k = 0; k < n; k++) px(g, x, y0 + k, k === n - 1 ? R.verdDD : (hsh(x, k, 7) < 0.3 ? R.verdL : R.verdD));
  }
}

// ---------- the fleet: timber and iron ----------

// A snapped mast standing out of the deck: tarred and weathered, iron bands, the shrouds cut away and
// their rope ends trailing, the top burst into splinters. 14x56.
export function bakeMastStump() {
  const W = 14, H = 56, rnd = mulberry(5309); const [c, g] = canvas(W, H);
  const SPL = 9;
  // the round mast, tapering: left third catches what light there is, the right goes dark
  const lx = y => 3 - Math.round((y / H) * 1.6), rx = y => 10 + Math.round((y / H) * 1.6);
  for (let y = SPL; y < H; y++) {
    const a = lx(y), b = rx(y);
    for (let x = a; x <= b; x++) {
      const t = (x - a) / (b - a);
      px(g, x, y, t < 0.16 ? R.boneM : (t < 0.34 ? R.wood : (t > 0.84 ? R.woodDD : (hsh(x, y, 2) < 0.18 ? R.woodD : R.wood))));
    }
  }
  // the grain: long dark checks running up the timber
  for (const ox of [1, 4, 6]) for (let y = SPL + 2; y < H - 2; y++) if (hsh(ox, y, 3) < 0.7) px(g, lx(y) + ox + (y % 9 === 0 ? 1 : 0), y, R.woodD);
  // two iron bands, rust-streaked, and the cleat between them
  for (const by of [22, 40]) {
    rect(g, lx(by) - 1, by, rx(by) - lx(by) + 3, 3, R.rk1);
    rect(g, lx(by) - 1, by, rx(by) - lx(by) + 3, 1, R.rk3);
    rect(g, lx(by) + 1, by + 2, 3, 1, R.rk0);
    px(g, rx(by), by + 1, R.crD); px(g, rx(by) - 1, by + 2, R.crD);
  }
  rect(g, 3, 30, 8, 2, R.woodDD); rect(g, 3, 30, 8, 1, R.boneD); px(g, 2, 31, R.woodDD); px(g, 11, 31, R.woodDD);
  // the splintered top: slivers of pale broken wood standing up where the mast let go
  const spikes = [[3, 4], [4, 1], [5, 3], [6, 0], [7, 5], [8, 2], [9, 6], [10, 7]];
  for (const [x, top] of spikes) {
    for (let y = top; y < SPL + 1; y++) px(g, x, y, y < top + 2 ? R.bone : (y < top + 4 ? R.boneM : R.boneD));
    if (x % 2) px(g, x, top, R.sail);
  }
  rect(g, 3, SPL, 8, 2, R.woodD); px(g, 4, SPL, R.boneD); px(g, 8, SPL, R.boneD);
  // the shrouds cut away: rope tails off the cleat and the bands, swinging clear of the mast so they
  // read as hanging rope and not as a stripe painted up her side
  ropeEnd(g, 3, 32, 12, 0.46, rnd);
  ropeEnd(g, 10, 32, 9, -0.44, rnd);
  ropeEnd(g, 11, 23, 8, -0.5, rnd);
  px(g, 3, 31, R.rope); px(g, 10, 31, R.rope); px(g, 11, 22, R.ropeD);
  // weed and coral at the foot, where the reef has begun on it
  for (const [x, len] of [[2, 5], [11, 4]]) weed(g, x, H - 1 - len, len, rnd);
  coralNub(g, 3, H - 5, 0, true); coralNub(g, 9, H - 3, 1, false); coralNub(g, 2, H - 8, 2, false);
  return outline(c, OUT);
}

// BACKGROUND. A hanging curtain of torn rigging: shrouds cut and drifting, ratlines mostly gone,
// frayed ends. 28x64, hung from the top row — nothing of it stands on the ground. v 0..1. No outline.
export function bakeRigging(v) {
  v = ((v % 2) + 2) % 2; const rnd = mulberry(8821 + v * 137); const W = 28, H = 64; const [c, g] = canvas(W, H);
  const rope = far(mix(R.rope, R.ropeD, 0.4), 0.52), ropeD = far(R.ropeD, 0.5), ropeDD = far(R.ropeDD, 0.34);
  const lines = v === 0
    ? [[3, 64, 1.1, 0.00], [9, 52, 1.6, 1.2], [15, 64, 1.0, 2.3], [20, 38, 2.2, 0.6], [25, 47, 1.3, 3.0]]
    : [[2, 44, 1.8, 0.9], [7, 64, 1.2, 2.1], [13, 57, 1.5, 0.3], [18, 64, 1.1, 1.7], [24, 33, 2.4, 2.6]];
  const xs = lines.map(() => []);
  lines.forEach(([bx, len, amp, ph], i) => {
    for (let y = 0; y < len; y++) {
      const x = Math.max(0, Math.min(W - 1, Math.round(bx + Math.sin(y * 0.09 + ph) * amp * (0.35 + y / H))));
      xs[i][y] = x;
      px(g, x, y, (y & 3) === 3 ? ropeD : rope);
      if (x + 1 < W) px(g, x + 1, y, ropeD);
    }
    // the cut end: the lay of the rope springs open into a frayed tassel
    if (len < H) {
      const ex = xs[i][len - 1];
      for (let k = 0; k < 4; k++) {
        const sx = Math.max(0, Math.min(W - 1, ex + (k - 1)));
        for (let y = len; y < Math.min(H, len + 2 + (k & 1)); y++) px(g, sx, y, y === len ? ropeD : ropeDD);
      }
    }
  });
  // ratlines: the few that have not rotted through, sagging between neighbouring shrouds
  for (let i = 0; i + 1 < lines.length; i++) {
    for (let y = 5 + ((i * 7 + v * 3) % 9); y < Math.min(lines[i][1], lines[i + 1][1]) - 3; y += 7) {
      if (rnd() < 0.32) continue;
      const a = xs[i][y], b = xs[i + 1][y], span = b - a;
      for (let x = a + 1; x < b; x++) {
        const t = (x - a) / span, sag = Math.round(Math.sin(t * Math.PI) * 1.8);
        px(g, x, y + sag, (x & 1) ? ropeD : rope);
      }
      // half of them are parted in the middle and hang down in two ends
      if (rnd() < 0.4) { const mx = a + ((span / 2) | 0); px(g, mx, y + 3, ropeDD); px(g, mx, y + 4, ropeDD); px(g, mx + 1, y + 3, ropeD); }
    }
  }
  // a block still hanging on one of the shrouds, and a tatter of weed caught in them
  const bi = v === 0 ? 2 : 1, by = v === 0 ? 40 : 46, bxp = xs[bi][by];
  rect(g, bxp - 1, by, 4, 5, far(R.woodD, 0.3)); rect(g, bxp - 1, by, 4, 1, far(R.wood, 0.3));
  px(g, bxp, by + 2, far(R.rk1, 0.3)); px(g, bxp + 1, by + 2, far(R.rk0, 0.3)); px(g, bxp, by + 5, ropeD);
  for (const [i2, y2, len] of [[0, 18, 7], [3, 12, 5], [4, 26, 6]]) if (xs[i2] && xs[i2][y2] !== undefined) weed(g, xs[i2][y2], y2, len, rnd, far(R.kelp, 0.4), far(R.kelpD, 0.35));
  return c;
}

// BACKGROUND. A torn sail hanging off its spar: canvas gone grey-green, panels split, the foot in
// ribbons. 40x36, hung from the spar at the top — it does not stand on the ground. v 0..1. No outline.
// The game sways it; this is the still frame.
export function bakeSailRag(v) {
  v = ((v % 2) + 2) % 2; const rnd = mulberry(4477 + v * 211); const W = 40, H = 36; const [c, g] = canvas(W, H);
  const sail = far(R.sail, 0.3), sailM = far(R.sailM, 0.3), sailD = far(R.sailD, 0.26), sailDD = far(R.sailDD, 0.2);
  const wood = far(R.wood, 0.3), woodD = far(R.woodD, 0.26), bone = far(R.boneM, 0.3);
  const spar = x => 2 + (v === 0 ? Math.round(x * 0.055) : 3 - Math.round(x * 0.06));
  // the sail, clewed down to one corner: a long sagging luff and a ragged foot
  const head = x => spar(x) + 3;
  const foot = v === 0
    ? x => 16 + Math.round(9 * Math.sin(x / 39 * 2.1)) + Math.round(3 * Math.sin(x * 0.7)) + (hsh(x, 1, 9) < 0.3 ? 3 : 0)
    : x => 22 - Math.round(7 * Math.sin(x / 39 * 2.6 + 0.4)) + Math.round(3 * Math.sin(x * 0.55 + 1)) + (hsh(x, 2, 9) < 0.3 ? 2 : 0);
  const lip = v === 0 ? 1 : 3, rip = v === 0 ? 37 : 35;
  for (let x = lip; x <= rip; x++) {
    const t = head(x), b = Math.max(t + 2, Math.min(H - 1, foot(x)));
    for (let y = t; y <= b; y++) {
      const seam = x % 7 === (v === 0 ? 3 : 5);
      const belly = Math.sin((x - lip) / (rip - lip) * Math.PI);
      let col = belly > 0.55 ? sail : (belly > 0.25 ? sailM : sailD);
      if (seam) col = sailDD;
      if (y >= b - 1) col = sailDD;
      if (y <= t + 1) col = sailM;
      if (hsh(x, y, 11) < 0.05) col = sailDD;
      px(g, x, y, col);
    }
    // the bolt rope along the foot, and the frayed threads hanging off it
    if (x % 3 === 0 && b < H - 2) { px(g, x, b + 1, sailD); if (hsh(x, 3, 4) < 0.5) px(g, x, b + 2, sailDD); }
  }
  // holes blown through it: dark hairy edges, the storm showing through the middle
  const holes = v === 0 ? [[13, 12, 5, 4], [26, 17, 4, 4]] : [[10, 18, 4, 3], [23, 11, 5, 4], [31, 21, 3, 3]];
  for (const [hx, hy, hw, hh] of holes) for (let y = hy; y < hy + hh; y++) for (let x = hx; x < hx + hw; x++) {
    if (hsh(x, y, 13) < 0.2) continue;
    if (x === hx || y === hy || x === hx + hw - 1 || y === hy + hh - 1) px(g, x, y, sailDD);
  }
  clearPixels(g, W, H, (x, y) => {
    for (const [hx, hy, hw, hh] of holes) if (x > hx && y > hy && x < hx + hw - 1 && y < hy + hh - 1 && hsh(x, y, 13) >= 0.2) return true;
    return false;
  });
  // the luff: a dark edge rope, and a cringle with a rope tail at the clew
  for (let y = head(lip); y < Math.min(H - 1, foot(lip)); y++) px(g, lip, y, sailDD);
  const cy = Math.min(H - 3, foot(rip));
  px(g, rip, cy, bone); px(g, rip, cy + 1, far(R.ropeD, 0.3));
  ropeEnd(g, rip, cy + 2, 4, 0.3, rnd, far(R.rope, 0.36), far(R.ropeD, 0.3));
  // the spar across the head, and the reef points still knotted round it
  for (let x = 0; x < W; x++) {
    const sy = spar(x);
    px(g, x, sy - 1, bone); px(g, x, sy, wood); px(g, x, sy + 1, woodD); px(g, x, sy + 2, woodD);
    if (x % 6 === 2) { px(g, x, sy + 2, far(R.ropeD, 0.3)); px(g, x, sy + 3, far(R.rope, 0.36)); }
  }
  px(g, 0, spar(0), bone); px(g, W - 1, spar(W - 1), woodD);
  // a strand of weed caught on the spar and trailing over the cloth
  weed(g, 8, spar(8) + 2, 9, rnd, far(R.kelp, 0.4), far(R.kelpD, 0.35));
  return c;
}

// BACKGROUND. A ship's bow, stem up, half buried in the reef: the biggest thing on the level.
// 96x72, the bottom row at the reef floor. The stem head is at about (24, 6).
export function bakeWreckBow() {
  const W = 96, H = 72, rnd = mulberry(9001); const [c, g] = canvas(W, H);
  const base = far(R.wood), dark = far(R.woodD), darker = far(R.woodDD, 0.22), light = far(R.boneM, 0.3);
  // the hull: the stem rising on the left, the sheer running back and down to where she is torn across
  const hull = [[16, 71], [11, 58], [12, 42], [16, 26], [21, 12], [26, 7], [33, 11], [48, 19], [68, 28], [90, 37], [93, 46], [92, 71]];
  fillPoly(g, hull, KEY);
  const m = plankShade(g, W, H, KEY, { base, dark, darker, light, rail: far(R.bone, 0.3), railD: far(R.boneD, 0.28), pitch: 5, seed: 4 });
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  // the wale: a heavy doubled plank following the sheer a little way down
  for (let x = 20; x < 93; x++) { let top = 0; while (top < H && !at(x, top)) top++; const y = top + 7; if (at(x, y)) { px(g, x, y, darker); px(g, x, y + 1, dark); } }
  // the stem: a thick timber up the leading edge, its cutwater pale where the sea has scoured it
  for (let y = 7; y < 71; y++) { let x = 0; while (x < W && !at(x, y)) x++; if (x >= W) continue; px(g, x, y, light); px(g, x + 1, y, far(R.bone, 0.34)); px(g, x + 2, y, dark); }
  // the bowsprit, snapped off short, and the knee under it
  line(g, 26, 7, 12, 1, far(R.wood, 0.3), 1); line(g, 27, 8, 13, 2, far(R.woodD, 0.26), 1);
  px(g, 12, 1, light); px(g, 13, 1, far(R.boneD, 0.28));
  fillPoly(g, [[24, 9], [30, 12], [24, 16]], dark);
  // the hawse hole, and the anchor cable still run out of it
  circle(g, 30, 17, 2.4, far(R.tar, 0.18)); circle(g, 30, 17, 1.4, '#14181e');
  px(g, 28, 15, light);
  ropeEnd(g, 29, 19, 14, -0.5, rnd, far(R.rope, 0.36), far(R.ropeD, 0.3));
  // two gunports, their lids gone, and a third with the lid hanging by one hinge
  for (const [px0, py0] of [[46, 26], [64, 34]]) {
    rect(g, px0, py0, 8, 7, far(R.tar, 0.16)); rect(g, px0 + 1, py0 + 1, 6, 5, '#12161c');
    rect(g, px0 - 1, py0 - 1, 10, 1, light); rect(g, px0 - 1, py0 + 7, 10, 1, darker);
    px(g, px0 + 2, py0 + 2, far(R.verdD, 0.3));
  }
  rect(g, 80, 41, 8, 7, far(R.tar, 0.16)); rect(g, 81, 42, 6, 5, '#12161c');
  fillPoly(g, [[88, 41], [93, 44], [93, 52], [88, 48]], dark); px(g, 88, 42, far(R.rk2, 0.3)); px(g, 88, 47, far(R.rk2, 0.3));
  // she is torn across here: a jagged break with frames and a little of her dark inside showing
  for (let y = 40; y < 71; y++) {
    const b = 92 - (hsh(y, 5, 8) < 0.4 ? 2 : 0) - (y % 7 === 0 ? 3 : 0);
    for (let x = b; x < W; x++) if (at(x, y)) px(g, x, y, x === b ? light : null);
  }
  for (let y = 42; y < 70; y += 6) { rect(g, 86, y, 4, 3, dark); rect(g, 86, y, 4, 1, light); }
  // the deck beams you can see over the bulwark where the rail is stove in
  for (const [bx, by] of [[36, 15], [41, 17], [52, 22], [57, 24]]) { rect(g, bx, by, 4, 2, darker); px(g, bx, by, dark); }
  // the reef: coral banked up her side in lumpy heads, and growing through her planks
  fillPoly(g, [[10, 71], [14, 63], [26, 61], [40, 63], [54, 60], [70, 62], [84, 61], [93, 65], [93, 71]], KEY2);
  for (const [ex, ey, rx, ry] of [[17, 62, 7, 5], [31, 60, 8, 6], [45, 61, 6, 4], [58, 58, 9, 6], [72, 60, 7, 5], [86, 60, 6, 4]]) ellipse(g, ex, ey, rx, ry, KEY2);
  coralBank(g, W, H, KEY2, 31, [[16, 63, 6, 4, 0], [30, 61, 7, 5, 0], [44, 62, 5, 3, 1], [57, 59, 7, 5, 0], [70, 61, 6, 4, 2], [85, 61, 5, 3, 1], [24, 67, 5, 3, 1], [50, 67, 6, 3, 0], [78, 66, 5, 3, 0]]);
  encrust(g, W, H, m, rnd, 13, 16, 60, 20, 90, BANK[0]);
  encrust(g, W, H, m, rnd, 7, 14, 54, 24, 88, BANK[1]);
  encrust(g, W, H, m, rnd, 4, 20, 50, 30, 84, BANK[2]);
  for (const [x, y, len] of [[18, 20, 9], [34, 14, 7], [55, 25, 8], [72, 31, 7], [86, 39, 9], [44, 19, 6]]) weed(g, x, y, len, rnd, far(R.kelp, 0.4), far(R.kelpD, 0.35));
  return outline(c, OUTBG);
}

// BACKGROUND. The matching stern, lying the other way: the transom, her stern window shattered, the
// rudder still hung. 88x64, the bottom row at the reef floor.
export function bakeWreckStern() {
  const W = 88, H = 64, rnd = mulberry(9002); const [c, g] = canvas(W, H);
  const base = far(R.wood), dark = far(R.woodD), darker = far(R.woodDD, 0.22), light = far(R.boneM, 0.3);
  // the hull: torn across on the left, the counter and transom rising on the right
  const hull = [[4, 63], [2, 44], [10, 34], [28, 28], [50, 24], [66, 22], [76, 26], [80, 36], [79, 52], [74, 62]];
  fillPoly(g, hull, KEY);
  const m = plankShade(g, W, H, KEY, { base, dark, darker, light, rail: far(R.bone, 0.3), railD: far(R.boneD, 0.28), pitch: 5, seed: 6 });
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  // the wale, and the taffrail carried round the top of the transom
  for (let x = 6; x < 79; x++) { let top = 0; while (top < H && !at(x, top)) top++; const y = top + 7; if (at(x, y)) { px(g, x, y, darker); px(g, x, y + 1, dark); } }
  for (let x = 54; x < 80; x++) { let top = 0; while (top < H && !at(x, top)) top++; px(g, x, top, far(R.bone, 0.3)); px(g, x, top + 1, light); }
  // the stern window: five lights, every pane gone, the mullions broken, the cabin dark behind
  const wx = 56, wy = 30, ww = 22, wh = 13;
  rect(g, wx - 2, wy - 2, ww + 4, wh + 4, darker);
  rect(g, wx - 1, wy - 1, ww + 2, wh + 2, light);
  rect(g, wx, wy, ww, wh, '#10141a');
  for (let i = 1; i < 5; i++) { const mx = wx + Math.round(i * ww / 5); for (let y = wy; y < wy + wh; y++) if (hsh(mx, y, 21) > 0.34) px(g, mx, y, i === 2 ? dark : light); }
  rect(g, wx, wy + 6, ww, 1, light); for (let x = wx; x < wx + ww; x++) if (hsh(x, 2, 23) < 0.45) px(g, x, wy + 6, '#10141a');
  // the shards left in the corners of the lights, catching what light the storm gives
  for (const [sx, sy, kind] of [[wx + 1, wy + 1, 0], [wx + 8, wy + 1, 1], [wx + 15, wy + 8, 0], [wx + 20, wy + 2, 1], [wx + 4, wy + 10, 1], [wx + 12, wy + 7, 0]]) {
    if (kind === 0) { px(g, sx, sy, far(R.sea3, 0.3)); px(g, sx + 1, sy, far(R.sea2, 0.3)); px(g, sx, sy + 1, far(R.sea2, 0.3)); }
    else { px(g, sx, sy, far(R.sea2, 0.3)); px(g, sx + 1, sy + 1, far(R.sea1, 0.3)); px(g, sx, sy + 1, far(R.sea3, 0.3)); }
  }
  // the carved name-board under the window, the gilding all but gone
  rect(g, 54, 46, 26, 4, dark); rect(g, 54, 46, 26, 1, light);
  for (let x = 56; x < 79; x += 3) { px(g, x, 48, far(R.gold, 0.4)); px(g, x + 1, 48, far(R.brassD, 0.3)); }
  // the rudder, hung on two pintles and swung hard over
  fillPoly(g, [[79, 30], [84, 33], [86, 48], [83, 62], [78, 62]], KEY3);
  recolor(g, W, H, KEY3, (x, y) => (y % 5 === 4 ? darker : (x > 83 ? dark : (hsh(x, y, 9) < 0.2 ? dark : base))));
  for (const y of [34, 46]) { rect(g, 78, y, 6, 2, far(R.rk1, 0.28)); px(g, 79, y, far(R.rk3, 0.3)); px(g, 83, y + 1, far(R.rk0, 0.2)); }
  // she is broken off short on the left: a jagged edge, her frames standing out of it
  for (let y = 30; y < 63; y++) {
    const b = 3 + (hsh(y, 7, 8) < 0.4 ? 2 : 0) + (y % 6 === 0 ? 3 : 0);
    for (let x = 0; x <= b; x++) if (at(x, y)) px(g, x, y, x === b ? light : null);
  }
  for (let y = 34; y < 60; y += 7) { rect(g, 6, y, 4, 3, dark); rect(g, 6, y, 4, 1, light); }
  // the reef banked along her, and the coral growing up into the window
  fillPoly(g, [[0, 63], [5, 55], [18, 53], [32, 55], [48, 51], [62, 54], [76, 52], [86, 57], [87, 63]], KEY2);
  for (const [ex, ey, rx, ry] of [[9, 54, 7, 5], [24, 53, 8, 5], [40, 52, 7, 5], [56, 53, 6, 4], [70, 51, 8, 5], [83, 55, 6, 4]]) ellipse(g, ex, ey, rx, ry, KEY2);
  coralBank(g, W, H, KEY2, 37, [[9, 55, 6, 4, 0], [23, 54, 7, 4, 1], [39, 53, 6, 4, 0], [55, 54, 5, 3, 2], [69, 52, 7, 4, 0], [82, 56, 5, 3, 1], [16, 59, 5, 3, 0], [46, 59, 6, 3, 1], [74, 59, 5, 3, 0]]);
  encrust(g, W, H, m, rnd, 12, 26, 52, 6, 80, BANK[0]);
  encrust(g, W, H, m, rnd, 6, 24, 48, 10, 70, BANK[2]);
  encrust(g, W, H, m, rnd, 5, 28, 50, 20, 76, BANK[1]);
  coralNub(g, wx + 3, wy + 9, 1, true, BANK[1]);
  coralNub(g, wx + 17, wy + 4, 0, true, BANK[0]);
  for (const [x, y, len] of [[12, 33, 8], [30, 27, 7], [48, 24, 6], [66, 22, 7], [80, 31, 9], [20, 50, 6]]) weed(g, x, y, len, rnd, far(R.kelp, 0.4), far(R.kelpD, 0.35));
  return outline(c, OUTBG);
}

// An elven figurehead pulled off the stem and stood up in the reef: a sea-woman with her arms swept
// back, pale wood gone grey, her gold leaf flaking off. 24x40, her broken pedestal on the ground.
export function bakeFigurehead() {
  const W = 24, H = 40, rnd = mulberry(3313); const [c, g] = canvas(W, H);
  // She faces right, the way she faced from the stem; everything of her — hair, arms, gown — streams
  // back to the left. She is read by VALUE, not by line: her hair is the darkest thing on her, her
  // face the lightest, the gown between them, so the carving still holds at 1x.
  const HAIR = '#4b453e', HAIRD = '#322e2a', HAIRL = '#6a6259';
  const SKIN = '#cfc9bd', SKINM = '#a49d92', SKIND = '#746e65', GLINT = '#e8e3d8';
  // the hair: one carved mass off the back of her skull, swept clear of her arms
  fillPoly(g, [[12, 1], [13, 6], [11, 10], [8, 13], [4, 14], [2, 12], [3, 8], [6, 4], [9, 1]], KEY2);
  recolor(g, W, H, KEY2, (x, y) => (Math.sin(x * 0.85 + y * 1.5) > 0.5 ? HAIRL : (hsh(x, y, 7) < 0.3 ? HAIRD : HAIR)));
  for (const [sx, sy] of [[9, 3], [6, 7], [4, 11]]) { px(g, sx, sy, HAIRD); px(g, sx - 1, sy + 1, HAIRD); }
  // the gown: a carved sweep from her waist, the hem trailing away to the left
  fillPoly(g, [[10, 19], [17, 19], [18, 25], [18, 32], [16, 36], [8, 36], [5, 34], [4, 29], [7, 26], [9, 22]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const fold = Math.sin((x - y * 0.5) * 1.15);
    if (fold > 0.6) return SKIN;
    if (fold < -0.55) return SKIND;
    if (x > 16 || y > 34) return SKIND;
    return hsh(x, y, 3) < 0.12 ? SKIND : SKINM;
  });
  // the pedestal: the snapped stem timber she was carved onto, stood upright in the reef
  rect(g, 5, 36, 15, 4, R.woodD); rect(g, 5, 36, 15, 1, R.wood); rect(g, 5, 39, 15, 1, R.woodDD);
  px(g, 7, 38, R.woodDD); px(g, 13, 37, R.woodDD); px(g, 17, 38, R.woodDD); px(g, 9, 37, R.boneD);
  // both arms swept back behind her, one above the other, each under its own dark contour so it
  // reads against the hair above it and the gown below
  for (const [ax, ay, bx, by] of [[12, 13, 4, 17], [12, 16, 5, 22]]) {
    line(g, ax, ay - 1, bx, by - 1, SKIND, 1);
    line(g, ax, ay, bx, by, SKIN, 1);
    line(g, ax, ay + 1, bx, by + 1, SKINM, 1);
    line(g, ax, ay + 2, bx, by + 2, SKIND, 1);
    px(g, bx - 1, by, SKIN); px(g, bx - 2, by + 1, SKINM); px(g, bx - 1, by + 2, SKIND);
  }
  // the torso, leaning forward into a sea that is not there any more
  fillPoly(g, [[12, 9], [16, 10], [17, 14], [16, 19], [11, 19], [10, 13]], SKIN);
  for (let y = 10; y < 19; y++) for (let x = 11; x < 17; x++) if (x > 14 || hsh(x, y, 5) < 0.18) px(g, x, y, SKINM);
  rect(g, 10, 11, 1, 8, SKIND); px(g, 16, 16, SKIND); px(g, 15, 18, SKIND);
  px(g, 12, 12, GLINT); px(g, 13, 11, GLINT); px(g, 12, 14, GLINT);
  // the head: a small clear ball on a neck, her face to the right, her chin up
  ellipse(g, 14, 5.5, 2.6, 3.2, SKIN);
  rect(g, 13, 8, 3, 2, SKINM); px(g, 14, 8, SKIN);
  for (let y = 3; y < 10; y++) px(g, 11, y, HAIRD);
  rect(g, 12, 2, 3, 1, HAIR); px(g, 12, 3, HAIRD); px(g, 15, 2, HAIRD);
  px(g, 15, 3, GLINT); px(g, 14, 2, GLINT);
  px(g, 15, 5, R.tar); px(g, 16, 6, SKIND); px(g, 15, 7, SKIND); px(g, 16, 4, SKINM);
  // the gold leaf: a coronet at her brow, a girdle at her waist, flakes on the hem — most gone
  for (const [x, y] of [[12, 3], [13, 3], [15, 4]]) if (hsh(x, y, 11) < 0.85) px(g, x, y, R.gold);
  px(g, 14, 3, R.goldL);
  for (let x = 11; x < 17; x++) if (hsh(x, 1, 11) < 0.65) { px(g, x, 19, hsh(x, 2, 12) < 0.4 ? R.goldL : R.gold); px(g, x, 20, R.brassD); }
  for (const [x, y] of [[6, 33], [10, 35], [15, 34], [17, 28], [5, 30]]) if (rnd() < 0.75) { px(g, x, y, R.gold); px(g, x + 1, y, R.brassD); }
  // what the reef has taken of her: coral up the hem, weed caught in her hair and her hands
  coralNub(g, 4, 31, 1, true); coralNub(g, 16, 32, 2, false); coralNub(g, 10, 34, 0, false);
  weed(g, 3, 23, 6, rnd); weed(g, 18, 26, 5, rnd);
  px(g, 7, 21, R.cvM); px(g, 8, 21, R.cv); px(g, 3, 14, R.kelpD);
  return outline(c, OUT);
}

// A capstan standing on the deck wreckage: a ribbed drum, two of its bars still shipped, the brass
// crown gone green. 26x20.
export function bakeCapstan() {
  const W = 26, H = 20; const [c, g] = canvas(W, H);
  // the two bars still shipped in the drumhead, drooping a little at their far ends
  for (const [x0, x1, y0, y1] of [[0, 7, 8, 6], [18, 25, 6, 8]]) {
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0), y = Math.round(y0 + (y1 - y0) * t);
      px(g, x, y, R.bone); px(g, x, y + 1, R.boneM); px(g, x, y + 2, R.woodD);
    }
  }
  px(g, 0, 8, R.boneD); px(g, 0, 10, R.woodDD); px(g, 25, 8, R.boneD); px(g, 25, 10, R.woodDD);
  // the drum: a waisted barrel of staves with vertical whelps standing off it
  const lx = y => 6 + Math.round(Math.sin((y - 6) / 11 * Math.PI) * 1.6);
  const rx = y => 20 - Math.round(Math.sin((y - 6) / 11 * Math.PI) * 1.6);
  for (let y = 6; y < 17; y++) for (let x = lx(y); x <= rx(y); x++) {
    const t = (x - lx(y)) / (rx(y) - lx(y));
    px(g, x, y, t < 0.1 ? R.boneD : (t < 0.22 ? R.boneM : (t > 0.86 ? R.woodDD : (hsh(x, y, 2) < 0.18 ? R.woodD : R.wood))));
  }
  for (const wx of [10, 16]) for (let y = 9; y < 16; y++) { px(g, wx, y, R.boneD); px(g, wx + 1, y, R.woodDD); }
  for (const hy of [9, 13]) { for (let x = lx(hy); x <= rx(hy); x++) px(g, x, hy, R.rk1); px(g, lx(hy), hy, R.rk3); px(g, rx(hy), hy, R.rk0); }
  // the drumhead: a low brass crown with the bar holes cut clean through it
  rect(g, 6, 4, 15, 4, R.brassD); rect(g, 6, 4, 15, 1, R.brassL); rect(g, 6, 5, 15, 1, R.brass);
  rect(g, 5, 5, 1, 3, R.brassD); rect(g, 21, 5, 1, 3, R.brassD); px(g, 5, 5, R.brass);
  for (const hx of [9, 16]) { rect(g, hx, 6, 2, 2, R.tar); rect(g, hx, 6, 2, 1, '#120f14'); px(g, hx + 1, 7, R.brassD); }
  for (let x = 7; x < 21; x += 3) px(g, x, 7, R.brassD);
  verdigris(g, 7, 20, 8, 5, 3);
  rect(g, 5, 16, 17, 2, R.rk1); rect(g, 5, 16, 17, 1, R.rk3);
  // the foot: a ring bolted to what is left of the deck, weed round it
  rect(g, 4, 18, 19, 2, R.rk0); rect(g, 4, 18, 19, 1, R.rk1); px(g, 5, 19, R.rk2); px(g, 21, 19, R.rk2);
  for (let x = 6; x < 22; x += 4) px(g, x, 17, R.rk0);
  px(g, 3, 19, R.kelpD); px(g, 23, 19, R.kelpD); px(g, 24, 19, R.kelp);
  coralNub(g, 21, 15, 0, false); coralNub(g, 3, 16, 1, false);
  return outline(c, OUT);
}

// A big fouled anchor leaning where the salvors left it: chain still shackled at the ring, weed and
// coral all over the crown. 26x40. Her flukes rest on the ground; the shank leans to the right.
export function bakeAnchor() {
  const W = 26, H = 40, rnd = mulberry(2711); const [c, g] = canvas(W, H);
  const iron = R.rk1, ironL = R.rk3, ironD = R.rk0;
  // the shank, leaning: a thick bar from the crown up to the ring
  for (let y = 6; y < 34; y++) {
    const x = Math.round(7 + (34 - y) * 0.3);
    rect(g, x, y, 3, 1, iron); px(g, x, y, ironL); px(g, x + 2, y, ironD);
    if (hsh(x, y, 3) < 0.16) px(g, x + 1, y, R.crD);
  }
  // the stock across the shank near the head, a little canted
  for (let x = 2; x < 24; x++) { const y = 10 + Math.round((x - 2) * 0.18); rect(g, x, y, 1, 2, iron); px(g, x, y, ironL); px(g, x, y + 2, ironD); }
  px(g, 2, 10, ironD); px(g, 23, 14, ironD); rect(g, 13, 11, 2, 3, ironD);
  // the crown and the two arms sweeping up to their flukes
  fillPoly(g, [[5, 31], [10, 31], [11, 36], [4, 36]], KEY);
  line(g, 6, 33, 1, 27, KEY, 1); line(g, 7, 34, 2, 28, KEY, 1);
  line(g, 9, 33, 15, 28, KEY, 1); line(g, 9, 34, 16, 29, KEY, 1);
  fillPoly(g, [[0, 28], [4, 24], [5, 30], [1, 31]], KEY);
  fillPoly(g, [[16, 29], [19, 24], [21, 29], [17, 32]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (hsh(x, y, 5) < 0.12) return R.crD;
    return (x + y) % 7 === 0 ? ironL : (hsh(x, y, 6) < 0.3 ? ironD : iron);
  });
  px(g, 1, 25, ironL); px(g, 19, 25, ironL); rect(g, 4, 35, 7, 1, ironD);
  // the ring at the head: an annulus with a real hole in it, and the chain shackled into it
  for (let y = 1; y < 10; y++) for (let x = 11; x < 20; x++) { const dx = x + 0.5 - 15, dy = y + 0.5 - 5; const r2 = dx * dx + dy * dy; if (r2 <= 3.4 * 3.4 && r2 >= 1.7 * 1.7) px(g, x, y, y < 4 ? ironL : (x > 16 ? ironD : iron)); }
  // three links, each an open ring with a clear hole, so the chain reads as chain and not as a lump
  const links = [[19, 3], [22, 5], [24, 2]];
  links.forEach(([lx, ly], i) => {
    for (let y = ly - 2; y <= ly + 2; y++) for (let x = lx - 2; x <= lx + 2; x++) {
      const dx = (x + 0.5 - lx) / (i % 2 ? 1.5 : 2.1), dy = (y + 0.5 - ly) / (i % 2 ? 2.1 : 1.5);
      const r2 = dx * dx + dy * dy;
      if (r2 > 1 || r2 < 0.34) continue;
      px(g, x, y, y < ly ? ironL : (x > lx ? ironD : iron));
    }
  });
  // fouled: a turn of her own cable round the shank, weed hanging off the arms, coral on the crown
  for (let y = 20; y < 24; y++) { const x = Math.round(7 + (34 - y) * 0.3); rect(g, x - 1, y, 5, 1, (y & 1) ? R.rope : R.ropeD); }
  ropeEnd(g, 13, 24, 8, 0.32, rnd);
  for (const [x, y, len] of [[3, 30, 6], [17, 31, 5], [6, 26, 4]]) weed(g, x, y, len, rnd);
  coralNub(g, 5, 33, 0, true); coralNub(g, 9, 36, 1, false); coralNub(g, 18, 30, 2, false);
  return outline(c, OUT);
}

// A sea chest off the tribute fleet: rope-bound, brass corners gone green, closed and still sealed.
// 22x16. Swap to bakeSealChest() once its seal is taken.
export function bakeSeaChest() {
  const W = 22, H = 16; const [c, g] = canvas(W, H);
  chestBody(g);
  // the lid, shut: a coopered top with two rope bands over it and the brass escutcheon in front
  fillPoly(g, [[1, 6], [3, 3], [18, 3], [20, 6]], KEY);
  recolor(g, W, H, KEY, (x, y) => (y === 3 ? R.bone : (y === 6 ? R.woodDD : (hsh(x, y, 7) < 0.2 ? R.woodD : R.wood))));
  for (const x of [5, 15]) { rect(g, x, 3, 2, 4, R.rope); px(g, x, 3, R.ropeD); px(g, x + 1, 5, R.ropeD); }
  rect(g, 1, 6, 20, 1, R.woodDD);
  rect(g, 9, 6, 4, 3, R.brassD); rect(g, 9, 6, 4, 1, R.brass); px(g, 10, 7, R.brassL); px(g, 11, 8, R.tar);
  verdigris(g, 9, 12, 9, 3, 9);
  chestTrim(g);
  return outline(c, OUT);
}

// The same chest thrown open and empty: the lid fallen back, nothing inside but wet boards and the
// print in the straw where the seal sat. 22x16.
export function bakeSealChest() {
  const W = 22, H = 16; const [c, g] = canvas(W, H);
  // the lid thrown right back first, so it stands behind the box with its underside to us
  fillPoly(g, [[2, 6], [3, 1], [18, 0], [19, 5]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y <= 1) return R.boneD;
    return (x % 4 === 1) ? R.woodDD : (hsh(x, y, 17) < 0.25 ? R.woodD : '#5a4a3c');
  });
  rect(g, 2, 5, 17, 1, R.woodDD);
  for (const x of [6, 15]) { rect(g, x, 1, 2, 5, R.rope); px(g, x, 1, R.ropeD); px(g, x + 1, 3, R.ropeD); }
  chestBody(g);
  // the mouth of her: a deep black hole where the lid used to shut, the near wall cut low
  rect(g, 2, 6, 18, 4, R.tar);
  rect(g, 3, 6, 16, 3, '#100e13');
  rect(g, 2, 6, 18, 1, R.woodDD);
  for (let x = 3; x < 19; x++) px(g, x, 10, hsh(x, 1, 13) < 0.45 ? R.boneD : R.woodD);
  // wet boards and a wisp of rotten packing straw: empty, the seal gone out of it
  for (const [x, y] of [[6, 8], [9, 9], [13, 8], [16, 9], [11, 7]]) { px(g, x, y, R.ropeD); px(g, x + 1, y, R.ropeDD); }
  ellipse(g, 11, 9, 3, 1.2, R.woodD); px(g, 10, 9, R.boneD); px(g, 12, 9, R.woodDD);
  // the hinges strained open, the escutcheon swung loose and dangling
  for (const x of [5, 14]) { rect(g, x, 5, 3, 2, R.rk1); px(g, x, 5, R.rk3); px(g, x + 2, 6, R.rk0); }
  rect(g, 9, 11, 4, 3, R.brassD); rect(g, 9, 11, 4, 1, R.brass); px(g, 10, 12, R.brassL);
  verdigris(g, 9, 12, 14, 2, 9);
  chestTrim(g);
  return outline(c, OUT);
}

// The carcase both chests share: sodden planks, iron straps, brass corners, weed on the foot.
function chestBody(g) {
  rect(g, 2, 8, 18, 7, KEY2);
  recolor(g, 22, 16, KEY2, (x, y) => {
    if (y === 8) return R.boneD;
    if (y > 13) return R.woodDD;
    if (x > 18) return R.woodDD;
    if (y % 3 === 1) return R.woodD;
    return hsh(x, y, 3) < 0.18 ? R.woodD : R.wood;
  });
  for (const x of [4, 16]) { rect(g, x, 8, 2, 7, R.rk1); px(g, x, 8, R.rk3); px(g, x + 1, 11, R.rk3); px(g, x + 1, 14, R.rk0); }
  rect(g, 2, 11, 18, 1, R.rope); for (let x = 2; x < 20; x += 2) px(g, x, 11, R.ropeD);
}
// The brass at the corners, the beckets at the ends, and the reef beginning on it.
function chestTrim(g) {
  for (const [x, y] of [[1, 13], [18, 13]]) { rect(g, x, y, 3, 2, R.brassD); px(g, x, y, R.brass); px(g, x + 2, y + 1, R.verdD); }
  px(g, 0, 10, R.brassD); px(g, 0, 11, R.verdD); px(g, 21, 10, R.brassD); px(g, 21, 11, R.verdD);
  rect(g, 2, 15, 18, 1, R.woodDD);
  px(g, 3, 14, R.kelpD); px(g, 4, 15, R.kelp); px(g, 17, 15, R.kelpD); px(g, 18, 14, R.kelpD);
  coralNub(g, 6, 13, 0, false); coralNub(g, 13, 14, 2, false);
}

// THE ROYAL SEAL — the level's quest item. A heavy disc of elven gold over green wax, hung on a
// ribbon; the glint is baked in at its upper left. 12x14, the ribbon tail at the bottom.
export function bakeSeal() {
  const W = 12, H = 14; const [c, g] = canvas(W, H);
  // the ribbon, once sea-green silk, hanging through the disc
  fillPoly(g, [[4, 0], [7, 0], [8, 4], [3, 4]], R.verd);
  px(g, 4, 0, R.verdL); px(g, 7, 1, R.verdD); px(g, 3, 3, R.verdD); px(g, 7, 3, R.verdDD);
  rect(g, 4, 4, 4, 1, R.verdD);
  // the disc: a gold rim, milled, with the dark wax impression sunk in the middle
  circle(g, 6, 8.5, 4.4, R.brassD);
  circle(g, 6, 8.5, 3.9, R.gold);
  for (let y = 4; y < 14; y++) for (let x = 1; x < 11; x++) { const dx = x + 0.5 - 6, dy = y + 0.5 - 8.5; if (dx * dx + dy * dy > 3.9 * 3.9) continue; if ((x + y) % 3 === 0 && dx * dx + dy * dy > 3.1 * 3.1) px(g, x, y, R.brassD); }
  circle(g, 6, 8.5, 2.7, R.wax);
  circle(g, 6, 8.2, 2.2, R.waxD);
  // the sigil struck into the wax: a star over a wave, in gold showing through
  px(g, 6, 7, R.goldL); px(g, 5, 8, R.gold); px(g, 7, 8, R.gold); px(g, 6, 8, R.goldL); px(g, 6, 6, R.gold);
  px(g, 4, 10, R.gold); px(g, 5, 10, R.brassD); px(g, 6, 10, R.gold); px(g, 7, 10, R.brassD);
  // the glint: a hard highlight on the rim and a spark off it
  px(g, 4, 5, R.goldL); px(g, 3, 6, R.goldL); px(g, 3, 7, '#ffffff'); px(g, 4, 6, '#ffffff');
  px(g, 2, 6, R.lampL); px(g, 8, 12, R.goldL);
  return outline(c, OUT);
}

// The HUD counter icon for the royal seal: the same disc, flattened and hard-edged so it reads at
// 10x10 in a corner of the screen.
export function bakeSealIcon() {
  const [c, g] = canvas(10, 10);
  // the ribbon first, then the disc struck over it, big enough to read in a HUD corner
  rect(g, 4, 0, 3, 3, R.verd); px(g, 4, 0, R.verdL); px(g, 6, 2, R.verdD);
  circle(g, 5, 5.5, 4.2, R.brassD);
  circle(g, 5, 5.5, 3.4, R.gold);
  circle(g, 5, 5.5, 1.9, R.wax);
  px(g, 5, 5, R.goldL); px(g, 4, 6, R.waxD); px(g, 6, 6, R.waxD);
  px(g, 3, 3, R.goldL); px(g, 2, 4, '#ffffff'); px(g, 3, 4, '#ffffff');
  px(g, 7, 7, R.brassD); px(g, 6, 8, R.brassD);
  return outline(c, OUT);
}

// A ship's bell on its bracket, salvaged onto a rock: brass under a bloom of verdigris, the rope
// lanyard still on the clapper. 16x18.
export function bakeShipBell() {
  const W = 16, H = 18, rnd = mulberry(1609); const [c, g] = canvas(W, H);
  // the bracket: a short iron standard on a salvage block, the arm out over the bell so that the
  // bell itself gets nearly the whole sprite and its shoulders-and-mouth silhouette reads at 1x
  rect(g, 0, 15, 5, 3, R.rk1); rect(g, 0, 15, 5, 1, R.rk3); rect(g, 0, 17, 5, 1, R.rk0);
  rect(g, 0, 2, 2, 14, R.rk1); rect(g, 0, 2, 1, 14, R.rk2); px(g, 1, 7, R.rk0); px(g, 1, 12, R.rk0);
  rect(g, 0, 1, 9, 2, R.rk1); rect(g, 0, 1, 9, 1, R.rk3);
  rect(g, 7, 2, 2, 3, R.rk1); px(g, 8, 3, R.rk0);
  // the bell: a crown, shoulders and a flaring mouth, bright only where hands have rubbed the brass
  fillPoly(g, [[6, 5], [11, 5], [12, 8], [13, 11], [15, 14], [3, 14], [5, 11], [6, 8]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y >= 13) return R.brassD;
    if (x <= 5) return R.brassL;
    if (x >= 12) return R.brassD;
    return hsh(x, y, 3) < 0.16 ? R.brassD : R.brass;
  });
  rect(g, 6, 4, 5, 1, R.brassD); rect(g, 7, 3, 3, 1, R.brass); px(g, 8, 3, R.brassL); px(g, 9, 4, R.brassD);
  rect(g, 4, 12, 10, 1, R.brassD); rect(g, 3, 13, 13, 1, R.brass); rect(g, 3, 14, 13, 1, R.brassD);
  px(g, 4, 13, R.brassL); px(g, 5, 7, R.brassL); px(g, 5, 10, R.brassL); px(g, 6, 6, R.brassL);
  // the verdigris: green run down the waist and pooled in the mouth
  verdigris(g, 5, 14, 7, 6, 11);
  for (let x = 4; x < 15; x++) if (hsh(x, 5, 12) < 0.6) px(g, x, 12, R.verdD);
  px(g, 10, 8, R.verdL); px(g, 11, 9, R.verdD); px(g, 7, 10, R.verdD); px(g, 13, 13, R.verdDD);
  // the clapper hanging in the mouth, with the lanyard made fast to it
  px(g, 9, 13, R.rk0); px(g, 9, 14, R.rk1);
  ropeEnd(g, 9, 15, 3, 0.4, rnd);
  // what the reef has put on it
  coralNub(g, 1, 15, 1, false); coralNub(g, 3, 16, 0, false); px(g, 5, 17, R.kelpD); px(g, 0, 14, R.kelpD);
  return outline(c, OUT);
}

// A lantern buoy riding over the reef: a tarred float with a verdigris lamp on a little gallows.
// 14x26, lit or dark. Its BOTTOM ROW IS THE WATERLINE, not a ground line — sit it in the swell.
export function bakeLanternBuoy(lit) {
  const W = 14, H = 26; const [c, g] = canvas(W, H);
  // the float: a fat tarred can, red-leaded round its waist, barnacled at the waterline
  fillPoly(g, [[3, 25], [2, 20], [2.4, 15], [5, 13], [9, 13], [11.6, 15], [12, 20], [11, 25]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    if (y >= 23) return R.tar;
    const band = y >= 18 && y <= 21;
    if (x <= 3) return band ? '#c2563c' : R.tarL;
    if (x >= 10) return band ? '#6e2a20' : R.tar;
    if (band) return hsh(x, y, 3) < 0.2 ? '#6e2a20' : '#a8402c';
    return hsh(x, y, 4) < 0.18 ? R.tar : R.tarL;
  });
  for (let x = 3; x < 12; x++) if (hsh(x, 7, 5) < 0.6) { px(g, x, 22, R.cbM); if (hsh(x, 8, 6) < 0.4) px(g, x, 21, R.cbD); }
  px(g, 4, 24, R.kelpD); px(g, 9, 24, R.kelpD); px(g, 10, 23, R.kelp);
  coralNub(g, 2, 21, 1, false);
  // the gallows: two legs off the float carrying the lamp
  rect(g, 4, 9, 1, 5, R.rk1); rect(g, 9, 9, 1, 5, R.rk1); px(g, 4, 9, R.rk3); px(g, 9, 13, R.rk0);
  rect(g, 4, 8, 6, 1, R.rk2);
  // the lamp: a verdigris cage with a glass in it, lit or dead
  rect(g, 3, 3, 8, 6, R.verdD); rect(g, 3, 3, 8, 1, R.verd);
  if (lit) {
    rect(g, 4, 4, 6, 4, R.lamp); rect(g, 5, 5, 4, 2, R.lampL);
    px(g, 4, 4, R.lampL); px(g, 9, 7, R.brass);
    px(g, 2, 5, R.lampG); px(g, 11, 5, R.lampG); px(g, 6, 2, R.lampG);
  } else {
    rect(g, 4, 4, 6, 4, R.sea0); px(g, 4, 4, R.sea2); px(g, 5, 5, R.sea1); px(g, 8, 6, R.sea1);
  }
  rect(g, 6, 4, 1, 4, R.verdD); rect(g, 3, 8, 8, 1, R.verd); rect(g, 3, 9, 8, 1, R.verdDD);
  // the hood and the ring on top
  fillPoly(g, [[2, 3], [7, 0], [12, 3]], R.verd); fillPoly(g, [[7, 0], [12, 3], [7, 3]], R.verdD);
  px(g, 5, 2, R.verdL); px(g, 6, 0, R.verdD); px(g, 7, 0, R.verdDD);
  verdigris(g, 4, 10, 9, 3, 15);
  return outline(c, OUT);
}

// ---------- the reef itself ----------

// A sea fan standing out of the reef. 16x20, v 0..2: 0 = a broad bone-white fan, 1 = a tall rust one,
// 2 = a violet fan split into two lobes.
export function bakeCoralFan(v) {
  v = ((v % 3) + 3) % 3; const W = 16, H = 20, rnd = mulberry(6101 + v * 71); const [c, g] = canvas(W, H);
  const pal = [[R.cb, R.cbM, R.cbD], [R.cr, R.crM, R.crD], [R.cv, R.cvM, R.cvD]][v];
  const cx = 8, cy = 17;
  // the blade of the fan: a filled sweep, then the mesh cut out of it
  if (v === 0) fillPoly(g, [[8, 16], [1, 9], [1.6, 5], [5, 2], [8, 1], [11, 2], [14.4, 5], [15, 9]], KEY);
  else if (v === 1) fillPoly(g, [[8, 16], [1, 11], [0.6, 6], [3, 2], [6, 0], [9, 0], [12.4, 2], [14.6, 6], [14.6, 11]], KEY);
  else { fillPoly(g, [[7, 16], [1, 10], [1.6, 6], [4, 3], [7, 4], [8, 9]], KEY); fillPoly(g, [[8, 15], [8, 8], [10, 3], [13, 2], [15, 6], [15, 10], [11, 15]], KEY); }
  recolor(g, W, H, KEY, (x, y) => {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy);
    const a = Math.atan2(-dy, dx);
    // the mesh: radial veins crossed by growth rings, the water showing through between
    const freq = v === 1 ? 15 : 9.5;
    const vein = Math.abs(Math.sin(a * freq)) > (v === 1 ? 0.3 : 0.42), ring = (Math.round(r) % 3) !== 2;
    if (!vein && !ring) return null;
    if (!vein && hsh(x, y, 3) < (v === 1 ? 0.6 : 0.45)) return null;
    if (r > 13) return null;
    if (r > 10.5) return hsh(x, y, 5) < 0.4 ? pal[0] : pal[1];
    if (dx < -1) return pal[0];
    if (dx > 3) return pal[2];
    return hsh(x, y, 7) < 0.3 ? pal[2] : pal[1];
  });
  // the rim: pale growing tips all round the outside
  tipEdge(g, W, H, pal[0], 9);
  // the stem and the holdfast gripping the rock
  rect(g, 7, 14, 2, 5, pal[2]); px(g, 7, 15, pal[1]); px(g, 8, 17, pal[2]);
  rect(g, 5, 18, 6, 2, R.rk1); rect(g, 5, 18, 6, 1, R.rk2); px(g, 5, 19, R.rk0); px(g, 10, 19, R.rk0);
  px(g, 4, 19, R.rk1); px(g, 11, 19, R.rk1);
  if (rnd() < 0.9) { px(g, 10, 18, R.kelpD); px(g, 11, 18, R.kelp); }
  return outline(c, OUT);
}

// Brain coral: a hard round head, its surface a maze of sunk channels. 20x14, v 0..1.
export function bakeBrainCoral(v) {
  v = ((v % 2) + 2) % 2; const W = 20, H = 14, rnd = mulberry(7331 + v * 29); const [c, g] = canvas(W, H);
  const pal = v === 0 ? [R.cb, R.cbM, R.cbD] : [mix(R.cb, R.cr, 0.45), mix(R.cbM, R.crM, 0.5), R.crD];
  if (v === 0) ellipse(g, 10, 11, 9.2, 8.4, KEY);
  else { ellipse(g, 8, 11, 7.4, 7.2, KEY); ellipse(g, 15, 11.5, 4.6, 4.4, KEY); }
  const m = maskOf(g, W, H), at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  recolor(g, W, H, KEY, (x, y) => {
    let top = y; while (at(x, top - 1)) top--;
    const d = y - top;
    // the channels: a wandering maze sunk into the head, pale ridges standing between them
    const ch = Math.sin(x * 0.8 + Math.cos(y * 0.95 + x * 0.2) * 2.4 + (v ? 1.1 : 0));
    if (!at(x + 1, y) || y >= H - 1) return '#4a4136';
    if (Math.abs(ch) < 0.44) return hsh(x, y, 5) < 0.35 ? '#3e372e' : '#544a3c';
    if (d === 0 || (d === 1 && x < 11)) return R.foam;
    if (Math.abs(ch) > 0.8) return pal[0];
    return hsh(x, y, 3) < 0.2 ? pal[2] : pal[1];
  });
  // weed in the lee of it and a nub of another coral on its shoulder
  px(g, 1, 12, R.kelpD); px(g, 18, 12, R.kelpD); if (rnd() < 0.8) coralNub(g, v ? 4 : 13, v ? 5 : 4, 2, false);
  return outline(c, OUT);
}

// A rock crusted with black urchins: they sit in their own hollows, spines out. 18x12, v 0..1.
export function bakeUrchinRock(v) {
  v = ((v % 2) + 2) % 2; const W = 18, H = 12, rnd = mulberry(4201 + v * 53); const [c, g] = canvas(W, H);
  const pts = v === 0
    ? [[1, 11], [1.4, 7], [4, 4], [8, 2.6], [13, 3.4], [16.4, 6], [17, 11]]
    : [[0.6, 11], [2, 6.4], [6, 4.4], [11, 5], [15, 3.6], [17.4, 7], [17, 11]];
  fillPoly(g, pts, KEY);
  // the rock is grazed bare and bleached by them: pale, so the black tests read hard against it
  const m = maskOf(g, W, H), at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  recolor(g, W, H, KEY, (x, y) => {
    let top = y; while (at(x, top - 1)) top--;
    let bot = y; while (at(x, bot + 1)) bot++;
    const d = y - top, b = bot - y;
    if (d === 0) return hsh(x, y, 21) < 0.5 ? R.cb : R.cbM;
    if (d < 2) return hsh(x, y, 22) < 0.4 ? R.cbM : R.rk3;
    if (b <= 1 || !at(x + 1, y)) return R.rk0;
    if (b <= 3) return ((x + y) & 1) ? R.rk1 : R.rk2;
    return hsh(x, y, 23) < 0.22 ? R.rk3 : R.rk2;
  });
  // the urchins: a dark test with a pale mouth, spines standing out of it in every direction
  const spots = v === 0 ? [[5, 6], [10, 4], [14, 7]] : [[4, 8], [9, 6], [14, 5]];
  for (const [ux, uy] of spots) {
    for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [-2, -2], [2, -2], [-2, 1], [2, 1]]) if (rnd() < 0.85) px(g, ux + dx, uy + dy, R.urch);
    circle(g, ux, uy, 1.6, R.urch);
    px(g, ux - 1, uy - 1, R.urchL); px(g, ux, uy, '#191423');
  }
  // a little coral and weed between them
  coralNub(g, v ? 11 : 6, v ? 9 : 9, v ? 0 : 2, false);
  px(g, 1, 9, R.kelpD); px(g, 16, 9, R.kelpD); px(g, 15, 9, R.kelp);
  return outline(c, OUT);
}

// A starfish for the reef floor. 10x10, v 0..2: rust, bone and a violet one with a curled arm.
export function bakeStarfish(v) {
  v = ((v % 3) + 3) % 3;
  const grids = [
    ['...mm...', '...dd...', 'm..dd..m', '.mddddm.', '..dDDd..', '.dd..dd.', 'm.d..d.m', '........'],
    ['..mm....', '..dd....', 'm.dd...m', '.mdddddm', '..dDDdd.', '.dd..d..', 'm.d..dm.', '........'],
    ['....mm..', '...ddd..', 'm..dd..m', '.mdddjm.', '..dDDd..', '.dd..dd.', 'm.d...dm', '......m.'],
  ];
  const pal = v === 0
    ? { m: R.cr, d: R.crM, D: R.crD, j: R.cr }
    : v === 1
      ? { m: R.cb, d: R.cbM, D: R.cbD, j: R.cb }
      : { m: R.cv, d: R.cvM, D: R.cvD, j: R.cv };
  const c = fromGrid(grids[v], pal, 1);
  const g = c.getContext('2d');
  // the pale tube feet showing along one arm, and a bright tip
  px(g, 4, 5, v === 1 ? R.foam : pal.m); px(g, 5, 5, pal.D);
  return outline(c, OUT);
}

// A broken spar lying on the reef floor. 30x8, v 0..1: 0 = a round spar snapped at both ends with an
// iron band, 1 = a deck plank with its nails drawn and one end splintered.
export function bakeSpar(v) {
  v = ((v % 2) + 2) % 2; const W = 30, H = 8, rnd = mulberry(1811 + v * 97); const [c, g] = canvas(W, H);
  if (v === 0) {
    fillPoly(g, [[2, 3], [9, 2.4], [20, 2.2], [26, 2.8], [28, 4], [26, 6.6], [18, 7], [8, 6.8], [3, 6]], KEY);
    recolor(g, W, H, KEY, (x, y) => {
      if (y <= 2) return R.boneM;
      if (y === 3) return R.bone;
      if (y >= 6) return R.woodDD;
      return hsh(x, y, 2) < 0.2 ? R.woodD : R.wood;
    });
    // the snapped ends show their broken grain; an iron band near the middle
    for (let y = 3; y < 7; y++) { px(g, 2, y, R.boneD); px(g, 3, y, R.bone); px(g, 27, y, R.woodDD); px(g, 26, y, R.boneD); }
    rect(g, 13, 2, 3, 5, R.rk1); rect(g, 13, 2, 3, 1, R.rk3); px(g, 15, 5, R.rk0); px(g, 14, 6, R.crD);
    for (const x of [6, 10, 19, 23]) px(g, x, 4, R.woodD);
  } else {
    fillPoly(g, [[1, 4], [6, 3], [16, 2.6], [24, 3], [29, 4.4], [27, 7], [14, 7], [4, 6.6], [1, 6]], KEY);
    recolor(g, W, H, KEY, (x, y) => {
      if (y <= 3) return R.bone;
      if (y === 4) return R.boneM;
      if (y >= 6) return R.woodDD;
      return hsh(x, y, 4) < 0.22 ? R.woodDD : R.woodD;
    });
    // splinters off the right end, and the nail holes where she was drawn off her beam
    for (const [x, y] of [[28, 3], [29, 5], [27, 6]]) px(g, x, y, R.bone);
    line(g, 24, 4, 29, 3, R.boneM, 1);
    for (const x of [5, 12, 20]) { px(g, x, 4, R.rk0); px(g, x, 5, R.crD); px(g, x + 1, 4, R.boneM); }
    for (let x = 3; x < 28; x += 2) if (hsh(x, 1, 7) < 0.4) px(g, x, 5, R.woodDD);
  }
  // the reef taking it: weed along the underside, a nub or two of coral on top
  for (let x = 3; x < 27; x += 5) if (rnd() < 0.7) px(g, x, 7, R.kelpD);
  coralNub(g, v ? 9 : 17, 2, v ? 2 : 0, false);
  if (rnd() < 0.8) coralNub(g, v ? 21 : 7, 3, 1, false);
  return outline(c, OUT);
}

// A crack in the reef rock venting gas: a dark fissure with a pale scalded lip and the first bubbles
// coming out of it. 14x10. The game draws the bubble column; this is the vent.
export function bakeBubbleVent() {
  const W = 14, H = 10; const [c, g] = canvas(W, H);
  fillPoly(g, [[0, 9], [1, 6], [4, 4], [7, 3.4], [10, 4], [13, 6], [13, 9]], KEY);
  const m = shadeRock(g, W, H, KEY);
  // the crown scalded pale by whatever comes up the crack
  for (let x = 1; x < W - 1; x++) { let y = 0; while (y < H && !m[y * W + x]) y++; if (y < H - 2) px(g, x, y, hsh(x, y, 23) < 0.5 ? R.rk3 : R.cbM); }
  // the fissure: a black wedge opening at the crown and closing as it goes down into the rock
  for (const [x0, x1, y] of [[5, 8, 3], [5, 8, 4], [6, 8, 5], [6, 7, 6], [7, 7, 7], [7, 7, 8]]) rect(g, x0, y, x1 - x0 + 1, 1, '#090c10');
  // the lips of it, scalded white, with a rime of sulphur yellow either side
  px(g, 4, 3, R.foam); px(g, 9, 3, R.foam); px(g, 4, 4, R.rk3); px(g, 9, 4, R.rk3); px(g, 5, 2, R.foam);
  px(g, 3, 4, R.lampG); px(g, 10, 4, R.lamp); px(g, 3, 5, R.lampG); px(g, 10, 5, R.lampG); px(g, 9, 6, R.lampG);
  // the first bubbles, just off the crack
  px(g, 6, 1, R.foam); px(g, 7, 0, R.sea3); px(g, 8, 1, R.sea3);
  // weed flattened round the vent by the stream of gas
  px(g, 2, 7, R.kelpD); px(g, 11, 7, R.kelpD); px(g, 12, 6, R.kelp);
  return outline(c, OUT);
}

// THE AIR POCKET: a diving bell left standing on the reef floor, brass gone part green, a lit glass
// port in her side and a bubble of kept air shining under her rim. 34x34. The one warm, safe thing
// down here — she is meant to pull the eye from across the room.
export function bakeAirBell() {
  const W = 34, H = 34, rnd = mulberry(5501); const [c, g] = canvas(W, H);
  // the body: a truncated brass cone, bright down her left, green down her right
  fillPoly(g, [[11, 5], [23, 5], [28, 18], [31, 29], [3, 29], [6, 18]], KEY);
  recolor(g, W, H, KEY, (x, y) => {
    const t = (y - 5) / 24, a = 11 - t * 8, b = 23 + t * 8, f = (x - a) / (b - a);
    if (f < 0.1) return R.brassL;
    if (f < 0.22) return R.brass;
    if (f > 0.86) return R.verdDD;
    if (f > 0.72) return R.verdD;
    if ((y - 5) % 7 === 6) return R.brassD;
    return hsh(x, y, 3) < 0.14 ? R.brassD : R.brass;
  });
  // her hoops, and the strakes between them
  for (const hy of [11, 19, 26]) { for (let x = 0; x < W; x++) { const d = g.getImageData(x, hy, 1, 1).data; if (!d[3]) continue; px(g, x, hy, R.brassD); px(g, x, hy + 1, hsh(x, hy, 5) < 0.3 ? R.verdD : R.brass); } }
  // the glass port: a big round light with warm lamp in it, the whole point of her
  circle(g, 16.5, 16.5, 6.4, R.brassD);
  circle(g, 16.5, 16.5, 5.4, R.brass);
  circle(g, 16.5, 16.5, 4.4, R.lamp);
  circle(g, 16.5, 16.2, 3.1, R.lampL);
  px(g, 14, 14, '#ffffff'); px(g, 15, 14, '#ffffff'); px(g, 14, 15, '#ffffff');
  px(g, 19, 19, R.lamp); px(g, 18, 20, R.brass);
  // the bolts round the port
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; px(g, Math.round(16.5 + Math.cos(a) * 5.9 - 0.5), Math.round(16.5 + Math.sin(a) * 5.9 - 0.5), i % 2 ? R.brassL : R.brassD); }
  // the light she throws: warm pixels spilling onto her own brass and out into the water
  for (const [x, y] of [[8, 12], [9, 20], [24, 12], [25, 21], [16, 7], [16, 27], [7, 16], [26, 16]]) px(g, x, y, R.lampG);
  // the lifting ring and the crown, with the air hose stub still on it
  rect(g, 13, 3, 8, 2, R.brassD); rect(g, 13, 3, 8, 1, R.brass);
  for (let y = 0; y < 4; y++) for (let x = 14; x < 20; x++) { const dx = x + 0.5 - 17, dy = y + 0.5 - 3.2; const r2 = (dx * dx) / 6.25 + (dy * dy) / 9; if (r2 <= 1 && r2 >= 0.3) px(g, x, y, y < 2 ? R.brassL : R.brassD); }
  rect(g, 21, 2, 3, 2, R.rk1); px(g, 23, 2, R.rk3); px(g, 24, 3, R.rk0);
  // the rim, and under it the kept air: a bright pale band, the sea held off
  rect(g, 2, 29, 30, 2, R.brassD); rect(g, 2, 29, 30, 1, R.brassL);
  for (let x = 4; x < 30; x++) px(g, x, 31, hsh(x, 1, 9) < 0.5 ? R.foam : '#f4fbf8');
  for (let x = 5; x < 29; x++) if (hsh(x, 2, 11) < 0.5) px(g, x, 32, R.lampL);
  rect(g, 3, 33, 28, 1, R.rk0);
  for (const x of [6, 13, 20, 27]) { rect(g, x, 31, 2, 3, R.rk1); px(g, x, 31, R.rk2); }
  // a few bubbles escaping round the rim, and the reef starting on her cold side
  px(g, 1, 27, R.foam); px(g, 0, 25, R.sea3); px(g, 32, 26, R.foam); px(g, 33, 23, R.sea3); px(g, 2, 22, R.foam);
  verdigris(g, 24, 30, 27, 4, 13);
  coralNub(g, 28, 25, 2, false); coralNub(g, 29, 21, 0, false); px(g, 30, 28, R.kelpD);
  if (rnd() < 0.9) { px(g, 4, 27, R.cbM); px(g, 5, 27, R.cb); }
  return outline(c, OUT);
}

// Tall kelp for the drowned half of the level: a holdfast on the rock, a long stipe, ribbon blades and
// gas bladders. 12x40, v 0..2. No outline — it should feel soft against the wrecks.
export function bakeKelpTall(v) {
  v = ((v % 3) + 3) % 3; const W = 12, H = 40, rnd = mulberry(3701 + v * 61); const [c, g] = canvas(W, H);
  const strands = v === 0 ? [[5.5, 1, 0.0, 1.6]] : v === 1 ? [[4, 4, 0.9, 1.3], [7.5, 1, 2.4, 1.1]] : [[6, 0, 1.6, 1.9], [3.5, 12, 0.2, 0.9], [8.5, 16, 2.9, 0.7]];
  const cl = x => Math.max(0, Math.min(W - 1, x));
  for (const [bx, top, ph, amp] of strands) {
    const xs = [];
    for (let y = H - 3; y >= top; y--) { const t = (H - 3 - y) / (H - 3 - top); xs[y] = Math.round(bx + Math.sin(y * 0.22 + ph) * amp * (0.3 + t * 1.6)); }
    for (let y = H - 3; y >= top; y--) { px(g, cl(xs[y]), y, R.kelpD); if (y < H - 6 && hsh(y, 1, 3) < 0.5) px(g, cl(xs[y] + 1), y, R.kelpDD); }
    let side = (v & 1) ? 1 : -1;
    for (let y = H - 9 + ((rnd() * 3) | 0); y > top + 2; y -= 5 + ((rnd() * 3) | 0)) {
      const x = xs[y], len = 3 + ((rnd() * 3) | 0);
      // a gas bladder at the root of each blade, then the blade peeling away from the stipe
      px(g, cl(x + side), y, '#9ab04e');
      for (let k = 1; k <= len; k++) { px(g, cl(x + side * k), y - k, k === len ? R.kelp : R.kelpD); if (k < len) px(g, cl(x + side * k), y - k + 1, R.kelpDD); if (k === len) px(g, cl(x + side * k), y - k - 1, '#86a648'); }
      side = -side;
    }
    // the top: a long ribbon blade fading to a pale tip up in the current
    for (let y = top; y < top + 7 && y < H - 3; y++) { px(g, cl(xs[y]), y, y < top + 2 ? '#9ab04e' : R.kelp); if (y > top + 2) px(g, cl(xs[y] + 1), y, R.kelpD); }
  }
  // the holdfast: a knot of roots over a stone
  rect(g, 3, H - 3, 6, 3, R.kelpDD); px(g, 2, H - 2, R.kelpDD); px(g, 9, H - 2, R.kelpDD); px(g, 1, H - 1, R.kelpDD); px(g, 10, H - 1, R.kelpDD);
  px(g, 4, H - 3, R.kelpD); px(g, 7, H - 3, R.kelpD); px(g, 5, H - 1, R.rk1); px(g, 6, H - 1, R.rk0);
  coralNub(g, 8, H - 5, 0, false);
  return c;
}

// A ship's wheel, half her spokes gone, leaning in the reef: bleached rim, brass hub gone green.
// 22x22 — the bottom of the rim is the ground line.
export function bakeWheel() {
  const W = 22, H = 22, rnd = mulberry(8101); const [c, g] = canvas(W, H);
  const cx = 10.5, cy = 10.5;
  // the rim: two concentric circles, and one felloe of it broken clean away
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy);
    if (r > 10.2 || r < 8.1) continue;
    const a = Math.atan2(dy, dx);
    if (a > 2.25 && a < 3.15) continue;
    px(g, x, y, r > 9.6 ? R.boneD : (dx < 0 ? R.bone : (hsh(x, y, 3) < 0.2 ? R.woodD : R.boneM)));
  }
  // the handles standing out past the rim, the two that are left
  for (const a of [0.45, 2.6, 3.9]) {
    for (let k = 0; k < 3; k++) { const x = Math.round(cx + Math.cos(a) * (10 + k) - 0.5), y = Math.round(cy + Math.sin(a) * (10 + k) - 0.5); px(g, x, y, k === 2 ? R.bone : R.boneM); }
  }
  // the spokes: four still in, their sockets empty where the rest were carried away
  for (const a of [-Math.PI / 2, 0.5, 2.2, 3.6]) {
    for (let r = 2.4; r < 9.2; r += 0.5) { const x = Math.round(cx + Math.cos(a) * r - 0.5), y = Math.round(cy + Math.sin(a) * r - 0.5); px(g, x, y, (r > 7 ? R.boneD : R.boneM)); px(g, x, y - 1, R.bone); }
  }
  // the hub: a brass boss over a wooden barrel, verdigris in its dish
  circle(g, cx, cy, 3.4, R.woodD); circle(g, cx, cy, 2.6, R.brassD); circle(g, cx, cy, 1.6, R.brass);
  px(g, 9, 9, R.brassL); px(g, 12, 12, R.verdD); px(g, 11, 12, R.verdDD); px(g, 9, 12, R.verdD);
  // the broken spoke stubs in the empty sockets
  for (const a of [Math.PI / 2, 1.35, 5.1]) { const x = Math.round(cx + Math.cos(a) * 4.2 - 0.5), y = Math.round(cy + Math.sin(a) * 4.2 - 0.5); px(g, x, y, R.bone); px(g, x, y + 1, R.boneD); }
  // the reef on her: coral along the lower rim, weed threaded through the spokes
  coralNub(g, 6, 17, 0, true); coralNub(g, 13, 18, 1, false); coralNub(g, 16, 8, 2, false);
  weed(g, 4, 13, 6, rnd); if (rnd() < 0.9) weed(g, 17, 12, 5, rnd);
  px(g, 2, 11, R.kelpD);
  return outline(c, OUT);
}

// A coral boulder: wet rock under a crust of reef, for building the floor and the ledges. 28x20,
// v 0..1 (0 = a high dome, 1 = a long low shelf with a cleft in it).
export function bakeReefRock(v) {
  v = ((v % 2) + 2) % 2; const W = 28, H = 20, rnd = mulberry(6607 + v * 43); const [c, g] = canvas(W, H);
  const pts = v === 0
    ? [[1, 19], [1.4, 13], [4, 7], [9, 3], [15, 2], [21, 4], [25.4, 9], [27, 14], [27, 19]]
    : [[0.6, 19], [1.4, 14], [5, 10], [11, 8.6], [14, 10], [18, 7.4], [23, 8], [26.6, 12], [27.4, 19]];
  fillPoly(g, pts, KEY);
  const m = shadeRock(g, W, H, KEY);
  // the crust: bone coral over the crown in patches, a rust head and one violet clump for accent —
  // patches, not confetti, so at 1x it reads as a crusted rock and not as static
  const patch = (cx, cy, rx, ry, p) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H || !m[y * W + x]) continue;
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, r2 = dx * dx + dy * dy;
      if (r2 > 1 || (r2 > 0.55 && hsh(x, y, 31) < 0.45)) continue;
      const above = y > 0 && m[(y - 1) * W + x] && (y - 1 + 0.5 - cy) / ry * ((y - 1 + 0.5 - cy) / ry) + dx * dx <= 1;
      px(g, x, y, !above ? p[0] : (hsh(x, y, 33) < 0.42 ? p[1] : p[2]));
    }
  };
  if (v === 0) { patch(8, 6, 5, 3.4, [R.cb, R.cbM, R.cbD]); patch(19, 8, 4.4, 3, [R.cb, R.cbM, R.cbD]); patch(14, 12, 4, 2.6, [R.cr, R.crM, R.crD]); patch(23, 13, 3, 2.2, [R.cv, R.cvM, R.cvD]); }
  else { patch(7, 12, 5, 3, [R.cb, R.cbM, R.cbD]); patch(21, 10, 5, 3.2, [R.cb, R.cbM, R.cbD]); patch(12, 10, 3.4, 2.4, [R.cr, R.crM, R.crD]); patch(25, 15, 3, 2.2, [R.cv, R.cvM, R.cvD]); }
  encrust(g, W, H, m, rnd, 4, v === 0 ? 8 : 10, 17, 3, 25, [R.cb, R.cbM, R.cbD]);
  encrust(g, W, H, m, rnd, 2, v === 0 ? 9 : 11, 17, 4, 24, [R.cr, R.crM, R.crD]);
  // a fur of fine weed in the hollows, and the dark cleft on the long rock
  for (let x = 2; x < 26; x++) { let y = 0; while (y < H && !m[y * W + x]) y++; if (y < H - 3 && hsh(x, y, 11) < 0.3) { px(g, x, y, R.kelpD); if (hsh(x, 2, 12) < 0.4) px(g, x, y + 1, R.kelpDD); } }
  if (v === 1) { for (let y = 9; y < 17; y++) { px(g, 14, y, R.rk0); px(g, 15, y, '#20262c'); if (y > 11) px(g, 16, y, R.rk0); } px(g, 14, 9, R.rk2); px(g, 15, 9, R.rk1); }
  else { for (let y = 5; y < 12; y++) { px(g, 19 + ((y - 5) >> 1), y, R.rk0); px(g, 20 + ((y - 5) >> 1), y, R.rk2); } }
  // a brain coral head sitting on the crown, and a starfish low down on the face
  const bx = v === 0 ? 11 : 19, by = v === 0 ? 2 : 7;
  for (let y = 0; y < 5; y++) for (let x = 0; x < 7; x++) { const dx = (x - 3) / 3.4, dy = (y - 4) / 4.4; if (dx * dx + dy * dy > 1) continue; const ch = Math.sin((bx + x) * 0.95 + Math.cos((by + y) * 0.8) * 1.7); px(g, bx + x, by + y, Math.abs(ch) < 0.32 ? R.cbD : (y === 0 ? R.foam : (hsh(x, y, 3) < 0.25 ? R.cbD : R.cbM))); }
  const sx = v === 0 ? 4 : 22, sy = v === 0 ? 15 : 15;
  px(g, sx + 1, sy, R.crM); px(g, sx, sy + 1, R.cr); px(g, sx + 1, sy + 1, R.crM); px(g, sx + 2, sy + 1, R.cr); px(g, sx, sy + 2, R.crD); px(g, sx + 2, sy + 2, R.crD);
  return outline(c, OUT);
}
