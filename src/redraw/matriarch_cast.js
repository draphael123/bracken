// matriarch_cast.js - OLD PLUME, THE RAPTOR MATRIARCH, her OWN SILHOUETTE (claude/redgorge2 art pass; REDRAWN native, bigger and animated by claude/matriarch2 art).
// THE QUEEN OF THE GORGE, not a big raptor: a TALL CRIMSON CREST (seven plumes, the tallest nearly her own head again), WAR-PAINT (crimson bands across the back and flanks, a
// cream-and-crimson cheek stripe, a brow chevron), SCARRED FLANKS (three pale claw scars and a notch on the hip, a scar through the brow), a HEAVY TAIL (thick root, banded, a
// broad fan of barred feathers) and a great CREAM RUFF with ragged points. She faces right; the game flips her.
// DRAWN NATIVELY at her game size (the old 80x68 frame x 1.35 is gone): MC is the real frame, drawn at scale 1, anchor (AX, GY) = her (x, y).
// Every pose KEY is kept (C.R[key] / C.L[key] / C.white.R[key] = its first frame) and each key now holds a CYCLE (C.frames[key] = [...]): 4-6 frame stalk/run, a breathing idle,
// crouch -> leap (launch, rise, apex, fall, reach) -> land (squat, flap, settle), wind-up + strike + follow-through on the rake, sweep, dive, scree, screech, follow-up and rider
// burst, secondary motion on the tail (tailSw) and crest (crestSw), a flap on the wobble and landings. frameOf(e, S, t, A) picks { key, i } from the mode and the time in it.
// Baked lazily (one frame the first time it is drawn; C.warm() bakes them all). Pure bake: px.js primitives only (the Node canvas shim draws it: tools/redgorge2-cast-sheet.mjs).
import { canvas, px as pxB, rect as rectB, fillPoly as fillPolyB, ellipse as ellipseB, outline, flipX, whiten } from '../px.js';

const K = 1.35, OX = 26, OY = 12;   /* design coordinates (the 80x68 plan) -> native: x * K + OX, y * K + OY (the margin keeps a fanned tail and a tall crest inside the frame) */
export const MC = { W: 138, H: 108, AX: 80, GY: 98 };   /* sprite size; the anchor: x = her centre (e.x), y = the ground line (e.y) */
const nx = x => Math.round(x * K + OX), ny = y => Math.round(y * K + OY);
const rect = (g, x, y, w, h, c) => { const x0 = nx(x), y0 = ny(y), x1 = nx(x + w), y1 = ny(y + h); rectB(g, x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0), c); };
const px = (g, x, y, c) => rect(g, x, y, 1, 1, c);
const ellipse = (g, cx, cy, rx, ry, c) => ellipseB(g, cx * K + OX, cy * K + OY, rx * K, ry * K, c);
const fillPoly = (g, pts, c) => fillPolyB(g, pts.map(p => [p[0] * K + OX, p[1] * K + OY]), c);
const P = { f: '#b8502c', F: '#d87a4a', d: '#6a2414', dd: '#3a1410', cream: '#f0dcb8', creamD: '#c8b088', bar: '#8a3a22', beak: '#e8c070', beakD: '#8a6a28', eye: '#ffe27a', red: '#ff3a2a', leg: '#d8b050', legD: '#8a6a28', crest: '#e8a040', rose: '#c8643a', mask: '#2a1210', claw: '#f4ead0',
  crim: '#b8182e', crimL: '#e0384a', crimD: '#701020', scar: '#f6e6cc', scarD: '#5a1018', wet: '#bfe4f4' };
const OUT = '#1b1626';
const R = Math.round;
/* a limb: a run of w x w squares from (x0, y0) to (x1, y1) (design units; no pre-rounding, so a limb moves smoothly between frames) */
function limb(g, x0, y0, x1, y1, w, col) { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) * 1.3)); for (let i = 0; i <= n; i++) rect(g, x0 + (x1 - x0) * i / n - w / 2, y0 + (y1 - y0) * i / n - w / 2, w, w, col); }
/* a feather: a thin tapering blade from (x, y) along angle for len px, body colour then a lighter tip; bend curls it (radians over its length) */
function feather(g, x, y, ang, len, w, col, tip, bend = 0) { let a = ang, cx = x, cy = y; for (let i = 0; i < len; i++) { const t = i / len, ww = i < len * 0.2 ? w : (t > 0.85 ? 1 : Math.max(1, w - (t > 0.6 ? 1 : 0))); const c = tip && t > 0.72 ? tip : col; rect(g, cx - ww / 2, cy - ww / 2, ww, ww, c); a += bend / len; cx += Math.cos(a); cy += Math.sin(a); } }
const rot = (x, y, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };
/* paint only where a native pixel lies inside the ellipse (design units) and test(xd, yd) holds: the war-paint and the scars stay on her body */
function masked(g, cx, cy, rx, ry, test, col) { const X0 = Math.floor((cx - rx) * K + OX), X1 = Math.ceil((cx + rx) * K + OX), Y0 = Math.floor((cy - ry) * K + OY), Y1 = Math.ceil((cy + ry) * K + OY);
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const xd = (x + 0.5 - OX) / K, yd = (y + 0.5 - OY) / K, ex = (xd - cx) / rx, ey = (yd - cy) / ry; if (ex * ex + ey * ey <= 0.92 && test(xd, yd)) pxB(g, x, y, col); } }

const GYd = 64;   /* the design plan's ground line */
/* one frame. o = { dy (drop), pitch, head: [x, y], beak (0..1), crest (0..1 spread), crestSw (plume sway), crestUp, flare (ruff), breath (chest rise), tail: 'down'|'up'|'coil'|'flat'|'fan', tailSw (rad),
   wing: 'fold'|'half'|'spread'|'drop'|'back'|'none', flap (wing lift), legs: 'stand'|'a'|'b'|'crouch'|'air'|'brace'|'scrape'|'cling', gait (rad: a walking leg cycle), amp, lift, scr (0..1 scrape), tuck,
   arm: 'guard'|'cock'|'rake'|'tuck', armT (0..1 the arm's travel), eye: colour, shut, bx, by (body centre), drip (water) } */
function bake(o) {
  const [c, g] = canvas(MC.W, MC.H), D = o.dy || 0, bx = o.bx ?? 38, by = (o.by ?? 45) + D, pitch = o.pitch || 0, GY = GYd, flare = o.flare || 0, br = o.breath || 0, fl = o.flap || 0;
  const eye = o.eye || P.eye;
  /* ---- the far wing and the far leg first ---- */
  const wing = (shade, k0) => { const sx = bx + 5, sy = by - 8 + pitch * 0.4, w = o.wing, k = k0 + fl;
    if (w === 'none' || !w) return;
    if (w === 'fold') { fillPoly(g, [[sx, sy], [bx - 14, by - 1], [bx - 24, by + 4 + k], [bx - 16, by + 8], [bx + 2, by + 4]], shade); for (let i = 0; i < 6; i++) feather(g, bx - 4 - i * 2, by + 1 + i * 0.4, 2.95 - i * 0.04, 13 + i, 2, i % 2 ? P.d : P.dd, P.cream); }
    else if (w === 'half') { fillPoly(g, [[sx, sy], [sx - 4, sy - 20 - k], [sx - 20, sy - 17 - k], [sx - 22, sy - 4], [bx - 10, by - 2]], shade); for (let i = 0; i < 6; i++) feather(g, sx - 6 - i * 3, sy - 10 - k + i, 3.6 - i * 0.12, 14, 2, i % 2 ? P.d : P.dd, P.cream); }
    else if (w === 'back') { fillPoly(g, [[sx, sy], [bx - 8, by - 12], [bx - 30, by - 10 - k], [bx - 22, by + 2], [bx - 4, by + 2]], shade); for (let i = 0; i < 6; i++) feather(g, bx - 14 - i * 3, by - 7 + i, 3.3 + i * 0.1, 13, 2, i % 2 ? P.d : P.dd, P.cream); }
    else if (w === 'spread') { fillPoly(g, [[sx, sy], [sx - 8 + k, sy - 24], [sx - 30 + k, sy - 24 - k], [sx - 34, sy - 8], [bx - 14, by - 4]], shade); for (let i = 0; i < 7; i++) feather(g, sx - 14 - i * 4, sy - 18 - k + i * 2, 3.9 - i * 0.1, 16, 2, i % 2 ? P.d : P.dd, P.cream); fillPoly(g, [[sx, sy], [sx + 12, sy - 22 + k], [sx + 26, sy - 20], [sx + 20, sy - 4], [sx + 2, sy + 2]], shade === P.d ? P.dd : P.d); for (let i = 0; i < 4; i++) feather(g, sx + 12 + i * 4, sy - 18 + k + i * 2, -0.5 + i * 0.1, 8, 2, P.d, P.cream); }
    else if (w === 'drop') { fillPoly(g, [[sx, sy + 4], [bx + 6, by + 10], [bx - 12, by + 14], [bx - 14, by + 6]], shade); for (let i = 0; i < 5; i++) feather(g, bx - 10 + i * 4, by + 10, 1.7, 8, 2, i % 2 ? P.d : P.dd, P.cream); } };
  const foot = (x, y, kind, col) => {   /* toes forward + a back toe + the raised sickle claw */
    if (kind === 'air') { limb(g, x, y, x + 8, y + 3, 2.4, col); limb(g, x + 8, y + 3, x + 14, y + 2, 1, P.claw); limb(g, x + 1, y - 1, x + 9, y - 3, 2.4, col); limb(g, x + 9, y - 3, x + 14, y - 4, 1, P.claw); return; }
    rect(g, x - 2, y, 9, 2, col); rect(g, x + 5, y + 1, 3, 1, P.claw); rect(g, x + 2, y + 1, 1, 1, P.claw); px(g, x - 3, y + 1, col);   /* the toes, a hind toe */
    limb(g, x + 3, y - 2, x + 8, y - 8, 2, P.claw); px(g, x + 9, y - 9, P.claw); px(g, x + 8, y - 7, P.legD); };   /* the SICKLE: raised, curved */
  const legs = (far) => {
    const L = o.legs || 'stand', col = far ? P.legD : P.leg, thigh = far ? P.d : P.f;
    let hx = bx - 3 + (far ? 4 : 0), hy = by + 6, kx, ky, ax, ay, fx, fy, kind = '';
    if (o.gait !== undefined && L !== 'cling' && L !== 'air') { const p = o.gait + (far ? Math.PI : 0), s = Math.sin(p), cs = Math.cos(p), am = o.amp || 1, lf = Math.max(0, cs) * (o.lift ?? 5) * am;
      fx = hx + 4 + 9 * am * s; fy = GY - 1 - lf; ax = fx - 2; ay = fy - 5 - lf * 0.15; kx = (hx + fx) / 2 + 6 + (cs > 0 ? 2 : 0); ky = hy + 8 - lf * 0.35; }
    else if (L === 'cling' && o.gait !== undefined) { const p = o.gait + (far ? Math.PI : 0), s = Math.sin(p), cs = Math.cos(p); hy = by + 4; kx = hx + 8 + 2 * s; ky = hy + 6; ax = hx + 13 + 3 * s; ay = hy + 4 + 3 * cs; fx = hx + 16 + 3 * s; fy = hy + 4 + 3 * cs; kind = 'air'; }
    else if (L === 'stand') { kx = hx + 7; ky = hy + 8; ax = hx + 1; ay = GY - 6; fx = hx + 2; fy = GY - 1; }
    else if (L === 'a') { const s = far ? -1 : 1; kx = hx + 8 + s * 4; ky = hy + 7; ax = hx + 4 + s * 7; ay = GY - 6; fx = hx + 5 + s * 8; fy = GY - 1 - (far ? 2 : 0); }
    else if (L === 'b') { const s = far ? 1 : -1; kx = hx + 8 + s * 4; ky = hy + 7; ax = hx + 4 + s * 7; ay = GY - 6; fx = hx + 5 + s * 8; fy = GY - 1 - (far ? 0 : 2); }
    else if (L === 'crouch') { hy = by + 5; kx = hx + 10; ky = hy + 3; ax = hx + 3; ay = GY - 5; fx = hx + 5; fy = GY - 1; }
    else if (L === 'brace') { kx = hx + 10; ky = hy + 6; ax = hx + 8; ay = GY - 6; fx = hx + 10; fy = GY - 1; }   /* feet planted out in front (the skid) */
    else if (L === 'scrape') { const sc = o.scr ?? 1; if (far) { kx = hx + 7; ky = hy + 8; ax = hx + 1; ay = GY - 6; fx = hx + 2; fy = GY - 1; } else { kx = hx + 3 + (1 - sc) * 4; ky = hy + 9 - (1 - sc) * 2; ax = hx - 7 * sc + (1 - sc) * 2; ay = GY - 10 + (1 - sc) * 3; fx = hx - 11 * sc + (1 - sc) * 3; fy = GY - 3 + (1 - sc) * 2; } }
    else if (L === 'air') { hy = by + 6; const tk = o.tuck || 0; kx = hx + 11 - tk * 3; ky = hy + 5 - tk * 2; ax = hx + 17 - tk * 6; ay = hy + 7 - tk * 3; fx = hx + 20 - tk * 8; fy = hy + 8 + (far ? 2 : 0) - tk * 4; kind = 'air'; }
    else if (L === 'cling') { hy = by + 4; kx = hx + 8; ky = hy + 6; ax = hx + 14; ay = hy + 4; fx = hx + 17; fy = hy + 4; kind = 'air'; }
    else return;
    limb(g, hx, hy, kx, ky, far ? 5 : 6.5, thigh); limb(g, kx, ky, ax, ay, 3.4, thigh === P.d ? P.dd : P.d); limb(g, ax, ay, fx, fy - 1, 2.4, col); foot(fx, fy, kind, col);
    if (!far) limb(g, hx + (kx - hx) * 0.55, hy + (ky - hy) * 0.55, hx + (kx - hx) * 0.8, hy + (ky - hy) * 0.8, 3.4, P.crim); };   /* a crimson band round the thigh */
  wing(P.dd, 2); legs(true);
  /* ---- the tail: HEAVY - a thick banded root and a broad barred fan ---- */
  { const rx = bx - 13, ry = by - 3, T = o.tail || 'down', sw = o.tailSw || 0, pts = { down: [[rx - 12, ry + 4], [rx - 27, ry + 12]], up: [[rx - 10, ry - 8], [rx - 22, ry - 22]], coil: [[rx - 14, ry - 6], [rx - 14, ry - 18]], flat: [[rx - 14, ry], [rx - 31, ry + 2]], fan: [[rx - 14, ry], [rx - 31, ry - 1]] }[T];
    const p0 = rot(pts[0][0], pts[0][1], rx, ry, sw * 0.6), p1 = rot(pts[1][0], pts[1][1], rx, ry, sw);
    limb(g, rx + 2, ry, p0[0], p0[1], 7, P.d); limb(g, p0[0], p0[1], p1[0], p1[1], 5, P.d);
    for (const t of [0.25, 0.5, 0.75]) { const qx = rx + (p0[0] - rx) * t, qy = ry + (p0[1] - ry) * t; limb(g, qx, qy, qx - 0.6, qy - 0.4, 6.6, t === 0.5 ? P.cream : P.crim); }   /* the war bands on the root */
    const [tx, ty] = p1, base = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), n = T === 'fan' ? 9 : 7, spread = T === 'fan' ? 1.3 : 0.95;
    for (let i = 0; i < n; i++) { const a = base + (i / (n - 1) - 0.5) * spread; feather(g, tx - Math.cos(a) * 3, ty - Math.sin(a) * 3, a, T === 'fan' ? 19 : 15, 3, i % 2 ? P.crim : P.F, i % 2 ? P.cream : P.crest, sw * 0.4); }
    if (T === 'coil') { limb(g, tx, ty, tx + 6, ty - 6, 4, P.d); limb(g, tx + 6, ty - 6, tx + 14, ty - 8, 3, P.d); feather(g, tx + 14, ty - 8, -0.2, 9, 3, P.f, P.cream); } }
  /* ---- the body: a hunched barrel, a deep chest, a heavy rump; war-paint, claw scars, the cream ruff and barring ---- */
  ellipse(g, bx - 9, by + 1, 8, 8, P.d); ellipse(g, bx, by, 15, 9.5, P.f); ellipse(g, bx - 1, by - 3, 12, 5, P.F); ellipse(g, bx + 8, by - 1 + pitch * 0.4 - br * 0.3, 9 + br * 0.3, 9 + br * 0.4, P.f); ellipse(g, bx + 7, by - 3.5 + pitch * 0.4 - br * 0.3, 5.5, 4.5, P.F);
  masked(g, bx, by, 15, 9.5, (x, y) => y < by + 3 && ((x * 0.85 + y * 1.5 + 200) % 8) < 2.2, P.crim);   /* WAR-PAINT: crimson bands slanting across the back and flank */
  masked(g, bx, by, 15, 9.5, (x, y) => y < by - 1 && ((x * 0.85 + y * 1.5 + 200) % 8) < 0.8, P.crimL);
  for (let i = 0; i < 3; i++) { const x0 = bx - 4 + i * 4.2, y0 = by - 3.5; for (let t = 0; t <= 1; t += 0.05) { const xx = x0 + t * 5.5, yy = y0 + t * 8; masked(g, xx, yy, 0.55, 0.55, () => true, P.scar); masked(g, xx + 1.2, yy, 0.5, 0.5, () => true, P.scarD); } }   /* the SCARS: three pale claw-rakes down the flank, each with a dark-red lip */
  for (let t = 0; t <= 1; t += 0.1) masked(g, bx - 10 + t * 4, by + 1 - t * 5, 0.5, 0.5, () => true, P.scar);   /* a long old rake across the hip */
  ellipse(g, bx + 8, by + 3, 7 + flare, 5 + flare * 0.5, P.cream); ellipse(g, bx + 9, by + 5, 6, 3, P.creamD);
  for (let k = 0; k < 4; k++) { rect(g, bx + 2 + k * 3, by + 1 + (k & 1), 2, 1, P.bar); rect(g, bx + 3 + k * 3, by + 4 + (k & 1), 2, 1, P.bar); }
  for (let k = 0; k < 5; k++) rect(g, bx - 10 + k * 3, by - 4 + (k & 1), 2, 1, P.d);   /* the barring on her back */
  legs(false);
  /* ---- the wing over the flank ---- */
  wing(P.d, 0);
  /* ---- neck and head ---- */
  const hd = o.head || [bx + 17, by - 22 + pitch], hxp = hd[0], hyp = hd[1] - br * 0.4, open = o.beak || 0;
  limb(g, bx + 9, by - 7, hxp - 3, hyp + 4, 9, P.f); limb(g, bx + 10, by - 6, hxp - 2, hyp + 4, 4.5, P.F);
  { const nxm = hxp - 4 + (bx + 10 - hxp) * 0.25, nym = hyp + 7 + (by - hyp) * 0.2;   /* THE RUFF: a great cream collar, ragged with long points */
    ellipse(g, nxm, nym, 5 + flare * 0.9, 6 + flare * 0.9, P.creamD); ellipse(g, nxm + 1, nym - 1, 4 + flare * 0.8, 5 + flare * 0.8, P.cream);
    for (let i = 0; i < 8; i++) { const a = 0.15 + i * 0.36; feather(g, nxm + Math.cos(a) * 3, nym + Math.sin(a) * 3.5, a, 3 + flare * 1.2 + (i % 2) * 2, 2, i % 2 ? P.cream : P.creamD, P.cream); } }
  for (let k = 0; k < 2; k++) rect(g, hxp - 6 + k * 3, hyp + 9 + k * 2, 2, 1, P.crim);
  ellipse(g, hxp, hyp, 7.5, 5.6, P.f); ellipse(g, hxp - 1, hyp - 1.5, 5.5, 2.7, P.F); ellipse(g, hxp + 1, hyp + 2, 4, 2, P.cream);
  rect(g, hxp + 1, hyp - 2, 6, 2, P.mask);   /* the dark mask through the eye */
  if (o.shut) rect(g, hxp + 3, hyp - 1.5, 3, 1, P.dd); else { rect(g, hxp + 3, hyp - 2, 2, 2, eye); px(g, hxp + 4, hyp - 2, P.dd); } rect(g, hxp + 1, hyp - 3, 6, 1, P.d);   /* the eye and the heavy brow */
  rect(g, hxp + 2, hyp + 0.5, 5, 1, P.crim); rect(g, hxp + 3, hyp + 1.5, 4, 1, P.cream); rect(g, hxp - 1, hyp - 1, 2, 3, P.crim);   /* WAR-PAINT: a crimson cheek stripe over a cream one, a bar behind the eye */
  px(g, hxp + 4, hyp - 4, P.crim); px(g, hxp + 5, hyp - 5, P.crimL); px(g, hxp + 3, hyp - 5, P.crimL);   /* a brow chevron */
  limb(g, hxp - 1.5, hyp - 3.5, hxp + 1.5, hyp + 3, 1, P.scar);   /* the SCAR through her brow and cheek */
  fillPoly(g, [[hxp + 5, hyp - 3], [hxp + 13, hyp - 0.5], [hxp + 12, hyp + 3 - open], [hxp + 9, hyp + 4 - open * 2], [hxp + 5, hyp + 1]], P.beak);   /* the hooked upper beak */
  rect(g, hxp + 12, hyp + 2 - open, 1, 3, P.beak); px(g, hxp + 12, hyp + 5 - open, P.beakD); rect(g, hxp + 6, hyp + 1 - open, 5, 1, P.beakD);
  if (open > 0.15) { const j = Math.round(open * 6); fillPoly(g, [[hxp + 3, hyp + 3], [hxp + 11, hyp + 3 + j], [hxp + 10, hyp + 5 + j], [hxp + 4, hyp + 5]], P.beak); rect(g, hxp + 4, hyp + 3, 7, Math.max(1, j - 1), '#7a1a14'); px(g, hxp + 6, hyp + 3, P.cream); }   /* the lower jaw swung down: the red throat */
  else rect(g, hxp + 5, hyp + 3, 7, 1, P.beakD);
  /* the CREST: seven long CRIMSON plumes swept up and back from the brow, the tallest the height of her head again, tipped gold and cream */
  { const sp = o.crest ?? 0.5, sw = o.crestSw || 0, up = o.crestUp ? 0.4 : 0, LEN = [26, 23, 20, 18, 16, 14, 12];
    for (let i = 6; i >= 0; i--) { const a = -1.78 - i * (0.15 + sp * 0.07) + up * (1 - i * 0.08) + sw * (0.4 + i * 0.1);
      feather(g, hxp - 1 + (i >> 1), hyp - 4, a, LEN[i] + (o.crestUp ? 2 : 0), 3, i % 2 ? P.crim : P.crimL, i === 0 ? P.crest : i % 3 === 0 ? P.beak : P.cream, -0.5 - sw * 2); } }
  /* ---- her arms: feathered, each with a hooked claw ---- */
  { const A = o.arm || 'tuck', aT = o.armT ?? 1, ax = bx + 11, ay = by - 3 + pitch * 0.5;
    if (A === 'tuck') { limb(g, ax, ay, ax + 5, ay + 5, 3.4, P.d); limb(g, ax + 5, ay + 5, ax + 9, ay + 3, 2.4, P.d); feather(g, ax + 8, ay + 3, 0.3, 6, 1, P.claw); }
    else if (A === 'guard') { limb(g, ax, ay, ax + 7, ay - 5, 3.4, P.d); limb(g, ax + 7, ay - 5, ax + 13, ay - 10, 2.4, P.d); for (const [da, l] of [[-0.5, 7], [-0.1, 8], [0.35, 6]]) feather(g, ax + 13, ay - 10, da - 0.6, l, 1, P.claw); }   /* TALONS UP */
    else if (A === 'cock') { const ex = ax - 2 - 3 * aT, ey = ay - 5 - 2 * aT, hx2 = ex - 5 - 6 * aT, hy2 = ey - 2 - aT; limb(g, ax, ay, ex, ey, 3.4, P.d); limb(g, ex, ey, hx2, hy2, 2.4, P.d); for (const [da, l] of [[-0.3, 7], [0.1, 8], [0.5, 6]]) feather(g, hx2, hy2, Math.PI + da, l, 1, P.claw); }
    else if (A === 'rake') { const a = -1.1 + aT * 2.0, ex = ax + 8, ey = ay + 3 - 5 * (1 - aT), hx2 = ex + 11 * Math.cos(a), hy2 = ey + 11 * Math.sin(a); limb(g, ax, ay, ex, ey, 3.4, P.d); limb(g, ex, ey, hx2, hy2, 2.4, P.d);
      for (const da of [-0.35, 0, 0.35]) feather(g, hx2, hy2, a + da + 0.2, 8, 1, P.claw);
      if (aT > 0.3) for (let i = 0; i < 16; i++) { const t = i / 15, q = -1.1 + t * 2.0; if (q > a + 0.15) break; px(g, ax + 12 + Math.cos(q) * 17, ay + 6 + Math.sin(q) * 16, t > 0.2 && t < 0.85 ? '#fff6e0' : P.cream); } } }
  if (o.drip) for (let i = 0; i < o.drip; i++) { px(g, bx - 10 + ((i * 7) % 24), by + 9 + (i * 5) % 10 + (i % 3), P.wet); px(g, bx - 8 + ((i * 11) % 22), by - 2 + (i * 3) % 8, '#e8f6fb'); }
  return outline(c, OUT);
}

/* ---------- THE FRAMES: every pose key is a CYCLE ---------- */
const S_ = Math.sin, C_ = Math.cos, TAU = Math.PI * 2;
const seq = (n, f) => Array.from({ length: n }, (_, i) => f(i, i / n * TAU, i / Math.max(1, n - 1)));
const mk = (b, ...o) => Object.assign({}, b, ...o);
const FR = {};
/* the stalk: a six-frame stride, the body dipping as the legs spread, the head nodding, the tail and crest swaying a beat behind */
FR.walkA = seq(6, (i, p) => ({ legs: 'a', gait: p, amp: 1, tail: 'down', tailSw: 0.16 * S_(p - 0.9), wing: 'fold', flap: 0.8 * S_(p * 2), arm: 'guard', head: [58 + 1.3 * S_(p + 0.4), 27 + 0.8 * C_(p * 2)], by: 44.6 + 1.2 * Math.abs(S_(p)), crest: 0.4, crestSw: 0.2 * S_(p * 2 - 1) }));
FR.walkB = FR.walkA.slice(3).concat(FR.walkA.slice(0, 3));
/* the idle: a breathing four-frame stand, the crest ruffling, the tail's tip lifting, a slow look */
FR.idle = seq(4, (i, p) => ({ legs: 'stand', tail: 'down', tailSw: 0.07 * S_(p), wing: 'fold', arm: 'guard', head: [57 + 1.2 * S_(p), 24.5 + 0.5 * C_(p)], breath: [0, 1, 2, 1][i], by: 45, crest: 0.45 + 0.1 * S_(p), crestSw: 0.1 * S_(p - 1), flare: [0, 0.4, 0.8, 0.4][i] }));
FR.sleep = [0, 1, 2, 1].map(b => ({ dy: 12, pitch: 7, head: [44, 46], legs: 'crouch', tail: 'flat', wing: 'fold', arm: 'tuck', beak: 0, crest: 0.1, eye: P.d, shut: true, flare: 1, breath: b * 0.9, tailSw: 0.03 * b }));
FR.wake = [{ dy: 10, pitch: 6, head: [48, 42], legs: 'crouch', tail: 'flat', wing: 'fold', arm: 'tuck', crest: 0.2, flare: 1, breath: 1 }, { dy: 3, pitch: 2, head: [54, 30], legs: 'stand', tail: 'down', wing: 'half', arm: 'tuck', crest: 0.7, flare: 1, beak: 0.1, crestSw: 0.2 }, { legs: 'stand', tail: 'down', wing: 'half', arm: 'tuck', head: [56, 22], crest: 1, flare: 1.5, beak: 0.3, flap: 3, crestSw: -0.15 }];
/* the pounce's tell: settle, coil, shiver - the eye red */
const CR = { pitch: 6, legs: 'crouch', tail: 'up', wing: 'half', arm: 'tuck', crest: 0.2, eye: P.red };
FR.crouch = [mk(CR, { dy: 3, pitch: 3, head: [59, 33] }), mk(CR, { dy: 8, head: [60, 40], tailSw: 0.1 }), mk(CR, { dy: 9, head: [61, 41], bx: 37, tailSw: -0.12, flap: 1 }), mk(CR, { dy: 9, head: [61, 41], bx: 39, tailSw: 0.14, flap: -1 })];
/* the follow-up's twisted crouch: wings out, tail lashing */
const FO = { pitch: 4, legs: 'crouch', tail: 'up', wing: 'spread', arm: 'rake', crest: 0.6, eye: P.red, beak: 0.6 };
FR.follow = [mk(FO, { dy: 3, head: [60, 33], armT: 0.1, flap: 4 }), mk(FO, { dy: 7, head: [62, 37], armT: 0.2, flap: 0, tailSw: 0.14, bx: 37 }), mk(FO, { dy: 8, head: [63, 38], armT: 0.1, flap: 2, tailSw: -0.14, bx: 36 }), mk(FO, { dy: 8, head: [63, 38], armT: 0.15, flap: -1, tailSw: 0.18, bx: 37.5 })];
/* THE LEAP: launch (the stretch), rise, apex (tucked), fall (reaching), reach (talons for the mark) */
FR.leap = [{ dy: 0, by: 41, pitch: -6, head: [62, 30], legs: 'air', tuck: 0, tail: 'flat', tailSw: 0.3, wing: 'back', flap: 4, arm: 'rake', armT: 0.15, crest: 0.8, beak: 0.5, crestSw: -0.2 },
  { dy: -3, by: 39, pitch: -3, head: [61, 31], legs: 'air', tuck: 0.3, tail: 'flat', tailSw: 0.15, wing: 'back', flap: 1, arm: 'rake', armT: 0.3, crest: 0.6, beak: 0.5 },
  { dy: -4, by: 38, pitch: 0, head: [60, 32], legs: 'air', tuck: 0.9, tail: 'flat', tailSw: -0.05, wing: 'back', flap: -2, arm: 'tuck', crest: 0.5, beak: 0.4, crestSw: 0.1 },
  { dy: -2, by: 38, pitch: 3, head: [62, 35], legs: 'air', tuck: 0.4, tail: 'up', tailSw: -0.2, wing: 'half', flap: 2, arm: 'rake', armT: 0.5, crest: 0.9, beak: 0.6, crestSw: 0.25 },
  { dy: 0, by: 40, pitch: 5, head: [64, 38], legs: 'air', tuck: 0, tail: 'up', tailSw: -0.3, wing: 'spread', flap: 3, arm: 'rake', armT: 0.9, crest: 1, beak: 0.8, crestSw: 0.3 }];
/* the landing: the squat, the flap that catches her balance, the settle */
FR.land = [{ dy: 9, pitch: 6, head: [60, 40], legs: 'crouch', tail: 'up', tailSw: 0.2, wing: 'spread', flap: 2, arm: 'tuck', crest: 0.9, beak: 0.3, crestSw: 0.3 }, { dy: 5, pitch: 3, head: [59, 33], legs: 'crouch', tail: 'flat', tailSw: -0.1, wing: 'spread', flap: -2, arm: 'guard', crest: 0.7, beak: 0.2, crestSw: -0.2 }, { dy: 2, pitch: 1, head: [58, 28], legs: 'stand', tail: 'down', tailSw: 0.1, wing: 'half', flap: 1, arm: 'guard', crest: 0.5 }];
FR.skid = [{ legs: 'brace', tail: 'up', tailSw: 0.2, wing: 'half', flap: 2, arm: 'tuck', head: [50, 21], pitch: -5, beak: 0.9, crest: 1, bx: 34, crestSw: 0.3 }, { legs: 'brace', tail: 'down', tailSw: 0.05, wing: 'fold', arm: 'tuck', head: [53, 21], pitch: -3, beak: 0.7, crest: 0.8, bx: 36, breath: 2 }, { legs: 'brace', tail: 'down', tailSw: -0.1, wing: 'fold', arm: 'tuck', head: [54, 23], pitch: -2, beak: 0.5, crest: 0.6, bx: 36.5, breath: 1, crestSw: -0.1 }];
/* THE RAKE: wind-up (head bobs, the arm cocks back, the weight sits back), the strike, the full arc, the follow-through; the breath after */
const RT = { legs: 'stand', tail: 'down', wing: 'fold', arm: 'cock', crest: 0.4, beak: 0.3 };
FR.rakeTell = [mk(RT, { head: [58, 27], pitch: 1, armT: 0.2, bx: 38 }), mk(RT, { head: [60, 31], pitch: 3, armT: 0.6, bx: 37, tailSw: 0.1 }), mk(RT, { head: [58, 33], pitch: 4, armT: 1, bx: 36, dy: 2, tailSw: 0.2, crest: 0.2 }), mk(RT, { head: [58, 34], pitch: 4, armT: 1.2, bx: 35.5, dy: 2, tailSw: 0.24, crest: 0.2 })];
const RK = { legs: 'stand', tail: 'down', wing: 'fold', arm: 'rake', crest: 0.2 };
FR.rake = [mk(RK, { head: [63, 31], pitch: 4, armT: 0.35, bx: 40, tailSw: -0.1 }), mk(RK, { head: [65, 32], pitch: 5, armT: 0.8, bx: 42, dy: 1, tailSw: -0.2, beak: 0.3 }), mk(RK, { head: [64, 34], pitch: 6, armT: 1, bx: 42, dy: 2, tail: 'flat', tailSw: -0.15, crestSw: 0.3 })];
FR.rakeRec = [{ legs: 'stand', tail: 'down', wing: 'fold', arm: 'tuck', head: [62, 35], pitch: 5, bx: 41, dy: 2, breath: 2, crest: 0.3, beak: 0.3, crestSw: 0.25 }, { legs: 'stand', tail: 'down', wing: 'fold', arm: 'tuck', head: [60, 31], pitch: 3, bx: 40, dy: 1, breath: 1, crest: 0.4, beak: 0.2 }, { legs: 'stand', tail: 'down', wing: 'fold', arm: 'guard', head: [58, 27], pitch: 1, bx: 39, breath: 0, crest: 0.5, crestSw: -0.1 }];
/* THE TAIL SWEEP: she turns her head back, the tail coils, tighter; it whips, fans flat, and comes back */
const ST = { legs: 'crouch', tail: 'coil', wing: 'fold', arm: 'tuck', crest: 0.3 };
FR.sweepTell = [mk(ST, { dy: 2, head: [54, 29], pitch: 1, tail: 'down', tailSw: -0.3 }), mk(ST, { dy: 4, head: [50, 31], pitch: 2, tailSw: -0.1 }), mk(ST, { dy: 5, head: [48, 32], pitch: 3, tailSw: 0.15, bx: 40 })];
const SW = { legs: 'crouch', dy: 4, wing: 'fold', arm: 'tuck', crest: 0.3, pitch: 2 };
FR.sweep = [mk(SW, { tail: 'flat', tailSw: 0.9, head: [50, 31], bx: 39 }), mk(SW, { tail: 'fan', head: [47, 32], tailSw: 0.05, crestSw: 0.3 }), mk(SW, { tail: 'fan', head: [49, 32], tailSw: -0.3, bx: 38.5 })];
/* the scree kick: a foot drags back (strokes), the head low */
FR.screeTell = [0.2, 1, 0.5].map((sc, i) => ({ legs: 'scrape', scr: sc, dy: 2 + i * 0.5, tail: 'down', tailSw: [0, 0.12, -0.08][i], wing: 'fold', arm: 'tuck', head: [60, 35 + (i === 1 ? 1 : 0)], pitch: 4, crest: 0.2, eye: P.red }));
/* the screech: head back, the beak wide, the ruff flared, wings half open and shaking */
const SC = { legs: 'stand', tail: 'down', wing: 'half', arm: 'guard', crest: 1, crestUp: true };
FR.screech = [mk(SC, { head: [52, 21], pitch: -3, beak: 0.5, flare: 1, flap: 0 }), mk(SC, { head: [48, 16], pitch: -6, beak: 1, flare: 2, flap: 3, crestSw: 0.15 }), mk(SC, { head: [49, 15], pitch: -7, beak: 1, flare: 2.4, flap: 1, crestSw: -0.15, tailSw: 0.1 })];
/* the wobble on a narrow top: flapping to hold her balance, the whole body swaying against the wings */
FR.wobble = seq(4, (i, p) => ({ legs: 'brace', tail: 'flat', tailSw: -0.3 * S_(p), wing: 'spread', flap: 3 * S_(p + 1), arm: 'tuck', head: [54 + S_(p), 20], pitch: -4, beak: 0.6, crest: 1, by: 44, bx: 38 + 1.5 * S_(p), crestSw: 0.3 * S_(p) }));
FR.down = [0, 1, 2].map(i => ({ dy: 14, pitch: 8, head: [58 + (i - 1) * 1.5, 54 + (i === 1 ? 1 : 0)], legs: 'brace', tail: 'flat', tailSw: (i - 1) * 0.1, wing: 'drop', arm: 'tuck', eye: P.creamD, beak: 0.3, crest: 0.1, flare: 0, breath: i === 1 ? 2 : 0, shut: i === 2 }));
/* the wall run: a four-frame scramble, wings back, the tail whipping */
FR.wall = seq(4, (i, p) => ({ by: 42, legs: 'cling', gait: p, tail: 'down', tailSw: 0.25 * S_(p), wing: 'back', flap: 0.6 * S_(p), arm: 'rake', armT: 0.5 + 0.2 * S_(p), head: [58, 28 + 0.8 * C_(p * 2)], crest: 0.7, beak: 0.3, crestSw: 0.2 * S_(p - 0.5) }));
FR.divetell = [0, 2, 4].map((fk, i) => ({ legs: 'air', by: 40, tail: 'up', tailSw: [0, 0.15, -0.1][i], wing: 'spread', flap: fk, arm: 'guard', head: [57, 24 - (i === 1 ? 1 : 0)], crest: 1, eye: P.red, beak: 0.5, crestSw: [0, 0.2, -0.2][i] }));
FR.dive = [{ legs: 'air', by: 39, tuck: 0.2, tail: 'up', tailSw: 0.2, wing: 'half', flap: 2, arm: 'rake', armT: 0.4, head: [61, 36], pitch: 4, crest: 0.6, eye: P.red, beak: 0.3 }, { legs: 'air', by: 40, tail: 'flat', wing: 'back', arm: 'rake', armT: 0.8, head: [62, 38], pitch: 5, crest: 0.3, eye: P.red, beak: 0.2, tailSw: 0.1 }, { legs: 'air', by: 40, tail: 'flat', tailSw: 0.2, wing: 'back', flap: -1, arm: 'rake', armT: 1, head: [63, 40], pitch: 6, crest: 0.2, eye: P.red, beak: 0.3, crestSw: 0.4 }];
FR.perch = seq(3, (i, p) => ({ legs: 'stand', tail: 'down', tailSw: 0.1 * S_(p), wing: 'half', flap: [0, 2, 0.5][i], arm: 'tuck', head: [54, 19 + (i === 2 ? 1 : 0)], crest: 1, flare: 1 + (i === 1 ? 0.6 : 0), beak: 0.1, breath: [0, 1, 2][i], crestSw: 0.15 * S_(p) }));
FR.volley = [{ legs: 'stand', tail: 'fan', wing: 'half', arm: 'guard', head: [54, 20], pitch: -2, crest: 1, beak: 0.5, flare: 1, flap: 2 }, { legs: 'stand', tail: 'fan', wing: 'spread', arm: 'guard', head: [55, 19], pitch: -3, crest: 1, beak: 0.9, flare: 1.2, crestUp: true, flap: 4 }, { legs: 'stand', tail: 'fan', tailSw: 0.1, wing: 'spread', arm: 'guard', head: [55, 20], pitch: -3, crest: 1, beak: 1, flare: 1.5, crestUp: true, flap: 0, crestSw: 0.2 }];
FR.crack = [{ legs: 'stand', dy: 0, tail: 'up', wing: 'half', arm: 'guard', head: [53, 18], pitch: -4, beak: 0.7, crest: 1, flare: 1, crestUp: true }, { legs: 'stand', dy: -1, tail: 'up', tailSw: 0.1, wing: 'half', arm: 'guard', head: [50, 13], pitch: -8, beak: 1, crest: 1, flare: 2, crestUp: true, flap: 2 }, { legs: 'stand', dy: -1, tail: 'up', tailSw: -0.1, wing: 'half', arm: 'guard', head: [50, 12], pitch: -9, beak: 1, crest: 1, flare: 2.4, crestUp: true, flap: 0, crestSw: 0.2 }];
/* THE BROOD CALL: she gathers on the wall and calls - head back, ruff and tail fanned, wings beating */
const BC = { legs: 'cling', by: 42, tail: 'fan', wing: 'spread', arm: 'guard', crest: 1, crestUp: true };
FR.broodcall = [mk(BC, { head: [55, 22], pitch: -3, beak: 0.4, flare: 1, flap: 0 }), mk(BC, { head: [52, 18], pitch: -5, beak: 0.8, flare: 1.6, flap: 3, tailSw: 0.12 }), mk(BC, { head: [50, 16], pitch: -6, beak: 1, flare: 2, flap: 1, tailSw: -0.12, crestSw: 0.2 }), mk(BC, { head: [50, 15], pitch: -7, beak: 1, flare: 2.4, flap: 4, tailSw: 0.1, crestSw: -0.2 })];
/* circling the walls over her young: a six-frame run, wings half open */
FR.circle = seq(6, (i, p) => ({ by: 42, legs: 'cling', gait: p, tail: 'flat', tailSw: 0.3 * S_(p), wing: 'half', flap: 2 * S_(p), arm: 'rake', armT: 0.5 + 0.25 * S_(p), head: [58 + S_(p), 26 + C_(p * 2)], crest: 0.8, beak: 0.4, crestSw: 0.25 * S_(p - 0.4) }));
/* the grief: down to them, head low and swaying, the wings dropped */
FR.grieve = [0, 1, 2, 1].map((s, i) => ({ dy: 6, pitch: 7, head: [62 + s * 0.8, 46 + (i === 2 ? 1.5 : 0)], legs: 'brace', tail: 'flat', tailSw: 0.05 * (i - 1), wing: 'drop', arm: 'tuck', crest: 0.2 + s * 0.05, beak: 0.2, flare: 0, breath: [0, 1, 2, 1][i], shut: i === 2 }));
/* THE FLOOD RIDER: coiled on the top (deeper, tail up), then up out of the water - rising wet, full spread, beak open at the top, then the fall */
const RD = { pitch: 8, legs: 'crouch', tail: 'up', wing: 'back', arm: 'tuck', crest: 0.2, eye: P.red };
FR.riderTell = [mk(RD, { dy: 6, head: [62, 40] }), mk(RD, { dy: 10, head: [62, 44], tailSw: 0.12, bx: 37 }), mk(RD, { dy: 11, head: [63, 45], tailSw: -0.12, bx: 36, flap: 2 })];
FR.riderBurst = [{ dy: 4, by: 42, pitch: -2, head: [60, 26], legs: 'air', tuck: 0.2, tail: 'up', tailSw: 0.2, wing: 'back', flap: 3, arm: 'rake', armT: 0.3, crest: 1, beak: 0.6, drip: 12, crestUp: true, crestSw: -0.2 },
  { dy: -2, by: 38, pitch: -6, head: [56, 21], legs: 'air', tuck: 0.3, tail: 'fan', wing: 'spread', flap: 4, arm: 'rake', armT: 0.6, crest: 1, beak: 1, flare: 2, crestUp: true, drip: 10, crestSw: 0.25 },
  { dy: -4, by: 36, pitch: -7, head: [55, 19], legs: 'air', tuck: 0.8, tail: 'fan', tailSw: -0.15, wing: 'spread', flap: 1, arm: 'rake', armT: 0.9, crest: 1, beak: 1, flare: 2.4, crestUp: true, drip: 6, crestSw: -0.2 },
  { dy: -1, by: 39, pitch: 2, head: [60, 28], legs: 'air', tuck: 0.2, tail: 'up', tailSw: -0.25, wing: 'half', flap: 2, arm: 'rake', armT: 0.8, crest: 0.9, beak: 0.7, drip: 3, crestSw: 0.3 }];

/* ---------- the bake: lazy per frame (a canvas the first time it is drawn); C.warm() bakes the lot (the boss's spawn calls it) ---------- */
const KEYS = Object.keys(FR);
let CAST = null;
const cache = new Map();
const lazy = (build) => { const o = {}; for (const k of KEYS) { let v = null; Object.defineProperty(o, k, { enumerable: true, get() { return v || (v = build(k, 0)); } }); } return o; };
function variant(spec, kind) {
  let e = cache.get(spec); if (!e) cache.set(spec, e = {});
  if (!e.R) e.R = bake(spec);
  if (kind === 'R') return e.R;
  if (kind === 'L') return e.L || (e.L = flipX(e.R));
  if (kind === 'wR') return e.wR || (e.wR = whiten(e.R));
  return e.wL || (e.wL = flipX(variant(spec, 'wR'))); }
export function bakeMatriarch() {
  if (CAST) return CAST;
  const frame = (kind) => (k, i) => variant(FR[k][i], kind);
  const view = (kind) => lazy(frame(kind));
  CAST = { R: view('R'), L: view('L'), white: { R: view('wR'), L: view('wL') }, ...MC, poses: KEYS, frames: FR, count: k => FR[k].length,
    get: (k, i, dirL, white) => variant(FR[k][i], white ? (dirL ? 'wL' : 'wR') : (dirL ? 'L' : 'R')),
    warm() { for (const k of KEYS) for (const s of FR[k]) { variant(s, 'R'); variant(s, 'L'); variant(s, 'wR'); variant(s, 'wL'); } } };
  return CAST; }
/* which pose KEY a mode wears (kept: the keys the game and the tests know); frameOf picks the frame in its cycle */
export function poseOf(e, S, t) {
  const m = e.mode;
  if (m === 'sleep') return 'sleep'; if (m === 'wake') return 'wake';
  if (m === 'pounceTell') return 'crouch'; if (m === 'followTell') return 'follow'; if (m === 'broodTell') return 'broodcall'; if (m === 'circle') return 'circle'; if (m === 'grieve') return 'grieve'; if (m === 'riderTell') return 'riderTell'; if (m === 'skid') return 'skid'; if (m === 'rakeTell') return 'rakeTell'; if (m === 'rake') return 'rake'; if (m === 'rakeBeat') return 'rakeTell';
  if (m === 'sweepTell') return 'sweepTell'; if (m === 'sweep') return 'sweep'; if (m === 'screeTell') return 'screeTell'; if (m === 'screechTell' || m === 'surgeTell') return 'screech';
  if (m === 'wobble' || m === 'pstagger') return 'wobble'; if (m === 'staggered' || m === 'stunned' || m === 'tangled' || m === 'falling') return 'down';
  if (m === 'wallRun') return 'wall'; if (m === 'diveTell') return 'divetell'; if (m === 'volleyTell') return 'volley'; if (m === 'perch' || m === 'perched') return 'perch'; if (m === 'crack') return 'crack';
  if (m === 'fly' && e.riderAir) return 'riderBurst';
  if (m === 'fly') { const f = S && S.fly; return f && f.then === 'diveLand' ? 'dive' : 'leap'; }
  return Math.floor(t * 5) % 2 ? 'walkA' : 'walkB';
}
/* THE FRAME: { key, i } from the mode and the time. t = the clock (s); A = { el: seconds in this mode, prev: the mode before, sinceFly: seconds since a flight ended, moving: she is walking }.
   Tells walk through their frames (wind-up) and hold the last with a shiver; strikes run quickly and hold; the rest cycle. */
export function frameOf(e, S, t, A = {}) {
  const m = e.mode, el = A.el || 0, n = k => FR[k].length;
  const prog = (k, step) => ({ key: k, i: Math.min(n(k) - 1, Math.floor(el / step)) });
  const cyc = (k, rate) => ({ key: k, i: Math.floor(t * rate) % n(k) });
  switch (m) {
    case 'sleep': return cyc('sleep', 1.4);
    case 'wake': return prog('wake', 0.5);
    case 'pounceTell': return el < 0.3 ? prog('crouch', 0.15) : { key: 'crouch', i: 2 + Math.floor(t * 16) % 2 };
    case 'followTell': return el < 0.3 ? prog('follow', 0.15) : { key: 'follow', i: 2 + Math.floor(t * 16) % 2 };
    case 'broodTell': return el < 0.7 ? prog('broodcall', 0.25) : { key: 'broodcall', i: 2 + Math.floor(t * 9) % 2 };
    case 'circle': return cyc('circle', 13);
    case 'grieve': return cyc('grieve', 2.4);
    case 'riderTell': return el < 0.3 ? prog('riderTell', 0.15) : { key: 'riderTell', i: 1 + Math.floor(t * 14) % 2 };
    case 'skid': return prog('skid', 0.1);
    case 'rakeTell': return el < 0.4 ? prog('rakeTell', 0.13) : { key: 'rakeTell', i: 2 + Math.floor(t * 14) % 2 };
    case 'rake': return prog('rake', 0.07);
    case 'rakeBeat': return prog('rakeRec', 0.2);
    case 'sweepTell': return prog('sweepTell', 0.2);
    case 'sweep': return prog('sweep', 0.09);
    case 'screeTell': return cyc('screeTell', 7);
    case 'screechTell': case 'surgeTell': return el < 0.15 ? { key: 'screech', i: 0 } : { key: 'screech', i: 1 + Math.floor(t * 11) % 2 };
    case 'wobble': case 'pstagger': return cyc('wobble', 10);
    case 'staggered': case 'stunned': case 'tangled': case 'falling': return cyc('down', 2.5);
    case 'wallRun': return cyc('wall', 11);
    case 'diveTell': return cyc('divetell', 9);
    case 'volleyTell': return el < 0.4 ? prog('volley', 0.2) : { key: 'volley', i: 1 + Math.floor(t * 12) % 2 };
    case 'perch': case 'perched': return cyc('perch', 2.2);
    case 'crack': return prog('crack', 0.3);
    case 'fly': {
      const f = S && S.fly, p = f && f.t0 > 0 ? Math.max(0, Math.min(1, 1 - e.modeT / f.t0)) : 0.5;
      if (e.riderAir) return { key: 'riderBurst', i: p < 0.18 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3 };
      if (f && f.then === 'diveLand') return prog('dive', 0.08);
      return { key: 'leap', i: p < 0.1 ? 0 : p < 0.38 ? 1 : p < 0.62 ? 2 : p < 0.88 ? 3 : 4 }; }
    default: {
      if (A.prev === 'fly' && A.sinceFly < 0.36) return { key: 'land', i: A.sinceFly < 0.1 ? 0 : A.sinceFly < 0.22 ? 1 : 2 };
      return A.moving ? cyc('walkA', 9) : cyc('idle', 2.6); }
  }
}
