// fog_knight_art.js - THE FOG KNIGHT 2, drawn (claude/towpath2art; the greybox was src/fog-knight-hands.js drawPlate). CRUSADER SCALE (src/main.js closedhelm: a 50 px figure): a great helm
// at -54, the plate to the floor - but the plate is CONSUMED BY FOG: rust-black iron gone red and pitted, barnacles and weed, a cracked great helm with the fog of the locks spilling from
// the eye slit, plates missing where the mist shows through, and no legs - the lower body is mist, he glides. The sword trails mist in its blows.
// THE STANCES (B11): HIGH - the shield up at the helm, the sword low behind;  LOW - the sword planted point-down in front of him, both hands on the pommel, the fog pooled at his feet;
// FULL - the shield across the chest and a column of fog wound round the whole of him.
// EVERY MOVE ITS OWN WINDUP AND RELEASE POSE (B16): cutTell (the sword drawn back over the shoulder, torso coiled) / cut (swung across, a crescent of mist) / cutRec (down in front, leaning);
// lungeTell (crouched, the blade levelled at you, mist gathering behind) / lunge (stretched full length, mist streaming) / lungeRec (the point stuck out, off balance);
// lashTell (the chain whirled over the helm, hook orbiting) / lash (the arm thrown) / lashRec (the arm down, the chain slack); surgeTell (two hands, the sword raised toward the gate, body arched)
// / surge (struck down into the stones, a ring of water) / surgeRec (kneeling on the pommel); spearTell (kneeling, the point in the canal, fog gathering) / spears (the blade torn up, rising) /
// spearRec (rising, off balance); sinkTell (melting into the bank from the feet up); plunge (falling point-down, both hands on the pommel) / plungeRec (STUCK: the blade buried to the guard,
// hunched over it, cracks in the stones, fog venting); shroudTell / stepTell / stepCut (the re-formed cut); doubleTell (the sword saluting, a mist copy peeling off); empty (OPEN: the plates
// sag and stand empty, fog swirling in the hollow); reel; sleep (kneeling on his sword, visor dark) / wake; dissolve; death (the plate falls in a heap, the fog going off over the water).
// Also: the towrope's CHAIN and HOOK, the wall of water with its gate crest, the fog lances and told spots, the plunge's shadow and glow, the double's MIST look.
// Pure drawing on a 2d context g at (x, y) = his feet on screen; a left-facing figure is the same drawing mirrored.
const R = Math.round;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px1 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
const line = (g, x0, y0, x1, y1, c, w = 1) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.lineWidth = 1; };
const FOG = [196, 208, 218], FOG_D = [120, 140, 156];
/* the plate: rust-black iron, rust, a cold moonlit edge, barnacle grey, weed */
const PAL = { iron0: '#0e0c0c', iron1: '#1c1818', iron2: '#2c2424', rust0: '#3a2216', rust1: '#5c3420', rust2: '#8a5030', edge: '#7a8e92', edge2: '#aac0c0', barn: '#8c948c', barn2: '#b8c0b8', weed0: '#1e3626', weed1: '#2e4e34', weed2: '#4a7a4c' };

/* ---------- the mist he is made of: swirling ellipses, denser low; k: density ---------- */
function mist(g, x, y, w, h, time, k = 1, a = 1) {
  for (let i = 0; i < 7; i++) { const ph = time * 1.1 + i * 1.3, mx = x + Math.sin(ph) * w * 0.32 + (i - 3) * w * 0.12, my = y - (i % 3) * h * 0.28 - Math.abs(Math.sin(ph * 0.7)) * 3, rw = w * (0.22 + (i % 3) * 0.06), rh = h * (0.22 + (i % 2) * 0.08);
    g.fillStyle = rgba(i % 2 ? FOG : FOG_D, (0.2 + 0.18 * k) * a * (1 - i * 0.05)); g.beginPath(); g.ellipse(R(mx), R(my), rw, rh, 0, 0, Math.PI * 2); g.fill(); }
}
/* a swinging weed strand */
function weed(g, x, y, len, time, ph = 0) { for (let i = 0; i < len; i++) px1(g, x + Math.sin(time * 1.6 + ph + i * 0.5) * (0.6 + i * 0.12), y + i, i % 3 === 2 ? PAL.weed2 : PAL.weed1); }
function barnacles(g, x, y, n, seed) { for (let i = 0; i < n; i++) { const bx = x + ((seed * 7 + i * 5) % 8), by = y + ((seed * 3 + i * 3) % 5); px1(g, bx, by, PAL.barn); px1(g, bx + 1, by, PAL.barn2); px1(g, bx, by + 1, '#4a504a'); } }
/* the great helm: a domed, flat-topped pot with a face plate, an eye slit with the fog's light, a crack, a rusted breath-hole cluster; (cx, cy) = the slit's centre */
function helm(g, cx, cy, o) {
  const { tilt = 0, glow = 1, dark = false, flash } = o, w = 14, top = cy - 9, f = flash ? '#fff' : null;
  rc(g, cx - 6 + tilt * 0.3, top, w - 2, 1, f || PAL.iron2); rc(g, cx - 7, top + 1, w, 15, f || PAL.iron1); rc(g, cx - 7, top + 1, w, 1, f || PAL.edge);   /* dome and plate */
  rc(g, cx - 7, top + 1, 2, 15, f || PAL.iron0); rc(g, cx + 5, top + 1, 1, 15, f || PAL.edge);   /* the dark back, the lit front edge */
  rc(g, cx - 1, top + 2, 2, 14, f || PAL.iron2);   /* the face plate's ridge */
  rc(g, cx - 7, cy + 4, w, 2, f || PAL.rust0); px1(g, cx - 4, cy + 4, PAL.rust2); px1(g, cx + 2, cy + 5, PAL.rust2); rc(g, cx - 5, cy - 7, 3, 2, f || PAL.rust1);   /* rust on the brow and chin */
  for (let i = 0; i < 4; i++) px1(g, cx + 2 + (i % 2), cy + 7 + i, f || PAL.iron0);   /* breath holes */
  line(g, cx + 3, top + 1, cx + 1, top + 5, f || '#06080a'); line(g, cx + 1, top + 5, cx + 3, top + 8, f || '#06080a');   /* the crack */
  rc(g, cx - 6, cy - 1, 12, 3, f || '#04060a');   /* the eye slit */
  if (!dark) { rc(g, cx - 5, cy, 10, 1, f || '#cfeaff'); if (!f) { g.fillStyle = rgba([180, 226, 255], 0.28 * glow); g.beginPath(); g.arc(R(cx + 1), R(cy), 8, 0, Math.PI * 2); g.fill(); } }
  else rc(g, cx - 5, cy, 10, 1, f || '#3a4650');
  barnacles(g, cx - 7, top + 8, 3, 1);
}
/* the fog spilling out of the slit, streaming forward and up then back */
function slitFog(g, cx, cy, time, a = 1) { for (let i = 0; i < 6; i++) { const u = (time * 0.9 + i / 6) % 1; g.fillStyle = rgba(FOG, (0.55 - u * 0.5) * a); rc(g, cx + 5 + u * 12, cy - 1 - u * 6 + Math.sin(time * 5 + i) * 1.2, 2 + u * 2, 2); } }
/* a pauldron / plate: a rounded rim in rust-black */
function pauldron(g, x, y, w, h, f) { rc(g, x, y, w, h, f || PAL.iron1); rc(g, x, y, w, 1, f || PAL.edge); rc(g, x, y + h - 1, w, 1, f || PAL.iron0); rc(g, x, y, 1, h, f || PAL.iron0); rc(g, x + w - 1, y + 1, 1, h - 1, f || PAL.edge); rc(g, x + 1, y + 2, w - 3, 1, f || PAL.rust0); px1(g, x + 2, y + 3, PAL.rust2); }
/* a limb as plated segments (shoulder -> elbow -> hand) */
function limb(g, S, H, o) { const { f, sag = 4, th = 4 } = o, E = [(S[0] + H[0]) / 2, (S[1] + H[1]) / 2 + sag];
  for (const [a, b] of [[S, E], [E, H]]) { const n = Math.max(2, R(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2)); for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n; rc(g, x - th / 2, y - th / 2, th, th, f || (i % 3 ? PAL.iron1 : PAL.iron2)); rc(g, x - th / 2, y - th / 2, th, 1, f || PAL.edge); } }
  rc(g, E[0] - 2.5, E[1] - 2.5, 5, 5, f || PAL.iron2); rc(g, E[0] - 2.5, E[1] - 2.5, 5, 1, f || PAL.edge2); px1(g, E[0], E[1], PAL.rust2);   /* the couter */
  rc(g, H[0] - 2, H[1] - 2, 4, 4, f || PAL.iron0); rc(g, H[0] - 2, H[1] - 2, 4, 1, f || PAL.edge); }   /* the gauntlet */
/* THE SWORD: a long bastard blade from a hand H to a tip T (one pixel line with a lit edge), a crossguard at the hand, a wheel pommel; mist trails off it when `trail` */
function sword(g, H, T, o) {
  const { f, trail = 0, time = 0, glow = 0 } = o, dx = T[0] - H[0], dy = T[1] - H[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const n = R(L);
  for (let i = 0; i < n; i++) { const t = i / n, x = H[0] + dx * t, y = H[1] + dy * t, w = 2 - (t > 0.82 ? 1 : 0);
    rc(g, x - w / 2, y - w / 2, w, w, f || (i % 5 === 0 ? '#6a7678' : '#8a949a')); px1(g, x + nx * 1, y + ny * 1, f || '#c8d4d8'); if (i % 9 === 4) px1(g, x - nx, y - ny, f || '#4a5456'); }   /* the blade, its lit edge, pitting */
  px1(g, T[0], T[1], f || '#e8f0f4');
  rc(g, H[0] + nx * 4 - 1, H[1] + ny * 4 - 1, 2, 2, f || PAL.iron2); rc(g, H[0] - nx * 4 - 1, H[1] - ny * 4 - 1, 2, 2, f || PAL.iron2); line(g, H[0] + nx * 4, H[1] + ny * 4, H[0] - nx * 4, H[1] - ny * 4, f || PAL.rust1, 2);   /* the crossguard */
  rc(g, H[0] - dx / L * 4 - 1.5, H[1] - dy / L * 4 - 1.5, 3, 3, f || PAL.rust1);   /* the pommel */
  if (glow) { g.fillStyle = rgba([190, 230, 255], 0.2 * glow); g.beginPath(); g.arc(R(T[0]), R(T[1]), 6, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < trail * 6; i++) { const u = (time * 2 + i / 6) % 1, t = 0.35 + 0.65 * ((i * 0.37) % 1); g.fillStyle = rgba(FOG, 0.5 * (1 - u) * Math.min(1, trail)); rc(g, H[0] + dx * t - Math.sign(dx || 1) * u * 12, H[1] + dy * t - u * 2 + Math.sin(time * 9 + i) * 1.5, 3, 2); }
}
/* THE SHIELD: a heater, barnacled and rusted, the old sigil of the lock (a gate over water) faint on it; centre (x, y), h tall */
function shield(g, x, y, h, o) {
  const f = o.flash ? '#fff' : null, w = 12;
  for (let r = 0; r < h; r++) { const t = r / h, hw = r < h * 0.6 ? w : Math.max(2, w * (1 - (t - 0.6) / 0.4)); rc(g, x - hw / 2, y - h / 2 + r, hw, 1, f || (t < 0.1 ? PAL.edge : PAL.iron1)); }
  rc(g, x - w / 2, y - h / 2, 1, h * 0.6, f || PAL.iron0); rc(g, x + w / 2 - 1, y - h / 2 + 1, 1, h * 0.6, f || PAL.edge);
  rc(g, x - 3, y - h / 2 + 3, 6, 1, f || PAL.rust1); rc(g, x - 3, y - h / 2 + 3, 1, 8, f || PAL.rust1); rc(g, x + 2, y - h / 2 + 3, 1, 8, f || PAL.rust1); rc(g, x - 2, y - h / 2 + 7, 4, 1, f || PAL.rust2);   /* the sigil: a gate */
  barnacles(g, x - 5, y - h / 2 + 2, 4, 3); barnacles(g, x, y + h / 4, 3, 5); weed(g, x - 3, y + h / 4 - 2, 5, o.time || 0, 1);
}
/* THE PLATE: cuirass, gorget, pauldrons, tassets over the mist; `open` shows the sagging empty armour */
function torso(g, lx, o) {   /* lx: the lean px at the shoulders; origin at the waist (0, -24) */
  const f = o.flash ? '#fff' : null, sag = o.sag || 0, time = o.time || 0;
  const cx = lx * 0.5, y0 = -40 + sag;
  /* the cuirass: wide at the shoulder, waisted */
  for (let r = 0; r < 17; r++) { const t = r / 16, hw = 9 - Math.round(2.2 * t * t) + (r < 3 ? -1 : 0), yy = y0 + r, xx = cx + lx * (1 - t) * 0.3;
    rc(g, xx - hw, yy, hw * 2, 1, f || (r % 6 === 5 ? PAL.iron0 : PAL.iron1)); rc(g, xx - hw, yy, 2, 1, f || PAL.iron0); rc(g, xx + hw - 2, yy, 2, 1, f || (r % 4 === 0 ? PAL.edge : PAL.iron2)); }
  rc(g, cx - 1, y0 + 3, 2, 12, f || PAL.iron2);   /* the breastplate's ridge */
  /* the plate missing over the heart: the mist shows through, swirling */
  rc(g, cx + 2, y0 + 5, 6, 5, f || '#06080a'); if (!f) { g.fillStyle = rgba(FOG, 0.6 + 0.2 * Math.sin(time * 2)); rc(g, cx + 3, y0 + 6, 4, 3); g.fillStyle = rgba([255, 255, 255], 0.4); rc(g, cx + 3 + ((time * 6) % 3), y0 + 7, 1, 1); }
  rc(g, cx - 8, y0 + 12, 5, 4, f || PAL.rust0); px1(g, cx - 7, y0 + 13, PAL.rust2); rc(g, cx + 3, y0 + 13, 4, 3, f || PAL.rust1);   /* rust blooms */
  barnacles(g, cx - 7, y0 + 3, 4, 2); barnacles(g, cx + 1, y0 + 14, 3, 4);
  weed(g, cx - 5, y0 + 14, 9, time, 0); weed(g, cx + 3, y0 + 16, 7, time, 2); weed(g, cx - 1, y0 + 15, 6, time, 4);
  rc(g, cx - 9, y0 + 15, 18, 2, f || PAL.rust0); rc(g, cx - 1, y0 + 15, 2, 2, f || PAL.edge2);   /* the belt and its buckle */
  /* the tassets: three bands fading into the mist (no greaves) */
  for (let i = 0; i < 3; i++) { g.globalAlpha = 1 - i * 0.28; rc(g, cx - 8 + i, y0 + 17 + i * 3, 16 - i * 2, 3, f || (i % 2 ? PAL.iron1 : PAL.iron2)); rc(g, cx - 8 + i, y0 + 17 + i * 3, 16 - i * 2, 1, f || PAL.edge); } g.globalAlpha = 1;
}

/* ---------- THE POSES: sword hand/tip, shield, head, lean, crouch - by mode and stance (right-facing; y up negative) ---------- */
function pose(mode, stance, p, time) {
  const bob = Math.sin(time * 2) * 0.8;
  const D = { lean: 0, crouch: 0, head: [0, 0], hand: [-5, -26], tip: [-9, -2], shield: [10, -34, 18], two: false, trail: 0, glow: 0, arch: 0, fogcol: 0, wrap: false, dark: false, kneel: 0, flex: 0, shieldHide: false, armF: null };
  switch (mode) {
    case 'sleep': return { ...D, lean: 2, crouch: 6, kneel: 1, head: [3, 5], hand: [4, -24], tip: [4, 0], two: true, shieldHide: true, dark: true, glow: 0 };
    case 'wake': return { ...D, lean: 1 - p * 2, crouch: 6 * (1 - p), kneel: p < 0.7 ? 1 : 0, head: [3 * (1 - p), 5 * (1 - p)], hand: [4, -24], tip: [4, 0], two: true, shieldHide: p < 0.4, dark: p < 0.6 };
    case 'cutTell': return { ...D, lean: -3 - p * 2, hand: [-6, -50 + p * -2], tip: [-20 + p * -4, -64 + p * 2], shield: [10, -26, 18], glow: p, trail: 0.2 };
    case 'cut': return { ...D, lean: 5, hand: [10, -38], tip: [46, -30], shield: [5, -22, 18], trail: 1, glow: 0.6, flex: 1 };
    case 'cutRec': return { ...D, lean: 5, crouch: 2, head: [3, 3], hand: [14, -22], tip: [34, -6], shield: [0, -20, 18], flex: 1 };
    case 'stepTell': return { ...D, lean: -4, hand: [-6, -50], tip: [-22, -62], shield: [10, -26, 18], glow: 0.8, trail: 0.7 };
    case 'stepCut': return { ...D, lean: 5, hand: [10, -38], tip: [46, -30], shield: [5, -22, 18], trail: 1.3, glow: 0.9, flex: 1 };
    case 'lungeTell': return { ...D, lean: -5 - p * 2, crouch: 6 + p * 2, head: [2, 3], hand: [-10, -26], tip: [30, -30], shield: [0, -22, 18], two: false, trail: 0.4, glow: 0.7, fogcol: 1 };
    case 'lunge': return { ...D, lean: 9, crouch: 8, head: [4, 5], hand: [10, -30], tip: [50, -30], shield: [-10, -28, 14], trail: 1.6, glow: 1, flex: 1, fogcol: 2 };
    case 'lungeRec': return { ...D, lean: 8, crouch: 5, head: [4, 6], hand: [14, -26], tip: [44, -16], shield: [-8, -24, 14], flex: 1 };
    case 'lashTell': return { ...D, lean: -1, hand: [-6, -24], tip: [-10, 2], shield: [4, -50, 14], armF: [8, -56], trail: 0, glow: 0.3 };
    case 'lash': return { ...D, lean: 4, hand: [-6, -24], tip: [-10, 2], shield: [8, -40, 14], armF: [24, -40], flex: 1 };
    case 'lashRec': return { ...D, lean: 3, crouch: 2, head: [2, 3], hand: [-6, -24], tip: [-10, 2], shield: [14, -26, 14], armF: [20, -26] };
    case 'surgeTell': return { ...D, lean: -4 - p * 2, arch: 1, hand: [3, -56], tip: [14, -84], two: true, shieldHide: true, glow: p, trail: 0.2 };
    case 'surge': return { ...D, lean: 6, crouch: 6, head: [3, 4], hand: [8, -30], tip: [26, 0], two: true, shieldHide: true, trail: 1, glow: 1, flex: 1 };
    case 'surgeRec': return { ...D, lean: 4, crouch: 7, kneel: 1, head: [3, 6], hand: [10, -26], tip: [24, 0], two: true, shieldHide: true };
    case 'spearTell': return { ...D, lean: 2, crouch: 8, kneel: 1, head: [3, 6], hand: [8, -28], tip: [14, 3], two: true, shieldHide: true, fogcol: 1, glow: p };
    case 'spears': return { ...D, lean: -3, crouch: 2, hand: [4, -38], tip: [20, -66], two: true, shieldHide: true, glow: 1, trail: 1, flex: 1 };
    case 'spearRec': return { ...D, lean: 2, crouch: 3, head: [2, 3], hand: [8, -30], tip: [22, -8], shield: [4, -24, 14], flex: 1 };
    case 'sinkTell': return { ...D, lean: 0, crouch: 4 + p * 6, head: [0, 3], hand: [-5, -26], tip: [-9, -2], shield: [10, -30, 18], fogcol: 2 };
    case 'plunge': return { ...D, lean: 0, crouch: 0, head: [1, -2], hand: [1, -24], tip: [1, 3], two: true, shieldHide: true, arch: -1, plungeBody: true, trail: 1.2 };
    case 'plungeRec': return { ...D, lean: 4, crouch: 9, kneel: 1, head: [4, 8], hand: [6, -22], tip: [6, 6], two: true, shieldHide: true, fogcol: 2, stuck: true };
    case 'shroudTell': return { ...D, lean: 0, hand: [-5, -28], tip: [-9, -4], shield: [10, -34, 18], fogcol: 2, wrap: true, spread: 1, glow: 0.7 };
    case 'doubleTell': return { ...D, lean: -1, hand: [8, -40], tip: [8, -76], shield: [-2, -34, 14], shieldHide: false, glow: 1, fogcol: 1, salute: true };
    case 'empty': return { ...D, lean: 3, crouch: 2, head: [4, 6], hand: [3, -24], tip: [3, 0], two: false, shield: [12, -18, 18], dark: true, sag: 5, hollow: true, fogcol: 2 };
    case 'reel': return { ...D, lean: -6, crouch: 0, head: [-3, 0], hand: [-14, -34], tip: [-30, -22], shield: [12, -24, 18], flex: 1, fogcol: 1 };
    default: break;
  }
  /* guard (walk / recover / stanceTell / dissolve / reform): the three stances */
  if (stance === 'high') return { ...D, lean: 1, head: [1, 0], hand: [-5, -26 + bob * 0.3], tip: [-12, -4], shield: [11, -46, 20], glow: 0.4 };
  if (stance === 'low') return { ...D, lean: 2, crouch: 2, head: [2, 2], hand: [10, -26], tip: [11, 3], two: true, shield: [-2, -26, 18], shieldHide: false, fogcol: 2, glow: 0.4 };
  return { ...D, lean: 0, hand: [-4, -30], tip: [-22, -46], shield: [8, -32, 22], wrap: true, glow: 0.5, fogcol: 1 };   /* full */
}

/* ---------- THE KNIGHT ---------- */
function knightRaw(g, x, y, f, o, time) {
  const { stance = 'high', mode = 'walk', alpha = 1, visor = 1, sag = 0, flash = false, p = 0, double = false, e } = o;
  const P = pose(mode, stance, p, time), fl = flash ? '#fff' : null;
  g.save(); g.globalAlpha = alpha; g.translate(R(x), R(y)); if (f < 0) g.scale(-1, 1);
  const bob = (mode === 'walk' || mode === 'recover' || mode === 'stanceTell') ? Math.round(Math.sin(time * 2.2) * 1) : 0, cr = P.crouch, lx = P.lean;
  /* the mist he stands in: his lower body (denser when pooled or wrapped) */
  mist(g, 0, -4, 38 + P.fogcol * 8, 18 + P.fogcol * 6, time, 1 + P.fogcol * 0.5, double ? 0.8 : 1);
  if (P.fogcol >= 2 && !P.plungeBody) mist(g, 4, -2, 50, 14, time + 1, 1.2, 0.8);
  if (P.wrap) { g.fillStyle = rgba(FOG, 0.34); g.beginPath(); g.ellipse(0, -26 + bob, 17, 28, 0, 0, Math.PI * 2); g.fill(); for (let i = 0; i < 6; i++) { const a = time * 1.6 + i * 1.05; g.fillStyle = rgba([226, 236, 244], 0.45); rc(g, Math.cos(a) * 16, -26 + Math.sin(a) * 20 + Math.sin(a * 2), 3, 2); } }   /* the fog wound round him */
  g.translate(0, cr + bob);
  const sw = (P.sag || 0) + sag;
  /* the plunge: a falling figure, hands up on the pommel, the trailing mist above */
  if (P.plungeBody) {
    sword(g, [1, -24], [1, 3], { f: fl, time, trail: 1, glow: 1 });
    limb(g, [-5, -38], [-1, -26], { f: fl, sag: -3 }); limb(g, [5, -38], [3, -26], { f: fl, sag: -3 });
    torso(g, 0, { flash, sag: -8 + 14, time }); helm(g, 1, -42 + 10, { glow: 1, dark: false, flash });
    for (let i = 0; i < 8; i++) { const u = (time * 2.4 + i / 8) % 1; g.fillStyle = rgba(FOG, 0.5 * (1 - u)); rc(g, -8 + i * 2.2, -60 - u * 26, 2, 3 + u * 3); }
    g.restore(); return; }
  /* the back arm (the shield arm's partner), then the torso, then the front arm and the sword, then the shield */
  const sh = P.shield;
  if (!P.shieldHide && !P.armF) limb(g, [-6 + lx * 0.5, -36 + sw], [sh[0] - 4, sh[1]], { f: fl, sag: 5 });
  if (P.armF) limb(g, [6 + lx * 0.5, -36 + sw], P.armF, { f: fl, sag: P.flex ? 1 : 3 });
  /* the sword behind the torso in the guard stances (its hand is the back hand); in a blow it is in front */
  const inFront = P.flex || P.two || P.salute || P.stuck;
  if (!inFront) sword(g, P.hand, P.tip, { f: fl, time, trail: P.trail, glow: P.glow });
  torso(g, lx, { flash, sag: sw, time });
  /* the pauldrons */
  pauldron(g, lx * 0.5 - 12, -41 + sw, 8, 7, fl); pauldron(g, lx * 0.5 + 5, -42 + sw, 9, 8, fl); barnacles(g, lx * 0.5 + 6, -41 + sw, 3, 6);
  /* the helm: set on a gorget; tilted forward when the plate is empty or hurt, bowed in a recovery, the slit's fog streaming */
  const hx = 1 + lx + P.head[0], hy = -48 + P.head[1] + sw;
  rc(g, hx - 4, hy + 10, 8, 3, fl || PAL.iron2); rc(g, hx - 4, hy + 10, 8, 1, fl || PAL.edge);
  helm(g, hx, hy + 2, { tilt: P.head[0], glow: P.dark ? 0 : visor, dark: P.dark || visor < 0.5, flash });
  if (!P.dark && visor >= 0.5 && !flash) slitFog(g, hx, hy + 2, time, 1);
  if (P.hollow) { g.fillStyle = rgba(FOG, 0.55 + 0.2 * Math.sin(time * 3)); rc(g, hx + 3, hy + 3, 2, 8); for (let i = 0; i < 8; i++) { const u = (time * 0.8 + i / 8) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, -9 + i * 2.5 + lx * 0.5, -32 + sw - u * 14, 2, 2); }
    for (const [jx, jy] of [[hx - 5, hy + 12], [lx * 0.5 + 8, -28 + sw], [lx * 0.5 - 9, -28 + sw], [0, -20]]) { for (let i = 0; i < 3; i++) { const u = (time * 1.2 + i / 3 + jx * 0.1) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, jx + i - 1, jy - u * 7, 2, 2); } } }   /* the fog leaking from every joint */
  /* the front arm and sword / the shield */
  if (inFront) {
    if (P.two) { limb(g, [6 + lx * 0.5, -36 + sw], P.hand, { f: fl, sag: 3 }); limb(g, [-3 + lx * 0.5, -36 + sw], [P.hand[0] - 2, P.hand[1] - 3], { f: fl, sag: 3 }); }
    else limb(g, [6 + lx * 0.5, -36 + sw], P.hand, { f: fl, sag: P.flex ? 1 : 3 });
    sword(g, P.hand, P.tip, { f: fl, time, trail: P.trail, glow: P.glow });
    if (P.stuck) { /* buried to the guard: stones cracked round the blade, fog venting up the slot */
      for (let i = 0; i < 5; i++) { const cx0 = P.tip[0] + (i - 2) * 5; line(g, cx0, 0, cx0 + (i % 2 ? 3 : -3), 2 + (i % 3), '#06080a'); }
      for (let i = 0; i < 6; i++) { const u = (time * 1.5 + i / 6) % 1; g.fillStyle = rgba(FOG, 0.6 * (1 - u)); rc(g, P.tip[0] - 5 + i * 2, -u * 14, 2, 2); } } }
  if (!P.shieldHide) { if (!P.armF) { shield(g, sh[0], sh[1], sh[2], { flash, time }); limb(g, [6 + lx * 0.5, -35 + sw], [sh[0] - 3, sh[1] + 2], { f: fl, sag: 3, th: 3 }); } else shield(g, sh[0], sh[1], sh[2], { flash, time }); }
  /* THE TOWROPE in the windup: whirled over the helm - its loops and the hook orbiting (the throw is drawn by drawChain) */
  if (mode === 'lashTell') { const a = time * 16 + p * 10; const hx0 = P.armF[0], hy0 = P.armF[1]; for (let i = 1; i <= 7; i++) { const t = i / 7, ang = a - t * 1.6; px1(g, hx0 + Math.cos(ang) * 16 * t, hy0 + Math.sin(ang) * 7 * t, i % 2 ? '#7a6a54' : '#4e3a2c'); rc(g, hx0 + Math.cos(ang) * 16 * t - 1, hy0 + Math.sin(ang) * 7 * t - 1, 2, 2, i % 2 ? '#8a7a64' : '#5a4638'); }
    drawHook(g, hx0 + Math.cos(a - 1.6) * 16, hy0 + Math.sin(a - 1.6) * 7, a); }
  /* the blow's own trail: a crescent of mist behind a cut, a streak behind a lunge */
  if (mode === 'cut' || mode === 'stepCut') { for (let i = 0; i < 9; i++) { const a = -2.1 + i * 0.34; g.fillStyle = rgba(FOG, 0.55 - i * 0.04); rc(g, 12 + Math.cos(a) * 34, -36 + Math.sin(a) * 26, 3, 2); } }
  if (mode === 'lunge') for (let i = 0; i < 9; i++) { g.fillStyle = rgba(FOG, 0.5 - i * 0.05); rc(g, -12 - i * 7, -34 + Math.sin(time * 14 + i) * 3 + (i % 3) * 3, 8, 2); }
  if (mode === 'surge') { g.fillStyle = rgba([210, 236, 246], 0.7); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; rc(g, 26 + Math.cos(a) * 11, -Math.sin(a) * 7 - 1, 2, 2); } g.fillStyle = rgba([210, 236, 246], 0.4); g.beginPath(); g.ellipse(26, 0, 14, 3, 0, 0, Math.PI * 2); g.fill(); }
  if (mode === 'reel') for (let i = 0; i < 10; i++) { const a = i * 0.63 + time * 5; g.fillStyle = rgba(FOG, 0.6); rc(g, Math.cos(a) * 16, -32 + Math.sin(a) * 14, 2, 2); }
  if (mode === 'doubleTell') { for (let i = 0; i < 12; i++) { const u = (time * 1.4 + i / 12) % 1; g.fillStyle = rgba(FOG, 0.5 * (1 - u)); rc(g, -16 - u * 12, -50 + (i * 5) % 40, 3, 2); } }
  if (mode === 'shroudTell') for (let i = 0; i < 10; i++) { const u = (time * 1.1 + i / 10) % 1; g.fillStyle = rgba(FOG, 0.55 * (1 - u)); rc(g, -14 + (i * 7) % 28, -4 - u * 52, 3, 4); }
  g.restore();
}
/* THE KNIGHT: the plate; the two moves that eat or wash the picture (sinkTell melts him from the feet up; the MIST DOUBLE is a pale wash over the whole plate - no rust, no iron: only the shape and the cold) are done on a scratch canvas */
let SCR = null;
export function drawKnight(g, x, y, f, o, time) {
  const needs = o.mode === 'sinkTell' || o.double;
  if (!needs || typeof document === 'undefined') { knightRaw(g, x, y, f, o, time); return; }
  if (!SCR) { SCR = document.createElement('canvas'); SCR.width = 132; SCR.height = 124; }
  const s = SCR.getContext('2d'); s.imageSmoothingEnabled = false; s.setTransform(1, 0, 0, 1, 0, 0); s.globalCompositeOperation = 'source-over'; s.globalAlpha = 1; s.clearRect(0, 0, 132, 124);
  knightRaw(s, 66, 104, f, { ...o, alpha: 1 }, time);
  if (o.mode === 'sinkTell') { s.globalCompositeOperation = 'destination-out'; const p = o.p || 0; for (let r = 0; r < 60 * p; r += 2) { s.fillStyle = 'rgba(0,0,0,' + Math.max(0.1, 1 - r / 90).toFixed(2) + ')'; s.fillRect(0, 104 + 6 - r, 132, 2); } s.globalCompositeOperation = 'source-over'; }
  if (o.double) { s.globalCompositeOperation = 'source-atop'; s.fillStyle = 'rgba(190,206,218,0.8)'; s.fillRect(0, 0, 132, 124); s.globalCompositeOperation = 'source-over'; for (let i = 0; i < 6; i++) { const u = (time * 1.2 + i / 6) % 1; s.fillStyle = rgba(FOG, 0.5 * (1 - u)); s.fillRect(R(56 + i * 4), R(48 + u * -10), 2, 2); } }
  const a = o.alpha === undefined ? 1 : o.alpha; g.globalAlpha = a; g.drawImage(SCR, R(x) - 66, R(y) - 104); g.globalAlpha = 1;
}

/* THE HOOK: a barbed iron grapple; (x, y) the shank's head, ang the way it points */
export function drawHook(g, x, y, ang = 0, o = {}) {
  g.save(); g.translate(R(x), R(y)); g.rotate(ang);
  rc(g, -3, -1, 6, 2, PAL.iron2); rc(g, -3, -1, 6, 1, PAL.edge2); rc(g, 3, -2, 2, 4, PAL.rust1);   /* the shank and its ring */
  for (const s of [-1, 1]) { rc(g, 4, s * 3 - 1, 4, 2, PAL.iron1); rc(g, 7, s * 5 - (s > 0 ? 0 : 1), 2, 3, PAL.iron2); px1(g, 8, s * 6, '#d8e4e8'); }   /* two barbed flukes */
  rc(g, -5, -2, 2, 4, PAL.iron1); g.restore();
}
/* THE TOWROPE'S CHAIN: rusted links from his hand to its hook, hung with weed, the hook at the end */
export function drawChain(g, hx, hy, lx, ly, time, hooked) {
  const dx = lx - hx, dy = ly - hy, L = Math.hypot(dx, dy), n = Math.max(3, R(L / 4)), sag = hooked ? 0 : Math.min(8, L * 0.05);
  for (let i = 0; i < n; i++) { const t = i / n, x = hx + dx * t, y = hy + dy * t + Math.sin(t * Math.PI) * sag; g.fillStyle = i % 2 ? '#3a2a20' : '#6a5440'; g.fillRect(R(x) - 1, R(y) - 1, 3, 2); if (i % 2 === 0) { g.fillStyle = '#9a8468'; g.fillRect(R(x), R(y) - 1, 1, 1); } }
  if (L > 30) weed(g, hx + dx * 0.5, hy + dy * 0.5 + 2, 4, time, 3);
  drawHook(g, lx, ly, Math.atan2(dy, dx));
}
/* THE WALL OF WATER (the lock surge): a green-black wave with a white crest and a foam head, the canal in it, running up the towpath from the gate (x: its front, w: its length behind, h: its depth) */
export function drawWave(g, x, floorY, w, h, time) {
  g.fillStyle = 'rgba(30,76,92,0.9)'; g.fillRect(R(x - 10), R(floorY - h), R(w + 10), R(h));
  g.fillStyle = 'rgba(54,118,132,0.7)'; for (let i = 0; i < 5; i++) g.fillRect(R(x - 6 + i * (w / 5)), R(floorY - h + 6 + (i % 3) * 5 + Math.sin(time * 8 + i) * 2), R(w / 6), 3);
  g.fillStyle = 'rgba(8,24,32,0.5)'; g.fillRect(R(x - 10), R(floorY - 5), R(w + 10), 5);
  /* the crest: it curls over at the front */
  for (let i = 0; i < 12; i++) { const yy = floorY - h - 4 + i * (h / 11), curl = Math.sin((i / 11) * Math.PI) * 6; g.fillStyle = 'rgba(226,244,250,' + (0.95 - i * 0.04).toFixed(2) + ')'; g.fillRect(R(x - 12 - curl), R(yy), R(7 + curl * 0.4), 3); }
  g.fillStyle = 'rgba(240,252,255,0.95)'; g.fillRect(R(x - 12), R(floorY - h - 5), 18, 3); for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(232,248,252,0.85)'; g.fillRect(R(x - 18 - i * 3), R(floorY - h + Math.sin(time * 18 + i * 1.7) * 5 + i * 4), 3, 3); }   /* spray */
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(210,236,244,0.55)'; g.fillRect(R(x - 4 + i * 9), R(floorY - 2 - (i % 2) * 2), 7, 2); }   /* foam along the floor */
}
/* THE GATE'S CREST GAUGE in the surge's windup: the old tide-staff on the gate, a white crest climbing it (k 0..1) and a red !! */
export function drawGateCrest(g, gx, floorY, k, time, h = 70) {
  rc(g, gx - 5, floorY - h - 2, 10, h + 2, 'rgba(8,14,18,0.7)'); for (let i = 0; i < h; i += 8) rc(g, gx - 5, floorY - i - 1, i % 16 ? 4 : 7, 1, '#b8c8c8');   /* the tide staff's marks */
  g.fillStyle = 'rgba(200,232,244,0.85)'; g.fillRect(R(gx - 4), R(floorY - h * k), 8, R(h * k)); g.fillStyle = 'rgba(240,252,255,0.95)'; g.fillRect(R(gx - 5), R(floorY - h * k - 2), 10, 3);
  for (let i = 0; i < 6; i++) { const u = (time * 3 + i / 6) % 1; g.fillStyle = 'rgba(226,244,250,' + (0.7 * (1 - u)).toFixed(2) + ')'; g.fillRect(R(gx - 6 + i * 2.4), R(floorY - h * k - 3 - u * 8), 2, 2); }
}
/* A FOG LANCE (the spears): a spar of hard mist torn up out of the canal with a pale head and a frost rim; h its height (rising: 0..full) */
export function drawLance(g, x, floorY, h, time) {
  const w = 6; g.fillStyle = 'rgba(176,196,208,0.8)'; g.fillRect(R(x - w / 2), R(floorY - h), w, R(h)); g.fillStyle = 'rgba(232,244,250,0.95)'; g.fillRect(R(x - w / 2), R(floorY - h), 2, R(h)); g.fillStyle = 'rgba(96,120,136,0.8)'; g.fillRect(R(x + w / 2 - 2), R(floorY - h), 2, R(h));
  g.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) g.fillRect(R(x - 3 + i), R(floorY - h - 4 + i * 1.5), 6 - i * 2, 2); g.fillRect(R(x - 1), R(floorY - h - 7), 2, 3);   /* the head */
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(214,230,238,0.6)'; g.fillRect(R(x - 8 + i * 5 + Math.sin(time * 14 + i) * 1), R(floorY - 2 - ((time * 40 + i * 9) % Math.max(4, h))), 2, 3); }
  g.fillStyle = 'rgba(210,232,240,0.6)'; g.beginPath(); g.ellipse(R(x), R(floorY - 1), 9, 3, 0, 0, Math.PI * 2); g.fill();
}
/* THE TOLD SPOT where a lance will rise: a ring of ripples and fog threads in the canal, bright in a light (lt 0..1) */
export function drawSpearSpot(g, x, floorY, lt, time) {
  const a = Math.min(0.95, 0.24 + lt * 1.2), warm = lt > 0.15; g.globalAlpha = a;
  g.strokeStyle = warm ? '#ffd36b' : '#c8d8e8'; for (let i = 0; i < 2; i++) { const rr = 5 + i * 4 + ((time * 6) % 4); g.globalAlpha = a * (1 - i * 0.4); g.beginPath(); g.ellipse(R(x) + 0.5, R(floorY - 1) + 0.5, rr, rr * 0.3, 0, 0, Math.PI * 2); g.stroke(); }
  g.globalAlpha = a; g.fillStyle = warm ? '#ffe9a0' : '#dce8f0'; for (let i = 0; i < 3; i++) g.fillRect(R(x - 3 + i * 3), R(floorY - 7 - ((time * 12 + i * 4) % 5)), 1, 4); g.fillRect(R(x - 1), R(floorY - 3), 2, 2); g.globalAlpha = 1;
}
/* THE PLUNGE'S SHADOW and the glow of him above it (k 0..1 over the told beat) */
export function drawPlungeShadow(g, sx, floorY, k, time) {
  g.globalAlpha = 0.35 + 0.45 * k; g.fillStyle = '#04070b'; g.beginPath(); g.ellipse(R(sx), R(floorY - 1), 7 + 18 * k, 2 + 2 * k, 0, 0, Math.PI * 2); g.fill();
  g.globalAlpha = 0.5 * k; g.strokeStyle = '#cfe8ff'; g.beginPath(); g.ellipse(R(sx) + 0.5, R(floorY - 1) + 0.5, 12 + 14 * (1 - k), 3, 0, 0, Math.PI * 2); g.stroke();   /* the closing ring */
  const gy = floorY - 110 + 40 * k; g.globalAlpha = 0.25 + 0.5 * k; g.fillStyle = '#cfe8ff'; g.beginPath(); g.arc(R(sx), R(gy), 7 + 3 * k, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.3 * k; g.fillStyle = '#ffffff'; g.fillRect(R(sx - 1), R(gy), 2, R(floorY - gy)); g.globalAlpha = 1;
}
/* THE DEATH: the plate collapses where it stands and lies in a heap - helm rolled aside, the cuirass split, a pauldron, the sword across it - and the fog goes off over the water (u 0..1 over ~1.6 s, then the heap stays) */
export function drawDeadPlate(g, x, y, f, u, time) {
  g.save(); g.translate(R(x), R(y)); if (f < 0) g.scale(-1, 1);
  const k = Math.min(1, u), fall = k * k;
  /* the heap: iron on the stones */
  rc(g, -17, -3, 34, 3, '#0a0808');
  const piece = (px, py, w, h, c, hi) => { rc(g, px, py, w, h, c); rc(g, px, py, w, 1, hi || PAL.edge); rc(g, px, py + h - 1, w, 1, PAL.iron0); };
  piece(-15, -9 * fall, 12, 9, PAL.iron1); piece(-3 + 4 * (1 - fall), -8 * fall - 1, 14, 8, PAL.iron2); rc(g, 1, -9 * fall + 2, 8, 2, PAL.rust1);   /* the cuirass, split */
  piece(8 + 3 * (1 - fall), -5 * fall, 8, 5, PAL.iron1); piece(-17, -4 * fall, 6, 4, PAL.iron2);   /* a pauldron and a tasset */
  barnacles(g, -11, -9 * fall + 2, 4, 3); weed(g, -6, -3, 4, time, 1);
  /* the helm: it falls from the shoulders and rolls to rest on its side, the slit dark */
  const hx = 12 + 6 * fall, hy = -34 * (1 - fall) - 3 * fall;
  g.save(); g.translate(hx, hy - 6); g.rotate(fall * 1.5); rc(g, -6, -6, 12, 12, PAL.iron1); rc(g, -6, -6, 12, 1, PAL.edge); rc(g, -6, -6, 1, 12, PAL.iron0); rc(g, -5, -1, 10, 2, '#04060a'); line(g, 1, -6, 0, -1, '#06080a'); px1(g, 3, 3, PAL.rust2); g.restore();
  /* the sword lies across the heap, point to the water */
  line(g, -22, -2, 20 + 6 * fall, -4 * fall - 1, '#7a8a90', 2); line(g, -22, -3, 20, -4 * fall - 2, '#c8d4d8'); rc(g, -24, -5, 3, 5, PAL.rust1);
  /* the fog going off over the water: pale streams lifting and leaning away, thinning with time */
  const n = 14; for (let i = 0; i < n; i++) { const v = (time * 0.5 + i / n) % 1, a = (0.6 * (1 - v)) * (0.45 + 0.55 * (1 - k * 0.5)); g.fillStyle = rgba(FOG, a); rc(g, -10 + v * 60 + Math.sin(i * 3.1) * 4, -6 - v * 20 - (i % 4) * 4 + Math.sin(time * 2 + i) * 1.5, 4 + v * 5, 2 + (i % 2)); }
  g.restore();
}
