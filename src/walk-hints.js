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
/* UNDERLEAF (claude/underleaf2, src/hush-hands.js walkHint): the one required throw - a pot from the school roof's chimney stack, lobbed (UP) at the
   bell-cote's nail, and the bone key that falls */
const underleaf = (BK, P) => (BK.hushHands && BK.hushHands() ? BK.hushHands().walkHint(P) : null);
export const WALK_HINTS = { glasssea: glassSea, underleaf };
