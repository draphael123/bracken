// skyroad_world.js - THE SKY ROAD's RULE, DRAWN (claude/skyroadart). The greybox drew every state in flat rectangles; this draws what each state IS:
//   THE CLOUD       a bank of cloud with a lit crown and a grey belly, and its SHADOW: a cool dark band with a ragged, dithered edge that runs down through everything, so the player reads the
//                   edge coming. Under it the rock is cold.
//   THE THERMAL     LIVE: a column of heated air, its rising bands a pale gold, glints and ash-motes spiralling up it, the rock at its foot glowing orange with a warm light pool on the stone round it.
//                   DEAD (stone not turned): the foot is a cold slate plate with a faint dotted ghost of the column, so you can see it is waiting.   ABOUT TO DIE: it flickers (1.2 s ahead).
//                   SHADED: the foot greys and goes out, frost-pale
//   THE SUN-STONE   a carved sun-glyph slab on a plinth. OFF: slate, the glyph dull, a cold rim. TURNING: it rolls over. ON: gold, the glyph blazing, rays, a warm pool and sparks
//   THE SUN-DISC    a bronze disc on an iron post with a ring of rays. UNLIT: dull bronze, a dotted line to the road. LIT: it burns, a beam to the road, a pool, the last four seconds flash
//   THE REEL        the flue's hot air, the war-kite (red and cream, cross-spars, a tail), its line, and the cage (iron-framed reed basket)
//   and the station's mast with the cloak, the riders' loft's woven door, the kite platform, the Roc's feathers, the broken bridgehead, the nests
import { mulberry } from '../px.js';
const glow = (g, x, y, r, a, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(Math.round(x - r), Math.round(y - r), r * 2, r * 2); };
const add = (g, fn) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };
const R = Math.round;

/* ---------------------------------------- CLOUDS and their SHADOWS ---------------------------------------- */
export function drawCloud(g, c, cx, cy, VW, VH, time) {
  const x0 = R(c.a - cx), x1 = R(c.b - cx); if (x1 < -40 || x0 > VW + 40) return;
  /* the shadow: down through everything, a cool band with a ragged edge (the edge is the warning) */
  g.fillStyle = 'rgba(30,38,76,0.2)'; g.fillRect(x0, 0, x1 - x0, VH);
  g.fillStyle = 'rgba(30,38,76,0.1)'; g.fillRect(x0 - 3, 0, 3, VH); g.fillRect(x1, 0, 3, VH);
  g.fillStyle = 'rgba(30,38,76,0.12)'; for (let y = 0; y < VH; y += 4) { const j = ((y * 7 + (c.left | 0)) % 5); g.fillRect(x0 - 1 - j, y, 1 + j, 2); g.fillRect(x1, y + 2, 1 + (4 - j), 2); }
  /* the cloud itself, high over the shadow: puffs with a lit crown and a grey belly */
  const w = c.z.w, lx = R(c.left - cx), top = 6;
  g.fillStyle = '#9aa4c4'; g.fillRect(lx + 6, top + 22, w - 12, 5);
  for (let k = 0; k < 6; k++) { const px = lx + w * (k + 0.5) / 6, r = 9 + ((k * 7) % 3) * 4, py = top + 15 + (k % 2) * -2;
    g.fillStyle = '#aab4d2'; g.beginPath(); g.arc(px, py + 3, r, 0, 7); g.fill(); g.fillStyle = '#d8dfee'; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill();
    g.fillStyle = '#f8f6f8'; g.beginPath(); g.arc(px - 2, py - 3, r * 0.62, 0, 7); g.fill(); g.fillStyle = '#fff4e0'; g.beginPath(); g.arc(px - 4, py - 5, r * 0.3, 0, 7); g.fill(); }
  g.fillStyle = '#c4cce2'; g.fillRect(lx + 4, top + 20, w - 8, 4);
}

/* ---------------------------------------- THERMALS ---------------------------------------- */
export function drawThermal(g, pr, cx, cy, time, top, k, flick) {
  const x = R(pr.x - cx), foot = R(pr.y - cy), tp = R(top - cy);
  if (x < -40 || x > 600 || foot < -20 || tp > 400) return;
  const h = Math.max(20, foot - tp), hw = pr.w;
  if (k > 0.03) {
    /* the column: three rising bands of pale gold, wavering, the air itself */
    add(g, () => {
      const gr = g.createLinearGradient(0, foot, 0, tp); gr.addColorStop(0, 'rgba(255,200,110,' + (0.2 * k * flick).toFixed(3) + ')'); gr.addColorStop(0.6, 'rgba(255,226,160,' + (0.1 * k * flick).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = gr; g.fillRect(x - hw, tp, hw * 2, h);
      for (let b = 0; b < 3; b++) { const ph = (time * (34 + b * 9) + b * 53) % h; g.fillStyle = 'rgba(255,238,190,' + (0.09 * k * flick * (1 - ph / h)).toFixed(3) + ')'; g.fillRect(x - hw + Math.round(Math.sin(time * 2 + b) * 2), R(foot - ph - 3), hw * 2, 3); }
      glow(g, x, foot - 4, 30, 0.32 * k * flick, '255,160,60'); });
    for (let i = 0; i < 10; i++) { const ph = (time * (56 + i * 6) + i * 43) % h, yy = foot - ph, xx = x + Math.sin(time * 2.6 + i * 1.7 + yy * 0.045) * (hw - 3) * (0.5 + 0.5 * (ph / h));
      g.globalAlpha = (0.3 + 0.5 * k) * flick * (1 - ph / h); g.fillStyle = i % 3 === 0 ? '#ffb84a' : i % 3 === 1 ? '#fff6c8' : '#e8d0a0'; g.fillRect(R(xx), R(yy), 1, i % 2 ? 3 : 2); }
    g.globalAlpha = 1;
    /* a torn scrap of kite-cloth and a feather carried up it (the wind has a load) */
    { const ph = (time * 30 + pr.x * 3) % (h + 40), yy = foot - ph, xx = x + Math.sin(time * 3 + pr.x) * (hw - 4); if (ph < h) { g.globalAlpha = 0.9 * flick; g.fillStyle = '#c9463d'; g.fillRect(R(xx), R(yy), 3, 2); g.fillStyle = '#efe6d2'; g.fillRect(R(xx) + 1, R(yy) + 1, 2, 1); g.globalAlpha = 1; } }
  } else if (pr.src0 === false) {   /* DEAD until its stone is struck: a faint dotted ghost of the column, waiting */
    g.fillStyle = 'rgba(200,210,240,0.2)'; for (let y = foot - 6; y > Math.max(tp, foot - 80); y -= 6) { g.fillRect(x - hw, y, 1, 2); g.fillRect(x + hw - 1, y, 1, 2); }
    g.fillStyle = 'rgba(200,210,240,0.3)'; g.fillRect(x - 2, foot - 10 - ((time * 6) % 10 | 0), 1, 1);
  }
  /* the rock it rises from: a plate worked into the stone, orange and cracked when hot, slate when waiting, frost-pale under a cloud */
  const hot = k > 0.25, dead = pr.src0 === false, shaded = !hot && !dead;
  g.fillStyle = hot ? '#5a2410' : dead ? '#2c2c3c' : '#6a7490'; g.fillRect(x - 9, foot - 3, 18, 3);
  g.fillStyle = hot ? '#ff8a2a' : dead ? '#4a4a60' : '#a0acc8'; g.fillRect(x - 8, foot - 3, 16, 1);
  if (hot) { g.fillStyle = '#ffd36b'; for (const dx of [-6, -2, 3, 6]) g.fillRect(x + dx, foot - 3, 1, 1); g.fillStyle = '#ff5a1a'; g.fillRect(x - 5, foot - 2, 3, 1); g.fillRect(x + 1, foot - 2, 4, 1);
    add(g, () => glow(g, x, foot - 2, 18, 0.24 * k, '255,120,40')); }
  else if (dead) { g.fillStyle = '#6a6a84'; for (const dx of [-6, -2, 3, 6]) g.fillRect(x + dx, foot - 2, 1, 1); }
  else { g.fillStyle = '#d8e0f0'; g.fillRect(x - 3, foot - 4, 2, 1); g.fillRect(x + 2, foot - 4, 3, 1); }
  void shaded;
  if (pr.shade === 'hawk' && k < 0.5) { g.fillStyle = 'rgba(30,24,40,0.6)'; g.beginPath(); g.ellipse(x, foot - 3, 9, 2, 0, 0, 7); g.fill(); }
}

/* ---------------------------------------- THE SUN-STONE ---------------------------------------- */
export function drawStone(g, s, cx, cy, time, VW) {
  const x = R(s.x - cx), y = R(s.y - cy); if (x < -30 || x > VW + 30) return;
  const turning = s.turnT > 0, t = turning ? 1 - s.turnT / 0.6 : 1, sq = turning ? Math.abs(Math.cos(t * Math.PI)) : 1, lift = turning ? R(7 * Math.sin(t * Math.PI)) : 0, on = turning ? t > 0.5 : s.on;
  /* the plinth: cut stone, banded with iron */
  g.fillStyle = '#2a2430'; g.fillRect(x - 10, y - 4, 20, 4); g.fillStyle = '#4a4252'; g.fillRect(x - 9, y - 4, 18, 1); g.fillStyle = '#8a7a98'; g.fillRect(x - 9, y - 4, 4, 1);
  g.fillStyle = '#14101a'; g.fillRect(x - 3, y - 6, 6, 2);
  /* the slab, standing on its edge in a cradle: it rolls over to face the sun */
  const w = Math.max(2, R(16 * sq)), h = 15;
  g.save(); g.translate(x, y - 5 - lift);
  g.fillStyle = on ? '#6a3a0a' : '#1a1622'; g.fillRect(-(w >> 1) - 1, -h - 1, w + 2, h + 1);
  g.fillStyle = on ? '#e8a030' : '#4a4658'; g.fillRect(-(w >> 1), -h, w, h);
  g.fillStyle = on ? '#ffd36b' : '#6a6678'; g.fillRect(-(w >> 1), -h, w, 2); g.fillRect(-(w >> 1), -h, 2, h);
  g.fillStyle = on ? '#b86a14' : '#2c2838'; g.fillRect(w - (w >> 1) - 2, -h + 2, 2, h - 2); g.fillRect(-(w >> 1), -2, w, 2);
  if (w > 8) { /* the sun glyph: a ring and eight rays, blazing or dull */
    g.fillStyle = on ? '#fff2b0' : '#7a7690'; g.fillRect(-2, -10, 4, 4); g.fillStyle = on ? '#e8a030' : '#4a4658'; g.fillRect(-1, -9, 2, 2);
    g.fillStyle = on ? '#fff2b0' : '#7a7690'; for (const [dx, dy] of [[0, -13], [0, -3], [-5, -8], [5, -8], [-4, -12], [4, -12], [-4, -4], [4, -4]]) g.fillRect(dx, dy, 1, 2); }
  g.restore();
  if (on) {
    add(g, () => { glow(g, x, y - 12, 34 + Math.sin(time * 4) * 2, 0.36, '255,190,80'); glow(g, x, y - 1, 22, 0.22, '255,150,50'); });
    g.fillStyle = '#fff6c8'; for (let i = 0; i < 4; i++) { const ph = (time * 1.4 + i * 0.27) % 1; g.globalAlpha = 1 - ph; g.fillRect(x - 8 + i * 5 + R(Math.sin(time * 3 + i) * 2), R(y - 14 - ph * 20), 1, 2); } g.globalAlpha = 1;
  } else { g.fillStyle = 'rgba(160,170,210,0.55)'; g.fillRect(x - 8, y - 2, 16, 1); }
}

/* ---------------------------------------- THE SUN-DISC ---------------------------------------- */
export function drawDisc(g, d, lit, left, far, road, cx, cy, time) {
  const x = R(d.x - cx), y = R(d.y - cy); if (x < -60 || x > 700) return;
  /* the iron post and its brace */
  g.fillStyle = '#14141c'; g.fillRect(x - 3, y - 26, 6, 26); g.fillStyle = '#3a3a48'; g.fillRect(x - 2, y - 26, 4, 26); g.fillStyle = '#9a9ab0'; g.fillRect(x - 2, y - 26, 1, 26);
  g.fillStyle = '#14141c'; g.fillRect(x - 8, y - 4, 16, 4); g.fillStyle = '#4a4a5a'; g.fillRect(x - 7, y - 4, 14, 1);
  const cyD = y - 38, rr = 14;
  /* the ring of rays */
  g.fillStyle = lit ? '#ffd36b' : '#7a5a2a'; for (let a = 0; a < 16; a++) { const an = a * Math.PI / 8 + (lit ? time * 0.4 : 0), l0 = rr + 2, l1 = rr + (a % 2 ? 5 : 8) + (lit ? Math.sin(time * 8 + a) : 0); g.save(); g.translate(x, cyD); g.rotate(an); g.fillRect(l0, -1, l1 - l0, 2); g.restore(); }
  g.fillStyle = '#1c1420'; g.beginPath(); g.arc(x, cyD, rr + 1, 0, 7); g.fill();
  g.fillStyle = lit ? '#ffb030' : '#8a6228'; g.beginPath(); g.arc(x, cyD, rr - 1, 0, 7); g.fill(); g.fillStyle = lit ? '#ffd870' : '#a47a38'; g.beginPath(); g.arc(x - 1, cyD - 1, rr - 4, 0, 7); g.fill();
  g.fillStyle = lit ? '#fffbe0' : '#c8a060'; g.beginPath(); g.arc(x - 4, cyD - 4, 4, 0, 7); g.fill(); g.fillStyle = lit ? '#e87a14' : '#6a4a1c'; g.beginPath(); g.arc(x, cyD, 4, 0, 7); g.fill(); g.fillStyle = lit ? '#fff2b0' : '#8a6a38'; g.beginPath(); g.arc(x, cyD, 2, 0, 7); g.fill();
  if (lit) add(g, () => { glow(g, x, cyD, 60, 0.4 + 0.06 * Math.sin(time * 5), '255,190,80'); });
  if (far) {   /* the beam to the last thermal of the road: solid and burning when lit, a dotted dull line when not */
    const fx = R(far.x - cx), fy = R(far.y - cy);
    if (lit) add(g, () => { g.strokeStyle = 'rgba(255,214,130,' + (0.3 + 0.08 * Math.sin(time * 6)).toFixed(3) + ')'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, cyD); g.lineTo(fx, fy); g.stroke(); g.strokeStyle = 'rgba(255,248,210,0.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, cyD); g.lineTo(fx, fy); g.stroke(); });
    else { g.strokeStyle = 'rgba(200,160,96,0.3)'; g.lineWidth = 1; g.setLineDash([3, 5]); g.beginPath(); g.moveTo(x, cyD); g.lineTo(fx, fy); g.stroke(); g.setLineDash([]); }
    for (const pr of road) { const rx = R(pr.x - cx), ry = R(pr.y - cy); g.fillStyle = lit ? '#ffd36b' : '#5a4630'; g.fillRect(rx - 4, ry - 5, 8, 3); g.fillStyle = lit ? '#fff6c8' : '#7a6448'; g.fillRect(rx - 4, ry - 5, 8, 1); }
  }
  if (lit && left < 4 && Math.floor(time * 6) % 2) { g.fillStyle = '#ff9a5c'; g.fillRect(x - 14, cyD - 28, 28, 2); }
}

/* ---------------------------------------- THE STATION's furniture ---------------------------------------- */
export function drawMast(g, dc, cx, cy, S, time) {   /* the cloak's mast: a tall iron mast, a yard, the cloak (red, cream-barred) until taken */
  const x = R(dc.x * 16 + 8 - cx), y = R((dc.y + 1) * 16 - cy);
  g.fillStyle = '#14141c'; g.fillRect(x - 2, y - 44, 5, 44); g.fillStyle = '#3a3a48'; g.fillRect(x - 1, y - 44, 3, 44); g.fillStyle = '#9a9ab0'; g.fillRect(x - 1, y - 44, 1, 44);
  g.fillStyle = '#14141c'; g.fillRect(x - 12, y - 44, 25, 3); g.fillStyle = '#4a4a5a'; g.fillRect(x - 11, y - 44, 23, 1); g.fillStyle = '#ffd870'; g.fillRect(x - 1, y - 48, 3, 4);
  g.fillStyle = '#14141c'; g.fillRect(x - 5, y - 4, 11, 4); g.fillStyle = '#4a4a5a'; g.fillRect(x - 4, y - 4, 9, 1);
  if (!S.cloak || S.hung) { const sw = Math.sin(time * 2 + 1) * 1.5;
    g.fillStyle = '#7a2218'; g.fillRect(x - 11, y - 41, 23, 19); g.fillStyle = '#c9463d'; g.fillRect(x - 10, y - 41, 21, 17 + R(sw)); g.fillStyle = '#e8705a'; g.fillRect(x - 10, y - 41, 21, 2);
    g.fillStyle = '#efe6d2'; g.fillRect(x - 10, y - 38, 21, 3); g.fillRect(x - 1, y - 35, 3, 12 + R(sw)); g.fillStyle = '#7a2218'; for (let k = 0; k < 4; k++) g.fillRect(x - 10 + k * 6, y - 24 + R(sw), 4, 2); }
  add(g, () => glow(g, x, y - 30, 38, 0.1, '255,200,120'));
}
export function drawFlue(g, dc, cx, cy, hot, time) {   /* the reel's chimney: a stone flue bound with iron, a scorched mouth */
  const x = R(dc.x * 16 + 8 - cx), y0 = R(dc.y0 * 16 - cy), y1 = R((dc.y1 + 1) * 16 - cy);
  g.fillStyle = '#2a2430'; g.fillRect(x - 10, y0, 26, y1 - y0); g.fillStyle = '#6a5e6c'; g.fillRect(x - 8, y0, 22, y1 - y0); g.fillStyle = '#9a8ea0'; g.fillRect(x - 8, y0, 4, y1 - y0); g.fillStyle = '#463e4c'; g.fillRect(x + 10, y0, 4, y1 - y0);
  for (let y = y0 + 6; y < y1 - 3; y += 14) { g.fillStyle = '#2a2a34'; g.fillRect(x - 10, y, 26, 3); g.fillStyle = '#8a8aa0'; g.fillRect(x - 10, y, 26, 1); }
  g.fillStyle = '#1a1620'; g.fillRect(x - 12, y0 - 4, 30, 5); g.fillStyle = hot ? '#e87a24' : '#3a3440'; g.fillRect(x - 8, y0 - 3, 22, 3); g.fillStyle = hot ? '#ffd36b' : '#4a4452'; g.fillRect(x - 6, y0 - 3, 18, 1);
  if (hot) add(g, () => { glow(g, x + 3, y0 - 4, 30, 0.34 + 0.06 * Math.sin(time * 9), '255,150,50'); });
}
export function drawNest(g, dc, cx, cy) {
  const x = R(dc.x * 16 + 8 - cx), y = R((dc.y + 1) * 16 - cy);
  g.fillStyle = '#2a1c10'; g.beginPath(); g.ellipse(x, y - 3, 15, 5, 0, 0, 7); g.fill(); g.fillStyle = '#6a4a2a'; g.beginPath(); g.ellipse(x, y - 4, 14, 4, 0, 0, 7); g.fill(); g.fillStyle = '#1e140c'; g.beginPath(); g.ellipse(x, y - 5, 9, 2, 0, 0, 7); g.fill();
  g.fillStyle = '#a88a58'; for (let k = 0; k < 9; k++) g.fillRect(x - 13 + k * 3, y - 6 + (k % 2) * 2, 3, 1); g.fillStyle = '#e4dcc8'; g.fillRect(x - 6, y - 8, 3, 2); g.fillRect(x + 2, y - 9, 3, 2); g.fillRect(x + 8, y - 6, 2, 1); g.fillStyle = '#f0ece0'; g.fillRect(x - 2, y - 7, 2, 3);
}
export function drawKitePlat(g, dc, cx, cy, time) {   /* the hanging kite platform: bridle lines up to the kite that holds it, which is a great red-and-cream war-kite */
  const x = R(dc.x * 16 + 8 - cx), y = R(dc.y * 16 - cy), sw = Math.sin(time * 0.9) * 3;
  g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 30, y); g.lineTo(x - 8 + sw, y - 88); g.moveTo(x + 30, y); g.lineTo(x + 8 + sw, y - 88); g.moveTo(x, y); g.lineTo(x + sw, y - 90); g.stroke();
  warKite(g, x + sw, y - 112, 1, time, true);
}
export function warKite(g, kx, ky, sc, time, hot) {   /* a war-kite: a diamond of red cloth with cream cross-bars, spars, a tail of knotted rags */
  g.fillStyle = '#2a2430'; g.beginPath(); g.moveTo(kx, ky - 27 * sc); g.lineTo(kx + 31 * sc, ky); g.lineTo(kx, ky + 23 * sc); g.lineTo(kx - 31 * sc, ky); g.closePath(); g.fill();
  g.fillStyle = hot ? '#c9463d' : '#9a4038'; g.beginPath(); g.moveTo(kx, ky - 25 * sc); g.lineTo(kx + 28 * sc, ky); g.lineTo(kx, ky + 21 * sc); g.lineTo(kx - 28 * sc, ky); g.closePath(); g.fill();
  g.fillStyle = hot ? '#e8705a' : '#b85a4a'; g.beginPath(); g.moveTo(kx, ky - 25 * sc); g.lineTo(kx - 28 * sc, ky); g.lineTo(kx, ky); g.closePath(); g.fill();
  g.fillStyle = '#efe6d2'; g.fillRect(R(kx) - 1, R(ky - 24 * sc), 2, R(44 * sc)); g.fillRect(R(kx - 27 * sc), R(ky) - 1, R(54 * sc), 2);
  g.fillStyle = '#efe6d2'; g.beginPath(); g.moveTo(kx, ky - 13 * sc); g.lineTo(kx + 14 * sc, ky); g.lineTo(kx, ky + 11 * sc); g.lineTo(kx - 14 * sc, ky); g.closePath(); g.globalAlpha = 0.2; g.fill(); g.globalAlpha = 1;
  g.strokeStyle = '#c8b894'; g.lineWidth = 1; g.beginPath(); g.moveTo(kx, ky + 21 * sc); for (let i = 1; i <= 5; i++) g.lineTo(kx + Math.sin(time * 3 + i) * 3 * sc, ky + 21 * sc + i * 5 * sc); g.stroke();
  for (let i = 1; i <= 4; i++) { g.fillStyle = i % 2 ? '#c9463d' : '#efe6d2'; g.fillRect(R(kx + Math.sin(time * 3 + i) * 3 * sc) - 1, R(ky + 21 * sc + i * 5 * sc), 3, 2); }
}
export function drawFeather(g, dc, cx, cy) {
  const x = R(dc.x * 16 + 8 - cx), y = R((dc.y + 1) * 16 - cy);
  g.fillStyle = '#e8e0d0'; g.fillRect(x - 7, y - 3, 14, 2); g.fillStyle = '#2a2030'; g.fillRect(x - 8, y - 3, 3, 1); g.fillRect(x + 1, y - 5, 10, 1); g.fillStyle = '#6a5a6a'; g.fillRect(x - 2, y - 4, 10, 1); g.fillStyle = '#c8bca8'; g.fillRect(x + 2, y - 3, 8, 1);
}
export function drawBridgehead(g, dc, cx, cy) {   /* the old bridge's head: a gatepost of cut stone with a stump of iron rail and a hanging lamp bracket */
  const x = R(dc.x * 16 + 8 - cx), y = R((dc.y + 1) * 16 - cy);
  g.fillStyle = '#1a1620'; g.fillRect(x - 22, y - 76, 14, 76); g.fillStyle = '#7a7684'; g.fillRect(x - 21, y - 76, 12, 76); g.fillStyle = '#b4b0bc'; g.fillRect(x - 21, y - 76, 3, 76); g.fillStyle = '#4a4654'; g.fillRect(x - 12, y - 76, 3, 76);
  for (let k = 0; k < 6; k++) { g.fillStyle = '#4a4654'; g.fillRect(x - 21, y - 70 + k * 12, 12, 1); }
  g.fillStyle = '#1a1620'; g.fillRect(x - 26, y - 82, 22, 8); g.fillStyle = '#9a96a4'; g.fillRect(x - 25, y - 82, 20, 2); g.fillStyle = '#d4d0dc'; g.fillRect(x - 25, y - 82, 5, 2);
  g.fillStyle = '#2c2c38'; g.fillRect(x - 8, y - 56, 12, 2); g.fillRect(x + 4, y - 56, 2, 14); g.fillStyle = '#8a8aa0'; g.fillRect(x - 8, y - 56, 12, 1);
}
export function drawLoftDoor(g, v, cx, cy, TS) {   /* the riders' loft door: reeds and cord woven tight, a knot of red cloth, iron straps */
  const x = R(v.x0 * TS - cx), y = R(v.y0 * TS - cy), h = (v.y1 - v.y0 + 1) * TS;
  g.fillStyle = '#2a1c10'; g.fillRect(x, y, TS, h); g.fillStyle = '#7a5a34'; g.fillRect(x + 1, y, TS - 2, h);
  for (let k = 0; k < h; k += 4) { g.fillStyle = (k >> 2) & 1 ? '#a88450' : '#5a4224'; g.fillRect(x + 1 + ((k >> 2) & 1) * 3, y + k, 9, 2); g.fillStyle = '#c8a870'; g.fillRect(x + 1 + ((k >> 2) & 1) * 3, y + k, 9, 1); }
  g.fillStyle = '#2c2c38'; for (const fy of [4, h - 8]) { g.fillRect(x, y + fy, TS, 3); g.fillStyle = '#8a8aa0'; g.fillRect(x, y + fy, TS, 1); g.fillStyle = '#2c2c38'; }
  g.fillStyle = '#7a2218'; g.fillRect(x + 3, y + 22, 10, 9); g.fillStyle = '#c9463d'; g.fillRect(x + 3, y + 22, 10, 7); g.fillStyle = '#efe6d2'; g.fillRect(x + 7, y + 22, 2, 9); g.fillRect(x + 3, y + 25, 10, 2);
}
export function drawReel(g, lv, cage, kx, ky, hot, time, cx, cy) {   /* the war-kite on the flue's air, its line to the cage, and the cage */
  if (cage) { const mx = R(cage.x + 16 - cx), my = R(cage.y - cy);
    g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(kx, ky + 22); g.lineTo(mx - 12, my - 20); g.moveTo(kx, ky + 22); g.lineTo(mx + 12, my - 20); g.stroke();
    g.fillStyle = '#14141c'; g.fillRect(mx - 17, my - 20, 34, 3); g.fillStyle = '#4a4a5a'; g.fillRect(mx - 16, my - 20, 32, 1); g.fillRect(mx - 17, my - 20, 3, 20); g.fillRect(mx + 14, my - 20, 3, 20);
    g.fillStyle = '#3a3a48'; g.fillRect(mx - 16, my - 19, 2, 19); g.fillRect(mx + 14, my - 19, 2, 19);
    g.fillStyle = '#7a5a34'; g.fillRect(mx - 14, my - 14, 28, 14); for (let k = 0; k < 28; k += 4) { g.fillStyle = (k >> 2) & 1 ? '#a88450' : '#5a4224'; g.fillRect(mx - 14 + k, my - 14, 3, 14); } for (let y = 0; y < 14; y += 4) { g.fillStyle = '#c8a870'; g.fillRect(mx - 14, my - 14 + y, 28, 1); }
    g.fillStyle = '#14141c'; g.fillRect(mx - 16, my - 2, 32, 3); g.fillStyle = '#6a6a80'; g.fillRect(mx - 16, my - 2, 32, 1); g.fillStyle = '#ffd870'; g.fillRect(mx - 1, my - 22, 3, 2); }
  warKite(g, kx, ky, 1, time, hot);
}
export function riderKite(g, x, y, mode, time) {   /* the goblin kite-rider's own kite: a smaller diamond, red when he flies, flashing yellow when he tells his swoop */
  g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y - 18); g.stroke();
  g.fillStyle = '#2a2430'; g.beginPath(); g.moveTo(x - 4, y - 35); g.lineTo(x + 13, y - 22); g.lineTo(x - 4, y - 13); g.lineTo(x - 21, y - 22); g.closePath(); g.fill();
  g.fillStyle = mode === 'swoopTell' && Math.floor(time * 12) % 2 ? '#ffd36b' : '#3a8a4a'; g.beginPath(); g.moveTo(x - 4, y - 33); g.lineTo(x + 11, y - 22); g.lineTo(x - 4, y - 15); g.lineTo(x - 19, y - 22); g.closePath(); g.fill();
  g.fillStyle = '#d8c060'; g.fillRect(x - 5, y - 33, 2, 18); g.fillRect(x - 19, y - 23, 30, 2);
}
/* THE ROC'S NEST: the woven boards her dive sticks in - a basket mat laid on the arena floor, reed and cord in a weave, a rim of bleached bone and feather, ember-warm in the middle */
export function drawNestMat(g, lv, cx, cy, VW, time) {
  const a = lv.arena; if (!a || !lv.nest) return; const x0 = R(lv.nest[0] * 16 - cx), x1 = R((lv.nest[1] + 1) * 16 - cx), fy = R(a.floor - cy); if (x1 < -10 || x0 > VW + 10) return;
  g.fillStyle = '#1a1008'; g.fillRect(x0, fy - 7, x1 - x0, 7); g.fillStyle = '#6a4a28'; g.fillRect(x0, fy - 6, x1 - x0, 5);
  for (let x = x0; x < x1; x += 4) { g.fillStyle = ((x - x0) >> 2) & 1 ? '#a88450' : '#8a6a3a'; g.fillRect(x, fy - 6, 3, 2); g.fillStyle = ((x - x0) >> 2) & 1 ? '#5a4224' : '#7a5a30'; g.fillRect(x + 1, fy - 3, 3, 2); }
  g.fillStyle = '#e4dcc8'; g.fillRect(x0, fy - 7, x1 - x0, 1); g.fillStyle = '#2a1c10'; g.fillRect(x0 - 2, fy - 6, 2, 6); g.fillRect(x1, fy - 6, 2, 6);
  const r = mulberry(404); for (let i = 0; i < 14; i++) { const bx = x0 + 6 + r() * (x1 - x0 - 12); g.fillStyle = i % 3 ? '#f0ece0' : '#c8bca8'; g.fillRect(R(bx), fy - 8 - (i % 2), 3 + (i % 3), 1); }
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient((x0 + x1) / 2, fy - 4, 0, (x0 + x1) / 2, fy - 4, (x1 - x0) / 2); gr.addColorStop(0, 'rgba(255,120,40,' + (0.16 + 0.03 * Math.sin(time * 3)).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(x0, fy - 60, x1 - x0, 64); g.restore();
}
