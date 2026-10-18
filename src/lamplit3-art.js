// src/lamplit3-art.js - THE LAMPLIT STREET 3's FIRE, drawn (claude/lamplit3art; the greybox shapes the build lane left in src/lamplit-fire.js are replaced by these).
// Pure drawing on a 2d context in SCREEN pixels (the callers subtract the camera), no state of its own but what it is handed:
//   oilCell      lamp oil lying in the street: a puddle with a drifting rainbow sheen, a GUTTER (a grated stone channel: a fuse), a slick FLOATING on the water; CATCHING (blue
//                creeping flame), BURNING (flame tongues in four tones, smoke), SPENT (char and a dying ember, the oil's gloss coming back as it seeps in)
//   caskDraw     the lamp works' whale-oil tank: riveted iron, hoops, a gauge glass with the oil in it, a spigot dripping; TOLD (heating: red seams, steam, a vent flame, a shake); burst
//   valveDraw    a brass handwheel on a standpipe on the lamp main, a gauge dial showing the gutter's fill, the pipe going down to the run
//   netFire      a tar net CATCHING (a burn front climbing the mesh, tar dripping alight), and what it leaves (a charred rod, scorched threads, falling ash)
//   thrownDraw   thrown fire in flight (a comet with a tail of sparks) and lying on the stone (a small fire licking up, a char mark)
//   arcDraw      the TOLD ARC: embers from your hand to where the fire will land, a flame glyph in the landing ring (a lamp: a gold ring; water: a grey cross)
//   poolDraw     the lit lamp's pool on the wet cobbles: a warm reflection under the lamp that streaks and shimmers
import { LC } from './redraw/lamplit3_tiles.js';

const R = Math.round, hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0); };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const FL = ['#8a1d12', '#d8431f', '#ff9a3c', '#ffd36b', '#fff6c8'];   /* a fire, dark to white-hot */

/* one flame tongue: a tapering column of pixels, leaning with the draught, in four tones (outer red, orange, yellow, white core) */
function tongue(g, x, y, h, w, time, ph) {
  for (let r = 0; r < h; r++) { const f = r / h, lean = Math.round(Math.sin(time * 9 + ph + f * 2.4) * (0.6 + f * 1.6)), ww = Math.max(1, Math.round(w * (1 - f * f * 0.9)));
    const xx = x - (ww >> 1) + lean; rc(g, xx, y - r - 1, ww, 1, f < 0.25 ? FL[1] : f < 0.6 ? FL[2] : FL[1]);
    if (ww >= 2 && f < 0.7) rc(g, xx + (ww > 2 ? 1 : 0), y - r - 1, Math.max(1, ww - 2), 1, f < 0.35 ? FL[3] : FL[2]);
    if (ww >= 3 && f < 0.35) rc(g, xx + 1, y - r - 1, ww - 2, 1, FL[4]); }
}
/* smoke: a few grey blobs rising and thinning over a spot */
function smoke(g, x, y, n, time, seed, rise = 16) { for (let i = 0; i < n; i++) { const q = (time * 0.8 + i / n + (seed % 7) * 0.13) % 1; g.globalAlpha = 0.28 * (1 - q); rc(g, R(x + Math.sin(q * 5 + i * 2 + seed) * 3), R(y - q * rise), 2 + (q > 0.5 ? 1 : 0), 2, '#3a3a42'); } g.globalAlpha = 1; }

/* ---------------------------------------------------------------- THE OIL ---------------------------------------------------------------- */
/* c: { st, t, gutter, float, x, y }; X, Y: the cell's left and the surface line it lies on; nl / nr: is there oil in the cell beside it (a slick runs on, it does not end) */
export function oilCell(g, c, X, Y, time, nl, nr, o = {}) {
  const h0 = hash(c.x, c.y), fl = Math.floor(time * 14);
  if (c.gutter) {   /* a grated stone gutter cut into the paving, the oil lying in its channel; an iron grate over every fifth cell of it, rust where it drips */
    rc(g, X, Y, 16, 1, LC.st3); rc(g, X, Y + 1, 16, 3, '#0a0b0f'); rc(g, X, Y + 4, 16, 1, LC.st0);
    if (c.st === 'oil') { rc(g, X, Y + 1, 16, 2, '#14141c'); for (let i = 0; i < 4; i++) { const x = X + ((i * 5 + (time * 6 | 0) + h0) % 16); rc(g, x, Y + 1, 2, 1, i & 1 ? '#6a4a8a' : '#3a7a7a'); } rc(g, X + (h0 % 12), Y + 1, 1, 1, '#c8c0d8'); }
    else if (c.st === 'spent') { rc(g, X, Y + 1, 16, 2, '#1a1614'); rc(g, X + (h0 % 12), Y + 1, 2, 1, '#2a1c14'); }
    if ((c.x % 5) === 0) { for (let k = 0; k < 16; k += 3) rc(g, X + k, Y, 1, 4, LC.ir2); rc(g, X, Y, 16, 1, LC.ir3); }
    if (!nl) { rc(g, X, Y, 2, 5, LC.ir2); rc(g, X, Y, 1, 5, LC.ir3); } if (!nr) { rc(g, X + 14, Y, 2, 5, LC.ir2); rc(g, X + 15, Y, 1, 5, LC.ir1); }
  }
  const base = c.gutter ? Y + 1 : Y;   /* the oil's own floor line: a puddle lies ON the paving, a gutter's oil lies IN it */
  if (c.st === 'oil' && !c.gutter) {
    const wob = c.float ? Math.round(Math.sin(time * 1.6 + c.x * 0.7)) : 0, yy = base + wob, tl = nl ? 0 : 3, tr = nr ? 0 : 3;   /* a free end tapers to a rim */
    const x0 = X + tl, w = 16 - tl - tr;
    g.globalAlpha = c.float ? 0.9 : 1;
    rc(g, x0 + 1, yy - 2, Math.max(1, w - 2), 1, c.float ? '#1a2028' : '#141420');                                                  /* the film's rim, raised a hair off the stone */
    rc(g, x0, yy - 1, w, 2, c.float ? '#0d1016' : '#08080e'); rc(g, x0 + (nl ? 0 : 1), yy + 1, w - (nl ? 0 : 1) - (nr ? 0 : 1), 1, '#0a0a10');   /* the dark body, lying over the paving's lit lip */
    g.globalAlpha = 1;
    g.globalAlpha = 0.55; for (let i = 0; i < 3; i++) { const x = X + 2 + (((i * 5 + h0 + Math.floor(time * (c.float ? 2.5 : 1.5) * 3)) % 11)); rc(g, x, yy - 1, 2, 1, i === 1 ? '#2a7a70' : i === 2 ? '#7a6030' : '#5a4a8a'); } g.globalAlpha = 1;   /* a rainbow film drifting on it */
    rc(g, X + 3 + (h0 % 8), yy - 2, 2, 1, '#e8e0f8'); rc(g, X + 3 + (h0 % 8), yy - 1, 1, 1, '#ffffff');                                 /* the lamp's glint */
    if (c.float) for (let i = 0; i < 2; i++) { const x = X + ((i * 7 + h0) % 13); g.globalAlpha = 0.6; rc(g, x, yy + 1, 3, 1, '#5aa8a8'); g.globalAlpha = 1; }   /* water lapping its edge */
  } else if (c.st === 'catch') {   /* the first small blue flames creeping over the film, a puff of smoke; they get taller as it takes */
    const q = Math.max(0, Math.min(1, 1 - c.t / 0.25)), yy = base;
    rc(g, X + (nl ? 0 : 1), yy - 1, 16 - (nl ? 0 : 1) - (nr ? 0 : 1), 1, '#0a0a10');
    for (let i = 0; i < 16; i += 3) { if (((Math.floor(time * 22) + i + h0) % 4) > 1 + (q > 0.6 ? 1 : 0)) continue; const hh = 1 + Math.round(q * 3 * (0.5 + ((i * 7 + h0) % 5) / 5)); rc(g, X + i, yy - 1 - hh, 2, hh, '#5aa0ff'); rc(g, X + i, yy - 2 - hh, 2, 1, '#ff9a3c'); rc(g, X + i, yy - 1, 2, 1, '#8ad0ff'); }
    smoke(g, X + 8, yy - 3, 1, time, h0, 10);
  } else if (c.st === 'burn') {
    const k = Math.min(1, c.t / 1.2), yy = base, flick = Math.floor(time * 20);
    rc(g, X, yy - 1, 16, 1, '#3a0e06'); rc(g, X, yy, 16, 1, '#ff6b2c');                                                                       /* a bed of embers on the stone */
    for (let i = 1; i < 16; i += 4) { const hh = Math.max(2, Math.round((5 + ((Math.sin(time * 11 + (c.x * 16 + i) * 0.9) + 1) * 3.2) + ((h0 >> i) & 3)) * (0.35 + 0.65 * k))); tongue(g, X + i + 1, yy - 1, hh, 4, time, c.x * 3 + i); }
    for (let i = 0; i < 3; i++) { const x = X + ((h0 >> (i * 3)) % 15), q = (time * 1.6 + i * 0.37) % 1; g.globalAlpha = 1 - q; rc(g, x, yy - 7 - R(q * 16), 1, 1, i === 1 ? '#fff6c8' : '#ffd36b'); } g.globalAlpha = 1;   /* sparks flying up */
    smoke(g, X + 8, yy - 11, 2, time, h0, 22); void flick;
    if (c.gutter) { rc(g, X, yy + 1, 16, 2, '#ff6b2c'); rc(g, X + ((time * 30) % 16 | 0), yy + 1, 3, 1, '#ffd36b'); }                                                        /* the fuse: the channel itself runs with fire */
  } else if (c.st === 'spent') {   /* char: a black skin of burnt oil with cracked crust and a dying ember; the gloss is coming back as it seeps in */
    const back = Math.max(0, 1 - c.t / 4), yy = base; if (c.gutter) return;
    rc(g, X + (nl ? 0 : 2), yy - 1, 16 - (nl ? 0 : 2) - (nr ? 0 : 2), 1, '#14100e'); rc(g, X + (nl ? 0 : 3), yy, 16 - (nl ? 0 : 3) - (nr ? 0 : 3), 1, '#0a0806');
    for (let i = 0; i < 4; i++) rc(g, X + 2 + ((h0 + i * 5) % 12), yy - 1, 1, 1, '#2a1e18'); rc(g, X + 4 + (h0 % 6), yy - 2, 3, 1, '#1c1512');
    if (c.t > 8 && (Math.floor(time * 3) + h0) % 5 < 2) rc(g, X + 5 + (h0 % 6), yy - 1, 1, 1, '#a0381a');                                                      /* a last ember */
    if (back > 0.4) rc(g, X + 3 + (h0 % 9), yy - 1, 2, 1, '#3a3a50');                                                                          /* the gloss returning */
  }
}

/* ---------------------------------------------------------------- THE IRON CASK ---------------------------------------------------------------- */
/* x, y: the base, centre. state: 'full' | 'tell' | 'empty'; q: the told fraction 0..1; pop: seconds left of the burst's flash (0 = none) */
export function caskDraw(g, st, x, y, time, o = {}) {
  const tell = st === 'tell', empty = st === 'empty', q = o.q || 0, fl = Math.floor(time * 16) % 2, sh = tell ? (fl ? 1 : -1) : 0, bx = x - 9 + sh;
  const lv = empty ? 0 : 1;   /* the gauge's oil */
  rc(g, bx - 1, y - 3, 4, 3, LC.ir0); rc(g, bx + 15, y - 3, 4, 3, LC.ir0); rc(g, bx, y - 3, 3, 1, LC.ir3); rc(g, bx + 15, y - 3, 3, 1, LC.ir3);       /* the iron feet */
  const body = tell ? (fl ? '#5a2a1a' : '#4a2218') : empty ? '#262c32' : '#2b3136', lit = tell ? '#8a4a2c' : '#4a545c', shade = '#171b1f';
  rc(g, bx, y - 26, 18, 23, body); rc(g, bx + 1, y - 27, 16, 1, body); rc(g, bx + 3, y - 28, 12, 1, body);                                          /* the tank and its domed head */
  rc(g, bx + 1, y - 27, 16, 1, lit); rc(g, bx + 3, y - 28, 12, 1, lit);
  rc(g, bx, y - 26, 2, 23, lit); rc(g, bx + 15, y - 26, 3, 23, shade); rc(g, bx + 8, y - 26, 1, 23, '#232a30');                                      /* a lit left edge, a shaded right, the vertical seam */
  for (const hy of [-24, -15, -6]) { rc(g, bx, y + hy, 18, 2, tell ? '#6a3a24' : '#3a444c'); rc(g, bx, y + hy, 18, 1, tell ? '#a05a38' : '#5e6c76'); rc(g, bx, y + hy + 2, 18, 1, '#0e1114'); for (let i = 2; i < 18; i += 4) rc(g, bx + i, y + hy, 1, 1, '#94a4ae'); }   /* three riveted hoops */
  rc(g, bx + 6, y - 31, 6, 3, LC.ir2); rc(g, bx + 6, y - 31, 6, 1, LC.ir4); rc(g, bx + 8, y - 33, 2, 2, LC.ir3); rc(g, bx + 7, y - 34, 4, 1, LC.ir4);   /* the filler cap and its wing nut */
  rc(g, bx + 3, y - 21, 3, 11, '#0e1114'); rc(g, bx + 4, y - 20, 1, 9, '#1a2024'); if (lv) { rc(g, bx + 4, y - 17, 1, 6, '#8a6a2c'); rc(g, bx + 4, y - 17, 1, 1, '#d8b060'); }      /* the gauge glass, its oil */
  rc(g, bx + 10, y - 20, 5, 8, '#1f262c'); rc(g, bx + 12, y - 19, 1, 3, LC.bone1); rc(g, bx + 11, y - 17, 3, 1, LC.bone1); rc(g, bx + 12, y - 16, 1, 3, LC.bone1); rc(g, bx + 11, y - 15, 1, 1, LC.bone1);   /* the stencilled flame mark */
  rc(g, bx + 2, y - 9, 2, 5, LC.rust1); rc(g, bx + 13, y - 26, 2, 4, LC.rust1); rc(g, bx + 14, y - 22, 1, 2, LC.rust0);                              /* rust */
  rc(g, bx + 17, y - 8, 4, 3, LC.ir2); rc(g, bx + 17, y - 8, 4, 1, LC.ir3); rc(g, bx + 20, y - 6, 1, 2, LC.ir1);                                     /* the spigot */
  if (!empty) { const d = Math.floor(time * 3 + x) % 3; rc(g, bx + 20, y - 4 + d, 1, 2, '#0a0a0e'); if (d === 2) rc(g, bx + 19, y - 1, 3, 1, '#0a0a0e'); }   /* the drip */
  if (empty) { rc(g, bx + 5, y - 24, 4, 1, shade); rc(g, bx + 11, y - 12, 3, 2, shade); smoke(g, bx + 9, y - 28, 1, time, x | 0, 10); }
  if (tell) {   /* HEATING: red seams opening, steam off the cap, a flame jetting from the vent, and the ring */
    for (const hy of [-20, -11, -3]) for (let i = 1; i < 17; i += 3) if (((i + Math.floor(time * 18)) % 3) !== 0) rc(g, bx + i, y + hy, 2, 1, '#ff6b2c');
    rc(g, bx + 8, y - 26, 1, 23, '#ff9a3c'); tongue(g, bx + 9, y - 33, 5 + fl * 2 + Math.round(q * 6), 4, time, x | 0);
    smoke(g, bx + 9, y - 36, 3, time * 2, x | 0, 14);
    g.globalAlpha = 0.4 + 0.4 * fl; g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.setLineDash([3, 3]); g.beginPath(); g.arc(x, y - 10, o.r * (0.6 + 0.4 * q), 0, 7); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  }
}
/* the burst: a fireball that swells and thins, a white flash first, torn plates flung out of it. p: 0 (just burst) .. 1 (gone) */
export function caskPop(g, x, y, p, r) {
  const k = Math.sin(Math.min(1, p * 1.4) * Math.PI * 0.5), rr = r * (0.35 + 0.75 * k), a = Math.max(0, 1 - p);
  g.save(); g.globalAlpha = a * 0.55; const gr = g.createRadialGradient(x, y, 1, x, y, rr); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(0.35, '#ff9a3c'); gr.addColorStop(1, 'rgba(120,30,10,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  g.globalAlpha = a; for (let i = 0; i < 9; i++) { const ang = i * 0.7 + 0.3, d = (10 + (i % 3) * 8) * k + p * 26, sx = x + Math.cos(ang) * d, sy = y + Math.sin(ang) * d + p * p * 30; rc(g, R(sx), R(sy), 3, 2, i & 1 ? '#3a444c' : '#5e6c76'); rc(g, R(sx), R(sy), 3, 1, '#94a4ae'); }
  g.restore();
}

/* ---------------------------------------------------------------- THE VALVE WHEEL ---------------------------------------------------------------- */
/* x, y: the base. spin: 0..1 (the wheel turning after a blow or E); full: 0..1, how full the gutter run is (the dial) */
export function valveDraw(g, x, y, time, spin, full) {
  rc(g, x - 11, y - 5, 22, 5, LC.ir1); rc(g, x - 11, y - 5, 22, 1, LC.ir3); rc(g, x - 11, y - 1, 22, 1, LC.ir0); for (const k of [-9, 8]) rc(g, x + k, y - 4, 2, 2, LC.ir4);   /* the main, flanged, bolted */
  rc(g, x - 3, y - 7, 7, 2, LC.ir2); rc(g, x - 2, y - 17, 4, 11, LC.ir2); rc(g, x - 2, y - 17, 1, 11, LC.ir3); rc(g, x + 1, y - 17, 1, 11, LC.ir0);                              /* the flange and the standpipe */
  rc(g, x - 3, y - 18, 7, 2, '#7a5c1c'); rc(g, x - 3, y - 18, 7, 1, '#c9a040');                                                                                                    /* the brass bonnet */
  const cy = y - 24, a = spin * 12 + time * 0.2;
  g.fillStyle = '#7a5c1c'; for (let i = 0; i < 28; i++) { const t = i / 28 * Math.PI * 2; g.fillRect(R(x + 0.5 + Math.cos(t) * 7), R(cy + Math.sin(t) * 7), 2, 2); }                  /* the rim, brass */
  g.fillStyle = '#e8c870'; for (let i = 0; i < 28; i++) { const t = i / 28 * Math.PI * 2; if (Math.sin(t - 2.3) > 0.7) g.fillRect(R(x + 0.5 + Math.cos(t) * 7), R(cy + Math.sin(t) * 7), 1, 1); }   /* the light on its upper left */
  for (let k = 0; k < 6; k++) { const t = a + k * Math.PI / 3; g.fillStyle = '#c9a040'; for (let r = 1; r < 7; r += 1) g.fillRect(R(x + 1 + Math.cos(t) * r), R(cy + 1 + Math.sin(t) * r), 1, 1); g.fillStyle = '#e8c870'; g.fillRect(R(x + 1 + Math.cos(t) * 6), R(cy + 1 + Math.sin(t) * 6), 1, 1); }   /* six spokes */
  rc(g, x - 1, cy - 1, 4, 4, '#7a5c1c'); rc(g, x - 1, cy - 1, 2, 2, '#e8c870'); rc(g, x, cy, 1, 1, '#fff0b0');                                                                   /* the boss */
  rc(g, x - 14, y - 15, 8, 8, LC.ir1); rc(g, x - 13, y - 14, 6, 6, '#d8d0b8'); rc(g, x - 13, y - 14, 6, 1, LC.bone2); for (const [dx, dy] of [[-12, -13], [-8, -13], [-12, -9], [-8, -9]]) rc(g, x + dx, y + dy, 1, 1, LC.ir0);   /* the gauge dial */
  const ang = Math.PI * (1.12 - 1.24 * Math.max(0, Math.min(1, full))), nx = R(x - 10 + Math.cos(ang) * 3), ny = R(y - 11 - Math.sin(ang) * 3); g.fillStyle = '#c03020'; g.fillRect(nx, ny, 1, 1); g.fillRect(R((nx + x - 10) / 2), R((ny + y - 11) / 2), 1, 1); rc(g, x - 11, y - 11, 2, 1, '#2a2a30');   /* its needle */
  if (spin > 0) for (let i = 0; i < 3; i++) { const q = (time * 3 + i / 3) % 1; g.globalAlpha = 1 - q; rc(g, x + R(Math.cos(i * 2 + time * 4) * 9), cy - R(q * 8) + R(Math.sin(i * 2) * 4), 1, 1, '#fff0b0'); } g.globalAlpha = 1;   /* glints off the turning brass */
}

/* ---------------------------------------------------------------- THE TAR NET ALIGHT ---------------------------------------------------------------- */
/* s: a snag {x0,x1,y0,y1} (tiles), q: how far the fire has climbed (0..1), (cx, cy): the camera */
export function netFire(g, s, q, cx, cy, time, TS) {
  const x0 = s.x0 * TS - cx, x1 = (s.x1 + 1) * TS - cx, y0 = s.y0 * TS - cy, y1 = (s.y1 + 1) * TS - cy, w = x1 - x0, h = y1 - y0, front = y1 - q * h;
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.globalAlpha = 0.85; for (let y = Math.max(y0, R(front)); y < y1; y++) { for (let x = 0; x < w; x++) { const m = ((x + y) % 5 === 0) || ((x - y + 64) % 5 === 0); if (m) rc(g, x0 + x, y, 1, 1, ((x + y + Math.floor(time * 12)) % 3) ? '#ff9a3c' : '#ffd36b'); } }   /* the burning strands, over the burnt-out mesh */
  g.globalAlpha = 0.3; rc(g, x0, R(front), w, y1 - R(front), '#ff6b2c'); g.globalAlpha = 0.18; rc(g, x0, y0, w, h, '#ff9a3c'); g.globalAlpha = 1;
  for (let x = 2; x < w; x += 5) { const hh = 3 + Math.round((Math.sin(time * 12 + x) + 1) * 3 + q * 3); tongue(g, x0 + x, R(front) + 2, hh, 4, time, x); }                       /* the burn front */
  g.restore();
  for (let i = 0; i < 4; i++) { const t = (time * 0.9 + i * 0.27 + s.x0 * 0.1) % 1, dx = x0 + 3 + ((i * 11 + s.x0 * 5) % (w - 4)), dy = R(front) + t * (y1 - front); if (dy > y1 || dy < y0) continue; g.globalAlpha = 1 - t * 0.6; rc(g, dx, dy, 1, 2, '#ff6b2c'); rc(g, dx, dy, 1, 1, '#ffd36b'); g.globalAlpha = 1; }   /* burning tar dripping */
  smoke(g, x0 + w / 2, R(front), 3, time, s.x0, 26);
}
/* what a burnt net leaves hung on its rod: scorched threads, a charred bar, falling ash for a few seconds (ash: seconds left) */
export function netRemains(g, s, ash, cx, cy, time, TS) {
  const x0 = s.x0 * TS - cx, x1 = (s.x1 + 1) * TS - cx, y0 = s.y0 * TS - cy, w = x1 - x0;
  rc(g, x0, y0, w, 2, '#15171a'); rc(g, x0, y0, w, 1, '#3a3028'); for (let x = 3; x < w; x += 5) rc(g, x0 + x, y0 + 1, 1, 1, LC.rust1);                                       /* the charred rod */
  for (let x = 2; x < w; x += 4) { const len = 3 + ((hash(s.x0 + x, 3) % 8)); for (let k = 0; k < len; k++) rc(g, x0 + x + (k & 1 && x % 8 === 2 ? 1 : 0), y0 + 2 + k, 1, 1, k > len - 3 ? '#2a1e16' : '#1a1a1e'); if (ash > 0 && ((Math.floor(time * 4) + x) % 3) === 0) rc(g, x0 + x, y0 + 2 + len, 1, 1, '#a0381a'); }   /* the threads, a dying ember on a tip */
  if (ash > 0) for (let i = 0; i < 18; i++) { const q = (time * 0.35 + hash(i, s.x0) % 100 / 100) % 1, px = x0 + (hash(i, 9 + s.x0) % w) + Math.sin(q * 6 + i) * 3, py = y0 + 4 + q * (s.y1 - s.y0 + 1) * TS; g.globalAlpha = Math.min(1, ash / 1.2) * (1 - q * 0.6); rc(g, R(px), R(py), 1, 1, i & 1 ? '#3a3a42' : '#6a6258'); } g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- THROWN FIRE ---------------------------------------------------------------- */
/* f: { x, y, vx, vy, st: 'fly' | 'lie', t }; lieMax: how long a lying fire lasts */
export function thrownDraw(g, list, cx, cy, time, lieMax) {
  for (const f of list || []) { const x = R(f.x - cx), y = R(f.y - cy), fl = Math.floor(time * 16 + f.x) % 2;
    if (f.st === 'lie') { const k = Math.max(0.25, 1 - f.t / lieMax);
      rc(g, x - 4, y + 1, 8, 1, '#2a1a10'); rc(g, x - 3, y, 6, 1, '#16100c'); for (let i = -3; i <= 3; i += 2) rc(g, x + i, y, 1, 1, ((i + Math.floor(time * 8)) & 3) ? '#7a2a14' : '#ff6b2c');    /* the scorch under it, a bed of embers */
      g.globalAlpha = 0.3 * k; g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(x, y - 3, 7, 0, 7); g.fill(); g.globalAlpha = 1;
      tongue(g, x, y, Math.max(3, R(8 * k + fl)), 5, time, f.x); tongue(g, x - 3, y, Math.max(2, R(4 * k)), 3, time, f.x + 2); tongue(g, x + 3, y, Math.max(2, R(5 * k)), 3, time, f.x + 5);
      if ((Math.floor(time * 6) + (f.x | 0)) % 4 === 0) rc(g, x + R(Math.sin(time * 7) * 4), y - 10 - fl, 1, 1, '#ffd36b');
      if (f.t > lieMax * 0.7) smoke(g, x, y - 6, 2, time, f.x | 0, 12); continue; }
    const sp = Math.hypot(f.vx, f.vy) || 1, tx = -f.vx / sp, ty = -f.vy / sp;   /* in flight: a comet: head, a streaming tail, sparks shed */
    g.globalAlpha = 0.28; g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(x, y, 6 + fl, 0, 7); g.fill(); g.globalAlpha = 1;
    for (let k = 1; k < 8; k++) { const w = Math.max(1, 4 - (k >> 1)); g.globalAlpha = 1 - k / 9; rc(g, R(x + tx * k * 2 - w / 2), R(y + ty * k * 2 - w / 2), w, w, k < 3 ? FL[3] : k < 5 ? FL[2] : FL[1]); } g.globalAlpha = 1;
    rc(g, x - 2, y - 2, 4, 4, FL[2]); rc(g, x - 1, y - 2, 2, 4, FL[3]); rc(g, x - 1, y - 1, 2, 2, FL[4]);
    for (let i = 0; i < 3; i++) { const q = (time * 5 + i * 0.33) % 1; g.globalAlpha = 1 - q; rc(g, R(x + tx * (4 + q * 12) + (i - 1) * 3), R(y + ty * (4 + q * 12) + q * 5), 1, 1, i & 1 ? FL[3] : FL[1]); } g.globalAlpha = 1; }
}
/* the told arc: embers (brighter and smaller toward the landing), and where it lands: a ring with a small flame in it; a dead lamp it will strike: a gold ring round the lamp; water: a cold cross */
export function arcDraw(g, arc, cx, cy, time) {
  if (!arc || !arc.pts || arc.pts.length < 2) return; const n = arc.pts.length, step = Math.max(1, Math.floor(n / 15)), off = Math.floor((time * 10) % step);
  g.save();
  for (let i = step + off; i < n - 1; i += step) { const [x, y] = arc.pts[i], u = i / n, big = u < 0.5 ? 2 : 1; g.globalAlpha = 0.5 + 0.5 * u; rc(g, R(x - cx) - 1, R(y - cy) - 1, big, big, u < 0.35 ? '#fff0b0' : u < 0.7 ? '#ffb060' : '#ff6b2c'); if (big === 2) rc(g, R(x - cx) - 1, R(y - cy) - 1, 1, 1, '#ffffff'); }
  g.restore();
  if (!arc.land) return; const lx = R(arc.land.x - cx), ly = R(arc.land.y - cy + (arc.land.wall ? 0 : 3)), p = 0.5 + 0.5 * Math.sin(time * 7), water = arc.land.hit === 'water', lamp = arc.land.hit && !water, col = water ? '#9fb4bd' : lamp ? '#ffd36b' : '#ffb060';
  g.save(); g.globalAlpha = 0.55 + 0.35 * p; g.strokeStyle = col; g.lineWidth = 1; g.setLineDash(lamp ? [] : [2, 2]); g.beginPath(); g.ellipse(lx + 0.5, ly - 1.5, 9 + p * 2, (9 + p * 2) * 0.38, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  if (water) { g.fillStyle = col; g.fillRect(lx - 2, ly - 5, 1, 1); g.fillRect(lx + 2, ly - 5, 1, 1); g.fillRect(lx - 1, ly - 4, 1, 1); g.fillRect(lx + 1, ly - 4, 1, 1); g.fillRect(lx, ly - 3, 1, 1); g.fillRect(lx - 1, ly - 2, 1, 1); g.fillRect(lx + 1, ly - 2, 1, 1); g.fillRect(lx - 2, ly - 1, 1, 1); g.fillRect(lx + 2, ly - 1, 1, 1); }
  else tongue(g, lx, ly - 2, 5 + (Math.floor(time * 10) & 1), 3, time, 0);
  g.restore();
}

/* ---------------------------------------------------------------- A LIT LAMP'S POOL ON THE WET COBBLES ---------------------------------------------------------------- */
/* lamps: lit city lamp props [{x, y}] in WORLD px; floorY(x, y) -> the paving's y below a point (or -1); drawn over the dark: a warm oval laid on the wet stone under the lamp, a stretched
   reflection of the flame that shimmers, and a few bright cobble glints, so the lit street reads as WET and the pool has an edge */
export function poolDraw(g, lamps, cx, cy, VW, VH, time, floorY) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const L of lamps) { if (!L.lit || L.x < cx - 100 || L.x > cx + VW + 100) continue; const fy = floorY(L.x, L.y - 20); if (fy < 0 || fy - L.y > 110) continue; const x = L.x - cx, y = fy - cy; if (y < -20 || y > VH + 20) continue;
    const drop = Math.max(0, fy - L.y), rw = 64 - drop * 0.15, fl = 0.9 + 0.1 * Math.sin(time * 6 + L.x);
    const gr = g.createRadialGradient(x, y, 1, x, y, rw); gr.addColorStop(0, 'rgba(255,190,100,' + (0.17 * fl) + ')'); gr.addColorStop(0.55, 'rgba(255,150,70,' + (0.07 * fl) + ')'); gr.addColorStop(1, 'rgba(255,140,60,0)');
    g.save(); g.translate(x, y); g.scale(1, 0.16); g.translate(-x, -y); g.fillStyle = gr; g.fillRect(x - rw, y - rw, rw * 2, rw * 2); g.restore();   /* the oval on the paving */
    for (let k = 0; k < 7; k++) { const w = Math.max(1, 5 - k), yy = R(y) + k * 2, jit = Math.round(Math.sin(time * 3 + k * 1.7 + L.x) * (1 + k * 0.4)); g.globalAlpha = (0.28 - k * 0.03) * fl; rc(g, R(x) - (w >> 1) + jit, yy, w, 1, '#ffc880'); }   /* the flame's streak, broken by the wet joints */
    g.globalAlpha = 0.5; for (let k = 0; k < 6; k++) { const h = hash(k, R(L.x)), gx = R(x) - 40 + (h % 80), tw = (Math.sin(time * 2 + h) + 1) / 2; if (tw > 0.55) rc(g, gx, R(y) - 1 + (h % 3), 1, 1, '#ffe0a8'); }
    g.globalAlpha = 1; }
  g.restore();
}

/* ---------------------------------------------------------------- THE SIGNS (claude/lamplit3tune: no timber) ----------------------------------------------------------------
   a PAINTED TIN sign on a cast-iron post: a teal enamel plate with a cream border, lettering lines, a chipped corner showing rust, rivets, a finial on the post. 18 x 18, cached; the caller draws it at (x - 9, y - 18). */
let SIGN = null;
export function lpSign() {
  if (SIGN) return SIGN; const c = document.createElement('canvas'); c.width = 18; c.height = 18; const g = c.getContext('2d');
  rc(g, 8, 9, 2, 9, '#252b30'); rc(g, 8, 9, 1, 9, '#56626a'); rc(g, 6, 16, 6, 2, '#2c3338'); rc(g, 7, 15, 4, 1, '#56626a'); rc(g, 8, 8, 2, 1, '#8a949a');   /* the post: fluted, a collar, a footing, a finial */
  rc(g, 1, 1, 16, 8, '#102a30'); rc(g, 2, 2, 14, 6, '#1d5a60');                                   /* the enamel plate and its field */
  rc(g, 1, 1, 16, 1, '#e8e2c8'); rc(g, 1, 8, 16, 1, '#e8e2c8'); rc(g, 1, 1, 1, 8, '#e8e2c8'); rc(g, 16, 1, 1, 8, '#e8e2c8');   /* the cream border */
  rc(g, 3, 3, 8, 1, '#f1ecd2'); rc(g, 3, 5, 11, 1, '#f1ecd2'); rc(g, 3, 6, 5, 1, '#c9c2a2');   /* painted lines */
  rc(g, 14, 7, 2, 1, '#8a4a28'); rc(g, 15, 6, 1, 1, '#8a4a28'); rc(g, 16, 8, 1, 1, '#6a3a20');   /* a chip worn to rust */
  for (const [x, y] of [[2, 2], [15, 2], [2, 7]]) rc(g, x, y, 1, 1, '#9aa4a8');                  /* rivets */
  return (SIGN = c);
}
/* a cradle's CHAIN: links down a rope-length, alternating flat and edge-on, iron grey with a lit edge. (x0, y0) hang point, (x1, y1) the deck corner, screen pixels */
export function chainDraw(g, x0, y0, x1, y1) {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
  for (let i = 0; i <= n; i++) { const t = i / n, x = R(x0 + (x1 - x0) * t), y = R(y0 + (y1 - y0) * t);
    if (i % 2) { rc(g, x - 1, y, 3, 2, '#2a3036'); rc(g, x, y, 1, 2, '#8a949a'); } else { rc(g, x, y - 1, 1, 3, '#56626a'); rc(g, x + 1, y - 1, 1, 3, '#20262b'); } }
}
