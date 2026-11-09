// tools/airship.mjs - THE DESERT AIRSHIP's node proofs (claude/airship, 11-06). Node only: no page, no port, no Chrome.
//   node tools/airship.mjs          flag both ways, the level + its lint, the ship (stoke / vent / bands / no soft-lock), the cold (drain floor), the keel brush,
//                                   the hands on a fake world, the wyrmling (element table, tells, cleanse), THE THUNDER WYRM (tells, the lure, the floor, phases)
//   node tools/airship.mjs --duel   + THE TOY DUEL: a scripted bot vs the pure fight (n seeds) - a TUNING GUESS only, not a win band (the tune lane runs boss-rates)
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const DUEL = process.argv.includes('--duel');
const { install } = await import('./node-canvas.mjs'); install();

/* ---- 1. THE FLAG, both ways (child processes: level.js reads the env once) ---- */
const probe = env => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e',
  "const { install } = await import('./tools/node-canvas.mjs'); install(); const { LEVELS } = await import('./src/level.js'); const r = LEVELS.find(l => l.id === 'airship'); console.log(JSON.stringify({ n: LEVELS.length, last: LEVELS[LEVELS.length - 1].id, row: r ? { needs: r.needs, hidden: !!r.hidden } : null }));"],
  { env: { ...process.env, AS: env, GD: '' }, encoding: 'utf8' }).trim().split('\n').pop());
const off = probe(''), on = probe('1');
ok(!off.row, 'flag OFF: no airship row (LEVELS is the base array)');
ok(on.row && on.last === 'airship' && on.n === off.n + 1, 'flag ON: the row is appended LAST (no index moves)');
ok(on.row.hidden === true, 'flag ON: hidden (no map node) while AS_SHIPS is false');
ok(on.row.needs === 'sealedpyramid', "flag ON: needs the road's last desert level that exists (the Sealed Pyramid until the King's Pyramid merges)");

process.env.AS = '1';
const LV = await import('../src/level.js'), { T, TS } = LV;
const AS = await import('../src/airship.js'), WL = await import('../src/wyrmling.js'), TW = await import('../src/thunder-wyrm.js'), RI = await import('../src/route-insert.js');
const { makeAirshipHands } = await import('../src/airship-hands.js'); const { makeDrains } = await import('../src/drain.js');
ok(AS.AS_SHIPS === false, 'AS_SHIPS false (art before live)');
const ri = RI.ROAD_INSERTS.find(i => i.id === 'airship');
ok(ri && ri.after === 'kingspyramid' && ri.alt === 'sealedpyramid' && ri.before === null && ri.live === false, 'route-insert: the airship ends the road after the King\'s Pyramid (alt the Sealed Pyramid), not live');
{ const rows = [{ id: 'sealedpyramid' }, { id: 'airship', needs: null }]; RI.applyInserts(rows, [{ ...ri, live: true }]); ok(rows[1].needs === 'sealedpyramid', 'route-insert: live with no King\'s Pyramid row -> hangs off its alt');
  const rows2 = [{ id: 'sealedpyramid' }, { id: 'kingspyramid' }, { id: 'airship' }]; RI.applyInserts(rows2, [{ ...ri, live: true }]); ok(rows2[2].needs === 'kingspyramid', 'route-insert: live with the King\'s Pyramid -> needs it');
  ok(RI.roadMigrate({ sealedpyramid: { cleared: true } }, [{ ...ri, live: true }]).length === 0, 'route-insert: a road\'s END needs no migration'); }

/* ---- 2. THE LEVEL ---- */
const L = AS.buildAirship({ T, TS });
const lint = AS.lintAirship(L, T); ok(lint.length === 0, 'lintAirship: ' + lint.join('; '));
ok(L.W >= 420 && L.W <= 440, 'about 420 columns (' + L.W + ')');
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x); ok(checks.length === 2, 'the start + two shrines (' + checks + ')');
{ const gaps = [checks[0], checks[1] - checks[0], L.arena.x0 / TS - checks[1]]; ok(gaps.every(g => g <= 240), 'shrine gaps ' + gaps + ' (<= 240: fewer checkpoints, matching the dune\'s 199/180/153)'); }
ok(L.ents.filter(e => e.skyRaider).every(e => ['cutthroat', 'slinger', 'archer', 'shield'].includes(e.t)), 'sky raiders are existing bandit AIs (reskin only: cutthroat, slinger, archer, the shield)');
ok(L.ents.filter(e => e.t === 'shield').every(e => e.cnSkin === 'shieldguard'), "every shield is the gorge bandit's SHIELD GUARD skin (the bare 'shield' is the helmed goblin)");
ok(!L.ents.some(e => /gob/i.test(e.t + ' ' + (e.cnSkin || '') + ' ' + (e.skin || ''))), 'no goblin on the airship (ents)');
ok(!/\b(log|logs|timber|wooden)\b/i.test(readFileSync('src/airship.js', 'utf8').replace(/generic wood/gi, '')), 'no generic wood/logs in the level file (a lacquered, brass-banded hull)');
for (const f of ['airship', 'airship-hands', 'wyrmling', 'thunder-wyrm']) ok(!/(^|[-_.])(ad|ads|admiral|banner|track|pixel|promo|analytics)([-_.]|$)/.test(f) && !/ad-?insert/.test(f), 'filename ' + f + ' is clean vs the ad-block lists');
/* platforming beats (A14): >= 5 required pieces in each section, >= 24 tiles */
const beatsIn = (x0, x1) => { let k = 0; for (const b of L.bandDecks) if (b.x0 >= x0 && b.x1 <= x1) k++;
  for (let x = x0; x <= x1; x++) { let c = false; for (let y = 0; y < L.H; y++) if (L.grid[y * L.W + x] === T.CLIMB) c = true; if (c && (x === x0 || ![...Array(L.H).keys()].some(y => L.grid[y * L.W + x - 1] === T.CLIMB))) k++; }
  k += L.zipLines.filter(z => z.x0 / TS >= x0 && z.x0 / TS <= x1).length + L.moversExtra.filter(m => m.px / TS >= x0 && m.px / TS <= x1).length + L.airship.stations.filter(s => s.kind === 'vent' && s.x >= x0 && s.x <= x1).length; return k; };
for (const p of L.platforming) { const k = beatsIn(p.x0, p.x1); ok(k >= 5 && p.x1 - p.x0 >= 24, p.why + ': ' + k + ' required beats over ' + (p.x1 - p.x0) + ' tiles'); }

/* ---- 3. THE SHIP ---- */
const st = (ids) => ids.map((id, i) => ({ id, x: i * 40, y: 0, kind: 'stoke' }));
{ const s = AS.newShip(st(['a', 'b'])); const step = (t) => { const ev = []; for (let i = 0; i < t * 60; i++) ev.push(...AS.shipStep(s, 1 / 60)); return ev; };
  ok(AS.band(s.alt) === 'low', 'the ship starts LOW (at the dock)');
  let r = null; for (let i = 0; i < 60 && !r; i++) r = AS.holdAt(s, s.stations[0], 1 / 60); ok(r === 'stoked', 'a held stoke fires inside ' + AS.STOKE.hold + ' s');
  step(4); ok(AS.band(s.alt) === 'mid', 'one burner: MID (' + s.alt.toFixed(2) + ')');
  r = null; for (let i = 0; i < 60 && !r; i++) r = AS.holdAt(s, s.stations[1], 1 / 60); const ev = step(4); ok(s.bands.high && ev.some(v => v.ev === 'high'), 'two burners: HIGH inside ~6 s');
  step(AS.STOKE.fuel); ok(s.bands.low && s.alt === 0, 'burners out: she settles LOW and stays (no soft-lock) - alt ' + s.alt);
  AS.holdAt(s, s.stations[0], 1); AS.holdAt(s, s.stations[1], 1); step(7); ok(s.bands.high, 're-stoked: HIGH again');
  const v = AS.newShip([...st(['a', 'b']), { id: 'v', x: 0, y: 0, kind: 'vent' }]); v.stations[0].fuel = v.stations[1].fuel = 20; for (let i = 0; i < 600; i++) AS.shipStep(v, 1 / 60); ok(v.bands.high, 'vent test: HIGH first');
  let vr = null; for (let i = 0; i < 60 && !vr; i++) vr = AS.holdAt(v, v.stations[2], 1 / 60); ok(vr === 'vented' && AS.lift(v) === 0, 'THE VENT dumps every burner');
  let t = 0; while (!v.bands.low && t < 20) { AS.shipStep(v, 1 / 60); t += 1 / 60; } ok(v.bands.low && t <= 6.5, 'vented: LOW in ' + t.toFixed(1) + ' s (told, slow, ~6 s)');
  /* hysteresis: an altitude parked on the HIGH edge does not flicker */
  const h = AS.newShip(st(['a'])); h.alt = AS.ALT.high; h.bands.high = true; h.bands.low = false; let flips = 0; for (let i = 0; i < 120; i++) { h.alt = AS.ALT.high - 0.02 * Math.sin(i); flips += AS.shipStep(Object.assign(h, { stations: [{ id: 'a', kind: 'stoke', fuel: 99, lift: AS.ALT.high }] }), 0).length; } ok(flips === 0, 'a band edge holds (hysteresis): ' + flips + ' flips'); }
/* ---- 4. THE COLD (src/drain.js, the 2nd source) ---- */
{ const hero = { hp: 100, maxHp: 100 }, D = makeDrains({ players: () => [hero], take: (pp, m) => { pp.hp -= m; } }), c = { v: 0 };
  let full = 0; for (let i = 0; i < 60 * 200; i++) { const r = AS.coldStep(c, 1 / 60, { high: true, warm: false }); if (r > 0) { full = full || i / 60; D.set(hero, 'cold', r, { floor: AS.COLD.floor }); } D.step(1 / 60); }
  ok(Math.abs(full - 1 / AS.COLD.fill) < 0.2, 'the cold bar fills in ' + full.toFixed(1) + ' s at HIGH before it bites');
  ok(hero.hp === AS.COLD.floor, 'the cold drains to the floor and never kills (hp ' + hero.hp + ' after 200 s HIGH)');
  for (let i = 0; i < 120; i++) AS.coldStep(c, 1 / 60, { high: true, warm: true }); ok(c.v < 0.01 && AS.coldStep(c, 0, { high: true, warm: true }) === 0, 'warmth (a stoked burner / a brazier) refills: the bar empties in < 2 s, no drain');
  const c2 = { v: 1 }; ok(AS.coldStep(c2, 1 / 60, { high: true, warm: false }) > 0 && AS.coldStep({ v: 1 }, 1 / 60, { high: false, warm: false }) === 0, 'the drain only runs HIGH'); }
/* ---- 5. THE KEEL BRUSH ---- */
{ const z = { ph: 'rest', t: AS.BRUSH.rest }; let tell = -1, hit = -1; for (let i = 0; i < 600; i++) { const e = AS.brushStep(z, 1 / 60, true); if (e === 'tell' && tell < 0) tell = i; if (e === 'hit' && hit < 0) hit = i; }
  ok(tell >= 0 && hit > tell && (hit - tell) / 60 >= AS.BRUSH.tell - 0.02, 'LOW: the brush is told ' + ((hit - tell) / 60).toFixed(2) + ' s before it lands');
  const z2 = { ph: 'rest', t: 0 }; let any = false; for (let i = 0; i < 600; i++) any = any || !!AS.brushStep(z2, 1 / 60, false); ok(!any, 'MID/HIGH: the brush never fires'); }

/* ---- 6. THE HANDS ON A FAKE WORLD (the level's own stations and bands) ---- */
const fakeWorld = () => {
  const Lw = AS.buildAirship({ T, TS }), grid = Lw.grid, says = [], hits = [];
  const P = { x: 0, y: 0, ground: true, hp: 300, maxHp: 300, st: 100, maxSt: 100, dodge: 0, atk: -1, dead: false, w: 10, h: 20 };
  const keys = {}; let drainRate = 0;
  const ctx = { get L() { return Lw; }, players: [P], TS, T, EHP: {}, sfx: {}, hero: () => P, enemies: () => [], time: () => 0, keys: () => keys, VW: () => 400, VH: () => 240, boss: null, bossActive: false,
    tileAt: (x, y) => grid[y * Lw.W + x], cellSet: (x, y, t) => { grid[y * Lw.W + x] = t; }, number: (x, y, t) => says.push(t), text: () => {},
    damagePlayer: (x, d, o) => { hits.push(o && o.name); P.hp -= d; return 'hit'; }, asPlayer: (p, fn) => fn(), upright: p => !p.dead, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    box: b => ({ l: b.x - b.w / 2, r: b.x + b.w / 2, t: b.y - b.h, b: b.y }), burst: () => {}, dust: () => {}, ring: () => {}, sparks: () => {}, shake: () => {},
    drain: r => { drainRate = r; }, drainStop: () => { drainRate = 0; }, music: () => {}, spawnFoe: () => null };
  const Hh = makeAirshipHands(ctx); Hh.clear();
  return { L: Lw, grid, P, keys, Hh, says, hits, rate: () => drainRate, run: (t) => { for (let i = 0; i < t * 60; i++) Hh.update(1 / 60); } };
};
{ const W = fakeWorld(), { L: Lw, P, keys, Hh } = W, at = (x, y) => W.grid[y * Lw.W + x];
  const spar = Lw.bandDecks.find(b => b.band === 'high'), gang = Lw.bandDecks.find(b => b.band === 'low');
  ok(Hh.on() && Hh.band() === 'low', 'hands: awake on the airship, the ship LOW');
  W.run(0.1); ok(at(gang.x0, gang.row) === T.ONEWAY && at(spar.x0, spar.row) === T.AIR, 'LOW: the gangways are laid, the spars are not');
  const s1 = Lw.airship.stations.find(s => s.id === 'launchA'), s2 = Lw.airship.stations.find(s => s.id === 'launchB');
  const stokeAt = s => { P.x = s.x * TS + 8; P.y = (s.y + 1) * TS; keys.talk = true; W.run(AS.STOKE.hold + 0.1); keys.talk = false; };
  stokeAt(s1); ok(W.says.includes('STOKED'), 'hands: hold E at a burner -> STOKED'); stokeAt(s2); W.run(7);
  ok(Hh.band() === 'high' && at(spar.x0, spar.row) === T.ONEWAY && at(gang.x0, gang.row) === T.AIR, 'HIGH: the spars are laid and the gangways taken up (the bands exclude each other)');
  P.x = spar.x0 * TS; P.y = (spar.row) * TS; W.run(AS.COLD.fill ** -1 + 1); ok(W.rate() > 0, 'HIGH and away from warmth: the COLD drain runs (' + W.rate() + ')');
  P.x = s1.x * TS + 8; P.y = (s1.y + 1) * TS; W.run(0.5); ok(W.rate() === 0, 'by a stoked burner: warm, the drain stops');
  W.run(AS.STOKE.fuel + 8); ok(Hh.band() === 'low' && at(spar.x0, spar.row) === T.AIR, 'every burner out: LOW, the spars taken up (a fall lands on the deck below)');
  const z = Lw.airship.keelBrush[0]; P.x = (z.x0 + 2) * TS; P.y = (z.row + 1) * TS; const h0 = W.hits.length; W.run(6); ok(W.hits.slice(h0).includes('THE KEEL BRUSH'), 'LOW in a breach: the keel brush lands (told)');
  Hh.clear(); ok(Hh.band() === 'low' && at(gang.x0, gang.row) === T.AIR, 'a respawn: the ship and the bands reset'); }

/* ---- 7. THE WYRMLING ---- */
ok(Object.keys(WL.ELEMENT).join() === 'shock,frost,fire' && Object.values(WL.ELEMENT).filter(e => e.ships).length === 1 && WL.ELEMENT.shock.ships, 'the element table: shock / frost / fire, only SHOCK ships');
ok(['idle', 'sparkTell', 'spit', 'coilTell', 'bite', 'hurt', 'die'].every(k => WL.WYRM_POSES[k] && WL.WYRM_SOUNDS[k]), 'B16: seven poses, each with its sound key');
{ const s = WL.newWyrmling(0, 100); let firstTell = -1, firstHit = -1, tellMove = null;
  for (let i = 0; i < 600; i++) { for (const v of WL.wyrmStep(s, 1 / 60, { px: 120, py: 112, time: i / 60 })) { if (v.ev === 'tell' && firstTell < 0) { firstTell = i; tellMove = v.move; } if ((v.ev === 'glob' || v.ev === 'bite') && firstHit < 0) firstHit = i; } }
  ok(firstTell >= 0 && firstHit > firstTell && (firstHit - firstTell) / 60 >= 0.5, 'a wyrmling tells (' + tellMove + ') ' + ((firstHit - firstTell) / 60).toFixed(2) + ' s before its blow can land');
  const s2 = WL.newWyrmling(0, 100); let bit = false; for (let i = 0; i < 600 && !bit; i++) for (const v of WL.wyrmStep(s2, 1 / 60, { px: 14, py: 112, time: i / 60 })) if (v.ev === 'bite') bit = true; ok(bit, 'close in: it coils and bites');
  const hero = {}; WL.elementApply(hero, 'shock'); const r = WL.elementStep(hero, 1 / 60, {}); ok(r && r.sap === WL.ELEMENT.shock.bite.sap, 'SHOCK: a stamina sap + jitter');
  ok(WL.elementStep(hero, 1 / 60, { roll: true }).cleansed === 'roll' && !hero.wlEl, 'a roll shakes it off'); WL.elementApply(hero, 'shock'); ok(WL.elementStep(hero, 1 / 60, { warm: true }).cleansed === 'warm', 'warmth clears it'); }
{ const marks = await import('../src/marks.js'); for (const k of ['wyrmling|sparkTell', 'wyrmling|coilTell', 'thunderwyrm|strikeTell', 'thunderwyrm|slamTell', 'thunderwyrm|roarTell', 'thunderwyrm|tailTell']) ok(k in marks.MARK && k in marks.ANSWER && k in marks.HEIGHT, 'marks rows: ' + k);
  ok(marks.ANSWER['thunderwyrm|roarTell'] === 'block' && marks.MARK['thunderwyrm|roarTell'] === '!' && marks.ANSWER['wyrmling|coilTell'] === 'block' && marks.MARK['wyrmling|coilTell'] === '!', "every '!' is a block"); }

/* ---- 8. THE THUNDER WYRM ---- */
const G = { x0: 0, x1: 640, floorY: 400, burners: [0, 1, 2, 3].map(i => ({ id: 'storm' + i, x: 96 + i * 150 })), stump: { x0: 336, x1: 352, top: 352 } };
const fakeFight = (o = {}) => { const fuel = { storm0: 0, storm1: 0, storm2: 0, storm3: 0 }, hits = [], log = [];
  const e = { hp: TW.TW.hp, maxHp: TW.TW.hp, mode: 'rest' }, S = TW.newFight(G); const hero = { x: o.x ?? 200, y: 400, ground: true, alive: true }; let brood = 0;
  const w = { heroes: () => [hero], hot: id => fuel[id] > 0, spend: id => { fuel[id] = 0; log.push('spend ' + id); }, fail: id => { fuel[id] = 0; log.push('fail ' + id); }, band: () => o.band || 'low',
    hit: (b, d, name) => { if (hero.x >= b[0] && hero.x <= b[1]) { hits.push(name); return true; } return false; }, roar: () => hits.push('roar'), brood: () => { brood++; return true; }, broodAlive: () => brood,
    say: () => {}, sound: () => {}, fx: () => {}, music: () => {} };
  return { e, S, w, fuel, hero, hits, log, step: t => { for (let i = 0; i < t * 60; i++) TW.stepWyrm(e, S, 1 / 60, w); } }; };
ok(Object.keys(TW.MOVE_NAME).length >= 4 && ['strike', 'slam', 'roar', 'tail'].every(m => TW.TW[m + 'Tell'] >= 0.7), '>= 4 told attacks, every tell >= 0.7 s');
ok(['strike', 'slam', 'roar', 'tail', 'brood'].every(m => TW.TW_POSES[m + 'Tell'] && TW.TW_POSES[m]) && TW.TW_POSES.open && TW.TW_POSES.ward && TW.TW_POSES.die, 'B16: a windup + release pose per move, + reel / ward / die');
{ const F = fakeFight(); F.step(0.2); F.e.mode = 'rest'; F.S.t = 0; TW.stepWyrm(F.e, F.S, 1 / 60, F.w); ok(F.e.mode === 'strikeTell' && F.S.marks.some(m => m.x === F.hero.x), 'his first move: the strike, a mark under the hero');
  F.step(TW.TW.strikeTell + 0.05); ok(F.hits.includes(TW.MOVE_NAME.strike) && F.S.n.opens === 0, 'no burner hot: the bolt finds the hero, no opening'); }
{ const F = fakeFight({ x: 100 }); F.fuel.storm0 = 20; F.e.mode = 'rest'; F.S.t = 0; TW.stepWyrm(F.e, F.S, 1 / 60, F.w); F.step(TW.TW.strikeTell + 0.05);
  ok(F.S.n.opens === 1 && F.S.open > 0 && F.e.mode === 'open' && !F.hits.includes(TW.MOVE_NAME.strike) && F.log.includes('spend storm0'), 'THE LURE: a hero by a stoked burner - the bolt grounds in it (spent), he is OPEN, the hero is spared');
  const d = TW.twTake(F.e, F.S, 100).dmg; ok(d > 100 * 1.7, 'OPEN: x' + (d / 100).toFixed(2));
  let last = 0; for (let i = 0; i < 20; i++) last = TW.twTake(F.e, F.S, 100).dmg; ok(Math.abs(last - 100 * TW.TW.floor) < 1e-9, 'one opening is capped at ' + Math.round(F.e.maxHp * TW.TW.openCap) + ': past it a blow lands at the floor (' + last + ')');
  F.step(TW.TW.openT + 0.1); ok(F.e.mode !== 'open' && F.S.ward > 0, 'after the opening: a told WARD');
  const wd = TW.twTake(F.e, F.S, 100); ok(wd.dmg >= 40 && wd.word === 'WARDED', 'B15: warded he still takes ' + wd.dmg + ' (>= 0.4x), and says so'); }
{ /* THE FLOOR over every state outside an opening (B15: never invulnerable, >= 0.4x) */
  let min = 9; for (const seed of [1, 2, 3]) { const F = fakeFight({ x: 100 + seed * 80 }); F.e.mode = 'rest'; for (let i = 0; i < 60 * 40; i++) { TW.stepWyrm(F.e, F.S, 1 / 60, F.w); if (!(F.S.open > 0)) min = Math.min(min, TW.twTake(F.e, F.S, 1).dmg); } }
  ok(min >= 0.4, 'resist floor outside openings: ' + min.toFixed(2) + 'x (>= 0.4)'); }
{ const F = fakeFight({ band: 'high' }); F.e.mode = 'rest'; F.S.i = 1; F.S.t = 0; TW.stepWyrm(F.e, F.S, 1 / 60, F.w); ok(F.e.mode === 'slamTell', 'the slam told'); F.step(TW.TW.slamTell + 0.05);
  ok(!F.hits.includes(TW.MOVE_NAME.slam) && F.S.headUp > 0 && TW.twTake(F.e, F.S, 100).dmg === 100, 'HIGH: his coils fall short - the HEAD RISES (x1.0)');
  const F2 = fakeFight({ band: 'low' }); F2.e.mode = 'rest'; F2.S.i = 1; F2.S.t = 0; TW.stepWyrm(F2.e, F2.S, 1 / 60, F2.w); F2.step(TW.TW.slamTell + 0.05); ok(F2.hits.includes(TW.MOVE_NAME.slam), 'LOW: the slam reaches the deck');
  F2.step(TW.TW.act + 0.05); ok(F2.e.mode === 'tailTell', 'LOW: in his coils - a tail sweep follows the slam'); }
{ const F = fakeFight(); F.fuel.storm0 = F.fuel.storm1 = F.fuel.storm2 = 20; F.e.hp = F.e.maxHp * 0.5; F.step(0.05); ok(F.S.ph === 2 && F.log.filter(l => l.startsWith('fail')).length === 2, 'P2 at 55%: the storm builds, two burners fail');
  let moves = new Set(); for (let i = 0; i < 60 * 60; i++) { TW.stepWyrm(F.e, F.S, 1 / 60, F.w); moves.add(F.e.mode); } ok(moves.has('roarTell') && moves.has('broodTell'), 'P2: the roar and the brood call join');
  ok(F.S.n.broods >= 1, 'P2: the brood is called (cap ' + TW.TW.broodCap + ')'); }
ok(/THE ROAD CONTINUES - FROSTFALL PASS/.test(readFileSync('src/airship-hands.js', 'utf8')), "the ending card: 'THE ROAD CONTINUES - FROSTFALL PASS (coming soon)'");
/* ---- 9. THE WIRING (text checks: main.js / level.js) ---- */
{ const M = readFileSync('src/main.js', 'utf8'), Lj = readFileSync('src/level.js', 'utf8');
  for (const k of ["makeAirshipHands(", "case 'wyrmling'", "case 'thunderwyrm': { const a = ASH", "ASH.take(e, dmg", "ASH.bossUpdate(e, dt)", "ASH.drawFoe(", "ASH.draw(g, cx, cy, time)", "ASH.update(dt)", "ASH.drawHud(g, P)", "ASH.barName(boss)", "if (ASH) ASH.clear();", "ASH.end(e)", "MEDALS.airship"]) ok(M.includes(k), 'main.js: ' + k);
  ok(/if \(asOn\(\)\) LEVELS\.push\(\{ id: 'airship'/.test(Lj) && Lj.indexOf("id: 'airship'") < Lj.indexOf('applyInserts(LEVELS);'), 'level.js: the flagged row, before applyInserts'); }

/* ---- 10. THE TOY DUEL (--duel): the pure fight vs a scripted bot. A GUESS for the tune lane, not a band. ----
   Bot: hp HERO.hp, flasks HERO.flasks (each +HERO.flask, drunk under 35%), a blow HERO.dmg every HERO.swing s in reach of the head. It keeps ONE burner hot
   (re-stokes when it is out and he is not on a tell: STOKE.hold s still) and stands by it; on a strike tell he stays (lure) - a mark away from a hot burner
   he steps off (p dodge); slam: jump (p), tail: jump (p), roar: block (p). LOW stance unless two burners are hot (the bot keeps one: LOW/MID). */
if (DUEL) {
  const HERO = { hp: 420, flasks: 3, flask: 0.4, dmg: 34, swing: 0.45, reach: 36 }, P_OK = { strike: 0.85, slam: 0.8, tail: 0.75, roar: 0.75, lure: 0.7 };   /* a human-ish bot: it misreads a lure 3 times in 10 (stands off its burner) */
  const runs = []; for (let seed = 1; seed <= 12; seed++) {
    let rs = seed * 9301 + 49297; const rnd = () => ((rs = (rs * 9301 + 49297) % 233280) / 233280);
    const fuel = { storm0: 0, storm1: 0, storm2: 0, storm3: 0 }; const e = { hp: TW.TW.hp, maxHp: TW.TW.hp, mode: 'rest' }, S = TW.newFight(G);
    const hero = { x: 110, y: 400, ground: true, alive: true }; let hp = HERO.hp, fl = HERO.flasks, sw = 0, stokeT = 0, t = 0, brood = 0, broodT = 0, hitsTaken = 0, openDmg = 0, chip = 0;
    const answered = {}; const band = () => (Object.values(fuel).filter(f => f > 0).length >= 2 ? 'high' : 'low');
    const w = { heroes: () => [hero], hot: id => fuel[id] > 0, spend: id => { fuel[id] = 0; }, fail: id => { fuel[id] = 0; }, band,
      hit: (b, d, name, o) => { const k = (o && o.key) || name; if (answered[k] === undefined) { const mv = Object.keys(TW.MOVE_NAME).find(m => TW.MOVE_NAME[m] === name); answered[k] = rnd() < (P_OK[mv] ?? 0.8); }
        if (answered[k] || hero.x < b[0] || hero.x > b[1]) return false; answered[k] = true; hp -= d; hitsTaken++; return true; },
      roar: (x, d) => { if (rnd() > P_OK.roar) { hp -= d; hitsTaken++; } }, brood: () => { brood++; return true; }, broodAlive: () => brood, say: () => {}, sound: () => {}, fx: () => {}, music: () => {} };
    const myB = G.burners[0];
    while (t < 400 && hp > 0 && e.hp > 0) { const dt = 1 / 60; t += dt;
      for (const k in fuel) fuel[k] = Math.max(0, fuel[k] - dt);
      if (brood > 0) { broodT += dt; if (broodT > 6) { brood--; broodT = 0; } if (rnd() < dt * 0.25) { hp -= 9; hitsTaken++; } }   /* a brood pair nags (a spark now and then) until cut down (~6 s each) */
      const telling = /Tell$/.test(e.mode);
      if (e.mode === 'strikeTell' && S.lureRoll !== S.n.strikes) { S.lureRoll = S.n.strikes; if (rnd() > P_OK.lure) { hero.x = myB.x + 70; for (const mk of S.marks) mk.x = hero.x; } }   /* a misread: off the burner when the marks land */
      if (!fuel[myB.id] && !telling) { stokeT += dt; hero.x = myB.x + 10; if (stokeT >= AS.STOKE.hold) { fuel[myB.id] = AS.STOKE.fuel; stokeT = 0; } }
      else { stokeT = 0; if (!telling) hero.x += (Math.max(myB.x + 10, Math.min(S.head.x - 20, myB.x + 40)) - hero.x) * Math.min(1, dt * 4); }
      TW.stepWyrm(e, S, dt, w);
      sw -= dt; if (sw <= 0 && Math.abs(S.head.x - hero.x) < HERO.reach + 40 && !telling) { sw = HERO.swing; const r = TW.twTake(e, S, HERO.dmg); e.hp -= r.dmg; if (S.open > 0) openDmg += r.dmg; else chip += r.dmg; }
      else if (sw <= 0 && S.open > 0) { hero.x += Math.sign(S.head.x - hero.x) * 160 * dt; }
      if (hp < HERO.hp * 0.35 && fl > 0) { fl--; hp = Math.min(HERO.hp, hp + HERO.hp * HERO.flask); } }
    runs.push({ win: e.hp <= 0, t: Math.round(t), hits: hitsTaken, flasks: HERO.flasks - fl, opens: S.n.opens, openShare: Math.round(100 * openDmg / Math.max(1, openDmg + chip)) }); }
  const wins = runs.filter(r => r.win).length, avg = k => (runs.reduce((a, r) => a + r[k], 0) / runs.length).toFixed(1);
  console.log('TOY DUEL (12 seeds, scripted bot, a GUESS): wins ' + wins + '/12 = ' + Math.round(100 * wins / 12) + '%  |  time ' + avg('t') + ' s  |  hits taken ' + avg('hits') + '  |  flasks ' + avg('flasks') + '  |  openings ' + avg('opens') + '  |  share of damage in openings ' + avg('openShare') + '%');
  console.log('  per run: ' + runs.map(r => (r.win ? 'W' : 'L') + r.t + 's/' + r.opens + 'op').join(' '));
}
console.log(n + ' ok');
