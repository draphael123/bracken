// src/kp-rooms.js - THE KING'S PYRAMID's ROOMS as pure state (claude/kingspyramid, 11-06). No DOM, no main.js: src/kp-hands.js binds it to the world, and
// tools/kings-pyramid.mjs proves it. The level's data is L.kp (src/kings-pyramid.js). The mirror room is NOT here: it is src/sun-puzzle.js's L.sunRooms (the desert kit),
// already wired by src/sunroom-hands.js and drawn by src/beam-path.js - this module only reads whether its key door has opened.
//
// THE PIECES (tiles unless px is said):
//   LINEN      walls of tomb linen: FIRE within KR.fireR of a cell sets the wall BURNING (told: KR.burnT s of flame), then it is gone (the cells -> air)
//   CRACKED    cracked masonry (a wall, or the BRACKET a ledge hangs on): a KEG blast within KR.blastR breaks it; a bracket DROPS its hung ledge to its 'to' row
//   WEIGHTS    a counterweight hung high on a rope tied to a CLEAT at body height: strike the cleat, the weight falls (KR.fallT), its chain lifts its GATE for good
//   GATES      cells a weight or a switch opens (for good)
//   PRESSES    SLIDING presses (spiked stone that slides out along an axis from a wall niche - never a falling pillar, plan s2): rest -> TELL (rumble, dust) -> slide ->
//              hold -> back. Auto ones run a cycle; a JAM switch stops them for its jamT (told by the ticking); manual ones fire when their switch is struck
//   SWITCHES   struck (any blow box on the tile): jams presses / opens a gate / fires a press / raises a spike floor / opens a sun shutter. KR.swCd between strikes
//   SPIKES     a spike floor a switch raises for its upT (told KR.spikeTell rising first)
//   SHUTTERS   a sun shutter a switch opens for openT: its column is lit (the light burns THE DEATHLESS)
//   THE DEATHLESS  dead no blow kills (src/kp-hands.js turns every blow): only the tomb - a press's box, raised spikes, a lit shutter column - DOOMS one.
//              All of the room's dead doomed -> its gate opens.
//   KEYS       one per room; THE GREAT DOOR opens when all five are carried
//   THE DESCENT  the lift's ride: TOLD DEBRIS (KR.debrisWarn s of a ring + dust on the deck, then the stone; heroes only) on a schedule by the ride's progress,
//              and BOARDERS only at the ends (an alcove's foe hops on, told, when the deck passes its alcove)
export const KR = { fireR: 1, burnT: 1.0, blastR: 2, fallT: 0.5, swCd: 0.4, spikeTell: 0.5, pressTell: 0.6, pressSlide: 0.25, pressHold: 0.6, pressBack: 0.8,
  debrisWarn: 0.9, debrisFall: 0.35, debrisDmg: 28, debrisW: 18, boardTell: 0.5, boardNear: 40 };
/* the debris schedule: [progress 0..1 down the shaft, offset (px) across the deck from its left edge] - told, never on both halves at once */
export const DEBRIS = [[0.18, 16], [0.3, 48], [0.42, 24], [0.52, 52], [0.6, 10], [0.68, 40], [0.76, 20], [0.84, 50]];
const cellsOf = b => { const o = []; for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) o.push([x, y]); return o; };
const boxCells = ([x0, y0, x1, y1]) => cellsOf({ x0, y0, x1, y1 });

export function kpInit(L) {
  const K = L.kp;
  return {
    linen: K.linen.map(l => ({ ...l, st: 'whole', t: 0 })),
    cracked: K.cracked.map(c => ({ ...c, st: 'whole' })),
    hung: K.hung.map(h => ({ ...h, dropped: false })),
    weights: K.weights.map(w => ({ ...w, st: 'hung', t: 0 })),
    gates: K.gates.map(g => ({ ...g, open: false })),
    presses: K.presses.map(p => ({ ...p, st: 'rest', t: p.cycle ? p.cycle * 0.5 + (p.phase || 0) : 0, jam: 0, act: 0 })),
    switches: K.switches.map(s => ({ ...s, cd: 0 })),
    spikes: K.spikeFloors.map(s => ({ ...s, st: 'down', t: 0 })),
    racks: K.racks.map(r => ({ ...r, has: true, t: 0 })),
    shutters: K.shutters.map(s => ({ ...s, open: 0 })),
    doomed: new Set(), keys: new Set(), door: false, roomDone: {},
    ride: { k: 0, debris: DEBRIS.map(([k, dx]) => ({ k, dx, st: 'wait', t: 0 })), boarded: new Set(), on: false },
    n: { burned: 0, blasts: 0, broke: 0, drops: 0, weights: 0, strikes: 0, jams: 0, doomed: 0, keys: 0, debris: 0, boards: 0 },
  };
}
/* ---------- the verbs (each returns the events: { ev, ... } the hands turn into cells, words and sounds) ---------- */
export function fireAt(R, tx, ty) {
  const out = [];
  for (const l of R.linen) { if (l.st !== 'whole') continue;
    if (tx >= l.x0 - KR.fireR && tx <= l.x1 + KR.fireR && ty >= l.y0 - KR.fireR && ty <= l.y1 + KR.fireR) { l.st = 'burning'; l.t = KR.burnT; out.push({ ev: 'burning', id: l.id, x: l.x0, y: l.y0 }); } }
  return out;
}
export function blastAt(R, tx, ty) {
  const out = []; R.n.blasts++;
  for (const c of R.cracked) { if (c.st !== 'whole') continue;
    const dx = Math.max(c.x0 - tx, 0, tx - c.x1), dy = Math.max(c.y0 - ty, 0, ty - c.y1);
    if (dx <= KR.blastR && dy <= KR.blastR) { c.st = 'gone'; R.n.broke++; out.push({ ev: 'break', id: c.id, cells: cellsOf(c), x: c.x0, y: c.y0 });
      if (c.drops) { const h = R.hung.find(q => q.id === c.drops); if (h && !h.dropped) { h.dropped = true; R.n.drops++; const from = [], to = []; for (let x = h.x0; x <= h.x1; x++) { from.push([x, h.y]); to.push([x, h.to]); }
        out.push({ ev: 'drop', id: h.id, from, to, x: h.x0, y: h.to }); } } } }
  return out;
}
/* a blow box [l, t, r, b] px: cleats and switches it covers */
export function strikeAt(R, b, TS = 16) {
  const out = [], hit = (x, y) => b[0] < (x + 1) * TS && b[2] > x * TS && b[1] < (y + 1) * TS && b[3] > y * TS;
  for (const w of R.weights) if (w.st === 'hung' && hit(w.cleat[0], w.cleat[1])) { w.st = 'falling'; w.t = KR.fallT; R.n.weights++; out.push({ ev: 'cleat', id: w.id, x: w.cleat[0], y: w.cleat[1] }); }
  for (const s of R.switches) {
    if (s.cd > 0 || !hit(s.x, s.y)) continue; s.cd = KR.swCd; R.n.strikes++; out.push({ ev: 'switch', id: s.id, x: s.x, y: s.y });
    if (s.jams) for (const id of s.jams) { const p = R.presses.find(q => q.id === id); if (p) { p.jam = s.jamT; if (p.st !== 'rest') { p.st = 'back'; p.t = Math.min(p.t, KR.pressBack); } } R.n.jams++; out.push({ ev: 'jam', ids: s.jams, t: s.jamT, x: s.x, y: s.y }); break; }
    if (s.opens) { const g = R.gates.find(q => q.id === s.opens); if (g && !g.open) { g.open = true; out.push({ ev: 'gate', id: g.id, cells: cellsOf(g), x: g.x0, y: g.y1 }); }
      const sh = R.shutters.find(q => q.id === s.opens); if (sh) { sh.open = sh.openT; out.push({ ev: 'shutter', id: sh.id, x: sh.x, y: sh.y0 }); } }
    if (s.fires) { const p = R.presses.find(q => q.id === s.fires); if (p && p.st === 'rest') { p.st = 'tell'; p.t = KR.pressTell; p.act++; out.push({ ev: 'pressTell', id: p.id }); } }
    if (s.raises) { const sp = R.spikes.find(q => q.id === s.raises); if (sp && sp.st === 'down') { sp.st = 'rising'; sp.t = KR.spikeTell; out.push({ ev: 'spikesTell', id: sp.id, x: sp.x0, y: sp.y }); } }
  }
  return out;
}
/* a press's box now, in tiles [x0, y0, x1, y1] (null at rest) */
export function pressTiles(p) {
  const k = p.st === 'slide' ? 1 - p.t / KR.pressSlide : p.st === 'hold' ? 1 : p.st === 'back' ? p.t / KR.pressBack : 0;
  if (k <= 0) return null;
  const [hx0, hy0, hx1, hy1] = p.home, [ox0, oy0, ox1, oy1] = p.out, lerp = (a, b) => Math.round(a + (b - a) * k);
  return [Math.min(lerp(hx0, ox0), hx0), Math.min(lerp(hy0, oy0), hy0), Math.max(lerp(hx1, ox1), hx1), Math.max(lerp(hy1, oy1), hy1)];
}
export const pressLive = p => p.st === 'slide' || p.st === 'hold';
/* ---------- one step. io = { deathless: [{ id, x, y, w, h }] px, lift: { y, on, x } px, alcoves (from L.kp), sunOpen: id -> bool, TS } ---------- */
export function kpStep(R, dt, io) {
  const out = [], TS = io.TS || 16;
  for (const l of R.linen) if (l.st === 'burning') { l.t -= dt; if (l.t <= 0) { l.st = 'gone'; R.n.burned++; out.push({ ev: 'burned', id: l.id, cells: cellsOf(l), x: l.x0, y: l.y0 }); } }
  for (const w of R.weights) if (w.st === 'falling') { w.t -= dt; if (w.t <= 0) { w.st = 'down'; const from = boxCells(w.box), h = w.box[3] - w.box[1], to = []; for (let y = w.fallTo; y <= w.fallTo + h; y++) for (let x = w.box[0]; x <= w.box[2]; x++) to.push([x, y]);
    out.push({ ev: 'weight', id: w.id, from, to, x: w.box[0], y: w.fallTo }); const g = R.gates.find(q => q.id === w.gate); if (g && !g.open) { g.open = true; out.push({ ev: 'gate', id: g.id, cells: cellsOf(g), x: g.x0, y: g.y1 }); } } }
  for (const s of R.switches) s.cd = Math.max(0, s.cd - dt);
  for (const r of R.racks) if (!r.has) { r.t -= dt; if (r.t <= 0) { r.has = true; out.push({ ev: 'rack', id: r.id }); } }   /* a keg rack fills again (never a soft-lock) */
  for (const p of R.presses) {
    if (p.jam > 0) { p.jam = Math.max(0, p.jam - dt); if (p.jam === 0) out.push({ ev: 'unjam', id: p.id }); }
    if (p.st === 'rest') { if (p.cycle && p.jam <= 0) { p.t -= dt; if (p.t <= 0) { p.st = 'tell'; p.t = KR.pressTell; p.act++; out.push({ ev: 'pressTell', id: p.id }); } } continue; }
    p.t -= dt;
    if (p.st === 'tell' && p.t <= 0) { if (p.jam > 0) { p.st = 'rest'; p.t = p.cycle || 0; } else { p.st = 'slide'; p.t = KR.pressSlide; out.push({ ev: 'pressSlide', id: p.id }); } }
    else if (p.st === 'slide' && p.t <= 0) { p.st = 'hold'; p.t = KR.pressHold; }
    else if (p.st === 'hold' && p.t <= 0) { p.st = 'back'; p.t = KR.pressBack; }
    else if (p.st === 'back' && p.t <= 0) { p.st = 'rest'; p.t = p.cycle || 0; }
  }
  for (const sp of R.spikes) { if (sp.st === 'down') continue; sp.t -= dt;
    if (sp.st === 'rising' && sp.t <= 0) { sp.st = 'up'; sp.t = sp.upT; out.push({ ev: 'spikesUp', id: sp.id }); }
    else if (sp.st === 'up' && sp.t <= 0) { sp.st = 'down'; out.push({ ev: 'spikesDown', id: sp.id }); } }
  for (const sh of R.shutters) if (sh.open > 0) { sh.open = Math.max(0, sh.open - dt); if (sh.open === 0) out.push({ ev: 'shutterShut', id: sh.id }); }
  /* THE DEATHLESS: the tomb dooms them */
  for (const d of io.deathless || []) {
    if (R.doomed.has(d.id)) continue;
    const box = [d.x - d.w / 2, d.y - d.h, d.x + d.w / 2, d.y], inT = ([x0, y0, x1, y1]) => box[0] < (x1 + 1) * TS && box[2] > x0 * TS && box[1] < (y1 + 1) * TS && box[3] > y0 * TS;
    let by = null;
    for (const p of R.presses) if (pressLive(p)) { const t = pressTiles(p); if (t && inT(t)) by = 'press'; }
    for (const sp of R.spikes) if (sp.st === 'up' && inT([sp.x0, sp.y, sp.x1, sp.y])) by = 'spikes';
    for (const sh of R.shutters) if (sh.open > 0 && inT([sh.x, sh.y0, sh.x, sh.y1])) by = 'sun';
    if (by) { R.doomed.add(d.id); R.n.doomed++; out.push({ ev: 'doomed', id: d.id, by, x: d.x, y: d.y }); }
  }
  if (io.deathlessIds && !R.roomDone.deathless && io.deathlessIds.length && io.deathlessIds.every(id => R.doomed.has(id))) {
    R.roomDone.deathless = true; const g = R.gates.find(q => q.id === 'gate3'); if (g && !g.open) { g.open = true; out.push({ ev: 'gate', id: g.id, cells: cellsOf(g), x: g.x0, y: g.y1, say: 'THE DEAD LIE STILL: THE KEY\'S DOOR OPENS' }); } }
  /* THE DESCENT: the ride's progress tells and drops the debris, and the end alcoves' boarders hop on */
  const L = io.lift;
  if (L) {
    R.ride.on = !!L.on; const k = Math.max(0, Math.min(1, (L.y - L.y0) / Math.max(1, L.y1 - L.y0))); R.ride.k = k;
    for (const d of R.ride.debris) {
      if (d.st === 'wait' && L.on && k >= d.k - 0.02 && k < 0.97) { d.st = 'warn'; d.t = KR.debrisWarn; out.push({ ev: 'debrisWarn', x: L.x + d.dx, y: L.y }); }
      else if (d.st === 'warn') { d.t -= dt; if (d.t <= 0) { d.st = 'fall'; d.t = KR.debrisFall; } }
      else if (d.st === 'fall') { d.t -= dt; if (d.t <= 0) { d.st = 'done'; R.n.debris++; out.push({ ev: 'debris', x: L.x + d.dx, y: L.y, w: KR.debrisW, dmg: KR.debrisDmg }); } }
    }
    for (const a of io.alcoves || []) { if (R.ride.boarded.has(a.id)) continue; const ay = (a.y + 1) * TS;
      if (L.on && Math.abs(L.y - ay) < KR.boardNear) { R.ride.boarded.add(a.id); R.n.boards++; out.push({ ev: 'board', id: a.id, side: a.side, x: a.x, y: a.y }); } }
  }
  return out;
}
/* the debris a respawn re-arms (a death on the ride: the stones are told again) */
export function rideReset(R) { R.ride.debris.forEach(d => { d.st = 'wait'; d.t = 0; }); R.ride.boarded = new Set(); R.ride.k = 0; }
export function takeKey(R, id) { if (R.keys.has(id)) return false; R.keys.add(id); R.n.keys++; return true; }
export const doorReady = (R, order) => order.every(id => R.keys.has(id));

/* ---------- THE LEVEL CHECK: every piece where it can be used ---------- */
export function lintKP(L, tileAt, o = {}) {
  const bad = [], K = L.kp, standable = o.standable || (t => t === 1 || t === 2), solid = o.solid || (t => t === 1), inBox = (b, x, y) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
  const roomOf = (x, y) => Object.keys(K.rooms).find(r => inBox(K.rooms[r].box, x, y));
  /* a body-height strike: footing within 2 columns, the piece 1-2 rows over it */
  const struck = (x, y) => { for (let dx = -2; dx <= 2; dx++) for (const dy of [1, 2]) if (standable(tileAt(x + dx, y + dy)) && !solid(tileAt(x + dx, y + dy - 1))) return true; return false; };
  for (const s of K.switches) { if (!struck(s.x, s.y)) bad.push('switch ' + s.id + ' cannot be struck from footing'); if (!roomOf(s.x, s.y)) bad.push('switch ' + s.id + ' is in no room'); }
  for (const w of K.weights) { if (!struck(w.cleat[0], w.cleat[1])) bad.push('cleat ' + w.id + ' cannot be struck'); if (!K.gates.some(g => g.id === w.gate)) bad.push('weight ' + w.id + ' lifts no gate'); }
  for (const p of K.presses) { if (!roomOf(p.home[0], p.home[1]) || !roomOf(p.out[2], p.out[3])) bad.push('press ' + p.id + ' leaves its room'); if (p.manual && !K.switches.some(s => s.fires === p.id)) bad.push('press ' + p.id + ' has no switch'); }
  for (const k of K.keys) { if (solid(tileAt(k.x, k.y)) || !standable(tileAt(k.x, k.y + 1))) bad.push('key ' + k.id + ' does not sit on footing'); if (!roomOf(k.x, k.y)) bad.push('key ' + k.id + ' is in no room'); }
  if (new Set(K.keys.map(k => k.id)).size !== 5 || !K.keyOrder.every(id => K.keys.some(k => k.id === id))) bad.push('five keys, one a room');
  for (const c of K.cracked) if (!solid(tileAt(c.x0, c.y0))) bad.push('cracked ' + c.id + ' is not stone as built');
  for (const l of K.linen) if (!solid(tileAt(l.x0, l.y0))) bad.push('linen ' + l.id + ' is not a wall as built');
  for (const sp of K.spikeFloors) if (!standable(tileAt(sp.x0, sp.y + 1))) bad.push('spike floor ' + sp.id + ' is not on the floor');
  /* THE DEATHLESS: each one's beat crosses a kill (press / spikes / shutter), so the lure is always possible */
  const dl = L.ents.filter(e => e.kp === 'deathless');
  if (dl.length !== 3) bad.push('three deathless (got ' + dl.length + ')');
  for (const e of dl) { const [a, b] = e.guard || [e.x, e.x];
    const kills = K.presses.filter(p => p.room === 'deathless').map(p => [p.out[0], p.out[2]]).concat(K.spikeFloors.map(s => [s.x0, s.x1]), K.shutters.map(s => [s.x, s.x]));
    if (!kills.some(([k0, k1]) => k0 <= b && k1 >= a)) bad.push('deathless ' + e.kpId + ': no kill on its beat ' + a + '-' + b); }
  /* THE DESCENT: debris told >= 0.8 s; boarders only at the ends (the shaft's first or last 14 rows) */
  if (KR.debrisWarn < 0.8) bad.push('debris told under 0.8 s');
  const top = o.shaftTop ?? 44, foot = o.shaftFoot ?? 84;
  for (const a of K.alcoves) if (!(a.y - top <= 14 || foot - a.y <= 14)) bad.push('alcove ' + a.id + ' is mid-shaft (boarders only at the ends)');
  return bad;
}
