// flotilla3_world.js - THE FLOTILLA 3's WORLD DRESSING (claude/flotilla3art): the pieces the Opus greybox left as bare blocks and rectangles. Pure baking and drawing, no game state.
//   bakeMantlet()      the shot-plank screen on the galley and hull decks (16 x 32: one column, two rows): iron-strapped planks, shot scars, a hide hung over the top
//   bakeSloopHull()    THE PRIZE's black hull, rows 27-37 of cols 225-250 (416 x 176): the red-and-gold wale, gunports, chain plates and deadeyes, copper sheathing, the catted anchor
//   bakePoop()         her raised poop, rows 19-25 of cols 242-250 (144 x 112): stern windows lit gold, gilt bands, balusters above
//   bakeDeckhouse()    the old HULK's deckhouse, rows 3-21 of cols 263-266 (64 x 318 with its roof): weathered clapboard, rot, shuttered portholes, a boarded door, cross-bracing, lashings
//   bakeRotDeck()      the rotten deck patch the swivel is laid on (64 x 32): grey-green planks gone soft, cracks, fungus, split ends (drawn only while the cells are still there)
//   bakeFlagship()     THE FLAGSHIP landmark (170 x 120): a three-masted ship of the line, black hull, lit gun-deck ports and stern gallery, set courses; her SIGNAL HOIST is drawn live
//   drawSwivel / drawTopGun / drawCockedYard   the laid guns and the yard on its lift
//   drawHoist          a signal halyard in the play plane: a staff, a yardarm, a block and three flags (red when he calls)
import { canvas, px, rect, outline } from '../px.js';
const R = Math.round;
const O = '#1b1626';
export const FS = { W: 170, H: 124, HY: 112 }; const FS_HY = FS.HY;
/* deterministic noise */
const nz = (i, k = 0) => ((Math.imul(i + 1, 2654435761) ^ Math.imul(k + 7, 40503)) >>> 0) % 1000 / 1000;

/* ===== THE MANTLET ===== */
export function bakeMantlet() {
  const [c, g] = canvas(16, 32);
  const top = [3, 1, 4, 2];   /* the planks stand at different heights: a ragged, shot-up top */
  for (let i = 0; i < 4; i++) { const x = i * 4, t = top[i], base = i % 2 ? '#4a3824' : '#5a4630';
    rect(g, x, t, 4, 32 - t, '#1e160e'); rect(g, x + 1, t, 3, 32 - t, base); rect(g, x + 1, t, 1, 32 - t, '#7a6040'); rect(g, x + 3, t, 1, 32 - t, '#3a2c1c'); px(g, x + 1, t, '#9a8058'); px(g, x + 2, t, '#9a8058'); }
  for (const y of [5, 16, 27]) { rect(g, 0, y, 16, 3, '#2a2e38'); rect(g, 0, y, 16, 1, '#6a7080'); rect(g, 0, y + 2, 16, 1, '#14161c'); for (let i = 0; i < 4; i++) px(g, i * 4 + 2, y + 1, '#b4bcc8'); }
  rect(g, 1, 9, 2, 2, '#14100a'); px(g, 3, 8, '#c9b27c'); px(g, 0, 11, '#c9b27c'); rect(g, 10, 20, 2, 2, '#14100a'); px(g, 9, 19, '#c9b27c'); px(g, 12, 22, '#c9b27c'); rect(g, 6, 12, 1, 3, '#14100a');   /* shot scars and their splinters */
  rect(g, 2, 3, 12, 6, '#8a6a48'); rect(g, 2, 3, 12, 1, '#b08a5a'); rect(g, 2, 8, 12, 1, '#5a4228'); for (let x = 3; x < 14; x += 2) px(g, x, 4, '#3a2a18'); px(g, 3, 1, '#b59a62'); px(g, 12, 1, '#b59a62');   /* the hide hung over the top, stitched */
  rect(g, 0, 30, 16, 2, '#14100a');
  return outline(c, O);
}

/* ===== THE SLOOP ===== */
export function bakeSloopHull() {
  const W = 26 * 16, H = 11 * 16, [c, g] = canvas(W, H);
  rect(g, 0, 0, W, H, '#16121a');
  for (let y = 8; y < H; y += 9) { rect(g, 0, y, W, 1, '#241c26'); for (let x = (y / 9 % 2) * 30 + 7; x < W; x += 61) rect(g, x, y - 8, 1, 8, '#0e0a12'); }   /* the plank lands and the butt joints */
  for (let y = 0; y < H; y += 9) rect(g, 0, y + 1, W, 1, '#1e1824');
  rect(g, 0, 0, W, 9, '#6a1c1e'); rect(g, 0, 0, W, 1, '#d8b04a'); rect(g, 0, 8, W, 1, '#d8b04a'); rect(g, 0, 1, W, 2, '#8e2e2a'); rect(g, 0, 4, W, 1, '#4a1216');   /* the red wale between gold lines */
  rect(g, 0, 9, W, 1, '#0a080e');
  for (let i = 0; i < 6; i++) { const x = 28 + i * 62, y = 26;   /* the gunports: a lid, a lit rim, the muzzle run out on three of them */
    rect(g, x - 1, y - 1, 16, 14, '#0a080e'); rect(g, x, y, 14, 12, '#d8b04a'); rect(g, x + 1, y + 1, 12, 10, '#0a080e'); rect(g, x, y, 14, 2, '#8a6a28'); rect(g, x + 1, y - 3, 12, 2, '#6a1c1e');
    if (i % 2 === 0) { rect(g, x + 3, y + 4, 9, 5, '#2a2e38'); rect(g, x + 3, y + 4, 9, 1, '#6a7080'); rect(g, x + 10, y + 3, 3, 7, '#14161c'); } else { px(g, x + 4, y + 6, '#ffb84a'); px(g, x + 9, y + 7, '#ffb84a'); } }
  rect(g, 80, 54, 80, 4, '#3a2c1c'); rect(g, 80, 54, 80, 1, '#6e5238'); rect(g, 80, 57, 80, 1, '#14100a');   /* the channel the shrouds are set up on */
  for (const x of [92, 112, 132]) { rect(g, x - 2, 59, 5, 5, '#2a2e38'); rect(g, x - 1, 60, 3, 3, '#0a080e'); px(g, x - 2, 59, '#8a92a0'); rect(g, x, 64, 1, 12, '#8a7454'); rect(g, x, 54, 1, 5, '#8a7454'); }   /* deadeyes and their lanyards */
  rect(g, 8, 36, 4, 18, '#1a1410'); rect(g, 4, 52, 12, 3, '#2a2e38'); rect(g, 6, 44, 7, 3, '#4a505c'); px(g, 6, 44, '#a8b0bc'); rect(g, 12, 54, 4, 8, '#2a2e38');   /* the anchor catted at the bow, its flukes down */
  for (let x = 0; x < W; x += 3) { const t = nz(x, 3); if (t < 0.3) px(g, x, 90 + R(nz(x, 9) * 6), '#241c26'); }
  rect(g, 0, 120, W, H - 120, '#2a5a4a');   /* the copper sheathing, gone green */
  for (let y = 120; y < H; y += 6) for (let x = (y / 6 % 2) * 6; x < W; x += 12) { rect(g, x, y, 11, 5, nz(x + y) < 0.4 ? '#3a7a5e' : '#2e6a52'); rect(g, x, y, 11, 1, '#5aa27c'); rect(g, x, y + 5, 12, 1, '#143a2e'); }
  rect(g, 0, 118, W, 2, '#d2d0b4'); for (let x = 0; x < W; x += 5) if (nz(x, 11) < 0.5) rect(g, x, 116, 3, 2, '#d2d0b4');   /* the waterline barnacles */
  for (let x = 0; x < W; x += 4) { const t = nz(x, 17); if (t < 0.5) rect(g, x, H - 4 - R(t * 6), 2, 4 + R(t * 6), '#4a6a3c'); }   /* weed streaming from the keel line */
  rect(g, W - 7, 10, 7, H - 10, '#0e0a12'); rect(g, W - 7, 10, 1, H - 10, '#3a2c1c');   /* the rudder post at the stern end */
  return c;
}
export function bakePoop() {
  const W = 9 * 16, H = 7 * 16, [c, g] = canvas(W, H);
  rect(g, 0, 16, W, H - 16, '#2a1018');
  for (let y = 20; y < H; y += 7) rect(g, 0, y, W, 1, '#4a141a');
  for (let y = 16; y < H; y += 7) rect(g, 0, y, W, 1, '#1a0a10');
  rect(g, 0, 16, W, 3, '#d8b04a'); rect(g, 0, 16, W, 1, '#fff0a4'); rect(g, 0, 19, W, 1, '#8a6a28'); rect(g, 0, H - 4, W, 4, '#d8b04a'); rect(g, 0, H - 4, W, 1, '#fff0a4'); rect(g, 0, H - 1, W, 1, '#8a6a28');   /* gilt bands */
  for (const x of [34, 86]) { rect(g, x - 1, 38, 22, 36, '#0a080e'); rect(g, x, 39, 20, 34, '#d8b04a'); rect(g, x + 2, 41, 16, 30, '#ffd36b'); rect(g, x + 2, 41, 16, 5, '#fff6c8'); rect(g, x + 9, 41, 2, 30, '#5a3a18'); rect(g, x + 2, 55, 16, 2, '#5a3a18'); rect(g, x - 1, 38, 22, 1, '#fff0a4'); rect(g, x + 2, 41, 4, 30, '#ffe69a');
    rect(g, x - 2, 38, 3, 36, '#6a1c1e'); rect(g, x + 19, 38, 3, 36, '#6a1c1e'); }   /* the stern windows, lit gold, curtained in red */
  for (let x = 6; x < W - 4; x += 12) { rect(g, x, 76, 4, 5, '#8a6a28'); px(g, x + 1, 76, '#fff0a4'); }   /* carved brackets under the lights */
  for (let x = 0; x < W; x += 6) { rect(g, x, 0, 3, 16, '#3a2c1c'); rect(g, x, 0, 1, 16, '#6e5238'); rect(g, x + 1, 1, 1, 3, '#8a7454'); }   /* the balusters */
  rect(g, 0, 0, W, 3, '#6e5238'); rect(g, 0, 0, W, 1, '#9a7a48');   /* the rail's cap */
  return c;
}

/* ===== THE HULK ===== */
export function bakeDeckhouse() {
  const W = 64, ROOF = 14, H = 18 * 16 + ROOF, [c, g] = canvas(W, H);
  const y0 = ROOF;   /* the wall starts under the roof, 16 px below the block's top face */
  rect(g, 0, y0, W, H - y0, '#2a241c');
  for (let y = y0 + 3; y < H; y += 6) { const t = nz(y, 2); rect(g, 0, y, W, 5, t < 0.3 ? '#6a5238' : t < 0.6 ? '#7a6044' : '#705840'); rect(g, 0, y, W, 1, '#98784e'); rect(g, 0, y + 5, W, 1, '#1e1610'); for (let x = 4 + R(nz(y, 6) * 20); x < W; x += 31) rect(g, x, y, 1, 5, '#1e1a14'); }
  for (let i = 0; i < 18; i++) { const x = R(nz(i, 21) * 50) + 4, y = y0 + 8 + R(nz(i, 22) * (H - y0 - 24)), w = 4 + R(nz(i, 23) * 8); rect(g, x, y, w, 4, '#46584a'); px(g, x + 1, y + 1, '#6a8a5a'); px(g, x + w - 2, y + 2, '#3a4a38'); }   /* rot, green-grey */
  for (let i = 0; i < 10; i++) { const x = 5 + R(nz(i, 31) * 50), y = y0 + 6 + R(nz(i, 32) * (H - y0 - 14)); rect(g, x, y, 2, 1, '#0e0c08'); }   /* shipworm holes */
  rect(g, 0, y0, 4, H - y0, '#3a3226'); rect(g, 60, y0, 4, H - y0, '#3a3226'); rect(g, 0, y0, 1, H - y0, '#6e5e44'); for (let y = y0 + 6; y < H; y += 14) { px(g, 1, y, '#8a92a0'); px(g, 61, y, '#8a92a0'); }   /* corner posts, nailed */
  const bar = (x0, y1, x1, y2) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y2 - y1)); for (let i = 0; i <= n; i++) { const x = R(x0 + (x1 - x0) * i / n), y = R(y1 + (y2 - y1) * i / n); rect(g, x - 1, y, 3, 3, '#4a3624'); px(g, x - 1, y, '#6e5238'); } };
  bar(6, y0 + 40, 58, y0 + 100); bar(58, y0 + 40, 6, y0 + 100);   /* cross-bracing: an old timber X */
  for (const wy of [y0 + 120, y0 + 190]) { rect(g, 20, wy - 1, 25, 21, '#0e0c08'); rect(g, 22, wy + 1, 21, 17, '#0a0810'); rect(g, 22, wy + 1, 21, 2, '#5e5648'); rect(g, 31, wy + 1, 2, 17, '#5e5648');
    rect(g, 10, wy, 10, 18, '#3a3226'); rect(g, 10, wy + 4, 10, 1, '#1e1a14'); rect(g, 10, wy + 12, 10, 1, '#1e1a14'); px(g, 18, wy + 8, '#8a92a0');   /* a shutter hanging off one hinge */
    rect(g, 45, wy, 7, 8, '#3a3226'); px(g, 46, wy + 3, '#8a92a0'); }
  rect(g, 18, 18 * 16 + ROOF - 48, 28, 48, '#1e1a14'); rect(g, 20, 18 * 16 + ROOF - 46, 24, 46, '#46382a');   /* the door, boarded */
  for (let x = 21; x < 44; x += 6) { rect(g, x, 18 * 16 + ROOF - 46, 1, 46, '#2a2016'); }
  bar(20, 18 * 16 + ROOF - 44, 43, 18 * 16 + ROOF - 6); bar(43, 18 * 16 + ROOF - 44, 20, 18 * 16 + ROOF - 6);   /* nailed X over it */
  rect(g, 20, 18 * 16 + ROOF - 40, 24, 3, '#2a2e38'); rect(g, 20, 18 * 16 + ROOF - 40, 24, 1, '#6a7080'); rect(g, 20, 18 * 16 + ROOF - 14, 24, 3, '#2a2e38');
  for (const y of [y0 + 96, y0 + 160]) { rect(g, 3, y, 58, 3, '#b59a62'); for (let x = 3; x < 61; x += 3) px(g, x, y + 1, '#6e5a30'); rect(g, 3, y + 3, 58, 1, '#3a2e18'); }   /* the lashings round her */
  for (let y = y0 + 20; y < H; y += 40) { rect(g, 2, y, 3, 6, '#8a4a26'); px(g, 3, y + 2, '#b86a34'); }
  for (let x = 0; x < W; x++) { const h = 3 + R(Math.sin(x / 4) * 2 + (x < 32 ? x : 64 - x) / 10); rect(g, x, ROOF - h, 1, h + 3, x % 6 < 3 ? '#4a3624' : '#3a2a1c'); }   /* the roof: a low pitch of tarred boards */
  rect(g, 0, ROOF - 2, W, 2, '#14100a'); rect(g, 26, 0, 12, 3, '#2a2e38'); rect(g, 28, -1 + 3, 8, 1, '#6a7080');
  return c;
}
export function bakeRotDeck() {
  const [c, g] = canvas(64, 32);
  rect(g, 0, 0, 64, 32, '#3e4234');
  for (let y = 0; y < 32; y += 8) { rect(g, 0, y, 64, 1, '#14160e'); for (let x = (y / 8 % 2) * 14 + 5; x < 64; x += 28) rect(g, x, y, 1, 8, '#14160e'); }
  for (let i = 0; i < 40; i++) { const x = R(nz(i, 41) * 60), y = R(nz(i, 42) * 30), t = nz(i, 43); rect(g, x, y, 2 + R(t * 4), 2, t < 0.5 ? '#6a7438' : '#586a3a'); }   /* fungus */
  for (let i = 0; i < 6; i++) { const x = 4 + i * 10, y = 3 + R(nz(i, 51) * 18); rect(g, x, y, 1, 7, '#0a0a06'); rect(g, x + 1, y + 6, 3, 1, '#0a0a06'); rect(g, x - 1, y + 2, 1, 2, '#0a0a06'); }   /* cracks */
  rect(g, 0, 0, 64, 2, '#7a8060'); for (let x = 0; x < 64; x += 8) px(g, x + 3, 0, '#a8b088');
  for (const [x, y] of [[10, 12], [30, 20], [48, 8], [56, 24]]) { rect(g, x, y, 5, 4, '#0a0a06'); px(g, x + 1, y + 1, '#1a1c10'); }   /* a hole going soft */
  for (let x = 4; x < 64; x += 14) { rect(g, x, 15, 3, 1, '#8a4a26'); px(g, x + 1, 15, '#b86a34'); }
  return c;
}

/* ===== THE FLAGSHIP (the landmark) ===== */
export function bakeFlagship() {
  const W = 170, H = 124, [c, g] = canvas(W, H);
  const hy = FS_HY;   /* the waterline row of the hull */
  /* hull: black, a long sheer, a high stern on the right */
  for (let x = 6; x < 164; x++) { const t = x / W, top = hy - 14 - (x > 126 ? (x - 126) * 0.55 : 0) + (x < 24 ? (24 - x) * 0.5 : 0), bot = hy + 8 - (x < 30 ? (30 - x) * 0.4 : 0) - (x > 150 ? (x - 150) * 0.8 : 0); rect(g, x, R(top), 1, R(bot - top), '#16121a'); }
  rect(g, 8, hy - 14, 118, 1, '#3a2e22'); rect(g, 8, hy - 4, 150, 2, '#d8b04a'); rect(g, 8, hy - 2, 150, 1, '#8a6a28');   /* the gilt wale */
  for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) { const x = 24 + i * 9 - r * 1, y = hy - 12 + r * 7; rect(g, x, y, 4, 4, '#0a080e'); rect(g, x, y, 4, 1, '#ffb84a'); if ((i + r) % 3 === 0) { px(g, x + 1, y + 2, '#ffd36b'); px(g, x + 2, y + 2, '#ff9a5c'); } }   /* two rows of gunports, some lit */
  rect(g, 126, hy - 32, 36, 18, '#1a0a10'); rect(g, 126, hy - 32, 36, 2, '#d8b04a'); for (let i = 0; i < 4; i++) { rect(g, 130 + i * 8, hy - 28, 5, 8, '#ffd36b'); rect(g, 130 + i * 8, hy - 28, 5, 2, '#fff6c8'); }   /* the stern gallery, lit */
  rect(g, 126, hy - 34, 38, 2, '#6a1c1e'); rect(g, 124, hy - 14, 40, 4, '#6a1c1e');
  rect(g, 6, hy - 20, 14, 4, '#3a2e22'); rect(g, 0, hy - 24, 20, 2, '#2a1e16'); rect(g, 0, hy - 24, 3, 6, '#2a1e16');   /* the bowsprit and the beakhead */
  /* three masts, yards, the courses set (dark, a little torn), tops, shrouds, stays */
  for (const [mx, mh, sw] of [[44, 74, 34], [88, 92, 40], [134, 62, 28]]) {
    rect(g, mx, hy - 14 - mh, 3, mh + 4, '#2a1e16'); rect(g, mx, hy - 14 - mh, 1, mh + 4, '#4a3624');
    for (const [yy, ww] of [[hy - 14 - mh + 8, sw * 0.6], [hy - 14 - mh * 0.55, sw]]) { rect(g, R(mx - ww / 2), R(yy), R(ww) + 3, 2, '#3a2e22'); const sh = R(mh * 0.36);
      rect(g, R(mx - ww / 2) + 1, R(yy) + 2, R(ww) + 1, sh, '#262034'); rect(g, R(mx - ww / 2) + 1, R(yy) + 2, R(ww) + 1, 2, '#3e3650'); for (let k = 0; k < 3; k++) rect(g, R(mx - ww / 2) + 4 + k * R(ww / 3), R(yy) + 2, 1, sh, '#1a1626'); }
    rect(g, mx - 4, hy - 14 - mh * 0.68, 11, 3, '#2a1e16'); }   /* the tops */
  for (const [x0, y0, x1, y1] of [[44, hy - 78, 8, hy - 20], [44, hy - 78, 88, hy - 100], [88, hy - 104, 134, hy - 76], [134, hy - 76, 164, hy - 40], [47, hy - 60, 85, hy - 14], [91, hy - 60, 131, hy - 14]]) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i += 2) px(g, R(x0 + (x1 - x0) * i / n), R(y0 + (y1 - y0) * i / n), '#4a3a48'); }
  return c;
}
/* the flagship hoist at her mainmast head (drawn live over the baked ship): hx, hy the ship's top-left on screen, sc its scale */
export function drawFlagshipHoist(g, hx, hy, sc, red, time) {
  const x = R(hx + 89 * sc), y = R(hy + (FS_HY - 14 - 92 - 4) * sc), s = Math.max(2, R(5 * sc + 1));
  for (let i = 0; i < 3; i++) { g.fillStyle = red ? (Math.floor(time * 6 + i) % 2 ? '#ff3a2a' : '#c9182a') : ['#ece2cc', '#2e4e86', '#d8b04a'][i]; g.fillRect(x + 2 + i * (s + 1), y + 2 + (i % 2) * 2, s + (red ? 2 : 0), Math.max(2, s - 1)); }
  g.fillStyle = '#16121a'; g.fillRect(x - 1, y - s, 1, s + 3);
  if (red) { g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 9); g.fillStyle = '#ff4a3a'; g.fillRect(x - 4, y - 3, 3 * (s + 3) + 6, s + 8); g.globalAlpha = 1; }
}

/* ===== THE LAID GUNS ===== */
/* THE SWIVEL: a brass-banded barrel on a forked yoke that turns on a post bolted to the poop rail; ang the heading it is laid on; fired = the barrel dark and smoking */
export function drawSwivel(g, x, y, ang, fired, smoke) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  rect(g, x + 6, y + 6, 4, 12, '#2a1e16'); rect(g, x + 6, y + 6, 1, 12, '#4a3624'); rect(g, x + 3, y + 16, 10, 3, '#2a2e38'); rect(g, x + 3, y + 16, 10, 1, '#6a7080');   /* the post and its foot plate */
  rect(g, x + 4, y + 5, 8, 3, '#14161c'); rect(g, x + 4, y + 5, 8, 1, '#6a7080'); rect(g, x + 4, y + 3, 2, 3, '#6a7080'); rect(g, x + 10, y + 3, 2, 3, '#6a7080');   /* the yoke */
  const bx = x + 8, by = y + 4;
  for (let i = -4; i <= 11; i++) { const px_ = R(bx + ca * i), py = R(by + sa * i); rect(g, px_ - 1, py - 1, 3, 3, i > 7 ? '#2a2e38' : '#474d5a'); px(g, px_, py - 1, fired ? '#2a2e38' : '#a8b0bc'); }
  for (const i of [0, 5, 9]) rect(g, R(bx + ca * i) - 2, R(by + sa * i) - 2, 4, 4, fired ? '#6a5a28' : '#d8b04a');   /* the brass bands */
  px(g, R(bx + ca * 11), R(by + sa * 11), '#0a080e');
  rect(g, R(bx - ca * 4) - 4, R(by - sa * 4) - 5, 3, 7, '#4a3624'); px(g, R(bx - ca * 4) - 4, R(by - sa * 4) - 5, '#8a7454');   /* the tiller */
  if (smoke > 0) { g.globalAlpha = Math.min(0.65, smoke / 1.2 * 0.7); g.fillStyle = '#e8e2d6'; g.fillRect(R(bx + ca * 12) - 3, R(by + sa * 12) - 5 - R((1.2 - smoke) * 8), 9, 6); g.fillStyle = '#b8b2a6'; g.fillRect(R(bx + ca * 12), R(by + sa * 12) - 8 - R((1.2 - smoke) * 12), 6, 4); g.globalAlpha = 1; }
}
/* THE TOP GUN: a carronade on a slide in the fighting top, laid up at the yard's lift */
export function drawTopGun(g, x, y, ang, fired, smoke) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  rect(g, x - 2, y + 11, 22, 4, '#2a1e16'); rect(g, x - 2, y + 11, 22, 1, '#6e5238'); rect(g, x + 1, y + 7, 4, 4, '#14161c'); rect(g, x + 12, y + 7, 4, 4, '#14161c');   /* the slide's rails and trucks */
  const bx = x + 8, by = y + 6;
  for (let i = -3; i <= 10; i++) { const w = i < 2 ? 6 : 5, px_ = R(bx + ca * i), py = R(by + sa * i); rect(g, px_ - w / 2, py - w / 2, w, w, '#2a2e38'); px(g, px_ - w / 2 + 1, py - w / 2, fired ? '#3a3e48' : '#8a92a0'); }
  for (const i of [3, 8]) rect(g, R(bx + ca * i) - 3, R(by + sa * i) - 3, 6, 6, fired ? '#4a4228' : '#8a6a28');
  rect(g, R(bx - ca * 3) - 2, R(by - sa * 3) - 2, 4, 4, '#6a7080');   /* the cascabel */
  if (smoke > 0) { g.globalAlpha = Math.min(0.7, smoke / 1.2 * 0.8); g.fillStyle = '#e8e2d6'; g.fillRect(R(bx + ca * 11) - 4, R(by + sa * 11) - 6 - R((1.2 - smoke) * 10), 11, 8); g.fillStyle = '#b8b2a6'; g.fillRect(R(bx + ca * 11), R(by + sa * 11) - 10 - R((1.2 - smoke) * 14), 8, 5); g.globalAlpha = 1; }
}
/* THE YARD ON ITS LIFT: cocked up off the mast top toward the next mast, hung by its lift (a taut line to a cleat) before the gun parts it; after, it lies level */
export function drawCockedYard(g, x0, y0, x1, y1, state, k) {
  const ln = (ax, ay, bx, by, w, col) => { const n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)))); for (let i = 0; i <= n; i++) rect(g, R(ax + (bx - ax) * i / n - w / 2), R(ay + (by - ay) * i / n - w / 2), w, w, col); };
  const t = state === 'cocked' ? 1 : state === 'falling' ? 1 - Math.min(1, k) : 0;
  const ay = y0 - (y0 - y1) * t;   /* the far end: up at y1 when cocked, down at y0 when level */
  ln(x0, y0, x1, ay, 5, '#1e160e'); ln(x0, y0, x1, ay, 3, '#4a3624'); ln(x0, y0 - 1, x1, ay - 1, 1, '#7a6040');
  ln(x1 - 1, ay - 2, x1 + 2, ay + 2, 3, '#2a1e16');
  if (state === 'cocked') { ln(x1 - 6, ay - 1, x1 - 6, y1 - 22, 1, '#b59a62'); rect(g, x1 - 8, y1 - 24, 5, 3, '#2a2e38'); rect(g, x1 - 8, y1 - 24, 5, 1, '#8a92a0'); }   /* the lift, taut up to its block */
  if (state === 'falling' && k < 0.8) { ln(x1 - 6, ay - 1, x1 - 6, y1 - 22 + R(k * 30), 1, '#b59a62'); }
}
/* A SIGNAL HOIST in the play plane: a staff with a yardarm, its halyard down to a cleat, three flags (square, pennant, swallow-tail); on = he calls: all red, snapping, a halo */
export function drawHoist(g, x, y, on, time) {
  rect(g, x - 1, y - 64, 3, 64, '#16121a'); rect(g, x - 1, y - 64, 1, 64, '#4a3624'); rect(g, x - 7, y - 64, 15, 2, '#3a2e22'); rect(g, x - 7, y - 64, 15, 1, '#6e5238'); rect(g, x - 3, y - 67, 7, 3, '#2a1e16'); px(g, x, y - 69, '#d8b04a');
  rect(g, x + 3, y - 60, 1, 56, '#b59a62'); rect(g, x + 2, y - 4, 4, 4, '#2a2e38');   /* the halyard to its cleat */
  const sn = on ? Math.floor(time * 10) % 2 : 0, col = i => on ? (Math.floor(time * 8 + i) % 2 ? '#ff3a2a' : '#c9182a') : ['#ece2cc', '#2e4e86', '#d8b04a'][i];
  const fx = x + 5, w = on ? 14 : 10;
  rect(g, fx, y - 62, w, 8, col(0)); if (!on) { rect(g, fx + 3, y - 62, 4, 8, '#c9463d'); rect(g, fx, y - 62, w, 1, '#fff'); } else rect(g, fx + 4, y - 59 + sn, 6, 2, '#fff6c8');   /* the square flag */
  for (let i = 0; i < w + 2; i++) rect(g, fx + i, y - 52 + R(i * 3 / (w + 2)), 1, 5 - R(i * 3.5 / (w + 2)) + sn * (i > w - 4 ? 1 : 0), col(1));   /* the pennant, tapering */
  rect(g, fx, y - 44, w - 2, 7, col(2)); px(g, fx + w - 3, y - 41 + sn, '#16121a'); px(g, fx + w - 4, y - 40, '#16121a'); px(g, fx + w - 3, y - 38, '#16121a');   /* the swallow-tail */
  if (!on) { rect(g, fx + 1, y - 43, 3, 5, '#2e4e86'); }
  if (on) { g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 9); g.fillStyle = '#ff4a3a'; g.fillRect(x - 10, y - 70, 36, 34); g.globalAlpha = 1; }
}

/* ===== THE GULL (the petrel's frames, redrawn: 24x16, ax 11 ay 15; 0-1 flap, 2 DIVE, 3 climb, 4 hurt (LAST, the corpse's pose); .perch is the standing gull the play plane's perched gulls use) ===== */
import { fillPoly, line, circle, ellipse } from '../px.js';
export function bakeGull() {
  const W = 24, H = 16, C = { w: '#f2f0ea', wD: '#c4c8cc', m: '#a4aeb8', mD: '#7c8894', tip: '#1e242a', bill: '#e8b84a', spot: '#d8402a', eye: '#101418', leg: '#d88a6a' };
  const frames = list => list.map(fn => { const [c, g] = canvas(W, H); fn(g); outline(c, O); return c; });
  const bird = (g, lift, pitch = 0, extra) => { const cy = 9 + pitch;
    ellipse(g, 11, cy, 5, 2.6, C.w); rect(g, 8, cy + 1, 7, 1, C.wD); circle(g, 16, cy - 1 - pitch, 2, C.w); px(g, 17, cy - 2 - pitch, C.eye); line(g, 18, cy - 1 - pitch, 21, cy - pitch, C.bill); px(g, 20, cy - pitch, C.spot);
    fillPoly(g, [[6, cy], [2, cy - 1], [3, cy + 2]], C.wD); px(g, 2, cy, C.tip);
    const wy = cy - 1 - Math.round(lift * 6); fillPoly(g, [[9, cy - 1], [13, cy - 1], [12 - Math.round(lift * 2), wy], [4, wy - (lift > 0 ? 1 : 0)]], C.m); line(g, 4, wy, 8, wy, C.tip); px(g, 3, wy, C.tip); px(g, 9, wy + 1, C.mD);
    extra && extra(g); };
  const F = frames([g => bird(g, 1), g => bird(g, -0.6),
    g => { const cy = 9; ellipse(g, 12, cy, 6, 2, C.w); rect(g, 8, cy + 1, 8, 1, C.wD); fillPoly(g, [[10, cy - 1], [3, cy - 3], [6, cy]], C.m); px(g, 3, cy - 3, C.tip); circle(g, 18, cy, 1.8, C.w); px(g, 19, cy - 1, C.eye); line(g, 19, cy, 23, cy + 1, C.bill); px(g, 22, cy + 1, C.spot); },
    g => bird(g, 1.2, 2), g => bird(g, 0.3, 1, g => { for (const [x, y] of [[5, 2], [14, 1], [20, 4]]) px(g, x, y, C.wD); })]);
  const [pc, pg] = canvas(W, H); (g => { ellipse(g, 11, 8, 5, 3, C.w); rect(g, 7, 10, 8, 1, C.wD); fillPoly(g, [[6, 6], [14, 6], [14, 9], [4, 10]], C.m); line(g, 4, 10, 8, 10, C.tip); circle(g, 15, 4, 2, C.w); px(g, 16, 3, C.eye); line(g, 17, 4, 20, 5, C.bill); px(g, 19, 5, C.spot); line(g, 10, 11, 10, 14, C.leg); line(g, 13, 11, 13, 14, C.leg); fillPoly(g, [[6, 8], [2, 9], [4, 10]], C.wD); })(pg); outline(pc, O);
  return { R: F, L: F.map(c => flipPx(c)), white: { R: F, L: F }, ax: 11, ay: 15, w: 10, h: 8, perch: pc };
}
function flipPx(c) { const [o, g] = canvas(c.width, c.height); g.save(); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); g.restore(); return o; }
/* ===== THE FISHERFOLK'S SKIFF (34 x 24): a clinker dinghy, a lantern at the stern, a fisherman in an oilskin hat; 2 frames (the rod lifts) ===== */
export function bakeSkiff() {
  const W = 34, H = 24, mk = k => { const [c, g] = canvas(W, H);
    fillPoly(g, [[2, 15], [32, 15], [28, 21], [6, 21]], '#2a1e16'); rect(g, 2, 15, 31, 2, '#6e5238'); rect(g, 3, 17, 28, 1, '#4a3624'); rect(g, 5, 19, 24, 1, '#1a1410'); rect(g, 1, 14, 3, 2, '#6e5238'); rect(g, 31, 14, 3, 2, '#6e5238');
    rect(g, 12, 13, 12, 2, '#3a2c1c'); rect(g, 9, 14, 3, 1, '#8a7454');
    rect(g, 15, 5, 5, 8, '#c8a020'); rect(g, 15, 5, 2, 8, '#e8c040'); rect(g, 16, 1, 4, 4, '#d8a07a'); rect(g, 14, 0, 7, 2, '#e8c040'); rect(g, 13, 2, 9, 1, '#e8c040'); px(g, 19, 3, '#101418');
    const ry = k ? 0 : 5; line(g, 19, 8, 29, ry, '#8a7454'); line(g, 29, ry, 31, ry + 12, '#c9b27c');
    rect(g, 28, 7, 3, 5, '#3a3a40'); rect(g, 28, 8, 3, 3, '#ffd36b'); px(g, 29, 9, '#fff6c8'); line(g, 29, 7, 29, 5, '#16121a');
    rect(g, 4, 11, 1, 4, '#4a3624'); rect(g, 3, 10, 3, 1, '#8a7454');
    return outline(c, O); };
  return [mk(0), mk(1)];
}
