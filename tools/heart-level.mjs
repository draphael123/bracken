/* tools/heart-level.mjs - THE HEART OF THE MOUNTAIN's own check (claude/heartlevel, the OPUS GREYBOX, 2026-11-05). NODE ONLY: no page, no port, no Chrome (~2 s).
   What it proves, from the built level and the REAL hands (src/heart-mountain-hands.js driven with a stub world):
     A  THE ROAD: the 'heart' and 'heartsky' rows, hidden (art before live); scene A heart > heartsky and scene B heartsky > breach (chain rows); the sky fight's checkpoint;
        the TIER / TIER_BOSS / ACTS_LATE rows; the map's two node rows (THE BREACH is scene B's 'to').
     B  THE GEOMETRY: every crust joined to rock at both ends and lying on a fire pool; every heart vent's column clear; the caldera = the drakelab room's geometry (32 tiles,
        the seal in the middle, the two ledges outside the P2 ring), and NOTHING ELSE in it (no pillar, vent, raft or chain: no level-made boss opening); two shrines.
     C  THEME: no wood (plank, net, crate, palisade, reed), no goblin, no foe outside the roster; one new foe (the leaper).
     D  THE BEAT: the clock's period by zone, the tell before every beat, the crust melts on it and cools after; a heart vent blows only in the surge; no beat in the caldera.
     E  THE WARD: struck, its crusts hold through a beat; struck in a surge, they harden at once; the hold waits a surge out; then it is spent; a spent ward does nothing.
     F  THE LOCK: the 40-tile channel - no hero's sprint crosses it between two beats; every hero's run crosses it on one hold.
     G  THE LEAPER: rises on the tell under a hero over its channel, leaps on the beat, lands on footing or falls back, never strays from its magma, sinks when its footing melts.
     H  EVERY HERO reaches the caldera's trigger with his own legs (src/reachcore.js opts.hero), on the rides the fill follows (the heart vents).
   node tools/heart-level.mjs */
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { HEART, ZONES, HEART_NODES, DC_X, ARCS } from '../src/heart-mountain.js';
import { makeHeartHands, HM, HM_SAY } from '../src/heart-mountain-hands.js';
import { DC } from '../src/drake-caldera.js';
import { FD } from '../src/fire-drake.js';
import * as TRM from '../src/transitions.js';
import * as HS from '../src/heart-scenes.js';
import { floodReach } from '../src/reachcore.js';
import { heroJumps } from '../src/reach-hero.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';

const TS = 16; let fails = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { fails++; console.log('  FAIL ' + m); } else if (process.argv.includes('--v')) console.log('  ok   ' + m); };
const src = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const row = LEVELS.find(l => l.id === 'heart'), skyRow = LEVELS.find(l => l.id === 'heartsky');
const L = row.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];

/* ---------- A. THE ROAD ---------- */
ok(!!row && row.hidden === true && row.needs === 'sealedpyramid', "LEVELS: 'heart' is HIDDEN (art before live) and needs the placeholder 'sealedpyramid' (its real predecessor, V2 THE LAVA TUBES, is not built)");
ok(!!skyRow && skyRow.hidden === true && !!skyRow.build().skyMount, "LEVELS: 'heartsky' is hidden and is the drake's-back arena (skyMount)");
const A = TRM.entryFor('heart'), B = TRM.entryFor('heartsky');
ok(!!A && A.to === 'heartsky' && A.scene === 'seal' && A.chain === true, 'scene A: heart > heartsky, "the seal breaks", a chain row (never dropped)');
ok(!!B && B.to === 'breach' && B.scene === 'escape' && B.chain && B.mapOnly && B.endOnMap, 'scene B: heartsky > breach, "the escape", a chain row that ends ON THE MAP');
ok(!!TRM.entryFor('drakelab') && !!TRM.entryFor('skylab'), 'the lab rows (drakelab > skylab > breach) still stand for bossLab and the page tools');
const cp = HS.checkpointOf('heartsky'); ok(!!cp && cp.freshFight && cp.refillFlasks && !cp.replaysDrake, "the sky fight's checkpoint is mount-up: a fresh fight, flasks refilled, never the drake again");
const main = src('main.js');
ok(/const TIER = \{ heart: 3\.4, heartsky: 3\.4/.test(main) && /const TIER_BOSS = \{ heart: 2\.8, heartsky: 2\.8/.test(main), 'main.js: TIER / TIER_BOSS rows for heart and heartsky (the drakelab / skylab numbers)');
ok(/levels: \['drakelab', 'skylab', 'heart', 'heartsky'\]/.test(src('foe-react.js')), "foe-react.js: act 7 THE FIRE MOUNTAIN lists heart and heartsky");
ok(HEART_NODES.some(nd => nd.id === 'heart' && nd.levelId === 'heart') && HEART_NODES.some(nd => nd.id === B.to), "the map's node rows: THE HEART, and THE BREACH (scene B's 'to') - for the map lane's mountain / demon sheet");
ok(/\(L\.drakeLab \|\| L\.caldKit\)/.test(main) && L.caldKit === true, 'it wears the caldera kit (basalt tiles, the caldera backdrop) - no default grass or timber');

/* ---------- B. THE GEOMETRY ---------- */
const crust = L.hmCrust, pools = L.pools.filter(p => p.fire);
ok(crust.length >= 10 && L.hmWards.length === 5, crust.length + ' crust spans, ' + L.hmWards.length + ' ward-stones');
for (const c of crust) {
  const crustAt = (x, y) => crust.some(o => o !== c && o.y === y && x >= o.x0 && x <= o.x1);   /* a channel's spans abut: the run is joined at its two ends */
  let a = c.x0 - 1; while (crustAt(a, c.y)) a--; let b = c.x1 + 1; while (crustAt(b, c.y)) b++;
  ok(at(a, c.y) === T.SOLID && at(b, c.y) === T.SOLID, 'crust ' + c.id + ' (' + c.x0 + '-' + c.x1 + ', row ' + c.y + ') - its run ' + (a + 1) + '-' + (b - 1) + ' is joined to rock at both ends');
  let cells = true; for (let x = c.x0; x <= c.x1; x++) if (at(x, c.y) !== T.ONEWAY) cells = false; ok(cells, 'crust ' + c.id + ' is laid one-way');
  ok(pools.some(p => p.x0 <= c.x0 * TS && p.x1 >= (c.x1 + 1) * TS && p.y > c.y * TS && p.y - c.y * TS <= 2 * TS && p.bottom > p.y), 'crust ' + c.id + ' lies on the magma (a fire pool right under it, with a bed)');
}
for (const w of L.hmWards) { ok(w.holds.every(id => crust.some(c => c.id === id)), 'ward ' + w.id + ' holds real crusts'); ok(at(w.x, w.f + 1) === T.SOLID && at(w.x, w.f) === T.AIR, 'ward ' + w.id + ' stands on rock'); }
const vents = L.ents.filter(e => e.t === 'vent' && e.heart);
for (const v of vents) { const top = v.y + 1 - Math.round(v.h / TS); let clear = true; for (let y = top; y <= v.y; y++) for (const dx of [-1, 0, 1]) if (at(v.x + dx, y) === T.SOLID) clear = false;
  ok(clear && at(v.x, v.y + 1) === T.SOLID, 'heart vent @' + v.x + ' stands on rock and its column (rows ' + top + '-' + v.y + ') is clear'); }
ok(vents.length === 4, '4 heart vents');
const Ar = L.arena, sealTiles = Ar.seal / TS;
ok(Ar.boss === 'firedrake' && (DC_X.x1 - DC_X.x0 + 1) === (DC.x1 - DC.x0 + 1) && DC_X.x1 - DC_X.x0 + 1 === 32, "the caldera: THE FIRE DRAKE's arena, 32 tiles, the drakelab room's geometry");
ok(Math.abs(sealTiles - (DC_X.x0 + DC_X.x1 + 1) / 2) < 0.01, 'the seal is in the middle of the caldera floor');
const p2ring = FD.ring ? (Array.isArray(FD.ring) ? FD.ring[1] : FD.ring.p2 || FD.ring[2]) : 145;
for (const [a, b] of Ar.ledges) { const near = Math.min(Math.abs(a - Ar.seal), Math.abs(b - Ar.seal)); ok(near > (p2ring || 145), 'a caldera ledge stands outside the P2 ring (' + Math.round(near) + ' px from the seal > ' + (p2ring || 145) + ')'); }
{ let extra = []; const ledgeCells = new Set(Ar.ledgeTiles.flatMap(([a, b, r]) => Array.from({ length: b - a + 1 }, (_, i) => (a + i) + ',' + r)));
  for (let y = 4; y < DC_X.floor; y++) for (let x = DC_X.x0; x <= DC_X.x1; x++) if (at(x, y) !== T.AIR && !ledgeCells.has(x + ',' + y)) extra.push(x + ',' + y);
  ok(!extra.length, 'NO PILLAR-MADE OPENING: nothing in the caldera but its floor and the two ledges' + (extra.length ? ' (found ' + extra.slice(0, 6).join(' ') + ')' : ''));
  const inArena = e => e.x >= DC_X.x0 && e.x <= DC_X.x1;
  ok(!L.ents.some(e => inArena(e) && ['vent', 'mover', 'hmchain', 'hmward', 'hmcrust', 'leaper'].includes(e.t)), 'no vent, raft, chain, ward, crust or leaper in the caldera'); }
ok(L.ents.filter(e => e.t === 'check').length === 2, 'TWO shrines (Daniel: fewer) - the drake\'s own is set by the split seal when it is beaten');
ok(L.ents.some(e => e.t === 'check' && e.x < DC_X.wallL && e.x > DC_X.wallL - 8), 'shrine two stands at the caldera\'s door (the drake\'s retry point)');

/* ---------- C. THEME ---------- */
{ const wood = [T.PLANK, T.NET, T.CRATE, T.PALISADE, T.REED, T.WEB].filter(t => t !== undefined); let bad = 0; for (let i = 0; i < L.grid.length; i++) if (wood.includes(L.grid[i])) bad++;
  ok(!bad, 'NO WOOD: no plank, net, crate, palisade, reed or web tile (theme fit: basalt and magma)'); }
const ROSTER = new Set(['wight', 'bonearcher', 'husk', 'emberwisp', 'leaper', 'firedrake']);
const foes = L.ents.filter(e => !['coin', 'sign', 'check', 'silver', 'vent', 'hmcrust', 'hmward', 'hmchain', 'mover'].includes(e.t));
ok(foes.every(e => ROSTER.has(e.t)), 'the roster is the dead, the wisps, the leaper and the drake: ' + [...new Set(foes.map(e => e.t))].join(', '));
ok(!foes.some(e => /gob|goblin|shaman|hearth/i.test(e.t)), 'NO GOBLINS (far past the Goblin Queen)');
ok(/heart: \['leaper'\]/.test(readFileSync(new URL('./one-new-foe.mjs', import.meta.url), 'utf8')), 'one-new-foe: heart brings exactly the leaper');
ok(Object.values(ARCS).every(a => a.teach && a.exam || a.teach && a.test), 'the rule\'s arc: every mechanic is taught and tested/examined');

/* ---------- the stub world for D-G: the REAL hands on the built level ---------- */
function world(heroAt) {
  const lv = LEVELS.find(l => l.id === 'heart').build(); let time = 0; const hero = { x: heroAt[0], y: heroAt[1], dead: false, hitSet: new Set() }; const enemies = [];
  const said = [];
  const ctx = { L: lv, TS, T, time: () => time, players: () => [hero], hero: () => hero, enemies: () => enemies, number: (x, y, t) => said.push(t), cellSet: (x, y, t) => { lv.grid[y * lv.W + x] = t; },
    footAt: (tx, ty) => { const t = lv.grid[ty * lv.W + tx]; return t === T.SOLID || t === T.ONEWAY; }, solidAt: (tx, ty) => lv.grid[ty * lv.W + tx] === T.SOLID, hitOnce: o => { if (hero.hitSet.has(o)) return false; hero.hitSet.add(o); return true; } };
  const H = makeHeartHands(ctx); H.reset();
  const step = (secs, f) => { for (let i = 0; i < Math.round(secs * 60); i++) { time += 1 / 60; H.update(1 / 60); for (const e of enemies) H.leaper(e, 1 / 60); if (f) f(time); } };
  return { lv, H, hero, enemies, step, said, get time() { return time; } };
}
const feetY = f => (f + 1) * TS;

/* ---------- D. THE BEAT ---------- */
{ const W1 = world([5 * TS, feetY(21)]); let beats = 0, tells = 0, lastBeat = -1, gaps = [], tellBefore = true, wasTell = false, wasSurge = false;
  W1.step(30, t => { const r = W1.H.read(); if (r.telling && !wasTell) tells++; if (r.surging && !wasSurge) { beats++; if (lastBeat > 0) gaps.push(t - lastBeat); lastBeat = t; if (!wasTell) tellBefore = false; } wasTell = r.telling; wasSurge = r.surging; });
  ok(beats === 4 && gaps.every(g => Math.abs(g - 7.0) < 0.05), 'THE THROAT beats every 7.0 s (' + beats + ' beats in 30 s, gaps ' + gaps.map(g => g.toFixed(2)).join('/') + ')');
  ok(tellBefore && tells >= beats, 'every beat is TOLD first (' + HM.beat.tell + ' s of glow and rumble)');
  const W2 = world([300 * TS, feetY(31)]); let b2 = 0, prev = false; W2.step(20, () => { const s = W2.H.read().surging; if (s && !prev) b2++; prev = s; });
  ok(b2 === 4, "THE SEAL'S DOOR beats every 4.5 s - the eruption builds (" + b2 + ' beats in 20 s)');
  const W3 = world([(DC_X.x0 + 4) * TS, feetY(31)]); let b3 = 0; W3.step(20, () => { if (W3.H.read().surging) b3++; }); ok(b3 === 0, 'no beat in the caldera (the drake\'s own vents)');
  const W4 = world([20 * TS, feetY(25)]); const a1 = () => W4.lv.grid[26 * W4.lv.W + 28]; let meltSeen = false, cooledAfter = false, ventOnlySurge = true;
  const vent = W4.lv.ents.find(e => e.t === 'vent' && e.heart);
  W4.step(16, () => { const r = W4.H.read(); if (r.surging && a1() === T.AIR) meltSeen = true; if (meltSeen && !r.surging && a1() === T.ONEWAY) cooledAfter = true; if (W4.H.ventOn(vent) !== r.surging) ventOnlySurge = false; });
  ok(meltSeen && cooledAfter, 'crust a1 melts on the beat (air) and cools after the surge (one-way again)');
  ok(ventOnlySurge, 'a heart vent blows in the surge and only then'); }

/* ---------- E. THE WARD ---------- */
{ const w1 = L.hmWards.find(w => w.id === 'w1'), wx = w1.x * TS + 8, wy = (w1.f + 1) * TS, box = { l: wx - 6, r: wx + 6, t: wy - 20, b: wy - 2 };
  const W = world([(w1.x - 1) * TS, wy]); const cell = () => W.lv.grid[42 * W.lv.W + 120];
  W.step(0.5); W.H.strike(box); let meltedWhileHeld = false, holdEnd = null;
  W.step(HM.ward.hold - 0.6, () => { if (cell() === T.AIR) meltedWhileHeld = true; });
  ok(!meltedWhileHeld && W.H.read().beats >= 1, 'struck, the ward holds crust c1a through ' + W.H.read().beats + ' beat(s) (' + HM.ward.hold + ' s)');
  W.step(3, t => { if (holdEnd === null && !W.H.read().wards.find(w => w.id === 'w1').holding) holdEnd = W.H.read().surging; });
  ok(holdEnd === false, 'a hold never ends inside a surge (it waits the surge out)');
  ok(W.H.read().wards.find(w => w.id === 'w1').spent || W.H.read().wards.find(w => w.id === 'w1').holding === false, 'then the ward is spent');
  W.hero.hitSet.clear(); W.H.strike(box); ok(!W.H.read().wards.find(w => w.id === 'w1').holding, 'a SPENT ward does nothing when struck');
  const V = world([(w1.x - 1) * TS, wy]); let hard = null; V.step(12, () => { if (hard === null && V.H.read().surging && V.lv.grid[42 * V.lv.W + 120] === T.AIR) { V.hero.hitSet.clear(); V.H.strike(box); hard = V.lv.grid[42 * V.lv.W + 120]; } });
  ok(hard === T.ONEWAY, 'struck DURING a surge, its melted crusts HARDEN AT ONCE'); }

/* ---------- F. THE LOCK ---------- */
{ const ch = crust.filter(c => ['c1a', 'c1b', 'c1c', 'c1d'].includes(c.id)), x0 = Math.min(...ch.map(c => c.x0)), x1 = Math.max(...ch.map(c => c.x1)), lenPx = (x1 - x0 + 1) * TS;
  const per = ZONES.find(([a, b]) => x0 >= a && x1 <= b)[2], solidT = per - HM.beat.surge, body = 16;
  const speeds = HERO_MOVE_IDS.map(h => ({ h, sprint: heroJumps(h).run(24).vx, run: heroJumps(h).run(4).vx }));
  const fast = speeds.reduce((a, b) => (b.sprint > a.sprint ? b : a)), slow = speeds.reduce((a, b) => (b.run < a.run ? b : a));
  const fastT = (lenPx - body) / fast.sprint, slowT = (lenPx + (x0 - L.hmWards.find(w => w.id === 'w1').x) * TS) / slow.run;
  ok(fastT > solidT + 0.3, 'THE LOCK: ' + (x1 - x0 + 1) + ' tiles of crust - the fastest sprint (' + fast.h + ', ' + fast.sprint.toFixed(0) + ' px/s) needs ' + fastT.toFixed(2) + ' s, the crust stands ' + solidT.toFixed(1) + ' s between two beats: no run crosses it');
  ok(slowT < HM.ward.hold - 0.5, 'ON A HOLD: the slowest run (' + slow.h + ', ' + slow.run.toFixed(0) + ' px/s) crosses from the ward in ' + slowT.toFixed(2) + ' s < the hold ' + HM.ward.hold + ' s');
  ok(L.hmWards.find(w => w.id === 'w1').holds.length === ch.length, 'ward w1 holds the whole channel'); }

/* ---------- G. THE LEAPER ---------- */
{ const W = world([74 * TS, feetY(22)]); const e = { t: 'leaper', x: 75 * TS + 8, y: feetY(22), alive: true, face: -1 }; W.enemies.push(e);
  const modes = new Set(); let maxUp = 0, strayed = false, home = null; let toldBeforeLeap = true, last = 'under', backUnder = false;
  W.step(20, () => { modes.add(e.mode); if (e.home) { home = e.home; if (e.x < e.home.x0 - 3 * TS - 1 || e.x > e.home.x1 + 3 * TS + 1) strayed = true; maxUp = Math.max(maxUp, e.home.y - e.y); }
    if (e.mode === 'leap' && last === 'under') toldBeforeLeap = false; if (e.mode === 'under' && last !== 'under' && last !== 'leapTell') backUnder = true; last = e.mode; });
  ok(modes.has('leapTell') && modes.has('leap'), 'the leaper rises under a hero on the tell, leaps on the beat (' + [...modes].join(' > ') + ')');
  ok(toldBeforeLeap, 'it never leaps untold (always leapTell first)');
  ok(maxUp > 40 && maxUp < 140, 'its leap clears the crust (' + Math.round(maxUp) + ' px over the magma)');
  ok(!strayed && !!home, 'it never strays from its magma (3 tiles past the channel at most)');
  ok(backUnder, 'after its leap it falls back into the magma (the crust it would land on melted in the surge) and goes back under (' + [...modes].join(' > ') + ')');
  /* on a HELD crust it lands and thrashes (the place to fight it) */
  { const W4 = world([74 * TS, feetY(22)]); const e4 = { t: 'leaper', x: 75 * TS + 8, y: feetY(22), alive: true, face: -1 }; W4.enemies.push(e4);
    W4.lv.hmWards.push({ id: 'tB', x: 69, f: 22, holds: W4.lv.hmCrust.filter(c => c.ch === 'B').map(c => c.id) });   /* a test ward over channel B's crusts */
    W4.H.reset(); const wx = 69 * TS + 8, wy = 23 * TS; W4.step(5.0); W4.H.strike({ l: wx - 6, r: wx + 6, t: wy - 20, b: wy - 2 }); const m4 = new Set(); W4.step(4, () => m4.add(e4.mode));
    ok(m4.has('leap') && m4.has('thrash'), 'over a HELD crust it lands and THRASHES there - the place to cut it (' + [...m4].join(' > ') + ')');
    const m5 = new Set(); W4.step(4, () => m5.add(e4.mode)); ok(m5.has('flop') && m5.has('under'), 'with a hero at its jaw it snaps (biteTell > bite), but never stays out past ' + HM.leaper.out + ' s: it flops back in (' + [...m5].join(' > ') + ')'); }
  const W2 = world([60 * TS, feetY(16)]); const e2 = { t: 'leaper', x: 75 * TS + 8, y: feetY(22), alive: true }; W2.enemies.push(e2); const m2 = new Set(); W2.step(20, () => m2.add(e2.mode));
  ok(!m2.has('leap'), 'with no hero over its channel it stays under (it does not leap at nothing)');
  const W3 = world([74 * TS, feetY(22)]); const e3 = { t: 'leaper', x: 74 * TS, y: feetY(22), alive: true }; W3.enemies.push(e3); W3.step(0.1);
  e3.mode = 'thrash'; e3.modeT = 5; e3.y = 23 * TS; W3.lv.grid[23 * W3.lv.W + 74] = T.AIR; W3.step(1.5); ok(e3.mode === 'under' || e3.mode === 'fall', 'its footing melts: it drops back into the magma (' + e3.mode + ')');
  ok(/'leaper\|leapTell': '!!'/.test(src('marks.js')) && /'leaper\|biteTell': '!'/.test(src('marks.js')), 'its tells are marked (src/marks.js: leapTell !!, biteTell !)');
  ok(/BODY_BLOW = new Set\(\['leaper'/.test(main) && /AMPHIB = new Set\(\['leaper'/.test(main), 'its leap and bite are body blows (BODY_BLOW); the magma does not burn it (AMPHIB)');
  ok(HM_SAY.leaper && /leaper: 1\.5/.test(src('threat.js')), 'it has a line and a threat row'); }

/* ---------- H. EVERY HERO ---------- */
{ const trig = Math.floor(L.arena.trigger / TS), feet = DC_X.floor - 1;
  for (const h of HERO_MOVE_IDS) { const R = floodReach(L, T, { rides: true, hero: h }); const got = [-1, 0, 1, 2].some(dx => R.seen.has(R.key(trig + dx, feet)));
    ok(got, h + ' reaches the caldera with his own legs (the heart vents ridden)'); }
  const R5 = floodReach(L, T, { rides: true, across: 5 }); ok(L.ents.filter(e => e.t === 'check').every(c => [-1, 0, 1].some(dx => R5.seen.has(R5.key(c.x + dx, c.y)))), 'every shrine is stood at with a real jump (5 columns)'); }

console.log((fails ? 'FAIL' : 'ok  ') + ' heart-level  ' + (n - fails) + '/' + n + ' checks' + (fails ? ' (' + fails + ' failed)' : '') + ': the road, the geometry, the theme, the beat, the ward, the lock, the leaper, every hero');
if (fails) process.exit(1);
