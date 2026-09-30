// tools/fair-route.mjs - THE HARVEST FAIR's ROUTE PILOT (claude/fairlevel): one hero, real keys, no god mode, the foes gone (this is geometry, not a fight), walks the level from the gate to
// the door of the Maypole Green by each road, and by the rides. Not "can the bot fight": "is every climb, hop, ride and slide a hero can be asked to do one a hero can do".
//   node tools/fair-route.mjs [low|high|strike|all] [hero]     default all, knight. Prints each leg; exits 1 if a road does not reach the door (x 619, on the road).
// LOW    the road under everything: pits, the slope stair, the terrace, the carousel, the hall of mirrors, the tower stair (three-row hops), the helter-skelter slide, two ricks (the hay throws you
//        over their spikes), the corn maze (three tiers, two chimneys), THE GHOST TRAIN (claude/fairfix: the chase runs - the pilot waits for each beam to lift), the small carousel under its
//        canopy, a rick, the blind stall wall, the barker's crate, the door.
// HIGH   the rides: the wheel (hop on a car coming round low, step off at the top), three swing-ride chairs (board at the beat, step off at the far island), the tower top, the slide.
// STRIKE the roof stair up to the boardwalk by the striker (a plunge on the pad), the boardwalk, down to the terrace; the tall striker onto the night lane, and down its steps.
import { openPage } from './cdp.mjs';
const which = process.argv[2] || 'all', hero = process.argv[3] || 'knight';
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const fi = LEVELS.findIndex(l => l.id === 'fair'); const out = { legs: [], fail: [] };
    const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk']) K[k] = false; };
    const load = () => { BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.sim(5); for (const e of BK.enemies()) e.alive = false; BK.god = false; none(); };
    const P = () => BK.P, L = () => BK.getL ? BK.getL() : BK.L;
    const tile = (tx, ty) => { const l = L(); return tx < 0 || ty < 0 || tx >= l.W || ty >= l.H ? 1 : l.grid[ty * l.W + tx]; };
    const solid = t => t === 1 || t === 4 || t === 7 || t === 12 || t === 13 || t === 15 || t === 16 || t === 17;
    const stand = t => solid(t) || t === 2 || t === 8 || t === 10 || t === 11 || t === 14 || t === 18 || (t >= 20 && t <= 25);
    const at = () => ({ x: +(P().x / 16).toFixed(1), y: +(P().y / 16).toFixed(2), g: P().ground, hp: P().hp });
    const fails = (m) => { out.fail.push(m + ' @ ' + JSON.stringify(at())); return false; };
    const to = (name, f) => { const t0 = at(), ok = f(); out.legs.push(name + ': ' + (ok ? 'ok' : 'FAIL') + ' ' + JSON.stringify(at())); return ok; };
    const step = n => { for (let i = 0; i < n; i++) BK.sim(1); };
    /* WALK to tile tx (centre), hopping pits and one-tile steps as a hero does: jump when the way ahead has no footing under it or a wall stands in it. Stops within 5 px. */
    const walk = (tx, maxF = 9000) => { const gx = tx * 16 + 8; let stuck = 0, lx = P().x;
      for (let i = 0; i < maxF; i++) { const p = P(), d = gx - p.x; if (Math.abs(d) < 5 && p.ground) { none(); return true; }
        const dir = d > 0 ? 1 : -1; K.right = dir > 0; K.left = dir < 0; K.jump = false;
        if (p.ground) { const ax = Math.floor((p.x + dir * 13) / 16), fy = Math.floor(p.y / 16), ay = fy - 1;
          const wall = solid(tile(ax, ay)) || solid(tile(ax, ay - 1)), noFoot = !stand(tile(ax, fy)) && !stand(tile(ax, fy + 1));
          if (wall || noFoot) { K.jump = true; BK.press('jump'); } }
        else if (p.vy < 0) K.jump = true;
        BK.sim(1); if (Math.abs(P().x - lx) < 0.05) { if (++stuck > 90) { none(); return fails('walk stuck to ' + tx); } } else { stuck = 0; lx = P().x; } }
      none(); return fails('walk to ' + tx + ' timed out'); };
    /* HOP toward tile tx onto a ledge whose top is row trow: walk until the target's centre is within 34 px, jump holding jump and the direction, land */
    const hop = (tx, trow, near = 34, maxF = 400) => { const gx = tx * 16 + 8; let jumped = false;
      for (let i = 0; i < maxF; i++) { const p = P(), d = gx - p.x, dir = d > 0 ? 1 : -1; K.right = dir > 0; K.left = dir < 0;
        if (p.ground && !jumped && Math.abs(d) <= near) { K.jump = true; BK.press('jump'); jumped = true; } else if (jumped && P().vy < 0) K.jump = true; else K.jump = false;
        BK.sim(1); if (jumped && P().ground && Math.abs(P().y - trow * 16) < 4 && Math.abs(P().x - gx) < 30) { none(); return true; }
        if (jumped && P().ground && i > 20 && Math.abs(P().y - trow * 16) >= 4) { none(); return fails('hop to ' + tx + ',' + trow + ' landed low'); } }
      none(); return fails('hop to ' + tx + ',' + trow + ' timed out'); };
    /* A RICK: run at the hay, jump onto its cap (it throws you up), and drift on to tile tx to land clear of the spikes past it */
    const rick = (x0, tx) => { walk(x0 - 3); let lastGround = 0;
      for (let i = 0; i < 400; i++) { const p = P(); K.right = true; K.left = false; const near = p.x > (x0 - 1) * 16; if (p.ground && !near) K.jump = false; if (p.ground && near && !lastGround) { K.jump = true; BK.press('jump'); }
        BK.sim(1); if (P().ground && P().x >= tx * 16) { none(); return true; } if (P().dead) { none(); return fails('died on a rick'); } }
      none(); return fails('rick ' + x0 + ' did not clear'); };
    /* THE BIG WHEEL: stand where the cars pass low, hop onto one, ride it up, and step off to the right at the top */
    const cars = () => BK.movers().filter(m => m.kind === 'wheel' && m.fair === 'gondola');
    const wheel = (standTx, landTx, landRow) => { if (!walk(standTx)) return false; const top = Math.min(...cars().map(m => m.py - m.r)) + 6;
      let offCar = 0;
      for (let i = 0; i < 1500; i++) { const p = P(); K.right = false; K.left = false; K.jump = false;
        if (!p.onMover) { const c = cars().find(m => { const rel = m.x + m.w / 2 - p.x; return rel > 46 && rel < 60 && m.y > p.y - 40 && m.y < p.y + 14 && m.dx < 0; });   /* it is coming toward us: the hop takes a second and a bit, and it will be under us by then (a car moves ~50 px a second at the bottom) */ if (c && p.ground) { K.jump = true; BK.press('jump'); } else if (!p.ground && p.vy < 0) K.jump = true; if (offCar > 0 && P().x < (landTx + 0.5) * 16) K.right = true; if (offCar > 0) offCar++; }
        else { const c = p.onMover; if (c.y <= top && c.dx > 0) { K.right = true; K.jump = true; BK.press('jump'); offCar = 1; } }
        BK.sim(1); if (P().ground && !P().onMover && Math.abs(P().y - landRow * 16) < 4 && P().x > landTx * 16 - 8) { none(); return true; } }
      none(); return fails('the wheel did not carry us to ' + landTx + ',' + landRow); };
    /* A SWING-RIDE CHAIR: from the island's edge, jump onto the seat when it comes to us, ride, and jump off when it comes to the far island */
    const chairs = () => BK.movers().filter(m => m.kind === 'swing' && m.fair === 'chair').sort((a, b) => a.px - b.px);
    const chair = (idx, dir, landTx, landRow) => { const gx = landTx * 16 + 8; let seen = false;
      for (let i = 0; i < 2400; i++) { const p = P(), c = chairs()[idx]; K.right = false; K.left = false; K.jump = false; const cxs = c.x + c.w / 2;
        if (p.onMover === c) { seen = true; /* the far extreme: the seat all but stops there, next to the island */ if (dir * (cxs - c.px) > 60 && Math.abs(c.dx) < 1.2) { K[dir > 0 ? 'right' : 'left'] = true; K.jump = true; BK.press('jump'); } }
        else if (!seen && p.ground) { /* the seat is swinging back toward us and is a second from the near extreme: the hop takes a second, and it will be there */ const near = dir * c.dx < 0 && dir * (cxs - c.px) > 25 && dir * (cxs - c.px) < 55; if (near) { K[dir > 0 ? 'right' : 'left'] = true; K.jump = true; BK.press('jump'); } }
        else if (!p.ground) { if (p.vy < 0) K.jump = true; K[dir > 0 ? 'right' : 'left'] = true; }
        BK.sim(1); if (seen && P().ground && !P().onMover && Math.abs(P().y - landRow * 16) < 4 && Math.abs(P().x - gx) < 56) { none(); return true; } if (P().dead) { none(); return fails('died on chair ' + idx); } }
      none(); return fails('chair ' + idx + ' did not carry us to ' + landTx); };
    /* A STRIKER: stand on the pad, jump, and come down on it with the plunge (down + attack): the bell rings and it throws you up; land on the plank over it */
    const plungeOn = (tx, landRow) => { if (!walk(tx)) return false; none(); for (let s = 0; s < 25; s++) BK.sim(1); let phase = 0;   /* (stand still a moment: a jump keeps the run it started with) */
      for (let i = 0; i < 600; i++) { const p = P(); K.jump = false; K.down = false;
        if (phase === 0 && p.ground) { K.jump = true; BK.press('jump'); phase = 1; } else if (phase === 1 && p.vy > 40) { K.down = true; BK.press('atk'); phase = 2; } else if (phase === 2) { K.down = true; if (p.vy < -300) phase = 3; } else if (phase === 3 && p.vy > -1) { phase = 4; }
        BK.sim(1); if (phase >= 3 && P().ground && Math.abs(P().y - landRow * 16) < 4) { none(); return true; } if (phase === 2 && P().ground) phase = 0; }
      none(); return fails('the striker at ' + tx + ' did not throw us onto row ' + landRow); };
    /* THE GHOST TRAIN (claude/fairfix): cross the start line, and at each beam run up to it, wait for it to lift (the same clock as its hurt: BK.fairTime), and run under it. Never stop long: it is behind you */
    const train = () => { const C = L().chases[0]; if (!walk(Math.floor(C.trigger / 16) - 2)) return false;
      for (const b of C.beams) { const bx = Math.floor(b.x0 / 16); if (!walk(bx - 1)) return false;
        for (let i = 0; i < 400; i++) { const ph = BK.fairTime() % b.period; if (ph <= b.up - 0.6) break; none(); BK.sim(1); if (P().dead) return fails('the ghost train caught us at the beam at ' + bx); } }
      return walk(Math.floor(C.end / 16) + 3) || fails('the ghost train'); };
    const strikeRoad = () => { load();
      return to('the first striker onto the boardwalk', () => walk(86) && plungeOn(88, 19)) && to('the boardwalk to the terrace and down', () => walk(160) && walk(184) && walk(200))
      && to('(the carousel, the midway and the slide are the low road)', () => { BK.tp(402, 27); BK.sim(20); return true; })
      && to('the tall striker onto the corn-top walk', () => rick(403, 409) && walk(409) && plungeOn(409, 12)) && to('the corn-top walk and the stair down', () => walk(436) && walk(439) && walk(442) && walk(447))
      && to('(the last round is the low road)', () => { BK.tp(562, 27); BK.sim(20); return true; })
      && to('the tall striker onto the night lane', () => plungeOn(566, 14)) && to('the night lane and its steps', () => walk(594) && walk(597) && walk(600) && walk(610));
    };
    if ('${which}' === 'strike' || '${which}' === 'all') { const ok = strikeRoad(); out.strike = { ok, at: at() }; if (!ok) out.fail.push('the STRIKER roads did not work'); }
    const lowRoad = () => {
      load();
      return to('gate to the carousel', () => walk(260)) && to('the carousel disc', () => walk(263) && walk(291)) && to('the wheel yard and the hall of mirrors', () => walk(345))
      && to('the tower stair', () => hop(349, 25) && hop(352, 22) && hop(355, 19) && hop(360, 16) && hop(362, 14))
      && to('the helter-skelter slide', () => { const ok = walk(366); if (!ok) return false; K.right = true; K.down = true; for (let i = 0; i < 500 && P().x < 384 * 16; i++) BK.sim(1); none(); return P().ground && P().x > 380 * 16; })
      && to('rick one', () => rick(403, 409)) && to('the corn maze, tier one', () => walk(431))
      && to('chimney one', () => hop(432, 26) && hop(430, 23)) && to('tier two', () => walk(420))
      && to('chimney two', () => hop(416, 21) && hop(418, 18, 44)) && to('tier three and out', () => walk(437) && walk(439) && walk(442) && walk(447))
      && to('rick two', () => rick(449, 456)) && to('the ghost train', () => train()) && to('the small carousel under its canopy', () => walk(527) && walk(531) && walk(550))
      && to('rick three', () => rick(557, 563)) && to('the last pit and the door', () => walk(619));
    };
    const highRoad = () => { load();
      return to('gate to the wheel', () => walk(260) && walk(263) && walk(291)) && to('the big wheel up to the boardwalk', () => wheel(304, 309, 17))
      && to('walk the landing to the first chair', () => walk(313)) && to('chair one', () => chair(0, 1, 327, 17)) && to('chair two', () => walk(329) && chair(1, 1, 345, 16))
      && to('chair three', () => walk(347) && chair(2, 1, 362, 14)) && to('the tower top and the slide', () => { if (!walk(366)) return false; K.right = true; K.down = true; for (let i = 0; i < 500 && P().x < 384 * 16; i++) BK.sim(1); none(); return P().ground && P().x > 380 * 16; }); };
    if ('${which}' === 'high' || '${which}' === 'all') { const ok = highRoad(); out.high = { ok, at: at() }; if (!ok) out.fail.push('HIGH road did not reach the tower'); }
    if ('${which}' === 'low' || '${which}' === 'all') { const ok = lowRoad(); out.low = { ok, at: at() }; if (!ok) out.fail.push('LOW road did not reach the door'); }
    return out; })()`, 900000);
} finally { console.log(JSON.stringify(R && R.legs, null, 1)); console.log(R && JSON.stringify({ low: R.low, high: R.high, strike: R.strike, fail: R.fail })); console.log('errors', JSON.stringify(pg.errors.slice(0, 3))); pg.close(); }
if (!R || R.fail.length) process.exit(1);
