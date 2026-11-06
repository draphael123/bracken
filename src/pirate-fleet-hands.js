// src/pirate-fleet-hands.js - THE WATER KIT IN THE GAME + THE PIRATE FLEET's own pieces (claude/water1, 2026-11-05). The first level wiring of src/tide-kit.js and
// src/pull-field.js (docs/waterkit.md "Wiring"): ANY level that declares L.tides / L.pulls gets them run here - the kit's cycle stepped and written into the level's pools
// (poolLevel), its floats moved, its verbs struck, every seat and every foe pushed by the pull fields, the flow specks, the foam line and the A3 gauge (GREYBOX).
// On top, THE PIRATE FLEET's (L.pirateFleet, src/pirate-fleet.js):
//   SWELL BOATS (movers pf 'float')  a tide-kit float as a moving deck: main.js's mover code carries whoever stands on it (m.dy).
//   PRIZES (movers pf 'prize')       a float that rides OUT AT SEA (drawn small in the background, m.broken = not footing) until a GRAPPLE WINCH hauls her ALONGSIDE:
//                                    the line flies (told: a whirr and the line drawn), then she comes in over PFH.haulT s (a creak each second) and is footing.
//                                    Hauled stays hauled: the mark 'pf:haul:<id>' (through death and reload). THE FREEBOOTER's sloop (boss: true) is his to haul.
//   GRAPPLE WINCHES (ents)           a blow on the drum fires its line at its prize. A winch on a boat (on: float id) rides the boat.
// main.js calls: on, clear, update(dt), strike(hb), mover(m, dt), drawBack, drawMover, drawOver, hud, read, haul(id), unhaul(id), prizeK(id), deckY(id).
import { tideInit, tideStep, tideApply, tideStrike, tideRespawn, gauge, floatY, lineY } from './tide-kit.js';
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
  H.kit = () => TK; H.pulls = () => PF;
  H.clear = () => {
    const L = lv(); TK = null; PF = null; S = null; if (!on()) return;
    const marks = ctx.marks();
    TK = tideInit(L, { off: marks }); tideRespawn(TK);   /* a load or a respawn: every swell to its safe phase with its grace (docs: a party wipe / checkpoint reload) */
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
    for (const e of tideStep(TK, dt)) {
      if (e.t === 'toll') { if (!e.turn) ctx.sound('swellTell'); else ctx.sound('swellTurn'); }
      if (e.t === 'phase' && e.ph === 'warn') S.foam[e.id] = 1;
      if (e.t === 'phase' && e.ph === 'rise' && !S.told.rise) { const P = ctx.hero(); if (P && !P.dead && nearBoat(P)) { S.told.rise = 1; ctx.number(P.x, P.y - 40, PF_SAY.rising, '#dff2f8'); } }
    }
    for (const id in S.foam) S.foam[id] = Math.max(0, S.foam[id] - dt * 0.5);
    tideApply(TK, L.pools, ctx.poolLevel);
    const g0 = gauge(TK, 'swell');
    const pev = pullStep(PF, dt, { tidePh: g0 ? g0.ph : null });
    const bodies = [...ctx.players, ...ctx.enemies().filter(e => e.alive !== false && !e.boss && wetFoe(e))];
    const ev = pullBodies(PF, bodies, dt, { inWater: b => (ctx.players.includes(b) ? !!b.swim : wetFoe(b)), holding: b => ctx.holding(b), kind: b => (ctx.players.includes(b) ? 'hero' : 'foe'),
      dashing: b => !!((b.dashT || 0) > 0 || b.rolling || (b.dodge || 0) > 0), move: (b, dx, dy) => ctx.moveBody(b, dx, dy) });
    for (const e of ev) if (ctx.players.includes(e.b)) {
      if (e.t === 'enter' && !S.told['in' + e.id]) { S.told['in' + e.id] = 1; ctx.number(e.b.x, e.b.y - 34, e.id === 'sinking' ? PF_SAY.sinking : PF_SAY.pull, '#bfe6f5'); }
      if (e.t === 'grab') { ctx.sound('grab'); if (!S.told.grab) { S.told.grab = 1; ctx.number(e.b.x, e.b.y - 30, PF_SAY.grab, '#ffd36b'); } } }
    for (const e of pev) if (e.t === 'off') { const P = ctx.hero(); if (P && P.swim && !S.told['off' + e.id]) { S.told['off' + e.id] = 1; ctx.number(P.x, P.y - 30, PF_SAY.slack, '#8fd160'); } }
    if (ctx.shots) pullShots(PF, ctx.shots(), dt);
    const V = ctx.view(); for (const p of flowParts(PF, dt, V)) ctx.parts().push(p);
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
    const v = tideStrike(TK, hb); if (v && v.t === 'lever') ctx.marks().add(v.key); if (v) ctx.sound('clank');
    for (const w of L.pfWinches || []) { const p = winchAt(w);
      if (!(hb.l < p.x + 10 && hb.r > p.x - 10 && hb.t < p.y - 2 && hb.b > p.y - 24)) continue;
      const pr = S.prizes[w.hauls]; if (!pr || pr.k >= 1 || pr.hauling) { if (!S.last[w.id] || ctx.time() - S.last[w.id] > 1) { S.last[w.id] = ctx.time(); ctx.sound('clank'); } continue; }
      if (startHaul(w.hauls, p)) { ctx.sparks && ctx.sparks(p.x, p.y - 10, 1, 6); ctx.shake(2); } }
  };

  /* ---------- DRAWING (GREYBOX - the art pass owes the swell boats, the prizes far and near, the winch, the line, the posts, the foam, the gauge) ---------- */
  const hullCol = '#2e2620', hullL = '#4a3c30', deckCol = '#8a7454', tar = '#1a1612';
  function drawHull(g, x, y, w, depth, scale = 1, alpha = 1) {
    g.globalAlpha = alpha; const d = R(depth * scale);
    g.fillStyle = hullCol; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w - R(6 * scale), y + d); g.lineTo(x + R(6 * scale), y + d); g.closePath(); g.fill();
    g.fillStyle = tar; g.fillRect(x + R(4 * scale), y + d - R(3 * scale), w - R(8 * scale), R(3 * scale));
    g.fillStyle = hullL; g.fillRect(x, y + R(3 * scale), w, 1);
    g.fillStyle = deckCol; g.fillRect(x, y, w, Math.max(1, R(3 * scale))); g.globalAlpha = 1; }
  H.drawBack = (g, cx, cy, t) => {
    if (!S) return; const L = lv();
    for (const m of L.moversExtra || []) { if (m.pf !== 'prize') continue; const p = S.prizes[m.fid]; if (!p || p.k >= 1) continue;
      /* out at sea: small, high on the horizon, coming in as k grows */
      const k = p.k, sc = PFH.farScale + (1 - PFH.farScale) * k, y = (fpos(m.fid) || m.y) - PFH.farLift * (1 - k), w = m.w * sc, x = m.x0 + (m.w - w) / 2;
      const sx = R(x - cx), sy = R(y - cy);
      drawHull(g, sx, sy, R(w), 26, sc, 0.55 + 0.45 * k);
      g.globalAlpha = 0.55 + 0.45 * k; g.fillStyle = '#6a5a44'; g.fillRect(sx + R(w / 2), sy - R(40 * sc), 2, R(40 * sc)); g.fillStyle = '#d8d0c0'; g.fillRect(sx + R(w / 2) - R(10 * sc), sy - R(36 * sc), R(20 * sc), R(18 * sc)); g.globalAlpha = 1;
      if (!p.boss && k === 0 && Math.sin(t * 3) > 0.6) { g.fillStyle = '#ffd36b'; g.fillRect(sx + R(w / 2) - 1, sy - R(52 * sc), 3, 3); }   /* a glint: she is the winch's */
    }
  };
  H.drawMover = (g, m, cx, cy, t) => {
    if (!S || m.broken) return; const x = R(m.x - cx), y = R(m.y - cy);
    const sea = seaLineAt(m.x0 + m.w / 2), depth = Math.max(10, Math.min(40, (sea != null ? sea - m.y : 14) + 10));
    drawHull(g, x, y, R(m.w), depth);
    if (m.pf === 'prize') { g.fillStyle = '#6a5a44'; g.fillRect(x + R(m.w / 2), y - 46, 2, 46); g.fillStyle = 'rgba(216,208,192,0.85)'; g.fillRect(x + R(m.w / 2) - 12, y - 42, 24, 20); }
    /* a float on the OTHER swell: its own crest under it (the visible sea is the first swell's) */
    const f = (m.tide || '').endsWith('B'); if (f) { const sy = R(m.y - cy) + 4; g.fillStyle = 'rgba(223,242,248,0.55)'; g.beginPath(); g.ellipse(x + R(m.w / 2), sy + 8, R(m.w / 2) + 10, 7, 0, Math.PI, 0); g.fill(); }
  };
  function seaLineAt(x) { for (const p of lv().pools || []) if (x >= p.x0 && x <= p.x1) return p.y; return null; }
  H.drawOver = (g, cx, cy, t) => {
    if (!S) return; const L = lv();
    /* THE FOAM: the warn - the sea's surface runs white before the swell comes up */
    for (const T of L.tides || []) { const gg = gauge(TK, T.id); if (!gg || !(gg.ph === 'warn' || gg.ph === 'turn')) continue;
      for (const p of L.pools || []) { if (!(T.pools || []).includes(p.id)) continue; const y = R(p.y - cy) - 1, x0 = Math.max(0, R(p.x0 - cx)), x1 = Math.min(ctx.VW(), R(p.x1 - cx));
        g.fillStyle = gg.ph === 'warn' ? 'rgba(255,255,255,0.85)' : 'rgba(223,242,248,0.6)'; for (let x = x0 - (x0 % 6) + R(t * 20) % 6; x < x1; x += 6) g.fillRect(x, y, 3, 1); } }
    /* THE WINCHES: a drum on a post; its line while it flies and while she comes in */
    for (const w of L.pfWinches || []) { const p = winchAt(w), x = R(p.x - cx), y = R(p.y - cy), pr = S.prizes[w.hauls];
      g.fillStyle = '#3a3a44'; g.fillRect(x - 2, y - 14, 4, 14); g.fillStyle = '#6a6a74'; g.fillRect(x - 6, y - 18, 12, 7); g.fillStyle = '#c9b27c'; g.fillRect(x - 5, y - 16, 10, 3);
      const spin = pr && pr.hauling; g.fillStyle = '#e8dcc0'; g.fillRect(x + 6, y - 15 + (spin ? R(Math.sin(t * 20) * 2) : 0), 4, 2);
      if (pr && pr.k < 1 && !pr.hauling && Math.sin(t * 4) > 0) { g.fillStyle = '#ffd36b'; g.fillRect(x - 1, y - 24, 3, 3); }   /* strike me */
      if (pr && (pr.hauling || (pr.k > 0 && pr.k < 1))) { const m = L.moversExtra.find(q => q.fid === pr.id); if (m) { const k = pr.k, sc = PFH.farScale + (1 - PFH.farScale) * k,
          tx = m.x0 + m.w / 2 - cx, ty = (fpos(pr.id) || m.y) - PFH.farLift * (1 - k) - cy, f = pr.lineT > 0 ? 1 - pr.lineT / PFH.lineT : 1;
          g.strokeStyle = '#d8c8a0'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x + (tx - x) * f, y - 14 + (ty - (y - 14)) * f); g.stroke(); } } }
    /* the posts (mast stumps over the sinking, anchor chains under the storm's prize): hold UP in reach */
    for (const f of L.pulls || []) for (const [px, py] of f.posts || []) { const x = R(px * TS + 8 - cx), y = R(py * TS + 8 - cy);
      g.fillStyle = '#4a4e58'; g.fillRect(x - 2, y - 10, 4, 22); g.fillStyle = '#a8aeb8'; g.fillRect(x - 3, y - 12, 6, 3); }
    /* a held seat: a word */
    for (const pp of ctx.players) if (pp.pullGrab && !pp.dead) { g.fillStyle = '#ffd36b'; g.fillRect(R(pp.x - cx) - 1, R(pp.y - cy) - 30, 3, 3); }
  };
  /* THE A3 GAUGE (one drawing for every sea level - art owed): the swell's height, its phase, the tell flashing */
  H.hud = (g, t) => {
    if (!TK) return; const P = ctx.hero(); if (!P) return;
    const T = (lv().tides || []).find(q => (q.pools || []).some(id => { const p = (lv().pools || []).find(pp => pp.id === id); return p && P.x >= p.x0 && P.x <= p.x1; })); if (!T) return;
    const gg = gauge(TK, T.id); if (!gg) return; const x = 6, y = 30, h = 24;
    g.fillStyle = 'rgba(10,14,22,0.7)'; g.fillRect(x, y, 10, h + 4);
    g.fillStyle = gg.tell && Math.sin(t * 16) > 0 ? '#ffffff' : '#7cc8e8'; const fh = R(h * gg.k); g.fillRect(x + 2, y + 2 + h - fh, 6, Math.max(1, fh));
    if (gg.coming === 'in') { g.fillStyle = '#ffd36b'; g.fillRect(x + 11, y + 2, 3, 3); }
  };
  H.read = () => S && { tides: (lv().tides || []).map(T => ({ id: T.id, ...gauge(TK, T.id), line: R(lineY(TK, T.id)) })), prizes: Object.values(S.prizes).map(p => ({ id: p.id, k: +p.k.toFixed(2), hauling: p.hauling, boss: !!p.boss })),
    pulls: PF.fields.map(f => ({ id: f.id, ph: f.ph, s: +f.s.toFixed(2), dirK: f.dirK })), floats: Object.fromEntries((lv().moversExtra || []).filter(m => m.pf).map(m => [m.fid, R(fpos(m.fid) || 0)])) };
  H.postNear = (x, y) => (PF ? postNear(PF, x, y) : null);
  return H;
}
