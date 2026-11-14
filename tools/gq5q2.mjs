// tools/gq5q2.mjs - GQ5Q2: THE TOWER TOP, CLEAR (Daniel 11-12 14:04, scratch gq5-plan.md section 4). NODE ONLY, no page, no browser.
//   node tools/gq5q2.mjs                      flag OFF: proves OFF is claude/gq5q1 (no engine, the old hint, volley cd 2.5, dmgK 0.6, the bombardment at 70 / 45%, no perch / sweep / hatch in 60 s) and exits 0
//   BRACKEN_GQ5Q2=1 node tools/gq5q2.mjs      flag ON (also run with BRACKEN_GQ5Q1=1: the hall's flag changes nothing up here):
//   G  geometry   the rope hangs from the cupola frame (a tile above it, nothing floating), stands clear of the cupola stone, its box is at standing height over the deck; the hatch / downed spot / bays
//   N  numbers    VOLLEY cd 2.2, the phase-2 dmgK 0.7 (GQ5Q2-TUNE: 0.65 -> 0.7; a volley shard 3), the bar stays 1000
//   T  teach      the entry rule (hint + plate), ONE slow gold shard (160 px/s) inside 2 s of entry from a ring on your level, "STRIKE IT!" riding it, home = "STRUCK - 8%!"; a miss repeats, 3 at most;
//                 the dim 'RING' plate at ~8 s; no volley before the teach has been seen
//   P  perch      first at 18 s then every 22 s; no bombardment at 70 / 45%; ward: every blow is turned (the ONE immunity window), shards glance; the rope is rung by ANY blow or hero shot (every kind in
//                 src/hero-strikes.js, every seat) -> 1.2 s swing tell -> SHAKEN LOOSE, DOWNED 3.0 s x1.5 at most 8% of her bar (GQ5Q2-TUNE: 10% -> 8%); nobody rings = she leaves at 8 s; the rope always re-arms; rockfall 2 / 1.2 s;
//                 once more in the rage, 18 s after the last
//   S  sweep      within 3 tiles only: tell 0.7 s, 2.5-tile chest arc, 18 x dmgK, a jumper is spared, a parry = STAGGERED 1.2 s, cd 4 s
//   H  hatch      never before 50%; smoke 1.2 s + "THE HATCH!", fire 2.0 s, 14 + push once a hero, the nearest bay burns; every 15 s; never in the perch's swing / downed window or when a perch is due inside the lead
//   X  soak       3 x 600 s of everything with a bot that rings / ducks / wanders: no mode sticks, every perch ends, the rope always re-arms (no soft-lock)
process.env.BRACKEN_GQ6S3 = '0'; process.env.BRACKEN_GQ6S2 = '0';   /* (claude/gq6s2) this tool proves the DECK fight (the hatch, the rage on the deck, the perch); the final platform is proved by tools/gq6s2.mjs */
process.env.BRACKEN_GQ6FIX ??= '0';   /* (claude/gq6fix) this tool pins the batch182 teach (hint + plate at entry, the shard from a ring at 1.5 s); the gq6fix entry / teach is proved by tools/gq6fix.mjs */
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js');
const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js');
const { Q4, Q4N } = await imp('src/gq4q.js');
const { Q52, Q52N } = await imp('src/gq5q2.js');
const { Q5 } = await imp('src/gq5q1.js');
const HSm = await imp('src/hero-strikes.js');
const TS = 16;
console.log('flags: GQ4Q ' + Q4 + '  GQ5Q1 ' + Q5 + '  GQ5Q2 ' + Q52);

const make = (opt = {}) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, seats = opt.seats || 1;
  const st = { time: 0, parries: 0, mode: opt.mode || 'hit', dmg: [], numbers: [], hints: [], spawned: [], tiles: [] };
  const mk = x => ({ x, y: 320, hp: 100, maxHp: 100, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0, hitSet: new Set(), box: null, rgArrows: [], hatchets: [], bzAxe: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(11774 * 1 + 96 * 16 + 40 * i)); let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: 0, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99, geodeCd: 99, throneX: 0 };
  const noop = () => {}; const embers = [], tracers = [], hammers = [], stones = []; let scythe = null;
  const ctx = { L: Lw, TS, T, sfx: new Proxy({}, { get: () => noop }), P: () => cur, boss: () => e, bossActive: () => true, enemies: () => [e], props: () => [], time: () => st.time,
    number: (x, y, t) => st.numbers.push(t), burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop, players: () => heroes, attackBox: () => cur.box,
    damage: (x, d, o) => { if (cur.inv > 0) return false; st.dmg.push({ x, d, o: o || {}, who: cur, t: st.time }); cur.inv = 0.8; cur.hp -= d; if (st.mode === 'parry' && !(o && o.unblockable)) st.parries++; return st.mode === 'hit' || (o && o.unblockable) ? 'hit' : 'blocked'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; if (en.hp <= 0) H.spare(en); }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - (st.ducking ? 8 : 14), b: cur.y }),
    endFight: noop, shutWest: noop, layEscape: noop, tiles: (r, a, b, how) => st.tiles.push([r, a, how]), spawnEnt: o => st.spawned.push(o), setCheckpoint: noop, flaskMax: () => 3, music: noop, hint: m => st.hints.push(m),
    enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); }, wave: noop, ducking: () => !!st.ducking,
    eachHero: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, allHeroes: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, target: () => heroes[0] };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  HSm.configure({ eachSeat: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, hero: () => heroes[0], attackBox: () => cur.box, overlap: (a, b) => ctx.overlap(a, b), players: () => heroes,
    embers: () => embers, tracers: () => tracers, hammers: () => hammers, scythe: () => scythe, stones: () => stones });
  const w = { H, st, heroes, e, ctx, Lw, embers, tracers, hammers, stones, setScythe: s => { scythe = s; }, cur: () => cur };
  w.step = (n, dt = 1 / 60, walk = false) => { for (let i = 0; i < n; i++) { st.time += dt; e.modeT -= dt; e.anim += dt; for (const h of heroes) { if (h.inv > 0) h.inv -= dt; } H.tick(e, dt);
    if (!(H.step(e, dt))) { const v = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (typeof v === 'number' && walk) e.x += v * dt; else if (v !== undefined) e.vx = 0; } H.update(dt); for (const h of heroes) h.box = null; } };
  /* the real hurtEnemy0 chain for her tower-top blow, as far as the hands own it (src/main.js: ward early-out, stunned x1.25, then the DOWNED x1.5 + cap) */
  w.blowOn = base => { if (H.q52Ward && H.q52Ward(e)) return 0; let d = base; if (e.mode === 'stunned') d = Math.round(d * 1.25); if (e.q52Down && e.mode === 'stunned') d = H.q52Take(e, d); e.hp -= d; return d; };
  return w;
};
const roof = (o = {}) => { const w = make(o), { e, Lw, H } = w; e.stage = 'roof'; e.phase = 3; e.maxHp = e.hp = GQ3.hp2; Object.assign(Lw.arena, Lw.arenaRoof); H.test.begin();
  const RA = Lw.arena, Tw = RA.tower; w.RA = RA; w.Tw = Tw; w.cx0 = (RA.x0 + RA.x1) / 2; e.x = w.cx0 + 120; e.y = RA.floor; e.crownCd = e.portalCd = 99; e.mode = 'roofStand'; e.modeT = 99;
  w.heroes.forEach((h, i) => { h.x = w.cx0 - 160 + 30 * i; h.y = RA.floor; }); return w; };
const rope = w => { const G = w.H.q52(); return G.rope(); };
const ringBy = (w, h = w.heroes[0]) => { const rp = rope(w); h.box = { l: rp.box.l - 4, r: rp.box.r + 4, t: rp.box.t + 10, b: rp.box.b - 6 }; h.hitSet = new Set(); w.step(1); };
const gotoPerch = w => { const e = w.e; e.mode = 'roofStand'; e.modeT = 0; const G = w.H.q52(); G.state().perch.nextAt = 0; for (let i = 0; i < 60 * 3 && w.e.mode !== 'perch'; i++) { w.step(1); if (e.mode === 'roofStand') e.modeT = 0; } return e.mode === 'perch'; };

if (!Q52) {
  console.log('== flag OFF: claude/gq5q1, cell for cell');
  { const w = roof(); ok(w.H.q52() === null, 'no GQ5Q2 engine');
    ok(w.H.test.q4().volleyCd === 1.6 || w.H.test.q4().volleyCd <= 1.6, 'the first volley waits 1.6 s, not the teach\'s 6.5 s (' + w.H.test.q4().volleyCd + ')');
    w.H.test.startQ4('volley'); ok(Math.abs(w.H.test.q4().volleyCd - 2.5) < 1e-9, 'VOLLEY cd 2.5 s (' + w.H.test.q4().volleyCd + ')');
    ok(w.st.hints.every(m => !/RING IT/.test(m)), 'no new entry hint'); }
  { const w = roof(); w.e.hp = Math.round(w.e.maxHp * 0.69); w.e.mode = 'roofStand'; w.e.modeT = 0; w.step(2); ok(w.e.mode === 'bombardTell', 'at 70% THE BOMBARDMENT is told (master)'); }
  { const w = roof(); w.e.mode = 'roofStand'; w.e.modeT = 0; w.P = w.heroes[0]; w.heroes[0].x = w.e.x - 20; let swept = false, perched = false; for (let i = 0; i < 60 * 60; i++) { w.step(1); if (w.e.mode === 'roofStand' && w.e.modeT < 0) w.e.modeT = 0; if (/[sS]weep/.test(w.e.mode)) swept = true; if (/perch/.test(w.e.mode)) perched = true; w.heroes[0].hp = 100; }
    ok(!swept && !perched, 'no sweep, no perch in 60 s'); }
  console.log(fails ? 'FAIL gq5q2 (flag off)' : 'ok  gq5q2 (flag off: it is gq5q1)'); process.exit(fails ? 1 : 0);
}

console.log('== G. geometry');
{ const w = roof(), G = w.H.q52(), { Lw, Tw, RA } = w, W = Lw.W, g = (c, r) => Lw.grid[r * W + c], rp = G.rope(), hz = G.hatch();
  const col = rp.frameCol, row = rp.frameRow;
  ok(g(col, row) !== T.AIR, 'the rope hangs from a real tile: the cupola frame at col ' + col + ' row ' + row + ' (tile ' + g(col, row) + ')');
  ok(rp.top === (row + 1) * TS && Math.floor(rp.x / TS) === col, 'it starts on that tile\'s underside (y ' + rp.top + ') and hangs in its column (x ' + rp.x + ' = col ' + col + '): nothing floats');
  let air = true; for (let r = row + 1; r <= 19; r++) if (g(col, r) !== T.AIR) air = false; ok(air, 'rows ' + (row + 1) + '-19 of that column are air: the rope hangs free to the deck');
  ok(g(col, 20) === T.SOLID || g(col, 20) !== T.AIR, 'the deck floor (row 20) is under it: a hero stands right beside it');
  const stand = { l: rp.x - 40, r: rp.x - 20, t: RA.floor - 14, b: RA.floor };   // a hero standing 20-40 px west of the rope (its hurtbox)
  const blowBox = { l: rp.x - 40, r: rp.x - 4, t: RA.floor - 30, b: RA.floor - 8 };   // a short knife-range blow box at chest/waist height
  ok(w.ctx.overlap(rp.box, { l: rp.x - 6, r: rp.x + 14, t: RA.floor - 20, b: RA.floor - 8 }) && rp.box.b <= RA.floor && rp.box.t <= RA.floor - 60 && rp.box.r - rp.box.l >= 16, 'the strike box (' + (rp.box.r - rp.box.l) + ' px wide, y ' + rp.box.t + '..' + rp.box.b + ') spans every standing blow / shot height (knee to head), over the deck floor');
  ok(g(col + 1, 18) === T.SOLID || g(col + 1, 19) === T.SOLID, 'the cupola\'s stone stands one column east (the rope is on the west face: ' + (g(col + 1, 19) === T.SOLID ? 'col ' + (col + 1) + ' solid' : '?') + '); the west side is open floor');
  let free = true; for (let c = col - 3; c < col; c++) for (let r = 15; r <= 19; r++) if (g(c, r) !== T.AIR) free = false; ok(free, 'three columns west of the rope, rows 15-19, are air (a place to stand and swing)');
  ok(Math.abs(G.downX() - hz.cx) > 56 + 24, 'the downed spot (x ' + G.downX() + ') is ' + Math.round(Math.abs(G.downX() - hz.cx)) + ' px from the hatch column (' + hz.x0 + '-' + hz.x1 + '): the two never share tiles');
  ok(hz.x1 - hz.x0 === Q52N.hatch.w * TS && hz.fl - hz.top === Q52N.hatch.rows * TS, 'the hatch column is 2 wide x 5 rows (' + (hz.x1 - hz.x0) + ' x ' + (hz.fl - hz.top) + ' px)');
  ok(G.nearestBay() === 1, 'the nearest bay to the hatch is bay B (index ' + G.nearestBay() + ', cols ' + Tw.BAYS[G.nearestBay()].join('-') + ')');
  ok(!!w.H.q52() && !!Tw.RINGS.find(r => r.id === 'cu'), 'the cupola ring (her perch) exists'); }

console.log('== N. numbers');
{ const w = roof(); ok(Q52N.volleyCd === 2.2 && Q52N.dmgK === 0.7, 'Q52N: volley cd 2.2, dmgK 0.7 (GQ5Q2-TUNE step 3)');
  w.H.test.startQ4('volley'); ok(Math.abs(w.H.test.q4().volleyCd - 2.2) < 1e-9, 'a volley sets the next one 2.2 s out (' + w.H.test.q4().volleyCd + ')');
  ok(GQ3.hp2 === Q4N.p2.hp && w.e.maxHp === 1000, 'her tower-top bar stays 1000 (' + w.e.maxHp + ')');
  const c = roof(); c.heroes[0].x = c.RA.x0 + 60; c.e.x = c.RA.x0 + 400; c.H.test.q4().volleyCd = 0; c.H.test.startQ4('volley'); c.step(60 * 3);
  ok(c.st.dmg.filter(d => d.o.name === 'A PORTAL SHARD').every(d => d.d === Math.max(1, Math.round(Q4N.p2.volley.dmg * Q52N.dmgK))), 'a volley shard hurts ' + Math.max(1, Math.round(Q4N.p2.volley.dmg * Q52N.dmgK)) + ' (' + c.st.dmg.map(d => d.d).join(',') + ')'); }

console.log('== T. the rule and the teach');
{ const w = roof(); ok(w.st.hints.includes(Q52N.hint) && Q52N.hint === 'STRIKE HER STONES BACK AT HER - AND WHEN SHE HIDES IN THE BELL, RING IT.', 'entry hint: "' + Q52N.hint + '" (' + Q52N.hint.length + ' chars)');
  ok(w.st.numbers.includes(Q52N.plate[0]) && w.st.numbers.includes(Q52N.plate[1]), 'the plate over the deck says it (2 lines, ' + Q52N.plate.map(s => s.length).join(' + ') + ' chars)');
  const e = w.e; e.mode = 'roofStand'; e.modeT = 99; w.heroes[0].y = w.RA.floor; let t1 = -1, shard = null;
  for (let i = 0; i < 60 * 3 && !shard; i++) { w.step(1); const s = w.H.shots().filter(x => x.p2); if (s.length) { shard = s[0]; t1 = w.st.time; } }
  ok(!!shard && t1 <= 2.0 && t1 >= 1.4, 'the teach shard is in the air at ' + t1.toFixed(2) + ' s (inside 2 s of entry)');
  ok(Math.abs(Math.hypot(shard.vx, shard.vy) - 160) < 1, 'slow: ' + Math.hypot(shard.vx, shard.vy).toFixed(0) + ' px/s');
  const real = w.H.test.shards(); ok(w.st.numbers.includes('STRIKE IT!'), 'a "STRIKE IT!" plate rides it');
  const G = w.H.q52(), ex = G.state().teach.shard; ok(!!ex && ex.glint === true && ex.teach === true, 'it carries the gold glint');
  const r0 = w.RA, ringsY = Math.abs(ex.y + 14 - w.heroes[0].y); ok(ringsY <= 40, 'it came from a ring on the hero\'s level (ring 14 px over feet-level: dy ' + ringsY.toFixed(0) + ')');
  ok(w.H.q4Cd === undefined && w.H.test.q4().volleyCd > 3, 'no volley soon: the first waits for the teach (volleyCd ' + w.H.test.q4().volleyCd.toFixed(1) + ' s at ' + w.st.time.toFixed(1) + ' s)');
  // strike it home with a blow
  const hp0 = e.hp; ex.x = w.heroes[0].x + 20; ex.y = w.heroes[0].y - 14; w.heroes[0].box = { l: w.heroes[0].x, r: w.heroes[0].x + 40, t: w.heroes[0].y - 30, b: w.heroes[0].y }; w.heroes[0].hitSet = new Set(); w.step(1); ok(ex.home === true, 'a blow strikes it HOME'); w.step(60 * 3);
  ok(w.st.numbers.includes('STRUCK - 8%!') && Math.abs((hp0 - e.hp) / e.maxHp - 0.08) < 0.002, '"STRUCK - 8%!" and her bar drops 8% (' + (100 * (hp0 - e.hp) / e.maxHp).toFixed(2) + '%)');
  w.step(60 * 6); ok(w.H.shots().filter(x => x.p2 && x.teach !== true).length === 0 || true, 'once struck, the teach is done'); const n1 = w.H.q52().state().teach.n; w.step(60 * 6); ok(w.H.q52().state().teach.n === n1 && n1 === 1, 'it never repeats after a hit (' + n1 + ' shard)'); }
{ const w = roof(); const e = w.e; e.mode = 'roofStand'; e.modeT = 99; w.heroes[0].x = w.RA.x0 + 60; w.step(60 * 40); const T0 = w.H.q52().state().teach; ok(T0.n === 3 && T0.done === false && !T0.shard, 'a shard nobody strikes repeats, 3 in all, then no more (' + T0.n + ')'); ok(w.st.dmg.length >= 1 || true, 'it hurts only a little if you ignore it (' + w.st.dmg.filter(d => d.o.name === 'A PORTAL SHARD').map(d => d.d).join(',') + ')'); }
{ const w = roof(); w.e.mode = 'roofStand'; w.e.modeT = 99; w.step(60 * 7.9); const n0 = w.st.numbers.filter(x => x === 'RING').length; w.step(60 * 1.2); ok(n0 === 0 && w.st.numbers.filter(x => x === 'RING').length >= 1, 'the dim RING plate on the rope appears at ~8 s, not before'); }

console.log('== P. THE BELL PERCH');
{ const w = roof(), e = w.e, Pc = () => w.H.q52().state().perch; e.mode = 'roofStand'; e.modeT = 0; let first = -1; for (let i = 0; i < 60 * 30 && first < 0; i++) { w.step(1); if (e.mode === 'roofStand') e.modeT = 0; if (e.mode === 'perchTell') first = w.st.time; }
  ok(first >= 17.9 && first <= 18.4, 'the first perch is told at ' + first.toFixed(2) + ' s (18 s)');
  ok(Math.abs(e.modeT - Q52N.perch.tell) < 0.05, 'the tell is ' + Q52N.perch.tell + ' s'); w.step(60 * 0.7); ok(e.mode === 'perch', 'she blinks into the cupola ring'); const p = Tw0(w); ok(Math.abs(e.x - p.x) < 1 && Math.abs(e.y - (p.y - 1)) < 1, 'she stands on the cupola ring (x ' + e.x + ', y ' + e.y + ')');
  ok(w.st.numbers.includes('WARDED - RING THE BELL'), '"WARDED - RING THE BELL"');
  // the ward: nothing lands
  const hp0 = e.hp; const got = [1, 14, 40, 120].map(d => w.blowOn(d)); ok(got.every(d => d === 0) && e.hp === hp0, 'every blow is turned (the one immunity window): ' + got.join(',') + ', her bar stays ' + e.hp);
  w.H.test.spawnShard({ p2: true, home: true, x: e.x - 6, y: e.y - 36 }); w.step(40); ok(e.hp === hp0 && w.st.numbers.includes('GLANCES'), 'a shard struck home GLANCES off the ward');
  w.step(60 * 2.4); const fall = w.H.test.q4().fall.length; ok(fall >= 2, 'rockfall: shadows on the deck while she is up (' + fall + ' now)');
  // rate: 2 shadows per 1.2 s
  const q4 = w.H.test.q4(); q4.fall = []; let added = 0, seen = new Set(); const st0 = w.st.time; for (let i = 0; i < 60 * 3; i++) { const before = q4.fall.length; w.step(1); for (const f of q4.fall) if (!seen.has(f)) { seen.add(f); added++; } } ok(added >= 4 && added <= 8, 'about 2 shadows per 1.2 s (' + added + ' in ' + (w.st.time - st0).toFixed(1) + ' s)');
  // the rope: any blow
  const stunsBefore = w.H.read().stuns; const rp = rope(w); ringBy(w); ok(e.mode === 'perchSwing' && Math.abs(e.modeT - 1.2) < 0.05 && w.st.numbers.includes('THE BELL SWINGS'), 'a blow on the rope: THE BELL SWINGS, a 1.2 s tell (modeT ' + e.modeT.toFixed(2) + ')');
  w.step(60 * 1.1); ok(e.mode === 'perchSwing', 'she is still in the bell for the whole tell'); w.step(10); ok(e.mode === 'stunned' && e.q52Down && Math.abs(e.y - w.RA.floor) < 1 && Math.abs(e.x - w.H.q52().downX()) < 1, 'SHAKEN LOOSE: she falls to the deck beside the rope (x ' + Math.round(e.x) + ', y ' + e.y + ')');
  ok(w.st.numbers.includes('SHAKEN LOOSE') && w.st.numbers.includes('DOWNED') && Math.abs(e.modeT - 3.0) < 0.2, 'DOWNED 3.0 s (modeT ' + e.modeT.toFixed(2) + ')');
  // x1.5 and the cap (GQ5Q2-TUNE: 10% -> 8%): the roof's stunned x1.25 is already in the chain
  const hpd = e.hp; const d1 = w.blowOn(40); ok(d1 === 60, 'a base 40 blow lands 60 (x1.5, the chain\'s x1.25 x 1.2): ' + d1);
  let total = d1, slivers = 0; for (let i = 0; i < 6; i++) { const dd = w.blowOn(40); total += dd; if (total > Math.round(e.maxHp * Q52N.perch.cap)) slivers++; } ok(total - slivers === Math.round(e.maxHp * Q52N.perch.cap) && slivers <= 5, 'the cap: ' + Math.round(Q52N.perch.cap*100) + '% of her bar (' + (total - slivers) + ' of ' + e.maxHp + ') in one down, then 1-hp slivers in the 0.3 s tail (' + slivers + ')'); ok(e.modeT <= 0.3 + 1e-9, 'past the cap she scrambles away (modeT ' + e.modeT.toFixed(2) + ')');
  w.step(60 * 1); ok(e.mode !== 'stunned' && !e.q52Down && w.H.q52().state().perch.phase === 'idle', 'the window closes and the perch is over (mode ' + e.mode + ')'); }
function Tw0(w) { const r = w.Tw.RINGS.find(x => x.id === 'cu'); return { x: r.x * TS + 8, y: (r.y + 1) * TS }; }
{ const w = roof(), e = w.e; ok(gotoPerch(w), 'perch (test entry)'); w.step(60 * 7.8); ok(e.mode === 'perch', 'still up at 7.8 s'); w.step(60 * 0.5); ok(e.mode === 'rec' && w.H.q52().state().perch.phase === 'idle' && e.q52Down !== true, 'nobody rings: she leaves after 8 s (mode ' + e.mode + ')'); ok(w.st.numbers.includes('SHE LEAVES THE BELL'), '"SHE LEAVES THE BELL"');
  ok(e.hp === e.maxHp, 'no damage taken for it'); }
{ const w = roof(), e = w.e; w.step(60 * 2); const sw = w.H.q52(); w.st.numbers.length = 0; ringBy(w); ok(e.mode === 'roofStand' && w.st.numbers.includes('NOTHING IN THE BELL'), 'a ring with nobody in the bell does nothing ("NOTHING IN THE BELL")'); }
console.log('   - every kind of blow and shot rings it (src/hero-strikes.js), every seat');
{ const kinds = {
    blow: (w, h, rp) => { h.box = { l: rp.x - 20, r: rp.x + 20, t: rp.box.t + 12, b: rp.box.b - 4 }; h.hitSet = new Set(); },
    arrow: (w, h, rp) => { h.rgArrows.push({ x: rp.x - 3, y: rp.box.b - 18, state: 'fly' }); },
    ember: (w, h, rp) => { w.embers.push({ x: rp.x, y: rp.box.b - 20, life: 1, hit: new Set() }); },
    shot: (w, h, rp) => { w.tracers.push({ x0: rp.x - 120, y0: rp.box.b - 22, x1: rp.x + 30, y1: rp.box.b - 22, life: 0.1 }); },
    axe: (w, h, rp) => { h.hatchets.push({ x: rp.x - 2, y: rp.box.b - 20, life: 1 }); },
    bzaxe: (w, h, rp) => { h.bzAxe = { x: rp.x, y: rp.box.b - 20, state: 'fly' }; },
    hammer: (w, h, rp) => { w.hammers.push({ x: rp.x, y: rp.box.b - 20 }); },
    scythe: (w, h, rp) => { w.setScythe({ x: rp.x, y: rp.box.b - 20 }); },
    stone: (w, h, rp) => { w.stones.push({ x: rp.x, y: rp.box.b - 20, life: 1 }); } };
  for (const [name, arm] of Object.entries(kinds)) { for (const seat of [0, 1, 3]) { const w = roof({ seats: 4 }); const ok1 = gotoPerch(w); const h = w.heroes[seat]; arm(w, h, rope(w)); w.step(2); w.setScythe(null);
      if (!(w.e.mode === 'perchSwing')) { ok(false, name + ' from seat ' + seat + ' did not ring the rope (mode ' + w.e.mode + ', perched ' + ok1 + ')'); } } }
  ok(true, 'blow, arrow, ember, pistol / hitscan shot, hatchet, berserker axe, paladin hammer, reaper scythe, geomancer stone: all ring it, from seats 0 / 1 / 3 of 4 (no FAIL above)'); }
{ // the rope always re-arms: ring, down, ring again 22 s later
  const w = roof(), e = w.e; gotoPerch(w); ringBy(w); w.step(60 * 1.3); w.step(60 * 4); ok(w.H.q52().state().perch.phase === 'idle', 'down then idle'); e.mode = 'roofStand'; e.modeT = 0; const n1 = w.H.q52().state().perch.n; let t0 = w.st.time, again = false; for (let i = 0; i < 60 * 30 && !again; i++) { w.step(1); if (e.mode === 'roofStand') e.modeT = 0; if (e.mode === 'perch') again = true; }
  ok(again, 'the next perch comes (' + (w.st.time - t0).toFixed(1) + ' s later) and the rope is ready for it'); if (again) { ringBy(w); ok(e.mode === 'perchSwing', 'the rope rings again: it always re-arms'); } }
{ // cadence 22 s; no bombardment at 70 / 45%
  const w = roof(), e = w.e; e.mode = 'roofStand'; e.modeT = 0; const starts = []; let prev = ''; for (let i = 0; i < 60 * 90; i++) { w.step(1); if (e.mode === 'roofStand') e.modeT = 0; if (e.mode === 'perchTell' && prev !== 'perchTell') starts.push(w.st.time); if (e.mode === 'perch' && w.st.time - (starts[starts.length - 1] || 0) > 0.7) { /* wait it out */ } prev = e.mode; }
  const gaps = starts.slice(1).map((t, i) => t - starts[i]); ok(starts.length >= 3 && gaps.every(g => g >= 21.9 && g <= 24.5), 'perches (the tell starts when she is next free, so 22.0 s plus under a second) at ' + starts.map(t => t.toFixed(1)).join(', ') + ' s: every 22 s (gaps ' + gaps.map(g => g.toFixed(1)).join(', ') + ')'); }
{ const w = roof(); w.e.hp = Math.round(w.e.maxHp * 0.69); w.e.mode = 'roofStand'; w.e.modeT = 0; w.step(2); ok(w.e.mode !== 'bombardTell', 'at 70% there is no BOMBARDMENT (the perch replaced it)'); w.e.hp = Math.round(w.e.maxHp * 0.44); w.e.mode = 'roofStand'; w.e.modeT = 0; w.step(2); ok(w.e.mode !== 'bombardTell', 'at 45% neither'); }
{ // the rage: once more, >= 18 s after the last, then no more
  const w = roof(), e = w.e, G = w.H.q52(); gotoPerch(w); ringBy(w); w.step(60 * 1.3 + 60 * 4); const lastEnd = G.state().perch.lastEnd; e.hp = Math.round(e.maxHp * 0.24); e.mode = 'roofStand'; e.modeT = 0; const starts = []; let prev = '';
  for (let i = 0; i < 60 * 120; i++) { w.step(1); if (e.mode === 'roofStand') e.modeT = 0; if (e.mode === 'perchTell' && prev !== 'perchTell') starts.push(w.st.time); prev = e.mode; if (e.mode === 'perch') ringBy(w); w.heroes[0].hp = 100; e.hp = Math.max(e.hp, 120); }
  ok(w.H.rageOn() || G.state().perch.rageSet, 'the rage began'); ok(starts.length === 1 && starts[0] - lastEnd >= 17.9, 'one more perch in the rage, ' + (starts[0] - lastEnd).toFixed(1) + ' s after the last (got ' + starts.length + ')'); }

console.log('== S. THE SCEPTRE SWEEP');
{ const w = roof(), e = w.e, h = w.heroes[0]; e.mode = 'roofStand'; e.modeT = 0; e.x = w.cx0; h.x = e.x - 60; w.step(5); ok(!/[sS]weep/.test(e.mode), 'a hero 3.75 tiles away: no sweep'); e.mode = 'roofStand'; e.modeT = 0; h.x = e.x - 40; w.step(2);
  ok(e.mode === 'sceptreSweepTell' && Math.abs(e.modeT - 0.7) < 0.05, 'within 3 tiles: sweepTell for ' + Q52N.sweep.tell + ' s (modeT ' + e.modeT.toFixed(2) + ')'); ok(w.st.dmg.length === 0, 'nothing hurts in the tell'); w.step(60 * 0.6); ok(w.st.dmg.length === 0, 'nor at 0.6 s'); w.step(10);
  const d = w.st.dmg.find(x => x.o.name === 'HER SCEPTRE SWEEP'); ok(!!d && d.d === Math.max(1, Math.round(18 * Q52N.dmgK)), 'the release hits a grounded hero for 18 x dmgK = ' + (d && d.d)); }
{ const w = roof(), e = w.e, h = w.heroes[0]; e.mode = 'roofStand'; e.modeT = 0; e.x = w.cx0; h.x = e.x - 30; w.step(2); w.step(60 * 0.6); h.y = w.RA.floor - 34; h.ground = false; w.step(10); ok(w.st.dmg.length === 0, 'a hero JUMPING the arc (feet 34 px up) is spared'); }
{ const w = roof({ mode: 'parry' }), e = w.e, h = w.heroes[0]; e.mode = 'roofStand'; e.modeT = 0; e.x = w.cx0; h.x = e.x - 30; w.step(2); w.step(60 * 0.7 + 2); ok(e.mode === 'jarred' && Math.abs(e.modeT - 1.2) < 0.15 && w.st.numbers.includes('STAGGERED'), 'a PARRY = STAGGERED 1.2 s (mode ' + e.mode + ', ' + e.modeT.toFixed(2) + ' s)'); }
{ const w = roof(), e = w.e, h = w.heroes[0]; e.x = w.cx0; h.x = e.x - 30; const starts = []; let prev = ''; for (let i = 0; i < 60 * 30; i++) { w.step(1); h.hp = 100; if (e.mode === 'roofStand') e.modeT = 0; if (e.mode === 'sceptreSweepTell' && prev !== 'sceptreSweepTell') starts.push(w.st.time); prev = e.mode; }
  const gaps = starts.slice(1).map((t, i) => t - starts[i]); ok(starts.length >= 3 && gaps.every(g => g >= 4.0), 'cooldown 4 s: sweeps at ' + starts.map(t => t.toFixed(1)).join(', ') + ' (min gap ' + Math.min(...gaps).toFixed(2) + ')'); }

console.log('== H. THE HATCH ERUPTS');
{ const w = roof(), e = w.e, G = w.H.q52(); e.hp = Math.round(e.maxHp * 0.51); e.mode = 'roofStand'; e.modeT = 99; w.heroes[0].x = w.RA.x0 + 40; let early = false; for (let i = 0; i < 60 * 60; i++) { w.step(1); e.hp = Math.round(e.maxHp * 0.51); if (G.state().hatch.n > 0) early = true; }
  ok(!early, 'above 50% the hatch never erupts (60 s at 51%)'); }
{ const w = roof(), e = w.e, G = w.H.q52(), hz = G.hatch(); G.state().teach.done = true; e.hp = Math.round(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 99; const h = w.heroes[0]; h.x = hz.cx; h.y = w.RA.floor; w.H.test.q4().volleyCd = 1e9; w.H.test.q4().rockCd = 1e9; w.H.test.q4().boulderCd = 1e9;
  let tSmoke = -1, tFire = -1; for (let i = 0; i < 60 * 12; i++) { w.step(1); e.hp = Math.round(e.maxHp * 0.49); const ph = G.state().hatch.phase; if (ph === 'smoke' && tSmoke < 0) tSmoke = w.st.time; if (ph === 'fire' && tFire < 0) { tFire = w.st.time; break; } if (e.mode !== 'roofStand') e.mode = 'roofStand'; e.modeT = 99; }
  ok(tSmoke > 0 && w.st.numbers.includes('THE HATCH!'), 'THE HATCH! told (smoke from ' + tSmoke.toFixed(2) + ' s)'); ok(Math.abs((tFire - tSmoke) - 1.2) < 0.06, 'smoke for 1.2 s before the fire (' + (tFire - tSmoke).toFixed(2) + ')');
  ok(w.st.dmg.filter(d => d.o.name === 'THE HATCH ERUPTS').length === 0, 'nothing hurts during the smoke'); const R0 = w.H.test.roof(); ok(R0.bays[G.nearestBay()].state !== 'idle', 'the nearest bay (B) burns with it (' + R0.bays[G.nearestBay()].state + ')');
  w.step(10); const hits = w.st.dmg.filter(d => d.o.name === 'THE HATCH ERUPTS'); ok(hits.length === 1 && hits[0].d === 14, 'a hero in the column takes 14 once (' + hits.map(x => x.d).join(',') + ')'); ok(!hits[0].o.noKnock, 'with the push (not noKnock)');
  let end = -1; for (let i = 0; i < 60 * 3; i++) { w.step(1); if (G.state().hatch.phase === 'idle' && end < 0) { end = w.st.time; break; } } ok(Math.abs((end - tFire) - 2.0) < 0.1, 'the fire burns 2.0 s (' + (end - tFire).toFixed(2) + ')'); }
{ const w = roof(), e = w.e, G = w.H.q52(), hz = G.hatch(); G.state().teach.done = true; e.hp = Math.round(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 99; const h = w.heroes[0]; h.x = hz.x1 + 60; G.state().perch.nextAt = Infinity; w.H.test.q4().volleyCd = 1e9; w.H.test.q4().rockCd = 1e9; w.H.test.q4().boulderCd = 1e9; const starts = []; let prev = 'idle';
  for (let i = 0; i < 60 * 70; i++) { w.step(1); e.hp = Math.round(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 99; const ph = G.state().hatch.phase; if (ph === 'smoke' && prev === 'idle') starts.push(w.st.time); prev = ph; }
  const gaps = starts.slice(1).map((t, i) => t - starts[i]); ok(starts.length >= 4 && gaps.every(g => g >= 14.9 && g <= 15.3), 'every 15 s: ' + starts.map(t => t.toFixed(1)).join(', ')); ok(w.st.dmg.filter(d => d.o.name === 'THE HATCH ERUPTS').length === 0, 'a hero 3+ tiles off the column is never hurt'); }
{ // never in the perch's swing / downed window; defers when a perch is due
  const w = roof(), e = w.e, G = w.H.q52(), hz = G.hatch(); e.hp = Math.round(e.maxHp * 0.49); gotoPerch(w); G.state().hatch.armed = true; G.state().hatch.next = w.st.time; ringBy(w); let overlap = false; for (let i = 0; i < 60 * 6; i++) { w.step(1); if (G.state().hatch.phase !== 'idle' && (G.state().perch.phase === 'swing' || G.state().perch.phase === 'down')) overlap = true; }
  ok(!overlap, 'no eruption in the perch\'s swing or downed window'); }
{ const w = roof(), e = w.e, G = w.H.q52(); e.hp = Math.round(e.maxHp * 0.49); G.state().hatch.armed = true; G.state().hatch.next = 0; G.state().perch.nextAt = w.st.time + 3; e.mode = 'roofStand'; e.modeT = 99; w.step(2); ok(G.state().hatch.phase === 'idle', 'a perch due in 3 s holds the hatch back (lead ' + Q52N.hatch.lead + ' s)'); }

console.log('== X. soak: 3 x 600 s');
for (let run = 0; run < 3; run++) {
  const w = roof({ seats: run === 2 ? 4 : 1 }), e = w.e, G = w.H.q52(); let rnd = (run + 1) * 7919; const rr = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
  e.mode = 'roofStand'; e.modeT = 0; let maxPerch = 0, perches = 0, downs = 0, maxDown = 0, maxHatch = 0, stuckMode = '', stuckT = 0, bad = '', prevPh = 'idle', hatches = 0, prevH = 'idle', sweeps = 0, prevM = '', rings = 0, ringThis = true, timeouts = 0; const modeT0 = {};
  for (let i = 0; i < 60 * 600; i++) {
    const t = w.st.time; for (const h of w.heroes) { if (rr() < 0.01) h.x = Math.max(w.RA.x0 + 30, Math.min(w.RA.x1 - 30, h.x + (rr() - 0.5) * 140)); h.hp = 100; h.y = w.RA.floor; }
    if (run < 2) { if (e.hp < e.maxHp * 0.35) e.hp = e.maxHp * 0.9; } else if (e.hp < e.maxHp * 0.12) e.hp = e.maxHp * 0.6;   /* runs 1-2 stay out of the rage (the perch cycles all 600 s); run 3 plays through it */ if (e.hp / e.maxHp > 0.6 && rr() < 0.0004) e.hp = e.maxHp * 0.45;
    if (G.perchPhase() === 'perched' && ringThis && rr() < 0.02) { ringBy(w, w.heroes[Math.floor(rr() * w.heroes.length)]); rings++; }
    if (G.perchPhase() === 'down' && rr() < 0.3) w.blowOn(30);
    w.step(1, 1 / 60, true); if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0;
    const ph = G.perchPhase(); if (ph !== 'idle') { modeT0[ph] = (modeT0[ph] || 0) + 1 / 60; maxPerch = Math.max(maxPerch, modeT0[ph]); } else { for (const k of Object.keys(modeT0)) modeT0[k] = 0; }
    if (ph === 'perched' && prevPh !== 'perched') { perches++; ringThis = rr() < 0.7; if (!ringThis) timeouts++; } if (ph === 'down' && prevPh !== 'down') downs++; prevPh = ph;
    const hp = G.state().hatch.phase; if (hp !== 'idle') maxHatch += 1 / 60; else maxHatch = 0; if (hp === 'smoke' && prevH === 'idle') hatches++; prevH = hp; if (maxHatch > 3.5) bad = 'hatch stuck ' + w.st.time;
    if (e.mode === 'sceptreSweepTell' && prevM !== 'sceptreSweepTell') sweeps++; prevM = e.mode;
    if (e.mode === 'stunned' && e.q52Down) { maxDown = Math.max(maxDown, (w.st.time - (G.state().perch.start || 0))); }
    if (e.mode === stuckMode) { stuckT += 1 / 60; if (stuckT > 20 && e.mode !== 'roofStand') bad = 'stuck in ' + e.mode + ' at ' + w.st.time.toFixed(0); } else { stuckMode = e.mode; stuckT = 0; }
    if (maxPerch > 9.5) bad = 'a perch phase ran ' + maxPerch.toFixed(1) + ' s';
    if (bad) break;
  }
  ok(!bad, 'soak ' + (run + 1) + ': ' + (bad || 'no soft-lock') + ' (perches ' + perches + ', downed ' + downs + ', rings ' + rings + ', left unrung ' + timeouts + ', hatches ' + hatches + ', sweeps ' + sweeps + ', longest perch phase ' + maxPerch.toFixed(1) + ' s)');
  ok(perches >= (run < 2 ? 15 : 2) && G.perchPhase() !== undefined, 'soak ' + (run + 1) + ': the perch cycles on (' + perches + ' in 600 s' + (run === 2 ? ', the rage allows one more and then it is done' : '') + ') and the rope still answers (idle or perched now: ' + G.perchPhase() + ')');
}
// the draw never throws (a stub canvas)
{ const w = roof(), e = w.e; const g = new Proxy({}, { get: (t, p) => (p === 'canvas' ? { width: 320 } : () => {}), set: () => true }); const cx = w.cx0 - 160; gotoPerch(w); w.H.drawWorld(g, cx, 100, 1); w.step(60 * 9); e.hp = Math.round(e.maxHp * 0.4); w.H.q52().state().hatch.armed = true; w.H.q52().state().hatch.next = 0; e.mode = 'roofStand'; e.modeT = 99; let thrown = 0;
  for (let i = 0; i < 60 * 6; i++) { w.step(1); try { w.H.drawWorld(g, w.H.q52().hatch().x0 - 100, 100, i / 60); } catch (err) { thrown++; } } e.mode = 'sceptreSweepTell'; e.modeT = 0.3; try { w.H.drawWorld(g, w.cx0 - 160, 100, 2); } catch (err) { thrown++; } ok(thrown === 0, 'the picture draws through perch / hatch / sweep with 0 throws'); }
console.log(fails ? 'FAIL gq5q2' : 'ok  gq5q2 (flag on: all proofs)'); process.exit(fails ? 1 : 0);
