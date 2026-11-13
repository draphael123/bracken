// src/pirate-fleet-hands.js - THE WATER KIT IN THE GAME + THE PIRATE FLEET's own pieces (claude/water1, 2026-11-05). The first level wiring of src/tide-kit.js and
// src/pull-field.js (docs/waterkit.md "Wiring"): ANY level that declares L.tides / L.pulls gets them run here - the kit's cycle stepped and written into the level's pools
// (poolLevel), its floats moved, its verbs struck, every seat and every foe pushed by the pull fields, the flow streaks, the foam line and the A3 gauge (drawn by src/redraw/pirate_fleet_art.js, claude/pfart).
// On top, THE PIRATE FLEET's (L.pirateFleet, src/pirate-fleet.js):
//   SWELL BOATS (movers pf 'float')  a tide-kit float as a moving deck: main.js's mover code carries whoever stands on it (m.dy).
//   PRIZES (movers pf 'prize')       a float that rides OUT AT SEA (drawn small in the background, m.broken = not footing) until a GRAPPLE WINCH hauls her ALONGSIDE:
//                                    the line flies (told: a whirr and the line drawn), then she comes in over PFH.haulT s (a creak each second) and is footing.
//                                    Hauled stays hauled: the mark 'pf:haul:<id>' (through death and reload). THE FREEBOOTER's sloop (boss: true) is his to haul.
//   GRAPPLE WINCHES (ents)           a blow on the drum fires its line at its prize. A winch on a boat (on: float id) rides the boat.
// main.js calls: on, clear, update(dt), strike(hb), mover(m, dt), drawBack, drawMover, drawOver, hud, read, haul(id), unhaul(id), prizeK(id), deckY(id).
// ONE WIRING FOR EVERY SEA LEVEL (claude/lw3b): a level with its own words, sounds and art on the kit hands this file ctx.hooks() -> { signal, step(dt), tide(ev), pull(e), pre(hb), verb(v, hb, pre), miss(hb), quiet, flow, foam(g,x0,x1,y,t,ph), gauge(g,t,P), noRespawn, noStreaks, noPosts }
// (all optional; a hook that returns true has CLAIMED the event, the generic words/sounds are skipped). Nothing steps the kit but this file: no level keeps a second TK / PF.
import { tideInit, tideStep, tideApply, tideStrike, tideRespawn, gauge, floatY, lineY } from './tide-kit.js';
import * as PFA from './redraw/pirate_fleet_art.js'; import * as PFT from './redraw/pirate_fleet_tiles.js';
import { pullInit, pullStep, pullBodies, pullShots, flowParts, postNear } from './pull-field.js';
const R = Math.round;
export const PFH = { haulT: 2.2, lineT: 0.45, haulKey: id => 'pf:haul:' + id, farScale: 0.45, farLift: 70 };
export const PF_SAY = { haul: 'THE LINE BITES: SHE COMES ALONGSIDE', hauled: 'ALONGSIDE: BOARD HER', rising: 'THE SWELL COMES UP', grab: 'HOLD ON', slack: 'IT SLACKS: SWIM OUT',
  pull: 'THE SEA HAS YOU', sinking: 'IT PULLS YOU ROUND AND DOWN' };

export function makePirateFleetHands(ctx) {
  const H = {}; let TK = null, PF = null, S = null;
  const lv = () => ctx.L, TS = 16;
  const on = () => !!(lv() && (lv().tides || lv().pulls));
  H.on = on;
  const hooks = () => (ctx.hooks ? ctx.hooks() : null);
  H.kit = () => TK; H.pulls = () => PF;
  H.clear = () => {
    const L = lv(); TK = null; PF = null; S = null; if (!on()) return;
    const marks = ctx.marks();
    TK = tideInit(L, { off: marks }); if (!(hooks() && hooks().noRespawn)) tideRespawn(TK);   /* a load or a respawn: every swell to its safe phase with its grace (docs: a party wipe / checkpoint reload) */
    PF = pullInit(L, { off: marks });
    S = { L, told: {}, prizes: {}, lines: [], creak: 0, foam: {}, last: {} };
    for (const p of L.pfPrizes || []) S.prizes[p.id] = { ...p, k: !p.boss && marks.has(PFH.haulKey(p.id)) ? 1 : 0, hauling: false, lineT: 0 };
    tideApply(TK, L.pools, ctx.poolLevel);
  };
  const fpos = id => floatY(TK, id);
  const winchAt = w => { const y = w.on ? fpos(w.on) : (w.y + 1) * TS; return { x: w.x * TS + 8, y: y == null ? (w.y + 1) * TS : y }; };

  /* ---------- HAULING ---------- */
  function startHaul(id, from) { const P0 = S && S.prizes[id]; if (!P0 || P0.k >= 1 || P0.hauling) return false;
    P0.hauling = true; P0.lineT = PFH.lineT; P0.from = from; ctx.sound('whirr');
    if (!P0.boss) ctx.marks().add(PFH.haulKey(id));
    if (!S.told.haul) { S.told.haul = 1; ctx.number(from.x, from.y - 34, PF_SAY.haul, '#ffd36b'); }
    return true; }
  H.haul = id => startHaul(id, S && S.prizes[id] ? { x: S.prizes[id].x0 * TS - 40, y: (lv().arena ? lv().arena.floor : 480) } : { x: 0, y: 0 });
  H.unhaul = id => { const p = S && S.prizes[id]; if (p) { p.k = 0; p.hauling = false; } };
  H.prizeK = id => (S && S.prizes[id] ? S.prizes[id].k : 0);
  H.deckY = id => fpos(id);

  /* ---------- ONE FRAME ---------- */
  H.update = dt => {
    if (!TK || !S) return; const L = lv();
    const hk = hooks();
    for (const e of tideStep(TK, dt)) {
      if (hk && hk.tide && hk.tide(e)) continue;
      if (e.t === 'toll') { if (!e.turn) ctx.sound('swellTell'); else ctx.sound('swellTurn'); }
      if (e.t === 'phase' && e.ph === 'warn') S.foam[e.id] = 1;
      if (e.t === 'phase' && e.ph === 'rise' && !S.told.rise) { const P = ctx.hero(); if (P && !P.dead && nearBoat(P)) { S.told.rise = 1; ctx.number(P.x, P.y - 40, PF_SAY.rising, '#dff2f8'); } }
    }
    for (const id in S.foam) S.foam[id] = Math.max(0, S.foam[id] - dt * 0.5);
    if (hk && hk.step) hk.step(dt);   /* a level's own say over the sea between the step and the write (the Herald's flats) */
    tideApply(TK, L.pools, ctx.poolLevel);
    const g0 = gauge(TK, (hk && hk.signal) || L.pullSignal || 'swell');
    const pev = pullStep(PF, dt, { tidePh: g0 ? g0.ph : null });
    const bodies = [...ctx.players, ...ctx.enemies().filter(e => e.alive !== false && !e.boss && wetFoe(e))];
    const ev = pullBodies(PF, bodies, dt, { inWater: b => (ctx.players.includes(b) ? !!b.swim : wetFoe(b)), holding: b => ctx.holding(b), kind: b => (ctx.players.includes(b) ? 'hero' : 'foe'),
      dashing: b => !!((b.dashT || 0) > 0 || b.rolling || (b.dodge || 0) > 0), move: (b, dx, dy) => ctx.moveBody(b, dx, dy) });
    for (const e of ev) if (ctx.players.includes(e.b)) {
      if (hk && hk.pull && hk.pull(e, g0)) continue;
      if (e.t === 'enter' && !S.told['in' + e.id]) { S.told['in' + e.id] = 1; ctx.number(e.b.x, e.b.y - 34, e.id === 'sinking' ? PF_SAY.sinking : PF_SAY.pull, '#bfe6f5'); }
      if (e.t === 'grab') { ctx.sound('grab'); if (!S.told.grab) { S.told.grab = 1; ctx.number(e.b.x, e.b.y - 30, PF_SAY.grab, '#ffd36b'); } } }
    if (!(hk && hk.quiet)) for (const e of pev) if (e.t === 'off') { const P = ctx.hero(); if (P && P.swim && !S.told['off' + e.id]) { S.told['off' + e.id] = 1; ctx.number(P.x, P.y - 30, PF_SAY.slack, '#8fd160'); } }
    if (ctx.shots) pullShots(PF, ctx.shots(), dt);
    if (hk && hk.flow) for (const p of flowParts(PF, dt, ctx.view())) ctx.parts().push(p);   /* a level that wants the flow specks (the streaks are the generic drawing) */
    /* (claude/pfart: the flow specks (flowParts) are retired - src/redraw/pirate_fleet_art.js drawStreaks draws the currents) */
    /* the prizes coming in */
    for (const id in S.prizes) { const p = S.prizes[id]; if (!p.hauling) continue;
      if (p.lineT > 0) { p.lineT -= dt; continue; }
      const k0 = p.k; p.k = Math.min(1, p.k + dt / PFH.haulT); S.creak -= dt; if (S.creak <= 0) { S.creak = 0.9; ctx.sound('creak'); }
      if (p.k >= 1 && k0 < 1) { p.hauling = false; ctx.sound('thud'); ctx.shake(3); const x = (p.x0 + p.x1 + 1) * TS / 2, y = fpos(p.id) || 480; ctx.burst(x, y + 6, 16, ['#dff2f8', '#bfe6f5', '#ffffff'], 90, 0.6, -60);
        if (!S.told.hauled) { S.told.hauled = 1; ctx.number(x, y - 30, PF_SAY.hauled, '#8fd160'); } } }
  };
  function wetFoe(e) { for (const p of lv().pools || []) if (e.x >= p.x0 && e.x <= p.x1 && e.y - 4 > p.y) return true; return false; }
  function nearBoat(P) { for (const m of lv().moversExtra || []) if (m.pf && Math.abs(P.x - (m.x0 + m.w / 2)) < 120) return true; return false; }

  /* ---------- A MOVER OF OURS: where the swell (and the haul) put it ---------- */
  H.mover = (m, dt) => {
    if (!m.pf || !TK) return false;
    const ox = m.x, oy = m.y, y = fpos(m.fid);
    if (y != null) m.y = y;
    if (m.pf === 'prize') { const p = S.prizes[m.fid], k = p ? p.k : 1, was = !m.broken; m.broken = k < 1; m.x = m.x0;
      if (m.broken && was) for (const pp of ctx.players) if (pp.onMover === m) { pp.onMover = null; pp.ground = false; } }
    m.dx = m.x - ox; m.dy = m.broken ? 0 : m.y - oy; return true;
  };

  /* ---------- A BLOW ---------- */
  H.strike = hb => {
    if (!TK || !hb) return; const L = lv();
    const hk = hooks(), pre = hk && hk.pre ? hk.pre(hb) : undefined, v = tideStrike(TK, hb), claimed = v ? !!(hk && hk.verb && hk.verb(v, hb, pre)) : (hk && hk.miss && hk.miss(hb), false);
    if (v && !claimed) { if (v.t === 'lever') ctx.marks().add(v.key); ctx.sound('clank'); }
    for (const w of L.pfWinches || []) { const p = winchAt(w);
      if (!(hb.l < p.x + 10 && hb.r > p.x - 10 && hb.t < p.y - 2 && hb.b > p.y - 24)) continue;
      const pr = S.prizes[w.hauls]; if (!pr || pr.k >= 1 || pr.hauling) { if (!S.last[w.id] || ctx.time() - S.last[w.id] > 1) { S.last[w.id] = ctx.time(); ctx.sound('clank'); } continue; }
      if (startHaul(w.hauls, p)) { ctx.sparks && ctx.sparks(p.x, p.y - 10, 1, 6); ctx.shake(2); } }
  };

  /* ---------- DRAWING (claude/pfart: src/redraw/pirate_fleet_art.js - tarred hulls in five liveries, rigged and sailed prizes, the capstan winch + grapnel line, mast-stump and anchor-chain posts, foam, gauge, flow streaks) ---------- */
  const zoneAt = m => PFT.zoneOf(R(m.x0 / TS) + 2, 30), seedOf = m => (m.fid || '').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) & 255;
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const L = lv();
    for (const m of L.moversExtra || []) { if (m.pf !== 'prize') continue; const p = S.prizes[m.fid]; if (!p || p.k >= 1) continue;
      /* out at sea: small, high on the horizon, coming in as k grows */
      const k = p.k, sc = PFH.farScale + (1 - PFH.farScale) * k, y = (fpos(m.fid) || m.y) - PFH.farLift * (1 - k), w = m.w * sc, x = m.x0 + (m.w - w) / 2;
      PFA.drawFarPrize(g, R(x - cx), R(y - cy), R(w), sc, 0.55 + 0.45 * k, t, { seed: seedOf(m), zone: zoneAt(m), boss: !!p.boss, glint: !p.boss && k === 0 });
    }
    /* the whirl's wreck: the prize that went down, over the ring (the posts are her mast stumps) */
    for (const f of L.pulls || []) if (f.kind === 'whirl' && f.ring) PFA.drawWreck(g, f.ring[0] * TS + 8 - cx, f.ring[1] * TS - 2 - cy, t);
  };
  H.drawMover = (g, m, cx, cy, t) => {
    if (!S || m.broken) return; const x = R(m.x - cx), y = R(m.y - cy);
    const sea = seaLineAt(m.x0 + m.w / 2), depth = Math.max(10, Math.min(40, (sea != null ? sea - m.y : 14) + 10));
    /* a float on the OTHER swell: its own crest under it (the visible sea is the first swell's) */
    const f = (m.tide || '').endsWith('B'); if (f && sea != null) PFA.drawCrest(g, x + R(m.w / 2), R(sea - cy) + 1, R(m.w / 2) + 6, t);
    if (m.fid === 'L1') { PFA.drawLongboat(g, x, y, R(m.w), { t }); return; }
    PFA.drawSwellHull(g, x, y, R(m.w), { depth, seed: seedOf(m), zone: zoneAt(m), prize: m.pf === 'prize', boss: !!m.boss });
    if (m.pf === 'prize') PFA.drawRig(g, x, y, R(m.w), { sc: 1, seed: seedOf(m), boss: !!m.boss, t });
  };
  function seaLineAt(x) { for (const p of lv().pools || []) if (x >= p.x0 && x <= p.x1) return p.y; return null; }
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv(), VWd = ctx.VW();
    /* THE FOAM: the warn - the sea's surface runs white before the swell comes up */
    const hk = hooks();
    for (const T of L.tides || []) { const gg = gauge(TK, T.id); if (!gg || !(gg.ph === 'warn' || gg.ph === 'turn')) continue;
      for (const p of L.pools || []) { if (!(T.pools || []).includes(p.id)) continue; const fx0 = Math.max(0, R(p.x0 - cx)), fx1 = Math.min(VWd, R(p.x1 - cx));
        if (hk && hk.foam) hk.foam(g, fx0, fx1, R(p.y - cy), t, gg.ph); else PFA.drawFoam(g, fx0, fx1, R(p.y - cy), t, gg.ph); } }
    /* THE CURRENTS: flow streaks over every field (a told nudge, then a bite) */
    if (!(hk && hk.noStreaks)) for (const fs of PF ? PF.fields : []) PFA.drawStreaks(g, fs, cx, cy, t, VWd);
    /* THE WINCHES: a capstan on a bedplate; its line while it flies and while she comes in */
    for (const w of L.pfWinches || []) { const p = winchAt(w), x = R(p.x - cx), y = R(p.y - cy), pr = S.prizes[w.hauls];
      PFA.drawWinch(g, x, y, t, { hauling: !!(pr && pr.hauling), ready: !!(pr && pr.k < 1 && !pr.hauling) });
      if (pr && (pr.hauling || (pr.k > 0 && pr.k < 1))) { const m = L.moversExtra.find(q => q.fid === pr.id); if (m) { const k = pr.k, sc = PFH.farScale + (1 - PFH.farScale) * k,
          tx = m.x0 + m.w / 2 - cx, ty = (fpos(pr.id) || m.y) - PFH.farLift * (1 - k) - cy - 30 * sc, f = pr.lineT > 0 ? 1 - pr.lineT / PFH.lineT : 1;
          PFA.drawLine(g, x, y - 14, tx, ty, f, t, { taut: pr.hauling && pr.lineT <= 0 }); } } }
    /* the posts (mast stumps over the sinking, anchor chains under the storm's prize): hold UP in reach */
    if (!(hk && hk.noPosts)) for (const f of L.pulls || []) for (const [px, py] of f.posts || []) PFA.drawStump(g, px * TS + 8 - cx, py * TS + 8 - cy, f.id === 'rip' ? 'chain' : 'stump', t, ctx.players.some(pp => pp.pullGrab && !pp.dead && Math.abs(pp.x - (px * TS + 8)) < 30));
    /* a held seat: a word */
    if (!(hk && hk.noPosts)) for (const pp of ctx.players) if (pp.pullGrab && !pp.dead) { g.fillStyle = '#ffd36b'; g.fillRect(R(pp.x - cx) - 1, R(pp.y - cy) - 30, 3, 3); }
  };
  /* THE A3 GAUGE (one drawing for every sea level, PFA.drawGauge): the swell's height, its phase, the tolls, the coming arrow */
  H.hud = (g, t) => {
    if (!TK) return; const P = ctx.hero(); if (!P) return;
    const hk = hooks(); if (hk && hk.gauge) { hk.gauge(g, t, P); return; }
    const T = (lv().tides || []).find(q => (q.pools || []).some(id => { const p = (lv().pools || []).find(pp => pp.id === id); return p && P.x >= p.x0 && P.x <= p.x1; })); if (!T) return;
    const gg = gauge(TK, T.id); if (!gg) return; PFA.drawGauge(g, 6, 30, gg, t);
  };
  H.read = () => S && { tides: (lv().tides || []).map(T => ({ id: T.id, ...gauge(TK, T.id), line: R(lineY(TK, T.id)) })), prizes: Object.values(S.prizes).map(p => ({ id: p.id, k: +p.k.toFixed(2), hauling: p.hauling, boss: !!p.boss })),
    pulls: PF.fields.map(f => ({ id: f.id, ph: f.ph, s: +f.s.toFixed(2), dirK: f.dirK })), floats: Object.fromEntries((lv().moversExtra || []).filter(m => m.pf).map(m => [m.fid, R(fpos(m.fid) || 0)])) };
  H.postNear = (x, y) => (PF ? postNear(PF, x, y) : null);
  return H;
}
