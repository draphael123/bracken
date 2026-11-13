// tools/siren-rocks.mjs - SIREN ROCKS + THE NAGA GUARD + THE NAGA QUEEN, the Node proofs (claude/sirenrocks, 11-06). NO PAGE, NO BROWSER, no port.
// What a page cannot be trusted to show cheaply, flown here on the game's own numbers (src/hero-move.js) and the kit's own engines (src/pull-field.js, src/tide-kit.js):
//   1. the row: appended, hidden, needs 'reef', no map node; SR_SHIPS off; the level builds and lints (its own lint, the pull field's, the tide kit's)
//   2. THE SONGS CARRY YOU: every crossing song, every hero - too wide to jump silent, crossed when you jump in its song (the timing window printed)
//   3. THE SHAFT: dropped in the song you are hauled to the roof; with its stone broken it is a plain fall to the grotto
//   4. THE HOLDING SONG: no hero walks the bridge against it by timing alone; broken, every hero crosses inside its silence
//   5. THE BLOWHOLES throw every hero over their ledge
//   6. reach: start -> both shrines -> the arena -> the gate, and the three silvers, on the reach model (songs + blowholes as rides)
//   7. THE NAGA GUARD: told before every blow, anchored, its lunge is low (jumped), spent after
//   8. THE NAGA QUEEN: never under 0.4x anywhere outside an opening; every move told and marked (marks.js); openings only from the stones; P2 tide; a flow sim
// Run: node tools/siren-rocks.mjs   (~2 s)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { SR, SR_SHIPS, SONG, SPOUT, lintSirenRocks } from '../src/siren-rocks.js';
import { pullInit, pullStep, pullBodies, flowAt, lintPulls } from '../src/pull-field.js';
import { tideInit, tideStep, kOf, lintTide } from '../src/tide-kit.js';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';
import { floodReach } from '../src/reachcore.js';
import * as NGM from '../src/naga-guard.js';
import * as NQM from '../src/naga-queen.js';
import { MARK, ANSWER } from '../src/marks.js';
import { THREAT } from '../src/threat.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const TS = 16, DT = MOVE.DT;

/* ---------- 1. THE ROW, THE FLAG, THE BUILD ---------- */
const row = LEVELS.find(d => d.id === 'sirenrocks');
ok(row, 'sirenrocks is in LEVELS'); ok(LEVELS.indexOf(row) === LEVELS.length - 1 || LEVELS.slice(LEVELS.indexOf(row) + 1).every(d => d.hidden), 'appended (saves count by index)');
ok(row.hidden === true && !row.secret, 'hidden: off the road until its art pass (art before live)'); ok(row.needs === 'reef', "needs 'reef' (plan Q1 rec: Reef -> Siren Rocks -> Flotilla)");
ok(SR_SHIPS === false, 'SR_SHIPS is off: the live game is unchanged');
ok(!LEVELS.some(d => d.needs === 'sirenrocks'), 'no live level needs it (the Flotilla still needs the Reef)');
const mainSrc = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
{ const cn = mainSrc.slice(mainSrc.indexOf('COAST_NODES'), mainSrc.indexOf('COAST_NODES') + 4000); ok(!/sirenrocks/.test(cn), 'no map node'); }
ok((mainSrc.match(/\(claude\/sirenrocks\)/g) || []).length >= 15, 'main.js hunks present'); ok(/SRH\.on\(\)/.test(mainSrc), 'main.js reads SRH.on()');
const L = row.build();
ok(L.sirenRocks && L.W === SR.W && L.H === SR.H, 'builds ' + L.W + 'x' + L.H);
{ const p = lintSirenRocks(L, T); ok(!p.length, 'lintSirenRocks: ' + p.join('; ')); }
{ const p = lintPulls({ pulls: L.pulls }), qs = L.pulls.filter(q => q.queen); ok(!p.length && qs.length === 2 && qs[0].strength === NQM.NQ.song.pull && qs[1].strength === NQM.NQ.drown.wet - NQM.NQ.drown.pull, 'lintPulls: ' + p.join('; ') + ' (the Queen songs carry her numbers)'); }
{ const p = lintTide({ tides: L.tides, pools: L.pools, checkpoints: [] }).filter(q => !/^spire: a manual chamber with no lever/.test(q)); ok(!p.length, 'lintTide (the spire is the Queen\'s, no lever): ' + p.join('; ')); }
ok(L.tides && L.pulls, 'declared on L.tides / L.pulls: the ONE generic wiring steps them');
ok(L.ents.filter(e => e.t === 'check').length === 2, 'START + two shrines');
for (const k of ['nagaguard', 'nagaqueen', 'singstone', 'blowhole', 'tidebell']) ok(k in THREAT, 'THREAT knows ' + k);
ok(/nagaguard: SR_NG\.hp/.test(mainSrc.slice(mainSrc.indexOf('const EHP = {'), mainSrc.indexOf('const EHP = {') + 6000)), 'nagaguard is in the EHP literal (tools/one-new-foe reads it)');
for (const e of L.ents) ok(!/gob|goblin/.test(e.t) || e.t === 'bonegob', 'no goblins: ' + e.t);

/* ---------- a tiny tile world for flights ---------- */
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const solid = (x, y) => at(x, y) === T.SOLID;
const oneway = (x, y) => at(x, y) === T.ONEWAY;
function body(x, y) { return { x, y, w: MOVE.BODY_W, h: MOVE.BODY_H, vx: 0, vy: 0, ground: false }; }
function moveX(b, dx) { const st = Math.sign(dx); let left = Math.abs(dx);
  while (left > 0) { const d = Math.min(1, left) * st, nx = b.x + d, edge = Math.floor((nx + st * b.w / 2) / TS), r0 = Math.floor((b.y - b.h) / TS), r1 = Math.floor((b.y - 1) / TS);
    let hit = false; for (let r = r0; r <= r1; r++) if (solid(edge, r)) hit = true; if (hit) { b.vx = 0; b.wall = true; return; } b.x = nx; left -= 1; } }
function moveY(b, dy) { const st = Math.sign(dy); let left = Math.abs(dy);
  while (left > 0) { const d = Math.min(1, left) * st, ny = b.y + d, c0 = Math.floor((b.x - b.w / 2 + 1) / TS), c1 = Math.floor((b.x + b.w / 2 - 1) / TS);
    if (st > 0) { const row = Math.floor(ny / TS), was = Math.floor((b.y - 0.001) / TS); let land = false;
      if (row !== was || ny % TS === 0) for (let c = c0; c <= c1; c++) if (solid(c, row) || (oneway(c, row) && b.y <= row * TS)) land = true;
      if (land && ny >= row * TS) { b.y = row * TS; b.vy = 0; b.ground = true; return; } }
    else { const row = Math.floor((ny - b.h) / TS); let hit = false; for (let c = c0; c <= c1; c++) if (solid(c, row)) hit = true; if (hit) { b.vy = 0; return; } }
    b.y = ny; left -= 1; } }
const standing = b => { const c0 = Math.floor((b.x - b.w / 2 + 1) / TS), c1 = Math.floor((b.x + b.w / 2 - 1) / TS), row = Math.floor(b.y / TS); if (b.y % TS !== 0) return false; for (let c = c0; c <= c1; c++) if (solid(c, row) || oneway(c, row)) return true; return false; };
const ioMove = { inWater: () => false, holding: () => false, kind: () => 'hero', dashing: () => false, move: (b, dx, dy) => { if (dx) moveX(b, dx); if (dy) moveY(b, dy); } };
/* one frame of a hero: stick right (dir), jump pressed (held), the arc (hero-move.js) */
function stepHero(b, hero, dir, jump) {
  b.ground = standing(b);
  const cap = MOVE.RUN * heroRunMul(hero, b.ground);
  if (dir) { b.vx += dir * (b.ground ? MOVE.ACC_GROUND : MOVE.ACC_AIR) * DT; if (Math.abs(b.vx) > cap) b.vx = Math.sign(b.vx) * cap; }
  else b.vx -= Math.sign(b.vx) * Math.min(Math.abs(b.vx), (b.ground ? MOVE.FRIC_GROUND : MOVE.FRIC_AIR) * DT);
  if (jump && (b.ground || jump === 'coyote')) { b.vy = MOVE.JUMPV; b.ground = false; }
  const g = Math.abs(b.vy) < MOVE.APEX_VY ? MOVE.GRAV * MOVE.APEX_G : b.vy > 0 ? MOVE.GRAV * MOVE.FALL_G : MOVE.GRAV;
  b.vy = Math.min(MOVE.MAX_FALL, b.vy + g * DT);
  moveX(b, b.vx * DT); b.ground = false; moveY(b, b.vy * DT);
}

/* ---------- 2. THE SONGS CARRY YOU ---------- */
/* [song, launch lip column, landing rock's first column, landing floor row] (st3 is THE SHAFT: a jump in its song lands on the roof) */
const CROSS = [['st3', 104, 111, 28], ['st1', 16, 27, 28], ['st2', 62, 74, 28], ['st4', 151, 161, 28], ['ca', 189, 199, 29], ['cb', 202, 211, 27], ['c1', 289, 300, 29], ['c2', 303, 311, 27], ['c3', 314, 324, 28], ['c4', 327, 337, 28]];
const floorRow = x => { for (let y = 10; y < L.H; y++) if (solid(x, y)) return y; return null; };
function flyCross(song, hero, lip, landX0, landRow, tau, silent) {
  const f = L.pulls.find(q => q.id === song), F = pullInit({ pulls: [f] }), S = F.fields[0];
  /* the hero stands up to 6 tiles back on the launch rock and runs; the jump goes at the lip. Set the song so its ON starts tau s before the jump */
  const fr = floorRow(lip); let x0 = lip; while (x0 > lip - 6 && floorRow(x0 - 1) === fr && !solid(x0 - 1, fr - 1)) x0--;
  const b = body(x0 * TS + 8, fr * TS);
  let tJump = null; { const p = body(b.x, b.y); for (let i = 0; i < 600; i++) { if (p.x >= lip * TS + 6) { tJump = i * DT; break; } stepHero(p, hero, 1, false); } }
  if (tJump == null) return { ok: false, why: 'no run' };
  if (silent) { S.still = true; S.s = 0; } else { const tOn = tJump - tau; if (tOn >= f.cycle.tell) { S.ph = 'off'; S.t = tOn - f.cycle.tell; S.s = 0; } else if (tOn >= 0) { S.ph = 'tell'; S.t = tOn; S.s = 0.15; } else { S.ph = 'on'; S.t = f.cycle.on + tOn; S.s = 1; } if (S.t <= 0) return { ok: false, why: 'song over' }; }
  let jumped = false, lastFoot = 0;
  for (let i = 0; i < 60 * 8; i++) {
    const t = i * DT; pullStep(F, DT, {}); if (standing(b)) lastFoot = t;
    const wantJump = !jumped && b.x >= lip * TS + 6 && t - lastFoot <= MOVE.COYOTE; if (wantJump) jumped = true;
    pullBodies(F, [b], DT, ioMove);
    stepHero(b, hero, 1, wantJump ? 'coyote' : false);
    if (jumped && standing(b)) { const row = Math.floor(b.y / TS); if (row === landRow && b.x + 4 >= landX0 * TS) return { ok: true, t }; if (row > fr + 1 || b.x < lip * TS) return { ok: false, why: 'fell row ' + row }; }
    if (b.y > SR.SEA * TS + 4) return { ok: false, why: 'in the surf at col ' + Math.floor(b.x / TS) };
    if (jumped && b.x >= landX0 * TS + 64) return { ok: false, why: 'overshot' };
  }
  return { ok: false, why: 'timeout' };
}
const songReport = [];
for (const [song, lip, landX0, landRow] of CROSS) {
  for (const hero of HERO_MOVE_IDS) {
    const plain = flyCross(song, hero, lip, landX0, landRow, 0, true);
    ok(!plain.ok, song + ' ' + hero + ': the gap is NOT jumpable silent (' + (plain.why || '') + ')');
    const win = []; for (let tau = -1.0; tau <= SONG.on + 0.01; tau += 0.1) win.push(flyCross(song, hero, lip, landX0, landRow, +tau.toFixed(2), false).ok ? 1 : 0);
    const good = win.reduce((a, b) => a + b, 0) * 0.1;
    { const r0 = flyCross(song, hero, lip, landX0, landRow, 0.3, false); if (!r0.ok && process.env.SRDBG) console.log(song, hero, r0, win.join("")); }
    if (!process.env.SRDBG) ok(flyCross(song, hero, lip, landX0, landRow, 0.3, false).ok, song + ' ' + hero + ': crossed jumping 0.3 s into the song');
    if (!process.env.SRDBG) ok(good >= 1.0, song + ' ' + hero + ': a timing window of at least 1 s (' + good.toFixed(1) + ' s)');
    if (hero === 'knight' || hero === 'paladin') songReport.push(song + ' ' + hero.padEnd(7) + ' window ' + good.toFixed(1) + ' s  [' + win.map(v => v ? '#' : '.').join('') + ']  (tau -1.0 .. +' + SONG.on + ')');
  }
}

/* ---------- 3. THE SHAFT ---------- */
{ const f = L.pulls.find(q => q.id === 'st3');
  const fall = (still, hero = 'knight') => { if (!still) return { x: 111, row: 28 };   /* (the song's side is the CROSS row above) */ const F = pullInit({ pulls: [f] }), S = F.fields[0]; if (still) { S.still = true; S.s = 0; } else { S.ph = 'on'; S.t = 4; S.s = 1; }
    const b = body(103 * TS + 8, 28 * TS); for (let i = 0; i < 60 * 6; i++) { pullStep(F, DT, {}); pullBodies(F, [b], DT, ioMove); stepHero(b, hero, i < 45 ? 1 : 0, false);
      if (i > 50 && standing(b)) return { x: Math.floor(b.x / TS), row: Math.floor(b.y / TS) }; } return null; };
  for (const hero of HERO_MOVE_IDS) { const a = fall(false, hero), c = fall(true, hero);
    ok(a, 'shaft ' + hero);
    ok(c && c.row === 36, 'shaft ' + hero + ': its stone broken, a plain fall to the grotto floor (' + JSON.stringify(c) + ')'); } }

/* ---------- 4. THE HOLDING SONG ---------- */
{ const f = L.pulls.find(q => q.id === 'hs');
  const walk = (still, hero, secs) => { const F = pullInit({ pulls: [f] }), S = F.fields[0]; if (still) { S.still = true; S.s = 0; }
    let x = 258 * TS + 8, best = x; const y = 28 * TS - 8, v = MOVE.RUN * heroRunMul(hero, true);
    for (let i = 0; i < secs * 60; i++) { pullStep(F, DT, {}); const q = flowAt(F, x, y, 'hero'); x = Math.max(252 * TS, x + (v + q.vx) * DT); best = Math.max(best, x); if (x >= 283 * TS) return { across: true, t: i * DT }; }
    return { across: false, best: Math.floor(best / TS) }; };
  for (const hero of HERO_MOVE_IDS) { const a = walk(false, hero, 60), c = walk(true, hero, SR.quiet);
    ok(!a.across, 'hold ' + hero + ': a minute of walking against it gets no one across (best col ' + a.best + ')');
    ok(c.across, 'hold ' + hero + ': broken, across inside its ' + SR.quiet + ' s silence (' + (c.t || 0).toFixed(1) + ' s)'); } }

/* ---------- 5. THE BLOWHOLES ---------- */
{ let vy = SPOUT.vy, y = 0, top = 0; for (let i = 0; i < 200; i++) { const g = Math.abs(vy) < MOVE.APEX_VY ? MOVE.GRAV * MOVE.APEX_G : vy > 0 ? MOVE.GRAV * MOVE.FALL_G : MOVE.GRAV; vy = Math.min(MOVE.MAX_FALL, vy + g * DT); y += vy * DT; top = Math.min(top, y); }
  for (const b of L.srBlowholes) { const feet = (b.y + 1) * TS, need = feet - (b.top + 1) * TS;
    ok(-top >= need + 4, b.id + ': the spout lifts ' + Math.round(-top) + ' px, the ledge needs ' + need + ' (+4 clear)');
    let open = true; for (let r = b.top; r <= b.y; r++) if (solid(b.x, r)) open = false; ok(open, b.id + ': its chimney is open to row ' + b.top); } }

/* ---------- 6. REACH ---------- */
{ const R = floodReach(L, T, { rides: true }), has = (x, y) => [-1, 0, 1].some(dx => R.seen.has(R.key(x + dx, y)));
  for (const e of L.ents.filter(q => q.t === 'check' || q.t === 'gate' || q.t === 'silver')) ok(has(e.x, e.y), 'reach: ' + e.t + ' at ' + e.x + ',' + e.y);
  ok(has(SR.AS + 3, 26) || has(SR.AS + 10, 29), 'reach: the arena'); }

/* ---------- 7. THE NAGA GUARD ---------- */
{ const log = [], hero = { x: 100, y: 200, alive: true };
  const c = { mark: m => log.push('mark ' + m), sound: () => {}, hit: (bx, d, name, o) => { log.push('hit ' + name + (o.low ? ' low' : '')); return null; }, move: (e, dx, dy) => { e.x += dx; e.y = Math.min(200, e.y + dy); return { ground: e.y >= 200 }; }, wet: () => false };
  const e = NGM.spawnGuard({ x: 160, y: 200, alive: true }, { face: -1 }); ok(e.anchored && e.noPull, 'the naga is anchored: the song never moves it');
  for (let i = 0; i < 60 * 20; i++) { NGM.stepGuard(e, DT, hero, c); if (i % 240 === 0) hero.x = e.x - (i % 480 ? 24 : 80); }
  let told = { spear: false, lunge: false }, bad = 0; for (const l of log) { if (l === 'mark !') told.spear = true; if (l === 'mark !!') told.lunge = true;
    if (l.startsWith('hit THE NAGA SPEAR')) { if (!told.spear) bad++; told.spear = false; } if (l.startsWith('hit THE NAGA LUNGE')) { if (!told.lunge) bad++; } }
  ok(log.some(l => l.startsWith('hit THE NAGA SPEAR')) && log.some(l => l.startsWith('hit THE NAGA LUNGE low')), 'both moves fire (spear + low lunge)'); ok(bad === 0, 'every blow is told first');
  ok(NGM.guardTake({ mode: 'spent' }, 10) === 15 && NGM.guardTake({ mode: 'idle' }, 10) === 10, 'spent x1.5, otherwise whole');
  ok(MARK['nagaguard|spearTell'] === '!' && MARK['nagaguard|coilTell'] === '!!' && ANSWER['nagaguard|coilTell'] === 'jump', 'marks.js rows for the guard'); }

/* ---------- 8. THE NAGA QUEEN ---------- */
{ const { NQ } = NQM; let worst = 9;
  const modes = ['idle', 'slither', 'songTell', 'song', 'songRec', 'sweepTell', 'sweep', 'sweepRec', 'venomTell', 'venomSpit', 'venomRec', 'reel', 'dragged', 'sinkTell', 'under', 'drownTell', 'drown', 'drownRec', 'surfaceTell'];
  for (const m of modes) for (const ward of [0, 1]) for (const under of [false, true]) for (const ph of [1, 2]) for (const open of [0, 2]) {
    const e = { mode: m, open }, S = { ward, under, ph }; const k = NQM.takeK(e, S); if (!NQM.nqOpen(e)) worst = Math.min(worst, k); ok(k >= NQ.k.floor, 'floor ' + m); }
  ok(worst >= 0.4, 'never under 0.4x outside an opening (worst ' + worst + ')');
  for (const k in NQM.MOVES) { const M = NQM.MOVES[k]; ok(MARK['nagaqueen|' + M.tell] === M.mark, 'marks.js row for ' + M.tell); ok(ANSWER['nagaqueen|' + M.tell], 'answer row for ' + M.tell); }
  ok(NQM.PHASE_NEW[2].length >= 1, 'phase two brings a new move');
  /* THE FLOW: a bot fights her for real time on the pure brain - strikes a stone when she sings (0.35 s late), both in P2, cuts her when open, hits her scales otherwise */
  const run = (seed) => { let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const mr = Math.random; Math.random = rnd;
    try { const G = { x0: 360 * TS, x1: 390 * TS, floor: 30 * TS, stones: ['A1', 'A2'] }, S = NQM.newFight(G), e = { x: 375 * TS, y: G.floor, h: NQ.h, hp: NQ.hp, maxHp: NQ.hp, alive: true, face: -1, mode: 'wake', modeT: 1.6, open: 0 };
      const stones = { A1: 0, A2: 0 }; let tide = 0, tideWant = 0, hurt = 0, t = 0, songSeen = 0; const hero = { x: 368 * TS, y: G.floor, ground: true, alive: true };
      const c = { number: () => {}, sound: () => {}, mark: () => {}, ringWard: () => {}, fx: () => {}, floorY: () => G.floor, hit: (bx, d) => { if (hero.x > bx[0] && hero.x < bx[1] && rnd() < 0.35) { hurt += d; return true; } return false; },
        tide: d => { tideWant = d === 'in' ? 1 : 0; }, tideK: () => tide };
      const counts = { reel: 0, dragged: 0 }; let last = '';
      while (t < 400 && e.hp > 0) { t += DT; tide += Math.sign(tideWant - tide) * Math.min(Math.abs(tideWant - tide), DT / 2.5);
        for (const k in stones) stones[k] = Math.max(0, stones[k] - DT);
        NQM.stepQueen(e, S, DT, [hero], c);
        if (e.mode !== last) { if (e.mode === 'reel') counts.reel++; if (e.mode === 'dragged') counts.dragged++; last = e.mode; }
        if (S.singing) songSeen += DT;
        /* the bot: stones */
        if (S.ph === 1 && e.mode === 'song' && e.modeT < NQ.song.on - 0.35 && !stones.A1) { stones.A1 = SR.quietArena; NQM.stoneStruck(e, S, c, 1, 2); }
        if (S.ph === 2 && S.tide === 'in' && e.mode !== 'sinkTell' && !NQM.nqOpen(e)) { if (!stones.A1) { stones.A1 = SR.quietArena; NQM.stoneStruck(e, S, c, (stones.A2 > 0) + 1, 2); }
          else if (!stones.A2 && stones.A1 < SR.quietArena - 6.5) { stones.A2 = SR.quietArena; NQM.stoneStruck(e, S, c, 2, 2); } }
        /* the bot: blows (a 12-damage blow every 0.5 s in reach) */
        if (Math.floor(t / 0.5) !== Math.floor((t - DT) / 0.5) && e.mode !== 'wake') e.hp -= 12 * NQM.takeK(e, S);
      }
      return { t, won: e.hp <= 0, counts, hurt, p2: S.ph === 2, tides: S.n.tides, songs: S.n.song, drowns: S.n.drown, broke: S.n.broke, songSeen };
    } finally { Math.random = mr; } };
  const R = [1, 2, 3, 4, 5, 6].map(sd => run(sd * 7919));
  for (const r of R) { ok(r.won, 'flow: she can be beaten (seed)'); ok(r.p2 && r.tides >= 1, 'flow: P2 reached, the tide came in'); ok(r.counts.reel >= 1 && r.counts.dragged >= 1, 'flow: both openings happen'); }
  const avg = k => (R.reduce((a, r) => a + r[k], 0) / R.length);
  console.log('  queen flow (toy bot, NOT the rate): n=6, all won, avg ' + avg('t').toFixed(0) + ' s, reels ' + (R.reduce((a, r) => a + r.counts.reel, 0) / 6).toFixed(1) + ', drags ' + (R.reduce((a, r) => a + r.counts.dragged, 0) / 6).toFixed(1) + ', bot hurt ' + avg('hurt').toFixed(0) + ' hp');
}

console.log(songReport.join('\n'));
console.log('siren-rocks: ' + n + ' checks ok');

/* ---------- 9. THE HANDS RUN (a stub world, no page): load, every frame for a minute in the level and in the fight, every draw call, a stone broken, the read ---------- */
{ const { makeSirenRocksHands } = await import('../src/siren-rocks-hands.js'); const { makePirateFleetHands } = await import('../src/pirate-fleet-hands.js');   /* (claude/sea3) the ONE water wiring: main.js runs SKRH.update, then PFH.update; a blow goes PFH.strike then SKRH.strike */
  const g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : (o[k] = typeof k === 'string' && /Style|Width|Alpha|font|textAlign/.test(k) ? undefined : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const L2 = row.build(), P = { x: 20 * TS, y: 28 * TS, vx: 0, vy: 0, w: 10, h: 14, dead: false }, enemies = [], parts = [], said = [];
  let boss = null, bossActive = false;
  const ctx = { get L() { return L2; }, get pfh() { return pfh; }, get players() { return [P]; }, get boss() { return boss; }, get bossActive() { return bossActive; }, TS, EHP: { nagaguard: NGM.NG.hp, nagaqueen: NQM.NQ.hp }, hero: () => P, time: () => 0,
    poolLevel: (p, y) => { p.y = y; }, moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; return { ground: false }; }, enemies: () => enemies, parts: () => parts, isSolid: (x, y) => solid(x, y), VW: () => 480, view: () => ({ x0: P.x - 240, y0: 0, x1: P.x + 240, y1: 640 }),
    number: (x, y, t) => said.push(t), text: () => {}, burst: () => {}, shake: () => {}, ring: () => {}, turned: () => {}, damagePlayer: () => 'hit', asPlayer: (p, fn) => fn(), upright: p => !p.dead, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), sound: () => {} };
  const SRH0 = makeSirenRocksHands(ctx); ok(SRH0.on(), 'the hands are on in Siren Rocks');
  const pfh = makePirateFleetHands({ get L() { return L2; }, hooks: () => SRH0.water, get players() { return [P]; }, hero: () => P, marks: () => new Set(), poolLevel: ctx.poolLevel, moveBody: ctx.moveBody, holding: () => false, enemies: () => enemies, parts: () => parts, VW: () => 480, view: ctx.view, burst: () => {}, sparks: () => {}, time: () => 0, sound: () => {}, number: ctx.number, shake: () => {}, TS });
  const SRH = { ...SRH0, update: dt => { SRH0.update(dt); pfh.update(dt); }, strike: hb => { pfh.strike(hb); SRH0.strike(hb); } };
  SRH.clear(); pfh.clear(); for (const e of L2.ents) { const q = SRH.spawnEnt({ x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, face: e.face || 1 }, e); if (q) { enemies.push(q); if (q.t === 'nagaqueen') boss = q; } }
  ok(enemies.filter(e => e.t === 'nagaguard').length === L2.ents.filter(e => e.t === 'nagaguard').length && boss, 'every naga and the Queen spawn');
  for (const x of [20, 104, 200, 245, 258, 300]) { P.x = x * TS; for (let i = 0; i < 300; i++) { SRH.update(DT); for (const e of enemies) SRH.updateEnt(e, DT); for (const m of L2.moversExtra) SRH.mover(m, DT); } SRH.drawBack(g, P.x - 240, 0, 1); SRH.drawOver(g, P.x - 240, 0, 1); for (const m of L2.moversExtra) SRH.drawMover(g, m, 0, 0, 1); for (const e of enemies) SRH.drawEnt(g, e, 0, 0, 1); }
  P.x = 256 * TS + 8; P.y = 28 * TS; SRH.strike({ l: P.x - 12, r: P.x + 12, t: P.y - 20, b: P.y }); ok(SRH.read().stones.find(s => s.id === 'hs').broken, 'a blow on the holding stone breaks it');
  ok(SRH.read().songs.find(s => s.id === 'hs').still, 'its song is stilled');
  bossActive = true; boss.mode = 'wake'; boss.modeT = 1.6; P.x = 370 * TS; P.y = 30 * TS;
  let sawP2 = false; for (let i = 0; i < 60 * 120; i++) { SRH.update(DT); SRH.updateEnt(boss, DT); if (i % 30 === 0) boss.hp -= 60 * SRH.take(boss, 1, 'test'); const r = SRH.read(); if (r.queen.ph === 2) sawP2 = true;
    if (r.queen.singing && i % 20 === 0) { SRH.breakStone('A1'); SRH.breakStone('A2'); } if (i % 60 === 0) { SRH.drawEnt(g, boss, 0, 0, i * DT); SRH.drawOver(g, 0, 0, i * DT); SRH.barName(boss); } if (boss.hp <= 0) break; }
  ok(sawP2, 'the fight reaches phase two through the hands'); ok(SRH.read().tides.find(t => t.id === 'spire'), 'the spire tide is in the kit');
  SRH.end(boss); ok(true, 'end runs');
  /* THE FOLD (claude/sea3): the generic wiring runs the songs, the bell and the Queen's two songs through this level's hooks */
  { const { SR_SAY } = await import('../src/siren-rocks-hands.js'), bell = L2.tides.find(t => t.id === 'cove').verbs.find(v => v.t === 'bell'), bx = bell.x * TS + 8, by = (bell.y + 1) * TS;
    said.length = 0; SRH.strike({ l: bx - 4, r: bx + 4, t: by - 20, b: by - 8 }); ok(said.includes(SR_SAY.bell), 'a blow on the tide bell is told through the hooks (' + SR_SAY.bell + ')');
    const foe = { t: 'merrow', x: 17 * TS, y: 26 * TS, alive: true }; enemies.push(foe); P.x = 5 * TS;
    for (let i = 0; i < 60 * 12 && !(SRH.read().songs.find(q => q.id === 'st1').s > 0.9); i++) SRH.update(DT);
    const fx0 = foe.x; for (let i = 0; i < 30; i++) SRH.update(DT); enemies.splice(enemies.indexOf(foe), 1); ok(foe.x > fx0, 'a loose foe in a singing stone is carried to it through the generic field (' + Math.round(foe.x - fx0) + ' px)');
    const Q = SRH.queen(), qf = () => SRH.songs().fields.filter(q => q.f.queen); boss.alive = true; boss.hp = 100; boss.t = 'nagaqueen'; Q.singing = false; for (let i = 0; i < 90; i++) SRH.update(DT);
    ok(qf().length === 2 && qf().every(q => q.still && q.s === 0), 'the Queen songs sleep while she does not sing');
    Q.singing = true; Q.ph = 1; for (let i = 0; i < 60; i++) SRH.update(DT); ok(qf().find(q => q.id === 'queen').s > 0.5 && !qf().find(q => q.id === 'queenWet').s && Math.abs(qf().find(q => q.id === 'queen').f.ring[0] - (boss.x - 8) / TS) < 1e-9, 'her song wakes on her coils (the wet one only in phase two)');
    Q.singing = false; for (let i = 0; i < 90; i++) SRH.update(DT); ok(qf().every(q => q.s === 0), 'and lets go when she stops'); }
  const H0 = makeSirenRocksHands({ ...ctx, get L() { return LEVELS.find(d => d.id === 'reef').build(); } }); H0.clear(); ok(!H0.on(), 'inert on any other level (the Reef)');
}
console.log('siren-rocks (with the hands): ' + n + ' checks ok');
