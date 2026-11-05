// tools/fallen-pillars.mjs - A FALLEN PILLAR NEVER TRAPS ANYONE (claude/undercrown3; Daniel 11-04 15:32). NODE ONLY (no browser).
// Builds THE UNDERCROWN 3 (BRACKEN_UC3=1), brings every slab down every way it can come down (flat; swung on either post), lays what it leaves
// (src/fallen-pillar.js restFor / undercrown-slabs.js rampFor) and flies the game's own collision (src/slopes.js moveBodySlopes, through
// fallenView exactly as main.js moveBody does) over it:
//   HEROES   every hero's legs (src/hero-move.js), 1-4 seats side by side, BOTH WAYS over every pillar that lies on a floor, by every route a
//            player has: UNDER (walk the crawl gap / the wedge under a ramp; the running slide in under a ramp's foot), OVER (hop onto a
//            shelf's one-way top and off), and from INSIDE (stood in the gap, in the wedge, on top). Each must arrive within 6 s and never stand
//            still against it for 2 s (the watchdog).
//   THE PRINCE  his own body (22 x 60) and his own crossing logic (src/undercrown3.js princeMode / princeCross / princeWatch - the code the game
//            runs) both ways over each tomb slab flat and swung: arrives, with a told HOP or DUCK, and the watchdog never fires. PINNED (buried),
//            SCORCHED or REELING he does not move a pixel.
// Exit 1 on any failure. Usage: node tools/fallen-pillars.mjs [--verbose]
process.env.BRACKEN_UC3 = '1';
const { LEVELS, T, TS, UC3 } = await import('../src/level.js');
const { rampFor } = await import('../src/undercrown-slabs.js');
const FP = await import('../src/fallen-pillar.js');
const { moveBodySlopes } = await import('../src/slopes.js');
const { MOVE, HERO_MOVE_IDS, heroRunMul } = await import('../src/hero-move.js');
const { makeUndercrown3Hands } = await import('../src/undercrown3.js');
const { DUCK_H } = await import('../src/duck.js');
const VERBOSE = process.argv.includes('--verbose');
if (!UC3) { console.error('UC3 flag did not turn on'); process.exit(1); }
const L0 = LEVELS.find(l => l.id === 'undercrown').build();
const W = L0.W, H = L0.H, DT = MOVE.DT;
let fails = 0, passes = 0; const fail = m => { fails++; console.log('  FAIL ' + m); }, ok = m => { passes++; if (VERBOSE) console.log('  ok   ' + m); };

/* ONE FALL: a fresh grid, the slab's course cleared, what it leaves laid. Returns { grid, ta, cells: Map, rec (as main.js SLAB_RT) } or null */
function fall(slab, how) {
  const grid = L0.grid.slice(), ta = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : grid[y * W + x];
  for (let x = slab.x0; x <= slab.x1; x++) for (let y = slab.row; y > slab.row - (slab.deep || 1); y--) { const t = grid[y * W + x]; if (t === T.SOLID || t === T.SOFT || t === T.ONEWAY || t === T.PLANK || t === T.SHELF || t === T.RAIL) grid[y * W + x] = T.AIR; }
  const rec = { ...slab, state: how === 'flat' ? 'flat' : 'ramp' }, cells = new Map(); let laid;
  if (how === 'flat') { laid = FP.restFor(ta, slab); if (!laid) return null; rec.flat = laid; }
  else { laid = rampFor(ta, slab, how); if (!laid) return null; rec.ramp = laid; }
  for (const [x, y, t] of laid.cells) { grid[y * W + x] = t; cells.set(y * W + x, rec.state); }
  return { grid, ta, cells, rec, laid };
}
const floorUnder = (ta, x, fromRow) => { for (let y = fromRow; y < H; y++) { const t = ta(x, y); if (t === T.SOLID || t === T.PLANK || t === T.ONEWAY || t === T.RAIL || t === T.CRYST) return y; } return null; };

/* A HERO, FLOWN: the game's arc (src/hero-move.js), the stick held toward goalX, a jump when walled, the route's own presses.
   route: 'walk' (hop only when walled), 'over' (a jump at the near edge, then the stick held), 'slide' (the running slide into the near edge),
   'drop' (on a ramp and not climbing: DOWN + JUMP). Returns { t (s to arrive) | null, stuck (s the longest stand-still) } */
function flyHero(fz, hero, seats, x0, y0, goalX, route, near) {
  const bodies = []; for (let i = 0; i < seats; i++) bodies.push({ x: x0 - Math.sign(goalX - x0) * i * 12, y: y0, vx: 0, vy: 0, w: MOVE.BODY_W, h: MOVE.BODY_H, ground: true, slideT: 0, dropT: 0, best: Infinity, stillT: 0, maxStill: 0, done: false, jumped: false });
  const cap = MOVE.RUN * heroRunMul(hero, true), capA = MOVE.RUN * heroRunMul(hero, false);
  for (let f = 0; f < 6 / DT; f++) {
    for (const b of bodies) { if (b.done) continue;
      const dir = Math.sign(goalX - b.x), dist = Math.abs(goalX - b.x);
      if (dist < 6) { b.done = true; b.t = f * DT; continue; }
      const lead = (near - b.x) * dir;
      if (route === 'over' && b.ground && !b.jumped && lead < 14 && lead > 0) { b.vy = MOVE.JUMPV; b.ground = false; b.jumped = true; }
      if (route === 'slide' && b.ground && !b.slid && lead < 30 && lead > 0) { b.slid = true; b.slideT = 0.45; }
      b.lowSlide = b.slideT > 0; b.slideT = Math.max(0, b.slideT - DT);
      const want = dir * (b.ground ? cap : capA); b.vx = b.lowSlide ? dir * Math.max(Math.abs(b.vx), cap) : want;
      const g = Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.APEX_G : b.vy > 0 ? MOVE.FALL_G : 1;
      b.vy = Math.min(MOVE.MAX_FALL, b.vy + MOVE.GRAV * g * DT);
      const drop = b.dropT > 0; b.dropT = Math.max(0, b.dropT - DT);
      const view = FP.fallenView(fz.ta, W, fz.cells, b, { drop: drop || b.lowSlide });
      const r = moveBodySlopes(b, b.vx * DT, b.vy * DT, view, { allowDrop: drop, forceSlopePath: true });
      if (r.ground) { b.vy = 0; } b.ground = r.ground;
      if (r.hitX && r.ground) { b.vy = MOVE.JUMPV; b.ground = false; }   /* walled: a player hops */
      if (route === 'drop' && r.ground && r.slope && fz.cells.has(Math.floor((b.y - 1) / TS) * W + Math.floor(b.x / TS))) { b.dropT = 0.2; }   /* DOWN + JUMP on the ramp (main.js: P.drop on a fallen slope) */
      b.stillT = Math.abs(b.x - (b.px ?? b.x)) < 0.05 ? b.stillT + DT : 0; b.maxStill = Math.max(b.maxStill, b.stillT); b.px = b.x;
      if (b.y > (H - 1) * TS) { b.lost = true; b.done = true; }
    }
    if (bodies.every(b => b.done)) break;
  }
  const t = bodies.every(b => b.done && !b.lost) ? Math.max(...bodies.map(b => b.t)) : null;
  return { t, stuck: Math.max(...bodies.map(b => b.maxStill)), lost: bodies.some(b => b.lost) };
}

/* ---- THE CASES ---- */
const slabs = L0.slabs;
const cases = [];
for (const s of slabs) for (const how of ['flat', 1, -1]) {
  if (how !== 'flat' && s.anchor && s.anchor !== how) continue;   /* a keyed end only ever holds */
  if (how !== 'flat' && !s.anchor) { /* both posts: either may be the one left standing */ }
  const fz = fall(s, how); if (!fz) { if (VERBOSE) console.log(`  (${s.id} ${how}: cannot lie that way - it tears off / drops flat)`); continue; }
  cases.push({ s, how, fz });
}
console.log(`FALLEN PILLARS - ${cases.length} ways ${slabs.length} slabs can lie (UC3), ${HERO_MOVE_IDS.length} heroes x 1-4 seats`);
const kinds = {};
for (const { s, how, fz } of cases) {
  const kind = how === 'flat' ? fz.laid.kind : 'ramp'; kinds[kind] = (kinds[kind] || 0) + 1;
  const tag = `${s.id} ${how === 'flat' ? 'flat (' + kind + ')' : 'swung, ' + (how > 0 ? 'right' : 'left') + ' post holds'}`;
  if (kind === 'bridge') { /* over a gap: the bridge is walked; its top course is one-way */
    const topOk = fz.laid.cells.every(([x, y, t]) => y !== fz.laid.row || t === T.ONEWAY); topOk ? ok(tag + ': top course one-way') : fail(tag + ': bridge top course not one-way'); continue; }
  /* the floor it lies on: either side of it */
  const l = (s.x0 - 1) * TS, r = (s.x1 + 2) * TS;
  const land = kind === 'ramp' ? fz.laid.foot[1] / TS : fz.laid.land;
  const fl = floorUnder(fz.ta, s.x0 - 3, land - 1), fr = floorUnder(fz.ta, s.x1 + 3, land - 1);
  if (fl !== land || fr !== land) { if (VERBOSE) console.log(`  (${tag}: not on one floor both sides - L ${fl} R ${fr} land ${land}; skipped)`); continue; }
  const yF = land * TS, xL = (s.x0 - 3) * TS + 8, xR = (s.x1 + 3) * TS + 8;
  const runs = [];
  if (kind === 'shelf') {
    runs.push(['L>R under', xL, yF, xR, 'walk', l], ['R>L under', xR, yF, xL, 'walk', r], ['L>R over', xL, yF, xR, 'over', s.x0 * TS], ['R>L over', xR, yF, xL, 'over', (s.x1 + 1) * TS]);
    const mid = (s.x0 + s.x1 + 1) * TS / 2;
    runs.push(['in the gap > L', mid, yF, xL, 'walk', l], ['in the gap > R', mid, yF, xR, 'walk', r], ['on top > L', mid, fz.laid.row * TS, xL, 'walk', l], ['on top > R', mid, fz.laid.row * TS, xR, 'walk', r]);
    /* the gap really is a crawl gap: 16 px clear under every column */
    const gapOk = (() => { for (let x = s.x0; x <= s.x1; x++) if (fz.ta(x, fz.laid.gapRow) !== T.AIR) return false; return true; })();
    gapOk ? ok(tag + ': crawl gap clear') : fail(tag + ': crawl gap not clear');
    (fz.laid.land - 1 - fz.laid.row + 1) * TS - TS * FP.FALLEN.GAP >= 0 ? ok(tag + ': one-way top') : fail(tag + ': shelf rows');
    if (TS * FP.FALLEN.GAP < MOVE.BODY_H) fail(tag + ': gap shorter than a standing hero');
    if (TS * FP.FALLEN.GAP < DUCK_H) fail(tag + ': gap shorter than a ducked hero');
  } else {
    const hiRight = fz.laid.top[0] > fz.laid.foot[0];   /* the hinge (high) end */
    const footX = fz.laid.foot[0], hiX = fz.laid.top[0];
    const xFoot = hiRight ? xL : xR, xHi = hiRight ? xR : xL;
    runs.push(['hinge side > foot side (under)', xHi, yF, xFoot, 'walk', hiX], ['foot side > hinge side (slide under)', xFoot, yF, xHi, 'slide', footX], ['foot side > hinge side (up, drop through)', xFoot, yF, xHi, 'drop', footX]);
    const mid = (s.x0 + s.x1 + 1) * TS / 2;
    runs.push(['in the wedge > foot side', mid, yF, xFoot, 'walk', footX], ['in the wedge > hinge side', mid, yF, xHi, 'walk', hiX]);
  }
  for (const [name, x0, y0, gx, route, near] of runs) {
    let worst = null;
    for (const hero of HERO_MOVE_IDS) for (let seats = 1; seats <= 4; seats++) {
      const res = flyHero(fz, hero, seats, x0, y0, gx, route, near);
      if (res.t === null || res.stuck > FP.FALLEN.STUCK_T) { worst = `${hero} x${seats}: ${res.t === null ? (res.lost ? 'fell out' : 'never arrived') : 'arrived'}, stood still ${res.stuck.toFixed(2)} s`; break; }
    }
    worst ? fail(`${tag}: ${name}: ${worst}`) : ok(`${tag}: ${name}: every hero, 1-4 seats`);
  }
}

/* ---- THE PRINCE (his own crossing code: src/undercrown3.js) ---- */
const noop = () => {};
function princeRun(fz, x0, goalX, mode0 = 'stalk', modeT0 = 0) {
  const ctx = { L: { uc3: true }, TS, tileAt: fz.ta, slabs: () => [fz.rec], number: noop, sfx: {}, parts: [], hint: noop };
  const Hh = makeUndercrown3Hands(ctx);
  const floorY = (fz.rec.flat ? fz.rec.flat.land : fz.rec.ramp.foot[1] / TS) * TS;
  const e = { t: 'prince', x: x0, y: floorY, vx: 0, vy: 0, w: 22, h: 60, mode: mode0, modeT: modeT0, face: 1, phase: 2, n: {}, stagger: 0 };
  let maxStill = 0, still = 0, px = e.x, t = null; const xStart = e.x;
  for (let f = 0; f < 15 / DT; f++) {
    e.modeT -= DT;
    let want = 0; const d = goalX - e.x;
    const u = Hh.princeMode(e, DT);
    if (u !== null) want = u;
    else if (e.mode === 'stalk') { want = Math.abs(d) > 6 ? Math.sign(d) * 44 : 0; }
    else if (e.mode === 'buried' || e.mode === 'reel') { want = 0; if (e.modeT <= 0) e.mode = 'stalk'; }
    if (e.mode === 'stalk' && want && Hh.princeCross(e, want)) want = 0;
    Hh.princeWatch(e, DT, want);
    e.vy = Math.min(400, e.vy + 1000 * DT); e.vx += (want - e.vx) * Math.min(1, DT * 6);
    const view = FP.fallenView(fz.ta, W, fz.cells, e, { ghost: !!e.fpGhost });
    const r = moveBodySlopes(e, e.vx * DT, e.vy * DT, view, { forceSlopePath: true }); if (r.ground) e.vy = 0; e.onGround = r.ground;
    if (r.hitX && r.ground && want) e.vy = -260;
    if (mode0 !== 'stalk' && f * DT < modeT0 - 0.05 && Math.abs(e.x - xStart) > 0.5) return { moved: true };
    if (e.mode === 'stalk' && Math.abs(goalX - e.x) <= 6) { t = f * DT; break; }
    still = (Math.abs(e.x - px) < 0.05 && e.mode === 'stalk') ? still + DT : 0; maxStill = Math.max(maxStill, still); px = e.x;
  }
  return { t, maxStill, n: e.n, moved: false };
}
let pc = 0;
for (const { s, how, fz } of cases) {
  if (!s.tomb) continue;
  const kind = how === 'flat' ? fz.laid.kind : 'ramp', tag = `PRINCE ${s.id} ${how === 'flat' ? 'flat (' + kind + ')' : 'swung, ' + (how > 0 ? 'right' : 'left') + ' post holds'}`;
  const xL = (s.x0 - 4) * TS, xR = (s.x1 + 5) * TS;
  for (const [name, a, b] of [['L>R', xL, xR], ['R>L', xR, xL]]) {
    const res = princeRun(fz, a, b); pc++;
    const how2 = (res.n.hop ? 'HOP ' + res.n.hop : '') + (res.n.duck ? 'DUCK ' + res.n.duck : '');
    if (res.t === null) fail(`${tag} ${name}: he never got across (${how2 || 'no cross'}; stuck ${res.n.stuck || 0})`);
    else if (res.n.stuck) fail(`${tag} ${name}: across in ${res.t.toFixed(2)} s but only by the watchdog (${res.n.stuck}x)`);
    else if (!how2) fail(`${tag} ${name}: across with no told hop/duck`);
    else ok(`${tag} ${name}: across in ${res.t.toFixed(2)} s, ${how2}, longest stand-still ${res.maxStill.toFixed(2)} s`);
  }
  /* HELD: pinned, scorched, reeling - he stays put (the opening) */
  for (const m of ['buried', 'scorched', 'reel']) { const res = princeRun(fz, xL, xR, m, 1.5); pc++; res.moved ? fail(`${tag}: ${m.toUpperCase()} he moved`) : ok(`${tag}: ${m} - he stays put`); }
}
/* THE WATCHDOG, by itself */
{ const w = {}, b = { x: 10 }; let fired = false; for (let i = 0; i < 2.2 / DT; i++) if (FP.stuckStep(w, b, DT, true, false)) fired = true; fired ? ok('watchdog fires after 2 s against a wall') : fail('watchdog never fired');
  const w2 = {}; let f2 = false; for (let i = 0; i < 3 / DT; i++) if (FP.stuckStep(w2, b, DT, true, true)) f2 = true; !f2 ? ok('watchdog quiet while he is held') : fail('watchdog fired on a held Prince'); }
console.log(`  kinds laid: ${JSON.stringify(kinds)}; Prince runs ${pc}`);
console.log(fails ? `FALLEN PILLARS: ${fails} FAILED, ${passes} passed` : `FALLEN PILLARS: all ${passes} passed`);
process.exit(fails ? 1 : 0);
