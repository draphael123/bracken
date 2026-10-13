// src/redraw/buried_city_flip_art.js - THE BURIED CITY 3's ART (claude/bc3art): the flip's pieces and the rooftops' and the throne room's new drawings, on the city's own kit
// (src/redraw/buried_city_set.js, _tiles.js). Every function takes a view V = { g, cx, cy, vw, vh, time } and draws world pixels; the fixed pieces are baked once (memoised), only what
// moves (sand, grains, gauges, spin) is live. No geometry: these draw what src/buried-city-flip.js and src/hourglass-king-hands.js already decided.
//   THE HOURGLASS (small)  a brass stand on a plinth, two glass bulbs, the sand live in them, a gauge built into the right post, the TURN-OVER (a half turn on a strike), an idle glow
//   RISERS / SINKERS       a buried house top or a glazed dome sliding up out of the sand (sand streaming off it), the sunk parapet tip with a chalk ghost and arrows, the warning shake
//   BANKS / DUNE FALLS     a drift wall that runs out grain by grain; a sand curtain that flows DOWN (heavy, dark) or UP (light, rising grains, gold chevrons)
//   THE SAND SEA           deep rippling sand in three layers, whirls dragging down, the lethal one darker with bones and a reaching hand
//   THE ROOFTOPS' AWNINGS  striped cloth on poles, a shade caster; THE COURTYARD'S collapsed dome shell; THE SKYLINE of the far buried city
//   THE GREAT HOURGLASS    the king's: a brass frame on a pivot, a gear crown, a big glass, the half turn, the column pouring up, the gauge
//   THE KING'S FX          the surge wave, the glass rain (cracks, shards), the grasp's sand hands, the held hero's sand, the echo, the tide's warning, the sandstone blocks, the pours
const R = Math.round;
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const BR = { d: '#3a2808', m: '#7a5a1c', b: '#b08a30', l: '#e8c460', h: '#fff0a0' };   /* the brass ramp */
const SD = { d: '#a8782c', m: '#d4a850', b: '#e6bc68', l: '#f8dc90', h: '#fff4cc' };   /* the sand the glasses hold */
const GL = { body: 'rgba(190,226,240,0.30)', edge: 'rgba(170,210,230,0.75)', hi: 'rgba(255,255,255,0.55)' };

/* ============================================================ THE SMALL HOURGLASS (34 px tall, 22 wide), the stand baked, the sand live */
const GW = 22, GH = 34;
function glassStand() {
  return once('gstand', () => { const [c, g] = mk(GW, GH);
    rc(g, 2, GH - 4, 18, 4, BR.m); rc(g, 2, GH - 4, 18, 1, BR.l); rc(g, 2, GH - 1, 18, 1, BR.d); rc(g, 4, GH - 6, 14, 2, BR.b); rc(g, 4, GH - 6, 14, 1, BR.h); for (const px of [4, 9, 15]) dot(g, px, GH - 3, BR.h);   /* the plinth, riveted */
    rc(g, 3, 1, 16, 3, BR.m); rc(g, 3, 1, 16, 1, BR.l); rc(g, 3, 3, 16, 1, BR.d); dot(g, 11, 1, BR.h); rc(g, 8, 0, 6, 1, BR.h);   /* the crown plate */
    for (const px of [3, 17]) { rc(g, px, 4, 2, GH - 10, BR.b); rc(g, px, 4, 1, GH - 10, BR.l); rc(g, px + 1, 4, 1, GH - 10, BR.m); for (let y = 8; y < GH - 8; y += 6) dot(g, px, y, BR.h); }   /* two turned posts */
    rc(g, 6, 15, 10, 4, BR.m); rc(g, 6, 15, 10, 1, BR.l); rc(g, 6, 18, 10, 1, BR.d);   /* the collar on the neck */
    return c; });
}
function bulbPath(g, x, top, bot) { const n = (top + bot) / 2; g.beginPath(); g.moveTo(x - 6, top); g.lineTo(x + 6, top); g.lineTo(x + 6, top + 2); g.quadraticCurveTo(x + 6, n - 4, x + 1, n - 1); g.lineTo(x + 1, n + 1); g.quadraticCurveTo(x + 6, n + 4, x + 6, bot - 2); g.lineTo(x + 6, bot); g.lineTo(x - 6, bot); g.lineTo(x - 6, bot - 2); g.quadraticCurveTo(x - 6, n + 4, x - 1, n + 1); g.lineTo(x - 1, n - 1); g.quadraticCurveTo(x - 6, n - 4, x - 6, top + 2); g.closePath(); }
/* draw one glass at (ox, oy) = its top-left; k = the sand still above (1 = just turned, 0 = run through) */
function glassBody(g, ox, oy, k, time, live) {
  g.drawImage(glassStand(), ox, oy);
  const top = oy + 5, bot = oy + GH - 8, n = (top + bot) / 2, x = ox + 11;
  g.save(); bulbPath(g, x, top, bot); g.clip();
  g.fillStyle = GL.body; g.fillRect(x - 7, top, 14, bot - top);
  const up = k * 9, lo = (1 - k) * 9;
  if (up > 0.3) { g.fillStyle = SD.b; g.fillRect(x - 7, n - 2 - up, 14, up); g.fillStyle = SD.l; g.fillRect(x - 7, n - 2 - up, 14, 1); g.fillStyle = SD.d; g.fillRect(x + 2, n - 2 - up, 5, up); }
  if (lo > 0.3) { g.fillStyle = SD.b; g.fillRect(x - 7, bot - lo, 14, lo); g.fillStyle = SD.l; g.fillRect(x - 3, bot - lo - 2, 6, 2); g.fillRect(x - 5, bot - lo - 1, 10, 1); g.fillStyle = SD.d; g.fillRect(x + 2, bot - lo + 1, 5, lo); }
  if (live) { g.fillStyle = SD.h; g.fillRect(x, n - 1, 1, Math.max(1, bot - lo - n + 2)); g.fillStyle = SD.l; g.fillRect(x - 1 + (Math.floor(time * 20) & 1), n + ((time * 40) % Math.max(3, bot - lo - n)), 1, 2); }
  g.restore();
  g.fillStyle = GL.hi; g.fillRect(x - 5, top + 2, 1, 7); g.fillRect(x - 5, bot - 9, 1, 6); g.fillRect(x - 4, top + 1, 2, 1);
  g.strokeStyle = GL.edge; g.lineWidth = 1; bulbPath(g, x, top, bot); g.stroke();
}
/* the gauge built into the right post: 10 brass cells that go dark from the top as the glass runs out; red and ticking in the last warn seconds */
function postGauge(g, ox, oy, k, warn, time) {
  const gx = ox + 18, gy = oy + 6; rc(g, gx, gy, 3, 21, '#1a1208'); rc(g, gx, gy, 1, 21, BR.d);
  for (let i = 0; i < 10; i++) { const on = (10 - i) / 10 <= k + 0.001; rc(g, gx + 1, gy + 1 + i * 2, 2, 1, on ? (warn ? (Math.floor(time * 8) % 2 ? '#ff5a3a' : '#ffb060') : '#ffd36b') : '#3a2a10'); }
}
export function drawGlass(V, gq, o) {   /* o: { k, warn, spin (0..1, 1 = just struck), x, y (the foot) } */
  const g = V.g, t = V.time, x = o.x, y = o.y, ox = R(x - GW / 2), oy = R(y - GH), run = gq.t > 0;
  { const a = run ? 0.35 : 0.2 + 0.12 * Math.sin(t * 3 + gq.x), gr = g.createRadialGradient(x, y - 16, 2, x, y - 16, 26);
    gr.addColorStop(0, run && o.warn ? 'rgba(255,90,60,' + a.toFixed(2) + ')' : 'rgba(255,224,140,' + a.toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(x - 28, y - 44, 56, 56); }
  if (o.spin > 0) {   /* THE TURN-OVER: the stand rolls a half turn about its middle; the sand lands on its head */
    const ang = Math.PI * (1 - o.spin); g.save(); g.translate(x, y - GH / 2); g.rotate(ang); g.translate(-x, -(y - GH / 2)); glassBody(g, ox, oy, 0, t, false); g.restore();
    for (let i = 0; i < 6; i++) { const a = ang * 2 + i * 1.05; dot(g, x + Math.cos(a) * 19, y - GH / 2 + Math.sin(a) * 19, i % 2 ? SD.l : SD.h); }
    return; }
  glassBody(g, ox, oy, o.k, t, run); postGauge(g, ox, oy, o.k, o.warn, t);
  if (run) for (let i = 0; i < 3; i++) { const ph = (t * 1.3 + i * 0.33) % 1; dot(g, x - 4 + i * 4, y - GH + 4 - ph * 14, ph < 0.6 ? SD.l : SD.d); }
}
/* the little gauge over a hero's head (A3): a brass glass-icon and a bar, red and ticking at the end */
export function drawHeadGauge(V, x, y, k, warn) {
  const g = V.g, t = V.time; rc(g, x - 12, y - 1, 24, 5, 'rgba(0,0,0,0.6)'); rc(g, x - 11, y, 22, 3, '#2a1c08');
  rc(g, x - 11, y, R(22 * k), 3, warn ? (Math.floor(t * 8) % 2 ? '#ff5a3a' : '#ffb060') : '#ffd36b'); rc(g, x - 11, y, R(22 * k), 1, warn ? '#ffd0b0' : '#fff4cc');
  rc(g, x - 17, y - 3, 4, 8, BR.m); rc(g, x - 17, y - 3, 4, 1, BR.l); rc(g, x - 17, y + 4, 4, 1, BR.d); rc(g, x - 16, y - 1, 2, 2, SD.b); rc(g, x - 16, y + 1 + (k > 0.5 ? 0 : 1), 2, 2, SD.l);
}

/* ============================================================ RISERS (buried roofs, domes) AND THE SINKER */
function houseTop(w, h, seed, dome) {
  return once('rhouse' + w + 'x' + h + seed + dome, () => { const [c, g] = mk(w, h);
    if (dome) { const r = w / 2; for (let y = 0; y < h; y++) { const u = Math.min(1, y / Math.max(4, r)), hw = R(r * Math.sqrt(Math.max(0, 1 - Math.pow(1 - u, 2)))), x0 = R(r - hw);
        for (let x = x0; x < w - x0; x++) dot(g, x, y, ((x + ((y / 4) | 0) * 3) % 6 < 5) ? ((y % 4) === 0 ? '#9ae4e4' : (x < w * 0.35 ? '#4cb4bc' : x > w * 0.7 ? '#12444e' : '#2a8a98')) : '#12444e'); }
      rc(g, w / 2 - 1, 0, 2, 3, '#d8aa40'); rc(g, 0, h - 5, w, 5, '#d8bc86'); rc(g, 0, h - 5, w, 1, '#f4e0b0'); rc(g, 0, h - 1, w, 1, '#6a4a30'); return c; }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = hash(x >> 1, y + seed) % 9; let col = n === 0 ? '#7a5a3c' : n < 4 ? '#92704a' : '#a8845a'; if ((y & 7) === 7) col = '#6a4a30'; dot(g, x, y, col); }
    for (let x = 0; x < w; x++) { if ((x % 8) < 5) { dot(g, x, 0, '#e8d09a'); dot(g, x, 1, '#c4a672'); dot(g, x, 2, '#8a6a46'); } dot(g, x, 3, '#d8bc86'); dot(g, x, 4, '#6a4a30'); }   /* the parapet */
    for (let k = 0; k < Math.max(1, (w / 24) | 0); k++) { const lx = 4 + k * 22; rc(g, lx, 8, 7, 8, '#2a1a10'); rc(g, lx + 1, 9, 5, 6, '#4a2a18'); rc(g, lx + 1, 9, 5, 1, '#8a5a30'); rc(g, lx + 3, 9, 1, 6, '#2a1a10'); }   /* a window with a lattice */
    rc(g, 0, 0, 1, h, '#5a3e26'); rc(g, w - 1, 0, 1, h, '#c4a672');
    return c; });
}
export function drawRiser(V, r, o) {   /* o: { l, top, w, h, near, moving } (screen px) */
  const g = V.g, t = V.time, { l, top, w, h } = o, dome = r.kind === 'dome', sh = r.shake ? R(Math.sin(t * 40)) : 0, up = r.up;
  if (up < 0.6) {
    const yy = top + (1 - up) * h * 1.2;
    if (up > 0.02) { g.save(); g.beginPath(); g.rect(l - 4, top - 4, w + 8, h + 12); g.clip(); g.drawImage(houseTop(R(w), R(h), l & 3, dome), R(l + sh), R(yy));
      for (let i = 0; i < 9; i++) { const ph = (t * 90 + i * 31) % 22, sx = l + ((i * 17 + (t * 7 | 0)) % w); dot(g, sx, yy + 1 + ph, i % 2 ? SD.l : SD.m); dot(g, sx, yy + 2 + ph, SD.d); }   /* sand streaming off it as it climbs */
      rc(g, l - 1, yy - 1, w + 2, 1, SD.h); g.restore(); }
    for (let x = 0; x < w; x += 8) { rc(g, l + x + 1, top + h + 1, 5, 2, '#d8bc86'); rc(g, l + x + 1, top + h + 1, 5, 1, '#f4e0b0'); }   /* the tip of the parapet in the sand */
    rc(g, l - 3, top + h + 3, w + 6, 1, SD.l);
    if (o.near && !r.sinks) { const a = 0.4 + 0.25 * Math.sin(t * 4); g.strokeStyle = 'rgba(255,236,170,' + a.toFixed(2) + ')'; g.setLineDash([3, 3]); g.strokeRect(R(l) + 0.5, R(top) + 0.5, w - 1, h - 1); g.setLineDash([]);   /* the chalk ghost + arrows: where it will stand */
      for (let i = 0; i < Math.max(1, (w / 14) | 0); i++) { const ax = l + 6 + i * 14 + (w % 14) / 2, ay = top + h - 4 - ((t * 18 + i * 9) % 12); rc(g, ax, ay, 1, 3, 'rgba(255,236,170,' + a.toFixed(2) + ')'); rc(g, ax - 1, ay, 3, 1, 'rgba(255,236,170,' + a.toFixed(2) + ')'); } }
  } else if (r.shake || (r.sinks && o.moving)) {   /* the last seconds, or a sinker going: it shakes, sand pours over it, red at the edges */
    g.drawImage(houseTop(R(w), R(h), l & 3, dome), R(l + sh), R(top));
    if (r.shake) { g.fillStyle = 'rgba(255,90,50,' + (0.12 + 0.1 * Math.sin(t * 30)).toFixed(2) + ')'; g.fillRect(R(l + sh), R(top), R(w), R(h)); }
    for (let i = 0; i < 8; i++) { const sx = l + ((i * 13 + (t * 11 | 0)) % w), ph = (t * 80 + i * 17) % 16; dot(g, sx, top + h - 2 + ph, SD.l); dot(g, sx, top + h - 1 + ph, SD.m); }
  }
}

/* ============================================================ THE BANK AND THE DUNE FALLS */
export function drawBankRunning(V, l, bot, w, hh, full) {
  const g = V.g, t = V.time; if (hh < 1) return; const top = bot - hh;
  for (let i = 0; i < Math.max(2, (w / 8) | 0); i++) { const sx = l + 3 + ((i * 11) % Math.max(1, w - 6)), ph = (t * 70 + i * 19) % Math.max(8, hh); dot(g, sx, top - 2 + ph * 0.2, SD.h); rc(g, sx, bot - 2 - (ph % 8), 1, 2, SD.l); }
  rc(g, l, bot - 1, w, 1, SD.d);
  if (full < 0.98) { g.fillStyle = 'rgba(255,236,170,0.35)'; for (let x = 0; x < w; x += 4) g.fillRect(R(l + x), R(top - 1 - Math.abs(Math.sin(x + t * 6)) * 2), 2, 1); }
}
export function drawDuneFall(V, on, l, top, w, bot) {
  const g = V.g, t = V.time, hgt = bot - top;
  if (!on) {   /* DOWN: a heavy curtain, ochre and dark, grains falling in streaks, a spray where it lands; it BEATS you down */
    const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(216,170,90,0.85)'); gr.addColorStop(1, 'rgba(150,100,48,0.9)'); g.fillStyle = gr; g.fillRect(R(l + 2), R(top), R(w - 4), R(hgt));
    for (let i = 0; i < 18; i++) { const sx = l + 3 + (i * 7) % Math.max(1, w - 6), ph = (t * 150 + i * 29) % hgt; rc(g, sx, top + ph, 1, 6, i % 3 ? '#c89a44' : '#f0d490'); rc(g, sx + 1, top + ((ph + 40) % hgt), 1, 4, '#7a5224'); }
    rc(g, l + 1, top, 1, hgt, '#8a5a28'); rc(g, l + w - 2, top, 1, hgt, '#8a5a28');
    for (let i = 0; i < 6; i++) { const a = t * 5 + i; dot(g, l + w / 2 + Math.cos(a) * (w / 2 + 2), bot - 2 - Math.abs(Math.sin(a * 1.7)) * 8, '#e6c98a'); }
  } else {   /* UP: pale, light, the grains rising, a lit lip where it tops out, gold chevrons */
    const gr = g.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, 'rgba(255,240,180,0.55)'); gr.addColorStop(1, 'rgba(230,190,110,0.35)'); g.fillStyle = gr; g.fillRect(R(l + 2), R(top), R(w - 4), R(hgt));
    for (let i = 0; i < 18; i++) { const sx = l + 3 + (i * 7) % Math.max(1, w - 6), ph = hgt - ((t * 120 + i * 29) % hgt); rc(g, sx, top + ph, 1, 5, i % 3 ? '#fff4cc' : '#f8dc90'); }
    for (let k = 0; k < 4; k++) { const ay = top + 6 + ((t * 36 + k * 24) % Math.max(10, hgt - 8)), a = 0.9 - ((ay - top) / hgt) * 0.5; g.fillStyle = 'rgba(255,244,204,' + a.toFixed(2) + ')'; g.fillRect(R(l + w / 2 - 3), R(ay), 6, 1); g.fillRect(R(l + w / 2 - 2), R(ay - 1), 4, 1); g.fillRect(R(l + w / 2 - 1), R(ay - 2), 2, 1); }
    const gl = g.createRadialGradient(l + w / 2, top, 2, l + w / 2, top, 28); gl.addColorStop(0, 'rgba(255,240,170,0.5)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gl; g.fillRect(l - 20, top - 28, w + 40, 56);
    for (let i = 0; i < 6; i++) { const a = t * 4 + i * 1.1; dot(g, l + w / 2 + Math.cos(a) * (w / 2 + 3), top - 2 - Math.abs(Math.sin(a * 1.3)) * 9, '#fff4cc'); }
  }
}

/* ============================================================ THE SAND SEA */
export function drawSea(V, s, l, w, top) {   /* (l, top screen px; w px) down to the bottom of the view */
  const g = V.g, t = V.time, vh = V.vh, leth = s.lethal, bot = vh + 8;
  const gr = g.createLinearGradient(0, top, 0, top + 110); gr.addColorStop(0, leth ? '#a85a2c' : '#c08a48'); gr.addColorStop(0.18, leth ? '#7a3a1c' : '#9a6a34'); gr.addColorStop(0.55, leth ? '#3a160c' : '#5a381a'); gr.addColorStop(1, leth ? '#14060a' : '#20120a'); g.fillStyle = gr; g.fillRect(R(l), R(top), R(w), R(Math.max(4, bot - top)));
  for (let b = 0; b < 3; b++) { const sp = 6 + b * 9, y0 = top + 5 + b * 14, amp = 1.5 + b * 0.6; g.fillStyle = b === 0 ? (leth ? '#c27a46' : '#e6c98a') : b === 1 ? (leth ? '#8a4a28' : '#b88a50') : (leth ? '#5a2a18' : '#8a6234');
    for (let x = 0; x < w; x += 3) { const yy = y0 + Math.sin((x + t * sp) / (6 + b * 3)) * amp + Math.sin((x - t * sp * 0.6) / (15 + b * 4)); g.fillRect(R(l + x), R(yy), 2, 1); if (hash(x, b) % 3 === 0) g.fillRect(R(l + x + 1), R(yy + 1), 1, 1); } }   /* three drifting bands of ripple: the nearer, the faster */
  for (let x = 0; x < w; x += 2) { const yy = top + Math.sin((x + t * 22) / 7) * 1.6 + Math.sin((x - t * 13) / 17) * 1.2; g.fillStyle = (x / 2) % 3 ? '#e0b66c' : '#fff0b8'; g.fillRect(R(l + x), R(yy - 1), 2, 2); if ((x / 2) % 5 === 0) { g.fillStyle = leth ? '#6a3018' : '#a07a40'; g.fillRect(R(l + x), R(yy + 1), 2, 1); } }   /* the crest */
  for (let i = 0; i < Math.max(2, w / 40); i++) { const sx = l + ((i * 61 + t * 9) % w), sy = top + 14 + (i * 23) % 36, rr = 6 + 2 * Math.sin(t * 2 + i);   /* whirls: it takes what falls in */
    g.strokeStyle = leth ? 'rgba(10,2,2,0.6)' : 'rgba(20,8,2,0.45)'; g.beginPath(); g.ellipse(R(sx), R(sy), rr, rr * 0.3, 0, t * 2 + i, t * 2 + i + 4.5); g.stroke(); g.strokeStyle = leth ? 'rgba(220,150,90,0.35)' : 'rgba(255,230,160,0.3)'; g.beginPath(); g.ellipse(R(sx), R(sy - 1), rr * 0.6, rr * 0.2, 0, t * 2.5 + i, t * 2.5 + i + 3); g.stroke(); }
  g.fillStyle = 'rgba(255,236,170,0.5)'; for (let i = 0; i < Math.max(3, w / 30); i++) { const sx = l + ((i * 37 + t * 14) % w), sy = top - 2 - Math.abs(Math.sin(t * 1.2 + i)) * 5; g.fillRect(R(sx), R(sy), 1, 1); }   /* blown dust */
  if (leth) {   /* the end: bones in the sand, a skull, and a hand reaching up out of it */
    for (let i = 0; i < w / 44; i++) { const bx = l + 10 + i * 44 + (i % 2) * 9, by = top + 5 + (i % 3) * 5; rc(g, bx, by, 6, 1, '#f0e8d0'); rc(g, bx + 1, by - 1, 1, 3, '#f0e8d0'); rc(g, bx + 5, by - 1, 1, 3, '#d8cfae'); }
    for (let i = 1; i < w / 120 + 1; i++) { const hx = l + i * 112 - 30, hy = top - 4 - Math.round(Math.abs(Math.sin(t * 1.4 + i)) * 3);
      rc(g, hx, hy + 2, 3, 6, '#cfc6a8'); for (let f = 0; f < 4; f++) rc(g, hx - 1 + f, hy - 1 + (f % 2), 1, 3, '#efe8d0'); rc(g, hx - 1, hy + 2, 5, 1, '#a89c7c'); }
    for (let i = 0; i < w / 160; i++) { const kx = l + 70 + i * 150, ky = top + 3; rc(g, kx, ky - 2, 7, 5, '#efe8d0'); rc(g, kx + 1, ky - 1, 2, 2, '#16100c'); rc(g, kx + 4, ky - 1, 2, 2, '#16100c'); rc(g, kx + 1, ky + 3, 5, 1, '#a89c7c'); }
  }
}

/* ============================================================ THE ROOFTOPS' AWNING (a shade caster), the collapsed dome's shell, the far city */
export function drawRoofAwning(V, d, TS) {
  const g = V.g, t = V.time, l = d.x0 * TS - V.cx, w = (d.x1 - d.x0 + 1) * TS, y = d.y * TS - V.cy; if (l > V.vw + 40 || l + w < -40) return;
  const pole = x => { rc(g, x, y + 4, 3, 40, '#6a4a2a'); rc(g, x, y + 4, 1, 40, '#a07a44'); rc(g, x + 2, y + 4, 1, 40, '#3a2812'); rc(g, x - 1, y + 2, 5, 3, '#c49a38'); rc(g, x - 1, y + 2, 5, 1, '#f0d070'); dot(g, x + 1, y, '#fff0a0'); };
  pole(R(l) + 1); pole(R(l + w) - 4);
  for (let x = 0; x < w; x++) { const sag = Math.sin(x / w * Math.PI) * 3, fl = Math.sin(t * 2.2 + x / 9) * 0.8, s = (Math.floor((d.x0 * TS + x) / 5) & 1), top = y + 4 + sag + fl;   /* striped cloth sagging between the poles, a scalloped fringe, a flutter */
    const A = s ? ['#f0dcae', '#d8c08a', '#b49e68'] : ['#c4442c', '#a63420', '#7e2616'];
    g.fillStyle = A[0]; g.fillRect(R(l + x), R(top), 1, 2); g.fillStyle = A[1]; g.fillRect(R(l + x), R(top + 2), 1, 3); const ph = x % 5; g.fillStyle = ph === 0 || ph === 4 ? A[2] : A[1]; g.fillRect(R(l + x), R(top + 5), 1, 1); if (ph > 0 && ph < 4) { g.fillStyle = A[1]; g.fillRect(R(l + x), R(top + 6), 1, 2); g.fillStyle = A[2]; g.fillRect(R(l + x), R(top + 8), 1, 1); } }
  rc(g, l, y + 3, w, 1, '#5a3a1c');
  g.fillStyle = 'rgba(40,30,80,0.12)'; g.fillRect(R(l + 2), R(y + 14), R(w - 4), 30);   /* the shade it throws */
}
export function drawShell(V, d, TS) {   /* THE COURTYARD's collapsed dome: ribs of cut stone and glazed tile, hanging fragments, light falling through its gaps */
  const g = V.g, t = V.time, l = d.x0 * TS - V.cx, w = (d.x1 - d.x0 + 1) * TS, y = d.y * TS - V.cy, rr = w / 2; if (l > V.vw + 40 || l + w < -40) return;
  const arc = (a0, a1, col, lw, off = 0) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(R(l + rr), R(y + rr * 0.95 + off), rr - 1, Math.PI * a0, Math.PI * a1); g.stroke(); };
  for (const [a0, a1] of [[1.0, 1.28], [1.42, 1.58], [1.72, 2.0]]) { arc(a0, a1, '#3a2a18', 6); arc(a0, a1, '#b09462', 4); arc(a0, a1, '#d8c088', 1, -1); }
  for (const [a0, a1] of [[1.07, 1.22], [1.76, 1.92]]) { arc(a0, a1, '#12444e', 3, 4); arc(a0, a1, '#2a8a98', 2, 4); arc(a0, a1, '#9ae4e4', 1, 3); }
  g.lineWidth = 1;
  for (let i = 0; i < 7; i++) { const a = Math.PI * (1.04 + i * 0.15), bx = l + rr + Math.cos(a) * (rr - 1), by = y + rr * 0.95 + Math.sin(a) * (rr - 1); if (hash(i, 5) % 3 === 0) continue; rc(g, bx - 1, by + 3, 2, 4 + hash(i, 2) % 5, '#6a4a30'); rc(g, bx - 2, by + 8 + hash(i, 2) % 5, 4, 2, '#4cb4bc'); }
  g.save(); g.globalCompositeOperation = 'lighter'; for (const [a0, w0] of [[l + rr * 0.45, 14], [l + rr * 1.15, 22]]) { const gr = g.createLinearGradient(0, y, 0, y + 190); gr.addColorStop(0, 'rgba(255,230,150,0.28)'); gr.addColorStop(1, 'rgba(255,230,150,0.02)'); g.fillStyle = gr; g.beginPath(); g.moveTo(R(a0), R(y + 4)); g.lineTo(R(a0 + w0), R(y + 4)); g.lineTo(R(a0 + w0 + 30), R(y + 190)); g.lineTo(R(a0 + 24), R(y + 190)); g.closePath(); g.fill(); } g.restore();
  g.fillStyle = 'rgba(255,248,214,0.8)'; for (let i = 0; i < 10; i++) { const ph = ((t * 8 + i * 37) % 180) / 180; g.fillRect(R(l + rr * 0.5 + (i * 19) % (rr * 1.2) + ph * 20), R(y + 6 + ph * 180), 1, 1); }
}
/* THE FAR CITY on the horizon (the rooftops' sky): hazed domes, minaret stubs, flat roofs - parallax 0.12 */
export function drawSkyline(g, cx, cy, VW, VH) {
  const par = 0.12, P = 540, base = R(VH * 0.7 - cy * 0.04), off = -(((cx * par) % P) + P) % P;
  const strip = once('skyline', () => { const [c, s] = mk(P, 80);
    const house = (x, w, h) => { rc(s, x, 80 - h, w, h, '#8a5a52'); rc(s, x, 80 - h, w, 2, '#b88a78'); rc(s, x + w - 2, 80 - h, 2, h, '#6a4040'); for (let k = 0; k < 2; k++) rc(s, x + 3 + k * (w / 2 | 0), 80 - h + 6, 3, 4, '#3a2030'); };
    const dome = (x, r, h) => { rc(s, x - r, 80 - h, r * 2, h, '#9a6258'); for (let y = 0; y < r; y++) { const hw = R(r * Math.sqrt(1 - Math.pow(1 - y / r, 2))); rc(s, x - hw, 80 - h - r + y, hw * 2, 1, y < 2 ? '#d8d0c0' : '#7aa0a8'); } rc(s, x - 1, 80 - h - r - 5, 2, 5, '#e8c460'); };
    const mina = (x, h) => { rc(s, x - 3, 80 - h, 6, h, '#a06a5c'); rc(s, x - 3, 80 - h, 2, h, '#c89a88'); rc(s, x - 5, 80 - h, 10, 3, '#6a4040'); rc(s, x - 2, 80 - h - 8, 4, 8, '#b88a78'); rc(s, x - 1, 80 - h - 12, 2, 4, '#e8c460'); };
    house(10, 40, 24); dome(80, 16, 18); house(120, 52, 30); mina(190, 52); house(215, 36, 20); dome(290, 20, 22); house(330, 44, 26); mina(400, 44); house(420, 50, 18); dome(490, 14, 20);
    s.globalCompositeOperation = 'source-atop'; const gr = s.createLinearGradient(0, 0, 0, 80); gr.addColorStop(0, 'rgba(230,150,120,0.5)'); gr.addColorStop(1, 'rgba(230,150,120,0.1)'); s.fillStyle = gr; s.fillRect(0, 0, P, 80);   /* the haze of the distance */
    return c; });
  for (let x = off - P; x < VW + P; x += P) g.drawImage(strip, R(x), base - 80 + 14);
}

/* ============================================================ THE GREAT HOURGLASS (the throne room's): x centre, y the floor */
const GRW = 44, GRH = 66;
function greatFrame() {
  return once('great', () => { const [c, g] = mk(GRW + 16, GRH + 12), x0 = 8;
    rc(g, x0 - 6, GRH + 4, GRW + 12, 6, BR.m); rc(g, x0 - 6, GRH + 4, GRW + 12, 1, BR.l); rc(g, x0 - 6, GRH + 9, GRW + 12, 1, BR.d); rc(g, x0 - 2, GRH + 1, GRW + 4, 3, BR.b);   /* the plinth */
    for (const px of [x0 - 4, x0 + GRW + 1]) { rc(g, px, 8, 4, GRH - 4, BR.b); rc(g, px, 8, 1, GRH - 4, BR.l); rc(g, px + 3, 8, 1, GRH - 4, BR.d); for (let y = 14; y < GRH; y += 8) { rc(g, px - 1, y, 6, 1, BR.m); dot(g, px + 1, y - 1, BR.h); } }
    rc(g, x0 - 6, 4, GRW + 12, 5, BR.m); rc(g, x0 - 6, 4, GRW + 12, 1, BR.l); rc(g, x0 - 6, 8, GRW + 12, 1, BR.d); for (let x = x0 - 3; x < x0 + GRW + 4; x += 6) dot(g, x, 6, BR.h);
    for (const px of [x0 - 8, x0 + GRW + 6]) { rc(g, px, 3, 3, 8, BR.m); rc(g, px, 3, 3, 1, BR.l); }   /* the pivot axles stand out of the frame */
    rc(g, x0 + GRW / 2 - 7, GRH / 2 - 1, 14, 5, BR.m); rc(g, x0 + GRW / 2 - 7, GRH / 2 - 1, 14, 1, BR.l); rc(g, x0 + GRW / 2 - 7, GRH / 2 + 3, 14, 1, BR.d);   /* the collar */
    return c; });
}
function bigBulb(g, x, top, bot, w) { const n = (top + bot) / 2; g.beginPath(); g.moveTo(x - w, top); g.lineTo(x + w, top); g.quadraticCurveTo(x + w, n - 8, x + 2, n - 2); g.lineTo(x + 2, n + 2); g.quadraticCurveTo(x + w, n + 8, x + w, bot); g.lineTo(x - w, bot); g.quadraticCurveTo(x - w, n + 8, x - 2, n + 2); g.lineTo(x - 2, n - 2); g.quadraticCurveTo(x - w, n - 8, x - w, top); g.closePath(); }
export function drawGreat(V, G, st) {   /* st: { ph, ready, run, runT (secs since struck), cdK (0..1 refilled) } */
  const g = V.g, t = V.time, x = R(G.great - V.cx), y = R(G.floorY - V.cy), ox = x - GRW / 2 - 8, oy = y - GRH - 10, cxm = x, cym = oy + 6 + GRH / 2;
  if (st.ready) { const gr = g.createRadialGradient(x, y - 30, 4, x, y - 30, 46); gr.addColorStop(0, 'rgba(255,214,120,' + (0.45 + 0.15 * Math.sin(t * 6)).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(255,214,120,0)'); g.fillStyle = gr; g.fillRect(x - 50, y - 80, 100, 100); }
  const spinning = st.run > 0 && st.runT < 0.9, ang = spinning ? Math.PI * Math.min(1, st.runT / 0.9) : 0;
  g.save(); if (spinning) { g.translate(cxm, cym); g.rotate(ang); g.translate(-cxm, -cym); }
  const top = oy + 14, bot = oy + GRH + 4, n = (top + bot) / 2, bx = cxm;
  g.drawImage(greatFrame(), ox, oy);
  g.save(); bigBulb(g, bx, top, bot, 17); g.clip(); g.fillStyle = 'rgba(190,226,240,0.28)'; g.fillRect(bx - 18, top, 36, bot - top);
  const upK = st.ph < 3 ? 0.12 : st.run > 0 ? (spinning ? 0.9 : Math.min(1, (st.runT - 0.9) / 3.5) * 0 + 0.9 - Math.min(0.9, (st.runT - 0.9) / 4)) : 1 - st.cdK;
  const up = Math.max(0, Math.min(1, upK)) * 22, lo = 22 - up;
  if (up > 0.3) { g.fillStyle = SD.b; g.fillRect(bx - 18, n - 3 - up, 36, up); g.fillStyle = SD.l; g.fillRect(bx - 18, n - 3 - up, 36, 1); g.fillStyle = SD.d; g.fillRect(bx + 6, n - 3 - up, 12, up); }
  if (lo > 0.3) { g.fillStyle = SD.b; g.fillRect(bx - 18, bot - lo, 36, lo); g.fillStyle = SD.l; g.fillRect(bx - 5, bot - lo - 3, 10, 3); g.fillRect(bx - 9, bot - lo - 1, 18, 1); g.fillStyle = SD.d; g.fillRect(bx + 6, bot - lo + 1, 12, lo); }
  if (st.run > 0 && !spinning) { g.fillStyle = SD.h; g.fillRect(bx - 1, top + 8, 2, bot - top - 16); const hh = bot - top - 8; for (let i = 0; i < 10; i++) rc(g, bx - 3 + (i * 3) % 7, top + 4 + (((t * -120 + i * 23) % hh) + hh) % hh, 1, 4, SD.l); }
  else if (st.ph === 3 && lo > 0.3) { g.fillStyle = SD.l; g.fillRect(bx, n - 2, 1, Math.max(1, bot - lo - n + 2)); }
  g.restore();
  g.strokeStyle = 'rgba(180,215,235,0.9)'; g.lineWidth = 1; bigBulb(g, bx, top, bot, 17); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(bx - 14, top + 3, 1, 12); g.fillRect(bx - 13, top + 2, 3, 1); g.fillRect(bx - 14, bot - 14, 1, 9);
  g.restore();
  const gx = x, gy = oy - 2, gr2 = 6; g.fillStyle = BR.b; for (let i = 0; i < 8; i++) { const a = t * (st.ph < 3 ? 2.2 : 0.4) + i * Math.PI / 4; g.fillRect(R(gx + Math.cos(a) * (gr2 + 2)) - 1, R(gy + Math.sin(a) * (gr2 + 2)) - 1, 2, 2); } g.beginPath(); g.arc(gx, gy, gr2, 0, 7); g.fill(); g.fillStyle = BR.l; g.fillRect(gx - 4, gy - 3, 2, 2); g.fillStyle = BR.d; g.beginPath(); g.arc(gx, gy, 2, 0, 7); g.fill();   /* the crown: a gear, fast in its frame before phase three */
  if (st.ph < 3) { for (let i = 0; i < 4; i++) { rc(g, x - 12 + i * 7, y - 54, 2, 30, '#5a5668'); rc(g, x - 12 + i * 7, y - 54, 1, 30, '#9a96ac'); } rc(g, x - 14, y - 40, 28, 3, BR.d); rc(g, x - 14, y - 40, 28, 1, BR.m); }   /* locked fast: iron bars across its glass */
  if (st.ph === 3) { rc(g, x - 18, y - 10, 36, 6, 'rgba(0,0,0,0.65)'); for (let i = 0; i < 14; i++) rc(g, x - 17 + i * 2.5, y - 9, 2, 4, i / 14 < st.cdK ? (st.ready ? '#fff0a0' : '#a8782c') : '#2a1c08'); }   /* its gauge: the sand running back down, 14 cells */
}
export function greatPour(V, G) {   /* the column of sand pouring UP out of the great glass to the broken roof, and the gale of grains around it */
  const g = V.g, t = V.time, x = R(G.great - V.cx), fy = R(G.floorY - V.cy), ry = R(G.roofY - V.cy), h = fy - 80 - ry; if (h < 4) return;
  const gr = g.createLinearGradient(0, ry, 0, fy - 76); gr.addColorStop(0, 'rgba(255,236,170,0.15)'); gr.addColorStop(1, 'rgba(248,220,144,0.7)'); g.fillStyle = gr; g.fillRect(x - 6, ry, 12, h);
  g.fillStyle = 'rgba(255,248,214,0.9)'; for (let i = 0; i < 16; i++) { const ph = (((t * -170 + i * 41) % h) + h) % h; g.fillRect(x - 5 + (i * 5) % 11, ry + ph, 1, 6); }
  for (let i = 0; i < 12; i++) { const a = t * 3 + i * 0.52, rr = 12 + (i * 7) % 20, y0 = fy - 76 - ((t * 60 + i * 23) % (h * 0.8)); dot(g, x + Math.cos(a) * rr, y0, i % 2 ? SD.l : SD.h); }
}

/* ============================================================ THE KING'S FX */
export function surgeWave(V, w, G) {   /* a tall crest of sand with a curl, foam on its lip and a wake of spray behind it */
  const g = V.g, t = V.time, hh = w.h || 26, hw = w.w || 12, x = R(w.x - V.cx), fy = R(G.floorY - V.cy), d = w.dir;
  for (let k = 1; k < 7; k++) { const sx = x - d * (hw + k * 7), sh = R(hh * (0.7 - k * 0.1) * (0.8 + 0.2 * Math.sin(t * 20 + k))); if (sh > 1) { rc(g, sx, fy - sh, 4, sh, 'rgba(216,160,80,' + (0.55 - k * 0.07).toFixed(2) + ')'); dot(g, sx + 1, fy - sh, '#fff0c8'); } }
  g.fillStyle = '#c88a3c'; g.beginPath(); g.moveTo(x - hw, fy); g.lineTo(x - hw + (d > 0 ? 0 : 3), fy - hh * 0.5); g.quadraticCurveTo(x + d * hw * 0.2, fy - hh * 1.2, x + d * hw * 1.1, fy - hh * 0.8); g.lineTo(x + d * hw * 0.6, fy - hh * 0.55); g.lineTo(x + hw, fy); g.closePath(); g.fill();
  g.fillStyle = '#e8b868'; g.beginPath(); g.moveTo(x - hw * 0.6, fy); g.quadraticCurveTo(x - hw * 0.2 * d, fy - hh * 0.9, x + d * hw * 0.9, fy - hh * 0.78); g.lineTo(x + d * hw * 0.3, fy - hh * 0.4); g.lineTo(x + hw * 0.5, fy); g.closePath(); g.fill();
  g.fillStyle = '#fff4cc'; for (let i = 0; i < 6; i++) g.fillRect(R(x + d * (hw * (0.1 + i * 0.16))), R(fy - hh * (1.0 - i * 0.05) + (i % 2)), 3, 2);
  g.fillStyle = '#8a5a28'; g.fillRect(x - hw, fy - 2, hw * 2, 2);
}
export function rainCracks(V, xs, G, k) {   /* the glass roof cracks above each mark while the sceptre points at it */
  const g = V.g, ry = R(G.roofY - V.cy);
  for (const x0 of xs) { const x = R(x0 - V.cx), n = 5 + R(k * 6); g.strokeStyle = 'rgba(230,248,255,0.95)'; g.lineWidth = 1; g.beginPath(); let px = x, py = ry; g.moveTo(px, py);
    for (let i = 0; i < n; i++) { px += ((hash(x0 | 0, i) % 7) - 3); py += 3 + (hash(i, x0 | 0) % 3); g.lineTo(px, py); if (i % 2 === 0) { g.lineTo(px + ((hash(i, 9) % 9) - 4), py + 4); g.moveTo(px, py); } } g.stroke();
    g.fillStyle = 'rgba(191,230,245,' + (0.25 + 0.2 * k).toFixed(2) + ')'; g.fillRect(x - 6, ry, 12, 3); }
}
export function rainShards(V, x0, G, tk, i0) {   /* falling glass: tinted wedges with a bright edge */
  const g = V.g, x = R(x0 - V.cx), ry = R(G.roofY - V.cy), fy = R(G.floorY - V.cy), H = fy - ry;
  for (let i = 0; i < 8; i++) { const sy = ry + ((tk * 3.4 + i * 0.13) % 1) * H, sx = x - 9 + ((i * 5 + i0) % 19), s = 2 + i % 3; g.fillStyle = i % 2 ? '#dff2ff' : '#9ac8e0'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + s, sy + 2); g.lineTo(sx + 1, sy + 6 + s); g.closePath(); g.fill(); dot(g, sx, sy, '#ffffff'); }
}
export function graspHands(V, x0, up, G, r) {   /* the sand hands rising: palm, four fingers, a wrist of sand, rust shaded */
  const g = V.g, t = V.time, x = R(x0 - V.cx), fy = R(G.floorY - V.cy), n = 5;
  for (let i = 0; i < n; i++) { const hx = x - r + 4 + i * (r * 2 - 8) / (n - 1), hh = R(6 + 20 * up * (0.7 + 0.3 * Math.sin(i * 2.1))), hxx = R(hx), lean = (i - 2) * 0.6;
    g.fillStyle = '#9a5a2a'; g.fillRect(hxx - 2, fy - hh, 5, hh); g.fillStyle = '#d0703a'; g.fillRect(hxx - 2, fy - hh, 2, hh); g.fillStyle = '#e8b878'; g.fillRect(hxx - 3, fy - hh - 3, 7, 4);
    for (let f = 0; f < 4; f++) { const fx = hxx - 3 + f * 2, fl = 4 + (f === 1 || f === 2 ? 2 : 0) + (up > 0.7 ? 1 : 0); g.fillStyle = f % 2 ? '#e8b878' : '#f4cc90'; g.fillRect(R(fx + lean * (f - 1.5)), fy - hh - 3 - fl, 1, fl); dot(g, R(fx + lean * (f - 1.5)), fy - hh - 4 - fl, '#fff0c8'); }
    g.fillStyle = '#e8b878'; g.fillRect(hxx + 4, fy - hh - 1, 2, 2); }
  for (let i = 0; i < 8; i++) dot(g, x - r + (i * 7 + (t * 20 | 0)) % (r * 2), fy - 2 - (i * 3) % 8, i % 2 ? '#f0a060' : '#e8b878');
}
export function heldSand(V, pp) {   /* sand to the knees round a held hero: ridged, the fingers' marks, a swirl */
  const g = V.g, time = V.time, px = R(pp.x - V.cx), py = R(pp.y - V.cy);
  g.fillStyle = '#9a5a2a'; g.fillRect(px - 9, py - 6, 18, 6); g.fillStyle = '#d0703a'; for (let i = 0; i < 5; i++) g.fillRect(px - 9 + i * 4, py - 7 - (i % 2) * 2, 3, 3 + (i % 2) * 2); g.fillStyle = '#f0a060'; for (let i = 0; i < 5; i++) g.fillRect(px - 9 + i * 4, py - 7 - (i % 2) * 2, 3, 1);
  g.strokeStyle = 'rgba(240,160,96,0.7)'; g.beginPath(); g.ellipse(px, py - 1, 11 + Math.sin(time * 8), 3, 0, 0, 7); g.stroke();
}
export function echoGhost(V, e, set, fr, x0, G, r) {   /* his echo: a violet double of the slip's tell pose, rings pulsing out of the spot and a clock's twelve marks round it */
  const g = V.g, t = V.time, x = R(x0 - V.cx), fy = R(G.floorY - V.cy), spr = (e.face > 0 ? set.R : set.L)[fr];
  g.save(); g.globalAlpha = 0.3 + 0.2 * Math.sin(t * 16); g.drawImage(spr, x - (e.face > 0 ? set.ax : spr.width - set.ax), fy - set.ay); g.restore();
  g.strokeStyle = '#b08cff'; g.beginPath(); g.ellipse(x, fy - 1, r, 4, 0, 0, 7); g.stroke(); g.strokeStyle = 'rgba(228,212,255,' + (0.7 - 0.5 * ((t * 2) % 1)).toFixed(2) + ')'; g.beginPath(); g.ellipse(x, fy - 1, r * ((t * 2) % 1), 4 * ((t * 2) % 1), 0, 0, 7); g.stroke();
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.fillStyle = k % 3 ? '#b08cff' : '#e4d4ff'; g.fillRect(R(x + Math.cos(a) * 16), R(fy - 2 + Math.sin(a) * 4), 1, 1); }
}
export function tideWarn(V, c0, c1, k, G) {   /* the floor's sand stirs and heaves a beat before it takes the floor */
  const g = V.g, t = V.time, l = R(c0 - V.cx), w = c1 - c0, fy = R(G.floorY - V.cy);
  g.fillStyle = 'rgba(255,154,92,' + (0.12 + 0.2 * k * (0.6 + 0.4 * Math.sin(t * 18))).toFixed(2) + ')'; g.fillRect(l, fy - 5, w, 7);
  for (let x = 0; x < w; x += 3) { const hh = R(1 + 5 * k * Math.abs(Math.sin(x / 6 + t * 9))); g.fillStyle = hash(x, 3) % 3 ? '#e6c98a' : '#fff0b8'; g.fillRect(l + x, fy - 2 - hh, 2, hh + 1); }
}
export function tideFloor(V, c0, c1, G) {   /* the drift when it is on: a deep rolling sand with a crest line and slow whirls */
  const g = V.g, t = V.time, l = R(c0 - V.cx), w = c1 - c0, fy = R(G.floorY - V.cy);
  const gr = g.createLinearGradient(0, fy, 0, fy + 18); gr.addColorStop(0, '#d4a850'); gr.addColorStop(1, '#8a5a2a'); g.fillStyle = gr; g.fillRect(l, fy, w, 18);
  for (let x = 0; x < w; x += 2) { const yy = fy + Math.sin((x + t * 24) / 6) * 1.6; g.fillStyle = (x / 2) % 3 ? '#e6bc68' : '#fff0b8'; g.fillRect(l + x, R(yy - 1), 2, 2); }
  for (let i = 0; i < w / 60; i++) { const sx = l + 20 + i * 60, rr = 8 + Math.sin(t * 2 + i) * 2; g.strokeStyle = 'rgba(40,16,4,0.5)'; g.beginPath(); g.ellipse(sx, fy + 7, rr, 2.4, 0, t * 2 + i, t * 2 + i + 4.5); g.stroke(); }
}
export function sandstoneBlock(V, b, up, warn, G) {   /* the carved block that is up: ashlar, a gilded glyph band, sand off its shoulders; the one that is down shows its cap in the drift */
  const g = V.g, t = V.time, l = R(b.x0 - V.cx), w = b.x1 - b.x0, top = R(b.y - V.cy), fy = R(G.floorY - V.cy), h = fy - top, sh = warn ? R(Math.sin(t * 40)) : 0;
  if (!up) { for (let x = 0; x < w; x += 8) { rc(g, l + x + 1, fy - 3, 5, 2, '#d8bc86'); rc(g, l + x + 1, fy - 3, 5, 1, '#f4e0b0'); } return; }
  g.fillStyle = '#a8845a'; g.fillRect(l + sh, top, w, h); for (let y = 0; y < h; y += 8) { g.fillStyle = '#6a4a30'; g.fillRect(l + sh, top + y + 7, w, 1); g.fillStyle = '#c4a672'; g.fillRect(l + sh, top + y, w, 1); }
  rc(g, l + sh, top, w, 3, '#e8d09a'); rc(g, l + sh, top, w, 1, '#fff0c0'); rc(g, l + sh, top + 3, w, 1, '#6a4a30'); rc(g, l + sh, top + 7, w, 2, '#d8aa40'); for (let x = 2; x < w; x += 4) dot(g, l + sh + x, top + 8, '#fff0a0');
  rc(g, l + sh, top, 1, h, '#e0c690'); rc(g, l + sh + w - 1, top, 1, h, '#5a3e26');
  if (warn) { g.fillStyle = 'rgba(255,120,60,0.3)'; g.fillRect(l + sh, top, w, h); }
  for (let i = 0; i < 4; i++) { const ph = (t * 70 + i * 17) % 14; dot(g, l + (i % 2 ? w : -1), top + 4 + ph, '#f8dc90'); }
}
export function pourColumn(V, x0, G, w) {   /* phase three's steady pour from the broken roof: a lit column, a mound where it lands, spray */
  const g = V.g, t = V.time, sx = R(x0 - w / 2 - V.cx), ry = R(G.roofY - V.cy), fy = R(G.floorY - V.cy), H = fy - ry;
  const gr = g.createLinearGradient(sx, 0, sx + w, 0); gr.addColorStop(0, 'rgba(190,140,70,0.85)'); gr.addColorStop(0.45, 'rgba(240,206,130,0.85)'); gr.addColorStop(1, 'rgba(170,120,60,0.85)'); g.fillStyle = gr; g.fillRect(sx, ry, w, H);
  g.fillStyle = '#fff0c8'; for (let i = 0; i < 5; i++) g.fillRect(sx + 2 + i * 4, R(ry + ((t * 170 + i * 37) % H)), 1, 7);
  g.fillStyle = '#d4a850'; g.fillRect(sx - 6, fy - 4, w + 12, 4); g.fillStyle = '#f8dc90'; g.fillRect(sx - 3, fy - 6, w + 6, 2);
  for (let i = 0; i < 6; i++) dot(g, sx + w / 2 + Math.cos(t * 6 + i) * (w / 2 + 5), fy - 6 - Math.abs(Math.sin(t * 4 + i * 1.3)) * 10, '#fff0b8');
  const gl = g.createRadialGradient(sx + w / 2, ry + 4, 2, sx + w / 2, ry + 4, 26); gl.addColorStop(0, 'rgba(255,236,170,0.45)'); gl.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = gl; g.fillRect(sx - 24, ry - 20, w + 48, 50);
}

/* ============================================================ THE ROOFTOPS' DRESSING: what the desert city left lying on its high dunes and rooftops (baked props, set on the surface) */
function prop(kind) {
  return once('prop' + kind, () => { const [c, g] = mk(24, 26);
    if (kind === 'amphora') { for (let y = 0; y < 18; y++) { const u = y / 17, hw = R(2 + 4.5 * Math.sin(Math.PI * Math.pow(u, 0.8)) + (y < 3 ? 0 : 0)); for (let x = -hw; x <= hw; x++) dot(g, 12 + x, 6 + y, x < -hw * 0.3 ? '#d08a5a' : x > hw * 0.4 ? '#7a3e24' : '#b4683c'); }
      rc(g, 9, 4, 6, 2, '#8a4a2c'); rc(g, 9, 4, 6, 1, '#e0a070'); rc(g, 6, 11, 1, 5, '#8a4a2c'); rc(g, 17, 11, 1, 5, '#6a3018'); rc(g, 8, 12, 8, 1, '#2e7a78'); rc(g, 8, 14, 8, 1, '#e8c460'); rc(g, 6, 23, 12, 3, SD.m); rc(g, 6, 23, 12, 1, SD.h); }
    else if (kind === 'column') { rc(g, 6, 8, 12, 18, '#b09462'); rc(g, 6, 8, 3, 18, '#d8c088'); rc(g, 15, 8, 3, 18, '#6e5636'); for (let x = 9; x < 15; x += 3) rc(g, x, 9, 1, 16, '#8e7248'); rc(g, 4, 6, 16, 3, '#c8aa72'); rc(g, 4, 6, 16, 1, '#f0d8a0'); g.clearRect(14, 6, 6, 3); rc(g, 9, 4, 5, 2, '#8e7248'); rc(g, 3, 23, 18, 3, SD.m); rc(g, 3, 23, 18, 1, SD.h); }
    else if (kind === 'pots') { for (const [x, h, col] of [[3, 9, '#b4683c'], [9, 13, '#a85a30'], [16, 7, '#c4784a']]) { rc(g, x, 25 - h, 6, h, col); rc(g, x, 25 - h, 1, h, '#e0a070'); rc(g, x + 5, 25 - h, 1, h, '#6a3018'); rc(g, x - 1, 24 - h, 8, 2, '#8a4a2c'); rc(g, x + 1, 27 - h, 4, 1, '#2e7a78'); } rc(g, 1, 24, 22, 2, SD.m); rc(g, 1, 24, 22, 1, SD.h); }
    else if (kind === 'cairn') { for (const [x, y, w, h, col] of [[3, 20, 18, 6, '#9a8458'], [6, 15, 12, 5, '#b8a070'], [9, 11, 7, 4, '#cdb888']]) { rc(g, x, y, w, h, col); rc(g, x, y, w, 1, '#ece0b8'); rc(g, x + w - 2, y, 2, h, '#6a5836'); } rc(g, 11, 6, 2, 5, '#c4442c'); rc(g, 13, 6, 5, 3, '#c4442c'); rc(g, 13, 6, 5, 1, '#e8806a'); }
    else { rc(g, 4, 8, 3, 18, '#6a4a2a'); rc(g, 4, 8, 1, 18, '#a07a44'); rc(g, 17, 12, 3, 14, '#6a4a2a'); rc(g, 17, 12, 1, 14, '#a07a44'); for (let x = 7; x < 17; x++) dot(g, x, 9 + Math.round(Math.sin((x - 7) / 10 * Math.PI) * 3), '#5a3a1c');   /* a washing line between two stumps, cloth hung on it */
      rc(g, 8, 10, 4, 7, '#2e7a78'); rc(g, 8, 10, 4, 1, '#4cb4bc'); rc(g, 8, 16, 4, 1, '#12444e'); rc(g, 13, 11, 3, 9, '#c4442c'); rc(g, 13, 11, 3, 1, '#e8806a'); rc(g, 13, 19, 3, 1, '#7e2616'); rc(g, 2, 24, 20, 2, SD.m); rc(g, 2, 24, 20, 1, SD.h); }
    return c; });
}
const DRESS = [[643, 'amphora'], [641, 'beam'], [664, 'column'], [669, 'pots'], [676, 'cairn'], [680, 'amphora'], [716, 'pots'], [721, 'column'], [718, 'beam']];
export function drawDressing(V, topOf) {   /* topOf(col) -> the row of the surface, or -1 */
  const g = V.g; for (const [x, kind] of DRESS) { const wx = x * 16 + 8 - V.cx; if (wx < -30 || wx > V.vw + 30) continue; const r = topOf(x); if (r < 0) continue; g.drawImage(prop(kind), R(wx - 12), R(r * 16 - V.cy - 26)); }
}
