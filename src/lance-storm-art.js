// src/lance-storm-art.js - THE STORM OVER THE LONG BRIDGE, DRAWN (claude/lance5art; the Queen's Lance's P2: THE STORM ARRIVES). Art only: nothing here is read by the fight - main.js
// hands in what the fight already knows (the storm is on, a lightning flash, the gaps, a bell's tolls, the gust) and these draw it. The Stormhold palette (cold slate steel, the Queen's
// purple, bell bronze, night blue) so P2 reads as the SAME place gone bad, not another level.
//   the SKY      a ceiling of three cloud banks (a dark violet mass with a lit underside), a wash that darkens the castle behind, SLANTED RAIN SHEETS in three depths, the lightning
//                bolt in the backdrop (the flash lights the clouds from underneath and leaves the castle black against it - the trigger waits for tells, main.js lightT)
//   the TEETH    rock teeth (tiles: bakeRockTeeth) wet and sheened, with storm spray hanging over every span, and the UPDRAFT column in each gap (a lifting body, spirals, flung splinters and a
//                flare at the lip); it blazes while someone rides it (him: updraft; you: stormLift)
//   the GUST     a bell's told wind front (marching chevrons along the deck, brighter each toll), its blow (a leading edge with a rain sheet and flung grit behind it), the bell rope swaying
//   the SKEWER   the told column straight up from his helm (rising chevrons, red rails, the hit width), the strike's streak
//   the PIVOT    a ring arrow on the deck that turns to the way he is about to face
//   the TEAR     the pennant, torn away in the wind: a swallow-tailed ribbon and its shreds flying off on the gale
//   the HERO     the updraft's wind wrapped round a lifted hero
import { canvas, rect, fillPoly, line, circle, mulberry } from './px.js';

const PAL = { void: '#0a0e1c', far: '#1c2240', farR: '#3a4678', mid: '#262d54', midR: '#4c5a98', near: '#323a68', nearR: '#6678b8', litF: '#6a78b0', litM: '#8494cc', litN: '#a8b8e8',
  rain: '#9fb4d8', rainN: '#cfe0f8', mist: '#cfe0f0', glow: '#e8f0ff', halo: '#9fb4ff', hemp: '#a88a5a', hempD: '#6e5a38', purple: '#8a4cb4', purpleD: '#4e2670', gold: '#f0c048', red: '#ff6b6b',
  rock0: '#12141d', rock1: '#232838', rock2: '#3a4256', rock3: '#5a667e', rock4: '#8a96ae', rockW: '#d4e4f4', stain: '#34284c' };
const S = { k: 0, t: -1, tear: null, bakes: null };

/* ---------------------------------------------------------------------------------------------------------------- THE ROCK TEETH (4 tile variants, 16x16, point up)
   a row of jagged slate teeth, a lit left face and a dark right face, a wet glint on the edge, a violet stain, rubble at the root; the gorge under every span of the bridge */
export function bakeRockTeeth() {
  const out = [], H = [[11, 15, 8], [14, 9, 13], [8, 13, 15], [15, 11, 9]], CX = [[3, 8, 13], [2, 8, 14], [3, 9, 13], [2, 7, 13]], LEAN = [[-1, 1, 0], [1, -1, 1], [0, 1, -1], [-1, 0, 1]];
  for (let v = 0; v < 4; v++) { const [c, g] = canvas(16, 16), r = mulberry(7100 + v * 31);
    rect(g, 0, 13, 16, 3, PAL.rock0);
    for (let i = 0; i < 3; i++) { const cx = CX[v][i], h = H[v][i], tip = cx + LEAN[v][i], tw = 4 + (h > 12 ? 1 : 0), ty = 16 - h;
      fillPoly(g, [[cx - tw - 0.5, 16], [tip - 0.5, ty], [cx + tw + 0.5, 16]], PAL.rock0);                                                          /* the dark outline body */
      fillPoly(g, [[cx - tw, 16], [tip, ty + 1], [cx + tw, 16]], PAL.rock1);
      fillPoly(g, [[cx - tw, 16], [tip, ty + 1], [tip + 0.5, 16]], PAL.rock2);                                                                        /* the lit left face */
      fillPoly(g, [[cx - tw + 1, 16], [tip, ty + 2], [tip - 1, 16]], PAL.rock3);
      line(g, cx - tw + 1, 15, tip, ty + 1, PAL.rock4, 1); rect(g, tip, ty, 1, 1, PAL.rockW);                                                          /* the wet edge and a glint at the point */
      if (r() < 0.7) rect(g, tip + 1, ty + 4 + ((r() * 3) | 0), 2, 1, PAL.stain); }
    for (let k = 0; k < 7; k++) rect(g, (r() * 15) | 0, 13 + ((r() * 3) | 0), 1 + ((r() * 2) | 0), 1, k % 2 ? PAL.rock2 : PAL.rock1);                  /* rubble at the root */
    out.push(c); }
  return out;
}

/* ---------------------------------------------------------------------------------------------------------------- THE SKY
   bakeClouds: a horizontally tiling strip (a ragged lower edge hung under a solid ceiling), the lit twin for the flash */
function bakeClouds(seed, W, hang, base, rim, lit) {
  const H = hang + 26, mk = (b, rm) => { const [c, g] = canvas(W, H), r = mulberry(seed), lumps = [];
    for (let x = 0, i = 0; x < W; i++) { const step = 15 + ((r() * 11) | 0); lumps.push([x, hang * (0.5 + 0.5 * r()), 11 + r() * 17]); x += step; }
    const wr = (x, y, rr, col) => { for (const o of [-W, 0, W]) circle(g, x + o, y, rr, col); };
    for (const [x, y, rr] of lumps) wr(x, y + 3, rr, rm);                                                                                              /* the lit underside, a rim below each lump */
    for (const [x, y, rr] of lumps) wr(x, y, rr, b);
    rect(g, 0, 0, W, Math.round(hang * 0.5), b);
    for (let k = 0; k < 40; k++) { const x = (r() * W) | 0, y = ((r() * hang) | 0); rect(g, x, y, 3 + ((r() * 8) | 0), 1, rm); }                          /* streaks of the lit mass inside it */
    return c; };
  return { dark: mk(base, rim), lit: mk(lit, lit), H };
}
function bakes() {
  if (S.bakes) return S.bakes;
  S.bakes = { far: bakeClouds(5101, 704, 52, PAL.far, PAL.farR, PAL.litF), mid: bakeClouds(5102, 640, 46, PAL.mid, PAL.midR, PAL.litM), near: bakeClouds(5103, 576, 40, PAL.near, PAL.nearR, PAL.litN) };
  return S.bakes;
}
const wrapX = (v, w) => ((v % w) + w) % w;
/* the storm's own weight 0 -> 1 -> 0: it comes in over 1.4 s and leaves over 1.4 s, so the sky is never a hard cut */
function ease(time, on) { const dt = S.t < 0 ? 0 : Math.max(0, Math.min(0.1, time - S.t)); S.t = time; S.k = Math.max(0, Math.min(1, S.k + (on ? 1 : -1) * dt / 1.4)); return S.k; }
const smooth = k => k * k * (3 - 2 * k);

/* THE BACKDROP, in two calls: back = before the castle (clouds and the bolt's glow, so the castle stands against them as a silhouette), front = after it (the wash that darkens it, the rain sheets) */
export function drawSky(g, cx, cy, VW, VH, time, on, flash, bolt, front, dY) {
  const k = front ? S.k : smooth(ease(time, on)); if (k <= 0.004) return;
  const B = bakes(), banks = (list) => { for (const [nm, bot, par, spd, al] of list) { const b = B[nm], w = b.dark.width, y = Math.round(VH * bot - b.H + (dY || 0) * 0.04), x = Math.round(wrapX(cx * par + time * spd, w));
      g.globalAlpha = k * al; g.fillStyle = nm === 'far' ? PAL.far : nm === 'mid' ? PAL.mid : PAL.near; g.fillRect(0, 0, VW, Math.max(0, y));
      for (let xx = -x; xx < VW; xx += w) { g.globalAlpha = k * al; g.drawImage(b.dark, xx, y); if (flash > 0.02) { g.globalAlpha = k * al * Math.min(1, flash * 0.9); g.drawImage(b.lit, xx, y); } } }
    g.globalAlpha = 1; };
  if (!front) {
    /* BACK: the void and the far bank, the lit sky and the bolt - the castle is drawn over them, black against the flash */
    g.globalAlpha = k * 0.96; g.fillStyle = PAL.void; g.fillRect(0, 0, VW, Math.round(VH * 0.7)); g.globalAlpha = 1;
    banks([['far', 0.5, 0.012, 3.5, 0.9]]);
    if (flash > 0.02) { const gr = g.createLinearGradient(0, 0, 0, VH * 0.8); gr.addColorStop(0, 'rgba(150,165,235,' + (0.4 * flash * k).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(120,140,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, VW, Math.round(VH * 0.8)); }
    if (bolt && bolt.t > 0 && flash > 0.15) drawBolt(g, Math.round(bolt.x - cx * 0.15), VH, bolt.i, flash * k);
    return;
  }
  /* FRONT: the two near banks hang over the castle's towers, then a cold dark wash, a wet haze low on the horizon, and the SLANTED RAIN SHEETS in three depths */
  banks([['mid', 0.42, 0.02, 6, 0.95], ['near', 0.34, 0.034, 10, 1]]);
  const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, 'rgba(6,8,24,' + (0.6 * k).toFixed(3) + ')'); gr.addColorStop(0.55, 'rgba(12,14,38,' + (0.5 * k).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(22,24,52,' + (0.3 * k).toFixed(3) + ')');
  g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  g.globalAlpha = 0.1 * k; g.fillStyle = PAL.halo; g.fillRect(0, Math.round(VH * 0.52), VW, Math.round(VH * 0.14)); g.globalAlpha = 1;
  rainSheets(g, cx, VW, VH, time, k);
}
function drawBolt(g, bx, VH, seed, f) {
  const r = mulberry(seed * 977 + (bx | 0)), pts = [[bx, 0]], yEnd = Math.round(VH * 0.62); let x = bx, y = 0; const br = [];
  while (y < yEnd) { x += (r() - 0.5) * 22; y += 9 + r() * 12; pts.push([Math.round(x), Math.round(y)]); if (r() < 0.22) br.push(pts.length - 1); }
  const draw = (arr, col, t, a) => { g.globalAlpha = a; for (let i = 1; i < arr.length; i++) line(g, arr[i - 1][0], arr[i - 1][1], arr[i][0], arr[i][1], col, t); };
  draw(pts, PAL.halo, 5, 0.18 * f); draw(pts, PAL.glow, 3, 0.35 * f); draw(pts, '#ffffff', 1, Math.min(1, f));
  for (const bi of br.slice(0, 2)) { const b = [pts[bi]]; let bx2 = pts[bi][0], by2 = pts[bi][1]; const d = r() < 0.5 ? -1 : 1; for (let q = 0; q < 4; q++) { bx2 += d * (6 + r() * 9); by2 += 7 + r() * 9; b.push([Math.round(bx2), Math.round(by2)]); } draw(b, PAL.glow, 2, 0.4 * f); draw(b, '#ffffff', 1, 0.85 * f); }
  g.globalAlpha = 1;
}
/* three depths of slanted rain: faint far streaks, mid streaks, and wide translucent SHEETS of wind-driven rain sweeping through (they all lean the way the wind blows) */
function rainSheets(g, cx, VW, VH, time, k) {
  const slant = 0.5;
  for (const [n, len, sp, fall, par, col, al] of [[34, 9, 120, 300, 0.05, PAL.rain, 0.22], [26, 14, 190, 420, 0.12, PAL.rain, 0.3]]) { g.fillStyle = col; g.globalAlpha = al * k;
    for (let i = 0; i < n; i++) { const x = Math.round(wrapX(i * 131 + (i % 3) * 47 - time * sp - cx * par, VW + 80)) - 10, y = Math.round(wrapX(i * 53 + time * fall + i * 7, VH + len)) - len;
      for (let s = 0; s < len; s += 2) g.fillRect(Math.round(x - s * slant), y + s, 1, 2); } }
  g.globalAlpha = 1;
  for (let j = 0; j < 3; j++) { const w = 22 + j * 9, ph = wrapX(time * (46 + j * 17) + j * 211 - cx * 0.08, VW + 360) - 180, a = (0.035 + 0.015 * j) * k;
    g.globalAlpha = a; g.fillStyle = PAL.rainN; fillPoly(g, [[ph, 0], [ph + w, 0], [ph + w - VH * slant, VH], [ph - VH * slant, VH]], PAL.rainN);   /* a sheet, leaning on the wind */
    g.globalAlpha = a * 1.7; g.fillStyle = PAL.rainN; for (let i = 0; i < 9; i++) { const yy = Math.round(wrapX(i * 41 + time * 380 + j * 60, VH)); g.fillRect(Math.round(ph + ((i * 29) % w) - yy * slant), yy, 1, 7); } }
  g.globalAlpha = 1;
}
/* THE DECK IN THE RAIN: a wet sheen along the boards' top edge and the splashes of the drops landing (a little ring, now here, now there) */
export function drawWetDeck(g, x0, x1, fy, time, k) {
  if (k <= 0.01) return;
  g.globalAlpha = 0.28 * k; g.fillStyle = PAL.rainN; for (let x = Math.round(x0 / 24) * 24; x < x1; x += 24) { const w = 6 + ((x * 7) % 9); g.fillRect(x + ((x * 13) % 7), fy - 1, w, 1); }
  for (let i = 0; i < 16; i++) { const x = Math.round(x0 + wrapX(i * 137 + Math.floor(time * 6 + i) * 61, Math.max(1, x1 - x0))), ph = (time * 6 + i * 0.37) % 1; g.globalAlpha = 0.5 * (1 - ph) * k; g.fillStyle = PAL.mist;
    g.fillRect(x - 1 - Math.round(ph * 2), fy - 1, 1, 1); g.fillRect(x + 1 + Math.round(ph * 2), fy - 1, 1, 1); g.fillRect(x, fy - 2 - Math.round(ph * 2), 1, 1); }
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------------------------------------------- THE GORGE: spray over every tooth, the UPDRAFT in each gap
   o: { spans: [[s0,s1] tile columns], holes: [[x0px,x1px]], TS, cx, cy, VW, VH, time, floorY (deck, world px), teethY (the teeth's row top, world px), storm, hot (someone is riding it) } */
export function drawGorge(g, o) {
  const { spans, holes, TS, cx, cy, VW, time, floorY, teethY, storm, hot } = o; if (!storm) return;
  const ty = Math.round(teethY - cy), fy = Math.round(floorY - cy);
  g.fillStyle = PAL.mist;
  for (const [s0, s1] of spans) { const a = s0 * TS - cx, b = (s1 + 1) * TS - cx; if (b < -20 || a > VW + 20) continue;
    for (let x = Math.max(a, 0); x < Math.min(b, VW); x += 11) { const xi = Math.round(x), ph = (time * 0.9 + xi * 0.173 + s0) % 1, pl = 1 - ph;
      g.globalAlpha = 0.34 * pl; const r = 1 + ph * 2.6; g.fillRect(xi - Math.round(r), ty - 3 - Math.round(ph * 17), Math.round(r * 2) + 1, 1 + (ph > 0.4 ? 1 : 0)); g.fillRect(xi - Math.round(r * 0.5), ty - 4 - Math.round(ph * 17), Math.round(r) + 1, 1); } }
  g.globalAlpha = 1;
  for (const [h0, h1] of holes) { const a = h0 - cx, b = h1 - cx; if (b < -40 || a > VW + 40) continue; drawUpdraft(g, a, b, fy, ty, time, hot ? 1.8 : 1); }
}
/* THE UPDRAFT: a rising body that widens up the gap, helical streaks winding upward, pale splinters and drops flung up it, a flare curling out over the lip, a glow at the teeth */
export function drawUpdraft(g, a, b, fy, ty, time, amp) {
  const w = b - a, mid = (a + b) / 2, H = Math.max(40, ty - fy + 6), top = fy - 16;
  const col = amp > 1.2 ? '#e8f6ff' : PAL.mist;
  for (let y = ty; y > top; y -= 4) { const u = (ty - y) / H, hw = w / 2 * (0.62 + 0.34 * u) + Math.sin(y * 0.07 - time * 4) * 2, sx = Math.sin(y * 0.03 + time * 1.6) * 3 * u;
    g.globalAlpha = (0.05 + 0.05 * amp) * (1 - u * 0.5); g.fillStyle = col; g.fillRect(Math.round(mid + sx - hw), y - 4, Math.round(hw * 2), 4); g.globalAlpha = (0.12 + 0.08 * amp) * (1 - u * 0.4); g.fillRect(Math.round(mid + sx - hw), y - 4, 1, 4); g.fillRect(Math.round(mid + sx + hw) - 1, y - 4, 1, 4); }
  for (let j = 0; j < 5; j++) { const ph = j * 1.26; for (let y = ty - 2; y > top; y -= 3) { const u = (ty - y) / H, hw = w / 2 * (0.58 + 0.3 * u), ang = (ty - y) * 0.075 - time * (5 + amp * 2) + ph, x = mid + Math.sin(ang) * hw * 0.85, front = Math.cos(ang) > 0;
      g.globalAlpha = (front ? 0.55 : 0.2) * (1 - u * 0.65) * Math.min(1, amp); g.fillStyle = col; g.fillRect(Math.round(x), y, 1, 2); } }
  for (let j = 0; j < 7; j++) { const ph = (time * (70 + (j % 3) * 22) * (0.8 + amp * 0.3) + j * 37) % H, y = Math.round(ty - ph), u = ph / H, x = Math.round(mid + Math.sin(j * 2.3 + time * 3) * w * 0.36 * (0.5 + u));   /* flung splinters (dark) and drops (pale) */
    g.globalAlpha = 0.85 * (1 - u * 0.6); g.fillStyle = j % 3 === 0 ? PAL.rock3 : j % 3 === 1 ? '#7a5a38' : PAL.rainN; g.fillRect(x, y, j % 3 === 2 ? 1 : 2, j % 3 === 2 ? 3 : 1); }
  const pulse = 0.5 + 0.5 * Math.sin(time * 9);
  g.globalAlpha = (0.3 + 0.2 * pulse) * Math.min(1.4, amp); g.fillStyle = col; for (let q = -1; q <= 1; q += 2) for (let i = 0; i < 6; i++) g.fillRect(Math.round(mid + q * (w * 0.3 + i * 3.2)), Math.round(top - 2 - i * 0.45 * i + (q > 0 ? 0 : 0)), 3, 1);   /* the flare curling out over the lip */
  g.globalAlpha = 0.22 * Math.min(1.5, amp); g.fillStyle = PAL.glow; g.fillRect(Math.round(a + 2), ty - 3, Math.round(w - 4), 3); g.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------------------------------------------- THE GUST
   told: chevrons marching along the deck the way the wind will blow, one more row lit for each toll (k 0 -> 1); a bell's rope swinging with it */
export function drawGustTold(g, x0, x1, fy, dir, k, time) {
  g.fillStyle = PAL.rainN; const n = 1 + Math.round(k * 2);
  for (let r = 0; r < n; r++) { const yy = fy - 10 - r * 11; g.globalAlpha = (0.5 + 0.35 * k) * (1 - r * 0.18);
    for (let x = Math.round(x0 / 34) * 34 - 34; x < x1 + 34; x += 34) { const ax = x + Math.round(wrapX(time * 70 * dir + r * 11, 34)); if (ax < x0 - 4 || ax > x1) continue;
      for (let s = 0; s < 4; s++) { g.fillRect(ax - dir * s, yy - 3 + s, 1, 1); g.fillRect(ax - dir * s, yy + 3 - s, 1, 1); } g.fillRect(ax - dir * 6, yy, 8, 1); } }
  g.globalAlpha = 1;
}
/* the blow: Z.gust.t counts down from tMax; the front runs out from the bell at 480 px/s; behind it a rain sheet, long streaks and grit along the boards */
export function drawGustBlow(g, bellX, x0, x1, fy, dir, age, tMax, time) {
  const front = bellX + dir * Math.min(1, age / (tMax * 0.55)) * 560, k = Math.max(0, 1 - age / tMax);
  for (let i = 0; i < 30; i++) { const back = (i * 23 + (i % 5) * 31) % 260, x = front - dir * back, y = fy - 4 - ((i * 11) % 50); if (x < x0 - 30 || x > x1 + 30) continue;
    g.globalAlpha = 0.65 * k * (1 - back / 300); g.fillStyle = i % 4 ? PAL.rainN : '#ffffff'; const L = 12 + ((i * 7) % 22); g.fillRect(Math.round(dir > 0 ? x - L : x), Math.round(y), L, 1); }
  g.globalAlpha = 0.1 * k; g.fillStyle = PAL.rainN; fillPoly(g, [[front, fy - 56], [front - dir * 230, fy - 56 + 10], [front - dir * 230, fy + 2], [front, fy + 2]], PAL.rainN);
  g.globalAlpha = 0.8 * k; g.fillStyle = PAL.glow; for (let s = 0; s < 14; s++) { const yy = fy - 56 + s * 4, bow = Math.round(Math.sin(s / 13 * Math.PI) * 7); g.fillRect(Math.round(front + dir * bow), yy, 2, 3); }   /* the leading edge, a bowed wall of air */
  g.fillStyle = '#b9ae94'; for (let i = 0; i < 18; i++) { const x = front - dir * ((i * 19 + time * 300) % 220), y = fy - 1 - ((i * 5) % 9); g.globalAlpha = 0.6 * k; g.fillRect(Math.round(x), Math.round(y), 2, 1); }   /* grit along the deck */
  g.globalAlpha = 1;
}
/* THE BELL ROPE, swaying: hung from the lintel's end, a hemp pull with a knot; it swings far more while the bell tolls */
export function drawBellRope(g, x, topY, len, dir, k, time) {
  const sw = dir * (0.35 + 0.9 * k) + Math.sin(time * (5 + 5 * k)) * (0.25 + 0.35 * k);
  for (let i = 0; i < len; i++) { const u = i / len, ox = Math.round(sw * u * u * 9); rect(g, x + ox, topY + i, 1, 1, i % 4 === 0 ? PAL.hempD : PAL.hemp); }
  const ex = x + Math.round(sw * 9); rect(g, ex - 1, topY + len, 3, 3, PAL.hempD); rect(g, ex, topY + len, 1, 1, PAL.hemp);
}

/* ---------------------------------------------------------------------------------------------------------------- THE RISING SKEWER
   told (k 0 -> 1): a column straight up over his helm, as wide as the point can reach, red rails and rising chevrons; struck (strike): the bright streak and its smear */
export function drawSkewerColumn(g, x, bot, top, hitX, k, strike, time) {
  const h = bot - top; if (h < 8) return;
  g.globalAlpha = (0.07 + 0.16 * k); g.fillStyle = PAL.red; g.fillRect(x - hitX, top, hitX * 2, h);
  g.globalAlpha = 0.55 + 0.4 * k; for (let y = bot; y > top; y -= 7) { g.fillRect(x - hitX, y - 4, 1, 4); g.fillRect(x + hitX - 1, y - 4, 1, 4); }
  const sp = (time * 90) % 14; g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ffd0d0'; for (let y = bot - sp; y > top + 4; y -= 14) for (let s = 0; s < 4; s++) { g.fillRect(x - s, y + s, 1, 1); g.fillRect(x + s, y + s, 1, 1); }   /* chevrons rising */
  g.globalAlpha = 0.85; g.fillStyle = PAL.red; g.fillRect(x - hitX, top, hitX * 2, 1); g.fillRect(x - hitX, top, 1, 4); g.fillRect(x + hitX - 1, top, 1, 4);
  if (strike) { g.globalAlpha = 0.9; g.fillStyle = '#ffffff'; g.fillRect(x - 1, top, 2, h); g.globalAlpha = 0.4; g.fillStyle = PAL.gold; g.fillRect(x - 3, top, 6, h); g.globalAlpha = 0.25; g.fillRect(x - hitX, top + 10, hitX * 2, h - 10); }
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------------------------------------------- THE PIVOT: the ring he stamps and the arrow round it - the way he is about to face */
export function drawPivotRing(g, x, y, k, toward) {
  g.globalAlpha = 0.7 * (1 - k * 0.5); g.fillStyle = PAL.gold;
  for (let i = 0; i < 12; i++) { const a = (-toward * (i / 11) * Math.PI * 0.9) + (toward > 0 ? Math.PI : 0) + k * toward * 1.6, px = x + Math.cos(a) * (18 + 4 * k), py = y - 1 + Math.sin(a) * 4;
    if (i % 2 === 0 || i === 11) g.fillRect(Math.round(px), Math.round(py), i === 11 ? 3 : 2, 1); }
  const a = (toward > 0 ? 0 : Math.PI) + k * toward * 0.2, hx = Math.round(x + Math.cos(a) * 20), hy = Math.round(y - 1);
  g.fillRect(hx, hy - 1, 1, 3); g.fillRect(hx + toward, hy, 1, 1); g.fillRect(hx - toward, hy - 2, 1, 1); g.fillRect(hx - toward, hy + 2, 1, 1);   /* the arrow head */
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------------------------------------------- THE TEAR: his pennant leaves on the wind (call tearCloth once, then drawTear every frame) */
export function tearCloth(x, y, time) { S.tear = { x, y, t0: time }; }
export function drawTear(g, cx, cy, time) {
  const T = S.tear; if (!T) return; const age = time - T.t0; if (age > 2.6) { S.tear = null; return; }
  const ribbon = (len, wd, x, y, ph, col, a) => { g.globalAlpha = a; for (let i = 0; i < len; i += 1) { const u = i / len, yy = y + Math.sin(i * 0.3 - age * 14 + ph) * (0.8 + u * 2.4) + u * 4, h = Math.max(1, Math.round(wd * (1 - u * 0.45)));
      g.fillStyle = col; g.fillRect(Math.round(x - i), Math.round(yy), 1, h); if (i < len - 3) { g.fillStyle = PAL.gold; g.fillRect(Math.round(x - i), Math.round(yy), 1, 1); } if (u > 0.82 && wd > 5 && i % 4 === 0) { g.fillStyle = '#14101c'; g.fillRect(Math.round(x - i), Math.round(yy + h / 2), 2, 1); } } };   /* the swallow tail notch */
  const fade = Math.min(1, (2.6 - age) / 0.7);
  const px = T.x - cx - age * 230, py = T.y - cy - age * 46 + Math.sin(age * 5) * 6;
  ribbon(34, 11, px, py, 0, PAL.purple, fade); ribbon(34, 4, px, py + 5, 0.4, PAL.purpleD, fade * 0.9);
  for (let j = 0; j < 5; j++) { const ax = T.x - cx - age * (170 + j * 38) - j * 9, ay = T.y - cy + 6 + j * 4 - age * (20 + j * 16) + Math.sin(age * 6 + j) * 5; ribbon(10 + j * 3, 4, ax, ay, j * 1.3, j % 2 ? PAL.purple : PAL.purpleD, fade * 0.9); }
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------------------------------------------------------- THE HERO IN THE UPDRAFT: the wind wrapped round a lifted body (t: seconds since the lift began) */
export function drawLiftWrap(g, x, y, time) {
  for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) { const a = (time * 7 + i * 0.52 + j * 2.1), yy = y - 6 - i * 3.6 - j * 2, xx = x + Math.sin(a) * (11 - i * 0.35), front = Math.cos(a) > 0;
    g.globalAlpha = (front ? 0.6 : 0.22) * (1 - i / 14); g.fillStyle = j ? PAL.mist : PAL.glow; g.fillRect(Math.round(xx), Math.round(yy), 2, 1); }
  g.globalAlpha = 1;
}
