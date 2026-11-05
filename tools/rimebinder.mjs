// tools/rimebinder.mjs - THE RIMEBINDER'S KIT AND THE SHARED CHILL, proved in Node (claude/rimebinder 11-05). No browser, no page: a small mock world.
// Run: node tools/rimebinder.mjs   (exit 1 on any failure)
import * as CH from '../src/chill.js';
import { makeRimebinder, RIME, thrallStats, lanceTier, raiseCost, rimeable, isRanged } from '../src/rimebinder.js';
import { RIME_TECH, RIME_UPGRADES, flatTech } from '../src/tech-rimebinder.js';
import { SKILLS } from '../src/progression-catalog.js';
import * as PR from '../src/progression.js';
import { HERO_IDS as ROSTER_IDS, RIME_SHIPS, howTo } from '../src/hero-roster.js';
let fails = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { fails++; console.log('FAIL', m); } };
const foe = (o = {}) => ({ t: 'sprig', x: 60, y: 100, w: 12, h: 14, hp: 20, hp0: 20, alive: true, face: -1, vx: 0, ...o });
// ---- CHILL ----
{ const e = foe(); ok(CH.chill(e, 0.4) === 'chilled', 'a weak foe chills'); ok(CH.clock(e) < 1 && CH.clock(e) > 0.5, 'its clock slows: ' + CH.clock(e));
  CH.chill(e, 0.4); ok(CH.chill(e, 0.4) === 'frozen', 'a full chill freezes a weak foe'); ok(e.frozen > 0 && e.stagger > 0, 'frozen = the existing e.frozen + stagger');
  ok(CH.chill(e, 1) === 'chilled', 'no second freeze while immune'); for (let i = 0; i < 100; i++) CH.tick(e, 0.1); ok(!(e.chillImm > 0), 'the immunity runs out');
  const b = foe({ maxHp: 400, t: 'boss' }); for (let i = 0; i < 10; i++) CH.chill(b, 1); ok(!(b.frozen > 0), 'a BOSS is never frozen (B15)'); ok(b.chill <= CH.CHILL.bossCap + 1e-9, 'a boss chill is capped'); ok(CH.clock(b) >= 0.85, 'a boss is only slowed a little: ' + CH.clock(b));
  const el = foe({ elite: true }); for (let i = 0; i < 10; i++) CH.chill(el, 1); ok(!(el.frozen > 0), 'an ELITE is never frozen'); ok(CH.clock(el) < 0.75, 'an elite slows: ' + CH.clock(el));
  const w = foe(); CH.chill(w, 0.3); for (let i = 0; i < 12; i++) CH.tick(w, 0.1); ok(w.chill > 0.29, 'it holds a beat before thawing'); for (let i = 0; i < 20; i++) CH.tick(w, 0.1); ok(w.chill < 0.29, 'then it thaws');
  const p = { x: 0, y: 0 }; CH.chillHero(p, 2); ok(CH.heroClock(p) < 1, 'the hero side slows a hero (for frost foes later)'); }
// ---- PURE NUMBERS ----
ok(lanceTier(0.3) === 0 && lanceTier(0.6) === 1 && lanceTier(1.0) === 2 && lanceTier(1.5) === 3, 'the lance tiers');
{ const s = thrallStats(40, false); ok(s.hp === 16 && s.k === 0.5 && s.life === RIME.thrall.life, 'a thrall: 40% hp, 50% blow'); const f = thrallStats(40, true, true); ok(f.hp === 40 && f.ranged, 'raised whole by the ultimate'); }
ok(raiseCost({}) === 34 && raiseCost({ crown: 1 }) < 34, 'a raise costs a third');
ok(!rimeable(foe({ maxHp: 300 }), 0, true), 'a boss leaves no rime corpse'); ok(!rimeable(foe(), 0, false), 'a warm foe leaves none'); ok(rimeable(foe({ chill: 0.5 }), 0, false), 'a chilled one does');
ok(isRanged(foe({ t: 'archer' })) && !isRanged(foe({ t: 'sprig' })), 'who shoots');
// ---- THE KIT IN A MOCK WORLD ----
const TS = 16, solid = (tx, ty) => ty >= 7;   /* a flat floor at y = 112 */
const P = { x: 20, y: 112, face: 1, ground: true, st: 100, hp: 92, hero: 'rimebinder', dodge: 0 };
let enemies = [], parts = [], time = 0, talents = {};
const SFX = new Proxy({}, { get: () => () => {} }), noop = () => {};
const hurt = (b, e, d) => { e.hp -= d; if (e.hp <= 0 && e.alive) { e.alive = false; const c = { t: e.t, x: e.x, y: e.y, vx: 60, vy: -100, spin: 3, rot: 0.2, life: 1, max: 1 }; K.onCorpse(c, e); } };
const K = makeRimebinder({ get P() { return P; }, get enemies() { return enemies; }, get parts() { return parts; }, get time() { return time; }, TS, SFX, tal: () => talents,
  heroOf: p => p.hero, heroes: () => [P], spend: c => { if (P.st < c) return false; P.st -= c; return true; }, tired: noop, blockCost: d => d, ST: { hold: 10, delay: 0.5 },
  isSolid: solid, tileAt: () => 0, isOneWay: () => false, hurtAs: hurt, swordDmg: () => 13, amul: () => 1, number: noop, sparks: noop, burst: noop, ringAt: noop, shakeCam: noop, hitstop: noop,
  zoomKick: noop, kitPose: noop, trialEvent: noop, teach: noop, noteVerb: noop, parried: noop, noteParry: noop, tap: () => 0.14, spriteOf: () => null, drawTinted: noop });
const run = (s, keys = {}) => { for (let t = 0; t < s; t += 1 / 60) { time += 1 / 60; K.update(1 / 60, keys, {}); K.kitStep(1 / 60); for (const e of enemies) { CH.tick(e, 1 / 60); if (e.frozen > 0) e.frozen -= 1 / 60; } } };
// the frost bolt: tap X (press, then let go)
enemies = [foe({ x: 90, hp: 30, hp0: 30 })];
ok(K.press(P, {}) === 'nock', 'X at range nocks a bolt'); run(0.02, { atk: false }); run(0.6);
ok(enemies[0].chill > 0, 'the bolt chills'); ok(enemies[0].hp < 30, 'and hurts: ' + enemies[0].hp);
// point-blank is the staff
enemies = [foe({ x: 30 })]; ok(K.press(P, {}) === false, 'point-blank X is the staff strike'); ok(K.press(P, { up: true }) === false, 'UP+X is the shared rising blow');
// three bolts freeze a weak foe; a chilled kill leaves a RIME CORPSE and fills the bar
enemies = [foe({ x: 90, hp: 200, hp0: 200 })];
for (let i = 0; i < 3; i++) { K.press(P, {}); run(0.02, {}); run(0.5); }
ok(enemies[0].frozen > 0 || K.stats.freezes > 0, 'three bolts freeze a weak foe');
enemies = [foe({ x: 90, hp: 4, hp0: 40 })]; P.rmBar = 0; K.press(P, {}); run(0.02); run(0.5);
ok(!enemies[0].alive, 'the bolt kills'); ok(K.corpses().length === 1, 'a chilled kill leaves a RIME CORPSE'); ok(P.rmBar >= RIME.bar.kill, 'and fills the rime bar: ' + P.rmBar);
ok(K.corpses()[0].vx === 0 && K.corpses()[0].spin === 0 && K.corpses()[0].life >= 11, 'the corpse lies frozen, still, ~12 s');
// a warm kill leaves none
{ const c0 = K.corpses().length; enemies = [foe({ x: 40, hp: 1 })]; hurt('light', enemies[0], 5); ok(K.corpses().length === c0, 'a warm kill leaves no corpse'); }
// RAISE: UP+C near the corpse, with a third of the bar
P.x = K.corpses()[0].x - 10; P.rmBar = 40;
run(0.02, { block: true, up: true }); run(0.02, {});
ok(K.thralls().length === 1, 'UP+C raises a thrall'); ok(P.rmBar === 6, 'a raise spends a third: ' + P.rmBar); ok(K.corpses().length === 0, 'the corpse is spent');
const th = K.thralls()[0]; ok(th.hp === 16 && th.k === 0.5, 'the thrall is weaker than the foe was (hp ' + th.hp + ')');
// the thrall fights: a foe near it takes blows
enemies = [foe({ x: th.x + 40, hp: 100, hp0: 100 })]; run(3);
ok(enemies[0].hp < 100, 'the thrall walks in and strikes: ' + enemies[0].hp);
// CAP 2: a third raise melts the oldest
const mk = x => { const e = foe({ x, hp: 1, hp0: 30, chill: 0.5, chillBy: P }); enemies.push(e); hurt('shot', e, 5); };
mk(P.x + 10); P.rmBar = 100 - 1; run(0.02, { block: true, up: true }); run(0.02, {});
mk(P.x + 10); P.rmBar = 99; run(0.02, { block: true, up: true }); run(0.02, {});
ok(K.thralls().length === 2, 'two thralls: the CAP (' + K.thralls().length + ')');
// thralls melt
run(RIME.thrall.life + 1); ok(K.thralls().length === 0, 'thralls melt in ~10 s');
// SHATTER: DOWN+C on a corpse, it bursts and chills what is round it
mk(P.x + 12); enemies.push(foe({ x: P.x + 30, hp: 100, hp0: 100 })); const v = enemies[enemies.length - 1]; const nc0 = K.corpses().length;
run(0.02, { block: true, down: true }); run(0.02, {});
ok(v.hp < 100 && v.chill > 0, 'SHATTER hurts and chills round the corpse'); ok(K.corpses().length === nc0 - 1, 'and spends it');
// THE PARRY: a tap of C on the beat freezes a weak attacker, chills a boss (never frozen)
P.rmCPrev = false; run(0.02, {}); time += 0.01; K.update(0.01, { block: true }, {});
{ const a = foe({ x: P.x + 14 }); ok(K.guardTakes(a.x, 10, false, a, false, false) === 'blocked', 'C on the beat parries'); ok(a.frozen > 0, 'the weak attacker is frozen'); }
K.update(0.01, {}, {}); K.update(0.01, { block: true }, {});
{ const b = foe({ x: P.x + 14, maxHp: 900 }); ok(K.guardTakes(b.x, 10, false, b, false, false) === 'blocked', 'a boss blow parried'); ok(!(b.frozen > 0) && b.chill > 0, 'the boss only chills'); }
K.update(0.01, {}, {}); K.update(0.01, { block: true }, {});
ok(K.guardTakes(P.x + 14, 10, true, foe({ x: P.x + 14 }), false, false) === null, 'a RED blow is too strong for the parry');
// THE ICE WALL: held C stops a yellow blow from the front, not a red one, not from behind
run(0.3, {}); run(0.3, { block: true }); ok(P.rmGuard, 'held C raises the wall');
P.rmTapAt = -9; ok(K.guardTakes(P.x + 14, 10, false, foe(), false, false) === 'blocked', 'the wall stops a yellow blow');
ok(K.guardTakes(P.x + 14, 10, true, foe(), false, false) === null, 'a red blow goes through'); ok(K.guardTakes(P.x - 14, 10, false, foe(), false, false) === null, 'nothing from behind');
run(0.1, {});
// THE ULTIMATE at a full bar
enemies = [foe({ x: P.x + 40, hp: 300, hp0: 300 }), foe({ x: P.x - 50, maxHp: 900, hp: 900 })]; P.rmBar = 100; P.st = 100;
ok(K.ultReady(), 'a full bar: the ultimate is ready'); ok(K.longWinter(), 'THE LONG WINTER fires'); ok(P.rmBar === 0, 'it spends the bar');
ok(enemies[0].frozen > 0 && !(enemies[1].frozen > 0) && enemies[1].chill > 0, 'it freezes the weak, only chills the boss'); ok(enemies[0].hp < 300, 'and strikes');
// THE MIST STEP chills what stands in it
enemies = [foe({ x: P.x + 4, hp: 100 })]; K.mist(); run(0.5); ok(enemies[0].chill > 0, 'the mist chills');
// THE LANCE: a T2 pierces two in a line; T3 rimes a warm kill
enemies = [foe({ x: P.x + 50, hp: 200 }), foe({ x: P.x + 80, hp: 200 })]; P.st = 100; P.rmCd = 0; K.release(P, 2); run(0.6);
ok(enemies[0].hp < 200 && enemies[1].hp < 200, 'the PIERCING LANCE goes through the line');
{ const c0 = K.corpses().length; enemies = [foe({ x: P.x + 50, hp: 2, hp0: 30 })]; enemies[0].chill = 0; P.rmCd = 0; talents = {}; CH.tick(enemies[0], 0);
  const realChill = CH.chill; K.release(P, 3); run(0.6); ok(K.corpses().length === c0 + 1, 'the RIME-MAKER (T3) leaves a corpse'); }
// ---- THE L25-L50 FORK PACK + THE LADDER ----
const levels = Object.keys(RIME_TECH).map(Number); ok(levels.join() === '25,30,35,40,45,50', 'six tech levels');
for (const lv of [30, 40, 50]) { const f = RIME_TECH[lv].fork; ok(Array.isArray(f) && f.length === 2 && f[0].trade === f[1].trade && f[0].role !== f[1].role, 'a fork at L' + lv); if (lv === 50) ok(f.every(o => o.capstone), 'the L50 pair are capstones'); }
ok(RIME_UPGRADES.length >= 8 && RIME_UPGRADES.every(u => u.what.length === 2), 'eight ranked upgrades');
{ const fl = flatTech(RIME_TECH); ok(Object.values(fl).every(t => t.id && t.name && t.teach), 'flatTech: every level an id (master before claude/kfork)'); }
{ const ids = new Set(); for (const t of Object.values(RIME_TECH)) for (const o of t.fork || [t]) { ok(!ids.has(o.id), 'unique tech id ' + o.id); ids.add(o.id); } }
{ const mine = SKILLS.filter(s => s.hero === 'rimebinder'); ok(mine.filter(s => s.active).length === 9, '9 actives: ' + mine.filter(s => s.active).length); ok(mine.filter(s => !s.active).length === 21, '21 passives: ' + mine.filter(s => !s.active).length);
  ok(mine.every(s => s.level >= 1 && s.level <= 24), 'the L1-L24 ladder'); ok(new Set(mine.map(s => s.id)).size === mine.length, 'unique ids'); }
ok(PR.HERO_IDS.includes('rimebinder') && ROSTER_IDS.includes('rimebinder'), 'she is a hero id (progression + roster)');
ok(PR.HERO_PERKS.rimebinder && PR.HERO_PERKS.rimebinder.length === 2, 'her two hero perks'); ok(PR.hasKit('rimebinder'), 'her L25-L50 kit is in TECHNIQUES');
ok(RIME_SHIPS === false, 'RIME_SHIPS is false (code-only, behind the flag)'); ok(/BEAT HER/.test(howTo('rimebinder')), 'her locked card says how: ' + howTo('rimebinder'));
ok(!PR.DEFAULT_HEROES.includes('rimebinder'), 'she is not a free starter');
console.log((fails ? 'FAIL ' : 'PASS ') + (n - fails) + '/' + n + ' rimebinder checks');
process.exit(fails ? 1 : 0);
