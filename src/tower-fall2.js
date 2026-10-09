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
  gust: { first: 2.0, calm: 3.4, tell: 1.3, blow: 1.6, push: 52 },   /* (the face is eight tiles wide: a gust shoves, it does not throw you off it unbraced in one) */
  bolt: { first: 3.0, every: 4.6, tell: 1.3, half: 12, dmg: 18 },
  scope: { period: 7.0, w: 40, hold: 0.2 },
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
    if (G.st === 'blow' && outside) c.push(G.dir * K.push * (P.block ? 0.4 : 1) * dt);
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
export function ftMover(L, m, dt, time) {
  const ox = m.x, oy = m.y;
  if (m.role === 'scope') { const k = scopeK(time, m.phase), a = m.a0 + (m.a1 - m.a0) * k;
    m.ang = a; m.x = m.px + Math.cos(a) * m.arm - m.w / 2; m.y = m.py + Math.sin(a) * m.arm; }
  else if (m.role === 'chunk') { const S = L.ft2 && L.ft2.rt && L.ft2.rt.snap, k = S ? (S.st === 'done' ? 1 : S.st === 'ride' ? S.k : 0) : 0, e = k * k * (3 - 2 * k);
    m.x = m.ax + (m.bx - m.ax) * e; m.y = m.ay + (m.by - m.ay) * e - Math.sin(Math.PI * e) * (m.lift || 0); m.tip = S && S.st === 'tell' ? Math.sin(time * 40) * 1.5 : 0; }
  m.dx = m.x - ox; m.dy = m.y - oy; return true;
}
// ---------------------------------------------------------------- drawing (world space; g the canvas, cx/cy the camera, T(s, x, y, col, align, size) main.js's text)
const C = { shadow: 'rgba(10,6,14,', grit: '#a8987c', flame: ['#c9463d', '#ff9b49', '#ffe9b0'], syrup: ['#3a6a2a', '#6fbf4a', '#b8f08a'], fizz: ['#7a2a6a', '#e070c0', '#ffd0f0'], gold: ['#8a6a1a', '#e0b040', '#fff0a0'], brass: ['#5a4420', '#b08a3a', '#e6c46a'] };
export function ftDraw(g, L, P, cx, cy, time, T, movers) {
  const F = L && L.ft2; if (!F || !F.rt) return; const R = F.rt, VW = g.canvas.width, VH = g.canvas.height;
  const on = (x, y, m = 64) => x > cx - m && x < cx + VW + m && y > cy - m && y < cy + VH + m;
  // ---- THE CRACKS UP THE WALLS: from the floor going down toward the floor you are on, along both inner walls ----
  for (const fl of L.towerFloors || []) { if (fl.front === null || fl.front === undefined) continue; const y0 = fl.front * TS, y1 = Math.max(fl.top - 40, 0) * TS;
    for (const wx of [F.x0 * TS, (F.x1 + 1) * TS]) { let x = wx, y = y0; g.strokeStyle = '#ffb070'; g.lineWidth = 1; g.beginPath(); g.moveTo(Math.round(x - cx), Math.round(y - cy));
      for (let i = 0; y > y1 && i < 60; i++) { y -= 14; x = wx + (((i * 37 + Math.floor(fl.front)) % 9) - 4) * (wx === F.x0 * TS ? 1 : -1) + (wx === F.x0 * TS ? 4 : -4); g.lineTo(Math.round(x - cx), Math.round(y - cy)); }
      g.stroke(); } }
  // ---- DEBRIS: the shadow on the ledge (darker and wider as it comes), the grit trickling, the stone falling ----
  for (const d of R.debris) { if (!on(d.x, d.y, 200)) continue; const x = Math.round(d.x - cx), y = Math.round(d.y - cy);
    if (d.st === 'tell' || d.st === 'fall') { const k = d.st === 'fall' ? 1 : 1 - d.t / FT2.debris.tell, w = Math.round(8 + 8 * k);
      g.fillStyle = C.shadow + (0.35 + 0.4 * k).toFixed(2) + ')'; g.fillRect(x - w, y - 2, w * 2, 3); g.fillRect(x - w + 3, y - 3, w * 2 - 6, 1);
      if (Math.floor(time * 8) % 2) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y - 9, 2, 4); g.fillRect(x - 1, y - 4, 2, 1); }   /* the red mark: nothing turns it */
      if (d.st === 'tell') { g.fillStyle = C.grit; for (let i = 0; i < 4; i++) { const yy = Math.round(d.top - cy + ((time * 90 + i * 23) % Math.max(8, d.y - d.top))); g.fillRect(x - 3 + (i * 3) % 7, yy, 1, 2); } } }
    if (d.st === 'fall') { const ry = Math.round(d.ry - cy);
      if (d.kind === 'shelf') { g.fillStyle = '#4a2c18'; g.fillRect(x - 10, ry - 8, 20, 8); g.fillStyle = '#7a4a28'; g.fillRect(x - 10, ry - 8, 20, 2); for (let i = 0; i < 5; i++) { g.fillStyle = ['#8a2a2a', '#2a4a7a', '#6a6a2a', '#5a2a6a', '#2a6a4a'][i]; g.fillRect(x - 9 + i * 4, ry - 6, 3, 5); } }
      else if (d.kind === 'brass') { g.fillStyle = C.brass[0]; g.fillRect(x - 8, ry - 9, 16, 9); g.fillStyle = C.brass[1]; g.fillRect(x - 7, ry - 8, 14, 3); g.fillStyle = C.brass[2]; g.fillRect(x - 5, ry - 7, 4, 1); }
      else { g.fillStyle = '#4a4458'; g.fillRect(x - 8, ry - 10, 16, 10); g.fillStyle = '#726a8a'; g.fillRect(x - 7, ry - 10, 12, 3); g.fillStyle = '#2a2638'; g.fillRect(x - 8, ry - 2, 16, 2); } } }
  // ---- THE OBSERVATORY'S DOME, TURNING: its ribs over the shaft, the slit going round, and the moonbeam through it sweeping the stair ----
  if (F.dome) { const D = F.dome, x0 = Math.round(D.x0 * TS - cx), x1 = Math.round((D.x1 + 1) * TS - cx), y = Math.round(D.row * TS - cy), w = x1 - x0, mx = (x0 + x1) / 2;
    if (x1 > 0 && x0 < VW && y > -80 && y < VH + 40) { const a = (time * 0.35) % (Math.PI * 2), slit = mx + Math.cos(a) * w * 0.42, front = Math.sin(a) > 0;
      g.strokeStyle = '#5a4420'; g.lineWidth = 2; g.beginPath(); g.ellipse(mx, y + 4, w / 2, 26, 0, Math.PI, 0); g.stroke(); g.lineWidth = 1;
      for (let i = 1; i < 6; i++) { const rx = mx + Math.cos(a + i * 1.05) * w * 0.45; if (Math.sin(a + i * 1.05) > 0) { g.fillStyle = '#4a3a1c'; g.fillRect(Math.round(rx), y - 18, 2, 22); } }   /* its ribs, coming round */
      if (front) { g.fillStyle = '#0a0c18'; g.fillRect(Math.round(slit) - 7, y - 22, 14, 26); g.fillStyle = '#e8ecff'; g.fillRect(Math.round(slit) - 1, y - 18, 2, 2);   /* THE SLIT, with a star in it */
        g.save(); g.globalAlpha = 0.10; g.fillStyle = '#c8d8ff'; g.beginPath(); g.moveTo(slit - 6, y + 4); g.lineTo(slit + 6, y + 4); g.lineTo(slit + 60 + Math.cos(a) * 80, y + 220); g.lineTo(slit - 60 + Math.cos(a) * 80, y + 220); g.closePath(); g.fill(); g.restore(); } } }   /* the moonbeam */
  // ---- THE BURNING BOOKS ----
  for (const q of F.flares || []) { const x0 = Math.round(q.x0 * TS - cx), x1 = Math.round((q.x1 + 1) * TS - cx), y = Math.round(q.row * TS - cy); if (x1 < -20 || x0 > VW + 20 || y < -40 || y > VH + 40) continue;
    for (let x = x0 + 4; x < x1 - 4; x += 12) { g.fillStyle = '#4a2c18'; g.fillRect(x, y - 5, 8, 5); g.fillStyle = '#8a2a2a'; g.fillRect(x + 1, y - 5, 3, 4); g.fillStyle = '#2a4a7a'; g.fillRect(x + 4, y - 4, 3, 3); }   /* the piles of books */
    if (q.st === 'smoulder') { const k = Math.sin(time * 18) * 0.5 + 0.5; g.fillStyle = 'rgba(255,107,44,' + (0.25 + 0.3 * k).toFixed(2) + ')'; g.fillRect(x0, y - 6, x1 - x0, 6); g.fillStyle = '#ffd36b'; for (let x = x0 + 6; x < x1; x += 9) g.fillRect(x + Math.round(Math.sin(time * 9 + x) * 2), y - 8 - ((time * 30 + x) % 10), 1, 2); if (T) T('!!', Math.round((x0 + x1) / 2), y - 20, '#ff6b6b', 'center', 8); }
    if (q.st === 'burn') for (let x = x0; x < x1; x += 3) { const h = Math.round(FT2.flare.h * (0.6 + 0.4 * Math.sin(time * 20 + x * 0.7))); g.fillStyle = C.flame[0]; g.fillRect(x, y - h, 3, h); g.fillStyle = C.flame[1]; g.fillRect(x, y - Math.round(h * 0.7), 2, Math.round(h * 0.7)); g.fillStyle = C.flame[2]; g.fillRect(x, y - Math.round(h * 0.35), 1, Math.round(h * 0.35)); } }
  // ---- THE SPILLS ----
  for (const z of F.syrup || []) { const x0 = Math.round(z.x0 * TS - cx), w = (z.x1 - z.x0 + 1) * TS, y = Math.round(z.row * TS - cy); if (x0 > VW || x0 + w < 0 || y < -20 || y > VH + 20) continue;
    g.fillStyle = C.syrup[0]; g.fillRect(x0, y - 2, w, 3); g.fillStyle = C.syrup[1]; g.fillRect(x0 + 1, y - 2, w - 2, 1); for (let i = 0; i < w; i += 7) { const ph = (time * 1.4 + i * 0.13) % 1; g.fillStyle = C.syrup[2]; g.fillRect(x0 + i + 2, y - 3 - Math.round(ph * 4), 1, 1); } }
  for (const [tx, ty] of F.fizz || []) { const x = Math.round(tx * TS - cx), y = Math.round(ty * TS - cy); if (x < -20 || x > VW + 20 || y < -30 || y > VH + 30) continue;
    g.fillStyle = '#2e2a3a'; g.fillRect(x, y, 16, 16); g.fillStyle = '#4a4458'; g.fillRect(x, y + 4, 16, 1);   /* the stone the fizz spilled on (over the engine's springy-cap tile) */
    g.fillStyle = C.fizz[0]; g.fillRect(x, y, 16, 4); g.fillStyle = C.fizz[1]; g.fillRect(x + 1, y, 14, 2); for (let i = 0; i < 3; i++) { const ph = (time * 2 + i * 0.33) % 1; g.fillStyle = C.fizz[2]; g.fillRect(x + 3 + i * 5, y - Math.round(ph * 10), 2, 2); } }
  // ---- THE TREASURY'S FLOOR: the gold on it, the arrows of its lean, the chests ----
  if (F.tilt) { const Z = F.tilt, Tq = R.tilt, y = Math.round(Z.row * TS - cy), x0 = Math.round(Z.x0 * TS - cx), x1 = Math.round((Z.x1 + 1) * TS - cx);
    if (y > -40 && y < VH + 40) { const dir = Tq.st === 'lean' ? Tq.dir : Tq.st === 'tell' ? Tq.dir : 0, run = (time * 50) % 16;
      g.fillStyle = C.gold[1]; for (let x = x0 + 4; x < x1; x += 11) { const off = Math.round(dir * Tq.k * ((time * 40 + x) % 9)); g.fillRect(x + off, y - 2, 3, 2); g.fillStyle = C.gold[2]; g.fillRect(x + off + 1, y - 3, 1, 1); g.fillStyle = C.gold[1]; }
      if (dir) { g.fillStyle = Tq.st === 'tell' ? (Math.floor(time * 10) % 2 ? '#ffffff' : '#ffd36b') : '#ffd36b'; for (let x = x0 + 8; x < x1 - 8; x += 48) { const ax = Math.round(x + dir * run); for (let j = 0; j < 4; j++) { g.fillRect(ax - dir * j, y + 4 - j, 1, 1); g.fillRect(ax - dir * j, y + 4 + j, 1, 1); } } }
      for (const ch of R.chests) { const x = Math.round(ch.x - cx); g.fillStyle = '#4a2c18'; g.fillRect(x - 7, y - 10, 14, 10); g.fillStyle = '#7a4a28'; g.fillRect(x - 7, y - 10, 14, 3); g.fillStyle = C.gold[1]; g.fillRect(x - 7, y - 7, 14, 1); g.fillRect(x - 1, y - 8, 2, 3);
        if (Math.abs(ch.vx) > 20) { g.fillStyle = '#ff6b6b'; g.fillRect(x - 1, y - 18, 2, 4); g.fillRect(x - 1, y - 13, 2, 1); } } } }
  // ---- THE OUTER FACE: the drop, the rain (leaning with the tower), the wind, the lightning ----
  if (F.outer) { const O = F.outer, x0 = Math.round(O.x0 * TS - cx), x1 = Math.round((O.x1 + 1) * TS - cx), yd = Math.round(O.drop * TS - cy);
    if (x1 > 0 && x0 < VW) { const G = R.gust, B = R.bolt;
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(4,4,10,' + (0.15 + i * 0.12).toFixed(2) + ')'; g.fillRect(x0, yd - 24 + i * 8, x1 - x0, 8); }
      g.fillStyle = '#04040a'; g.fillRect(x0, yd + 24, x1 - x0, Math.max(0, VH - yd - 24));   /* THE DROP: black */
      if (T && P && inOuter(F, P) && yd < VH) T('THE DROP', Math.round((x0 + x1) / 2), yd + 10, '#9a8aa8', 'center', 6);
      const lean = (F.lean || 0) * 0.05 + (G.st === 'blow' ? G.dir * 0.5 : 0);
      g.fillStyle = 'rgba(160,170,200,0.35)'; for (let i = 0; i < 40; i++) { const s = Math.sin(i * 91.7) * 43758.5, r = s - Math.floor(s), rx = x0 + ((r * 997 + time * 40 * lean * 10) % (x1 - x0) + (x1 - x0)) % (x1 - x0), ry = ((time * 260 + r * 900) % (VH + 20)) - 10; g.fillRect(Math.round(rx), Math.round(ry), 1, 5); }
      if (G.st === 'tell' || G.st === 'blow') { const k = G.st === 'blow' ? 1 : 1 - G.t / FT2.gust.tell; g.fillStyle = 'rgba(220,230,255,' + (0.25 + 0.4 * k).toFixed(2) + ')';
        for (let i = 0; i < 14; i++) { const yy = ((i * 53 + 17) % VH), xx = ((time * 260 * G.dir + i * 97) % (x1 - x0) + (x1 - x0)) % (x1 - x0) + x0; g.fillRect(Math.round(xx), yy, Math.round(10 + 14 * k), 1); }
        if (T && inOuter(F, P)) T(G.dir < 0 ? '<<< WIND' : 'WIND >>>', Math.round((x0 + x1) / 2), 24, Math.floor(time * 8) % 2 ? '#ffffff' : '#c8d8ff', 'center', 8); }
      for (const [lx, len, row] of O.ledges || []) { const fx = Math.round((lx + (lx < (O.x0 + O.x1) / 2 ? 0 : len - 1)) * TS - cx) + 6, fy = Math.round(row * TS - cy);   /* a flag on every scaffold: it streams the way the wind will blow */
        if (fy < -30 || fy > VH + 10) continue; g.fillStyle = '#6a5a48'; g.fillRect(fx, fy - 18, 1, 18); const d = G.st === 'calm' ? 0.3 : G.dir, wav = Math.round(Math.sin(time * (G.st === 'calm' ? 3 : 14)) * 1.5);
        g.fillStyle = '#c9463d'; g.fillRect(d > 0 ? fx + 1 : fx - 7, fy - 18 + wav, 7, 4); }
      if (B.st === 'tell' || B.st === 'flash') { const bx = Math.round(B.x - cx), by = Math.round(B.y - cy), k = B.st === 'flash' ? 1 : 1 - B.t / FT2.bolt.tell;
        g.fillStyle = B.st === 'flash' ? '#ffffff' : 'rgba(220,230,255,' + (0.12 + 0.25 * k).toFixed(2) + ')'; g.fillRect(bx - FT2.bolt.half, B.st === 'flash' ? 0 : by - 140, FT2.bolt.half * 2, B.st === 'flash' ? by : 140);
        if (B.st === 'tell') { g.fillStyle = Math.floor(time * 12) % 2 ? '#ffffff' : '#c8d8ff'; g.fillRect(bx - FT2.bolt.half, by - 1, FT2.bolt.half * 2, 1); if (T) T('!!', bx, by - 22, '#ff6b6b', 'center', 8); } } } }
  // ---- THE TELESCOPE AND THE CHUNK ----
  for (const m of movers || []) { if (!m.ft2) continue; const x = Math.round(m.x - cx), y = Math.round(m.y - cy); if (x < -260 || x > VW + 260 || y < -260 || y > VH + 260) continue;
    if (m.role === 'scope') { const px = Math.round(m.px - cx), py = Math.round(m.py - cy), ex = x + m.w / 2;
      g.strokeStyle = C.brass[0]; g.lineWidth = 7; g.beginPath(); g.moveTo(px, py); g.lineTo(ex, y + 4); g.stroke(); g.strokeStyle = C.brass[1]; g.lineWidth = 4; g.stroke(); g.lineWidth = 1;   /* the tube */
      g.fillStyle = '#3a2e1c'; g.fillRect(px - 8, py - 4, 16, 12); g.fillStyle = C.brass[2]; g.fillRect(px - 3, py - 2, 6, 6);   /* its mount */
      g.fillStyle = C.brass[0]; g.fillRect(x, y, m.w, 6); g.fillStyle = C.brass[2]; g.fillRect(x, y, m.w, 2);   /* the eyepiece platform */
      const k = Math.cos(m.ang - (m.a0 + m.a1) / 2) ; void k; }
    if (m.role === 'chunk') { const S = R.snap, tip = Math.round(m.tip || 0);
      g.fillStyle = '#3a3448'; g.fillRect(x, y + tip, m.w, 22); g.fillStyle = '#5a5470'; g.fillRect(x, y + tip, m.w, 3); g.fillStyle = '#2a2638'; for (let i = 8; i < m.w; i += 16) g.fillRect(x + i, y + 4 + tip, 1, 16);
      g.fillStyle = '#4a4458'; g.fillRect(x + 4, y - 10 + tip, 9, 10); g.fillRect(x + m.w - 13, y - 10 + tip, 9, 10);   /* its merlons */
      if (S.st === 'wait') { g.strokeStyle = Math.floor(time * 6) % 2 ? '#ffd36b' : '#ffffff'; g.beginPath(); g.moveTo(x - 2, y + 22); g.lineTo(x + 6, y + 10); g.lineTo(x + 2, y); g.stroke(); if (T && P && Math.abs(P.y - m.y) < 120 && Math.abs(P.x - (m.x + m.w / 2)) < 160) T('LOOSE: STEP ON IT', x + m.w / 2, y - 22, '#ffd36b', 'center', 6); }   /* the crack it will go on */ } }
}
