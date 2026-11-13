// causeway3_art.js - THE DROWNED CAUSEWAY 2's PIECES (claude/cw3art, 2026-11-07): every thing on the road that is not a tile. Drawn in code from rects, in the greybox's own hit boxes.
// All take screen coordinates (x = centre, y = the ground line it stands on) and the game clock; none keep state. src/causeway3-hands.js calls them when L.cw3Kit.
//   BELL            a pilgrim's bell hung in a stone gibbet: bronze gone green at the lip, a rope pull, swings when struck, a pale ring-flash         drawBell
//   SLUICE WHEEL    an iron hand wheel (eight spokes, brass hub) on a stone pedestal, a chain down to the gate plate; spins and shows its hold         drawWheel
//   FLOODGATE LEVER an iron lever in a slotted stone plate, verdigris, ball grip; up = flooded, down = drained                                       drawLever
//   GUN             the wreck's iron cannon on a tarred truck carriage, breeching rope, barnacled; powder-black muzzle; smoke when fired              drawGun
//   STORM LAMP      an iron post, a caged glass lantern, lit = flame + halo + rain glints, dark = cold glass and a spark                              drawLamp
//   FERRY           the cove / basin boat: clinker hull, red-lead wale, deck planks, a mast stump, a coil of rope, a lantern at the stern             drawBoat
//   RING            an iron mooring ring on a staple with a chain, for the sea arch's air bells                                                    drawRing
//   AIR POCKET      a trapped pocket of air in a vault: a silver underside, ripples, a few bubbles rising                                          drawAir
//   ARM             THE KRAKEN'S ARM: a told bulge + shadow + red chevron, then the arm itself (tapering, curled tip, suckers, spray)                drawArmTell / drawArm
//   STRIKE MARK     the warned lightning strike: a ward-ring on the stone, sparks drawing in, a pale leader from the sky, then it is gone            drawStrike
//   CRACK           THE COLLAPSE: a road column cracking (amber seams, shaking, then red), chips, and the front's dust and spray                    drawCrack / drawFront
//   WET             the tide on the road: top darkens and glints while a tide stands on it, dries off after (live, not baked)                       drawWet
//   COTTAGE / WAYSTONE / GULLS    the hamlet, a pilgrim's waymark, the sea wall's birds                                                       drawCottage / drawWaymark / drawGull
//   GAUGE           the brass tide gauge (one drawing; fold into src/redraw/pirate_fleet_art.js drawGauge when claude/pfart merges)                  drawTideGauge
const R = Math.round;
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const A = (g, a) => { g.globalAlpha = a; };
export const CA = {
  bronze: ['#2a1c0c', '#5a3c14', '#8a6420', '#c09a3c', '#e8cc70'], green: '#3a8a6a', greenD: '#1c4a3a', iron: ['#14161a', '#2a2e36', '#444a54', '#6a7280', '#9aa2b0'],
  stone: ['#1c1b22', '#34333c', '#504f58', '#706e76', '#948f8c', '#b8b09c'], rope: ['#1a1408', '#3a2e18', '#6a5a38', '#9a8856'],
  tar: ['#07090b', '#10151a', '#1c242c', '#2a3640', '#3c4c58'], red: ['#4a1812', '#7a2a22', '#a8402e'], flame: ['#fff6d0', '#ffd36b', '#ff9a30', '#c24a1a'], brass: ['#6a4a14', '#a8802c', '#e0c060'],
  arm: ['#0c1218', '#1a2a30', '#2c4448', '#486c68', '#78a49c'], sucker: '#c8b0a0', foam: ['#dff2f8', '#9ac8d8', '#5a98b0'], water: ['#0a2a36', '#103e4c', '#1a5666', '#7cc8e8'],
};
const C = CA;

/* ---- THE BELL: a stone gibbet (two posts, a lintel, an iron bracket), the bell under it. swing in -1..1 (struck), ring in 0..1 (a pale flash) ---- */
export function drawBell(g, x, y, swing, ring, t) {
  x = R(x); y = R(y);
  for (const sx of [-12, 10]) { rect(g, x + sx, y - 30, 3, 30, C.stone[2]); rect(g, x + sx, y - 30, 1, 30, C.stone[4]); rect(g, x + sx + 2, y - 30, 1, 30, C.stone[1]); rect(g, x + sx - 1, y - 2, 5, 2, C.stone[1]); }
  rect(g, x - 14, y - 33, 28, 4, C.stone[3]); rect(g, x - 14, y - 33, 28, 1, C.stone[5]); rect(g, x - 14, y - 30, 28, 1, C.stone[0]); rect(g, x - 1, y - 36, 2, 3, C.stone[2]);   /* lintel + a finial */
  rect(g, x - 1, y - 29, 2, 3, C.iron[3]);                                                                                                                                         /* the hanger */
  const sw = R((swing || 0) * 4), bx = x + sw;
  for (let i = 0; i < 12; i++) { const w = 3 + (i * 7) / 12 + (i > 9 ? 2 : 0); rect(g, bx - w, y - 27 + i, w * 2, 1, i < 3 ? C.bronze[2] : C.bronze[(i % 5 === 0 ? 3 : 2)]); }   /* the waist flaring to the lip */
  rect(g, bx - 8, y - 15, 16, 2, C.bronze[1]); rect(g, bx - 8, y - 16, 16, 1, C.bronze[3]); rect(g, bx - 4, y - 25, 2, 8, C.bronze[4]); px(g, bx + 5, y - 20, C.bronze[4]);                  /* the lip, a highlight */
  for (let i = 0; i < 8; i += 2) rect(g, bx - 8 + i * 2, y - 14, 3, 1, C.green); px(g, bx + 2, y - 20, C.greenD); px(g, bx - 1, y - 22, C.green);                                       /* verdigris */
  rect(g, bx - 1, y - 13, 2, 3, C.iron[2]); rect(g, bx - 2, y - 10, 4, 2, C.iron[3]);                                                                                                  /* the clapper */
  rect(g, x + 14, y - 28, 1, 22, C.rope[2]); rect(g, x + 14, y - 8, 2, 3, C.rope[3]);                                                                                                 /* the pull */
  if (ring > 0) { A(g, Math.min(0.6, ring * 0.6)); rect(g, bx - 12, y - 18, 24, 1, '#fff6d0'); rect(g, bx - 15, y - 14, 30, 1, '#ffe8a0'); A(g, 1);
    for (let k = 1; k <= 2; k++) { A(g, ring * 0.4 / k); rect(g, bx - 9 - k * 5, y - 17, 1, 6, '#fff6d0'); rect(g, bx + 9 + k * 5, y - 17, 1, 6, '#fff6d0'); } A(g, 1); }
  void t;
}

/* ---- THE SLUICE WHEEL: a stone pedestal, a chain to the gate plate below, the iron wheel on it. held: it spins (angle) and a brass lock ring shows; frac = hold left 0..1; cool = winding back 0..1 ---- */
export function drawWheel(g, x, y, angle, held, frac, cool) {
  x = R(x); y = R(y);
  rect(g, x - 5, y - 8, 10, 8, C.stone[2]); rect(g, x - 5, y - 8, 10, 1, C.stone[4]); rect(g, x - 5, y - 8, 1, 8, C.stone[3]); rect(g, x + 4, y - 8, 1, 8, C.stone[0]); rect(g, x - 6, y - 1, 12, 1, C.stone[1]);
  rect(g, x - 1, y - 12, 2, 5, C.iron[2]);                                                                                                   /* the stem */
  const cx = x, cy = y - 15, r = 9;
  for (let i = 0; i < 8; i++) { const a = angle + i * Math.PI / 4, ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r; const n = 9; for (let q = 1; q <= n; q++) { px(g, cx + (ex - cx) * q / n, cy + (ey - cy) * q / n, q > 7 ? C.iron[4] : C.iron[2]); } rect(g, ex - 1, ey - 1, 2, 2, C.iron[3]); }   /* eight spokes, a knob at each end */
  for (let i = 0; i < 28; i++) { const a = i * Math.PI * 2 / 28; px(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, i % 7 === 0 ? C.iron[4] : C.iron[3]); }                                       /* the rim */
  rect(g, cx - 2, cy - 2, 4, 4, C.brass[1]); rect(g, cx - 2, cy - 2, 4, 1, C.brass[2]); px(g, cx - 1, cy - 1, '#fff0b0');                                                              /* the brass hub */
  rect(g, x + 7, y - 8, 1, 8, C.iron[1]); for (let k = 0; k < 4; k++) px(g, x + 7, y - 7 + k * 2, C.iron[3]);                                                                           /* the chain */
  if (held) { rect(g, cx - 11, cy - 14, 22, 3, C.brass[0]); rect(g, cx - 10, cy - 13, R(20 * Math.max(0, Math.min(1, frac))), 1, C.brass[2]); }                                        /* the hold, as a brass bar */
  else if (cool > 0) { rect(g, cx - 10, cy - 13, R(20 * Math.min(1, cool)), 1, C.iron[3]); }
}

/* ---- THE FLOODGATE LEVER: a slotted stone plate, an iron lever with a ball grip. up = the crypt is full (flooded) ---- */
export function drawLever(g, x, y, up) {
  x = R(x); y = R(y);
  rect(g, x - 7, y - 8, 14, 8, C.stone[2]); rect(g, x - 7, y - 8, 14, 1, C.stone[4]); rect(g, x - 7, y - 1, 14, 1, C.stone[0]); rect(g, x - 6, y - 7, 1, 6, C.stone[3]);
  rect(g, x - 5, y - 5, 10, 2, '#06100e'); px(g, x - 5, y - 6, C.greenD); px(g, x + 4, y - 6, C.greenD); px(g, x, y - 6, C.green);                       /* the slot, the verdigris */
  const dx = up ? 7 : -7; for (let q = 1; q <= 9; q++) { px(g, x + dx * q / 9, y - 4 - q * 1.4, C.iron[q > 6 ? 4 : 3]); px(g, x + dx * q / 9 + 1, y - 4 - q * 1.4, C.iron[1]); }
  rect(g, x + dx - 1, y - 18, 3, 3, up ? '#8fd160' : '#c8d0c8'); px(g, x + dx - 1, y - 18, '#ffffff');                                                       /* the ball grip */
  rect(g, x - 2, y - 6, 4, 3, C.iron[2]); px(g, x - 1, y - 5, C.iron[4]);                                                                                  /* the pivot */
}

/* ---- THE GUN (the toll tower's gun, off the wrecks): aim 1 = muzzle east. fired: smoke-black, her carriage rocked back ---- */
export function drawGun(g, x, y, aim, fired, t) {
  x = R(x); y = R(y); const f = aim >= 0 ? 1 : -1, X = (dx, w = 1) => (f > 0 ? x + dx : x - dx - w + 1), rr = (dx, dy, w, h, c) => rect(g, X(dx, w), y + dy, w, h, c);
  const back = fired ? -3 : 0;
  rr(-18 + back, -9, 40, 7, C.tar[2]); rr(-18 + back, -9, 40, 1, C.tar[4]); rr(-18 + back, -3, 40, 1, C.tar[0]);                                   /* the truck carriage: two cheeks tarred */
  rr(-14 + back, -13, 30, 4, C.tar[1]); rr(-14 + back, -13, 30, 1, C.tar[3]);
  for (const wx of [-13, 12]) { rr(wx + back, -7, 8, 8, C.tar[0]); rr(wx + 1 + back, -6, 6, 6, C.tar[2]); rr(wx + 3 + back, -4, 2, 2, C.iron[3]); rr(wx + back, -7, 8, 1, C.tar[4]); }   /* truck wheels */
  for (let i = 0; i < 40; i++) { const q = i / 40, hgt = 6 - q * 1.5, ty = -16 - hgt * 0.5 + (q > 0.85 ? -1 : 0); rr(-18 + i + back, R(ty), 1, R(hgt) + 1, i % 9 === 0 ? C.iron[4] : i < 8 ? C.iron[2] : C.iron[3]); }   /* the barrel: thick at the breech, tapering */
  rr(-20 + back, -17, 3, 7, C.iron[2]); rr(-21 + back, -15, 2, 3, C.iron[3]);                                                                    /* the cascabel */
  rr(20 + back, -18, 4, 5, fired ? '#0c0c10' : C.iron[1]); rr(21 + back, -17, 2, 3, '#040406');                                                    /* the muzzle swell and bore */
  for (const bx of [-6, 6]) rr(bx + back, -17, 1, 6, C.iron[1]);                                                                                  /* reinforce rings */
  rr(-14 + back, -9, 3, 1, C.rope[3]); rr(-20 + back, -6, 8, 1, C.rope[2]); rr(-20 + back, -5, 2, 4, C.rope[2]);                                   /* the breeching rope */
  for (let k = 0; k < 6; k++) rr(((k * 7) % 36) - 14 + back, -12 - (k % 3) * 2, 1, 1, '#d6d0bc');                                                 /* barnacles */
  if (!fired) { const glint = (Math.sin(t * 5) + 1) / 2; A(g, 0.3 + 0.5 * glint); rr(-16, -18, 4, 2, '#fff6d0'); A(g, 1); }                           /* strike-me: the breech winks */
}

/* ---- A STORM LAMP: iron post, cage, glass. lit = flame, halo, glints. dark = cold blue glass, now and then a spark ---- */
export function drawLamp(g, x, y, lit, t, gateKey) {
  x = R(x); y = R(y);
  rect(g, x - 1, y - 22, 3, 22, C.iron[1]); rect(g, x - 1, y - 22, 1, 22, C.iron[3]); rect(g, x - 4, y - 2, 9, 2, C.iron[2]); rect(g, x - 3, y - 4, 7, 2, C.iron[1]);                   /* post and foot */
  rect(g, x - 5, y - 34, 11, 3, C.iron[2]); rect(g, x - 5, y - 34, 11, 1, C.iron[4]); rect(g, x - 3, y - 37, 7, 3, C.iron[1]); rect(g, x - 1, y - 39, 3, 2, C.iron[3]); px(g, x, y - 40, C.iron[4]);   /* cap + ring */
  rect(g, x - 5, y - 24, 11, 3, C.iron[2]);                                                                                                                                         /* base */
  const fl = 0.6 + 0.4 * Math.abs(Math.sin(t * 9 + x));
  if (lit) {
    A(g, 0.14 + 0.1 * fl); rect(g, x - 14, y - 40, 29, 24, '#ffd36b'); A(g, 0.14); rect(g, x - 20, y - 36, 41, 16, '#ff9a30'); A(g, 1);
    rect(g, x - 4, y - 31, 9, 7, '#ffe8a0'); rect(g, x - 3, y - 30, 7, 5, '#fff6d0'); rect(g, x - 1, y - 33 - R(fl * 2), 3, 4 + R(fl * 2), C.flame[1]); rect(g, x, y - 32 - R(fl * 2), 1, 3, C.flame[0]);
    for (let k = 0; k < 3; k++) px(g, x - 9 + ((t * 40 + k * 17) % 19), y - 38 + ((t * 30 + k * 9) % 14), '#fff2c0');                                                            /* rain through the light */
  } else {
    rect(g, x - 4, y - 31, 9, 7, '#12202c'); rect(g, x - 3, y - 30, 7, 5, '#1c3446'); rect(g, x - 3, y - 30, 2, 5, '#2c5068'); if (((t * 1.3 + x) % 3) < 0.12) { px(g, x, y - 28, '#fff6d0'); px(g, x + 1, y - 27, '#ffd36b'); }
  }
  for (const gx of [-4, 4]) rect(g, x + gx, y - 31, 1, 7, C.iron[1]);                                                                                                               /* the cage bars */
  if (gateKey) { rect(g, x + 6, y - 28, 6, 1, C.brass[1]); rect(g, x + 10, y - 29, 2, 3, C.brass[2]); }                                                                              /* the gate lamp: a brass plate with the pilgrim's key */
}

/* ---- THE FERRY: the cove's and the basin's boat. x = left edge, y = deck level, w = length. Clinker hull under a plank deck, a stem post at each end, lantern at the stern ---- */
export function drawBoat(g, x, y, w, t, afloat) {
  x = R(x); y = R(y); w = R(w);
  for (let i = 0; i < w; i++) { const u = i / w, sheer = u < 0.06 ? R((0.06 - u) * 80) : u > 0.94 ? R((u - 0.94) * 80) : 0, keel = 10 - (u < 0.1 || u > 0.9 ? 3 : 0) + (sheer ? -sheer : 0);
    for (let j = 0; j < keel; j++) { const row = j & 3; px(g, x + i, y + 2 + j, row === 3 ? C.tar[0] : (i % 22 === (j * 5) % 22) ? C.tar[1] : C.tar[2 + (j < 2 ? 1 : 0)]); } }
  rect(g, x, y, w, 2, C.tar[4]); rect(g, x, y, w, 1, '#6a7e8a'); for (let i = 5; i < w - 4; i += 9) px(g, x + i, y, C.tar[1]);                                                  /* the deck's planks, caulked butts */
  rect(g, x + 2, y + 2, w - 4, 1, C.red[1]); rect(g, x + 3, y + 3, w - 6, 1, C.red[2]);                                                                                                   /* the red-lead wale */
  for (let i = 8; i < w - 6; i += 14) { rect(g, x + i, y + 7, 3, 1, '#d6d0bc'); px(g, x + i + 4, y + 8, '#d6d0bc'); }                                                                       /* barnacles low on her */
  for (const sx of [0, w - 3]) { rect(g, x + sx, y - 9, 3, 11, C.iron[2]); rect(g, x + sx, y - 9, 1, 11, C.iron[4]); rect(g, x + sx - 1, y - 10, 5, 2, C.iron[3]); }                         /* iron stem and stern posts */
  rect(g, x + w - 3 - 13, y - 14, 2, 12, C.tar[3]); rect(g, x + w - 3 - 13, y - 14, 1, 12, C.tar[4]); rect(g, x + w - 3 - 15, y - 4, 6, 2, C.tar[2]);                                  /* a mast stump */
  rect(g, x + 14, y - 3, 7, 3, C.rope[2]); rect(g, x + 15, y - 4, 5, 1, C.rope[3]); rect(g, x + 15, y - 2, 5, 1, C.rope[0]);                                                                /* a coil of rope */
  const lx = x + w - 8, fl = 0.6 + 0.4 * Math.sin(t * 8 + w); rect(g, lx, y - 11, 5, 8, C.iron[1]); rect(g, lx + 1, y - 10, 3, 6, '#ffe8a0'); rect(g, lx + 2, y - 9 - R(fl), 1, 3, '#fff6d0'); rect(g, lx - 1, y - 12, 7, 1, C.iron[3]);   /* a stern lantern */
  A(g, 0.15); rect(g, lx - 6, y - 16, 17, 14, '#ffd36b'); A(g, 1);
  if (!afloat) { A(g, 0.35); rect(g, x, y + 10, w, 2, '#050608'); A(g, 1); }
}

/* ---- AN IRON RING: a staple in the roof and a ring hanging on a short chain, for the sea arch's air bells ---- */
export function drawRing(g, x, y) {
  x = R(x); y = R(y); rect(g, x - 1, y - 6, 3, 3, C.iron[2]); px(g, x - 1, y - 6, C.iron[4]); rect(g, x, y - 3, 1, 2, C.iron[3]);
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; px(g, x + Math.cos(a) * 4, y + 2 + Math.sin(a) * 4, i < 4 ? C.iron[4] : i > 9 ? C.iron[1] : C.iron[3]); }
  for (let k = 0; k < 3; k++) px(g, x - 3 + k * 3, y + 6 + (k & 1), C.green);
}

/* ---- AN AIR POCKET (x0..x1 px, y px = its roof line, y1 = its floor/water): the silver underside, ripples, bubbles ---- */
export function drawAir(g, x0, x1, y0, y1, t) {
  const w = R(x1 - x0); A(g, 0.1); rect(g, x0, y0, w, y1 - y0, '#bfe6f5'); A(g, 1);
  for (let i = 0; i < w; i++) { const wob = R(Math.sin(i * 0.5 + t * 3) * 0.8); px(g, x0 + i, y1 - 1 + wob, i % 5 === 0 ? '#ffffff' : '#9ad8ee'); px(g, x0 + i, y1 + wob, '#5aa0b8'); }   /* the pocket's water line: a silver skin */
  for (let k = 0; k < 4; k++) { const bx = x0 + 4 + ((k * 13 + 3) % Math.max(1, w - 8)), by = y1 + 2 + ((t * 18 + k * 9) % 14); A(g, 0.8 - (by - y1) / 24); px(g, bx, y1 + 14 - (by - y1), '#dff2f8'); A(g, 1); }
  A(g, 0.5); rect(g, x0 + 2, y0 + 1, Math.max(1, w - 4), 1, '#ffffff'); A(g, 1);
}

/* ---- THE ARM (KRAKEN FORESHADOW). tell: a shadow on the road, a bulge in the stone, a red chevron. k = tell progress 0..1 ---- */
export function drawArmTell(g, x, roadY, k, t) {
  x = R(x); roadY = R(roadY);
  A(g, 0.22 + 0.4 * k); rect(g, x - 26, roadY - 1, 52, 3, '#04040a'); rect(g, x - 18, roadY + 2, 36, 2, '#04040a'); A(g, 1);                                                     /* the shadow */
  const hgt = R(2 + 7 * k); for (let i = -12; i <= 12; i++) { const hh = R(hgt * Math.sqrt(Math.max(0, 1 - (i / 13) * (i / 13)))); rect(g, x + i, roadY - hh, 1, hh, i < -4 ? C.arm[3] : C.arm[2]); if (hh > 1) px(g, x + i, roadY - hh, C.arm[4]); }   /* the bulge */
  for (let c = 0; c < 4; c++) { const dx = ((c * 7) % 13) - 6, l = 2 + ((c * 5) % 4); rect(g, x + dx, roadY - hgt - l + 1, 1, l, '#06080c'); }                                       /* cracks in the stone over it */
  const on = Math.sin(t * 20) > 0; for (let q = 0; q < 2; q++) { const yy = roadY - 44 - q * 5 - R(k * 3); rect(g, x - 4 + q, yy, 2, 2, on ? '#ff6b6b' : '#ffd36b'); rect(g, x + 2 - q, yy, 2, 2, on ? '#ff6b6b' : '#ffd36b'); rect(g, x - 2, yy + 2, 4, 2, on ? '#ff6b6b' : '#ffd36b'); }   /* a chevron */
  for (let b = 0; b < 3; b++) { const bx = x - 10 + ((b * 9 + t * 14) % 20), by = roadY - 2 - ((t * 24 + b * 7) % 10); A(g, 0.8); px(g, bx, by, C.foam[0]); A(g, 1); }                    /* bubbles */
}
/* the arm itself: k = 1 at the strike falling to 0; height 10..130 px; sways, tapers to a curled tip with suckers down the near face */
export function drawArm(g, x, roadY, k, t, smash) {
  x = R(x); roadY = R(roadY); const hgt = R(120 * k + 10), n = hgt;
  for (let i = 0; i < n; i++) { const u = i / n, w = R(9 - 5.5 * u), sway = R(Math.sin(i * 0.09 + t * 7) * 2.5 * u + (u > 0.8 ? (u - 0.8) * 22 : 0)), y = roadY - i, cx = x + sway;
    rect(g, cx - w, y, w * 2, 1, C.arm[2 - (u > 0.5 ? 0 : 0)]); rect(g, cx - w, y, 2, 1, C.arm[3]); rect(g, cx + w - 2, y, 2, 1, C.arm[0]); if (i % 3 === 0) px(g, cx - w + 1, y, C.arm[4]);
    if (i % 7 === 3 && w > 2) { px(g, cx - 1, y, C.sucker); px(g, cx + 1, y, C.sucker); } }
  const tx = x + R(Math.sin(n * 0.09 + t * 7) * 2.5 + 4); for (let q = 0; q < 6; q++) { px(g, tx + R(Math.cos(q * 0.9) * 3), roadY - n - 2 + R(Math.sin(q * 0.9) * 3), C.arm[3]); }   /* the curl */
  for (let b = 0; b < 8; b++) { const bx = x - 16 + ((b * 7 + t * 40) % 32), by = roadY - ((t * 60 + b * 11) % 26); A(g, 0.8); px(g, bx, by, C.foam[b % 3]); A(g, 1); }                       /* spray */
  if (smash) { A(g, 0.35 * k); rect(g, x - 30, roadY - 6, 60, 6, '#e8dcc0'); A(g, 1); }
}

/* ---- THE WARNED STRIKE: a ward-ring on the stone the sky has picked, sparks drawing in, a pale leader from the cloud (k 0..1 as the warning runs out) ---- */
export function drawStrike(g, x, y0, y1, k, t) {
  x = R(x); y1 = R(y1);
  A(g, 0.1 + 0.3 * k); rect(g, x - 1, y0, 3, Math.max(0, y1 - y0), '#9ab8ff'); A(g, 1);                                                                                             /* the leader building */
  const rr = R(14 - 8 * k), on = Math.floor(t * 14) % 2 === 0;
  for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12 + t * 2, ex = x + Math.cos(a) * rr, ey = y1 - 1 + Math.sin(a) * rr * 0.28; px(g, ex, ey, i % 2 ? (on ? '#eef4ff' : '#9ab8ff') : '#5a78c8'); }   /* the ring shrinks on the spot */
  rect(g, x - 2, y1 - 2, 5, 1, on ? '#ffffff' : '#9ab8ff');
  for (let q = 0; q < 6; q++) { const a = q * 1.05 + t * 3, d = (1 - k) * 18 + 4 + (q % 3), sx = x + Math.cos(a) * d, sy = y1 - 1 + Math.sin(a) * d * 0.28; A(g, 0.5 + 0.5 * k); px(g, sx, sy, '#eef4ff'); A(g, 1); }   /* sparks drawn in */
  if (k > 0.5) { A(g, (k - 0.5) * 1.6); for (let i = 0; i < 3; i++) { rect(g, x - 3 - i * 2, y1 - 5 - i * 4, 1, 3, '#dfe8ff'); rect(g, x + 3 + i * 2, y1 - 5 - i * 4, 1, 3, '#dfe8ff'); } A(g, 1); }   /* hair standing */
}

/* ---- THE COLLAPSE: a column cracking. tl = time left (CRACK s -> 0); amber seams, a shake, the last half-second red ---- */
export function drawCrack(g, x, roadY, tl, t, crack) {
  x = R(x); roadY = R(roadY); const k = 1 - Math.max(0, tl) / Math.max(0.1, crack || 1.2), hot = tl < 0.5 && Math.sin(t * 30) > 0, sh = k > 0.5 ? R(Math.sin(t * 60 + x) * 1) : 0;
  const col = hot ? '#ff6b6b' : '#e8b860'; A(g, 0.5 + 0.4 * k);
  rect(g, x + 3 + sh, roadY, 1, 5, col); rect(g, x + 4 + sh, roadY + 4, 3, 1, col); rect(g, x + 7 + sh, roadY + 5, 1, 4, col); rect(g, x + 9 + sh, roadY + 1, 1, 6, col); rect(g, x + 10 + sh, roadY + 3, 4, 1, col); rect(g, x + 13 + sh, roadY + 4, 1, 5, col);
  if (k > 0.4) { rect(g, x + 5, roadY + 9, 1, 6, col); rect(g, x + 6, roadY + 14, 4, 1, col); rect(g, x + 11, roadY + 8, 1, 7, col); }
  A(g, 1);
  if (k > 0.3) { A(g, 0.6); for (let q = 0; q < 3; q++) px(g, x + 3 + ((q * 5 + t * 12) % 10), roadY - 1 - ((t * 20 + q * 5) % 4), '#c0b8a0'); A(g, 1); }                                          /* dust lifting */
}
/* the front: dust and spray along the edge where the road is going - px = world x of the front on screen */
export function drawFront(g, x, roadY, t) {
  x = R(x); roadY = R(roadY);
  for (let q = 0; q < 10; q++) { const dx = ((q * 11 + t * 90) % 28) - 8, dy = ((t * 70 + q * 13) % 20); A(g, 0.8 - dy / 26); px(g, x + dx, roadY - dy, q % 3 === 0 ? '#e8dcc0' : q % 3 === 1 ? '#8a948e' : C.foam[0]); A(g, 1); }
  A(g, 0.5); rect(g, x - 6, roadY + 1, 26, 3, '#2a2e36'); A(g, 1);
}

/* ---- WET: the road top in a standing tide: darkens, glints; amount w 0..1 (its tide's level, then drying off) over screen span x0..x1 at the road's top y ---- */
export function drawWet(g, x0, x1, roadY, w, t, night) {
  if (w <= 0.02 || x1 <= x0) return; x0 = R(x0); x1 = R(x1); roadY = R(roadY);
  A(g, 0.28 * w); rect(g, x0, roadY, x1 - x0, 4, night ? '#0a1626' : '#1a2438'); A(g, 1);
  A(g, 0.5 * w); for (let x = x0 - (x0 % 5) + 5; x < x1; x += 5) { const q = ((x * 7 + R(t * 6)) % 11); if (q < 3) px(g, x, roadY + (q & 1), night ? '#9ac4e0' : '#dff2f8'); } A(g, 1);
  if (w > 0.4) for (let x = x0 - (x0 % 24) + 11; x < x1; x += 24) { A(g, 0.5 * w); rect(g, x, roadY - 1, 8, 1, night ? '#6e9ac0' : '#a8c8e0'); A(g, 1); }       /* a puddle's edge between the flags */
}

/* ---- THE HAMLET AND THE WAYMARKS ---- */
export function drawCottage(g, x, y, lit, t, seed) {
  x = R(x); y = R(y);
  rect(g, x - 13, y - 22, 26, 22, '#c8c0aa'); rect(g, x - 13, y - 22, 3, 22, '#e0d8c0'); rect(g, x + 10, y - 22, 3, 22, '#8a8470'); for (let k = 0; k < 6; k++) px(g, x - 10 + ((k * 7 + seed) % 20), y - 6 - ((k * 5) % 14), '#a89e88');
  rect(g, x - 15, y - 25, 30, 4, '#34384a'); rect(g, x - 13, y - 28, 26, 4, '#434a5e'); rect(g, x - 10, y - 31, 20, 4, '#566078'); rect(g, x - 10, y - 31, 20, 1, '#8a96a8'); rect(g, x - 7, y - 34, 14, 3, '#566078');     /* slate roof, stepped */
  rect(g, x + 4, y - 38, 4, 8, '#8a8470'); rect(g, x + 3, y - 39, 6, 2, '#5a564a');                                                                                                                              /* chimney */
  rect(g, x - 9, y - 16, 7, 7, '#1a1a22'); rect(g, x - 8, y - 15, 5, 5, lit ? '#ffd36b' : '#2a3a4c'); if (lit) { px(g, x - 8, y - 15, '#fff6d0'); px(g, x - 6, y - 15, '#7a5a28'); rect(g, x - 6, y - 15, 1, 5, '#7a5a28'); }
  rect(g, x + 2, y - 14, 6, 14, '#2a2420'); rect(g, x + 2, y - 14, 6, 1, '#4a4038'); px(g, x + 6, y - 7, '#c8a040');                                                                                              /* the door */
  if (lit) { A(g, 0.14 + 0.05 * Math.sin(t * 3 + seed)); rect(g, x - 14, y - 20, 14, 12, '#ffd36b'); A(g, 1); }
}
export function drawWaymark(g, x, y, v) {
  x = R(x); y = R(y);
  rect(g, x - 6, y - 3, 12, 3, C.stone[2]); rect(g, x - 6, y - 3, 12, 1, C.stone[4]); rect(g, x - 5, y - 24, 10, 22, C.stone[3]); rect(g, x - 5, y - 24, 2, 22, C.stone[5]); rect(g, x + 3, y - 24, 2, 22, C.stone[1]);
  rect(g, x - 5, y - 26, 10, 2, C.stone[4]); rect(g, x - 5, y - 26, 10, 1, '#d8d0b8');
  rect(g, x - 1, y - 21, 2, 9, C.stone[0]); rect(g, x - 3, y - 18, 6, 2, C.stone[0]);                                                                                                       /* the cut cross */
  for (let k = 0; k < 5; k++) px(g, x - 4 + ((k * 3 + (v || 0)) % 8), y - 8 + (k % 3), '#4a6a3a'); px(g, x + 2, y - 5, '#38542c');                                                                /* moss */
}
export function drawGull(g, x, y, t, up, i) {
  const fl = Math.sin(t * 9 + i * 2) > 0 ? 1 : 0; x = R(x); y = R(y);
  rect(g, x - 2, y - 2, 5, 3, '#eef0f0'); rect(g, x + 2, y - 3, 2, 2, '#eef0f0'); px(g, x + 4, y - 2, '#d8a030'); px(g, x + 3, y - 3, '#10141a');
  if (up > 0.4) { rect(g, x - 5, y - 4 - fl * 2, 4, 1, '#c8d0d4'); rect(g, x + 1, y - 4 - fl * 2, 4, 1, '#c8d0d4'); px(g, x - 6, y - 3 - fl * 2, '#10141a'); px(g, x + 5, y - 3 - fl * 2, '#10141a'); }
  else { rect(g, x - 3, y - 2, 2, 1, '#aab4b8'); px(g, x - 3, y - 1, '#10141a'); }
}

/* ---- THE TIDE GAUGE (one drawing; gg = tide-kit gauge(): { k, ph, tell, coming, held, holdLeft }) ---- */
export function drawTideGauge(g, x, y, gg, t) {
  x = R(x); y = R(y); const h = 28;
  rect(g, x - 1, y - 1, 14, h + 6, '#0a0e16'); rect(g, x, y, 12, h + 4, C.brass[0]); rect(g, x, y, 12, 1, C.brass[2]); rect(g, x, y, 1, h + 4, C.brass[1]); rect(g, x + 11, y, 1, h + 4, '#2a1c08');
  rect(g, x + 2, y + 2, 8, h, '#0c1c28'); const fh = R(h * Math.max(0, Math.min(1, gg.k))); rect(g, x + 2, y + 2 + h - fh, 8, fh, gg.tell && Math.sin(t * 16) > 0 ? '#ffffff' : '#3a98c0'); rect(g, x + 2, y + 2 + h - fh, 8, 1, '#bfe6f5');
  for (let q = 0; q < 5; q++) rect(g, x + 2, y + 2 + R(q * h / 4), q % 2 ? 3 : 5, 1, C.brass[2]);
  if (gg.coming === 'in') { rect(g, x + 14, y + 4, 3, 3, '#ffd36b'); rect(g, x + 15, y + 2, 1, 1, '#ffd36b'); } if (gg.coming === 'out') { rect(g, x + 14, y + h - 2, 3, 3, '#9ab0c0'); rect(g, x + 15, y + h + 1, 1, 1, '#9ab0c0'); }
  if (gg.held) rect(g, x, y + h + 7, R(12 * Math.min(1, gg.holdLeft / 12)), 2, '#ffd36b');
}
