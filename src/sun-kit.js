// src/sun-kit.js - THE SUN KIT: heat and shade as level DATA (claude/desertkit 11-05; scratch/plan-desert-1105.md 3b). Pure: no DOM, no main.js.
// Proved by tools/sun-kit.mjs; the level API is docs/desertkit.md.
//
// NOT A NEW SUN. The rule stays src/sunstroke.js (the meter P.sun.v, fill 5 s, the DRAIN from 0.4 with floor 1 - it drains, it never kills, no stagger,
// no flinch: design standard A13 / Daniel 10-08) and src/sun-hands.js (the hands: drawn shade, the HUD sun, the step-out warning). Named SUNSTROKE, never
// heat in code: the pyromancer owns P.heat. This kit adds what the desert arc's levels need on top of it, all declared in data:
//   * a PROFILE per level / per box: open sun, GLARE (the Glass Sea: fills faster), DUSK (slower, cools quicker), NIGHT / INTERIOR (no sun at all);
//   * WATER cools: wading, swimming, standing in an oasis pool cools the meter WATER x faster than shade (the plan: "drains in shade/water");
//   * HOT boxes (sun-glass floors, a furnace mouth, the King's Pyramid sun-shaft): fill HOT x faster - a told place, drawn hot (art owed);
//   * COOL boxes (L.sunKit.cool, tiles): shade declared in tiles beside sunstroke's L.shade px rects and the props' SHADE_OF;
//   * the FULL READ: at a full meter the hero is SUNSTRUCK - the HUD says so (it is the drain's top rate, 4.5%/s to the floor of 1 hp: never instant
//     death, never a stun). Leaving the sun stops it at once, as today;
//   * THE DESERT PRIEST's hook (plan Q4, REC: no immunity - the sun hurts him like everyone - but the sun FILLS his RADIANCE): sunFeed(r) is the multiplier
//     his kit puts on its radiance fill while he stands in the open sun (one line in the claude/desertpriest kit at the integ, docs/desertkit.md);
//   * every seat (1-4): sunSeats() runs each hero on his own meter, the dead left alone; sunReset() for a respawn / a level change.
//
//   const S = sunKitInit(L)                     -> { profile, hot[], cool[], water[] } px boxes from L.sunKit (tiles) + sunstroke's shadeZones(L)
//   exposureOf(S, body, io)                     -> 'water' | 'shade' | 'hot' | 'sun' | 'none'   io = { inWater(b), shaded(b) (main.js cvShaded), profileAt }
//   sunKitStep(s, dt, exposure, profile)        -> sunStep's { swim, drain, rate, stage, warm } + { exposure, struck }   (s = P.sun)
//   sunSeats(S, players, dt, io)                -> Map(hero -> result) for every live seat
//   sunFeed(r)                                  -> the Desert Priest's radiance fill multiplier this frame (1 off the sun)
//   heatRead(r)                                 -> { label, col } for the HUD line (null when cool)
//   lintSun(L, route?)                          -> [] or the problems (bad profile, boxes off the map, a hot box in water, a sun walk too long)
import { SUN, sunStep, shadeZones, inShade, sunStretches } from './sunstroke.js';

export const TS = 16;
export const SUNKIT = {
  profiles: {
    open:     { fill: 1,    cool: 1 },      /* the Caravan, the Ksar: sunstroke.js as it is */
    glare:    { fill: 1.25, cool: 1 },      /* the Glass Sea by day, the Great Dune crests: full in 4 s */
    dusk:     { fill: 0.6,  cool: 1.3 },    /* the Sun Temple's siege, the airship's low line */
    night:    { fill: 0,    cool: 2 },      /* no sun: the meter only cools */
    interior: { fill: 0,    cool: 1.5 },    /* the tombs, Underwell, the Buried City's halls */
  },
  water: 2.5,      /* in water the meter cools this much faster than in shade (full -> cool in ~0.5 s) */
  hot: 1.6,        /* on a HOT box it fills this much faster than the profile says (stacked: glare + hot = full in 2.5 s) */
  struck: 0.999,   /* the meter at which the HUD says SUNSTRUCK */
  feed: 0.5,       /* THE DESERT PRIEST: in the open sun his radiance fills x(1 + feed) (6 s -> 4 s); on a hot box x(1 + feed x hot) */
  read: { struck: ['SUNSTRUCK - FIND SHADE', '#ff5a3c'], sun: ['THE SUN', '#ff9a4c'], hot: ['THE GLASS BURNS', '#ff7a3c'], water: ['COOLING', '#7fd0ff'] },
};
const box = b => [b[0] * TS, (b[2] + 1) * TS, b[1] * TS, (b[3] + 1) * TS];   /* tiles [x0, y0, x1, y1] inclusive -> sunstroke's px [x0, x1, y0, y1] */
const inBox = (z, x, y) => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3];

export function sunKitInit(L) {
  const K = L.sunKit || {};
  return {
    profile: K.profile || 'open',
    zones: (K.zones || []).map(z => ({ px: box(z.box), profile: z.profile })),   /* a box with its own profile (a dusk courtyard in an open level) */
    hot: (K.hot || []).map(box), cool: (K.cool || []).map(box), water: (K.water || []).map(box),
    shade: shadeZones(L),
  };
}
export const profileAt = (S, x, y) => { for (const z of S.zones) if (inBox(z.px, x, y)) return z.profile; return S.profile; };
/* WHERE IS HE? water beats shade beats hot beats sun; a profile with no sun (night, interior) is 'none' unless he is in water */
export function exposureOf(S, b, io = {}) {
  const x = b.x, y = b.y - (b.h || 14) / 2;
  if ((io.inWater && io.inWater(b)) || S.water.some(z => inBox(z, x, y))) return 'water';
  if (SUNKIT.profiles[profileAt(S, x, y)].fill <= 0) return 'none';
  if ((io.shaded && io.shaded(b)) || S.cool.some(z => inBox(z, x, y)) || inShade(S.shade, x, y)) return 'shade';
  if (S.hot.some(z => inBox(z, x, y))) return 'hot';
  return 'sun';
}
/* ONE STEP of the meter: sunstroke's own sunStep on a scaled clock (so its numbers stay the rule), the drain taken on the real one */
export function sunKitStep(s, dt, exposure, profile = 'open') {
  const P = SUNKIT.profiles[profile] || SUNKIT.profiles.open, out = exposure === 'sun' || exposure === 'hot';
  const k = out ? P.fill * (exposure === 'hot' ? SUNKIT.hot : 1) : P.cool * (exposure === 'water' ? SUNKIT.water : 1);
  const r = sunStep(s, dt * k, !out);
  return { ...r, drain: r.rate * dt, exposure, profile, struck: out && s.v >= SUNKIT.struck };
}
/* EVERY SEAT: each hero his own meter (P.sun), the dead skipped and cooled; returns Map(hero -> result) for the hands (drain via drain.js, the read) */
export function sunSeats(S, players, dt, io = {}) {
  const res = new Map();
  for (const p of players) {
    if (!p.sun) p.sun = { v: 0 };
    if (p.dead) { p.sun.v = 0; continue; }
    const ex = exposureOf(S, p, io), r = sunKitStep(p.sun, dt, ex, profileAt(S, p.x, p.y - 7));
    p.sunStage = r.stage; p.sunStruck = r.struck; res.set(p, r);
  }
  return res;
}
export const sunReset = p => { p.sun = { v: 0 }; p.sunStage = 0; p.sunStruck = false; };
/* THE DESERT PRIEST'S TRADE (plan Q4 REC): the sun burns him like everyone, and it fills his radiance faster */
export const sunFeed = r => !r ? 1 : r.exposure === 'hot' ? 1 + SUNKIT.feed * SUNKIT.hot : r.exposure === 'sun' && (SUNKIT.profiles[r.profile] || {}).fill > 0 ? 1 + SUNKIT.feed : 1;
export function heatRead(r) {
  if (!r) return null;
  const R = SUNKIT.read, w = r.struck ? R.struck : r.exposure === 'hot' && r.stage ? R.hot : r.stage ? R.sun : r.exposure === 'water' && r.warm > 0.02 ? R.water : null;
  return w ? { label: w[0], col: w[1] } : null;
}
/* THE LEVEL CHECK. route (optional): foot positions [x, y] px along the main road; every walk in the sun between two shades (or water), timed at RUN and
   scaled by the profile's fill, stays within SUN.maxWalk (sunstroke's rule: a shade route always exists) */
export function lintSun(L, route) {
  const bad = [], K = L.sunKit; if (!K) return bad;
  const S = sunKitInit(L), W = (L.w || L.W || 1e9), H = (L.h || L.H || 1e9);
  if (!SUNKIT.profiles[S.profile]) bad.push('unknown profile ' + S.profile);
  for (const z of K.zones || []) if (!SUNKIT.profiles[z.profile]) bad.push('zone with unknown profile ' + z.profile);
  for (const [name, list] of [['hot', K.hot], ['cool', K.cool], ['water', K.water], ['zone', (K.zones || []).map(z => z.box)]])
    for (const b of list || []) { if (!Array.isArray(b) || b.length !== 4 || b[0] > b[2] || b[1] > b[3]) bad.push(name + ' box malformed ' + JSON.stringify(b));
      else if (b[0] < 0 || b[1] < 0 || b[2] >= W || b[3] >= H) bad.push(name + ' box off the map ' + JSON.stringify(b)); }
  for (const h of S.hot) for (const w of S.water) if (h[0] < w[1] && w[0] < h[1] && h[2] < w[3] && w[2] < h[3]) bad.push('a hot box overlaps water at x ' + h[0]);
  if (route) {
    const fill = x => (SUNKIT.profiles[profileAt(S, x, 0)] || SUNKIT.profiles.open).fill;
    const st = sunStretches(route, (x, y) => { const e = exposureOf(S, { x, y, h: 14 }); return e === 'shade' || e === 'water' || e === 'none'; });
    for (const s of st) { const hotK = route.some(([x, y]) => x >= s.x0 && x <= s.x1 && exposureOf(S, { x, y, h: 14 }) === 'hot') ? SUNKIT.hot : 1;
      if (s.s * fill(s.x0) * hotK > SUN.maxWalk + 1e-6) bad.push('a sun walk of ' + s.s.toFixed(1) + ' s (x' + (fill(s.x0) * hotK).toFixed(2) + ') from x ' + Math.round(s.x0) + ' > ' + SUN.maxWalk + ' s: add shade'); }
  }
  return bad;
}
