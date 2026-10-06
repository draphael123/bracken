// glasssea_props.js - THE GLASS SEA's SET (claude/glasssea art pass): the things that stand on the glass. Pure drawing; no geometry, rule or number moves.
//   PLAN        plan(L, T): what holds every glass shelf and fused stair up (a fulgurite post, or an arch under a long span), what holds every floating mass of glass up
//               (the spire hoodoos, the Dark Cut's ridge, the obelisk) and the dressing that stands on the ground. tools/glasssea-aloft.mjs holds the plan to the grid.
//   DECOR       the level's own decor kinds: BONE SKIFFS (a hide awning on a bone mast over a rib hull: they read as bone and hide, never as a boat of boards), FULGURITE SPIRES
//               (a twisted glass tube with a violet lightning core, flared into the hoodoo that is the shade), the Fused Ridges (a crest of glass spikes), THE DARK CUT (a colonnade
//               of fused ribs under the ridge), THE FORK OBELISK (a capstone, the eye's carved bezel, the plinth piers), THE SUN TEMPLE's sealed stub (a facade, the sun-disc door
//               melted shut under a glass plug), THE SUNKEN HEAD (a carved giant: brow, eye, ear, crown, the glow on each hold)
//   DRESSING    the plan's props by section: glass shards, fulgurite stumps, sand drifts on the glass, bone and ribs, hide pennants, shard chimes, frost-rimed crystals
// Baked once (memo) from px.js primitives only, so tools/glasssea-art-sheet.mjs can render the bakers in Node.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline } from '../px.js';
import { GL, hash, HEAD, OBELISK } from './glasssea_tiles.js';
import { isSlope } from '../slopes.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round, TS = 16, DARK = '#0a1c26';
const BONE = { b0: '#3a3024', b1: '#6a5a46', b2: '#a8967a', b3: '#d8c8a8', b4: '#f4ecd6' };
const HIDE = { h0: '#3e2416', h1: '#6c4428', h2: '#9a6c40', h3: '#c89a62', h4: '#e6c68a' };
const SAND = { s1: '#b88a52', s2: '#d8aa6a', s3: '#ecc888', s4: '#f8e0aa' };
const lerp = (a, b, t) => a + (b - a) * t;

/* ================================ THE PLAN: what holds what up ================================ */
const planMemo = new WeakMap();
const solidAt = (L, T, x, y) => { if (x < 0 || y < 0 || x >= L.W || y >= L.H) return true; const t = L.grid[y * L.W + x]; return t === T.SOLID || isSlope(t); };
const oneAt = (L, T, x, y, extra) => (x >= 0 && x < L.W && y >= 0 && y < L.H && L.grid[y * L.W + x] === T.ONEWAY) || !!(extra && extra.has(x + ',' + y));
/* the runs of one-way tiles (and, for a bed, its tiles) in the level: [{ y, a, b, bed }] */
export function runs(L, T, withBeds) {
  const out = [], extra = new Set(), bedOf = new Map();
  if (withBeds) for (const b of L.beds || []) for (const [x, y] of b.tiles) { extra.add(x + ',' + y); bedOf.set(x + ',' + y, b.id); }
  const arenaX = L.arena ? Math.floor(L.arena.x0 / TS) : 1e9;
  for (let y = 0; y < L.H; y++) { let a = -1; for (let x = 0; x <= L.W; x++) { const on = x < L.W && x < arenaX && oneAt(L, T, x, y, extra) && !(!withBeds && false);
    if (on && a < 0) a = x; if (!on && a >= 0) { const bd = bedOf.get(a + ',' + y); out.push({ y, a, b: x - 1, bed: bd || null }); a = -1; } } }
  return out;
}
/* what stands under a column: the first solid or one-way tile below row y: { y: row, kind: 'solid' | 'ledge' | 'none' } (a bed's tiles count as ledges when `beds`) */
export function landing(L, T, x, y, beds) {
  const ex = beds ? new Set((L.beds || []).flatMap(b => b.tiles.map(([bx, by]) => bx + ',' + by))) : null;
  for (let yy = y + 1; yy < L.H; yy++) { if (solidAt(L, T, x, yy)) return { y: yy, kind: 'solid', sl: isSlope(L.grid[yy * L.W + x]) }; if (oneAt(L, T, x, yy, ex)) return { y: yy, kind: 'ledge' }; }
  return { y: -1, kind: 'none' };
}
export function plan(L, T) {
  if (planMemo.has(L)) return planMemo.get(L);
  const P = { posts: [], arches: [], piers: [], dress: [], runs: [] };
  const rs = runs(L, T, true);
  for (const r of rs) {
    const len = r.b - r.a + 1, keyL = solidAt(L, T, r.a - 1, r.y) || solidAt(L, T, r.a, r.y + 1), keyR = solidAt(L, T, r.b + 1, r.y) || solidAt(L, T, r.b, r.y + 1);
    const rec = { y: r.y, a: r.a, b: r.b, bed: r.bed, keyL, keyR, holds: [] }; P.runs.push(rec);
    if (len > 11 && keyL && keyR) { P.arches.push({ a: r.a, b: r.b, y: r.y, bed: r.bed }); rec.holds.push('arch'); continue; }   /* a long span over a crack: an arch springs from each lip under it */
    const xs = new Set(); if (!keyL) xs.add(r.a); if (!keyR) xs.add(r.b);
    const pts = [r.a - 1 + (keyL ? 0 : 1), ...[...xs].sort((p, q) => p - q), r.b + 1];   /* the gaps between supports (a keyed end counts as one at the tile past it) */
    const sup = [...xs].sort((p, q) => p - q), edges = [keyL ? r.a - 1 : r.a, ...sup.filter(x => x > r.a && x < r.b), keyR ? r.b + 1 : r.b].sort((p, q) => p - q);
    const all = new Set(sup); for (let i = 0; i + 1 < edges.length; i++) { const gap = edges[i + 1] - edges[i]; if (gap > 8) for (let k = 1; k < Math.ceil(gap / 8); k++) all.add(Math.round(edges[i] + k * gap / Math.ceil(gap / 8))); }
    for (const x of all) { const l = landing(L, T, x, r.y, true); P.posts.push({ x, y0: r.y, y1: l.y, kind: l.kind, sl: l.sl, bed: r.bed }); rec.holds.push(x); }
  }
  /* THE MASSES THAT HANG: every solid component that does not reach the bottom row is held by a hoodoo spire (its decor) or by piers */
  const seen = new Uint8Array(L.W * L.H), comps = [];
  const isS = (x, y) => x >= 0 && y >= 0 && x < L.W && y < L.H && (L.grid[y * L.W + x] === T.SOLID || isSlope(L.grid[y * L.W + x]));
  for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { if (!isS(x, y) || seen[y * L.W + x]) continue;
    const st = [[x, y]]; seen[y * L.W + x] = 1; let grounded = false, x0 = x, x1 = x, y0 = y, y1 = y;
    while (st.length) { const [cx, cy] = st.pop(); if (cy >= L.H - 1) grounded = true; x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (isS(nx, ny) && !seen[ny * L.W + nx]) { seen[ny * L.W + nx] = 1; st.push([nx, ny]); } } }
    if (!grounded) comps.push({ x0, x1, y0, y1 }); }
  for (const c of comps) {
    const spires = (L.decor || []).filter(d => d.kind === 'spire' && d.top >= c.y0 && d.top <= c.y1 && d.x >= c.x0 && d.x <= c.x1);
    const obe = (L.decor || []).find(d => d.kind === 'obelisk' && d.x0 >= c.x0 && d.x1 <= c.x1);
    const lens = obe && obe.eye === c.y1 + 1;   /* the obelisk's upper block rests on THE EYE'S LENS: a pane of glass fills the slit (the sunset ray passes through it) */
    const rec = { ...c, how: spires.length ? 'spire' : lens ? 'lens' : obe ? 'plinth' : 'piers', piers: [], eye: lens ? obe.eye : undefined };
    if (spires.length) for (const d of spires) rec.piers.push({ x: d.x, y0: d.top + 1, y1: d.y + 1, decor: true });
    else if (lens) { /* held by the lens */ }
    else if (obe) { for (const x of [obe.x0, obe.x1]) { const l = landing(L, T, x, c.y1, false); rec.piers.push({ x, y0: c.y1 + 1, y1: l.y, kind: l.kind }); } }
    else { const xs = new Set([c.x0, c.x1]); const gaps = Math.ceil((c.x1 - c.x0) / 8); for (let k = 1; k < gaps; k++) xs.add(Math.round(c.x0 + k * (c.x1 - c.x0) / gaps));
      for (const x of xs) { const l = landing(L, T, x, c.y1, false); rec.piers.push({ x, y0: c.y1 + 1, y1: l.y, kind: l.kind }); } }
    P.piers.push(rec); }
  planDress(L, T, P);
  planMemo.set(L, P); return P;
}

/* ================================ THE DRESSING: what stands on the ground ================================ */
const KINDS = { edge: ['drift', 'drift', 'shards', 'bones', 'chime', 'stump'], field: ['shards', 'stump', 'stump', 'bones', 'shards', 'chime', 'drift'], cross: ['ribs', 'bones', 'hide', 'bones', 'ribs', 'shards', 'skull', 'hide'],
  obelisk: ['hide', 'shards', 'bones', 'drift', 'cairn'], night: ['frost', 'frost', 'shards', 'bones', 'chime', 'rime'], steps: ['frost', 'shards', 'rime'] };
const sectionAt = x => x < 96 ? 'edge' : x < 196 ? 'field' : x < 296 ? 'cross' : x < 334 ? 'obelisk' : x < 572 ? 'night' : 'steps';
function planDress(L, T, P) {
  const busy = new Set(), mark = (x, r) => { for (let d = -r; d <= r; d++) busy.add(x + d); }, postCols = new Set();
  for (const e of L.ents) mark(e.x, e.t === 'sign' || e.t === 'check' ? 1 : e.t === 'gscampfire' || e.t === 'gsmirror' ? 2 : e.t === 'stray' || e.t === 'silver' ? 1 : 0);
  for (const c of L.cracks || []) for (let x = c.x0 - 2; x <= c.x1 + 2; x++) busy.add(x);
  for (const b of L.beds || []) { busy.add(b.tx); busy.add(b.tx - 1); busy.add(b.tx + 1); for (const [x] of b.tiles) busy.add(x); }
  for (const d of L.decor || []) { const x0 = (d.x0 ?? d.x), x1 = (d.x1 ?? d.x); const r = d.kind === 'skiff' ? 3 : d.kind === 'spire' ? 1 : d.kind === 'obelisk' ? 2 : d.kind === 'templeDoor' ? 4 : 0; if (d.kind === 'head' || d.kind === 'cut') continue; for (let x = x0 - r; x <= x1 + r; x++) busy.add(x); }
  for (const m of L.mirrors || []) mark(m.x, 2);
  for (const p of P.posts) for (let d = -1; d <= 1; d++) postCols.add(p.x + d);
  for (const c of P.piers) for (const p of c.piers) for (let d = -1; d <= 1; d++) postCols.add(p.x + d);
  const arenaX = L.arena ? Math.floor(L.arena.x0 / TS) - 1 : L.W;
  const lastBy = { ground: -9, shelf: -9 }; let ctr = 0;
  for (let x = 2; x < arenaX; x++) {
    if (x >= 360 && x <= 399) continue;   /* (the Sunken Head is dressed by its own decor) */
    if (busy.has(x)) continue;
    /* the column's tops: the first shelf and the first ground (a solid) with two rows of air over them, scanning down */
    let ground = -1, shelf = -1; for (let y = 4; y < L.H - 2; y++) { const t = L.grid[y * L.W + x]; if (!(L.grid[(y - 1) * L.W + x] === T.AIR && L.grid[(y - 2) * L.W + x] === T.AIR)) continue; if (t === T.ONEWAY && shelf < 0) shelf = y; if (t === T.SOLID && ground < 0) { ground = y; break; } }
    for (const [kind, top] of [['ground', ground], ['shelf', shelf]]) {
      if (top < 0 || x - lastBy[kind] < 3) continue; if (kind === 'ground' && (top > 36 || postCols.has(x))) continue;
      const tt = L.grid[top * L.W + x]; const flat = L.grid[top * L.W + x - 1] === tt && L.grid[top * L.W + x + 1] === tt && L.grid[(top - 1) * L.W + x - 1] === T.AIR && L.grid[(top - 1) * L.W + x + 1] === T.AIR; if (!flat) continue;
      const sec = sectionAt(x), h = hash(x, 77), dens = (sec === 'cross' ? 0.62 : sec === 'steps' ? 0.45 : 0.5) * (kind === 'shelf' ? 0.55 : 1); if ((h % 1000) / 1000 > dens) continue;
      const ks = KINDS[sec].filter(k => kind === 'ground' || ['shards', 'bones', 'frost', 'rime', 'stump', 'skull', 'drift'].includes(k)); if (!ks.length) continue; const k = ks[hash(x, 5) % ks.length];
      P.dress.push({ k, x, tx: x, ty: top, y: top * TS, v: hash(x, 31) % 3, sec, on: kind }); lastBy[kind] = x; ctr++; }
  }
  P.dressN = ctr;
}

/* ================================ BAKERS ================================ */
/* a glass crystal: a faceted spike from (x, y) base up by h, lean dx (px over the whole height), base width w; light on the left, shade on the right, a bright tip */
function crystal(g, x, y, h, lean, w, pal) {
  const [lt, md, dk, tip] = pal || [GL.c2, GL.c4, GL.c6, GL.w];
  for (let i = 0; i < h; i++) { const t = i / h, cx = x + lean * t, hw = Math.max(0.5, (w / 2) * (1 - t * 0.92)), x0 = R(cx - hw), x1 = R(cx + hw), yy = y - i;
    for (let xx = x0; xx <= x1; xx++) { const f = (xx - x0) / Math.max(1, x1 - x0); px(g, xx, yy, f < 0.34 ? lt : f < 0.72 ? md : dk); } }
  px(g, R(x + lean), y - h, tip); px(g, R(x + lean * 0.9), y - h + 1, lt);
}
export function bakeShards(v) {
  return once('shards' + v, () => { const [c, g] = canvas(28, 22);
    const sets = [[[8, 21, 15, -2, 6], [14, 21, 20, 1, 7], [20, 21, 11, 3, 5], [4, 21, 7, -3, 4]], [[10, 21, 12, -3, 5], [16, 21, 18, 0, 7], [21, 21, 9, 4, 4]], [[6, 21, 8, -2, 4], [12, 21, 13, -1, 6], [17, 21, 21, 2, 7], [23, 21, 10, 3, 5], [14, 21, 7, 5, 3]]][v % 3];
    for (const [x, y, h, lean, w] of sets) crystal(g, x, y, h, lean, w); rect(g, 3, 21, 22, 1, GL.c6); outline(c, DARK); return c; });
}
export function bakeStump(v) {
  return once('stump' + v, () => { const [c, g] = canvas(16, 20); const h = 10 + (v % 3) * 3;
    for (let i = 0; i < h; i++) { const y = 19 - i, hw = 4.5 - i * 0.18 + (i < 3 ? (3 - i) * 0.8 : 0), cx = 8 + Math.sin(i / 2.6 + v) * 1.2;
      for (let x = R(cx - hw); x <= R(cx + hw); x++) { const f = (x - (cx - hw)) / (2 * hw); px(g, x, y, f < 0.3 ? GL.c2 : f < 0.7 ? GL.c4 : GL.c6); }
      px(g, R(cx + Math.sin(i / 1.9) * 1.2), y, i % 3 ? GL.vioL : GL.vio); }
    px(g, 8, 19 - h, GL.w); outline(c, DARK); return c; });
}
export function bakeDrift(v) {
  return once('drift' + v, () => { const W = 30 + (v % 3) * 6, [c, g] = canvas(W, 8);
    for (let x = 0; x < W; x++) { const t = (x / (W - 1)) * 2 - 1, h = Math.round((1 - t * t) * (3 + (v % 2)) + (hash(x, v) % 2) * 0.6); for (let y = 0; y < h; y++) { const yy = 7 - y; px(g, x, yy, y === h - 1 ? SAND.s4 : y === h - 2 ? SAND.s3 : y >= h - 3 ? SAND.s2 : SAND.s1); } }
    for (let i = 0; i < 4; i++) px(g, 3 + hash(i, v) % (W - 6), 6, SAND.s1); return c; });
}
export function bakeBones(v) {
  return once('bones' + v, () => { const [c, g] = canvas(26, 14);
    if (v % 3 === 0) { for (let i = 0; i < 4; i++) { const x = 3 + i * 5; for (let k = 0; k < 9 - Math.abs(i - 1.5) * 1.5; k++) { const xx = x + Math.round(Math.sin(k / 3.2) * 2.4 + k * 0.3), yy = 12 - k; px(g, xx, yy, k < 6 ? BONE.b3 : BONE.b4); px(g, xx + 1, yy, BONE.b1); } }
      rect(g, 1, 12, 24, 2, BONE.b2); rect(g, 1, 12, 24, 1, BONE.b3); }   /* a spine and four ribs standing out of the glass */
    else if (v % 3 === 1) { rect(g, 2, 11, 20, 2, BONE.b3); rect(g, 2, 11, 20, 1, BONE.b4); rect(g, 0, 9, 4, 4, BONE.b3); rect(g, 22, 9, 4, 4, BONE.b3); px(g, 1, 10, BONE.b1); px(g, 24, 10, BONE.b1); for (let k = 0; k < 6; k++) px(g, 6 + k * 3, 13, BONE.b1); }   /* a long bone */
    else { rect(g, 3, 8, 10, 6, BONE.b3); rect(g, 3, 8, 10, 1, BONE.b4); rect(g, 12, 10, 7, 4, BONE.b2); px(g, 6, 10, BONE.b0); px(g, 9, 10, BONE.b0); rect(g, 7, 12, 3, 1, BONE.b0); line(g, 4, 8, 1, 3, BONE.b3); line(g, 12, 8, 15, 3, BONE.b3); px(g, 1, 3, BONE.b4); px(g, 15, 3, BONE.b4); }   /* a horned skull */
    outline(c, '#1a1410'); return c; });
}
export function bakeRibs(v) {   /* the leviathan's ribs standing out of the glass: a row of bone arches and the spine along the ground (the Bone Crossing's wreck) */
  return once('ribs' + v, () => { const [c, g] = canvas(76, 56); rect(g, 0, 52, 76, 4, BONE.b2); rect(g, 0, 52, 76, 1, BONE.b3); for (let x = 2; x < 74; x += 7) { rect(g, x, 50, 5, 3, BONE.b3); px(g, x + 1, 50, BONE.b4); }
    for (let i = 0; i < 6; i++) { const x0 = 6 + i * 11, hgt = 44 - Math.abs(i - 2.4) * 5, lean = i < 3 ? 1 : -1;
      for (let k = 0; k < hgt; k++) { const t = k / hgt, xx = x0 + Math.round(Math.sin(t * Math.PI * 0.6) * 9 * lean), yy = 52 - k; const th = t < 0.2 ? 3 : t < 0.7 ? 2 : 1; for (let q = 0; q < th; q++) px(g, xx + q, yy, q === 0 ? BONE.b4 : BONE.b3); px(g, xx + th, yy, BONE.b1); }
      if (i === 2) { rect(g, x0 + 1, 3, 6, 4, BONE.b3); } }
    outline(c, '#1a1410'); return c; });
}
export function bakeCairn(v) { return once('cairn' + v, () => { const [c, g] = canvas(16, 16); for (const [x, y, w, h, col] of [[1, 11, 14, 5, '#7e5a34'], [3, 7, 10, 5, '#a47a48'], [5, 3, 6, 5, '#c89c62']]) { rect(g, x, y, w, h, col); rect(g, x, y, w, 1, '#e8c488'); rect(g, x + w - 2, y + 1, 2, h - 1, '#5a3c22'); } px(g, 8, 2, '#ffd36b'); outline(c, '#241810'); return c; }); }
export function bakeFrost(v) {   /* frost-rimed glass: pale blue-white spikes with a rime of ice crystals */
  return once('frost' + v, () => { const [c, g] = canvas(26, 22), pal = ['#e8f8ff', '#9ad0f0', '#4a7aa8', '#ffffff'];
    const sets = [[[6, 21, 14, -2, 5], [12, 21, 19, 1, 6], [18, 21, 10, 3, 4], [22, 21, 6, 2, 3]], [[8, 21, 11, -3, 4], [14, 21, 16, 0, 6], [19, 21, 8, 3, 4], [4, 21, 6, -2, 3]], [[7, 21, 9, -1, 4], [12, 21, 20, 1, 6], [17, 21, 12, 2, 5], [21, 21, 7, 3, 3]]][v % 3];
    for (const [x, y, h, lean, w] of sets) crystal(g, x, y, h, lean, w, pal); rect(g, 2, 21, 22, 1, '#4a7aa8'); for (let i = 0; i < 9; i++) px(g, 1 + hash(i, v) % 24, 17 + hash(i, 4 + v) % 4, '#ffffff'); outline(c, '#0e1c34'); return c; });
}
export function bakeRime(v) { return once('rime' + v, () => { const [c, g] = canvas(14, 24); const h = 12 + (v % 3) * 4; crystal(g, 7, 23, h, v - 1, 5, ['#e8f8ff', '#9ad0f0', '#4a7aa8', '#ffffff']); crystal(g, 3, 23, 6, -2, 3, ['#e8f8ff', '#9ad0f0', '#4a7aa8', '#ffffff']); crystal(g, 11, 23, 7, 2, 3, ['#e8f8ff', '#9ad0f0', '#4a7aa8', '#ffffff']); outline(c, '#0e1c34'); return c; }); }
export function bakeSkull(v) { return bakeBones(2 + v * 3); }
/* a pole with a ragged hide pennant (the skiffers' marker): the pole is baked, the pennant flutters live */
export function bakeHidePole() { return once('pole', () => { const [c, g] = canvas(6, 40); rect(g, 2, 2, 2, 38, BONE.b3); rect(g, 2, 2, 1, 38, BONE.b4); rect(g, 0, 36, 6, 4, BONE.b2); rect(g, 1, 0, 4, 3, BONE.b4); outline(c, '#1a1410'); return c; }); }
export function bakeChimePost() { return once('chimepost', () => { const [c, g] = canvas(22, 34); rect(g, 10, 4, 2, 30, BONE.b3); rect(g, 10, 4, 1, 30, BONE.b4); rect(g, 2, 4, 18, 2, BONE.b2); rect(g, 2, 4, 18, 1, BONE.b3); rect(g, 7, 31, 8, 3, BONE.b2); outline(c, '#1a1410'); return c; }); }

/* A FULGURITE SPIRE: a twisted glass tube from the ground (or up to a hoodoo's cap). h px tall; flare = the top widens into the overhang (a hoodoo); a violet lightning core down the middle */
export function bakeSpire(h, flare, seed, tall) {
  return once('spire' + h + (flare ? 'f' : '') + seed + (tall ? 't' : ''), () => { const W = 44, [c, g] = canvas(W, h), mid = W / 2;
    for (let y = 0; y < h; y++) { const t = y / h, wob = Math.sin(y / 5.2 + seed) * 1.6 + Math.sin(y / 2.3 + seed * 2) * 0.5, base = tall ? 3.4 + t * 1.6 : 4 + t * 1.2;
      const fl = flare ? Math.max(0, 9 - y * 0.55) : 0, root = Math.max(0, (y - (h - 16)) * 0.55), hw = base + fl + root;
      const x0 = R(mid + wob - hw), x1 = R(mid + wob + hw);
      for (let x = x0; x <= x1; x++) { const f = (x - x0) / Math.max(1, x1 - x0); let col = f < 0.22 ? GL.c2 : f < 0.5 ? GL.c3 : f < 0.78 ? GL.c4 : GL.c6; if ((x * 2 + y) % 9 === 0 && f > 0.2 && f < 0.8) col = GL.c2; px(g, x, y, col); }
      const vx = R(mid + wob + Math.sin(y / 3 + seed) * 1.4); px(g, vx, y, y % 5 === 0 ? GL.w : GL.vioL); if (y % 3 === 0) px(g, vx + 1, y, GL.vio); }
    for (const [yy, side, len] of [[R(h * 0.3), -1, 8], [R(h * 0.55), 1, 10], [R(h * 0.78), -1, 7]]) { const sx = mid + (side < 0 ? -5 : 5); crystal(g, sx, yy + len * 0.6, len, side * 5, 4, [GL.c2, GL.c4, GL.c6, GL.w]); }
    outline(c, DARK); return c; });
}
/* THE BONE SKIFF: a hull of hide over rib frames, a bone mast and a hide awning that is the shade; glass shards set in the awning catch the sun */
export function bakeSkiff(v) {
  return once('skiff' + v, () => { const W = 84, H = 52, [c, g] = canvas(W, H), cx = 42, gy = 51;
    const gun = x => 38 - 6 * Math.pow((x - cx) / 30, 2), keel = x => 49 - 4 * Math.pow((x - cx) / 30, 2);
    for (let x = cx - 30; x <= cx + 30; x++) { for (let y = R(gun(x)); y <= R(keel(x)); y++) { const t = (y - gun(x)) / (keel(x) - gun(x) + 0.1); const rb = (((x + R(Math.sin(t * Math.PI) * 2.4 * (x > cx ? 1 : -1)) - (cx - 30)) % 6) + 6) % 6 < 2;
      let col = t < 0.15 ? HIDE.h4 : t < 0.5 ? HIDE.h3 : t < 0.8 ? HIDE.h2 : HIDE.h1; if (rb) col = t < 0.2 ? BONE.b4 : t < 0.75 ? BONE.b3 : BONE.b2; else if ((x * 3 + y * 5) % 17 === 0) col = HIDE.h1; if (y >= R(keel(x)) - 1) col = BONE.b2; px(g, x, y, col); } }
    rect(g, cx - 30, R(gun(cx - 30)), 61, 2, BONE.b3); rect(g, cx - 30, R(gun(cx - 30)), 61, 1, BONE.b4);   /* the gunwale bone */
    for (let x = cx - 24; x <= cx + 24; x += 8) { px(g, x, R(gun(x)) + 3, HIDE.h0); px(g, x + 2, R(gun(x)) + 4, HIDE.h0); }   /* the lacing */
    rect(g, cx - 1, 6, 3, 38, BONE.b3); rect(g, cx - 1, 6, 1, 38, BONE.b4); rect(g, cx + 1, 6, 1, 38, BONE.b1);   /* the mast */
    for (let side = -1; side <= 1; side += 2) { for (let k = 0; k < 33; k++) { const x = cx + side * k, y = R(7 + k * 0.78), yb = R(32 - (k > 26 ? (k - 26) * 0.6 : 0) + ((k >> 2) % 2 ? 1 : 0)); for (let yy = y; yy <= yb; yy++) { const t = (yy - y) / Math.max(1, yb - y); px(g, x, yy, yy === y ? HIDE.h4 : yy === yb ? HIDE.h1 : t < 0.35 ? HIDE.h3 : t < 0.8 ? HIDE.h2 : HIDE.h1); if (k % 8 === 4 && yy > y) px(g, x, yy, HIDE.h1); } } }   /* the awning: a tent of hide down from the mast head, seamed, scalloped at the hem */
    for (let k = 6; k < 33; k += 8) for (const side of [-1, 1]) { rect(g, cx + side * k - 1, R(7 + k * 0.78) + 5, 3, 4, k % 16 === 6 ? GL.c3 : GL.c2); px(g, cx + side * k, R(7 + k * 0.78) + 5, GL.w); px(g, cx + side * k, R(7 + k * 0.78) + 8, GL.c5); }   /* glass shards set in the hide */
    px(g, cx, 3, BONE.b4); rect(g, cx - 1, 4, 3, 2, BONE.b3);
    const bx = cx + 31, by = R(gun(cx + 30)) - 2;   /* the bow: a horned skull lashed on */
    rect(g, bx - 2, by - 6, 6, 5, BONE.b3); rect(g, bx + 2, by - 4, 3, 3, BONE.b2); px(g, bx - 1, by - 5, BONE.b0); line(g, bx - 2, by - 6, bx - 4, by - 11, BONE.b3); line(g, bx + 3, by - 6, bx + 5, by - 11, BONE.b3);
    for (let i = 0; i < 6; i++) crystal(g, cx - 38 + i * 15 + hash(i, v) % 5, gy, 4 + hash(i, v + 2) % 4, hash(i, v) % 3 - 1, 3);   /* glass grown through the wreck */
    if (v) { /* half-sunk, a rib broken */ }
    outline(c, '#1a1410'); return c; });
}

/* ================================ THE LANDMARKS ================================ */
export function bakeObeliskCap() { return once('obcap', () => { const W = 84, [c, g] = canvas(W, 30);
  for (let y = 0; y < 26; y++) { const hw = 5 + y * 1.4; for (let x = R(42 - hw); x <= R(42 + hw); x++) { const f = (x - (42 - hw)) / (2 * hw); px(g, x, y + 2, f < 0.4 ? '#e8c488' : f < 0.7 ? '#c89c62' : '#7e5a34'); } }
  rect(g, 40, 0, 4, 4, '#ffd36b'); px(g, 41, 0, '#fff6c8'); rect(g, 6, 26, 72, 4, '#7e5a34'); rect(g, 6, 26, 72, 1, '#e8c488'); outline(c, '#241810'); return c; }); }
export function bakeObeliskEye() { return once('obeye', () => { const [c, g] = canvas(72, 22);   /* the carved bezel round the eye's hole (the hole is the middle 64 x 16): lids with lashes, a gold rim */
  for (let x = 0; x < 72; x++) { const t = (x - 36) / 36, top = R(Math.abs(t) * 5), bot = R(Math.abs(t) * 4); rect(g, x, top, 1, 3, '#ffd36b'); rect(g, x, top + 3, 1, 1, '#a47a48'); rect(g, x, 21 - bot - 2, 1, 2, '#ffd36b'); rect(g, x, 21 - bot - 3, 1, 1, '#a47a48'); if (x % 5 === 2) { rect(g, x, top + 4, 1, 3, '#7e5a34'); } }
  outline(c, '#241810'); return c; }); }
export function bakePlinth() { return once('plinth', () => { const [c, g] = canvas(40, 52);
  for (let x = 0; x < 40; x++) for (let y = 0; y < 52; y++) { const col = x < 3 ? '#a47a48' : x > 33 ? '#3a2616' : (hash(x >> 1, y >> 2) % 7 === 0 ? '#3a2616' : '#5a3c22'); px(g, x, y, col); }
  rect(g, 0, 0, 40, 4, '#c89c62'); rect(g, 0, 0, 40, 1, '#e8c488'); rect(g, 0, 48, 40, 4, '#3a2616'); for (let y = 8; y < 46; y += 12) rect(g, 3, y, 34, 1, '#3a2616'); outline(c, '#241810'); return c; }); }
/* THE SEALED SUN TEMPLE: a half-buried facade: two columns, a lintel, the sun-disc door melted shut under a plug of glass, a great chain across it */
export function bakeTemple() { return once('temple', () => { const W = 100, H = 92, [c, g] = canvas(W, H);
  const stone = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { const f = (xx - x) / w; let col = f < 0.15 ? '#c89c62' : f > 0.8 ? '#3a2616' : '#7e5a34'; if (hash(xx >> 1, yy >> 2) % 6 === 0) col = f > 0.5 ? '#5a3c22' : '#a47a48'; px(g, xx, yy, col); } };
  stone(2, 20, 16, 72); stone(82, 20, 16, 72); stone(0, 14, 22, 9); stone(78, 14, 22, 9); stone(6, 2, 88, 14);   /* the columns, their capitals, the lintel */
  rect(g, 6, 2, 88, 2, '#e8c488'); rect(g, 6, 16, 88, 2, '#3a2616');
  for (let x = 10; x < 90; x += 6) { px(g, x, 8, '#3a2616'); px(g, x + 2, 11, '#3a2616'); px(g, x + 1, 13, '#ffd36b'); }   /* the carved script and the sun rays on the lintel */
  for (let x = 20; x < 80; x++) for (let y = 24; y < 92; y++) { const rx = (x - 50) / 30, top = 24 + 16 * (1 - Math.sqrt(Math.max(0, 1 - rx * rx))); if (y >= top) px(g, x, y, hash(x >> 2, y >> 2) % 5 === 0 ? '#2a1a10' : '#1a1008'); }   /* the arched doorway */
  for (let x = 23; x < 77; x++) for (let y = 33; y < 92; y++) { const rx = (x - 50) / 27, top = 33 + 14 * (1 - Math.sqrt(Math.max(0, 1 - rx * rx))); if (y >= top) { const d = (y - top) / 58; px(g, x, y, ((x * 2 + y) % 19 === 0) ? GL.w : d < 0.2 ? GL.c3 : d < 0.55 ? GL.c4 : GL.c5); if (hash(x >> 2, y >> 2) % 13 === 0) px(g, x, y, GL.vioL); } }   /* the glass plug: the lightning fused the doorway shut */
  circle(g, 50, 44, 8, '#ffd36b'); circle(g, 50, 44, 5, '#c89a2a'); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; line(g, 50 + Math.cos(a) * 9, 44 + Math.sin(a) * 9, 50 + Math.cos(a) * 12, 44 + Math.sin(a) * 12, '#ffd36b'); }   /* the sun disc seal, caught in the glass */
  line(g, 25, 42, 75, 70, '#2a2a30', 2); line(g, 75, 42, 25, 70, '#2a2a30', 2); for (let k = 0; k < 8; k++) { px(g, 27 + k * 6.5, 43 + k * 3.5, '#8a8a96'); px(g, 73 - k * 6.5, 43 + k * 3.5, '#8a8a96'); }   /* a chain across it, and its links */
  outline(c, '#241810'); return c; }); }
/* THE SUNKEN HEAD's face (drawn over the head's wall): a carved eye under a heavy brow, the cheek and the lips; the world coordinates of its top left are HEAD.x0 * 16, 17 * 16 */
export function bakeHeadFace() { return once('headface', () => { const W = 16 * 14, H = 16 * 10, [c, g] = canvas(W, H);
  const O = { a: '#05070c', b: '#0c121c', c: '#162030', d: '#22324a', e: '#34506c', f: '#5a86a8', hi: '#a8d8f0' };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const k = hash(x >> 2, y >> 2) % 5; px(g, x, y, k === 0 ? O.c : k === 1 ? O.b : O.b); }
  /* the brow: a heavy carved ridge, lit from above */
  for (let x = 0; x < W; x++) { const t = x / W, by = R(24 + Math.sin(t * Math.PI) * -6 + t * 6); rect(g, x, by, 1, 12, O.d); rect(g, x, by, 1, 2, O.hi); rect(g, x, by + 2, 1, 2, O.f); rect(g, x, by + 4, 1, 1, O.e); rect(g, x, by + 10, 1, 3, O.a); }
  /* the eye: a closed lid over a half-moon of amber */
  for (let x = 14; x < 100; x++) { const t = (x - 57) / 43, lid = R(66 + (t * t) * 14), lidB = R(66 + 28 - (t * t) * 10 * 0); const top = R(70 - Math.sqrt(Math.max(0, 1 - t * t)) * 16); rect(g, x, top, 1, 3, O.f); rect(g, x, top + 3, 1, 2, O.e); rect(g, x, top + 5, 1, R(Math.sqrt(Math.max(0, 1 - t * t)) * 16) + 4, O.a); }
  for (let x = 28; x < 86; x++) { const t = (x - 57) / 29; const h = Math.sqrt(Math.max(0, 1 - t * t)) * 9; rect(g, x, 76 - R(h), 1, R(h) + 1, '#a8661a'); if (h > 4) rect(g, x, 76 - R(h) + 1, 1, 2, '#ffd36b'); }
  rect(g, 56, 70, 3, 10, '#fff6c8');
  /* the cheek bone and the long lines either side of the nose; the lips below */
  for (let y = 96; y < 150; y++) { const k = (y - 96) / 54; rect(g, R(38 + k * 6), y, 2, 1, O.e); rect(g, R(120 - k * 4), y, 2, 1, O.a); }
  rect(g, 8, 128, 130, 3, O.a); rect(g, 8, 126, 130, 1, O.e); rect(g, 8, 131, 130, 1, O.d);
  /* the forehead band: a diadem of the old script and gold studs */
  rect(g, 0, 0, W, 14, O.c); rect(g, 0, 0, W, 2, O.f); rect(g, 0, 12, W, 2, O.a); for (let x = 6; x < W; x += 12) { rect(g, x, 5, 4, 4, '#ffd36b'); px(g, x + 1, 5, '#fff6c8'); }
  /* a seam of lightning down the cheek */
  for (let y = 0; y < H; y++) { const xx = R(172 + Math.sin(y / 6) * 3); px(g, xx, y, GL.vioL); px(g, xx + 1, y, GL.vio); }
  return c; }); }
