// deeprails5_art.js - DEEP RAILS 5's art (claude/dr5art, the Sonnet art pass over the Opus greybox): the Great Drill's SPARE CUTTER (its boom's windup, the disc rolling at you or struck
// back) and RAIL CLAW (the winch paying out, the claw dropping on its chain, the marked stretch, the TORN RAIL); THE FOREMAN's LOADING BOOM (a lattice jib, its hook and bucket) and his
// TIPPED ORE (a heave over his back, lumps rolling down the loop); THE PARKED CART's GATE at every hand-off (a barrier arm, hazard stripes, a lamp; it swings up when you land in the tub);
// THE SPOIL PITS' set pieces (the catwalk's trestles down to the pit floor, and the goblins' old SPOIL TIPPLE + conveyor, the area's landmark).
// Plain rects and a few arcs on the screen; no bake. Every piece keeps its read (B10/B16): the windup is its own pose, the tell is drawn where it will hurt.
import { MP, glow } from './minecart_backdrop.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
const line = (g, x0, y0, x1, y1, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.lineWidth = 1; };
const HAZ = ['#e8b830', '#1a1612'];
/* a LATTICE ARM from (x0,y0) to (x1,y1): two iron chords and zig-zag bracing - reads as a built boom, not a stick */
function lattice(g, x0, y0, x1, y1, th, col, colL) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len * th, ny = dx / len * th, n = Math.max(2, Math.round(len / 7));
  line(g, x0 + nx, y0 + ny, x1 + nx, y1 + ny, 2, colL); line(g, x0 - nx, y0 - ny, x1 - nx, y1 - ny, 2, col);
  g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n, s = i % 2 ? 1 : -1; g.moveTo(x0 + dx * a + nx * s, y0 + dy * a + ny * s); g.lineTo(x0 + dx * b - nx * s, y0 + dy * b - ny * s); } g.stroke();
}

/* B16 - THE DRILL's windup for its two new attacks (drawn on the tilted rig). cutter: the spin-up boom lifts a spare cutter disc off the rig's rear and swings it down to the line;
   claw: the chain winch pays out and a three-pronged claw drops behind the rig onto the line it will rip. lane: the line it aims at */
export function windupPose5(g, rx, lanes, kind, k, lane, time) {
  const ly = lanes[lane] ?? lanes[0];
  if (kind === 'cutter') { const a = -1.2 + 1.5 * k, bx = rx + 6, by = lanes[0] - 40, len = 26, dx = bx - Math.cos(a) * len, dy = by - Math.sin(a) * len;
    rc(g, bx - 5, by - 3, 10, 8, '#2a2830'); rc(g, bx - 5, by - 3, 10, 1, MP.i4); rc(g, bx - 3, by + 5, 6, 3, '#14121a');   /* the boom's mount on the rig's rear */
    lattice(g, bx, by, dx, dy, 1.6, '#4a4e5a', '#8a8e9a');   /* the boom, braced */
    rc(g, bx - 2, by - 2, 4, 4, '#b8302a'); rc(g, bx - 1, by - 1, 2, 2, '#ffd36b');   /* its red pivot gear (the spin-up bank's colour) */
    cutterDisc(g, R(dx), R(dy), 8, time * (0.5 + 2 * k), false);
    if (k > 0.3) add(g, () => { g.globalAlpha = 0.3 + 0.5 * k; g.drawImage(glow(14, '255,150,70'), R(dx) - 14, R(dy) - 14); });   /* the disc glows as it spins up */
    if (k > 0.5) for (let i = 0; i < 3; i++) { const t = (time * 7 + i / 3) % 1; rc(g, dx + 6 + t * 12, dy + 4 + t * t * 16, 1, 1, i % 2 ? '#ffd36b' : '#ff9a3c'); }   /* sparks off its teeth */ }
  else if (kind === 'claw') { const drop = R((ly - (lanes[0] - 30)) * Math.min(1, k * 1.4)), x = rx - 6, y0 = lanes[0] - 30;
    rc(g, x - 7, y0 - 8, 14, 6, '#2a2830'); rc(g, x - 7, y0 - 8, 14, 1, MP.i4); rc(g, x - 5, y0 - 7, 3, 4, '#9aa0ac'); rc(g, x + 1, y0 - 7, 3, 4, '#5a5e68');   /* the winch drum paying out */
    for (let i = 0; i < 8; i++) { const yy = y0 - 2 + i * (drop + 8) / 8; rc(g, x - 1 + (i & 1), yy, 2, 2, i % 2 ? '#9aa0ac' : '#5a5e68'); }   /* the chain */
    const cy = y0 + drop; rc(g, x - 3, cy - 3, 8, 3, '#2a2830'); rc(g, x - 3, cy - 3, 8, 1, MP.i4);   /* the claw's head */
    for (const [o, lean] of [[-6, -2], [0, 0], [6, 2]]) { rc(g, x + o + lean * 0.5, cy, 2, 3, '#8a8e9a'); rc(g, x + o + lean, cy + 3, 2, 4, '#c8ccd4'); rc(g, x + o + lean * 1.5, cy + 7, 1, 2, '#ffffff'); }   /* three hooked prongs */
    if (k > 0.8 && Math.floor(time * 20) % 2) { rc(g, x - 8, ly - 2, 16, 1, '#ffd36b'); rc(g, x - 3, ly - 4, 1, 2, '#ff9a3c'); rc(g, x + 4, ly - 5, 1, 3, '#ff9a3c'); } }   /* its bite sparks on the rail */
}
/* THE SPARE CUTTER: a toothed saw disc spinning (gold when it has been struck back), blurred rim, hub and bolts, sparks off the rail */
export function cutterDisc(g, x, y, r, time, back) {
  const a0 = time * (back ? -18 : 18), base = back ? '#ffd36b' : '#8a8e9a', mid = back ? '#fff0a0' : '#b8bcc8', dark = back ? '#b08418' : '#3a3c46';
  g.fillStyle = dark; g.beginPath(); for (let i = 0; i < 16; i++) { const a = a0 + i * Math.PI / 8, rr = i % 2 ? r - 1 : r + 2.5; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill();   /* the teeth */
  g.fillStyle = base; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = mid; g.beginPath(); g.arc(x, y, r - 2, Math.PI * 1.05, Math.PI * 1.7); g.lineTo(x, y); g.fill();   /* a lit sweep: it reads as spinning */
  g.strokeStyle = dark; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r - 3.5, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#1a181e'; g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 3; i++) { const a = a0 * 0.5 + i * 2.094; rc(g, x + Math.cos(a) * (r - 4) - 0.5, y + Math.sin(a) * (r - 4) - 0.5, 1, 1, '#14121a'); }   /* three bolts */
  if (back) { g.globalAlpha = 0.5; g.strokeStyle = '#fff4c0'; g.beginPath(); g.arc(x, y, r + 3, a0, a0 + 2.2); g.stroke(); g.globalAlpha = 1; }   /* STRUCK BACK: a gold ring of speed */
  else for (let i = 0; i < 3; i++) if (Math.floor(time * 24 + i) % 2) rc(g, x + r + 2 + i * 3, y + r - 1 - (i & 1), 1, 1, i ? '#ffb070' : '#ffe49a');   /* sparks off the rail */
}
/* THE CLAW's mark: the stretch it will rip, red and blinking, through its tell (k 0..1) - hazard chevrons on the sleepers it will take */
export function tearMark(g, x0, x1, y, k, time) {
  const on = Math.floor(time * (8 + 10 * k)) % 2; g.fillStyle = 'rgba(255,70,60,' + (0.25 + 0.45 * k).toFixed(2) + ')'; g.fillRect(x0, y - 4, x1 - x0, 5);
  g.fillStyle = 'rgba(255,60,50,' + (0.08 + 0.18 * k).toFixed(2) + ')'; g.fillRect(x0, y - 22, x1 - x0, 18);   /* a red column over the stretch: it is the air above it that is dangerous too */
  if (on) for (let x = x0; x < x1; x += 10) { rc(g, x, y - 7, 5, 2, '#ff6b6b'); rc(g, x + 1, y - 9, 3, 1, '#ffb0a0'); }
  for (let x = x0 + 3; x < x1 - 4; x += 8) { rc(g, x, y - 16, 2, 1, on ? '#ff6b6b' : '#a03028'); rc(g, x + 1, y - 15, 2, 1, on ? '#ff6b6b' : '#a03028'); rc(g, x, y - 14, 2, 1, on ? '#ff6b6b' : '#a03028'); }   /* chevrons that point at the rail */
  rc(g, x0, y - 12, 1, 12, '#ff6b6b'); rc(g, x1 - 1, y - 12, 1, 12, '#ff6b6b'); rc(g, x0, y - 12, 4, 1, '#ff6b6b'); rc(g, x1 - 4, y - 12, 4, 1, '#ff6b6b');
}
/* A TORN STRETCH: the rail ripped up - bent ends curled up, snapped sleepers and splinters, a black gap where the line was, a spark of the break */
export function tornRail(g, x0, x1, y, time) {
  rc(g, x0, y - 3, x1 - x0, 7, '#0c0a0c'); rc(g, x0, y - 3, x1 - x0, 1, '#2a1e18');   /* the gap, its lip */
  for (let x = x0 + 6; x < x1 - 4; x += 14) { rc(g, x, y + 2, 6, 2, '#3a2a1e'); rc(g, x + 1, y + 2, 2, 1, '#6a4a2a'); }   /* what is left of the sleepers' stubs */
  for (let x = x0 + 4; x < x1 - 6; x += 17) { rc(g, x, y - 6, 1, 3, '#c8b890'); rc(g, x + 3, y - 5, 1, 2, '#a89870'); rc(g, x + 1, y - 7, 1, 1, '#e8d8b0'); }   /* splinters of timber standing in the gap */
  for (const [ex, dir] of [[x0, 1], [x1, -1]]) { g.strokeStyle = '#6a6e78'; g.lineWidth = 2; g.beginPath(); g.moveTo(ex, y - 2); g.quadraticCurveTo(ex + dir * 5, y - 2, ex + dir * 6, y - 8); g.quadraticCurveTo(ex + dir * 6, y - 11, ex + dir * 3, y - 12); g.stroke();   /* the bent, curled rail ends */
    g.strokeStyle = '#a8acb8'; g.lineWidth = 1; g.beginPath(); g.moveTo(ex + dir * 1, y - 3); g.quadraticCurveTo(ex + dir * 5, y - 3, ex + dir * 6, y - 9); g.stroke(); }
  g.lineWidth = 1;
  if (Math.floor(time * 6) % 2) { rc(g, x0 + 2, y - 4, 1, 1, '#ff9a3c'); rc(g, x1 - 3, y - 4, 1, 1, '#ff9a3c'); rc(g, x0 + 8, y - 7, 1, 1, '#ffd36b'); }
}
/* THE FOREMAN's LOADING BOOM: k 0..1 the windup (it rises behind him on its A-frame, its hook circling, the red line along head height), then the swing (sw 0..1) back down the loop at head height */
export function fmBoom(g, x, topY, k, sw, reach, headY, time) {
  rc(g, x - 4, topY - 2, 8, 6, '#3a2a1e'); rc(g, x - 4, topY - 2, 8, 1, MP.t4); rc(g, x - 2, topY + 4, 4, 8, '#2a2830');   /* the pivot post on his cart */
  if (sw <= 0) { const a = -1.9 - 0.6 * k, len = 30, ex = x + Math.cos(a) * len, ey = topY + Math.sin(a) * len;
    lattice(g, x, topY, ex, ey, 2.8, '#5a4a34', '#c8a868');   /* the jib, a built lattice */
    rc(g, x - 1, topY - 3, 3, 3, '#e05a3a');
    const ha = time * 9, hx = ex + Math.cos(ha) * 4, hy = ey + 7 + Math.sin(ha) * 3; line(g, ex, ey, hx, hy - 3, 1, '#c8c0a8');   /* the cable and its circling hook */
    rc(g, hx - 2, hy - 3, 4, 3, '#3a3c46'); rc(g, hx - 1, hy, 2, 3, '#c8ccd4'); rc(g, hx - 2, hy + 3, 2, 1, '#c8ccd4');
    g.fillStyle = 'rgba(255,90,70,' + (0.12 + 0.25 * k).toFixed(2) + ')'; g.fillRect(x - reach, headY - 3, reach, 6);
    if (Math.floor(time * (6 + 10 * k)) % 2) for (let xx = x - reach + 4; xx < x - 4; xx += 18) rc(g, xx, headY - 1, 6, 2, '#ff6b6b');   /* the line it will sweep, flashing */
    return; }
  const hx = x - reach * Math.min(1, sw * 1.2); lattice(g, x, topY, hx, headY, 2.8, '#5a4a34', '#c8a868');
  rc(g, hx - 5, headY - 4, 10, 8, '#2a2830'); rc(g, hx - 5, headY - 4, 10, 2, '#c8ccd4'); rc(g, hx - 4, headY + 2, 2, 5, '#e05a3a'); rc(g, hx + 2, headY + 2, 2, 5, '#e05a3a');   /* the hook block, at head height: it hits */
  for (let i = 1; i < 5; i++) rc(g, hx + i * 7, headY - 1, 3, 1, 'rgba(255,255,255,0.4)');   /* the swept air behind it */
  for (let i = 0; i < 4; i++) rc(g, hx + 6 + i * 6, headY + ((i * 5) & 3) - 2, 4, 1, 'rgba(255,230,180,' + (0.45 - i * 0.1).toFixed(2) + ')');
}
/* THE FOREMAN's TIPPED ORE: a lump rolling back down the loop at you (turning), a shadow and a dust trail */
export function oreLump(g, x, y, time) {
  const a = -time * 7 + x * 0.1; rc(g, x - 7, y - 1, 14, 2, 'rgba(0,0,0,0.3)');   /* its shadow on the loop */
  g.fillStyle = '#4a3e34'; g.beginPath(); for (let i = 0; i < 9; i++) { const aa = a + i * Math.PI * 2 / 9, rr = i % 2 ? 5.6 : 6.8; g.lineTo(x + Math.cos(aa) * rr, y - 6 + Math.sin(aa) * rr); } g.closePath(); g.fill();   /* a rough lump */
  g.fillStyle = '#6a5a48'; g.beginPath(); g.arc(x - 1, y - 7, 4, 0, Math.PI * 2); g.fill();
  for (const [o, p, c] of [[0, 0, '#e8c070'], [2, 1.7, '#3aa87c'], [4, 3.6, '#d8a050']]) { rc(g, x + Math.cos(a + p) * (2 + o * 0.4) - 1, y - 6 + Math.sin(a + p) * (2 + o * 0.4), 2, 2, c); }   /* gold fleck, copper green vein: it is ore */
  rc(g, x - 5, y - 11, 3, 1, '#9a8a7a');
  for (let i = 1; i < 4; i++) { g.fillStyle = 'rgba(150,130,110,' + (0.4 - i * 0.1).toFixed(2) + ')'; g.fillRect(R(x + 6 + i * 5), R(y - 3 - (i % 2)), 3, 2); }
}
/* THE GATE past a parked cart (on-foot stretches): two posts with lamp caps, a barrier arm striped red and gold, a chain and a padlock; open = the arm swung UP on its pivot and the lamp green.
   The swing is remembered per gate so a gate that has just opened swings (and a clank of sparks) instead of snapping */
const gateAnim = new Map();
export function cartGate(g, x, yTop, yBot, open, time) {
  const key = Math.round(x / 8), st = gateAnim.get(key) || { open: !!open, t0: -9 };
  if (st.open !== !!open) { st.open = !!open; st.t0 = time; } gateAnim.set(key, st);
  const sw = open ? Math.min(1, Math.max(0, (time - st.t0) / 0.45)) : 0, swing = open ? (st.t0 < -8 ? 1 : sw) : 0, h = yBot - yTop;
  rc(g, x - 3, yTop, 4, h, '#3a3640'); rc(g, x - 3, yTop, 1, h, MP.i4); rc(g, x - 3, yBot - 3, 6, 3, '#24222a');   /* the hinge post */
  rc(g, x + 13, yTop, 4, h, '#3a3640'); rc(g, x + 13, yTop, 1, h, MP.i4); rc(g, x + 12, yBot - 3, 6, 3, '#24222a');   /* the catch post */
  const lampOn = open ? '#8fd160' : (Math.floor(time * 3) % 2 ? '#ff6b6b' : '#7a2a24'); rc(g, x - 2, yTop - 4, 2, 4, '#24222a'); rc(g, x - 2, yTop - 6, 3, 3, lampOn); rc(g, x + 14, yTop - 4, 2, 4, '#24222a'); rc(g, x + 14, yTop - 6, 3, 3, lampOn);
  if (!open || swing < 1) add(g, () => { g.globalAlpha = 0.5; g.drawImage(glow(8, open ? '140,220,100' : '255,80,60'), x - 9, yTop - 14); });
  const ang = -swing * 1.35, ax = x + 1, ay = yTop + 8;   /* the arm: pivots on the hinge post, swings UP */
  g.save(); g.translate(ax, ay); g.rotate(ang);
  rc(g, 0, -2, 14, 5, '#24222a'); for (let i = 0; i < 14; i += 4) rc(g, i, -1, 2, 3, (i / 4) & 1 ? HAZ[0] : '#b83a2a'); rc(g, 0, -2, 14, 1, MP.i4);   /* the barrier arm, red and gold */
  for (let i = 0; i < 4; i++) { rc(g, i * 4 - 1 + 2, 3, 1, 8 - ((i & 1) * 2), '#8a8e9a'); }   /* the dropped bars (a gate of rails) */
  g.restore();
  if (!open) { rc(g, x + 9, yTop + 12, 6, 6, '#a07a46'); rc(g, x + 10, yTop + 10, 4, 3, '#c8ccd4'); rc(g, x + 11, yTop + 14, 2, 2, '#14121a'); rc(g, x + 3, yTop + 6, 8, 2, '#ffd36b'); }   /* the padlock on the catch, the arm's gold label */
  if (open && swing < 1) { for (let i = 0; i < 4; i++) rc(g, x + 6 + i * 3, yTop + 2 - i + ((time * 40) % 4), 1, 1, i & 1 ? '#fff4c0' : '#ffd36b'); }   /* the clank: sparks as it goes */
}
/* THE JUMP-IN MOMENT: a ring of sparks and a flash of dust off the tub as you land in it (k 0..1) */
export function boardBurst(g, x, y, k) {
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + 0.3, d = 4 + k * 20, up = Math.sin(a) < 0 ? 1 : 0.4; rc(g, x + Math.cos(a) * d, y - 6 + Math.sin(a) * d * up, 2, 2, i % 3 ? '#ffd36b' : '#fff4c0'); }
  g.globalAlpha = 0.45 * (1 - k); rc(g, x - 12 - k * 8, y - 2, 24 + k * 16, 3, '#b0a090'); g.globalAlpha = 1;
}
/* THE CATWALK's TRESTLES (the spoil pits): a timber bent every third plank from the walk down to the pit floor or the low walk under it, braced between, a sill on the footing.
   sx: the bent's x on screen; yTop/yBot: the planks' underside and the footing; seed picks the weathering; next: another bent follows (cross-braced) */
export function pitTrestle(g, sx, yTop, yBot, next, seed) {
  const h = yBot - yTop; if (h <= 2) return;
  rc(g, sx, yTop, 5, h, MP.t1); rc(g, sx, yTop, 1, h, MP.t3); rc(g, sx + 4, yTop, 1, h, MP.t0); rc(g, sx + 2, yTop, 1, h, MP.t2);   /* a squared leg */
  for (let y = yTop + 9; y < yBot - 6; y += 16) { rc(g, sx - 1, y, 7, 2, MP.i2); rc(g, sx - 1, y, 7, 1, MP.i4); rc(g, sx + 1, y, 1, 1, MP.i5); }   /* iron straps */
  rc(g, sx - 3, yTop, 11, 3, MP.t2); rc(g, sx - 3, yTop, 11, 1, MP.t4); rc(g, sx - 3, yTop + 3, 11, 1, MP.t0);   /* the cap beam under the planks */
  rc(g, sx - 2, yTop + 3, 2, 5, MP.t1); rc(g, sx + 5, yTop + 3, 2, 5, MP.t1);   /* corbels */
  rc(g, sx - 4, yBot - 3, 13, 3, MP.t0); rc(g, sx - 4, yBot - 3, 13, 1, MP.t2);   /* the sill */
  if (next) for (let y0 = yTop + 6; y0 + 22 <= yBot - 4; y0 += 24) { const dir = ((seed + (y0 >> 4)) & 1) ? 1 : -1; for (let i = 0; i <= 38; i++) { const t = i / 38; rc(g, sx + 5 + i, dir > 0 ? y0 + t * 22 : y0 + 22 - t * 22, 1, 2, MP.t2); } }   /* diagonal bracing to the next bent */
}
/* THE SPOIL TIPPLE + CONVEYOR (the pits' landmark, Daniel's brief: the goblins' old spoil workings): a head-frame tower with a hopper and a tipping skip, and a long timber conveyor gantry that runs
   to it with a belt of broken spoil crawling up it. Drawn in the world, behind the catwalk. x: the tower's foot centre; yBase: the low walk's line; span: the gantry's length (px) to the left of it */
export function spoilTipple(g, x, yBase, span, time) {
  const gy = yBase - 118;   /* the conveyor's top run */
  /* the gantry: a long lattice of timber with a belt on top, a pair of piers every 56 px */
  rc(g, x - span, gy + 6, span, 4, '#14100e');
  for (let px_ = x - span + 20; px_ < x - 12; px_ += 56) { rc(g, px_, gy - 120, 2, 128, '#3a3c46'); rc(g, px_, gy - 120, 1, 128, MP.i4); for (let y = gy - 100; y < gy; y += 14) rc(g, px_ - 1, y, 4, 2, MP.i2); rc(g, px_ - 3, gy + 6, 8, 3, MP.t2); }   /* hanger rods up to the roof: the belt hangs, it never stands on the walk */
  lattice(g, x - span, gy + 14, x - 12, gy + 14, 3, '#2e1b0e', '#5a3a1e');
  rc(g, x - span, gy + 2, span, 4, '#26222a'); rc(g, x - span, gy + 2, span, 1, '#4a4652');   /* the belt */
  for (let i = 0, off = (time * 22) % 14; x - span + off + i * 14 < x - 14; i++) { const bx = x - span + off + i * 14; rc(g, bx, gy - 1 - (i % 3 === 0 ? 2 : 0), 6, 3 + (i % 3 === 0 ? 2 : 0), i & 1 ? '#5a4636' : '#3a2a20'); rc(g, bx + 1, gy - 1, 2, 1, '#9a8a64'); }   /* lumps of spoil riding up it */
  for (let rx = x - span + 10; rx < x - 12; rx += 56) { rc(g, rx - 3, gy, 7, 7, '#3a3c46'); rc(g, rx - 3, gy, 7, 1, MP.i4); const a = time * 5 + rx; rc(g, rx + Math.cos(a) * 2, gy + 3 + Math.sin(a) * 2, 1, 1, '#c8ccd4'); }   /* idler rollers, turning */
  /* the tower: a head-frame, four legs, cross-braced, a hopper under the belt's end and a skip tipped on its rail */
  const tw = 30, tt = yBase - 150;
  rc(g, x - 12, tt, 4, yBase - tt - 30, MP.t2); rc(g, x + tw - 18, tt, 4, yBase - tt - 30, MP.t2); rc(g, x - 12, tt, 1, yBase - tt - 30, MP.t4); rc(g, x + tw - 18, tt, 1, yBase - tt - 30, MP.t4);
  for (let y = tt + 6; y < yBase - 40; y += 26) { line(g, x - 12, y, x + tw - 14, y + 24, 2, MP.t1); line(g, x + tw - 14, y, x - 12, y + 24, 2, '#3a2412'); rc(g, x - 12, y, tw - 2, 2, MP.t2); }
  rc(g, x - 16, tt - 6, tw + 6, 7, '#2a2830'); rc(g, x - 16, tt - 6, tw + 6, 1, MP.i4);   /* the head frame's cap */
  const wa = time * 2.2; g.fillStyle = '#3a3c46'; g.beginPath(); g.arc(x + 1, tt - 12, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#14121a'; g.beginPath(); g.arc(x + 1, tt - 12, 6, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 6; i++) { const aa = wa + i * Math.PI / 3; rc(g, x + 1 + Math.cos(aa) * 7 - 1, tt - 12 + Math.sin(aa) * 7 - 1, 2, 2, '#9aa0ac'); rc(g, x + 1 + Math.cos(aa) * 3 - 0.5, tt - 12 + Math.sin(aa) * 3 - 0.5, 1, 1, '#5a5e68'); }   /* the head-wheel: spokes turning */
  const hop = yBase - 60; g.fillStyle = '#2e1b0e'; g.beginPath(); g.moveTo(x - 18, hop - 20); g.lineTo(x + 20, hop - 20); g.lineTo(x + 10, hop + 6); g.lineTo(x - 8, hop + 6); g.closePath(); g.fill();   /* the hopper */
  rc(g, x - 18, hop - 20, 38, 2, MP.t4); rc(g, x - 8, hop + 6, 18, 3, MP.i3);
  for (let i = 0; i < 4; i++) { const t = (time * 1.4 + i * 0.25) % 1; rc(g, x - 2 + (i & 1) * 3, hop + 9 + t * 40, 2, 3, '#5a4636'); }   /* spoil let down the chute */
  const sk = Math.sin(time * 0.6) > 0.55; g.save(); g.translate(x + 28, tt + 30); g.rotate(sk ? 0.8 : 0); rc(g, -7, -4, 14, 9, '#3a2a20'); rc(g, -7, -4, 14, 2, '#8a6a46'); rc(g, -5, 5, 3, 3, '#14121a'); rc(g, 3, 5, 3, 3, '#14121a'); g.restore();   /* the tipping skip */
  rc(g, x - 14, tt + 36, 3, 3, '#ffb050'); add(g, () => { g.globalAlpha = 0.4 + 0.2 * Math.sin(time * 4); g.drawImage(glow(18, '255,170,80'), x - 14 - 16, tt + 36 - 16); });   /* a lantern on the frame: the way ahead glints */
}
