// src/theatre-rig.js - THE MASKWRIGHT'S THEATRE's stage machinery (claude/theatre, greybox). Pure: no DOM, no globals.
// src/maskwright-theatre.js builds the level and hands its machinery here as data (L.theatre); src/main.js holds the hands (theatreReset,
// updateTheatre, drawTheatre) and calls these steps. tools/theatre.mjs drives them headless and through the page. Brief: docs/briefs/maskwright-theatre.md.
//
// THE THREE MACHINES (each TAUGHT, DEVELOPED, TWISTED and EXAMINED in the level):
//   THE FLY LINES   a batten (a platform) and its sandbag (a platform too) hang on one rope over a pulley. Strike the line's ROPE-LOCK and the line
//                   runs: the batten flies OUT (up) if it was IN (down), and back; the sandbag always goes the other way. A sandbag coming IN lands
//                   on whatever stands under it (a foe takes BAG_DMG; a hero is never crushed - he is under a platform, and platforms are walked
//                   onto from above only). Ride the batten up, or ride the sandbag DOWN (the counterweight as a lift).
//   THE FLATS       painted scenery on a track in the floor: a SOLID block w x h that slides between two columns when its WINCH is struck (or on
//                   the show's cue). It is a wall, a step, a door into the wall (the prop store), or a floor over the sump. It moves a column at a
//                   time and shoves a body in its way; one that cannot be shoved stops it until the way is clear.
//   THE LIMELIGHTS  a lamp on a stand or a rail throws a POOL of light on a floor. Strike the lamp and it swings to its next aim. ANYTHING IN
//                   THE LIGHT IS SEEN: a mummer standing in a lit pool cannot move, whoever is looking (the facing rule, src/mummer.js, is the
//                   harvest fair's; the lamp is a look that does not turn round). A pool is dark where scenery stands between it and its lamp.
//                   THE AUDIENCE (a drunk in a box) throws only at a hero who stands in the light.
// And the show: in THE PERFORMANCE the lamps, one flat and the stage traps run on the prompt book's CUES, a loop that starts when the curtain goes up.
export const TS = 16;
export const RIG = {
  flySpeed: 96,          /* px/s a line runs (a batten 9 rows takes about 1.5 s) */
  bagDmg: 60,            /* a sandbag landing on a foe (a mummer is 40, a sworn sword 60): it is the twist, and it should settle the one it lands on */
  flatStep: 0.08,        /* s a flat takes per column (a six-column slide is half a second) */
  swing: 0.35,           /* s a lamp takes to swing to its next aim */
  poolUp: 44,            /* px above a pool's floor that the light reaches (a standing figure is 22-27 px) */
  poolDown: 6,
  trapWarn: 1.0,         /* s the edges of a stage trap glow before it drops */
  cueWarn: 0.9,          /* s a cued flat's track glows (and the prompt bell rings) before it moves */
};

/* ---------------- THE LIMELIGHTS ---------------- */
/* a lamp: { x, y (px, the lamp's head), aims: [[x, floorY], ...] (px), i (the aim it is on), from (the aim it swings from), k (0..1 through the swing), r (px) } */
export const newSpot = (s) => ({ ...s, i: s.i || 0, from: s.i || 0, k: 1, held: false, cueT: 0 });
/* where its pool is this frame: between the aim it left and the one it is going to */
export function poolOf(s) {
  const a = s.aims[s.from], b = s.aims[s.i], k = Math.max(0, Math.min(1, s.k));
  return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, r: s.r };
}
/* is the beam clear from the lamp to the pool (nothing SOLID between them)? solidPx(x, y) answers for a pixel. The ends are forgiven: the lamp
   hangs off a rail, and the pool lies on a floor */
export function beamClear(s, solidPx, pool = poolOf(s)) {
  const x0 = s.x, y0 = s.y, x1 = pool.x, y1 = pool.y - 12, d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d / 4));
  for (let i = 1; i < n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    if (Math.hypot(x - x0, y - y0) < 10 || Math.hypot(x - x1, y - y1) < 8) continue;
    if (solidPx(x, y)) return false; }
  return true;
}
/* is (x, y) - a figure's FEET - standing in a lit pool? */
export function inPool(pool, x, y) {
  return Math.abs(x - pool.x) <= pool.r && y >= pool.y - RIG.poolUp && y <= pool.y + RIG.poolDown;
}
export function litBy(spots, x, y, solidPx) {
  for (const s of spots) { if (s.off) continue; const p = poolOf(s); if (inPool(p, x, y) && beamClear(s, solidPx, p)) return s; }
  return null;
}
/* a lamp struck: it swings to its next aim; a lamp on a cue that is struck comes off its cue and stays where you pointed it (held) */
export function strikeSpot(s) { s.from = s.i; s.i = (s.i + 1) % s.aims.length; s.k = 0; if (s.cue) s.held = true; }
/* one frame of a lamp. show: is the performance running (a cued lamp waits for it). Returns events: swing */
export function spotStep(s, dt, show) {
  const evs = []; if (s.k < 1) s.k = Math.min(1, s.k + dt / RIG.swing);
  if (s.cue && show && !s.held) { s.cueT += dt; if (s.cueT >= s.cue) { s.cueT = 0; s.from = s.i; s.i = (s.i + 1) % s.aims.length; s.k = 0; evs.push({ t: 'swing' }); } }
  return evs;
}

/* ---------------- THE FLY LINES ---------------- */
/* a line: { id, out (bool) }. Its two movers carry { role: 'batten' | 'bag', yIn, yOut } - the y (px, the platform's top) when the line is IN
   (the batten down) and when it is OUT (the batten up). A bag's yIn is HIGH and its yOut LOW: it always goes the other way */
export const lineTarget = (m, out) => out ? m.yOut : m.yIn;
/* one frame of one mover of a line: toward its target at RIG.flySpeed. Returns the step it took (px, + is down) */
export function flyStep(m, out, dt, speed = RIG.flySpeed) {
  const want = lineTarget(m, out), d = want - m.y, step = Math.sign(d) * Math.min(Math.abs(d), speed * dt);
  m.y += step; return step;
}
/* does a sandbag coming DOWN land on a body? bag: its mover (x, y top, w; the sack hangs BAG_H under the platform top), box: { l, r, t, b } px */
export const BAG_H = 14;
export function bagLands(m, box, fell) {
  if (!(fell > 0)) return false;
  const l = m.x + 2, r = m.x + m.w - 2, b = m.y + BAG_H;
  return box.r > l && box.l < r && box.t < b && box.b > m.y - fell;
}

/* ---------------- THE FLATS ---------------- */
/* a flat: { axis: 'x' | 'y', a (its position A: the left column, or on a flown shutter the top row), b (position B), w, and y0..y1 (rows, axis x) or
   x0 and h (axis y), at (where it stands now), to (where it is going), base: [[x, y, tile], ...] - what is under its whole track with no flat on it }.
   flatCells(f, pos) -> the cells it fills standing at pos */
export function flatCells(f, pos) { const out = [];
  if (f.axis === 'y') { for (let y = pos; y < pos + f.h; y++) for (let x = f.x0; x < f.x0 + f.w; x++) out.push([x, y]); }
  else for (let y = f.y0; y <= f.y1; y++) for (let x = pos; x < pos + f.w; x++) out.push([x, y]);
  return out; }
export const flatTarget = (f, posB) => posB ? f.b : f.a;
/* one frame of a flat: it steps a column toward f.to every RIG.flatStep s, when canStep(nextCol) says the cells it would fill are clear of anyone
   it cannot shove. Returns 'step' (it moved), 'blocked', 'done' (it arrived this frame) or null */
export function flatStep(f, dt, canStep) {
  if (f.at === f.to) return null;
  f.t = (f.t || 0) + dt; if (f.t < RIG.flatStep) return null; f.t = 0;
  const next = f.at + Math.sign(f.to - f.at);
  if (canStep && !canStep(next)) return 'blocked';
  f.at = next; return f.at === f.to ? 'done' : 'step';
}

/* ---------------- THE STAGE TRAPS ---------------- */
/* a trap: { x0, x1, row, cue: { period, open, at } } - it DROPS (its boards go) for `open` s every `period` s, at `at` s into the loop, and its
   edges glow RIG.trapWarn s before. Off the show it stays shut (a board you can press down through, like the Folly's rotten boards) */
export function trapPhase(tr, t) {
  const c = tr.cue; if (!c) return 'shut';
  const u = ((t - (c.at || 0)) % c.period + c.period) % c.period;
  if (u < c.open) return 'open';
  if (u >= c.period - RIG.trapWarn) return 'warn';
  return 'shut';
}
/* a cued flat: it stands at A, and goes to B for `hold` s every `period` s (the scene change), told RIG.cueWarn s before */
export function flatCue(f, t) {
  const c = f.cue; if (!c) return null;
  const u = ((t - (c.at || 0)) % c.period + c.period) % c.period;
  return { posB: u < c.hold, warn: (u >= c.hold - RIG.cueWarn && u < c.hold) || u >= c.period - RIG.cueWarn };
}

/* ---------------- WHAT THE LEVEL SAYS IT IS (for the check and the brief) ---------------- */
/* every machine's arc: { machine: { teach: [x0, x1], develop: [...], twist: [...], exam: [...] } } - read by tools/theatre.mjs */
export const MACHINES = ['fly', 'flat', 'spot'];
