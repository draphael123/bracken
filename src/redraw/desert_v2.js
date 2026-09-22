// src/redraw/desert_v2.js — THE FIVE WEAK DESERT SPRITES, redrawn (the first pass read as stiff boxes: docs/animation-audit.md). Not wired in.
// Each keeps the frame count, the frame ORDER (what each index means), the anchor and the hit box of the set it replaces, so it drops
// in: THE GLASS COLOSSUS and THE SAND WARDEN and THE HOURGLASS KING (desert_glass.js), THE GORGE CRAB (desert_west.js), THE FALLEN HIGH
// PRIEST (desert_tomb.js). px.js primitives only; tools/desert-v2.mjs renders them beside the first pass.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(flipX), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
const frames = (W, H, list) => list.map(fn => { const [c, g] = canvas(W, H); fn(g); outline(c, OUT); return c; });
const thick = (g, x0, y0, x1, y1, col, t = 2) => { for (let k = 0; k < t; k++) line(g, x0 + (k % 2), y0 + (k >> 1), x1 + (k % 2), y1 + (k >> 1), col); };
/* a FACETED slab: the base colour, its upper-left edges lit, its lower-right edges shaded - glass and brass both read by their edges */
function facet(g, pts, base, lit, dark) { fillPoly(g, pts, base); const n = pts.length;
  for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n], nx = y1 - y0, ny = x0 - x1; line(g, x0, y0, x1, y1, (nx + ny) < 0 ? lit : dark); } }

// ================= THE GLASS COLOSSUS (92x78, ax 42 ay 78, box 34x54) =================
// 0 idle | 1,2 walk | 3 LANCE tell (X) | 4 LANCE | 5 STOMP tell (!) | 6 STOMP | 7 SHARDS tell (!) | 8 SHARDS | 9 SWARM tell (X, night)
// | 10 SWARM | 11 OPEN (its own lance reflected into its chest: cracked) | 12 hurt | 13 night idle | 14,15 night walk
export function bakeColossusV2() {
  const W = 92, H = 78, X = 42, F = 77;
  const DAY = { g: '#b8d8a8', gL: '#e8f8d8', gD: '#7aa07a', vein: '#5a7a4a', core: '#fff4b0', coreL: '#ffffff', eye: '#fff0a0', spike: '#d8ecc8' };
  const NIGHT = { g: '#2e4448', gL: '#5a8a88', gD: '#1a2a2e', vein: '#7affc0', core: '#3a6a60', coreL: '#9affd0', eye: '#9affd0', spike: '#44686a' };
  const giant = (g, P, { lean = 0, legL = 0, legR = 0, armL = 'hang', armR = 'hang', core = 0, crack = false, spikes = true, crouch = 0 } = {}) => {
    const x = X + lean, hip = F - 24 + crouch, sh = hip - 22, top = sh - 12;
    // legs: two thick prism pillars; a raised leg lifts its foot by `leg` px
    for (const [s, lift] of [[-1, legL], [1, legR]]) { const fx = x + s * 9, fy = F - lift;
      facet(g, [[x + s * 4 - 4, hip], [x + s * 4 + 5, hip], [fx + 6, fy - 2], [fx - 6, fy - 2]], P.g, P.gL, P.gD); facet(g, [[fx - 8, fy - 4], [fx + 8, fy - 4], [fx + 9, fy], [fx - 9, fy]], P.gD, P.g, P.vein); }
    // the torso: a wedge, broad at the shoulders, veined with the lightning that made it
    facet(g, [[x - 18, sh], [x + 18, sh], [x + 10, hip + 2], [x - 10, hip + 2]], P.g, P.gL, P.gD);
    facet(g, [[x - 10, hip - 4], [x + 10, hip - 4], [x + 8, hip + 4], [x - 8, hip + 4]], P.gD, P.g, P.vein);
    let vx = x - 12, vy = sh + 2; for (let k = 0; k < 6; k++) { const nx = vx + 4, ny = vy + 3 + (k % 2) * 2; line(g, vx, vy, nx, ny, P.vein); vx = nx; vy = ny; }
    vx = x + 14; vy = sh + 4; for (let k = 0; k < 4; k++) { const nx = vx - 3, ny = vy + 4; line(g, vx, vy, nx, ny, P.vein); vx = nx; vy = ny; }
    // the core in its chest: the sun it focuses; brighter as the lance gathers
    const cr = 3 + core * 2; circle(g, x, sh + 9, cr + 1, P.gD); circle(g, x, sh + 9, cr, P.core); if (core) { circle(g, x, sh + 9, Math.max(1, cr - 2), P.coreL); for (const [dx, dy] of [[-8, -2], [8, -2], [0, -9], [-6, 6], [6, 6]]) px(g, x + dx, sh + 9 + dy, P.coreL); }
    if (crack) { let cx = x - 2, cy = sh + 3; for (let k = 0; k < 7; k++) { const nx = cx + (k % 2 ? 3 : -2), ny = cy + 3; line(g, cx, cy, nx, ny, '#ffffff'); cx = nx; cy = ny; } line(g, x, sh + 9, x + 8, sh + 4, '#ffffff'); }
    // shoulder spikes: clusters of crystal that it throws in SHARDS
    if (spikes) for (const s of [-1, 1]) for (const [dx, h] of [[0, 10], [4, 7], [-4, 6]]) facet(g, [[x + s * (14 + dx) - 2, sh + 1], [x + s * (14 + dx), sh - h], [x + s * (14 + dx) + 2, sh + 1]], P.spike, P.gL, P.gD);
    // the head: small against the bulk, a faceted block with one glowing eye
    facet(g, [[x - 6, top + 2], [x + 5, top], [x + 7, sh], [x - 6, sh + 1]], P.g, P.gL, P.gD); rect(g, x + 1, top + 4, 4, 2, P.eye); px(g, x + 4, top + 4, '#ffffff');
    // arms: stacked prisms from the shoulder to a jagged fist; poses by name
    const arm = (s, pose) => { const ax0 = x + s * 16, ay0 = sh + 3; let ex, ey, fx, fy;
      if (pose === 'hang') { ex = ax0 + s * 3; ey = ay0 + 12; fx = ax0 + s * 2; fy = ay0 + 24; }
      else if (pose === 'back') { ex = ax0 - s * 4; ey = ay0 + 10; fx = ax0 - s * 12; fy = ay0 + 14; }
      else if (pose === 'forward') { ex = ax0 + s * 10; ey = ay0 + 4; fx = ax0 + s * 22; fy = ay0 + 4; }
      else if (pose === 'up') { ex = ax0 + s * 4; ey = ay0 - 10; fx = ax0 + s * 2; fy = ay0 - 22; }
      else if (pose === 'down') { ex = ax0 + s * 10; ey = ay0 + 14; fx = ax0 + s * 16; fy = F - 4; }
      thick(g, ax0, ay0, ex, ey, P.gD, 4); thick(g, ax0 - 1, ay0 - 1, ex - 1, ey - 1, P.g, 3); thick(g, ex, ey, fx, fy, P.gD, 4); thick(g, ex - 1, ey - 1, fx - 1, fy - 1, P.g, 3);
      facet(g, [[fx - 5, fy - 4], [fx + 5, fy - 5], [fx + 6, fy + 3], [fx - 4, fy + 5]], P.g, P.gL, P.gD); };
    arm(-1, armL); arm(1, armR);
  };
  const shards = (g, P, y0) => { for (const [dx, dy] of [[-22, -6], [-10, -14], [4, -18], [18, -12], [28, -4]]) facet(g, [[X + dx - 2, y0 + dy + 4], [X + dx, y0 + dy - 3], [X + dx + 2, y0 + dy + 4]], P.spike, P.gL, P.gD); };
  const D = DAY, N = NIGHT;
  const Fr = frames(W, H, [
    g => giant(g, D, {}),                                                                      // 0 idle
    g => giant(g, D, { legL: 4, lean: 1 }), g => giant(g, D, { legR: 4, lean: 1 }),           // 1,2 walk
    g => giant(g, D, { armL: 'back', armR: 'back', core: 2, lean: -2 }),                      // 3 LANCE tell: arms drawn back, the core blazing
    g => { giant(g, D, { armL: 'forward', armR: 'back', core: 1, lean: 2 }); for (let k = 0; k < 4; k++) rect(g, X + 6 + k * 10, 40 + (k % 2), 8, 2, '#fff4b0'); },   // 4 LANCE: the beam leaving
    g => giant(g, D, { legR: 14, armL: 'up', lean: -1 }),                                     // 5 STOMP tell: one foot lifted high
    g => { giant(g, D, { armL: 'down', armR: 'down', crouch: 3 }); for (let k = -3; k <= 3; k++) line(g, X + k * 8, F, X + k * 11, F - 3 - Math.abs(k), D.gL); },   // 6 STOMP: down, the ring of shards up
    g => giant(g, D, { armL: 'up', armR: 'up', spikes: true, core: 1 }),                      // 7 SHARDS tell: arms up, shoulders glinting
    g => { giant(g, D, { armL: 'forward', armR: 'forward', spikes: false }); shards(g, D, 20); },   // 8 SHARDS: the spikes loosed
    g => giant(g, N, { armR: 'up', lean: -1 }),                                               // 9 SWARM tell (night): a fist raised
    g => { giant(g, N, { armR: 'down', crouch: 4, lean: 2 }); for (let k = 0; k < 5; k++) line(g, X + 18 + k * 3, F, X + 22 + k * 4, F - 6, N.vein); },   // 10 SWARM: the fist into the ground
    g => giant(g, D, { crack: true, lean: -4, armL: 'hang', armR: 'back', core: 0 }),         // 11 OPEN: its own lance back into its chest, cracked through
    g => giant(g, D, { lean: -3, armL: 'back', armR: 'hang' }),                               // 12 hurt
    g => giant(g, N, {}), g => giant(g, N, { legL: 4, lean: 1 }), g => giant(g, N, { legR: 4, lean: 1 }),   // 13-15 night: dark glass, the veins lit
  ]);
  return pack(Fr, X, H, 34, 54);
}

// ================= THE SAND WARDEN (48x42, ax 22 ay 42, box 20x26) =================
// 0,1 walk | 2 SLAM tell (!) | 3 SLAM | 4 HALBERD tell (X) | 5 HALBERD lunge-sweep | 6 THROW tell (!) | 7 THROW | 8 OPEN (pinned knee-deep) | 9 hurt
export function bakeSandWardenV2() {
  const W = 48, H = 42, X = 22, F = 41, C = { sand: '#d0a868', sandL: '#ecc888', sandD: '#9a7440', brass: '#c89a3a', brassL: '#f0cc6a', brassD: '#8a6420', eye: '#ffe890', pole: '#6a4a2a', blade: '#d8dce4', bladeD: '#8a909a' };
  const warden = (g, { step = 0, arms = 'rest', halberd = 'rest', sink = 0, lean = 0, tilt = 0 } = {}) => {
    const x = X + lean, hip = F - 9 + sink, sh = hip - 12;
    // halberd behind the body when at rest
    const hal = (x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, C.pole, 2); const dx = x1 - x0, dy = y1 - y0, n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, bx = x1 - ux * 3, by = y1 - uy * 3;
      fillPoly(g, [[bx - uy * 5, by + ux * 5], [x1 + ux * 2, y1 + uy * 2], [bx + uy * 2, by - ux * 2]], C.blade); line(g, bx - uy * 5, by + ux * 5, x1 + ux * 2, y1 + uy * 2, '#ffffff'); px(g, x1 + ux * 4, y1 + uy * 4, C.bladeD); };
    if (halberd === 'rest') hal(x + 9, F - 1, x + 12, sh - 10);
    // legs: thick sand columns in brass greaves (buried to the knee when pinned)
    for (const s of [-1, 1]) { const fx = x + s * 5 + (s === step ? 2 : 0); rect(g, fx - 3, hip, 6, F - hip, C.sandD); rect(g, fx - 3, hip, 6, 2, C.brass); rect(g, fx - 4, F - 2, 8, 2, C.brassD); }
    // the body: packed sand, a brass girdle and a breast-plate with a rivet row
    fillPoly(g, [[x - 11, sh + 2], [x + 11, sh + 2], [x + 9, hip + 1], [x - 9, hip + 1]], C.sand); for (let k = 0; k < 9; k++) px(g, x - 8 + k * 2, sh + 5 + (k % 3) * 3, C.sandD);
    rect(g, x - 9, hip - 3, 18, 3, C.brass); rect(g, x - 9, hip - 3, 18, 1, C.brassL); facet(g, [[x - 6, sh + 3], [x + 6, sh + 3], [x + 5, sh + 9], [x - 5, sh + 9]], C.brass, C.brassL, C.brassD); for (let k = -4; k <= 4; k += 4) px(g, x + k, sh + 5, C.brassL);
    // arms: sand in brass bracers
    const arm = (s, ex, ey) => { thick(g, x + s * 10, sh + 4, ex, ey, C.sandD, 4); thick(g, x + s * 10 - 1, sh + 3, ex - 1, ey - 1, C.sand, 3); rect(g, ex - 3, ey - 2, 6, 5, C.brass); rect(g, ex - 3, ey - 2, 6, 1, C.brassL); };
    if (arms === 'rest') { arm(-1, x - 12, sh + 14); arm(1, x + 12, sh + 13); }
    else if (arms === 'up') { arm(-1, x - 8, sh - 10); arm(1, x + 8, sh - 11); }
    else if (arms === 'slam') { arm(-1, x + 8, F - 4); arm(1, x + 14, F - 4); for (let k = 0; k < 6; k++) px(g, x + 6 + k * 3, F - 6 - (k % 3) * 2, C.sandL); }
    else if (arms === 'throwBack') { arm(-1, x - 10, sh + 12); arm(1, x - 6, sh - 6); circle(g, x - 6, sh - 8, 3, C.sandL); }
    else if (arms === 'throw') { arm(-1, x - 10, sh + 12); arm(1, x + 18, sh + 2); for (let k = 0; k < 7; k++) px(g, x + 22 + k * 3, sh + (k % 3) - 1, C.sandL); }
    else if (arms === 'halberd') { arm(-1, x + 2, sh + 10); arm(1, x + 6, sh + 8); }
    if (halberd === 'back') hal(x + 4, sh + 9, x - 16, F - 4);
    if (halberd === 'sweep') { hal(x + 4, sh + 10, x + 24, F - 3); for (let k = 0; k < 5; k++) px(g, x + 10 + k * 3, F - 1 - (k % 2), C.sandL); }
    // the helm: a brass dome over a sand face, one lit slit for an eye, a crest fin
    const hx = x + 1 + tilt, hy = sh - 3; ellipse(g, hx, hy, 6, 5, C.brass); ellipse(g, hx - 2, hy - 2, 3, 2, C.brassL); rect(g, hx - 5, hy + 2, 10, 2, C.brassD); rect(g, hx, hy, 5, 2, '#2a1e10'); rect(g, hx + 1, hy, 3, 1, C.eye); rect(g, hx - 1, hy - 8, 2, 4, C.brassD);
    if (sink) { ellipse(g, x, F - 1, 16, 4, C.sandL); for (let k = 0; k < 8; k++) px(g, x - 14 + k * 4, F - 4, C.sand); }
  };
  const Fr = frames(W, H, [g => warden(g, { step: 1 }), g => warden(g, { step: -1, lean: 1 }),
    g => warden(g, { arms: 'up', lean: -1 }), g => warden(g, { arms: 'slam', lean: 2 }),
    g => warden(g, { arms: 'halberd', halberd: 'back', lean: -2 }), g => warden(g, { arms: 'halberd', halberd: 'sweep', lean: 4 }),
    g => warden(g, { arms: 'throwBack', lean: -1 }), g => warden(g, { arms: 'throw', lean: 1 }),
    g => warden(g, { sink: 8, tilt: 2, arms: 'up' }), g => warden(g, { lean: -3, tilt: -1 })]);
  return pack(Fr, X, H, 20, 26);
}

// ================= THE HOURGLASS KING (60x60, ax 28 ay 60, box 22x38; sandLevel 0 empty .. 2 full) =================
// 0 idle | 1,2 walk | 3 STREAM tell (X) | 4 STREAM | 5 GEAR tell (!) | 6 GEAR toss | 7 SLIP tell (X: an afterimage) | 8 SLIP | 9 PENDULUM tell (!)
// | 10 PENDULUM | 11 STALLED (the glass empty, frozen) | 12 TURNING OVER (inverted) | 13 hurt
export function bakeHourglassKingV2(sandLevel = 2) {
  const W = 60, H = 60, X = 28, F = 59, C = { brass: '#c8a040', brassL: '#f0d070', brassD: '#8a6a20', cape: '#5a2a6a', capeL: '#7a3e8e', capeD: '#3a1a46', glass: '#c8e8f0', sand: '#e8c070', steel: '#6a7078', face: '#d8c8a0', eye: '#2a1a10', gem: '#c83a3a', ghost: '#8a90b8' };
  const king = (g, { step = 0, sceptre = 'rest', lean = 0, sand = sandLevel, frozen = false, bow = 0, ghost = false } = {}) => {
    const P = frozen ? { ...C, brass: '#9a9488', brassL: '#bab4a8', brassD: '#6a665e', cape: '#4a4450', capeL: '#5e5866', capeD: '#34303a' } : ghost ? { ...C, brass: C.ghost, brassL: '#b8bee0', brassD: '#5a6090', cape: '#6a7098', capeL: '#8a90b8', capeD: '#4a5078', face: '#b8bee0' } : C;
    const x = X + lean, hip = F - 14, sh = hip - 18;
    // the cape behind, sweeping to the floor
    fillPoly(g, [[x - 8, sh], [x + 6, sh], [x + 12, F - 1], [x - 14, F - 1]], P.capeD); line(g, x - 8, sh, x - 14, F - 1, P.cape);
    // legs: brass, jointed at the knee by a gear
    for (const s of [-1, 1]) { const fx = x + s * 4 + (s === step ? 3 : 0); thick(g, x + s * 3, hip, fx, F - 2, P.brassD, 3); circle(g, (x + s * 3 + fx) / 2, (hip + F) / 2 - 1, 2, P.brass); rect(g, fx - 2, F - 2, 5, 2, P.brassD); }
    // the HOURGLASS chest: two glass bulbs in a brass frame, the sand in the lower one as full as the fight has left it
    rect(g, x - 8, sh, 16, 2, P.brass); rect(g, x - 8, hip - 2, 16, 2, P.brass); rect(g, x - 8, sh, 2, hip - sh, P.brassD); rect(g, x + 6, sh, 2, hip - sh, P.brassD);
    const my = (sh + hip) >> 1; fillPoly(g, [[x - 6, sh + 2], [x + 6, sh + 2], [x + 1, my], [x - 1, my]], P.glass); fillPoly(g, [[x - 1, my], [x + 1, my], [x + 6, hip - 2], [x - 6, hip - 2]], P.glass);
    if (!frozen) { const lvl = [0, 4, 7][sand]; if (lvl) fillPoly(g, [[x - 6 + (7 - lvl) * 0.2, hip - 2 - lvl], [x + 6 - (7 - lvl) * 0.2, hip - 2 - lvl], [x + 6, hip - 2], [x - 6, hip - 2]], P.sand);
      const top = [6, 3, 1][sand]; if (top) fillPoly(g, [[x - 5 + (6 - top) * 0.5, sh + 2 + (6 - top)], [x + 5 - (6 - top) * 0.5, sh + 2 + (6 - top)], [x + 1, my], [x - 1, my]], P.sand); line(g, x, my, x, hip - 3, P.sand); }
    px(g, x - 4, sh + 3, '#ffffff'); px(g, x + 3, hip - 5, '#ffffff');
    // gear pauldrons
    for (const s of [-1, 1]) { circle(g, x + s * 10, sh + 2, 4, P.brass); circle(g, x + s * 10, sh + 2, 2, P.brassD); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; px(g, x + s * 10 + Math.round(Math.cos(a) * 5), sh + 2 + Math.round(Math.sin(a) * 5), P.brassD); } }
    // the arms and the sceptre (a pendulum weight on its end)
    const arm = (s, ex, ey) => { thick(g, x + s * 10, sh + 5, ex, ey, P.brassD, 3); circle(g, ex, ey, 2, P.brass); };
    const sep = (x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, P.steel, 2); circle(g, x1, y1, 4, P.brass); circle(g, x1, y1, 2, P.gem); };
    arm(-1, x - 12, sh + 16);
    if (sceptre === 'rest') { arm(1, x + 12, sh + 14); sep(x + 12, sh + 14, x + 14, sh - 8); }
    else if (sceptre === 'up') { arm(1, x + 8, sh - 6); sep(x + 8, sh - 6, x + 6, sh - 26 + 4); }
    else if (sceptre === 'point') { arm(1, x + 16, sh + 4); sep(x + 16, sh + 4, x + 28, sh + 8); }
    else if (sceptre === 'back') { arm(1, x - 4, sh + 2); sep(x - 4, sh + 2, x - 20, sh - 6); }
    else if (sceptre === 'swing') { arm(1, x + 14, sh + 8); sep(x + 14, sh + 8, x + 26, F - 10); for (let k = 0; k < 5; k++) px(g, x + 18 + k * 3, sh - 2 + k * 5, '#ffffff'); }
    // the head: a brass mask under a crown of cog-teeth, bowed when stalled
    const hx = x + 1, hy = sh - 7 + bow; ellipse(g, hx, hy, 5, 5.4, P.face); rect(g, hx - 2, hy - 1, 2, 2, P.eye); rect(g, hx + 2, hy - 1, 2, 2, P.eye); rect(g, hx - 2, hy + 3, 5, 1, P.brassD);
    rect(g, hx - 6, hy - 6, 12, 2, P.brass); for (let k = -5; k <= 5; k += 3) rect(g, hx + k, hy - 9, 2, 3, P.brassL); px(g, hx, hy - 7, P.gem);
  };
  const cog = (g, cx, cy) => { circle(g, cx, cy, 4, C.brass); circle(g, cx, cy, 1.5, C.brassD); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; rect(g, cx + Math.round(Math.cos(a) * 5) - 1, cy + Math.round(Math.sin(a) * 5) - 1, 2, 2, C.brassD); } };
  const Fr = frames(W, H, [
    g => king(g, {}), g => king(g, { step: 1, lean: 1 }), g => king(g, { step: -1, lean: 1 }),
    g => { king(g, { sceptre: 'up' }); for (let k = 0; k < 6; k++) px(g, X + 6, 2 + k * 3, C.sand); },          // 3 STREAM tell: the sceptre raised to the roof, sand beginning to fall
    g => king(g, { sceptre: 'point', lean: 1 }),                                                              // 4 STREAM
    g => { king(g, { sceptre: 'back', lean: -1 }); cog(g, X - 16, 18); },                                    // 5 GEAR tell: a cog drawn back
    g => { king(g, { sceptre: 'point', lean: 2 }); cog(g, X + 26, 34); },                                    // 6 GEAR toss
    g => { king(g, { ghost: true, lean: -6 }); king(g, { lean: 2 }); },                                      // 7 SLIP tell: his afterimage where he was
    g => king(g, { sceptre: 'swing', lean: 3 }),                                                             // 8 SLIP: the strike from the past
    g => king(g, { sceptre: 'back', lean: -2 }),                                                             // 9 PENDULUM tell: swung back
    g => king(g, { sceptre: 'swing', lean: 2 }),                                                             // 10 PENDULUM: the sweep
    g => king(g, { frozen: true, bow: 3, sand: 0 }),                                                         // 11 STALLED: the glass run out, grey, bowed
    g => { const [c2, g2] = canvas(W, H); king(g2, { sand: 0 }); g.save(); g.translate(0, H); g.scale(1, -1); g.drawImage(c2, 0, 8); g.restore(); },   // 12 TURNING OVER: himself upside down
    g => king(g, { lean: -3, bow: -1 }),                                                                     // 13 hurt
  ]);
  return pack(Fr, X, H, 22, 38);
}

// ================= THE GORGE CRAB (36x20, ax 16 ay 20, box 24x10) =================
// 0,1 sidle | 2 PINCH TELL (!) | 3 PINCH | 4 SHELL-UP GUARD | 5 hurt
export function bakeGorgeCrabV2() {
  const W = 36, H = 20, X = 16, F = 19, C = { shell: '#c86a4a', shellL: '#e89070', shellD: '#8a4430', bump: '#a85a3e', claw: '#b85a3a', clawL: '#e88a64', clawD: '#7a3a24', leg: '#9a4a30', eye: '#1a1010', stalk: '#c87a5a', belly: '#e8c0a0' };
  const crab = (g, { legPh = 0, claws = 'rest', low = 0, flinch = 0 } = {}) => {
    const cy = F - 7 + low, x = X + flinch;
    // legs: three jointed a side, splayed, the phase shuffling them
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const kx = x + s * (4 + k * 3), ph = (k + legPh) % 2 ? 1 : -1, knx = kx + s * 5, kny = cy - 2 + ph, fx = kx + s * 8, fy = F;
      line(g, kx, cy + 1, knx, kny, C.leg); line(g, knx, kny, fx, fy - (low ? 1 : 0), C.leg); px(g, knx, kny, C.clawD); }
    // the shell: wide and flat, a serrated front edge, bumps
    ellipse(g, x, cy, 11, 5, C.shell); ellipse(g, x - 2, cy - 2, 7, 2.2, C.shellL); rect(g, x - 9, cy + 3, 18, 2, C.belly);
    for (let k = -9; k <= 9; k += 3) px(g, x + k, cy - 5 + (Math.abs(k) > 6 ? 1 : 0), C.shellD);                       // the serrated rim
    for (const [dx, dy] of [[-5, -1], [0, -3], [5, -1], [-2, 1], [3, 1]]) px(g, x + dx, cy + dy, C.bump);
    // eyestalks
    for (const s of [-1, 1]) { line(g, x + 3 + s * 2, cy - 4, x + 3 + s * 3, cy - 8 + (low ? 2 : 0), C.stalk); rect(g, x + 2 + s * 3, cy - 9 + (low ? 2 : 0), 2, 2, C.eye); }
    // the claws: the big one forward (right), the small one tucked
    const claw = (bx, by, size, open, up) => { const s = size; ellipse(g, bx, by, 3 * s, 2.2 * s, C.claw); ellipse(g, bx - s, by - s, 1.6 * s, 1 * s, C.clawL);
      fillPoly(g, [[bx + 2 * s, by - 1 - up], [bx + 5 * s, by - 2 * s - open - up], [bx + 3 * s, by - up]], C.claw); fillPoly(g, [[bx + 2 * s, by + 1], [bx + 5 * s, by + s + open], [bx + 3 * s, by + 1]], C.clawD); };
    if (claws === 'rest') { line(g, x + 9, cy, x + 13, cy - 1, C.claw); claw(x + 15, cy - 1, 1.4, 0, 0); claw(x + 10, cy + 3, 0.9, 0, 0); }
    else if (claws === 'raised') { line(g, x + 8, cy - 2, x + 12, cy - 8, C.claw); claw(x + 13, cy - 10, 1.4, 3, 2); claw(x + 9, cy - 6, 0.9, 2, 1); }
    else if (claws === 'snap') { line(g, x + 9, cy, x + 16, cy, C.claw); claw(x + 19, cy, 1.4, -1, 0); claw(x + 12, cy + 3, 0.9, 0, 0); for (const dx of [26, 28]) px(g, x + dx, cy - 2, '#ffffff'); }
    else if (claws === 'guard') { claw(x + 6, cy - 3, 1.4, 0, 0); claw(x + 2, cy - 1, 1, 0, 0); }
  };
  const Fr = frames(W, H, [g => crab(g, { legPh: 0 }), g => crab(g, { legPh: 1 }), g => crab(g, { claws: 'raised' }), g => crab(g, { claws: 'snap' }), g => crab(g, { claws: 'guard', low: 2 }), g => crab(g, { flinch: -2, claws: 'raised' })]);
  return pack(Fr, X, H, 24, 10);
}

// ================= THE FALLEN HIGH PRIEST (46x80, ax 23 ay 80, box 16x50) =================
// 0 idle | 1,2 walk | 3-4 BOLT (! tell, strike) | 5-6 SWEEP (X) | 7-8 GRASP (X) | 9-10 SNUFF | 11 OPEN (burning in a sunbeam) | 12 hurt
export function bakeHighPriestV2() {
  const W = 46, H = 80, X = 23, F = 79, C = { robe: '#2a2440', robeL: '#443c66', robeD: '#16122a', trim: '#8a7a9a', face: '#c8c0b8', faceD: '#8a8078', eye: '#1a1428', gold: '#e8c24a', goldD: '#9a7418', staff: '#5a4a3a', smoke: '#5a5470', dark: '#3a2a5a', darkL: '#8a6ac8', sun: '#fff0b0' };
  const priest = (g, { step = 0, staff = 'rest', hands = 'rest', crouch = 0, lean = 0, burn = false } = {}) => {
    const x = X + lean, top = 10 + crouch, sh = top + 12, hem = F - 1;
    // the robe: tall and narrow, widening to a tattered hem that trails smoke
    fillPoly(g, [[x - 5, sh], [x + 5, sh], [x + 9 + step, hem], [x - 9 + step, hem]], C.robe); line(g, x + 5, sh, x + 9 + step, hem, C.robeL); line(g, x - 5, sh, x - 9 + step, hem, C.robeD);
    for (let k = -8; k <= 8; k += 3) { rect(g, x + k + step, hem - 1, 2, 2, C.robeD); px(g, x + k + step + 1, hem - 4 - (k & 3), C.smoke); }
    rect(g, x - 1, sh + 2, 2, hem - sh - 6, C.trim);                                                                         // the stole, grey that was gold
    // the arms (sleeves) and the staff: taller than he is, a broken sun-disc on top
    const sleeve = (s, ex, ey) => { thick(g, x + s * 5, sh + 2, ex, ey, C.robe, 3); rect(g, ex - 1, ey - 1, 3, 3, C.face); };
    const stf = (x0, y0, x1, y1) => { thick(g, x0, y0, x1, y1, C.staff, 2); circle(g, x1, y1, 5, C.gold); circle(g, x1, y1, 3, C.goldD); fillPoly(g, [[x1, y1 - 6], [x1 + 6, y1 - 1], [x1 + 1, y1 + 1]], '#00000000'); line(g, x1 - 2, y1 - 5, x1 + 3, y1 + 4, C.robeD); };
    if (staff === 'rest') { sleeve(1, x + 9, sh + 16); stf(x + 9, F - 1, x + 11, top - 6); }
    else if (staff === 'overhead') { sleeve(1, x + 4, sh - 10); stf(x + 2, sh + 10, x + 6, top - 16); circle(g, x + 6, top - 16, 3, C.dark); px(g, x + 6, top - 16, C.darkL); }
    else if (staff === 'thrust') { sleeve(1, x + 12, sh + 4); stf(x - 4, sh + 8, x + 22, sh + 2); circle(g, x + 28, sh + 1, 3, C.dark); circle(g, x + 28, sh + 1, 1, C.darkL); }
    else if (staff === 'back') { sleeve(1, x - 4, sh + 10); stf(x + 8, sh + 4, x - 16, F - 8); }
    else if (staff === 'sweep') { sleeve(1, x + 12, sh + 14); stf(x - 2, sh + 6, x + 20, F - 4); for (let k = 0; k < 6; k++) px(g, x - 8 + k * 4, F - 2 - (k % 2), C.darkL); }
    else if (staff === 'low') { sleeve(1, x + 8, sh + 18); stf(x + 8, F - 1, x + 10, top); }
    if (hands === 'rest') sleeve(-1, x - 9, sh + 16);
    else if (hands === 'floor') sleeve(-1, x - 12, F - 3);
    else if (hands === 'up') { sleeve(-1, x - 8, top - 8); if (staff === 'none') sleeve(1, x + 8, top - 8); }
    else if (hands === 'fist') { sleeve(-1, x - 4, sh - 2); for (let k = 0; k < 5; k++) px(g, x - 10 + k * 3, sh - 8 - (k % 2) * 3, C.sun); }
    // the head: gaunt, hooded, the cracked sun-disc crown
    const hx = x + 1, hy = top + 6; fillPoly(g, [[hx - 6, hy + 5], [hx - 5, hy - 4], [hx, hy - 7], [hx + 5, hy - 4], [hx + 6, hy + 5]], C.robeD);
    ellipse(g, hx, hy, 3.4, 4.2, C.face); rect(g, hx - 2, hy - 1, 1, 2, C.eye); rect(g, hx + 1, hy - 1, 1, 2, C.eye); rect(g, hx - 2, hy + 2, 4, 1, C.faceD);
    fillPoly(g, [[hx - 5, hy - 6], [hx - 2, hy - 13], [hx + 1, hy - 9], [hx - 1, hy - 6]], C.gold); fillPoly(g, [[hx + 1, hy - 7], [hx + 4, hy - 12], [hx + 6, hy - 6]], C.goldD);   // the disc, broken in two
    if (burn) { for (let y = 0; y < H; y += 2) rect(g, x - 7, y, 14, 1, y % 4 ? '#fff4c0' : C.sun); for (let k = 0; k < 8; k++) px(g, x - 6 + k * 2, sh + (k * 7) % 40, '#ff9a3a'); }
  };
  const Fr = frames(W, H, [
    g => priest(g, {}), g => priest(g, { step: 1, lean: 1 }), g => priest(g, { step: -1, lean: 1 }),
    g => priest(g, { staff: 'overhead', lean: -1 }), g => priest(g, { staff: 'thrust', lean: 2 }),           // 3-4 BOLT: overhead, the dark gathering; then thrust
    g => priest(g, { staff: 'back', lean: -2 }), g => priest(g, { staff: 'sweep', lean: 2 }),                // 5-6 SWEEP: drawn back low, swept
    g => priest(g, { staff: 'low', hands: 'floor', crouch: 8 }), g => { priest(g, { staff: 'low', hands: 'floor', crouch: 6 }); for (const dx of [-14, -8, 14]) { line(g, X + dx, F - 1, X + dx, F - 8, C.dark); px(g, X + dx, F - 9, C.darkL); } },   // 7-8 GRASP
    g => priest(g, { staff: 'rest', hands: 'up' }), g => priest(g, { staff: 'rest', hands: 'fist' }),        // 9-10 SNUFF: the arm up to the window; the light closed in a fist
    g => { for (let y = 0; y < H; y += 3) rect(g, X - 10, y, 18, 2, y % 6 ? '#fff4c0' : C.sun); priest(g, { lean: -2, hands: 'up' }); for (let k = 0; k < 9; k++) px(g, X - 8 + k * 2, 30 + (k * 7) % 40, '#ff9a3a'); for (let k = 0; k < 5; k++) px(g, X - 6 + k * 3, 14 - (k % 2) * 3, C.smoke); },   // 11 OPEN: burning in the sunbeam (the beam behind him, embers on him)
    g => priest(g, { lean: -3 }),                                                                          // 12 hurt
  ]);
  return pack(Fr, X, H, 16, 50);
}
export const DESERT_V2 = { colossus: bakeColossusV2, warden: bakeSandWardenV2, hourglass: bakeHourglassKingV2, crab: bakeGorgeCrabV2, highpriest: bakeHighPriestV2 };
