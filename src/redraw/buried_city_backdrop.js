// src/redraw/buried_city_backdrop.js - THE BURIED CITY's BACKDROP (claude/bc2art, the art pass over the 10-11 placeholder). Under the sand roof there is NO SKY: four far layers,
// each baked once into a seamless strip and blitted at its own parallax, and the landmark drawn live:
//   1. THE BACK WALL    big coursed blocks of cold blue-black stone with the odd carved relief (parallax 0.5)
//   2. THE FAR ARCADE   a colonnade of the buried city: columns, voussoir arches, dark bays with a farther arch in them, faded banners, a niche with a lamp's glow (0.3)
//   3. THE HOURGLASS TOWER (parallax 0.035: it drifts a few hundred pixels across the whole level and grows as you near the throne at its foot): a brass frame of four pillars, a
//      toothed crown that turns, a collar on the neck, the glass (two bulbs, a lit edge, a streak of light) and THE SAND running in it - the level's clock: its upper bulb
//      empties as you go, a thread falls through the neck, the lower bulb heaps; warm light from the sand against the cold stone
//   4. THE ROOF'S UNDERSIDE a ceiling band of sand with buried rooftops and beams, grains sifting from its cracks (0.6)
//   THE DUNES (cols 0-37) keep the sky: it fades out down the sinkhole; two lit dune silhouettes and the tower's tip stand over them
// The shafts' light is drawn in the world (src/buried-city-hands.js drawWorld). main.js calls drawBackdrop(g, cx, cy, VW, VH, L, time, dY).
import * as FART from './buried_city_flip_art.js';
const R = Math.round;
const PAL = { glass: 'rgba(120,150,170,0.62)', glassEdge: 'rgba(214,236,246,0.95)', glassHi: 'rgba(255,255,255,0.55)',   /* (claude/buriedcity4, brief 6: the glass was pale and see-through - now a dark smoked glass with a bright rim, so the sand in it reads) */ sand: '#e6bc68', sandHi: '#f8dc90', sandLo: '#a8782c', brass: '#a47e30', brassHi: '#e8c460', brassLo: '#5a4014', brassDeep: '#2e200a' };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const BAKED = {};
const once = (k, fn) => BAKED[k] || (BAKED[k] = fn());

/* 1. THE BACK WALL: a 192 x 192 seamless tile of big blocks (courses of 24 or 32 px blocks so the tile repeats) */
function wallTile() {
  return once('wall', () => { const [c, g] = mk(192, 192), T = ['#211d2c', '#262232', '#2b2738', '#302c3e'], CH = 16;
    for (let r = 0; r < 12; r++) { const bw = (hash(r, 3) % 2) ? 24 : 32, off = (hash(r, 5) % 4) * 8;
      for (let b = -1; b * bw < 192 + bw; b++) { const x0 = b * bw - off, k = hash(b, r + 20), col = T[k % 4];
        for (let yy = 0; yy < CH; yy++) for (let xx = 0; xx < bw; xx++) { const X = ((x0 + xx) % 192 + 192) % 192, Y = r * CH + yy; let cc = col;
          if (yy === CH - 1 || xx === bw - 1) cc = '#12101a'; else if (yy === 0) cc = T[Math.min(3, (k % 4) + 1)]; else if (xx === 0) cc = '#2c283a'; else if (hash(X, Y) % 19 === 0) cc = '#1a1724'; else if (hash(X + 3, Y) % 29 === 0) cc = '#37334a';
          g.fillStyle = cc; g.fillRect(X, Y, 1, 1); }
        if (k % 11 === 0) { const rx = ((x0 + 6) % 192 + 192) % 192; g.fillStyle = '#3a3650'; for (let q = 0; q < 4; q++) { g.fillRect((rx + q * 4) % 192, r * CH + 5, 2, 1); g.fillRect((rx + q * 4 + 2) % 192, r * CH + 8, 2, 1); } } } }   /* (a carved line of glyphs on some blocks) */
    return c; });
}

/* 2. THE FAR ARCADE: a 384 x 200 seamless strip: three bays of 128, columns on the seams, a brighter banner in one, a niche lamp in another */
function arcadeTile() {
  return once('arcade', () => { const [c, g] = mk(384, 200), COL = ['#1b1724', '#221d2e', '#2a2438', '#332c44'];
    const fill = (x, y, w, h, col) => { x = Math.round(x); g.fillStyle = col; g.fillRect(x, y, w, h); if (x + w > 384) g.fillRect(x - 384, y, w, h); if (x < 0) g.fillRect(x + 384, y, w, h); };   /* (wrapping: the strip is seamless) */
    for (let b = 0; b < 3; b++) { const x0 = b * 128;
      /* the bay's dark: a pointed arch cut in the wall with a farther arch inside it */
      for (let yy = 40; yy < 200; yy++) { const t = Math.max(0, 1 - Math.pow(Math.max(0, 70 - yy) / 36, 2)), hw = yy < 70 ? Math.round(48 * Math.sqrt(Math.max(0, t))) : 48; if (hw <= 0) continue; fill(x0 + 64 - hw, yy, hw * 2, 1, yy % 2 ? '#0e0c14' : '#100e17'); }
      for (let yy = 80; yy < 200; yy++) { const t = Math.max(0, 1 - Math.pow(Math.max(0, 110 - yy) / 28, 2)), hw = yy < 110 ? Math.round(22 * Math.sqrt(Math.max(0, t))) : 22; if (hw <= 0) continue; fill(x0 + 64 - hw, yy, hw * 2, 1, '#171320'); fill(x0 + 64 - hw, yy, 1, 1, '#2a2438'); fill(x0 + 63 + hw, yy, 1, 1, '#0a0910'); }
      /* the arch's voussoir ring */
      for (let yy = 38; yy < 72; yy++) { const t = 1 - Math.pow((70 - yy) / 36, 2), hw = Math.round(48 * Math.sqrt(Math.max(0, t))), ho = hw + 6 - (yy > 60 ? 0 : 0); if (t <= 0) continue;
        for (let s = 0; s < 6; s++) { const xx = x0 + 64 - ho + s, xr = x0 + 63 + ho - s; if (xx < x0 + 64 - hw) { fill(xx, yy, 1, 1, ((yy >> 2) + s) % 3 ? COL[3] : '#14111c'); fill(xr, yy, 1, 1, ((yy >> 2) + s) % 3 ? COL[2] : '#14111c'); } } }
      for (let yy = 70; yy < 200; yy++) { fill(x0 + 64 - 54, yy, 6, 1, COL[2]); fill(x0 + 64 + 48, yy, 6, 1, COL[1]); }   /* the jambs */
      /* the column on the seam: capital, fluted shaft, base */
      const cx = x0 - 8; for (let yy = 30; yy < 200; yy++) { fill(((cx + 384) % 384), yy, 16, 1, COL[1]); fill(((cx + 384) % 384), yy, 2, 1, COL[3]); fill(((cx + 384) % 384) + 5, yy, 1, 1, '#14111c'); fill(((cx + 384) % 384) + 10, yy, 1, 1, '#14111c'); fill(((cx + 384) % 384) + 14, yy, 2, 1, '#14111c'); }
      fill((cx + 380) % 384, 26, 24, 6, COL[3]); fill((cx + 380) % 384, 32, 24, 2, '#14111c'); fill((cx + 380) % 384, 190, 24, 10, COL[2]); fill((cx + 380) % 384, 190, 24, 2, COL[3]);
      /* a banner hung in the bay: faded cloth with a stripe */
      if (b === 1) { const bx = x0 + 52; for (let yy = 70; yy < 132; yy++) { const w = 24 - (yy > 118 ? (yy - 118) : 0); fill(bx + (24 - w) / 2, yy, w, 1, yy % 8 < 2 ? '#7a6a3c' : yy % 3 ? '#5a2a30' : '#4e2228'); } fill(bx - 2, 68, 28, 3, '#6a5226'); for (let yy = 118; yy < 134; yy++) { const w = 24 - (yy - 118); if (w > 0 && yy % 2) fill(bx + (24 - w) / 2, yy, 2, 1, '#14111c'); } }
      /* a niche with a lamp in it, high on the wall */
      if (b === 2) { const nx = x0 + 64; fill(nx - 6, 78, 12, 18, '#0e0c14'); fill(nx - 5, 76, 10, 2, '#0e0c14'); fill(nx - 3, 92, 6, 3, '#3a2a12'); fill(nx - 1, 86, 2, 6, '#e8a850'); fill(nx - 1, 84, 2, 2, '#fff0b0');
        const gr = g.createRadialGradient(nx, 90, 1, nx, 90, 30); gr.addColorStop(0, 'rgba(255,170,70,0.35)'); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(nx - 30, 60, 60, 60); }
    }
    return c; });
}

/* 4. THE ROOF'S UNDERSIDE: a 480 x 60 seamless strip (transparent below the ragged edge): sand, buried rooftops (a dome's curve, a flat roof's parapet), beams */
function roofStrip() {
  return once('roof', () => { const [c, g] = mk(480, 60), W = 480;
    for (let x = 0; x < W; x++) { const e = 24 + Math.round(5 * Math.sin(x / 19) + 3 * Math.sin(x / 7 + 1)) + (hash(x, 1) % 3 === 0 ? 1 : 0);
      for (let y = 0; y < e; y++) { const n = hash(x >> 1, y >> 1) % 7; g.fillStyle = y > e - 3 ? '#1c130a' : n === 0 ? '#34261a' : n < 3 ? '#2a1e12' : '#241a10'; g.fillRect(x, y, 1, 1); }
      if (hash(x, 3) % 6 === 0) { const l = 2 + hash(x, 4) % 4; g.fillStyle = '#4a361e'; g.fillRect(x, e, 1, l); g.fillStyle = '#1c130a'; g.fillRect(x, e + l, 1, 1); } }   /* (grain hanging off it) */
    const items = [[40, 'dome'], [150, 'flat'], [260, 'beam'], [350, 'dome'], [430, 'flat']];
    for (const [x0, kind] of items) { if (kind === 'dome') { for (let y = 0; y < 22; y++) { const hw = Math.round(24 * Math.sqrt(Math.max(0, 1 - Math.pow((22 - y) / 22, 2)))); g.fillStyle = y < 2 ? '#6a4a2a' : '#4a3220'; g.fillRect(x0 - hw, 14 + y, hw * 2, 1); g.fillStyle = '#7a5a34'; if (hw > 1) g.fillRect(x0 - hw, 14 + y, 1, 1); g.fillStyle = '#2a1c10'; if (hw > 1) g.fillRect(x0 + hw - 1, 14 + y, 1, 1); } g.fillStyle = '#c4a050'; g.fillRect(x0 - 1, 8, 2, 7); g.fillRect(x0 - 3, 10, 6, 1); }
      else if (kind === 'flat') { g.fillStyle = '#4a3220'; g.fillRect(x0 - 26, 22, 52, 10); g.fillStyle = '#7a5a34'; g.fillRect(x0 - 26, 22, 52, 2); for (let k = 0; k < 6; k++) { g.fillStyle = '#2a1c10'; g.fillRect(x0 - 24 + k * 9, 14, 5, 8); g.fillStyle = '#6a4a2a'; g.fillRect(x0 - 24 + k * 9, 14, 5, 1); } for (let k = 0; k < 4; k++) { g.fillStyle = '#1c130a'; g.fillRect(x0 - 20 + k * 12, 26, 6, 6); } }
      else { g.fillStyle = '#2a1c10'; g.fillRect(x0 - 30, 24, 60, 6); g.fillStyle = '#5a3e20'; g.fillRect(x0 - 30, 24, 60, 1); for (let k = 0; k < 3; k++) { g.fillStyle = '#6a6a74'; g.fillRect(x0 - 20 + k * 20, 30, 2, 8); } } }
    return c; });
}

/* THE DUNES' two silhouettes, drawn live (cheap: one pass of columns): lit rims against the sunset sky */
function drawDunes(g, cx, cy, VW, VH) {
  const dx = cx * 0.15;
  for (const [col, rim, base, amp, f, ph] of [['#9a6a3e', '#e8b070', 0.58, 10, 0.011, 0], ['#c8945a', '#f4cc88', 0.66, 14, 0.013, 2]]) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, VH); for (let x = 0; x <= VW; x += 4) g.lineTo(x, R(VH * base + Math.sin((x + dx) * f + ph) * amp + Math.sin((x + dx) * f * 2.3) * 3 - cy * 0.05)); g.lineTo(VW, VH); g.closePath(); g.fill();
    g.fillStyle = rim; for (let x = 0; x < VW; x += 2) g.fillRect(x, R(VH * base + Math.sin((x + dx) * f + ph) * amp + Math.sin((x + dx) * f * 2.3) * 3 - cy * 0.05), 2, 1); }
}

export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY = 0) {
  const TS = 16, levelW = L.W * TS, open = 38 * TS;
  const mid = cx + VW / 2; let sky = Math.max(0, Math.min(1, (open - mid) / (8 * TS) + 0.5));   /* how much of the view is the DUNES' sky (fading out down the sinkhole) */
  for (const z of (L.outside || [])) sky = Math.max(sky, Math.max(0, Math.min(1, Math.min(mid - z.x0 * TS, (z.x1 + 1) * TS - mid) / (6 * TS) + 0.5)));   /* (claude/buriedcity3) THE ROOFTOPS are outside: the sky over them */
  const under = 1 - sky * 0.999;
  g.globalAlpha = 1;
  if (under > 0.001) {
    g.globalAlpha = under;
    /* the cold ground of the dark: a gradient, then the wall in two parallax strips so it reads deep */
    const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#0e0c16'); gr.addColorStop(0.5, '#1c1826'); gr.addColorStop(1, '#14101c'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
    const wt = wallTile(), wx = -((cx * 0.5) % 192 + 192) % 192, wy = -((cy * 0.3) % 192 + 192) % 192;
    for (let x = wx - 192; x < VW + 192; x += 192) for (let y = wy - 192; y < VH + 192; y += 192) g.drawImage(wt, R(x), R(y));
    const at = arcadeTile(), ax = -((cx * 0.3) % 384 + 384) % 384, ay = R(VH * 0.05 - cy * 0.06);
    for (let x = ax - 384; x < VW + 384; x += 384) g.drawImage(at, R(x), ay);
    /* the arcade's floor of dark fog: the far bays sink into it */
    const fg = g.createLinearGradient(0, VH * 0.55, 0, VH); fg.addColorStop(0, 'rgba(14,12,22,0)'); fg.addColorStop(1, 'rgba(14,12,22,0.55)'); g.fillStyle = fg; g.fillRect(0, VH * 0.55, VW, VH * 0.45);
    drawTower(g, cx, VW, VH, levelW, time, dY, 1, L.towerFlip || 0);
    const rt = roofStrip(), rx = -((cx * 0.6) % 480 + 480) % 480, band = R(-14 - cy * 0.04);
    for (let x = rx - 480; x < VW + 480; x += 480) g.drawImage(rt, R(x), band);
    g.fillStyle = 'rgba(226,196,130,0.4)'; for (let i = 0; i < 9; i++) { const x = R((((i * 97 - cx * 0.6) % VW) + VW) % VW), y = band + 40 + ((time * 30 + i * 41) % Math.max(20, VH - band - 40)); g.fillRect(x, R(y), 1, 3); }
    g.globalAlpha = 1;
  }
  /* THE DUNES (only while the sky shows): lit silhouettes, and the tower's tip over them (you see where you are going before you go down) */
  if (sky > 0.01) { g.globalAlpha = sky; drawDunes(g, cx, cy, VW, VH); if ((L.outside || []).length && cx > 672 * TS) FART.drawSkyline(g, cx, cy, VW, VH); drawTower(g, cx, VW, VH, levelW, time, dY, 0.9, L.towerFlip || 0); g.globalAlpha = 1; }
}

/* THE HOURGLASS TOWER: k = how far along the level you are (its upper bulb empties, it comes nearer) */
/* (claude/buriedcity4, brief 6: THE LANDMARK SHOWS THE FLIP) fk 0..1: while a glass near you runs, THE GREAT HOURGLASS TURNS OVER (half a turn about its neck, eased) and its sand runs the other way
   - up the screen; when the glass runs out it turns back. src/buried-city-flip.js eases L.towerFlip */
function drawTower(g, cx, VW, VH, levelW, time, dY, alpha = 1, fk = 0) {
  const k = Math.max(0, Math.min(1, cx / Math.max(1, levelW - VW)));
  /* (claude/buriedcity3, Daniel 10-12: "the hourglass takes up too much of the screen" - it was 0.8-1.3 scale and 52-72% of the view tall: now a LANDMARK at backdrop scale,
     about a fifth of the view, far off and hazed; it drifts from the right of the view toward its middle as you near the throne at its foot - parallax 0.035 in spirit, by progress) */
  const sc = 0.36 + k * 0.12, X = R(VW * (0.84 - 0.36 * k) - (cx * 0.035) % 1), Wh = R(30 * sc), top = R(VH * 0.16), bot = R(top + VH * (0.15 + k * 0.05)), neck = (top + bot) / 2, nw = 2;
  const a0 = g.globalAlpha; g.globalAlpha = a0 * alpha;   /* (claude/buriedcity4: no longer hazed to a ghost - it is the landmark) */
  /* the warm glow the sand throws on the stone behind it */
  const gl = g.createRadialGradient(X, neck, 4, X, neck, Wh * 3.4); gl.addColorStop(0, 'rgba(255,184,86,0.30)'); gl.addColorStop(1, 'rgba(255,184,86,0)'); g.fillStyle = gl; g.fillRect(X - Wh * 3.4, neck - Wh * 3.4, Wh * 6.8, Wh * 6.8);
  /* the base the city is built round: a stepped stone plinth under the frame, running off the bottom */
  g.fillStyle = '#2a2638'; g.fillRect(X - Wh - 18, bot + 6, Wh * 2 + 36, VH); g.fillStyle = '#3a3650'; g.fillRect(X - Wh - 18, bot + 6, Wh * 2 + 36, 2); g.fillStyle = '#322e44'; g.fillRect(X - Wh - 10, bot - 2, Wh * 2 + 20, 8);
  const turn = fk <= 0.001 ? 0 : fk >= 0.999 ? 1 : fk * fk * (3 - 2 * fk); g.save(); if (turn) { g.translate(X, neck); g.rotate(Math.PI * turn); g.translate(-X, -neck); }
  /* the glass: scanline by scanline, an outline, a pale body, a streak of light down its left */
  const half = u => { const v = u < 0.5 ? u / 0.5 : (1 - u) / 0.5, gv = Math.max(Math.sin(Math.PI * Math.pow(v, 0.75)), 0.5 * Math.pow(1 - v, 4) * 1.2); return nw + (Wh - nw) * Math.min(1, gv); };
  const rows = bot - top;
  for (let i = 0; i < rows; i++) { const u = i / rows, hw = R(half(u)), y = top + i;
    g.fillStyle = PAL.glass; g.fillRect(X - hw, y, hw * 2, 1);
    g.fillStyle = PAL.glassEdge; g.fillRect(X - hw, y, 1, 1); g.fillRect(X + hw - 1, y, 1, 1);
    if (hw > 8) { g.fillStyle = PAL.glassHi; g.fillRect(X - hw + 4, y, 2, 1); g.fillRect(X - hw + 7, y, 1, 1); } }
  /* the sand: upper bulb empties with k, the lower heaps; warm, with a lit top surface */
  const upLevel = 0.9 - k * 0.8, ut = R(neck - (neck - top) * 0.92 * upLevel);   /* the surface row of the upper sand (a hollow in its middle) */
  for (let y = ut; y < neck; y++) { const u = (y - top) / rows, hw = R(half(u)) - 2; if (hw < 1) continue; const fall = y - ut; g.fillStyle = fall < 2 ? PAL.sandHi : fall < 6 ? PAL.sand : '#d4a850'; g.fillRect(X - hw, y, hw * 2, 1);
    if (fall < 4) { g.fillStyle = PAL.sandLo; g.fillRect(X - 3 + fall, y, 6 - fall * 2 > 0 ? 6 - fall * 2 : 1, 1); } }   /* (the funnel in the top of the heap) */
  const lt = R(bot - (bot - neck) * (0.12 + k * 0.78 * 0.9));
  for (let y = lt; y < bot; y++) { const u = (y - top) / rows, hw = R(half(u)) - 2, cone = Math.min(hw, 3 + (y - lt) * 1.4); if (cone < 1) continue; const fall = y - lt; g.fillStyle = fall < 2 ? PAL.sandHi : fall < 8 ? PAL.sand : '#c89a44'; g.fillRect(X - R(cone), y, R(cone) * 2, 1); }
  g.fillStyle = PAL.sand; g.fillRect(X - 1, R(neck - 2), 2, R(lt - neck + 2));   /* the thread of falling sand: the clock running */
  g.fillStyle = '#fff4cc'; g.fillRect(X - 1, R(neck + ((time * 38) % Math.max(4, lt - neck))), 1, 3); g.fillRect(X, R(neck + ((time * 38 + 9) % Math.max(4, lt - neck))), 1, 2);
  /* the brass frame: four pillars (two seen), top and bottom plates with rivets, a collar on the neck */
  const pil = (x, w) => { g.fillStyle = PAL.brass; g.fillRect(x, top - 4, w, bot - top + 12); g.fillStyle = PAL.brassHi; g.fillRect(x, top - 4, 1, bot - top + 12); g.fillStyle = PAL.brassLo; g.fillRect(x + w - 1, top - 4, 1, bot - top + 12);
    for (let y = top + 6; y < bot; y += 12) { g.fillStyle = PAL.brassHi; g.fillRect(x + 1, y, 1, 1); g.fillStyle = PAL.brassDeep; g.fillRect(x + w - 2, y + 1, 1, 1); } };
  pil(X - Wh - 8, 5); pil(X + Wh + 3, 5); pil(X - Wh + 1, 3); pil(X + Wh - 4, 3);
  const plate = (y, h) => { g.fillStyle = PAL.brass; g.fillRect(X - Wh - 12, y, Wh * 2 + 24, h); g.fillStyle = PAL.brassHi; g.fillRect(X - Wh - 12, y, Wh * 2 + 24, 1); g.fillStyle = PAL.brassLo; g.fillRect(X - Wh - 12, y + h - 1, Wh * 2 + 24, 1);
    for (let x = X - Wh - 9; x < X + Wh + 9; x += 8) { g.fillStyle = PAL.brassHi; g.fillRect(x, y + 2, 1, 1); } };
  plate(top - 8, 6); plate(bot, 8);
  g.fillStyle = PAL.brass; g.fillRect(X - 8, R(neck) - 3, 16, 6); g.fillStyle = PAL.brassHi; g.fillRect(X - 8, R(neck) - 3, 16, 1); g.fillStyle = PAL.brassLo; g.fillRect(X - 8, R(neck) + 2, 16, 1);   /* the collar */
  g.restore();
  if (fk > 0.5) { const k2 = (fk - 0.5) * 2; g.fillStyle = 'rgba(255,214,107,' + (0.5 + 0.4 * Math.sin(time * 8)) * k2 + ')'; for (let i = 0; i < 3; i++) { const yy = R(bot - 6 - ((time * 26 + i * 9) % Math.max(8, bot - top - 8))); g.fillRect(X + Wh + 12, yy, 3, 1); g.fillRect(X + Wh + 13, yy - 1, 1, 1); g.fillRect(X - Wh - 15, yy, 3, 1); g.fillRect(X - Wh - 14, yy - 1, 1, 1); } }   /* (and gold marks climbing beside it: the sand runs UP) */
  /* the crown: a great toothed gear that turns, over the top plate, and a smaller one meshing with it */
  const gear = (gx, gy, r, teeth, a, col, hi) => { g.fillStyle = col; for (let i = 0; i < teeth; i++) { const an = a + i * Math.PI * 2 / teeth, tx = gx + Math.cos(an) * (r + 2), ty = gy + Math.sin(an) * (r + 2); g.fillRect(R(tx) - 1, R(ty) - 1, 3, 3); }
    g.beginPath(); g.arc(gx, gy, r, 0, 7); g.fill(); g.fillStyle = hi; g.fillRect(gx - r + 1, gy - 1, 2, 2); g.fillStyle = PAL.brassDeep; g.beginPath(); g.arc(gx, gy, Math.max(2, r * 0.4), 0, 7); g.fill(); g.fillStyle = col; for (let i = 0; i < 4; i++) { const an = a + i * Math.PI / 2; g.fillRect(R(gx + Math.cos(an) * r * 0.55) - 1, R(gy + Math.sin(an) * r * 0.55) - 1, 2, 2); } };
  gear(X, top - 18, R(9 * sc), 10, time * 0.35, PAL.brass, PAL.brassHi); gear(X + R(16 * sc), top - 12, R(5 * sc), 7, -time * 0.62 + 0.3, '#8a6a24', PAL.brassHi);
  g.fillStyle = PAL.brass; g.fillRect(X - 1, top - 12, 2, 4);
  g.globalAlpha = a0;
}
