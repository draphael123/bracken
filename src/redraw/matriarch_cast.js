// matriarch_cast.js - OLD PLUME, THE RAPTOR MATRIARCH, her OWN SILHOUETTE (claude/redgorge2 art pass). A matriarch of the gorge's raptors: half again the cliff raptor's size, hunched like a
// hunting dromaeosaur, a long fan of rust-and-cream tail feathers, a great RUFF of cream at the throat, a hooked gold beak and a CREST of six long plumes swept back from the brow
// (the same crest the plumes on the road were shed from), feathered arms with a hooked claw each, and a SICKLE CLAW raised on each foot. She is drawn facing right; the game flips her.
// One baked frame per POSE (readable at a glance, 1x, in the arena's 320 px view):
//   walk A/B (the stalk, her guard talons UP) | sleep (curled, head under the wing) | wake (head up, ruff flaring) | crouch (the pounce's tell: haunches high, tail up, head low,
//   the eye RED) | leap (the pounce, the dive, a fly: feet forward, claws out) | skid (braced, head up, beak open: her GUARD IS DOWN) | rakeTell (head bobbing, an arm cocked back) |
//   rake (the arm across, the claw arc) | sweepTell (her back to you, the tail coiled) | sweep (the tail flat and fanned) | screeTell (one foot scraping back, head down) |
//   screech (head back, beak wide, ruff flared, wings half open) | wobble (flapping on a narrow top) | down (staggered / stunned / tangled / falling: on her side, dazed) |
//   wall (the wall run: clinging, back to the rock) | divetell (hanging off the wall, wings open, eye red) | dive (a dart: wings swept back, talons forward) |
//   perch (on the rope bridge: upright, gripping, wings half open, crest high) | volley (wings spread wide, quills fanned) | crack (rearing up at the dam)
// Pure bake: px.js primitives only (the Node canvas shim draws it: tools/redgorge2-cast-sheet.mjs).
import { canvas, px, rect, fillPoly, ellipse, circle, outline, flipX, whiten } from '../px.js';

export const MC = { W: 80, H: 68, AX: 40, GY: 64 };   /* sprite size; the anchor: x = her centre (e.x), y = the ground line (e.y) */
const P = { f: '#b8502c', F: '#d87a4a', d: '#6a2414', dd: '#3a1410', cream: '#f0dcb8', creamD: '#c8b088', bar: '#8a3a22', beak: '#e8c070', beakD: '#8a6a28', eye: '#ffe27a', red: '#ff3a2a', leg: '#d8b050', legD: '#8a6a28', crest: '#e8a040', rose: '#c8643a', mask: '#2a1210', claw: '#f4ead0' };
const OUT = '#1b1626';
const R = Math.round;
/* a limb: a run of w x w squares from (x0, y0) to (x1, y1) */
function limb(g, x0, y0, x1, y1, w, col) { const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) rect(g, Math.round(x0 + (x1 - x0) * i / n - w / 2), Math.round(y0 + (y1 - y0) * i / n - w / 2), w, w, col); }
/* a feather: a thin tapering blade from (x, y) along (dx, dy) for len px, body colour then a lighter tip */
function feather(g, x, y, ang, len, w, col, tip) { const dx = Math.cos(ang), dy = Math.sin(ang); for (let i = 0; i < len; i++) { const t = i / len, ww = i < len * 0.2 ? w : (t > 0.85 ? 1 : Math.max(1, w - (t > 0.6 ? 1 : 0))); const c = tip && t > 0.72 ? tip : col; rect(g, Math.round(x + dx * i - ww / 2), Math.round(y + dy * i - ww / 2), ww, ww, c); } }

/* one pose. o = { dy (drop), pitch, head: [x, y], beak (0..1), crest (0..1 spread), flare (ruff), tail: 'down'|'up'|'coil'|'flat'|'fan', wing: 'fold'|'half'|'spread'|'drop'|'back'|'none', legs: 'stand'|'a'|'b'|'crouch'|'air'|'brace'|'scrape'|'cling',
   arm: 'guard'|'cock'|'rake'|'tuck', eye: colour, bx, by (body centre override) } */
function bake(o) {
  const [c, g] = canvas(MC.W, MC.H), D = o.dy || 0, bx = o.bx ?? 38, by = (o.by ?? 45) + D, pitch = o.pitch || 0, GY = MC.GY, flare = o.flare || 0;
  const eye = o.eye || P.eye;
  /* ---- the far wing and the far leg first ---- */
  const wing = (shade, k) => { const sx = bx + 5, sy = by - 8 + pitch * 0.4, w = o.wing;
    if (w === 'none') return;
    if (w === 'fold') { fillPoly(g, [[sx, sy], [bx - 14, by - 1], [bx - 24, by + 4 + k], [bx - 16, by + 8], [bx + 2, by + 4]], shade); for (let i = 0; i < 5; i++) feather(g, bx - 4 - i * 2, by + 1 + i * 0.4, 2.95 - i * 0.04, 12 + i, 2, i % 2 ? P.d : P.dd, P.cream); }
    else if (w === 'half') { fillPoly(g, [[sx, sy], [sx - 4, sy - 20 - k], [sx - 20, sy - 17 - k], [sx - 22, sy - 4], [bx - 10, by - 2]], shade); for (let i = 0; i < 5; i++) feather(g, sx - 6 - i * 3, sy - 10 - k + i, 3.6 - i * 0.12, 13, 2, i % 2 ? P.d : P.dd, P.cream); }
    else if (w === 'back') { fillPoly(g, [[sx, sy], [bx - 8, by - 12], [bx - 30, by - 10 - k], [bx - 22, by + 2], [bx - 4, by + 2]], shade); for (let i = 0; i < 5; i++) feather(g, bx - 14 - i * 3, by - 7 + i, 3.3 + i * 0.1, 12, 2, i % 2 ? P.d : P.dd, P.cream); }
    else if (w === 'spread') { fillPoly(g, [[sx, sy], [sx - 8 + k, sy - 24], [sx - 30 + k, sy - 24 - k], [sx - 34, sy - 8], [bx - 14, by - 4]], shade); for (let i = 0; i < 6; i++) feather(g, sx - 14 - i * 4, sy - 18 - k + i * 2, 3.9 - i * 0.1, 15, 2, i % 2 ? P.d : P.dd, P.cream); fillPoly(g, [[sx, sy], [sx + 12, sy - 22 + k], [sx + 26, sy - 20], [sx + 20, sy - 4], [sx + 2, sy + 2]], shade === P.d ? P.dd : P.d); }
    else if (w === 'drop') { fillPoly(g, [[sx, sy + 4], [bx + 6, by + 10], [bx - 12, by + 14], [bx - 14, by + 6]], shade); for (let i = 0; i < 4; i++) feather(g, bx - 10 + i * 4, by + 10, 1.7, 8, 2, i % 2 ? P.d : P.dd, P.cream); } };
  const foot = (x, y, kind, col) => {   /* toes forward + a back toe + the raised sickle claw */
    if (kind === 'air') { limb(g, x, y, x + 8, y + 3, 2, col); limb(g, x + 8, y + 3, x + 14, y + 2, 1, P.claw); limb(g, x + 1, y - 1, x + 9, y - 3, 2, col); limb(g, x + 9, y - 3, x + 14, y - 4, 1, P.claw); return; }
    rect(g, x - 2, y, 9, 2, col); rect(g, x + 5, y + 1, 3, 1, P.claw); rect(g, x + 2, y + 1, 1, 1, P.claw); px(g, x - 3, y + 1, col);   /* the toes, a hind toe */
    limb(g, x + 3, y - 2, x + 8, y - 8, 2, P.claw); px(g, x + 9, y - 9, P.claw); px(g, x + 8, y - 7, P.legD); };   /* the SICKLE: raised, curved */
  const legs = (far) => {
    const L = o.legs || 'stand', col = far ? P.legD : P.leg, thigh = far ? P.d : P.f;
    let hx = bx - 3 + (far ? 4 : 0), hy = by + 6, kx, ky, ax, ay, fx, fy, kind = '';
    if (L === 'stand') { kx = hx + 7; ky = hy + 8; ax = hx + 1; ay = GY - 6; fx = hx + 2; fy = GY - 1; }
    else if (L === 'a') { const s = far ? -1 : 1; kx = hx + 8 + s * 4; ky = hy + 7; ax = hx + 4 + s * 7; ay = GY - 6 - (far ? 0 : 0); fx = hx + 5 + s * 8; fy = GY - 1 - (far ? 2 : 0); }
    else if (L === 'b') { const s = far ? 1 : -1; kx = hx + 8 + s * 4; ky = hy + 7; ax = hx + 4 + s * 7; ay = GY - 6; fx = hx + 5 + s * 8; fy = GY - 1 - (far ? 0 : 2); }
    else if (L === 'crouch') { hy = by + 5; kx = hx + 10; ky = hy + 3; ax = hx + 3; ay = GY - 5; fx = hx + 5; fy = GY - 1; }
    else if (L === 'brace') { kx = hx + 10; ky = hy + 6; ax = hx + 8; ay = GY - 6; fx = hx + 10; fy = GY - 1; }   /* feet planted out in front (the skid) */
    else if (L === 'scrape') { if (far) { kx = hx + 7; ky = hy + 8; ax = hx + 1; ay = GY - 6; fx = hx + 2; fy = GY - 1; } else { kx = hx + 3; ky = hy + 9; ax = hx - 7; ay = GY - 10; fx = hx - 11; fy = GY - 3; } }   /* one foot raking back along the stone */
    else if (L === 'air') { hy = by + 6; kx = hx + 11; ky = hy + 5; ax = hx + 17; ay = hy + 7; fx = hx + 20; fy = hy + 8 + (far ? 2 : 0); kind = 'air'; }
    else if (L === 'cling') { hy = by + 4; kx = hx + 8; ky = hy + 6; ax = hx + 14; ay = hy + 4; fx = hx + 17; fy = hy + 4; kind = 'air'; }
    else return;
    limb(g, hx, hy, kx, ky, far ? 4 : 5, thigh); limb(g, kx, ky, ax, ay, 3, thigh === P.d ? P.dd : P.d); limb(g, ax, ay, fx, fy - 1, 2, col); foot(fx, fy, kind, col); };
  wing(P.dd, 2); legs(true);
  /* ---- the tail ---- */
  { const rx = bx - 12, ry = by - 3, T = o.tail || 'down', pts = { down: [[rx - 12, ry + 4], [rx - 26, ry + 12]], up: [[rx - 10, ry - 8], [rx - 22, ry - 22]], coil: [[rx - 14, ry - 6], [rx - 14, ry - 18]], flat: [[rx - 14, ry], [rx - 30, ry + 2]], fan: [[rx - 14, ry], [rx - 30, ry - 1]] }[T];
    limb(g, rx, ry, pts[0][0], pts[0][1], 4, P.d); limb(g, pts[0][0], pts[0][1], pts[1][0], pts[1][1], 3, P.d);
    const [tx, ty] = pts[1], base = Math.atan2(ty - pts[0][1], tx - pts[0][0]), n = T === 'fan' ? 7 : 5, spread = T === 'fan' ? 0.9 : 0.6;
    for (let i = 0; i < n; i++) { const a = base + (i / (n - 1) - 0.5) * spread; feather(g, tx - Math.cos(a) * 3, ty - Math.sin(a) * 3, a, T === 'fan' ? 14 : 11, 2, i % 2 ? P.d : P.f, i % 2 ? P.cream : P.crest); }
    if (T === 'coil') { limb(g, tx, ty, tx + 6, ty - 6, 3, P.d); limb(g, tx + 6, ty - 6, tx + 14, ty - 8, 2, P.d); feather(g, tx + 14, ty - 8, -0.2, 8, 2, P.f, P.cream); } }
  /* ---- the body: a hunched barrel, a deep chest, a heavy rump; the cream ruff and barring ---- */
  ellipse(g, bx - 8, by + 1, 7, 7, P.d); ellipse(g, bx, by, 14, 8.5, P.f); ellipse(g, bx - 1, by - 2.5, 11, 4.5, P.F); ellipse(g, bx + 8, by - 1 + pitch * 0.4, 8, 8, P.f); ellipse(g, bx + 7, by - 3 + pitch * 0.4, 5, 4, P.F);
  ellipse(g, bx + 8, by + 3, 6 + flare, 4.5 + flare * 0.5, P.cream); ellipse(g, bx + 9, by + 5, 5, 2.5, P.creamD);
  for (let k = 0; k < 4; k++) { rect(g, bx + 2 + k * 3, by + 1 + (k & 1), 2, 1, P.bar); rect(g, bx + 3 + k * 3, by + 4 + (k & 1), 2, 1, P.bar); }
  for (let k = 0; k < 5; k++) rect(g, bx - 10 + k * 3, by - 4 + (k & 1), 2, 1, P.d);   /* the barring on her back */
  legs(false);
  /* ---- the wing over the flank ---- */
  wing(P.d, 0);
  /* ---- neck and head ---- */
  const hd = o.head || [bx + 17, by - 22 + pitch], hxp = hd[0], hyp = hd[1], open = o.beak || 0;
  limb(g, bx + 9, by - 7, hxp - 3, hyp + 4, 8, P.f); limb(g, bx + 10, by - 6, hxp - 2, hyp + 4, 4, P.F); ellipse(g, hxp - 4 + (bx + 10 - hxp) * 0.25, hyp + 7 + (by - hyp) * 0.2, 3.5 + flare * 0.9, 4.5 + flare * 0.9, P.creamD); ellipse(g, hxp - 3 + (bx + 10 - hxp) * 0.25, hyp + 6 + (by - hyp) * 0.2, 2.5 + flare * 0.8, 3.5 + flare * 0.8, P.cream);   /* the throat ruff */
  for (let k = 0; k < 2; k++) rect(g, hxp - 6 + k * 3, hyp + 9 + k * 2, 2, 1, P.bar);
  ellipse(g, hxp, hyp, 7, 5.2, P.f); ellipse(g, hxp - 1, hyp - 1.5, 5, 2.5, P.F); ellipse(g, hxp + 1, hyp + 2, 4, 2, P.cream);
  rect(g, hxp + 1, hyp - 2, 6, 2, P.mask);   /* the dark mask through the eye */
  rect(g, hxp + 3, hyp - 2, 2, 2, eye); px(g, hxp + 4, hyp - 2, P.dd); rect(g, hxp + 1, hyp - 3, 6, 1, P.d);   /* the eye and the heavy brow */
  fillPoly(g, [[hxp + 5, hyp - 3], [hxp + 13, hyp - 0.5 - open * 0], [hxp + 12, hyp + 3 - open], [hxp + 9, hyp + 4 - open * 2], [hxp + 5, hyp + 1]], P.beak);   /* the hooked upper beak */
  rect(g, hxp + 12, hyp + 2 - open, 1, 3, P.beak); px(g, hxp + 12, hyp + 5 - open, P.beakD); rect(g, hxp + 6, hyp + 1 - open, 5, 1, P.beakD);
  if (open > 0.15) { const j = Math.round(open * 6); fillPoly(g, [[hxp + 3, hyp + 3], [hxp + 11, hyp + 3 + j], [hxp + 10, hyp + 5 + j], [hxp + 4, hyp + 5]], P.beak); rect(g, hxp + 4, hyp + 3, 7, Math.max(1, j - 1), '#7a1a14'); px(g, hxp + 6, hyp + 3, P.cream); }   /* the lower jaw swung down: the red throat */
  else rect(g, hxp + 5, hyp + 3, 7, 1, P.beakD);
  /* the CREST: six long plumes swept back from the brow, cream to rust to gold */
  { const sp = o.crest ?? 0.5; for (let i = 0; i < 6; i++) { const a = Math.PI + 0.1 + (i - 2.5) * (0.12 + sp * 0.1) - 0.45 + (o.crestUp ? -0.5 : 0) ; feather(g, hxp - 2 + (i >> 1), hyp - 4, a - (i % 2) * 0.05, 13 + (i % 3) * 3 + (o.crestUp ? 1 : 0), 2, i % 2 ? P.cream : P.crest, i % 3 === 0 ? P.rose : P.beak); } }
  /* ---- her arms: feathered, each with a hooked claw ---- */
  { const A = o.arm || 'tuck', ax = bx + 11, ay = by - 3 + pitch * 0.5;
    if (A === 'tuck') { limb(g, ax, ay, ax + 5, ay + 5, 3, P.d); limb(g, ax + 5, ay + 5, ax + 9, ay + 3, 2, P.d); feather(g, ax + 8, ay + 3, 0.3, 6, 1, P.claw); }
    else if (A === 'guard') { limb(g, ax, ay, ax + 7, ay - 5, 3, P.d); limb(g, ax + 7, ay - 5, ax + 13, ay - 10, 2, P.d); for (const [da, l] of [[-0.5, 7], [-0.1, 8], [0.35, 6]]) feather(g, ax + 13, ay - 10, da - 0.6, l, 1, P.claw); }   /* TALONS UP */
    else if (A === 'cock') { limb(g, ax, ay, ax - 3, ay - 7, 3, P.d); limb(g, ax - 3, ay - 7, ax - 10, ay - 9, 2, P.d); for (const [da, l] of [[-0.3, 7], [0.1, 8], [0.5, 6]]) feather(g, ax - 10, ay - 9, Math.PI + da, l, 1, P.claw); }
    else if (A === 'rake') { limb(g, ax, ay, ax + 9, ay + 3, 3, P.d); limb(g, ax + 9, ay + 3, ax + 18, ay + 8, 2, P.d); for (const [da, l] of [[0.5, 8], [0.9, 8], [1.3, 7]]) feather(g, ax + 18, ay + 8, da, l, 1, P.claw);
      for (let i = 0; i < 14; i++) { const t = i / 13, a = -0.9 + t * 1.9; px(g, R(ax + 12 + Math.cos(a) * 17), R(ay + 6 + Math.sin(a) * 16), t > 0.2 && t < 0.85 ? '#fff6e0' : P.cream); } } }
  /* ---- the eye's glint when she is about to pounce ---- */
  return outline(c, OUT);
}
const walkArm = 'guard';
/* the pose table */
const POSES = {
  walkA: { legs: 'a', tail: 'down', wing: 'fold', arm: walkArm, head: [58, 27], crest: 0.4 }, walkB: { legs: 'b', tail: 'down', wing: 'fold', arm: walkArm, head: [58, 28], crest: 0.4, by: 46 },
  sleep: { dy: 12, pitch: 7, head: [44, 46], legs: 'crouch', tail: 'flat', wing: 'fold', arm: 'tuck', beak: 0, crest: 0.1, eye: P.d, flare: 1 },
  wake: { legs: 'stand', tail: 'down', wing: 'half', arm: 'tuck', head: [56, 22], crest: 1, flare: 1, beak: 0.2 },
  crouch: { dy: 8, pitch: 6, head: [60, 40], legs: 'crouch', tail: 'up', wing: 'half', arm: 'tuck', crest: 0.2, eye: P.red },
  leap: { dy: -3, by: 38, pitch: -2, head: [60, 32], legs: 'air', tail: 'flat', wing: 'back', arm: 'rake', crest: 0.6, beak: 0.5 },
  skid: { legs: 'brace', tail: 'down', wing: 'fold', arm: 'tuck', head: [53, 21], pitch: -3, beak: 0.7, crest: 0.8, bx: 36 },
  rakeTell: { legs: 'stand', tail: 'down', wing: 'fold', arm: 'cock', head: [60, 30], pitch: 3, crest: 0.4, beak: 0.3 },
  rake: { legs: 'stand', tail: 'down', wing: 'fold', arm: 'rake', head: [62, 29], pitch: 4, crest: 0.2 },
  sweepTell: { legs: 'crouch', dy: 4, tail: 'coil', wing: 'fold', arm: 'tuck', head: [50, 31], pitch: 2, crest: 0.3 },
  sweep: { legs: 'crouch', dy: 4, tail: 'fan', wing: 'fold', arm: 'tuck', head: [48, 32], pitch: 2, crest: 0.3 },
  screeTell: { legs: 'scrape', dy: 2, tail: 'down', wing: 'fold', arm: 'tuck', head: [60, 35], pitch: 4, crest: 0.2, eye: P.red },
  screech: { legs: 'stand', tail: 'down', wing: 'half', arm: 'guard', head: [48, 16], pitch: -6, beak: 1, crest: 1, flare: 2, crestUp: true },
  wobble: { legs: 'brace', tail: 'flat', wing: 'spread', arm: 'tuck', head: [54, 20], pitch: -4, beak: 0.6, crest: 1, by: 44 },
  down: { dy: 14, pitch: 8, head: [58, 54], legs: 'brace', tail: 'flat', wing: 'drop', arm: 'tuck', eye: P.creamD, beak: 0.3, crest: 0.1, flare: 0 },
  wall: { dy: 0, by: 42, legs: 'cling', tail: 'down', wing: 'back', arm: 'rake', head: [58, 28], crest: 0.7, beak: 0.3 },
  divetell: { legs: 'air', by: 40, tail: 'up', wing: 'spread', arm: 'guard', head: [57, 24], crest: 1, eye: P.red, beak: 0.5 },
  dive: { legs: 'air', by: 40, tail: 'flat', wing: 'back', arm: 'rake', head: [62, 38], pitch: 5, crest: 0.3, eye: P.red, beak: 0.2 },
  perch: { legs: 'stand', tail: 'down', wing: 'half', arm: 'tuck', head: [54, 19], crest: 1, flare: 1, beak: 0.1 },
  volley: { legs: 'stand', tail: 'fan', wing: 'spread', arm: 'guard', head: [55, 19], pitch: -3, crest: 1, beak: 0.9, flare: 1, crestUp: true },
  crack: { legs: 'stand', dy: -1, tail: 'up', wing: 'half', arm: 'guard', head: [50, 13], pitch: -8, beak: 1, crest: 1, flare: 2, crestUp: true },
  /* (claude/matriarch2) THE NEW MOVES' POSE KEYS - stand-ins built from the poses above until the MATRIARCH2 ART lane draws them (keep the keys) */
  follow: { dy: 6, pitch: 4, head: [62, 36], legs: 'crouch', tail: 'up', wing: 'spread', arm: 'rake', crest: 0.6, eye: P.red, beak: 0.6 },   /* THE FOLLOW-UP's crouch: twisted after your roll, wings out */
  broodcall: { legs: 'cling', by: 42, tail: 'fan', wing: 'spread', arm: 'guard', head: [50, 16], pitch: -6, beak: 1, crest: 1, flare: 2, crestUp: true },   /* THE BROOD CALL: on the wall, head back */
  circle: { dy: 0, by: 42, legs: 'cling', tail: 'flat', wing: 'half', arm: 'rake', head: [58, 26], crest: 0.8, beak: 0.4 },   /* circling the walls over her young */
  grieve: { dy: 6, pitch: 7, head: [62, 46], legs: 'brace', tail: 'flat', wing: 'drop', arm: 'tuck', crest: 0.3, beak: 0.2, flare: 0 },   /* down to her fallen young: head low, guard down */
  riderTell: { dy: 10, pitch: 8, head: [62, 44], legs: 'crouch', tail: 'up', wing: 'back', arm: 'tuck', crest: 0.2, eye: P.red },   /* THE FLOOD RIDER: coiled to dive into the water */
  riderBurst: { dy: -4, by: 38, pitch: -6, head: [56, 20], legs: 'air', tail: 'fan', wing: 'spread', arm: 'rake', crest: 1, beak: 1, flare: 2, crestUp: true },   /* bursting up out of the water */
};
/* pose frames, flipped copies and white hit-flash copies, baked once */
let CAST = null;
export function bakeMatriarch() {
  if (CAST) return CAST; const R0 = {}, L0 = {}, W0 = {}, WL = {};
  for (const k of Object.keys(POSES)) { const c = bake(POSES[k]); R0[k] = c; L0[k] = flipX(c); W0[k] = whiten(c); WL[k] = flipX(W0[k]); }
  CAST = { R: R0, L: L0, white: { R: W0, L: WL }, ...MC, poses: Object.keys(POSES) }; return CAST; }
/* which pose a mode wears (time t drives the stalk's stride and the wings' flap); e.vy < 0 / > 0 is a leap rising / falling */
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
