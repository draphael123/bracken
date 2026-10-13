// src/sealed-pyramid-hands.js - THE SEALED PYRAMID's HANDS (claude/sealedpyramid, the Opus greybox, 2026-10-12). src/sealed-pyramid.js is the level (geometry, the
// traps, the counterweights, the cast); this is THE RULE in the world:
//   THE PLATES   a pale flag in the floor (or a counterweight's top) is PRESSED by a hero's feet or a MUMMY's (heavy: src/mummy.js) - never a scarab's, a jackal's
//                or a flyer's. A press on a READY trap ARMS it: told at once (a click, the word, dust from its slot / a rattle in its dart holes / a rumble in its
//                niche) and it fires TRAP_DELAY s later.
//   THE TRAPS    BLOCK  drops out of its ceiling slot into its reach and crushes what stands there; it lies a beat and is hauled back up (a FILL block stays in its
//                       pit as footing until a respawn; a block that falls on a COUNTERWEIGHT rides it, its weight sending the pair over)
//                DARTS  a volley flies across the reach at body height from its wall's holes for TRAP_DARTS.volley s
//                STONE  drops from its slot (or leaves its niche) and rolls its groove end to end; THE GREAT STONE breaks THE FALSE DOOR at its end
//                What a trap hits: a hero takes a share of his bar (by section: taught cheap, the exam dear - A10: told, never untold), a mummy / jackal / blower /
//                scarab DIES (the tomb kills its own), an ELITE takes a share and is staggered (never killed by it), THE SCARAB MOTHER is OPENED (her hands).
//                Every trap RESETS behind you (its reload is a gauge on its plate). THE STATE IS DRAWN (A3): the plates pale and worn, the reaches scored (the
//                slot's shadow and dust, the dart holes, the groove), the guards' bones, the reload gauge.
//   THE COUNTERWEIGHTS  pairs of stone blocks on one chain: the heavier block goes DOWN and its mate comes UP (a hero 1, a fallen trap block 2); left empty a pair
//                settles home at half the pace (never a soft-lock: the high block comes back down to you)
//   THE STORM    on the face only, on src/desert-rules.js's clock: a told WARN, then a GUST that shoves you back down the steps (hold block to brace)
//   THE MUMMY    its lash YANKS you a step in; its grab HOLDS you and squeezes until you strike it (or it lets go); its linen BURNS long
//   THE SEALED TOMB (four scarab seals, E at its door), the glint and the 10 s nudge on every route need (src/stuck-spots.js STUCK_HANDS.sealedpyramid), the
//   walker's hints (BK.walkHint), and the drawing (PLACEHOLDER shapes until the art pass - readable: every trap, plate and reach is drawn).
// main.js calls: on, reset, update, interact, world, onHit, takeMummy, mover, trapReady, bossHit (the boss hands set it), drawWorld, drawOver, drawStructure,
// drawSeal, read, walkHint, handsState.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import * as ART from './redraw/sealed_pyramid_set.js';
import * as SPB from './redraw/sealed_pyramid_backdrop.js';
import { STUCK_HANDS } from './stuck-spots.js';
import { newStorm, stormStep, gustDrift, STORM } from './desert-rules.js';
import { MUMMY } from './mummy.js';

export const TRAP_DELAY = { block: 0.25, darts: 0.3, stone: 0.25, gas: 0.35, oil: 0.3, flood: 0.4 };   /* (claude/pyramidlevel: the gas hisses, the brazier tips, the sluice groans - each told before it fires) */
export const TRAP_DARTS = { volley: 0.9, every: 0.15 };
export const TRAP_STONE = { v: 170, vGreat: 150, vArena: 320, r: 14, dropT: 0.3 };
export const TRAP_BLOCK = { fallT: 0.28, lie: 0.9, haul: 1.1 };
export const TRAP_SHARE = { teach: 0.24, test: 0.34, exam: 0.5, boss: 0.22 };   /* a hero caught in a reach: a share of his bar (A10 amended: taught cheap, the exam dear; never untold - the click comes first) */
export const TRAP_GAS = { venom: 2.4 };   /* THE EMBALMERS' GAS (claude/pyramidlevel): a hero caught in it carries the caverns' venom a while (as the Burial Caverns' vents do) */
export const TRAP_BORE = { v: 300, w: 20 };   /* THE SLUICE's BORE: the wave front's speed (px/s) and its half-width */
export const TOMB = { crack: 1.0, rise: 0.5 };   /* THE TOMBS: the lid cracks (told) this long before the dead are out; they climb out this long (no blow) */
export const PYS = { eliteShare: 0.3, eliteStagger: 2.4, stormPush: 64, grabSqueeze: 0.5, vaultR: 30, pairHalf: 0.5, linen: 3.2, linenMul: 1.5, linenElite: 1.15 };

export function makeSealedPyramidHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS, T = () => ctx.T;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  const px = x => x * TS() + 8;
  const R = Math.round;
  H.on = () => !!K;
  H.state = () => K;

  /* ---------- RESET: a fresh load builds the traps and pairs; a respawn sets every trap ready, takes the fill blocks out of their pits and keeps a broken door broken ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.sealedpyramid) { K = null; return; }
    const fresh = !K || K.L !== L;
    if (fresh) K = { L, said: {}, clock: 0, broken: {}, vault: (L.vaultDoors || []).map(v => ({ ...v, open: false })), storm: L.sandstorm ? newStorm(L.sandstorm.dirs) : null, gust: 0,
      n: { presses: 0, fired: 0, byFoe: 0, heroHit: 0, killed: 0, eliteHit: 0, bossHit: 0, rides: 0, gusts: 0, braced: 0, grabs: 0, torn: 0, burned: 0, nudges: 0, doorBroken: 0, fills: 0, byTrap: {} },
      fillBase: {} };
    if (fresh) Object.assign(K.n, { tombsOpened: 0, floods: 0, bores: 0, burns: 0, gassed: 0 });
    /* the cells a fill block covers, as built (a respawn's grid still holds the block) */
    if (K.traps) for (const t of K.traps) if (t.def.fill && t.filled) unfill(t);
    K.traps = (L.traps || []).map(d => ({ def: d, id: d.id, kind: d.kind, st: 'ready', t: 0, y: 0, x: 0, volley: 0, pressed: false, hitKeys: new Set(), filled: false, arenaHit: null }));
    for (const t of K.traps) placeHome(t);
    for (const w of (L.falseWalls || [])) if (K.broken[w.id]) breakWall(w, true);
    K.pairs = (L.pairs || []).map(p => ({ ...p, t: 0, want: 0 }));
    K.tombs = (L.tombs || []).map(d => ({ ...d, st: 'shut', t: 0 }));   /* (claude/pyramidlevel) every tomb shut again: its dead wait in it (a respawn puts them back) */
    for (const t of K.traps) if (t.kind === 'flood') floodPool(t);
    K.glint = null; K.stalls = {}; K.stallKey = null; K.fx = []; K.darts = []; K.gust = 0;
    for (const pp of ctx.players) { pp.pyGrab = null; }
    { const arr = ctx.lights ? ctx.lights() : null; if (arr) { for (let i = arr.length - 1; i >= 0; i--) if (arr[i].py) arr.splice(i, 1); for (const lp of (L.lamps || [])) arr.push({ x: lp.x * TS() + 8, y: lp.y * TS() + 2, r: 60, torch: true, bare: true, warm: true, py: true }); } }
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { sealedPyramid: () => K, sealedPyramidHands: () => H, walkHint: () => H.walkHint(ctx.hero()) });
  };
  const trapOf = id => K.traps.find(t => t.id === id);
  const pairOf = id => K.pairs.find(p => p.id === id);
  const moverOf = id => ctx.movers().find(m => m.pyr === id);
  function placeHome(t) { const d = t.def, ts = TS();
    if (t.kind === 'block') { t.x = d.slot[0] * ts; t.y = d.slot[2] * ts; t.w = (d.slot[1] - d.slot[0] + 1) * ts; t.h = (d.slot[3] - d.slot[2] + 1) * ts; t.home = t.y; }
    if (t.kind === 'stone') { t.x = d.home * ts + 16; t.y = (d.drop ? (d.drop[1] + 1) * ts : d.row * ts); t.vis = !d.drop; t.dir = Math.sign(d.end - d.home) || 1; }
    if (t.kind === 'darts') { t.volley = 0; }
    if (t.kind === 'gas') { t.left = 0; }
    if (t.kind === 'oil') { t.front = null; t.left = 0; }
    if (t.kind === 'flood') { t.lvl = 0; t.phase = null; t.bore = null; } }

  /* ---------- THE PLATES ---------- */
  const heavy = e => e.alive && (e.t === 'mummy') && e.cnSkin !== 'tombskel' && !e.noGrav;   /* (claude/pyramidlevel: THE TOMB GUARD is bone - too light to press a plate) */
  const onCells = (b, x0, x1, row) => { const ts = TS(); return b.x > x0 * ts - 1 && b.x < (x1 + 1) * ts + 1 && Math.abs(b.y - row * ts) < 3; };
  function pressedBy(t) {
    const out = [];
    for (const p of t.def.plates) {
      if (p.mover) { const m = moverOf(p.mover); if (!m) continue; for (const pp of ctx.players) if (!pp.dead && pp.onMover === m) out.push({ who: pp, hero: true, ride: !!p.ride, m }); continue; }
      const [x0, x1, row] = p;
      for (const pp of ctx.players) if (!pp.dead && pp.ground && !pp.onMover && onCells(pp, x0, x1, row)) out.push({ who: pp, hero: true });
      for (const e of ctx.enemies()) if (heavy(e) && onCells(e, x0, x1, row)) out.push({ who: e, hero: false });
      /* (claude/pyramidboss) THE TOMB-KING's chamber: HE presses a plate he stands on (stone is heavy - not while he walks: he steps over them), and so does his thrown lid */
      if (ctx.pressers) for (const b of ctx.pressers()) if (onCells(b, x0, x1, row)) out.push({ who: b.who, hero: false, boss: !!b.boss, lid: !!b.lid }); }
    return out; }
  function arm(t, by) {
    const d = t.def, ts = TS(); t.st = 'armed'; t.t = TRAP_DELAY[t.kind]; K.n.presses++; if (!by.hero) K.n.byFoe++; t.byBoss = by.boss ? by.who : null;   /* (claude/pyramidboss) a plate HE stands on fires on him */
    /* THE LAST SHAFT: its counterweight's own plate fires the darts as its rider comes level with them */
    if (by.ride && by.m && t.kind === 'darts') { const top = d.rows[0] * ts + 4; t.t = Math.max(0.2, (top - by.m.y) / Math.max(10, by.m.speed)); }
    const P0 = ctx.hero(); const near = P0 && Math.abs(P0.x - (d.zone[0] + d.zone[1]) * ts / 2) < 300 && Math.abs(P0.y - d.zone[3] * ts) < 160;
    ctx.sfx.click ? ctx.sfx.click() : ctx.sfx.clank && ctx.sfx.clank();
    if (near) { const wx = by.who.x, wy = by.who.y - 24;
      if (!by.hero) number(wx, wy, t.kind === 'block' ? 'HE TREADS THE PLATE: THE BLOCK!' : t.kind === 'darts' ? 'HE TREADS THE PLATE: THE DARTS!' : t.kind === 'gas' ? 'HE TREADS THE PLATE: THE GAS!' : t.kind === 'oil' ? 'HE TREADS THE PLATE: THE FIRE!' : t.kind === 'flood' ? 'HE TREADS THE PLATE: THE SLUICE!' : 'HE TREADS THE PLATE: THE STONE!', '#ff9a5c');
      else number(wx, wy, t.kind === 'block' ? 'CLICK: THE BLOCK FALLS' : t.kind === 'darts' ? 'CLICK: THE DARTS FLY' : t.kind === 'gas' ? 'CLICK: THE GAS HISSES' : t.kind === 'oil' ? 'CLICK: THE BRAZIER TIPS' : t.kind === 'flood' ? 'CLICK: THE SLUICE OPENS' : 'CLICK: THE STONE RUNS', '#ffd36b'); }
    if (t.kind === 'gas' || t.kind === 'flood') ctx.sfx.hiss && ctx.sfx.hiss();
    if (t.kind === 'block') ctx.burst((d.zone[0] + d.zone[1] + 1) / 2 * ts, (d.slot[3] + 1) * ts, 8, ['#d8c8a0', '#a89070'], 40, 0.5);
    if (t.kind === 'stone') ctx.shake(t.def.great ? 4 : 2);
  }

  /* ---------- WHAT A TRAP HITS ---------- */
  const bodyBox = b => ({ l: b.x - (b.w || 12) / 2, r: b.x + (b.w || 12) / 2, t: b.y - (b.h || 16), b: b.y });
  const over = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  function strike(t, box, key, name) {
    let any = false; const d = t.def;
    for (const pp of ctx.players) { if (pp.dead) continue; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!over(box, bodyBox({ x: P.x, y: P.y, w: 12, h: 18 })) || t.hitKeys.has(key + '|p' + ctx.players.indexOf(pp))) return;
        t.hitKeys.add(key + '|p' + ctx.players.indexOf(pp)); const share = TRAP_SHARE[d.section] ?? TRAP_SHARE.test; ctx.damagePlayer(box.l + (box.r - box.l) / 2, 1, { unblockable: true, pct: share, name, noKnock: t.kind === 'block' }); K.n.heroHit++; any = true;
        if (once('heroHit' + d.section)) number(P.x, P.y - 34, 'YOU STOOD IN ITS REACH', '#ff6b6b'); }); }
    for (const e of ctx.enemies()) { if (!e.alive || e.harmless) continue; if (!over(box, bodyBox(e))) continue; if (t.hitKeys.has(key + '|' + (e.xpKey || ctx.enemies().indexOf(e)))) continue;
      t.hitKeys.add(key + '|' + (e.xpKey || ctx.enemies().indexOf(e)));
      if (e.boss) { K.n.bossHit++; if (ctx.bossTrap) ctx.bossTrap(e, t.kind, t); continue; }
      if (e.elite) { const dmg = Math.round((e.maxHp || e.hp) * PYS.eliteShare); ctx.hurtFoe(e, dmg, box.l); e.stagger = Math.max(e.stagger || 0, PYS.eliteStagger); e.pyStagT = PYS.eliteStagger; K.n.eliteHit++; number(e.x, e.y - 30, 'HE TAKES ONLY A SHARE OF IT', '#ffd36b'); any = true; continue; }
      const hp = e.hp; ctx.hurtFoe(e, Math.max(hp + 1, 999), box.l); if (!e.alive) { K.n.killed++; any = true; if (once('killed' + t.id)) number(e.x, e.y - 30, 'THE TOMB KILLS ITS OWN', '#8fd160'); } }
    if (ctx.broodHit) ctx.broodHit(box);
    return any;
  }

  /* ---------- THE TRAPS, A FRAME ---------- */
  function stepTrap(t, dt) {
    const d = t.def, ts = TS();
    const press = pressedBy(t), now = press.length > 0, fresh = now && !t.pressed; t.pressed = now;
    const speedUp = d.arena && ctx.bossPhase && ctx.bossPhase() >= 3 ? 0.6 : 1;
    if (t.st === 'ready') { if (d.tk && ctx.trapLive && !ctx.trapLive(d)) return;   /* (claude/pyramidboss) the burial chamber's traps are inert until THE TOMB-KING's phase two arms them */
      if (fresh) arm(t, press.find(p => p.boss) || press[0]); return; }
    t.t -= dt;
    if (t.st === 'armed') { if (t.t > 0) return; fire(t); return; }
    if (t.kind === 'block') stepBlock(t, dt, speedUp);
    else if (t.kind === 'darts') stepDarts(t, dt, speedUp);
    else if (t.kind === 'stone') stepStone(t, dt, speedUp);
    else if (t.kind === 'gas') stepGas(t, dt);
    else if (t.kind === 'oil') stepOil(t, dt);
    else if (t.kind === 'flood') stepFlood(t, dt);
  }
  function fire(t) { const d = t.def; t.st = 'firing'; t.hitKeys.clear(); K.n.fired++; K.n.byTrap[t.id] = (K.n.byTrap[t.id] || 0) + 1; t.key = t.id + ':' + K.n.fired;
    if (t.byBoss && ctx.bossTrap) { const b = t.byBoss; t.byBoss = null; K.n.bossHit++; ctx.bossTrap(b, t.kind, t, 'plate'); }   /* (claude/pyramidboss) THE PLATE HE STANDS ON FIRES ON HIM - and on you, if you stand in its reach */
    if (t.kind === 'block') { t.vy = 300; t.phase = 'fall'; ctx.sfx.thud && ctx.sfx.thud(); }   /* (it is let go, not dropped: a block from the antechamber's high roof lands inside her stagger) */
    if (t.kind === 'darts') { t.volley = TRAP_DARTS.volley; t.dartT = 0; ctx.sfx.bow ? ctx.sfx.bow() : ctx.sfx.slash && ctx.sfx.slash(); }
    if (t.kind === 'stone') { t.phase = d.drop ? 'drop' : 'roll'; t.vis = true; t.y = d.drop ? (d.drop[0]) * TS() : d.row * TS(); t.vy = 0; ctx.sfx.boom ? ctx.sfx.boom() : ctx.sfx.thud && ctx.sfx.thud(); }
    if (t.kind === 'gas') { t.left = d.gasT; K.n.gassed++; ctx.sfx.hiss && ctx.sfx.hiss(); }
    if (t.kind === 'oil') { t.front = d.chan[0] * TS(); t.left = 0; K.n.burns++; ctx.sfx.throwWhoosh ? ctx.sfx.throwWhoosh() : ctx.sfx.fire && ctx.sfx.fire(); }
    if (t.kind === 'flood') { t.phase = 'rise'; t.left = d.riseT; t.bore = (d.dir > 0 ? d.sluice + 1 : d.sluice) * TS(); K.n.floods++; ctx.shake(3); ctx.sfx.splash ? ctx.sfx.splash() : ctx.sfx.heavy && ctx.sfx.heavy(); }
  }
  /* THE EMBALMERS' GAS (claude/pyramidlevel): a green cloud stands in the reach for gasT s; what stands in it is struck once (a hero a share + the venom, the tomb's foes unmade) */
  function stepGas(t, dt) { const d = t.def, ts = TS();
    if (t.st === 'firing') { t.left -= dt; const box = { l: d.zone[0] * ts, r: (d.zone[1] + 1) * ts, t: d.zone[2] * ts, b: (d.zone[3] + 1) * ts };
      const wasHit = K.n.heroHit; strike(t, box, t.key, 'THE EMBALMERS\' GAS'); if (K.n.heroHit > wasHit) for (const pp of ctx.players) if (!pp.dead && over(box, bodyBox({ x: pp.x, y: pp.y, w: 12, h: 18 }))) pp.venomT = Math.max(pp.venomT || 0, TRAP_GAS.venom);
      if (Math.random() < dt * 30) ctx.burst((d.zone[0] + Math.random() * (d.zone[1] - d.zone[0] + 1)) * ts, (d.zone[3] + 1) * ts - 4, 1, ['#a6e04a', '#6a9a3a'], 26, 0.7);
      if (t.left <= 0) { t.st = 'reset'; t.t = Math.max(0.4, d.reset - d.gasT); ctx.sfx.ratchet && ctx.sfx.ratchet(); } return; }
    if (t.st === 'reset' && t.t <= 0) t.st = 'ready'; }
  /* THE OIL CHANNEL (claude/pyramidlevel): the brazier tips at its head and the fire RUNS the channel at runV, then the whole channel burns burnT s; what stands in the burning stretch is struck once */
  function stepOil(t, dt) { const d = t.def, ts = TS();
    if (t.st === 'firing') { const end = (d.chan[1] + 1) * ts;
      if (t.front < end) { t.front = Math.min(end, t.front + d.runV * dt); if (t.front >= end) t.left = d.burnT; }
      else t.left -= dt;
      strike(t, { l: d.chan[0] * ts, r: t.front, t: d.zone[2] * ts, b: (d.zone[3] + 1) * ts }, t.key, 'THE BURNING OIL');
      for (const e of ctx.enemies()) if (e.alive && e.t === 'mummy' && e.cnSkin !== 'tombskel' && e.x > d.chan[0] * ts && e.x < t.front && e.y > d.zone[2] * ts && e.y <= (d.zone[3] + 1) * ts + 2) e.burn = Math.max(e.burn || 0, e.elite ? 0.4 : PYS.linen);
      if (Math.random() < dt * 40) ctx.burst(d.chan[0] * ts + Math.random() * (t.front - d.chan[0] * ts), (d.zone[3] + 1) * ts - 2, 1, ['#ffd36b', '#ff9a3a', '#e0602c'], 40, 0.5);
      if (t.front >= end && t.left <= 0) { t.st = 'reset'; t.t = Math.max(0.5, d.reset - d.burnT); t.front = null; } return; }
    if (t.st === 'reset' && t.t <= 0) t.st = 'ready'; }
  /* THE SLUICE (claude/pyramidlevel): the BORE runs the crypt's floor from the sluice (what stands in its reach is struck: a hero a share and a shove, the dead drowned), and the
     WATER RISES - low to high in riseT, holds holdT, drains in drainT - then the sluice resets. The pool (L.pools, id) follows the level every frame */
  function stepFlood(t, dt) { const d = t.def, ts = TS();
    if (t.bore !== null) { t.bore += d.dir * TRAP_BORE.v * dt; const x = t.bore, w = TRAP_BORE.w;
      const bl = Math.max(x - w, d.zone[0] * ts), br = Math.min(x + w, (d.zone[1] + 1) * ts); if (br > bl) strike(t, { l: bl, r: br, t: d.zone[2] * ts, b: (d.zone[3] + 1) * ts }, t.key, 'THE BORE');   /* (only inside its reach: the plate by the sluice is clear of it) */
      if (Math.random() < dt * 40) ctx.burst(x, (d.zone[3] + 1) * ts - 4, 1, ['#eefaff', '#9fd0e8'], 60, 0.4);
      if ((d.dir > 0 && x > (d.zone[1] + 1) * ts + w) || (d.dir < 0 && x < d.zone[0] * ts - w)) { t.bore = null; K.n.bores++; } }
    if (t.st !== 'firing') { if (t.st === 'reset' && t.t <= 0) t.st = 'ready'; floodPool(t); return; }
    t.left -= dt;
    if (t.phase === 'rise') { t.lvl = Math.min(1, 1 - Math.max(0, t.left) / d.riseT); if (t.left <= 0) { t.phase = 'hold'; t.left = d.holdT; const P0 = ctx.hero(); if (P0 && once('high' + t.id)) number(P0.x, P0.y - 34, 'THE WATER IS UP: SWIM', '#9fd0e8'); } }
    else if (t.phase === 'hold') { t.lvl = 1; if (t.left <= 0) { t.phase = 'drain'; t.left = d.drainT; ctx.sfx.ratchet && ctx.sfx.ratchet(); } }
    else if (t.phase === 'drain') { t.lvl = Math.max(0, t.left / d.drainT); if (t.left <= 0) { t.lvl = 0; t.phase = null; t.st = 'reset'; t.t = Math.max(0.5, d.reset - d.riseT - d.holdT - d.drainT); } }
    floodPool(t); }
  function floodPool(t) { const d = t.def, ts = TS(), p = (K.L.pools || []).find(q => q.id === d.pool); if (!p) return; const lo = d.low * ts, hi = d.high * ts + 4;
    p.y = lo - (lo - hi) * (t.lvl || 0); p.dry = !(t.lvl > 0.02); }
  H.floodLevel = id => { const t = K && trapOf(id); return t ? t.lvl || 0 : 0; };
  /* THE BLOCK: falls (a beat), lies, is hauled back up into its slot */
  function stepBlock(t, dt, k) {
    const d = t.def, ts = TS();
    if (t.phase === 'fall') {
      const m = d.on ? moverOf(d.on) : null, floor = m ? m.y : (d.land + 1) * ts;
      t.vy += 3000 * dt; t.y += t.vy * dt;
      if (t.y + t.h >= floor) { t.y = floor - t.h; t.phase = 'lie'; t.t = d.on ? d.reset : TRAP_BLOCK.lie; ctx.shake(d.on ? 3 : 4); ctx.sfx.thud && ctx.sfx.thud(); ctx.burst(t.x + t.w / 2, floor, 10, ['#d8c8a0', '#a89070'], 70, 0.6);
        strike(t, { l: d.zone[0] * ts, r: (d.zone[1] + 1) * ts, t: t.y - 2, b: floor + 2 }, t.key, 'THE FALLING BLOCK');
        if (d.fill) { fill(t); t.phase = 'filled'; return; }
        if (d.on) { t.onM = m; if (once('weigh')) number(t.x + t.w / 2, t.y - 20, 'THE WEIGHT OF THE BLOCK TAKES IT DOWN', '#8fd160'); } }
      else strike(t, { l: d.zone[0] * ts, r: (d.zone[1] + 1) * ts, t: t.y, b: t.y + t.h }, t.key, 'THE FALLING BLOCK');
      return; }
    if (t.phase === 'lie') { if (t.onM) t.y = t.onM.y - t.h; if (t.t > 0) return; t.phase = 'haul'; t.onM = null; ctx.sfx.ratchet && ctx.sfx.ratchet(); return; }
    if (t.phase === 'haul') { t.y -= (t.y - t.home + 40) * dt / (TRAP_BLOCK.haul * k); if (t.y <= t.home + 0.5) { t.y = t.home; t.phase = null; t.st = 'reset'; t.t = Math.max(0.2, (d.reset - TRAP_BLOCK.lie - TRAP_BLOCK.haul) * k); } return; }
    if (t.phase === 'filled') return;
    if (t.st === 'reset' && t.t <= 0) { t.st = 'ready'; }
  }
  /* a FILL block lies in its pit as footing: solid cells written where it lies (and given back on a respawn) */
  function fill(t) { const d = t.def; t.filled = true; K.n.fills++; const y1 = d.land, y0 = d.land - 1; K.fillBase[t.id] = [];
    for (let y = y0; y <= y1; y++) for (let x = d.zone[0]; x <= d.zone[1]; x++) { K.fillBase[t.id].push([x, y, ctx.cellGet(x, y)]); ctx.cellSet(x, y, T().SOLID); }
    const P0 = ctx.hero(); if (P0 && once('fill' + t.id)) number(P0.x, P0.y - 34, 'THE BLOCK LIES IN THE PIT: STAND ON IT', '#8fd160');
    for (const pp of ctx.players) if (!pp.dead && pp.x > d.zone[0] * TS() - 6 && pp.x < (d.zone[1] + 1) * TS() + 6 && pp.y > (d.land - 1) * TS() && pp.y < (d.land + 3) * TS()) { pp.y = (d.land - 1) * TS(); pp.vy = 0; } }
  function unfill(t) { for (const [x, y, v] of (K.fillBase[t.id] || [])) ctx.cellSet(x, y, v); t.filled = false; }
  /* THE DARTS: a volley across the reach at body height */
  function stepDarts(t, dt, k) {
    const d = t.def, ts = TS();
    if (t.st === 'firing') { t.volley -= dt; t.dartT -= dt;
      if (t.dartT <= 0) { t.dartT = TRAP_DARTS.every; for (let r = d.rows[0]; r <= d.rows[1]; r++) K.darts.push({ x: d.dir > 0 ? (d.wall + 1) * ts : d.wall * ts, y: r * ts + 6 + (K.n.fired % 2) * 3, dir: d.dir, end: d.dir > 0 ? (d.zone[1] + 1) * ts : d.zone[0] * ts, t: 0.6 }); }
      strike(t, { l: d.zone[0] * ts, r: (d.zone[1] + 1) * ts, t: d.rows[0] * ts, b: (d.rows[1] + 1) * ts }, t.key, 'THE DARTS');
      if (t.volley <= 0) { t.st = 'reset'; t.t = Math.max(0.3, (d.reset - TRAP_DARTS.volley) * k); ctx.sfx.ratchet && ctx.sfx.ratchet(); }
      return; }
    if (t.st === 'reset' && t.t <= 0) t.st = 'ready';
  }
  /* THE STONE: out of its slot (a drop) or its niche, and down its groove; THE GREAT STONE breaks the false door at its end */
  function stepStone(t, dt, k) {
    const d = t.def, ts = TS();
    if (t.st === 'firing') {
      if (t.phase === 'drop') { t.vy += 2200 * dt; t.y += t.vy * dt; if (t.y >= d.row * ts) { t.y = d.row * ts; t.phase = 'roll'; ctx.shake(3); } return; }
      const v = d.arena ? TRAP_STONE.vArena : d.great ? TRAP_STONE.vGreat : TRAP_STONE.v; t.x += t.dir * v * dt; t.spin = (t.spin || 0) + t.dir * v * dt / TRAP_STONE.r;
      const r = d.great ? 18 : TRAP_STONE.r;
      strike(t, { l: t.x - r, r: t.x + r, t: t.y - 2 * r, b: t.y }, t.key, d.great ? 'THE GREAT STONE' : 'THE ROLLING STONE');
      if (Math.random() < dt * 20) ctx.burst(t.x - t.dir * r, t.y - 2, 1, ['#d8c8a0'], 30, 0.4);
      const endX = (d.end + (t.dir > 0 ? 1 : 0)) * ts - t.dir * r;
      if ((endX - t.x) * t.dir <= 0) { t.x = endX;
        if (d.breaks) { const w = (K.L.falseWalls || []).find(q => q.id === d.breaks); if (w && !K.broken[w.id]) breakWall(w, false); }
        ctx.shake(d.great ? 6 : 3); ctx.sfx.boom ? ctx.sfx.boom() : ctx.sfx.crack && ctx.sfx.crack(); ctx.burst(t.x + t.dir * r, t.y - r, 16, ['#d8c8a0', '#a89070', '#7a6650'], 90, 0.8);
        t.vis = false; t.st = 'reset'; t.t = Math.max(0.5, d.reset * k); t.phase = null; }
      return; }
    if (t.st === 'reset' && t.t <= 0) { t.st = 'ready'; placeHome(t); t.vis = !d.drop; }
  }
  function breakWall(w, quiet) { K.broken[w.id] = true; for (let y = w.y0; y <= w.y1; y++) for (let x = w.x0; x <= w.x1; x++) ctx.cellSet(x, y, T().AIR);
    if (!quiet) { K.n.doorBroken++; ctx.shake(7); for (let y = w.y0; y <= w.y1; y += 2) ctx.burst(w.x0 * TS() + 16, y * TS() + 8, 6, ['#e8dcc0', '#b8a078'], 80, 0.7); const P0 = ctx.hero(); if (P0) number(P0.x, P0.y - 40, 'THE GREAT STONE BREAKS THE FALSE DOOR: THE WAY DOWN', '#8fd160'); } }
  H.trapReady = id => { const t = K && trapOf(id); return !!(t && t.st === 'ready'); };
  H.trapState = id => { const t = K && trapOf(id); return t ? t.st : null; };

  /* ---------- THE COUNTERWEIGHTS: main.js hands each mover in a pair to us (m.pyr) ---------- */
  H.mover = (m, dt) => {
    if (!K || !m.pyr) return false; const p = pairOf(m.pair); if (!p) return false;
    if (m.role === 'a') stepPair(p, dt);
    const oy = m.y, ts = TS(), def = m.role === 'a' ? p.a : p.b, home = def[1] * ts, other = def[2] * ts; m.y = home + (other - home) * p.t; m.dy = m.y - oy; m.dx = 0; return true; };
  function stepPair(p, dt) {
    const ms = ctx.movers().filter(m => m.pair === p.id), A = ms.find(m => m.role === 'a'), B = ms.find(m => m.role === 'b'); if (!A || !B) return;
    const w = m => ctx.players.filter(pp => !pp.dead && pp.onMover === m).length + 2 * K.traps.filter(t => t.onM === m && t.phase === 'lie').length;
    const wa = w(A), wb = w(B), downA = Math.sign(p.a[2] - p.a[1]), downB = Math.sign(p.b[2] - p.b[1]);
    let target = p.t, rate = 1;
    if (wa > wb) target = downA > 0 ? 1 : 0; else if (wb > wa) target = downB > 0 ? 1 : 0; else if (wa === 0) { target = 0; rate = PYS.pairHalf; }
    const span = Math.abs(p.a[2] - p.a[1]) * TS(), step = (A.speed || 46) * rate * dt / Math.max(1, span), was = p.t;
    p.t = target > p.t ? Math.min(target, p.t + step) : Math.max(target, p.t - step);
    if (p.t !== was && (wa || wb) && Math.random() < dt * 5) ctx.sfx.stone && ctx.sfx.stone();
    if (was === 0 && p.t > 0 && (wa || wb)) { K.n.rides++; const P0 = ctx.hero(); if (P0 && p.teach && once('ride' + p.id)) number(P0.x, P0.y - 34, 'THE BLOCK SINKS UNDER YOU, AND ITS MATE COMES UP', '#ffd36b'); }
  }

  /* ---------- THE STORM ON THE FACE ---------- */
  function stepStorm(P, dt) {
    const S = K.storm, z = K.L.sandstorm; if (!S || !z) return; const was = K.stormNow ? K.stormNow.phase : 'calm', st = K.stormNow = stormStep(S, dt);
    const on = P && !P.dead && P.x > z.x0 && P.x < z.x1;
    if (!on) return;
    if (st.phase === 'warn' && was !== 'warn') { ctx.sfx.hiss && ctx.sfx.hiss(); number(P.x, P.y - 44, st.dir > 0 ? 'THE STORM  >>' : '<<  THE STORM: BRACE (BLOCK)', '#ffd36b'); }
    if (st.phase === 'gust') { const braced = !!(ctx.keys().block || P.block) && P.ground; if (was !== 'gust') { K.n.gusts++; if (braced) K.n.braced++; }
      const drift = gustDrift({ dir: st.dir, push: st.push * PYS.stormPush / STORM.push }, { braced, grounded: P.ground });
      K.gust += drift * dt; const s = Math.trunc(K.gust); if (s) { K.gust -= s; ctx.moveBody(P, s, 0); } }
  }

  /* ---------- THE MUMMY ---------- */
  H.world = (e, s, w) => { if (e.t !== 'mummy') return; if (e.cnSkin === 'tombskel') { w.burning = 0; return; }   /* (THE TOMB GUARD: dry bone does not catch) */ if (e.burn > 0) { if (!e.pyLit) { e.pyLit = true; e.burn = Math.max(e.burn, PYS.linen); K.n.burned++; if (once('linen')) number(e.x, e.y - 30, 'ITS LINEN BURNS', '#ff9a5c'); } w.burning = e.elite ? 0 : e.burn; } else { e.pyLit = false; w.burning = 0; } };   /* (THE TOMB-WARDEN burns, and takes it half again, but an elite does not flail: he keeps coming) */
  H.onHit = (e, v, landed, P) => { if (e.t !== 'mummy' || !landed || P.dead) return;
    if (v.yank) { ctx.moveBody(P, -Math.sign(P.x - e.x || -v.yank) * MUMMY.yank, 0); }
    if (v.grab) { P.pyGrab = { e, t: MUMMY.hold, tick: PYS.grabSqueeze }; K.n.grabs++; number(P.x, P.y - 30, 'IT HAS YOU: STRIKE IT', '#ff6b6b'); } };
  /* a mummy struck lets go; burning, its linen takes a blow x PYS.linenMul */
  H.takeMummy = (e, dmg) => { for (const pp of ctx.players) if (pp.pyGrab && pp.pyGrab.e === e) { pp.pyGrab = null; K.n.torn++; number(pp.x, pp.y - 30, 'YOU TEAR LOOSE OF ITS GRIP', '#8fd160'); }
    return e.burn > 0 ? dmg * (e.elite ? PYS.linenElite : PYS.linenMul) : dmg; };
  function stepGrabs(dt) { for (const pp of ctx.players) { const g = pp.pyGrab; if (!g) continue; const e = g.e;
      if (pp.dead || !e.alive || (e.st && e.st.mode === 'burning') || (g.t -= dt) <= 0) { pp.pyGrab = null; continue; }
      pp.x += ((e.x + (e.face || 1) * 9) - pp.x) * Math.min(1, dt * 6); pp.vx = 0; if (pp.vy < 0) pp.vy = 0;
      if ((g.tick -= dt) <= 0) { g.tick = PYS.grabSqueeze; ctx.asPlayer(pp, () => ctx.damagePlayer(e.x, MUMMY.dmg.squeeze, { unblockable: true, noKnock: true, who: e, name: 'THE MUMMY\'S GRIP' })); } } }

  /* ---------- THE TOMBS (claude/pyramidlevel): a lid cracks when you come near (told: the crack, the dust, '!'), and its dead get up TOMB.crack s later ----------
     A tomb's dead is a placed ent with tombWait: main.js never spawns it itself (H.waits); the hands spawn it when the lid gives (ctx.spawnEnt), and a respawn shuts every tomb again */
  H.waits = e => !!(e && e.tombWait);
  function stepTombs(P, dt) { if (!K.tombs || !K.tombs.length) return; const ts = TS();
    for (const tb of K.tombs) {
      if (tb.st === 'shut') { if (!P || P.dead) continue; const c = P.x / ts, r = (P.y - 1) / ts;
        if (c >= tb.wake[0] && c <= tb.wake[1] + 1 && Math.abs(r - (tb.row - 1)) <= tb.dy) { tb.st = 'crack'; tb.t = TOMB.crack; ctx.sfx.crack ? ctx.sfx.crack() : ctx.sfx.clank && ctx.sfx.clank();
          ctx.burst(tb.x * ts + 8, (tb.row - 2) * ts, 6, ['#d8c8a0', '#a89070'], 40, 0.6); if (Math.abs(P.x - tb.x * ts) < 260) number(tb.x * ts + 8, (tb.row - 3) * ts, once('crack') ? 'THE LID CRACKS: THE DEAD GET UP' : '!', '#ff9a5c'); }
        continue; }
      if (tb.st === 'crack') { tb.t -= dt; if (Math.random() < dt * 12) ctx.burst(tb.x * ts + 8, (tb.row - 1) * ts, 1, ['#d8c8a0'], 20, 0.4);
        if (tb.t <= 0) { tb.st = 'open'; K.n.tombsOpened++; const k = (K.L.ents || []).findIndex(e => e.tombWait === tb.id); const ent = k >= 0 ? K.L.ents[k] : null;
          const made = ent && ctx.spawnEnt ? ctx.spawnEnt(ent, k) : null;
          if (made) { made.stagger = Math.max(made.stagger || 0, TOMB.rise); made.tombId = tb.id; ctx.burst(made.x, made.y - 8, 10, ['#e8dcc0', '#a89070'], 60, 0.7); }
          ctx.sfx.stone ? ctx.sfx.stone() : ctx.sfx.thud && ctx.sfx.thud(); ctx.shake(2); } } } }
  H.tombState = id => { const tb = K && K.tombs && K.tombs.find(q => q.id === id); return tb ? tb.st : null; };

  /* ---------- THE SEALED TOMB (E) ---------- */
  H.interact = P => {
    if (!K || P.dead) return false; const ts = TS();
    const v = K.vault.find(q => !q.open && Math.abs(q.x * ts + 8 - P.x) <= PYS.vaultR && P.y > q.y0 * ts && P.y <= (q.y1 + 2) * ts);
    if (v) { if (ctx.questGot() >= v.seals) openVault(v); else number(P.x, P.y - 34, 'THE SEALED TOMB WANTS FOUR SCARAB SEALS', '#9aa39a'); return true; }
    return false; };
  function openVault(v) { v.open = true; const ts = TS(); for (let y = v.y0; y <= v.y1; y++) { ctx.cellSet(v.x, y, T().AIR); ctx.burst(v.x * ts + 8, y * ts + 8, 3, ['#d9b36a', '#5a8a4a'], 40, 0.5); } ctx.sfx.gateLift && ctx.sfx.gateLift(); number(v.x * ts, v.y0 * ts - 20, 'THE SEALED TOMB OPENS', '#8fd160'); }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt; const P0 = ctx.hero();
    for (const f of K.fx) f.t -= dt; K.fx = K.fx.filter(f => f.t > 0);
    for (const q of K.darts) { q.x += q.dir * 420 * dt; q.t -= dt; } K.darts = K.darts.filter(q => q.t > 0 && (q.end - q.x) * q.dir > 0);
    for (const t of K.traps) stepTrap(t, dt);
    for (const t of K.traps) if (t.kind === 'flood') floodPool(t);   /* (claude/pyramidlevel) the sluices' water follows its level every frame (a load or a respawn puts L.pools back to its built high mark) */
    stepGrabs(dt);
    stepTombs(P0, dt);
    /* THE DEAD DO NOT FLINCH: a blow staggers a mummy MUMMY.flinch s at most - a parry (the riposte's hold), a broken guard or a trap's weight more */
    for (const e of ctx.enemies()) if (e.alive && e.t === 'mummy' && e.cnSkin !== 'tombskel') { if (e.elite && e.burn > 0.4) e.burn = 0.4;   /* (THE TOMB-WARDEN's wrappings are oiled for the long dark: they smoulder, they do not catch - his exam is the block, not a torch) */
      if (e.pyStagT > 0) e.pyStagT -= dt; else if (e.stagger > MUMMY.flinch && !(e.rpHold > 0) && !(e.broken > 0)) e.stagger = MUMMY.flinch; }
    stepStorm(P0, dt);
    /* THE FIRST LOOK at a thing: a line once (what it is) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 80;
      for (const t of K.traps) { const p = t.def.plates.find(q => Array.isArray(q)); if (!p || t.def.arena) continue; if (near(px(p[0]), p[2] * TS(), 90) && once('look' + t.id)) {
          if (t.id === 'g1block') number(P0.x, P0.y - 34, 'A PALE PLATE: IT DROPS THE BLOCK ON THE GUARD UNDER IT');
          else if (t.id === 'g1darts') number(P0.x, P0.y - 34, 'A PALE PLATE: IT FIRES THE DART WALL ACROSS THE RUN');
          else if (t.id === 'g2stone') number(P0.x, P0.y - 34, 'A PALE PLATE: IT SENDS THE STONE DOWN THE GROOVE');
          else if (t.id === 'great') number(P0.x, P0.y - 34, 'THE PLATE OF THE GREAT STONE: THE FLOOR BELOW IS ITS ROAD');
          else if (t.id === 'pit2') number(P0.x, P0.y - 34, 'A PALE PLATE: ITS BLOCK FALLS INTO THE PIT');
          else if (t.id === 'shaft') number(P0.x, P0.y - 34, 'SPEND THE DARTS FIRST: THEN RIDE UNDER THEM');
          else if (t.id === 'gas1') number(P0.x, P0.y - 34, 'A PALE PLATE: IT OPENS THE GAS JETS UNDER THE GUARD');
          else if (t.id === 'gas3') number(P0.x, P0.y - 34, 'A PALE PLATE: ITS JETS ARE IN THE NICHE OVER YOU');
          else if (t.id === 'oil1') number(P0.x, P0.y - 34, 'A PALE PLATE: IT TIPS THE BRAZIER INTO THE CHANNEL');
          else if (t.id === 'oil3') number(P0.x, P0.y - 34, 'A PALE PLATE: THE BURNING OIL POURS ON THE FLOOR BELOW');
          else if (t.id === 'flood1') number(P0.x, P0.y - 34, 'A PALE PLATE: IT OPENS THE SLUICE - STAND CLEAR OF THE BORE');
          else if (t.id === 'flood2') number(P0.x, P0.y - 34, 'THE CRYPT SLUICE: THE WATER IS THE WAY UP'); } } }
    stall(P0, dt);
  };

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     { x, y, key: 'talk'|null, face, r?, wait? } in world px, or null (nothing to work here) */
  H.walkHint = P => {
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, feet = Math.floor((P.y - 1) / ts);
    const here = (x, row, key, face, extra) => Object.assign({ x: x * ts + 8, y: (row + 1) * ts, key, face: face || 0 }, extra || {});
    const S = K.L.spots || {}, at = (k, key, extra) => here(S[k][0] + 0.5, S[k][1], key || null, 1, extra);
    if (S.hole && c > 44 && c < 76 && feet <= S.hole[1]) return at('hole', null, { r: 30 });                                       /* the robbers' hole */
    const p1 = pairOf('cw1'); if (p1 && S.cw1 && c > 166 && c < 182 && feet <= S.cw1[1]) return at('cw1', null, { r: 20, wait: true });   /* ride the first block down */
    const p2 = pairOf('cw2'); if (p2 && S.weigh && c > 185 && c < 216 && feet > S.cw1[1] + 1) return at('weigh', null, { r: 32, wait: true });   /* stand on the pale block and wait to go up */
    if (!K.broken.falsedoor && S.great && c > 249 && c < 306 && feet <= S.great[1]) return at('great', null, { r: 70, wait: true });   /* the great stone's plate */
    const p2t = trapOf('pit2'); if (p2t && !p2t.filled && S.pit2 && c > 347 && c < 358 && feet >= S.pit2[1] - 6) return at('pit2', null, { r: 12, wait: true });
    const sh = trapOf('shaft'), p3 = pairOf('cw3');
    if (sh && p3 && S.shaftPlate && c > 429 && c < 442 && feet <= S.shaftPlate[1] && feet >= S.shaftPlate[1] - 5) { if (sh.st === 'ready' && p3.t < 0.05) return at('shaftPlate', null, { r: 14 });
      return at('shaftRide', null, { r: 14, wait: true }); }
    /* (claude/pyramidlevel) THE SLUICES: on the floor of the cistern / the crypt, tread the plate, then wait on the water and swim up when it is high */
    for (const [id, x0, x1, top] of [['flood1', 863, 878, 41], ['flood2', 885, 950, 30]]) { const ft = trapOf(id); if (!ft || !S[id] || c < x0 || c > x1 + 1 || feet < top) continue;
      if (ft.st === 'ready' && !(ft.lvl > 0.05)) return at(id, null, { r: x1 - x0 + 4 });   /* (the whole floor: the plate is the way on from anywhere on it) */
      if ((ft.lvl || 0) < 0.9 && ft.st !== 'reset') return at(id, null, { r: x1 - x0 + 4, wait: true, hold: true });
      return null; }
    /* THE KING'S STAIR: on the plate-course, wait out the volley before the last run */
    const sd = trapOf('stairDarts'); if (sd && S.stairPlate && c > 984 && c < 988 && Math.abs(feet - S.stairPlate[1]) <= 1 && sd.st !== 'ready' && sd.st !== 'reset') return at('stairPlate', null, { r: 12, wait: true, hold: true });
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.sealedpyramid) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'cw') { const p = pairOf(id); return p ? (p.t < 0.02 ? 'home' : p.t > 0.98 ? 'over' : 'moving') : ''; }
    if (kind === 'wall') return K.broken[id] ? 'open' : 'shut';
    if (kind === 'pit') { const t = trapOf(id); return t ? (t.filled ? 'filled' : 'open') : ''; }
    if (kind === 'trap') { const t = trapOf(id); return t ? (t.st === 'ready' ? 'ready' : 'spent') : ''; }
    if (kind === 'flood') { const t = trapOf(id); return t ? (t.lvl > 0.9 ? 'high' : t.lvl > 0.02 ? 'moving' : 'dry') : ''; }
    if (kind === 'tomb') { const tb = K.tombs && K.tombs.find(q => q.id === id); return tb ? tb.st : ''; }
    if (kind === 'vault') { const v = K.vault.find(q => q.id === id); return v ? (v.open ? 'open' : ctx.questGot() >= v.seals ? 'due' : 'shut') : ''; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('sealedpyramid', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (claude/spart: the art pass - src/redraw/sealed_pyramid_set.js draws every piece, src/redraw/sealed_pyramid_backdrop.js the rooms; the LOGIC above is untouched) ---------- */
  const COL = { stone: '#b89c6c', stoneL: '#e0c890', stoneD: '#6e5a3c', ink: '#1c140c', red: '#ff6b6b', gold: '#d8aa40', goldL: '#f6dc80', scarabL: '#7ad08a' };
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  /* THE FOOTING KINDS (L.structures 'py*', main.js drawStructures): a carved corbel under a shelf; the robbers' walk on its posts */
  H.drawStructure = (g, kind, l, r, t, b) => {
    if (kind === 'pyShelf' || kind === 'pyCornice' || kind === 'pyLedge') { for (const x of [l + 1, r - 7]) ART.corbel(g, x, t); return true; }   /* (a carved bracket keyed into the wall behind: no post to the floor - the wall carries it) */
    if (kind === 'pyWalk') { for (let x = l + 24; x < r - 8; x += 12 * 16) ART.walkPost(g, x, t, b); return true; }
    return false; };
  /* THE TOMB'S ROOMS (L.interiors 'py*'): the back wall, its friezes, pilasters and THE SEAL (the landmark) - src/redraw/sealed_pyramid_backdrop.js */
  H.drawRoom = (g, st, sx, sy, w, h, x0, y0, time) => SPB.drawRoom(g, st, sx, sy, w, h, x0, y0, time);
  /* a SCARAB SEAL (stray kind 'scarabseal'): a green-glazed scarab on a gold disc, a teal breath round it */
  H.drawSeal = (g, x, y, time) => { const bob = Math.sin(time * 3 + x) * 2, cx0 = R(x), cy0 = R(y - 10 + bob);
    g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 5); g.fillStyle = '#7affd8'; g.beginPath(); g.arc(cx0, cy0, 10, 0, 7); g.fill(); g.globalAlpha = 1; g.drawImage(ART.ART.sealIcon(), cx0 - 8, cy0 - 8); };
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), vh = ctx.VH(), L = K.L;
    const vis = (x0, x1) => x1 * ts - cx > -64 && x0 * ts - cx < vw + 64;
    /* THE DECOR: bones in the reaches, the groove, the sarcophagi, the false king, the mural, her reliefs, her eggs, the jars, the wheels, the capstone, the pits, the false door */
    for (const d of (L.decor || [])) { const a = d.x0 ?? d.x, b = d.x1 ?? d.x; if (!vis(a, b + 1)) continue; const X = a * ts - cx, Y = (d.y ?? 0) * ts - cy;
      if (d.kind === 'storm') { if (!K.stormNow) continue; const st = K.stormNow; if (st.phase === 'calm') continue; const gust = st.phase === 'gust', n = gust ? 70 : 28;
        for (let i = 0; i < n; i++) { const sx = ((i * 97 + time * (gust ? 520 : 260) * st.dir) % vw + vw) % vw, sy = (i * 53 + (i * i) % 17) % vh, len = (gust ? 10 : 6) + (i % 4) * 3; g.globalAlpha = gust ? 0.55 : 0.2; g.fillStyle = i % 3 ? '#e8c488' : '#f6e0b0'; g.fillRect(R(sx), R(sy), len, 1); }
        g.globalAlpha = gust ? 0.22 : 0.08; g.fillStyle = '#d8a860'; g.fillRect(0, 0, vw, vh); g.globalAlpha = 1; continue; }
      ART.decor(g, d, X, Y, a, b, time, K, ctx, cx, cy, vw, vh); }
    /* THE LAMPS: bronze braziers on carved brackets */
    for (const lp of (L.lamps || [])) { const x = lp.x * ts + 8 - cx, y = lp.y * ts - cy; if (x < -30 || x > vw + 30) continue; ART.lamp(g, x, y + 6, time); }
    /* THE TRAPS: plates (and their reload), the slot and the block in it (the reach scored), the dart holes, the stone */
    for (const t of K.traps) { const d = t.def; if (!vis(d.zone[0] - 4, d.zone[1] + 4)) continue;
      const reload = t.st === 'armed' ? 1 : t.st === 'reset' ? Math.max(0, 1 - t.t / Math.max(0.5, t.def.reset)) : 0;
      const drawPl = (p, inner) => { const x = p[0] * ts - cx, y = p[2] * ts - cy, w = (p[1] - p[0] + 1) * ts; ART.plate(g, x, y, w, inner ? 'ready' : t.st === 'ready' ? 'ready' : t.st === 'armed' ? 'armed' : 'reset', time, reload); };
      for (const p of d.plates) if (Array.isArray(p)) drawPl(p, false);
      for (const p of (d.inner || [])) drawPl(p, true);
      if (t.kind === 'block') { const x = t.x - cx, y = t.y - cy, sx = d.slot[0] * ts - cx, sy = d.slot[2] * ts - cy;
        ART.slot(g, sx, sy, (d.slot[1] - d.slot[0] + 1) * ts, (d.slot[3] - d.slot[2] + 1) * ts);
        if (t.st === 'ready' || t.st === 'armed') { const fy = (d.on ? (moverOf(d.on) || { y: d.zone[3] * ts }).y : (d.land + 1) * ts) - cy; ART.scoreBlock(g, d.zone[0] * ts - cx, (d.zone[1] + 1) * ts - cx, fy, time); }   /* the slot's dust and the worn floor under it */
        if (t.st !== 'firing' || t.phase === 'haul') { const top = d.slot[2] * ts - cy - 6; ART.chain(g, x + 6, top, y + 3); ART.chain(g, x + t.w - 8, top, y + 3); }
        ART.block(g, x, y, t.w, t.h, t.st); }
      if (t.kind === 'darts') { const wx = (d.dir > 0 ? (d.wall + 1) * ts : d.wall * ts) - cx; ART.scoreDarts(g, d.zone[0] * ts - cx, (d.zone[1] + 1) * ts - cx, (d.zone[3] + 1) * ts - cy);
        if (t.st === 'armed') ART.dartWall(g, wx, d.rows[0] * ts - cy, (d.rows[1] + 1) * ts - cy, d.dir, true, time); }
      if (t.kind === 'stone' && t.vis) { const r = d.great ? 18 : TRAP_STONE.r; ART.stone(g, t.x - cx, t.y - cy - r, r, t.spin || 0, !!d.great, t.st === 'armed', time);
        if (t.st === 'armed') ctx.text('!!', R(t.x - cx), R(t.y - cy - r * 2 - 8), COL.red, 'center', 6); }
      if (t.kind === 'stone' && !t.vis && d.drop && t.st !== 'firing') { const x = d.home * ts + 16 - cx, y = (d.drop[1] + 1) * ts - cy; rect(g, x - 14, y - 4, 28, 4, COL.stoneD); rect(g, x - 14, y - 4, 28, 1, COL.stone); }
    }
    drawTombHalf(g, cx, cy, time, vis);
    for (const q of K.darts) ART.dart(g, R(q.x - cx), R(q.y - cy), q.dir);
    /* THE COUNTERWEIGHTS: a stone block under each mover's top, its chains up to the wheel; a pale top where it is a plate */
    for (const m of ctx.movers()) { if (!m.pyr) continue; const x = m.x - cx, y = m.y - cy; if (x < -60 || x > vw + 60) continue;
      const wy = (m.wheel ? m.wheel[1] * ts : m.top - 120) - cy; ART.chain(g, R(x) + 5, wy, y + 2); ART.chain(g, R(x) + 25, wy, y + 2);
      ART.counterweight(g, x, y, m.plate);
      if (m.plate) { const t = K.traps.find(q => q.def.plates.some(p => p.mover === m.pyr)); if (t && t.st !== 'ready') ART.ART.gauge(g, x, y + 2, 32, t.st, t.st === 'armed' ? 1 : Math.max(0, 1 - t.t / Math.max(0.5, t.def.reset)), time); } }
    /* THE SEALED TOMB's door: four seal sockets (the ones carried, lit) */
    for (const v of K.vault) { if (v.open) continue; const x = v.x * ts - cx, y = v.y0 * ts - cy; if (x < -40 || x > vw + 40) continue; ART.vault(g, R(x), R(y), (v.y1 - v.y0 + 1) * ts, v.seals, ctx.questGot(), time); }
    /* THE FACE's storm told on the hero: the arrow while it warns */
    const P0 = ctx.hero(); if (K.stormNow && K.stormNow.phase === 'warn' && P0 && L.sandstorm && P0.x < L.sandstorm.x1) ctx.text(K.stormNow.dir > 0 ? '>>' : '<<', R(P0.x - cx), R(P0.y - cy - 30), '#ffd36b', 'center', 6);
  };
  /* ---------- THE SECOND HALF, DRAWN (claude/pyramidlevel: PLACEHOLDER shapes, readable - lane C draws the kit): the gas jets and their cloud, the oil channels, their
     braziers and the running fire, the sluices and the bore, the tombs and their lids, the burial chamber's fittings ---------- */
  function drawTombHalf(g, cx, cy, time, vis) { const ts = TS(), L = K.L;
    for (const t of K.traps) { const d = t.def; if (!['gas', 'oil', 'flood'].includes(t.kind) || !vis(d.zone[0] - 6, d.zone[1] + 6)) continue;
      if (t.kind === 'gas') { const jr = (d.jetRow ?? d.zone[3] + 1) * ts - cy;
        for (const j of d.jets || []) { const x = j * ts - cx; rect(g, x + 2, jr - 2, 12, 3, '#1c1a16'); for (let k = 0; k < 4; k++) rect(g, x + 3 + k * 3, jr - 2, 1, 3, '#5a6a3a');
          if (t.st === 'armed') { g.globalAlpha = 0.6; for (let k = 0; k < 3; k++) rect(g, x + 4 + k * 3, jr - 6 - ((time * 30 + k * 5) % 8), 2, 2, '#a6e04a'); g.globalAlpha = 1; } }
        if (t.st === 'firing') { const a = Math.max(0, Math.min(1, t.left / 0.4, (d.gasT - t.left) / 0.3)); const x = d.zone[0] * ts - cx, y = d.zone[2] * ts - cy, w = (d.zone[1] - d.zone[0] + 1) * ts, h = (d.zone[3] - d.zone[2] + 1) * ts;
          g.globalAlpha = 0.42 * a; g.fillStyle = '#7ab83a'; g.fillRect(R(x), R(y), R(w), R(h)); g.globalAlpha = 0.3 * a; g.fillStyle = '#c8f070';
          for (let k = 0; k < w / 10; k++) { const bx = x + ((k * 37 + time * 14) % w), by = y + h * 0.5 + Math.sin(time * 2 + k) * h * 0.35; g.beginPath(); g.arc(R(bx), R(by), 6 + (k % 3) * 2, 0, 7); g.fill(); } g.globalAlpha = 1;
          ctx.text('GAS', R(x + w / 2), R(y - 6), '#a6e04a', 'center', 4); } }
      if (t.kind === 'oil') { const fy = (d.zone[3] + 1) * ts - cy, x0 = d.chan[0] * ts - cx, x1 = (d.chan[1] + 1) * ts - cx;
        rect(g, x0, fy - 2, x1 - x0, 3, '#141008'); g.globalAlpha = 0.5; for (let x = x0 + 3; x < x1; x += 7) rect(g, x, fy - 2, 3, 1, '#5a4a7a'); g.globalAlpha = 1;   /* the channel: a black sheen cut in the floor */
        if (d.pour) { const px0 = d.pour[0] * ts - cx, px1 = (d.pour[1] + 1) * ts - cx, py = d.pour[2] * ts - cy; rect(g, px0, py - 2, px1 - px0, 2, '#141008'); }
        const hx = d.head * ts - cx + 8, hy = (d.pour ? d.pour[2] : d.zone[3] + 1) * ts - cy, tip = t.st === 'armed' || t.st === 'firing';   /* THE BRAZIER at the head: tipped while it fires */
        rect(g, hx - 1, hy - 12, 2, 12, '#6a5030'); g.save(); g.translate(R(hx), R(hy - 12)); g.rotate(tip ? 0.7 : 0); rect(g, -6, -5, 12, 5, '#b0743a'); rect(g, -6, -5, 12, 1, '#e8a868');
        g.globalAlpha = 0.8 + 0.2 * Math.sin(time * 12); rect(g, -4, -9, 8, 4, '#ff9a3a'); rect(g, -2, -12, 4, 3, '#ffd36b'); g.globalAlpha = 1; g.restore();
        if (t.st === 'firing' && t.front !== null) { const xe = t.front - cx; for (let x = x0; x < xe; x += 4) { const hgt = 8 + 6 * Math.abs(Math.sin(time * 9 + x * 0.3)); rect(g, x, fy - 2 - hgt, 4, hgt, '#e0602c'); rect(g, x + 1, fy - 2 - hgt * 0.7, 2, hgt * 0.7, '#ffd36b'); }
          if (d.pour) { const pxe = (d.pour[1] + 1) * ts - cx, py = d.pour[2] * ts - cy; for (let x = d.pour[0] * ts - cx; x < pxe; x += 5) rect(g, x, py - 6 - 3 * Math.abs(Math.sin(time * 10 + x)), 4, 5, '#ff9a3a'); g.globalAlpha = 0.8; rect(g, pxe, py, 6, fy - py, '#ff9a3a'); g.globalAlpha = 1; } } }
      if (t.kind === 'flood') { const sx = (d.dir > 0 ? d.sluice + 1 : d.sluice) * ts - cx, sy0 = (d.zone[2] - 1) * ts - cy, sy1 = (d.zone[3] + 1) * ts - cy;   /* THE SLUICE: a bronze grille in the wall */
        rect(g, sx - (d.dir > 0 ? 6 : 0), sy0, 6, sy1 - sy0, '#3a2e20'); for (let y = sy0 + 2; y < sy1; y += 4) rect(g, sx - (d.dir > 0 ? 6 : 0), y, 6, 1, t.st === 'ready' ? '#b0743a' : '#9fd0e8');
        if (t.bore !== null) { const bx = t.bore - cx; g.globalAlpha = 0.75; rect(g, bx - TRAP_BORE.w, sy1 - 22, TRAP_BORE.w * 2, 22, '#9fd0e8'); rect(g, bx - TRAP_BORE.w, sy1 - 24, TRAP_BORE.w * 2, 3, '#eefaff'); g.globalAlpha = 1; ctx.text('THE BORE', R(bx), R(sy1 - 30), '#eefaff', 'center', 4); }
        if (t.st !== 'ready') { const gx = sx + (d.dir > 0 ? 4 : -36), gy = sy0 - 10, k = t.lvl || 0; rect(g, gx, gy, 32, 4, '#1c140c'); rect(g, gx, gy, R(32 * k), 4, '#9fd0e8'); } } }   /* its gauge: the water's height */
    /* THE TOMBS: a lidded niche; the lid cracks (told), then lies open */
    for (const tb of (K.tombs || [])) { if (!vis(tb.x - 2, tb.x + 3)) continue; const x = tb.x * ts - cx - 6, y = (tb.row - 3) * ts - cy, w = 28, h = 3 * ts;
      rect(g, x - 2, y - 4, w + 4, 4, '#8a7450'); rect(g, x, y, w, h, '#120c08');
      if (tb.st === 'shut' || tb.st === 'crack') { const sh = tb.st === 'crack' ? Math.sin(time * 60) * 1.2 : 0; rect(g, x + 1 + sh, y + 1, w - 2, h - 1, tb.kind === 'skel' ? '#c8bc9c' : '#b89c6c'); rect(g, x + 1 + sh, y + 1, w - 2, 1, '#e8dcc0');
        rect(g, x + w / 2 - 4 + sh, y + 8, 8, 10, tb.kind === 'skel' ? '#8a8270' : '#d8aa40');   /* the lid's carving: a gilt face (a mummy's) or a bone ankh (a guard's) */
        if (tb.st === 'crack') { for (let k = 0; k < 4; k++) rect(g, x + 4 + k * 6, y + 4 + (k % 2) * 12, 1, 14, '#1c140c'); ctx.text('!', R(x + w / 2), R(y - 12), '#ffd36b', 'center', 6); } }
      else { rect(g, x - 6, y + h - 4, w + 6, 4, '#8a7450'); } }
    /* THE BURIAL CHAMBER'S FITTINGS (lane B's arena slot, placeholders), the robbers' callback */
    for (const d of (L.decor || [])) { const a = d.x0 ?? d.x, b = d.x1 ?? d.x; if (!vis(a - 2, b + 3)) continue; const X = a * ts - cx, Y = (d.y ?? 0) * ts - cy;
      if (d.kind === 'chains') { rect(g, X + 4, Y - 13 * ts, 1, 13 * ts, '#6a6a6a'); rect(g, (b + 1) * ts - cx - 5, Y - 13 * ts, 1, 13 * ts, '#6a6a6a'); }
      else if (d.kind === 'switchmount') { rect(g, X, Y, 16, 16, '#3a2e20'); rect(g, X + 6, Y - 10, 4, 14, '#b0743a'); rect(g, X + 4, Y - 12, 8, 4, '#d8aa40'); }
      else if (d.kind === 'paleplate') { rect(g, X, Y - 2, (b - a + 1) * ts, 2, '#efe3c0'); }
      else if (d.kind === 'ceilslot') { rect(g, X, Y, (b - a + 1) * ts, 2 * ts, '#0c0806'); rect(g, X + 2, Y + 2 * ts - 6, (b - a + 1) * ts - 4, 6, '#6e5a3c'); }
      else if (d.kind === 'greatsarcophagus') { rect(g, X - 18, Y - 14, 52, 30, '#6e5a3c'); rect(g, X - 20, Y - 18, 56, 6, '#b89c6c'); rect(g, X - 2, Y - 12, 20, 14, '#d8aa40'); rect(g, X + 4, Y - 8, 3, 3, '#1c140c'); rect(g, X + 10, Y - 8, 3, 3, '#1c140c'); }
      else if (d.kind === 'robbers') { rect(g, X - 10, Y + 10, 20, 4, '#e8dcc0'); rect(g, X - 4, Y + 6, 6, 4, '#e8dcc0'); rect(g, X + 6, Y + 4, 6, 10, '#c8a060'); rect(g, X + 7, Y + 6, 4, 2, '#5a3a1a'); rect(g, X + 14, Y + 8, 4, 6, '#b0743a'); } } }

  /* the route glint and a held hero's grip, over everything: the mummy's bandages wound round him and the word */
  H.drawOver = (g, cx, cy, time) => { if (!K) return;
    for (const pp of ctx.players) if (pp.pyGrab) { const x = R(pp.x - cx), y = R(pp.y - cy); for (let k = 0; k < 4; k++) { g.fillStyle = k & 1 ? '#a08e66' : '#f0e6c4'; g.fillRect(x - 8, y - 14 + k * 3, 16, 1); } g.fillStyle = '#d6c8a0'; g.fillRect(x - 10, y - 12, 3, 4); g.fillRect(x + 7, y - 6, 3, 4); g.fillStyle = '#150e08'; g.fillRect(x - 10, y - 9, 3, 1); g.fillRect(x + 7, y - 3, 3, 1); ctx.text('STRIKE IT', x, y - 30, '#ff6b6b', 'center', 4); }
    if (K.glint && K.glint.show) drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), ctx.VW(), ctx.VH(), time); };
  H.read = () => K && { n: JSON.parse(JSON.stringify(K.n)), traps: K.traps.map(t => ({ id: t.id, st: t.st, filled: t.filled })), pairs: K.pairs.map(p => ({ id: p.id, t: +p.t.toFixed(2) })), broken: { ...K.broken }, vault: K.vault.map(v => ({ id: v.id, open: v.open })), storm: K.stormNow ? K.stormNow.phase : null, tombs: (K.tombs || []).map(q => ({ id: q.id, st: q.st })), floods: K.traps.filter(t => t.kind === 'flood').map(t => ({ id: t.id, lvl: +(t.lvl || 0).toFixed(2), st: t.st })) };
  return H;
}
