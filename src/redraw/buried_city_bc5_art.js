// src/redraw/buried_city_bc5_art.js - BURIED CITY 5's ART (claude/bc5art, 11-13): THE GLASSBLOWER, THE SAND GRASPER and the Glass Works' race kit, on the city's own kit
// (src/redraw/buried_city_set.js, _tiles.js, _bc4_art.js, _flip_art.js: sandstone, brass, kiln brick, glass). DRAW ONLY: these functions read what src/glassblower.js, src/sand-grasper.js,
// src/glassblower-hands.js and src/buried-city-flip.js already decided and put pixels on a 2d context. No sim, no numbers, no hitboxes; flag OFF (no L.bc5) nothing here runs.
// Rect-only (fillRect + globalAlpha): so tools/bc5-art-sheet.mjs can render every pose in plain Node (no browser) and tools/bc5-art-lint.mjs can check every one.
//   THE GLASSBLOWER   an OUTLINED MASS (dark rim round every part, one light from the upper back): boots, leather vest, a scorched apron with a glowing hem, a bald soot-black head under a
//                     singed cap with brass goggles, a readable face (brow, two eyes that go wide / up / shut, a mouth that grits, shouts, or puffs round the pipe), a long brass BLOWPIPE with a
//                     molten gather on its end. EVERY pose is its own silhouette: idle / walk / sleep / wake / GOB wind (pipe back over the shoulder, gather swelling) and release (swung down,
//                     a strand of glass) / BLOWPIPE wind (pipe to the mouth, cheeks puffing, the pipe going from red to white) and release (a jet from the tip) / FLIP wind (a hand raised high,
//                     gold sparks) and release (a fist pulled down, a ring) / BULB wind (a glass bulb overhead in both hands, glowing) and release (smashed down, shards) / stagger / buried to
//                     the waist (sand mound, arms flung up, pipe dropped) / warded (a faceted glass dome) / hurt flash / the DEATH FALL (reels, drops the pipe, goes down on his back, the gather shatters)
//   THE SAND GRASPER  the sand's own hands: a grey-green drowned one in rotted wraps, hollow sockets with a pale light. THE TELL: the sand RIPPLES in rings, then a mound swells and a HAND CLAWS UP
//                     through it (a second after), then the head and shoulders; wind = both arms thrown up and wide with the fingers splayed and the eyes flaring; grab = both arms thrust out;
//                     hold = the arms closed round you; recover = slumped and open; walk = a slow dragging shuffle
//   THE KIT           the race door (a sandstone shutter in its guide slots under a brass lintel, a carved hourglass, sand running off its foot, a lintel light gold -> red), the race marker
//                     (a brass pole and a striped pennant that waves while the glass runs, a chalk start line), the hall's kiln stubs (firebrick, a fire-mouth, a brass lip, embers), the hall's
//                     floor (cullet, slag, a furnace glow), the gob (a comet and a floor mark, hot glass spikes, a cooled glass step), the blast cone, the shards, the glint ring, the ward
const R = Math.round;
const OL = '#150a06', FLASH = '#fff2e0';
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;

/* THE PALETTE (a kit, not a rainbow): the city's sandstone + brass + firebrick, and the molten glass he works */
export const PAL = {
  ol: OL,
  skin: '#c8905c', skinHi: '#e8b080', skinLo: '#8a5a38', soot: '#3a2418', sclera: '#f4ecd8', pupil: '#201008', mouth: '#2a0a06', brow: '#2a1608',
  lea: '#5a3a1e', leaHi: '#8a5a2c', leaLo: '#2e1a0c', sleeve: '#7a4a22', apron: '#2c1c12', apronHi: '#4a3020', cap: '#3a2414', capHi: '#5a3a20',
  brass: '#b08a30', brassHi: '#e8c460', brassLo: '#7a5a1c', brassDk: '#3a2808', glassB: '#9ac8e0', glassHi: '#e8f6ff', glassLo: '#4a7a98', glassDim: '#2e5068',
  molten: '#ff9a3c', moltenHi: '#ffd36b', moltenCore: '#fff0b0', moltenLo: '#c8561c', ember: '#ff7a2a', hot: '#ff5a3a', dull: '#8a3a1c',
  sand: '#e6bc68', sandHi: '#f8dc90', sandLo: '#a8782c', sandDk: '#7a5224', stone: '#d8bc86', stoneHi: '#f4e0b0', stoneMid: '#c4a672', stoneLo: '#8a6a46', stoneDk: '#6a4a30',
  brick: '#9e5a3e', brickHi: '#b87454', brickLo: '#5e3020', mortar: '#2e1a14', gold: '#ffd36b', red: '#ff6b6b',
  dead: '#8a8a68', deadHi: '#b4b48a', deadLo: '#52523c', wrap: '#a89870', wrapLo: '#6e6048', socket: '#0e0a06', glow: '#e8e0a0',
};
const C = PAL;

/* ============================================================ the pose painter: a facing-right frame, mirrored by f; (ox, oy) = the feet's centre */
function painter(g, ox, oy, f, flash) {
  const col = c => (flash && c !== OL ? FLASH : c);
  const r = (dx, dy, w, h, c) => { g.fillStyle = col(c); g.fillRect(R(f > 0 ? ox + dx : ox - dx - w), R(oy + dy), w, h); };
  const mass = (dx, dy, w, h, c, hi, lo) => { r(dx - 1, dy - 1, w + 2, h + 2, OL); r(dx, dy, w, h, c); if (hi) { r(dx, dy, w, 1, hi); r(dx, dy, 1, h, hi); } if (lo) { r(dx, dy + h - 1, w, 1, lo); r(dx + w - 1, dy, 1, h, lo); } };
  const path = (x0, y0, x1, y1, wd, c, fn) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), h = wd >> 1;
    for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n); fn(R(x) - h, R(y) - h, wd, wd, c); } };
  const limb = (x0, y0, x1, y1, wd, c, hi) => { path(x0, y0, x1, y1, wd + 2, OL, r); path(x0, y0, x1, y1, wd, c, r); if (hi) path(x0, y0 - 1, x1, y1 - 1, 1, hi, r); };
  const blob = (cx, cy, rad, cols) => { for (let i = 0; i < cols.length; i++) { const q = rad - i * Math.max(1, rad / cols.length); if (q < 0.5) break; const a = Math.max(1, R(q)); r(cx - a, cy - a + 1, a * 2, a * 2 - 2, cols[i]); r(cx - a + 1, cy - a, a * 2 - 2, a * 2, cols[i]); } };
  return { r, mass, path, limb, blob, g, f, ox, oy, col };
}
function ik(sx, sy, hx, hy, l1, l2, bend) { let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy) || 0.01; const m = l1 + l2 - 0.05; if (d > m) { hx = sx + dx * m / d; hy = sy + dy * m / d; dx = hx - sx; dy = hy - sy; d = m; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mx = sx + dx * a / d, my = sy + dy * a / d; return [mx - dy / d * h * bend, my + dx / d * h * bend, hx, hy]; }

/* ============================================================ THE GLASSBLOWER (box ~ 70 x 80 round his feet; hit box 18 x 30) */
export const GB_POSES = ['gbSleep', 'gbWake', 'gbIdle', 'gbWalk', 'gbGobWind', 'gbGobRel', 'gbBlastWind', 'gbBlastRel', 'gbFlipWind', 'gbFlipRel', 'gbBulbWind', 'gbBulbRel', 'gbStagger', 'gbBuried', 'gbDead'];
/* one pose: the pipe's two ends (A: the mouth end, B: the business end), where each hand is (a fraction along the pipe, or a point), the lean, the dip, the head */
function gbSpec(pose, p, t) {
  const bob = Math.sin(t * 6);
  switch (pose) {
    case 'gbSleep': return { lean: 1, dip: 13, A: [-4, -8], B: [14, -9], tn: 0.7, tf: 0.5, head: { dy: 5, eyes: 'shut', mouth: 'grit', gog: 'down' }, sit: true };
    case 'gbWake': { const u = clamp01(p); return { lean: 1 - u, dip: 13 * (1 - u), A: [lerp(-4, 2, u), lerp(-8, -22, u)], B: [lerp(14, 32, u), lerp(-9, -10, u)], tn: 0.5, tf: 0.2, head: { dy: 5 * (1 - u), eyes: u < 0.55 ? 'shut' : 'wide', mouth: u > 0.7 ? 'open' : 'grit', gog: u < 0.5 ? 'down' : 'up' }, sit: u < 0.35 }; }
    case 'gbWalk': return { lean: 1, dip: 0, bob: bob > 0 ? 1 : 0, step: Math.floor(t * 4) % 2, A: [0, -22], B: [32, -10 + bob], tn: 0.35, tf: 0.12, head: { dy: 0, eyes: 'open', mouth: 'grit', gog: 'up' } };
    case 'gbGobWind': return { lean: -4 * p, dip: 0, A: [8, -37], B: [-22, -60 - p * 3], tn: 0.18, tf: 0.5, gather: 3 + p * 4, glow: p, head: { dy: -1, tilt: -1, eyes: 'wide', mouth: 'grit', gog: 'up' } };
    case 'gbGobRel': return { lean: 4, dip: 1, A: [-2, -32], B: [34, -14], tn: 0.2, tf: 0.5, gather: 2, strand: true, glow: 1, head: { dy: 1, eyes: 'open', mouth: 'open', gog: 'up' } };
    case 'gbBlastWind': return { lean: 2, dip: 1, A: [8, -41], B: [40, -38], tn: 0.58, tf: 0.34, tip: clamp01(p), puff: clamp01(p), head: { dy: 0, eyes: 'wide', mouth: 'puff', gog: 'up', puff: clamp01(p) }, chest: clamp01(p) };
    case 'gbBlastRel': return { lean: -3, dip: 0, A: [7, -41], B: [40, -39], tn: 0.58, tf: 0.34, tip: 1, jet: true, head: { dy: 0, eyes: 'shut', mouth: 'puff', gog: 'up', puff: 0.3 } };
    case 'gbFlipWind': return { lean: 0, dip: 0, A: [2, -26], B: [10, -2], tn: 0.3, far: [8 + Math.sin(t * 14) * 1, -63 - p * 2], spark: p, head: { dy: -1, tilt: -1, eyes: 'up', mouth: 'open', gog: 'up' } };
    case 'gbFlipRel': return { lean: 3, dip: 2, A: [2, -26], B: [12, -2], tn: 0.3, far: [15, -27], ring: true, head: { dy: 1, eyes: 'shut', mouth: 'grit', gog: 'up' } };
    case 'gbBulbWind': return { lean: 0, dip: 0, A: [-6, -24], B: [-15, -4], tn: 0.4, hands: [[7, -61], [1, -61]], bulb: [4, -67], glow: p, head: { dy: -2, tilt: -1, eyes: 'up', mouth: 'grit', gog: 'up' } };
    case 'gbBulbRel': return { lean: 6, dip: 3, A: [-6, -24], B: [-15, -4], tn: 0.4, hands: [[17, -9], [12, -12]], burst: [20, -5], head: { dy: 3, eyes: 'shut', mouth: 'open', gog: 'up' } };
    case 'gbStagger': return { lean: -5, dip: 1, A: [-2, -22], B: [10, -4], tn: 0.4, near: [3, -50], far: [-9, -31], head: { dy: 3, tilt: 1, eyes: 'shut', mouth: 'open', gog: 'up' } };
    case 'gbBuried': { const w = Math.sin(t * 7); return { lean: 0, dip: 6, A: [-30, -14], B: [-8, -14], near: [14 + w * 2, -49 + w * 2], far: [-11 - w * 2, -46 - w * 2], head: { dy: 3, eyes: 'dizzy', mouth: 'open', gog: 'up' }, buried: true, dropped: true }; }
    default: return { lean: 0, dip: 0, bob: 0, A: [0, -22], B: [32, -10], tn: 0.35, tf: 0.12, head: { dy: 0, eyes: 'open', mouth: 'grit', gog: 'up' } };   /* gbIdle */
  }
}
/* a = the pipe's gather; glowing = how white-hot (0 dull .. 1) */
function gather(P, x, y, rad, glow, t) {
  const fl = 0.5 + 0.5 * Math.sin(t * 17);
  if (glow > 0.2) { P.g.globalAlpha = 0.25 + glow * 0.2 + fl * 0.1; P.blob(x, y, rad + 3, [C.molten]); P.g.globalAlpha = 1; }
  P.blob(x, y, rad, glow > 0.6 ? [C.molten, C.moltenHi, C.moltenCore] : glow > 0.2 ? [C.moltenLo, C.molten, C.moltenHi] : [C.dull, C.moltenLo, C.molten]);
}
export function drawGlassblower(g, o) {   /* o: { x, y (the feet), f, pose, p (the tell's progress 0..1), t (the clock), ph (phase), flash, open, openK, ward, hit } */
  const f = o.f || 1, t = o.t || 0, p = clamp01(o.p || 0), ph = o.ph || 1, pose = GB_POSES.includes(o.pose) ? o.pose : 'gbIdle', S = gbSpec(pose, p, t), P = painter(g, R(o.x), R(o.y), f, !!o.flash);
  const lean = S.lean || 0, dip = S.dip || 0, hd = S.head || {}, ub = dip;
  /* the floor shadow */
  g.globalAlpha = 0.35; rc(g, o.x - 13, o.y - 1, 26, 2, OL); g.globalAlpha = 1;
  /* the pipe's points (frame coords) */
  const A = S.A, B = S.B, along = u => [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
  const hand = S.hands ? S.hands[0] : S.near ? S.near : along(S.tn ?? 0.35), hand2 = S.hands ? S.hands[1] : S.far ? S.far : S.tf !== undefined ? along(S.tf) : null;
  const shN = [6 + lean, -33 + ub], shF = [-6 + lean, -33 + ub];
  /* FAR ARM (behind the body) */
  if (hand2) { const [ex, ey, hx, hy] = ik(shF[0], shF[1], hand2[0], hand2[1], 11, 11, 1); P.limb(shF[0], shF[1], ex, ey, 4, C.sleeve, C.leaHi); P.limb(ex, ey, hx, hy, 4, C.skinLo); P.mass(R(hx) - 2, R(hy) - 2, 4, 4, C.leaLo, C.lea); }
  /* LEGS */
  const lg = S.sit ? 0 : 14 - dip, st = S.step ? 3 : 0;
  if (!S.buried) { if (S.sit) { P.mass(-11, -9, 20, 8, C.leaLo, C.lea); P.mass(4, -12, 9, 11, C.dull, C.moltenLo); P.r(5, -9, 7, 2, C.leaLo);   /* sat: knees up, boots flat */ }
    else { P.mass(-8 - st, -lg, 6, lg, C.leaLo, C.lea, OL); P.mass(2 + st, -lg, 7, lg, C.lea, C.leaHi, C.leaLo); P.r(3 + st, -3, 6, 1, C.brassLo);   /* far boot, near boot with a brass buckle strap */ } }
  /* TORSO, VEST, APRON */
  if (S.chest) P.mass(-10 + lean, -36 + ub, 20 + R(S.chest * 2), 23, C.lea, C.leaHi, C.leaLo); else P.mass(-10 + lean, -35 + ub, 20, 22, C.lea, C.leaHi, C.leaLo);
  P.r(-9 + lean, -33 + ub, 3, 17, C.sleeve);   /* the shirt sleeve showing at the back */
  P.mass(-7 + lean, -27 + ub, 17, 19, C.apron, C.apronHi, OL);   /* the scorched apron */
  { const hem = ph > 1 ? C.molten : C.moltenLo; for (let x = -6; x < 10; x += 2) { P.r(x + lean, -9 + ub - (hash(x, 3) & 1), 1, 1 + (hash(x, 5) & 1), hem); } if (ph > 1) { for (let x = -5; x < 10; x += 4) P.r(x + lean, -20 + ub + (hash(x, 9) % 6), 2, 1, C.moltenLo); } }   /* the hem scorched, glowing in P2; burn holes */
  for (const bx of [-3, 3]) P.r(bx + lean, -22 + ub, 2, 2, C.leaLo);   /* patched burns */
  P.r(-9 + lean, -15 + ub, 19, 2, C.brassLo); P.r(-9 + lean, -15 + ub, 19, 1, C.brass); P.r(1 + lean, -16 + ub, 4, 4, C.brassHi); P.r(2 + lean, -15 + ub, 2, 2, C.brassLo);   /* the belt and a square buckle */
  /* HEAD */
  { const hx = -4 + lean + (hd.tilt || 0), hy = -47 + ub + (hd.dy || 0), hw = 12 + R((hd.puff || 0) * 2);
    P.r(-3 + lean, -37 + ub, 7, 3, C.skinLo);   /* the neck */
    P.mass(hx - R((hd.puff || 0)), hy, hw, 11, C.skin, C.skinHi, C.skinLo);
    P.r(hx + hw, hy + 5, 1, 2, C.skinHi); P.r(hx + hw, hy + 7, 1, 1, C.skinLo);   /* the nose */
    P.r(hx - 2, hy + 4, 2, 3, C.skinLo);   /* the ear */
    P.r(hx + 1, hy + 8, hw - 2, 3, C.soot);   /* the soot beard */
    for (const k of [3, 6, 9]) P.r(hx + k, hy + 4 + (k & 1), 1, 1, C.soot);   /* cheek soot */
    /* the eyes */
    const eye = (ex, kind) => { const ey = hy + 3;
      if (kind === 'shut') { P.r(ex, ey + 1, 3, 1, C.brow); return; }
      if (kind === 'dizzy') { P.r(ex, ey, 3, 1, C.sclera); P.r(ex + 1, ey - 1, 1, 3, C.sclera); P.r(ex + 1, ey, 1, 1, C.pupil); return; }
      const big = kind === 'wide'; P.r(ex, ey - (big ? 1 : 0), 3, big ? 4 : 3, C.sclera); P.r(ex + (kind === 'up' ? 1 : 2), ey + (kind === 'up' ? -(big ? 1 : 0) : 0), 1, 2, C.pupil); if (big) P.r(ex, ey - 1, 1, 1, C.red); };
    if (hd.gog === 'down') { P.r(hx + 1, hy + 2, hw - 3, 4, C.brassLo); P.r(hx + 2, hy + 3, 3, 2, C.glassDim); P.r(hx + 7, hy + 3, 3, 2, C.glassDim); P.r(hx + 1, hy + 2, hw - 3, 1, C.brass); }
    else { eye(hx + 7, hd.eyes || 'open'); eye(hx + 2, hd.eyes || 'open'); if (hd.eyes === 'wide' || hd.eyes === 'up') { P.r(hx + 6, hy + 1, 5, 1, C.brow); P.r(hx + 1, hy + 1, 4, 1, C.brow); } else P.r(hx + 6, hy + 2, 5, 1, C.brow); P.r(hx + 1, hy + 2, 4, 1, C.brow); }
    /* the mouth */
    { const m = hd.mouth || 'grit', my = hy + 8, mx = hx + 6;
      if (m === 'open') { P.r(mx - 1, my, 5, 3, C.mouth); P.r(mx - 1, my, 5, 1, C.sclera); }
      else if (m === 'puff') { P.r(mx, my, 3, 2, C.mouth); }
      else P.r(mx - 1, my + 1, 5, 1, C.mouth); }
    /* the cap, singed, and the goggles pushed up on it */
    P.mass(hx - 1, hy - 3, hw + 2, 4, C.cap, C.capHi, OL); for (let k = 0; k < hw; k += 3) P.r(hx + k, hy - 3, 1, 1, C.dull);
    if (hd.gog !== 'down') { P.r(hx, hy - 1, hw, 1, C.brassLo); P.mass(hx + 3, hy - 7, 6, 4, C.brass, C.brassHi, C.brassLo); P.r(hx + 4, hy - 6, 4, 2, ph > 1 ? C.moltenHi : C.glassB); P.r(hx + 4, hy - 6, 1, 1, C.glassHi); }   /* lenses up; in P2 they glow */
    if (ph > 1 && hd.gog !== 'down') { g.globalAlpha = 0.35; P.r(hx + 1, hy - 9, 10, 8, C.molten); g.globalAlpha = 1; }
    P.hx = hx; P.hy = hy; P.hw = hw;
  }
  /* NEAR ARM + THE PIPE */
  if (S.dropped) { /* the pipe lies on the sand */ P.limb(A[0], A[1], B[0], B[1], 3, C.brass, C.brassHi); gather(P, B[0] + 3, B[1], 3, 0.1, t); }
  else { P.limb(A[0], A[1], B[0], B[1], 3, C.brass, C.brassHi); P.r(R(lerp(A[0], B[0], 0.82)) - 1, R(lerp(A[1], B[1], 0.82)) - 2, 2, 5, C.brassLo);   /* the pipe and its iron collar */
    if (S.tip !== undefined) { const tip = S.tip; P.blob(B[0] + 1, B[1], 3 + R(tip * 2), tip > 0.6 ? [C.molten, C.moltenHi, C.moltenCore] : [C.dull, C.moltenLo, C.molten]); }
    else gather(P, B[0] + 1, B[1], R(S.gather || 3), S.glow !== undefined ? S.glow : 0.15, t); }
  { const [ex, ey, hx, hy] = ik(shN[0], shN[1], hand[0], hand[1], 11, 11, 1); P.limb(shN[0], shN[1], ex, ey, 5, C.sleeve, C.leaHi); P.limb(ex, ey, hx, hy, 4, C.skin, C.skinHi); P.mass(R(hx) - 2, R(hy) - 2, 5, 5, C.leaLo, C.lea, OL); P.r(R(hx) - 2, R(hy) - 2, 5, 1, C.brass);
    if (S.hands) { const [hx2, hy2] = S.hands[1]; P.mass(R(hx2) - 2, R(hy2) - 2, 4, 4, C.leaLo, C.lea, OL); } }
  /* THE POSES' PROPS */
  if (S.strand) { P.r(B[0] + 3, B[1] + 2, 1, 7, C.moltenHi); P.r(B[0] + 3, B[1] + 9, 2, 2, C.molten); P.r(B[0] + 8, B[1] + 6, 1, 5, C.moltenLo); }   /* a strand of glass trails off the swung pipe */
  if (S.jet) { const jl = 14 + R(Math.abs(Math.sin(t * 40)) * 6); g.globalAlpha = 0.8; P.r(B[0] + 4, B[1] - 3, jl, 6, C.moltenLo); g.globalAlpha = 1; P.r(B[0] + 4, B[1] - 2, jl - 3, 4, C.molten); P.r(B[0] + 4, B[1] - 1, jl - 6, 2, C.moltenHi); for (let k = 0; k < 5; k++) P.r(B[0] + 6 + hash(k, R(t * 30)) % jl, B[1] - 5 + (hash(k, 4) % 10), 1, 1, C.sandHi); }
  if (S.tip !== undefined && S.tip > 0.3) { for (let k = 0; k < 3; k++) { const u = (t * 2 + k / 3) % 1; g.globalAlpha = 0.6 * (1 - u); P.r(B[0] + 2 + k * 3, B[1] - 4 - u * 10, 1, 2, C.moltenHi); g.globalAlpha = 1; } }   /* heat shimmer above the glowing tip */
  if (S.spark) { for (let k = 0; k < 6; k++) { const u = (t * 2.4 + k / 6) % 1, a = k * 1.3 + t * 5; g.globalAlpha = 1 - u; P.r(S.far[0] + Math.cos(a) * (3 + u * 8), S.far[1] - 4 - u * 12 + Math.sin(a) * 2, 1, 2, k & 1 ? C.moltenHi : C.gold); g.globalAlpha = 1; } P.r(S.far[0] - 1, S.far[1] - 7, 3, 3, C.moltenHi); P.r(S.far[0], S.far[1] - 6, 1, 1, C.moltenCore); }   /* the glass he is calling: a bright gold spark in the raised hand */
  if (S.ring) { g.globalAlpha = 0.9; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; P.r(S.far[0] + 2 + Math.cos(a) * 11, S.far[1] - 4 + Math.sin(a) * 11, 2, 2, C.moltenHi); } g.globalAlpha = 1; }
  if (S.bulb) { const [bx, by] = S.bulb, gl = 0.5 + 0.5 * Math.sin(t * 12), rad = 5; g.globalAlpha = 0.25 + gl * 0.2 + (S.glow || 0) * 0.2; P.blob(bx, by, rad + 4, [C.glassB]); g.globalAlpha = 1;
    P.blob(bx, by, rad + 1, [OL]); P.blob(bx, by, rad, [C.glassLo, C.glassB, C.glassHi]); P.r(bx - 3, by - 3, 2, 2, C.glassHi); P.r(bx - 1, by + rad - 1, 3, 3, C.glassLo); P.r(bx - 1, by + rad + 1, 3, 1, C.brass); }   /* the glass bulb: a sphere with a brass neck, glowing */
  if (S.burst) { const [bx, by] = S.burst; for (let k = 0; k < 9; k++) { const a = -1.6 + k * 0.4, d = 5 + (hash(k, 2) % 9); P.r(bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.7 - 3, 2, 2, k & 1 ? C.glassHi : C.glassB); } P.r(bx - 3, by, 7, 2, C.glassLo); }
  /* BURIED TO THE WAIST: the sand over his legs, a mound with rim and falling grains */
  if (S.buried) { const k = clamp01(o.openK === undefined ? 1 : o.openK);
    for (let y = 0; y < 22; y++) { const hw = R(15 + y * 0.45 - Math.max(0, 5 - y) * 1.6); rc(g, o.x - hw, o.y - 22 + y, hw * 2, 1, y < 2 ? C.sandHi : y < 6 ? C.sand : y < 14 ? C.sandLo : C.sandDk); }
    rc(g, o.x - 15, o.y - 23, 30, 1, OL); for (let i = 0; i < 7; i++) dot(g, o.x - 12 + ((hash(i, R(t * 8)) % 25)), o.y - 21 - (hash(i, 1) % 6), i & 1 ? C.sandHi : C.sand);
    /* the ring and the timer */
    const ph2 = 0.5 + 0.5 * Math.sin(t * 8); g.globalAlpha = 0.45 + ph2 * 0.4; for (let a = 0; a < 20; a++) { const q = a / 20 * 6.283; rc(g, o.x + Math.cos(q) * 26 - 1, o.y - 16 + Math.sin(q) * 20 - 1, 2, 2, C.gold); } g.globalAlpha = 1;
    rc(g, o.x - 17, o.y - 61, 34, 5, OL); rc(g, o.x - 16, o.y - 60, 32, 3, C.sandDk); rc(g, o.x - 16, o.y - 60, R(32 * k), 3, C.gold); rc(g, o.x - 16, o.y - 60, R(32 * k), 1, C.moltenCore); }
  /* THE WARD: a faceted glass dome, cracks of white, a pulse */
  if (o.ward > 0) { const a = 0.5 + 0.3 * Math.sin(t * 9); g.globalAlpha = 0.25; for (let y = -36; y <= -2; y += 2) { const hw = R(Math.sqrt(Math.max(0, 1 - Math.pow((y + 14) / 22, 2))) * 28); rc(g, o.x - hw, o.y + y, hw * 2, 2, C.glassB); } g.globalAlpha = a;
    for (let k = 0; k < 24; k++) { const q = Math.PI + k / 23 * Math.PI, cx0 = o.x + Math.cos(q) * 28, cy0 = o.y - 14 + Math.sin(q) * 22; rc(g, cx0 - 1, cy0 - 1, 2, 2, k % 4 === 0 ? C.glassHi : C.glassB); } g.globalAlpha = 0.7; for (const [x0, y0, w0] of [[-18, -26, 8], [-6, -34, 9], [8, -28, 7], [-12, -8, 6], [12, -14, 6]]) { rc(g, o.x + x0, o.y + y0, w0, 1, C.glassHi); rc(g, o.x + x0 + w0 - 2, o.y + y0 + 1, 2, 3, C.glassHi); } g.globalAlpha = 1; }
}

/* THE DEATH FALL (2.4 s; t = seconds since the last blow): he reels, drops the pipe, goes over on his back, the gather shatters on the floor, he fades into the sand */
export function drawGlassblowerDeath(g, o) {   /* o: { x, y, f, t (since death), time } */
  const f = o.f || 1, t = Math.max(0, o.t), u = clamp01(t / 2.4), P = painter(g, R(o.x), R(o.y), f, t < 0.12);
  const fade = u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1; g.globalAlpha = fade;
  if (t < 0.7) { const q = t / 0.7; drawGlassblower(g, { x: o.x - f * q * 6, y: o.y, f, pose: 'gbStagger', p: 1, t: o.time, ph: 2, flash: t < 0.12 }); g.globalAlpha = fade; if (q > 0.5) { P.limb(14 + q * 10, -22 + q * 18, 28 + q * 12, -10 + q * 10, 3, C.brass, C.brassHi); } }
  else { const q = clamp01((t - 0.7) / 0.7), ang = q * 1.45, ox = o.x - f * (6 + q * 14), body = (dx, dy, w, h, c, hi) => { P.mass(dx, dy, w, h, c, hi, OL); };
    const lyingY = -9;   /* on his back: a long mass along the floor, head on the far end */
    if (q < 1) { const tx = -4 - R(q * 20), ty = lyingY - R((1 - q) * 28);   /* tipping: the torso mass swings down */
      P.mass(-9 - R(q * 12), -26 + R(q * 17), 18, 15, C.lea, C.leaHi, C.leaLo); P.mass(-6 - R(q * 12), -25 + R(q * 17), 14, 12, C.apron, C.apronHi, OL);
      P.r(tx + 1, ty + 4, 6, 14 - R(q * 6), C.skinLo); P.mass(tx - 4, ty - 5, 12, 11, C.skin, C.skinHi, C.skinLo); P.r(tx - 2, ty - 5, 10, 3, C.cap); P.r(tx + 3, ty - 1, 2, 2, C.pupil); P.mass(2 - R(q * 8), -14 + R(q * 6), 7, 14 - R(q * 6), C.lea, C.leaHi, C.leaLo); P.mass(-8 - R(q * 6), -14 + R(q * 8), 7, 14 - R(q * 8), C.leaLo, C.lea, OL); }
    else { P.mass(-30, -12, 8, 9, C.skin, C.skinHi, C.skinLo); P.r(-28, -12, 6, 3, C.cap); P.r(-26, -8, 1, 1, C.pupil); P.r(-24, -8, 1, 1, C.pupil);   /* head on the floor, eyes closed in two dashes */
      P.mass(-24, -14, 20, 11, C.lea, C.leaHi, C.leaLo); P.mass(-21, -13, 15, 9, C.apron, C.apronHi, OL); P.mass(-4, -11, 12, 5, C.lea, C.leaHi, C.leaLo); P.mass(7, -11, 8, 5, C.leaLo, C.lea, OL); P.r(11, -10, 3, 1, C.brassLo);
      P.mass(-12, -22, 12, 4, C.sleeve, C.leaHi, OL); P.mass(-3, -19, 5, 4, C.leaLo, C.lea, OL);   /* an arm across the chest */ }
    /* the pipe on the floor and the gather shattering */
    P.limb(10, -3, 36, -2, 3, C.brass, C.brassHi); if (t < 1.5) { const s = clamp01((t - 0.7) / 0.8); P.blob(38, -4 - R((1 - s) * 2), R(4 * (1 - s) + 1), [C.moltenLo, C.molten, C.moltenHi]); for (let k = 0; k < 8; k++) { const a = -3.1 + k * 0.4, d = s * (6 + (hash(k, 3) % 10)); g.globalAlpha = fade * (1 - s * 0.7); P.r(38 + Math.cos(a) * d, -3 + Math.sin(a) * d * 0.8, 2, 2, k & 1 ? C.glassHi : C.glassB); } g.globalAlpha = fade; }
    else { P.r(36, -3, 7, 2, C.glassB); P.r(38, -4, 3, 1, C.glassHi); } }
  g.globalAlpha = 1;
}

/* ============================================================ THE SAND GRASPER (box ~ 40 x 40 round its feet) */
export const SG_POSES = ['grBoil', 'grRise', 'grWalk', 'grWalk2', 'grWind', 'grGrab', 'grHold', 'grRecover', 'grHurt'];
const sandMound = (g, x, y, w, h, t) => { for (let j = 0; j < h; j++) { const hw = R(w / 2 * Math.sqrt(1 - Math.pow(1 - (j + 1) / h, 2)) + 1); rc(g, x - hw, y - h + j, hw * 2, 1, j === 0 ? C.sandHi : j < h * 0.4 ? C.sand : j < h * 0.75 ? C.sandLo : C.sandDk); } rc(g, x - w / 2 - 1, y - 1, w + 2, 1, OL);
  for (let i = 0; i < 4; i++) { const u = (t * 2.2 + i / 4) % 1; dot(g, x - w / 3 + ((hash(i, R(t * 5)) % R(w * 0.66))), y - h - u * 5, i & 1 ? C.sandHi : C.sand); } };
function grHand(P, x, y, spread, claw, t) {   /* a hand at (x, y): a palm, four fingers (splayed or curled), grey-green, with long dark nails */
  P.mass(x - 2, y - 2, 5, 5, C.dead, C.deadHi, C.deadLo);
  for (let k = 0; k < 4; k++) { const fx = x - 3 + k * 2 + (k < 2 ? -spread : spread) * (k === 0 || k === 3 ? 1 : 0.4), fy = y - 3 - (claw ? 0 : 2 + (k === 1 || k === 2 ? 1 : 0)); P.r(R(fx), R(fy) - (claw ? 1 : 3), 1, claw ? 3 : 5, C.deadLo); P.r(R(fx), R(fy) - (claw ? 1 : 3), 1, 1, C.glow); } }
export function drawGrasper(g, o) {   /* o: { x, y, f, pose, mode, p (boil/rise/tell progress 0..1), t, flash, open } */
  const f = o.f || 1, t = o.t || 0, p = clamp01(o.p || 0), pose = o.pose || 'grWalk', mode = o.mode || '', P = painter(g, R(o.x), R(o.y), f, !!o.flash);
  const grains = (n, w, hmax, a) => { for (let i = 0; i < n; i++) { const u = (t * 2.6 + i / n) % 1; g.globalAlpha = (1 - u) * a; dot(g, o.x - w / 2 + (hash(i, R(t * 4)) % w), o.y - 2 - u * hmax, i & 1 ? C.sandHi : C.sand); } g.globalAlpha = 1; };
  const ring = (rad, a, ry) => { g.globalAlpha = a; for (let k = 0; k < 16; k++) { const q = k / 16 * 6.283; rc(g, o.x + Math.cos(q) * rad - 1, o.y + Math.sin(q) * rad * ry - 1, 2, 1, k & 1 ? C.sandHi : C.sandLo); } g.globalAlpha = 1; };
  /* UNDER THE SAND: ripples and, as the boil goes on, a mound, a hand, two hands */
  if (mode === 'buried' || pose === 'grBoil' && mode !== 'boil') { const a = 0.18 + 0.1 * Math.sin(t * 2.4); ring(10 + (t * 5) % 6, a + 0.1, 0.32); ring(5, a, 0.3); for (let i = 0; i < 3; i++) dot(g, o.x - 8 + hash(i, 3) % 16, o.y - 1, C.sandDk); return; }
  if (mode === 'boil') {   /* THE TELL (GRASP.boil s): rings spread out faster and wider, the sand swells, a HAND claws up through it and gropes, then another */
    const sh = Math.sin(t * 40) * (0.5 + p), rise = R(2 + p * 8);
    for (let k = 0; k < 3; k++) { const u = (p * 1.8 + k / 3 + t * 0.6) % 1; ring(6 + u * 20, 0.75 * (1 - u), 0.36); }
    rc(g, o.x - 16, o.y - 1, 32, 1, C.sandLo);
    sandMound(g, o.x + R(sh), o.y, 12 + R(p * 10), rise, t);
    const h1 = clamp01((p - 0.2) / 0.5), h2 = clamp01((p - 0.55) / 0.4);
    if (h1 > 0) { const hy = o.y - rise - R(h1 * 12), wob = Math.sin(t * 13) * 1.2; P.limb(-2, -rise + 1, -3 + wob, hy - o.y, 3, C.dead, C.deadHi); grHand(P, -3 + wob, hy - o.y - 2, 2 + h1 * 2, h1 < 0.5, t); }
    if (h2 > 0) { const hy = o.y - rise - R(h2 * 15), wob = Math.sin(t * 11 + 1) * 1.2; P.limb(5, -rise + 1, 6 + wob, hy - o.y, 3, C.dead, C.deadHi); grHand(P, 6 + wob, hy - o.y - 2, 2 + h2 * 2, false, t); }
    if (p > 0.8) { g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 30); rc(g, o.x - 1, o.y - rise - 32, 3, 8, C.gold); rc(g, o.x - 1, o.y - rise - 21, 3, 3, C.gold); g.globalAlpha = 1; }   /* '!': the pose's own flash over it, the word is the sim's */
    grains(6, 22, 14, 1); return; }
  /* RISING: head and shoulders out of the sand, sand streaming off */
  const rr = pose === 'grRise' ? clamp01(p) : 1, sink = R((1 - rr) * 9);
  const wind = pose === 'grWind', grab = pose === 'grGrab', hold = pose === 'grHold', rec = pose === 'grRecover', hurt = pose === 'grHurt';
  const step = pose === 'grWalk2' ? 1 : 0, lean = wind ? -3 : grab ? 6 : rec ? 2 : 1, dip = rec ? 3 : wind ? -1 : 0;
  const oy = sink;   /* a rising body is drawn lower and its lower half is covered with sand */
  /* legs: wrapped in rotted cloth, dragging (still under the sand while it rises) */
  if (rr >= 0.8) P.mass(-6 - step, -9 + oy, 5, 9, C.wrapLo, C.wrap, OL); P.mass(1 + step, -9 + oy, 6, 9, C.wrap, C.stoneHi, C.wrapLo); if (rr >= 0.8) { P.r(-5 - step, -6 + oy, 6, 1, C.wrapLo); P.r(2 + step, -4 + oy, 5, 1, C.wrapLo); }
  /* torso: ribs showing through grey-green skin, wrap straps across, a ragged loincloth */
  P.mass(-7 + lean, -22 + oy + dip, 15, 15, C.dead, C.deadHi, C.deadLo); for (const ry of [-19, -16, -13]) P.r(-4 + lean, ry + oy + dip, 9, 1, C.deadLo);
  P.r(-7 + lean, -21 + oy + dip, 15, 3, C.wrap); P.r(-7 + lean, -21 + oy + dip, 15, 1, C.stoneHi); P.r(0 + lean, -18 + oy + dip, 3, 8, C.wrap);
  for (let k = 0; k < 4; k++) P.r(-6 + lean + k * 4, -8 + oy + dip + (k & 1), 2, 3, C.wrapLo);
  /* head: a sunken skull-face, hollow sockets with a pale light, a slack jaw; flares in the tell */
  const hx = -4 + lean + (wind ? -1 : 0), hy = -33 + oy + dip + (rec ? 3 : 0);
  P.r(-2 + lean, -24 + oy + dip, 5, 3, C.deadLo);
  P.mass(hx, hy, 10, 10, C.dead, C.deadHi, C.deadLo); P.r(hx - 1, hy + 2, 1, 4, C.deadLo);
  const flare = wind || grab || hold, ex = (a) => hx + a;
  P.r(ex(1), hy + 3, 3, 3, C.socket); P.r(ex(6), hy + 3, 3, 3, C.socket);
  if (!rec) { P.r(ex(2), hy + 4, 1, 1, flare ? C.sclera : C.glow); P.r(ex(7), hy + 4, 1, 1, flare ? C.sclera : C.glow); if (flare) { g.globalAlpha = 0.35 + 0.25 * Math.sin(t * 24); P.r(ex(0), hy + 2, 5, 5, C.glow); P.r(ex(5), hy + 2, 5, 5, C.glow); g.globalAlpha = 1; } }
  P.r(ex(4), hy + 6, 2, 1, C.deadLo);   /* the nose hole */
  P.r(ex(2), hy + 8, 6, wind || grab || hold ? 3 : 1, C.socket); if (wind || grab || hold) P.r(ex(3), hy + 8, 4, 1, C.sclera);   /* the jaw drops: a scream */
  P.r(hx, hy - 1, 10, 2, C.wrapLo); P.r(hx + 2, hy - 1, 6, 1, C.wrap);   /* a head wrap */
  /* arms */
  const shN = [5 + lean, -20 + oy + dip], shF = [-6 + lean, -20 + oy + dip];
  const claw = (hx2, hy2, bendSign, spread, curl, sh) => { const [ex2, ey2, x2, y2] = ik(sh[0], sh[1], hx2, hy2, 9, 9, bendSign); P.limb(sh[0], sh[1], ex2, ey2, 3, C.dead, C.deadHi); P.limb(ex2, ey2, x2, y2, 3, C.deadLo); grHand(P, x2, y2, spread, curl, t); };
  if (wind) { const sw = Math.sin(t * 20) * 1; claw(-13 + sw, -43 + oy, -1, 3, false, shF); claw(15 - sw, -43 + oy, 1, 3, false, shN);   /* BOTH ARMS UP AND WIDE, fingers splayed */
    g.globalAlpha = 0.5 + 0.4 * Math.sin(t * 28); P.r(-20, -50 + oy, 40, 1, C.gold); g.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const u = (t * 3 + i / 6) % 1; g.globalAlpha = 1 - u; dot(g, o.x + (i & 1 ? 1 : -1) * (12 + hash(i, 2) % 6), o.y - 40 + oy + u * 22, C.sand); } g.globalAlpha = 1; }
  else if (grab) { claw(26, -17 + oy, 1, 1, true, shN); claw(22, -13 + oy, 1, 1, true, shF); g.globalAlpha = 0.5; for (let k = 0; k < 3; k++) P.r(-6 - k * 4, -16 + oy + k * 3, 8, 1, C.sandHi); g.globalAlpha = 1; }   /* the lurch: both arms out, motion streaks behind */
  else if (hold) { const sq = 0.5 + 0.5 * Math.sin(t * 16); claw(11 + sq * 1.5, -14 + oy, 1, 0, true, shN); claw(9 + sq, -10 + oy, 1, 0, true, shF); for (let k = 0; k < 5; k++) { const u = (t * 2 + k / 5) % 1; g.globalAlpha = 1 - u; dot(g, o.x + f * (8 + hash(k, 1) % 8), o.y - 8 - u * 14 + oy, C.sand); } g.globalAlpha = 1; }
  else if (rec) { claw(10, -4 + oy, 1, 0, true, shN); claw(-2, -3 + oy, 1, 0, true, shF); }
  else { const sw = Math.sin(t * 3) * 2; claw(12 + sw, -12 + oy, 1, 1, true, shN); claw(8 - sw, -9 + oy, 1, 1, true, shF); }   /* walk: arms hang forward, dragging */
  /* the sand it rises out of */
  if (pose === 'grRise') { rc(g, o.x - 14, o.y, 28, sink + 2, C.sandLo); sandMound(g, o.x, o.y + 1, 26, R(8 + (1 - rr) * 8), t); grains(8, 26, 20, 1); for (let i = 0; i < 8; i++) { const u = (t * 5 + i / 8) % 1; g.globalAlpha = 1 - u; dot(g, o.x - 12 + hash(i, 7) % 24, o.y - 10 + u * 14, C.sandLo); } g.globalAlpha = 1; }
  else if (!wind && !grab && !hold && mode !== 'rise') { g.globalAlpha = 0.5; for (let i = 0; i < 3; i++) dot(g, o.x - 10 - ((t * 20 + i * 5) % 8), o.y - 1 - (i & 1), C.sand); g.globalAlpha = 1; }   /* dust trailing its drag */
  if (rec) { const a = 0.55 + 0.35 * Math.sin(t * 9); g.globalAlpha = a; rc(g, o.x - 6, o.y - 41, 12, 1, C.gold); rc(g, o.x - 6, o.y - 41, 1, 3, C.gold); rc(g, o.x + 5, o.y - 41, 1, 3, C.gold); g.globalAlpha = 1; }   /* its open moment: a gold bracket over the head */
}

/* ============================================================ THE KIT: the race door, the race marker, the hall */
const hourglassGlyph = (g, x, y, c, c2) => { rc(g, x - 4, y, 9, 1, c); rc(g, x - 3, y + 1, 7, 1, c2); rc(g, x - 2, y + 2, 5, 1, c); rc(g, x - 1, y + 3, 3, 1, c2); rc(g, x, y + 4, 1, 1, c); rc(g, x - 1, y + 5, 3, 1, c2); rc(g, x - 2, y + 6, 5, 1, c); rc(g, x - 3, y + 7, 7, 1, c2); rc(g, x - 4, y + 8, 9, 1, c); };
export function drawRaceDoor(V, d) {   /* d: { l, top, w, hh (the doorway's px height), open (0 = shut .. 1 = open), run (a glass is running), k (0..1 of its sand left), warn, moving } screen px */
  const g = V.g, t = V.time, { l, top, w, hh } = d, shown = R(hh * (1 - clamp01(d.open)));
  /* the doorway behind: dark, lit at its sill from the light of the run */
  if (shown < hh) { rc(g, l, top + shown, w, hh - shown, '#1a0e08'); if (d.run) { g.globalAlpha = 0.25 + 0.1 * Math.sin(t * 6); rc(g, l + 2, top + shown, w - 4, hh - shown, d.warn ? C.hot : C.gold); g.globalAlpha = 1; } }
  /* the guide slots: grooves each side, brass studded, always there */
  for (const sx of [l - 2, l + w]) { rc(g, sx, top - 2, 2, hh + 2, C.stoneDk); rc(g, sx, top - 2, 1, hh + 2, C.stoneMid); for (let y = 6; y < hh; y += 10) dot(g, sx + (sx < l ? 0 : 1), top + y, C.brassHi); }
  /* the shutter: sandstone blocks in courses, a brass foot-bar, a carved hourglass; it slides up into the lintel */
  if (shown > 0) { const bh = 8;
    for (let y = 0; y < shown; y += bh) { const hgt = Math.min(bh, shown - y), off = ((y / bh) & 1) * 6; rc(g, l, top + y, w, hgt, C.stoneMid); rc(g, l, top + y, w, 1, C.stoneHi); if (hgt > 1) rc(g, l, top + y + hgt - 1, w, 1, C.stoneLo);
      for (let x = off; x < w; x += 12) { rc(g, l + x, top + y, 1, hgt, C.stoneLo); if (hash(x, y) % 5 === 0) rc(g, l + x + 2, top + y + 2, 3, 1, C.stone); } }
    rc(g, l, top, 1, shown, C.stoneHi); rc(g, l + w - 1, top, 1, shown, C.stoneLo);
    const cy = top + R(shown / 2) - 5; if (shown > 22) { rc(g, l + R(w / 2) - 7, cy - 3, 14, 18, C.stoneDk); rc(g, l + R(w / 2) - 6, cy - 2, 12, 16, C.stoneLo); hourglassGlyph(g, l + R(w / 2), cy, d.run ? C.gold : C.brassLo, d.run ? C.moltenHi : C.brassDk); }
    rc(g, l - 1, top + shown - 3, w + 2, 3, C.brassLo); rc(g, l - 1, top + shown - 3, w + 2, 1, C.brassHi); for (let x = 3; x < w; x += 8) dot(g, l + x, top + shown - 2, C.brassHi);   /* the brass foot-bar */
    if (d.moving) for (let i = 0; i < 6; i++) { const ph = (t * 90 + i * 29) % 18, sx = l + 2 + ((i * 7 + (t * 9 | 0)) % Math.max(1, w - 4)); dot(g, sx, top + shown + ph, i & 1 ? C.sandHi : C.sand); dot(g, sx, top + shown + ph + 1, C.sandLo); } }
  /* the lintel: a stone beam under a brass cap, the keystone lit gold while the glass runs, red in its last seconds, dark when it has run out */
  rc(g, l - 4, top - 8, w + 8, 8, C.stoneLo); rc(g, l - 4, top - 8, w + 8, 2, C.stoneHi); rc(g, l - 4, top - 1, w + 8, 1, C.stoneDk); rc(g, l - 4, top - 10, w + 8, 2, C.brassLo); rc(g, l - 4, top - 10, w + 8, 1, C.brassHi);
  for (let x = 2; x < w + 6; x += 9) { rc(g, l - 4 + x, top - 6, 5, 3, C.stoneDk); rc(g, l - 4 + x, top - 6, 5, 1, C.stoneMid); }
  const kc = !d.run ? C.brassDk : d.warn ? (Math.floor(t * 8) % 2 ? C.hot : C.moltenHi) : C.gold; rc(g, l + R(w / 2) - 5, top - 9, 11, 9, C.brassDk); rc(g, l + R(w / 2) - 4, top - 8, 9, 7, kc); hourglassGlyph(g, l + R(w / 2), top - 8, !d.run ? C.brassLo : C.stoneDk, !d.run ? C.brassDk : C.molten);
  if (d.run) { const gr = 0.12 + 0.1 * Math.sin(t * 5); g.globalAlpha = gr; rc(g, l - 8, top - 14, w + 16, 4, d.warn ? C.hot : C.gold); g.globalAlpha = 1; }
}
export function drawRaceMarker(V, x, y, o) {   /* the race glass's pennant: x its centre, y its foot; o: { run, warn } */
  const g = V.g, t = V.time, px = R(x) - 20, top = R(y) - 30;
  rc(g, px - 1, top, 3, 30, OL); rc(g, px, top, 1, 30, C.brassHi); rc(g, px + 1, top + 1, 1, 29, C.brassLo); rc(g, px - 3, top - 2, 7, 3, C.brassLo); rc(g, px - 2, top - 3, 5, 2, C.brassHi); dot(g, px, top - 4, C.gold);   /* the pole, a finial */
  rc(g, px - 3, R(y) - 3, 8, 3, C.stoneLo); rc(g, px - 3, R(y) - 3, 8, 1, C.stoneHi);
  const w = 15, wave = d => (o.run ? Math.sin(t * 9 + d * 0.55) * (1 + d * 0.12) : d * 0.18);   /* waves while the glass runs, hangs when it has not */
  for (let i = 0; i < w; i++) { const yy = top + 2 + R(wave(i)) + (o.run ? 0 : R(i * 0.5)), hgt = 9 - R(i * 0.3); rc(g, px + 2 + i, yy - 1, 1, hgt + 2, OL); }
  for (let i = 0; i < w; i++) { const yy = top + 2 + R(wave(i)) + (o.run ? 0 : R(i * 0.5)), hgt = 9 - R(i * 0.3); rc(g, px + 2 + i, yy, 1, hgt, (i >> 1) % 2 ? (o.warn ? C.hot : C.gold) : C.red); if (i === 6) hourglassGlyph(g, px + 2 + i, yy + 1, C.stoneHi, C.stone); }
  g.globalAlpha = 0.7; for (let k = 0; k < 7; k++) rc(g, R(x) - 28 + k * 8, R(y) - 1, 5, 1, C.stoneHi); g.globalAlpha = 1;   /* the chalk start line across the floor */
}
/* THE HALL'S KILN STUBS (decor 'kiln', 2 or 3 rows high): firebrick in courses, a banded chimney cap, a fire-mouth that breathes, embers */
export function drawHallKiln(V, l, top, w, hh, time) {
  const g = V.g, t = time === undefined ? V.time : time;
  rc(g, l, top, w, hh, C.brick);
  for (let y = 0; y < hh; y += 5) { const off = ((y / 5) & 1) * 6, bh = Math.min(5, hh - y); if (y + 4 < hh) rc(g, l, top + y + 4, w, 1, C.mortar); for (let x = off; x < w; x += 12) rc(g, l + x, top + y, 1, bh, C.mortar); }
  for (let y = 0; y + 3 < hh; y += 5) for (let x = 0; x < w; x += 12) if (hash(x, y) % 4 === 0) rc(g, l + x + 2, top + y + 1, 4, 2, C.brickHi);
  rc(g, l, top, 2, hh, C.brickHi); rc(g, l + w - 2, top, 2, hh, C.brickLo);
  const mh = Math.max(8, hh - 14), mw = Math.min(14, w - 8), mx = l + ((w - mw) >> 1), my = top + hh - mh - 1, fl = 0.5 + 0.5 * Math.sin(t * 9 + l);
  rc(g, mx - 2, my - 2, mw + 4, mh + 3, C.mortar); rc(g, mx - 1, my - 1, mw + 2, mh + 1, C.stoneDk); rc(g, mx, my, mw, mh, OL);
  for (let x = 0; x < mw; x++) { const a = Math.max(0, 1 - Math.abs(x - mw / 2 + 0.5) / (mw / 2)), hgt = R(2 + a * (mh - 3) * (0.7 + 0.3 * fl)); rc(g, mx + x, my + mh - hgt, 1, hgt, a > 0.7 ? C.moltenHi : a > 0.35 ? C.molten : C.moltenLo); }
  rc(g, mx + 2, my + mh - 2, mw - 4, 2, C.moltenCore);
  g.globalAlpha = 0.18 + 0.1 * fl; rc(g, mx - 8, top + hh - 6, mw + 16, 6, C.molten); g.globalAlpha = 1;   /* the glow on the floor in front of it */
  rc(g, mx - 3, my - 5, mw + 6, 3, C.brassLo); rc(g, mx - 3, my - 5, mw + 6, 1, C.brassHi);   /* the brass lintel of the mouth */
  rc(g, l - 1, top - 3, w + 2, 4, C.brassLo); rc(g, l - 1, top - 3, w + 2, 1, C.brassHi); rc(g, l - 1, top, w + 2, 1, C.brassDk); for (let x = 3; x < w - 2; x += 7) dot(g, l + x, top - 2, C.brassHi);   /* the cap */
  for (let k = 0; k < 14; k++) dot(g, l + 2 + hash(k, w) % (w - 4), top + 2 + hash(k, 5) % Math.max(2, hh - 6), 'rgba(20,12,8,0.5)');
  for (let k = 0; k < 4; k++) { const u = (t * 0.9 + k / 4) % 1; g.globalAlpha = 1 - u; dot(g, l + 4 + hash(k, 3) % (w - 8) + R(Math.sin(t * 3 + k) * 2), top - 5 - u * 18, k & 1 ? C.moltenHi : C.ember); g.globalAlpha = 1; }   /* embers rising off the cap */
}
/* THE HALL'S FLOOR: cullet and slag along the foot of the walls, glass scraps, a furnace glow along the floor (decor 'gbhall'; floor row y) */
export function drawHallFloor(V, l, floorY, w, time) {
  const g = V.g, t = time === undefined ? V.time : time;
  g.globalAlpha = 0.14 + 0.05 * Math.sin(t * 2); rc(g, l, floorY - 5, w, 5, C.molten); g.globalAlpha = 1;
  for (let x = 0; x < w; x += 3) { const hs = hash(x, 91); if (hs % 5 === 0) { const c = hs % 3 === 0 ? C.glassB : hs % 3 === 1 ? C.glassHi : C.glassLo; rc(g, l + x, floorY - 2, 2, 2, c); dot(g, l + x, floorY - 3, c); } else if (hs % 11 === 1) rc(g, l + x, floorY - 2, 3, 2, C.dull); }
  for (const x of [3, w - 14]) { rc(g, l + x, floorY - 3, 10, 3, C.sandLo); rc(g, l + x + 1, floorY - 4, 8, 1, C.sand); rc(g, l + x + 3, floorY - 5, 4, 1, C.sandHi); }   /* sand drifted against the walls */
}
/* THE GOB (his lob): a comet to the mark, the mark on the floor, hot glass spikes, a cooled glass step */
export function drawGob(V, gb, floorY, ts, time, cx, cy) {
  const g = V.g, t = time;
  if (gb.fly) { const x = R(gb.x - cx), y = R(gb.y - cy), mk = R(gb.tx - cx), my = R(floorY - cy), k = 1 - Math.max(0, gb.t) / 0.7;
    for (let i = 1; i <= 6; i++) { g.globalAlpha = 0.5 - i * 0.07; rc(g, x - (gb.tx > gb.x0 ? i * 4 : -i * 4) - 2, y + i * 1.5 - 2, 4, 4, i < 3 ? C.molten : C.moltenLo); } g.globalAlpha = 1;
    rc(g, x - 5, y - 5, 10, 10, OL); rc(g, x - 4, y - 4, 8, 8, C.molten); rc(g, x - 3, y - 3, 6, 6, C.moltenHi); rc(g, x - 1, y - 1, 3, 3, C.moltenCore);
    const bl = Math.floor(t * 12) % 2;   /* the mark: a ring of heat on the floor and an X, blinking */
    g.globalAlpha = 0.3 + 0.3 * k; rc(g, mk - 14, my - 2, 28, 3, C.hot); g.globalAlpha = 1;
    for (let q = 0; q < 12; q++) { const a = q / 12 * 6.283; dot(g, mk + Math.cos(a) * 13, my - 1 + Math.sin(a) * 3, bl ? C.red : C.moltenCore); }
    for (let i = -5; i <= 5; i += 1) { dot(g, mk + i, my - 6 + (i + 5) * 0.8, bl ? C.red : C.moltenCore); dot(g, mk - i, my - 6 + (i + 5) * 0.8, bl ? C.red : C.moltenCore); } return; }
  const x = R(gb.x - cx), fy = R(floorY - cy);
  if (gb.hot > 0) { const fl = Math.sin(t * 20 + gb.x) * 0.5;   /* HOT GLASS: three spikes, white-hot at the tips, a glowing pool, shimmer above */
    g.globalAlpha = 0.4; rc(g, x - 11, fy - 3, 22, 4, C.molten); g.globalAlpha = 1;
    for (const [dx, hh, w0] of [[-6, 14, 5], [0, 22, 6], [5, 12, 4]]) { for (let j = 0; j < hh; j++) { const ww = Math.max(1, R(w0 * (1 - j / hh))); rc(g, x + dx - (ww >> 1) - 1, fy - 1 - j, ww + 2, 1, OL); }
      for (let j = 0; j < hh; j++) { const ww = Math.max(1, R(w0 * (1 - j / hh))); rc(g, x + dx - (ww >> 1), fy - 1 - j, ww, 1, j > hh * 0.8 ? C.moltenCore : j > hh * 0.55 ? C.moltenHi : j > hh * 0.25 ? C.molten : C.moltenLo); } }
    for (let k = 0; k < 3; k++) { const u = (t * 1.6 + k / 3) % 1; g.globalAlpha = 0.5 * (1 - u); rc(g, x - 5 + k * 5 + fl, fy - 26 - u * 12, 2, 4, C.moltenHi); g.globalAlpha = 1; } return; }
  if (gb.cooled) { const col = Math.floor(gb.x / ts), l = R(col * ts - cx), top = fy - ts, k = clamp01(gb.cool / 3);   /* COOLED: a one-row block of blue glass: facets, a bright lip; it clouds as its time runs out */
    rc(g, l, top, ts, ts, OL); rc(g, l + 1, top + 1, ts - 2, ts - 2, k < 0.25 ? C.glassDim : C.glassLo); rc(g, l + 2, top + 2, ts - 4, ts - 4, k < 0.25 ? C.glassLo : C.glassB);
    rc(g, l + 1, top, ts - 2, 2, C.glassHi); rc(g, l + 3, top + 4, 2, 6, C.glassHi); rc(g, l + 7, top + 6, 1, 6, C.glassHi); rc(g, l + 9, top + 9, 4, 1, C.glassLo); rc(g, l + 1, top + ts - 3, ts - 2, 2, C.glassLo);
    if (k < 0.25 && Math.floor(t * 8) % 2) { rc(g, l, top, ts, 2, C.red); } } }
export function drawBlast(V, B, floorY, blastH, time, cx, cy) {   /* the cone: wavy bands of fire from his mouth along the floor, grains blown in it */
  const g = V.g, t = time, a = Math.min(B.x, B.far ?? B.x), b = Math.max(B.x, B.far ?? B.x), dir = B.dir, len = Math.max(2, b - a), fy = R(floorY - cy);
  for (let i = 0; i < len; i += 2) { const u = i / len, x = dir > 0 ? R(B.x + i - cx) : R(B.x - i - cx), hgt = R(blastH * (0.35 + 0.65 * u) * (0.85 + 0.15 * Math.sin(t * 40 + i * 0.5)));
    rc(g, x, fy - hgt, 2, hgt, C.moltenLo); rc(g, x, fy - R(hgt * 0.75), 2, R(hgt * 0.75), C.molten); rc(g, x, fy - R(hgt * 0.45), 2, R(hgt * 0.45), C.moltenHi); if (i % 6 === 0) rc(g, x, fy - R(hgt * 0.2), 2, R(hgt * 0.2), C.moltenCore); }
  for (let k = 0; k < 12; k++) { const u = ((t * 5 + k / 12) % 1), x = dir > 0 ? B.x + u * len : B.x - u * len; dot(g, R(x - cx), fy - 3 - (hash(k, R(t * 9)) % R(blastH)), k & 1 ? C.sandHi : C.sand); } }
export function drawShard(V, s, cx, cy, time) {   /* a glass shard: a pale diamond with a glint and a tail */
  const g = V.g, x = R(s.x - cx), y = R(s.y - cy), tail = s.dir > 0 ? -1 : 1, low = s.ht === 'low';
  g.globalAlpha = 0.4; rc(g, x + tail * 5, y - 1, 5, 2, C.glassB); g.globalAlpha = 0.2; rc(g, x + tail * 10, y - 1, 5, 1, C.glassB); g.globalAlpha = 1;
  rc(g, x - 3, y - 1, 7, 3, OL); rc(g, x - 1, y - 3, 3, 7, OL); rc(g, x - 2, y - 1, 5, 3, low ? C.glassB : C.glassHi); rc(g, x - 1, y - 2, 3, 5, low ? C.glassB : C.glassHi); dot(g, x - 1, y - 1, '#ffffff'); if (Math.floor(time * 14 + s.x) % 3 === 0) dot(g, x + 2, y - 2, '#ffffff');
}
export function drawGlint(V, x, y, k, time) {   /* the glinting hourglass: a ring of gold sparks round it and a timer */
  const g = V.g, a = 0.5 + 0.5 * Math.sin(time * 12);
  g.globalAlpha = 0.5 + a * 0.4; for (let q = 0; q < 18; q++) { const an = q / 18 * 6.283 + time * 1.5; rc(g, x + Math.cos(an) * (16 + a * 3) - 1, y + Math.sin(an) * (20 + a * 3) - 1, 2, 2, q % 3 === 0 ? C.moltenCore : C.gold); } g.globalAlpha = 1;
  for (let q = 0; q < 4; q++) { const u = (time * 1.4 + q / 4) % 1; g.globalAlpha = 1 - u; dot(g, x - 6 + hash(q, 4) % 12, y + 12 - u * 30, C.moltenCore); g.globalAlpha = 1; }
  rc(g, x - 13, y - 27, 26, 4, OL); rc(g, x - 12, y - 26, 24, 2, C.sandDk); rc(g, x - 12, y - 26, R(24 * clamp01(k)), 2, C.gold);
}
