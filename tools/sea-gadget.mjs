/* tools/sea-gadget.mjs - THE ONE SEA-GADGET HOOK, node proofs (claude/seagadget, 11-12). NO PAGE, NO BROWSER, no port.
     node tools/sea-gadget.mjs
   Daniel's rule: every class must be able to do the thing a level asks. A sea level asks a hero to STRIKE something (a lever, a sluice wheel, a bell, a whale nerve, a singing
   stone, a trap rope, a mooring, a grapple winch, an egg sac, a barnacle). Before this lane only the melee box could. Now src/sea-gadget.js + src/pirate-fleet-hands.js
   (PFH.strike for the attack box, PFH.update for every hero shot / spell / thrown weapon, through src/hero-strikes.js shotStrikes) strike every DECLARED gadget.
   1. the wiring: main.js has no private blow call left for the moved levels, the hands declare their gadgets, hero-strikes is bound to every hero's projectile list
   2. the field itself: opt-outs, cooldown, one-blow-one-verb, a shot is consumed (arrow, ember) or goes on by design, once per gadget
   3. THE GRID: for every sea level (Pirate Fleet, Causeway 2, Saltreach, Keep 2, Whale, Siren Rocks) and every gadget type in it, each of the 9 heroes
      (src/hero-roster.js HERO_IDS) strikes it - melee: the attack box standing next to it; ranged: its own shot flown from its range, on the level's real wiring
   4. the Kraken's barnacles (a boss's gadgets, handed in through ctx.gadgets) with the same nine heroes
   5. OFF = the base: nothing here runs without the sea flags (the hands are inert, marks.js rows unchanged: tools/tells.mjs / answer-tags own that) */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
process.env.KF = '1'; process.env.CW3 = '1'; process.env.LW3 = '1';   /* the levels read their flag at build time: all on, in this process only */
const { install } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const { HERO_IDS } = await import('../src/hero-roster.js');
const HS = await import('../src/hero-strikes.js');
const { makeGadgetField, overlaps, inset } = await import('../src/sea-gadget.js');
const { makePirateFleetHands } = await import('../src/pirate-fleet-hands.js');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const TS = 16, DT = 1 / 60;
const src = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

/* ---------- THE NINE HEROES' STRIKERS: what each one throws (the shapes src/hero-strikes.js reads; src/main.js configures it with the real arrays) ---------- */
const SHOT = {   /* kind: where the game keeps it; how: what shotStrikes calls it; range: where the hero stands (px from the gadget); consumed: the shot is spent by the strike */
  knight:    null,
  warden:    { kind: 'tracer', how: 'shot', range: 110, consumed: false },
  geomancer: { kind: 'stone', how: 'stone', range: 90, consumed: false },
  ranger:    { kind: 'arrow', how: 'arrow', range: 150, consumed: true },
  berserker: { kind: 'hatchet', how: 'axe', range: 80, consumed: false },
  pyro:      { kind: 'ember', how: 'ember', range: 110, consumed: true },
  paladin:   { kind: 'hammer', how: 'hammer', range: 80, consumed: false },
  pirate:    { kind: 'tracer', how: 'shot', range: 120, consumed: false },
  reaper:    { kind: 'scythe', how: 'scythe', range: 90, consumed: false },
};
function heroWorld(P) {
  const W = { players: [P], embers: [], tracers: [], hammers: [], stones: [], scythe: null };
  HS.configure({ eachSeat: fn => { fn(P); }, hero: () => P, attackBox: () => null, overlap: overlaps, players: () => W.players, embers: () => W.embers, tracers: () => W.tracers, hammers: () => W.hammers, scythe: () => W.scythe, stones: () => W.stones });
  W.clear = () => { W.embers.length = 0; W.tracers.length = 0; W.hammers.length = 0; W.stones.length = 0; W.scythe = null; P.rgArrows = []; P.hatchets = []; P.bzAxe = null; };
  /* fire hero h's shot from (x0, y) toward +x; returns { at(x) -> moves it there (a tracer spans x0..x), spent() } */
  W.fire = (h, x0, y) => { const s = SHOT[h]; W.clear(); let p;
    switch (s.kind) {
      case 'arrow': p = { x: x0, y, state: 'fly' }; P.rgArrows.push(p); break;
      case 'ember': p = { x: x0, y, life: 1, r: 3 }; W.embers.push(p); break;
      case 'tracer': p = { x0, y0: y, x1: x0, y1: y, life: 0.1 }; W.tracers.push(p); break;
      case 'hatchet': p = { x: x0, y, life: 1 }; P.hatchets.push(p); break;
      case 'hammer': p = { x: x0, y }; W.hammers.push(p); break;
      case 'scythe': p = { x: x0, y }; W.scythe = p; break;
      case 'stone': p = { x: x0, y, life: 1 }; W.stones.push(p); break;
    }
    return { p, kind: s.kind, to(x) { if (s.kind === 'tracer') p.x1 = x; else p.x = x; },
      spent() { return s.kind === 'arrow' ? (p.state !== 'fly') : s.kind === 'ember' ? p.life <= 0.03 : false; } };
  };
  return W;
}

/* ---------- 1. THE WIRING ---------- */
ok(HERO_IDS.length === 9 && HERO_IDS.every(h => h in SHOT), 'the nine heroes of src/hero-roster.js are all in the striker table: ' + HERO_IDS.join(','));
{ const main = src('main.js');
  ok(/shotStrike: \(b, k\) => shotStrikes\(b, k, null, true\)/.test(main), 'main.js hands PFH the shot rule (hero-strikes shotStrikes, every hero: no gq4q gate)');
  ok(/gadgets: \(\) => \(K3H && K3H\.on\(\) \? K3H\.gadgets\(\) : \[\]\)/.test(main), "main.js hands PFH the Kraken's barnacles");
  ok(/if \(PFH && PFH\.on\(\)\) PFH\.strike\(hb\)/.test(main), 'main.js still strikes through PFH.strike(hb) (the one melee call)');
  { const cfg = main.slice(main.indexOf('heroStrikesConfigure({'), main.indexOf('heroStrikesConfigure({') + 700); ok(['embers: () => embers', 'tracers: () => shots', 'hammers: () => hammers', 'scythe: () => thrownScythe', 'stones:', 'players: () => players'].every(q => cfg.includes(q)), 'hero-strikes is configured with the embers, the tracers, the hammers, the scythe and the stones'); }
  for (const m of ['WHH.strike', 'SKRH.strike', 'LWH.strike', 'K3H.strike']) ok(!main.includes(m + '(hb'), 'main.js no longer has a private blow call: ' + m);
  for (const f of ['whale-hands.js', 'siren-rocks-hands.js', 'longwater3-hands.js', 'kraken3-hands.js']) {
    const s = src(f); ok(!/\bH\.strike\s*=/.test(s), f + ' has no private "H.strike" melee loop left'); ok(/H\.gadgets\s*=/.test(s), f + ' declares its gadgets (H.gadgets)'); }
  for (const f of ['whale-hands.js', 'siren-rocks-hands.js', 'longwater3-hands.js']) ok(/gadgets: \(\) => H\.gadgets\(\)/.test(src(f)), f + ' hands them to the wiring through H.water.gadgets');
  ok(/export function shotStrikes\(box, key, alt, all\)/.test(src('hero-strikes.js')), 'hero-strikes exports shotStrikes (the projectiles alone, no swing: a blow is never counted twice)');
  /* no OTHER sea hands keeps a melee-box loop over its own gadgets: any hands file naming the water kit's hooks and an overlap on `hb` outside this wiring is a second pattern */
  const seaHands = readdirSync(new URL('../src/', import.meta.url)).filter(f => /-hands\.js$/.test(f) && /pirate-fleet-hands|H\.water\s*=|ctx\.pfh/.test(src(f)));
  for (const f of seaHands) ok(!/\bH\.strike\s*=\s*hb\b/.test(src(f)) || f === 'pirate-fleet-hands.js', 'sea hands ' + f + ' keeps no melee-box strike of its own'); }

/* ---------- 2. THE FIELD ---------- */
{ const P = { x: 0, y: 0 }, HW = heroWorld(P);
  const hit = []; const mk = (id, extra = {}) => ({ id, box: () => ({ l: 100, r: 122, t: 50, b: 76 }), strike: (how, hb) => { hit.push([id, how, hb]); return extra.ret; }, ...extra });
  const F = makeGadgetField({ shot: (b, k) => HS.shotStrikes(b, k, null, true) });
  /* a blow */
  ok(F.blow([mk('a')], { l: 110, r: 130, t: 60, b: 80 }).join() === 'a' && hit.at(-1)[1] === 'blow', 'a blow in the box strikes the gadget');
  ok(F.blow([mk('a')], { l: 122, r: 140, t: 60, b: 80 }).length === 0, 'a blow beside it does not (strict edge)');
  ok(F.blow([mk('a', { melee: false })], { l: 110, r: 130, t: 60, b: 80 }).length === 0, 'melee: false opts out of the attack box');
  ok(F.blow([{ id: 'n', box: () => null, strike() { throw new Error('never'); } }], { l: 0, r: 999, t: 0, b: 999 }).length === 0, 'a gadget with no box now (spent) is not there to strike');
  { hit.length = 0; const g = [mk('k1', { group: 'kit' }), mk('k2', { group: 'kit' }), mk('o')]; ok(F.blow(g, { l: 100, r: 122, t: 50, b: 76 }).join() === 'k1,o' && hit.length === 2, 'one blow = one gadget of a group (the kit verbs), a free one beside it also answers'); }
  /* the cooldown: per gadget, by dt */
  { hit.length = 0; const g = mk('c', { cool: 1 }), hb = { l: 100, r: 122, t: 50, b: 76 }; F.blow([g], hb); F.blow([g], hb); ok(hit.length === 1, 'cool: 1 - the second blow in the same breath finds it cooling'); F.tick(0.5); F.blow([g], hb); ok(hit.length === 1, '... still cooling at 0.5 s'); F.tick(0.6); F.blow([g], hb); ok(hit.length === 2, '... struck again after 1 s'); F.clear(); }
  /* a gadget that takes nothing (strike returns false) starts no cooldown */
  { hit.length = 0; const g = mk('r', { cool: 5, ret: false }), hb = { l: 100, r: 122, t: 50, b: 76 }; F.blow([g], hb); F.blow([g], hb); ok(hit.length === 2, 'strike() === false takes nothing: no cooldown'); }
  /* shots: every striker of the nine */
  for (const h of HERO_IDS) { const s = SHOT[h]; if (!s) continue;
    hit.length = 0; HW.clear(); const g = mk('s'), sh = HW.fire(h, 40, 63); sh.to(60); ok(F.shots([g]).length === 0, h + ': a shot short of the gadget strikes nothing');
    sh.to(111); const r = F.shots([g]); ok(r.length === 1 && r[0].how === s.how && hit.at(-1)[1] === s.how, h + ': its ' + s.kind + ' strikes (how = ' + s.how + ')');
    ok(sh.spent() === s.consumed, h + ': the shot is ' + (s.consumed ? 'CONSUMED' : 'not consumed (it goes on by design: marked, so it strikes this gadget once)'));
    hit.length = 0; ok(F.shots([g]).length === (s.consumed ? 0 : 0) , h + ': the same shot never strikes the same gadget twice (once per key)'); }
  { HW.clear(); hit.length = 0; const g = mk('o', { ranged: false }), sh = HW.fire('ranger', 40, 63); sh.to(111); ok(F.shots([g]).length === 0 && !sh.spent(), 'ranged: false opts out of hero shots (the arrow flies on)'); }
  { HW.clear(); hit.length = 0; const g = { id: 'gone', box: () => null, strike() { throw new Error('never'); } }, sh = HW.fire('pyro', 40, 63); sh.to(111); ok(F.shots([g]).length === 0 && !sh.spent(), 'a spent gadget lets the ember through'); }
  { HW.clear(); hit.length = 0; const g = [mk('k1', { group: 'kit' }), mk('k2', { group: 'kit' })], sh = HW.fire('warden', 40, 63); sh.to(111); ok(F.shots(g).length === 1, 'a shot also strikes one gadget of a group'); }
  { HW.clear(); hit.length = 0; const g = mk('c2', { cool: 2 }), a = HW.fire('ranger', 40, 63); a.to(111); F.shots([g]); const b = HW.fire('ranger', 40, 63); b.to(111); F.shots([g]); ok(hit.length === 1 && !b.spent(), 'a cooling gadget is not struck by a second arrow (it flies on)'); }
  ok(inset({ l: 0, r: 10, t: 0, b: 10 }, 1).l === 1, 'inset shrinks'); }

/* ---------- 3. THE GRID: every sea level x every gadget type x the nine heroes ---------- */
const typeOf = g => (g.id.startsWith('kit:') ? 'kit-' + g.id.split(':')[2] : g.id.split(':')[0]);
const MELEE_STAND = 16;
function gridFor(name, fresh0, need) {
  const fresh = () => { const w = fresh0(); w.step(DT); return w; };   /* (one frame: the hands make their state ready at their first sight) */
  const probe = fresh(), list = probe.pfh.gadgets().filter(g => g.melee !== false && g.ranged !== false && g.box());
  const types = [...new Set(list.map(typeOf))]; ok(need.every(t => types.includes(t)), name + ': gadget types ' + types.join(', ') + ' (expected at least ' + need.join(', ') + ')');
  const rows = [];
  for (const type of types) {
    const idOf = w => (w.pfh.gadgets().find(g => typeOf(g) === type && g.melee !== false && g.ranged !== false && g.box()) || {}).id;
    for (const h of HERO_IDS) {
      { const w = fresh(), id = idOf(w), g = w.pfh.gadgets().find(q => q.id === id), b = g.box(), cx = (b.l + b.r) / 2;   /* MELEE: the attack box, the hero standing beside it facing it */
        w.P.x = cx - MELEE_STAND; w.P.y = b.b; const hb = { l: w.P.x, r: w.P.x + 26, t: b.b - 24, b: b.b + 2 };
        const hit = w.pfh.strike(hb) || []; ok(hit.includes(id), name + ' / ' + type + ' / ' + h + ': the attack box strikes it (' + id + ')'); }
      const s = SHOT[h]; if (!s) { rows.push([type, h, 'blow', '-']); continue; }
      { const w = fresh(), id = idOf(w), g = w.pfh.gadgets().find(q => q.id === id), b = g.box(), cx = (b.l + b.r) / 2, cy = (b.t + b.b) / 2;
        w.P.x = cx - s.range; w.P.y = b.b; const sh = w.HW.fire(h, cx - s.range, cy); let got = null;   /* RANGED: its own shot, flown 6 px a frame from where the hero stands */
        if (s.kind === 'tracer') sh.to(cx + 40);
        for (let i = 0; i < 400 && !got; i++) { if (s.kind !== 'tracer') sh.to(sh.p.x + 6); w.step(DT); got = w.pfh.log.find(e => e.id === id && e.how !== 'blow') || null; }
        ok(got && got.how === s.how, name + ' / ' + type + ' / ' + h + ': its ' + s.kind + ' strikes it from ' + s.range + ' px (' + (got ? got.how : 'MISSED') + ')');
        ok(sh.spent() === s.consumed, name + ' / ' + type + ' / ' + h + ': ' + (s.consumed ? 'the shot is consumed' : 'the shot goes on by design')); rows.push([type, h, s.how, s.range + ' px']); }
    }
  }
  return { types, rows };
}
const noop = () => {};
const overlapB = overlaps;
function baseCtx(L, P, w, over = {}) {
  const enemies = w.enemies = [];
  const c = { get L() { return L; }, get players() { return [P]; }, get boss() { return null; }, get bossActive() { return false; }, TS, T, EHP: { gastricpolyp: 100, parasitequeen: 100, nagaguard: 100, nagaqueen: 100, poolcrab: 30 },
    hero: () => P, time: () => w.t, poolLevel: (p, y) => { if (p.base === undefined) p.base = p.bottom; p.y = y; const d = p.base - y; p.dry = d <= 1; p.depth = Math.max(0, d); p.shallow = d < 18; }, moveBody: (b, dx, dy) => { b.x += dx; b.y += dy; return {}; },
    enemies: () => enemies, parts: () => [], isSolid: (x, y) => { const t = L.grid[y * L.W + x]; return t === T.SOLID || t === T.PORT; }, cellSet: (x, y, v) => { L.grid[y * L.W + x] = v; }, spawnEnt: () => {}, leechOff: noop,
    VW: () => 384, VH: () => 216, view: () => ({ x0: 0, y0: 0, x1: 384, y1: 216 }), number: noop, text: noop, burst: noop, shake: noop, ring: noop, turned: noop, sparks: noop, hint: noop, hitstop: noop,
    damagePlayer: () => 'hit', asPlayer: (p, fn) => fn(), upright: p => !p.dead, overlap: overlapB, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 14, b: b.y }), sound: noop, holding: () => false, marks: () => w.marks };
  return Object.defineProperties(c, Object.getOwnPropertyDescriptors(over));   /* (getters survive: ctx.pfh is bound after the wiring exists) */
}
function pfhFor(L, P, w, hooks, extra = {}) {
  return makePirateFleetHands({ get L() { return L; }, hooks, get players() { return [P]; }, hero: () => P, marks: () => w.marks, poolLevel: w.ctx.poolLevel, moveBody: w.ctx.moveBody, holding: () => false, enemies: () => w.enemies, parts: () => [],
    VW: () => 384, view: () => ({ x0: 0, y0: 0, x1: 384, y1: 216 }), burst: noop, sparks: noop, time: () => w.t, sound: noop, number: noop, shake: noop, TS,
    shotStrike: (b, k) => HS.shotStrikes(b, k, null, true), ...extra });
}
const mkP = () => ({ x: 0, y: 0, w: 10, h: 14, face: 1, dead: false, ground: true, vx: 0, vy: 0, swim: false });
const levelOf = id => LEVELS.find(d => d.id === id).build();
const TABLE = [];
const report = (name, g) => TABLE.push(name + ': ' + g.types.join(', '));

/* --- PIRATE FLEET: a grapple winch + the kit's verbs --- */
{ const { makePirateFleetHands: mkH } = { makePirateFleetHands };
  const fresh = () => { const L = levelOf('piratefleet'), P = mkP(), w = { t: 0, marks: new Set(), enemies: [] }; w.P = P; w.ctx = baseCtx(L, P, w); w.HW = heroWorld(P);
    w.pfh = mkH ? pfhFor(L, P, w, () => null) : null; w.pfh.clear(); w.step = dt => { w.t += dt; w.pfh.update(dt); }; return w; };
  const g = gridFor('piratefleet', fresh, ['winch']); report('Pirate Fleet', g); }

/* --- SALTREACH (Long Water 3): bell + sluice wheel (kit), a trap's rope, a mooring --- */
{ const { makeLongWater3Hands } = await import('../src/longwater3-hands.js');
  const fresh = () => { const L = levelOf('longwater'), P = mkP(); P.x = L.arena.x0 + 60; P.y = L.arena.floor; const w = { t: 0, marks: new Set(), enemies: [] }; w.P = P; w.HW = heroWorld(P);
    let pf = null; w.ctx = baseCtx(L, P, w, { get pfh() { return pf; }, get bossActive() { return true; }, hurtFoe: noop, coin: noop }); const H = makeLongWater3Hands(w.ctx);
    pf = w.pfh = pfhFor(L, P, w, () => H.water); H.clear(); pf.clear(); w.step = dt => { w.t += dt; H.update(dt); pf.update(dt); }; return w; };
  const g = gridFor('longwater', fresh, ['kit-bell', 'kit-sluice', 'trap', 'moor']); report('Saltreach', g); }

/* --- KEEP 2: the chambers' levers + the throne's --- */
{ const { makeKeepFloodsHands } = await import('../src/keep-floods-hands.js');
  const fresh = () => { const L = levelOf('keep'), P = mkP(); const w = { t: 0, marks: new Set(), enemies: [] }; w.P = P; w.HW = heroWorld(P); let pf = null;
    w.ctx = baseCtx(L, P, w, { get pfh() { return pf; }, get enemies() { return w.enemies; }, life: () => 0, sfx: new Proxy({}, { get: () => noop }) }); for (const p of L.pools) if (p.base === undefined) p.base = p.bottom;
    const H = makeKeepFloodsHands(w.ctx); pf = w.pfh = pfhFor(L, P, w, () => H.water); pf.clear(); w.step = dt => { w.t += dt; H.update(dt); pf.update(dt); }; return w; };
  const g = gridFor('keep', fresh, ['kit-lever']); report('Keep 2', g); }

/* --- WHALE: a nerve (+ the kit's off-map verbs, which only a nerve's flare strikes) --- */
{ const { makeWhaleHands } = await import('../src/whale-hands.js');
  const fresh = () => { const L = levelOf('whale'), P = mkP(); const w = { t: 0, marks: new Set(), enemies: [] }; w.P = P; w.HW = heroWorld(P); let pf = null;
    w.ctx = baseCtx(L, P, w, { get pfh() { return pf; } }); const H = makeWhaleHands(w.ctx); pf = w.pfh = pfhFor(L, P, w, () => H.water); H.clear(); pf.clear(); w.step = dt => { w.t += dt; H.update(dt); pf.update(dt); }; return w; };
  const g = gridFor('whale', fresh, ['nerve']); report('Whale', g);
  { const w = fresh(); ok(w.pfh.gadgets().filter(q => q.id.startsWith('kit:') && q.ranged === false).length >= 1, 'whale: the hidden breath verbs are off the hook for shots (only a nerve strikes them)'); } }

/* --- SIREN ROCKS: a singing stone, the tide bell --- */
{ const { makeSirenRocksHands } = await import('../src/siren-rocks-hands.js');
  const fresh = () => { const L = levelOf('sirenrocks'), P = mkP(); const w = { t: 0, marks: new Set(), enemies: [] }; w.P = P; w.HW = heroWorld(P); let pf = null;
    w.ctx = baseCtx(L, P, w, { get pfh() { return pf; } }); const H = makeSirenRocksHands(w.ctx); pf = w.pfh = pfhFor(L, P, w, () => H.water); H.clear(); pf.clear(); w.step = dt => { w.t += dt; H.update(dt); pf.update(dt); }; return w; };
  const g = gridFor('sirenrocks', fresh, ['stone', 'kit-bell']); report('Siren Rocks', g); }

/* --- CAUSEWAY 2: the race bells and sluices, the crypt lever --- */
{ const { makeCauseway3Hands } = await import('../src/causeway3-hands.js'); const { CW3 } = await import('../src/causeway3.js');
  const fresh = () => { const L0 = levelOf('causeway'), L = { ...L0, grid: L0.grid.slice(), pools: L0.pools.map(p => ({ ...p })) }, P = mkP(); P.x = 3 * TS; P.y = 18 * TS; const w = { t: 0, marks: new Set(), enemies: [] }; w.P = P; w.HW = heroWorld(P); let pf = null;
    const props = [{ t: 'lantern', x: CW3.lampGate.lamp * TS + 8, y: 24 * TS, lit: false }];
    w.ctx = baseCtx(L, P, w, { get pfh() { return pf; }, props: () => props, openGateCol: noop, breakTile: noop, fallOut: noop });
    const H = makeCauseway3Hands(w.ctx); pf = w.pfh = pfhFor(L, P, w, () => H.water); H.clear(); pf.clear(); w.step = dt => { w.t += dt; H.update(dt); pf.update(dt); }; return w; };
  const g = gridFor('causeway', fresh, ['kit-bell', 'kit-sluice', 'kit-lever']); report('Causeway 2', g); }

/* ---------- 4. THE KRAKEN'S BARNACLES (a boss's gadgets, handed in through ctx.gadgets) ---------- */
{ const { makeKraken3Hands } = await import('../src/kraken3-hands.js');
  const W = 60, Hh = 44, grid = new Array(W * Hh).fill(0); for (let y = 24; y < 44; y++) for (let x = 0; x < W; x++) grid[y * W + x] = 1;
  const mk = () => { const sea = { krakenSea: true, x0: 5 * TS, x1: 55 * TS, y: 26 * TS, base: 42 * TS, bottom: 40 * TS }, L = { cw3: true, grid: grid.slice(), pools: [sea], arena: { boss: 'kraken', x0: 5 * TS, x1: 50 * TS, floor: 24 * TS, y0: 4 * TS, tower: 8 * TS + 8, wallL: 4, wallR: 50, rest: 46 * TS } };
    const P = mkP(); P.x = 20 * TS; P.y = 24 * TS; const w = { L, P, enemies: [], movers: [], marks: new Set(), boss: null, t: 0 };
    const ctx = { get L() { return L; }, get players() { return [P]; }, hero: () => P, boss: () => w.boss, marks: () => w.marks, number: noop, hint: noop, shake: noop, ring: noop, splash: noop, debris: noop, sparks: noop, hitstop: noop, time: () => 0, VW: () => 320, VH: () => 180, krkArt: () => null,
      poolLevel: (p, y) => { p.y = y; }, moveBody: (b, dx) => { b.x += dx; }, holding: () => false, hurtAs: noop, addEnemy: e => w.enemies.push(e), addMover: m => w.movers.push(m), breakTile: noop, tilesDone: noop, dropThings: noop, lock: noop, p1Stop: e => { e.p1Stopped = true; }, sound: noop };
    w.H = makeKraken3Hands(ctx); w.boss = { t: 'kraken', alive: true, hp: 335, maxHp: 670, x: 0, y: 0, w: 20, h: 20 }; w.H.begin(w.boss, false); let t = 0; while (w.boss.k3.st !== 'p2' && t < 40) { w.H.bossTick(w.boss, DT); t += DT; }
    w.HW = heroWorld(P); w.F = makeGadgetField({ shot: (b, k) => HS.shotStrikes(b, k, null, true) });
    w.stick = () => { w.boss.k3.barns.length = 0; w.boss.k3.barns.push({ x: 150, st: 'stuck', t: 9 }); return w.boss.k3.barns[0]; }; return w; };
  const probe = mk(); probe.stick(); ok(probe.H.gadgets().length === 1 && probe.H.gadgets()[0].id.startsWith('barn:'), 'kraken: a stuck barnacle is a gadget (' + probe.H.gadgets()[0].id + ')');
  for (const h of HERO_IDS) {
    { const w = mk(), b = w.stick(), g = w.H.gadgets()[0], bx = g.box(); const hb = { l: (bx.l + bx.r) / 2 - 20, r: (bx.l + bx.r) / 2 + 6, t: bx.b - 26, b: bx.b + 2 }; ok(w.F.blow(w.H.gadgets(), hb).length === 1 && b.st === 'popped', 'kraken / barnacle / ' + h + ': the attack box pops it'); }
    const s = SHOT[h]; if (!s) continue;
    { const w = mk(), b = w.stick(), bx = w.H.gadgets()[0].box(), cx = (bx.l + bx.r) / 2, cy = (bx.t + bx.b) / 2, sh = w.HW.fire(h, cx - s.range, cy); if (s.kind === 'tracer') sh.to(cx + 40);
      for (let i = 0; i < 400 && b.st === 'stuck'; i++) { if (s.kind !== 'tracer') sh.to(sh.p.x + 6); w.F.shots(w.H.gadgets()); }
      ok(b.st === 'popped', 'kraken / barnacle / ' + h + ': its ' + s.kind + ' pops it from ' + s.range + ' px'); } }
  { const w = mk(); w.H.clear(); ok(w.H.gadgets().length === 0, 'kraken: no raft built -> no gadgets (inert)'); }
  TABLE.push('Kraken: barn'); }

/* ---------- 5. OFF = THE BASE ---------- */
{ const { makeWhaleHands } = await import('../src/whale-hands.js'); const L = levelOf('reef'), P = mkP(), w = { t: 0, marks: new Set(), enemies: [] }; w.ctx = baseCtx(L, P, w); w.HW = heroWorld(P);
  const pf = pfhFor(L, P, w, () => null); pf.clear(); ok(!pf.on() && pf.gadgets().length === 0 && (pf.strike({ l: 0, r: 9999, t: 0, b: 9999 }) || []).length === 0, 'off the sea: a level with no tides / pulls has no gadgets, a blow strikes nothing');
  ok(!makeWhaleHands(w.ctx).on(), 'the whale hands are inert off their level (the Reef)'); }

console.log('sea gadgets by level - ' + TABLE.join(' | '));
console.log('sea-gadget: ' + n + ' checks ok');
