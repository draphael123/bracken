// src/gq5q2.js - GQ5Q2: THE TOWER TOP, CLEAR (Daniel 11-12 14:04, scratch gq5-plan.md section 4). One switch, default OFF: OFF = claude/gq5q1 cell for cell. Independent of GQ5Q1 (the hall).
// ON, on the tower top (phase 2) only:
//   THE RULE      the entry hint + plate: "STRIKE HER STONES BACK AT HER - AND WHEN SHE HIDES IN THE BELL, RING IT." (replaces "SHE WAITS ON THE ROOF").
//   THE TEACH     at ~1.5 s ONE slow (160 px/s) gold-glint shard from a ring on your level, a "STRIKE IT!" plate riding it; home = "STRUCK - 8%!" + a flash; a miss repeats, 3 times at most.
//                 At ~8 s the bell rope at deck level (beside the cupola) shows a dim 'RING' plate.
//   THE BELL PERCH  every 22 s, the first at 18 s (replaces the BOMBARDMENT's 70 / 45% triggers; once more in the rage, 18 s after the last): she blinks into the cupola ring behind a violet ward
//                 ("WARDED - RING THE BELL"), rockfall 2 shadows per 1.2 s. A deck-level ROPE hangs from the cupola frame: ANY blow or ANY hero shot rings it (1.2 s swing tell) = SHAKEN LOOSE, she falls
//                 to the deck, DOWNED 3.0 s x1.5, at most 10% of her bar. Nobody rings = she leaves after 8 s. The one immunity window (B15): every hero can break it.
//   THE SWEEP     within 3 tiles: tell 0.7 s, a 2.5-tile chest arc, 18 (x dmgK), jump or block, a parry = STAGGERED 1.2 s, cd 4 s.
//   THE HATCH ERUPTS  every 15 s after 50%: seam smoke 1.2 s + "THE HATCH!", then a fire column 2 wide x 5 rows for 2.0 s (14 + a push), the nearest bay burns with it. Never during the perch's swing / downed window.
//   NUMBERS       SHARD VOLLEY cd 2.5 -> 2.2 s; the phase-2 dmgK 0.6 -> 0.65; her bar stays 1000.
// The override for review and the lanes: ?gq5q2=1 on the page, globalThis.BRACKEN_GQ5Q2 = true, or BRACKEN_GQ5Q2=1 in a Node tool's env.
export const GQ5Q2_SHIPS = false;
export function gq5q2On() {
  if (GQ5Q2_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ5Q2 === true || globalThis.BRACKEN_GQ5Q2 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq5q2=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ5Q2 === '1') return true; } catch { /* no node */ }
  return false;
}
export const Q52 = gq5q2On();
/* the numbers (starting values for the tune lane; tune order: sweep dmg, perch cap, dmgK) */
export const Q52N = {
  hint: 'STRIKE HER STONES BACK AT HER - AND WHEN SHE HIDES IN THE BELL, RING IT.',
  plate: ['STRIKE HER STONES BACK AT HER', 'AND WHEN SHE HIDES IN THE BELL, RING IT.'],
  volleyCd: 2.2, dmgK: 0.65, firstVolley: 6.5,        // the first volley waits for the teach shard to be seen (it was 1.6 s)
  teach: { at: 1.5, v: 160, dmg: 4, max: 3, retry: 2.0, ropeAt: 8.0, ropeFor: 6.0 },
  rope: { dx: 0, top: 240, hang: 70, hw: 9 },          // dx from the cupola frame's west column centre; the rope hangs from the frame (row 14's underside, y 240) down to 70 px over the deck; hw = half width of the strike box
  perch: { first: 18, every: 22, tell: 0.6, hold: 8.0, swing: 1.2, down: 3.0, mul: 1.5, cap: 0.10, rainEvery: 1.2, rainN: 2, rageGap: 18, fallDx: 34, guard: 1.5 },
  sweep: { range: 48, tell: 0.7, cut: 0.3, arc: 44, dmg: 18, cd: 4.0, stagger: 1.2, bandHi: 30, bandLo: 12 },   /* (GQ5Q2-TUNE step 1: 15 -> 18, the baseline n=6 read 78% [55-91], over the 60-65 band; every roof-reaching fight in the baseline won) */
  hatch: { at: 0.5, first: 4.0, every: 15, smoke: 1.2, fire: 2.0, w: 2, rows: 5, dmg: 14, lead: 4.2 },
};

export function makeGQ5Q2(env) {
  const { TS, ctx } = env, N = Q52N, E = {};
  let st = null;
  const tn = () => env.now();
  const sgn = v => (v < 0 ? -1 : 1);
  const fresh = () => ({ t0: tn(), teach: { n: 0, shard: null, nextAt: tn() + N.teach.at, done: false, said: 0, struck: 0 }, ropeSaid: 0, ropeBell: 0, ropeCd: 0,
    perch: { phase: 'idle', n: 0, nextAt: tn() + N.perch.first, start: 0, lastEnd: tn(), until: 0, swingAt: 0, rainAt: 0, downs: 0, rageSet: false, rageOnly: false, ringSaid: 0, ropeHint: false, downX: 0 },
    sweep: { cd: 0, n: 0, parried: 0, dmgs: 0 },
    hatch: { phase: 'idle', n: 0, next: Infinity, t0: 0, hits: new Set(), bay: -1, armed: false, hurt: 0 } });
  E.state = () => st;
  /* ---- geometry ---- */
  const tower = () => { const Lv = env.L(); return (Lv.arena && Lv.arena.tower) || (Lv.arenaRoof && Lv.arenaRoof.tower) || null; };
  const RAf = () => (env.L().arena || {}).floor || 320;
  E.rope = () => { const Tw = tower(); if (!Tw) return null; const x = Tw.CUPOLA.frame[0] * TS + 8 + N.rope.dx, fl = RAf(); return { x, top: N.rope.top, bot: fl - 2, box: { l: x - N.rope.hw, r: x + N.rope.hw, t: fl - N.rope.hang, b: fl - 2 }, frameCol: Tw.CUPOLA.frame[0], frameRow: Tw.CUPOLA.frame[2] }; };
  E.hatch = () => { const Tw = tower(); if (!Tw) return null; const c0 = Tw.HATCH.cols[0], x0 = c0 * TS, w = N.hatch.w * TS, fl = RAf(); return { x0, x1: x0 + w, cx: x0 + w / 2, top: fl - N.hatch.rows * TS, fl }; };
  E.downX = () => { const r = E.rope(); return r ? r.x - N.perch.fallDx : 0; };
  const cupola = () => { const c = env.rings().find(r => r.id === 'cu'); return c ? env.ringPos(c) : null; };
  const nearestBay = () => { const Tw = tower(), h = E.hatch(); if (!Tw || !h) return -1; let bi = -1, bd = 1e9; Tw.BAYS.forEach((sp, i) => { const d = Math.abs(((sp[0] + sp[1] + 1) / 2) * TS - h.cx); if (d < bd) { bd = d; bi = i; } }); return bi; };
  E.nearestBay = nearestBay;
  const P4 = () => (env.R0() ? env.R0().q4 : null);

  /* ---- begin (roofBegin) ---- */
  E.begin = R0 => {
    st = fresh(); const p4 = R0 && R0.q4; if (p4) p4.volleyCd = Math.max(p4.volleyCd, N.firstVolley);
    const e = env.q(), RA = env.L().arena || env.L().arenaRoof;
    if (RA && e) { const cx = (RA.x0 + RA.x1) / 2; ctx.number(cx, RAf() - 118, N.plate[0], '#ffd36b'); ctx.number(cx, RAf() - 100, N.plate[1], '#ffd36b'); }
    if (ctx.hint) ctx.hint(N.hint);
  };

  /* ---- THE TEACH ---- */
  E.teachHome = (e, r) => {
    const T = st && st.teach; if (!T || !r || !r.teach) return; T.done = true; T.struck++; e.flash = 0.6; e.q52Notch = tn() + 0.9;
    ctx.number(e.x, e.y - 78, 'STRUCK - 8%!', '#8fd160'); ctx.ring(e.x, e.y - 40, 44, '#8fd160', 0.6); ctx.burst(e.x, e.y - 44, 20, ['#8fd160', '#fff6c8', '#ffd36b'], 110, 0.8); ctx.shake(5); ctx.zoom(1.06, 0.25); env.sfx('parry');
  };
  function teachStep(dt) {
    const T = st.teach, e = env.q(), tt = tn(); if (T.done) return;
    if (T.shard) {
      const r = T.shard;
      if (r.dead) { if (r.arrived) T.done = true; else { T.shard = null; T.nextAt = tt + N.teach.retry; } return; }
      if (!r.home && tt >= T.said) { T.said = tt + 1.0; ctx.number(r.x, r.y - 16, 'STRIKE IT!', '#ffd36b'); }
      return;
    }
    if (T.n >= N.teach.max || tt < T.nextAt || !e || e.mode === 'perch' || e.mode === 'perchSwing' || e.hp <= 0) return;
    const P0 = env.target(); if (!P0 || P0.dead) return; const ex = env.lvlRings(1)[0]; if (!ex) return;
    const p = env.ringPos(ex.r), px = p.x, py = p.y - 14, dx = P0.x - px, dy = (P0.y - 9) - py, dd = Math.hypot(dx, dy) || 1;
    const r = env.addShardRef({ x: px, y: py, vx: dx / dd * N.teach.v, vy: dy / dd * N.teach.v, dmg: N.teach.dmg, glint: true, teach: true });
    if (!r) { T.nextAt = tt + 0.5; return; }
    T.n++; T.shard = r; T.said = tt + 0.3; ctx.burst(px, py, 8, ['#ffd36b', '#fff6c8'], 50, 0.4); ctx.ring(px, py, 14, '#ffd36b', 0.4); env.sfx('portalOpen'); ctx.number(px, py - 18, 'STRIKE IT!', '#ffd36b');
  }

  /* ---- THE ROPE and THE BELL PERCH ---- */
  const perchBusy = () => st.perch.phase !== 'idle';
  E.perchPhase = () => (st ? st.perch.phase : 'idle');
  E.hatchBusy = () => !!st && st.hatch.phase !== 'idle';
  E.perchWanted = e => {
    if (!st) return false; const Pc = st.perch, tt = tn();
    if (Pc.phase !== 'idle' || tt < Pc.nextAt || st.hatch.phase !== 'idle' || !cupola()) return false;
    return e.mode === 'roofStand' || e.mode === 'rec';
  };
  E.perchStart = e => {
    const Pc = st.perch, tt = tn(); Pc.phase = 'tell'; Pc.n++; Pc.start = tt; Pc.nextAt = tt + N.perch.every; if (Pc.rageOnly) Pc.nextAt = Infinity;
    e.mode = 'perchTell'; e.modeT = N.perch.tell; e.vx = 0; e.crownOut = false; env.setCrown(null);
    ctx.number(e.x, e.y - e.h - 12, '!', '#c9a0ff'); ctx.number(e.x, e.y - 70, 'SHE RUNS FOR THE BELL', '#c9a0ff'); env.sfx('portalOpen'); ctx.burst(e.x, e.y - 24, 10, ['#b28cff', '#e8dcff'], 60, 0.4);
    const p4 = P4(); if (p4) p4.fall = p4.fall || [];
    if (!Pc.ropeHint && ctx.hint) { Pc.ropeHint = true; ctx.hint('SHE IS WARDED IN THE BELL. HIT THE BELL ROPE ON THE DECK: A BLOW, AN ARROW OR A SHOT.'); }
  };
  function perchGo(e) {
    const Pc = st.perch, tt = tn(), p = cupola(), p4 = P4(); if (!p) { e.mode = 'rec'; e.modeT = 0.4; Pc.phase = 'idle'; return; }
    ctx.burst(e.x, e.y - 24, 14, ['#3a2a4a', '#7a4aa0', '#c9a0ff'], 80, 0.5); e.x = p.x; e.y = p.y - 1; e.vx = 0; e.vy = 0; e.mode = 'perch'; e.modeT = N.perch.hold; Pc.phase = 'perched'; Pc.until = tt + N.perch.hold; Pc.rainAt = tt + 0.9; Pc.ringSaid = 0;
    if (p4) p4.ward = Math.max(p4.ward || 0, tt + N.perch.hold + 0.2);
    ctx.burst(e.x, e.y - 22, 14, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); ctx.ring(e.x, e.y - 30, 34, '#c9a0ff', 0.6); env.sfx('callerBlast'); ctx.number(e.x, e.y - 76, 'WARDED - RING THE BELL', '#c9a0ff');
  }
  /* any blow or hero shot on the rope (src/hero-strikes.js: one rule) */
  function ropeStep(dt) {
    const rp = E.rope(), Pc = st.perch, tt = tn(); if (!rp) return; if (st.ropeCd > 0) st.ropeCd -= dt;
    let hit = null; try { hit = env.strikes(rp.box, 'q52rope'); } catch (err) { hit = null; }   /* a tool's fake world may have no attack box */ if (!hit) return;
    if (Pc.phase === 'perched') { ringRope(hit); return; }
    if (st.ropeCd <= 0) { st.ropeCd = 0.8; st.ropeBell = tt + 0.6; ctx.number(rp.x, rp.box.t - 8, Pc.phase === 'idle' ? 'NOTHING IN THE BELL' : 'THE BELL TOLLS', '#8a7fa0'); env.sfx('seaBell'); }
  }
  function ringRope(hit) {
    const Pc = st.perch, e = env.q(), tt = tn(), rp = E.rope(); if (!e || Pc.phase !== 'perched') return;
    Pc.phase = 'swing'; Pc.swingAt = tt; Pc.rang = (hit && hit.how) || 'blow'; e.mode = 'perchSwing'; e.modeT = N.perch.swing; st.ropeBell = tt + N.perch.swing;
    ctx.number(rp.x, rp.box.t - 10, 'THE BELL SWINGS', '#ffd36b'); ctx.ring(rp.x, rp.box.t, 16, '#ffd36b', 0.5); env.sfx('seaBell'); env.sfx('clank'); ctx.shake(3);
  }
  function loose(e) {
    const Pc = st.perch, tt = tn(), p4 = P4(), RA = env.L().arena; Pc.phase = 'down'; Pc.downs++; const x0 = RA.x0 + 20, x1 = RA.x1 - 20; Pc.downX = Math.max(x0, Math.min(x1, E.downX()));
    if (p4) p4.ward = 0; ctx.burst(e.x, e.y - 20, 14, ['#3a2a4a', '#c9a0ff', '#e8dcff'], 90, 0.5);
    e.x = Pc.downX; e.y = RAf(); e.vx = 0; e.vy = 0; e.mode = 'stunned'; e.modeT = N.perch.down; e.q52Down = true; e.q52Taken = 0; e.gqOpenTaken = 0; e.crownOut = false; e.flash = 0.5; e.face = sgn(env.target().x - e.x);
    env.guard(tt + N.perch.down + N.perch.guard); env.markStun(N.perch.down);
    ctx.dust(e.x, e.y, 14); ctx.number(e.x, e.y - 70, 'SHAKEN LOOSE', '#ffd36b'); ctx.number(e.x, e.y - 86, 'DOWNED', '#8fd160'); ctx.ring(e.x, e.y - 40, 34, '#ffd36b', 0.5); ctx.burst(e.x, e.y - 52, 16, ['#ffd36b', '#fff6c8', '#e0b040'], 100, 0.7);
    env.sfx('golemShatter'); ctx.shake(7); ctx.zoom(1.08, 0.3);
  }
  function leave(e, why) {
    const Pc = st.perch, p4 = P4(), P0 = env.target(); Pc.phase = 'idle'; Pc.lastEnd = tn(); if (p4) p4.ward = 0;
    if (why === 'timeout') { const ex = env.pickExit(P0, 60, true, true); if (ex) { e.x = ex.p.x; e.y = ex.p.y - 1; e.vy = 0; ctx.burst(e.x, e.y - 22, 14, ['#fff6c8', '#e8dcff', '#b28cff'], 90, 0.5); } ctx.number(e.x, e.y - 70, 'SHE LEAVES THE BELL', '#c9a0ff'); env.sfx('portalOpen'); }
    if (Pc.rageOnly) Pc.nextAt = Infinity;
    e.mode = 'rec'; e.modeT = 0.8;
  }
  /* the down window ends (H.mode 'stunned' case) */
  E.downEnd = e => { if (!e.q52Down) return; e.q52Down = false; const Pc = st && st.perch; if (Pc && Pc.phase === 'down') { Pc.phase = 'idle'; Pc.lastEnd = tn(); if (Pc.rageOnly) Pc.nextAt = Infinity; } };
  /* hurtEnemy0 (src/main.js): the perch is the ONE immunity window - the ward turns every blade; returns true = nothing lands */
  E.ward = (e, fromX) => {
    if (!st || e.stage !== 'roof' || !(e.mode === 'perch' || e.mode === 'perchSwing')) return false; const tt = tn();
    if (!(e.q52WardSaid > tt)) { e.q52WardSaid = tt + 1.2; ctx.number(e.x, e.y - 60, 'WARDED - RING THE BELL', '#c9a0ff'); ctx.ring(e.x, e.y - 40, 26, '#c9a0ff', 0.3); env.sfx('clank'); }
    e.wardHit = 0.4; return true;
  };
  /* what lands on a DOWNED Queen: the roof's stunned x1.25 is already in `dmg`; x1.5 in all, at most 10% of her bar */
  E.take = (e, dmg) => {
    if (!e.q52Down || e.mode !== 'stunned') return dmg; const Pn = N.perch, cap = e.maxHp * Pn.cap, room = Math.max(0, cap - (e.q52Taken || 0));
    dmg = Math.round(dmg * (Pn.mul / 1.25));
    if (dmg >= room) { dmg = Math.max(1, Math.round(room)); if (e.modeT > 0.3) { e.modeT = 0.3; ctx.number(e.x, e.y - 70, 'SHE SCRAMBLES AWAY', '#ff6b5c'); } }
    e.q52Taken = (e.q52Taken || 0) + dmg; return dmg;
  };

  /* ---- THE SCEPTRE SWEEP ---- */
  E.sweepWanted = (e, ad) => {
    if (!st || st.sweep.cd > 0 || (e.mode !== 'roofStand' && e.mode !== 'rec')) return false; let near = false;
    env.seats(P1 => { if (!P1.dead && Math.abs(P1.x - e.x) <= N.sweep.range && Math.abs(P1.y - e.y) < 24) near = true; }); return near;
  };
  E.sweepStart = e => {
    const S0 = N.sweep, P0 = env.target(); st.sweep.cd = S0.cd; st.sweep.n++; e.mode = 'sceptreSweepTell'; e.modeT = S0.tell; e.vx = 0; e.face = sgn(P0.x - e.x);
    ctx.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); env.sfx('snort'); ctx.dust(e.x - e.face * 12, e.y, 4);
  };
  function sweepCut(e) {
    const S0 = N.sweep; e.mode = 'sceptreSweepCut'; e.modeT = S0.cut; env.sfx('slash'); ctx.shake(3); st.sweep.arcAt = tn(); st.sweep.face = e.face; let parried = false;
    env.seats(P1 => {
      const x0 = Math.min(e.x - e.face * 10, e.x + e.face * S0.arc), x1 = Math.max(e.x - e.face * 10, e.x + e.face * S0.arc), box = { l: x0, r: x1, t: e.y - S0.bandHi, b: e.y - S0.bandLo };
      if (P1.dead || !ctx.overlap(box, ctx.hurtBox())) return;
      st.sweep.dmgs++; const h = env.gqHit(e.x, S0.dmg, e, 'HER SCEPTRE SWEEP'); if (h.parried) parried = true;
    });
    if (parried) { st.sweep.parried++; if (env.jarr(e)) { e.modeT = S0.stagger; env.guard(tn() + S0.stagger + env.stunGap()); } }
  }

  /* ---- THE HATCH ERUPTS ---- */
  function hatchStep(dt) {
    const Hs = st.hatch, e = env.q(), tt = tn(), h = E.hatch(), R0 = env.R0(); if (!h || !e || !R0) return; const hpk = e.hp / e.maxHp;
    if (!Hs.armed && hpk <= N.hatch.at && e.hp > 0) { Hs.armed = true; Hs.next = tt + N.hatch.first; }
    if (Hs.phase === 'idle') {
      if (!Hs.armed || tt < Hs.next) return;
      const Pc = st.perch;   // never beside the perch's swing / downed window; never when the perch is due before the eruption would be over
      if (Pc.phase === 'swing' || Pc.phase === 'down' || (Pc.phase === 'idle' && Pc.nextAt - tt < N.hatch.lead && Pc.nextAt - tt > -3) || e.mode === 'rageTell' || e.mode === 'stunned') { Hs.next = tt + 0.5; return; }
      Hs.phase = 'smoke'; Hs.t0 = tt; Hs.n++; Hs.hits = new Set(); Hs.next = tt + N.hatch.every;
      ctx.number(h.cx, h.fl - 42, 'THE HATCH!', '#ff9a5c'); env.sfx('rumble'); ctx.shake(3);
      Hs.bay = nearestBay(); if (Hs.bay >= 0) env.lightBay(R0, Hs.bay, tt);
      return;
    }
    if (Hs.phase === 'smoke') {
      if (Math.random() < dt * 50) ctx.part({ x: h.x0 + Math.random() * (h.x1 - h.x0), y: h.fl - 2, vx: (Math.random() - 0.5) * 12, vy: -30 - Math.random() * 20, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#4a4a58' : '#ff9a5c', size: 2, grav: 0, glow: true });
      if (tt - Hs.t0 >= N.hatch.smoke) { Hs.phase = 'fire'; Hs.t0 = tt; env.sfx('callerBlast'); ctx.shake(6); ctx.ring(h.cx, h.fl - 10, 30, '#ff6b2c', 0.5); }
      return;
    }
    if (Hs.phase === 'fire') {
      if (Math.random() < dt * 90) ctx.part({ x: h.x0 + Math.random() * (h.x1 - h.x0), y: h.fl - 4 - Math.random() * 20, vx: 0, vy: -90 - Math.random() * 60, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#ff6b2c' : '#ffd36b', size: 2, grav: 0, glow: true });
      env.seats(P1 => { if (P1.dead || Hs.hits.has(P1) || P1.x < h.x0 - 4 || P1.x > h.x1 + 4 || P1.y <= h.top || P1.y > h.fl + 4) return; Hs.hits.add(P1); Hs.hurt++; env.gqRed(h.cx, N.hatch.dmg, 'THE HATCH ERUPTS', {}); });
      if (tt - Hs.t0 >= N.hatch.fire) { Hs.phase = 'idle'; Hs.hits = new Set(); }
    }
  }
  /* where the eruption stands now (the lab steps off it; the tools read it): null when it is not told or burning */
  E.hatchZone = () => { if (!st || st.hatch.phase === 'idle') return null; const h = E.hatch(); return h ? { x0: h.x0, x1: h.x1, cx: h.cx, phase: st.hatch.phase } : null; };

  /* ---- her modes (q4Mode calls this first) ---- */
  E.mode = (e, dt) => {
    if (!st) return undefined; const P0 = env.target(), d = P0.x - e.x;
    switch (e.mode) {
      case 'sceptreSweepTell': e.vx = 0; e.face = sgn(d) || e.face; if (Math.random() < dt * 30) ctx.part({ x: e.x + e.face * (10 + Math.random() * 30), y: e.y - 18 - Math.random() * 14, vx: 0, vy: -20, life: 0.25, max: 0.25, col: '#ffd36b', size: 1, grav: 0, glow: true }); if (e.modeT <= 0) sweepCut(e); return 0;
      case 'sceptreSweepCut': e.vx = 0; if (e.modeT <= 0) { e.mode = 'rec'; e.modeT = 0.6; } return 0;
      case 'perchTell': e.vx = 0; e.face = sgn(d) || e.face; if (Math.random() < dt * 40) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 20 - Math.random() * 40, vx: 0, vy: -26, life: 0.4, max: 0.4, col: '#b28cff', size: 2, grav: 0, glow: true }); if (e.modeT <= 0) perchGo(e); return 0;
      case 'perch': e.vx = 0; e.face = sgn(d) || e.face; if (e.modeT <= 0) leave(e, 'timeout'); return 0;
      case 'perchSwing': e.vx = 0; if (e.modeT <= 0) loose(e); return 0;
    }
    return undefined;
  };
  /* her choice on the tower top (q4Choose, after the rage): true = it set her mode */
  E.choose = (e, ad) => {
    if (!st) return false;
    if (E.perchWanted(e)) { E.perchStart(e); return true; }
    if (E.sweepWanted(e, ad)) { E.sweepStart(e); return true; }
    return false;
  };

  /* ---- per frame (roof) ---- */
  E.update = dt => {
    if (!st) return; const e = env.q(), R0 = env.R0(); if (!e || !R0 || e.stage !== 'roof') return; const Pc = st.perch, tt = tn(), p4 = P4();
    if (st.sweep.cd > 0) st.sweep.cd -= dt;
    teachStep(dt);
    // the rage's one perch: 18 s after the last, once
    if (p4 && p4.rageDone && !Pc.rageSet) { Pc.rageSet = true; Pc.rageOnly = true; Pc.nextAt = Math.max(Pc.lastEnd + N.perch.rageGap, tt + 3.0); }
    // the rope: dim RING plate at ~8 s, bright while she is in the bell
    { const rp = E.rope(); if (rp) {
      if (tt - st.t0 >= N.teach.ropeAt && tt - st.t0 < N.teach.ropeAt + N.teach.ropeFor && tt >= st.ropeSaid && Pc.phase === 'idle') { st.ropeSaid = tt + 1.5; ctx.number(rp.x, rp.box.t - 6, 'RING', '#8a7fa0'); }
      if (Pc.phase === 'perched' && tt >= Pc.ringSaid) { Pc.ringSaid = tt + 1.0; ctx.number(rp.x, rp.box.t - 6, 'RING!', '#ffd36b'); } } }
    if (Pc.phase === 'perched' && e.mode === 'perch' && tt >= Pc.rainAt) {   // rockfall: 2 shadows per 1.2 s (the existing rock loop does the dmg + the picture)
      Pc.rainAt = tt + N.perch.rainEvery; const RA = env.L().arena, P0 = env.target(); p4.fall = p4.fall || []; const xs = [P0.x]; let guard = 0;
      while (xs.length < N.perch.rainN && guard++ < 60) { const x = RA.x0 + 24 + Math.random() * (RA.x1 - RA.x0 - 48); if (xs.every(o => Math.abs(o - x) >= 26)) xs.push(x); }
      for (let i = 0; i < xs.length; i++) p4.fall.push({ x: xs[i], at: tt + 1.0 + i * 0.1, t0: tt, done: false, until: 0 }); env.sfx('rumble'); }
    ropeStep(dt);
    // failsafes: a perch whose mode was taken from under it, never a soft-lock
    if (Pc.phase === 'tell' && e.mode !== 'perchTell') { Pc.phase = 'idle'; }
    if ((Pc.phase === 'perched' || Pc.phase === 'swing') && e.mode !== 'perch' && e.mode !== 'perchSwing') { Pc.phase = 'idle'; Pc.lastEnd = tt; if (p4) p4.ward = 0; }
    if (Pc.phase === 'down' && !(e.mode === 'stunned' && e.q52Down)) { Pc.phase = 'idle'; Pc.lastEnd = tt; e.q52Down = false; }
    hatchStep(dt);
  };
  E.reset = () => { st = null; };

  /* ---- the picture (src/redraw/gq3_art.js: rope, ward, hatch fire, sweep poses; greybox under any throw) ---- */
  E.draw = (g, cx, cy, t) => {
    if (!st) return; const e = env.q(); if (!e || e.stage !== 'roof') return; const A = env.art, rp = E.rope(), h = E.hatch(), Pc = st.perch, tt = tn(), W = (g.canvas && g.canvas.width) || 320;
    if (rp && rp.x - cx > -40 && rp.x - cx < W + 40) {
      const k = Pc.phase === 'perched' ? 1 : Pc.phase === 'swing' ? 2 : tt < st.ropeBell ? 3 : 0, kk = Pc.phase === 'swing' ? (tt - Pc.swingAt) / N.perch.swing : 0;
      try { A.drawBellRope(g, Math.round(rp.x - cx), Math.round(rp.top - cy), Math.round(rp.bot - cy), k, kk, t); } catch (err) { g.fillStyle = '#8a6a3a'; g.fillRect(Math.round(rp.x - cx) - 1, Math.round(rp.top - cy), 2, Math.round(rp.bot - rp.top)); } }
    if (Pc.phase === 'tell' || Pc.phase === 'perched' || Pc.phase === 'swing') { const p = cupola(); if (p) { try { A.drawPerchWard(g, Math.round(p.x - cx), Math.round(p.y - cy), t, Pc.phase === 'tell' ? 1 - Math.max(0, e.modeT) / N.perch.tell : 1, Pc.phase === 'swing'); } catch (err) { /* greybox: the ward shell below */ } } }
    if (h && st.hatch.phase !== 'idle' && h.x1 - cx > -40 && h.x0 - cx < W + 40) {
      const Hs = st.hatch, ph = Hs.phase === 'smoke' ? Math.min(1, (tt - Hs.t0) / N.hatch.smoke) : 1;
      try { if (Hs.phase === 'smoke') A.drawHatchSeam(g, Math.round(h.x0 - cx), Math.round(h.x1 - cx), Math.round(h.fl - cy), ph, t); else A.drawHatchFire(g, Math.round(h.x0 - cx), Math.round(h.x1 - cx), Math.round(h.fl - cy), N.hatch.rows * TS, (tt - Hs.t0) / N.hatch.fire, t); } catch (err) { g.globalAlpha = 0.6; g.fillStyle = '#ff6b2c'; g.fillRect(Math.round(h.x0 - cx), Math.round(h.top - cy), Math.round(h.x1 - h.x0), Hs.phase === 'fire' ? N.hatch.rows * TS : 2); g.globalAlpha = 1; } }
    if (e.mode === 'sceptreSweepTell' || e.mode === 'sceptreSweepCut') { try { A.drawSweep(g, Math.round(e.x - cx), Math.round(e.y - cy), e.face, e.mode === 'sceptreSweepTell' ? 1 - Math.max(0, e.modeT) / N.sweep.tell : 1, e.mode === 'sceptreSweepCut', N.sweep.arc, t); } catch (err) { /* the tell's particles are enough */ } }
  };

  /* ---- THE LAB BOT's duty (src/lab.js): ring the rope while she is in the bell (any blow or shot does it); jump the sweep's release is in lab.js's gqueenReact ---- */
  E.labDuty = (P0, e) => {
    if (!st || !e || e.stage !== 'roof') return null; const rp = E.rope(), Pc = st.perch; if (!rp) return null;
    if (Pc.phase === 'perched') return { x: rp.x - 16, face: 1, swing: true, why: 'rope' };
    return null;
  };
  return E;
}
