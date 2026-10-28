// undercrown_art.js - THE UNDERCROWN's art (claude/undercrown2art): the back walls and the CASTLE'S FOOTINGS landmark, the timber SET (post, cap, hinge iron, splits), the SLAB (the swing,
// the ramp lying with its foot, the flat bridge / wall, the drawn heap), the diggers' WINCH, and the level's AMBIENT life (drips, the grit that falls from the footings, lamp moths, the
// shafts of the castle's own light that find a crack). Everything here is picture: no tile, hitbox or timing moves. The tile kit is src/redraw/undercrown_tiles.js.
//
// THE LANDMARK (A8): the castle is balanced on this hole, so its weight is the one thing in view. The galleries are windows in solid rock, so it is drawn where the rock lets you see:
//   zone 0 (the footings) the back wall of every gallery is a BAY of the castle's foundation - a dressed pier with a carved capital every 28 tiles and the vault's rib springing from it;
//   the great stope hangs the foundation's own stepped underside over the void (inverted piers, chains, the castle's cellar beams through the stone);
//   and wherever the roof has a crack in it a SHAFT of the castle's warm lamplight comes down with the dust in it.
// Deeper the wall changes with the rock (cribbed timber over the dead water, a glass seam, the goblins' burial niches in the barrow, the prince's arcade in the tomb).
import { canvas, px, rect, mulberry } from '../px.js';
import { ZONE, zoneOf, hash } from './undercrown_tiles.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const TS = 16;
let WHOLE = false; export const setPass = v => { WHOLE = !!v; };   /* main.js: true around the whole-view drawRoom('mine') call */

/* ============================ THE WALL TEXTURES (64 x 64, world-locked) ============================ */
function wallTex(zone, lit) {
  return once('wt' + zone + (lit ? 'L' : ''), () => {
    const [c, g] = canvas(64, 64), Z = ZONE[zone], r = mulberry(zone * 77 + 3), k = lit ? 0.5 : 0, col = i => mix(Z.s[Math.max(0, i - (zone === 0 || zone === 4 ? 0 : 1))], '#000000', (zone === 0 || zone === 4 ? 0.15 : 0.22) + (lit ? 0 : 0.2));
    rect(g, 0, 0, 64, 64, col(1));
    if (zone === 0 || zone === 4) {   /* ashlar: courses 12 high, stones 20-30 wide */
      const ch = zone === 4 ? 16 : 12;
      for (let row = 0; row * ch < 64; row++) { const y0 = row * ch, off = (row * 13) % 24, sw = zone === 4 ? 32 : 22;
        for (let x0 = -off; x0 < 64; x0 += sw) { const tone = hash(row, (x0 + 99) | 0) % 3; rect(g, x0 + 1, y0 + 1, sw - 1, ch - 1, col(1 + (tone === 0 ? 1 : 0)));
          rect(g, x0 + 1, y0 + 1, sw - 1, 1, col(3)); rect(g, x0 + 1, y0 + ch - 2, sw - 1, 1, col(0)); rect(g, x0, y0, 1, ch, col(0));
          for (let i = 0; i < 5; i++) px(g, x0 + 2 + ((r() * (sw - 3)) | 0), y0 + 2 + ((r() * (ch - 4)) | 0), col(r() < 0.5 ? 0 : 2)); }
        rect(g, 0, y0, 64, 1, col(0)); } }
    else {   /* rough hewn rock: strata, grit, the odd gouge */
      for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const band = Math.floor((y + Math.sin(x * 0.11) * 3) / 6), tone = (hash(band, zone) % 3) - 1, gr = (hash(x, y) >> 5) % 9 === 0 ? -1 : (hash(y, x + 3) >> 6) % 13 === 0 ? 1 : 0; px(g, x, y, col(Math.max(0, Math.min(6, 1 + tone + gr)))); }
      if (zone === 3) for (let i = 0; i < 9; i++) { const x = (r() * 60) | 0, y = (r() * 60) | 0; px(g, x, y, col(4)); px(g, x + 1, y - 1, col(4)); px(g, x, y + 1, col(0)); } }
    return c; });
}
function pat(g, zone, lit) { const c = wallTex(zone, lit); return once('pt' + zone + (lit ? 'L' : ''), () => g.createPattern(c, 'repeat')); }
const patOf = (g, zone, lit) => { const k = 'pg' + zone + (lit ? 'L' : ''); let p = PATS.get(g); if (!p) { p = new Map(); PATS.set(g, p); } if (!p.has(k)) p.set(k, g.createPattern(wallTex(zone, lit), 'repeat')); return p.get(k); };
const PATS = new WeakMap();
/* a world-locked fill of a rectangle with a wall texture: local (lx, ly) is world (wx0 + lx, wy0 + ly) */
function wallFill(g, zone, lit, lx, ly, w, h, wx0, wy0) {
  g.save(); g.translate(Math.round(-((wx0 % 64) + 64) % 64), Math.round(-((wy0 % 64) + 64) % 64)); g.fillStyle = patOf(g, zone, lit);
  g.fillRect(Math.round(lx + ((wx0 % 64) + 64) % 64), Math.round(ly + ((wy0 % 64) + 64) % 64), Math.round(w), Math.round(h)); g.restore();
}

/* ============================ PIECES OF THE LANDMARK ============================ */
const BAY = 28 * TS;
/* THE FOOTING PIER: a dressed pier three tiles wide, floor to roof, a carved capital, the rib springing from it (zone 0). x = its world left edge, y0..y1 world rows */
function pier(g, lx, ly, h, zone, lit) {
  const Z = ZONE[zone], w = 48;
  rc(g, lx, ly, w, h, mix(Z.s[2], '#000000', lit ? 0 : 0.15));
  for (let y = 0; y < h; y += 12) { rc(g, lx, ly + y, w, 1, Z.joint); for (let x = ((y / 12) % 2) * 12; x < w; x += 24) rc(g, lx + x, ly + y, 1, 12, Z.joint); }
  rc(g, lx, ly, 3, h, Z.s[4]); rc(g, lx + 3, ly, 2, h, Z.s[3]); rc(g, lx + w - 6, ly, 6, h, Z.s[0]);
  /* the capital: a moulded block wider than the shaft, three mouldings, the iron tie-bar through it */
  rc(g, lx - 4, ly, w + 8, 6, Z.s[3]); rc(g, lx - 4, ly, w + 8, 1, Z.s[6]); rc(g, lx - 4, ly + 5, w + 8, 1, Z.joint); rc(g, lx - 2, ly + 6, w + 4, 4, Z.s[2]); rc(g, lx - 2, ly + 6, w + 4, 1, Z.s[5]); rc(g, lx, ly + 10, w, 3, Z.s[1]);
  rc(g, lx + 4, ly + 2, w - 8, 2, '#3a3a42'); for (const bx of [lx + 6, lx + w / 2, lx + w - 8]) rc(g, bx, ly + 2, 2, 2, '#9a9aa6');
  /* the plinth */
  rc(g, lx - 3, ly + h - 8, w + 6, 8, Z.s[3]); rc(g, lx - 3, ly + h - 8, w + 6, 1, Z.s[5]); rc(g, lx - 3, ly + h - 1, w + 6, 1, Z.joint);
  /* a crack running down it, the weight showing */
  g.fillStyle = Z.joint; let x = lx + 18 + (hash(lx, 5) % 12); for (let y = 16; y < h - 14; y += 2) { x += ((hash(y, lx) >> 3) % 3) - 1; g.fillRect(x, ly + y, 1, 2); }
}
/* THE RIB: a stone arch springing from the capital of one pier to the next, drawn as a band along the roof (gallery height is only four tiles, so it is a segmental arch) */
function rib(g, x0, x1, ly, zone) {
  const Z = ZONE[zone], n = Math.max(2, ((x1 - x0) / 2) | 0), rise = 14;
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = ly + 12 - Math.sin(t * Math.PI) * rise; rc(g, x, y, 3, 8, Z.s[3]); rc(g, x, y, 3, 1, Z.s[5]); rc(g, x, y + 7, 3, 1, Z.joint); }
}
/* THE TIMBER CRIBBING of the dead water: a frame of squared baulks, a diagonal brace, the lagging boards between, the wet running down */
function cribbing(g, lx, ly, w, h, zone, seed) {
  const wood = ['#0c0804', '#241608', '#3e2a14', '#5a3e20'], bw = 8;
  rc(g, lx, ly, bw, h, wood[1]); rc(g, lx, ly, 2, h, wood[3]); rc(g, lx + bw - 2, ly, 2, h, wood[0]); rc(g, lx + w - bw, ly, bw, h, wood[1]); rc(g, lx + w - bw, ly, 2, h, wood[3]); rc(g, lx + w - 2, ly, 2, h, wood[0]);
  rc(g, lx, ly, w, 7, wood[2]); rc(g, lx, ly, w, 1, wood[3]); rc(g, lx, ly + 6, w, 1, wood[0]);
  g.strokeStyle = wood[1]; g.lineWidth = 4; g.beginPath(); g.moveTo(lx + bw, ly + h - 6); g.lineTo(lx + bw + 22, ly + 8); g.stroke(); g.strokeStyle = wood[2]; g.lineWidth = 1; g.beginPath(); g.moveTo(lx + bw, ly + h - 8); g.lineTo(lx + bw + 20, ly + 8); g.stroke();
  for (let y = 8; y < h - 2; y += 6) { rc(g, lx + bw + 1, ly + y, w - bw * 2 - 2, 1, wood[0]); }   /* lagging boards */
  for (const [x, y] of [[lx + 3, ly + 3], [lx + w - 5, ly + 3], [lx + 3, ly + h - 8], [lx + w - 5, ly + h - 8]]) { rc(g, x, y, 2, 2, '#3a3a42'); rc(g, x, y, 1, 1, '#9a9aa6'); }
  const r = mulberry(seed); for (let i = 0; i < 4; i++) { const sx = lx + bw + 4 + ((r() * (w - bw * 2 - 8)) | 0), sl = 10 + ((r() * (h - 14)) | 0); g.globalAlpha = 0.5; rc(g, sx, ly + 8, 1, sl, ZONE[zone].moss[0]); g.globalAlpha = 1; px(g, sx, ly + 8 + sl, ZONE[zone].moss[2]); }
}
/* A BURIAL NICHE (the barrow): a loculus cut in the wall, a wrapped body on its shelf, a skull at the mouth */
function niche(g, lx, ly, zone, v) {
  const Z = ZONE[zone];
  rc(g, lx - 1, ly - 1, 26, 15, Z.s[4]); rc(g, lx, ly, 24, 13, '#0a0604'); rc(g, lx, ly, 24, 2, '#000'); rc(g, lx, ly + 11, 24, 2, Z.s[2]);
  if (v !== 2) { rc(g, lx + 2, ly + 6, 18, 5, '#bcae90'); rc(g, lx + 2, ly + 6, 18, 1, '#e0d4b4'); for (let k = 4; k < 18; k += 5) rc(g, lx + k, ly + 6, 1, 5, '#7a6c52'); rc(g, lx + 19, ly + 5, 5, 6, '#e0d4b4'); rc(g, lx + 20, ly + 7, 1, 2, '#0a0604'); rc(g, lx + 22, ly + 7, 1, 2, '#0a0604'); }
  else { rc(g, lx + 4, ly + 9, 6, 2, '#e0d4b4'); rc(g, lx + 12, ly + 10, 4, 1, '#bcae90'); }
}
/* the tomb's arcade: a tall dark pillar with a carved capital, gold on its band, between them the royal frieze */
function tombPillar(g, lx, ly, h) {
  const Z = ZONE[4];
  rc(g, lx, ly, 18, h, Z.s[2]); rc(g, lx, ly, 3, h, Z.s[5]); rc(g, lx + 3, ly, 2, h, Z.s[3]); rc(g, lx + 14, ly, 4, h, Z.s[0]);
  for (let y = 20; y < h - 20; y += 10) rc(g, lx, ly + y, 18, 1, Z.joint);
  rc(g, lx - 3, ly, 24, 7, Z.s[3]); rc(g, lx - 3, ly, 24, 1, Z.s[6]); rc(g, lx - 3, ly + 6, 24, 1, Z.joint); rc(g, lx - 1, ly + 7, 20, 3, Z.s[1]);
  rc(g, lx + 3, ly + 3, 12, 2, Z.acc);
  rc(g, lx - 3, ly + h - 8, 24, 8, Z.s[3]); rc(g, lx - 3, ly + h - 8, 24, 1, Z.s[5]);
  rc(g, lx, ly + h * 0.5, 18, 2, Z.acc); g.globalAlpha = 0.45; rc(g, lx, ly + h * 0.5, 18, 2, '#000'); g.globalAlpha = 1;
}

/* ============================ PAINT A ROOM ============================ */
/* the rooms of the level, called from main.js drawRoomPaint with local origin (0,0) = tile (tx0, ty0). true = painted */
export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time, camX, camY, VW, VH) {
  const wx0 = tx0 * TS, wy0 = ty0 * TS;
  if (WHOLE) {   /* THE FAR WALL, the whole view: the rock the galleries are cut in, darker with depth, and it changes with the zone row by row */
    for (let ly = 0; ly < h; ly += TS) { const ty = ty0 + (ly / TS | 0), z = zoneOf(tx0 + 10, ty); wallFill(g, z, false, 0, ly, w, TS, wx0, wy0 + ly); }
    return true; }
  const zone = zoneOf(tx0 + ((w / TS / 2) | 0), ty0 + ((h / TS / 2) | 0)), ossuary = st === 'ossuary', tomb = ty0 >= 143, big = h >= 20 * TS;
  wallFill(g, ossuary ? 3 : tomb ? 4 : zone, true, 0, 0, w, h, wx0, wy0);
  const hh = (time || 0), vx0 = camX - wx0 - 80, vx1 = vx0 + VW + 160, vy0 = camY - wy0 - 80, vy1 = vy0 + VH + 160;   /* what of this room is on the screen, in its own coordinates: nothing off it is drawn */
  if (vy1 < 0 || vy0 > h || vx1 < 0 || vx0 > w) return true;
  /* THE BACK WALL BY PLACE */
  if (tx0 === 54 && ty0 === 132) {   /* THE PRINCE'S TITHE: a vault nobody walled up - royal ashlar, a gold band, shelves of the tribute he was owed, a crown cut over them */
    const Z = ZONE[4]; wallFill(g, 4, true, 0, 0, w, h, wx0, wy0); rc(g, 0, 9, w, 3, Z.acc); g.globalAlpha = 0.45; rc(g, 0, 9, w, 3, Z.s[2]); g.globalAlpha = 1;
    for (let x = 12; x < w - 20; x += 30) { rc(g, x, h - 30, 22, 2, Z.s[5]); rc(g, x, h - 28, 22, 1, Z.joint); for (let k = 0; k < 4; k++) { rc(g, x + 2 + k * 5, h - 34 - (k % 2) * 2, 4, 4 + (k % 2) * 2, '#c9a040'); rc(g, x + 2 + k * 5, h - 34 - (k % 2) * 2, 4, 1, '#ffe08a'); } }
    const mx = (w / 2) | 0; rc(g, mx - 11, 20, 22, 4, Z.acc); for (const dx of [-11, -4, 3, 10]) rc(g, mx + dx, 14, 3, 7, Z.acc); rc(g, mx - 11, 24, 22, 1, Z.joint);
    return true; }
  if (tomb) {   /* THE PRINCE'S VAULT: an arcade of dark pillars every 8 tiles, the royal frieze between, the throne alcove behind the middle slab */
    for (let x = 0; x < w; x += 8 * TS) if (x + 2 * TS + 30 > vx0 && x + 2 * TS < vx1) tombPillar(g, x + 2 * TS, 6, h - 6 - 0);
    const Z = ZONE[4]; rc(g, 0, 22, w, 3, Z.acc); g.globalAlpha = 0.5; rc(g, 0, 22, w, 3, Z.s[2]); g.globalAlpha = 1; rc(g, 0, 25, w, 1, Z.joint);
    for (let x = 4 * TS; x < w; x += 8 * TS) { if (x + 5 * TS < vx0 || x > vx1) continue; /* a recessed alcove between pillars: a dark arch with a carved lintel */ const ax = x + 2, aw = 5 * TS - 4; rc(g, ax, 32, aw, h - 38, '#07050c'); rc(g, ax, 32, aw, 2, Z.s[4]); g.globalAlpha = 0.5; rc(g, ax, 34, aw, 24, '#000'); g.globalAlpha = 1;
      for (let k = 0; k < aw - 4; k += 8) rc(g, ax + 2 + k, 28, 4, 3, Z.acc);
      rc(g, ax, 32, 3, h - 38, Z.s[3]); rc(g, ax + aw - 3, 32, 3, h - 38, Z.s[0]); }
    return true; }
  if (st === 'crystal') {   /* THE GLITTER VEIN: violet rock with the glass running through it - great crystal clusters standing out of the wall, the lit ones breathing */
    for (let x = 4; x < w; x += 7 * TS) { if (x + 80 < vx0 || x - 20 > vx1) continue; const gx = Math.floor((wx0 + x) / (7 * TS)), hv = hash(gx, 21), cxp = x + (hv % 40), up = hv % 2 === 0, base = up ? h - 2 : 2, n = 3 + (hv % 3);
      for (let k = 0; k < n; k++) { const kh = 22 + ((hv >> (k * 3)) % 30), kw = 5 + (k % 2) * 2, bx = cxp + (k - n / 2) * 7, tip = up ? base - kh : base + kh, d = up ? 1 : -1; g.fillStyle = '#2c2250'; g.beginPath(); g.moveTo(bx - kw, base); g.lineTo(bx, tip); g.lineTo(bx + kw, base); g.closePath(); g.fill(); g.fillStyle = '#7c6cb8'; g.beginPath(); g.moveTo(bx - kw, base); g.lineTo(bx, tip); g.lineTo(bx, base); g.closePath(); g.fill(); g.fillStyle = '#d8d0ff'; g.fillRect(bx - 1, tip + (d > 0 ? 1 : -3), 1, 3); }
      const tw = 0.5 + 0.5 * Math.sin(hh * 2.2 + gx); g.globalAlpha = 0.25 * tw; g.fillStyle = '#b0a0ff'; g.beginPath(); g.arc(cxp, up ? h - 30 : 30, 26, 0, 7); g.fill(); g.globalAlpha = 1; }
    return true; }
  if (ossuary) {   /* THE BARROW: rows of niches, three high, with the bodies in them */
    for (let row = 0; row < 3; row++) for (let x = 6; x < w - 24; x += 34) { if (x + 26 < vx0 || x > vx1) continue; const gx = Math.floor((wx0 + x) / 34), v = hash(gx, row) % 3; niche(g, x, h - 50 - row * 19, 3, v); }   /* counted up from the floor: the view hangs low in this room */
    return true; }
  if (zone === 0) {   /* THE FOOTINGS: bays of pier and rib, lagged timber ribs at the third points */
    const first = Math.floor((wx0 - 60) / BAY) - 1, last = Math.floor((wx0 + w + 60) / BAY) + 1;
    for (let b = first; b <= last; b++) { const wxp = b * BAY + 3 * TS, lx = wxp - wx0; if (lx > vx1 || lx + BAY < vx0) continue; if (lx + 60 > vx0 && lx < vx1) pier(g, lx, 0, h, 0, true); if (lx + BAY > -20) rib(g, lx + 48, lx + BAY, 0, 0); }
    /* timber ribs of the working between the piers: a squared set every 7 tiles with a cap */
    for (let b = Math.floor(wx0 / (7 * TS)) - 1; b <= Math.floor((wx0 + w) / (7 * TS)) + 1; b++) { const lx = b * 7 * TS - wx0 + 2 * TS; if (lx < vx0 - 20 || lx > vx1) continue; if (hash(b, 4) % 3 === 0) continue; if (Math.abs(((b * 7 * TS + 2 * TS) % BAY) - 3 * TS) < 70) continue; const wood = ['#0c0804', '#241608', '#3e2a14', '#5a3e20']; rc(g, lx, 0, 6, h, wood[1]); rc(g, lx, 0, 1, h, wood[3]); rc(g, lx + 5, 0, 1, h, wood[0]); rc(g, lx - 4, 0, 14, 5, wood[2]); rc(g, lx - 4, 0, 14, 1, wood[3]); }
    return true; }
  if (zone === 1 || zone === 3 || zone === 2) {
    if (big) {   /* THE GREAT STOPE: the castle's foundation hangs over the void - stepped inverted piers, chains, the cellar's own beams through the stone */
      const Z = ZONE[0], seed = 31, topH = 11 * TS;
      for (let i = 0; i < 4; i++) { const w2 = 26 * TS - i * 6 * TS, x0 = ((w - w2) / 2) | 0; rc(g, x0, i * 12, w2, 14, Z.s[2]); rc(g, x0, i * 12, w2, 2, Z.s[5]); rc(g, x0, i * 12 + 12, w2, 2, Z.joint);
        for (let x = 8; x < w2; x += 26) rc(g, x0 + x, i * 12 + 2, 1, 10, Z.joint); }
      /* inverted piers hanging from the course: pointed like a plumb-bob */
      for (let x = 2 * TS; x < w - 2 * TS; x += 11 * TS + (hash(x, 9) % 20)) { if (x + 20 < vx0 || x - 20 > vx1 || vy1 < 46 || vy0 > 190) continue; const len = 60 + (hash(x, 3) % 70); for (let y = 0; y < len; y++) { const half = Math.max(2, Math.round(16 * (1 - y / len))); rc(g, x - half, 46 + y, half * 2, 1, y % 12 === 0 ? Z.joint : Z.s[y < 3 ? 5 : 2]); rc(g, x - half, 46 + y, 2, 1, Z.s[4]); } rc(g, x - 1, 46 + len, 2, 6, '#3a3a42'); }
      /* the cellar's beams through the stone, a chain with its hook, an iron tie-rod */
      for (let x = 3 * TS; x < w - 3 * TS; x += 9 * TS) { if (x + 20 < vx0 || x > vx1) continue; rc(g, x, 30, 9, 3, '#3e2a14'); rc(g, x, 30, 9, 1, '#5a3e20'); rc(g, x + 11, 28, 3, 7, '#241608'); }
      const sw = Math.sin(hh * 0.7) * 1.2; g.strokeStyle = '#5a5a66'; g.lineWidth = 1; for (let x = 6 * TS; x < w - 4 * TS; x += 17 * TS) { if (x + 20 < vx0 || x - 20 > vx1) continue; g.beginPath(); g.moveTo(x, 40); g.lineTo(x + sw, 120 + (hash(x, 1) % 40)); g.stroke(); for (let y = 44; y < 110; y += 5) rc(g, x + sw * (y - 40) / 80 - 1, y, 3, 2, '#7a7a88'); }
      /* its gloom below, and the dead water's green breathing up from the bottom */
      const gr = g.createLinearGradient(0, topH, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(20,60,10,0.12)'); g.fillStyle = gr; g.fillRect(0, topH, w, h - topH);
      void seed; return true; }
    /* a working over the dead water / the drift: cribbed timber, lamp-black */
    for (let x = Math.floor(wx0 / (9 * TS)) - 1; x <= Math.floor((wx0 + w) / (9 * TS)) + 1; x++) { if (hash(x, 8) % 4 === 0) continue; const lx = x * 9 * TS - wx0 + 2 * TS; if (lx + 58 < vx0 || lx > vx1) continue; cribbing(g, lx, 0, 58, h, zone === 2 ? 2 : zone, x * 5 + 1); }
    if (zone === 1) { g.globalAlpha = 0.22; rc(g, 0, h - 14, w, 14, '#1a4a10'); g.globalAlpha = 1; }   /* the low places hold the dead water's colour */
    return true; }
  return false;
}

/* ============================ THE SET (post) ============================ */
const WOOD = ['#0c0804', '#241608', '#3e2a14', '#5a3e20', '#7e5a30', '#a47c44'];
/* o: { px, y0, y1, hung, taken, shake, cl, cr, dir, capBeam, time, wet } screen coordinates already (the caller subtracts the camera) */
export function drawPost(g, o) {
  const { px: x, y0, y1, hung, taken, shake, cl, cr, dir, capBeam, time, wet } = o, R = Math.round;
  const bow = taken >= 2 ? 1 : 0, bodyTop = y0 + (hung ? 0 : 6), h = y1 - bodyTop;
  /* the footing: a squared sill stone it stands on, when it stands on the floor */
  if (!hung && h > 12) { rc(g, x - 8, y1 - 3, 16, 4, '#2a2420'); rc(g, x - 8, y1 - 3, 16, 1, '#6a5a48'); rc(g, x - 8, y1, 16, 1, '#100c0a'); }
  /* the baulk: squared timber, lit chamfer on the left, a dark one on the right, the grain along it, two iron straps */
  const bx = x - 5 + bow;
  rc(g, bx - 1, bodyTop, 12, h - (hung ? 0 : 3), WOOD[0]); rc(g, bx, bodyTop, 10, h - (hung ? 0 : 3), WOOD[2]); rc(g, bx, bodyTop, 2, h - (hung ? 0 : 3), WOOD[5]); rc(g, bx + 2, bodyTop, 1, h - (hung ? 0 : 3), WOOD[4]); rc(g, bx + 8, bodyTop, 2, h - (hung ? 0 : 3), WOOD[1]);
  for (let yy = bodyTop + 5; yy < y1 - 6; yy += 9) { rc(g, bx + 3 + (yy % 3), yy, 1, 4, WOOD[1]); }
  for (const sy of [bodyTop + 8, y1 - 14]) if (sy > bodyTop && sy < y1 - 6) { rc(g, bx - 1, sy, 12, 3, '#33333a'); rc(g, bx - 1, sy, 12, 1, '#8a8a96'); rc(g, bx + 1, sy + 1, 1, 1, '#c8c8d4'); rc(g, bx + 8, sy + 1, 1, 1, '#c8c8d4'); }
  /* the cap: a corbel head under the beam, an iron plate and THE HINGE KNUCKLE on the end that faces the span */
  if (!hung) {
    rc(g, x - 8, y0 + 5, 16, 3, WOOD[3]); rc(g, x - 8, y0 + 5, 16, 1, WOOD[5]); rc(g, x - 8, y0 + 7, 16, 1, WOOD[0]);
    const kx = x + dir * 5; rc(g, kx - 3, y0 + 1, 6, 8, '#2c2c34'); rc(g, kx - 3, y0 + 1, 6, 1, '#9a9aa8'); rc(g, kx - 1, y0 + 2, 2, 6, '#6a6a78'); rc(g, kx - 4, y0 + 4, 8, 2, '#44444e'); rc(g, kx, y0 + 3, 1, 1, '#d4d4e0');
    /* the brace to the span: a diagonal timber with an iron shoe */
    g.strokeStyle = WOOD[0]; g.lineWidth = 5; g.beginPath(); g.moveTo(x + dir * 4, y0 + 30); g.lineTo(x + dir * 19, y0 + 7); g.stroke();
    g.strokeStyle = WOOD[2]; g.lineWidth = 3; g.beginPath(); g.moveTo(x + dir * 4, y0 + 30); g.lineTo(x + dir * 19, y0 + 7); g.stroke();
    g.strokeStyle = WOOD[4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x + dir * 4 - 1, y0 + 29); g.lineTo(x + dir * 19 - 1, y0 + 6); g.stroke();
    rc(g, x + dir * 4 - 2, y0 + 28, 4, 4, '#33333a'); }
  /* the cap BEAM across the span under the slab it holds: lit top, an iron bolt each end, a dark soffit */
  if (!hung && capBeam) { rc(g, cl - 1, y0 - 1, cr - cl + 2, 8, WOOD[0]); rc(g, cl, y0, cr - cl, 6, WOOD[2]); rc(g, cl, y0, cr - cl, 1, WOOD[5]); rc(g, cl, y0 + 1, cr - cl, 1, WOOD[4]); rc(g, cl, y0 + 5, cr - cl, 1, WOOD[1]);
    for (let bxx = cl + 6; bxx < cr - 4; bxx += 22) { rc(g, bxx, y0 + 2, 2, 2, '#3a3a42'); px(g, bxx, y0 + 2, '#9a9aa6'); }
    g.globalAlpha = 0.35; rc(g, cl, y0 + 7, cr - cl, 4, '#000'); g.globalAlpha = 1; }
  /* BLOWS TAKEN: fresh pale wood in a split across the baulk, splinters, grit at the foot, and the whole thing shivers */
  const mid = R((bodyTop + y1) / 2);
  for (let k = 0; k < taken; k++) { const sy = mid - 10 + k * 8; rc(g, bx - 1, sy, 12, 2, '#160c04'); rc(g, bx + 1 + k, sy, 6, 1, '#e4c07c'); rc(g, bx + 2, sy - 2, 1, 2, '#e4c07c'); rc(g, bx + 7 - k, sy + 2, 2, 1, '#e4c07c'); rc(g, bx + 4, sy + 2, 1, 4, '#160c04'); }
  if (taken >= 2) { rc(g, bx + 10, mid - 3, 3, 1, '#e4c07c'); rc(g, bx - 3, mid + 5, 3, 1, '#c89a58'); }
  if (taken > 0 && !hung) for (let k = 0; k < taken * 2; k++) rc(g, x - 9 + ((k * 5) % 18), y1 - 1, 2, 1, '#8a8298');
  if (wet) { g.globalAlpha = 0.3; rc(g, bx, bodyTop, 10, h, '#10281a'); g.globalAlpha = 1; }
  if (shake > 0) { g.globalAlpha = 0.5; rc(g, x - 9, bodyTop + 10, 1, h - 20, '#ffd9a0'); g.globalAlpha = 1; }
  void time; void shake;
}

/* ============================ THE SLAB ============================ */
const STONE = ['#100c0a', '#241d1b', '#3a302b', '#52443b', '#6e5c4e', '#8e7a66', '#b8a28a'];
/* the stone of a slab, painted onto a transformed surface: local x runs along its length (0..len), y runs through its thickness (0..th, 0 = the upper face) */
function slabBody(g, len, th, zoneK, opts = {}) {
  const S = zoneK === 3 ? ['#150f0c', '#25180f', '#3b291a', '#573c26', '#74523a', '#9a7452', '#c49c70'] : zoneK === 4 ? ['#0b0910', '#16121d', '#231c2d', '#342a41', '#4a3d5b', '#6a5a7e', '#8f7ea4'] : STONE;
  g.fillStyle = S[3]; g.fillRect(0, 0, len, th);
  g.fillStyle = S[5]; g.fillRect(0, 0, len, 1.5); g.fillStyle = S[6]; g.fillRect(0, 0, len, 0.8);
  g.fillStyle = S[1]; g.fillRect(0, th - 3, len, 3); g.fillStyle = S[0]; g.fillRect(0, th - 1, len, 1);
  const blk = TS * 3; for (let x = blk; x < len - 2; x += blk) { g.fillStyle = S[0]; g.fillRect(x, 0, 1, th); g.fillStyle = S[5]; g.fillRect(x + 1, 1, 1, th - 4); }
  for (let x = blk / 2; x < len - 4; x += blk) { g.fillStyle = '#2c2c34'; g.fillRect(x - 3, th * 0.3, 7, th * 0.4); g.fillStyle = '#8a8a96'; g.fillRect(x - 3, th * 0.3, 7, 1); g.fillStyle = S[4]; }
  g.fillStyle = S[0]; g.fillRect(0, 0, 1, th); g.fillRect(len - 1, 0, 1, th);
  if (opts.crack) { g.fillStyle = S[0]; for (let x = 6; x < len - 6; x += 9) g.fillRect(x, 1 + ((x * 7) % 3), 2, 1); }
}
const zoneKOf = rt => { const z = zoneOf(rt.x0, rt.row); return z === 4 ? 4 : z === 3 ? 3 : z; };
/* THE HEAP: a small drawn pile of the rock that came down - never a stair, nothing to stand on (hp.t 0..1 is the settling) */
function drawHeap(g, hx, hy, n, t) {
  const R = Math.round;
  for (let j = 0; j < n + 2; j++) { const ox = ((j * 7) % 13) - 6, oy = (j % 3) * 2, sz = 3 + ((j * 5) % 4), w = sz + 1, c = j % 3 === 0 ? STONE[5] : j % 3 === 1 ? STONE[3] : STONE[4];
    const yy = R(hy - 2 - oy), xx = R(hx + ox);
    rc(g, xx - 1, yy - sz + 1, w + 2, sz, '#0c0806'); rc(g, xx, yy - sz + 2, w, sz - 1, c); rc(g, xx, yy - sz + 2, w, 1, STONE[6]); rc(g, xx + w - 1, yy - sz + 2, 1, sz - 1, STONE[1]); }
  if (t < 1) { g.globalAlpha = (1 - t) * 0.5; rc(g, hx - 10, hy - 14 - (t * 8), 20, 10, '#8a8298'); g.globalAlpha = 1; }
}
/* THE WINDLASS the diggers work (tomb slabs only): an A-frame beside the post, a drum with its crank, the rope going up into the hole in the roof */
function drawWinch(g, x, y, dir, time, working) {
  const R = Math.round; x = R(x); y = R(y);
  rc(g, x - 7, y - 20, 3, 20, WOOD[1]); rc(g, x + 4, y - 20, 3, 20, WOOD[1]); rc(g, x - 7, y - 20, 1, 20, WOOD[4]); rc(g, x + 4, y - 20, 1, 20, WOOD[4]);
  g.strokeStyle = WOOD[2]; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 7, y - 4); g.lineTo(x + 4, y - 16); g.stroke(); g.beginPath(); g.moveTo(x + 4, y - 4); g.lineTo(x - 7, y - 16); g.stroke();
  rc(g, x - 5, y - 15, 10, 6, WOOD[3]); rc(g, x - 5, y - 15, 10, 1, WOOD[5]); rc(g, x - 5, y - 13, 10, 1, WOOD[1]); rc(g, x - 5, y - 11, 10, 1, WOOD[1]);
  const a = working ? time * 7 : 0.6, cxx = x + 8 * dir, cyy = y - 12; g.strokeStyle = '#5a5a66'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 5 * dir, y - 12); g.lineTo(cxx, cyy); g.lineTo(cxx + Math.cos(a) * 5, cyy + Math.sin(a) * 5); g.stroke();
  rc(g, cxx + Math.cos(a) * 5 - 1, cyy + Math.sin(a) * 5 - 1, 3, 3, '#9a9aa6');
  g.strokeStyle = '#c8b48a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + (working ? Math.sin(time * 3) : 0), y - 120); g.stroke();
}
/* THE SLAB, DRAWN: swinging on its hinge, lying as a ramp on exactly its tiles, falling, down flat; an end that sags over a cut post; the heaps. Screen coordinates: cx, cy the camera. */
export function drawSlabs(g, SLAB_RT, cx, cy, VW, time, working) {
  const R = Math.round;
  for (const rt of SLAB_RT.values()) {
    if ((rt.x1 + 2) * TS < cx - 20 || (rt.x0 - 1) * TS > cx + VW + 20) continue;
    const zk = zoneKOf(rt);
    if (rt.state === 'up') {
      /* THE TELL (A3): the end that has taken blows SAGS - a wedge of black opens under the course, the gap lit orange along the post's edge, and pale grit hangs in it */
      for (const q of rt.posts) if (!q.broken && q.hp < q.hp0) { const sag = 2 + 2 * (q.hp0 - q.hp), yb = R((rt.row + 1) * TS - cy), xe = R((q.end < 0 ? rt.x0 : rt.x1 + 1) * TS - cx), xm = R((rt.x0 + rt.x1 + 1) * TS / 2 - cx);
        g.fillStyle = '#05030a'; g.beginPath(); g.moveTo(xm, yb); g.lineTo(xe, yb); g.lineTo(xe, yb + sag); g.closePath(); g.fill();
        g.fillStyle = STONE[5]; g.beginPath(); g.moveTo(xm, yb - 1); g.lineTo(xe, yb - 1); g.lineTo(xe, yb + sag - 1); g.closePath(); g.globalAlpha = 0.18; g.fill(); g.globalAlpha = 1;
        g.fillStyle = '#ff9a5c'; g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 9); g.fillRect(xe - (q.end < 0 ? 0 : 2), yb, 2, sag + 1); g.globalAlpha = 1;
        for (let k = 0; k < 3; k++) { const gx = xe + (q.end < 0 ? 1 : -1) * (3 + k * 5), gy = yb + sag + ((time * 20 + k * 7) % 12); g.fillStyle = '#b8a890'; g.fillRect(R(gx), R(gy), 1, 1); } } }
    else if (rt.state === 'swing' || rt.state === 'ramp') {
      const r = rt.ramp, hx = r.top[0], hy = r.top[1], fx = r.foot[0], fy = r.foot[1], len = Math.hypot(fx - hx, fy - hy), a1 = Math.atan2(fy - hy, fx - hx), a0 = Math.atan2(0, fx - hx);
      const k = rt.state === 'swing' ? Math.min(1, rt.anim / 0.5) : 1, a = a0 + (a1 - a0) * k * k, ux = Math.cos(a), uy = Math.sin(a); let nx = -uy, ny = ux; if (ny < 0) { nx = -nx; ny = -ny; }
      const th = 11;
      /* a smear behind the swinging end, so the eye follows the cut */
      if (rt.state === 'swing' && k > 0.05 && k < 0.98) { const ap = a0 + (a1 - a0) * Math.max(0, k - 0.18) * Math.max(0, k - 0.18); g.fillStyle = 'rgba(200,190,170,0.22)'; g.beginPath(); g.moveTo(R(hx - cx), R(hy - cy)); g.lineTo(R(hx + Math.cos(ap) * len - cx), R(hy + Math.sin(ap) * len - cy)); g.lineTo(R(hx + ux * len - cx), R(hy + uy * len - cy)); g.closePath(); g.fill(); }
      /* the body lies along the line hinge -> foot (its upper face), the thickness under it; the timber cap beam rides its underside */
      g.save(); g.translate(R(hx - cx), R(hy - cy)); g.rotate(a); g.scale(1, ux < 0 ? -1 : 1);
      slabBody(g, len, th, zk, { crack: rt.state === 'ramp' });
      g.fillStyle = WOOD[2]; g.fillRect(0, th, len, 3); g.fillStyle = WOOD[4]; g.fillRect(0, th, len, 1); g.fillStyle = WOOD[0]; g.fillRect(0, th + 2, len, 1); g.restore();
      g.fillStyle = '#2c2c34'; g.beginPath(); g.arc(R(hx - cx), R(hy - cy) + 1, 4, 0, 7); g.fill(); g.fillStyle = '#9a9aa8'; g.fillRect(R(hx - cx) - 1, R(hy - cy) - 1, 2, 2);
      g.strokeStyle = '#33333a'; g.lineWidth = 3; g.beginPath(); g.moveTo(R(hx - cx), R(hy - cy) + 1); g.lineTo(R(hx + ux * 14 - cx), R(hy + uy * 14 - cy) + 1); g.stroke();
      /* its foot: a crushed toe of chipped stone and a pale scar on the floor */
      if (rt.state === 'ramp') { const tx = R(fx - cx), ty = R(fy - cy); g.fillStyle = STONE[4]; for (let j = 0; j < 5; j++) g.fillRect(tx + (j - 2) * 3 + (j % 2), ty - 2 - (j % 2), 3, 2 + (j % 2)); g.fillStyle = '#0c0806'; g.fillRect(tx - 7, ty, 14, 1);
        if (rt.tomb && working) drawWinch(g, (r.hinge > 0 ? rt.x1 + 1.6 : rt.x0 - 0.6) * TS - cx, (rt.floor + 1) * TS - cy, r.hinge > 0 ? -1 : 1, time, true); } }
    else if (rt.state === 'fall' || rt.state === 'flat') {
      const f = rt.flat, k = rt.state === 'fall' ? Math.min(1, rt.anim / 0.34) : 1, y = rt.fromY + (f.row * TS - rt.fromY) * k * k, x0 = R(rt.x0 * TS - cx), w = (rt.x1 - rt.x0 + 1) * TS, hgt = f.deep * TS, yy = R(y - cy);
      g.save(); g.translate(x0, yy); slabBody(g, w, hgt, zk, { crack: rt.state === 'flat' }); g.restore();
      const wall = f.deep >= 2;
      if (!wall) { /* a BRIDGE: the timber cap is its deck - boards across, iron nails, a wet dark joint */ g.fillStyle = WOOD[3]; g.fillRect(x0, yy - 2, w, 3); g.fillStyle = WOOD[5]; g.fillRect(x0, yy - 2, w, 1); g.fillStyle = WOOD[0]; g.fillRect(x0, yy + 1, w, 1); for (let bx = 5; bx < w - 2; bx += 7) { g.fillStyle = WOOD[1]; g.fillRect(x0 + bx, yy - 2, 1, 3); g.fillStyle = '#9a9aa6'; g.fillRect(x0 + bx + 2, yy - 1, 1, 1); } }
      else { g.fillStyle = STONE[6]; g.fillRect(x0, yy, w, 1); g.fillStyle = '#0c0806'; for (let by = 11; by < hgt - 2; by += 11) g.fillRect(x0 + 1, yy + by, w - 2, 1); }
      if (rt.state === 'fall') { for (let j = 0; j < 7; j++) { g.fillStyle = 'rgba(200,190,170,' + (0.35 - j * 0.04).toFixed(2) + ')'; g.fillRect(x0 + ((j * 29) % w), yy - 8 - j * 3, 3, 8); } } }
    for (const hp of rt.heaps) drawHeap(g, R(hp.x - cx), R(hp.y - cy), hp.n, hp.t);
  }
}

/* ============================ AMBIENT LIFE ============================ */
/* drips off the wet ceilings (zones 1 and 2) with a ring where they land, grit trickling from the footings (zone 0) - screen space, world-locked by a hash. at(tx, ty) is the tile at a cell */
export function drawAmbient(g, cx, cy, VW, VH, time, at, T, props) {
  const tx0 = Math.max(0, Math.floor(cx / TS)), tx1 = Math.floor((cx + VW) / TS), ty0 = Math.max(0, Math.floor(cy / TS)), ty1 = Math.floor((cy + VH) / TS), R = Math.round;
  const solid = (x, y) => at(x, y) === T.SOLID;
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    if (!solid(tx, ty) || solid(tx, ty + 1)) continue;   /* a ceiling cell: solid over open air */
    const hv = hash(tx, ty), zone = zoneOf(tx, ty);
    if (zone === 1 || zone === 2) { if (hv % 5) continue;
      const per = 2.4 + (hv % 7) * 0.35, ph = ((time + (hv % 997) / 100) % per) / per; let fl = ty + 1; while (fl < ty + 12 && !solid(tx, fl) && at(tx, fl) !== T.PLANK && at(tx, fl) !== T.ONEWAY) fl++;
      const dx = R(tx * TS + 4 + (hv % 8) - cx), top = (ty + 1) * TS, bot = fl * TS, col = zone === 1 ? '#a6e04a' : '#d8d0ff';
      if (ph < 0.78) { const t = ph / 0.78, yy = top + (bot - top) * t * t; g.fillStyle = col; g.globalAlpha = 0.85; g.fillRect(dx, R(yy - cy), 1, 2); g.globalAlpha = 1; }
      else { const t = (ph - 0.78) / 0.22, rad = 1 + t * 5; g.globalAlpha = 0.6 * (1 - t); g.fillStyle = col; g.fillRect(R(dx - rad), R(bot - cy) - 1, R(rad * 2), 1); g.globalAlpha = 1; } }
    else if (zone === 0) { if (hv % 9) continue;
      const per = 1.6 + (hv % 5) * 0.4, ph = ((time + (hv % 631) / 90) % per) / per; let fl = ty + 1; while (fl < ty + 6 && !solid(tx, fl)) fl++;
      if (ph < 0.5) { const t = ph / 0.5, yy = (ty + 1) * TS + (fl - ty - 1) * TS * t; g.fillStyle = '#9a8e84'; g.globalAlpha = 0.75; g.fillRect(R(tx * TS + 3 + (hv % 10) - cx), R(yy - cy), 1, 1); g.globalAlpha = 1; } }
  }
  /* lamp moths: two tiny pale flecks orbiting each lit lamp in view */
  for (const p of props) { if (p.t !== 'minerlamp' || !p.lit) continue; if (p.x < cx - 30 || p.x > cx + VW + 30 || p.y < cy - 30 || p.y > cy + VH + 30) continue;
    for (let k = 0; k < 2; k++) { const a = time * (2.2 + k * 0.9) + p.x * 0.3 + k * 3, rr = 7 + k * 4 + Math.sin(time * 3.1 + k) * 2; g.fillStyle = k ? '#e8dcc0' : '#fff2c8'; g.globalAlpha = 0.8; g.fillRect(R(p.x + Math.cos(a) * rr - cx), R(p.y - 10 + Math.sin(a * 1.3) * rr * 0.6 - cy), 1, 1); g.globalAlpha = 1; } }
}
/* THE CASTLE'S OWN LIGHT: where a crack in the roof of the footings lets it down - a faint warm shaft with grit turning in it (additive, drawn over the walls, under the creatures) */
export function drawShafts(g, cx, cy, VW, VH, time, at, T) {
  const tx0 = Math.max(0, Math.floor(cx / TS)), tx1 = Math.floor((cx + VW) / TS), ty0 = Math.max(0, Math.floor(cy / TS)), ty1 = Math.floor((cy + VH) / TS), R = Math.round;
  if (ty0 > 52) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let ty = ty0; ty <= Math.min(ty1, 50); ty++) for (let tx = tx0; tx <= tx1; tx++) {
    if (at(tx, ty) !== T.SOLID || at(tx, ty + 1) === T.SOLID || at(tx, ty + 1) === T.PLANK) continue; const hv = hash(tx * 3, ty + 11); if (hv % 23) continue;
    let fl = ty + 1; while (fl < ty + 8 && at(tx, fl) !== T.SOLID && at(tx, fl) !== T.PLANK && at(tx, fl) !== T.ONEWAY) fl++;
    const x = tx * TS + 8 - cx, y0 = (ty + 1) * TS - cy, y1 = fl * TS - cy, w = 5 + (hv % 4), fk = 0.8 + 0.2 * Math.sin(time * 0.9 + hv);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(255,214,150,' + (0.16 * fk).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 2, y0); g.lineTo(x + 2, y0); g.lineTo(x + w, y1); g.lineTo(x - w, y1); g.closePath(); g.fill();
    for (let k = 0; k < 3; k++) { const t = ((time * 0.12 + k * 0.33 + (hv % 100) / 100) % 1); g.fillStyle = 'rgba(255,230,180,0.5)'; g.fillRect(R(x - w * t + k * 2), R(y0 + (y1 - y0) * t), 1, 1); } }
  g.restore();
}

/* ============================ DRESSING (static sprites in the decor list) ============================ */
const sprite = (k, w, h, fn) => once('sp' + k, () => { const [c, g] = canvas(w, h); fn(g); return c; });
const px3 = (g, x, y, c) => { if (x >= 0 && y >= 0) px(g, x, y, c); };
const SPR = {
  rubble: v => sprite('rub' + v, 14, 6, g => { const r = mulberry(v * 13 + 5); for (let i = 0; i < 5; i++) { const x = (r() * 10) | 0, w = 2 + ((r() * 3) | 0), h = 1 + ((r() * 3) | 0); rc(g, x, 6 - h, w + 1, h, '#0c0806'); rc(g, x + 1, 6 - h, w, h - 1 < 1 ? 1 : h - 1, i % 2 ? STONE[3] : STONE[4]); px3(g, x + 1, 6 - h, STONE[6]); } }),
  puddle: v => sprite('pud' + v, 14, 3, g => { rc(g, 1, 1, 12, 1, '#10240c'); rc(g, 3, 0, 8, 1, '#1c3a10'); rc(g, 4, 2, 6, 1, '#0c1a08'); px3(g, 5, 0, '#a6e04a'); px3(g, 9, 1, '#8ac03a'); px3(g, 3, 1, '#4a7a24'); }),
  bones: v => sprite('bon' + v, 12, 5, g => { rc(g, 1, 3, 6, 1, '#e0d4b4'); rc(g, 3, 2, 4, 1, '#bcae90'); rc(g, 8, 2, 3, 3, '#e0d4b4'); px3(g, 9, 3, '#0a0604'); px3(g, 10, 3, '#0a0604'); rc(g, 0, 4, 12, 1, '#7a6c52'); px3(g, 5, 1, '#e0d4b4'); }),
  pick: () => sprite('pick', 10, 14, g => { rc(g, 4, 2, 2, 12, WOOD[3]); rc(g, 4, 2, 1, 12, WOOD[5]); rc(g, 1, 1, 8, 2, '#5a5a66'); rc(g, 0, 2, 2, 2, '#8a8a96'); rc(g, 8, 2, 2, 2, '#8a8a96'); rc(g, 1, 1, 8, 1, '#9a9aa8'); }),
  offcut: v => sprite('off' + v, 14, 4, g => { rc(g, 0, 1, 14, 3, WOOD[1]); rc(g, 0, 1, 14, 1, WOOD[4]); rc(g, 0, 3, 14, 1, WOOD[0]); rc(g, 12 - v, 1, 2, 3, '#c89a58'); rc(g, 3, 0, 5, 1, WOOD[2]); }),
  crystal: v => sprite('cry' + v, 12, 12, g => { const hs = [10, 7, 9]; for (let k = 0; k < 3; k++) { const x = 1 + k * 4, h = hs[(k + v) % 3]; g.fillStyle = '#3e3668'; g.beginPath(); g.moveTo(x, 12); g.lineTo(x + 1.5, 12 - h); g.lineTo(x + 3, 12); g.fill(); g.fillStyle = '#aa9ae4'; g.beginPath(); g.moveTo(x, 12); g.lineTo(x + 1.5, 12 - h); g.lineTo(x + 1.5, 12); g.fill(); px3(g, x + 1, 12 - h + 1, '#ffffff'); } }),
  web: left => sprite('web' + left, 14, 14, g => { g.strokeStyle = 'rgba(200,196,184,0.55)'; g.lineWidth = 1; for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(left ? 0 : 14, 0, k * 4, left ? 0 : Math.PI / 2, left ? Math.PI / 2 : Math.PI); g.stroke(); } for (let a = 0; a <= 2; a++) { const an = (a / 2) * Math.PI / 2 + (left ? 0 : Math.PI / 2); g.beginPath(); g.moveTo(left ? 0 : 14, 0); g.lineTo((left ? 0 : 14) + Math.cos(an) * 13, Math.sin(an) * 13); g.stroke(); } }),
  chain: n => sprite('chn' + n, 7, n * 5 + 6, g => { rc(g, 2, 0, 3, 3, '#3a3a42'); rc(g, 2, 0, 3, 1, '#8a8a96'); for (let k = 0; k < n; k++) { const y = 3 + k * 5; rc(g, 3, y, 1, 5, '#5a5a66'); rc(g, k % 2 ? 2 : 4, y + 1, 1, 3, '#7a7a88'); rc(g, 2, y + 2, 3, 1, '#8a8a96'); } rc(g, 1, n * 5 + 3, 5, 3, '#3a3a42'); rc(g, 2, n * 5 + 2, 3, 1, '#7a7a88'); }),
  urn: () => sprite('urn', 9, 11, g => { rc(g, 2, 0, 5, 2, STONE[3]); rc(g, 1, 2, 7, 6, STONE[2]); rc(g, 1, 2, 2, 6, STONE[4]); rc(g, 2, 8, 5, 3, STONE[2]); rc(g, 1, 5, 7, 1, '#c9a040'); rc(g, 4, 0, 3, 1, '#07050c'); px3(g, 6, 3, '#07050c'); px3(g, 7, 4, '#07050c'); }),
};
export function dress(decor, L, at, T) {
  const LW = L.W, LH = L.H, slabs = L.slabs || [];
  const nearPost = x => slabs.some(s => x >= s.x0 - 2 && x <= s.x1 + 2);
  const add = (c, x, y) => decor.push({ k: 'ucdress', x: Math.round(x), y: Math.round(y), c, bg: true, sway: 0 });
  for (let y = 2; y < LH - 2; y++) for (let x = 2; x < LW - 2; x++) {
    const t = at(x, y), hv = hash(x * 7 + 3, y * 5 + 1), z = zoneOf(x, y);
    if (t === T.SOLID) {
      const up = at(x, y - 1) === T.AIR, down = at(x, y + 1) === T.AIR;
      if (up && !nearPost(x)) {   /* a floor cell */
        const r = hv % 100;
        if (z === 0) { if (r < 6) add(SPR.rubble(hv % 3), x * TS + 1, y * TS - 6); else if (r < 8) add(SPR.offcut(hv % 3), x * TS + 1, y * TS - 4); }
        else if (z === 1) { if (r < 8) add(SPR.puddle(hv % 2), x * TS + 1, y * TS - 2); else if (r < 12) add(SPR.rubble(hv % 3), x * TS + 1, y * TS - 6); }
        else if (z === 2) { if (r < 10) add(SPR.crystal(hv % 3), x * TS + 2, y * TS - 12); }
        else if (z === 3) { if (r < 7) add(SPR.bones(hv % 2), x * TS + 2, y * TS - 5); else if (r < 9) add(SPR.pick(), x * TS + 4, y * TS - 14); else if (r < 12) add(SPR.rubble(hv % 3), x * TS + 1, y * TS - 6); }
        else if (z === 4) { if (r < 3) add(SPR.urn(), x * TS + 3, y * TS - 11); else if (r < 6) add(SPR.bones(hv % 2), x * TS + 2, y * TS - 5); }
      }
      if (down && !nearPost(x)) {   /* a ceiling cell: a web in a corner, a hung chain */
        const r = (hv >> 4) % 100, wallL = at(x - 1, y + 1) === T.SOLID, wallR = at(x + 1, y + 1) === T.SOLID;
        if ((z === 0 || z === 3 || z === 4) && r < 14 && (wallL || wallR)) add(SPR.web(wallL ? 1 : 0), wallL ? x * TS : x * TS + 2, (y + 1) * TS);
        else if ((z === 0 || z === 1) && r >= 14 && r < 20) { let n = 0; while (n < 4 && at(x, y + 1 + n) === T.AIR) n++; if (n >= 2) add(SPR.chain(n - 1), x * TS + 4, (y + 1) * TS - 1); }
      }
    }
  }
}
