// src/canal-rig.js - THE FOG CANAL's machinery (claude/canal, the greybox). Pure: no DOM, no globals.
// src/fog-canal.js builds the level and hands its machinery here as data (L.canal); src/canal-hands.js runs it against the live
// game (the grid, the hero, the foes) and draws it; tools/canal.mjs drives these steps headless and through the page.
// Brief: docs/briefs/fog-canal.md.
//
// THE FOUR MACHINES (each TAUGHT, DEVELOPED, TWISTED and EXAMINED in the level, and each the LOCK somewhere):
//   THE BARGE        a hull on the water with a lantern on a pole at its stern. It floats on whatever REACH (a pound or a lock chamber) is
//                    under its middle, so a lock that fills lifts it. It drifts downstream while a hero is aboard or somewhere ahead of it
//                    (never away from a hero it has left behind), and it stops at a shut lock gate, at a swing bridge that stands across
//                    the water (its lantern pole will not pass under one), and at the edge of THICK fog. At the weir it runs LOOSE along
//                    a path of its own, and its TILLER (struck) sets which way it takes at the junction.
//   THE LOCK GATES   a reach's water level moves toward the level its SLUICE last asked for. A gate between two reaches stands OPEN
//                    only while the two stand level: a lock you fill closes the gate below it as it rises, and opens the one above when
//                    it gets there. A gate never shuts on the barge or on a body in its doorway (the water waits for it).
//   THE FOG          zones of fog; a THICK one stops the barge. What stands in a lantern's light (a post's, or the barge's own) is SEEN:
//                    in the fog the archers loose only at a lit hero, and only a lit grindylow shows more than its ripples. A FOGHORN
//                    clears its fog for a while (then it rolls back) and must wind up again before it sounds twice.
//                    A lantern post struck is DOUSED (struck again, lit): dark is where the archers cannot see you.
//   THE SWING BRIDGE a deck that stands across the water (walk it) or swung clear (the barge passes): never both.
export const TS = 16;
export const RIG = {
  fill: 34,            /* px/s a lock's water moves (a five-row lock is about two and a half seconds) */
  drift: 55,           /* px/s the barge drifts (the hero runs 92: he can always get ahead of it and wait) */
  loose: 88,           /* px/s the barge runs down the weir, loose */
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
  crash: 22,           /* the broken weir: what the plunge does to a hero standing on the deck when she lands */
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
    barge: null, weir: D.weir ? { ...D.weir } : null, clock: 0,
  };
  st.barge = newBarge(st, D.barge.x * TS, D.barge.helm || 'weir');
  gatesSettle(st);
  return st;
}
export function newBarge(st, x, helm = 'weir') {
  const b = { x, w: RIG.bargeW, h: RIG.bargeH, y: 0, reach: 0, mode: 'float', helm, v: 0, crashed: false, runT: 0 };
  b.reach = reachAt(st, x + b.w / 2); b.y = deckOf(st.reaches[b.reach].y); return b;
}
/* the reach under px: the one whose columns hold it, or - in a gate's own column between two reaches, or past the last - the nearest one upstream */
export const reachAt = (st, px) => { let best = 0; for (let i = 0; i < st.reaches.length; i++) { const r = st.reaches[i]; if (px >= r.x0 * TS && px < (r.x1 + 1) * TS) return i; if (r.x0 * TS <= px) best = i; } return best; };
export const reachById = (st, id) => st.reaches.find(r => r.id === id);

/* ---------------- THE LOCKS ---------------- */
/* a gate is open while the reaches either side of it stand level (or it has burst) */
export const levelled = (st, g) => Math.abs(st.reaches[g.a].y - st.reaches[g.b].y) < 1;
export function gatesSettle(st) { const ev = []; for (const g of st.gates) { const o = g.burst || (!g.weir && levelled(st, g));   /* the weir gate holds the summit back until she bursts it */ if (o !== g.open) { g.open = o; ev.push({ t: o ? 'open' : 'shut', g }); } } return ev; }
/* a sluice struck: its reach goes for the other level (full if it was going empty, empty if full) */
export function strikeSluice(st, reachId) {
  const r = reachById(st, reachId); if (!r) return null;
  const lo = surfaceY(r.lo), hi = surfaceY(r.hi); r.to = Math.abs(r.to - hi) < 1 ? lo : hi; return r.to === hi ? 'fill' : 'drain';
}
/* one frame of the water. busy(g) says a body stands in an open gate's doorway: the reaches either side of it wait */
export function lockStep(st, dt, busy = () => false) {
  const ev = [];
  for (let i = 0; i < st.reaches.length; i++) { const r = st.reaches[i]; if (Math.abs(r.to - r.y) < 0.01) continue;
    const held = st.gates.some(g => g.open && !g.burst && (g.a === i || g.b === i) && busy(g));
    if (held) { if (!r.held) ev.push({ t: 'held', r }); r.held = true; continue; }
    r.held = false; const d = r.to - r.y, step = Math.sign(d) * Math.min(Math.abs(d), RIG.fill * dt); r.y += step;
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
  for (const f of st.fogs) if (h.fogs.includes(f.id)) f.clear = RIG.hornClear;
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
  const b = st.barge; if (b && Math.hypot(b.x + 10 - x, b.y - 24 - y) < RIG.bargeR) return true;
  return false;
}
export const strikePost = p => { p.lit = !p.lit; return p.lit; };

/* ---------------- THE BARGE ---------------- */
/* where the barge must stop, moving right from front px `front`: the first shut gate, bridge across, or thick fog wall ahead */
export function bargeStop(st, front) {
  let stop = Infinity, why = null;
  for (const g of st.gates) { const gx = g.x * TS; if (gx >= front - 2 && !g.open && !g.burst && gx < stop) { stop = gx; why = g.weir ? 'weir' : 'gate'; } }
  for (const b of st.bridges) { const bx = b.x0 * TS; if (bx >= front - 2 && bridgeHolds(b) && bx < stop) { stop = bx; why = 'bridge'; } }
  for (const f of st.fogs) { const fx = f.x0 * TS; if (fogThickAhead(f) && fx >= front - 2 && fx < stop && f.y0 * TS < st.barge.y && (f.y1 + 1) * TS > st.barge.y) { stop = fx; why = 'fog'; } }
  const last = st.reaches[st.reaches.length - 1], end = (last.x1 + 1) * TS; if (end < stop) { stop = end; why = 'end'; }
  return { stop, why };
}
/* inside a thick bank the horn has let go of (her bow in it): she stops where she is */
export const bargeFogged = (st) => { const b = st.barge, fx = b.x + b.w; return st.fogs.some(f => fogThickAhead(f) && fx > f.x0 * TS + 2 && fx < (f.x1 + 1) * TS && f.y0 * TS < b.y && (f.y1 + 1) * TS > b.y); };   /* her bow in the bank: once her bow is out of it, she sees her way on */
/* one frame of the barge while it floats. go: a hero is aboard or somewhere ahead of her. Returns events (hold, burst, move) */
export function bargeStep(st, dt, go) {
  const b = st.barge, ev = [];
  if (b.mode === 'loose') return weirStep(st, dt);
  if (b.mode !== 'float') return ev;
  const x0 = b.x;
  if (go && !bargeFogged(st)) {
    const { stop, why } = bargeStop(st, b.x + b.w), want = Math.min(b.x + RIG.drift * dt, stop - b.w - 1);
    if (want > b.x) b.x = want;
    else if (why && b.holdWhy !== why) { b.holdWhy = why; ev.push({ t: 'hold', why }); }
    if (why === 'weir' && b.x + b.w >= stop - 2) { const g = st.gates.find(q => q.weir); if (g && !g.burst) { g.burst = true; g.open = true; b.mode = 'loose'; b.runT = 0; ev.push({ t: 'burst', g }); } }
  } else if (go && bargeFogged(st) && b.holdWhy !== 'fog') { b.holdWhy = 'fog'; ev.push({ t: 'hold', why: 'fog' }); }
  if (b.x !== x0) b.holdWhy = null;
  b.v = (b.x - x0) / Math.max(dt, 1e-6);
  b.reach = reachAt(st, b.x + b.w / 2); b.y = deckOf(st.reaches[b.reach].y);
  return ev;
}

/* ---------------- THE WEIR RUN ---------------- */
/* the path she follows loose: the head race, then the cut or the weir by her helm at the junction. A path is [[x, deckY], ...] in px, x rising */
export const weirPath = (W, helm) => W.head.concat((helm === 'cut' ? W.cut : W.fall).filter(p => p[0] > W.head[W.head.length - 1][0]));
export function pathY(path, x) {
  if (x <= path[0][0]) return path[0][1];
  for (let i = 1; i < path.length; i++) if (x <= path[i][0]) { const [x0, y0] = path[i - 1], [x1, y1] = path[i]; return y0 + (y1 - y0) * (x - x0) / Math.max(1e-6, x1 - x0); }
  return path[path.length - 1][1];
}
export function weirStep(st, dt) {
  const b = st.barge, W = st.weir, ev = []; if (!W) return ev;
  b.runT += dt;
  if (!b.chosen && b.x + b.w / 2 >= W.junction) { b.chosen = b.helm; ev.push({ t: 'junction', helm: b.helm }); }
  const path = weirPath(W, b.chosen || b.helm), x0 = b.x;
  b.x += RIG.loose * dt; const y0 = b.y; b.y = pathY(path, b.x + b.w / 2);
  b.v = (b.x - x0) / Math.max(dt, 1e-6); b.vy = (b.y - y0) / Math.max(dt, 1e-6);
  if ((b.chosen || b.helm) === 'weir' && !b.crashed && b.x + b.w / 2 >= W.crash) { b.crashed = true; ev.push({ t: 'crash' }); }
  if (b.x + b.w / 2 >= W.end) { b.mode = 'float'; b.reach = reachAt(st, b.x + b.w / 2); b.y = deckOf(st.reaches[b.reach].y); ev.push({ t: 'landed' }); }
  return ev;
}
export const strikeTiller = b => { b.helm = b.helm === 'cut' ? 'weir' : 'cut'; return b.helm; };

/* ---------------- THE WEED ---------------- */
export const inWeed = (D, st, x, y) => (D.weedWater || []).some(([x0, x1, id]) => { const r = reachById(st, id); return r && x >= x0 * TS && x < (x1 + 1) * TS && y > r.y + 6 && y < r.bed * TS + 4; });

/* ---------------- WHAT THE LEVEL SAYS IT IS (for the check and the brief) ---------------- */
export const MACHINES = ['barge', 'lock', 'fog', 'bridge'];
