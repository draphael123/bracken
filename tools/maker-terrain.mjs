// PAGE TOOL: launches headless Chrome
/* tools/maker-terrain.mjs (claude/maker) - THE MAKER's TERRAIN works when you play it.
   In one made-by-hand wood: the knight SWIMS in a WATER box, a CRUMBLE LEDGE holds, counts, drops him and stands again on
   the next attempt, a MOVING PLATFORM carries him and a LIFT rises; and the terrain survives SAVE -> LOAD.
   node tools/maker-terrain.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(8), audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const W = 90, d = MKR.blank(W, 28), set = (x, y, t) => d.grid[y * W + x] = t, r = {};
    for (let x = 20; x <= 29; x++) for (let y = 19; y <= 23; y++) set(x, y, 0);
    d.water = [{ kind: 'water', x0: 20, x1: 29, y0: 19, y1: 23 }];
    for (let x = 40; x <= 46; x++) for (let y = 20; y < 28; y++) set(x, y, 0);
    for (let x = 41; x <= 45; x++) set(x, 19, 2); d.crumble = [41, 42, 43, 44, 45].map(x => x + ',19');
    d.ents = [{ t: 'gate', x: 85, y: 19 }, { t: 'mover', x: 55, y: 16, len: 2, range: 4, speed: 34 }, { t: 'mover', x: 70, y: 18, len: 2, vert: true, rise: 4, period: 3.2 }];
    d.start = { x: 5, y: 19 }; MKR.doc = d;
    MKR.play(); BK.god = true; BK.step(30); const P = BK.P;
    BK.tp(24, 18); BK.step(120); r.swim = !!P.swim;   /* dropped in from above: a body put inside the water never splashed into it */
    BK.tp(43, 18); BK.step(10); const y0 = P.y; BK.step(30); r.holds = Math.abs(P.y - y0) < 2; let low = P.y; for (let i = 0; i < 300; i++) { BK.step(1); low = Math.max(low, P.y); } r.dropped = low > y0 + 32;   /* the LOWEST he got: he falls, dies and is back at the start inside the window */
    MKR.play(); BK.god = true; BK.step(30); r.standsAgain = (BK.L.crumbles || []).every(c => c.st === 'whole');
    const M = BK.movers(); r.movers = M.length; const m = M.find(q => !q.vert);
    P.x = m.x + m.w / 2; P.y = m.y; P.vx = P.vy = 0; BK.step(5); const x0 = P.x; BK.step(60); r.carried = Math.abs(P.x - x0) > 8 && Math.abs(P.y - m.y) < 3;
    const lift = M.find(q => q.vert); let lo = lift.y, hi = lift.y; for (let i = 0; i < 240; i++) { BK.step(1); lo = Math.min(lo, lift.y); hi = Math.max(hi, lift.y); } r.liftMoves = hi - lo > 32;   /* its whole travel, not one sample that may sit on a turn */
    MKR.resume();
    /* SAVE -> LOAD keeps it (slot 3, the last; put back afterwards) */
    const KEY = 'bracken.level.2', keep = localStorage.getItem(KEY);
    const kd = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: false })); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    kd('f'); kd('f'); kd('s'); const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    r.saved = !!saved && saved.water && saved.water.length === 1 && saved.crumble && saved.crumble.length === 5;
    MKR.doc = MKR.blank(60, 28); kd('l'); r.loaded = MKR.doc.water.length === 1 && MKR.doc.crumble.length === 5;
    kd('f');   /* back to slot 1 */
    if (keep === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, keep);
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['swim', 'holds', 'dropped', 'standsAgain', 'carried', 'liftMoves', 'saved', 'loaded']) assert(r[k], 'maker terrain: ' + k + ' failed ' + JSON.stringify(r));
  assert.equal(r.movers, 2);
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-terrain: water swims, crumbling ledges drop and stand again, platforms carry, lifts rise, and save/load keeps it all.');
} finally { pg.close(); }
