// src/firedamp.js - FIREDAMP: "THE HOLE BREATHES, AND IT BURNS." (claude/undercrown3, the OPUS greybox; plan-undercrown-1104.md option A,
// Daniel APPROVED 11-04 12:17). PURE: no DOM, no main.js globals - the model only, so node tools (tools/firedamp.mjs) can drive it.
//
// The old diggings are full of firedamp, and it is lighter than air: it gathers UNDER THE ROOF of every chamber as a told band (pale green-grey),
// and the band's DEPTH is how full the chamber is.
//   A CHAMBER   a box of tiles { x0, x1, y0 (its roof row), y1 (the row over its floor) } with a fill 0..1 and a source (fill per second).
//               Full, the band comes down to DUCK_ROOM px over the floor: a DUCKED hero (8 px) is always under it; a standing one (14) is not.
//   A DOOR      joins two chambers (a miners' wind door - a brattice - struck open or shut; or a SLAB's hole). Open, the gas flows from the fuller
//               chamber to the emptier one, by volume. up: true = a hole in a roof: gas only goes UP through it (into b, or out of the mine
//               when b is null). A slab door follows its slab: up = the roof is whole (shut), ramp = the swung end opened a hole (open), flat =
//               the slab DAMS it (shut) - so cutting a post is about the gas route too.
//   A FLAME     in a chamber's band, with the chamber at READY or fuller: a TOLD FUSE (1 s fizz along the roof) and then A BLAST along the band
//               (everything whose top is in it takes it; posts in it crack; a plug in it is blown out). The chamber is emptied and rests a while.
//               Flames: a lit miners' lamp's flame (a floor lamp only meets a band that is nearly full - the gas comes down to it and it goes),
//               a lit lamp STRUCK (it flares FLARE px up), a foe's torch, the pyromancer's ember, THE FIREMAN's candle on a pole, the Prince in P3.
//   THE CANARY  one caged per chamber sings slower as the gas rises and STOPS at READY: the diegetic gauge (canary()).
import { TS } from './level.js';

export const FD = {
  READY: 0.6,       // a flame takes the gas from here up (the canary stops)
  DUCK_ROOM: 10,    // px between a FULL band and the floor (a ducked hero is 8 px)
  FUSE: 1.0,        // s of told fizz between the flame and the blast
  REST: 3.5,        // s a burnt chamber gathers nothing (the smoke clears)
  FLOW: 0.6,        // how fast an open door levels two chambers (per s, by the smaller volume)
  VENT: 0.35,       // how fast a hole out of the mine drains a chamber (share per s)
  LICK: 6,          // px the blast reaches below the band's edge (it rolls)
  FLARE: 64,        // px a struck lit lamp's flame jumps up
  SONG_SLOW: 2.4,   // s between the canary's songs just before READY ...
  SONG_FAST: 0.7,   // ... and in clean air
};

/* the state from a level's spec: { chambers: [{ id, x0, x1, y0, y1, fill?, src?, max? }], doors: [{ id, a, b, open?, up?, slab?, x?, y0?, y1? }],
   plugs: [{ chamber, cells: [[x, y]] }] } */
export function makeFiredamp(spec) {
  const chambers = (spec.chambers || []).map(c => ({ id: c.id, x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1, fill: c.fill || 0, src: c.src || 0, max: c.max ?? 1, fuse: 0, rest: 0, blasts: 0, wasReady: false, on: c.on !== false }));
  const byId = new Map(chambers.map(c => [c.id, c]));
  const doors = (spec.doors || []).map(d => ({ id: d.id, a: d.a, b: d.b ?? null, open: !!d.open, up: !!d.up, slab: d.slab || null, x: d.x, y0: d.y0, y1: d.y1, brattice: !!d.brattice, dam: !!d.dam }));
  return { chambers, byId, doors, plugs: (spec.plugs || []).map(p => ({ chamber: p.chamber, cells: p.cells.slice(), blown: false })), events: [] };
}

export const vol = c => (c.x1 - c.x0 + 1) * (c.y1 - c.y0 + 1);
export const roomPx = c => (c.y1 - c.y0 + 1) * TS;
/* the band's depth under the roof, and its lower edge in world px */
export const bandPx = c => Math.max(0, (roomPx(c) - FD.DUCK_ROOM) * c.fill);
export const bandBottom = c => c.y0 * TS + bandPx(c);
export const ready = c => c.fill >= FD.READY - 1e-9;
export function chamberAt(st, x, y) { for (const c of st.chambers) if (x >= c.x0 * TS && x < (c.x1 + 1) * TS && y >= c.y0 * TS && y < (c.y1 + 1) * TS) return c; return null; }

/* a slab's state -> its doors (up: the roof whole, shut; ramp: a hole, open; flat: dammed, shut; gone: an open hole) */
export function slabDoors(st, slabId, state) { for (const d of st.doors) if (d.slab === slabId) d.open = d.dam ? state !== 'flat' : state === 'ramp' || state === 'gone'; }   /* (a DAM door: open until its slab lies flat across it) */
export function setDoor(st, id, open) { const d = st.doors.find(q => q.id === id); if (d) d.open = !!open; return d; }

/* ONE STEP: the sources gather, the open doors level, the holes drain, the fuses burn down. Returns the events of this step:
   { t: 'ready', c } a chamber reached READY (the canary stops; the 'gas rising' sound), { t: 'blast', c, box } a fuse ran out. */
export function step(st, dt) {
  const ev = [];
  for (const c of st.chambers) {
    if (c.rest > 0) { c.rest = Math.max(0, c.rest - dt); continue; }
    if (c.on && c.src && !(c.fuse > 0)) c.fill = Math.min(c.max, c.fill + c.src * dt);
  }
  for (const d of st.doors) {
    if (!d.open) continue;
    const a = st.byId.get(d.a), b = d.b ? st.byId.get(d.b) : null; if (!a) continue;
    if (!b) { a.fill = Math.max(0, a.fill - a.fill * FD.VENT * dt); continue; }   /* a hole out of the mine */
    const diff = a.fill - b.fill; if (d.up && diff <= 0) continue;            /* (gas goes up a hole, never down it) */
    const va = vol(a), vb = vol(b), m = FD.FLOW * diff * dt * Math.min(va, vb);
    a.fill = Math.max(0, Math.min(1, a.fill - m / va)); b.fill = Math.max(0, Math.min(1, b.fill + m / vb));
  }
  for (const c of st.chambers) {
    const r = ready(c); if (r && !c.wasReady) ev.push({ t: 'ready', c }); c.wasReady = r;
    if (c.fuse > 0) { c.fuse -= dt; if (c.fuse <= 0) { c.fuse = 0; ev.push({ t: 'blast', c, box: c.box }); c.fill = 0; c.rest = FD.REST; c.blasts++; c.wasReady = false; } }
  }
  st.events = ev; return ev;
}

/* A FLAME AT (x, y): in a chamber's band with the chamber READY, it lights the fuse (told). Returns the chamber lit, or null. reach: px the flame
   reaches UP from y (a struck lamp's flare). The box the blast will burn is fixed when it is lit (what you saw is what burns). */
export function lightAt(st, x, y, reach = 0) {
  const c = chamberAt(st, x, y) || chamberAt(st, x, y - reach); if (!c || c.fuse > 0 || c.rest > 0 || !ready(c)) return null;
  if (y - reach > bandBottom(c)) return null;
  c.fuse = FD.FUSE; c.box = blastBox(c); return c;
}
export const blastBox = c => ({ l: c.x0 * TS, r: (c.x1 + 1) * TS, t: c.y0 * TS, b: Math.min(bandBottom(c) + FD.LICK, c.y0 * TS + roomPx(c) - FD.DUCK_ROOM) });   /* (it rolls LICK px under the band, never into the ducking room) */
/* is a body (x, y = feet, w, h) in the blast? its top must be inside the burning band */
export const inBlast = (box, b) => b.x + (b.w || 10) / 2 > box.l && b.x - (b.w || 10) / 2 < box.r && b.y - (b.h || 14) < box.b && b.y > box.t;
/* is a point (a post's top, a plug cell's centre) in it */
export const pointInBlast = (box, x, y) => x >= box.l && x < box.r && y >= box.t && y < box.b;

/* THE CANARY of a chamber: { gap: s between songs (Infinity = it has stopped), silent } */
export function canary(c) {
  if (ready(c) || c.fuse > 0) return { gap: Infinity, silent: true };
  const k = Math.max(0, Math.min(1, c.fill / FD.READY));
  return { gap: FD.SONG_FAST + (FD.SONG_SLOW - FD.SONG_FAST) * k * k, silent: false };
}

/* what the lab and the read show: one line per chamber */
export const read = st => st.chambers.map(c => ({ id: c.id, fill: Math.round(c.fill * 100) / 100, ready: ready(c), fuse: c.fuse, rest: c.rest, band: Math.round(bandBottom(c)), blasts: c.blasts }));
