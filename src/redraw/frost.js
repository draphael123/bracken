// frost.js — THE RIMEWRIGHT, the frost creature of the high fell that works the ice (a new body for the old Suncatcher's
// fight, not a reskin). All frames face RIGHT (L is the flip). Every frame shares one canvas, so the anchor holds.
// Anchors follow chars.js: ax = the body's centre column, ay = the outline row just under the feet (lowest body pixel on
// ay-1, its outline on ay). Parts are char grids stamped onto a blank frame grid; limbs, claws, the crown, the mantle and
// the head (rotated per pose) are rasterised into the same grid (limb / gline / gpoly), parts that cross the body are laid
// with an inner outline (layer()), then fromGrid + OUT outline. Reach points are canvas pixels relative to the anchor.
//
// bakeRimewright()  THE RIMEWRIGHT (boss) — tall, gaunt and hunched: a crown of ice like antlers (five jagged blue-white
//   spikes swept up and back off the head), a long skull whose face is a dark hollow with two small cold eyes, a mantle of
//   old snow-crusted hide off hunched shoulders trailing to the knees (ragged hem, icicles), a cold lantern heart in the
//   chest (pale cyan, white core), very long thin arms of blue ice ending in three long icicle claws, digitigrade legs of
//   frosted ice on big clawed feet planted wide, rime tatters and icicles hanging off the elbows.
//   frames: 0 idle (hunched, arms hanging, claws by the knees, heart soft), 1 glide A (leaning in, near foot forward,
//           mantle streaming), 2 glide B (other foot, mantle swings), 3 frost tell (both arms raised high, claws spread,
//           heart flaring, crown lit — the long tell), 4 frost (crouched, both claws driven into the floor ahead, frost
//           chips spraying), 5 spire tell (near arm plunged into the floor to the wrist beside it, far arm raised, head
//           down, heart bright), 6 shard tell (leaning back, near arm drawn back behind the head holding three cold-light
//           shards), 7 shard (lunging, near arm flung out, claw open and EMPTY, smear arc), 8 claw tell (coiled low, both
//           arms drawn back to the rear, claws up and hooked, eyes flare), 9 claw (a wide low rake forward, arms out ahead
//           at knee-to-chest height, smear arc), 10 hail tell (head thrown back, arms spread up and out, face and crown
//           glowing), 11 thawed (the OPENING: slumped, rime sloughing and dripping, crown broken short, no cowl, heart dark
//           and exposed), 12 cracked (the other OPENING: staggered back, a bright crack across the chest, shards flying
//           off the crown, near arm thrown up), 13 hurt (knocked back a step, head snapped back, arms flung; LAST)
//   canvas 72x60 (grid 70x58; 45 px feet to crown tips standing)   anchor ax 29, ay 59   pack w/h 20x38
//   reach: heart centre (idle) ax+2, ay-26; crown top (idle) ax+5, ay-45; frost tell claw tips to ax+19, ay-53 and
//          ax-15, ay-53; FROST claw tips in the floor from ax+18 to ax+27, ay-1 (frost line ax+17 to ax+27 on ay-1,
//          chips up to ay-8 and out to ax+32); spire tell wrist in the floor at ax+10, ay-1; shard tell hand ax-9, ay-41
//          (shards to ax-16..ax-7, ay-48..ay-43); SHARD release point (open hand) ax+26, ay-29 (claw tips to ax+33);
//          CLAW near claw tip ax+37, ay-17 (far claw tip ax+33, ay-9, smear out to ax+39); hail tell claw tips to
//          ay-49; cracked crack across the chest centred ax-4, ay-26
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
const put = (G, x, y, k) => { x = Math.round(x); y = Math.round(y); if (G[y] && x >= 0 && x < G[y].length) G[y][x] = k; };
// draw a part on its own grid, then lay it over G with a 1-px OUT line wherever it sits on something already drawn
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
// a 1-px line (Bresenham) into a grid; k is a char or (i, n) => char along the line; returns the points
function gline(G, x0, y0, x1, y1, k) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const pts = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) { pts.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  pts.forEach(([x, y], i) => put(G, x, y, typeof k === 'function' ? k(i, pts.length) : k));
  return pts;
}
// a capsule from a to b, `w` thick; each pixel takes the char of the side it faces: ramp = [dark, base, light], lit from the upper left
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
// scanline polygon into a grid (pixel-centre sampling); pick(x, y) gives the char
function gpoly(G, pts, pick) {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    const sy = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.ceil(xs[i] - 0.5); x < Math.ceil(xs[i + 1] - 0.5); x++) put(G, x, y, pick(x, y));
  }
}
// a swing's smear: a pale frost arc of radius r round (cx, cy) in canvas pixels, from angle a0 to a1 (degrees, 0 = ahead,
// -90 = straight up), drawn after the outline and only on empty pixels; the last 60% gets a second, bluer band inside
function smear(c, cx, cy, r, a0, a1, maxY = Infinity) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#eefaff'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#9fd8f0' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height || y > maxY) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}

// ---------- THE RIMEWRIGHT ----------
// ice x/i/m/d/D (light to deep; far limbs use the deep end), white-hot W; hide and snow s/h/H/J; heart c/C; eyes e;
// face hollow f; meltwater p. THAW is the same chars duller, darker and wetter, with the heart gone out.
const RW = { o: OUT, W: '#ffffff', x: '#eefaff', i: '#bfe6f5', m: '#7aa8c8', d: '#4a6a90', D: '#2e4460',
  s: '#e4e8ee', h: '#aab2c0', H: '#6a7282', J: '#474e5c', c: '#7fe8ff', C: '#3aa8d0', e: '#e8fbff', f: '#1b2233', p: '#9fd0e8' };
const THAW = Object.assign({}, RW, { W: '#b4cad8', x: '#b8d2e0', i: '#94b4c8', m: '#6a8aa4', d: '#48607c', D: '#2c3c52',
  s: '#bcc4cc', h: '#8e97a6', H: '#5a6272', J: '#3e4450', c: '#1b2233', C: '#2a3646', e: '#9ab8c8' });

export function bakeRimewright() {
  const W = 70, H = 58, X = 28, FL = H - 1, AL = 11;
  const ICE = ['d', 'm', 'i'], FAR = ['D', 'd', 'm'];
  // the long skull in profile, face a dark hollow under the brow, icicle fangs; PIV is the neck, the head's turning point
  const HEAD = [
    '...sssss.....',
    '..sshhhhss...',
    '.sshhhhhhhss.',
    '.hhhhhhhhhhhs',
    '.Hhhhhhffffhh',
    'JHhhhfffffffh',
    'JJHhHfffffffH',
    '.JJHHJffxfxf.',
    '..JJJJHfxfx..',
    '....JJ.x.x...',
  ];
  const PIV = [3, 6], EYES = [[7, 5], [11, 5]];
  // crown spikes in head space: [base, bend, tip, tine?] — a short brow spike, two antler beams with a tine each, a rear spike
  const SPIKES = [
    [[8, 1], [9, -1], [11, -4]],
    [[6, 0], [5, -4], [3, -9], [[5, -4], [7, -7]]],
    [[4, 0], [1, -3], [-3, -8], [[1, -3], [0, -7]]],
    [[2, 2], [-2, 0], [-7, -3]],
  ];
  const HEART = [
    ['..i..', '.imi.', 'imccm', '.mcm.', '..m..'],
    ['.....', '.mcm.', '.cWc.', '.mcm.', '.....'],
    ['..c..', '.cWc.', 'cWWWc', '.cWc.', '..c..'],
  ];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const elbow = (sh, hd, L, side) => { const dx = hd[0] - sh[0], dy = hd[1] - sh[1], d = Math.hypot(dx, dy) || 1, h = Math.sqrt(Math.max(0, L * L - d * d / 4)); return [(sh[0] + hd[0]) / 2 - dy / d * h * side, (sh[1] + hd[1]) / 2 + dx / d * h * side]; };
  const headAt = (hd, deg) => { const r = deg * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r); return L => [hd[0] + cs * (L[0] - PIV[0]) - sn * (L[1] - PIV[1]), hd[1] + sn * (L[0] - PIV[0]) + cs * (L[1] - PIV[1])]; };
  const crown = (G, hd, deg, o, glow) => {
    const at = headAt(hd, deg), CR = o.lit ? ['m', 'x', 'W'] : ['d', 'i', 'x'];
    SPIKES.forEach(([b, m, t, tine], n) => {
      if (o.broken && o.broken.includes(n)) {
        limb(G, at(b), at(lerp(b, m, 0.8)), 2.4, CR); put(G, ...at(lerp(b, m, 1.05)), CR[1]);
        return;
      }
      limb(G, at(b), at(m), 2.4, CR); limb(G, at(m), at(t), 1.4, CR); put(G, ...at(t), CR[2]);
      if (tine) { limb(G, at(tine[0]), at(tine[1]), 1.3, CR); put(G, ...at(tine[1]), CR[2]); }
      if (o.lit) { glow.push(at(t)); if (tine) glow.push(at(tine[1])); }
    });
  };
  const head = (G, hd, deg, o, glow) => {
    const r = deg * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r), at = headAt(hd, deg);
    for (let wy = hd[1] - 14; wy <= hd[1] + 14; wy++) for (let wx = hd[0] - 14; wx <= hd[0] + 14; wx++) {
      const dx = wx - hd[0], dy = wy - hd[1], lx = Math.round(cs * dx + sn * dy + PIV[0]), ly = Math.round(-sn * dx + cs * dy + PIV[1]);
      const row = HEAD[ly], k = row && row[lx];
      if (!k || k === '.') continue;
      put(G, wx, wy, k === 'f' && o.faceLit ? 'C' : k);
      if (k === 'f' && o.faceLit) glow.push([wx, wy]);
    }
    for (const E of EYES) {
      const p = at(E);
      put(G, ...p, o.flare || o.faceLit ? 'W' : 'e');
      if (o.flare) put(G, ...at([E[0] + 1, E[1]]), 'e');
    }
  };
  const claws = (G, hd, a, near, lit) => {
    const spread = a.spread || 20, len = a.len || 6, curl = a.curl || 0, R = near ? ['m', 'i', 'x'] : ['d', 'm', 'i'];
    for (const k of [-1, 0, 1]) {
      const d0 = (a.deg + k * spread) * Math.PI / 180, d1 = (a.deg + k * spread + curl) * Math.PI / 180, L = len - Math.abs(k);
      const p1 = [hd[0] + Math.cos(d0) * L * 0.55, hd[1] + Math.sin(d0) * L * 0.55];
      const p2 = [p1[0] + Math.cos(d1) * L * 0.5, p1[1] + Math.sin(d1) * L * 0.5];
      limb(G, hd, p1, 1.5, R);
      gline(G, p1[0], p1[1], p2[0], p2[1], near ? 'i' : 'm');
      put(G, ...p2, lit ? 'W' : near ? 'x' : 'i');
    }
  };
  const arm = (G, sh, a, near, o, glow) => {
    const R = near ? ICE : FAR, el = elbow(sh, a.hd, AL, a.side || 1), ex = Math.round(el[0]), ey = Math.round(el[1]);
    limb(G, sh, el, 2.6, R); limb(G, el, a.hd, 2.0, R);
    put(G, ex, ey, near ? 'x' : 'm');
    put(G, ex - 1, ey + 2, near ? 's' : 'h'); put(G, ex - 1, ey + 3, near ? 'i' : 'm');
    if (a.plunge) return;
    limb(G, a.hd, a.hd, 2.8, near ? ['d', 'm', 'i'] : ['D', 'd', 'm']);
    claws(G, a.hd, a, near, o.litClaws);
    if (a.shards) for (const [dx, dy, ex2, ey2] of [[-2, -3, -3, -6], [1, -3, 2, -7], [-4, 0, -7, -2]]) {
      limb(G, [a.hd[0] + dx, a.hd[1] + dy], [a.hd[0] + ex2, a.hd[1] + ey2], 2.0, ['c', 'x', 'W']);
      glow.push([a.hd[0] + ex2, a.hd[1] + ey2], [a.hd[0] + dx, a.hd[1] + dy]);
    }
  };
  // digitigrade: hip to a forward knee, back to a high hock, down to a big clawed foot planted on the floor
  const leg = (G, hip, knee, hock, toe, near) => {
    const R = near ? ICE : FAR;
    limb(G, hip, knee, 3.6, R); limb(G, knee, hock, 2.6, R); limb(G, hock, [toe[0] - 3, FL - 2], 2.2, R);
    put(G, knee[0], knee[1], near ? 'x' : 'm'); put(G, hock[0], hock[1], near ? 'i' : 'd');
    stamp(G, toe[0] - 6, FL - 2, near ? ['..dmmi..', '.ddmmiix', 'DdmDmixx'] : ['..DddD..', '.DDddmmd', 'DDdDdmdd']);
  };
  const torso = (G, c, hip, heart, crack) => {
    limb(G, [c[0] - 1, c[1] + 2], [hip[0], hip[1] - 2], 4.6, ICE);
    limb(G, hip, hip, 6, ICE);
    limb(G, [c[0] + 0.5, c[1] - 2], [c[0] - 0.5, c[1] + 2], 8, ICE);
    put(G, c[0] - 2, c[1] + 4, 'd'); put(G, c[0] + 1, c[1] + 4, 'd'); put(G, c[0] - 1, c[1] + 6, 'd');
    stamp(G, c[0] - 2, c[1] - 2, HEART[heart]);
    if (crack) {
      const P = [[-4, -3], [-2, -2], [-1, 0], [1, -1], [2, 1], [4, 2]].map(([dx, dy]) => [c[0] + dx, c[1] + dy]);
      for (let i = 0; i + 1 < P.length; i++) gline(G, ...P[i], ...P[i + 1], 'W');
      put(G, c[0] + 5, c[1] + 3, 'x'); put(G, c[0] - 5, c[1] - 4, 'x');
    }
  };
  // the trailing mantle: snow crust over the hump, streaked hide, a ragged hem hung with icicles (or drips when thawed)
  const mantle = (G, c, hip, sw, hemY, thaw) => {
    const bx = hip[0] - 10 - sw * 2, by = hemY - sw, fx = hip[0] + 1, fy = hemY - 2;
    const pts = [[c[0] + 3, c[1] - 6], [c[0] - 1, c[1] - 8], [c[0] - 6, c[1] - 6], [c[0] - 9 - sw, c[1] - 1], [bx, by]];
    const n = 8, low = [];
    for (let i = 1; i < n; i++) { const t = i / n, x = bx + (fx - bx) * t, y = by + (fy - by) * t + (i % 2 ? 2.5 : -1); pts.push([x, y]); if (i % 2) low.push([Math.round(x), Math.ceil(y) - 1]); }
    pts.push([fx, fy], [c[0] + 1, c[1] + 1]);
    gpoly(G, pts, (x, y) => (y < c[1] - 5 ? 's' : y >= hemY - 1 ? 'H' : ((Math.floor(x * 0.5 + (y - c[1]) * 0.2 + sw) % 3) + 3) % 3 === 0 ? 'H' : (x * 7 + y * 3) % 11 === 0 ? 's' : 'h'));
    low.forEach(([x, y], i) => { put(G, x, y + 1, thaw ? 'p' : 'i'); if (i % 2 === 0) put(G, x, y + 2, thaw ? '.' : 'x'); if (thaw) put(G, x, y + 3, 'p'); });
  };
  const cowl = (G, c) => {
    gpoly(G, [[c[0] - 7, c[1] - 2], [c[0] - 3, c[1] - 7], [c[0] + 2, c[1] - 7], [c[0] + 6, c[1] - 4], [c[0] + 5, c[1] - 2], [c[0] + 2, c[1] - 3], [c[0] - 2, c[1] - 2]],
      (x, y) => (y < c[1] - 5 ? 's' : y < c[1] - 3 ? (x % 3 ? 's' : 'h') : 'h'));
    put(G, c[0] + 5, c[1] - 1, 'h'); put(G, c[0] + 5, c[1], 'i'); put(G, c[0] - 6, c[1] - 1, 'h');
  };
  const frame = o => {
    const G = blank(W, H), c = o.chest, hip = o.hip, glow = [];
    const shN = [c[0] + 3, c[1] - 3], shF = [c[0] - 2, c[1] - 4], hd = o.head || [c[0] + 3, c[1] - 5];
    layer(G, g => arm(g, shF, o.far, false, o, glow));
    layer(G, g => mantle(g, c, hip, o.sw || 0, o.hem || 49, o.thaw));
    layer(G, g => leg(g, [hip[0] - 2, hip[1] - 1], ...o.legs.far, false));
    layer(G, g => leg(g, [hip[0] + 2, hip[1]], ...o.legs.near, true));
    layer(G, g => torso(g, c, hip, o.heart, o.crack));
    if (!o.thaw) layer(G, g => cowl(g, c));
    if (o.nearBehind) layer(G, g => arm(g, shN, o.near, true, o, glow));
    layer(G, g => crown(g, hd, o.ha || 0, o, glow));
    layer(G, g => head(g, hd, o.ha || 0, o, glow));
    if (!o.nearBehind) layer(G, g => arm(g, shN, o.near, true, o, glow));
    if (o.fx) for (const [x, y, rows] of o.fx) stamp(G, x, y, rows);
    const cv = outline(fromGrid(rowsOf(G), o.thaw ? THAW : RW, 1), OUT);
    if (o.smear) smear(cv, ...o.smear);
    if (glow.length) {
      const g2 = cv.getContext('2d'), d = g2.getImageData(0, 0, cv.width, cv.height).data;
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
        if (d[(y * cv.width + x) * 4 + 3]) continue;
        let m = 9; for (const [bx, by] of glow) m = Math.min(m, Math.hypot(bx + 1 - x, by + 1 - y));
        if (m <= 2.0) px(g2, x, y, '#a8ecff');
      }
    }
    return cv;
  };
  const wide = { near: [[X + 3, 46], [X + 1, 52], [X + 8, FL]], far: [[X - 3, 46], [X - 7, 52], [X - 4, FL]] };
  const idle = frame({ hip: [X - 1, 41], chest: [X + 2, 32], head: [X + 5, 28], heart: 1, hem: 49,
    legs: { near: [[X + 3, 46], [X + 1, 52], [X + 8, FL]], far: [[X - 2, 46], [X - 6, 52], [X - 3, FL]] },
    near: { hd: [X + 9, 46], deg: 95, spread: 18 }, far: { hd: [X + 3, 45], deg: 100, spread: 18 } });
  const glideA = frame({ hip: [X, 41], chest: [X + 5, 33], head: [X + 9, 29], ha: 8, heart: 1, sw: 4, hem: 46,
    legs: { near: [[X + 7, 46], [X + 5, 52], [X + 11, FL]], far: [[X, 47], [X - 5, 52], [X - 3, FL]] },
    near: { hd: [X + 4, 46], deg: 115, spread: 18 }, far: { hd: [X - 2, 44], deg: 125, spread: 18 } });
  const glideB = frame({ hip: [X, 41], chest: [X + 5, 33], head: [X + 9, 29], ha: 8, heart: 1, sw: 2, hem: 48,
    legs: { near: [[X + 3, 47], [X - 3, 52], [X - 1, FL]], far: [[X + 5, 46], [X + 3, 52], [X + 9, FL]] },
    near: { hd: [X + 2, 46], deg: 120, spread: 18 }, far: { hd: [X + 7, 46], deg: 100, spread: 18 } });
  const frostTell = frame({ hip: [X - 1, 41], chest: [X + 1, 31], head: [X + 3, 26], ha: -12, heart: 2, lit: true, flare: true, litClaws: true, hem: 49,
    legs: wide, near: { hd: [X + 16, 12], deg: -70, spread: 34, len: 7, side: 1 }, far: { hd: [X - 12, 12], deg: -115, spread: 34, len: 7, side: -1 } });
  const frost = frame({ hip: [X + 1, 46], chest: [X + 7, 39], head: [X + 11, 35], ha: 25, heart: 2, flare: true, sw: 1, hem: 52,
    legs: { near: [[X + 7, 49], [X + 3, 54], [X + 8, FL]], far: [[X, 50], [X - 5, 54], [X - 3, FL]] },
    near: { hd: [X + 23, 51], deg: 72, spread: 22, len: 7, side: -1 }, far: { hd: [X + 19, 52], deg: 80, spread: 22, len: 6, side: -1 },
    fx: [[X + 17, FL - 4, ['x']], [X + 21, FL - 7, ['.i', 'x.']], [X + 27, FL - 5, ['W']], [X + 29, FL - 3, ['xi']], [X + 31, FL - 6, ['i']], [X + 17, FL, ['xiWixixWixi']]] });
  const spireTell = frame({ hip: [X, 44], chest: [X + 4, 37], head: [X + 8, 34], ha: 35, heart: 2, hem: 51,
    legs: { near: [[X + 5, 48], [X + 1, 53], [X + 6, FL]], far: [[X - 2, 48], [X - 6, 53], [X - 4, FL]] },
    near: { hd: [X + 10, FL], plunge: true, side: -1 }, far: { hd: [X - 8, 15], deg: -105, spread: 30, len: 7, side: -1 },
    fx: [[X + 7, FL - 1, ['.x...x.', 'xiWmWix']]] });
  const shardTell = frame({ hip: [X - 1, 41], chest: [X - 1, 32], head: [X + 1, 27], ha: -18, heart: 2, hem: 49, nearBehind: true,
    legs: { near: [[X + 4, 46], [X + 2, 52], [X + 9, FL]], far: [[X - 4, 46], [X - 8, 52], [X - 6, FL]] },
    near: { hd: [X - 9, 17], deg: -120, spread: 26, len: 5, side: 1, shards: true }, far: { hd: [X + 9, 33], deg: 10, spread: 20, side: -1 } });
  const shard = frame({ hip: [X + 1, 41], chest: [X + 7, 33], head: [X + 11, 29], ha: 5, heart: 1, sw: 3, hem: 47,
    legs: { near: [[X + 8, 46], [X + 6, 52], [X + 12, FL]], far: [[X - 1, 47], [X - 7, 52], [X - 5, FL]] },
    near: { hd: [X + 26, 29], deg: -5, spread: 30, len: 7, side: 1 }, far: { hd: [X - 5, 42], deg: 130, spread: 18, side: 1 },
    smear: [X + 11, 31, 17, -120, -15] });
  const clawTell = frame({ hip: [X - 1, 45], chest: [X + 1, 38], head: [X + 5, 34], ha: 12, heart: 1, flare: true, sw: 1, hem: 52,
    legs: { near: [[X + 5, 49], [X + 1, 54], [X + 7, FL]], far: [[X - 2, 50], [X - 7, 54], [X - 5, FL]] },
    near: { hd: [X - 14, 29], deg: -70, spread: 26, len: 7, curl: 45, side: -1 }, far: { hd: [X - 18, 25], deg: -85, spread: 26, len: 7, curl: 45, side: -1 } });
  const claw = frame({ hip: [X + 3, 43], chest: [X + 10, 36], head: [X + 14, 32], ha: 12, heart: 1, flare: true, sw: 4, hem: 49,
    legs: { near: [[X + 10, 47], [X + 8, 53], [X + 14, FL]], far: [[X + 1, 48], [X - 6, 53], [X - 4, FL]] },
    near: { hd: [X + 30, 40], deg: 10, spread: 26, len: 7, side: -1 }, far: { hd: [X + 26, 46], deg: 20, spread: 24, len: 7, side: -1 },
    smear: [X + 13, 39, 25, -35, 55, FL] });
  const hailTell = frame({ hip: [X - 1, 41], chest: [X, 31], head: [X + 1, 26], ha: -55, heart: 2, lit: true, faceLit: true, litClaws: true, hem: 49,
    legs: wide, near: { hd: [X + 17, 15], deg: -45, spread: 30, len: 7, side: 1 }, far: { hd: [X - 14, 15], deg: -135, spread: 30, len: 7, side: -1 } });
  const thawed = frame({ hip: [X + 1, 44], chest: [X + 6, 37], head: [X + 10, 33], ha: 30, heart: 0, thaw: true, broken: [0, 1, 2, 3, 4], hem: 53,
    legs: { near: [[X + 6, 49], [X + 2, 54], [X + 7, FL]], far: [[X - 1, 49], [X - 5, 54], [X - 3, FL]] },
    near: { hd: [X + 16, 52], deg: 100, len: 4, side: -1 }, far: { hd: [X + 8, 52], deg: 95, len: 4, side: 1 },
    fx: [[X + 20, 47, ['p', '.', 'p']], [X + 6, 41, ['.', 'p']], [X - 5, 40, ['s']], [X - 9, 45, ['h']], [X + 3, 30, ['.s', 'h.']], [X + 18, 42, ['s']], [X + 13, 55, ['p']]] });
  const cracked = frame({ hip: [X - 2, 41], chest: [X - 4, 32], head: [X - 3, 27], ha: -28, heart: 2, crack: true, broken: [2], flare: true, hem: 49,
    legs: { near: [[X + 2, 46], [X, 52], [X + 6, FL]], far: [[X - 5, 46], [X - 10, 52], [X - 9, FL]] },
    near: { hd: [X + 9, 12], deg: -70, spread: 30, len: 7, side: 1 }, far: { hd: [X - 15, 42], deg: 150, spread: 22, side: 1 },
    fx: [[X - 13, 10, ['x', 'i']], [X - 9, 5, ['.W', 'x.']], [X - 3, 6, ['W', 'i']], [X - 16, 15, ['xi']]] });
  /* hurt: knocked back a step, the skull snapped back, both arms left flung out ahead of the body */
  const hurt = frame({ hip: [X - 2, 41], chest: [X - 4, 33], head: [X - 3, 28], ha: -35, heart: 1, hem: 49, sw: 1,
    legs: { near: [[X + 2, 46], [X - 1, 52], [X + 5, FL]], far: [[X - 5, 46], [X - 9, 52], [X - 7, FL]] },
    near: { hd: [X + 12, 38], deg: 25, spread: 26, side: 1 }, far: { hd: [X + 7, 42], deg: 40, spread: 22, side: 1 } });
  return pack([idle, glideA, glideB, frostTell, frost, spireTell, shardTell, shard, clawTell, claw, hailTell, thawed, cracked, hurt], X + 1, H + 1, 20, 38);
}
