// src/gq5q1.js - GQ5Q1: THE BELL HOISTS (Daniel 11-12 14:04, scratch gq5-plan.md section 3). One switch, default OFF: OFF = claude/gq5fix cell for cell.
// ON, in THE GEODE THRONE hall (phase 1) only:
//   THE HOISTS   three 4-tile iron grate-lifts on chains from floor slots; ring the hall bell (any blow or hero shot) and they rise 2 tiles in 0.6 s, stay up (8 s from the ring), rattle + flash red + "LOWERING"
//                from 6.5 s, sink at 8.0 s over 0.5 s setting every rider down. The bell cools down 16 s ("STILL SWINGING"). The permanent galleries are not laid.
//   THE THRONE FIRE   a new move: she runs to her hearth spot and plants her sceptre (tell 2.5 s, floor grilles glow in three steps, "THE FLOOR BURNS", the bell glows "RING!"), then the whole floor burns 3.0 s:
//                6 dmg per 0.5 s tick, up to 36, no stagger. A hero standing on a hoist is not burned. Only when the bell is READY and the hoists are DOWN; first at 12 s, then every 20 s; it opens each
//                barracks wave (the wave's horn starts after it); never while a wave's horn runs.
//   SCORCHED     while she channels, a plunge from a hoist onto her (or any blow / shot by a hero standing on a hoist) = stunned 3.0 s x1.25, at most 15% of her bar, the fire goes out, then a told 3 s ward.
//   REMOVED      the bell lure (lureBegin / lureStep / dropGrate), the grate at h17 and her charge to the bell. Everything else in the hall stays.
// The override for review and the lanes: ?gq5q1=1 on the page, globalThis.BRACKEN_GQ5Q1 = true, or BRACKEN_GQ5Q1=1 in a Node tool's env.
export const GQ5Q1_SHIPS = false;
export function gq5q1On() {
  if (GQ5Q1_SHIPS) return true;
  try { if (globalThis.BRACKEN_GQ5Q1 === true || globalThis.BRACKEN_GQ5Q1 === '1') return true; } catch { /* no global */ }
  try { if (typeof location !== 'undefined' && /[?&]gq5q1=1\b/.test(location.search || '')) return true; } catch { /* no page */ }
  try { if (typeof process !== 'undefined' && process.env && process.env.BRACKEN_GQ5Q1 === '1') return true; } catch { /* no node */ }
  return false;
}
export const Q5 = gq5q1On();
/* the numbers (starting values for the tune lane). cols = hoist start columns counted from the hall's west wall (h-index); every hoist is w tiles wide, rises `rows` tiles above its slot. */
export const Q5N = {
  bellCd: 16,
  hoist: { cols: [7, 13, 20], w: 4, rows: 2, rise: 0.6, hold: 8.0, warn: 6.5, sink: 0.5 },   // the plan's h5-8 / h19-22 / h34-37, moved: see the report (the east hearth moved 84 px west; the centre lift clears the bell; the dais starts at h29)
  fire: { tell: 2.5, burn: 3.0, tick: 0.5, dmg: 5, first: 15, every: 20, run: 260, waveWait: 17, spotW: 72 },   // GQ5Q1-TUNE knob 1 (11-12): dmg 6 -> 5 (n=6 baseline 17%->11%, no-move, kept). knob 2: first 12 -> 15 (more time to reach a hoist before the first, currently-unanswerable, fire)
  scorch: { stun: 3.0, mul: 1.25, cap: 0.12, ward: 3.0, grace: 1.2 },   // GQ5Q1-TUNE knob 3 (11-12): cap 15% -> 12% (per the plan's tune-back order; knobs 1-2 were no-moves)
};
/* PURE: how far up the hoists are at `age` s after the ring (rows 0..rows). Rise = two steps over 0.6 s; sink = two steps over 0.5 s ending at hold + sink. */
export function hoistRowsAt(age, N = Q5N.hoist) {
  if (age < 0) return 0;
  if (age < N.rise / 2) return 0;
  if (age < N.rise) return 1;
  if (age < N.hold) return N.rows;
  if (age < N.hold + N.sink / 2) return N.rows;
  if (age < N.hold + N.sink) return 1;
  return 0;
}
export const hoistTotal = (N = Q5N.hoist) => N.hold + N.sink;

export function makeGQ5Q1(env) {
  const { TS, ctx } = env, N = Q5N, E = {};
  let st = null, geo = null;
  const fresh = () => ({ phase: 'down', ringAt: -99, step: 0, warned: false, rattleAt: 0, nextFire: null, fire: null, fireDoneAt: -99, side: 1, due: null, dueAt: 0, ward: 0, hinted: false, scorches: 0, fires: 0, burned: 0, ringSaid: 0 });
  const tn = () => env.now();
  const sgn = v => (v < 0 ? -1 : 1);
  E.state = () => st;
  /* ---- geometry (from the hall's arena; re-read when the arena object changes) ---- */
  function G0() {
    const Lv = env.L(), A = Lv.arena; if (geo && geo.A === A) return geo;
    const x0t = Math.round(A.x0 / TS), x1t = Math.round(A.x1 / TS), fr = Math.round(A.floor / TS), W = Lv.W, grid = Lv.grid;
    const hs = N.hoist.cols.map(c => ({ c0: x0t + c, l: (x0t + c) * TS, r: (x0t + c + N.hoist.w) * TS, cx: (x0t + c + N.hoist.w / 2) * TS }));
    let ceilY = A.floor - 160; if (grid) { const cc = hs[1].c0 + 2; for (let r = fr - 1; r >= 0; r--) { const v = grid[r * W + cc]; if (v === 1) { ceilY = (r + 1) * TS; break; } } }
    const surf = {}; if (grid) for (let c = x0t; c < x1t; c++) { let y = A.floor; for (let r = fr - 4; r <= fr; r++) { const v = grid[r * W + c]; if (v === 1) { y = r * TS; break; } } surf[c] = y; }
    let dais = x1t; if (grid) for (let c = x0t; c < x1t; c++) if (grid[(fr - 1) * W + c] === 1) { dais = c; break; }
    geo = { A, x0t, x1t, fr, hs, ceilY, floorY: A.floor, surf, dais };
    return geo;
  }
  E.geo = G0;
  const topAt = step => G0().floorY - TS * step;
  const hoistAtX = x => G0().hs.find(h => x >= h.l - 3 && x <= h.r + 3) || null;
  /* standing on a lift (feet on its deck, the deck up) */
  E.hoistOf = P1 => { if (!st || st.step <= 0 || !P1 || P1.dead) return null; const h = hoistAtX(P1.x); if (!h) return null; return P1.ground !== false && Math.abs(P1.y - topAt(st.step)) <= 2.5 ? h : null; };
  /* on a lift or in the air above one (a jump or a plunge off it): the fire spares it */
  E.overHoist = P1 => { if (!st || st.step <= 0 || !P1 || P1.dead) return null; const h = hoistAtX(P1.x); if (!h) return null; const top = topAt(st.step); return P1.y <= top + 2.5 && P1.y >= top - 90 ? h : null; };

  /* ---- the lifts ---- */
  const rowTiles = (row, how) => { for (const h of G0().hs) ctx.tiles(row, h.c0, h.c0 + N.hoist.w - 1, how); };
  function setStep(n) {
    const old = st.step; if (n === old) return; const g = G0(), oldTop = topAt(old), newTop = topAt(n);
    if (n > old) { rowTiles(g.fr - n, 'lay'); if (old > 0) rowTiles(g.fr - old, 'unlay'); } else { if (n > 0) rowTiles(g.fr - n, 'lay'); rowTiles(g.fr - old, 'unlay'); }
    st.step = n;
    env.seats(P1 => { if (P1.dead || P1.ground === false || Math.abs(P1.y - oldTop) > 2.5 || !hoistAtX(P1.x)) return; P1.y = newTop; P1.vy = 0; });   // every rider goes with it: carried up, set down
    for (const h of g.hs) { ctx.dust(h.l + 4, g.floorY, 2); ctx.dust(h.r - 4, g.floorY, 2); }
    env.sfx('clank'); ctx.shake(2);
  }
  E.onRing = (e, b) => {
    if (!st || st.phase !== 'down') return false; const g = G0();
    st.phase = 'rise'; st.ringAt = tn(); st.warned = false; st.rattleAt = 0;
    for (const h of g.hs) ctx.number(h.cx, g.floorY - 22, 'THE HOISTS RISE', '#ffd36b');
    env.sfx('seaBell'); env.sfx('gateLift'); ctx.shake(3); return true;
  };
  E.hoistsUp = () => !!st && st.phase !== 'down';
  function hoistTick(dt) {
    if (st.phase === 'down') return;
    const age = tn() - st.ringAt, g = G0(), want = hoistRowsAt(age);
    if (want !== st.step) setStep(want);
    st.phase = age < N.hoist.rise ? 'rise' : age < N.hoist.hold ? 'up' : age < hoistTotal() ? 'sink' : 'down';
    if (age >= N.hoist.warn && age < N.hoist.hold) {
      if (!st.warned) { st.warned = true; for (const h of g.hs) ctx.number(h.cx, g.topY0 ?? g.floorY - TS * N.hoist.rows - 18, 'LOWERING', '#ff6b6b'); env.sfx('clank'); }
      if (tn() >= st.rattleAt) { st.rattleAt = tn() + 0.45; env.sfx('clank'); }
      if (Math.random() < dt * 40) for (const h of g.hs) ctx.part({ x: h.l + Math.random() * (h.r - h.l), y: topAt(st.step) + 6, vx: (Math.random() - 0.5) * 20, vy: 10, life: 0.3, max: 0.3, col: '#9a8f7a', size: 1, grav: 200 });
    }
    if (st.phase === 'down' && st.step === 0) { /* done: the bell re-arms by its own clock (cd 16 s from the ring) */ }
  }

  /* ---- THE THRONE FIRE ---- */
  const spotOf = side => { const g = G0(), A = g.A; if (side < 0) return A.x0 + N.fire.spotW; return g.dais * TS - 44; };   // west: beside the west hearth; east: the dais foot, as near the east hearth as she walks (her floor ends where the dais starts)
  E.spots = () => [spotOf(-1), spotOf(1)];
  E.fireWanted = e => {
    if (!st || st.fire || st.phase !== 'down' || e.crownOut) return false; const M = env.mech(), tt = tn();
    if (!M || st.nextFire == null || tt < st.nextFire) return false;
    if (tt < (M.cd || 0)) return false;           // the bell must be READY (a player can answer the tell)
    if (M.wave) return false;                     // never while a wave's horn runs (or its guards are in)
    if (env.geodeOn()) return false;
    return true;
  };
  E.fireStart = e => {
    const tt = tn(), g = G0(); st.side = -st.side; const side = st.side, hs = env.hearthXs();
    st.fire = { phase: 'tell', t0: tt, side, spotX: spotOf(side), hearthX: hs[side < 0 ? 0 : 1], tickN: 0, tB: 0, ringSaid: 0 };
    st.nextFire = tt + N.fire.every; st.fires++;
    e.mode = 'fireTell'; e.modeT = N.fire.tell; e.vx = 0; e.crownOut = false; e.face = sgn(st.fire.spotX - e.x);
    env.gap(tt + N.fire.tell + N.fire.burn + 1.5);
    ctx.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); ctx.number(e.x, e.y - 70, 'THE FLOOR BURNS', '#ff9a5c'); env.sfx('bellow'); env.sfx('callerChant');
    if (!st.hinted && ctx.hint) { st.hinted = true; ctx.hint('THE FLOOR BURNS: RING THE HALL BELL, THE HOISTS RISE. STAND ON ONE, AND STRIKE HER FROM ABOVE.'); }
  };
  function fireEnd(e, how) { if (!st.fire) return; st.fire = null; st.fireDoneAt = tn(); if (st.due !== null && how) st.due = st.due; }
  function burnBegin(e) {
    const F = st.fire; F.phase = 'burn'; F.tB = tn(); F.tickN = 0; e.mode = 'fireBurn'; e.modeT = N.fire.burn; e.vx = 0;
    ctx.number(e.x, e.y - 70, 'THE FIRE', '#ff6b2c'); env.sfx('callerBlast'); ctx.shake(4); ctx.ring(e.x, e.y - 30, 40, '#ff6b2c', 0.6);
  }
  E.mode = (e, dt) => {
    const F = st && st.fire; if (!F) { e.mode = 'rec'; e.modeT = 0.4; return 0; }
    if (e.mode === 'fireBurn') {
      e.vx = 0; if (Math.random() < dt * 30) ctx.part({ x: e.x + (Math.random() - 0.5) * 30, y: e.y - 20, vx: 0, vy: -50, life: 0.4, max: 0.4, col: '#ff9a5c', size: 2, grav: 0, glow: true });
      burnTicks(); if (e.modeT <= 0) { fireEnd(e, 'end'); e.mode = 'rec'; e.modeT = 0.8; }
      return 0;
    }
    // fireTell: she runs to her hearth's spot (told by the grille glow), plants the sceptre
    const dx = F.spotX - e.x; if (Math.abs(dx) > 2) e.face = sgn(dx);
    const k = 1 - Math.max(0, e.modeT) / N.fire.tell, step = k < 1 / 3 ? 1 : k < 2 / 3 ? 2 : 3; F.glow = step;
    if (Math.random() < dt * (12 + 30 * k)) ctx.part({ x: F.hearthX + (Math.random() - 0.5) * 16, y: G0().floorY - 22 - Math.random() * 6, vx: 0, vy: -34, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#6a6a78' : '#ff9a5c', size: 2, grav: 0, glow: true });
    const b = env.bell(), M = env.mech();
    if (b && M && tn() >= (M.cd || 0) && st.phase === 'down') {   // the bell glows: RING IT
      b.tellUntil = tn() + 0.12; b.tellK = 0.3 + 0.6 * k;
      if (tn() >= F.ringSaid) { F.ringSaid = tn() + 0.9; ctx.number(b.x, b.y - 40, 'RING!', '#ffd36b'); }
    }
    if (e.modeT <= 0) { if (Math.abs(dx) > 24) { e.x = F.spotX; ctx.burst(e.x, e.y - 30, 10, ['#b28cff', '#e8dcff'], 70, 0.4); } burnBegin(e); return 0; }
    if (Math.abs(dx) > 6 && e.modeT > 0.3) { if (Math.random() < dt * 40) ctx.dust(e.x - e.face * 18, e.y, 1); return sgn(dx) * N.fire.run; }
    return 0;
  };
  /* ---- SCORCHED ---- */
  const guardOk = () => tn() >= env.guard();
  function scorch(e, how) {
    if (!st.fire || e.mode !== 'fireBurn' || !guardOk()) return false; const tt = tn(), S0 = N.scorch;
    fireEnd(e, 'scorch'); e.mode = 'stunned'; e.modeT = S0.stun; e.scorch = true; e.q5Taken = 0; e.vx = 0; e.crownOut = false; e.flash = 0.4; st.scorches++;
    env.guard(tt + S0.stun + S0.ward); env.markStun(S0.stun);
    ctx.number(e.x, e.y - 70, 'SCORCHED', '#ff9a5c'); ctx.number(e.x, e.y - 86, how === 'plunge' ? 'FROM ABOVE' : 'THE FIRE GOES OUT', '#ffd36b'); ctx.ring(e.x, e.y - 40, 34, '#ff9a5c', 0.4);
    ctx.burst(e.x, e.y - 52, 14, ['#ff9a5c', '#ffd36b', '#fff6c8'], 90, 0.7); env.sfx('golemShatter'); ctx.shake(6); ctx.zoom(1.08, 0.3); return true;
  }
  /* called on every blow that reaches her, BEFORE her resist: P1 = the hero who struck, plunge = it is a plunge (FROM ABOVE / FIREDROP) */
  E.onHurt = (e, plunge, P1) => {
    if (!st || e.mode !== 'fireBurn' || !st.fire) return false; P1 = P1 || ctx.P(); if (!P1) return false;
    const onNow = !!E.hoistOf(P1), recent = !!plunge && tn() - (P1.q5Hoist ?? -99) <= N.scorch.grace;
    if (!onNow && !recent) return false;
    return scorch(e, plunge ? 'plunge' : 'blow');
  };
  /* what lands on a scorched Queen: x1.25, at most 15% of her bar a scorch (the gqPinCap rule) */
  E.take = (e, dmg) => {
    if (!e.scorch || e.mode !== 'stunned') return dmg; const S0 = N.scorch, cap = e.maxHp * S0.cap, room = Math.max(0, cap - (e.q5Taken || 0));
    dmg = Math.round(dmg * S0.mul);
    if (dmg >= room) { dmg = Math.max(1, Math.round(room)); if (e.modeT > 0.3) { e.modeT = 0.3; ctx.number(e.x, e.y - 70, 'SHE SHAKES OFF THE FIRE', '#ff6b5c'); } }
    e.q5Taken = (e.q5Taken || 0) + dmg; return dmg;
  };
  E.scorchEnd = e => { if (!e.scorch) return; e.scorch = false; st.ward = tn() + N.scorch.ward; ctx.number(e.x, e.y - 70, 'WARDED', '#c9a0ff'); ctx.ring(e.x, e.y - 40, 34, '#c9a0ff', 0.5); };

  /* ---- the barracks wave: the fire opens it (the horn starts after the fire, or after waveWait s) ---- */
  E.waveMayOpen = (e, k) => {
    if (!st) return true; const tt = tn();
    if (st.due !== k) { st.due = k; st.dueAt = tt; if (st.nextFire == null || st.nextFire > tt) st.nextFire = tt; }
    if (st.fire) return false;
    if (st.fireDoneAt >= st.dueAt || tt - st.dueAt > N.fire.waveWait) { st.due = null; return true; }
    return false;
  };

  /* ---- per frame (hall) ---- */
  E.update = dt => {
    if (!st) return; const e = env.q(), tt = tn(), inH = !!(e && env.inHall(e) && !e.hidden && env.bossOn());
    if (!inH) { if (st.step > 0) { try { setStep(0); } catch (err) { /* the arena is gone */ } } st.phase = 'down'; st.fire = null; return; }
    hoistTick(dt);
    if (e.mode !== 'sleep' && e.mode !== 'wake' && st.nextFire == null) st.nextFire = tt + N.fire.first;
    env.seats(P1 => { if (E.overHoist(P1)) P1.q5Hoist = tt; });
    const F = st.fire;
    if (F && e.mode !== 'fireTell' && e.mode !== 'fireBurn') { fireEnd(e, 'abort'); return; }   // stunned by a parry, dead...
    if (F && F.phase === 'burn') burnTicks();
  };
  /* the drain: a tick every 0.5 s for 3.0 s (the last one lands on the burn's final frame, before the fire ends) */
  function burnTicks() {
    const F = st.fire, tt = tn(); if (!F || F.phase !== 'burn') return; const t = tt - F.tB;
    while (F.tickN < Math.round(N.fire.burn / N.fire.tick) && t >= N.fire.tick * (F.tickN + 1) - 1e-6) {
      F.tickN++;
      env.seats(P1 => {
        if (P1.dead || E.overHoist(P1)) return;
        if (P1.inv > 0 && tt - (P1.q5TickAt ?? -9) < N.fire.tick + 0.1) P1.inv = 0;   // the burn is a drain: its own 0.8 s blow-invulnerability must not swallow the next tick
        const r = env.gqRed(P1.x, N.fire.dmg, 'THE THRONE FIRE', { noKnock: true }); if (r) { P1.q5TickAt = tt; st.burned++; }
      });
    }
  }
  E.reset = () => {
    const had = st && st.step > 0; if (had) { try { for (const row of [G0().fr - 1, G0().fr - 2]) rowTiles(row, 'unlay'); } catch (err) { /* nothing laid */ } }
    st = fresh(); const e = env.q(); if (e) e.scorch = false;
  };
  E.reset();

  /* ---- the picture (greybox + the HC2 grate): slots, chains to the ceiling, the lifts, the grilles, the flames, the ward ---- */
  let grate = null; const grateSpr = () => { if (grate === null) { try { grate = env.grate ? env.grate() : false; } catch (err) { grate = false; } } return grate; };
  E.draw = (g, cx, cy, t) => {
    if (!st) return; const e = env.q(); if (!e || !env.inHall(e)) return; const gg = G0(), W = (g.canvas && g.canvas.width) || 320, fy = Math.round(gg.floorY - cy), top = topAt(st.step), age = tn() - st.ringAt, warn = st.phase === 'up' && age >= N.hoist.warn;
    for (const h of gg.hs) {
      const x0 = Math.round(h.l - cx), x1 = Math.round(h.r - cx); if (x1 < -20 || x0 > W + 20) continue;
      const ty = Math.round(top - cy), sh = warn ? Math.round(Math.sin(t * 60) * 1) : 0, cyT = Math.round(gg.ceilY - cy);
      g.fillStyle = '#0a0810'; g.fillRect(x0 + 1, fy, x1 - x0 - 2, 9);                       // the slot in the floor
      g.fillStyle = '#6a6a7c'; g.fillRect(x0, fy, 2, 9); g.fillRect(x1 - 2, fy, 2, 9);
      for (const ch of [x0 + 5, x1 - 6]) {                                                    // the chains: ceiling to the deck
        g.fillStyle = '#6a6a7c'; g.fillRect(ch - 2, cyT, 5, 2);
        for (let yy = cyT + 2; yy < ty + sh; yy += 3) { const j = warn ? Math.round(Math.sin(t * 50 + yy) * 1) : 0; g.fillStyle = '#34343f'; g.fillRect(ch + j, yy, 2, 2); g.fillStyle = '#8a8aa0'; g.fillRect(ch + j, yy, 1, 1); } }
      const sp = grateSpr();
      for (let x = x0; x < x1; x += 16) { if (sp && sp[0]) g.drawImage(sp[0], 0, 0, 16, 9, x, ty + sh, 16, 9); else { g.fillStyle = '#34343f'; g.fillRect(x, ty + sh, 16, 8); g.fillStyle = '#8a8aa0'; g.fillRect(x, ty + sh, 16, 1); } }
      if (st.step === 0) { g.fillStyle = '#c9a040'; g.fillRect(x0 + 6, fy - 1, 4, 1); g.fillRect(x1 - 10, fy - 1, 4, 1); }   // the lift at rest: flush, its gold studs
      if (warn && Math.floor(t * 8) % 2 === 0) { g.globalAlpha = 0.45; g.fillStyle = '#ff3a2a'; g.fillRect(x0, ty + sh, x1 - x0, 9); g.globalAlpha = 1; }
    }
    const F = st.fire;
    if (F) {
      const step = F.phase === 'tell' ? (F.glow || 1) : 4, hx = Math.round(F.hearthX - cx);
      env.hearth(g, hx, fy, true, t);
      const cols = ['#7a2a1a', '#ff6b2c', '#ffd36b', '#ffffff'][step - 1];
      for (let c = gg.x0t + 1; c < gg.x1t - 1; c += 3) { const sx = Math.round(c * TS - cx), sy = Math.round((gg.surf[c] ?? gg.floorY) - cy); if (sx < -40 || sx > W + 40) continue;
        g.globalAlpha = F.phase === 'tell' ? 0.35 + 0.2 * step + 0.15 * Math.sin(t * 12) : 0.9; g.fillStyle = cols; g.fillRect(sx + 2, sy - 1, 28, 2); g.fillStyle = '#12101a'; for (let b = 4; b < 30; b += 4) g.fillRect(sx + b, sy - 1, 1, 2); g.globalAlpha = 1; }
      if (F.phase === 'burn') {
        g.globalAlpha = 0.07; g.fillStyle = '#ff6b2c'; g.fillRect(0, fy - 60, W, 60); g.globalAlpha = 0.85;
        for (let sx = -((cx | 0) % 6); sx < W; sx += 6) { const c = Math.floor((sx + cx) / TS), sy = Math.round((gg.surf[c] ?? gg.floorY) - cy); const h0 = 8 + 9 * (0.5 + 0.5 * Math.sin(t * 22 + sx * 0.45)); g.fillStyle = '#ff6b2c'; g.fillRect(sx, sy - h0, 5, h0); g.fillStyle = '#ffd36b'; g.fillRect(sx + 1, sy - h0 * 0.5, 3, h0 * 0.5); }
        g.globalAlpha = 1; }
    }
    if (tn() < st.ward && env.ward) env.ward(g, Math.round(e.x - cx), Math.round(e.y - cy), t);
  };

  /* ---- THE LAB BOT's duty (src/lab.js): ring the bell on the fire's tell, climb the hoist beside her, plunge onto her during the burn ---- */
  E.labDuty = (P0, e, b, M) => {
    if (!st || !b || !e) return null; const g = G0(), tt = tn(), F = st.fire;
    if (!F) return null;
    const near = g.hs.reduce((a, h) => (Math.abs(h.cx - F.spotX) < Math.abs(a.cx - F.spotX) ? h : a), g.hs[0]);
    const onNear = E.hoistOf(P0) === near;
    if (st.phase === 'down' && F.phase === 'tell' && tt >= (M.cd || 0)) return { x: b.x - 18, face: 1, swing: true, why: 'ring' };
    if (st.phase !== 'down') {
      if (onNear || E.overHoist(P0)) { if (F.phase === 'burn') return { x: e.x, face: sgn(e.x - P0.x), swing: false, jump: !!E.hoistOf(P0), plunge: true, why: 'plunge' }; return { x: near.cx, face: sgn(e.x - P0.x), swing: false, why: 'wait' }; }
      return { x: near.cx, face: sgn(near.cx - P0.x), swing: false, jump: Math.abs(P0.x - near.cx) < 40, why: 'hoist' };
    }
    return null;
  };
  return E;
}
