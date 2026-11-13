// tools/deep3.mjs - THE DEEP 3 proofs (claude/deep3). NODE ONLY: no page, no browser, no port.
//   node tools/deep3.mjs            every proof (~10 s)
//   node tools/deep3.mjs --sim=6    the toy duels only, n seeds      --log  one line a fight
// A TOY DUEL is a kinematic flow sim (one point-hero swimming, the lab plan's careful player, fallible), NOT the rate: it proves the rule is playable (chip, fell
// in a row, break off a raising, the swap / stuck windows) and gives a first length. The rate is tools/boss-rates.mjs in a page (owed: browser).
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2), opt = k => { const a = args.find(x => x.startsWith('--' + k)); return a ? (a.split('=')[1] ?? true) : null; };
const HERE = fileURLToPath(import.meta.url);
/* the flag both ways needs two processes (deep3On() reads the env once per build, but LEVELS is built at import) */
if (opt('child')) {
  const { LEVELS } = await import('../src/level.js'); const lv = LEVELS.find(l => l.id === 'deep'), L = lv.build();
  const h = createHash('sha256').update(Buffer.from(L.grid)).update(JSON.stringify(L.ents)).update(JSON.stringify(L.pools)).update(JSON.stringify(L.deep)).update(JSON.stringify(L.arena)).digest('hex');
  console.log(JSON.stringify({ h, i: LEVELS.indexOf(lv), needs: lv.needs, W: L.W, H: L.H, d3: !!L.deep3, checks: L.ents.filter(e => e.t === 'check').length, boss: L.arena.boss, n: LEVELS.length }));
  process.exit(0);
}
process.env.DEEP3 = '1';
const { LEVELS, T } = await import('../src/level.js');
const { D3, lintDeep3, crewStage, deep3On } = await import('../src/deep3.js');
const WE = await import('../src/wall-eel.js');
const SC = await import('../src/sunken-crew.js');
const { makeDeep3Hands } = await import('../src/deep3-hands.js');
const { floodReach } = await import('../src/reachcore.js');
const TS = 16; let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const MASTER = '01427ba671c187fb3c60cd26fa1b9d83c2af687daa68aa4475e8bf82f051e571';   /* master's Deep (claude/waterkit e08836df8 = master's Deep rows), grid + ents + pools + deep + arena */

function rng0(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

/* ---------- THE TOY DUELS ---------- */
function duel(seed, log) {
  const rng = rng0(seed), G = SC.geom(crewStage(TS)), S = SC.newFight(G, seed * 13 + 5), greedy = seed % 3 === 0;   /* one fight in three: a GREEDY player (fells whoever is lowest at once) */
  const P = { x: G.x0 + 40, y: G.floor, vx: 0, hp: 300, max: 300, flasks: 3, cd: 0, dodge: 0, block: false, jumpT: 0, keys: new Map(), late: 0 };
  const w = { hit: (h, d, name, key, o) => { if (P.keys.has(key)) return null; if (P.dodge > 0) return null; P.keys.set(key, 1); if (o.blockable && P.block) return 'blocked'; P.hp -= d; return 'hit'; },
    pull: (h, x, y, v) => { P.pullT = 0.45; P.pullX = x; P.pullY = y; P.pullV = v / 0.45; }, say() {}, mark() {}, sound() {}, fx() {}, shake() {}, music() {} };
  let t = 0, swings = 0, lantMax = 0; SC.wake(S);
  while (t < 300 && P.hp > 0 && !(S.ph === 2 && S.sailor && S.sailor.hp <= 0)) { const dt = 1 / 60; t += dt;
    if (P.hp < P.max * 0.3 && P.flasks > 0 && rng() < 0.05) { P.flasks--; P.hp = Math.min(P.max, P.hp + P.max * 0.4); }   /* a swim flask (1.5x the drink: rolled late) */
    const out = SC.crewPlan(S, P, { greedy });
    /* fallible: a late read 1 time in 5 */
    if ((out.block || out.dodge || out.jump) && P.late <= 0 && rng() < 0.2) P.late = 0.25; P.late -= dt;
    const late = P.late > 0;
    P.block = !!out.block && !late; if (out.dodge && !late && P.dodge <= -0.4) P.dodge = 0.35; P.dodge -= dt;
    if (out.jump && !late && P.y >= G.floor - 1) P.jumpT = 0.7;
    P.jumpT -= dt; const ty = P.jumpT > 0 ? G.floor - 40 : out.gy;
    const sp = 96 * dt;   /* SWIM 96 */
    if (!P.block) { const dx = out.gx - P.x, dy = ty - P.y, d = Math.hypot(dx, dy); if (d > 2) { P.x += dx / d * Math.min(d, sp); P.y += dy / d * Math.min(d, sp); } }
    if (P.pullT > 0) { P.pullT -= dt; const dx = P.pullX - P.x, dy = P.pullY - P.y, d = Math.hypot(dx, dy) || 1; if (d > 20) { P.x += dx / d * P.pullV * dt; P.y += dy / d * P.pullV * dt; } }
    P.x = Math.max(G.x0 + 8, Math.min(G.x1 - 8, P.x)); P.y = Math.max(G.top + 20, Math.min(G.floor, P.y)); P.cd -= dt;
    if (out.atk && out.target && P.cd <= 0) { P.cd = 0.38; swings++; const tg = out.target;
      if (S.ph === 1) { const [d] = SC.takeCrew(S, tg, 18, P.x); tg.hp = Math.max(0, tg.hp - d); SC.struck(S, tg, w); if (tg.hp <= 0) SC.fall(S, tg, w); }
      else { const [d] = SC.takeSailor(S, 18, P.x); S.sailor.hp = Math.max(0, S.sailor.hp - d); } }
    SC.stepFight(S, dt, [{ x: P.x, y: P.y, vx: 0, alive: true, ground: P.y >= G.floor - 1 }], w);
    lantMax = Math.max(lantMax, S.lanterns.length);
    assert(S.tokens <= SC.CREW.tokens && S.tokens >= 0, 'tokens ' + S.tokens);
    if (S.ph === 1) assert(SC.living(S).filter(c => c.token).length === S.tokens, 'the token count matches who holds one'); }
  const r = { greedy, win: S.ph === 2 && !!S.sailor && S.sailor.hp <= 0, t, hp: Math.max(0, P.hp), flasks: P.flasks, ph: S.ph, falls: S.n.falls, raises: S.n.raises, broken: S.n.broken, swaps: S.n.swaps, stuck: S.n.stuck, guards: S.n.guards, guardBreaks: S.n.guardBreaks, lantMax, swings };
  if (log) console.log(JSON.stringify(r));
  return r;
}
function duels(N, log) {
  const g = []; for (let i = 1; i <= N; i++) g.push(duel(i, log));
  const avg = k => (g.reduce((a, r) => a + r[k], 0) / N);
  console.log('TOY DUEL SUNKEN CREW n=' + N + ': ' + g.filter(r => r.win).length + '/' + N + ' won, avg ' + avg('t').toFixed(0) + ' s, reach P2 ' + g.filter(r => r.ph === 2).length + '/' + N +
    ', falls ' + avg('falls').toFixed(1) + ', raises ' + avg('raises').toFixed(1) + ', raisings broken ' + avg('broken').toFixed(1) + ', guards ' + avg('guards').toFixed(1) + ' (broken ' + avg('guardBreaks').toFixed(1) + ')' +
    ', P2 swaps ' + avg('swaps').toFixed(1) + ', stuck ' + avg('stuck').toFixed(1) + ', flasks left ' + avg('flasks').toFixed(1) + ', hp left ' + avg('hp').toFixed(0));
  return g;
}
if (opt('sim')) { duels(+opt('sim') || 6, !!opt('log')); process.exit(0); }

/* ---------- 1. THE FLAG BOTH WAYS (clean child processes) ---------- */
{ const run = env => JSON.parse(execFileSync(process.execPath, [HERE, '--child'], { env: { ...process.env, DEEP3: env }, encoding: 'utf8' }).trim().split('\n').pop());
  const off = run(''), on = run('1');
  ok(off.h === MASTER, 'FLAG OFF: the Deep is master\'s, cell for cell (hash ' + off.h.slice(0, 12) + ')');
  ok(!off.d3 && off.boss === 'bellcrab' && off.H === 248, 'flag off: no Deep 3, the Diving Bell is the boss');
  ok(on.d3 && on.boss === 'sunkencrew' && on.H === D3.H, 'FLAG ON: Deep 3 in the same build');
  ok(on.i === off.i && on.needs === off.needs && on.n === off.n, 'the same road slot (index ' + on.i + ', needs ' + on.needs + ') - no index or save moves');
  ok(on.checks <= off.checks, 'NO MORE CHECKPOINTS THAN MASTER: ' + on.checks + ' (master ' + off.checks + '; the trench shrine made it 4, Daniel 11-13)'); }
ok(deep3On(), 'DEEP3=1 turns it on');

/* ---------- 2. THE LEVEL ---------- */
const lv = LEVELS.find(l => l.id === 'deep'), L = lv.build(), W = L.W, at = (x, y) => L.grid[y * W + x];
{ const f = lintDeep3(L, T); ok(!f.length, 'lintDeep3 clean' + (f.length ? ': ' + f.join('; ') : ''));
  ok(lv.rule === 'YOU ARE TOO LIGHT TO BE DOWN HERE.', 'the rule line is the plan\'s');
  const M = (await import('../src/level.js')).LEVELS;   /* (same module: flag on) */ void M;
  /* master's rows 0..KEEP kept as they were: compare against a flag-off build in this process (crabTrench is pure) */
  const { crabTrench } = await import('../src/deep-split.js'); void crabTrench;
  const ent = t => L.ents.filter(e => e.t === t);
  ok(ent('walleel').length >= 8, 'WALL EELS: ' + ent('walleel').length + ' (tower curtains + the bell shaft)');
  ok(ent('walleel').filter(e => e.shaft).length === 4 && ent('walleel').filter(e => e.dir === 'down').length >= 4, 'side eels in the shaft walls, down eels in the curtain walls');
  ok(ent('sunkencrew').length === 1 && !ent('bellcrab').length, 'THE SUNKEN CREW replaces the Diving Bell');
  ok(!L.ents.some(e => /gob/.test(e.t)), 'no goblins');
  ok(L.ents.filter(e => e.t === 'ballast' && e.y > D3.KEEP).every(e => e.rack), 'every stone in the tower is on a rack (A RACK IS NEVER EMPTY: a dropped one goes home)');
  ok(JSON.stringify(ent('silver').map(e => [e.x, e.y])) === '[[92,38],[92,118],[20,145]]', "master's three silvers, in master's order (a silver's place is its save bit): no new one");
  ok(L.moversExtra.length === 1 && L.moversExtra[0].d3bell && L.moversExtra[0].kind === 'lift', 'THE BELL is a lift mover');
  ok(L.deep.currents.some(c => c.d3 === 'upwell' && c.kind === 'hot' && c.fy < 0), 'the rot UPWELLS in the bell shaft (only weight sinks through it)');
  ok(L.deep.currents.some(c => c.d3 === 'window' && Math.abs(c.fx) < 54), 'F2\'s window current is a DRIFT a heavy walk beats (|fx| < 54)');
  ok(L.pools.some(p => p.bottom >= D3.cavern.floor * TS && p.x0 <= D3.tower.x0 * TS && p.x1 >= D3.tower.x1 * TS), 'the sea runs down the tower and the shaft');
  ok(L.pools.some(p => p.x1 >= D3.cavern.x1 * TS && p.bottom >= D3.cavern.floor * TS), 'and over the wreck and the arena');
  for (const f of D3.floors) ok(L.deep.zones.some(z => z.name === f.name), 'the place line names ' + f.name);
  /* A HEAVY HERO CANNOT CLIMB: the walk from where a floor is entered to its way out is flat or steps DOWN, and every curtain leaves two rows */
  const walk = (x0, x1, row, why) => { const dir = Math.sign(x1 - x0); let r = row;
    for (let x = x0; x !== x1 + dir; x += dir) { while (at(x, r + 1) === T.AIR && r < L.H - 2) r++;   /* steps down: fine */
      if (at(x, r) !== T.AIR) { ok(false, why + ': a heavy walker meets a wall at ' + x + ',' + r); return; }
      if (at(x, r - 1) !== T.AIR) { ok(false, why + ': no headroom at ' + x + ',' + (r - 1)); return; } }
    ok(true, why + ': flat or down, headroom all the way (' + x0 + ' -> ' + x1 + ')'); };
  const F = D3.floors, layCracks = g => g;   /* (the cracks are AIR in the grid: walk over them as laid stone) */ void layCracks;
  const solidCracks = () => { for (const s of L.deep3.slabs.concat(L.deep3.steps)) for (let x = s.x0; x <= s.x1; x++) for (let y = s.y0; y <= s.y1; y++) L.grid[y * W + x] = T.SOLID; };
  const g0 = L.grid.slice(); solidCracks();
  walk(18, F[0].crack[0], F[0].y1, 'F1 the rack to the crack');
  walk(F[0].crack[0], F[1].crack[1], F[1].y1, 'F2 under F1\'s crack to its own');
  walk(F[1].crack[1], F[2].crack[0], F[2].y1, 'F3 under F2\'s crack to the settling stone');
  walk(D3.stair.landing[0] + 2, D3.stair.east[0] + 3, D3.stair.landing[2], 'F4 the landing down the stair to the east landing');
  walk(D3.stair.east[0] + 1, D3.shaft.x0 - 1, D3.stair.east[2], 'F4 the east landing to the hatch');
  ok(D3.bell.y0 === D3.stair.east[2] + 1 && [...Array(D3.shaft.x1 - D3.shaft.x0 + 1).keys()].every(i => at(D3.shaft.x0 + i, D3.bell.y0) === T.AIR), 'THE BELL sits in the hatch, her deck flush with the east landing (walk on)');
  L.grid.set(g0);
  /* the cracks: AIR in the grid (the hands lay them), floor either side */
  ok(L.deep3.slabs.length === 3 && L.deep3.slabs.find(s => s.id === 'f3').stoneOnly, 'three cracked slabs; F3\'s is too thick for a hero (the settling stone breaks it)');
  ok(L.deep3.settle.find(s => s.onto === 'f3') && L.deep3.settle.find(s => s.onto.startsWith('step')), 'a settling stone over F3\'s crack and one over the stair');
  /* THE REACH FILL walks the built level (the cracks open, the way the buried city's sand rooms are drained): from the start to the arena and the gate */
  const R = floodReach(L, T, { rides: true }), gate = L.ents.find(e => e.t === 'gate');
  ok(R.near(D3.bell.x + 1, D3.stair.east[2]), 'reach: the tower\'s foot at the bell');
  ok(R.near(D3.arena.trigger, D3.cavern.y1), 'reach: the arena\'s door');
  ok(R.near(gate.x, gate.y), 'reach: the gate');
  const checks = L.ents.filter(e => e.t === 'check');
  ok(checks.length === 4, 'checkpoints: the trench\'s early shrine + master\'s kelp forest + the tower\'s foot + the wreck\'s door (' + checks.map(e => e.x + ',' + e.y).join(' ') + ')');
  { const tr = checks.find(e => e.d3 === 'trench'); ok(tr && tr.x === 59 && tr.y === 63 && tr.y >= 60 && tr.y <= 100, 'the early shrine stands in rows 60-100 (the wreck stack\'s shelf, west end)');
    ok(at(tr.x, tr.y) === T.AIR && at(tr.x, tr.y + 1) !== T.AIR && L.airRooms.some(([x0, x1, y0, y1]) => tr.x >= x0 && tr.x <= x1 && tr.y >= y0 && tr.y <= y1), 'and it stands in an AIR ROOM on footing (not underwater)');
    ok(!L.ents.some(e => e.t !== 'check' && e.t !== 'coin' && e.t !== 'deco' && e.t !== 'sign' && Math.hypot(e.x - tr.x, e.y - tr.y) < 5), 'no foe or fixture within 5 tiles of it'); }
  ok(checks.every(e => at(e.x, e.y) === T.AIR && at(e.x, e.y + 1) !== T.AIR), 'every checkpoint stands on footing');
  ok(L.arena.x0 > checks.find(e => e.d3 === 'wreck').x * TS, 'the wreck\'s shrine is before the crew\'s door');
}

/* ---------- 3. THE WALL EEL ---------- */
{ const run = (e, hero, secs, o = {}) => { const s = WE.newEel(e); s.modeT = 0; const seen = []; let hits = 0, struckBeforeTell = false, tellT = 0;
    for (let i = 0; i < secs * 60; i++) { const dt = 1 / 60; if (o.move) o.move(hero, dt);
      WE.stepEel(s, dt, [hero], { strike: (s2, bx) => { const B = { l: hero.x - 5, r: hero.x + 5, t: hero.y - 14, b: hero.y }; if (bx.l < B.r && bx.r > B.l && bx.t < B.b && bx.b > B.t) { if (!hero.keys.has(s2.key)) { hero.keys.add(s2.key); hits++; } return true; } return false; }, sound() {}, bubble() {} });
      if (s.mode === 'bubble') tellT += dt; if (s.mode === 'strike' && tellT < WE.EEL.tell - 1e-6) struckBeforeTell = true; if (s.mode === 'hidden') tellT = 0;
      if (seen[seen.length - 1] !== s.mode) seen.push(s.mode); }
    return { s, seen, hits, struckBeforeTell }; };
  /* a side eel in a wall (face +1): a hero standing in its line */
  const side = { x: 62, y: 244, face: 1, wall: 61, shaft: true }, hx = 62 * TS + 30, hy = 245 * TS;
  const a = run(side, { x: hx, y: hy, keys: new Set(), alive: true }, 3);
  ok(a.seen.slice(0, 5).join(' ') === 'bubble strike hang back hidden', 'told: (in line) BUBBLES -> strike -> hang -> back (' + a.seen.join(' ') + ')');
  ok(!a.struckBeforeTell, 'it never strikes before its full ' + WE.EEL.tell + ' s of bubbles');
  ok(a.hits >= 1, 'a hero who stands in its line is struck');
  const s = WE.newEel(side); ok(WE.eelTake(s, 20) === 0 && WE.eelBox(s) === null, 'IN THE WALL: a blade does nothing, there is nothing to find');
  s.mode = 'bubble'; ok(WE.eelTake(s, 20) === 0, 'bubbling: still in the wall'); s.mode = 'hang'; s.ext = 1; ok(WE.eelTake(s, 20) === 20 && WE.eelBox(s), 'HANGING out of the wall: whole');
  /* the bell rider: carried down past a shaft eel at the bell's speed */
  const rider = { x: (D3.bell.x * TS + D3.bell.w * TS / 2), y: 238 * TS, keys: new Set(), alive: true };
  const b = run(side, rider, 6, { move: (h, dt) => { h.y += D3.bell.speed * dt; } });
  ok(b.hits === 1, 'a bell rider who does nothing is struck once by a shaft eel as she passes (' + b.hits + ')');
  /* a down eel in a curtain: a heavy walker at 54 px/s who never stops is struck; one who stops at the bubbles and waits is not */
  const down = { x: 35, y: 174, dir: 'down', wall: 173 }, row = 176 * TS;
  const c = run(down, { x: 33 * TS - 40, y: row, keys: new Set(), alive: true }, 4, { move: (h, dt) => { h.x += 54 * dt; } });
  ok(c.hits >= 1, 'a heavy walker who never stops under a curtain is struck');
  let stopped = false; const d = run(down, { x: 33 * TS - 40, y: row, keys: new Set(), alive: true }, 6, { move: (h, dt) => { const s2 = h.s; if (!stopped && h.bub) stopped = true; if (!stopped || h.go) h.x += 54 * dt; } });
  void d;
  { const s2 = WE.newEel(down); s2.modeT = 0; const h = { x: 33 * TS - 40, y: row }; let hits = 0, waited = false, cut = false;
    for (let i = 0; i < 360; i++) { const dt = 1 / 60;
      if (s2.mode === 'bubble' || s2.mode === 'strike') waited = true; else if (!waited || s2.mode === 'hang' || s2.mode === 'back' || s2.mode === 'hidden') h.x += 54 * dt;
      if (s2.mode === 'hang' && Math.abs(h.x - s2.hx) < 24) cut = true;
      WE.stepEel(s2, dt, [{ ...h, alive: true }], { strike: (q, bx) => { const B = { l: h.x - 5, r: h.x + 5, t: h.y - 14, b: h.y }; if (bx.l < B.r && bx.r > B.l && bx.t < B.b && bx.b > B.t) { hits++; return true; } return false; } }); }
    ok(hits === 0, 'a walker who STOPS at the bubbles and goes when it has struck is never hit'); ok(cut, 'and passes it while it hangs out of the wall (CUT IT NOW)'); }
}

/* ---------- 4. THE SUNKEN CREW: B15, the told moves, the tokens, the ten-second rule, phase 2 ---------- */
{ const G = SC.geom(crewStage(TS)), noW = { hit: () => null, say() {}, mark() {}, sound() {}, fx() {}, shake() {}, music() {}, pull() {} };
  ok(SC.ROLES.reduce((a, r) => a + SC.CREW.hp[r], 0) === SC.CREW.sailorHp && SC.CREW.sailorHp === 960, "the brief's shape: four crew sharing what the Sailor has alone (960 each: the brief's ~600 x1.6, Q2)");
  /* B15 floor, every crewman in every mode, from both sides, guarded or not */
  const S = SC.newFight(G, 3); SC.wake(S); let low = 9;
  const modes = ['circle', 'approach', 'rec', 'staggered', 'broken', 'reeling', 'toRaise', 'raise', 'guard', ...Object.keys(SC.CREW.moves).flatMap(m => [m + 'Tell', m])];
  for (const r of SC.ROLES) for (const m of modes) for (const side of [-1, 1]) for (const guarded of [false, true]) { const c = S.crew[r];
    c.mode = m; c.face = 1; const sh = S.crew.shield; if (guarded && r !== 'shield') { sh.mode = 'guard'; sh.guarding = r; } else if (r !== 'shield') { sh.mode = 'circle'; sh.guarding = null; }
    const [d] = SC.takeCrew(S, c, 100, c.x + side * 30); low = Math.min(low, d / 100); }
  ok(low >= 0.4 - 1e-9, 'B15: no crewman, in any mode, from either side, guarded or not, takes under 0.4 (lowest ' + low + ')');
  { const T2 = SC.newFight(G, 4); const c = T2.crew.cutlass, sh = T2.crew.shield; sh.mode = 'guard'; sh.guarding = 'cutlass'; ok(SC.takeCrew(T2, c, 100, c.x - 20)[0] === 40, 'HOLD THE LINE: a guarded mate at the 0.4 floor');
    sh.face = 1; for (let i = 0; i < 3; i++) SC.takeCrew(T2, sh, 10, sh.x + 20); ok(sh.guardHits >= 3, 'blows on the shield-man while he guards count toward breaking it');
    sh.mode = 'circle'; sh.face = 1; ok(SC.takeCrew(T2, sh, 100, sh.x + 20)[0] === 50 && SC.takeCrew(T2, sh, 100, sh.x - 20)[0] === 100, 'the shield-man: his FRONT 0.5, behind whole'); }
  /* the lantern rule never makes anyone immune: with a lantern lit, every living man takes his own number */
  { const T3 = SC.newFight(G, 5); SC.wake(T3); SC.fall(T3, T3.crew.harpoon, noW); ok(T3.lanterns.length === 1 && T3.lanterns[0].t === 10, 'a fallen man\'s SOUL LANTERN: ten seconds');
    ok(SC.living(T3).every(c => SC.takeCrew(T3, c, 100, c.x - 20)[0] >= 40), 'with a lantern lit no living man is immune (B15)'); }
  /* every attack is told: run fights and watch each move pass through its Tell first, and the tokens */
  { let untold = 0, tells = 0, maxTok = 0; const seen = new Set();
    for (let seed = 1; seed <= 6; seed++) { const T4 = SC.newFight(G, seed); SC.wake(T4); const last = {};
      const h = { x: G.mid, y: G.floor, vx: 0, alive: true, ground: true };
      for (let i = 0; i < 60 * 40; i++) { h.x = G.mid + Math.sin(i / 90) * 120; SC.stepFight(T4, 1 / 60, [h], noW); maxTok = Math.max(maxTok, T4.tokens);
        for (const c of SC.crewOf(T4)) { if (last[c.role] !== c.mode) { if (c.move && c.mode === c.move) { seen.add(c.move); if (last[c.role] !== c.move + 'Tell') untold++; else tells++; } last[c.role] = c.mode; } } } }
    ok(untold === 0 && tells > 20, 'every crew move is released from its own Tell (' + tells + ' told, ' + untold + ' untold)');
    ok(['lunge', 'flurry', 'bash', 'guard', 'throw', 'reel', 'slam', 'charge'].every(m => seen.has(m)), 'all eight moves come up (' + [...seen].join(' ') + ')');
    ok(maxTok <= 2, 'AT MOST TWO ATTACK AT ONCE (max tokens held ' + maxTok + ')'); }
  for (const m of Object.keys(SC.CREW.moves)) ok(SC.POSE[m + 'Tell'] && SC.POSE[m] && SC.POSE[m + 'Tell'] !== SC.POSE[m], 'B16: ' + m + ' has its own windup and release pose');
  /* THE TEN-SECOND RULE: the lantern burns out, a mate swims over and raises him (told); a blow breaks it off; he tries again */
  { const T5 = SC.newFight(G, 9); SC.wake(T5); const h = { x: G.x0 + 10, y: G.top + 30, vx: 0, alive: true, ground: false };
    for (let i = 0; i < 120; i++) SC.stepFight(T5, 1 / 60, [h], noW);
    SC.fall(T5, T5.crew.heavy, noW); let raiser = null, tRaise = null, broke = false;
    for (let i = 0; i < 60 * 20 && T5.crew.heavy.fallen; i++) { SC.stepFight(T5, 1 / 60, [h], noW); const r = SC.crewOf(T5).find(c => c.raising === 'heavy');
      if (r && !raiser) { raiser = r; tRaise = T5.t; } if (r && r.mode === 'raise' && !broke) { broke = true; SC.struck(T5, r, noW); ok(r.mode === 'reeling', 'a blow on the raiser BREAKS IT OFF (he reels)'); } }
    ok(raiser && tRaise >= 10 - 0.05 + 2, 'nobody stoops to raise him before the lantern is out (' + (tRaise - 2).toFixed(1) + ' s)');
    ok(!T5.crew.heavy.fallen && T5.crew.heavy.hp === Math.round(T5.crew.heavy.maxHp * SC.CREW.lantern.rise) && T5.n.raises === 1 && T5.n.broken === 1, 'he tries again and RAISES him at ' + (SC.CREW.lantern.rise * 100) + '% (broken off once first)'); }
  /* PHASE 2: all four fallen = the souls merge; the merge takes blows at 0.4; swap = OPEN gold; a missed reel = STUCK; a ward after every opening; never under 0.4 */
  { const T6 = SC.newFight(G, 11); SC.wake(T6); for (const r of SC.ROLES) SC.fall(T6, T6.crew[r], noW);
    ok(T6.ph === 2 && T6.sailor && T6.sailor.mode === 'merge', 'fell all four and THE CURSED SAILOR rises');
    ok(SC.takeSailor(T6, 100, 0)[0] === 40, 'the merge takes a blow at the 0.4 floor (never immune)');
    const s = T6.sailor, h = { x: G.mid - 60, y: G.floor, vx: 0, alive: true, ground: true }; let swapOpen = 0, ward = 0, stuckSeen = 0, low = 9;
    const w = { ...noW, hit: () => null };
    for (let i = 0; i < 60 * 90; i++) { SC.stepFight(T6, 1 / 60, [h], w); if (s.mode === 'swap') { swapOpen++; ok(swapOpen > 1 || SC.takeSailor(T6, 100, h.x)[0] === 150, 'the SWAP: a gold window x1.5'); }
      if (s.mode === 'stuck') stuckSeen++; if (s.ward > 0 && !SC.sailorOpen(s)) ward++;
      for (const fx of [h.x, s.x + 30, s.x - 30]) low = Math.min(low, SC.takeSailor(T6, 100, fx)[0] / 100); T6.n.openHits = 0; }
    ok(T6.n.swaps >= 3, 'he swaps stance (' + T6.n.swaps + ' in 90 s)'); ok(ward > 0, 'a WARD follows the opening (told grey ring)');
    ok(low >= 0.4 - 1e-9, 'B15: the Sailor never takes under 0.4 (lowest ' + low + ')');
    ok(stuckSeen > 0, 'a REEL that misses leaves the harpoon STUCK = open (' + T6.n.stuck + ')'); }
  ok(SC.crewPlan(SC.newFight(G, 1), { x: G.mid, y: G.floor, hp: 300, max: 300 }).target, 'the lab plan picks a target');
}

/* ---------- 5. THE HANDS on a fake world (spawn, update, tick, a crack giving under weight, a settling stone, the rot, draw) ---------- */
{ const grid = L.grid.slice(), Lw = { ...L, grid }, cells = (x, y) => grid[y * W + x], players = [];
  const P = { x: 18 * TS + 8, y: 176 * TS, vx: 0, vy: 0, hp: 300, maxHp: 300, ground: true, ballast: { t: 'ballast' }, w: 10, h: 14, onMover: null }; players.push(P);
  const hurts = []; const movers = [{ ...L.moversExtra[0] }], boxes = [];
  const g = new Proxy({}, { get: (o, k) => (k === 'globalAlpha' || k === 'lineWidth' || k === 'fillStyle' || k === 'strokeStyle' || k === 'font' ? o[k] : (typeof o[k] === 'function' ? o[k] : (o[k] = () => {}))), set: (o, k, v) => { o[k] = v; return true; } });
  let time = 0, bossActive = false, boss = null; const enemies = [];
  const ctx = { get L() { return Lw; }, get players() { return players; }, get boss() { return boss; }, get bossActive() { return bossActive; }, TS, T, EHP: { walleel: 20, sunkencrew: 1920 }, sfx: {}, hero: () => P, time: () => time, VW: () => 480,
    number() {}, burst() {}, dust() {}, shake() {}, ring() {}, hint() {}, hitstop() {}, damagePlayer: (x, d, o) => { hurts.push([d, o.name]); P.hp -= d; return 'hit'; }, asPlayer: (p, fn) => fn(), upright: p => !p.dead,
    box: b => ({ l: b.x - (b.w || 10) / 2, r: b.x + (b.w || 10) / 2, t: b.y - (b.h || 14), b: b.y }), cellSet: (x, y, t) => { grid[y * W + x] = t; }, solidAt: (x, y) => cells(x, y) === T.SOLID || cells(x, y) === T.PLANK,
    addEnemy: b => enemies.push(b), killBoss: e => { e.alive = false; }, movers: () => movers, deepBoxes: () => boxes, moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; }, dropBallast: () => { P.ballast = null; }, bubble() {} };
  const H = makeDeep3Hands(ctx); ok(H.on(), 'the hands wake on L.deep3'); H.clear();
  const s1 = L.deep3.slabs[0]; ok(cells(s1.x0, s1.y0) === T.SOLID, 'the cracks are laid as stone at load');
  /* weight on F1's crack: the walker stands on it */
  P.x = (s1.x0 + 2) * TS; P.y = s1.y0 * TS; for (let i = 0; i < 90; i++) { time += 1 / 60; H.tick(1 / 60); }
  ok(cells(s1.x0, s1.y0) === T.AIR, 'a HEAVY hero standing on F1\'s crack: it creaks, then gives');
  H.clear(); ok(cells(s1.x0, s1.y0) === T.AIR, 'and a death keeps it given (the way you made stays made)');
  const s3 = L.deep3.slabs.find(s => s.stoneOnly); P.x = (s3.x0 + 1) * TS; P.y = s3.y0 * TS; let wasHurt = 0;
  for (let i = 0; i < 160; i++) { time += 1 / 60; H.tick(1 / 60); if (i === 30) { wasHurt = hurts.length; P.x = (s3.x0 - 4) * TS; } }
  ok(cells(s3.x0 + 1, s3.y0) === T.AIR, 'F3: stand under the settling stone, step away - it falls and BREAKS the floor for you');
  ok(hurts.length === wasHurt, 'and a hero who stepped away when the grit ran is not hit');
  const st = H.show().per.stones.find(s => s.onto === 'f3'); ok(st.mode === 'rest' && cells(st.x0, st.rest.y1) === T.SOLID && st.rest.y1 === D3.stair.landing[2], 'it comes to rest on F4\'s landing, laid as stone (a step)');
  /* the rot vent breathes */
  const rv = H.show().per.rot.find(r => r.id === 'r1'); P.ballast = null; P.x = (rv.x + 1) * TS; P.y = (rv.y1 + 1) * TS; const h0 = hurts.length;
  for (let i = 0; i < 6 * 60; i++) { time += 1 / 60; H.tick(1 / 60); } ok(hurts.length > h0 && hurts.slice(h0).every(q => q[1] === 'THE ROT'), 'a rot vent breathes on its cycle and hurts by the tick (' + (hurts.length - h0) + ' ticks in 6 s)');
  /* a step gives under a heavy step and settles back */
  const sp = L.deep3.steps[0]; P.ballast = { t: 'ballast' }; P.x = (sp.x0 + 1) * TS; P.y = sp.y0 * TS; for (let i = 0; i < 60; i++) { time += 1 / 60; H.tick(1 / 60); }
  ok(cells(sp.x0, sp.y0) === T.AIR, 'a stair step gives under a heavy step'); P.x = 20 * TS; P.y = 200 * TS;
  for (let i = 0; i < 60 * 9; i++) { time += 1 / 60; H.tick(1 / 60); } ok(cells(sp.x0, sp.y0) === T.SOLID, 'and settles back ' + 8 + ' s later (no soft lock)');
  /* the bell's air rides with her */
  H.tick(1 / 60); ok(boxes.length === 1 && boxes[0].kind === 'bell' && boxes[0].b === movers[0].y, 'THE BELL: her air box rides with her');
  for (const e of L.ents.filter(e => e.t === 'walleel' || e.t === 'sunkencrew')) { const a = H.spawn(e, { x: e.x * TS, y: e.y * TS, alive: true }); ok(a && H.owns(a), 'spawns ' + e.t); enemies.push(a); if (a.t === 'sunkencrew') boss = a; }
  ok(enemies.filter(e => e.t === 'crewman').length === 4, 'the anchor pushes four bodies');
  /* the fight: wake, step, a blow on a crewman, draw everything */
  bossActive = true; boss.mode = 'wake'; boss.modeT = 1.6; P.x = D3.arena.trigger * TS + 60; P.y = D3.cavern.floor * TS;
  for (let i = 0; i < 600; i++) { time += 1 / 60; for (const e of enemies) H.update(e, 1 / 60); H.tick(1 / 60); }
  const cw = enemies.find(e => e.t === 'crewman' && e.role === 'cutlass'); const hp0 = cw.hp; H.hit(cw, 30, cw.x - 20, false);
  ok(cw.hp < hp0 && boss.hp < boss.maxHp, 'a blow on a crewman comes off his bar and the anchor\'s');
  ok(H.hit(boss, 99, 0, false) === true, 'the anchor takes no blade');
  ok(/THE SUNKEN CREW/.test(H.barName(boss)), 'the bar: ' + H.barName(boss));
  for (const e of enemies) H.drawFoe(g, e, 0, 0, time); H.drawBack(g, 0, 0, time); H.drawOver(g, 0, 0, time); ok(true, 'drawBack / drawFoe / drawOver run');
  const eel = enemies.find(e => e.t === 'walleel'); eel.st.mode = 'hidden'; ok(H.hit(eel, 20, 0, false) === true, 'an eel IN THE WALL swallows the blow'); eel.st.mode = 'hang'; ok(H.hit(eel, 20, 0, false) === false, 'out of it, the game\'s own blow');
  /* to the end: fell all four, then the Sailor */
  const S = H.show().S; for (const r of SC.ROLES) { const b = enemies.find(e => e.t === 'crewman' && e.role === r); H.hit(b, 9999, b.x - 20, false); }
  ok(S.ph === 2, 'four fallen in a row: phase two'); for (let i = 0; i < 4; i++) { time += 1 / 60; H.update(boss, 1 / 60); }
  const sb = enemies.find(e => e.t === 'cursedsailor'); ok(sb && sb.alive, 'the Sailor\'s body is in the list');
  for (let i = 0; i < 200 && boss.alive; i++) { time += 1 / 60; H.update(boss, 1 / 60); H.hit(sb, 400, sb.x - 20, false); }
  ok(!boss.alive, 'the Sailor falls and the anchor dies the way every boss does'); }

/* ---------- 6. THE TOY DUELS ---------- */
const g6 = duels(6, !!opt('log'));
ok(g6.filter(r => r.ph === 2).length >= 3, 'the careful bot reaches phase two in most fights (the rule is playable)');
ok(g6.some(r => r.broken > 0) || g6.some(r => r.raises > 0), 'the lantern rule bites (raises / broken raisings happen)');
console.log('deep3 ' + n + ' ok');
