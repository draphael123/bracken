// src/towpath-hands.js - THE TOWPATH's HANDS (claude/towpath, the greybox; THE TOWPATH 2, claude/towpath2). src/towpath.js builds the level; this binds its rule
// to the game:
// THE FOG ON THE LOW WATER (claude/towpath2): every bank (L.towpath.banks) lies FOG_H rows over its water - fogAt(x, y) is its thickness at that spot (0 above
// the bank's top edge); in THE FOG KNIGHT's arena the fog line is his (ctx.arenaFogTop) and the night's shroud his (ctx.shroud). A hero whose eyes are in it is
// HIDDEN - a watchman sees him only lit, a dozer wakes only to a lit hero or one at his elbow - and half-blind (the fog is drawn over everything but the
// clearings a lit lantern or a lamp burns in it); a hero above it is SEEN by every eye. THE FOG WRAITHS (src/fog-wraith.js) read fogTop (they never leave a
// bank) and hardLight (only a LIT lantern's light or a lamp's makes them solid - a dimmed ember does not).
// THE LOCKS (a chamber's water - an engine pool - moves toward the level its PADDLE last set: struck or E, a paddle fills a low chamber and drains a high one;
// a LOWER GATE stands open only while its chamber is down at its lower pound, and never shuts on a body in its doorway - the water waits; a man in a chamber
// that fills is drowned by the game's own pool rule; THE ARENA LOCK fills itself again FK.refill s after it is drained - its leaking gates), THE PUNTS (movers
// whose deck rides the chamber's water, or rests on a dry bed), THE MILL WHEEL (it turns while its race runs - its blades hurt; drained, it stands still and
// its paddles are a stair), THE SACK HOIST (a winch on each floor sends its deck to the other), THE AQUEDUCT (a sluice runs the dry trough and the current
// floats the barge to the far stop), THE BASIN CRANE (its capstan swings the jib: the hook rides between the quay and the roof's edge), THE SWING BRIDGES (a
// capstan, struck or E, swings the deck across or clear: clear, its cells are air and whoever stands on it goes in), THE LANTERN (the lock-keeper's, taken at
// his hut: E with no gadget in reach lights or dims it; a blow that lands on you gutters it; a wraith's smother puts it out), THE FORK (the hill path's door to
// THE LIT CHURCH: claude/litchurch's level - enterChurch is the hook), the glint and the 10 s nudge (STUCK_HANDS.towpath), the walker's hands (walkHint), and
// the drawing (GREYBOX shapes until the art pass). In THE FOG KNIGHT's arena the bridge, the lock and the lamps are his rule's (ctx.boss*: src/fog-knight-hands.js).
// main.js calls: reset, on, update, mover, hold, seen, interact, surfaceAt, lanternOf, guttered, smother, fogTop, hardLight, drawWorld, drawOver, drawHud, read,
// handsState, walkHint.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';
import * as TPG from './redraw/towpath_gear.js';
import * as TPG2 from './redraw/towpath_gear2.js';
import * as TPS from './redraw/towpath_set.js';
import { drawChill } from './redraw/fog_wraith_art.js';

/* THE NUMBERS. fill: px/s a chamber's water moves; swing: s a bridge takes to turn; reach: px a hero's E reaches a gadget; hitCd: s before the same gadget
   answers another blow; litR / dimR: px a lantern burns its clearing (lit / dimmed); lampR: a lamp's; sightW / sightD: px a watchman / a dozer sees a LIT hero
   at; elbow: px anyone sees anyone; wheelDmg: the turning wheel's blades; wheelCd: s between its bites; hoistV / bargeV: px/s the hoist's deck and the barge go;
   troughT: s the dry trough takes to run full; craneT: s the hook takes from the quay to the roof; eye: px over his feet a hero's eyes are (in the fog or not);
   edge: px of a bank's soft top edge */
export const TP = { fill: 36, swing: 0.9, reach: 26, hitCd: 0.4, litR: 92, dimR: 34, lampR: 72, sightW: 230, sightD: 150, elbow: 44, wheelDmg: 14, wheelCd: 0.9,
  hoistV: 44, bargeV: 46, troughT: 1.1, craneT: 3.0, eye: 20, edge: 10 };

export function makeTowpathHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS, T = () => ctx.T;
  const R = Math.round;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  H.on = () => !!K;
  H.state = () => K;

  /* ---------- RESET: a fresh load builds the rule's state; a respawn puts the water, the gates, the bridges and the rides back as the level was built ---------- */
  H.reset = () => {
    const L = ctx.L;
    if (!L || !L.towpath) { K = null; if (typeof window !== 'undefined' && window.BK && window.BK.walkHint && window.BK.walkHint.tp) delete window.BK.walkHint; return; }
    const D = L.towpath, ts = TS(), fresh = !K || K.L !== L;
    if (fresh) K = { L, D, said: {}, clock: 0, lantern: new Map(), n: { fills: 0, drains: 0, swings: 0, lights: 0, dims: 0, gutters: 0, smothers: 0, lamps: 0, drowned: 0, woke: 0, wheelBites: 0, nudges: 0, church: 0, scatters: 0, hoists: 0, barges: 0, cranes: 0, refills: 0 } };
    K.locks = D.locks.map(k => { const y = (k.init === 'hi' ? k.hi : k.lo) * ts + 4, bedY = k.bed * ts; return { ...k, y: Math.min(y, bedY), to: Math.min(y, bedY), loY: Math.min(k.lo * ts + 4, bedY), hiY: k.hi * ts + 4, bedY, dir: 0, gateOpen: true, hold: 0, refillT: 0 }; });
    K.bridges = D.bridges.map(b => ({ ...b, across: b.init === 'across', k: b.init === 'across' ? 0 : 1 }));
    K.lamps = D.lamps.map(l => ({ ...l }));
    K.wheels = D.wheels.map(w => ({ ...w, a: 0, v: 0, cd: 0 }));
    K.hoists = (D.hoists || []).map(h => ({ ...h, y: h.botPx, to: h.botPx, topY: h.topPx, botY: h.botPx }));
    K.troughs = (D.troughs || []).map(q => ({ ...q, x: q.stopW * ts, to: q.stopW * ts, water: 0, fillT: 0, bedY: q.bed * ts, surfY: q.surf * ts + 4 }));
    K.cranes = (D.cranes || []).map(c => ({ ...c, k: 0, goal: 0 }));   /* (k: where the hook is between the quay (0) and the roof (1); goal: where its capstan sent it) */
    K.gadgets = []; K.cd = new Map(); K.glint = null; K.stalls = {}; K.stallKey = null; K.fx = [];
    for (const e of L.ents) if (/^tp(paddle|capstan|lamp|lantern|church|lychgate|winch|sluice|crane)$/.test(e.t))
      K.gadgets.push({ t: e.t, x: e.x * ts + 8, y: (e.y + 1) * ts, lock: e.lock, bridge: e.bridge, hoist: e.hoist, trough: e.trough, crane: e.crane, arena: !!e.arena, to: e.to, ex: e.x, ey: e.y, flash: 0, dark: !!e.dark });
    K.decor = (D.decor || []).map(d => ({ ...d, a: d.kind === 'fogKnight' ? 1 : 0, gone: false }));
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
  /* is a body in the gate's doorway (its column, its rows above the sill). A HERO anywhere in it holds the gate (it never shuts on you); a FOE only when he
     stands IN the doorway - his middle in the gate's column, his feet above its sill. Returns 'hero' | 'foe' | false */
  const inGate = k => { if (!k.gate) return false; const ts = TS(), l = k.gate.x * ts, r = l + ts, t = k.gate.top * ts, b = (k.gate.bot + 1) * ts, heroes = new Set(ctx.players);
    let who = false; for (const q of ctx.bodies()) { const bx = ctx.box(q); if (!(bx.r > l && bx.l < r && bx.b > t && bx.t < b)) continue;
      if (heroes.has(q) || q === ctx.hero()) return 'hero'; const mx = (bx.l + bx.r) / 2; if (mx >= l && mx < r && bx.b <= b + 1) who = 'foe'; } return who; };
  /* A PADDLE: a low (or dry, or draining) chamber fills, a high (or filling) one drains. by: 'hero' | 'boss' */
  function work(k, by) {
    if (!k) return null; const ts = TS();
    const up = k.to > k.hiY + 1 && !(k.to < k.y);   /* resting low, or draining: fill it */
    k.to = up ? k.hiY : (k.lo * ts >= k.bedY - 1 ? k.bedY : k.loY); k.refillT = 0;
    if (up) K.n.fills++; else K.n.drains++;
    ctx.sfx.chain ? ctx.sfx.chain() : ctx.sfx.clank && ctx.sfx.clank();
    if (k.arena && !up && ctx.bossLock) ctx.bossLock('drained');
    if (up && once('fill:' + k.id)) number(ctx.hero().x, ctx.hero().y - 34, k.race ? 'THE RACE RUNS: THE WHEEL TURNS' : 'THE PADDLE IS UP: THE CHAMBER FILLS');
    if (!up && once('drain:' + k.id)) number(ctx.hero().x, ctx.hero().y - 34, k.race ? 'THE RACE RUNS DRY: THE WHEEL SLOWS' : 'THE PADDLE IS DOWN: THE CHAMBER DRAINS');
    return up ? 'fill' : 'drain';
  }
  function stepLocks(dt) {
    const ts = TS();
    for (const k of K.locks) {
      /* THE ARENA LOCK's leaking gates: drained and left, it fills itself again (the double's water comes back) - only while he fights */
      if (k.refill && k.to >= k.loY - 1 && Math.abs(k.y - k.to) < 1 && ctx.bossActive) { k.refillT += dt; if (k.refillT >= k.refill) { k.refillT = 0; k.to = k.hiY; K.n.refills++; if (once('refill')) number(k.x0 * ts, k.hiY - 30, 'THE LOCK FILLS AGAIN THROUGH ITS LEAKING GATES'); } }
      const wasLvl = levelOf(k);
      /* the lower gate: it must shut before the water stands over the lower pound - and it never shuts on a body in its doorway (the water waits) */
      let target = k.to;
      if (k.gate) { const wantShut = Math.min(k.y, target) < k.loY - 3;
        if (wantShut && k.gateOpen) { const held = inGate(k); if (held) { target = Math.max(target, k.loY - 3); if (held === 'foe' && once('gateFoe:' + k.id)) number(k.gate.x * ts + 8, k.gate.top * ts - 20, 'SOMETHING STANDS IN THE GATE'); } else { k.gateOpen = false; gateCells(k); ctx.resolve && ctx.resolve(); ctx.sfx.clank && ctx.sfx.clank(); } }
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
        ctx.asPlayer(pp, () => ctx.hurtHero(w.cx * ts + 8, TP.wheelDmg, { unblockable: true, name: 'THE MILL WHEEL' })); if (once('wheelBite')) number(pp.x, pp.y - 34, "THE WHEEL'S BLADES: STILL IT FIRST"); } } }
    /* THE SACK HOIST, THE AQUEDUCT'S BARGE, THE CRANE'S HOOK */
    for (const h of K.hoists) if (Math.abs(h.to - h.y) > 0.3) h.y += Math.sign(h.to - h.y) * Math.min(Math.abs(h.to - h.y), TP.hoistV * dt);
    for (const q of K.troughs) { if (q.fillT > 0) { q.fillT = Math.max(0, q.fillT - dt); q.water = Math.min(1, q.water + dt / TP.troughT); }
      else if (Math.abs(q.to - q.x) > 0.3) { q.x += Math.sign(q.to - q.x) * Math.min(Math.abs(q.to - q.x), TP.bargeV * dt); if (Math.random() < dt * 10) ctx.burst(q.x + (q.to > q.x ? 0 : q.w * TS()), q.surfY, 1, ['#cfe6f0', '#9ac0d0'], 16, 0.4); } }
    for (const c of K.cranes) if (Math.abs(c.goal - c.k) > 1e-3) c.k += Math.sign(c.goal - c.k) * Math.min(Math.abs(c.goal - c.k), dt / TP.craneT);
  }
  function wheelCells(w) { const still = !!w.still || w.v < 0.05; for (const [a, b, row] of w.steps) for (let x = a; x <= b; x++) ctx.cellSet(x, row, still ? T().ONEWAY : T().AIR); }
  const hoistOf = id => K.hoists.find(h => h.id === id), troughOf = id => K.troughs.find(q => q.id === id), craneOf = id => K.cranes.find(c => c.id === id);
  const hookAt = c => { const ts = TS(), k = c.k, x = (c.from[0] + (c.to[0] - c.from[0]) * k) * ts, y = c.fromPx + (c.toPx - c.fromPx) * k - Math.sin(k * Math.PI) * 26; return { x, y }; };
  const bargeDeck = q => { const dry = q.bedY - 8, wet = q.surfY - 6; return dry + (wet - dry) * q.water; };

  /* ---------- THE MOVERS: a punt's deck rides its chamber's water (or rests on the dry bed); the hoist, the barge, the hook go where their gadgets sent them ---------- */
  H.mover = (m, dt) => { if (!K) { m.dx = 0; m.dy = 0; return true; } const ox = m.x, oy = m.y;
    if (m.kind === 'hoist') { const h = hoistOf(m.towpath); if (!h) return false; m.y = h.y; }
    else if (m.kind === 'barge') { const q = troughOf(m.towpath); if (!q) return false; m.x = q.x; m.y = bargeDeck(q); }
    else if (m.kind === 'hook') { const c = craneOf(m.towpath); if (!c) return false; const p = hookAt(c); m.x = p.x; m.y = p.y; }
    else { const k = lockOf(m.towpath); if (!k) return false; m.y = Math.min(k.y - 6, k.bedY - 8); }
    m.dx = m.x - ox; m.dy = m.y - oy; return true; };
  const rideState = (kind, id) => { const ts = TS();
    if (kind === 'hoist') { const h = hoistOf(id); return !h ? '' : Math.abs(h.to - h.y) > 0.3 ? 'moving' : h.y <= h.topY + 0.5 ? 'top' : 'bot'; }
    if (kind === 'trough') { const q = troughOf(id); return !q ? '' : q.fillT > 0 || Math.abs(q.to - q.x) > 0.3 ? 'moving' : q.x <= q.stopW * ts + 0.5 ? 'west' : 'east'; }
    if (kind === 'crane') { const c = craneOf(id); return !c ? '' : Math.abs(c.goal - c.k) > 1e-3 ? 'moving' : c.k < 0.5 ? 'quay' : 'roof'; } return ''; };
  /* a WINCH: the hoist to its other floor; a SLUICE: the trough runs and the barge goes to the far stop (from the stop it is at); a CRANE capstan: the hook swings */
  function wind(h) { if (!h || rideState('hoist', h.id) === 'moving') return null; h.to = h.y <= h.topY + 0.5 ? h.botY : h.topY; K.n.hoists++; ctx.sfx.chain ? ctx.sfx.chain() : ctx.sfx.clank && ctx.sfx.clank();
    if (once('hoist')) number(ctx.hero().x, ctx.hero().y - 34, 'THE WINCH TURNS: THE HOIST RIDES TO THE OTHER FLOOR'); return h.to === h.topY ? 'up' : 'down'; }
  function sluice(q, g) { if (!q || rideState('trough', q.id) === 'moving') return null; const ts = TS(), atW = q.x <= q.stopW * ts + 0.5, west = g && g.x < (q.stopW + q.stopE) / 2 * ts;
    if (atW !== !!west) { if (once('sluiceFar')) number(ctx.hero().x, ctx.hero().y - 34, 'THE BARGE IS AT THE FAR STOP: ITS OWN SLUICE SENDS IT'); return null; }
    if (q.water < 1) q.fillT = TP.troughT; q.to = (atW ? q.stopE : q.stopW) * ts; K.n.barges++; ctx.sfx.splash ? ctx.sfx.splash() : ctx.sfx.clank && ctx.sfx.clank();
    if (once('sluice')) number(ctx.hero().x, ctx.hero().y - 34, 'THE SLUICE OPENS: THE TROUGH RUNS AND THE BARGE FLOATS'); return 'sent'; }
  function swingJib(c) { if (!c || rideState('crane', c.id) === 'moving') return null; c.goal = c.k < 0.5 ? 1 : 0; K.n.cranes++; ctx.sfx.chain ? ctx.sfx.chain() : ctx.sfx.clank && ctx.sfx.clank();
    if (once('crane')) number(ctx.hero().x, ctx.hero().y - 34, 'THE CRANE SWINGS: THE HOOK RIDES UP OUT OF THE FOG'); return c.goal ? 'up' : 'down'; }

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
  /* a wraith closed its hand on the flame: out (true if it was lit) */
  H.smother = pp => { if (!K) return false; const q = lantern(pp); if (!(q.has && q.lit)) return false; q.lit = false; K.n.smothers++; return true; };
  /* THE BANK'S TOP EDGE at x (px; the highest bank over that column), or null */
  const bankTop = x => { const ts = TS(); let top = null; for (const b of K.D.banks || []) if (x >= b.x0 * ts && x < (b.x1 + 1) * ts) top = top === null ? b.top * ts : Math.min(top, b.top * ts); return top; };
  const arenaTop = x => (ctx.arenaFogTop ? ctx.arenaFogTop(x) : null);
  /* the fog's thickness at (x, y), 0..1: a bank's, under its top edge (soft for TP.edge px); the arena's fog line; the knight's shroud */
  const fogAt = (x, y) => { if (!K) return 0; const ts = TS(); let a = 0;
    for (const b of K.D.banks || []) { if (x < b.x0 * ts || x >= (b.x1 + 1) * ts) continue; const d = y - b.top * ts; if (d > 0) a = Math.max(a, b.a * Math.min(1, d / TP.edge)); }
    const at = arenaTop(x); if (at !== null && y > at) a = Math.max(a, 0.62 * Math.min(1, (y - at) / TP.edge));
    if (ctx.shroud) a = Math.max(a, ctx.shroud(x)); return a; };
  const eyeFog = pp => fogAt(pp.x, pp.y - TP.eye);
  /* the light at (x, y): 1 inside a lantern's or a lit lamp's clearing, fading to 0 at its edge (a dimmed lantern's ember too: you see a little round you) */
  const lightAt = (x, y) => { let best = 0; for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); if (!q.has) continue; const r = q.lit ? TP.litR : TP.dimR, d = Math.hypot(pp.x - x, pp.y - 10 - y);
      if (d < r) best = Math.max(best, 1 - d / r); }
    const ts = TS(); for (const l of K.lamps) if (l.lit) { const d = Math.hypot(l.x * ts + 8 - x, l.y * ts - 14 - y); if (d < TP.lampR) best = Math.max(best, 1 - d / TP.lampR); } return best; };
  /* THE LIGHT THAT HARDENS A WRAITH: a LIT lantern's or a lit lamp's - never a dimmed ember */
  const hardLight = (x, y) => { let best = 0; for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); if (!(q.has && q.lit)) continue; const d = Math.hypot(pp.x - x, pp.y - 10 - y); if (d < TP.litR) best = Math.max(best, 1 - d / TP.litR); }
    const ts = TS(); for (const l of K.lamps) if (l.lit) { const d = Math.hypot(l.x * ts + 8 - x, l.y * ts - 14 - y); if (d < TP.lampR) best = Math.max(best, 1 - d / TP.lampR); } return best; };
  H.lightAt = (x, y) => (K ? lightAt(x, y) : 0);
  H.hardLight = (x, y) => (K ? hardLight(x, y) : 0);
  /* IS IT LIT HERE: a LIT lantern's clearing or a lit lamp's (a dimmed ember finds nothing) - THE LAST LOCK's paddle stands in the dark under an unlit lamp */
  const litAt = (x, y) => { const ts = TS(); for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); if (q.has && q.lit && Math.hypot(pp.x - x, pp.y - 10 - y) < TP.litR) return true; }
    return K.lamps.some(l => l.lit && Math.hypot(l.x * ts + 8 - x, l.y * ts - 14 - y) < TP.lampR); };
  const darkPaddle = g => !!(g && g.dark && !litAt(g.x, g.y - 14));
  H.litAt = (x, y) => (K ? litAt(x, y) : false);
  H.fogAt = (x, y) => (K ? fogAt(x, y === undefined ? (ctx.hero() ? ctx.hero().y - TP.eye : 0) : y) : 0);
  H.inFog = pp => (K ? eyeFog(pp || ctx.hero()) >= 0.3 : false);
  /* a wraith's roof: the top edge of the bank it lives in (px), or null */
  H.fogTop = x => (K ? (bankTop(x) ?? arenaTop(x)) : null);
  /* IS THIS HERO SEEN by foe e: ABOVE the fog, yes (every eye); in it, only if he is lit (his lantern, or a lamp's clearing) and in range, or at e's elbow */
  const seenBy = (e, pp) => { if (!pp || pp.dead) return false; const d = Math.hypot(pp.x - e.x, pp.y - e.y); if (d < TP.elbow) return true;
    if (eyeFog(pp) < 0.3) return true; const q = lantern(pp), ts = TS(), lit = (q.has && q.lit) || K.lamps.some(l => l.lit && Math.hypot(l.x * ts + 8 - pp.x, l.y * ts - 14 - (pp.y - 10)) < TP.lampR * 0.7);   /* (his own dim ember lights nobody to a watchman) */
    return lit && d < (e.tpDoze ? TP.sightD : TP.sightW); };
  H.seen = (e, pp) => !K || seenBy(e, pp || ctx.hero());
  /* A DOZER in the fog: he stands on his bollard until he sees a hero - then he is awake for good (a '!', and he comes) */
  H.hold = (e, dt) => { if (!K || !e.tpDoze || e.tpAwake) return false; if (ctx.players.some(pp => seenBy(e, pp)) || (e.hurtT || 0) > 0 || e.hp < (e.hp0 || e.hp)) { e.tpAwake = true; K.n.woke++; ctx.mark(e, '!', '#ff6b6b'); ctx.sfx.tell && ctx.sfx.tell(false);
      if (once('woke')) number(e.x, e.y - 40, 'HE SEES YOUR LIGHT'); return false; } e.vx = 0; return true; };
  /* the water surface at column x - a lock's (not dry) or a cut's (for main.js's water foes) */
  H.surfaceAt = x => { if (!K) return null; for (const p of ctx.L.pools || []) if (p.tp && !p.dry && x > p.x0 && x < p.x1) return { y: p.y, id: p.tp }; return null; };

  /* ---------- A BLOW AT A GADGET (any hero's blade): a paddle, a capstan, a lamp, a winch, a sluice, a crane ---------- */
  const STRUCK = new Set(['tppaddle', 'tpcapstan', 'tplamp', 'tpwinch', 'tpsluice', 'tpcrane']);
  function strikes(dt) {
    for (const [g, t] of K.cd) { const v = t - dt; if (v <= 0) K.cd.delete(g); else K.cd.set(g, v); }
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead || !(P.atk >= 0)) { pp.tpStruck = null; return; } const hb = ctx.attackBox(); if (!hb) return;
      pp.tpStruck = pp.tpStruck || new Set();   /* ONE SWING, ONE TURN: a long blade (the Death Knight's) stays out past the cooldown - it works a gadget once a swing */
      for (const g of K.gadgets) { if (K.cd.has(g) || pp.tpStruck.has(g) || !STRUCK.has(g.t)) continue;
        if (!ctx.overlap(hb, { l: g.x - 8, r: g.x + 8, t: g.y - 30, b: g.y })) continue; K.cd.set(g, TP.hitCd); pp.tpStruck.add(g); use(g, P); } });
  }
  function use(g, P) {
    g.flash = 0.3;
    if (g.t === 'tppaddle') { if (darkPaddle(g)) { if (!(K.darkSaid > 0)) { K.darkSaid = 4; number(P.x, P.y - 34, 'THE LAMP IS OUT: STRIKE IT, OR LIGHT THE LANTERN'); } return false; } return !!work(lockOf(g.lock), 'hero'); }
    if (g.t === 'tpcapstan') return !!swing(bridgeOf(g.bridge), 'hero');
    if (g.t === 'tpwinch') return !!wind(hoistOf(g.hoist));
    if (g.t === 'tpsluice') return !!sluice(troughOf(g.trough), g);
    if (g.t === 'tpcrane') return !!swingJib(craneOf(g.crane));
    if (g.t === 'tplamp') { const l = K.lamps.find(q => q.x * TS() + 8 === g.x && Math.abs(q.y * TS() - (g.y - TS())) < TS() * 1.5) || K.lamps.find(q => q.x * TS() + 8 === g.x); if (!l) return false; l.lit = !l.lit; K.n.lamps++; ctx.sfx.clank && ctx.sfx.clank(); ctx.burst(g.x, g.y - 22, 6, l.lit ? ['#ffd36b', '#fff2b0'] : ['#5a5048', '#3a3430'], 30, 0.3);
      if (l.lit && once('lamp')) number(g.x, g.y - 44, 'THE LAMP BURNS THE FOG OFF ROUND IT'); if (l.arena && ctx.bossLamp) ctx.bossLamp(l); return true; }
    if (g.t === 'tplantern') { const q = lantern(P); if (q.has) return false; q.has = true; q.lit = true; K.n.lights++; ctx.sfx.pickup ? ctx.sfx.pickup() : ctx.sfx.clank && ctx.sfx.clank();
      number(P.x, P.y - 34, "THE LOCK-KEEPER'S LANTERN: E LIGHTS IT, OR DIMS IT"); return true; }
    if (g.t === 'tpchurch') { K.n.church++; if (ctx.enterLevel && ctx.enterLevel(g.to || K.D.fork.church)) return true; number(g.x, g.y - 40, 'THE LIT CHURCH: THE WAY UP IS NOT OPEN YET'); return true; }
    return false;
  }
  /* E: the nearest gadget in reach; else the lantern (lit <-> dim) */
  H.interact = P => {
    if (!K || !P || P.dead) return false; let best = null, bd = TP.reach;
    for (const g of K.gadgets) { if (g.t === 'tplychgate') continue; if (g.t === 'tplantern' && lantern(P).has) continue; const d = Math.abs(g.x - P.x); if (d < bd && Math.abs(g.y - P.y) < 30) { bd = d; best = g; } }
    const q = lantern(P);
    if (best && darkPaddle(best) && q.has && !q.lit) best = null;   /* (E at the paddle in the dark: your lantern first) */
    if (best) return use(best, P);
    if (!q.has) return false;
    q.lit = !q.lit; if (q.lit) K.n.lights++; else K.n.dims++; ctx.sfx.clank && ctx.sfx.clank();
    if (once(q.lit ? 'lit' : 'dim')) number(P.x, P.y - 34, q.lit ? 'LIT: YOU SEE THE WAY - AND THEY SEE YOU' : 'DIMMED: THE FOG HIDES YOU - AND THE WAY');
    return true;
  };

  /* ---------- ONE FRAME ---------- */
  H.update = dt => {
    if (K) for (const pp of ctx.players) if (pp.chillT > 0) pp.chillT = Math.max(0, pp.chillT - dt);
    if (!K) return; K.clock += dt; const ts = TS(), P0 = ctx.hero();
    stepLocks(dt); stepBridges(dt); strikes(dt);
    /* THE LAST DRY FOOTING is never in a lock: a rung or a sill in a chamber is under the water when it fills (the hand-back would put you in it again) */
    K.safe = K.safe || new Map(); for (const pp of ctx.players) { const n = pp.n || 1; if (!K.safe.has(n) && K.L.START) K.safe.set(n, { x: K.L.START.x * TS() + 8, y: (K.L.START.y + 1) * TS(), L: K.L }); const sf = pp.safe; if (!sf || sf.L !== K.L) { pp.safe = K.safe.get(n); continue; }
      const wet = (K.L.pools || []).some(p => p.tp && sf.x > p.x0 - 14 && sf.x < p.x1 + 14 && sf.y > p.y - 120 && sf.y < (p.bottom ?? p.y + 400) + 8); if (!wet) K.safe.set(n, sf); else if (K.safe.get(n)) pp.safe = K.safe.get(n); }
    /* THE TEACH'S LOW WATER ONLY WETS YOU: wading in a shallow chamber, you are handed back to the bank after a moment (no cost: the mill-pond lock is the soft lesson) */
    for (const pp of ctx.players) { if (pp.dead) continue; const p = (K.L.pools || []).find(q => q.tp && q.shallow && !q.dry && pp.x > q.x0 && pp.x < q.x1 && pp.y > q.y + 6);
      pp.tpWade = p ? (pp.tpWade || 0) + dt : 0; if (pp.tpWade > 1.2 && K.safe.get(pp.n || 1)) { const s = K.safe.get(pp.n || 1); pp.x = s.x; pp.y = s.y; pp.vx = 0; pp.vy = 0; pp.tpWade = 0; ctx.sfx.splash && ctx.sfx.splash(); if (once('wade')) number(pp.x, pp.y - 34, 'YOU WADE OUT TO THE BANK'); } }
    for (const g of K.gadgets) g.flash = Math.max(0, g.flash - dt);
    /* THE LANTERN ON ITS HOOK: walked through the hut (to its hook - no E), it is yours, lit (and said) - every player holds it before the first lock */
    K.darkSaid = Math.max(0, (K.darkSaid || 0) - dt);
    for (const pp of ctx.players) { const q = lantern(pp); if (!q.has && pp.x >= K.D.lantern.x * ts && !pp.dead) { q.has = true; q.lit = true; if (once('lanternPast')) number(pp.x, pp.y - 34, "THE LOCK-KEEPER'S LANTERN: E LIGHTS IT, OR DIMS IT"); } }
    /* A DROWNING: a man under a lock's or a cut's water - a chamber filled over him, a bridge swung from under him - is drowned (the game's own hazardFoe) */
    for (const p of ctx.L.pools || []) { if (!p.tp || p.dry || p.shallow) continue; for (const e of ctx.enemies()) { if (!e.alive || e.noGrav || e.t === 'grindylow' || e.t === 'fogwraith' || e === ctx.boss || !(e.x > p.x0 && e.x < p.x1 && e.y > p.y + 6 && e.y <= (p.bottom ?? p.y + 400) + 8)) continue;
      if (ctx.drown(e)) { K.n.drowned++; if (once('drowned')) number(e.x, p.y - 30, 'THE WATER TAKES HIM'); } } }
    /* THE FIRST LOOK at a thing: a line once (what it is, never the trick) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 70, inF = eyeFog(P0) >= 0.3;
      for (const k of K.locks) if (!k.virtual && !k.race && !k.arena && near((k.x0 + k.x1) / 2 * ts, k.y, 120) && once('lockSeen')) number(P0.x, P0.y - 34, 'A LOCK: ITS PADDLE MOVES THE WATER');
      if (inF && once('fog')) number(P0.x, P0.y - 34, 'IN THE FOG: A WATCHMAN SEES ONLY WHAT IS LIT');
      if (inF) K.wasIn = true; else if (K.wasIn && !(ctx.L.arena && P0.x >= ctx.L.arena.x0) && once('aboveFog')) number(P0.x, P0.y - 34, 'OUT OF THE FOG: CLEAR AIR - AND EVERY EYE SEES YOU');
      if (K.L.examSpans && K.L.examSpans.some(s => P0.x >= s[0] * ts && P0.x < (s[1] + 1) * ts) && once('exam')) number(P0.x, P0.y - 44, 'THE LAST LOCK: DRAINED, ITS IRONS KILL'); }
    /* THE APPROACH (B8): a knight's shape held in the fog's edge - it thins as you come and is gone for good at four columns; the lamps by it gutter */
    if (P0 && !P0.dead) for (const d of K.decor) { if (d.kind !== 'fogKnight' || d.gone) continue; const dc = Math.abs(P0.x - (d.x * ts + 8)) / ts;
      d.a = Math.max(0, Math.min(1, (dc - 4) / 8)); if (dc < 4) { d.gone = true; d.a = 0; for (const l of K.lamps) if (Math.abs(l.x - d.x) < 9) l.gutter = 1.4; ctx.sfx.tell && ctx.sfx.tell(false); } }
    for (const l of K.lamps) if (l.gutter > 0) l.gutter = Math.max(0, l.gutter - dt);
    stall(P0, dt);
  };

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS AND RIDES (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     { x, y (feet px), key: 'atk'|'talk'|null, face, hold } or null (nothing to work here) */
  H.walkHint = P => {
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, row = P.y / ts;
    const at = (x, feetPx, key, face, hold) => ({ x, y: feetPx, key, face: face || 0, hold: !!hold });
    const puntEnd = id => { const m = ctx.movers().find(q => q.towpath === id && q.kind === 'punt'), k = lockOf(id); if (!m || !k) return null; const pd = K.gadgets.find(g => g.t === 'tppaddle' && g.lock === id && g.x >= k.x0 * ts && g.x < (k.x1 + 1) * ts); return { x: pd ? pd.x - 14 : m.x + m.w - 7, y: m.y }; };   /* (on the punt: a step short of its chamber paddle, facing it) */
    const onRide = id => !!(P.onMover && P.onMover.towpath === id);
    const lockStep = (id, bank, bankRow) => { const k = lockOf(id); if (!k) return null; const lv = levelOf(k), pe = puntEnd(id);
      if (onRide(id)) { if (lv === 'hi') return null; if (k.to <= k.hiY + 1) return at(pe.x, pe.y, null, 1, true); return at(pe.x, pe.y, 'atk', 1); }
      if (lv === 'hi' && bank !== null && row <= bankRow + 1.5 && c < k.x0) return at(bank * ts + 8 - 10, (bankRow + 1) * ts, 'atk', 1);   /* high and you below: the bank paddle drains it */
      if (lv === 'down' || lv === 'up') return at(bank !== null ? bank * ts + 8 - 14 : P.x, (bankRow + 1) * ts, null, 1, true);
      if (pe && (lv === 'lo' || lv === 'dry')) return at(pe.x, pe.y, null, 1); return null; };
    const O = K.D.O || 0;
    if (c > 40 && c < 56 && row > 30 + O) return lockStep('A', 46, 37 + O);
    if (c > 94 && c < 100 && row < 35 + O) { const r = lockOf('race'); if (r && !(levelOf(r) === 'lo' || levelOf(r) === 'dry')) return at(98 * ts + 8 - 10, (33 + 1 + O) * ts, r.to <= r.hiY + 1 ? 'atk' : null, 1, r.to > r.hiY + 1); }
    /* THE SACK HOIST: onto its deck at the loft floor, strike the winch beside it, ride; at the top step off */
    if (c > 112 && c < 119.5 && row > 17 + O && row <= 27.4 + O) { const hs = rideState('hoist', 'sack'), h = hoistOf('sack');
      if (onRide('sack')) { if (hs === 'top') return null; if (hs === 'moving') return at(P.x, h.y, null, 1, true); return at(116 * ts + 6, h.y, 'atk', 1); }
      if (row > 19.5 + O) { if (hs === 'bot') return at(116 * ts, h.botY, null, 1); if (hs === 'top') return at(118 * ts + 12, (27 + O) * ts, 'atk', -1); return at(118 * ts + 12, (27 + O) * ts, null, -1, true); } }
    if (c > 125 && c < 132 && row < 20.5 + O) { const b = bridgeOf('tail'); if (b && !b.across) return at(130 * ts + 8 - 10, (18 + 1 + O) * ts, 'atk', 1); }
    if (c > 158 && c < 174 && row > 13 + O) return lockStep('F1', 165, 19 + O);
    if (c > 172 && c < 179 && row > 8 + O && !(row <= 10 + O + 0.2 && c >= 178.5)) { const k = lockOf('F2'), lv = levelOf(k), live = ctx.enemies().some(e => e.alive && e.squad === 'dryChamber'), onLanding = row <= 15 + O + 0.2 && c < 175;
      if (onRide('F2')) return lockStep('F2', null, 14 + O);
      if (onLanding) { if (live && (lv === 'dry' || lv === 'lo')) return at(173 * ts + 8 - 8, (15 + O) * ts, 'atk', 1);
        if (lv === 'up' || lv === 'down') return at(173 * ts, (15 + O) * ts, null, 1, true);
        if (lv === 'hi') return at(173 * ts + 8 - 8, (15 + O) * ts, 'atk', 1); }
      if (lv === 'dry' && !live) { const pe = puntEnd('F2'); return pe ? at(pe.x, pe.y, null, 1) : null; } return null; }
    if (c > 178 && c < 189 && row > 3 + O) return lockStep('F3', 181, 9 + O);   /* (from F2's top landing, 179-182: the landing is F3's bank) */
    /* THE AQUEDUCT: onto the barge, strike the west sluice from its end, ride it over the break */
    if (c > 236 && c < 276 && row < 8.5 + O) { const st = rideState('trough', 'aq'), q = troughOf('aq'), deck = bargeDeck(q);
      if (onRide('aq')) { if (st === 'east') return null; if (st === 'moving') return at(P.x, deck, null, 1, true); return at(241 * ts + 6, deck, 'atk', -1); }
      if (c < 252 && st === 'west') return at(244 * ts, deck, null, 1);
      if (c < 252 && st === 'moving') return at(240 * ts, (6 + O) * ts, null, 1, true); }
    if (c > 325 && c < 347 && row < 21.5 + O) { const b = bridgeOf('basin'); if (b && !b.across) { const cap = c < 336 ? 328 : 344; return at(cap * ts + 8 + (c < 336 ? -10 : 10), (19 + 1 + O) * ts, 'atk', c < 336 ? 1 : -1); } }
    /* THE BASIN CRANE: onto the hook on the quay, strike its capstan, ride up; at the roof step off */
    if (c > 361 && c < 372 && row > 1 + O && row <= 20.4 + O) { const st = rideState('crane', 'jib'), cr = craneOf('jib'), p = hookAt(cr);
      if (onRide('jib')) { if (st === 'roof') return null; if (st === 'moving') return at(P.x, p.y, null, 1, true); return at(365 * ts + 4, p.y, 'atk', -1); }
      if (row > 17 + O) { if (st === 'quay') return at(365 * ts + 10, p.y, null, 1); return at(367 * ts, (20 + O) * ts, null, 1, true); } }
    if (c > 389 && c < 406 && row < 18 + O) { const k = lockOf('X'), lv = levelOf(k), pd = K.gadgets.find(g => g.t === 'tppaddle' && g.lock === 'X');
      if (lv === 'hi' && darkPaddle(pd)) return at(392 * ts + 8 - 10, (17 + O) * ts, 'talk', 1);   /* (in the dark: E lights the lantern) */
      if (lv === 'hi') return at(392 * ts + 8 - 10, (17 + O) * ts, 'atk', 1); if (lv === 'down') return at(392 * ts, (17 + O) * ts, null, 1, true); }
    if (c > 405 && c < 419 && row > 20 + O) return lockStep('Y', 409, 25 + O);
    if (c > 418 && c < 423 && row < 15 + O) { const b = bridgeOf('cut'); if (b && !b.across) return at(422 * ts + 8 - 10, (14 + O) * ts, 'atk', 1); }
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.towpath) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'lock') { const k = lockOf(id); return k ? levelOf(k) : ''; }
    if (kind === 'bridge') { const b = bridgeOf(id); return b ? (b.across ? 'across' : 'open') : ''; }
    if (kind === 'wheel') { const w = K.wheels.find(q => q.id === id); return w ? (w.still ? 'still' : 'turning') : ''; }
    if (kind === 'hoist' || kind === 'trough' || kind === 'crane') return rideState(kind, id);
    if (kind === 'lantern') { const q = lantern(ctx.hero()); return q.has ? (q.lit ? 'lit' : 'dim') : 'none'; }
    if (kind === 'lamp') { const pd = K.gadgets.find(g => g.t === 'tppaddle' && g.lock === id.toUpperCase() && g.dark); return pd ? (darkPaddle(pd) && levelOf(lockOf(pd.lock)) === 'hi' ? 'out' : 'lit') : ''; }   /* (out: dark while the lock still wants its paddle) */
    if (kind === 'squad') return ctx.enemies().some(e => e.alive && e.squad === id) ? 'alive' : 'gone';
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('towpath', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (claude/towpath2art: src/redraw/towpath_gear.js draws every machine, src/redraw/towpath_set.js the set pieces) ---------- */
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), inX = (x, m = 80) => x > cx - m && x < cx + vw + m;
    TPS.drawFront(g, cx, cy, vw, ctx.VH(), K.L, time, { light: (x, y) => lightAt(x, y) });
    /* THE LOCK CHAMBERS: the staff gauge on each gate (the water's float between the two levels), the gates (open: their leaves folded back; shut: the tile's leaf under its balance beam) */
    for (const k of K.locks) { if (!inX(k.x0 * ts, 200)) continue;
      const gx0 = k.gate ? k.gate.x : k.x0 - 1; TPG.drawGauge(g, R(gx0 * ts + 8 - cx), R(k.hiY - cy), R(k.loY - cy), R(k.y - cy), false);
      if (k.gate) TPG.drawGate(g, R(k.gate.x * ts - cx), R(k.gate.top * ts - cy), R((k.gate.bot + 1) * ts - cy), k.gateOpen, time); }
    /* THE AQUEDUCT'S TROUGH: its far wall (the plates sag through the break), its water (running), the fall of it through the break */
    for (const q of K.troughs) { if (!inX(q.stopW * ts, 700)) continue; const bedY = R(q.bedY - cy), x0 = R((q.stopW) * ts - cx), x1 = R((q.stopE + q.w) * ts - cx), b0 = R(252 * ts - cx), b1 = R(274 * ts - cx);
      TPG2.drawTroughPlate(g, x0, x1, bedY, b0, b1, time);
      if (q.water > 0.02) { const wy = R(q.bedY - (q.bedY - q.surfY) * q.water - cy); TPG.drawTroughWater(g, x0, x1, wy, bedY, time, q.water); TPG.drawCascade(g, b0 + 4, bedY + 4, 150, b1 - b0 - 8, time); } }
    /* THE PUNTS, THE HOIST'S DECK, THE BARGE, THE HOOK */
    for (const m of ctx.movers()) { if (!m.towpath || !inX(m.x)) continue; const x = R(m.x - cx), y = R(m.y - cy);
      if (m.kind === 'hoist') { const h = hoistOf(m.towpath); TPG2.drawHoistDeck(g, x, y, m.w, R(h.topY - 98 - cy), time); continue; }
      if (m.kind === 'barge') { const tq = troughOf(m.towpath); TPG.drawBarge(g, x, y, m.w, time, !tq || tq.water < 0.5, lightAt(m.x, m.y) > 0.1); continue; }
      if (m.kind === 'hook') { TPG.drawHook(g, x, y, m.w, time, false); continue; }
      TPG.drawPunt(g, x, y, m.w, time, lightAt(m.x + m.w, m.y) > 0.1); }
    /* THE CRANE: its mast, jib, chain and counterweight over the quay */
    for (const c of K.cranes) { const mx = R(c.mast[0] * ts + 8 - cx), my = R(c.mast[1] * ts - cy), base = R((c.from[1] - 1) * ts - cy), p = hookAt(c);
      if (!inX(c.mast[0] * ts, 300)) continue; TPG.drawCrane(g, mx, my, base, R(c.to[0] * ts + c.w * 8 - cx), my, R(p.x + c.w * 8 - cx), R(p.y - cy), c.w * ts, time); }
    /* THE MILL WHEEL: a breast wheel turning (or still: its stair) */
    for (const w of K.wheels) { if (!inX(w.cx * ts, 200)) continue; TPG.drawWheel(g, R(w.cx * ts + 8 - cx), R(w.cy * ts - cy), w.r * ts, w.a, w.still, time); }
    /* THE SWING BRIDGES: across, the cells are its deck (the tiles draw it); turning or clear, the deck swung on its pivot */
    for (const b of K.bridges) { if (!inX(b.x0 * ts, 200)) continue; TPG.drawBridge(g, R(b.x0 * ts - cx), R(b.row * ts - cy), (b.x1 - b.x0 + 1) * ts, b.k, !!b.arena); }
    /* THE GADGETS: paddles, capstans, winches, sluices, the crane's capstan, lamps, the lantern on its hook, the lychgate, the church door */
    for (const q of K.gadgets) { if (!inX(q.x)) continue; const x = R(q.x - cx), y = R(q.y - cy), fl = q.flash > 0;
      if (q.t === 'tppaddle' && darkPaddle(q)) { g.fillStyle = 'rgba(30,34,38,0.6)'; g.fillRect(x - 2, y - 22, 4, 22); g.fillRect(x - 5, y - 24, 10, 2); continue; }   /* (in the dark: only a post's shape) */
      if (q.t === 'tppaddle') { const k = lockOf(q.lock), mv = !!(k && Math.abs(k.to - k.y) > 0.5); TPG.drawPaddle(g, x, y, fl, mv, time);
        if (k) { const up = k.to < k.y - 0.5, dn = k.to > k.y + 0.5; if (up || dn) ctx.text(up ? 'FILLING' : 'DRAINING', x, y - 34, '#cfe6f0', 'center', 5); } }
      else if (q.t === 'tpcapstan') { const b = bridgeOf(q.bridge); TPG.drawCapstan(g, x, y, fl, time, !!(b && b.k > 0.02 && b.k < 0.98)); }
      else if (q.t === 'tpcrane') { const c = craneOf(q.crane); TPG.drawCraneCapstan(g, x, y, fl, time, !!(c && Math.abs(c.k - c.goal) > 0.01)); }
      else if (q.t === 'tpwinch') { const h = hoistOf(q.hoist); TPG.drawWinch(g, x, y, fl, time, !!(h && Math.abs(h.y - h.to) > 0.5)); }
      else if (q.t === 'tpsluice') { const tq = troughOf(q.trough); TPG.drawSluice(g, x, y, fl, !!(tq && tq.water > 0.5), time); }
      else if (q.t === 'tplamp') { const l = K.lamps.find(z => z.x * ts + 8 === q.x && Math.abs((z.y + 1) * ts - q.y) < ts * 1.5) || K.lamps.find(z => z.x * ts + 8 === q.x), gut = !!(l && l.gutter > 0 && Math.sin(time * 40) > 0); TPG.drawLamp(g, x, y, !!(l && l.lit), gut, time); }
      else if (q.t === 'tplantern') { if (lantern(ctx.hero()).has) continue; TPG.drawHookLantern(g, x, y, time); }
      else if (q.t === 'tplychgate') TPG.drawLychgate(g, x, y, time);
      else if (q.t === 'tpchurch') { TPG.drawChurchDoor(g, x, y, time); if (Math.abs(ctx.hero().x - q.x) < 40 && Math.abs(ctx.hero().y - q.y) < 40) ctx.text('THE LIT CHURCH', x, y - 44, '#ffe9a0', 'center', 5); } }
    /* THE DECOR: milestones, drowned willows, cattle, bollards, eel traps, the gibbet, the keeper's armour, the knight's shape in the fog */
    for (const d of K.decor) { if (!inX(d.x * ts, 120)) continue; TPG.drawDecor(g, d, R(d.x * ts + 8 - cx), R((d.y + 1) * ts - cy), time); }
    /* THE DOZERS: a 'z' over a dozing man; awake, nothing */
    for (const e of ctx.enemies()) { if (!e.alive || !e.tpDoze || e.tpAwake || !inX(e.x)) continue; ctx.text('Z', R(e.x - cx) + 6, R(e.y - cy) - 26 - R((time * 8) % 8), '#c8d8e8', 'center', 6); }
    if (K.glint && K.glint.show) drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), vw, ctx.VH(), time);
  };
  let FOGC = null;
  /* OVER EVERYTHING: THE FOG BANKS (each lies on its water up to its top edge - a rolling, paler edge; the clearings that the lantern and the lamps burn in it),
     the hero's lantern glow */
  H.drawOver = (g, cx, cy, time) => {
    if (!K) return; const vw = ctx.VW(), vh = ctx.VH(), ts = TS(), STEP = 4;
    const cols = []; let any = false;
    for (let sx = 0; sx < vw; sx += STEP) { const wx = cx + sx; let top = null, a = 0;
      for (const b of K.D.banks || []) if (wx >= b.x0 * ts && wx < (b.x1 + 1) * ts) { const e0 = Math.min(1, (wx - b.x0 * ts) / 110, ((b.x1 + 1) * ts - wx) / 110), e = e0 * e0 * (3 - 2 * e0), bt = b.top * ts + (1 - e) * 22; if (top === null || bt < top) top = bt; a = Math.max(a, b.a * e); }   /* (fogknightart2) the bank's ends thin out over ~7 tiles: its alpha climbs from nothing and its top edge sinks, so no wall stands where it stops */
      const at = arenaTop(wx); if (at !== null) { top = top === null ? at : Math.min(top, at); a = Math.max(a, 0.62); }
      const sh = ctx.shroud ? ctx.shroud(wx) : 0; if (sh > 0.02) { top = cy - 40; a = Math.max(a, sh); }
      cols.push(top === null ? null : { top, a }); if (top !== null) any = true; }
    if (any && typeof document !== 'undefined') {
      if (!FOGC || FOGC.width !== vw || FOGC.height !== vh) { FOGC = document.createElement('canvas'); FOGC.width = vw; FOGC.height = vh; }
      const f = FOGC.getContext('2d'); f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, vw, vh);
      /* THE BANK (claude/towpath2art): a pale moonlit skin over a bluer, thicker body that deepens with depth; slow swirls and a dark band drifting inside it; its TOP EDGE a bright
         rolling line with a haze over it - and wisps that lift off the edge and drift (so the edge reads from across a lock) */
      cols.forEach((q, i) => { if (!q) return; const sx = i * STEP, wx = cx + sx, roll = Math.sin(time * 0.6 + wx * 0.05) * 3 + Math.sin(time * 1.1 + wx * 0.11) * 2 + Math.sin(time * 0.35 + wx * 0.017) * 2, ty = R(q.top - cy + roll);
        if (ty >= vh) return; const y0 = Math.max(0, ty), deep = ty + 30, yd = Math.max(0, Math.min(vh, deep));
        f.fillStyle = 'rgba(172,192,204,' + (q.a * 0.6).toFixed(3) + ')'; f.fillRect(sx, y0, STEP, Math.max(0, yd - y0));
        if (deep < vh) { f.fillStyle = 'rgba(88,114,130,' + Math.min(0.95, q.a * 0.95).toFixed(3) + ')'; f.fillRect(sx, Math.max(0, deep), STEP, vh - Math.max(0, deep)); }
        const sw = R(Math.sin(time * 0.5 + wx * 0.03) * 5); f.fillStyle = 'rgba(214,228,236,' + (q.a * 0.2).toFixed(3) + ')'; f.fillRect(sx, ty + 7 + sw, STEP, 6);
        const db = ty + 40 + R(Math.sin(time * 0.3 + wx * 0.02) * 12); f.fillStyle = 'rgba(52,76,92,' + (q.a * 0.32).toFixed(3) + ')'; f.fillRect(sx, db, STEP, 9);
        f.fillStyle = 'rgba(236,244,248,' + Math.min(0.9, q.a * 0.85).toFixed(3) + ')'; f.fillRect(sx, ty - 1, STEP, 2);
        f.fillStyle = 'rgba(214,228,236,' + (q.a * 0.3).toFixed(3) + ')'; f.fillRect(sx, ty - 4, STEP, 3); });
      for (let i = 0; i < 16; i++) { const span = vw + 400, wxw = (i * 211 + time * (5 + (i % 4) * 3)) % 4000, sxp = (((wxw - cx) % span) + span) % span - 200, qi = Math.max(0, Math.min(cols.length - 1, Math.floor(sxp / STEP))), q = cols[qi]; if (!q) continue;
        const ty = R(q.top - cy), lift = (Math.sin(time * 0.4 + i * 2.1) * 0.5 + 0.5) * 9; f.fillStyle = 'rgba(226,238,244,' + (q.a * 0.2).toFixed(3) + ')'; f.beginPath(); f.ellipse(sxp, ty - 2 - lift, 16 + (i % 3) * 7, 3 + (i % 2) * 2, 0, 0, Math.PI * 2); f.fill(); }
      f.globalCompositeOperation = 'destination-out';
      const hole = (x, y, r) => { const gr = f.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,0.95)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = gr; f.beginPath(); f.arc(x, y, r, 0, Math.PI * 2); f.fill(); };
      for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); hole(pp.x - cx, pp.y - 12 - cy, q.has ? (q.lit ? TP.litR : TP.dimR) : TP.dimR); }
      for (const l of K.lamps) if (l.lit) hole(l.x * ts + 8 - cx, l.y * ts - 14 - cy, TP.lampR);
      f.globalCompositeOperation = 'source-over'; g.drawImage(FOGC, 0, 0);
    }
    /* THE CHILL (a fog wraith's touch): frost wisps round the hero for 0.8 s */
    for (const pp of ctx.players) if (!pp.dead && pp.chillT > 0) drawChill(g, R(pp.x - cx), R(pp.y - cy), Math.min(1, pp.chillT / 0.5), time);
    /* THE LANTERN IN HIS HAND: a warm point and its glow (dimmed: an ember) */
    for (const pp of ctx.players) { if (pp.dead) continue; const q = lantern(pp); if (!q.has) continue; const x = R(pp.x - cx + (pp.face || 1) * 6), y = R(pp.y - 10 - cy);
      g.fillStyle = q.lit ? '#ffd36b' : '#7a5a3a'; g.fillRect(x - 1, y - 2, 3, 4); if (q.lit) { g.globalAlpha = 0.18; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } }
  };
  /* THE HUD: the lantern's state, small, under the health (once you carry it) - and whether you stand in the fog or above it */
  H.drawHud = (g) => { if (!K) return false; const q = lantern(ctx.hero()); if (!q.has) return false; const inF = eyeFog(ctx.hero()) >= 0.3;
    ctx.text((q.lit ? 'LANTERN: LIT' : 'LANTERN: DIM') + (inF ? '  IN THE FOG' : '  CLEAR AIR'), 8, ctx.VH() - 14, q.lit ? '#ffd36b' : '#9aa39a', 'left', 5); return false; };
  H.read = () => K && { n: { ...K.n }, locks: K.locks.map(k => ({ id: k.id, lvl: levelOf(k), y: R(k.y), to: R(k.to), gate: k.gateOpen })), bridges: K.bridges.map(b => ({ id: b.id, across: b.across, k: +b.k.toFixed(2) })),
    lamps: K.lamps.map(l => l.lit), wheels: K.wheels.map(w => ({ id: w.id, still: !!w.still })), lantern: [...K.lantern.values()].map(q => ({ ...q })), glint: K.glint && K.glint.key, lastNudge: K.lastNudge || null,
    hoists: K.hoists.map(h => ({ id: h.id, st: rideState('hoist', h.id) })), troughs: K.troughs.map(q => ({ id: q.id, st: rideState('trough', q.id), water: +q.water.toFixed(2) })), cranes: K.cranes.map(c => ({ id: c.id, st: rideState('crane', c.id) })),
    inFog: ctx.hero() ? eyeFog(ctx.hero()) >= 0.3 : null, dozers: ctx.enemies().filter(e => e.alive && e.tpDoze).map(e => ({ x: R(e.x / 16), awake: !!e.tpAwake })) };
  /* the rule's levers for the tools: work a lock, swing a bridge, light the lantern, send a ride - as a hero would */
  H.work = id => (K ? work(lockOf(id), 'hero') : null);
  H.swing = id => (K ? swing(bridgeOf(id), 'hero') : null);
  H.wind = id => (K ? wind(hoistOf(id)) : null);
  H.sluice = (id, west = true) => { if (!K) return null; const q = troughOf(id); return sluice(q, { x: (west ? q.stopW : q.stopE + q.w) * TS() }); };
  H.jib = id => (K ? swingJib(craneOf(id)) : null);
  H.rideState = (kind, id) => (K ? rideState(kind, id) : '');
  H.setLantern = (pp, has, lit) => { if (!K) return; const q = lantern(pp); q.has = has; q.lit = lit; K.lantern.set((pp && pp.n) || 1, q); };
  H.lockLevel = id => (K && lockOf(id) ? levelOf(lockOf(id)) : '');
  H.lock = id => (K ? lockOf(id) : null);
  H.bridge = id => (K ? bridgeOf(id) : null);
  return H;
}
