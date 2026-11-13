// src/whale-hands.js - THE WHALE IN THE GAME (claude/whale, the greybox, 2026-11-06). src/whale.js is the level (data), src/gastric-polyp.js and src/parasite-queen.js
// the two brains (pure); this binds them to the world, and is the level's own wiring of THE WATER KIT (src/tide-kit.js, src/pull-field.js) - no second engine.
// ONLY a level with L.whale: everything here is inert anywhere else (on() is false), so the flag-off game is unchanged.
//   THE BREATH     L.tides (+ L.pullSignal = the breath) on the ONE generic wiring (claude/sea3: src/pirate-fleet-hands.js builds, steps and writes the kit; this file reads it through
//                  ctx.pfh.kit() and hands it H.water, the hooks object): every bile pool is a kit tide on the one breath, the tongue a kit lift, the rafts kit floats.
//   THE NERVES     L.whNerves: a blow makes one FLARE (WH.nerve.flare s: it brightens, the flesh shudders - told), then FORCES the breath through the kit's own verbs
//                  (BELL = call the exhale, SLUICE = call the inhale), struck on hidden props of every tide it drives in the same frame; then it cools.
//   THE MEMBRANES  L.whMembranes: PORT cells opened on the inhale (breath) / only after a FORCED inhale (sealed); they never shut on a body.
//   THE GUSTS      L.pulls through the one wiring's pull field, signed by the breath's phase (hooks: foes = every loose foe but the boss). The chamber's CONSTRICT is one more entry
//                  in L.pulls (id 'constrict'): this file moves its ring onto the Queen and wakes it only while her tendrils pull (H.water.step).
//   THE GUT LEECH  the Bog Leech (src/bog-leech.js) under L.reskin 'gutleech': THE INHALE TEARS IT LOOSE (a latched one drops off as the breath draws in).
//   THE GASTRIC POLYP (src/gastric-polyp.js) and THE PARASITE QUEEN (src/parasite-queen.js): spawn, step, every blow on them, the drawing (GREYBOX).
// main.js calls: water (the hooks), on, clear, spawnEnt, owns, updateEnt, take, update, mover, drawBack, drawMover, drawEnt, drawOver, barName, end, read.
import { tideStrike, gauge, floatY, liftY, TS as KTS } from './tide-kit.js';
import { WH, BREATH_NAME, WH_HEART } from './whale.js';
import * as GPM from './gastric-polyp.js';
import * as PQM from './parasite-queen.js';
import * as WA from './redraw/whale_art.js';   /* (claude/whaleart) the level kit: flesh, nerves, membranes, heart, tongue, raft, bile, lung */
import * as PA from './redraw/gastric_polyp_art.js';   /* (claude/whaleart) the Gastric Polyp's poses + the bile glob */
import * as QA from './redraw/parasite_queen_art.js';   /* (claude/whaleart) the Parasite Queen's poses + her floor pieces */
import * as KA from './redraw/deep3_art.js';   /* (claude/whaleart) the gold OPEN ring and the grey WARD ring (shared with the Deep) */
import * as WB from './redraw/whale_back.js';   /* (claude/seaart2) the whale's inside as a backdrop (drawn under the tiles by ONE hook in main.js's backdrop chain) */
const R = Math.round;
export const WH_HANDS = { nerveW: 12, nerveH: 14, nerveReach: 14 };
export const WH_SAY = { exhale: 'IT BREATHES OUT', inhale: 'IT BREATHES IN', already: 'IT IS DRAWING IN ALREADY', cool: 'THE NERVE IS SPENT', unseal: 'THE CARDIA OPENS', torn: 'THE INHALE TEARS IT LOOSE' };
/* what a strike on a nerve does at each kit phase (see src/whale.js): 'exhale' (the kit's bell), 'inhale' (the kit's sluice) or 'already' */
export const NERVE_DOES = { low: 'exhale', warn: 'inhale', rise: 'inhale', high: 'inhale', turn: 'already', fall: 'already' };

export function makeWhaleHands(ctx) {
  const H = {}; let S = null, Q = null, WORD = null;
  const K = () => { const k = ctx.pfh ? ctx.pfh.kit() : null; if (k && S && S.kit !== k) prep(k); return k; };   /* the ONE wiring's kit (built after this file's clear: made ready on first sight) */
  const PF = () => (ctx.pfh && ctx.pfh.pulls()) || null;
  const lv = () => ctx.L, TS = KTS;
  const on = () => !!(lv() && lv().whale);
  H.on = on;
  H.owns = e => e.t === 'gastricpolyp' || e.t === 'parasitequeen';
  H.clear = () => {
    S = null; Q = null; WORD = null; seen.clear(); if (!on()) return;
    const L = lv();
    S = { told: {}, nerves: {}, mems: [], ph: 'low', sealed: {} };
    for (const n of L.whNerves || []) S.nerves[n.id] = { ...n, cool: 0, flare: 0, kind: null, glow: 0 };
    for (const m of L.whMembranes || []) S.mems.push({ ...m, open: null, sealedOpen: false, shut: 0 });
  };
  /* the kit is first seen: the chamber's P3 tempo writes the tide's T, so each tide gets its own copy of it (not the level's data); the constrict field starts still; the membranes laid by the breath */
  function prep(k) {
    S.kit = k; for (const s of k.tides) s.T = { ...s.T, cycle: { ...s.T.cycle } };
    const pf = PF(), c = pf && pf.fields.find(f => f.id === 'constrict'); if (c) { c.still = true; c.s = 0; }
    membranes(0, true);
  }
  const breathTides = () => (K() ? K().tides : []).filter(s => s.T.breath);
  const heartTide = () => K() && K().tides.find(s => s.id === ((lv().arena && lv().arena.tide) || 'heart'));
  const master = () => breathTides()[0];
  /* THE BREATH NOW (by where a body is: the chamber's own heart, or the whale's) */
  const breathAt = x => { const A = lv().arena, s = A && x >= A.x0 - 32 && x <= A.x1 ? heartTide() : master(); return s ? { k: s.k, ph: s.ph, id: s.id } : { k: 0, ph: 'low' }; };
  H.breath = breathAt;
  function floorY(x, y = 0) { const tx = Math.floor(x / TS); for (let ty = Math.max(0, Math.floor(y / TS)); ty < WH.BED + 1; ty++) if (ctx.isSolid(tx, ty)) return ty * TS; return null; }

  /* ---------- SPAWNING ---------- */
  H.spawnEnt = (base, e) => {
    if (!on()) return null;
    if (e.t === 'gastricpolyp') return GPM.spawnPolyp(base, e, ctx.EHP.gastricpolyp);
    if (e.t === 'parasitequeen') { const A = lv().arena; if (!A) return null;
      const spots = [{ x: (A.shelves[0][0] + 3) * TS, y: 36 * TS, floor: false }, { x: (A.shelves[1][0] + 3) * TS, y: 36 * TS, floor: false }, { x: (A.valve[0] + 2) * TS, y: (A.valveTop || 38) * TS, floor: false },
        { x: A.x0 + 18 * TS, y: A.floor, floor: true }, { x: A.heartX, y: A.floor, floor: true }, { x: A.x1 - 18 * TS, y: A.floor, floor: true }];
      Q = PQM.newFight({ x0: A.x0, x1: A.x1, floor: A.floor, heartX: A.heartX, spots }); WORD = null;
      for (const pp of ctx.players) pp.pqKeys = null;
      return { ...base, t: 'parasitequeen', x: A.heartX, w: PQM.PQ.w, h: PQM.PQ.h, hp: ctx.EHP.parasitequeen, maxHp: ctx.EHP.parasitequeen, noGrav: true, markH: PQM.PQ.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, y: A.floor, anchored: true, noPull: true }; }
    return null;
  };

  /* ---------- HURTING A HERO (every seat; keyed once a blow) ---------- */
  const keyed = (pp, key) => { pp.pqKeys = pp.pqKeys || new Map(); if (pp.pqKeys.size > 160) pp.pqKeys.clear(); if (pp.pqKeys.has(key)) return true; pp.pqKeys.set(key, 1); return false; };
  function hitAll(e, bx, d, name, o = {}) { let res = null;
    for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return;
      if (!ctx.overlap({ l: bx[0], r: bx[1], t: bx[2], b: bx[3] }, ctx.box(P))) return; if (keyed(pp, (o.key || name) + ':' + (e.id0 || e.t))) return;
      const r = ctx.damagePlayer(e.x, d, { who: e, name, blow: name, unblockable: !o.blockable, low: !!o.low }); if (r === 'blocked') res = 'blocked'; else if (!res && r) res = 'hit'; });
    return res; }
  const markAt = (e, m) => { if (m) ctx.number(e.x, e.y - (e.markH || e.h + 12), m, m === '!' ? '#ffd36b' : '#ff6b6b'); };

  /* ---------- A FOE OF OURS, ONE FRAME ---------- */
  H.updateEnt = (e, dt) => {
    if (!S || !e.alive) return;
    if (e.hurtT > 0) e.hurtT -= dt;
    const hs = ctx.players.filter(pp => !pp.dead && ctx.upright(pp));
    if (e.t === 'gastricpolyp') { let h = null, d = 1e9; for (const pp of hs) { const q = Math.abs(pp.x - e.x) + Math.abs(pp.y - e.y); if (q < d) { d = q; h = pp; } }
      e.id0 = e.id0 || ('p' + R(e.x));
      GPM.stepPolyp(e, dt, h ? { x: h.x, y: h.y, alive: true } : null, { breath: () => breathAt(e.x), mark: m => markAt(e, m), sound: k => ctx.sound(k),
        hit: (bx, dmg, name, o) => hitAll(e, bx, dmg, name, o), floorY, say: (b, w) => ctx.number(b.x, b.y - 30, w, '#ffd36b'),
        splash: (x, y) => ctx.burst(x, y - 2, 8, ['#b8d060', '#7a9a30', '#e0f0a0'], 60, 0.4, -40) });
      return; }
    if (e.t === 'parasitequeen' && Q) {
      if (!ctx.bossActive || e !== ctx.boss) return;
      if (e.mode === 'wake' && !Q.woke) { Q.woke = true; ctx.number(e.x, e.y - 96, PQM.PQ_SAY.woke, '#ffd36b'); }
      PQM.stepQueen(e, Q, dt, ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, dodge: (pp.dodge || 0) > 0 })), world(e));
      e.phase = Q.ph;
      if (/Tell$/.test(e.mode)) { const k = e.mode.replace(/Tell$/, ''); if (PQM.MOVES[k] && (!WORD || WORD.k !== k)) WORD = { k, t: ctx.time() }; } else WORD = null;
    }
  };
  const leechesAlive = () => ctx.enemies().filter(q => q.t === 'leech' && q.alive !== false && q.brood).length;
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => ctx.sound(k), mark: m => markAt(e, m),
      hit: (bx, d, name, o) => !!hitAll(e, bx, d, name, o), floorY,
      rate: () => { const s = heartTide(); if (s) s.T.rate = WH_HEART.p3Rate; },
      leeches: leechesAlive,
      hatch: (x, y) => { const n0 = ctx.enemies().length; ctx.spawnEnt({ t: 'leech', x: Math.floor(x / TS), y: Math.floor(y / TS) - 1 });
        for (let i = n0; i < ctx.enemies().length; i++) { const q = ctx.enemies()[i]; q.brood = true; q.cnSkin = 'gutleech'; q.mode = 'flop'; q.modeT = 1.2; q.y = y; } ctx.sound('squelch'); },
      ringWard: ee => ctx.ring(ee.x, ee.y - 18, 32, '#9ab0c0'),
      fx: (k, x, y) => { if (k === 'splash') ctx.burst(x, y - 2, 10, ['#b8d060', '#7a9a30', '#e0f0a0'], 70, 0.5, -40);
        if (k === 'flush') { ctx.shake(6); ctx.burst(x, y - 14, 26, ['#e0f0a0', '#f4d0d8', '#ffffff'], 130, 0.7, -80); }
        if (k === 'crush') { ctx.shake(8); ctx.burst(x, y - 4, 30, ['#c04050', '#ff8090', '#601020'], 160, 0.6, -60); } },
    };
  }

  /* ---------- A BLOW ON ONE OF OURS: never nothing; the Queen never under 0.4x ---------- */
  H.take = (e, dmg, blow) => {
    if (e.t === 'gastricpolyp') { const k = GPM.polypTake(e); if (k < 1 && blow && !e.saidFlesh) { e.saidFlesh = 1; ctx.number(e.x, e.y - 20, GPM.GP_SAY.flesh, '#e8c0c8'); } return dmg * k; }
    if (e.t === 'parasitequeen' && Q) { const P = ctx.hero(), r = PQM.takeAt(e, Q, P ? P.x : undefined); if (r.word && blow && ctx.turned) ctx.turned(e, P ? P.x : e.x, r.word, { stop: false });
      if (blow) Q.n.landed++; return dmg * Math.max(PQM.PQ.k.floor, r.k); }
    return dmg;
  };

  /* ---------- THE NERVES: a strike flares one; the flare forces the breath through the kit's own verbs ---------- */
  function force(n) {
    const kind = n.kind; n.kind = null; if (kind !== 'exhale' && kind !== 'inhale') return;
    const tides = n.tides === 'breath' ? breathTides() : [heartTide()].filter(Boolean);
    for (const s of tides) { const v = s.verbs.find(q => q.hidden && q.t === (kind === 'exhale' ? 'bell' : 'sluice')); if (!v) continue;
      v.cool = 0; const x = v.x * TS + 8, y = (v.y + 1) * TS; tideStrike(K(), { l: x - 2, r: x + 2, t: y - 20, b: y - 10 }); }
    ctx.sound(kind === 'exhale' ? 'exhale' : 'inhale'); ctx.shake(3);
    if (kind === 'inhale' && n.tides === 'breath') for (const m of S.mems) if (m.kind === 'sealed' && Math.abs(m.x0 - n.x) <= WH_HANDS.nerveReach) { m.sealedOpen = true; if (!S.told.unseal) { S.told.unseal = 1; ctx.number(m.x0 * TS + 8, m.y0 * TS - 6, WH_SAY.unseal, '#ffd36b'); } }
    if (n.arena && Q && ctx.boss && ctx.boss.t === 'parasitequeen') PQM.breathForced(ctx.boss, Q, world(ctx.boss), kind);
  }
  H.force = id => { const n = S && S.nerves[id]; if (n) { n.kind = NERVE_DOES[(n.tides === 'breath' ? master() : heartTide()).ph]; force(n); } };   /* (the page tools and the lab: no flare) */

  /* ---------- THE MEMBRANES: open on the inhale; a sealed one only after a forced inhale; never shut on a body ---------- */
  function membranes(dt, init) {
    const L = lv(), b = master(); if (!b) return;
    const drawing = b.ph === 'fall' || b.ph === 'low' || b.ph === 'warn';
    for (const m of S.mems) {
      if (b.ph === 'rise' && m.sealedOpen) m.sealedOpen = false;   /* the next exhale seals the cardia again */
      let want = m.kind === 'sealed' ? (m.sealedOpen && drawing) : drawing;
      if (!want && m.open) { const l = m.x0 * TS, r = (m.x1 + 1) * TS, t = m.y0 * TS, bo = (m.y1 + 1) * TS;
        if ([...ctx.players, ...ctx.enemies()].some(q => q && !q.dead && q.alive !== false && q.x + 6 > l && q.x - 6 < r && q.y > t && q.y - 14 < bo)) want = true; }   /* a body in it: it waits */
      if (want === m.open && !init) continue;
      m.open = want; m.shut = want ? 0 : 0.4;
      for (let y = m.y0; y <= m.y1; y++) for (let x = m.x0; x <= m.x1; x++) ctx.cellSet(x, y, want ? ctx.T.AIR : ctx.T.PORT);
      if (!init && near(m.x0 * TS, 300)) ctx.sound('squelch');
    }
    void L; void dt;
  }

  /* ---------- ONE FRAME OF THE LEVEL ---------- */
  H.update = dt => {   /* (the kit's step, its events and its pool write run in the ONE wiring after this, through H.water below) */
    if (!K() || !S) return;
    S.ph = master() ? master().ph : 'low';
    /* THE NERVES: the flare runs out and forces the breath; the cooldown runs down; the glow */
    for (const id in S.nerves) { const n = S.nerves[id];
      if (n.flare > 0) { n.flare = Math.max(0, n.flare - dt); if (n.flare === 0) force(n); }
      n.cool = Math.max(0, n.cool - dt);
      n.glow += ((n.flare > 0 ? 1 : n.cool > 0 ? 0.15 : 0.55) - n.glow) * Math.min(1, dt * 6); }
    membranes(dt, false);
    /* THE GUT LEECH: the inhale tears a latched one loose */
    for (const e of ctx.enemies()) { if (e.t !== 'leech' || e.cnSkin !== 'gutleech' || e.mode !== 'latched' || !e.host) continue;
      if (breathAt(e.x).ph !== 'fall') continue; const pp = e.host; pp.leech = null; ctx.leechOff(e, pp); e.host = null; e.mode = 'flop'; e.modeT = 1.2; e.vx = 0; e.vy = 0; e.x = pp.x + (pp.face || 1) * 12;
      if (!S.told.torn) { S.told.torn = 1; ctx.number(e.x, e.y - 18, WH_SAY.torn, '#8fd160'); } }
  };
  const near = (x, r) => { const P = ctx.hero(); return !!(P && Math.abs(P.x - x) < r); };

  /* ---------- THE GADGETS: a nerve, an egg sac (claude/seagadget: DECLARED to the one hook, src/sea-gadget.js - a blow AND any hero's shot / spell / thrown weapon strikes them) ---------- */
  function nerveStruck(n) {
    const x = nerveX(n), feet = nerveFeet(n);
    if (n.cool > 0) { if (!n.saidCool) { n.saidCool = 1; ctx.number(x, feet - 24, WH_SAY.cool, '#9ab0c0'); } return; }
    const s = n.tides === 'breath' ? master() : heartTide(), does = NERVE_DOES[s ? s.ph : 'low'];
    if (does === 'already') { if (!n.saidAlready || ctx.time() - n.saidAlready > 2) { n.saidAlready = ctx.time(); ctx.number(x, feet - 24, WH_SAY.already, '#e8c0c8'); } return; }
    n.kind = does; n.flare = WH.nerve.flare; n.cool = WH.nerve.flare + (n.arena ? WH.nerve.coolArena : WH.nerve.cool); n.saidCool = 0;
    ctx.sound('squelch'); ctx.shake(2); ctx.burst(x, feet - 6, 14, ['#fff0f4', '#f4b0c0', '#ffffff'], 90, 0.5, -50);
    ctx.number(x, feet - 26, does === 'exhale' ? WH_SAY.exhale : WH_SAY.inhale, '#f4d0d8');
  }
  H.gadgets = () => { if (!K() || !S) return []; const out = [];
    for (const id in S.nerves) { const n = S.nerves[id];
      out.push({ id: 'nerve:' + id, box: () => { if (n.flare > 0) return null; const x = nerveX(n), feet = nerveFeet(n);   /* (a flaring nerve is spent: a shot flies on through it) */
        return { l: x - WH_HANDS.nerveW / 2 - 2, r: x + WH_HANDS.nerveW / 2 + 2, t: feet - WH_HANDS.nerveH - 4, b: feet }; }, strike: () => nerveStruck(n) }); }
    if (Q) Q.eggs.forEach((egg, i) => { if (egg.hp > 0) out.push({ id: 'egg:' + (egg.id !== undefined ? egg.id : i), box: () => (egg.hp > 0 ? { l: egg.x - 6, r: egg.x + 6, t: egg.y - 10, b: egg.y } : null), strike: () => { egg.hp = 0; ctx.sound('squelch'); } }); });
    return out; };
  const nerveX = n => n.x * TS + 8;
  const nerveFeet = n => { if (n.on && K()) { const y = floatY(K(), n.on); if (y != null) return y; } return (n.y + 1) * TS; };

  /* ---------- A MOVER OF OURS: the tongue where the breath lifts it, a raft where the bile floats it ---------- */
  H.mover = (m, dt) => {
    if (!m.wh || !K()) return false; void dt;
    const oy = m.y, y = m.wh === 'lift' ? liftY(K(), m.lid) : floatY(K(), m.fid); if (y != null) m.y = y; m.x = m.x0; m.dx = 0; m.dy = m.y - oy; return true;
  };

  /* ---------- DRAWING (claude/whaleart: the art pass - src/redraw/whale_art.js the kit, gastric_polyp_art.js and parasite_queen_art.js the two sheets; draw-only, no number or box moved) ---------- */
  const seen = new Map();   /* a foe we drew alive: when it is dead we play its fall (once) */
  const DEAD_T = { gastricpolyp: 0.8, parasitequeen: 2.6 };
  const K01 = v => Math.max(0, Math.min(1, v));
  /* THE BACKDROP (claude/seaart2): called from main.js's backdrop chain, BEFORE the tiles; the section's wall, far ribs, shafts */
  H.drawBackdrop = (g, cx, cy, VW, VH, t) => { if (!on()) return; WB.drawBackdrop(g, cx, cy, VW, VH, t); };
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const VW = ctx.VW(), vw = ctx.view ? ctx.view() : null, VH = vw ? vw.y1 - vw.y0 : 216, A = lv().arena;
    /* THE FLESH: the section's wash, fibres, veins, wet edges and the sinew hung off every ceiling, over the level's tiles */
    WA.drawFleshTex(g, cx, cy, t, VW, VH, (x, y) => ctx.isSolid(x, y), lv().W || WH.W, lv().H || WH.H);
    /* THE HEART: behind her, beating (it swells on each beat; fast in P3) */
    if (A && A.heartX - cx > -80 && A.heartX - cx < VW + 80) { const hs = heartTide(), rate = hs ? (hs.T.rate || 1) : 1, beat = Math.max(0, Math.sin(t * 5.2 * rate)) ** 6;
      WA.drawHeart(g, R(A.heartX - cx), R(A.floor - cy) - 44, beat, rate, t); }
    for (const id in S.nerves) { const n = S.nerves[id], x = R(nerveX(n) - cx), y = R(nerveFeet(n) - cy); if (x < -30 || x > VW + 30) continue;
      WA.drawNerve(g, x, y, { glow: n.glow, flare: n.flare, cool: n.cool, coolMax: WH.nerve.cool + WH.nerve.flare }, t); }
    for (const m of S.mems) { const x = R(m.x0 * TS - cx), y = R(m.y0 * TS - cy), w = (m.x1 - m.x0 + 1) * TS, h = (m.y1 - m.y0 + 1) * TS; if (x > VW + 20 || x + w < -20) continue;
      const b = master(), quiver = b && b.ph === 'warn' ? R(Math.sin(t * 30) * 1) : 0;
      WA.drawMembrane(g, x, y, w, h, { open: m.open, kind: m.kind, quiver }, t); }
  };
  H.drawMover = (g, m, cx, cy, t = 0) => {
    if (!m.wh) return false; const x = R(m.x - cx), y = R(m.y - cy), w = R(m.w);
    if (m.wh === 'lift') WA.drawTongue(g, x, y, w, t); else WA.drawRaft(g, x, y, w, t);   /* the tongue; a swallowed ship's planks */
    return true;
  };
  H.drawEnt = (g, e, cx, cy, t) => {
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1;
    if (e.t === 'gastricpolyp') {
      seen.set(e, { x: e.x, y: e.y, face: f, t0: null, k: 'gastricpolyp' });
      PA.drawPolyp(g, x, y, f, { mode: e.mode, h: e.h, hurtT: e.hurtT, flash: e.flash, seed: (e.x % 97) * 0.13 }, t);
      for (const gl of e.globs) PA.drawGlob(g, R(gl.x - cx), R(gl.y - cy), gl.vx, gl.vy, t);
      return;
    }
    if (e.t !== 'parasitequeen' || !Q) return;
    const m = e.mode, open = PQM.pqOpen(e);
    seen.set(e, { x: e.x, y: e.y, face: f, t0: null, k: 'parasitequeen' });
    QA.drawQueen(g, x, y, f, { mode: m, phase: Q.ph, ward: Q.ward > 0, hurtT: e.hurtT, flash: e.flash, seed: 1 }, t);
    /* CONSTRICT: her tendrils reach (the tell: thin and wavering) and pull (thick, barbed) to every hero */
    if (m === 'constrictTell' || m === 'constrict') { const rel = m === 'constrict'; for (const P0 of ctx.players) { if (P0.dead) continue; QA.drawTendril(g, x + f * (rel ? 44 : 31), y - (rel ? 19 : 22), R(P0.x - cx), R(P0.y - 8 - cy), rel ? 1 : 0, t); } }
    /* the marked stretch of a ROOT LASH, the THRUM ridges, the eggs, the spit */
    for (const r of Q.roots) QA.drawLash(g, R(r.x - cx), R(r.y - cy), PQM.PQ.lash.w, PQM.PQ.lash.h, m === 'lash' ? 'rel' : 'tell', t, m === 'lash' ? K01((0.25 - e.modeT) / 0.1) : 1);
    for (const ring of Q.rings) for (const sx of [-1, 1]) QA.drawThrumRing(g, R(ring.x + sx * ring.r - cx), R(ring.y - cy), PQM.PQ.thrum.h, sx, t);
    for (const egg of Q.eggs) QA.drawEgg(g, R(egg.x - cx), R(egg.y - cy), K01(1 - egg.t / PQM.PQ.brood.hatch), t);
    for (const gl of Q.globs) PA.drawGlob(g, R(gl.x - cx), R(gl.y - cy), gl.vx, gl.vy, t, gl.kind);
    if (m === 'crushTell' || m === 'crush') { const VWd = ctx.VW(); QA.drawCrushFloor(g, Math.max(-8, R(Q.G.x0 - cx)), Math.min(VWd + 8, R(Q.G.x1 - cx)), R(Q.G.floor - cy), PQM.PQ.crush.h, m === 'crush', t); }
    /* THE READ: gold ring + timer when open, grey when warded */
    if (open) { const k = e.open / (m === 'stranded' ? PQM.PQ.stranded : PQM.PQ.flushed); KA.drawOpenRing(g, x, y - 22, 34, t);
      g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - 66, R(32 * Math.min(1, k)), 2); }
    else if (Q.ward > 0) KA.drawWardRing(g, x, y - 22, 34, t);
    if (WORD && ctx.text) { const M = PQM.MOVES[WORD.k]; if (M) ctx.text(PQM.MOVE_NAME[WORD.k] + ': ' + M.answer, x, y - 76, M.mark === '!' ? '#ffd36b' : '#ff6b6b'); }
  };
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv(), VW = ctx.VW();
    /* THE BILE: the surface (scum, foam, a bright lip), bubbles and drifting shell over every flooded bile pool */
    for (const p of L.pools) { if (!p.wh || p.dry || p.x1 < cx || p.x0 > cx + VW) continue; const x0 = R(Math.max(p.x0, cx) - cx), x1 = R(Math.min(p.x1, cx + VW) - cx), y = R(p.y - cy), h = R((p.bottom || p.base) - p.y);
      WA.drawBile(g, x0, x1, y, h, t); }
    /* THE LUNG (the HUD read of the breath, the plan's one A3 dial in its flesh skin): full on the inhale, empty on the exhale; it flashes on the tells */
    const P = ctx.hero(); if (P) { const b = breathAt(P.x), s = (b.id && K().tides.find(q => q.id === b.id)) || master(), gg = s && gauge(K(), s.id); if (gg) {
      const x = R(VW / 2) - 30, y = 4, fill = 1 - gg.k, tell = gg.tell && Math.sin(t * 16) > 0;
      WA.drawLung(g, x, y, fill, tell, t);
      if (ctx.text) ctx.text(BREATH_NAME[gg.ph] + (gg.held ? ' (HELD)' : ''), x + 30, y + 10, tell ? '#ffffff' : '#f4d0d8'); } }
    /* THE FALLS: a foe we saw alive and that is now dead plays its fall once */
    for (const [e, d] of seen) { if (e.alive) continue; if (!(e.hp <= 0)) { seen.delete(e); continue; }
      if (d.t0 == null) d.t0 = t; const k = (t - d.t0) / DEAD_T[d.k]; if (k >= 1) { seen.delete(e); continue; }
      const x = R(d.x - cx), y = R(d.y - cy); if (x < -80 || x > VW + 80) continue;
      if (d.k === 'parasitequeen') QA.drawQueenDead(g, x, y, d.face, k, t, {}); else PA.drawPolypDead(g, x, y, d.face, k, t, {}); }
  };
  H.barName = e => 'THE PARASITE QUEEN' + (e.mode === 'flushed' && e.open > 0 ? '  FLUSHED' : e.mode === 'stranded' && e.open > 0 ? '  STRANDED' : Q && Q.ward > 0 ? '  RE-GRIPPING' : Q && Q.ph === 2 ? '  SKITTERING' : '  ROOTED');
  H.end = e => { if (Q && e && (!e.alive || e.hp <= 0)) { Q.dead = true; ctx.number(e.x, e.y - 70, PQM.PQ_SAY.down, '#ffd36b'); } if (Q) { Q.globs = []; Q.rings = []; Q.roots = []; Q.eggs = []; Q.constricting = false; }
    const s = heartTide(); if (s) s.T.rate = 1; };
  H.read = () => S && { breath: master() && { ph: master().ph, k: +master().k.toFixed(3), name: BREATH_NAME[master().ph] }, tides: K().tides.map(s => ({ id: s.id, ph: s.ph, k: +s.k.toFixed(3) })),
    nerves: Object.values(S.nerves).map(n => ({ id: n.id, cool: +n.cool.toFixed(2), flare: +n.flare.toFixed(2) })), membranes: S.mems.map(m => ({ id: m.id, open: m.open, sealedOpen: m.sealedOpen })),
    queen: Q && { ph: Q.ph, ward: Q.ward, n: { ...Q.n }, plan: ctx.boss && ctx.boss.t === 'parasitequeen' ? PQM.pqPlan(ctx.boss, Q, bestNerve()) : null } };
  function bestNerve() { const P = ctx.hero(), s = heartTide(); let b = null, d = 1e9; for (const id in S.nerves) { const n = S.nerves[id]; if (!n.arena) continue; const q = Math.abs(nerveX(n) - (P ? P.x : 0)); if (q < d) { d = q; b = { x: nerveX(n), ready: n.cool <= 0 && n.flare <= 0, phase: s ? s.ph : 'low' }; } } return b; }
  H.queen = () => Q; H.kit = () => K(); H.gusts = () => PF(); H.state = () => S;

  /* THE WATER HOOKS (claude/sea3: the ONE wiring, src/pirate-fleet-hands.js header): this level's sounds, the Queen's heart-rise, the constrict field and the gusts' foes on the generic step */
  H.water = {
    gadgets: () => H.gadgets(),   /* (claude/seagadget) the nerves and the egg sacs, struck by a blow or any hero's shot through the ONE hook */
    built() { if (S) K(); },   /* the kit has just been (re)built: the first sight makes this level's state ready (prep) */
    noRespawn: true,   /* a death does not reset the breath (it never did: the whale clears its own state and the kit is rebuilt at its first phase) */
    quiet: true, noStreaks: true, noPosts: true, flow: '#f0d0d8', foam() {}, gauge() {},   /* the greybox draws its own lung and bile; the flow specks are the flesh pink */
    foes: e => e !== ctx.boss && !e.mini,   /* the gusts blow every loose foe, dry or wet (anchored / noPull ones are skipped by the field itself) */
    tide(ev) {
      if (!S || !on()) return true;
      const P = ctx.hero(), m = master(), ht = heartTide(), A = lv().arena;
      if (ev.t === 'toll' && ((m && ev.id === m.id) || (ht && ev.id === ht.id && P && A && P.x >= A.x0 - 32))) ctx.sound(ev.turn ? 'gasp' : 'heart');
      if (ev.t === 'phase' && ht && ev.id === ht.id && ev.ph === 'rise' && Q && ctx.boss && ctx.boss.t === 'parasitequeen' && ctx.bossActive) PQM.breathNatural(ctx.boss, Q, world(ctx.boss));   /* the heart's natural exhale */
      return true;
    },
    step() {   /* between the kit's step and its write: CONSTRICT is a field at her while her tendrils pull */
      if (!S || !on()) return; const pf = PF(), B = ctx.boss, c = pf && pf.fields.find(f => f.id === 'constrict'); if (!c) return;
      const pull = !!(Q && Q.constricting && B && B.alive && B.t === 'parasitequeen');
      if (B && B.t === 'parasitequeen') c.f.ring = [(B.x - 8) / TS, (B.y - 16 - 8) / TS, c.f.ring[2]];
      c.still = !pull;
    },
    verb() { return true; },   /* (the hidden bell / sluice are far off the map: only a nerve's flare strikes them, in force()) */
  };
  return H;
}
