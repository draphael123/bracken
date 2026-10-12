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
import { STUCK_HANDS } from './stuck-spots.js';
import { newStorm, stormStep, gustDrift, STORM } from './desert-rules.js';
import { MUMMY } from './mummy.js';

export const TRAP_DELAY = { block: 0.25, darts: 0.3, stone: 0.25 };
export const TRAP_DARTS = { volley: 0.9, every: 0.15 };
export const TRAP_STONE = { v: 170, vGreat: 150, vArena: 320, r: 14, dropT: 0.3 };
export const TRAP_BLOCK = { fallT: 0.28, lie: 0.9, haul: 1.1 };
export const TRAP_SHARE = { teach: 0.24, test: 0.34, exam: 0.5, boss: 0.22 };   /* a hero caught in a reach: a share of his bar (A10 amended: taught cheap, the exam dear; never untold - the click comes first) */
export const PYS = { eliteShare: 0.3, eliteStagger: 2.4, stormPush: 64, grabSqueeze: 0.5, vaultR: 30, pairHalf: 0.5, linen: 3.2, linenMul: 1.5 };

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
    /* the cells a fill block covers, as built (a respawn's grid still holds the block) */
    if (K.traps) for (const t of K.traps) if (t.def.fill && t.filled) unfill(t);
    K.traps = (L.traps || []).map(d => ({ def: d, id: d.id, kind: d.kind, st: 'ready', t: 0, y: 0, x: 0, volley: 0, pressed: false, hitKeys: new Set(), filled: false, arenaHit: null }));
    for (const t of K.traps) placeHome(t);
    for (const w of (L.falseWalls || [])) if (K.broken[w.id]) breakWall(w, true);
    K.pairs = (L.pairs || []).map(p => ({ ...p, t: 0, want: 0 }));
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
    if (t.kind === 'darts') { t.volley = 0; } }

  /* ---------- THE PLATES ---------- */
  const heavy = e => e.alive && (e.t === 'mummy') && !e.noGrav;
  const onCells = (b, x0, x1, row) => { const ts = TS(); return b.x > x0 * ts - 1 && b.x < (x1 + 1) * ts + 1 && Math.abs(b.y - row * ts) < 3; };
  function pressedBy(t) {
    const out = [];
    for (const p of t.def.plates) {
      if (p.mover) { const m = moverOf(p.mover); if (!m) continue; for (const pp of ctx.players) if (!pp.dead && pp.onMover === m) out.push({ who: pp, hero: true, ride: !!p.ride, m }); continue; }
      const [x0, x1, row] = p;
      for (const pp of ctx.players) if (!pp.dead && pp.ground && !pp.onMover && onCells(pp, x0, x1, row)) out.push({ who: pp, hero: true });
      for (const e of ctx.enemies()) if (heavy(e) && onCells(e, x0, x1, row)) out.push({ who: e, hero: false }); }
    return out; }
  function arm(t, by) {
    const d = t.def, ts = TS(); t.st = 'armed'; t.t = TRAP_DELAY[t.kind]; K.n.presses++; if (!by.hero) K.n.byFoe++;
    /* THE LAST SHAFT: its counterweight's own plate fires the darts as its rider comes level with them */
    if (by.ride && by.m && t.kind === 'darts') { const top = d.rows[0] * ts + 4; t.t = Math.max(0.2, (top - by.m.y) / Math.max(10, by.m.speed)); }
    const P0 = ctx.hero(); const near = P0 && Math.abs(P0.x - (d.zone[0] + d.zone[1]) * ts / 2) < 300 && Math.abs(P0.y - d.zone[3] * ts) < 160;
    ctx.sfx.click ? ctx.sfx.click() : ctx.sfx.clank && ctx.sfx.clank();
    if (near) { const wx = by.who.x, wy = by.who.y - 24;
      if (!by.hero) number(wx, wy, t.kind === 'block' ? 'HE TREADS THE PLATE: THE BLOCK!' : t.kind === 'darts' ? 'HE TREADS THE PLATE: THE DARTS!' : 'HE TREADS THE PLATE: THE STONE!', '#ff9a5c');
      else number(wx, wy, t.kind === 'block' ? 'CLICK: THE BLOCK FALLS' : t.kind === 'darts' ? 'CLICK: THE DARTS FLY' : 'CLICK: THE STONE RUNS', '#ffd36b'); }
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
      if (e.elite) { const dmg = Math.round((e.maxHp || e.hp) * PYS.eliteShare); ctx.hurtFoe(e, dmg, box.l); e.stagger = Math.max(e.stagger || 0, PYS.eliteStagger); K.n.eliteHit++; number(e.x, e.y - 30, 'HE TAKES ONLY A SHARE OF IT', '#ffd36b'); any = true; continue; }
      const hp = e.hp; ctx.hurtFoe(e, Math.max(hp + 1, 999), box.l); if (!e.alive) { K.n.killed++; any = true; if (once('killed' + t.id)) number(e.x, e.y - 30, 'THE TOMB KILLS ITS OWN', '#8fd160'); } }
    if (ctx.broodHit) ctx.broodHit(box);
    return any;
  }

  /* ---------- THE TRAPS, A FRAME ---------- */
  function stepTrap(t, dt) {
    const d = t.def, ts = TS();
    const press = pressedBy(t), now = press.length > 0, fresh = now && !t.pressed; t.pressed = now;
    const speedUp = d.arena && ctx.bossPhase && ctx.bossPhase() >= 3 ? 0.6 : 1;
    if (t.st === 'ready') { if (fresh) arm(t, press[0]); return; }
    t.t -= dt;
    if (t.st === 'armed') { if (t.t > 0) return; fire(t); return; }
    if (t.kind === 'block') stepBlock(t, dt, speedUp);
    else if (t.kind === 'darts') stepDarts(t, dt, speedUp);
    else if (t.kind === 'stone') stepStone(t, dt, speedUp);
  }
  function fire(t) { const d = t.def; t.st = 'firing'; t.hitKeys.clear(); K.n.fired++; K.n.byTrap[t.id] = (K.n.byTrap[t.id] || 0) + 1; t.key = t.id + ':' + K.n.fired;
    if (t.kind === 'block') { t.vy = 300; t.phase = 'fall'; ctx.sfx.thud && ctx.sfx.thud(); }   /* (it is let go, not dropped: a block from the antechamber's high roof lands inside her stagger) */
    if (t.kind === 'darts') { t.volley = TRAP_DARTS.volley; t.dartT = 0; ctx.sfx.bow ? ctx.sfx.bow() : ctx.sfx.slash && ctx.sfx.slash(); }
    if (t.kind === 'stone') { t.phase = d.drop ? 'drop' : 'roll'; t.vis = true; t.y = d.drop ? (d.drop[0]) * TS() : d.row * TS(); t.vy = 0; ctx.sfx.boom ? ctx.sfx.boom() : ctx.sfx.thud && ctx.sfx.thud(); }
  }
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
  H.world = (e, s, w) => { if (e.t !== 'mummy') return; if (e.burn > 0) { if (!e.pyLit) { e.pyLit = true; e.burn = Math.max(e.burn, PYS.linen); K.n.burned++; if (once('linen')) number(e.x, e.y - 30, 'ITS LINEN BURNS', '#ff9a5c'); } w.burning = e.burn; } else { e.pyLit = false; w.burning = 0; } };
  H.onHit = (e, v, landed, P) => { if (e.t !== 'mummy' || !landed || P.dead) return;
    if (v.yank) { ctx.moveBody(P, -Math.sign(P.x - e.x || -v.yank) * MUMMY.yank, 0); }
    if (v.grab) { P.pyGrab = { e, t: MUMMY.hold, tick: PYS.grabSqueeze }; K.n.grabs++; number(P.x, P.y - 30, 'IT HAS YOU: STRIKE IT', '#ff6b6b'); } };
  /* a mummy struck lets go; burning, its linen takes a blow x PYS.linenMul */
  H.takeMummy = (e, dmg) => { for (const pp of ctx.players) if (pp.pyGrab && pp.pyGrab.e === e) { pp.pyGrab = null; K.n.torn++; number(pp.x, pp.y - 30, 'YOU TEAR LOOSE OF ITS GRIP', '#8fd160'); }
    return e.burn > 0 ? dmg * PYS.linenMul : dmg; };
  function stepGrabs(dt) { for (const pp of ctx.players) { const g = pp.pyGrab; if (!g) continue; const e = g.e;
      if (pp.dead || !e.alive || (e.st && e.st.mode === 'burning') || (g.t -= dt) <= 0) { pp.pyGrab = null; continue; }
      pp.x += ((e.x + (e.face || 1) * 9) - pp.x) * Math.min(1, dt * 6); pp.vx = 0; if (pp.vy < 0) pp.vy = 0;
      if ((g.tick -= dt) <= 0) { g.tick = PYS.grabSqueeze; ctx.asPlayer(pp, () => ctx.damagePlayer(e.x, MUMMY.dmg.squeeze, { unblockable: true, noKnock: true, who: e, name: 'THE MUMMY\'S GRIP' })); } } }

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
    stepGrabs(dt);
    stepStorm(P0, dt);
    /* THE FIRST LOOK at a thing: a line once (what it is) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 80;
      for (const t of K.traps) { const p = t.def.plates.find(q => Array.isArray(q)); if (!p || t.def.arena) continue; if (near(px(p[0]), p[2] * TS(), 90) && once('look' + t.id)) {
          if (t.id === 'g1block') number(P0.x, P0.y - 34, 'A PALE PLATE: IT DROPS THE BLOCK ON THE GUARD UNDER IT');
          else if (t.id === 'g1darts') number(P0.x, P0.y - 34, 'A PALE PLATE: IT FIRES THE DART WALL ACROSS THE RUN');
          else if (t.id === 'g2stone') number(P0.x, P0.y - 34, 'A PALE PLATE: IT SENDS THE STONE DOWN THE GROOVE');
          else if (t.id === 'great') number(P0.x, P0.y - 34, 'THE PLATE OF THE GREAT STONE: THE FLOOR BELOW IS ITS ROAD');
          else if (t.id === 'pit2') number(P0.x, P0.y - 34, 'A PALE PLATE: ITS BLOCK FALLS INTO THE PIT');
          else if (t.id === 'shaft') number(P0.x, P0.y - 34, 'SPEND THE DARTS FIRST: THEN RIDE UNDER THEM'); } } }
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
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.sealedpyramid) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'cw') { const p = pairOf(id); return p ? (p.t < 0.02 ? 'home' : p.t > 0.98 ? 'over' : 'moving') : ''; }
    if (kind === 'wall') return K.broken[id] ? 'open' : 'shut';
    if (kind === 'pit') { const t = trapOf(id); return t ? (t.filled ? 'filled' : 'open') : ''; }
    if (kind === 'trap') { const t = trapOf(id); return t ? (t.st === 'ready' ? 'ready' : 'spent') : ''; }
    if (kind === 'vault') { const v = K.vault.find(q => q.id === id); return v ? (v.open ? 'open' : ctx.questGot() >= v.seals ? 'due' : 'shut') : ''; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('sealedpyramid', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (GREYBOX, readable: the SONNET art lane redraws every piece) ---------- */
  const COL = { stone: '#b89c6c', stoneL: '#e0c890', stoneD: '#6e5a3c', ink: '#1c140c', plate: '#efe4c4', plateL: '#fffaf0', plateD: '#b8a884', bone: '#e8e0c8', boneD: '#a89c80',
    dart: '#3a2a1a', dartTip: '#d8d8d0', scarab: '#2a5a3e', scarabL: '#7ad08a', gold: '#d8aa40', goldL: '#f6dc80', red: '#ff6b6b', glow: '255,200,110' };
  const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
  /* THE FOOTING KINDS (L.structures 'py*', main.js drawStructures): a carved corbel under a shelf; the robbers' walk on its posts */
  H.drawStructure = (g, kind, l, r, t, b) => {
    if (kind === 'pyShelf' || kind === 'pyCornice' || kind === 'pyLedge') { for (const x of [l + 1, r - 7]) { rect(g, x, t + 6, 6, 3, COL.stone); rect(g, x + 1, t + 9, 4, 3, COL.stone); rect(g, x + 2, t + 12, 2, 3, COL.stoneD); rect(g, x, t + 6, 6, 1, COL.stoneL);
        g.globalAlpha = 0.35; rect(g, x + 1, t + 15, 4, Math.max(0, b - t - 15), COL.stoneD); g.globalAlpha = 1; } return true; }
    if (kind === 'pyWalk') { for (let x = l + 24; x < r - 8; x += 12 * 16) { rect(g, x, t + 6, 6, b - t - 6, COL.stoneD); rect(g, x, t + 6, 1, b - t - 6, COL.stone); rect(g, x - 3, t + 6, 12, 3, COL.stone); rect(g, x - 3, b - 4, 12, 4, COL.stoneD); } return true; }
    return false; };
  /* a SCARAB SEAL (stray kind 'scarabseal'): a green-glazed scarab on a gold disc */
  H.drawSeal = (g, x, y, time) => { const bob = Math.sin(time * 3 + x) * 2, cx0 = R(x), cy0 = R(y - 10 + bob);
    g.fillStyle = COL.gold; g.beginPath(); g.arc(cx0, cy0, 6, 0, 7); g.fill(); g.fillStyle = COL.goldL; g.fillRect(cx0 - 4, cy0 - 5, 3, 1);
    g.fillStyle = COL.scarab; g.beginPath(); g.ellipse(cx0, cy0 + 1, 3, 4, 0, 0, 7); g.fill(); g.fillStyle = COL.scarabL; g.fillRect(cx0 - 1, cy0 - 2, 2, 1); g.fillStyle = COL.ink; g.fillRect(cx0, cy0 - 1, 1, 5);
    g.globalAlpha = 0.25 + 0.15 * Math.sin(time * 5); g.fillStyle = COL.goldL; g.beginPath(); g.arc(cx0, cy0, 9, 0, 7); g.fill(); g.globalAlpha = 1; };
  function drawPlate(g, x0, x1, row, cx, cy, t, time) { const ts = TS(), x = x0 * ts - cx, y = row * ts - cy, w = (x1 - x0 + 1) * ts;
    rect(g, x + 1, y, w - 2, 3, COL.plate); rect(g, x + 3, y + 1, w - 6, 1, COL.plateD); rect(g, x + 1, y, w - 2, 1, COL.plateL);
    if (!t) return;
    if (t.st === 'ready') { g.globalAlpha = 0.18 + 0.12 * Math.sin(time * 3 + x0); rect(g, x, y - 3, w, 3, COL.plateL); g.globalAlpha = 1; }
    else { const k = t.st === 'armed' ? 1 : t.st === 'reset' ? Math.max(0, 1 - t.t / Math.max(0.5, t.def.reset)) : 0; rect(g, x + 1, y - 5, w - 2, 2, '#2a1e14'); rect(g, x + 1, y - 5, (w - 2) * k, 2, t.st === 'armed' ? COL.red : '#ffb060'); } }
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), vh = ctx.VH(), L = K.L;
    const vis = (x0, x1) => x1 * ts - cx > -64 && x0 * ts - cx < vw + 64;
    /* THE DECOR: bones in the reaches, the groove, the sarcophagi, the false king, the mural, her reliefs, her eggs, the jars, the wheels */
    for (const d of (L.decor || [])) { const a = d.x0 ?? d.x, b = d.x1 ?? d.x; if (!vis(a, b + 1)) continue; const X = a * ts - cx, Y = (d.y ?? 0) * ts - cy;
      if (d.kind === 'bones') { for (let k = 0; k <= (b - a) * 2; k++) { const bx = X + 4 + k * 8, by = Y + 12; rect(g, bx, by, 6, 2, COL.bone); rect(g, bx + 1, by - 2, 2, 2, COL.boneD); } rect(g, X + 6, Y + 8, 5, 5, COL.bone); rect(g, X + 7, Y + 10, 1, 1, COL.ink); rect(g, X + 9, Y + 10, 1, 1, COL.ink); }
      else if (d.kind === 'groove') { g.globalAlpha = 0.5; rect(g, X, Y + 14, (b - a + 1) * ts, 2, COL.stoneD); g.globalAlpha = 1; }
      else if (d.kind === 'dartholes') { for (let r = d.y0; r <= d.y1; r++) for (let k = 0; k < 3; k++) rect(g, d.x * ts - cx + (k % 2) * 6 + 2, r * ts - cy + 3 + k * 4, 3, 2, COL.ink); }
      else if (d.kind === 'sarcophagus') { rect(g, X - 10, Y - 6, 36, 22, '#8a6a3a'); rect(g, X - 10, Y - 6, 36, 3, COL.goldL); rect(g, X - 4, Y - 2, 24, 3, COL.gold); }
      else if (d.kind === 'falseking') { rect(g, X - 8, Y, 40, 54, 'rgba(60,40,20,0.5)'); rect(g, X, Y + 6, 24, 30, COL.gold); rect(g, X + 4, Y + 12, 4, 3, COL.ink); rect(g, X + 16, Y + 12, 4, 3, COL.ink); rect(g, X + 8, Y + 26, 8, 2, '#8a2a2a'); ctx.text('THE FALSE KING', X + 12, Y - 4, '#e8d0a0', 'center', 4); }
      else if (d.kind === 'mural') { g.globalAlpha = 0.45; rect(g, X, Y, (b - a + 1) * ts, 50, '#5a4a30'); g.globalAlpha = 1; g.fillStyle = COL.scarab; g.beginPath(); g.ellipse(X + (b - a + 1) * ts / 2, Y + 22, 26, 16, 0, 0, 7); g.fill(); for (let k = 0; k < 6; k++) rect(g, X + 10 + k * 30, Y + 40, 8, 6, COL.boneD); }
      else if (d.kind === 'scarabrelief') { g.fillStyle = 'rgba(42,90,62,0.6)'; g.beginPath(); g.ellipse(X + (b - a + 1) * ts / 2, Y - 10, 18, 12, 0, 0, 7); g.fill(); rect(g, X + (b - a + 1) * ts / 2 - 1, Y - 22, 2, 24, COL.ink); }
      else if (d.kind === 'eggs') { for (let k = 0; k <= b - a; k += 2) { g.fillStyle = '#d8d0a8'; g.beginPath(); g.ellipse(X + k * ts + 6, Y + 10, 5, 7, 0, 0, 7); g.fill(); } }
      else if (d.kind === 'jars') { for (let k = 0; k <= b - a; k++) { rect(g, X + k * ts + 3, Y + 4, 10, 12, '#a87a48'); rect(g, X + k * ts + 5, Y + 2, 6, 3, '#d8b070'); } }
      else if (d.kind === 'capstone') { rect(g, X, Y - 20, (b - a + 1) * ts, 20, COL.stone); rect(g, X, Y - 20, (b - a + 1) * ts, 2, COL.stoneL); }
      else if (d.kind === 'cwheel') { const wx = d.x * ts + 16 - cx, wy = d.y * ts - cy; g.strokeStyle = COL.stoneD; g.lineWidth = 3; g.beginPath(); g.arc(wx, wy, 18, 0, 7); g.stroke(); g.lineWidth = 1; for (let k = 0; k < 6; k++) { const a0 = time * 0 + k * Math.PI / 3; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + Math.cos(a0) * 18, wy + Math.sin(a0) * 18); g.stroke(); } }
      else if (d.kind === 'scarabpit') { const w = (b - a + 1) * ts; rect(g, X, Y - 32, w, 32, 'rgba(10,6,4,0.6)'); for (let k = 0; k < (b - a + 1) * 4; k++) { const sx = X + ((k * 37 + time * 30 * (k % 2 ? 1 : -1)) % w + w) % w, sy = Y + 6 - (k % 3) * 3; rect(g, sx, sy, 3, 2, k % 3 ? COL.scarab : COL.scarabL); } }
      else if (d.kind === 'falsedoor' && !K.broken.falsedoor) { const w = (b - a + 1) * ts, h = (d.y1 - d.y0 + 1) * ts, Yd = d.y0 * ts - cy; rect(g, X, Yd, w, h, '#c8b088'); rect(g, X + 4, Yd + 8, w - 8, h - 8, '#8a6a3a'); rect(g, X + 4, Yd + 8, w - 8, 2, COL.goldL);
        g.strokeStyle = COL.ink; g.beginPath(); g.moveTo(X + 6, Yd + 20); g.lineTo(X + 14, Yd + 40); g.lineTo(X + 10, Yd + 60); g.stroke(); ctx.text('SEALED', X + w / 2, Yd - 4, '#e8d0a0', 'center', 4); }
      else if (d.kind === 'storm' && K.stormNow) { const st = K.stormNow; if (st.phase !== 'calm') { const k = st.phase === 'gust' ? 0.5 : 0.18; g.globalAlpha = k; g.fillStyle = '#e2bb7a';
          for (let i = 0; i < 40; i++) { const sx = ((i * 97 + time * 400 * st.dir) % vw + vw) % vw, sy = (i * 53) % vh; g.fillRect(R(sx), R(sy), 10, 1); } g.globalAlpha = 1; } }
    }
    /* THE LAMPS: braziers */
    for (const lp of (L.lamps || [])) { const x = lp.x * ts + 8 - cx, y = lp.y * ts - cy; if (x < -30 || x > vw + 30) continue; rect(g, x - 4, y + 6, 8, 4, '#4a3a2a'); rect(g, x - 1, y + 10, 2, 6, '#3a2a1a');
      g.fillStyle = Math.floor(time * 8) % 2 ? '#ffb040' : '#ffd36b'; g.beginPath(); g.moveTo(x - 4, y + 6); g.lineTo(x, y - 2 - Math.sin(time * 9) * 2); g.lineTo(x + 4, y + 6); g.fill(); }
    /* THE TRAPS: plates (and their reload), the block in its slot (its shadow on the reach while it hangs), the dart holes, the stone */
    for (const t of K.traps) { const d = t.def; if (!vis(d.zone[0] - 4, d.zone[1] + 4)) continue;
      for (const p of d.plates) if (Array.isArray(p)) drawPlate(g, p[0], p[1], p[2], cx, cy, t, time);
      for (const p of (d.inner || [])) drawPlate(g, p[0], p[1], p[2], cx, cy, null, time);
      if (t.kind === 'block') { const x = t.x - cx, y = t.y - cy;
        if (t.st === 'ready' || t.st === 'armed') { g.globalAlpha = 0.16; rect(g, x, (d.on ? (moverOf(d.on) || { y: d.zone[3] * ts }).y : (d.land + 1) * ts) - cy - 4, t.w, 4, COL.ink); g.globalAlpha = 1; }   /* the slot's shadow on the reach */
        rect(g, x, y, t.w, t.h, COL.stone); rect(g, x, y, t.w, 2, COL.stoneL); rect(g, x, y + t.h - 2, t.w, 2, COL.stoneD); for (let k = 16; k < t.w; k += 16) rect(g, x + k, y + 2, 1, t.h - 4, COL.stoneD);
        if (t.st !== 'firing' || t.phase === 'haul') { rect(g, x + 6, d.slot[2] * ts - cy - 40, 2, y - (d.slot[2] * ts - cy - 40), '#5a5048'); rect(g, x + t.w - 8, d.slot[2] * ts - cy - 40, 2, y - (d.slot[2] * ts - cy - 40), '#5a5048'); }
        if (t.st === 'armed') { g.globalAlpha = 0.6; for (let k = 0; k < 4; k++) rect(g, x + 4 + ((k * 23 + time * 60) % Math.max(8, t.w - 8)), y + t.h + ((time * 120 + k * 17) % 40), 1, 4, '#d8c8a0'); g.globalAlpha = 1; } }
      if (t.kind === 'darts' && t.st === 'armed') { const wx = (d.dir > 0 ? (d.wall + 1) * ts : d.wall * ts) - cx; g.globalAlpha = 0.5 + 0.5 * Math.sin(time * 30); for (let r = d.rows[0]; r <= d.rows[1]; r++) rect(g, wx - 2, r * ts - cy + 4, 4, 8, COL.red); g.globalAlpha = 1; }
      if (t.kind === 'stone' && t.vis) { const r = d.great ? 18 : TRAP_STONE.r, x = t.x - cx, y = t.y - cy - r; g.fillStyle = COL.stone; g.beginPath(); g.arc(R(x), R(y), r, 0, 7); g.fill(); g.strokeStyle = COL.stoneD; g.lineWidth = 2; g.beginPath(); g.arc(R(x), R(y), r - 1, 0, 7); g.stroke();
        const a = t.spin || 0; g.beginPath(); g.moveTo(R(x), R(y)); g.lineTo(R(x + Math.cos(a) * (r - 3)), R(y + Math.sin(a) * (r - 3))); g.moveTo(R(x), R(y)); g.lineTo(R(x - Math.sin(a) * (r - 3)), R(y + Math.cos(a) * (r - 3))); g.stroke(); g.lineWidth = 1;
        if (t.st === 'armed') { g.globalAlpha = 0.6; ctx.text('!!', R(x), R(y - r - 8), COL.red, 'center', 6); g.globalAlpha = 1; } }
      if (t.kind === 'stone' && !t.vis && d.drop && t.st !== 'firing') { const x = d.home * ts + 16 - cx, y = (d.drop[1] + 1) * ts - cy; rect(g, x - 14, y - 4, 28, 4, COL.stoneD); }
    }
    for (const q of K.darts) { rect(g, q.x - cx - 5, q.y - cy, 8, 1, COL.dart); rect(g, q.x - cx + (q.dir > 0 ? 3 : -5), q.y - cy - 1, 2, 3, COL.dartTip); }
    /* THE COUNTERWEIGHTS: a stone block under each mover's top, its chains up to the wheel; a pale top where it is a plate */
    for (const m of ctx.movers()) { if (!m.pyr) continue; const x = m.x - cx, y = m.y - cy; if (x < -60 || x > vw + 60) continue;
      const wy = (m.wheel ? m.wheel[1] * ts : m.top - 120) - cy; rect(g, x + 6, wy, 2, y - wy, '#5a5048'); rect(g, x + 24, wy, 2, y - wy, '#5a5048');
      rect(g, x, y, 32, 30, COL.stone); rect(g, x, y, 32, 2, COL.stoneL); rect(g, x, y + 28, 32, 2, COL.stoneD); rect(g, x + 15, y + 2, 1, 26, COL.stoneD);
      if (m.plate) { const t = K.traps.find(q => q.def.plates.some(p => p.mover === m.pyr)); rect(g, x + 2, y, 28, 3, COL.plate); rect(g, x + 2, y, 28, 1, COL.plateL);
        if (t && t.st !== 'ready') { const k = t.st === 'armed' ? 1 : t.st === 'reset' ? Math.max(0, 1 - t.t / Math.max(0.5, t.def.reset)) : 0; rect(g, x + 2, y - 5, 28, 2, '#2a1e14'); rect(g, x + 2, y - 5, 28 * k, 2, t.st === 'armed' ? COL.red : '#ffb060'); } } }
    /* THE SEALED TOMB's door: four seal sockets (the ones carried, lit) */
    for (const v of K.vault) { if (v.open) continue; const x = v.x * ts - cx, y = v.y0 * ts - cy; if (x < -40 || x > vw + 40) continue; rect(g, x, y, 16, (v.y1 - v.y0 + 1) * ts, '#8a7048'); const got = ctx.questGot();
      for (let k = 0; k < v.seals; k++) { g.fillStyle = k < got ? COL.scarabL : '#3a2e20'; g.beginPath(); g.arc(R(x + 8), R(y + 14 + k * 18), 4, 0, 7); g.fill(); } }
    /* THE FACE's storm told on the hero: the arrow while it warns */
    const P0 = ctx.hero(); if (K.stormNow && K.stormNow.phase === 'warn' && P0 && L.sandstorm && P0.x < L.sandstorm.x1) ctx.text(K.stormNow.dir > 0 ? '>>' : '<<', R(P0.x - cx), R(P0.y - cy - 30), '#ffd36b', 'center', 6);
  };
  /* the route glint and a held hero's grip, over everything */
  H.drawOver = (g, cx, cy, time) => { if (!K) return;
    for (const pp of ctx.players) if (pp.pyGrab) { const x = R(pp.x - cx), y = R(pp.y - cy); g.strokeStyle = '#e8dcb4'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 7, y - 10); g.lineTo(x + 7, y - 6); g.moveTo(x - 7, y - 4); g.lineTo(x + 7, y - 12); g.stroke(); g.lineWidth = 1; ctx.text('STRIKE IT', x, y - 30, '#ff6b6b', 'center', 4); }
    if (K.glint && K.glint.show) drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), ctx.VW(), ctx.VH(), time); };
  H.read = () => K && { n: JSON.parse(JSON.stringify(K.n)), traps: K.traps.map(t => ({ id: t.id, st: t.st, filled: t.filled })), pairs: K.pairs.map(p => ({ id: p.id, t: +p.t.toFixed(2) })), broken: { ...K.broken }, vault: K.vault.map(v => ({ id: v.id, open: v.open })), storm: K.stormNow ? K.stormNow.phase : null };
  return H;
}
