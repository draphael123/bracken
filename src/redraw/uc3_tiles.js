// uc3_tiles.js - UNDERCROWN 3's TILE KIT and ARCHITECTURE over the UC2 kit (claude/uc3finish). DRAWING ONLY, behind L.uc3 (UC3_SHIPS): no tile, hitbox, entity or timer changes.
// The UC2 kit (undercrown_tiles.js / undercrown_art.js) is the hole under a castle. UC3 makes six stretches of it a GAS WORKING (L.firedamp chambers), so those stretches wear their history:
//   TILES   (uc3Tile, an overlay on the kit's own cell, same 16x16, memoised)
//     CEIL   the roof of a chamber: lamp-black bloom, black fingers hung down the rock, a sulphur crust blistered along the seams
//     TOP    the floor: coal-dust darkened, black grit, a chip of coal; the walked lip stays lit so the floor still reads
//     FACE   the wall: a pale sulphur bloom frosted on the rock where the gas weeps, soot at the foot
//   ROOMS   (roomOver, drawn over the kit's back wall by main.js drawRoomPaint)
//     soot hood under every chamber's roof; BRICK PORTALS round the wind doors (jambs + a springing arch the brattice hangs in);
//     the old ventilators: arched airways bricked into the back wall of the workings and the flooded level, a draught-blackened fan over each;
//     the stope's UPCAST FLUES (brick chimneys let up into the foundation, a dark mouth at the foot); the barrow's and the tomb's vault ribs (segmental arches springing from pilasters).
// Plain fillRect pixels (no paths) so tools/uc3-art.mjs renders it in Node.
import { canvas, px, rect } from '../px.js';
import { ZONE, hash } from './undercrown_tiles.js';

const TS = 16, R = rect;
const memo = new WeakMap();
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const SULPHUR = ['#4a4e1c', '#8a9232', '#c4c858', '#e8e888'], SOOT = '#07060a';

/* the cells of the level that are in a chamber: Map cell -> chamber (built once per level object) */
const CELLS = new WeakMap();
function chamberCells(L) {
  if (CELLS.has(L)) return CELLS.get(L);
  const m = new Map();
  for (const c of ((L.firedamp && L.firedamp.chambers) || [])) for (let y = c.y0 - 2; y <= c.y1 + 2; y++) for (let x = c.x0; x <= c.x1; x++) { const k = y * L.W + x; if (!m.has(k)) m.set(k, c); }
  CELLS.set(L, m); return m;
}
export const inChamber = (L, x, y) => chamberCells(L).get(y * L.W + x) || null;

/* ============================ TILES ============================ */
function overlay(base, kind, x, y, ch) {
  let per = memo.get(base); if (!per) { per = new Map(); memo.set(base, per); }
  const v = ((x * 3 + y * 5) % 4 + 4) % 4, key = kind + v + (ch.id === 'tomb' ? 't' : '');
  if (per.has(key)) return per.get(key);
  const [c, g] = canvas(16, 16); g.drawImage(base, 0, 0);
  const h = i => hash(x * 16 + i, y + v * 7), tomb = ch.id === 'tomb';
  if (kind === 'ceil') {
    g.globalAlpha = tomb ? 0.22 : 0.4; R(g, 0, 6, 16, 10, SOOT); g.globalAlpha = tomb ? 0.2 : 0.35; R(g, 0, 11, 16, 5, SOOT); g.globalAlpha = 1;   /* lamp-black bloom, heaviest at the lowest point */
    for (let i = 0; i < 16; i++) if ((h(i) >> 5) % 5 === 0) { const l = 2 + (h(i + 40) >> 4) % 6; R(g, i, 16 - l, 1, l, SOOT); }   /* black fingers hung down the rock */
    if (!tomb) for (let k = 0; k < 2; k++) { const sx = 2 + (h(k + 60) >> 3) % 12; R(g, sx, 13, 2, 1, SULPHUR[1]); px2(g, sx, 12, SULPHUR[2]); px2(g, sx + 1, 14, SULPHUR[0]); if (v === 1) px2(g, sx, 11, SULPHUR[3]); }   /* a sulphur blister on a seam */
  } else if (kind === 'top') {
    g.globalAlpha = 0.28; R(g, 0, 2, 16, 14, SOOT); g.globalAlpha = 1;   /* coal dust over everything but the lip */
    for (let i = 0; i < 4; i++) { const cx = (h(i + 80) >> 4) % 14; R(g, cx, 3 + (h(i) >> 5) % 5, 2, 1, '#0a0910'); px2(g, cx + 1, 2, '#2e2c38'); }   /* grit */
    if (v === 2 && !tomb) { R(g, 5, 1, 4, 2, '#0d0c12'); px2(g, 6, 1, '#4a4a58'); px2(g, 8, 2, '#2e2c38'); }   /* a chip of coal on the lip */
  } else {   /* face */
    if (!tomb && v !== 3) for (let i = 0; i < 6; i++) { const fx = (h(i + 20) >> 3) % 14, fy = 2 + (h(i + 30) >> 4) % 11; px2(g, fx, fy, SULPHUR[(h(i) >> 2) % 3]); if (i % 2) px2(g, fx + 1, fy, SULPHUR[0]); }   /* the bloom where it weeps */
    g.globalAlpha = 0.3; R(g, 0, 11, 16, 5, SOOT); g.globalAlpha = 1;
  }
  per.set(key, c); return c;
}
/* the hook: base = the UC2 kit's canvas for this cell (null -> null). Slab and board cells keep the kit's own look (they are not SOLID-kit cells in a chamber's roof course... slabs read as roof and are also darkened by the room's hood). */
export function uc3Tile(base, t, x, y, at, T, L) {
  if (!base || t !== T.SOLID) return null;
  const ch = inChamber(L, x, y); if (!ch) return null;
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.RAIL; };
  if (open(0, 1) && y >= ch.y0 - 2 && y <= ch.y1) return overlay(base, 'ceil', x, y, ch);
  if (open(0, -1) && y >= ch.y0 && y <= ch.y1 + 1) return overlay(base, 'top', x, y, ch);
  if ((open(-1, 0) || open(1, 0)) && y >= ch.y0 && y <= ch.y1) return overlay(base, 'face', x, y, ch);
  return null;
}

/* ============================ ARCHITECTURE ============================ */
/* a brick panel: courses 3 px high, bricks 8 wide, staggered joints, a lit top edge on each course */
function brick(g, x, y, w, h, Z, seed) {
  R(g, x, y, w, h, Z.s[3]);
  for (let cy = 0; cy < h; cy += 3) {
    R(g, x, y + cy, w, 1, Z.s[5]); if (cy + 2 < h) R(g, x, y + cy + 2, w, 1, Z.joint);
    const off = ((cy / 3) % 2) * 4; for (let bx = off; bx < w; bx += 8) R(g, x + bx, y + cy, 1, Math.min(3, h - cy), Z.joint);
    if (hash(seed + cy, w) % 5 === 0) R(g, x + 1 + (hash(cy, seed) % Math.max(1, w - 3)), y + cy + 1, 2, 1, Z.s[2]);
  }
  R(g, x, y, 1, h, Z.s[5]); R(g, x + w - 1, y, 1, h, Z.s[1]);
}
/* a segmental arch of voussoirs from x0 to x1 springing at ySpring, rising `rise` px, th thick, with a keystone */
function archRing(g, x0, x1, ySpring, rise, th, Z) {
  const w = x1 - x0, mid = (x0 + x1) / 2;
  for (let i = 0; i < w; i++) {
    const t = (i + 0.5) / w, top = ySpring - Math.round(Math.sin(t * Math.PI) * rise);
    R(g, x0 + i, top, 1, th, Z.s[3]); px(g, x0 + i, top, Z.s[5]); px(g, x0 + i, top + th - 1, Z.s[1]);
    if (i % 4 === 3) R(g, x0 + i, top, 1, th, Z.joint);
  }
  R(g, mid - 2, ySpring - rise - 1, 4, th + 2, Z.s[4]); R(g, mid - 2, ySpring - rise - 1, 4, 1, Z.s[6]); R(g, mid - 1, ySpring - rise + 1, 2, 1, Z.acc);
}
/* the fan of draught-black over an airway: stepped, widest low */
function sootFan(g, cx, y, w, h) {
  for (let r = 0; r < h; r++) { const hw = Math.round(w / 2 * (1 - r / h) + 2); g.globalAlpha = 0.5 - r * 0.5 / h; R(g, cx - hw, y - r, hw * 2, 1, SOOT); }
  g.globalAlpha = 1;
}
/* an old ventilator: a bricked arched airway low in the wall; lx = its left edge, fy = the floor line. 28 wide, 30 high */
function airway(g, lx, fy, Z, seed, wet) {
  const w = 28, h = 30, ty = fy - h;
  brick(g, lx - 3, ty + 6, w + 6, h - 6, Z, seed);
  R(g, lx, ty + 12, w, h - 12, '#050408'); R(g, lx + 3, ty + 14, w - 6, h - 14, '#0a0810'); R(g, lx + 6, ty + 20, w - 12, h - 20, '#000');
  archRing(g, lx - 3, lx + w + 3, ty + 14, 8, 4, Z);
  R(g, lx - 4, fy - 3, w + 8, 3, Z.s[4]); R(g, lx - 4, fy - 3, w + 8, 1, Z.s[6]);   /* the sill */
  for (let k = 0; k < 5; k++) R(g, lx + 3 + k * 5, fy - 9, 2, 6, Z.s[1]);          /* rusted bars across the foot of it */
  R(g, lx + 2, fy - 10, w - 4, 1, '#4a4a58');
  sootFan(g, lx + w / 2, ty + 8, w + 6, 12);
  for (let k = 0; k < 4; k++) R(g, lx + 4 + (hash(seed, k) % (w - 8)), ty + 14 + (k % 2) * 3, 2, 1, SULPHUR[k % 3]);
  if (wet) for (let k = 0; k < 5; k++) { const sx = lx + 2 + (hash(seed + 3, k) % (w - 4)); g.globalAlpha = 0.6; R(g, sx, ty + 18, 1, 8 + (k % 3) * 2, Z.moss[0]); g.globalAlpha = 1; px(g, sx, ty + 26 + (k % 3) * 2, Z.moss[2]); }
}
/* brick jambs and a springing arch round a wind door: cx = the door's centre line, y0..y1 its height */
function portal(g, cx, y0, y1, Z) {
  const h = y1 - y0;
  brick(g, cx - 13, y0, 7, h, Z, cx); brick(g, cx + 6, y0, 7, h, Z, cx + 5);
  for (const sx of [cx - 14, cx + 6]) { R(g, sx, y0 + 5, 9, 2, Z.s[4]); R(g, sx, y0 + 5, 9, 1, Z.s[6]); R(g, sx, y1 - 4, 9, 4, Z.s[3]); R(g, sx, y1 - 4, 9, 1, Z.s[5]); }   /* the impost and the plinth */
  archRing(g, cx - 13, cx + 13, y0 + 5, 5, 4, Z);
  R(g, cx - 6, y1 - 2, 12, 2, Z.s[2]); R(g, cx - 6, y1 - 2, 12, 1, Z.s[4]);   /* the threshold */
}
/* an UPCAST FLUE let into the stope's foundation: a brick chimney 2 tiles wide with a black mouth at its foot */
function flue(g, lx, y0, y1, Z, seed) {
  const w = 30;
  brick(g, lx, y0, w, y1 - y0, Z, seed); R(g, lx + 7, y1 - 14, w - 14, 14, '#030206'); R(g, lx + 7, y1 - 14, w - 14, 1, Z.s[1]);
  R(g, lx - 3, y1 - 4, w + 6, 4, Z.s[4]); R(g, lx - 3, y1 - 4, w + 6, 1, Z.s[6]);   /* the flange where it opens */
  for (let k = 0; k < 6; k++) { g.globalAlpha = 0.6; R(g, lx + 8 + (hash(seed, k) % (w - 16)), y1 - 19 - (k % 3) * 3, 1, 4 + (k % 3), SOOT); g.globalAlpha = 1; }
  for (let k = 0; k < 3; k++) R(g, lx + 9 + k * 6, y1 - 16, 3, 1, SULPHUR[k]);
}
/* the barrow / tomb: a segmental arch across the room's top between two pilasters */
function vaultRib(g, lx, w, ty, Z) {
  archRing(g, lx, lx + w, ty + 12, 9, 5, Z);
  for (const p0 of [lx - 4, lx + w - 2]) { R(g, p0, ty + 6, 6, 8, Z.s[3]); R(g, p0, ty + 6, 6, 1, Z.s[5]); R(g, p0, ty + 13, 6, 1, Z.joint); }
}

/* the rooms: called after UCA.paintRoom has painted the back wall. g's origin = tile (tx0, ty0). true = something drawn */
export function roomOver(g, st, sx, sy, w, h, tx0, ty0, time, camX, camY, VW, VH, L) {
  if (!L.firedamp) return false;
  const wx0 = tx0 * TS, wy0 = ty0 * TS, vx0 = camX - wx0 - 80, vx1 = vx0 + VW + 160;
  const x1t = tx0 + Math.ceil(w / TS) - 1, y1t = ty0 + Math.ceil(h / TS) - 1;
  const hit = (L.firedamp.chambers || []).filter(c => c.x1 >= tx0 && c.x0 <= x1t && c.y1 >= ty0 && c.y0 <= y1t);
  if (!hit.length) return false;
  const zOf = c => (c.y0 < 46 ? 0 : c.id === 'tomb' ? 4 : (c.id === 'barrow' || c.id === 'drift') ? 3 : 1);
  for (const c of hit) {
    const cl = Math.max(c.x0, tx0) * TS - wx0, cr = (Math.min(c.x1, x1t) + 1) * TS - wx0, roof = Math.max(0, c.y0 * TS - wy0), fl = (c.y1 + 1) * TS - wy0, z = zOf(c), Z = ZONE[z];
    if (cr < vx0 || cl > vx1) continue;
    /* the soot hood: the old burns, a smoke-black bloom down from the roof */
    const gh = Math.min(40, (fl - roof) >> 1), a = Math.max(cl, vx0), b = Math.min(cr, vx1);
    for (let i = 0; i < 4; i++) { g.globalAlpha = 0.1 + i * 0.03; R(g, a, roof, b - a, Math.round(gh * (1 - i * 0.22)), SOOT); }
    g.globalAlpha = 1;
    const gallery = c.id !== 'stope' && c.id !== 'barrow' && c.id !== 'tomb' && c.id !== 'drift';
    if (gallery && fl - roof >= 4 * TS - 2) {   /* the old ventilators, one every nine tiles, clear of the piers and ribs the kit draws */
      for (let wxp = Math.ceil(c.x0 / 9) * 9; wxp <= c.x1 - 3; wxp += 9) {
        const lxp = wxp * TS - wx0 + 4; if (lxp < vx0 - 40 || lxp > vx1 || lxp < cl || lxp + 28 > cr) continue; if (hash(wxp, 17) % 3 === 0) continue;
        const piers = (((wxp * TS + 4 - 3 * TS) % (28 * TS)) + 28 * TS) % (28 * TS); if (z === 0 && (piers < 70 || piers > 28 * TS - 40)) continue;
        airway(g, lxp, fl - 1, Z, wxp * 7 + 3, z === 1);
      }
    }
    if (c.id === 'stope') {   /* the upcast flues let into the foundation's underside */
      for (let wxp = 12; wxp < 90; wxp += 21) { const lxp = wxp * TS - wx0; if (lxp + 40 < vx0 || lxp > vx1 || lxp < 0 || lxp + 30 > w) continue; flue(g, lxp, 0, 56, ZONE[0], wxp); }
    }
    if (c.id === 'barrow' || c.id === 'tomb') {   /* vault ribs, every 12 tiles */
      for (let wxp = Math.ceil(c.x0 / 12) * 12; wxp + 11 <= c.x1; wxp += 12) { const lxp = wxp * TS - wx0; if (lxp + 190 < vx0 || lxp > vx1 || lxp < cl - 4 || lxp + 176 > cr) continue; vaultRib(g, lxp, 176, roof - 4, ZONE[4]); }
    }
  }
  for (const e of (L.ents || [])) {   /* the portals round the wind doors */
    if (e.t !== 'brattice' || e.x < tx0 || e.x > x1t) continue;
    const dx = e.x * TS + 8 - wx0, y0 = e.y0 * TS - wy0, y1 = (e.y + 1) * TS - wy0;
    if (dx < vx0 - 20 || dx > vx1 + 20) continue;
    portal(g, dx, y0, y1, ZONE[e.y < 46 ? 0 : 1]);
  }
  return true;
}
