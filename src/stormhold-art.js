// src/stormhold-art.js - STORMHOLD 3's own pictures (claude/stormhold3art). Art only; no level or fight reads anything here.
//   bakeCitadel()  THE QUEEN'S CASTLE, NEAR: the far castle on the skyline (ART.bakeCastleRange) is a mountain with a roofline; at THE LONG BRIDGE the walls she
//                  has been building toward all level stand across the gorge - a curtain wall under a machicolated crown, six towers with slate cones and
//                  banners, the keep tall in the middle with its windows lit. Baked once, drawn by drawCitadel (main.js) behind the near hills.
import { canvas, rect, px, fillPoly, line, mulberry } from './px.js';

const W = 420, H = 190;
export function bakeCitadel() {
  const [c, g] = canvas(W, H), rnd = mulberry(1027);
  const ST = '#2c2f42', ST2 = '#383c54', LIT = '#4e5470', DK = '#1c1e2c', ROOF = '#3a4260', ROOFL = '#5a6488', GOLD = '#c9a040', WIN = '#ffb64a', BAN = '#5a2f7e', BANL = '#8a4cb4';
  const merlons = (x0, x1, y, col, lit) => { for (let x = x0; x < x1; x += 8) { rect(g, x, y - 5, 5, 5, col); rect(g, x, y - 5, 1, 5, lit); rect(g, x + 1, y - 5, 4, 1, lit); } rect(g, x0, y, x1 - x0, 1, DK); };
  const grain = (x0, y0, x1, y1) => { for (let i = 0; i < (x1 - x0) * (y1 - y0) / 14; i++) { const x = x0 + (rnd() * (x1 - x0)) | 0, y = y0 + (rnd() * (y1 - y0)) | 0; px(g, x, y, rnd() < 0.5 ? DK : ST2); } };
  const windows = (x0, x1, y0, y1, step, litP) => { for (let y = y0; y < y1; y += 13) for (let x = x0 + 4; x < x1 - 4; x += step) { const lit = rnd() < litP;
    rect(g, x, y, 3, 6, lit ? WIN : DK); px(g, x + 1, y - 1, lit ? WIN : DK); if (lit) { px(g, x + 1, y + 1, '#ffe8b0'); } } };
  // the curtain wall: a long crowned wall, a row of dark machicolation corbels under the crenellation, a talus at the foot
  rect(g, 0, 118, W, H - 118, ST); rect(g, 0, 118, W, 1, LIT); grain(0, 118, W, H);
  for (let x = 2; x < W; x += 6) { rect(g, x, 122, 3, 4, DK); rect(g, x, 126, 3, 1, ST2); }
  rect(g, 0, 130, W, 2, DK); merlons(0, W, 118, ST, LIT);
  for (let x = 20; x < W; x += 52) { rect(g, x, 146, 2, 10, DK); }   /* arrow loops */
  fillPoly(g, [[0, H], [0, 172], [W, 172], [W, H]], ST2);
  // towers: [centre x, width, top y, cone height]
  const TW = [[30, 30, 80, 34], [96, 26, 70, 30], [150, 30, 88, 30], [270, 30, 88, 30], [326, 26, 66, 34], [392, 32, 76, 36]];
  for (const [cx, w, top, cone] of TW) { const x0 = cx - w / 2 | 0;
    rect(g, x0, top, w, H - top, ST); rect(g, x0, top, 2, H - top, LIT); rect(g, x0 + w - 2, top, 2, H - top, DK); grain(x0, top, x0 + w, H);
    rect(g, x0 - 2, top, w + 4, 4, ST2); for (let x = x0 - 2; x < x0 + w + 2; x += 3) rect(g, x, top + 4, 2, 3, DK);   /* the corbelled crown */
    fillPoly(g, [[cx, top - cone], [x0 - 3, top], [x0 + w + 3, top]], ROOF); fillPoly(g, [[cx, top - cone], [x0 - 3, top], [cx - 1, top]], ROOFL); line(g, cx, top - cone, cx, top - cone - 7, DK);
    fillPoly(g, [[cx, top - cone - 7], [cx + 8, top - cone - 5], [cx, top - cone - 3]], BAN); line(g, cx, top - cone - 7, cx + 8, top - cone - 5, BANL);
    windows(x0, x0 + w, top + 14, top + 56, 9, 0.5); }
  // the keep: the tallest thing in the sky, a stack of stages with a lit hall, and the Queen's great banner
  { const x0 = 176, w = 70; rect(g, x0, 36, w, H - 36, ST); rect(g, x0, 36, 3, H - 36, LIT); rect(g, x0 + w - 3, 36, 3, H - 36, DK); grain(x0, 36, x0 + w, H);
    merlons(x0 - 4, x0 + w + 4, 36, ST, LIT); rect(g, x0 - 4, 36, w + 8, 3, ST2); for (let x = x0 - 4; x < x0 + w + 4; x += 4) rect(g, x, 39, 2, 4, DK);
    rect(g, x0 + 14, 6, 42, 30, ST); rect(g, x0 + 14, 6, 2, 30, LIT); merlons(x0 + 12, x0 + 58, 6, ST, LIT);
    line(g, x0 + 35, 6, x0 + 35, -2 + 4, DK); fillPoly(g, [[x0 + 35, 0], [x0 + 52, 3], [x0 + 49, 6], [x0 + 52, 9], [x0 + 35, 8]], BAN); line(g, x0 + 35, 0, x0 + 52, 3, GOLD);
    windows(x0 + 4, x0 + w - 4, 52, 112, 12, 0.7);
    for (let x = x0 + 18; x < x0 + 54; x += 8) { rect(g, x, 14, 3, 7, WIN); px(g, x + 1, 13, WIN); }   /* the lantern room, lit */
    // the great gate: an arch under the keep, the portcullis down, torchlit
    rect(g, 191, 138, 40, 40, DK); fillPoly(g, [[191, 140], [196, 130], [226, 130], [231, 140]], DK); for (let x = 193; x < 230; x += 4) rect(g, x, 134, 1, 44, '#5a5e72');
    rect(g, 189, 138, 2, 40, LIT); px(g, 190, 136, WIN); px(g, 232, 136, WIN); px(g, 190, 137, WIN); px(g, 232, 137, WIN); }
  // the stair of the rock under the wall, and the gorge's mist
  for (let x = 0; x < W; x += 10) rect(g, x, 172 + ((x / 10) % 3), 10, H, DK);
  return c;
}

// ===================================================================================================================================
// LANCE 4 ART (claude/lance4art): the Long Bridge's gate towers and bells, the signal ropes' posts and whip, the toll rings, the stars, the shield's
// splinters; the HAUL LINES' hemp, the haul tower's winch, the barbican's face, THE MANGONEL in its three states and the stone's arc.
// Immediate-mode canvas draws (they move with the clock), all stone, iron, bronze and hemp: no timber props. The draw hooks stay in
// src/lance-support.js (drawLanceBell, drawBellGate, drawRopeCut, drawLanceGate) and src/haul-lines.js (drawHaul, drawMangonel), which call these.
// ===================================================================================================================================
const SI = { iron: '#2a2e38', ironL: '#4a5262', ironH: '#8590a0', stone: '#5a5e72', stoneL: '#7a7e96', stoneD: '#3a3c50', bronze: '#a87c20', bronzeL: '#f0c048', bronzeD: '#6a4a14', gold: '#ffd36b', hemp: '#c9b27c', hempD: '#8a7a5a', hempL: '#e8dcc0', purple: '#8a4cb4' };
const F_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

/* A PORTCULLIS: an iron lattice on its chains - vertical bars with a lit edge, two riveted straps, a row of spikes at its foot; x is the centre, y0..y1 the top and foot */
export function drawPortcullis(g, x, y0, y1, w = 9, chained = true) {
  x = Math.round(x); y0 = Math.round(y0); y1 = Math.round(y1); const h = Math.max(4, y1 - y0);
  if (chained) { F_(g, SI.hempD, x - w, y0 - 8, 1, 8); F_(g, SI.hempD, x + w - 1, y0 - 8, 1, 8); for (let k = 0; k < 8; k += 2) { F_(g, SI.ironH, x - w, y0 - 8 + k, 1, 1); F_(g, SI.ironH, x + w - 1, y0 - 8 + k, 1, 1); } }
  for (let k = -w + 1; k <= w - 2; k += 4) { F_(g, SI.iron, x + k - 1, y0, 3, h); F_(g, SI.ironL, x + k, y0, 1, h); F_(g, SI.ironH, x + k, y0, 1, Math.min(h, 3)); }
  for (const fy of [y0, y0 + Math.round(h * 0.5), y1 - 3]) { if (fy + 2 > y1) continue; F_(g, SI.iron, x - w, fy, 2 * w, 3); F_(g, SI.ironL, x - w, fy, 2 * w, 1); for (let k = -w + 2; k < w; k += 4) F_(g, SI.ironH, x + k, fy + 1, 1, 1); }
  for (let k = -w + 1; k <= w - 2; k += 4) { F_(g, SI.ironH, x + k, y1, 1, 3); F_(g, SI.ironH, x + k - 1, y1, 3, 1); F_(g, '#e8eef4', x + k, y1 + 2, 1, 1); }   /* the spikes */
}

/* THE GATE TOWER'S BELL (and the great bell: pr.great, one and a half times the size, on iron piers): a bronze bell on a stone yoke with iron caps and straps,
   swinging while it tolls and throwing a ring of sound at each toll; hauled up out of reach in P2 (a coil, high); its winch drum and the rewind gauge; ready, a glint */
export function drawLanceBell(g, pr, cx, cy, TS, time) {
  const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), up = pr.up ? 14 : 0, great = !!pr.great, s = great ? 1.5 : 1, H = Math.round(26 * s + up);
  const pier = great ? SI.iron : SI.stone, pierL = great ? SI.ironL : SI.stoneL;
  for (const sx of [x - Math.round(9 * s), x + Math.round(8 * s) - 1]) { F_(g, pier, sx - 1, y - H, 4, H); F_(g, pierL, sx - 1, y - H, 1, H); F_(g, SI.stoneD, sx + 2, y - H, 1, H); F_(g, SI.ironH, sx - 2, y - H - 1, 6, 2); F_(g, SI.ironL, sx - 2, y - 3, 6, 3); }   /* two piers, iron-capped and footed */
  F_(g, pier, x - Math.round(10 * s), y - H - 3, Math.round(20 * s) + 2, 3); F_(g, pierL, x - Math.round(10 * s), y - H - 3, Math.round(20 * s) + 2, 1); F_(g, SI.bronze, x - 2, y - H - 3, 4, 3);   /* the lintel with a bronze boss */
  const ringing = pr.ringT >= 0 || (pr.rings && pr.rings.length), sw = ringing ? Math.sin(time * 14) * 3 * s : 0, bx = x + Math.round(sw), by = y - Math.round(8 * s) - up;
  const bw = Math.round(11 * s), bh = Math.round(11 * s);
  F_(g, SI.ironL, x, y - H, 1, y - H < by - bh ? by - bh - (y - H) : 2);   /* the bell's chain from the lintel */
  F_(g, SI.bronze, bx - Math.round(bw / 2) + 1, by - bh - 1, bw - 2, 2); F_(g, SI.bronze, bx - Math.round(bw / 2), by - bh + 1, bw, bh - 1);          /* crown and shoulders */
  F_(g, SI.bronzeD, bx + Math.round(bw / 2) - 3, by - bh + 1, 3, bh - 1); F_(g, SI.bronzeL, bx - Math.round(bw / 2) + 1, by - bh + 2, great ? 3 : 2, bh - 3);   /* shaded flank, lit flank */
  F_(g, SI.bronze, bx - Math.round(bw / 2) - 2, by - 1, bw + 4, 3); F_(g, SI.bronzeL, bx - Math.round(bw / 2) - 2, by - 1, bw + 4, 1); F_(g, SI.bronzeD, bx - Math.round(bw / 2) - 2, by + 2, bw + 4, 1);   /* the flared lip */
  F_(g, SI.bronzeD, bx - Math.round(bw / 2), by - Math.round(bh / 2), bw, 1); F_(g, SI.bronzeL, bx - Math.round(bw / 2), by - Math.round(bh / 2) - 1, bw, 1);                                       /* the waist band */
  F_(g, '#3a2a1a', bx, by + 3, 2, 3);                                                                                                                                              /* the clapper */
  for (const r of pr.rings || []) { const k = r.t / 0.8, rx = 8 * s + 24 * k, ry = 6 * s + 15 * k;   /* THE TOLL: a double ring of sound, fading, with the bell's glare at its heart */
    g.globalAlpha = 0.85 * (1 - k); g.strokeStyle = SI.gold; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, by - 4 * s, rx, ry, 0, 0, 7); g.stroke();
    g.lineWidth = 1; g.strokeStyle = '#fff6c8'; g.beginPath(); g.ellipse(bx, by - 4 * s, rx * 0.72, ry * 0.72, 0, 0, 7); g.stroke();
    if (k < 0.25) { g.fillStyle = '#fff6c8'; for (const [ox, oy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.fillRect(Math.round(bx + ox * rx * 0.9), Math.round(by - 4 * s + oy * ry * 0.9), 2, 2); } }
  g.globalAlpha = 1; g.lineWidth = 1;
  if (pr.up) { for (let k = 0; k < 3; k++) { F_(g, SI.hempD, x + 4, y - H - 6 + k * 2, 6, 1); F_(g, SI.hemp, x + 4, y - H - 7 + k * 2, 6, 1); } F_(g, SI.ironH, x + 3, y - H - 8, 1, 8); return; }   /* hauled up: the rope coiled on the lintel */
  const dx = x - Math.round(9 * s) - 5, dy = y - 12;   /* THE WINCH DRUM on the pier: an iron drum with hoops, the rope coiled, a crank */
  F_(g, SI.iron, dx, dy, 5, 9); F_(g, SI.ironL, dx, dy, 1, 9); for (const hy of [dy + 1, dy + 7]) F_(g, SI.ironH, dx, hy, 5, 1); F_(g, SI.hemp, dx + 1, dy + 3, 3, 3); F_(g, SI.hempD, dx + 1, dy + 4, 3, 1);
  const a = pr.rewind > 0 ? time * 8 : 0; F_(g, SI.ironH, dx + 2 + Math.round(Math.cos(a) * 3), dy + 4 + Math.round(Math.sin(a) * 3), 2, 2);
  if (pr.rewind > 0) { const k = 1 - pr.rewind / (pr.rewind0 || 10), gw = Math.round(16 * s); F_(g, SI.iron, x - Math.round(8 * s) - 1, y + 1, gw + 2, 4); F_(g, '#14121a', x - Math.round(8 * s), y + 2, gw, 2); F_(g, SI.gold, x - Math.round(8 * s), y + 2, Math.round(gw * k), 2);   /* the rewind gauge in its riveted slot */
    F_(g, SI.ironH, x - Math.round(8 * s) - 1, y + 1, 1, 1); F_(g, SI.ironH, x + Math.round(8 * s), y + 1, 1, 1); }
  else { const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.3 + 0.4 * k; g.strokeStyle = SI.gold; g.beginPath(); g.ellipse(bx, by - 4 * s, 9 * s + k, 10 * s + k, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }   /* ready: strike me */
}

/* A TOWER'S PORTCULLIS, up under the lookout with its teeth showing; down on him, the bars rest on his helm; coming down, red along its foot */
export function drawBellGate(g, pr, cx, cy, TS, time, e) {
  if (pr.great) return;   /* the main gate draws itself (main.js drawLanceBridge) */
  const x = Math.round(pr.gx - cx), top = pr.gy0 * TS - cy;
  F_(g, SI.stoneD, x - 11, Math.round(top) - 12, 2, 12); F_(g, SI.stoneD, x + 10, Math.round(top) - 12, 2, 12); F_(g, SI.ironL, x - 12, Math.round(top) - 13, 24, 2);   /* the slot's jambs and its iron head */
  if (pr.pinned && e) { const hy = Math.round(e.y - (e.h || 40) - cy); drawPortcullis(g, x, Math.round(top) - 6, Math.max(Math.round(top), hy)); return; }
  if (pr.down > 0) return;   /* down across the lane: its own tiles draw it */
  drawPortcullis(g, x, Math.round(top) - 6, Math.round(top) + 2);
  if (pr.ringT >= 0) { const k = 0.5 + 0.5 * Math.sin(time * 20); g.globalAlpha = 0.4 + 0.5 * k; g.fillStyle = '#ff6b6b'; g.fillRect(x - 9, Math.round(top) + 4, 18, 1); g.globalAlpha = 1; }   /* it is coming down */
}

/* THE HALL GATE (Highcrown's hall bell keeps lance-support's drawLanceGate): the same lattice, the glint along its foot */
export function drawHallGate(g, x, top, e, open, time) {
  if (e) { const hy = Math.round(e.y - (e.h || 30)); drawPortcullis(g, x, Math.round(top) - 6, Math.max(Math.round(top), hy)); return; }
  if (open > 0) return;
  drawPortcullis(g, x, Math.round(top) - 10, Math.round(top) - 2);
  const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = SI.gold; g.fillRect(x - 9, Math.round(top) - 1, 18, 1); g.globalAlpha = 1;
}

/* A HEMP ROPE between two points: a twisted strand (light and dark lay), thick = 2 px */
export function hempLine(g, X0, Y0, X1, Y1, thick = 2, sag = 0, t0 = 0) {
  const n = Math.max(1, Math.abs(Math.round(X1 - X0)), Math.abs(Math.round(Y1 - Y0))), steep = Math.abs(Y1 - Y0) > Math.abs(X1 - X0);
  for (let i = 0; i <= n; i++) { const t = i / n, x = Math.round(X0 + (X1 - X0) * t), y = Math.round(Y0 + (Y1 - Y0) * t + sag * Math.sin(t * Math.PI)), lay = ((i + t0) >> 1) & 1;
    g.fillStyle = lay ? SI.hempD : SI.hemp; if (steep) g.fillRect(x, y, thick, 1); else g.fillRect(x, y, 1, thick);
    if (thick > 1) { g.fillStyle = lay ? SI.hemp : SI.hempL; g.fillRect(x, y, 1, 1); } }
}

/* A SIGNAL ROPE'S POST and its cut: an iron-hooped stone bollard on the deck (struck to cut the line) with the line lashed to it; the fray (sparks and loose
   strands), the whip (the parted line lashing down along its run, strands streaming, dust where it lashes) and the crew hauling it taut again */
export function drawRopeCut(g, z, cx, cy, time, live) {
  const [px, py] = z.post, x = Math.round(px - cx), y = Math.round(py - cy);
  F_(g, SI.stoneD, x - 4, y - 16, 8, 16); F_(g, SI.stone, x - 4, y - 16, 5, 16); F_(g, SI.stoneL, x - 4, y - 16, 1, 16); for (let r = 0; r < 4; r++) F_(g, r % 2 ? SI.stone : SI.stoneD, x - 4, y - 14 + r * 4, 8, 1);   /* the courses */
  F_(g, SI.ironH, x - 5, y - 20, 10, 2); F_(g, SI.iron, x - 5, y - 18, 10, 2); F_(g, SI.ironL, x - 5, y - 18, 10, 1); F_(g, SI.iron, x - 3, y - 22, 6, 3); F_(g, SI.ironH, x - 3, y - 22, 6, 1);   /* the iron bollard head */
  F_(g, SI.ironL, x - 5, y - 9, 10, 1); for (const rx of [-4, 3]) F_(g, SI.ironH, x + rx, y - 8, 1, 1);
  hempLine(g, x, y - 21, Math.round(z.x1 - cx), Math.round(z.y1 - cy), 1);   /* the stay from the bollard up to the line's end */
  for (let k = 0; k < 3; k++) { F_(g, SI.hempD, x - 3, y - 17 + k * 2, 6, 1); F_(g, SI.hemp, x - 3, y - 18 + k * 2, 6, 1); }   /* the lashing: turns of hemp round the post */
  if (live && !(z.cut > 0) && !(z.fray > 0)) { const k = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.3 + 0.45 * k; g.fillStyle = SI.gold; g.fillRect(x - 4, y - 17, 8, 2); g.fillRect(x - 5, y - 23, 10, 1); g.globalAlpha = 1; }   /* the lashing glints: strike it */
  if (z.fray > 0) { g.fillStyle = Math.sin(time * 50) > 0 ? SI.gold : '#ff9a5c'; for (let k = 0; k < 6; k++) g.fillRect(Math.round(x - 5 + ((time * 97 + k * 37) % 11)), Math.round(y - 20 - ((time * 61 + k * 13) % 10)), 1, 1);
    g.fillStyle = SI.hempL; for (let k = 0; k < 3; k++) g.fillRect(x - 2 + k * 2, Math.round(y - 23 - ((time * 20 + k * 5) % 3)), 1, 2); }   /* sparks, and strands standing out of the lashing */
  if (z.cut > 0) { const X0 = Math.round(z.x0 - cx), Y0 = Math.round(z.y0 - cy), X1 = Math.round(z.x1 - cx), Y1 = Math.round(z.y1 - cy);
    if (z.whip > 0) { const k = 1 - z.whip / 0.6, pts = [];   /* THE WHIP: the line lashes down the length of its run, its strands streaming */
      for (let i = 0; i <= 18; i++) { const t = i / 18; pts.push([X0 + (X1 - X0) * t, Y0 + (Y1 - Y0) * t + Math.sin(t * 9 + time * 40) * 6 * (1 - k) + k * 34 * Math.sin(t * Math.PI)]); }
      for (let i = 1; i < pts.length; i++) hempLine(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 2, 0, i * 2);
      const [lx, ly] = pts[pts.length - 1]; g.fillStyle = SI.hempL; for (let q = 0; q < 5; q++) g.fillRect(Math.round(lx) + (q % 3) - 1, Math.round(ly) + q * 2 - 2, 1, 2);   /* the free end unravelled */
      if (k > 0.45) { g.globalAlpha = 0.7 * (1 - k); g.fillStyle = '#c9b27c'; for (let q = 0; q < 7; q++) g.fillRect(Math.round(lx) - 8 + q * 3, Math.round(ly) + 6 - ((q * 7) % 5), 2, 2); g.globalAlpha = 1; } }   /* the dust where it lashes */
    const rk = 1 - z.cut / (z.cut0 || 14);   /* re-stringing: the line paid back out from the tower, taut as far as it has come */
    hempLine(g, X0, Y0, X0 + (X1 - X0) * rk, Y0 + (Y1 - Y0) * rk, 1);
    F_(g, SI.hempD, X1, Y1, 1, 14); for (let q = 0; q < 14; q += 3) F_(g, SI.hemp, X1, Y1 + q, 1, 1); }
}

/* HELM RUNG'S STARS: gold five-point stars circling the helm on a tilted ring (the near half drawn big, the far half small and dim) */
export function drawStars(g, x, y, time) {
  for (let q = 0; q < 5; q++) { const a = time * 6 + q * 1.2566, sx = x + Math.round(Math.cos(a) * 13), sy = y + Math.round(Math.sin(a) * 4), near = Math.sin(a) > 0;
    g.globalAlpha = near ? 1 : 0.55; const col = q % 2 ? SI.gold : '#fff6c8';
    F_(g, col, sx - 1, sy, 3, 1); F_(g, col, sx, sy - 1, 1, 3); if (near) { F_(g, col, sx - 2, sy - 1, 1, 1); F_(g, col, sx + 2, sy - 1, 1, 1); F_(g, '#fff', sx, sy, 1, 1); } }
  g.globalAlpha = 1;
}
/* THE HEAVY'S STAMP: a planted foot's ring of dust, two rings and flung grit (k 0 -> 1) */
export function drawStamp(g, x, y, k, face) {
  g.globalAlpha = 0.65 * (1 - k); g.strokeStyle = '#c9b27c'; g.lineWidth = 1; g.beginPath(); g.ellipse(x - face * 6, y, 6 + 14 * k, 2 + 2 * k, 0, 0, 7); g.stroke();
  g.beginPath(); g.ellipse(x - face * 6, y, 3 + 9 * k, 1 + 1 * k, 0, 0, 7); g.stroke(); g.fillStyle = '#e8dcc0'; for (let q = 0; q < 5; q++) g.fillRect(Math.round(x - face * 6 + (q - 2) * (4 + 8 * k)), Math.round(y - 2 - 8 * k * ((q * 5) % 3 + 1) / 3), 1, 1); g.globalAlpha = 1;
}
/* THE SHIELD'S SPLINTERS: planks of purple tower shield, gold chevron, rivets and steel rim, flung (pushes onto the page's particle list) */
export function splinters(parts, x, y, face, rnd = Math.random) {
  const cols = ['#8a4cb4', '#4e2670', '#f0c048', '#b4bcc8', '#8590a0', '#262b36'];
  for (let i = 0; i < 26; i++) parts.push({ x: x + face * 8, y: y - 20 - rnd() * 18, vx: (rnd() - 0.3) * 220 * face, vy: -90 - rnd() * 140, life: 1.3 + rnd() * 0.4, max: 1.6, col: cols[i % cols.length], size: i % 5 === 0 ? 3 : 2, grav: 420 });
}

/* ---------------------------------------------------------------- THE HAUL LINES: hemp, the haul tower's winch, the barbican's face */
export function drawHaulHemp(g, z, cx, cy) {
  const X0 = Math.round(z.x0 - cx), Y0 = Math.round(z.y0 - cy), X1 = Math.round(z.x1 - cx), Y1 = Math.round(z.y1 - cy);
  hempLine(g, X0, Y0 + 2, X1, Y1 + 2, 1, 0, 1);
  for (let t = 0.12; t < 1; t += 0.22) { const x = Math.round(X0 + (X1 - X0) * t), y = Math.round(Y0 + (Y1 - Y0) * t); F_(g, SI.hempD, x - 1, y + 1, 3, 3); F_(g, SI.hemp, x, y + 1, 1, 1); }   /* the splices */
  if (z.endsAir) { g.fillStyle = SI.hempL; for (let q = 0; q < 4; q++) g.fillRect(X1 - 1 + (q % 2) * 2, Y1 + 1 + q * 2, 1, 2); }   /* an end left unfinished: loose strands */
}
export function drawHaulTower(g, cx, cy, VW, time) {
  const T = 16, tx = 442 * T - cx, ty = 15 * T - cy;
  if (tx > -120 && tx < VW + 120) {
    /* THE HAUL TOWER: a jib of iron out over the ditch with a block and hook, a capstan winch with a hemp coil on the top deck, arrow slits lit from inside, the Queen's pennon */
    F_(g, SI.iron, tx - 6, ty - 2, 5 * T + 8, 2); F_(g, SI.ironL, tx - 6, ty - 2, 5 * T + 8, 1);
    const jx = tx - 30; F_(g, SI.iron, jx, ty - 26, 3, 26); F_(g, SI.ironL, jx, ty - 26, 1, 26); F_(g, SI.iron, jx - 12, ty - 28, 30, 3); F_(g, SI.ironH, jx - 12, ty - 28, 30, 1);
    const sway = Math.round(Math.sin(time * 1.4)); F_(g, SI.hempD, jx - 10 + sway, ty - 25, 1, 9); F_(g, SI.iron, jx - 12 + sway, ty - 16, 5, 4); F_(g, SI.ironH, jx - 12 + sway, ty - 16, 5, 1); F_(g, SI.ironH, jx - 9 + sway, ty - 12, 1, 3); F_(g, SI.ironH, jx - 10 + sway, ty - 10, 3, 1);   /* the block and the hook */
    const cxw = tx + 40; F_(g, SI.iron, cxw, ty - 14, 11, 14); F_(g, SI.ironL, cxw, ty - 14, 11, 2); F_(g, SI.ironH, cxw, ty - 14, 11, 1); for (let r = 0; r < 3; r++) { F_(g, SI.hempD, cxw + 1, ty - 11 + r * 3, 9, 2); F_(g, SI.hemp, cxw + 1, ty - 11 + r * 3, 9, 1); }
    F_(g, SI.ironH, cxw + 5, ty - 18, 1, 5); const a = time * 0.8; F_(g, SI.ironH, cxw + 5 + Math.round(Math.cos(a) * 6), ty - 18 + Math.round(Math.sin(a) * 2), 2, 2);   /* the capstan's bar */
    for (let r = 0; r < 4; r++) { const sy = ty + 40 + r * 56; F_(g, '#14121a', tx + 30, sy, 3, 12); F_(g, '#ffb64a', tx + 31, sy + 3, 1, 6); g.globalAlpha = 0.18; F_(g, '#ffb64a', tx + 26, sy - 2, 11, 16); g.globalAlpha = 1; }   /* the slits */
    F_(g, SI.iron, tx + 70, ty - 36, 1, 36); const wv = Math.sin(time * 3); g.fillStyle = SI.purple; g.beginPath(); g.moveTo(tx + 71, ty - 36); g.lineTo(tx + 88, ty - 33 + wv * 2); g.lineTo(tx + 83, ty - 30); g.lineTo(tx + 88, ty - 27 - wv * 2); g.lineTo(tx + 71, ty - 26); g.closePath(); g.fill(); F_(g, SI.gold, tx + 71, ty - 36, 17, 1);
  }
  const bx = 566 * T - cx, by = 17 * T - cy;
  if (bx > -200 && bx < VW + 160) {
    /* THE BARBICAN TOWER'S FACE: a row of corbels under the crown (the machicolations), two banners hung down the face, arrow slits, a lantern on a bracket, the Queen's gold at the cornice */
    for (let k = 0; k < 10; k++) { F_(g, SI.stoneD, bx + k * T + 2, by + 2, 10, 5); F_(g, SI.stone, bx + k * T + 2, by + 2, 10, 1); F_(g, '#14121a', bx + k * T + 5, by + 3, 4, 4); }
    F_(g, SI.ironL, bx - 2, by - 2, 10 * T + 4, 2); F_(g, SI.gold, bx - 2, by - 2, 10 * T + 4, 1);
    for (const bxx of [bx + 20, bx + 100]) { const sw = Math.sin(time * 1.6 + bxx) * 1.5; F_(g, SI.iron, bxx - 1, by + 8, 14, 2); g.fillStyle = SI.purple; g.beginPath(); g.moveTo(bxx, by + 10); g.lineTo(bxx + 12, by + 10); g.lineTo(bxx + 12 + sw, by + 46); g.lineTo(bxx + 6, by + 40); g.lineTo(bxx + sw, by + 46); g.closePath(); g.fill(); F_(g, SI.gold, bxx + 5, by + 18, 3, 3); F_(g, SI.gold, bxx + 4, by + 21, 5, 1); F_(g, '#3a1c54', bxx, by + 10, 3, 34); }
    for (const sy of [by + 74, by + 130]) for (const sxx of [bx + 40, bx + 110]) { F_(g, '#14121a', sxx, sy, 3, 12); F_(g, '#ffb64a', sxx + 1, sy + 3, 1, 5); g.globalAlpha = 0.16; F_(g, '#ffb64a', sxx - 4, sy - 2, 11, 16); g.globalAlpha = 1; }
    const lx = bx + 70, ly = by + 96; F_(g, SI.iron, lx, ly, 8, 2); F_(g, SI.iron, lx + 6, ly - 12, 2, 12); F_(g, SI.iron, lx + 1, ly + 2, 6, 7); F_(g, '#ffb64a', lx + 2, ly + 3, 4, 5); F_(g, SI.ironH, lx + 1, ly + 2, 6, 1); g.globalAlpha = 0.22 + 0.06 * Math.sin(time * 9); F_(g, '#ffb64a', lx - 8, ly - 6, 24, 22); g.globalAlpha = 1;
  }
}

/* THE MANGONEL, in its three states: COCKED (the arm laid back low with a stone in the sling, a ring of ember at it), LOOSING (k > 0: the arm flung up and over, the sling empty
   and streaming, a smear), WRECKED (the arm snapped, the frame down on one side, rubble and a thread of smoke). A stone counterweight box on the arm, an iron-shod bed, stone wheels */
export function drawMangonelArt(g, m, cx, cy, time, armTMax) {
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy);
  F_(g, SI.iron, x - 18, y - 5, 36, 5); F_(g, SI.ironL, x - 18, y - 5, 36, 1); for (let k = -16; k <= 14; k += 6) F_(g, SI.ironH, x + k, y - 3, 1, 1);   /* the bed, iron-shod, studded */
  for (const wx of [-14, 12]) { F_(g, SI.stoneD, x + wx, y - 9, 6, 6); F_(g, SI.stone, x + wx + 1, y - 8, 4, 4); F_(g, SI.ironH, x + wx + 2, y - 7, 2, 2); }   /* the wheels, stone with an iron hub */
  if (m.wrecked) {
    F_(g, SI.iron, x - 12, y - 14, 4, 9); F_(g, SI.ironL, x - 12, y - 14, 1, 9);                                   /* one upright still standing, leaning */
    F_(g, SI.iron, x + 3, y - 9, 16, 3); F_(g, SI.ironL, x + 3, y - 9, 16, 1);                                       /* the other down across the bed */
    F_(g, SI.stoneD, x - 5, y - 9, 10, 5); F_(g, SI.stone, x - 5, y - 9, 10, 1); F_(g, SI.iron, x - 5, y - 6, 10, 1);   /* the counterweight box fallen to the bed */
    F_(g, '#6a4a40', x - 16, y - 7, 11, 2); F_(g, '#2a2430', x - 17, y - 7, 2, 2); F_(g, '#8a6a5a', x - 18, y - 9, 1, 3);                /* the snapped arm and its splinters */
    for (const [rx, ry] of [[8, -11], [-9, -11], [14, -12]]) F_(g, SI.stone, x + rx, y + ry, 2, 2);
    g.globalAlpha = 0.4; for (let q = 0; q < 4; q++) F_(g, '#8a8a9c', x - 2 + Math.round(Math.sin(time * 2 + q) * 2), y - 16 - q * 4 - Math.round((time * 8) % 4), 3, 3); g.globalAlpha = 1; return; }
  F_(g, SI.iron, x - 10, y - 21, 4, 17); F_(g, SI.iron, x + 6, y - 21, 4, 17); F_(g, SI.ironL, x - 10, y - 21, 1, 17); F_(g, SI.ironL, x + 6, y - 21, 1, 17);   /* the uprights */
  F_(g, SI.ironH, x - 11, y - 22, 22, 2); F_(g, SI.iron, x - 11, y - 20, 22, 1); for (const sy of [-17, -11]) { F_(g, SI.ironL, x - 10, y + sy, 4, 1); F_(g, SI.ironL, x + 6, y + sy, 4, 1); }   /* the axle beam, the straps */
  const k = m.armT > 0 ? m.armT / (armTMax || 0.55) : 0;   /* cocked: the arm laid back low to the east; loosing (k 1 -> 0 as it settles): flung up and over toward the ditch */
  const ax = x, ay = y - 20, ex = Math.round(ax + 18 - 28 * k), ey = Math.round(ay + 10 - 30 * k), tx = Math.round(ax + (ax - ex) * 0.35), ty = Math.round(ay + (ay - ey) * 0.35);
  if (k > 0.2) { const k2 = Math.min(1, k + 0.35); g.globalAlpha = 0.35; g.strokeStyle = SI.hempL; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ty); g.lineTo(Math.round(ax + 18 - 28 * k2), Math.round(ay + 10 - 30 * k2)); g.stroke(); g.globalAlpha = 1; }   /* the arm's smear */
  g.strokeStyle = '#2a2430'; g.lineWidth = 4; g.beginPath(); g.moveTo(tx, ty); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#6a4a40'; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, ty - 1); g.lineTo(ex, ey - 1); g.stroke(); g.lineWidth = 1;   /* the arm: an iron-banded beam */
  g.strokeStyle = SI.ironH; for (const t of [0.3, 0.6, 0.9]) { const bx = Math.round(tx + (ex - tx) * t), by = Math.round(ty + (ey - ty) * t); g.beginPath(); g.moveTo(bx - 1, by - 2); g.lineTo(bx - 1, by + 2); g.stroke(); }
  F_(g, SI.stoneD, tx - 5, ty - 3, 10, 8); F_(g, SI.stone, tx - 5, ty - 3, 10, 2); F_(g, SI.stoneL, tx - 5, ty - 3, 10, 1); F_(g, SI.iron, tx - 5, ty + 1, 10, 1);                        /* the counterweight: a box of stone */
  if (!k) { F_(g, '#5a5650', ex - 3, ey - 3, 6, 6); F_(g, '#8a8478', ex - 3, ey - 3, 3, 2); F_(g, '#3a3834', ex + 1, ey + 1, 2, 2); F_(g, SI.hempD, ex - 1, ey + 3, 1, 3);   /* the stone in its sling */
    const glow = 0.5 + 0.5 * Math.sin(time * 4); g.globalAlpha = 0.25 + 0.3 * glow; g.strokeStyle = '#ff9a5c'; g.beginPath(); g.arc(ex, ey, 6, 0, 7); g.stroke(); g.globalAlpha = 1; }
  else { F_(g, SI.hempD, ex, ey, 1, 5 + Math.round(k * 3)); F_(g, SI.hemp, ex + 1, ey + 1, 1, 4); F_(g, SI.hempL, ex - 1, ey + 2, 1, 3); }   /* the sling, empty, streaming */
}
/* THE STONE IN FLIGHT: a round stone lit upper-left with a speed-streak behind it, the dotted arc ahead, and the red ring ON THE ROPE where it lands (it tightens, with cross ticks) */
export function drawStoneFlight(g, k, sx, sy, rx, ry, arcPts, time) {
  g.fillStyle = '#ff9a5c'; g.globalAlpha = 0.6; for (const [ax, ay] of arcPts) g.fillRect(ax, ay, 1, 1); g.globalAlpha = 1;
  for (let i = 1; i <= 3; i++) { g.globalAlpha = 0.18 * (4 - i); F_(g, '#8a8478', sx - 3 - i * 2, sy - 3 + i, 6, 6); } g.globalAlpha = 1;
  F_(g, '#3a3834', sx - 4, sy - 3, 8, 7); F_(g, '#5a5650', sx - 4, sy - 4, 8, 7); F_(g, '#8a8478', sx - 3, sy - 4, 4, 3); F_(g, '#c9c4b8', sx - 3, sy - 4, 2, 1); F_(g, '#2a2824', sx + 1, sy + 1, 3, 2);
  const pulse = 0.5 + 0.5 * Math.sin(time * 16); g.strokeStyle = '#ff4a4a'; g.globalAlpha = 0.5 + 0.4 * pulse; g.lineWidth = 1;
  g.beginPath(); g.ellipse(rx, ry, 14 - 6 * k, 6 - 2 * k, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(rx, ry, 4, 2, 0, 0, 7); g.stroke();
  g.fillStyle = '#ff4a4a'; const ex = Math.round(16 - 6 * k); g.fillRect(rx - ex, ry, 2, 1); g.fillRect(rx + ex - 2, ry, 2, 1); g.fillRect(rx, ry - 4, 1, 2); g.fillRect(rx, ry + 3, 1, 2); g.globalAlpha = 1;
}
