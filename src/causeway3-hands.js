// src/causeway3-hands.js - THE DROWNED CAUSEWAY 2 IN THE GAME (claude/causeway3w, the greybox, 2026-11-07). src/causeway3.js is the level (data); this binds it to the
// world. THE WATER KIT (src/tide-kit.js + src/pull-field.js) is stepped ONCE, by the generic wiring (src/pirate-fleet-hands.js, L.tides / L.pulls; claude/lw3b folded this level's
// own copy into it): this file hands it H.water (the level's words, sounds, verbs, foam and gauge art) and reads the kit through ctx.pfh.kit().
// ONLY a level with L.cw3: everything here is inert anywhere else (on() is false), so the flag-off game is unchanged.
//   THE TIDES     three acts, one base cycle at three rates (30 / 22 / 15 s); the stones' channel; the undercroft's chamber. Tolls, the foam line, the A3 gauge.
//   THE VERBS     a blow on a BELL calls its tide in (three strokes, then it comes), on a SLUICE WHEEL holds it out (then winds back), on the FLOODGATE LEVER fills or
//                 drains the undercroft (a mark: it stays through a death).
//   THE BOATS     kit floats: beached at low water, afloat at high (main.js carries riders on m.dy).
//   THE CURRENTS  the channels' rips carry a swimmer back to the near bank; the sea arch runs with the flood and against the ebb (hold UP at a ring to anchor).
//   THE LAMPS     master's storm lantern (strike it twice); the gate lamp lifts THE PILGRIMS' GATE (a mark).
//   THE ARMS      KRAKEN FORESHADOW: a told strike on the road (shadow + bulge 1.1 s, then the slam) - a hazard; the smash arm opens THE COLLAPSE.
//   THE COLLAPSE  the chase: the road falls into the sea behind you a column at a time (told: it cracks CW3.chase.crack s first); the sea takes whoever falls in.
//   THE STORM     the lighthouse on the horizon from the first screen (nearer each act), the act cards, the gulls/cottages/smoke (GREYBOX).
// main.js calls: on, clear, update(dt), mover(m, dt), drawSky, drawBack, drawMover, drawOver, read, and ctx.hooks() -> H.water (a blow, the tide events and the pulls arrive through it).
import { gauge, floatY, kOf, lineY } from './tide-kit.js';
import { CW3 } from './causeway3.js';
import * as ART from './redraw/causeway3_art.js'; import * as BACK from './redraw/causeway3_back.js';   /* (claude/cw3art) the art pass: the pieces and the sky / lighthouse */
const R = Math.round, TS = 16;
export const CW3_HANDS = { wheelCool: 10, gateKey: col => 'cw3:gate:' + col };
export const CW3_SAY = { bell: 'THE BELL: THE TIDE COMES IN', sluice: 'THE SLUICE WHEEL HOLDS THE SEA OUT', wound: 'THE WHEEL IS STILL WINDING BACK',
  floodOn: 'THE FLOODGATE OPENS: THE UNDERCROFT FILLS', floodOff: 'THE FLOODGATE SHUTS: THE UNDERCROFT DRAINS', rip: 'THE CHANNEL RUNS OUT: IT CARRIES YOU BACK',
  ebb: 'THE EBB RUNS AGAINST YOU: HOLD THE RING (UP)', grab: 'HOLD ON', gate: 'THE PILGRIMS\' GATE LIFTS', arm: 'AN ARM!', smash: 'THE ROAD GOES', run: 'RUN',
  taken: 'THE SEA TAKES THE ROAD', safe: 'THE LIGHT\'S STEPS HOLD' };

export function makeCauseway3Hands(ctx) {
  const H = {}; let S = null;
  const lv = () => ctx.L, TK = () => (ctx.pfh && ctx.pfh.kit()) || null;   /* the kit is the generic wiring's (stepped once, there) */
  const on = () => !!(lv() && lv().cw3);
  H.on = on;
  const actAt = x => CW3.acts.find(a => x >= a.x0 * TS && x <= (a.x1 + 1) * TS) || CW3.acts[CW3.acts.length - 1];
  H.clear = () => {
    S = null; if (!on()) return;
    const L = lv(), marks = ctx.marks();
    S = { told: {}, act: null, arms: L.cw3Arms.map(a => ({ ...a, st: 'wait', t: 0 })), chase: { st: 'wait', front: 0, t: 0, cracks: new Map(), fallen: new Set() },
      lamps: L.cw3Lamps.map(l => ({ ...l, open: !!(l.gate !== undefined && marks.has(CW3_HANDS.gateKey(l.gate))) })), gulls: (L.cw3Props || []).filter(p => p.kind === 'gulls').map(p => ({ ...p, up: 0, t: Math.random() * 4 })) };
    for (const l of S.lamps) if (l.open) ctx.openGateCol(l.gate);   /* (its lamp is relit in update: the props are laid after this call) */
  };
  const tideS = id => TK() && TK().tides.find(s => s.id === id);
  const near = (x, r) => { const P = ctx.hero(); return !!(P && Math.abs(P.x - x) < r); };
  const say = (x, y, w, col) => ctx.number(x, y, w, col || '#bfe6f5');
  const lampProp = l => ctx.props().find(pr => pr.t === 'lantern' && Math.abs(pr.x - (l.x * TS + 8)) < 9 && Math.abs(pr.y - (l.y + 1) * TS) < 9);
  const tideNear = id => { const P = ctx.hero(); if (!P) return false; const T = lv().tides.find(t => t.id === id); if (!T) return false;
    return lv().pools.filter(p => (T.pools || []).includes(p.id)).some(p => P.x > p.x0 - 300 && P.x < p.x1 + 300); };
  const wetFoe = e => { for (const p of lv().pools || []) if (e.x >= p.x0 && e.x <= p.x1 && e.y - 4 > p.y) return true; return false; };

  /* ---------- ONE FRAME OF THE LEVEL ---------- */
  H.update = dt => {
    if (!TK() || !S) return; const L = lv(), P = ctx.hero();
    /* THE ACT CARD: the storm builds - said once as you cross into each act */
    if (P && !P.dead) { const a = actAt(P.x); if (S.act !== a.id) { if (S.act !== null || a.id !== 'act1') { say(P.x, P.y - 50, a.name, '#e8eef2'); say(P.x, P.y - 40, 'THE TIDE TURNS EVERY ' + a.every + ' SECONDS', '#ffd36b'); ctx.sound(a.id === 'act3' ? 'thunder' : 'wave'); } S.act = a.id; } }
    /* (the tides, the currents and the flow specks are stepped by the generic wiring, which calls H.water) */
    /* THE LAMPS: master's storm lantern lights on two blows; the gate lamp lifts the gate */
    for (const l of S.lamps) { if (l.gate === undefined) continue; if (l.open) { const pr = lampProp(l); if (pr && !pr.lit) pr.lit = true; continue; } const pr = lampProp(l); if (!pr || !pr.lit) continue;
      l.open = true; ctx.marks().add(CW3_HANDS.gateKey(l.gate)); ctx.openGateCol(l.gate); ctx.sound('gate'); ctx.shake(4); say(l.gate * TS + 8, (l.y - 4) * TS, CW3_SAY.gate, '#8fd160'); }
    for (const T0 of TK().tides) if (T0.T.mode !== 'manual') { const k = kOf(TK(), T0.id) || 0; S.wet = S.wet || {}; S.wet[T0.id] = Math.max(k, (S.wet[T0.id] || 0) - dt / 7); }   /* (claude/cw3art) the road's wetness: the tide's level, drying off over ~7 s */
    updateArms(dt); updateChase(dt);
    for (const gl of S.gulls) { gl.t += dt; gl.up = Math.max(0, Math.min(1, gl.up + (near(gl.x * TS, 60) ? 3 : -0.6) * dt)); }
  };

  /* ---------- THE ARMS (KRAKEN FORESHADOW): wait -> tell (a shadow on the road, the water bulging) -> slam -> gone. Once an attempt each. ---------- */
  function updateArms(dt) {
    const A = CW3.arms;
    for (const a of S.arms) {
      if (a.st === 'gone') continue;
      const x = a.x * TS + 8;
      if (a.st === 'wait') { const lead = a.smash ? ctx.players.some(pp => !pp.dead && pp.x > CW3.chase.trigger * TS) : ctx.players.some(pp => !pp.dead && pp.x > x - 7 * TS && pp.x < x + TS);
        if (lead) { a.st = 'tell'; a.t = A.tell; ctx.sound('tell'); ctx.sound('bulge'); } continue; }
      a.t -= dt;
      if (a.st === 'tell' && Math.random() < dt * 30) ctx.parts().push({ x: x + (Math.random() - 0.5) * 30, y: CW3.R * TS + 6 + Math.random() * 8, vx: (Math.random() - 0.5) * 20, vy: -60 - Math.random() * 60, life: 0.4, max: 0.4, col: '#dff2f8', size: 2, grav: 240 });
      if (a.st === 'tell' && a.t <= 0) { a.st = 'slam'; a.t = A.slam; ctx.sound('slam'); ctx.shake(a.smash ? 8 : 5);
        ctx.burst(x, CW3.R * TS, 18, ['#2a3a3a', '#4a6a64', '#dff2f8'], 120, 0.6, -80);
        for (const pp of ctx.players) ctx.asPlayer(pp, () => { const P = ctx.hero(); if (!ctx.upright(pp) || P.dead) return; if (Math.abs(P.x - x) < 26 && P.y > (CW3.R - 4) * TS && P.y <= (CW3.R + 1) * TS) {
          ctx.damagePlayer(x, A.dmg, { name: 'AN ARM', blow: 'krakenArm', unblockable: false }); P.vx = (P.x < x ? -1 : 1) * A.knock; P.vy = -140; P.ground = false; } });
        if (a.smash) { for (let c = CW3.chase.smash[0]; c <= CW3.chase.smash[1]; c++) breakCol(c); say(x, (CW3.R - 3) * TS, CW3_SAY.smash, '#ff6b6b'); startChase(); } }
      else if (a.st === 'slam' && a.t <= 0) a.st = 'gone';
    }
  }

  /* ---------- THE COLLAPSE: the front walks east at CW3.chase.speed; each road column it reaches cracks first (told), then falls ---------- */
  function startChase() { const C = S.chase; if (C.st !== 'wait') return; C.st = 'run'; C.front = (CW3.chase.smash[1] + 1) * TS; C.t = 0; ctx.sound('crumble');
    const P = ctx.hero(); if (P) say(P.x, P.y - 44, CW3_SAY.run, '#ff6b6b'); }
  function breakCol(c) { if (S.chase.fallen.has(c)) return; S.chase.fallen.add(c);
    for (let y = CW3.R; y < 40; y++) ctx.breakTile(c, y);   /* (main.js: AIR, a destroyed tile mendAll lays again on a respawn) */
    ctx.burst(c * TS + 8, CW3.R * TS + 4, 6, ['#5a6460', '#8a948e', '#dff2f8'], 70, 0.6, -40); }
  function updateChase(dt) {
    const C = S.chase, CH = CW3.chase;
    if (C.st === 'run') {
      C.t += dt; C.front += CH.speed * dt;
      const ahead = C.front + CH.speed * CH.crack;   /* the crack runs this far ahead of the fall: told CW3.chase.crack s first */
      for (let c = Math.floor(C.front / TS); c <= Math.min(CH.x1, Math.floor(ahead / TS)); c++) if (!C.cracks.has(c) && !C.fallen.has(c)) { C.cracks.set(c, CH.crack); if (c % 3 === 0) ctx.sound('crack'); }
      for (const [c, t] of C.cracks) { const nt = t - dt; if (nt <= 0) { C.cracks.delete(c); breakCol(c); } else C.cracks.set(c, nt); }
      if (C.front > (CH.x1 + 1) * TS && !C.cracks.size) { C.st = 'done'; const P = ctx.hero(); if (P && !P.dead) say(P.x, P.y - 40, CW3_SAY.safe, '#8fd160'); }
    }
    /* THE SEA TAKES WHOEVER FALLS IN: a swimmer in the collapse's water while it runs (the breaks are a fall, the fallen road is a fall) */
    if (C.st === 'run') for (const pp of ctx.players) { if (pp.dead || pp.down > 0) continue; const tx = pp.x / TS;
      if (tx >= CH.x0 - 1 && tx <= CH.x1 + 1 && (pp.swim || pp.y > (CW3.LO + 2) * TS)) ctx.fallOut(pp, CW3_SAY.taken); }
  }

  /* ---------- THE WATER HOOKS (the generic wiring's ctx.hooks(): this level's words, sounds, verbs, foam and gauge on the one kit) ---------- */
  const nearGauge = (L, P) => TK().tides.find(q => q.T.mode !== 'manual' && (q.T.pools || []).some(id => { const p = L.pools.find(pp => pp.id === id); return p && P.x >= p.x0 - 120 && P.x <= p.x1 + 40; }));
  H.water = {
    signal: 'act2', quiet: true, flow: true, noStreaks: true, noPosts: true,   /* the arch is signed by act II's tide; the rips run as flow specks; the rings are this level's art (drawBack) */
    tide(ev) { if (!S) return false; const P = ctx.hero();
      if (ev.t === 'toll' && tideNear(ev.id)) ctx.sound(ev.turn ? 'tollTurn' : 'toll');
      if (ev.t === 'released' && tideNear(ev.id) && P) say(P.x, P.y - 34, 'THE WHEEL LETS GO', '#9ab0c0');
      if (ev.t === 'phase' && ev.id === 'crypt' && P && near((CW3.crypt.x0 + 10) * TS, 400)) say(P.x, P.y - 34, ev.ph === 'high' ? 'THE UNDERCROFT IS FULL' : 'THE UNDERCROFT IS DRY', '#bfe6f5');
      return true; },
    pull(e, g2) { if (!S) return false;
      if (e.t === 'enter' && !S.told['in' + e.id]) { S.told['in' + e.id] = 1; const ebb = e.id === 'arch' && g2 && (g2.ph === 'low' || g2.ph === 'fall'); say(e.b.x, e.b.y - 34, e.id === 'arch' ? (ebb ? CW3_SAY.ebb : 'THE FLOOD CARRIES YOU THROUGH') : CW3_SAY.rip); }
      if (e.t === 'grab') { ctx.sound('clank'); if (!S.told.grab) { S.told.grab = 1; say(e.b.x, e.b.y - 30, CW3_SAY.grab, '#ffd36b'); } }
      return true; },
    /* A BLOW: a bell, a wheel, the floodgate lever */
    verb(v) { if (!S) return false;
      const vv = tideS(v.tide).verbs.find(q => q.x === v.x && q.y === v.y);
      if (v.t === 'sluice' && vv) vv.cool = CW3_HANDS.wheelCool;
      if (v.t === 'lever') ctx.marks().add(v.key);
      ctx.sound(v.t === 'bell' ? 'bell' : v.t === 'lever' ? 'lever' : 'wheel');
      const x = v.x * TS + 8, y = v.y * TS - 20;
      if (v.t === 'bell' && !S.told['bell' + v.tide]) { S.told['bell' + v.tide] = 1; say(x, y, CW3_SAY.bell); }
      if (v.t === 'sluice' && !S.told['sl' + v.tide]) { S.told['sl' + v.tide] = 1; say(x, y, CW3_SAY.sluice); }
      if (v.t === 'lever') say(x, y, tideS('crypt').ph === 'high' ? CW3_SAY.floodOn : CW3_SAY.floodOff);
      return true; },
    miss(hb) { if (!S) return;
      for (const T0 of TK().tides) for (const q of T0.verbs) if (q.t === 'sluice' && q.cool > 1.3) { const x = q.x * TS + 8, y = (q.y + 1) * TS;
        if (hb.l < x + 11 && hb.r > x - 11 && hb.t < y - 4 && hb.b > y - 30 && !S.told.wound) { S.told.wound = 1; say(x, y - 34, CW3_SAY.wound, '#9ab0c0'); } } },
    /* THE FOAM on a turning tide's pools (art: a spray fleck on the warn) and THE A3 GAUGE (the tide you are by) */
    foam(g, x0, x1, y, t, ph) { if (!S || x1 <= x0) return; const art = !!lv().cw3Kit; y -= 1;
      g.fillStyle = ph === 'warn' ? 'rgba(255,255,255,0.85)' : 'rgba(223,242,248,0.6)';
      for (let x = x0 - (x0 % 6) + R(t * 20) % 6; x < x1; x += 6) { g.fillRect(x, y, 3, 1); if (art && ph === 'warn' && (x + R(t * 9)) % 18 === 0) g.fillRect(x + 1, y - 2, 1, 2); } },
    gauge(g, t, P) { if (!S) return; const T0 = nearGauge(lv(), P); if (!T0) return; const gg = gauge(TK(), T0.id);
      if (lv().cw3Kit) { ART.drawTideGauge(g, 6, 30, gg, t); return; }
      const x = 6, y = 30, h = 24; g.fillStyle = 'rgba(10,14,22,0.7)'; g.fillRect(x, y, 10, h + 4);
      g.fillStyle = gg.tell && Math.sin(t * 16) > 0 ? '#ffffff' : '#7cc8e8'; const fh = R(h * gg.k); g.fillRect(x + 2, y + 2 + h - fh, 6, Math.max(1, fh));
      if (gg.coming === 'in') { g.fillStyle = '#ffd36b'; g.fillRect(x + 11, y + 2, 3, 3); } if (gg.coming === 'out') { g.fillStyle = '#9ab0c0'; g.fillRect(x + 11, y + h - 2, 3, 3); }
      if (gg.held) { g.fillStyle = '#ffd36b'; g.fillRect(x, y + h + 6, R(10 * Math.min(1, gg.holdLeft / 10)), 2); } },
  };

  /* ---------- A MOVER OF OURS: a boat where her tide puts her ---------- */
  H.mover = (m, dt) => {
    if (m.cw3 !== 'float' || !TK()) return false;
    const oy = m.y, y = floatY(TK(), m.fid); if (y != null) m.y = y; m.x = m.x0; m.dx = 0; m.dy = m.y - oy; void dt;
    return true;
  };

  /* ---------- THE ART PASS (claude/cw3art): src/redraw/causeway3_art.js / causeway3_back.js, called when L.cw3Kit ---------- */
  function artBack(g, cx, cy, t, VW, L) {
    const dusk = S.act === 'act1' ? 0 : 1;
    for (const p of L.cw3Props || []) { const x = R(p.x * TS + 8 - cx), y = R((p.y + 1) * TS - cy); if (x < -60 || x > VW + 60) continue;
      if (p.kind === 'cottage') ART.drawCottage(g, x, y, true, t, p.x);
      if (p.kind === 'smoke' && Math.random() < 0.12) ctx.parts().push({ x: p.x * TS + 8 + (Math.random() - 0.5) * 6, y: (p.y + 1) * TS - 40, vx: -14 - Math.random() * 10, vy: -12 - Math.random() * 8, life: 1.4, max: 1.4, col: 'rgba(200,206,212,0.5)', size: 2, grav: -6 });
      if (p.kind === 'pilgrimStone') ART.drawWaymark(g, x, y, p.x); }
    void dusk;
    S.gulls.forEach((gl, i) => { const x = R(gl.x * TS + 8 - cx), y = R((gl.y + 1) * TS - cy); if (x < -30 || x > VW + 30) return; for (let q = 0; q < 3; q++) ART.drawGull(g, x - 8 + q * 8, y - 4 - R(gl.up * (10 + q * 6)), gl.t, gl.up, i + q); });
    for (const r of L.airRooms || []) { const x0 = r[0] * TS - cx, x1 = (r[1] + 1) * TS - cx; if (x1 < -10 || x0 > VW + 10) continue; ART.drawAir(g, x0, x1, r[2] * TS - cy, r[3] * TS - cy, t); }
    for (const T0 of TK().tides) for (const v of T0.verbs) { const x = R(v.x * TS + 8 - cx), y = R((v.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      if (v.t === 'bell') ART.drawBell(g, x, y, Math.sin(t * 18) * (v.swing || 0), v.swing || 0, t);
      if (v.t === 'sluice') ART.drawWheel(g, x, y, T0.hold > 0 ? t * 4 : 0, T0.hold > 0, T0.hold / (v.hold || 6), (v.cool || 0) / CW3_HANDS.wheelCool);
      if (v.t === 'lever') ART.drawLever(g, x, y, T0.ph === 'high'); }
    for (const f of L.pulls || []) for (const [px0, py0] of f.posts || []) { const x = R(px0 * TS + 8 - cx), y = R(py0 * TS + 2 - cy); if (x < -20 || x > VW + 20) continue; ART.drawRing(g, x, y); }
  }
  function artOver(g, cx, cy, t, VW, L) {
    const roadY = CW3.R * TS - cy;
    /* THE WET ROAD: where a tide stands on it the flags darken and glint, and dry off after; only over road that is there (not the cuts) */
    const night = S.act === 'act3';
    for (const T0 of TK().tides) { const w = S.wet && S.wet[T0.id]; if (!w || T0.T.mode === 'manual') continue;
      for (const p of L.pools) { if (!(T0.T.pools || []).includes(p.id)) continue; const a = Math.max(Math.floor(p.x0 / TS), Math.floor(cx / TS) - 1), b = Math.min(Math.floor(p.x1 / TS), Math.floor((cx + VW) / TS) + 1);
        let run = -1; for (let c = a; c <= b + 1; c++) { const solid = c <= b && L.grid[CW3.R * L.W + c] === 1 && L.grid[(CW3.R - 1) * L.W + c] === 0; if (solid && run < 0) run = c; if (!solid && run >= 0) { ART.drawWet(g, run * TS - cx, c * TS - cx, roadY, w, t, night); run = -1; } } } }
    /* THE ARMS */
    for (const a of S.arms) { if (a.st !== 'tell' && a.st !== 'slam') continue; const x = R(a.x * TS + 8 - cx); if (x < -40 || x > VW + 40) continue;
      if (a.st === 'tell') ART.drawArmTell(g, x, roadY, 1 - a.t / CW3.arms.tell, t); else ART.drawArm(g, x, roadY, a.t / CW3.arms.slam, t, !!a.smash); }
    /* THE COLLAPSE */
    const C = S.chase;
    for (const [c, tl] of C.cracks) { const x = R(c * TS - cx); if (x < -20 || x > VW + 20) continue; ART.drawCrack(g, x, roadY, tl, t, CW3.chase.crack); }
    if (C.st === 'run') { const fx = R(C.front - cx); if (fx > -30 && fx < VW + 30) ART.drawFront(g, fx, roadY, t);
      if (Math.random() < 0.5) ctx.parts().push({ x: C.front + Math.random() * 16, y: CW3.R * TS + 4, vx: (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 50, life: 0.6, max: 0.6, col: '#8a948e', size: 2, grav: 200 }); }
  }

  /* ---------- DRAWING (GREYBOX: the art pass owes all of it) ---------- */
  /* THE LIGHT ON THE HORIZON: from the first screen, nearer (bigger, higher, brighter) the further you come; its beam turns through the storm */
  H.drawSky = (g, cx, cy, t) => {
    if (!S) return;
    if (lv().cw3Kit) { BACK.drawLighthouse(g, cx, cy, ctx.VW(), ctx.VH(), t, 0); return; }   /* (claude/cw3art) the lighthouse, baked at three sizes, its beam and its glimmer */ const VW = ctx.VW(), L = lv(), END = (CW3.END - 10) * TS;
    const k = Math.max(0, Math.min(1, (cx + VW / 2) / END)), step = k < 0.33 ? 0 : k < 0.66 ? 1 : 2;   /* the parallax scale steps per act (brief 4) */
    const sc = [0.45, 0.7, 1.0][step] + k * 0.15, px = R(VW * 0.82 - k * VW * 0.3 - (cx % 400) * 0.01), base = R(ctx.VH() * 0.62 - k * 12);
    if (cx > (CW3.END - 30) * TS) return;   /* past here the real one stands on the holm (drawn by the tiles + main.js's lamp) */
    const h = R(90 * sc), w = R(10 * sc);
    g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#7a8890'; g.fillRect(px - w, base - h, w * 2, h); g.fillStyle = '#5a666e'; g.fillRect(px - w - 2, base - h - 4, w * 2 + 4, 4);
    g.fillStyle = '#ffe8a0'; g.fillRect(px - R(w * 0.6), base - h - R(10 * sc), R(w * 1.2), R(8 * sc));
    /* the beam */
    const ang = Math.sin(t * 0.7) * 1.1 + Math.PI, len = 260 * sc; g.globalAlpha = 0.08 + 0.1 * k; g.fillStyle = '#fff2c0';
    g.beginPath(); g.moveTo(px, base - h - 6); g.lineTo(px + Math.cos(ang - 0.06) * len, base - h - 6 + Math.sin(ang - 0.06) * len * 0.25); g.lineTo(px + Math.cos(ang + 0.06) * len, base - h - 6 + Math.sin(ang + 0.06) * len * 0.25); g.closePath(); g.fill();
    g.globalAlpha = 1; void L;
  };
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const VW = ctx.VW(), L = lv();
    if (L.cw3Kit) { artBack(g, cx, cy, t, VW, L); return; }
    for (const p of L.cw3Props || []) { const x = R(p.x * TS + 8 - cx), y = R((p.y + 1) * TS - cy); if (x < -60 || x > VW + 60) continue;
      if (p.kind === 'cottage') { g.fillStyle = '#4a4844'; g.fillRect(x - 12, y - 22, 24, 22); g.fillStyle = '#6a625a'; g.fillRect(x - 14, y - 26, 28, 5); g.fillStyle = '#e8c070'; g.fillRect(x - 3, y - 12, 6, 6); }
      if (p.kind === 'smoke' && Math.random() < 0.12) ctx.parts().push({ x: p.x * TS + 8 + (Math.random() - 0.5) * 6, y: (p.y + 1) * TS - 30, vx: -14 - Math.random() * 10, vy: -12 - Math.random() * 8, life: 1.4, max: 1.4, col: 'rgba(200,206,210,0.5)', size: 2, grav: -2 });
      if (p.kind === 'pilgrimStone') { g.fillStyle = '#8a8a80'; g.fillRect(x - 5, y - 22, 10, 22); g.fillStyle = '#a8a89c'; g.fillRect(x - 5, y - 22, 10, 2); g.fillStyle = '#5a5a52'; g.fillRect(x - 1, y - 18, 2, 8); g.fillRect(x - 3, y - 16, 6, 2); } }
    for (const gl of S.gulls) { const x = R(gl.x * TS + 8 - cx), y = R((gl.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      for (let i = 0; i < 3; i++) { const hx = x - 8 + i * 8 + R(Math.sin(gl.t * 3 + i) * 2), hy = y - 4 - R(gl.up * (10 + i * 6)); g.fillStyle = '#eef0f0'; g.fillRect(hx - 2, hy - 2, 4, 3); } }
    /* the bells, the wheels, the lever */
    for (const T0 of TK().tides) for (const v of T0.verbs) { const x = R(v.x * TS + 8 - cx), y = R((v.y + 1) * TS - cy); if (x < -30 || x > VW + 30) continue;
      if (v.t === 'bell') { g.fillStyle = '#3a3a44'; g.fillRect(x - 1, y - 24, 2, 24); g.fillRect(x - 7, y - 24, 14, 2); const sw = R(Math.sin(t * 18) * 3 * v.swing);
        g.fillStyle = '#b08a3a'; g.fillRect(x - 5 + sw, y - 22, 10, 9); g.fillStyle = '#e0c070'; g.fillRect(x - 4 + sw, y - 21, 2, 7); }
      if (v.t === 'sluice') { const held = T0.hold > 0, a = held ? t * 4 : 0; g.strokeStyle = '#6a6e74'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 14, 9, 0, Math.PI * 2); g.stroke();
        for (let i = 0; i < 4; i++) { const b = a + i * Math.PI / 2; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + Math.cos(b) * 9, y - 14 + Math.sin(b) * 9); g.stroke(); } g.lineWidth = 1;
        g.fillStyle = '#4a4e54'; g.fillRect(x - 2, y - 6, 4, 6);
        if (held) { g.fillStyle = '#ffd36b'; g.fillRect(x - 10, y - 28, R(20 * T0.hold / (v.hold || 6)), 2); }
        else if (v.cool > 0) { g.fillStyle = '#9ab0c0'; g.fillRect(x - 10, y - 28, R(20 * Math.min(1, v.cool / CW3_HANDS.wheelCool)), 1); } }
      if (v.t === 'lever') { const up = T0.ph === 'high'; g.fillStyle = '#4a6a5a'; g.fillRect(x - 5, y - 6, 10, 6); g.strokeStyle = up ? '#8fd160' : '#c8d0c8'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + (up ? 7 : -7), y - 16); g.stroke(); g.lineWidth = 1; } }
    /* the arch's iron rings (the posts) */
    for (const f of L.pulls || []) for (const [px0, py0] of f.posts || []) { const x = R(px0 * TS + 8 - cx), y = R(py0 * TS + 2 - cy); if (x < -20 || x > VW + 20) continue;
      g.strokeStyle = '#b8b0a0'; g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.stroke(); }
  };
  H.drawMover = (g, m, cx, cy, t) => {
    if (m.cw3 !== 'float') return false; const x = R(m.x - cx), y = R(m.y - cy), w = R(m.w);
    if (lv().cw3Kit) { ART.drawBoat(g, x, y, w, t || 0, m.y < m.rest - 4); return true; }   /* (claude/cw3art) the ferry: clinker hull, red-lead wale, mast stump, stern lantern */
    /* a tarred, barnacled boat: her deck the platform (timber is right here: she IS a boat) */
    g.fillStyle = '#2a2622'; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x + w + 2, y); g.lineTo(x + w - 4, y + 10); g.lineTo(x + 4, y + 10); g.closePath(); g.fill();
    g.fillStyle = '#4a3e34'; g.fillRect(x, y, w, 2); g.fillStyle = '#c8c0b0'; for (let i = 4; i < w - 2; i += 7) g.fillRect(x + i, y + 6, 2, 1);
    return true;
  };
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv(), VW = ctx.VW();
    if (L.cw3Kit) { artOver(g, cx, cy, t, VW, L); return; }
    /* THE ARMS: a shadow and a bulge while told (red), the arm itself while it slams */
    for (const a of S.arms) { if (a.st !== 'tell' && a.st !== 'slam') continue; const x = R(a.x * TS + 8 - cx), y = R(CW3.R * TS - cy); if (x < -40 || x > VW + 40) continue;
      if (a.st === 'tell') { const k = 1 - a.t / CW3.arms.tell; g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = '#0a0a10'; g.fillRect(x - 24, y - 2, 48, 3); g.globalAlpha = 1;
        g.fillStyle = Math.sin(t * 20) > 0 ? '#ff6b6b' : '#ffd36b'; g.fillRect(x - 1, y - 40, 2, 8); g.fillRect(x - 1, y - 30, 2, 2);
        g.fillStyle = '#4a6a64'; g.fillRect(x - 10, y - R(6 * k), 20, R(6 * k)); }
      else { const k = a.t / CW3.arms.slam; g.fillStyle = '#3a2a36'; g.fillRect(x - 9, y - R(120 * k + 10), 18, R(120 * k + 10)); g.fillStyle = '#6a4a5a'; for (let i = 0; i < 6; i++) g.fillRect(x - 6, y - 10 - i * 18 * k, 4, 4); } }
    /* THE COLLAPSE: cracked columns flash; the front's dust */
    const C = S.chase;
    for (const [c, tl] of C.cracks) { const x = R(c * TS - cx), y = R(CW3.R * TS - cy); if (x < -20 || x > VW + 20) continue; g.fillStyle = (tl < 0.5 && Math.sin(t * 30) > 0) ? '#ff6b6b' : '#e8dcc0';
      g.fillRect(x + 3, y, 1, 6); g.fillRect(x + 4, y + 5, 3, 1); g.fillRect(x + 9, y + 1, 1, 7); g.fillRect(x + 10, y + 3, 4, 1); }
    if (C.st === 'run' && Math.random() < 0.5) { ctx.parts().push({ x: C.front + Math.random() * 16, y: CW3.R * TS + 4, vx: (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 50, life: 0.6, max: 0.6, col: '#8a948e', size: 2, grav: 200 }); }
  };
  H.read = () => S && TK() && { act: S.act, tides: TK().tides.map(s => ({ id: s.id, ...gauge(TK(), s.id), line: lineY(TK(), s.id), k: kOf(TK(), s.id) })), arms: S.arms.map(a => ({ x: a.x, st: a.st })),
    chase: { st: S.chase.st, front: S.chase.front / TS, fallen: S.chase.fallen.size }, lamps: S.lamps.map(l => ({ x: l.x, open: l.open })) };
  H.kit = () => TK(); H.pulls = () => (ctx.pfh && ctx.pfh.pulls()) || null; H.state = () => S;
  return H;
}
