// fair_keys.js - THE HARVEST FAIR's keys and its new ground, drawn (claude/fairfix2). Pure drawing, plus two baked sprites. src/main.js calls drawKeys each frame from drawFair.
//   drawKeys     the FALLEN BIG TOP's tent poles, the TICKET GATES (a striped fence or a hatch, the price on a ticket plate; swung open once paid), the CAGE bars, the BUNTING ROPE,
//                the BURNING BUNTING across the fire's lane (down / up on its chase clock), the fallen stalls in the lane, the collapsing stall roofs' awnings, and a lone
//                BULL'S-EYE (on a post, or hung on a ride where the ride carries it)
//   drawMirrorDoor  the door in the glass: there only while a true mirror shows it (src/fair-keys.js mirrorDoorOpen)
//   drawKnife / drawShy   the juggler's knife in flight; the coconut and the shy-ball (drawn into the drunk's lob, rotated by the caller)
//   bakeJuggler  THE KNIFE JUGGLER in the archer's eight frames: 0 idle (three knives in the air) | 1 draw (one knife back: the tell) | 2,3 walk | 4 look | 5 full draw | 6 loose | 7 hurt
import { canvas, px, rect, fillPoly, line, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { beamLive } from '../chase.js';
const TS = 16;
const K = { red: '#b8382c', redD: '#7a2418', cream: '#ece0c4', creamD: '#c8b890', gold: '#e8c23a', goldD: '#a87a18', wood: '#7a5230', woodL: '#a67a48', woodD: '#4e321a', ink: '#120e14', steel: '#c9d1dc', steelD: '#7c8797', blue: '#3a7ab8', teal: '#3ab8c8' };
const r = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const ln = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(Math.round(x0) + 0.5, Math.round(y0) + 0.5); g.lineTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5); g.stroke(); };
const vis = (x0, x1, cx, VW, pad = 40) => x1 >= cx - pad && x0 <= cx + VW + pad;
const FLAGS = [K.red, K.gold, K.blue, K.cream, '#8fd160', '#c9a0ff'];

/* a string of triangle flags from (x0,y0) to (x1,y1), sagging `sag` px; burn 0..1 sets them alight */
function bunting(g, x0, y0, x1, y1, sag, time, burn = 0) {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 9));
  g.strokeStyle = burn > 0 ? '#3a2a20' : '#5a4630'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); g.stroke();
  for (let i = 1; i < n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t) + Math.sin(time * 3 + i) * 0.6;
    g.fillStyle = burn > 0 ? (i % 2 ? '#2a1a14' : '#4a2a1a') : FLAGS[i % FLAGS.length]; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y); g.lineTo(x, y + 6); g.closePath(); g.fill();
    if (burn > 0) { const f = 0.5 + 0.5 * Math.sin(time * 18 + i * 2.1); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,' + (120 + 80 * f | 0) + ',40,' + (0.55 * burn) + ')'; g.beginPath(); g.moveTo(x - 3, y + 1); g.lineTo(x + 3, y + 1); g.lineTo(x + Math.sin(time * 9 + i) * 2, y - 5 - 3 * f); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over'; } }
}

export function drawKeys(g, cx, cy, VW, VH, L, F, time) {
  const G = F && F.games, solidAt = (x, y) => L.grid[y * L.W + x] !== 0;
  /* THE FALLEN BIG TOP: its two poles, striped, a pennant at each top, a scrap of canvas still on the taller one */
  for (const [x, top] of L.poles || []) { const sx = x * TS - cx, sy = top * TS - cy; if (sx < -40 || sx > VW + 40) continue;
    for (let y = sy; y < sy + 64; y += 6) r(g, sx + 3, y, 10, 3, K.red), r(g, sx + 3, y + 3, 10, 3, K.cream);
    r(g, sx + 2, sy, 12, 2, K.gold); ln(g, sx + 8, sy, sx + 8, sy - 14, K.woodD); const fl = Math.sin(time * 4 + x) * 2; fillPoly(g, [[sx + 8, sy - 14], [sx + 18 + fl, sy - 11], [sx + 8, sy - 8]], K.red);
    g.fillStyle = 'rgba(236,224,196,0.55)'; g.beginPath(); g.moveTo(sx + 13, sy + 2); g.lineTo(sx + 26, sy + 10 + fl); g.lineTo(sx + 13, sy + 14); g.closePath(); g.fill(); }
  /* THE TICKET GATES */
  for (const gt of (F && F.keys && F.keys.gates) || []) { const x = gt.x * TS - cx, y0 = gt.y0 * TS - cy, w = (gt.w || 1) * TS, h = (gt.y1 - gt.y0 + 1) * TS; if (x < -60 || x > VW + 60) continue;
    if (gt.hatch) { if (!gt.open) { r(g, x, y0, w, 4, K.woodD); for (let i = 0; i < w; i += 6) r(g, x + i, y0, 3, 4, K.gold); r(g, x + w / 2 - 6, y0 + 4, 12, 8, '#2a1a22'); }
      else { r(g, x - 2, y0 - 14, 3, 16, K.woodD); for (let i = 0; i < 14; i += 4) r(g, x - 2, y0 - 14 + i, 3, 2, K.gold); }
      plate(g, x + w / 2, y0 - 22, gt.all ? 'ALL' : String(gt.need), gt.open, time); continue; }
    if (!gt.open) { r(g, x + 2, y0, 3, h, K.woodD); r(g, x + w - 5, y0, 3, h, K.woodD); for (let y = y0 + 4; y < y0 + h; y += 10) { r(g, x + 2, y, w - 4, 3, K.red); r(g, x + 2, y + 3, w - 4, 2, K.cream); }
      for (let i = 0; i < 3; i++) r(g, x + 4 + i * 3, y0 - 4, 2, 5, K.gold); }
    else { r(g, x - 10, y0 + h - 40, 3, 40, K.woodD); for (let y = y0 + h - 36; y < y0 + h; y += 10) r(g, x - 13, y, 9, 3, K.red); }   /* swung back against its post */
    plate(g, x + w / 2, y0 - 12, String(gt.need), gt.open, time); }
  /* THE CAGE BARS (a bull's-eye drops them): iron bars over the solid tiles while they stand */
  for (const [x0, x1, y0, y1] of L.cages || []) { if (!solidAt(x0, y0)) continue; const sx = x0 * TS - cx, sy = y0 * TS - cy, w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS; if (sx < -30 || sx > VW + 30) continue;
    r(g, sx, sy, w, h, '#1a1420'); for (let i = 1; i < w; i += 4) r(g, sx + i, sy, 2, h, i % 8 === 1 ? K.steel : K.steelD); r(g, sx, sy, w, 2, K.steelD); r(g, sx, sy + h - 2, w, 2, K.steelD); r(g, sx + w / 2 - 2, sy + h / 2 - 3, 4, 5, K.gold); }
  /* THE BUNTING ROPE (a slide line) */
  for (const z of L.zipLines || []) { if (!z.bunting || !vis(z.x0, z.x1, cx, VW)) continue; bunting(g, z.x0 - cx, z.y0 - cy, z.x1 - cx, z.y1 - cy, 2, time);
    r(g, z.x0 - cx - 2, z.y0 - cy - 2, 4, 30, K.woodD); r(g, z.x1 - cx - 1, z.y1 - cy - 2, 3, 22, K.woodD); }
  /* THE BURNING BUNTING across the fire's lane: DOWN it hangs at head height (duck under, or wait), UP it is drawn up out of reach - the same clock as its hurt */
  for (const c of L.chases || []) for (const b of c.beams || []) { if (!b.bunting || !vis(b.x0, b.x1, cx, VW)) continue; const live = beamLive(b, time), y = (live ? b.y - 3 : b.y - 46) - cy, x0 = b.x0 - cx, x1 = b.x1 - cx;
    r(g, x0 - 4, y - 70, 3, 80, K.woodD); r(g, x1 + 1, y - 70, 3, 80, K.woodD); bunting(g, x0 - 3, y - 4, x1 + 2, y - 4, live ? 3 : 1, time, F && F.effigyBurnT > 0 ? 1 : 0.3);
    if (live) { g.fillStyle = 'rgba(255,90,40,' + (0.35 + 0.25 * Math.sin(time * 12)).toFixed(2) + ')'; g.fillRect(Math.round(x0), Math.round(y + 3), Math.round(x1 - x0), 1); } }
  /* THE FALLEN STALLS in the lane: a broken counter, its awning on fire */
  for (const x of L.fallen || []) { const sx = x * TS - cx, row = (L.chases && L.chases[0] ? 30 : 27), sy = row * TS - cy; if (sx < -30 || sx > VW + 30) continue;
    r(g, sx - 3, sy + 2, 22, 14, K.woodD); r(g, sx - 3, sy + 2, 22, 2, K.woodL); for (let i = 0; i < 22; i += 6) r(g, sx - 3 + i, sy - 2, 3, 4, i % 12 ? K.cream : K.red);
    if (F && F.effigyBurnT > 0) for (let i = 0; i < 3; i++) { const f = 0.5 + 0.5 * Math.sin(time * 14 + i * 2 + x); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,' + (110 + 90 * f | 0) + ',40,0.6)'; g.beginPath(); g.moveTo(sx + i * 7 - 2, sy); g.lineTo(sx + i * 7 + 4, sy); g.lineTo(sx + i * 7 + 1, sy - 8 - 5 * f); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over'; } }
  /* THE COLLAPSING STALLS: a striped awning along each roof while it stands (src/tower-collapse.js draws its cracks and its count) */
  for (const c of L.crumbles || []) { if (c.st === 'down' || c.gone || c.kind !== 'stall') continue; const sx = c.x0 * TS - cx, sy = c.row * TS - cy, w = (c.x1 - c.x0 + 1) * TS; if (sx > VW + 20 || sx + w < -20) continue;
    for (let i = 0; i < w; i += 8) { r(g, sx + i, sy + 2, 8, 4, (i / 8) % 2 ? K.cream : K.red); g.fillStyle = (i / 8) % 2 ? K.cream : K.red; g.beginPath(); g.arc(sx + i + 4, sy + 6, 4, 0, Math.PI); g.fill(); }
    r(g, sx + 1, sy + 8, 2, 10, K.woodD); r(g, sx + w - 3, sy + 8, 2, 10, K.woodD); }
  /* A LONE BULL'S-EYE: nailed to a post, or hung under a ride's car (it goes round with it) */
  for (const Y of (G && G.galleries) || []) { if (Y.targets.length !== 1) continue; const t = Y.targets[0], x = Math.round((t.px ?? t.x * TS + 8) - cx), y = Math.round((t.py ?? t.row * TS + 8) - cy); if (x < -20 || x > VW + 20) continue;
    if (t.on) ln(g, x, y - 16, x, y - 7, '#5a4630'); else r(g, x - 1, y + 7, 2, 12, K.woodD);
    const hit = t.hit; g.fillStyle = hit ? '#5a5060' : K.cream; g.beginPath(); g.arc(x, y, 7, 0, 6.3); g.fill(); g.fillStyle = hit ? '#3a3040' : K.red; g.beginPath(); g.arc(x, y, 5, 0, 6.3); g.fill();
    g.fillStyle = hit ? '#5a5060' : K.cream; g.beginPath(); g.arc(x, y, 3, 0, 6.3); g.fill(); g.fillStyle = hit ? '#3a3040' : K.gold; g.fillRect(x - 1, y - 1, 2, 2);
    if (!hit) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,120,' + (0.12 + 0.1 * Math.sin(time * 5)).toFixed(2) + ')'; g.beginPath(); g.arc(x, y, 11, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over'; }
    if (t.flash > 0) { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,220,120,' + t.flash * 2 + ')'; g.beginPath(); g.arc(x, y, 14, 0, 6.3); g.fill(); g.globalCompositeOperation = 'source-over'; } }
}
/* a ticket plate over a gate: the price (or ALL), green once paid */
function plate(g, x, y, s, open, time) {
  const w = 8 + s.length * 5; r(g, x - w / 2, y - 6, w, 10, open ? '#3a6a3a' : '#ece0c4'); r(g, x - w / 2, y - 6, 3, 10, open ? '#5aa860' : K.teal);
  g.fillStyle = open ? '#dff7c8' : K.ink; g.font = '7px monospace'; g.textAlign = 'center'; g.fillText(s, x + 1, y + 2); g.textAlign = 'left';
}

/* THE DOOR IN THE GLASS: a pale door, shimmering, with the prompt over it */
export function drawMirrorDoor(g, pr, cx, cy, time, text) {
  const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy), a = 0.45 + 0.2 * Math.sin(time * 4);
  g.globalAlpha = a; r(g, x - 9, y - 26, 18, 26, '#c9a0ff'); r(g, x - 7, y - 24, 14, 24, '#2a1a3a'); r(g, x - 7, y - 24, 14, 2, '#dfe8ff'); r(g, x + 4, y - 13, 2, 2, K.gold); g.globalAlpha = 1;
  if (text) text('E', x, y - 36 + Math.round(Math.sin(time * 6)), '#c9a0ff', 'center', 6);
}

/* THE JUGGLER'S KNIFE: spinning end over end */
export function drawKnife(g, s, cx, cy) {
  g.save(); g.translate(Math.round(s.x - cx), Math.round(s.y - cy)); g.rotate((s.life || 0) * 18 * (s.vx < 0 ? -1 : 1));
  r(g, -1, -6, 2, 7, K.steel); r(g, 0, -6, 1, 6, '#eef4ff'); r(g, -2, 1, 4, 1, K.gold); r(g, -1, 2, 2, 4, K.red); g.restore();
}
/* THE COCONUT (the shield turns it) and THE SHY-BALL (a hard wooden ball: it does not) - R is the drunk's lob rect, already rotated */
export function drawShy(R, kind, OUTC) {
  if (kind === 'coconut') { R(-4, -4, 8, 8, OUTC); R(-3, -3, 6, 6, '#6a4a2a'); R(-3, -3, 6, 2, '#8a6a3c'); R(-2, -1, 1, 1, '#2a1a10'); R(0, -1, 1, 1, '#2a1a10'); R(-1, 1, 1, 1, '#2a1a10'); }
  else { R(-4, -4, 8, 8, OUTC); R(-3, -3, 6, 6, '#c8a040'); R(-3, -3, 3, 3, '#fff0b0'); R(-1, -1, 2, 2, K.red); }
}

/* THE KNIFE JUGGLER: a lean man in harlequin diamonds (red and gold), a pointed cap with a bell, a sash of knives. The archer's frames (src/chars.js bakeArcher), a man's height */
export function bakeJuggler() {
  const W = 30, H = 34, cx = 13, G = 33;
  const C = { a: '#b8382c', aD: '#7a2418', b: '#e8c23a', bD: '#a87a18', skin: '#d8a078', skinD: '#a8704e', hose: '#2a1a30', hoseD: '#1a1020', cap: '#3a7ab8', capD: '#22507a', bell: '#f0c840', sash: '#5a3a1e' };
  const knife = (g, x, y, up) => { if (up) { rect(g, x, y - 5, 1, 5, '#c9d1dc'); rect(g, x - 1, y, 3, 1, C.b); rect(g, x, y + 1, 1, 2, C.a); } else { rect(g, x, y, 5, 1, '#c9d1dc'); rect(g, x - 1, y - 1, 1, 3, C.b); rect(g, x - 3, y, 2, 1, C.a); } };
  const F = Array.from({ length: 8 }, (_, f) => { const [c, g] = canvas(W, H);
    const walk = f === 2 || f === 3, hurt = f === 7, k = f === 3 ? 1 : 0, lean = hurt ? -2 : f === 6 ? 2 : f === 5 ? -1 : 0, top = 12, hip = 22;
    for (const [lx, st] of [[cx - 3, walk ? (k ? -2 : 2) : 0], [cx + 1, walk ? (k ? 2 : -2) : 0]]) { rect(g, lx + st, hip, 3, G - 2 - hip, st >= 0 ? C.hose : C.hoseD); rect(g, lx + st - 1, G - 2, 4, 2, C.sash); }
    fillPoly(g, [[cx - 4 + lean, top], [cx + 4 + lean, top], [cx + 4, hip + 1], [cx - 4, hip + 1]], C.a);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const dx = cx - 2 + i * 4 + (lean > 0 ? 1 : 0), dy = top + 2 + j * 4 + (i & 1) * 2; px(g, dx, dy, C.b); px(g, dx + 1, dy + 1, C.b); px(g, dx - 1, dy + 1, C.bD); px(g, dx, dy + 2, C.bD); }
    line(g, cx - 4 + lean, top + 1, cx + 4, hip - 1, C.sash); for (let i = 0; i < 3; i++) px(g, cx - 2 + i * 2 + lean, top + 3 + i * 2, '#c9d1dc');   // the sash and its knives
    const hx = cx + 1 + lean, hy = top - 5; circle(g, hx, hy, 3.5, C.skin); px(g, hx + 2, hy - 1, C.hoseD); rect(g, hx + 1, hy + 2, 2, 1, C.aD);
    fillPoly(g, [[hx - 4, hy - 2], [hx + 4, hy - 2], [hx - 4, hy - 10]], C.cap); px(g, hx - 4, hy - 10, C.bell); px(g, hx - 5, hy - 10, C.bell);   // the cap, its bell
    const arm = (sx, ex, ey, col) => { line(g, sx, top + 2, ex, ey, col, 2); px(g, ex, ey, C.skin); };
    if (f === 0 || f === 4) { arm(cx - 4 + lean, cx - 7, top - 2, C.aD); arm(cx + 4 + lean, cx + 8, top - 2, C.a); knife(g, cx - 4, top - 10, true); knife(g, cx + 1, top - 15, true); knife(g, cx + 6, top - 9, true); }   // three in the air
    else if (f === 1 || f === 5) { arm(cx - 4 + lean, cx - 6, top + 6, C.aD); arm(cx + 4 + lean, cx - 2 + (f === 5 ? -3 : 0), top - 4, C.a); knife(g, cx - 2 + (f === 5 ? -3 : 0), top - 6, true); }   // a knife drawn back over the shoulder (the tell)
    else if (f === 6) { arm(cx - 4 + lean, cx - 6, top + 6, C.aD); arm(cx + 4 + lean, cx + 12, top + 1, C.a); }   // thrown: the arm flung out
    else if (hurt) { arm(cx - 4 + lean, cx - 9, top - 1, C.aD); arm(cx + 4 + lean, cx + 6, top + 8, C.a); }
    else { arm(cx - 4 + lean, cx - 6 - k, top + 8, C.aD); arm(cx + 4 + lean, cx + 6 + k, top + 7, C.a); }
    outline(c, OUT); return c; });
  const L = F.map(c => flipX(c)), white = F.map(c => whiten(c));
  return { R: F, L, white: { R: white, L: white.map(c => flipX(c)) }, ax: cx, ay: G, w: 10, h: 22 };
}
