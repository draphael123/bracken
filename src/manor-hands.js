// src/manor-hands.js - THE HOLLOW MANOR's HANDS (claude/hollowmanor, the OPUS GREYBOX). src/hollow-manor.js lays the house; this runs it:
//   TURN YOUR BACK   a SHIFTING PANEL swaps its two states ONCE when a hero is near it and none faces it for MOVE.unwatched s (the boo's `watched` rule: the panel in
//                    front of the hero's face, within MOVE.range px), then waits to be watched again. Heard (a grinding creak), never seen. It never swaps while a
//                    hero stands in or by its cells.
//   KNOCK IT OUT     a POSSESSED SUIT (the `armour` in skin 'mnsuit') fights while its ghost is in it: a told THRUST, every third blow a told CLEAVE that bites the floor
//                    when it misses (STUCK: x1.5). When it falls its GHOST (a wisp) flies WISP.t s to the nearest EMPTY SUIT (a rack, or the pile it left) and stands
//                    it up (told: IT RISES). A blow on the wisp in flight LAYS IT TO REST. A ghost stands a suit up at most WISP.lives times.
//   LIGHT            strike or touch a CANDELABRA's stand: carry it, lit. A lit candelabra relights any candle it touches; a candle's flame relights a snuffed one.
//                    A LIT CANDLE is a ward: a SHADE will not enter its light, nor lunge at a hero inside it.
//   THE BLACKOUT     a hero across L.mn.blackout.x0: the long gallery's candles go out one by one (each flickers LIGHT.flick s first: told), its SHADES wake.
//   PORTRAITS        a blow on a portrait takes its KEY; three open THE SEALED NURSERY's door (SOLID until then).
//   FOES             SHADES (`haunt`, skin 'mnshade'; runner): asleep in the walls until the blackout, then through the walls after you; a told lunge (!!) that
//                    snuffs a carried candelabra. THE POLTERGEIST ('poltergeist', the one new foe; ranged): faint (phased, x0.5) until it LIFTS a piece of
//                    furniture (told !) and throws it (blockable: a blocked throw breaks); then it is solid a beat (SPENT, x1).
// Every cell this module changes is kept and put back on a reset. GREYBOX DRAWING (the sonnet art lane draws the final).
// main.js calls (one tagged line each): on, reset, update, strike, mine, foe, takeFoe, draws, drawFoe, drawBack, drawOver, holes.
import { MN_SAY } from './mn-lines.js';

export const MOVE = { unwatched: 0.6, range: 260, rangeY: 200, margin: 1 };
export const LIGHT = { carry: 64, candle: 52, ward: 44, touch: 14, flick: 1.0, every: 1.4, wisp: 18 };
export const SUIT = { hp: 70, speed: 34, sense: 220, senseY: 60, recover: 0.45,
  thrust: { tell: 0.8, dmg: 14, reach: 34, cd: 1.5 }, cleave: { tell: 1.0, dmg: 20, reach: 40, stuck: 1.4, cd: 1.8, every: 3, mul: 1.5 } };
export const WISP = { t: 3.5, rise: 1.0, lives: 2, r: 10, range: 420 };
export const SHADE = { hp: 20, speed: 70, sense: 320, tell: 0.45, lunge: 0.25, dash: 260, dmg: 10, reach: 22, back: 1.4, cd: 1.6 };
export const POLT = { hp: 30, sense: 230, senseY: 150, lift: 0.8, speed: 210, dmg: 10, cd: 2.8, spent: 1.0, life: 2.4, r: 9, phased: 0.5, items: ['CHAIR', 'PLATE', 'CANDLESTICK', 'BOOK'] };
const SOUND = { shift: s => (s.rumble || s.crash || s.thud)(), key: s => (s.ui || s.tell)(), open: s => (s.crash || s.thud)(), carry: s => (s.ui || s.tell)(),
  lit: s => (s.puff || s.tell)(), snuff: s => (s.puff || s.hiss || s.tell)(), out: s => (s.hiss || s.tell)(), wisp: s => (s.hiss || s.tell)(), rest: s => (s.ui || s.tell)(),
  rise: s => (s.clank || s.thud)(), thrust: s => (s.throwWhoosh || s.whoosh || s.tell)(), cleave: s => (s.heavy || s.thud)(), stuck: s => (s.clank || s.thud)(),
  lunge: s => (s.whoosh || s.hiss || s.tell)(), lift: s => (s.rattle || s.tell)(), throw: s => (s.throwWhoosh || s.whoosh || s.tell)(), clatter: s => (s.clank || s.crash || s.thud)() };
const R = Math.round;
const rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const GHOST = '#9adfb0';   /* THE ONE ACCENT: ghost-green */

export function makeManorHands(ctx) {
  const H = {}; let S = null;
  const TS = ctx.TS, L = () => ctx.L, mn = () => (L() && L().mn) || null;
  const snd = k => { const f = SOUND[k]; if (f && ctx.sfx) try { f(ctx.sfx); } catch {} };
  const say = (x, y, t, col) => ctx.number && ctx.number(x, y, t, col || '#ffd36b');
  const hint = (k, m) => { if (S.told[k]) return; S.told[k] = 1; ctx.hint && ctx.hint(m); };
  H.on = () => !!(L() && L().manor);
  H.show = () => S;
  const heroes = () => (ctx.players() || []).filter(p => p && !p.dead);
  const fresh = () => ({ t: 0, cells: new Map(), panel: {}, lit: {}, flick: {}, carry: new Map(), keys: new Set(), doorOpen: false, wisps: [], piles: [], rackUsed: {}, suits: new Set(), throws: [], told: {},
    bo: { on: false, i: 0, t: 0, list: [] },
    n: { swaps: 0, keys: 0, carried: 0, relit: 0, snuffed: 0, candelSnuffed: 0, knocked: 0, rested: 0, risen: 0, faded: 0, thrusts: 0, cleaves: 0, stuck: 0, lunges: 0, lungeHits: 0, lifts: 0, throwHits: 0, blockedThrows: 0 } });
  const tile = (x, y) => { const L0 = L(); return x < 0 || y < 0 || x >= L0.W || y >= L0.H ? ctx.T.SOLID : L0.grid[y * L0.W + x]; };
  const stand = t => t === ctx.T.SOLID || t === ctx.T.ONEWAY || t === ctx.T.BOUNCER || t === ctx.T.PLANK || t === ctx.T.SHELF;
  /* ---------------- THE CELLS this level changes: every original kept, every one put back on a reset ---------------- */
  H.setCell = (x, y, t) => { const L0 = L(); if (x < 0 || y < 0 || x >= L0.W || y >= L0.H) return; const k = y * L0.W + x; if (!S.cells.has(k)) S.cells.set(k, L0.grid[k]); ctx.cellSet(x, y, t); };
  const paint = p => { const st = S.panel[p.id].st; for (const [x, y] of p.a) H.setCell(x, y, st === 'A' ? ctx.T.SOLID : ctx.T.AIR); for (const [x, y] of p.b) H.setCell(x, y, st === 'B' ? ctx.T.SOLID : ctx.T.AIR); };
  H.reset = () => { if (!H.on()) { S = null; return; }
    if (S && S.L === L()) for (const [k, v] of S.cells) { const L0 = L(); ctx.cellSet(k % L0.W, Math.floor(k / L0.W), v); }
    S = fresh(); S.L = L(); const G = mn(); if (!G) return;
    for (const p of G.panels) { S.panel[p.id] = { st: 'A', unT: 0, armed: true }; paint(p); }   /* every panel in state A */
    for (const d of G.doors) for (const [x, y] of d.cells) H.setCell(x, y, ctx.T.SOLID);          /* the nursery shut */
    for (const c of G.candles) S.lit[c.id] = true;
    S.bo.list = G.candles.filter(c => !c.arena && c.x >= G.blackout.x0 && c.x < G.blackout.x1).sort((a, b) => a.x - b.x).map(c => c.id); };
  /* ================= TURN YOUR BACK ================= */
  const box = p => { const cs = p.a.concat(p.b), xs = cs.map(c => c[0]), ys = cs.map(c => c[1]); return { x0: (Math.min(...xs) - MOVE.margin) * TS, x1: (Math.max(...xs) + 1 + MOVE.margin) * TS, y0: (Math.min(...ys) - MOVE.margin) * TS, y1: (Math.max(...ys) + 1 + MOVE.margin) * TS }; };
  const inBox = (p, h) => { const b = box(p); return h.x > b.x0 - 6 && h.x < b.x1 + 6 && h.y > b.y0 && h.y - 22 < b.y1; };
  H.near = (p, h) => Math.abs(p.eye.x - h.x) < MOVE.range && Math.abs(p.eye.y - (h.y - 12)) < MOVE.rangeY;
  H.watching = (p, h) => H.near(p, h) && (inBox(p, h) || (Math.sign(p.eye.x - h.x) || 1) === (h.face || 1));
  H.swap = id => { const G = mn(), p = G.panels.find(q => q.id === id), s = S.panel[id]; s.st = s.st === 'A' ? 'B' : 'A'; s.armed = false; s.unT = 0; paint(p); S.n.swaps++; snd('shift');
    for (const h of heroes()) if (H.near(p, h)) { say(h.x, h.y - 34, MN_SAY.moved, '#c8d8cc'); break; } hint('shift', MN_SAY.shift); return s.st; };
  function stepPanels(dt) { for (const p of mn().panels) { const s = S.panel[p.id], hs = heroes(), near = hs.filter(h => H.near(p, h));
      if (!near.length) { s.unT = 0; continue; }
      if (near.some(h => H.watching(p, h))) { s.armed = true; s.unT = 0; continue; }
      if (!s.armed) continue; s.unT += dt; if (s.unT < MOVE.unwatched) continue;
      if (hs.some(h => inBox(p, h)) || (ctx.enemies() || []).some(e => e.alive && !e.boss && inBox(p, e))) continue;   /* never onto (or out from under) anyone */
      H.swap(p.id); } }
  /* ================= LIGHT ================= */
  H.carrying = p => S && S.carry.has(p) ? S.carry.get(p) : null;   /* 'lit' | 'out' | null */
  H.take = p => { const was = S.carry.get(p); S.carry.set(p, 'lit'); if (was !== 'lit') { S.n.carried++; snd('carry'); say(p.x, p.y - 34, MN_SAY.carry, '#ffb04a'); hint('candle', MN_SAY.candle); } };
  H.relight = id => { if (S.lit[id]) return false; S.lit[id] = true; delete S.flick[id]; S.n.relit++; snd('lit'); const c = mn().candles.find(q => q.id === id); say(c.x, c.y - 26, MN_SAY.lit, '#ffb04a'); return true; };
  H.snuffCarry = p => { if (S.carry.get(p) !== 'lit') return false; S.carry.set(p, 'out'); S.n.candelSnuffed++; snd('snuff'); say(p.x, p.y - 34, MN_SAY.snuffed, '#8a9a90'); return true; };
  const inLight = (x, y, pad = 0) => mn().candles.some(c => S.lit[c.id] && Math.hypot(c.x - x, c.y - 10 - y) < LIGHT.ward + pad);
  H.lightsNow = () => { const G = mn(), out = []; if (!G || !S) return out;
    for (const p of heroes()) if (S.carry.get(p) === 'lit') out.push({ x: p.x, y: p.y - 16, r: LIGHT.carry, kind: 'carry' });
    for (const c of G.candles) if (S.lit[c.id]) out.push({ x: c.x, y: c.y - 10, r: LIGHT.candle * (S.flick[c.id] ? 0.6 + 0.4 * Math.random() : 1), kind: 'candle' });
    for (const w of S.wisps) if (!w.done) out.push({ x: w.x, y: w.y, r: LIGHT.wisp, kind: 'wisp' });
    return out; };
  function stepLight(dt) { const G = mn();
    for (const p of heroes()) { for (const s of G.stands) if (Math.abs(p.x - s.x) < 12 && Math.abs(p.y - s.y) < 24 && S.carry.get(p) !== 'lit') H.take(p);
      const st = S.carry.get(p); if (!st) continue;
      for (const c of G.candles) { if (Math.abs(p.x - c.x) > LIGHT.touch || Math.abs((p.y - 14) - (c.y - 10)) > 26) continue;
        if (st === 'lit' && !S.lit[c.id]) H.relight(c.id); else if (st === 'out' && S.lit[c.id] && !S.flick[c.id]) { S.carry.set(p, 'lit'); snd('lit'); say(p.x, p.y - 34, MN_SAY.lit, '#ffb04a'); } } }
    /* THE BLACKOUT */
    const bo = S.bo; if (!bo.on && heroes().some(p => p.x > G.blackout.x0 && p.x < G.blackout.x1)) { bo.on = true; bo.t = 0.6; snd('out'); const h0 = heroes()[0]; if (h0) say(h0.x, h0.y - 40, MN_SAY.out, '#ff9a5c'); hint('long', MN_SAY.long); }
    for (const id in S.flick) { S.flick[id] -= dt; if (S.flick[id] <= 0) { delete S.flick[id]; S.lit[id] = false; S.n.snuffed++; snd('snuff'); } }
    if (bo.on && bo.i < bo.list.length) { bo.t -= dt; if (bo.t <= 0) { const id = bo.list[bo.i++]; if (S.lit[id]) S.flick[id] = LIGHT.flick; bo.t = LIGHT.every; } } }
  /* ================= PORTRAITS AND THE NURSERY ================= */
  H.takeKey = id => { if (S.keys.has(id)) return false; S.keys.add(id); S.n.keys++; snd('key'); const p = mn().portraits.find(q => q.id === id); say(p.x, p.y - 14, MN_SAY.key + ' ' + S.keys.size + '/' + mn().keysNeed, '#ffd36b');
    if (S.keys.size >= mn().keysNeed && !S.doorOpen) { S.doorOpen = true; snd('open'); for (const d of mn().doors) { for (const [x, y] of d.cells) H.setCell(x, y, ctx.T.AIR); say(d.cells[0][0] * TS + 8, d.cells[0][1] * TS, MN_SAY.open, '#ffd36b'); } }
    return true; };
  /* ================= KNOCK IT OUT: the ghost and the empty suits ================= */
  const spots = () => mn().racks.filter(r => !S.rackUsed[r.id]).map(r => ({ kind: 'rack', id: r.id, x: r.x, y: r.y })).concat(S.piles.filter(q => !q.used).map(q => ({ kind: 'pile', ref: q, x: q.x, y: q.y })));
  function knocked(e) { S.n.knocked++; const pile = { x: e.x, y: e.y, used: false }; S.piles.push(pile); const lives = e.mnLives === undefined ? WISP.lives : e.mnLives;
    if (lives <= 0) { S.n.faded++; say(e.x, e.y - 30, MN_SAY.fades, '#8a9a90'); return; }
    const sp = spots().filter(q => Math.abs(q.x - e.x) < WISP.range && Math.abs(q.y - e.y) < 160), racks = sp.filter(q => q.kind === 'rack');
    const tgt = (racks.length ? racks : sp).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0] || { kind: 'pile', ref: pile, x: pile.x, y: pile.y };
    if (tgt.kind === 'rack') S.rackUsed[tgt.id] = true; else tgt.ref.used = true;
    S.wisps.push({ x: e.x, y: e.y - 18, x0: e.x, y0: e.y - 18, tx: tgt.x, ty: tgt.y, t: 0, lives: lives - 1, squad: e.squad, tgt }); snd('wisp'); say(e.x, e.y - 30, MN_SAY.knocked, GHOST); hint('wisp', MN_SAY.wisp); }
  H.suitAt = (x, y, lives, mode = 'rise') => { const e = { x, y, vx: 0, vy: 0, face: -1, alive: true, dying: 0, anim: 0, flash: 0, stagger: 0, t: 'armour', cnSkin: 'mnsuit', w: 12, h: 26, hp: SUIT.hp, maxHp: SUIT.hp, mode, modeT: WISP.rise, cd: 0.8, noGrav: true, mnInit: 1, mnLives: lives, mnHits: 0 };
    if (ctx.addFoe) ctx.addFoe(e); S.suits.add(e); return e; };
  function stepWisps(dt) { for (const w of S.wisps) { if (w.done) continue; w.t += dt; const k = Math.min(1, w.t / WISP.t);
      w.x = w.x0 + (w.tx - w.x0) * k; w.y = w.y0 + (w.ty - 18 - w.y0) * k - Math.sin(k * Math.PI) * 30;
      if (k >= 1) { w.done = 'rose'; S.n.risen++; snd('rise'); say(w.tx, w.ty - 34, MN_SAY.rises, '#ff9a5c'); const e = H.suitAt(w.tx, w.ty, w.lives); e.squad = w.squad; } }
    S.wisps = S.wisps.filter(w => !w.done || w.t < WISP.t + 0.01); }
  H.restWisp = w => { if (w.done) return false; w.done = 'rest'; S.n.rested++; snd('rest'); say(w.x, w.y - 16, MN_SAY.rest, GHOST); if (w.tgt.kind === 'rack') S.rackUsed[w.tgt.id] = false; else w.tgt.ref.used = false; return true; };
  /* ---------------- THE STEP ---------------- */
  H.update = dt => { if (!H.on()) return; if (!S) H.reset(); S.t += dt;
    for (const e of S.suits) if (!e.alive && !e.mnGone) { e.mnGone = 1; knocked(e); }
    for (const e of [...S.suits]) if (e.mnGone) S.suits.delete(e);
    stepPanels(dt); stepLight(dt); stepWisps(dt); stepThrows(dt); };
  /* ---------------- A HERO'S BLOW: a portrait, a stand, a candle, a wisp ---------------- */
  const hitBox = (hb, x, y, r) => hb.l < x + r && hb.r > x - r && hb.t < y + r && hb.b > y - r;
  H.strike = (hb, by) => { if (!H.on() || !hb) return; if (!S) H.reset(); const G = mn(), once = o => !ctx.hitOnce || ctx.hitOnce(o), who = by || (ctx.hero && ctx.hero());
    for (const p of G.portraits) if (!S.keys.has(p.id) && hitBox(hb, p.x, p.y, 10) && once(p)) H.takeKey(p.id);
    for (const s of G.stands) if (who && hitBox(hb, s.x, s.y - 14, 10) && once(s)) H.take(who);
    for (const c of G.candles) if (who && S.carry.get(who) === 'lit' && !S.lit[c.id] && hitBox(hb, c.x, c.y - 10, 9) && once(c)) H.relight(c.id);
    for (const w of S.wisps) if (!w.done && hitBox(hb, w.x, w.y, WISP.r) && once(w)) H.restWisp(w); };
  /* ================= THE FOES ================= */
  H.mine = e => (e.t === 'armour' && e.cnSkin === 'mnsuit') || (e.t === 'haunt' && e.cnSkin === 'mnshade') || e.t === 'poltergeist';
  H.draws = e => (e.t === 'haunt' && e.cnSkin === 'mnshade') || e.t === 'poltergeist';
  const floorUnder = (x, y) => { const tx = Math.floor(x / TS); for (let ty = Math.floor((y - 4) / TS); ty < L().H; ty++) if (stand(tile(tx, ty))) return ty * TS; return null; };
  H.spawn = (e, base) => { if (e.t !== 'poltergeist') return null; return { ...base, t: 'poltergeist', w: 14, h: 18, hp: POLT.hp, maxHp: POLT.hp, noGrav: true, mode: 'drift', modeT: 0, hx: base.x, hy: base.y - 8, y: base.y - 8, squad: e.squad, cd: 1.2, n: 0 }; };
  H.takeFoe = (e, dmg) => { if (e.t === 'armour' && e.mode === 'stuck') return dmg * SUIT.cleave.mul; if (e.t === 'poltergeist' && e.mode === 'drift') return dmg * POLT.phased; if (e.t === 'haunt' && e.mode === 'hide') return 0; return dmg; };
  const hitP = (p, e, d, name, o = {}) => { let r = null; ctx.asPlayer(p, () => { r = ctx.damage(e.x, d, { who: e, name, ...o }); }); return r; };
  const nearest = e => heroes().sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0] || null;
  H.foe = (e, dt) => { if (!S) H.reset(); e.anim = (e.anim || 0) + dt; e.modeT -= dt; e.cd = Math.max(0, (e.cd || 0) - dt);
    if (e.t === 'poltergeist') return polter(e, dt);
    if (e.t === 'haunt') { if (!e.mnInit) { e.mnInit = 1; e.noGrav = true; e.hp = e.maxHp = SHADE.hp; e.mode = 'hide'; e.hx = e.x; e.hy = e.y; } return shade(e, dt); }
    if (!e.mnInit) { e.mnInit = 1; e.noGrav = true; e.hp = e.maxHp = SUIT.hp; e.mode = 'walk'; e.modeT = 0; e.mnHits = 0; e.mnLives = WISP.lives; const fy = floorUnder(e.x, e.y); if (fy !== null) e.y = fy; }
    S.suits.add(e); return suit(e, dt); };
  function suit(e, dt) { const p = nearest(e);
    switch (e.mode) {
      case 'rise': if (e.modeT <= 0) { e.mode = 'walk'; e.cd = 0.6; } return;
      case 'thrustTell': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = SUIT.recover; e.cd = SUIT.thrust.cd; S.n.thrusts++; snd('thrust'); if (p && Math.abs(p.x - e.x) < SUIT.thrust.reach && (Math.sign(p.x - e.x) || 1) === e.face && Math.abs(p.y - e.y) < 24) hitP(p, e, SUIT.thrust.dmg, 'A POSSESSED SUIT'); } return;
      case 'cleaveTell': if (e.modeT <= 0) { S.n.cleaves++; snd('cleave'); let hit = false; for (const q of heroes()) if (Math.abs(q.x - e.x) < SUIT.cleave.reach && (Math.sign(q.x - e.x) || 1) === e.face && Math.abs(q.y - e.y) < 24) { hit = true; hitP(q, e, SUIT.cleave.dmg, 'A POSSESSED SUIT', { unblockable: true }); }
          if (hit) { e.mode = 'recover'; e.modeT = SUIT.recover; } else { e.mode = 'stuck'; e.modeT = SUIT.cleave.stuck; S.n.stuck++; snd('stuck'); say(e.x, e.y - 34, 'STUCK', '#ffd36b'); } e.cd = SUIT.cleave.cd; } return;
      case 'recover': case 'stuck': if (e.modeT <= 0) e.mode = 'walk'; return;
    }
    e.mode = 'walk'; if (!p || Math.abs(p.x - e.x) > SUIT.sense || Math.abs(p.y - e.y) > SUIT.senseY) return;
    const dx = p.x - e.x, dir = Math.sign(dx) || 1; e.face = dir;
    if (Math.abs(dx) < SUIT.thrust.reach - 6 && Math.abs(p.y - e.y) < 24 && e.cd <= 0) { e.mnHits = (e.mnHits || 0) + 1;
      if (e.mnHits % SUIT.cleave.every === 0) { e.mode = 'cleaveTell'; e.modeT = SUIT.cleave.tell; say(e.x, e.y - 34, '!!', '#ff6b6b'); } else { e.mode = 'thrustTell'; e.modeT = SUIT.thrust.tell; say(e.x, e.y - 34, '!', '#ffd36b'); } return; }
    if (Math.abs(dx) < SUIT.thrust.reach - 10) return;
    const nx = e.x + dir * SUIT.speed * dt, ty = Math.floor((e.y + 2) / TS), tx = Math.floor((nx + dir * 7) / TS);
    if (!stand(tile(tx, ty)) || tile(tx, ty - 1) === ctx.T.SOLID) return; e.x = nx; }
  function shade(e, dt) { const p = nearest(e);
    if (e.mode === 'hide') { e.x = e.hx; e.y = e.hy; if (S.bo.on) { e.mode = 'chase'; e.cd = 0.8 + (e.hx % 7) * 0.1; } return; }
    if (e.mode === 'lungeTell') { if (e.modeT <= 0) { e.mode = 'lunge'; e.modeT = SHADE.lunge; S.n.lunges++; snd('lunge'); const a = e.aim, d = Math.hypot(a.x - e.x, a.y - e.y) || 1; e.lvx = (a.x - e.x) / d * SHADE.dash; e.lvy = (a.y - e.y) / d * SHADE.dash; e.lhit = false; } return; }
    if (e.mode === 'lunge') { e.x += e.lvx * dt; e.y += e.lvy * dt;
      for (const q of heroes()) if (!e.lhit && Math.abs(q.x - e.x) < 12 && e.y > q.y - 26 && e.y < q.y + 4) { e.lhit = true; S.n.lungeHits++; hitP(q, e, SHADE.dmg, 'A SHADE', { unblockable: true }); H.snuffCarry(q); }
      if (e.modeT <= 0) { e.mode = 'back'; e.modeT = SHADE.back; e.cd = SHADE.cd; } return; }
    if (!p || Math.hypot(p.x - e.x, p.y - e.y) > SHADE.sense) return;
    const tx = e.mode === 'back' ? e.x + (e.x - p.x) : p.x, ty = e.mode === 'back' ? e.y - 30 : p.y - 14, dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1;
    if (e.mode === 'back' && e.modeT <= 0) e.mode = 'chase';
    let nx = e.x + dx / d * SHADE.speed * dt, ny = e.y + dy / d * SHADE.speed * dt;   /* through the walls: a shade phases */
    for (const c of mn().candles) if (S.lit[c.id]) { const cx0 = c.x, cy0 = c.y - 10, dd = Math.hypot(nx - cx0, ny - cy0); if (dd < LIGHT.ward) { const k = LIGHT.ward / (dd || 1); nx = cx0 + (nx - cx0) * k; ny = cy0 + (ny - cy0) * k; } }   /* it will not enter a lit candle's light */
    e.x = nx; e.y = ny; e.face = Math.sign(p.x - e.x) || e.face;
    if (e.mode === 'chase' && e.cd <= 0 && Math.hypot(p.x - e.x, p.y - 14 - e.y) < SHADE.reach + 30 && !inLight(p.x, p.y - 14)) { e.mode = 'lungeTell'; e.modeT = SHADE.tell; e.aim = { x: p.x, y: p.y - 14 }; say(e.x, e.y - 20, '!!', '#ff6b6b'); } }
  function polter(e, dt) { const p = nearest(e);
    if (e.mode === 'liftTell') { if (e.modeT <= 0) { e.mode = 'spent'; e.modeT = POLT.spent; e.cd = POLT.cd; S.n.lifts++; snd('throw'); const a = e.aim, ix = e.x + e.face * 10, iy = e.y - 16, dx = a.x - ix, dy = a.y - iy, d = Math.hypot(dx, dy) || 1;
        S.throws.push({ x: ix, y: iy, vx: dx / d * POLT.speed, vy: dy / d * POLT.speed - 30, t: POLT.life, by: e, item: e.item }); } return; }
    if (e.mode === 'spent') { if (e.modeT <= 0) e.mode = 'drift'; return; }
    e.mode = 'drift'; e.x = e.hx + Math.sin(e.anim * 0.9) * 18; e.y = e.hy + Math.sin(e.anim * 1.7) * 6;
    if (p && e.cd <= 0 && Math.abs(p.x - e.x) < POLT.sense && Math.abs(p.y - e.y) < POLT.senseY) { e.mode = 'liftTell'; e.modeT = POLT.lift; e.face = Math.sign(p.x - e.x) || 1; e.aim = { x: p.x, y: p.y - 12 }; e.item = POLT.items[(e.n = (e.n || 0) + 1) % POLT.items.length]; snd('lift'); say(e.x, e.y - 26, '!', '#ffd36b'); hint('poltergeist', MN_SAY.poltergeist); } }
  function stepThrows(dt) { for (const o of S.throws) { o.vy += 120 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.t -= dt; if (tile(Math.floor(o.x / TS), Math.floor(o.y / TS)) === ctx.T.SOLID) { o.t = 0; snd('clatter'); }
      for (const p of heroes()) if (o.t > 0 && Math.abs(p.x - o.x) < POLT.r + 4 && o.y > p.y - 26 && o.y < p.y + 2) { o.t = 0; const r = hitP(p, o.by || { x: o.x }, POLT.dmg, 'A POLTERGEIST\'S ' + o.item, { blockable: true });
        if (r === 'blocked') { S.n.blockedThrows++; snd('clatter'); say(o.x, o.y - 10, 'CLATTER', '#c8d8cc'); } else S.n.throwHits++; } }
    S.throws = S.throws.filter(o => o.t > 0); }
  /* ---------------- WHAT A TOOL READS ---------------- */
  H.read = () => S && { t: +S.t.toFixed(2), panels: Object.fromEntries(Object.entries(S.panel).map(([k, v]) => [k, v.st])), keys: S.keys.size, door: S.doorOpen, lit: Object.values(S.lit).filter(Boolean).length, carry: heroes().map(p => S.carry.get(p) || null), wisps: S.wisps.length, n: { ...S.n } };
  /* ================= THE DARK: every lit candle, a carried flame and a wisp is a hole ================= */
  H.holes = (hole, cx, cy) => { if (!S) return; for (const l of H.lightsNow()) hole(l.x - cx, l.y - cy, l.r * 1.25); };
  /* ================= THE GREYBOX DRAWING ================= */
  /* behind the tiles: THE GREAT HALL'S TOWER over the roofs (the landmark: its one high window lit ghost-green), a row of gables */
  H.drawBack = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return;
    const tx = R(((300 * TS - cx) * 0.25) % (VW + 400)) + 120; rect(g, tx, 6, 46, VH * 0.6, 'rgba(40,46,46,0.95)'); rect(g, tx - 6, 0, 58, 10, 'rgba(30,34,34,0.95)');
    rect(g, tx + 18, 30, 10, 16, 'rgba(154,223,176,' + (0.45 + 0.2 * Math.sin(time * 1.3)).toFixed(2) + ')');
    for (let i = -1; i < Math.ceil(VW / 70) + 2; i++) { const bx = R(((i * 70 - cx * 0.4) % (VW + 140) + VW + 140) % (VW + 140) - 70); rect(g, bx, 64, 60, VH, 'rgba(34,38,38,0.85)'); rect(g, bx + 10, 52, 40, 12, 'rgba(34,38,38,0.85)'); rect(g, bx + 26, 74, 8, 10, 'rgba(255,176,74,0.10)'); } };
  H.drawOver = (g, cx, cy, VW, VH, time) => { if (!H.on() || !S) return; const x = v => R(v - cx), y = v => R(v - cy), G = mn(), hs = heroes();
    for (const p of G.panels) { const st = S.panel[p.id].st, other = st === 'A' ? p.b : p.a, seen = hs.some(h => H.watching(p, h));
      for (const [cx0, cy0] of other) if ((cx0 + cy0) % 2 === 0) rect(g, x(cx0 * TS) + 4, y(cy0 * TS) + 7, 8, 1, 'rgba(200,216,204,0.28)');   /* where it could be: dotted */
      const ex = x(p.eye.x), ey = y(p.eye.y); rect(g, ex - 5, ey - 2, 10, 4, 'rgba(20,24,24,0.8)'); rect(g, ex - 4, ey - (seen ? 1 : 0), 8, seen ? 3 : 1, seen ? '#e6eee8' : '#5a6a60'); if (seen) rect(g, ex - 1, ey - 1, 2, 2, '#1a1e1e'); }   /* THE EYE: open while it is watched */
    for (const c of G.candles) { const px = x(c.x), py = y(c.y); rect(g, px - 3, py - 4, 6, 4, '#4a4440'); rect(g, px - 1, py - 10, 2, 6, '#d8d0c0');
      if (S.lit[c.id]) { const fl = S.flick[c.id] && (time * 14) % 2 < 1; if (!fl) rect(g, px - 2, py - 15 + Math.sin(time * 9 + c.x) * 1, 4, 5, '#ffb04a'); } else rect(g, px - 1, py - 12, 2, 2, '#6a6a6a'); }
    for (const s of G.stands) { const px = x(s.x), py = y(s.y); rect(g, px - 1, py - 20, 2, 20, '#5a5048'); rect(g, px - 7, py - 22, 14, 2, '#8a7a5a'); for (const k of [-6, 0, 6]) rect(g, px + k - 1, py - 28, 2, 6, '#d8d0c0'); }
    for (const r of G.racks.concat(G.arenaRacks || [])) { if (S.rackUsed[r.id]) continue; if (r.set) continue; const px = x(r.x), py = y(r.y); rect(g, px - 8, py - 2, 16, 2, '#3a3a3a'); rect(g, px - 1, py - 30, 2, 28, '#3a3a3a'); rect(g, px - 6, py - 26, 12, 14, '#6a6e70'); rect(g, px - 4, py - 34, 8, 8, '#7a7e80'); rect(g, px - 3, py - 31, 6, 1, '#202424'); }   /* AN EMPTY SUIT on its rack */
    for (const q of S.piles) if (!q.used) { const px = x(q.x), py = y(q.y); rect(g, px - 9, py - 5, 18, 5, '#5a5e60'); rect(g, px - 4, py - 9, 8, 4, '#6a6e70'); }
    for (const p of G.portraits) { const px = x(p.x), py = y(p.y), got = S.keys.has(p.id); rect(g, px - 9, py - 11, 18, 22, '#8a6a2a'); rect(g, px - 7, py - 9, 14, 18, got ? '#2a2c2c' : '#4a5a50'); if (!got) { rect(g, px - 3, py - 6, 6, 6, '#c8b8a0'); rect(g, px - 1, py + 3, 2, 4, '#ffd36b'); } }
    for (const d of G.doors) { const [dx, dy] = d.cells[0], n = d.cells.length; if (S.doorOpen) { rect(g, x(dx * TS), y(dy * TS), 3, n * TS, '#4a3a3a'); continue; }
      rect(g, x(dx * TS), y(dy * TS), TS, n * TS, '#5a6a8a'); for (let k = 0; k < G.keysNeed; k++) rect(g, x(dx * TS) + 6, y(dy * TS) + 12 + k * 18, 4, 6, k < S.keys.size ? '#ffd36b' : '#1a1e2a'); }   /* the nursery door: a keyhole per portrait */
    for (const w of S.wisps) if (!w.done) { const px = x(w.x), py = y(w.y); rect(g, px - 4, py - 4, 8, 8, GHOST); rect(g, px - 2 - Math.sign(w.tx - w.x0) * 6, py - 1, 4, 2, 'rgba(154,223,176,0.5)'); g.strokeStyle = 'rgba(154,223,176,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px + 0.5, py); g.lineTo(x(w.tx) + 0.5, y(w.ty) - 30); g.stroke(); }
    for (const o of S.throws) rect(g, x(o.x) - 5, y(o.y) - 5, 10, 10, o.item === 'PLATE' ? '#d8d8d0' : o.item === 'BOOK' ? '#6a3a3a' : o.item === 'CANDLESTICK' ? '#c8a050' : '#7a6a5a');
    for (const e of (ctx.enemies() || [])) { if (!e.alive || e.t !== 'armour' || e.cnSkin !== 'mnsuit') continue; const px = x(e.x), py = y(e.y), rise = e.mode === 'rise';
      rect(g, px - 3 + (e.face || 1) * 2, py - 24, 6, 2, rise && (time * 10) % 2 < 1 ? '#ffffff' : GHOST);   /* POSSESSED: the visor lit ghost-green */
      if (e.mode === 'stuck') rect(g, px + (e.face || 1) * 14 - 1, py - 10, 2, 10, '#c8c8c8');
      if (e.mode === 'cleaveTell') rect(g, px - (e.face || 1) * 4, py - 40, 2, 14, '#c8c8c8'); if (e.mode === 'thrustTell') rect(g, px - (e.face || 1) * 12, py - 14, 10, 2, '#c8c8c8'); }
    for (const p of hs) { const st = S.carry.get(p); if (!st) continue; const px = x(p.x) + (p.face || 1) * 8, py = y(p.y) - 18; rect(g, px - 1, py, 2, 10, '#8a7a5a'); rect(g, px - 5, py, 10, 2, '#8a7a5a');
      for (const k of [-4, 0, 4]) { rect(g, px + k - 1, py - 4, 2, 4, '#d8d0c0'); if (st === 'lit') rect(g, px + k - 1, py - 8 + Math.sin(time * 12 + k) * 1, 2, 3, '#ffb04a'); } } };
  H.drawFoe = (g, e, cx, cy, time) => { const ex = R(e.x - cx), ey = R(e.y - cy);
    if (e.t === 'haunt') { if (e.mode === 'hide') return; const lit = inLight(e.x, e.y, 30) || heroes().some(p => S.carry.get(p) === 'lit' && Math.hypot(p.x - e.x, p.y - 16 - e.y) < LIGHT.carry + 20), tell = e.mode === 'lungeTell';
      g.globalAlpha = tell ? 0.95 : lit ? 0.75 : 0.32; rect(g, ex - 7, ey - 10, 14, 16, '#1a2220'); rect(g, ex - 5, ey + 6, 3, 4, '#1a2220'); rect(g, ex + 2, ey + 6, 3, 4, '#1a2220');
      rect(g, ex - 4, ey - 5, 2, 2, tell ? '#ff4a2a' : GHOST); rect(g, ex + 2, ey - 5, 2, 2, tell ? '#ff4a2a' : GHOST); g.globalAlpha = 1; return; }
    if (e.t === 'poltergeist') { const solid = e.mode !== 'drift'; g.globalAlpha = solid ? 0.9 : 0.35; rect(g, ex - 7, ey - 16, 14, 14, '#c8d8cc'); rect(g, ex - 7, ey - 2, 4, 4, '#c8d8cc'); rect(g, ex + 3, ey - 2, 4, 4, '#c8d8cc'); rect(g, ex - 4, ey - 12, 2, 3, '#1a1e1e'); rect(g, ex + 2, ey - 12, 2, 3, '#1a1e1e'); g.globalAlpha = 1;
      if (e.mode === 'liftTell') { const k = 1 - Math.max(0, e.modeT) / POLT.lift, ix = ex + (e.face || 1) * 10 + Math.sin(time * 40) * 1.5, iy = ey - 6 - k * 12; rect(g, ix - 5, iy - 5, 10, 10, e.item === 'PLATE' ? '#d8d8d0' : e.item === 'BOOK' ? '#6a3a3a' : e.item === 'CANDLESTICK' ? '#c8a050' : '#7a6a5a'); } } };
  return H;
}
