// src/buried-city-hands.js - THE BURIED CITY's HANDS (claude/buriedcity greybox; BURIED CITY 2, claude/buriedcity2, 2026-10-11). src/buried-city.js is the level
// (geometry, the rooms, the falls, the cast); this is the rule in the world: THE SAND ROOMS (their sand written into the grid as T.SOFT a row at a time, rising
// under a hero and carrying him up, running out through an open floor-gate), THE SINKING STREET (a room whose sand carries a DECK - a street, its roofs, a
// minaret stub and a dome - written on the sand's top: it goes down when the room drains and up when it fills, and whatever stands on it with it), THE SAND-
// FALLS (a fall from a crack in the roof that a CHUTE lever swings between two places: where it lands a HEAP piles up a row a beat, or it feeds a room; a hero
// in it is beaten down - he cannot rise in it - and a construct in it is JAMMED), THE SAND-GATE LEVERS (E: open / shut; a chain lever is pulled anywhere on its
// length), THE HOURGLASS (an open upper bulb runs INTO the lower one), THE TRAP HALL (its floor-gate IS its floor; fed by the fall), THE GREAT SAND-GATE (three
// turns of the wheel drain the Drowned Quarter; the foes under its sand stand up when it has gone off them), the constructs JAMMED by moving sand
// (src/construct.js: x2 while jammed), THE CLOCKWORK VAULT (five gears), the throne room's levers (they tell THE HOURGLASS KING, src/hourglass-king-hands.js),
// THE SUN in the roof's shafts only (sunAt: L.sun), the glint and the 10 s nudge on every route need (src/stuck-spots.js STUCK_HANDS.buriedcity), the walker's
// hints (BK.walkHint), and the drawing (PLACEHOLDER shapes until the art pass: the deck's houses, the chutes, the falls, the heaps, the city's footing kinds).
// THE RULE'S STATE IS DRAWN (A3): the sand body itself (and the loose row rising on it), the streams from the roof while a room fills, the slot running while
// it drains, the fall and where its chute points, a GAUGE on every lever (the room's level, and OPEN / SHUT on it; a chute lever names where the fall lands).
// main.js calls: on, reset, update, interact, waits, world, takeConstruct, drawWorld, drawOver, drawStructure, noSun, read, state, walkHint, handsState.
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';
import { STUCK_HANDS } from './stuck-spots.js';
import * as SET from './redraw/buried_city_set.js'; import * as RUL from './redraw/buried_city_rule.js';
import { makeFlip } from './buried-city-flip.js'; import * as FART from './redraw/buried_city_flip_art.js';   /* THE FLIP (claude/buriedcity3): the hourglasses you strike, the roofs they raise, THE SAND SEA */

export const BCS = { dropBite: 0.27, leverR: 20, leverH: 22, wheelR: 26, wheelCd: 0.7, cdLever: 0.5, jamT: 2.4, jamMul: 2.0, vaultR: 30, liftPad: 2, fallBeat: 130, fallPad: 4 };
const SAND = SET.SAND; SAND.loose = SAND.loose || 'rgba(232,204,138,0.45)';
const RULE_SAID = { first: 1, granary: 1, street: 1, cellar: 1, upperbulb: 1, yard: 1, shaft: 1, trap: 1 };   /* the rooms whose lever says what it does there, on the first look */

export function makeBuriedCityHands(ctx) {
  let K = null;
  const H = {};
  let FL = null;   /* THE FLIP (src/buried-city-flip.js), made on the first reset (it needs the hands' unburyIn) */
  const TS = () => ctx.TS, T = () => ctx.T;
  const once = k => { if (K.said[k]) return false; K.said[k] = 1; return true; };
  const number = (x, y, t, col) => ctx.number(x, y, t, col || '#ffd36b');   /* (every teaching line is a src/hint-lines.js line: tools/hint-shown.mjs reads these calls) */
  /* the first look at each room's lever: what it does there (literal number() calls, so tools/hint-shown.mjs reads them) */
  const sayRule = (id, x, y) => {
    if (id === 'first') number(x, y, 'THE SAND-GATE: OPEN, THE ROOM DRAINS'); else if (id === 'granary') number(x, y, 'SHUT THE GATE: THE SAND CARRIES YOU UP'); else if (id === 'cellar') number(x, y, 'SHUT THE GATE: THE SAND COVERS THE STAKES');
    else if (id === 'upperbulb') number(x, y, 'THE HOURGLASS: THIS HALL RUNS DOWN INTO THE NEXT'); else if (id === 'shaft') number(x, y, 'SHUT THE GATE: RIDE THE SAND UP THE SHAFT'); else if (id === 'trap') number(x, y, 'SHUT THE FLOOR-GATE: THE HALL FILLS');
    else if (id === 'yard') number(x, y, 'AN OPEN FLOOR-GATE IS A DROP: SHUT IT AND THE SAND BRIDGES IT'); else if (id === 'street') number(x, y, 'THE STREET STANDS ON THE SAND: OPEN ITS GATE AND IT SINKS'); };
  H.on = () => !!K;
  H.state = () => K;
  /* THE SUN IS THE DUNES' AND THE SHAFTS' ONLY: the city is under its sand roof (rooms ten and more rows tall - sunstroke.js's 5-row roof read cannot see it), so
     the sun reaches only the columns L.sun names (the dunes, and the holes where the roof has fallen in) - there the shared drain (src/sun-hands.js) runs as on
     any desert road, and a solid thing over your head is still shade */
  H.sunAt = x => !!K && (K.L.sun || []).some(z => x >= z.x0 * TS() && x < (z.x1 + 1) * TS());
  H.noSun = x => !!K && !H.sunAt(x);

  /* ---------- RESET: a fresh load builds the rooms; a respawn puts every small room back as it was built and keeps THE GREAT SAND-GATE as it was left ---------- */
  const deckUp = r => (r.deck ? 1 + Math.max(0, ...r.deck.map(c => -c[3])) : 0);   /* rows the deck (and what stands on it) takes over the sand's top */
  const span = r => r.full + deckUp(r);
  H.reset = () => {
    const L = ctx.L; if (!L || !L.buriedcity) { K = null; return; }
    const fresh = !K || K.L !== L;
    if (fresh) K = { L, said: {}, clock: 0, loopOpen: false, wheel: { turns: 0, cd: 0, done: false }, vault: (L.vaultDoors || []).map(v => ({ ...v, open: false })),
      n: { pulls: 0, opens: 0, shuts: 0, fills: 0, drains: 0, lifts: 0, jams: 0, turns: 0, nudges: 0, risen: 0, full: 0, kingPulls: 0, swings: 0, heaped: 0, beaten: 0, sunk: 0, wasted: 0 } };
    /* the cells under each room's sand (and over it, where a deck rides) AS BUILT: taken once on a fresh load (the grid is every room drained then) - a respawn's grid still holds the sand */
    if (fresh) K.bases = Object.fromEntries((L.rooms || []).map(r => [r.id, Array.from({ length: span(r) }, (_, k) => { const y = r.floor - 1 - k, row = []; for (let x = r.x0; x <= r.x1; x++) row.push(ctx.cellGet(x, y)); return row; })]));
    K.rooms = (L.rooms || []).map(r => { const keep = !fresh && r.great && K.wheel.done;
      return { ...r, level: keep ? 0 : r.init === 'full' ? r.full : 0, gate: keep ? 'open' : r.init === 'full' || r.id === 'lowerbulb' ? 'shut' : 'open', rows: -1, cd: 0, moving: 0, base: K.bases[r.id], said: false }; });
    if (!fresh && !K.wheel.done) K.wheel.turns = 0;
    for (const r of K.rooms) { if (r.great && !fresh && !K.wheel.done) r.drain = 0; write(r, true); }
    /* THE FALLS: back to where they were laid, and every heap flat again (its cells as built) */
    if (fresh) K.heapBase = {};
    if (K.chutes) for (const c of K.chutes) for (const [tk, t] of Object.entries(c.to)) if (t.kind === 'mound') heapWrite(c, tk, t, 0, true);
    K.chutes = (L.chutes || []).map(c => ({ ...c, to: JSON.parse(JSON.stringify(c.to)), at: c.at, heap: {}, cd: 0, said: false }));
    for (const c of K.chutes) for (const [tk, t] of Object.entries(c.to)) if (t.kind === 'mound') { c.heap[tk] = { h: 0, rows: 0 }; heapWrite(c, tk, t, 0, true); }
    K.waiting = (L.ents || []).map((e, k) => ({ e, k })).filter(q => q.e.sandWait && H.waits(q.e));
    { const arr = ctx.lights ? ctx.lights() : null; if (arr) { for (let i = arr.length - 1; i >= 0; i--) if (arr[i].bc) arr.splice(i, 1); for (const lp of (L.lamps || [])) arr.push({ x: lp.x * TS() + 8, y: lp.y * TS() + (lp.kind === 'brazier' ? 2 : 4), r: lp.kind === 'brazier' ? 64 : 44, torch: true, bare: true, warm: true, bc: true }); } }   /* (the lamps are lights the game blooms) */
    K.glint = null; K.stalls = {}; K.stallKey = null; K.fx = []; K.leverFx = {};
    if (!FL) FL = makeFlip({ ctx, number, once, unburyIn: (a, b, r) => unburyIn(a, b, r) }); FL.reset(K, fresh); H.flip = FL;
    for (const pp of ctx.players) { pp.bcJam = 0; pp.bcFall = 0; }
    if (typeof window !== 'undefined' && window.BK) Object.assign(window.BK, { buriedCity: () => K, buriedCityHands: () => H, walkHint: () => H.walkHint(ctx.hero()), flipAll: () => FL && FL.flipAll(), flip: () => FL && FL.read() });
  };
  /* a placed foe under the sand (sandWait: a room id): it is not spawned while that room's sand is over it - the hands stand it up when it has gone */
  H.waits = e => { if (!e || !e.sandWait) return false; if (!K || K.L !== ctx.L) return true; const r = K.rooms && K.rooms.find(q => q.id === e.sandWait); if (!r) return true; return sandTopRow(r) <= e.y; };
  const roomOf = id => K.rooms.find(r => r.id === id);
  const chuteOf = id => K.chutes.find(c => c.id === id);
  const sandRows = r => Math.max(0, Math.min(r.full, Math.floor(r.level + 1e-6)));
  const sandTopRow = r => r.floor - sandRows(r);   /* the row the sand's top surface is (a hero on it stands on row-1) */
  const deckRow = r => sandTopRow(r) - 1;          /* THE SINKING STREET: the street's own row, on the sand's top */
  const px = x => x * TS() + 8;
  const tileOf = name => T()[name];
  /* the deck's cells, at deck row d: the street wall to wall, and its roofs, stub and dome over it */
  const deckAt = (r, x, y, d) => { if (y === d) return T().SOLID; for (const [t, a, b, dy0, dy1] of r.deck) if (x >= a && x <= b && y >= d + dy0 && y <= d + dy1) return tileOf(t); return null; };
  /* write a room's sand into the grid: rows 0..n-1 above its floor are sand (T.SOFT), the rest as built; a TRAP's floor-gate is its floor (solid while shut);
     a DECK rides the sand's top */
  function write(r, force) {
    const n = sandRows(r), T0 = T();
    if (r.trap) { const shut = r.gate === 'shut'; if (force || r.plateShut !== shut) { r.plateShut = shut; for (let x = r.x0; x <= r.x1; x++) ctx.cellSet(x, r.floor, shut ? T0.SOLID : T0.AIR); } }
    if (!force && n === r.rows) return;
    const was = r.rows; r.rows = n;
    const d = r.deck ? r.floor - n - 1 : null;
    for (let k = 0; k < span(r); k++) { const y = r.floor - 1 - k, row = r.base[k];
      for (let x = r.x0; x <= r.x1; x++) { let t = k < n ? T0.SOFT : row[x - r.x0]; if (r.deck && k >= n) { const dk = deckAt(r, x, y, d); if (dk !== null) t = dk; } ctx.cellSet(x, y, t); } }
    if (r.deck) { if (was >= 0 && n !== was) K.n.sunk += was > n ? 1 : 0; unburyIn(r.x0, r.x1, r); }
    else if (n > was || force) lift(r);
  }
  /* THE SAND CARRIES YOU UP: a body inside the new sand stands on its top (a construct carried is JAMMED: grit in its gears) */
  function lift(r) {
    const top = sandTopRow(r) * TS(), l = r.x0 * TS(), rr = (r.x1 + 1) * TS(), bottom = r.floor * TS();
    for (const pp of ctx.players) { if (pp.dead) continue; if (pp.x > l - 2 && pp.x < rr + 2 && pp.y > top && pp.y - (pp.h || 14) < bottom) { pp.y = top; if (pp.vy > 0) pp.vy = 0; K.n.lifts++; } }
    for (const e of ctx.enemies()) { if (!e.alive || e.noGrav || e.boss) continue; if (e.x > l && e.x < rr && e.y > top && e.y - (e.h || 12) < bottom) { e.y = top; e.vy = 0; if (e.st) e.st.y = top;
        if (e.t === 'construct') jam(e, r); } }
  }
  /* A BODY WHOSE FEET ARE IN SOMETHING THE SAND (OR THE DECK, OR A HEAP) PUT THERE stands on top of it: the street rising under you, a heap growing under a foe */
  const filled = t => t !== T().AIR && t !== T().SPIKE;
  function unbury(b, isFoe, r) {
    const ts = TS(), tx = Math.floor(b.x / ts); let fy = Math.floor((b.y - 1) / ts), moved = false;
    for (let i = 0; i < 24 && fy > 0 && filled(ctx.cellGet(tx, fy)); i++) { fy--; moved = true; }
    if (!moved) return false; b.y = (fy + 1) * ts; if (b.vy > 0) b.vy = 0; if (isFoe && b.st) b.st.y = b.y; if (isFoe && b.t === 'construct') jam(b, r); else if (!isFoe) K.n.lifts++; return true; }
  function unburyIn(x0, x1, r) { const l = x0 * TS() - 2, rr = (x1 + 1) * TS() + 2;
    for (const pp of ctx.players) if (!pp.dead && pp.x > l && pp.x < rr) unbury(pp, false, r);
    for (const e of ctx.enemies()) if (e.alive && !e.noGrav && !e.boss && e.x > l && e.x < rr) unbury(e, true, r); }
  function jam(e, r) { if (!(e.bcJam > 0)) { K.n.jams++; const P0 = ctx.hero(); if (P0 && Math.abs(P0.x - e.x) < 260 && Math.abs(P0.y - e.y) < 120 && once('jam')) number(e.x, e.y - 34, 'SAND IN ITS GEARS: IT IS JAMMED', '#8fd160'); } e.bcJam = BCS.jamT; }   /* (told once, and only where you can see it: the trap hall's fall holds its construct from the first frame) */
  H.world = (e, s, w) => { if (e.t === 'construct') w.jam = e.bcJam > 0 ? e.bcJam : 0;
    if (e.cnSkin === 'sandbound') { s.cuts = 0; if (s.mode === 'burrow' || s.mode === 'under') { s.mode = 'walk'; s.t = 0; } } };   /* (claude/buriedcity4) THE SAND-BOUND is bound where it rose: it never burrows off ahead of you */
  /* (claude/buriedcity4) THE SAND-BOUND (brief 2): while its glass runs it is BURIED to the chest - its machine waits (stuck: no step, no blow), a blow lands whole;
     while its glass rests THE SAND HOLDS IT - a blow lands at 0.4 and is told (main.js: the clank and THE SAND HOLDS IT, src/boss-read.js) */
  H.hold = (e, dt) => { if (e.cnSkin !== 'sandbound' || !FL) return false; const b = FL.bound(e) && e.st && e.st.mode !== 'buried';
    if (b && !e.sbBuried) { K.flipN.held++; ctx.burst(e.x, e.y - 4, 12, ['#e6c98a', '#a87a40'], 70, 0.6); const P0 = ctx.hero(); if (P0 && Math.abs(P0.x - e.x) < 260 && once('boundBuried')) number(e.x, e.y - 34, 'BURIED TO THE CHEST: IT CANNOT MOVE', '#8fd160'); }
    if (!b && e.sbBuried) ctx.burst(e.x, e.y - 8, 10, ['#e6c98a', '#a87a40'], 80, 0.5);
    e.sbBuried = b; if (b) { e.st.frame = 8; e.frame = 8; } return b; };
  H.takeSandBound = e => { if (!FL) return 1; const k = FL.boundTake(e); if (k < 1) { K.flipN.glanced++; const P0 = ctx.hero(); if (P0 && once('boundHolds')) number(e.x, e.y - 44, 'THE SAND HOLDS IT: TURN ITS GLASS', '#ffd36b'); } return k; };
  /* a JAMMED construct takes a blow twice over (told once) */
  H.takeConstruct = (e, dmg) => { if (e.st && e.st.mode === 'jammed') { if (!e.bcJamSaid) { e.bcJamSaid = 1; number(e.x, e.y - 30, 'JAMMED: IT CANNOT GUARD', '#8fd160'); } return dmg * BCS.jamMul; } return dmg; };

  /* ---------- THE SAND-FALLS: where the chute points, a heap piles up (or a room is fed); a hero in the fall is beaten down ---------- */
  /* a HEAP's cells, rows 1..rows over its floor (sand), the rest as built */
  function heapWrite(c, tk, t, rows, force) {
    const key = c.id + '.' + tk; if (!K.heapBase[key]) K.heapBase[key] = t.rungs.map(([j, a, b]) => { const row = []; for (let x = a; x <= b; x++) row.push(ctx.cellGet(x, t.floor - j)); return row; });
    const base = K.heapBase[key];
    t.rungs.forEach(([j, a, b], i) => { for (let x = a; x <= b; x++) { const want = j <= rows ? T().SOFT : base[i][x - a]; if (force || ctx.cellGet(x, t.floor - j) !== want) ctx.cellSet(x, t.floor - j, want); } });
  }
  const heapMax = t => Math.max(...t.rungs.map(r => r[0]));
  const heapTopAt = (t, rows, x) => { let top = t.floor; for (const [j, a, b] of t.rungs) if (j <= rows && x >= a && x <= b) top = Math.min(top, t.floor - j); return top; };
  /* where the fall's column ends (px): the heap's top, the fed room's sand (or the void under an open floor-gate), the floor or the street */
  const fallBottom = c => { const t = c.to[c.at], ts = TS();
    if (t.kind === 'mound') return heapTopAt(t, c.heap[c.at].rows, Math.floor((t.x0 + t.x1) / 2)) * ts;
    if (t.kind === 'room') { const q = roomOf(t.room); if (!q) return ctx.L.H * ts; return q.trap && q.gate === 'open' && sandRows(q) === 0 ? ctx.L.H * ts + 32 : sandTopRow(q) * ts; }
    return t.floor * ts; };
  const fallBox = c => { const t = c.to[c.at], ts = TS(); return { l: t.x0 * ts - BCS.fallPad, r: (t.x1 + 1) * ts + BCS.fallPad, t: (c.roof + 1) * ts, b: fallBottom(c) }; };
  const feeds = r => !!(r.fedBy && K.chutes) && K.chutes.some(c => c.id === r.fedBy && c.to[c.at].kind === 'room' && c.to[c.at].room === r.id);
  function stepFalls(dt) {
    for (const c of K.chutes) {
      c.cd = Math.max(0, c.cd - dt); const tk = c.at, t = c.to[tk];
      if (t.kind === 'mound') { const hp = c.heap[tk], max = heapMax(t); if (hp.h < max) { hp.h = Math.min(max, hp.h + t.rate * dt); const rows = Math.floor(hp.h + 1e-6);
          if (rows !== hp.rows) { hp.rows = rows; heapWrite(c, tk, t, rows, false); unburyIn(Math.min(...t.rungs.map(q => q[1])), Math.max(...t.rungs.map(q => q[2])), null);
            if (rows >= max) { K.n.heaped++; const P0 = ctx.hero(); if (P0 && Math.abs(P0.x - px(t.x0)) < 400 && once('heap' + c.id)) number(P0.x, P0.y - 34, 'THE HEAP IS UP TO THE ARCH: SWING THE FALL BACK OFF IT', '#8fd160'); } } } }
      if (t.kind === 'room') { const q = roomOf(t.room); if (q && q.trap && q.gate === 'open') { const P0 = ctx.hero(); if (P0 && Math.abs(P0.x - px(t.x0)) < 260) { K.n.wasted += dt; if (once('wasted' + c.id)) number(P0.x, P0.y - 34, 'THE SAND FALLS THROUGH THE OPEN FLOOR-GATE INTO THE DARK', '#ff9a5c'); } } }
      /* IN THE FALL: beaten down (no rising - no blow, no damage); a construct in it is JAMMED */
      const B = fallBox(c);
      for (const pp of ctx.players) { if (pp.dead) continue; if (pp.x > B.l && pp.x < B.r && pp.y > B.t && pp.y - (pp.h || 14) < B.b) { if (!(pp.vy >= BCS.fallBeat)) pp.vy = BCS.fallBeat; if (!(pp.bcFall > 0)) K.n.beaten++; pp.bcFall = 0.2;
          if (pp === ctx.hero() && once('beaten')) number(pp.x, pp.y - 34, 'THE SAND-FALL BEATS YOU DOWN: SWING IT AWAY', '#ffd36b'); } else pp.bcFall = Math.max(0, (pp.bcFall || 0) - dt); }
      for (const e of ctx.enemies()) if (e.alive && e.t === 'construct' && e.x > B.l && e.x < B.r && e.y > B.t && e.y - (e.h || 12) < B.b + 2) jam(e, null);
    }
  }

  /* ---------- THE LEVERS, THE CHUTES, THE WHEEL, THE VAULT (E) ---------- */
  const levers = () => { const out = []; for (const r of K.rooms) for (const [x, row, chain] of (r.levers || [])) out.push({ r, x, row, chain: chain || 0 });
    for (const c of K.chutes) for (const [x, row] of c.levers) out.push({ r: null, x, row, chain: 0, chute: c });
    for (const a of (K.L.arenaLevers || [])) out.push({ r: null, x: a.x, row: a.row, chain: 0, arena: a.id }); return out; };
  const atLever = (P, lv) => Math.abs(px(lv.x) - P.x) <= BCS.leverR && P.y <= (lv.row + 1) * TS() + 4 && P.y >= (lv.row + 1 - Math.max(1, lv.chain) - 1) * TS() - 6;
  H.interact = P => {
    if (!K || P.dead) return false; const ts = TS();
    const lv = levers().find(q => atLever(P, q)); if (lv) { pull(lv, P); return true; }
    if (FL && FL.interact(P)) return true;   /* (claude/buriedcity3) E turns an hourglass too (a blow strikes it: src/buried-city-flip.js) */
    const W = K.L.wheel; if (W && Math.abs(px(W.x) - P.x) <= BCS.wheelR && Math.abs((W.row + 1) * ts - P.y) <= 18) { turnWheel(P); return true; }
    const LD = K.L.loopDoor; if (LD && Math.abs(px(LD.lever[0]) - P.x) <= BCS.leverR && Math.abs((LD.lever[1] + 1) * ts - P.y) <= 20) { openLoop(P); return true; }   /* (claude/buriedcity4) THE OLD STREET's sand-gate, from the courtyard */
    const v = K.vault.find(q => !q.open && Math.abs(q.x * ts + 8 - P.x) <= BCS.vaultR && P.y > q.y0 * ts && P.y <= (q.y1 + 2) * ts);
    if (v) { if (ctx.questGot() >= v.gears) openVault(v); else number(P.x, P.y - 34, 'THE CLOCKWORK VAULT WANTS FIVE GEARS', '#9aa39a'); return true; }
    return false;
  };
  function pull(lv, P) {
    const key = lv.arena || (lv.chute ? 'chute' + lv.chute.id : lv.r.id + lv.x); if ((K.leverFx[key] || 0) > K.clock) return; K.leverFx[key] = K.clock + BCS.cdLever; K.n.pulls++; ctx.sfx.clank && ctx.sfx.clank();
    if (lv.arena) { K.n.kingPulls++; const v = ctx.bossLever ? ctx.bossLever(px(lv.x)) : 'busy'; K.fx.push({ kind: 'pull', x: px(lv.x), y: (lv.row + 1) * TS(), t: 0.5, ok: v === 'stall' }); return; }
    if (lv.chute) { swing(lv.chute, P); K.fx.push({ kind: 'pull', x: px(lv.x), y: (lv.row + 1) * TS(), t: 0.5, ok: true }); return; }
    const r = lv.r; r.gate = r.gate === 'open' ? 'shut' : 'open'; K.fx.push({ kind: 'pull', x: px(lv.x), y: (lv.row + 1) * TS(), t: 0.5, ok: true });
    if (r.gate === 'open') { K.n.opens++; number(P.x, P.y - 34, r.trap ? 'THE FLOOR-GATE OPENS: THE HALL DRAINS INTO THE DARK' : r.into ? 'THE GATE OPENS: THE SAND RUNS DOWN INTO THE NEXT HALL' : r.deck ? 'THE GATE IS OPEN: THE STREET GOES DOWN WITH THE SAND' : 'THE GATE IS OPEN: THE ROOM DRAINS', '#ffd36b'); ctx.sfx.gateLift && ctx.sfx.gateLift(); if (r.deck) ctx.shake(3); }
    else { K.n.shuts++; number(P.x, P.y - 34, r.trap ? (r.fedBy && !feeds(r) ? 'THE FLOOR-GATE SHUTS: NOW SWING THE SAND-FALL INTO THE HALL' : 'THE FLOOR-GATE SHUTS: THE HALL FILLS') : 'THE GATE IS SHUT: THE SAND RISES', '#ffd36b'); ctx.sfx.gateDrop && ctx.sfx.gateDrop(); }
    if (r.trap) write(r, false);
  }
  function swing(c, P) {
    if (c.cd > 0) return; c.cd = 0.4; c.at = c.other[c.at]; K.n.swings++; ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.shake(2);
    const t = c.to[c.at];
    number(P.x, P.y - 34, t.kind === 'mound' ? 'THE CHUTE SWINGS: BY THE WALL THE SAND PILES UP' : t.kind === 'room' ? 'THE CHUTE SWINGS: THE FALL POURS INTO THE HALL' : t.kind === 'grate' ? 'THE CHUTE SWINGS: THE FALL RUNS AWAY THROUGH THE GRATE' : 'THE CHUTE SWINGS: THE FALL LANDS ON THE LIP', '#ffd36b');
  }
  function turnWheel(P) {
    const W = K.wheel, r = roomOf('great'); if (!r) return;
    if (W.done) { number(P.x, P.y - 34, 'THE GREAT GATE IS OPEN', '#9aa39a'); return; }
    if (W.cd > 0) return; W.cd = BCS.wheelCd; W.turns++; K.n.turns++; ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.shake(2 + W.turns);
    r.gate = 'open'; r.drain = [0, 1.0, 2.0, 4.0][Math.min(3, W.turns)];
    if (W.turns >= (K.L.wheel.turns || 3)) { W.done = true; number(P.x, P.y - 34, 'THE GREAT SAND-GATE IS OPEN: THE QUARTER DRAINS', '#8fd160'); ctx.shake(6); ctx.sfx.boom && ctx.sfx.boom(); }
    else number(P.x, P.y - 34, `THE GREAT GATE OPENS A NOTCH (${W.turns}/${K.L.wheel.turns || 3})`, '#ffd36b');
  }
  /* (claude/buriedcity4, brief 10) THE LOOP BACK TO A SHRINE: the old street's sand-gate opens from the courtyard, and stays open (a respawn keeps the grid) */
  function openLoop(P) { const LD = K.L.loopDoor; if (K.loopOpen) { number(P.x, P.y - 34, 'THE OLD STREET IS OPEN: A WAY BACK TO THE SHRINE', '#9aa39a'); return; } K.loopOpen = true; K.n.loop = 1;
    for (let y = LD.y0; y <= LD.y1; y++) { ctx.cellSet(LD.x, y, T().AIR); ctx.burst(px(LD.x), y * TS() + 8, 4, ['#e6c98a', '#a87a40'], 60, 0.6); }
    ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.shake(3); number(P.x, P.y - 34, 'THE SAND-GATE OPENS: THE OLD STREET RUNS BACK TO THE SHRINE', '#8fd160'); }
  function openVault(v) { v.open = true; const ts = TS(); for (let y = v.y0; y <= v.y1; y++) { ctx.cellSet(v.x, y, T().AIR); ctx.burst(v.x * ts + 8, y * ts + 8, 3, ['#d9b36a', '#8a6a3a'], 40, 0.5); } ctx.sfx.gateLift && ctx.sfx.gateLift(); number(v.x * ts, v.y0 * ts - 20, 'THE CLOCKWORK VAULT OPENS', '#8fd160'); }

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!K) return; K.clock += dt; const P0 = ctx.hero();
    K.wheel.cd = Math.max(0, K.wheel.cd - dt);
    for (const f of K.fx) f.t -= dt; K.fx = K.fx.filter(f => f.t > 0);
    for (const e of ctx.enemies()) if (e.bcJam > 0) e.bcJam = Math.max(0, e.bcJam - dt);
    /* THE SAND: an open gate drains its room (THE HOURGLASS: into the next); a shut gate with a pour (or a fall that feeds it) fills it */
    for (const r of K.rooms) {
      const lv0 = r.level;
      if (r.gate === 'open' && r.level > 0) { r.level = Math.max(0, r.level - r.drain * dt); if (r.level === 0) K.n.drains++;
        if (r.into) { const q = roomOf(r.into); if (q) q.level = Math.max(q.level, q.full * (1 - r.level / r.full)); } }
      else if (r.gate === 'shut' && (r.pour || feeds(r)) && r.level < r.full) { r.level = Math.min(r.full, r.level + r.fill * dt); if (r.level >= r.full) K.n.full++; }
      r.moving = r.level !== lv0 ? 0.6 : Math.max(0, r.moving - dt);
      write(r, false);
      /* a construct standing on moving sand (or on the moving street) is jammed (grit in its gears) */
      if (r.moving > 0 && sandRows(r) > 0 || (r.deck && r.moving > 0)) { const top = (r.deck ? deckRow(r) - deckUp(r) : sandTopRow(r)) * TS(), bot = sandTopRow(r) * TS() + 6;
        for (const e of ctx.enemies()) if (e.alive && e.t === 'construct' && e.x > r.x0 * TS() && e.x < (r.x1 + 1) * TS() && e.y > top - 6 && e.y < bot) jam(e, r); }
    }
    for (const r of K.rooms) { const q = r.into && roomOf(r.into); if (q && q.level !== q._lv) { q._lv = q.level; q.moving = 0.6; write(q, false); } }
    stepFalls(dt);
    if (FL) FL.update(dt);   /* THE FLIP: the glasses run, the roofs rise and sink, the banks run out, the dune falls flow up, THE SAND SEA swallows */
    /* THE DROWNED QUARTER's foes stand up out of the sand when it has gone off them */
    if (K.waiting.length) for (let i = K.waiting.length - 1; i >= 0; i--) { const q = K.waiting[i]; if (H.waits(q.e)) continue; K.waiting.splice(i, 1); K.n.risen++;
      const made = ctx.spawnEnt ? ctx.spawnEnt(q.e, q.k) : null; if (made) ctx.burst(made.x, made.y - 6, 10, ['#d8b070', '#a87a40'], 60, 0.6); }
    /* THE FIRST LOOK at a thing: a line once (what it is) */
    if (P0 && !P0.dead) { const near = (x, y, r) => Math.abs(x - P0.x) < r && Math.abs(y - P0.y) < 70;
      for (const r of K.rooms) { const lv = (r.levers || [])[0]; if (lv && RULE_SAID[r.id] && near(px(lv[0]), (lv[1] + 1) * TS(), 70) && once('room' + r.id)) sayRule(r.id, P0.x, P0.y - 34); }
      for (const c of K.chutes) { const lv = c.levers[0]; if (lv && near(px(lv[0]), (lv[1] + 1) * TS(), 80) && once('chute' + c.id)) number(P0.x, P0.y - 34, 'A SAND-FALL: E SWINGS ITS CHUTE', '#ffd36b'); }
      const W = K.L.wheel; if (W && near(px(W.x), (W.row + 1) * TS(), 90) && once('wheel')) number(P0.x, P0.y - 34, 'THE GREAT SAND-GATE: E TURNS THE WHEEL', '#ffd36b'); }
    dropBack(P0);
    stall(P0, dt);
  };
  /* THE FOUNDRY'S FLOOR-GATE (A10 base): the TEACH of the trap hall - a hero who drops through the small open floor-gate lands three rows down, and it costs him
     about a quarter of his health (never the last point: this one is not the end) and puts him back on the lip he came from, told */
  function dropBack(P) {
    if (!P || P.dead) return; const ts = TS();
    for (const r of K.rooms) { if (!r.teach || r.gate !== 'open') continue;
      if (P.x <= r.x0 * ts || P.x >= (r.x1 + 1) * ts || P.y < r.floor * ts) continue;
      const bite = Math.min(Math.round((P.maxHp || 100) * BCS.dropBite), Math.max(0, P.hp - 1)); if (bite > 0) { P.hp -= bite; P.hurt = 0.25; ctx.number(P.x, P.y - 20, '-' + bite, '#ff6b6b'); }
      const lip = (P.face || 1) > 0 ? r.lips[0] : r.lips[1]; P.x = px(lip); P.y = (r.floor - r.full) * ts; P.vx = 0; P.vy = 0; P.inv = Math.max(P.inv || 0, 1);
      K.n.drops = (K.n.drops || 0) + 1; ctx.sfx.pHurt && ctx.sfx.pHurt(); ctx.shake(3);
      number(P.x, P.y - 34, 'THE OPEN FLOOR-GATE DROPS YOU: BACK TO THE LIP', '#ff9a5c'); return; } }

  /* ---------- A PLAYER'S HANDS AT THE RULE'S LOCKS (tools/level-walk.mjs asks BK.walkHint(): where a player goes next and what he presses there) ----------
     { x, y, key: 'talk'|null, face, r?, wait? } in world px, or null (nothing to work here) */
  H.walkHint = P => {   /* (grid rows: src/buried-city.js lays the city one row lower than its logical rows - DY) */
    if (!K || !P || P.dead) return null; const ts = TS(), c = P.x / ts, feet = Math.floor((P.y - 1) / ts);
    const here = (x, row, key, face, extra) => Object.assign({ x: x * ts + 8, y: (row + 1) * ts, key, face: face || 0 }, extra || {});
    const r0 = roomOf('first'); if (r0 && r0.level > 2 && c > 50 && c < 62) return here(58, 36, r0.gate === 'shut' ? 'talk' : null, 1, { r: 10 });
    const g = roomOf('granary'); if (g && c > 139 && c < 156 && feet > 25) { if (g.gate === 'open') return here(144, 36, 'talk', 1); return Object.assign(here(Math.min(155, Math.max(146, Math.round(c))), sandTopRow(g) - 1, null, 1), { r: 40, wait: true }); }
    /* THE SINKING STREET: across it to the chain by the arch, pull it, and ride the street down */
    const st = roomOf('street'); if (st && st.level > 0.05 && c > 194 && c < 234) { const d = deckRow(st), fr = feet >= d - 6 && feet <= d - 1 ? feet : d - 1; return here(232, fr, st.gate === 'shut' ? 'talk' : null, 1, { r: 42, wait: st.gate === 'open' }); }   /* (r 42: the walker heeds a hint only within r tiles - the chain is across the street) */
    const ce = roomOf('cellar'); if (ce && c > 236 && c < 246 && ce.level < ce.full - 0.05) return here(242, 38, ce.gate === 'open' ? 'talk' : null, 1, { r: 10, wait: ce.gate === 'shut' });
    const ub = roomOf('upperbulb'); if (ub && ub.level > 2 && c > 270 && c < 282) return here(278, 32, ub.gate === 'shut' ? 'talk' : null, 1, { r: 10, wait: ub.gate === 'open' });
    /* THE SAND-FALL: swing it onto the wall, wait for the heap, swing it back, climb */
    const sl = K.chutes && chuteOf('sluice'); if (sl && c > 412 && c < 452 && feet > 34) { const hp = sl.heap.wall, full = hp && hp.rows >= heapMax(sl.to.wall);
      if (!full && sl.at === 'grate') return here(417, 42, 'talk', 1, { r: 10 });
      if (!full) return here(434, 42, null, 1, { r: 30, wait: true });
      if (sl.at === 'wall') return here(438, 42, 'talk', 1, { r: 10 }); }
    const gr = roomOf('great'); if (gr && !K.wheel.done && c > 467 && c < 483) return here(K.L.wheel.x, K.L.wheel.row, K.wheel.cd > 0 ? null : 'talk', 1, { r: 10 });
    if (gr && gr.level > 3 && c > 467 && c < 483) return here(480, 36, null, 1, { r: 12, wait: true });
    const yd = roomOf('yard'); if (yd && c > 561 && c < 570 && feet <= 44 && yd.level < yd.full - 0.05) return here(568, 44, yd.gate === 'open' ? 'talk' : null, 1, { r: 10, wait: yd.gate === 'shut' });
    const sh = roomOf('shaft'); if (sh && c > 585 && c < 598 && feet > 31) { if (sh.gate === 'open') return here(588, 44, 'talk', 1); return Object.assign(here(Math.min(597, Math.max(594, Math.round(c))), sandTopRow(sh) - 1, null, 1), { r: 40, wait: true }); }
    /* THE TRAP HALL: shut its floor-gate, swing the fall in, wait for the fill */
    const tr = roomOf('trap'), tf = K.chutes && chuteOf('trapfall'); if (tr && c > 605 && c < 618 && tr.level < tr.full - 0.05) {
      if (tr.gate === 'open') return here(616, 32, 'talk', 1, { r: 10 });
      if (tf && tf.at !== 'hall') return here(610, 32, 'talk', -1, { r: 10 });
      return here(616, 32, null, 1, { r: 10, wait: true }); }
    /* THE FLIP (claude/buriedcity3): before a glass the route needs - turn it (E); THE FALL running - into it, and it carries you to the high dune */
    if (K.glasses) for (const gq of K.glasses) { const z = GLASS_ZONES[gq.id]; if (!z || c < z[0] || c > z[1] || feet < z[2] || feet > z[3]) continue;
      if (gq.t <= 0) return here(gq.x, gq.y, 'talk', 1, { r: 12 });
      { const f = K.dfalls.find(q => q.glass === gq.id); if (f) return here(f.x1 + 2, f.top - 1, null, 1, { r: 20 }); } }   /* (claude/buriedcity4: every fall that flows up - the glass works' lift too) */
    return null; };
  const GLASS_ZONES = { stair: [96, 107, 33, 36], bank: [306, 313, 29, 32], works1: [348, 351, 30, 33], works2: [361, 367, 24, 27], works3: [370, 377, 13, 16], works4: [383, 388, 8, 11], works5: [398, 400, 19, 22],
    fall: [718, 731, 11, 15], chain1: [743, 753, 3, 7], chain2: [768, 771, 8, 11], exam: [783, 794, 9, 12], court: [811, 820, 30, 33], ante: [822, 825, 30, 33] };   /* (grid rows: where a player stands before each glass) */

  /* ---------- THE GLINT AND THE NUDGE (the route list: src/stuck-spots.js STUCK_HANDS.buriedcity) ---------- */
  const handsState = name => { const [kind, id] = name.split('.');
    if (kind === 'room') { const r = roomOf(id); if (!r) return ''; return r.level >= r.full - 0.05 ? 'full' : r.level <= 0.05 ? 'empty' : r.gate === 'open' ? 'draining' : 'filling'; }
    if (kind === 'wheel') return K.wheel.done ? 'open' : 'shut';
    if (kind === 'vault') { const v = K.vault.find(q => q.id === id); return v ? (v.open ? 'open' : ctx.questGot() >= v.gears ? 'due' : 'shut') : ''; }
    if (kind === 'sluice') { const c = chuteOf(id); if (!c) return ''; const t = c.to.wall, full = c.heap.wall && c.heap.wall.rows >= heapMax(t); return !full ? (c.at === 'wall' ? 'pile' : 'swing') : c.at === 'wall' ? 'back' : 'climb'; }
    if (kind === 'glass') return FL ? FL.state(id) : '';   /* (claude/buriedcity3) an hourglass: idle / running */
    if (kind === 'trap') { const r = roomOf(id); if (!r) return ''; if (r.level >= r.full - 0.05) return 'full'; return r.gate === 'open' ? 'gate' : !feeds(r) ? 'feed' : 'filling'; }
    return ''; };
  H.handsState = n => (K ? handsState(n) : '');
  const kingLever = P => (ctx.kingLit && ctx.kingLit() && P) ? levers().filter(q => q.arena).sort((a, b) => Math.abs(px(a.x) - P.x) - Math.abs(px(b.x) - P.x))[0] || null : null;   /* M5: the nearer throne-room lever while a pull stalls him */
  const stall = (P, dt) => { if (!P || P.dead) return; const ts = TS();
    { const a = kingLever(P); if (a) { K.glint = { key: 'kinglever', x: px(a.x), y: (a.row + 1) * ts, show: true }; K.stallKey = null; return; } }   /* the guide's arrow points at it (B10: with ~1.4 s of slack nobody hunts for the lever) */
    const r = resolve('buriedcity', Math.floor(P.x / ts), Math.floor((P.y - 1) / ts), { TS: ts, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    if (!r) { K.glint = null; K.stallKey = null; return; } const t = r.targets[0]; K.glint = { key: r.key, x: t.x, y: t.y, show: r.glint !== 'stall' };
    const C = K.stalls[r.key] = K.stalls[r.key] || newStall(); if (r.key !== K.stallKey) { K.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, Math.hypot(P.x - t.x, P.y - t.y), dt, K.clock, false)) { K.n.nudges++; K.lastNudge = r.line; K.glint.show = true; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };

  /* ---------- DRAWING (claude/bc2art, the art pass: src/redraw/buried_city_set.js - sand, light, decor, the arch - and src/redraw/buried_city_rule.js - the rule's pieces; the reads - sand,
     streams, slots, falls, gauges, OPEN / SHUT - are unchanged) ---------- */
  const R = Math.round;
  const view = (g, cx, cy, time) => ({ g, cx, cy, vw: ctx.VW(), vh: ctx.VH(), time, L: K.L, T: T() });
  H.drawBack = () => {};   /* (the backdrop and the Hourglass Tower are src/redraw/buried_city_backdrop.js's) */
  /* THE CITY'S FOOTING KINDS (L.structures 'bc*', main.js drawStructures): what holds each ledge up - stepped corbels, a stall's poles, a pipe's brackets, a drum's rubble */
  H.drawStructure = (g, kind, l, r, t, b) => {
    const post = (x, y0, y1, w, a, hi, lo) => { g.fillStyle = a; g.fillRect(R(x), R(y0), w, R(y1 - y0)); g.fillStyle = hi; g.fillRect(R(x), R(y0), 1, R(y1 - y0)); g.fillStyle = lo; g.fillRect(R(x + w - 1), R(y0), 1, R(y1 - y0)); };
    if (kind === 'bcAwning') { post(l + 1, t + 6, b, 3, '#6a4a2a', '#a07a44', '#3a2812'); post(r - 4, t + 6, b, 3, '#6a4a2a', '#a07a44', '#3a2812');
      for (const x of [l + 1, r - 4]) { g.fillStyle = '#c49a38'; g.fillRect(R(x) - 1, R(t + 3), 5, 3); g.fillStyle = '#f0d070'; g.fillRect(R(x) - 1, R(t + 3), 5, 1); g.fillStyle = '#2a1c10'; g.fillRect(R(x), R(b - 3), 3, 3); }
      g.fillStyle = '#d0b27a'; for (let k = 0; k < 3; k++) { g.fillRect(R(l + 4 + k), R(t + 8 + k * 2), 1, 1); g.fillRect(R(r - 5 - k), R(t + 8 + k * 2), 1, 1); } return true; }   /* (poles with brass finials; a tie of rope) */
    if (kind === 'bcPipe') { for (const x of [l + 4, r - 7]) { post(x, t + 5, t + 22, 3, '#4a4458', '#8a849a', '#22202c'); g.fillStyle = '#8a6820'; g.fillRect(R(x) - 2, R(t + 5), 7, 2); g.fillStyle = '#e0b858'; g.fillRect(R(x) - 2, R(t + 5), 7, 1); g.fillStyle = '#b0aabf'; g.fillRect(R(x) + 1, R(t + 12), 1, 1); g.fillRect(R(x) + 1, R(t + 18), 1, 1);
        g.globalAlpha = 0.4; post(x, t + 22, b, 3, '#3a3446', '#6a647a', '#16141c'); g.globalAlpha = 1; } return true; }   /* (iron straps on the wall, bolted; the strut runs on into the dark) */
    if (kind === 'bcBalcony' || kind === 'bcLintel') { for (const [x, s] of [[l, 1], [r - 8, -1]]) { g.fillStyle = '#8a6c48'; g.fillRect(R(x + (s > 0 ? 1 : 0)), R(t + 8), 7, 3); g.fillRect(R(x + (s > 0 ? 1 : 1)), R(t + 11), 5, 3); g.fillRect(R(x + (s > 0 ? 1 : 2)), R(t + 14), 3, 3);   /* the corbel, stepped */
        g.fillStyle = '#c8aa72'; g.fillRect(R(x + (s > 0 ? 1 : 0)), R(t + 8), 7, 1); g.fillRect(R(x + 1), R(t + 11), 5, 1); g.fillStyle = '#3e2c1a'; g.fillRect(R(x + (s > 0 ? 1 : 0)), R(t + 10), 7, 1); g.fillRect(R(x + 1), R(t + 13), 5, 1);
        g.globalAlpha = 0.5; post(x + 2, t + 17, b, 4, '#6e5638', '#a88a5c', '#2a1e14'); g.globalAlpha = 1; } return true; }   /* (and the wall's pilaster under it, fading into the dark) */
    if (kind === 'bcBuried') { b = t + 200; const w = r - l; g.fillStyle = '#7a5a3c'; g.fillRect(R(l + 1), R(t + 10), R(w - 2), R(b - t - 10)); for (let y = t + 10; y < b; y += 8) { g.fillStyle = y % 16 ? '#6a4a30' : '#8e6c48'; g.fillRect(R(l + 1), R(y + 7), R(w - 2), 1); }   /* (claude/bc3art) a building standing up out of THE SAND SEA: plaster courses, a window with a lattice, beam ends, sand creeping in - and the dark deepening as it goes down into the sand */
        g.fillStyle = '#3a2412'; g.fillRect(R(l + 3), R(t + 20), 6, 9); g.fillStyle = '#1a0e08'; g.fillRect(R(l + 4), R(t + 21), 4, 7); g.fillRect(R(l + 5), R(t + 21), 1, 7); g.fillStyle = '#c4a672'; g.fillRect(R(l + 3), R(t + 19), 6, 1); if (w > 36) { g.fillStyle = '#3a2412'; g.fillRect(R(r - 9), R(t + 20), 6, 9); g.fillStyle = '#1a0e08'; g.fillRect(R(r - 8), R(t + 21), 4, 7); g.fillStyle = '#c4a672'; g.fillRect(R(r - 9), R(t + 19), 6, 1); }
        for (let x = l + 6; x < r - 6; x += 16) { g.fillStyle = '#2a1c10'; g.fillRect(R(x), R(t + 33), 8, 3); g.fillStyle = '#5a3e20'; g.fillRect(R(x), R(t + 33), 8, 1); }
        g.fillStyle = '#e0b66c'; g.fillRect(R(l + 1), R(t + 10), R(w - 2), 1); g.fillRect(R(l + 1), R(t + 11), 2, 7); g.fillRect(R(r - 3), R(t + 11), 2, 4); const gr = g.createLinearGradient(0, t + 30, 0, t + 120); gr.addColorStop(0, 'rgba(20,8,2,0)'); gr.addColorStop(1, 'rgba(20,8,2,0.7)'); g.fillStyle = gr; g.fillRect(R(l + 1), R(t + 30), R(w - 2), 90); return true; }
    if (kind === 'bcDrum') { for (const x of [l + 1, r - 12]) { for (let k = 0; k < 3; k++) { g.fillStyle = k & 1 ? '#8a7048' : '#a48a5c'; g.fillRect(R(x + k), R(b - 6 - k * 5), 11 - k * 2, 5); g.fillStyle = '#d8c088'; g.fillRect(R(x + k), R(b - 6 - k * 5), 11 - k * 2, 1); g.fillStyle = '#3e2c1a'; g.fillRect(R(x + k), R(b - 2 - k * 5), 11 - k * 2, 1); }
        g.fillStyle = '#d8b472'; g.fillRect(R(x - 2), R(b - 3), 15, 3); g.fillStyle = '#f4dc9c'; g.fillRect(R(x - 2), R(b - 3), 15, 1); } return true; }   /* (the drum rests on broken blocks, the dune drifted round them) */
    return false; };
  H.drawWorld = (g, cx, cy, time) => {
    if (!K) return; const ts = TS(), vw = ctx.VW(), vh = ctx.VH(), L = K.L, V = view(g, cx, cy, time);
    const vis = (x0, x1) => x1 * ts - cx > -64 && x0 * ts - cx < vw + 64;
    /* (claude/buriedcity4, GREYBOX) THE OLD STREET UNDER THE DUNES: its dark (it runs under the open sky's columns), its lamps are L.lamps; its sand-gate and the gate's lever */
    for (const it of (L.interiors || [])) if (it[4] === 'bcUnder' && vis(it[0], it[1] + 1)) { const x0 = Math.max(it[0], Math.floor(cx / ts) - 1), x1 = Math.min(it[1], Math.ceil((cx + vw) / ts) + 1);
      for (let x = x0; x <= x1; x++) for (let y = it[2]; y <= it[3]; y++) if (ctx.cellGet(x, y) === T().AIR) { g.fillStyle = (x + y) % 7 ? '#241a14' : '#2c2018'; g.fillRect(R(x * ts - cx), R(y * ts - cy), ts, ts); } }
    { const LD = L.loopDoor; if (LD && vis(LD.x - 3, LD.x + 3)) { const dx = R(LD.x * ts - cx), y0 = R(LD.y0 * ts - cy), h = (LD.y1 - LD.y0 + 1) * ts;
      if (!K.loopOpen) { g.fillStyle = '#c8a064'; g.fillRect(dx, y0, ts, h); g.fillStyle = '#8a6a3c'; for (let y = 0; y < h; y += 6) g.fillRect(dx, y0 + y, ts, 1); g.fillStyle = '#5a4428'; g.fillRect(dx, y0 - 3, ts, 3); }
      else { g.fillStyle = '#5a4428'; g.fillRect(dx, y0 - 3, ts, 3); g.fillStyle = '#c8a064'; g.fillRect(dx, y0 + h - 3, ts, 3); }
      const lx = R(LD.lever[0] * ts + 8 - cx), ly = R((LD.lever[1] + 1) * ts - cy); g.fillStyle = '#3a3446'; g.fillRect(lx - 1, ly - 18, 3, 18); g.fillStyle = K.loopOpen ? '#8fd160' : '#ffd36b'; g.fillRect(K.loopOpen ? lx + 2 : lx - 6, ly - 20, 5, 3);
      const P0 = ctx.hero(); if (!K.loopOpen && P0 && Math.abs(P0.x - (lx + cx)) < 40 && Math.abs(P0.y - (ly + cy)) < 30) ctx.text('E: OPEN THE OLD STREET', lx, ly - 30, '#ffd36b', 'center', 4); } }
    if (FL) FL.draw(g, cx, cy, time);   /* THE FLIP's pieces (placeholder art): THE SAND SEA, the risers, the banks, the dune falls, the glasses and their gauges */
    /* THE LIGHT IN THE SHAFTS: slanted god-rays, drifting dust, a lit patch where they reach the floor */
    for (const z of (L.sun || [])) { if (z.x0 < 38 || !vis(z.x0, z.x1 + 1)) continue; if (z.floor === undefined) { let fy = 1; const mx = (z.x0 + z.x1) >> 1; while (fy < L.H - 1 && ctx.cellGet(mx, fy) === T().AIR) fy++; z.floor = fy; } SET.drawShaft(V, z, z.floor); }
    /* THE DECOR: spires, the sinkhole's lip, stalls, houses, domes, the great gate's grille; and (B8) THE KING everywhere - his head in the dune, his statues, his mural, his court */
    for (const d of (L.decor || [])) { const x0 = (d.x0 ?? d.x) * ts - cx; if (x0 > vw + 80 || ((d.x1 ?? d.x) + 1) * ts - cx < -80) continue;
      if (d.kind === 'spire') SET.drawSpire(V, d);
      else if (d.kind === 'awning') { if (d.x0 >= 702) FART.drawRoofAwning(V, d, ts); else SET.drawTornCanopy(V, d); }
      else if (d.kind === 'stall') SET.drawStall(V, d);
      else if (d.kind === 'house') SET.drawHouse(V, d);
      else if (d.kind === 'dome') SET.drawDome(V, d);
      else if (d.kind === 'greatgate') { const gr = roomOf('great'), tn = K.wheel.done ? 1 : K.wheel.turns / (L.wheel.turns || 3) * 0.7; RUL.drawGrate(V, d.x0 * ts, (d.x1 - d.x0 + 1) * ts, d.y * ts, tn, !!(gr && K.wheel.done && gr.level > 0)); }
      else if (d.kind === 'grate') { const c = chuteOf('sluice'); RUL.drawGrate(V, d.x0 * ts, (d.x1 - d.x0 + 1) * ts, d.y * ts, 0, !!(c && c.at === 'grate')); }
      else if (d.kind === 'arch') SET.drawArch(V, { ...d, down: d.x0 < 300 });
      else if (d.kind === 'kinghead') SET.drawKingHead(V, d.x * ts + 8, (d.y + 1) * ts);
      else if (d.kind === 'kingstatue') SET.drawKingStatue(V, d.x * ts + 8, (d.y + 1) * ts, d.h);
      else if (d.kind === 'mural') SET.drawMural(V, d);
      else if (d.kind === 'courtiers') SET.drawCourtiers(V, d);
      else if (d.kind === 'relief') SET.drawRelief(V, d);
      else if (d.kind === 'sinkhole') SET.drawSinkhole(V, d);
      else if (d.kind === 'shell') FART.drawShell(V, d, ts); }
    if ((L.outside || []).length && cx > 632 * ts) { const T0 = T(); FART.drawDressing(V, x => { for (let y = 0; y < L.H - 1; y++) if (ctx.cellGet(x, y) === T0.SOLID && ctx.cellGet(x, y - 1) !== T0.SOLID && y > 3) return y; return -1; }); }   /* (claude/bc3art) what the desert city left on its dunes and roofs */
    /* THE LAMPS: oil lamps and wall braziers, warm light against the sand's cold shadow */
    for (const lp of (L.lamps || [])) SET.drawLamp(V, lp);
    /* THE SAND ROOMS */
    for (const r of K.rooms) {
      const l = r.x0 * ts - cx, w = (r.x1 - r.x0 + 1) * ts; if (l > vw + 16 || l + w < -16) continue;
      const n = sandRows(r), topW = (r.floor - n) * ts, topY = topW - cy, botW = r.floor * ts, bot = botW - cy, frac = r.level - n;
      /* THE TRAP HALL OPEN is a VOID: it darkens to nothing under the lips, sand falls away into it - the end; THE FOUNDRY'S floor-gate (the teach) shows its floor */
      if (r.trap && r.gate === 'open' && n < r.full) { const y0 = (r.floor - r.full) * ts - cy, yb = r.teach ? bot + ts : vh + 40;
        if (!r.teach) { const gr = g.createLinearGradient(0, Math.max(y0, topY), 0, yb); gr.addColorStop(0, 'rgba(20,10,4,0.55)'); gr.addColorStop(0.45, 'rgba(8,4,2,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(R(l), R(Math.max(y0, topY)), w, R(yb - Math.max(y0, topY)));
          g.fillStyle = 'rgba(226,196,130,0.5)'; for (let i = 0; i < 7; i++) { const sx = l + 6 + ((i * 37) % Math.max(8, w - 12)), sy = y0 + ((time * 140 + i * 53) % Math.max(20, yb - y0)); g.fillRect(R(sx), R(sy), 1, 7); } }
        else { g.fillStyle = '#1e140c'; g.fillRect(R(l), R(y0), w, R(bot + ts - y0)); g.fillStyle = '#3a2a18'; for (let y = y0 + 4; y < bot; y += 8) g.fillRect(R(l), R(y), w, 1); g.fillStyle = SAND.dark; g.fillRect(R(l), R(bot + ts - 3), w, 3); } }
      if (n > 0) SET.sandBody(V, r.x0 * ts, topW, w, botW);
      if (frac > 0.02 && n < r.full && !r.deck) { g.fillStyle = SAND.loose; g.fillRect(R(l), R(topY - frac * ts), w, R(frac * ts)); }   /* the loose row rising */
      /* THE SINKING STREET: the street on the sand - one baked set (paving, house fronts, a minaret stub, a squat dome), the sand streaming off its ends while it moves */
      if (r.deck) RUL.drawDeck(V, r.deck, deckRow(r), r.x0 * ts, w, r.moving, time);
      /* the streams from the roof while it fills: out of ragged holes */
      if (r.gate === 'shut' && r.pour && r.level < r.full) for (let x = r.x0 + 3; x <= r.x1 - 1; x += 5) { const sx = x * ts + 6; let y0 = (r.floor - r.full - 2) * ts; for (let yy = r.floor - r.full - 1 - deckUp(r); yy > 0 && ctx.cellGet(x, yy) !== T().SOLID; yy--) y0 = yy * ts;
        const ye = r.deck ? (deckRow(r) - deckUp(r) + 1) * ts : topW - frac * ts; if (ye > y0) { RUL.drawStream(V, sx, y0, ye, time); RUL.drawRoofHole(V, sx + 1, y0); } }
      /* the floor-gate: a brass housing with a slot that runs while it drains (THE HOURGLASS: a neck into the next hall) */
      if (!r.trap && !r.great && (r.levers || []).length) RUL.drawGateSlot(V, (r.x0 + r.x1 + 1) / 2 * ts, botW, r.gate === 'open', r.gate === 'open' && r.level > 0);
      if (r.trap) RUL.drawTrapFloor(V, r.x0 * ts, w, botW, r.gate === 'shut');
      /* the lamps at the trap hall's lips: RED while its floor-gate is open (a fall is the end), GOLD once it is shut - an iron post with a glass lantern */
      for (const lc of (r.lamps || [])) { const lx = lc * ts + 8 - cx, ly = (r.floor - r.full) * ts - cy, open = r.gate === 'open', col = open ? '#ff5a3a' : '#ffd36b', hi = open ? '#ffb090' : '#fff4c0';
        g.fillStyle = '#2a2634'; g.fillRect(R(lx - 1), R(ly - 22), 2, 22); g.fillStyle = '#8a849a'; g.fillRect(R(lx - 1), R(ly - 22), 1, 22); g.fillStyle = '#3a3446'; g.fillRect(R(lx - 4), R(ly - 28), 8, 3); g.fillRect(R(lx - 4), R(ly - 21), 8, 2); g.fillStyle = '#1a1620'; g.fillRect(R(lx - 3), R(ly - 25), 6, 4); g.fillStyle = col; g.fillRect(R(lx - 2), R(ly - 25), 4, 4); g.fillStyle = hi; g.fillRect(R(lx - 2), R(ly - 25), 1, 2);
        SET.glow(V, lc * ts + 8, (r.floor - r.full) * ts - 23, 22, 0.32 + 0.08 * Math.sin(time * 5 + lc), open ? '255,90,58' : '255,200,100'); }
    }
    /* THE SAND-FALLS: the crack, the chute (a brass trough angled to where it lands), the fall, the heaps */
    for (const c of K.chutes) {
      for (const [tk, t] of Object.entries(c.to)) if (t.kind === 'mound') { const hp = c.heap[tk]; if (!hp || !hp.rows) continue;
        for (const [j, a, b] of t.rungs) if (j <= hp.rows && vis(a, b + 1)) RUL.drawHeapRung(V, a, b, (t.floor - j) * ts); }
      const t = c.to[c.at], B = fallBox(c); if (!vis(Math.min(c.x, t.x0) - 2, Math.max(c.x, t.x1) + 3)) continue;
      const cxp = c.x * ts + 8, ry = (c.roof + 1) * ts, mx = (t.x0 + t.x1 + 1) / 2 * ts, fw = (t.x1 - t.x0 + 1) * ts - 4, fy = ry + 12, fb = Math.min(ctx.L.H * ts + 40, B.b);
      RUL.drawCrack(V, cxp, ry); RUL.drawChute(V, cxp, ry + 3, mx - cxp, 9, true); RUL.drawFall(V, mx, fy, fb, fw, time);
    }
    /* THE LEVERS and their GAUGES (A3: the room's level, OPEN / SHUT; a chute lever names where its fall lands). M5: the throne room's levers GLOW gold while his glass is low */
    const kl = kingLever(ctx.hero());
    for (const lv of levers()) { const x = px(lv.x) - cx, y = (lv.row + 1) * ts - cy; if (x < -40 || x > vw + 40) continue;
      const r = lv.r, open = r ? r.gate === 'open' : lv.chute ? lv.chute.at === Object.keys(lv.chute.to)[1] : false, fx = K.fx.find(f => f.kind === 'pull' && Math.abs(f.x - px(lv.x)) < 2);
      if (lv.arena && kl) { const near = kl.arena === lv.arena; g.globalAlpha = 0.3 + 0.2 * Math.sin(time * 10); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(R(x), R(y - 8), near ? 18 : 13, 0, 7); g.fill(); g.globalAlpha = 1;
        if (near) { g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(R(x), R(y - 8), 21 + 3 * Math.sin(time * 8), 0, 7); g.stroke(); g.lineWidth = 1; ctx.text('PULL', R(x), R(y - 34), '#ffd36b', 'center', 5); } }
      const thrown = open || (fx && fx.t > 0.25), tk = lv.chute ? lv.chute.at : null, tt = lv.chute ? lv.chute.to[tk] : null;
      RUL.drawLever(V, { x: px(lv.x), y: (lv.row + 1) * ts, kind: lv.arena ? 'arena' : lv.chute ? 'chute' : 'gate', open: thrown, chain: lv.chain, k: r && r.full ? r.level / r.full : 0, dir: tt ? ((tt.x0 + tt.x1 + 1) / 2 * ts > px(lv.x) ? 1 : -1) : 1 });
      if (r) ctx.text(open ? 'OPEN' : 'SHUT', R(x + 12), R(y - 30), open ? '#8fd160' : '#ffb060', 'center', 4);
      if (lv.chute) ctx.text(tk === 'wall' ? 'TO THE WALL' : tk === 'hall' ? 'INTO THE HALL' : tk === 'grate' ? 'TO THE GRATE' : 'ON THE LIP', R(x), R(y - 42), '#ffd36b', 'center', 4);
      if (fx) { g.globalAlpha = fx.t * 2; g.strokeStyle = fx.ok ? '#ffd36b' : '#9aa39a'; g.beginPath(); g.arc(R(x), R(y - 8), 14 + (0.5 - fx.t) * 20, 0, 7); g.stroke(); g.globalAlpha = 1; } }
    /* THE GREAT SAND-GATE's wheel: its turns told on it */
    { const W = L.wheel; if (W) { const wx = px(W.x), wy = (W.row + 1) * ts - 14, x = wx - cx, y = wy - cy; if (x > -40 && x < vw + 40) { const a0 = K.wheel.turns * 2.1 + (K.wheel.cd > 0 ? (BCS.wheelCd - K.wheel.cd) * 3 : 0);
      RUL.drawWheel(V, wx, wy, K.wheel.turns, W.turns || 3, a0, K.wheel.done); ctx.text(K.wheel.done ? 'OPEN' : K.wheel.turns + '/' + (W.turns || 3), R(x), R(y - 22), K.wheel.done ? '#8fd160' : '#ffd36b', 'center', 5); } } }
    /* THE CLOCKWORK VAULT's door: a brass face with five gear sockets (the ones carried, lit) */
    for (const v of K.vault) { if (v.open) continue; if (v.x * ts - cx < -40 || v.x * ts - cx > vw + 40) continue; RUL.drawVault(V, v.x, v.y0, v.y1 - v.y0 + 1, v.gears, ctx.questGot(), time); }
  };
  /* the route glint over everything */
  /* (claude/buriedcity4, GREYBOX, B10's read) THE SAND-BOUND'S SHELL: while the sand holds it a crust of sand shimmers round it (a blow glances off); buried, the sand is round its chest */
  const drawBound = (g, cx, cy, time) => { for (const e of ctx.enemies()) { if (!e.alive || e.cnSkin !== 'sandbound' || !e.st || e.st.mode === 'buried') continue; const x = e.x - cx, y = e.y - cy; if (x < -40 || x > ctx.VW() + 40) continue;
    if (e.sbBuried) { g.fillStyle = '#c8a064'; g.beginPath(); g.ellipse(R(x), R(y - 2), 13, 5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ecc988'; g.fillRect(R(x - 10), R(y - 6), 20, 1); continue; }
    const k = 0.5 + 0.5 * Math.sin(time * 6 + e.x); g.strokeStyle = 'rgba(236,201,136,' + (0.45 + 0.35 * k).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.ellipse(R(x), R(y - 11), 11 + k, 14 + k, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1; } };
  H.drawOver = (g, cx, cy, time) => { if (K) drawBound(g, cx, cy, time); if (!K || !K.glint || !K.glint.show) return; drawGlint(g, R(K.glint.x - cx), R(K.glint.y - 18 - cy), ctx.VW(), ctx.VH(), time); };
  H.drawHud = () => false;
  H.read = () => K && { loopOpen: !!K.loopOpen, n: { ...K.n }, rooms: K.rooms.map(r => ({ id: r.id, level: +r.level.toFixed(2), gate: r.gate, rows: r.rows })), wheel: { ...K.wheel }, waiting: K.waiting.length, vault: K.vault.map(v => ({ id: v.id, open: v.open })),
    chutes: K.chutes.map(c => ({ id: c.id, at: c.at, heap: Object.fromEntries(Object.entries(c.heap).map(([k, v]) => [k, v.rows])) })), flip: FL ? FL.read() : null };
  return H;
}
