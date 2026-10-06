// tools/glasssea.mjs - THE GLASS SEA's own check (claude/glasssea). Node only: no page, no port, no Chrome. The built level and the pure modules:
//   - the rule line is the code's (LEVELS row == src/glass-sea.js header); the arcs teach -> test -> remix -> exam; ONE required use before the boss
//   - every REQUIRED beam is solvable with the mirrors' notches (src/light.js trace) and NOT solved as the level is laid (a TURN is needed)
//   - THE DAY: the longest walk in the sun from the start to the sunset is within SUN.maxWalk; THE NIGHT: no walk between fires over NIGHT.maxWalk, and
//     every swarm crack on the road is held by a fire or has a ring a fire beam can reach
//   - the cast: one new foe (the skitter), no type over ~35%, a ranged reskin, role mix; the reskins use cnSkin
//   - THE GLASS COLOSSUS (src/glass-colossus.js): a lance into a FACING mirror cracks its chest; one that misses opens nothing; the ward follows every opening;
//     its legs take blows from a purse and then glaze; a fire relay in phase two holds the swarm and opens its shoulders; a mirror to the sky at dawn opens
//     its crown; the shake throws a climber who does not grip; the opening stands still (B4); the bot's plan answers the lance from behind a mirror
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { trace, makeOpaque } from '../src/light.js';
import { isSlope } from '../src/slopes.js';
import { SUN } from '../src/sunstroke.js';
import { SECTIONS, ARCS, SUNSET_X } from '../src/glass-sea.js';
import * as CG from '../src/glass-colossus.js';
import { GS } from '../src/glass-sea-hands.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'glasssea'); ok(lv, 'glasssea is in LEVELS'); ok(lv.needs === 'redgorge', 'THE GLASS SEA needs THE RED GORGE (it is ' + lv.needs + ')');
const wt = LEVELS.find(l => l.id === 'welltown'); ok(wt && wt.needs === 'caravan', "THE WELL TOWN needs 'caravan' (the desert concept's fix)");
const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
/* THE RULE LINE is the code's */
const src = readFileSync(new URL('../src/glass-sea.js', import.meta.url), 'utf8');
ok(src.includes('// THE RULE: ' + lv.rule), 'the rule line in LEVELS is the one src/glass-sea.js states: ' + lv.rule);
ok(/MIRROR/.test(lv.rule) && /FIRE BY NIGHT/.test(lv.rule) && /SHADE BY DAY/.test(lv.rule), 'the rule line names the verb (the mirrors) and the backdrop (shade by day, fire by night)');
/* THE ARCS */
ok(Object.keys(ARCS.mirror).length >= 5 && ARCS.mirror.teach && ARCS.mirror.test && ARCS.mirror.remix && ARCS.mirror.remix2 && ARCS.mirror.exam, 'the mirror is taught, tested, remixed twice and examined');
ok(SECTIONS.length === 8 && SECTIONS.every((s, i) => i === 0 || s[1] > SECTIONS[i - 1][1]), 'seven sections and the arena, in order');
/* THE BEAMS: solvable with the notches, and not solved as laid */
const opaque = makeOpaque(T, isSlope);
function beam(want) {   /* want: { mirrorId: state } -> the receivers each source hits (as the hands trace it: 'sky' is opaque) */
  const ms = L.mirrors.map(m => ({ ...m, state: want[m.id] ?? m.notches[0] }));
  const tileAt = (x, y) => { const m = ms.find(q => q.x === x && q.y === y); return m && m.state === 'sky' ? T.SOLID : at(x, y); };
  const R = [...L.beds.map(b => ({ x: b.tx, y: b.ty, id: 'bed.' + b.id })), ...L.cracks.filter(c => c.ring).map(c => ({ x: c.ring[0], y: c.ring[1], id: 'ring.' + c.id }))];
  const hit = {}; for (const s of L.sources) { const r = trace(tileAt, [s], ms.filter(m => m.state !== 'sky'), R, { opaque, W: L.W, H: L.H }); for (const i of r.hit) hit[R[i].id] = s.kind; } return hit; }
const laid = beam({});
const NEED = [['bed.firstStair', { first: '\\' }, 'sun'], ['bed.bridge', { bridge: '\\' }, 'sun'], ['bed.headBridge', { chainA: '/', chainB: '/' }, 'sunset'], ['ring.darkCut', { relay: '/' }, 'fire'],
  ['bed.stepsBridge', { gaze: '/' }, 'gaze'], ['ring.steps', { stepsRelay: '/' }, 'fire'], ['bed.spireStair', { spire: '\\' }, 'sun'], ['bed.vaultStair', { gaze: '\\' }, 'gaze']];
for (const [id, want, kind] of NEED) { const h = beam(want); ok(h[id] === kind, id + ' is lit by its ' + kind + ' beam with ' + JSON.stringify(want) + ' (got ' + JSON.stringify(h[id]) + ')'); ok(!laid[id], id + ' is NOT lit as the level is laid (a TURN is needed)'); }
ok(!beam({ chainA: '/' })['bed.headBridge'] && !beam({ chainB: '/' })['bed.headBridge'], 'THE CHAIN wants both mirrors: either alone does not reach the Head');
ok(L.mirrors.find(m => m.id === 'gaze').shardNotch === 2, 'the vault notch of the gaze mirror wants the five shards');
/* the required crossings: each bed bridges a crack (no way over it but the glass) */
const crack = id => L.cracks.find(c => c.id === id);
for (const [b, c] of [['bridge', 'crossing'], ['headBridge', 'headGap'], ['stepsBridge', 'steps']]) { const B = L.beds.find(q => q.id === b), C = crack(c); ok(B.tiles.length === C.x1 - C.x0 + 1 && B.tiles.every(([x, y]) => x >= C.x0 && x <= C.x1 && y === C.y), b + ' spans ' + c + ' (' + (C.x1 - C.x0 + 1) + ' tiles, the only way over it)'); ok(C.x1 - C.x0 + 1 >= 5, c + ' is too wide to jump (' + (C.x1 - C.x0 + 1) + ' tiles)'); }
/* THE DAY AND THE NIGHT */
let prevS = L.START.y - 3; const surf = x => { for (let y = Math.max(0, prevS - 4); y < L.H; y++) { const t = at(x, y); if (t === T.SOLID || isSlope(t)) { if (y > prevS + 4) return prevS; prevS = y; return y; } } return prevS; };   /* (the LOW road: the sand and the rock from a little over the last one down - an overhang is not the road, a terrace is the high road, and over a crack the road is the bridge) */
const inShade = (x, y) => L.shade.some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y - 1 >= y0 && y - 1 <= y1) || [1, 2, 3, 4, 5].some(d => at(Math.floor(x / TS), Math.floor((y - 14) / TS) - d) === T.SOLID);
let run = 0, worst = 0, wAt = 0; for (let x = 4 * TS; x < SUNSET_X * TS; x += 4) { const y = surf(Math.floor(x / TS)) * TS; if (inShade(x, y)) run = 0; else { run += 4; if (run > worst) { worst = run; wAt = x; } } }
ok(worst / SUN.RUN <= SUN.maxWalk + 0.5, 'THE DAY: the longest walk in the sun to the sunset is ' + (worst / SUN.RUN).toFixed(1) + ' s at column ' + Math.round(wAt / TS) + ' (the rule ' + SUN.maxWalk + ' s; a vulture\'s shadow is extra)');
const fx = L.fires.filter(f => !f.arena && f.x >= SUNSET_X).map(f => f.x).sort((a, b) => a - b), stops = [SUNSET_X, ...fx, L.arena.x0 / TS];
const gaps = stops.slice(1).map((x, i) => (x - stops[i] - 2 * GS.fireR) * TS / SUN.RUN);
ok(Math.max(...gaps) <= 8.5, 'THE NIGHT: ' + fx.length + ' campfires; the longest walk between firelight is ' + Math.max(...gaps).toFixed(1) + ' s (rule ~8 s; the frost meter fills in 8)');
for (const c of L.cracks.filter(c => c.swarm)) { const held = L.fires.some(f => !f.arena && f.x >= c.x0 - GS.holdR && f.x <= c.x1 + GS.holdR); ok(held || c.ring, 'the swarm crack ' + c.id + ' is held by a fire near it, or a fire beam can be laid on its ring'); }
ok(L.cracks.filter(c => c.swarm && c.ring).length >= 2, 'two cracks want a relayed fire (the dark cut, the steps)');
/* THE SLICK GLASS */
let slopes = 0; for (let x = L.glassFrom; x < L.arena.x0 / TS; x++) for (let y = 0; y < L.H; y++) if (isSlope(at(x, y))) slopes++;
ok(slopes >= 30, 'the slope showcase: ' + slopes + ' glass slope tiles');
/* THE CAST */
const foes = L.ents.filter(e => ['scorpion', 'slinger', 'cutthroat', 'shield', 'vulture', 'skitter'].includes(e.t)), kind = e => e.cnSkin || e.t, cnt = {};
for (const e of foes) cnt[kind(e)] = (cnt[kind(e)] || 0) + 1;
const tot = foes.length, top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
ok(top[1] / tot <= 0.36, 'no foe over ~35% (' + top[0] + ' ' + top[1] + '/' + tot + '): ' + JSON.stringify(cnt));
ok(cnt.shardthrower >= 4, 'the reskinned ranged foe (the shard thrower) is placed where the rule busies you: ' + cnt.shardthrower);
ok(foes.filter(e => e.t !== 'skitter' && e.t !== 'vulture').every(e => e.cnSkin), 'every reskin wears its cnSkin (it dies in its own skin)');
ok(!L.ents.some(e => /gob/.test(e.t) && e.t !== 'bonegob'), 'no living goblins');
ok(L.ents.filter(e => e.t === 'stray' && e.kind === 'glassshard').length === 5 && L.quest.n === 5, 'five glass shards, and the quest counts five');
ok(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers (the spire, the flats\' shelf, the vault)');
ok(L.ents.filter(e => e.t === 'check').length >= 4, 'the checkpoints: ' + L.ents.filter(e => e.t === 'check').map(e => e.x).join(', '));
/* ---------------- THE GLASS COLOSSUS ---------------- */
const A = L.arena; ok(A.boss === 'colossus' && A.x1 - A.x0 === 40 * TS, 'the arena is forty tiles, its boss THE GLASS COLOSSUS');
const G = CG.geom(A, TS);
const mk = () => { const S = CG.newFight(G); const e = { x: G.cx, y: G.floor, hp: CG.COL.hp, maxHp: CG.COL.hp, mode: 'idle', modeT: 0, open: 0, face: -1 }; S.legPurse = e.maxHp * CG.COL.legPurse[0]; S.cd = 0; return { S, e }; };
const hits = []; const world = (extra = {}) => ({ hit: (b, d, name, o) => hits.push({ name, d, o }), number: () => {}, sound: () => {}, shake: () => {}, fx: () => {}, music: () => {}, swarm: n => n, swarmAlive: () => 0, held: () => false, slap: () => {}, throwOff: h => { h.thrown = true; }, ...extra });
const step = (e, S, secs, hs, w) => { for (let i = 0; i < secs * 60; i++) CG.stepColossus(e, S, 1 / 60, hs, w); };
{ /* the lance into a FACING mirror: the chest cracks */
  const { S, e } = mk(); const hero = { x: S.mirrors[0].x - 24, y: G.floor, ground: true, alive: true, pp: {} };
  S.i = 0; step(e, S, 2.0, [hero], world()); ok(e.mode === 'cracked' && CG.colOpen(e), 'a lance baited into a FACING mirror cracks its chest open (' + e.mode + ')');
  const t0 = e.open; ok(t0 >= 3, 'the opening is ' + t0.toFixed(1) + ' s (at least 3)');
  const x0 = e.x; step(e, S, 1, [hero], world()); ok(e.x === x0 && e.mode === 'cracked', 'open, it stands still (B4)');
  ok(CG.takeBlow(e, S, 30, G.hipY, false) === 60, 'a blow from the hip holds lands double on the cracked chest');
  ok(CG.takeBlow(e, S, 30, G.shoulderY, false) === 0, 'a blow at the shoulders when the CHEST is open is turned (told LOWER)');
  step(e, S, 5, [hero], world()); ok(!CG.colOpen(e) && S.ward > 0, 'the opening ends in its told ward (B3)');
  ok(CG.takeBlow(e, S, 30, G.hipY, false) === 0 && CG.takeBlow(e, S, 30, G.floor, false) === 0, 'in the ward nothing lands (the legs neither)');
  step(e, S, S.ward + 0.1, [hero], world()); ok(S.ward === 0 && S.lock > 0, 'after the ward, a lockout: no lance and no swarm for a moment (B12)'); }
{ /* the lance with the mirror turned away: nothing opens */
  const { S, e } = mk(); S.mirrors[0].notch = 'sky'; S.mirrors[1].notch = 'sky'; const hero = { x: S.mirrors[0].x - 24, y: G.floor, ground: true, alive: true, pp: {} };
  hits.length = 0; S.i = 0; step(e, S, 2.0, [hero], world()); ok(!CG.colOpen(e) && hits.some(h => h.name === 'THE SUN LANCE'), 'a lance that meets no FACING mirror opens nothing (and it hits you)'); }
{ /* the legs: always hittable, from a purse, then glazed */
  const { S, e } = mk(); let tot2 = 0, d; while ((d = CG.takeBlow(e, S, 30, G.floor, false)) > 0) tot2 += d; ok(Math.abs(tot2 - e.maxHp * CG.COL.legPurse[0]) < 1, 'its knees take whole blows up to their purse (' + Math.round(tot2) + ')');
  const out = {}; ok(CG.takeBlow(e, S, 30, G.floor, false, out) === 0 && /GLAZED|GLAZE/.test(out.word), 'then they GLAZE (told: ' + out.word + ')'); }
{ /* phase two: the swarm held by a fire relay opens its shoulders; unheld it pours */
  const { S, e } = mk(); S.ph = 2; e.hp = e.maxHp * 0.5; S.i = 0; let spawned = 0;
  step(e, S, 3.0, [{ x: G.x0 + 40, y: G.floor, ground: true, alive: true, pp: {} }], world({ swarm: k => { spawned += k; return k; } })); ok(spawned > 0 && !CG.colOpen(e), 'an unheld swarm call pours skitters and opens nothing');
  const B = mk(); B.S.ph = 2; B.e.hp = B.e.maxHp * 0.5; B.S.i = 0; B.S.mirrors[0].notch = 'fire';
  step(B.e, B.S, 3.0, [{ x: G.x0 + 40, y: G.floor, ground: true, alive: true, pp: {} }], world({ held: () => CG.relaying(B.S) })); ok(B.e.mode === 'blazing', 'a fire relayed onto its crack holds the swarm and its SHOULDERS BLAZE (' + B.e.mode + ')');
  ok(CG.takeBlow(B.e, B.S, 30, G.shoulderY, true) === 30 * CG.COL.plungeMul, 'a plunge on a blazing shoulder lands x' + CG.COL.plungeMul);
  step(B.e, B.S, CG.COL.openShoulders + CG.COL.wardT + 0.2, [{ x: G.x0 + 40, y: G.floor, ground: true, alive: true, pp: {} }], world()); ok(B.S.mirrors[0].notch === 'face', 'after the ward it knocks the relaying mirror round (a fresh TURN for the next opening)'); }
{ /* phase three: a mirror to the sky dazzles its crown */
  const { S, e } = mk(); S.ph = 3; e.hp = e.maxHp * 0.2; S.mirrors[1].notch = 'sky'; step(e, S, 0.2, [{ x: G.x0 + 40, y: G.floor, ground: true, alive: true, pp: {} }], world()); ok(e.mode === 'dazzled', 'at dawn a mirror TO THE SKY dazzles its crown (' + e.mode + ')'); }
{ /* the shake: a climber who does not grip is thrown; one who grips is not */
  const { S, e } = mk(); const climb = { x: (G.hip[0].l + G.hip[0].r) / 2, y: G.hipY, ground: true, alive: true, pp: {} }, grip = { ...climb, x: (G.hip[1].l + G.hip[1].r) / 2, grip: true, pp: {} };
  S.shakeCd = 0; for (const m of S.mirrors) m.notch = 'sky'; step(e, S, 5.0, [climb, grip], world()); ok(climb.thrown && !grip.thrown, 'THE SHAKE throws a climber who does not grip and keeps one who holds DOWN'); }
{ /* phases change the arena: the lance goes dark at night */
  const { S, e } = mk(); e.hp = e.maxHp * 0.54; step(e, S, 0.1, [{ x: G.x0 + 40, y: G.floor, ground: true, alive: true, pp: {} }], world()); ok(S.ph === 2 && e.mode === 'phase', 'below 55% the night falls (phase two, told)');
  ok(!CG.COL.chain[2].includes('lance') && CG.COL.chain[3].includes('lance') && CG.COL.chain[3].includes('wave'), 'no lance at night; at dawn the lance returns and the shard wave comes'); }
{ /* the bot answers a lance from behind a mirror */
  const { S, e } = mk(); e.mode = 'lanceTell'; e.modeT = 1.0; S.lance = { dir: -1, end: CG.lanceEnd(S, -1) };
  const pl = CG.colPlan({ P: { x: G.cx - 70, y: G.floor, ground: true, face: -1, atk: -1 }, e, S, reach: 30, shield: false, rng: () => 0.5, mem: {}, t: 5 });
  ok(pl.gx != null && pl.gx < S.mirrors[0].x, 'the bot goes behind the facing mirror for the lance (' + pl.why + ')'); }
console.log('ok  glasssea  ' + n + ' checks: the rule, the beams, the day and the night, the cast, THE GLASS COLOSSUS');
