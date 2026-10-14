// deeprails4_poses.js - DEEP RAILS 4's ART PASS pieces (claude/dr4art, Sonnet): the Great Drill's per-attack windup poses (B16), the jam's slump set and its steam-hiss lift, the rail
// raiders' tub / throw / boarding poses, the twin lines' crossover gantry and the raiders' siding. Plain pixel rects on the screen; no per-frame bake. (deeprails4_art.js holds the gear
// tower, the jam fx, the tunnel floor and the side switch.)
import { MP, glow } from './minecart_backdrop.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };

/* B16 - THE RIG'S OWN WINDUP POSE PER GEAR-DRIVEN ATTACK (drawn over the rig; the hands tilt / heave the whole rig). kind: 'dyn' | 'lunge' | 'chain' | 'roof'; k 0..1 through the tell.
   dyn: the cab's roof HATCH flips open and a bundle of sticks rises on the arm, fuse lit. lunge: the rig CROUCHES - rams compress under the deck, dust blows off the tracks, the plate's
   lamps flare. chain: it REARS BACK - the rear housing hatch drops and the chain pays out of it, ratchet sparks. roof: the ROOF JIB on the cab strikes up at the ceiling, debris shaking down. */
export function windupPose(g, rx, lanes, ceilY, cabIn, cabW, cabH, kind, k, time) {
  const L0 = lanes[0], L1 = lanes[1], cx0 = rx + cabIn, ct = L1 - cabH, mid = cx0 + R(cabW / 2);
  if (kind === 'dyn') { const lift = R(7 * k);
    g.save(); g.translate(cx0 + 4, ct - 5); g.rotate(-1.1 * Math.min(1, k * 2)); rc(g, 0, -2, cabW - 8, 2, '#8a7660'); rc(g, 0, -1, cabW - 8, 1, '#2a2018'); g.restore();   /* the hatch lid, thrown back */
    for (let i = 0; i < 3; i++) { rc(g, mid - 4 + i * 3, ct - 6 - lift, 2, 7, '#d8402a'); rc(g, mid - 4 + i * 3, ct - 6 - lift, 2, 1, '#f08070'); }   /* the sticks rising */
    rc(g, mid - 4, ct - 3 - lift, 8, 1, '#c8c0a8'); const fz = Math.floor(time * 12) % 2; rc(g, mid - 3, ct - 9 - lift - fz, 1, 2, '#ffd36b'); rc(g, mid - 3, ct - 11 - lift, 1, 1, '#fff4c0');
    add(g, () => { g.globalAlpha = 0.5 * k; g.drawImage(glow(14, '255,170,70'), mid - 14, ct - 12 - lift - 14); }); }
  else if (kind === 'lunge') { const sq = R(3 * k);
    for (const px of [rx + 14, rx + 46]) { rc(g, px, L0 - 22 + sq, 4, 8 - sq, '#9aa0ac'); rc(g, px - 1, L0 - 14, 6, 3, '#2a2830'); rc(g, px, L0 - 24, 4, 3, MP.i4); }   /* the rams, squashing down */
    for (let i = 0; i < 8; i++) { const t = (time * 2.4 + i / 8) % 1; g.fillStyle = 'rgba(150,130,110,' + (0.6 * k * (1 - t)).toFixed(2) + ')'; g.fillRect(R(rx + 4 + i * 8 + t * 6), R(L0 - 4 - t * 12), 4 + R(t * 5), 3 + R(t * 3)); }   /* dust off the tracks */
    add(g, () => { g.globalAlpha = 0.25 + 0.5 * k; g.drawImage(glow(20, '255,90,60'), rx - 8, L0 - 22 - 20); }); }
  else if (kind === 'chain') {
    rc(g, rx + 3, L0 - 14, 24, 4, '#1c1a22'); g.save(); g.translate(rx + 3, L0 - 10); g.rotate(0.9 * Math.min(1, k * 2)); rc(g, -22, -1, 22, 3, '#4a4852'); rc(g, -22, -1, 22, 1, MP.i4); g.restore();   /* the rear hatch dropping open */
    for (let i = 0; i < 9; i++) { const d = (i * 5 + time * 40 * k) % 40; rc(g, rx - 4 - d, L0 - 14 + (i & 1) + R(d * d / 160), 3, 2, i % 2 ? '#9aa0ac' : '#5a5e68'); }   /* the chain paying out */
    for (let i = 0; i < 3; i++) if (Math.floor(time * 16 + i) % 2) rc(g, rx + 10 + i * 6, L0 - 12, 1, 1, '#ffd36b'); }   /* ratchet sparks */
  else if (kind === 'roof') { const up = R(10 * k + Math.sin(time * 40) * 1.2 * k), bx = cx0 + cabW - 6;
    rc(g, bx, ct - 3, 5, 4, '#2a2830'); rc(g, bx + 1, ct - 3 - up, 3, up + 1, '#9aa0ac'); rc(g, bx, ct - 6 - up, 5, 4, '#e05a3a'); rc(g, bx, ct - 6 - up, 5, 1, '#ffd36b');   /* the jib's pick, striking up */
    for (let i = 0; i < 5; i++) rc(g, bx - 10 + ((i * 7 + R(time * 60)) % 22), ceilY + 4 + ((i * 11 + R(time * 90)) % 40), 1, 2, '#8a7660'); }   /* the roof shaking loose */
}
/* THE JAM'S LIFT (steam hiss as the slump comes back up): vents on the bit and the gear housing; k 0..1 */
export function steamHiss(g, bitX, bitY, gx, gy, k, time) { if (!(k > 0)) return;
  for (const [vx, vy, n] of [[bitX, bitY - 6, 6], [gx, gy - 4, 5]]) for (let i = 0; i < n; i++) { const t = (time * 1.6 + i / n) % 1; g.fillStyle = 'rgba(230,236,244,' + (0.55 * k * (1 - t)).toFixed(2) + ')'; g.fillRect(R(vx + (i - n / 2) * 2 + Math.sin(time * 3 + i) * 3), R(vy - t * 34), 4 + R(t * 9), 4 + R(t * 6)); } }
/* THE JAM'S SLUMP, the extra pose pieces over the rig: the roof lamp out, the driver's stars wheeling round his head, a bent control rod and a red fault lamp */
export function slumpPose(g, rx, lanes, cabIn, cabW, cabH, k, time) { if (!(k > 0.2)) return;
  const ct = lanes[1] - cabH, cx0 = rx + cabIn, gm = cx0 + R(cabW / 2) - 2;
  rc(g, gm - 3, ct - 9, 6, 5, '#14101a');
  for (let i = 0; i < 3; i++) { const a = time * 4 + i * 2.09; rc(g, gm - 1 + Math.cos(a) * 7, ct + 2 + Math.sin(a) * 2, 1, 1, i === 1 ? '#fff6b0' : '#ffd36b'); }
  rc(g, cx0 + cabW - 6, ct + 26, 3, 9, '#2a2830'); rc(g, cx0 + cabW - 8, ct + 33, 7, 2, '#c0302a');
  if (Math.floor(time * 3) % 2) rc(g, cx0 + 2, ct + 28, 3, 3, '#ff4030'); }
/* THE RAIL RAIDER'S TUB (a miner variant, no new foe): a raid livery over the goblin tub - a red and black hazard band, a boarding plank racked along the rim, a grapple hook coil.
   tell: 0 none | 1 THROW (his arm back, a pick raised over his head) | 2 BOARDING (he crouches on the rim, coiled - the plank itself is raidPlank) */
export function raiderTub(g, x, y, time, tell) { x = R(x); y = R(y);
  for (let i = -9; i < 9; i += 4) { rc(g, x + i, y - 6, 2, 3, '#d8402a'); rc(g, x + i + 2, y - 6, 2, 3, '#1a1612'); }
  rc(g, x - 12, y - 13, 16, 1, '#8a6a40'); rc(g, x - 12, y - 14, 16, 1, '#b08a50'); rc(g, x - 13, y - 14, 1, 2, '#6a4a2a');
  rc(g, x + 6, y - 14, 4, 4, '#3a3a44'); rc(g, x + 7, y - 13, 2, 2, '#9aa0ac'); rc(g, x + 8, y - 15, 1, 1, '#9aa0ac');
  if (tell === 1) { const sw = Math.floor(time * 10) % 2; rc(g, x - 7, y - 21 - sw, 2, 9, '#4a7a30'); rc(g, x - 9, y - 27 - sw, 2, 8, '#6a4a2a'); rc(g, x - 12, y - 28 - sw, 8, 2, '#9aa0ac'); rc(g, x - 12, y - 27 - sw, 2, 3, '#9aa0ac'); }
  if (tell === 2) { rc(g, x - 7, y - 17, 11, 5, '#4a7a30'); rc(g, x - 7, y - 17, 11, 1, '#6aa048'); rc(g, x - 8, y - 20, 5, 3, '#4a7a30'); rc(g, x - 6, y - 19, 2, 1, '#ff4030'); rc(g, x - 2, y - 19, 2, 1, '#ff4030'); rc(g, x + 4, y - 14, 4, 2, '#4a7a30'); }
}
/* THE CROSSOVER GANTRY (the twin lines' landmark): two lattice legs from the yard floor up past the HIGH line, a crossbar with a travelling crane hook, lamps and a hazard plate.
   yHi / yLo: the two rail surfaces (screen y) */
export function gantry(g, x, yHi, yLo, time) { const top = yHi - 40, w = 40;
  for (const lx of [x - w / 2, x + w / 2 - 4]) { rc(g, lx, top, 4, yLo - top, '#2a2830'); rc(g, lx, top, 1, yLo - top, MP.i4); g.strokeStyle = '#4a4852'; g.lineWidth = 1; for (let y = top + 4; y < yLo - 4; y += 8) { g.beginPath(); g.moveTo(lx, y); g.lineTo(lx + 4, y + 8); g.stroke(); } }
  rc(g, x - w / 2 - 3, top - 2, w + 6, 6, '#34323c'); rc(g, x - w / 2 - 3, top - 2, w + 6, 1, MP.i4); for (let i = 0; i < w + 6; i += 6) rc(g, x - w / 2 - 3 + i, top + 3, 3, 1, ((i / 6) & 1) ? '#e8b830' : '#1a1612');
  const tx = x + R(Math.sin(time * 0.5) * 12); rc(g, tx - 3, top + 4, 7, 4, '#c8a040'); rc(g, tx, top + 8, 1, 14, '#8a8a96'); rc(g, tx - 2, top + 22, 5, 3, '#9aa0ac'); rc(g, tx - 2, top + 24, 1, 2, '#9aa0ac'); rc(g, tx + 2, top + 24, 1, 2, '#9aa0ac');
  rc(g, x - 8, top - 8, 16, 6, '#14121a'); rc(g, x - 7, top - 7, 14, 4, '#e8b830'); rc(g, x - 6, top - 6, 2, 2, '#1a1612'); rc(g, x - 2, top - 6, 2, 2, '#1a1612'); rc(g, x + 2, top - 6, 2, 2, '#1a1612');
  for (const lx of [x - w / 2 + 1, x + w / 2 - 3]) add(g, () => { g.globalAlpha = 0.55 + 0.15 * Math.sin(time * 4 + lx); g.drawImage(glow(18, '255,160,64'), lx - 16, top - 14); }); }
/* THE SIDING at the yard's end (where the raiders peel off): a rail stub falling away, a buffer stop, a red lamp on a post, a hazard sign. yLo: the low rail surface */
export function siding(g, x, yLo, time) {
  for (let i = 0; i < 10; i++) { const dy = R(i * i / 14); rc(g, x + i * 2, yLo + 1 + dy, 3, 1, MP.i4); rc(g, x + i * 2, yLo + 3 + dy, 3, 1, MP.i2); if (i % 3 === 0) rc(g, x + i * 2, yLo + 4 + dy, 3, 2, '#5a3a22'); }
  rc(g, x + 20, yLo + 6, 3, 8, '#c0302a'); rc(g, x + 19, yLo + 5, 5, 2, '#e8b830');
  rc(g, x - 8, yLo - 14, 2, 14, '#3a3844'); rc(g, x - 10, yLo - 18, 6, 4, '#ff4030'); add(g, () => { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 5); g.drawImage(glow(14, '255,70,50'), x - 17, yLo - 25); });
  rc(g, x - 16, yLo - 26, 8, 6, '#e8b830'); for (let i = 0; i < 4; i++) rc(g, x - 16 + i * 2, yLo - 26, 1, 6, '#1a1612'); }
