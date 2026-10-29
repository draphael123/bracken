// src/tower-fall2.js - THE FALLING TOWER 2 (claude/fallingtower2; Daniel 2026-10-08, scratch/brief-fallingtower2.md - he picked all four):
// "Love the concept, but you're just going upward without much going on - repetitive; it needs to feel like a COLLAPSING tower."
//
//   1 THE COLLAPSE CHASES YOU   the floors still fall away under you as you climb (src/tower-ascent.js), faster now; CRACKS RUN UP THE WALLS from
//                               the collapse toward you; and on every floor DEBRIS comes down from the ceiling ON A TOLD SHADOW (a dark spot
//                               on the ledge ahead of you and a trickle of grit from over it, FT2.debris.tell s) - step off the shadow.
//   2 EVERY FLOOR ITS OWN ROOM  THE LIBRARY: its BOOKS BURN (a smouldering pile glows and hisses, then flares up its ledge: flares) and its
//                               shelves come down (the library's debris is shelving). THE OBSERVATORY (the orrery cage): its DOME TURNS
//                               overhead, its slit and moonbeam sweeping, and its great TELESCOPE is a ride - it swings its eyepiece from the
//                               failing stair up to the next landing (scope). THE ALCHEMY LAB (the burst cistern): SPILLED POTIONS - green
//                               SYRUP slows your legs, pink FIZZ throws you up (a BOUNCER tile). THE TREASURY (the bell loft's upper vault):
//                               A FLOOR THAT TILTS - told by its creak and the arrows on it, it leans one way, then the other; you slide, the
//                               gold slides, and the treasure CHESTS slide down it at you (tilt).
//   3 THE TOWER LEANS           every floor that falls leans what is left a little further (lean, drawn as the rain, the cracks and the dome
//                               going over); the floors it buckled are sloped (src/slopes.js tiles, laid by tower-ascent); loose things slide.
//   4 OUTSIDE, AND THE SNAP     where the crown's stair is gone you go out through a BREACH onto the tower's OUTER FACE: scaffolding in THE
//                               STORM between the tower and his stair tower - WIND told by streaks and flags before it shoves you, LIGHTNING
//                               told by a pale column on the plank it will strike, and THE DROP under you (a fall costs a hazard's quarter
//                               and puts you back). At the top THE TOWER BREAKS IN TWO: step onto the loose chunk of the crown and it snaps
//                               off and carries you across to the parapet where his ring stands.
// Pure: no DOM, no main.js globals. main.js calls ftUpdate (updateAscent), ftMover (updateMovers) and ftDraw (drawMageTiles); the level's
// data is laid by tower-ascent.js (L.ft2). tools/fallingtower2.mjs is its check.
export const FT2 = {
  debris: { first: 2.2, every: 4.4, tell: 1.1, fallV: 380, dmg: 12, hitW: 13, ahead: [28, 92], drop: 200 },
  flare: { period: 4.4, smoulder: 1.1, burn: 1.0, dmg: 10, h: 26 },
  syrup: { cap: 40 },
  tilt: { level: 1.2, tell: 0.9, lean: 2.8, sp: 46, chestSp: 64, chestDmg: 12, chestW: 14 },
  gust: { first: 2.0, calm: 3.4, tell: 1.3, blow: 1.6, push: 52, footing: 0.35 },   /* (the face is eight tiles wide: a gust shoves, it does not throw you off it unbraced in one) */
  bolt: { first: 3.0, every: 4.6, tell: 1.3, half: 12, dmg: 18 },
  scope: { period: 7.0, w: 40, hold: 0.2 },
  ladder: { period: 8.0 },   /* (claude/fallingtower3) THE LIBRARY's rolling ladder: one trip along its rail and back, holding at each end as the telescope does */
  snap: { tell: 1.4, secs: 2.8 },
  lean: { perFloor: 0.5, max: 3 },
};
const TS = 16;
/* the runtime half of L.ft2: everything that moves and resets with a retry */
export function ftReset(L) { const F = L && L.ft2; if (!F) return; F.leanShown = 0;
  F.rt = { debT: FT2.debris.first, debris: [], gust: { st: 'calm', t: FT2.gust.first, dir: 1 }, bolt: { st: 'wait', t: FT2.bolt.first, x: 0, y: 0 }, tilt: { st: 'level', t: FT2.tilt.level, dir: 0, next: -1, k: 0 },
    chests: (F.tilt ? F.tilt.chests : []).map(x => ({ x: x * TS + 8, vx: 0, hitCd: 0 })), snap: { st: 'wait', t: 0, k: 0 }, said: {} };
}
/* where a hero stands: which of the level's FT2 places he is in */
export const inOuter = (F, P) => !!(F && F.outer && P.x > F.outer.x0 * TS && P.x < (F.outer.x1 + 1) * TS && P.y > F.outer.y0 * TS && P.y < (F.outer.drop + 6) * TS);
const floorAt = (F, y) => (F.floors || []).find(f => y >= f.top * TS && y <= f.bot * TS);   /* (feet on the floor tile: y is its top) */
/* THE DEBRIS SPOT: on the footing ahead of him on the floor he is on - the first standable tile under (x, from his feet down 5 rows) - and the
   ceiling over it (the first solid tile above, no higher than the floor's top) */
function spot(F, grid, W, x, py, standable, solid, f) { const tx = Math.floor(x / TS); if (tx <= F.x0 || tx >= F.x1) return null;
  let ty = Math.floor((py - 2) / TS); for (let k = 0; k < 6 && ty <= f.bot; k++, ty++) { const t = grid[ty * W + tx], up = grid[(ty - 1) * W + tx]; if (standable(t) && !solid(up)) break; }
  if (ty > f.bot || !standable(grid[ty * W + tx])) return null;
  let cy = ty - 2; while (cy > f.top && !solid(grid[cy * W + tx])) cy--;
  return { x: tx * TS + 8, y: ty * TS, top: Math.max(f.top * TS, (cy + 1) * TS) };
}
/* EVERY FRAME. c: { grid, W, T, standable(t), solid(t), hurt(x, dmg, blow), fall(), say(x, y, s, col), callout(s), sound(k), shake(n), push(dx), dust(x, y, n), busy } */
export function ftUpdate(L, P, dt, c) {
  const F = L && L.ft2; if (!F) return; if (!F.rt) ftReset(L); const R = F.rt; if (P.dead) return;
  /* THE LEAN: half a degree a fallen floor */
  F.lean = Math.min(FT2.lean.max, (L.towerFloors || []).filter(f => f.done).length * FT2.lean.perFloor); F.leanShown = (F.leanShown || 0) + (F.lean - (F.leanShown || 0)) * Math.min(1, dt * 0.8);   /* (it goes over slowly, a groan at a time) */
  const f = floorAt(F, P.y), outside = inOuter(F, P);
  // ---- 1. DEBRIS ON TOLD SHADOWS ----
  R.debT -= dt;
  if (R.debT <= 0) { R.debT = FT2.debris.every;
    if (f && f.debris && !c.busy && !P.climb) { const D = FT2.debris, dir = Math.sign(P.vx) || P.face || 1, a = D.ahead[0] + Math.random() * (D.ahead[1] - D.ahead[0]);
      const s = spot(F, c.grid, c.W, P.x + dir * a, P.y, c.standable, c.solid, f) || spot(F, c.grid, c.W, P.x + dir * D.ahead[0], P.y, c.standable, c.solid, f);
      if (s) { R.debris.push({ ...s, st: 'tell', t: D.tell, ry: s.top, kind: f.theme || 'stone' }); c.sound('crack'); } } }
  for (const d of R.debris) {
    if (d.st === 'tell') { d.t -= dt; if (d.t <= 0) { d.st = 'fall'; d.ry = Math.max(d.top, d.y - FT2.debris.drop); } }
    else if (d.st === 'fall') { d.ry += FT2.debris.fallV * dt;
      if (d.ry >= d.y) { d.st = 'land'; d.t = 0.5; c.sound('stone'); c.dust(d.x, d.y, 8);
        if (!P.dead && Math.abs(P.x - d.x) < FT2.debris.hitW && P.y > d.y - 30 && P.y <= d.y + 4) c.hurt(d.x, FT2.debris.dmg, 'debris'); } }
    else if (d.st === 'land') d.t -= dt; }
  R.debris = R.debris.filter(d => d.st !== 'land' || d.t > 0);
  // ---- 2a. THE LIBRARY'S BURNING BOOKS ----
  for (const q of F.flares || []) { const Q = FT2.flare, ph = ((c.time + q.phase) % Q.period + Q.period) % Q.period, was = q.st;
    q.st = ph < Q.smoulder ? 'smoulder' : ph < Q.smoulder + Q.burn ? 'burn' : 'idle';
    if (q.st === 'smoulder' && was !== 'smoulder') { q.hit = false; if (Math.abs(P.y - q.row * TS) < 160) c.sound('hiss'); }
    if (q.st === 'burn' && !q.hit && !P.dead && P.x > q.x0 * TS - 4 && P.x < (q.x1 + 1) * TS + 4 && P.y > q.row * TS - FT2.flare.h && P.y <= q.row * TS + 2) { q.hit = true; c.hurt(P.x, Q.dmg, 'flare'); } }
  // ---- 2b. THE ALCHEMY LAB'S SPILLS: syrup slows (main.js reads P.syrupT); the fizz is a BOUNCER tile and the engine throws you ----
  P.syrupT = Math.max(0, (P.syrupT || 0) - dt);
  if (P.ground) for (const z of F.syrup || []) if (P.x > z.x0 * TS && P.x < (z.x1 + 1) * TS && Math.abs(P.y - z.row * TS) < 3) { P.syrupT = 0.12; if (!R.said.syrup) { R.said.syrup = 1; c.say(P.x, P.y - 30, 'SYRUP: IT HOLDS YOUR FEET', '#8fd160'); } }
  // ---- 2c. THE TREASURY'S TILTING FLOOR (an engine scree zone whose way and pace it sets) and the chests that slide on it ----
  if (F.tilt) { const Z = F.tilt, Tq = R.tilt, K = FT2.tilt; Tq.t -= dt;
    if (Tq.t <= 0) { if (Tq.st === 'level') { Tq.st = 'tell'; Tq.t = K.tell; Tq.dir = Tq.next; c.sound('creak'); if (Math.abs(P.y - Z.row * TS) < 200) c.say(Z.x0 * TS + (Z.x1 - Z.x0) * 8, Z.row * TS - 48, Tq.dir < 0 ? '<< THE FLOOR TILTS' : 'THE FLOOR TILTS >>', '#ffd36b'); }
      else if (Tq.st === 'tell') { Tq.st = 'lean'; Tq.t = K.lean; c.sound('rumble'); }
      else { Tq.st = 'level'; Tq.t = K.level; Tq.next = -Tq.dir; Tq.dir = 0; } }
    Tq.k += ((Tq.st === 'lean' ? 1 : 0) - Tq.k) * Math.min(1, dt * 5);
    { const z = (L.scree || []).find(q => q.ft2); if (z) { z.dir = Tq.st === 'lean' ? Tq.dir : 0; z.sp = K.sp; } }
    for (const ch of R.chests) { ch.hitCd = Math.max(0, ch.hitCd - dt); const want = Tq.st === 'lean' ? Tq.dir * K.chestSp : 0; ch.vx += (want - ch.vx) * Math.min(1, dt * 3); ch.x += ch.vx * dt;
      const lo = Z.x0 * TS + 10, hi = (Z.x1 + 1) * TS - 10; if (ch.x < lo) { ch.x = lo; ch.vx = 0; } if (ch.x > hi) { ch.x = hi; ch.vx = 0; }
      if (!P.dead && ch.hitCd <= 0 && Math.abs(ch.vx) > 20 && Math.abs(P.x - ch.x) < K.chestW && Math.abs(P.y - Z.row * TS) < 14) { ch.hitCd = 1.0; c.hurt(ch.x, K.chestDmg, 'chest'); } } }
  // ---- 4a. THE OUTER FACE IN THE STORM: wind, lightning, the drop ----
  if (F.outer) { const O = F.outer, G = R.gust, B = R.bolt, K = FT2.gust, Kb = FT2.bolt; G.t -= dt; B.t -= dt;
    if (G.t <= 0) { if (G.st === 'calm') { G.st = 'tell'; G.t = K.tell; G.dir = Math.random() < 0.5 ? -1 : 1; if (outside) { c.sound('whoosh'); c.callout(G.dir < 0 ? 'WIND FROM THE EAST: BRACE' : 'WIND FROM THE WEST: BRACE'); } }
      else if (G.st === 'tell') { G.st = 'blow'; G.t = K.blow; } else { G.st = 'calm'; G.t = K.calm; } }
    if (G.st === 'blow' && outside) c.push(G.dir * K.push * (P.ground ? K.footing : 1) * (P.block ? 0.4 : 1) * dt);   /* (feet on a plank brace against it: the jump is when it takes you) */
    if (B.t <= 0) { if (B.st === 'wait') { const ledge = outside ? (O.ledges || []).filter(([x0, len, row]) => row * TS >= P.y - 3 * TS - 4 && row * TS <= P.y + 4).sort((a, b) => Math.abs((a[0] + a[1] / 2) * TS - P.x) - Math.abs((b[0] + b[1] / 2) * TS - P.x))[0] : null;
        if (ledge) { B.st = 'tell'; B.t = Kb.tell; B.x = Math.max(ledge[0] * TS + 8, Math.min((ledge[0] + ledge[1]) * TS - 8, P.x)); B.y = ledge[2] * TS; c.sound('rumble'); } else B.t = 0.5; }
      else if (B.st === 'tell') { B.st = 'flash'; B.t = 0.25; c.sound('heavy'); c.shake(3); if (!P.dead && Math.abs(P.x - B.x) < Kb.half + 5 && P.y > B.y - 40 && P.y <= B.y + 4) c.hurt(B.x, Kb.dmg, 'lightning'); }
      else { B.st = 'wait'; B.t = Kb.every - Kb.tell; } }
    if (!P.dead && P.x > O.x0 * TS && P.x < (O.x1 + 1) * TS && P.y > O.drop * TS) c.fall(); }
  // ---- 4b. THE SNAP ----
  const S = R.snap, ch = P.onMover && P.onMover.role === 'chunk' ? P.onMover : S.m;
  if (ch) { S.m = ch; if (S.st === 'wait' && P.onMover === ch) { S.st = 'tell'; S.t = FT2.snap.tell; c.sound('crack'); c.sound('rumble'); c.shake(6); c.callout('THE TOWER BREAKS IN TWO: HOLD ON'); }
    else if (S.st === 'tell') { S.t -= dt; if (Math.random() < dt * 20) c.dust(ch.x + Math.random() * ch.w, ch.y + 6, 1); if (S.t <= 0) { S.st = 'ride'; S.t = 0; c.sound('heavy'); c.shake(8); } }
    else if (S.st === 'ride') { S.t += dt; S.k = Math.min(1, S.t / FT2.snap.secs); if (S.k >= 1) { S.st = 'done'; c.sound('stone'); c.shake(5); c.dust(ch.x + ch.w / 2, ch.y, 12); } } }
}
/* THE TELESCOPE'S SWING at a time: it HOLDS at each stop (FT2.scope.hold of its period) - level with the step, long enough to walk on or off - and swings between */
export function scopeK(time, phase = 0) { const H = FT2.scope.hold, u = ((time / FT2.scope.period + phase) % 1 + 1) % 1, ease = x => x * x * (3 - 2 * x);
  return u < H ? 0 : u < 0.5 ? ease((u - H) / (0.5 - H)) : u < 0.5 + H ? 1 : 1 - ease((u - 0.5 - H) / (0.5 - H)); }
/* A RIDE OF THIS LEVEL'S (main.js updateMovers): the telescope's eyepiece on its arc, and the crown's chunk. Sets x, y, dx, dy. */
/* THE ROLLING LADDER's place along its rail at time t (0 = its east end, 1 = its west), holding at each end (claude/fallingtower3) */
export function ladderK(time, phase = 0) { const u = ((time / FT2.ladder.period + phase) % 1 + 1) % 1, H = 0.22, ease = x => x * x * (3 - 2 * x);
  return u < H ? 0 : u < 0.5 ? ease((u - H) / (0.5 - H)) : u < 0.5 + H ? 1 : 1 - ease((u - 0.5 - H) / (0.5 - H)); }
export function ftMover(L, m, dt, time) {
  const ox = m.x, oy = m.y;
  if (m.role === 'scope') { const k = scopeK(time, m.phase), a = m.a0 + (m.a1 - m.a0) * k;
    m.ang = a; m.x = m.px + Math.cos(a) * m.arm - m.w / 2; m.y = m.py + Math.sin(a) * m.arm; }
  else if (m.role === 'ladder') { const k = ladderK(time, m.phase); m.x = m.ax + (m.bx - m.ax) * k; m.y = m.ay; }   /* (claude/fallingtower3) THE ROLLING LADDER: ACROSS the library on its rail */
  else if (m.role === 'chunk') { const S = L.ft2 && L.ft2.rt && L.ft2.rt.snap, k = S ? (S.st === 'done' ? 1 : S.st === 'ride' ? S.k : 0) : 0, e = k * k * (3 - 2 * k);
    m.x = m.ax + (m.bx - m.ax) * e; m.y = m.ay + (m.by - m.ay) * e - Math.sin(Math.PI * e) * (m.lift || 0); m.tip = S && S.st === 'tell' ? Math.sin(time * 40) * 1.5 : 0; }
  m.dx = m.x - ox; m.dy = m.y - oy; return true;
}
// ---------------------------------------------------------------- drawing (world space; g the canvas, cx/cy the camera, T(s, x, y, col, align, size) main.js's text)
// (claude/ft2art, 2026-10-10: the art pass over the greybox - ART ONLY: every position, size and state below is what the rules above set)
const C = { shadow: 'rgba(10,6,14,', grit: '#a8987c', flame: ['#c9463d', '#ff9b49', '#ffe9b0'], syrup: ['#2a4a1e', '#3a6a2a', '#6fbf4a', '#b8f08a'], fizz: ['#7a2a6a', '#e070c0', '#ffd0f0'], gold: ['#8a6a1a', '#e0b040', '#fff0a0'], brass: ['#3a2e1c', '#5a4420', '#b08a3a', '#e6c46a'],
  stone: ['#2a2638', '#4a4458', '#726a8a', '#9a92b4'], wood: ['#2a1a0e', '#4a2c18', '#7a4a28', '#a8703c'], iron: '#1c1a24', paper: '#e8dcc0', spine: ['#8a2a2a', '#2a4a7a', '#6a6a2a', '#5a2a6a', '#2a6a4a', '#8a5a1a'] };
const R_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const hsh = (a, b = 0) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
/* a hard-pixel line (no antialiasing), w px thick */
function seg(g, x0, y0, x1, y1, col, w = 1) { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); g.fillStyle = col;
  for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w); }
/* a crack: a jagged run from (x0, y0) to (x1, y1), its kinks set by a seed, with a branch every third kink */
function crack(g, x0, y0, x1, y1, seed, amp, col, branchCol) { const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 9)); let px = x0, py = y0;
  for (let i = 1; i <= n; i++) { const t = i / n, nx = x0 + (x1 - x0) * t + (i === n ? 0 : (hsh(seed, i) - 0.5) * 2 * amp), ny = y0 + (y1 - y0) * t; seg(g, px, py, nx, ny, col);
    if (branchCol && i % 3 === 0) seg(g, nx, ny, nx + (hsh(seed, i + 40) < 0.5 ? -1 : 1) * 5, ny + 4, branchCol); px = nx; py = ny; } }
/* a cog: square teeth round a hub (no rotation of a sprite: the teeth step) */
function cog(g, x, y, r, col, hi, ph) { R_(g, col, x - r + 1, y - r + 1, r * 2 - 1, r * 2 - 1); for (let i = 0; i < 8; i++) { if ((i + ph) % 2) continue; const a = i * Math.PI / 4; R_(g, col, Math.round(x + Math.cos(a) * (r + 1)) - 1, Math.round(y + Math.sin(a) * (r + 1)) - 1, 3, 3); }
  R_(g, '#1c1a24', x - 1, y - 1, 3, 3); R_(g, hi, x - r + 1, y - r + 1, r, 1); }
function stoneChunk(g, x, ry, w, h) { R_(g, C.stone[0], x - w, ry - h, w * 2, h); R_(g, C.stone[1], x - w + 1, ry - h + 1, w * 2 - 2, h - 2); R_(g, C.stone[3], x - w + 1, ry - h, w - 2, 1); R_(g, C.stone[2], x - w + 1, ry - h + 1, 3, 2);
  R_(g, C.stone[0], x - 1, ry - h + 2, 1, h - 4); R_(g, C.stone[0], x - w + 3, ry - 3, w - 2, 1); R_(g, C.stone[3], x + w - 5, ry - h + 2, 2, 1); }
export function ftDraw(g, L, P, cx, cy, time, T, movers) {
  const F = L && L.ft2; if (!F || !F.rt) return; const R = F.rt, VW = g.canvas.width, VH = g.canvas.height;
  const on = (x, y, m = 64) => x > cx - m && x < cx + VW + m && y > cy - m && y < cy + VH + m;
  // ---- THE CRACKS UP THE WALLS: jagged and branching, a dark seam under a hot one, grit trickling off them; from the floor going down toward the floor you are on ----
  for (const fl of L.towerFloors || []) { if (fl.front === null || fl.front === undefined) continue; const y0 = fl.front * TS, y1 = Math.max(fl.top - 40, 0) * TS;
    if (y0 < cy - 20 || y1 > cy + VH + 20) continue;
    for (const wx of [F.x0 * TS, (F.x1 + 1) * TS]) { const inw = wx === F.x0 * TS ? 1 : -1, sd = Math.floor(fl.front) + (inw < 0 ? 17 : 0);
      const ya = Math.round(Math.min(y0, cy + VH + 20) - cy), yb = Math.round(Math.max(y1, cy - 20) - cy), xs = Math.round(wx - cx) + inw * 5;
      crack(g, xs + 1, ya, xs + 1, yb, sd, 5, '#12151e', null);
      crack(g, xs, ya, xs, yb, sd, 5, '#ffb070', '#c9463d');
      g.fillStyle = C.grit; for (let i = 0; i < 5; i++) g.fillRect(xs + inw * ((i * 3) % 7), Math.round(ya - 8 - ((time * 40 + i * 31) % Math.max(10, ya - yb))), 1, 2); } }
  // ---- DEBRIS: the shadow on the ledge (darker and wider as it comes), the grit trickling, the stone falling, and the rubble where it fell ----
  for (const d of R.debris) { if (!on(d.x, d.y, 200)) continue; const x = Math.round(d.x - cx), y = Math.round(d.y - cy);
    if (d.st === 'tell' || d.st === 'fall') { const k = d.st === 'fall' ? 1 : 1 - d.t / FT2.debris.tell, w = Math.round(8 + 8 * k);
      g.fillStyle = C.shadow + (0.35 + 0.4 * k).toFixed(2) + ')'; g.fillRect(x - w, y - 2, w * 2, 3); g.fillRect(x - w + 3, y - 3, w * 2 - 6, 1);
      g.fillStyle = C.shadow + (0.25 + 0.3 * k).toFixed(2) + ')'; for (let i = -w + 2; i < w - 2; i += 4) g.fillRect(x + i, y - 4 - (i & 1), 2, 1);   /* (the shadow's ragged lip) */
      if (Math.floor(time * 8) % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y - 9, 2, 4); g.fillRect(x - 1, y - 4, 2, 1); }   /* the red mark: nothing turns it */
      if (d.st === 'tell') { g.fillStyle = C.grit; for (let i = 0; i < 4; i++) { const yy = Math.round(d.top - cy + ((time * 90 + i * 23) % Math.max(8, d.y - d.top))); g.fillRect(x - 3 + (i * 3) % 7, yy, 1, 2); }
        const ty0 = Math.round(d.top - cy); R_(g, '#12151e', x - 5, ty0, 10, 2); R_(g, '#12151e', x - 2, ty0 + 2, 4, 1); R_(g, C.grit, x - 4 + (((time * 6) | 0) % 5), ty0 + 2, 1, 1); } }   /* (the crack in the ceiling it comes out of) */
    if (d.st === 'fall') { const ry = Math.round(d.ry - cy);
      g.fillStyle = 'rgba(168,152,124,0.35)'; for (let i = 1; i <= 3; i++) g.fillRect(x - 1 + (i % 2) * 2, ry - 10 - i * 5, 1, 4);   /* its trail of grit */
      if (d.kind === 'shelf') { R_(g, C.wood[0], x - 11, ry - 9, 22, 10); R_(g, C.wood[2], x - 10, ry - 9, 20, 2); R_(g, C.wood[1], x - 10, ry - 7, 20, 7);
        for (let i = 0; i < 5; i++) { R_(g, C.spine[i], x - 9 + i * 4, ry - 6, 3, 5); R_(g, C.paper, x - 9 + i * 4, ry - 6, 1, 1); }
        R_(g, C.wood[3], x - 11, ry - 2, 2, 3); R_(g, C.paper, x + 12, ry - 14 + (((time * 20) | 0) % 3), 4, 3); R_(g, C.paper, x - 15, ry - 8 + (((time * 17) | 0) % 3), 3, 3); }   /* a plank, the books, loose pages falling beside */
      else if (d.kind === 'brass') { R_(g, C.brass[0], x - 9, ry - 10, 18, 10); R_(g, C.brass[2], x - 8, ry - 9, 16, 8); R_(g, C.brass[3], x - 7, ry - 9, 6, 2); cog(g, x, ry - 5, 3, C.brass[1], C.brass[3], ((time * 12) | 0) & 1); R_(g, C.brass[0], x + 4, ry - 12, 2, 3); R_(g, C.brass[0], x - 8, ry - 12, 2, 3); }   /* a clock's wheel-plate, its teeth */
      else stoneChunk(g, x, ry, 8, 10); }
    if (d.st === 'land') { const k = Math.max(0, d.t / 0.5);
      if (d.kind === 'shelf') { R_(g, C.wood[1], x - 9, y - 3, 8, 3); R_(g, C.wood[2], x - 9, y - 3, 8, 1); R_(g, C.wood[1], x + 2, y - 2, 7, 2); for (let i = 0; i < 4; i++) R_(g, C.spine[i], x - 7 + i * 4, y - 5 - (i % 2), 3, 3); R_(g, C.paper, x + 6, y - 5, 4, 3); R_(g, C.paper, x - 12, y - 2, 3, 2); }
      else if (d.kind === 'brass') { R_(g, C.brass[1], x - 8, y - 4, 16, 4); R_(g, C.brass[2], x - 7, y - 4, 7, 1); cog(g, x + 3, y - 4, 2, C.brass[2], C.brass[3], 0); R_(g, C.brass[3], x - 10, y - 2, 2, 2); }
      else { R_(g, C.stone[1], x - 8, y - 4, 16, 4); R_(g, C.stone[3], x - 6, y - 4, 6, 1); R_(g, C.stone[2], x - 11, y - 2, 3, 2); R_(g, C.stone[2], x + 9, y - 3, 3, 3); R_(g, C.stone[0], x - 2, y - 3, 1, 3); }
      g.fillStyle = 'rgba(168,152,124,' + (0.45 * k).toFixed(2) + ')'; for (let i = 0; i < 4; i++) g.fillRect(x - 10 + i * 6 + Math.round((1 - k) * (i - 1.5) * 6), y - 6 - Math.round((1 - k) * 8) - (i % 2), 3, 2); } }
  // ---- THE OBSERVATORY'S DOME, TURNING: ribbed brass over the shaft, its slit going round (stars in it), and the moonbeam through it sweeping the stair ----
  if (F.dome) { const D = F.dome, x0 = Math.round(D.x0 * TS - cx), x1 = Math.round((D.x1 + 1) * TS - cx), y = Math.round(D.row * TS - cy), w = x1 - x0, mx = (x0 + x1) / 2;
    if (x1 > 0 && x0 < VW && y > -80 && y < VH + 40) { const a = (time * 0.35) % (Math.PI * 2), slit = mx + Math.cos(a) * w * 0.42, front = Math.sin(a) > 0, hw = w / 2;
      for (let i = 0; i <= 40; i++) { const t = Math.PI * i / 40, ex = Math.round(mx + Math.cos(t) * hw), ey = Math.round(y + 4 - Math.sin(t) * 26);   /* the rim: a brass band, stepped */
        R_(g, C.brass[0], ex - 1, ey - 1, 3, 3); R_(g, C.brass[2], ex, ey, 1, 1); if (i % 5 === 0) R_(g, C.brass[3], ex, ey - 1, 2, 2); }
      for (let i = 0; i < 6; i++) { const ra = a + i * 1.05, c = Math.cos(ra), s = Math.sin(ra); if (s <= 0) continue; const rx = mx + c * hw * 0.92;   /* a rib: it curves up to the crown */
        for (let yy = -22; yy <= 4; yy += 2) { const t = (yy + 22) / 26, bx = Math.round(mx + (rx - mx) * Math.sqrt(Math.max(0, 1 - Math.pow(1 - t, 2)))); R_(g, C.brass[1], bx, y + yy, 2, 2); if (s > 0.5) R_(g, C.brass[2], bx, y + yy, 1, 1); } }
      if (front) { const sx = Math.round(slit); R_(g, '#0a0c18', sx - 8, y - 22, 16, 26); R_(g, C.brass[0], sx - 9, y - 22, 1, 26); R_(g, C.brass[0], sx + 8, y - 22, 1, 26);   /* THE SLIT, between two rails, stars in it */
        for (let i = 0; i < 5; i++) R_(g, i === 2 ? '#ffffff' : '#c8d8ff', sx - 6 + ((i * 7) % 12), y - 20 + ((i * 11) % 22), 1, 1);
        g.save(); g.globalAlpha = 0.10; g.fillStyle = '#c8d8ff'; g.beginPath(); g.moveTo(slit - 6, y + 4); g.lineTo(slit + 6, y + 4); g.lineTo(slit + 60 + Math.cos(a) * 80, y + 220); g.lineTo(slit - 60 + Math.cos(a) * 80, y + 220); g.closePath(); g.fill(); g.restore();   /* the moonbeam */
        g.fillStyle = 'rgba(232,240,255,0.55)'; for (let i = 0; i < 6; i++) { const t = ((time * 0.4 + i / 6) % 1); g.fillRect(Math.round(slit + (Math.cos(a) * 80) * t + (i - 3) * 8 * t), Math.round(y + 8 + t * 200), 1, 1); } } } }   /* (dust turning in it) */
  // ---- THE BURNING BOOKS: piles of them on the plank tiers; a smoulder (glow, smoke, a hiss), then the flare ----
  for (const q of F.flares || []) { const x0 = Math.round(q.x0 * TS - cx), x1 = Math.round((q.x1 + 1) * TS - cx), y = Math.round(q.row * TS - cy); if (x1 < -20 || x0 > VW + 20 || y < -50 || y > VH + 40) continue;
    for (let x = x0 + 3, i = 0; x < x1 - 6; x += 12, i++) { const hh = hsh(q.x0 + i, 3);
      R_(g, C.wood[0], x - 1, y - 7, 11, 7); R_(g, C.spine[i % 6], x, y - 3, 9, 3); R_(g, C.paper, x + 1, y - 2, 7, 1); R_(g, C.spine[(i + 2) % 6], x + 1, y - 6, 8, 3); R_(g, C.gold[1], x + 2, y - 5, 1, 1); R_(g, C.gold[1], x + 6, y - 5, 1, 1);
      if (hh > 0.45) { R_(g, C.paper, x - 4, y - 2, 4, 2); R_(g, '#b8a888', x - 3, y - 2, 2, 1); R_(g, C.spine[(i + 4) % 6], x - 5, y - 1, 1, 1); } }   /* (a book fallen open) */
    if (q.st === 'smoulder') { const k = Math.sin(time * 18) * 0.5 + 0.5; g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,107,44,' + (0.14 + 0.2 * k).toFixed(2) + ')'; g.fillRect(x0 - 2, y - 10, x1 - x0 + 4, 10); g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(255,107,44,' + (0.25 + 0.3 * k).toFixed(2) + ')'; g.fillRect(x0, y - 6, x1 - x0, 6); g.fillStyle = '#ffd36b'; for (let x = x0 + 6; x < x1; x += 9) g.fillRect(x + Math.round(Math.sin(time * 9 + x) * 2), y - 8 - ((time * 30 + x) % 10), 1, 2);
      g.fillStyle = 'rgba(70,64,76,0.55)'; for (let x = x0 + 8; x < x1; x += 15) { const t = (time * 0.8 + x * 0.07) % 1; g.fillRect(x + Math.round(Math.sin(time * 3 + x) * 3), Math.round(y - 12 - t * 26), 2, 2); }   /* smoke */
      if (T) T('!!', Math.round((x0 + x1) / 2), y - 20, '#ff6b6b', 'center', 8); }
    if (q.st === 'burn') { g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,150,70,0.16)'; g.fillRect(x0 - 4, y - FT2.flare.h - 10, x1 - x0 + 8, FT2.flare.h + 10); g.globalCompositeOperation = 'source-over';
      for (let x = x0; x < x1; x += 4) { const h = Math.round(FT2.flare.h * (0.55 + 0.45 * Math.sin(time * 20 + x * 0.7)));   /* tongues, stepped to a point */
        g.fillStyle = C.flame[0]; g.fillRect(x, y - h, 4, h); g.fillRect(x + 1, y - h - 2, 2, 2); g.fillStyle = C.flame[1]; g.fillRect(x + 1, y - Math.round(h * 0.75), 2, Math.round(h * 0.75)); g.fillStyle = C.flame[2]; g.fillRect(x + 1, y - Math.round(h * 0.35), 1, Math.round(h * 0.35)); }
      g.fillStyle = '#ffe9b0'; for (let i = 0; i < 6; i++) g.fillRect(x0 + (((i * 41 + time * 50) | 0) % Math.max(8, x1 - x0)), Math.round(y - FT2.flare.h - ((time * 60 + i * 13) % 18)), 1, 1); } }   /* sparks (and burnt pages) off it */
  // ---- THE SPILLS: syrup pooled with a rolled edge, drips and slow bubbles; the fizz foaming over its stone ----
  for (const z of F.syrup || []) { const x0 = Math.round(z.x0 * TS - cx), w = (z.x1 - z.x0 + 1) * TS, y = Math.round(z.row * TS - cy); if (x0 > VW || x0 + w < 0 || y < -20 || y > VH + 20) continue;
    R_(g, C.syrup[0], x0 + 1, y - 1, w - 2, 2); R_(g, C.syrup[1], x0, y - 3, w, 3); R_(g, C.syrup[2], x0 + 2, y - 3, w - 4, 1); R_(g, C.syrup[0], x0 - 1, y - 1, 1, 1); R_(g, C.syrup[0], x0 + w, y - 1, 1, 1);
    for (let i = 5; i < w - 6; i += 13) { const ph = (time * 0.7 + i * 0.11) % 1, dl = 2 + Math.round(ph * 4); R_(g, C.syrup[1], x0 + i, y, 1, dl); R_(g, C.syrup[3], x0 + i, y + dl, 1, 1); }   /* drips off the lip */
    for (let i = 0; i < w; i += 9) { const ph = (time * 1.1 + i * 0.13) % 1, by = y - 4 - Math.round(ph * 5); if (ph < 0.8) { R_(g, C.syrup[3], x0 + i + 3, by, 2, 2); R_(g, '#e8ffd0', x0 + i + 3, by, 1, 1); } } }
  for (const [tx, ty] of F.fizz || []) { const x = Math.round(tx * TS - cx), y = Math.round(ty * TS - cy); if (x < -20 || x > VW + 20 || y < -40 || y > VH + 30) continue;
    R_(g, '#2e2a3a', x, y, 16, 16); R_(g, '#4a4458', x, y + 4, 16, 1);   /* the stone the fizz spilled on (over the engine's springy-cap tile) */
    R_(g, C.fizz[0], x, y, 16, 4); R_(g, C.fizz[1], x + 1, y, 14, 2);
    for (let i = 0; i < 5; i++) { const bx = x + 1 + i * 3, bh = 1 + ((i * 5 + ((time * 6) | 0)) % 3); R_(g, C.fizz[1], bx, y - bh, 3, bh + 1); R_(g, C.fizz[2], bx + 1, y - bh, 1, 1); }   /* the foam head, heaving */
    for (let i = 0; i < 4; i++) { const ph = (time * 1.9 + i * 0.27) % 1; R_(g, C.fizz[2], x + 2 + i * 4 + Math.round(Math.sin(time * 5 + i) * 1.5), y - 4 - Math.round(ph * 14), 2, 2); }
    g.fillStyle = 'rgba(224,112,192,0.14)'; g.fillRect(x - 1, y - 22, 18, 18); }
  // ---- THE TREASURY'S FLOOR: gold in heaps and loose, glints, the arrows of its lean, the chests (leaning into the slide) ----
  if (F.tilt) { const Z = F.tilt, Tq = R.tilt, y = Math.round(Z.row * TS - cy), x0 = Math.round(Z.x0 * TS - cx), x1 = Math.round((Z.x1 + 1) * TS - cx);
    if (y > -40 && y < VH + 40) { const dir = Tq.st === 'lean' ? Tq.dir : Tq.st === 'tell' ? Tq.dir : 0, run = (time * 50) % 16;
      for (let x = x0 + 4, i = 0; x < x1; x += 11, i++) { const off = Math.round(dir * Tq.k * ((time * 40 + x) % 9)), big = hsh(i, 9) > 0.7;
        R_(g, C.gold[0], x + off, y - 2, 4, 2); R_(g, C.gold[1], x + off, y - 3, 3, 1); R_(g, C.gold[2], x + off + 1, y - 3, 1, 1);
        if (big) { R_(g, C.gold[0], x + off - 2, y - 4, 8, 4); R_(g, C.gold[1], x + off - 1, y - 6, 6, 2); R_(g, C.gold[2], x + off, y - 6, 2, 1); }   /* a heap */
        if (((time * 2 + i * 0.37) % 2.2) < 0.12) { R_(g, '#ffffff', x + off + 1, y - 7, 1, 3); R_(g, '#ffffff', x + off, y - 6, 3, 1); } }   /* a glint */
      if (dir) { g.fillStyle = Tq.st === 'tell' ? (Math.floor(time * 10) % 2 ? '#ffffff' : '#ffd36b') : '#ffd36b'; for (let x = x0 + 8; x < x1 - 8; x += 48) { const ax = Math.round(x + dir * run); for (let j = 0; j < 4; j++) { g.fillRect(ax - dir * j, y + 4 - j, 1, 1); g.fillRect(ax - dir * j, y + 4 + j, 1, 1); } } }
      for (const ch of R.chests) { const x = Math.round(ch.x - cx), lean = Math.abs(ch.vx) > 20 ? Math.sign(ch.vx) : 0;
        R_(g, C.wood[0], x - 8, y - 11, 16, 11); R_(g, C.wood[1], x - 7, y - 8, 14, 8); R_(g, C.wood[2], x - 7 + lean, y - 11, 14, 3); R_(g, C.wood[3], x - 6 + lean, y - 11, 5, 1);   /* the chest, its lid */
        R_(g, C.iron, x - 7, y - 7, 14, 1); R_(g, C.iron, x - 6, y - 11, 1, 11); R_(g, C.iron, x + 5, y - 11, 1, 11); R_(g, C.gold[1], x - 1, y - 8, 2, 3); R_(g, C.iron, x, y - 7, 1, 1);   /* straps and a gold lock */
        R_(g, C.gold[1], x - 5 + lean, y - 12, 4, 1); R_(g, C.gold[2], x + 1 + lean, y - 12, 2, 1);   /* coin lipping over the lid */
        if (lean) { R_(g, C.gold[1], x - lean * 10, y - 2, 2, 2); R_(g, C.gold[2], x - lean * 13, y - 1, 1, 1); }   /* it sheds as it slides */
        if (Math.abs(ch.vx) > 20) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y - 20, 2, 4); g.fillRect(x - 1, y - 15, 2, 1); } } } }
  // ---- THE OUTER FACE: the abyss (far spires lit by the flashes), the rain (leaning with the tower), the wind, the lashed planks and their lamps, the lightning ----
  if (F.outer) { const O = F.outer, x0 = Math.round(O.x0 * TS - cx), x1 = Math.round((O.x1 + 1) * TS - cx), yd = Math.round(O.drop * TS - cy);
    if (x1 > 0 && x0 < VW) { const G = R.gust, B = R.bolt, lit = B.st === 'flash';
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(4,4,10,' + (0.15 + i * 0.12).toFixed(2) + ')'; g.fillRect(x0, yd - 24 + i * 8, x1 - x0, 8); }
      g.fillStyle = '#04040a'; g.fillRect(x0, yd + 24, x1 - x0, Math.max(0, VH - yd - 24));   /* THE DROP: black */
      if (yd < VH) { const sp = lit ? '#2a2a46' : '#0e0e1c', fog = lit ? 'rgba(120,130,170,0.35)' : 'rgba(60,64,96,0.22)';   /* what is far below: spires, and cloud */
        for (let i = 0; i < 5; i++) { const sx = x0 + 6 + i * Math.round((x1 - x0 - 12) / 5) + ((i * 13) % 9), sh = 26 + ((i * 29) % 40), sy = yd + 70; if (sy > VH + 10) continue; R_(g, sp, sx, sy - sh, 5 + (i % 2) * 2, sh + 30); R_(g, sp, sx + 1, sy - sh - 4, 3, 4); if (lit) R_(g, '#f0e8c0', sx + 2, sy - sh + 6, 1, 1); }
        for (let i = 0; i < 4; i++) { const cyy = yd + 40 + i * 34 + Math.round(Math.sin(time * 0.4 + i) * 3); if (cyy > VH) continue; g.fillStyle = fog; g.fillRect(x0, cyy, x1 - x0, 6); g.fillRect(x0 + 8 + i * 5, cyy - 3, 40, 3); } }
      if (T && P && inOuter(F, P) && yd < VH) T('THE DROP', Math.round((x0 + x1) / 2), yd + 10, '#9a8aa8', 'center', 6);
      const lean = (F.lean || 0) * 0.05 + (G.st === 'blow' ? G.dir * 0.5 : 0);
      g.fillStyle = 'rgba(160,170,200,0.35)'; for (let i = 0; i < 40; i++) { const s = Math.sin(i * 91.7) * 43758.5, r = s - Math.floor(s), rx = x0 + ((r * 997 + time * 40 * lean * 10) % (x1 - x0) + (x1 - x0)) % (x1 - x0), ry = ((time * 260 + r * 900) % (VH + 20)) - 10; g.fillRect(Math.round(rx), Math.round(ry), 1, 4 + (i % 3)); }
      for (const [lx, len, row] of O.ledges || []) { const lxs = Math.round(lx * TS - cx), w = len * TS, ly = Math.round(row * TS - cy); if (ly < -30 || ly > VH + 30) continue;
        for (let n = 0; n < len; n++) { R_(g, C.wood[0], lxs + n * TS + 7, ly + 3, 1, 1); R_(g, C.wood[3], lxs + n * TS + 2, ly + 1, 1, 1); R_(g, C.wood[3], lxs + n * TS + 11, ly + 1, 1, 1); }   /* nail heads, wet */
        R_(g, '#6a5a48', lxs - 1, ly + 1, 1, 8); R_(g, '#6a5a48', lxs + w, ly + 1, 1, 8); R_(g, '#9a8a68', lxs - 2, ly + 4, 3, 1); R_(g, '#9a8a68', lxs + w - 1, ly + 4, 3, 1);   /* the lashings, and the frayed rope ends */
        if (((row / 3) | 0) % 2 === 0) { const lamp = lxs + (lx < (O.x0 + O.x1) / 2 ? w - 4 : 3), fl = 0.8 + 0.2 * Math.sin(time * 9 + row);   /* a storm-lantern on every other scaffold: a pool of light to read the dark by */
          R_(g, C.iron, lamp, ly - 10, 3, 1); R_(g, '#ffd36b', lamp, ly - 9, 3, 3); R_(g, '#fff0b0', lamp + 1, ly - 8, 1, 1); R_(g, C.iron, lamp, ly - 6, 3, 1);
          g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,190,90,' + (0.10 * fl).toFixed(3) + ')'; g.fillRect(lamp - 14, ly - 22, 31, 26); g.fillStyle = 'rgba(255,190,90,' + (0.12 * fl).toFixed(3) + ')'; g.fillRect(lamp - 7, ly - 15, 17, 14); g.globalCompositeOperation = 'source-over'; } }
      if (G.st === 'tell' || G.st === 'blow') { const k = G.st === 'blow' ? 1 : 1 - G.t / FT2.gust.tell, streak = 'rgba(220,230,255,' + (0.25 + 0.4 * k).toFixed(2) + ')'; g.fillStyle = streak;
        for (let i = 0; i < 14; i++) { const yy = ((i * 53 + 17) % VH), xx = ((time * 260 * G.dir + i * 97) % (x1 - x0) + (x1 - x0)) % (x1 - x0) + x0; g.fillStyle = streak; g.fillRect(Math.round(xx), yy, Math.round(10 + 14 * k), 1); if (i % 3 === 0) { g.fillStyle = 'rgba(180,170,150,0.7)'; g.fillRect(Math.round(xx) + 3 * G.dir, yy - 2 + (i % 2) * 4, 2, 1); } }   /* (grit and a torn page in it) */
        if (T && inOuter(F, P)) T(G.dir < 0 ? '<<< WIND' : 'WIND >>>', Math.round((x0 + x1) / 2), 24, Math.floor(time * 8) % 2 ? '#ffffff' : '#c8d8ff', 'center', 8); }
      for (const [lx, len, row] of O.ledges || []) { const fx = Math.round((lx + (lx < (O.x0 + O.x1) / 2 ? 0 : len - 1)) * TS - cx) + 6, fy = Math.round(row * TS - cy);   /* a flag on every scaffold: it streams the way the wind will blow, in scallops */
        if (fy < -30 || fy > VH + 10) continue; g.fillStyle = '#6a5a48'; g.fillRect(fx, fy - 18, 1, 18); R_(g, C.brass[3], fx - 1, fy - 19, 3, 1); const d = G.st === 'calm' ? 0.3 : G.dir, sp = G.st === 'calm' ? 3 : 14;
        for (let i = 0; i < 7; i++) { const wav = Math.round(Math.sin(time * sp + i * 0.9) * (G.st === 'calm' ? 0.6 : 1.6)), xx = d > 0 ? fx + 1 + i : fx - 1 - i; g.fillStyle = i % 3 === 2 ? '#8a2a2a' : '#c9463d'; g.fillRect(xx, fy - 18 + wav + (G.st === 'calm' ? Math.round(i * 0.4) : 0), 1, 4 - (i > 4 ? 1 : 0)); } }
      if (B.st === 'tell' || B.st === 'flash') { const bx = Math.round(B.x - cx), by = Math.round(B.y - cy), k = B.st === 'flash' ? 1 : 1 - B.t / FT2.bolt.tell;
        if (B.st === 'tell') { g.fillStyle = 'rgba(220,230,255,' + (0.12 + 0.25 * k).toFixed(2) + ')'; g.fillRect(bx - FT2.bolt.half, by - 140, FT2.bolt.half * 2, 140);   /* the pale column on the plank it will strike */
          g.fillStyle = Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8ff'; g.fillRect(bx - FT2.bolt.half, by - 1, FT2.bolt.half * 2, 1); for (let i = 0; i < 5; i++) g.fillRect(bx - FT2.bolt.half + 2 + i * 5, by - 3 - (((time * 12 + i * 2) % 4) | 0), 1, 2);   /* (the air crackling over it) */
          if (T) T('!!', bx, by - 22, '#ff6b6b', 'center', 8); }
        else { g.fillStyle = 'rgba(220,230,255,0.22)'; g.fillRect(bx - FT2.bolt.half, 0, FT2.bolt.half * 2, by);   /* the strike: a forked bolt down the column, a scorch where it lands */
          crack(g, bx, 0, bx, by, Math.floor(time * 8), 7, '#c8d8ff', '#c8d8ff'); crack(g, bx + 1, 0, bx + 1, by, Math.floor(time * 8), 7, '#ffffff', null);
          g.fillStyle = '#ffffff'; g.fillRect(bx - FT2.bolt.half, by - 2, FT2.bolt.half * 2, 2); g.fillStyle = '#12101a'; g.fillRect(bx - 7, by - 1, 14, 1); } } } }
  // ---- THE TELESCOPE AND THE CHUNK ----
  for (const m of movers || []) { if (!m.ft2) continue; const x = Math.round(m.x - cx), y = Math.round(m.y - cy); if (x < -260 || x > VW + 260 || y < -260 || y > VH + 260) continue;
    if (m.role === 'scope') { const px = Math.round(m.px - cx), py = Math.round(m.py - cy), ex = x + m.w / 2;
      R_(g, C.stone[0], px - 12, py + 6, 24, 8); R_(g, C.stone[1], px - 11, py + 6, 22, 2); R_(g, C.brass[1], px - 7, py - 6, 14, 14); R_(g, C.brass[2], px - 6, py - 5, 12, 2);   /* its pier and the mount */
      seg(g, px, py, ex, y + 4, C.brass[0], 8); seg(g, px, py, ex, y + 4, C.brass[2], 5); seg(g, px, py - 1, ex, y + 3, C.brass[3], 1);   /* the tube: dark, brass, a hot edge */
      for (const t of [0.25, 0.55, 0.85]) { const bx = Math.round(px + (ex - px) * t), by = Math.round(py + (y + 4 - py) * t); R_(g, C.brass[0], bx - 4, by - 4, 8, 8); R_(g, C.gold[1], bx - 3, by - 3, 6, 6); R_(g, C.brass[1], bx - 2, by - 2, 4, 4); }   /* bands */
      cog(g, px, py + 1, 4, C.brass[2], C.brass[3], ((time * 3) | 0) & 1);   /* the cog that turns it */
      R_(g, C.iron, px - 2, py + 14, 1, 10 + Math.round(Math.sin(time * 2) * 1.5)); R_(g, C.stone[2], px - 4, py + 24 + Math.round(Math.sin(time * 2) * 1.5), 5, 4);   /* the counterweight on its chain */
      R_(g, C.brass[0], x, y, m.w, 6); R_(g, C.brass[2], x, y, m.w, 2); R_(g, C.brass[3], x + 1, y, m.w - 2, 1);   /* the eyepiece platform */
      for (let i = 4; i < m.w; i += 10) R_(g, C.brass[1], x + i, y - 5, 1, 5); R_(g, C.brass[2], x + 4, y - 5, m.w - 8, 1);   /* its rail */
      R_(g, '#e8f0ff', Math.round(ex) - 1, y + 3, 2, 2); if ((((time * 3) | 0) % 4) === 0) { R_(g, '#ffffff', Math.round(ex) - 3, y + 4, 6, 1); R_(g, '#ffffff', Math.round(ex), y + 1, 1, 6); } }   /* the lens, with its glint */
    if (m.role === 'ladder') { const rx0 = Math.round(Math.min(m.ax, m.bx) - cx), rx1 = Math.round(Math.max(m.ax, m.bx) + m.w - cx), ry = Math.round(m.ay - cy) - 46;   /* (greybox, claude/fallingtower3) its rail high on the shelves, the ladder hung from it, its step */
      R_(g, C.iron, rx0, ry, rx1 - rx0, 2); R_(g, C.brass[2], rx0, ry, rx1 - rx0, 1);
      for (const lx of [x + 6, x + m.w - 8]) R_(g, C.wood[2], lx, ry + 2, 2, 46); for (let yy = ry + 8; yy < y; yy += 8) R_(g, C.wood[3], x + 6, yy, m.w - 12, 1);
      R_(g, C.wood[1], x, y, m.w, 6); R_(g, C.wood[3], x, y, m.w, 2); R_(g, C.brass[2], x + 2, ry - 2, 4, 4); R_(g, C.brass[2], x + m.w - 6, ry - 2, 4, 4); }
    if (m.role === 'chunk') { const S = R.snap, tip = Math.round(m.tip || 0), w = m.w, top = y + tip;
      R_(g, '#2a2638', x, top, w, 22); R_(g, '#3a3448', x + 1, top + 1, w - 2, 20);   /* THE CHUNK: courses of ashlar... */
      for (let c = 0; c < 3; c++) { const yy = top + 3 + c * 7; R_(g, '#252b3a', x + 1, yy, w - 2, 1); for (let b = 0; b < w; b += 16) R_(g, '#252b3a', x + b + (c % 2 ? 8 : 0), yy + 1, 1, 6); }
      R_(g, '#5a5470', x, top, w, 3); R_(g, '#7a7498', x + 2, top, w - 4, 1);
      for (let i = 0; i < w; i += 8) { const th = 2 + Math.round(hsh(i, 5) * 5); R_(g, '#2a2638', x + i, top + 22, 8, th); R_(g, '#3a3448', x + i + 1, top + 22, 5, Math.max(1, th - 2)); }   /* ...and the torn underside, in teeth */
      R_(g, C.iron, x + 20, top + 22, 2, 9); R_(g, C.iron, x + w - 24, top + 22, 2, 7); R_(g, '#6a5a48', x + 20, top + 28, 2, 1);   /* snapped timber and iron hanging from it */
      for (const mx of [x + 4, x + w - 13]) { R_(g, '#4a4458', mx, y - 10 + tip, 9, 10); R_(g, '#6a6480', mx, y - 10 + tip, 9, 2); R_(g, '#2a2638', mx + 3, y - 4 + tip, 1, 4); }   /* its merlons */
      R_(g, '#4a4458', x + w / 2 - 3, y - 5 + tip, 6, 5);
      if (S.st === 'wait') { crack(g, x - 2, y + 24, x + 2, y - 2, 11, 3, Math.floor(time * 6) % 2 ? '#ffd36b' : '#ffffff', null); if (T && P && Math.abs(P.y - m.y) < 120 && Math.abs(P.x - (m.x + m.w / 2)) < 160) T('LOOSE: STEP ON IT', x + m.w / 2, y - 22, '#ffd36b', 'center', 6); }   /* the crack it will go on */
      if (S.st === 'tell') { const k = 1 - S.t / FT2.snap.tell, hh = Math.round(40 + 220 * k);   /* THE SNAP, TOLD: the tower splits - a crack runs up and down the face behind you */
        crack(g, x + 2, top + 10, x - 2, top - hh, 21, 5, '#ffe9b0', '#ffb070'); crack(g, x + 2, top + 10, x + 6, top + 10 + hh, 22, 5, '#ffe9b0', '#ffb070');
        g.fillStyle = C.grit; for (let i = 0; i < 6; i++) g.fillRect(x + (i * 17) % w, top + 22 + (((time * 70 + i * 19) % 40) | 0), 2, 2); }
      if (S.st === 'ride') { g.fillStyle = 'rgba(120,112,150,0.5)'; for (let i = 0; i < 8; i++) { const t = (time * 1.6 + i / 8) % 1; g.fillRect(x + ((i * 23) % w), Math.round(top + 24 + t * 70), 2 + (i % 2), 2); }   /* it sheds as it goes: rubble falling away under it */
        R_(g, '#ffe9b0', x - 3, top - 40, 1, 60); } } }
}
