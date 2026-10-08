// src/reach-hero.js - HOW FAR EACH HERO REALLY JUMPS, for the reach model (claude/reachcore, Daniel-approved 10-07).
// src/reachcore.js's fill took one jump for everybody: three rows up and SIX columns across, a toe on the far lip counted as a landing, and
// no slide. THE GLASS SEA's slide gap was frame-tight for every hero (a normal press cleared 0.27 tiles from a six-frame window) and passed
// every check on that six. This module flies the game's own numbers (src/hero-move.js: the run, the sprint, the arc, the air control; the
// slide is src/slopes.js's slideStep itself) frame by frame at the game's 60 Hz, per hero, and hands floodReach (opts.hero) the distances:
//   a RUN-UP is what the floor behind you gives: from a standstill at its far end, the legs' acceleration and - only once the run has been
//     held long enough - the sprint. A jump off a two-tile ledge is not a sprint jump;
//   a SLIDE launch (hold DOWN on a slope) carries the slide's speed into the air, where the slide owns it and bleeds it slowly
//     (slideStep's airFric), and the Glass Sea's slick glass keeps what it built (RIDE_MOVE: slideAcc, the 'keep' ceiling);
//   a GLIDE (the Sky Road's cloak) sinks at GLIDE_FALL at the hero's own air speed;
//   a LANDING over a gap counts only a tile clear of the far lip (the centre a whole tile past it), never a toe on it. A miss that only
//     drops you back where you started (a wall under the lip, a step) is no gap: there the toe and the mantle are fair, as in play.
// Base movement only (A7): no charm, no mobility skill, no roll or dash pace carried into a jump, no coyote frames, no fast fall.
// Every table is cached: a few hundred short flights per hero for the whole game. tools/reach-heroes.mjs --page measures each hero's
// real jump in the game and fails if these numbers and the game's disagree.
import { MOVE, RIDE_MOVE, SPRING_MOVE, WARDEN_SPEAR, heroRunMul, sprintK } from './hero-move.js';
import { POGO_CHAIN } from './pogo-chain.js';
import { SLIDE, slideStep, isSlope, slopeRise, slopeGrade } from './slopes.js';

const TS = 16, DT = MOVE.DT, MAX_DROP = 48, RUNWAY_MAX = 24;
const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };

/* THE RUN-UP: from a standstill, `px` of floor to the take-off, the stick held - the walk's own acceleration, its cap with the sprint the run
   earns (runT counts only while faster than SPRINT_HOLD of a run, on the ground - so a hero whose legs never reach it never sprints) */
export function runUp(hero, px, slick = false) {
  return memo('run|' + hero + '|' + Math.round(px) + '|' + (slick ? 1 : 0), () => {
    let x = 0, vx = 0, runT = 0;
    for (let i = 0; i < 2000 && x < px; i++) {
      const cap = MOVE.RUN * heroRunMul(hero, true) * (1 + MOVE.SPRINT_BONUS * sprintK(runT));
      vx += (slick ? MOVE.ACC_SLICK : MOVE.ACC_GROUND) * DT; if (vx > cap) vx = cap;
      x += vx * DT; if (vx > MOVE.RUN * MOVE.SPRINT_HOLD) runT += DT; else runT = 0;
    }
    return { vx, runT, slick };
  });
}

/* ONE FLIGHT, feet relative to the take-off (u forward, h UP). launch: { vx, runT } for a run, { slide: v } for a slide's carry, walkOff for
   stepping off the edge with no jump, glide for the cloak held. capPx: a ceiling - the rise stops there (the head meets the rock: vy 0).
   Returns D: up[k] the furthest forward the feet can come DOWN onto a floor k rows higher (null: the arc never gets there), down[k] the
   same k rows lower; and rise, the apex in px. Air control is the stick held forward the whole way (the furthest); any landing short of D
   is reachable too (let go, or pull back). A THROW (launch.vy0: a springy tile, a bud, a foe's head) starts in the air at that speed; the warden's
   VAULT (launch.fwd, launch.fwdT) is carried forward at its own pace for its own while. */
export function flight(hero, launch, capPx = Infinity) {
  const k = 'fl|' + hero + '|' + JSON.stringify(launch) + '|' + capPx;
  return memo(k, () => {
    let u = 0, h = 0, vx = launch.slide ? launch.slide : launch.vx, vy = launch.walkOff ? 0 : launch.vy0 ?? MOVE.JUMPV, rise = 0;
    const up = [], down = [], sk = sprintK(launch.runT || 0);
    const cap = MOVE.RUN * heroRunMul(hero, false) * (1 + MOVE.SPRINT_BONUS * sk);
    up[0] = null;
    for (let i = 0; i < 1200; i++) {
      /* the stick, forward (main.js updatePlayer's walk: air acceleration, a speed over the cap bleeds to it) - unless the slide owns vx */
      /* (the take-off frame's walk is still the ground's: main.js moves the legs before it reads the jump) */
      const air = i || launch.walkOff || launch.vy0 !== undefined, c0 = air ? cap : MOVE.RUN * heroRunMul(hero, true) * (1 + MOVE.SPRINT_BONUS * sk), a0 = air ? MOVE.ACC_AIR : launch.slick ? MOVE.ACC_SLICK : MOVE.ACC_GROUND;
      if (launch.slide) { vx -= SLIDE.airFric * DT; if (vx < 0) vx = 0; }
      else if (vx > c0) vx = Math.max(c0, vx - MOVE.OVER_BLEED * DT);
      else { vx += a0 * DT; if (vx > c0) vx = c0; }
      if (launch.fwd && i * DT < launch.fwdT && vx < launch.fwd) vx = launch.fwd;   /* the vault carries her on */
      /* the arc: the jump is held (no cut), light at the apex, heavier coming down */
      const apex = Math.abs(vy) < MOVE.APEX_VY, gk = apex ? MOVE.APEX_G : vy < 0 ? 1 : MOVE.FALL_G;
      vy += MOVE.GRAV * DT * gk; if (vy > MOVE.MAX_FALL) vy = MOVE.MAX_FALL;
      if (launch.glide && vy > RIDE_MOVE.GLIDE_FALL) vy = RIDE_MOVE.GLIDE_FALL;
      const u0 = u, h0 = h; u += vx * DT; h -= vy * DT;
      if (h > capPx) { h = capPx; if (vy < 0) vy = 0; }
      rise = Math.max(rise, h);
      if (vy > 0) {   /* coming down through a floor line: the furthest forward the feet meet it */
        for (let r = Math.floor(h0 / TS); r * TS > h && r * TS <= h0; r--) {
          const at = u0 + (u - u0) * (h0 - r * TS) / Math.max(1e-9, h0 - h);
          if (r >= 0) up[r] = Math.max(up[r] ?? -1, at); else down[-r] = Math.max(down[-r] ?? -1, at);
        }
      }
      if (h < -MAX_DROP * TS) break;
    }
    return { up, down, rise };
  });
}

/* THE SLIDE ON A LEVEL'S SLOPES: for every reach footing cell a slide runs through, the speed it has as it leaves that cell going downhill
   (Map 'x,y' -> [{ dir, v }]). A chain of slope tiles is slid from rest at its crest with DOWN held (slideStep, frame by frame; the Glass Sea's
   glass adds its own build up to its ceiling, as src/glass-sea-hands.js does after slideStep), then on along the flat at its foot until the
   slide dies or the floor ends. The cell a slope tile gives is the tile's own cell (src/reach-slopes.js: you stand ON THE ROCK UNDER IT). */
export function slideSpeeds(L, T, glass = { acc: RIDE_MOVE.GLASS_SLIDE_ACC, cap: RIDE_MOVE.GLASS_SLIDE_CAP, keep: RIDE_MOVE.GLASS_SLIDE_CAP }) {   /* glass: the slick glass's numbers (a fixture can hand the old ones: tools/reach-heroes.mjs) */
  const W = L.W, H = L.H, g = L.grid, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x], out = new Map();
  const glassFrom = L.glassFrom !== undefined ? L.glassFrom : Infinity;   /* THE GLASS SEA: glass from this column on */
  const stand = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.CLIMB || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL || t === T.CRYST;
  const note = (x, y, dir, v) => { const k = x + ',' + y; let a = out.get(k); if (!a) out.set(k, a = []); const e = a.find(q => q.dir === dir); if (e) e.v = Math.max(e.v, v); else a.push({ dir, v }); };
  /* the next slope tile downhill of (x, y) going dir: the same row or one lower, rising the same way */
  const nextSlope = (x, y, dir, rs) => { for (const dy of [0, 1]) { const t = at(x + dir, y + dy); if (isSlope(t) && slopeRise(t) === rs) return [x + dir, y + dy, t]; } return null; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t0 = at(x, y); if (!isSlope(t0)) continue;
    const rs = slopeRise(t0), dir = -rs;
    /* a crest: no slope of the same rise uphill of it (the same row or one higher) */
    if ([0, -1].some(dy => { const t = at(x - dir, y + dy); return isSlope(t) && slopeRise(t) === rs; })) continue;
    const chain = [[x, y, t0]]; for (let c = chain[0]; (c = nextSlope(c[0], c[1], dir, rs)) && chain.length < 400;) chain.push(c);
    const s = { vx: 0, sliding: false, carry: false };
    let px = dir > 0 ? x * TS : (x + 1) * TS - 0.01, idx = 0;
    for (let f = 0; f < 4000 && idx < chain.length; f++) {
      const [cx, cy, kind] = chain[idx];
      slideStep(s, DT, { kind, ground: true, down: true, jumped: false, keep: px >= glassFrom * TS ? glass.keep : 1 });
      if (px >= glassFrom * TS && s.sliding) { const max = slopeGrade(kind) === 1 ? SLIDE.maxSteep : SLIDE.maxGentle, cap = max * glass.cap, sg = Math.sign(s.vx);
        if (sg) { s.vx += sg * glass.acc * DT; if (Math.abs(s.vx) > cap) s.vx = sg * cap; } }
      px += s.vx * DT;
      if (Math.floor(px / TS) !== cx) { note(cx, cy, dir, Math.abs(s.vx)); idx++; }
    }
    if (idx < chain.length) continue;
    /* and on along the foot: flat footing on the last tile's row while the slide lives */
    const [lx, ly] = chain[chain.length - 1];
    for (let fx = lx + dir, n = 0; n < 40; fx += dir, n++) {
      if (!stand(at(fx, ly + 1)) || stand(at(fx, ly)) || isSlope(at(fx, ly + 1))) break;
      for (let f = 0; f < 60 && Math.floor(px / TS) !== fx + dir; f++) { slideStep(s, DT, { kind: 0, ground: true, down: true, jumped: false }); px += s.vx * DT; if (!s.sliding) break; }
      if (!s.sliding) break;
      note(fx, ly, dir, Math.abs(s.vx));
    }
  }
  return out;
}

/* THE HERO'S JUMPS as floodReach asks for them */
const flyMemo = new WeakMap(), derived = new WeakMap();
const derive = (l, k, f) => { let m = derived.get(l); if (!m) derived.set(l, m = {}); return m[k] || (m[k] = f(l)); };
export function heroJumps(hero) {
  return memo('hj|' + hero, () => {
    const free = flight(hero, runUp(hero, RUNWAY_MAX * TS));
    return {
      hero, rise: Math.floor(free.rise / TS), risePx: free.rise,
      /* a run of `tiles` of floor behind the take-off cell (counting it) */
      run: (tiles, slick) => runUp(hero, Math.max(0, Math.min(RUNWAY_MAX, tiles) * TS - 8), slick),
      fly: (launch, capPx = Infinity) => { let m = flyMemo.get(launch); if (!m) flyMemo.set(launch, m = new Map()); let r = m.get(capPx); if (!r) m.set(capPx, r = flight(hero, launch, capPx)); return r; },
      walkOf: launch => derive(launch, 'walk', l => ({ ...l, walkOff: true })), glideOf: launch => derive(launch, 'glide', l => ({ ...l, glide: true })),
      slideOf: v => memo('sl|' + Math.round(v), () => ({ slide: Math.round(v) })),
      /* WHAT THROWS HIM, as a launch: a springy tile (jump held; a Fair awning's share of it), a bud pad (no press, from a standstill in the air), a
         striker's pad (its own launch), a foe's head (the plunge's pogo - and the warden's spear: a VAULT forward over a drop, a PERCH and a kick back
         off it with footing under it). He comes onto it at his plain air pace. */
      throwOf: (kind, o = {}) => memo('th|' + hero + '|' + kind + '|' + JSON.stringify(o), () => { const air = MOVE.RUN * heroRunMul(hero, false);
        if (kind === 'bounce') return { vx: air, vy0: SPRING_MOVE.BOUNCE_HELD * (o.awning ? SPRING_MOVE.AWNING : 1) };
        if (kind === 'bud') return { vx: 0, vy0: SPRING_MOVE.BUD };
        if (kind === 'striker') return { vx: air, vy0: -o.launch };
        if (hero === 'warden') return o.footUnder ? { vx: -WARDEN_SPEAR.PERCH_BACK, vy0: WARDEN_SPEAR.PERCH_KICK } : { vx: air, vy0: WARDEN_SPEAR.VAULT_HIGH, fwd: WARDEN_SPEAR.VAULT_FWD, fwdT: WARDEN_SPEAR.VAULT_CARRY };
        return { vx: air, vy0: POGO_CHAIN.plunge }; }),
    };
  });
}
