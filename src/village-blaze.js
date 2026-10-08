// village-blaze.js - THE TOWN BEHIND THE STREET REALLY BURNS (claude/burnvillage2, Daniel's brief 10-07 #4: "today the fire sits at
// the top and never reaches them. Flames climb walls, roofs collapse, smoke/embers, fire spreads across the level over time.
// Render-side; keep the rule state drawn (A3)").
//
// RENDER-SIDE ONLY. Nothing here is the level's rule: the rule is src/fire-spread.js's grid (ONLY HIS FIRE SPREADS), drawn in the play
// layer as real flames that hurt. This is the dressing far behind it - the parallax town and the burning fronts (L.facades 'burning') -
// and it never hurts, never lights a cell and never draws over the play: the sky's glow still follows the grid (VG.heat, A3), so putting
// HIS fire out still takes the sky down with it. What is new is that each building BEHIND the street goes through a fire of its own:
//
//   UNLIT -> ROOF (tongues along the thatch) -> WALLS (the fire climbs DOWN the gable and out of every window, the walls glow) ->
//   COLLAPSE (the roof falls in: the ridge sags and breaks, a burst of embers and a rolling cloud) -> SHELL (black walls, broken rafters,
//   embers glowing in the window holes, a thin smoke)
//
// and THE FIRE SPREADS ACROSS THE LEVEL OVER TIME: a front starts at the road in and moves east at FRONT.v tiles a second of the level's
// clock, so a player who hurries runs ahead of it into a town that is only beginning to catch, and one who lingers looks back at shells.
// A few houses ahead of the front are already alight (the goblins ran ahead with torches: ahead = seed % FRONT.ahead === 0).
//
// PURE but for the two draw helpers (which take a 2D context): tools/village-water.mjs drives blazeAt and stageOf directly.
export const BLAZE = { roof: 24, walls: 75, collapse: 3 };   /* s in each stage: the thatch alone, the fire down the walls, the fall */
export const FRONT = { v: 1.0, lead: 24, ahead: 3, aheadLead: 300 };      /* tiles/s; tiles of the road alight at the start; 1 house in `ahead` is lit early, up to aheadLead tiles in front */
export const STAGES = ['unlit', 'roof', 'walls', 'collapse', 'shell'];
/* when the building at world tile wx (seed: its own index) catches, in seconds of the level's clock (<= 0: already burning at the start) */
export function igniteAt(wx, seed) {
  const jit = ((seed * 37) % 11) - 5;                                  /* +-5 s, so a row does not light like a fuse */
  if (((seed % FRONT.ahead) + FRONT.ahead) % FRONT.ahead === 0 && wx < FRONT.lead + FRONT.aheadLead) return (((seed * 53) % 120) + 120) % 120 - 25 + jit;   /* run ahead of the front: lit by the goblins who ran on, at its own moment in the first two minutes */
  return (wx - FRONT.lead) / FRONT.v + jit;
}
/* the stage of a building and how far into it (0..1) at level time t; age is the seconds since it caught */
export function stageOf(age) {
  if (age < 0) return { st: 'unlit', k: 0, age };
  if (age < BLAZE.roof) return { st: 'roof', k: age / BLAZE.roof, age };
  if (age < BLAZE.roof + BLAZE.walls) return { st: 'walls', k: (age - BLAZE.roof) / BLAZE.walls, age };
  if (age < BLAZE.roof + BLAZE.walls + BLAZE.collapse) return { st: 'collapse', k: (age - BLAZE.roof - BLAZE.walls) / BLAZE.collapse, age };
  return { st: 'shell', k: 1, age };
}
export const blazeAt = (wx, seed, t) => stageOf(t - igniteAt(wx, seed));
/* the share of the front's road that is burning or burnt at time t (a tool reads it: the fire really moves) */
export const frontAt = t => FRONT.lead + Math.max(0, t) * FRONT.v;

const FL = ['#fff0b0', '#ffd36b', '#ff9a3c', '#ff6b2c', '#c8401c'];
/* ONE TONGUE of fire, a pixel row at a time: wide at the root, tapering, leaning in the wind, white-yellow to red */
function tongue(g, cx, by, base, h, time, s) {
  for (let r = 0; r < h; r++) { const k = r / h, ww = Math.max(1, Math.round(base * Math.pow(1 - k, 0.75))), lean = Math.sin(time * 1.3 + s) * k * 3 + Math.sin(time * 9 + s + r * 0.5) * k * k * 2;
    g.fillStyle = FL[Math.min(FL.length - 1, Math.floor(k * FL.length * 0.95))]; g.fillRect(Math.round(cx - ww / 2 + lean), by - r, ww, 1); }
}
function embers(g, x, y, time, seed, n, spread, rise) {
  for (let q = 0; q < n; q++) { const k = (time * 0.7 + q * 0.29 + seed * 0.17) % 1; g.globalAlpha = 1 - k; g.fillStyle = q % 2 ? '#ffd36b' : '#ff9a3c';
    g.fillRect(Math.round(x + Math.sin(time * 1.7 + q * 2.1 + seed) * spread + k * 8), Math.round(y - k * rise), 1, 1); }
  g.globalAlpha = 1;
}
function smoke(g, x, y, time, seed, n, dark) {
  for (let q = 0; q < n; q++) { const t = (time * 0.5 + q * 0.31 + seed * 0.13) % 1, s = t < 0.35 ? 2 : 3;
    g.globalAlpha = (dark ? 0.6 : 0.4) * (1 - t); g.fillStyle = t < 0.2 ? '#4a2a22' : '#22181c';
    g.fillRect(Math.round(x + Math.sin(time * 0.8 + q + seed) * (3 + t * 12) + t * 8), Math.round(y - t * 80), s, s); }
  g.globalAlpha = 1;
}
/* A BUILDING OF THE TOWN BEHIND, through its fire. (x, y) is its wall's top-left on the screen, w x h the wall, peak the roof's height
   over it; b = blazeAt(...); heat (0..1) the grid's fire near the camera (VG.heat): the sky's rule, which still sets how tall it stands */
export function drawBlazingHouse(g, x, y, w, h, peak, b, time, seed, heat, chimney) {
  const st = b.st, k = b.k, tall = 1 + 0.4 * Math.max(0, Math.min(1, heat)), wall = '#1a0e10';
  /* THE WALLS: black, and while the fire is in them they glow at the seams, brighter as it climbs down */
  g.fillStyle = st === 'shell' ? '#120a0c' : wall; g.fillRect(x, y, w, h + 30);
  if (st === 'walls' || st === 'collapse') { g.globalAlpha = 0.18 + 0.25 * (st === 'walls' ? k : 1) + 0.06 * Math.sin(time * 6 + seed); g.fillStyle = '#7a2414';
    const gy = y + Math.round(h * (1 - (st === 'walls' ? k : 1)) * 0.8); g.fillRect(x + 1, gy, w - 2, y + h + 30 - gy); g.globalAlpha = 1; }
  /* THE ROOF: whole, sagging as it goes, then fallen in - a jagged line of broken rafters against the glow */
  const sag = st === 'collapse' ? Math.round(peak * Math.min(1, k * 1.4)) : st === 'shell' ? peak + 2 : st === 'walls' ? Math.round(peak * 0.25 * k) : 0;
  if (st !== 'shell' && sag < peak) { g.fillStyle = wall; g.beginPath(); g.moveTo(x - 3, y + 1); g.lineTo(x + w / 2, y - peak + sag); g.lineTo(x + w + 3, y + 1); g.fill(); }
  if (st === 'collapse' || st === 'shell') { g.fillStyle = '#0c0608'; for (let q = 0; q < 4; q++) { const rx = x + 3 + Math.round(q * (w - 6) / 3), rh = 3 + ((seed + q * 3) % 5) + (st === 'collapse' ? Math.round((1 - k) * 6) : 0);
      g.fillRect(rx, y - rh, 2, rh + 1); } }                                                                  /* THE RAFTERS, broken off short */
  if (chimney && st !== 'collapse') { g.fillStyle = wall; g.fillRect(x + w - 9, y - peak - 6 + (st === 'shell' ? peak : 0), 5, peak + 6 - (st === 'shell' ? peak : 0)); }
  /* THE WINDOWS: lamplit before, fire in them once it is in the walls, embers in the holes after */
  const nw = Math.max(1, Math.floor((w - 6) / 9));
  for (let q = 0; q < nw; q++) { const wx = x + 5 + q * 9, wy = y + 8 + (q % 2) * 7;
    if (st === 'unlit') { g.fillStyle = (seed + q) % 3 ? '#3a1a14' : '#7a4a22'; g.fillRect(wx, wy, 3, 4); continue; }
    if (st === 'roof') { g.fillStyle = Math.floor(time * 6 + seed + q) % 3 ? '#ff9a3c' : '#ffd36b'; g.fillRect(wx, wy, 3, 4); continue; }
    if (st === 'shell') { g.fillStyle = '#000000'; g.fillRect(wx, wy, 3, 4); if ((Math.floor(time * 2) + q + seed) % 3 === 0) { g.fillStyle = '#7a2414'; g.fillRect(wx + 1, wy + 3, 1, 1); } continue; }
    g.fillStyle = '#fff0b0'; g.fillRect(wx, wy, 3, 4);
    /* THE FIRE CLIMBS: a tongue up out of every window, taller as the walls go */
    if ((q + seed) % 2 === 0 || st === 'collapse') tongue(g, wx + 1.5, wy, 4, Math.round((4 + 8 * (st === 'walls' ? k : 1) + Math.sin(time * 8 + q + seed) * 2) * tall), time, seed + q); }
  /* THE ROOF ALIGHT: a row of tongues along the thatch (the old picture), and - in the walls stage - down both gable edges */
  if (st === 'roof' || st === 'walls') { const n = Math.max(3, Math.round(w / 7)), ry = y - peak + sag + 4;
    for (let i = 0; i < n; i++) { const cx = x + (i + 0.5) * w / n, d = Math.abs(cx - (x + w / 2)) / (w / 2), by = Math.round(ry + d * (peak - sag) - 3);
      tongue(g, cx, by, Math.max(2, Math.round(w / n) + 1), Math.round((8 + ((seed * 7 + i * 5) % 7) + Math.sin(time * (6 + (i % 3)) + seed * 3 + i) * 3) * tall * (st === 'roof' ? 0.6 + 0.6 * k : 1.2)), time, seed * 3.1 + i * 1.7); }
    if (st === 'walls') { const down = Math.round(h * k);
      for (const ex of [x + 1, x + w - 2]) for (let r = 0; r < down; r += 6) tongue(g, ex, y + r + 6, 3, 5 + ((r + seed) % 4), time, seed + r * 0.3 + ex); } }
  /* THE FALL: a burst of embers and a cloud rolling up out of it */
  if (st === 'collapse') { embers(g, x + w / 2, y - 2, time * 3, seed, 16, w / 2, 40 + 30 * k); smoke(g, x + w / 2, y - 4, time * 1.6, seed, 10, true);
    for (let i = 0; i < 4; i++) tongue(g, x + (i + 0.5) * w / 4, y + 2, Math.round(w / 4) + 2, Math.round((10 + ((seed + i * 5) % 7) + 10 * (1 - k)) * tall), time, seed + i * 2.3); }   /* a ragged row of fire where the roof was */
  /* AND ALWAYS: smoke off what is burning (thick in the walls), embers lifting off it; a thin grey thread off a shell */
  if (st === 'roof') { smoke(g, x + w / 2, y - peak - 8, time, seed, 4 + Math.round(4 * k), false); embers(g, x + w / 2, y - peak, time, seed, 4, w / 3, 26); }
  if (st === 'walls') { smoke(g, x + w / 2, y - peak - 6, time, seed, 9, true); embers(g, x + w / 2, y - peak, time, seed, 8, w / 2, 34); }
  if (st === 'shell') { smoke(g, x + w / 2, y - 4, time * 0.6, seed, 3, false); if ((seed % 2) === 0) embers(g, x + w / 2, y + 2, time * 0.5, seed, 2, w / 3, 10); }
}
/* A BURNING FRONT (L.facades 'burning', just behind the street): the fire climbs it from the street up and back down as the
   blaze goes - tongues out of its foot, licking up its face, its top edge ragged once it has gone. (sx, sy, w, h) on the screen */
export function drawBlazingFront(g, sx, sy, w, h, b, time, seed, heat) {
  const st = b.st, k = b.k, up = st === 'unlit' ? 0.12 : st === 'roof' ? 0.25 + 0.25 * k : st === 'walls' ? 0.5 + 0.45 * k : st === 'collapse' ? 0.95 : 0.35;
  g.globalAlpha = 0.05 + 0.06 * up + 0.025 * Math.sin(time * 7 + seed); g.fillStyle = '#ff8a3c'; g.fillRect(sx, sy + Math.round(h * (1 - up)), w, Math.round(h * up)); g.globalAlpha = 1;   /* its glow, as high as the fire has climbed */
  if (st === 'unlit') return;
  const n = Math.max(2, Math.round(w / 14)), tall = 1 + 0.4 * Math.max(0, Math.min(1, heat));
  g.globalAlpha = st === 'shell' ? 0.35 : 0.55;   /* behind the play: a dim fire, never a bright one over a tell (A3: the grid's fire in front is the one that is drawn hot) */
  for (let i = 0; i < n; i++) { const cx = sx + (i + 0.5) * w / n, hh = Math.round(h * up * (0.45 + 0.35 * (((seed + i * 7) % 5) / 5)) * (st === 'shell' ? 0.25 : 1) * tall);
    tongue(g, cx, sy + h - 1, 5, Math.max(3, Math.round(hh * 0.5 + Math.sin(time * 5 + i + seed) * 3)), time, seed + i * 1.3); }
  g.globalAlpha = 1;
  if (st === 'walls' || st === 'collapse') embers(g, sx + w / 2, sy + Math.round(h * (1 - up)), time, seed, 6, w / 2, 30);
}
