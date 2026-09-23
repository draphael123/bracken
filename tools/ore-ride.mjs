// tools/ore-ride.mjs — THE ORE ROAD, ridden in the page: for each line the road is crossed on, put the hero on a bucket as it comes
// out of its station and do NOTHING - the engine's own mover code must carry him the whole span and set him down on the far deck,
// alive. (tools/ore-road.mjs proves the geometry in Node; this proves the ride.) The rusted buckets of the steep line are the one
// place standing still is fatal, so there the hands hop forward off a bucket that starts to give; and set down on the pylon's deck
// mid-span, they walk on off its edge onto the next bucket.
// usage: node tools/ore-ride.mjs
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad'), out = [];
    for (const id of ['first', 'crossing', 'down', 'steep']) {
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(5);
      for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;   /* the ride, not the fight */
      const L = BK.L, li = L.cableway.lines.findIndex(l => l.id === id), ln = L.cableway.lines[li], P = BK.P, end = ln.pts[ln.pts.length - 1], dir = Math.sign(end[0] - ln.pts[0][0]);
      /* wait for a sound bucket just out of its station, and stand in it */
      let m = null; for (let f = 0; f < 60 * 20 && !m; f++) { BK.sim(1); m = BK.movers().find(q => q.kind === 'bucket' && q.line === li && q.vis && !q.cracked && Math.abs(q.x + q.w / 2 - (ln.pts[0][0] + dir * 44)) < 10); }   /* clear of the deck's edge: a hero on a tile never looks for a mover under him */
      if (!m) { out.push({ id, ok: false, why: 'no bucket came out' }); continue; }
      P.x = m.x + m.w / 2; P.y = m.y - 1; P.vx = 0; P.vy = 0; BK.sim(2);
      let f = 0, maxF = 60 * 60, hops = 0, walks = 0; const k = BK.keys;
      for (; f < maxF; f++) {
        k.left = k.right = k.jump = false;
        const on = P.onMover;   /* the steep line: off a bucket that has started to give, forward */
        if (on && on.cracked && on.crackT > 0.25 && P.ground) { k[dir > 0 ? 'right' : 'left'] = true; BK.press('jump'); hops++; P.labHop = 14; }
        if (P.labHop > 0) { P.labHop--; k.jump = true; k[dir > 0 ? 'right' : 'left'] = true; }
        else if (!on && P.ground && Math.abs(P.x - end[0]) > 40) { k[dir > 0 ? 'right' : 'left'] = true; walks++; }   /* set down on a deck mid-line (the pylon): walk on, off its edge and onto the next bucket */
        BK.sim(1);
        if (P.dead) break;
        if (!P.onMover && P.ground && Math.abs(P.x - end[0]) < 40 && Math.abs(P.y - end[1]) < 6) break;
      }
      out.push({ id, ok: !P.dead && f < maxF, secs: +(f / 60).toFixed(1), at: [Math.round(P.x / 16), Math.round(P.y / 16)], end: [Math.round(end[0] / 16), Math.round(end[1] / 16)], dead: !!P.dead, hops, walked: +(walks / 60).toFixed(1) });
    }
    return out; })()`, 600000);
  for (const x of r) console.log((x.ok ? '  ok   ' : '  FAIL ') + JSON.stringify(x));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
  assert(r.every(x => x.ok), 'every line carries a hero who does nothing (and hops the rust) from station to station');
  assert(!pg.errors.length, 'no page errors');
  console.log('every line of the ore road carries you across');
} finally { pg.close(); }
