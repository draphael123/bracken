// towpath_gear.js - THE TOWPATH's MACHINERY, drawn (claude/towpath2art): the lock gates (leaves, balance beams), the staff gauges, the paddle gear, the punts, the mill wheel, the
// sack hoist and its winches, the swing bridges and their capstans, the aqueduct's sluice posts and barge, the basin crane (mast, jib, hook) and its capstans, the lamps (lit,
// unlit, guttering), the keeper's lantern on its hook, the lychgate, the church door, the sunken hulls and masts, the decor (milestones, drowned willows, cattle, bollards, eel
// traps, the gibbet, the keeper's empty armour). Pure drawing on a 2d context g; src/towpath-hands.js owns the state and calls these with screen-space numbers.
// Palette: TC (src/redraw/towpath_tiles.js): wet blue-green stone, grey drowned timber, rust and riveted iron, the lantern amber the only warm.
import { TC } from './towpath_tiles.js';
const R = Math.round;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px1 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const glow = (g, x, y, r, a, col = '255,211,107') => { if (a <= 0.01) return; const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(R(x - r), R(y - r), R(r * 2), R(r * 2)); };
const line = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.lineWidth = 1; };
const AMBER = '#ffd36b', AMBER2 = '#ffb440';
const FLASH = '#fff6c8';

/* ============ THE LOCK GATE: closed, the tile draws the leaf - here its BALANCE BEAM (the white-painted end) and its paddle gear; open, the two leaves folded back in their recesses ============ */
export function drawGate(g, x, top, bot, open, time) {
  const ts = 16;
  if (open) { for (const lx of [x - 1, x + ts - 3]) { rc(g, lx, top - 2, 4, bot - top + 2, '#0c1012'); rc(g, lx + 1, top - 2, 2, bot - top + 2, TC.gate1); for (let y = top + 6; y < bot; y += 10) rc(g, lx, y, 4, 1, TC.iron1); rc(g, lx, top - 2, 4, 2, '#b8c4c0'); rc(g, lx, bot - 3, 4, 3, TC.moss1); }
    rc(g, x + 3, top - 1, ts - 6, 2, TC.iron1); }
  /* the balance beam: a long oak arm laid over the gate's head toward the lower pound, white at the far end (the counterweight), an iron collar at the heel */
  rc(g, x - 30, top - 5, 44, 4, '#0c1012'); rc(g, x - 30, top - 5, 44, 1, TC.wood4); rc(g, x - 30, top - 4, 44, 2, TC.wood2);
  rc(g, x - 36, top - 6, 8, 6, '#c8d4d0'); rc(g, x - 36, top - 6, 8, 1, '#ffffff'); rc(g, x - 36, top - 1, 8, 1, '#7a8a86');
  rc(g, x + 8, top - 6, 5, 6, TC.iron1); rc(g, x + 8, top - 6, 5, 1, TC.iron3);
}
/* ============ THE STAFF GAUGE: a painted post by a gate, banded, the two levels ticked, the water's own float between them ============ */
export function drawGauge(g, x, hi, lo, w, flash) {
  const top = Math.min(hi, lo) - 6, bot = Math.max(hi, lo) + 6;
  rc(g, x - 1, top, 3, bot - top, flash ? FLASH : '#d4dcd8'); for (let y = top + 3; y < bot; y += 6) rc(g, x - 1, y, 3, 3, '#1a2024');
  rc(g, x - 3, hi, 7, 1, '#8fd160'); rc(g, x - 3, lo, 7, 1, '#c8a070'); rc(g, x - 2, top - 2, 5, 2, TC.iron2);
  const wy = Math.max(top, Math.min(bot, w)); rc(g, x - 5, wy - 1, 10, 3, '#0e2a3a'); rc(g, x - 5, wy - 1, 10, 1, '#6ab0e0'); rc(g, x - 4, wy, 8, 1, '#a8dcf4');
}
/* ============ A PUNT: a flat-bottomed lock punt - tarred planking, raked ends, a pale gunwale, thwarts, a quant pole, a lantern hook at the stern ============ */
export function drawPunt(g, x, y, w, time, lit) {
  const bob = Math.round(Math.sin(time * 1.4 + x * 0.05) * 0.5);
  y += bob;
  rc(g, x + 2, y + 6, w - 4, 2, '#0a0e10'); rc(g, x, y, w, 7, '#1c1812'); rc(g, x + 1, y + 1, w - 2, 5, '#2a2418');
  for (let i = 5; i < w - 4; i += 8) rc(g, x + i, y + 1, 1, 6, '#12100c');   /* ribs/planks */
  rc(g, x, y, w, 1, '#8a8a70'); rc(g, x + 1, y + 1, w - 2, 1, '#4a4a3a');   /* gunwale: moon on it */
  for (let i = 0; i < 4; i++) { rc(g, x - 3 + i, y - 1 - i / 2, 2, 2, '#1c1812'); rc(g, x + w + 1 - i, y - 1 - i / 2, 2, 2, '#1c1812'); }   /* raked bow and stern */
  for (let tx = x + 10; tx < x + w - 8; tx += Math.max(14, w / 3)) { rc(g, tx, y - 1, 6, 2, TC.wood3); rc(g, tx, y - 1, 6, 1, TC.wood4); }   /* thwarts */
  rc(g, x + 6, y - 3, w - 18, 1, TC.wood2);   /* the quant pole along her */
  rc(g, x + w - 5, y - 11, 2, 11, TC.wood1); rc(g, x + w - 3, y - 11, 4, 1, TC.wood1); rc(g, x + w, y - 10, 1, 3, TC.wood1);   /* the stern post and its lantern hook */
  rc(g, x + w - 1, y - 7, 3, 4, lit ? AMBER : '#2a2218'); if (lit) glow(g, x + w, y - 5, 14, 0.2);
  rc(g, x + 3, y + 6, 4, 1, TC.moss1); rc(g, x + w - 9, y + 6, 5, 1, TC.moss1);
  for (let i = 0; i < 3; i++) rc(g, x + 8 + i * 4, y - 2 - (i & 1), 3, 2, '#3a3a2c');   /* a coil of rope */
}
/* ============ THE PADDLE GEAR (a lock's sluice winder): an iron post, a ratchet wheel with a crank, a rack - turning while the lock moves ============ */
export function drawPaddle(g, x, y, flash, turning, time, label) {
  const f = flash ? FLASH : null;
  rc(g, x - 3, y - 3, 6, 3, TC.s2); rc(g, x - 3, y - 3, 6, 1, TC.lip2);   /* the stone footing */
  rc(g, x - 2, y - 22, 4, 19, f || '#1c2428'); rc(g, x - 2, y - 22, 1, 19, f || TC.iron2);   /* the post */
  rc(g, x - 5, y - 24, 10, 3, f || TC.iron1); rc(g, x - 5, y - 24, 10, 1, f || TC.iron3);
  rc(g, x + 1, y - 21, 2, 18, f || TC.iron2);   /* the rack */
  for (let i = 0; i < 6; i++) rc(g, x + 1, y - 20 + i * 3, 3, 1, TC.iron0);
  const a = turning ? time * 7 : 0.6; const cx0 = x, cy0 = y - 14;
  g.strokeStyle = f || '#8a949c'; g.lineWidth = 1; g.beginPath(); g.arc(cx0 + 0.5, cy0 + 0.5, 5, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 4; i++) { const aa = a + i * Math.PI / 2; line(g, cx0, cy0, cx0 + Math.cos(aa) * 7, cy0 + Math.sin(aa) * 7, f || '#b0bcc4'); rc(g, cx0 + Math.cos(aa) * 7 - 1, cy0 + Math.sin(aa) * 7 - 1, 2, 2, f || TC.wood4); }
  rc(g, cx0 - 1, cy0 - 1, 3, 3, f || TC.iron3);
  if (label) return label;
}
/* ============ THE CAPSTAN (a swing bridge's): a squat drum on a stone base, four bars, a pawl ring ============ */
export function drawCapstan(g, x, y, flash, time, spin) {
  const f = flash ? FLASH : null;
  rc(g, x - 7, y - 3, 14, 3, f || TC.s2); rc(g, x - 7, y - 3, 14, 1, f || TC.lip2);
  rc(g, x - 5, y - 13, 10, 10, f || TC.wood2); rc(g, x - 5, y - 13, 10, 1, f || TC.wood4); rc(g, x - 5, y - 6, 10, 1, f || TC.iron1); rc(g, x - 5, y - 11, 10, 1, f || TC.iron1);
  rc(g, x - 6, y - 14, 12, 2, f || TC.iron1); rc(g, x - 6, y - 14, 12, 1, f || TC.iron3);
  const a = spin ? time * 3 : 0.5; for (let i = 0; i < 3; i++) { const aa = a + i * 2.09, bx = Math.cos(aa) * 9; rc(g, x + bx - 1, y - 12, 3, 2, f || '#8a7a58'); rc(g, x + bx * 0.5, y - 12, 2, 1, TC.wood3); }
  rc(g, x - 1, y - 18, 2, 5, f || TC.iron2);
}
/* ============ THE WINCH (the sack hoist's): a timber frame, a rope drum with a crank, a rope paying out ============ */
export function drawWinch(g, x, y, flash, time, turning) {
  const f = flash ? FLASH : null;
  rc(g, x - 8, y - 2, 16, 2, f || TC.wood1); rc(g, x - 7, y - 18, 3, 16, f || TC.wood2); rc(g, x + 4, y - 18, 3, 16, f || TC.wood2); rc(g, x - 7, y - 18, 1, 16, f || TC.wood4);
  rc(g, x - 5, y - 16, 10, 7, f || TC.wood3); for (let i = 0; i < 5; i++) rc(g, x - 4 + i * 2, y - 16, 1, 7, TC.wood1);   /* the drum, roped */
  const a = turning ? time * 8 : 1.2; const hx = x + 7, hy = y - 12; line(g, hx, hy, hx + Math.cos(a) * 6, hy + Math.sin(a) * 6, f || '#a8b4bc'); rc(g, hx + Math.cos(a) * 6 - 1, hy + Math.sin(a) * 6 - 1, 3, 3, f || TC.wood4);
  rc(g, x - 8, y - 20, 16, 2, f || TC.iron1); rc(g, x + 3, y - 9, 2, 8, '#6a6a50');   /* the paying rope */
}
/* ============ A SLUICE POST (the aqueduct's): an iron standard, a hand wheel on a spindle, the gate's rack; the lens shows it shut or open ============ */
export function drawSluice(g, x, y, flash, open, time) {
  const f = flash ? FLASH : null;
  rc(g, x - 6, y - 3, 12, 3, f || TC.iron1); rc(g, x - 6, y - 3, 12, 1, f || TC.iron3);
  rc(g, x - 3, y - 22, 6, 19, f || TC.iron1); rc(g, x - 3, y - 22, 1, 19, f || TC.iron3); rc(g, x + 2, y - 22, 1, 19, TC.iron0);
  rc(g, x - 7, y - 25, 14, 3, f || TC.iron2); rc(g, x - 7, y - 25, 14, 1, f || '#b0bcc4');
  const a = open ? time * 5 : 0.3; g.strokeStyle = f || '#8a949c'; g.beginPath(); g.arc(x + 0.5, y - 15 + 0.5, 6, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 3; i++) { const aa = a + i * 2.09; line(g, x, y - 15, x + Math.cos(aa) * 6, y - 15 + Math.sin(aa) * 6, f || '#8a949c'); }
  rc(g, x - 1, y - 16, 3, 3, f || TC.rust1);
  rc(g, x - 2, y - 9, 4, 4, open ? '#2a6a9a' : '#4a3a30'); rc(g, x - 2, y - 9, 4, 1, open ? '#8ad0f0' : '#6a5a48'); if (open) glow(g, x, y - 7, 12, 0.18, '120,200,240');   /* the gate lens */
}
/* ============ THE TOWPATH LAMP: an iron standard with a glazed lantern - lit (a warm point and its halo), unlit (cold glass), guttering (it stutters) ============ */
export function drawLamp(g, x, y, lit, gut, time, arenaLamp) {
  rc(g, x - 3, y - 3, 7, 3, TC.s2); rc(g, x - 3, y - 3, 7, 1, TC.lip2);
  rc(g, x - 1, y - 28, 3, 26, '#1c2226'); rc(g, x - 1, y - 28, 1, 26, TC.iron2); rc(g, x - 2, y - 14, 5, 2, TC.iron1);
  rc(g, x - 5, y - 36, 11, 3, '#1c2226'); rc(g, x - 5, y - 36, 11, 1, TC.iron3);   /* the lantern's crown */
  rc(g, x - 4, y - 33, 9, 8, '#10181c'); rc(g, x - 4, y - 33, 9, 1, TC.iron2); rc(g, x - 4, y - 26, 9, 2, '#1c2226');   /* cage */
  const on = lit && !gut;
  if (on) { rc(g, x - 3, y - 32, 7, 6, AMBER); rc(g, x - 1, y - 31, 3, 4, '#fff4c8'); rc(g, x - 3, y - 32, 1, 6, AMBER2); rc(g, x + 3, y - 32, 1, 6, AMBER2);
    glow(g, x, y - 30, 22, 0.26 + 0.06 * Math.sin(time * 9)); glow(g, x, y - 30, 9, 0.3); }
  else { rc(g, x - 3, y - 32, 7, 6, '#20323a'); rc(g, x - 3, y - 32, 7, 1, '#3a5660'); rc(g, x - 2, y - 31, 1, 4, '#4a6a74'); }
  rc(g, x - 1, y - 38, 3, 2, '#1c2226'); px1(g, x, y - 40, TC.iron3);
}
/* ============ THE KEEPER'S LANTERN on its hook (the hut): a horn-paned lantern hanging from an iron hook on a bracket, lit, a halo ============ */
export function drawHookLantern(g, x, y, time) {
  rc(g, x - 1, y - 32, 2, 4, '#1c2226'); rc(g, x - 1, y - 32, 6, 1, '#1c2226'); rc(g, x + 4, y - 32, 1, 5, '#1c2226'); rc(g, x - 1, y - 22 + 4, 2, 1, '#1c2226');
  rc(g, x - 4, y - 26, 9, 2, '#1c2226'); rc(g, x - 4, y - 24, 9, 9, '#10181c'); rc(g, x - 3, y - 23, 7, 7, AMBER); rc(g, x - 1, y - 22, 3, 5, '#fff4c8'); rc(g, x - 4, y - 15, 9, 2, '#1c2226');
  glow(g, x, y - 20, 26, 0.3 + 0.05 * Math.sin(time * 7)); glow(g, x, y - 20, 10, 0.3);
}
/* ============ THE LYCHGATE: a roofed timber gate over the lane, a slate roof, tarred posts, a bier-rest, a lamp under the ridge ============ */
export function drawLychgate(g, x, y, time) {
  rc(g, x - 20, y - 30, 5, 30, '#10141a'); rc(g, x + 15, y - 30, 5, 30, '#10141a'); rc(g, x - 20, y - 30, 1, 30, TC.wood3); rc(g, x + 15, y - 30, 1, 30, TC.wood3);
  rc(g, x - 20, y - 8, 40, 2, TC.wood2); rc(g, x - 17, y - 6, 34, 1, TC.wood1);   /* the bier rest */
  for (let i = 0; i < 12; i++) { const hw = 26 - i * 2; rc(g, x - hw, y - 44 + i * 1.2 - (i < 0 ? 0 : 0), hw * 2, 2, i % 2 ? '#1c2a30' : '#26363c'); }
  rc(g, x - 26, y - 33, 52, 2, '#0c1214'); for (let i = 0; i < 6; i++) { const hw = 26 - i * 4; rc(g, x - hw, y - 44 + i * 2.2, hw * 2, 2, i % 2 ? '#26363c' : '#2e4248'); rc(g, x - hw, y - 44 + i * 2.2, hw * 2, 1, '#5a7a78'); }
  rc(g, x - 1, y - 48, 3, 4, '#10181c');   /* the ridge finial */
  rc(g, x - 3, y - 31, 6, 7, '#10181c'); rc(g, x - 2, y - 30, 4, 5, AMBER); rc(g, x - 1, y - 29, 2, 3, '#fff4c8'); glow(g, x, y - 28, 30, 0.22 + 0.04 * Math.sin(time * 6));
}
/* ============ THE CHURCH DOOR on its hill: a pointed oak door in a stone arch, a lit window over it ============ */
export function drawChurchDoor(g, x, y, time) {
  rc(g, x - 13, y - 36, 26, 36, TC.s2); rc(g, x - 13, y - 36, 26, 1, TC.lip); rc(g, x - 13, y - 36, 2, 36, TC.s3); for (let i = 0; i < 4; i++) rc(g, x - 13, y - 30 + i * 8, 26, 1, TC.s1);
  rc(g, x - 8, y - 27, 16, 27, '#0c1014'); for (let i = 0; i < 8; i++) rc(g, x - 6 + i * 2 - 1, y - 24 + (i < 4 ? i : 7 - i) * 0, 1, 24, '#241e18'); rc(g, x - 7, y - 26, 14, 26, '#2a2218'); rc(g, x - 7, y - 26, 14, 1, TC.wood3); for (let i = 0; i < 6; i++) rc(g, x - 6 + i * 2, y - 25, 1, 25, '#1a140e');
  rc(g, x - 8, y - 15, 16, 1, TC.iron1); rc(g, x - 8, y - 6, 16, 1, TC.iron1); rc(g, x + 3, y - 14, 2, 3, TC.iron3);
  rc(g, x - 3, y - 35, 6, 8, '#10181c'); rc(g, x - 2, y - 34, 4, 6, AMBER); rc(g, x - 1, y - 33, 2, 4, '#fff4c8'); glow(g, x, y - 31, 32, 0.28 + 0.05 * Math.sin(time * 5));
}
/* ============ THE MILL WHEEL: a breast wheel - iron-hooped rim, timber spokes, board paddles; turning (water running) or still (a stair), weed and drip ============ */
export function drawWheel(g, x, y, r, a, still, time) {
  g.lineWidth = 1;
  for (const rr of [r, r - 2]) { g.strokeStyle = rr === r ? '#0c1012' : TC.wood2; g.lineWidth = 2; g.beginPath(); g.arc(x + 0.5, y + 0.5, rr, 0, Math.PI * 2); g.stroke(); } g.lineWidth = 1;
  g.strokeStyle = TC.iron2; g.beginPath(); g.arc(x + 0.5, y + 0.5, r + 1, -0.9, 0.6); g.stroke();   /* the hoop's moonlit run */
  for (let i = 0; i < 8; i++) { const aa = a + i * Math.PI / 4, ex = x + Math.cos(aa) * r, ey = y + Math.sin(aa) * r;
    line(g, x, y, ex, ey, '#0c1012', 3); line(g, x, y, ex, ey, TC.wood2, 1);
    g.save(); g.translate(ex, ey); g.rotate(aa + Math.PI / 2); rc(g, -5, -2, 10, 4, still ? '#3a4234' : TC.wood3); rc(g, -5, -2, 10, 1, TC.wood4); rc(g, -5, 1, 10, 1, '#0c1012'); if (still) rc(g, -3, -1, 3, 1, TC.moss1); g.restore(); }
  rc(g, x - 4, y - 4, 8, 8, '#0c1012'); rc(g, x - 3, y - 3, 6, 6, TC.iron1); rc(g, x - 3, y - 3, 6, 1, TC.iron3); rc(g, x - 1, y - 1, 2, 2, TC.iron2);
  if (!still) { for (let i = 0; i < 6; i++) { const u = (time * 0.9 + i / 6) % 1, aa = a * 0.2 + i * 1.05; rc(g, x + Math.cos(aa) * (r - 1) * 0.9, y + r - 2 + u * 22, 1, 2, 'rgba(160,210,230,' + (0.55 * (1 - u)).toFixed(2) + ')'); }
    g.strokeStyle = 'rgba(255,107,107,0.3)'; g.setLineDash([3, 4]); g.beginPath(); g.arc(x, y, r + 6, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
  else { for (let i = 0; i < 4; i++) { const u = (time * 0.35 + i / 4) % 1, aa = a + i * 1.7; rc(g, x + Math.cos(aa) * (r - 1), y + Math.sin(aa) * (r - 1) + 3 + u * 6, 1, 2, 'rgba(160,210,230,' + (0.5 * (1 - u)).toFixed(2) + ')'); } }
}
/* ============ A SWING BRIDGE: its stone pivot pier and turntable; the deck (a gantry beam: iron-banded timber on a lattice) turned out of the way ============ */
export function drawBridge(g, pivL, y, len, k, arena) {
  rc(g, pivL - 4, y - 3, 6, 11, '#0c1012'); rc(g, pivL - 3, y - 3, 4, 11, TC.iron1); rc(g, pivL - 3, y - 3, 4, 1, TC.iron3); rc(g, pivL - 6, y + 6, 10, 2, TC.s3);
  if (k > 0.01) { const a = k * Math.PI * 0.42; g.save(); g.translate(pivL, y + 2); g.rotate(-a);
    rc(g, 0, -3, len, 5, '#0c1012'); rc(g, 0, -3, len, 1, TC.wood4); rc(g, 0, -2, len, 3, TC.wood2); for (let i = 5; i < len; i += 8) { rc(g, i, -3, 1, 5, TC.wood1); } rc(g, 0, 1, len, 1, TC.iron1);
    rc(g, 0, -9, len, 1, TC.iron2); for (let i = 0; i <= len; i += 16) rc(g, i, -9, 1, 6, TC.iron1);   /* the rail */
    g.restore(); }
  else { rc(g, pivL, y - 7, len, 1, TC.iron2); for (let i = 0; i <= len; i += 16) rc(g, pivL + i, y - 7, 1, 7, TC.iron1); rc(g, pivL + len, y - 8, 2, 8, TC.iron1); }   /* (across: its rail, over the deck tiles) */
}
/* ============ THE AQUEDUCT: the iron trough's back plate, a barge, the water in it, the break and its fall ============ */
export function drawTroughBack(g, x0, x1, sy, time) {   /* the trough's far wall: riveted plates under a flanged coping, between x0..x1 (screen), its top at sy (the walkway row's top) */
  rc(g, x0, sy - 40, x1 - x0, 40, '#12181c'); for (let x = x0; x < x1; x += 24) { rc(g, x, sy - 40, 1, 40, '#0a0e10'); rc(g, x + 1, sy - 40, 1, 40, TC.iron1); }
  for (let y = sy - 40; y < sy; y += 13) { rc(g, x0, y, x1 - x0, 1, '#0a0e10'); for (let x = x0 + 4; x < x1; x += 6) px1(g, x, y + 2, '#3a444c'); }
  rc(g, x0, sy - 41, x1 - x0, 3, TC.iron2); rc(g, x0, sy - 41, x1 - x0, 1, TC.iron3); rc(g, x0, sy - 38, x1 - x0, 1, '#0a0e10');
  for (let x = x0 + 12; x < x1; x += 48) { rc(g, x, sy - 40, 3, 40, '#1a2026'); rc(g, x, sy - 40, 1, 40, TC.iron2); }   /* the stiffening ribs */
}
export function drawBarge(g, x, y, w, time, dry, lit) {
  const bob = dry ? 0 : Math.round(Math.sin(time * 1.2) * 1);
  y += bob;
  rc(g, x, y + 1, w, 8, '#0a0e10'); rc(g, x + 1, y + 2, w - 2, 7, '#1a1612'); rc(g, x + 1, y + 2, w - 2, 1, '#3a342a');
  for (let i = 6; i < w - 4; i += 9) rc(g, x + i, y + 3, 1, 6, '#0c0a08');
  for (let i = 0; i < 4; i++) { rc(g, x - 4 + i, y - 1 - i / 2 + 1, 2, 3, '#1a1612'); rc(g, x + w + 2 - i, y - 1 - i / 2 + 1, 2, 3, '#1a1612'); }
  rc(g, x + 2, y, w - 4, 3, '#2a241a'); rc(g, x + 2, y, w - 4, 1, '#6a6450');   /* the gunwale, the moon on it */
  rc(g, x + w * 0.35, y - 10, w * 0.3, 10, '#241e16'); rc(g, x + w * 0.35, y - 10, w * 0.3, 2, '#4a4030'); rc(g, x + w * 0.35 + 3, y - 8, 5, 5, lit ? '#8a6a30' : '#0c1014'); rc(g, x + w * 0.35 + 12, y - 8, 5, 5, lit ? '#8a6a30' : '#0c1014');   /* the cabin hatch and its two ports */
  rc(g, x + w - 12, y - 14, 2, 14, TC.wood1); rc(g, x + w - 14, y - 15, 6, 2, TC.wood1);   /* the tiller post */
  rc(g, x + 6, y - 5, 12, 5, '#2a3028'); rc(g, x + 6, y - 5, 12, 1, '#4a5a48');   /* a tarpaulined cargo */
  for (let i = 0; i < 5; i++) { rc(g, x + 10 + i * 12, y + 4, 3, 3, '#3a3a2c'); }   /* rope fenders */
  rc(g, x + w * 0.5 - 7, y + 5, 14, 3, '#b8b4a0'); for (let i = 0; i < 6; i++) px1(g, x + w * 0.5 - 6 + i * 2, y + 6, '#1a1612');   /* her name, painted */
}
/* the water in a running trough, and the cascade through the break */
export function drawTroughWater(g, x0, x1, wy, by, time, water) {
  g.fillStyle = 'rgba(20,52,66,0.6)'; g.fillRect(R(x0), R(wy), R(x1 - x0), R(by - wy));
  rc(g, x0, wy, x1 - x0, 2, 'rgba(176,222,236,0.7)');
  for (let x = x0; x < x1; x += 6) { const wv = Math.sin(time * 3 + x * 0.2); rc(g, x, wy + 3 + (wv > 0 ? 1 : 0), 4, 1, 'rgba(120,180,200,0.45)'); if (wv > 0.8) rc(g, x, wy - 1, 3, 1, 'rgba(230,248,252,0.8)'); }
}
export function drawCascade(g, x, y, h, wBreak, time) {   /* the fall of the trough's water through the break: columns of white and green water, foam at the foot, mist */
  for (let i = 0; i < 10; i++) { const fx = x + i * (wBreak / 10) + Math.sin(i * 1.7) * 3, hh = h - ((time * 90 + i * 23) % 40), len = 24 + (i % 3) * 10;
    rc(g, fx, y, 2, h, 'rgba(120,180,200,0.22)'); for (let k = 0; k < h; k += 14) { const yy = y + ((k + time * 110 + i * 13) % h); rc(g, fx, yy, 2, len / 3, 'rgba(220,242,248,0.62)'); } }
  for (let i = 0; i < 12; i++) { const u = (time * 0.8 + i / 12) % 1; g.fillStyle = 'rgba(210,232,238,' + (0.35 * (1 - u)).toFixed(2) + ')'; g.beginPath(); g.ellipse(x + (i / 11) * wBreak, y + h - u * 14, 8 + u * 6, 3 + u * 3, 0, 0, Math.PI * 2); g.fill(); }
}
/* ============ THE BREAK: sagged iron plates torn off at each end, bent rivets, a dangling rib, fallen arch stones in the gorge ============ */
export function drawBreakEdge(g, x, y, dir) {   /* x: the torn edge, y: the trough's bed row top; dir: +1 the break lies to the right */
  const d = dir;
  for (let i = 0; i < 6; i++) { const w = 16 - i * 2; rc(g, x + (d > 0 ? 0 : -w), y + 8 + i * 5, w, 4, i & 1 ? TC.iron1 : TC.iron0); rc(g, x + (d > 0 ? 0 : -w), y + 8 + i * 5, w, 1, TC.iron2); if (i % 2 === 0) px1(g, x + d * (w - 2), y + 10 + i * 5, TC.rust2); }
  for (let i = 0; i < 3; i++) { rc(g, x + d * (4 + i * 5), y + 10 + i * 12, 1, 18 - i * 3, TC.rust1); rc(g, x + d * (4 + i * 5) - (d > 0 ? 0 : 1), y + 28 + i * 6, 3, 2, TC.rust0); }   /* hanging rebar */
  rc(g, x + d * 2 - (d > 0 ? 0 : 3), y, 3, 8, TC.rust1);
}
/* ============ THE CRANE: a lattice mast, an A-frame jib to the hook's point, a chain and its pulley, a counterweight; the HOOK platform on its chain ============ */
export function drawCrane(g, mx, my, base, jx, jy, hx, hy, w, time) {   /* mast column x mx from my (top) to base; jib tip over the roof at (jx, jy); hook plate at (hx, hy) w wide */
  const mw = 7;
  rc(g, mx - mw / 2, my, mw, base - my, '#10161a'); for (let y = my; y < base; y += 8) { line(g, mx - mw / 2, y, mx + mw / 2, y + 8, TC.iron1); line(g, mx + mw / 2, y, mx - mw / 2, y + 8, TC.iron1); }
  rc(g, mx - mw / 2, my, 1, base - my, TC.iron2); rc(g, mx + mw / 2 - 1, my, 1, base - my, TC.iron0); rc(g, mx - 5, base - 6, 11, 6, TC.s2); rc(g, mx - 5, base - 6, 11, 1, TC.lip2);
  rc(g, mx - 6, my - 4, 13, 4, TC.iron1); rc(g, mx - 6, my - 4, 13, 1, TC.iron3);   /* the head */
  /* the jib: two chords from the head out over the quay to its tip; the counter-jib behind with its weight */
  const tipX = Math.min(jx, mx + 70), tipY = my - 2;
  line(g, mx, my - 3, tipX, tipY, '#10161a', 3); line(g, mx, my - 3, tipX, tipY, TC.iron2, 1);
  line(g, mx, my + 5, tipX, tipY + 4, '#10161a', 2); for (let i = 0; i < 6; i++) { const t = i / 6, tx = mx + (tipX - mx) * t, nx = mx + (tipX - mx) * (t + 1 / 6); line(g, tx, my - 3 + (tipY - my + 3) * t, nx, my + 5 + (tipY + 4 - my - 5) * (t + 1 / 6), TC.iron1); }
  line(g, mx, my - 3, mx - 22, my + 1, '#10161a', 2); rc(g, mx - 30, my - 2, 12, 10, '#1a2024'); rc(g, mx - 30, my - 2, 12, 1, TC.iron3); rc(g, mx - 28, my + 2, 8, 1, TC.iron0);   /* the counterweight */
  line(g, tipX, tipY + 2, hx, hy - 4, '#262a22', 2); line(g, tipX, tipY + 2, hx, hy - 4, '#8a8a70', 1);   /* the chain to the hook */
  rc(g, tipX - 3, tipY - 1, 6, 6, '#1a2024'); rc(g, tipX - 3, tipY - 1, 6, 1, TC.iron3);   /* the pulley block */
}
export function drawHook(g, x, y, w, time, lit) {   /* the hook platform: a plated cradle on a four-chain bridle, a big iron hook above */
  const mid = x + w / 2;
  rc(g, x, y, w, 5, '#0a0e10'); rc(g, x + 1, y, w - 2, 4, TC.iron1); rc(g, x + 1, y, w - 2, 1, TC.iron3); for (let i = 3; i < w - 2; i += 6) px1(g, x + i, y + 1, '#b0bcc4');
  rc(g, x + 2, y + 4, w - 4, 2, TC.wood2); rc(g, x + 2, y + 4, w - 4, 1, TC.wood1);
  line(g, x + 2, y, mid, y - 12, '#2a2e2c'); line(g, x + w - 2, y, mid, y - 12, '#2a2e2c');
  rc(g, mid - 2, y - 14, 4, 4, TC.iron2); rc(g, mid - 1, y - 20, 2, 6, TC.iron1);   /* the shackle */
  g.strokeStyle = TC.iron2; g.lineWidth = 2; g.beginPath(); g.arc(mid + 0.5, y - 22, 4, 0.4, Math.PI * 1.6); g.stroke(); g.lineWidth = 1;
}
export function drawCraneCapstan(g, x, y, flash, time, spin) {   /* the crane's own capstan: a cast-iron drum with a pawl ring and a long bar */
  const f = flash ? FLASH : null;
  rc(g, x - 7, y - 3, 14, 3, f || TC.s2); rc(g, x - 7, y - 3, 14, 1, f || TC.lip2); rc(g, x - 5, y - 13, 10, 10, f || '#262e34'); rc(g, x - 5, y - 13, 10, 1, f || TC.iron3); rc(g, x - 5, y - 8, 10, 1, f || '#0a0e10');
  rc(g, x - 6, y - 14, 12, 2, f || TC.iron2); for (let i = 0; i < 4; i++) px1(g, x - 4 + i * 3, y - 10, '#9aa6ae');
  const a = spin ? time * 2 : 0.7; const bx = Math.cos(a) * 12; line(g, x, y - 12, x + bx, y - 12 + Math.sin(a) * 2, f || '#5a4a38', 2); rc(g, x + bx - 1, y - 14, 3, 4, f || TC.iron1);
}
/* ============ A SUNKEN HULL: the barge's dark ribs and strakes just awash, weed, a broken stem; w px long, facing dir ============ */
export function drawHull(g, x, y, w, tilt, time) {   /* y: the deck's top (the footing). Water laps it; ribs stand up broken at one end */
  g.save(); g.translate(x, y); g.rotate(tilt || 0);
  rc(g, 0, 0, w, 4, '#0a0c0e'); rc(g, 0, 0, w, 3, '#1c1812'); rc(g, 0, 0, w, 1, '#5a5a44'); for (let i = 6; i < w - 4; i += 10) { rc(g, i, 1, 1, 3, '#0a0806'); }
  rc(g, 0, 4, w, 12, '#100e0a'); for (let i = 0; i < w; i += 7) rc(g, i, 4, 2, 12, '#1c1812'); rc(g, 0, 4, w, 1, '#2a241a');   /* the hull's strakes under the deck, in the water */
  rc(g, 2, 14, w - 4, 2, TC.moss0);
  for (let i = 0; i < 4; i++) { rc(g, w - 10 + i * 3, -6 - (i % 2) * 5, 2, 8 + (i % 2) * 5, '#1c1812'); rc(g, w - 10 + i * 3, -6 - (i % 2) * 5, 2, 1, '#4a4a38'); }   /* the broken ribs */
  rc(g, 8, -7, 10, 7, '#1a1610'); rc(g, 8, -7, 10, 1, '#4a4a38'); rc(g, 10, -5, 3, 3, '#05080a');   /* the cabin, stove in */
  g.restore();
}
export function drawMast(g, x, y, h, tall, time) {   /* a sunken barge's mast: a pole from the deck up, a crosstree and rigging, a tatter of sail; the tall one carries a pennant */
  rc(g, x - 1, y - h, 3, h, '#161410'); rc(g, x - 1, y - h, 1, h, '#4a4a38'); rc(g, x - 5, y - h + 12, 11, 2, '#161410'); rc(g, x - 5, y - h + 12, 11, 1, '#4a4a38');
  line(g, x, y - h, x - 12, y - 4, '#2a2a22'); line(g, x, y - h, x + 12, y - 4, '#2a2a22'); line(g, x - 5, y - h + 12, x - 14, y - 2, '#22221c');
  const fl = Math.sin(time * 2.4 + x) * 2; for (let i = 0; i < 6; i++) rc(g, x + 2 + i, y - h + 14 + i + (i > 3 ? fl : 0), 1, 8 - i, '#2a2a22');   /* the sail's tatter */
  if (tall) { rc(g, x, y - h - 8, 1, 8, '#161410'); for (let i = 0; i < 7; i++) rc(g, x + 1 + i, y - h - 8 + Math.round(Math.sin(time * 4 + i * 0.7)), 1, 3 - Math.floor(i / 3), '#5a2a26'); }
  for (let i = 0; i < 4; i++) rc(g, x + 6 - i, y - 4 + i, 1, 2, TC.moss1);
}
/* ============ DECOR ============ */
export function drawDecor(g, d, x, y, time, o = {}) {
  const k = d.kind;
  if (k === 'milestone') { rc(g, x - 4, y - 12, 8, 12, TC.s2); rc(g, x - 4, y - 12, 8, 1, TC.lip); rc(g, x - 3, y - 14, 6, 2, TC.s3); rc(g, x - 4, y - 12, 1, 12, TC.s3); rc(g, x - 2, y - 9, 4, 1, TC.s0); rc(g, x - 2, y - 6, 3, 1, TC.s0); for (let i = 0; i < 3; i++) px1(g, x - 3 + i * 2, y - 1, TC.moss2); }
  else if (k === 'willow') { rc(g, x - 3, y - 26, 6, 26, '#0c100e'); rc(g, x - 3, y - 26, 1, 26, '#2a3a30'); rc(g, x - 8, y - 30, 8, 5, '#0c100e'); rc(g, x + 2, y - 36, 5, 12, '#0c100e');   /* the trunk and its two limbs */
    for (let i = -4; i <= 4; i++) { const len = 20 - Math.abs(i) * 2 + ((i * 7) & 3), sw = Math.round(Math.sin(time * 0.9 + i) * 1.2); for (let j = 0; j < len; j++) rc(g, x + i * 4 + Math.round(Math.sin(j * 0.3 + i) * 1) + (j > len * 0.6 ? sw : 0), y - 36 + Math.abs(i) * 2 + j, 1, 1, j % 5 === 4 ? '#3a6048' : j & 1 ? '#18302a' : '#10241e'); }
    rc(g, x - 16, y - 40, 32, 5, '#10241e'); rc(g, x - 11, y - 43, 22, 4, '#18302a'); rc(g, x - 6, y - 45, 12, 3, '#10241e'); }
  else if (k === 'cattle') { const f = (d.x & 1) ? -1 : 1; rc(g, x - 11, y - 12, 22, 8, '#161a18'); rc(g, x - 11, y - 12, 22, 1, '#3a4a42'); rc(g, x + (f > 0 ? 8 : -14), y - 14, 7, 7, '#161a18'); rc(g, x + (f > 0 ? 13 : -14), y - 15, 2, 3, '#2a2a22'); rc(g, x - 9, y - 4, 2, 4, '#10140f'); rc(g, x - 3, y - 4, 2, 4, '#10140f'); rc(g, x + 3, y - 4, 2, 4, '#10140f'); rc(g, x + 8, y - 4, 2, 4, '#10140f');
    rc(g, x - f * 12, y - 12, 2, 7, '#10140f'); px1(g, x + (f > 0 ? 13 : -9), y - 12, '#5a6a68'); }
  else if (k === 'bollard') { rc(g, x - 4, y - 9, 8, 9, '#10161a'); rc(g, x - 5, y - 10, 10, 3, '#1c2428'); rc(g, x - 5, y - 10, 10, 1, TC.iron3); rc(g, x - 4, y - 9, 1, 9, TC.iron2); rc(g, x + 1, y - 7, 6, 1, '#5a5a44'); rc(g, x + 5, y - 6, 1, 4, '#5a5a44'); }
  else if (k === 'eeltrap') { g.strokeStyle = '#4a4a34'; g.beginPath(); g.ellipse(x + 0.5, y - 5 + 0.5, 8, 5, 0, 0, Math.PI * 2); g.stroke(); for (let i = -2; i <= 2; i++) rc(g, x + i * 3, y - 8, 1, 6, '#3a3a2a'); rc(g, x - 8, y - 5, 16, 1, '#4a4a34'); rc(g, x + 7, y - 9, 6, 1, '#2a2a22'); px1(g, x + 13, y - 9, '#5a5a44'); }
  else if (k === 'gibbet') { rc(g, x - 2, y - 46, 4, 46, '#10100e'); rc(g, x - 2, y - 46, 1, 46, '#3a3a2e'); rc(g, x - 2, y - 46, 18, 3, '#10100e'); rc(g, x + 13, y - 43, 1, 7, '#4a4a3a');
    const sw = Math.round(Math.sin(time * 1.1 + d.x) * 1); rc(g, x + 9 + sw, y - 36, 9, 14, '#0a0c0c'); for (let i = 0; i < 4; i++) { rc(g, x + 10 + sw + i * 2, y - 36, 1, 14, '#6a6a56'); } rc(g, x + 9 + sw, y - 36, 9, 1, '#6a6a56'); rc(g, x + 9 + sw, y - 23, 9, 1, '#6a6a56'); rc(g, x + 12 + sw, y - 30, 3, 3, '#1a1a18'); }
  else if (k === 'mast') { /* the sunken barges' masts are drawn with the hulls (drawMast): a stub only */ }
  else if (k === 'emptyArmour') drawEmptyArmour(g, x, y, time);
  else if (k === 'fogKnight') { if (d.gone || d.a <= 0.02) return; g.globalAlpha = 0.32 * d.a; drawKnightShape(g, x, y, time); g.globalAlpha = 1; }
}
/* THE KEEPER'S ARMOUR on its stand: rust-black plate hung on a post, empty, fog in the visor, a boat-hook leaned against it (B8: what became of him) */
export function drawEmptyArmour(g, x, y, time) {
  rc(g, x - 1, y - 5, 3, 5, '#1a1612'); rc(g, x - 5, y - 2, 11, 2, '#1a1612');   /* the stand's foot */
  rc(g, x - 4, y - 13, 3, 9, '#0e0c0c'); rc(g, x + 1, y - 13, 3, 9, '#0e0c0c'); rc(g, x - 4, y - 13, 1, 9, '#4a3a30');   /* greaves */
  rc(g, x - 6, y - 31, 12, 18, '#16120f'); rc(g, x - 6, y - 31, 12, 1, '#6a5444'); rc(g, x - 6, y - 31, 1, 18, '#4e3a2c'); rc(g, x - 6, y - 21, 12, 1, '#0a0808'); rc(g, x - 6, y - 15, 12, 2, '#241c16');
  rc(g, x - 9, y - 30, 4, 7, '#16120f'); rc(g, x + 5, y - 30, 4, 7, '#16120f'); rc(g, x - 9, y - 30, 4, 1, '#6a5444'); rc(g, x + 5, y - 30, 4, 1, '#6a5444');   /* pauldrons */
  rc(g, x - 4, y - 41, 8, 10, '#14100e'); rc(g, x - 4, y - 41, 8, 1, '#6a5444'); rc(g, x - 4, y - 41, 1, 10, '#4e3a2c'); rc(g, x - 3, y - 36, 7, 1, '#06080a');   /* the great helm and its slit */
  const a = 0.45 + 0.2 * Math.sin(time * 1.3); g.globalAlpha = a; rc(g, x - 3, y - 37, 6, 3, '#cfdde6'); g.globalAlpha = 1;   /* the fog in the visor */
  for (let i = 0; i < 3; i++) { const u = (time * 0.4 + i / 3) % 1; g.globalAlpha = 0.4 * (1 - u); rc(g, x + 2 + u * 5, y - 36 - u * 6, 2, 2, '#cfdde6'); g.globalAlpha = 1; }
  rc(g, x + 8, y - 30, 2, 30, '#3a2c20'); rc(g, x + 7, y - 33, 4, 4, '#6a6a56');   /* the boat hook */
  rc(g, x - 4, y - 25, 1, 5, '#2e4a32');   /* weed */
}
/* the knight's shape in the fog (B8 foreshadow): a pale plate-shaped patch */
function drawKnightShape(g, x, y, time) {
  rc(g, x - 7, y - 32, 14, 20, '#d8e0e8'); rc(g, x - 5, y - 12, 4, 12, '#d8e0e8'); rc(g, x + 1, y - 12, 4, 12, '#d8e0e8'); rc(g, x - 5, y - 42, 10, 10, '#d8e0e8'); rc(g, x + 8, y - 40, 2, 34, '#d8e0e8');
  rc(g, x - 3, y - 38, 6, 2, '#9ad0ff');
}
/* the dozing man's z */
export function drawZ(g, x, y, time) { /* the caller draws text */ }
