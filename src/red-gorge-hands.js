// src/red-gorge-hands.js - THE RED GORGE's HANDS (claude/redgorge, the greybox). src/red-gorge.js builds the level; this binds its rule to the
// game: THE FLOOD (one clock: dry, the HORN, the TORRENT down every channel), THE SLUICE GATES (E at a wheel: shut / held / released), THE JAMS
// (only a released burst washes one out), THE BASKETS (a water-wheel winds each up its shaft while the water runs past it), THE OLD NEST and its
// vault (four feathers), and THE RAPTOR (the vulture's marked dive, src/desert-foes.js, that only hunts a hero near the bridge it keeps).
// main.js calls: reset, on, update, interact, basket, raptorStep, dam, drawWorld, drawHud, read. Every teaching line goes through ctx.number with a
// line listed in src/hint-lines.js (the hint box). THE GREAT RED CRAB (src/gorge-crab-hands.js) reads the dam's water through dam().
import { vultureStep } from './desert-foes.js';
import * as RGP from './redraw/redgorge_props.js';
import { newStall, stallTick, drawGlint, resolve } from './stuck-guide.js';   /* THE GLINT + THE 10 s STALL NUDGE (claude/gorgemodule: shared with the canal and the route list) */
import { STUCK_HANDS } from './stuck-spots.js';

/* THE FLOOD'S CLOCK (s), its blow, and a released burst. GORGE.horn is the whole warning: two seconds is a dozen tiles at a run, and every place to
   stand in a channel is three tiles or less from dry rock (tools/redgorge.mjs proves it) */
/* (dmg: a flood down the gorge is a fall and a beating; damDmg: the old dam's shallow spillway, where the crab fight is - tuned with the boss pilot at 10) */
export const GORGE = { dry: 6.0, horn: 2.0, run: 2.4, first: 3.0, dmg: 25, damDmg: 10, down: 200, push: 90, foeDmg: 30, foeFlood: 0.5, foeNear: [360, 220], release: { tell: 0.35, run: 1.6 }, wellR: 22 };
export const BASKET = { rise: 2.0, sink: 36, hold: 2.0, fall: 2.0 };          /* a basket climbs its shaft in RISE s of running water, holds HOLD s at the top, then drops its whole shaft in FALL s (Daniel 10-03: at 36 px/s an 18-row basket never reached the bridge between two floods, ~10 s apart - it hung out of reach, a soft-lock; the foot must be back well before the next flood) */
export const RAPTOR = { sightY: 150, hp: 24, dmg: 20 };
/* THE RAPIDS (claude/redgorge2): the drifting timbers' pace in calm water and in the horn's rapids (px/s), and a raptor's stoop over the water knocks you in */
export const RAPIDS = { calm: 14, rapids: 50, bob: 1.5, knock: [-150, -150] };   /* (the current runs west, to the gorge's mouth: a knock goes downstream) */            /* THE RAPTOR: it hunts only a hero within SIGHTY px (up or down) of the bridge it keeps; its stoop hits harder than a vulture's (20, the vulture 10) */

/* WHAT YOU MUST USE NEXT (Daniel's playtest, 10-02: on bridge two he could not see that the basket was the way on). A pulsing GLINT on the thing the climb needs
   next, and after NUDGE.after s with no headway up the gorge, a short NUDGE naming it (once, then again only after NUDGE.again s). No sign spoils it: the glint says
   WHERE, the nudge only WHAT. The glint, the stall clock and the nudge are the shared module's (src/stuck-guide.js); the gorge's route list is DATA, STUCK_HANDS in
   src/stuck-spots.js (claude/gorgemodule: it was this file's own nextThing / stall / glint code) */
export const ROPE_TOLD = 'CLIMB THE ROPE: UP';   /* the first time you come to a rope's foot (a told prompt; the keys differ by device, so it names the direction only) */
export function makeRedGorgeHands(ctx) {
  let RG = null;
  const H = {};
  const TS = () => ctx.TS;
  const cellsOf = m => { const out = []; for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) out.push([x, y]); return out; };
  const say = (k, x, y, line, col) => { if (k && RG.said[k]) return; if (k) RG.said[k] = 1; ctx.number(x, y, line, col || '#ffd36b'); };

  /* ---------- RESET: a fresh load is a fresh gorge; a respawn keeps what was washed out and what was opened ---------- */
  H.reset = () => {
    const L = ctx.L; if (!L || !L.redgorge) { RG = null; return; }
    if (!RG || RG.L !== L) {
      const ents = L.ents, ts = ctx.TS;
      RG = { L, phase: 'dry', t: GORGE.first, id: 0, said: {}, spans: [], pending: [],
        n: { floods: 0, held: 0, releases: 0, wasted: 0, swept: 0, foesSwept: 0, foesTaken: 0, nudges: 0, jams: 0, rides: 0, shut: 0 },
        channels: (L.channels || []).map(c => ({ ...c })),
        gates: (L.gates || []).map(g => ({ ...g, state: 'open', fx: 0 })),
        wheels: ents.filter(e => e.t === 'sluice').map(e => ({ x: e.x * ts + 8, y: (e.y + 1) * ts, gate: e.gate, arena: !!e.arena, cd: 0 })),
        ropes: (L.ropes || []).map(([x, y0, y1]) => ({ x: x * ts + 8, y0: y0 * ts, y1: (y1 + 1) * ts, r0: y0, r1: y1 })),
        jams: (L.jams || []).map(j => ({ ...j, open: false })),
        nest: (() => { const e = ents.find(q => q.t === 'oldnest'); return e ? { x: e.x * ts + 8, y: (e.y + 1) * ts, open: false } : null; })(),
        vault: (L.vaultDoors || []).map(v => ({ ...v, open: false })),
        wheelsW: ents.filter(e => e.t === 'waterwheel').map(e => ({ x: e.x * ts + 8, y: e.y * ts + 8, basket: e.basket, a: 0 })), clock: 0 };
    }
    /* each foe's squad, by name (main.js does not carry an ent's squad onto the foe it spawns): matched by kind and spawn point, every spawn */
    for (const q of L.ents) { if (!q.squad) continue; const px = q.x * ctx.TS + 8, py = (q.y + 1) * ctx.TS;
      const e = ctx.enemies().find(f => f.alive && f.t === q.t && !f.rgSquad && Math.abs(f.x - px) < 4 && Math.abs(f.y - py) < 40); if (e) e.rgSquad = q.squad; }
    /* a death: the clock goes on, a burst in flight ends, a basket goes back to its foot */
    RG.spans = RG.spans.filter(s => s.kind === 'flood'); RG.pending = [];
    for (const m of ctx.movers().filter(q => q.gorge)) { m.y = m.y0; m.dy = 0; m.hold = 0; }
    for (const pp of ctx.players) pp.rgSwept = null;
    if (window.BK) Object.assign(window.BK, { redgorge: () => RG, redgorgeHands: () => H });
  };
  H.on = () => !!RG;
  H.state = () => RG;

  /* ---------- THE WATER: which rows of which channel run now ---------- */
  const chOf = id => RG.channels.find(c => c.id === id);
  const gatesIn = id => RG.gates.filter(g => g.ch === id).sort((a, b) => a.row - b.row);
  /* where a flood from the top of channel c stops now: the first SHUT gate (a full one overtops); returns [y0, y1] or null */
  const floodSpan = c => { for (const g of gatesIn(c.id)) if (g.row >= c.y0 - 1 && g.state === 'shut') return g.row >= c.y0 ? [c.y0, g.row] : null; return [c.y0, c.y1]; };
  /* where a burst released at gate g runs: from its row down to the next shut gate (which it fills) or the channel's foot */
  const burstSpan = (c, g) => { for (const q of gatesIn(c.id)) if (q.row > g.row && q.state === 'shut') return [g.row + 1, q.row, q]; return [g.row + 1, c.y1, null]; };
  const wetAt = (x, y, kinds) => { const tx = Math.floor(x / ctx.TS), ty = Math.floor(y / ctx.TS);
    for (const s of RG.spans) { if (kinds && !kinds.includes(s.kind)) continue; const c = chOf(s.ch); if (tx >= c.x0 && tx <= c.x1 && ty >= s.y0 && ty <= s.y1) return s; } return null; };
  H.wetAt = (x, y, kinds) => RG ? wetAt(x, y, kinds) : null;
  const running = (chId, row, kinds) => RG.spans.some(s => s.ch === chId && row >= s.y0 && row <= s.y1 && (!kinds || kinds.includes(s.kind)));

  /* THE JAM'S KNIVES (squad 'jamDrop'): they wait on the overhang's top over bridge four and leap down the slot by the wheel when its gate is shut -
     the bank's ten seconds are a fight. Each walks west off the overhang's lip (rgLeap) and falls to the bridge (src/red-gorge.js) */
  const leap = () => { for (const e of ctx.enemies()) if (e.alive && e.rgSquad === 'jamDrop' && !e.rgLeapt) { e.rgLeapt = true; e.rgLeap = 4; } };
  /* ---------- INTERACT (E): a wheel, or the old nest ---------- */
  H.interact = P => {
    if (!RG) return false;
    const w = RG.wheels.filter(q => Math.abs(q.x - P.x) <= GORGE.wellR && Math.abs(q.y - P.y) <= 20).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (w) { if (w.cd > 0) return true; w.cd = 0.4; const g = RG.gates.find(q => q.id === w.gate); if (!g) return true;
      if (RG.pending.some(p => p.g === g)) return true;
      ctx.sfx.ratchet && ctx.sfx.ratchet(); ctx.sparks(w.x, w.y - 16, P.face || 1, 3);
      if (g.state === 'open') { g.state = 'shut'; g.fx = 0.5; RG.n.shut++; if (g.id === 'jam') leap(); ctx.sfx.gateDrop && ctx.sfx.gateDrop(); ctx.number(w.x, w.y - 34, 'THE GATE IS SHUT: IT HOLDS THE NEXT FLOOD', '#7ab8e8'); }
      else if (g.state === 'shut') { g.state = 'open'; g.fx = 0.5; ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.number(w.x, w.y - 34, 'THE GATE IS OPEN', '#ffd36b'); }
      else { RG.pending.push({ g, t: GORGE.release.tell }); g.fx = GORGE.release.tell; ctx.sfx.gateLift && ctx.sfx.gateLift(); ctx.shake(2); ctx.number(w.x, w.y - 34, 'RELEASED: THE WATER COMES DOWN', '#8fd160'); }
      return true; }
    const n = RG.nest;
    if (n && !n.open && Math.abs(n.x - P.x) <= 26 && Math.abs(n.y - P.y) <= 20) {
      if (ctx.questGot() >= ctx.questN()) { n.open = true; for (const v of RG.vault) { v.open = true; for (const [x, y] of cellsOf(v)) ctx.cellOpen(x, y); }
        ctx.sfx.crumble && ctx.sfx.crumble(); ctx.shake(3); ctx.burst(n.x, n.y - 10, 18, ['#c9962a', '#7a5a3a', '#e8dcc0'], 70, 0.8); ctx.number(n.x, n.y - 34, 'THE OLD NEST OPENS', '#8fd160'); }
      else ctx.number(n.x, n.y - 34, 'THE OLD NEST WANTS FOUR FEATHERS', '#ffd36b');
      return true; }
    return false;
  };

  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    if (!RG) return;
    const P0 = ctx.hero(); RG.clock = (RG.clock || 0) + dt; if (!P0.dead) stall(P0, dt);
    /* THE CLOCK: dry -> horn -> flood (phase two of the crab's fight: the dry spells shorten) */
    RG.t -= dt;
    if (RG.t <= 0) {
      if (RG.phase === 'dry') { RG.phase = 'horn'; RG.t += GORGE.horn; ctx.sfx.hornBlast && ctx.sfx.hornBlast(); ctx.sfx.rumble && ctx.sfx.rumble();
        (RG.said['horn'] ? 0 : (RG.said['horn'] = 1, ctx.number(P0.x, P0.y - 34, 'THE HORN: THE FLOOD IS COMING', '#ff9a5c'))); }
      else if (RG.phase === 'horn') { RG.phase = 'flood'; RG.t += GORGE.run; RG.n.floods++; RG.id++; ctx.sfx.waveCrash && ctx.sfx.waveCrash();
        for (const c of RG.channels) { const held = gatesIn(c.id).find(g => g.row >= c.y0 - 1 && g.state === 'shut'); const sp = floodSpan(c);
          if (held) { held.state = 'full'; held.fx = 0.8; RG.n.held++; if (Math.abs(held.row * ctx.TS - P0.y) < 260 && Math.abs((c.x0 + 2) * ctx.TS - P0.x) < 360) ctx.number((c.x0 + 2.5) * ctx.TS, held.row * ctx.TS - 10, 'THE GATE HOLDS THE FLOOD', '#7ab8e8'); }
          if (sp) RG.spans.push({ ch: c.id, y0: sp[0], y1: sp[1], t: GORGE.run, kind: 'flood', id: 'f' + RG.id + c.id }); } }
      else { RG.phase = 'dry'; RG.t += ctx.crabPhase && ctx.crabPhase() === 2 ? ctx.crabDry() : GORGE.dry; }
    }
    /* A RELEASE: the gate creaks (its tell), then the banked water comes down below it at once */
    for (const p of RG.pending) { p.t -= dt; if (p.t > 0) continue; const g = p.g, c = chOf(g.ch); g.state = 'open'; RG.n.releases++; RG.id++;
      const [y0, y1, next] = burstSpan(c, g); if (next) next.state = 'full';
      RG.spans.push({ ch: c.id, y0, y1, t: GORGE.release.run, kind: 'burst', id: 'b' + RG.id, gate: g.id }); ctx.sfx.waveCrash && ctx.sfx.waveCrash(); ctx.shake(4);
      /* A JAM in its way is washed out */
      for (const j of RG.jams) if (!j.open && j.x0 <= c.x1 && j.x1 >= c.x0 && j.y1 >= y0 && j.y0 <= y1) { j.open = true; RG.n.jams++; for (const [x, y] of cellsOf(j)) ctx.cellOpen(x, y);
        ctx.burst((j.x0 + j.x1 + 1) * ctx.TS / 2, (j.y0 + 2) * ctx.TS, 24, ['#6a4426', '#8a5a32', '#7ab8e8', '#e8f4f8'], 110, 1.0); ctx.sfx.crumble && ctx.sfx.crumble();
        ctx.number((j.x0 + 2.5) * ctx.TS, j.y0 * ctx.TS - 8, 'THE JAM BREAKS', '#8fd160'); } }
    RG.pending = RG.pending.filter(p => p.t > 0);
    for (const s of RG.spans) s.t -= dt;
    RG.spans = RG.spans.filter(s => s.t > 0);
    for (const g of RG.gates) g.fx = Math.max(0, g.fx - dt);
    for (const w of RG.wheels) w.cd = Math.max(0, w.cd - dt);
    for (const w of RG.wheelsW) { const b = ctx.movers().find(m => m.gorge === w.basket); if (b && running(b.gch || 'gorge', b.wheelRow)) w.a += dt * 9; }
    /* A RAPTOR'S STOOP OVER THE RAPIDS knocks you in (claude/redgorge2): a hero hit while he stands on a stone or a timber over the water goes in downstream */
    for (const pp of ctx.players) if (pp.rgKnock > 0) { pp.rgKnock -= dt; if (pp.rgKnockGo) { pp.rgKnockGo = false; ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return; P.onMover = null; P.ground = false; P.vx = RAPIDS.knock[0]; P.vy = RAPIDS.knock[1]; });
      if (!RG.said.knock) { RG.said.knock = 1; ctx.number(pp.x, pp.y - 34, 'THE STOOP KNOCKS YOU INTO THE RIVER', '#ff9a5c'); } } }
    /* THE TORRENT ON THE HEROES: once a flood, a blow and down through the bridge; while in it, pushed down and out to the nearer bank */
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (P.dead) return;
      const s = wetAt(P.x, P.y - 8); if (!s) return; const c = chOf(s.ch), k = 1;
      if (pp.rgSwept !== s.id) { pp.rgSwept = s.id; RG.n.swept++; P.climb = false; if (c.id === 'gorge') P.drop = Math.max(P.drop || 0, 0.3);
        ctx.hurtHero(P.x, Math.round((c.id === 'dam' ? GORGE.damDmg : GORGE.dmg) * k), { unblockable: true, noKnock: true, name: s.kind === 'burst' ? 'THE BURST' : 'THE FLOOD' });
        ctx.burst(P.x, P.y - 10, 10, ['#7ab8e8', '#e8f4f8'], 80, 0.5); (RG.said['swept'] ? 0 : (RG.said['swept'] = 1, ctx.number(P.x, P.y - 34, 'THE FLOOD TAKES YOU', '#ff9a5c'))); }
      if (c.id === 'gorge' && !P.ground) P.vy = Math.max(P.vy || 0, GORGE.down * k);
      const mid = (c.x0 + c.x1 + 1) * ctx.TS / 2; ctx.moveHero((P.x < mid ? -1 : 1) * GORGE.push * k * dt); });
    for (const e of ctx.enemies()) if (e.rgLeap > 0 && e.alive) { e.rgLeap -= dt; if (e.y < 69 * ctx.TS) ctx.moveFoe(e, -80 * dt); else e.rgLeap = 0; }
    /* AND ON THE FOES: THE FLOOD TAKES THEM (the review: it did a third of a bandit's life and left him on the bridge). A common foe the water
       catches is dropped through the bridge, pushed out to the nearer bank as a hero is, and loses GORGE.foeFlood of his life (two floods and he is
       gone); a released BURST takes a common foe outright (the jam-lip slinger is dug into the flotsam over the water's line: only the burst that breaks the jam takes him). An elite, a flyer and the boss stand it. Only near a hero (GORGE.foeNear px): a bandit
       idling in the channel far up the gorge is waiting there for you, not washed away before you ever see him */
    const nearHero = e => ctx.players.some(pp => !pp.dead && Math.abs(pp.x - e.x) < GORGE.foeNear[0] && Math.abs(pp.y - e.y) < GORGE.foeNear[1]);
    for (const e of ctx.enemies()) { if (!e.alive || e.noGrav || e.boss || e.t === 'gorgecrab') continue;
      if (e.rgFall > 0) e.rgFall = Math.max(0, e.rgFall - dt);
      const s = wetAt(e.x, e.y - 6); if (!s || (e.rgSquad === 'jamSling' && s.kind !== 'burst')) continue; const c = chOf(s.ch), mid = (c.x0 + c.x1 + 1) * ctx.TS / 2, common = !e.elite;
      if (e.rgSwept !== s.id) { if (!nearHero(e)) continue; e.rgSwept = s.id; RG.n.foesSwept++; ctx.burst(e.x, e.y - 8, 8, ['#7ab8e8', '#e8f4f8'], 70, 0.5);
        if (common && s.kind === 'burst') { RG.n.foesTaken++; ctx.hurtFoe(e, (e.hp || 1) + 999); ctx.number(e.x, e.y - 24, 'SWEPT AWAY', '#7ab8e8'); continue; }
        ctx.hurtFoe(e, common ? Math.ceil((e.maxHp || e.hp || 30) * GORGE.foeFlood) : GORGE.foeDmg); e.vy = 160;
        if (common && !RG.said.foeSwept) { RG.said.foeSwept = 1; ctx.number(e.x, e.y - 24, 'THE FLOOD TAKES HIM', '#7ab8e8'); } }
      if (!common || !e.alive) continue;
      if (c.id === 'gorge') e.rgFall = 0.2;   /* through the bridge (main.js updateDesertFoe: a foe with rgFall falls through a one-way) */
      ctx.moveFoe(e, (e.x < mid ? -1 : 1) * GORGE.push * dt); }
    /* THE GATES, THE JAMS, THE BASKETS, THE NEST: what each is for, the first time you stand by it */
    for (const w of RG.wheels) if (!RG.said['w' + w.gate] && Math.abs(w.x - P0.x) < 44 && Math.abs(w.y - P0.y) < 24) (RG.said['w' + w.gate] ? 0 : (RG.said['w' + w.gate] = 1, ctx.number(P0.x, P0.y - 34, 'E AT THE WHEEL: SHUT THE GATE, OR RELEASE WHAT IT HOLDS', '#ffd36b')));
    for (const j of RG.jams) if (!j.open && !RG.said.jam && Math.abs((j.x0 + 2.5) * ctx.TS - P0.x) < 80 && Math.abs((j.y1 + 1) * ctx.TS - P0.y) < 24) (RG.said['jam'] ? 0 : (RG.said['jam'] = 1, ctx.number(P0.x, P0.y - 34, 'A JAM: ONLY A RELEASED BURST MOVES IT', '#ffd36b')));
    for (const m of ctx.movers()) if (m.gorge && !RG.said['b' + m.gorge] && Math.abs(m.x + 16 - P0.x) < 48 && Math.abs(m.y0 - P0.y) < 24) (RG.said['b' + m.gorge] ? 0 : (RG.said['b' + m.gorge] = 1, ctx.number(P0.x, P0.y - 34, 'THE WHEEL TURNS WHEN THE WATER RUNS', '#ffd36b')));
    for (const r of RG.ropes) if (!RG.said.rope && !P0.climb && r.r1 - r.r0 >= 12 && Math.abs(r.x - P0.x) < 56 && P0.y > r.y0 - 8 && P0.y < r.y1 + 40) { RG.said.rope = 1; ctx.number(P0.x, P0.y - 34, 'CLIMB THE ROPE: UP', '#ffd36b'); }
    const n = RG.nest; if (n && !n.open && !RG.said.nest && Math.abs(n.x - P0.x) < 48 && Math.abs(n.y - P0.y) < 24 && ctx.questGot() < ctx.questN()) (RG.said['nest'] ? 0 : (RG.said['nest'] = 1, ctx.number(P0.x, P0.y - 34, 'THE OLD NEST WANTS FOUR FEATHERS', '#ffd36b')));
  };

  /* ---------- THE GLINT AND THE NUDGE: what the climb needs next, by where the hero is (the route list: src/stuck-spots.js STUCK_HANDS) ---------- */
  const handsState = name => name === 'gate.falls' ? ((RG.gates.find(q => q.id === 'falls') || {}).state || '') : name === 'jam' ? (RG.jams[0] ? (RG.jams[0].open ? 'open' : 'closed') : '') : '';
  const stall = (P, dt) => { const TS = ctx.TS, r = resolve('redgorge', Math.floor(P.x / TS), Math.floor((P.y - 1) / TS), { TS, props: [], movers: ctx.movers(), hero: P, state: handsState }, STUCK_HANDS);
    const stalls = RG.stalls = RG.stalls || {};   /* one clock per key: its 'said' outlasts a change of key, the headway clock starts again with it */
    if (!r) { RG.glint = null; RG.stallKey = null; return; } const t = r.targets[0]; RG.glint = { key: r.key, x: t.x, y: t.y };
    const C = stalls[r.key] = stalls[r.key] || newStall(); if (r.key !== RG.stallKey) { RG.stallKey = r.key; C.t = 0; C.best = 1e9; }
    if (stallTick(C, P.y, dt, RG.clock, false)) { RG.n.nudges++; RG.lastNudge = r.line; ctx.number(P.x, P.y - 34, r.line, '#ffe9a0'); } };
  /* ---------- A BASKET: called from updateMovers before the generic lift (it moves only on running water) ---------- */
  H.basket = (m, dt) => {
    const oy = m.y; m.dx = 0;
    if (RG && running(m.gch || 'gorge', m.wheelRow)) { m.hold = BASKET.hold; m.y = Math.max(m.y1, m.y - (m.y0 - m.y1) / BASKET.rise * dt); if (oy > m.y1 + 4 && m.y <= m.y1 + 4 && RG) RG.n.rides++; }
    else if (m.hold > 0) m.hold -= dt;
    else if (m.y < m.y0) m.y = Math.min(m.y0, m.y + Math.max(BASKET.sink, (m.y0 - m.y1) / BASKET.fall) * dt);
    m.dy = m.y - oy; return true;
  };

  /* ---------- A DRIFTING TIMBER (THE RAPIDS, claude/redgorge2): it slides down the current (WEST, towards the gorge's mouth) and bobs; at the end of its reach it goes under the
     next stone and comes up again upstream (east) (whoever stood on it is in the water). THE HORN TURNS THE CALM TO RAPIDS: three times the pace ---------- */
  H.rapids = () => !!RG && (RG.phase === 'horn' || RG.phase === 'flood');
  H.debris = (m, dt) => {
    const ox = m.x, oy = m.y; if (m.dt === undefined) { m.dt = 0; m.x = m.x1 - (m.x1 - m.x0) * (m.phase || 0); }
    const v = RG && H.rapids() ? RAPIDS.rapids : RAPIDS.calm; m.x -= v * dt; m.dt += dt; m.fast = v > RAPIDS.calm;
    if (m.x < m.x0) { m.x = m.x1; for (const pp of ctx.players) if (pp.onMover === m) { pp.onMover = null; pp.ground = false; } m.under = 0.4; }
    if (m.under > 0) m.under -= dt;
    m.y = m.y0 + Math.sin(m.dt * 3 + (m.phase || 0) * 6) * RAPIDS.bob; m.dx = m.x - ox; m.dy = m.y - oy; if (m.dx > 0) m.dx = 0; return true; };

  /* ---------- THE RAPTOR: the vulture's machine, keeping its own bridge ---------- */
  H.raptorStep = (s, w, dt) => {
    if (s.g0 === undefined) s.g0 = s.groundY;   /* the bridge it keeps */
    if (s.mode === 'circle') { s.groundY = s.g0; if (Math.abs(w.py - s.g0) > RAPTOR.sightY) s.cd = Math.max(s.cd, 0.4); }
    const was = s.mode, out = vultureStep(s, w, dt); for (const v of out) if (v.t === 'hit') v.dmg = RAPTOR.dmg;
    /* over the rapids, a stoop that comes down on you knocks you into the river (the hands' update throws you in) */
    if (was === 'dive' && s.mode !== 'dive' && RG && RG.L.pools && RG.L.pools.some(p => p.rapids && s.x > p.x0 - 48 && s.x < p.x1 + 48 && Math.abs(s.y - p.y) < 60))
      for (const pp of ctx.players) if (!pp.dead && Math.abs(pp.x - s.x) < 18 && Math.abs(pp.y - s.y) < 28) { pp.rgKnock = 0.5; pp.rgKnockGo = true; }
    if (s.mode === 'dive') s.groundY = s.ty;   /* it lands where it struck (a rope, the basket, a ledge), not back on its bridge */
    return out; };

  /* ---------- THE DAM, for THE GREAT RED CRAB (src/gorge-crab-hands.js): the plateau's water now ---------- */
  H.dam = () => { if (!RG) return null; const c = chOf('dam'), g = RG.gates.find(q => q.ch === 'dam'); if (!c || !g) return null;
    const floor = c.y1;
    return { phase: RG.phase, horn: RG.phase === 'horn' && !!floodSpan(c), running: running('dam', floor, ['flood']), burst: running('dam', floor, ['burst']), held: g.state === 'full', gate: g.state,
      pending: RG.pending.some(p => p.g === g), x0: c.x0 * ctx.TS, x1: (c.x1 + 1) * ctx.TS, t: RG.t }; };

  /* ---------- DRAWING (greybox) ---------- */
  /* what the art needs from the hands (src/redraw/redgorge_props.js) */
  const scene = () => ({ channels: RG.channels, spans: RG.spans, gates: RG.gates, wheels: RG.wheels, wheelsW: RG.wheelsW.map(w => { const b = ctx.movers().find(m => m.gorge === w.basket); w.run = !!(b && running('gorge', b.wheelRow)); return w; }), jams: RG.jams, nest: RG.nest, vault: RG.vault, phase: RG.phase, t: RG.t, L: RG.L, floodSpan, chOf });
  const kit = (cx, cy, time) => ({ TS: ctx.TS, cx, cy, vw: ctx.VW(), vh: ctx.VH(), time, movers: ctx.movers, questGot: ctx.questGot, questN: ctx.questN });
  H.drawOver = (g, cx, cy, time) => { if (RG) RGP.drawOver(g, scene(), kit(cx, cy, time)); };
  H.drawWorld = (g, cx, cy, time) => {
    if (!RG) return; const R = Math.round, vw = ctx.VW(), vh = ctx.VH();
    RGP.drawBack(g, scene(), kit(cx, cy, time));   /* the art lives in src/redraw/redgorge_props.js (claude/redgorge-art) */
    /* THE LONG ROPES' FEET: a frayed end and two grip knots at a reachable height, so a rope reads as a thing to climb (Daniel 10-03) */
    for (const r of RG.ropes) { if (r.r1 - r.r0 < 12) continue; const x = R(r.x - cx), yb = R(r.y1 - cy); if (x < -8 || x > vw + 8 || yb < -8 || yb > vh + 40) continue;
      g.fillStyle = '#d9b36a'; for (const ky of [yb - 6, yb - 22]) { g.fillRect(x - 2, ky, 5, 3); g.fillStyle = '#7a5a30'; g.fillRect(x - 2, ky + 3, 5, 1); g.fillStyle = '#d9b36a'; }
      g.fillStyle = '#b8924a'; g.fillRect(x - 3, yb, 1, 3); g.fillRect(x - 1, yb, 1, 5); g.fillRect(x + 1, yb, 1, 4); g.fillRect(x + 3, yb, 1, 2); }
    /* THE RAPIDS' WHITE WATER (claude/redgorge2): streaks on the river - a few in the calm, a race of them in the horn's rapids - and the timbers drawn plain */
    { const fast = H.rapids(); for (const p of RG.L.pools || []) { if (!p.rapids) continue; const x0 = R(p.x0 - cx), x1 = R(p.x1 - cx), y = R(p.y - cy); if (x1 < -8 || x0 > vw + 8 || y < -8 || y > vh + 8) continue;
        g.fillStyle = fast ? 'rgba(232,244,248,0.85)' : 'rgba(232,244,248,0.45)'; const step = fast ? 6 : 13, sp = fast ? 140 : 26;
        for (let x = x0 + ((time * sp) % step); x < x1 - 3; x += step) g.fillRect(R(x), y + ((x >> 3) % 3), fast ? 4 : 3, 1); }
      for (const m of ctx.movers()) { if (!m.debris) continue; const x = R(m.x - cx), y = R(m.y - cy); if (x < -40 || x > vw + 8 || y < -8 || y > vh + 8) continue;
        g.fillStyle = m.what === 'crate' ? '#8a5a32' : m.what === 'branch' ? '#5a3a1e' : '#9a7044'; g.fillRect(x, y, m.w, 5); g.fillStyle = '#c8945a'; g.fillRect(x + 2, y, m.w - 4, 1);
        if (m.what === 'crate') { g.fillStyle = '#6a4426'; g.fillRect(x + 4, y - 6, 12, 6); } if (m.what === 'branch') { g.fillStyle = '#5a3a1e'; g.fillRect(x + 20, y - 4, 2, 4); g.fillRect(x + 24, y - 6, 2, 6); }
        g.fillStyle = 'rgba(232,244,248,0.7)'; g.fillRect(x - 2, y + 4, 3, 1); if (m.fast) g.fillRect(x - 6, y + 3, 4, 1); } }
    /* HER PLUMES (B8): long rust crest feathers on the rocks along the way, thicker at the dam's door */
    for (const d of RG.L.decor || []) { if (d.kind !== 'plume') continue; const x = R(d.x * ctx.TS + 8 - cx), y = R((d.y + 1) * ctx.TS - cy); if (x < -8 || x > vw + 8 || y < -20 || y > vh + 8) continue;
      g.fillStyle = '#f0dcb8'; g.fillRect(x - 5, y - 2, 10, 1); g.fillRect(x - 3, y - 3, 8, 1); g.fillStyle = '#c8643a'; g.fillRect(x + 3, y - 3, 3, 1); g.fillStyle = '#7a2e1c'; g.fillRect(x - 6, y - 1, 2, 1); }
    /* THE GLINT over what the climb needs next (the shared glint: src/stuck-guide.js) */
    if (RG.glint) drawGlint(g, R(RG.glint.x - cx), R(RG.glint.y - 18 - cy), vw, vh, time);
  };
  /* THE FLOOD on the HUD, under the sun's meter: the clock to the horn, the horn, the torrent */
  H.drawHud = (g, P) => {
    if (!RG || !P) return; const x = 22, y = 64;
    const col = RG.phase === 'horn' ? (Math.floor(ctx.time() * 8) % 2 ? '#ff6b6b' : '#fff6e0') : RG.phase === 'flood' ? '#7ab8e8' : '#c9b27c';
    ctx.text(RG.phase === 'horn' ? 'HORN' : RG.phase === 'flood' ? 'FLOOD' : 'DRY', x - 12, y + 2, col, 'left', 6);
    const k = RG.phase === 'dry' ? 1 - Math.max(0, RG.t) / GORGE.dry : RG.phase === 'horn' ? 1 : Math.max(0, RG.t) / GORGE.run;
    g.fillStyle = 'rgba(20,20,40,0.6)'; g.fillRect(x + 14, y, 32, 5); g.fillStyle = col; g.fillRect(x + 15, y + 1, Math.round(30 * Math.min(1, k)), 3);
  };
  H.read = () => RG && { glint: RG.glint && RG.glint.key, lastNudge: RG.lastNudge || null, phase: RG.phase, t: RG.t, n: { ...RG.n }, gates: Object.fromEntries(RG.gates.map(q => [q.id, q.state])), jams: RG.jams.map(j => j.open), spans: RG.spans.map(s => ({ ...s })), nest: RG.nest && RG.nest.open, vault: RG.vault.map(v => v.open) };
  return H;
}
