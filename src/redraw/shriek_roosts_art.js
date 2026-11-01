// shriek_roosts_art.js - THE SISTERS' ROOSTS, THE SUPPORT MOVES' READS AND THE TURN PORTRAITS DRAWN (claude/rookery4art). The greybox (claude/rookery4) drew bone nests as a row of white
// dashes on a grey line; here the summit's new footing is real crag work, in the Sisters' Crag stone (rookery_pal PAL[4]) so nothing looks borrowed:
//   THE NEST       a woven bowl of grey twig under a rim of bleached ribs with knuckle ends, sticks and a skull on the lip, guano down its side, lashed in sinew to the top of
//                  THE CRACKED ARM - a leaning rose-stone strut, strata, a black crack through it - whose FOOT on the floor is a cracked block wearing the shared gold ring (B10).
//   SNAPPED        the arm breaks: a spray of stone, bone and sticks (1 s) over a dust ring; the nest lies tilted on a ragged STUMP with the arm's rubble round it, rim at the cell row.
//   THE OVERHANG   a hanging slab of crag with a guano lip, stalactite teeth and a black crack, on a leaning pier; broken it is THREE STEPS - blocks, each on a toppled pier stub,
//                  a rubble heap at the foot, the gold ring gone.
//   THE VENTS      PLUGGED: a lashed cap of bone, rubble and guano over a dark mouth; OPEN: the mouth lit from below, rim chips and a column of updraft - streaks, a swirl, loose feathers.
//   THE MOVES      the pebble (a spinning rose-stone with a trail) and its ring, the support MARK (a magenta eye-sigil ring: not the scream's red post), the friendly-fire line
//                  (chevrons running Hunter -> sister, with an arrowhead and a crossed-out bird), the FALL ARC of a crashed sister (a trail of feathers and a landing burst).
//   THE PORTRAITS  the boss bar's three bird heads (9 x 9): the Diver dark with a pale swept crest, the Shrieker pale on a long neck with a red fan, the Snatcher broad, scarred and shaggy.
// Everything is live-drawn rectangles/strokes from tiny code (no state but a snap time on the nest / overhang / vent object).
import { PAL, GUANO, BONE, TWIG, mix } from './rookery_pal.js';
const S = PAL[4].s, SINEW = ['#5a4a32', '#8a7650', '#b8a47a', '#d8c8a0'];
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const hash = i => (Math.imul(i + 7, 2654435761) >>> 0) % 1000 / 1000;
const blink = (time, a = '#ffd36b', b = 'rgba(255,211,107,0.5)') => Math.floor(time * 3) % 2 ? a : b;

/* THE SHARED GOLD RING on a cracked foot (B10): kept exactly as the greybox drew it */
export function crackRing(g, cx, fy, w, time) { g.strokeStyle = blink(time); g.strokeRect(R(cx - w / 2) + 0.5, fy - 2.5, w - 1, 5); }

/* a stone pier/strut from (x0, y0) (the foot, low) up to (x1, y1) (the top, high): tapered, lit on the left, strata, a zig-zag crack, a guano cap. hw0 / hw1 = half widths */
function strut(g, x0, y0, x1, y1, hw0, hw1, crack) {
  const n = Math.max(1, Math.abs(y0 - y1));
  for (let i = 0; i <= n; i++) {
    const t = i / n, y = R(y0 + (y1 - y0) * t), x = R(x0 + (x1 - x0) * t), hw = R(hw0 + (hw1 - hw0) * t);
    rect(g, x - hw, y, hw * 2, 1, S[3]); rect(g, x - hw, y, Math.max(1, R(hw * 0.7)), 1, S[4]); rect(g, x + hw - Math.max(1, R(hw * 0.55)), y, Math.max(1, R(hw * 0.55)), 1, S[2]);
    px1(g, x - hw, y, S[1]); px1(g, x + hw - 1, y, S[1]);
    if (i % 9 === 4) rect(g, x - hw + 1, y, hw * 2 - 2, 1, S[2]);          /* a stratum */
    if (i % 13 === 6) px1(g, x - hw + 2, y, S[5]);                           /* a lit chip */
  }
  if (crack) { g.fillStyle = S[0]; for (let i = 0; i < n; i += 1) { const t = i / n, y = R(y0 + (y1 - y0) * t), x = R(x0 + (x1 - x0) * t) + ((i >> 2) % 2 ? 1 : -1) * (1 + (i % 4 === 0 ? 1 : 0)); if (i > n * 0.15 && i < n * 0.85) g.fillRect(x, y, 1, 1); } }
  rect(g, x1 - hw1 - 1, R(y1), hw1 * 2 + 2, 1, GUANO[2]);
}
const px1 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };

/* THE BOWL: width w at rim row T0 (centre nx). tilt = px the left side sags (a dropped nest). Woven twig under bleached ribs */
function bowl(g, nx, T0, w, tilt, time) {
  const L = R(nx - w / 2), deep = 11;
  for (let r = 0; r < deep; r++) {                                          /* the woven bowl, narrowing toward the base */
    const inset = R(Math.pow(r / deep, 1.6) * w * 0.3), x0 = L + inset, ww = w - inset * 2, sag = tilt ? R((1 - r / deep) * 0 + tilt * 0.25) : 0;
    for (let x = 0; x < ww; x += 3) { const k = (x + r * 2 + inset) % 6 < 3; rect(g, x0 + x, T0 + 3 + r + sag, 3, 1, k ? TWIG[2] : TWIG[1]); if (((x * 3 + r) % 7) === 0) px1(g, x0 + x + 1, T0 + 3 + r + sag, TWIG[0]); }
    rect(g, x0, T0 + 3 + r + sag, 1, 1, TWIG[0]); rect(g, x0 + ww - 1, T0 + 3 + r + sag, 1, 1, TWIG[0]);
    if (r > deep - 3) rect(g, x0, T0 + 3 + r + sag, ww, 1, TWIG[0]);
  }
  for (let k = 0; k < 5; k++) {                                              /* ribs curving round the bowl's side */
    const rx = L + 5 + k * R((w - 10) / 4);
    for (let r = 0; r < 8; r++) { const bx = rx + R(Math.sin(r / 8 * Math.PI) * (k % 2 ? -2 : 2)); px1(g, bx, T0 + 3 + r, BONE[k % 2 ? 1 : 2]); px1(g, bx + 1, T0 + 3 + r, BONE[0]); }
  }
  rect(g, L - 1, T0, w + 2, 3, BONE[1]); rect(g, L - 1, T0, w + 2, 1, BONE[3]); rect(g, L - 1, T0 + 2, w + 2, 1, BONE[0]);   /* the rim of ribs */
  for (let x = 0; x < w; x += 6) { px1(g, L + x, T0 + 1, BONE[0]); px1(g, L + x + 2, T0, BONE[2]); }                         /* rib joints */
  for (const sx of [-1, 1]) { const ex = sx < 0 ? L - 3 : L + w + 1; rect(g, ex, T0 - 1, 3, 4, BONE[3]); rect(g, ex, T0 + 1, 3, 2, BONE[1]); px1(g, ex + 1, T0, BONE[0]); }   /* knuckle ends */
  for (let x = 3; x < w - 3; x += 4) { const hgt = 2 + R(hash(x + R(nx)) * 4); rect(g, L + x, T0 - hgt, 1, hgt, x % 8 === 3 ? TWIG[3] : TWIG[2]); if (hgt > 4) px1(g, L + x + 1, T0 - hgt, TWIG[1]); }   /* sticks over the lip */
  rect(g, L + R(w * 0.7), T0 - 4, 5, 4, BONE[3]); rect(g, L + R(w * 0.7) + 1, T0 - 3, 1, 1, S[0]); rect(g, L + R(w * 0.7) + 3, T0 - 3, 1, 1, S[0]); rect(g, L + R(w * 0.7) + 1, T0 - 1, 3, 1, BONE[1]);   /* a skull on the lip */
  for (let i = 0; i < 3; i++) { const gx = L + 4 + i * R(w / 3.2); rect(g, gx, T0 + 3, 2, 4 + (i % 2) * 3, GUANO[2]); px1(g, gx, T0 + 3, GUANO[3]); }      /* guano streaks down the side */
}
/* the lashing where the arm meets the bowl: three sinew wraps and a bone toggle */
function lashing(g, x, y) { for (let b = 0; b < 3; b++) { rect(g, x - 6, y + b * 2, 12, 1, SINEW[b % 2 ? 1 : 2]); px1(g, x - 6 + ((b * 5) % 11), y + b * 2, SINEW[3]); } rect(g, x + 5, y, 3, 2, BONE[3]); px1(g, x + 6, y, BONE[0]); }

/* THE SNAP: chips of stone, bone and stick flung from the arm and falling to the floor; a dust ring from the foot (state: obj.__snap = time of the break) */
function snapFx(g, ox, oy, fy, hgt, age, nx) {
  if (age > 1.1) return;
  for (let i = 0; i < 16; i++) {
    const a = hash(i * 3) * Math.PI - Math.PI, sp = 40 + hash(i * 5) * 90, vx = Math.cos(a) * sp * (i % 2 ? 1 : -1) + (nx - ox) * 0.5, vy = Math.sin(a) * sp * 0.9 - 30 - hash(i) * 40;
    const sx = ox + (nx - ox) * 0.4 + vx * age, sy = oy - hgt * 0.5 + vy * age + 260 * age * age, ay = Math.min(sy, fy - 1), col = i % 3 === 0 ? BONE[2] : i % 3 === 1 ? S[4] : TWIG[2];
    const sz = 2 + (i % 3); rect(g, sx, ay, sz, sz > 3 ? 2 : sz - 1 || 1, col); if (sz > 3) px1(g, R(sx), R(ay), S[6]);
  }
  if (age < 0.4) { g.globalAlpha = 0.55 * (1 - age / 0.4); g.strokeStyle = '#e4d8c8'; g.beginPath(); g.ellipse(ox, fy - 1, 6 + age * 60, 2 + age * 8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
}

export function drawRoosts(g, x, y, fy, time, St, SS, now) {
  const G = St.G;
  for (const nn of G.nests) {
    const nx = x(nn.x), fx = x(nn.footX);
    if (nn.__st !== nn.st) { if (nn.__st !== undefined && nn.st === 'down') nn.__snap = now; nn.__st = nn.st; }
    const age = now - (nn.__snap === undefined ? -9 : nn.__snap);
    if (nn.st === 'up') {
      const T0 = y(nn.topUp), under = T0 + 14;
      strut(g, fx, fy - 3, nx - 2, under, 6, 5, true);                                                       /* THE CRACKED ARM */
      rect(g, fx - 9, fy - 4, 18, 4, S[2]); rect(g, fx - 9, fy - 4, 18, 1, S[5]); rect(g, fx - 9, fy - 1, 18, 1, S[1]);   /* its foot: a cracked block, */
      g.fillStyle = S[0]; g.fillRect(fx - 5, fy - 4, 1, 3); g.fillRect(fx - 4, fy - 2, 2, 1); g.fillRect(fx + 2, fy - 4, 1, 2); g.fillRect(fx + 3, fy - 3, 2, 1);     /* split */
      bowl(g, nx, T0, nn.w, 0, time); lashing(g, nx - 2, under - 6);
      crackRing(g, fx, fy, SS.nest.foot, time);
    } else {
      const T0 = y(nn.topDown), side = nn.x < fx ? 1 : -1;
      for (let i = 0; i < 9; i++) { const rx = fx + (hash(i) - 0.5) * 34, rh = 2 + R(hash(i + 9) * 4); rect(g, rx, fy - rh, 4 + (i % 2) * 2, rh, i % 3 ? S[3] : S[2]); rect(g, rx, fy - rh, 4, 1, S[5]); }   /* the arm's rubble */
      rect(g, fx - 6, fy - 11, 12, 11, S[3]); rect(g, fx - 6, fy - 11, 5, 11, S[4]); rect(g, fx + 3, fy - 11, 3, 11, S[2]); rect(g, fx - 6, fy - 12, 4, 1, S[5]); rect(g, fx + 1, fy - 13, 5, 2, S[3]); rect(g, fx - 2, fy - 14, 3, 2, S[2]);   /* the ragged stump */
      g.fillStyle = S[0]; g.fillRect(fx - 1, fy - 11, 1, 6); g.fillRect(fx, fy - 6, 1, 3);
      const sag = side * 2; bowl(g, nx, T0, nn.w, 4, time);
      rect(g, nx - 8 + sag, T0 + 14, 16, 2, TWIG[0]);                                                          /* it lies on the stump, tilted */
      for (let i = 0; i < 4; i++) rect(g, nx - 18 + i * 11 + (i % 2) * 3, fy - 3 - (i % 2), 5, 2, i % 2 ? BONE[2] : TWIG[2]);   /* bones and sticks spilled round it */
    }
    snapFx(g, fx, fy, fy, 40, age, nx);
  }
  const o = G.over;
  if (o) {
    if (o.__st !== o.st) { if (o.__st !== undefined && o.st === 'down') o.__snap = now; o.__st = o.st; }
    const age = now - (o.__snap === undefined ? -9 : o.__snap);
    if (o.st === 'up') {
      const sx0 = x(o.slab.x0), sx1 = x(o.slab.x1), sy = y(o.slab.y), fx = x(o.footX), w = sx1 - sx0;
      strut(g, fx, fy - 3, fx - 4, sy + 12, 5, 4, true);                                                     /* THE PIER it hangs from */
      rect(g, fx - 9, fy - 4, 18, 4, S[2]); rect(g, fx - 9, fy - 4, 18, 1, S[5]); rect(g, fx - 9, fy - 1, 18, 1, S[1]); g.fillStyle = S[0]; g.fillRect(fx - 4, fy - 4, 1, 3); g.fillRect(fx + 3, fy - 3, 2, 1);
      rect(g, sx0, sy, w, 10, S[3]); rect(g, sx0, sy, w, 2, S[5]); rect(g, sx0, sy, w, 1, S[6]); rect(g, sx0, sy + 7, w, 3, S[2]);                       /* the slab */
      for (let i = 0; i < w; i += 7) { const th = 2 + R(hash(i + 3) * 4); rect(g, sx0 + i, sy + 10, 5, th, S[2]); rect(g, sx0 + i + 1, sy + 10 + th, 3, 1, S[1]); }   /* stalactite teeth */
      for (let i = 4; i < w - 6; i += 11) { rect(g, sx0 + i, sy, 6, 1, GUANO[3]); rect(g, sx0 + i + 1, sy + 1, 4, 1, GUANO[2]); }
      g.fillStyle = S[0]; for (let i = 0; i < 12; i++) g.fillRect(sx0 + R(w * 0.3) + (i % 2 ? 2 : 0) + R(i * 0.7), sy + i, 1, 1);                          /* the black crack */
      lashing(g, fx - 4, sy + 13);
      crackRing(g, fx, fy, SS.nest.foot, time);
    } else {
      for (const st of o.steps) {
        const sx = x(st.x0), sx1b = x(st.x1), sy = y(st.y), w = sx1b - sx;
        const stub = (px0) => { rect(g, px0, sy + 8, 6, fy - sy - 8, S[3]); rect(g, px0, sy + 8, 2, fy - sy - 8, S[4]); rect(g, px0 + 4, sy + 8, 2, fy - sy - 8, S[2]); for (let q = sy + 14; q < fy - 2; q += 8) rect(g, px0, q, 6, 1, S[1]); };
        stub(sx + 3); if (w > 20) stub(sx1b - 9);
        rect(g, sx, sy, w, 8, S[3]); rect(g, sx, sy, w, 2, S[5]); rect(g, sx, sy, w, 1, S[6]); rect(g, sx, sy + 5, w, 3, S[2]); rect(g, sx + 2, sy + 8, w - 4, 1, S[1]);       /* a block with a lit chiselled edge */
        for (let i = 3; i < w - 4; i += 9) { rect(g, sx + i, sy, 5, 1, GUANO[3]); rect(g, sx + i + 1, sy + 1, 3, 1, GUANO[2]); }
        g.fillStyle = S[0]; g.fillRect(sx + R(w * 0.5), sy + 2, 1, 4); g.fillRect(sx + R(w * 0.5) + 1, sy + 5, 1, 2);
      }
      for (let i = 0; i < 10; i++) { const rx = x(o.footX) + (hash(i + 4) - 0.5) * 40, rh = 2 + R(hash(i + 19) * 5); rect(g, rx, fy - rh, 4 + (i % 2) * 2, rh, i % 3 ? S[3] : S[2]); rect(g, rx, fy - rh, 4, 1, S[5]); }   /* the pier's rubble heap */
      snapFx(g, x(o.footX), fy, fy, 60, age, (x(o.slab.x0) + x(o.slab.x1)) / 2);
    }
  }
  for (const v of G.vents) {
    const vx = x(v.x), top = y(v.topY);
    if (v.__open !== v.open) { if (v.__open !== undefined && v.open) v.__t0 = now; v.__open = v.open; }
    rect(g, vx - 11, fy - 3, 22, 3, S[2]); rect(g, vx - 11, fy - 3, 22, 1, S[5]); rect(g, vx - 9, fy - 2, 18, 2, S[0]);       /* the mouth in the floor */
    for (let k = -8; k <= 8; k += 4) px1(g, vx + k, fy - 3, S[6]);
    if (!v.open) {
      rect(g, vx - 9, fy - 7, 18, 5, S[2]); rect(g, vx - 8, fy - 8, 14, 1, S[3]); rect(g, vx - 9, fy - 7, 18, 1, S[4]);   /* the plug: a cap of rubble, */
      for (let k = 0; k < 5; k++) { rect(g, vx - 8 + k * 4, fy - 5 - (k % 2), 3, 1, k % 2 ? BONE[2] : S[1]); } rect(g, vx - 3, fy - 10, 1, 4, BONE[3]); rect(g, vx + 3, fy - 9, 1, 3, BONE[2]);   /* lashed with bones */
      rect(g, vx - 9, fy - 6, 18, 1, SINEW[1]); px1(g, vx - 1, fy - 6, SINEW[3]); rect(g, vx - 6, fy - 8, 4, 1, GUANO[2]); rect(g, vx + 1, fy - 8, 3, 1, GUANO[3]);
      g.globalAlpha = 0.5; rect(g, vx - 2, fy - 4, 4, 1, '#e8f0ff'); g.globalAlpha = 1;                                    /* a thin whistle of air leaks round it */
    } else {
      const age = v.__t0 === undefined ? 9 : now - v.__t0;
      g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 6); rect(g, vx - 7, fy - 5, 14, 3, '#cfe0ff'); g.globalAlpha = 1;      /* the mouth lit from below */
      rect(g, vx - 11, fy - 4, 3, 2, S[4]); rect(g, vx + 8, fy - 4, 3, 2, S[4]);
      const hgt = fy - top;
      g.globalAlpha = 0.07; g.fillStyle = '#e8f0ff'; g.fillRect(vx - 9, top, 18, hgt); g.globalAlpha = 1;                    /* the column */
      for (let k = 0; k < 9; k++) { const t2 = (time * 1.5 + k / 9) % 1, yy = fy - 4 - t2 * hgt, xx = vx + R(Math.sin(time * 5 + k * 2.2) * 5 * (0.4 + t2)); g.globalAlpha = 0.65 * (1 - t2 * 0.8); rect(g, xx, yy, 1, 6 + (k % 3) * 2, '#e8f0ff'); if (k % 3 === 0) rect(g, xx + 1, yy + 2, 2, 1, '#ffffff'); }
      for (let k = 0; k < 3; k++) { const t2 = (time * 0.7 + k / 3) % 1, yy = fy - 8 - t2 * hgt, xx = vx + R(Math.sin(time * 3 + k * 4) * 8); g.globalAlpha = 0.9 * (1 - t2); rect(g, xx, yy, 3, 1, '#e6e4ec'); px1(g, xx + 1, yy - 1, '#ffffff'); }   /* loose feathers riding it */
      g.globalAlpha = 1;
      if (age < 0.6) { g.globalAlpha = 0.7 * (1 - age / 0.6); g.strokeStyle = '#ffffff'; g.beginPath(); g.ellipse(vx, fy - 3, 8 + age * 50, 3 + age * 6, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   /* the plug blows out */
    }
  }
}

/* A PEBBLE IN THE AIR: a chipped rose-stone turning end over end, a short tail of grit behind it (sx, sy = its screen position, vx = its heading) */
export function drawPebble(g, sx, sy, vx, time) {
  const ph = Math.floor(time * 14) % 4, d = vx >= 0 ? -1 : 1;
  for (let i = 1; i < 4; i++) { g.globalAlpha = 0.5 - i * 0.12; rect(g, sx + d * i * 4 - 1, sy - 1 + (i % 2), 2, 2, i % 2 ? S[4] : S[3]); } g.globalAlpha = 1;
  const w = ph % 2 ? 6 : 7, h = ph % 2 ? 7 : 6;
  rect(g, sx - w / 2, sy - h / 2, w, h, S[2]); rect(g, sx - w / 2 + 1, sy - h / 2, w - 2, 2, S[4]); rect(g, sx - w / 2, sy + h / 2 - 2, w, 2, S[1]); px1(g, R(sx - w / 2 + 1), R(sy - h / 2), S[6]); px1(g, R(sx + 1), R(sy), S[0]);
}
/* its ring on the floor: red-rimmed, dotted, a chip of stone in the middle growing as it comes */
export function drawPebbleRing(g, cx, fy, r, k, time) {
  const col = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.globalAlpha = 0.45 + 0.4 * k; g.strokeStyle = col; g.beginPath(); g.ellipse(cx, fy - 1, r, 3, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = col; for (let a = 0; a < 8; a++) { const t = a / 8 * Math.PI * 2 + time * 2; g.fillRect(R(cx + Math.cos(t) * (r - 3)), R(fy - 1 + Math.sin(t) * 1.8), 1, 1); } g.globalAlpha = 1;
  rect(g, cx - 2, fy - 3, 5, 2, S[3]); rect(g, cx - 1, fy - 4, 3, 1, S[5]);
}
/* THE SUPPORT MARK: the Shrieker's sigil on your spot - magenta, a dotted ring with an eye (a pupil, a red lid) over a feather post: the scream's own mark stays a red post */
export function drawSupMark(g, mx, fy, k, time, say) {
  const pul = 0.5 + 0.5 * Math.sin(time * 8), c = Math.floor(time * 6) % 2 ? '#ff4a9a' : '#ff8ac0';
  g.globalAlpha = 0.45 + 0.5 * k; g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.ellipse(mx, fy - 1, 15, 4, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
  g.fillStyle = '#ffd0e4'; for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2 - time * 1.5; g.fillRect(R(mx + Math.cos(t) * 19), R(fy - 1 + Math.sin(t) * 5), 1, 1); }
  g.fillStyle = '#1b1626'; g.fillRect(mx - 5, fy - 17, 11, 7); g.fillStyle = '#fff0f4'; g.fillRect(mx - 4, fy - 16, 9, 5); g.fillStyle = c; g.fillRect(mx - 1, fy - 16, 3, 5); g.fillStyle = '#1b1626'; g.fillRect(mx, fy - 15, 1, 3);
  g.fillStyle = '#c0204a'; g.fillRect(mx - 5, fy - 18, 11, 1); g.fillRect(mx - 3, fy - 19, 7, 1);
  g.fillStyle = c; g.fillRect(mx, fy - 10, 1, 6 + R(pul * 2)); g.fillRect(mx - 2, fy - 5, 5, 1);
  g.globalAlpha = 1;
}
/* FRIENDLY FIRE: the dive turned on her sister - chevrons running the Hunter's line to the sister, an arrowhead at her and a crossed ring round her */
export function drawFFLine(g, x0, y0, x1, y1, time) {
  const n = 12, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  for (let i = 1; i < n; i++) { const t = ((i + (time * 6) % 1) / n); if (t >= 1) continue; const cx = x0 + dx * t, cy = y0 + dy * t; g.fillStyle = i % 2 ? '#8fd160' : '#d8f0a0'; g.fillRect(R(cx - uy * 2 - ux), R(cy + ux * 2 - uy), 2, 2); g.fillRect(R(cx + uy * 2 - ux), R(cy - ux * 2 - uy), 2, 2); g.fillRect(R(cx), R(cy), 2, 2); }
  g.strokeStyle = '#8fd160'; g.lineWidth = 2; g.beginPath(); g.arc(x1, y1, 14 + Math.sin(time * 10) * 1.5, 0, Math.PI * 2); g.moveTo(x1 - 9, y1 - 9); g.lineTo(x1 + 9, y1 + 9); g.moveTo(x1 + 9, y1 - 9); g.lineTo(x1 - 9, y1 + 9); g.stroke(); g.lineWidth = 1;
}
/* THE FALL ARC of a crashed sister: k 0..1; position and spin for the hands (ease-in: she drops), plus the feather trail and the landing burst */
export function fallPose(arc, k) { return { x: arc.x0 + (arc.x1 - arc.x0) * (1 - Math.pow(1 - k, 2)), y: arc.y0 + (arc.y1 - arc.y0) * k * k, rot: (arc.x1 >= arc.x0 ? 1 : -1) * 3.4 * k * (1 - k * 0.55) }; }
export function fallTrail(g, arc, k, cx, cy, col) {
  for (let i = 1; i <= 6; i++) { const kk = Math.max(0, k - i * 0.05), p = fallPose(arc, kk); g.globalAlpha = 0.6 - i * 0.09; g.fillStyle = i % 2 ? col : '#e6e4ec'; g.fillRect(R(p.x - cx) + (i % 3 - 1) * 5, R(p.y - cy) - 24 + i, 3, 1); g.fillRect(R(p.x - cx) + (i % 3 - 1) * 5 + 1, R(p.y - cy) - 25 + i, 1, 1); } g.globalAlpha = 1;
}
export function landBurst(g, bx, fy, age) {
  if (age > 0.45) return; const k = age / 0.45; g.globalAlpha = 0.7 * (1 - k); g.strokeStyle = '#f4ecd8'; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, fy - 1, 8 + k * 38, 2 + k * 7, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI, dx = Math.cos(a) * (6 + k * 30) * (i % 2 ? 1 : -1), dy = -Math.sin(a) * k * 18; rect(g, bx + dx, fy - 2 + dy, 2, 2, i % 2 ? '#b4ae9f' : '#ece8dc'); } g.globalAlpha = 1;
}

/* THE TURN PORTRAITS (9 x 9 at x, y): a socket, then a bird's head that is hers at a glance. lit = the Hunter / open / survivor */
const PORT = {
  diver: { sk: '#e8e0d4', a: '#3e4864', hi: '#dce6f4', crest: '#c8d4e8' },
  shrieker: { sk: '#f0dccc', a: '#c4a2ac', hi: '#fff0f0', crest: '#e04a3a' },
  snatcher: { sk: '#dcc4a4', a: '#8a7048', hi: '#e4cc9c', crest: '#c8a060' },
};
export function portrait(g, x, y, r, dead, lit) {
  const I = PORT[r], sk = dead ? '#6a6478' : I.sk, ac = dead ? '#4a4658' : I.a, hi = dead ? '#8a8498' : I.hi, cr = dead ? '#6a6478' : I.crest;
  const Q = (dx, dy, w, h, c) => { g.fillStyle = c; g.fillRect(x + dx, y + dy, w, h); };
  Q(0, 0, 9, 9, lit ? '#6a5a3a' : '#24202e'); Q(1, 1, 7, 7, lit ? '#3a3020' : '#1a1624');                                                  /* the socket */
  if (r === 'diver') { Q(1, 2, 2, 1, hi); Q(2, 1, 3, 1, cr); Q(1, 3, 1, 1, cr); Q(2, 2, 3, 2, ac); Q(3, 3, 3, 4, sk); Q(2, 3, 1, 3, ac); }       /* dark head, pale crest swept back */
  else if (r === 'shrieker') { Q(2, 0, 1, 2, hi); Q(4, 0, 1, 2, cr); Q(6, 0, 1, 2, hi); Q(3, 0, 1, 1, cr); Q(5, 0, 1, 1, cr); Q(3, 2, 3, 2, sk); Q(3, 4, 2, 4, sk); Q(5, 5, 1, 3, ac); }   /* fan over a long pale neck */
  else { Q(1, 1, 6, 2, ac); Q(0, 2, 2, 3, ac); Q(7, 2, 1, 2, ac); Q(2, 3, 5, 4, sk); Q(2, 3, 5, 1, ac); }                                     /* a broad shaggy head */
  if (r !== 'shrieker') { Q(3, 4, 1, 1, dead ? '#14101e' : '#ff4a2a'); } else { Q(4, 3, 1, 1, dead ? '#14101e' : '#ff4a2a'); }
  if (dead) { Q(r === 'shrieker' ? 4 : 5, r === 'shrieker' ? 3 : 4, 1, 1, '#14101e'); }
  if (r === 'diver') { Q(6, 5, 2, 1, dead ? '#8a8498' : '#e8c870'); Q(7, 6, 1, 1, dead ? '#6a6478' : '#a88838'); }
  else if (r === 'shrieker') { Q(5, 3, 3, 1, dead ? '#8a8498' : '#e0b060'); Q(5, 4, 2, 1, dead ? '#6a6478' : '#a07830'); }
  else { Q(6, 5, 2, 2, dead ? '#8a8498' : '#d8b060'); Q(7, 6, 1, 1, dead ? '#6a6478' : '#8a6a28'); if (!dead) Q(4, 2, 1, 3, '#8a2a2a'); }
  if (dead) { g.fillStyle = '#0a0810'; for (let q = 0; q < 9; q++) g.fillRect(x + q, y + Math.round(q * 0.9), 1, 1); }
}
