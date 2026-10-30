// src/redraw/realm_beats.js - FALLING TOWER 4 ART (claude/ft4art): the paint for lane C's living realms (src/mage-realms.js drawRealm / drawLiving).
//   FIRE    paintPit() a tile gone, a pit with fire in it; paintDropTile() the slab that is about to go (glows dark, cracks, steam); paintFlames() real tongues of fire;
//           paintBrazier() a bowl on chains (lit / ashes + smoke / ringed gold while it is the one to hit); paintPour() the spill: a fall of fire that splashes
//   ICE     paintCeilingEdge() the lowered ceiling's icicle fringe; paintFrostCreep() frost fingers down the band it will take; paintFloe() a drifting floe;
//           paintShellCracks() his shell, cracked; paintShards() the shell shattered off him
//   POISON  paintVent() a stone mouth in the mire, shut or bubbling; paintBoneRaft() a raft of lashed bones with a skull prow; paintSurgeTell() / paintSurgeCrest()
//           the wave line told and the crest that comes; paintSpore() a spore ring flying home
//   ALL     paintBite() a notch broken out of the realm's wall; paintChunk() a stone off it
// Deterministic from inputs + the clock; fillRect + a few paths (the realm draws in the page only).
const rnd = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const R_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const blinkOf = time => Math.floor(time * 8) % 2;

/* ---------------------------------------------------------------- FIRE */
/* a tongue of flame, base (x, y) width w height h: a teardrop in three heats */
export function paintFlames(g, x, y, w, h, time, seed = 0) {
  const n = Math.max(2, Math.round(w / 9));
  for (let i = 0; i < n; i++) { const fx = x + (i + 0.5) * w / n, fh = Math.max(3, h * (0.5 + 0.5 * Math.abs(Math.sin(time * (5 + i % 3) + i * 1.9 + seed)))), fw = Math.max(4, w / n * 1.25), sway = Math.sin(time * 7 + i * 2.1 + seed) * 1.5;
    for (const [col, k] of [['#c9463d', 1], ['#ff9b49', 0.72], ['#ffe9b0', 0.4]]) { g.fillStyle = col; g.beginPath(); g.moveTo(fx - fw * 0.5 * k, y); g.quadraticCurveTo(fx - fw * 0.35 * k + sway * 0.4, y - fh * k * 0.5, fx + sway, y - fh * k); g.quadraticCurveTo(fx + fw * 0.35 * k + sway * 0.4, y - fh * k * 0.5, fx + fw * 0.5 * k, y); g.closePath(); g.fill(); } }
}
/* a floor tile that fell: the slab's torn edges, a pit under the flame line, fire deep in it. tx = tile left (screen), flr = the floor row, tw = tile width, tl = the tilt offset */
export function paintPit(g, tx, flr, tw, tl, time) {
  const w = Math.round(tw), top = flr - 22 + tl;
  R_(g, '#0c0302', tx + 1, top, w - 2, 30);
  for (let x = 0; x < w - 2; x += 4) { const d = 2 + Math.round(rnd(x + tx, 131) * 5); R_(g, '#2a1008', tx + 1 + x, top, 4, d); R_(g, '#4a1c0c', tx + 1 + x, top, 4, 1); }   // the broken lip of the floor around it
  R_(g, '#4a1c0c', tx, top, 2, 24); R_(g, '#4a1c0c', tx + w - 2, top, 2, 24); R_(g, '#6a2a14', tx, top, 1, 24);
  const gl = Math.floor(time * 10 + tx) % 2; R_(g, gl ? '#c9463d' : '#ff6b2c', tx + 3, flr + 2 + tl, w - 6, 6); R_(g, '#ffd36b', tx + 6, flr + 3 + tl, w - 12, 2);   // the glow at its floor
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,107,44,0.18)'; g.fillRect(tx + 1, top, w - 2, 30); g.restore();
}
/* a slab about to fall: it glows DARK red, shakes, cracks and smokes. Told 0.8 s */
export function paintDropTile(g, tx, flr, tw, tl, time) {
  const w = Math.round(tw), sh = Math.round(Math.sin(time * 50) * 1), top = flr - 22 + tl, p = Math.floor(time * 10) % 2;
  R_(g, p ? '#3a0604' : '#5a0c06', tx + 1 + sh, top, w - 2, 30); R_(g, '#7a1a0c', tx + 1 + sh, top, w - 2, 2);
  g.strokeStyle = '#ff4a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(tx + 8 + sh, top + 2); g.lineTo(tx + 11 + sh, top + 9); g.lineTo(tx + 9 + sh, top + 13); g.lineTo(tx + 20 + sh, top + 14);
  g.moveTo(tx + 30 + sh, top + 1); g.lineTo(tx + 33 + sh, top + 11); g.lineTo(tx + 31 + sh, top + 17); g.lineTo(tx + 42 + sh, top + 19); g.moveTo(tx + 48 + sh, top + 4); g.lineTo(tx + 45 + sh, top + 12); g.stroke();
  for (let i = 0; i < 4; i++) { const ph = (time * 1.2 + i * 0.25) % 1; g.fillStyle = 'rgba(120,100,90,' + (0.35 * (1 - ph)).toFixed(2) + ')'; g.beginPath(); g.arc(tx + 8 + i * 15 + Math.sin(time * 4 + i) * 2, top - 2 - ph * 16, 2 + ph * 3, 0, 6.3); g.fill(); }   // steam off it
}
/* the pit's fire, low: fly over it. x0/w its span, flTop = the floor top row, h = fire height */
export function paintPitFire(g, x0, flTop, w, h, time) {
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,107,44,0.2)'; g.fillRect(x0, flTop - h, w, h); g.restore();
  paintFlames(g, x0 + 1, flTop + 1, w - 2, h, time, x0);
  for (let i = 0; i < 4; i++) { const ph = (time * 0.9 + i * 0.27) % 1; R_(g, '#ffd36b', x0 + 3 + rnd(i, 141) * (w - 6), flTop - h - ph * 14, 1, 1); }   // sparks leaving it
}
/* a brazier on two chains from the ceiling: iron bowl, rim, bracket. lit: flames; unlit: ashes and smoke. ringed: gold ring while it is the one to hit */
export function paintBrazier(g, x, ctop, y, lit, ringed, time) {
  g.strokeStyle = '#5a4a40'; g.lineWidth = 1; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 2, ctop); g.lineTo(x + s * 8, y - 3); g.stroke(); }   // the two chains
  for (let yy = ctop + 2; yy < y - 6; yy += 6) { R_(g, '#3a2a24', x - 1, yy, 2, 3); }   // the middle link-line
  R_(g, '#1a0e0a', x - 10, y - 2, 20, 4); g.fillStyle = '#2a1a14'; g.beginPath(); g.moveTo(x - 10, y - 2); g.lineTo(x + 10, y - 2); g.lineTo(x + 6, y + 6); g.lineTo(x - 6, y + 6); g.closePath(); g.fill();   // the bowl
  R_(g, '#8a6a5a', x - 11, y - 4, 22, 2); R_(g, '#4a3a30', x - 11, y - 2, 22, 1); R_(g, '#6a4a3a', x - 4, y + 5, 8, 3);   // the rim, a boss under it
  for (let i = 0; i < 3; i++) R_(g, '#c8a060', x - 7 + i * 7, y - 1, 1, 1);   // rivets
  if (lit) { g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y - 8, 1, x, y - 8, 26); gl.addColorStop(0, 'rgba(255,155,73,0.55)'); gl.addColorStop(1, 'rgba(255,155,73,0)'); g.fillStyle = gl; g.fillRect(x - 26, y - 34, 52, 52); g.restore();
    R_(g, '#ff6b2c', x - 8, y - 5, 16, 2); paintFlames(g, x - 8, y - 4, 16, 14, time, x); }
  else { R_(g, '#5a5a5a', x - 7, y - 5, 14, 2); R_(g, '#8a8a8a', x - 4, y - 6, 4, 1);   // grey ash heaped
    for (let j = 0; j < 4; j++) { const ph = (time * 0.7 + j / 4) % 1; g.fillStyle = 'rgba(150,150,150,' + (0.5 * (1 - ph)).toFixed(2) + ')'; g.beginPath(); g.arc(x - 3 + j * 2 + Math.sin(time * 2 + j) * 2, y - 8 - ph * 18, 1.5 + ph * 2.5, 0, 6.3); g.fill(); } }
  if (ringed) { g.strokeStyle = blinkOf(time) ? '#ffe46b' : '#ffffff'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 5, 16, 14, 0, 0, 6.3); g.stroke(); for (let i = 0; i < 8; i++) { const a = time * 2 + i * 0.785; R_(g, '#ffe46b', x + Math.cos(a) * 16, y - 5 + Math.sin(a) * 14, 1, 1); } }
}
/* the spill: the brazier's fire pours down onto where he floats, a rope of fire that splashes. (x, y0) its lip, y1 where it lands */
export function paintPour(g, x, y0, y1, time) {
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,107,44,0.28)'; g.fillRect(x - 14, y0, 28, y1 - y0); g.restore();
  for (let yy = y0; yy < y1; yy += 3) { const w = 8 + Math.round(Math.sin(yy * 0.2 - time * 18) * 2); R_(g, '#c9463d', x - w / 2 - 1, yy, w + 2, 3); R_(g, '#ff9b49', x - w / 2 + 1, yy, w - 2, 3); }
  for (let yy = y0 + 2; yy < y1; yy += 6) R_(g, '#ffe9b0', x - 1 + Math.round(Math.sin(time * 30 + yy) * 2), yy, 3, 3);   // the white-hot core
  for (let i = 0; i < 8; i++) { const ph = (time * 3 + i / 8) % 1; R_(g, i % 2 ? '#ffd36b' : '#ff9b49', x + (i % 2 ? 1 : -1) * (6 + ph * 14), y1 - ph * 12 + ph * ph * 16, 2, 2); }   // the splash
}

/* ---------------------------------------------------------------- ICE */
/* the lowered ceiling's lower edge: a fringe of icicles hanging off it, long where the ceiling has come down. top = the ceiling's lower edge (screen), lowered = rows it has come down */
export function paintCeilingEdge(g, VW, top, lowered, time) {
  if (top < 4) return; const long = 4 + Math.min(10, lowered * 3);
  for (let x = 0; x < VW; x += 5) { const h = Math.round(2 + rnd(x, 151) * long + (rnd(x, 152) > 0.8 ? long * 0.8 : 0)), w = 3 + (rnd(x, 153) > 0.6 ? 1 : 0);
    g.fillStyle = 'rgba(138,200,240,0.95)'; g.beginPath(); g.moveTo(x, top); g.lineTo(x + w, top); g.lineTo(x + w * 0.5, top + h); g.closePath(); g.fill();
    R_(g, '#eefaff', x, top, 1, Math.max(1, h * 0.5)); }
  R_(g, '#eefaff', 0, top - 1, VW, 1); for (let x = 7; x < VW; x += 31) if (Math.floor(time * 2 + x) % 5 === 0) R_(g, '#ffffff', x, top + 2, 1, 1);   // a rime line and a glint or two
}
/* frost creeping down the band the ceiling will take (the tell): fingers of rime reaching down from the ceiling, p = 0..1 how far, h = the full band's height */
export function paintFrostCreep(g, x0, top, w, h, p, time) {
  g.fillStyle = 'rgba(216,244,255,' + (0.15 + 0.1 * blinkOf(time)).toFixed(2) + ')'; g.fillRect(x0, top, w, h);   // the band it will take
  for (let x = x0; x < x0 + w; x += 4) { const fh = Math.round((6 + rnd(x, 161) * (h - 6)) * p), seg = Math.max(1, fh);
    R_(g, 'rgba(255,255,255,0.75)', x, top, 2, seg); R_(g, '#ffffff', x, top + fh, 2, 2); if (fh > 8 && rnd(x, 162) > 0.5) { R_(g, 'rgba(255,255,255,0.7)', x - 2, top + fh * 0.6, 2, 1); R_(g, 'rgba(255,255,255,0.7)', x + 2, top + fh * 0.45, 2, 1); } }   // a finger with side crystals
}
/* a floe: a slab of ice with a bevelled top, blue facets, a crack and rime. (x, y) = its top-left, w x h; bobs a pixel */
export function paintFloe(g, x, y, w, h, time) {
  const b = Math.round(Math.sin(time * 1.6 + x * 0.05) * 1); y += b;
  g.fillStyle = 'rgba(150,205,240,0.94)'; g.beginPath(); g.moveTo(x + 3, y); g.lineTo(x + w - 3, y); g.lineTo(x + w, y + 4); g.lineTo(x + w - 2, y + h); g.lineTo(x + 2, y + h); g.lineTo(x, y + 4); g.closePath(); g.fill();   // the body, corners knocked off
  R_(g, '#eefaff', x + 3, y, w - 6, 3); R_(g, '#ffffff', x + 5, y, w - 12, 1);   // the snow-lit top
  R_(g, '#8ac8f0', x + w - 4, y + 4, 4, h - 4); R_(g, '#5a9ac4', x + 2, y + h - 4, w - 4, 4); R_(g, '#2e4a64', x + 2, y + h - 1, w - 4, 1);   // the shaded side and its underside
  g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 8, y + 5); g.lineTo(x + 11, y + 12); g.lineTo(x + 9, y + 17); g.moveTo(x + w * 0.62, y + 4); g.lineTo(x + w * 0.58, y + 11); g.stroke();   // cracks in it
  for (let i = 0; i < 3; i++) R_(g, '#ffffff', x + 6 + rnd(i, 171) * (w - 12), y + 1 + (Math.floor(time * 3 + i) % 2), 1, 1);   // glints
  for (let i = 0; i < 4; i++) { const ph = (time * 0.8 + i / 4) % 1; R_(g, 'rgba(230,248,255,' + (0.6 * (1 - ph)).toFixed(2) + ')', x + 4 + i * (w - 8) / 4, y - 2 - ph * 8, 1, 1); }   // cold breath off it
}
/* his shell cracked ('one more'): a web of cracks across the shell round him. (x, y) = its centre */
export function paintShellCracks(g, x, y, time) {
  g.save(); g.strokeStyle = 'rgba(190,235,255,0.55)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 20, 30, 0, 0, 6.3); g.stroke(); g.restore();   // the shell
  g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 4, y - 28); g.lineTo(x - 1, y - 16); g.lineTo(x - 7, y - 6); g.lineTo(x - 3, y + 8); g.lineTo(x - 9, y + 22);
  g.moveTo(x - 1, y - 16); g.lineTo(x + 8, y - 12); g.lineTo(x + 14, y - 18); g.moveTo(x - 7, y - 6); g.lineTo(x - 17, y - 2); g.moveTo(x - 3, y + 8); g.lineTo(x + 10, y + 12); g.stroke();
  if (blinkOf(time)) for (const [dx, dy] of [[-1, -16], [-7, -6], [-3, 8]]) R_(g, '#9be2ff', x + dx - 1, y + dy - 1, 3, 3);   // a glint at each fork
}
/* the shell shattering off him: angular shards flying out. a = 0..2pi seed per shard, ph = 0..1 how far */
export function paintShards(g, x, y, i, ph, a) {
  const d = 10 + ph * 32, sx = x + Math.cos(a) * d, sy = y - 22 + Math.sin(a) * (14 + ph * 30) + ph * ph * 24, r = a + ph * 6;
  g.save(); g.globalAlpha = Math.max(0, 1 - ph * 0.8); g.translate(Math.round(sx), Math.round(sy)); g.rotate(r); g.fillStyle = i % 2 ? '#ffffff' : '#9be2ff'; g.beginPath(); g.moveTo(-1, -3); g.lineTo(3, 0); g.lineTo(-2, 2); g.closePath(); g.fill(); g.restore();
}

/* ---------------------------------------------------------------- POISON */
/* a vent in the mire: a stone mouth, shut, or (next) bubbling and ringed. (x, my) = its centre and the mire's surface */
export function paintVent(g, x, my, next, time) {
  g.fillStyle = next ? '#1a2a0c' : '#0a0e08'; g.beginPath(); g.ellipse(x, my - 1, 11, 4, 0, 0, 6.3); g.fill();
  R_(g, next ? '#5a6a3a' : '#3a4430', x - 13, my - 4, 26, 2); R_(g, '#26361a', x - 13, my - 2, 3, 4); R_(g, '#26361a', x + 10, my - 2, 3, 4); R_(g, '#8a9a6a', x - 12, my - 4, 8, 1);   // the stone lip round it
  if (next) { g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, my - 8, 1, x, my - 8, 22); gl.addColorStop(0, 'rgba(166,224,74,0.4)'); gl.addColorStop(1, 'rgba(166,224,74,0)'); g.fillStyle = gl; g.fillRect(x - 22, my - 30, 44, 36); g.restore();
    for (let j = 0; j < 6; j++) { const ph = (time * 2.6 + j / 6) % 1, r = 1 + (j % 3) * 0.8, bx = x - 6 + j * 2.4 + Math.sin(time * 5 + j) * 1.5, by = my - 5 - ph * 24; g.strokeStyle = j % 2 ? '#a6e04a' : '#d8ffb0'; g.lineWidth = 1; g.beginPath(); g.arc(bx, by, r, 0, 6.3); g.stroke(); R_(g, '#ffffff', bx - r * 0.4, by - r * 0.4, 1, 1); }   // bubbles rising
    g.strokeStyle = blinkOf(time) ? '#a6e04a' : '#d8ffb0'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, my - 1, 14 + (time * 20 % 6), 4, 0, 0, 6.3); g.stroke(); }
}
/* a raft of bone: lashed long bones, ribs, a skull for a prow. (x, y) = its left end and deck row, w its length. Bobs on the mire */
export function paintBoneRaft(g, x, y, w, time) {
  R_(g, '#6a6048', x, y + 4, w, 3); R_(g, '#c8bea0', x, y + 2, w, 3); R_(g, '#e8e0c8', x + 2, y + 2, w - 4, 1); R_(g, '#a89c7c', x, y + 5, w, 1);   // the long bones, lashed across
  for (let j = 3; j < w - 10; j += 7) { R_(g, '#e8e0c8', x + j, y - 1, 2, 5); R_(g, '#a89c7c', x + j + 2, y, 1, 4); }   // ribs standing up
  for (let j = 6; j < w - 8; j += 14) R_(g, '#3a2a1a', x + j, y + 2, 2, 3);   // the lashings
  const sx = x + w - 7; R_(g, '#e8e0c8', sx, y - 5, 8, 7); R_(g, '#c8bea0', sx + 1, y + 2, 6, 2); R_(g, '#2a2a1a', sx + 1, y - 3, 2, 2); R_(g, '#2a2a1a', sx + 5, y - 3, 2, 2); R_(g, '#2a2a1a', sx + 3, y, 2, 1);   // a skull for a prow
  R_(g, 'rgba(160,220,100,0.5)', x - 2, y + 6, w + 4, 1);   // the mire lapping its edge
}
/* the surge told: where the mire will reach. A wave-line of foam with arrows, blinking */
export function paintSurgeTell(g, x0, x1, y, time) {
  const bl = blinkOf(time);
  for (let x = x0; x < x1; x += 4) { const wy = y + Math.round(Math.sin(x * 0.2 + time * 6) * 1.5); R_(g, bl ? '#ff6b6b' : '#a6e04a', x, wy, 3, 1); if ((x >> 2) % 3 === 0) R_(g, 'rgba(216,255,176,0.55)', x, wy + 1, 3, 1); }
  for (let x = x0 + 30; x < x1; x += 70) for (let j = 0; j < 5; j++) { R_(g, bl ? '#ff9b9b' : '#d8ffb0', x - j, y + 8 + j, 1, 1); R_(g, bl ? '#ff9b9b' : '#d8ffb0', x + j, y + 8 + j, 1, 1); }   // chevrons: it comes up to here
}
/* the surge itself: a rolling crest of foam and green along the mire's surface. y = the surface row */
export function paintSurgeCrest(g, x0, x1, y, time) {
  for (let x = x0; x < x1; x += 3) { const w = Math.sin(x * 0.3 + time * 9) * 1.5 + Math.sin(x * 0.11 - time * 5) * 2; R_(g, '#d8ffb0', x, y - 2 + w, 3, 2); R_(g, '#8fd160', x, y + w, 3, 2); if ((x >> 2) % 4 === 0) R_(g, '#ffffff', x, y - 3 + w, 1, 1); }
}
/* a spore ring struck back, flying home: a cluster with a bright heart, a halo, and spores streaming off it */
export function paintSpore(g, x, y, time) {
  g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x, y, 1, x, y, 14); gl.addColorStop(0, 'rgba(216,255,176,0.8)'); gl.addColorStop(1, 'rgba(166,224,74,0)'); g.fillStyle = gl; g.fillRect(x - 14, y - 14, 28, 28); g.restore();
  g.fillStyle = 'rgba(120,190,60,0.9)'; for (let i = 0; i < 6; i++) { const a = time * 5 + i * 1.05; g.beginPath(); g.arc(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 2.2, 0, 6.3); g.fill(); }
  R_(g, '#ffe46b', x - 1, y - 1, 3, 3); R_(g, '#ffffff', x, y, 1, 1);
  for (let i = 0; i < 5; i++) { const ph = (time * 3 + i / 5) % 1; R_(g, 'rgba(166,224,74,' + (0.8 * (1 - ph)).toFixed(2) + ')', x - 3 - ph * 14 + rnd(i, 181) * 4, y + (rnd(i, 182) - 0.5) * 8, 1, 1); }   // a trail
}

/* ---------------------------------------------------------------- ALL */
/* a notch broken out of a wall: side -1 left / +1 right, wx the wall face x, d its depth, y/h its rows. Ragged, with a lit edge and the realm's dark showing */
export function paintBite(g, wx, y, d, h, side, back, edge) {
  R_(g, back, wx, y, d, h);
  for (let i = 0; i < h; i += 3) { const t = 1 + Math.round(rnd(i + wx, 191) * Math.min(3, d * 0.5)); R_(g, edge, side < 0 ? wx : wx + d - t, y + i, t, 2); }   // teeth of stone along the break (the inner edge)
  R_(g, edge, wx, y - 1, d, 1); R_(g, edge, wx, y + h, d, 1); R_(g, edge, side < 0 ? wx - 1 : wx + d, y, 1, h);
}
/* a stone chunk off a wall, falling: s = its size */
export function paintChunk(g, x, y, s, lt, md) {
  R_(g, md, x, y, s, s); R_(g, lt, x, y, s, 1); if (s > 3) R_(g, lt, x, y, 1, s); R_(g, 'rgba(0,0,0,0.35)', x + s - 1, y + 1, 1, s - 1);
}
