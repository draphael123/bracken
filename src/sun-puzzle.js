// src/sun-puzzle.js - SUN / LIGHT PUZZLE PIECES as level DATA (claude/desertkit 11-05; scratch/plan-desert-1105.md 3a/3j, Q5). Pure: no DOM, no main.js.
// Proved by tools/sun-puzzle.mjs; the level API is docs/desertkit.md.
//
// NOT A NEW LIGHT. The model is src/light.js (whole tiles: a beam runs a row or a column from a SOURCE, turns 90 degrees at a '/' or '\' MIRROR, stops at
// anything opaque, powers the RECEIVER it reaches; sunlight burns the dead; solve() proves a room). Drawing the path is the beam-path module's job (the Colossus 4
// lane builds it 11-06 on light.js): this kit hands it the segments. What the kit adds is the ROOM: the pieces a level declares and the rules between them -
//   * SUN-DOORS answer to the SUN ONLY (Daniel 09-21, plan 3j): a sun source's beam on the door's eye opens it. 'latch' stays open; 'hold' stays open only
//     while lit and is TOLD before it shuts (DOOR.tell s of shaking, then shut - it never shuts on a body: it waits);
//   * PRIEST CACHES (plan Q5 REC, one optional per light level): only THE DESERT PRIEST's beam (his own light, never the sun) on the cache eye opens it.
//     A cache is never on the way through (the lint: its box is flagged optional and no sun-door opens only through it);
//   * SUN-LAMPS: either light lights them (they are for sight and for the dead, never a door);
//   * MIRRORS turn on a STRIKE: any hero's blow box or any hero's SHOT on the mirror's tile turns it (so every hero, melee or ranged, and every seat - the
//     room is shared); MIRROR.cd s between turns so one swing's frames do not double-turn; fixed mirrors (turnable false) never turn;
//   * THE MOVING SUN: a source with windows + day (the Sun Temple's "THE SUN MOVES") is light.js templeSun on the room's clock;
//   * DOORS ARE OPAQUE while shut and let light through when open (a door can feed the next mirror: chains);
//   * the BURN: undead bodies standing in SUN light burn (light.js burn); the priest's beam burns through his own kit, not here.
//
// L.sunRooms = [{ id, box, sources: [{ x, y, dir } | { windows: [{x,y,dir}], day }], mirrors: [{ x, y, state, turnable? }],
//                 doors: [{ id, kind: 'sun' | 'cache' | 'lamp', eye: [x, y], opens: [x0, y0, x1, y1], mode: 'latch' | 'hold', optional? }] }]  (tiles)
//   const R = sunRoomsInit(L)                     -> { rooms: [{ def, mirrors (live copies), doors: [{ ...def, open, lit, shutT }], clock }] }
//   sunRoomsStep(R, dt, io)                       -> events [{ room, id, ev: 'open' | 'tell' | 'shut' | 'lamp' }]  io = { tileAt, opaque, priestBeams: [{x,y,dir}], bodyIn(box) }
//   strikeMirrors(R, box, io?)                    -> the mirrors turned by a blow box / a shot box [l, t, r, b] px
//   gridOf(R, base)                               -> tileAt with every shut door's tiles solid (for main.js's collision and the trace)
//   sunBurn(R, body, dt)                          -> damage for an undead body standing in this room's SUN light
//   solveRoom(def, tileAt, opaque)                -> { turns, turn: [[x, y]...] } | null : the fewest mirror turns that open every sun-door (latched chains)
//   lintSunRooms(L, tileAt, opaque)               -> [] or the problems
import { trace, templeSun, burn as lightBurn } from './light.js';

export const TS = 16;
export const MIRROR = { cd: 0.3 };
export const DOOR = { tell: 0.8 };
const key = (x, y) => x + ',' + y;
const doorTiles = d => { const o = []; for (let y = d.opens[1]; y <= d.opens[3]; y++) for (let x = d.opens[0]; x <= d.opens[2]; x++) o.push([x, y]); return o; };

export function sunRoomsInit(L) {
  return { rooms: (L.sunRooms || []).map(def => ({ def, clock: 0, mirrors: (def.mirrors || []).map(m => ({ ...m, cd: 0 })),
    doors: (def.doors || []).map(d => ({ ...d, mode: d.mode || 'latch', open: !!d.startOpen, lit: false, shutT: 0 })), res: null, pres: null })) };
}
function sourcesOf(room) {
  const out = [];
  for (const s of room.def.sources) { if (s.windows) { const t = templeSun(s.windows, room.clock % s.day, s.day); if (t) out.push(t); } else out.push(s); }
  return out;
}
/* a tile is blocked for light: the level's own opaque, or a shut door's tile */
function blockerOf(room, tileAt, opaque) {
  const shut = new Set(); for (const d of room.doors) if (!d.open && d.kind !== 'lamp') for (const [x, y] of doorTiles(d)) shut.add(key(x, y));
  return { tileAt: (x, y) => shut.has(key(x, y)) ? -1 : tileAt(x, y), opaque: t => t === -1 || opaque(t) };
}
function traceRoom(room, srcs, tileAt, opaque, kinds) {
  const B = blockerOf(room, tileAt, opaque), eyes = room.doors.map((d, i) => ({ x: d.eye[0], y: d.eye[1], i, kind: d.kind })).filter(e => kinds.includes(e.kind));
  const r = trace(B.tileAt, srcs, room.mirrors, eyes, { opaque: B.opaque });
  return { ...r, eyesHit: new Set([...r.hit].map(k => eyes[k].i)) };
}
export function sunRoomsStep(R, dt, io) {
  const ev = [];
  for (const room of R.rooms) {
    room.clock += dt; for (const m of room.mirrors) m.cd = Math.max(0, m.cd - dt);
    /* the SUN: iterate to a fixpoint so a door opened this frame lets its light through to the next (latched chains open in one frame) */
    let res, guard = 0;
    for (;;) { res = traceRoom(room, sourcesOf(room), io.tileAt, io.opaque, ['sun', 'lamp']); let changed = false;
      for (const i of res.eyesHit) { const d = room.doors[i]; if (d.kind === 'sun' && !d.open) { d.open = true; d.shutT = 0; changed = true; ev.push({ room: room.def.id, id: d.id, ev: 'open' }); } }
      if (!changed || ++guard > 8) break; }
    room.res = res;
    /* the PRIEST's beam: only caches and lamps answer it */
    const pres = (io.priestBeams || []).length ? traceRoom(room, io.priestBeams, io.tileAt, io.opaque, ['cache', 'lamp']) : null; room.pres = pres;
    room.doors.forEach((d, i) => {
      const sunLit = res.eyesHit.has(i), priestLit = !!pres && pres.eyesHit.has(i);
      if (d.kind === 'cache' && priestLit && !d.open) { d.open = true; ev.push({ room: room.def.id, id: d.id, ev: 'open' }); }
      if (d.kind === 'lamp') { const lit = sunLit || priestLit; if (lit && !d.lit) ev.push({ room: room.def.id, id: d.id, ev: 'lamp' }); d.lit = lit; }
      if (d.kind === 'sun') { d.lit = sunLit;
        if (d.mode === 'hold' && d.open && !sunLit) {   /* the light has gone off its eye: told, then shut (never on a body) */
          if (d.shutT === 0) ev.push({ room: room.def.id, id: d.id, ev: 'tell' });
          d.shutT += dt;
          if (d.shutT >= DOOR.tell && !(io.bodyIn && io.bodyIn(d.opens))) { d.open = false; d.shutT = 0; ev.push({ room: room.def.id, id: d.id, ev: 'shut' }); }
        } else if (sunLit) d.shutT = 0; }
    });
  }
  return ev;
}
/* A STRIKE: any blow box / shot box [l, t, r, b] px that overlaps a mirror's tile turns it (a cooldown so one swing turns it once) */
export function strikeMirrors(R, b) {
  const turned = [];
  for (const room of R.rooms) for (const m of room.mirrors) {
    if (m.turnable === false || m.cd > 0) continue;
    if (b[0] < (m.x + 1) * TS && b[2] > m.x * TS && b[1] < (m.y + 1) * TS && b[3] > m.y * TS) { m.state = m.state === '/' ? '\\' : '/'; m.cd = MIRROR.cd; turned.push(m); }
  }
  return turned;
}
export function gridOf(R, tileAt, solidT = 1) {
  const shut = new Set(); for (const room of R.rooms) for (const d of room.doors) if (!d.open && d.kind !== 'lamp') for (const [x, y] of doorTiles(d)) shut.add(key(x, y));
  return (x, y) => shut.has(key(x, y)) ? solidT : tileAt(x, y);
}
export const sunBurn = (R, body, dt) => R.rooms.reduce((a, room) => a + (room.res ? lightBurn(room.res, body, dt) : 0), 0);
/* THE PUZZLE CHECK: every setting of the turnable mirrors, sun doors latched to a fixpoint; the fewest turns that open every sun-door */
export function solveRoom(def, tileAt, opaque) {
  const turnable = def.mirrors.map((m, i) => i).filter(i => def.mirrors[i].turnable !== false);
  if (turnable.length > 12) throw new Error('solveRoom: too many mirrors');
  const sunDoors = def.doors.filter(d => d.kind === 'sun').length; let best = null;
  for (const hr of hoursOf(def)) for (let mask = 0; mask < (1 << turnable.length); mask++) {
    const R = sunRoomsInit({ sunRooms: [def] }), room = R.rooms[0];
    turnable.forEach((mi, b) => { if ((mask >> b) & 1) { const m = room.mirrors[mi]; m.state = m.state === '/' ? '\\' : '/'; } });
    room.clock = hr.clock; sunRoomsStep(R, 0, { tileAt, opaque });
    if (room.doors.filter(d => d.kind === 'sun' && d.open).length === sunDoors) {
      const turns = turnable.filter((_, b) => (mask >> b) & 1).length;
      if (!best || turns < best.turns) best = { turns, hour: hr.hour, turn: turnable.filter((_, b) => (mask >> b) & 1).map(i => [def.mirrors[i].x, def.mirrors[i].y]) };
    }
  }
  return best;
}
/* (claude/suntemple) THE MOVING SUN's HOURS: a room whose source is a row of windows (the Sun Temple's "THE SUN MOVES") is solved at every hour of its day - the
   window the sun stands in - not only at clock 0. A room with fixed sources has one hour (clock 0), exactly as before. */
export function hoursOf(def) {
  const s = (def.sources || []).find(q => q.windows && q.windows.length && q.day > 0);
  if (!s) return [{ hour: 0, clock: 0 }];
  return s.windows.map((_, i) => ({ hour: i, clock: (i + 0.5) * s.day / s.windows.length }));
}
/* every hour a room's sun-doors can be opened at, and the fewest turns at each (the Sun Temple's lint: timing matters - some hours, not all) */
export function hoursOpen(def, tileAt, opaque) {
  const out = [];
  for (const hr of hoursOf(def)) { const one = solveRoom({ ...def, sources: def.sources.map(s => (s.windows ? { ...s, windows: [s.windows[hr.hour]], day: 1e9 } : s)) }, tileAt, opaque); if (one) out.push({ hour: hr.hour, turns: one.turns }); }
  return out;
}
/* THE LEVEL CHECK */
export function lintSunRooms(L, tileAt, opaque, o = {}) {
  const bad = [], ids = new Set(), standable = o.standable || (t => t === 1 || t === 2), solid = o.solid || (t => t === 1);
  for (const def of L.sunRooms || []) {
    const id = def.id || '?'; if (!def.id || ids.has(def.id)) bad.push('sun room needs a unique id: ' + id); ids.add(def.id);
    for (const d of def.doors) { if (!['sun', 'cache', 'lamp'].includes(d.kind)) bad.push(id + '/' + d.id + ': kind ' + d.kind);
      if (d.kind === 'cache' && !d.optional) bad.push(id + '/' + d.id + ': a priest cache must be optional (never on the way through)');
      if (d.kind === 'sun' && d.optional) bad.push(id + '/' + d.id + ': a sun-door is the way through, not optional');
      if (d.kind !== 'lamp' && !d.opens) bad.push(id + '/' + d.id + ': opens what?'); }
    if (!def.doors.some(d => d.kind === 'sun') && !def.doors.some(d => d.kind === 'lamp')) bad.push(id + ': no sun-door or lamp');
    if (!tileAt) continue;
    const sol = solveRoom(def, tileAt, opaque);
    if (def.doors.some(d => d.kind === 'sun')) {
      if (!sol) bad.push(id + ': no mirror setting opens every sun-door');
      else if (sol.turns === 0 && !def.solved) bad.push(id + ': solved as it stands (no turn needed)');
    }
    /* the priest's cache can be reached by his beam from somewhere he can stand (a row or a column with clear sight, mirrors as they start or turned) */
    for (const d of def.doors.filter(q => q.kind === 'cache')) { if (!cacheReach(def, d, tileAt, opaque, standable, solid)) bad.push(id + '/' + d.id + ': no footing where the priest\'s beam reaches the cache eye'); }
    /* every turnable mirror can be struck: a standable tile within reach (2 tiles across, the mirror at body height: 1 or 2 rows over the footing) */
    for (const m of def.mirrors) { if (m.turnable === false) continue; let can = false;
      for (let dx = -2; dx <= 2 && !can; dx++) for (const dy of [1, 2]) { const t = tileAt(m.x + dx, m.y + dy); if (standable(t) && !solid(tileAt(m.x + dx, m.y + dy - 1))) can = true; }
      if (!can) bad.push(id + ': mirror ' + m.x + ',' + m.y + ' cannot be struck from footing'); }
  }
  return bad;
}
/* the priest beam: along his row (E or W) at body height, or UP his column (his UP beam), from any standing spot */
function cacheReach(def, d, tileAt, opaque, standable, solid) {
  const R = sunRoomsInit({ sunRooms: [def] }), room = R.rooms[0];
  const [l, t, r, b] = def.box;
  for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) {
    if (!(standable(tileAt(x, y + 1)) && !solid(tileAt(x, y)))) continue;
    for (const dir of ['E', 'W', 'N']) { const res = traceRoom(room, [{ x, y, dir }], tileAt, opaque, ['cache']); if (res.eyesHit.has(def.doors.indexOf(d))) return true; }
  }
  return false;
}
