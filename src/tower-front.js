// src/tower-front.js - FALLING TOWER 4, LANE B (claude/ft4b; scratch/brief-fallingtower4-1029.md section 2, approved by Daniel 10-29 16:00):
// "THE TOWER COMES DOWN AROUND YOU". Daniel 10-29: the level "lacks character - it's just climbing up"; he wants to FEEL the tower collapsing
// around you while you race to the top. Until FT4 the floors fell BEHIND you, under the screen. Now:
//
//   THREE ACTS    I  THE FIRST CRACK (the Library, the Reading Room)                 the tower is whole; no front: learn the pillars safe
//                 II IT GIVES (the Observatory, the Pendulum Gallery, the Alchemy Lab) the COLLAPSE FRONT rises under you, slowly, a surge a floor
//                 III RACE TO THE TOP (the Bell Loft, the Treasury, the Outer Face)  it rises fast, surges told by banner + thunder
//                 Each act ends in a BRACED ROOM with its shrine (THE BUTTRESS HOLDS): the front stops there (its safe line).
//   THE FRONT     src/chase.js's chaser (proven fair on the spiral stair): a told edge under you - the tower failing - with a rubber band, CAPS
//                 (it never passes the landing over you until you have stood on it; over a ride it waits under the ride's start) and contact
//                 that HURTS and THROWS YOU UP onto the nearest footing (knockTo) - it never kills and never soft-locks (Daniel's pick 10-29 #2).
//                 What it rises past goes: the floors' tiles clear behind its edge (tower-ascent.js updateTowerAscent, frontY), and on the
//                 Outer Face the planks behind you peel off (THE OUTER FACE PEELS). A red crack runs 1 s ahead of its edge (ft4Draw).
//   FIVE SET PIECES (each told, each changes the route visibly; none is a drop-trap):
//                 THE SHELVES GO     (Act I, the Library's upper stacks) a quake; the free-standing bookcases lean (told 1.0 s) and topple
//                                    toward you in sequence and lie across the tiers as low cover; the last one leans and is held by its cracked
//                                    pillar - strike it and it lies down as a stair of its shelves to the rope (lib-top, a ramp).
//                 THE DOME COMES IN  (Act II, the Observatory) as you ride the telescope the dome's ribs break one by one from the far side; each
//                                    lands as a ledge (told 1.0 s): a second stair from the telescope's low step to its high one. FROZEN RIBS
//                                    (the realm floors, 10-14: his ice leaks into the tower) - the ribs are slick.
//                 THE GALLERY SHEARS (Act II, the Pendulum Gallery) once you are on the LAST pendulum, a told crack runs floor to ceiling (2 s
//                                    rumble) and the far half of the room drops two rows: the pendulum lands you on the sheared half. Never
//                                    under your feet - only while you ride.
//                 THE BELL FALLS     (Act III, after the Sexton) the great bell tears loose (told 1.4 s) and smashes down through the bell deck;
//                                    the tower is hollow under you and the front SURGES (Act III's front waits for the bell).
//                 THE OUTER FACE PEELS (Act III) the front comes up the face with you; the planks behind you come off in the wind (told: they
//                                    rattle and wear red as it nears). THE SNAP (exists) is the finish line.
// Pure: no DOM, no main.js globals. main.js calls ft4Update (updateAscent), ft4Draw (drawMageTiles, with ftDraw) and ft4Reset (spawnEntities).
// The level's data is laid by tower-ascent.js (L.ft4). tools/fallingtower4.mjs is its check.
export const FT4 = {
  piece: { tell: 1.0, fallT: 0.42, dmg: 14, gap: 1.1 },   /* a set piece's beats: told 1.0 s, fall 0.42 s, 14 a blow, 1.1 s between items */
  shear: { tell: 2.0, rows: 2 },
  bell: { tell: 1.4, fallV: 520, dmg: 30, half: 22 },
  front: { warn: 18 },   /* px: the red crack the front runs ahead of its edge (1.0 s at Act II's pace) */
  peel: { rattle: 56 },   /* px over the front: an Outer Face plank that close rattles and wears red */
  braced: 'THE BUTTRESS HOLDS: BREATHE',
};
export const FT4_LINES = ['ACT I - THE FIRST CRACK', 'ACT II - IT GIVES', 'ACT III - RACE TO THE TOP', 'THE SHELVES GO', 'THE DOME COMES IN', 'THE GALLERY SHEARS: HOLD ON', 'THE GREAT BELL TEARS LOOSE',
  'THE BELL IS DOWN: THE TOWER GOES', 'THE OUTER FACE PEELS', FT4.braced];
const TS = 16;

/* THE FRONT'S SPEC (a src/chase.js spec): landings = [{ row, stop? }] bottom to top - row: the landing's tile row (its top is where you stand);
   stop: the row it waits under until that landing is stood on (default: the landing's own row - the spiral stair's rule). A ride (the telescope,
   the pendulums, the poison stones, a long floor walk) is one landing whose stop is the row the ride starts from: the front never reaches you on it. */
export function frontSpec(o) {
  const caps = o.landings.map(l => ({ reach: l.row * TS - 4, stop: ((l.stop ?? l.row) + 1) * TS + 6 }));
  return { id: o.id, name: o.name, say: o.say, axis: 'y', dir: -1, trigger: o.trigger, end: o.end, gap0: o.gap0 ?? 120,
    curve: o.curve, lead: 1.6, accel: 24, rubber: o.rubber, contact: 'hurt', dmg: o.dmg ?? 21, hold: 1.2, band: true,
    caps, knockTo: o.knockTo, autoscroll: true, edge: 24, show: 28, showKeep: 0.55, glow: 220, look: 'rock', zone: o.zone, checkpoint: o.checkpoint,
    ft4: true, act: o.act, after: o.after || null, drawZone: o.drawZone || null };
}

/* ---------------- runtime ---------------- */
export function ft4Reset(L, restore) {
  const F = L && L.ft4; if (!F) return;
  if (F.rt && restore) for (const k of F.rt.changed.keys()) { const [x, y] = k.split(',').map(Number); restore(x, y); }
  if (F.rt && F.rt.slick && L.slick) L.slick = L.slick.filter(z => !F.rt.slick.includes(z));
  F.rt = { act: 0, seen: {}, changed: new Map(), slick: [], pieces: Object.fromEntries((F.pieces || []).map(p => [p.id, { st: 'wait', t: 0, i: 0, items: (p.items || []).map(() => ({ st: 'wait', t: 0 })) }])),
    bell: { st: 'hang', t: 0, y: F.bell ? F.bell.y * TS : 0 }, peeled: {}, braced: {} };
}
/* which act a row is in (1..3), 0 outside the tower */
export const actAt = (F, row) => { for (const a of F.acts || []) if (row >= a.top && row <= a.bot) return a.n; return 0; };
const inBox = (b, P) => P.x > b[0] * TS && P.x < (b[1] + 1) * TS && P.y > b[2] * TS && P.y <= (b[3] + 1) * TS;
/* EVERY FRAME. c: { set(x, y, t), tile(x, y), T, hurt(x, dmg, name), say(s), sound(k), shake(n), dust(x, y, n), burst(x, y, n, cols), onMover() -> mover or null,
   sextonDown() -> bool, crumbleBreak(x0, x1, row), front(id) -> chase { sp, st } or null, carry(dy), busy, slick(z) } */
export function ft4Update(L, P, dt, c) {
  const F = L && L.ft4; if (!F) return; if (!F.rt) ft4Reset(L); const R = F.rt; if (P.dead) return;
  const T = c.T, set = (x, y, t) => { const k = x + ',' + y; if (!R.changed.has(k)) R.changed.set(k, c.tile(x, y)); c.set(x, y, t); };
  // ---- THE ACTS: a banner the first time you come into each ----
  const a = actAt(F, Math.floor(P.y / TS));
  if (a && a !== R.act) { R.act = a; if (!R.seen['act' + a]) { R.seen['act' + a] = 1; c.say(F.acts[a - 1].say); c.sound('rumble'); c.shake(a === 3 ? 5 : 3); } }
  // ---- THE BRACED ROOMS: the front stops; the shrine's room is held up ----
  for (const b of F.braced || []) if (!R.braced[b.id] && inBox(b.box, P) && P.ground) { R.braced[b.id] = 1; if (b.say !== false) c.say(FT4.braced); }
  // ---- THE SET PIECES ----
  for (const p of F.pieces || []) { const S = R.pieces[p.id]; if (!S || S.st === 'done') continue;
    if (S.st === 'wait') { if (!pieceGo(p, P, c)) continue; S.st = 'run'; S.t = 0; c.say(p.say); c.sound('rumble'); c.shake(p.shake || 4); }
    S.t += dt;
    if (p.kind === 'shear') { stepShear(p, S, P, dt, c, set); continue; }
    if (p.kind === 'bell') { stepBell(F, p, S, P, dt, c); continue; }
    let all = true;
    p.items.forEach((it, i) => { const q = S.items[i]; if (q.st === 'down') return; all = false;
      if (q.st === 'wait') { if (S.t < (it.at ?? i * FT4.piece.gap)) return; q.st = 'tell'; q.t = it.tell ?? FT4.piece.tell; c.sound('creak'); return; }
      q.t -= dt;
      if (q.st === 'tell' && q.t <= 0) { if (it.hold) { q.st = 'held'; return; } q.st = 'fall'; q.t = FT4.piece.fallT; }
      if (q.st === 'held') { if (!it.hold || !c.supportDown(it.hold)) return; q.st = 'fall'; q.t = FT4.piece.fallT; }
      if (q.st === 'fall' && q.t <= 0) { q.st = 'down'; land(it, P, c, set, R); } });
    if (all) S.st = 'done'; }
  // ---- THE FRONT ON THE OUTER FACE: the planks behind you peel off (and rattle, told, as it nears) ----
  if (F.peel) { const ch = c.front(F.peel.front); if (ch && ch.st.phase === 'run') { const fy = ch.st.pos;
    for (const [x0, len, row] of F.peel.ledges) { const k = x0 + ',' + row; if (R.peeled[k]) continue;
      if (row * TS > fy + 8) { R.peeled[k] = { t: 0, x0, len, row }; if (!R.seen.peel) { R.seen.peel = 1; c.say(F.peel.say); }
        for (let x = x0; x < x0 + len; x++) set(x, row, T.AIR); c.sound('creak'); c.burst((x0 + len / 2) * TS, row * TS + 4, 6, ['#7a4a28', '#4a2c18', '#a8703c']); } } }
    for (const k in R.peeled) R.peeled[k].t += dt; }
}
function pieceGo(p, P, c) {
  if (p.go === 'zone') return inBox(p.zone, P) && P.ground && !c.busy;
  if (p.go === 'mover') { const m = c.onMover(); return !!m && m[p.moverKey] === p.moverVal; }
  if (p.go === 'sexton') return c.sextonDown() && inBox(p.zone, P);
  return false;
}
/* an item lands: its tiles are laid (only into air), and a body under it is struck */
function land(it, P, c, set, R) {
  const T = c.T, [x0, x1, row] = it.span; c.sound('stone'); c.shake(it.shake || 4);
  if (it.lay !== false) { for (let x = x0; x <= x1; x++) if (c.tile(x, row) === T.AIR) set(x, row, T.ONEWAY);
    if (it.slick) { const z = [x0, x1, row]; z.frost = false; R.slick.push(z); c.slick(z); } if (c.resolve) c.resolve(); }
  for (let x = x0; x <= x1; x += 2) c.burst(x * TS + 8, row * TS, 3, it.cols || ['#8a8e9c', '#5c6070', '#b8b4a8']);
  const hb = it.hit || [x0, x1, row - 4, row];
  if (P.x > hb[0] * TS - 6 && P.x < (hb[1] + 1) * TS + 6 && P.y > hb[2] * TS && P.y <= (hb[3] + 1) * TS + 2) c.hurt(P.x, FT4.piece.dmg, it.name || 'FALLING STONE');
}
/* THE GALLERY SHEARS: told 2 s, then every listed ledge drops `rows`; a body on one rides it down; the rope is let down to meet it */
function stepShear(p, S, P, dt, c, set) {
  const T = c.T;
  if (S.i === 0) { if (Math.random() < dt * 18) c.dust((p.crack[0] + 0.5) * TS, (p.crack[1] + Math.random() * (p.crack[2] - p.crack[1])) * TS, 1); if (S.t < FT4.shear.tell) return;
    S.i = 1; const n = p.rows ?? FT4.shear.rows; let carried = false;
    for (const [x0, x1, row] of p.ledges) { const on = P.ground && Math.abs(P.y - row * TS) < 3 && P.x > x0 * TS - 4 && P.x < (x1 + 1) * TS + 4;
      for (let x = x0; x <= x1; x++) { const t = c.tile(x, row); set(x, row, T.AIR); set(x, row + n, t); }
      if (on && !carried) { carried = true; c.carry(n * TS); } }
    for (const [x, y0, y1] of p.rope || []) for (let y = y0; y <= y1; y++) set(x, y, T.NET); if (c.resolve) c.resolve();
    c.sound('stone'); c.sound('rumble'); c.shake(7); for (const [x0, x1, row] of p.ledges) for (let x = x0; x <= x1; x += 2) c.burst(x * TS + 8, (row + n) * TS, 3, ['#8a8e9c', '#5c6070', '#b8b4a8']);
    S.st = 'done'; }
}
/* THE BELL FALLS: told (it swings and its chain glows red), then it drops; the deck under it goes (its bays break), and it smashes on down */
function stepBell(F, p, S, P, dt, c) {
  const B = F.rt.bell, K = FT4.bell;
  if (B.st === 'hang') { B.st = 'tell'; B.t = K.tell; c.sound('creak'); }
  if (B.st === 'tell') { B.t -= dt; if (B.t <= 0) { B.st = 'fall'; c.sound('heavy'); } return; }
  if (B.st === 'fall') { B.y += K.fallV * dt;
    const deckY = p.deck * TS; if (!B.hitDeck && B.y >= deckY - 24) { B.hitDeck = true; c.crumbleBreak(p.bays); c.shake(9); c.sound('stone'); c.burst(F.bell.x * TS + 8, deckY, 18, ['#8a6a1a', '#e0b040', '#5c6070']);
      if (Math.abs(P.x - (F.bell.x * TS + 8)) < K.half && P.y > F.bell.y * TS && P.y <= deckY + 4) c.hurt(P.x, K.dmg, 'THE GREAT BELL'); }
    if (B.y > deckY + 300) { B.st = 'down'; S.st = 'done'; c.say(p.after); c.shake(6); } }
}

/* ---------------- drawing (world space; greybox - ft4art paints it) ---------------- */
const R_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export function ft4Draw(g, L, P, cx, cy, time, T, chases) {
  const F = L && L.ft4; if (!F || !F.rt) return; const R = F.rt, VW = g.canvas.width, VH = g.canvas.height, blink = Math.floor(time * 8) % 2;
  // THE FRONT'S TELL: a red crack running ahead of its edge (what goes next), and the tower's stone breaking off the walls in a wave
  for (const ch of chases || []) { if (!ch.sp.ft4 || ch.st.phase !== 'run') continue; const y = Math.round(ch.st.pos - cy) - FT4.front.warn; if (y < -20 || y > VH + 20) continue;
    const x0 = Math.round((F.x0 - (ch.sp.act === 3 ? 11 : 0)) * TS - cx), x1 = Math.round((F.x1 + 1) * TS - cx);
    for (let x = Math.max(0, x0); x < Math.min(VW, x1); x += 6) { const j = Math.round(Math.sin(x * 0.37 + time * 3) * 2); R_(g, blink ? '#ff6b6b' : '#c9463d', x, y + j, 4, 1); if ((x / 6) % 3 === 0) R_(g, '#ffb070', x + 2, y + j + 1, 1, 2); }
    for (let i = 0; i < 8; i++) { const wx = i % 2 ? x0 + 4 : x1 - 10, yy = y + 6 + ((time * 70 + i * 17) % 40); R_(g, '#726a8a', wx + ((i * 5) % 7), yy, 3, 3); } }
  // THE BRACED ROOMS: two stone buttresses with iron bands either side of the shrine
  for (const b of F.braced || []) for (const bx of b.posts) { const x = Math.round(bx * TS - cx), y = Math.round((b.box[3] + 1) * TS - cy); if (x < -30 || x > VW + 30 || y < -10 || y > VH + 90) continue;
    R_(g, '#3a3448', x, y - 64, 10, 64); R_(g, '#5a5470', x + 1, y - 64, 3, 64); R_(g, '#1c1a24', x, y - 48, 10, 2); R_(g, '#1c1a24', x, y - 20, 10, 2); R_(g, '#8a8e9c', x - 2, y - 66, 14, 3); }
  // THE SET PIECES
  for (const p of F.pieces || []) { const S = R.pieces[p.id]; if (!S) continue;
    if (p.kind === 'shear') { if (S.st === 'run' && S.i === 0) { const k = Math.min(1, S.t / FT4.shear.tell), x = Math.round((p.crack[0] + 0.5) * TS - cx), ya = Math.round((p.crack[2] + 1) * TS - cy), yb = Math.round(ya - (p.crack[2] - p.crack[1] + 1) * TS * k);
        for (let y = ya; y > yb; y -= 3) R_(g, blink ? '#ff6b6b' : '#ffb070', x + Math.round(Math.sin(y * 0.3) * 3), y - 3, 2, 3);
        for (const [x0, x1, row] of p.ledges) for (let xx = x0; xx <= x1; xx++) R_(g, blink ? '#ff6b6b' : '#c9463d', xx * TS - cx + 3, row * TS - cy + 13, 10, 2); }
      continue; }
    if (p.kind === 'bell') { drawBell(g, F, R.bell, cx, cy, time); continue; }
    p.items.forEach((it, i) => { const q = S.items[i], [x0, x1, row] = it.span, sx = Math.round(x0 * TS - cx), w = (x1 - x0 + 1) * TS, sy = Math.round(row * TS - cy); if (sx > VW + 40 || sx + w < -40 || sy < -200 || sy > VH + 200) return;
      const top = Math.round((it.from ?? row - 8) * TS - cy);
      if (q.st === 'wait' || q.st === 'tell' || q.st === 'held') { if (it.look === 'case') drawCase(g, it, q, cx, cy, time); else { R_(g, '#2a2638', sx, top - 4, w, 6); R_(g, '#4a4458', sx + 1, top - 4, w - 2, 2); }   /* the rib / the slab, still up */
        if (q.st !== 'wait') { for (let xx = sx; xx < sx + w; xx += 4) R_(g, blink ? '#ff6b6b' : '#c9463d', xx, sy - 2, 2, 2);   /* where it will land, red */
          if (q.st === 'tell') { for (let k = 0; k < 4; k++) R_(g, '#a8987c', sx + ((k * 13 + time * 40) % Math.max(4, w)), top + 4 + ((time * 90 + k * 23) % Math.max(8, sy - top - 4)), 1, 2); }
          if (q.st === 'held' && T) T('STRIKE ITS PILLAR', sx + w / 2, sy - 30, '#ffd36b', 'center', 6); } }
      else if (q.st === 'fall') { const k = 1 - Math.max(0, q.t) / FT4.piece.fallT, yy = Math.round(top + (sy - top) * k * k); if (it.look === 'case') drawCase(g, it, q, cx, cy, time, it.dir * Math.PI / 2 * k * k); else { R_(g, '#3a3448', sx, yy - 8, w, 8); R_(g, '#726a8a', sx, yy - 8, w, 2); } }   /* a case goes over on its foot; a rib drops */
      else if (it.look === 'case') { R_(g, '#2a1a0e', sx, sy - 13, w, 13); R_(g, '#4a2c18', sx + 1, sy - 12, w - 2, 11); R_(g, '#7a4a28', sx, sy - 13, w, 2); for (let xx = sx + 6; xx < sx + w - 2; xx += 8) R_(g, '#2a1a0e', xx, sy - 11, 1, 10); for (let xx = sx + 2; xx < sx + w - 3; xx += 3) R_(g, ['#8a2a2a', '#2a4a7a', '#6a6a2a', '#5a2a6a'][(xx >> 1) & 3], xx, sy - 10 + ((xx >> 3) & 1) * 4, 2, 4); R_(g, '#e8dcc0', sx + w - 2, sy - 3, 5, 3); }   /* a toppled case: lying across, its books spilled */
      else if (it.slick) { R_(g, 'rgba(190,232,250,0.55)', sx, sy - 1, w, 2); for (let xx = sx + 3; xx < sx + w; xx += 9) R_(g, '#eefaff', xx, sy - 2, 2, 1); } });   /* a fallen rib: rimed with his frost */
  }
  // THE OUTER FACE PEELS: a plank near the front rattles and wears red; one that went falls away
  if (F.peel) { const ch = (chases || []).find(q => q.sp.id === F.peel.front); if (ch && ch.st.phase === 'run') for (const [x0, len, row] of F.peel.ledges) { if (R.peeled[x0 + ',' + row]) continue;
      if (row * TS - ch.st.pos < FT4.peel.rattle && row * TS > ch.st.pos) { const sx = Math.round(x0 * TS - cx + Math.sin(time * 40) * 1.5), sy = Math.round(row * TS - cy); R_(g, blink ? '#ff6b6b' : '#c9463d', sx, sy + 13, len * TS, 2); } }
    for (const k in R.peeled) { const q = R.peeled[k]; if (q.t > 1.2) continue; const sx = Math.round(q.x0 * TS - cx), sy = Math.round(q.row * TS - cy + q.t * q.t * 300); R_(g, '#4a2c18', sx + q.t * 30, sy, q.len * TS, 4); R_(g, '#a8703c', sx + q.t * 30, sy, q.len * TS, 1); } }
}
function drawCase(g, it, q, cx, cy, time, ang) {   /* a free-standing bookcase: in its tell it leans and shakes toward where it will lie */
  const bx = Math.round((it.col + 0.5) * TS - cx), by = Math.round(it.base * TS - cy), h = it.h * TS, lean = ang ?? (q.st === 'tell' || q.st === 'held' ? (q.st === 'held' ? 0.35 : 0.12 + 0.1 * Math.sin(time * 30)) * it.dir : 0);
  g.save(); g.translate(bx, by); g.rotate(lean); R_(g, '#2a1a0e', -8, -h, 16, h); R_(g, '#4a2c18', -7, -h + 1, 14, h - 2);
  for (let y = -h + 4; y < -2; y += 8) { R_(g, '#2a1a0e', -7, y + 6, 14, 1); for (let x = -6; x < 6; x += 3) R_(g, ['#8a2a2a', '#2a4a7a', '#6a6a2a', '#5a2a6a'][((x + y) >> 1) & 3], x, y, 2, 6); }
  g.restore();
}
function drawBell(g, F, B, cx, cy, time) {
  if (!F.bell || B.st === 'down') return; const x = Math.round(F.bell.x * TS + 8 - cx), sw = B.st === 'tell' ? Math.sin(time * 18) * 3 : 0, y = Math.round(B.y - cy);
  if (y < -80 || y > g.canvas.height + 80) return;
  if (B.st !== 'fall') { R_(g, B.st === 'tell' && Math.floor(time * 8) % 2 ? '#ff6b6b' : '#1c1a24', x - 1, Math.round(F.bell.chain * TS - cy), 2, y - Math.round(F.bell.chain * TS - cy)); }   /* its chain to the frame */
  g.save(); g.translate(x + sw, y);
  R_(g, '#5a4420', -4, 0, 8, 4); R_(g, '#8a6a1a', -10, 4, 20, 6); R_(g, '#8a6a1a', -14, 10, 28, 10); R_(g, '#b08a3a', -18, 20, 36, 8); R_(g, '#e6c46a', -16, 20, 4, 8); R_(g, '#3a2e1c', -18, 27, 36, 2); R_(g, '#3a2e1c', -3, 29, 6, 4);   /* the great bell, bronze */
  g.restore();
  if (B.st === 'fall') { g.fillStyle = 'rgba(168,152,124,0.35)'; for (let i = 0; i < 6; i++) g.fillRect(x - 16 + i * 6, y - 20 - ((time * 200 + i * 31) % 60), 2, 6); }   /* the dust it drags */
}
