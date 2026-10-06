// src/canal-rig.js - THE FOG CANAL's machinery (claude/canal, the greybox). Pure: no DOM, no globals.
// src/fog-canal.js builds the level and hands its machinery here as data (L.canal); src/canal-hands.js runs it against the live
// game (the grid, the hero, the foes) and draws it; tools/canal.mjs drives these steps headless and through the page.
// Brief: docs/briefs/fog-canal.md.
//
// THE FOUR MACHINES (each TAUGHT, DEVELOPED, TWISTED and EXAMINED in the level, and each the LOCK somewhere):
//   THE BARGE        a hull on the water with a lantern on a pole at its stern. It floats on whatever REACH (a pound or a lock chamber) is
//                    under its middle, so a lock that fills lifts it. It drifts downstream while a hero is aboard or somewhere ahead of it
//                    (never away from a hero it has left behind), and it stops at a shut lock gate, at a swing bridge that stands across
//                    the water (its lantern pole will not pass under one), and at the edge of THICK fog. (claude/canal4, Daniel 10-05: the
//                    weir run is gone.) IN THE LEGGING TUNNEL there is no current: she goes only while a rider LEGS her (lies on her deck -
//                    DOWN held - and walks her along the walls), quicker with her LANTERN lit (you see the way) than dimmed (you leg her
//                    blind); she stops at STOP-PLANKS dropped across the tunnel until their WINDLASS lifts them. Her TILLER (struck) keeps
//                    her to one side of a wide pound (the Waymeet pound).
//   THE LOCK GATES   a reach's water level moves toward the level its SLUICE last asked for. A gate between two reaches stands OPEN
//                    only while the two stand level: a lock you fill closes the gate below it as it rises, and opens the one above when
//                    it gets there. A gate never shuts on the barge or on a body in its doorway (the water waits for it).
//   THE FOG          zones of fog; a THICK one stops the barge. What stands in a lantern's light (a post's, or the barge's own) is SEEN:
//                    in the fog the archers loose only at a lit hero, and only a lit grindylow shows more than its ripples. A FOGHORN
//                    clears its fog for a while (then it rolls back) and must wind up again before it sounds twice.
//                    A lantern post struck is DOUSED (struck again, lit): dark is where the archers cannot see you.
//   THE SWING BRIDGE a deck that stands across the water (walk it) or swung clear (the barge passes): never both.
//   HER LANTERN      (claude/canal4) in the tunnel it is struck to DIM it and struck again to LIGHT it: lit, she lights her deck (litAt) and
//                    draws the brood (grindylows come aboard, wisps come for her); dimmed, nothing sees her - and you leg her blind.
export const TS = 16;
export const RIG = {
  fill: 34,            /* px/s a lock's water moves (a five-row lock is about two and a half seconds) */
  drift: 72,           /* px/s the barge drifts (the hero runs 92: he can always get ahead of it and wait). claude/canalfix: 55 -> 72, the rides were long (review fix 12) */
  leg: 56,             /* (claude/canal4) px/s a rider LEGS her through the tunnel with her lantern lit (he sees the walls) */
  legDark: 32,         /* px/s with it dimmed: he legs her blind, feeling for the wall */
  stopLift: 1.2,       /* s the stop-planks take to wind up out of the water */
  carryR: 64,          /* px a LAMPLIGHTER's own lantern lights round him (claude/canalfix: the kill-first support) */
  deck: 6,             /* px the deck stands over the water */
  bargeW: 96, bargeH: 10,
  mast: 36,            /* px the lantern pole stands over the deck: why a swing bridge across the water holds the barge */
  swing: 0.9,          /* s a swing bridge takes to turn */
  hornClear: 9,        /* s a foghorn's fog stays clear */
  weedHold: 2.5,       /* s BRIGHT blanket weed holds a hero standing on it before it gives way (Jenny's weed, claude/lockkeeper's number) */
  weedBack: 4,         /* s before it knits together again, with nobody in it */
  hornFade: 1.4,       /* s the fog takes to roll back (or away) */
  hornWind: 10,        /* s a horn takes to wind up again */
  postR: 58,           /* px a lantern post lights */
  bargeR: 76,          /* px the barge's own lantern lights, round its stern pole */
  weedSlow: 0.3,       /* a swimmer in weed-choked water keeps this share of his way */
  weedDmg: 5,          /* health a second the weed takes from a swimmer caught in it */
  wadeBack: 1.0,       /* (claude/canalfix3) s a hero is left wading in a hand-back pool before the canal hands him back */
  wadeBite: 10,        /* and what it bites */
};
export const surfaceY = row => row * TS + 4;
export const deckOf = surf => surf - RIG.deck;

/* ---------------- THE STATE, from the level's data ---------------- */
export function newCanal(D) {
  const st = {
    reaches: D.reaches.map(r => { const y = surfaceY(r.init === 'hi' ? r.hi : r.lo); return { ...r, y, to: y }; }),
    gates: D.gates.map(g => ({ ...g, open: false, burst: false })),
    bridges: D.bridges.map(b => ({ ...b, across: b.init !== 'open', k: b.init === 'open' ? 1 : 0 })),
    fogs: D.fogs.map(f => ({ ...f, clear: 0, fade: 1 })),
    horns: [], posts: [],
    stops: (D.stops || []).map(q => ({ ...q, up: false, k: 0 })),   /* (claude/canal4) the tunnel's stop-planks: k 0 down (they hold her), 1 wound up */
    tunnels: D.tunnels || [], lamp: true, leg: 0,   /* her lantern (dimmed only in a tunnel), and how fast a rider legs her this frame (src/canal-hands.js sets it) */
    barge: null, clock: 0,
  };
  st.barge = newBarge(st, D.barge.x * TS, D.barge.helm || 'weir');
  gatesSettle(st);
  return st;
}
export function newBarge(st, x, helm = 'weir') {
  const b = { x, w: RIG.bargeW, h: RIG.bargeH, y: 0, reach: 0, mode: 'float', helm, v: 0 };
  b.reach = reachAt(st, x + b.w / 2); b.y = deckOf(st.reaches[b.reach].y); return b;
}
/* the reach under px: the one whose columns hold it, or - in a gate's own column between two reaches, or past the last - the nearest one upstream */
export const reachAt = (st, px) => { let best = 0; for (let i = 0; i < st.reaches.length; i++) { const r = st.reaches[i]; if (px >= r.x0 * TS && px < (r.x1 + 1) * TS) return i; if (r.x0 * TS <= px) best = i; } return best; };
export const reachById = (st, id) => st.reaches.find(r => r.id === id);

/* ---------------- THE LOCKS ---------------- */
/* a gate is open while the reaches either side of it stand level (or it has burst) */
export const levelled = (st, g) => Math.abs(st.reaches[g.a].y - st.reaches[g.b].y) < 1;
export function gatesSettle(st) { const ev = []; for (const g of st.gates) { const o = levelled(st, g); if (o !== g.open) { g.open = o; ev.push({ t: o ? 'open' : 'shut', g }); } } return ev; }
/* a sluice struck: its reach goes for the other level (full if it was going empty, empty if full) */
export function strikeSluice(st, reachId) {
  const r = reachById(st, reachId); if (!r) return null;
  const lo = surfaceY(r.lo), hi = surfaceY(r.hi); r.to = Math.abs(r.to - hi) < 1 ? lo : hi; return r.to === hi ? 'fill' : 'drain';
}
/* one frame of the water. busy(g) says a body stands in an open gate's doorway: the reaches either side of it wait */
export function lockStep(st, dt, busy = () => false) {
  const ev = [];
  for (let i = 0; i < st.reaches.length; i++) { const r = st.reaches[i]; if (Math.abs(r.to - r.y) < 0.01) continue;
    const held = st.gates.some(g => g.open && (g.a === i || g.b === i) && busy(g));
    if (held) { if (!r.held) ev.push({ t: 'held', r }); r.held = true; continue; }
    r.held = false; const d = r.to - r.y, step = Math.sign(d) * Math.min(Math.abs(d), (r.rate || RIG.fill) * dt); r.y += step;   /* (claude/canal4: a reach may carry its own pace - the deep lock) */
    if (Math.abs(r.to - r.y) < 0.01) { r.y = r.to; ev.push({ t: 'still', r }); } }
  return ev.concat(gatesSettle(st));
}

/* ---------------- THE SWING BRIDGES ---------------- */
export const bridgeHolds = b => b.k < 0.5;   /* standing across the water (walkable, and it holds the barge) */
export function strikeBridge(b) { b.across = !b.across; return b.across ? 'across' : 'open'; }
export function bridgeStep(b, dt) { const want = b.across ? 0 : 1, was = bridgeHolds(b); b.k += Math.sign(want - b.k) * Math.min(Math.abs(want - b.k), dt / RIG.swing); return bridgeHolds(b) !== was ? (bridgeHolds(b) ? 'across' : 'open') : null; }

/* ---------------- THE FOG AND THE HORNS ---------------- */
export const fogAt = (st, x, y) => st.fogs.filter(f => x >= f.x0 * TS && x < (f.x1 + 1) * TS && y >= f.y0 * TS && y < (f.y1 + 1) * TS);
export const fogThickAhead = (f) => f.thick && f.fade > 0.35;   /* a thick bank the barge will not go into (it is clear enough once the horn has it two-thirds gone) */
export function blowHorn(st, h) {
  if (h.cd > 0) return false;
  for (const f of st.fogs) if (h.fogs.includes(f.id)) f.clear = h.clear || RIG.hornClear;   /* a horn may carry its own clear (claude/canalfix: the fog wall's bank horn is short, the basin's 6.5 s) */
  h.cd = RIG.hornWind; return true;
}
export function fogStep(st, dt) {
  const ev = [];
  for (const f of st.fogs) { const was = f.clear > 0; if (f.clear > 0) f.clear = Math.max(0, f.clear - dt); const want = f.clear > 0 ? 0 : 1;
    f.fade += Math.sign(want - f.fade) * Math.min(Math.abs(want - f.fade), dt / RIG.hornFade); if (was && f.clear <= 0) ev.push({ t: 'rollback', f }); }
  for (const h of st.horns) if (h.cd > 0) h.cd = Math.max(0, h.cd - dt);
  return ev;
}
/* IS (x, y) LIT: out of the fog, in a fog the horn has cleared, or in a lantern's light (a lit post's, or the barge's own) */
export function litAt(st, x, y) {
  const fz = fogAt(st, x, y); if (!fz.length || fz.every(f => f.fade < 0.3)) return true;
  for (const p of st.posts) if (p.lit && Math.hypot(p.x - x, p.y - 16 - y) < RIG.postR) return true;
  const b = st.barge; if (b && lampLit(st) && Math.hypot(b.x + 10 - x, b.y - 24 - y) < RIG.bargeR) return true;   /* (claude/canal4: dimmed in the tunnel, her lantern lights nobody) */
  for (const c of st.carriers || []) if (Math.hypot(c.x - x, c.y - 20 - y) < RIG.carryR) return true;   /* a LAMPLIGHTER's lantern */
  return false;
}
export const strikePost = p => { p.lit = !p.lit; return p.lit; };

/* ---------------- THE BARGE ---------------- */
/* where the barge must stop, moving right from front px `front`: the first shut gate, bridge across, or thick fog wall ahead */
export function bargeStop(st, front) {
  let stop = Infinity, why = null;
  for (const g of st.gates) { const gx = g.x * TS; if (gx >= front - 2 && !g.open && gx < stop) { stop = gx; why = 'gate'; } }
  for (const q of st.stops || []) { const qx = q.x * TS; if (qx >= front - 2 && q.k < 0.5 && qx < stop) { stop = qx; why = 'stop'; } }   /* (claude/canal4) stop-planks across the tunnel */
  for (const b of st.bridges) { const bx = b.x0 * TS; if (bx >= front - 2 && bridgeHolds(b) && bx < stop) { stop = bx; why = 'bridge'; } }
  for (const f of st.fogs) { const fx = f.x0 * TS; if (fogThickAhead(f) && fx >= front - 2 && fx < stop && f.y0 * TS < st.barge.y && (f.y1 + 1) * TS > st.barge.y) { stop = fx; why = 'fog'; } }
  const last = st.reaches[st.reaches.length - 1], end = (last.x1 + 1) * TS; if (end < stop) { stop = end; why = 'end'; }
  return { stop, why };
}
/* inside a thick bank the horn has let go of (her bow in it): she stops where she is */
export const bargeFogged = (st) => { const b = st.barge, fx = b.x + b.w; return st.fogs.some(f => fogThickAhead(f) && fx > f.x0 * TS + 2 && fx < (f.x1 + 1) * TS && f.y0 * TS < b.y && (f.y1 + 1) * TS > b.y); };   /* her bow in the bank: once her bow is out of it, she sees her way on */
/* (claude/canal4) IN A TUNNEL: px inside one of D.tunnels [x0, x1] (columns) - no current there */
export const tunnelAt = (st, px) => (st.tunnels || []).some(([x0, x1]) => px >= x0 * TS && px < (x1 + 1) * TS);
export const inTunnel = st => !!st && !!st.barge && tunnelAt(st, st.barge.x + st.barge.w / 2);
/* HER LANTERN: lit, unless she is in a tunnel with it dimmed */
export const lampLit = st => st.lamp !== false || !inTunnel(st);
/* one frame of the barge while it floats. go: a hero is aboard or somewhere ahead of her. In a tunnel go is not enough: she moves at st.leg px/s
   (a rider legging her) and nothing else moves her. Returns events (hold) */
export function bargeStep(st, dt, go) {
  const b = st.barge, ev = [];
  if (b.mode !== 'float') return ev;
  const x0 = b.x, tun = inTunnel(st), speed = tun ? (st.leg || 0) : RIG.drift; if (tun) go = speed > 0;
  if (go && !bargeFogged(st)) {
    const { stop, why } = bargeStop(st, b.x + b.w), want = Math.min(b.x + speed * dt, stop - b.w - 1);
    if (want > b.x) b.x = want;
    else if (why && b.holdWhy !== why) { b.holdWhy = why; ev.push({ t: 'hold', why }); }
  } else if (go && bargeFogged(st) && b.holdWhy !== 'fog') { b.holdWhy = 'fog'; ev.push({ t: 'hold', why: 'fog' }); }
  if (b.x !== x0) b.holdWhy = null;
  b.v = (b.x - x0) / Math.max(dt, 1e-6);
  b.reach = reachAt(st, b.x + b.w / 2); b.y = deckOf(st.reaches[b.reach].y);
  return ev;
}

/* ---------------- (claude/canal4) THE LEGGING TUNNEL: the stop-planks and her lantern ---------------- */
/* a windlass struck: its stop-planks wind up out of the water (once: they stay up) */
export function strikeStop(q) { if (q.up) return false; q.up = true; return true; }
/* one frame of the planks: 'up' the moment they clear her way (k past a half) */
export function stopStep(q, dt) { const was = q.k < 0.5; if (q.up) q.k = Math.min(1, q.k + dt / RIG.stopLift); return was && q.k >= 0.5 ? 'up' : null; }
/* her lantern struck (it dims only in a tunnel: outside one it always burns) */
export const strikeLamp = st => { st.lamp = !(st.lamp !== false); return st.lamp; };
/* THE TILLER: her helm, the side of a wide pound she keeps to (the Waymeet pound) */
export const strikeTiller = b => { b.helm = b.helm === 'cut' ? 'weir' : 'cut'; return b.helm; };
export const tillerOpen = st => !!st.barge && st.barge.mode === 'float';
/* HER SIDE (claude/canalfix, UPGRADE B - the tiller taught before the weir): where D.sides marks a pound wide enough, her helm puts her on the
   TOWPATH SIDE ('weir', the arrow down: in reach of the towpath's hooks) or the OFFSIDE ('cut', the arrow up: out of their reach, under the far
   half of a low bridge's timbers). Returns 'towpath' | 'off' | null (no sides here) */
export const sideOf = (st, D) => { const b = st.barge; if (!b || b.mode !== 'float') return null; const mid = b.x + b.w / 2;
  for (const [x0, x1] of (D && D.sides) || []) if (mid >= x0 * TS && mid < (x1 + 1) * TS) return b.helm === 'cut' ? 'off' : 'towpath';
  return null; };

/* ---------------- THE WEED ---------------- */
export const inWeed = (D, st, x, y) => (D.weedWater || []).some(([x0, x1, id]) => { const r = reachById(st, id); return r && x >= x0 * TS && x < (x1 + 1) * TS && y > r.y + 6 && y < r.bed * TS + 4; });

/* ---------------- WHAT THE LEVEL SAYS IT IS (for the check and the brief) ---------------- */
export const MACHINES = ['barge', 'lock', 'fog', 'bridge', 'tunnel'];   /* (claude/canal4: THE LEGGING TUNNEL - legging and her lantern) */
