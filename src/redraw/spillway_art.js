// spillway_art.js - THE SPILLWAY's OWN LOOK (claude/rgart art pass; pure drawing: no collision, number or rule moves). The Spillway is the dam's own overflow cut: you go down off the dam's crest into
// a dry basin and climb its face to her nest. It used to wear the generic sunset backdrop (the gorge's back wall only covers cols 3-45). Now:
//   drawBackdrop(g, cx, cy, VW, VH, time)   BEHIND the tiles: the dam's MASONRY FACE above row 32 (ashlar courses, iron ties, weep stains, a crenelled crown, a heavy cornice at its foot) and the raw RED ROCK
//                                           below it (strata, varnish streaks, pale mineral weeps), with the DRY, STAINED SPILLWAY CHUTE down the channel's columns: a weir lip, polished slabs, tide-lines,
//                                           salt crust, dried slime, and a cracked stilling floor at the foot. Baked once; the wall is darker the deeper (the basin's shade).
//   drawProps(g, S, K)                      behind the heroes: the CREST's davit and rope (a timber post and jib over the lip, the rope run through a sheave and down the shaft), a CRANE and CHAIN for any
//                                           basket hung far from its water-wheel (sp3 at cols 80-81: a jib over its pulley on the head, a link chain down to the wheel's cog), and the HEAD SHELF's dressing
//                                           (her door's carved lintel and jamb, talon scars, hung plumes, bones)
//   tile(t, x, y, at, T, L)                 the kit's hook (src/redraw/redgorge_tiles.js): the head shelf's flagstone, a stone corbel slab where a ledge stands in the masonry, and the basin floor's scoured apron
import { canvas, mulberry } from '../px.js';
import { REDGORGE } from '../red-gorge.js';
const TS = 16, R = Math.round, SP = REDGORGE.spillway;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const WX0 = 46 * TS, WX1 = (SP.x1 + 1) * TS, WY0 = SP.top * TS, WY1 = (SP.floor + 1) * TS, FOOT = 33 * TS;   /* the wall's rect (world px); the masonry ends at row 32 */
const CH0 = SP.ch[0] * TS, CH1 = (SP.ch[1] + 1) * TS;
const M = { m0: '#2e1614', m1: '#3a1e1a', m2: '#46261f', m3: '#542e24', mL: '#6a3a2c', mD: '#140a0a', mort: '#100808', tie: '#1a1418', tieL: '#6a6674' };
const RRK = ['#4a1c14', '#5e2618', '#74301c', '#52200f', '#6a3420', '#82401f'];
const WOOD = { w0: '#1e1208', w1: '#3a2614', w2: '#5e4022', w3: '#86602e', w4: '#b08848', rope: '#c8a868', ropeD: '#7a5c34', ropeL: '#ecd49c', iron: '#3a3a44', ironL: '#8a8a98' };
const STONE = { s0: '#2a1210', s1: '#46221a', s2: '#6a3626', s3: '#8e4e34', s4: '#b06a44', l1: '#eaa468', l2: '#fad39c' };

/* ---- THE WALL, baked once (local px = world - (WX0, WY0)) ---- */
function bakeWall() {
  const W = WX1 - WX0, H = WY1 - WY0, [c, g] = canvas(W, H), r = mulberry(4401), foot = FOOT - WY0, cx0 = CH0 - WX0, cx1 = CH1 - WX0;
  /* the masonry: courses 16 high, blocks 26-44 wide, offset each course */
  const cols = [M.m1, M.m2, M.m1, M.m3, M.m0, M.m2];
  for (let y = 0, row = 0; y < foot; y += 16, row++) { let x = -((row * 13) % 30);
    while (x < W) { const bw = 26 + ((r() * 18) | 0), col = cols[(r() * cols.length) | 0], hh = Math.min(16, foot - y);
      rc(g, x + 1, y + 1, bw - 1, hh - 1, col); rc(g, x + 1, y + 1, bw - 1, 1, M.mL); rc(g, x + 1, y + hh - 1, bw - 1, 1, M.mD); rc(g, x + bw, y, 1, hh, M.mort);
      for (let i = 0; i < 3; i++) rc(g, x + 3 + ((r() * (bw - 6)) | 0), y + 3 + ((r() * 9) | 0), 1 + ((r() * 2) | 0), 1, r() < 0.5 ? M.mD : M.m3);
      if (r() < 0.05) { rc(g, x + 4, y + 4, bw - 8, hh - 7, M.mort); rc(g, x + 4, y + hh - 3, bw - 8, 1, M.m3); }   /* a block gone: a dark void, its lower lip lit */
      x += bw; }
    rc(g, 0, y, W, 1, M.mort); }
  /* the dam's iron ties: a plate, a rivet and a short bar, in rows down the face */
  for (let y = 40; y < foot - 20; y += 64) for (let x = 24 + ((y * 7) % 40); x < W - 12; x += 96) { rc(g, x, y, 8, 8, M.tie); rc(g, x, y, 8, 1, M.tieL); rc(g, x + 3, y + 3, 2, 2, M.tieL); rc(g, x + 8, y + 3, 10, 2, M.tie); rc(g, x + 8, y + 3, 10, 1, '#2a2630'); }
  /* the crown: coping, and the crenels she has broken */
  rc(g, 0, 0, W, 10, M.m3); rc(g, 0, 0, W, 2, '#8a5240'); rc(g, 0, 10, W, 2, M.mort);
  for (let x = 0; x < W; x += 24) { const gap = (x / 24 | 0) % 5 === 2; if (gap) rc(g, x, 0, 16, 6, '#12090c'); else { rc(g, x, 0, 22, 10, M.m3); rc(g, x, 0, 22, 1, '#a46a50'); rc(g, x + 22, 0, 2, 10, M.mort); } }
  /* weeps: long dark streaks from every joint, and a pale mineral crust under the coping and the cornice */
  for (let i = 0; i < 46; i++) { const x = (r() * W) | 0, y0 = 10 + ((r() * (foot - 60)) | 0), len = 24 + ((r() * 110) | 0); g.globalAlpha = 0.25; rc(g, x, y0, 1 + ((r() * 2) | 0), Math.min(len, foot - y0), '#0a0506'); g.globalAlpha = 0.12; rc(g, x + 1, y0, 1, Math.min(len, foot - y0), '#d8c4a0'); }
  g.globalAlpha = 1;
  /* the CORNICE at the masonry's foot: a heavy projecting course, lit on top, a deep shadow under */
  rc(g, 0, foot - 10, W, 10, STONE.s3); rc(g, 0, foot - 10, W, 1, STONE.l2); rc(g, 0, foot - 9, W, 1, STONE.l1); rc(g, 0, foot - 2, W, 2, STONE.s0);
  for (let x = 0; x < W; x += 20) rc(g, x, foot - 9, 1, 8, STONE.s1);
  /* the RED ROCK under it: strata with a wavy edge, seams, varnish streaks, pits */
  for (let y = foot; y < H; ) { const th = 5 + ((r() * 11) | 0), col = RRK[(r() * RRK.length) | 0], ph = r() * 6;
    for (let x = 0; x < W; x += 4) { const wob = Math.round(Math.sin(x / 55 + ph) * 3.2 + Math.sin(x / 17 + y) * 0.8); rc(g, x, y + wob, 4, th, col); } rc(g, 0, y, W, 1, '#1a0a08'); if (r() < 0.6) rc(g, 0, y + 1, W, 1, '#a0583a'); y += th; }
  for (let i = 0; i < 60; i++) { const x = (r() * W) | 0, y0 = foot + ((r() * (H - foot - 20)) | 0), len = 18 + ((r() * 90) | 0); g.globalAlpha = 0.14; rc(g, x, y0, 1, Math.min(len, H - y0), '#0c0506'); }
  for (let i = 0; i < 34; i++) { const x = (r() * W) | 0, y0 = foot + ((r() * (H - foot - 20)) | 0), len = 24 + ((r() * 100) | 0); g.globalAlpha = 0.13; rc(g, x, y0, 2, Math.min(len, H - y0), '#e8d2b0'); }   /* mineral weeps */
  g.globalAlpha = 1; for (let i = 0; i < 260; i++) rc(g, (r() * W) | 0, foot + ((r() * (H - foot)) | 0), 1 + ((r() * 3) | 0), 1, r() < 0.5 ? '#1a0a08' : '#7a4a2a');
  for (let i = 0; i < 9; i++) { let x = (r() * W) | 0, y = foot + 20 + ((r() * (H - foot - 80)) | 0); for (let k = 0; k < 34; k++) { rc(g, x, y, 1, 1, '#0c0506'); y++; if (r() < 0.4) x += r() < 0.5 ? -1 : 1; } }   /* hairline cracks */
  /* THE SPILLWAY CHUTE: the water's own road down the face. a weir lip, polished slabs, tide-lines, salt crust, dried slime */
  const chW = cx1 - cx0, kerb = 5;
  rc(g, cx0 - kerb - 2, 0, chW + (kerb + 2) * 2, H, 'rgba(0,0,0,0)');
  for (let y = 12; y < H; y += 1) { const tone = (Math.floor((y + 3) / 22) % 3), base = ['#7a5a48', '#8a6850', '#9a7860'][tone], seam = (y + 3) % 22 === 0;
    const inRock = y >= foot; for (let x = cx0; x < cx1; x++) { const e = Math.min(x - cx0, cx1 - 1 - x), a = e < 3 ? 0.78 : 1; g.globalAlpha = a; g.fillStyle = seam ? '#3a2418' : inRock ? ['#6a4a38', '#7a5a44'][((x >> 3) + (y >> 4)) & 1] : base; g.fillRect(x, y, 1, 1); } }
  g.globalAlpha = 1;
  for (let k = 0; k < 36; k++) { const x = cx0 + 3 + ((r() * (chW - 6)) | 0), y0 = 14 + ((r() * (H - 60)) | 0), len = 16 + ((r() * 90) | 0); g.globalAlpha = 0.3; rc(g, x, y0, 1, Math.min(len, H - y0 - 20), '#f2dcb8'); }   /* the polish: pale streaks along the flow */
  for (let y = 44; y < H - 30; y += 44 + ((r() * 30) | 0)) { let yy = y; g.globalAlpha = 0.55; for (let x = cx0 + 2; x < cx1 - 2; x++) { yy += r() < 0.18 ? (r() < 0.5 ? -1 : 1) : 0; rc(g, x, yy, 1, 1, '#2a1a12'); if (r() < 0.5) rc(g, x, yy + 1, 1, 1, '#d8c8a8'); } }   /* tide-lines: a dark edge, a pale salt rim under it */
  for (let k = 0; k < 18; k++) { const x = cx0 + 2 + ((r() * (chW - 4)) | 0), y0 = 20 + ((r() * (H - 80)) | 0); g.globalAlpha = 0.4; rc(g, x, y0, 2 + ((r() * 3) | 0), 3 + ((r() * 6) | 0), '#4a4a26'); g.globalAlpha = 0.5; rc(g, x, y0 + 1, 1, 1, '#7a8a4a'); }   /* dried slime */
  g.globalAlpha = 1;
  for (const sx of [cx0 - kerb, cx1]) { rc(g, sx, 12, kerb, H - 12, STONE.s2); rc(g, sx, 12, kerb, H - 12, 'rgba(0,0,0,0.0)'); for (let y = 14; y < H - 4; y += 12) { rc(g, sx, y, kerb, 11, (y / 12 | 0) & 1 ? STONE.s3 : STONE.s2); rc(g, sx, y, kerb, 1, STONE.l1); } rc(g, sx === cx0 - kerb ? sx : sx + kerb - 1, 12, 1, H - 12, STONE.s0); }   /* the kerb stones */
  /* the weir: a stone sill across the head of the chute, a lit lip, a dark under-shadow, teeth */
  rc(g, cx0 - kerb, 0, chW + kerb * 2, 14, STONE.s3); rc(g, cx0 - kerb, 0, chW + kerb * 2, 2, STONE.l2); rc(g, cx0 - kerb, 14, chW + kerb * 2, 3, M.mort); for (let x = cx0 - kerb + 3; x < cx1 + kerb - 2; x += 8) { rc(g, x, 4, 5, 8, STONE.s4); rc(g, x, 4, 5, 1, STONE.l1); }
  g.globalAlpha = 0.5; rc(g, cx0, 17, chW, 18, '#0a0506'); g.globalAlpha = 1;
  /* the stilling floor at the foot: scoured pale rock with a cracked, dried mud bed */
  { const fy = (SP.floor * TS) - WY0, fx0 = cx0 - 40, fx1 = cx1 + 40; g.globalAlpha = 0.9; rc(g, fx0, fy - 8, fx1 - fx0, 24, '#8a6850'); g.globalAlpha = 1; rc(g, fx0, fy - 8, fx1 - fx0, 1, '#bd9878');
    for (let i = 0; i < 40; i++) { let x = fx0 + ((r() * (fx1 - fx0)) | 0), y = fy - 6 + ((r() * 18) | 0); for (let k = 0; k < 8; k++) { rc(g, x, y, 1, 1, '#3a2418'); x += r() < 0.5 ? 1 : -1; y += r() < 0.3 ? 1 : 0; } } }
  /* the basin's shade: the deeper the darker; a dusk glow only along the crown */
  { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,170,110,0.18)'); gr.addColorStop(0.12, 'rgba(10,4,6,0.06)'); gr.addColorStop(1, 'rgba(8,2,4,0.62)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const el = g.createLinearGradient(0, 0, 70, 0); el.addColorStop(0, 'rgba(8,2,4,0.55)'); el.addColorStop(1, 'rgba(8,2,4,0)'); g.fillStyle = el; g.fillRect(0, 0, 70, H); }
  return c;
}
export function drawBackdrop(g, cx, cy, VW, VH, time) {
  if (cx + VW < WX0 || cx > WX1 || cy + VH < WY0 || cy > WY1) return;
  const wall = once('wall', bakeWall), sx0 = Math.max(0, R(WX0 - cx)), sx1 = Math.min(VW, R(WX1 - cx)), sy0 = Math.max(0, R(WY0 - cy)), sy1 = Math.min(VH, R(WY1 - cy));
  if (sx1 <= sx0 || sy1 <= sy0) return;
  g.drawImage(wall, sx0 - R(WX0 - cx), sy0 - R(WY0 - cy), sx1 - sx0, sy1 - sy0, sx0, sy0, sx1 - sx0, sy1 - sy0);
  /* the dusk's low light slanting down the masonry, a few drifting bands (the nest backdrop's own trick) */
  g.save(); g.beginPath(); g.rect(sx0, sy0, sx1 - sx0, Math.min(sy1, R(FOOT - cy)) - sy0); g.clip(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) { const x = R(WX0 - cx) + ((k * 211 + 60 + time * 2.2) % (WX1 - WX0 + 100)) - 50, a = 0.035 + 0.015 * Math.sin(time * 0.5 + k); g.fillStyle = 'rgba(255,190,120,' + a.toFixed(3) + ')'; g.beginPath(); g.moveTo(x, R(WY0 - cy)); g.lineTo(x + 26, R(WY0 - cy)); g.lineTo(x + 150, R(FOOT - cy)); g.lineTo(x + 124, R(FOOT - cy)); g.closePath(); g.fill(); }
  g.restore();
}

/* ---- PROPS ---- */
const chain = (g, x0, y0, x1, y1, sag, ph) => {   /* a link chain on a catenary: alternating flat and edge-on links, marching with ph (px) */
  const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.floor(L / 3)); let k = 0;
  for (let i = 0; i <= n; i++) { const t = i / n, tt = ((i + ph) % n + n) % n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(Math.PI * t) * sag; k = (i + Math.floor(ph)) & 1;
    if (k) { rc(g, x - 1, y - 1, 3, 2, WOOD.ironL); rc(g, x, y, 1, 1, WOOD.iron); } else { rc(g, x, y - 1, 1, 3, WOOD.iron); rc(g, x, y - 1, 1, 1, WOOD.ironL); } void tt; } };
export function drawProps(g, S, K) {
  const { cx, cy, vw, vh, time } = K;
  if (cx + vw < 48 * TS || cx > 96 * TS) return;
  /* THE CREST: a timber davit on the dam's lip - a post, a jib over the edge with a sheave at its tip - and the rope run through it, down the shaft; scuffs where the rope has worn the stone */
  { const lipX = R(53 * TS - cx), top = R(22 * TS - cy); if (lipX > -60 && lipX < vw + 60 && top > -90 && top < vh + 40) {
      const px = lipX - 14, jy = top - 22;
      rc(g, px - 6, top - 3, 14, 3, STONE.s3); rc(g, px - 6, top - 3, 14, 1, STONE.l1);   /* the footing */
      rc(g, px - 2, jy, 5, 22, WOOD.w2); rc(g, px - 2, jy, 1, 22, WOOD.w3); rc(g, px + 2, jy, 1, 22, WOOD.w1);   /* the post */
      for (const by of [top - 8, top - 16]) { rc(g, px - 3, by, 7, 2, WOOD.iron); rc(g, px - 3, by, 7, 1, WOOD.ironL); }
      rc(g, px - 2, jy - 2, 30, 4, WOOD.w2); rc(g, px - 2, jy - 2, 30, 1, WOOD.w3);   /* the jib, out over the lip */
      g.strokeStyle = WOOD.w2; g.lineWidth = 2; g.beginPath(); g.moveTo(px + 1, top - 6); g.lineTo(px + 16, jy + 2); g.stroke(); g.lineWidth = 1;   /* the brace */
      g.fillStyle = WOOD.iron; g.beginPath(); g.arc(lipX + 2, jy + 5, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = WOOD.ironL; g.fillRect(lipX + 1, jy + 1, 2, 1); g.fillStyle = '#10080c'; g.fillRect(lipX + 1, jy + 4, 2, 2);   /* the sheave */
      for (let y = jy + 9; y < top + 16; y += 2) { rc(g, lipX, y, 4, 2, ((y >> 1) & 1) ? WOOD.ropeD : WOOD.rope); rc(g, lipX + 1, y, 1, 2, WOOD.ropeL); }   /* the rope, twisted */
      for (let t = 0; t < 3; t++) { rc(g, px - 3, top - 22 + t * 3, 7, 2, ((t) & 1) ? WOOD.ropeD : WOOD.rope); }   /* the standing part, wound on the post */
      rc(g, px + 2, top - 20, 3, 5, WOOD.rope); rc(g, px + 3, top - 20, 3, 1, WOOD.ropeL);
      g.globalAlpha = 0.5; for (let i = 0; i < 4; i++) rc(g, lipX - 4 - i, top + i * 2, 2, 1, '#1a0a08'); g.globalAlpha = 1;   /* the rope-burn scuffs on the lip */
      rc(g, lipX - 38, top - 3, 10, 3, WOOD.rope); rc(g, lipX - 38, top - 3, 10, 1, WOOD.ropeL); rc(g, lipX - 36, top - 2, 6, 1, WOOD.ropeD); } }   /* a spare coil on the crest */
  /* THE CRANE AND CHAIN: a basket hung far from its water-wheel (sp3, cols 80-81) is wound by a chain from the wheel's cog up to a jib over its pulley, set on the head's edge */
  for (const m of K.movers()) if (m.gorge) { const w = (S.wheelsW || []).find(q => q.basket === m.gorge); if (!w) continue; const mx = m.x + m.w / 2; if (Math.abs(mx - w.x) < 4 * TS) continue;
    const side = Math.sign(mx - w.x) || 1, postX = R(mx + side * 24 - cx), surf = R(m.y1 - cy), jibY = R(m.y1 - 52 - cy), tipX = R(mx - cx), wx = R(w.x - cx), wy = R(w.y - cy);
    if (Math.max(postX, tipX, wx) < -40 || Math.min(postX, tipX, wx) > vw + 40 || surf < -90 || jibY > vh + 400) continue;
    rc(g, postX - 7, surf - 3, 14, 3, STONE.s3); rc(g, postX - 7, surf - 3, 14, 1, STONE.l1);
    rc(g, postX - 3, jibY - 3, 6, surf - jibY, WOOD.w2); rc(g, postX - 3, jibY - 3, 1, surf - jibY, WOOD.w3); rc(g, postX + 2, jibY - 3, 1, surf - jibY, WOOD.w1);
    for (const by of [surf - 10, surf - 26]) { rc(g, postX - 4, by, 8, 2, WOOD.iron); rc(g, postX - 4, by, 8, 1, WOOD.ironL); }
    rc(g, Math.min(postX, tipX) - 2, jibY - 3, Math.abs(postX - tipX) + 6, 4, WOOD.w2); rc(g, Math.min(postX, tipX) - 2, jibY - 3, Math.abs(postX - tipX) + 6, 1, WOOD.w3);
    g.strokeStyle = WOOD.w2; g.lineWidth = 2; g.beginPath(); g.moveTo(postX - side * 1, jibY + 22); g.lineTo(postX - side * 18, jibY - 1); g.stroke(); g.lineWidth = 1;
    g.fillStyle = WOOD.iron; g.beginPath(); g.arc(tipX, jibY + 4, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = WOOD.ironL; g.fillRect(tipX - 1, jibY, 2, 1);   /* the guide sheave */
    const ph = w.run ? (time * 24) : 0; chain(g, wx, wy - 2, tipX, jibY + 4, 14 + Math.abs(tipX - wx) * 0.05, ph);
    g.fillStyle = WOOD.iron; g.beginPath(); g.arc(wx, wy, 4, 0, Math.PI * 2); g.fill(); for (let k = 0; k < 8; k++) { const a = (w.a || 0) + k * Math.PI / 4; g.fillRect(R(wx + Math.cos(a) * 5) - 1, R(wy + Math.sin(a) * 5) - 1, 2, 2); }   /* the cog on the wheel's axle */
  }
  /* THE HEAD SHELF and HER DOOR: a carved lintel over the doorway, a stone pier on its west side, talon scars, hung plumes and bones. The door is col 95 (rows 16-21) */
  { const dx = R(95 * TS - cx), top = R(22 * TS - cy); if (dx > -80 && dx < vw + 80 && top > -40 && top < vh + 140) {
      const lt = top - 112;
      rc(g, dx - 18, lt, 52, 14, STONE.s2); rc(g, dx - 18, lt, 52, 2, STONE.l1); rc(g, dx - 18, lt + 12, 52, 2, STONE.s0); for (let x = dx - 14; x < dx + 30; x += 11) rc(g, x, lt + 3, 1, 9, STONE.s1);   /* the lintel */
      rc(g, dx - 14, lt + 14, 12, 98, STONE.s2); rc(g, dx - 14, lt + 14, 1, 98, STONE.l1); rc(g, dx - 3, lt + 14, 1, 98, STONE.s0); for (let y = lt + 24; y < top; y += 14) rc(g, dx - 14, y, 12, 1, STONE.s1);   /* the pier */
      g.strokeStyle = '#140808'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(dx - 12 + i * 3 + 0.5, lt + 40); g.lineTo(dx - 8 + i * 3 + 0.5, lt + 76); g.stroke(); }   /* her talon scars on the pier */
      for (let i = 0; i < 3; i++) { rc(g, dx - 8 + i * 12, lt + 14, 1, 10 + (i % 2) * 5, '#e8dcc0'); rc(g, dx - 9 + i * 12, lt + 24 + (i % 2) * 5, 3, 4, '#c8643a'); rc(g, dx - 8 + i * 12, lt + 26 + (i % 2) * 5, 1, 4, '#7a2e1c'); }   /* hung plumes */
      rc(g, dx - 30, top - 3, 12, 2, '#e8dcc0'); rc(g, dx - 33, top - 6, 4, 4, '#e8dcc0'); rc(g, dx - 32, top - 4, 1, 1, '#1a1008'); rc(g, dx - 27, top - 8, 1, 6, '#cdbfa0'); rc(g, dx - 24, top - 9, 1, 7, '#e8dcc0'); } }   /* bones at the threshold */
}

/* ---- TILES: the head shelf's flagstone, a corbelled stone slab for a ledge in the masonry, the scoured apron on the basin floor ---- */
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rc(g, x, y, 1, 1, c); };
function ashlarBody(g, x, y, mir) { rc(g, 0, 0, 16, 16, M.mort); const r = mulberry(hash(x & 3, y) + 5);
  for (let row = 0; row < 2; row++) { const off = ((y * 2 + row) & 1) ? 8 : 0; for (let bx = -8; bx < 16; bx += 16) { const xx = bx + off, t = r(); rc(g, xx + 1, row * 8 + 1, 15, 7, t < 0.2 ? '#5a2e24' : t < 0.55 ? M.m3 : M.m2); rc(g, xx + 1, row * 8 + 1, 15, 1, M.mL); rc(g, xx + 1, row * 8 + 7, 15, 1, M.mD); for (let i = 0; i < 3; i++) px2(g, xx + 2 + ((r() * 13) | 0), row * 8 + 2 + ((r() * 5) | 0), M.mD); } } void mir; }
const flagTile = (x, y, e) => once('fl' + (x & 3) + '_' + e, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, 22) + 9);
  ashlarBody(g, x, y + 1);   /* the shelf is the dam's own crown: dressed under, paved over */
  rc(g, 0, 0, 16, 6, '#a06a4c'); rc(g, 0, 0, 16, 1, STONE.l2); rc(g, 0, 1, 16, 1, STONE.l1); rc(g, 0, 2, 16, 1, '#c27c54'); rc(g, 0, 5, 16, 1, M.mort); rc(g, 8 + (x & 1) * 3 - 4, 1, 1, 5, '#6a3a2c');   /* a flagstone with its joint */
  for (let i = 0; i < 4; i++) px2(g, (r() * 16) | 0, 2 + ((r() * 3) | 0), '#7a4a38'); g.globalAlpha = 0.18; rc(g, 3, 1, 10, 2, '#fff0cc'); g.globalAlpha = 1;   /* worn by claws: a lighter patch */
  if (x % 5 === 2) { px2(g, 4, 3, '#2a1210'); px2(g, 5, 4, '#2a1210'); px2(g, 6, 3, '#2a1210'); }   /* a talon scratch */
  if (e & 1) rc(g, 0, 0, 1, 16, M.mort); if (e & 2) rc(g, 15, 0, 1, 16, M.m3); g.globalAlpha = 0.26; rc(g, 0, 6, 16, 10, '#000'); g.globalAlpha = 1; return c; });
const slabTile = (l, r2, v) => once('sl' + l + r2 + v, () => { const [c, g] = canvas(16, 16);
  rc(g, 0, 0, 16, 5, '#a06a4c'); rc(g, 0, 0, 16, 1, STONE.l2); rc(g, 0, 1, 16, 1, STONE.l1); rc(g, 0, 4, 16, 1, M.mort); rc(g, 5 + v * 3, 1, 1, 4, '#6a3a2c');
  rc(g, 0, 5, 16, 2, M.m2); rc(g, 0, 6, 16, 1, M.mD);   /* the slab's edge */
  for (const bx of [2, 10]) { rc(g, bx, 7, 4, 3, M.m3); rc(g, bx, 7, 4, 1, M.mL); rc(g, bx + 1, 10, 2, 2, M.m1); rc(g, bx, 12, 4, 1, M.mD); }   /* the corbels stepping in under it */
  if (l) { rc(g, 0, 0, 2, 6, '#c27c54'); px2(g, 0, 0, STONE.l2); } if (r2) rc(g, 14, 0, 2, 6, '#7a4a38'); return c; });
const apronTile = (x, topRow) => once('ap' + (x & 3) + topRow, () => { const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, 62) + 31);
  rc(g, 0, 0, 16, 16, '#8a6850'); for (let i = 0; i < 6; i++) { const w = 4 + ((r() * 6) | 0), xx = (r() * 12) | 0, yy = (r() * 14) | 0; rc(g, xx, yy, w, 2, r() < 0.5 ? '#9c7860' : '#7a5844'); rc(g, xx, yy, w, 1, '#bd9878'); }
  for (let i = 0; i < 3; i++) { let xx = (r() * 16) | 0, yy = 2 + ((r() * 10) | 0); for (let k = 0; k < 7; k++) { px2(g, xx, yy, '#3a2418'); xx += r() < 0.5 ? 1 : -1; yy += r() < 0.4 ? 1 : 0; } }   /* the dried mud's cracks */
  if (topRow) { rc(g, 0, 0, 16, 1, '#f2d8b4'); rc(g, 0, 1, 16, 1, '#ecc4a6'); rc(g, 0, 2, 16, 1, '#bd9878'); g.globalAlpha = 0.28; rc(g, 0, 3, 16, 3, '#000'); g.globalAlpha = 1; } else { g.globalAlpha = 0.2; rc(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; } return c; });
export function tile(t, x, y, at, T, L) {
  if (x < SP.x0 || x > SP.x1 + 1 || y < SP.top || y > SP.floor + 3) return null;
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR;
  if (t === T.SOLID) {
    if (y === SP.head && x >= 86 && air(0, -1)) return flagTile(x, y, (air(-1, 0) ? 1 : 0) | (air(1, 0) ? 2 : 0));
    if (y >= SP.floor && x >= SP.ch[0] - 1 && x <= SP.ch[1] + 1 && (y === SP.floor ? air(0, -1) : true) && at(x, SP.floor - 1) === T.AIR) return apronTile(x, y === SP.floor);
    return null;
  }
  if (t === T.ONEWAY && y <= 32) {
    const zs = L.ledgeZones || [], br = zs.some(z => y >= z[2] && y <= z[3] && x >= z[0] && x <= z[1]); if (br) return null;
    const same = k => at(x + k, y) === t; return slabTile(!same(-1), !same(1), x & 1);
  }
  return null;
}
