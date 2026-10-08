// tools/towpath.mjs - THE TOWPATH's own check (claude/towpath). Node only: no page, no port, no Chrome. The built level, the pure fight, and the hands in a
// fake world (src/towpath-hands.js takes a context; here it is the built grid, its pools and movers, and a list of men):
//   - the rule line is the code's (LEVELS row == src/towpath.js); the road: waymeet > towpath > canal; it is appended to LEVELS (saves count by index);
//     the arcs teach -> test -> exam for the lock, the bridge and the lantern; the LYCHGATE FORK's hook (the church door) stands at the start
//   - THE LOCKS in the hands: a paddle fills a low chamber and drains a high one; the lower gate shuts as the water rises over its pound and opens when it is
//     back; a punt's deck rides the water (and rests on a dry bed); a man in a chamber that fills is drowned; every punt has a paddle in reach of its end;
//     every lock whose punt can ride away from you has a paddle on your side; the race stills the wheel and its paddles become a stair; a swing bridge's
//     deck is footing only while it stands across; the lantern is taken at the hut; in the fog a watchman sees only the lit
//   - the cast: one new foe here (the grindylow, the canal's, met first on the towpath), reskins by cnSkin, a ranged one, role mix; two shrines between
//     start and boss, 140-260 columns apart; the exam's old gate irons kill (examSpans), nowhere else does a spike
//   - THE FOG KNIGHT (src/fog-knight.js, a fake world): his stance turns the wrong angle and lets the right one through (high: low; low: high or plunge;
//     full: only the plunge, which breaks it); his own blows' recovery lets everything through; the lantern burns him OPEN (>= 3 s, standing still) and a
//     ward follows; the bridge swung through him scatters him OPEN; the lock drained grounds his double; one new told move a phase; the bot's reading
//     answers each stance with its angle; his marks are src/marks.js's; boss-greed duelist rows; the synth themes
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { SECTIONS, ARCS, RULE, TOWPATH, O } from '../src/towpath.js';
import * as FK from '../src/fog-knight.js';
import { makeTowpathHands, TP } from '../src/towpath-hands.js';
import { MARK, ANSWER } from '../src/marks.js';
import { OPEN_RULE, FULL_DAMAGE } from '../src/boss-greed.js';
import { SYNTH_BOSS, SYNTH_VARIANT } from '../src/boss-music.js';
import { STUCK_HANDS } from '../src/stuck-spots.js';
import { isCallout } from '../src/hint-lines.js';
import { AMBIENT_NAMES } from '../src/audio.js';
const TS = 16; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const lv = LEVELS.find(l => l.id === 'towpath'); ok(lv, 'towpath is in LEVELS');
ok(lv.needs === 'waymeet' && LEVELS.find(l => l.id === 'canal').needs === 'towpath', 'the road: WAYMEET > THE TOWPATH > THE FOG CANAL');
ok(LEVELS[LEVELS.length - 1].id === 'towpath' || LEVELS.findIndex(l => l.id === 'towpath') > LEVELS.findIndex(l => l.id === 'ksar'), 'appended to LEVELS (saves count levels by index)');
ok(lv.rule === RULE, 'the rule line is the code\'s');
const L = lv.build(), D = L.towpath, at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
ok(L.W === TOWPATH.W && L.H === TOWPATH.H, 'the sheet is TOWPATH\'s size');
/* THE ARCS */
for (const [verb, a] of Object.entries(ARCS)) { ok(a.teach && a.test && a.exam, verb + ': taught, tested, examined'); ok(a.teach[0] < a.test[0] && a.test[0] < a.exam[0], verb + ': in that order'); }
ok(SECTIONS.length === 7 && SECTIONS.every((s, i) => !i || s[1] > SECTIONS[i - 1][1]), 'seven sections, in order');
/* THE FORK */
ok(L.ents.some(e => e.t === 'tplychgate' && e.x < 40) && L.ents.some(e => e.t === 'tpchurch' && e.x < 40 && e.to === 'church'), 'the lychgate fork at the start: the church door (claude/litchurch\'s level id \'church\')');
/* THE PIECES */
const ents = t => L.ents.filter(e => e.t === t);
for (const k of D.locks) { if (k.virtual) continue; ok(ents('tppaddle').some(p => p.lock === k.id), 'lock ' + k.id + ' has a paddle'); }
for (const b of D.bridges) ok(ents('tpcapstan').some(c => c.bridge === b.id), 'bridge ' + b.id + ' has a capstan');
for (const m of L.moversExtra.filter(q => q.kind === 'punt')) { const k = D.locks.find(q => q.id === m.towpath), end = (m.x + m.w) / TS;
  ok(ents('tppaddle').some(p => p.lock === k.id && p.x >= k.x0 && p.x <= k.x1 + 1 && Math.abs(p.x + 0.5 - end) <= 2), 'punt ' + k.id + ': a paddle in reach of its end');
  ok(ents('tppaddle').some(p => p.lock === k.id && p.x < k.x0), 'punt ' + k.id + ': a paddle on the near side (a punt that rides away comes back)'); }
ok(L.rigBands.length === L.moversExtra.filter(q => q.kind === 'punt').length, 'every punt is a ride for the reach model');
/* the exam's irons, and no spike outside it */
let spikes = 0, spikesOut = 0; for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) if (at(x, y) === T.SPIKE) { spikes++; if (!L.examSpans.some(s => x >= s[0] && x <= s[1])) spikesOut++; }
ok(spikes > 0 && spikesOut === 0, 'the old gate irons are in the exam only');
/* SHRINES */
const cps = ents('check').map(e => e.x).sort((a, b) => a - b); ok(cps.length === 2, 'two shrines (one after the mills\' exam, one after the last lock)');
ok(cps[0] >= 140 && cps[0] <= 260 && cps[1] - cps[0] >= 140 && cps[1] - cps[0] <= 260, 'shrines 140-260 columns apart');
ok(cps[1] < L.arena.wallL, 'the second shrine stands before the Fog Knight');
/* THE CAST */
const foes = L.ents.filter(e => ['swornsword', 'hedgeknight', 'crossbow', 'gaffer', 'archer', 'grindylow'].includes(e.t));
ok(foes.length >= 14 && foes.length <= 24, 'fewer, weightier foes: ' + foes.length);
ok(foes.some(e => e.t === 'archer' || e.t === 'crossbow'), 'a ranged foe');
ok(foes.filter(e => e.t === 'gaffer').every(e => e.cnSkin) && foes.filter(e => e.t === 'archer').every(e => e.cnSkin === 'watchman' && e.tp && e.tp.tpSight), 'the bargemen and the watchmen are reskins (cnSkin) with their eyes in the fog');
ok(foes.some(e => e.elite && e.t === 'hedgeknight') && foes.some(e => e.elite && e.t === 'gaffer'), 'the section exams\' elites: a hedge knight champion, the deck foreman');
ok(!L.ents.some(e => /gob|goblin|sprig/.test(e.t)), 'no living goblins past the Goblin Queen');
/* THE HANDS, IN A FAKE WORLD */
{
  const pools = L.pools, movers = L.moversExtra.map(m => ({ ...m, dx: 0, dy: 0 })), men = [];
  const ctx = { L, TS, T, players: [], hero: () => ({ x: 0, y: 0, face: 1 }), movers: () => movers, enemies: () => men, sfx: {}, number: () => {}, text: () => {}, burst: () => {},
    cellSet: (x, y, t) => { L.grid[y * L.W + x] = t; }, resolve: () => {}, bodies: () => men.filter(e => e.alive), box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), overlap: () => false,
    attackBox: () => null, near: () => false, asPlayer: (p, f) => f(), mark: () => {}, drown: e => { e.alive = false; e.drowned = true; return true; }, VW: () => 400, VH: () => 240, time: () => 0 };
  const H = makeTowpathHands(ctx); H.reset(); ok(H.on(), 'the hands bind to the level');
  const run = s => { for (let i = 0; i < s * 60; i++) H.update(1 / 60); for (const m of movers) H.mover(m, 1 / 60); };
  const A = H.lock('A'), gx = A.gate.x;
  ok(H.lockLevel('A') === 'lo' && at(gx, A.gate.top) === T.AIR, 'lock A starts low, its lower gate open');
  ok(H.work('A') === 'fill', 'its paddle fills a low chamber'); run(5);
  ok(H.lockLevel('A') === 'hi' && at(gx, A.gate.top) === T.SOLID, 'filled: high, and the lower gate shut behind it');
  const pA = movers.find(m => m.towpath === 'A'); ok(Math.abs(pA.y - (A.hiY - 6)) < 1, 'the punt rides the water up to the upper bank');
  ok(H.work('A') === 'drain', 'struck again, it drains'); run(5); ok(H.lockLevel('A') === 'lo' && at(gx, A.gate.top) === T.AIR, 'drained: the gate opens again');
  const F2 = H.lock('F2'); ok(H.lockLevel('F2') === 'dry', 'F2 starts dry');
  const pF2 = movers.find(m => m.towpath === 'F2'); ok(Math.abs(pF2.y - (F2.bedY - 8)) < 1, 'its punt rests on the dry bed');
  const pair = L.ents.filter(e => e.squad === 'dryChamber').map(e => ({ t: 'gaffer', x: e.x * TS + 8, y: (e.y + 1) * TS, alive: true }));
  men.push(...pair); H.work('F2'); run(8); ok(pair.every(e => e.drowned), 'F2 filled over the pair on its bed: the water takes them');
  ok(H.lockLevel('F2') === 'hi', 'F2 filled to the landing\'s height');
  const race = H.lock('race'), w = D.wheels[0]; ok(H.lockLevel('race') === 'hi', 'the race runs');
  ok(w.steps.every(([a, b, r]) => at(a, r) === T.AIR), 'the turning wheel is no stair');
  H.work('race'); run(8); ok(H.handsState('wheel.mill') === 'still' && w.steps.every(([a, b, r]) => at(a, r) === T.ONEWAY), 'the race drained: the wheel stands still, its paddles a stair');
  const tail = D.bridges.find(b => b.id === 'tail'); ok(at(tail.x0, tail.row) === T.AIR, 'the tail race\'s bridge starts clear of the cut');
  H.swing('tail'); run(2); ok(at(tail.x0, tail.row) === T.ONEWAY && H.handsState('bridge.tail') === 'across', 'its capstan swings it across: footing');
  H.swing('tail'); run(0.1); ok(at(tail.x0, tail.row) === T.AIR, 'swung clear, the deck is gone at once (whoever stands on it goes in)');
  const X = H.lock('X'); H.work('X'); run(10); ok(H.lockLevel('X') === 'dry', 'the last lock drains to its irons');
  /* THE LANTERN AND THE EYES */
  const pp = { n: 1, x: (D.lantern.x - 2) * TS, y: 40 * TS, dead: false, face: 1 }; ctx.players.push(pp); ctx.hero = () => pp;
  ok(!H.lanternOf(pp).has, 'no lantern before the hut'); pp.x = (D.lantern.x + 5) * TS; run(0.1); ok(H.lanternOf(pp).has && H.lanternOf(pp).lit, 'past the hut the lock-keeper\'s lantern is yours, lit');
  const fogX = 250 * TS; ok(H.fogAt(fogX) > 0.3, 'the basin is in the fog');
  const watch = { x: fogX + 150, y: 28 * TS, tpSight: true, alive: true }; pp.x = fogX; pp.y = 28 * TS;
  ok(H.seen(watch, pp), 'lit, the watchman sees you'); H.interact(pp); ok(!H.lanternOf(pp).lit, 'E dims it'); ok(!H.seen(watch, pp), 'dimmed in the fog, he does not');
  pp.x = watch.x - 30; ok(H.seen(watch, pp), 'at his elbow he does');
}
/* THE GLINT: every route need in STUCK_HANDS.towpath targets a paddle or a capstan */
for (const sp of STUCK_HANDS.towpath) for (const s of sp.steps) ok(L.ents.some(e => (e.t === 'tppaddle' || e.t === 'tpcapstan') && e.x === s.at[0] && e.y === s.at[1]), 'the glint ' + s.key + ' is on its gadget');
/* THE FOG KNIGHT */
const A = L.arena; ok(A && A.boss === 'fogknight' && L.ents.some(e => e.t === 'fogknight'), 'THE FOG KNIGHT stands at the towpath\'s end');
const G = FK.geom(A);
ok(at(Math.floor(G.cut[0] / TS), A.fk.R) === T.ONEWAY, 'his cut is spanned by the swing bridge'); ok(G.caps.length === 2 && L.ents.filter(e => e.t === 'tpcapstan' && e.arena).length === 2, 'a capstan on each bank');
ok(FK.FK_STAGE.beams.every(b => at(A.fk.sx + b.x0, A.fk.R - b.dy) === T.ONEWAY), 'the lock beams: the plunge\'s heights');
const world = () => { const c = { said: [], hits: [], number: (x, y, t) => c.said.push(t), mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, time: () => 0, hit: (b, d, nm) => { c.hits.push(nm); return false; }, lockFull: () => true }; return c; };
const fresh = () => { const S = FK.newFight(G), e = { x: G.x0 + 520, y: G.floorY, hp: 2000, maxHp: 2000, alive: true, mode: 'walk', modeT: 1, face: -1, open: 0 }; return { S, e }; };
{ const { S, e } = fresh();
  for (const [st, good, bad] of [['high', ['low'], ['mid', 'high', 'plunge']], ['low', ['high', 'plunge'], ['mid', 'low']], ['full', ['plunge'], ['mid', 'low', 'high']]]) { S.stance = st;
    for (const a of good) ok(FK.takeAt(e, S, a).k === 1, st + ': a ' + a + ' blow lands');
    for (const a of bad) { const r = FK.takeAt(e, S, a); ok(r.k === 0 && r.word === FK.STANCE_WORD[st], st + ': a ' + a + ' blow is turned and named'); } }
  S.stance = 'full'; ok(FK.takeAt(e, S, 'plunge').reel, 'a plunge breaks the full guard');
  e.mode = 'cutRec'; ok(FK.takeAt(e, S, 'mid').k === 1, 'in his blow\'s recovery every angle lands'); }
{ const { S, e } = fresh(), c = world(), hero = [{ x: e.x - 40, y: e.y, alive: true, lit: true, face: 1 }]; let t = 0;
  while (!FK.fkOpen(e) && t < 8) { FK.stepFogKnight(e, S, 1 / 60, hero, c); t += 1 / 60; hero[0].x = e.x - 40; }
  ok(FK.fkOpen(e) && S.n.burns === 1, 'a lit lantern at his side burns the fog out of him: OPEN (' + t.toFixed(1) + ' s)');
  const x0 = e.x; let open = 0; while (FK.fkOpen(e)) { FK.stepFogKnight(e, S, 1 / 60, hero, c); open += 1 / 60; }
  ok(open >= 3 && e.x === x0, 'the opening lasts >= 3 s and he stands still in it (B4)'); ok(S.ward > 2.5 && FK.takeAt(e, S, 'low').word === 'WARDED', 'a told ward follows (B3)'); }
{ const { S, e } = fresh(), c = world(); e.x = G.cutMid; ok(FK.bridgeSwung(e, S, c) === 'scatter' && FK.fkOpen(e) && e.open >= 3, 'the bridge swung through him scatters him: OPEN 3 s');
  const f2 = fresh(); f2.e.x = G.x0 + 40; ok(FK.bridgeSwung(f2.e, f2.S, c) === 'miss', 'away from the cut the bridge misses him'); }
{ const { S, e } = fresh(), c = world(); S.dbl = { x: 0 }; ok(FK.lockDrained(e, S, c) && !S.dbl, 'the lock drained grounds the double'); }
const moves = ph => new Set(FK.CYCLES[ph].flat()); ok(!moves(1).has('double') && !moves(1).has('step') && moves(2).has('double') && !moves(2).has('step') && moves(3).has('step'), 'one new move a phase: the double (2), the shroud\'s step (3)');
for (const [m, v] of Object.entries(FK.MOVES)) { ok(MARK['fogknight|' + m] === v.mark, 'his ' + m + ' mark is src/marks.js\'s'); if (v.answer) ok(ANSWER['fogknight|' + m] === v.answer, 'his ' + m + ' answer is src/marks.js\'s'); }
ok(typeof OPEN_RULE.fogknight === 'function' && FULL_DAMAGE.fogknight, 'src/boss-greed.js: his opening (OPEN_RULE) and a duelist\'s full damage');
/* THE BOT'S READING */
{ const { S, e } = fresh(), P = { x: e.x - 20, y: e.y, face: 1, ground: true, atk: -1, lit: true, has: true }, base = { P, e, S, reach: 30, shield: true, t: 9, v2: true, gadgetNear: false, bridgeOpen: false };
  S.stance = 'high'; let o = FK.fkPlan(base); ok(o.down && o.atk, 'the bot answers GUARDS HIGH low');
  S.stance = 'low'; o = FK.fkPlan(base); ok(o.jump, 'the bot answers GUARDS LOW from a jump');
  S.stance = 'full'; P.x = e.x - 4; o = FK.fkPlan(base); ok(o.jump, 'the bot goes up for the plunge');
  P.ground = false; P.y = e.y - 40; o = FK.fkPlan(base); ok(o.down && o.atk, 'and comes down on him'); }
/* THE MUSIC, THE AIR, THE LINES */
ok(SYNTH_BOSS.towpath && SYNTH_BOSS.fogknight && SYNTH_VARIANT['fogknight:p2'] && SYNTH_VARIANT['fogknight:p3'], 'the level bed and his three-phase theme are composed in code');
ok(L.music === 'towpath' && A.music === 'fogknight' && AMBIENT_NAMES.includes('towpath') && L.ambient.some(a => a.kind === 'towpath'), 'its own music and its own air (not the forest\'s)');
for (const f of ['towpath-hands.js', 'fog-knight.js', 'fog-knight-hands.js']) { const src = readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
  for (const m of src.matchAll(/number\([^;()]*?(?:'([A-Z](?:[^'\\]|\\.)*)'|"([A-Z][^"]*)")/g)) { const line = (m[1] || m[2]).replace(/\\'/g, "'"); if (line.length > 3) ok(isCallout(line), f + ': the line "' + line + '" is in src/hint-lines.js'); } }
console.log('towpath: ' + n + ' checks ok');
