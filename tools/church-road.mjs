// tools/church-road.mjs - THE LIT CHURCH'S ROAD OPENS ON WAYMEET'S THREE VOTIVE LAMPS (claude/towpathchurch, 2026-10-16; Daniel 10-08, confirmed 10-16; scratch/brief-crusader2-1016.md section 3).
//   A  NODE ONLY: the LEVELS row (needs + spurOf waymeet, votiveLamps, no opensOn / Towpath medal gate); WAYMEET builds three lofts (a ladder, a plank on its poles with a stilt at each end, a dark
//      lamp on it) and a brazier by each, every one clear of the street's route and of every other thing in the town; the Towpath's first screen has no church door; the flame verb is ONE module
//      (src/flame.js) that the church's hands and the votive hands both call (not a copy); the locked tip says LIGHT WAYMEET'S VOTIVE LAMPS n/3.
//   B  THE PAGE: with a Towpath GOLD medal and everything else cleared the church stays SHUT (the old bronze gate is gone); E at a brazier puts a flame in the hand, E at a lamp lights it only with
//      one; the flame burns out in FLAME.life s and a blow that lands on the hero puts it out; a lit lamp is SAVED and is still lit when Waymeet is loaded again; 1/3 and 2/3 keep the road shut; the
//      third opens it (PROG.churchOpen) and the key press at Waymeet walks the spur; old saves keep it: a Towpath bronze medal, or the church cleared (progDefaults' churchMig), but a fresh save with
//      no medal does not; and one hero climbs the first loft with REAL KEYS (take the flame, ladder, plank, light).
//   node tools/church-road.mjs     (PORT)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { FLAME } from '../src/flame.js';
import { VOTIVE_IDS, VOTIVE_N } from '../src/votive-hands.js';
import { openPage } from './cdp.mjs';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok   ' + m); };
const read = u => readFileSync(new URL(u, import.meta.url), 'utf8');

/* ---- A. NODE ---- */
const ch = LEVELS.find(l => l.id === 'church');
ok(ch.needs === 'waymeet' && ch.spurOf === 'waymeet' && ch.votiveLamps === 'waymeet' && !ch.opensOn && ch.classFor === 'paladin', 'the church: a spur off WAYMEET, opened by its votive lamps, no Towpath medal gate, still the Paladin\'s level');
const W = LEVELS.find(l => l.id === 'waymeet').build(), at = (x, y) => (x < 0 || y < 0 || x >= W.W || y >= W.H ? T.SOLID : W.grid[y * W.W + x]), R = 36;
ok(W.votive && W.votive.lamps.length === VOTIVE_N && VOTIVE_N === 3 && W.votive.lamps.map(l => l.id).join() === VOTIVE_IDS.join(), 'WAYMEET hangs three votive lamps (' + VOTIVE_IDS.join(', ') + ')');
const cols = W.votive.lamps.map(l => l.x); ok(cols.every((x, i) => !i || x - cols[i - 1] >= 60), 'the lamps stand far apart along the road (' + cols.join(', ') + '): one in each stretch of the town');
for (const l of W.votive.lamps) {
  const f = W.votive.sources.find(s => s.id === 'fire-' + l.id); ok(f && f.y === R - 1 && Math.abs(f.x - l.x) <= 6, l.id + ': a brazier on the street within a few steps of its loft');
  ok(at(l.x, l.y + 1) === T.PLANK && at(l.x, l.y) === T.AIR && at(l.x, l.y - 1) === T.AIR, l.id + ': the lamp stands on a plank of its loft, in clear air');
  const lad = []; for (let y = 0; y < W.H; y++) for (let x = Math.max(0, l.x - 7); x <= l.x + 7; x++) if (at(x, y) === T.NET) lad.push([x, y]);
  ok(lad.some(([x, y]) => y === R - 6) && lad.some(([x, y]) => y === R - 1), l.id + ': a ladder from the street up to the loft');
  ok(W.ents.filter(e => e.t === 'deco' && e.kind === 'stilt' && Math.abs(e.x - l.x) <= 4).length >= 2, l.id + ': the loft stands on its poles (a stilt at each end)');
  ok(!W.ents.some(e => (e.t === 'swornsword' || e.t === 'hedgeknight' || e.t === 'crossbow' || e.t === 'heavy' || e.t === 'runner') && Math.abs(e.x - l.x) < 5 && e.y > l.y - 6), l.id + ': no foe stands at the loft (a detour, not a fight)'); }
const hands = read('../src/lit-church-hands.js'), vhands = read('../src/votive-hands.js'), flame = read('../src/flame.js'), towpath = read('../src/towpath.js'), main = read('../src/main.js');
ok(/from '\.\/flame\.js'/.test(hands) && /from '\.\/flame\.js'/.test(vhands) && /export function takeFlame/.test(flame) && !/lcFlame = FLAME\.life/.test(hands) && !/lcFlame = FLAME\.life/.test(vhands), 'ONE flame verb: the church\'s hands and the votive hands both take it from src/flame.js (neither writes its own)');
ok(!/ent\('tpchurch'/.test(towpath) && !/to: 'church'/.test(towpath) && !/boards\(32, 39, 22\)/.test(towpath), 'THE TOWPATH\'s first screen: no church door, no hill path');
ok(/LIGHT WAYMEET'S VOTIVE LAMPS /.test(main) && /votiveLocked/.test(main), 'the locked tip: LIGHT WAYMEET\'S VOTIVE LAMPS n/3');

/* ---- B. THE PAGE ---- */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; const out = {};
    const idx = id => LEVELS.findIndex(l => l.id === id), TS = 16;
    const info = id => { const m = BK.mapNodes(), i = m.ids.indexOf(id); return { locked: m.locked[i], secret: m.secret[i] }; };
    const clearAll = () => { for (const l of LEVELS) if (l.id !== 'church') BKT.PROG[l.id] = { cleared: true, medal: 3, best: 400, silver: 7 }; };
    const fresh = () => { BK.setHero('knight'); BK.reset({ fresh: true }); for (const l of LEVELS) delete BKT.PROG[l.id]; delete BKT.PROG.votive; delete BKT.PROG.churchOpen; BKT.PROG.churchMig = 1; BKT.PROG.waymeet = { cleared: true, medal: 1, best: 400 }; };   /* (Waymeet cleared: it is the church's junction - the lamps alone are what is asked) */
    const enter = (h) => { BK.setHero(h || 'knight'); BK.load(idx('waymeet')); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const V = () => BK.votive(), P = () => BK.P;
    const go = (id, key) => { BK.mapLook(id); BK.state = 'map'; BK.step(2); BK.press(key); for (let i = 0; i < 120; i++) BK.step(1); const m = BK.mapNodes(); return m.ids[m.node]; };
    const L = () => BK.L, srcAt = id => L().votive.sources.find(s => s.id === 'fire-' + id), lampAt = id => L().votive.lamps.find(l => l.id === id);
    const at = (x, y) => { BK.tp(x, y); BK.sim(2); P().vx = 0; };
    const E = () => { BK.press('talk'); BK.sim(2); };
    /* 1. THE OLD GATE IS GONE: everything cleared, a Towpath GOLD medal - the church is still shut */
    fresh(); clearAll(); out.goldNoLamps = info('church'); out.goldTry = go('waymeet', 'left');
    /* 2. a lamp without a flame stays dark; a flame, then the lamp */
    fresh(); enter(); const a = lampAt('v1'), fa = srcAt('v1');
    at(a.x, a.y); E(); out.noFlame = { lit: V().lamps.v1, flame: P().lcFlame || 0 };
    at(fa.x, fa.y); E(); out.takeFlame = { flame: P().lcFlame, near: Math.abs(P().x - (fa.x * TS + 8)) };
    BK.sim(60); out.burnsDown = P().lcFlame;
    P().lcFlame = FLAME_LIFE; BK.sim(15 * 60 + 5); out.burntOut = P().lcFlame;
    at(fa.x, fa.y); E(); at(a.x, a.y); const hp0 = P().hp; E(); out.lit1 = { lamp: V().lamps.v1, n: V().lit, saved: (BKT.PROG.votive || {}).v1 === 1 };
    /* a blow that lands puts the flame out */
    at(srcAt('v2').x, srcAt('v2').y); E(); const had = P().lcFlame; P().hp -= 5; BK.sim(3); out.blow = { had, now: P().lcFlame || 0, state: BK.state }; P().hp = P().maxHp;   /* (a blow is a drop in health the hands see: src/flame.js tickFlame) */
    out.afterOne = info('church');
    /* 3. saved: load Waymeet again - the lamp is still lit; a second lamp keeps it shut */
    enter(); out.reloaded = { v1: V().lamps.v1, n: V().lit };
    { const b = lampAt('v2'), fb = srcAt('v2'); at(fb.x, fb.y); E(); at(b.x, b.y); E(); out.two = { n: V().lit, locked: info('church').locked, open: !!BKT.PROG.churchOpen }; }
    { const c = lampAt('v3'), fc = srcAt('v3'); at(fc.x, fc.y); E(); at(c.x, c.y); E(); out.three = { n: V().lit, locked: info('church').locked, open: BKT.PROG.churchOpen === 1 }; }
    out.stored = JSON.parse(localStorage.getItem('bracken.progress.' + BK.slot) || '{}'); out.stored = { v: out.stored.votive, open: out.stored.churchOpen };
    clearAll(); out.walk = go('waymeet', 'left'); out.back = go('church', 'right');
    /* 4. old saves */
    const loadSave = save => { localStorage.setItem('bracken.progress.0', JSON.stringify(save)); BK.loadSlot(0); return { open: BKT.PROG.churchOpen === 1, locked: info('church').locked }; };
    const base = { hero: 'knight', heroes: { knight: true }, waymeet: { cleared: true, medal: 1 } };
    out.migBronze = loadSave({ ...base, towpath: { cleared: true, medal: 1 } });
    out.migNone = loadSave({ ...base, towpath: { cleared: true, medal: 0 } });
    out.migCleared = loadSave({ ...base, church: { cleared: true, medal: 0 } });
    out.migFresh = loadSave({ hero: 'knight', heroes: { knight: true } });
    localStorage.removeItem('bracken.progress.0');
    return out; })()`.replace('FLAME_LIFE', String(FLAME.life)), 600000);
  console.log(JSON.stringify(r));
  ok(r.goldNoLamps.locked && r.goldTry === 'waymeet', 'with a Towpath GOLD medal and every level cleared, the church is still SHUT and the key press at Waymeet does not walk the spur');
  ok(!r.noFlame.lit && !r.noFlame.flame, 'E at a dark lamp with no flame lights nothing');
  ok(r.takeFlame.flame > FLAME.life - 1 && r.takeFlame.near < 24, 'E at a brazier: a flame in the hand (' + FLAME.life + ' s)');
  ok(r.burnsDown < FLAME.life && r.burnsDown > FLAME.life - 3, 'it burns down');
  ok(r.burntOut === 0, 'it burns out after ' + FLAME.life + ' s');
  ok(r.lit1.lamp && r.lit1.n === 1 && r.lit1.saved, 'a flame lights the lamp, and the lamp is SAVED (PROG.votive.v1)');
  ok(r.blow.had > 0 && r.blow.now === 0, 'a blow that lands on the hero puts the flame out');
  ok(r.afterOne.locked, '1/3: the road stays shut');
  ok(r.reloaded.v1 && r.reloaded.n === 1, 'Waymeet loaded again: the lamp is still lit');
  ok(r.two.n === 2 && r.two.locked && !r.two.open, '2/3: the road stays shut');
  ok(r.three.n === 3 && !r.three.locked && r.three.open, '3/3: PROG.churchOpen, and the church node is open');
  ok(r.stored.open === 1 && r.stored.v && r.stored.v.v1 === 1 && r.stored.v.v3 === 1, 'the lamps and the open road are in the saved profile');
  ok(r.walk === 'church' && r.back === 'waymeet', 'the key press at Waymeet walks the spur to the church and back');
  ok(r.migBronze.open && !r.migBronze.locked, 'an old save with the Towpath BRONZE medal keeps the church open (grandfathered)');
  ok(!r.migNone.open && r.migNone.locked, 'a save with the Towpath cleared but no medal does not get it');
  ok(r.migCleared.open && !r.migCleared.locked, 'a save that already cleared the church keeps it');
  ok(!r.migFresh.open && r.migFresh.locked, 'a fresh save has it shut until the lamps burn');
  /* C. ONE HERO, REAL KEYS, THE FIRST LOFT: take the flame at the brazier, climb the ladder, step onto the plank, light the lamp */
  const k = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; const out = { log: [] }, TS = 16, idx = id => LEVELS.findIndex(l => l.id === id);
    for (const h of ['knight', 'ranger', 'geomancer']) {
      BK.setHero(h); BK.reset({ fresh: true }); for (const l of LEVELS) delete BKT.PROG[l.id]; delete BKT.PROG.votive; delete BKT.PROG.churchOpen; BKT.PROG.churchMig = 1;
      BK.load(idx('waymeet')); BK.state = 'play'; BK.god = true; BK.sim(4);
      const l = BK.L.votive.lamps[0], f = BK.L.votive.sources[0], P = BK.P, K = BK.keys, hold = (o, n) => { Object.assign(K, { left: false, right: false, up: false, down: false }, o); for (let i = 0; i < n; i++) BK.sim(1); Object.assign(K, { left: false, right: false, up: false, down: false }); };
      BK.tp(f.x - 3, f.y); BK.sim(3);
      for (let i = 0; i < 200 && Math.abs(P.x - (f.x * TS + 8)) > 6; i++) hold(P.x < f.x * TS + 8 ? { right: true } : { left: true }, 1);
      BK.press('talk'); BK.sim(2); const flame = P.lcFlame || 0;
      const lad = BK.L.grid;
      /* the ladder column is the NET column nearest the brazier on the loft's side */
      const T = (await import('/src/level.js')).T; let col = -1; for (let x = f.x; x <= l.x; x++) if (lad[(BK.L.votive.lamps[0].y) * BK.L.W + x] === T.NET) { col = x; break; }
      for (let i = 0; i < 400 && Math.abs(P.x - (col * TS + 8)) > 3; i++) hold(P.x < col * TS + 8 ? { right: true } : { left: true }, 1);
      out.log.push(h + ' col ' + col + ' x ' + P.x.toFixed(1) + ' y ' + P.y.toFixed(1) + ' ground ' + P.ground);
      for (let i = 0; i < 400 && !(P.ground && !P.climb && P.y < (l.y + 3) * TS); i++) { hold({ up: true }, 1); if (i === 3) out.log.push(h + ' climb ' + P.climb + ' y ' + P.y.toFixed(1)); }
      out.log.push(h + ' top y ' + P.y.toFixed(1) + ' x ' + P.x.toFixed(1) + ' climb ' + P.climb + ' ground ' + P.ground);
      for (let i = 0; i < 200 && Math.abs(P.x - (l.x * TS + 8)) > 5; i++) hold(P.x < l.x * TS + 8 ? { right: true } : { left: true }, 1);
      BK.press('talk'); BK.sim(2);
      out[h] = { flame, flameAtLamp: P.lcFlame || 0, x: Math.round(P.x / TS), y: Math.round(P.y / TS), lit: BK.votive().lamps[l.id], want: [l.x, l.y + 1] };
    }
    return out; })()`, 600000);
  console.log(JSON.stringify(k));
  for (const h of ['knight', 'ranger', 'geomancer']) ok(k[h].flame > 0 && k[h].lit, h + ': real keys - took the flame, climbed the ladder, crossed the plank and lit the first lamp (' + JSON.stringify(k[h]) + ')');
  if (pg.errors.length) throw new Error('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
console.log('church-road: ' + n + ' checks ok');
