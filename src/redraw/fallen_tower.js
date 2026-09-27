// src/redraw/fallen_tower.js — THE FALLING TOWER's own look (docs/briefs/falling-tower-rework.md §5). It wore the Mage's Folly's
// library backdrop and its grey-olive brick, so the finale and the level before it could not be told apart at a glance (F6).
// This is a tower that is COMING DOWN: cold slate-blue ashlar, older and heavier than the Folly's violet brick, its coursing run out of
// true (the tower leans, so every joint steps as it climbs), cracks you can read across a room, and the back wall HOLED THROUGH to
// the night sky - wind streaking across the holes, dust sifting down, chains and ropes swaying. Every floor keeps its identity:
// the stacks, the reading room's great windows, the orrery's broken rings, the clock's cracked face, the cistern's pipes and seep,
// the bell frame, and the crown, which is mostly sky. Everything here is fillRect and px.js - no paths - so tools/fallingtower-art.mjs
// can render it in Node. Nothing is drawn in front of the camera (no occluder indoors).
//   bakeFallenSkins()   { fallen: [3 x 16x16] }       the tower's solid stone (L.mage.skins kind 'fallen')
//   bakeSlateLedge()    { ledge: [3], ledgeL, ledgeR } a cut slate slab for the one-way ledges (L.palette.ledges 'slate')
//   paintFallenRoom(g, st, sx, sy, w, h, tx0, ty0, time)   a room's back wall, baked once per room and then lit and moved live
import { canvas, px, rect, fillPoly, line, mulberry } from '../px.js';

export const FT = { stone: '#46506a', stoneL: '#56627e', stoneLL: '#6a7896', stoneD: '#343c52', mortar: '#252b3a', crack: '#12151e', crackL: '#7a88a6',
  dust: '#8e7e5e', dustL: '#b09c74', sky0: '#070a16', sky1: '#141c36', sky2: '#22305a', star: '#c8d4f0', wood: '#3e2e24', woodL: '#5a4434', woodD: '#261c16',
  brass: '#8a6a2e', brassL: '#c09a48', seep: '#4e6a34', bell: '#9a6e2a', bellL: '#d0a24c', chain: '#6e7486', rope: '#8e7650' };
/* THE BACK WALL is the same stone in shadow, two steps darker than the footing in front of it: a ledge must stand off its wall
   (the readability rule - no footing darker than the wall behind it), and the first page capture had the two the same colour */
const BW = { stone: '#2a3044', stoneL: '#343c54', stoneD: '#1f2433', mortar: '#161a25', alt1: '#262c3e', alt2: '#2e3549', pier: '#1a1e2b', pierL: '#242a3a' };
const LEAN = 1 / 10;   /* the tower's lean: a joint steps one pixel sideways for every ten it climbs */

export function bakeFallenSkins() {
  const tile = fn => [0, 1, 2].map(v => { const [c, g] = canvas(16, 16); fn(g, v); return c; });
  const fallen = tile((g, v) => {
    rect(g, 0, 0, 16, 16, FT.stone); rect(g, 0, 0, 16, 1, FT.stoneL); rect(g, 0, 7, 16, 1, FT.mortar); rect(g, 0, 15, 16, 1, FT.mortar);
    const j1 = (v * 5 + 3) % 16, j2 = (v * 5 + 11) % 16; for (let y = 0; y < 7; y++) px(g, (j1 + Math.floor(y * LEAN * 3)) % 16, y, FT.mortar); for (let y = 8; y < 15; y++) px(g, (j2 + Math.floor(y * LEAN * 3)) % 16, y, FT.mortar);
    rect(g, 1, 8, 5, 1, FT.stoneL); rect(g, 9, 1, 4, 1, FT.stoneLL);
    for (let i = 0; i < 5; i++) px(g, (i * 7 + v * 3) % 16, (i * 5 + v * 2) % 16, i % 2 ? FT.stoneD : FT.stoneL);
    if (v === 1) { line(g, 3, 2, 6, 6, FT.crack); line(g, 6, 6, 5, 10, FT.crack); px(g, 4, 2, FT.crackL); }   /* a crack in one stone in three */
    if (v === 2) { px(g, 12, 13, FT.dust); px(g, 13, 13, FT.dustL); px(g, 2, 5, FT.dust); } });
  return { fallen };
}
export function bakeSlateLedge() {
  const one = v => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 6, FT.stoneD); rect(g, 0, 1, 16, 3, FT.stoneL); rect(g, 0, 1, 16, 1, FT.stoneLL);
    rect(g, (v * 6 + 5) % 14, 2, 1, 3, FT.mortar); px(g, (v * 5 + 2) % 16, 5, FT.stoneD); px(g, (v * 5 + 3) % 16, 6, FT.stoneD); if (v === 1) px(g, 11, 4, FT.dust); return c; };
  const ledge = [0, 1, 2].map(one); return { ledge, ledgeL: ledge[0], ledgeR: ledge[2] };
}

// ---------- the rooms ----------
const cache = new Map();
/* a hole knocked through the back wall: a jagged outline round a rough ellipse, filled with night sky and stars */
function hole(g, r, cx, cy, rx, ry, holes) {
  const pts = []; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, j = 0.72 + r() * 0.42; pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]); }
  fillPoly(g, pts.map(([x, y]) => [x + 2, y + 2]), FT.stoneLL);                                  /* the broken edge, lit */
  fillPoly(g, pts, FT.sky1);
  fillPoly(g, pts.map(([x, y]) => [cx + (x - cx) * 0.8, cy + (y - cy) * 0.8 - ry * 0.2]), FT.sky0);   /* the sky deeper toward the top of the hole */
  for (let i = 0; i < rx * ry / 60; i++) { const x = cx + (r() - 0.5) * rx * 1.2, y = cy + (r() - 0.5) * ry * 1.2; if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 0.45) px(g, x, y, r() < 0.3 ? '#ffffff' : FT.star); }
  for (let k = 0; k < 6; k++) { const a = r() * Math.PI * 2; rect(g, cx + Math.cos(a) * rx * 0.95 - 2, cy + Math.sin(a) * ry * 0.95 - 1, 4, 3, FT.stoneD); }   /* a loose block on the lip */
  holes.push([cx - rx * 0.7, cy - ry * 0.6, rx * 1.4, ry * 1.2]);
}
function crack(g, r, x, y, len) { let cx = x, cy = y; for (let k = 0; k < len; k++) { const nx = cx + (r() - 0.5) * 6, ny = cy + 3 + r() * 3; line(g, cx, cy, nx, ny, FT.crack); px(g, nx + 1, ny, FT.crackL); if (r() < 0.25) line(g, nx, ny, nx + (r() < 0.5 ? -6 : 6), ny + 4, FT.crack); cx = nx; cy = ny; } }
/* WHERE A CUT-OUT MAY GO (round 2, docs/briefs/falling-tower-round2.md §1c). The holes and the Reading Room's windows were placed at
   random, so ledges, ropes, the orrery's shaft wall and the dividers ran straight across them (Daniel: "some clipping with windows and
   things like that"). `blocked(tx, ty)` says whether a tile stands at a world tile; a cut-out goes only where its box, with a margin,
   crosses no tile and no other cut-out. tools/tower-cutouts.mjs bakes every room of the built tower and holds it to that. */
const holeBox = (cx, cy, rx, ry) => ({ x: cx - rx * 1.2 - 4, y: cy - ry * 1.2 - 4, w: rx * 2.4 + 10, h: ry * 2.4 + 10 });
const meets = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
function fitter(blocked, tx0, ty0, cut) {
  return (b, m = 3) => { if (cut.some(q => meets(q, b))) return false; if (!blocked) return true;
    const a0 = Math.floor((b.x - m) / 16) + tx0, a1 = Math.floor((b.x + b.w + m - 1) / 16) + tx0, c0 = Math.floor((b.y - m) / 16) + ty0, c1 = Math.floor((b.y + b.h + m - 1) / 16) + ty0;
    for (let ty = c0; ty <= c1; ty++) for (let tx = a0; tx <= a1; tx++) if (blocked(tx, ty)) return false; return true; };
}
function bakeRoom(st, w, h, tx0, ty0, blocked = null) {
  const [c, g] = canvas(w, h), r = mulberry(tx0 * 131 + ty0 * 17 + st.length), holes = [], chains = [], wind = [], cut = [], fits = fitter(blocked, tx0, ty0, cut);
  /* A HOLE WHERE ONE FITS: the wanted spot first, then spots round it, then anywhere in the wall, smaller each round; none that fits, no hole */
  const putHole = (cx, cy, rx, ry) => { for (let k = 0; k < 48; k++) { const s = 1 - Math.floor(k / 8) * 0.14, x = k === 0 ? cx : k < 16 ? cx + (r() - 0.5) * 200 : 20 + r() * (w - 40), y = k === 0 ? cy : k < 16 ? cy + (r() - 0.5) * 140 : 12 + r() * (h * 0.8);
    const ax = Math.max(14, rx * s), ay = Math.max(10, ry * s), b = holeBox(x, y, ax, ay); if (b.x < 0 || b.y < 0 || b.x + b.w > w || b.y + b.h > h || !fits(b)) continue; cut.push(b); hole(g, r, x, y, ax, ay, holes); return true; } return false; };
  /* THE ASHLAR, out of true: courses of eight, blocks of 20-34, every joint stepping with the lean */
  rect(g, 0, 0, w, h, BW.stoneD);
  for (let y = 0, row = 0; y < h; y += 8, row++) { rect(g, 0, y, w, 1, BW.mortar); let x = -((row * 13 + Math.floor(y * LEAN)) % 28);
    while (x < w) { const bw = 20 + Math.floor(r() * 15), shade = r(); rect(g, x + 1, y + 1, bw - 1, 7, shade < 0.3 ? BW.alt1 : shade < 0.8 ? BW.stone : BW.alt2); rect(g, x + 1, y + 1, bw - 1, 1, BW.stoneL);
      if (r() < 0.12) rect(g, x + 3, y + 3, 3, 2, BW.stoneD); x += bw; } }
  /* LEANING BUTTRESSES: a darker pier every ~180 px, drawn as a parallelogram that leans right as it climbs */
  for (let bx = 60 + Math.floor(r() * 40); bx < w - 20; bx += 170 + Math.floor(r() * 40)) { const lean = h * LEAN * 0.8;
    fillPoly(g, [[bx, h], [bx + 18, h], [bx + 18 + lean, 0], [bx + lean, 0]], BW.pier); fillPoly(g, [[bx + 14, h], [bx + 18, h], [bx + 18 + lean, 0], [bx + 14 + lean, 0]], BW.pierL);
    for (let y = 10; y < h; y += 24) rect(g, bx + (h - y) * LEAN * 0.8, y, 18, 1, BW.mortar); }
  /* WHAT KIND OF ROOM IT WAS */
  if (st === 'library') for (let x = 20; x < w - 30; x += 96 + Math.floor(r() * 40)) { const tall = h * (0.45 + r() * 0.3), tilt = r() < 0.3 ? 0.25 : 0.04, bh = Math.round(tall);
    fillPoly(g, [[x, h], [x + 34, h], [x + 34 + bh * tilt, h - bh], [x + bh * tilt, h - bh]], FT.woodD);
    for (let y = h - 10; y > h - bh + 6; y -= 13) { const off = (h - y) * tilt; rect(g, x + 2 + off, y, 30, 2, FT.wood); for (let k = 0; k < 9; k++) if (r() < 0.75) rect(g, x + 3 + off + k * 3, y - 9, 2, 9, ['#4e2e32', '#2e4238', '#3a3656', '#5a4a2e'][k % 4]); } }
  if (st === 'reading') for (const fx of [0.25, 0.7]) { let wx = w * fx, wy = h * 0.2, ww = 54, wh = h * 0.5, ok = false;
    for (let k = 0; k < 60 && !ok; k++) { if (k) { wh = Math.max(40, h * 0.5 * (1 - Math.floor(k / 6) * 0.1)); wx = Math.max(8, Math.min(w - ww - 8, w * fx + (r() - 0.5) * 260)); wy = 10 + r() * Math.max(1, h - wh - 24); }
      const b = { x: wx - 7, y: wy - 4 - wh * 0.08, w: ww + 14, h: wh * 1.16 + 12 }; if (fits(b)) { cut.push(b); ok = true; } }
    if (!ok) continue;   /* no wall clear enough for a window: none, rather than one with a ledge across it */
    rect(g, wx - 4, wy - 4, ww + 8, wh + 8, '#2a3040'); hole(g, r, wx + ww / 2, wy + wh / 2, ww / 2, wh / 2, holes);
    for (let k = 1; k < 3; k++) rect(g, wx + k * ww / 3, wy, 2, wh * (0.4 + r() * 0.5), '#2a3040'); rect(g, wx - 6, wy + wh + 2, ww + 12, 3, FT.stoneLL); }
  if (st === 'orrery') for (let k = 0; k < 3; k++) { const ocx = w * (0.3 + k * 0.25), ocy = h * 0.4, R = 40 + k * 14;
    for (let a = 0; a < Math.PI * 2; a += 0.05) { if ((a + k) % 2.1 < 0.6) continue; rect(g, ocx + Math.cos(a) * R, ocy + Math.sin(a) * R * 0.45, 2, 2, FT.brass); px(g, ocx + Math.cos(a) * R, ocy + Math.sin(a) * R * 0.45 - 1, FT.brassL); } }
  if (st === 'clock') { let ccx = w / 2, ccy = h * 0.35, R = Math.min(96, h * 0.3);
    for (let k = 0; k < 40; k++) { const b = { x: ccx - R - 2, y: ccy - R - 2, w: R * 2 + 4, h: R * 2 + 4 }; if (fits(b)) { cut.push(b); break; } R = Math.max(40, R - 6); if (k > 8) { ccx = w / 2 + (r() - 0.5) * 240; ccy = h * (0.2 + r() * 0.4); } }
    for (let y = -R; y <= R; y++) { const hw = Math.sqrt(R * R - y * y); rect(g, ccx - hw, ccy + y, hw * 2, 1, y % 5 ? '#3a3e52' : '#34384a'); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; rect(g, ccx + Math.cos(a) * R * 0.85 - 2, ccy + Math.sin(a) * R * 0.85 - 2, 4, 4, FT.brassL); }
    line(g, ccx, ccy, ccx + R * 0.5, ccy - R * 0.3, FT.brass, 2); line(g, ccx, ccy, ccx - R * 0.2, ccy + R * 0.6, FT.brass, 2); crack(g, r, ccx - R * 0.3, ccy - R, 14); }
  if (st === 'lab') { for (let k = 0; k < 4; k++) { const py = h * (0.2 + k * 0.18); rect(g, 0, py, w, 5, '#3a3c40'); rect(g, 0, py, w, 1, '#5a5c60'); for (let x = 30 + k * 40; x < w; x += 150) rect(g, x, py - 3, 6, 11, '#4a4c50'); }
    for (let x = 40; x < w; x += 70 + Math.floor(r() * 50)) { const y0 = Math.floor(r() * h * 0.4), len = 40 + r() * h * 0.5; for (let y = y0; y < y0 + len; y += 2) px(g, x + Math.sin(y * 0.2) * 2, y, FT.seep); rect(g, x - 2, y0 + len, 5, 2, FT.seep); } }
  if (st === 'flip') { /* THE BELL FRAME: great timbers crossing behind, ropes hanging from them, and the bells that are left */
    for (const [ax, ay, bx, by] of [[0, h * 0.15, w, h * 0.55], [w, h * 0.12, 0, h * 0.6], [0, h * 0.42, w, h * 0.42]]) { line(g, ax, ay, bx, by, FT.woodD, 6); line(g, ax, ay - 2, bx, by - 2, FT.wood, 2); }
    for (let x = 50; x < w - 40; x += 110 + Math.floor(r() * 40)) { chains.push({ x, y: h * 0.3, len: 40 + r() * 60, bell: r() < 0.6, ph: r() * 6 }); } }
  /* THE ROOF IS GONE. It was two great holes in the wall, and the crown's whole stair ran across them; now the back wall stands only to a
     broken line and over it is the night - a silhouette the ledges stand against, not a window they cut */
  if (st === 'dome') { const edge = []; for (let x = 0; x <= w + 8; x += 8) edge.push([x, Math.round(h * (0.3 + 0.1 * Math.sin(x * 0.011 + 1) + (r() - 0.5) * 0.06))]);
    fillPoly(g, [[0, 0], ...edge, [w + 8, 0]], FT.sky1); fillPoly(g, [[0, 0], ...edge.map(([x, y]) => [x, y * 0.6]), [w + 8, 0]], FT.sky0);
    for (let i = 0; i < w / 5; i++) { const x = r() * w, y = r() * h * 0.28; px(g, x, y, r() < 0.3 ? '#ffffff' : FT.star); }
    for (let k = 1; k < edge.length; k++) { line(g, edge[k - 1][0], edge[k - 1][1] + 1, edge[k][0], edge[k][1] + 1, FT.stoneLL); if (r() < 0.3) rect(g, edge[k][0] - 2, edge[k][1] - 2, 4, 3, FT.stoneD); }
    holes.push([0, 0, w, h * 0.26]); }
  /* THE HOLES the tower has taken, and its cracks */
  const nh = st === 'dome' ? 1 : st === 'reading' ? 1 : 2 + Math.floor(r() * 2);
  for (let k = 0; k < nh; k++) putHole(w * (0.1 + k / nh * 0.8 + r() * 0.1), h * (0.1 + r() * 0.45) + (st === 'dome' ? h * 0.35 : 0), 30 + r() * 34, 22 + r() * 24);
  for (let k = 0; k < 5 + Math.floor(w / 160); k++) crack(g, r, r() * w, r() * h * 0.6, 6 + Math.floor(r() * 10));
  if (st !== 'flip') for (let x = 40; x < w; x += 150 + Math.floor(r() * 90)) if (r() < 0.6) chains.push({ x, y: 0, len: 30 + r() * 70, bell: false, ph: r() * 6 });
  /* DUST that has settled on every course near the floor */
  for (let i = 0; i < w / 5; i++) { const x = r() * w, y = h - 1 - Math.floor(r() * 3) * 8; rect(g, x, y - 1, 2 + r() * 4, 1, r() < 0.5 ? FT.dust : FT.dustL); }
  for (const H of holes) wind.push({ ...Object.fromEntries(['x', 'y', 'w', 'h'].map((k, i) => [k, H[i]])), ph: r() * 10 });
  return { canvas: c, wind, chains, cut };
}
/* THE CUT-OUTS OF ONE ROOM, as boxes in room pixels (holes, windows, the clock's face): what tools/tower-cutouts.mjs holds clear of the tiles */
export const fallenCutouts = (st, w, h, tx0, ty0, blocked) => bakeRoom(st, w, h, tx0, ty0, blocked).cut;
export function paintFallenRoom(g, st, sx, sy, w, h, tx0, ty0, time = 0, blocked = null) {
  const key = st + ':' + tx0 + ':' + ty0 + ':' + w + 'x' + h + (blocked ? ':fit' : ''); let R = cache.get(key); if (!R) { R = bakeRoom(st, w, h, tx0, ty0, blocked); cache.set(key, R); }
  g.drawImage(R.canvas, sx, sy);
  /* THE WIND through the holes: pale streaks crossing each hole, left to right */
  for (const W of R.wind) for (let k = 0; k < 3; k++) { const t = ((time * 0.6 + W.ph + k * 0.37) % 1), x = W.x + t * W.w, y = W.y + W.h * (0.25 + k * 0.25) + Math.sin(time * 2 + k) * 2;
    g.globalAlpha = 0.35 * Math.sin(t * Math.PI); g.fillStyle = '#c8d4f0'; g.fillRect(Math.round(sx + x), Math.round(sy + y), 10, 1); g.globalAlpha = 1; }
  /* THE CHAINS and bell-ropes, swaying: hung from the ceiling (or the frame), a slow pendulum each */
  for (const C of R.chains) { const a = Math.sin(time * 1.1 + C.ph) * 0.1, n = Math.floor(C.len / 3);
    for (let k = 0; k < n; k++) { const x = C.x + Math.sin(a) * k * 3, y = C.y + Math.cos(a) * k * 3; g.fillStyle = C.bell ? FT.rope : k % 2 ? FT.chain : '#4a4e5e'; g.fillRect(Math.round(sx + x), Math.round(sy + y), 1, 2); }
    if (C.bell) { const bx = Math.round(sx + C.x + Math.sin(a) * C.len), by = Math.round(sy + C.y + Math.cos(a) * C.len); g.fillStyle = FT.bell; g.fillRect(bx - 5, by, 11, 9); g.fillRect(bx - 7, by + 7, 15, 3); g.fillStyle = FT.bellL; g.fillRect(bx - 4, by + 1, 2, 6); } }
  /* DUST SIFTING DOWN from the cracks */
  g.fillStyle = FT.dustL; for (let k = 0; k < Math.floor(w / 90); k++) { const x = (k * 97 + tx0 * 7) % w, y = ((time * 22 + k * 53) % (h + 20)) - 10; g.globalAlpha = 0.5; g.fillRect(Math.round(sx + x + Math.sin(time + k) * 3), Math.round(sy + y), 1, 1); } g.globalAlpha = 1;
  return R;
}
