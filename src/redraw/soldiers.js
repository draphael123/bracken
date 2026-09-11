// soldiers.js — three new troops of the Goblin Queen's army (purple tabards, gold crowns). New bakers, not redraws.
// All frames face RIGHT (L is the flip). Every frame of a sprite shares one canvas, so the anchor holds across frames.
// Anchors follow chars.js: ax = the body's centre column, ay = the outline row just under the feet (feet on ay-1).
// Parts are char grids stamped onto a blank frame grid; limbs, blades and the knight's plates are rasterised into the
// same grid (limb()), and parts that cross the body are laid with an inner outline (layer()), then fromGrid + OUT outline.
//
// bakeSoldier()  GOBLIN SOLDIER — a line soldier: iron nasal cap with cheek guards, mail sleeves and skirt under the
//   purple tabard, round shield (steel rim, purple field, gold crown) held forward, short sword, leather boots.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (shield forward, sword low behind)
//           4 guard (shield up in front of the face, knees bent), 5 slash tell (sword raised back over the shoulder,
//           body and head wound back), 6 slash (lunge, arm flung out past the shield, blade swept down ahead, smear arc)
//   canvas 30x24 (grid 28x22; 17 px feet to helm)   anchor ax 14, ay 23   pack w/h 10x14
//
// bakeJavelineer()  GOBLIN JAVELINEER — light troop: leather cap with a peak, padded jerkin with a cross-strap and a
//   purple sash, a quiver of three javelins on his back (tips over the shoulder), one javelin in hand.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (javelin carried upright in the front hand)
//           4 aim (javelin drawn back level behind his head, tip past his nose, front arm pointing, leaning back),
//           5 throw (throwing arm whipped out in front, hand open and EMPTY, leaning forward, smear arc),
//           6 idle (standing, javelin grounded)
//   canvas 28x21 (grid 26x19; 15 px feet to cap)   anchor ax 13, ay 20   pack w/h 8x12
//
// bakeHeavyKnight()  GOBLIN HEAVY KNIGHT — a big goblin sealed in full plate: horned great helm with a gold band and
//   a visor slit with two glowing eyes, layered pauldrons with gold rims, plated arms and legs, purple tabard with a
//   gold crown, and a huge two-handed greatsword. No skin shows.
//   frames: 0 walk contact, 1 pass (far foot stamped up), 2 contact (other foot), 3 pass (near foot up) — the body drops
//           a row on each contact; the greatsword is dragged in the back hand, point trailing on the ground behind;
//           4 raise (greatsword lifted overhead in both hands, blade back, leaning back, eyes flare — the long tell),
//           5 slam (crouched and lunging, blade driven down ahead, point at the ground with chips flying, eyes flare),
//           6 guard (blade held upright in front of him as a block)
//   canvas 50x38 (grid 48x36; 25 px feet to horn tips)   anchor ax 25, ay 37   pack w/h 16x22
import { px, fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

// same as chars.js (whiten through a lambda: .map(whiten) would pass the index as the colour and bake black sheets)
function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
// a char grid to lay parts onto: stamp() writes a block of rows at (x, y), '.' is see-through
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k === ' ' ? '.' : k; } });
const rowsOf = G => G.map(r => r.join(''));
// draw a part on its own grid, then lay it over G with a 1-px OUT line wherever it sits on something already drawn,
// so a limb or a helm reads against the body behind it the way a hand-drawn sprite's inner lines do
function layer(G, fn) {
  const h = G.length, w = G[0].length, T = blank(w, h);
  fn(T);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (T[y][x] !== '.') continue;
    const by = (T[y - 1] && T[y - 1][x] !== '.') || (T[y + 1] && T[y + 1][x] !== '.') || (x > 0 && T[y][x - 1] !== '.') || (x + 1 < w && T[y][x + 1] !== '.');
    if (by && G[y][x] !== '.') G[y][x] = 'o';
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (T[y][x] !== '.') G[y][x] = T[y][x];
}

// a swing's smear: a pale arc of radius r round (cx, cy) in canvas pixels, from angle a0 to a1 (degrees, 0 = ahead,
// -90 = straight up), drawn after the outline and only on empty pixels; the last 60% gets a second, bluer band inside
function smear(c, cx, cy, r, a0, a1) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#dfe8ff'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#a9b8d8' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}

// ---------- SOLDIER ----------
// skin g/G/h, eye e + OUT pupil, tusk t; steel l/s/S/i (glint, light, mid, dark); mail m/M; tabard v/b/B; gold y/z; boots w/W
const SOL = { o: OUT, e: '#f3f0d2', t: '#f0e6c8', g: '#6faa4a', G: '#3f6e2c', h: '#8fc85a',
  l: '#eef2f8', s: '#c9d1dc', S: '#8a93a3', i: '#555d6b',
  m: '#9aa2ae', M: '#5f6674', b: '#5d4a8a', B: '#3e2f63', v: '#7d68ab',
  y: '#e0b040', z: '#a0781c', w: '#8a5a32', W: '#5c3a1d' };

export function bakeSoldier() {
  const W = 28, H = 22;
  const q = G => outline(fromGrid(rowsOf(G), SOL, 1), OUT);
  const HEAD = [
    '.....lsssS...',
    '....lsssssSi.',
    '...lssssssSi.',
    '..iSlSSSlSSi.',
    'hgGSSggeoSg..',
    '.GGSSgggggggg',
    '...iiGggtgG..',
  ];
  const TORSO = [
    '...vbbbbbB',
    '...vbbbbbB',
    '...vbbbbbB',
    '...wwwywwW',
    '...vbbbbbB',
    '...mMmMmM.',
  ];
  const ARM_LOW = ['.mM', 'mMM', 'mM.', 'gG.'];
  const SHIELD = [
    '..lsssi..',
    '.svvbbbi.',
    'svybybybi',
    'svyyyyybi',
    'svbzzzbBi',
    'sbbbbbbBi',
    '.sbbbbBi.',
    '..iiiii..',
  ];
  const LEGS = {
    a: ['...GG..gG..', '..GG....gG.', '.WWW....wwW', '.WWW....WWW'],
    b: ['....GGgG...', '...GG.gG...', '..WW..wwW..', '......WWW..'],
    c: ['...gG..GG..', '..gG....GG.', '.wwW....WWW', '.WWW....WWW'],
    d: ['....gGGG...', '...gG.GG...', '..wW..WWW..', '......WWW..'],
    bent: ['..GG....gG..', '.GGW....wwW.', 'WWWW....WWWW'],
    lunge: ['.GG.....gGG.', 'GW.......gG.', 'WW.......wwW', '.........WWW'],
  };
  const SWORD_LOW = ['...Wy', '..sy.', '.s...', 's....'];
  // sword raised behind the head, blade tilted back: tip on row 0
  const TELL = ['.l....', '.s....', '..s...', '..s...', '.yyy..', '..gG..', '..gG..', '.gG...', '.mM...', '.mM...', '..mM..', '..mMM.', '...mMM'];
  // arm flung forward over the shield, blade swept down in front
  const SLASH = [
    '....mmmm...........',
    '....MMmmmgg........',
    '.......MMGGgGy.....',
    '.............yss...',
    '...............ss..',
    '.................sl'];
  const frame = ({ legs, dx = 0, dy = 0, hx = 0, pose = 'walk', sh = [15, 11] }) => {
    const G = blank(W, H);
    if (pose === 'walk') { stamp(G, 3 + dx, 15 + dy, SWORD_LOW); stamp(G, 7 + dx, 12 + dy, ARM_LOW); }
    if (pose === 'tell') stamp(G, 2 + dx, 0, TELL);
    if (pose === 'slash') stamp(G, sh[0], sh[1], SHIELD);
    const L = LEGS[legs]; stamp(G, 8 + dx, H - L.length, L);
    stamp(G, 7 + dx, 12 + dy, TORSO);
    stamp(G, 6 + dx + hx, 5 + dy, HEAD);
    if (pose !== 'slash') layer(G, g => stamp(g, sh[0], sh[1], SHIELD));
    if (pose === 'slash') layer(G, g => stamp(g, 7 + dx, 12 + dy, SLASH));
    const c = q(G);
    if (pose === 'slash') smear(c, 1 + 13 + dx, 1 + 13 + dy, 13, -78, 18);
    return c;
  };
  return pack([
    frame({ legs: 'a' }), frame({ legs: 'b' }), frame({ legs: 'c' }), frame({ legs: 'd' }),
    frame({ legs: 'bent', dy: 1, sh: [14, 8] }),
    frame({ legs: 'bent', dx: -1, hx: -1, pose: 'tell', sh: [13, 12] }),
    frame({ legs: 'lunge', dx: 1, dy: 1, hx: 1, pose: 'slash', sh: [3, 12] }),
  ], 14, 23, 10, 14);
}
// ---------- JAVELINEER ----------
// skin g/G/h, eye e, tusk t; leather cap/quiver u/w/W; padded jerkin k/j/J; sash v/b/B; ash shafts f/F; steel tips l/s
const JAV = { o: OUT, e: '#f3f0d2', t: '#f0e6c8', g: '#6faa4a', G: '#3f6e2c', h: '#8fc85a',
  u: '#b0804a', w: '#8a5a32', W: '#5c3a1d', j: '#9a8452', J: '#6a5a36', k: '#c4ae78',
  b: '#5d4a8a', B: '#3e2f63', v: '#7d68ab', f: '#d0a868', F: '#8a6a3a', s: '#c9d1dc', l: '#eef2f8' };

export function bakeJavelineer() {
  const W = 26, H = 19;
  const q = G => outline(fromGrid(rowsOf(G), JAV, 1), OUT);
  const HEAD = [
    '...uwwwW...',
    '..uwwwwwwW.',
    'h.WWWWWWWWW',
    'hgGggeoggg.',
    '.GgggggtgGg',
    '..gGGGGGG..',
  ];
  const TORSO = [
    '..kjjjjJ.',
    '..kjWjjJ.',
    '..kjjWjJ.',
    '.vbbbbbbB',
    '.b.jJjJj.',
  ];
  // the quiver on his back: a leather tube, three javelins over the shoulder, tips up and back, staggered
  const QUIVER = [
    's.......',
    '.Fs.....',
    '..F.s...',
    '..F.F...',
    '...FwF..',
    '...WwwW.',
    '...WwW..',
  ];
  const LEGS = {
    a: ['..GG..gG..', '.GG....gG.', '.WW....wW.', 'WWW....WWW'],
    b: ['...GGgG...', '..GG.gG...', '..W..wW...', '.....WWW..'],
    c: ['..gG..GG..', '.gG....GG.', '.wW....WW.', 'WWW....WWW'],
    d: ['...gGGG...', '..gG.GG...', '..w..WW...', '.....WWW..'],
    stand: ['...GG.gG..', '...GG.gG..', '...WW.wW..', '..WWW.WWW.'],
    brace: ['..GG...gG..', '.GG.....gG.', 'WW......wW.', 'WW......WWW'],
    lean: ['...GG..gG...', '..GG....gG..', '.WW......wW.', 'WW.......WWW'],
  };
  const JAVELIN_UP = ['l', 's', 'F', 'f', 'f', 'f', 'f', 'f', 'f', 'f', 'f', 'f', 'f', 'F', 'F'];
  const ARM_CARRY = ['.gg', 'gG.', 'gG.'];
  // aim: the throwing arm drawn right back, the javelin along it behind his head, tip past his nose
  const AIM_BACK = [
    '..................sl',
    '.............ffffF..',
    '........fffff.......',
    'FFfgGfff............',
    '...GgGggg...........',
  ];
  const AIM_FRONT = ['gggggG', '.GGGG.'];
  // throw: the arm whipped through and out in front, the hand open and empty; the other arm flung back
  const THROW_BACK = ['..gg', '.gG.', 'gG..'];
  const THROW_ARM = ['jjjgg.....', '.JJGGgg...', '....GGgggg', '.......g.g'];
  const frame = ({ legs, dx = 0, dy = 0, hx = 0, pose }) => {
    const G = blank(W, H), X = 2 + dx;
    const L = LEGS[legs]; stamp(G, X + 6, H - L.length, L);
    if (pose === 'aim') stamp(G, 0, 6 + dy, AIM_BACK);
    if (pose === 'throw') stamp(G, X + 3, 11 + dy, THROW_BACK);
    stamp(G, X + 2 + hx, 3 + dy, QUIVER);
    stamp(G, X + 6, 10 + dy, TORSO);
    stamp(G, X + 5 + hx, 4 + dy, HEAD);
    if (pose === 'carry') layer(G, g => { stamp(g, X + 15, 1 + dy, JAVELIN_UP); stamp(g, X + 13, 11 + dy, ARM_CARRY); });
    if (pose === 'idle') layer(G, g => { stamp(g, X + 15, 3, JAVELIN_UP.concat(['F'])); stamp(g, X + 13, 11 + dy, ARM_CARRY); });
    if (pose === 'aim') layer(G, g => stamp(g, X + 13, 11 + dy, AIM_FRONT));
    if (pose === 'throw') layer(G, g => stamp(g, X + 10, 10 + dy, THROW_ARM));
    const c = q(G);
    if (pose === 'throw') smear(c, 1 + X + 11, 1 + 11 + dy, 8, -115, -8);
    return c;
  };
  return pack([
    frame({ legs: 'a', pose: 'carry' }), frame({ legs: 'b', pose: 'carry' }), frame({ legs: 'c', pose: 'carry' }), frame({ legs: 'd', pose: 'carry' }),
    frame({ legs: 'brace', dx: -1, hx: -2, dy: 1, pose: 'aim' }),
    frame({ legs: 'lean', dx: 1, hx: 1, pose: 'throw' }),
    frame({ legs: 'stand', pose: 'idle' }),
  ], 13, 20, 8, 12);
}
// a capsule from a to b (pixel coords), `w` thick, written into a char grid; each pixel takes the char of the side it
// faces: ramp = [dark, base, light], light from the upper left
function limb(G, a, b, w, ramp) {
  const ax = a[0] + 0.5, ay = a[1] + 0.5, bx = b[0] + 0.5, by = b[1] + 0.5, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, r = w / 2;
  for (let y = Math.floor(Math.min(ay, by) - r); y <= Math.ceil(Math.max(ay, by) + r); y++) for (let x = Math.floor(Math.min(ax, bx) - r); x <= Math.ceil(Math.max(ax, bx) + r); x++) {
    const row = G[y]; if (!row || x < 0 || x >= row.length) continue;
    const t = Math.max(0, Math.min(1, ((x + 0.5 - ax) * dx + (y + 0.5 - ay) * dy) / L2)), ox = x + 0.5 - ax - dx * t, oy = y + 0.5 - ay - dy * t, d = Math.hypot(ox, oy);
    if (d > r) continue;
    const s = d < 0.3 ? 0 : (-ox * 0.6 - oy * 0.8) / d;
    row[x] = s > 0.4 ? ramp[2] : s < -0.4 ? ramp[0] : ramp[1];
  }
}

// ---------- HEAVY KNIGHT ----------
// plate l/s/S/i/I (far limbs use the darker end), mail M; glowing eyes r/E; tabard v/b/B; gold Y/y/z; horns k/K;
// grip w/W; ground chips d/D
const HK = { o: OUT, r: '#ff5a2a', E: '#ffd36b',
  l: '#eef2f8', s: '#c9d1dc', S: '#8a93a3', i: '#5a6270', I: '#3a3e48', M: '#4a505c',
  b: '#5d4a8a', B: '#3e2f63', v: '#7d68ab', y: '#e0b040', Y: '#fff1a0', z: '#a0781c',
  k: '#f0e6c8', K: '#b8a888', w: '#8a5a32', W: '#5c3a1d', d: '#8a7a68', D: '#5a4e42' };

export function bakeHeavyKnight() {
  const W = 48, H = 36, X = 24, FL = H - 1;
  const q = G => outline(fromGrid(rowsOf(G), HK, 1), OUT);
  const STEEL = ['i', 'S', 's'], DARK = ['I', 'i', 'S'];
  const HELM = [
    'K.........k.',
    'KK.......kk.',
    '.KKlssssskk.',
    '..lsssssssSi',
    '.lsssssssSSi',
    '.syyyyyyyyzi',
    '.sSSSIIrEIIi',
    '.sSSSSSiSiSi',
    '.iSSSSSSSSSi',
    '..iiiiiiiii.',
  ];
  const TORSO = [
    '.lssSi.......lssSi.',
    'lsssSSi.MMM.lsssSSi',
    'sSSSSSiMMMMMsSSSSSi',
    'yyyyyziBvbbBiyyyyzz',
    '......vybybyB......',
    '......vyyyyyB......',
    '......vbbbbbB......',
    '.....WwwwywwwW.....',
    '.....sSvbbbBSi.....',
    '.....iSvbbbBii.....',
    '.......vbbbB.......',
    '.......ybbby.......',
  ];
  const put = (G, x, y, k) => { if (G[y] && x >= 0 && x < W) G[y][x] = k; };
  const leg = (G, hip, knee, ank, near, lift = 0) => {
    const R = near ? STEEL : DARK;
    limb(G, hip, knee, 4.2, R); limb(G, knee, ank, 3.6, R);
    put(G, knee[0], knee[1], near ? 'l' : 'S');
    stamp(G, ank[0] - 1, FL - 1 - lift, near ? ['sSSSs.', 'iiiiiI'] : ['SiiiS.', 'IIIIII']);
  };
  const arm = (G, sh, el, hd, near) => {
    const R = near ? STEEL : DARK;
    limb(G, sh, el, 3.8, R); limb(G, el, hd, 3.4, R);
    put(G, el[0], el[1], near ? 'y' : 'z');
    limb(G, hd, hd, 3.2, near ? ['i', 's', 'l'] : ['I', 'S', 's']);
  };
  // the greatsword: grip back from the hand, a gold cross, a long broad blade tapering to a point
  const sword = (G, hd, deg, len = 15) => {
    const a = deg * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [-u[1], u[0]], P = (t, s = 0) => [Math.round(hd[0] + u[0] * t + n[0] * s), Math.round(hd[1] + u[1] * t + n[1] * s)];
    limb(G, P(-4), P(1), 1.6, ['W', 'w', 'w']);
    limb(G, P(-5), P(-5), 2.2, ['z', 'y', 'Y']);
    limb(G, P(2.5), P(len - 2), 2.8, ['S', 's', 'l']);
    limb(G, P(len - 2), P(len), 1.4, ['S', 's', 'l']);
    limb(G, P(1.8, -3), P(1.8, 3), 1.6, ['z', 'y', 'Y']);
  };
  const frame = ({ dx = 0, dy = 0, hx = 0, legs, arms, sw, glare = false, debris = null }) => {
    const G = blank(W, H), T = X + dx;
    const sh = { near: [T + 6, 22 + dy], far: [T - 6, 22 + dy] };
    if (arms.far) layer(G, g => arm(g, sh.far, arms.far[0], arms.far[1], false));
    if (sw && !sw.front) layer(G, g => sword(g, sw.at, sw.deg, sw.len));
    layer(G, g => leg(g, ...legs.far, false, legs.farLift || 0));
    layer(G, g => leg(g, ...legs.near, true, legs.nearLift || 0));
    layer(G, g => stamp(g, T - 9, 19 + dy, TORSO));
    if (sw && sw.front) layer(G, g => sword(g, sw.at, sw.deg, sw.len));
    const helm = glare ? HELM.map((r, i) => (i === 6 ? '.sSSSIrEErIi' : r)) : HELM;
    layer(G, g => stamp(g, T - 5 + hx, 11 + dy, helm));
    if (arms.near) layer(G, g => arm(g, sh.near, arms.near[0], arms.near[1], true));
    if (debris) for (const [x, y, rows] of debris) stamp(G, x, y, rows);
    return q(G);
  };
  // legs: [hip, knee, ankle] far and near; the hips ride the body
  const L = (dy, f, n) => ({ far: [[X - 3 + f[0], 30 + dy], [X - 3 + f[1], 32 + dy], [X - 3 + f[2], FL - 2]], near: [[X + 3 + n[0], 30 + dy], [X + 3 + n[1], 32 + dy], [X + 3 + n[2], FL - 2]] });
  const walkArms = (dy, s) => ({ far: [[X - 8, 25 + dy], [X - 8, 28 + dy]], near: [[X + 7 + s, 25 + dy], [X + 7 + s, 28 + dy]] });
  const drag = dy => ({ at: [X - 8, 28 + dy], deg: 158 + dy * 3 });
  const f0 = frame({ dy: 1, legs: L(1, [-1, -3, -4], [1, 3, 4]), arms: walkArms(1, 1), sw: drag(1) });
  const f1 = frame({ dy: 0, legs: Object.assign(L(0, [0, 2, 0], [0, 0, 0]), { farLift: 2 }), arms: walkArms(0, 0), sw: drag(0) });
  const f2 = frame({ dy: 1, legs: L(1, [1, 3, 4], [-1, -3, -4]), arms: walkArms(1, -1), sw: drag(1) });
  const f3 = frame({ dy: 0, legs: Object.assign(L(0, [0, 0, 0], [0, 2, 0]), { nearLift: 2 }), arms: walkArms(0, 0), sw: drag(0) });
  const raise = frame({ dx: -1, hx: -1, dy: 0, glare: true, legs: L(0, [-1, -3, -3], [1, 3, 3]),
    arms: { far: [[X - 9, 15], [X - 3, 9]], near: [[X + 7, 15], [X + 1, 9]] }, sw: { at: [X - 1, 8], deg: 200, len: 15 } });
  const slam = frame({ dx: 2, hx: 1, dy: 2, glare: true, legs: { far: [[X - 2, 31], [X - 6, 32], [X - 9, FL - 2]], near: [[X + 5, 31], [X + 9, 31], [X + 9, FL - 2]] },
    arms: { far: [[X + 2, 28], [X + 9, 26]], near: [[X + 10, 27], [X + 10, 25]] }, sw: { at: [X + 9, 25], deg: 40, len: 15, front: true },
    debris: [[X + 17, 32, ['.d', 'dD']], [X + 22, 33, ['d.', 'Dd']], [X + 19, 30, ['dD']]] });
  const guard = frame({ dy: 1, legs: L(1, [-1, -3, -4], [1, 3, 4]),
    arms: { far: [[X - 2, 28], [X + 10, 28]], near: [[X + 9, 27], [X + 10, 25]] }, sw: { at: [X + 10, 25], deg: -90, len: 15, front: true } });
  return pack([f0, f1, f2, f3, raise, slam, guard], X + 1, H + 1, 16, 22);
}
