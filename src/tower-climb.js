// src/tower-climb.js - THE BURNING TOWER'S GQ4 CLIMB (claude/gq4l, GQ4 plan section 3; only ever built when the level has TW.OUT, i.e. GQ4L_SHIPS). The hands half of src/gq3-tower.js's
// seven storeys and the OUTSIDE stretch; src/gqueen-hands.js calls it from its escape step (towerStep / hop / draw), so the Queen lane's file keeps its own shape.
//   BURNING STOREYS 5-7 (TW.BURN)   hanging tapestries (TW.TAPS): sparks 1.0 s, then a flare 1.2 s that hurts on touch (8, never kills) - every flame hurts with a tell. The ceiling glows red; beams fall every 5-7 s (gqueen-hands).
//   THE OUTSIDE (TW.OUT)            FALLING DEBRIS (a shadow ring 1.0 s, then 12), her BOULDERS (a portal glows 0.8 s over you, the stone drops: 14; STRIKE it - a blow or an arrow - and it flies back up,
//                                   'SENT BACK', she flinches, no damage: the verb her second phase asks of you), the HOARDING (a board you stand on creaks 1.0 s and gives; a catch beam is under it: never a death fall).
//   HER HOP, IN VIEW                watch -> taunt -> STRIDE to a portal she opens -> step in -> a thread of embers -> step out a perch up -> look down. Between hops she ACTS (lights the next floor,
//                                   calls the storey's foes 'UP THERE!', drops a boulder). A hop every 7 s, or at once when a hero gets within 4 tiles. Her shortcut portal (step in = up a storey) stays, inside only.
// Greybox pictures here (the art lane draws the real ones: tapestries, boards, boulder, portals, thread).
export const TC = {
  tapTell: 1.0, tapFlare: 1.2, tapDmg: 8, tapCd: 0.9,
  debrisEvery: [4.0, 6.0], debrisTell: 1.0, debrisDmg: 12, debrisW: 12,
  boulderGlow: 0.8, boulderAir: 0.7, boulderDmg: 14, boulderR: 9, boulderHome: 260, boulderEvery: [5.5, 7.5], boulderFirst: 3.0, drop: 150,
  boardCreak: 1.0, boardBack: 6.0,
  hopEvery: 7, near: 4 * 16, taunt: 1.0, stride: 0.8, open: 0.4, stepIn: 0.35, thread: 0.7, stepOut: 0.35, look: 0.9, actEvery: [3.5, 5.0], actLen: 1.0, brazierTell: 1.0,
};
export function makeTowerClimb(env) {
  const { ctx, TS, seats, now, sfx, hit, q, asSeat, gqRed, L, portalDraw } = env;
  const C = TC, H = {};
  const rnd = (a, b) => a + Math.random() * (b - a);
  const towerOf = E => E && E.tower && E.tower.OUT ? E.tower : null;
  const grid = () => { const Lv = L(); return Lv && Lv.grid ? Lv : null; };
  const setTile = (x, y, v) => { const Lv = grid(); if (Lv) Lv.grid[y * Lv.W + x] = v; };
  const AIR = 0;
  /* ---- (re)start: a retry restores every board ---- */
  H.init = (esc, E) => {
    const Tw = towerOf(E); if (!Tw) return;
    const O = Tw.OUT, h = O.hoard, boards = [];
    for (let x = h.x0; x <= h.x1; x += h.seg) boards.push({ x, state: 'ok', t0: 0, until: 0, tile: 0 });
    esc.tc = { boards, debrisT: rnd(C.debrisEvery[0], C.debrisEvery[1]), debris: [], boulder: null, boulderT: C.boulderFirst, taps: new Map(), act: null, actT: rnd(C.actEvery[0], C.actEvery[1]), hop: null, said: new Set() };
    const Lv = grid(); if (Lv) for (const b of boards) { const at = Lv.grid[h.row * Lv.W + b.x]; b.tile = at || 0; }   /* the one-way tile (a gone board is air: capture it only while it stands) */
  };
  const hoardTile = (esc, Tw) => { const O = Tw.OUT, Lv = grid(); if (!Lv) return 2; for (let x = O.catch[0]; x <= O.catch[1]; x++) { const v = Lv.grid[O.catch[2] * Lv.W + x]; if (v) return v; } return 2; };
  /* ---- the step (called each frame while the party is in the tower; hs = [{ p, k }], top = the highest storey index in the party, t = now) ---- */
  H.step = (dt, esc, E, hs, top, t) => {
    const Tw = towerOf(E), tc = esc.tc; if (!Tw || !tc) return; const O = Tw.OUT, F = Tw.FLOORS, nS = F.length;
    const e = q();
    // ---- burning storeys: the hangings ----
    for (const tp of Tw.TAPS || []) {
      const ph = (t + tp.ph) % tp.per, flare = ph >= tp.per - C.tapFlare, spark = !flare && ph >= tp.per - C.tapFlare - C.tapTell; tp.flare = flare; tp.spark = spark;
      if (!flare) continue;
      for (const h0 of hs) if (h0.k === tp.k && Math.abs(h0.p.x - (tp.x * TS + 8)) < 15 && h0.p.y > (F[tp.k] - 6) * TS && h0.p.y <= F[tp.k] * TS + 3) {
        const key = h0.p, last = tc.taps.get(key) || -9; if (t - last < C.tapCd) continue; tc.taps.set(key, t);
        asSeat(h0.p, () => gqRed(tp.x * TS, C.tapDmg, 'A BURNING HANGING', { spare: true, noKnock: true })); ctx.burst(h0.p.x, h0.p.y - 12, 8, ['#ff9a5c', '#ffd36b', '#ff6b2c'], 70, 0.4);
      }
    }
    const out = hs.filter(h0 => h0.k === nS);
    // ---- the hoarding: a board you stand on creaks 1.0 s, then gives; it is back after a while ----
    const hd = O.hoard, tile = hoardTile(esc, Tw);
    for (const b of tc.boards) {
      if (b.state === 'ok') { const on = out.some(h0 => h0.p.ground !== false && Math.abs(h0.p.y - hd.row * TS) < 4 && h0.p.x >= b.x * TS - 2 && h0.p.x <= (b.x + hd.seg) * TS + 2);
        if (on) { b.state = 'creak'; b.t0 = t; sfx('crumble'); ctx.number(b.x * TS + 8, hd.row * TS - 20, 'CREAK', '#c9a070'); } }
      else if (b.state === 'creak' && t - b.t0 >= C.boardCreak) { b.state = 'gone'; b.until = t + C.boardBack; for (let i = 0; i < hd.seg; i++) setTile(b.x + i, hd.row, AIR); ctx.dust(b.x * TS + 8, hd.row * TS, 8); ctx.burst(b.x * TS + 8, hd.row * TS, 10, ['#5a3a1a', '#ff9a5c', '#2a1a12'], 90, 0.5); sfx('thud'); }
      else if (b.state === 'gone' && t >= b.until) { b.state = 'ok'; for (let i = 0; i < hd.seg; i++) setTile(b.x + i, hd.row, tile); }
    }
    if (!out.length) return;
    const tg = out.reduce((a, c) => (c.p.y < a.p.y ? c : a), out[0]).p;   /* the highest hero outside: they come from above */
    // ---- falling debris: a ring on the ground 1.0 s ('!!'), then it lands: 12 ----
    tc.debrisT -= dt;
    if (tc.debrisT <= 0) { tc.debrisT = rnd(C.debrisEvery[0], C.debrisEvery[1]); const pick = out[Math.floor(Math.random() * out.length)].p, x = Math.max(O.x0 * TS + 12, Math.min((O.x1 + 1) * TS - 12, pick.x + (Math.random() - 0.5) * 60));
      tc.debris.push({ x, y: pick.y, at: t + C.debrisTell, state: 'tell' }); ctx.number(x, pick.y - 30, '!!', '#ff6b6b'); sfx('crack'); }
    for (const d of tc.debris) {
      if (d.state === 'tell' && t >= d.at) { d.state = 'fall'; d.at = t + 0.3; ctx.shake(4); sfx('thud'); ctx.dust(d.x, d.y, 8); ctx.burst(d.x, d.y - 6, 12, ['#ff9a5c', '#ffd36b', '#5a3a1a'], 110, 0.5);
        for (const h0 of out) if (Math.abs(h0.p.x - d.x) < C.debrisW && Math.abs(h0.p.y - d.y) < 28) asSeat(h0.p, () => gqRed(d.x, C.debrisDmg, 'FALLING DEBRIS', {})); }
      else if (d.state === 'fall' && t >= d.at) d.done = true;
    }
    tc.debris = tc.debris.filter(d => !d.done);
    // ---- the Queen's boulder: a portal over the hero glows 0.8 s, the stone drops 0.7 s; a blow or an arrow sends it back up (no damage, she flinches) ----
    if (!tc.boulder) { tc.boulderT -= dt; if (tc.boulderT <= 0) startBoulder(tc, tg, t, O); }
    const B = tc.boulder;
    if (B) {
      if (B.state === 'glow' && t >= B.at) { B.state = 'fall'; B.t0 = t; sfx('portalOpen'); }
      if (B.state === 'fall') {
        const k = Math.min(1, (t - B.t0) / C.boulderAir); B.y = B.py + (B.ty - B.py) * k;
        const box = { l: B.x - C.boulderR, r: B.x + C.boulderR, t: B.y - C.boulderR, b: B.y + C.boulderR };
        seats(P1 => { if (B.state !== 'fall' || P1.dead) return; if (hit(P1, box, B.key)) sendBack(B, 'blow', e, t); });
        if (B.state === 'fall') for (const pp of (typeof ctx.players === 'function' ? ctx.players() : ctx.players) || []) for (const ar of pp.rgArrows || []) { if (B.state !== 'fall' || ar.state !== 'fly' || ar.ggHit) continue; if (Math.abs(ar.x - B.x) < C.boulderR + 10 && Math.abs(ar.y - B.y) < C.boulderR + 8) { ar.ggHit = true; ar.state = 'drop'; sendBack(B, 'shot', e, t); } }
        if (B.state === 'fall' && k >= 1) { let hurtAny = false; for (const h0 of out) if (Math.abs(h0.p.x - B.x) < 14 && Math.abs(h0.p.y - B.ty) < 26) { hurtAny = true; asSeat(h0.p, () => gqRed(B.x, C.boulderDmg, 'HER BOULDER', {})); }
          ctx.burst(B.x, B.ty - 6, 14, ['#8a8a9c', '#b28cff', '#5a5a6a'], 110, 0.5); ctx.dust(B.x, B.ty, 8); sfx('thud'); if (!hurtAny) ctx.number(B.x, B.ty - 22, 'IT SHATTERS', '#c9c9d6'); tc.boulder = null; tc.boulderT = rnd(C.boulderEvery[0], C.boulderEvery[1]); }
      } else if (B.state === 'back') {
        B.y -= C.boulderHome * dt; if (B.y <= B.py) { tc.boulder = null; tc.boulderT = rnd(C.boulderEvery[0], C.boulderEvery[1]); ctx.burst(B.x, B.py, 10, ['#b28cff', '#e8dcff'], 70, 0.4); }
      }
    }
  };
  function startBoulder(tc, tg, t, O) {
    const x = Math.max(O.x0 * TS + 14, Math.min((O.x1 + 1) * TS - 14, tg.x + (Math.random() - 0.5) * 24)), ty = tg.y, py = Math.max((O.top + 1) * TS, ty - C.drop);
    tc.boulder = { x, ty, py, y: py, at: t + C.boulderGlow, state: 'glow', key: {} }; ctx.number(x, py - 14, '!', '#ffd36b'); sfx('portalOpen');
  }
  function sendBack(B, how, e, t) {
    B.state = 'back'; ctx.ring(B.x, B.y, 14, '#c8f08a', 0.25); sfx('parry'); ctx.number(B.x, B.y - 14, 'SENT BACK', '#8fd160');
    if (e) { e.flash = 0.25; ctx.number(e.x, e.y - 60, 'HER FLINCH', '#ffd36b'); }   /* she flinches: no damage - the verb rehearsed */
  }
  /* ---- HER, in view: the perches, the hop, the acts ---- */
  const perchOf = (Tw, k) => { const nS = Tw.FLOORS.length;
    if (k < nS) return { x: (Tw.SHAFT[0] + 6 + Math.floor(Math.random() * 14)) * TS + 8, y: Tw.FLOORS[k] * TS, out: false };
    const p = Tw.OUT.perches[Math.min(k - nS, Tw.OUT.perches.length - 1)]; return { x: p[0] * TS + 8, y: p[1] * TS, out: true }; };
  H.lastK = Tw => Tw.FLOORS.length + Tw.OUT.perches.length - 1;
  /* returns true when this module drove her this frame */
  H.queen = (esc, E, hs, top, t, e) => {
    const Tw = towerOf(E), tc = esc.tc; if (!Tw || !tc || !e) return false; const qq = esc.q, F = Tw.FLOORS, nS = F.length, last = H.lastK(Tw);
    qq.k = Math.min(qq.k, last); const pe = qq.k >= nS ? Tw.OUT.perches[qq.k - nS] : null;
    if (!qq.cur) qq.cur = { x: qq.x, y: pe ? pe[1] * TS : F[qq.k] * TS };
    const hop = tc.hop, face = hs.length ? (hs[0].p.x < qq.x ? -1 : 1) : -1;
    if (qq.entry && t < qq.entry.until && qq.entry.exit && !qq.entry.exit.out) {   // her entry portal, open: step in = a SHORTCUT a storey up (inside the tower only)
      const en = qq.entry, who = hs.find(h0 => h0.k >= 0 && h0.k < nS && Math.abs(h0.p.x - en.x) < 12 && Math.abs(h0.p.y - en.y) < 26);
      if (who) { const ex = en.exit; qq.entry = null; let n = 0; for (const h0 of hs) { h0.p.x = ex.x - 26 + ([0, 14, 28, 42][n++] ?? 14); h0.p.y = ex.y; h0.p.vx = 0; h0.p.vy = 0; } sfx('portalOpen'); ctx.burst(ex.x, ex.y - 12, 12, ['#b28cff', '#e8dcff'], 80, 0.5); ctx.number(ex.x, ex.y - 40, 'A SHORTCUT', '#b28cff'); }
    }
    if (qq.done) { e.hidden = true; return true; }
    const near = hs.some(h0 => Math.hypot(h0.p.x - qq.x, h0.p.y - qq.cur.y) < C.near) && qq.k <= top + 1;
    if (!hop) {   // ---- watching: acts between hops ----
      e.hidden = false; e.x = qq.x; e.y = qq.cur.y; e.face = face; e.vx = 0; e.vy = 0;
      const act = tc.act;
      if (act) {
        e.mode = act.mode;
        if (act.kind === 'brazier' && !act.done && t >= act.at) { act.done = true; const kk = Math.min(top + 1, nS - 1), f = esc.fl[kk]; if (f && !f.burning) { f.burning = true; ctx.number((Tw.SHAFT[0] + Tw.SHAFT[1]) / 2 * TS, F[kk] * TS - 30, 'SHE LIGHTS THE FLOOR', '#ff9a5c'); sfx('crack'); } }
        if (t >= act.end) tc.act = null;
      } else {
        e.mode = qq.k <= top + 1 && qq.k >= 0 ? (qq.hopAt - t < 0.7 ? 'towerCrouch' : 'towerWatch') : 'towerWatch';
        tc.actT -= 0.0166;
        if (t < qq.hopAt - 1.6 && tc.actT <= 0 && hs.length && qq.k <= top + 1) startAct(esc, tc, Tw, qq, e, top, t);
      }
      if ((t >= qq.hopAt || near) && qq.k < last && qq.k <= top + 1 && !tc.act) startHop(esc, tc, Tw, qq, e, hs, t, face);
      else if ((t >= qq.hopAt || near) && qq.k >= last && hs.some(h0 => Math.hypot(h0.p.x - qq.x, h0.p.y - qq.cur.y) < C.near * 1.6) && !tc.act) startHop(esc, tc, Tw, qq, e, hs, t, face, true);
      return true;
    }
    // ---- a hop in progress: taunt -> stride -> open -> step in -> thread -> step out -> look ----
    const ph = hop.ph, el = t - hop.t0, d = hop.dir;
    if (ph === 'taunt') { e.mode = 'towerTaunt'; e.face = face; if (el >= C.taunt) { hop.ph = 'stride'; hop.t0 = t; hop.fx = qq.x; sfx('portalOpen'); } }
    else if (ph === 'stride') { const k = Math.min(1, el / C.stride); e.mode = 'towerStride'; e.x = hop.fx + d * 26 * k; e.vx = d * 60; e.face = d; qq.x = e.x; hop.entry = { x: hop.fx + d * 30, y: qq.cur.y }; if (el >= C.stride) { hop.ph = 'open'; hop.t0 = t; e.vx = 0; } }
    else if (ph === 'open') { e.mode = 'towerOpen'; e.vx = 0; qq.entry = { x: hop.entry.x, y: hop.entry.y, until: t + 9, exit: hop.exit, open: Math.min(1, el / C.open) }; if (el >= C.open) { hop.ph = 'stepIn'; hop.t0 = t; } }
    else if (ph === 'stepIn') { e.mode = 'towerStepIn'; const k = Math.min(1, el / C.stepIn); e.x = hop.fx + d * (26 + 6 * k); if (el >= C.stepIn) { hop.ph = 'thread'; hop.t0 = t; e.hidden = true; ctx.burst(hop.entry.x, hop.entry.y - 16, 14, ['#b28cff', '#e8dcff', '#2a1a3a'], 80, 0.5); sfx('portalOpen'); } }
    else if (ph === 'thread') { e.hidden = true; if (el >= C.thread) { hop.ph = 'stepOut'; hop.t0 = t; e.hidden = false; qq.k = hop.toK; qq.x = hop.exit.x; qq.cur = { x: hop.exit.x, y: hop.exit.y }; e.x = hop.exit.x; e.y = hop.exit.y; qq.flash = { x: hop.exit.x, y: hop.exit.y, until: t + 0.6 }; ctx.burst(hop.exit.x, hop.exit.y - 16, 14, ['#b28cff', '#e8dcff', '#2a1a3a'], 80, 0.5); sfx('portalOpen'); qq.entry = null; if (hop.deck) { qq.done = true; e.hidden = true; tc.hop = null; ctx.number(hop.exit.x, hop.exit.y - 44, 'SHE WAITS ON THE ROOF', '#b28cff'); } } }
    else if (ph === 'stepOut') { e.mode = 'towerStepOut'; e.x = qq.x; e.y = qq.cur.y; e.face = -1; if (el >= C.stepOut) { hop.ph = 'look'; hop.t0 = t; } }
    else if (ph === 'look') { e.mode = 'towerLook'; e.x = qq.x; e.y = qq.cur.y; e.face = face; if (el >= C.look) { tc.hop = null; qq.entry = null; qq.hopAt = t + C.hopEvery; tc.actT = rnd(1.0, 2.0); } }
    return true;
  };
  function startHop(esc, tc, Tw, qq, e, hs, t, face, deck) {
    const nS = Tw.FLOORS.length, toK = qq.k + 1, ex = deck ? { x: qq.x + 4, y: qq.cur.y - 6 * TS, out: true } : perchOf(Tw, Math.min(toK, nS + Tw.OUT.perches.length - 1));
    const d = ex.x >= qq.x ? 1 : -1;
    tc.hop = { ph: 'taunt', t0: t, dir: d, fx: qq.x, exit: ex, toK, deck: !!deck }; ctx.number(qq.x, qq.cur.y - 44, 'HA!', '#b28cff');
  }
  function startAct(esc, tc, Tw, qq, e, top, t) {
    const nS = Tw.FLOORS.length, outside = top >= nS - 0 && qq.k >= nS; let kind;
    if (qq.k >= nS || top >= nS) kind = Math.random() < 0.7 ? 'boulder' : 'down'; else kind = Math.random() < 0.5 ? 'brazier' : 'call';
    tc.actT = rnd(C.actEvery[0], C.actEvery[1]);
    if (kind === 'brazier') { tc.act = { kind, mode: 'towerAct', at: t + C.brazierTell, end: t + C.brazierTell + 0.4, done: false }; ctx.number(qq.x, qq.cur.y - 54, '!', '#ffd36b'); }
    else if (kind === 'call') { tc.act = { kind, mode: 'towerAct', at: t, end: t + C.actLen, done: true }; ctx.number(qq.x, qq.cur.y - 54, 'UP THERE!', '#ff9a5c'); sfx('stomp');
      for (const q2 of (ctx.enemies ? ctx.enemies() : [])) if (q2.alive && !q2.boss && Math.abs(q2.y - qq.cur.y) < 14 * TS) { q2.awake = true; q2.alert = 1; } }
    else if (kind === 'boulder') { tc.act = { kind, mode: 'towerCast', at: t, end: t + C.actLen, done: true }; if (!tc.boulder) { tc.boulderT = 0.2; } ctx.number(qq.x, qq.cur.y - 54, 'LOOK OUT', '#b28cff'); }
    else { tc.act = { kind, mode: 'towerCast', at: t, end: t + C.actLen, done: true }; tc.debrisT = Math.min(tc.debrisT, 0.2); ctx.number(qq.x, qq.cur.y - 54, 'DOWN!', '#ff9a5c'); }
  }
  /* ---- the picture (greybox): hanging fire, the red ceilings, the boards, debris shadows, the boulder, her portals' thread ---- */
  H.draw = (g, cx, cy, t, esc, E) => {
    const Tw = towerOf(E), tc = esc && esc.tc; if (!Tw || !tc) return; const F = Tw.FLOORS, nS = F.length, O = Tw.OUT;
    const x0 = Math.round(Tw.SHAFT[0] * TS - cx), x1 = Math.round((Tw.SHAFT[1] + 1) * TS - cx);
    for (const k of Tw.BURN) { const top = F[k] - 11, ty = Math.round(top * TS - cy); g.globalAlpha = 0.18 + 0.08 * Math.sin(t * 3 + k); g.fillStyle = '#ff3a1c'; g.fillRect(x0, ty, x1 - x0, 5 * TS); g.globalAlpha = 1;   /* the ceiling glows red */
      for (let x = x0 + 6; x < x1; x += 22) { g.fillStyle = (x + k) & 1 ? '#ff6b2c' : '#ffd36b'; if (Math.sin(t * 7 + x * 0.3) > 0.2) g.fillRect(x, ty + 4 + ((Math.sin(t * 4 + x) * 3) | 0), 2, 2); } }
    for (const tp of Tw.TAPS || []) { const px = Math.round(tp.x * TS - cx) - 6, fy = Math.round(F[tp.k] * TS - cy), h = 5 * TS;
      g.fillStyle = '#3a2418'; g.fillRect(px, fy - h, 14, 3);                                  // the rod
      g.fillStyle = tp.flare ? '#ff6b2c' : '#7a2a1a'; g.fillRect(px + 1, fy - h + 3, 12, h - 20);   // the hanging
      if (tp.flare) { g.globalAlpha = 0.9; for (let i = 0; i < 6; i++) { const fh = 8 + 8 * (0.5 + 0.5 * Math.sin(t * 11 + i * 1.7)); g.fillStyle = i & 1 ? '#ffd36b' : '#ff9a2c'; g.fillRect(px + 1 + i * 2, fy - 18 - fh, 2, fh + 8); } g.globalAlpha = 1; }
      else if (tp.spark) { for (let i = 0; i < 4; i++) { const ph = (t * 1.6 + i * 0.27 + tp.x) % 1; g.fillStyle = '#ffd36b'; g.fillRect(px + 2 + i * 3, fy - h + 8 + Math.round(ph * (h - 28)), 2, 2); } } }
    if (Tw.OUT) {   // the hoarding's boards (charred; the creak shakes a board), debris rings, the boulder
      for (const b of tc.boards) { if (b.state === 'gone') continue; const bx = Math.round(b.x * TS - cx), by = Math.round(O.hoard.row * TS - cy) + (b.state === 'creak' ? ((Math.sin(t * 40) * 1.5) | 0) : 0);
        g.fillStyle = b.state === 'creak' ? '#8a4a2a' : '#3a2418'; g.fillRect(bx, by, 32, 4); g.fillStyle = '#1a100a'; g.fillRect(bx + 15, by, 1, 4); if (b.state === 'creak') { g.fillStyle = '#ff9a5c'; g.fillRect(bx + 6, by - 1, 2, 1); g.fillRect(bx + 22, by - 1, 2, 1); } }
      for (const d of tc.debris) { const dx = Math.round(d.x - cx), dy = Math.round(d.y - cy);
        if (d.state === 'tell') { const k = 0.5 + 0.5 * Math.sin(t * 22); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.fillRect(dx - 12, dy - 2, 24, 2); g.globalAlpha = 0.2; g.fillRect(dx - 12, dy - 70, 24, 68); g.globalAlpha = 1; }
        else { const k = Math.max(0, (d.at - t) / 0.3); g.fillStyle = '#5a3a1a'; g.fillRect(dx - 5, dy - Math.round(140 * k) - 8, 10, 30); g.fillStyle = '#ff9a5c'; g.fillRect(dx - 5, dy - Math.round(140 * k) - 8, 10, 4); } }
      const B = tc.boulder; if (B) { const bx = Math.round(B.x - cx), py = Math.round(B.py - cy), ty = Math.round(B.ty - cy);
        if (B.state === 'glow') { const k = Math.min(1, 1 - (B.at - t) / C.boulderGlow); portalDraw(g, bx, py, t, 0.4 + 0.6 * k, k > 0.7 ? '#fff6c8' : '#b28cff'); g.globalAlpha = 0.3 + 0.5 * k; g.fillStyle = '#ff6b4a'; g.fillRect(bx - 12 + Math.round(k * 4), ty - 2, 24 - Math.round(k * 8), 2); g.globalAlpha = 1; }
        else { const by = Math.round(B.y - cy); g.fillStyle = B.state === 'back' ? '#fff6c8' : '#8a8a9c'; g.fillRect(bx - 8, by - 8, 16, 16); g.fillStyle = B.state === 'back' ? '#ffd36b' : '#5a5a6a'; g.fillRect(bx - 5, by - 5, 6, 6); g.fillStyle = '#b28cff'; g.fillRect(bx + 1, by + 1, 3, 3); if (B.state === 'fall') { g.globalAlpha = 0.5; g.fillStyle = '#ff6b4a'; g.fillRect(bx - 12, ty - 2, 24, 2); g.globalAlpha = 1; } } } }
    const hop = tc.hop, qq = esc.q;
    if (hop && hop.entry && hop.ph !== 'taunt' && hop.ph !== 'stride') portalDraw(g, hop.entry.x - cx, hop.entry.y - 14 - cy, t, hop.ph === 'open' ? Math.min(1, (t - hop.t0) / C.open) : 0.9, '#b28cff');
    if (hop && (hop.ph === 'thread' || hop.ph === 'stepOut')) { const a = hop.entry, b = hop.exit; if (a && b) { const k = hop.ph === 'thread' ? Math.min(1, (t - hop.t0) / C.thread) : 1;
      for (let i = 0; i < 18; i++) { const u = i / 17 * k; g.globalAlpha = 0.9 * (1 - Math.abs(0.5 - u) * 0.6); g.fillStyle = i & 1 ? '#e8dcff' : '#b28cff'; g.fillRect(Math.round(a.x + (b.x - a.x) * u - cx + Math.sin(i * 1.9 + t * 12) * 3), Math.round(a.y - 14 + (b.y - a.y - 6) * u - cy), 2, 2); } g.globalAlpha = 1; }
      portalDraw(g, hop.exit.x - cx, hop.exit.y - 14 - cy, t, hop.ph === 'thread' ? 0.4 + 0.6 * Math.min(1, (t - hop.t0) / C.thread) : 0.8, '#fff6c8'); }
    if (tc.act && tc.act.kind === 'brazier' && !tc.act.done) { const k = 0.5 + 0.5 * Math.sin(t * 24); g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#ffd36b'; g.fillRect(Math.round(qq.x - cx) - 1, Math.round(qq.cur.y - 62 - cy), 3, 3); g.globalAlpha = 1; }
  };
  H.test = { tc: esc => esc && esc.tc };
  return H;
}
