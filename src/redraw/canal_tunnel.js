// canal_tunnel.js - THE LEGGING TUNNEL's art (claude/canal4art). Pure drawing: src/canal-hands.js calls these with the live state; nothing here moves a thing, no number, no layout.
//   THE VAULT       a brick barrel vault in the dark: cast-iron lining rings every four tiles (flanged, riveted), a stone springing course, wet streaks, a tide-line of slime, dead
//                   lamp brackets, chalk tallies, drips. The deep lock's shaft is dressed ashlar with mooring rings and a depth gauge (painted white).
//   THE PORTAL      a stone archivolt with a keystone and an iron plate hung from it on chains (LEGGING TUNNEL); the deep lock's and the exit's plates
//   THE LOW BEAMS   an iron tie-bar on two eye-bolts under each rib, hazard-striped (yellow and black): readable when her lantern is lit, nothing when it is dimmed
//   THE LEDGE       a granite leggers' slab with a worn top, a lit lip, an iron nosing (the tile: src/redraw/canal_tiles.js)
//   THE STOP-PLANKS iron grooves, tarred planks strapped in iron, a hazard band on the top one, a lifting eye and a chain over a sheave to the WINDLASS on the ledge
//   THE WINDLASS    a cast-iron frame, a drum wound with rope, a ratchet wheel and pawl, a crank; THE PADDLE GEAR of the deep lock: a rack-and-pinion in a heavy frame
//   THE MOON SHAFT  a brick-lined well open to the sky: an iron grating, a pale moon, a shaft of moonlight with motes, a pool on the water
//   HER LIGHT       (the fog layer) a warm reach drawn where her lantern throws, an ember where it is dimmed
import { canvas, rect, px } from '../px.js';
const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round;
export const T4 = { iron0: '#14181c', iron1: '#2a3036', iron2: '#3a4048', iron3: '#6a747c', iron4: '#a8b4bc', rust: '#5a3a28', rustL: '#8a5a38', stone0: '#1c1816', stone1: '#2e2824', stone2: '#46403a', stone3: '#6a6258', stone4: '#9a9084',
  brick0: '#2c2022', brick1: '#3a2a2c', mort: '#150f10', tar0: '#14100c', tar1: '#241a12', tar2: '#3a2c1e', tar3: '#5a4630', yel: '#e0b830', yelD: '#7a6418', slime0: '#18301c', slime1: '#2e5434', slime2: '#58905a', moon: '#cfe0f0', moonD: '#6a8aa8' };

/* a 3 x 5 pixel face for the plates: the letters and digits the tunnel's plates use */
const GL = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', G: '011100101101011', H: '101101111101101', I: '111010010010111',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', Y: '101101010010010', '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001', '5': '111100111001111',
  '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111', ' ': '000000000000000', '.': '000000000000010' };
export function glyphs(g, str, x, y, col) { g.fillStyle = col; for (const ch of str) { const b = GL[ch] || GL[' ']; for (let i = 0; i < 15; i++) if (b[i] === '1') g.fillRect(x + (i % 3), y + ((i / 3) | 0), 1, 1); x += 4; } }
export const textW = s => s.length * 4 - 1;

/* ------------------------------ the vault, baked per 96 x 96 ------------------------------ */
function vaultTile(v) {
  return once('vt' + v, () => { const [c, g] = canvas(96, 96); rect(g, 0, 0, 96, 96, T4.mort);
    for (let y = 0, row = 0; y < 96; y += 5, row++) for (let x = -(row & 1) * 6; x < 96; x += 12) { const t = ((x * 7 + y * 13 + v * 31) % 17) / 17; rect(g, x + 1, y + 1, 10, 3, t < 0.16 ? '#46302e' : t < 0.4 ? T4.brick1 : T4.brick0); if (t > 0.9) rect(g, x + 2, y + 1, 6, 1, '#3a4a52'); }   /* courses of London stock: a few wet and blue-grey */
    return c; });
}
/* a cast-iron lining ring: a flanged band, bolt heads down both flanges, rust running off the lower one */
function ironRing(h) {
  return once('ring' + h, () => { const [c, g] = canvas(10, h);
    rect(g, 0, 0, 10, h, T4.iron1); rect(g, 2, 0, 6, h, T4.iron2); rect(g, 2, 0, 1, h, T4.iron3); rect(g, 7, 0, 1, h, T4.iron0); rect(g, 0, 0, 1, h, T4.iron0); rect(g, 9, 0, 1, h, T4.iron0);
    for (let y = 3; y < h - 2; y += 8) { rect(g, 1, y, 2, 2, T4.iron3); rect(g, 7, y, 2, 2, T4.iron3); px(g, 1, y, T4.iron4); px(g, 7, y, T4.iron4); }                       /* the bolts */
    rect(g, 3, 0, 4, 2, T4.iron0); rect(g, 3, h - 2, 4, 2, T4.iron0);                                                                                                  /* the ring's joints */
    for (let y = 6; y < h - 4; y += 19) { rect(g, 3, y, 1, 7 + (y % 5), T4.rust); rect(g, 6, y + 3, 1, 5, T4.rustL); }                                                 /* rust streaks */
    return c; });
}
/* the room behind the tunnel: sx, sy the room's top left on screen, w x h its size. tall = the deep lock's shaft */
export function paintTunnelRoom(g, sx, sy, w, h, time, cx = 0) {
  const tall = h > 220; g.save(); g.beginPath(); g.rect(sx, sy, w, h); g.clip();
  for (let y = sy; y < sy + h; y += 96) for (let x = sx; x < sx + w; x += 96) g.drawImage(vaultTile(tall ? 1 : 0), x, y);
  if (tall) {   /* THE DEEP LOCK'S SHAFT: dressed ashlar, big blocks, tide bands every eight rows, mooring rings */
    for (let y = 0; y < h; y += 12) { const row = (y / 12) | 0; g.fillStyle = 'rgba(6,8,10,0.55)'; g.fillRect(sx, sy + y, w, 1); for (let x = (row & 1) * 14; x < w; x += 28) g.fillRect(sx + x, sy + y, 1, 12); }
    for (let y = 0; y < h; y += 128) { g.fillStyle = 'rgba(46,84,52,0.5)'; g.fillRect(sx, sy + y + 118, w, 4); g.fillStyle = 'rgba(88,144,90,0.35)'; for (let x = 0; x < w; x += 5) g.fillRect(sx + x, sy + y + 118, 2, 1); g.fillStyle = 'rgba(20,40,44,0.38)'; g.fillRect(sx, sy + y + 122, w, 6); }
    for (let y = 40; y < h - 20; y += 64) for (const x of [10, w - 14]) { g.strokeStyle = '#6a747c'; g.lineWidth = 2; g.beginPath(); g.arc(sx + x, sy + y + 4, 3.5, 0, 6.3); g.stroke(); rect(g, sx + x - 3, sy + y - 2, 7, 2, T4.iron2); rect(g, sx + x - 3, sy + y - 2, 7, 1, T4.iron3); }   /* ring-bolts in the stone */
    const gx = sx + w - 10; /* the depth gauge, painted white down the right wall: a tick a row, a long one every four, a number every eight */
    for (let y = 0; y < h; y += 16) { const n = y / 16, long = n % 4 === 0; rect(g, gx + (long ? 0 : 3), sy + y + 8, long ? 7 : 4, 1, '#cfd8d4'); if (n % 8 === 0 && n) glyphs(g, String(n), gx - textW(String(n)) - 1, sy + y + 5, '#cfd8d4'); }
    rect(g, gx + 7, sy, 1, h, 'rgba(207,216,212,0.5)');
  } else {
    const rw = 10, ringX = sx + (((-cx % 64) + 64) % 64) - 64;   /* the iron rings are tied to the world (every 64 px), not to the room */
    /* the springing course: a dressed stone band at the crown of the vault, lit under its lip */
    rect(g, sx, sy, w, 6, T4.stone1); rect(g, sx, sy, w, 1, T4.stone3); for (let x = (((-cx % 24) + 24) % 24) + sx; x < sx + w; x += 24) rect(g, x, sy + 1, 1, 5, T4.stone0); rect(g, sx, sy + 6, w, 1, T4.stone4); rect(g, sx, sy + 7, w, 2, T4.stone0);
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(sx, sy + 9, w, 6); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(sx, sy + 15, w, 8);   /* the vault curves away overhead */
    for (let x = ringX; x < sx + w; x += 64) { if (x + rw < sx) continue; g.drawImage(ironRing(h), x, sy); }
    /* damp: streaks running down from the course and the rings, the blue-grey bloom of wet brick, white salts */
    for (let x = sx + 3 + (((-cx % 11) + 11) % 11); x < sx + w; x += 11) { const k = ((x * 5 + 3) % 7) | 0, len = 14 + k * 6; g.fillStyle = 'rgba(40,66,78,0.45)'; g.fillRect(x, sy + 9, 1, len); g.fillStyle = 'rgba(190,210,205,0.16)'; g.fillRect(x, sy + 9, 1, 3 + (k & 3)); }
    /* the tide-line: slime and a wet stain where the water stands against the wall */
    const wl = sy + 74; g.fillStyle = 'rgba(20,48,28,0.8)'; g.fillRect(sx, wl, w, 3); g.fillStyle = 'rgba(88,144,90,0.45)'; for (let x = (((-cx % 5) + 5) % 5) + sx; x < sx + w; x += 5) g.fillRect(x, wl - 1 + (x % 3), 2, 1); g.fillStyle = 'rgba(16,30,36,0.5)'; g.fillRect(sx, wl + 3, w, h);
    /* dead lamp brackets between the rings: an iron arm, a cage, no flame; the old gas lamps of the leggers' day */
    for (let x = ringX + 32; x < sx + w; x += 192) { if (x < sx - 8) continue; rect(g, x, sy + 28, 1, 9, T4.iron2); rect(g, x, sy + 28, 6, 1, T4.iron2); rect(g, x + 4, sy + 29, 4, 1, T4.iron1); rect(g, x + 3, sy + 30, 6, 7, T4.iron0); rect(g, x + 4, sy + 31, 4, 5, '#0a0e12'); rect(g, x + 3, sy + 30, 6, 1, T4.iron3); px(g, x + 6, sy + 33, '#2a3a40'); }
    /* chalk: leggers' tallies, scratched at the ledge's height */
    for (let x = ringX + 20; x < sx + w; x += 256) { if (x < sx) continue; for (let k = 0; k < 4; k++) rect(g, x + k * 2, sy + 56, 1, 6, 'rgba(220,226,214,0.55)'); for (let k = 0; k < 7; k++) px(g, x + k, sy + 62 - k * 0, 'rgba(220,226,214,0.4)'); }
  }
  /* drips: a bead falls from the course now and then and rings the water */
  if (!tall) for (let k = 0; k < 8; k++) { const ph = (time * 0.55 + k * 0.37) % 1, x = sx + ((k * 83 + 20) % w); if (x < sx || x > sx + w) continue; const y = sy + 10 + ph * 64; if (ph < 0.8) { g.fillStyle = 'rgba(190,226,240,0.7)'; g.fillRect(x, R(y), 1, 2); } }
  g.restore(); return true;
}

/* ------------------------------ the portals ------------------------------ */
/* a stone archivolt over the mouth (x the opening's left, y the roof line), with a keystone, an iron plate hung under it on two chains */
export function drawPortal(g, x, y, text, time, flip = false) {
  const wide = textW(text) + 14, f = flip ? -1 : 1;
  /* the arch moulding: three courses of dressed stone, stepping out, a lit arris */
  for (let k = 0; k < 3; k++) { const yy = y - 12 + k * 4, ox = x - 6 + k * 2; rect(g, ox, yy, 40 - k * 4, 4, k === 1 ? T4.stone2 : T4.stone1); rect(g, ox, yy, 40 - k * 4, 1, T4.stone3); for (let j = ox + 5; j < ox + 38 - k * 4; j += 9) rect(g, j + k * 2, yy + 1, 1, 3, T4.stone0); }
  rect(g, x - 6, y - 1, 40, 2, T4.stone4); rect(g, x - 6, y + 1, 40, 1, T4.stone0);   /* the arris under the moulding, lit */
  const kx = x + 14; rect(g, kx, y - 14, 8, 15, T4.stone3); rect(g, kx, y - 14, 8, 1, T4.stone4); rect(g, kx + 1, y - 10, 6, 1, T4.stone1); rect(g, kx, y - 3, 8, 1, T4.stone1); rect(g, kx + 7, y - 14, 1, 15, T4.stone1);   /* the keystone, carved with a lantern */
  rect(g, kx + 3, y - 9, 2, 4, T4.yel); rect(g, kx + 2, y - 10, 4, 1, T4.iron1); rect(g, kx + 2, y - 5, 4, 1, T4.iron1);
  /* the plate: cast iron, a white raised rim, white letters, hung by two chains from the moulding */
  const px0 = x + 17 - (wide >> 1) * f, py = y + 6;
  for (const cxx of [px0 + 3, px0 + wide - 4]) for (let yy = y; yy < py; yy += 2) { rect(g, cxx, yy, 1, 1, yy % 4 ? T4.iron3 : T4.iron1); }
  rect(g, px0, py, wide, 11, T4.iron1); rect(g, px0, py, wide, 1, '#cfd8d4'); rect(g, px0, py + 10, wide, 1, '#cfd8d4'); rect(g, px0, py, 1, 11, '#cfd8d4'); rect(g, px0 + wide - 1, py, 1, 11, '#cfd8d4'); rect(g, px0 + 1, py + 1, wide - 2, 1, T4.iron3);
  glyphs(g, text, px0 + 7, py + 3, '#e8f0ec'); for (const [bx, by] of [[px0 + 2, py + 2], [px0 + wide - 3, py + 2], [px0 + 2, py + 8], [px0 + wide - 3, py + 8]]) px(g, bx, by, T4.iron4);
  const sh = Math.round(Math.sin(time * 1.3) * 0.4); void sh;
}

/* an iron plate hung on two chains from a ledge's underside (y = the underside), over its own wall */
export function drawHungPlate(g, x, y, text) {
  const wide = textW(text) + 8; for (const cxx of [x + 2, x + wide - 3]) for (let yy = y; yy < y + 6; yy += 2) rect(g, cxx, yy, 1, 1, yy % 4 ? T4.iron3 : T4.iron1);
  rect(g, x, y + 6, wide, 9, T4.iron1); rect(g, x, y + 6, wide, 1, '#cfd8d4'); rect(g, x, y + 14, wide, 1, '#cfd8d4'); rect(g, x, y + 6, 1, 9, '#cfd8d4'); rect(g, x + wide - 1, y + 6, 1, 9, '#cfd8d4'); glyphs(g, text, x + 4, y + 8, '#e8f0ec');
}

/* ------------------------------ the low beams ------------------------------ */
/* a rib of the vault (bx..bx+w) with the tie-bar hung under it at barY: eye-bolts, a bar, hazard chevrons, a rivet row, a drip */
export function drawTunnelBeam(g, sx, w, ribTop, ribBot, barY, time) {
  /* the rib: a heavy cast-iron arch rib, flanged, bolted through to the vault */
  rect(g, sx - 1, ribTop, w + 2, ribBot - ribTop, T4.iron1); rect(g, sx - 1, ribTop, w + 2, 1, T4.iron3); rect(g, sx - 1, ribBot - 2, w + 2, 2, T4.iron0); rect(g, sx - 1, ribBot - 3, w + 2, 1, T4.iron3);
  for (let x = sx + 2; x < sx + w - 1; x += 7) { rect(g, x, ribTop + 4, 2, 2, T4.iron3); px(g, x, ribTop + 4, T4.iron4); rect(g, x, ribBot - 8, 2, 2, T4.iron3); }
  rect(g, sx + 2, ribTop + 8, Math.max(1, w - 4), 1, T4.iron0);
  for (const ex of [sx + 3, sx + w - 4]) { rect(g, ex, ribBot, 1, barY - ribBot, T4.iron3); rect(g, ex - 1, ribBot, 3, 2, T4.iron2); }   /* the two hanger rods, with an eye at the rib */
  /* the tie-bar */
  rect(g, sx, barY, w, 6, T4.iron1); rect(g, sx, barY, w, 1, T4.iron4); rect(g, sx, barY + 5, w, 1, T4.iron0);
  for (let x = 0; x < w; x += 6) { g.fillStyle = T4.yel; for (let k = 0; k < 4; k++) g.fillRect(sx + x + k, barY + 1 + k, 2, 1); }   /* hazard chevrons, yellow on iron */
  for (let x = 1; x < w; x += 5) px(g, sx + x, barY + 5, T4.iron4);
  const ph = (time * 0.5 + sx * 0.13) % 1; if (ph < 0.7) { g.fillStyle = 'rgba(190,226,240,0.75)'; g.fillRect(sx + (w >> 1), barY + 6 + R(ph * 14), 1, 2); }
}

/* ------------------------------ the stop-planks and their windlass ------------------------------ */
/* the planks across the water: sx the column's left, top the first row's top, h the height, k 0 down - 1 wound up; wind = the screen point of the sheave over it */
export function drawStopPlanks(g, sx, top, h, k, time) {
  const lift = R(k * h);
  /* the iron grooves: channel iron, a lit inner lip, bolted to the wall */
  for (const gx of [sx - 3, sx + 16]) { rect(g, gx, top - 14, 3, h + 14, T4.iron1); rect(g, gx + (gx < sx ? 2 : 0), top - 14, 1, h + 14, T4.iron3); rect(g, gx + (gx < sx ? 0 : 2), top - 14, 1, h + 14, T4.iron0); for (let y = top - 10; y < top + h; y += 10) px(g, gx + 1, y, T4.iron4); }
  g.save(); g.beginPath(); g.rect(sx - 3, top - 2 * TS, 22, h + 2 * TS); g.clip();
  const n = Math.ceil(h / 6);
  for (let i = 0; i < n; i++) { const yy = top - lift + i * 6;
    rect(g, sx, yy, 16, 6, T4.tar1); rect(g, sx, yy, 16, 1, T4.tar3); rect(g, sx, yy + 5, 16, 1, T4.tar0); rect(g, sx + ((i * 7) % 10) + 2, yy + 2, 3, 1, T4.tar2);
    if (i % 3 === 1) { rect(g, sx, yy + 2, 16, 1, T4.iron2); px(g, sx + 1, yy + 2, T4.iron4); px(g, sx + 14, yy + 2, T4.iron4); } }   /* an iron strap round every third plank */
  const hz = top - lift; for (let x = 0; x < 16; x += 4) { rect(g, sx + x, hz, 2, 6, T4.yel); rect(g, sx + x + 2, hz, 2, 6, T4.tar0); }   /* the top plank is banded yellow and black: the line to look for */
  rect(g, sx, hz, 16, 1, T4.yel); rect(g, sx + 6, hz - 3, 4, 3, T4.iron2); rect(g, sx + 7, hz - 5, 2, 2, T4.iron3); rect(g, sx + 7, hz - 3, 2, 1, T4.iron0);   /* the lifting eye */
  if (k < 0.5) { const wl = top + h - 8; g.fillStyle = 'rgba(46,84,52,0.7)'; g.fillRect(sx, wl, 16, 2); g.fillStyle = 'rgba(88,144,90,0.55)'; for (let x = 0; x < 16; x += 3) g.fillRect(sx + x, wl + 1 + (x % 2), 2, 1); }   /* slime at the waterline */
  g.restore();
  /* the chain from the eye up past the sheave: alternate links */
  for (let y = top - 2 * TS + 6; y < hz - 5; y += 2) { rect(g, sx + 7 + ((y >> 1) & 1), y, 1, 2, (y >> 1) & 1 ? T4.iron3 : T4.iron2); }
  rect(g, sx + 4, top - 2 * TS, 8, 2, T4.iron2); rect(g, sx + 4, top - 2 * TS, 8, 1, T4.iron3);   /* its guide on the ledge's underside */
}
/* the sheave bracket on the ledge over the planks and the rope to the windlass's drum: sx the column's left, ly the ledge top. drum = the windlass's drum on screen */
export function drawSheave(g, sx, ly, drum, k, time) {
  rect(g, sx + 2, ly - 9, 2, 9, T4.iron1); rect(g, sx + 12, ly - 9, 2, 9, T4.iron1); rect(g, sx + 2, ly - 9, 1, 9, T4.iron3); rect(g, sx + 1, ly - 1, 14, 2, T4.iron2); rect(g, sx + 1, ly - 1, 14, 1, T4.iron3);
  g.fillStyle = T4.iron2; g.beginPath(); g.arc(sx + 8, ly - 8, 4, 0, 6.3); g.fill(); g.fillStyle = T4.iron4; g.fillRect(sx + 7, ly - 9, 2, 2); g.strokeStyle = T4.iron0; g.lineWidth = 1; g.beginPath(); g.arc(sx + 8, ly - 8, 4, 0, 6.3); g.stroke();
  if (drum) { const x0 = sx + 8, y0 = ly - 12, x1 = drum[0], y1 = drum[1], sag = k < 1 ? 0 : 3; g.strokeStyle = '#6a5a44'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1); g.stroke();
    g.strokeStyle = '#2a2018'; g.beginPath(); g.moveTo(x0, y0 + 1); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag + 1, x1, y1 + 1); g.stroke(); }
}
/* the windlass: x, y the foot on the ledge, k 0 planks down - 1 wound up (the drum has turned), flash = struck */
export function drawWindlass(g, x, y, k, flash, time) {
  rect(g, x - 9, y - 3, 18, 3, T4.iron1); rect(g, x - 9, y - 3, 18, 1, T4.iron3); for (const bx of [x - 8, x + 6]) { px(g, bx, y - 2, T4.iron4); px(g, bx + 1, y - 2, T4.iron4); }   /* the bedplate, bolted down */
  for (const fx of [x - 7, x + 5]) { rect(g, fx, y - 14, 3, 11, T4.iron2); rect(g, fx, y - 14, 1, 11, T4.iron3); rect(g, fx - 1, y - 15, 5, 2, T4.iron1); }   /* the cast frames, each with a bearing */
  rect(g, x - 5, y - 13, 11, 4, '#7a6a50'); rect(g, x - 5, y - 13, 11, 1, '#a89878');   /* the drum: wound rope */
  for (let i = 0; i < 6; i++) rect(g, x - 5 + i * 2, y - 13 + (i & 1), 1, 4, '#3a2e20'); rect(g, x - 5, y - 9, 11, 1, '#2a2018');
  const a = k * 12, wx = x + 8, wy = y - 11;   /* the ratchet wheel on the shaft's end, the pawl, and the crank */
  g.fillStyle = T4.iron3; g.beginPath(); g.arc(wx, wy, 4, 0, 6.3); g.fill(); g.fillStyle = T4.iron0; g.beginPath(); g.arc(wx, wy, 2, 0, 6.3); g.fill();
  for (let t = 0; t < 8; t++) { const an = a + t * Math.PI / 4; px(g, wx + R(Math.cos(an) * 5), wy + R(Math.sin(an) * 5), T4.iron4); }
  rect(g, wx - 2, wy - 8, 5, 2, T4.iron2); rect(g, wx, wy - 6, 1, 3, T4.iron3);
  g.strokeStyle = flash ? '#ffffff' : '#c8a040'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 7, y - 11); g.lineTo(x - 7 + Math.cos(a + 1) * 9, y - 11 + Math.sin(a + 1) * 9); g.stroke(); g.lineWidth = 1;
  g.fillStyle = flash ? '#ffffff' : '#f0d070'; g.fillRect(R(x - 7 + Math.cos(a + 1) * 9) - 1, R(y - 11 + Math.sin(a + 1) * 9) - 1, 3, 3);   /* the crank's brass handle: the thing to strike */
  rect(g, x - 5, y - 18, 11, 4, '#1a1e22'); rect(g, x - 5, y - 18, 11, 1, '#c8a040'); glyphs(g, 'WIND', x - 5 + 0, y - 17, '#e0b830');   /* a brass plate over it */
}
/* THE DEEP LOCK'S PADDLE GEAR: a rack-and-pinion in a heavy frame, the rack raised when the paddle is (up), a handwheel with spokes and a brass hub */
export function drawPaddleGear(g, x, y, up, flash, ry) {
  rect(g, x - 10, y - 4, 20, 4, T4.iron1); rect(g, x - 10, y - 4, 20, 1, T4.iron3); for (const bx of [x - 9, x + 7]) { px(g, bx, y - 3, T4.iron4); px(g, bx + 1, y - 3, T4.iron4); }
  rect(g, x - 8, y - 28, 3, 25, T4.iron2); rect(g, x - 8, y - 28, 1, 25, T4.iron3); rect(g, x - 1, y - 28, 3, 25, T4.iron2); rect(g, x - 1, y - 28, 1, 25, T4.iron3); rect(g, x - 9, y - 29, 12, 2, T4.iron1); rect(g, x - 9, y - 29, 12, 1, T4.iron3);   /* the frame's two standards and its head */
  const ry0 = up ? y - 27 : y - 16; rect(g, x - 5, ry0, 4, 20, '#4a525a'); for (let k = 0; k < 9; k++) rect(g, x - 6, ry0 + 1 + k * 2, 1, 1, T4.iron4); rect(g, x - 5, ry0, 4, 1, T4.iron4);   /* the rack: it climbs with the paddle */
  rect(g, x - 4, ry0 - 3, 2, 3, '#c8a040');                                                                                                                          /* the paddle's lifting clevis */
  const wx = x + 6, wy = y - 16, a = (ry || 0) / 6; g.strokeStyle = flash ? '#ffffff' : up ? '#8fd160' : '#c8a040'; g.lineWidth = 2; g.beginPath(); g.arc(wx, wy, 7, 0, 6.3); g.stroke(); g.lineWidth = 1;
  g.strokeStyle = T4.iron3; for (let t = 0; t < 4; t++) { const an = a + t * Math.PI / 2; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(an) * 6, wy + Math.sin(an) * 6); g.stroke(); }
  rect(g, wx - 1, wy - 1, 3, 3, '#f0d070'); rect(g, x - 6, wy - 3, 6, 2, T4.iron3);   /* the hub, the pinion shaft */
  rect(g, x + 1, wy - 12, 5, 2, '#cfd8d4'); rect(g, x + 1, wy - 12, 1, 4, T4.iron3);   /* the pawl */
}

/* ------------------------------ the moon shaft ------------------------------ */
/* x0, x1 the shaft's left and right on screen (32 px), top the screen y of row 0, surf the water's screen y under it, bot the roof line (row 14) */
export function drawMoonShaft(g, x0, x1, top, bot, surf, time) {
  const w = x1 - x0;
  /* the iron grating over the top, and the moon in it */
  g.fillStyle = '#9fb8d0'; g.beginPath(); g.arc(x0 + w * 0.5, top + 6, 7, 0, 6.3); g.fill(); g.fillStyle = T4.moon; g.beginPath(); g.arc(x0 + w * 0.5 + 1, top + 5, 5, 0, 6.3); g.fill(); g.fillStyle = '#8aa8c0'; g.fillRect(x0 + w * 0.5 + 2, top + 3, 2, 2);
  for (let x = x0; x <= x1; x += 5) rect(g, x, top, 2, 10, T4.iron1); rect(g, x0 - 2, top + 3, w + 4, 2, T4.iron2); rect(g, x0 - 2, top + 3, w + 4, 1, T4.iron3); rect(g, x0 - 3, top + 9, w + 6, 3, T4.stone2); rect(g, x0 - 3, top + 9, w + 6, 1, T4.stone4);   /* bars, a cross-bar, the kerb */
  /* the shaft of moonlight: a pale wedge, wider at its foot, drifting a little */
  const sw = Math.sin(time * 0.4) * 1.5; g.save(); g.beginPath(); g.rect(x0 - 40, top + 12, w + 80, bot - top - 12 + 200); g.clip();
  const gr = g.createLinearGradient(0, top + 12, 0, surf); gr.addColorStop(0, 'rgba(190,214,236,0.30)'); gr.addColorStop(1, 'rgba(190,214,236,0.14)'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x0 + 2, top + 12); g.lineTo(x1 - 2, top + 12); g.lineTo(x1 + 6 + sw, surf); g.lineTo(x0 - 6 + sw, surf); g.closePath(); g.fill();
  g.fillStyle = 'rgba(210,228,244,0.5)'; for (let i = 0; i < 9; i++) { const ph = (time * 0.12 + i * 0.173) % 1, y = top + 14 + ph * (surf - top - 14), xx = x0 + 3 + ((i * 11) % (w - 4)) + (ph * 6 - 3) * (i % 2 ? 1 : -1); g.fillRect(R(xx), R(y), 1, 1); }   /* dust and damp turning in it */
  g.restore();
  /* the moon pool on the water: a pale ellipse with two slow rings */
  g.fillStyle = 'rgba(190,214,236,0.35)'; g.beginPath(); g.ellipse((x0 + x1) / 2, surf + 1, w * 0.8, 2.5, 0, 0, 6.3); g.fill();
  g.strokeStyle = 'rgba(220,236,250,0.55)'; g.lineWidth = 1; for (let i = 0; i < 2; i++) { const p = (time * 0.35 + i * 0.5) % 1; g.globalAlpha = 1 - p; g.beginPath(); g.ellipse((x0 + x1) / 2, surf + 1, 4 + p * w * 0.7, 1 + p * 2.2, 0, 0, 6.3); g.stroke(); } g.globalAlpha = 1;
}

/* ------------------------------ her light ------------------------------ */
/* drawn over the dark, at the lantern (x, y on screen): lit - a warm reach, its rim on the water and the walls; dimmed - an ember and a short cold ring */
export function drawHerLight(g, x, y, lit, reach, time) {
  const fl = 0.85 + 0.15 * Math.sin(time * 9) + 0.04 * Math.sin(time * 23);
  if (lit) {
    g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 3, x, y, reach); gr.addColorStop(0, 'rgba(255,196,96,' + (0.2 * fl).toFixed(3) + ')'); gr.addColorStop(0.6, 'rgba(255,170,70,' + (0.07 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,70,0)'); g.fillStyle = gr; g.fillRect(x - reach, y - reach, reach * 2, reach * 2); g.restore();
    g.strokeStyle = 'rgba(255,214,130,' + (0.22 + 0.05 * Math.sin(time * 3)).toFixed(3) + ')'; g.lineWidth = 1; g.setLineDash([3, 4]); g.lineDashOffset = -time * 6; g.beginPath(); g.arc(x, y, reach * 0.93, 0, 6.3); g.stroke(); g.setLineDash([]);   /* the edge of what she shows: a dashed rim */
  } else {
    const p = 0.55 + 0.45 * Math.sin(time * 2.2); const gr = g.createRadialGradient(x, y, 0, x, y, 20); gr.addColorStop(0, 'rgba(255,90,40,' + (0.5 * p).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,90,40,0)'); g.fillStyle = gr; g.fillRect(x - 20, y - 20, 40, 40);
    g.fillStyle = '#d04a20'; g.fillRect(R(x) - 1, R(y) - 1, 2, 2); g.fillStyle = '#ff9a5c'; g.fillRect(R(x), R(y) - 1, 1, 1);
    g.strokeStyle = 'rgba(120,150,170,0.28)'; g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); g.arc(x, y, 17, 0, 6.3); g.stroke(); g.setLineDash([]);   /* all you can see: this far */
  }
}
