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
// main.js calls: water (the hooks), on, clear, spawnEnt, owns, updateEnt, take, update, strike, mover, drawBack, drawMover, drawEnt, drawOver, barName, end, read.
import { tideStrike, gauge, floatY, liftY, TS as KTS } from './tide-kit.js';
import { WH, BREATH_NAME, WH_HEART } from './whale.js';
import * as GPM from './gastric-polyp.js';
import * as PQM from './parasite-queen.js';
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
    S = null; Q = null; WORD = null; if (!on()) return;
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

  /* ---------- A BLOW: a nerve, an egg sac ---------- */
  H.strike = hb => {
    if (!K() || !S || !hb) return;
    for (const id in S.nerves) { const n = S.nerves[id]; const x = nerveX(n), feet = nerveFeet(n);
      if (!(hb.l < x + WH_HANDS.nerveW / 2 + 2 && hb.r > x - WH_HANDS.nerveW / 2 - 2 && hb.t < feet && hb.b > feet - WH_HANDS.nerveH - 4)) continue;
      if (n.flare > 0) continue;
      if (n.cool > 0) { if (!n.saidCool) { n.saidCool = 1; ctx.number(x, feet - 24, WH_SAY.cool, '#9ab0c0'); } continue; }
      const s = n.tides === 'breath' ? master() : heartTide(), does = NERVE_DOES[s ? s.ph : 'low'];
      if (does === 'already') { if (!n.saidAlready || ctx.time() - n.saidAlready > 2) { n.saidAlready = ctx.time(); ctx.number(x, feet - 24, WH_SAY.already, '#e8c0c8'); } continue; }
      n.kind = does; n.flare = WH.nerve.flare; n.cool = WH.nerve.flare + (n.arena ? WH.nerve.coolArena : WH.nerve.cool); n.saidCool = 0;
      ctx.sound('squelch'); ctx.shake(2); ctx.burst(x, feet - 6, 14, ['#fff0f4', '#f4b0c0', '#ffffff'], 90, 0.5, -50);
      ctx.number(x, feet - 26, does === 'exhale' ? WH_SAY.exhale : WH_SAY.inhale, '#f4d0d8');
    }
    if (Q && Q.eggs.length) { const k = PQM.cutEggs(Q, hb); if (k) ctx.sound('squelch'); }
  };
  const nerveX = n => n.x * TS + 8;
  const nerveFeet = n => { if (n.on && K()) { const y = floatY(K(), n.on); if (y != null) return y; } return (n.y + 1) * TS; };

  /* ---------- A MOVER OF OURS: the tongue where the breath lifts it, a raft where the bile floats it ---------- */
  H.mover = (m, dt) => {
    if (!m.wh || !K()) return false; void dt;
    const oy = m.y, y = m.wh === 'lift' ? liftY(K(), m.lid) : floatY(K(), m.fid); if (y != null) m.y = y; m.x = m.x0; m.dx = 0; m.dy = m.y - oy; return true;
  };

  /* ---------- DRAWING (GREYBOX: the art pass owes the flesh kit, the nerves, the membranes, the tongue, the rafts, the heart, both sheets) ---------- */
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const VW = ctx.VW(), A = lv().arena;
    /* THE HEART: behind her, beating (it swells on each beat; fast in P3) */
    if (A && A.heartX - cx > -80 && A.heartX - cx < VW + 80) { const hs = heartTide(), rate = hs ? (hs.T.rate || 1) : 1, beat = Math.max(0, Math.sin(t * 5.2 * rate)) ** 6, x = R(A.heartX - cx), y = R(A.floor - cy) - 44;
      g.fillStyle = '#5a1420'; g.beginPath(); g.ellipse(x, y, 30 + beat * 4, 34 + beat * 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#8a2232'; g.beginPath(); g.ellipse(x - 6, y - 6, 20 + beat * 3, 22 + beat * 3, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c04050'; g.fillRect(x - 3, y - 40, 6, 12); g.fillRect(x + 10, y - 36, 5, 10); }
    for (const id in S.nerves) { const n = S.nerves[id], x = R(nerveX(n) - cx), y = R(nerveFeet(n) - cy); if (x < -30 || x > VW + 30) continue;
      const pulse = 0.5 + 0.5 * Math.sin(t * 6 + n.x);
      if (n.glow > 0.05) { g.globalAlpha = 0.3 * n.glow; g.fillStyle = '#ffd0dc'; g.beginPath(); g.arc(x, y - 7, 9 + 5 * n.glow + pulse * 2 * n.glow, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = n.cool > 0 && n.flare <= 0 ? '#8a6a70' : '#f4c0cc'; g.fillRect(x - 5, y - 10, 10, 10); g.fillStyle = n.flare > 0 ? '#ffffff' : '#ffe8ee'; g.fillRect(x - 2, y - 8, 4, 5);
      g.fillStyle = '#c07080'; g.fillRect(x - 7, y - 2, 3, 2); g.fillRect(x + 4, y - 3, 3, 2); g.fillRect(x - 1, y - 13, 2, 3);   /* the nerve's strands into the flesh */
      if (n.cool > 0 && n.flare <= 0) { const k = n.cool / (WH.nerve.cool + WH.nerve.flare); g.fillStyle = '#9ab0c0'; g.fillRect(x - 6, y + 2, R(12 * k), 1); } }
    for (const m of S.mems) { const x = R(m.x0 * TS - cx), y = R(m.y0 * TS - cy), w = (m.x1 - m.x0 + 1) * TS, h = (m.y1 - m.y0 + 1) * TS; if (x > VW + 20 || x + w < -20) continue;
      if (m.open) { g.fillStyle = '#7a2a3a'; g.fillRect(x, y, 3, h); g.fillRect(x + w - 3, y, 3, h); continue; }   /* drawn back to the walls */
      const b = master(), quiver = b && b.ph === 'warn' ? R(Math.sin(t * 30) * 1) : 0;
      g.fillStyle = m.kind === 'sealed' ? '#a03a50' : '#c06070'; g.fillRect(x + quiver, y, w, h); g.fillStyle = '#e090a0'; for (let yy = 4; yy < h; yy += 9) g.fillRect(x + 2 + quiver, y + yy, w - 4, 1);
      if (m.kind === 'sealed') { g.fillStyle = '#ffd36b'; g.fillRect(x + w / 2 - 1, y + h / 2 - 1, 3, 3); } }
  };
  H.drawMover = (g, m, cx, cy) => {
    if (!m.wh) return false; const x = R(m.x - cx), y = R(m.y - cy), w = R(m.w);
    if (m.wh === 'lift') { g.fillStyle = '#b04858'; g.fillRect(x, y, w, 8); g.fillStyle = '#d07080'; g.fillRect(x + 1, y, w - 2, 2); g.fillStyle = '#8a3040'; for (let i = 4; i < w - 2; i += 7) g.fillRect(x + i, y + 4, 2, 1); return true; }
    g.fillStyle = '#3a2a22'; g.fillRect(x, y, w, 8); g.fillStyle = '#5a4434'; g.fillRect(x + 1, y, w - 2, 2); g.fillStyle = '#c8c0a8'; for (let i = 3; i < w - 2; i += 6) g.fillRect(x + i, y + 4, 2, 2);   /* tarred wreck planks, barnacles (a swallowed ship) */
    return true;
  };
  H.drawEnt = (g, e, cx, cy, t) => {
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1;
    if (e.t === 'gastricpolyp') {
      const h = R(e.h), tell = e.mode === 'spitTell';
      g.fillStyle = '#8a3040'; g.fillRect(x - 7, y - 3, 14, 3);   /* its root in the flesh */
      if (GPM.gpIn(e) && e.mode === 'in') { g.fillStyle = '#b05a68'; g.fillRect(x - 4, y - 5, 8, 3); return; }
      g.fillStyle = '#c87a6a'; g.fillRect(x - 3, y - h, 6, h); g.fillStyle = tell ? '#e8f0a0' : '#d8a090'; g.fillRect(x - 5 - (tell ? 1 : 0), y - h - 6, 10 + (tell ? 2 : 0), 7);
      g.fillStyle = '#3a1018'; g.fillRect(x + f * 3 - 1, y - h - 4, 3, 3);   /* its mouth */
      if (e.mode === 'spit') { g.fillStyle = '#b8d060'; g.fillRect(x + f * 6, y - h - 4, 3, 3); }
      for (const gl of e.globs) { g.fillStyle = '#b8d060'; g.fillRect(R(gl.x - cx) - 2, R(gl.y - cy) - 2, 5, 5); g.fillStyle = '#e0f0a0'; g.fillRect(R(gl.x - cx) - 1, R(gl.y - cy) - 1, 2, 2); }
      return;
    }
    if (e.t !== 'parasitequeen' || !Q) return;
    const m = e.mode, open = PQM.pqOpen(e), skit = Q.ph === 2 && !open && m !== 'rerootTell';
    /* HER ROOTS into the heart (P1/P3; torn and trailing when open or skittering) */
    if (!skit) { g.strokeStyle = open ? 'rgba(200,180,160,0.5)' : '#d8c8b0'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x - 10 + i * 5, y - 6); g.lineTo(x - 18 + i * 9 + (open ? R(Math.sin(t * 8 + i) * 6) : 0), y + (open ? -2 : 6)); g.stroke(); } g.lineWidth = 1; }
    const rear = m === 'thrumTell' || m === 'crushTell' ? 6 : m === 'lashTell' ? -4 : 0, bh = skit ? PQM.PQ.hSkit : PQM.PQ.h;
    g.fillStyle = open ? '#e8e0d0' : '#d8d0c0'; g.beginPath(); g.ellipse(x, y - bh / 2 - rear, PQM.PQ.w / 2 + 2, bh / 2, 0, 0, Math.PI * 2); g.fill();   /* the pale swollen body */
    g.fillStyle = '#b8a890'; for (let i = -2; i <= 2; i++) g.fillRect(x + i * 5 - 1, y - bh + 4 - rear, 2, bh - 8);   /* her segments */
    if (skit) { g.fillStyle = '#ffe070'; g.fillRect(x - f * 12 - 3, y - bh / 2 - 3, 6, 6); }   /* THE ROOT-KNOT on her back (1.0x from behind) */
    g.fillStyle = '#5a2a2a'; for (let i = 0; i < 3; i++) { const lg = R(Math.sin(t * (skit ? 18 : 3) + i) * 2); g.fillRect(x - 16 - i * 2, y - 6 + lg, 6, 2); g.fillRect(x + 10 + i * 2, y - 6 - lg, 6, 2); }   /* her legs */
    g.fillStyle = m === 'spitTell' ? '#e8f0a0' : '#7a3a3a'; g.fillRect(x + f * (PQM.PQ.w / 2) - (f < 0 ? 6 : 0), y - bh / 2 - 6 - rear, 6, 8);   /* her mouthparts */
    if (m === 'constrictTell' || m === 'constrict') { g.strokeStyle = m === 'constrict' ? '#ff9aa8' : 'rgba(255,154,168,0.5)'; g.beginPath(); for (const P0 of ctx.players) { if (P0.dead) continue; g.moveTo(x, y - bh / 2); g.lineTo(R(P0.x - cx), R(P0.y - 8 - cy)); } g.stroke(); }
    /* the marked stretch of a ROOT LASH, the THRUM rings, the eggs, the spit */
    for (const r of Q.roots) { const rx = R(r.x - cx), ry = R(r.y - cy); g.globalAlpha = m === 'lash' ? 0.95 : 0.45 + 0.35 * Math.sin(t * 20); g.fillStyle = m === 'lash' ? '#d8c8b0' : '#ff6b6b';
      if (m === 'lash') for (let i = -2; i <= 2; i++) g.fillRect(rx + i * 8 - 1, ry - PQM.PQ.lash.h, 3, PQM.PQ.lash.h); else g.fillRect(rx - PQM.PQ.lash.w, ry - 2, PQM.PQ.lash.w * 2, 2); g.globalAlpha = 1; }
    for (const ring of Q.rings) for (const sx of [-1, 1]) { g.fillStyle = 'rgba(255,140,150,0.8)'; g.fillRect(R(ring.x + sx * ring.r - cx) - 2, R(ring.y - cy) - PQM.PQ.thrum.h, 4, PQM.PQ.thrum.h); }
    for (const egg of Q.eggs) { g.fillStyle = '#e8e0b0'; g.fillRect(R(egg.x - cx) - 4, R(egg.y - cy) - 8, 8, 8); g.fillStyle = '#a89860'; g.fillRect(R(egg.x - cx) - 1, R(egg.y - cy) - 6, 2, 2); }
    for (const gl of Q.globs) { g.fillStyle = gl.kind === 'egg' ? '#e8e0b0' : '#b8d060'; g.fillRect(R(gl.x - cx) - 3, R(gl.y - cy) - 3, 6, 6); }
    if (m === 'crushTell') { g.globalAlpha = 0.25 + 0.25 * Math.sin(t * 24); g.fillStyle = '#ff4050'; g.fillRect(R(Q.G.x0 - cx), R(Q.G.floor - cy) - PQM.PQ.crush.h, R(Q.G.x1 - Q.G.x0), PQM.PQ.crush.h); g.globalAlpha = 1; }
    /* THE READ: gold ring + timer when open, grey when warded */
    if (open) { const k = e.open / (m === 'stranded' ? PQM.PQ.stranded : PQM.PQ.flushed); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 16, 26, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - 52, R(32 * Math.min(1, k)), 2); }
    else if (Q.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, y - 16, 26, 0, Math.PI * 2); g.stroke(); }
    if (WORD && ctx.text) { const M = PQM.MOVES[WORD.k]; if (M) ctx.text(PQM.MOVE_NAME[WORD.k] + ': ' + M.answer, x, y - 66, M.mark === '!' ? '#ffd36b' : '#ff6b6b'); }
  };
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv(), VW = ctx.VW();
    /* THE BILE: a green over every flooded bile pool (the game draws clear water; the art pass owes the bile's own surface) */
    for (const p of L.pools) { if (!p.wh || p.dry || p.x1 < cx || p.x0 > cx + VW) continue; const x0 = R(Math.max(p.x0, cx) - cx), x1 = R(Math.min(p.x1, cx + VW) - cx), y = R(p.y - cy), h = R((p.bottom || p.base) - p.y);
      g.globalAlpha = 0.32; g.fillStyle = '#6a8a20'; g.fillRect(x0, y, x1 - x0, h); g.globalAlpha = 0.7; g.fillStyle = '#c8e070'; for (let x = x0 - (x0 % 5) + R(t * 14) % 5; x < x1; x += 5) g.fillRect(x, y, 2, 1); g.globalAlpha = 1; }
    /* THE LUNG (the HUD read of the breath, the plan's one A3 dial in its flesh skin - art owed): full on the inhale, empty on the exhale; it flashes on the tells */
    const P = ctx.hero(); if (P) { const b = breathAt(P.x), s = (b.id && K().tides.find(q => q.id === b.id)) || master(), gg = s && gauge(K(), s.id); if (gg) {
      const x = R(VW / 2) - 30, y = 4, fill = 1 - gg.k, tell = gg.tell && Math.sin(t * 16) > 0;
      g.fillStyle = 'rgba(20,8,12,0.7)'; g.fillRect(x - 2, y - 2, 64, 15); g.fillStyle = tell ? '#ffffff' : '#f4b0c0'; g.fillRect(x, y, R(60 * fill), 5); g.fillStyle = '#5a2030'; g.fillRect(x + R(60 * fill), y, 60 - R(60 * fill), 5);
      if (ctx.text) ctx.text(BREATH_NAME[gg.ph] + (gg.held ? ' (HELD)' : ''), x + 30, y + 7, tell ? '#ffffff' : '#f4d0d8'); } }
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
