// theatre_rooms.js - THE MASKWRIGHT'S THEATRE's ROOMS (claude/theatreart): the painted back wall of every room the level declares (L.interiors kinds
// thFoyer thHouse thPassage thCostume thWorkshop thDock thFly thStage thUnder thWings thMain). Each is baked once, in room-local pixels, and drawn as an
// image; THE HOUSE is the exception - its wall is a PARALLAX backdrop (the tiers of boxes and the coffered dome, two layers that slide against the camera).
//   paintTheatreRoom(g, st, w, h, tx0, ty0, time, camX, camY, roomWorldX, roomWorldY)   g is already translated to the room's corner and clipped to it
// The readability rule: a back wall is DARKER and QUIETER than any floor in front of it; the loud things (masks, bulbs, gilt) sit small and dim.
import { canvas, px, rect, line, fillPoly, circle, ellipse, outline, mulberry } from '../px.js';
import { TH } from './theatre_tiles.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const shadeHex = (h, k) => { const p = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return '#' + p.map(v => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))).toString(16).padStart(2, '0')).join(''); };
function glow(g, x, y, r, rgb, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
function vgrad(g, x, y, w, h, top, bot) { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(x, y, w, h); }

// ============ shared bakes: masks, bulbs, garments (also used by theatre_props.js) ============
/* THE MASKS the workshop hangs on its walls: 11 x 14, a face each - comedy, tragedy, a fool, a queen, a beast, a plague beak, a devil, a moon, a blank white,
   a gold sun, a harlequin. Porcelain or plaster, painted, with eye holes cut out dark. */
export function bakeMask(kind) {
  return once('mask' + kind, () => { const [c, g] = canvas(13, 16), K = { white: '#e8e0d0', whiteD: '#b8b0a0', gold: TH.brass2, goldD: TH.brass1, red: TH.ox2, redD: TH.ox0, blue: '#3a5a9a', blueD: '#1e2e5a', green: '#4a7a4a', ink: '#120a10', cream: '#efe0b8', black: '#1c1418', purple: '#6a3a8a' };
    const face = (col, colD) => { for (let y = 1; y < 15; y++) { const t = (y - 1) / 13, hw = Math.round(5.5 * Math.sqrt(1 - (t * 2 - 0.9) ** 2 + 0.2)) ; const w = Math.max(2, Math.min(5, hw)); rect(g, 6 - w, y, w * 2 + 1, 1, col); } rect(g, 1, 4, 1, 6, colD); rect(g, 11, 4, 1, 6, colD); };
    const eyes = (o = 0, sl = 0) => { for (const ex of [4, 8]) { rect(g, ex - 1, 5 + o, 3, 2, K.ink); if (sl) px(g, ex - 1 + (ex > 6 ? 2 : 0), 4 + o, K.ink); } };
    if (kind === 0) { face(K.white, K.whiteD); eyes(0, 1); rect(g, 4, 10, 5, 1, K.red); px(g, 3, 9, K.red); px(g, 9, 9, K.red); px(g, 6, 8, K.whiteD); }          // comedy: a smile
    else if (kind === 1) { face(K.white, K.whiteD); eyes(1); rect(g, 4, 10, 5, 1, K.blue); px(g, 3, 11, K.blue); px(g, 9, 11, K.blue); px(g, 4, 5, K.blue); px(g, 8, 5, K.blue); }   // tragedy: a frown, a tear
    else if (kind === 2) { face(K.gold, K.goldD); eyes(); rect(g, 4, 10, 5, 1, K.ink); for (let x = 1; x < 12; x += 2) px(g, x, 0, K.gold); px(g, 6, 1, K.red); }             // a sun, rayed
    else if (kind === 3) { face(K.black, '#000'); eyes(0, 1); rect(g, 3, 10, 7, 1, K.gold); px(g, 6, 7, K.gold); rect(g, 5, 2, 3, 1, K.gold); px(g, 2, 8, K.red); px(g, 10, 8, K.red); }  // a queen, black and gilt
    else if (kind === 4) { face(K.red, K.redD); eyes(0, 1); fillPoly(g, [[2, 3], [1, 0], [4, 2]], K.redD); fillPoly(g, [[10, 3], [11, 0], [8, 2]], K.redD); rect(g, 4, 10, 5, 1, K.ink); px(g, 4, 11, K.white); px(g, 8, 11, K.white); }   // a devil
    else if (kind === 5) { face(K.cream, K.whiteD); eyes(0); fillPoly(g, [[5, 7], [8, 7], [6, 15]], K.cream); px(g, 6, 14, K.whiteD); rect(g, 5, 7, 1, 6, K.whiteD); }       // a plague-doctor's beak
    else if (kind === 6) { face(K.blue, K.blueD); eyes(0, 1); rect(g, 3, 4, 7, 1, K.white); px(g, 4, 2, K.white); px(g, 8, 2, K.white); rect(g, 4, 10, 5, 1, K.ink); }        // a moon-faced fool
    else if (kind === 7) { face(K.white, K.whiteD); eyes(); }                                                                                                                       // the blank: a face with nobody in it
    else if (kind === 8) { face(K.green, '#2a4a2a'); eyes(0, 1); fillPoly(g, [[6, 0], [3, 3], [9, 3]], K.gold); rect(g, 4, 10, 5, 1, K.ink); }                                          // a green man, crowned
    else { face(K.white, K.whiteD); rect(g, 1, 1, 6, 7, K.red); rect(g, 6, 8, 6, 6, K.ink); eyes(); rect(g, 4, 10, 5, 1, K.ink); }                                                    // a harlequin, halved
    for (let k = 0; k < 2; k++) px(g, 0 + k * 12, 6, K.rope || TH.rope);
    return outline(c, '#0c0810'); });
}
const bulbGlow = (g, x, y, r, a = 0.5) => glow(g, x, y, r, '255,220,140', a);

// ============ rooms ============
function wallpaper(g, w, h, base, stripe, seed, dot) {   // flock paper: stripes and a lozenge
  rect(g, 0, 0, w, h, base); const r = mulberry(seed);
  for (let x = 0; x < w; x += 16) { rect(g, x + 3, 0, 8, h, stripe); rect(g, x + 3, 0, 1, h, shadeHex(stripe, 0.12)); for (let y = 6; y < h; y += 14) { px(g, x + 7, y, dot); px(g, x + 6, y + 1, dot); px(g, x + 8, y + 1, dot); px(g, x + 7, y + 2, dot); } }
  for (let i = 0; i < w * h / 500; i++) px(g, (r() * w) | 0, (r() * h) | 0, shadeHex(base, -0.25));
}
function timberWall(g, w, h, y0, base, plank, seed) {   // vertical boards with grain and nail heads
  const r = mulberry(seed); rect(g, 0, y0, w, h - y0, base);
  for (let x = 0; x < w; x += 8) { rect(g, x, y0, 7, h - y0, r() < 0.5 ? base : plank); rect(g, x + 7, y0, 1, h - y0, shadeHex(base, -0.4)); if (r() < 0.6) { const gy = y0 + ((r() * (h - y0 - 8)) | 0); rect(g, x + 2 + ((r() * 3) | 0), gy, 1, 5, shadeHex(base, -0.2)); }
    if (r() < 0.25) { const gy = y0 + ((r() * (h - y0 - 4)) | 0); px(g, x + 3, gy, TH.iron3); } }
}
function brickWall(g, w, h, y0, a, b, m, seed) {
  const r = mulberry(seed); rect(g, 0, y0, w, h - y0, m);
  for (let row = 0, y = y0; y < h; y += 6, row++) { const off = (row & 1) ? 7 : 0; for (let x = -14 + off; x < w; x += 14) rect(g, x + 1, y + 1, 13, 5, r() < 0.2 ? b : a); }
}
function gilt(g, x, y, w, thick = 2) { rect(g, x, y, w, thick, TH.brass1); rect(g, x, y, w, 1, TH.brass3); if (thick > 2) rect(g, x, y + thick - 1, w, 1, TH.brass0); }
function bulb(g, x, y, lit = true) { rect(g, x - 1, y - 1, 3, 3, lit ? '#fff2b0' : '#5a5040'); px(g, x, y - 1, '#ffffff'); rect(g, x - 1, y + 2, 3, 1, TH.iron2); }
function pipe(g, x0, y, x1, col = TH.iron2) { rect(g, x0, y, x1 - x0, 3, col); rect(g, x0, y, x1 - x0, 1, TH.iron3); rect(g, x0, y + 2, x1 - x0, 1, TH.iron0); for (let x = x0 + 24; x < x1; x += 40) { rect(g, x, y - 1, 3, 5, TH.iron1); rect(g, x, y - 1, 3, 1, TH.iron3); } }
function playbill(g, x, y, w, h, seed) { const r = mulberry(seed); rect(g, x, y, w, h, '#d8c8a0'); rect(g, x, y, w, 1, '#efe4c0'); rect(g, x, y + h - 1, w, 1, '#a89870'); rect(g, x + 2, y + 2, w - 4, 3, TH.ox2);
  for (let i = 0; i < 4; i++) { rect(g, x + 2, y + 7 + i * 3, w - 4 - ((r() * 5) | 0), 1, '#4a3a2a'); } px(g, x + 1, y + 1, TH.iron3); px(g, x + w - 2, y + 1, TH.iron3); }
function garment(g, x, y, col, len, seed) { rect(g, x, y, 1, 2, TH.iron3); rect(g, x - 2, y + 2, 5, 1, TH.iron3);   // a costume on its hanger
  const r = mulberry(seed); fillPoly(g, [[x - 3, y + 3], [x + 3, y + 3], [x + 5, y + 3 + len], [x - 5, y + 3 + len]], col); rect(g, x - 5, y + 3 + len - 1, 11, 1, shadeHex(col, -0.4));
  rect(g, x - 3, y + 3, 1, len, shadeHex(col, 0.18)); rect(g, x + 2, y + 3, 1, len, shadeHex(col, -0.3)); for (let i = 0; i < 2; i++) px(g, x + ((r() * 6) | 0) - 3, y + 6 + ((r() * (len - 4)) | 0), TH.brass2); }

const ROOMS = {
  thFoyer(g, w, h) {
    wallpaper(g, w, h, '#3a1622', '#4a2030', 41, '#7a4a3a'); vgrad(g, 0, 0, w, h, 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.05)');
    timberWall(g, w, h, h - 30, TH.wood2, TH.wood3, 9); rect(g, 0, h - 31, w, 1, TH.wood4); gilt(g, 0, h - 33, w, 2);
    for (let x = 6; x < w - 8; x += 21) { rect(g, x, h - 26, 15, 16, TH.wood1); rect(g, x + 1, h - 25, 13, 14, TH.wood2); rect(g, x + 1, h - 25, 13, 1, TH.wood4); }
    gilt(g, 0, 0, w, 3); for (let x = 3; x < w; x += 8) { px(g, x, 4, TH.brass2); px(g, x + 1, 5, TH.brass1); }
    playbill(g, 14, 22, 22, 28, 2); playbill(g, 52, 26, 18, 24, 3);
    rect(g, 94, 20, 26, 36, TH.brass1); rect(g, 95, 21, 24, 34, '#2a1620'); rect(g, 100, 28, 14, 12, '#5a3a4a'); rect(g, 100, 28, 14, 1, '#8a6a7a'); circle(g, 107, 34, 3, '#c8b898');   // a portrait: nobody you know
    for (const x of [40, 84]) { rect(g, x, 40, 3, 8, TH.brass1); rect(g, x - 1, 38, 5, 2, TH.brass2); bulb(g, x + 1, 36); glow(g, x + 1, 36, 24, '255,200,110', 0.26); }
  },
  thPassage(g, w, h) {
    brickWall(g, w, h, 0, '#3a2c2a', '#463632', '#1c1414', 21); vgrad(g, 0, 0, w, h, 'rgba(6,4,10,0.55)', 'rgba(6,4,10,0.15)');
    rect(g, 0, h - 24, w, 24, '#2a201c'); rect(g, 0, h - 25, w, 1, TH.wood4); for (let x = 0; x < w; x += 10) rect(g, x, h - 24, 1, 24, '#1c1410');    // the wainscot
    pipe(g, 0, 10, w); pipe(g, 0, 22, w * 0.6);
    for (let x = 44; x < w; x += 92) { rect(g, x, 26, 1, 8, TH.iron1); bulb(g, x, 36); glow(g, x, 36, 30, '255,210,120', 0.32); }                                // bare bulbs on flex
    rect(g, 12, 44, 44, 16, '#c8a020'); rect(g, 13, 45, 42, 14, '#1a1410'); for (let x = 14; x < 54; x += 4) { rect(g, x, 46, 2, 12, x % 8 === 2 ? '#1a1410' : '#c8a020'); }    // the STAGE DOOR sign: hazard stripes
    rect(g, 24, 48, 20, 8, '#efe2b0'); for (let x = 26; x < 42; x += 4) rect(g, x, 50, 2, 4, '#3a2a1a');
    for (let x = 130; x < w - 20; x += 110) playbill(g, x, 40, 18, 22, x);
    for (let x = 200; x < w - 40; x += 150) { rect(g, x, h - 60, 26, 36, TH.wood1); rect(g, x + 2, h - 58, 22, 32, '#0c0808'); rect(g, x + 20, h - 42, 2, 2, TH.brass2); }   // a closed door
  },
  thCostume(g, w, h) {   // the costume store (bottom) and the dressing rooms over it (top 96 px)
    rect(g, 0, 0, w, h, '#241820'); const ds = h - 7 * 16;   // ds: where the store's rows begin (the slab between is hidden by tiles)
    wallpaper(g, w, 96, '#2c1a28', '#381e30', 57, '#5a3a4a'); vgrad(g, 0, 0, w, 96, 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.08)');
    timberWall(g, w, 70, 0 + 70, TH.wood2, TH.wood3, 12); rect(g, 0, 69, w, 1, TH.wood4);                                                                  // the dressing rooms' dado
    gilt(g, 0, 0, w, 2); for (let x = 20; x < w; x += 60) { rect(g, x, 20, 28, 26, '#1a1018'); rect(g, x, 20, 28, 1, TH.brass1); for (let k = 0; k < 4; k++) garment(g, x + 4 + k * 6, 22, ['#7a1a2a', '#2a4a7a', '#4a6a2a', '#8a6a1a'][k], 14 + (k % 2) * 4, x + k); }
    for (let x = 6; x < w - 6; x += 60) { rect(g, x, 50, 30, 2, TH.brass1); }
    timberWall(g, w, h, ds, TH.wood1, TH.wood2, 33); vgrad(g, 0, ds, w, h - ds, 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.05)');                                  // the store below
    for (let sy = ds + 14; sy < h - 20; sy += 36) { rect(g, 0, sy, w, 3, TH.wood3); rect(g, 0, sy, w, 1, TH.wood4); rect(g, 0, sy + 3, w, 1, TH.wood0);   // shelves, hat boxes on them
      const r = mulberry(sy); for (let x = 6; x < w - 14; x += 14 + ((r() * 18) | 0)) { const bw = 10 + ((r() * 6) | 0), bh = 8 + ((r() * 5) | 0), col = ['#8a2a34', '#2a3a6a', '#6a5a2a', '#d8c8a0', '#4a2a5a'][(r() * 5) | 0];
        rect(g, x, sy - bh, bw, bh, col); rect(g, x, sy - bh, bw, 1, shadeHex(col, 0.25)); rect(g, x, sy - 3, bw, 1, shadeHex(col, -0.3)); rect(g, x + bw / 2 - 1, sy - bh + 2, 2, 1, TH.brass2); } }
    rect(g, 0, ds + 4, w, 2, TH.iron1); rect(g, 0, ds + 4, w, 1, TH.iron3); for (let x = 12; x < w; x += 14) garment(g, x, ds + 6, ['#7a1a2a', '#2a4a7a', '#4a6a2a', '#8a6a1a', '#5a2a6a', '#8a4a2a'][((x / 14) | 0) % 6], 16 + (x % 3) * 3, x);    // the rail of costumes
  },
  thWorkshop(g, w, h, tx0, ty0) {   // rows 18-33; x 0..367 is over the mirror room (rows 19-24) and the low workshop (27-33); the tall workshop is x >= 368
    rect(g, 0, 0, w, h, '#241612'); const low = 27 - ty0, hiX = 23 * 16;
    // the tall workshop, right: plank wall hung with masks
    timberWall(g, w, h, 0, '#3a281e', '#46301f', 71); vgrad(g, 0, 0, w, h, 'rgba(0,0,0,0.42)', 'rgba(0,0,0,0.12)');
    const r = mulberry(88); for (let row = 0; row < 5; row++) for (let x = hiX + 8 + (row & 1) * 9; x < w - 12; x += 18) { if (r() < 0.14) continue;
      const my = 12 + row * 26; const m = bakeMask(((r() * 10) | 0)); g.globalAlpha = 0.6; g.drawImage(m, x, my); g.globalAlpha = 1; rect(g, x + 6, my - 2, 1, 3, TH.rope); }        // the wall of masks
    rect(g, hiX, h - 40, w - hiX, 40, '#1e120e'); rect(g, hiX, h - 41, w - hiX, 1, TH.wood4);
    for (const bx of [hiX + 24, hiX + 120]) { rect(g, bx, h - 56, 60, 8, TH.wood3); rect(g, bx, h - 56, 60, 1, TH.wood5); rect(g, bx + 4, h - 48, 4, 8, TH.wood1); rect(g, bx + 52, h - 48, 4, 8, TH.wood1);   // a bench: plaster heads and glue-pots
      for (let k = 0; k < 4; k++) { circle(g, bx + 10 + k * 13, h - 62, 5, '#c8c0b0'); rect(g, bx + 8 + k * 13, h - 62, 1, 2, TH.iron0); rect(g, bx + 12 + k * 13, h - 62, 1, 2, TH.iron0); } rect(g, bx + 50, h - 62, 6, 6, '#7a5a2a'); }
    // the low workshop and the mirror room over it (x < 368)
    rect(g, 0, 0, hiX, h, '#20141a'); wallpaper(g, hiX, 112, '#2a1626', '#361c30', 91, '#5a3a4a'); vgrad(g, 0, 0, hiX, 112, 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)'); timberWall(g, hiX, 112, 84, TH.wood2, TH.wood3, 14); rect(g, 0, 83, hiX, 1, TH.wood4); gilt(g, 0, 16, hiX, 2);
    rect(g, 0, 112, hiX, 32, '#1a1010');                                                                                                                           // the slab (tiles cover it)
    timberWall(g, hiX, h, low * 16 - 0, '#34221a', '#3e2a20', 5); vgrad(g, 0, low * 16, hiX, h - low * 16, 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.05)');
    for (let row = 0; row < 3; row++) for (let x = 10 + (row & 1) * 9; x < hiX - 12; x += 22) { const rr = mulberry(x * 3 + row); if (rr() < 0.3) continue; const m = bakeMask(((rr() * 10) | 0)); g.globalAlpha = 0.6; g.drawImage(m, x, low * 16 + 8 + row * 26); g.globalAlpha = 1; }
    rect(g, 0, low * 16 - 3, hiX, 1, TH.iron1);
    for (const x of [60, 210]) { rect(g, x, 24, 2, 10, TH.iron1); bulb(g, x + 1, 36); glow(g, x + 1, 36, 26, '255,210,120', 0.22); }                                   // a bare bulb over the drop
  },
  thDock(g, w, h) {   // the scene dock: raw canvas flats leaning, rolled cloths, tracks
    brickWall(g, w, h, 0, '#30262a', '#3c2e32', '#161014', 66); vgrad(g, 0, 0, w, h, 'rgba(4,2,8,0.5)', 'rgba(4,2,8,0.1)');
    for (let x = 14; x < w - 40; x += 60) { rect(g, x, 8, 44, h - 8, '#8a7a5a'); rect(g, x, 8, 44, h - 8, 'rgba(10,6,14,0.5)'); rect(g, x, 8, 44, 1, TH.wood4); for (let k = 0; k < 4; k++) rect(g, x + 2, 12 + k * 22, 40, 2, TH.wood2); rect(g, x, 8, 2, h - 8, TH.wood2); rect(g, x + 42, 8, 2, h - 8, TH.wood2); circle(g, x + 22, 40, 8, '#4a5a3a'); rect(g, x + 10, 64, 24, 3, '#3a4a5a'); }
    for (let k = 0; k < 3; k++) { const x = w - 44 + k * 10; rect(g, x, h - 40, 8, 36, '#a89a72'); rect(g, x, h - 40, 8, 1, TH.cream); rect(g, x + 7, h - 40, 1, 36, '#6a5a3a'); }
    for (let x = 30; x < w; x += 70) { rect(g, x, h - 12, 8, 8, '#5a3a2a'); rect(g, x + 1, h - 12, 6, 2, '#c04040'); }
    for (const x of [8, 100]) { rect(g, x, 20, 1, 8, TH.iron1); bulb(g, x, 30); glow(g, x, 30, 26, '255,210,120', 0.22); }
  },
  thFly(g, w, h) {   // the fly tower: a canyon of brick, a lattice of lines and blocks up in the dark, a shaft of dusk
    brickWall(g, w, h, 0, '#2e2226', '#3a2c30', '#12090e', 44); vgrad(g, 0, 0, w, h, 'rgba(2,0,6,0.85)', 'rgba(2,0,6,0.25)');
    rect(g, 0, 0, w, 28, '#0a0610'); for (let x = 0; x < w; x += 12) { rect(g, x, 20, 8, 8, TH.iron1); rect(g, x, 20, 8, 1, TH.iron3); circle(g, x + 4, 24, 2, TH.iron0); }                 // the loft blocks along the grid
    for (let x = 6; x < w; x += 12) { rect(g, x, 28, 1, h - 60, 'rgba(184,168,136,0.16)'); if (x % 24 === 6) rect(g, x, 28, 1, 60 + (x % 5) * 20, 'rgba(184,168,136,0.3)'); }         // the lines going down to nothing
    for (const wx of [w * 0.28, w * 0.7]) { g.save(); g.globalAlpha = 0.5; fillPoly(g, [[wx - 8, 90], [wx + 8, 90], [wx + 60, h], [wx - 40, h]], 'rgba(255,200,140,0.10)'); g.restore(); rect(g, wx - 9, 60, 20, 34, '#0c0810'); rect(g, wx - 8, 61, 18, 32, '#3a2a48'); for (let k = 0; k < 4; k++) rect(g, wx - 8, 62 + k * 8, 18, 1, '#0c0810'); }
    rect(g, 6, 44, 6, h - 56, TH.iron1); for (let y = 52; y < h - 20; y += 8) rect(g, 4, y, 10, 1, TH.iron3);                                                             // an iron ladder up the wall
    for (const y of [96, 258]) { rect(g, 0, y, w, 2, TH.iron1); rect(g, 0, y, w, 1, TH.iron3); for (let x = 4; x < w; x += 16) rect(g, x, y + 2, 1, 4, TH.iron1); }                // the galleries' back rails
  },
  thStage(g, w, h, tx0, ty0) {   // the rehearsal stage: black masking above, a painted backcloth, the wings' legs, the boards
    rect(g, 0, 0, w, h, '#0e0a12'); brickWall(g, w, h, 0, '#241c24', '#2c222c', '#0c080e', 33); vgrad(g, 0, 0, w, h, 'rgba(2,0,8,0.8)', 'rgba(2,0,8,0.1)');
    const cy0 = (17 - ty0) * 16, cyH = h - cy0;                                                                                                                        // the backcloth: rows 17-33
    vgrad(g, 6, cy0, w - 12, cyH, '#1a1030', '#6a3040'); rect(g, 6, cy0, w - 12, 1, TH.brass1);
    { const rr = mulberry(9); for (let i = 0; i < 40; i++) px(g, 10 + ((rr() * (w - 20)) | 0), cy0 + 4 + ((rr() * cyH * 0.5) | 0), i % 3 ? '#8a7aa8' : '#e8e0c8'); }
    circle(g, w * 0.62, cy0 + 40, 12, '#d8c8a0'); circle(g, w * 0.62 + 4, cy0 + 38, 10, '#2a1a40');                                                                    // a painted moon
    for (let layer = 0; layer < 2; layer++) { const col = layer ? '#1a1024' : '#2a1a34', base = h - 38 - layer * 10; for (let x = 6; x < w - 6; x++) { const top = base - 14 - 10 * Math.sin(x * 0.03 + layer * 2) - 6 * Math.sin(x * 0.09 + layer); rect(g, x, top, 1, h - top, col); } }
    rect(g, 0, 0, w, 40, '#06040a'); for (let x = 0; x < w; x += 48) { rect(g, x, 0, 24, 44, '#0a0710'); rect(g, x, 40, 24, 3, TH.ox0); }                                            // the borders: black cloth hung over the loft
    for (const [x, ww] of [[0, 18], [w - 18, 18]]) { rect(g, x, 40, ww, h - 40, '#0a0710'); for (let k = 0; k < 4; k++) rect(g, x + k * 5, 40, 1, h - 40, '#16101c'); rect(g, x, 40, ww, 2, TH.ox1); }   // the legs: black wings
    rect(g, 6, cy0 - 1, w - 12, 1, '#000');
  },
  thUnder(g, w, h) {   // the under-stage: near-black timber, posts, windlasses, a lantern or two, wet
    rect(g, 0, 0, w, h, '#0a070c'); for (let x = 0; x < w; x += 8) rect(g, x, 0, 1, h, '#12101a');
    for (let x = 12; x < w; x += 52) { rect(g, x, 0, 8, h, '#1c1410'); rect(g, x, 0, 1, h, '#2e2018'); rect(g, x + 7, 0, 1, h, '#0c0808'); }                            // the posts
    for (const y of [26, 74]) { rect(g, 0, y, w, 4, '#1c1410'); rect(g, 0, y, w, 1, '#30221a'); }                                                                       // the cross-beams
    for (let x = 18; x < w; x += 104) { line(g, x, 4, x + 40, 28, '#241a14', 2); line(g, x + 52, 4, x + 12, 28, '#241a14', 2); }                                       // braces
    for (let x = 30; x < w; x += 160) { rect(g, x, 30, 1, 30, TH.iron1); for (let k = 0; k < 6; k++) rect(g, x - 1 + (k & 1), 31 + k * 5, 3, 2, TH.iron2); }             // a chain
    vgrad(g, 0, 0, w, h, 'rgba(0,0,0,0.3)', 'rgba(20,30,50,0.25)');
    for (const x of [40, 240, 470]) { rect(g, x, 8, 1, 6, TH.iron1); rect(g, x - 2, 14, 5, 7, '#3a2a14'); rect(g, x - 1, 15, 3, 5, '#ffb050'); glow(g, x, 18, 34, '255,150,60', 0.28); }   // a lantern hung on a nail
  },
  thWings(g, w, h) {   // the wings: a rope pin-rail, sandbags, stacked flats, black legs, a fire bucket
    brickWall(g, w, h, 0, '#2a2226', '#342a2e', '#100a0e', 52); vgrad(g, 0, 0, w, h, 'rgba(2,0,8,0.7)', 'rgba(2,0,8,0.12)');
    for (let x = 6; x < w - 30; x += 110) { rect(g, x, 30, 14, h - 50, '#0a0710'); for (let k = 0; k < 3; k++) rect(g, x + k * 4, 30, 1, h - 50, '#150f1a'); }               // black legs hung on the wall
    const py = h - 80; rect(g, 0, py, w, 6, TH.wood3); rect(g, 0, py, w, 1, TH.wood5); rect(g, 0, py + 5, w, 1, TH.wood0);                                            // THE PIN RAIL
    for (let x = 8; x < w - 8; x += 9) { rect(g, x, py - 7, 2, 7, TH.iron3); rect(g, x - 1, py - 8, 4, 2, TH.iron4); const rr = mulberry(x); if (rr() < 0.7) { const col = ['#c8b078', '#a89058', '#8a7444'][(rr() * 3) | 0]; rect(g, x - 1, py - 34, 1, 34, col); rect(g, x, py - 5, 2, 3, col); rect(g, x - 1, py - 4, 4, 2, col); } }   // belaying pins, the lines belayed on them
    for (let x = 20; x < w - 40; x += 120) { rect(g, x, h - 24, 14, 20, '#6e5634'); rect(g, x, h - 24, 14, 3, '#a88a5a'); rect(g, x + 6, h - 21, 2, 17, '#3a2c1e'); rect(g, x + 16, h - 18, 14, 14, '#6e5634'); rect(g, x + 16, h - 18, 14, 3, '#a88a5a'); }     // sandbags stacked
    for (const x of [60, 300]) { rect(g, x, 30, 1, 8, TH.iron1); bulb(g, x, 40); glow(g, x, 40, 30, '255,200,120', 0.22); }
    rect(g, 3, h - 44, 12, 16, '#8a1a1a'); rect(g, 4, h - 43, 10, 2, '#c03030'); rect(g, 7, h - 46, 4, 2, TH.iron2);                                                    // a fire bucket, red
  },
  thMain(g, w, h) {   // his room: a black-box stage waiting (his lane dresses it)
    rect(g, 0, 0, w, h, '#0c0810'); brickWall(g, w, h, 0, '#1c1420', '#241a28', '#08040c', 5); vgrad(g, 0, 0, w, h, 'rgba(2,0,8,0.75)', 'rgba(2,0,8,0.15)');
    for (let x = 0; x < w; x += 64) { rect(g, x, 0, 20, h - 40, '#0a0610'); for (let k = 0; k < 4; k++) rect(g, x + k * 5, 0, 1, h - 40, '#130d18'); rect(g, x, h - 44, 20, 4, TH.ox0); }
  },
};

const HOUSE_W = 320, HOUSE_H = 464;
function houseFar() {   // the far wall of the auditorium: a coffered dome, the gods, two tiers of boxes, the wainscot; seamless across 320 px
  return once('houseFar', () => { const [c, g] = canvas(HOUSE_W, HOUSE_H), r = mulberry(17);
    vgrad(g, 0, 0, HOUSE_W, HOUSE_H, '#0a0510', '#1a0e20');
    for (let x = 0; x < HOUSE_W; x += 160) { ellipse(g, x + 80, 8, 84, 74, '#1e1026'); ellipse(g, x + 80, 8, 74, 64, '#26142e'); ellipse(g, x + 80, 8, 40, 36, '#2e1a36');
      for (let k = -4; k <= 4; k++) line(g, x + 80, 8, x + 80 + k * 20, 78, TH.brass0); rect(g, x + 77, 40, 6, 6, TH.brass1); rect(g, x + 78, 41, 4, 2, TH.brass3); }
    for (let x = 0; x < HOUSE_W; x += 64) { fillPoly(g, [[x, 100], [x + 64, 100], [x + 64, 108], [x, 108]], TH.plum2); }
    const tier = (y0, hh, drape, seed) => { const rr = mulberry(seed);
      rect(g, 0, y0, HOUSE_W, hh, '#0c0710');
      for (let bx = 0; bx < HOUSE_W; bx += 64) {
        rect(g, bx + 6, y0 + 8, 52, hh - 18, '#160c1a'); rect(g, bx + 6, y0 + 8, 52, 1, TH.brass0);
        fillPoly(g, [[bx + 6, y0 + 8], [bx + 58, y0 + 8], [bx + 58, y0 + 20], [bx + 46, y0 + 14], [bx + 32, y0 + 22], [bx + 18, y0 + 14], [bx + 6, y0 + 20]], drape);   // the swag
        rect(g, bx + 6, y0 + 8, 6, hh - 18, shadeHex(drape, -0.25)); rect(g, bx + 52, y0 + 8, 6, hh - 18, shadeHex(drape, -0.25)); rect(g, bx + 8, y0 + 8, 1, hh - 18, shadeHex(drape, 0.15));   // the drapes at the sides
        rect(g, bx + 30, y0 + 20, 1, 6, TH.brass2); px(g, bx + 30, y0 + 26, TH.brass3);
        const n = (rr() * 3) | 0; for (let k = 0; k < n; k++) { const hx = bx + 20 + k * 12 + ((rr() * 4) | 0), hy = y0 + hh - 32; circle(g, hx, hy, 4, '#1e1220'); rect(g, hx - 4, hy + 4, 9, 10, '#1a0e1c'); if (rr() < 0.5) { px(g, hx + 2, hy - 1, TH.brass2); px(g, hx + 3, hy - 1, TH.brass3); } else px(g, hx - 1, hy - 1, '#b8a0a0'); }
        rect(g, bx + 4, y0 + hh - 12, 56, 12, TH.wood2); rect(g, bx + 4, y0 + hh - 12, 56, 2, TH.brass2); rect(g, bx + 4, y0 + hh - 10, 56, 1, TH.brass0); rect(g, bx + 6, y0 + hh - 8, 52, 6, TH.ox1); rect(g, bx + 6, y0 + hh - 8, 52, 1, TH.ox2);   // the box front: gilt over velvet
        for (let k = 0; k < 6; k++) px(g, bx + 10 + k * 8, y0 + hh - 5, TH.brass2);
        rect(g, bx, y0, 6, hh, TH.brass0); rect(g, bx + 1, y0, 1, hh, TH.brass2); rect(g, bx, y0, 6, 3, TH.brass2); }
    };
    tier(110, 90, '#5a1420', 3); tier(206, 92, '#3a1a4a', 5); tier(304, 92, '#5a1420', 8);
    for (let x = 0; x < HOUSE_W; x += 64) gilt(g, x, 108, 64, 3);
    rect(g, 0, 400, HOUSE_W, 64, '#1c1218'); rect(g, 0, 400, HOUSE_W, 2, TH.brass1); for (let x = 0; x < HOUSE_W; x += 32) { rect(g, x + 3, 408, 26, 44, '#241820'); rect(g, x + 3, 408, 26, 1, '#382a30'); }
    g.fillStyle = 'rgba(10,4,16,0.24)'; g.fillRect(0, 0, HOUSE_W, HOUSE_H);
    return c; });
}
function houseMid() {   // the near layer: pilasters, hung drapes and the far ends of the balcony fronts, sliding faster; mostly dark shapes so it stays a wall
  return once('houseMid', () => { const [c, g] = canvas(480, 464);
    for (let x = 0; x < 480; x += 160) { rect(g, x + 10, 0, 14, 464, '#170c1c'); rect(g, x + 10, 0, 2, 464, '#2e1a34'); rect(g, x + 22, 0, 2, 464, '#0a050e'); for (let y = 0; y < 464; y += 6) px(g, x + 15, y, '#241228');
      rect(g, x + 6, 96, 22, 4, TH.brass1); rect(g, x + 6, 96, 22, 1, TH.brass2); rect(g, x + 6, 200, 22, 4, TH.brass1); rect(g, x + 6, 300, 22, 4, TH.brass1);   // the capitals
      fillPoly(g, [[x + 60, 0], [x + 140, 0], [x + 130, 44], [x + 100, 26], [x + 70, 44]], '#3a0e18'); rect(g, x + 100, 26, 1, 14, TH.brass1); }                        // a valance
    g.fillStyle = 'rgba(8,2,12,0.5)'; g.fillRect(0, 0, 480, 464);
    return c; });
}
function paintHouse(g, w, h, time, camX, camY, worldX, worldY) {
  vgrad(g, 0, 0, w, h, '#0c0612', '#1e1024');
  const far = houseFar(), mid = houseMid();
  const relX = camX - worldX, relY = camY - worldY;
  const yFar = Math.round(-relY * 0.18 + 0.18 * 200), yMid = Math.round(-relY * 0.08 + 0.08 * 200);   // slid against the camera: the wall barely moves, the pilasters a little more
  for (let x = -(((relX * 0.22) % 320) + 320) % 320 - 0; x < w + 320; x += 320) { const X = Math.round(x + (0)); g.drawImage(far, X, yFar - 0 + 0); }
  for (let x = -(((relX * 0.5) % 480) + 480) % 480; x < w + 480; x += 480) g.drawImage(mid, Math.round(x), yMid);
  g.fillStyle = 'rgba(6,2,10,0.25)'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 18; i++) { const px0 = ((i * 137 + time * (3 + (i % 4))) % (w + 40)), py0 = ((i * 89) % (h - 20)); g.fillStyle = 'rgba(255,220,150,' + (0.14 + 0.1 * Math.sin(time * 1.3 + i)).toFixed(2) + ')'; g.fillRect(px0 | 0, py0 | 0, 1, 1); }   // the dust of the house, turning
}

/* paintTheatreRoom: true if this is a theatre room kind (drawn), else false (the game's other rooms) */
export function paintTheatreRoom(g, st, w, h, tx0, ty0, time, camX, camY, worldX, worldY) {
  if (st === 'thHouse') { paintHouse(g, w, h, time, camX, camY, worldX, worldY); return true; }
  const fn = ROOMS[st]; if (!fn) return false;
  const c = once('room' + st + w + 'x' + h + ':' + tx0, () => { const [cv, cg] = canvas(w, h); fn(cg, w, h, tx0, ty0); return cv; });
  g.drawImage(c, 0, 0);
  if (st === 'thFoyer' || st === 'thPassage' || st === 'thCostume' || st === 'thWorkshop' || st === 'thWings') {   // the bulbs breathe (a gas-lamp flicker over the baked glow)
    g.globalAlpha = 0.04 + 0.03 * Math.sin(time * 7 + tx0); g.fillStyle = '#ffd890'; g.fillRect(0, 0, w, h); g.globalAlpha = 1; }
  return true;
}
