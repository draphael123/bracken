// matriarch_sluice.js - THE SLUICE'S OWN ART on the Matriarch's ledge (claude/rgart art pass; pure drawing, no number or rule moves):
//   drawStandpipes(g, cx, cy, time, S, G, o)   BACK plane (before drawLedge): each bank's STANDPIPE - a coursed stone column on the channel side of its basket (so it clears the rope bridge's mast and cairn on the
//                                              bank side), iron bands, a spout cap, a brass PRESSURE GAUGE (the needle falls as the charge drains), a glass sight-tube, and a stone culvert at the foot
//   drawBaskets(g, cx, cy, time, S, G, o)      NEAR plane (after drawLedge, before her): the water column the basket rides on, the plank deck with iron-shod ends and a lit lip, a rope CRADLE to a ring and a
//                                              hook, side rails; the basket passes IN FRONT of the bridge it rises past. o.movers = ctx.movers(); o.text
//   drawWave(g, cx, cy, time, wave, G)         the sluice WAVE as a foam wall: a steep face, a curling lip, spray flung ahead, a long wash behind, streaks and bubbles
//   drawLeverMarker(g, x, y, time, hot, blink, text, VW, VH)   the lever's gold key-cap badge (a pixel E) over a pointer, with `LEVER` / `PULL (E)` over it
//   drawLeverLine(...)                         the lever-to-her line: marching gold dashes with chevrons toward her, a reticle at her feet, dots down the lever's post
import { MAT } from './../raptor-matriarch.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const S0 = { s0: '#2a1210', s1: '#46221a', s2: '#6a3626', s3: '#8e4e34', s4: '#b06a44', l1: '#eaa468', l2: '#fad39c' };
const W0 = { w0: '#1e1208', w1: '#3a2614', w2: '#5e4022', w3: '#86602e', w4: '#b08848', rope: '#c8a868', ropeD: '#7a5c34', ropeL: '#ecd49c', iron: '#3a3a44', ironL: '#8a8a98', brass: '#d9a83a', brassD: '#8a6418' };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const PIPE_W = 11;
/* the pipe's x (screen) for a basket: on the CHANNEL side of it */
const pipeX = (b, cx) => R((b.id === 'W' ? b.r + 3 : b.l - 3 - PIPE_W) - cx);

export function drawStandpipes(g, cx, cy, time, S, G, o) {
  const VW = o.VW; if (!S || !G.baskets) return;
  for (const b of G.baskets) { const B = S.press[b.id], px = pipeX(b, cx); if (px < -40 || px > VW + 40) continue;
    const top = R(b.y1 - 10 - cy), foot = R(G.floorY - cy), h = foot - top, k = Math.max(0, Math.min(1, B.charge / MAT.pressT));
    /* the stone column: courses 8 high, offset blocks, a lit west edge, a shaded east one */
    rc(g, px, top, PIPE_W, h, S0.s0);
    for (let y = 0, r = 0; y < h; y += 8, r++) { const yy = top + y, off = r & 1 ? 4 : 0; for (const bx of [0, 5]) { const x0 = px + 1 + ((bx + off) % PIPE_W), t = hash(r, bx) % 3; if (x0 + 5 > px + PIPE_W) continue; rc(g, x0, yy + 1, 5, Math.min(7, h - y - 1), t === 0 ? S0.s4 : t === 1 ? S0.s3 : S0.s2); rc(g, x0, yy + 1, 5, 1, S0.l1); } }
    rc(g, px, top, 1, h, S0.l1); rc(g, px + PIPE_W - 1, top, 1, h, S0.s0);
    /* the sight-tube: a glass slit down the face, filled as the charge */
    const th = h - 18; rc(g, px + 4, top + 6, 3, th, '#10181c');
    if (k > 0) { const gh = R(th * k); rc(g, px + 4, top + 6 + th - gh, 3, gh, '#4a8ac8'); rc(g, px + 4, top + 6 + th - gh, 3, 1, '#c8e8ff'); rc(g, px + 5, top + 6 + th - gh + (R(time * 14) % Math.max(1, gh)), 1, 1, '#fff'); }
    rc(g, px + 2, top + 5, 5, 1, W0.iron); rc(g, px + 2, top + 6 + th, 5, 1, W0.iron);
    /* iron bands */
    for (const by of [top + 20, top + 52, top + 84]) if (by < foot - 16) { rc(g, px - 1, by, PIPE_W + 2, 3, W0.iron); rc(g, px - 1, by, PIPE_W + 2, 1, W0.ironL); rc(g, px + 1, by + 1, 1, 1, '#c8c8d4'); rc(g, px + PIPE_W - 2, by + 1, 1, 1, '#c8c8d4'); }
    /* the spout cap: a slab with a bronze lip that points at its basket */
    const dir = b.id === 'W' ? -1 : 1; rc(g, px - 2, top - 4, PIPE_W + 4, 4, S0.s3); rc(g, px - 2, top - 4, PIPE_W + 4, 1, S0.l2); rc(g, px - 2, top - 1, PIPE_W + 4, 1, S0.s0);
    const sx = dir < 0 ? px - 6 : px + PIPE_W + 2; rc(g, sx, top - 3, 4, 3, W0.brass); rc(g, sx, top - 3, 4, 1, '#f0d070');
    if (B.charge > 0 && B.h > 0.02) for (let i = 0; i < 3; i++) rc(g, sx + 1 + dir * (i & 1), top + ((time * 40 + i * 5) % 12), 1, 2, 'rgba(200,232,255,0.8)');   /* a drip off the spout while it lifts */
    /* THE PRESSURE GAUGE: a brass-rimmed dial on a bracket at eye height, a red zone low, the needle falling with the charge */
    { const gx = px + (dir < 0 ? PIPE_W + 8 : -8), gy = foot - 34, r = 6; rc(g, dir < 0 ? px + PIPE_W : px - 3, gy - 1, 3, 3, W0.iron);   /* on the CHANNEL side of the pipe: the basket's water column is on the other */
      g.fillStyle = W0.brassD; g.beginPath(); g.arc(gx, gy, r + 1, 0, Math.PI * 2); g.fill(); g.fillStyle = W0.brass; g.beginPath(); g.arc(gx, gy, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#10181c'; g.beginPath(); g.arc(gx, gy, r - 1.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#8a2a22'; g.lineWidth = 1; g.beginPath(); g.arc(gx, gy, r - 2, Math.PI * 0.75, Math.PI * 1.05); g.stroke();   /* the red zone: nearly spent */
      g.strokeStyle = '#d8e8f0'; for (let t = 0; t < 5; t++) { const a = Math.PI * (0.75 + t * 0.375); g.beginPath(); g.moveTo(gx + Math.cos(a) * (r - 2), gy + Math.sin(a) * (r - 2)); g.lineTo(gx + Math.cos(a) * (r - 1), gy + Math.sin(a) * (r - 1)); g.stroke(); }
      const a = Math.PI * 0.75 + k * Math.PI * 1.5 + (k > 0 ? Math.sin(time * 30) * 0.05 : 0); g.strokeStyle = k > 0 ? '#ffe9a0' : '#9a9aa6'; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + Math.cos(a) * (r - 1.5), gy + Math.sin(a) * (r - 1.5)); g.stroke();
      rc(g, gx, gy, 1, 1, '#fff'); if (k > 0.02) { g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 6); g.fillStyle = '#9ad8ff'; g.beginPath(); g.arc(gx, gy, r + 2, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } }
    /* the culvert at the foot: a stone sill under the basket's column, the pipe's mouth */
    { const x0 = Math.min(px, R(b.l - cx)), x1 = Math.max(px + PIPE_W, R(b.r - cx)); rc(g, x0, foot - 8, x1 - x0, 8, S0.s2); rc(g, x0, foot - 8, x1 - x0, 1, S0.l1); rc(g, x0, foot - 1, x1 - x0, 1, S0.s0); for (let x = x0 + 4; x < x1 - 2; x += 8) rc(g, x, foot - 7, 1, 6, S0.s1); } }
}

export function drawBaskets(g, cx, cy, time, S, G, o) {
  const VW = o.VW, text = o.text; if (!S) return;
  for (const b of G.baskets) { const B = S.press[b.id], m = (o.movers || []).find(q => q.mbasket === b.id), y = m ? m.y : b.y0, x = R(b.l - cx), w = b.r - b.l; if (x < -60 || x > VW + 60) continue;
    const foot = R(G.floorY - cy) - 8, yy = R(y - cy), live = B.h > 0.02 || B.charge > 0;
    /* the column of water the deck rides: lit edges, bubbles climbing, a boil where the culvert feeds it */
    if (live && foot > yy + 6) { const top = yy + 6; g.globalAlpha = 0.72; rc(g, x + 3, top, w - 6, foot - top, '#4f8fc4'); g.globalAlpha = 0.5; rc(g, x + 3, top, 2, foot - top, '#bfe4ff'); rc(g, x + w - 5, top, 2, foot - top, '#1f4a7a'); g.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const t = (time * 1.4 + i * 0.37) % 1; rc(g, x + 6 + ((i * 9) % (w - 12)), foot - 2 - t * (foot - top - 2), 2, 2, 'rgba(232,244,255,' + (0.9 - t * 0.5).toFixed(2) + ')'); }
      for (let q = 0; q < w - 6; q += 5) rc(g, x + 3 + q, foot - 2 - ((time * 20 + q) % 3), 3, 2, 'rgba(244,251,255,0.85)'); }
    /* the cradle: four ropes from the deck's corners to an iron ring, and a hook above it */
    const ry = yy - 18, mx = x + w / 2; g.strokeStyle = W0.ropeD; g.lineWidth = 1; g.beginPath(); for (const sx of [x + 1, x + 7, x + w - 8, x + w - 2]) { g.moveTo(sx + 0.5, yy); g.lineTo(mx + 0.5, ry); } g.stroke();
    g.strokeStyle = W0.rope; g.beginPath(); g.moveTo(x + 1.5, yy); g.lineTo(mx + 0.5, ry); g.moveTo(x + w - 1.5, yy); g.lineTo(mx + 0.5, ry); g.stroke();
    g.strokeStyle = W0.iron; g.lineWidth = 2; g.beginPath(); g.arc(mx + 0.5, ry - 2, 3, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; rc(g, mx, ry - 9, 1, 4, W0.ironL); rc(g, mx - 1, ry - 10, 3, 1, W0.ironL);
    /* the deck: planks, a lit lip, a dark under-beam, iron-shod ends */
    rc(g, x - 1, yy, w + 2, 6, W0.w2); for (let k = 0; k < w + 2; k += 8) { rc(g, x - 1 + k, yy + 1, 7, 4, (k >> 3) & 1 ? W0.w3 : '#7a5628'); rc(g, x - 1 + k, yy + 1, 7, 1, W0.w4); rc(g, x - 1 + k + 7, yy, 1, 6, W0.w0); }
    rc(g, x - 1, yy, w + 2, 1, '#e8c070'); rc(g, x, yy + 6, w, 2, W0.w0); rc(g, x - 2, yy - 1, 3, 8, W0.iron); rc(g, x + w - 1, yy - 1, 3, 8, W0.iron); rc(g, x - 2, yy - 1, 3, 1, W0.ironL); rc(g, x + w - 1, yy - 1, 3, 1, W0.ironL);
    /* side rails: a stub post each end and a hand-rope */
    for (const sx of [x, x + w - 1]) rc(g, sx, yy - 9, 1, 9, '#d9b36a'); rc(g, x, yy - 9, w, 1, W0.ropeL);
    if (S.ph === 2 && B.charge > 0 && B.h < 0.3 && Math.floor(time * 4) % 2) text('UP', x + w / 2, yy - 24, '#8fd160', 'center', 5); }
}

/* THE WAVE: a foam wall running down the channel. wave = { x (its leading edge, world), dir }; the front is tall and steep, the lip curls over ahead of it, the body slopes away behind to a long wash */
export function drawWave(g, cx, cy, time, wave, G) {
  const wx = R(wave.x - cx), dir = wave.dir, bot = R(G.floorY - cy), H = 34, L = 52, tt = R(time * 30);
  for (let k = 0; k < L; k += 2) { const t = k / L, h = R(5 + (H - 5) * Math.pow(1 - t, 1.7) + Math.sin(time * 14 + k * 0.7) * 1.2), x = wx - dir * k - (dir > 0 ? 1 : 0), top = bot - h;
    rc(g, x, top, 2, h, t < 0.15 ? '#3f80b8' : t < 0.5 ? '#4a8cc4' : '#5aa0d0');                                    /* the body */
    rc(g, x, top + 4 + ((k * 3 + tt) % 5), 2, 1, '#8cc8ec');                                                           /* a bright rib sliding up it */
    rc(g, x, bot - 5, 2, 5, '#2a5a8a'); rc(g, x, top, 2, 3 + (t < 0.3 ? 1 : 0), '#f4fbff'); if (hash(k, tt >> 1) % 3 === 0) rc(g, x, top - 1, 2, 1, '#e8f4f8'); }
  /* the curling lip: a hooked arm of foam leaning over the front, and a boil of white at the foot */
  for (let i = 0; i < 6; i++) { const lx = wx + dir * (i * 1.6 - 1), ly = bot - H - 1 + (i > 3 ? i - 3 : 0) * 2 + (i === 5 ? 1 : 0); rc(g, lx - (dir < 0 ? 2 : 0), ly, 3, 3, i & 1 ? '#f4fbff' : '#cfe8f6'); }
  for (let i = 0; i < 5; i++) rc(g, wx + dir * (2 + i * 2) - 2, bot - 6 + ((i * 5 + tt) % 4), 4, 3, i & 1 ? '#f4fbff' : '#a8d4ec');
  /* spray flung ahead and up, and the white streaks laid along the wash */
  for (let i = 0; i < 9; i++) { const t = (time * 2.2 + i * 0.23) % 1; rc(g, wx + dir * (6 + t * 26 + (i % 3) * 4), bot - H - 4 - Math.sin(t * Math.PI) * 14 + (i % 4) * 2, 2, 2, 'rgba(244,251,255,' + (0.95 - t * 0.7).toFixed(2) + ')'); }
  g.globalAlpha = 0.8; for (let i = 0; i < 5; i++) rc(g, wx - dir * (10 + i * 8) - (dir > 0 ? 6 : 0), bot - 6 - i * 4 - ((tt + i * 7) % 3), 6, 1, '#e8f4f8'); g.globalAlpha = 1;
}

export function drawLeverMarker(g, lx, ly, time, hot, blink, text, VW, VH) {
  const c = hot && blink ? '#fff6c8' : '#ffd36b', bob = ly;
  /* a soft ring pulse when it is the one to pull */
  if (hot) { g.globalAlpha = 0.25 + 0.2 * Math.sin(time * 9); g.strokeStyle = '#ffe9a0'; g.beginPath(); g.arc(lx, bob - 6, 11 + 2 * Math.sin(time * 9), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
  rc(g, lx - 8, bob - 14, 16, 14, '#14101c'); rc(g, lx - 7, bob - 13, 14, 12, c); rc(g, lx - 6, bob - 12, 12, 10, '#3a2a14'); rc(g, lx - 6, bob - 12, 12, 1, '#5a4220');
  for (const [dx, dy, w, h] of [[-3, -10, 5, 2], [-3, -10, 2, 6], [-3, -7, 4, 2], [-3, -5, 5, 2]]) rc(g, lx + dx, bob + dy, w, h, c);   /* an E, 2 px thick */
  g.fillStyle = c; g.beginPath(); g.moveTo(lx - 4, bob); g.lineTo(lx + 4, bob); g.lineTo(lx, bob + 5); g.closePath(); g.fill();   /* the pointer: down at the lever */
  if (lx > 24 && lx < VW - 24 && bob - 22 > 6 && bob - 22 < VH - 8) text(hot ? 'PULL (E)' : 'LEVER', lx, bob - 22, c, 'center', 5);
}

export function drawLeverLine(g, x0, x1, y0, lx, lyTop, lyH, time, hot, blink) {
  const dir = Math.sign(x1 - x0) || 1, len = Math.abs(x1 - x0), off = (time * 46) % 12; g.globalAlpha = hot && blink ? 0.95 : 0.6;
  for (let d = 12 - off; d < len - 6; d += 12) { const xx = x0 + dir * d; rc(g, dir > 0 ? xx : xx - 6, y0, 6, 2, '#ffd36b');
    if (Math.round((d + off) / 12) % 3 === 0) { rc(g, xx + dir * 6, y0 - 2, 1, 6, '#fff6c8'); rc(g, xx + dir * 5, y0 - 1, 1, 4, '#fff6c8'); } }   /* a chevron every third dash, pointing at her */
  g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x1, y0 + 1, 9, 0, Math.PI * 2); g.stroke(); for (const [dx, dy] of [[-12, 0], [12, 0], [0, -12]]) rc(g, x1 + dx - 1, y0 + dy, 3, 2, '#fff6c8');   /* a reticle at her feet */
  for (let y = lyTop + ((time * 40) % 8); y < lyTop + lyH; y += 8) rc(g, lx - 1, y, 2, 4, '#ffd36b');   /* dots running down the lever's post */
  g.globalAlpha = 1;
}
