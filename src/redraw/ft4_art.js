// src/redraw/ft4_art.js - FALLING TOWER 4 ART (claude/ft4art): the paint for lane B's collapse (src/tower-front.js, src/chase.js) over the greybox.
//   THE FRONT        paintFront()   the tower failing under you: a ragged lip of torn masonry underlit by dull red, dust rising off it, rubble falling
//                                   into the dark, torn wall courses and iron stubs below the lip (look 'collapse' in src/chase.js)
//   ITS TELL         paintCrack()   the crack running 1 s ahead of the edge: a jagged ember line with branches and grit; paintWallBreak() stone off both walls
//   BRACED ROOMS     paintButtress() a stone buttress with iron bands, a brass cap and a warm rune - "THE BUTTRESS HOLDS"
//   THE SHELVES      paintCase() (standing / leaning / falling, books flying off), paintCaseLying() (a case on its side, books spilled)
//   THE DOME         paintRib() (a brass rib: up, told, falling), paintRibDown() (lying across the gap: verdigris, dents, frost rime and icicles)
//   THE SHEAR        paintShearCrack() floor to ceiling, paintShearDust() the drop's dust curtain and rubble
//   THE BELL         paintBell() the great bell on its yoke and chain: hanging, swinging (told), falling; paintBellImpact() the smash through the deck
//   THE OUTER FACE   paintPlankTell() / paintPlankFall() a plank lifting off its nails, then tumbling away in the wind
//   THE ACTS         paintActPlate() the stone tablet that comes up with each act's banner: a numeral and a crack that widens act by act
// Only the tower's own materials: stone, iron, brass, verdigris, parchment and book leather; wood only as the library's own shelves and the face's planks.
// Everything is deterministic from its inputs + the clock (no state, no Math.random), so a frame is the same however often it is drawn.
const rnd = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const R_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const STONE = { void: '#0b0912', dk: '#1c1a24', md: '#3a3448', lt: '#5a5470', hi: '#8a8e9c', dust: '#a8987c', vio: '#726a8a' };
const RED = { hot: '#ff6b6b', mid: '#c9463d', glow: '#ffb070', dim: '#6a1c1c' };
const BRASS = { dk: '#3a2e1c', md: '#5a4420', lo: '#8a6a1a', lt: '#b08a3a', hi: '#e6c46a' };
const BOOKS = ['#8a2a2a', '#2a4a7a', '#6a6a2a', '#5a2a6a', '#7a4a1c', '#2a5a4a', '#a8703c'];
const blinkOf = time => Math.floor(time * 8) % 2;

/* ---------------------------------------------------------------- THE FRONT */
/* the front's look: g is clipped by the caller to the front's own zone; y = the lip's screen row; the body runs 260 px below it */
export function paintFront(g, y, VW, time, speed = 20) {
  const depth = 260;
  g.fillStyle = STONE.void; g.fillRect(0, y + 6, VW, depth);
  // torn wall courses just under the lip, fading into the dark: the blocks the floor was built of, half out of their joints
  for (let r = 0; r < 5; r++) { const ry = y + 9 + r * 7, off = (r * 11) % 17; g.globalAlpha = 0.5 - r * 0.09;
    for (let x = -off; x < VW; x += 17) { const w = 15 - Math.round(rnd(x + r, 1) * 3); R_(g, STONE.md, x, ry, w, 5); R_(g, STONE.dk, x, ry + 4, w, 1); R_(g, STONE.lt, x, ry, w, 1); } }
  g.globalAlpha = 1;
  // the ragged lip: a stone course broken into teeth, a slab sticking out here and there, each lit on top and underlit red below
  for (let x = 0; x < VW; x += 5) { const col = Math.round(x / 5), j = Math.round(rnd(col, 3) * 5 + Math.sin(col * 0.9 + time * 1.3) * 1.5), tooth = rnd(col, 9) > 0.78 ? 3 + Math.round(rnd(col, 4) * 5) : 0, ey = y - tooth + j - 2;
    R_(g, STONE.md, x, ey, 5, 12 + tooth); R_(g, STONE.dk, x + 4, ey + 2, 1, 10 + tooth);
    R_(g, tooth ? STONE.hi : STONE.lt, x, ey, 5, 1); if (rnd(col, 5) > 0.55) R_(g, STONE.hi, x + 1, ey, 2, 1);
    R_(g, RED.dim, x, ey + 12 + tooth, 5, 2); if (rnd(col, 6) > 0.5) R_(g, RED.mid, x + 1, ey + 12 + tooth, 3, 1); }
  // iron stubs and a snapped joist or two hanging off the lip, swinging a little
  for (let i = 0; i < 4; i++) { const x = Math.round(rnd(i, 21) * VW), len = 9 + Math.round(rnd(i, 22) * 14), sw = Math.round(Math.sin(time * 2 + i * 2) * 1.5);
    R_(g, '#2a2832', x + sw, y + 7, 2, len); R_(g, '#5a5a68', x + sw, y + 7, 1, len); R_(g, '#2a2832', x - 1 + sw, y + 7 + len, 4, 2); }
  // the red it is lit by from below, a hair of heat along the lip
  g.fillStyle = 'rgba(201,70,61,0.22)'; g.fillRect(0, y + 10, VW, 3);
  // dust off the lip, rising and thinning; grit thrown up on the surges
  for (let i = 0; i < 18; i++) { const ph = (time * 0.55 + rnd(i, 31)) % 1, x = (rnd(i, 32) * VW + Math.sin(time + i) * 6 + VW) % VW, r = 3 + Math.round(ph * 6);
    g.fillStyle = 'rgba(168,152,124,' + (0.3 * (1 - ph)).toFixed(3) + ')'; g.beginPath(); g.arc(x, y - 4 - ph * 30, r, 0, 6.3); g.fill(); }
  // rubble falling into the dark: slabs turning, slower the further down
  for (let i = 0; i < 16; i++) { const sp = 28 + rnd(i, 41) * 40, ph = (time * sp / 160 + rnd(i, 42)) % 1, cx0 = rnd(i, 43) * VW, fy = y + 10 + ph * 170, s = 2 + Math.round(rnd(i, 44) * 4), a = time * (2 + i % 4) + i;
    g.globalAlpha = Math.max(0, 1 - ph * 1.1); g.save(); g.translate(Math.round(cx0 + Math.sin(i + ph * 3) * 5), Math.round(fy)); g.rotate(a);
    R_(g, STONE.md, -s, -s * 0.6, s * 2, s * 1.2); R_(g, STONE.hi, -s, -s * 0.6, s * 2, 1); g.restore(); }
  g.globalAlpha = 1;
  void speed;
}
/* the crack that runs ahead of the edge, wall to wall: y = its screen row, [x0, x1] its span. Told - it blinks, it throws grit */
export function paintCrack(g, x0, x1, y, time) {
  const bl = blinkOf(time); let px = x0, py = y;
  for (let x = x0; x <= x1; x += 7) { const ny = y + Math.round((rnd(Math.round(x / 7), 51) - 0.5) * 6 + Math.sin(x * 0.11 + time * 2) * 1.2);
    g.strokeStyle = 'rgba(20,6,6,0.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(px, py); g.lineTo(x, ny); g.stroke();
    g.strokeStyle = bl ? RED.hot : RED.mid; g.lineWidth = 2; g.beginPath(); g.moveTo(px, py); g.lineTo(x, ny); g.stroke();
    g.strokeStyle = RED.glow; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py - 0.5); g.lineTo(x, ny - 0.5); g.stroke();
    if (rnd(Math.round(x / 7), 52) > 0.72) { const d = 4 + Math.round(rnd(x, 53) * 9); g.strokeStyle = RED.mid; g.lineWidth = 1; g.beginPath(); g.moveTo(x, ny); g.lineTo(x + 2, ny + d * 0.5); g.lineTo(x - 1, ny + d); g.stroke(); }   // a branch
    px = x; py = ny; }
  for (let i = 0; i < 7; i++) { const ph = (time * 1.4 + rnd(i, 54)) % 1, x = x0 + rnd(i, 55) * (x1 - x0); R_(g, STONE.dust, x, y - 1 + ph * 14, 1, 2); }   // grit shaken down through it
}
/* stone breaking off a wall in a wave; side -1 left / +1 right; x = the wall's inner face (screen), y = the wave's row. Chunks fall away with a trail of dust */
export function paintWallBreak(g, x, y, side, time) {
  for (let i = 0; i < 6; i++) { const ph = (time * 1.1 + rnd(i, 61)) % 1, s = 3 + Math.round(rnd(i, 62) * 4), cx0 = x + side * (2 + rnd(i, 63) * 5) - side * ph * 8, cy0 = y + 4 + ph * ph * 60 - 10;
    g.globalAlpha = 1 - ph * 0.7; R_(g, STONE.md, cx0, cy0, s, s - 1); R_(g, STONE.hi, cx0, cy0, s, 1); R_(g, STONE.dk, cx0 + s - 1, cy0, 1, s - 1);
    g.fillStyle = 'rgba(168,152,124,0.25)'; g.fillRect(Math.round(cx0 + side * 2), Math.round(cy0 - 7), 2, 6); }
  g.globalAlpha = 1;
  R_(g, STONE.dk, x - (side < 0 ? 0 : 3), y, 3, 7); R_(g, RED.dim, x - (side < 0 ? 0 : 3), y + 6, 3, 1);   // the notch it leaves
}

/* ---------------------------------------------------------------- THE BRACED ROOMS */
/* x = the buttress's left edge, y = its foot (the floor row). 12 px wide, 64 tall; the rune over the shrine side glows warm */
export function paintButtress(g, x, y, time, mirror) {
  const h = 64;
  R_(g, STONE.dk, x - 3, y - 7, 18, 7); R_(g, STONE.md, x - 3, y - 7, 18, 2); R_(g, STONE.lt, x - 3, y - 7, 18, 1);   // the stepped footing
  R_(g, STONE.md, x, y - h, 12, h - 7); R_(g, STONE.lt, mirror ? x + 8 : x, y - h, 4, h - 7); R_(g, STONE.dk, mirror ? x : x + 9, y - h, 3, h - 7);
  for (let r = 0; r < 4; r++) { const yy = y - 15 - r * 12; R_(g, STONE.dk, x, yy, 12, 1); R_(g, STONE.dk, x + ((r % 2) ? 4 : 8), yy - 12, 1, 12); }   // the courses and their joints
  for (const by of [y - 44, y - 22]) { R_(g, '#1c1a24', x - 1, by, 14, 4); R_(g, '#4a4a58', x - 1, by, 14, 1); R_(g, BRASS.lt, x + 1, by + 1, 1, 2); R_(g, BRASS.lt, x + 10, by + 1, 1, 2); }   // the iron bands, studded
  R_(g, STONE.dk, x - 3, y - h - 5, 18, 5); R_(g, BRASS.md, x - 3, y - h - 5, 18, 2); R_(g, BRASS.hi, x - 3, y - h - 5, 18, 1); R_(g, BRASS.lo, x - 2, y - h - 3, 16, 1);   // the brass-capped head
  const gl = 0.55 + 0.25 * Math.sin(time * 2); g.fillStyle = 'rgba(255,211,107,' + gl.toFixed(2) + ')'; g.fillRect(Math.round(x + 5), Math.round(y - 34), 2, 6); g.fillRect(Math.round(x + 3), Math.round(y - 32), 6, 1);   // a rune: it holds
}

/* ---------------------------------------------------------------- THE SHELVES */
/* a standing / leaning / falling bookcase. (bx, by) = its foot, h its height; ang = the lean (radians, + toward its dir); books: how many have come off (0..1) */
export function paintCase(g, bx, by, h, ang, time, spill = 0, dir = 1) {
  g.save(); g.translate(bx, by); g.rotate(ang);
  const w = 20, x = -w / 2;
  R_(g, '#140a06', x - 1, -h - 3, w + 2, h + 3);   // its shadow edge
  R_(g, '#1a0e08', x + 1, -h, w - 2, h - 2);   // the back
  R_(g, '#4a2c18', x, -h - 3, w, 3); R_(g, '#7a4a28', x - 1, -h - 4, w + 2, 2); R_(g, '#a8703c', x - 1, -h - 4, w + 2, 1);   // the crown moulding
  R_(g, '#4a2c18', x, -h, 2, h); R_(g, '#4a2c18', x + w - 2, -h, 2, h); R_(g, '#7a4a28', x, -h, 1, h);   // the uprights
  R_(g, '#3a2210', x - 1, -3, w + 2, 3); R_(g, '#7a4a28', x - 1, -3, w + 2, 1);   // the plinth
  const rows = Math.max(2, Math.floor((h - 8) / 15));
  for (let r = 0; r < rows; r++) { const sy = -h + 4 + r * Math.floor((h - 8) / rows) + Math.floor((h - 8) / rows) - 2;
    let bxp = x + 2; const bh = Math.floor((h - 8) / rows) - 4;
    for (let k = 0; bxp < x + w - 3; k++) { const sd = r * 9 + k, bwd = 2 + Math.round(rnd(sd, 71) * 2), hh = bh - Math.round(rnd(sd, 72) * 4), gone = spill > 0 && rnd(sd, 73) < spill * 0.9;
      if (gone) { bxp += bwd; continue; }
      const lean = rnd(sd, 74) > 0.9 ? 1 : 0; R_(g, BOOKS[Math.floor(rnd(sd, 75) * BOOKS.length)], bxp, sy - hh, bwd, hh); R_(g, 'rgba(255,255,255,0.18)', bxp, sy - hh, 1, hh); if (lean) R_(g, '#140a06', bxp + bwd, sy - hh, 1, 2);
      if (rnd(sd, 76) > 0.75) R_(g, '#e8dcc0', bxp, sy - hh + 3, bwd, 1);   // a gilt band
      bxp += bwd; }
    R_(g, '#4a2c18', x + 2, sy, w - 4, 2); R_(g, '#7a4a28', x + 2, sy, w - 4, 1); }   // the shelf board under them
  g.restore();
  // the books that have come off: thrown out along its fall, tumbling
  if (spill > 0) for (let i = 0; i < 9; i++) { const ph = Math.min(1, spill * 1.1), fx = bx + dir * (4 + rnd(i, 81) * 22) * ph, fy = by - h * (0.2 + rnd(i, 82) * 0.7) + ph * ph * (h * 0.7 + 20 * rnd(i, 83)), a = time * 9 + i;
    g.save(); g.translate(Math.round(fx), Math.round(fy)); g.rotate(a); R_(g, BOOKS[i % BOOKS.length], -2, -3, 4, 6); R_(g, '#e8dcc0', -2, 2, 4, 1); g.restore(); }
}
/* a case lying across a tier: seen end-on, its boards and dividers showing, books spilled along it. sx,sy = left edge and the tier's top row; w its length */
export function paintCaseLying(g, sx, sy, w) {
  const h = 14, y = sy - h;
  R_(g, '#140a06', sx - 1, y - 1, w + 2, h + 1); R_(g, '#3a2210', sx, y, w, h); R_(g, '#7a4a28', sx, y, w, 2); R_(g, '#a8703c', sx, y, w, 1); R_(g, '#2a1a0e', sx, y + h - 2, w, 2);   // its flank: top board lit
  for (let xx = sx + 10; xx < sx + w - 4; xx += 13) { R_(g, '#2a1a0e', xx, y + 2, 2, h - 4); R_(g, '#4a2c18', xx, y + 2, 1, h - 4); }   // the shelf boards, edge-on
  for (let xx = sx + 2; xx < sx + w - 3; xx += 4) { const sd = xx * 3; R_(g, '#140a06', xx, y + 4, 3, h - 7); R_(g, BOOKS[Math.floor(rnd(sd, 91) * BOOKS.length)], xx + 1, y + 5 + Math.round(rnd(sd, 92) * 2), 2, 5); }   // books still in the bays
  for (let i = 0; i < 9; i++) { const bxp = sx - 8 + rnd(i, 93) * (w + 16), bz = i % 3 ? 0 : -14, by2 = sy - 3 + (i % 2) * 0 + bz; if (bz) R_(g, BOOKS[i % BOOKS.length], bxp, y - 4 - (i % 2) * 2, 5, 3);   // books on top of it
    else { R_(g, BOOKS[(i * 2) % BOOKS.length], bxp, sy - 4, 5, 4); R_(g, '#e8dcc0', bxp, sy - 1, 5, 1); } void by2; }   // spilled on the floor around
}

/* ---------------------------------------------------------------- THE DOME */
/* a brass rib still hanging in the dome (state wait/tell/fall). (sx, top) = its left end and row; w its length; fallK 0..1 = how far it has come */
export function paintRib(g, sx, top, w, time, tell, fallK = 0) {
  const a = fallK > 0 ? fallK * fallK * 0.35 : 0, shake = tell ? Math.round(Math.sin(time * 45) * 1.2) : 0;
  g.save(); g.translate(sx + w / 2 + shake, top); g.rotate(a);
  g.lineCap = 'butt'; g.strokeStyle = BRASS.dk; g.lineWidth = 8; g.beginPath(); g.moveTo(-w / 2, 3); g.quadraticCurveTo(0, -9, w / 2, 3); g.stroke();
  g.strokeStyle = BRASS.lo; g.lineWidth = 5; g.beginPath(); g.moveTo(-w / 2, 2); g.quadraticCurveTo(0, -9, w / 2, 2); g.stroke();
  g.strokeStyle = BRASS.hi; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2, 0); g.quadraticCurveTo(0, -11, w / 2, 0); g.stroke();
  for (let i = 0; i <= 4; i++) { const t = i / 4, px = -w / 2 + t * w, py = (1 - t) * (1 - t) * 3 + 2 * t * (1 - t) * -9 + t * t * 3; R_(g, BRASS.hi, px - 1, py - 1, 2, 2); }   // rivets
  g.strokeStyle = '#4a7a6a'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w / 2 + 6, 5); g.lineTo(-w / 2 + 9, 8); g.moveTo(w / 2 - 8, 5); g.lineTo(w / 2 - 6, 9); g.stroke();   // verdigris runs
  g.restore();
  if (tell) for (let k = 0; k < 4; k++) R_(g, STONE.dust, sx + ((k * 17 + time * 40) % w), top + 6 + ((time * 80 + k * 23) % 22), 1, 2);   // plaster shaken off it
  if (fallK > 0) for (let k = 0; k < 4; k++) R_(g, 'rgba(230,196,106,0.5)', sx + 4 + k * (w / 4), top - 14 - k * 3, 1, 12);   // the streaks of its fall
}
/* a rib lying where it fell: a brass beam with a flange, dents, and (slick) his frost on it: rime, icicles hanging from it */
export function paintRibDown(g, sx, sy, w, time, slick) {
  R_(g, BRASS.dk, sx - 1, sy - 6, w + 2, 6); R_(g, BRASS.lo, sx, sy - 6, w, 4); R_(g, BRASS.lt, sx, sy - 6, w, 1); R_(g, BRASS.hi, sx + 2, sy - 6, w - 6, 1);
  for (let xx = sx + 4; xx < sx + w - 2; xx += 14) R_(g, BRASS.dk, xx, sy - 6, 1, 6);   // the joints
  R_(g, BRASS.md, sx - 3, sy - 8, 3, 8); R_(g, BRASS.md, sx + w, sy - 8, 3, 8); R_(g, BRASS.hi, sx - 3, sy - 8, 3, 1); R_(g, BRASS.hi, sx + w, sy - 8, 3, 1);   // the flanges where it was bolted
  R_(g, '#4a7a6a', sx + 6, sy - 5, 5, 1); R_(g, '#4a7a6a', sx + w - 14, sy - 4, 6, 1);
  if (slick) { R_(g, 'rgba(210,240,255,0.7)', sx, sy - 7, w, 2); R_(g, '#ffffff', sx + 2, sy - 7, w - 4, 1);
    for (let xx = sx + 3; xx < sx + w - 2; xx += 7) { const hh = 3 + Math.round(rnd(xx, 95) * 5); R_(g, 'rgba(190,232,250,0.85)', xx, sy, 2, hh); R_(g, '#eefaff', xx, sy, 1, hh - 1); }   // icicles under it
    for (let xx = sx + 6; xx < sx + w; xx += 11) if (Math.floor(time * 3 + xx) % 4 === 0) R_(g, '#ffffff', xx, sy - 9, 1, 1); }   // a glint
}

/* ---------------------------------------------------------------- THE SHEAR */
/* the crack floor to ceiling: x = its column's centre (screen), [yb (bottom), yt (top reached so far)], k = how far it has run (0..1) */
export function paintShearCrack(g, x, yb, yt, time) {
  const bl = blinkOf(time); let px = x, py = yb;
  for (let y = yb; y > yt; y -= 5) { const nx = x + Math.round(Math.sin(y * 0.31) * 3 + (rnd(Math.round(y / 5), 101) - 0.5) * 4), ny = y - 5;
    g.strokeStyle = 'rgba(20,6,6,0.9)'; g.lineWidth = 5; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
    g.strokeStyle = bl ? RED.hot : RED.mid; g.lineWidth = 3; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
    g.strokeStyle = RED.glow; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
    if (rnd(Math.round(y / 5), 102) > 0.7) { const d = rnd(y, 103) > 0.5 ? 1 : -1; g.strokeStyle = RED.mid; g.lineWidth = 1; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + d * 6, ny - 2); g.lineTo(nx + d * 9, ny + 3); g.stroke(); }
    px = nx; py = ny; }
  g.fillStyle = 'rgba(255,107,107,0.16)'; g.fillRect(Math.round(x - 10), Math.round(yt), 20, Math.round(yb - yt));   // its glow in the air
  for (let i = 0; i < 8; i++) { const ph = (time * 1.6 + rnd(i, 104)) % 1; R_(g, STONE.dust, x - 5 + rnd(i, 105) * 10, yt + (yb - yt) * ph, 1, 2); }   // grit falling through it
}
/* the drop's dust: a curtain along the old ledge rows and rubble tumbling down the shaft; t = seconds since it went (0..0.9) */
export function paintShearDust(g, x0, x1, y, rows, t) {
  if (t > 0.9) return; const k = t / 0.9;
  for (let i = 0; i < 12; i++) { const x = x0 + rnd(i, 111) * (x1 - x0), fy = y + k * (rows * 16 + 20) * (0.6 + rnd(i, 112) * 0.6), s = 3 + Math.round(rnd(i, 113) * 3);
    g.globalAlpha = 1 - k; R_(g, STONE.md, x, fy, s, s - 1); R_(g, STONE.hi, x, fy, s, 1); }
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(168,152,124,' + (0.35 * (1 - k)).toFixed(3) + ')'; g.beginPath(); g.arc(x0 + (i + 0.5) * (x1 - x0) / 6, y + 4 + k * rows * 8, 6 + k * 10, 0, 6.3); g.fill(); }
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- THE BELL */
/* the great bell. (x, y) = the yoke's pivot on its chain (screen), sw = the swing angle (radians), st 'hang' | 'tell' | 'fall'. ~56 wide x 62 tall */
export function paintBell(g, x, y, sw, time, st, chainTop) {
  const red = st === 'tell' && blinkOf(time);
  // the chain from the frame: iron links, glowing red while told
  if (st !== 'fall') for (let cy2 = chainTop; cy2 < y - 2; cy2 += 4) { const j = Math.round(Math.sin(cy2 * 0.0 + sw * 9) * 0); R_(g, red ? RED.hot : '#2a2832', x - 1 + j, cy2, 2, 3); R_(g, red ? RED.glow : '#6a6a78', x - 1 + j, cy2, 1, 2); }
  else for (let k = 0; k < 4; k++) R_(g, '#2a2832', x - 1, y - 12 - k * 5, 2, 3);   // the snapped chain trailing it
  g.save(); g.translate(x, y); g.rotate(sw);
  // the yoke: an iron-strapped beam across the bell's crown
  R_(g, BRASS.dk, -28, -4, 56, 6); R_(g, '#4a3a22', -28, -4, 56, 2); R_(g, '#6a5430', -28, -4, 56, 1); for (const sx of [-18, 0, 18]) { R_(g, '#1c1a24', sx - 2, -5, 5, 8); R_(g, '#5a5a68', sx - 2, -5, 5, 1); }
  R_(g, '#1c1a24', -30, -3, 3, 8); R_(g, '#1c1a24', 27, -3, 3, 8);   // its gudgeons
  // the bell: crown, shoulders, waist, a flared lip
  const body = () => { g.beginPath(); g.moveTo(-7, 2); g.lineTo(7, 2); g.quadraticCurveTo(10, 12, 15, 26); g.quadraticCurveTo(20, 40, 27, 52); g.lineTo(28, 58); g.lineTo(-28, 58); g.lineTo(-27, 52); g.quadraticCurveTo(-20, 40, -15, 26); g.quadraticCurveTo(-10, 12, -7, 2); g.closePath(); };
  body(); g.fillStyle = BRASS.lo; g.fill();
  g.save(); body(); g.clip(); R_(g, BRASS.dk, 12, 0, 20, 62); R_(g, BRASS.md, 5, 0, 8, 62); R_(g, BRASS.lt, -16, 0, 8, 62); R_(g, BRASS.hi, -13, 8, 3, 36); R_(g, 'rgba(255,255,255,0.35)', -12, 12, 1, 14);   // the light on its left, its right side deep
  R_(g, BRASS.dk, -30, 18, 60, 2); R_(g, BRASS.hi, -30, 17, 60, 1); R_(g, BRASS.dk, -30, 30, 60, 2); R_(g, BRASS.hi, -30, 29, 60, 1);   // the bands
  for (let i = 0; i < 6; i++) R_(g, BRASS.dk, -12 + i * 5 - (i > 2 ? 0 : 0), 22 + (i % 2) * 2, 2, 3);   // letters cast into the waist
  R_(g, BRASS.md, -30, 52, 60, 6); R_(g, BRASS.hi, -30, 52, 60, 1); R_(g, BRASS.dk, -30, 57, 60, 1);   // the sound-bow, thick lip
  if (st !== 'hang') { g.strokeStyle = RED.mid; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, 10); g.lineTo(-3, 22); g.lineTo(-7, 34); g.lineTo(-4, 46); g.stroke(); }   // the crack that lets it go
  g.restore();
  R_(g, '#1c1608', -22, 58, 44, 3);   // the hollow under the lip
  R_(g, '#3a3a44', -2, 56, 4, 10); R_(g, '#8a8e9c', -2, 62, 4, 4); R_(g, '#c8c0b0', -2, 62, 1, 4);   // the clapper
  g.restore();
}
/* what it does as it lands: the shockwave, a column of dust, planks and splinters thrown up. t = seconds since it hit; (x, y) = the deck row at its centre; [bx0, bx1] the bays' span */
export function paintBellImpact(g, x, y, bx0, bx1, t) {
  if (t < 0 || t > 1.3) return; const k = t / 1.3;
  for (let i = 0; i < 14; i++) { const ox = bx0 + (bx1 - bx0) * (i + rnd(i, 121)) / 14, up = (60 + rnd(i, 122) * 70) * Math.sin(Math.min(1, t * 1.7) * Math.PI * 0.65) - 30 * t * t * 9, w = 8 + Math.round(rnd(i, 123) * 10);
    g.save(); g.translate(Math.round(ox), Math.round(y - up + t * t * 90)); g.rotate(t * (4 + i % 5) * (i % 2 ? 1 : -1)); g.globalAlpha = Math.max(0, 1 - k * 1.1);
    R_(g, '#5a4028', -w / 2, -2, w, 4); R_(g, '#a8703c', -w / 2, -2, w, 1); R_(g, '#2a1a0e', -w / 2, 1, w, 1); g.restore(); }   // planks of the deck
  for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(168,152,124,' + (0.4 * (1 - k)).toFixed(3) + ')'; g.beginPath(); g.arc(x + (i - 3) * 14 + Math.sin(i) * 4, y - 6 - k * 50 - (i % 3) * 7, 8 + k * 14, 0, 6.3); g.fill(); }   // the dust column
  g.globalAlpha = Math.max(0, 1 - k * 1.5); g.strokeStyle = '#e6c46a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, 14 + k * 90, 4 + k * 10, 0, 0, 6.3); g.stroke(); g.globalAlpha = 1;   // the shockwave
}

/* ---------------------------------------------------------------- THE OUTER FACE */
/* a plank about to go: it works up off its nails (x0, y = its top; len px), nail heads standing proud, red under it as the front nears */
export function paintPlankTell(g, x0, y, len, time) {
  const sh = Math.sin(time * 40) * 1.5, lift = 1 + Math.abs(Math.sin(time * 13)) * 2;
  for (let xx = 3; xx < len; xx += 14) { R_(g, '#c8c0b0', x0 + xx, y - lift, 1, lift + 1); R_(g, '#ffffff', x0 + xx, y - lift, 1, 1); }   // nails drawing out
  R_(g, blinkOf(time) ? RED.hot : RED.mid, x0 + sh, y + 13, len, 2); R_(g, RED.glow, x0 + sh + 2, y + 14, Math.max(0, len - 4), 1);
  for (let k = 0; k < 3; k++) R_(g, STONE.dust, x0 + ((k * 31 + time * 60) % len), y + 4 + ((time * 70 + k * 19) % 14), 1, 2);
}
/* a plank that went: it tears off at one end, tumbles in the wind and is gone. t = seconds since; (x0, y) its place; len px */
export function paintPlankFall(g, x0, y, len, t) {
  if (t > 1.5) return; const k = t / 1.5;
  g.save(); g.globalAlpha = Math.max(0, 1 - k * k); g.translate(Math.round(x0 + t * 34), Math.round(y + t * t * 260)); g.rotate(t * 2.1);
  R_(g, '#4a3220', 0, -3, len, 6); R_(g, '#8a5a30', 0, -3, len, 1); R_(g, '#2a1a0e', 0, 2, len, 1); for (let xx = 8; xx < len - 3; xx += 14) { R_(g, '#c8c0b0', xx, -2, 1, 1); R_(g, '#3a2210', xx + 3, -1, 6, 1); }   // weathered grain, a few nails
  R_(g, '#a8703c', len - 3, -4, 2, 2); R_(g, '#a8703c', 1, 3, 2, 2);   // splinters at the torn ends
  g.restore();
  for (let i = 0; i < 4; i++) { const px = x0 + len * (i + 0.5) / 4 + t * (10 + i * 5), py = y + 4 + t * t * (150 + i * 60); g.globalAlpha = Math.max(0, 1 - k); R_(g, '#a8703c', px, py, 2, 1); } g.globalAlpha = 1;   // slivers
}

/* ---------------------------------------------------------------- THE ACTS */
/* the tablet that comes up with an act's banner: n = 1..3; age = seconds since the banner. Drawn in SCREEN space, centred at (cx0, cy0) */
export function paintActPlate(g, cx0, cy0, n, age, time) {
  const a = age < 0.35 ? age / 0.35 : age > 3.0 ? Math.max(0, 1 - (age - 3.0) / 0.6) : 1; if (a <= 0) return;
  const w = 34, h = 22, x = Math.round(cx0 - w / 2), y = Math.round(cy0 - h / 2 + (1 - a) * -6); g.globalAlpha = a;
  R_(g, '#0a0810', x - 2, y - 2, w + 4, h + 4); R_(g, STONE.md, x, y, w, h); R_(g, STONE.lt, x, y, w, 1); R_(g, STONE.lt, x, y, 1, h); R_(g, STONE.dk, x, y + h - 1, w, 1); R_(g, STONE.dk, x + w - 1, y, 1, h);
  for (const [cx2, cy2] of [[x, y], [x + w - 4, y], [x, y + h - 4], [x + w - 4, y + h - 4]]) { R_(g, BRASS.lo, cx2, cy2, 4, 4); R_(g, BRASS.hi, cx2, cy2, 4, 1); R_(g, BRASS.dk, cx2 + 1, cy2 + 1, 1, 1); }   // brass corners
  const bar = (bx, hh) => { R_(g, '#e8dcc0', bx, y + 6, 3, hh); R_(g, '#e8dcc0', bx - 1, y + 6, 5, 1); R_(g, '#e8dcc0', bx - 1, y + 5 + hh, 5, 1); R_(g, '#a89878', bx + 2, y + 7, 1, hh - 1); };   // a numeral stroke, serifed
  const xs = n === 1 ? [cx0 - 1] : n === 2 ? [cx0 - 6, cx0 + 3] : [cx0 - 10, cx0 - 2, cx0 + 6]; for (const bx of xs) bar(Math.round(bx), 9);
  // the crack, widening act on act: a hairline, a split with a chip gone, shards
  const mid = Math.round(cx0 + (n === 1 ? 8 : n === 2 ? 11 : 0)); const pts = n === 3 ? [[x + 12, y - 1], [x + 15, y + 6], [x + 11, y + 13], [x + 17, y + h]] : [[mid, y - 1], [mid + 2, y + 6], [mid - 1, y + 13], [mid + 1, y + h]];
  g.strokeStyle = n === 3 ? RED.hot : RED.mid; g.lineWidth = n === 1 ? 1 : 2; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.stroke();
  if (n >= 2) { g.strokeStyle = '#0a0810'; g.lineWidth = 1; g.beginPath(); g.moveTo(pts[1][0] + 1, pts[1][1]); g.lineTo(pts[1][0] + 5, pts[1][1] + 3); g.stroke(); R_(g, '#0a0810', x + w - 5, y, 5, 3); }   // a chip out of the corner
  if (n === 3) { for (let i = 0; i < 4; i++) { const ph = (time * 0.9 + i * 0.25) % 1; R_(g, STONE.hi, x + 6 + i * 7, y + h + ph * 7, 2, 2); } R_(g, '#0a0810', x + w - 7, y + h - 4, 7, 4); }   // shards coming away
  g.globalAlpha = 1;
}
