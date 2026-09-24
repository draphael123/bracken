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
  const R0 = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad'), out = [];
    const rockSeen = new WeakSet(), rocksAt = { inView: 0, off: [] };   /* EVERY FALLING ROCK IS TOLD: each one that falls while a line is ridden, and was its spot on the screen */
    const watchRocks = () => { const [cx, cy] = BK.cam; for (const r of BK.rocks()) { if (rockSeen.has(r)) continue; rockSeen.add(r); if (r.thrown || r.ore || r.apple) continue;
      if (r.x > cx && r.x < cx + 320 && r.y < cy + 180) rocksAt.inView++; else rocksAt.off.push([Math.round(r.x / 16), Math.round(r.y / 16)]); } };
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
        BK.sim(1); watchRocks();
        if (P.dead) break;
        if (!P.onMover && P.ground && Math.abs(P.x - end[0]) < 40 && Math.abs(P.y - end[1]) < 6) break;
      }
      out.push({ id, ok: !P.dead && f < maxF, secs: +(f / 60).toFixed(1), at: [Math.round(P.x / 16), Math.round(P.y / 16)], end: [Math.round(end[0] / 16), Math.round(end[1] / 16)], dead: !!P.dead, hops, walked: +(walks / 60).toFixed(1), waited: +(waitMax / 60).toFixed(1) });
    }
    return { rows: out, rocks: rocksAt }; })()`, 600000);
  const r = R0.rows; r.rocks = R0.rocks;
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
  console.log(`  ${r.rocks.off.length ? 'FAIL' : 'ok  '} ${r.rocks.inView} rocks fell while the lines were ridden, every one of them on the screen` + (r.rocks.off.length ? ' - not ' + JSON.stringify(r.rocks.off.slice(0, 5)) : ''));
  assert(r.rocks.inView > 0 && !r.rocks.off.length, 'every rock that falls, falls on the screen (it is told there, or it waits)');
  /* THE VEINS, in the page: a hero strikes a seam three times and it spills its coins; and a miner left alone works one */
  const V = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; BK.sim(5);
    const L = BK.L, P = BK.P, v = L.veins.find(q => q.x > 30 && q.y > 20), a0 = BK.acorns().length;
    BK.tp(v.x - 1, v.y); BK.sim(20); P.face = 1; let n = 0;
    for (let k = 0; k < 6 && !v.mined; k++) { P.face = 1; BK.press('atk'); BK.sim(28); n++; }
    const spilled = BK.acorns().length - a0; BK.sim(90);
    const got = BK.acorns().filter(q => q.vein && q.got).length;
    /* the miners, with no hero near: send the hero far off and watch */
    BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; BK.sim(5); BK.tp(300, 30); BK.sim(5);
    let chips = 0, carried = 0, working = 0;
    for (let f = 0; f < 60 * 40; f++) { BK.sim(1); for (const e of BK.enemies()) if (e.t === 'miner' && e.oreWork) { working = Math.max(working, 1); chips = Math.max(chips, e.oreWork.chips || 0); } if ((BK.L.carrying || []).length) carried++; if (P.x < 280 * 16) BK.tp(300, 30); }
    return { at: [v.x, v.y], blows: n, mined: v.mined, spilled, got, chips, carried };
  })()`, 600000);
  console.log(`  ${V.mined && V.spilled === 3 ? 'ok  ' : 'FAIL'} a seam at ${V.at} struck ${V.blows} times is mined and spills ${V.spilled} coins (${V.got} picked up where they fell)`);
  console.log(`  ${V.chips > 0 && V.carried > 0 ? 'ok  ' : 'FAIL'} with no hero near, the miners work the seams (${V.chips} blows at one) and carry the ore off (${V.carried} frames carrying)`);
  assert(V.mined && V.blows === 3 && V.spilled === 3, 'three blows mine a seam, and it spills three coins');
  assert(V.chips > 0 && V.carried > 0, 'a miner left alone works a seam and carries its ore to the buckets');
  /* THE PIT, in the page: at every span, a hero dropped into it pays a fifth (never his life), the turbines carry him to the
     recovery ledge at the start of that span, and he climbs the ladder back onto the deck the span starts from */
  const PIT = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad'), out = [];
    for (const [k, hp0] of [[0, 100], [1, 100], [2, 100], [3, 100], [0, 6]]) {
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(5);
      for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;
      const L = BK.L, P = BK.P, q = L.pits[k], kk = BK.keys; P.hp = hp0;
      BK.tp(Math.round((q.x0 + q.x1) / 2), q.floor - 8); P.vx = 0; P.vy = 0;
      let f = 0, lifted = false, lowest = 999; const hpIn = P.hp;
      for (; f < 60 * 25 && !P.dead; f++) { BK.sim(1); if (P.pitLift) lifted = true; lowest = Math.min(lowest, P.hp); if (lifted && !P.pitLift && P.ground) break; }
      const onLedge = P.ground && Math.abs(P.y - (q.ledge[2] + 1) * 16) < 3 && P.x > q.ledge[0] * 16 - 4 && P.x < (q.ledge[1] + 1) * 16 + 4;
      /* the ladder home: to it, up it, and off it onto the deck */
      for (let g = 0; g < 60 * 30 && !P.dead; g++) { kk.left = kk.right = kk.up = kk.down = false;
        const lx = q.ladder[0] * 16 + 8;
        if (P.climb) kk.up = true; else if (Math.abs(P.y - (q.start[1] + 1) * 16) < 3 && P.x < (q.start[0] + 1) * 16 + 2) break;
        else if (P.y < (q.ladder[1] + 1) * 16 + 2) kk.left = true; else if (Math.abs(lx - P.x) > 3) kk[lx > P.x ? 'right' : 'left'] = true; else kk.up = true;
        BK.sim(1); }
      out.push({ span: q.id, hp0: hpIn, lost: hpIn - lowest, dead: !!P.dead, lifted, onLedge, home: Math.abs(P.y - (q.start[1] + 1) * 16) < 3 && P.x < (q.start[0] + 1) * 16 + 2, secs: +(f / 60).toFixed(1) }); }
    return out; })()`, 900000);
  for (const x of PIT) { const ok = !x.dead && x.lifted && x.onLedge && x.home && x.lost === Math.min(20, x.hp0 - 1);   /* a fifth of 100 - and never the last point */
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} the ${x.span} pit: with ${x.hp0} health it cost ${x.lost}, the turbines carried him to the ledge in ${x.secs}s, and the ladder took him home` + (ok ? '' : ' ' + JSON.stringify(x))); }
  assert(PIT.every(x => !x.dead && x.lifted && x.onLedge && x.home && x.lost === Math.min(20, x.hp0 - 1)), 'every pit costs a fifth and never a life, carries you to its ledge, and its ladder climbs home');
  /* THE JAM IS STILL THE BONUS (round two): in the page, a hero riding a loaded skip in from the deck jams the Great Drum and
     puts him down on its ledge, open, for the double-damage window */
  const JAM = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = false; BK.sim(5);
    for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;
    const L = BK.L, P = BK.P, A = L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(120);
    const b = BK.boss, li = L.cableway.lines.findIndex(l => l.id === 'low'); let m = null, seen = [];
    for (let f = 0; f < 60 * 20 && !m; f++) { BK.sim(1); m = BK.movers().find(q => q.kind === 'bucket' && q.line === li && q.vis && q.x + q.w / 2 > 488 * 16 && q.x + q.w / 2 < 491 * 16); }
    if (!m) return { err: 'no skip came out' };
    for (let k = 0; k < 4; k++) { P.x = m.x + m.w / 2; P.y = m.y - 1; P.vx = P.vy = 0; BK.sim(1); }
    for (let f = 0; f < 60 * 25 && b.mode !== 'downed'; f++) { b.revCd = b.sendCd = b.hookCd = b.leverCd = 99; BK.sim(1); seen.push(b.mode); }
    BK.sim(2); return { downed: b.mode === 'downed', open: b.open > 0, at: b.at, active: BK.bossActive, modes: [...new Set(seen)].join(','), px: Math.round(P.x / 16), on: !!P.onMover, ore: m.ore, bd: m.boardD };
  })()`, 600000);
  console.log(`  ${JAM.downed && JAM.open ? 'ok  ' : 'FAIL'} ridden in from the deck, a loaded skip jams the Great Drum and he is down on its ledge, open ` + JSON.stringify(JAM));
  assert(JAM.downed && JAM.open, 'the jam still puts him down, open (the bonus)');
  assert(!pg.errors.length, 'no page errors');
  console.log('every line of the ore road carries you across');
} finally { pg.close(); }
