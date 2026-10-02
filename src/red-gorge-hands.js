// src/red-gorge-hands.js - THE RED GORGE's HANDS (claude/redgorge, the greybox). src/red-gorge.js builds the level; this binds its rule to the
// game: THE FLOOD (one clock: dry, the HORN, the TORRENT down every channel), THE SLUICE GATES (E at a wheel: shut / held / released), THE JAMS
// (only a released burst washes one out), THE BASKETS (a water-wheel winds each up its shaft while the water runs past it), THE OLD NEST and its
// vault (four feathers), and THE RAPTOR (the vulture's marked dive, src/desert-foes.js, that only hunts a hero near the bridge it keeps).
// main.js calls: reset, on, update, interact, basket, raptorStep, dam, drawWorld, drawHud, read. Every teaching line goes through ctx.number with a
// line listed in src/hint-lines.js (the hint box). THE GREAT RED CRAB (src/gorge-crab-hands.js) reads the dam's water through dam().
import { vultureStep } from './desert-foes.js';

/* THE FLOOD'S CLOCK (s), its blow, and a released burst. GORGE.horn is the whole warning: two seconds is a dozen tiles at a run, and every place to
   stand in a channel is three tiles or less from dry rock (tools/redgorge.mjs proves it) */
/* (dmg: a flood down the gorge is a fall and a beating; damDmg: the old dam's shallow spillway, where the crab fight is - tuned with the boss pilot at 10) */
export const GORGE = { dry: 6.0, horn: 2.0, run: 2.4, first: 3.0, dmg: 25, damDmg: 10, down: 200, push: 90, foeDmg: 30, foeFlood: 0.5, foeNear: [360, 220], release: { tell: 0.35, run: 1.6 }, wellR: 22 };
export const BASKET = { rise: 2.0, sink: 36, hold: 2.5 };          /* a basket climbs its shaft in RISE s of running water, holds HOLD s at the top, then sinks */
export const RAPTOR = { sightY: 150, hp: 24, dmg: 20 };            /* THE RAPTOR: it hunts only a hero within SIGHTY px (up or down) of the bridge it keeps; its stoop hits harder than a vulture's (20, the vulture 10) */

/* WHAT YOU MUST USE NEXT (Daniel's playtest, 10-02: on bridge two he could not see that the basket was the way on). The canal's answer
   (claude/canalfix3): a pulsing GLINT on the thing the climb needs next, and after NUDGE.after s with no headway up the gorge, a short NUDGE
   naming it (once, then again only after NUDGE.again s). No sign spoils it: the glint says WHERE, the nudge only WHAT */
export const NUDGE = { after: 10, again: 25, rise: 3 };
export const GORGE_NUDGE = {
  fallsRope: 'THE ROPE: CLIMB IT WHILE THE CHANNEL IS DRY',
  basket: 'THE BASKET: STAND ON IT. THE FLOOD WINDS IT UP',
  jam: 'THE WHEEL: SHUT THE GATE, LET IT FILL, THEN RELEASE IT',
  narrowsRope: 'THE ROPE: CLIMB IT WHILE THE CHANNEL IS DRY',
};
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
        jams: (L.jams || []).map(j => ({ ...j, open: false })),
        nest: (() => { const e = ents.find(q => q.t === 'oldnest'); return e ? { x: e.x * ts + 8, y: (e.y + 1) * ts, open: false } : null; })(),
        vault: (L.vaultDoors || []).map(v => ({ ...v, open: false })),
        wheelsW: ents.filter(e => e.t === 'waterwheel').map(e => ({ x: e.x * ts + 8, y: e.y * ts + 8, basket: e.basket, a: 0 })) };
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
    for (const w of RG.wheelsW) { const b = ctx.movers().find(m => m.gorge === w.basket); if (b && running('gorge', b.wheelRow)) w.a += dt * 9; }
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
    const n = RG.nest; if (n && !n.open && !RG.said.nest && Math.abs(n.x - P0.x) < 48 && Math.abs(n.y - P0.y) < 24 && ctx.questGot() < ctx.questN()) (RG.said['nest'] ? 0 : (RG.said['nest'] = 1, ctx.number(P0.x, P0.y - 34, 'THE OLD NEST WANTS FOUR FEATHERS', '#ffd36b')));
  };

  /* ---------- THE GLINT AND THE NUDGE: what the climb needs next, by where the hero is ---------- */
  const nextThing = P => { const ts = ctx.TS, row = P.y / ts, col = P.x / ts, bk = id => ctx.movers().find(m => m.gorge === id);
    const onB = m => m && P.onMover === m, jam = RG.jams[0];
    if (row > 118.5 && row <= 136.5 && col > 19 && !P.climb) return { key: 'fallsRope', x: 24 * ts + 8, y: 135 * ts };
    if (row > 100.5 && row <= 118.5) { const m = bk('ledges'); if (m && !onB(m)) return { key: 'basket', x: m.x + 16, y: m.y - 4 }; }
    if (row > 66 && row <= 70.5 && jam && !jam.open && col > 26) { const w = RG.wheels.find(q => q.gate === 'jam'); return { key: 'jam', x: w.x, y: w.y - 30 }; }
    if (row > 66 && row <= 70.5 && jam && jam.open) { const m = bk('narrows'); if (m && !onB(m)) return { key: 'basket', x: m.x + 16, y: m.y - 4 }; }
    if (row > 60 && row <= 65.5 && col < 22 && !P.climb) return { key: 'narrowsRope', x: 22 * ts + 8, y: 62 * ts };
    return null; };
  const stall = (P, dt) => { const tg = RG.glint = nextThing(P), C = RG.stall = RG.stall || { key: null, t: 0, best: 1e9, said: {} };
    if (!tg) { C.key = null; return; } if (tg.key !== C.key) { C.key = tg.key; C.t = 0; C.best = P.y; }
    if (P.y < C.best - NUDGE.rise * ctx.TS) { C.best = P.y; C.t = 0; }
    C.t += dt; const last = C.said[tg.key]; if (C.t >= NUDGE.after && (last === undefined || RG.clock - last >= NUDGE.again)) { C.said[tg.key] = RG.clock; RG.n.nudges++; RG.lastNudge = GORGE_NUDGE[tg.key]; const x = P.x, y = P.y - 34, c = '#ffe9a0';   /* (each line a literal: tools/hint-shown reads the calls) */
      if (tg.key === 'basket') ctx.number(x, y, 'THE BASKET: STAND ON IT. THE FLOOD WINDS IT UP', c); else if (tg.key === 'jam') ctx.number(x, y, 'THE WHEEL: SHUT THE GATE, LET IT FILL, THEN RELEASE IT', c); else ctx.number(x, y, 'THE ROPE: CLIMB IT WHILE THE CHANNEL IS DRY', c); } };
  /* ---------- A BASKET: called from updateMovers before the generic lift (it moves only on running water) ---------- */
  H.basket = (m, dt) => {
    const oy = m.y; m.dx = 0;
    if (RG && running('gorge', m.wheelRow)) { m.hold = BASKET.hold; m.y = Math.max(m.y1, m.y - (m.y0 - m.y1) / BASKET.rise * dt); if (oy > m.y1 + 4 && m.y <= m.y1 + 4 && RG) RG.n.rides++; }
    else if (m.hold > 0) m.hold -= dt;
    else if (m.y < m.y0) m.y = Math.min(m.y0, m.y + BASKET.sink * dt);
    m.dy = m.y - oy; return true;
  };

  /* ---------- THE RAPTOR: the vulture's machine, keeping its own bridge ---------- */
  H.raptorStep = (s, w, dt) => {
    if (s.g0 === undefined) s.g0 = s.groundY;   /* the bridge it keeps */
    if (s.mode === 'circle') { s.groundY = s.g0; if (Math.abs(w.py - s.g0) > RAPTOR.sightY) s.cd = Math.max(s.cd, 0.4); }
    const out = vultureStep(s, w, dt); for (const v of out) if (v.t === 'hit') v.dmg = RAPTOR.dmg;
    if (s.mode === 'dive') s.groundY = s.ty;   /* it lands where it struck (a rope, the basket, a ledge), not back on its bridge */
    return out; };

  /* ---------- THE DAM, for THE GREAT RED CRAB (src/gorge-crab-hands.js): the plateau's water now ---------- */
  H.dam = () => { if (!RG) return null; const c = chOf('dam'), g = RG.gates.find(q => q.ch === 'dam'); if (!c || !g) return null;
    const floor = c.y1;
    return { phase: RG.phase, horn: RG.phase === 'horn' && !!floodSpan(c), running: running('dam', floor, ['flood']), burst: running('dam', floor, ['burst']), held: g.state === 'full', gate: g.state,
      pending: RG.pending.some(p => p.g === g), x0: c.x0 * ctx.TS, x1: (c.x1 + 1) * ctx.TS, t: RG.t }; };

  /* ---------- DRAWING (greybox) ---------- */
  H.drawWorld = (g, cx, cy, time) => {
    if (!RG) return; const R = Math.round, ts = ctx.TS, vw = ctx.VW(), vh = ctx.VH();
    const onY = (y0, y1) => y1 > cy - 20 && y0 < cy + vh + 20;
    for (const c of RG.channels) { const x0 = R(c.x0 * ts - cx), wpx = (c.x1 - c.x0 + 1) * ts; if (x0 > vw || x0 + wpx < 0) continue;
      /* the scoured channel: pale streaks down its rock (the rule's second voice) */
      g.globalAlpha = 0.18; g.fillStyle = '#f0d8c0'; for (let k = 0; k < wpx; k += 7) g.fillRect(x0 + k, R(Math.max(c.y0 * ts, cy) - cy), 2, R(Math.min((c.y1 + 1) * ts, cy + vh) - Math.max(c.y0 * ts, cy))); g.globalAlpha = 1;
      /* THE HORN: a trickle down the channel where the flood will run */
      if (RG.phase === 'horn') { const sp = floodSpan(c); if (sp && onY(sp[0] * ts, (sp[1] + 1) * ts)) { g.fillStyle = 'rgba(122,184,232,0.55)';
        for (let k = 3; k < wpx; k += 11) for (let y = Math.max(sp[0] * ts, cy); y < Math.min((sp[1] + 1) * ts, cy + vh); y += 9) g.fillRect(x0 + k + (R(time * 30 + y) % 3), R(y - cy + (time * 120) % 9), 1, 4); } } }
    /* THE TORRENT (a flood) and THE BURST: the water down its span */
    for (const s of RG.spans) { const c = chOf(s.ch), x0 = R(c.x0 * ts - cx), wpx = (c.x1 - c.x0 + 1) * ts, ya = Math.max(s.y0 * ts, cy - 4), yb = Math.min((s.y1 + 1) * ts, cy + vh + 4); if (yb <= ya) continue;
      g.fillStyle = s.kind === 'burst' ? 'rgba(58,122,184,0.72)' : 'rgba(90,150,200,0.6)'; g.fillRect(x0, R(ya - cy), wpx, R(yb - ya));
      g.fillStyle = 'rgba(232,244,248,0.7)'; for (let k = 2; k < wpx; k += 6) for (let y = ya; y < yb; y += 14) g.fillRect(x0 + k, R(y - cy + (time * 340 + k * 7) % 14), 1, 6); }
    /* THE GATES: timber across the channel - shut is set down, full has the water banked over it, open is raised */
    for (const gt of RG.gates) { const c = chOf(gt.ch), x0 = R(c.x0 * ts - cx), wpx = (c.x1 - c.x0 + 1) * ts, y = R(gt.row * ts - cy); if (y < -40 || y > vh + 20) continue;
      if (gt.state === 'open') { g.fillStyle = '#5a3a1e'; g.fillRect(x0 - 2, y - 2, 2, 18); g.fillRect(x0 + wpx, y - 2, 2, 18); g.fillStyle = '#7a5230'; g.fillRect(x0, y - 4, wpx, 3); continue; }
      if (gt.state === 'full') { g.fillStyle = 'rgba(58,122,184,0.75)'; g.fillRect(x0, y - 22, wpx, 22); g.fillStyle = '#e8f4f8'; g.fillRect(x0 + (R(time * 20) % wpx), y - 22, 3, 1); }
      g.fillStyle = '#6a4426'; g.fillRect(x0, y, wpx, 12); g.fillStyle = '#8a5a32'; for (let k = 0; k < wpx; k += 8) g.fillRect(x0 + k, y + 1, 6, 10); g.fillStyle = '#3a2410'; g.fillRect(x0, y + 5, wpx, 2);
      if (gt.fx > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x0, y - 1, wpx, 1); } }
    /* THE WHEELS: a spoked wheel on a post, its rope to the gate */
    for (const w of RG.wheels) { const x = R(w.x - cx), y = R(w.y - cy); if (x < -30 || x > vw + 30 || y < -30 || y > vh + 30) continue; const gt = RG.gates.find(q => q.id === w.gate);
      g.fillStyle = '#5a3a1e'; g.fillRect(x - 1, y - 14, 3, 14); g.strokeStyle = gt && gt.state === 'full' ? '#7ab8e8' : gt && gt.state === 'shut' ? '#c9b27c' : '#8a5a32'; g.lineWidth = 2;
      g.beginPath(); g.arc(x + 0.5, y - 16, 7, 0, Math.PI * 2); g.stroke(); const a = time * (gt && gt.fx > 0 ? 8 : 0); g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(x + 0.5, y - 16); g.lineTo(x + 0.5 + Math.cos(a + k * Math.PI / 2) * 7, y - 16 + Math.sin(a + k * Math.PI / 2) * 7); } g.stroke();
      if (gt) { g.fillStyle = gt.state === 'full' ? '#7ab8e8' : gt.state === 'shut' ? '#c9b27c' : '#6a5a40'; g.fillRect(x - 3, y - 30, 7, 3); } }
    /* THE WATER-WHEELS by the baskets, and each basket's rope */
    for (const w of RG.wheelsW) { const x = R(w.x - cx), y = R(w.y - cy); if (y < -30 || y > vh + 30) continue; g.strokeStyle = '#6a4426'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.stroke();
      g.beginPath(); for (let k = 0; k < 6; k++) { g.moveTo(x, y); g.lineTo(x + Math.cos(w.a + k * Math.PI / 3) * 11, y + Math.sin(w.a + k * Math.PI / 3) * 11); } g.stroke(); }
    for (const m of ctx.movers()) if (m.gorge) { const x = R(m.x - cx), y = R(m.y - cy); if (y < -40 || y > vh + 40) continue; g.fillStyle = '#c9b27c'; g.fillRect(x + 15, R(m.y1 - 40 - cy), 1, Math.max(0, y - R(m.y1 - 40 - cy)));
      g.fillStyle = '#6a4426'; g.fillRect(x, y, m.w, 8); g.fillStyle = '#8a5a32'; for (let k = 1; k < m.w; k += 5) g.fillRect(x + k, y + 1, 3, 6);
      g.fillStyle = '#c9a060'; g.fillRect(x - 1, y - 7, 2, 15); g.fillRect(x + m.w - 1, y - 7, 2, 15); g.fillRect(x - 1, y - 7, m.w + 1, 1); g.fillStyle = '#8a6a3a'; for (let k = 2; k < m.w; k += 4) g.fillRect(x + k, y + 8, 2, 3); }   /* (the playtest: a woven basket with sides and a rim on its rope, not one more plank of the bridge) */
    /* THE JAMS: flotsam - branches and a drowned cart's wheel - wedged in the channel */
    for (const j of RG.jams) { if (j.open) continue; const x = R(j.x0 * ts - cx), y = R(j.y0 * ts - cy), wpx = (j.x1 - j.x0 + 1) * ts, h = (j.y1 - j.y0 + 1) * ts; if (y > vh || y + h < 0) continue;
      g.fillStyle = '#4e3622'; g.fillRect(x, y, wpx, h); g.strokeStyle = '#8a5a32'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 9; k++) { const a = (k * 37) % 13 / 13; g.moveTo(x + a * wpx, y + ((k * 11) % h)); g.lineTo(x + ((a + 0.4) % 1) * wpx, y + ((k * 23 + 9) % h)); } g.stroke();
      g.strokeStyle = '#c9b27c'; g.beginPath(); g.arc(x + wpx * 0.6, y + h * 0.55, 9, 0, Math.PI * 2); g.stroke(); }
    /* THE OLD NEST and its vault door of woven branches */
    const n = RG.nest; if (n) { const x = R(n.x - cx), y = R(n.y - cy); g.fillStyle = '#7a5a3a'; g.fillRect(x - 12, y - 7, 24, 7); g.fillStyle = '#c9962a'; for (let i = 0; i < Math.min(4, ctx.questGot()); i++) g.fillRect(x - 9 + i * 5, y - 13, 2, 6); }
    for (const d of RG.L.decor || []) { const x = R(d.x * ts + 8 - cx), y = R((d.y + 1) * ts - cy); if (x < -30 || x > vw + 30 || y < -30 || y > vh + 30) continue;
      if (d.kind === 'nest') { g.fillStyle = '#6a4426'; g.fillRect(x - 10, y - 5, 20, 5); g.fillStyle = '#8a5a32'; for (let k = -9; k < 10; k += 3) g.fillRect(x + k, y - 7 + (k & 1), 2, 3); }
      else if (d.kind === 'hands') { g.fillStyle = '#e8dcc0'; for (let k = 0; k < 3; k++) { g.fillRect(x - 6 + k * 6, y - 12, 4, 5); for (let q = 0; q < 4; q++) g.fillRect(x - 6 + k * 6 + q, y - 15, 1, 3); } } }
    /* THE GLINT over what the climb needs next (a warm pulsing star and ring; off the screen, a chevron at its edge) */
    if (RG.glint) { const p = RG.glint, x = R(p.x - cx), y = R(p.y - 18 - cy), k = 0.5 + 0.5 * Math.sin(time * 5);
      if (x >= -8 && x <= vw + 8 && y >= -8 && y <= vh + 8) { g.globalAlpha = 0.35 + 0.45 * k; g.strokeStyle = '#ffe9a0'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 9 + 3 * k, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#fff6c8'; const r = 3 + R(3 * k); g.fillRect(x - r, y, r * 2 + 1, 1); g.fillRect(x, y - r, 1, r * 2 + 1); g.fillRect(x - 1, y - 1, 3, 3); g.globalAlpha = 1; }
      else { const ex = Math.max(10, Math.min(vw - 10, x)), ey = Math.max(14, Math.min(vh - 14, y)), dx = Math.sign(x - ex), dy = Math.sign(y - ey); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ffe9a0';
        for (let i = 0; i < 4; i++) g.fillRect(ex + dx * (i - 3) - (dy ? i : 0), ey + dy * (i - 3) - (dx ? i : 0), dy ? i * 2 + 1 : 1, dx ? i * 2 + 1 : 1); g.globalAlpha = 1; } }
    for (const v of RG.vault) if (!v.open) { const x = R(v.x0 * ts - cx), y = R(v.y0 * ts - cy), h = (v.y1 - v.y0 + 1) * ts; g.fillStyle = '#5a3a1e'; g.fillRect(x, y, ts, h); g.strokeStyle = '#8a5a32'; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < h; k += 5) { g.moveTo(x, y + k); g.lineTo(x + ts, y + k + 3); } g.stroke(); }
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
