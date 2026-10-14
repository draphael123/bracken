// deeprails5_art.js - DEEP RAILS 5's GREYBOX pieces (claude/deeprails5, Opus; the Sonnet art lane replaces them): the Great Drill's SPARE CUTTER (its boom's windup, the disc
// rolling at you or struck back) and RAIL CLAW (the claw dropping on its chain, the marked stretch, the torn rail coming down the tunnel); THE FOREMAN's LOADING BOOM (its swing at
// head height) and his TIPPED ORE (lumps rolling back down the loop); THE PARKED CART's GATE at the end of every on-foot stretch (shut until you jump into the cart).
// Plain rects on the screen; no bake. Every piece keeps its read (B10/B16): the windup is its own pose, the tell is drawn where it will hurt.
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };

/* B16 - THE DRILL's windup for its two new attacks (drawn on the tilted rig). cutter: the spin-up boom lifts a spare cutter disc off the rig's rear and swings it down to the line;
   claw: the chain winch pays out and a three-pronged claw drops behind the rig onto the line it will rip. lane: the line it aims at */
export function windupPose5(g, rx, lanes, kind, k, lane, time) {
  const ly = lanes[lane] ?? lanes[0];
  if (kind === 'cutter') { const a = -1.2 + 1.5 * k, bx = rx + 6, by = lanes[0] - 40, len = 26, dx = bx - Math.cos(a) * len, dy = by - Math.sin(a) * len;
    g.strokeStyle = '#6a6e78'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx, by); g.lineTo(dx, dy); g.stroke(); g.lineWidth = 1;   /* the boom */
    cutterDisc(g, R(dx), R(dy), 8, time * (0.5 + 2 * k), false); }
  else if (kind === 'claw') { const drop = R((ly - (lanes[0] - 30)) * Math.min(1, k * 1.4)), x = rx - 6, y0 = lanes[0] - 30;
    for (let i = 0; i < 8; i++) rc(g, x, y0 + i * (drop + 6) / 8, 2, 2, i % 2 ? '#9aa0ac' : '#5a5e68');   /* the chain paying out */
    const cy = y0 + drop; rc(g, x - 5, cy - 1, 12, 3, '#4a4852'); for (const o of [-5, 0, 5]) rc(g, x + o, cy + 2, 2, 5, '#c8ccd4');   /* the claw's three prongs */
    if (k > 0.8 && Math.floor(time * 20) % 2) rc(g, x - 8, ly - 2, 16, 1, '#ffd36b'); }   /* its bite sparks on the rail */
}
/* THE SPARE CUTTER: a toothed disc spinning (gold when it has been struck back) */
export function cutterDisc(g, x, y, r, time, back) {
  g.fillStyle = back ? '#ffd36b' : '#9aa0ac'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a2830'; g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
  const a0 = time * (back ? -18 : 18); for (let i = 0; i < 6; i++) { const a = a0 + i * Math.PI / 3; rc(g, x + Math.cos(a) * (r + 1) - 1, y + Math.sin(a) * (r + 1) - 1, 3, 3, back ? '#fff4c0' : '#e8ecf0'); }
  if (!back) for (let i = 0; i < 3; i++) if (Math.floor(time * 24 + i) % 2) rc(g, x + r + 2 + i * 3, y + r - 1, 1, 1, '#ffb070');   /* sparks off the rail */
}
/* THE CLAW's mark: the stretch it will rip, red and blinking, through its tell (k 0..1) */
export function tearMark(g, x0, x1, y, k, time) {
  const on = Math.floor(time * (8 + 10 * k)) % 2; g.fillStyle = 'rgba(255,70,60,' + (0.25 + 0.45 * k).toFixed(2) + ')'; g.fillRect(x0, y - 4, x1 - x0, 5);
  if (on) for (let x = x0; x < x1; x += 10) rc(g, x, y - 7, 5, 2, '#ff6b6b');
  rc(g, x0, y - 12, 1, 12, '#ff6b6b'); rc(g, x1 - 1, y - 12, 1, 12, '#ff6b6b');
}
/* A TORN STRETCH: the rail ripped up - bent ends, missing sleepers, a black gap where the line was */
export function tornRail(g, x0, x1, y, time) {
  rc(g, x0, y - 3, x1 - x0, 6, '#0c0a0c');
  for (let x = x0 + 6; x < x1 - 4; x += 14) rc(g, x, y + 1, 6, 2, '#3a2a1e');
  g.strokeStyle = '#8a8e98'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y - 2); g.lineTo(x0 + 7, y - 9); g.moveTo(x1, y - 2); g.lineTo(x1 - 7, y - 10); g.stroke(); g.lineWidth = 1;
  if (Math.floor(time * 6) % 2) { rc(g, x0 + 2, y - 4, 1, 1, '#ff9a3c'); rc(g, x1 - 3, y - 4, 1, 1, '#ff9a3c'); }
}
/* THE FOREMAN's LOADING BOOM: k 0..1 the windup (it rises behind him, its hook circling), then the swing (sw 0..1) back down the loop at head height */
export function fmBoom(g, x, topY, k, sw, reach, headY, time) {
  if (sw <= 0) { const a = -1.9 - 0.6 * k, len = 30, ex = x + Math.cos(a) * len, ey = topY + Math.sin(a) * len;
    g.strokeStyle = '#7a6a50'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, topY); g.lineTo(ex, ey); g.stroke(); g.lineWidth = 1;
    const ha = time * 9; rc(g, ex + Math.cos(ha) * 5 - 2, ey + 6 + Math.sin(ha) * 4, 4, 4, '#c8ccd4');
    g.fillStyle = 'rgba(255,90,70,' + (0.12 + 0.25 * k).toFixed(2) + ')'; g.fillRect(x - reach, headY - 3, reach, 6); return; }
  const hx = x - reach * Math.min(1, sw * 1.2); g.strokeStyle = '#7a6a50'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, topY); g.lineTo(hx, headY); g.stroke(); g.lineWidth = 1;
  rc(g, hx - 4, headY - 3, 8, 6, '#c8ccd4'); for (let i = 1; i < 5; i++) rc(g, hx + i * 7, headY - 1, 3, 1, 'rgba(255,255,255,0.4)');
}
/* THE FOREMAN's TIPPED ORE: a lump rolling back down the loop at you, a dust trail */
export function oreLump(g, x, y, time) {
  g.fillStyle = '#6a5a48'; g.beginPath(); g.arc(x, y - 6, 6, 0, Math.PI * 2); g.fill(); rc(g, x - 3, y - 9, 3, 2, '#d8a050'); rc(g, x + 1, y - 5, 2, 2, '#e8c070');
  for (let i = 1; i < 4; i++) { g.fillStyle = 'rgba(150,130,110,' + (0.4 - i * 0.1).toFixed(2) + ')'; g.fillRect(R(x + 6 + i * 5), R(y - 3 - (i % 2)), 3, 2); }
}
/* THE GATE past a parked cart (on-foot stretches): two posts and a barred gate on the line; open = swung up out of the way */
export function cartGate(g, x, yTop, yBot, open, time) {
  rc(g, x - 2, yTop, 3, yBot - yTop, '#4a4048'); rc(g, x + 13, yTop, 3, yBot - yTop, '#4a4048');
  if (!open) { for (let y = yTop + 4; y < yBot - 2; y += 7) rc(g, x, y, 14, 2, '#a83a2a'); rc(g, x + 3, yTop + 2, 8, 3, '#ffd36b'); if (Math.floor(time * 3) % 2) rc(g, x + 6, yTop - 3, 2, 2, '#ff6b6b'); }
  else { rc(g, x, yTop - 2, 14, 2, '#6a8a4a'); rc(g, x + 6, yTop - 5, 2, 2, '#8fd160'); }
}
