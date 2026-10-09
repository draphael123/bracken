// src/buried-city-hands.js - THE BURIED CITY's HANDS (claude/buriedcity, the greybox). src/buried-city.js is the level (geometry, the rooms, the cast);
// this is the rule in the world: THE SAND ROOMS (their sand written into the grid as T.SOFT a row at a time, rising under a hero and carrying him up, running
// out through an open floor-gate), THE SAND-GATE LEVERS (E: open / shut; a chain lever inside a room is pulled anywhere on its length), THE HOURGLASS (an
// open upper bulb runs INTO the lower one), THE TRAP HALL (its floor-gate IS its floor), THE GREAT SAND-GATE (three turns of the wheel drain the Drowned
// Quarter; the foes under its sand stand up when it has gone off them), the constructs JAMMED by moving sand (src/construct.js: x2 while jammed), THE
// CLOCKWORK VAULT (five gears), the throne room's levers (they tell THE HOURGLASS KING, src/hourglass-king-hands.js), the glint and the 10 s nudge on every
// route need (src/stuck-spots.js STUCK_HANDS.buriedcity), the walker's hints (BK.walkHint), and the drawing (GREYBOX shapes until the art pass).
// THE RULE'S STATE IS DRAWN (A3): the sand body itself (and the loose row rising on it), the streams from the roof while a room fills, the slot running while
// it drains, a GAUGE on every lever (the room's level, and OPEN / SHUT on it).
// main.js calls: on, reset, update, interact, waits, world, takeConstruct, drawWorld, drawOver, drawBack, noSun, read, state, walkHint, handsState.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';

export const BCS = { leverR: 20, leverH: 22, wheelR: 26, wheelCd: 0.7, cdLever: 0.5, jamT: 2.4, jamMul: 2.0, vaultR: 30, liftPad: 2 };
const RULE_SAID = { first: 'THE SAND-GATE: OPEN, THE ROOM DRAINS', granary: 'SHUT THE GATE: THE SAND CARRIES YOU UP', cellar: 'SHUT THE GATE: THE SAND COVERS THE STAKES',
  upperbulb: 'THE HOURGLASS: THIS HALL RUNS DOWN INTO THE NEXT', shaft: 'SHUT THE GATE: RIDE THE SAND UP THE SHAFT', trap: 'SHUT THE FLOOR-GATE: THE HALL FILLS' };

export function makeBuriedCityHands(ctx) {
  let K = null;
  const H = {};
  const TS = () => ctx.TS, T = () => ctx.T;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  H.on = () => !!K;
  H.state = () => K;
  H.noSun = x => !!K && !!K.L.arena && x >= K.L.arena.x0;   /* the throne room is roofed (the city is: the sun is the dunes' only) */

  /* ---------- RESET: a fresh load builds the rooms; a respawn puts every small room back as it was built and keeps THE GREAT SAND-GATE as it was left ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.buriedcity) { K = null; return; }
    const fresh = !K || K.L !== L;
    if (fresh) K = { L, said: {}, clock: 0, wheel: { turns: 0, cd: 0, done: false }, vault: (L.vaultDoors || []).map(v => ({ ...v, open: false })),
      n: { pulls: 0, opens: 0, shuts: 0, fills: 0, drains: 0, lifts: 0, jams: 0, turns: 0, nudges: 0, risen: 0, full: 0, kingPulls: 0 } };
    /* the cells under each room's sand AS BUILT: taken once on a fresh load (the grid is every room drained then) - a respawn's grid still holds the sand */
    if (fresh) K.bases = Object.fromEntries((L.rooms || []).map(r => [r.id, Array.from({ length: r.full }, (_, k) => { const y = r.floor - 1 - k, row = []; for (let x = r.x0; x <= r.x1; x++) row.push(ctx.cellGet(x, y)); return row; })]));
    K.rooms = (L.rooms || []).map(r => { const keep = !fresh && r.great && K.wheel.done;
      return { ...r, level: keep ? 0 : r.init === 'full' ? r.full : 0, gate: keep ? 'open' : r.init === 'full' || r.id === 'lowerbulb' ? 'shut' : 'open', rows: -1, cd: 0, moving: 0, base: K.bases[r.id], said: false }; });
    if (!fresh && !K.wheel.done) K.wheel.turns = 0;
    for (const r of K.rooms) { if (r.great && !fresh && !K.wheel.done) r.drain = 0; write(r, true); }
    K.waiting = (L.ents || []).map((e, k) => ({ e, k })).filter(q => q.e.sandWait && H.waits(q.e));
    K.glint = null; K.stalls = {}; K.stallKey = null; K.fx = []; K.leverFx = {};
    for (const pp of ctx.players) pp.bcJam = 0;
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { buriedCity: () => K, buriedCityHands: () => H, walkHint: () => H.walkHint(ctx.hero()) });
  };
  /* a placed foe under the sand (sandWait: a room id): it is not spawned while that room's sand is over it - the hands stand it up when it has gone */
  H.waits = e => { if (!e || !e.sandWait) return false; if (!K || K.L !== ctx.L) return true; const r = K.rooms && K.rooms.find(q => q.id === e.sandWait); if (!r) return true; return sandTopRow(r) <= e.y; };
  const roomOf = id => K.rooms.find(r => r.id === id);
  const sandRows = r => Math.max(0, Math.min(r.full, Math.floor(r.level + 1e-6)));
  const sandTopRow = r => r.floor - sandRows(r);   /* the row the sand's top surface is (a hero on it stands on row-1) */
  const px = x => x * TS() + 8;
  /* write a room's sand into the grid: rows 0..n-1 above its floor are sand (T.SOFT), the rest as built; a TRAP's floor-gate is its floor (solid while shut) */
  function write(r, force) {
    const n = sandRows(r), T0 = T();
    if (r.trap) { const shut = r.gate === 'shut'; if (force || r.plateShut !== shut) { r.plateShut = shut; for (let x = r.x0; x <= r.x1; x++) ctx.cellSet(x, r.floor, shut ? T0.SOLID : T0.AIR); } }
    if (!force && n === r.rows) return;
    const was = r.rows; r.rows = n;
    for (let k = 0; k < r.full; k++) { const y = r.floor - 1 - k, row = r.base[k]; for (let x = r.x0; x <= r.x1; x++) ctx.cellSet(x, y, k < n ? T0.SOFT : row[x - r.x0]); }
    if (n > was || force) lift(r);
  }
  /* THE SAND CARRIES YOU UP: a body inside the new sand stands on its top (a construct carried is JAMMED: grit in its gears) */
  function lift(r) {
    const top = sandTopRow(r) * TS(), l = r.x0 * TS(), rr = (r.x1 + 1) * TS(), bottom = r.floor * TS();
    for (const pp of ctx.players) { if (pp.dead) continue; if (pp.x > l - 2 && pp.x < rr + 2 && pp.y > top && pp.y - (pp.h || 14) < bottom) { pp.y = top; if (pp.vy > 0) pp.vy = 0; K.n.lifts++; } }
    for (const e of ctx.enemies()) { if (!e.alive || e.noGrav || e.boss) continue; if (e.x > l && e.x < rr && e.y > top && e.y - (e.h || 12) < bottom) { e.y = top; e.vy = 0; if (e.st) e.st.y = top;
        if (e.t === 'construct') jam(e, r); } }
  }
  function jam(e, r) { if (!(e.bcJam > 0)) { K.n.jams++; if (once('jam')) number(e.x, e.y - 34, 'SAND IN ITS GEARS: IT IS JAMMED', '#8fd160'); } e.bcJam = BCS.jamT; }
  H.world = (e, s, w) => { if (e.t === 'construct') w.jam = e.bcJam > 0 ? e.bcJam : 0; };
  /* a JAMMED construct takes a blow twice over (told once) */
  H.takeConstruct = (e, dmg) => { if (e.st && e.st.mode === 'jammed') { if (!e.bcJamSaid) { e.bcJamSaid = 1; number(e.x, e.y - 30, 'JAMMED: IT CANNOT GUARD', '#8fd160'); } return dmg * BCS.jamMul; } return dmg; };

  /* ---------- THE LEVERS, THE WHEEL, THE VAULT (E) ---------- */
  const levers = () => { const out = []; for (const r of K.rooms) for (const [x, row, chain] of (r.levers || [])) out.push({ r, x, row, chain: chain || 0 });
    for (const a of (K.L.arenaLevers || [])) out.push({ r: null, x: a.x, row: a.row, chain: 0, arena: a.id }); return out; };
  const atLever = (P, lv) => Math.abs(px(lv.x) - P.x) <= BCS.leverR && P.y <= (lv.row + 1) * TS() + 4 && P.y >= (lv.row + 1 - Math.max(1, lv.chain) - 1) * TS() - 6;
  H.interact = P => {
    if (!K || P.dead) return false; const ts = TS();
    const lv = levers().find(q => atLever(P, q)); if (lv) { pull(lv, P); return true; }
    const W = K.L.wheel; if (W && Math.abs(px(W.x) - P.x) <= BCS.wheelR && Math.abs((W.row + 1) * ts - P.y) <= 18) { turnWheel(P); return true; }
    const v = K.vault.find(q => !q.open && Math.abs(q.x * ts + 8 - P.x) <= BCS.vaultR && P.y > q.y0 * ts && P.y <= (q.y1 + 2) * ts);
    if (v) { if (ctx.questGot() >= v.gears) openVault(v); else number(P.x, P.y - 34, 'THE CLOCKWORK VAULT WANTS FIVE GEARS', '#9aa39a'); return true; }
    return false;
  };
  function pull(lv, P) {
    const key = lv.arena || (lv.r.id + lv.x); if ((K.leverFx[key] || 0) > K.clock) return; K.leverFx[key] = K.clock + BCS.cdLever; K.n.pulls++; ctx.sfx.clank && ctx.sfx.clank();
    if (lv.arena) { K.n.kingPulls++; const v = ctx.bossLever ? ctx.bossLever(px(lv.x)) : 'busy'; K.fx.push({ kind: 'pull', x: px(lv.x), y: (lv.row + 1) * TS(), t: 0.5, ok: v === 'stall' }); return; }
    const r = lv.r; r.gate = r.gate === 'open' ? 'shut' : 'open'; K.fx.push({ kind: 'pull', x: px(lv.x), y: (lv.row + 1) * TS(), t: 0.5, ok: true });
    if (r.gate === 'open') { K.n.opens++; number(P.x, P.y - 34, r.trap ? 'THE FLOOR-GATE OPENS: THE HALL DRAINS INTO THE DARK' : r.into ? 'THE GATE OPENS: THE SAND RUNS DOWN INTO THE NEXT HALL' : 'THE GATE IS OPEN: THE ROOM DRAINS', '#ffd36b'); ctx.sfx.gateLift && ctx.sfx.gateLift(); }
    else { K.n.shuts++; number(P.x, P.y - 34, r.trap ? 'THE FLOOR-GATE SHUTS: THE HALL FILLS' : 'THE GATE IS SHUT: THE SAND RISES', '#ffd36b'); ctx.sfx.gateDrop && ctx.sfx.gateDrop(); }
    if (r.trap) write(r, false);
  }
  function turnWheel(P) {
    const W = K.wheel, r = roomOf('great'); if (!r) return;
    if (W.done) { number(P.x, P.y - 34, 'THE GREAT GATE IS OPEN', '#9aa39a'); return; }
    if (W.cd > 0) return; W.cd = BCS.wheelCd; W.turns++; K.n.turns++; ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.shake(2 + W.turns);
    r.gate = 'open'; r.drain = [0, 1.0, 2.0, 4.0][Math.min(3, W.turns)];
    if (W.turns >= (K.L.wheel.turns || 3)) { W.done = true; number(P.x, P.y - 34, 'THE GREAT SAND-GATE IS OPEN: THE QUARTER DRAINS', '#8fd160'); ctx.shake(6); ctx.sfx.boom && ctx.sfx.boom(); }
    else number(P.x, P.y - 34, 'THE GREAT GATE OPENS A NOTCH (' + W.turns + '/' + (K.L.wheel.turns || 3) + ')', '#ffd36b');
  }
  function openVault(v) { v.open = true; const ts = TS(); for (let y = v.y0; y <= v.y1; y++) { ctx.cellSet(v.x, y, T().AIR); ctx.burst(v.x * ts + 8, y * ts + 8, 3, ['#d9b36a', '#8a6a3a'], 40, 0.5); } ctx.sfx.gateLift && ctx.sfx.gateLift(); number(v.x * ts, v.y0 * ts - 20, 'THE CLOCKWORK VAULT OPENS', '#8fd160'); }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt; const P0 = ctx.hero();
    K.wheel.cd = Math.max(0, K.wheel.cd - dt);
    for (const f of K.fx) f.t -= dt; K.fx = K.fx.filter(f => f.t > 0);
    for (const e of ctx.enemies()) if (e.bcJam > 0) e.bcJam = Math.max(0, e.bcJam - dt);
    /* THE SAND: an open gate drains its room (THE HOURGLASS: into the next); a shut gate with a pour fills it */
    for (const r of K.rooms) {
      const lv0 = r.level;
      if (r.gate === 'open' && r.level > 0) { r.level = Math.max(0, r.level - r.drain * dt); if (r.level === 0) K.n.drains++;
        if (r.into) { const q = roomOf(r.into); if (q) q.level = Math.max(q.level, q.full * (1 - r.level / r.full)); } }
      else if (r.gate === 'shut' && r.pour && r.level < r.full) { r.level = Math.min(r.full, r.level + r.fill * dt); if (r.level >= r.full) K.n.full++; }
      r.moving = r.level !== lv0 ? 0.6 : Math.max(0, r.moving - dt);
      write(r, false);
      /* a construct standing on moving sand is jammed (grit in its gears) */
      if (r.moving > 0) { const top = sandTopRow(r) * TS(); for (const e of ctx.enemies()) if (e.alive && e.t === 'construct' && e.x > r.x0 * TS() && e.x < (r.x1 + 1) * TS() && Math.abs(e.y - top) < 6 && sandRows(r) > 0) jam(e, r); }
    }
    for (const r of K.rooms) { const q = r.into && roomOf(r.into); if (q && q.level !== q._lv) { q._lv = q.level; q.moving = 0.6; write(q, false); } }
    /* THE DROWNED QUARTER's foes stand up out of the sand when it has gone off them */
    if (K.waiting.length) for (let i = K.waiting.length - 1; i >= 0; i--) { const q = K.waiting[i]; if (H.waits(q.e)) continue; K.waiting.splice(i, 1); K.n.risen++;
      const made = ctx.spawnEnt ? ctx.spawnEnt(q.e, q.k) : null; if (made) ctx.burst(made.x, made.y - 6, 10, ['#d8b070', '#a87a40'], 60, 0.6); }
    /* THE FIRST LOOK at a thing: a line once (what it is) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 70;
      for (const r of K.rooms) { const lv = (r.levers || [])[0]; if (lv && RULE_SAID[r.id] && near(px(lv[0]), (lv[1] + 1) * TS(), 70) && once('room' + r.id)) number(P0.x, P0.y - 34, RULE_SAID[r.id], '#ffd36b'); }
      const W = K.L.wheel; if (W && near(px(W.x), (W.row + 1) * TS(), 90) && once('wheel')) number(P0.x, P0.y - 34, 'THE GREAT SAND-GATE: E TURNS THE WHEEL', '#ffd36b'); }
    stall(P0, dt);
  };

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     { x, y, key: 'talk'|null, face, r?, wait? } in world px, or null (nothing to work here). At a full doorway: its lever. At a ride: shut the gate from the floor
     and wait on the sand to the top. At a fill-to-cross: shut its gate from the lip and wait for the fill. At the great gate: turn the wheel three times. */
  H.walkHint = P => {
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, feet = Math.floor((P.y - 1) / ts);
    const here = (x, row, key, face, extra) => Object.assign({ x: x * ts + 8, y: (row + 1) * ts, key, face: face || 0 }, extra || {});
    const r0 = roomOf('first'); if (r0 && r0.level > 2 && c > 44 && c < 56) return here(51, 33, r0.gate === 'shut' ? 'talk' : null, 1, { r: 10 });
    const g = roomOf('granary'); if (g && c > 117 && c < 133 && feet > 24) { if (g.gate === 'open') return here(121, 33, 'talk', 1); return Object.assign(here(Math.min(132, Math.max(124, Math.round(c))), sandTopRow(g) - 1, null, 1), { r: 40, wait: true }); }
    const ce = roomOf('cellar'); if (ce && c > 200 && c < 212 && ce.level < ce.full - 0.05) return here(208, 33, ce.gate === 'open' ? 'talk' : null, 1, { r: 10, wait: ce.gate === 'shut' });
    const ub = roomOf('upperbulb'); if (ub && ub.level > 2 && c > 238 && c < 248) return here(245, 29, ub.gate === 'shut' ? 'talk' : null, 1, { r: 10, wait: ub.gate === 'open' });
    const gr = roomOf('great'); if (gr && !K.wheel.done && c > 304 && c < 317) return here(K.L.wheel.x, K.L.wheel.row, K.wheel.cd > 0 ? null : 'talk', 1, { r: 10 });
    if (gr && gr.level > 3 && c > 304 && c < 317) return here(314, 33, null, 1, { r: 12, wait: true });
    const sh = roomOf('shaft'); if (sh && c > 419 && c < 433 && feet > 28) { if (sh.gate === 'open') return here(423, 41, 'talk', 1); return Object.assign(here(Math.min(432, Math.max(426, Math.round(c))), sandTopRow(sh) - 1, null, 1), { r: 40, wait: true }); }
    const tr = roomOf('trap'); if (tr && c > 442 && c < 452 && tr.level < tr.full - 0.05) return here(449, 29, tr.gate === 'open' ? 'talk' : null, 1, { r: 10, wait: tr.gate === 'shut' });
    return null; };

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.buriedcity) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'room') { const r = roomOf(id); if (!r) return ''; return r.level >= r.full - 0.05 ? 'full' : r.level <= 0.05 ? 'empty' : r.gate === 'open' ? 'draining' : 'filling'; }
    if (kind === 'wheel') return K.wheel.done ? 'open' : 'shut';
    if (kind === 'vault') { const v = K.vault.find(q => q.id === id); return v ? (v.open ? 'open' : ctx.questGot() >= v.gears ? 'due' : 'shut') : ''; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    const r = resolve('buriedcity', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (GREYBOX) ---------- */
  const R = Math.round;
  const SAND = { body: '#c9a464', dark: '#a27c42', top: '#e8cc8a', loose: 'rgba(232,204,138,0.45)', stream: 'rgba(226,196,130,0.85)', slot: '#2a1c10' };
  /* the backdrop: the city's own sky is the sand roof - a dim amber dusk, and far off a great HOURGLASS TOWER (the landmark) */
  H.drawBack = (g, cx, cy, vw, vh, time) => { if (!K) return;
    const lx = R(3400 - cx * 0.25) % 2400; for (const ox of [lx, lx + 2400]) { const x = ox - 300, y = 40; if (x < -200 || x > vw + 200) continue;
      g.globalAlpha = 0.18; g.fillStyle = '#6a4a2a'; g.fillRect(x - 40, y, 80, 8); g.fillRect(x - 40, y + 150, 80, 8);
      g.beginPath(); g.moveTo(x - 34, y + 8); g.lineTo(x + 34, y + 8); g.lineTo(x + 4, y + 79); g.lineTo(x + 34, y + 150); g.lineTo(x - 34, y + 150); g.lineTo(x - 4, y + 79); g.closePath(); g.fill();
      g.globalAlpha = 0.25; g.fillStyle = '#e0b870'; const k = (time * 0.02) % 1; g.fillRect(x - 1, y + 79, 2, 60); g.fillRect(x - 26 * (1 - k), y + 150 - 30 * k, 52 * (1 - k), 30 * k + 1); g.globalAlpha = 1; } };
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), vh = ctx.VH();
    /* the decor: spires, the sinkhole's lip, stalls, houses, domes, the great gate's grille */
    for (const d of (K.L.decor || [])) { const x0 = (d.x0 ?? d.x) * ts - cx; if (x0 > vw + 64 || ((d.x1 ?? d.x) + 1) * ts - cx < -64) continue;
      if (d.kind === 'spire') { g.fillStyle = '#b0885a'; g.fillRect(R(d.x * ts + 4 - cx), R((d.y + 1 - d.h) * ts - cy), 8, d.h * ts); g.fillStyle = '#8a6438'; g.fillRect(R(d.x * ts + 4 - cx), R((d.y + 1 - d.h) * ts - cy), 2, d.h * ts); }
      else if (d.kind === 'awning' || d.kind === 'stall') { g.fillStyle = d.kind === 'stall' ? '#7a3a2a' : '#b8a070'; g.fillRect(R(d.x0 * ts - cx), R(d.y * ts - cy), (d.x1 - d.x0 + 1) * ts, 4); }
      else if (d.kind === 'house' || d.kind === 'dome') { g.globalAlpha = 0.35; g.fillStyle = '#7a5a36'; g.fillRect(R(d.x0 * ts - cx), R((d.y - 6) * ts - cy), (d.x1 - d.x0 + 1) * ts, 6 * ts); g.globalAlpha = 1; }
      else if (d.kind === 'greatgate') { g.fillStyle = '#3a2a18'; g.fillRect(R(d.x0 * ts - cx), R(d.y * ts - cy), (d.x1 - d.x0 + 1) * ts, 4); g.fillStyle = '#8a6a3a'; for (let x = d.x0 * ts; x < (d.x1 + 1) * ts; x += 4) g.fillRect(R(x - cx), R(d.y * ts - cy), 2, 4); } }
    /* THE SAND ROOMS */
    for (const r of K.rooms) {
      const l = r.x0 * ts - cx, w = (r.x1 - r.x0 + 1) * ts; if (l > vw + 16 || l + w < -16) continue;
      const n = sandRows(r), topY = (r.floor - n) * ts - cy, bot = r.floor * ts - cy, frac = r.level - n;
      if (n > 0) { g.fillStyle = SAND.body; g.fillRect(R(l), R(topY), w, R(bot - topY)); g.fillStyle = SAND.dark; for (let y = topY + 6; y < bot; y += 9) g.fillRect(R(l), R(y), w, 1);
        g.fillStyle = SAND.top; g.fillRect(R(l), R(topY), w, 2); }
      if (frac > 0.02 && n < r.full) { g.fillStyle = SAND.loose; g.fillRect(R(l), R(topY - frac * ts), w, R(frac * ts)); }   /* the loose row rising */
      /* the streams from the roof while it fills */
      if (r.gate === 'shut' && r.pour && r.level < r.full) for (let x = r.x0 + 3; x <= r.x1 - 1; x += 5) { const sx = x * ts + 6 - cx; let y0 = (r.floor - r.full - 2) * ts - cy; for (let yy = r.floor - r.full - 1; yy > 0 && ctx.cellGet(x, yy) !== T().SOLID; yy--) y0 = yy * ts - cy;
        g.fillStyle = SAND.stream; g.fillRect(R(sx), R(y0), 3, R(topY - frac * ts - y0)); g.fillStyle = '#fff0c8'; g.fillRect(R(sx + 1), R(y0 + ((time * 120 + x * 13) % Math.max(8, topY - y0))), 1, 4); }
      /* the floor-gate: a slot that runs while it drains (THE HOURGLASS: a neck into the next hall) */
      if (r.gate === 'open' && r.level > 0) { const sx = l + w / 2 - 12; g.fillStyle = SAND.slot; g.fillRect(R(sx), R(bot - 2), 24, 3); g.fillStyle = SAND.stream; for (let i = 0; i < 4; i++) g.fillRect(R(sx + 3 + i * 6), R(bot - 2 + ((time * 60 + i * 5) % 6)), 2, 3); }
      if (r.trap) { const shut = r.gate === 'shut'; g.fillStyle = shut ? '#5a4024' : '#140c06'; g.fillRect(R(l), R(bot), w, shut ? ts : 3); if (shut) { g.fillStyle = '#8a6a3a'; for (let x = 0; x < w; x += 8) g.fillRect(R(l + x), R(bot), 1, ts); } }
      if (r.great && K.wheel.done && r.level > 0) { g.globalAlpha = 0.6; g.fillStyle = SAND.stream; const gx = (r.x0 + r.x1) / 2 * ts - cx; g.fillRect(R(gx - 30), R(bot - 3), 60, 6); g.globalAlpha = 1; }
    }
    /* THE LEVERS and their GAUGES (A3: the room's level, OPEN / SHUT) */
    for (const lv of levers()) { const x = px(lv.x) - cx, y = (lv.row + 1) * ts - cy; if (x < -40 || x > vw + 40) continue;
      if (lv.chain) { g.strokeStyle = '#6a6a72'; g.beginPath(); g.moveTo(R(x), R(y - (lv.chain + 1) * ts)); g.lineTo(R(x), R(y - 10)); g.stroke(); for (let k = 0; k < lv.chain; k++) { g.fillStyle = '#9a9aa6'; g.fillRect(R(x - 1), R(y - 14 - k * ts), 3, 3); } }
      const r = lv.r, open = r ? r.gate === 'open' : false, fx = K.fx.find(f => f.kind === 'pull' && Math.abs(f.x - px(lv.x)) < 2);
      g.fillStyle = '#4a3a2a'; g.fillRect(R(x - 4), R(y - 4), 8, 4); g.strokeStyle = lv.arena ? '#ffd36b' : '#c8a060'; g.lineWidth = 2; g.beginPath(); g.moveTo(R(x), R(y - 3)); const a = (open || (fx && fx.t > 0.25)) ? 0.9 : -0.9; g.lineTo(R(x + Math.sin(a) * 12), R(y - 3 - Math.cos(a) * 12)); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#e8c070'; g.fillRect(R(x + Math.sin(a) * 12 - 2), R(y - 3 - Math.cos(a) * 12 - 2), 4, 4);
      if (r) { const k = r.full ? r.level / r.full : 0; g.fillStyle = '#1b1626'; g.fillRect(R(x + 8), R(y - 20), 5, 18); g.fillStyle = SAND.top; g.fillRect(R(x + 9), R(y - 3 - 16 * k), 3, R(16 * k)); ctx.text(open ? 'OPEN' : 'SHUT', R(x + 10), R(y - 26), open ? '#8fd160' : '#ffb060', 'center', 4); }
      if (fx) { g.globalAlpha = fx.t * 2; g.strokeStyle = fx.ok ? '#ffd36b' : '#9aa39a'; g.beginPath(); g.arc(R(x), R(y - 8), 14 + (0.5 - fx.t) * 20, 0, 7); g.stroke(); g.globalAlpha = 1; } }
    /* THE GREAT SAND-GATE's wheel: its turns told on it */
    { const W = K.L.wheel; if (W) { const x = px(W.x) - cx, y = (W.row + 1) * ts - cy - 14; if (x > -40 && x < vw + 40) { g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; g.beginPath(); g.arc(R(x), R(y), 11, 0, 7); g.stroke(); g.lineWidth = 1;
      const a0 = K.wheel.turns * 2.1 + (K.wheel.cd > 0 ? (BCS.wheelCd - K.wheel.cd) * 3 : 0); for (let i = 0; i < 4; i++) { const a = a0 + i * Math.PI / 2; g.strokeStyle = '#c8a060'; g.beginPath(); g.moveTo(R(x), R(y)); g.lineTo(R(x + Math.cos(a) * 11), R(y + Math.sin(a) * 11)); g.stroke(); }
      g.fillStyle = '#4a3a2a'; g.fillRect(R(x - 3), R(y + 8), 6, 6); ctx.text(K.wheel.done ? 'OPEN' : K.wheel.turns + '/' + (W.turns || 3), R(x), R(y - 20), K.wheel.done ? '#8fd160' : '#ffd36b', 'center', 5); } } }
    /* THE CLOCKWORK VAULT's door: a brass face with five gear sockets (the ones carried, lit) */
    for (const v of K.vault) { if (v.open) continue; const x = v.x * ts - cx, y = v.y0 * ts - cy; if (x < -40 || x > vw + 40) continue; g.fillStyle = '#9a7a3a'; g.fillRect(R(x), R(y), ts, (v.y1 - v.y0 + 1) * ts);
      const got = ctx.questGot(); for (let i = 0; i < v.gears; i++) { g.fillStyle = i < got ? '#ffd36b' : '#3a2a18'; g.fillRect(R(x + 5), R(y + 4 + i * 11), 6, 6); } }
  };
  /* the route glint over everything */
  H.drawOver = (g, cx, cy, time) => { if (!K || !K.glint || !K.glint.show) return; drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), ctx.VW(), ctx.VH(), time); };
  H.drawHud = () => false;
  H.read = () => K && { n: { ...K.n }, rooms: K.rooms.map(r => ({ id: r.id, level: +r.level.toFixed(2), gate: r.gate, rows: r.rows })), wheel: { ...K.wheel }, waiting: K.waiting.length, vault: K.vault.map(v => ({ id: v.id, open: v.open })) };
  return H;
}
