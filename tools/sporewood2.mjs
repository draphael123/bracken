// tools/sporewood2.mjs - SPOREWOOD 2, THE MOTHER'S KNOT, and THE MOTHER CAP 2 (claude/sporewood2, the opus greybox of level + boss; Node, no page). It replaces
// tools/spore-caps.mjs, spore-exam.mjs, spore-loop.mjs and mother-cap.mjs, which pinned the old grafted wood's beats and the old heart-node fight.
//   THE ROAD: Stockade > SPOREWOOD > Rootway; gated by level-quality; the rule line says the spores help you; the five named areas + her hollow, in order;
//   THE MOTHER'S KNOT on the skyline. THE ROUTE: the fill reaches every shrine, every silver, the elite and her; every REQUIRED use is a LOCK (without it the next
//   shrine, or her, is out of reach): the glade's bud, the bounce pit, the terrace's two buds, the dark bud wall and the shaft's three dark buds, the bog's lean
//   caps, bud, bounce stalk and bounce well, the larder's two buds, the seed stair at her door. THE SPORES THAT HELP: lantern caps (every dark bud has one in
//   reach), mend puffs, puffballs, bounce caps; the signature actors back (rollers, a drone, the shaman). THE ANNOYANCE CUT: ten debuffers or so, each with its
//   answer (a lurker stands in a lantern's light); no sleep clouds, no storm. Shrines close the area exams (A10c). The old final filter that deleted the
//   puffballs, rollers, drones and the shaman is not in the build.
//   HER HOLLOW: a seed pair a side (low 3 rows, high 6 rows, the high one's inner edge 40 px off her knot), her knot over her cap, two wall shelves.
//   THE HANDS IN A FAKE WORLD: a mend puff mends; a struck puffball hangs a spring spore that throws a hero; a struck seed grows its pair (and standing does not);
//   a dark bud grows only lit; a plunge opens a root knot and a blade does not. HER: 0.4 sealed (FROM ABOVE), x2 open; a plunge on her knot opens her (and on
//   the floor nothing); a told ward after; a struck bloom is a spring spore; under half the net wakes and she withers a grown cap; her brood bursts on a heavy.
//     node tools/sporewood2.mjs
import { readFileSync } from 'node:fs';
import { install } from './node-canvas.mjs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { SPOREWOOD, SECTIONS } from '../src/sporewood.js';
import { makeSporewoodHands, SP, SPW_SAY } from '../src/sporewood-hands.js';
import { makeMotherCap, MC, MC_SAY, MC_TELLS } from '../src/mother-cap2.js';
import { MARK, ANSWER } from '../src/marks.js';
install();
const TS = 16;
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const lv = LEVELS.find(l => l.id === 'spore'), L = lv.build();
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// ---- THE ROAD ----
ok(lv.needs === 'stockade' && LEVELS.find(l => l.id === 'rootway').needs === 'spore', 'Stockade > SPOREWOOD > Rootway');
ok(/SPORES HELP YOU/.test(lv.rule) && /BOUNCE CAPS/.test(lv.rule) && /LANTERN CAPS/.test(lv.rule) && /MEND PUFFS/.test(lv.rule), 'the rule line says the spores help you: ' + lv.rule);
ok(/GATE = \[[^\]]*'spore'/.test(src('tools/level-quality.mjs')), 'gated by level-quality');
ok(L.sporewood2 === true && L.W === SPOREWOOD.W, 'the level is src/sporewood.js (L.sporewood2)');
ok(JSON.stringify((L.sections || []).map(s => s.name)) === JSON.stringify(SECTIONS.map(s => s[0])) && L.sections.length === 6, 'five named areas and her hollow: ' + (L.sections || []).map(s => s.name).join(' | '));
ok(L.knot && L.knot.x === SPOREWOOD.mother * TS + 8 && /drawKnot/.test(src('src/redraw/sporewood_knot.js')) && /SWKNOT\(g, cx, cy, VW, VH, L, time/.test(src('src/main.js')) && /SW2B\.drawBackdrop/.test(src('src/main.js')), "THE MOTHER'S KNOT: anchored on her, drawn on the skyline");
ok(!/R\.ents\.filter\(e=>!\['puffball','roller','nest','shaman','drone','gill'\]/.test(src('src/sporewood.js')), 'no filter deletes the signature actors from the built level');

// ---- THE ROUTE AND ITS LOCKS ----
const reach = (lv2, o = {}) => floodReach(lv2, T, { rides: true, glassBeds: true, ...o });
const R = reach(L), at = (t, f = () => true) => L.ents.filter(e => e.t === t && f(e));
const checks = at('check').sort((a, b) => a.x - b.x), silvers = at('silver'), mother = at('mother')[0], elite = L.ents.find(e => e.elite);
ok(checks.length === 4 && checks.every(c => R.near(c.x, c.y)), 'the fill reaches all four shrines: ' + checks.map(c => c.x + ',' + c.y).join(' '));
ok(silvers.length === 3 && silvers.every(s => R.near(s.x, s.y)), 'three silvers, all reached: ' + silvers.map(s => s.x + ',' + s.y).join(' '));
ok(mother && R.near(mother.x, mother.y) && elite && R.near(elite.x, elite.y), 'the fill reaches the elite (' + (elite && elite.t) + ') and her');
const copy = () => ({ ...L, grid: L.grid.slice(), moversExtra: (L.moversExtra || []).map(m => ({ ...m })), ents: L.ents.map(e => ({ ...e })) });
const target = x => { const c = checks.find(q => q.x > x); return c ? [c.x, c.y] : [mother.x, mother.y]; };
const LOCKS = [
  ['the glade bud (the root wall)', { bud: [28] }],
  ['the bounce pit', { springs: [59, 66, 41] }],
  ["the terrace's buds", { bud: [77] }], ["the terrace's second bud", { bud: [85] }],
  ['the dark bud wall', { bud: [136] }], ["the dark shaft's first bud", { bud: [168] }], ["the shaft's second", { bud: [180] }], ["the shaft's third", { bud: [188] }],
  ["the bog's first leaning cap", { bud: [208] }], ["the bog's bud", { bud: [220] }], ['the bounce stalk', { springs: [236, 238, 27] }],
  ["the cap ladder's leaning cap", { bud: [250] }], ["the cap ladder's bud", { bud: [263] }], ['the bounce well', { springs: [275, 282, 24] }],
  ["the larder stair's first bud", { bud: [314] }], ["the larder stair's second", { bud: [332] }], ['the seed stair at her door', { bud: [363, 366] }],
];
for (const [name, cut] of LOCKS) { const C = copy(); let x0 = 0;
  if (cut.bud) { C.moversExtra = C.moversExtra.filter(m => !(m.kind === 'growcap' && cut.bud.some(x => Math.abs(m.x / TS - x) < 0.5 || (m.bx !== undefined && Math.abs(m.bx / TS - x) < 0.5)))); x0 = cut.bud[0]; }
  if (cut.springs) { const [a, b, y] = cut.springs; for (let x = a; x <= b; x++) if (C.grid[y * C.W + x] === T.BOUNCER) C.grid[y * C.W + x] = T.SOLID; x0 = a; }
  const [tx, ty] = target(x0), Rc = reach(C); ok(!Rc.near(tx, ty) && R.near(tx, ty), 'a LOCK: ' + name + ' - without it ' + tx + ',' + ty + ' is out of reach'); }

// ---- THE SPORES THAT HELP ----
const darkBuds = (L.moversExtra || []).filter(m => m.kind === 'growcap' && m.dark), lanterns = at('glowbud');
ok(darkBuds.length >= 4 && darkBuds.every(m => lanterns.some(g => Math.abs(g.x * TS + 8 - (m.x + 16)) < SP.litX && Math.abs((g.y + 1) * TS - (m.y0 + 8)) < SP.litY)), 'every dark bud has a lantern cap in reach (' + darkBuds.length + ' dark buds, ' + lanterns.length + ' lantern caps)');
ok(at('mendpuff').length >= 3 && at('springpuff').length >= 2, 'mend puffs ' + at('mendpuff').length + ', puffballs ' + at('springpuff').length);
let springTiles = 0; for (let i = 0; i < L.grid.length; i++) if (L.grid[i] === T.BOUNCER) springTiles++;
ok(springTiles >= 10, 'bounce caps: ' + springTiles + ' tiles (the teach, the pit, the stalk, the well, the knot cellar)');
ok(at('roller').length >= 2 && at('drone').length >= 1 && at('shaman').length >= 1, 'the signature actors are back: rollers ' + at('roller').length + ', drone ' + at('drone').length + ', shaman ' + at('shaman').length);

// ---- THE ANNOYANCE CUT ----
const DEBUFF = ['spitcap', 'lurker', 'weaver', 'drone', 'spider', 'thorn'], deb = L.ents.filter(e => DEBUFF.includes(e.t));
ok(deb.length >= 8 && deb.length <= 14, 'debuffers cut to ' + deb.length + ' (was 41): ' + DEBUFF.map(t => t + ' ' + deb.filter(e => e.t === t).length).filter(s => !/ 0$/.test(s)).join(', '));
ok(at('lurker').every(e => lanterns.some(g => Math.hypot(g.x - e.x, g.y - e.y) * TS < 76 * 1.3)), 'every lurker stands in a lantern cap\'s light (light it: it is dazzled out of its cap)');
ok(!(L.sleeps && L.sleeps.length) && !L.storm, 'no sleep clouds, no storm');

// ---- SHRINES CLOSE THE EXAMS (A10c) ----
const ends = SECTIONS.slice(0, 4).map(s => s[2]);
ok(checks.length === 4 && checks.slice(0, 3).every((c, i) => c.x <= ends[i] && c.x >= ends[i] - 12) && checks[3].x >= 395 && checks[3].x <= 408, 'a shrine at the end of each of the first three areas, the last at her door past the knot gauntlet (claude/bossheal 10-30: 404, was 356): ' + checks.map(c => c.x).join(' ') + ' vs ends ' + ends.join(' '));

// ---- HER HOLLOW ----
const A = L.arena, seeds = (L.moversExtra || []).filter(m => m.kind === 'growcap' && m.mother && m.seed), kx = SPOREWOOD.mother * TS + 8;
ok(A && A.boss === 'mother' && A.x1 - A.x0 >= 40 * TS, 'her hollow: ' + (A.x1 - A.x0) / TS + ' columns');
for (const pr of ['L', 'R']) { const p = seeds.filter(m => m.pair === pr).sort((a, b) => a.rise - b.rise), [lo, hi] = p, inner = pr === 'L' ? hi.x + hi.w : hi.x;
  ok(p.length === 2 && lo.rise === 40 && hi.rise === 84 && Math.abs(Math.abs(inner - kx) - 40) <= 2 && Math.abs(lo.x - hi.x) === 32, 'her ' + pr + ' seed pair: a low step and a high step side by side, the high one\'s inner edge 40 px off her knot'); }
ok(Math.abs(L.knot.y - (A.floor - MC.knotY)) < 1 && MC.knotUp > MC.knotY && MC.knotDn < MC.knotY, 'her knot over her cap, its plunge band round it');

// ---- B16/B10: every tell marked, answered ----
ok(MC_TELLS.every(m => ('mother|' + m) in MARK), 'every tell of hers is in the marks table: ' + MC_TELLS.join(' '));
ok(['lashTell', 'crushTell', 'bloomTell'].every(m => ANSWER['mother|' + m]), 'her lash, crush and bloom have their answers');

// ---- THE HANDS IN A FAKE WORLD ----
{ const props = [], movers = (L.moversExtra || []).map(m => ({ ...m })), P = { x: 0, y: 0, vx: 0, vy: 0, hp: 50, maxHp: 100, ground: true, dead: false, plunge: false }, keys = { jump: false }, grid = L.grid.slice();
  for (const e of at('glowbud')) props.push({ t: 'glowbud', x: e.x * TS + 8, y: (e.y + 1) * TS, lit: 0, light: { r: 18 } });
  const said = [];
  const ctx = { get L() { return { ...L, grid }; }, TS, T, sfx: {}, props: () => props, movers: () => movers, players: () => [P], enemies: () => [], keys: () => keys, time: () => 0,
    number: (x, y, t) => said.push(t), burst: () => {}, shake: () => {}, cellSet: (x, y, t) => { grid[y * L.W + x] = t; }, tileAt: (x, y) => grid[y * L.W + x], heal: (p, d) => { p.hp = Math.min(p.maxHp, p.hp + d); }, turned: (x, y, w) => said.push(w), text: () => {} };
  const H = makeSporewoodHands(ctx); H.reset();
  /* a mend puff */
  const mp = at('mendpuff')[0]; P.x = mp.x * TS + 8; P.y = (mp.y + 1) * TS; H.update(1 / 60); for (let i = 0; i < 90; i++) H.update(1 / 60);
  ok(P.hp >= 57, 'a mend puff mends (50 -> ' + Math.round(P.hp) + ')');
  /* a puffball: struck, a spring spore; falling onto it throws */
  const pf = at('springpuff')[0], px = pf.x * TS + 8, py = (pf.y + 1) * TS; H.strike({ l: px - 6, r: px + 6, t: py - 12, b: py }); const sp = H.read().springs[0];
  P.x = px; P.y = sp.y - 3; P.vy = 200; P.ground = false; H.update(1 / 60); ok(sp && P.vy < -300, 'a struck puffball hangs a spring spore that throws a hero (vy ' + Math.round(P.vy) + ')');
  /* a seed pair: standing does nothing (main.js asks growsUnder), a blow grows both */
  const door = movers.filter(m => m.pair === 'door'); ok(door.length === 2 && door.every(m => !H.growsUnder(m)), 'a seed cap does not grow under a hero');
  const lo = door.sort((a, b) => a.rise - b.rise)[0]; H.strike({ l: lo.x + 4, r: lo.x + 28, t: lo.y - 12, b: lo.y + 4 }); ok(door.every(m => m.state === 'grow'), 'a blow on one seed cap grows its pair (a stair)');
  /* a dark bud grows only lit */
  const db = movers.find(m => m.dark), near = props.filter(g => Math.abs(g.x - (db.x + 16)) < SP.litX && Math.abs(g.y - (db.y0 + 8)) < SP.litY); H.update(1 / 60); const unlit = H.growsUnder(db);
  for (const g of near) g.lit = 10; H.update(1 / 60); ok(!unlit && H.growsUnder(db), 'a dark bud grows only in a lantern\'s light');
  /* a root knot: a blade clanks FROM ABOVE; a plunge opens it and its door */
  const kn = at('rootknot')[0], kpx = kn.x * TS + 8, kpy = (kn.y + 1) * TS; said.length = 0; P.plunge = false; H.strike({ l: kpx - 8, r: kpx + 8, t: kpy - 10, b: kpy });
  const blade = H.read().knots[0].open; ok(!blade && said.includes(SPW_SAY.above), 'a blade on the root knot is turned (FROM ABOVE)');
  P.x = kpx; P.y = kpy - 8; P.vy = 200; P.plunge = true; H.update(1 / 60); const [dx0, , dy0] = kn.door; ok(H.read().knots[0].open && grid[dy0 * L.W + dx0] === T.AIR, 'a plunge opens the root knot and its door'); }

// ---- HER, IN A FAKE WORLD ----
{ const movers = (L.moversExtra || []).map(m => ({ ...m })), P = { x: 0, y: A.floor, vx: 0, vy: 0, hp: 150, maxHp: 150, st: 100, ground: true, dead: false, plunge: false }, drains = {}, springs = [], adds = [];
  const e = { t: 'mother', x: kx, y: A.floor, w: 28, h: 96, hp: MC.hp, maxHp: MC.hp, mode: 'idle', modeT: 0, phase: 1, alive: true, lashes: [], crushes: [], blooms: [], ward: 0 };
  const ctx = { L, TS, sfx: {}, P: () => P, players: () => [P], enemies: () => adds, movers: () => movers, boss: () => e, PROP: null, number: () => {}, burst: () => {}, shake: () => {},
    damage: (p, x, d) => { p.hp -= d; }, drain: (p, r) => { drains.now = r; }, spring: (x, y, l) => springs.push({ x, y, l }), spawnBrood: (x, y, d) => adds.push({ x, y, d, alive: true, brood: true }) };
  const M = makeMotherCap(ctx);
  ok(M.take(e).mul === MC.take && M.take(e).word === MC_SAY.above && MC.take >= 0.4, 'sealed, a blow lands at ' + MC.take + ' (B15: never nothing) and names her key: ' + MC_SAY.above);
  P.x = kx; P.y = A.floor; P.vy = 200; P.plunge = true; ok(!M.knotHit(P, e), 'a plunge on her floor is not her knot');
  P.y = A.floor - MC.knotY + 4; ok(M.knotHit(P, e) && e.mode === 'open' && M.take(e).mul === MC.openMul, 'a plunge on her knot opens her: x' + MC.openMul);
  for (let i = 0; i < Math.ceil(MC.openT * 60) + 2; i++) M.update(e, 1 / 60); ok(e.mode !== 'open' && e.ward > 0 && M.take(e).word === MC_SAY.ward && !M.knotReady(e), 'after her window, a told ward (B3)');
  e.ward = 0; e.mode = 'idle'; e.modeT = 0; P.x = kx - 60; P.y = A.floor; P.plunge = false; e.last = null; e.since = { lash: 0, crush: 0, wither: 0, bloom: 99 };
  let saw = null; for (let i = 0; i < 300 && !saw; i++) { M.update(e, 1 / 60); if (e.mode === 'bloomTell') saw = e.blooms[0]; }
  if (saw) M.strike({ l: saw.x - 4, r: saw.x + 4, t: saw.y - 4, b: saw.y + 4 }); ok(saw && springs.length === 1 && !e.blooms.length, 'a struck spore bloom becomes a spring spore');
  ok(M.broodDied({ x: 0, y: 0 }, true) && springs.length === 2 && !M.broodDied({ x: 0, y: 0 }, false), 'her brood: a heavy blow bursts one into a spring spore, a light one does not');
  e.hp = Math.floor(MC.hp * MC.phase2) - 1; e.mode = 'idle'; for (let i = 0; i < 3; i++) M.update(e, 1 / 60); ok(e.phase === 2 && e.net, 'under half her bar the net wakes (the arena changes: P2)');
  const hi = movers.find(m => m.mother && m.pair === 'L' && m.rise === 84); hi.state = 'up'; P.x = hi.x + 16; P.y = hi.y; e.mode = 'idle'; e.modeT = 0; e.last = 'crush'; e.since = { wither: 99 };
  let wt = null; for (let i = 0; i < 200 && !wt; i++) { M.update(e, 1 / 60); if (e.mode === 'witherTell') wt = e.witherCap; } for (let i = 0; i < 80; i++) M.update(e, 1 / 60);
  ok(wt === hi && hi.state === 'wither', 'in her second phase she withers a cap you grew (told first)');
  e.net.ph = 'tell'; e.net.t = 0.001; P.ground = true; P.onMover = null; P.y = A.floor; P.x = kx - 100; e.mode = 'phaseRise'; e.modeT = 5; for (let i = 0; i < 3; i++) M.update(e, 1 / 60); ok(e.net.ph === 'live' && drains.now === MC.net.drain, 'the net stings a hero on her floor (a drain, A13)'); }

console.log(bad ? 'sporewood2: ' + bad + ' FAIL' : 'sporewood2: all green');
process.exit(bad ? 1 : 0);
