// tools/ore-ride.mjs — THE ORE ROAD, ridden in the page: for each line the road is crossed on, put the hero on a bucket as it comes
// out of its station and do NOTHING - the engine's own mover code must carry him the whole span and set him down on the far deck,
// alive. (tools/ore-road.mjs proves the geometry in Node; this proves the ride.) The rusted buckets of the steep line are the one
// place standing still is fatal, so there the hands hop forward off a bucket that starts to give; and set down on the pylon's deck
// mid-span, they walk on off its edge onto the next bucket.
//
// WHICH LINES IT RIDES IS NOT TYPED HERE, AND THAT IS THE POINT (2026-09-25). It used to name them - 'first',
// 'crossing', 'down', 'steep' - and the rework replaced THE CROSSING with THE ORE CHUTE. `findIndex` answered -1,
// `lines[-1]` is undefined, and the tool died in the page on `.pts` with a TypeError that named nothing: a whole
// level's worth of red for a line that had simply been renamed. So it asks the LEVEL which lines it has and rides
// every one of them. A line added to the level is ridden the day it is added, and a line renamed cannot be missed.
// THE DRUM LINES TOO, since the Winchmaster's rework (2026-09-25): he REVERSES them, so they end three-quarters of a
// tile inside a ledge at BOTH ends now, and a rider must be set down alive at either. They are ridden the way they
// run at the start of the fight (the high line runs WEST, into the Head Frame), with him out of the room - the ride,
// not the fight; tools/ore-road.mjs has the fight.
// usage: node tools/ore-ride.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { cableLines } from '../src/ore-road.js';   /* only to prove COVERAGE: that the page rode every line the source declares */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad'), out = [];
    /* ask the level which lines the road is crossed on, rather than naming them here */
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.sim(1);
    if (!BK.L.cableway) return [{ id: '(none)', ok: false, why: 'the level built no cableway at all' }];
    const ids = BK.L.cableway.lines.map(l => l.id);
    for (const id of ids) {
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(5);
      const L = BK.L, li = L.cableway.lines.findIndex(l => l.id === id), ln = L.cableway.lines[li];
      for (const e of BK.enemies()) if (!e.maxHp || ln && ln.drum) e.alive = false;   /* the ride, not the fight (and on a drum line, not him either) */
      if (!ln) { out.push({ id, ok: false, why: 'the level rebuilt without this line' }); continue; }   /* say WHICH line, rather than read .pts off lines[-1] */
      const P = BK.P, fwd = ln.dir > 0, start = fwd ? ln.pts[0] : ln.pts[ln.pts.length - 1], end = fwd ? ln.pts[ln.pts.length - 1] : ln.pts[0], dir = Math.sign(end[0] - start[0]);
      /* wait for a sound bucket just out of its station, and stand in it */
      let m = null; for (let f = 0; f < 60 * 20 && !m; f++) { BK.sim(1); m = BK.movers().find(q => q.kind === 'bucket' && q.line === li && q.vis && !q.cracked && Math.abs(q.x + q.w / 2 - (start[0] + dir * 44)) < 10); }   /* clear of the deck's edge: a hero on a tile never looks for a mover under him */
      if (!m) { out.push({ id, ok: false, why: 'no bucket came out' }); continue; }
      P.x = m.x + m.w / 2; P.y = m.y - 1; P.vx = 0; P.vy = 0; BK.sim(2);
      const TS = 16, T = lvm.T, cell = (c, r) => (c < 0 || r < 0 || c >= L.W || r >= L.H) ? T.SOLID : L.grid[r * L.W + c];
      const foot = t => t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.NET;
      let f = 0, maxF = 60 * 60, hops = 0, walks = 0, wait = 0, waitMax = 0; const k = BK.keys;
      for (; f < maxF; f++) {
        k.left = k.right = k.jump = false;
        const on = P.onMover;   /* the steep line: off a bucket that has started to give, forward */
        if (on && on.cracked && on.crackT > 0.25 && P.ground) { k[dir > 0 ? 'right' : 'left'] = true; BK.press('jump'); hops++; P.labHop = 14; }
        if (P.labHop > 0) { P.labHop--; k.jump = true; k[dir > 0 ? 'right' : 'left'] = true; }
        else if (!on && P.ground && Math.abs(P.x - end[0]) > 40) {
          /* SET DOWN ON A REST MID-LINE (a pylon): walk on, and step off its far edge onto a skip - BUT LOOK FIRST.
             A rest is level with the line so that a hero can step off and step on; between two skips there is a hole
             of gap - OR.BUCKET.w (54 px on the first span) and a hero who walks off the lip without looking goes
             down it. That is not the line dropping him, it is him jumping into the gorge, and the check must not
             blame the level for it. So: on the deck, walk; AT the lip, wait for a skip to come under the step. The
             wait itself is the measurement - a rest you cannot leave inside waitCap seconds is a rest that has
             stranded you, and that IS the level's fault. */
          const row = Math.floor((P.y + 1) / TS), ahead = Math.floor((P.x + dir * 12) / TS), step = P.x + dir * 14;
          const deck = foot(cell(ahead, row));
          const skip = deck || BK.movers().some(q => q.kind === 'bucket' && q.line === li && q.vis && !(q.fallen > 0) && step > q.x && step < q.x + q.w && q.y > P.y - 3 && q.y < P.y + 40);
          if (skip) { k[dir > 0 ? 'right' : 'left'] = true; walks++; wait = 0; }
          else { wait++; if (wait > waitMax) waitMax = wait; }
        } else wait = 0;
        BK.sim(1);
        if (P.dead) break;
        if (!P.onMover && P.ground && Math.abs(P.x - end[0]) < 40 && Math.abs(P.y - end[1]) < 6) break;
      }
      out.push({ id, ok: !P.dead && f < maxF, secs: +(f / 60).toFixed(1), at: [Math.round(P.x / 16), Math.round(P.y / 16)], end: [Math.round(end[0] / 16), Math.round(end[1] / 16)], dead: !!P.dead, hops, walked: +(walks / 60).toFixed(1), waited: +(waitMax / 60).toFixed(1) });
    }
    return out; })()`, 600000);
  for (const x of r) console.log((x.ok ? '  ok   ' : '  FAIL ') + JSON.stringify(x));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  /* COVERAGE, so that "all green" can never mean "it rode nothing": every line the source declares but the drum's
     was ridden. This is what a typed list of names could not give - it could only ever go quietly stale. */
  const want = cableLines().map(l => l.id).sort(), got = r.map(x => x.id).sort();
  assert.deepEqual(got, want, `it must ride every line of the cableway, the drum lines included: wanted ${want.join(', ')}, rode ${got.join(', ') || '(nothing)'}`);
  assert(r.every(x => x.ok), 'every line carries a hero who does nothing (and hops the rust) from station to station');
  /* AND NO REST STRANDS HIM. A line hands its skips over at gap/speed seconds apart, so that - and no more - is how
     long a rest can hold a hero waiting at its lip for the next one. A rework that widened a gap or slowed a line
     until a pylon became a place you sit and wait would show up here as a wait longer than the line's own clock. */
  for (const l of cableLines().filter(q => !q.drum)) {
    const x = r.find(q => q.id === l.id), cap = l.gap / l.speed + 0.6;
    console.log(`  ok   the ${l.id} line's rests hold him ${x.waited}s at the lip, against the ${(l.gap / l.speed).toFixed(1)}s its own skips come`);
    assert(x.waited <= cap, `the ${l.id} line left him standing ${x.waited}s on a rest; its skips come ${(l.gap / l.speed).toFixed(2)}s apart, so anything over ${cap.toFixed(2)}s means the rest is not being served`);
  }
  assert(!pg.errors.length, 'no page errors');
  console.log('every line of the ore road carries you across');
} finally { pg.close(); }
