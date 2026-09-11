// reef.js — THE SHIPWRECK REEF: the drowned crews of the elven tribute fleet and the things on the reef that ate them.
// New bakers, not redraws. All frames face RIGHT (L is the flip). Every frame of a sprite shares one canvas, so the
// anchor holds. Anchors follow chars.js: ax = the body's centre column, ay = the outline row just under the feet
// (lowest body pixel on ay-1, its outline on ay); each frame grid is settle()d onto its floor row so that holds in
// every pose. Parts are char grids stamped onto a blank frame grid; poles, nets, spines, fins, jaws and the eel's
// forebody are rasterised into the same grid (limb / gline / gpoly / needleJaw / moray), parts that cross the body are
// laid with an inner outline (layer()), then fromGrid + OUT outline. Reach points are canvas pixels relative to the
// anchor. The look: drowned grey-green flesh and weed, rotted leather and rope, wet iron; the reef's own animals are
// near-black with cold glassy highlights.
//
// bakeSailor()  DROWNED SAILOR — a dead elven deckhand still working the wreck: bloated grey-green skin, weed grown
//   through the hair, a rotted jerkin torn open over the belly, one bare foot and one rotted boot, and a BOATHOOK
//   (long wooden pole, iron head with a spike and a barb hooked back). Slow and heavy.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (boathook carried across the body)
//           4 guard (braced wide, hook held up across the chest, nearly level)
//           5 hook tell (weight back, pole swung up and BEHIND him, hook trailing)
//           6 hook (lunging, pole swept out and low in front, the hook leading, foam smear along the arc)
//   canvas 42x28 (grid 40x26; 24 px feet to crown)   anchor ax 20, ay 27   pack w/h 10x18
//   reach: walk pole butt ax-9, ay-1 to the iron head ax+5..ax+8, ay-17..ay-21 (spike ax+6, ay-21);
//          guard head ax+7..ax+10, ay-16..ay-19, pole butt ax-8, ay-11;
//          tell head ax-13..ax-16, ay-13..ay-17 (behind him), pole butt ax+4, ay-5;
//          HOOK head ax+12..ax+16, ay-3..ay-6 (spike ax+14, ay-6), the pole lying from ax-4, ay-14 out to it
//
// bakeNetter()  NETTER — a hunched drowned fisher with a weighted casting net: head pushed forward, humped back,
//   lank weed hair, slack jaw, the net a visible knotted bundle with two lead weights hanging off his hand.
//   frames: 0 walk contact, 1 pass, 2 contact (other foot), 3 pass   (bundle carried at the hip)
//           4 throw tell (coiled back, net swung up and behind his shoulder)
//           5 throw (lunging, arm out, hand OPEN and EMPTY, the net gone, foam smear off the release)
//           6 empty (stalking low with no net, both arms spread wide, hands open)
//   canvas 36x28 (grid 34x26; 22 px feet to crown)   anchor ax 17, ay 27   pack w/h 10x18
//   reach: walk bundle ax+4..ax+9, ay-3..ay-7 with its leads at ay-2; TELL bundle ax-8..ax-13, ay-19..ay-23;
//          THROW release hand ax+9, ay-18 (the net leaves there); empty hands ax+9, ay-11 and ax-9, ay-11
//
// bakeNet()  the thrown net — NOT a character pack: { frames: [c0, c1, c2] }, three 20x20 canvases of the net opening
//   in flight: 0 balled (a solid knot of cord, weights tucked against it), 1 half-opened, 2 spread wide with its
//   weights flung out. The mesh centre is canvas 10,10 in all three; rim radius 5 / 8 / 10 px from it.
//
// bakeUrchin()  URCHIN — a black sea urchin adrift in the water: a round test with a pale sheen and long spines. The
//   straight-up and straight-down spines keep their length in every frame, so the body does not bob when the frame
//   settles onto its floor row; the breathing is in the other spines.
//   frames: 0, 1, 2 drift (spines breathing in and out), 3 bristle (every spine flared hard, tips pale)
//   canvas 22x22 (grid 20x20; 19 px across the vertical spines)   anchor ax 11, ay 21   pack w/h 12x12
//   reach: spine tips ring the body — straight up ax+0, ay-19 and straight down ax+0, ay-1 in every frame, the rest
//          out to ax-9..ax+9 about ay-10; BRISTLE flares every spine and whitens the last 3 px of each
//
// bakeAngler()  ANGLER — a deep-water anglerfish: a near-black bulb of a body, a huge hinged jaw of needle teeth, a
//   stalk over its head with a glowing lure at the tip, ragged fins, a forked tail.
//   frames: 0, 1 swim (tail in opposite phases, lure bobbing, jaw half open), 2 lure flare (lure blazing with a halo,
//           jaw shut, eye forward and bright), 3 bite (jaw flung wide, body driven 2 px forward, lure laid back)
//   canvas 38x24 (grid 36x22; 15 px tall, 30 long with the jaw)   anchor ax 15, ay 23   pack w/h 20x14
//   reach: swim teeth ax+10..ax+18, ay-6..ay-11 (mouth mostly level); BITE teeth ax+13..ax+19, ay-6..ay-13 — the
//          gape stands open across ay-13..ay-6 at about ax+17; lure ax+7..ax+9, ay-19..ay-21, flaring to
//          ax+5..ax+11, ay-18..ay-23 in frame 2 and laid back to ax+2..ax+4, ay-18..ay-20 in the bite
//
// bakePetrel()  STORM PETREL — a small dark sea bird with a white rump, long angular wings and a fine hooked bill,
//   that dives at you out of the squall.
//   frames: 0 flap (wings up, body sunk), 1 flap (wings down, body lifted), 2 dive (wings swept back along the body,
//           beak down, the whole bird a dart), 3 pull up (wings thrown forward to brake, tail fanned)
//   canvas 24x16 (grid 22x14; 11 px wingspan either side of the body)   anchor ax 11, ay 15   pack w/h 10x8
//   reach: flap bill tip ax+9, ay-4 (wings up) and ax+9, ay-6 (wings down), wingtips out to ax-9 and ax+9;
//          DIVE beak ax+3..ax+4, ay-1..ay-4 — it strikes low and forward; pull-up bill tip ax+10, ay-8
//
// bakeReefmaw()  THE REEFMAW (boss) — a giant moray eel in a coral hole. The game draws only the eel; the hole and the
//   water are the level's, so the forebody runs off the bottom edge of the canvas instead of standing on feet, and ay
//   is the canvas's bottom outline row. Mottled green-black hide, a pale sagging belly, small black eyes, a long jaw
//   of glassy needle teeth, three gill pores behind the head, a ragged dorsal crest running back over the head.
//   frames: 0 lurking (only the head, low in the hole's mouth, jaw shut, eyes lit), 1 rise A, 2 rise B (forebody up
//           out of the hole, curving), 3 bite tell (head drawn back in an S, jaw parting, dorsal crest raised),
//           4 bite (head driven forward, jaw wide, the whole gullet showing), 5 thrash (body whipped sideways, head
//           low and turned), 6 recoil (head dropped, jaw slack, eyes dim), 7 sink (sliding back down, only the top of
//           the head and the crest), 8 death (head down, jaw open, eyes out)
//   canvas 90x70 (grid 88x68)   anchor ax 44, ay 69   pack w/h 30x48 (that box fits the risen frames 1-6; frame 0
//   only stands ay-17 tall and frame 7 only ay-9, so a lurking state may want its own shorter box)
//   reach (teeth, the only thing that bites): lurk ax+12..ax+26, ay-8..ay-17; rise A ax+15..ax+27, ay-21..ay-29;
//          rise B ax+11..ax+23, ay-37..ay-45;
//          TELL ax-11..ax+2, ay-54..ay-60 — the mouth is up and BACK over the body, nowhere near the player;
//          BITE ax+22..ax+34, ay-32..ay-44, the open gullet filling ax+24..ax+31, ay-33..ay-42;
//          thrash ax+25..ax+36, ay-7..ay-16 (low and forward); recoil ax+3..ax+15, ay-10..ay-22;
//          sink ax+13..ax+17, ay-1; death ax+8..ax+15, ay-1..ay-12.
//          The dorsal crest stands 4-6 px off the back of the body, out to ax-15 in the rises and ax-32 in the tell
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
// drop a frame's drawing onto the grid's bottom row, so every frame's lowest pixel lands on ay-1
function settle(G) {
  let low = G.length - 1; while (low >= 0 && G[low].every(k => k === '.')) low--;
  const n = G.length - 1 - low; if (n <= 0 || low < 0) return G;
  const w = G[0].length; for (let i = 0; i < n; i++) { G.pop(); G.unshift(Array(w).fill('.')); }
  return G;
}
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
// a capsule from a to b, `w` thick; each pixel takes the char of the side it faces: ramp = [dark, base, light], lit
// from the upper left. a === b gives a disc, which is how the heads and bodies of the small animals are massed.
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
// a jaw of needle teeth: two tapered wedges hinged at `at` and opened `gape` degrees about the heading `ang` (degrees,
// 0 = straight ahead, negative = up). s runs along n, which is LEFT of the heading, so +s is the back/top of the head;
// each jaw's gum line faces the gullet and its teeth stand 1-2 px into it. The gullet is filled first so the teeth
// read against it. ch: { hi, mid, lo, gum, tooth, gullet, throat }
function needleJaw(G, o) {
  const ch = o.ch, rad = d => d * Math.PI / 180, hinge = o.at, shut = o.gape <= 9;
  const axis = deg => { const a = rad(deg), u = [Math.cos(a), Math.sin(a)]; return { u, n: [u[1], -u[0]] }; };
  const up = axis(o.ang - o.gape / 2), dn = axis(o.ang + o.gape / 2);
  if (o.gape > 9) {
    const tu = [hinge[0] + up.u[0] * o.up * 0.92, hinge[1] + up.u[1] * o.up * 0.92];
    const td = [hinge[0] + dn.u[0] * o.dn * 0.92, hinge[1] + dn.u[1] * o.dn * 0.92];
    gpoly(G, [hinge, tu, td], (x, y) => (Math.hypot(x - hinge[0], y - hinge[1]) < o.up * 0.38 ? ch.throat : ((x + y) & 1 ? ch.gullet : ch.throat)));
  }
  const wedge = (A, L, th, outer, sign) => {
    for (let t = 0; t <= L; t += 0.3) {
      const w = Math.max(0.55, th * (1 - 0.68 * t / L));
      for (let s = -w; s <= w + 0.001; s += 0.34) {
        const k = sign * s > w - 0.95 ? (shut ? ch.mid : ch.gum) : sign * s < -(w - 0.95) ? outer : ch.mid;
        put(G, hinge[0] + A.u[0] * t + A.n[0] * s, hinge[1] + A.u[1] * t + A.n[1] * s, k);
      }
      const ti = Math.round(t);
      if (Math.abs(t - ti) > 0.16 || ti % 2 || t < 0.8 || t > L - 0.6) continue;
      const fang = ti % 4 === 0;
      for (let e = 1; e <= (fang ? 2 : 1); e++) put(G, hinge[0] + A.u[0] * t + A.n[0] * sign * (w + e), hinge[1] + A.u[1] * t + A.n[1] * sign * (w + e), fang && e === 1 ? ch.tooth2 : ch.tooth);
    }
  };
  wedge(up, o.up, o.thU, ch.hi, -1);
  wedge(dn, o.dn, o.thD, ch.lo, 1);
  if (!shut) return;
  const mid = axis(o.ang);
  gline(G, hinge[0], hinge[1], hinge[0] + mid.u[0] * o.dn * 0.96, hinge[1] + mid.u[1] * o.dn * 0.96, ch.throat);
}
// a swing's smear: a pale foam arc of radius r round (cx, cy) in canvas pixels, from angle a0 to a1 (degrees,
// 0 = ahead, -90 = straight up), drawn after the outline and only on empty pixels; the last 60% gets a second band
function smear(c, cx, cy, r, a0, a1, maxY = Infinity) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data, seen = new Set();
  for (let a = a0; a <= a1; a += 2) for (const [rr, col] of [[r, '#e8faf2'], [r - 1, a > a0 + (a1 - a0) * 0.4 ? '#9fd6c8' : null]]) {
    if (!col) continue;
    const x = Math.round(cx + rr * Math.cos(a * Math.PI / 180)), y = Math.round(cy + rr * Math.sin(a * Math.PI / 180)), k = x + ',' + y;
    if (seen.has(k) || x < 0 || y < 0 || x >= c.width || y >= c.height || y > maxY) continue;
    seen.add(k);
    if (!d[(y * c.width + x) * 4 + 3]) px(g, x, y, col);
  }
}
// a halo: `col` on every empty pixel within `rad` of one of the given CANVAS points (grid + 1), after the outline. The
// outline itself is eaten inside `rad - 1`, or the dark ring would cut the glow off from the thing that is glowing.
function halo(c, pts, rad, col) {
  const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const i = (y * c.width + x) * 4, dark = d[i] === 0x1b && d[i + 1] === 0x16 && d[i + 2] === 0x26;
    if (d[i + 3] && !dark) continue;
    let m = 99; for (const [bx, by] of pts) m = Math.min(m, Math.hypot(bx - x, by - y));
    if (m <= (dark ? rad - 1 : rad)) px(g, x, y, col);
  }
}

// ---------- THE DROWNED (sailor, netter, net) ----------
// bloated grey-green flesh h/s/S/g, milky eye e, slack mouth m; weed k/K/q; rotted jerkin leather j/J/u torn open
// on a raw wound r; rope n/N; pole wood w/W; wet iron i/I and lead weights d
const RF = { o: OUT, h: '#b4c4a4', s: '#8ba089', S: '#5d7263', g: '#3d4c44', e: '#e6f0dc', m: '#43202c',
  k: '#5d7d36', K: '#3c5624', q: '#243a18',
  j: '#8a6a46', J: '#5b4329', u: '#38291a',
  n: '#d8c894', N: '#7c6c3a',
  w: '#a8864e', W: '#6f5630',
  i: '#c0c8d0', I: '#848c96', d: '#474e58', r: '#8e3a3a' };

// ---------- DROWNED SAILOR ----------
export function bakeSailor() {
  const W = 40, H = 26, X = 19;
  const q = G => outline(fromGrid(rowsOf(settle(G)), RF, 1), OUT);
  // parts are 9 wide with column 4 on the body's centre; the profile faces right, so the face sits at columns 5-8
  const HEAD = [
    '..kkKk...',
    '.kKhhhkK.',
    '.KhhhhhSs',
    'hsShhSeSh',
    '.qKhhhhms',
    '..qKShhSs',
    '...qKSs..',
  ];
  const TORSO = [
    '..sShhS..',
    '.jJjjjJu.',
    'jJjjhjJJu',
    'jJjjjjJJu',
    'jJhrjjJJu',
    'jJjjjjJJu',
    '.jJjjjJu.',
    '.uJJJJJu.',
    '..SshsS..',
    '..SshsS..',
  ];
  // legs are 13 wide with column 6 on the centre; the near leg is the lit one and wears no boot
  const LEGS = {
    a: ['....SShh.....',
      '...SS..hh....',
      '...Sg...hh...',
      '..gg....ss...',
      '..gg....ss...',
      '.ggg....ss...',
      '.uJu...hhhh..'],
    b: ['....SShh.....',
      '....SShh.....',
      '....Sghs.....',
      '...gg..ss....',
      '...gg..ss....',
      '..gg...hhh...',
      '..uJu........'],
    c: ['....hhSS.....',
      '...hh..SS....',
      '...hs...Sg...',
      '..ss....gg...',
      '..ss....gg...',
      '.hhh....ggg..',
      'hhhh....uJu..'],
    d: ['....hhSS.....',
      '....hhSS.....',
      '....hsSg.....',
      '...ss..gg....',
      '...ss..gg....',
      '..hhh..uJu...',
      '.hhhh........'],
    guard: ['....SShh.....',
      '...SS...hh...',
      '..gg.....ss..',
      '..gg.....ss..',
      '.gg......ss..',
      '.gg......ss..',
      'uJJu....hhhh.'],
    tell: ['....SShh.....',
      '...SS..hh....',
      '..gS...hs....',
      '..gg...ss....',
      '.gg....ss....',
      '.gg....ss....',
      'uJu...hhhh...'],
    hook: ['....SShh.....',
      '...SS...hh...',
      '..gS.....hh..',
      '..gg......ss.',
      '.gg.......ss.',
      '.gg.......ss.',
      'uJu......hhhh'],
  };
  // the boathook: a banded wooden pole, an iron ferrule, a spike at the tip and a barb hooked back off its side
  const boathook = (G, b, t, side) => {
    const dx = t[0] - b[0], dy = t[1] - b[1], L = Math.hypot(dx, dy) || 1, u = [dx / L, dy / L], p = [-u[1] * side, u[0] * side];
    gline(G, b[0], b[1], t[0], t[1], (i, n) => (i > n - 4 ? 'I' : i % 4 === 0 ? 'W' : 'w'));
    const tip = [Math.round(t[0]), Math.round(t[1])];
    const E = [tip[0] + p[0] * 2.2, tip[1] + p[1] * 2.2], K = [E[0] - u[0] * 3.4, E[1] - u[1] * 3.4];
    put(G, tip[0], tip[1], 'i');
    gline(G, tip[0] + p[0] * 0.9, tip[1] + p[1] * 0.9, E[0], E[1], 'I');
    gline(G, E[0], E[1], K[0], K[1], (i, n) => (i > n - 2 ? 'i' : 'I'));
  };
  // a rotted sleeve to the elbow, bare bloated forearm beyond it
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.3, far ? ['u', 'u', 'J'] : ['u', 'J', 'j']);
    limb(g, el, hd, 1.9, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    put(g, hd[0], hd[1], far ? 'S' : 'h');
  });
  // hands are given on the pole itself, so both fists close on it in every pose
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    const P = (u, v) => [B + u, v + dy], hk = [P(...o.hook[0]), P(...o.hook[1])];
    if (o.back) layer(G, g => boathook(g, hk[0], hk[1], o.side));
    arm(G, [B - 2, 11 + dy], P(...o.far[0]), P(...o.far[1]), true);
    stamp(G, B - 6, 19 + dy, LEGS[o.legs]);
    stamp(G, O, 9 + dy, TORSO);
    layer(G, g => stamp(g, O + (o.hx || 0), 2 + dy, HEAD));
    if (!o.back) layer(G, g => boathook(g, hk[0], hk[1], o.side));
    arm(G, [B + 2, 11 + dy], P(...o.near[0]), P(...o.near[1]));
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  // walk: the pole is carried across the body on the same diagonal in all four frames and bobs with him
  const walk = i => frame({ legs: 'abcd'[i], dy: i === 0 || i === 2 ? 1 : 0, side: 1,
    hook: [[-9, 24], [6, 4]],
    far: [[-4, 15], [-5, 19]], near: [[1, 13], [-1, 14]] });
  const guard = frame({ legs: 'guard', dy: 1, side: 1,
    hook: [[-8, 14], [9, 6]],
    far: [[-2, 13], [-3, 12]], near: [[4, 10], [5, 8]] });
  const tell = frame({ legs: 'tell', dx: -2, dy: 1, hx: -1, side: -1, back: true,
    hook: [[6, 20], [-13, 8]],
    far: [[0, 14], [2, 17]], near: [[0, 13], [-2, 15]] });
  const hook = frame({ legs: 'hook', dx: 2, dy: 1, hx: 1, side: 1,
    hook: [[-6, 11], [14, 20]],
    far: [[-3, 11], [-3, 12]], near: [[3, 13], [3, 15]],
    smear: [1 + X + 2, 1 + 13, 17, -112, 26, 26] });
  return pack([walk(0), walk(1), walk(2), walk(3), guard, tell, hook], X + 1, H + 1, 10, 18);
}

// ---------- NETTER ----------
export function bakeNetter() {
  const W = 34, H = 26, X = 16;
  const q = G => outline(fromGrid(rowsOf(settle(G)), RF, 1), OUT);
  // head pushed forward out of a humped back; lank weed hair, no ear showing, the jaw hanging open
  const HEAD = [
    '..kkkk...',
    '.kKkhhkK.',
    '.Kkhhhhhs',
    'qKkhhheSh',
    '.qKhhhhhs',
    '..qKhmmSs',
    '...qKSss.',
  ];
  const TORSO = [
    'JJjsshS..',
    'jJjjjjJu.',
    'jJjjhjJu.',
    'jJjjjjJJu',
    'jJhrjjJJu',
    '.jJjjjJu.',
    '..uJJJu..',
    '..SshsS..',
  ];
  const LEGS = {
    a: ['....SShh.....',
      '...SS..hh....',
      '..gg....hs...',
      '..gg....ss...',
      '.gg.....ss...',
      '.gg.....ss...',
      'uJu....hhhh..'],
    b: ['....SShh.....',
      '....SShh.....',
      '...gg..hs....',
      '...gg..ss....',
      '..gg...ss....',
      '..gg...hhh...',
      '..uJu........'],
    c: ['....hhSS.....',
      '...hh..SS....',
      '..ss....Sg...',
      '..ss....gg...',
      '.ss.....gg...',
      '.ss.....gg...',
      'hhhh....uJu..'],
    d: ['....hhSS.....',
      '....hhSS.....',
      '...ss..Sg....',
      '...ss..gg....',
      '..ss...gg....',
      '..hhh..uJu...',
      '.hhhh........'],
    coil: ['....SShh.....',
      '...SS...hh...',
      '..gg.....hs..',
      '..gg.....ss..',
      '.gg......ss..',
      '.gg......ss..',
      'uJu.....hhhh.'],
    lunge: ['....SShh.....',
      '...SS...hh...',
      '..gS.....hh..',
      '..gg......ss.',
      '.gg.......ss.',
      '.gg.......ss.',
      'uJu......hhhh'],
    wide: ['....SShh.....',
      '..SSS...hhh..',
      '..gg......ss.',
      '.gg.......ss.',
      '.gg.......ss.',
      'gg........ss.',
      'uJu......hhhh'],
  };
  // the net: a knotted bundle of weighted rope with two leads hanging off it
  const BUNDLE = [
    '..nn..',
    '.nNnN.',
    'nNnNnN',
    'NnNnNn',
    '.NnNn.',
    '.d..d.',
  ];
  const arm = (G, sh, el, hd, far) => layer(G, g => {
    limb(g, sh, el, 2.2, far ? ['u', 'u', 'J'] : ['u', 'J', 'j']);
    limb(g, el, hd, 1.8, far ? ['g', 'S', 'S'] : ['S', 's', 'h']);
    put(g, hd[0], hd[1], far ? 'S' : 'h');
  });
  const frame = o => {
    const G = blank(W, H), B = X + (o.dx || 0), dy = o.dy || 0, O = B - 4;
    arm(G, [B - 2, 13 + dy], o.far[0], o.far[1], true);
    stamp(G, B - 6, 19 + dy, LEGS[o.legs]);
    stamp(G, O, 11 + dy, TORSO);
    layer(G, g => stamp(g, O + 2 + (o.hx || 0), 4 + dy, HEAD));
    arm(G, [B + 2, 13 + dy], o.near[0], o.near[1]);
    if (o.net) layer(G, g => stamp(g, o.net[0], o.net[1], BUNDLE));
    const c = q(G);
    if (o.smear) smear(c, ...o.smear);
    return c;
  };
  const walk = i => {
    const dy = i === 0 || i === 2 ? 1 : 0;
    return frame({ legs: 'abcd'[i], dy,
      far: [[X - 4, 16 + dy], [X - 6, 18 + dy]], near: [[X + 4, 15 + dy], [X + 6, 17 + dy]],
      net: [X + 4, 18 + dy] });
  };
  // tell: coiled back over the rear foot, the net swung up and back behind his shoulder
  const tell = frame({ legs: 'coil', dx: -1, hx: -1,
    far: [[X - 4, 15], [X - 7, 14]], near: [[X - 4, 11], [X - 8, 8]],
    net: [X - 13, 3] });
  // throw: lunging, the arm whipped out in front and the hand open and empty
  const thr = frame({ legs: 'lunge', dx: 2, dy: 1, hx: 1,
    far: [[X - 1, 16], [X - 3, 17]], near: [[X + 5, 12], [X + 8, 10]],
    smear: [1 + X + 3, 1 + 14, 11, -110, 18] });
  // empty: hunched lower, stalking with both arms spread wide and the hands open
  const empty = frame({ legs: 'wide', dy: 2, hx: 1,
    far: [[X - 5, 16], [X - 9, 15]], near: [[X + 5, 16], [X + 9, 15]] });
  return pack([walk(0), walk(1), walk(2), walk(3), tell, thr, empty], X + 1, H + 1, 10, 18);
}

// ---------- THE THROWN NET ----------
export function bakeNet() {
  const W = 18, H = 18, C = 9;
  const q = G => outline(fromGrid(rowsOf(G), RF, 1), OUT);
  // a diamond mesh: concentric rings of knotted cord with spokes between them, lead weights at the rim
  const mesh = (G, rings, spokes, weights) => {
    const tip = (deg, r) => [C + Math.cos(deg * Math.PI / 180) * r, C + Math.sin(deg * Math.PI / 180) * r];
    for (const r of rings) for (let a = 0; a < 360; a += 90) {
      const p0 = tip(a, r), p1 = tip(a + 90, r);
      gline(G, p0[0], p0[1], p1[0], p1[1], (i) => (i % 2 ? 'n' : 'N'));
    }
    const step = 360 / spokes, outer = rings[rings.length - 1];
    for (let a = 0; a < 360; a += step) {
      const p = tip(a, outer);
      gline(G, C, C, p[0], p[1], (i, n) => (i === 0 ? 'n' : i % 2 ? 'N' : 'n'));
    }
    for (const a of weights) {
      const p = tip(a, outer + 1.2);
      put(G, p[0], p[1], 'd');
      put(G, p[0], p[1] + 1, 'I');
    }
  };
  // balled: the mesh is still bundled, so it is a solid knot of cord with its weights tucked against it
  const balled = () => {
    const G = blank(W, H);
    gpoly(G, [[C - 3.4, C], [C, C - 3.4], [C + 3.4, C], [C, C + 3.4]], (x, y) => ((x + y) & 1 ? 'n' : 'N'));
    mesh(G, [4], 4, [45, 135, 225, 315]);
    return q(G);
  };
  const half = () => { const G = blank(W, H); mesh(G, [3, 6], 8, [0, 60, 120, 180, 240, 300]); return q(G); };
  const spread = () => { const G = blank(W, H); mesh(G, [4, 8], 8, [0, 45, 90, 135, 180, 225, 270, 315]); return q(G); };
  return { frames: [balled(), half(), spread()] };
}

// ---------- URCHIN ----------
const UR = { o: OUT, v: '#342c4a', V: '#1b1528', b: '#4e4068', p: '#c9bde6', e: '#f0e8ff' };
export function bakeUrchin() {
  const W = 20, H = 20, X = 10, CY = 10;
  const q = G => outline(fromGrid(rowsOf(settle(G)), UR, 1), OUT);
  // the straight-up and straight-down spines are 9 long in every frame, so the settle() never shifts the body
  const spines = (G, set, pale) => set.forEach(([deg, len]) => {
    const a = deg * Math.PI / 180;
    gline(G, X + Math.cos(a) * 2.2, CY + Math.sin(a) * 2.2, X + Math.cos(a) * len, CY + Math.sin(a) * len,
      (i, n) => (pale && i > n - 3 ? 'p' : i > n - 2 ? (pale ? 'p' : 'b') : (i & 1) ? 'v' : 'V'));
  });
  const test = G => {
    limb(G, [X, CY], [X, CY], 6.4, ['V', 'v', 'b']);
    put(G, X - 2, CY - 1, 'e'); put(G, X + 1, CY - 2, 'b'); put(G, X + 1, CY + 1, 'V');
  };
  const drift = ph => {
    const G = blank(W, H), set = [[-90, 9], [90, 9]];
    for (let a = -45; a < 270; a += 45) { if (a === 90) continue; set.push([a, 7.4 + 1.6 * (0.5 + 0.5 * Math.sin(a / 57.3 * 2 + ph))]); }
    for (let a = -67.5; a < 292.5; a += 45) { if (a === 112.5 || a === 67.5) continue; set.push([a, 4.6 + 1.4 * (0.5 + 0.5 * Math.sin(a / 57.3 * 2 + ph + 2))]); }
    spines(G, set, false); test(G);
    return q(G);
  };
  const bristle = () => {
    const G = blank(W, H), set = [[-90, 9], [90, 9]];
    for (let a = -67.5; a < 292.5; a += 22.5) { if (a === 90 || a === 270) continue; set.push([a, a % 45 === 0 ? 8.8 : 7.8]); }
    spines(G, set, true); test(G);
    put(G, X - 1, CY - 2, 'e'); put(G, X + 1, CY - 2, 'e');
    return q(G);
  };
  return pack([drift(0), drift(2.1), drift(4.2), bristle()], X + 1, H + 1, 12, 12);
}

// ---------- ANGLER ----------
// near-black deep-water flank D/A/a with a pale belly B/b, fin rays k, glassy teeth t/T, red gullet r/m with pale
// gums p, a cold blue-green lure x/X on a stalk y, and one lit eye e in a black socket G
const AN = { o: OUT, a: '#4a5a6e', A: '#2f3b4c', D: '#1a2230', b: '#93a0b0', B: '#66727f',
  k: '#222b38', t: '#f2f7ff', T: '#b9c6cf', m: '#401a26', r: '#7e2c3a', p: '#c98f92',
  x: '#f2fff8', X: '#8ef2da', y: '#3fb0a2', e: '#ffe9a0', G: '#0e1118' };
export function bakeAngler() {
  const W = 36, H = 22, X = 14;
  const q = G => outline(fromGrid(rowsOf(settle(G)), AN, 1), OUT);
  const SP = 13.5;
  const JAW = { hi: 'a', mid: 'A', lo: 'B', gum: 'p', tooth: 't', tooth2: 'T', gullet: 'r', throat: 'm' };
  const body = (G, dx) => {
    const p = [[19, 6.5], [22, 9], [22.5, 12.5], [21.5, 16], [19, 19], [14, 20.2], [9, 19.6], [5.5, 18], [3.6, 15], [4.2, 12], [7, 9.6], [12, 7.4]];
    gpoly(G, p.map(([x, y]) => [x + dx, y]), (x, y) => {
      const v = y - SP;
      return v < -4.5 ? 'D' : v < -2 ? ((x + y) & 1 ? 'A' : 'D') : v < 1.2 ? 'A' : v < 3 ? ((x + y) & 1 ? 'a' : 'A') : v < 4.6 ? 'B' : 'b';
    });
  };
  // fins: a spined dorsal over the back, a ragged pectoral behind the gill, a short pelvic under the belly
  const fins = (G, dx) => {
    for (let i = 0; i < 4; i++) gline(G, 9 + dx + i * 2.4, 8.4 - i * 0.4, 8 + dx + i * 2.4, 5.4 - i * 0.3, 'k');
    gline(G, 9 + dx, 8.4, 16 + dx, 6.6, 'k');
    for (let i = 0; i < 3; i++) gline(G, 14 + dx, 16, 10 + dx - i, 18 + i, 'k');
    for (let i = 0; i < 3; i++) gline(G, 10 + dx, 19.6, 8 + dx - i, 21, 'k');
  };
  const tail = (G, dx, ph) => {
    const y0 = 14.5 + ph * 2.2;
    gpoly(G, [[5 + dx, 12.5], [1 + dx, y0 - 5], [0.4 + dx, y0 - 1.4], [2.4 + dx, y0 + 0.6], [0.4 + dx, y0 + 4], [1.2 + dx, y0 + 6.4], [5 + dx, 16.5]],
      (x, y) => ((x + y) & 1 ? 'k' : 'D'));
    gline(G, 3 + dx, y0 - 4, 4 + dx, 13.6, 'A');
  };
  const eye = (G, dx, bright) => {
    limb(G, [18 + dx, 10], [18 + dx, 10], 3.4, ['G', 'G', 'G']);
    put(G, 18 + dx, 10, 'e'); put(G, 19 + dx, 10, bright ? 'e' : 'G');
    if (bright) { put(G, 18 + dx, 9, 'e'); put(G, 19 + dx, 9, 'G'); }
  };
  // the illicium: a whip of a stalk off the brow with the lure swinging at its end
  const lure = (G, dx, bob, blaze) => {
    const pts = [];
    const a = [15 + dx, 7.2], b = [19 + dx + bob[0] * 0.4, 3 + bob[1]], c = [22 + dx + bob[0], 2 + bob[1]];
    for (let t = 0; t <= 1; t += 0.08) {
      const u = 1 - t, x = u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], y = u * u * a[1] + 2 * u * t * b[1] + t * t * c[1];
      put(G, x, y, t > 0.8 ? 'X' : 'y'); pts.push([x, y]);
    }
    const L = [Math.round(c[0]), Math.round(c[1])];
    limb(G, L, L, blaze ? 4.2 : 3.2, ['X', 'X', 'x']);
    put(G, L[0], L[1], 'x'); put(G, L[0] + 1, L[1], 'x');
    return L;
  };
  const fish = o => {
    const G = blank(W, H), dx = o.dx || 0;
    tail(G, dx, o.ph);
    fins(G, dx);
    body(G, dx);
    layer(G, g => needleJaw(g, { at: [21.5 + dx, 13.4], ang: o.ang, gape: o.gape, up: 11, dn: 10, thU: 1.9, thD: 1.8, ch: JAW }));
    eye(G, dx, o.bright);
    let L = null;
    layer(G, g => { L = lure(g, dx, o.bob, o.blaze); });
    const c = q(G);
    if (o.blaze) halo(c, [[L[0] + 1, L[1] + 1]], 3.2, '#8ef2da');
    return c;
  };
  return pack([
    fish({ ph: -1, gape: 20, ang: -4, bob: [0, 0] }),
    fish({ ph: 1, gape: 15, ang: -2, bob: [-1, 1] }),
    fish({ ph: 0, gape: 3, ang: -3, bob: [0, -1], blaze: true, bright: true }),
    fish({ ph: 0, gape: 64, ang: -2, bob: [-7, 1], dx: 2 }),
  ], X + 1, H + 1, 20, 14);
}

// ---------- STORM PETREL ----------
const PT = { o: OUT, d: '#4c5466', D: '#2c313d', g: '#7e8a9c', G: '#5a6478', k: '#12141c',
  w: '#e8ecf4', W: '#aab4c4', e: '#f4f0dc' };
export function bakePetrel() {
  const X = 10;
  const q = rows => outline(fromGrid(rowsOf(settle(rows.map(r => r.split('')))), PT, 1), OUT);
  // sooty body d/D, lit near wing g/G, blacked primaries and bill k, the white rump band w/W, an eye glint e.
  // The flap pair shares one body block and the trailing feet keep the up-stroke only 2 px off the down-stroke floor.
  const flapUp = q([
    '......................',
    '....kk..........kk....',
    '.....kD........Ggk....',
    '......DD......Ggg.....',
    '.......DD....Ggg......',
    '........DD..Ggg.......',
    '.........DDGgg........',
    '........dddGg.dddd....',
    '.kkDdWwdddddddddedkk..',
    '...DdwWdddddddddDD....',
    '.kkDdWWDDDDDDDDD......',
    '.....DD...............',
    '......................',
    '......................',
  ]);
  const flapDown = q([
    '......................',
    '......................',
    '......................',
    '......................',
    '......................',
    '......................',
    '......................',
    '........ddddd.dddd....',
    '.kkDdWwdddddddddedkk..',
    '...DdwWdddddddddDD....',
    '.kkDdWWDDDDDDDDD......',
    '.......GGG..Ggg.......',
    '.....GGG......Ggg.....',
    '...kk...........gk....',
  ]);
  // dive: wings swept back along the body, the whole bird one dart from tail to beak
  const dive = q([
    '......................',
    '..kk..................',
    '..kDdd................',
    '...kDdd...............',
    '....kDddG.............',
    '.....kDddG............',
    '......kDddG...........',
    '.......kDddg..........',
    '........kDddg.........',
    '.........kDdde........',
    '..........kDddk.......',
    '...........kDdk.......',
    '............kk........',
    '.............k........',
  ]);
  // pull up: both wings thrown forward and cupped to brake, tail fanned out behind and down
  const pull = q([
    '......................',
    '.................kk...',
    '................kgG...',
    '...............kgg....',
    '..............kgddd...',
    '.............kgddedkk.',
    '........dddddgddd.....',
    '......Dddddddddgd.....',
    '....DDwwddddGGGkk.....',
    '...DDdddddddD.........',
    '..DDDdddD.............',
    '..DDDD................',
    '...DD.................',
    '......................',
  ]);
  return pack([flapUp, flapDown, dive, pull], X + 1, 15, 10, 8);
}

// ---------- THE REEFMAW ----------
// mottled green-black hide h/s/S/D, pale sagging belly b/B, glassy teeth t with a shaded base T, red gullet r into a
// black throat m with pale gums p, ragged dorsal membrane f/F, gill pores G, black eye k with a lit reflex e
const MW = { o: OUT, h: '#5d7a4a', s: '#41583a', S: '#2a3a28', D: '#16211a', b: '#c8cfa8', B: '#9aa47e',
  t: '#eef6ee', T: '#b8c8c0', m: '#3a1320', r: '#8a3442', p: '#d8b8a0',
  f: '#7e9a58', F: '#3a4c30', G: '#1d2c1c', k: '#0d110d', e: '#f4e8a0' };
export function bakeReefmaw() {
  const W = 88, H = 68, X = 43;
  const q = G => outline(fromGrid(rowsOf(settle(G)), MW, 1), OUT);
  const JAW = { hi: 'h', mid: 's', lo: 'B', gum: 'p', tooth: 't', tooth2: 'T', gullet: 'r', throat: 'm' };
  // a de Casteljau curve through the control points, radius lerped base -> neck
  const curve = (cp, r0, r1, steps = 44) => {
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, p = cp.map(c => c.slice());
      for (let k = cp.length - 1; k > 0; k--) for (let j = 0; j < k; j++) p[j] = [p[j][0] + (p[j + 1][0] - p[j][0]) * t, p[j][1] + (p[j + 1][1] - p[j][1]) * t];
      out.push([p[0][0], p[0][1], r0 + (r1 - r0) * t]);
    }
    return out;
  };
  // the forebody: a tapered tube along the centreline. Each cell takes its nearest sample and is shaded by the side of
  // the spine it sits on — the back (left of travel, the outside of the rise) mottled green-black, the belly pale and
  // sagging — and a ragged dorsal crest stands off the back over the head end of it.
  const moray = (G, pts, crest) => {
    const n = pts.length;
    for (let y = 0; y < G.length; y++) for (let x = 0; x < G[0].length; x++) {
      let bi = -1, bd = 1e9;
      for (let i = 0; i < n; i++) { const dx = x + 0.5 - pts[i][0], dy = y + 0.5 - pts[i][1], d = dx * dx + dy * dy; if (d < bd) { bd = d; bi = i; } }
      const [cx, cy, r] = pts[bi], d = Math.sqrt(bd);
      if (d > r) continue;
      const a = pts[Math.max(0, bi - 1)], c = pts[Math.min(n - 1, bi + 1)], tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty) || 1;
      const v = ((x + 0.5 - cx) * (ty / tl) + (y + 0.5 - cy) * (-tx / tl)) / Math.max(r, 0.01);
      const mot = ((Math.floor((x + (y % 3)) / 3) * 11 + Math.floor((y + (x % 2) * 2) / 3) * 7) % 9) < 3;
      G[y][x] = v > 0.42 ? (mot ? 'D' : 'S') : v > 0.02 ? (mot ? 'D' : 's') : v > -0.45 ? (mot ? 'S' : 'h') : v > -0.78 ? (mot ? 's' : 'B') : 'b';
    }
    if (!crest) return;
    for (let i = Math.floor(n * 0.28); i < n; i++) {
      const [cx, cy, r] = pts[i], a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
      const tx = c[0] - a[0], ty = c[1] - a[1], tl = Math.hypot(tx, ty) || 1, nx = ty / tl, ny = -tx / tl;
      if (i % 11 === 5) continue;
      const ramp = Math.min(1, (i - n * 0.28) / (n * 0.16));
      const hh = crest * ramp * (i % 3 ? 2.5 : 4.2 + 1.2 * Math.sin(i * 0.9));
      for (let e = -0.4; e <= hh; e += 0.45) put(G, cx + nx * (r + e), cy + ny * (r + e), e > hh - 1.1 ? 'F' : 'f');
    }
  };
  // the head: a blunt cranium behind the hinge, the long jaw in front of it, the eye over the jaw line and three gill
  // pores behind. ang is the heading in degrees (0 ahead, negative up); n is left of it, so +s is the top of the head.
  const head = (G, o) => {
    const a = o.ang * Math.PI / 180, u = [Math.cos(a), Math.sin(a)], n = [u[1], -u[0]];
    const at = (d, s = 0) => [o.at[0] + u[0] * d + n[0] * s, o.at[1] + u[1] * d + n[1] * s];
    limb(G, at(-13, -0.6), at(-4, 0.4), 11.6, ['S', 's', 'h']);
    limb(G, at(-5, 0.2), at(1.5, 0.2), 9.8, ['S', 's', 'h']);
    for (let i = 0; i < 3; i++) put(G, ...at(-12 - i * 2.6, 2.6 - i * 0.5), 'G');
    needleJaw(G, { at: at(1.2, 0), ang: o.ang, gape: o.gape, up: o.up || 18, dn: o.dn || 16, thU: 3, thD: 2.6, ch: JAW });
    gline(G, ...at(-8, 4.4), ...at(0.5, 3.4), 'S');
    const E = at(-2.6, 2.9).map(Math.round);
    if (o.eye === 'out') { put(G, E[0], E[1], 'B'); put(G, E[0] + 1, E[1], 'S'); put(G, E[0], E[1] - 1, 'S'); }
    else {
      put(G, E[0], E[1], 'k'); put(G, E[0] + 1, E[1], 'k'); put(G, E[0], E[1] - 1, 'k');
      if (o.eye === 'lit') { put(G, E[0] + 1, E[1] - 1, 'e'); } else { put(G, E[0] + 1, E[1] - 1, 'S'); }
    }
    return at;
  };
  const frame = o => {
    const G = blank(W, H);
    moray(G, curve(o.cp, o.r0 || 9.4, o.r1 || 6), o.crest === undefined ? 1 : o.crest);
    layer(G, g => head(g, { at: o.at, ang: o.ang, gape: o.gape, eye: o.eye || 'lit', up: o.up, dn: o.dn }));
    return q(G);
  };
  const lurk = frame({ cp: [[40, 80], [40, 66], [43, 59]], at: [52, 56], ang: -8, gape: 2, crest: 0.7 });
  const riseA = frame({ cp: [[38, 80], [41, 62], [47, 48]], at: [55, 44], ang: -11, gape: 8 });
  const riseB = frame({ cp: [[36, 80], [45, 58], [36, 40], [43, 33]], at: [51, 29], ang: -16, gape: 12 });
  const tell = frame({ cp: [[43, 80], [58, 54], [19, 34], [26, 22]], at: [30, 18], ang: -28, gape: 30, crest: 1.9 });
  const bite = frame({ cp: [[44, 80], [40, 56], [52, 36], [57, 32]], at: [60, 30], ang: 2, gape: 62, crest: 1.3, up: 18, dn: 16 });
  const thrash = frame({ cp: [[48, 80], [22, 56], [66, 44], [59, 51]], at: [63, 53], ang: 26, gape: 30, crest: 1.5 });
  const recoil = frame({ cp: [[40, 80], [47, 58], [41, 47]], at: [45, 45], ang: 48, gape: 26, crest: 0.5, eye: 'dim' });
  const sink = frame({ cp: [[42, 80], [44, 70], [47, 65]], at: [51, 72], ang: -6, gape: 2, crest: 1.2, eye: 'dim' });
  const death = frame({ cp: [[40, 80], [49, 63], [43, 55]], at: [47, 53], ang: 62, gape: 38, crest: 0.35, eye: 'out' });
  return pack([lurk, riseA, riseB, tell, bite, thrash, recoil, sink, death], X + 1, H + 1, 30, 48);
}
