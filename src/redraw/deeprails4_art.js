// deeprails4_art.js - DEEP RAILS 4's GREYBOX-READABLE pieces (claude/deeprails4, the Opus mechanics lane; the Sonnet art lane finishes them): THE GREAT DRILL's GEAR TOWER
// (four banks up its rear face, each driving one attack: spinning, spun-up on its attack's windup, cracked and smoking when broken, shuttered when not in the phase), its JAMMED
// read (the slump: the head jams and smokes, sparks, the driver knocked silly - src/great-drill-hands.js eases it in and lifts it as the window closes), the tunnel's FLOOR
// (the walkway under the low line: plates, an edge lip, the rail bed - Daniel's 10-12 photo read the old brick courses as a wall), the SWITCH-SIDES track's pieces (the
// side switch, the overhead beam, the gap's lip) and the RAIL RAIDERS' cart (a goblin cart alongside). Plain pixel rects on the screen; no per-frame bake.
import { MP, glow } from './minecart_backdrop.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
const HAZ = ['#e8b830', '#1a1612'];

/* a toothed gear: n teeth, radius r, turned a; col / hub / tooth-light */
function gear(g, x, y, r, a, col, colL, n = 8) {
  g.fillStyle = col; g.beginPath(); for (let i = 0; i < n * 2; i++) { const aa = a + i * Math.PI / n, rr = i % 2 ? r - 2 : r + 1; g.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } g.closePath(); g.fill();
  g.fillStyle = colL; g.beginPath(); g.arc(x, y, r - 3, Math.PI * 1.05, Math.PI * 1.75); g.lineTo(x, y); g.fill();
  g.fillStyle = '#14100e'; g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill();
  for (let k = 0; k < 3; k++) { const aa = a + k * 2.094; rc(g, x + Math.cos(aa) * (r - 4) - 0.5, y + Math.sin(aa) * (r - 4) - 0.5, 1, 1, '#14100e'); }   /* (spokes: the turn reads) */
}
/* THE GEAR TOWER (B10/B14 read: a bank is a thing to hit). banks: [{ id, label, x, t, b, state: 'up' | 'broken' | 'off', hot (0..1: its attack winding up), k (health 0..1), flash, smoke (s since broken) }].
   x = the rear face (screen px). A riveted mast up the rear face holds them; each bank: a housing, its gear, a label, health pips */
export function gearTower(g, x, top, bot, banks, time) {
  rc(g, x - 2, top, 4, bot - top, '#2a2830'); rc(g, x - 2, top, 1, bot - top, MP.i4); for (let y = top + 6; y < bot; y += 10) rc(g, x - 1, y, 2, 1, MP.i5);   /* the mast */
  for (const b of banks) { const h = b.b - b.t, cy = (b.t + b.b) / 2, r = Math.max(5, Math.min(8, h / 2 - 1));
    if (b.state === 'off') { rc(g, x - 7, b.t, 14, h, '#24222a'); rc(g, x - 7, b.t, 14, 1, '#4a4852'); for (let y = b.t + 3; y < b.b - 1; y += 4) rc(g, x - 6, y, 12, 1, '#1a1820'); continue; }   /* (not in this phase: a shutter over it) */
    rc(g, x - 9, b.t - 1, 18, h + 2, '#14121a'); rc(g, x - 9, b.t - 1, 18, 1, MP.i3);   /* its housing */
    if (b.state === 'broken') {   /* CRACKED, STOPPED, SMOKING: hanging off its axle, a tooth gone, sparks dripping, a plume */
      g.save(); g.translate(R(x), R(cy + 2)); g.rotate(0.5); gear(g, 0, 0, r, 0.3, '#4a3a34', '#6a5a50'); g.restore();
      rc(g, x - 2, cy - r, 5, 2, '#14121a'); rc(g, x + 1, cy - 3, 1, 7, '#14121a');   /* the crack */
      for (let i = 0; i < 4; i++) { const t = (time * 0.8 + i * 0.25) % 1; g.fillStyle = 'rgba(80,76,84,' + (0.6 * (1 - t)).toFixed(2) + ')'; g.fillRect(R(x - 4 + Math.sin(time * 2 + i) * 3 - t * 14), R(b.t - t * 26), 5 + R(t * 6), 4 + R(t * 4)); }
      if (Math.floor(time * 7 + b.t) % 3 === 0) { const t = (time * 3) % 1; rc(g, x + 2, cy + 2 + t * 10, 1, 1, '#ffd36b'); }
      continue; }
    const hot = b.hot || 0, spin = time * (2.5 + hot * 14), col = b.flash > 0 ? '#ffffff' : hot > 0 ? '#ff5a3a' : '#b8302a', colL = hot > 0 ? '#ffd36b' : '#e8604a';
    if (hot > 0) add(g, () => { g.globalAlpha = 0.35 + 0.35 * hot; g.drawImage(glow(18, '255,120,60'), x - 18, cy - 18); });   /* B16: ITS ATTACK WINDS UP - the gear spins up, glows, whirs */
    gear(g, x, cy, r, spin, col, colL);
    if (hot > 0) for (let i = 0; i < 3; i++) { const aa = time * 20 + i * 2.1; rc(g, x + Math.cos(aa) * (r + 3), cy + Math.sin(aa) * (r + 3), 1, 1, '#ffd36b'); }
    const pips = 4, on = Math.ceil(b.k * pips - 1e-6); for (let i = 0; i < pips; i++) rc(g, x - 7 + i * 4, b.b + 1, 3, 1, i < on ? '#8fd160' : '#3a2a26');   /* its health, in four pips */
  }
}
/* THE JAMMED READ (Daniel 10-12: "a clear vulnerable animation, not only the gold outline"): the head jams and SMOKES, sparks spit from the gears and the bit, the driver is
   knocked silly (stars). k: 0..1, how far into the slump (the hands ease it in and lift it out). bitX/bitY: the bit's root; gx/gy: the gear housing; cabX/cabY: over the driver */
export function jamFx(g, k, bitX, bitY, gx, gy, cabX, cabY, time) { if (!(k > 0)) return;
  for (let i = 0; i < 7; i++) { const t = (time * 0.7 + i / 7) % 1; g.fillStyle = 'rgba(' + (i % 2 ? '60,56,62' : '96,90,96') + ',' + (0.65 * k * (1 - t)).toFixed(2) + ')'; g.fillRect(R(bitX + 6 + Math.sin(time * 1.7 + i) * 6 - t * 22), R(bitY - 10 - t * 46), 7 + R(t * 12), 6 + R(t * 8)); }   /* the head, smoking */
  for (let i = 0; i < 10; i++) { const t = (time * 2.4 + i * 0.1) % 1, sx = (i % 2 ? bitX : gx) + ((i * 7) % 9) - 4, sy = (i % 2 ? bitY : gy) - 4; rc(g, sx + (i % 3 - 1) * t * 26, sy - t * 30 + t * t * 40, 1, 1, i % 3 ? '#ffd36b' : '#ff9a3c'); }   /* sparks */
  if (k > 0.5) for (let i = 0; i < 3; i++) { const a = time * 5 + i * 2.09; rc(g, cabX + Math.cos(a) * 9, cabY + Math.sin(a) * 3, 2, 2, i === 1 ? '#fff6b0' : '#ffd36b'); }   /* the driver, knocked silly */
}
/* THE TUNNEL's FLOOR (Daniel 10-12 photo: the brick courses under the low line read as a WALL, yet the line runs on them): a WALKWAY - riveted floor plates under the line,
   an edge lip, and the rail bed below falling away in rows (lighter near, darker deep): a floor seen from above, not a wall seen from in front. off: the near pace */
export function tunnelFloor(g, x0, w, yFloor, vh, off) {
  rc(g, x0, yFloor, w, vh - yFloor + 4, '#17121a');
  const pt = yFloor + 2, ph = 10; rc(g, x0, pt, w, ph, '#3e3a44'); rc(g, x0, pt, w, 1, '#77727e'); rc(g, x0, pt + ph - 1, w, 1, '#2a2630');
  for (let x = x0 - 32 - (off % 32); x < x0 + w + 32; x += 32) { rc(g, x, pt, 1, ph, '#25222b'); rc(g, x + 1, pt, 1, ph, '#58545f'); rc(g, x + 4, pt + 2, 1, 1, MP.i5); rc(g, x + 4, pt + ph - 3, 1, 1, MP.i5); rc(g, x + 27, pt + 2, 1, 1, MP.i5); rc(g, x + 27, pt + ph - 3, 1, 1, MP.i5);
    for (let k = 8; k < 24; k += 4) rc(g, x + k, pt + 4, 2, 1, '#4a4650'); }   /* diamond tread */
  for (let x = x0 - 8 - (off % 8); x < x0 + w + 8; x += 8) rc(g, x, pt + ph, 4, 2, HAZ[0]); rc(g, x0, pt + ph + 2, w, 1, '#0c0a0e');   /* the edge lip */
  for (let r = 0, y = pt + ph + 4, gap = 3; y < vh + 4; r++, y += gap, gap += 1) { const sh = Math.max(0, 0.55 - r * 0.07); g.fillStyle = 'rgba(120,100,90,' + sh.toFixed(2) + ')';   /* the bed: rows of ballast, foreshortened */
    for (let x = x0 - 12 - ((off * (1 - r * 0.06)) % 12) + (r % 2) * 6; x < x0 + w + 12; x += 12) g.fillRect(R(x), R(y), 3, 1); }
}
/* (deeprails4) SWITCH-SIDES: the side switch (a tall two-armed post: its arm points to the side it will put you on), the OVERHEAD BEAM on the duck side, and a broken-rail lip */
export function sideSwitch(g, x, y, up, flash, time) {
  rc(g, x - 1, y - 30, 3, 30, '#3a3844'); rc(g, x - 1, y - 30, 1, 30, MP.i4); rc(g, x - 4, y - 3, 9, 3, '#24222a');
  const a = up ? -0.9 : 0.9; g.save(); g.translate(R(x), R(y - 24)); g.rotate(a); rc(g, 0, -1, 12, 3, flash > 0 ? '#ffffff' : '#c8a040'); rc(g, 10, -2, 4, 5, '#e05a3a'); g.restore();
  rc(g, x - 3, y - 34, 7, 4, up ? '#8fd160' : '#5ab0ff'); add(g, () => { g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 6); g.drawImage(glow(10, up ? '140,220,100' : '90,170,255'), x - 10, y - 42); });
}
/* A GOBLIN RAIDER'S CART alongside on the other line (RAIL RAIDERS): a battered open cart, a hook pole, a lantern; boarding: the plank out */
export function raiderCart(g, x, y, state, time) {
  rc(g, x - 13, y - 13, 26, 11, '#4a3020'); rc(g, x - 13, y - 13, 26, 2, '#7a5030'); rc(g, x - 12, y - 6, 24, 1, '#2a1a10');
  for (const wx of [x - 8, x + 8]) { rc(g, wx - 3, y - 3, 6, 4, '#24222a'); rc(g, wx - 1, y - 2, 2, 2, MP.i4); }
  rc(g, x + 10, y - 26, 1, 13, '#6a4a2a'); rc(g, x + 9, y - 28, 3, 3, '#ffd36b'); add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(14, '255,200,90'), x - 4, y - 41); });
  if (state === 'plank') { rc(g, x - 30, y - 12, 18, 2, '#8a6a40'); rc(g, x - 30, y - 12, 18, 1, '#b08a50'); }
}
