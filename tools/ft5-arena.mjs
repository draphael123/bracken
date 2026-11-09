/* tools/ft5-arena.mjs - FALLING TOWER 5's BOSS ARENA, THE SPIRE FIELD (claude/ft5b; scratch/lane-reports/ft5-plan.md sec 3 + sec 6). Node only, no page.
   Builds THE FALLING TOWER with FT5 on and drives src/spire-field.js + src/undead-mage.js headless (main.js's hands faked, a tiny body physics for the seats):
   BUILD      the field in FT5_ARENA: six spires out of the sea, his arena (P1 box), the sanctum's door to the sand, the sand + gate, him in the box; signs unique
   REACH      the built level reaches every spire top from THE CROWN (src/reachcore.js floodReach)
   TIDES      tied to his health (85/70/60%), told (lead) then rising 4 rows each, holding; >= 3 spire tops over every tide, and every top over the tide
              reachable from every other (the knight's jump: rise 3 rows, ~6 across, less as it rises); a topple never under a hero mid-tell
   OPENINGS   struck back (reflected), mark on nobody (gather), a dodge through his ring (breached), a buttress on him (crushed): each drops him onto a top
              you can stand on, open (x2) there; a buttress struck with him out of its box falls anyway, once; his ward holds one
   RESIST     GREED.chipBy.undeadmage 0.4 outside openings - on foot, on the carpet, and in a realm (main.js lets a realm-warded blow through under FT5)
   THE FADE   at 50% (his spell done): every seat (lead, partner, a downed partner) mounted, 0 damage, i-frames all through, no 'wake'; every tile in the
              box gone; the sea drained; the arena is the carpet box (same x); the hero's per-frame move (the follow camera's bound) <= 8 px; the lock's ease <= 8 px a frame
   PHASE 2    he re-forms 1.0 s after the last catch; realms FIRE 40 / ICE 20 in place (centred on the carpet box, nobody moved), no poison realm; enraged at 30%
   RESET      a death puts every tile of the box back and the arena back to phase 1 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
globalThis.__FT5 = true;
const { LEVELS, T } = await import('../src/level.js');
const { floodReach } = await import('../src/reachcore.js');
const { FT5_ARENA } = await import('../src/tower-fall5.js');
const SF = await import('../src/spire-field.js');
const UM = await import('../src/undead-mage.js');
const { REALM, realmBox, realmDue, enterRealm } = await import('../src/mage-realms.js');
const { GREED, chipOf, chipped } = await import('../src/boss-greed.js');
const { isCallout } = await import('../src/hint-lines.js');
const TS = 16, out = [], A = FT5_ARENA;
const build = () => LEVELS.find(l => l.id === 'fallingtower').build();
const L0 = build(), F0 = L0.spireField;

// ---- BUILD ----
assert.ok(F0 && L0.arena && L0.arena.spire && L0.sanctum && L0.ft5 && L0.ft5.field, 'the spire field did not build into the FT5 level');
assert.equal(F0.spires.length, 6, 'six spires');
for (const s of F0.spires) { assert.ok(s.x0 >= A.x0 && s.x1 <= A.x1 && s.top > A.y0 && s.top < A.sea, s.id + ' is not a spire in the box over the sea');
  for (let y = s.top; y <= A.y1; y++) for (let x = s.x0; x <= s.x1; x++) assert.equal(L0.grid[y * L0.W + x], T.SOLID, s.id + ' has a hole at ' + x + ',' + y); }
assert.ok(L0.arena.x0 === A.x0 * TS && L0.arena.x1 === (A.x1 + 1) * TS && L0.arena.boss === 'undeadmage' && !L0.arena.carpet && L0.arena.trigger > 1e8, 'his phase-1 arena');
assert.ok(L0.arena.start[0] * TS + 8 > (A.x0 + 1) * TS, 'the boss jump does not stand you past the field\'s start line');
{ const boss = L0.ents.filter(e => e.t === 'undeadmage'); assert.equal(boss.length, 1, 'one Archmage'); assert.ok(boss[0].x >= A.x0 && boss[0].x <= A.x1 && boss[0].y > A.y0, 'he is not over the spires');
  const gates = L0.ents.filter(e => e.t === 'gate'); assert.equal(gates.length, 1, 'one gate (the sand\'s)'); assert.equal(L0.grid[(gates[0].y + 1) * L0.W + gates[0].x], T.SOLID, 'the gate stands on no sand');
  assert.ok(L0.sanctum.sand.y === SF.SAND5.row * TS && L0.grid[SF.SAND5.row * L0.W + SF.SAND5.arrive] === T.SOLID, 'the sanctum door does not put you on the sand');
  const signs = L0.ents.filter(e => e.t === 'sign').map(e => e.text); assert.equal(new Set(signs).size, signs.length, 'two signs say the same');
  assert.ok(L0.mage.skins.some(s => s[4] === 'dune'), 'the sand is not skinned as dune'); }
for (const s of SF.SPIRE_SAY) assert.ok(isCallout(s), 'a spire line is not routed to the hint box: ' + s);
out.push('build: 6 spires, P1 arena ' + L0.arena.x0 + '-' + L0.arena.x1 + ', the sand door, one gate, ' + SF.SPIRE_SAY.length + ' lines routed');

// ---- REACH from THE CROWN (the built level, the flood model) ----
{ const R = floodReach(L0, T, { rides: true }), st = (x, y) => R.seen.has(x + ',' + y);
  assert.ok(st(A.crownSpot.x, A.crownSpot.y), 'the crown is not reached');
  for (const s of F0.spires) { let ok = false; for (let x = s.x0; x <= s.x1; x++) if (st(x, s.top - 1)) ok = true; assert.ok(ok, s.id + "'s top is not reached from the crown"); }
  out.push('reach: every spire top from the crown (' + R.seen.size + ' cells)'); }

// ---- A FAKE MAIN: a grid, seats with a tiny physics, the hands ----
function world(o = {}) {
  const L = build(), W = L.W, grid0 = L.grid.slice(); L.arena = { ...L.arena };
  const solid = (x, y) => { const t = L.grid[y * W + x]; return t === T.SOLID; }, stand = (x, y) => { const t = L.grid[y * W + x]; return t === T.SOLID || t === T.ONEWAY; };
  const seat = (x, row, extra) => ({ x: x * TS + 8, y: row * TS, vx: 0, vy: 0, ground: true, dead: false, inv: 0, atk: -1, dodge: 0, hp: 100, ...(extra || {}) });
  const P = seat(A.crownSpot.x + 6, A.runFloor), seats = [P];
  const log = { hurt: 0, said: [], mounted: [], placed: 0, lock: [], started: 0, damage: 0 };
  let active = false, strikeBox = null;
  const boss = (() => { const e = L.ents.find(q => q.t === 'undeadmage'); return { t: 'undeadmage', x: e.x * TS + 8, y: (e.y + 1) * TS, w: 16, h: 40, hp: 2800, maxHp: 2800, hp0: 2800, mode: 'sleep', modeT: 0, turn: 0, open: 0, shots: [], clouds: [], alive: true, face: -1 }; })();
  const cam = { x: P.x - 160, y: P.y - 100, w: 320, h: 180 };
  const c = { T, set: (x, y, t) => { L.grid[y * W + x] = t; }, tile: (x, y) => L.grid[y * W + x], boss: () => boss, active: () => active, start: () => { active = true; log.started++; boss.mode = 'wake'; boss.modeT = 1.6; },
    seats: () => seats, hurt: (p, x, d) => { log.hurt++; if (!(p.inv > 0)) { p.hp -= d; log.damage += d; } }, place: (p, x, y) => { log.placed++; p.x = x; p.y = y; p.vx = 0; p.vy = -90; p.ground = false; },
    guard: (p, s) => { p.inv = Math.max(p.inv || 0, s); }, mount: (p, x, y) => { p.carpet = { t: 0 }; p.x = x; p.y = y; p.vy = 0; L.carpetUp = true; log.mounted.push({ p, t: o.time() }); },
    strike: () => strikeBox, say: s => log.said.push(s), sound: () => {}, shake: () => {}, dust: () => {}, cam: () => cam, lock: (x0, x1) => log.lock.push([x0, x1]), now: () => 0 };
  /* his fight's own ctx (main.js updateUndeadMage's c): hits land on the lead */
  const mc = () => ({ P, box: boss.realm ? realmBox(boss, L.arena) : SF.carpetBoxOf(L.arena), A: L.arena, rnd: Math.random,
    hit: (x, y, d) => { if (!(P.inv > 0)) { P.hp -= d; log.damage += d; } return 'hit'; }, say: s => log.said.push(s), sound: () => {}, shake: () => {}, venom: () => {}, unsay: () => {},
    dodging: () => !!P.carpet && P.dodge > 0, strike: () => null, carry: (x, y) => { P.x = x; P.y = y + 8; }, pull: () => { log.pulled = true; } });
  function phys(p, dt) { if (p.carpet || p.dead) return; p.vy = Math.min(900, p.vy + 1000 * dt); const y1 = p.y + p.vy * dt, tx = Math.floor(p.x / TS);
    if (p.vy >= 0) { for (let r = Math.floor(p.y / TS); r <= Math.floor(y1 / TS); r++) if (r * TS >= p.y - 0.01 && stand(tx, r)) { p.y = r * TS; p.vy = 0; p.ground = true; return; } }
    p.y = y1; p.ground = false; }
  let t = 0; o.time = () => t;
  function tick(dt = 1 / 60, opt = {}) {
    for (const p of seats) p.inv = Math.max(0, (p.inv || 0) - dt);
    SF.spireStep(L, P, dt, c);
    if (boss.alive && boss.mode !== 'sleep') UM.updateUndeadMage(boss, dt, mc());
    if (boss.alive) { const A2 = L.arena; boss.x = Math.max(A2.x0, Math.min(A2.x1, boss.x)); boss.y = Math.max(A2.y0 + 30, Math.min(A2.floor + 10, boss.y)); }   /* main.js's own clamp after his step */
    if (!opt.noPhys) for (const p of seats) phys(p, dt);
    t += dt; }
  SF.spireReset(L, (x, y) => { L.grid[y * W + x] = grid0[y * W + x]; });
  return { L, W, grid0, P, seats, seat, boss, log, c, tick, cam, setActive: v => { active = v; }, setStrike: b => { strikeBox = b; }, t: () => t, solid };
}

// ---- THE START: off the crown onto the west spire, the lock eases (no snap) ----
{ const w = world(); w.P.x = (A.x0 + 3) * TS; w.P.y = A.runFloor * TS; w.P.ground = true; w.tick();
  assert.equal(w.log.started, 1, 'stepping onto the west spire did not start his fight');
  for (let i = 0; i < 60; i++) w.tick(1 / 60, { noPhys: true });
  const L1 = w.log.lock; let worst = 0; for (let i = 1; i < L1.length; i++) worst = Math.max(worst, Math.abs(L1[i][0] - L1[i - 1][0]), Math.abs(L1[i][1] - L1[i - 1][1]));
  assert.deepEqual(L1[L1.length - 1], [w.L.spireField.p1.x0, w.L.spireField.p1.x1], 'the lock does not end on the box');
  assert.ok(worst <= 8, 'the lock eases ' + worst.toFixed(1) + ' px in a frame (> 8)');
  out.push('start: on the west spire, the lock eases to the box over 0.8 s (worst ' + worst.toFixed(1) + ' px a frame)'); }

// ---- THE TIDES and THE TOPPLES, with the reach model over each ----
const UP = 3, ACROSS = 6, span = dy => Math.round(ACROSS * (1 - Math.min(Math.abs(dy), UP + 1.5) / (UP + 1.5)));
function edge(a, b) { const gap = Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1) - 1), dy = b.row - a.row;   /* dy < 0: b is higher */
  if (dy < -UP) return false; if (dy <= 0) return gap <= Math.max(1, span(dy)) || (gap === 0 && dy >= -UP);
  return gap <= 4 || (Math.max(a.x0, b.x0) <= Math.min(a.x1, b.x1)); }   /* down: off an edge you drift; straight down always */
function connected(tops) { for (const s of tops) { const seen = new Set([s]), q = [s]; while (q.length) { const a = q.pop(); for (const b of tops) if (!seen.has(b) && edge(a, b)) { seen.add(b); q.push(b); } } if (seen.size !== tops.length) return tops.filter(b => !seen.has(b)); } return []; }
{ const w = world(), F = w.L.spireField, R = F.rt, e = w.boss; w.setActive(true); R.started = true; e.mode = 'hover'; e.modeT = 99; e.sf = 'p1';
  const stand = F.spires[0];   /* a hero holds the west spire through its tell */
  w.P.x = (stand.x0 + 3) * TS; w.P.y = stand.top * TS; w.P.ground = true;
  const report = [];
  const check = label => { const tops = SF.topsOf(F, R), spireTops = tops.filter(t => t.spire !== undefined);
    assert.ok(spireTops.length >= 3, label + ': only ' + spireTops.length + ' spire tops over the tide');
    const lost = connected(tops); assert.equal(lost.length, 0, label + ': tops not reachable from the others: ' + JSON.stringify(lost));
    report.push(label + ' sea ' + Math.round(R.seaY / TS) + ' tops ' + tops.length); };
  check('before');
  let seenHold = false;
  for (const [k, hp] of [[0, 0.84], [1, 0.69], [2, 0.59]]) {
    assert.equal(R.tides[k], null, 'tide ' + (k + 1) + ' came before his health reached it');
    e.hp = Math.round(e.hp0 * hp); w.tick(1 / 60, { noPhys: true }); e.mode = 'hover'; e.modeT = 99;
    assert.ok(R.tides[k] && R.tides[k].st === 'tell', 'tide ' + (k + 1) + ' is not told at ' + hp);
    const sea0 = R.seaY; for (let i = 0; i < Math.round(SF.TIDE.lead * 60) - 2; i++) { w.tick(1 / 60, { noPhys: true }); e.mode = 'hover'; e.modeT = 99; }
    assert.equal(R.seaY, sea0, 'tide ' + (k + 1) + ' rose inside its tell');
    for (let i = 0; i < 60 * 9; i++) { w.tick(1 / 60, { noPhys: true }); e.mode = 'hover'; e.modeT = 99;
      F.spires.forEach((s, j) => { if (R.spires[j].st === 'tell' && R.spires[j].t > SF.TOPPLE.tell && w.P.y === s.top * TS && w.P.x > s.x0 * TS) seenHold = true; });
      if (k === 0 && i === 60 * 3) { w.P.x = (F.spires[1].x0 + 2) * TS; w.P.y = F.spires[1].top * TS; } }   /* off the west spire: now it may go */
    assert.equal(Math.round(R.seaY / TS), F.tides[k].row, 'tide ' + (k + 1) + ' does not hold at row ' + F.tides[k].row);
    F.spires.forEach((s, j) => { if (s.fallAt === k + 1) { assert.equal(R.spires[j].st, 'gone', s.id + ' did not go over at tide ' + (k + 1));
      for (let x = s.x0; x <= s.x1; x++) assert.equal(w.L.grid[(s.top) * w.W + x], s.bridge && x >= s.bridge[0] && x <= s.bridge[1] && s.bridge[2] === s.top ? T.SOLID : T.AIR, s.id + ' still stands at ' + x);
      if (s.bridge) for (let x = s.bridge[0]; x <= s.bridge[1]; x++) assert.equal(w.L.grid[s.bridge[2] * w.W + x], T.SOLID, s.id + "'s bridge is not laid at " + x); } });
    check('tide ' + (k + 1)); }
  assert.ok(seenHold, 'the west spire did not hold its tell while a hero stood on it');
  /* the ebb while he is open */
  { const s0 = R.seaY; e.mode = 'down'; e.modeT = 3; for (let i = 0; i < 60; i++) w.tick(1 / 60, { noPhys: true }); assert.ok(R.seaY > s0 + 8, 'the sea does not ebb while he is open'); }
  out.push('tides at 85/70/60%: told ' + SF.TIDE.lead + ' s, 4 rows each; ' + report.join('; ') + '; a topple waits for the hero to step off'); }

// ---- HIS POISON: hurt + thrown onto a top, never killed (spare is main's), one hold a seat ----
{ const w = world(), F = w.L.spireField, R = F.rt; w.setActive(true); R.started = true;
  const p2 = w.seat(A.x0 + 16, A.sea + 2); w.seats.push(p2); w.P.x = (A.x0 + 37) * TS; w.P.y = (A.sea + 1) * TS;
  w.tick(1 / 60, { noPhys: true });
  assert.equal(w.log.hurt, 2, 'the poison did not touch each seat in it'); assert.equal(w.log.placed, 2, 'a seat in the poison was not thrown out');
  for (const p of w.seats) { const tops = SF.topsOf(F, R); assert.ok(tops.some(t => p.y === t.row * TS && p.x >= t.x0 * TS && p.x <= (t.x1 + 1) * TS), 'a seat was thrown onto no top'); }
  w.P.y = (A.sea + 1) * TS; w.tick(1 / 60, { noPhys: true }); assert.equal(w.log.hurt, 2, 'the poison bit again inside its hold');
  out.push('poison: per seat, ' + SF.TIDE.dmg + ' and thrown onto the nearest top, a ' + SF.TIDE.hold + ' s hold'); }

// ---- OPENINGS: each drops him onto a top you stand on, open there ----
{ const kinds = ['reflected', 'gather', 'breached', 'crushed'], seen = [];
  for (const kind of kinds) { const w = world(), F = w.L.spireField, R = F.rt, e = w.boss; w.setActive(true); R.started = true;
    w.P.x = (F.spires[2].x0 + 3) * TS; w.P.y = F.spires[2].top * TS;
    e.mode = 'hover'; e.modeT = 1; w.tick(); e.mode = kind; e.modeT = 2;
    let landed = null; for (let i = 0; i < 240 && !landed; i++) { w.tick(); if (e.mode === 'down') landed = { x: e.x, y: e.y }; }
    assert.ok(landed, kind + ': he never came down');
    const tops = SF.topsOf(F, R); assert.ok(tops.some(t => landed.y === t.row * TS && landed.x >= t.x0 * TS && landed.x <= (t.x1 + 1) * TS), kind + ': he did not land on a top');
    assert.ok(UM.mageOpen(e) && e.open > 2.5, kind + ': not open on the top');
    for (let i = 0; i < 60 * 4; i++) w.tick(); assert.ok(!UM.mageOpen(e) && e.mode !== 'down', kind + ': he never rose');
    seen.push(kind); }
  /* the buttress: with him in its box it brings the spire's top down on him; out of it, it falls anyway (once); his ward holds one */
  { const w = world(), F = w.L.spireField, R = F.rt, e = w.boss; w.setActive(true); R.started = true; const i = F.spires.findIndex(s => s.buttress), B = F.spires[i].buttress;
    const hit = () => w.setStrike({ l: B.col * TS - 4, r: (B.col + 1) * TS + 4, t: B.top * TS, b: (B.bot + 1) * TS });
    e.mode = 'hover'; e.modeT = 99; e.x = (B.box[0] + B.box[1]) / 2 * TS; e.y = (B.box[3] - 1) * TS; e.wardHold = 2; hit(); w.tick(1 / 60, { noPhys: true }); w.setStrike(null);
    assert.equal(R.butt[i].st, 'up', 'a warded buttress strike was used up'); assert.ok(w.log.said.includes(SF.SPIRE_LINES.warded), 'the ward\'s hold is not said');
    e.wardHold = 0; e.mode = 'hover'; e.x = (B.box[0] + B.box[1]) / 2 * TS; e.y = (B.box[3] - 1) * TS; hit(); w.tick(1 / 60, { noPhys: true }); w.setStrike(null);
    assert.equal(R.butt[i].st, 'down', 'the buttress did not fall'); assert.ok(e.mode === 'fall' || e.mode === 'crushed', 'the spire did not come down on him: ' + e.mode);
    const j = F.spires.findIndex((s, k) => s.buttress && k !== i), B2 = F.spires[j].buttress; e.x = (B2.box[0] - 6) * TS; e.mode = 'hover';
    w.setStrike({ l: B2.col * TS - 4, r: (B2.col + 1) * TS + 4, t: B2.top * TS, b: (B2.bot + 1) * TS }); w.tick(1 / 60, { noPhys: true }); w.setStrike(null);
    assert.equal(R.butt[j].st, 'down', 'a buttress struck with him out of its box did not fall'); assert.ok(w.log.said.includes(SF.SPIRE_LINES.miss), 'the miss is not said'); }
  out.push('openings on foot: ' + seen.join(', ') + ' - each drops him onto a top, open x' + UM.MAGE.openMul + ' ' + SF.P1.downT + ' s; buttress: crush / miss / ward holds'); }

// ---- THE 50% FLOOR and RESIST ----
{ const w = world(), e = w.boss; e.sf = 'p1'; e.hp = 1450; const d = SF.floorDmg(w.L, e, 200, s => w.log.said.push(s));
  assert.equal(d, 1450 - SF.hpFloorOf(e), 'the floor does not take him to exactly 50%'); assert.ok(w.log.said.includes(SF.SPIRE_LINES.holds), 'HE HOLDS is not said');
  e.hp = SF.hpFloorOf(e); e.mode = 'down'; e.modeT = 3; assert.equal(SF.floorDmg(w.L, e, 50), 0, 'a blow at the floor took health'); assert.ok(e.modeT <= SF.P1.heldDown, 'his down is not cut short at the floor');
  e.sf = 'p2'; assert.equal(SF.floorDmg(w.L, e, 50), 50, 'the floor holds on the carpet');
  assert.equal(GREED.chipBy.undeadmage, SF.RESIST.chip, 'his chip is not 0.4');
  const m = { t: 'undeadmage', alive: true, hp: 1000, hp0: 2800, maxHp: 2800, mode: 'hover', modeT: 1, rings: [], shots: [] };
  assert.ok(chipped(m, true), 'he is not on the chip');
  for (const [label, o] of [['on foot', { mode: 'hover' }], ['carpet', { mode: 'fireTell' }], ['realm (warded)', { mode: 'rhover', realm: { kind: 'fire', i: 0, A: w.L.arena } }]]) {
    const q = { ...m, ...o }, raw = 100; let sum = 0; q.chipAcc = 0; for (let i = 0; i < 10; i++) sum += chipOf(q, raw, raw);
    assert.ok(Math.abs(sum - raw * 10 * SF.RESIST.chip) <= 1, label + ': a blow lands at ' + (sum / 1000).toFixed(2) + ', not 0.4'); }
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(/if\(L\.spireField&&realmWarded\(e\)&&!\(e\.open>0\)\)\{realmWardHit\(e\);SFX\.clank\(\);[^\n]*\}else/.test(src), 'main.js does not let a realm-warded blow through to the chip under FT5');
  assert.equal((src.match(/\(claude\/ft5b\)/g) || []).length, 8, 'main.js has not exactly 8 ft5b hook lines');
  out.push('floor 50% on foot (HE HOLDS, down cut to ' + SF.P1.heldDown + ' s); chip 0.4 on foot, carpet and in a realm (main hook)'); }

// ---- THE FADE AND THE FALL: every seat caught, no damage, no 'wake', the box cleared, one camera ----
{ const w = world(), F = w.L.spireField, R = F.rt, e = w.boss; w.setActive(true); R.started = true; e.sf = 'p1';
  /* three tides in: the field as it is at 50% */
  e.mode = 'hover'; e.modeT = 99; for (const hp of [0.84, 0.69, 0.59]) { e.hp = Math.round(e.hp0 * hp); for (let i = 0; i < 60 * 10; i++) { w.tick(1 / 60, { noPhys: true }); e.mode = 'hover'; e.modeT = 99; } }
  const tops = SF.topsOf(F, R).sort((a, b) => a.row - b.row);
  const put = (p, t) => { p.x = (t.x0 + 1) * TS + 8; p.y = t.row * TS; p.ground = true; p.vy = 0; };
  put(w.P, tops[0]); const p2 = w.seat(0, 0), p3 = w.seat(0, 0, { down: 3 }); put(p2, tops[tops.length - 1]); put(p3, tops[1]); w.seats.push(p2, p3);
  const far = w.seat(0, 0); put(far, tops[tops.length - 1]); far.x = (A.x1 - 1) * TS; w.seats.push(far);
  e.hp = SF.hpFloorOf(e); e.mode = 'hover'; e.modeT = 0.5; e.shots = [{ x: w.P.x + 60, y: w.P.y - 8, vx: -150, vy: 0, r: 5, dmg: 15, kind: 'fire', t: 4 }];   /* in the air as he fades: it goes with him */
  const dmg0 = w.log.damage, modes = new Set(); let worst = 0, inv = true, t = 0, lastMount = null, reformAt = null;
  for (let i = 0; i < 60 * 12 && e.sf !== 'p2'; i++) { const x0 = w.P.x, y0 = w.P.y; w.tick(); t += 1 / 60; modes.add(e.mode);
    if (R.fade && R.fade.st !== 'rise') { for (const p of w.seats) if (!(p.inv > 0)) inv = false; worst = Math.max(worst, Math.hypot(w.P.x - x0, w.P.y - y0)); }
    if (w.log.mounted.length === w.seats.length && lastMount === null) lastMount = t;
    if (e.mode === 'sfReform' && reformAt === null) reformAt = t; }
  assert.equal(e.sf, 'p2', 'he never came back for phase 2');
  assert.equal(w.log.damage - dmg0, 0, 'the fade hurt a seat: ' + (w.log.damage - dmg0));
  assert.ok(inv, 'a seat was without i-frames in the fade');
  assert.ok(!modes.has('wake'), 'a wake freeze in the fade');
  assert.equal(w.log.mounted.length, w.seats.length, 'not every seat was caught: ' + w.log.mounted.length + '/' + w.seats.length);
  assert.ok(w.seats.every(p => p.carpet), 'a seat is not on a carpet');
  assert.ok(Math.abs(reformAt - lastMount) < 0.05 && Math.abs(t - lastMount - SF.FADE.reform) < 0.1, 'he does not re-form ' + SF.FADE.reform + ' s after the last catch');
  for (let y = A.y0; y <= A.y1; y++) for (let x = A.x0; x <= A.x1; x++) assert.equal(w.L.grid[y * w.W + x], T.AIR, 'a tile is left in the box at ' + x + ',' + y);
  assert.ok(R.seaY >= (A.y1 + 1) * TS, 'the sea did not drain: ' + R.seaY + ' t ' + t.toFixed(2) + ' fade ' + JSON.stringify({ st: R.fade && R.fade.st, ph: R.phase }));
  assert.ok(w.L.arena.carpet && w.L.arena.x0 === F.p1.x0 && w.L.arena.x1 === F.p1.x1 && w.L.arena.y0 === F.p2.y0 && w.L.arena.floor === F.p2.floor, 'the arena is not the carpet box (same x)');
  const b = SF.carpetBoxOf(w.L.arena); for (const p of w.seats) assert.ok(p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1, 'a seat was caught outside the carpet box');
  assert.ok(worst <= 8, 'the hero moved ' + worst.toFixed(1) + ' px in a frame of the fall (> 8: the camera would jump)');
  assert.ok(e.realmAt.length === 2 && e.realmKinds.join() === 'fire,ice' && e.enrageAt === 0.3 && !e.noRealm && !e.onFoot, 'his phase 2 is not set up');
  out.push('fade: ' + w.seats.length + ' seats caught (one downed, one far: leashed), 0 damage, i-frames through, no wake; box cleared, sea drained; carpet box same x; worst hero move ' + worst.toFixed(1) + ' px/frame; re-forms ' + SF.FADE.reform + ' s after');

  // ---- PHASE 2: realms in place, no poison realm, enraged at 30% ----
  e.mode = 'hover'; e.modeT = 0; e.hp = Math.round(e.hp0 * 0.39);
  assert.equal(realmDue(e), 0, 'no realm due at 39%');
  w.P.x = w.L.arena.x0 + 40; for (let i = 0; i < 60 * 4 && !e.realm; i++) { w.tick(); if (e.mode === 'realmTell') assert.equal(e.trans.kind, 'fire', 'the first realm is not fire'); }
  assert.ok(e.realm && e.realm.kind === 'fire', 'the fire realm did not open');
  const rb = realmBox(e, w.L.arena), mid = (w.L.arena.x0 + w.L.arena.x1) / 2; assert.ok(Math.abs((rb.x0 + rb.x1) / 2 - mid) < 1, 'the realm is not centred on the carpet box');
  assert.ok(w.P.x >= rb.x0 && w.P.x <= rb.x1, 'the hero is outside the realm box (the in-place pull did not draw him in)'); assert.ok(!w.log.pulled, 'the realm pulled (a cut) instead of opening in place');
  const q = { ...e, realm: null, realmN: 1, hp: Math.round(e.hp0 * 0.19), realmRest: 0 }; assert.equal(realmDue(q), 1, 'no ice realm at 19%');
  q.realmN = 2; q.hp = 10; assert.equal(realmDue(q), -1, 'a third realm comes'); assert.ok(!e.realmKinds.includes('poison'), 'the poison realm is in');
  const en = { ...e, realm: null, enraged: false, hp: Math.round(e.hp0 * 0.31), mode: 'hover', modeT: 5 }; UM.updateUndeadMage(en, 1 / 60, { P: { ...w.P, carpet: null }, box: b, A: w.L.arena, say: () => {}, sound: () => {}, hit: () => {}, venom: () => {} });
  assert.ok(!en.enraged, 'enraged above 30%'); en.hp = Math.round(e.hp0 * 0.29); UM.updateUndeadMage(en, 1 / 60, { P: { ...w.P, carpet: null }, box: b, A: w.L.arena, say: () => {}, sound: () => {}, hit: () => {}, venom: () => {} });
  assert.ok(en.enraged, 'not enraged under 30%');
  out.push('phase 2: fire at 40% opened in place (centred, nobody pulled), ice at 20%, no poison realm, enraged at 30%');

  // ---- RESET: a death puts the box and the arena back ----
  SF.spireReset(w.L, (x, y) => { w.L.grid[y * w.W + x] = w.grid0[y * w.W + x]; });
  for (let y = A.y0; y <= A.y1; y++) for (let x = A.x0; x <= A.x1; x++) assert.equal(w.L.grid[y * w.W + x], w.grid0[y * w.W + x], 'the box is not put back at ' + x + ',' + y);
  assert.ok(!w.L.arena.carpet && w.L.arena.floor === F.p1.floor && w.L.arena.y0 === F.p1.y0 && !w.L.arena.inPlace, 'the arena is not phase 1 again');
  assert.ok(w.L.spireField.rt.phase === 'p1' && !w.L.spireField.rt.started && w.L.spireField.rt.seaY === A.sea * TS, 'the field\'s runtime is not fresh');
  out.push('reset: the box, the arena and the sea back to phase 1'); }

// ---- END TO END ON FOOT: his real casts, a hero chipping him (0.4) and hitting him x2 when he lies open; the tides come, the spires go, he fades, P2 starts ----
{ const w = world(), F = w.L.spireField, R = F.rt, e = w.boss, top = F.spires[2]; w.P.x = (top.x0 + 3) * TS; w.P.y = top.top * TS; w.P.ground = true;
  w.P.x = (A.x0 + 3) * TS; w.P.y = A.runFloor * TS; w.tick(); assert.equal(w.log.started, 1, 'the fight did not start');
  w.P.x = (top.x0 + 3) * TS; w.P.y = top.top * TS; w.P.hp = 1e9;
  let t = 0, cd = 0, opens = 0, wasOpen = false, nextOpen = 6; const modes = new Set();
  for (; t < 400 && e.sf !== 'p2'; t += 1 / 60) { w.tick(); modes.add(e.mode); cd -= 1 / 60; const op = UM.mageOpen(e); if (op && !wasOpen) opens++; wasOpen = op;
    if (cd <= 0 && e.mode !== 'sleep' && e.mode !== 'wake' && e.sf === 'p1') { cd = 0.35; const raw = 60, d = op ? raw * UM.MAGE.openMul : Math.round(raw * SF.RESIST.chip); e.hp -= SF.floorDmg(w.L, e, d); }
    if (t >= nextOpen && !op && e.mode === 'hover' && e.sf === 'p1' && !(e.wardHold > 0)) { nextOpen = t + 6; e.mode = 'reflected'; e.modeT = UM.MAGE.reflect.openT; } }   /* every 6 s or so a struck-back bolt */
  assert.equal(e.sf, 'p2', 'the fight on foot never reached phase 2 (' + t.toFixed(0) + ' s, ' + Math.round(100 * e.hp / e.hp0) + '%)');
  assert.ok(R.tides.every(q => q), 'not every tide came'); assert.ok(F.spires.filter(s => s.fallAt).every((s, i) => R.spires[F.spires.indexOf(s)].st === 'gone'), 'a spire meant to go over still stands');
  assert.ok(modes.has('down') && modes.has('sfFade') && opens >= 2, 'the fight never opened him on a top / never faded: ' + opens + ' ' + [...modes].join(','));
  out.push('end to end on foot: his real casts (' + [...modes].filter(m => /Tell$/.test(m)).length + ' tells seen), ' + opens + ' openings, 3 tides, 3 topples, the fade, P2 at ' + Math.round(100 * e.hp / e.hp0) + '% after ' + t.toFixed(0) + ' s'); }

// ---- FLAG OFF: master's tower has no field ----
{ globalThis.__FT5 = false; const Lm = build(); assert.ok(!Lm.spireField && !Lm.ft5 && Lm.arena && Lm.arena.chase, 'with FT5 off the tower is not master\'s'); globalThis.__FT5 = true; out.push('flag off: master\'s tower, no field'); }

console.log('ft5-arena ok\n  ' + out.join('\n  '));
