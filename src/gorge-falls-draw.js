// src/gorge-falls-draw.js - RED GORGE 3's THREE FALLS, the GREYBOX drawing (claude/redgorge3, 11-06). Plain shapes in the gorge's palette (rust rock + white water);
// the art lane paints the falls, the sluices, the levers, the ledge's lip, the standpipe and its basket (art before live). Called from src/raptor-matriarch-hands.js
// only when the arena is THE THREE FALLS (S.G.falls) - flag off, nothing here runs.
//   drawFalls3(g, cx, cy, time, S, G, o)        under the actors: each fall's sluice at the canyon's lip + its refill GAUGE, the fall itself (a dribble when banked,
//                                              the told TRICKLE, the white POUR), the levers (post + handle, its letter, full/refilling), the standpipe + basket,
//                                              the dam's loose slabs, phase three's water
//   drawFalls3Over(g, cx, cy, time, S, G, e, o) over everything: 'FALL!' over a trickling fall, a gold marker over the lever whose full fall she stands under,
//                                              a dashed line from it to her
import { F3, fallOver, fallFull, easeRide } from './gorge-falls.js';

const R = Math.round;
const ROCK = '#8a4a2e', ROCK_D = '#5e2e1c', LIP = '#b0603a', FOAM = '#f2f8fa', WATER = '#9fd0ec', DEEP = '#3a7ab8', GOLD = '#ffd36b', DIM = '#9aa39a';
const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };

export function drawFalls3(g, cx, cy, time, S, G, o = {}) {
  const text = o.text || (() => {}), floor = G.floorY, wet = S.ph === 3 && S.water > 0 ? (o.wy ?? floor) : null;
  for (const q of G.falls) { const F = S.falls[q.id], x0 = q.l - cx, w = q.r - q.l, lip = q.lipY - cy, bot = (wet ?? floor) - cy;
    /* the sluice: a carved rust lip across the fall's head, its gate (raised = dark mouth) and the GAUGE beside it */
    rect(g, ROCK_D, x0 - 6, lip - 14, w + 12, 16); rect(g, LIP, x0 - 6, lip - 14, w + 12, 3);
    const open = F.st === 'trickle' || F.st === 'pour' || F.st === 'flood';
    rect(g, open ? '#1a0e0a' : '#6a3a24', x0 + 2, lip - 10, w - 4, open ? 4 : 10);
    const gx = q.cx - cx + w / 2 + 10, gh = 26, k = F.st === 'full' || F.st === 'flood' ? 1 : F.st === 'refill' ? F.fill : 0;
    rect(g, '#1b1626', gx, lip - 14, 5, gh); rect(g, k >= 1 ? (Math.floor(time * 3) % 2 ? WATER : FOAM) : DEEP, gx + 1, lip - 14 + 1 + (gh - 2) * (1 - k), 3, (gh - 2) * k);
    text(q.id, q.cx - cx, lip - 22, k >= 1 ? GOLD : DIM, 'center', 6);
    /* the fall */
    if (F.st === 'pour' || F.st === 'flood') { rect(g, WATER, x0, lip, w, bot - lip); for (let i = 0; i < 6; i++) { const yy = lip + ((time * 260 + i * 37) % Math.max(1, bot - lip)); rect(g, FOAM, x0 + ((i * 13) % (w - 4)), yy, 3, 10); }
      rect(g, FOAM, x0 - 8, bot - 6, w + 16, 6); for (let i = 0; i < 5; i++) rect(g, FOAM, x0 - 10 + ((i * 17 + time * 40) % (w + 20)), bot - 10 - ((i * 7) % 6), 3, 3); }
    else if (F.st === 'trickle') { const k2 = 1 - Math.max(0, F.t) / F3.trickleT; rect(g, FOAM, q.cx - cx - 1, lip, 2, (bot - lip) * Math.min(1, k2 * 1.6)); for (let i = 0; i < 3; i++) rect(g, WATER, q.cx - cx - 4 + i * 4, bot - 3 - ((time * 30 + i * 5) % 6), 2, 2); }
    else { g.globalAlpha = 0.35; rect(g, DEEP, q.cx - cx - 2, lip, 4, bot - lip); g.globalAlpha = 1; }   /* banked: a wet streak down the rock (the fall's line, always shown) */
  }
  /* the levers: a post and a handle (up = full, down = spent), the letter of its fall, where it stands */
  for (const l of G.levers) { const x = l.x - cx, y = l.y - cy, full = fallFull(S, l.id);
    rect(g, ROCK_D, x - 4, y - 4, 8, 4); rect(g, '#9a8a6a', x - 1, y - 18, 3, 14); rect(g, full ? GOLD : DIM, full ? x - 1 : x + 1, full ? y - 24 : y - 10, full ? 7 : 7, 3);
    text(l.id, x, y - 30, full ? GOLD : DIM, 'center', 5); }
  /* THE STANDPIPE + its basket (phase two's ride): a stone pipe up beside the centre fall, its water = the pressure; a brass deck in a rope cradle */
  for (const b of G.baskets) { const B = S.press[b.id]; if (!B) continue; const px = b.r - cx + 2, top = b.y1 - cy - 6, bot = floor - cy;
    rect(g, ROCK_D, px, top, 7, bot - top); rect(g, '#6a3a24', px + 1, top, 1, bot - top);
    const fill = Math.max(0, Math.min(1, B.charge / (S.pressT || 8))); if (fill > 0) rect(g, WATER, px + 2, bot - (bot - top) * fill, 4, (bot - top) * fill);
    const dy = (S.ph === 3 && S.water > 0 ? Math.min(b.y0, (o.wy ?? b.y0) - 3) : b.y0 - (b.y0 - b.y1) * easeRide(B.h)) - cy, dx = b.l - cx;   /* the deck (the mover's own height: src/raptor-matriarch.js basketY) */
    rect(g, '#b08a3a', dx, dy, b.r - b.l, 4); rect(g, '#6a5020', dx, dy + 4, b.r - b.l, 2); g.strokeStyle = '#d9b36a'; g.beginPath(); g.moveTo(R(dx + 2), R(dy)); g.lineTo(R(dx + 16), R(dy - 14)); g.lineTo(R(dx + 30), R(dy)); g.stroke();
    if (S.ph === 2 && fill > 0 && B.h < 0.2) text('RIDE!', b.cx - cx, bot - 30, GOLD, 'center', 6); }
  /* the dam's loose slabs (phase three's stepping stones; they lie in the wide reaches until then): broken sluice stone, not timber (theme) */
  for (const m of (o.movers || [])) if (m.mplank) { rect(g, '#7a6a5a', m.x - cx, m.y - cy, m.w, m.h); rect(g, '#a89a88', m.x - cx, m.y - cy, m.w, 1); }
  if (wet != null) { g.globalAlpha = 0.55; rect(g, DEEP, G.x0 - cx, wet - cy, G.x1 - G.x0, floor + 16 - wet); g.globalAlpha = 1; rect(g, FOAM, G.x0 - cx, wet - cy, G.x1 - G.x0, 2); }
}

export function drawFalls3Over(g, cx, cy, time, S, G, e, o = {}) {
  const text = o.text || (() => {}), blink = Math.floor(time * 10) % 2;
  for (const q of G.falls) { const F = S.falls[q.id]; if (F.st === 'trickle') text('FALL!', q.cx - cx, q.lipY - cy + 22, blink ? '#ff9a5c' : '#fff6e0', 'center', 6); }
  if (S.ph !== 1 || !e || e.mode === 'fly' || S.ward > 0 || (e.open || 0) > 0) return;
  const q = fallOver(G, e.x, 30, f => fallFull(S, f.id) && f.id !== S.shy);
  for (const l of G.levers) { if (!fallFull(S, l.id)) continue; const hot = q && q.lever === l.id, x = R(l.x - cx), y = R(l.y - cy - 44 + Math.sin(time * 5) * 3);
    g.fillStyle = hot ? (blink ? GOLD : '#fff6c8') : 'rgba(255,211,107,0.45)'; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.lineTo(x, y + 6); g.fill();
    if (hot) { text('E', x, y - 8, GOLD, 'center', 6); g.strokeStyle = GOLD; g.setLineDash && g.setLineDash([3, 3]); g.beginPath(); g.moveTo(x, R(l.y - cy - 20)); g.lineTo(R(q.cx - cx), R(q.lipY - cy + 4)); g.stroke(); g.setLineDash && g.setLineDash([]); } }
  if (S.shy) { const s = G.falls.find(f => f.id === S.shy); if (s) text('SHE KNOWS IT', s.cx - cx, s.lipY - cy - 32, DIM, 'center', 5); }
}
