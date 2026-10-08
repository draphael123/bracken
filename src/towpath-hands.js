// src/towpath-hands.js - THE TOWPATH's HANDS (claude/towpath, the greybox). src/towpath.js builds the level; this binds its rule to the game:
// THE LOCKS (a chamber's water - an engine pool - moves toward the level its PADDLE last set: struck or E, a paddle fills a low chamber and drains a high one;
// a LOWER GATE stands open only while its chamber is down at its lower pound, and never shuts on a body in its doorway - the water waits; a man in a chamber
// that fills is drowned by the game's own pool rule), THE PUNTS (movers whose deck rides the chamber's water, or rests on a dry bed), THE MILL WHEEL (it turns
// while its race runs - its blades hurt; drained, it stands still and its paddles are a stair), THE SWING BRIDGES (a capstan, struck or E, swings the deck
// across or clear: clear, its cells are air and whoever stands on it goes in), THE LANTERN (the lock-keeper's, taken at his hut: E with no gadget in reach
// lights or dims it; a blow that lands on you gutters it), THE FOG (bands that thicken with the night; a lit lantern or a lit LAMP burns a clearing in it),
// THE EYES IN THE FOG (a watchman looses only at what is lit; a dozing bargeman wakes only to a lit hero or one at his elbow), THE FORK (the hill path's door to
// THE LIT CHURCH: claude/litchurch's level - enterChurch is the hook), the glint and the 10 s nudge (STUCK_HANDS.towpath), the walker's hands (walkHint), and
// the drawing (GREYBOX shapes until the art pass). In THE FOG KNIGHT's arena the bridge, the lock and the lamps are his rule's (ctx.boss*: src/fog-knight-hands.js).
// main.js calls: reset, on, update, mover, hold, seen, interact, surfaceAt, lanternOf, guttered, drawWorld, drawOver, drawHud, read, handsState, walkHint.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';

/* THE NUMBERS. fill: px/s a chamber's water moves; swing: s a bridge takes to turn; reach: px a hero's E reaches a gadget; hitCd: s before the same gadget
   answers another blow; litR / dimR: px a lantern burns its clearing (lit / dimmed); lampR: a lamp's; sightW / sightD: px a watchman / a dozer sees a LIT hero
   at; elbow: px anyone sees anyone; wheelDmg: the turning wheel's blades; wheelCd: s between its bites; guttered: s a struck lantern stays out before E lights it */
export const TP = { fill: 36, swing: 0.9, reach: 26, hitCd: 0.4, litR: 92, dimR: 34, lampR: 72, sightW: 230, sightD: 150, elbow: 44, wheelDmg: 14, wheelCd: 0.9 };

export function makeTowpathHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS, T = () => ctx.T;
  const R = Math.round;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  H.on = () => !!K;
  H.state = () => K;

  /* ---------- RESET: a fresh load builds the rule's state; a respawn puts the water, the gates and the bridges back as the level was built ---------- */
  H.reset = () => {
    const L = ctx.L;
    if (!L || !L.towpath) { K = null; if (typeof window !== 'undefined' && window.BK && window.BK.walkHint && window.BK.walkHint.tp) delete window.BK.walkHint; return; }
    const D = L.towpath, ts = TS(), fresh = !K || K.L !== L;
    if (fresh) K = { L, D, said: {}, clock: 0, lantern: new Map(), n: { fills: 0, drains: 0, swings: 0, lights: 0, dims: 0, gutters: 0, lamps: 0, drowned: 0, woke: 0, wheelBites: 0, nudges: 0, church: 0, scatters: 0 } };
    K.locks = D.locks.map(k => { const y = (k.init === 'hi' ? k.hi : k.lo) * ts + 4, bedY = k.bed * ts; return { ...k, y: Math.min(y, bedY), to: Math.min(y, bedY), loY: Math.min(k.lo * ts + 4, bedY), hiY: k.hi * ts + 4, bedY, dir: 0, gateOpen: true, hold: 0, refillT: 0 }; });
    K.bridges = D.bridges.map(b => ({ ...b, across: b.init === 'across', k: b.init === 'across' ? 0 : 1 }));
    K.lamps = D.lamps.map(l => ({ ...l }));
    K.wheels = D.wheels.map(w => ({ ...w, a: 0, v: 0, cd: 0 }));
    K.gadgets = []; K.cd = new Map(); K.glint = null; K.stalls = {}; K.stallKey = null; K.fx = [];
    for (const e of L.ents) if (e.t === 'tppaddle' || e.t === 'tpcapstan' || e.t === 'tplamp' || e.t === 'tplantern' || e.t === 'tpchurch' || e.t === 'tplychgate')
      K.gadgets.push({ t: e.t, x: e.x * ts + 8, y: (e.y + 1) * ts, lock: e.lock, bridge: e.bridge, arena: !!e.arena, to: e.to, ex: e.x, ey: e.y, flash: 0 });
    for (const k of K.locks) { gateCells(k); syncPool(k); }
    for (const b of K.bridges) bridgeCells(b);
    for (const w of K.wheels) wheelCells(w);
    for (const pp of ctx.players) { const q = K.lantern.get(pp.n || 1); if (!q) K.lantern.set(pp.n || 1, { has: false, lit: false, out: 0 }); }
    if (L.arena) for (const pp of ctx.players) { const q = K.lantern.get(pp.n || 1); if (q && !q.has && arenaStart()) { q.has = true; q.lit = true; } }
    bindFoes();
    const m = ctx.movers(); for (const mv of m) if (mv.towpath) H.mover(mv, 0);
    ctx.resolve && ctx.resolve();
    if (typeof window !== 'undefined' && window.BK) { const wh = () => H.walkHint(ctx.hero()); wh.tp = true; Object.assign(window.BK, { towpath: () => K, towpathHands: () => H, walkHint: wh }); }
  };
  /* a fight begun at his arena (the boss lab, a respawn at the shrine before him) carries the lantern: you took it at the hut */
  const arenaStart = () => { const A = K.L.arena, P = ctx.hero(); return !!(A && P && P.x >= (K.D.lantern.x - 2) * TS()); };
  /* every placed foe with a `tp` row learns its eyes (spawnEnt copies the row: src/main.js) */
  function bindFoes() { for (const e of ctx.enemies()) { if (!e.alive) continue; if (e.tpDoze && e.tpAwake === undefined) e.tpAwake = false; } }

  /* ---------- THE LOCKS ---------- */
  const lockOf = id => K.locks.find(k => k.id === id);
  const levelOf = k => (k.y >= k.loY - 3 ? (k.lo * TS() >= k.bedY - 1 ? 'dry' : 'lo') : k.y <= k.hiY + 3 ? 'hi' : k.to < k.y ? 'up' : 'down');
  function syncPool(k) { if (k.virtual) return; const p = (ctx.L.pools || [])[k.pool]; if (!p) return; p.y = Math.min(k.y, k.bedY); p.depth = Math.max(0, k.bedY - k.y); p.dry = p.depth <= 3; p.shallow = !!k.shallowLo && p.depth <= 72; }
  function gateCells(k) { if (!k.gate) return; const shut = !k.gateOpen; for (let y = k.gate.top; y <= k.gate.bot; y++) ctx.cellSet(k.gate.x, y, shut ? T().SOLID : T().AIR); }
  /* is a body in the gate's doorway (its column, its rows) */
  const inGate = k => { if (!k.gate) return false; const ts = TS(), l = k.gate.x * ts, r = l + ts, t = k.gate.top * ts, b = (k.gate.bot + 1) * ts;
    return ctx.bodies().some(q => { const bx = ctx.box(q); return bx.r > l && bx.l < r && bx.b > t && bx.t < b; }); };
  /* A PADDLE: a low (or dry, or draining) chamber fills, a high (or filling) one drains. by: 'hero' | 'boss' */
  function work(k, by) {
    if (!k) return null; const ts = TS();
    if (k.virtual) {   /* the arena's lock: drained by its paddle (the double sinks), it fills itself again through its leaking gates */
      if (k.to <= k.hiY + 1 && k.y <= k.loY - 2) { k.to = k.loY; k.refillT = k.refill || 12; K.n.drains++; ctx.sfx.splash && ctx.sfx.splash(); if (ctx.bossLock) ctx.bossLock('drained'); return 'drain'; }
      return null; }
    const up = k.to > k.hiY + 1 && !(k.to < k.y);   /* resting low, or draining: fill it */
    k.to = up ? k.hiY : (k.lo * ts >= k.bedY - 1 ? k.bedY : k.loY);
    if (up) K.n.fills++; else K.n.drains++;
    ctx.sfx.chain ? ctx.sfx.chain() : ctx.sfx.clank && ctx.sfx.clank();
    if (up && once('fill:' + k.id)) number(ctx.hero().x, ctx.hero().y - 34, k.race ? 'THE RACE RUNS: THE WHEEL TURNS' : 'THE PADDLE IS UP: THE CHAMBER FILLS');
    if (!up && once('drain:' + k.id)) number(ctx.hero().x, ctx.hero().y - 34, k.race ? 'THE RACE RUNS DRY: THE WHEEL SLOWS' : 'THE PADDLE IS DOWN: THE CHAMBER DRAINS');
    return up ? 'fill' : 'drain';
  }
  function stepLocks(dt) {
    const ts = TS();
    for (const k of K.locks) {
      if (k.virtual) { if (k.refillT > 0 && Math.abs(k.y - k.to) < 1) { k.refillT -= dt; if (k.refillT <= 0) { k.to = k.hiY; } }
        if (Math.abs(k.to - k.y) > 0.5) k.y += Math.sign(k.to - k.y) * Math.min(Math.abs(k.to - k.y), TP.fill * 0.7 * dt); continue; }
      const wasLvl = levelOf(k);
      /* the lower gate: it must shut before the water stands over the lower pound - and it never shuts on a body in its doorway (the water waits) */
      let target = k.to;
      if (k.gate) { const wantShut = Math.min(k.y, target) < k.loY - 3;
        if (wantShut && k.gateOpen) { if (inGate(k)) target = Math.max(target, k.loY - 3); else { k.gateOpen = false; gateCells(k); ctx.resolve && ctx.resolve(); ctx.sfx.clank && ctx.sfx.clank(); } }
        if (!wantShut && !k.gateOpen && k.y >= k.loY - 3) { k.gateOpen = true; gateCells(k); ctx.sfx.clank && ctx.sfx.clank(); } }
      if (Math.abs(target - k.y) > 0.5) { const was = k.y; k.y += Math.sign(target - k.y) * Math.min(Math.abs(target - k.y), TP.fill * dt); if ((k.y < was) && Math.random() < dt * 8) ctx.burst((k.x0 + Math.random() * (k.x1 - k.x0 + 1)) * ts, k.y, 1, ['#cfe6f0', '#9ac0d0'], 20, 0.4); }
      syncPool(k);
      const lv = levelOf(k); if (lv !== wasLvl && (lv === 'hi' || lv === 'lo' || lv === 'dry') && ctx.near(k.x0 * ts, k.y, 360)) ctx.sfx.thud && ctx.sfx.thud();
    }
    /* THE MILL WHEEL: it turns while its race runs; drained, it slows and stands still - its paddles a stair */
    for (const w of K.wheels) { const r = lockOf(w.race), running = r && r.y < r.loY - 6;
      w.v += ((running ? 2.2 : 0) - w.v) * Math.min(1, dt * 1.6); w.a += w.v * dt; const still = w.v < 0.05;
      if (still !== w.still) { w.still = still; wheelCells(w); ctx.resolve && ctx.resolve(); if (still && once('wheel')) number(w.cx * ts, w.cy * ts - 80, 'THE WHEEL STANDS STILL: ITS PADDLES ARE A STAIR'); }
      w.cd = Math.max(0, w.cd - dt);
      if (!still) for (const pp of ctx.players) { if (pp.dead) continue; const d = Math.hypot(pp.x - (w.cx * ts + 8), pp.y - 8 - w.cy * ts); if (d < w.r * ts + 6 && w.cd <= 0) { w.cd = TP.wheelCd; K.n.wheelBites++;
        ctx.asPlayer(pp, () => ctx.hurtHero(w.cx * ts + 8, TP.wheelDmg, { unblockable: true, name: 'THE MILL WHEEL' })); if (once('wheelBite')) number(pp.x, pp.y - 34, 'THE WHEEL\'S BLADES: STILL IT FIRST'); } } }
  }
  function wheelCells(w) { const still = !!w.still || w.v < 0.05; for (const [a, b, row] of w.steps) for (let x = a; x <= b; x++) ctx.cellSet(x, row, still ? T().ONEWAY : T().AIR); }

  /* ---------- THE PUNTS (movers): the deck rides its chamber's water, or rests on the dry bed ---------- */
  H.mover = (m, dt) => { if (!K) { m.dx = 0; m.dy = 0; return true; } const k = lockOf(m.towpath); if (!k) return false;
    const ox = m.x, oy = m.y; m.y = Math.min(k.y - 6, k.bedY - 8); m.dx = m.x - ox; m.dy = m.y - oy; return true; };

  /* ---------- THE SWING BRIDGES ---------- */
  const bridgeOf = id => K.bridges.find(b => b.id === id);
  function bridgeCells(b) { const on = b.k < 0.2; for (let x = b.x0; x <= b.x1; x++) ctx.cellSet(x, b.row, on ? T().ONEWAY : T().AIR); }
  function swing(b, by) {
    if (!b || (b.k > 0.02 && b.k < 0.98)) return null;   /* (it is turning: one turn at a time) */
    b.across = !b.across; K.n.swings++; ctx.sfx.chain ? ctx.sfx.chain() : ctx.sfx.clank && ctx.sfx.clank();
    if (!b.across) { bridgeCells({ ...b, k: 1 }); ctx.resolve && ctx.resolve(); b.k = 0.21; }
    if (b.arena && ctx.bossBridge) ctx.bossBridge(b);
    if (once('swing:' + b.id)) number(ctx.hero().x, ctx.hero().y - 34, b.across ? 'THE CAPSTAN TURNS: THE BRIDGE SWINGS ACROSS' : 'THE BRIDGE SWINGS CLEAR OF THE CUT');
    return b.across ? 'across' : 'open';
  }
  function stepBridges(dt) { for (const b of K.bridges) { const to = b.across ? 0 : 1; if (Math.abs(b.k - to) < 1e-3) continue; const was = b.k < 0.2;
    b.k += Math.sign(to - b.k) * Math.min(Math.abs(to - b.k), dt / TP.swing); const now = b.k < 0.2; if (was !== now) { bridgeCells(b); ctx.resolve && ctx.resolve(); if (now) ctx.sfx.thud && ctx.sfx.thud(); } } }

  /* ---------- THE LANTERN, THE LAMPS AND THE FOG ---------- */
  const lantern = pp => { if (!K) return { has: false, lit: false }; const n = (pp && pp.n) || 1; let q = K.lantern.get(n); if (!q) { q = { has: false, lit: false }; K.lantern.set(n, q); } return q; };
  H.lanternOf = pp => lantern(pp);
  /* a blow landed on a hero: his lantern gutters out (E lights it again) */
  H.guttered = pp => { if (!K) return; const q = lantern(pp); if (q.has && q.lit) { q.lit = false; K.n.gutters++; if (once('gutter')) number(pp.x, pp.y - 34, 'THE BLOW PUTS YOUR LANTERN OUT: E LIGHTS IT'); } };
  /* the fog's thickness at x (0..1): the band's own, thickened with the night as the hero goes on through it */
  const fogAt = x => { if (!K) return 0; const ts = TS(); let a = 0; for (const f of K.D.fogs) { if (x < f.x0 * ts || x > (f.x1 + 1) * ts) continue; const P = ctx.hero(), k = P ? Math.max(0, Math.min(1, (P.x - f.x0 * ts) / ((f.x1 - f.x0 + 1) * ts))) : 0;
    a = Math.max(a, Math.min(0.9, f.a + (f.rises || 0) * k)); } if (ctx.shroud) a = Math.max(a, ctx.shroud(x)); return a; };
  /* the light at (x, y): 1 inside a lit lantern's or a lit lamp's clearing, fading to 0 at its edge */
  const lightAt = (x, y) => { let best = 0; for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); if (!q.has) continue; const r = q.lit ? TP.litR : TP.dimR, d = Math.hypot(pp.x - x, pp.y - 10 - y);
      if (d < r) best = Math.max(best, 1 - d / r); }
    const ts = TS(); for (const l of K.lamps) if (l.lit) { const d = Math.hypot(l.x * ts + 8 - x, l.y * ts - 14 - y); if (d < TP.lampR) best = Math.max(best, 1 - d / TP.lampR); } return best; };
  H.lightAt = (x, y) => (K ? lightAt(x, y) : 0);
  H.fogAt = x => fogAt(x);
  /* IS THIS HERO SEEN by foe e: out of the fog, yes (the game's own eyes); in it, only if he is lit (his lantern, or a lamp's clearing) and in range, or at e's elbow */
  const seenBy = (e, pp) => { if (!pp || pp.dead) return false; const d = Math.hypot(pp.x - e.x, pp.y - e.y); if (d < TP.elbow) return true;
    if (fogAt(pp.x) < 0.3 && fogAt(e.x) < 0.3) return true; const q = lantern(pp), ts = TS(), lit = (q.has && q.lit) || K.lamps.some(l => l.lit && Math.hypot(l.x * ts + 8 - pp.x, l.y * ts - 14 - (pp.y - 10)) < TP.lampR * 0.7);   /* (his own dim ember lights nobody to a watchman) */
    return lit && d < (e.tpDoze ? TP.sightD : TP.sightW); };
  H.seen = (e, pp) => !K || seenBy(e, pp || ctx.hero());
  /* A DOZER in the fog: he stands on his bollard until he sees a hero - then he is awake for good (a '!', and he comes) */
  H.hold = (e, dt) => { if (!K || !e.tpDoze || e.tpAwake) return false; if (ctx.players.some(pp => seenBy(e, pp)) || (e.hurtT || 0) > 0 || e.hp < (e.hp0 || e.hp)) { e.tpAwake = true; K.n.woke++; ctx.mark(e, '!', '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(false);
      if (once('woke')) number(e.x, e.y - 40, 'HE SEES YOUR LIGHT'); return false; } e.vx = 0; return true; };
  /* the water surface at column x - a lock's (not dry) or a cut's - for the grindylow (src/canal-foes.js, through main.js CNFX) */
  H.surfaceAt = x => { if (!K) return null; for (const p of ctx.L.pools || []) if (p.tp && !p.dry && x > p.x0 && x < p.x1) return { y: p.y, id: p.tp }; return null; };

  /* ---------- A BLOW AT A GADGET (any hero's blade): a paddle, a capstan, a lamp ---------- */
  function strikes(dt) {
    for (const [g, t] of K.cd) { const v = t - dt; if (v <= 0) K.cd.delete(g); else K.cd.set(g, v); }
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) { pp.tpStruck = null; return; } const hb = ctx.attackBox(); if (!hb) return;
      pp.tpStruck = pp.tpStruck || new Set();   /* ONE SWING, ONE TURN: a long blade (the Death Knight's) stays out past the cooldown - it works a gadget once a swing */
      for (const g of K.gadgets) { if (K.cd.has(g) || pp.tpStruck.has(g) || !(g.t === 'tppaddle' || g.t === 'tpcapstan' || g.t === 'tplamp')) continue;
        if (!ctx.overlap(hb, { l: g.x - 8, r: g.x + 8, t: g.y - 30, b: g.y })) continue; K.cd.set(g, TP.hitCd); pp.tpStruck.add(g); use(g, P); } });
  }
  function use(g, P) {
    g.flash = 0.3;
    if (g.t === 'tppaddle') return !!work(lockOf(g.lock), 'hero');
    if (g.t === 'tpcapstan') return !!swing(bridgeOf(g.bridge), 'hero');
    if (g.t === 'tplamp') { const l = K.lamps.find(q => q.x * TS() + 8 === g.x); if (!l) return false; l.lit = !l.lit; K.n.lamps++; ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(g.x, g.y - 22, 6, l.lit ? ['#ffd36b', '#fff2b0'] : ['#5a5048', '#3a3430'], 30, 0.3);
      if (l.lit && once('lamp')) number(g.x, g.y - 44, 'THE LAMP BURNS THE FOG OFF ROUND IT'); if (l.arena && ctx.bossLamp) ctx.bossLamp(l); return true; }
    if (g.t === 'tplantern') { const q = lantern(P); if (q.has) return false; q.has = true; q.lit = true; K.n.lights++; ctx.sfx.pickup ? ctx.sfx.pickup() : ctx.sfx.clank && ctx.sfx.clank();
      number(P.x, P.y - 34, 'THE LOCK-KEEPER\'S LANTERN: E LIGHTS IT, OR DIMS IT'); return true; }
    if (g.t === 'tpchurch') { K.n.church++; if (ctx.enterLevel && ctx.enterLevel(g.to || K.D.fork.church)) return true; number(g.x, g.y - 40, 'THE LIT CHURCH: THE WAY UP IS NOT OPEN YET'); return true; }
    return false;
  }
  /* E: the nearest gadget in reach; else the lantern (lit <-> dim) */
  H.interact = P => {
    if (!K || !P || P.dead) return false; let best = null, bd = TP.reach;
    for (const g of K.gadgets) { if (g.t === 'tplychgate') continue; if (g.t === 'tplantern' && lantern(P).has) continue; const d = Math.abs(g.x - P.x); if (d < bd && Math.abs(g.y - P.y) < 30) { bd = d; best = g; } }
    if (best) return use(best, P);
    const q = lantern(P); if (!q.has) return false;
    q.lit = !q.lit; if (q.lit) K.n.lights++; else K.n.dims++; ctx.sfx.clank && ctx.sfx.clank();
    if (once(q.lit ? 'lit' : 'dim')) number(P.x, P.y - 34, q.lit ? 'LIT: YOU SEE THE WAY - AND THEY SEE YOU' : 'DIMMED: THE FOG HIDES YOU - AND THE WAY');
    return true;
  };

  /* ---------- ONE FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt; const ts = TS(), P0 = ctx.hero();
    stepLocks(dt); stepBridges(dt); strikes(dt);
    /* THE LAST DRY FOOTING is never in a lock: a rung or a sill in a chamber is under the water when it fills (the hand-back would put you in it again) */
    K.safe = K.safe || new Map(); for (const pp of ctx.players) { const n = pp.n || 1; if (!K.safe.has(n) && K.L.START) K.safe.set(n, { x: K.L.START.x * TS() + 8, y: (K.L.START.y + 1) * TS(), L: K.L }); const sf = pp.safe; if (!sf || sf.L !== K.L) { pp.safe = K.safe.get(n); continue; }
      const wet = (K.L.pools || []).some(p => p.tp && sf.x > p.x0 - 14 && sf.x < p.x1 + 14 && sf.y > p.y - 120); if (!wet) K.safe.set(n, sf); else if (K.safe.get(n)) pp.safe = K.safe.get(n); }
    /* THE TEACH'S LOW WATER ONLY WETS YOU: wading in a shallow chamber, you are handed back to the bank after a moment (no cost: the mill-pond lock is the soft lesson) */
    for (const pp of ctx.players) { if (pp.dead) continue; const p = (K.L.pools || []).find(q => q.tp && q.shallow && !q.dry && pp.x > q.x0 && pp.x < q.x1 && pp.y > q.y + 6);
      pp.tpWade = p ? (pp.tpWade || 0) + dt : 0; if (pp.tpWade > 1.2 && K.safe.get(pp.n || 1)) { const s = K.safe.get(pp.n || 1); pp.x = s.x; pp.y = s.y; pp.vx = 0; pp.vy = 0; pp.tpWade = 0; ctx.sfx.splash && ctx.sfx.splash(); if (once('wade')) number(pp.x, pp.y - 34, 'YOU WADE OUT TO THE BANK'); } }
    for (const g of K.gadgets) g.flash = Math.max(0, g.flash - dt);
    /* THE LANTERN ON ITS HOOK: walked past without it, it is yours (and said) - the rest of the level reads it */
    for (const pp of ctx.players) { const q = lantern(pp); if (!q.has && pp.x > (K.D.lantern.x + 3) * ts && !pp.dead) { q.has = true; q.lit = true; if (once('lanternPast')) number(pp.x, pp.y - 34, 'THE LOCK-KEEPER\'S LANTERN: E LIGHTS IT, OR DIMS IT'); } }
    /* A DROWNING: a man under a lock's or a cut's water - a chamber filled over him, a bridge swung from under him - is drowned (the game's own hazardFoe) */
    for (const p of ctx.L.pools || []) { if (!p.tp || p.dry || p.shallow) continue; for (const e of ctx.enemies()) { if (!e.alive || e.noGrav || e.t === 'grindylow' || e === ctx.boss || !(e.x > p.x0 && e.x < p.x1 && e.y > p.y + 6 && e.y <= (p.bottom ?? p.y + 400) + 8)) continue;
      if (ctx.drown(e)) { K.n.drowned++; if (once('drowned')) number(e.x, p.y - 30, 'THE WATER TAKES HIM'); } } }
    /* THE FIRST LOOK at a thing: a line once (what it is, never the trick) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 70;
      for (const k of K.locks) if (!k.virtual && !k.race && near((k.x0 + k.x1) / 2 * ts, k.y, 120) && once('lockSeen')) number(P0.x, P0.y - 34, 'A LOCK: ITS PADDLE MOVES THE WATER');
      if (fogAt(P0.x) > 0.45 && once('fog')) number(P0.x, P0.y - 34, 'THE FOG IS IN: A WATCHMAN SEES ONLY WHAT IS LIT');
      if (K.L.examSpans && K.L.examSpans.some(s => P0.x >= s[0] * ts && P0.x < (s[1] + 1) * ts) && once('exam')) number(P0.x, P0.y - 44, 'THE LAST LOCK: DRAINED, ITS IRONS KILL'); }
    stall(P0, dt);
  };

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     { x, y (feet px), key: 'atk'|'talk'|null, face, hold } or null (nothing to work here) */
  H.walkHint = P => {
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, row = P.y / ts;
    const at = (x, feetPx, key, face, hold) => ({ x, y: feetPx, key, face: face || 0, hold: !!hold });
    const puntEnd = id => { const m = ctx.movers().find(q => q.towpath === id), k = lockOf(id); if (!m || !k) return null; const pd = K.gadgets.find(g => g.t === 'tppaddle' && g.lock === id && g.x >= k.x0 * ts && g.x < (k.x1 + 1) * ts); return { x: pd ? pd.x - 14 : m.x + m.w - 7, y: m.y }; };   /* (on the punt: a step short of its chamber paddle, facing it) */
    const onPunt = id => !!(P.onMover && P.onMover.towpath === id);
    const lockStep = (id, bank, bankRow) => { const k = lockOf(id); if (!k) return null; const lv = levelOf(k), pe = puntEnd(id);
      if (onPunt(id)) { if (lv === 'hi') return null; if (k.to <= k.hiY + 1) return at(pe.x, pe.y, null, 1, true); return at(pe.x, pe.y, 'atk', 1); }
      if (lv === 'hi' && bank !== null && row <= bankRow + 1.5 && c < k.x0) return at(bank * ts + 8 - 10, (bankRow + 1) * ts, 'atk', 1);   /* high and you below: the bank paddle drains it */
      if (lv === 'down' || lv === 'up') return at(bank !== null ? bank * ts + 8 - 14 : P.x, (bankRow + 1) * ts, null, 1, true);
      if (pe && (lv === 'lo' || lv === 'dry')) return at(pe.x, pe.y, null, 1); return null; };
    const O = K.D.O || 0;
    if (c > 40 && c < 56 && row > 30 + O) return lockStep('A', 46, 37 + O);
    if (c > 94 && c < 100 && row < 35 + O) { const r = lockOf('race'); if (r && !(levelOf(r) === 'lo' || levelOf(r) === 'dry')) return at(98 * ts + 8 - 10, (33 + 1 + O) * ts, r.to <= r.hiY + 1 ? 'atk' : null, 1, r.to > r.hiY + 1); }
    if (c > 126 && c < 132 && row < 33 + O) { const b = bridgeOf('tail'); if (b && !b.across) return at(130 * ts + 8 - 10, (31 + 1 + O) * ts, 'atk', 1); }
    if (c > 152 && c < 168 && row > 25 + O) return lockStep('F1', 159, 31 + O);
    if (c > 166 && c < 176 && row > 20 + O) { const k = lockOf('F2'), lv = levelOf(k), live = ctx.enemies().some(e => e.alive && e.squad === 'dryChamber'), onLanding = row <= 27 + O + 0.2 && c < 169;
      if (onPunt('F2')) return lockStep('F2', null, 26 + O);
      if (onLanding) { if (live && (lv === 'dry' || lv === 'lo')) return at(167 * ts + 8 - 8, (27 + O) * ts, 'atk', 1);
        if (lv === 'up' || lv === 'down') return at(167 * ts, (27 + O) * ts, null, 1, true);
        if (lv === 'hi') return at(167 * ts + 8 - 8, (27 + O) * ts, 'atk', 1); }
      if (lv === 'dry' && !live) { const pe = puntEnd('F2'); return pe ? at(pe.x, pe.y, null, 1) : null; } return null; }
    if (c > 174 && c < 183 && row > 15 + O) return lockStep('F3', 175, 21 + O);
    if (c > 218 && c < 238 && row < 19 + O) { const b = bridgeOf('basin'); if (b && !b.across) { const cap = c < 228 ? 220 : 236; return at(cap * ts + 8 + (c < 228 ? -10 : 10), (16 + 1 + O) * ts, 'atk', c < 228 ? 1 : -1); } }
    if (c > 263 && c < 280 && row < 18 + O) { const k = lockOf('X'), lv = levelOf(k); if (lv === 'hi') return at(266 * ts + 8 - 10, (17 + O) * ts, 'atk', 1); if (lv === 'down') return at(266 * ts, (17 + O) * ts, null, 1, true); }
    if (c > 279 && c < 293 && row > 20 + O) return lockStep('Y', 283, 25 + O);
    if (c > 292 && c < 297 && row < 15 + O) { const b = bridgeOf('cut'); if (b && !b.across) return at(296 * ts + 8 - 10, (14 + O) * ts, 'atk', 1); }
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.towpath) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'lock') { const k = lockOf(id); return k ? levelOf(k) : ''; }
    if (kind === 'bridge') { const b = bridgeOf(id); return b ? (b.across ? 'across' : 'open') : ''; }
    if (kind === 'wheel') { const w = K.wheels.find(q => q.id === id); return w ? (w.still ? 'still' : 'turning') : ''; }
    if (kind === 'lantern') { const q = lantern(ctx.hero()); return q.has ? (q.lit ? 'lit' : 'dim') : 'none'; }
    if (kind === 'squad') return ctx.enemies().some(e => e.alive && e.squad === id) ? 'alive' : 'gone';
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('towpath', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (GREYBOX: plain shapes until the art pass) ---------- */
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), inX = (x, m = 80) => x > cx - m && x < cx + vw + m;
    /* THE LOCK CHAMBERS: the coped walls' faces (drawn over the sky behind the water), the GAUGE on each gate (a white post, the water's mark, the two levels) */
    for (const k of K.locks) { if (!inX(k.x0 * ts, 200)) continue;
      if (k.virtual) { const x0 = R(k.x0 * ts - cx), x1 = R((k.x1 + 1) * ts - cx), wy = R(k.y - cy), by = R(k.bedY - cy);   /* the arena's lock behind its gate: brick, the water, the gate */
        g.fillStyle = '#3a3430'; g.fillRect(x0, R(k.hiY - 30 - cy), x1 - x0, by - R(k.hiY - 30 - cy)); g.fillStyle = 'rgba(70,100,110,0.85)'; g.fillRect(x0 + 3, wy, x1 - x0 - 6, Math.max(0, by - wy));
        g.fillStyle = '#5a4630'; g.fillRect(x0 - 3, R(k.hiY - 34 - cy), 5, by - R(k.hiY - 34 - cy) + 4); gauge(g, x0 - 8, k, cx, cy); continue; }
      const gx0 = k.gate ? k.gate.x : k.x0 - 1; gauge(g, R(gx0 * ts + 8 - cx), k, cx, cy);
      if (k.gate) { const x = R(k.gate.x * ts - cx), top = R(k.gate.top * ts - cy), bot = R((k.gate.bot + 1) * ts - cy);
        if (k.gateOpen) { g.fillStyle = '#5a4630'; g.fillRect(x, top - 2, 3, bot - top + 2); g.fillRect(x + 13, top - 2, 3, bot - top + 2); }   /* open: the gate's leaves folded back */
        else { g.fillStyle = '#6a5236'; g.fillRect(x, top, ts, bot - top); g.fillStyle = '#3e3020'; for (let y = top + 4; y < bot; y += 8) g.fillRect(x + 1, y, ts - 2, 1); g.fillStyle = '#8a7048'; g.fillRect(x - 2, top - 3, ts + 4, 3); } } }
    /* THE PUNTS */
    for (const m of ctx.movers()) { if (!m.towpath || !inX(m.x)) continue; const x = R(m.x - cx), y = R(m.y - cy);
      g.fillStyle = '#4a3420'; g.fillRect(x, y, m.w, 6); g.fillStyle = '#6a4a2c'; g.fillRect(x + 2, y - 1, m.w - 4, 2); g.fillStyle = '#2e2014'; g.fillRect(x + 1, y + 6, m.w - 2, 2); g.fillRect(x + 4, y - 4, 2, 4); }
    /* THE MILL WHEEL: a rim, spokes and paddles, turning (or still: its stair) */
    for (const w of K.wheels) { if (!inX(w.cx * ts, 200)) continue; const x = R(w.cx * ts + 8 - cx), y = R(w.cy * ts - cy), r = w.r * ts;
      g.strokeStyle = '#5a4630'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      for (let i = 0; i < 8; i++) { const a = w.a + i * Math.PI / 4, ex = x + Math.cos(a) * r, ey = y + Math.sin(a) * r; g.strokeStyle = '#4a3a26'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
        g.fillStyle = w.still ? '#7a6040' : '#8a7048'; g.fillRect(R(ex - 4), R(ey - 2), 8, 4); }
      g.fillStyle = '#3a2e20'; g.fillRect(x - 3, y - 3, 6, 6);
      if (!w.still) { g.strokeStyle = 'rgba(255,107,107,0.35)'; g.setLineDash([3, 4]); g.beginPath(); g.arc(x, y, r + 6, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); } }
    /* THE SWING BRIDGES: across, the cells are its deck (the tiles draw it); turning or clear, the deck swung on its pivot */
    for (const b of K.bridges) { if (!inX(b.x0 * ts, 200)) continue; const pivL = R(b.x0 * ts - cx), y = R(b.row * ts - cy), len = (b.x1 - b.x0 + 1) * ts, a = b.k * Math.PI * 0.42;
      g.fillStyle = '#2e2820'; g.fillRect(pivL - 3, y - 2, 4, 10);
      if (b.k > 0.01) { g.save(); g.translate(pivL, y + 2); g.rotate(-a); g.fillStyle = '#7a5e3a'; g.fillRect(0, -3, len, 5); g.fillStyle = '#4a3820'; for (let i = 4; i < len; i += 8) g.fillRect(i, -3, 1, 5); g.fillRect(0, -9, len, 1); g.restore(); }
      else { g.fillStyle = '#4a3820'; g.fillRect(pivL, y - 7, len, 1); for (let i = 0; i <= len; i += 16) g.fillRect(pivL + i, y - 7, 1, 7); } }
    /* THE GADGETS: paddles (a rack post and its windlass), capstans (a drum), lamps, the lantern on its hook, the lychgate, the church door */
    for (const q of K.gadgets) { if (!inX(q.x)) continue; const x = R(q.x - cx), y = R(q.y - cy), fl = q.flash > 0;
      if (q.t === 'tppaddle') { const k = lockOf(q.lock); g.fillStyle = fl ? '#fff6c8' : '#4a3a2a'; g.fillRect(x - 2, y - 22, 4, 22); g.fillStyle = '#8a8a8a'; g.fillRect(x - 5, y - 24, 10, 3);
        g.strokeStyle = fl ? '#fff6c8' : '#c8c8c8'; g.beginPath(); g.arc(x, y - 14, 5, 0, Math.PI * 2); g.stroke(); const a = time * (k && Math.abs(k.to - k.y) > 0.5 ? 6 : 0); g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + Math.cos(a) * 7, y - 14 + Math.sin(a) * 7); g.stroke();
        if (k) { const up = k.to < k.y - 0.5, dn = k.to > k.y + 0.5; if (up || dn) ctx.text(up ? 'FILLING' : 'DRAINING', x, y - 34, '#cfe6f0', 'center', 5); } }
      else if (q.t === 'tpcapstan') { g.fillStyle = fl ? '#fff6c8' : '#5a4630'; g.fillRect(x - 5, y - 12, 10, 12); g.fillStyle = '#3a2e20'; g.fillRect(x - 7, y - 13, 14, 2); const a = time * 2; g.fillStyle = '#8a7048'; g.fillRect(x + R(Math.cos(a) * 8) - 1, y - 9, 3, 2); }
      else if (q.t === 'tplamp') { const l = K.lamps.find(z => z.x * ts + 8 === q.x); g.fillStyle = '#2e2a26'; g.fillRect(x - 1, y - 26, 3, 26); g.fillStyle = l && l.lit ? '#ffd36b' : '#4a4640'; g.fillRect(x - 3, y - 32, 7, 7);
        if (l && l.lit) { g.globalAlpha = 0.25 + 0.08 * Math.sin(time * 9); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 28, 14, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } }
      else if (q.t === 'tplantern') { if (lantern(ctx.hero()).has) continue; g.fillStyle = '#3a2e20'; g.fillRect(x - 1, y - 30, 2, 8); g.fillStyle = '#ffd36b'; g.fillRect(x - 3, y - 22, 7, 8); g.globalAlpha = 0.3; g.beginPath(); g.arc(x, y - 18, 12, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      else if (q.t === 'tplychgate') { g.fillStyle = '#4a3a2a'; g.fillRect(x - 18, y - 30, 4, 30); g.fillRect(x + 14, y - 30, 4, 30); g.fillStyle = '#6a3a2a'; g.beginPath(); g.moveTo(x - 24, y - 30); g.lineTo(x, y - 44); g.lineTo(x + 24, y - 30); g.fill();
        g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - 30, 4, 4); }
      else if (q.t === 'tpchurch') { g.fillStyle = '#5a5048'; g.fillRect(x - 12, y - 34, 24, 34); g.fillStyle = '#2a2420'; g.fillRect(x - 7, y - 26, 14, 26); g.fillStyle = '#ffd36b'; g.fillRect(x - 2, y - 32, 4, 4);
        if (Math.abs(ctx.hero().x - q.x) < 40 && Math.abs(ctx.hero().y - q.y) < 40) ctx.text('THE LIT CHURCH', x, y - 44, '#ffe9a0', 'center', 5); } }
    /* THE DECOR (greybox): milestones, willows, cattle, bollards */
    for (const d of K.D.decor) { if (!inX(d.x * ts)) continue; const x = R(d.x * ts + 8 - cx), y = R((d.y + 1) * ts - cy);
      if (d.kind === 'milestone') { g.fillStyle = '#8a8478'; g.fillRect(x - 3, y - 10, 6, 10); }
      else if (d.kind === 'willow') { g.fillStyle = '#3a3024'; g.fillRect(x - 2, y - 30, 4, 30); g.fillStyle = 'rgba(70,100,60,0.8)'; for (let i = -3; i <= 3; i++) g.fillRect(x + i * 4, y - 34 + Math.abs(i) * 2, 2, 22 - Math.abs(i) * 2); }
      else if (d.kind === 'cattle') { g.fillStyle = '#5a4a3a'; g.fillRect(x - 10, y - 10, 20, 7); g.fillRect(x + 8, y - 13, 5, 5); g.fillRect(x - 8, y - 3, 2, 3); g.fillRect(x + 6, y - 3, 2, 3); }
      else if (d.kind === 'bollard') { g.fillStyle = '#2e2a26'; g.fillRect(x - 3, y - 8, 6, 8); g.fillRect(x - 4, y - 9, 8, 2); } }
    /* THE DOZERS: a 'z' over a dozing man; awake, nothing */
    for (const e of ctx.enemies()) { if (!e.alive || !e.tpDoze || e.tpAwake || !inX(e.x)) continue; ctx.text('Z', R(e.x - cx) + 6, R(e.y - cy) - 26 - R((time * 8) % 8), '#c8d8e8', 'center', 6); }
    if (K.glint && K.glint.show) drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), vw, ctx.VH(), time);
  };
  /* A GAUGE: a white post by the gate, the two levels marked (lo, hi), the water's own mark moving between them */
  function gauge(g, x, k, cx, cy) { const hi = R(k.hiY - cy), lo = R(k.loY - cy), w = R(k.y - cy); g.fillStyle = '#d8d8d0'; g.fillRect(x - 1, hi - 4, 2, lo - hi + 8); g.fillStyle = '#8fd160'; g.fillRect(x - 3, hi, 6, 1); g.fillStyle = '#c8a070'; g.fillRect(x - 3, lo, 6, 1);
    g.fillStyle = '#6ab0e0'; g.fillRect(x - 4, Math.max(hi - 4, Math.min(lo + 4, w)) - 1, 8, 2); }
  let FOGC = null;
  /* OVER EVERYTHING: THE FOG (its bands, with the clearings that the lantern and the lamps burn in it), the hero's lantern glow */
  H.drawOver = (g, cx, cy, time) => {
    if (!K) return; const vw = ctx.VW(), vh = ctx.VH(), ts = TS();
    let any = false; for (let sx = 0; sx < vw; sx += 32) if (fogAt(cx + sx) > 0.05) { any = true; break; }
    if (any && typeof document !== 'undefined') {
      if (!FOGC || FOGC.width !== vw || FOGC.height !== vh) { FOGC = document.createElement('canvas'); FOGC.width = vw; FOGC.height = vh; }
      const f = FOGC.getContext('2d'); f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, vw, vh);
      for (let sx = 0; sx < vw; sx += 8) { const a = fogAt(cx + sx); if (a <= 0.02) continue; f.fillStyle = 'rgba(176,186,196,' + a.toFixed(3) + ')'; f.fillRect(sx, 0, 8, vh);
        f.fillStyle = 'rgba(210,218,226,' + (a * 0.25).toFixed(3) + ')'; f.fillRect(sx, R(vh * 0.55 + Math.sin(time * 0.4 + (cx + sx) * 0.01) * 10), 8, 30); }
      f.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r) => { const gr = f.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,0.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = gr; f.beginPath(); f.arc(x, y, r, 0, Math.PI * 2); f.fill(); };
      for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); hole(pp.x - cx, pp.y - 12 - cy, q.has ? (q.lit ? TP.litR : TP.dimR) : TP.dimR); }
      for (const l of K.lamps) if (l.lit) hole(l.x * ts + 8 - cx, l.y * ts - 14 - cy, TP.lampR);
      f.globalCompositeOperation = 'source-over'; g.drawImage(FOGC, 0, 0);
    }
    /* THE LANTERN IN HIS HAND: a warm point and its glow (dimmed: an ember) */
    for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); if (!q.has) continue; const x = R(pp.x - cx + (pp.face || 1) * 6), y = R(pp.y - 10 - cy);
      g.fillStyle = q.lit ? '#ffd36b' : '#7a5a3a'; g.fillRect(x - 1, y - 2, 3, 4); if (q.lit) { g.globalAlpha = 0.18; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } }
  };
  /* THE HUD: the lantern's state, small, under the health (once you carry it) */
  H.drawHud = (g) => { if (!K) return false; const q = lantern(ctx.hero()); if (!q.has) return false; ctx.text(q.lit ? 'LANTERN: LIT' : 'LANTERN: DIM', 8, ctx.VH() - 14, q.lit ? '#ffd36b' : '#9aa39a', 'left', 5); return false; };
  H.read = () => K && { n: { ...K.n }, locks: K.locks.map(k => ({ id: k.id, lvl: levelOf(k), y: R(k.y), to: R(k.to), gate: k.gateOpen })), bridges: K.bridges.map(b => ({ id: b.id, across: b.across, k: +b.k.toFixed(2) })),
    lamps: K.lamps.map(l => l.lit), wheels: K.wheels.map(w => ({ id: w.id, still: !!w.still })), lantern: [...K.lantern.values()].map(q => ({ ...q })), glint: K.glint && K.glint.key, lastNudge: K.lastNudge || null,
    dozers: ctx.enemies().filter(e => e.alive && e.tpDoze).map(e => ({ x: R(e.x / 16), awake: !!e.tpAwake })) };
  /* the rule's levers for the tools: work a lock, swing a bridge, light the lantern - as a hero would */
  H.work = id => (K ? work(lockOf(id), 'hero') : null);
  H.swing = id => (K ? swing(bridgeOf(id), 'hero') : null);
  H.setLantern = (pp, has, lit) => { if (!K) return; const q = lantern(pp); q.has = has; q.lit = lit; K.lantern.set((pp && pp.n) || 1, q); };
  H.lockLevel = id => (K && lockOf(id) ? levelOf(lockOf(id)) : '');
  H.lock = id => (K ? lockOf(id) : null);
  H.bridge = id => (K ? bridgeOf(id) : null);
  return H;
}
