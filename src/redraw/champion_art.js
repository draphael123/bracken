// champion_art.js - THE ADMIRAL'S CHAMPION, THE HAND-DRAWN SHEET (claude/flotilla2art; the greybox of claude/flotilla2 is replaced, the API and the pose keys are kept).
// Pure drawing on a 2d context g at (x, y) = his feet on screen; f = facing (+1 right). o = { mode, p (the move's progress 0..1: told modes AND their release / recovery), flash, anchor, ward, open }.
// HE IS: a huge, salt-crusted, LIVING plate knight (about 70 px with the crest): a barrel breastplate, broad round pauldrons, a closed sallet with a crest of salt, a sea-green
// surcoat in rags, barnacled greaves, and a warm eye in the slit (he is not drowned: the act has the drowned already). P1 he carries the boarding greatsword; P2 he tears the anchor off
// the rail and swings it on its chain.
// EVERY MOVE HAS ITS OWN WINDUP AND ITS OWN RELEASE (B16). The pose keys (the contract with src/admirals-champion-hands.js):
//   walk / recover / sleep / wake / card (the bestiary card)
//   P1  comboTell (the blade drawn back over the shoulder, back arched)  -> combo (swung across, the crescent)     -> comboRec (down in front, leaning on it)
//       slamTell (two hands, the blade over the helm, up on his toes)    -> slam (struck down, the deck splinters)  -> stuck (OPEN: hauling at the buried blade) -> slamRec (wrenched free)
//       thrustTell (coiled low, the point levelled at the hip)           -> thrust (stretched full length, the streak) -> thrustRec (spent, blade dropping)
//       leapTell (deep crouch, the blade low)                            -> leap (in the air, the blade over the head) -> landRec (one knee down, the deck cracked)
//       flat (OPEN: on his back, the blade loose, stars), then getting up into the grey WARDED guard (o.ward: the whole sheet goes to cold grey steel)
//   P2  tearTell (hauling the anchor up off the rail, the lashings parting) -> walk/recover drag the anchor on its chain
//       sweepTell (wound back behind him) -> sweep (the arm thrown round, the pass drawn by the hands) -> sweepRec (the anchor dropped, heaving)
//       hookTell (the anchor whirled over the helm) -> hook (the arm thrown) -> hookRec (hauling the chain home)
//       tiltTell (the anchor two-handed over the helm) -> tilt (struck down, the flukes bite) -> stuckA (OPEN: hauling it out of the deck) -> tiltRec
//   dead (drawDeadChampion): he goes to his knees, over on his face, and lies on the lashings.
const R = Math.round, D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => R(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
const NORM = { p0: '#1f262d', p1: '#37444f', p2: '#566876', p3: '#8497a5', p4: '#b9c8d2', salt: '#eef3ec', salt2: '#c6d4cf', salt3: '#8da39f', c0: '#12302c', c1: '#21463f', c2: '#35695a', c3: '#4d8a73',
  rust: '#6e3b21', rust2: '#a45b2e', iron: '#2a2b32', iron2: '#4b4d5a', iron3: '#7a7d8e', blade: '#e1eaf0', bladeD: '#8798a5', bladeS: '#566673', grip: '#46291a', brass: '#c9a44c', brass2: '#8a6a28',
  slit: '#040506', eye: '#ffd27a', eyeG: '#ff9a3c', deck: '#1a1410', splint: '#c9b27c', splint2: '#8a7454', foam: '#dff2f8', foul: '#7a8a3a' };
const tintPal = (p, to, k, keep = []) => { const o = {}; for (const key in p) o[key] = keep.includes(key) ? p[key] : mix(p[key], to, k); return o; };
const WARD = tintPal(NORM, '#9fb4c6', 0.62, ['slit', 'eye', 'eyeG', 'deck', 'splint', 'splint2', 'foam', 'foul']);   /* the told ward: cold grey steel, a pale glaze over the coat */
const FLASH = tintPal(NORM, '#ffffff', 0.78, ['slit', 'deck', 'splint', 'splint2', 'foam', 'foul']);
let C = NORM;   /* the palette of this call */

/* ---- local space: u forward (along f), v up from his feet. Every primitive takes (u, v) ---- */
let g_, X_ = 0, Y_ = 0, F_ = 1;
const fr = (u, v, w, h, col) => { u = R(u); v = R(v); g_.fillStyle = col; g_.fillRect(F_ > 0 ? X_ + u : X_ - u - w, Y_ - v - h, w, h); };
const pix = (u, v, col) => fr(u, v, 1, 1, col);
function pl(u0, v0, u1, v1, w, col) { const n = Math.max(1, Math.ceil(Math.max(Math.abs(u1 - u0), Math.abs(v1 - v0)))); for (let i = 0; i <= n; i++) fr(lerp(u0, u1, i / n) - w / 2, lerp(v0, v1, i / n) - w / 2, w, w, col); }
function disc(u, v, r, col) { u = R(u); v = R(v); for (let d = -r; d <= r; d++) { const hw = Math.floor(Math.sqrt(r * r - d * d + 0.5)); fr(u - hw, v + d, 2 * hw + 1, 1, col); } }
const noise = (i, k = 7) => ((i * 2654435761 + k * 40503) >>> 0) % 1000 / 1000;

/* the two-bone limb: the elbow / knee of a limb of lengths l1, l2 from (au, av) to (bu, bv); `side` picks the way it bends */
function bend(au, av, bu, bv, l1, l2, side) {
  const dx = bu - au, dv = bv - av, d = Math.max(0.01, Math.hypot(dx, dv)), m = Math.min(d, l1 + l2 - 0.01), a = (l1 * l1 - l2 * l2 + m * m) / (2 * m), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const ux = dx / d, uy = dv / d; let px = -uy, py = ux; if (px * side < 0) { px = -px; py = -py; }
  return [au + ux * a + px * h, av + uy * a + py * h];
}

/* ================= THE PIECES ================= */
function leg(hu, hv, fu, fv, side, shin) {
  const [ku, kv] = bend(hu, hv, fu, fv, 13, 13, 1);
  pl(hu, hv, ku, kv, 8, C.p1); pl(hu - 1, hv, ku - 1, kv, 2, C.p2);   /* the cuisse */
  pl(ku, kv, fu, fv + 3, 7, C.p1); pl(ku + 1, kv - 1, fu + 1, fv + 4, 2, C.p2); pl(ku - 3, kv - 2, fu - 3, fv + 4, 2, C.p0);   /* the greave, lit on its front, dark behind */
  disc(ku + 1, kv, 4, C.p2); disc(ku + 1, kv, 2, C.p3); pix(ku, kv + 2, C.p4); fr(ku - 3, kv - 2, 2, 1, C.salt); pix(ku + 2, kv - 3, C.salt2);   /* the poleyn */
  if (shin) { const bu = lerp(ku, fu, 0.55), bv = lerp(kv, fv, 0.55); fr(bu - 1, bv, 2, 2, C.salt); pix(bu + 2, bv + 3, C.salt2); fr(bu - 3, bv - 3, 2, 1, C.salt3); pix(bu, bv - 5, C.salt); }   /* barnacles */
  fr(fu - 3, fv, 10, 3, C.p0); fr(fu - 2, fv + 3, 7, 1, C.p1); fr(fu + 4, fv, 3, 2, C.p2);   /* the sabaton */
}
function pauldron(u, v, r, lit) {
  disc(u, v, r, C.p0); disc(u + 0, v + 1, r - 1, lit ? C.p2 : C.p1); disc(u + 1, v + 2, r - 3, lit ? C.p3 : C.p2);
  fr(u - r + 2, v + r - 2, 4, 1, C.p4); pix(u - r + 1, v + r - 3, C.p4);   /* the rim catching the light */
  fr(u - 1, v - r + 1, r, 1, C.p0);   /* the lames under the dome */
  fr(u + 1, v + 1, 2, 2, C.salt); pix(u + 4, v - 1, C.salt2); pix(u - 3, v + 3, C.salt3); fr(u - 4, v - 2, 2, 1, C.salt2);   /* barnacles on the dome */
  pix(u + 3, v + r - 2, C.brass);   /* a rivet */
}
function arm(su, sv, hu, hv, side, lit) {
  const [eu, ev] = bend(su, sv, hu, hv, 11, 11, side);
  pl(su, sv, eu, ev, 6, C.p1); pl(su, sv + 1, eu, ev + 1, 2, lit ? C.p3 : C.p2);   /* the rerebrace */
  pl(eu, ev, hu, hv, 5, lit ? C.p2 : C.p1); pl(eu, ev + 1, hu, hv + 1, 1, lit ? C.p4 : C.p3);   /* the vambrace */
  disc(eu, ev, 3, lit ? C.p3 : C.p2); pix(eu - 1, ev + 1, C.p4);   /* the couter */
}
function gauntlet(u, v) { disc(u, v, 3, C.p0); disc(u, v + 1, 2, C.p2); pix(u - 1, v + 2, C.p4); fr(u - 3, v - 1, 2, 1, C.salt2); }
/* the closed sallet: a dome, a brim, a visor with the eye slit toward the front, a tail at the back and a CREST OF SALT; the warm eye (0..1 how awake) */
function head(u, v, eye, t, bow) {
  fr(u - 6, v - 3, 13, 5, C.p1); fr(u - 5, v - 3, 11, 1, C.p0);   /* the gorget */
  for (let i = 0; i < 12; i++) { const hw = i < 2 ? 6 : i < 9 ? 8 : i === 9 ? 7 : i === 10 ? 6 : 4, vv = v + 1 + i;   /* the dome, bottom to top */
    fr(u - hw + 1, vv, hw * 2 - 1, 1, i > 7 ? C.p3 : i > 3 ? C.p2 : C.p1); }
  fr(u - 8, v + 1, 3, 6, C.p1); fr(u - 11, v + 2, 4, 4, C.p0); fr(u - 10, v + 3, 3, 2, C.p1);   /* the sallet's tail, flared at the neck */
  fr(u - 4, v + 11, 4, 1, C.p4); fr(u - 2, v + 12, 3, 1, C.p4); fr(u - 5, v + 9, 2, 1, C.p3);   /* the light on the crown */
  fr(u + 3, v + 1, 5, 8, C.p1); fr(u + 7, v + 2, 1, 6, C.p0); fr(u - 8, v + 7, 17, 1, C.p0);   /* the visor, its edge, the brim */
  fr(u + 1, v + 4, 8, 2, C.slit); fr(u + 2, v + 6, 6, 1, C.p0);   /* the eye slit */
  for (let i = 0; i < 3; i++) pix(u + 5 + i, v + 1 + (i % 2), C.p0);   /* the breath holes */
  const fl = 0.55 + 0.45 * Math.sin(t * 5.3), a = clamp(eye * (0.7 + 0.3 * fl));
  if (a > 0.05) { fr(u + 4, v + 4, 3, 2, C.eye); if (a > 0.5) { g_.globalAlpha = (a - 0.4) * 0.5; fr(u + 2, v + 3, 7, 4, C.eyeG); g_.globalAlpha = 1; } else { g_.globalAlpha = 0.5; fr(u + 4, v + 4, 3, 2, C.slit); g_.globalAlpha = 1; } }
  /* THE CREST OF SALT: a ridge along the dome, crusted into points, and a run of salt down the cheek */
  fr(u - 5, v + 12, 9, 2, C.salt2); fr(u - 4, v + 14, 7, 1, C.salt); fr(u - 2, v + 15, 3, 1, C.salt2); pix(u - 1, v + 16, C.salt); pix(u + 3, v + 14, C.salt2); pix(u - 6, v + 13, C.salt3); pix(u - 7, v + 12, C.salt2);
  fr(u - 3, v + 11, 1, 1, C.salt3); fr(u + 2, v + 11, 2, 1, C.salt); fr(u + 6, v + 7, 1, 2, C.salt2); fr(u + 6, v, 1, 3, C.salt3); pix(u + 4, v - 1, C.salt2);
}
/* the barrel breastplate: rows from the waist (i = 0) to the collar; `sx(v)` the lean's shear */
function torso(hipv, sx, lean) {
  for (let i = 0; i < 25; i++) {
    const v = hipv + 2 + i, uc = sx(v), hw = i < 2 ? 10 : i < 9 ? 11 + (i > 5 ? 2 : 1) : i < 19 ? 14 : i < 23 ? 13 : 11, left = uc - hw, w = hw * 2 + 1;
    fr(left, v, w, 1, i % 8 === 0 ? C.p0 : C.p1);                                   /* the plate, a lame line every few rows */
    fr(left, v, 3, 1, C.p0); fr(left + 3, v, 1, 1, C.p1);                           /* the rear edge in shade */
    if (i > 2) { fr(uc + 3, v, 5, 1, i > 14 ? C.p3 : C.p2); fr(uc + 4, v, 2, 1, i > 12 ? C.p4 : C.p3); }   /* the light down the breast */
    fr(uc - 1, v, 1, 1, C.p0);                                                      /* the medial ridge */
    fr(left + w - 2, v, 2, 1, i > 3 ? C.p2 : C.p1);
  }
  for (let i = 0; i < 9; i++) { const n1 = noise(i, 3), n2 = noise(i, 11); fr(sx(hipv + 6) - 11 + R(n1 * 22), hipv + 6 + R(n2 * 19), 2 + (i % 3 === 0 ? 1 : 0), 1, i % 2 ? C.salt : C.salt2); }   /* salt in the seams */
  fr(sx(hipv + 14) - 8, hipv + 14, 1, 5, C.salt3); fr(sx(hipv + 14) - 8, hipv + 12, 1, 2, C.salt2);   /* a run of salt down the plate */
  disc(sx(hipv + 18) + 6, hipv + 17, 2, C.c1); pix(sx(hipv + 18) + 6, hipv + 17, C.c0);   /* a weed stain over the heart */
  fr(sx(hipv + 3) - 11, hipv + 2, 23, 3, C.iron2); fr(sx(hipv + 3) - 11, hipv + 2, 23, 1, C.iron); fr(sx(hipv + 3) - 1, hipv + 2, 5, 3, C.brass); fr(sx(hipv + 3) + 1, hipv + 3, 2, 1, C.brass2);   /* the belt and its buckle */
}
/* the surcoat: sea-green, in rags, a hem of teeth; sway (px) and flare (lifts it in a leap) */
function skirt(hipv, uc, sway, flare, t) {
  for (let j = -8; j <= 8; j++) {
    const n = noise(j + 20, 5), len = 12 + R(n * 6) - (Math.abs(j) % 3 === 0 ? 4 : 0) - R(flare * 8) - (Math.abs(j) > 6 ? 3 : 0), x = uc + j + R(sway * (len / 16)), top = hipv + 2;
    fr(x, top - len, 1, len, Math.abs(j) > 6 ? C.c0 : j < -3 ? C.c1 : C.c2); if (j % 4 === 0) fr(x, top - len, 1, len, C.c0);
    if (len > 8 && Math.abs(j) < 5) pix(x, top - 1 - R(n * 4), C.c3);
  }
  fr(uc - 9 + R(sway * 0.3), hipv + 1, 18, 1, C.c0);
  fr(uc + 1, hipv - 4, 3, 1, C.salt3); fr(uc - 5, hipv - 8 - R(flare * 5), 2, 1, C.salt3);   /* salt dried on the green */
}
function cape(su, sv, back, t, flare) {   /* the rags of a cloak off the rear shoulder, streaming back */
  for (let k = 0; k < 7; k++) { const n = noise(k, 9), len = 22 - k * 2 + R(n * 4), wave = Math.sin(t * 3 + k) * 1.2 + back;
    fr(su + 1 - k * 2 + R(wave), sv - len + R(flare * 14), 2, len, k % 3 === 2 ? C.c0 : C.c1); }
}

/* the greatsword: G the grip (the rear hand), a the angle (degrees, 0 = forward, 90 = up), the blade from the guard; salt at the root, nicks along the edge */
function sword(gu, gv, a, len, glint) {
  const r = a * D2R, dx = Math.cos(r), dy = Math.sin(r), nx = -dy, ny = dx;
  const P = s => [gu + dx * s, gv + dy * s];
  let [pu, pv] = P(-5); disc(pu, pv, 2, C.brass); pix(pu, pv + 1, C.brass2 === C.brass ? C.salt : C.salt);   /* the pommel */
  pl(...P(-4), ...P(8), 3, C.grip); for (let s = -2; s < 8; s += 3) pl(...P(s), ...P(s), 3, C.p0);   /* the long grip, bound */
  const [g0u, g0v] = P(9); pl(g0u - nx * 8, g0v - ny * 8, g0u + nx * 8, g0v + ny * 8, 3, C.iron2); pl(g0u - nx * 8, g0v - ny * 8, g0u + nx * 8, g0v + ny * 8, 1, C.iron3);   /* the cross-guard */
  disc(g0u - nx * 8 + dx * -1, g0v - ny * 8 - 1, 1, C.rust2); disc(g0u + nx * 8, g0v + ny * 8 - 1, 1, C.rust2); disc(g0u, g0v, 2, C.brass);   /* quillon ends, the boss */
  const B0 = 11, B1 = B0 + len;
  for (let s = B0; s <= B1; s += 1) { const k = (s - B0) / len, w = k < 0.78 ? 5 : k < 0.92 ? 4 : 3; const [bu, bv] = P(s); fr(bu - w / 2, bv - w / 2, w, w, C.bladeD); }
  for (let s = B0; s <= B1 - 3; s += 1) { const k = (s - B0) / len, w = k < 0.78 ? 3 : 2; const [bu, bv] = P(s); fr(bu - w / 2, bv - w / 2, w, w, C.blade); }
  for (let s = B0 + 2; s < B0 + len * 0.7; s += 1) { const [bu, bv] = P(s); pix(bu, bv, C.bladeS); }   /* the fuller */
  for (const s of [B0 + 4, B0 + 10, B0 + 17, B0 + 30, B0 + 39]) { const [bu, bv] = P(s); pix(bu + nx * 2, bv + ny * 2, C.p0); }   /* nicks */
  for (const s of [B0, B0 + 3, B0 + 6]) { const [bu, bv] = P(s); fr(bu + nx * 2 - 1, bv + ny * 2, 2, 1, C.salt); }   /* salt crusted on the root of the edge */
  const [tu, tv] = P(B1); if (glint) { g_.globalAlpha = glint; fr(tu - 1, tv - 1, 3, 3, '#ffffff'); fr(tu - 3, tv, 7, 1, '#ffffff'); fr(tu, tv - 3, 1, 7, '#ffffff'); g_.globalAlpha = 1; }
  return { tip: [tu, tv], guard: [g0u, g0v], dir: [dx, dy] };
}
/* a crescent smear round (cu, cv) from angle a0 to a1 (leading end a1), r0..r1, the trail fading */
function smear(cu, cv, a0, a1, r0, r1, col = '#e9f5ff', alpha = 0.7) {
  const n = Math.max(6, Math.round(Math.abs(a1 - a0) / 1.4));
  for (let i = 0; i <= n; i++) { const k = i / n, a = lerp(a0, a1, k) * D2R; g_.globalAlpha = alpha * 0.55 * (0.1 + 0.9 * k * k * k);
    const ra = r1 - 5 - 9 * k, rb = r1; pl(cu + Math.cos(a) * ra, cv + Math.sin(a) * ra, cu + Math.cos(a) * rb, cv + Math.sin(a) * rb, 2, col); }
  g_.globalAlpha = 1;
}
const spray = (u, v, n, spread, up, t, cols) => { for (let i = 0; i < n; i++) { const k = (t * 3 + noise(i, 2)) % 1, a = (noise(i, 4) - 0.5) * spread; pix(u + a * k * 30, v + k * up * (1 - k * 0.6) * (0.5 + noise(i, 6)), cols[i % cols.length]); } };

/* ================= THE ANCHOR AND ITS CHAIN (the hands call these too) ================= */
/* the anchor on the SCREEN: its crown (the flukes) at (ax, ay), its shank pointing from the ring toward the crown along angle a (radians, screen: PI/2 = down). s the scale. Iron, rusted, barnacled. */
export function drawAnchor(g, ax, ay, a = Math.PI / 2, s = 1) {
  const L = 27 * s, ux = Math.cos(a), uy = Math.sin(a), rx = ax - ux * L, ry = ay - uy * L, px = -uy, py = ux;   /* the ring end, the perpendicular */
  const line = (x0, y0, x1, y1, w, col) => { const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); g.fillStyle = col; for (let i = 0; i <= n; i++) g.fillRect(R(lerp(x0, x1, i / n) - w / 2), R(lerp(y0, y1, i / n) - w / 2), w, w); };
  line(rx, ry, ax, ay, 4, NORM.iron); line(rx + px * 0.5, ry + py * 0.5, ax + px * 0.5, ay + py * 0.5, 2, NORM.iron2); line(rx - px, ry - py, ax - px, ay - py, 1, NORM.iron3);   /* the shank, a lit edge */
  const sx = rx + ux * 5, sy = ry + uy * 5; line(sx - px * 9, sy - py * 9, sx + px * 9, sy + py * 9, 3, NORM.iron); line(sx - px * 9, sy - py * 9, sx + px * 9, sy + py * 9, 1, NORM.iron2);   /* the stock, across the shank near the ring */
  g.fillStyle = NORM.rust2; g.fillRect(R(sx - px * 9) - 1, R(sy - py * 9) - 1, 2, 2); g.fillRect(R(sx + px * 9) - 1, R(sy + py * 9) - 1, 2, 2);
  g.fillStyle = NORM.iron; g.fillRect(R(rx) - 3, R(ry) - 3, 6, 6); g.fillStyle = '#0a0a0c';   /* the ring: a square-cut hoop */
  g.fillRect(R(rx) - 1, R(ry) - 1, 2, 2); g.fillStyle = NORM.iron3; g.fillRect(R(rx) - 3, R(ry) - 3, 6, 1); g.fillRect(R(rx) - 3, R(ry) - 3, 1, 6);
  for (const sd of [-1, 1]) { let pu = ax, pv = ay;   /* the two curved arms, each ending in a palm */
    for (let i = 1; i <= 8; i++) { const k = i / 8, qx = ax + px * sd * k * 15 - ux * Math.sin(k * 1.35) * 9 * s, qy = ay + py * sd * k * 15 - uy * Math.sin(k * 1.35) * 9 * s; line(pu, pv, qx, qy, i < 7 ? 4 : 3, NORM.iron); pu = qx; pv = qy; }
    line(ax + px * sd * 2, ay + py * sd * 2, pu - px * sd, pv - py * sd, 1, NORM.iron2);
    const tx = pu - ux * 5 + px * sd * 2, ty = pv - uy * 5 + py * sd * 2; line(pu, pv, tx, ty, 5, NORM.iron); line(pu, pv, tx, ty, 2, NORM.iron2); g.fillStyle = NORM.iron3; g.fillRect(R(tx), R(ty), 1, 1);   /* the palm */ }
  g.fillStyle = NORM.rust; g.fillRect(R(ax) - 3, R(ay) - 2, 6, 4); g.fillStyle = NORM.rust2; g.fillRect(R(ax) - 1, R(ay) - 2, 3, 1);   /* the crown, rusted */
  g.fillStyle = NORM.salt; g.fillRect(R(lerp(rx, ax, 0.45)) + 1, R(lerp(ry, ay, 0.45)), 2, 2); g.fillRect(R(lerp(rx, ax, 0.7)) - 2, R(lerp(ry, ay, 0.7)) + 1, 2, 1); g.fillStyle = NORM.salt3; g.fillRect(R(lerp(rx, ax, 0.25)), R(lerp(ry, ay, 0.25)) - 1, 1, 1);   /* barnacles */
  g.fillStyle = NORM.c1; g.fillRect(R(lerp(rx, ax, 0.55)) - 2, R(lerp(ry, ay, 0.55)), 1, 3);   /* weed hung on it */
}
/* the chain: links turned this way and that, from (x0, y0) to (x1, y1); slack it sags, taut it is straight and bright */
export function drawChain(g, x0, y0, x1, y1, time, taut = false) {
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(len / 4)), sag = taut ? 0 : Math.min(9, len * 0.12);
  for (let i = 0; i <= n; i++) { const u = i / n, x = R(x0 + (x1 - x0) * u), y = R(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * sag + (taut ? Math.sin(time * 30 + i) * 0.4 : 0));
    if (i % 2) { g.fillStyle = NORM.iron; g.fillRect(x - 1, y - 2, 3, 4); g.fillStyle = taut ? NORM.iron3 : NORM.iron2; g.fillRect(x, y - 1, 1, 2); }
    else { g.fillStyle = NORM.iron; g.fillRect(x - 2, y - 1, 4, 3); g.fillStyle = taut ? NORM.iron3 : NORM.iron2; g.fillRect(x - 1, y, 2, 1); } }
}

/* ================= THE POSES ================= */
const BASE = { c: 0, lean: 1, hd: 0, hv: 0, fu: 5, bu: -6, fl: 0, bl: 0, RH: [8, 26], a: -20, len: 50, bury: false, eye: 0.45, flare: 0, sway: 0, kneel: false, glint: 0, rearHand: null, jit: 0, A: null, noBlade: false, arch: 0 };
/* the anchor lying in front of him on the deck, dragged on its chain (the P2 rest) */
const dragA = (u = 42, p = 0) => ({ AC: [u, 4], ang: -36, H: [10, 24] });
function pose(m, p, t, anchor) {
  const P = { ...BASE }, S = (o) => Object.assign(P, o);
  const walkc = Math.sin(t * 6), bob = anchor ? 0 : 0;
  switch (m) {
    case 'walk': S({ lean: 2, fu: 5 + walkc * 7, bu: -6 - walkc * 7, fl: Math.max(0, Math.cos(t * 6)) * 2, bl: Math.max(0, -Math.cos(t * 6)) * 2, c: 1 + Math.abs(walkc) * 1, RH: [7, 30], a: 28, eye: 0.5, sway: -walkc }); if (anchor) S({ A: dragA(46 + walkc * 2), RH: [9, 24], a: 0 }); break;
    case 'recover': S({ lean: 1, c: 2, RH: [8, 23], a: -18, eye: 0.4, sway: Math.sin(t * 2) * 0.6, hv: -1, fu: 7, bu: -8 }); if (anchor) S({ A: dragA(44), RH: [9, 22] }); break;
    case 'sleep': S({ lean: 2, hd: 3, hv: -3, c: 0, RH: [11, 38], a: -90, bury: true, eye: 0, fu: 4, bu: -5 }); break;
    case 'card': S({ lean: 0, hd: 1, hv: 0, c: 0, RH: [12, 36], a: -90, bury: true, eye: 0.85, fu: 5, bu: -6, flare: 0.1 }); break;
    case 'wake': { const k = ease(p); S({ lean: lerp(2, 0, k), hd: lerp(3, 0, k), hv: lerp(-3, 1, k), RH: [lerp(11, 9, k), lerp(38, 28, k)], a: lerp(-90, -35, k), bury: p < 0.45, eye: k, c: lerp(0, 2, Math.sin(k * 3)), len: 50 }); break; }
    /* ---- the combo ---- */
    case 'comboTell': { const k = ease(p); S({ c: 1, lean: -4 * k, arch: -3 * k, RH: [lerp(8, -1, k), lerp(28, 52, k)], a: lerp(20, 162, k), eye: 0.7 + 0.3 * k, hd: -1 * k, hv: 1 * k, fu: 3, bu: -9, flare: 0.1 * k, glint: 0 }); break; }
    case 'combo': { const k = ease(p); S({ c: 3, lean: lerp(1, 7, k), RH: [lerp(8, 17, k), lerp(46, 38, k)], a: lerp(130, -8, k), fu: 11, bu: -9, hd: 2, eye: 1, sway: 3, flare: 0.1 }); break; }
    case 'comboRec': { const k = ease(p); S({ c: 4 - k * 1, lean: lerp(7, 5, k), RH: [lerp(18, 16, k), lerp(26, 22, k)], a: lerp(-14, -26, k), hv: -3, hd: 3, fu: 10, bu: -9, eye: 0.5, sway: 1 }); break; }
    /* ---- the slam ---- */
    case 'slamTell': { const k = ease(p); S({ c: lerp(0, -1, k), lean: -5 * k, arch: -4 * k, RH: [lerp(4, 1, k), lerp(40, 56, k)], a: lerp(70, 118, k), fu: 4, bu: -6, fl: 2 * k, bl: 2 * k, hd: -1, hv: 1 * k, eye: 0.8 + 0.2 * k, glint: 0 }); break; }
    case 'slam': { const k = ease(p); S({ c: lerp(3, 9, k), lean: lerp(2, 9, k), RH: [lerp(8, 23, k), lerp(52, 15, k)], a: lerp(105, -72, k), fu: 11, bu: -10, hd: 4, hv: -4 * k, eye: 1, bury: k > 0.85, sway: 3, flare: -0.05 }); break; }
    case 'stuck': S({ c: 6, lean: -3 + Math.sin(t * 24) * 1.2, arch: -2, RH: [21, 32], a: -84, bury: true, fu: 9, bu: -12, hd: -1, hv: -1, eye: 0.7, jit: 1 }); break;
    case 'slamRec': { const k = ease(p); S({ c: lerp(5, 2, k), lean: lerp(2, 4, k), RH: [lerp(20, 17, k), lerp(30, 22, k)], a: lerp(-80, -42, k), bury: k < 0.8, fu: 8, bu: -8, hv: -2, eye: 0.45 }); break; }
    /* ---- the thrust ---- */
    case 'thrustTell': { const k = ease(p); S({ c: 9 * k, lean: -6 * k, arch: -2 * k, RH: [lerp(8, -9, k), lerp(26, 22, k)], a: lerp(18, 4, k), fu: lerp(5, 13, k), bu: lerp(-6, -14, k), eye: 0.7 + 0.3 * k, hd: -1, glint: 0.35 + 0.35 * Math.sin(t * 20) * k, hv: -1 * k }); break; }
    case 'thrust': { const k = ease(p); S({ c: 7, lean: lerp(4, 13, k), RH: [lerp(4, 25, k), lerp(26, 31, k)], a: lerp(6, 0, k), fu: 17, bu: -16, bl: 0, hd: 5, hv: -1, eye: 1, glint: 0.9, sway: 4 }); break; }
    case 'thrustRec': { const k = ease(p); S({ c: lerp(7, 4, k), lean: lerp(12, 7, k), RH: [lerp(24, 18, k), lerp(30, 24, k)], a: lerp(-2, -24, k), fu: 15, bu: -15, hd: 3, hv: -3, eye: 0.5, sway: 1 }); break; }
    /* ---- the leap ---- */
    case 'leapTell': { const k = ease(p); S({ c: 13 * k, lean: -3 * k, RH: [lerp(8, 4, k), lerp(26, 20, k)], a: lerp(-10, -35, k), fu: lerp(5, 9, k), bu: lerp(-6, -12, k), eye: 0.8 + 0.2 * k, hv: -2 * k, flare: 0.15 * k, sway: -k }); break; }
    case 'leap': S({ c: 4, lean: 3, RH: [5, 60], a: 22, fu: 9, bu: -3, fl: 9, bl: 5, eye: 1, flare: 0.9, hd: 2, hv: 1, sway: -3 }); break;
    case 'landRec': { const k = ease(p); S({ c: 16, lean: lerp(5, 2, k), RH: [14, 32], a: -82, bury: true, kneel: true, fu: 8, bu: -2, hv: -3, hd: 3, eye: 0.5 }); break; }
    /* ---- the anchor ---- */
    case 'tearTell': { const k = ease(p), sh = Math.sin(t * 22) * (1 - k * 0.3) * 1.3; S({ c: 4 + 3 * k, lean: -7 * k + sh * 0.6, arch: -2, RH: [14 + k * 2, 30 + 4 * k + sh], a: 0, rearHand: [8, 28 - 2 * sh], fu: 9, bu: -12, hv: -1, eye: 0.8, A: { AC: [30 + 12 * k, 4 + 20 * k], ang: lerp(8, -62, k), H: [14 + k * 2, 31 + sh], shake: 1 }, noBlade: true }); break; }
    case 'sweepTell': { const k = ease(p); S({ c: 3 + 5 * k, lean: -4 * k, arch: -3 * k, RH: [lerp(8, -10, k), 28], a: 0, fu: 8, bu: -12, hd: -2, hv: 0, eye: 0.8 + 0.2 * k, A: { AC: [lerp(-8, -38, k), lerp(14, 20, k)], ang: lerp(185, 200, k), H: [lerp(8, -10, k), 28], behind: true, blur: k > 0.5 }, noBlade: true }); break; }
    case 'sweep': S({ c: 5, lean: 6, arch: 0, RH: [22, 29], a: 0, rearHand: [-6, 36], fu: 12, bu: -14, hd: 4, hv: -1, eye: 1, sway: 4, noBlade: true, A: { none: true } }); break;
    case 'sweepRec': { const k = ease(p); S({ c: lerp(6, 3, k), lean: lerp(5, 3, k), RH: [12, 22], a: 0, fu: 9, bu: -9, hd: 2, hv: -3, eye: 0.5, sway: Math.sin(t * 9) * 0.8, A: { AC: [lerp(48, 40, k), 5], ang: -36, H: [12, 22] }, noBlade: true }); break; }
    case 'hookTell': { const k = ease(p), w = t * 12; S({ c: 1, lean: -2, RH: [4, 52], a: 0, rearHand: [-6, 30], fu: 4, bu: -7, eye: 0.8 + 0.2 * k, hv: 0, noBlade: true,
        A: { AC: [4 + Math.cos(w) * 26, 62 + Math.sin(w) * 9], ang: Math.atan2(0.35 * Math.cos(w), -Math.sin(w)) / D2R, H: [4, 52], orbit: w } }); break; }
    case 'hook': S({ c: 4, lean: 7, RH: [34, 44], a: 0, rearHand: [-4, 30], fu: 14, bu: -13, hd: 4, hv: -1, eye: 1, sway: 4, noBlade: true, A: { none: true } }); break;
    case 'hookRec': { const k = ease(p); S({ c: 5, lean: lerp(-5, -3, k), RH: [14, 28 + Math.sin(t * 16) * 1], a: 0, rearHand: [8, 26], fu: 7, bu: -14, hd: -1, hv: -1, eye: 0.6, noBlade: true, A: { AC: [lerp(60, 44, k), 5], ang: -36, H: [14, 28], taut: true } }); break; }
    case 'tiltTell': { const k = ease(p); S({ c: 0, lean: -5 * k, arch: -4 * k, RH: [lerp(2, 1, k), lerp(46, 60, k)], a: 0, rearHand: [-4, 58 * k + 28], fu: 4, bu: -6, fl: 2 * k, bl: 2 * k, hd: -1, hv: 1 * k, eye: 0.9, noBlade: true,
        A: { AC: [lerp(-4, -16, k), lerp(70, 90, k)], ang: lerp(95, 128, k), H: [lerp(2, 1, k), lerp(46, 60, k)], over: true } }); break; }
    case 'tilt': { const k = ease(p); S({ c: lerp(3, 10, k), lean: lerp(3, 10, k), RH: [lerp(8, 25, k), lerp(54, 26, k)], a: 0, fu: 12, bu: -10, hd: 4, hv: -4 * k, eye: 1, noBlade: true, sway: 3, A: { AC: [lerp(10, 36, k), lerp(70, 2, k)], ang: lerp(60, -86, k), H: [lerp(8, 25, k), lerp(54, 26, k)], bury: k > 0.9 } }); break; }
    case 'stuckA': S({ c: 7, lean: -3 + Math.sin(t * 24) * 1.2, arch: -2, RH: [27, 33], a: 0, rearHand: [22, 31], fu: 10, bu: -13, hd: -1, hv: -1, eye: 0.7, jit: 1, noBlade: true, A: { AC: [34, -3], ang: -88, H: [27, 33], bury: true } }); break;
    case 'tiltRec': { const k = ease(p); S({ c: lerp(6, 2, k), lean: lerp(2, 4, k), RH: [lerp(24, 15, k), lerp(30, 22, k)], a: 0, fu: 8, bu: -8, hv: -2, eye: 0.45, noBlade: true, A: { AC: [lerp(34, 44, k), lerp(8, 5, k)], ang: lerp(-64, 3, k), H: [lerp(24, 15, k), lerp(30, 22, k)] } }); break; }
    default: S({ c: 1, RH: [8, 24], a: -20 }); if (anchor) S({ A: dragA(44), noBlade: true });
  }
  if (anchor && !P.A && !P.noBlade) { P.A = dragA(44); P.noBlade = true; }   /* a phase-two pose with no anchor of its own: he carries it */
  return P;
}

/* ================= THE FIGURE ================= */
function figure(P, t, m, p, anchor) {
  const hipv = 26 - P.c, kn = P.kneel;
  const sx = v => P.lean * clamp((v - hipv) / 24, 0, 1.4) + (P.arch ? P.arch * clamp((v - hipv - 14) / 12, 0, 1) : 0) + (P.jit ? Math.sin(t * 40) * P.jit * 0.6 : 0);
  const top = hipv + 26, shv = top - 4, shu = sx(shv);
  const [GU, GV] = P.RH;
  /* the anchor first when it hangs BEHIND him */
  if (P.A && P.A.behind) anchorLive(P.A, t, anchor);
  /* the rear leg and the rags behind */
  if (kn) { const ku = -3, kv = 3; pl(-2, hipv, ku, kv + 1, 8, C.p1); pl(ku, kv + 1, -16, 4, 6, C.p1); pl(ku, kv + 3, -16, 6, 1, C.p2); disc(ku, kv + 2, 3, C.p2); fr(-19, 1, 7, 3, C.p0); pix(-9, 6, C.salt); fr(-12, 2, 2, 1, C.salt3); }
  else leg(-3 + P.bu * 0.2, hipv, P.bu, P.bl, 1, true);
  cape(shu - 10, shv, -P.lean * 0.3 - (P.flare > 0.4 ? 3 : 0), t, P.flare);
  /* the rear arm (a hand on the grip, or its own) */
  const rh = P.rearHand || (P.noBlade ? [GU - 2, GV - 2] : [GU - 1, GV - 1]);
  arm(shu - 9, shv - 1, rh[0], rh[1], -1, false);
  torso(hipv, sx, P.lean);
  skirt(hipv, sx(hipv + 2) + 1, P.sway, P.flare, t);
  if (kn) { pl(2, hipv, 8, 8, 8, C.p1); pl(8, 8, 8, 0, 7, C.p1); pl(7, 6, 9, 1, 2, C.p2); disc(9, 8, 3, C.p2); fr(5, 0, 10, 3, C.p0); fr(11, 6, 2, 2, C.salt); }
  else leg(3 + P.fu * 0.2, hipv, P.fu, P.fl, 1, true);
  /* the head */
  head(sx(top + 1) + 3 + P.hd, top - 1 + P.hv, P.eye, t, P.hv);
  /* the pauldrons: broad and round */
  pauldron(shu - 12, shv + 1, 7, false); pauldron(shu + 12, shv + 2, 8, true);
  /* the front arm and what it holds */
  const fh = P.noBlade && !P.rearHand ? [GU + 3, GV - 1] : [GU + (P.noBlade ? 0 : Math.cos(P.a * D2R) * 6), GV + (P.noBlade ? 0 : Math.sin(P.a * D2R) * 6)];
  arm(shu + 12, shv + 1, fh[0], fh[1], 1, true);
  let sw = null;
  if (!P.noBlade) {
    if (P.bury) { g_.save(); g_.beginPath(); g_.rect(0, 0, 2000, Y_ + 1); g_.clip(); }
    sw = sword(GU, GV, P.a, P.len, P.glint);
    if (P.bury) g_.restore();
  }
  gauntlet(rh[0], rh[1]); gauntlet(fh[0], fh[1]);
  if (P.A && !P.A.behind && !P.A.none) anchorLive(P.A, t, anchor);
  return sw;
}
/* the anchor and its chain in his local space; converts to the screen and draws with the screen routines */
function anchorLive(A, t, anchor) {
  const sc = (u, v) => [F_ > 0 ? X_ + u : X_ - u, Y_ - v], [hx, hy] = sc(A.H[0], A.H[1]);
  const ang = A.ang * D2R, ux = Math.cos(ang), uv = Math.sin(ang), L = 27 * 1.1;
  let au = A.AC[0], av = A.AC[1]; if (A.shake) { au += R(Math.sin(t * 30) * 1.2); av += R(Math.cos(t * 26) * 1); }
  const ru = au - ux * L, rv = av - uv * L;   /* the ring */
  const [axs, ays] = sc(au, av), [rxs, rys] = sc(ru, rv);
  const sa = Math.atan2(-uv, F_ > 0 ? ux : -ux);   /* the screen angle of the shank (y down) */
  g_.save();
  g_.beginPath(); g_.rect(0, 0, 2000, Y_ + (A.bury ? 1 : 2)); g_.clip();   /* the deck is solid: nothing of it hangs under the planks */
  if (A.blur) { g_.globalAlpha = 0.3; drawAnchor(g_, axs + 3 * -F_, ays - 2, sa, 1.1); g_.globalAlpha = 1; }
  drawChain(g_, hx, hy, rxs, rys, t, !!A.taut || !!A.over || !!A.shake);
  drawAnchor(g_, axs, ays, sa, 1.1);
  g_.restore();
  if (A.orbit != null) { g_.globalAlpha = 0.28; g_.strokeStyle = '#e9f5ff'; g_.lineWidth = 2; g_.beginPath(); const [cx0, cy0] = sc(A.H[0] + 4, A.H[1] + 12); g_.ellipse(cx0, cy0, 28, 11, 0, 0, Math.PI * 2); g_.stroke(); g_.lineWidth = 1; g_.globalAlpha = 1; }
}

/* the dust, splinters and streaks that belong to a pose */
function fxPose(m, p, t, P, sw) {
  const deck = [C.splint, C.splint2, C.deck, C.splint];
  if (m === 'slam') { smear(P.RH[0], P.RH[1], 125, -60, 28, 60); const k = ease(p); if (p > 0.6) { spray(38, 1, 14, 2, 22, t, deck); fr(30, 0, 16, 1, '#ffffff'); } }
  if (m === 'slamRec' || m === 'stuck') { spray(40, 1, 6, 1.4, 10, t * 0.6, deck); fr(36, 0, 10, 1, C.deck); fr(33, -1, 4, 1, C.deck); fr(45, -1, 3, 1, C.deck); }
  if (m === 'stuck') { if (Math.floor(t * 10) % 2) { pix(-6, 56, C.salt); pix(-4, 52, C.salt2); } fr(-1, 56, 2, 1, '#bfe6f5'); }   /* the strain: sweat and salt shaken loose */
  if (m === 'combo') { const k = ease(p); smear(P.RH[0] - 4, P.RH[1], 150, 0, 26, 64, '#e9f5ff', 0.75); }
  if (m === 'comboTell' && p > 0.6) { g_.globalAlpha = 0.25 + 0.2 * Math.sin(t * 24); fr(P.RH[0] - 12, P.RH[1] + 10, 18, 1, '#e9f5ff'); g_.globalAlpha = 1; }
  if (m === 'thrust') { g_.globalAlpha = 0.7; for (let i = 0; i < 6; i++) { const v = 24 + i * 3 + R(noise(i, 1) * 3); fr(-44 - R(noise(i, 5) * 22), v, 24 + R(noise(i, 8) * 30), 1, '#e9f5ff'); } g_.globalAlpha = 1;   /* the streak behind him */
    g_.globalAlpha = 0.5; fr(-8, 0, 6, 1, C.splint); fr(-18, 0, 8, 1, C.splint2); g_.globalAlpha = 1; pl(-6, 6, -24, 4, 2, '#cfe4f0'); }
  if (m === 'thrustTell') { g_.globalAlpha = 0.35 * p; fr(P.RH[0] + 8, P.RH[1] - 1, 70, 1, '#ffffff'); g_.globalAlpha = 1; }
  if (m === 'thrustRec') { spray(-4, 1, 5, 1.2, 8, t, [C.splint2, C.deck]); }
  if (m === 'leapTell') { spray(0, 1, 8, 1.6, 9, t * 0.8, [C.splint2, C.salt3]); }
  if (m === 'leap') { for (let i = 0; i < 4; i++) fr(-6 + i * 6, -10 - i * 2 - R(noise(i, 3) * 6), 1, 9 + i * 2, '#e9f5ff'); smear(P.RH[0], P.RH[1], 160, 40, 30, 60, '#e9f5ff', 0.45); }
  if (m === 'landRec') { for (const [a, b, c2, d] of [[-24, 0, -8, -3], [-8, 0, 4, -4], [4, 0, 22, -2], [22, 0, 36, -4], [10, 0, 14, -5], [-16, 0, -20, -5]]) pl(a, b, c2, d, 1, C.deck);   /* the cracks */
    fr(-22, 1, 60, 1, C.deck); spray(8, 1, 14, 3.2, 14, t * 0.5 + 0.1 * p, [C.splint, C.splint2, C.salt2]); if (p < 0.5) { g_.globalAlpha = 0.6 * (1 - p * 2); fr(-26, 0, 60, 2, '#ffffff'); g_.globalAlpha = 1; } }
  if (m === 'tilt') { if (p > 0.6) { spray(36, 1, 12, 2.4, 18, t, deck); fr(26, 0, 18, 1, '#ffffff'); } }
  if (m === 'tiltRec' || m === 'stuckA') { fr(28, 0, 14, 1, C.deck); fr(26, -1, 4, 1, C.deck); fr(42, -1, 3, 1, C.deck); spray(34, 1, 5, 1.2, 8, t * 0.6, deck); }
  if (m === 'stuckA') { if (Math.floor(t * 10) % 2) { pix(12, 58, C.salt); pix(15, 54, C.salt2); } }
  if (m === 'tearTell') { for (let i = 0; i < 5; i++) { const k = (t * 2.4 + noise(i, 3)) % 1; pl(34 + i * 3, 6 + k * 24, 36 + i * 3 + R(k * 4), 8 + k * 24, 1, i % 2 ? C.splint : C.splint2); }   /* the lashings that held it, snapping */
    fr(28, 0, 4, 2, C.splint2); fr(40, 0, 3, 3, C.splint); }
  if (m === 'sweep') { g_.globalAlpha = 0.65; pl(24, 28, 2, 48, 2, '#e9f5ff'); g_.globalAlpha = 1; }
  if (m === 'hook') { g_.globalAlpha = 0.6; pl(30, 44, 48, 44, 2, '#e9f5ff'); pl(30, 40, 52, 40, 1, '#e9f5ff'); g_.globalAlpha = 1; }
  if (m === 'hookTell' && p > 0.4) { g_.globalAlpha = 0.3 + 0.2 * Math.sin(t * 20); fr(-26, 44, 52, 1, '#e9f5ff'); g_.globalAlpha = 1; }
}

/* ================= HIM ================= */
let lastFlat = -99, lastFlatAnchor = false;
export function drawChampion(g, x, y, f, o, time) {
  const m0 = o.mode || 'walk', m = m0, p = clamp(o.p || 0), anchor = !!o.anchor;
  if (m === 'flat') { lastFlat = time; lastFlatAnchor = anchor; return drawFlat(g, x, y, f, o, time); }
  g_ = g; X_ = x; Y_ = y; F_ = f >= 0 ? 1 : -1;
  C = o.flash ? FLASH : o.ward > 0 ? WARD : NORM;
  const up = time - lastFlat;   /* the first beat after a knockdown: he gets up, one hand on the deck, into the grey ward */
  let P;
  if ((m === 'recover' || m === 'walk') && up >= 0 && up < 0.7) { const k = ease(up / 0.7); P = pose('recover', 0, time, anchor); P.c = lerp(17, P.c, k); P.kneel = k < 0.55; P.lean = lerp(7, P.lean, k); P.hd = lerp(4, 0, k); P.hv = lerp(-5, P.hv, k); P.eye = lerp(0.2, 0.6, k);
    P.RH = [lerp(16, P.RH[0], k), lerp(18, P.RH[1], k)]; P.a = lerp(-70, P.a, k); P.bury = k < 0.6; if (anchor) P.A = { AC: [lerp(30, 44, k), 5], ang: -36, H: P.RH }; }
  else P = pose(m, p, time, anchor);
  const bob = (m === 'walk' && !anchor) ? 0 : 0;
  const sw = figure(P, time, m, p, anchor);
  fxPose(m, p, time, P, sw);
  if (o.ward > 0 && !o.flash) { g.globalAlpha = 0.2 + 0.14 * Math.sin(time * 7); for (let i = 0; i < 6; i++) fr(-14 + ((i * 11 + R(time * 14)) % 28), 6 + ((i * 17) % 50), 1, 3, '#dff0ff'); g.globalAlpha = 1; }   /* the ward's glimmer on the plate */
}
function drawFlat(g, x, y, f, o, time) {
  g_ = g; X_ = x; Y_ = y; F_ = f >= 0 ? 1 : -1; C = o.flash ? FLASH : NORM;
  /* KNOCKED FLAT: on his back along the deck, feet toward the gun, the helm rolled, the blade (or the anchor) loose across the planks, stars over him. His chest still lifts: he is living. */
  const br = Math.sin(time * 5) > 0 ? 1 : 0;
  /* legs: along the deck, knees a little up */
  pl(26, 5, 12, 8, 7, C.p1); pl(12, 8, 4, 8, 7, C.p1); pl(24, 4, 30, 2, 5, C.p2); fr(28, 0, 9, 3, C.p0); fr(30, 3, 5, 1, C.p1); pix(31, 5, C.salt); fr(16, 6, 2, 2, C.salt); pix(21, 9, C.salt2);
  disc(12, 10, 4, C.p2); disc(12, 10, 2, C.p3);
  /* the skirt, spilled */
  for (let j = 0; j < 14; j++) fr(2 + j, 7 + R(noise(j, 4) * 3), 1, 6 - (j % 3), j % 4 === 0 ? C.c0 : j % 2 ? C.c1 : C.c2);
  /* the breastplate, from the side: the barrel, the pauldron, the arm thrown out */
  fr(-18, 2, 24, 14 + br, C.p1); fr(-18, 2, 24, 3, C.p0); fr(-16, 10 + br, 20, 5, C.p2); fr(-12, 14 + br, 14, 2, C.p3); fr(-2, 6, 3, 8, C.p0); for (let i = 0; i < 6; i++) pix(-16 + i * 3, 4 + (i * 5) % 9, C.salt);
  disc(-14, 16, 6, C.p0); disc(-14, 17, 5, C.p2); disc(-13, 18, 3, C.p3); fr(-18, 20, 4, 1, C.p4); fr(-11, 17, 2, 2, C.salt);
  pl(-10, 12, -2, 3, 5, C.p1); pl(-2, 3, 8, 2, 5, C.p2); gauntlet(9, 3);
  /* the helm, rolled back and askew, the crest crushed on the planks; the eye still faintly lit */
  fr(-38, 1, 17, 12, C.p0); fr(-37, 3, 15, 9, C.p2); fr(-36, 10, 11, 2, C.p3); fr(-34, 11, 5, 1, C.p4); fr(-26, 3, 5, 8, C.p1); fr(-25, 6, 4, 2, C.slit); fr(-24, 6, 2, 1, Math.floor(time * 3) % 3 ? C.eye : C.eyeG);
  fr(-40, 8, 4, 3, C.salt2); fr(-42, 7, 3, 2, C.salt); pix(-39, 11, C.salt); pix(-36, 5, C.salt3);
  /* the cloak under him */
  for (let k = 0; k < 6; k++) fr(-30 + k * 2, 0, 2, 1 + (k % 2), k % 2 ? C.c0 : C.c1);
  /* what he dropped */
  if (!o.anchor) { g_.save(); const sw = sword(20, 3, 6, 50, 0); g_.restore(); /* the blade loose, flat across the deck beyond his feet */ }
  else { drawAnchor(g, F_ > 0 ? x + 54 : x - 54, y - 6, Math.PI / 2 - 1.2 * F_, 1.1); drawChain(g, F_ > 0 ? x + 10 : x - 10, y - 4, F_ > 0 ? x + 46 : x - 46, y - 10, time, false); }
  /* the stars */
  for (let i = 0; i < 3; i++) { const a = time * 4 + i * 2.1; pix(-32 + Math.cos(a) * 9, 22 + Math.sin(a) * 3, i % 2 ? '#ffd36b' : '#fff2b0'); fr(-32 + Math.cos(a) * 9 - 1, 22 + Math.sin(a) * 3 + 0, 3, 1, i % 2 ? '#ffd36b' : '#fff2b0'); }
}
/* THE DEATH: he goes to his knees, topples forward onto his face, and lies on the lashings; the blade (or the anchor) slides from his hands */
let _dead = null;
export function drawDeadChampion(g, x, y, f, k, time, anchor) {
  const kk = clamp(k), F = f >= 0 ? 1 : -1;
  if (kk < 0.28) { const q = kk / 0.28; g_ = g; X_ = x; Y_ = y; F_ = F; C = NORM; const P = pose('landRec', 0, time, false); P.eye = lerp(0.5, 0, q); P.c = lerp(8, 16, q); P.a = lerp(-82, -20, q); P.RH = [lerp(14, 9, q), lerp(32, 20, q)]; P.bury = q < 0.4; P.lean = lerp(3, 6, q); P.hv = -4 * q; figure(P, time, 'landRec', 0, !!anchor); return; }
  if (!_dead) { _dead = document.createElement('canvas'); _dead.width = 140; _dead.height = 140; }
  const q = clamp((kk - 0.28) / 0.34), a = ease(q) * 90, c2 = _dead.getContext('2d'); c2.clearRect(0, 0, 140, 140); c2.imageSmoothingEnabled = false;
  g_ = c2; X_ = 70; Y_ = 120; F_ = 1; C = NORM; const P = pose('recover', 0, 0, false); P.eye = 0; P.noBlade = true; P.A = null; P.c = lerp(10, 4, q); P.lean = lerp(6, 14, q); P.hv = -5; P.hd = 3; P.RH = [lerp(9, 20, q), lerp(20, 12, q)]; P.rearHand = [lerp(0, 14, q), lerp(20, 8, q)];
  figure(P, time, 'recover', 0, false);
  g.save(); g.imageSmoothingEnabled = false; g.translate(x, y); g.scale(F, 1);
  const ang = a * D2R; g.translate(0, -(1 - Math.cos(ang)) * 0 - Math.sin(ang) * 14); g.rotate(ang); g.drawImage(_dead, -70, -120); g.restore();
  g_ = g; X_ = x; Y_ = y; F_ = F; C = NORM;
  const sl = clamp((kk - 0.4) / 0.4);   /* what slid from his hands */
  if (!anchor) { sword(lerp(36, 56, ease(sl)), 3, lerp(-8, 4, ease(sl)), 50, 0); } else { drawAnchor(g, x + F * lerp(40, 66, ease(sl)), y - 6, Math.PI / 2 - 1.3 * F, 1.1); }
  /* the salt going pale on him, the light going out of the eye (there is none now) and a last bubble of breath */
  if (kk > 0.6) { const w = clamp((kk - 0.6) * 2.5); g.globalAlpha = 0.5 * (1 - w); for (let i = 0; i < 5; i++) fr(10 + i * 7, 14 + ((i * 7) % 6), 3, 1, '#eef3ec'); g.globalAlpha = 1; }
}

/* ================= THE BESTIARY CARD ================= */
export function drawChampionCard(g, x, y, f, time) { drawChampion(g, x, y, f, { mode: 'card', p: 0 }, time); }

/* ================= THE FX ================= */
/* THE LASHINGS: the Powder Ship's stern lashed to the Flagship's waist. Three hawsers from bollards to cleats; slack they sag and hang in the gap, drawn apart they stretch bar-tight and
   thin (the fibres standing out pale, the strands creaking), the fenders squashed, the cleats pulled to their roots. x0..x1 the gap on the screen, y the deck. */
export function drawLashing(g, x0, x1, y, time, apart) {
  const w = x1 - x0, n = Math.max(6, Math.round(w / 2));
  /* the bollards and cleats at either deck's lip */
  const post = (x, d) => { g.fillStyle = '#2b2118'; g.fillRect(x - 2 * d - (d > 0 ? 0 : 4) + (d > 0 ? 0 : 0), y - 8, 4, 8); g.fillStyle = '#5a4630'; g.fillRect(x - 2 * d - (d > 0 ? 0 : 4), y - 8, 4, 2); g.fillStyle = '#8a7454'; g.fillRect(x - 2 * d - (d > 0 ? 0 : 4), y - 8, 4, 1); };
  post(x0 + 2, 1); post(x1 - 2, -1);
  const lines = [[-3, 0], [-7, 1], [-11, 2]];
  for (const [dy, i] of lines) {
    const sag = apart ? 1 + (i === 1 ? 0 : 0.5) : 7 - i * 1.5, vib = apart ? Math.sin(time * 40 + i * 2) * 0.6 : 0;
    for (let k = 0; k <= n; k++) { const u = k / n, x = R(x0 + w * u), yy = R(y + dy + Math.sin(u * Math.PI) * sag + vib * Math.sin(u * Math.PI));
      g.fillStyle = apart ? (k % 3 === 0 ? '#f4e6bc' : '#e8c070') : (k % 3 === 0 ? '#b59a62' : '#8a7040'); g.fillRect(x, yy, 2, apart ? 1 : 2);
      if (!apart) { g.fillStyle = '#4a3a20'; if (k % 3 === 1) g.fillRect(x, yy + 1, 1, 1); } else if (k % 5 === 0) { g.fillStyle = '#ffffff'; g.fillRect(x, yy - 1, 1, 1); } }   /* taut: bright, fibres standing out; slack: thick, twisted, shadowed */
  }
  /* the lashing bound round the rails at each end (the turns) */
  for (const xe of [x0, x1 - 4]) for (let j = 0; j < 3; j++) { g.fillStyle = j % 2 ? '#8a7040' : '#b59a62'; g.fillRect(xe + j * 1, y - 12, 1, 9); }
  /* the fenders: rope-wrapped bundles hung between the hulls at the waterline; squeezed small when the hulls are together, strained out when apart */
  const fy = y + 14; for (const fx of [x0 + R(w * 0.33), x0 + R(w * 0.66)]) { const sq = apart ? 3 : 5; g.fillStyle = '#6a5636'; g.fillRect(fx - sq, fy, sq * 2, 8); g.fillStyle = '#8a7040'; g.fillRect(fx - sq, fy, sq * 2, 1); g.fillStyle = '#3a2c18'; for (let j = 0; j < 4; j++) g.fillRect(fx - sq, fy + 1 + j * 2, sq * 2, 1);
    g.fillStyle = '#8a7040'; g.fillRect(fx, y - 4 + 2, 1, fy - y + 2); }
  /* the harbour wrung white where the hulls grind and part */
  g.globalAlpha = apart ? 0.8 : 0.45; g.fillStyle = '#dff2f8'; for (let i = 0; i < 6; i++) { const fx = x0 + 3 + ((i * 17 + R(time * (apart ? 40 : 14))) % Math.max(4, w - 6)); g.fillRect(fx, y + 26 + (i % 3) * 2 + R(Math.sin(time * 6 + i)), 2 + (i % 2), 1); } g.globalAlpha = 1;
  /* the stretched read: little pale chevrons over the gap pointing outward while the hulls part */
  if (apart && Math.floor(time * 6) % 2) { g.fillStyle = '#fff2b0'; g.fillRect(x0 - 5, y - 18, 3, 1); g.fillRect(x0 - 7, y - 17, 3, 1); g.fillRect(x1 + 2, y - 18, 3, 1); g.fillRect(x1 + 4, y - 17, 3, 1); }
}
/* THE DECK TILT: the planking heeling toward the lashing: slanted deck lines over the deck, the toe of a heave drawn at the low end, arrows running DOWNHILL (dir) with the weight in them; k how far into it */
export function drawTilt(g, x0, x1, y, dir, k, time) {
  const w = x1 - x0, n = Math.round(w / 20); g.globalAlpha = 0.55;
  for (let i = 0; i < n; i++) { const ax = x0 + 8 + i * 20, ph = (time * 3 + i * 0.33) % 1, sx = R(ax + (dir > 0 ? ph * 16 : -ph * 16)), col = i % 2 ? '#ffd36b' : '#ff9a5c';
    g.fillStyle = col; g.fillRect(sx, y - 5, 8, 1); for (let j = 0; j < 3; j++) { g.fillRect(sx + (dir > 0 ? 8 + j : -1 - j), y - 5 - 2 + j - (j > 1 ? 0 : 0), 1, 5 - j * 2 + (j === 2 ? 1 : 0)); } }
  g.globalAlpha = 0.45; g.fillStyle = '#1a1410'; for (let i = 0; i < n * 2; i++) { const px2 = x0 + 4 + i * 10, h = 1 + R(((px2 - (dir > 0 ? x0 : x1)) * (dir > 0 ? 1 : -1)) / w * 5 * (0.4 + k)); g.fillRect(px2, y - h, 6, 1); }   /* the deck lines climbing the slope */
  g.globalAlpha = 0.5; g.fillStyle = '#e8c070'; g.fillRect(dir > 0 ? x1 - 6 : x0, y - 10, 6, 1); g.globalAlpha = 1;
  const lowX = dir > 0 ? x1 : x0; g.fillStyle = '#8a7454'; for (let i = 0; i < 3; i++) g.fillRect(lowX - (dir > 0 ? 3 : -1) + (dir > 0 ? -i * 2 : i * 2), y - 2 - (i % 2), 2, 1);   /* things sliding downhill */
}
/* the slam's mark on the deck while it is told: a hatched strip with chevrons walking in from both ends, the blade's fall, hot at the end */
export function drawSlamMark(g, x, y, w, k, time) {
  const x0 = R(x - w / 2), n = Math.round(w), blink = Math.floor(time * 8) % 2;
  g.globalAlpha = 0.3 + 0.5 * k; for (let i = 0; i < n; i += 2) { g.fillStyle = (i / 2) % 2 ? '#ff6b6b' : '#2a1010'; g.fillRect(x0 + i, y - 3, 2, 3); }
  g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = blink ? '#ffd36b' : '#ff6b6b'; g.fillRect(x0, y - 7, 2, 7); g.fillRect(x0 + n - 2, y - 7, 2, 7); g.fillRect(x0, y - 7, 6, 1); g.fillRect(x0 + n - 6, y - 7, 6, 1);
  for (let i = 0; i < 3; i++) { const cu = (k * 1.4 + i / 3) % 1, cx = R(x0 + 6 + (n - 12) * 0.5 * cu), mx = x0 + n - 6 - (cx - x0 - 6); for (const xx of [cx, mx]) { g.fillStyle = '#fff2b0'; g.fillRect(xx - 1, y - 6, 1, 1); g.fillRect(xx, y - 5, 1, 1); g.fillRect(xx - 1, y - 4, 1, 1); } }
  g.globalAlpha = 1;
}
/* the leap's mark where he lands: a ring shrinking onto the spot, four down-chevrons, a cracked-plank cross */
export function drawLeapMark(g, x, y, r, k, time) {
  const blink = Math.floor(time * 8) % 2, col = blink ? '#ff6b6b' : '#ffd36b', rr = r * (1.25 - 0.25 * k);
  g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.ellipse(R(x) + 0.5, y - 2, R(rr), 4, 0, 0, Math.PI * 2); g.stroke();
  g.setLineDash([3, 3]); g.beginPath(); g.ellipse(R(x) + 0.5, y - 2, R(r), 4, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  g.fillStyle = col; for (const d of [-1, 1]) { const cx = R(x + d * r * 0.55); g.fillRect(cx - 2, y - 14, 5, 1); g.fillRect(cx - 1, y - 13, 3, 1); g.fillRect(cx, y - 12, 1, 1); }
  g.fillStyle = '#fff2b0'; g.fillRect(R(x) - 1, y - 3, 3, 1); g.fillRect(R(x), y - 4, 1, 3); g.globalAlpha = 1;
}
/* the sweep's pass: the ring the anchor will run at his knees. Told, a dotted ring with chain-link ticks that tighten; released, a solid wrung band with the pale smear of iron */
export function drawSweepArc(g, x, y, rad, released, k, time) {
  g.save(); g.globalAlpha = released ? 0.7 : 0.25 + 0.35 * k; g.strokeStyle = released ? '#ffe0d0' : '#ff9a7a'; g.lineWidth = released ? 2 : 1; if (!released) g.setLineDash([4, 3]); g.beginPath(); g.ellipse(R(x) + 0.5, y - 12, rad, 8, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
  if (!released) { g.fillStyle = '#ffd36b'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + time * 2, px2 = R(x + Math.cos(a) * rad), py = R(y - 12 + Math.sin(a) * 8); g.fillRect(px2 - 1, py - 1, 3, 3); } }
  else { g.globalAlpha = 0.3; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(R(x) + 0.5, y - 12, rad, 8, 0, 0, Math.PI * 2); g.ellipse(R(x) + 0.5, y - 12, rad - 6, 5, 0, 0, Math.PI * 2, true); g.fill(); }
  g.restore();
}
/* HAULED OUT: the splash where a hero went into the harbour (k 0..1 over ~0.8 s), and the boat-hook line that drags him out onto the deck at (hx, y) */
export function drawHaulSplash(g, x, y, hx, k) {
  const a = 1 - k; g.globalAlpha = 0.9 * a; g.fillStyle = '#dff2f8';
  for (let i = 0; i < 9; i++) { const d = (i - 4) / 4, h = R((1 - Math.abs(d) * 0.7) * 22 * Math.sin(Math.min(1, k * 1.4) * Math.PI)), px2 = R(x + d * 14 * (0.4 + k)); g.fillRect(px2, y + 14 - h, 2, h); g.fillRect(px2, y + 12 - h, 1, 2); }
  g.fillStyle = '#7a8a3a'; g.globalAlpha = 0.6 * a; for (let i = 0; i < 6; i++) g.fillRect(R(x + (noise(i, 2) - 0.5) * 34 * (0.3 + k)), y + 10 - R(noise(i, 5) * 20 * k), 2, 2);   /* the foul harbour in it */
  g.globalAlpha = 0.8 * a; g.strokeStyle = '#ffffff'; g.beginPath(); g.ellipse(R(x) + 0.5, y + 16, 8 + k * 26, 3 + k * 4, 0, 0, Math.PI * 2); g.stroke();
  /* the boat-hook and its line, over the lip of the deck he is hauled up to */
  g.globalAlpha = Math.min(1, 1.6 * a); g.strokeStyle = '#c9b27c'; g.beginPath(); g.moveTo(R(hx) + 0.5, y - 14); g.quadraticCurveTo(R((hx + x) / 2), y + 2 + k * 8, R(x) + 0.5, y + 14 - k * 10); g.stroke();
  g.fillStyle = '#3a3a44'; g.fillRect(R(hx) - 1, y - 16, 3, 4); g.globalAlpha = 1;
}
