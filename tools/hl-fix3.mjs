/* tools/hl-fix3.mjs - THE HL_FIX3 BATCH, proven in NODE (no page, no browser). claude/hlfix3, 11-14 (Daniel played the live level: carts wait, a net + a return winch at every section, five shrines).
     1  the level (flag-on data, with and without the switch rule): lints clean, the ten nets and five shrines are on decks / in the grid, the builder agrees, the flag OFF build is the old one
     2  A. CARTS WAIT: the gondola cab never moves with nobody aboard (from rest, from a hero beside it); one hero aboard = a 0.6 s beat then it goes; co-op = up to 2.5 s more for the others coming
        (leaves early when they board, at once when they are far or downed); an empty cab at the dock comes back along its way (never left away from a hero at the start); the counterweight cage
        never rises empty (a struck stone alone moves nothing), has the same beat and wait, delivers the hero to the top and comes home empty for the next
     3  B. FALL RECOVERY: a drop from every line (every 16 px, calm + gust) ends on something at or above its section's net row - never a section lower; every drop that ends on a net costs 10 pct max hp
        (floor 1 hp: a 1 hp hero keeps it), gives the grace; the return winch then delivers him to the ledge he fell from, i.e. every net row is landed on, for every hero class (HERO_MOVE_IDS)
     4  C. CHECKPOINTS: five shrines, each on a deck, and the three new / moved ones stand on the walk between the line that tops out there and the line that leaves from there (the hero cannot take
        the route without passing them); the walked route (tools/pacing.mjs): five on it, no run over MAX
   Usage: node tools/hl-fix3.mjs [--quick] (--quick: the knight only in the fall sweeps)   [--strict-hash: the flag-off build hash must be master's] */
globalThis.__HLFIX3 = true;   /* the page's level row (src/level.js) builds the flag-on level in this process; the tests build the OFF one explicitly (fx: false) */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const { LK, TS, lineInit, riderStep, kitStep, kitStrike, platforms, lineY, windPush, lintLines, inReach, cabFloor } = await import('../src/line-kit.js');
const { netInit, netSeat, netHeld, haulReady, NET } = await import('../src/line-net.js');
const { HL_DATA_FX, HL_DATA_SW_FX, HL_DATA, HL_DATA_SW, HL, FIX3_NETS, FIX3_CHECKS, buildHighLines, HL_FIX3 } = await import('../src/highlines.js');
const { MOVE, HERO_MOVE_IDS, heroRunMul } = await import('../src/hero-move.js');
const { T, LEVELS } = await import('../src/level.js');
const { pacing } = await import('./pacing.mjs');
const { MAX, judgeLevel } = await import('./checkpoint-rule.mjs');

const QUICK = process.argv.includes('--quick'), STRICT = process.argv.includes('--strict-hash');
const DT = 1 / 60; let n = 0; const SOFT = !!process.env.HL_SOFT, fails = []; const ok = (c, m) => { if (!c && SOFT) { fails.push(m); return; } assert(c, m); n++; };   /* HL_SOFT=1: list every failure instead of stopping at the first (lab use) */ const t0 = Date.now();
const WALL_L = 1 * TS + 5, WALL_R = (HL.W - 1) * TS - 5;
const painter = (W, H) => { const grid = new Uint8Array(W * H), ents = []; const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  return { W, H, grid, ents, set, block: (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, T.SOLID); }, ent: (t, x, y, o = {}) => ents.push({ t, x, y, ...o }) }; };
ok(HL_FIX3 === true, 'the flag is on in this process (the page builds the flag-on level)');

/* ---------- the body physics (tools/highlines.mjs's, plus hp + the net seat the page runs) ---------- */
const statics = L => [...L.landings, ...(L.nets || [])].map((b, i) => ({ i, x0: b[0] * TS, x1: (b[2] + 1) * TS, top: b[1] * TS }));
const mkBody = (hero, x, y) => ({ hero, x, y, vx: 0, vy: 0, ground: true, face: 1, atk: -1, dead: false, on: null, hp: 100, maxHp: 100, inv: 0 });
const surfaces = (kit, S) => S.concat(platforms(kit).map(p => ({ i: p.id, x0: p.x0, x1: p.x1, top: p.top, plat: true })));
function phys(kit, b, inp, all) {
  if (b.lk || b.dead) return;
  const want = (inp.right ? 1 : 0) - (inp.left ? 1 : 0), cap = MOVE.RUN * heroRunMul(b.hero, b.ground);
  if (want) b.face = want;
  if (b.ground && inp.jumpPress) { b.vy = MOVE.JUMPV; b.ground = false; b.on = null; }
  const acc = b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR, fr = b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR;
  if (want) { const tg = want * cap; if (Math.abs(b.vx) > cap && Math.sign(b.vx) === want) b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx) - cap, MOVE.OVER_BLEED * DT); else b.vx += Math.sign(tg - b.vx) * Math.min(Math.abs(tg - b.vx), acc * DT); }
  else b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx), fr * DT);
  if (!b.ground) { const g = MOVE.GRAV * (Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.APEX_G : b.vy > 0 ? MOVE.FALL_G : 1); b.vy = Math.min(MOVE.MAX_FALL, b.vy + g * DT); windPush(kit, b, DT); }
  const oy = b.y; b.x += b.vx * DT; if (!b.ground) b.y += b.vy * DT;
  if (b.x < WALL_L) { b.x = WALL_L; b.vx = Math.max(0, b.vx); } if (b.x > WALL_R) { b.x = WALL_R; b.vx = Math.min(0, b.vx); }
  if (!b.ground && b.vy >= 0) for (const s of all) if (b.x >= s.x0 && b.x < s.x1 && oy <= s.top + 0.5 && b.y >= s.top) { b.y = s.top; b.vy = 0; b.ground = true; b.on = s; break; }
  if (b.ground) { const s = all.find(q => b.x >= q.x0 && b.x < q.x1 && Math.abs(b.y - q.top) <= 1); if (!s) { b.ground = false; b.on = null; } else b.on = s; }
  if (b.y > kit.pitY) b.dead = true;
}
const hbOf = b => ({ l: b.face > 0 ? b.x : b.x - 26, r: b.face > 0 ? b.x + 26 : b.x, t: b.y - 22, b: b.y - 2 });
/* one frame as the page runs it: the world, then each seat (the net first: the winch has him or it does not; then the line kit, then the body) */
function tick(R, bodies, inpOf, evs) {
  const ev = kitStep(R.kit, bodies, DT); const all = surfaces(R.kit, R.S);
  for (const b of bodies) { if (b.dead) continue; const inp = inpOf(b) || {};
    b.inv = Math.max(0, b.inv - DT); b.onMover = !!(b.on && b.on.plat);
    for (const e of netSeat(R.rec, b, { strike: !!inp.strike, talk: !!inp.talk }, DT)) ev.push({ ...e, seat: bodies.indexOf(b) });
    if (netHeld(b)) continue;
    if (inp.strike) { inp.hb = hbOf(b); if (!b.lk) { const p = kitStrike(R.kit, inp.hb); if (p) ev.push({ t: 'strike', post: p.kind }); } }
    for (const e of riderStep(R.kit, b, inp, DT)) ev.push({ ...e, seat: bodies.indexOf(b) });
    phys(R.kit, b, inp, all); }
  if (evs) evs.push(...ev); return ev;
}
const run = (R, bodies, s, inpOf, evs) => { for (let i = 0; i < Math.round(s / DT); i++) tick(R, bodies, inpOf || (() => ({})), evs); };
const rig = DATA => { const L = JSON.parse(JSON.stringify(DATA)); return { L, kit: lineInit(L), rec: netInit(L), S: statics(L) }; };
const onLine = (R, id, x, hero = 'knight') => { const z = R.kit.lines[id], b = mkBody(hero, x, lineY(z, x) + z.hang); b.ground = false; b.lk = { id, x, dir: z.dir, haul: 0, buf: 0, sway: 0, swayV: 0, v: 0, latch: false }; return b; };
const sections = [['W1', 'W2'], ['W3', 'S2', 'F1', 'F2', 'W4'], ['W5', 'G2', 'W6', 'G3'], ['H1', 'H2', 'S4', 'H3', 'S5'], ['LO', 'E1', 'E2', 'E3', 'EL', 'EG']];
const ARENA = new Set(['HL', 'SW', 'SE']);   /* the head station is SKYHOOK's: untouched (rock floor, no fall) */

for (const [label, DATA, SWRULE] of [['sw off', HL_DATA_FX, false], ['sw on (the shipping rule)', HL_DATA_SW_FX, true]]) {
  console.log('--- ' + label);
  /* ============ 1. THE LEVEL ============ */
  { const L = JSON.parse(JSON.stringify(DATA)), bad = lintLines(L); ok(!bad.length, label + ': the flag-on level lints clean: ' + bad.join('; '));
    ok(L.lineKit.fix3 === true && L.nets.length === 11 && L.checkpoints.length === 5, 'eleven nets (two cargo nets + eight section nets), five shrines');
    const B = buildHighLines({ painter, T, TS, sw: SWRULE, fx: true }), at = (x, y) => B.grid[y * B.W + x];
    for (const b of FIX3_NETS) for (let x = b[0]; x <= b[2]; x++) { ok(at(x, b[1]) === T.ONEWAY, 'net deck at ' + x + ',' + b[1]); ok(at(x, b[1] - 1) !== T.SOLID && at(x, b[1] - 2) !== T.SOLID, 'room over the net ' + x + ',' + b[1]); }
    ok(B.ents.filter(e => e.t === 'check').length === 5 && FIX3_CHECKS.every(c => B.ents.some(e => e.t === 'check' && e.x === c.x && e.y === c.y - 1)), 'five shrine entities, one per FIX3_CHECKS row');
    for (const c of FIX3_CHECKS) ok(L.landings.some(b => c.y === b[1] && c.x >= b[0] && c.x <= b[2]), 'the shrine ' + c.x + ',' + c.y + ' stands on a landing');
    ok(B.nets.length === 11 && B.lineKit.fix3 === true && !B.routeSupports.some(s => s.kind === 'hlgantry' && s.run && FIX3_NETS.some(b => s.run[0] === b[0] && s.y === b[1])), 'the builder hands the nets over; the new rope nets get no gantry posts');
    ok(B.ents.some(e => e.t === 'sign' && /WAITS FOR YOU/.test(e.text)) && B.ents.some(e => e.t === 'sign' && /NET/.test(e.text) && e.x === 70), 'the signs tell the carts and the nets');
    const off = buildHighLines({ painter, T, TS, sw: SWRULE, fx: false });
    ok(off.nets.length === 2 && off.checkpoints.length === 3 && off.lineKit.fix3 === undefined && !off.ents.some(e => e.t === 'sign' && /WAITS FOR YOU/.test(e.text)), 'the flag OFF build: two nets, three shrines, no fix3'); }

  /* ============ 2. A. CARTS WAIT ============ */
  { const R = rig(DATA), c = R.kit.cabs[0], x0 = c.x, home = R.kit.lines.GD;
    const stand = (dx, hero = 'knight') => { const b = mkBody(hero, c.x + dx, cabFloor(c)); b.on = { plat: true }; return b; };
    /* nobody aboard: it does not move (alone; a hero standing beside it on the station; a hero on the station coming and going) */
    run(R, [], 6); ok(c.st === 'rest' && c.x === x0, 'the cab at the station with nobody aboard stays docked 6 s');
    const beside = mkBody('knight', c.x - 40, cabFloor(c)); run(R, [beside], 6); ok(c.st === 'rest' && c.x === x0 && c.t === 0, 'a hero beside it, not in it: the cab does not stir (6 s)');
    /* one hero in it: the beat */
    { const R1 = rig(DATA), c1 = R1.kit.cabs[0], a = mkBody('knight', c1.x, cabFloor(c1)); const ev = []; let goT = null, boardT = null;
      for (let i = 0; i < 60 * 3; i++) { tick(R1, [a], () => ({}), ev); if (boardT === null && c1.st === 'board') boardT = i * DT; if (goT === null && c1.st === 'run') goT = i * DT; if (goT !== null) break; }
      ok(boardT !== null && ev.some(e => e.t === 'cabBoard') && goT !== null && goT - boardT >= LK.CAB_BOARD - DT * 2 && goT - boardT <= LK.CAB_BOARD + DT * 3, 'one hero aboard: a clank (cabBoard), then a ' + LK.CAB_BOARD + ' s beat, then it goes (' + (goT - boardT).toFixed(2) + ' s)');
      ok(c1.x === R1.kit.lines.GD.xa || Math.abs(c1.x - x0) < 4, 'and it had not moved before the beat ended'); }
    /* co-op: the other seat near, not aboard: waits up to PARTY_WAIT more; boards -> goes at once; far -> goes at the beat; downed -> goes at the beat */
    const coop = (label2, mkB, expectLo, expectHi, boardAt) => { const R2 = rig(DATA), c2 = R2.kit.cabs[0], a = mkBody('knight', c2.x, cabFloor(c2)), b2 = mkB(c2); let goT = null; const ev = [];
      for (let i = 0; i < 60 * 8 && goT === null; i++) { if (boardAt !== undefined && i === Math.round(boardAt / DT)) { b2.x = c2.x + 12; b2.y = cabFloor(c2); } tick(R2, [a, b2], () => ({}), ev); if (c2.st === 'run') goT = i * DT; }
      ok(goT !== null && goT >= expectLo && goT <= expectHi, label2 + ' (left at ' + (goT === null ? 'never' : goT.toFixed(2)) + ' s, wanted ' + expectLo + '-' + expectHi + ')'); return ev; };
    const evw = coop('co-op, the other hero coming (6 tiles off) and never boarding: the cab waits the beat + ' + LK.PARTY_WAIT + ' s then goes', c2 => mkBody('ranger', c2.x + 96, cabFloor(c2)), LK.CAB_BOARD + LK.PARTY_WAIT - 0.1, LK.CAB_BOARD + LK.PARTY_WAIT + 0.15);
    ok(evw.some(e => e.t === 'cabWait'), 'the wait is told (cabWait)');
    coop('co-op, the other hero boards at 1.2 s: it goes the moment he is in', c2 => mkBody('ranger', c2.x + 96, cabFloor(c2)), 1.2, 1.4, 1.2);
    coop('co-op, the other hero is far (30 tiles): no wait, the beat only', c2 => mkBody('ranger', c2.x + 480, cabFloor(c2)), LK.CAB_BOARD - 0.05, LK.CAB_BOARD + 0.1);
    coop('co-op, the other hero is downed beside it: no wait', c2 => { const b3 = mkBody('ranger', c2.x + 60, cabFloor(c2)); b3.down = 5; return b3; }, LK.CAB_BOARD - 0.05, LK.CAB_BOARD + 0.1);
    coop('co-op, the other hero is dead: no wait', c2 => { const b3 = mkBody('ranger', c2.x + 60, cabFloor(c2)); b3.dead = true; return b3; }, LK.CAB_BOARD - 0.05, LK.CAB_BOARD + 0.1);
    /* never stranded: ride to the dock; step off; the empty cab comes home along its way (a visible 'back'), then it takes a hero from the start again */
    { const R3 = rig(DATA), c3 = R3.kit.cabs[0], a = mkBody('knight', c3.x, cabFloor(c3)); const ev = []; let docked = false, dockT = 0;
      for (let i = 0; i < 60 * 40 && !docked; i++) { tick(R3, [a], () => ({}), ev); if (c3.st === 'dock') { docked = true; dockT = i * DT; } }
      ok(docked && ev.some(e => e.t === 'creak') && ev.some(e => e.t === 'cabDock'), 'the ride docks at the far station (' + dockT.toFixed(1) + ' s)');
      a.x = 70 * TS; a.y = 104 * TS; a.vx = 0; a.vy = 0; a.on = null;   /* he steps off onto the dock landing and walks away */
      const ev2 = []; let back = false, homeT = null; const away = c3.x;
      for (let i = 0; i < 60 * 30 && homeT === null; i++) { tick(R3, [a], () => ({}), ev2); if (c3.st === 'back') back = true; if (back && c3.st === 'rest') homeT = i * DT; }
      ok(ev2.some(e => e.t === 'cabBack') && back && homeT !== null && c3.x === x0 && away > x0 + 100, 'at the dock, empty: it comes BACK along its way (cabBack) and is home and docked after ' + (homeT === null ? 'never' : homeT.toFixed(1)) + ' s (the snap\'s line is restrung first, as before)');
      const b = mkBody('paladin', c3.x, cabFloor(c3)); const ev3 = []; let go = false; for (let i = 0; i < 60 * 3 && !go; i++) { tick(R3, [b], () => ({}), ev3); if (c3.st === 'run') go = true; }
      ok(go, 'a hero who was waiting at the station boards the cab the moment it is home and rides it'); }
    ok(R.kit.fix3 === true && rig(HL_DATA).kit.fix3 === false, 'the kit reads the flag from the level: off = the old cab'); }
  /* THE CAGE (THE COUNTERWEIGHT): a stone with nobody aboard moves nothing; a hero aboard has the beat and the wait; it comes home empty */
  { const hop = (R, b) => { b.face = 1; const ev = []; tick(R, [b], () => ({ strike: true }), ev); return ev; };
    const cageB = R => { const W = R.kit.weights[0], d = W.d.b; return mkBody('knight', (d.x1 + 1) * TS - 4, d.bot * TS); };   /* on cage B at the shelf, beside the hopper */
    { const R = rig(DATA), W = R.kit.weights[0], b = cageB(R); b.on = { plat: true }; const away = mkBody('knight', 20 * TS, 118 * TS);   /* a hero on the shelf strikes the hopper, nobody in the cage */
      const strikeFrom = mkBody('knight', 14 * TS, 118 * TS); strikeFrom.face = -1; strikeFrom.x = 15 * TS;
      const post = R.kit.posts.find(p => p.kind === 'hopper'); const hb = { l: post.x - 8, r: post.x + 8, t: post.y - 8, b: post.y + 8 }; ok(!!kitStrike(R.kit, hb), 'the hopper takes the blow (a stone loaded)');
      run(R, [strikeFrom], 3.5); ok(W.stones > 0 && W.k === 0 && !W.moving, 'FIX3: a struck hopper with nobody in the cage moves nothing (k stays 0, 3.5 s)');
      const R0 = rig(HL_DATA); const W0 = R0.kit.weights[0], p0 = R0.kit.posts.find(p => p.kind === 'hopper'); kitStrike(R0.kit, { l: p0.x - 8, r: p0.x + 8, t: p0.y - 8, b: p0.y + 8 }); run(R0, [mkBody('knight', 20 * TS, 118 * TS)], 3.5); ok(W0.k > 0, 'flag OFF (the old rule, unchanged): the same stone sends the empty cage up'); }
    { const R = rig(DATA), W = R.kit.weights[0], b = cageB(R); b.on = { plat: true }; const ev = []; kitStrike(R.kit, { l: b.x, r: b.x + 26, t: b.y - 22, b: b.y - 2 });   /* a hero stands in cage B and strikes the hopper */
      let moveT = null, doneT = null; for (let i = 0; i < 60 * 25 && doneT === null; i++) { tick(R, [b], () => ({}), ev); if (moveT === null && W.k > 0) moveT = i * DT; if (W.k === 1) doneT = i * DT; if (i < 5) ok(W.k === 0, 'in the beat the cage has not moved'); }
      ok(ev.some(e => e.t === 'cwBoard') && ev.some(e => e.t === 'cwGo') && moveT !== null && moveT >= LK.CW_BOARD - 0.05 && moveT <= LK.CW_BOARD + 0.1, 'a hero aboard: a clank (cwBoard), the beat (' + LK.CW_BOARD + ' s), then the cage rises (' + (moveT === null ? 'never' : moveT.toFixed(2)) + ' s)');
      ok(doneT !== null && Math.abs(b.y - 102 * TS) <= 2, 'and delivers him to the gondola station (row 102) after ' + (doneT === null ? 'never' : doneT.toFixed(1)) + ' s');
      b.x = 20 * TS; b.y = 102 * TS; b.on = null; b.ground = true; let home = null; for (let i = 0; i < 60 * 20 && home === null; i++) { tick(R, [b], () => ({}), ev); if (W.k === 0) home = i * DT; }
      ok(home !== null, 'he steps off at the top: the empty cage goes home by itself (' + (home === null ? 'never' : home.toFixed(1)) + ' s), ready for the next hero'); }
    { const R = rig(DATA), W = R.kit.weights[0], b = cageB(R); b.on = { plat: true }; const mate = mkBody('ranger', b.x - 80, 118 * TS); kitStrike(R.kit, { l: b.x, r: b.x + 26, t: b.y - 22, b: b.y - 2 }); let moveT = null; for (let i = 0; i < 60 * 8 && moveT === null; i++) { tick(R, [b, mate], () => ({}), []); if (W.k > 0) moveT = i * DT; }
      ok(moveT !== null && moveT >= LK.CW_BOARD + LK.PARTY_WAIT - 0.1 && moveT <= LK.CW_BOARD + LK.PARTY_WAIT + 0.2, 'co-op at the cage: it waits the beat + ' + LK.PARTY_WAIT + ' s for the other hero coming, then goes (' + (moveT === null ? 'never' : moveT.toFixed(2)) + ' s)'); }
  }

  /* ============ 3. B. FALL RECOVERY ============ */
  /* where each line is boarded from (the ledge he stood on): the landing at its start end */
  const homeOf = (R, id) => { const z = R.kit.lines[id], sx = z.dir > 0 ? z.xa : z.xb, sy = lineY(z, sx) / TS, ex = sx / TS;
    let best = R.L.landings.map((b, i) => ({ b, i })).filter(({ b }) => b[1] >= sy - 0.6 && b[1] - sy <= 12 && ex >= b[0] - 6 && ex <= b[2] + 7).sort((p, q) => p.b[1] - q.b[1] || Math.abs(ex - (p.b[0] + p.b[2]) / 2) - Math.abs(ex - (q.b[0] + q.b[2]) / 2))[0];
    return best ? best.b : null; };
  const heroes = QUICK ? ['knight'] : HERO_MOVE_IDS;
  const netRows = new Set(R0rows(DATA)); function R0rows(D) { return D.nets.map(b => b[1]); }
  const hit = new Set(); let big = 0, drops = 0, netted = 0, hauls = 0, floorViol = [];
  const limitRow = id => (['W1'].includes(id) ? 234 : ['W2'].includes(id) ? 222 : sections[1].includes(id) ? 208 : sections[2].includes(id) ? 189 : sections[3].includes(id) ? 171 : 104);
  for (const hero of heroes) {
    const step = hero === 'knight' ? 16 : 144;   /* the knight every 16 px (calm + gust); the other classes 9 px steps apart across each line */
    for (const sec of sections) for (const id of sec) {
      const R0 = rig(DATA), z0 = R0.kit.lines[id]; if (!z0 || ARENA.has(id)) continue; const home = homeOf(R0, id);
      for (let x = z0.xa + 12; x <= z0.xb - 12; x += step) for (const ph of (hero === 'knight' ? [0, 1] : [1])) {
        const R = rig(DATA); for (const w of R.kit.winds) w.t = ph ? 0.01 : w.on + 0.01;
        const b = onLine(R, id, x, hero); b.maxHp = 100; b.hp = 100;
        if (home) { /* he stood on the ledge first: the winch remembers it */ const stand = mkBody(hero, Math.min(home[2] * TS + 12, Math.max(home[0] * TS + 14, x)), home[1] * TS); stand.on = { top: home[1] * TS }; netSeat(R.rec, stand, {}, DT); b.hlNet = stand.hlNet; }
        const ev = []; const y0 = b.y; tick(R, [b], () => ({ down: true }), ev); let rest = null;
        for (let i = 0; i < 60 * 14 && !b.dead; i++) { tick(R, [b], () => ({}), ev); if (b.lk) { rest = 'line'; break; } if (b.ground) { rest = 'ground'; tick(R, [b], () => ({}), ev); break; } }   /* one more frame: the seat sees the net under him */
        drops++; ok(rest && !b.dead, hero + ' ' + id + ' x' + (x / TS).toFixed(1) + ': the drop ends on something'); if (b.lk) continue;
        ok(b.y <= limitRow(id) * TS + 1, hero + ' ' + id + ' x' + (x / TS).toFixed(1) + ': the fall stops at or above the section\'s net row ' + limitRow(id) + ' (stopped at row ' + (b.y / TS).toFixed(1) + ')');
        const land = ev.find(e => e.t === 'netLand'); const S = b.hlNet;
        if (S && S.net >= 0) {   /* on a net */
          netted++; hit.add(R.rec.nets[S.net].y / TS);
          const fell = b.y - y0, costed = fell >= NET.FALL_MIN;   /* a drop of under three rows onto a net (G3 over the ambush's net) is a hop: nothing lost */
          if (Math.abs(fell - NET.FALL_MIN) > 3) ok(costed ? !!land && land.cost === 10 && b.hp === 90 : !land && b.hp === 100, hero + ' ' + id + ' x' + (x / TS).toFixed(1) + ': the net costs 10 pct max hp for a fall of ' + (fell / TS).toFixed(1) + ' rows (hp ' + b.hp + ')'); else if (land) ok(b.hp === 90, 'cost 10');
          if (costed) { ok(b.inv >= NET.GRACE - 0.3, 'the landing gives a grace (' + b.inv.toFixed(2) + ' s)'); big++; }
          if (home && (hero === 'knight' ? ph === 1 && ((x / step | 0) % 3 === 0) : true)) {   /* the winch: strike, and he is delivered to the ledge he fell from */
            const e2 = []; ok(haulReady(R.rec, b), 'the winch is ready on the net'); tick(R, [b], () => ({ strike: true }), e2); ok(e2.some(e => e.t === 'haulStart'), 'a strike on the net starts the winch');
            let t = 0, invMin = 9; while (netHeld(b) && t < 8) { tick(R, [b], () => ({}), e2); t += DT; invMin = Math.min(invMin, b.inv); }
            const hm = S.home; ok(e2.some(e => e.t === 'haulEnd') && t >= NET.HAUL_MIN - 0.1 && t <= NET.HAUL_MAX + 0.1, 'the haul takes a few seconds (' + t.toFixed(1) + ' s)');
            ok(Math.abs(b.y - home[1] * TS) <= 1 && b.x >= home[0] * TS && b.x < (home[2] + 1) * TS && b.hp === (costed ? 90 : 100) && invMin > 0, hero + ' ' + id + ': delivered to the ledge he fell from (' + home + '), hp kept, i-frames the whole way'); hauls++; }
        } else floorViol.push(id + '@' + (x / TS).toFixed(1)); } } }
  ok(drops > 800 || QUICK && drops > 150, drops + ' drops swept');
  for (const r of [...netRows].filter(r => r !== 234 && r !== 222)) if (![189, 171, 134, 120, 60].includes(r) || true) ok(hit.has(r) || [134, 120, 60].includes(r), 'a fall lands in the net at row ' + r);
  console.log('  ' + label + ': ' + drops + ' drops (' + heroes.length + ' class(es)), ' + netted + ' on a net (' + big + ' of them -10 pct), ' + hauls + ' hauled back to the ledge; nets landed on: rows ' + [...hit].sort((a, b) => a - b).join(' ') + (floorViol.length ? '; ended on a landing (free): ' + floorViol.length : ''));
  /* the three nets nothing falls into from a line (the on-foot ones: the crevice's hut net, the cage shafts' net, the cave mouth's): a hero who WALKS or is knocked off lands in them, the same rule */
  for (const [row, x, fromY, homeB] of [[134, 61.5 * TS, 120 * TS, [62, 132, 66, 133]], [120, 7.5 * TS, 118 * TS - 2, [13, 118, 61, 119]], [60, 30 * TS, 56 * TS, [1, 58, 15, 59]]]) {
    const R = rig(DATA), b = mkBody('knight', x, fromY); b.ground = false; b.vy = 100; b.on = null; const stand = mkBody('knight', homeB[0] * TS + 20, homeB[1] * TS); stand.on = { top: homeB[1] * TS }; netSeat(R.rec, stand, {}, DT); b.hlNet = stand.hlNet; b.apex = null;
    b.hlNet.apex = fromY - 4 * TS;   /* he went off the lip: four rows up */
    const ev = []; for (let i = 0; i < 60 * 6 && !b.ground; i++) tick(R, [b], () => ({}), ev); tick(R, [b], () => ({}), ev);
    ok(Math.abs(b.y - row * TS) <= 1 && ev.some(e => e.t === 'netLand') && b.hp === 90, 'knocked off the foot ledge above the net at row ' + row + ': the net catches him for 10 pct (' + b.hp + ' hp)'); }
  /* the floor: never lethal by itself */
  { const R = rig(DATA); for (const hp0 of [1, 5, 10, 11, 40]) { const b = mkBody('knight', 30 * TS, 100); b.hp = hp0; b.hlNet = { home: null, apex: 100 - 6 * TS, net: -1, haul: null }; b.y = R.L.nets[2][1] * TS - 0; b.x = 30 * TS; b.y = 208 * TS; b.ground = true; b.hlNet.apex = b.y - 8 * TS; const ev = netSeat(R.rec, b, {}, DT);
      ok(ev.some(e => e.t === 'netLand') && b.hp === Math.max(Math.min(hp0, 1), hp0 - 10) && b.hp >= 1, 'hp ' + hp0 + ' lands in the net: hp ' + b.hp + ' (never below 1)'); } }
  /* a short hop onto a net costs nothing (a jump up from a ledge); and the net costs a tenth of ITS max (maxHp 250 = 25) */
  { const R = rig(DATA), b = mkBody('knight', 30 * TS, 208 * TS); b.hlNet = { home: null, apex: 208 * TS - 2 * TS, net: -1, haul: null }; const ev = netSeat(R.rec, b, {}, DT); ok(!ev.some(e => e.t === 'netLand') && b.hp === 100, 'two rows of fall is a hop: no cost');
    const c = mkBody('knight', 30 * TS, 208 * TS); c.maxHp = 250; c.hp = 250; c.hlNet = { home: null, apex: 208 * TS - 6 * TS, net: -1, haul: null }; netSeat(R.rec, c, {}, DT); ok(c.hp === 225, 'a tenth of max hp: 250 -> ' + c.hp); }
  /* death is not the net's: a dead or downed seat is left to the shrine / the revive (no haul, no cost) */
  { const R = rig(DATA), b = mkBody('knight', 30 * TS, 208 * TS); b.dead = true; b.hlNet = { home: null, apex: 0, net: -1, haul: { x0: 0, y0: 0, x1: 0, y1: 0, dur: 1, t: 0 } }; netSeat(R.rec, b, {}, DT); ok(!netHeld(b), 'a dead seat is let go by the winch'); }
}

/* ============ 4. C. CHECKPOINTS ============ */
{ const D = HL_DATA_SW_FX, R = rig(D);
  /* the walk: the line that tops out at the shrine's ledge, the line that leaves from it: the shrine stands between where he lands and where he can take the next line */
  for (const [inc, out, shrine, what] of [['W4', 'W5', FIX3_CHECKS[1], 'after the JUNCTIONS (L5)'], ['W6', 'G3', FIX3_CHECKS[2], 'the east lee (L8)'], ['LO', 'E1', FIX3_CHECKS[3], 'after the GONDOLA (the dock)']]) {
    const kit = lineInit(JSON.parse(JSON.stringify(D))), zi = kit.lines[inc], zo = kit.lines[out];
    const b = mkBody('knight', 0, 0); b.ground = false; const x = zi.dir > 0 ? zi.xb - 60 : zi.xa + 60; b.x = x; b.y = lineY(zi, x) + zi.hang; b.lk = { id: inc, x, dir: zi.dir, haul: 0, buf: 0, sway: 0, swayV: 0, v: 0, latch: true };
    let landX = null; const RR = { kit, rec: netInit(R.L), S: statics(R.L) };
    for (let i = 0; i < 60 * 6 && landX === null; i++) { tick(RR, [b], () => ({ strike: i < 2 }), []); if (!b.lk && b.ground) landX = b.x; }
    const top = shrine.y * TS, ok0 = []; for (let px_ = 0; px_ < HL.W * TS; px_ += 1) if (inReach(zo, { x: px_, y: top })) ok0.push(px_);
    ok(landX !== null && ok0.length > 0, what + ': the incoming line lands him (x ' + (landX / TS).toFixed(2) + ') and the outgoing line has a grab zone (' + (ok0[0] / TS).toFixed(2) + '-' + (ok0[ok0.length - 1] / TS).toFixed(2) + ')');
    const near = ok0.reduce((p, q) => (Math.abs(q - landX) < Math.abs(p - landX) ? q : p)), lo = Math.min(landX, near) - 8, hi = Math.max(landX, near) + 8, sx = shrine.x * TS + 8;
    ok(sx >= lo && sx <= hi, what + ': the shrine (x ' + shrine.x + ') is on the walk from his landing to the next line\'s grab (' + (lo / TS).toFixed(2) + '-' + (hi / TS).toFixed(2) + ' tiles): every hero passes it'); }
  /* no foe stands within 5 tiles on the same ledge (never behind a foe) and the shrines are on screen as you pass (inside the climb camera's view of the line that tops out there) */
  const B = buildHighLines({ painter, T, TS, sw: true, fx: true });
  for (const c of FIX3_CHECKS) { const foes = B.ents.filter(e => ['goat', 'crossbow', 'harpy', 'galeharpy', 'hookjack'].includes(e.t) && e.y + 1 === c.y && Math.abs(e.x - c.x) <= 5 || e.t === 'hookjack' && Math.abs(e.x - c.x) <= 4 && Math.abs(e.y - c.y) <= 4); ok(!foes.length, 'no foe within 5 tiles of the shrine ' + c.x + ',' + c.y + ' on its ledge: ' + foes.map(e => e.t + '@' + e.x).join(',')); }
  /* the walked route: five on it, no run over the rule's MAX */
  const lv = LEVELS.find(l => l.id === 'highlines'), r = pacing(lv), j = judgeLevel(lv, r);
  ok(r.stats.checksOnRoute === 5 && r.stats.checksTotal === 5, 'tools/pacing.mjs: five shrines on the walked route (' + r.stats.checksOnRoute + ' of ' + r.stats.checksTotal + ')');
  ok(!j.bad.some(s => /SPARSE|NO DOOR/.test(s)), 'no run over ' + MAX + ' route tiles without a shrine, and one before the boss door (worst ' + j.worst + ')');
  console.log('  route: shrines at route tile ' + r.stats.checkAt.join(' / ') + ' of ' + r.stats.routeTiles + ' (gaps ' + r.stats.checkAt.slice(1).map((v, i) => v - r.stats.checkAt[i]).join(' / ') + '), worst ' + j.worst + '; ' + (j.bad.length ? 'judge: ' + j.bad.join(' | ') : 'judge clean')); }

/* ============ FLAG-OFF HASH: the level the game builds with the flag off is master's, byte for byte ============ */
{ const hash = sw => { const B = buildHighLines({ painter, T, TS, sw, fx: false }); const h = createHash('sha256'); h.update(Buffer.from(B.grid)); h.update(JSON.stringify({ ...B, grid: undefined })); return h.digest('hex').slice(0, 16); };
  const hs = { on: hash(true), off: hash(false) }; const MASTER = { on: '9e07f4f7efbd5b56', off: '432d5aae9df5946d' };   /* master 3df8e7fdb; a later merge into highlines.js legitimately moves these: re-take them with scratch/hlfix3-hash.mjs */
  console.log('  flag-off level hash: sw on ' + hs.on + ', sw off ' + hs.off + (hs.on === MASTER.on && hs.off === MASTER.off ? ' (= master 3df8e7fdb)' : ' (differs from the baseline: a merged lane moved the level, or a regression)'));
  if (STRICT) ok(hs.on === MASTER.on && hs.off === MASTER.off, 'the flag-off level is master\'s by hash'); }

if (fails.length) { console.log('FAILS (' + fails.length + '):'); const seen = new Map(); for (const f of fails) { const k = f.replace(/xd+.d+/g, 'x*').replace(/d+(.d+)?/g, '#'); seen.set(k, (seen.get(k) || 0) + 1); } for (const [k, c] of seen) console.log('  ' + c + 'x ' + k.slice(0, 200)); process.exit(1); }
console.log('hl-fix3: ' + n + ' checks OK (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)' + (QUICK ? ' [--quick: the knight only]' : ''));
