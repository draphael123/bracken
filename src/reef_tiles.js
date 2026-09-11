// reef_tiles.js — THE SHIPWRECK REEF: tiles and parallax for the drowned tribute fleet. A coral reef out at
// sea under a storm: grey-green light with no direction in it (overcast, so tops are pale and every side is in
// shade), a green-black sea, bone-pale limestone eaten hollow by the water, and the wrecks of an elven kingdom's
// tribute fleet broken over the reef — tarred planking, iron bolts, brass gone to verdigris, torn sailcloth.
// Deliberately colder and more broken than THE LONG WATER's warm dusk coast (lw_tiles.js): no sand, no sunlit
// faces, no thrift. Same conventions as lw_tiles.js and art.js: 16x16 tiles, crisp px.js primitives only (no AA),
// fixed seeds for the tiles so they come out the same every load, the caller's seed for the background layers.
import { canvas, px, rect, line, circle, ellipse, fillPoly, mulberry } from './px.js';

const T = 16;
// the sea: green-black, only the shallowest step has any light in it
const SEA = ['#0d1c20', '#13333a', '#1d5058', '#3c8a84'], FOAM = '#dcece6', FOAM_D = '#9fbdb5';
// coral limestone: bone-pale and grey-green, pitted right through. `pit` is the hole, `hi` the rim the light hits
const CR = { hi: '#d8dccb', l: '#b4bcaa', m: '#929c8b', d: '#747e72', deep: '#5a6459', crack: '#424c46', pit: '#323b37' };
const BONE = ['#ece8d6', '#cfc8b2', '#a8a392'];
const WEED = ['#3d6550', '#2b4a3a', '#1a2f26', '#548063'];
const BARN = ['#d0d1c2', '#a6aa9c', '#767c70'];
// ship timber: tarred black-brown planking, caulk in the seams, rot gone pale
const TIM = { caulk: '#13100e', d: '#241e1a', m: '#332b24', l: '#433830', hi: '#55483c', rot: '#4f4a36' };
const DECK = ['#7e7462', '#615847', '#443d30'];
const IRON = { d: '#272b2f', m: '#565c62', l: '#858c91', rust: '#7a4526' };
const VERD = ['#3f7a64', '#5fa889'];
const CLOTH = ['#c6c4b2', '#a2a091', '#7b7a6e'];
const ROPE = ['#8b7d5d', '#6a5f46', '#4b432f'];
const SILT = ['#3e4239', '#4d5145', '#2d3128'];
const HAZE = '#8c9a92';

// ---------- coral tiles ----------

// The limestone body every coral tile shares. No beds, no seams: the reef is a sponge. A mottled chalky ground,
// then holes eaten into it — each a dark socket with a bright lower lip, which is what makes it read as coral
// rather than masonry. Nothing is pinned to the tile edges, so the variants shuffle together in any order.
function coralBody(g, rnd, base, lite, dark) {
  const B = base || CR.m, LT = lite || CR.l, DK = dark || CR.d;
  rect(g, 0, 0, T, T, B);
  // broad soft blotches, dithered at their rims so the stone reads chalky rather than speckled
  for (let i = 0; i < 5; i++) {
    const cx = rnd() * T, cy = rnd() * T, r = 2.4 + rnd() * 3.2, ry = r * (0.6 + rnd() * 0.5), col = rnd() < 0.5 ? LT : DK;
    ellipse(g, cx, cy, r, ry, col, B);
    ellipse(g, cx, cy, r * 0.6, ry * 0.6, col);
  }
  // holes eaten into the rock: a dark socket with a lit lower lip
  for (let i = 0; i < 5; i++) {
    const x = 1 + ((rnd() * 14) | 0), y = 1 + ((rnd() * 14) | 0);
    px(g, x, y, CR.pit);
    if (rnd() < 0.35) { px(g, x + 1, y, CR.pit); px(g, x, y + 1, LT); px(g, x + 1, y + 1, LT); }
    else px(g, x, y + 1, LT);
  }
  // vermiculation: the short grooves worn into a coral head, cut dark with a pale lip under them
  for (let i = 0; i < 2; i++) {
    let x = 1 + ((rnd() * 12) | 0), y = 2 + ((rnd() * 12) | 0); const dir = rnd() < 0.5 ? -1 : 1, n = 2 + ((rnd() * 3) | 0);
    for (let k = 0; k < n && x > 0 && x < T - 1 && y < T - 1; k++) {
      px(g, x, y, CR.deep); px(g, x, y + 1, LT);
      x += dir; if (k === 1) y += rnd() < 0.5 ? 1 : 0;
    }
  }
  for (let i = 0; i < 5; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, DK);
}

// A barnacle: a pale ring with a dark mouth in it and a shadow under it. They grow in twos and threes.
function barnacles(g, rnd, x, y, n) {
  n = n || 1 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const bx = x + i * 2 + ((rnd() * 2) | 0) - 1, by = y + ((rnd() * 2) | 0);
    px(g, bx, by, BARN[0]); px(g, bx + 1, by, BARN[1]);
    px(g, bx, by + 1, BARN[1]); px(g, bx + 1, by + 1, BARN[2]);
  }
}

// A tuft of weed hanging off a lip: a dark green head and a strand or two trailing down.
function weedFringe(g, rnd, x, y, len) {
  px(g, x, y, rnd() < 0.4 ? WEED[3] : WEED[0]);
  for (let i = 1; i < len; i++) {
    const col = i < 2 ? WEED[0] : i < len - 1 ? WEED[1] : WEED[2];
    px(g, x + (i > 2 && rnd() < 0.4 ? 1 : 0), y + i, col);
  }
}

// The open side of a solid coral tile. The storm light comes straight down, so both faces sit in shade: a dark
// rim, the rock behind it a step deeper, holes punched through, a shelf or two jutting out with its lit top, and
// weed or barnacles clinging where the water runs.
function coralFace(g, rnd, x0, dir, y0) {
  const x1 = x0 + dir;
  for (let y = y0; y < T; y++) {
    px(g, x0, y, (y & 1) ? CR.crack : CR.pit);
    px(g, x1, y, (y & 3) === 1 ? CR.d : CR.deep);
  }
  const ns = 1 + (rnd() < 0.6 ? 1 : 0);
  for (let k = 0; k < ns; k++) {
    const y = y0 + 1 + ((rnd() * Math.max(1, T - y0 - 3)) | 0), wd = 2 + ((rnd() * 2) | 0);
    for (let i = 0; i < wd; i++) { px(g, x0 + i * dir, y, CR.hi); px(g, x0 + i * dir, y + 1, CR.pit); }
    if (y - 1 >= y0) px(g, x0, y - 1, CR.crack);
  }
  for (let k = 0; k < 3; k++) { const y = y0 + ((rnd() * Math.max(1, T - y0)) | 0); if (rnd() < 0.6) px(g, x1 + dir, y, CR.pit); }
  if (rnd() < 0.6) barnacles(g, rnd, x0 + dir * 2, Math.min(T - 3, y0 + 1 + ((rnd() * 8) | 0)), 1 + ((rnd() * 2) | 0));
  if (rnd() < 0.5) weedFringe(g, rnd, x0 + dir, Math.min(T - 4, y0 + 2 + ((rnd() * 6) | 0)), 2 + ((rnd() * 3) | 0));
}

// The walking surface of the reef: a crown of coral over the limestone. The crust is bumpy — rounded nubs of
// bone with dark sockets between them, polyp pores all through it, barnacle clusters, weed slicked over it and
// trailing off the lip. An open side has its shoulder worn round and a face below it.
function reefTop(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  coralBody(g, rnd);
  // crust depth per column: 3 at the tile edges so neighbours meet, 2..5 between, humped where a head grew
  const cd = new Array(T).fill(3);
  const nb = 2 + (rnd() < 0.6 ? 1 : 0);
  for (let k = 0; k < nb; k++) {
    const cx = 2 + rnd() * 12, r = 2 + rnd() * 3, amp = rnd() < 0.72 ? 2 : -1;
    for (let x = 1; x < T - 1; x++) { const d = (x + 0.5 - cx) / r; if (Math.abs(d) < 1) cd[x] = Math.max(2, Math.min(5, cd[x] + Math.round(amp * (1 - d * d)))); }
  }
  const weed = new Array(T).fill(false);
  const nw = rnd() < 0.8 ? 1 + (rnd() < 0.4 ? 1 : 0) : 0;
  for (let k = 0; k < nw; k++) { const wx = (rnd() * 13) | 0, ww = 2 + ((rnd() * 5) | 0); for (let x = wx; x < Math.min(T, wx + ww); x++) weed[x] = true; }
  for (let x = 0; x < T; x++) {
    const d = cd[x];
    for (let y = 0; y < d; y++) {
      let col;
      if (weed[x]) col = y === 0 ? (rnd() < 0.4 ? WEED[3] : WEED[0]) : y === d - 1 ? WEED[2] : (((x + y) & 1) ? WEED[1] : WEED[0]);
      else col = y === 0 ? (rnd() < 0.3 ? BONE[0] : CR.hi) : y === d - 1 ? BONE[2] : (rnd() < 0.16 ? BONE[2] : rnd() < 0.2 ? BONE[0] : BONE[1]);
      px(g, x, y, col);
    }
    // the pores of the coral, and the dark line where the crust meets the rock
    if (!weed[x] && d > 2 && rnd() < 0.3) px(g, x, 1 + ((rnd() * (d - 1)) | 0), BONE[2]);
    px(g, x, d, CR.crack);
    if ((x + d) & 1) px(g, x, d + 1, CR.deep);
    if (weed[x] && rnd() < 0.35) weedFringe(g, rnd, x, d, 2 + ((rnd() * 3) | 0));
  }
  // nubs: where the crust humps up it is a head of coral — bright on the crown, a dark cleft either side of it
  for (let x = 2; x < T - 3; x++) {
    if (weed[x] || weed[x + 1] || cd[x] < 4) continue;
    if (cd[x] < cd[x - 1] || cd[x] < cd[x + 2] || rnd() < 0.2) continue;
    px(g, x - 1, 0, CR.crack); px(g, x, 0, BONE[0]); px(g, x + 1, 0, BONE[0]); px(g, x + 2, 0, CR.crack);
    px(g, x, 1, BONE[1]); px(g, x + 1, 1, BONE[2]);
    x += 3;
  }
  if (rnd() < 0.6) barnacles(g, rnd, 2 + ((rnd() * 10) | 0), cd[6] + 1 + ((rnd() * 3) | 0), 2);
  if (rnd() < 0.3) barnacles(g, rnd, 3 + ((rnd() * 9) | 0), 0, 2);
  const side = (x0, dir) => {
    g.clearRect(x0, 0, 1, 1);
    const deep = 3 + ((rnd() * 3) | 0);
    for (let y = 1; y <= deep; y++) {
      const wd = y < 3 ? 2 : y < deep - 1 ? 1 : (rnd() < 0.5 ? 1 : 0);
      for (let i = 0; i < wd; i++) {
        const x = x0 + i * dir, wd2 = weed[x0 + dir];
        px(g, x, y, wd2 ? (i === 0 ? WEED[1] : WEED[0]) : (i === 0 ? BONE[2] : BONE[1]));
      }
    }
    coralFace(g, rnd, x0, dir, deep + 1);
  };
  if (eL) side(0, 1);
  if (eR) side(T - 1, -1);
  return c;
}

// Below the surface with an open side: a wall of eaten limestone.
function reefEdge(seed, eL, eR) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  coralBody(g, rnd);
  if (eL) coralFace(g, rnd, 0, 1, 0);
  if (eR) coralFace(g, rnd, T - 1, -1, 0);
  return c;
}

// The rock under the reef: the same limestone a shade darker and far more eaten, with the cast of a shell set in
// it and now and then a fissure the water has opened.
function reefFill(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  coralBody(g, rnd, CR.d, CR.m, CR.deep);
  for (let i = 0; i < 10; i++) {
    const x = 1 + ((rnd() * 14) | 0), y = 1 + ((rnd() * 14) | 0);
    px(g, x, y, CR.pit); if (rnd() < 0.5) px(g, x, y + 1, CR.deep);
  }
  if (rnd() < 0.6) {
    // a shell turned to stone: a little spiral of pale chalk
    const x = 3 + ((rnd() * 9) | 0), y = 3 + ((rnd() * 9) | 0);
    px(g, x, y, BONE[1]); px(g, x + 1, y, BONE[0]); px(g, x + 2, y, BONE[1]);
    px(g, x, y + 1, BONE[0]); px(g, x + 2, y + 1, BONE[2]); px(g, x + 1, y + 2, BONE[1]);
    px(g, x + 1, y + 1, CR.crack);
  }
  if (rnd() < 0.45) {
    let x = 2 + ((rnd() * 11) | 0), y = 1 + ((rnd() * 6) | 0); const dir = rnd() < 0.5 ? -1 : 1;
    for (let k = 0; k < 6 && y < T - 1; k++) { px(g, x, y, CR.crack); px(g, x + 1, y, CR.deep); y++; if (k & 1) x += dir; }
  }
  for (let i = 0; i < 4; i++) if (rnd() < 0.4) { const x = (rnd() * T) | 0, y = (rnd() * T) | 0; px(g, x, y, WEED[2]); }
  return c;
}

// Under water: dark sand with shell grit in it. The ripple is the same in every variant so a pool floor runs
// seamlessly; only the grit, the shells and the weed change.
function reefSilt(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, SILT[0]);
  for (let i = 0; i < 26; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? SILT[2] : SILT[1]);
  for (let r = 0; r < 4; r++) {
    const yb = 3 + r * 4;
    for (let x = 0; x < T; x++) {
      const y = yb + Math.round(Math.sin((x / T) * Math.PI * 2 + r * 1.9));
      if (y < T) px(g, x, y, SILT[2]);
      if (y + 1 < T) px(g, x, y + 1, SILT[0]);
    }
  }
  rect(g, 0, 0, T, 1, SILT[2]);
  // shell grit: chips of broken bone-white shell lying in the sand
  for (let i = 0; i < 7; i++) { const x = (rnd() * T) | 0, y = 1 + ((rnd() * 15) | 0); px(g, x, y, rnd() < 0.5 ? BONE[2] : BONE[1]); if (rnd() < 0.3) px(g, x + 1, y, BONE[2]); }
  if (rnd() < 0.75) {
    const x = 1 + ((rnd() * 11) | 0), y = 3 + ((rnd() * 9) | 0);
    px(g, x + 1, y, BONE[0]); px(g, x, y + 1, BONE[1]); px(g, x + 1, y + 1, BONE[0]); px(g, x + 2, y + 1, BONE[1]); px(g, x + 1, y + 2, BONE[2]);
  }
  if (rnd() < 0.5) { const x = 2 + ((rnd() * 11) | 0), y = 5 + ((rnd() * 9) | 0); px(g, x, y, CR.deep); px(g, x + 1, y, CR.d); px(g, x, y + 1, CR.crack); }
  if (rnd() < 0.45) { const x = 2 + ((rnd() * 11) | 0), y = 7 + ((rnd() * 7) | 0); px(g, x, y, WEED[1]); px(g, x + 1, y - 1, WEED[0]); px(g, x + 2, y - 1, WEED[2]); }
  return c;
}

// The surf zone: the same reef with the sea washing over it. Darker and glossy — weed slicked flat across the
// crown, a film of water on it catching the one pale thing in the sky, strands dragged down the lip.
function reefWet(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  coralBody(g, rnd, CR.deep, CR.d, CR.crack);
  for (let y = 2; y < 9; y++) for (let x = 0; x < T; x++) if (((x + y) & 1) && rnd() < 0.85 - y * 0.09) px(g, x, y, CR.deep);
  for (let x = 0; x < T; x++) { px(g, x, 0, WEED[1]); px(g, x, 1, WEED[2]); px(g, x, 2, (x & 1) ? CR.crack : WEED[2]); }
  // the film of water on the crown
  let x = (rnd() * 4) | 0;
  while (x < T) {
    const n = 2 + ((rnd() * 4) | 0);
    for (let i = 0; i < n && x + i < T; i++) { px(g, x + i, 0, i === 1 ? FOAM : SEA[3]); if (rnd() < 0.45) px(g, x + i, 1, SEA[2]); }
    x += n + 2 + ((rnd() * 4) | 0);
  }
  // weed slicked over the crown, strands dragged over the lip
  const nm = 1 + (rnd() < 0.7 ? 1 : 0);
  for (let k = 0; k < nm; k++) {
    const mx = (rnd() * 12) | 0, mw = 3 + ((rnd() * 4) | 0);
    for (let i = 0; i < mw && mx + i < T; i++) {
      const xx = mx + i;
      px(g, xx, 0, rnd() < 0.3 ? WEED[3] : WEED[0]); px(g, xx, 1, WEED[0]); px(g, xx, 2, (xx & 1) ? WEED[2] : WEED[1]);
      if (rnd() < 0.5) { const L = 1 + ((rnd() * 4) | 0); for (let j = 0; j < L; j++) px(g, xx, 3 + j, WEED[2]); if (rnd() < 0.45) px(g, xx, 3 + L, SEA[3]); }
    }
  }
  if (rnd() < 0.6) barnacles(g, rnd, 2 + ((rnd() * 10) | 0), 3 + ((rnd() * 4) | 0), 2);
  return c;
}

// ---------- ship timber tiles ----------
// The wrecks are the same solid tile in a second skin. Plank courses run across the tile with caulk in the seam
// at rows 3, 7, 11 and 15 — a pitch of 4 that divides 16, so the timbers tile in both directions and a hull can
// be any size. Bolt heads sit in the middle of a plank (rows 1, 5, 9, 13) on the frame lines.

// An iron bolt head, 2x2, with a rust streak weeping out of it.
function bolt(g, rnd, x, y) {
  px(g, x, y, IRON.m); px(g, x + 1, y, IRON.l);
  px(g, x, y + 1, IRON.d); px(g, x + 1, y + 1, IRON.m);
  if (rnd() < 0.55) { px(g, x, y + 2, IRON.rust); if (rnd() < 0.5) px(g, x + 1, y + 2, '#5e3a22'); }
}

// Planking from row y0 down: tar-black courses, caulk in the seams, grain, bolts on the frames, a butt joint, a
// patch gone soft and pale with rot, a crust of barnacles, and sometimes a brass fitting gone green.
function timberBody(g, rnd, y0) {
  for (let y = y0; y < T; y++) {
    const k = y & 3, col = k === 3 ? TIM.caulk : k === 0 ? TIM.l : k === 1 ? TIM.m : TIM.d;
    rect(g, 0, y, T, 1, col);
  }
  for (let i = 0; i < 8; i++) {
    const x = (rnd() * 13) | 0, y = y0 + ((rnd() * (T - y0)) | 0);
    if ((y & 3) === 3) continue;
    rect(g, x, y, 2 + ((rnd() * 3) | 0), 1, rnd() < 0.45 ? TIM.hi : TIM.d);
  }
  // tar bled out of the seams and dried in streaks down the plank below
  for (let i = 0; i < 3; i++) { const x = (rnd() * T) | 0, y = y0 + ((rnd() * (T - y0)) | 0); px(g, x, y, TIM.caulk); if (rnd() < 0.5) px(g, x, y + 1, TIM.caulk); }
  for (const bx of [2, 10]) for (let y = 1; y < T; y += 4) if (y >= y0 + 1 && rnd() < 0.62) bolt(g, rnd, bx + ((rnd() * 2) | 0), y);
  // a butt joint: the end of one plank against the next, caulked
  if (rnd() < 0.55) {
    const jx = 4 + ((rnd() * 8) | 0), jy = y0 + ((rnd() * (T - y0 - 2)) | 0), top = jy - (jy & 3), bot = Math.min(T - 1, top + 3);
    for (let y = Math.max(y0, top); y <= bot; y++) { px(g, jx, y, TIM.caulk); if ((y & 3) !== 3) px(g, jx + 1, y, TIM.hi); }
  }
  // rot: a patch where the sea has eaten the wood soft and pale
  if (rnd() < 0.6) {
    const cx = 2 + rnd() * 12, cy = y0 + rnd() * (T - y0), r = 1.6 + rnd() * 2.2;
    ellipse(g, cx, cy, r, r * 0.7, TIM.rot, TIM.m);
    ellipse(g, cx, cy, r * 0.5, r * 0.35, '#5d5840', TIM.rot);
  }
  // barnacle crust: it grows along a seam, where the water sits, not all over her
  if (rnd() < 0.8) {
    const sy = Math.max(y0 + 1, 3 + 4 * ((rnd() * 3) | 0)), sx = 1 + ((rnd() * 9) | 0);
    barnacles(g, rnd, sx, sy, 2 + ((rnd() * 2) | 0));
    if (rnd() < 0.5) barnacles(g, rnd, sx + 5 + ((rnd() * 3) | 0), sy + (rnd() < 0.5 ? 0 : 1), 1);
  }
  if (rnd() < 0.5) weedFringe(g, rnd, 1 + ((rnd() * 13) | 0), Math.max(y0, 1 + ((rnd() * 11) | 0)), 2 + ((rnd() * 3) | 0));
  // a fitting of elven brass, long since gone to verdigris
  if (rnd() < 0.3) {
    const fx = 3 + ((rnd() * 8) | 0), fy = y0 + 2 + ((rnd() * Math.max(1, T - y0 - 5)) | 0);
    rect(g, fx, fy, 4, 2, VERD[0]); rect(g, fx, fy, 4, 1, VERD[1]); px(g, fx + 3, fy + 1, '#2d5a49');
    if (rnd() < 0.5) px(g, fx + 1, fy + 2, VERD[0]);
  }
}

// Hull planking: the body of a wreck, seen side on.
function hullTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  timberBody(g, rnd, 0);
  // an iron strap band across the planks, now and then
  if (rnd() < 0.28) {
    const sy = 1 + 4 * ((rnd() * 3) | 0);
    rect(g, 0, sy, T, 2, IRON.d); rect(g, 0, sy, T, 1, IRON.m);
    for (let x = 1; x < T; x += 5) px(g, x, sy, IRON.l);
    for (let x = 0; x < T; x++) if (rnd() < 0.3) px(g, x, sy + 1, IRON.rust);
  }
  return c;
}

// A deck you walk on: the worn top edge of the boards (rows 0-4, bleached grey by the weather and washed by the
// sea), the caulked gaps between them running back into the ship, nails, weed and barnacle crust along the edge;
// under it the hull planking picks up again at row 5 so hullTop sits straight on top of hull.
function hullTopTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  timberBody(g, rnd, 5);
  rect(g, 0, 0, T, 5, DECK[1]);
  rect(g, 0, 0, T, 1, DECK[0]); rect(g, 0, 3, T, 1, DECK[2]); rect(g, 0, 4, T, 1, TIM.caulk);
  for (let i = 0; i < 8; i++) { const x = (rnd() * 14) | 0, y = 1 + ((rnd() * 2) | 0); rect(g, x, y, 2 + ((rnd() * 3) | 0), 1, rnd() < 0.5 ? DECK[0] : DECK[2]); }
  // the gaps between the deck boards, caulked with tar
  let gx = 1 + ((rnd() * 4) | 0);
  while (gx < T) { for (let y = 0; y < 4; y++) px(g, gx, y, y === 0 ? '#514a3c' : TIM.caulk); if (rnd() < 0.6) px(g, gx + 1, 0, DECK[0]); gx += 4 + ((rnd() * 3) | 0); }
  for (let i = 0; i < 2; i++) if (rnd() < 0.7) { const x = 2 + ((rnd() * 12) | 0); px(g, x, 1, IRON.l); px(g, x, 2, IRON.d); }
  // the sea has been over it: weed in the seams, barnacles along the lip, salt dried white
  if (rnd() < 0.8) { const wx = 1 + ((rnd() * 12) | 0), ww = 2 + ((rnd() * 4) | 0); for (let i = 0; i < ww && wx + i < T; i++) { px(g, wx + i, 0, (i & 1) ? WEED[0] : WEED[1]); if (rnd() < 0.5) px(g, wx + i, 1, WEED[2]); } }
  if (rnd() < 0.7) barnacles(g, rnd, 2 + ((rnd() * 11) | 0), 1 + ((rnd() * 2) | 0), 1 + ((rnd() * 2) | 0));
  for (let i = 0; i < 2; i++) if (rnd() < 0.5) px(g, (rnd() * T) | 0, 0, BONE[1]);
  // a board sprung loose, splintered where it broke
  if (rnd() < 0.35) {
    const bx = 3 + ((rnd() * 9) | 0);
    rect(g, bx, 0, 3, 1, TIM.caulk); px(g, bx + 1, 1, DECK[2]); px(g, bx, 1, '#2c2620'); px(g, bx + 2, 1, DECK[0]);
  }
  return c;
}

// A one-way platform: a broken spar, or a plank off a deck, with a rope run along under it. Five rows of board
// you can stand on and daylight below. The rope is pinned to row 8 at both tile edges and sags between, so a run
// of them reads as one rope; `end` 'L'/'R' are the broken ends, where the rope is whipped off round the timber.
function sparLedge(seed, end, v = 0) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const x0 = end === 'L' ? 2 : 0, x1 = end === 'R' ? T - 2 : T, w = x1 - x0;
  // the rope under the board
  const ry = x => 8 + Math.round(2.2 * Math.sin(Math.PI * ((x + 0.5) / T)));
  const rx0 = end === 'L' ? 3 : 0, rx1 = end === 'R' ? T - 3 : T;
  for (let x = rx0; x < rx1; x++) {
    const y = ry(x);
    px(g, x, y, (x & 1) ? ROPE[0] : ROPE[1]);
    px(g, x, y + 1, ROPE[2]);
  }
  if (!end && v === 0) {
    // an iron ring bolted through the spar, the rope rove through it
    rect(g, 6, 6, 2, 2, IRON.d); px(g, 6, 6, IRON.m);
    px(g, 5, 8, IRON.m); px(g, 6, 8, IRON.l); px(g, 7, 8, IRON.m); px(g, 6, 9, IRON.d);
  }
  if (!end && v === 1) {
    // a frond of kelp caught on the rope and left hanging
    const kx = 5 + ((rnd() * 5) | 0);
    for (let k = 0; k < 6; k++) px(g, kx + (k > 2 ? 1 : 0), 9 + k, k < 2 ? WEED[0] : k < 4 ? WEED[1] : WEED[2]);
    px(g, kx - 1, 10, WEED[0]); px(g, kx + 2, 12, WEED[1]);
  }
  if (!end && v === 2) {
    // a block and a shackle swinging off a whipping of rope
    const bx = 9;
    rect(g, bx, 10, 1, 3, ROPE[1]);
    rect(g, bx - 1, 13, 3, 2, TIM.l); px(g, bx - 1, 13, TIM.hi); px(g, bx + 1, 14, TIM.caulk); px(g, bx, 14, IRON.m);
  }
  // the board
  rect(g, x0, 0, w, 5, TIM.l);
  rect(g, x0, 0, w, 1, DECK[0]); rect(g, x0, 1, w, 1, DECK[1]); rect(g, x0, 3, w, 1, TIM.d); rect(g, x0, 4, w, 1, TIM.caulk);
  for (let i = 0; i < 5; i++) rect(g, x0 + ((rnd() * Math.max(1, w - 3)) | 0), 1 + ((rnd() * 2) | 0), 2 + ((rnd() * 4) | 0), 1, rnd() < 0.5 ? DECK[2] : TIM.hi);
  for (let i = 0; i < 3; i++) if (rnd() < 0.6) px(g, x0 + ((rnd() * w) | 0), 0, BONE[1]);
  if (rnd() < 0.6) { const kx = x0 + 2 + ((rnd() * Math.max(1, w - 5)) | 0); px(g, kx, 2, TIM.caulk); px(g, kx + 1, 2, TIM.hi); px(g, kx + 1, 3, TIM.caulk); }
  if (rnd() < 0.7) { const bx = x0 + 1 + ((rnd() * Math.max(1, w - 3)) | 0); px(g, bx, 1, IRON.l); px(g, bx, 2, IRON.d); }
  // the sea's mark on the underside: barnacle crust along row 4-5 and weed trailing off it
  for (let k = 0; k < 2; k++) if (rnd() < 0.7) barnacles(g, rnd, x0 + 1 + ((rnd() * Math.max(1, w - 3)) | 0), 5, 1 + ((rnd() * 2) | 0));
  if (rnd() < 0.8) weedFringe(g, rnd, x0 + 1 + ((rnd() * Math.max(1, w - 2)) | 0), 5, 2 + ((rnd() * 4) | 0));
  if (rnd() < 0.5) { const wx = x0 + 1 + ((rnd() * Math.max(1, w - 2)) | 0); px(g, wx, 0, WEED[0]); px(g, wx, 1, WEED[2]); }
  if (end) {
    // a broken end: the timber splintered off, the rope whipped round the stump
    const ex = end === 'L' ? 2 : T - 3, dir = end === 'L' ? -1 : 1;
    px(g, ex, 0, TIM.caulk); px(g, ex + dir, 1, TIM.hi); px(g, ex + dir, 2, TIM.d); px(g, ex, 3, TIM.caulk);
    px(g, ex + dir * 2, 2, TIM.caulk);
    rect(g, ex, 5, 1, 3, ROPE[1]); px(g, ex, 5, ROPE[0]); px(g, ex, 8, ROPE[2]);
    px(g, ex + dir, 6, ROPE[0]); px(g, ex + dir, 7, ROPE[2]);
    for (let k = 0; k < 3; k++) px(g, ex + dir, 9 + k, k === 2 ? ROPE[2] : ROPE[1]);
  }
  return c;
}

export function bakeReefTiles() {
  const top = {}, edge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    const k = eL + '' + eR;
    top[k] = [0, 1, 2, 3].map(i => reefTop(3100 + i + eL * 7 + eR * 13, eL, eR));
    if (eL || eR) edge[k] = [0, 1].map(i => reefEdge(3200 + i + eL * 3 + eR * 5, eL, eR));
  }
  return {
    top, edge,
    fill: [0, 1, 2, 3].map(i => reefFill(3300 + i)),
    silt: [0, 1, 2].map(i => reefSilt(3400 + i)),
    ledge: [0, 1, 2].map(i => sparLedge(3500 + i, null, i)), ledgeL: sparLedge(3510, 'L'), ledgeR: sparLedge(3511, 'R'),
    wet: [0, 1, 2].map(i => reefWet(3600 + i)),
    hull: [0, 1, 2, 3].map(i => hullTile(3700 + i)),
    hullTop: [0, 1, 2, 3].map(i => hullTopTile(3800 + i)),
  };
}

// ---------- background layers ----------

// The storm: a low heavy sky, slate green-grey, the weight of it up top and the only light down at the horizon
// where the rain is thinner. Stepped bands, like the other skies.
export function bakeSkyStorm(h) {
  const [c, g] = canvas(1, h);
  const st = [[0, [38, 48, 52]], [0.22, [54, 66, 68]], [0.44, [74, 88, 86]], [0.64, [100, 114, 108]], [0.82, [136, 148, 138]], [1, [172, 182, 168]]];
  for (let y = 0; y < h; y++) {
    const q = Math.round((y / Math.max(1, h - 1)) * 11) / 11;
    let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
    const [t0, a] = st[i], [t1, b] = st[i + 1], k = Math.min(1, Math.max(0, (q - t0) / (t1 - t0)));
    px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')');
  }
  return c;
}

// Horizontal bands of colour from row y0 to y1 across the width; at each change of band one row is checkered and
// the next lightly peppered, so the sea deepens in 16-bit steps rather than a smear. (Same helper as lw_tiles.)
function bands(g, w, y0, y1, cols, cuts) {
  const n = y1 - y0, at = r => { const t = r / n; let i = 0; while (i < cuts.length && t >= cuts[i]) i++; return i; };
  for (let r = 0; r < n; r++) {
    const i = at(r), j = at(r + 1), p = r > 0 ? at(r - 1) : i, y = y0 + r;
    if (j !== i) { for (let x = 0; x < w; x++) px(g, x, y, ((x + y) & 1) ? cols[j] : cols[i]); }
    else { rect(g, 0, y, w, 1, cols[i]); if (p !== i) for (let x = 0; x < w; x++) if (((x + 2 * y) & 3) === 0) px(g, x, y, cols[p]); }
  }
}

// A storm petrel working the troughs: 'M' gliding or 'V' with the wings up.
function petrel(g, w, x, y, up, col) {
  const pts = up ? [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]] : [[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]];
  for (const [a, b] of pts) px(g, (((x + a) % w) + w) % w, y + b, col);
}

// The far distance: the open sea, hard against a flat horizon, and three of the tribute fleet's great ships lying
// over on the outer reef in the rain haze, with a sweep of breaking white water along the crest.
// Horizon row = round(h * 0.44) — row 40 for h = 90. Everything from that row down is fully opaque sea; above it
// the layer is transparent apart from the wrecks and a few rows of rain haze sitting on the horizon. Tiles
// horizontally.
export function bakeFarReef(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const H0 = Math.round(h * 0.44), D = h - H0, S = w / 320;
  const wrap = x => ((Math.round(x) % w) + w) % w;
  bands(g, w, H0, h, [HAZE, '#4c7068', '#2e5358', SEA[1], SEA[0]], [2 / D, 0.3, 0.62, 0.9]);
  const lighter = y => { const t = (y - H0) / D; return t < 0.3 ? '#5c7f76' : t < 0.62 ? '#3a6065' : t < 0.9 ? '#204049' : '#16272c'; };
  const darker = y => { const t = (y - H0) / D; return t < 0.3 ? '#2e5358' : t < 0.62 ? SEA[1] : SEA[0]; };
  // swell: dashes a step off the water they lie on, longer and sparser toward us
  for (let y = H0 + 3; y < h; y++) {
    const r = y - H0, n = Math.round(w / (8 + r * 0.3));
    for (let i = 0; i < n; i++) {
      const x = (rnd() * w) | 0, len = 1 + ((r / 8) | 0) + (rnd() < 0.3 ? 1 : 0);
      for (let k = 0; k < len; k++) px(g, (x + k) % w, y, lighter(y));
      if (r > 7 && rnd() < 0.5) for (let k = 0; k < len; k++) px(g, (x + k + 1) % w, y + 1, darker(y + 1));
    }
  }
  // the wrecks: hulls heeled right over on the reef, masts down at an angle, ribs open to the weather. Flat
  // silhouettes in the haze, a shade lighter along their upper edge.
  // a great ship lying over on the outer reef: her back broken amidships, the two halves settled at different
  // angles, the sheer of each still readable, ribs standing out of the break, her masts raked hard over.
  const wreck = (x0, len, ht, heel, col, colL) => {
    const water = H0 + 1, split = 0.42 + rnd() * 0.16, gap = 2 + ((rnd() * 2) | 0);
    const deck = new Array(len).fill(water);
    const drawn = new Array(len).fill(false);
    const tilt = [heel * 0.5, -heel];
    for (let i = 0; i < len; i++) {
      const u = i / (len - 1), half = u < split ? 0 : 1;
      const si = half ? (u - split) / (1 - split) : u / split;
      if (Math.abs(i - Math.round(split * len)) < gap) continue;
      // the sheer: low amidships of each half, lifted where the stem and the sternpost were
      const rise = ht * (0.42 + 0.58 * Math.pow(Math.abs(si - 0.5) * 2, 1.7));
      const sink = Math.round(tilt[half] * (si - 0.5) * 2) + (half ? Math.round(ht * 0.18) : 0);
      const topY = water + sink - Math.round(rise);
      deck[i] = topY; drawn[i] = true;
      for (let y = topY; y <= water + Math.max(0, sink); y++) px(g, wrap(x0 + i), y, y <= topY + 1 ? colL : col);
    }
    // the frames standing bare either side of the break, and a couple further along where the planking went
    for (let i = 2; i < len - 2; i++) {
      if (!drawn[i]) continue;
      const nearBreak = Math.abs(i - split * len) < gap + 6;
      if (!(nearBreak ? rnd() < 0.45 : rnd() < 0.08)) continue;
      const rh = 2 + ((rnd() * (nearBreak ? ht * 0.7 : ht * 0.3)) | 0);
      for (let k = 0; k < rh; k++) px(g, wrap(x0 + i), deck[i] - 1 - k, col);
    }
    // what is left of her masts, gone over with the hull
    const nm = 2;
    for (let k = 0; k < nm; k++) {
      const mi = Math.round(len * (0.22 + 0.45 * k + rnd() * 0.08));
      if (!drawn[mi]) continue;
      const mh = Math.round(ht * (1.4 + rnd() * 1.1)), rake = (k ? 1 : -1) * (0.35 + rnd() * 0.4);
      for (let j = 0; j < mh; j++) { const xx = wrap(x0 + mi + j * rake), yy = deck[mi] - j; if (yy > 0) px(g, xx, yy, j > mh - 3 ? colL : col); }
      // a yard still across her, slewed round
      const yj = Math.round(mh * (0.45 + rnd() * 0.3)), yy = deck[mi] - yj, yx = x0 + mi + yj * rake, ylen = 3 + ((rnd() * 5) | 0);
      for (let j = -ylen; j <= ylen; j++) px(g, wrap(yx + j), yy + Math.round(j * 0.35), col);
    }
    // foam working at her where she lies in the water
    for (let i = 0; i < len; i++) if (drawn[i] && rnd() < 0.45) px(g, wrap(x0 + i), water + 1 + ((rnd() * 2) | 0), rnd() < 0.5 ? FOAM_D : HAZE);
  };
  // rain haze on the horizon: the wrecks' feet go into it
  for (let y = H0 - 6; y < H0; y++) for (let x = 0; x < w; x++) if (((x + y) & 1) || y > H0 - 3) px(g, x, y, 'rgba(150,162,154,' + (0.1 + (y - (H0 - 6)) * 0.035).toFixed(3) + ')');
  wreck(Math.round(26 * S + rnd() * 14), Math.round(54 * S), 13, 5, '#5b6a66', '#6c7a74');
  wreck(Math.round(152 * S + rnd() * 14), Math.round(38 * S), 9, -4, '#62716c', '#74827c');
  wreck(Math.round(236 * S + rnd() * 12), Math.round(30 * S), 7, 3, '#68766f', '#7a8780');
  // the breaking water along the reef crest: a sweep of white that thins and gathers as it runs
  for (let k = 0; k < 2; k++) {
    const y0 = H0 + 5 + k * 7, amp = 2 + k;
    const crest = x => { const u = x / w * Math.PI * 2; return y0 + Math.round(amp * Math.sin(u * 2 + k * 2.1) + 1.5 * Math.sin(u * 7 + k)); };
    let x = 0;
    while (x < w) {
      const u = x / w * Math.PI * 2, heavy = 0.5 + 0.5 * Math.sin(u * 3 + k * 1.7);
      if (rnd() < 0.1 + 0.36 * heavy) {
        const run = 2 + ((rnd() * (1 + heavy * 5)) | 0);
        for (let i = 0; i < run && x + i < w; i++) {
          const y = crest(x + i);
          px(g, x + i, y, rnd() < 0.6 ? FOAM : FOAM_D);
          if (rnd() < 0.25) px(g, x + i, y + 1, FOAM_D);
        }
        x += run + 3 + ((rnd() * 11) | 0);
      } else x += 3 + ((rnd() * 9) | 0);
    }
  }
  for (let i = 0; i < 3; i++) petrel(g, w, (rnd() * w) | 0, H0 - 10 - ((rnd() * 14) | 0), rnd() < 0.5, '#4a5450');
  return c;
}

// The mid distance: the reef closer in, with the nearer wrecks on it — a hull broken open with its frames
// standing like a ribcage, a mast still up and leaning with its rigging torn away, the transom of a third ship
// half buried, and coral heads breaking the surface in the white water.
// Waterline row = round(h * 0.72) — row 101 for h = 140. Everything from that row down is fully opaque sea, so
// the layer holds up on its own if the far layer is switched off; above it, transparent apart from the wrecks.
// Laid out for 480 wide (scales with w). Tiles horizontally.
export function bakeMidWrecks(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const W = Math.round(h * 0.72), S = w / 480;
  const wrap = x => ((Math.round(x) % w) + w) % w;
  const M = { hull: '#322d29', hullL: '#433c34', hullD: '#211d1a', rib: '#3b342c', ribL: '#50473c', iron: '#3e4246', coral: '#8b968a', coralL: '#b3bcac', coralD: '#66705f', cloth: '#9b9a8a', clothD: '#6f6e5c', rope: '#5e5744', verd: '#47806a' };
  bands(g, w, W, h, ['#57786f', '#2e5358', SEA[1], SEA[0]], [0.07, 0.38, 0.8]);
  for (let y = W + 2; y < h; y++) {
    const r = y - W, n = Math.round(w / (12 + r * 0.35));
    for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 2 + ((r / 6) | 0) + (rnd() < 0.3 ? 1 : 0), col = r < 10 ? '#3a6065' : r < 22 ? '#24454c' : SEA[1]; for (let k = 0; k < len; k++) px(g, (x + k) % w, y, col); }
  }
  // foam and a broken reflection under anything that stands in the water
  const standsIn = (x, wd) => {
    for (let i = 0; i < wd; i++) {
      const xx = wrap(x + i);
      if (i % 3) px(g, xx, W, FOAM); else px(g, xx, W, FOAM_D);
      if (rnd() < 0.45) px(g, xx, W + 1, FOAM_D);
      for (let y = W + 2; y < W + 7 && y < h; y++) if (((xx + y) & 1) && rnd() < 0.7 - (y - W) * 0.1) px(g, xx, y, '#234a4e');
    }
  };
  // a coral head breaking the surface: a pale rounded mass with a dark hollow core and foam round its foot
  const coralHead = (x, r) => {
    const base = W + 1;
    // two or three lobes grown into one another, not a bubble
    for (const [ox, oy, k] of [[-r * 0.5, 0, 0.72], [r * 0.55, r * 0.1, 0.66], [0, -r * 0.1, 1]]) {
      ellipse(g, x + ox, base + oy, r * k, r * k * (0.6 + rnd() * 0.35), M.coral, M.coralD);
    }
    ellipse(g, x - r * 0.15, base - r * 0.35, r * 0.6, r * 0.4, M.coralL, M.coral);
    for (let k = 0; k < r * 1.2; k++) { const a = -Math.PI * (0.1 + rnd() * 0.8), d = 0.6 + rnd() * 0.5; px(g, wrap(x + Math.cos(a) * r * d * 1.3), base + Math.round(Math.sin(a) * r * d * 0.8), rnd() < 0.55 ? M.coralD : '#525b4f'); }
    for (let k = 0; k < r; k++) px(g, wrap(x + (rnd() - 0.5) * r * 1.5), base - Math.round(rnd() * r * 0.9), rnd() < 0.5 ? M.coralD : '#4c554a');
    for (let k = 0; k < r * 0.6; k++) px(g, wrap(x + (rnd() - 0.5) * r * 1.8), base - Math.round(r * (0.6 + rnd() * 0.5)), rnd() < 0.5 ? M.coralL : '#c6cdbd');
    standsIn(Math.round(x - r), Math.round(r * 2));
  };
  // THE RIBCAGE: a hull split open, the planking gone from the upper strakes, the frames standing bare
  const ribcage = (x0, len, ht) => {
    const keel = W - 1;
    // what planking is left, lying low: courses with gaps torn in them
    for (let i = 0; i < len; i++) {
      const u = i / (len - 1), lowTop = keel - Math.round(ht * 0.2 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.62)), 0.55) + 3);
      for (let y = lowTop; y <= keel; y++) {
        const k = ((keel - y) % 4);
        let col = k === 3 ? M.hullD : k === 0 ? M.hull : k === 1 ? M.hullL : M.hull;
        if (rnd() < 0.06) col = M.hullD;
        px(g, wrap(x0 + i), y, y === lowTop ? M.hullL : col);
      }
      if (rnd() < 0.25) px(g, wrap(x0 + i), lowTop - 1, M.hull);
    }
    // the keel and the frames rising out of it, curving outward like ribs
    rect(g, wrap(x0), keel, 1, 1, M.hullD);
    const nr = 8 + ((rnd() * 3) | 0);
    for (let k = 0; k < nr; k++) {
      const u = (k + 0.5) / nr, bx = x0 + u * len;
      const broke = rnd() < 0.35;
      const rh = Math.round(ht * (0.45 + 0.55 * Math.sin(Math.PI * Math.pow(u, 0.8))) * (0.7 + rnd() * 0.5) * (broke ? 0.45 : 1));
      const bend = (1.1 + rnd() * 1.1) * (u < 0.5 ? -1 : 1);
      for (let j = 0; j < rh; j++) {
        const t = j / rh, xx = wrap(bx + bend * t * t * 11), yy = keel - 4 - j;
        if (yy < 1) break;
        px(g, xx, yy, M.rib); px(g, xx + 1, yy, (j & 3) ? M.ribL : M.rib);
        if (rnd() < 0.07) px(g, xx - 1, yy, M.hullD);
      }
      // where it snapped, the timber shows pale
      if (broke && rh > 3) { const xx = wrap(bx + bend * 11), yy = keel - 4 - rh; px(g, xx, yy, '#6b6151'); px(g, xx + 1, yy + 1, M.ribL); }
      // the rib snapped off short, or a scrap of plank still nailed across it
      if (rnd() < 0.4) { const yy = keel - 4 - Math.round(rh * (0.3 + rnd() * 0.5)); for (let i2 = 0; i2 < 4 + ((rnd() * 4) | 0); i2++) px(g, wrap(bx + i2), yy, (i2 & 1) ? M.hull : M.hullL); }
    }
    // the stem post at the bow, and a brass fitting still on it
    const sx = x0 + len - 1;
    for (let j = 0; j < Math.round(ht * 0.8); j++) { px(g, wrap(sx - j * 0.25), keel - j, M.rib); px(g, wrap(sx - j * 0.25) + 1, keel - j, M.ribL); }
    const fy = keel - Math.round(ht * 0.6);
    rect(g, wrap(sx - 2), fy, 3, 2, M.verd); px(g, wrap(sx - 2), fy, '#63b593');
    standsIn(x0, len);
  };
  // a mast still standing, leaning, its shrouds snapped and a rag of sail left on the yard
  const leaningMast = (x0, ht, lean) => {
    const base = W - 1;
    const mast = () => {
      for (let j = 0; j < ht; j++) {
        const xx = wrap(x0 + j * lean), yy = base - j;
        px(g, xx, yy, M.rib); px(g, xx + 1, yy, (j & 5) ? M.ribL : M.rib); px(g, xx + 2, yy, M.hullD);
        if (rnd() < 0.06) px(g, xx, yy, M.hullD);
      }
    };
    mast();
    const topX = x0 + ht * lean, topY = base - ht;
    // the yard, slewed round, with the sail hanging off it in ribbons
    const yy = base - Math.round(ht * 0.62), yx = x0 + Math.round(ht * 0.62) * lean, ylen = Math.round(ht * 0.5);
    for (let i = -ylen; i <= ylen; i++) { px(g, wrap(yx + i), yy + Math.round(i * 0.18), M.rib); if ((i & 3) === 0) px(g, wrap(yx + i), yy + Math.round(i * 0.18) - 1, M.ribL); }
    // the sail still bent to the yard: a sheet of cloth, split by tears, its foot hanging in ribbons
    const tear = [];
    for (let k = 0; k < 3; k++) tear.push(-ylen + 2 + ((rnd() * (ylen * 2 - 4)) | 0));
    for (let i = -ylen + 1; i < ylen; i++) {
      if (tear.some(t => Math.abs(i - t) < 1)) continue;
      const u = (i + ylen) / (ylen * 2);
      const body = Math.round(10 + 16 * Math.sin(Math.PI * u)), ragged = body + ((rnd() * 7) | 0) - 3;
      const yb = yy + Math.round(i * 0.18) + 1;
      for (let j = 0; j < ragged; j++) {
        const yyy = yb + j; if (yyy >= base) break;
        const xx = wrap(yx + i + Math.round(j * 0.1));
        px(g, xx, yyy, j < 2 ? M.cloth : j > body - 4 ? (((i + j) & 1) ? M.clothD : M.cloth) : ((i & 3) === 0 ? M.clothD : M.cloth));
      }
    }
    mast();
    // the rigging that is left: one shroud still up, and a line trailing off the yard
    {
      const ex = x0 - Math.round(ht * 0.7);
      for (let j = 0; j < ht; j += 1) { const t = j / ht, xx = wrap(topX + (ex - topX) * t), yy2 = topY + (base - topY) * t; if (rnd() < 0.72) px(g, xx, Math.round(yy2), M.rope); }
    }
    for (let j = 0; j < 14; j++) px(g, wrap(yx - ylen - j * 0.7), yy - Math.round(ylen * 0.18) + Math.round(j * 0.9), M.rope);
    // the stump of hull it still stands on
    const hw = Math.round(ht * 0.45);
    for (let i = -hw; i <= hw; i++) { const hh = 3 + Math.round(4 * Math.cos(i / hw * 1.4)); for (let y = base - hh; y <= base + 1; y++) px(g, wrap(x0 + i), y, y === base - hh ? M.hullL : ((y & 3) === 3 ? M.hullD : M.hull)); }
    standsIn(x0 - hw, hw * 2 + 1);
  };
  // the transom of a third ship, half buried, stern-on: a flat slab of planking with a rudder hanging off it
  const transom = (x0, wd, ht) => {
    const base = W;
    for (let y = base - ht; y <= base; y++) {
      const shrink = Math.round((base - y) * 0.18);
      for (let x = x0 + shrink; x < x0 + wd - shrink; x++) {
        const k = (base - y) % 4;
        px(g, wrap(x), y, k === 3 ? M.hullD : k === 0 ? M.hull : k === 1 ? M.hullL : M.hull);
      }
    }
    for (let i = 0; i < wd; i += 5) px(g, wrap(x0 + i + 2), base - ht + 1, M.iron);
    const rx = x0 + Math.round(wd * 0.5);
    for (let y = base - Math.round(ht * 0.7); y <= base; y++) { px(g, wrap(rx), y, M.hullD); px(g, wrap(rx + 1), y, M.hull); }
    rect(g, wrap(x0 + 1), base - ht, wd - 2, 1, M.hullL);
    // her rudder, still hung on its pintles, swung out from the transom
    for (let j = 0; j < Math.round(ht * 0.8); j++) {
      const rxx = wrap(x0 + wd + 1 + Math.round(j * 0.16));
      for (let q = 0; q < 3; q++) px(g, rxx + q, base - Math.round(ht * 0.55) + j, q === 0 ? M.hullL : M.hull);
    }
    // the transom broken away along its top
    for (let i = 0; i < wd; i++) if (rnd() < 0.45) { const n = 1 + ((rnd() * 3) | 0); for (let j = 0; j < n; j++) g.clearRect(wrap(x0 + i), base - ht + j, 1, 1); }
    for (let i = 0; i < wd; i += 3 + ((rnd() * 3) | 0)) px(g, wrap(x0 + i), base - ht + 1, M.hullL);
    // the stern windows, their elven brass gone green
    for (let i = 0; i < 3; i++) { const ex = x0 + 3 + i * Math.round((wd - 6) / 3), ey = base - Math.round(ht * 0.62); rect(g, wrap(ex), ey, 2, 2, '#1b2428'); px(g, wrap(ex), ey, M.verd); }
    standsIn(x0, wd);
  };
  ribcage(wrap(86 * S), Math.round(118 * S), 62);
  leaningMast(wrap(300 * S), 84, 0.22);
  transom(wrap(400 * S), Math.round(44 * S), 26);
  for (const [x, r] of [[28, 7], [200, 5], [246, 9], [352, 6], [442, 8], [468, 4]]) coralHead(wrap(x * S), r);
  for (let i = 0; i < 4; i++) petrel(g, w, (rnd() * w) | 0, 12 + ((rnd() * 46) | 0), rnd() < 0.5, '#4e5854');
  return c;
}

// The near band: the reef right up against the play field. A bank of coral with heads standing out of it, and the
// flank of a wrecked tribute ship lying across the frame — planking, frames, bolt rows, a hole stove in her side
// with the ribs showing through — with kelp and boulders along the bank. Darker and more saturated than mid.
// Transparent above; the coral heads reach up to about row 90, the bank's top runs at about h - 66 (+/- 16) and
// everything under it is opaque reef. Laid out for 640 wide. Tiles horizontally.
export function bakeNearReef(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const S = w / 640;
  let rr = rnd;
  const at = (fn, x, ...a) => { const sd = (rnd() * 4294967296) >>> 0; for (const dx of [-w, 0, w]) { rr = mulberry(sd); fn(x + dx, ...a); } rr = rnd; };
  const ph = [rr() * 6, rr() * 6, rr() * 6];
  const bankY = x => { const u = x / w * Math.PI * 2; return Math.round(h - 66 + 8 * Math.sin(u * 3 + ph[0]) + 5 * Math.sin(u * 7 + ph[1]) + 3 * Math.sin(u * 17 + ph[2])); };
  const N = { rock: '#525c56', rockL: '#6e776c', rockD: '#39413d', rockT: '#89917f', pit: '#2a312e', weed: '#20382c', weedL: '#2f5540', weedH: '#3f6f52',
    hull: '#1f1b18', hullM: '#2c2722', hullL: '#3c342c', hullHi: '#4c4236', caulk: '#120f0d', iron: '#3a3e42', ironL: '#6a7176', rust: '#6b3e22', barn: '#c2c4b4', barnD: '#8d9184', verd: '#3a6e5a', bone: '#cfcab6' };
  // a coral head: a rounded mass of pitted limestone, pale on the crown, weed in its crevices
  const head = (x, base, r) => {
    ellipse(g, x, base - r * 0.2, r, r * 1.05, N.rock);
    ellipse(g, x - r * 0.1, base - r * 0.5, r * 0.78, r * 0.72, N.rockL, N.rock);
    ellipse(g, x - r * 0.12, base - r * 0.75, r * 0.5, r * 0.4, N.rockT, N.rockL);
    for (let k = 0; k < r * 4; k++) {
      const a = rr() * Math.PI * 2, d = Math.sqrt(rr());
      const xx = Math.round(x + Math.cos(a) * r * d * 0.9), yy = Math.round(base - r * 0.25 + Math.sin(a) * r * d * 0.9);
      px(g, xx, yy, rr() < 0.6 ? N.pit : N.rockD);
      if (rr() < 0.4) px(g, xx, yy + 1, N.rockT);
    }
    for (let k = 0; k < r * 0.9; k++) { const a = -Math.PI * (0.2 + rr() * 0.6); px(g, Math.round(x + Math.cos(a) * r * 0.85), Math.round(base - r * 0.25 + Math.sin(a) * r * 0.95), rr() < 0.5 ? N.bone : N.rockT); }
    // the clefts worn down its flanks, and the nubs standing off its crown
    for (let k = 0; k < 3 + ((rr() * 3) | 0); k++) {
      const a = -Math.PI * (0.12 + rr() * 0.76), L = r * (0.4 + rr() * 0.5);
      for (let j = 0; j < L; j++) {
        const xx = Math.round(x + Math.cos(a) * (r * 0.35 + j)), yy = Math.round(base - r * 0.25 + Math.sin(a) * (r * 0.35 + j) * 0.95);
        px(g, xx, yy, N.pit); if (j % 2) px(g, xx, yy + 1, N.rockL);
      }
    }
    for (let k = 0; k < 2 + ((rr() * 3) | 0); k++) {
      const a = -Math.PI * (0.22 + rr() * 0.56), nx = Math.round(x + Math.cos(a) * r * 0.8), ny = Math.round(base - r * 0.25 + Math.sin(a) * r * 1.0);
      px(g, nx, ny, N.rockT); px(g, nx + 1, ny, N.bone); px(g, nx - 1, ny, N.rock);
      px(g, nx, ny - 1, N.bone); if (rr() < 0.5) px(g, nx + 1, ny - 1, N.rockT);
      px(g, nx + 2, ny, N.pit); px(g, nx - 2, ny, N.pit);
    }
    for (let k = 0; k < r * 0.7; k++) { const a = rr() * Math.PI; px(g, Math.round(x + Math.cos(a) * r * (0.5 + rr() * 0.5)), Math.round(base - r * 0.1 + Math.sin(a) * r * 0.5), rr() < 0.5 ? N.weed : N.weedL); }
  };
  // kelp: a long strap of weed standing up off the reef, bladed, leaning with the surge
  const kelp = (x, base, ht, lean) => {
    for (let j = 0; j < ht; j++) {
      const t = j / ht, xx = Math.round(x + lean * t * t), yy = base - j;
      px(g, xx, yy, t < 0.3 ? N.weed : t < 0.7 ? N.weedL : N.weedH);
      px(g, xx + 1, yy, N.weed);
      if (j % 5 === 2) {
        const side = rr() < 0.5 ? -1 : 1, bl = 4 + ((rr() * 7) | 0);
        for (let i = 0; i < bl; i++) {
          const bx = xx + side * (i + 1), by = yy + Math.round(i * 0.75);
          px(g, bx, by, i < bl - 2 ? N.weedL : N.weed);
          if (i > 0 && i < bl - 1) px(g, bx, by + 1, N.weed);
        }
      }
    }
    const tx = Math.round(x + lean), ty = base - ht;
    for (let i = 0; i < 3; i++) { const side = i === 1 ? 0 : i === 0 ? -1 : 1; for (let j = 0; j < 5; j++) px(g, tx + side * j, ty - Math.round(j * 0.6) + (side ? 1 : 0), j < 3 ? N.weedH : N.weedL); }
  };
  // a boulder off the reef, barnacled low down and weed-capped
  const boulder = (x, base, wd, ht) => {
    fillPoly(g, [[x, base], [x + wd * 0.08, base - ht * 0.6], [x + wd * 0.34, base - ht], [x + wd * 0.7, base - ht * 0.92], [x + wd * 0.95, base - ht * 0.4], [x + wd, base]], N.rockD);
    fillPoly(g, [[x + wd * 0.34, base - ht], [x + wd * 0.7, base - ht * 0.92], [x + wd * 0.9, base - ht * 0.5], [x + wd * 0.44, base - ht * 0.62]], N.rock);
    line(g, x + wd * 0.34, base - ht, x + wd * 0.7, base - ht * 0.92, N.rockT, 1);
    line(g, x + wd * 0.44, base - ht * 0.62, x + wd * 0.5, base - ht * 0.1, N.pit, 1);
    for (let k = 0; k < wd * 0.6; k++) px(g, Math.round(x + 2 + rr() * (wd - 4)), Math.round(base - 1 - rr() * ht * 0.35), rr() < 0.5 ? N.barn : N.barnD);
    for (let k = 0; k < wd * 0.3; k++) px(g, Math.round(x + wd * 0.3 + rr() * wd * 0.5), Math.round(base - ht * (0.9 + rr() * 0.12)), rr() < 0.5 ? N.weed : N.weedL);
  };
  // THE FLANK: a tribute ship lying over on the reef, her side across the frame. Plank courses follow the sheer,
  // the frames show through where the planking is gone, and the sea has crusted the whole of her.
  const flank = (x0, len, ht, tilt) => {
    // she is buried to her waterline in the reef, so her bottom runs flat and the bank covers it; what shows is
    // her sheer — one long smooth curve, lifting to the stem at the bow, heeled over toward the sea
    const bot = h - 38;
    // her rail: low at the stern, sweeping up all the way to the bow, and heeled over toward the sea
    const sheerAt = i => {
      const u = i / (len - 1);
      return Math.round(bot - ht * (0.44 + 0.56 * Math.pow(u, 1.5) + 0.08 * Math.sin(u * 4.2)) + tilt * (u - 0.5) * 2);
    };
    // over the stern third the upper strakes have been torn off her; the planking stops short there
    const goneAt = i => { const u = i / (len - 1), t = (u - 0.06) / 0.34; return t <= 0 || t >= 1 ? 0 : Math.round(ht * 0.3 * Math.sin(Math.PI * t)); };
    const topAt = i => sheerAt(i) + goneAt(i);
    const hx = x0 + Math.round(len * 0.58), hw = Math.round(len * 0.1);
    const hj = k => { let n = (k * 374761393) ^ 0x9e37; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
    const holeTop = i => topAt(i) + 18 + Math.round(hj(i) * 6);
    const holeD = x => { const u = (x - (hx - hw)) / (hw * 2); return u <= 0 || u >= 1 ? 0 : Math.max(0, Math.round(Math.sin(Math.PI * Math.pow(u, 0.8)) * ht * 0.3 + (hj(x * 3 + 7) - 0.4) * 8)); };
    for (let i = 0; i < len; i++) {
      const x = x0 + i, t0 = topAt(i);
      for (let y = t0; y <= bot; y++) {
        const k = ((y - t0) % 5), deep = (y - t0) / Math.max(1, bot - t0);
        let col = k === 4 ? N.caulk : k === 0 ? N.hullL : k === 1 ? N.hullM : k === 2 ? N.hullM : N.hull;
        if (deep > 0.55 && k !== 4) col = k === 0 ? N.hullM : N.hull;
        if (deep > 0.8 && k !== 4) col = k === 0 ? N.hull : '#171412';
        if (rr() < 0.04) col = N.caulk;
        else if (rr() < 0.035 && deep < 0.5) col = N.hullHi;
        px(g, x, y, col);
      }
      // the wale: a heavy band of timber laid along her sheer, and the rail over it — only where she still has one
      if (goneAt(i) < 2) {
        px(g, x, t0 - 1, (i & 5) ? N.hullHi : N.hullL);
        for (let j = 4; j < 8; j++) px(g, x, t0 + j, j === 4 ? N.hullHi : j === 7 ? N.caulk : N.hullL);
      } else {
        px(g, x, t0, N.hullHi);
        if (rr() < 0.3) px(g, x, t0 - 1, N.hullM);
      }
      // the butt of a plank, caulked, every so often
      if (i % 23 === 9) for (let y = t0 + 9; y <= bot; y++) px(g, x, y, N.caulk);
    }
    // the frames left standing where the strakes were torn off, some snapped short, the sky between them
    for (let i = 4; i < len; i += 4 + ((rr() * 9) | 0)) {
      const gone = goneAt(i); if (gone < 3 || rr() < 0.22) continue;
      const x = x0 + i, t0 = topAt(i), rail = sheerAt(i);
      const hh = rr() < 0.3 ? 1 + ((rr() * 4) | 0) : Math.round((t0 - rail) * (0.35 + rr() * 0.85));
      const thick = rr() < 0.3 ? 3 : 2, lean = rr() < 0.35 ? (rr() < 0.5 ? -1 : 1) : 0;
      for (let j = 0; j < hh; j++) {
        const xx = x + Math.round(lean * j * 0.12);
        for (let q = 0; q < thick; q++) px(g, xx + q, t0 - 1 - j, q === 0 ? N.hullM : (j & 3) ? N.hullL : N.hullM);
      }
      px(g, x + Math.round(lean * hh * 0.12), t0 - 1 - hh, N.hullHi);
      // a scrap of plank still nailed across two of them
      if (rr() < 0.3) { const yy = t0 - 1 - ((rr() * Math.max(1, hh)) | 0); for (let q = 0; q < 4 + ((rr() * 8) | 0); q++) px(g, x - 1 - q, yy, (q & 1) ? N.hullL : N.hull); }
    }
    // the hold gaping through where the reef stove her side in, her frames standing in the dark of it
    for (let i = -hw; i <= hw; i++) {
      const x = hx + i, t0 = holeTop(x - x0), d = holeD(x);
      for (let y = t0; y < t0 + d; y++) px(g, x, y, '#0c0a09');
    }
    for (let k = 0; k < 5; k++) {
      const x = hx - hw + 3 + Math.round(k * (hw * 2 - 6) / 4) + ((rr() * 5) | 0) - 2, t0 = holeTop(x - x0), d = holeD(x);
      if (d < 5 || rr() < 0.2) continue;
      // a frame standing in the gap: broken off part way, leaning, the splinter pale where it snapped
      const up = rr() < 0.5, hh = Math.round(d * (0.35 + rr() * 0.6)), lean = (rr() - 0.5) * 0.25;
      for (let j = 0; j < hh; j++) {
        const y = up ? t0 + 1 + j : t0 + d - 1 - j, xx = x + Math.round(lean * j);
        px(g, xx, y, N.hullM); px(g, xx + 1, y, (j & 3) ? N.hullL : N.hullM);
      }
      const ey = up ? t0 + hh : t0 + d - hh;
      px(g, x + Math.round(lean * hh), ey, N.hullHi);
    }
    // the planking splintered back round the lip of the hole
    for (let k = 0; k < 22; k++) {
      const x = hx - hw + 1 + ((rr() * (hw * 2 - 2)) | 0), t0 = holeTop(x - x0), d = holeD(x);
      const up = rr() < 0.5, y = up ? t0 - ((rr() * 3) | 0) : t0 + d + ((rr() * 3) | 0);
      px(g, x, y, N.hullHi); if (rr() < 0.5) px(g, x + 1, y + (up ? -1 : 1), N.caulk);
    }
    // her stem, curving up out of the bow, with what is left of the bowsprit snapped off it
    const sx = x0 + len - 1, sy = topAt(len - 1);
    for (let j = 0; j < 38; j++) {
      const t = j / 38, x = Math.round(sx + t * t * 11), y = sy - j;
      for (let q = 0; q < 4; q++) px(g, x + q, y, q === 0 ? N.hullHi : q === 3 ? N.hull : N.hullM);
      if (j % 9 === 4) { for (let q = 0; q < 4; q++) px(g, x + q, y, q === 0 ? N.ironL : N.iron); }
    }
    // the tribute ship's figurehead, an elven thing in brass, broken off at the shoulder
    const fx = Math.round(sx + 11), fy = sy - 36;
    rect(g, fx, fy, 5, 3, N.verd); rect(g, fx, fy, 5, 1, '#5b9d80');
    px(g, fx + 5, fy + 1, N.verd); px(g, fx + 4, fy + 3, '#2f5b4a'); px(g, fx + 1, fy + 3, N.verd);
    for (let j = 0; j < 7; j++) if (rr() < 0.6) px(g, fx + 1 + ((rr() * 3) | 0), fy + 4 + j, '#2f5b4a');
    for (let j = 0; j < 26; j++) { const x = Math.round(sx + 9 + j), y = sy - 32 - Math.round(j * 0.45); px(g, x, y, N.hullM); px(g, x, y + 1, N.hull); if (j > 20 && rr() < 0.6) px(g, x, y + 2, N.caulk); }
    // the sternpost at the other end, and the rail broken away over it
    for (let j = 0; j < 22; j++) { const x = x0 - Math.round(j * 0.18), y = topAt(0) - j + 4; for (let q = 0; q < 3; q++) px(g, x + q, y, q === 1 ? N.hullM : N.hull); }
    // bolt rows down her frames, weeping rust
    for (let i = 8; i < len - 8; i += 24 + ((rr() * 10) | 0)) {
      const x = x0 + i, t0 = topAt(i);
      for (let y = t0 + 10; y < bot - 4; y += 7 + ((rr() * 4) | 0)) {
        if (x > hx - hw - 1 && x < hx + hw + 1 && y > holeTop(i) - 3 && y < holeTop(i) + holeD(x) + 3) continue;
        px(g, x, y, N.ironL); px(g, x + 1, y, N.iron); px(g, x, y + 1, N.iron);
        if (rr() < 0.6) { px(g, x, y + 2, N.rust); if (rr() < 0.5) px(g, x, y + 3, '#53301b'); }
      }
    }
    // the sea's mark on her: barnacle crust gathering along the low strakes, weed hanging off it in curtains
    for (let k = 0; k < len * 0.5; k++) {
      const x = x0 + ((rr() * len) | 0), y = bot - 4 - ((rr() * 22) | 0);
      px(g, x, y, rr() < 0.5 ? N.barn : N.barnD); px(g, x + 1, y, N.barnD);
      if (rr() < 0.4) px(g, x, y + 1, N.barnD);
    }
    for (let k = 0; k < len / 9; k++) {
      const x = x0 + ((rr() * len) | 0), L = 6 + ((rr() * 18) | 0), y0 = bot - 18 - ((rr() * 10) | 0);
      for (let j = 0; j < L && y0 + j < h; j++) px(g, x, y0 + j, j < 2 ? N.weedL : j < L - 2 ? N.weed : '#16261d');
    }
    // elven brass on her sides, gone green, the verdigris running down the planks under it
    for (let k = 0; k < 3; k++) {
      const x = x0 + 14 + ((rr() * (len - 40)) | 0), t0 = topAt(x - x0);
      rect(g, x, t0 + 10, 4 + ((rr() * 4) | 0), 3, N.verd); rect(g, x, t0 + 10, 4, 1, '#5b9d80');
      for (let j = 3; j < 12; j++) if (rr() < 0.55) px(g, x + 1 + ((rr() * 2) | 0), t0 + 10 + j, '#2f5b4a');
    }
    // a few frames standing over her rail toward the bow, where the deck went
    for (let k = 0; k < 4; k++) {
      const i = Math.round(len * 0.5) + ((rr() * (len * 0.4)) | 0), x = x0 + i, t0 = topAt(i), hh = 6 + ((rr() * 16) | 0);
      for (let j = 0; j < hh; j++) { px(g, x, t0 - 2 - j, N.hullM); px(g, x + 1, t0 - 2 - j, (j & 3) ? N.hullL : N.hullM); }
      px(g, x, t0 - 2 - hh, N.hullHi);
    }
  };
  // the bank of reef everything stands on
  const bank = () => {
    for (let x = 0; x < w; x++) { const y = bankY(x); rect(g, x, y + 2, 1, h - y - 2, N.rockD); }
    for (let x = 0; x < w; x += 4) {
      const r = 3 + rr() * 9, cx = x + rr() * 4, cy = bankY(x) + 3 + rr() * 4;
      at(xx => {
        ellipse(g, xx, cy, r, r * (0.7 + rr() * 0.5), N.rock);
        ellipse(g, xx - r * 0.1, cy - r * 0.35, r * 0.7, r * 0.5, N.rockL, N.rock);
        for (let k = 0; k < r * 2; k++) px(g, Math.round(xx + (rr() - 0.5) * r * 1.6), Math.round(cy + (rr() - 0.4) * r), rr() < 0.6 ? N.pit : N.rockD);
        for (let k = 0; k < 2; k++) { const nx = Math.round(xx + (rr() - 0.5) * r), ny = Math.round(cy - r * (0.55 + rr() * 0.4)); px(g, nx, ny, N.rockT); px(g, nx + 1, ny, N.bone); px(g, nx + 2, ny, N.pit); }
      }, cx);
    }
    for (let i = 0; i < w / 3; i++) { const x = (rr() * w) | 0, y0 = bankY(x) + 5, y = y0 + ((rr() * Math.max(1, h - y0)) | 0); px(g, x, y, rr() < 0.65 ? N.pit : N.rockL); }
    for (let i = 0; i < w / 16; i++) { const x = (rr() * w) | 0, y = bankY(x) + 1 + ((rr() * 9) | 0); px(g, x, y, rr() < 0.5 ? N.bone : N.barnD); }
    for (let i = 0; i < w / 12; i++) { const x = (rr() * w) | 0, y = bankY(x) + 2 + ((rr() * 12) | 0); px(g, x, y, rr() < 0.5 ? N.weed : N.weedL); }
  };
  // back to front: a broken mast leaning behind the reef, the heads, the wreck, the bank, then the weed on it
  const backMast = (x, ht, lean) => {
    const base = bankY(x) + 4;
    for (let j = 0; j < ht; j++) { const xx = Math.round(x + lean * j), yy = base - j; px(g, xx, yy, '#2a2520'); px(g, xx + 1, yy, (j & 3) ? '#3a332b' : '#2a2520'); }
    const ty = base - ht;
    for (let i = -9; i <= 9; i++) px(g, Math.round(x + i), ty + 6 + Math.round(i * 0.3), '#2a2520');
    for (let j = 0; j < 22; j++) px(g, Math.round(x + 9 + j * 0.5), ty + 9 + j, '#4a4334');
    for (let i = 0; i < 12; i++) { const cx = Math.round(x - 8 + rr() * 8), cy = ty + 8 + ((rr() * 16) | 0); px(g, cx, cy, rr() < 0.5 ? '#9d9b8b' : '#7c7b6d'); }
  };
  at(backMast, 520 * S, 104, 0.12);
  for (const [x, r] of [[36, 42], [250, 30], [612, 36]]) at((xx, rr2) => head(xx, bankY(xx) + 10, rr2), x * S, r);
  at((x) => flank(x, Math.round(330 * S), 152, 18), 140 * S);
  bank();
  for (const [x, r] of [[96, 17], [300, 13], [470, 20], [560, 15]]) at((xx, rr2) => head(xx, bankY(xx) + 10, rr2), x * S, r);
  for (let i = 0; i < w / 58; i++) { const x = rnd() * w, wd = 12 + rnd() * 18, ht = 8 + rnd() * 11; at(boulder, x, bankY(x) + 9 + rnd() * 8, wd, ht); }
  for (let i = 0; i < w / 26; i++) { const x = rnd() * w; at(kelp, x, bankY(x) + 6, 24 + ((rnd() * 40) | 0), (rnd() < 0.5 ? -1 : 1) * (4 + rnd() * 12)); }
  return c;
}

// The foreground, drawn over everything: kelp fronds and a hanging rope or two off the top edge, spray and foam
// breaking along the bottom, a scatter of blown spray between. Sparse — about a hundredth of the frame — so it
// reads as weather and not as a curtain. Mostly transparent. Tiles horizontally.
export function bakeFGReef(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const D = '#101d18', M = '#1b3228', L = '#2a4c38', R0 = '#4b432f', R1 = '#6a5f46';
  let rr = rnd;
  const at = (fn, x, ...a) => { const sd = (rnd() * 4294967296) >>> 0; for (const dx of [-w, 0, w]) { rr = mulberry(sd); fn(x + dx, ...a); } rr = rnd; };
  // a kelp frond hanging in from the top: a dark stipe with bladed fronds off it, widening as it falls
  const frond = (x) => {
    const len = 26 + rr() * 22, dir = rr() < 0.5 ? -1 : 1;
    const sx = k => x + dir * k * 0.22 + Math.sin(k * 0.08) * 2;
    for (let k = 0; k < len; k++) { const xx = Math.round(sx(k)); px(g, xx, -3 + k, D); px(g, xx + 1, -3 + k, (k % 5) ? M : D); }
    // the blades: long straps of weed hanging off the stipe, wavering as they fall
    const nb = 3 + ((rr() * 3) | 0);
    for (let b = 0; b < nb; b++) {
      const start = len * (0.2 + 0.75 * (b / nb)), bl = 30 + rr() * 44, side = (b % 2) ? 1 : -1;
      const bx0 = sx(start), by0 = -3 + start;
      for (let j = 0; j < bl; j++) {
        const t = j / bl;
        const xx = Math.round(bx0 + side * (2 + 4 * Math.sin(t * 2.1)) * Math.min(1, t * 5) + Math.sin((j + b * 7) * 0.11) * 2);
        const yy = Math.round(by0 + j * 0.96);
        px(g, xx, yy, t < 0.5 ? M : L);
        if (t > 0.1 && t < 0.9) px(g, xx + 1, yy, D);
      }
    }
  };
  // a rope come loose from a wreck overhead, swinging down with a frayed end
  const rope = (x) => {
    const len = 40 + rr() * 46;
    for (let j = 0; j < len; j++) {
      const xx = Math.round(x + Math.sin(j * 0.05) * 4 + j * 0.06), yy = -2 + j;
      px(g, xx, yy, (j & 1) ? R1 : R0);
      if (j % 9 === 0) px(g, xx + 1, yy, R0);
    }
    const ey = -2 + len, ex = Math.round(x + Math.sin(len * 0.05) * 4 + len * 0.06);
    for (const s of [-1, 0, 1]) for (let j = 0; j < 3 + ((rr() * 4) | 0); j++) px(g, ex + s + (s ? Math.round(j * 0.4) * s : 0), ey + j, R0);
  };
  const nf = Math.max(1, Math.round(w / 420));
  for (let i = 0; i < nf; i++) at(frond, (i + 0.2 + rnd() * 0.5) * w / nf);
  for (let i = 0; i < Math.max(1, Math.round(w / 420)); i++) at(rope, (i + 0.6) * w / Math.max(1, Math.round(w / 420)));
  // foam breaking along the bottom edge: flat arcs of white with spray coming off their crests
  const nw = Math.max(2, Math.round(w / 260));
  for (let i = 0; i < nw; i++) {
    const x = rnd() * w, wd = 34 + rnd() * 44, ht = 4 + rnd() * 5;
    at(xx => {
      for (let k = 0; k < wd; k++) {
        const u = k / wd, y = Math.round(h - 1 - ht * Math.sin(Math.PI * u));
        for (let j = 0; j < h - y; j++) {
          if (rr() > 0.78 - j * 0.17) continue;
          px(g, Math.round(xx + k), y + j, rr() < 0.5 ? 'rgba(236,244,240,0.9)' : 'rgba(206,224,218,0.6)');
        }
        if (rr() < 0.16) px(g, Math.round(xx + k), y - 1 - ((rr() * 3) | 0), 'rgba(236,244,240,0.5)');
      }
    }, x);
  }
  for (let i = 0; i < w / 48; i++) {
    const x = (rnd() * w) | 0, y = 10 + ((rnd() * (h - 24)) | 0);
    if (rnd() < 0.18) { px(g, x, y, 'rgba(238,246,242,0.8)'); px(g, (x + 1) % w, y, 'rgba(224,238,232,0.35)'); px(g, x, y + 1, 'rgba(224,238,232,0.35)'); }
    else px(g, x, y, 'rgba(228,240,234,0.45)');
  }
  return c;
}

// Rain and blown spray, 3 frames of a tiling overlay at w x h (64 x 64 as used). Sparse pale streaks, slanted,
// and a few motes of spray. Each frame drops every streak further down the tile — offsets 0, 21, 43 — so the
// third frame is 64 rows on from the first and frames 0-1-2 loop with no jump, while the pattern still tiles.
export function bakeRain(w, h) {
  const rnd = mulberry(5151), OFF = [0, 21, 43];
  const streaks = [], motes = [];
  const n = Math.round(w * h / 420);
  for (let i = 0; i < n; i++) streaks.push({ x: (rnd() * w) | 0, y: (rnd() * h) | 0, len: 4 + ((rnd() * 7) | 0), bright: rnd() < 0.4 });
  for (let i = 0; i < Math.round(w * h / 900); i++) motes.push({ x: (rnd() * w) | 0, y: (rnd() * h) | 0 });
  return [0, 1, 2].map(f => {
    const [c, g] = canvas(w, h);
    const off = OFF[f];
    for (const s of streaks) {
      for (let k = 0; k < s.len; k++) {
        const y = (s.y + off + k) % h, x = (((s.x - ((k * 0.4) | 0)) % w) + w) % w;
        const t = k / s.len;
        const col = s.bright ? (t < 0.6 ? 'rgba(226,238,234,0.55)' : 'rgba(210,226,220,0.3)') : (t < 0.6 ? 'rgba(206,222,218,0.32)' : 'rgba(196,214,208,0.18)');
        px(g, x, y, col);
      }
    }
    for (const m of motes) {
      const y = (m.y + off) % h, x = m.x;
      px(g, x, y, 'rgba(236,244,240,0.5)');
      px(g, (x + 1) % w, y, 'rgba(220,234,228,0.22)');
    }
    return c;
  });
}
