// src/sun-temple-hands.js - THE SUN TEMPLE's HANDS (claude/suntemple, 11-06, the OPUS GREYBOX). The light itself (the rooms, the mirrors, the doors, the cache and
// their drawing) is src/sunroom-hands.js's, generic; this is what is the TEMPLE's own:
//   THE DIAL (the sun is always drawn, never a hidden timer - brief "THE SUN MOVES"): in a hall under a moving sun, a band at the top of the screen: the five windows,
//     the one the sun stands in gold, the sun's disc travelling over them, and HOW LONG until the sun reaches the window the room's door wants.
//   THE GLINT + THE NUDGE (house rule 10-02): a pulsing glint on each mirror the room still needs turned; ~10 s in a hall with its door shut, a told line.
//   THE SUN MENDS YOU AND BURNS THE DEAD: a hero standing in a hall's sun light mends; an undead body in it burns (light.js LIGHT.burnDps). Not in THE SANCTUM:
//     his light there is his (src/fallen-sun.js).
//   THE DUSK SIEGE (L.ambushes[].dusk, L.dusk): when the room shuts, the sun goes down - the hall's windows go out one by one (L.dusk.out); the west one is the last
//     light. A reset (a death) lights them again.
// main.js calls: on, clear, update(dt), drawWorld(g, cx, cy, time), drawHud(g).
//   ctx: { L (getter), T, TS, players (getter), enemies(), hurtFoe(e, dmg), undead(e), srh(), tileAt(x, y), isSlope, number(x, y, t, col), text(...), say(msg, sub, col, t),
//          VW(), time(), sfx }
import { solveRoom } from './sun-puzzle.js';
import { makeOpaque, litBox, LIGHT } from './light.js';

export const STH_K = { mend: 2, mendTick: 0.5, nudgeT: 10 };

export function makeSunTempleHands(ctx) {
  const H = {}, TS = ctx.TS, R = Math.round;
  let Lref = null, sols = null, inRoomT = 0, inRoomId = null, dusk = null, mendAcc = 0;
  H.on = () => !!(ctx.L && ctx.L.suntemple);
  H.clear = () => { Lref = null; sols = null; inRoomT = 0; inRoomId = null; dusk = null; };
  const srh = () => (ctx.srh ? ctx.srh() : null);
  /* each room's fewest-turn answer (the mirrors the glint names, the hour the dial counts to), once a level */
  function solutions() { const L = ctx.L; if (L === Lref && sols) return sols; Lref = L; sols = new Map();
    const opaque = makeOpaque(ctx.T, ctx.isSlope || (() => false));
    for (const def of L.sunRooms || []) { if (!def.doors.some(d => d.kind === 'sun')) continue; try { const s = solveRoom(def, ctx.tileAt, opaque); if (s) sols.set(def.id, s); } catch { /* too many mirrors: no glint */ } }
    return sols; }
  const roomAt = (x, y) => { const r = srh(); if (!r) return null; const tx = Math.floor(x / TS), ty = Math.floor((y - 8) / TS);
    return r.rooms().find(q => q.def.id !== 'sanctum' && tx >= q.def.box[0] && tx <= q.def.box[2] && ty >= q.def.box[1] && ty <= q.def.box[3]) || null; };
  const movingSun = rm => rm && rm.def.sources.find(s => s.windows && s.day > 0);

  H.update = dt => {
    if (!H.on()) return; const L = ctx.L, r = srh(); if (!r) return; solutions();
    const P = ctx.players[0]; if (!P) return;
    /* THE NUDGE: ~10 s in a hall with its door shut */
    const rm = roomAt(P.x, P.y), id = rm ? rm.def.id : null;
    if (id !== inRoomId) { inRoomId = id; inRoomT = 0; } else if (rm && rm.doors.some(d => d.kind === 'sun' && !d.open)) { inRoomT += dt;
      if (inRoomT >= STH_K.nudgeT) { inRoomT = -20; ctx.number(P.x, P.y - 40, movingSun(rm) ? 'STRIKE THE GLINTING MIRROR, THEN WATCH THE DIAL: THE SUN WILL COME TO IT' : 'STRIKE THE GLINTING MIRROR: IT TURNS THE LIGHT', '#ffd36b'); } }
    /* THE SUN MENDS YOU: a hero in a hall's sun light (not the sanctum's) */
    mendAcc += dt; const tick = mendAcc >= STH_K.mendTick; if (tick) mendAcc = 0;
    if (tick) for (const pp of ctx.players) { if (pp.dead || pp.hp >= (pp.maxHp || 100)) continue; const b = [pp.x - 4, pp.x + 4, pp.y - 20, pp.y - 2];
      if (r.rooms().some(q => q.def.id !== 'sanctum' && q.res && litBox(q.res, b))) { pp.hp = Math.min(pp.maxHp || 100, pp.hp + STH_K.mend); pp.stMended = (pp.stMended || 0) + STH_K.mend; } }
    /* ...AND BURNS THE DEAD */
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless || !ctx.undead(e)) continue; const b = [e.x - (e.w || 8) / 2, e.x + (e.w || 8) / 2, e.y - (e.h || 12), e.y - 1];
      if (!r.rooms().some(q => q.res && litBox(q.res, b))) continue; e.stBurn = (e.stBurn || 0) + LIGHT.burnDps * dt;
      if (e.stBurn >= 3) { const d = Math.floor(e.stBurn); e.stBurn -= d; ctx.hurtFoe(e, d); if (!e.stSaid) { e.stSaid = 1; ctx.number(e.x, e.y - (e.h || 12) - 8, 'THE SUN BURNS THE DEAD', '#ffd36b'); } } }
    /* THE DUSK SIEGE */
    const A = (L.ambushes || []).find(q => q.dusk), dr = r.room('duskHall');
    if (A && dr && L.dusk) {
      const live = A.st && A.st !== 'done';
      if (live && !dusk) { dusk = { t: ctx.time(), out: new Set() }; if (ctx.say) ctx.say('DUSK', L.dusk.say, '#ff9a5c', 2.4); }
      if (dusk && !A.st) { dusk = null; for (const s of dr.def.sources) s.off = false; }   /* (a reset: the room is open again, the sun is back up) */
      if (dusk && live) for (const o of L.dusk.out) { if (dusk.out.has(o.id) || ctx.time() - dusk.t < o.t) continue; dusk.out.add(o.id);
        const s = dr.def.sources.find(q => q.id === o.id); if (s) { s.off = true; ctx.number(s.x * TS + 8, (s.y + 2) * TS, o.id === 'duskE' ? 'THE EAST WINDOW GOES DARK' : 'THE SUN SINKS: ONE WINDOW LEFT', '#ff9a5c'); } }
    }
  };
  /* THE GLINT on each mirror the hall still needs turned (the room's fewest-turn answer, the mirror still as it was built) */
  H.drawWorld = (g, cx, cy, time) => { if (!H.on()) return; const r = srh(); if (!r) return; const S = solutions();
    for (const rm of r.rooms()) { const s = S.get(rm.def.id); if (!s || rm.doors.every(d => d.kind !== 'sun' || d.open)) continue;
      for (const [mx, my] of s.turn) { const i = rm.def.mirrors.findIndex(m => m.x === mx && m.y === my); if (i < 0 || rm.mirrors[i].state !== rm.def.mirrors[i].state) continue;
        const x = R(mx * TS + 8 - cx), y = R(my * TS + 8 - cy), k = 0.5 + 0.5 * Math.sin(time * 5);
        g.globalAlpha = 0.35 + 0.5 * k; g.strokeStyle = '#fff6c8'; g.beginPath(); g.arc(x + 0.5, y + 0.5, 9 + 2 * k, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } } };
  /* THE DIAL: the hall you stand in, under a moving sun */
  H.drawHud = g => { if (!H.on()) return; const P = ctx.players[0]; if (!P) return; const rm = roomAt(P.x, P.y), src = movingSun(rm); if (!src) return;
    const n = src.windows.length, slot = src.day / n, c = rm.clock % src.day, cur = Math.min(n - 1, Math.floor(c / slot)), s = solutions().get(rm.def.id), want = s ? s.hour : -1;
    const done = rm.doors.every(d => d.kind !== 'sun' || d.open) && !rm.doors.some(d => d.mode === 'hold');
    const w = 112, x0 = R(ctx.VW() / 2 - w / 2), y0 = 34;
    g.fillStyle = 'rgba(20,14,10,0.72)'; g.fillRect(x0 - 4, y0 - 3, w + 8, 22);
    for (let i = 0; i < n; i++) { const x = x0 + R((i + 0.5) * w / n) - 4; g.fillStyle = i === cur ? '#ffd36b' : '#5a4a3a'; g.fillRect(x, y0, 8, 6); if (i === want) { g.strokeStyle = '#fff6c8'; g.strokeRect(x - 1.5, y0 - 1.5, 11, 9); } }
    const sx = x0 + R((c / src.day) * w); g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(sx, y0 + 10, 2.5, 0, Math.PI * 2); g.fill();
    let line;
    if (done) line = 'THE DOOR IS OPEN';
    else if (want < 0) line = 'THE SUN MOVES';
    else if (want === cur) line = 'THE SUN IS AT YOUR WINDOW';
    else { const until = ((want * slot - c) + src.day) % src.day; line = 'THE SUN COMES TO YOUR WINDOW IN ' + Math.ceil(until); }
    ctx.text(line, R(ctx.VW() / 2), y0 + 13, want === cur ? '#ffd36b' : '#e8dcc0', 'center', 5); };
  return H;
}
