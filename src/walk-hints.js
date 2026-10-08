// src/walk-hints.js - WHAT A LEVEL TEACHES THE WALKER (claude/walkerhands). tools/level-walk.mjs only; no game code reads it.
//
// THE INTERFACE (the Ksar lane's BK.walkHint, origin/claude/ksar src/ksar-hands.js, mirrored here unchanged):
//   hint(BK, P, mem) -> null (nothing to work here: the walker walks the route) or { x, y, key, face, r, hold }
//     x, y   world px: where a player stands to work it (y = his FEET)
//     key    what he presses there, every 12 frames while he stands at it (within 10 px, footed): 'talk' (E), 'atk', 'up'... or null (stand)
//     face   which way he faces there (1 / -1; 0 = toward x)
//     r      how near (tiles across, default 6) the walker must be before the hint takes his goal (out of reach the route walks him there;
//            and only on his own floor, within 2 rows)
//     hold   (walkerhands) true: stand where you are and wait (a bed fusing, a told hazard passing) - the walker keeps the frame from reading as stuck
// A LEVEL'S OWN HOOK FIRST: BK.walkHint() when the level module defines one (the Ksar's gong, winch, kegs and tower door). Otherwise the
// walker looks here, WALK_HINTS[levelId] - the same shape, written bot-side, for a level whose verbs live in its own module (no game code is
// changed to teach the bot). mem is the walker's own scratch object for the run (the hint may keep what it has tried).
import { trace, makeOpaque } from './light.js';
import { isSlope } from './slopes.js';

const TS = 16;
/* THE GLASS SEA (src/glass-sea-hands.js): a sand bed fuses to glass while a day beam lands on its heap; a boiling crack with a target ring is held
   by a fire beam on the ring. A player reads the beam's line and the mirror's dial, and turns the mirrors into place. The walker does it by
   tracing the beam for every notch of the mirrors near the bed (light.js trace, as the level traces it) and turning the first mirror that is
   not on its notch yet - then waits on the bed while it fuses. */
function glassSea(BK, P, mem) {
  const G = BK.glassSea ? BK.glassSea() : null; if (!G || !P) return null;
  const L = BK.L, T = BK.T || mem.T, R = mem.route || [], px = P.x / TS;
  if (!T) return null;
  const nearRoute = (x, y) => R.some(([rx, ry]) => Math.abs(rx - x) <= 2 && Math.abs(ry - y) <= 10);   /* (the reach model's route may run through the pit under a bridge bed: a fall in there is a blow, not a death) */
  /* the next thing on the way that wants light: a bed not yet glass, or a ring-held crack not held */
  const want = [];
  for (const b of G.beds) { if (b.k >= 0.97 || /vault/i.test(b.id)) continue;   /* (the vault stair is the shards' optional reward, off the way) */ const xs = b.tiles.map(t => t[0]), x0 = Math.min(...xs), x1 = Math.max(...xs);
    if (!b.tiles.some(([x, y]) => nearRoute(x, y))) continue; if (x1 < px - 2 || x0 > px + 24) continue; want.push({ kind: 'bed', ref: b, x0, x1, tx: b.tx, ty: b.ty, on: b.hit, fire: false }); }
  for (const c of G.cracks) { if (!c.ring || c.held || c.fireHeld) continue; if (c.x1 < px - 2 || c.x0 > px + 24) continue; want.push({ kind: 'ring', ref: c, x0: c.x0, x1: c.x1, tx: c.ring[0], ty: c.ring[1], on: c.ringHit, fire: true }); }
  if (!want.length) return null;
  want.sort((a, b) => a.x0 - b.x0); const w = want[0];
  if (w.on) { if (w.kind === 'bed' && Math.abs(px - (w.x0 + w.x1) / 2) < (w.x1 - w.x0) / 2 + 5) return { x: P.x, y: P.y, key: null, hold: true, r: 99 }; return null; }
  /* THE PLAN: every notch of up to three mirrors near it, traced */
  const key = w.kind + ':' + w.ref.id;
  if (!mem.plan || mem.plan.key !== key) {
    const opaque = mem.opaque || (mem.opaque = makeOpaque(T, isSlope));
    const ms = G.mirrors.filter(m => Math.abs(m.x - w.tx) <= 40 && (m.shardNotch === undefined)).sort((a, b) => Math.abs(a.x - w.tx) - Math.abs(b.x - w.tx)).slice(0, 3);
    const srcs = (L.sources || []).filter(s => s.kind !== 'gaze' && (w.fire ? s.kind === 'fire' : s.kind !== 'fire'));
    const recv = [{ x: w.tx, y: w.ty }];
    let best = null;
    const n = ms.map(m => m.notches.length), total = n.reduce((a, b) => a * b, 1);
    for (let i = 0; i < total; i++) { let r = i; const pick = ms.map((m, j) => { const v = r % n[j]; r = Math.floor(r / n[j]); return v; });
      const st = ms.map((m, j) => m.notches[pick[j]]);
      const tileAt = (x, y) => { const j = ms.findIndex(m => m.x === x && m.y === y); if (j >= 0 && st[j] === 'sky') return T.SOLID;
        const o = G.mirrors.find(m => m.x === x && m.y === y && !ms.includes(m)); if (o && o.state === 'sky') return T.SOLID; return L.grid[y * L.W + x]; };
      const mir = [...ms.map((m, j) => ({ x: m.x, y: m.y, state: st[j] })), ...G.mirrors.filter(m => !ms.includes(m) && m.state !== 'sky').map(m => ({ x: m.x, y: m.y, state: m.state }))].filter(m => m.state !== 'sky');
      const res = trace(tileAt, srcs, mir, recv, { opaque, W: L.W, H: L.H });
      if (res.hit.size) { const cost = ms.reduce((a, m, j) => a + ((pick[j] - m.n + n[j]) % n[j]), 0); if (!best || cost < best.cost) best = { cost, pick: ms.map((m, j) => ({ id: m.id, n: pick[j] })) }; } }
    mem.plan = { key, best };
  }
  const plan = mem.plan.best; if (!plan) return null;
  for (const q of plan.pick) { const m = G.mirrors.find(z => z.id === q.id); if (!m || m.n === q.n) continue;
    return { x: m.x * TS + 8, y: (m.y + 2) * TS, key: 'talk', face: 0, r: 30 }; }
  return null;
}
/* THE MONASTERY (claude/monastery2, review: "the walker cannot drive vents or wheels, so 88% of the level is unmeasured"): what a player does with
   what the monks built. AN INCENSE BRAZIER the route rises from (a route node over its column, its smoke's height above it): stand in its column and
   wait for its breath - or, cold or spent, strike it (STRIKE THE CENSER). A PRAYER WHEEL whose OTHER stair the route walks: strike it. A BELL whose
   bridge the route crosses and that is not down yet: strike it. Each only on his own floor (within 2 rows) and near (r tiles). */
function spire(BK, P, mem) {
  if (!P || P.dead || !P.ground) return null; const L = BK.L, R = mem.route || [], W = L.W, at = (x, y) => L.grid[y * W + x];
  const ahead = R.filter(([rx, ry]) => Math.abs(rx * TS + 8 - P.x) < 26 * TS && Math.abs(ry * TS - P.y) < 22 * TS);
  for (const v of BK.props()) { if (v.t !== 'vent' || !v.incense || Math.abs(P.y - v.y) > 6 || Math.abs(P.x - v.x) > 7 * TS) continue;
    const vx = Math.floor(v.x / TS), top = (v.y - v.h) / TS, base = v.y / TS;
    if (!ahead.some(([rx, ry]) => Math.abs(rx - vx) <= 5 && ry < base - 3 && ry >= top - 3)) continue;
    if (v.active) return { x: v.x, y: v.y, key: null, hold: true, r: 8 };
    if ((v.snuff || mem.ventWait > 200) && !(v.coolT > 0)) { return { x: v.x - 6, y: v.y, key: 'atk', face: 1, r: 8 }; }
    mem.ventWait = (mem.ventWait || 0) + 1; return { x: v.x, y: v.y, key: null, hold: true, r: 8 }; }
  mem.ventWait = 0;
  for (const w of BK.props()) { if (w.t !== 'pwheel' || Math.abs(P.y - w.y) > 40 || Math.abs(P.x - w.x) > 12 * TS || w.turnT > 0 || w.cool > 0) continue;
    const other = w.st ? w.a : w.b, on = (arm, x, y) => arm.some(([x0, ay, n]) => y === ay && x >= x0 && x < x0 + n);
    const needOther = ahead.some(([rx, ry]) => on(other, rx, ry + 1) || on(other, rx, ry)), needThis = ahead.some(([rx, ry]) => on(w.st ? w.b : w.a, rx, ry + 1));
    if (needOther && !needThis) return { x: w.x - 10, y: w.y, key: 'atk', face: 1, r: 12 }; }
  for (const b of BK.props()) { if (b.t !== 'tbell' || !b.span || b.down || Math.abs(P.y - b.y) > 40 || Math.abs(P.x - b.x) > 12 * TS) continue;
    const [x0, x1, row] = b.span; if (!ahead.some(([rx, ry]) => rx >= x0 && rx <= x1 && Math.abs(ry - row) <= 2)) continue;
    const side = (x0 + x1) / 2 * TS > b.x ? -1 : 1; return { x: b.x + side * 12, y: b.y, key: 'atk', face: -side, r: 12 }; }
  return null;
}
export const WALK_HINTS = { glasssea: glassSea, spire };
