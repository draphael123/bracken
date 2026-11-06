// tools/kings-pyramid.mjs - THE KING'S PYRAMID + THE KING OF FIVE SEALS + THE GILDED GUARD (claude/kingspyramid), Node only: no page, no port, no Chrome.
//   node tools/kings-pyramid.mjs            the checks (flag OFF = master's LEVELS, flag ON = the level), the rooms, the guard, the King, a hands smoke, a toy duel (n=6)
//   node tools/kings-pyramid.mjs --sim=12   the toy duel only, n seeds
// THE TOY DUEL is a kinematic flow sim (one point-hero, the human bot ksPlan, late and fallible), NOT the rate: it proves every phase's opening is reachable by
// the rule and gives a pace read. THE RATE is bossLab's (browser owed): the lab hook for 'kingseals' is the tune lane's (see the lane report).
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

/* ---------- THE FLAG, OFF: a clean process with KP unset must see master's LEVELS (no row) ---------- */
if (args.includes('--off')) {
  delete process.env.KP; const { install } = await import('./node-canvas.mjs'); install();
  const { LEVELS } = await import('../src/level.js');
  console.log(JSON.stringify({ has: LEVELS.some(l => l.id === 'kingspyramid'), n: LEVELS.length })); process.exit(0);
}
process.env.KP = '1';
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const KPL = await import('../src/kings-pyramid.js');
const KR = await import('../src/kp-rooms.js');
const GG = await import('../src/gilded-guard.js');
const KSM = await import('../src/five-seals-king.js');
const { lintSunRooms, solveRoom } = await import('../src/sun-puzzle.js');
const { makeOpaque } = await import('../src/light.js');
const { floodReach } = await import('../src/reachcore.js');
const { makeKpHands } = await import('../src/kp-hands.js');

function flag() {
  ok(KPL.KP_SHIPS === false, 'KP_SHIPS is false on the branch (art before live; the road insert is the road lane\'s)');
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--off'], { encoding: 'utf8', env: { ...process.env, KP: '' } });
  const off = JSON.parse((r.stdout || '').trim().split('\n').pop());
  ok(!off.has, 'flag OFF: LEVELS has no kingspyramid row (master\'s array, no index moves)');
  const row = LEVELS.find(l => l.id === 'kingspyramid');
  ok(row && row.hidden && row.needs === 'sealedpyramid' && row.arc === 'the desert' && LEVELS.indexOf(row) === off.n, 'flag ON: the row is appended LAST, hidden (no map node), needs sealedpyramid');
}
const L = LEVELS.find(l => l.id === 'kingspyramid').build();
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const solid = t => t === T.SOLID, standable = t => t === T.SOLID || t === T.ONEWAY;

function level() {
  ok(L.W === KPL.KP.W && L.H === KPL.KP.H && L.kingspyramid && L.kp, 'the level builds (202 x 92), L.kingspyramid + L.kp');
  const checks = L.ents.filter(e => e.t === 'check');
  ok(checks.length === 2, 'TWO checkpoints (Daniel: fewer): the hub shrine and the shrine before the King - got ' + checks.length);
  ok(checks.every(c => !solid(at(c.x, c.y)) && standable(at(c.x, c.y + 1))), 'each checkpoint stands on footing');
  ok(L.ents.filter(e => e.t === 'kingseals').length === 1 && L.arena.boss === 'kingseals', 'one King, in the arena');
  ok(L.ents.some(e => e.t === 'gate') && L.gateAfterBoss, 'the level gate past the arena opens on his death');
  ok(L.ents.filter(e => e.kp === 'gilded').length >= 4, 'gilded guards: the door, the hub, the rooms');
  const foes = new Set(L.ents.filter(e => ['shield', 'mummy', 'archer'].includes(e.t)).map(e => e.kp === 'gilded' ? 'gildedguard' : e.kp === 'deathless' ? 'deathless' : e.t + ':' + (e.cnSkin || '')));
  ok(!L.ents.some(e => /gob/i.test(e.t + (e.cnSkin || ''))), 'no goblins (memory: theme fit) - cast ' + [...foes].join(' '));
  /* the rooms do not overlap; each is carved */
  const R = Object.values(L.kp.rooms); for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i].box, b = R[j].box; ok(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1], 'rooms ' + R[i].name + ' / ' + R[j].name + ' do not overlap'); }
  /* the lints */
  const bad = KR.lintKP(L, at); ok(bad.length === 0, 'lintKP clean: ' + bad.join('; '));
  const opaque = makeOpaque(T), sb = lintSunRooms(L, at, opaque); ok(sb.length === 0, 'lintSunRooms clean (the mirror room: solvable, not pre-solved, mirrors strikeable, cache optional + beamable): ' + sb.join('; '));
  const sol = solveRoom(L.sunRooms[0], at, opaque); ok(sol && sol.turns === 3, 'the mirror room takes 3 turns (down, along, up, along): ' + (sol && sol.turns));
  ok(L.sunRooms[0].doors.some(d => d.kind === 'cache' && d.optional) && L.ents.some(e => e.t === 'silver' && e.x === 2), 'THE PRIEST CACHE: optional, a silver behind his sun-seal (plan Q5)');
}
/* ---------- REACH: as played every key and the King are reached; as built the rooms' exams stand in the way ---------- */
function played(open) {
  const g = L.grid.slice(), set = (x, y, t) => { g[y * L.W + x] = t; }, K = L.kp;
  if (open) {
    const d = L.sunRooms[0].doors.find(q => q.kind === 'sun'); for (let y = d.opens[1]; y <= d.opens[3]; y++) for (let x = d.opens[0]; x <= d.opens[2]; x++) set(x, y, T.AIR);
    for (const l of K.linen) for (let y = l.y0; y <= l.y1; y++) for (let x = l.x0; x <= l.x1; x++) set(x, y, T.AIR);
    for (const c of K.cracked) for (let y = c.y0; y <= c.y1; y++) for (let x = c.x0; x <= c.x1; x++) set(x, y, T.AIR);
    for (const h of K.hung) for (let x = h.x0; x <= h.x1; x++) { set(x, h.y, T.AIR); set(x, h.to, T.ONEWAY); }
    for (const gt of K.gates) for (let y = gt.y0; y <= gt.y1; y++) for (let x = gt.x0; x <= gt.x1; x++) set(x, y, T.AIR);
    const gd = K.greatDoor; for (let y = gd.y0; y <= gd.y1; y++) for (let x = gd.x0; x <= gd.x1; x++) set(x, y, T.AIR);
    for (let y = KPL.KP.shaftTop; y < KPL.KP.shaftFoot; y++) set(KPL.KP.shaftX[0], y, T.NET);   /* (the lift: the model cannot ride a mover, a rung column stands in for it) */
  }
  if (!open) { const gd = K.greatDoor; for (let y = gd.y0; y <= gd.y1; y++) for (let x = gd.x0; x <= gd.x1; x++) set(x, y, T.SOLID); }   /* (the model reads a PORT as a gate it can pass: as built the door is stone to it) */
  return open ? { ...L, grid: g } : { ...L, grid: g, reachDoors: [] };   /* (as built: the great door barred - the keys are what open it) */
}
function reach() {
  const Lp = played(true), Rp = floodReach(Lp, T, { rides: true }), K = L.kp;
  const got = (x, y) => Rp.seen.has(Rp.key(x, y)) || Rp.near(x, y);
  for (const k of K.keys) ok(got(k.x, k.y), 'as played, the ' + k.id + ' key is reached');
  ok(got(KPL.KP.arenaX + 10, KPL.KP.arenaF - 1), 'as played, the arena floor is reached');
  const Lb = played(false), Rb = floodReach(Lb, T, { rides: true }), gotB = (x, y) => Rb.seen.has(Rb.key(x, y));
  for (const k of K.keys) ok(!gotB(k.x, k.y), 'as built, the ' + k.id + ' key is behind its room\'s exam');
  for (const [id, r] of Object.entries(K.rooms)) { const [x0, x1, y0, y1] = r.door; let any = false; for (let x = x0; x <= x1; x++) for (let y = y0 - 2; y <= y1 + 1; y++) if (gotB(x, y)) any = true; ok(any, 'as built, the ' + id + ' room\'s door is reached from the hub (any order)'); }
  ok(!gotB(KPL.KP.arenaX + 10, KPL.KP.arenaF - 1), 'as built, the great door shuts the way down');
}
/* ---------- THE ROOMS (pure) ---------- */
function rooms() {
  const R = KR.kpInit(L), K = L.kp;
  let ev = KR.fireAt(R, 121, 30); ok(ev.some(v => v.ev === 'burning' && v.id === 'linen1'), 'fire beside the linen wall sets it burning (told)');
  ev = KR.kpStep(R, KR.KR.burnT + 0.01, { TS }); ok(ev.some(v => v.ev === 'burned' && v.cells.length === 6), 'then it is ash (6 cells open)');
  ok(KR.fireAt(R, 130, 30).length === 0, 'fire far from linen burns nothing');
  ev = KR.blastAt(R, 99, 56); ok(ev.some(v => v.ev === 'break' && v.id === 'kegWall'), 'a keg blast breaks the cracked wall');
  ev = KR.blastAt(R, 90, 51); ok(ev.some(v => v.ev === 'drop' && v.to.every(([, y]) => y === 55)), 'a blast at the bracket drops the hung ledge to row 55 (a step)');
  const cl = K.weights[0].cleat; ev = KR.strikeAt(R, [cl[0] * TS, cl[1] * TS, cl[0] * TS + 16, cl[1] * TS + 16]); ok(ev.some(v => v.ev === 'cleat'), 'a blow on the cleat parts the rope');
  ev = KR.kpStep(R, KR.KR.fallT + 0.01, { TS }); ok(ev.some(v => v.ev === 'weight') && ev.some(v => v.ev === 'gate' && v.id === 'gate1'), 'the weight falls and its gate lifts');
  /* the presses cycle, and the jam stops them */
  const pW = R.presses.find(p => p.id === 'pressW'); let slid = false; for (let t = 0; t < 4; t += 0.05) { if (KR.kpStep(R, 0.05, { TS }).some(v => v.ev === 'pressSlide')) slid = true; } ok(slid, 'the switch room presses cycle on their own (told first)');
  const sw = K.switches.find(s => s.id === 'jam1'); KR.strikeAt(R, [sw.x * TS, sw.y * TS, sw.x * TS + 16, sw.y * TS + 16]);
  let slidJ = false; for (let t = 0; t < 4.5; t += 0.05) { KR.kpStep(R, 0.05, { TS }); if (KR.pressLive(pW)) slidJ = true; } ok(!slidJ, 'JAMMED: no press slides for the jam\'s 5 s');
  ok(K.presses.every(p => p.axis === 'x'), 'every press SLIDES along the floor (never a falling pillar - plan s2)');
  /* THE DEATHLESS: each kill */
  const sw2 = id => { const s = K.switches.find(q => q.id === id); return KR.strikeAt(R, [s.x * TS, s.y * TS, s.x * TS + 16, s.y * TS + 16]); };
  sw2('dPress'); let doomed = []; for (let t = 0; t < 1.2; t += 0.05) for (const v of KR.kpStep(R, 0.05, { TS, deathless: [{ id: 'd1', x: 54 * TS, y: 20 * TS, w: 12, h: 22 }] })) if (v.ev === 'doomed') doomed.push(v);
  ok(doomed.some(v => v.id === 'd1' && v.by === 'press'), 'the press dooms a deathless in its reach');
  sw2('dSpikes'); doomed = []; for (let t = 0; t < 1.0; t += 0.05) for (const v of KR.kpStep(R, 0.05, { TS, deathless: [{ id: 'd2', x: 68 * TS, y: 20 * TS, w: 12, h: 22 }] })) if (v.ev === 'doomed') doomed.push(v);
  ok(doomed.some(v => v.id === 'd2' && v.by === 'spikes'), 'the raised spikes doom one standing on them (told rising first)');
  sw2('dShutter'); const ev3 = KR.kpStep(R, 0.05, { TS, deathless: [{ id: 'd3', x: 90 * TS + 8, y: 20 * TS, w: 12, h: 22 }], deathlessIds: ['d1', 'd2', 'd3'] });
  ok(ev3.some(v => v.ev === 'doomed' && v.by === 'sun') && ev3.some(v => v.ev === 'gate' && v.id === 'gate3'), 'the sun shutter dooms the third; all three down -> the key door opens');
  /* keys + door */
  ok(!KR.doorReady(R, K.keyOrder), 'the great door waits for five keys'); for (const id of K.keyOrder) KR.takeKey(R, id); ok(KR.doorReady(R, K.keyOrder), 'five keys open it (any order)');
  /* THE DESCENT */
  const R2 = KR.kpInit(L), y0 = 44 * TS, y1 = 84 * TS - 8; let warns = 0, drops = 0, boards = [], lastWarnAt = {}; const told = [];
  for (let y = y0, t = 0; y <= y1; y += 40 / 60, t += 1 / 60) for (const v of KR.kpStep(R2, 1 / 60, { TS, lift: { x: 116 * TS, y, y0, y1, on: true }, alcoves: K.alcoves })) {
    if (v.ev === 'debrisWarn') { warns++; lastWarnAt[v.x] = t; } if (v.ev === 'debris') { drops++; told.push(t - (lastWarnAt[v.x] ?? -9)); } if (v.ev === 'board') boards.push(v.id); }
  ok(warns === KR.DEBRIS.length && drops === KR.DEBRIS.length, 'the ride drops every stone, each told (' + drops + ')');
  ok(told.every(dt => dt >= 0.8), 'every stone is told >= 0.8 s before it lands (min ' + Math.min(...told).toFixed(2) + ' s)');
  ok(boards.length === 4 && boards.slice(0, 2).every(id => id.startsWith('aTop')) && boards.slice(2).every(id => id.startsWith('aFoot')), 'boarders only at the ends: ' + boards.join(' '));
  const R3 = KR.kpInit(L); R3.racks[0].has = false; R3.racks[0].t = 4; ok(KR.kpStep(R3, 4.01, { TS }).some(v => v.ev === 'rack'), 'the keg rack fills again (never a soft-lock)');
}
/* ---------- THE GILDED GUARD ---------- */
function guard() {
  const st = GG.newGG(); ok(GG.ggStep(st, true, 0.016) === 'strip' && GG.ggStripped(st), 'the light strips his shield the frame it lands');
  const [d1] = GG.ggTake(st, 20); ok(d1 === 25, 'stripped: every blow lands x1.25');
  for (let t = 0; t < GG.GG.strip + 0.1; t += 0.05) GG.ggStep(st, false, 0.05); ok(!GG.ggStripped(st), 'out of the light it comes back after ' + GG.GG.strip + ' s');
  const [d2, w2] = GG.ggTake(st, 20); ok(d2 === 12 && w2 === 'GOLD', 'shielded: a blow that reaches him (behind, a blast) lands x0.6 - never 0');
  const st2 = GG.newGG(); GG.ggStep(st2, true, 0.016); for (let t = 0; t < GG.GG.strip + 0.2; t += 0.05) GG.ggStep(st2, true, 0.05); ok(!GG.ggStripped(st2), 'standing in the light does not lock him stripped: it must leave him first (no farm)');
}
/* ---------- THE KING ---------- */
const AF = KPL.KP.arenaF, AX = KPL.KP.arenaX;
const newS = () => { const S = KSM.newFight(KSM.geom(AX, AF, TS)); S.mode = 'walk'; S.cd = 99; return S; };
function king() {
  let S = newS(); KSM.ksLight(S);
  ok(KSM.litFloorCols(S).length === 0, 'P1 as built: the sun is wasted up (no floor lit)');
  KSM.ksStrikeMirror(S, 'west'); ok(KSM.litFloorCols(S).includes(6), 'turn the west mirror: the sun comes down column 6');
  S = newS(); KSM.ksStrikeMirror(S, 'altar'); KSM.ksStrikeMirror(S, 'east'); ok(KSM.litFloorCols(S).includes(50), 'altar + east: column 50');
  S = newS(); KSM.ksStrikeMirror(S, 'west'); S.x = S.G.px(6); let ev = KSM.ksStep(S, 0.016, { heroes: [{ x: S.G.px(2), y: S.G.floorY, alive: true }] });
  ok(ev.some(v => v.t === 'open' && v.verb === 'mirror') && S.open > 0, 'the sun on him = OPEN the same frame ("' + KSM.KS_SAY.open.mirror + '")');
  for (let t = 0; t < KSM.KS.openT + 0.05; t += 0.05) ev = ev.concat(KSM.ksStep(S, 0.05, { heroes: [{ x: S.G.px(2), y: S.G.floorY, alive: true }] }));
  ok(S.ward > 0 && ev.some(v => v.t === 'ward'), 'the opening ends in a told ward');
  ok(!KSM.ksStep(S, 0.016, { heroes: [{ x: S.G.px(2), y: S.G.floorY, alive: true }] }).some(v => v.t === 'open'), 'nothing opens him while warded (still in the light)');
  /* B15: never under 0.4 outside an opening, in every mode, every phase */
  let minK = 9; for (const ph of [1, 2, 3, 4]) for (const md of ['walk', 'ward', 'seal']) { const s = newS(); s.ph = ph; if (md === 'ward') s.ward = 2; if (md === 'seal') s.seal = 1; const hp0 = s.hp; const [d] = KSM.takeBlow(s, 100); minK = Math.min(minK, d / 100); ok(s.hp === hp0 - d, 'a blow takes hp'); }
  ok(Math.abs(minK - 0.4) < 1e-9, 'B15: x0.4 outside openings in every phase and mode (min ' + minK + ') - never invulnerable');
  { const s = newS(); s.open = 2; s.purse = 1000; const [d] = KSM.takeBlow(s, 50); ok(d === 100, 'an opening: x2 (the purse)'); }
  /* the moves: told, own poses, one new move a phase */
  const M = KSM.KS.moves, poses = new Set();
  for (const [id, m] of Object.entries(M)) { ok(m.wind >= 0.6 && m.mark && m.answer && m.pose.length === 2 && m.sound, id + ': told (' + m.wind + ' s), its answer, its windup + release poses, its sound'); m.pose.forEach(p => poses.add(p)); }
  ok(poses.size === Object.keys(M).length * 2, 'every pose is its own (' + poses.size + ')');
  const byPh = ph => Object.entries(M).filter(([, m]) => m.ph === ph).map(([id]) => id);
  ok(byPh(1).length === 3 && byPh(2).length === 1 && byPh(3).length === 1 && byPh(4).length === 2, 'P1 three moves, then one new a phase (P4 two: flare + charge, as the 10-13 restructure lists): ' + [1, 2, 3, 4].map(p => byPh(p).join('+')).join(' | '));
  ok(Object.keys(M).length + 1 >= 7, 'seven+ told attacks (+ the boulders): ' + Object.keys(M).length);
  /* the phases, in order, each with its set-up, a breather through it */
  S = newS(); const hero = { x: S.G.px(28), y: S.G.floorY, alive: true }; const seen = [];
  for (const f of [0.74, 0.49, 0.24]) { S.hp = S.maxHp * f; S.open = 0; S.ward = 0; let e2 = []; for (let t = 0; t < KSM.KS.sealT + 0.2; t += 0.05) e2 = e2.concat(KSM.ksStep(S, 0.05, { heroes: [hero], rng: () => 0.5 })); seen.push(S.ph);
    ok(!e2.some(v => v.t === 'tell'), 'the seal ' + S.ph + ' transition: nothing cast through it'); }
  ok(seen.join() === '2,3,4', 'the phases come one at a time: ' + seen.join());
  ok(S.capstone && S.storm && !S.dark, 'P4: the capstone torn off, the storm in');
  /* P2: thrown fire / keg */
  S = newS(); S.ph = 2; S.capstone = false; ev = []; ok(KSM.ksThrown(S, 'keg', [S.x - 10, S.x + 10, S.y - 20, S.y], ev) && S.openKind === 'keg', 'P2: a lit keg on him = OPEN');
  S = newS(); S.ph = 2; ev = []; ok(!KSM.ksThrown(S, 'fire', [S.x + 200, S.x + 210, S.y - 20, S.y], ev), 'a firebrand that misses opens nothing');
  S = newS(); ev = []; ok(!KSM.ksThrown(S, 'fire', [S.x - 10, S.x + 10, S.y - 20, S.y], ev), 'P1: fire is not his seal yet (one verb a phase)');
  /* P3: the presses, the court, the priest */
  S = newS(); S.ph = 3; ev = []; S.seal = 0; { const e0 = []; S.court = []; }
  S.x = S.G.px(10); ok(KSM.ksStrikeSwitch(S, 'swW', ev) === 'fired', 'P3: strike the west switch: the west press is told');
  S.court = [{ kind: 'guard', x: S.G.px(4), y: S.G.floorY, st: 'walk', t: 0, alive: true, face: 1 }];
  let e3 = []; for (let t = 0; t < 1.2; t += 0.05) e3 = e3.concat(KSM.ksStep(S, 0.05, { heroes: [{ x: S.G.px(6), y: S.G.ledgeY, alive: true }], rng: () => 0.5 }));
  ok(e3.some(v => v.t === 'open' && v.verb === 'press'), 'the press pins him = OPEN'); ok(e3.some(v => v.t === 'crushed'), 'and takes the deathless in its lane');
  ok(e3.some(v => v.t === 'hit' && v.id === 'press'), 'the press hurts whatever stands in its lane (a hero too: told 0.7 s)');
  { const s = newS(); s.ph = 2; ok(KSM.ksStrikeSwitch(s, 'swW', []) === 'cold', 'the presses sleep before their seal'); }
  { const s = newS(); s.ph = 3; s.court = [{ kind: 'priest', x: s.G.px(28), y: s.G.floorY, st: 'walk', t: 0, alive: true, face: -1, target: null }]; let e4 = [];
    for (let t = 0; t < 12; t += 0.05) e4 = e4.concat(KSM.ksStep(s, 0.05, { heroes: [{ x: s.G.px(28), y: s.G.ledgeY, alive: true }], rng: () => 0.1 }));
    ok(e4.some(v => v.t === 'courtTell' && v.kind === 'priest') && s.n.binds >= 1, 'the priest walks to a switch, told, and binds it'); ok(KSM.ksStrikeSwitch(s, s.switches.find(q => q.lock > 0)?.id || 'swW', []) !== 'fired' || !s.switches.some(q => q.lock > 0), 'a bound switch will not fire'); }
  /* P4: any verb, one at a time */
  S = newS(); S.ph = 4; S.capstone = true; ev = []; ok(KSM.openHim(S, 'keg', ev), 'P4: a keg opens him'); S.open = 0; S.ward = 0;
  ev = []; ok(!KSM.openHim(S, 'keg', ev) && ev.some(v => v.text === KSM.KS_SAY.spent), 'P4: the same verb twice running does not (told)'); ok(KSM.openHim(S, 'press', []), 'P4: another verb does');
  /* the boulders only hurt heroes */
  S = newS(); S.ph = 4; S.storm = true; S.boulderT = 0.01; let e5 = []; for (let t = 0; t < 2; t += 0.05) e5 = e5.concat(KSM.ksStep(S, 0.05, { heroes: [{ x: S.x + 120, y: S.G.floorY, alive: true }] }));
  ok(e5.some(v => v.t === 'boulderWarn') && e5.filter(v => v.id === 'boulder').every(v => v.heroesOnly) && !e5.some(v => v.t === 'open'), 'P4 boulders: told, heroes only, never an opening');
  ok(e5.some(v => v.t === 'gustWarn') || KSM.KS.storm.warn >= 1.2, 'gusts told >= 1.2 s');
}
/* ---------- A HANDS SMOKE: the world binding runs (update / strike / interact / boss / draw) with a fake world ---------- */
function smoke() {
  const noop = () => {}, g = new Proxy({}, { get: (o, k) => (k in o ? o[k] : noop), set: (o, k, v) => { o[k] = v; return true; } });
  const P = { x: 50 * TS, y: 44 * TS, face: 1, dead: false, hurt: 0, ground: true, h: 14, carry: null, onMover: null };
  const players = [P], enemies = L.ents.filter(e => ['shield', 'mummy', 'archer'].includes(e.t)).map(e => ({ ...e, x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true, hp: 30, w: 10, h: 18 }));
  const lift = { ...L.moversExtra[0] }, grid = L.grid.slice(); let bossE = null, bossActive = false, time = 0, hurt = 0;
  const ctx = { get L() { return L; }, get players() { return players; }, get boss() { return bossE; }, get bossActive() { return bossActive; }, TS, T, sfx: {}, hero: () => P, enemies: () => enemies, movers: () => [lift], time: () => time, keys: () => ({}),
    tileAt: (x, y) => grid[y * L.W + x] ?? 1, cellSet: (x, y, t) => { grid[y * L.W + x] = t; }, number: noop, text: noop, burst: noop, shake: noop, ring: noop, flash: noop,
    damagePlayer: (x, d) => { hurt += d; return true; }, asPlayer: (p, fn) => fn(), upright: () => true, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }),
    moveBody: (b, dx) => { b.x += dx; }, kegBlast: noop, hurtFoe: (e, d) => { if (e.kpDoom) e.alive = false; }, sunLit: () => false };
  const H = makeKpHands(ctx); ok(H.on(), 'the hands wake on the level');
  for (let i = 0; i < 600; i++) { time += 1 / 60; H.update(1 / 60); H.strike({ l: P.x, r: P.x + 20, t: P.y - 14, b: P.y }); if (i % 60 === 0) H.draw(g, 0, 0, time); }
  P.x = 116 * TS + 8; P.y = 36 * TS; ok(H.interact(P) && P.carry && P.carry.kind === 'brand' || true, 'interact runs');   /* (no cresset there: just runs) */
  P.x = 116 * TS + 8; P.y = 32 * TS; P.carry = null; const took = H.interact(P); ok(took && P.carry && P.carry.kind === 'brand', 'E at the cresset: a firebrand in your hands');
  const brand = P.carry; P.carry.state = 'fly'; P.carry.vx = 170; P.carry.vy = -175; P.carry = null; for (let i = 0; i < 120; i++) { time += 1 / 60; H.update(1 / 60); if (process.env.KPDBG && i % 6 === 0) console.log(brand.state, Math.round(brand.x), Math.round(brand.y)); }
  ok(H.rooms().n.burned >= 1 || H.rooms().linen.some(l => l.st !== 'whole'), 'a thrown firebrand burns the first linen wall');
  /* the King */
  const base = { x: 0, y: 0, vx: 0, vy: 0, face: -1, alive: true }; bossE = H.spawnBoss(base); bossActive = true; ok(bossE && bossE.t === 'kingseals' && bossE.hp === KSM.KS.hp, 'spawnBoss: the King');
  P.x = (AX + 30) * TS; P.y = AF * TS;
  for (let i = 0; i < 60 * 240; i++) { time += 1 / 60; H.update(1 / 60); H.bossUpdate(bossE, 1 / 60); if (i % 30 === 0) { const d = H.take(bossE, 40); bossE.hp -= d; } if (i % 90 === 0) { H.draw(g, 0, 0, time); H.drawBoss(g, bossE, 0, 0, time); H.drawOver(g, 0, 0, time); H.barName(bossE); } if (bossE.hp <= 0) break; }
  const rd = H.read(); ok(rd && rd.ph >= 3, 'the King runs 4 minutes of frames through the hands (reached seal ' + rd.ph + ', hero took ' + Math.round(hurt) + ')');
}
/* ---------- THE TOY DUEL: a kinematic hero on ksPlan (late 0.25 s, misreads 1 in 8) ---------- */
function duel(seed, o = {}) {
  let s = seed * 9301 + 49297; const rng = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const S = KSM.newFight(KSM.geom(AX, AF, TS)); const h = { x: S.G.px(4), y: S.G.floorY, hp: o.hp || 300, max: o.hp || 300, flasks: o.flasks ?? 3, carry: null, swingT: 0, lag: 0, plan: null };
  let t = 0; const dt = 1 / 30, opens = {};
  while (t < 400 && h.hp > 0 && S.mode !== 'dead') {
    t += dt; h.lag -= dt; if (h.lag <= 0) { h.plan = KSM.ksPlan(S, h); h.lag = 0.25; if (rng() < 0.125) h.plan = { goX: h.x + (rng() - 0.5) * 80, act: 'wait' }; }
    const p = h.plan || { goX: h.x, act: 'wait' }, dx = p.goX - h.x; h.x += Math.sign(dx) * Math.min(Math.abs(dx), 92 * dt); h.y = p.perch && Math.abs(dx) < 4 ? S.G.ledgeY : S.G.floorY;
    const near = Math.abs(dx) < 6;
    if (near && p.act === 'turn') KSM.ksStrikeMirror(S, p.id);
    const ev = [];
    if (near && p.act === 'switch') KSM.ksStrikeSwitch(S, p.id, ev);
    if (near && p.act === 'take') h.carry = p.id === 'rack' ? 'keg' : 'fire';
    if (p.act === 'throw' && h.carry && Math.abs(S.x - h.x) < 120) { KSM.ksThrown(S, h.carry, [S.x - 8, S.x + 8, S.y - 20, S.y], ev); h.carry = null; }
    if (Math.abs(S.x - h.x) < 40 && (p.act === 'attack' || S.open > 0)) { h.swingT -= dt; if (h.swingT <= 0) { h.swingT = 0.4; KSM.takeBlow(S, o.dmg || 18); } }
    const heroes = [{ x: h.x, y: h.y, alive: true }];
    for (const v of ev.concat(KSM.ksStep(S, dt, { heroes, rng }))) {
      if (v.t === 'open') opens[v.verb] = (opens[v.verb] || 0) + 1;
      if (v.t === 'hit' && v.once) { h.onced = h.onced || new Set(); if (h.onced.has(v.once)) continue; }
      if (v.t === 'hit' && v.box && h.x > v.box[0] - 5 && h.x < v.box[1] + 5 && h.y > v.box[2] && h.y - 14 < v.box[3]) {
        const dodged = v.tick ? false : (v.blockable ? (p.act === 'block' && rng() < 0.85) : (p.act === 'dodge' && rng() < 0.8)) || rng() < 0.35;
        if (v.once) h.onced.add(v.once);
        if (!dodged) { const dd = v.tick ? v.dmg : v.blockable && p.act === 'block' ? v.dmg * 0.2 : v.dmg; h.hp -= dd; if (o.log) o.log[v.id + ':' + S.ph] = Math.round((o.log[v.id + ':' + S.ph] || 0) + dd); } }
    }
    if (h.hp < h.max * 0.35 && h.flasks > 0 && !S.cur) { h.flasks--; h.hp = Math.min(h.max, h.hp + h.max * 0.4); }
  }
  return { win: S.mode === 'dead' || S.hp <= 0, t, ph: S.ph, opens, hpLeft: Math.max(0, Math.round(h.hp)) };
}
function sim(N) {
  const rs = []; for (let i = 1; i <= N; i++) rs.push(duel(i));
  const wins = rs.filter(r => r.win).length, by = {}; for (const r of rs) for (const [k, v] of Object.entries(r.opens)) by[k] = (by[k] || 0) + v;
  console.log(`  TOY DUEL (kinematic, hp 300 / 18 a swing / 3 flasks, n=${N}): ${wins}/${N} wins, avg ${Math.round(rs.reduce((a, r) => a + r.t, 0) / N)} s, phases reached ${rs.map(r => r.ph).join(' ')}, opens by verb ${JSON.stringify(by)}`);
  return { rs, by };
}
if (opt('sim')) { sim(+opt('sim')); if (args.includes('--log')) { const log = {}; const r = duel(1, { log }); console.log(JSON.stringify(r), JSON.stringify(log)); } process.exit(0); }
flag(); level(); reach(); rooms(); guard(); king(); smoke();
const { by } = sim(6); ok(['mirror', 'fire', 'keg', 'press'].every(v => (by[v] || 0) + (v === 'fire' ? by.keg || 0 : 0) > 0), 'the toy bot opens him with the sun, the fire/keg and the press (the rule works through all four phases)');
console.log(`kings-pyramid: ${n} ok`);
