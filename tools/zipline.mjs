// tools/zipline.mjs - THE ZIP LINE WITH REAL KEYS, in the page, for every hero (claude/zipline, Daniel 2026-10-08: "Stormhold's ropes don't work in play").
// tools/watchtowers.mjs proves the ropes' geometry and one step of src/zipline.js in Node; this one PLAYS them: each of the seven heroes stands where a
// player stands and works the real keys (BK.keys.up / .down / .jump and BK.press('jump') - the same flags the keyboard sets), and the engine's own
// loop carries him. For each hero, on every one of Stormhold's three tower ropes:
//   TOP     standing on the deck at the rope's top end, UP takes the handle; the rope runs him down to its foot and sets him on the floor, alive, unhurt.
//   JUMP-IN a hero on the floor under the rope, NOT pressing up, jumps - and the rope takes him on the way (a touch from a jump), where it hangs within a jump.
//   STAND   a hero on the floor with the rope inside his reach, UP: takes hold MID-LINE and rides to the foot (where the rope comes down to the floor).
//   OFF     part-way down, JUMP lets go (a hop clear of it, no second grab on the way down); and DOWN drops him (he falls, lands, is not re-caught).
// and on two lines laid over the open road for the test (this tool's own, so no level is touched): one DOWN TO THE EAST, one DOWN TO THE WEST -
// both caught from a jump and from under with UP, ridden the way they slope, both ways. (A rope runs downhill: the high end is where you take it.)
// usage: PORT=8748 node tools/zipline.mjs [--heroes=knight,warden,...]
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const HEROES = ['knight', 'warden', 'geomancer', 'paladin', 'pyro', 'pirate', 'reaper'];
const only = (process.argv.find(a => a.startsWith('--heroes=')) || '').slice(9).split(',').filter(Boolean);
const pg = await openPage({ audio: false, fonts: false, seed: 20261008 });
const PAGE = `(async (hero) => {
  const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'storm'), T = lvm.T, TS = 16, rows = [];
  const solid = t => t === T.SOLID || t === T.PORT || t === T.CRATE || t === T.PALISADE;
  const fresh = () => { BK.setHero(hero); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; BK.sim(5); for (const e of BK.enemies()) e.alive = false;
    const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = false; return { L: BK.L, P: BK.P, k }; };
  const feetUnder = (L, x, y) => { const c = Math.floor(x / TS); for (let r = Math.max(0, Math.floor(y / TS)); r < L.H; r++) if (solid(L.grid[r * L.W + c]) && !solid(L.grid[(r - 1) * L.W + c])) return r * TS; return null; };
  const ly = (z, x) => z.y0 + (z.y1 - z.y0) * (x - z.x0) / (z.x1 - z.x0);
  const stand = (P, x, feet) => { P.x = x; P.y = feet; P.vx = 0; P.vy = 0; P.ground = false; P.zip = null; P.zipRelease = 0; P.zipSkip = null; BK.sim(4); };
  /* ride until he lets go of the rope (or the cap); returns the frames, and where he was */
  const rideOut = (P, z, cap = 900) => { let f = 0, maxVx = 0; for (; f < cap && P.zip === z; f++) { BK.sim(1); maxVx = Math.max(maxVx, Math.abs(P.vx)); } return { f, maxVx }; };
  const settle = (P, cap = 240) => { let f = 0; for (; f < cap && !(P.ground && !P.zip); f++) BK.sim(1); return f; };
  const row = (name, ok, why, extra) => rows.push({ name, ok: !!ok, why: ok ? '' : why, ...extra });
  const info = P => ({ x: Math.round(P.x), y: Math.round(P.y), ground: !!P.ground, zip: !!P.zip, dead: !!(P.dead > 0), hurt: P.hurt > 0 });

  const n = (() => { const { L } = fresh(); return L.zipLines.length; })();
  for (let i = 0; i < n; i++) {
    let { L, P, k } = fresh(); let z = L.zipLines[i]; const tag = 'rope ' + (i + 1);
    const xa = Math.min(z.x0, z.x1), xb = Math.max(z.x0, z.x1), east = z.y1 > z.y0 === z.x1 > z.x0 ? 1 : -1;
    const hi = z.y0 <= z.y1 ? [z.x0, z.y0] : [z.x1, z.y1], lo = z.y0 <= z.y1 ? [z.x1, z.y1] : [z.x0, z.y0];
    /* TOP: on the deck, UP */
    stand(P, hi[0] - (east > 0 ? 3 : -3), hi[1] + 12); const hp0 = P.hp;
    row(tag + ' top: he stands on the deck', P.ground, 'he is not standing at the rope\\'s top end: ' + JSON.stringify(info(P)));
    k.up = true; let got = false; for (let f = 0; f < 20 && !got; f++) { BK.sim(1); got = P.zip === z; } k.up = false;
    row(tag + ' top: UP takes the handle', got, 'UP at the top end did not take hold: ' + JSON.stringify(info(P)));
    if (got) { const r = rideOut(P, z); settle(P);
      row(tag + ' top: the ride runs to the foot and sets him down', Math.abs(P.x - lo[0]) < 40 && P.ground && !(P.dead > 0) && P.hp === hp0, 'ended ' + JSON.stringify(info(P)) + ' hp ' + hp0 + '>' + P.hp + ' foot ' + Math.round(lo[0]), { frames: r.f }); }
    /* JUMP-IN: on the floor under the rope, no UP */
    { let best = null; for (let x = xa + 16; x < xb - 16; x += 4) { const g = feetUnder(L, x, ly(z, x) + 8); if (g === null) continue; const d = g - ly(z, x); if (d >= 40 && d <= 56 && (!best || Math.abs(d - 46) < Math.abs(best.d - 46))) best = { x, g, d }; }
      if (!best) row(tag + ' jump-in: a place under it, 40-56 px below the rope', true, '', { skipped: true });
      else { ({ L, P, k } = fresh()); z = L.zipLines[i]; stand(P, best.x, best.g); k.jump = true; BK.press('jump'); let caught = false; for (let f = 0; f < 40 && !caught; f++) { BK.sim(1); caught = P.zip === z; } k.jump = false;
        row(tag + ' jump-in: a jump that touches the rope takes it (no UP)', caught, 'jumped under the rope at x=' + best.x + ' (rope ' + Math.round(best.d) + ' px over his feet) and was not caught: ' + JSON.stringify(info(P)));
        if (caught) { const x0 = P.x; rideOut(P, z); settle(P); row(tag + ' jump-in: and rides it the way it runs', (P.x - x0) * east > 20, 'moved ' + Math.round(P.x - x0) + ' against east=' + east); } } }
    /* STAND: on the floor with the rope in reach, UP */
    { let best = null; for (let x = xa + 16; x < xb - 14; x += 2) { const g = feetUnder(L, x, ly(z, x) + 4); if (g === null) continue; const d = g - ly(z, x); if (d >= 8 && d <= 20 && (!best || (east > 0 ? x < best.x : x > best.x))) best = { x, g, d }; }
      if (!best) row(tag + ' stand: a place with the rope in reach of the floor', true, '', { skipped: true });
      else { ({ L, P, k } = fresh()); z = L.zipLines[i]; stand(P, best.x, best.g); k.up = true; let caught = false; for (let f = 0; f < 20 && !caught; f++) { BK.sim(1); caught = P.zip === z; } k.up = false;
        row(tag + ' stand: UP under the rope takes it mid-line', caught, 'stood at x=' + best.x + ' with the rope ' + Math.round(best.d) + ' px over his feet, UP, and was not caught: ' + JSON.stringify(info(P)), { at: best.x });
        if (caught) { rideOut(P, z); settle(P); row(tag + ' stand: and carries him to the foot', Math.abs(P.x - lo[0]) < 40 && P.ground && !(P.dead > 0), 'ended ' + JSON.stringify(info(P))); } } }
    /* OFF: part-way, JUMP; and DOWN */
    for (const how of ['jump', 'down']) { ({ L, P, k } = fresh()); z = L.zipLines[i];
      stand(P, hi[0] - (east > 0 ? 3 : -3), hi[1] + 12); k.up = true; let on = false; for (let f = 0; f < 20 && !on; f++) { BK.sim(1); on = P.zip === z; } k.up = false;
      if (!on) { row(tag + ' ' + how + ': taken at the top', false, 'could not take the rope to begin with'); continue; }
      const half = (lo[0] + hi[0]) / 2; for (let f = 0; f < 400 && P.zip === z && (P.x - half) * east < 0; f++) BK.sim(1);
      const xOff = P.x, vy0 = P.vy; if (how === 'jump') { k.jump = true; BK.press('jump'); } else k.down = true; BK.sim(2); k.jump = false;
      const off = P.zip !== z; const vy1 = P.vy; k.down = false;
      let again = false; for (let f = 0; f < 200 && !(P.ground && !P.zip); f++) { BK.sim(1); if (P.zip) again = true; }
      row(tag + ' ' + how + ': lets go part-way', off, 'still on the rope after ' + how + ': ' + JSON.stringify(info(P)));
      row(tag + ' ' + how + ': ' + (how === 'jump' ? 'a hop clear of it' : 'a drop') + ', lands, not re-caught', off && !again && P.ground && !(P.dead > 0) && (how === 'jump' ? vy1 < 0 : vy1 >= 0) && Math.abs(P.x - xOff) > 4, 'vy ' + Math.round(vy1) + ' again=' + again + ' ' + JSON.stringify(info(P)) + ' off at ' + Math.round(xOff)); }
  }
  /* THE TWO LINES OF THIS TOOL, laid over the open road at Stormhold's west end: one down to the EAST, one down to the WEST. Isolated (the level's own ropes are taken out for them). */
  for (const dirn of [1, -1]) { let { L, P, k } = fresh(); L.zipLines.splice(0);
    const road = 36 * TS, x0 = 24, x1 = 200, lowY = road - 12, hiY = lowY - 44;
    const z = dirn > 0 ? { x0, y0: hiY, x1, y1: lowY } : { x0: x1, y0: hiY, x1: x0, y1: lowY }; L.zipLines.push(z);
    const tag = 'a line down to the ' + (dirn > 0 ? 'EAST' : 'WEST'), hiX = dirn > 0 ? x0 : x1, loX = dirn > 0 ? x1 : x0;
    /* from a jump, near the high end (the rope is 44 px over the road there) */
    stand(P, hiX + dirn * 30, road); k.jump = true; BK.press('jump'); let c1 = false; for (let f = 0; f < 40 && !c1; f++) { BK.sim(1); c1 = P.zip === z; } k.jump = false;
    row(tag + ': a jump from under its high end takes it', c1, 'not caught: ' + JSON.stringify(info(P)));
    if (c1) { const x0p = P.x; rideOut(P, z); settle(P); row(tag + ': ridden ' + (dirn > 0 ? 'east' : 'west') + ', to its foot', (P.x - x0p) * dirn > 40 && Math.abs(P.x - loX) < 30 && P.ground && !(P.dead > 0), 'moved ' + Math.round(P.x - x0p) + ' ' + JSON.stringify(info(P))); }
    /* standing under it, UP, a third of the way along it from the foot (the rope is ~15 px over the road there) */
    ({ L, P, k } = fresh()); L.zipLines.splice(0); L.zipLines.push(z);
    const sx = loX - dirn * 24; stand(P, sx, road); k.up = true; let c2 = false; for (let f = 0; f < 20 && !c2; f++) { BK.sim(1); c2 = P.zip === z; } k.up = false;
    row(tag + ': UP under it, mid-line', c2, 'rope ' + Math.round(road - (z.y0 + (z.y1 - z.y0) * (sx - z.x0) / (z.x1 - z.x0))) + ' px over his feet, not caught: ' + JSON.stringify(info(P)));
    if (c2) { rideOut(P, z); settle(P); row(tag + ': and carries him the rest of the way', (P.x - sx) * dirn > 4 && P.ground, 'moved ' + Math.round(P.x - sx) + ' ' + JSON.stringify(info(P))); }
    /* and uphill is not a ride: UP at the FOOT of it does nothing */
    ({ L, P, k } = fresh()); L.zipLines.splice(0); L.zipLines.push(z);
    stand(P, loX - dirn * 4, road); k.up = true; BK.sim(20); const up = !!P.zip; k.up = false;
    row(tag + ': UP right at its foot has no ride left to give', !up, 'took hold at the foot: ' + JSON.stringify(info(P))); }
  return rows; })(`;
const t0 = Date.now(); let bad = 0, total = 0;
for (const h of (only.length ? only : HEROES)) {
  const rows = await pg.evalp(PAGE + JSON.stringify(h) + ')', 600000);
  const fails = rows.filter(r => !r.ok), skipped = rows.filter(r => r.skipped).length;
  console.log((fails.length ? 'FAIL ' : ' ok  ') + h.padEnd(10) + (rows.length - skipped - fails.length) + '/' + (rows.length - skipped) + ' lines of play pass' + (skipped ? ' (' + skipped + ' not on this level)' : ''));
  for (const r of fails) console.log('        ' + r.name + ': ' + r.why);
  bad += fails.length; total += rows.length - skipped;
  if (h === (only.length ? only : HEROES)[0]) for (const r of rows) console.log('      ' + (r.skipped ? '-' : r.ok ? '+' : 'x') + ' ' + r.name + (r.frames ? ' (' + r.frames + ' frames)' : ''));
}
console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
pg.close();
assert.equal(pg.errors.length, 0, 'no page errors');
assert.equal(bad, 0, bad + ' of ' + total + ' lines of real-key play failed');
console.log('Every hero takes Stormhold\'s ropes at the top, mid-line from under with UP, and from a jump; rides both ways down; lets go with JUMP and DOWN. ' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
