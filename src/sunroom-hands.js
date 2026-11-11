// src/sunroom-hands.js - THE SUN ROOMS' HANDS (claude/colossus4, 11-05): binds the desert kit's pure sun/light puzzle pieces (src/sun-puzzle.js, L.sunRooms) to the
// world, and draws their light with src/beam-path.js. Generic: any level that declares L.sunRooms gets it (on master none does, so nothing live changes; the first
// user is THE GLASS SEA's GLYPH COURT behind the Colossus 4 flag, then the King's Pyramid mirror room and the Sun Temple).
// THE RULE (Daniel 09-21, plan-desert-1105 3j): SUN-DOORS answer to the SUN only; PRIEST CACHES to THE DESERT PRIEST's beam only; LAMPS to either.
// main.js calls: on, clear, update(dt), strike(hb), burn(body, dt), draw(g, cx, cy, time), read.
//   ctx: { L (getter), T, TS, tileAt(x, y), cellSet(x, y, t), isSlope(t), number(x, y, text, col), text(...), sfx, players, priestBeams() -> [{ x, y, dir }] tiles }
import { sunRoomsInit, sunRoomsStep, strikeMirrors, sunBurn } from './sun-puzzle.js';
import { makeOpaque } from './light.js';
import * as BP from './beam-path.js';

export function makeSunRoomHands(ctx) {
  let R = null, Lref = null, opaque = null;
  const H = {}, TS = ctx.TS, Rd = Math.round;
  H.on = () => { const L = ctx.L; if (L !== Lref) { Lref = L; R = L && L.sunRooms && L.sunRooms.length ? sunRoomsInit(L) : null; opaque = R ? makeOpaque(ctx.T, ctx.isSlope || (() => false)) : null; } return !!R; };
  H.clear = () => { R = null; Lref = null; };
  H.read = () => R && R.rooms.map(r => ({ id: r.def.id, mirrors: r.mirrors.map(m => m.state), doors: r.doors.map(d => ({ id: d.id, open: d.open, lit: d.lit })) }));
  const setBox = ([x0, y0, x1, y1], t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ctx.cellSet(x, y, t); };
  const bodyIn = ([x0, y0, x1, y1]) => ctx.players.some(p => !p.dead && p.x >= x0 * TS - 6 && p.x <= (x1 + 1) * TS + 6 && p.y >= y0 * TS && p.y - 20 <= (y1 + 1) * TS);
  H.update = dt => {
    if (!H.on()) return;
    const ev = sunRoomsStep(R, dt, { tileAt: ctx.tileAt, opaque, priestBeams: ctx.priestBeams ? ctx.priestBeams() || [] : [], bodyIn });
    for (const v of ev) {
      const room = R.rooms.find(r => r.def.id === v.room), d = room && room.doors.find(q => q.id === v.id); if (!d) continue;
      const ex = d.eye[0] * TS + 8, ey = d.eye[1] * TS;
      if (v.ev === 'open' && d.opens) { setBox(d.opens, ctx.T.AIR); try { (ctx.sfx.clank || ctx.sfx.thud)(); } catch {} ctx.number(ex, ey - 20, d.kind === 'cache' ? "THE PRIEST'S LIGHT BREAKS THE SUN-SEAL" : 'THE SUN OPENS THE DOOR', '#ffd36b'); }
      else if (v.ev === 'shut' && d.opens) { setBox(d.opens, ctx.T.SOLID); ctx.number(ex, ey - 20, 'THE LIGHT IS GONE: IT SHUTS', '#9aa39a'); }
      else if (v.ev === 'tell') ctx.number(ex, ey - 20, 'THE LIGHT SLIPS: IT IS SHUTTING', '#ff9a5c');
      else if (v.ev === 'lamp') { const sp = ctx.L.templeSpur, first = !ctx.L.sunLampSaid; ctx.L.sunLampSaid = true; if (sp && sp.lamp === d.id) ctx.L.templeLit = true;
        if (first) ctx.number(ex, ey - 24, sp && sp.lamp === d.id ? sp.say : 'THE SUN-LAMP BURNS', '#ffd36b'); }
    }
  };
  /* a landed blow (any hero, any seat - main.js runs it per hero) turns a mirror it covers; one turn a swing (sun-puzzle's cooldown) */
  H.strike = hb => { if (!hb || !H.on()) return; for (const m of strikeMirrors(R, [hb.l, hb.t, hb.r, hb.b])) { try { ctx.sfx.clank && ctx.sfx.clank(); } catch {} ctx.number(m.x * TS + 8, m.y * TS - 8, 'THE MIRROR TURNS', '#fff6c8'); } };
  H.burn = (body, dt) => (R ? sunBurn(R, body, dt) : 0);
  /* THE DRAWING: the sun's path (and the priest's, lilac) the whole way, each mirror's slant on its post, each eye: a sun-glyph (lamp: gold when lit), a sun-door's eye, the
     cache's silver seal glyph (it says whose light it wants) */
  H.draw = (g, cx, cy, time) => {
    if (!H.on()) return;
    for (const room of R.rooms) {
      if (room.res) for (const p of BP.fromSegs(room.res.segs, TS)) BP.drawBeam(g, p, cx, cy, time, { kind: 'sun', ring: true });
      if (room.pres) for (const p of BP.fromSegs(room.pres.segs, TS)) BP.drawBeam(g, p, cx, cy, time, { kind: 'priest', ring: true });
      for (const m of room.mirrors) { const x = Rd(m.x * TS + 8 - cx), y = Rd(m.y * TS + 8 - cy), s = m.state === '/' ? 1 : -1;
        g.fillStyle = '#5a3a1a'; g.fillRect(x - 1, y + 4, 2, 12); g.fillStyle = '#c89a4a'; for (let i = -6; i <= 6; i++) g.fillRect(x + i, y - s * i, 1, 2); g.fillStyle = '#fff6c8'; g.fillRect(x - s * 3, y - 3, 1, 1); }
      for (const d of room.doors) { const x = Rd(d.eye[0] * TS + 8 - cx), y = Rd(d.eye[1] * TS + 8 - cy);
        const col = d.kind === 'cache' ? (d.open ? '#e8e0ff' : '#a8a0c8') : d.lit || d.open ? '#ffd36b' : '#8a7a5a', r = d.kind === 'lamp' ? 5 : 3;
        g.strokeStyle = col; g.beginPath(); g.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2); g.stroke(); g.fillStyle = col; g.fillRect(x - 1, y - 1, 2, 2);
        if (d.kind !== 'cache') for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + (d.lit ? time * 0.8 : 0), q = r + 3; g.fillRect(Rd(x + Math.cos(a) * q), Rd(y + Math.sin(a) * q), 1, 1); }   /* the sun's rays round the glyph */
        else { g.fillRect(x - 4, y + r + 2, 9, 1); }   /* the cache: a seal line under its glyph */
        if (d.lit && d.kind === 'lamp') { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25 + 0.1 * Math.sin(time * 5); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); g.restore(); } }
    }
  };
  return H;
}
