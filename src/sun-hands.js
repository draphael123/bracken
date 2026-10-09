// src/sun-hands.js - THE SUN's HANDS, game-wide (claude/ksar2, Daniel 10-08: "THE SUN GAME-WIDE - one shared module for the Caravan, the Glass Sea
// and the Ksar: exposure DRAINS hp steadily, no stun / flinch, stronger than today; MUCH CLEARER - drawn shade patches, shimmering sunlit ground, the
// hero heats (glow, sweat, sizzle), a HUD sun that fills, a warning flash before you step out; more shade so a shade route always exists").
// src/sunstroke.js is the rule (pure: the meter, the drain's rate, the shade boxes, the level check). This binds it to the game for EVERY level that
// has the desert's sun (L.caravan: THE SUNKEN CARAVAN, THE WELL TOWN, THE GLASS SEA by day, THE BANDIT KSAR; a level whose floor the sun never reaches
// - the Red Gorge, the Underwell - says so with its shade):
//   update(dt)       the meter for every hero; THE DRAIN straight off the bar (no blow: no flinch, no knock, no mercy window, a swing is never
//                    cancelled - ctx.drain); the sizzle and the '-n' said once a beat; sweat off a hero out in it; THE STEP-OUT WARNING (a hero in
//                    the shade moving to its edge with sun beyond: the edge flashes and a tick sounds, once an approach)
//   drawGround(...)  every shade box's FOOTPRINT drawn on the floor under it: a hard, cool band with bright edge posts (you see where the shade stops),
//                    and the SUNLIT GROUND SHIMMERING (heat lines over every lit floor top on the screen)
//   drawHero(...)    the hero HEATS: a red glow that grows with the meter, heat wisps off him, and the warning's flashing edge
//   drawHud(...)     a SUN DISC that FILLS with the meter (white-gold, then orange, then red as the drain grows; its rays pulse while it drains)
// main.js passes: players, hero, asPlayer, shaded(pp) (its cvShaded), zones() (the static shade + the rolled-out canopies), drain(n, pp) (takes n hp off
// the hero being asked for, names THE SUN if it kills), god(), number, part(p), sfx, TS, tileAt, standable(tx, ty), solid(tx, ty), VW, VH, time, calm().
import { SUN, sunStep } from './sunstroke.js';
import { makeDrains } from './drain.js';   /* (design standard A13) the sun's drain is a source on the SHARED environment drain - no stagger, no stun, no flinch */

export const SUNH = { warnLook: 14, warnT: 0.7, warnCd: 1.6, sweatRate: 6, shimmerStep: 6 };

export function makeSunHands(ctx) {
  const H = {}, R = Math.round, segCache = new Map();
  const DR = makeDrains({ players: () => ctx.players, god: () => ctx.god(), take: (pp, n) => ctx.asPlayer(pp, () => ctx.drain(n, pp)),
    onBeat: (pp, n) => { const st = pp.sunStage || 1; if (pp === ctx.hero() && ctx.sfx.sunBurn) ctx.sfx.sunBurn(st); ctx.number(pp.x, pp.y - 26, '-' + n, ['#ffb060', '#ff8a4c', '#ff5a3c'][st - 1] || '#ffb060'); } });
  H.drains = DR;
  H.last = null;   /* the asked hero's last step: { swim, rate, stage, warm, shaded } */
  H.reset = () => { segCache.clear(); H.last = null; for (const pp of ctx.players) { pp.sun = { v: 0 }; pp.sunWarn = 0; pp.sunWarnCd = 0; DR.stop(pp, 'sun'); } };
  /* ---------- EVERY FRAME ---------- */
  H.update = dt => {
    for (const pp of ctx.players) {
      if (!pp.sun) pp.sun = { v: 0 };
      if (pp.dead) { DR.stop(pp, 'sun'); continue; }
      const sh = ctx.shaded(pp), r = sunStep(pp.sun, dt, sh);
      if (pp === ctx.hero()) H.last = { ...r, shaded: sh };
      pp.sunWarn = Math.max(0, (pp.sunWarn || 0) - dt); pp.sunWarnCd = Math.max(0, (pp.sunWarnCd || 0) - dt);
      /* THE STEP-OUT WARNING: in the shade, moving, and the sun a step ahead */
      if (sh && Math.abs(pp.vx || 0) > 20) { const dir = Math.sign(pp.vx), ax = pp.x + dir * SUNH.warnLook;
        if (!ctx.shaded({ x: ax, y: pp.y, h: pp.h, vx: pp.vx })) { if (!(pp.sunWarnCd > 0)) { pp.sunWarnCd = SUNH.warnCd; if (ctx.sfx.sunWarn) ctx.sfx.sunWarn(); } pp.sunWarn = SUNH.warnT; pp.sunWarnDir = dir; } }
      /* THE DRAIN: the sun's source on the shared drain (src/drain.js), its rate from the meter (0 in the shade) */
      pp.sunStage = r.stage; if (r.rate > 0) DR.set(pp, 'sun', r.rate, { name: 'THE SUN', col: '#ff9a4c' }); else DR.stop(pp, 'sun');
      /* SWEAT off a hero out in it */
      if (!sh && pp.sun.v > 0.1 && !ctx.calm() && Math.random() < dt * SUNH.sweatRate * pp.sun.v)
        ctx.part({ x: pp.x + (Math.random() - 0.5) * 8, y: pp.y - 16 - Math.random() * 6, vx: (Math.random() - 0.5) * 20, vy: -30, life: 0.5, max: 0.5, col: Math.random() < 0.5 ? '#bfe6f5' : '#e8f6ff', size: 1, grav: 260 });
    }
    DR.step(dt);
  };
  /* ---------- THE FLOOR: where each shade box stands (its footprint), cached per box ---------- */
  function floorSegs(z) {
    const key = z.join(','); if (segCache.has(key)) return segCache.get(key);
    const ts = ctx.TS, out = [], c0 = Math.floor(z[0] / ts), c1 = Math.floor((z[1] - 1) / ts), r0 = Math.max(0, Math.floor(z[2] / ts)), r1 = Math.floor(z[3] / ts) + 1;
    let cur = null;
    for (let c = c0; c <= c1; c++) { let row = -1; for (let r = r0; r <= r1; r++) if (ctx.standable(c, r) && !ctx.solid(c, r - 1)) { row = r; if (r * ts >= z[3] - ts - 2) break; }
      if (row < 0) { cur = null; continue; }
      const x0 = Math.max(z[0], c * ts), x1 = Math.min(z[1], (c + 1) * ts);
      if (cur && cur.row === row && Math.abs(cur.x1 - x0) < 1) cur.x1 = x1; else { cur = { x0, x1, row }; out.push(cur); } }
    segCache.set(key, out); return out;
  }
  H.drawGround = (g, cx, cy, time) => {
    const ts = ctx.TS, vw = ctx.VW(), vh = ctx.VH(), zones = ctx.zones();
    /* THE SHADE'S FOOTPRINT: a hard cool band on the floor, a bright post at each end */
    for (const z of zones) { if (z[1] < cx - 8 || z[0] > cx + vw + 8) continue;
      for (const s of floorSegs(z)) { const x0 = R(s.x0 - cx), x1 = R(s.x1 - cx), y = R(s.row * ts - cy); if (y < -8 || y > vh + 8) continue;
        g.globalAlpha = 0.5; g.fillStyle = '#3c3478'; g.fillRect(x0, y, x1 - x0, 4);
        g.globalAlpha = 0.65; g.fillStyle = '#6a62b8'; g.fillRect(x0, y, x1 - x0, 1);
        g.globalAlpha = 0.8; g.fillStyle = '#c8d4ff'; g.fillRect(x0, y - 3, 1, 7); g.fillRect(x1 - 1, y - 3, 1, 7); } }
    g.globalAlpha = 1;
    /* THE SUNLIT GROUND SHIMMERS: heat lines over every lit floor top in view */
    if (ctx.calm()) return;
    const c0 = Math.floor(cx / ts), c1 = Math.floor((cx + vw) / ts) + 1, r0 = Math.max(1, Math.floor(cy / ts)), r1 = Math.floor((cy + vh) / ts) + 1;
    for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) {
      if (!ctx.standable(c, r) || ctx.solid(c, r - 1) || ctx.standable(c, r - 1)) continue;
      for (let k = 0; k < ts; k += SUNH.shimmerStep) { const px = c * ts + k + 3, py = r * ts;
        if (ctx.shaded({ x: px, y: py, h: 14, probe: true })) continue;
        const ph = time * 4 + px * 0.37, a = 0.16 + 0.14 * Math.sin(ph);
        g.globalAlpha = a; g.fillStyle = '#fff1c8'; g.fillRect(R(px - cx + Math.sin(ph * 1.7) * 1.5), R(py - cy) - 3 - R(2 + Math.sin(ph) * 2), 3, 1);
        g.globalAlpha = a * 0.6; g.fillStyle = '#ffd890'; g.fillRect(R(px - cx + 2 + Math.sin(ph * 1.3 + 1) * 1.5), R(py - cy) - 7 - R(Math.sin(ph + 2) * 2), 2, 1); } }
    g.globalAlpha = 1;
  };
  /* ---------- THE HERO HEATS, AND THE STEP-OUT WARNING ---------- */
  H.drawHero = (g, cx, cy, time) => {
    for (const pp of ctx.players) { if (pp.dead || !pp.sun) continue; const v = pp.sun.v || 0, x = R(pp.x - cx), y = R(pp.y - (pp.h || 18) / 2 - cy);
      const out = !(pp === ctx.hero() ? (H.last && H.last.shaded) : ctx.shaded(pp));
      if (v > 0.03 && out) { const draining = v >= SUN.drainAt, k = Math.min(1, v), p = 0.5 + 0.5 * Math.sin(time * (draining ? 12 : 6));
        g.globalAlpha = (0.10 + 0.22 * k) * (0.8 + 0.2 * p); g.fillStyle = draining ? '#ff5a2c' : '#ff9a4c'; g.beginPath(); g.ellipse(x, y, 10 + 4 * k, 14 + 4 * k, 0, 0, Math.PI * 2); g.fill();
        g.globalAlpha = (0.08 + 0.16 * k); g.fillStyle = '#ffd36b'; g.beginPath(); g.ellipse(x, y, 6 + 2 * k, 10 + 2 * k, 0, 0, Math.PI * 2); g.fill();
        /* heat wisps off his head */
        if (!ctx.calm()) for (let i = 0; i < 2 + R(2 * k); i++) { const ph = time * 3 + i * 1.9 + pp.x * 0.01, wy = ((time * 26 + i * 9) % 14);
          g.globalAlpha = (0.5 - wy / 28) * k; g.fillStyle = '#fff1c8'; g.fillRect(x - 4 + i * 3 + R(Math.sin(ph) * 2), y - 14 - R(wy), 1, 2); }
        g.globalAlpha = 1; }
      /* THE WARNING: the shade's edge ahead flashes, and a sun over the hero says what is beyond it */
      if (pp.sunWarn > 0) { const on = Math.floor(time * 12) % 2 === 0, d = pp.sunWarnDir || 1, ex = x + d * (SUNH.warnLook - 2), fy = R(pp.y - cy);
        g.globalAlpha = 0.85 * Math.min(1, pp.sunWarn / 0.3); g.fillStyle = on ? '#fff1c8' : '#ff9a4c'; g.fillRect(ex, fy - 26, 2, 26);
        sunGlyph(g, x + d * 8, fy - 36, 1, on ? '#ffd36b' : '#ff9a4c'); g.globalAlpha = 1; } }
  };
  function sunGlyph(g, x, y, fillK, col) {   /* a little sun: a disc and eight rays */
    g.fillStyle = col; g.fillRect(x - 2, y - 2, 5, 5); g.fillRect(x - 1, y - 3, 3, 7); g.fillRect(x - 3, y - 1, 7, 3);
    g.fillRect(x, y - 6, 1, 2); g.fillRect(x, y + 5, 1, 2); g.fillRect(x - 6, y, 2, 1); g.fillRect(x + 5, y, 2, 1); }
  /* ---------- THE HUD: a sun disc that fills with the meter ---------- */
  H.drawHud = (g, x, y, time) => {
    const P = ctx.hero(), v = (P && P.sun && P.sun.v) || 0, L = H.last || { stage: 0, shaded: true }, st = L.stage || 0, r = 6;
    const col = st >= 3 ? '#ff3a2a' : st === 2 ? '#ff6a3c' : st === 1 ? '#ff9a4c' : '#ffd36b';
    g.globalAlpha = 0.65; g.fillStyle = 'rgb(10,8,20)'; g.beginPath(); g.arc(x, y, r + 2, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    /* the fill, from the bottom up */
    if (v > 0) { g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip(); g.fillStyle = col; g.fillRect(x - r, R(y + r - 2 * r * v), 2 * r, R(2 * r * v) + 1); g.restore(); }
    g.strokeStyle = L.shaded ? '#c9b0e0' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    /* the rays pulse while it drains */
    const on = st > 0 && Math.floor(time * (4 + 3 * st)) % 2 === 0, rl = 2 + (on ? 2 : 0);
    g.fillStyle = st > 0 ? (on ? '#fff1c8' : col) : (L.shaded ? 'rgba(201,176,224,0.6)' : 'rgba(255,211,107,0.7)');
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, cx = Math.cos(a), sy = Math.sin(a); for (let k = 0; k < rl; k++) g.fillRect(R(x + cx * (r + 2 + k)), R(y + sy * (r + 2 + k)), 1, 1); }
  };
  return H;
}
