// src/siren-rocks-hands.js - SIREN ROCKS IN THE GAME (claude/sirenrocks, the greybox, 2026-11-06). src/siren-rocks.js is the level (data), src/naga-guard.js and
// src/naga-queen.js the two brains (pure); this binds them to the world, and is the level's own wiring of THE WATER KIT (src/tide-kit.js, src/pull-field.js).
// ONLY a level with L.sirenRocks: everything here is inert anywhere else (on() is false), so the flag-off game is unchanged.
//   THE SONGS        L.pulls through the pull field of the ONE generic wiring (claude/sea3: src/pirate-fleet-hands.js builds, steps and writes the kit and the fields; this file reads
//                    them through ctx.pfh and hands it H.water, the hooks object): every seat and every foe in a singing stone's reach is pulled to it (a naga never: e.anchored); the
//                    surf's drifts carry a swimmer back to the kelp. THE QUEEN's two songs ('queen', 'queenWet') are entries in L.pulls too: H.water.step moves their ring onto her.
//   THE STONES       L.srStones: a blow shatters one SILENT for its `quiet` s (its field stilled), told before it sings again (the hum swells for SR_HANDS.regrow s).
//                    Not a mark: a death brings every stone back (no soft-lock: a stone you needed always sings again).
//   THE TIDES        L.tides through the tide kit (no respawn reset: the cove and the spire start at their first phase, as before): the cove (pumice rafts float on it, the tide bell calls it in) and the spire (THE NAGA QUEEN floods it).
//   BLOWHOLES        L.srBlowholes: quiet -> BOOM (the tell, spray) -> SPOUT (whoever stands over it is thrown up the chimney: vy = SPOUT.vy).
//   THE NAGA GUARD   (src/naga-guard.js) and THE NAGA QUEEN (src/naga-queen.js): spawn, step, every blow on them, the drawing.
// main.js calls: on, clear, spawnEnt, owns, updateEnt, take, update, mover, drawBack, drawMover, drawEnt, drawOver, barName, end, read.
import { gauge, floatY, kOf } from './tide-kit.js';
import { SPOUT, SR } from './siren-rocks.js';
import * as NGM from './naga-guard.js';
import * as NQM from './naga-queen.js';
const R = Math.round;
export const SR_HANDS = { regrow: 1.5, stoneW: 10, stoneH: 22, spoutW: 14 };
export const SR_SAY = { silent: 'SILENT: IT PULLS NOTHING NOW', regrow: 'THE STONE HUMS AGAIN', pulled: 'THE SONG HAS YOU', spout: 'THE BLOWHOLE THROWS YOU', bell: 'THE TIDE COMES IN' };

export function makeSirenRocksHands(ctx) {
  const H = {}; let S = null, Q = null, WORD = null;
  const K = () => (ctx.pfh ? ctx.pfh.kit() : null);   /* the ONE wiring's kit and fields (built after this file's clear) */
  const PF = () => (ctx.pfh && ctx.pfh.pulls()) || null;
  const lv = () => ctx.L, TS = 16;
  const on = () => !!(lv() && lv().sirenRocks);
  H.on = on;
  H.owns = e => e.t === 'nagaguard' || e.t === 'nagaqueen';
  H.clear = () => {
    S = null; Q = null; WORD = null; if (!on()) return;
    const L = lv();
    S = { told: {}, stones: {}, holes: (L.srBlowholes || []).map((b, i) => ({ ...b, ph: 'quiet', t: 0.6 + i * 1.3, keyed: new Set() })), foam: 0, spray: [] };
    for (const s of L.srStones || []) S.stones[s.id] = { ...s, broken: false, quietT: 0, glow: 0, hum: false };
  };
  const field = id => { const p = PF(); return p && p.fields.find(f => f.id === id); };
  const queenFields = () => { const p = PF(); return p ? p.fields.filter(f => f.f.queen) : []; };
  /* the Queen's songs sleep until she sings (the wiring built them awake: still from the first frame) */
  let asleep = null; const sleepQueen = () => { const p = PF(); if (p && p !== asleep) { asleep = p; for (const f of queenFields()) { f.still = true; f.s = 0; } } };
  const stoneX = s => s.x * TS + 8, stoneFeet = s => (s.y + 1) * TS;
  const wetAt = (x, y) => { for (const p of lv().pools || []) if (x >= p.x0 && x <= p.x1 && y - 4 > p.y && y < (p.bottom || 1e9)) return true; return false; };
  
  /* ---------- SPAWNING ---------- */
  H.spawnEnt = (base, e) => {
    if (!on()) return null;
    if (e.t === 'nagaguard') return NGM.spawnGuard(base, e, ctx.EHP.nagaguard);
    if (e.t === 'nagaqueen') { const A = lv().arena; if (!A) return null;
      Q = NQM.newFight({ x0: A.floorX[0], x1: A.floorX[1], floor: A.floor, stones: A.stones || [] }); WORD = null;
      for (const pp of ctx.players) pp.nqKeys = null;
      return { ...base, t: 'nagaqueen', w: NQM.NQ.w, h: NQM.NQ.h, hp: ctx.EHP.nagaqueen, maxHp: ctx.EHP.nagaqueen, noGrav: true, markH: NQM.NQ.markH, face: -1, mode: 'sleep', modeT: 0, open: 0, phase: 1, y: A.floor, anchored: true, noPull: true }; }
    return null;
  };

  /* ---------- HURTING A HERO (every seat; keyed once a blow) ---------- */
  const keyed = (pp, key) => { pp.nqKeys = pp.nqKeys || new Map(); if (pp.nqKeys.size > 120) pp.nqKeys.clear(); if (pp.nqKeys.has(key)) return true; pp.nqKeys.set(key, 1); return false; };
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
    if (e.t === 'nagaguard') { let h = null, d = 1e9; for (const pp of hs) { const q = Math.abs(pp.x - e.x); if (q < d) { d = q; h = pp; } }
      e.id0 = e.id0 || ('g' + R(e.x));
      NGM.stepGuard(e, dt, h ? { x: h.x, y: h.y, alive: true } : null, { mark: m => markAt(e, m), sound: k => ctx.sound(k), hit: (bx, dmg, name, o) => hitAll(e, bx, dmg, name, o),
        move: (b, dx, dy) => ctx.moveBody(b, dx, dy), wet: b => wetAt(b.x, b.y), say: (b, w) => ctx.number(b.x, b.y - 30, w, '#ffd36b') });
      return; }
    if (e.t === 'nagaqueen' && Q) {
      if (!ctx.bossActive || e !== ctx.boss) return;
      if (e.mode === 'wake' && !Q.woke) { Q.woke = true; ctx.number(e.x, e.y - 90, NQM.NQ_SAY.woke, '#ffd36b'); }
      NQM.stepQueen(e, Q, dt, ctx.players.map(pp => ({ x: pp.x, y: pp.y, ground: !!pp.ground, alive: ctx.upright(pp) && !pp.dead, wet: !!pp.swim, dodge: (pp.dodge || 0) > 0 })), world(e));
      e.phase = Q.ph;
      if (/Tell$/.test(e.mode)) { const k = e.mode.replace(/Tell$/, ''); if (NQM.MOVES[k] && (!WORD || WORD.k !== k)) WORD = { k, t: ctx.time() }; } else WORD = null;
    }
  };
  function arenaStones() { const ids = (lv().arena && lv().arena.stones) || []; return ids.map(id => S.stones[id]).filter(Boolean); }
  function floorY(x) { const tx = Math.floor(x / TS); for (let ty = 18; ty < SR.BED; ty++) if (ctx.isSolid(tx, ty)) return ty * TS; return null; }
  function world(e) {
    return {
      number: (x, y, t, col) => ctx.number(x, y, t, col), sound: k => ctx.sound(k), mark: m => markAt(e, m),
      hit: (bx, d, name, o) => !!hitAll(e, bx, d, name, o), floorY,
      tide: dir => { const s = K() && K().tides.find(q => q.id === (lv().arena.tide || 'spire')); if (s) s.ph = dir === 'in' ? 'high' : 'low'; if (dir === 'in') ctx.sound('toll'); },
      tideK: () => (K() ? kOf(K(), lv().arena.tide || 'spire') : 0),
      ringWard: ee => ctx.ring(ee.x, ee.y - 16, 30, '#9ab0c0'),
      fx: (k, x, y) => { if (k === 'splash') ctx.burst(x, y - 2, 10, ['#8fd160', '#5a8a3a', '#cfe8a0'], 70, 0.5, -40);
        if (k === 'drag') { ctx.shake(6); ctx.burst(x, y - 10, 24, ['#e2c8ff', '#bfe6f5', '#ffffff'], 120, 0.7, -80); } },
    };
  }

  /* ---------- A BLOW ON ONE OF OURS: never nothing; the Queen never under 0.4x ---------- */
  H.take = (e, dmg, blow) => {
    if (e.t === 'nagaguard') return NGM.guardTake(e, dmg);
    if (e.t === 'nagaqueen' && Q) { const r = NQM.takeAt(e, Q); if (r.word && blow && ctx.turned) { const P = ctx.hero(); ctx.turned(e, P ? P.x : e.x, r.word, { stop: false }); }
      if (blow) Q.n.landed++; return dmg * Math.max(NQM.NQ.k.floor, r.k); }
    return dmg;
  };

  /* ---------- ONE FRAME OF THE LEVEL ---------- */
  H.update = dt => {   /* (the kit's step, its events, the pool write and every pull (the songs, the surf, the Queen's) run in the ONE wiring after this, through H.water below) */
    if (!K() || !S) return; const P = ctx.hero(); sleepQueen();
    S.foam = Math.max(0, S.foam - dt * 0.5);
    /* THE STONES: silence runs out (told), a stone riding a float moves its song with it */
    for (const id in S.stones) { const s = S.stones[id], f = field(id);
      if (s.broken) { s.quietT -= dt;
        if (s.quietT <= SR_HANDS.regrow && !s.hum) { s.hum = true; if (near(stoneX(s), 360)) ctx.sound('hum'); }
        if (s.quietT <= 0) { s.broken = false; s.hum = false; if (f) f.still = false; if (!S.told.regrow && near(stoneX(s), 240)) { S.told.regrow = 1; ctx.number(stoneX(s), stoneFeet(s) - 34, SR_SAY.regrow, '#e2c8ff'); } } }
      const fs = f ? f.s : 0, singing = s.arena ? !!(Q && Q.singing) : fs > 0.2, tell = f && f.ph === 'tell' && !f.still;
      s.glow += ((singing ? 1 : tell ? 0.45 : 0) - s.glow) * Math.min(1, dt * 6); }
    /* THE BLOWHOLES */
    for (const b of S.holes) { b.t -= dt;
      while (b.t <= 0) { b.ph = { quiet: 'boom', boom: 'spout', spout: 'quiet' }[b.ph]; b.t += SPOUT[b.ph]; b.keyed.clear();
        if (near(b.x * TS, 300)) ctx.sound(b.ph === 'boom' ? 'boom' : b.ph === 'spout' ? 'spout' : ''); }
      const x = b.x * TS + 8, feet = (b.y + 1) * TS;
      if (b.ph === 'boom' && Math.random() < dt * 14) ctx.parts().push({ x: x + (Math.random() - 0.5) * 10, y: feet - 2, vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 40, life: 0.5, max: 0.5, col: '#dff2f8', size: 1, grav: 120 });
      if (b.ph === 'spout') { if (Math.random() < dt * 40) ctx.parts().push({ x: x + (Math.random() - 0.5) * 12, y: feet - 4, vx: (Math.random() - 0.5) * 30, vy: -260 - Math.random() * 120, life: 0.6, max: 0.6, col: Math.random() < 0.5 ? '#ffffff' : '#bfe6f5', size: 2, grav: 300 });
        for (const pp of ctx.players) { if (pp.dead || b.keyed.has(pp)) continue;
          if (Math.abs(pp.x - x) <= SR_HANDS.spoutW && pp.y <= feet + 2 && pp.y >= feet - 3 * TS) { b.keyed.add(pp); pp.vy = Math.min(pp.vy || 0, SPOUT.vy); pp.ground = false; pp.onMover = null;
            if (!S.told.spout && pp === P) { S.told.spout = 1; ctx.number(pp.x, pp.y - 30, SR_SAY.spout, '#bfe6f5'); } } } }
    }
  };
  const near = (x, r) => { const P = ctx.hero(); return !!(P && Math.abs(P.x - x) < r); };

  /* ---------- THE GADGETS: a singing stone (claude/seagadget: declared to the one hook, src/sea-gadget.js - a blow AND any hero's shot / spell / thrown weapon shatters it; the tide bell is a kit verb the same hook strikes) ---------- */
  H.gadgets = () => { if (!K() || !S) return []; const out = [];
    for (const id in S.stones) { const s = S.stones[id];
      out.push({ id: 'stone:' + id, box: () => { if (s.broken) return null; const x = stoneX(s), feet = stoneFeet(s);
        return { l: x - SR_HANDS.stoneW / 2 - 2, r: x + SR_HANDS.stoneW / 2 + 2, t: feet - SR_HANDS.stoneH, b: feet - 2 }; }, strike: () => breakStone(s) }); }
    return out; };
  function breakStone(s) {
    s.broken = true; s.quietT = s.quiet; s.hum = false; const f = field(s.id); if (f) f.still = true;
    const x = stoneX(s), feet = stoneFeet(s);
    ctx.sound('crack'); ctx.shake(2); ctx.burst(x, feet - 12, 18, ['#f4ecff', '#e2c8ff', '#2a2830', '#cfc0e8'], 110, 0.6, -60);
    if (!S.told.silent) { S.told.silent = 1; ctx.number(x, feet - 36, SR_SAY.silent, '#e2c8ff'); }
    if (s.arena && Q && ctx.boss && ctx.boss.t === 'nagaqueen') { const st = arenaStones(); NQM.stoneStruck(ctx.boss, Q, world(ctx.boss), st.filter(q => q.broken).length, st.length);
      ctx.ring(x, feet - 12, 26, '#e2c8ff'); }
  }

  /* ---------- A MOVER OF OURS: a pumice raft where the tide puts it ---------- */
  H.mover = (m, dt) => {
    if (!m.sr || !K()) return false;
    const oy = m.y, y = floatY(K(), m.fid); if (y != null) m.y = y; m.x = m.x0; m.dx = 0; m.dy = m.y - oy; return true;
  };

  /* ---------- DRAWING (GREYBOX: the art pass owes the stones, the kelp, the pumice, the blowholes, the bell, the wreck, the naga sheets, the spire) ---------- */
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const VW = ctx.VW();
    for (const id in S.stones) { const s = S.stones[id], x = R(stoneX(s) - cx), y = R(stoneFeet(s) - cy); if (x < -30 || x > VW + 30) continue;
      if (s.glow > 0.05) { g.globalAlpha = 0.25 * s.glow; g.fillStyle = '#e2c8ff'; g.beginPath(); g.arc(x, y - 12, 14 + 6 * s.glow + Math.sin(t * 8) * 2 * s.glow, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      if (s.broken) { g.fillStyle = '#26232c'; g.fillRect(x - 5, y - 8, 10, 8); g.fillStyle = '#4a4458'; g.fillRect(x - 4, y - 9, 3, 2); g.fillRect(x + 1, y - 7, 3, 2);
        if (s.hum) { g.globalAlpha = 0.4 + 0.4 * Math.sin(t * 14); g.fillStyle = '#e2c8ff'; g.fillRect(x - 1, y - 12, 2, 4); g.globalAlpha = 1; } continue; }
      g.fillStyle = '#26232c'; g.fillRect(x - 5, y - 22, 10, 22); g.fillStyle = '#3a3644'; g.fillRect(x - 5, y - 22, 3, 22);
      g.fillStyle = s.glow > 0.3 ? '#f4ecff' : '#cfc0e8'; g.fillRect(x - 1, y - 19, 2, 14); g.fillRect(x - 3, y - 13, 6, 1);   /* the pearl vein */
      if (s.arena && Q && Q.singing && Math.sin(t * 6) > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 30, 3, 3); }   /* strike me while she sings */ }
    for (const b of S.holes) { const x = R(b.x * TS + 8 - cx), y = R((b.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      g.fillStyle = '#0e0c12'; g.fillRect(x - 7, y - 2, 14, 3);
      if (b.ph === 'boom') { g.fillStyle = 'rgba(223,242,248,0.6)'; g.fillRect(x - 5, y - 4 - R(Math.sin(t * 30) * 2), 10, 2); }
      if (b.ph === 'spout') { g.fillStyle = 'rgba(223,242,248,0.55)'; const hh = R((b.y - b.top + 1) * TS * Math.min(1, (SPOUT.spout - b.t) / 0.2)); g.fillRect(x - 6, y - hh, 12, hh); } }
    for (const T0 of K().tides) for (const v of T0.verbs) { if (v.t !== 'bell') continue; const x = R(v.x * TS + 8 - cx), y = R((v.y + 1) * TS - cy);
      g.fillStyle = '#3a3a44'; g.fillRect(x - 1, y - 22, 2, 22); g.fillRect(x - 6, y - 22, 12, 2); const sw = R(Math.sin(t * 18) * 3 * v.swing);
      g.fillStyle = '#b08a3a'; g.fillRect(x - 4 + sw, y - 20, 8, 8); g.fillStyle = '#e0c070'; g.fillRect(x - 3 + sw, y - 19, 2, 6); }
  };
  H.drawMover = (g, m, cx, cy) => {
    if (!m.sr) return false; const x = R(m.x - cx), y = R(m.y - cy), w = R(m.w);
    g.fillStyle = '#b8b4ac'; g.fillRect(x, y, w, 8); g.fillStyle = '#d8d4cc'; g.fillRect(x + 1, y, w - 2, 2); g.fillStyle = '#8a8680';
    for (let i = 3; i < w - 2; i += 5) g.fillRect(x + i, y + 4, 2, 2); return true;
  };
  H.drawEnt = (g, e, cx, cy, t) => {
    const x = R(e.x - cx), y = R(e.y - cy), f = e.face || 1;
    if (e.t === 'nagaguard') {
      const coil = e.mode === 'coilTell', lunge = e.mode === 'lunge', down = e.mode === 'spent';
      g.fillStyle = '#2e5a4a'; if (coil) { g.beginPath(); g.ellipse(x - f * 3, y - 4, 9, 4, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x - f * 3, y - 8, 6, 3, 0, 0, Math.PI * 2); g.fill(); }
      else g.fillRect(x - f * (lunge || down ? 16 : 10) - (f < 0 ? 0 : 0), y - 4, lunge || down ? 18 : 12, 4);   /* the tail on the rock */
      if (down) { g.fillStyle = '#3e7a62'; g.fillRect(x - 6, y - 8, 14, 5); g.fillStyle = '#c8b8d8'; g.fillRect(x + f * 8, y - 9, 4, 4); }
      else { const ty = coil ? -6 : 0; g.fillStyle = '#3e7a62'; g.fillRect(x - 3, y - 20 - ty, 7, 16); g.fillStyle = '#c8b8d8'; g.fillRect(x - 3, y - 25 - ty, 7, 6); g.fillStyle = '#c9a83a'; g.fillRect(x - 3, y - 26 - ty, 7, 1);
        /* the spear: drawn back in the tell, out in the thrust */
        const sx = e.mode === 'spearTell' ? -10 : e.mode === 'spear' ? 14 : 4; g.fillStyle = '#a8aeb8'; g.fillRect(f > 0 ? x + sx - 6 : x - sx - 18, y - 16 - ty, 24, 2); g.fillStyle = '#e8e8f0'; g.fillRect(f > 0 ? x + sx + 18 : x - sx - 21, y - 17 - ty, 3, 4); }
      if (NGM.ngOpen(e) && Math.sin(t * 10) > 0) { g.strokeStyle = '#ffd36b'; g.beginPath(); g.arc(x, y - 12, 13, 0, Math.PI * 2); g.stroke(); }
      return;
    }
    if (e.t !== 'nagaqueen') return;
    const m = e.mode, under = Q && Q.under && m !== 'surfaceTell', rear = m === 'songTell' || m === 'drownTell' ? 10 : m === 'song' || m === 'drown' ? 6 : 0;
    if (under) { g.globalAlpha = 0.45; g.fillStyle = '#2a3e5a'; g.beginPath(); g.ellipse(x, y - 5, 22, 6, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      if (m === 'drownTell' || m === 'drown') { for (let i = 0; i < 6; i++) { const a = t * 3 + i; g.fillStyle = '#dff2f8'; g.fillRect(x + R(Math.cos(a) * 20), y - 8 - R((t * 40 + i * 9) % 30), 2, 2); } } }
    else {
      /* THE COILS (GREYBOX): three loops on the rock, the tail out to one side (drawn back in the sweep's tell, flat out in the sweep) */
      const lying = m === 'reel' || m === 'dragged';
      g.fillStyle = '#2e4a6a'; g.beginPath(); g.ellipse(x, y - 5, 16, 6, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3a5a80'; g.beginPath(); g.ellipse(x - 2, y - 10, 12, 5, 0, 0, Math.PI * 2); g.fill();
      const tail = m === 'sweepTell' ? -1 : m === 'sweep' ? 1 : 0; g.fillStyle = '#2e4a6a';
      if (tail < 0) g.fillRect(x - f * 34 - (f > 0 ? 0 : -18), y - 14, 16, 4); else if (tail > 0) g.fillRect(x - NQM.NQ.sweep.r, y - 4, NQM.NQ.sweep.r * 2, 3); else g.fillRect(f > 0 ? x - 30 : x + 14, y - 4, 16, 3);
      if (lying) { g.fillStyle = '#6a5a88'; g.fillRect(x - 4, y - 16, 22, 6); g.fillStyle = '#d8c0e8'; g.fillRect(x + 16, y - 18, 7, 7); }
      else { const ty = y - 12 - rear; g.fillStyle = '#6a5a88'; g.fillRect(x - 5, ty - 14, 10, 14); g.fillStyle = '#d8c0e8'; g.fillRect(x - 4, ty - 22, 8, 8);
        g.fillStyle = '#1a1424'; g.fillRect(x - 6, ty - 23, 12, 3); g.fillRect(x - 6 - f * 2, ty - 20, 3, 10);   /* her hair */
        g.fillStyle = '#c9a83a'; g.fillRect(x - 4, ty - 26, 8, 3); g.fillRect(x - 3, ty - 28, 2, 2); g.fillRect(x + 1, ty - 28, 2, 2);   /* her crown */
        const arms = m === 'songTell' || m === 'song' ? 1 : m === 'venomTell' || m === 'surfaceTell' ? -1 : 0; g.fillStyle = '#d8c0e8';
        if (arms > 0) { g.fillRect(x - 14, ty - 18, 9, 2); g.fillRect(x + 5, ty - 18, 9, 2); } else g.fillRect(x + f * 5 - (f < 0 ? 6 : 0), ty - 10, 6, 2);
        if (m === 'venomTell' || m === 'surfaceTell') { g.fillStyle = '#8fd160'; g.fillRect(x + f * 3, ty - 17, 2, 2); }   /* the venom in her mouth */
        if (m === 'song' && Math.sin(t * 10) > 0) { g.strokeStyle = 'rgba(226,200,255,0.8)'; g.beginPath(); g.arc(x, ty - 18, 12 + ((t * 40) % 20), 0, Math.PI * 2); g.stroke(); } }
    }
    /* THE READ: gold ring + timer when open, grey when warded */
    if (NQM.nqOpen(e)) { const k = e.open / (m === 'dragged' ? NQM.NQ.dragged : NQM.NQ.reel); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 14, 24, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
      g.fillStyle = '#ffd36b'; g.fillRect(x - 16, y - 48, R(32 * k), 2); }
    else if (Q && Q.ward > 0) { g.strokeStyle = '#9ab0c0'; g.beginPath(); g.arc(x, y - 14, 24, 0, Math.PI * 2); g.stroke(); }
    if (WORD && ctx.text) { const M = NQM.MOVES[WORD.k]; if (M) ctx.text(NQM.MOVE_NAME[WORD.k] + ': ' + M.answer, x, y - 62, M.mark === '!' ? '#ffd36b' : '#ff6b6b'); }
  };
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv(), VW = ctx.VW();
    /* the cove's foam in the warn */
    for (const T0 of K().tides) { const gg = gauge(K(), T0.id); if (!gg || T0.T.mode === 'manual' || !(gg.ph === 'warn' || gg.ph === 'turn')) continue;
      for (const p of L.pools) { if (!(T0.T.pools || []).includes(p.id)) continue; const y = R(p.y - cy) - 1, x0 = Math.max(0, R(p.x0 - cx)), x1 = Math.min(VW, R(p.x1 - cx));
        g.fillStyle = gg.ph === 'warn' ? 'rgba(255,255,255,0.85)' : 'rgba(223,242,248,0.6)'; for (let x = x0 - (x0 % 6) + R(t * 20) % 6; x < x1; x += 6) g.fillRect(x, y, 3, 1); } }
    /* the Queen's venom */
    if (Q) { for (const gl of Q.globs) { g.fillStyle = '#8fd160'; g.fillRect(R(gl.x - cx) - 2, R(gl.y - cy) - 2, 5, 5); g.fillStyle = '#cfe8a0'; g.fillRect(R(gl.x - cx) - 1, R(gl.y - cy) - 1, 2, 2); }
      for (const p of Q.pools) { g.globalAlpha = Math.min(1, p.t / 0.5) * 0.8; g.fillStyle = '#6a9a3a'; g.fillRect(R(p.x - cx) - 16, R(p.y - cy) - 2, 32, 2); g.globalAlpha = 1; } }
    /* THE A3 GAUGE (one drawing for every sea level - art owed): the cove's tide while you are by it */
    const P = ctx.hero(); if (P) { const T0 = K().tides.find(q => q.T.mode !== 'manual' && (q.T.pools || []).some(id => { const p = L.pools.find(pp => pp.id === id); return p && P.x >= p.x0 - 160 && P.x <= p.x1; }));
      if (T0) { const gg = gauge(K(), T0.id), x = 6, y = 30, h = 24; g.fillStyle = 'rgba(10,14,22,0.7)'; g.fillRect(x, y, 10, h + 4);
        g.fillStyle = gg.tell && Math.sin(t * 16) > 0 ? '#ffffff' : '#7cc8e8'; const fh = R(h * gg.k); g.fillRect(x + 2, y + 2 + h - fh, 6, Math.max(1, fh));
        if (gg.coming === 'in') { g.fillStyle = '#ffd36b'; g.fillRect(x + 11, y + 2, 3, 3); } } }
  };
  H.barName = e => 'THE NAGA QUEEN' + (e.mode === 'reel' && e.open > 0 ? '  THE SONG BREAKS' : e.mode === 'dragged' && e.open > 0 ? '  DRAGGED UP' : Q && Q.ward > 0 ? '  WARDED' : Q && Q.under ? '  UNDER THE TIDE' : '');
  H.end = e => { if (Q && e && (!e.alive || e.hp <= 0)) { Q.dead = true; Q.singing = false; ctx.number(e.x, e.y - 70, NQM.NQ_SAY.down, '#ffd36b'); }
    if (Q) { Q.globs = []; Q.pools = []; } if (K()) { const s = K().tides.find(q => q.T.boss); if (s) s.ph = 'low'; } };
  H.read = () => S && { tides: K().tides.map(s => ({ id: s.id, ...gauge(K(), s.id) })), stones: Object.values(S.stones).map(s => ({ id: s.id, broken: s.broken, quietT: +s.quietT.toFixed(2), glow: +s.glow.toFixed(2) })),
    songs: PF().fields.map(f => ({ id: f.id, ph: f.ph, s: +f.s.toFixed(2), still: f.still })), holes: S.holes.map(b => ({ id: b.id, ph: b.ph })),
    queen: Q && { ph: Q.ph, under: Q.under, singing: Q.singing, ward: Q.ward, tide: Q.tide, n: { ...Q.n }, plan: ctx.boss && ctx.boss.t === 'nagaqueen' ? NQM.nqPlan(ctx.boss, Q, nearestStoneX()) : null } };
  function nearestStoneX() { const P = ctx.hero(); let b = null, d = 1e9; for (const s of arenaStones()) { if (s.broken) continue; const q = Math.abs(stoneX(s) - (P ? P.x : 0)); if (q < d) { d = q; b = stoneX(s); } } return b; }
  H.queen = () => Q; H.kit = () => K(); H.songs = () => PF();
  H.breakStone = id => { const s = S && S.stones[id]; if (s && !s.broken) breakStone(s); };   /* (the page tools and the lab) */

  /* THE WATER HOOKS (claude/sea3: the ONE wiring, src/pirate-fleet-hands.js header): this level's sounds, the stones' song events, the bell, the Queen's two songs and the stones that ride a float */
  H.water = {
    gadgets: () => H.gadgets(),   /* (claude/seagadget) the singing stones, struck by a blow or any hero's shot through the ONE hook */
    noRespawn: true,   /* the cove and the spire never reset to a safe phase on a death (they never did here) */
    quiet: true, noStreaks: true, noPosts: true, flow: true, foam() {}, gauge() {},   /* the greybox draws its own foam and its own A3 gauge */
    foes: e => e !== ctx.boss && !e.mini,   /* a song takes every loose foe (an anchored naga or a noPull one is skipped by the field itself) */
    tide(ev) {
      if (!S || !on()) return true;
      if (ev.t === 'toll') ctx.sound(ev.turn ? 'tollTurn' : 'toll');
      if (ev.t === 'phase' && ev.ph === 'warn') S.foam = 1;
      return true;
    },
    step() {   /* between the kit's step and the pulls: a stone on a float carries its song; the Queen's songs ride her coils while she sings */
      if (!S || !on() || !K()) return; sleepQueen();
      for (const id in S.stones) { const s = S.stones[id], f = field(id); if (s.on && f) { const y = floatY(K(), s.on); if (y != null) f.f.at = [s.x, y / TS - 1]; } }
      const B = ctx.boss, sing = !!(Q && Q.singing && B && B.alive && B.t === 'nagaqueen'), wetK = Q && Q.ph === 2;
      for (const f of queenFields()) { if (B && B.t === 'nagaqueen') f.f.ring = [(B.x - 8) / TS, (B.y - 14 - 8) / TS, f.f.ring[2]]; f.still = !sing || (f.id === 'queenWet' && !wetK); }
    },
    field(ev) {   /* a song's own events: the hum and the song are heard by whoever is near its stone */
      const s = S && S.stones[ev.id]; if (!s) return;
      if (ev.t === 'tell' && near(stoneX(s), 320)) ctx.sound('hum'); if (ev.t === 'on' && near(stoneX(s), 320)) ctx.sound('song');
    },
    pull(e) {   /* a seat is first drawn into a song: told once (the generic sea words are not this level's) */
      if (e.t === 'enter') { const f = field(e.id); if (f && f.f.song && f.s > 0.5 && !S.told.pulled) { S.told.pulled = 1; ctx.number(e.b.x, e.b.y - 34, SR_SAY.pulled, '#e2c8ff'); } }
      return true;
    },
    verb(v) {   /* a blow on the tide bell */
      if (!S || !on()) return true; ctx.sound('bell');
      if (v.t === 'bell' && !S.told.bell) { S.told.bell = 1; ctx.number(v.x * TS + 8, v.y * TS - 20, SR_SAY.bell, '#bfe6f5'); }
      return true;
    },
  };
  return H;
}
