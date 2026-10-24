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
const underleaf = (BK, P) => (BK.potions && BK.potions() ? BK.potions().walkHint(P) : null);   /* (claude/underleaf3) UNDERLEAF 3: the next jar the route needs - fetched, carried to its throw spot, tossed DOWN (src/potion-hands.js walkHint) */
/* THE MONASTERY (claude/monastery2, review: "the walker cannot drive vents or wheels, so 88% of the level is unmeasured"): what a player does with
   what the monks built. AN INCENSE BRAZIER the route rises from (a route node over its column, its smoke's height above it): stand in its column and
   wait for its breath - or, cold or spent, strike it (STRIKE THE CENSER). A PRAYER WHEEL whose OTHER stair the route walks: strike it. A BELL whose
   bridge the route crosses and that is not down yet: strike it. Each only on his own floor (within 2 rows) and near (r tiles). */
function spire(BK, P, mem) {
  if (!P || P.dead) return null; const L = BK.L, R = mem.route || [], W = L.W, at = (x, y) => L.grid[y * W + x];
  const ahead = R.filter(([rx, ry]) => Math.abs(rx * TS + 8 - P.x) < 26 * TS && Math.abs(ry * TS - P.y) < 22 * TS);
  /* RIDING THE SMOKE: in a breathing column, stay in it until the feet are over the landing the route steps off onto, then steer */
  if (!P.ground) { const v = BK.props().find(q => q.t === 'vent' && q.incense && q.active && Math.abs(P.x - q.x) < 14 && P.y <= q.y + 2 && P.y > q.y - q.h);
    if (!v) return null; const vx = Math.floor(v.x / TS), base = v.y / TS, land = ahead.filter(([rx, ry]) => Math.abs(rx - vx) <= 6 && ry < base - 3 && ry >= (v.y - v.h) / TS - 3).reduce((m, [, ry]) => Math.max(m, ry), -1);
    if (land < 0 || P.y < (land + 1) * TS - 18) return null; return { x: v.x, y: P.y, key: null, hold: true, r: 4 }; }
  for (const v of BK.props()) { if (v.t !== 'vent' || !v.incense || Math.abs(P.y - v.y) > 6 || Math.abs(P.x - v.x) > 7 * TS) continue;
    const vx = Math.floor(v.x / TS), top = (v.y - v.h) / TS, base = v.y / TS;
    if (!ahead.some(([rx, ry]) => Math.abs(rx - vx) <= 5 && ry < base - 3 && ry >= top - 3)) continue;
    if (v.active) return { x: v.x, y: v.y, key: null, hold: true, r: 8, at: true };
    if ((v.snuff || mem.ventWait > 200) && !(v.coolT > 0)) { return { x: v.x - 6, y: v.y, key: 'atk', face: 1, r: 8, at: true }; }
    mem.ventWait = (mem.ventWait || 0) + 1; return { x: v.x, y: v.y, key: null, hold: true, r: 8, at: true }; }
  mem.ventWait = 0;
  for (const w of BK.props()) { if (w.t !== 'pwheel' || Math.abs(P.y - w.y) > 40 || Math.abs(P.x - w.x) > 12 * TS || w.turnT > 0 || w.cool > 0) continue;
    const other = w.st ? w.a : w.b, on = (arm, x, y) => arm.some(([x0, ay, n]) => y === ay && x >= x0 && x < x0 + n);
    /* the route's NEXT use of this wheel (from the node nearest him on): on the stair that is not laid - strike it; on the laid one - leave it be */
    const px = P.x / TS, pr = P.y / TS - 1; let ni = 0, nd = 1e9; R.forEach(([rx, ry], i) => { const d = Math.abs(rx - px) + Math.abs(ry - pr); if (d < nd) { nd = d; ni = i; } });
    const next = R.slice(ni, ni + 40).find(([rx, ry]) => on(w.a, rx, ry + 1) || on(w.b, rx, ry + 1));
    if (next && on(other, next[0], next[1] + 1)) return { x: w.x - 10, y: w.y, key: 'atk', face: 1, r: 12, at: true }; }
  for (const b of BK.props()) { if (b.t !== 'tbell' || !b.span || b.down || Math.abs(P.y - b.y) > 40 || Math.abs(P.x - b.x) > 12 * TS) continue;
    const [x0, x1, row] = b.span; if (!ahead.some(([rx, ry]) => rx >= x0 && rx <= x1 && Math.abs(ry - row) <= 2)) continue;
    const side = (x0 + x1) / 2 * TS > b.x ? -1 : 1; return { x: b.x + side * 12, y: b.y, key: 'atk', face: -side, r: 12 }; }
  return null;
}
/* THE UNDERCROWN'S SLABS (claude/undercrown2, src/undercrown-slabs.js): the slabs the way on needs (L.reachSlabs) cut as a player cuts them. A ramp
   slab: the post at the end that must come down (hinge h: the post at -h), struck from outside the span. A bridge (flat): the near post first (rs.first,
   default the east one), then the far one struck from the top of the ramp the first cut made. Only when the post is near and on the hero's floor. */
export function slabHint(BK, P) {
  const L = BK.L; if (!L || !L.reachSlabs || !P) return null;
  const props = BK.props();
  for (const rs of L.reachSlabs) {
    if (rs.optional) continue;   /* (the tithe's ramp is off the way: the walker leaves it) */
    const posts = props.filter(p => p.t === 'timber' && p.slab && p.slab.id === rs.slab); if (!posts.length) continue; const sb = posts[0].slab;
    if (sb.state !== 'up' && !(rs.flat && sb.state === 'ramp')) continue;
    let post, stand, face;
    if (sb.state === 'up') { const end = rs.flat ? (rs.first || 1) : -rs.hinge; post = posts.find(p => p.end === end && !p.broken); if (!post) continue; face = -end; stand = post.x + end * 13; }
    else { post = posts.find(p => !p.broken); if (!post) continue; face = post.end; stand = post.x - post.end * 22; }
    if (Math.abs(stand - P.x) > 14 * TS || Math.abs(post.y - P.y) > (sb.state === 'ramp' ? 12 : 3) * TS) continue;
    return { x: stand, y: sb.state === 'ramp' ? sb.row * TS : post.y, key: 'atk', face, r: 14 };   /* (from the ramp, his feet are at its top) */
  }
  return null;
}
/* THE FLOTILLA 2 (claude/flotilla2): THE POWDER SHIP's copper doors and its crate hatch open only to a deck gun's round shot. Ahead of the walker on his deck,
   a shut door (or a keg on the crate hatch) with a gun laid at it from the west: stand at the gun's breech, face down its line, strike (the ranger: DOWN+X, her knife's
   low sweep). A gun still hot: wait at it. */
function flotilla(BK, P, mem) {
  if (!P || !BK.props) return null; const pr = BK.props(), L = BK.L, near = (a, b) => Math.abs(a - b) < 40;
  const tgt = pr.filter(q => ((q.t === 'bulkhead' && !q.open) || (q.t === 'keg' && !q.gone && L.grid[Math.floor(q.y / TS) * L.W + Math.floor(q.x / TS)] === 4)) && q.x > P.x - 16 && q.x < P.x + 30 * TS && near(q.y, P.y)).sort((a, b) => a.x - b.x)[0];
  if (!tgt) return null;
  const gun = pr.filter(q => q.t === 'cannon' && q.deck && (q.aim || 1) === 1 && q.x < tgt.x && tgt.x - q.x < 24 * TS && near(q.y, tgt.y) && !pr.some(d => d.t === 'bulkhead' && !d.open && d !== tgt && d.x > q.x && d.x < tgt.x)).sort((a, b) => b.x - a.x)[0];
  if (!gun) return null;
  if (gun.cool > 0) return { x: gun.x - 14, y: gun.y, key: null, face: 1, r: 20, hold: true };
  return { x: gun.x - 14, y: gun.y, key: 'atk', face: 1, r: 20 };
}
/* THE STOCKADE 2 (claude/stockade2, src/stockade-hands.js): the barred gate opens only to the goblins' own horn. The walker takes the dozing blower's horn
   (it falls at his feet, on the walk: walking over it takes it) and blows it (E) in the yard before the gate; a fallen horn off the walk is walked to */
function stockade(BK, P) {
  /* ITS TWO PULLEY LIFTS ride toward the far stop only while you stand on them: on one, a player stands still until it is there (the hands jumped for the
     route's next tile eight rows up and stepped off it - the walker was STUCK at the first lift on master too) */
  const m = P && P.onMover; if (m && m.kind === 'lift' && m.y1 !== undefined && Math.abs(m.y - m.y1) > 3) return { x: P.x, y: P.y, key: null, hold: true, r: 99 };
  /* ITS THREE CRANKS: a crank just ahead on his floor, its gate still standing, is struck open (the hands walked past the third and jumped at its palisade) */
  const cr = P && (BK.props() || []).find(o => o.t === 'crank' && !o.open && o.x > P.x - 20 && o.x - P.x < 5 * TS && Math.abs(o.y - P.y) < 24);
  if (cr) return { x: cr.x - 12, y: P.y, key: 'atk', face: 1, r: 6 };
  const S = BK.stockade ? BK.stockade() : null; if (!S || !P || S.gateOpen) return null;
  if (!S.held) { const k = (S.pickups || []).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; return k ? { x: k.x, y: k.y, key: null, face: 0, r: 14 } : null; }
  const gx = 483 * TS + 8; if (P.x < 466 * TS || P.x > 487 * TS) return null;
  return { x: gx, y: 20 * TS, key: 'talk', face: 1, r: 18 };
}
/* THE LUMBER TRAIL (claude/lumbertrail, src/felling.js): a MARKED pine ahead on his floor that is not down yet - stand at its stump on the near side, face the way it
   leans, strike (four strokes; the ranger's tap is an arrow into the trunk). A player fells the trail's pines as he meets them: the bridges and the lean-to are the way on, the
   drop is a blow on the crew under it. Out from under a drop's line first (it comes down on whoever stands there). */
function lumberTrail(BK, P) {
  if (!P || P.dead || !BK.props) return null;
  /* THE LOG RAFT (the first ride): a player waits on the landing stone for the raft, steps on, stands still while it drifts, and steps off at the far bank */
  const raft = BK.movers && BK.movers().find(m => !m.kind && !m.vert && m.range > 0 && m.w >= 3 * TS && m.y0 === 22 * TS && Math.abs(m.x0 - 130 * TS) < 2);
  if (raft) { const far = raft.x + raft.w >= 147 * TS - 1, near = raft.x <= 130 * TS + 1;   /* (its run: flush with the landing stone at one end and the far bank at the other) */
    if (P.onMover === raft) return raft.x + raft.w >= 145 * TS ? null : { x: P.x, y: P.y, key: null, r: 99, at: true, hold: true };   /* (on it: stand still - the play bot leaps off any mover with no tile ahead - until the far bank is a hop away, then the bot's own leap takes him onto it) */
    if ((P.ground || P.onMover) && !P.swim && P.x >= 126 * TS && P.x < 130 * TS && Math.abs(P.y - 22 * TS) < 6) return near ? { x: raft.x + 12, y: raft.y, key: null, face: 1, r: 8, at: true, hold: true } : { x: 128 * TS + 8, y: 22 * TS, key: null, hold: true, r: 8 }; }   /* (at: walked on, never jumped) */
  /* IN THE TARN (a badger's charge throws you off the trunk): swim back to the stone at the near side and climb out, as the stall nudge says */
  if (P.x > 417 * TS && P.x < 429 * TS && P.y > 15 * TS && P.y < 24 * TS) return { x: 418 * TS + 4, y: P.y, key: 'jump', face: -1, r: 30 };
  const tree = BK.props().filter(q => q.t === 'felltree' && q.mark && !q.felled && q.fall <= 0 && Math.abs(q.y - P.y) < 3 * TS && q.x > P.x - 3 * TS && q.x < P.x + 16 * TS).sort((a, b) => a.x - b.x)[0];
  if (!tree) return null;
  return { x: tree.x - tree.dir * 12, y: tree.y, key: 'atk', face: tree.dir, r: 16 };
}
/* MARSH WOOD 3's BOOM (claude/marsh3, src/marsh3.js): the current raft stops at the log boom. A player steps over it, hops the pads to the lever on its stilt deck,
   strikes it, hops back and rides her on (the open water past the lever is the raft's alone). On her while she moves: stand. */
function marshBoom(BK, P) {
  if (!P || P.dead || !BK.props || !BK.movers) return null;
  const lv = BK.props().find(q => q.t === 'lever' && q.openColumn); if (!lv) return null;
  const bx = lv.openColumn[0] * TS, raft = BK.movers().find(m => m.kind === 'raft' && m.current && m.x0 < bx && m.x1 + m.w > bx); if (!raft) return null;
  if (P.onMover === raft) { if (!lv.on && raft.blocked) return { x: lv.x - 12, y: lv.y, key: 'atk', face: 1, r: 40 }; return raft.moving ? { x: P.x, y: P.y, key: null, r: 99, at: true, hold: true } : null; }
  if (raft.done || P.x < raft.x - 2 * TS || P.x > lv.x + 3 * TS) return null;
  if (!lv.on) return { x: lv.x - 12, y: lv.y, key: 'atk', face: 1, r: 40 };
  return { x: raft.x + raft.w / 2, y: raft.y, key: null, face: -1, r: 40, at: true };
}
/* THE FEN ROAD 2 (claude/fenroad2, src/fen-planks.js + src/fen-road-hands.js): LAY THE ROAD. The next required peat hole ahead: with no plank on his shoulder he walks to the
   crew's bundle before it and presses E; with one, to the hole's near edge, faces it and presses E (it lays). A BOG LEECH on him: he rolls (a player reads the drain and the hint) */
function fenRoad(BK, P) {
  if (!P || typeof BK.fenPlanks !== 'function') return null; const F = BK.fenPlanks(), R = BK.fenRoad ? BK.fenRoad() : null; if (!F || !R || !R.broken) return null;
  if (P.leech) return { x: P.x, y: P.y, key: 'dodge', face: P.face || 1, r: 99 };
  const px = P.x / TS, h = R.broken.filter(b => b.req && !b.laid && b.x0 + b.w > px && b.x0 < px + 30).sort((a, b) => a.x0 - b.x0)[0]; if (!h) return null;
  if (!F.held) { const b = F.bundles.filter(q => q.x < h.x0 * TS && q.x > (h.x0 - 30) * TS).sort((a, c) => c.x - a.x)[0]; return b ? { x: b.x, y: b.y, key: 'talk', face: 1, r: 30 } : null; }
  return { x: h.x0 * TS - 6, y: h.row * TS, key: 'talk', face: 1, r: 30 };
}
/* THE HORNET'S NEST (claude/hornetsnest, src/hornets-nest-hands.js): the next required comb ahead - stand under it on his own footing and cut it (a RISING CUT: UP+X
   reaches a comb hung three rows over the footing); a chain's high comb from the low one's landed top (the walker climbs onto it as the route says) */
function hornetsNest(BK, P) {
  if (!P || typeof BK.nestHands !== 'function') return null; const H = BK.nestHands(); if (!H || !H.on()) return null;
  const px = P.x / TS, feet = Math.round(P.y / TS), need = ['first', 'bridge', 'chainA', 'chainB', 'lastA', 'lastB'];
  const c = H.combs().filter(q => q.st === 'hang' && need.includes(q.id) && q.x1 >= px - 6 && q.x0 <= px + 18 && feet - (q.row + q.rows) >= 2 && feet - (q.row + q.rows) <= 4).sort((a, b) => a.x0 - b.x0)[0];
  if (!c) return null; const mid = c.x0 * TS + 8;   /* under its near (west) end: a bridge comb hangs over the gap it spans, so its middle has no footing under it */
  return { x: mid, y: P.y, key: 'atk', up: true, face: 1, r: 14 };
}
/* SPOREWOOD 2 (claude/sporewood2): the level's own hands say it (src/sporewood-hands.js walkHint) - a dark bud's lantern cap, an unstruck seed cap, a web across the way */
const sporewood = (BK, P, mem) => { const S = BK.sporewood ? BK.sporewood() : null; return S && S.on() && S.walkHint ? S.walkHint(P, mem && mem.route) : null; };
export const WALK_HINTS = { hornetsnest: hornetsNest, spore: sporewood, stockade, glasssea: glassSea, underleaf, spire, undercrown: slabHint, flotilla, wood: lumberTrail, marsh: marshBoom, fenroad: fenRoad };
