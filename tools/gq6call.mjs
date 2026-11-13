// tools/gq6call.mjs - GQ6CALL, THE GEODE CALL, THE NODE HALF (claude/gq6geo, scratch/lane-reports/gq6-plan.md section C / slice S4). No page, no browser.
//   OFF  (flag default) the Geomancer is master's: three windups, no call state, no callRead, no callTell ever entered (a 40 s sim), the lab hand returns null
//   ON   (BRACKEN_GQ6CALL=1, run as a child of this tool)
//   RULES    the call takes the throw where n % 4 == 2 - only if he sees you, you are 60+ px off, there are 4+ rows of air over you, nobody has a live call beyond the caps; never a teach / early Geomancer's
//            (callOk); told 0.8 s; the landing aim follows you and LOCKS 0.5 s in; the stone lands where it locked; a blow breaks the tell
//   HANDS    a fake room: the stone falls 0.6 s after the tell, 9 within 14 px (a hero 15 px off or rolling is untouched), bursts into 2 hanging shards at +-13 px for 1.2 s; left alone they fade and
//            nobody is hurt but the one under the stone; ANY blow or hero shot (a swing, an arrow, an ember, a pistol ball, a hatchet, a hammer, the scythe, a stone shard: the nine heroes' kinds) sends one home:
//            it flies to him and hits for his own rock's damage + STAGGERED 1.4 s, its twin falls apart; caps: one live call per Geomancer, two in the level; no call under a ceiling
//   LAB      src/lab.js geoCall: the bot leaves the told ring (and rolls through if it is cornered), then walks to and strikes the nearest hanging shard
//   node tools/gq6call.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { install } from './node-canvas.mjs';
install();
globalThis.window = globalThis.window || {};
const { G6CALL, GCALL } = await import('../src/gq6geo.js');
const { GG, GG_MODES, newGeo, geoStep, callWanted } = await import('../src/gob-geomancer.js');
const { makeGobGeoHands } = await import('../src/gobgeo-hands.js');
const HS = await import('../src/hero-strikes.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const near = (a, b, e) => Math.abs(a - b) <= e;

/* ---- a fake room, as tools/gobgeo.mjs builds it (+ damage amounts, a ceiling switch, projectiles for the nine heroes' shots) ---- */
function room(o = {}) {
  const TS = 16, floor = 20 * TS;
  const st = { time: 0, parries: 0, enemies: [], props: [], opened: [], hurt: [], off: [], dmg: [], nums: [], rings: [], ceil: o.ceil || 0, embers: [], tracers: [], hammers: [], scythe: null, stones: [] };
  const heroes = (o.heroes || [{ x: 100, y: floor }]).map((h, i) => ({ dead: false, x: h.x, y: h.y, face: 1, hitSet: new Set(), seat: i, mode: h.mode || 'hit', swing: !!h.swing, rgArrows: [] }));
  let cur = heroes[0];
  const L = { rocklocks: [] };
  const ctx = { L, TS, EHP: { gobgeo: GG.hp }, sfx: new Proxy({}, { get: () => () => {} }), time: () => st.time, hero: () => cur, enemies: () => st.enemies, props: () => st.props, boss: () => null, VW: () => 480,
    number: (x, y, t) => st.nums.push(t), burst() {}, dust() {}, ring: (x, y, r, c) => st.rings.push({ x, y, r, c }), shake() {},
    eachHero: fn => { for (const h of heroes) { if (h.dead) continue; const p = cur; cur = h; fn(h); cur = p; } },
    damagePlayer: (x, d, who) => { st.dmg.push({ seat: cur.seat, d, x, name: who && who.name }); if (cur.mode === 'roll') return false; if (cur.mode === 'block') return 'blocked'; return 'hit'; },
    parries: () => st.parries, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: e => ({ l: e.x - e.w / 2, r: e.x + e.w / 2, t: e.y - e.h, b: e.y }),
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 26, b: cur.y }), attackBox: () => cur.swing ? (cur.face >= 0 ? { l: cur.x, r: cur.x + 30, t: cur.y - 30, b: cur.y } : { l: cur.x - 30, r: cur.x, t: cur.y - 30, b: cur.y }) : null,
    hurtAs: (tag, e, d) => { st.hurt.push({ tag, t: e.t, d }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, offBalance: (e, secs) => { st.off.push(e.t); e.broken = secs; },
    moveBody: () => ({ ground: true }), solidAt: (x, y) => y > floor || x < 0 || x > 1600 || (st.ceil && y < st.ceil && x < 150), standable: (tx, ty) => ty >= 20,
    openCells: cells => st.opened.push(...cells), players: heroes };
  const H = makeGobGeoHands(ctx); H.load();
  const geo = (x, o2 = {}) => { const e = H.spawn({ x, y: floor, vx: 0, vy: 0, face: -1, alive: true, stagger: 0, anim: 0 }, { face: -1, ...o2 }); e.maxHp = e.hp; st.enemies.push(e); return e; };
  const run = (secs, fn) => { for (let t = 0; t < secs; t += 1 / 60) { st.time += 1 / 60; for (const e of st.enemies) if (e.alive && e.t === 'gobgeo') { if (e.stagger > 0) e.stagger = Math.max(0, e.stagger - 1 / 60); H.foeUpdate(e, 1 / 60); } H.update(1 / 60); if (fn && fn()) return true; } return false; };
  HS.configure({ eachSeat: fn => ctx.eachHero(fn), hero: () => cur, attackBox: () => ctx.attackBox(), overlap: (a, b) => ctx.overlap(a, b), players: () => heroes, embers: () => st.embers, tracers: () => st.tracers, hammers: () => st.hammers, scythe: () => st.scythe, stones: () => st.stones });
  return { st, H, ctx, heroes, geo, run, floor, TS };
}
const call0 = w => (w.H.callRead() || { calls: [] }).calls[0];

if (!G6CALL) {
  ok(GG_MODES.length === 3 && !GG_MODES.includes('callTell'), 'FLAG OFF: three windups, no callTell');
  ok(!('callOk' in newGeo({ callOk: true })) && !('aim' in newGeo()), 'and no call state on him');
  { const w = room({ heroes: [{ x: 100, y: 320, mode: 'roll' }] }); const g = w.geo(260); const modes = new Set(); let thrown = 0; g.cd = 0; g.n = 1;
    w.run(40, () => { modes.add(g.mode); return false; }); thrown = w.H.read().n.thrown + w.H.read().n.slates;
    ok(![...modes].includes('callTell') && thrown >= 4 && w.H.callRead() === null && !('calls' in w.H.read().n), 'FLAG OFF, 40 s: he throws (' + thrown + ' throws) and never calls; callRead is null'); }
  { const lab = await import('../src/lab.js'); ok(lab.geoCall({ P: {}, keys: {} }, 'knight', 0) === null && lab.geoCall({ P: {}, keys: {}, gobgeo: () => ({ callRead: () => null }) }, 'knight', 0) === null, 'the lab hand is null with no call live'); }
  console.log('gq6call OFF: ' + n + ' checks');
  const r = spawnSync(process.execPath, [new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' ')], { env: { ...process.env, BRACKEN_GQ6CALL: '1' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  process.stdout.write(r.stdout || ''); if (r.status !== 0) { process.stderr.write(r.stderr || ''); process.exit(r.status || 1); }
  process.exit(0);
}

/* ================= ON: RULES ================= */
ok(GG_MODES.includes('callTell') && GG_MODES.every(m => m.endsWith('Tell')), 'FLAG ON: the call is a windup (...Tell)');
ok(GCALL.tell === 0.8 && GCALL.lockAt === 0.5 && GCALL.fall === 0.6 && GCALL.r === 14 && GCALL.dmg === 9 && GCALL.shards === 2 && GCALL.hang === 1.2 && GCALL.stagger === 1.4 && GCALL.every === 4 && GCALL.phase === 2 && GCALL.level === 2 && GCALL.perGeo === 1, 'the numbers are the plan\'s: 0.8 / lock 0.5 / fall 0.6 / r 14 / 9 / 2 shards / hang 1.2 / stagger 1.4 / n%4==2 / 1 per Geomancer, 2 per level');
const W0 = { tx: 220, ty: 200, ahead: () => true, roll: () => 0.5, tokWait: false, air: 6, callFree: true };
const fresh = (o = {}) => { const s = { x: 100, y: 200, face: -1, stagger: 0, maxHp: GG.hp, ...newGeo({ post: 100, callOk: true }) }; s.cd = 0; Object.assign(s, o); return s; };
{ const s = fresh({ n: 1 }); const r = geoStep(s, 1 / 60, W0);
  ok(s.mode === 'callTell' && r.events.some(e => e.ev === 'tell' && e.move === 'callTell') && near(s.modeT, GCALL.tell, 0.02), 'the throw where n % 4 == 2, seen, 120 px off, air over you: THE CALL is told (0.8 s)');
  ok(s.aim && s.aim.locked === false && s.held === false, 'the aim is live and no rock is held over his head');
  let t = 0, lockAt = -1, lockX = null, callEv = null, w = { ...W0 };
  while (t < 1.2 && !callEv) { if (t > 0.2 && t < 0.4) w = { ...w, tx: 180 }; if (t >= 0.55) w = { ...w, tx: 90 }; const r2 = geoStep(s, 1 / 60, w); t += 1 / 60; const lk = r2.events.find(e => e.ev === 'lock'); if (lk && lockAt < 0) { lockAt = t; lockX = lk.x; } callEv = r2.events.find(e => e.ev === 'call'); }
  ok(near(lockAt, GCALL.lockAt, 0.04) && lockX === 180, 'the aim FOLLOWED you and LOCKED at ' + lockAt.toFixed(2) + ' s on x ' + lockX + ' (where you were, not where you went)');
  ok(callEv && near(t + 1 / 60, GCALL.tell, 0.05) && callEv.x === 180, 'the stone is called at the END of the 0.8 s tell (' + t.toFixed(2) + ' s), on the LOCKED spot (' + callEv.x + ')');
  ok(s.mode === 'release' && s.relMove === 'callTell' && s.aim === null, 'then his release pose; the aim is cleared'); }
for (const [why, w, o] of [['a teach / early Geomancer (callOk false)', W0, { callOk: false }], ['you are 50 px off', { ...W0, tx: 150 }, { orbit: 0 }], ['a ceiling: 3 rows of air', { ...W0, air: 3 }, {}], ['two calls already live in the level (callFree false)', { ...W0, callFree: false }, {}], ['n % 4 is not 2 (n = 3)', W0, { n: 2 }]]) {
  const s = fresh({ n: 1, ...o }); geoStep(s, 1 / 60, w); ok(s.mode === 'rockTell' || s.mode === 'slateTell', 'NO call for ' + why + ': he throws instead (' + s.mode + ')'); }
{ const s = fresh({ n: 1, orbit: 3 }); let calls = 0, throws = 0; for (let k = 0; k < 12; k++) { s.cd = 0; s.mode = 'idle'; s.orbit = 3; geoStep(s, 1 / 60, W0); if (s.mode === 'callTell') calls++; else throws++; s.mode = 'idle'; s.aim = null; }
  ok(calls === 3 && throws === 9, 'over 12 decisions: ' + calls + ' calls, ' + throws + ' throws (every 4th throw is the call)'); }
{ const s = fresh({ n: 1 }); geoStep(s, 1 / 60, W0); s.stagger = 0.5; const r = geoStep(s, 1 / 60, W0); ok(r.events.some(e => e.ev === 'cancel' && e.move === 'callTell') && s.aim === null && s.mode === 'stagger', 'a blow (a stagger) breaks the tell: no stone'); }
ok(callWanted(fresh({ n: 2 }), W0, 120) === true && callWanted(fresh({ n: 3 }), W0, 120) === false && callWanted(fresh({ n: 2 }), W0, 59) === false, 'callWanted: the rotation and the 60 px floor');

/* ================= ON: HANDS ================= */
/* the sequence: tell -> fall -> stone -> two hanging shards */
function callWorld(heroes, o = {}) { const w = room({ heroes, ceil: o.ceil }); const g = w.geo(260, o.geo || {}); g.cd = 0; g.n = 1; return { ...w, g }; }
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); let t0 = -1;
  w.run(0.1); const c = call0(w); ok(c && c.state === 'tell' && w.g.mode === 'callTell', 'in the room: he tells the call (the landing ring is shown)');
  ok(w.st.dmg.length === 0, 'told: nothing hurts yet');
  w.run(0.25); ok(call0(w).state === 'tell' && call0(w).locked === false, 'the ring still follows you at 0.35 s');
  w.run(0.2); ok(call0(w).locked === true && w.st.rings.some(r => r.c === '#ff6b6b'), 'it LOCKS at 0.5 s (a red flash)');
  w.run(0.3); ok(call0(w).state === 'fall' && near(call0(w).x, 100, 1), 'at 0.8 s the stone is called: falling on x ' + call0(w).x + ' (' + call0(w).left.toFixed(2) + ' s left)');
  w.run(0.62); ok(w.st.dmg.length === 1 && w.st.dmg[0].d === 9 && w.st.dmg[0].name === 'THE GEODE CALL', 'it LANDS 0.6 s later: 9 (' + JSON.stringify(w.st.dmg[0]) + ')');
  const c2 = call0(w); ok(c2 && c2.state === 'hang' && c2.shards.length === 2 && near(c2.shards[0].x, 87, 0.5) && near(c2.shards[1].x, 113, 0.5), 'and bursts into TWO HANGING SHARDS at 13 px either side of the landing (' + c2.shards.map(s => Math.round(s.x)).join(', ') + ')');
  ok(near(c2.hang, GCALL.hang, 0.2), 'they hang 1.2 s (' + c2.hang.toFixed(2) + ' s left)');
  w.run(1.3); ok(w.H.callRead() === null && w.st.hurt.length === 0, 'left alone they FADE: nobody is hurt (the call costs you only the stone)');
  ok(w.H.read().n.calls === 1 && w.H.read().n.callHits === 1, 'counted: one call, one hit'); void t0; }
for (const [mode, x, want, why] of [['roll', 100, 0, 'a ROLL through the stone (i-frames)'], ['hit', 100 + 15, 0, 'standing 15 px off the landing (radius 14)'], ['hit', 100 + 13, 1, 'standing 13 px off'], ['block', 100, 0, 'a shield up']]) {
  const w = callWorld([{ x: 100, y: 320, mode }]); w.run(0.55); const h = w.heroes[0]; h.x = x; w.run(1.0); ok(w.st.dmg.length === (mode === 'hit' && want === 0 ? 0 : 1) || mode === 'roll' || mode === 'block', why + ': ' + w.st.dmg.length + ' hit(s)');
  if (mode === 'hit') ok(w.st.dmg.length === want, why + ' -> ' + want + ' hit'); else ok(!w.st.dmg.some(d => d.d !== 9) && w.H.read().n.callHits === 0, why + ': no damage counted'); }
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); w.run(0.55); w.heroes[0].x = 180; w.run(0.35); ok(near(call0(w).x, 100, 1) && w.heroes[0].x === 180, 'LEAVE THE RING after the lock: the stone still lands on x 100 (not on you at 180)'); w.run(0.7); ok(w.st.dmg.length === 0, 'and costs you nothing'); }
/* THE COUNTER: strike a hanging shard. A blow. */
function toHang(w) { return w.run(2.2, () => { const c = call0(w); return c && c.state === 'hang'; }); }
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); w.run(0.55); w.heroes[0].x = 60; toHang(w); const c = call0(w); ok(c && c.state === 'hang', 'a hanging pair to strike');
  const h = w.heroes[0]; h.x = c.shards[0].x - 24; h.swing = true; const hp0 = w.g.hp;
  w.run(0.1); ok(w.H.read().n.callHome === 1 && w.H.callRead() === null, 'a BLOW on a shard: it is SENT HOME and its twin falls apart (one payoff per call)'); h.swing = false;
  w.run(1.5); ok(w.st.hurt.some(x => x.t === 'gobgeo' && x.tag === 'reflect' && x.d >= GG.back.dmg && x.d === Math.max(GG.back.dmg, Math.round(w.g.maxHp * GG.back.share))), 'it flies to him and hurts him for his own rock\'s damage (' + (w.st.hurt[0] && w.st.hurt[0].d) + ')');
  ok(w.g.hp < hp0, 'and his bar drops (' + hp0 + ' -> ' + w.g.hp + ')'); }
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); w.run(0.55); w.heroes[0].x = 60; toHang(w); const c = call0(w); const h = w.heroes[0]; h.x = c.shards[0].x - 24; h.swing = true;
  let stag = 0; w.run(2, () => { stag = Math.max(stag, w.g.stagger || 0); return false; }); ok(stag >= GCALL.stagger - 0.1 && stag <= GCALL.stagger + 0.01, 'his stagger is 1.4 s (' + stag.toFixed(2) + ')'); }
/* every hero's kind of blow or shot */
const KINDS = [
  ['knight / paladin / berserker / warden / pirate / reaper / pyro / geomancer / ranger: the melee blow', (w, sh) => { const h = w.heroes[0]; h.x = sh.x - 24; h.swing = true; }],
  ['the ranger\'s arrow in flight', (w, sh) => { w.heroes[0].rgArrows.push({ state: 'fly', x: sh.x, y: sh.y, ggHit: false }); }],
  ['the pyro\'s ember', (w, sh) => { w.st.embers.push({ x: sh.x, y: sh.y, life: 0.5, r: 3 }); }],
  ['the pirate\'s / warden\'s pistol ball (a tracer line)', (w, sh) => { w.st.tracers.push({ x0: sh.x - 20, y0: sh.y, x1: sh.x + 20, y1: sh.y, life: 0.1 }); }],
  ['the berserker\'s hatchet', (w, sh) => { w.heroes[0].hatchets = [{ x: sh.x, y: sh.y, life: 0.5 }]; }],
  ['the paladin\'s hammer', (w, sh) => { w.st.hammers.push({ x: sh.x, y: sh.y }); }],
  ['the reaper\'s scythe', (w, sh) => { w.st.scythe = { x: sh.x, y: sh.y }; }],
  ['the geomancer\'s stone shard', (w, sh) => { w.st.stones.push({ x: sh.x, y: sh.y, life: 0.5 }); }],
];
for (const [name, put] of KINDS) { const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); w.run(0.55); w.heroes[0].x = 60; toHang(w); const c = call0(w); put(w, c.shards[1]); w.run(0.1);
  ok(w.H.read().n.callHome === 1 && w.H.callRead() === null, 'COUNTER ' + name + ': the shard goes HOME'); }
/* four seats: any seat's blow */
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }, { x: 60, y: 320, mode: 'hit' }, { x: 40, y: 320, mode: 'hit' }, { x: 20, y: 320, mode: 'hit' }]); w.run(0.55); w.heroes[0].x = 70; w.heroes[1].x = 50; toHang(w); const c = call0(w); w.heroes[3].x = c.shards[0].x - 24; w.heroes[3].swing = true; w.run(0.1);
  ok(w.H.read().n.callHome === 1, '4 seats: the BACK seat\'s blow sends a shard home too'); }
/* caps */
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'roll' }] }); const gs = [260, 300, 340].map(x => { const g = w.geo(x); g.cd = 0; g.n = 1; return g; }); let maxLive = 0, perGeo = 0; w.run(12, () => { const cs = (w.H.callRead() || { calls: [] }).calls; maxLive = Math.max(maxLive, cs.length); const st = w.H.test.state(); const owners = st.calls.map(c => c.owner); perGeo = Math.max(perGeo, ...gs.map(g => owners.filter(o => o === g).length), 0); return false; });
  ok(maxLive === 2 && perGeo === 1, 'three Geomancers in sight: never more than TWO calls live in the level (' + maxLive + '), never two from one Geomancer (' + perGeo + ')'); }
{ const w = callWorld([{ x: 100, y: 320, mode: 'roll' }], { ceil: 250 }); let called = false; w.run(30, () => { called = called || w.g.mode === 'callTell'; return false; }); ok(!called && w.H.read().n.thrown + w.H.read().n.slates >= 4, 'under a CEILING (3 rows of air): no call in 30 s, he throws instead'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'roll' }] }); const g = w.geo(260, { early: true }); g.cd = 0; g.n = 1; let called = false; w.run(30, () => { called = called || g.mode === 'callTell'; return false; }); ok(!called, 'an EARLY sighting never calls'); }
{ const w = room({ heroes: [{ x: 100, y: 320, mode: 'roll' }] }); const g = w.geo(260, { seal: 'gg-teach' }); g.cd = 0; g.n = 1; let called = false; w.run(30, () => { called = called || g.mode === 'callTell'; return false; }); ok(!called, 'the TEACH Geomancer (the sealed one) never calls'); }
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); w.run(0.3); w.g.stagger = 0.4; w.run(0.1); ok(w.H.callRead() === null, 'a stagger in the tell cancels the call (no stone, no ring)'); }
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); w.run(0.3); w.H.clear(); ok(w.H.callRead() === null, 'a respawn clears every call'); }
/* drawing does not throw (a node canvas) */
{ const w = callWorld([{ x: 100, y: 320, mode: 'hit' }]); const cv = new (globalThis.OffscreenCanvas || class { constructor() {} })(320, 180); const g2 = cv.getContext ? cv.getContext('2d') : null;
  if (g2) { let thrown = false; try { for (const secs of [0.2, 0.4, 0.6, 0.6, 0.4]) { w.run(secs); w.H.drawOver(g2, 0, 120, w.st.time); } } catch (e) { thrown = e.message; } ok(!thrown, 'drawOver through the tell, the fall and the hang does not throw' + (thrown ? ': ' + thrown : '')); }
  else ok(true, 'no canvas here: drawing is the browser lane\'s'); }

/* ================= ON: THE LAB BOT ================= */
const { geoCall, LAB_REACH } = await import('../src/lab.js');
function bot(h, heroX) { const w = callWorld([{ x: heroX, y: 320, mode: 'hit' }]); const P = w.heroes[0]; P.atk = -1; P.ground = true; P.dodge = 0; const keys = { left: false, right: false, atk: false, block: false, up: false, down: false, jump: false }; const presses = [];
  /* what each hero's attack key puts in the world (the melee heroes a blow box; the others their own shot, flying at 240 px/s along their chest line) */
  const shot = () => { const y = P.y - 14, vx = P.face * 240; if (h === 'ranger') P.rgArrows.push({ state: 'fly', x: P.x, y, vx }); else if (h === 'pyro') w.st.embers.push({ x: P.x, y, vx, life: 1, r: 3 }); else if (h === 'geomancer') w.st.stones.push({ x: P.x, y, vx, life: 1 }); else w.st.tracers.push({ x0: P.x, y0: y, x1: P.x + P.face * 120, y1: y, life: 0.1, vx: 0 }); };
  const MELEE = !['ranger', 'pyro', 'geomancer', 'warden', 'pirate'].includes(h);
  const BK = { P, keys, press: k => { presses.push(k); if (k === 'atk') { if (MELEE) P.swing = true; else shot(); } }, gobgeo: () => w.H }; return { w, P, keys, presses, BK, step: f => { P.swing = false; const r = geoCall(BK, h, f); if (r) { if (keys.left) P.x -= 1.5; if (keys.right) P.x += 1.5; }
      for (const a of P.rgArrows) a.x += (a.vx || 0) / 60; for (const q of w.st.embers.concat(w.st.stones)) q.x += (q.vx || 0) / 60; w.st.tracers = w.st.tracers.filter(t => (t.life -= 1 / 60) > 0);
      w.run(1 / 60); return r; } }; }
for (const h of ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger']) {
  const b = bot(h, 100); let hits = 0, struck = false, left = -1;
  for (let f = 0; f < 60 * 4; f++) { const r = b.step(f); if (left < 0 && call0(b.w) && call0(b.w).state === 'tell' && Math.abs(call0(b.w).x - b.P.x) > GCALL.r + 4) left = f; if (b.w.H.read().n.callHome > 0) { struck = true; break; } }
  b.w.run(1.0);
  ok(b.w.st.dmg.length === 0 || b.w.st.dmg.every(d => d.d !== 9), h + ': the bot LEAVES THE RING (took ' + b.w.st.dmg.length + ' stone hits) ...');
  ok(struck, h + ': ... and STRIKES A HANGING SHARD home (callHome ' + b.w.H.read().n.callHome + ')'); }
{ const b = bot('knight', 100); b.P.x = 100; let nullBefore = geoCall({ P: b.P, keys: b.keys, press() {}, gobgeo: () => ({ callRead: () => null }) }, 'knight', 0) === null; ok(nullBefore, 'no call live: the lab hand takes no frame'); }
console.log('gq6call ON: ' + n + ' checks');
