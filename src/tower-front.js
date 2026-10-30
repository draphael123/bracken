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
//                                    toward you in sequence (each told: it leans and creaks 1.0 s, its landing red) and lie across the tiers; the last one leans and is held by its cracked
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
import { paintCrack, paintWallBreak, paintButtress, paintActPlate, paintShearCrack, paintShearDust, paintCase, paintCaseLying, paintRib, paintRibDown, paintBell, paintBellImpact, paintPlankTell, paintPlankFall } from './redraw/ft4_art.js';   /* (claude/ft4art) the paint */
const TS = 16;

/* THE FRONT'S SPEC (a src/chase.js spec): landings = [{ row, stop? }] bottom to top - row: the landing's tile row (its top is where you stand);
   stop: the row it waits under until that landing is stood on (default: the landing's own row - the spiral stair's rule). A ride (the telescope,
   the pendulums, the poison stones, a long floor walk) is one landing whose stop is the row the ride starts from: the front never reaches you on it. */
export function frontSpec(o) {
  const caps = o.landings.map(l => ({ reach: l.row * TS - 4, stop: ((l.stop ?? l.row) + 1) * TS + 6 }));
  return { id: o.id, name: o.name, say: o.say, axis: 'y', dir: -1, trigger: o.trigger, end: o.end, gap0: o.gap0 ?? 120,
    curve: o.curve, lead: 1.6, accel: 24, rubber: o.rubber, contact: 'hurt', dmg: o.dmg ?? 21, hold: 1.2, band: true,
    caps, knockTo: o.knockTo, autoscroll: true, edge: 24, show: 28, showKeep: 0.55, glow: 220, look: 'collapse', zone: o.zone, checkpoint: o.checkpoint,
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

/* ---------------- drawing (world space; claude/ft4art paints it - src/redraw/ft4_art.js has every piece) ---------------- */
const R_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
export function ft4Draw(g, L, P, cx, cy, time, T, chases) {
  const F = L && L.ft4; if (!F || !F.rt) return; const R = F.rt, VW = g.canvas.width, VH = g.canvas.height, blink = Math.floor(time * 8) % 2;
  // THE FRONT'S TELL: a crack running ahead of its edge (what goes next), and the tower's stone breaking off both walls in a wave
  for (const ch of chases || []) { if (!ch.sp.ft4 || ch.st.phase !== 'run') continue; const y = Math.round(ch.st.pos - cy) - FT4.front.warn; if (y < -20 || y > VH + 20) continue;
    const x0 = Math.round((F.x0 - (ch.sp.act === 3 ? 11 : 0)) * TS - cx), x1 = Math.round((F.x1 + 1) * TS - cx);
    paintCrack(g, Math.max(0, x0), Math.min(VW, x1), y, time);
    if (x0 > -4) paintWallBreak(g, x0, y + 4, 1, time); if (x1 < VW + 4) paintWallBreak(g, x1, y + 4, -1, time + 0.37); }
  // THE BRACED ROOMS: two stone buttresses with iron bands either side of the shrine
  for (const b of F.braced || []) b.posts.forEach((bx, i) => { const x = Math.round(bx * TS - cx), y = Math.round((b.box[3] + 1) * TS - cy); if (x < -30 || x > VW + 30 || y < -10 || y > VH + 90) return; paintButtress(g, x, y, time, i > 0); });
  // THE ACTS: the tablet that comes up with each act's banner
  for (const n of [1, 2, 3]) { if (!R.seen['act' + n]) continue; R.plated = R.plated || {}; if (R.plated[n] === undefined) R.plated[n] = time; const age = time - R.plated[n]; if (age < 3.7 && n === R.act) paintActPlate(g, Math.round(VW / 2), 36, n, age, time); }
  // THE SET PIECES
  for (const p of F.pieces || []) { const S = R.pieces[p.id]; if (!S) continue;
    if (p.kind === 'shear') { if (S.st === 'run' && S.i === 0) { const k = Math.min(1, S.t / FT4.shear.tell), x = Math.round((p.crack[0] + 0.5) * TS - cx), ya = Math.round((p.crack[2] + 1) * TS - cy), yb = Math.round(ya - (p.crack[2] - p.crack[1] + 1) * TS * k);
        paintShearCrack(g, x, ya, yb, time);
        for (const [x0, x1, row] of p.ledges) for (let xx = x0; xx <= x1; xx++) R_(g, blink ? '#ff6b6b' : '#c9463d', xx * TS - cx + 3, row * TS - cy + 13, 10, 2); }
      if (S.i === 1) { if (S.fxT0 === undefined) S.fxT0 = time; for (const [x0, x1, row] of p.ledges) paintShearDust(g, x0 * TS - cx, (x1 + 1) * TS - cx, row * TS - cy, p.rows ?? FT4.shear.rows, time - S.fxT0); }   /* the drop: its dust and rubble */
      continue; }
    if (p.kind === 'bell') { drawBell(g, F, R, cx, cy, time, p); continue; }
    p.items.forEach((it, i) => { const q = S.items[i], [x0, x1, row] = it.span, sx = Math.round(x0 * TS - cx), w = (x1 - x0 + 1) * TS, sy = Math.round(row * TS - cy); if (sx > VW + 40 || sx + w < -40 || sy < -200 || sy > VH + 200) return;
      const top = Math.round((it.from ?? row - 8) * TS - cy);
      if (q.st === 'wait' || q.st === 'tell' || q.st === 'held') { if (it.look === 'case') drawCase(g, it, q, cx, cy, time); else paintRib(g, sx, top, w, time, q.st === 'tell' || q.st === 'held');   /* the case / the rib, still up */
        if (q.st !== 'wait') { for (let xx = sx; xx < sx + w; xx += 4) R_(g, blink ? '#ff6b6b' : '#c9463d', xx, sy - 2, 2, 2);   /* where it will land, red */
          if (q.st === 'tell') { for (let k = 0; k < 4; k++) R_(g, '#a8987c', sx + ((k * 13 + time * 40) % Math.max(4, w)), top + 4 + ((time * 90 + k * 23) % Math.max(8, sy - top - 4)), 1, 2); }
          if (q.st === 'held' && T) T('STRIKE ITS PILLAR', sx + w / 2, sy - 30, '#ffd36b', 'center', 6); } }
      else if (q.st === 'fall') { const k = 1 - Math.max(0, q.t) / FT4.piece.fallT, yy = Math.round(top + (sy - top) * k * k); if (it.look === 'case') drawCase(g, it, q, cx, cy, time, it.dir * Math.PI / 2 * k * k); else paintRib(g, sx, yy, w, time, false, k); }   /* a case goes over on its foot, books flying; a rib drops */
      else if (it.look === 'case') paintCaseLying(g, sx, sy, w);   /* a toppled case: lying across, its books spilled */
      else paintRibDown(g, sx, sy, w, time, !!it.slick); });   /* a fallen rib: brass across the gap, rimed with his frost */
  }
  // THE OUTER FACE PEELS: a plank near the front works loose and wears red; one that went tumbles away
  if (F.peel) { const ch = (chases || []).find(q => q.sp.id === F.peel.front); if (ch && ch.st.phase === 'run') for (const [x0, len, row] of F.peel.ledges) { if (R.peeled[x0 + ',' + row]) continue;
      if (row * TS - ch.st.pos < FT4.peel.rattle && row * TS > ch.st.pos) paintPlankTell(g, Math.round(x0 * TS - cx), Math.round(row * TS - cy), len * TS, time); }
    for (const k in R.peeled) { const q = R.peeled[k]; paintPlankFall(g, q.x0 * TS - cx, q.row * TS - cy, q.len * TS, q.t); } }
}
function drawCase(g, it, q, cx, cy, time, ang) {   /* a free-standing bookcase: in its tell it leans and shakes toward where it will lie; falling, its books come off */
  const bx = Math.round((it.col + 0.5) * TS - cx), by = Math.round(it.base * TS - cy), h = it.h * TS, lean = ang ?? (q.st === 'tell' || q.st === 'held' ? (q.st === 'held' ? 0.35 : 0.12 + 0.1 * Math.sin(time * 30)) * it.dir : 0);
  paintCase(g, bx, by, h, lean, time, ang !== undefined ? Math.min(1, Math.abs(ang) / (Math.PI / 2)) : q.st === 'held' ? 0.25 : 0, it.dir);
}
function drawBell(g, F, R, cx, cy, time, p) {
  const B = R.bell; if (!F.bell) return;
  const deckY = p.deck * TS, s0 = F.bell.y * TS, hit = deckY - 24, v0 = deckY - 94, vh = deckY - 60,   /* drawn LOWER than its data (the greybox hung it 8 rows up, off the top of the screen): hung with its lip a head's height over the deck, its lip meeting the deck as it breaks it */
    vy = B.y <= hit ? v0 + (B.y - s0) * (vh - v0) / (hit - s0) : vh + (B.y - hit), x = Math.round(F.bell.x * TS + 8 - cx), ct = Math.round(F.bell.chain * TS - cy), y = Math.round(vy - cy);
  if (B.hitDeck) { if (R.bellHitT === undefined) R.bellHitT = time; paintBellImpact(g, x, Math.round(deckY - cy), Math.round(p.bays[0] * TS - cx), Math.round((p.bays[1] + 1) * TS - cx), time - R.bellHitT); }
  else if (B.st === 'hang' || B.st === 'tell') R.bellHitT = undefined;
  if (B.st === 'tell' && p) { const yy = Math.round(deckY - cy); for (let xx = p.bays[0] * TS; xx < (p.bays[1] + 1) * TS; xx += 5) R_(g, Math.floor(time * 8) % 2 ? '#ff6b6b' : '#c9463d', Math.round(xx - cx), yy - 2, 3, 2); }   /* the deck it will break, told red */
  if (ct > -40 && ct < g.canvas.height + 40) { R_(g, '#1c1a24', x - 7, ct - 3, 14, 5); R_(g, '#5a5a68', x - 7, ct - 3, 14, 1); R_(g, '#e6c46a', x - 2, ct - 1, 4, 2); }   /* the iron bracket it hangs from */
  if (B.st === 'down') { if (ct > -40 && ct < g.canvas.height + 40) for (let k = 0; k < 3; k++) R_(g, '#2a2832', x - 1 + Math.round(Math.sin(time * 3 + k) * (k + 1) * 0.6), ct + 2 + k * 4, 2, 3); return; }   /* the snapped chain end swinging */
  if (y < -90 || y > g.canvas.height + 90) return;
  const sw = B.st === 'tell' ? Math.sin(time * 14) * (0.03 + 0.07 * (1 - Math.max(0, B.t) / FT4.bell.tell)) : B.st === 'hang' ? Math.sin(time * 0.9) * 0.012 : 0;
  g.save(); g.translate(x, ct); g.rotate(sw); paintBell(g, 0, y - ct, 0, time, B.st, 0); g.restore();
  if (B.st === 'fall') { g.fillStyle = 'rgba(168,152,124,0.35)'; for (let i = 0; i < 6; i++) g.fillRect(x - 24 + i * 9, y - 24 - ((time * 200 + i * 31) % 60), 2, 7); }   /* the dust it drags */
}
