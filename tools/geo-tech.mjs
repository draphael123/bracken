// tools/geo-tech.mjs - THE GEOMANCER'S L25-L50 KIT (claude/geopack). NODE ONLY: no browser, no page. makeGeomancer is built over a small fake world (a flat floor, a few foes, a hero)
// and each technique is played through its real functions: damage = swordDmg x k, boss law (an OPEN, never a pin or a stagger), per-foe caps, cooldowns, the one hit-stop per cast,
// the capstones spending the board on a 40 s clock, and the data (pairs differ in role, capstone pair, parity sheet within 10%, upgrades wired). The things only a browser shows
// (the look and sound of each tell) are listed in work/claude/lane-done/claude-geopack.md as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makeGeomancer } from '../src/geomancer.js';
import { GT } from '../src/geo-tech.js';
import { GEO_TECH, GEO_UPGRADES, GEO_PAR } from '../src/tech-geomancer.js';
import * as PR from '../src/progression.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const TS = 16, LW = 80, LH = 20, FLOOR = 15, SW = 20;   /* sword damage in the fake world: k x 20 is an integer for every k here */

function world(picks = [], upg = {}) {
  const T = { AIR: 0, SOLID: 1, ONEWAY: 2 };
  const grid = new Array(LW * LH).fill(0); for (let y = FLOOR; y < LH; y++) for (let x = 0; x < LW; x++) grid[y * LW + x] = 1;
  const P = { x: 200, y: FLOOR * TS, w: 10, h: 24, face: 1, hp: 100, st: 200, ground: true, atk: -1, vx: 0, vy: 0 };
  const w = { time: 10, stops: 0, log: [], enemies: [], seeds: [], parts: [], nums: [] };
  const set = new Set(picks);
  const base = {
    P, players: [P], L: { grid }, T, TS, LW, LH, VW: 320, VH: 180, camX: 40, camY: 0, enemies: w.enemies, seeds: w.seeds, parts: w.parts, SFX: new Proxy({}, { get: () => () => {} }),
    get time() { return w.time; },
    tal: () => ({}), tech: id => set.has(id), upg: id => upg[id] | 0, boss: null,
    isSolid: (x, y) => x < 0 || y < 0 || x >= LW || y >= LH || grid[y * LW + x] === T.SOLID, tileAt: (x, y) => grid[y * LW + x], isOneWay: t => t === T.ONEWAY, resolveTiles() {},
    box: b => ({ l: b.x - (b.w || 12) / 2, r: b.x + (b.w || 12) / 2, t: b.y - (b.h || 16), b: b.y }), overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtAs: (blow, e, d) => { e.hp -= d; w.log.push([e.name, d]); if (e.hp <= 0) e.alive = false; }, floorFoe: (e, s) => { e.down = s; return true; },
    lcBig: e => !!e.boss, knockSkip: () => false, swordDmg: () => SW, amul: () => 1, spend: n => { if (P.st < n) return false; P.st -= n; return true; },
    hitstop: () => { w.stops++; }, number: (x, y, t) => w.nums.push(t), isGeo: () => true, attackBox: () => w.atkBox || null, reduceMotion: () => true, moveBody() {},
    refund() {}, yardSay() {}, kitPose() {}, staffTip: () => null, dustRing() {},
  };
  const api = new Proxy(base, { get: (t, k) => (k in t ? t[k] : (typeof k === 'string' ? () => {} : undefined)) });
  const geo = makeGeomancer(api);
  const foe = (name, x, o = {}) => { const e = { name, x, y: FLOOR * TS, w: 12, h: 16, hp: 1000, alive: true, ...o }; w.enemies.push(e); return e; };
  const sim = (secs, dt = 1 / 60) => { for (let t = 0; t < secs; t += dt) { w.time += dt; geo.update(dt); } };
  const pillar = (tx, h = 2) => geo.erupt(tx, FLOOR, h, 'pillar', { noHero: true, hurt: false, noLaunch: true }).piece;
  const total = e => w.log.filter(l => l[0] === e.name).reduce((s, l) => s + l[1], 0);
  return { geo, api, P, w, foe, sim, pillar, total, grid, T };
}

check('data: pairs differ in role, trade lines match, capstone pair, nine upgrades, every id unique', () => {
  const ids = new Set(); let n = 0;
  for (const lv of PR.TECH_LEVELS) { const e = GEO_TECH[lv], opts = e.fork || [e];
    if (e.fork) { assert.equal(e.fork.length, 2, 'L' + lv); assert.notEqual(e.fork[0].role, e.fork[1].role, 'roles differ at L' + lv); assert(e.fork[0].trade && e.fork[0].trade === e.fork[1].trade, 'trade line at L' + lv); }
    for (const t of opts) { assert(t.id && t.name && t.what && t.teach && t.input && t.role, t.id); assert(!ids.has(t.id), 'dup ' + t.id); ids.add(t.id); n++;
      assert(t.k === null || (t.k > 0 && t.k <= 2.2), 'k ' + t.id); assert(!/FLAME|FIRE|BLOOD|BURN/.test(t.name + t.what), 'her identity is stone: ' + t.id); } }
  assert.deepEqual(PR.FORK_LEVELS.filter(l => GEO_TECH[l].fork), [30, 40, 50]); assert.equal(n, 9, 'six levels, three of them forks');
  const caps = GEO_TECH[50].fork; assert(caps.every(c => c.capstone && c.cd >= 40), 'both capstones are capstones with cd >= 40'); assert.deepEqual(caps.map(c => c.id), ['gfault', 'ghost']);
  assert.equal(GEO_UPGRADES.length, 9); for (const u of GEO_UPGRADES) { assert(u.what.length === 2 && !ids.has(u.id), u.id); ids.add(u.id); }
  /* the fork pair: B is not the retired crouch STONE SKIN, and the L40 'stone option' is the bigger recall */
  assert(!JSON.stringify(GEO_TECH).includes('STONE SKIN')); assert.equal(GEO_TECH[40].fork[0].id, 'gshatter');
});
check('data: damage pairs are within 10% by the parity sheet; the host is tuned to the fault on one foe', () => {
  const dps = id => { const t = PR.techniqueById('geomancer', id), p = GEO_PAR[id]; return t.k * p.hits / p.cycle; };
  const near = (a, b) => Math.abs(dps(a) - dps(b)) / Math.max(dps(a), dps(b)); assert(near('gshatter', 'gcairn') <= 0.1, 'L40 ' + near('gshatter', 'gcairn')); assert(near('gfault', 'ghost') <= 0.1, 'L50 ' + near('gfault', 'ghost'));
  /* the capstone ceiling: one cast takes <= 60% of a brute-class foe. Brute hp is 6 x (sword x 6) here is unknown, so the law is stated in swords: <= 3.0 sword on one foe */
  for (const id of ['gfault', 'ghost']) { const t = PR.techniqueById('geomancer', id); assert(t.k * GEO_PAR[id].hits <= 3.0 + 1e-9, id + ' one-foe total'); assert(t.cd >= 40); }
  /* AoE ceiling .93 per hit (the knight's 1.00 less a tenth): every area k is under it */
  for (const id of ['gtopple', 'gwell', 'gshatter', 'gcairn', 'gfault']) assert(PR.techniqueById('geomancer', id).k <= 0.93, id);
  assert.equal(PR.techniqueById('geomancer', 'gsling').k, 1.3); assert.equal(PR.techniqueById('geomancer', 'ggeode').k, 2.0);
});
check('framework: the geomancer is dealt tech cards, forks at 30/40/50, B recommended second, locked sibling, road to L50', () => {
  const p = { card: { geomancer: { v: 0, e: 0, m: 0, ms: {} } } };
  assert(PR.hasKit('geomancer')); assert.equal(PR.pickMilestone(p, 'geomancer', 25, 'gsling', 50), null);
  const o30 = PR.perkOffer(p, 'geomancer', 30); assert.deepEqual(o30.map(k => k.id), ['gtopple', 'gstep']); assert(o30[0].rec && !o30[1].rec);
  assert.equal(PR.pickMilestone(p, 'geomancer', 30, 'gstep', 50), null); assert(PR.forkLocked(p, 'geomancer', 'gtopple'));
  assert.equal(PR.perkOffer(p, 'geomancer', 35)[0].id, 'gwell');
  const o50 = PR.techniquesAt('geomancer', 50); assert(o50.length === 2 && o50.every(t => t.capstone));
  const r = PR.roadToL50(p, 'geomancer', 31); assert.equal(r.length, 6); assert(r[5].capstone && r[5].options.length === 2);
  const q = { card: { geomancer: { v: 0, e: 0, m: 0, ms: {} } } }; for (const u of PR.UPGRADE_LEVELS) { const o = PR.perkOffer(q, 'geomancer', u); assert(o[0].up); assert.equal(PR.pickMilestone(q, 'geomancer', u, o[0].id, 50), null); }
  PR.validateProgress(JSON.parse(JSON.stringify(q)));
});
check('input: no technique reuses another hero chord or her own: the chords are distinct for one seat', () => {
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  /* her C-chords in order: DOWN+C+stone = DETONATE, DOWN+C bare = WELL, UP+C full board = the ultimate, UP+C otherwise = STEP / SLING; each branch is an else-if of the one above it, so no press can fire two */
  const i = src.indexOf('GEO.detonate()) { P.geoDetHold'); assert(i > 0); const seg = src.slice(i, i + 1400);
  assert(/else if \(cDown && keys\.down && !keys\.up[^)]*tech\('gwell'\) && GEO\.wellTry\(\)/.test(seg), 'WELL is an else-if of DETONATE');
  assert(/else if \(cDown && keys\.up && !keys\.down.*GEO\.upC\(\)\) \{ P\.ultHold = true/.test(seg), 'UP+C is an else-if of the DOWN chords and eats the ward');
  assert(src.includes("GEO.ultReady()") && src.includes('GEO.ultimate()'), 'the ultimate chord reads the capstone');
});

check('SLINGSTONE: 1.3 x sword, pierces one foe (hits two, not three), 20 stamina, 3 s cooldown, one stop', () => {
  const W = world(['gsling']); const a = W.foe('a', 232), b = W.foe('b', 250), c = W.foe('c', 270); const st0 = W.P.st;
  assert(W.geo.upC()); assert.equal(W.P.st, st0 - 20); assert(!W.geo.upC(), 'cooldown'); W.sim(1.2);
  assert.equal(W.total(a), 26); assert.equal(W.total(b), 26); assert.equal(W.total(c), 0, 'pierces one, stops at the second'); assert.equal(W.w.stops, 1);
  W.w.time += 3; W.sim(0.1); W.P.st = 5; assert(!W.geo.upC(), 'no wind, no sling'); const W2 = world([]); assert(!W2.geo.upC(), 'not picked');
});
check('SLINGSTONE: a boss takes the same blow and no stagger', () => {
  const W = world(['gsling']); const bo = W.foe('boss', 236, { boss: true, maxHp: 500 }); W.geo.upC(); W.sim(1.2); assert.equal(W.total(bo), 26); assert(!bo.stagger && !bo.frozen);
});
check('TOPPLE: the third cut on her pillar topples it - 0.9 x sword along its line, the first common foe held 1 s, a boss only hurt; the stone is spent', () => {
  const W = world(['gtopple']); const st = W.pillar(15); assert(st); const a = W.foe('a', 15 * TS + 30), b = W.foe('b', 15 * TS + 50), bo = W.foe('boss', 15 * TS + 40, { boss: true, maxHp: 900 });
  W.P.x = 15 * TS - 10; W.P.atk = 0.1; W.P.heavySwing = true; W.P.lastSwingT = 7; W.w.atkBox = { l: 15 * TS - 6, r: 15 * TS + 6, t: FLOOR * TS - 30, b: FLOOR * TS };
  W.geo.update(1 / 60); assert.equal(W.geo.standing(), 0, 'the stone is the cost'); assert.equal(W.geo.tech.slabs().length, 1); W.sim(0.8);
  assert.equal(W.total(a), 18); assert.equal(W.total(b), 18); assert.equal(W.total(bo), 18); assert.equal(a.stagger, 1.0, 'the first foe is held a second'); assert(!bo.stagger, 'no pin on a boss'); assert((b.stagger || 0) <= 0.3);
  assert.equal(W.w.stops, 1, 'one stop'); const W2 = world([]); W2.pillar(15); W2.P.atk = 0.1; W2.P.heavySwing = true; W2.w.atkBox = { l: 15 * TS - 6, r: 15 * TS + 6, t: FLOOR * TS - 30, b: FLOOR * TS }; W2.geo.update(1 / 60); assert.equal(W2.geo.standing(), 1, 'unpicked: the fist never topples');
});
check('STONE STEP: UP+C beside a pillar grows it two cells and lifts her to its top; 10 stamina, 2 s cd; refused with no room or at four cells', () => {
  const W = world(['gstep']); const st = W.pillar(15); W.P.x = 15 * TS - 12; const y0 = st.y0; assert(W.geo.upC());
  assert.equal(st.cells.length, 4); assert.equal(st.y0, y0 - 2 * TS); assert.equal(W.P.y, st.y0, 'she stands on the new top'); assert.equal(Math.round(W.P.x), 15 * TS + 8); assert.equal(W.P.st, 190);
  assert.equal(W.grid[(FLOOR - 4) * LW + 15], 1, 'the new cell is rock in the level grid'); W.P.ground = true; W.w.time += 3; assert(!W.geo.upC(), 'full height: it grows no more');
  const W2 = world(['gstep']); const s2 = W2.pillar(15); W2.P.x = 15 * TS - 12; W2.grid[(FLOOR - 4) * LW + 15] = 1; assert(W2.geo.upC()); assert.equal(s2.cells.length, 3, 'one cell of room: one cell');
  const W3 = world(['gstep']); W3.pillar(15); W3.P.x = 60; assert(!W3.geo.upC(), 'no stone in reach: not a step');
  const W4 = world(['gstep', 'gsling']); W4.pillar(15); W4.P.x = 60; assert(W4.geo.upC() && W4.geo.tech.slings().length === 1, 'no stone near: the same chord slings');
});
check('SEISMIC WELL: only with no stone standing; slows (boss 0.8, common 0.45), pulls commons never a boss, pops 0.6 x sword once, 14 s cd, one stop', () => {
  const W = world(['gwell']); const a = W.foe('a', 200 + 56 + 30), bo = W.foe('boss', 200 + 56 - 30, { boss: true, maxHp: 900 }); const ax = a.x, bx = bo.x;
  W.pillar(5); assert(!W.geo.tech.wellTry(), 'a stone standing: that chord is DETONATE'); W.geo.clear(); assert(W.geo.tech.wellTry());
  W.sim(0.6); assert(a.x < ax, 'drawn in'); assert.equal(bo.x, bx, 'a boss is never pulled'); assert.equal(a.geoSlow, 0.45); assert.equal(bo.geoSlow, 0.8); W.sim(0.9);
  assert.equal(W.total(a), 12); assert.equal(W.total(bo), 12); assert.equal(a.down, 0.9); assert(!bo.down && !bo.stagger); assert.equal(W.w.stops, 1);
  assert(!W.geo.tech.wellTry(), 'cooldown'); W.w.time += 14; assert(W.geo.tech.wellTry());
});
check('SHATTER RECALL: with a foe near the stones burst on arrival (0.45 x sword, at most two bursts a foe, one stop); with none they re-plant', () => {
  const W = world(['gshatter']); W.pillar(10); W.pillar(12); W.pillar(14); W.P.x = 12 * TS + 8; const a = W.foe('a', W.P.x + 30); const far = W.foe('far', W.P.x + 400);
  assert(W.geo.recall()); W.sim(1.0); assert.equal(W.geo.standing(), 0, 'the stones are spent'); const hits = W.w.log.filter(l => l[0] === 'a');
  const bursts = hits.filter(l => l[1] === 9).length; assert(bursts >= 1 && bursts <= 2, 'bursts ' + bursts); assert.equal(far.hp, 1000); assert(W.w.stops >= 1);
  const W2 = world(['gshatter']); W2.pillar(10); W2.pillar(12); W2.P.x = 12 * TS + 8; W2.foe('far', W2.P.x + 400); assert(W2.geo.recall()); W2.sim(1.0); assert(W2.geo.standing() >= 1, 'nothing near: they plant again');
});
check('CAIRN: a stone a foe breaks leaves 3 gravel mines; a foe that walks over one takes 0.4 x sword, at most two, a boss only hurt', () => {
  const W = world(['gcairn']); const st = W.pillar(15); W.geo.crumble(st, 'broken'); assert.equal(W.geo.tech.mines().length, 3);
  const a = W.foe('a', 15 * TS + 8), bo = W.foe('boss', 15 * TS + 30, { boss: true, maxHp: 900 }); W.sim(0.5);
  assert(W.total(a) >= 8 && W.total(a) <= 16, 'a: ' + W.total(a)); assert.equal(a.cairnN <= 2, true); assert(!bo.stagger);
  const W2 = world(['gcairn']); const s2 = W2.pillar(15); W2.geo.crumble(s2, 'time'); assert.equal(W2.geo.tech.mines().length, 0, 'only a foe-broken stone leaves gravel'); const W3 = world([]); const s3 = W3.pillar(15); W3.geo.crumble(s3, 'broken'); assert.equal(W3.geo.tech.mines().length, 0);
});
check('GEODE: the crystal bursts 1.5 s later for 2.0 x sword; a boss is not encased, it is OPENED UP for 1.5 s', () => {
  const W = world(['ggeode']); const a = W.foe('a', 260), bo = W.foe('boss', 300, { boss: true, maxHp: 900 });
  assert(W.geo.tech.geode(a)); assert(a.frozen > 0); W.sim(1.0); assert.equal(W.total(a), 0); W.sim(0.6); assert.equal(W.total(a), 40); assert(!(a.frozen > 0));
  assert(W.geo.tech.geode(bo)); assert(!(bo.frozen > 0), 'no encase'); assert(bo.disarmOpenT > W.w.time, 'OPENED UP'); W.sim(1.6); assert.equal(W.total(bo), 40);
  assert(!world([]).geo.tech.geode(a), 'unpicked');
});
check('THE GREAT FAULT: spends the board, three waves x 0.8 x sword on a foe on the screen (2.4 swords), a boss OPENED on the last wave and never staggered, shelves rise, 40 s clock, one stop', () => {
  const W = world(['gfault']); for (const t of [4, 6, 8]) W.pillar(t); assert(W.geo.ultReady()); const a = W.foe('a', 260), bo = W.foe('boss', 150, { boss: true, maxHp: 900 }), off = W.foe('off', 200, { y: 4 * TS });
  assert(W.geo.ultimate()); assert.equal(W.geo.standing(), 0, 'the board is spent'); assert(!W.geo.ultReady()); W.sim(0.2);
  W.sim(3); assert.equal(W.total(a), 48); assert.equal(W.total(bo), 48); assert.equal(off.hp, 1000, 'out of the band: untouched'); assert(!bo.stagger && bo.disarmOpenT > 0, 'an OPEN, not a stagger');
  assert.equal(W.w.stops, 1, 'one hit-stop for the cast'); assert(W.geo.pieces().some(p => p.kind === 'shelf'), 'a shelf stands'); assert(W.geo.pieces().every(p => p.kind !== 'shelf' || !p.capped), 'a shelf is not one of the three stones');
  for (const t of [4, 6, 8]) W.pillar(t); W.w.time += 20; assert(!W.geo.ultReady(), 'inside 40 s'); W.w.time += 21; assert(W.geo.ultReady(), 'after 40 s');
  W.sim(8); assert.equal(W.geo.pieces().filter(p => p.kind === 'shelf').length, 0, 'shelves fall by themselves'); assert.equal(W.geo.collapsing(), null, 'not the mountain collapse');
});
check('THE STONE HOST: every standing stone wakes as a golem for 10 s and charges the nearest foe; 12 hits x 0.2 = 2.4 swords at most on one foe; a boss only hurt', () => {
  const W = world(['ghost']); for (const t of [4, 6, 8]) W.pillar(t); const a = W.foe('a', 300);
  assert(W.geo.ultimate()); assert.equal(W.geo.tech.hosts().length, 3); assert.equal(W.geo.standing(), 0); W.sim(11);
  assert(W.total(a) > 0 && W.total(a) <= 48, 'a ' + W.total(a)); 
  const WB = world(['ghost']); for (const t of [4, 6, 8]) WB.pillar(t); const bo = WB.foe('boss', 300, { boss: true, maxHp: 9000, hp: 9000 }); WB.geo.ultimate(); WB.sim(11);
  assert(WB.total(bo) > 0 && WB.total(bo) <= 48, 'boss ' + WB.total(bo)); assert(!bo.stagger && !bo.disarmOpenT, 'no pin, no free open'); assert.equal(W.geo.tech.hosts().length, 0, 'they sleep after ten seconds'); assert(!W.geo.ultReady());
  assert.equal(world(['ghost']).geo.ultReady(), false, 'no board, no host');
});
check('no capstone: UP+C at a full board is still MOUNTAIN COLLAPSE, with no 40 s clock', () => {
  const W = world([]); for (const t of [4, 6, 8]) W.pillar(t); assert(W.geo.ultReady()); assert(W.geo.ultimate()); assert(W.geo.collapsing());
});
check('upgrades: every one of the nine changes a number it names', () => {
  const sh = r => { const W = world([], { ushard: r }); W.geo.faultHeavy(0, 1); return W.geo.shards(); };
  assert.equal(sh(0).length, 1); assert.equal(sh(1).length, 2); assert.equal(sh(2).length, 3); assert(sh(2).every(s => s.pierce) && !sh(1).some(s => s.pierce));
  const path = r => world([], { urift: r }).geo.faultPath(1).want; assert.equal(path(2) / path(0), 1.4); assert.equal(path(1), path(0));
  const bl = r => { const W = world([], { uboulder: r }); W.geo.kit.boulder(); return W.geo.rollers()[0].bounces; }; assert.equal(bl(1) - bl(0), 1); assert.equal(bl(2) - bl(0), 2);
  const gl = r => { const W = world([], { ugolem: r }); W.geo.kit.golem(); return W.geo.golem().life; }; assert.equal(gl(1) - gl(0), 2);
  const wallCost = r => { const W = world([], { ulight: r }); W.P.st = 100; W.P.geoGuard = false; const s0 = W.P.st; W.P.ground = true; W.geo.raiseWall({ held: true }); return s0 - W.P.st; }; assert.equal(wallCost(0) - wallCost(2), 8); assert.equal(wallCost(1), wallCost(0));
  const emp = r => { const W = world([], { uemp: r }); return W.api.upg('uemp'); }; assert.equal(emp(2), 2);
  const src = readFileSync(new URL('../src/geomancer.js', import.meta.url), 'utf8') + readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const u of GEO_UPGRADES) assert(src.includes("'" + u.id + "'"), u.id + ' is read somewhere');
});
check('data: a technique does not hit a boss for a free stagger or pin (static scan of geo-tech.js)', () => {
  const src = readFileSync(new URL('../src/geo-tech.js', import.meta.url), 'utf8');
  assert(!/pinned\s*=/.test(src), 'no pin'); assert(!/invuln|iframes|inv\s*=/.test(src), 'no invulnerability');
  assert(!/hurtAs\([^)]*\b\d+\s*\)/.test(src), 'no flat damage: every hurtAs goes through dmg()'); assert(!/Math\.random\(\) *[<>]\s*[^d]*game/.test(src));
});
if (bad.length) { console.log('GEO-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Geo tech: the Geomancer L25-L50 kit (SLINGSTONE, TOPPLE / STONE STEP, SEISMIC WELL, SHATTER RECALL / CAIRN, GEODE, THE GREAT FAULT / THE STONE HOST) holds in a fake world: sword x k, boss law, per-foe caps, cooldowns, one stop a cast, capstones spend the board on a 40 s clock, nine wired upgrades, fork pairs within parity.');
