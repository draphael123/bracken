// fair_art.js - THE HARVEST FAIR's two foes (claude/fair2, L2: real art; the L1 greybox file, renamed). Made from px.js primitives only, in the contract
// desert_foes.js / caravan_bandits.js keep: every frame faces RIGHT (L is the flip), every frame of a sprite shares one canvas, ax = the body's centre
// column, ay = the row under the lowest pixel (grounded sprites settle to it), w/h = the hit box.
//   bakeMummer()     THE MUMMER  a player in patched sackcloth (a rope belt, straw at the collar and the hem), a painted wooden mask (white-ringed eye holes, red cheeks,
//                    a grin of pegged teeth) and a floppy cap with three bells
//                    0 FROZEN (caught mid-step, stock still: the pose you see when you look at it) | 1,2 creep (leaning in, the bells swinging) | 3 GLOW (arms up, the mask
//                    burning red, the eyes white-hot: the tell, and it reads in dusk because it is the only saturated red on the screen) | 4 strike | 5 hurt
//   bakeHobbyHorse() THE HOBBY-HORSE  a player under a red-and-cream cloth skirt with a carved horse's head on a pole (pegged teeth, a painted eye, a straw mane, brass
//                    bells on the bridle)
//                    0 stand (head level) | 1 REAR (the head flung up, eyes lit: the tell) | 2,3 charge (head low, the skirt streaming) | 4 skid | 5 hurt
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { MUMMER, HORSE } from '../mummer.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });

const C = { sack: '#b89868', sackL: '#d8bc8a', sackD: '#8a6c44', sackDD: '#5e4a2e', patch: '#7a8a5a', patch2: '#a86a48', rope: '#6a4a2a', ropeL: '#8a6a3c', straw: '#e6c95c', strawD: '#b8962e',
  mask: '#e2c48a', maskL: '#f4e2b4', maskD: '#b08a4a', white: '#f6efe0', paint: '#c23a30', eye: '#120e14', red: '#ff2a1a', redL: '#ffd0a0', redD: '#a01410', hot: '#fff4c8',
  bell: '#f0c840', bellL: '#fff2a0', bellD: '#a87a18', cap: '#6e3a70', capL: '#9c62a0', capD: '#48244c', capS: '#e8c23a', skin: '#c89a70',
  wood: '#7a5230', woodL: '#a67a48', woodD: '#4e321a', cloth: '#b83a34', clothL: '#e8d8b8', clothD: '#7a2420', clothM: '#d05a48', mane: '#d8b64a', maneD: '#8a6a22', tooth: '#f6efe0', bridle: '#4a2a1a' };

// ================= THE MUMMER =================
export function bakeMummer() {
  const W = 30, H = 38, cx = 13;
  const F = frames(W, H, 6, (g, f) => {
    const creep = f === 1 || f === 2, glow = f === 3, strike = f === 4, hurt = f === 5, frozen = f === 0;
    const lean = creep ? 2 : strike ? 3 : hurt ? -2 : frozen ? 1 : 0, swing = f === 1 ? -1 : f === 2 ? 1 : 0, y0 = 6;
    const top = y0 + 10, hem = y0 + 25;                       // the smock: shoulders and hem
    // -- legs: wrapped in rope, bare feet. Frozen: caught mid-step, one foot off the ground
    const legY = hem - 1, up = frozen ? 3 : creep ? (f === 1 ? 2 : 0) : 0, up2 = creep ? (f === 1 ? 0 : 2) : 0;
    for (const [lx, u] of [[cx - 4 + (creep ? swing * 2 : 0), up], [cx + 1 - (creep ? swing * 2 : 0), up2]]) {
      rect(g, lx, legY, 3, 8 - u, C.sackD); rect(g, lx, legY + 2 - u, 3, 1, C.rope); rect(g, lx, legY + 5 - u, 3, 1, C.rope); rect(g, lx - 1, legY + 7 - u, 5, 2, C.skin); px(g, lx - 1, legY + 7 - u, C.sackDD); }
    // -- the smock: patched sackcloth with a ragged hem
    fillPoly(g, [[cx - 4 + lean, top], [cx + 5 + lean, top], [cx + 8, hem], [cx - 7, hem]], C.sack);
    line(g, cx - 3 + lean, top + 1, cx - 6, hem - 1, C.sackL); line(g, cx + 4 + lean, top + 1, cx + 7, hem - 1, C.sackD);
    rect(g, cx - 4, top + 6, 4, 4, C.patch); rect(g, cx - 4, top + 6, 4, 1, C.sackD); px(g, cx - 3, top + 7, C.sackDD); px(g, cx - 1, top + 9, C.sackDD);   // a patch, stitched
    rect(g, cx + 2, top + 10, 4, 3, C.patch2); px(g, cx + 3, top + 11, C.sackDD);
    for (let x = cx - 7; x <= cx + 8; x++) if ((x & 1) === 0) px(g, x, hem, C.sack); else px(g, x, hem + 1, C.sackD);                // the ragged hem
    rect(g, cx - 5, top + 5, 11, 2, C.rope); px(g, cx - 5, top + 5, C.ropeL); px(g, cx + 1, top + 7, C.rope); px(g, cx + 1, top + 8, C.rope); px(g, cx + 2, top + 9, C.ropeL);   // the rope belt and its knot
    px(g, cx - 4 + lean, top - 1, C.straw); px(g, cx + 5 + lean, top - 1, C.straw); px(g, cx - 5 + lean, top, C.strawD); px(g, cx + 6 + lean, top, C.straw);   // straw at the collar
    px(g, cx - 6, hem + 2, C.straw); px(g, cx + 7, hem + 2, C.strawD); px(g, cx + 1, hem + 2, C.straw);
    // -- arms (sackcloth sleeves, ragged cuffs, bare hands)
    const arm = (sx, sy, ex, ey) => { line(g, sx, sy, ex, ey, C.sack); line(g, sx, sy + 1, ex, ey + 1, C.sackD); rect(g, ex - 1, ey - 1, 3, 3, C.skin); px(g, ex + 1, ey - 1, C.sackDD); };
    if (glow) { arm(cx - 4, top + 2, cx - 10, y0 + 1); arm(cx + 5, top + 2, cx + 11, y0 + 1); }
    else if (strike) { arm(cx + 5 + lean, top + 2, cx + 14, top + 3); rect(g, cx + 13, top - 2, 3, 9, C.wood); rect(g, cx + 13, top - 2, 1, 9, C.woodL); rect(g, cx + 12, top - 3, 5, 3, C.woodD); arm(cx - 4, top + 2, cx - 6, top + 9); }
    else if (creep) { arm(cx + 5 + lean, top + 2, cx + 12 + swing, top + 5); arm(cx - 4, top + 2, cx + 3, top + 8 - swing); }
    else if (frozen) { arm(cx + 5 + lean, top + 2, cx + 10, top + 5); arm(cx - 4, top + 2, cx - 8, top + 9); }
    else if (hurt) { arm(cx - 4, top + 2, cx - 9, top + 7); arm(cx + 5, top + 2, cx + 8, top + 8); }
    // -- the head: a painted wooden mask, tall and flat, with a peaked cap and bells
    const hx = cx + lean + (hurt ? -1 : 0), hy = y0;                 // hy = top of the mask
    ellipse(g, hx, hy + 5, 5, 5, glow ? C.red : C.mask);
    rect(g, hx - 5, hy + 1, 3, 9, glow ? C.redD : C.mask); rect(g, hx - 5, hy + 1, 1, 9, glow ? C.redD : C.maskD);                      // shading down the near edge
    rect(g, hx + 2, hy + 2, 3, 7, glow ? C.red : C.maskD); rect(g, hx - 1, hy + 1, 2, 2, glow ? C.redL : C.maskL);
    // brow ridge, the eyes (white rings, black holes), the nose ridge, red cheeks, the grin
    rect(g, hx - 3, hy + 2, 7, 1, glow ? C.redD : C.maskD);
    for (const ex of [hx - 3, hx + 1]) { rect(g, ex, hy + 3, 3, 3, glow ? C.hot : C.white); rect(g, ex + 1, hy + 3, 2, 3, glow ? C.hot : C.eye); px(g, ex + 1, hy + 4, glow ? C.hot : C.eye); if (!glow) px(g, ex + 2, hy + 5, C.eye); }
    if (glow) { for (const ex of [hx - 3, hx + 1]) { rect(g, ex, hy + 3, 3, 3, C.hot); px(g, ex + 1, hy + 4, C.redL); } }
    px(g, hx, hy + 6, glow ? C.redD : C.maskD); px(g, hx, hy + 7, glow ? C.redD : C.maskD);
    for (const cxx of [hx - 4, hx + 3]) { px(g, cxx, hy + 7, glow ? C.redL : C.paint); px(g, cxx + (cxx < hx ? 1 : -1), hy + 7, glow ? C.redL : C.paint); }
    rect(g, hx - 3, hy + 9, 7, 1, C.eye); for (let i = 0; i < 4; i++) px(g, hx - 3 + i * 2 + 1, hy + 9, glow ? C.hot : C.tooth); px(g, hx - 3, hy + 8, glow ? C.redD : C.paint); px(g, hx + 3, hy + 8, glow ? C.redD : C.paint);
    if (!glow) { px(g, hx + 2, hy + 4, C.sackD); px(g, hx - 4, hy + 6, C.sackD); }                                // chipped paint
    // the cap: three points, a bell on each. It swings with the creep.
    fillPoly(g, [[hx - 6, hy + 2], [hx + 6, hy + 2], [hx + 5, hy - 1], [hx + 1 + swing, hy - 4], [hx - 4, hy - 1]], C.cap);
    rect(g, hx - 6, hy + 1, 13, 2, C.capD); for (let i = 0; i < 3; i++) px(g, hx - 4 + i * 4, hy + 1, C.capS);
    line(g, hx - 3, hy, hx - 1 + swing, hy - 3, C.capL);
    const bell = (bx, by) => { rect(g, bx, by, 2, 2, C.bell); px(g, bx, by, C.bellL); px(g, bx + 1, by + 1, C.bellD); };
    bell(hx + swing * 2, hy - 6 + (creep ? -swing : 0)); bell(hx - 8 - (creep ? 1 : 0), hy + 1 + (creep ? swing : 0)); bell(hx + 7 + (creep ? swing : 0), hy + 1 - (creep ? swing : 0) + (creep ? 1 : 0));
    line(g, hx - 6, hy + 1, hx - 8, hy + 2, C.capD); line(g, hx + 6, hy + 1, hx + 7, hy + 2, C.capD);
  });
  return pack(F, cx, H - 1, MUMMER.w, MUMMER.h);
}

// ================= THE HOBBY-HORSE =================
export function bakeHobbyHorse() {
  const W = 52, H = 42, cx = 18;
  const F = frames(W, H, 6, (g, f) => {
    const rear = f === 1, drive = f === 2 || f === 3, skid = f === 4, hurt = f === 5, k = f === 3 ? 1 : 0, y0 = 10;
    const lean = drive ? 3 : skid ? -2 : rear ? -1 : 0, sway = drive ? k * 2 - 1 : 0;
    // -- the cloth skirt: the horse's body, red with a cream diamond band and a scalloped hem, hiding the player and his pole-mate's stilts
    const top = y0 + 8, hem = y0 + 24;
    fillPoly(g, [[cx - 10 + lean, top], [cx + 9 + lean, top], [cx + 12 + sway + (drive ? -3 : 0), hem], [cx - 13 + sway + (drive ? -5 : 0), hem]], C.cloth);
    rect(g, cx - 10 + lean, top, 20, 2, C.clothD);
    for (let x = cx - 12; x < cx + 12; x += 3) { const yy = top + 8 - (((x - cx) & 3) === 1 ? 1 : 0); rect(g, x + Math.round(lean / 2), yy, 3, 1, C.clothL); px(g, x + 1 + Math.round(lean / 2), yy - 1, C.clothL); px(g, x + 1 + Math.round(lean / 2), yy + 1, C.clothL); }
    line(g, cx - 9 + lean, top + 2, cx - 12 + sway, hem - 1, C.clothM);
    for (let x = cx - 13; x < cx + 12; x += 3) { rect(g, x + sway, hem, 3, 1, C.cloth); px(g, x + 1 + sway, hem + 1, C.clothD); }                    // the scalloped hem
    // -- boots under the hem: four of them
    const bx = [cx - 10, cx - 5, cx + 2, cx + 7]; bx.forEach((x, i) => { const step = drive ? ((i + k) & 1) * -2 : 0; rect(g, x + sway, hem + 2 + step, 3, 5 - step, C.sackDD); rect(g, x - 1 + sway, hem + 6, 5, 2, C.woodD); });
    // -- a tail of rope and straw
    line(g, cx - 10, top + 2, cx - 17, top + 7 + (drive ? -3 : rear ? 3 : 0), C.maneD, 2); line(g, cx - 10, top + 3, cx - 16, top + 10, C.mane); px(g, cx - 18, top + 7, C.mane); px(g, cx - 17, top + 11, C.mane);
    // -- the player's masked face and cap above the skirt, watching over the pole
    const px0 = cx - 1 + lean;
    rect(g, px0 - 3, y0 + 1, 7, 8, C.mask); rect(g, px0 - 3, y0 + 1, 1, 8, C.maskD); rect(g, px0 + 3, y0 + 2, 1, 6, C.maskD);
    rect(g, px0 - 2, y0 + 4, 2, 2, C.eye); rect(g, px0 + 1, y0 + 4, 2, 2, C.eye); px(g, px0 - 2, y0 + 3, C.white); px(g, px0 + 1, y0 + 3, C.white); rect(g, px0 - 2, y0 + 7, 5, 1, C.paint);
    fillPoly(g, [[px0 - 5, y0 + 1], [px0 + 5, y0 + 1], [px0 + 1, y0 - 5]], C.cap); px(g, px0 + 1, y0 - 7, C.bell); px(g, px0 + 1, y0 - 6, C.bellL); px(g, px0 - 6, y0 + 1, C.bell);
    // -- the pole and the carved head: reared for the wind-up, low and driving for the charge
    const sx = cx + 8 + lean, sy = top + 1;
    const hx = sx + (rear ? 7 : drive ? 17 : skid ? 9 : hurt ? 9 : 13), hy = sy + (rear ? -14 : drive ? 5 : skid ? -9 : hurt ? 5 : -5);
    line(g, sx, sy, hx - 3, hy + 2, C.woodD, 3); line(g, sx, sy - 1, hx - 3, hy + 1, C.wood, 2);
    line(g, cx + 6 + lean, top + 3, sx + 3, sy + 1, C.sackD, 2); rect(g, sx + 1, sy - 1, 3, 3, C.skin);                                                            // his hands on it
    const jaw = rear || skid ? 5 : drive ? 1 : 3;                                                                                                                   // the mouth opens for the rear and the skid
    // the neck and skull
    fillPoly(g, [[hx - 5, hy + 4], [hx - 4, hy - 6], [hx + 2, hy - 7], [hx + 4, hy - 2], [hx + 12, hy + 1], [hx + 12, hy + 4], [hx + 3, hy + 4 + (jaw ? 0 : 0)]], C.woodL);
    fillPoly(g, [[hx - 5, hy + 4], [hx - 4, hy - 6], [hx - 1, hy - 5], [hx - 2, hy + 4]], C.wood);                                                                    // the shaded near side
    fillPoly(g, [[hx + 3, hy + 3], [hx + 12, hy + 4], [hx + 11, hy + 4 + jaw], [hx + 2, hy + 5 + jaw]], C.wood);                                                    // the lower jaw
    for (let i = 0; i < 4; i++) { px(g, hx + 4 + i * 2, hy + 4, C.tooth); px(g, hx + 5 + i * 2, hy + 4 + (jaw > 3 ? 1 : 0), C.tooth); }                            // pegged teeth
    fillPoly(g, [[hx - 2, hy - 6], [hx, hy - 12], [hx + 3, hy - 7]], C.woodL); fillPoly(g, [[hx - 1, hy - 7], [hx, hy - 10], [hx + 1, hy - 7]], C.paint);          // the ear
    px(g, hx + 10, hy + 1, C.eye); px(g, hx + 11, hy + 2, C.eye);                                                                                                    // the nostril
    // the eye: a painted white ring; red glass for the wind-up and the charge (the tell)
    const lit = rear || drive; rect(g, hx + 1, hy - 3, 4, 4, C.white); rect(g, hx + 2, hy - 2, 2, 2, lit ? C.red : C.eye); if (lit) { px(g, hx + 2, hy - 2, C.hot); px(g, hx + 1, hy - 4, C.redL); px(g, hx + 5, hy - 4, C.redL); }
    // the mane: straw, streaming back
    for (let i = 0; i < 5; i++) line(g, hx - 3 - (drive ? 1 : 0), hy - 6 + i * 2, hx - 8 - i - (drive ? 3 : 0), hy - 4 + i * 2 + (drive ? -1 : 2), i & 1 ? C.mane : C.maneD);
    // the bridle: brass bells and a red browband
    line(g, hx + 3, hy - 4, hx + 11, hy + 1, C.paint); rect(g, hx + 4, hy + 4 + jaw, 2, 2, C.bell); px(g, hx + 4, hy + 4 + jaw, C.bellL); rect(g, hx - 4, hy - 3, 2, 2, C.bell); px(g, hx - 4, hy - 3, C.bellL); rect(g, hx + 8, hy + 2, 2, 2, C.bell);
    if (hurt) { px(g, hx + 3, hy - 2, C.eye); px(g, hx + 4, hy - 2, C.eye); }
    if (skid) { for (let i = 0; i < 4; i++) rect(g, cx - 14 - i * 3, hem + 6 - (i & 1), 3, 2, '#c8b48a'); }
    if (drive) { for (let i = 0; i < 3; i++) line(g, cx - 14 - i * 2, top + 4 + i * 5, cx - 22 - i * 2, top + 4 + i * 5, C.clothL); }
  });
  return pack(F, cx + 4, H - 1, HORSE.w, HORSE.h);
}
