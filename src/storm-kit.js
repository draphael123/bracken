// src/storm-kit.js - THE STORM KIT: sandstorms as level DATA (claude/desertkit 11-05; scratch/plan-desert-1105.md 3d). Pure: no DOM, no main.js.
// Proved by tools/storm-kit.mjs; the level API is docs/desertkit.md.
//
// NOT A NEW STORM. The rule is src/desert-rules.js's (CALM -> WARN: the horizon browns, the hiss, the arrow -> GUST: a push along the ground and the view
// closing in, never under STORM.sightMin; braced = holding block on the ground, barely moved; a jump in a gust carries further). Today two levels each run
// ONE storm by hand (main.js CV.storm for the Dune Worm, sealed-pyramid-hands stepStorm) with one shared sub-pixel carry for the asked hero only. This kit
// lets any level declare storms and runs them for every body:
//   * L.storms = [{ id, box: [x0, y0, x1, y1] tiles, dirs: [1, -1, ...], cycle: { calm, warn, gust }, push, sight: { calm, gust }, phase, lee: [[box]...],
//                   weight: { hero, foe, heavy, shot } }]   - every field but id/box optional (desert-rules' numbers);
//   * the told cycle per storm (WARN never shorter than STORMKIT.warnMin; the default cycle IS desert-rules' stormStep frame for frame);
//   * per-BODY carry (each seat, each foe its own sub-pixel remainder - co-op safe), by weight: heroes 1, foes 0.6, heavy 0.25, the dead / anchored none;
//   * LEE boxes: behind a rock or a wall the gust does not reach (a told place to wait it out);
//   * SHOTS bend with the wind (vx += dir x push x weight.shot x dt);
//   * SIGHT per seat (the vignette: one circle per live seat, the shared camera draws their union);
//   * TELLS: the phase changes as events for the caller's line + sound ('THE STORM >>  BRACE (BLOCK)').
//
//   const K = stormInit(L)            -> { storms: [{ def, S, px, lee }] }
//   stormKitStep(K, dt)               -> events [{ id, ev: 'warn' | 'gust' | 'calm', dir }]; each storm's .now = { phase, dir, warnLeft, push, sight }
//   stormBodies(K, bodies, dt, io)    -> moves every body in a gust (io.move(b, dx) | b.x += dx); io.braced(b), io.kind(b) 'hero'|'foe'|'heavy'|'anchored'
//   stormShots(K, shots, dt)          -> bends the shots inside a gust
//   stormSight(K, x, y)               -> the view radius at (x, y) (Infinity outside every storm)
//   stormView(K, seats)               -> [{ x, y, r }] one sight circle per live seat inside a storm
//   lintStorms(L)                     -> [] or the problems
import { STORM } from './desert-rules.js';

export const TS = 16;
export const STORMKIT = {
  warnMin: 1.2,     /* a gust is always told at least this long (C3: a hazard tells where and when) */
  build: 0.3,       /* the gust builds and dies over this (desert-rules) */
  weight: { hero: 1, foe: 0.6, heavy: 0.25, anchored: 0, shot: 1.2 },
  braceMax: 16,     /* the lint: braced over a whole gust moves you under a tile */
};
const pxBox = b => [b[0] * TS, b[1] * TS, (b[2] + 1) * TS, (b[3] + 1) * TS];   /* [l, t, r, b] px */
const inPx = (z, x, y) => x >= z[0] && x < z[2] && y >= z[1] && y < z[3];

export function stormInit(L) {
  return { storms: (L.storms || []).map(def => {
    const c = { calm: STORM.calm, warn: STORM.warn, gust: STORM.gust, ...(def.cycle || {}) }, dirs = def.dirs || [1, 1, -1];
    const S = { phase: 'calm', t: c.calm - (def.phase || 0), dirs, i: 0, dir: dirs[0], c };
    return { def, S, px: pxBox(def.box), lee: (def.lee || []).map(pxBox), now: { phase: 'calm', dir: dirs[0], warnLeft: 0, push: 0, sight: (def.sight || {}).calm || STORM.sightCalm } };
  }) };
}
/* desert-rules' stormStep with this storm's own cycle, push and sight (the default numbers give the same frames) */
function stepOne(st, dt) {
  const S = st.S, c = S.c, d = st.def, push = d.push ?? STORM.push, sc = (d.sight || {}).calm ?? STORM.sightCalm, sg = (d.sight || {}).gust ?? STORM.sightGust;
  S.t -= dt;
  while (S.t <= 0) { if (S.phase === 'calm') { S.phase = 'warn'; S.t += c.warn; S.dir = S.dirs[S.i++ % S.dirs.length]; }
    else if (S.phase === 'warn') { S.phase = 'gust'; S.t += c.gust; } else { S.phase = 'calm'; S.t += c.calm; } }
  const into = S.phase === 'gust' ? Math.min(1, (c.gust - S.t) / STORMKIT.build, S.t / STORMKIT.build) : 0;
  const sight = S.phase === 'gust' ? sc - (sc - sg) * into : S.phase === 'warn' ? sc - 30 * (1 - S.t / c.warn) : sc;
  return { phase: S.phase, dir: S.dir, warnLeft: S.phase === 'warn' ? S.t : 0, push: S.phase === 'gust' ? push * into : 0, sight: Math.max(STORM.sightMin, sight) };
}
export function stormKitStep(K, dt) {
  const ev = [];
  for (const st of K.storms) { const was = st.now.phase; st.now = stepOne(st, dt); if (st.now.phase !== was) ev.push({ id: st.def.id, ev: st.now.phase, dir: st.now.dir }); }
  return ev;
}
const stormAt = (K, x, y) => K.storms.filter(st => inPx(st.px, x, y));
/* THE PUSH ON EVERY BODY: braced (holding block, on the ground) barely moves; in the air it carries further (desert-rules' gustDrift numbers);
   each body keeps its own remainder per storm (b.gustAcc), so four seats and their foes are each carried whole px exactly */
export function stormBodies(K, bodies, dt, io = {}) {
  const moved = [];
  for (const b of bodies) {
    if (!b || b.dead || b.alive === false) continue;
    const kind = io.kind ? io.kind(b) : (b.kind || 'hero'), wk = (STORMKIT.weight[kind] ?? 1);
    for (const st of stormAt(K, b.x, b.y - 4)) {
      const w = (st.def.weight || {})[kind] ?? wk; if (!(st.now.push > 0) || w <= 0) continue;
      if (st.lee.some(z => inPx(z, b.x, b.y - 4))) continue;
      const grounded = io.grounded ? io.grounded(b) : b.ground !== false, braced = !!(io.braced && io.braced(b)) && grounded;
      const v = st.now.dir * st.now.push * w * (braced ? STORM.brace : grounded ? 1 : STORM.airPush);
      const acc = b.gustAcc || (b.gustAcc = {}); acc[st.def.id] = (acc[st.def.id] || 0) + v * dt;
      const s = Math.trunc(acc[st.def.id]); if (s) { acc[st.def.id] -= s; if (io.move) io.move(b, s); else b.x += s; moved.push(b); }
    }
  }
  return moved;
}
export function stormShots(K, shots, dt) {
  for (const s of shots) { if (!s || s.dead) continue;
    for (const st of stormAt(K, s.x, s.y)) { if (!(st.now.push > 0) || st.lee.some(z => inPx(z, s.x, s.y))) continue; s.vx += st.now.dir * st.now.push * ((st.def.weight || {}).shot ?? STORMKIT.weight.shot) * dt; } }
}
export const stormSight = (K, x, y) => stormAt(K, x, y).reduce((m, st) => Math.min(m, st.now.sight), Infinity);
export const stormView = (K, seats) => seats.filter(p => p && !p.dead).map(p => ({ x: p.x, y: p.y - 7, r: stormSight(K, p.x, p.y - 4) })).filter(c => c.r < Infinity);
/* THE LEVEL CHECK: the tell is long enough, the view never closes under the floor, a braced hero moves under a tile over a whole gust, and the boxes sit on the map */
export function lintStorms(L) {
  const bad = [], W = L.w || L.W || 1e9, H = L.h || L.H || 1e9, ids = new Set();
  for (const d of L.storms || []) {
    const c = { calm: STORM.calm, warn: STORM.warn, gust: STORM.gust, ...(d.cycle || {}) }, id = d.id || '?';
    if (!d.id || ids.has(d.id)) bad.push('storm needs a unique id: ' + id); ids.add(d.id);
    if (!Array.isArray(d.box) || d.box.length !== 4 || d.box[0] > d.box[2] || d.box[1] > d.box[3] || d.box[0] < 0 || d.box[1] < 0 || d.box[2] >= W || d.box[3] >= H) bad.push(id + ': box off the map or malformed');
    if (c.warn < STORMKIT.warnMin) bad.push(id + ': warn ' + c.warn + ' s < ' + STORMKIT.warnMin + ' (a gust must be told)');
    if (c.calm < c.gust * 0.5) bad.push(id + ': calm ' + c.calm + ' s too short to move between gusts');
    if (((d.sight || {}).gust ?? STORM.sightGust) < STORM.sightMin) bad.push(id + ': gust sight under ' + STORM.sightMin + ' px');
    if (!(d.dirs || [1]).every(x => x === 1 || x === -1)) bad.push(id + ': dirs must be 1 / -1');
    const push = d.push ?? STORM.push, braced = push * STORM.brace * (c.gust - STORMKIT.build);
    if (braced >= STORMKIT.braceMax) bad.push(id + ': braced drift ' + braced.toFixed(0) + ' px a gust (>= a tile): bracing must hold');
    for (const z of d.lee || []) if (z[0] < d.box[0] || z[2] > d.box[2] || z[1] < d.box[1] || z[3] > d.box[3]) bad.push(id + ': a lee outside its storm');
  }
  return bad;
}
