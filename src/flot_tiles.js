// flot_tiles.js — THE FLOTILLA: tiles and parallax for the pirate fleet lashed together into a floating town,
// anchored over a drowned city. Hard noon light: a white-blue sky with the glare band sitting down on the
// horizon, deep blue water hammering sparks back at it, and everything above the waterline bleached — deck
// planks gone white as bone, salt-stiff canvas, brass polished bright, red and ochre paint flaking off the
// carved work. Below the line it goes the other way: black tarred hulls, copper sheathing gone green, barnacle
// crust, green-black weed. Deliberately a different day from THE LONG WATER's warm dusk coast (lw_tiles.js)
// and THE SHIPWRECK REEF's directionless grey-green storm (reef_tiles.js): here the light has a direction and
// that direction is straight down, so every top face is hot and every side face is in shade. Same conventions
// as both of those: 16x16 tiles, crisp px.js primitives only (no AA), fixed seeds for the tiles so they come
// out the same every load, the caller's seed for the background layers.
import { canvas, px, rect, ellipse, fillPoly, mulberry } from './px.js';

const T = 16;
// the water: deep hard blue, and pale only where the glare is on it
const SEA = ['#0c2c58', '#133f78', '#1e62a6', '#3f94d2'], FOAM = '#ffffff', FOAM_D = '#bcdcf2';
// sun-bleached deck planking, as the sun has it: `hot` is the row the light is actually on, `sh` the shade
// under a lip. Only a top face is ever this pale.
const DK = { hot: '#fdf6e2', hi: '#f0e4c8', l: '#dacfae', m: '#bfb190', d: '#9b8d70', sh: '#766950', caulk: '#2b2219' };
// the same deck timber seen edge on, which on a day like this means in its own shade — a whole step down from
// the walked surface, so a deck reads as a deck and not as a wall of pale boards
const DS = { hot: '#b3a484', hi: '#9d8e6f', l: '#87795d', m: '#6f634b', d: '#5a4f3b', sh: '#453c2c', caulk: '#1c1711' };
// tarred hull: black-brown, the caulk blacker than the timber
const HL = { caulk: '#0f0c0a', d: '#1e1813', m: '#2c241c', l: '#3b3127', hi: '#4f4234' };
// ship's timber below decks: the same wood but never weathered and never lit
const FL = { caulk: '#191310', d: '#392e23', m: '#4a3d2d', l: '#5d4d39', hi: '#73604a' };
// the same planking rotted through: all the colour gone out of it, and the holes near black
const RT = { hi: '#bdb9aa', l: '#9e9a8a', m: '#7f7d70', d: '#605f55', crack: '#3a3a34', hole: '#12140f' };
// copper sheathing gone green, and the bright metal where a plate is still proud
// copper sheathing gone green, in two depths: the strake at her waterline, and the one under it in the shadow
// of her own bottom. `bare` is the pink metal where a plate has lifted and is not weathered yet.
const CU = { l: '#4e9a7f', m: '#3c7e68', d: '#27584a', bare: '#b8784a' };
const CU2 = { l: '#3d7965', m: '#2e6153', d: '#1d4339', bare: '#8f5c39' };
const BR = ['#f6e49c', '#e6c162', '#a8822c'];
const IR = { d: '#22252a', m: '#474e55', l: '#6e767d', rust: '#8c4c26' };
// barnacle crust, white in this light
const BARN = ['#fbf6e8', '#d4cdb8', '#9b9484'];
const WEED = ['#2f5a3a', '#1e3d28', '#11241a', '#47794e'];
// paint flaking off the carved work
const PT = { red: '#b63b2a', redL: '#dc5a3e', redD: '#76241a', och: '#dca33e', ochL: '#f4c764', ochD: '#96661e' };
const CV = ['#f4eeda', '#d8cfb4', '#ada48c'];
const ROPE = ['#d6c191', '#ab946c', '#76634a'];
const SALT = '#fffdf2';
// the bottom: pale sand over the drowned city, seen through bright water
const SILT = ['#3d5470', '#4d6684', '#2c3f58'];
const STN = ['#93a4ae', '#75848f', '#586670'];
const HAZE = '#cfe6f6';

// ---------- plank bodies ----------
// Every timber tile in the set runs on the same pitch: a course of board every 4 rows, with the caulk seam in
// the bottom row of each course. 16 divides by 4, so rows 3, 7, 11 and 15 are always seam and rows 0, 4, 8, 12
// are always the hot top edge of a board — which means any timber tile stacks under any other and the seams
// run straight down a hull of any height.

// A row's colour inside a course: 0 is the lit top edge of the board, 1 its face, 2 the shaded roll of its
// lower half, 3 the caulked seam under it.
function course(P, y) { const k = y & 3; return k === 3 ? P.caulk : k === 0 ? P.hi : k === 1 ? P.l : P.m; }

// The plank body shared by deck, hull, rot and fill: courses from y0 down, then grain, then the tar that has
// bled out of the seams and dried in streaks.
function plankBody(g, rnd, y0, P) {
  for (let y = y0; y < T; y++) rect(g, 0, y, T, 1, course(P, y));
  for (let i = 0; i < 9; i++) {
    const x = (rnd() * 13) | 0, y = y0 + ((rnd() * (T - y0)) | 0);
    if ((y & 3) === 3) continue;
    rect(g, x, y, 2 + ((rnd() * 4) | 0), 1, rnd() < 0.45 ? P.hot || P.hi : P.d);
  }
  for (let i = 0; i < 3; i++) {
    const x = (rnd() * T) | 0, y = y0 + ((rnd() * (T - y0)) | 0);
    px(g, x, y, P.caulk);
    if (rnd() < 0.5) px(g, x, y + 1, P.caulk);
  }
  // a butt joint: where one board ends against the next, caulked end to end
  if (rnd() < 0.55) {
    const jx = 3 + ((rnd() * 10) | 0), jy = y0 + ((rnd() * Math.max(1, T - y0 - 2)) | 0);
    const top = jy - (jy & 3), bot = Math.min(T - 1, top + 3);
    for (let y = Math.max(y0, top); y <= bot; y++) {
      px(g, jx, y, P.caulk);
      if ((y & 3) !== 3) px(g, jx + 1, y, P.hi);
    }
  }
}

// An iron bolt head, 2x2, rust weeping out from under it.
function bolt(g, rnd, x, y) {
  px(g, x, y, IR.m); px(g, x + 1, y, IR.l);
  px(g, x, y + 1, IR.d); px(g, x + 1, y + 1, IR.m);
  if (rnd() < 0.5) { px(g, x, y + 2, IR.rust); if (rnd() < 0.5) px(g, x + 1, y + 2, '#5e3219'); }
}

// A treenail: a wooden peg driven through the plank into the frame behind it, end-grain darker than the board.
function treenail(g, rnd, x, y, P) {
  px(g, x, y, P.d); px(g, x + 1, y, P.m);
  if (rnd() < 0.5) px(g, x, y + 1, P.caulk);
}

// Barnacles: a white ring with a dark mouth. They grow in twos and threes along a seam, where the water sits.
function barnacles(g, rnd, x, y, n) {
  n = n || 1 + ((rnd() * 3) | 0);
  for (let i = 0; i < n; i++) {
    const bx = x + i * 2 + ((rnd() * 2) | 0) - 1, by = y + ((rnd() * 2) | 0);
    px(g, bx, by, BARN[0]); px(g, bx + 1, by, BARN[1]);
    px(g, bx, by + 1, BARN[1]); px(g, bx + 1, by + 1, BARN[2]);
  }
}

// A tuft of weed hanging out of a seam: a dark green head and a strand trailing down.
function weedFringe(g, rnd, x, y, len) {
  px(g, x, y, rnd() < 0.4 ? WEED[3] : WEED[0]);
  for (let i = 1; i < len; i++) {
    const col = i < 2 ? WEED[0] : i < len - 1 ? WEED[1] : WEED[2];
    px(g, x + (i > 2 && rnd() < 0.4 ? 1 : 0), y + i, col);
  }
}

// A patch of paint still stuck to the timber, red or ochre, flaking at its edges.
function paintFlake(g, rnd, x, y, w, red) {
  const a = red ? PT.redL : PT.ochL, b = red ? PT.red : PT.och, c = red ? PT.redD : PT.ochD;
  for (let i = 0; i < w; i++) {
    if (rnd() < 0.18) continue;
    px(g, x + i, y, i === 0 || rnd() < 0.3 ? a : b);
    if (rnd() < 0.7) px(g, x + i, y + 1, rnd() < 0.3 ? b : c);
  }
}

// ---------- deck ----------

// The walked surface of a good deck, seen from just above: four rows of plank scrubbed white by the sun and the
// holystone, the caulked gaps between the boards running back into the ship, a black lip where the deck edge
// turns under, and then the same planking picking up at row 5 so deckTop sits straight on top of deck.
function deckTopTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  plankBody(g, rnd, 5, DS);
  rect(g, 0, 0, T, 1, DK.hot);
  rect(g, 0, 1, T, 1, DK.hi);
  rect(g, 0, 2, T, 1, DK.l);
  rect(g, 0, 3, T, 1, DK.m);
  rect(g, 0, 4, T, 1, DK.caulk);
  // the scrub of the holystone: pale and dark streaks along the boards
  for (let i = 0; i < 9; i++) {
    const x = (rnd() * 14) | 0, y = 1 + ((rnd() * 3) | 0);
    rect(g, x, y, 2 + ((rnd() * 4) | 0), 1, rnd() < 0.5 ? DK.hot : DK.d);
  }
  // the gaps between the deck boards, caulked with tar, running away from us. Only the lower half of the band:
  // up at the lip the boards are so bleached that the seam between them barely shows.
  let gx = 1 + ((rnd() * 5) | 0);
  while (gx < T) {
    px(g, gx, 0, DK.d);
    px(g, gx, 1, DK.sh);
    px(g, gx, 2, DK.caulk);
    px(g, gx, 3, DK.caulk);
    if (rnd() < 0.6) px(g, gx + 1, 0, DK.hot);
    gx += 5 + ((rnd() * 4) | 0);
  }
  // salt dried white in the low spots
  for (let i = 0; i < 3; i++) if (rnd() < 0.6) { const x = (rnd() * T) | 0; px(g, x, 0, SALT); if (rnd() < 0.4) px(g, x + 1, 1, SALT); }
  // an iron ring let into the deck, for a lashing
  if (rnd() < 0.45) {
    const x = 3 + ((rnd() * 9) | 0);
    px(g, x, 1, IR.l); px(g, x + 1, 1, IR.m); px(g, x + 2, 1, IR.l);
    px(g, x, 2, IR.d); px(g, x + 1, 2, DK.sh); px(g, x + 2, 2, IR.d);
    px(g, x + 1, 3, IR.m);
  }
  // a rope's end left lying across the boards
  if (rnd() < 0.45) {
    const x = 1 + ((rnd() * 8) | 0), len = 5 + ((rnd() * 6) | 0), y = 1 + ((rnd() * 2) | 0);
    for (let i = 0; i < len && x + i < T; i++) {
      px(g, x + i, y + (i > len - 3 ? 1 : 0), (i & 1) ? ROPE[0] : ROPE[1]);
      if (rnd() < 0.35) px(g, x + i, y + 1 + (i > len - 3 ? 1 : 0), ROPE[2]);
    }
  }
  // a splash of tar, trodden out flat
  if (rnd() < 0.5) {
    const x = 2 + ((rnd() * 11) | 0), w = 2 + ((rnd() * 3) | 0);
    for (let i = 0; i < w && x + i < T; i++) {
      px(g, x + i, 0, HL.caulk);
      if (rnd() < 0.7) px(g, x + i, 1, i === 0 || i === w - 1 ? HL.m : HL.caulk);
      if (rnd() < 0.3) px(g, x + i, 2, HL.m);
    }
  }
  // a flake of the deck's old paint still in a seam, and a nail head
  if (rnd() < 0.35) paintFlake(g, rnd, 2 + ((rnd() * 10) | 0), 2, 2 + ((rnd() * 3) | 0), rnd() < 0.5);
  for (let i = 0; i < 2; i++) if (rnd() < 0.6) { const x = 2 + ((rnd() * 12) | 0); px(g, x, 1, IR.l); px(g, x, 2, IR.d); }
  // a knot in a board, and a seam that has opened a hair
  if (rnd() < 0.4) { const x = 2 + ((rnd() * 12) | 0); px(g, x, 2, DK.sh); px(g, x + 1, 2, DK.d); px(g, x, 3, DK.d); }
  return c;
}

// The same deck planking as a solid mass, for under the walked surface: courses of bleached board, treenails on
// the frame lines, a little tar, the odd flake of paint.
function deckTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  plankBody(g, rnd, 0, DS);
  for (const bx of [2, 10]) for (let y = 1; y < T; y += 4) if (rnd() < 0.6) treenail(g, rnd, bx + ((rnd() * 3) | 0), y, DS);
  if (rnd() < 0.4) paintFlake(g, rnd, 2 + ((rnd() * 9) | 0), 1 + 4 * ((rnd() * 4) | 0), 3 + ((rnd() * 4) | 0), rnd() < 0.5);
  if (rnd() < 0.35) { const x = 3 + ((rnd() * 9) | 0), y = 1 + 4 * ((rnd() * 4) | 0); bolt(g, rnd, x, y); }
  // a seam that has let its caulk go, a dark line of daylight in the timber
  if (rnd() < 0.45) {
    const y = 3 + 4 * ((rnd() * 4) | 0), x = 2 + ((rnd() * 8) | 0);
    for (let i = 0; i < 4 + ((rnd() * 5) | 0) && x + i < T; i++) { px(g, x + i, y, HL.caulk); if (rnd() < 0.4) px(g, x + i, y - 1, DK.sh); }
  }
  return c;
}

// ---------- hull ----------

// Copper sheathing from y0 down: broad plates lapped over one another. The laps take a little light along
// their top edge and each plate's lower edge sits in its own shade; the butt between two plates moves course
// by course, so it is a sheathed bottom and not a course of green brick.
function copperPlates(g, rnd, y0, y1, C) {
  for (let y = y0; y < y1; y++) rect(g, 0, y, T, 1, ((y - y0) % 5) === 4 ? C.d : C.m);
  for (let y = y0; y < y1; y++) {
    if (((y - y0) % 5) !== 0) continue;
    for (let x = 0; x < T; x++) if (rnd() < 0.8) px(g, x, y, C.l);
  }
  for (let p = 0; y0 + p * 5 < y1; p++) {
    const bx = (rnd() * T) | 0;
    for (let y = y0 + p * 5; y < Math.min(y1, y0 + p * 5 + 5); y++) { px(g, bx, y, C.d); if (rnd() < 0.4) px(g, bx + 1, y, C.l); }
  }
  // the mottle the sea leaves on her, and one plate lifted so the bare metal shows
  for (let i = 0; i < 20; i++) { const x = (rnd() * T) | 0, y = y0 + ((rnd() * Math.max(1, y1 - y0)) | 0); px(g, x, y, rnd() < 0.5 ? C.l : C.d); }
  if (rnd() < 0.5) { const x = 1 + ((rnd() * 11) | 0), y = y0 + 1 + ((rnd() * Math.max(1, y1 - y0 - 2)) | 0); px(g, x, y, C.bare); px(g, x + 1, y, C.d); px(g, x, y + 1, C.d); }
}

// The outside of a tarred hull: black-brown courses with the caulk blacker still, bolt heads on the frames,
// copper sheathing gone green where she sits in the water, barnacle crust along a seam, weed in the seams.
// Variants 0 and 1 are her upper strakes (dry, a flake of paint, an iron strap); 2 and 3 carry the copper and
// the crust, so a level wanting her waterline puts those two at the bottom of the stack.
function hullTile(seed, low) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  plankBody(g, rnd, 0, HL);
  for (const bx of [2, 10]) for (let y = 1; y < T; y += 8) if (rnd() < 0.55) bolt(g, rnd, bx + ((rnd() * 3) | 0), y);
  // an iron strap band laid across the planks, rusting
  if (rnd() < (low ? 0.2 : 0.35)) {
    const sy = 1 + 4 * ((rnd() * 3) | 0);
    rect(g, 0, sy, T, 2, IR.d); rect(g, 0, sy, T, 1, IR.m);
    for (let x = 1; x < T; x += 5) px(g, x, sy, IR.l);
    for (let x = 0; x < T; x++) if (rnd() < 0.3) px(g, x, sy + 1, IR.rust);
  }
  if (!low && rnd() < 0.45) paintFlake(g, rnd, 2 + ((rnd() * 9) | 0), 1 + 4 * ((rnd() * 4) | 0), 3 + ((rnd() * 5) | 0), rnd() < 0.6);
  if (low) {
    const y0 = 2 + ((rnd() * 4) | 0), C = low > 1 ? CU2 : CU;
    copperPlates(g, rnd, y0, T, C);
    // the line where the copper stops, and the barnacle crust that gathers on it
    for (let x = 0; x < T; x++) px(g, x, y0 - 1, (x & 1) ? HL.caulk : C.d);
    barnacles(g, rnd, 1 + ((rnd() * 10) | 0), y0 + 1 + ((rnd() * 6) | 0), 2);
    if (rnd() < 0.5) barnacles(g, rnd, 2 + ((rnd() * 11) | 0), y0 + 4 + ((rnd() * 7) | 0), 1);
    if (rnd() < 0.7) weedFringe(g, rnd, 1 + ((rnd() * 13) | 0), y0 + ((rnd() * 8) | 0), 2 + ((rnd() * 4) | 0));
  } else {
    if (rnd() < 0.35) barnacles(g, rnd, 1 + ((rnd() * 11) | 0), 3 + 4 * ((rnd() * 3) | 0), 1 + ((rnd() * 2) | 0));
    if (rnd() < 0.3) weedFringe(g, rnd, 1 + ((rnd() * 13) | 0), 3 + 4 * ((rnd() * 2) | 0), 2 + ((rnd() * 3) | 0));
    // a hoop of bright brass round a scupper, or a ringbolt
    if (rnd() < 0.3) {
      const x = 3 + ((rnd() * 9) | 0), y = 1 + 4 * ((rnd() * 3) | 0);
      px(g, x, y, BR[1]); px(g, x + 1, y, BR[0]); px(g, x + 2, y, BR[2]);
      px(g, x, y + 1, BR[2]); px(g, x + 1, y + 1, HL.caulk); px(g, x + 2, y + 1, BR[2]);
    }
  }
  return c;
}

// The open side of a hull: the frame timber that the planking is nailed to, standing on end. Grain runs up and
// down it, which is what tells it apart from the courses it stands beside. The sun is overhead so the face is
// in shade, with a thin hot rim where the light off the water catches the outside corner.
// A frame is bare timber, not tarred over like the planking it carries — so it comes out of a black hull as a
// paler post, and that is what makes the corner read.
const FR = { hi: '#8a7354', l: '#6a5840', m: '#4e4230', d: '#372e22' };
function hullFace(g, rnd, x0, dir, low) {
  const x1 = x0 + dir, x2 = x0 + dir * 2;
  for (let y = 0; y < T; y++) {
    px(g, x0, y, FR.l);
    px(g, x1, y, FR.m);
    px(g, x2, y, HL.caulk);
  }
  // the grain of the frame, running up and down it, which is what tells it from the courses beside it
  for (let i = 0; i < 5; i++) {
    const y = (rnd() * 13) | 0, n = 2 + ((rnd() * 5) | 0), col = rnd() < 0.5 ? FR.hi : FR.d;
    for (let k = 0; k < n && y + k < T; k++) px(g, rnd() < 0.55 ? x0 : x1, y + k, col);
  }
  // the light off the water on the outside arris of her, broken so it reads as glare and not a drawn line
  for (let y = 0; y < T; y++) if (rnd() < 0.5) px(g, x0, y, rnd() < 0.3 ? DK.sh : FR.hi);
  for (let y = 1; y < T; y += 5) if (rnd() < 0.7) bolt(g, rnd, dir > 0 ? x0 : x0 - 1, y);
  if (low) {
    const y0 = 3 + ((rnd() * 5) | 0), C = low > 1 ? CU2 : CU;
    for (let y = y0; y < T; y++) { px(g, x0, y, ((y - y0) % 5) === 0 ? C.l : C.m); px(g, x1, y, C.d); }
    px(g, x0, y0 - 1, HL.caulk); px(g, x1, y0 - 1, HL.caulk);
    if (rnd() < 0.6) barnacles(g, rnd, x0 + (dir > 0 ? 0 : -1), y0 + 2 + ((rnd() * 5) | 0), 1);
    if (rnd() < 0.7) weedFringe(g, rnd, x1, y0 + ((rnd() * 6) | 0), 2 + ((rnd() * 3) | 0));
  } else {
    if (rnd() < 0.45) barnacles(g, rnd, x1, 4 + ((rnd() * 8) | 0), 1);
    if (rnd() < 0.4) weedFringe(g, rnd, x0, 6 + ((rnd() * 6) | 0), 2 + ((rnd() * 3) | 0));
  }
}

function hullEdgeTile(seed, eL, eR, low) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  plankBody(g, rnd, 0, HL);
  for (let y = 1; y < T; y += 4) if (rnd() < 0.4) bolt(g, rnd, 6 + ((rnd() * 3) | 0), y);
  if (low) {
    const y0 = 4 + ((rnd() * 4) | 0), C = low > 1 ? CU2 : CU;
    copperPlates(g, rnd, y0, T, C);
    for (let x = 0; x < T; x++) px(g, x, y0 - 1, (x & 1) ? HL.caulk : C.d);
    barnacles(g, rnd, 4 + ((rnd() * 7) | 0), y0 + 2 + ((rnd() * 5) | 0), 2);
  }
  if (eL) hullFace(g, rnd, 0, 1, low);
  if (eR) hullFace(g, rnd, T - 1, -1, low);
  return c;
}

// ---------- rot ----------

// The same planking rotted through, on the same pitch so it butts straight against deck and hull. Every colour
// is gone out of it, the seams have opened, the boards are split end to end, and there are holes punched clean
// through that you can see the daylight in. Next to the white deck it should read as a thing that will not
// hold you.

// A hole eaten right through the timber: the pixels are cleared, so whatever is behind the ship shows through,
// and the rim of it is ragged — dark on the inside, a pale splinter standing off the outside.
function rotHole(g, rnd, cx, cy, rx, ry) {
  for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry) + 1; y++) {
    for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx) + 1; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      if (d <= 1) g.clearRect(x, y, 1, 1);
      else if (d < 2.1 && rnd() < 0.55) px(g, x, y, rnd() < 0.45 ? RT.hi : RT.crack);
    }
  }
}

// The rotted plank body: grey courses, the seams opened and weeded, splits running with the grain, the stain of
// standing water, and two or three holes through it.
function rotBody(g, rnd, y0, holes) {
  for (let y = y0; y < T; y++) {
    const k = y & 3;
    rect(g, 0, y, T, 1, k === 3 ? RT.crack : k === 0 ? RT.hi : k === 1 ? RT.l : RT.d);
  }
  // the grain standing proud of the soft wood between it
  for (let i = 0; i < 8; i++) {
    const x = (rnd() * 13) | 0, y = y0 + ((rnd() * (T - y0)) | 0);
    if ((y & 3) === 3) continue;
    rect(g, x, y, 2 + ((rnd() * 4) | 0), 1, rnd() < 0.5 ? RT.hi : RT.m);
  }
  // the seams gone: open black, with weed standing in the wet of them
  for (let y = y0; y < T; y++) {
    if ((y & 3) !== 3) continue;
    for (let x = 0; x < T; x++) {
      px(g, x, y, rnd() < 0.5 ? RT.hole : RT.crack);
      if (rnd() < 0.2) px(g, x, y - 1, rnd() < 0.5 ? WEED[1] : WEED[2]);
    }
    // a length of the seam gone green all the way along
    if (rnd() < 0.6) { const wx = (rnd() * 11) | 0, ww = 3 + ((rnd() * 5) | 0); for (let i = 0; i < ww && wx + i < T; i++) px(g, wx + i, y - 1, (i & 1) ? WEED[0] : WEED[1]); }
  }
  // one long split running the length of a board: black, with the wood curled pale along one lip of it
  {
    let x = 1 + ((rnd() * 5) | 0);
    const y = y0 + 1 + ((rnd() * Math.max(1, T - y0 - 2)) | 0), n = 7 + ((rnd() * 8) | 0);
    for (let i = 0; i < n && x < T - 1; i++) {
      const yy = y + (i > n / 2 && rnd() < 0.25 ? 1 : 0);
      if (yy >= T) break;
      px(g, x, yy, RT.hole);
      if (rnd() < 0.7) px(g, x, yy + 1, RT.hi);
      x++;
    }
  }
  // the stain of water that has stood in her for years — one broad dark blotch, not a scatter
  {
    const cx = 2 + rnd() * 12, cy = y0 + rnd() * Math.max(1, T - y0), r = 3 + rnd() * 2.6;
    ellipse(g, cx, cy, r, r * 0.7, RT.d, RT.m);
    ellipse(g, cx, cy, r * 0.55, r * 0.35, RT.crack, RT.d);
  }
  // a nail gone, leaving its hole and the rust it wept
  for (let i = 0; i < 2; i++) if (rnd() < 0.6) {
    const x = 1 + ((rnd() * 13) | 0), y = y0 + 1 + ((rnd() * Math.max(1, T - y0 - 2)) | 0);
    px(g, x, y, RT.hole); px(g, x, y + 1, IR.rust);
  }
  // and the holes: few and big enough to see through, not a spray of pinpricks
  for (let k = 0; k < holes; k++) {
    const cx = 3 + rnd() * 10, cy = y0 + 2 + rnd() * Math.max(1, T - y0 - 4);
    rotHole(g, rnd, cx, cy, 1.9 + rnd() * 1.3, 1.5 + rnd() * 1.1);
  }
  for (let i = 0; i < 2; i++) if (rnd() < 0.6) weedFringe(g, rnd, 1 + ((rnd() * 13) | 0), y0 + ((rnd() * Math.max(1, T - y0 - 2)) | 0), 2 + ((rnd() * 3) | 0));
}

// The walked surface of the rotted deck — or what is left of one. The top four rows are grey and bitten: the
// boards have sprung, the caulk is gone out of the gaps, there are holes through it and weed in every seam.
// Held at the same four rows as deckTop so the two butt together and the difference is all in the colour.
function rotTopTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rotBody(g, rnd, 5, 1);
  rect(g, 0, 0, T, 1, RT.l);
  rect(g, 0, 1, T, 1, RT.m);
  rect(g, 0, 2, T, 1, RT.d);
  rect(g, 0, 3, T, 1, RT.crack);
  rect(g, 0, 4, T, 1, RT.hole);
  // the grain raised by the weather, and the soft wood between it gone dark
  for (let i = 0; i < 8; i++) {
    const x = (rnd() * 14) | 0, y = (rnd() * 3) | 0;
    rect(g, x, y, 2 + ((rnd() * 4) | 0), 1, rnd() < 0.5 ? RT.hi : RT.crack);
  }
  // the gaps between the boards, wide open now, weed standing in them
  let gx = 1 + ((rnd() * 3) | 0);
  while (gx < T) {
    for (let y = 0; y < 5; y++) px(g, gx, y, y === 0 ? RT.crack : RT.hole);
    if (rnd() < 0.7) px(g, gx, 0, rnd() < 0.5 ? WEED[1] : WEED[2]);
    if (rnd() < 0.4) px(g, gx + 1, 1, WEED[2]);
    gx += 4 + ((rnd() * 3) | 0);
  }
  // weed slicked along the surface where the water never dries
  for (let k = 0; k < 2; k++) if (rnd() < 0.8) {
    const wx = (rnd() * 12) | 0, ww = 2 + ((rnd() * 4) | 0);
    for (let i = 0; i < ww && wx + i < T; i++) {
      px(g, wx + i, 0, (i & 1) ? WEED[0] : WEED[1]);
      if (rnd() < 0.6) px(g, wx + i, 1, WEED[2]);
    }
  }
  // a board sprung clean out: a gap in the surface with the splintered ends of its neighbours either side
  if (rnd() < 0.8) {
    const bx = 2 + ((rnd() * 10) | 0), bw = 2 + ((rnd() * 2) | 0);
    for (let i = 0; i < bw && bx + i < T; i++) { g.clearRect(bx + i, 0, 1, 2); px(g, bx + i, 2, RT.hole); }
    px(g, bx - 1, 0, RT.hi); px(g, bx + bw, 0, RT.hi);
    px(g, bx - 1, 1, RT.crack); px(g, bx + bw, 1, RT.crack);
  }
  // splinters standing up off the broken edges
  for (let i = 0; i < 4; i++) if (rnd() < 0.6) { const x = 1 + ((rnd() * 14) | 0); px(g, x, 0, RT.hi); px(g, x, 1, RT.m); }
  // a hole through the surface itself — kept off row 0, so there is always a lip left to stand on even while
  // the daylight underneath says there will not be for long
  if (rnd() < 0.8) rotHole(g, rnd, 3 + rnd() * 10, 3.4 + rnd() * 1.4, 1.4 + rnd() * 1.2, 1.1 + rnd() * 0.6);
  return c;
}

function rotTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rotBody(g, rnd, 0, 2 + ((rnd() * 2) | 0));
  return c;
}

// ---------- one-way platforms ----------

// A ship's gunwale: a capped rail on turned stanchions with the daylight showing between them. Four rows of cap
// you can stand on — hot on top, shaded under, the old red or ochre of its moulding still in the lee of it —
// then a mid-rail batten pinned to row 9 at both tile edges so a run of them reads as one continuous rail, and
// the stanchions standing between. `end` 'L'/'R' put a finished corner post at that edge instead.
function railTile(seed, end, v) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const red = v === 1;
  // the stanchions: two per tile in the middle variants, set so a run does not march in step
  const posts = end === 'L' ? [6, 12] : end === 'R' ? [3, 9] : v === 0 ? [3, 11] : v === 1 ? [7] : [1, 9];
  const stanchion = (x) => {
    for (let y = 4; y < T; y++) {
      const bulge = y > 7 && y < 11;
      px(g, x, y, bulge ? DK.l : DK.m);
      px(g, x + 1, y, bulge ? DK.m : DK.sh);
      if (bulge) { px(g, x - 1, y, DK.m); px(g, x + 2, y, DK.sh); }
    }
    // the turned beads above and below the swell of it
    for (const y of [7, 11]) { px(g, x, y, DK.hi); px(g, x + 1, y, DK.d); }
    px(g, x, T - 1, DK.sh); px(g, x + 1, T - 1, DK.caulk);
    if (rnd() < 0.4) paintFlake(g, rnd, x, 8 + ((rnd() * 2) | 0), 2, red);
  };
  // the mid-rail, pinned at both edges so it runs from tile to tile
  const midRail = (x0, x1) => {
    for (let x = x0; x < x1; x++) { px(g, x, 9, DK.hi); px(g, x, 10, DK.sh); }
    for (let i = 0; i < 3; i++) { const x = x0 + ((rnd() * Math.max(1, x1 - x0)) | 0); px(g, x, 9, rnd() < 0.5 ? DK.hot : DK.d); }
  };
  for (const p of posts) stanchion(p);
  midRail(end === 'L' ? 3 : 0, end === 'R' ? T - 3 : T);
  // the cap rail over the lot
  rect(g, 0, 0, T, 1, DK.hot);
  rect(g, 0, 1, T, 1, DK.hi);
  rect(g, 0, 2, T, 1, DK.m);
  rect(g, 0, 3, T, 1, DK.caulk);
  for (let i = 0; i < 6; i++) { const x = (rnd() * 14) | 0; rect(g, x, rnd() < 0.5 ? 0 : 1, 2 + ((rnd() * 4) | 0), 1, rnd() < 0.5 ? DK.hot : DK.d); }
  // the painted moulding under the cap, mostly flaked away
  for (let x = 0; x < T; x++) if (rnd() < 0.55) { px(g, x, 2, rnd() < 0.3 ? (red ? PT.redL : PT.ochL) : (red ? PT.red : PT.och)); }
  for (let i = 0; i < 3; i++) if (rnd() < 0.6) px(g, (rnd() * T) | 0, 0, SALT);
  // a lashing of rope round a stanchion, or a coil hung off the mid-rail
  if (!end && rnd() < 0.6) {
    const p = posts[(rnd() * posts.length) | 0];
    for (let y = 5; y < 7; y++) { px(g, p - 1, y, ROPE[1]); px(g, p, y, ROPE[0]); px(g, p + 1, y, ROPE[2]); }
  }
  if (!end && v === 2) {
    // a block hanging off the rail on a short tail of rope
    const bx = 13;
    for (let y = 10; y < 13; y++) px(g, bx, y, (y & 1) ? ROPE[0] : ROPE[1]);
    rect(g, bx - 1, 13, 3, 2, DK.m); px(g, bx - 1, 13, DK.hi); px(g, bx, 14, BR[1]); px(g, bx + 1, 14, DK.caulk);
  }
  if (end) {
    // the finished corner post: heavier than a stanchion, square, with a carved and painted cap on it
    const ex = end === 'L' ? 0 : T - 3;
    for (let y = 0; y < T; y++) for (let q = 0; q < 3; q++) {
      px(g, ex + q, y, q === 0 ? DK.l : q === 1 ? DK.m : DK.sh);
    }
    rect(g, ex, 0, 3, 1, DK.hot);
    rect(g, ex, 1, 3, 1, DK.hi);
    px(g, ex, 2, DK.l); px(g, ex + 1, 2, DK.m); px(g, ex + 2, 2, DK.d);
    rect(g, ex, 3, 3, 1, DK.caulk);
    // the carved panel, red or ochre, and a stud of bright brass in it
    rect(g, ex, 5, 3, 1, DK.hi);
    paintFlake(g, rnd, ex, 6, 3, red);
    paintFlake(g, rnd, ex, 8, 3, red);
    rect(g, ex, 10, 3, 1, DK.hi);
    px(g, ex + 1, 7, BR[0]); px(g, ex + 1, 8, BR[2]);
    for (let y = 11; y < T; y++) { px(g, ex, y, DK.m); px(g, ex + 1, y, DK.d); px(g, ex + 2, y, DK.sh); }
    if (rnd() < 0.6) { const y = 12 + ((rnd() * 2) | 0); px(g, ex, y, ROPE[0]); px(g, ex + 1, y, ROPE[1]); px(g, ex + 2, y, ROPE[2]); }
  }
  return c;
}

// A deck grating over the hold: a square lattice of battens with the hold showing through the gaps. It is a
// one-way, so the light that comes up through the hatch is on the underside of every batten — the bottom row
// is the brightest thing in the tile, which is what says "open" rather than "solid".
function grateTile(seed, v) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const hole = x => (x & 3) === 1 || (x & 3) === 2;
  // the fore-and-aft battens: two courses of them, the top faces hot, the bottom one lit from under
  rect(g, 0, 0, T, 1, DK.hot);
  rect(g, 0, 1, T, 1, DK.l);
  rect(g, 0, 5, T, 1, DK.m);
  rect(g, 0, 6, T, 1, DK.hi);
  for (let x = 0; x < T; x++) {
    if (hole(x)) {
      // the window itself: clean through, the coaming dark over it and the light of the hold under it
      px(g, x, 1, HL.caulk);
      px(g, x, 5, '#fff6e0');
      px(g, x, 6, DK.hot);
    } else {
      // the athwartship batten between two windows: one cheek shaded, one catching the light
      for (let y = 2; y < 5; y++) px(g, x, y, (x & 3) === 0 ? DK.sh : DK.m);
      px(g, x, 2, (x & 3) === 0 ? DK.caulk : DK.d);
      px(g, x, 4, DK.caulk);
    }
  }
  for (let i = 0; i < 6; i++) { const x = (rnd() * 14) | 0; px(g, x, 0, rnd() < 0.5 ? DK.hot : DK.d); }
  for (let i = 0; i < 3; i++) if (rnd() < 0.5) px(g, (rnd() * T) | 0, 0, SALT);
  if (v === 1) {
    // a ring of bright brass let into the grating, to lift it by
    const x = 5 + ((rnd() * 5) | 0);
    px(g, x, 0, BR[1]); px(g, x + 1, 0, BR[0]); px(g, x + 2, 0, BR[1]);
    px(g, x, 1, BR[2]); px(g, x + 2, 1, BR[2]);
    px(g, x + 1, 1, DK.caulk);
  } else {
    // tar worked into the corner of the coaming, and a batten gone soft
    const x = 2 + ((rnd() * 10) | 0);
    px(g, x, 0, HL.caulk); px(g, x + 1, 0, HL.m);
    if (rnd() < 0.6) { px(g, x, 1, HL.caulk); }
  }
  for (let i = 0; i < 3; i++) if (rnd() < 0.5) { const x = (rnd() * T) | 0; if (!hole(x)) px(g, x, 2, WEED[1]); }
  return c;
}

// ---------- fill and silt ----------

// Ship's timber below decks: heavier stuff, never weathered and never lit — the ceiling planking with the
// frames showing behind it, treenails, a knee bracket, and the dark of the hold in the gaps.
function fillTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  plankBody(g, rnd, 0, FL);
  // a frame standing behind the ceiling, its grain on end
  if (rnd() < 0.7) {
    const fx = 2 + ((rnd() * 11) | 0);
    for (let y = 0; y < T; y++) {
      px(g, fx, y, (y & 5) === 1 ? FL.hi : FL.l);
      px(g, fx + 1, y, (y & 3) === 2 ? FL.d : FL.m);
      px(g, fx + 2, y, FL.caulk);
    }
    for (let y = 1; y < T; y += 5) if (rnd() < 0.7) treenail(g, rnd, fx, y, FL);
  }
  for (const bx of [1, 9]) for (let y = 2; y < T; y += 4) if (rnd() < 0.45) treenail(g, rnd, bx + ((rnd() * 4) | 0), y, FL);
  if (rnd() < 0.35) bolt(g, rnd, 4 + ((rnd() * 8) | 0), 1 + 4 * ((rnd() * 4) | 0));
  // a knee: the angled brace where a beam lands on a frame
  if (rnd() < 0.35) {
    const kx = 3 + ((rnd() * 8) | 0), ky = 3 + ((rnd() * 7) | 0);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5 - i; j++) px(g, kx + i, ky + j, j === 0 ? FL.hi : i === 0 ? FL.m : FL.d);
  }
  for (let i = 0; i < 5; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, FL.caulk);
  return c;
}

// The bottom, seen through bright water: pale sand in ripples with the caustics of the noon sun dancing on it,
// shell grit, and the cut stone of the drowned city coming up through it. The ripple is identical in every
// variant so a floor runs seamlessly; only the grit, the stones and the weed change.
function siltTile(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 0, T, T, SILT[0]);
  for (let i = 0; i < 26; i++) px(g, (rnd() * T) | 0, (rnd() * T) | 0, rnd() < 0.5 ? SILT[2] : SILT[1]);
  for (let r = 0; r < 4; r++) {
    const yb = 3 + r * 4;
    for (let x = 0; x < T; x++) {
      const y = yb + Math.round(Math.sin((x / T) * Math.PI * 2 + r * 1.9));
      if (y < T) px(g, x, y, SILT[1]);
      if (y + 1 < T) px(g, x, y + 1, SILT[2]);
    }
  }
  rect(g, 0, 0, T, 1, SILT[2]);
  // the caustics: the net of light the surface throws down onto the sand
  for (let r = 0; r < 3; r++) {
    const yb = 2 + r * 5;
    for (let x = 0; x < T; x++) {
      const y = yb + Math.round(1.6 * Math.sin((x / T) * Math.PI * 4 + r * 2.3));
      if (y >= 0 && y < T && ((x + y) & 1)) px(g, x, y, r === 1 ? '#7fa4c8' : '#6b90b4');
    }
  }
  // shell grit
  for (let i = 0; i < 7; i++) { const x = (rnd() * T) | 0, y = 1 + ((rnd() * 15) | 0); px(g, x, y, rnd() < 0.5 ? BARN[1] : BARN[2]); if (rnd() < 0.3) px(g, x + 1, y, BARN[2]); }
  // a block of the drowned city's masonry standing out of the sand, its arris still square
  if (rnd() < 0.7) {
    const x = 1 + ((rnd() * 9) | 0), y = 4 + ((rnd() * 8) | 0), w = 3 + ((rnd() * 3) | 0), h = 2 + ((rnd() * 2) | 0);
    rect(g, x, y, w, h, STN[1]);
    rect(g, x, y, w, 1, STN[0]);
    rect(g, x, y + h - 1, w, 1, STN[2]);
    if (rnd() < 0.6) px(g, x + 1, y + 1, STN[2]);
    if (rnd() < 0.5) for (let i = 0; i < w; i++) if (rnd() < 0.5) px(g, x + i, y - 1, WEED[1]);
  }
  if (rnd() < 0.5) { const x = 2 + ((rnd() * 11) | 0), y = 6 + ((rnd() * 8) | 0); px(g, x, y, WEED[1]); px(g, x + 1, y - 1, WEED[0]); px(g, x + 2, y - 1, WEED[2]); }
  return c;
}

export function bakeFlotTiles() {
  const hullEdge = {};
  for (const eL of [0, 1]) for (const eR of [0, 1]) {
    if (!eL && !eR) continue;
    const k = eL + '' + eR;
    hullEdge[k] = [0, 1].map(i => hullEdgeTile(4200 + i * 3 + eL * 7 + eR * 13, eL, eR, i === 1 ? 1 : 0));
  }
  return {
    deck: [0, 1, 2, 3].map(i => deckTile(4100 + i)),
    deckTop: [0, 1, 2, 3].map(i => deckTopTile(4120 + i)),
    hull: [0, 1, 2, 3].map(i => hullTile(4140 + i, i === 2 ? 1 : i === 3 ? 2 : 0)),
    hullEdge,
    rot: [0, 1, 2].map(i => rotTile(4300 + i)),
    rotTop: [0, 1, 2].map(i => rotTopTile(4320 + i)),
    rail: [0, 1, 2].map(i => railTile(4400 + i, null, i)), railL: railTile(4410, 'L', 0), railR: railTile(4411, 'R', 0),
    fill: [0, 1, 2, 3].map(i => fillTile(4500 + i)),
    silt: [0, 1, 2].map(i => siltTile(4600 + i)),
    grate: [0, 1].map(i => grateTile(4700 + i, i)),
  };
}

// ---------- background layers ----------

// Noon, with the sun nearly overhead: hard blue at the top of the frame, going pale as it comes down, and a
// band of white glare sitting low, just over the horizon, where the light is coming back off the water.
// Stepped in twelfths like the other skies so it reads 16-bit rather than smeared.
export function bakeSkyGlare(h) {
  const [c, g] = canvas(1, h);
  const st = [[0, [26, 78, 158]], [0.18, [44, 104, 182]], [0.38, [82, 140, 206]], [0.58, [134, 180, 224]], [0.74, [188, 214, 236]], [0.86, [230, 240, 246]], [0.94, [255, 252, 238]], [1, [246, 240, 220]]];
  for (let y = 0; y < h; y++) {
    const q = Math.round((y / Math.max(1, h - 1)) * 11) / 11;
    let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
    const [t0, a] = st[i], [t1, b] = st[i + 1], k = Math.min(1, Math.max(0, (q - t0) / (t1 - t0)));
    px(g, 0, y, 'rgb(' + ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0) + ')');
  }
  return c;
}

// Horizontal bands of colour from row y0 to y1 across the width; at each change of band one row is checkered
// and the next lightly peppered, so the sea deepens in 16-bit steps rather than a smear. (Same helper as
// lw_tiles.js and reef_tiles.js.)
function bands(g, w, y0, y1, cols, cuts) {
  const n = y1 - y0, at = r => { const t = r / n; let i = 0; while (i < cuts.length && t >= cuts[i]) i++; return i; };
  for (let r = 0; r < n; r++) {
    const i = at(r), j = at(r + 1), p = r > 0 ? at(r - 1) : i, y = y0 + r;
    if (j !== i) { for (let x = 0; x < w; x++) px(g, x, y, ((x + y) & 1) ? cols[j] : cols[i]); }
    else { rect(g, 0, y, w, 1, cols[i]); if (p !== i) for (let x = 0; x < w; x++) if (((x + 2 * y) & 3) === 0) px(g, x, y, cols[p]); }
  }
}

// A gull: 'M' gliding or 'V' with the wings up.
function gull(g, w, x, y, up, col) {
  const pts = up ? [[0, 1], [1, 0], [2, 0], [3, 0], [4, 1]] : [[0, 0], [1, 1], [2, 1], [3, 1], [4, 0]];
  for (const [a, b] of pts) px(g, (((x + a) % w) + w) % w, y + b, col);
}

// A sail plan seen far off in the glare: stacked courses of canvas on a pale mast, the whole thing washed out
// toward the sky rather than silhouetted, because the haze on a day like this is bright, not dark.
function sailStack(g, w, x, base, ht, n, pale, mid, dark) {
  const wrap = v => ((Math.round(v) % w) + w) % w;
  for (let j = 0; j < ht; j++) px(g, wrap(x), base - j, j > ht - 3 ? pale : mid);
  for (let k = 0; k < n; k++) {
    const t = k / n;
    const hw = Math.max(1, Math.round((ht * 0.3) * (1 - t * 0.55)));
    const y0 = base - Math.round(ht * (0.1 + 0.78 * t)), sh = Math.max(2, Math.round(ht * 0.2));
    for (let i = -hw; i <= hw; i++) px(g, wrap(x + i), y0 - sh, mid);
    for (let j = 0; j < sh; j++) {
      const f = 1 - j / (sh * 2.2);
      for (let i = Math.round(-hw * f); i <= Math.round(hw * f); i++) {
        px(g, wrap(x + i), y0 - sh + 1 + j, i > hw * f - 2 ? mid : pale);
      }
    }
    px(g, wrap(x - hw), y0 - sh, dark); px(g, wrap(x + hw), y0 - sh, dark);
  }
}

// The far distance: the open sea under a hard flat horizon, the rest of the fleet standing out at anchor in the
// glare, and one big ship hull-down so that only her canvas is over the edge of the world. Heat comes off the
// water in a shimmer band that eats everything's feet.
// Horizon row = round(h * 0.44) — row 40 for h = 90. Everything from that row down is fully opaque sea; above
// it the layer is transparent apart from the ships, the shimmer and a gull or two. Tiles horizontally.
export function bakeFarFleet(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const H0 = Math.round(h * 0.44), D = h - H0, S = w / 320;
  const wrap = x => ((Math.round(x) % w) + w) % w;
  bands(g, w, H0, h, ['#e8f2fa', '#79b0d8', '#3d7fb4', '#1d5590', '#123f70'], [2 / D, 0.3, 0.6, 0.88]);
  const lighter = y => { const t = (y - H0) / D; return t < 0.3 ? '#a8cde8' : t < 0.6 ? '#5d9bca' : t < 0.88 ? '#2f6ca6' : '#1c5188'; };
  // the swell: short dashes a step lighter than the water they lie on, longer and sparser as it comes at us
  for (let y = H0 + 3; y < h; y++) {
    const r = y - H0, n = Math.round(w / (7 + r * 0.28));
    for (let i = 0; i < n; i++) {
      const x = (rnd() * w) | 0, len = 1 + ((r / 8) | 0) + (rnd() < 0.3 ? 1 : 0);
      for (let k = 0; k < len; k++) px(g, (x + k) % w, y, lighter(y));
    }
  }
  // the sun's track on the water: a broad path of sparks, widening as it comes toward us
  const sunX = Math.round(w * 0.62);
  for (let y = H0 + 1; y < h; y++) {
    const t = (y - H0) / D, spread = 6 + t * t * 46, n = Math.round(2 + t * 9);
    for (let i = 0; i < n; i++) {
      const x = wrap(sunX + (rnd() - 0.5) * spread * 2);
      const len = 1 + ((t * 3) | 0);
      for (let k = 0; k < len; k++) px(g, (x + k) % w, y, rnd() < 0.45 ? FOAM : FOAM_D);
    }
  }
  // the shimmer: the air over the water boiling, so the horizon itself is not quite a line
  for (let y = H0 - 5; y < H0 + 2; y++) {
    for (let x = 0; x < w; x++) {
      if (y >= H0) { if (rnd() < 0.3) px(g, x, y, rnd() < 0.5 ? '#eaf4fc' : '#c6dcf0'); continue; }
      if (((x + y) & 1) || y > H0 - 3) px(g, x, y, 'rgba(236,246,252,' + (0.14 + (y - (H0 - 5)) * 0.1).toFixed(3) + ')');
    }
  }
  // the fleet at anchor, far out: pale sail plans standing on nothing, their hulls lost in the shimmer
  const PALE = '#f2f6fa', MID = '#cfdfee', DARK = '#a8c2d8';
  sailStack(g, w, wrap(40 * S + rnd() * 10), H0, 16, 2, PALE, MID, DARK);
  sailStack(g, w, wrap(96 * S + rnd() * 10), H0 - 1, 12, 2, PALE, MID, DARK);
  sailStack(g, w, wrap(208 * S + rnd() * 10), H0, 14, 2, PALE, MID, DARK);
  sailStack(g, w, wrap(262 * S + rnd() * 10), H0 - 1, 10, 2, PALE, MID, DARK);
  sailStack(g, w, wrap(300 * S + rnd() * 8), H0, 9, 2, PALE, MID, DARK);
  // ONE BIG SHIP, hull-down: her hull is over the curve of the world, so her courses start above the horizon
  // and the three masts of her go up a third of the sky. Her feet dissolve in the shimmer.
  {
    const x0 = wrap(146 * S), base = H0 - 3;
    for (const [dx, ht, n] of [[-13, 26, 3], [0, 34, 3], [13, 28, 3]]) sailStack(g, w, wrap(x0 + dx * S), base, ht, n, PALE, MID, DARK);
    // her stays and the flag at the main truck
    for (let j = 0; j < 20; j++) px(g, wrap(x0 - 13 * S - j * 0.7), base - 24 + Math.round(j * 1.1), DARK);
    for (let j = 0; j < 18; j++) px(g, wrap(x0 + 13 * S + j * 0.7), base - 20 + Math.round(j * 1.0), DARK);
    const fy = base - 35;
    for (let i = 0; i < 6; i++) { px(g, wrap(x0 + i), fy, i < 4 ? PT.red : PT.redD); if (i < 4) px(g, wrap(x0 + i), fy + 1, PT.redD); }
    // the shimmer closing over whatever of her is lowest
    for (let x = -18; x < 18; x++) for (let y = base - 2; y <= base; y++) if (rnd() < 0.55) px(g, wrap(x0 + x * S), y, rnd() < 0.5 ? '#e2eef8' : '#c2d8ee');
  }
  for (let i = 0; i < 4; i++) gull(g, w, (rnd() * w) | 0, H0 - 12 - ((rnd() * 16) | 0), rnd() < 0.5, '#8aa8c4');
  return c;
}

// The mid distance: four of the flotilla's ships lying at anchor broadside on, their masts and yards crossing
// one another, washing strung between them and a cargo net slung over the gap, with the boats of the town
// pulling between the hulls.
// Waterline row = round(h * 0.72) — row 101 for h = 140. Everything from that row down is fully opaque water,
// so the layer holds up on its own if the far layer is switched off; above it, transparent apart from the
// ships. Laid out for 480 wide (scales with w). Tiles horizontally.
export function bakeMidShips(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const W = Math.round(h * 0.72), S = w / 480;
  const wrap = x => ((Math.round(x) % w) + w) % w;
  const M = { hull: '#43372c', hullL: '#574838', hullD: '#2a221b', caulk: '#18120e', wale: '#cbb894', mast: '#584a3a', mastL: '#6e5d48', rope: '#8c7a5e', cloth: '#f0e9d4', clothD: '#cdc3a8', port: '#140f0c', glass: '#9ad2ea', copper: '#4aa183' };
  bands(g, w, W, h, ['#9fc8e2', '#3d7fb4', '#1d5590', '#123f70'], [0.06, 0.36, 0.78]);
  for (let y = W + 2; y < h; y++) {
    const r = y - W, n = Math.round(w / (10 + r * 0.3));
    for (let i = 0; i < n; i++) {
      const x = (rnd() * w) | 0, len = 2 + ((r / 6) | 0) + (rnd() < 0.3 ? 1 : 0);
      const col = r < 10 ? '#6aa6d2' : r < 22 ? '#2f6ca6' : '#1a4e86';
      for (let k = 0; k < len; k++) px(g, (x + k) % w, y, col);
    }
  }
  // the sparkle the noon sun puts on the water right where it meets a hull
  const floatsIn = (x, wd) => {
    for (let i = 0; i < wd; i++) {
      const xx = wrap(x + i);
      px(g, xx, W, (i % 3) ? FOAM : FOAM_D);
      if (rnd() < 0.4) px(g, xx, W + 1, FOAM_D);
      for (let y = W + 2; y < W + 8 && y < h; y++) if (((xx + y) & 1) && rnd() < 0.7 - (y - W) * 0.09) px(g, xx, y, '#18477c');
    }
  };
  // A ship broadside on: her sheer sweeping up to bow and stern, a bright wale along it, a painted strake, a
  // row of gunports, and her lower masts standing out of her with their yards across.
  const ship = (x0, len, ht, paintRed, nmast, rig) => {
    const deck = i => {
      const u = i / (len - 1);
      return Math.round(W - ht * (0.8 + 0.2 * Math.pow(Math.abs(u - 0.46) * 2, 2.2)));
    };
    for (let i = 0; i < len; i++) {
      const x = wrap(x0 + i), t0 = deck(i);
      for (let y = t0; y <= W; y++) {
        const k = (y - t0) % 4;
        let col = k === 3 ? M.caulk : k === 0 ? M.hullL : k === 1 ? M.hull : M.hull;
        if ((y - t0) / Math.max(1, W - t0) > 0.7 && k !== 3) col = M.hullD;
        if (rnd() < 0.04) col = M.caulk;
        px(g, x, y, col);
      }
      // the wale: a heavy bright band run along her side under the rail, and the paint over it
      px(g, x, t0, M.wale);
      px(g, x, t0 + 1, (i & 3) ? M.wale : M.hullL);
      px(g, x, t0 + 2, M.caulk);
      px(g, x, t0 + 3, rnd() < 0.2 ? M.hullL : (paintRed ? PT.red : PT.och));
      px(g, x, t0 + 4, rnd() < 0.2 ? M.hull : (paintRed ? PT.redD : PT.ochD));
      // the green of her copper where she floats
      if (rnd() < 0.7) px(g, x, W - 1 - ((rnd() * 3) | 0), M.copper);
    }
    // her gunports, square holes in a straight row following the sheer
    for (let k = 0; k < Math.max(2, Math.round(len / 13)); k++) {
      const i = Math.round(len * 0.1) + k * Math.round(len * 0.8 / Math.max(1, Math.round(len / 13))), t0 = deck(i);
      if (i < 2 || i > len - 4) continue;
      const py = t0 + 7;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) px(g, wrap(x0 + i + a), py + b, M.port);
      px(g, wrap(x0 + i - 1), py - 1, M.wale); px(g, wrap(x0 + i + 3), py + 3, M.hullD);
      // the lid of it swung up and lashed
      if (rnd() < 0.5) for (let a = 0; a < 3; a++) px(g, wrap(x0 + i + a), py - 2, a === 0 ? M.hullL : M.hull);
    }
    // her quarterdeck, raised aft, with the stern windows in it and an awning rigged over the top against
    // the sun — which is what makes her read as a ship and not as an open boat
    {
      const qw = Math.round(len * 0.3), qh = Math.round(ht * 0.4), qx = x0, qt = deck(0) - qh;
      for (let a = 0; a < qw; a++) for (let b = 0; b < qh; b++) {
        const k = b % 4;
        px(g, wrap(qx + a), qt + b, k === 3 ? M.caulk : k === 0 ? M.hullL : M.hull);
      }
      for (let a = 0; a < qw; a++) { px(g, wrap(qx + a), qt, M.wale); px(g, wrap(qx + a), qt + 1, (a & 3) ? M.hullL : M.hull); }
      for (let a = 0; a < qw; a++) px(g, wrap(qx + a), qt - 1, (a & 3) ? DK.hot : DK.m);
      // the stern windows, with the sun on the glass
      for (let k = 0; k < Math.max(2, Math.round(qw / 9)); k++) {
        const wx = qx + 3 + k * 8, wy = qt + Math.round(qh * 0.45);
        for (let a = 0; a < 4; a++) for (let b = 0; b < 5; b++) px(g, wrap(wx + a), wy + b, (a === 0 || b === 0) ? M.cloth : (a + b) & 1 ? M.glass : '#6fb0cc');
      }
      // the carved and painted rail along the top of her, gone shabby
      for (let a = 0; a < qw; a++) if (rnd() < 0.6) px(g, wrap(qx + a), qt + 2, rnd() < 0.4 ? (paintRed ? PT.redL : PT.ochL) : (paintRed ? PT.red : PT.och));
      // the awning, a square of canvas on four poles
      for (let a = 0; a < qw - 4; a++) px(g, wrap(qx + 2 + a), qt - 9 + Math.round(2 * Math.sin(Math.PI * a / (qw - 5))), (a & 5) ? M.cloth : M.clothD);
      for (const px2 of [qx + 2, qx + qw - 3]) for (let b = 0; b < 9; b++) px(g, wrap(px2), qt - 9 + b, M.mast);
    }
    // her bowsprit, going out over the water at the other end
    for (let j = 0; j < Math.round(len * 0.26); j++) {
      const bx = x0 + len - 2 + j, by = deck(len - 1) - 2 - Math.round(j * 0.42);
      px(g, wrap(bx), by, M.mast); px(g, wrap(bx), by + 1, M.mastL);
    }
    // her masts, with the yards across them, and the shrouds going down to her side
    for (let k = 0; k < nmast; k++) {
      const i = Math.round(len * (0.2 + 0.6 * (k / Math.max(1, nmast - 1 || 1))));
      const base = deck(i), mh = Math.round(ht * (2.1 + rnd() * 0.7));
      for (let j = 0; j < mh; j++) {
        const y = base - j; if (y < 1) break;
        const thin = j > mh * 0.62;
        px(g, wrap(x0 + i), y, M.mast); px(g, wrap(x0 + i + 1), y, (j & 3) ? M.mastL : M.mast);
        if (!thin) px(g, wrap(x0 + i + 2), y, M.hullD);
      }
      // the top: where the lower mast is doubled by the topmast, with the crosstrees across it
      {
        const ty = base - Math.round(mh * 0.62);
        for (let a = -4; a <= 4; a++) { px(g, wrap(x0 + i + a), ty, M.mast); px(g, wrap(x0 + i + a), ty - 1, M.mastL); }
        for (let a = -2; a <= 2; a++) px(g, wrap(x0 + i + a), ty + 1, M.hullD);
      }
      // the yards, the lower one long, and a sail furled in a tight roll on it
      for (let q = 0; q < 2; q++) {
        const yy = base - Math.round(mh * (0.42 + q * 0.33)), yl = Math.round(len * (0.17 - q * 0.05));
        for (let a = -yl; a <= yl; a++) { px(g, wrap(x0 + i + a), yy, M.mast); px(g, wrap(x0 + i + a), yy - 1, M.mastL); }
        if (rig) {
          // the sail furled in a tight roll along the yard, the gaskets showing as dark bands in it
          for (let a = -yl + 1; a < yl; a++) {
            const bunt = Math.abs(a) < yl * 0.5;
            px(g, wrap(x0 + i + a), yy + 1, ((a + 8) % 7 === 0) ? M.mast : bunt ? M.cloth : M.clothD);
            if (bunt) px(g, wrap(x0 + i + a), yy + 2, ((a + 8) % 7 === 0) ? M.mast : M.clothD);
          }
        }
      }
      // the shrouds: a fan of line from the masthead down to the channels on her side
      for (const side of [-1, 1]) {
        for (let s = 0; s < 3; s++) {
          const ex = x0 + i + side * Math.round(len * (0.05 + s * 0.025)), ey = deck(i) + 4;
          const ty = base - mh + 3 + s;
          for (let j = 0; j <= 26; j++) {
            const t = j / 26;
            if (rnd() < 0.12) continue;
            px(g, wrap(x0 + i + (ex - x0 - i) * t), Math.round(ty + (ey - ty) * t), M.rope);
          }
        }
      }
    }
    // her anchor cable going down into the water at the bow
    for (let j = 0; j < 10; j++) px(g, wrap(x0 + len - 2 + j * 0.5), deck(len - 3) + 5 + j, M.rope);
    floatsIn(x0, len);
  };
  // the washing the town hangs between two ships: a slack line with the flotilla's shirts on it
  const washing = (xa, xb, y) => {
    const n = Math.round(xb - xa);
    const sag = 8;
    const ly = i => y + Math.round(sag * Math.sin(Math.PI * (i / n)));
    for (let i = 0; i < n; i++) px(g, wrap(xa + i), ly(i), M.rope);
    // the flotilla's shirts and breeches, pegged out and hanging dead still in the heat
    for (let k = 0; k < Math.max(3, Math.round(n / 9)); k++) {
      const i = 3 + ((rnd() * (n - 7)) | 0), wd = 5 + ((rnd() * 6) | 0), hh = 8 + ((rnd() * 9) | 0);
      const cols = [M.cloth, '#e2dcc4', PT.ochL, '#a8c8dc', PT.redL, '#c0b49a', '#8fb0a0'];
      const col = cols[(rnd() * cols.length) | 0];
      for (let a = 0; a < wd; a++) {
        const taper = (a === 0 || a === wd - 1) ? 2 : 0;
        for (let b = 0; b < hh - taper; b++) {
          px(g, wrap(xa + i + a), ly(i + a) + 1 + b, b === 0 ? M.cloth : (a === wd - 1 ? M.clothD : ((a + b) & 7) === 0 ? M.clothD : col));
        }
      }
      // the sleeves of it, hanging out either side
      if (rnd() < 0.6) for (let b = 0; b < 4; b++) { px(g, wrap(xa + i - 1), ly(i) + 3 + b, col); px(g, wrap(xa + i + wd), ly(i + wd) + 3 + b, M.clothD); }
    }
  };
  // a cargo net slung over the gap between two hulls, with a bale or two caught in it
  const cargoNet = (xa, xb, y, dep) => {
    const n = Math.round(xb - xa);
    for (let i = 0; i <= n; i += 4) {
      for (let j = 0; j <= dep; j++) {
        const sag = Math.round(dep * 0.35 * Math.sin(Math.PI * (i / n)));
        px(g, wrap(xa + i + Math.round(j * 0.35)), y + j + sag, M.rope);
      }
    }
    for (let j = 0; j <= dep; j += 4) {
      for (let i = 0; i <= n; i++) {
        const sag = Math.round(dep * 0.35 * Math.sin(Math.PI * (i / n)));
        px(g, wrap(xa + i), y + j + sag, M.rope);
      }
    }
    const bx = xa + Math.round(n * 0.45), by = y + Math.round(dep * 0.5);
    for (let a = 0; a < 9; a++) for (let b = 0; b < 7; b++) px(g, wrap(bx + a), by + b, b === 0 ? '#b8a078' : a === 8 ? '#6e5c42' : '#8e7a58');
  };
  // a boat pulling across between the hulls, with her oars out and somebody at them
  const boat = (x, y, dir) => {
    const len = 24;
    for (let i = 0; i < len; i++) {
      const u = i / (len - 1), d = 1 + Math.round(4 * Math.sin(Math.PI * Math.pow(u, 0.9)));
      for (let j = 0; j < d; j++) px(g, wrap(x + i), y - d + 1 + j, j === 0 ? '#e0cda6' : j === 1 ? '#cbb894' : j > d - 2 ? '#3c3126' : '#6e5c42');
    }
    px(g, wrap(x), y - 4, '#6e5c42'); px(g, wrap(x + len - 1), y - 5, '#6e5c42');
    // the two at the oars, and the blades biting either side of her
    for (const [fx, fy] of [[7, 0], [15, 0]]) {
      px(g, wrap(x + fx), y - 9 + fy, '#c8a078'); px(g, wrap(x + fx), y - 8 + fy, '#3b4a62');
      px(g, wrap(x + fx), y - 7 + fy, '#3b4a62'); px(g, wrap(x + fx - 1), y - 8 + fy, '#5a6a84');
    }
    for (const fx of [7, 15]) for (let j = 0; j < 7; j++) {
      px(g, wrap(x + fx - (j + 2) * dir), y - 7 + Math.round(j * 0.8), M.mastL);
      px(g, wrap(x + fx + (j + 2) * dir), y - 7 + Math.round(j * 0.8), M.mastL);
    }
    // her bow wave and the wake she pulls behind her
    for (let i = 0; i < len; i++) if (rnd() < 0.6) px(g, wrap(x + i), y + 1, FOAM_D);
    for (let i = 0; i < 5; i++) { px(g, wrap(x - 1 - i), y, i < 2 ? FOAM : FOAM_D); px(g, wrap(x + len + i), y, i < 2 ? FOAM : FOAM_D); }
  };
  const A = wrap(30 * S), B = wrap(168 * S), C = wrap(286 * S), Dx = wrap(392 * S);
  ship(A, Math.round(104 * S), 40, true, 3, true);
  ship(B, Math.round(86 * S), 34, false, 2, true);
  ship(C, Math.round(78 * S), 30, true, 2, true);
  ship(Dx, Math.round(62 * S), 26, false, 2, true);
  washing(A + Math.round(96 * S), B + 6, W - 40);
  washing(B + Math.round(80 * S), C + 6, W - 34);
  cargoNet(C + Math.round(72 * S), Dx + 4, W - 26, 16);
  boat(wrap(140 * S), W - 2, 1);
  boat(wrap(262 * S), W - 1, -1);
  boat(wrap(370 * S), W - 3, 1);
  for (let i = 0; i < 5; i++) gull(g, w, (rnd() * w) | 0, 8 + ((rnd() * 40) | 0), rnd() < 0.5, '#e8f0f6');
  return c;
}

// The near band: the flank of one of the big ships crossing the whole frame, close enough to count her bolts.
// A row of gunports along her, the butt of a mast standing out of her deck and going off the top of the frame,
// a coil of cable big enough to sit on, and one of her boats slung against her side.
// Her rail runs at about row 92 (+/- 10); everything below row 106 is fully opaque hull, so the layer closes
// off the bottom of the frame on its own. Transparent above her rail apart from the mast and the boat's tackle.
// Laid out for 640 wide. Tiles horizontally.
export function bakeNearHulls(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const S = w / 640;
  let rr = rnd;
  const at = (fn, x, ...a) => { const sd = (rnd() * 4294967296) >>> 0; for (const dx of [-w, 0, w]) { rr = mulberry(sd); fn(x + dx, ...a); } rr = rnd; };
  const N = { hull: '#221c16', hullM: '#30281f', hullL: '#40362a', hullHi: '#554733', caulk: '#0f0c0a',
    wale: '#c7b18c', waleL: '#e4d3b0', waleD: '#8a7655', port: '#0a0806', iron: '#2e3238', ironL: '#79818a',
    rust: '#8c4c26', barn: '#f2ecdc', barnD: '#b7b0a0', weed: '#1d3a28', weedL: '#2f5a3a', cu: '#3c7e68', cuL: '#4e9a7f',
    mast: '#6a5840', mastL: '#8a7354', mastD: '#463a28', rope: '#b79f76', ropeD: '#7c6a4e' };
  const ph = [rr() * 6, rr() * 6];
  // her rail: a long easy sheer, lifting a little toward one end of the frame
  const railY = x => { const u = x / w * Math.PI * 2; return Math.round(92 - 8 * Math.sin(u + ph[0]) - 3 * Math.sin(u * 3 + ph[1])); };
  // her side, from the rail down: courses of black plank on a pitch of 5, getting darker as she goes under
  const side = () => {
    for (let x = 0; x < w; x++) {
      const t0 = railY(x);
      for (let y = t0; y < h; y++) {
        const k = (y - t0) % 5, deep = (y - t0) / (h - t0);
        let col = k === 4 ? N.caulk : k === 0 ? N.hullL : k === 1 ? N.hullM : k === 2 ? N.hullM : N.hull;
        if (deep > 0.5 && k !== 4) col = k === 0 ? N.hullM : N.hull;
        if (deep > 0.8 && k !== 4) col = k === 0 ? N.hull : '#191411';
        if (rr() < 0.035) col = N.caulk;
        else if (rr() < 0.03 && deep < 0.5) col = N.hullHi;
        px(g, x, y, col);
      }
      // the cap of her rail, hot in the sun, and the heavy wale under it
      px(g, x, t0 - 2, (x & 5) ? DK.hot : DK.hi);
      px(g, x, t0 - 1, DK.m);
      px(g, x, t0, N.waleL);
      px(g, x, t0 + 1, N.wale);
      px(g, x, t0 + 2, N.waleD);
      px(g, x, t0 + 3, N.caulk);
      // the painted strake under the wale, flaking
      px(g, x, t0 + 4, rr() < 0.2 ? N.hullL : rr() < 0.5 ? PT.redL : PT.red);
      px(g, x, t0 + 5, rr() < 0.25 ? N.hull : PT.redD);
    }
  };
  // a gunport: a square hole with a moulded surround, the dark of the gundeck in it, and either the muzzle of
  // a gun run out or the port's own lid triced up over it
  const gunport = (x, gun) => {
    const t0 = railY(x), y0 = t0 + 30, wd = 26, ht = 24;
    for (let a = -3; a < wd + 3; a++) for (let b = -3; b < ht + 3; b++) {
      const inside = a >= 0 && a < wd && b >= 0 && b < ht;
      if (inside) { px(g, x + a, y0 + b, N.port); continue; }
      // the moulding round her: bright over the top where the sun reaches it, dark under
      const col = b < 0 ? (b === -3 ? N.waleL : b === -2 ? N.wale : N.waleD)
        : b >= ht ? (b === ht ? N.waleD : b === ht + 1 ? N.wale : N.caulk)
          : (a < 0 ? (a === -3 ? N.waleD : N.wale) : (a === wd + 2 ? N.caulk : N.waleD));
      px(g, x + a, y0 + b, col);
    }
    // the light that gets in over the sill, and the deck beam showing at the back of her
    for (let a = 1; a < wd - 1; a++) if (rr() < 0.7) px(g, x + a, y0 + 1, '#2a2219');
    for (let a = 2; a < wd - 2; a++) if (rr() < 0.5) px(g, x + a, y0 + ht - 2, '#221b15');
    if (gun) {
      // a gun run out: a black barrel with the reinforcing rings on her and her carriage in the dark
      const by = y0 + Math.round(ht * 0.42), bh = 11;
      for (let a = -9; a < wd - 3; a++) for (let b = 0; b < bh; b++) {
        const t = b / bh;
        px(g, x + a, by + b, t < 0.15 ? N.iron : t < 0.4 ? '#3a4046' : t < 0.75 ? '#22262b' : '#131619');
      }
      for (const rx2 of [-9, -6, 2]) for (let b = 0; b < bh; b++) px(g, x + rx2, by + b, b < 3 ? N.ironL : b < 7 ? '#474e55' : '#1a1e22');
      for (let b = 2; b < bh - 2; b++) px(g, x - 10, by + b, N.port);
      // the muzzle ring, catching the light
      for (let b = 0; b < 4; b++) px(g, x - 9, by + b, N.ironL);
    } else {
      // the lid of the port triced up over her, and the lanyard that holds it
      for (let a = -3; a < wd + 3; a++) for (let b = 0; b < 12; b++) {
        px(g, x + a, y0 - 17 + b, b === 0 ? DK.hi : b === 1 ? DK.m : b === 11 ? N.caulk : ((a + b) & 1) ? N.hullL : N.hullM);
      }
      for (let a = -2; a < wd + 3; a += 6) for (let b = 2; b < 11; b++) px(g, x + a, y0 - 17 + b, N.caulk);
      for (let j = 0; j < 14; j++) px(g, x + 3 + Math.round(j * 0.2), y0 - 17 - j, (j & 1) ? N.rope : N.ropeD);
    }
    // the chain plate and deadeye that come down her side beside the port
    if (rr() < 0.6) {
      const dx = x + wd + 9;
      for (let b = 0; b < 14; b++) { px(g, dx, t0 + 8 + b, N.iron); px(g, dx + 1, t0 + 8 + b, N.ironL); px(g, dx + 2, t0 + 8 + b, N.iron); }
      for (let b = 0; b < 6; b++) for (let a = 0; a < 7; a++) px(g, dx - 2 + a, t0 - 2 + b, (a === 2 || a === 4) && b > 1 && b < 5 ? N.caulk : (b === 0 ? DK.hi : DK.m));
    }
    // the steps up her side, cleats nailed to the planking, where a boat comes alongside
    if (!gun && rr() < 0.6) {
      const lx = x - 26;
      for (let k = 0; k < 7; k++) {
        const ly = t0 + 14 + k * 14;
        if (ly > h - 30) break;
        for (let a = 0; a < 11; a++) { px(g, lx + a, ly, DK.m); px(g, lx + a, ly + 1, DK.sh); px(g, lx + a, ly + 2, N.caulk); }
      }
    }
  };
  // the butt of a mast coming out of her deck, hooped with iron, its boot wedged and tarred
  const mastButt = (x) => {
    const t0 = railY(x), wd = 36;
    for (let y = 0; y < t0 + 6; y++) {
      for (let a = 0; a < wd; a++) {
        const u = a / (wd - 1);
        const col = u < 0.12 ? N.mastD : u < 0.3 ? N.mast : u < 0.52 ? N.mastL : u < 0.78 ? N.mast : N.mastD;
        px(g, x + a, y, col);
      }
      if (rr() < 0.2) px(g, x + 2 + ((rr() * (wd - 4)) | 0), y, N.mastD);
    }
    // the iron hoops round her
    for (const hy of [14, 40, 70]) {
      if (hy > t0) continue;
      for (let b = 0; b < 4; b++) for (let a = -1; a < wd + 1; a++) px(g, x + a, hy + b, b === 0 ? N.ironL : b === 3 ? '#1a1d21' : N.iron);
      for (let a = 0; a < wd; a += 6) px(g, x + a, hy + 1, N.rust);
    }
    // the wedges round her heel, and the tar poured over them
    for (let a = -4; a < wd + 4; a++) {
      const d = 6 + Math.round(3 * Math.cos((a / wd - 0.5) * 3));
      for (let b = 0; b < d; b++) px(g, x + a, t0 - 4 + b, b === 0 ? DK.hi : b < 2 ? DK.m : rr() < 0.4 ? HL.caulk : HL.m);
    }
    // a rope coiled and hung on a pin at the mast's foot
    for (let k = 0; k < 3; k++) {
      const cy = t0 - 18 + k * 5;
      for (let a = 0; a < 10; a++) px(g, x + wd + 2 + a, cy + Math.round(2 * Math.sin(Math.PI * a / 9)), (a & 1) ? N.rope : N.ropeD);
    }
  };
  // a coil of cable, big as a man, flaked down on her deck against the rail
  const cable = (x) => {
    const t0 = railY(x), cy = t0 - 11, rx = 27, ry = 10;
    // the thickness of her where she sits on the deck
    ellipse(g, x, cy + 4, rx, ry, '#4a3e2d');
    // the turns, flaked down one inside the other, each one the round of a hawser
    for (let k = 0; k < 5; k++) {
      const f = 1 - k * 0.19;
      ellipse(g, x, cy, rx * f, ry * f, (k & 1) ? N.ropeD : N.rope);
      ellipse(g, x, cy - 1, rx * f - 1.6, ry * f - 1.2, (k & 1) ? '#6b5b42' : '#96805e');
      // the light along the upper shoulder of each turn
      for (let a = -rx * f; a < rx * f; a += 3) {
        const u = a / (rx * f);
        if (Math.abs(u) > 0.94) continue;
        px(g, Math.round(x + a), Math.round(cy - ry * f * Math.sqrt(Math.max(0, 1 - u * u))) + 1, '#e2cfa4');
      }
    }
    ellipse(g, x, cy, rx * 0.13, ry * 0.13, '#312819');
    // her end led away over the rail to a bitt
    for (let j = 0; j < 24; j++) px(g, x + rx + j, cy + 6 + Math.round(j * 0.3), (j & 1) ? N.rope : N.ropeD);
    for (let b = 0; b < 18; b++) for (let a = 0; a < 6; a++) px(g, x + rx + 24 + a, cy + 12 + b, b === 0 ? DK.hi : a === 5 ? DK.sh : DK.m);
  };
  // one of her boats slung in against her side on a pair of falls
  const hangingBoat = (x) => {
    const t0 = railY(x), by = t0 + 20, len = 54, dep = 16;
    for (let i = 0; i < len; i++) {
      const u = i / (len - 1);
      const d = Math.round(dep * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.7));
      for (let b = 0; b < d; b++) {
        const t = b / Math.max(1, d);
        px(g, x + i, by + b, b === 0 ? DK.hi : t < 0.2 ? DK.l : t < 0.45 ? DK.m : t < 0.8 ? DK.d : DK.sh);
      }
      if (d > 3) { px(g, x + i, by + 1, (i & 3) ? DK.hot : DK.l); px(g, x + i, by + d - 1, HL.caulk); }
    }
    // her strakes, her thwarts, and the stem and stern posts
    for (let i = 0; i < len; i++) {
      const u = i / (len - 1), d = Math.round(dep * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.7));
      if (d > 6) { px(g, x + i, by + 4, DK.sh); px(g, x + i, by + 8, DK.sh); }
    }
    for (const ti of [12, 26, 40]) for (let b = 0; b < 3; b++) px(g, x + ti, by + 1 + b, DK.d);
    for (let b = 0; b < 6; b++) { px(g, x, by + b, DK.sh); px(g, x + len - 1, by + b, DK.sh); }
    // her gunwale painted, and the falls she hangs on going up out of frame
    for (let i = 2; i < len - 2; i++) if (rr() < 0.6) px(g, x + i, by + 2, rr() < 0.4 ? PT.ochL : PT.och);
    for (const fx of [x + 6, x + len - 7]) {
      for (let j = 0; j < by - 6; j++) px(g, fx, by - j, (j & 1) ? N.rope : N.ropeD);
      // the block she is slung from
      for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) px(g, fx - 1 + a, by - 8 + b, b === 0 ? DK.hi : a === 3 ? DK.sh : DK.m);
      px(g, fx, by - 5, BR[1]); px(g, fx + 1, by - 5, BR[2]);
    }
  };
  side();
  // where she sits in the water: her copper, laid in plates, the crust of barnacle along its top edge and the
  // weed hanging off it in curtains. A band, not a sprinkle — this is the line that says how deep she floats.
  const lowMark = () => {
    const cy = x => h - 46 + Math.round(4 * Math.sin(x / w * Math.PI * 2 * 2 + ph[0]));
    // she goes down into the shadow of her own bottom, so the green darkens the deeper it gets
    const ramp = [[N.cuL, N.cu, '#27584a'], ['#428a72', '#357160', '#224c40'], ['#376f5e', '#2c5e50', '#1c4036'], ['#2c5b4e', '#234c42', '#17342c']];
    for (let x = 0; x < w; x++) {
      const y0 = cy(x);
      for (let y = y0; y < h; y++) {
        const t = (y - y0) / Math.max(1, h - y0), k = (y - y0) % 11;
        const band = ramp[Math.min(ramp.length - 1, (t * ramp.length) | 0)];
        px(g, x, y, k === 0 ? band[0] : k === 10 ? band[2] : rr() < 0.12 ? (rr() < 0.5 ? band[0] : band[2]) : band[1]);
      }
      px(g, x, y0 - 1, (x & 1) ? N.caulk : '#1b3c33');
    }
    // the butt edges of the plates, staggered course by course and not every plate showing one
    for (let x = 0; x < w; x++) for (let y = cy(x); y < h; y++) {
      const k = ((y - cy(x)) / 11) | 0;
      if (((x + k * 9) % 26) === 0 && rr() < 0.8) px(g, x, y, '#2b6053');
    }
    // the crust along the top of her copper, where the water works
    for (let k = 0; k < w / 9; k++) {
      const x = (rr() * w) | 0, y = cy(x) - 2 - ((rr() * 10) | 0), n = 2 + ((rr() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const bx = x + i * 3 + ((rr() * 2) | 0), by = y + ((rr() * 3) | 0);
        px(g, bx, by, N.barn); px(g, bx + 1, by, N.barnD);
        px(g, bx, by + 1, N.barnD); px(g, bx + 1, by + 1, '#7e786a');
      }
    }
    for (let k = 0; k < w / 18; k++) {
      const x = (rr() * w) | 0, L = 12 + ((rr() * 26) | 0), y0 = cy(x) - 6 - ((rr() * 10) | 0);
      for (let j = 0; j < L && y0 + j < h; j++) {
        px(g, x, y0 + j, j < 3 ? N.weedL : j < L - 3 ? N.weed : '#101f16');
        if (j > 2 && rr() < 0.35) px(g, x + 1, y0 + j, N.weed);
      }
    }
  };
  // a heavy wale run along her side well below the rail, to break up two hundred rows of plank
  const lowerWale = () => {
    for (let x = 0; x < w; x++) {
      const y = railY(x) + 74;
      px(g, x, y, N.waleL); px(g, x, y + 1, N.wale); px(g, x, y + 2, N.wale);
      px(g, x, y + 3, N.waleD); px(g, x, y + 4, N.caulk);
      if (rr() < 0.12) { px(g, x, y + 1, N.hullM); px(g, x, y + 2, N.hull); }
    }
  };
  // bolt rows down her frames, weeping rust in the heat
  const bolts = () => {
    for (let i = 10; i < w; i += 46 + ((rr() * 22) | 0)) {
      const t0 = railY(i);
      for (let y = t0 + 9; y < h - 6; y += 9 + ((rr() * 5) | 0)) {
        px(g, i, y, N.ironL); px(g, i + 1, y, N.iron); px(g, i, y + 1, N.iron);
        if (rr() < 0.6) { px(g, i, y + 2, N.rust); if (rr() < 0.5) px(g, i, y + 3, '#53301b'); }
      }
    }
  };
  lowerWale();
  bolts();
  for (let k = 0; k < 6; k++) at(xx => gunport(xx, (k & 1) === 0), Math.round((36 + k * 104) * S));
  lowMark();
  at(mastButt, Math.round(150 * S));
  at(mastButt, Math.round(470 * S));
  at(cable, Math.round(300 * S));
  at(hangingBoat, Math.round(556 * S));
  // her name in flaking ochre on the bow end of the frame
  {
    const x = Math.round(70 * S), t0 = railY(x);
    for (let k = 0; k < 7; k++) for (let a = 0; a < 3; a++) for (let b = 0; b < 5; b++) {
      if (rnd() < 0.45) continue;
      px(g, x + k * 5 + a, t0 + 9 + b, rnd() < 0.4 ? PT.ochL : PT.och);
    }
  }
  return c;
}

// The foreground, drawn over everything at 1.25 parallax: the ropes of the rigging you are standing under, a
// block hanging on one of them, the corner of a staysail hauled taut across the top of the frame, a gull going
// past, and spray coming up along the bottom edge. About a hundredth of the frame, so it reads as being aboard
// a ship rather than as a curtain. Mostly transparent. Tiles horizontally.
export function bakeFGRig(w, h, seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(w, h);
  const R0 = '#76634a', R1 = '#c3ac80', R2 = '#e0cda2';
  let rr = rnd;
  const at = (fn, x, ...a) => { const sd = (rnd() * 4294967296) >>> 0; for (const dx of [-w, 0, w]) { rr = mulberry(sd); fn(x + dx, ...a); } rr = rnd; };
  // a rope coming down out of the rigging: the sun is on its upper side, so one strand of it is pale
  const rope = (x, len, drift) => {
    for (let j = 0; j < len; j++) {
      const xx = Math.round(x + Math.sin(j * 0.04) * 3 + j * drift), yy = -2 + j;
      px(g, xx, yy, (j & 1) ? R1 : R0);
      if ((j % 7) === 0) px(g, xx + 1, yy, R2);
    }
    const ey = -2 + len, ex = Math.round(x + Math.sin(len * 0.04) * 3 + len * drift);
    for (const s of [-1, 0, 1]) for (let j = 0; j < 3 + ((rr() * 4) | 0); j++) px(g, ex + s + (s ? Math.round(j * 0.4) * s : 0), ey + j, R0);
  };
  // a block hanging in the rigging: a wooden shell with its sheave and a hook under it, swinging
  const block = (x, y) => {
    // the standing part, and the fall rove through her, going back up out of frame
    for (let j = 0; j < y + 2; j++) px(g, x + 2, -2 + j, (j & 1) ? R1 : R0);
    for (let j = 0; j < y - 4; j++) px(g, x + 8, -2 + j, (j & 1) ? R0 : R1);
    // the strop round her head
    for (let a = 1; a < 10; a++) { px(g, x + a, y - 2, R1); px(g, x + a, y - 1, R0); }
    // her shell: two cheeks of timber with the pin through them
    for (let a = 0; a < 11; a++) for (let b = 0; b < 15; b++) {
      const u = (a - 5) / 5.5, v = (b - 7) / 8.5;
      if (u * u + v * v > 1.06) continue;
      const edge = u * u + v * v > 0.72;
      px(g, x + a, y + b, b === 0 ? DK.hot : edge ? DK.sh : a < 5 ? DK.l : DK.m);
    }
    // the sheave turning in her, bright brass, with the rope's bight over it
    for (let b = 3; b < 12; b++) { px(g, x + 5, y + b, BR[2]); px(g, x + 4, y + b, BR[1]); px(g, x + 6, y + b, BR[2]); }
    px(g, x + 5, y + 6, DK.caulk); px(g, x + 5, y + 7, DK.caulk); px(g, x + 4, y + 7, DK.caulk);
    px(g, x + 4, y + 4, BR[0]); px(g, x + 4, y + 10, BR[0]);
    // the hook under her, swinging
    for (let b = 0; b < 5; b++) { px(g, x + 5, y + 15 + b, IR.l); px(g, x + 6, y + 15 + b, IR.d); }
    px(g, x + 4, y + 19, IR.m); px(g, x + 3, y + 19, IR.l); px(g, x + 3, y + 18, IR.m);
  };
  // the corner of a staysail hauled taut into the top of the frame: canvas with its seams and a cringle
  const canvasCorner = (x, flip) => {
    const wd = 30, ht = 22, s = flip ? -1 : 1;
    const pts = [[x, -2], [x + s * wd, -2], [x + s * Math.round(wd * 0.2), ht]];
    fillPoly(g, pts, CV[0], CV[1]);
    fillPoly(g, [[x, -2], [x + s * Math.round(wd * 0.55), -2], [x + s * Math.round(wd * 0.16), Math.round(ht * 0.8)]], CV[0]);
    // the seams in her, running with the cloth
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      for (let j = 0; j < ht; j++) {
        const u = j / ht;
        px(g, Math.round(x + s * (wd * t * (1 - u) + wd * 0.2 * u)), -2 + j, CV[2]);
      }
    }
    // her leech roped, and the cringle at the clew
    for (let j = 0; j < ht; j++) px(g, Math.round(x + s * (wd * (1 - j / ht) + wd * 0.2 * (j / ht))), -2 + j, R0);
    const cx = Math.round(x + s * Math.round(wd * 0.2)), cy = ht - 1;
    px(g, cx, cy, BR[1]); px(g, cx + s, cy, BR[0]); px(g, cx, cy + 1, BR[2]);
    for (let j = 0; j < 9; j++) px(g, cx + s * Math.round(j * 0.4), cy + 2 + j, (j & 1) ? R1 : R0);
  };
  // a gull going past low, close enough to see the grey on her back
  const gullNear = (x, y) => {
    // the near wing swept back, the body, then the far wing — big enough to read as a bird and not a speck
    const wing = [[0, 5], [1, 4], [2, 3], [3, 2], [4, 2], [5, 2]];
    for (const [a, b] of wing) { px(g, x + a, y + b, '#fbfcfa'); px(g, x + a, y + b + 1, '#dfe6ea'); }
    for (const [a, b] of wing) { px(g, x + 13 - a, y + b - 1, '#eef3f6'); px(g, x + 13 - a, y + b, '#c8d2da'); }
    for (let a = 5; a < 10; a++) { px(g, x + a, y + 2, '#c8d2da'); px(g, x + a, y + 3, '#fbfcfa'); px(g, x + a, y + 4, '#eef3f6'); }
    px(g, x + 10, y + 3, '#fbfcfa'); px(g, x + 11, y + 3, '#8d98a2');
    px(g, x + 4, y + 3, '#a8b4be'); px(g, x + 3, y + 3, BR[1]);
    px(g, x + 9, y + 5, '#8d98a2');
  };
  const nr = Math.max(2, Math.round(w / 230));
  for (let i = 0; i < nr; i++) at(rope, (i + 0.25 + rnd() * 0.4) * w / nr, 40 + ((rnd() * 52) | 0), (rnd() - 0.5) * 0.16);
  at(block, Math.round(w * 0.34), 30 + ((rnd() * 18) | 0));
  canvasCorner(8, false);
  canvasCorner(w - 8, true);
  gullNear(Math.round(w * 0.72), Math.round(h * 0.4));
  // spray coming up over the bottom edge: flat arcs of white with a few drops thrown off them
  const nw = Math.max(2, Math.round(w / 300));
  for (let i = 0; i < nw; i++) {
    const x = rnd() * w, wd = 30 + rnd() * 40, ht = 4 + rnd() * 5;
    at(xx => {
      for (let k = 0; k < wd; k++) {
        const u = k / wd, y = Math.round(h - 1 - ht * Math.sin(Math.PI * u));
        for (let j = 0; j < h - y; j++) {
          if (rr() > 0.72 - j * 0.2) continue;
          px(g, Math.round(xx + k), y + j, rr() < 0.5 ? 'rgba(255,255,255,0.92)' : 'rgba(206,230,248,0.6)');
        }
        if (rr() < 0.13) px(g, Math.round(xx + k), y - 1 - ((rr() * 4) | 0), 'rgba(255,255,255,0.55)');
      }
    }, x);
  }
  for (let i = 0; i < w / 120; i++) {
    const x = (rnd() * w) | 0, y = 14 + ((rnd() * (h - 28)) | 0);
    px(g, x, y, 'rgba(255,255,255,0.6)');
    if (rnd() < 0.4) px(g, (x + 1) % w, y, 'rgba(214,234,248,0.35)');
  }
  return c;
}

// The glare on the water: 3 frames of a tiling overlay at w x h (64 x 64 as used). Sparse white dashes lying
// flat on the swell, a few of them bright enough to throw a cross. Each frame slides every dash to the right
// by 21, 22, 21 px in turn — 64 in all — so frames 0-1-2 loop with no jump and the pattern still tiles.
export function bakeGlare(w, h) {
  const rnd = mulberry(6262), OFF = [0, 21, 43];
  const dashes = [], sparks = [];
  const n = Math.round(w * h / 300);
  for (let i = 0; i < n; i++) dashes.push({ x: (rnd() * w) | 0, y: (rnd() * h) | 0, len: 2 + ((rnd() * 5) | 0), bright: rnd() < 0.34 });
  for (let i = 0; i < Math.round(w * h / 1100); i++) sparks.push({ x: (rnd() * w) | 0, y: (rnd() * h) | 0 });
  return [0, 1, 2].map(f => {
    const [c, g] = canvas(w, h);
    const off = OFF[f];
    for (const d of dashes) {
      for (let k = 0; k < d.len; k++) {
        const x = (d.x + off + k) % w, y = d.y;
        const t = k / d.len;
        const col = d.bright
          ? (t < 0.6 ? 'rgba(255,255,255,0.82)' : 'rgba(226,242,255,0.45)')
          : (t < 0.6 ? 'rgba(238,248,255,0.42)' : 'rgba(206,230,248,0.24)');
        px(g, x, y, col);
      }
      if (d.bright) px(g, (d.x + off + 1) % w, (d.y + 1) % h, 'rgba(214,236,252,0.3)');
    }
    // the few that catch it square on and throw a cross of light
    for (const s of sparks) {
      const x = (s.x + off) % w, y = s.y;
      px(g, x, y, 'rgba(255,255,255,0.95)');
      px(g, (x + 1) % w, y, 'rgba(255,255,255,0.6)');
      px(g, (x + w - 1) % w, y, 'rgba(255,255,255,0.6)');
      px(g, x, (y + 1) % h, 'rgba(236,248,255,0.5)');
      px(g, x, (y + h - 1) % h, 'rgba(236,248,255,0.5)');
    }
    return c;
  });
}
