// src/pull-field.js — THE PULL FIELD (claude/waterkit, 11-05; scratch/plan-water-1105.md section 3b). ONE ENGINE FOR EVERY TOLD FORCE IN THE SEA.
// A current that runs one way, an undertow that drags toward a point, a whirlpool that spirals you in, a gust that throws you off: each is a FIELD
// a level declares in a few lines. It pushes heroes, foes and projectiles (each by its own weight), it is DRAWN (flow lines the way it runs, faint
// and slow in its tell, strong when it bites), it has a strength curve, and it ALWAYS has an answer: swim against it (a drift or a strong field you
// can beat), GRAB A POST (a held post anchors you), DASH OUT (a dash/roll slips most of it), BRACE (block halves it) - or wait for its release window.
// Users (plan): siren song, the Deep's currents, the Whale's exhale gust, the Kraken raft whirlpool, the Tide Herald's RIPTIDE; src/whirlpools.js folds in after Keep 2.
// Co-op safe: every body keeps its own carry (a WeakMap, never a field-wide accumulator - src/whirlpools.js's shared w.acc moves P2 by P1's remainder),
// dead bodies are left alone, and a held post only anchors the seat holding it. Pure: no DOM, no main.js. Level API: docs/waterkit.md. Proof: tools/pull-field.mjs.
//
//   L.pulls = [{ id: 'rip1', kind: 'current' | 'toward' | 'away' | 'whirl',
//                box: [x0, y0, x1, y1]  or  ring: [x, y, r],          its reach, in TILES (a ring's eye is the centre of tile x,y)
//                dir: [1, 0],                                         a current's flow (unit-ish); toward/away/whirl aim at the eye (or `at: [x, y]`)
//                strength: 60,                                        px/s at full (compare SWIM 96: <= 48 'drift', <= 82 'strong' (beatable), more = 'rip')
//                curve: 'flat' | 'linear' | 'ease' | 'edge' | 'core', how strength grows with depth into the reach (0 at the edge, 1 at the core)
//                swirl: 0.6,                                          whirl only: the share that goes round the eye, not into it
//                cycle: { on: 4, tell: 1.5, off: 3 },                 optional told pulses: TELL (it gathers, drawn faint) -> ON -> OFF (the release window)
//                water: true,                                         only bodies IN water feel it (false = a gust in the air too)
//                weight: { hero: 1, foe: 0.6, shot: 1 },              who it moves, and how much; a foe kind can opt out with e.anchored / e.heavy
//                posts: [[x, y], ...],                                grab posts (tiles) - a body holding one inside postReach is anchored
//                tide: 'saltreach', phases: { rise: 1, fall: -1 },    optional: driven by a TIDE KIT tide (dir x phase sign; 0 = still)
//                lethal: false }]                                     a field whose core kills must say so (lint: no rip without an answer)
//
//   const F = pullInit(L, { off })              build state (off = main.js marks: 'pull:<id>' stilled for good, e.g. a whirlpool's lever)
//   pullStep(F, dt, { tideK, tidePh }) -> ev    advance each field's cycle; events [{ t: 'tell'|'on'|'off', id }] for the SFX
//   pullBodies(F, bodies, dt, io) -> ev         push every body: io.move(b, dx, dy) collision-aware, io.inWater(b), io.holding(b), io.kind(b) 'hero'|'foe'
//                                               events [{ t: 'enter'|'leave'|'grab', id, b }]
//   pullShots(F, shots, dt)                     bend projectiles in reach (s.x, s.y, s.vx, s.vy; s.heavy halves it, s.noPull skips)
//   flowAt(F, x, y) -> { vx, vy, k, field }     the force at a point now (for drawing, AI and tests)
//   flowParts(F, dt, view, rand) -> [parts]     the placeholder flow lines (main.js parts format); view = { x0, y0, x1, y1 } px
//   classOf(field) -> 'drift'|'strong'|'rip'    against SWIM speed
//   pullStill(F, id)                            stop one for good (a lever, a broken singing stone); returns its mark key
//   lintPulls(L, o) -> [problems]               every rip has an answer (a post in reach, a release window, or an exit within one dash), tells readable
export const TS = 16;
export const PULL = {
  swim: 96,            /* the hero's swim speed (main.js: P.swim ? 96) - every hero swims at it today */
  drift: 0.5, strong: 0.85,   /* a field at <= half of swim is a drift; up to 0.85 you still make headway; past it, it is a RIP */
  dash: 0.15,          /* a dash or roll slips 85% of it */
  dashTail: 0.25, dashTailK: 0.5,   /* and for a quarter second after, half */
  brace: 0.5,          /* block / aegis halves it (as the Causeway currents and the Keep whirlpools always did) */
  postReach: 14,       /* px from a post's centre a body can hold it */
  dashReach: 70,       /* px a dash carries a swimmer out of a rip (lint) */
  minTell: 1,          /* a pulsed field's tell is never shorter */
  ease: 6,             /* how fast a field's strength eases between off and on (1/s) */
};
const curves = {
  flat: () => 1, linear: u => u, ease: u => u * u * (3 - 2 * u),
  edge: u => 0.35 + 0.65 * u,           /* the Keep whirlpool's: it has you at the rim, harder at the eye */
  core: u => u < 0.6 ? 0.25 : 0.25 + 0.75 * (u - 0.6) / 0.4,   /* a calm skirt and a hard core (a riptide channel) */
};
export const curveOf = name => curves[name] || curves.flat;

const eye = f => f.at ? { x: f.at[0] * TS + 8, y: f.at[1] * TS + 8 } : f.ring ? { x: f.ring[0] * TS + 8, y: f.ring[1] * TS + 8 }
  : { x: (f.box[0] + f.box[2] + 1) * TS / 2, y: (f.box[1] + f.box[3] + 1) * TS / 2 };
export const pullKey = f => 'pull:' + f.id;

export function pullInit(L, { off } = {}) {
  const F = { fields: [], carry: new WeakMap(), inside: new WeakMap() };
  for (const f of L.pulls || []) {
    const still = !!(off && off.has(pullKey(f)));
    const c = f.cycle, ph = c ? (f.firstPh || 'off') : 'on', t = c ? (f.firstT ?? c[ph]) : Infinity;
    F.fields.push({ f, id: f.id, still, ph, t, s: still ? 0 : (ph === 'on' ? 1 : 0), dirK: 1, spin: 0 });
  }
  return F;
}

/* depth into the reach: 0 at the edge, 1 at the core (a ring: by distance from its eye; a box: by distance in from its nearest edge); -1 = outside */
function depth(f, x, y) {
  if (f.ring) { const e = eye(f), R = f.ring[2] * TS, d = Math.hypot(x - e.x, y - e.y); return d >= R ? -1 : 1 - d / R; }
  const [x0, y0, x1, y1] = f.box, l = x0 * TS, r = (x1 + 1) * TS, t = y0 * TS, b = (y1 + 1) * TS;
  if (x < l || x >= r || y < t || y >= b) return -1;
  const m = Math.min(x - l, r - x, y - t, b - y), half = Math.min(r - l, b - t) / 2; return Math.min(1, m / Math.max(8, half * 0.5));   /* a box: full a quarter-span in from its edges */
}
export function classOf(f) { const s = f.strength || 0; return s <= PULL.swim * PULL.drift ? 'drift' : s <= PULL.swim * PULL.strong ? 'strong' : 'rip'; }

export function pullStep(F, dt, tide = {}) {
  const ev = [];
  for (const S of F.fields) {
    const f = S.f, c = f.cycle;
    S.spin += dt * (0.4 + 2.4 * S.s);
    if (c && !S.still) { S.t -= dt; while (S.t <= 0) { S.ph = { off: 'tell', tell: 'on', on: 'off' }[S.ph]; S.t += Math.max(S.ph === 'tell' ? PULL.minTell : 0.05, c[S.ph] || 0); ev.push({ t: S.ph, id: S.id }); } }
    let want = S.still ? 0 : S.ph === 'on' ? 1 : S.ph === 'tell' ? 0.15 : 0;   /* in its tell it stirs: drawn, felt as a nudge, never a grab */
    if (f.tide) { const sign = (f.phases || { rise: 1, fall: -1 })[tide.tidePh] ?? 0; S.dirK = sign || S.dirK; if (!sign) want = 0; }
    S.s += (want - S.s) * Math.min(1, dt * PULL.ease);
    if (S.still && S.s < 0.01) S.s = 0;
  }
  return ev;
}

/* THE FORCE AT A POINT: summed over every field that reaches it */
export function flowAt(F, x, y, who = 'hero') {
  let vx = 0, vy = 0, k = 0, field = null;
  for (const S of F.fields) {
    if (S.s <= 0) continue; const f = S.f, u = depth(f, x, y); if (u < 0) continue;
    const wk = who === 'heavy' ? 'foe' : who, w = ((f.weight || {})[wk] ?? (wk === 'foe' ? 0.6 : 1)) * (who === 'heavy' ? 0.5 : 1); if (!w) continue;
    const mag = (f.strength || 0) * curveOf(f.curve)(u) * S.s * w;
    let dx, dy;
    if (f.kind === 'current') { const d = f.dir || [1, 0], n = Math.hypot(d[0], d[1]) || 1; dx = d[0] / n * S.dirK; dy = d[1] / n * S.dirK; }
    else { const e = eye(f), ex = e.x - x, ey = e.y - y, n = Math.hypot(ex, ey);
      if (n < 4) { dx = 0; dy = 0; }   /* at the eye: still (a body is not flung about the centre) */
      else { const ix = ex / n, iy = ey / n, sw = f.kind === 'whirl' ? (f.swirl ?? 0.6) : 0, inn = Math.sqrt(1 - sw * sw);
        if (f.kind === 'away') { dx = -ix; dy = -iy; } else { dx = ix * inn - iy * sw; dy = iy * inn + ix * sw; } } }
    vx += dx * mag; vy += dy * mag; if (mag > k) { k = mag; field = S; }
  }
  return { vx, vy, k, field };
}

export function postNear(F, x, y) {
  for (const S of F.fields) for (const p of S.f.posts || []) { const px = p[0] * TS + 8, py = p[1] * TS + 8; if (Math.hypot(x - px, y - py) <= PULL.postReach) return { S, p, x: px, y: py }; }
  return null;
}

/* PUSH EVERY BODY. A body is anything with x, y (feet) - every seat, every foe. Its centre is 8 px up. */
export function pullBodies(F, bodies, dt, io = {}) {
  const ev = [], kind = io.kind || (b => b.foe ? 'foe' : 'hero');
  for (const b of bodies || []) {
    if (!b || b.dead || b.anchored || b.noPull) continue;
    const cx = b.x, cy = b.y - 8, wet = io.inWater ? io.inWater(b) : !!b.swim;
    const who = kind(b); let { vx, vy, field } = flowAt(F, cx, cy, who === 'foe' && b.heavy ? 'heavy' : who);
    if (field && field.f.water !== false && !wet) { vx = 0; vy = 0; field = null; }
    const was = F.inside.get(b) || null, now = field ? field.id : null;
    if (now !== was) { if (was) ev.push({ t: 'leave', id: was, b }); if (now) ev.push({ t: 'enter', id: now, b }); F.inside.set(b, now); }
    if (!field) { F.carry.delete(b); continue; }
    /* THE ANSWERS */
    let m = 1;
    const post = (io.holding ? io.holding(b) : b.hold) ? postNear(F, cx, cy) : null;
    if (post) { if (!b.pullGrab) ev.push({ t: 'grab', id: post.S.id, b }); b.pullGrab = true; F.carry.delete(b); continue; }
    b.pullGrab = false;
    const dashing = io.dashing ? io.dashing(b) : (b.dashT > 0 || b.rolling || b.dash);
    if (dashing) { m *= PULL.dash; b.pullSlip = PULL.dashTail; } else if (b.pullSlip > 0) { b.pullSlip = Math.max(0, b.pullSlip - dt); m *= PULL.dashTailK; }
    if (b.block || b.aegis) m *= PULL.brace;
    const acc = F.carry.get(b) || [0, 0]; acc[0] += vx * m * dt; acc[1] += vy * m * dt;
    const sx = Math.trunc(acc[0]), sy = Math.trunc(acc[1]); acc[0] -= sx; acc[1] -= sy; F.carry.set(b, acc);
    if (sx || sy) { if (io.move) io.move(b, sx, sy); else { b.x += sx; b.y += sy; } }
    b.pulled = Math.hypot(vx, vy) * m;
  }
  return ev;
}

/* BEND THE SHOTS: an arrow, a bolt, a spit, a cannonball (heavy) - a velocity change, not a shove, so it curves */
export function pullShots(F, shots, dt) {
  for (const s of shots || []) { if (!s || s.noPull || s.dead) continue;
    const { vx, vy, field } = flowAt(F, s.x, s.y, 'shot'); if (!field) continue;
    const k = (s.heavy ? 0.5 : 1) * 2.2;   /* a shot is light: it takes the flow's speed in about half a second */
    s.vx += vx * k * dt; s.vy += vy * k * dt; s.pulled = true; }
}

/* THE PLACEHOLDER FLOW LINES: specks that run along the flow, faint and slow in the tell, quick and bright when it bites (art owed: streak sprites per skin) */
export function flowParts(F, dt, view, rand = Math.random) {
  const out = [];
  for (const S of F.fields) {
    const f = S.f; if (S.s <= 0.02 && S.ph !== 'tell') continue;
    const bx = f.ring ? [f.ring[0] - f.ring[2], f.ring[1] - f.ring[2], f.ring[0] + f.ring[2], f.ring[1] + f.ring[2]] : f.box;
    const l = bx[0] * TS, t = bx[1] * TS, r = (bx[2] + 1) * TS, b = (bx[3] + 1) * TS;
    if (view && (r < view.x0 || l > view.x1 || b < view.y0 || t > view.y1)) continue;
    const area = (r - l) * (b - t) / (64 * 64), tell = S.ph === 'tell', n = area * dt * (tell ? 5 : 4 + 14 * S.s);
    const cnt = Math.floor(n) + (rand() < n % 1 ? 1 : 0);
    for (let i = 0; i < cnt; i++) {
      const x = l + rand() * (r - l), y = t + rand() * (b - t), q = flowAt(F, x, y, 'shot'); if (!q.field) continue;
      const sp = Math.hypot(q.vx, q.vy) || 1, gain = tell ? 0.6 : 1.4;
      out.push({ x, y, vx: q.vx * gain, vy: q.vy * gain, life: 0.5 + 0.4 * rand(), max: 0.9, col: tell ? (f.tellCol || '#9fb8c0') : (f.col || (sp > 70 ? '#e8f4f0' : '#bfe6f5')), size: 1, grav: 0 });
    }
  }
  return out;
}

export function pullStill(F, id) { const S = F.fields.find(q => q.id === id); if (!S) return null; S.still = true; return pullKey(S.f); }

/* THE STATIC CHECKS: every RIP has an answer, tells are readable, posts sit inside their field, ids are unique */
export function lintPulls(L, o = {}) {
  const bad = [], ids = new Set();
  for (const f of L.pulls || []) {
    const id = f.id || '?'; if (ids.has(id)) bad.push(id + ': id used twice'); ids.add(id);
    if (!['current', 'toward', 'away', 'whirl'].includes(f.kind)) bad.push(id + ': kind ' + f.kind + ' is not current/toward/away/whirl');
    if (!f.box && !f.ring) bad.push(id + ': no reach (box or ring)');
    if (f.curve && !curves[f.curve]) bad.push(id + ': curve ' + f.curve + ' is not one of ' + Object.keys(curves).join('/'));
    if (f.cycle && (f.cycle.tell || 0) < PULL.minTell) bad.push(id + ': its tell (' + (f.cycle.tell || 0) + ' s) is shorter than ' + PULL.minTell + ' s');
    if (f.cycle && f.cycle.off !== undefined && f.cycle.off < 1) bad.push(id + ': its release window (' + f.cycle.off + ' s) is under 1 s');
    for (const p of f.posts || []) if (depth({ ...f, kind: 'toward' }, p[0] * TS + 8, p[1] * TS + 8) < 0 && !(f.box && p[0] >= f.box[0] - 1 && p[0] <= f.box[2] + 1 && p[1] >= f.box[1] - 1 && p[1] <= f.box[3] + 1)) bad.push(id + ': post ' + p + ' is outside its field');
    if (classOf(f) === 'rip') {
      const window = f.cycle && (f.cycle.off || 0) >= 1, posts = (f.posts || []).length > 0, spanPx = f.ring ? f.ring[2] * TS : Math.min(f.box[2] - f.box[0] + 1, f.box[3] - f.box[1] + 1) * TS;
      const dashOut = spanPx <= PULL.dashReach * 2 || f.dashOut === true;
      if (!window && !posts && !dashOut) bad.push(id + ': a RIP (' + f.strength + ' px/s > ' + Math.round(PULL.swim * PULL.strong) + ') with no answer - give it a post, a release window (cycle.off >= 1) or keep it within two dashes across');
      if ((f.strength || 0) * PULL.dash > PULL.swim * PULL.strong) bad.push(id + ': even a dash cannot slip it (' + f.strength + ' px/s)');
    }
    if (f.lethal && !(f.cycle || (f.posts || []).length)) bad.push(id + ': a lethal core needs a post or a release window');
  }
  return bad;
}
