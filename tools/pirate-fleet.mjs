/* tools/pirate-fleet.mjs - THE PIRATE FLEET + THE FREEBOOTER, node proofs (claude/water1, 2026-11-05). Pure Node: no page, no browser.
     node tools/pirate-fleet.mjs
   A the level row (hidden, off the road), its build, sections and arcs; B the swell geometry (gaps open at high, shut at low; two swells meet twice a cycle);
   C the kit lints (tides, pulls) and every winch hauls a prize; D the sea always has a way out (a net on the side the current carries you to); E the fleet hands
   (a winch hauls, the mark keeps it, a respawn keeps it, floats ride the swell); F the Freebooter pure (resist floor everywhere, every move told, P2 adds the plunge,
   the openings come from his reload and his missed plunge, the parry answers, the flash); G his hands (take never under 0.4x, the sea gap hauls you out). */
import { LEVELS, T } from '../src/level.js';
import { PF, ARCS, SECTIONS, SWELL, STORM } from '../src/pirate-fleet.js';
import { tideInit, tideStep, floatY, lintTide } from '../src/tide-kit.js';
import { lintPulls, classOf } from '../src/pull-field.js';
import { makePirateFleetHands, PFH } from '../src/pirate-fleet-hands.js';
import * as FBM from '../src/freebooter-boss.js';
import { makeFreebooterHands } from '../src/freebooter-hands.js';
import { readFileSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const TS = 16, JUMP = 51;

// ---------- A. THE ROW ----------
const row = LEVELS.find(l => l.id === 'piratefleet');
ok(row, 'piratefleet row exists'); ok(row.hidden === true && !row.secret, 'hidden, not secret (no post-build filler, off every list)');
ok(LEVELS.indexOf(row) === LEVELS.length - 1 || LEVELS.slice(LEVELS.indexOf(row)).every(l => l.hidden), 'appended (saves count levels by index)');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
ok(!/levelId: 'piratefleet'/.test(main) && !/id: 'piratefleet'/.test(main), 'no map node in main.js (off the road)');
const L = row.build();
ok(L.W === PF.W && L.H === PF.H, 'size ' + L.W + 'x' + L.H);
ok(SECTIONS[0][1] === 0 && SECTIONS[SECTIONS.length - 1][2] === L.W - 1, 'sections span the level');
for (let i = 1; i < SECTIONS.length; i++) ok(SECTIONS[i][1] === SECTIONS[i - 1][2] + 1, 'sections contiguous at ' + SECTIONS[i][0]);
for (const [k, a] of Object.entries(ARCS)) { const seq = ['teach', 'test', 'remix', 'exam'].map(s => a[s][0]); ok(seq.every((x, i) => !i || x > seq[i - 1]), k + ': taught -> tested -> remixed -> examined in order'); }
const checks = L.ents.filter(e => e.t === 'check'); ok(checks.length === 2, 'two shrines (fewer checkpoints): ' + checks.map(c => c.x));
ok(L.ents.filter(e => e.t === 'silver').length >= 4, 'silvers: ' + L.ents.filter(e => e.t === 'silver').map(e => e.x + ',' + e.y).join(' '));
const FOES = new Set(['cutlass', 'marine', 'bosun', 'netter', 'grapnel', 'powdermonkey', 'petrel', 'sapper']);
const foes = L.ents.filter(e => !['sign', 'coin', 'silver', 'check', 'deco', 'cannon', 'keg', 'grapplewinch', 'gate', 'freebooter'].includes(e.t));
ok(foes.every(e => FOES.has(e.t)), 'pirates and sea birds only, no new foe, no goblins: ' + [...new Set(foes.map(e => e.t))].join(','));
for (const e of foes) { const solidUnder = L.grid[(e.y + 1) * L.W + e.x], self = L.grid[e.y * L.W + e.x];
  if (e.t === 'petrel') continue; ok(self !== T.SOLID && (solidUnder === T.SOLID || solidUnder === T.ONEWAY), e.t + '@' + e.x + ',' + e.y + ' stands on footing'); }
ok(L.ents.some(e => e.t === 'freebooter') && L.arena && L.arena.boss === 'freebooter', 'the Freebooter in his arena');
ok(L.ents.some(e => e.t === 'gate' && e.x > L.arena.wallR), 'the way out past his arena');
for (const s of ['freebooter', 'grapplewinch']) ok(/[a-z]/.test(s) && !/(^|[^a-z])(ad|admiral|banner|track|pixel|promo)/.test(s), 'name ok: ' + s);

// ---------- B. THE SWELL GEOMETRY ----------
const K = tideInit(L); const tideOf = id => L.tides.find(t => t.floats.some(f => f.id === id));
const boats = L.moversExtra.filter(m => m.pf);
/* the deck a boat must climb to: the first solid column east of it, its top row */
const deckEast = m => { const x1 = Math.floor((m.x0 + m.w) / TS); for (let x = x1; x < Math.min(L.W, x1 + 6); x++) for (let y = 10; y < PF.BED; y++) if (L.grid[y * L.W + x] === T.SOLID) return { x, y }; return null; };
for (const m of boats) { const td = tideOf(m.fid), f = td.floats.find(q => q.id === m.fid);
  const hi = Math.max(f.top * TS, (td.hi) * TS - 4), lo = Math.min(f.y * TS, td.lo * TS - 4), d = deckEast(m);
  ok(lo - hi >= 40, m.fid + ': rides ' + (lo - hi) + ' px of swell');
  if (!d || m.boss) continue;
  const up = hi - d.y * TS, upLo = lo - d.y * TS;
  if (m.fid === 'b2' || m.fid === 'b8' || m.fid === 'b10' || m.fid === 's2' || m.fid === 'L1') continue;   /* (the first of a pair, or a boat whose way on is the prize it hauls) */
  ok(up <= JUMP - 4, m.fid + ': at HIGH swell the next deck is ' + up + ' px up (a jump)'); ok(upLo > JUMP + 8, m.fid + ': at LOW swell it is ' + upLo + ' px up (a wall)'); }
/* two swells: the A boat and the B boat beside it meet within 10 px at least twice in a cycle */
for (const [a, b] of [['b2', 'b3'], ['b8', 'b9'], ['b10', 'b11'], ['s2', 's3']]) { const K2 = tideInit(L); let meet = 0, was = false, apart = 0;
  for (let t = 0; t < 21; t += 1 / 60) { tideStep(K2, 1 / 60); const d = Math.abs(floatY(K2, a) - floatY(K2, b)), m = d < 10; if (m && !was) meet++; was = m; apart = Math.max(apart, d); }
  ok(meet >= 2 && apart >= 40, a + '/' + b + ': meet ' + meet + 'x in 21 s, ' + Math.round(apart) + ' px apart at most'); }
ok(SWELL.warn >= 1.5 && SWELL.turn >= 1.5 && STORM.warn / STORM.rate >= 1.5 && STORM.turn / STORM.rate >= 1.5, 'swell tells >= 1.5 s at their rates');

// ---------- C. THE KIT LINTS + THE WINCHES ----------
const lt = lintTide(L, { run: 70 }); ok(!lt.length, 'lintTide: ' + lt.join('; '));
const lp = lintPulls(L); ok(!lp.length, 'lintPulls: ' + lp.join('; '));
const cls = Object.fromEntries(L.pulls.map(f => [f.id, classOf(f)]));
ok(cls.wake1 === 'drift' && cls.channel === 'strong' && cls.rip === 'rip', 'teach a drift, test a strong channel, exam a rip: ' + JSON.stringify(cls));
for (const w of L.pfWinches) { const p = L.pfPrizes.find(q => q.id === w.hauls); ok(p && !p.boss, w.id + ' hauls ' + w.hauls); }
ok(L.pfPrizes.filter(p => p.boss).length === 1, 'one prize is his (the sloop he hauls in phase two)');

// ---------- D. THE SEA HAS A WAY OUT ----------
for (const f of L.pulls.filter(q => q.kind === 'current')) { const dir = f.dir[0], [x0, , x1] = f.box, edge = dir < 0 ? x0 : x1;
  let net = false; for (let x = edge - 1; x <= edge + 1; x++) for (let y = 31; y < PF.BED; y++) if (L.grid[y * L.W + x] === T.NET) net = true;
  ok(net || f.tide, f.id + ': the current carries you to a net (' + (dir < 0 ? 'west' : 'east') + ')'); }

// ---------- E. THE FLEET HANDS ----------
{ const marks = new Set(), P = { x: 95 * TS, y: 30 * TS, w: 10, h: 18, swim: false }, said = [];
  const ctx = { L, players: [P], hero: () => P, marks: () => marks, poolLevel: (p, y) => { p.y = y; }, moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; }, holding: () => false, enemies: () => [],
    number: (x, y, t) => said.push(t), shake() {}, burst() {}, sparks() {}, time: () => 0, VW: () => 320, view: () => ({ x0: 0, y0: 0, x1: 320, y1: 240 }), parts: () => [], sound() {} };
  const H = makePirateFleetHands(ctx); H.clear(); ok(H.on(), 'hands on for a level with tides');
  const movers = L.moversExtra.map(m => ({ ...m }));
  const step = s => { for (let t = 0; t < s; t += 1 / 60) { H.update(1 / 60); for (const m of movers) H.mover(m, 1 / 60); } };
  step(1); const p1 = movers.find(m => m.fid === 'p1'); ok(p1.broken, 'a prize out at sea is not footing');
  const ys = new Set(); for (let i = 0; i < 12; i++) { step(1); ys.add(Math.round(movers.find(m => m.fid === 'b1').y)); } ok(ys.size >= 4, 'a swell boat rides up and down (' + ys.size + ' heights)');
  const w = L.pfWinches.find(q => q.id === 'g1'), hb = { l: w.x * TS, r: w.x * TS + 16, t: (w.y + 1) * TS - 20, b: (w.y + 1) * TS };
  H.strike(hb); step(PFH.lineT + PFH.haulT + 0.2); ok(!p1.broken && H.prizeK('p1') === 1, 'struck: the prize comes alongside and is footing');
  ok(marks.has(PFH.haulKey('p1')), 'the haul is a mark'); ok(said.includes('ALONGSIDE: BOARD HER'), 'told: alongside');
  H.clear(); step(0.1); ok(H.prizeK('p1') === 1, 'a respawn keeps her hauled');
  const g3 = L.pfWinches.find(q => q.id === 'g3'); ok(g3.on === 'L1', 'the remix winch rides the longboat');
  /* the boss sloop is HIS: a winch never hauls it, and a respawn sends it back out */
  H.haul('fbsloop'); step(3); ok(H.prizeK('fbsloop') === 1, 'his haul works'); H.clear(); ok(H.prizeK('fbsloop') === 0, 'a respawn sends his sloop back out (not a mark)');
  /* a swimmer in a drift is carried toward the net */
  const S = { x: 24 * TS, y: 34 * TS, swim: true }; ctx.players.push(S); H.clear(); const x0 = S.x; step(2); ok(S.x < x0 - 30, 'the wake carries a swimmer back west (' + Math.round(x0 - S.x) + ' px in 2 s)');
  ctx.players.pop(); }

// ---------- F. THE FREEBOOTER (pure) ----------
const modes = ['guard', 'idle', 'walk', 'pistolTell', 'pistolFire', 'reload', 'cutsTell', 'cuts', 'cutsRec', 'bootTell', 'boot', 'bootRec', 'riposteTell', 'riposte', 'riposteRec', 'plungeTell', 'plungeAir', 'stuck', 'plungeRec', 'boardTell', 'boardAir', 'haulTell', 'haulWait'];
let minK = 9; for (const m of modes) for (const ward of [0, 1]) for (const fx of [-60, 60]) for (const fy of [0, -40]) { const e = { x: 0, y: 0, face: 1, mode: m, open: FBM.OPEN_MODES.has(m) ? 1 : 0 }, S = FBM.newFight({}); S.ward = ward;
  minK = Math.min(minK, FBM.takeAt(e, S, { x: fx, y: fy }).k); }
ok(minK >= 0.4, 'never under 0.4x outside an opening (min ' + minK + ')');
{ const e = { x: 0, y: 0, face: 1, mode: 'guard', open: 0 }, S = FBM.newFight({}); ok(FBM.takeAt(e, S, { x: 30, y: 0 }).parry, 'a blow from in front of his guard is parried');
  ok(FBM.takeAt(e, S, { x: -30, y: 0 }).k > FBM.FB.k.guard, 'from behind it lands harder (guard by angle)'); ok(FBM.takeAt(e, S, { x: 30, y: -40 }).k > FBM.FB.k.guard, 'from above too');
  e.mode = 'reload'; e.open = 1; ok(FBM.takeAt(e, S, { x: 30, y: 0 }).k === 1, 'RELOADING: 1x'); e.mode = 'stuck'; ok(FBM.takeAt(e, S, { x: 30, y: 0 }).k > 1, 'STUCK: more'); }
for (const [k, M] of Object.entries(FBM.MOVES)) { const tell = { pistol: FBM.FB.pistol.tell, cuts: FBM.FB.cuts.tell, boot: FBM.FB.boot.tell, riposte: FBM.FB.riposte.tell, plunge: FBM.FB.plunge.tell }[k];
  ok(tell >= 0.35 && (M.mark === '!' || M.mark === '!!') && M.answer, k + ': told ' + M.mark + ' ' + tell + ' s, answer ' + M.answer); }
ok(FBM.PHASE_NEW[2].length === 1 && FBM.PHASE_NEW[2][0] === 'plunge', 'phase two adds one move: the plunge');
/* a toy duel: one hero who stands at range, then close; the world as the hands give it */
function toy(seed, opts = {}) { let r = seed; const rand = Math.random; Math.random = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const S = FBM.newFight({}), e = { x: 400, y: 480, face: -1, mode: 'wake', modeT: 1, open: 0, hp: 4200, maxHp: 4200 }, log = [], hits = [];
  let sloop = false; const h = { x: opts.x ?? 200, y: 480, ground: true, alive: true };
  const c = { number: (x, y, t) => log.push(t), sound() {}, mark() {}, hit: (bx, d, name) => { hits.push(name); return opts.eat ? true : false; }, shot: (L, d, n) => hits.push(n), floorAt: x => (x > 660 && !sloop ? null : 480), clampX: x => Math.max(10, Math.min(900, x)),
    deckOf: x => (x < 660 ? 0 : sloop ? 1 : -1), haul: () => { sloop = true; }, sloopIn: () => sloop, flash() {}, ringWard() {}, fx() {} };
  const seen = new Set();
  for (let t = 0; t < 60; t += 1 / 60) { FBM.stepFreebooter(e, S, 1 / 60, [h], c); seen.add(e.mode); if (opts.hurtAt && t > opts.hurtAt && e.hp > 2000) e.hp = 2000; if (opts.move) h.x = 200 + Math.sin(t) * 150; }
  Math.random = rand; return { seen, log, hits, S, sloop }; }
{ const a = toy(7); ok(a.seen.has('pistolTell') && a.seen.has('reload'), 'at range: the pistol, then RELOAD (open)'); ok(a.log.includes(FBM.FB_SAY.reload), 'told: reloading');
  const b = toy(11, { x: 380 }); ok(b.seen.has('cutsTell') && b.seen.has('cuts'), 'close: the five cuts'); ok(b.hits.filter(x => x === 'THE FIVE CUTS').length >= 5, 'five cuts land as five blows');
  const c2 = toy(5, { hurtAt: 3, move: true }); ok(c2.sloop && c2.S.ph === 2, 'under 55%: phase two, he hauls his sloop'); ok(c2.seen.has('plungeTell') && c2.seen.has('stuck'), 'phase two: the plunge, missed = STUCK (open)');
  ok(!toy(5, { move: true }).seen.has('plungeTell'), 'no plunge in phase one');
  const d = toy(5, { hurtAt: 3, move: true, eat: true }); ok(d.seen.has('plungeRec') && !d.seen.has('stuck'), 'a plunge that lands is no opening'); }
{ const S = FBM.newFight({}), e = { x: 0, y: 0, face: 1, mode: 'guard', modeT: 1, open: 0 }, said = []; const c = { number: (x, y, t) => said.push(t), sound() {}, mark() {}, flash() {}, clampX: x => x, nearest: () => ({ x: 30 }) };
  FBM.parried(e, S, c); ok(e.mode === 'riposteTell', 'a parry is answered: the riposte, told');
  e.mode = 'guard'; for (const t of [0, 0.3, 0.6]) FBM.landed(e, S, t, c); ok(said.includes(FBM.FB_SAY.flash) && Math.abs(e.x) === FBM.FB.flash.dist, 'three quick blows: the powder flash (he is moved, never untouchable)'); }

// ---------- G. HIS HANDS ----------
{ const Ar = L.arena, P = { x: Ar.x0 + 100, y: Ar.floor, w: 10, h: 18, hp: 100, face: 1 }, pfh = { prizeK: () => 0, deckY: () => Ar.floor, haul() {}, unhaul() {} };
  let hazarded = 0; const ctx = { L, players: [P], get boss() { return E; }, pfh, TS, EHP: { freebooter: FBM.FB.hp }, sfx: {}, hero: () => P, time: () => 0, number() {}, text() {}, burst() {}, shake() {}, ring() {}, sparks() {}, turned() {},
    damagePlayer() {}, asPlayer: (p, fn) => fn(), upright: () => true, overlap: () => false, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 18, b: b.y }), hazard: () => { hazarded++; } };
  const H = makeFreebooterHands(ctx); var E = H.spawnBoss({ x: Ar.x0 + 300, y: 0, alive: true });
  ok(E && E.hp === FBM.FB.hp && E.t === 'freebooter', 'spawned at ' + E.hp + ' hp'); E.mode = 'guard'; E.face = -1;
  P.x = E.x - 30; const k1 = H.take(E, 100, true) / 100; P.x = E.x + 30; const k2 = H.take(E, 100, true) / 100;
  ok(k1 >= 0.4 && k2 >= 0.4 && k1 < k2 + 0.001, 'take: front ' + k1 + ', back ' + k2 + ' (never under 0.4)');
  P.x = Ar.gap[0] * TS + 20; P.y = Ar.floor + 40; E.mode = 'guard'; H.update(E, 1 / 60); ok(hazarded === 1, 'the sea between the decks: hauled out');
  ok(H.barName({ mode: 'reload', open: 1 }).includes('RELOADING'), 'bar: RELOADING'); }

console.log('pirate-fleet: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
process.exit(bad ? 1 : 0);
