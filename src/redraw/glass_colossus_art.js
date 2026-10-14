// glass_colossus_art.js - THE GLASS COLOSSUS's own look (claude/glasssea art pass; the greybox was a stack of rectangles). Pure drawing: no geometry, move, rule or number changes; the B10 read
// (the gold OPEN ring and its timer, the pale WARDED shell, the word that says why a blow clanked) is src/glass-colossus-hands.js drawOver and is untouched.
//   THE BODY     a giant of lightning-fused glass, rooted in the glass: broad splayed feet, thick legs with a knee knob each, a pelvis, an hourglass torso with a prism CORE in the chest, great
//                faceted pauldrons, arms hanging outside the legs to fists planted in the floor, a heavy brow, slit eyes, a crown of glass spikes with a gem. Lit from the upper left; every
//                edge bevelled lit or shaded; violet lightning veins run through it. THREE palettes for its three phases: DUSK (sea-green, a sun-warmed rim), NIGHT (deep blue, the veins
//                alight cyan), DAWN (pale rose glass, a warm rim from the east). Baked once per palette.
//   ITS CRACKS   the read language (live, drawn over the body each frame): KNEES gold while the leg purse lasts, glazed pale once it is spent; the CHEST CORE opens gold (the lance came back);
//                the SHOULDERS blaze (the swarm held); the CROWN GEM burns white (the dawn). A shut crack is a thin dark seam; an open one a bright, widening wound.
//   ITS HOLDS    every climb handhold is a glass crystal ledge growing out of the body (its inner end inside the limb), GLOWING; they flash gold when the SHAKE is told
//   ITS MIRRORS  the shelf-mirrors drawn as polished bronze hoods with their notch (FACING / TO THE FIRE / TO THE SKY), the relayed firelight laid along the floor, the dawn's beam on the crown
//   THE FAR ONE  farSprite(k): its silhouette for the horizon (src/redraw/glasssea_art.js), the same shapes at 0.47 in one flat colour per hour
import { canvas, px, rect, fillPoly, line, outline, rgb, hex, whiten } from '../px.js';
import { COL } from '../glass-colossus.js';   /* (claude/colossus3 art) the phase change's length */

const R = Math.round, W0 = 216, H0 = 224, CX = 108, FY = 220;   /* the baked body's canvas and where its centre line and the floor fall in it */
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const PAL = [
  { l: '#b4f4de', m: '#5cc8b4', d: '#2a8a8c', k: '#124a5a', x: '#06202e', rim: '#ffe0a0', vein: '#a888ff', veinL: '#e8d8ff', eye: '#fff2c0', core: '#0a2a3c' },
  { l: '#8ab8f8', m: '#3e6ac0', d: '#1c3c88', k: '#0c1c4c', x: '#030a22', rim: '#9ad8ff', vein: '#60e0ff', veinL: '#d8ffff', eye: '#9af0ff', core: '#06142e' },
  { l: '#f4f6ff', m: '#98c4e0', d: '#5a86b8', k: '#34527e', x: '#142240', rim: '#ffd0a0', vein: '#ff8ac0', veinL: '#ffe0f0', eye: '#ffffff', core: '#243e66' }];
/* THE SHAPES, left side only, in canvas-relative px from the centre line (x) and the floor (y, up is negative); each is mirrored to the right. Drawn clockwise from the top left.
   [name, points, tone] - tone: 0 = middle, 1 = darker (a part in shadow, behind) */
const SHAPES = [
  ['upper', [[-74, -150], [-48, -150], [-52, -104], [-84, -106], [-82, -128]], 1],
  ['elbow', [[-88, -110], [-50, -110], [-52, -92], [-62, -86], [-84, -90], [-92, -100]], 1],
  ['fore', [[-86, -92], [-58, -92], [-62, -38], [-92, -38]], 1],
  ['fist', [[-100, -40], [-58, -40], [-54, -12], [-64, 0], [-94, 0], [-104, -12]], 1],
  ['foot', [[-60, -12], [-16, -12], [-8, -6], [-8, 0], [-60, 0], [-64, -6]], 0],
  ['shin', [[-48, -48], [-16, -48], [-14, -12], [-50, -12]], 0],
  ['knee', [[-54, -62], [-20, -62], [-10, -56], [-12, -42], [-54, -42], [-58, -52]], 0],
  ['thigh', [[-50, -98], [-12, -98], [-14, -62], [-52, -62]], 0],
  ['pelvis', [[-52, -104], [0, -104], [0, -84], [-44, -84], [-54, -96]], 0],
  ['waist', [[-30, -112], [0, -112], [0, -100], [-30, -100]], 0],
  ['chest', [[-26, -152], [0, -152], [0, -112], [-34, -112], [-44, -138]], 0],
  ['pauldron', [[-70, -152], [-24, -152], [-18, -170], [-34, -178], [-58, -174], [-74, -162]], 0],
  ['head', [[-16, -192], [0, -192], [0, -160], [-18, -160], [-22, -176]], 0],
];
const mir = pts => pts.map(([x, y]) => [-x, y]).reverse();
const tp = (pt, s) => [CX + pt[0] * s, FY + pt[1] * s];
const edgeLines = (g, pts, pal, s) => {
  const n = pts.length;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, nx = dy / len, ny = -dx / len, lit = nx * -0.6 + ny * -0.8;
    if (Math.abs(a[0]) < 0.5 && Math.abs(b[0]) < 0.5) continue;   /* the centre line is not an edge */
    const A = tp(a, s), B = tp(b, s);
    if (lit > 0.35) { line(g, A[0], A[1], B[0], B[1], pal.l, 1); line(g, A[0] + 1, A[1] + 1, B[0] + 1, B[1] + 1, pal.m, 1); }
    else if (lit < -0.35) { line(g, A[0], A[1], B[0], B[1], pal.x, 1); line(g, A[0] - 1, A[1] - 1, B[0] - 1, B[1] - 1, pal.k, 1); }
    else line(g, A[0], A[1], B[0], B[1], pal.d, 1); }
};
/* one shape on one side: left as authored, right mirrored and a step darker */
function paintShape(g, pts, tone, pal, side, s, seed) {
  const P = side < 0 ? pts : mir(pts), base = tone ? pal.d : pal.m, right = side > 0;
  fillPoly(g, P.map(p => tp(p, s)), right ? (tone ? pal.d : pal.m) : base);
  /* a lit upper-left half-tone on the left side, a dither of the shade on the right */
  if (!right) { const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const f = ((x - x0) / Math.max(1, x1 - x0) + (y - y0) / Math.max(1, y1 - y0)) * 0.5; if (f < 0.34 && ((x + y) / 2 & 1) === 0 && inside(P, x, y)) { const q = tp([x, y], s); px(g, q[0], q[1], tone ? pal.m : pal.l); } } }
  edgeLines(g, P, pal, s);
  /* a few facet chords */
  if (s === 1) for (let k = 0; k < 3; k++) { const a = P[(seed + k) % P.length], b = P[(seed + k + 2 + (k & 1)) % P.length], f0 = 0.25 + 0.12 * k, f1 = f0 + 0.3, q1 = tp([a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0], s), q2 = tp([a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1], s); line(g, q1[0], q1[1], q2[0], q2[1], right ? (k ? pal.d : pal.l) : (k === 1 ? pal.d : pal.l), 1); }
}
const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
/* THE BODY, baked: ph 0 dusk, 1 night, 2 dawn */
/* (claude/glasssea2) THE PART SPLIT for the POSE CLOCK (src/glass-colossus.js poseOf): the arms (upper, elbow, fore, fist) and the lower legs (shin, foot) are baked
   apart, one layer a side, so a pose can lift a foot, swing an arm, lean and bob the trunk. bakeBody(ph) is still the whole giant at rest (the sheet, the flash) */
const ARM = new Set(['upper', 'elbow', 'fore', 'fist']), LEG = new Set(['shin', 'foot']);
export function bakePart(ph, part) {
  return once('part' + ph + part, () => { const [c, g] = canvas(W0, H0), pal = PAL[ph], sd = part.endsWith('L') ? -1 : 1, set = part.startsWith('arm') ? ARM : LEG;
    SHAPES.forEach(([name, pts, tone], i) => { if (set.has(name)) paintShape(g, pts, tone, pal, sd, 1, i); });
    const vein = (pts, col) => { for (let i = 0; i + 1 < pts.length; i++) line(g, CX + pts[i][0] * sd, FY + pts[i][1], CX + pts[i + 1][0] * sd, FY + pts[i + 1][1], col); };
    if (set === ARM) vein([[58, -140], [64, -118], [70, -96], [76, -70], [80, -40]], pal.vein); else vein([[32, -48], [32, -38], [30, -14]], pal.vein);
    outline(c, pal.x); return c; });
}
export function bakeBody(ph) {
  return once('body' + ph, () => { const [c, g] = canvas(W0, H0); for (const p of ['armL', 'armR', 'legL', 'legR']) g.drawImage(bakePart(ph, p), 0, 0); g.drawImage(bakeCore(ph), 0, 0); return c; });
}
export function bakeCore(ph) {
  return once('core' + ph, () => { const [c, g] = canvas(W0, H0), pal = PAL[ph];
    /* the centre pieces (full width: drawn as the left half and its mirror, so the join is exact) */
    SHAPES.forEach(([name, pts, tone], i) => { if (ARM.has(name) || LEG.has(name)) return; paintShape(g, pts, tone, pal, -1, 1, i); paintShape(g, pts, tone, pal, 1, 1, i); });
    /* the chest's core window (a prism of dark glass, lit from within by the sun it will catch) */
    fillPoly(g, [[CX - 13, FY - 112], [CX + 13, FY - 112], [CX + 15, FY - 128], [CX, FY - 136], [CX - 15, FY - 128]], pal.x); fillPoly(g, [[CX - 11, FY - 114], [CX + 11, FY - 114], [CX + 12, FY - 127], [CX, FY - 133], [CX - 12, FY - 127]], pal.core);
    line(g, CX - 13, FY - 112, CX - 15, FY - 128, pal.l); line(g, CX - 15, FY - 128, CX, FY - 136, pal.l); line(g, CX + 13, FY - 112, CX + 15, FY - 128, pal.d);
    line(g, CX - 9, FY - 118, CX - 3, FY - 130, pal.l); line(g, CX - 6, FY - 116, CX + 2, FY - 130, pal.d);
    /* the sternum ridge, the collar plates and the belt of the old script */
    rect(g, CX - 1, FY - 152, 2, 38, pal.d); rect(g, CX - 1, FY - 152, 1, 38, pal.l);
    for (const [a, b, y] of [[-22, 22, -150], [-30, 30, -146]]) { line(g, CX + a, FY + y, CX + b, FY + y, pal.l); line(g, CX + a, FY + y + 1, CX + b, FY + y + 1, pal.k); }
    for (let x = -26; x <= 26; x += 6) { rect(g, CX + x, FY - 106, 3, 2, x % 12 ? pal.l : pal.rim); }
    /* the neck, the brow and the jaw */
    fillPoly(g, [[CX - 10, FY - 162], [CX + 10, FY - 162], [CX + 12, FY - 154], [CX - 12, FY - 154]], pal.k);
    rect(g, CX - 20, FY - 180, 40, 4, pal.x); rect(g, CX - 21, FY - 183, 42, 3, pal.l); rect(g, CX - 21, FY - 183, 42, 1, pal.rim);   /* the heavy brow */
    rect(g, CX - 10, FY - 168, 20, 2, pal.k); rect(g, CX - 6, FY - 165, 12, 1, pal.k); fillPoly(g, [[CX - 4, FY - 178], [CX + 4, FY - 178], [CX + 2, FY - 168], [CX - 2, FY - 168]], pal.d);   /* the nose and the mouth slit */
    /* the crown: a diadem of long glass spikes, the tallest in the middle */
    for (const [x, h, w] of [[-18, 14, 5], [-11, 20, 5], [-4, 24, 6], [4, 24, 6], [11, 20, 5], [18, 14, 5]]) { const x0 = CX + x; fillPoly(g, [[x0 - w / 2, FY - 192], [x0, FY - 192 - h], [x0 + w / 2, FY - 192]], x < 0 ? pal.l : pal.m); line(g, x0, FY - 192 - h, x0 + w / 2, FY - 192, pal.d); px(g, x0, FY - 192 - h, '#ffffff'); }
    rect(g, CX - 22, FY - 194, 44, 3, pal.rim); rect(g, CX - 22, FY - 192, 44, 2, pal.d);
    /* the veins: violet lightning down the spine, out along each arm and each leg */
    const vein = (pts, col) => { for (let i = 0; i + 1 < pts.length; i++) line(g, CX + pts[i][0], FY + pts[i][1], CX + pts[i + 1][0], FY + pts[i + 1][1], col); };
    for (const sd of [-1, 1]) { vein([[0, -150], [8 * sd, -142], [4 * sd, -134], [10 * sd, -124], [4 * sd, -116], [8 * sd, -104], [20 * sd, -92], [26 * sd, -76], [30 * sd, -58], [32 * sd, -48]], pal.vein);   /* (the shin's and the arm's run on in their own layers) */
      vein([[40 * sd, -150], [58 * sd, -140]], pal.vein); }
    vein([[0, -190], [-3, -176], [2, -164], [-2, -154]], pal.veinL);
    outline(c, pal.x); return c; });
}
/* the extents of its body at a height (rows above the floor in px), for the aloft check: [xL, xR] relative to the centre line, or null above the crown. Arms included. */
export function bodyExtent(yUp) {
  let lo = 1e9, hi = -1e9; for (const [, pts] of SHAPES) { const n = pts.length; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; const y0 = -a[1], y1 = -b[1]; if ((y0 - yUp) * (y1 - yUp) <= 0 && y0 !== y1) { const x = a[0] + (b[0] - a[0]) * ((yUp - y0) / (y1 - y0)); lo = Math.min(lo, x); } } }
  if (lo > 1e8) return null; return [lo, -lo];
}

/* ================================ LIVE ================================ */
const phIdx = ph => (ph === 2 ? 1 : ph === 3 ? 2 : 0);
/* (claude/colossus3 ART lane) THE MOTION. src/glass-colossus.js poseOf says WHERE each part wants to be (a smooth float pose per mode); this file does the rest, art only:
   - a TRANSITION blend (S.art): the pose it was in eases into the next one, so an attack is anticipation -> snap -> follow-through (the idle comes back with a little overshoot)
   - the arms SHEAR from the shoulder (rows of the baked arm slide), so a reach never pulls the arm off its shoulder hold; a foot's sole slides the same way
   - one-shot EFFECTS keyed to the mode it enters (S.art.fx): dust and shard bursts at the stomp, the quake plates, the shard rain's marks, the crack line's foot, the lance's flash,
     the phase's shock rings; and the steady ones: breathing glow, a sheen of light travelling through the glass, glints, the lance's sun growing in the chest, chips shed in the shrug and the shake
   Nothing here touches a hit box, a tell length, a damage or a timing; the gold OPEN ring and the read (glass-colossus-hands drawOver) are drawn over all of it */
const c01 = x => (x < 0 ? 0 : x > 1 ? 1 : x), sst = x => { x = c01(x); return x * x * (3 - 2 * x); }, ebk = x => { x = c01(x) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
const rnd = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
const VK = ['lean', 'bob', 'footL', 'footR', 'aLx', 'aLy', 'aRx', 'aRy', 'swL', 'swR', 'fdL', 'fdR', 'glow', 'sun', 'eye'];
const vecOf = p => ({ lean: p.lean || 0, bob: p.bob || 0, footL: p.footL || 0, footR: p.footR || 0, aLx: p.armL[0], aLy: p.armL[1], aRx: p.armR[0], aRy: p.armR[1], swL: p.swL || 0, swR: p.swR || 0, fdL: p.fdL || 0, fdR: p.fdR || 0, glow: p.glow || 0, sun: p.sun || 0, eye: p.eye == null ? 1 : p.eye });
const BLEND = { wake: 0.12, lanceTell: 0.3, lance: 0.07, stompTell: 0.2, stomp: 0.05, sweepTell: 0.26, sweep: 0.09, shardTell: 0.22, shards: 0.05, quakeTell: 0.3, quake: 0.04, crackTell: 0.3, crack: 0.06, shakeTell: 0.18, shake: 0.12, waveTell: 0.2, wave: 0.08, phase: 0.35, cracked: 0.08, blazing: 0.08, dazzled: 0.08, idle: 0.6 };
const LIGHT = ['255,226,150', '130,215,255', '255,205,225'], DUST = ['#cfe8e0', '#8aa4d8', '#eadcee'];
const GLINTS = [[-18, -206], [-11, -212], [-4, -216], [4, -216], [11, -212], [18, -206], [-21, -183], [21, -183], [-58, -174], [58, -174], [-34, -178], [34, -178], [-50, -60], [50, -60], [-44, -138], [44, -138], [-30, -112], [30, -112]];
const STOMP_FEET = 34;   /* a foot's centre from the centre line (the baked foot spans -60..-8) */
/* one shape-for-all: the pose it shows now. A mode change starts a blend from what was on screen (S.art.cur) to the new target; one-shot effects are laid on entering */
function artBlend(S, e, target, now) {
  const A = S.art || (S.art = { mode: null, t0: now, from: null, cur: null, fx: [] }), tg = vecOf(target);
  if (A.mode !== e.mode) { onEnter(A, S, e, now); A.from = A.cur || tg; A.mode = e.mode; A.t0 = now; }
  if (now < A.t0) A.t0 = now;   /* a clock that restarted */
  const u = c01((now - A.t0) / (BLEND[e.mode] || 0.2)), w = e.mode === 'idle' ? ebk(u) : sst(u), cur = {};
  for (const k of VK) cur[k] = A.from[k] + (tg[k] - A.from[k]) * w;
  if (e.mode === 'cracked' || e.mode === 'blazing' || e.mode === 'dazzled') cur.bob += 1.5 * Math.exp(-(now - A.t0) * 11);   /* the blow's recoil: 1.5 px, gone in a quarter of a second - then it only trembles (B4) */
  A.cur = cur; return cur;
}
function onEnter(A, S, e, now) {
  const m = e.mode, fc = e.face || -1, G = S.G, add = f => { A.fx.push({ ...f, t: now }); if (A.fx.length > 24) A.fx.shift(); };
  if (m === 'stomp') add({ k: 'stomp', x: e.x + fc * STOMP_FEET, x2: e.x - fc * STOMP_FEET });
  else if (m === 'quake') add({ k: 'quake', xs: S.slick.length ? S.slick.map(q => q.x) : [e.x - 76, e.x, e.x + 76] });
  else if (m === 'shards') add({ k: 'shards', pts: S.marks.map(q => [q.x, q.y]) });
  else if (m === 'crack') { const d = S.crack ? S.crack.dir : fc; add({ k: 'crack', x: e.x + d * STOMP_FEET, d }); }
  else if (m === 'lance') add({ k: 'lance', d: fc });
  else if (m === 'phase') add({ k: 'phase' });
  else if (m === 'wave') add({ k: 'wave', x: e.x - STOMP_FEET, x2: e.x + STOMP_FEET });
  else if (m === 'cracked' || m === 'blazing' || m === 'dazzled') add({ k: 'open' });
  else if (m === 'wake') add({ k: 'wake' });
  else if (m === 'lunge' && S.lunge) { const Lg = S.lunge, ms = Lg.mirror >= 0 && S.mirrors[Lg.mirror], hd = A.lastHand || [(Math.sign(Lg.x - e.x) || fc) * 79, -60];
    add({ k: 'spear', x: Lg.x, y: G.floor - (ms ? 36 : 6), hx: e.x + hd[0], hy: G.floor + hd[1], disc: !!ms }); add({ k: 'erupt', x: Lg.x }); }
  else if (m === 'idle' && A.mode && A.mode !== 'idle') add({ k: 'settle', x: e.x - STOMP_FEET, x2: e.x + STOMP_FEET });   /* after any move: the dust it kicked up settles, a small puff at each heel */
}
/* ---- particles (all deterministic from the age: no state, no timers) ---- */
function chips(g, pal, x, y, age, n, seed, sp, up, life, bias, cols) {   /* glass chips thrown up from (x, y) that fall and lie, then fade */
  for (let i = 0; i < n; i++) { const r1 = rnd(seed, i), r2 = rnd(seed, i + 50), r3 = rnd(seed, i + 99), l = life * (0.6 + 0.4 * r3); if (age > l) continue;
    let cx = x + (((r1 - 0.5) * 2 + (bias || 0)) * sp) * Math.min(age, 0.55), cy = y - (up * (0.4 + 0.6 * r2) * age - 210 * age * age); if (cy > y - 1) cy = y - 1;
    g.globalAlpha = age > l * 0.6 ? 1 - (age - l * 0.6) / (l * 0.4) : 1; g.fillStyle = cols ? cols[i % cols.length] : i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? pal.l : pal.m; g.fillRect(R(cx), R(cy), 3 + (i & 1), 2 + (i % 3 === 2 ? 1 : 0)); }
  g.globalAlpha = 1;
}
function dust(g, x, y, age, n, seed, sp, life, col) {   /* square puffs that roll out along the floor, swell and thin */
  for (let i = 0; i < n; i++) { if (age > life) break; const r = rnd(seed, i), dir = i % 2 ? 1 : -1, s = (5 + age * 20) * (0.6 + r), xx = x + dir * sp * (0.4 + r) * Math.sqrt(age), yy = y - s * 0.45 - age * 14 * r;
    g.globalAlpha = 0.7 * (1 - age / life); g.fillStyle = col; const w = R(s), h = Math.max(2, R(s * 0.7)), x0 = R(xx - s / 2), y0 = R(yy - s / 2); g.fillRect(x0 + 1, y0, w - 2, h); g.fillRect(x0, y0 + 1, w, h - 2); }
  g.globalAlpha = 1;
}
const glint = (g, x, y, a, col) => { if (a <= 0.02) return; g.globalAlpha = Math.min(1, a); g.fillStyle = col || '#ffffff'; g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); g.globalAlpha = 1; };
const disc = (g, x, y, r, col) => { g.fillStyle = col; for (let dy = -r; dy <= r; dy++) { const h = R(Math.sqrt(Math.max(0, r * r + r * 0.6 - dy * dy))); g.fillRect(x - h, y + dy, 2 * h + 1, 1); } };   /* a crisp pixel disc */
const lite = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; };
const radial = (g, x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 1, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
function drawFx(g, A, S, e, X, Y, now, pal, ph) {
  const sx = wx => X + R(wx - e.x), D = DUST[ph], L = LIGHT[ph];
  A.fx = A.fx.filter(f => now - f.t < 2.2 && now >= f.t - 0.001);
  for (const f of A.fx) { const a = now - f.t;
    switch (f.k) {
      case 'stomp': dust(g, sx(f.x), Y, a, 10, 3, 60, 0.8, D); chips(g, pal, sx(f.x), Y, a, 14, 5, 100, 200, 0.9, 0); dust(g, sx(f.x2), Y, a, 3, 8, 22, 0.5, D);
        if (a < 0.14) { g.globalAlpha = 1 - a / 0.14; g.fillStyle = '#ffffff'; g.fillRect(sx(f.x) - R(a * 320), Y - 2, R(a * 640), 2); g.globalAlpha = 1; } break;
      case 'quake': for (let i = 0; i < f.xs.length; i++) { dust(g, sx(f.xs[i]), Y, a, 6, 11 + i, 40, 0.9, D); chips(g, pal, sx(f.xs[i]), Y, a, 8, 13 + i, 60, 200, 0.95, 0); } break;
      case 'shards': for (let i = 0; i < f.pts.length; i++) { const x = sx(f.pts[i][0]), y = Y + R(f.pts[i][1] - S.G.floor); chips(g, pal, x, y, a, 6, 21 + i, 50, 120, 0.6, 0); dust(g, x, y, a, 3, 27 + i, 14, 0.45, D); } break;
      case 'crack': dust(g, sx(f.x), Y, a, 7, 31, 56, 0.8, D); chips(g, pal, sx(f.x), Y, a, 10, 33, 70, 150, 0.85, f.d * 0.9, ['#ffffff', '#ffd89a', '#ffb050', pal.l]);
        if (a < 0.16) { g.globalAlpha = 1 - a / 0.16; g.fillStyle = '#ffd89a'; g.fillRect(sx(f.x) - 6, Y - 2, 12 + R(a * 200), 2); g.globalAlpha = 1; } break;
      case 'lance': { if (a < 0.3) lite(g, () => { radial(g, X, Y - 122, 26 + R(a * 190), '255,246,200', 0.75 * (1 - a / 0.3)); });
        for (let i = 0; i < 9 && a < 0.55; i++) { const r1 = rnd(41, i), r2 = rnd(42, i), dd = f.d; g.globalAlpha = 1 - a / 0.55; g.fillStyle = i % 2 ? '#fff6c8' : '#ffd36b'; g.fillRect(X + R(dd * (14 + (80 + 120 * r1) * a)), Y - 122 - R((r2 - 0.5) * 30 * (0.4 + a * 3)), 3, 1); } g.globalAlpha = 1; break; }
      case 'phase': lite(g, () => { for (let i = 0; i < 3; i++) { const q = a - i * 0.28; if (q < 0 || q > 1.3) continue; g.globalAlpha = 0.7 * (1 - q / 1.3); g.strokeStyle = 'rgb(' + L + ')'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - 122, 16 + q * 170, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1; g.lineWidth = 1; });
        for (let i = 0; i < 16; i++) { const r1 = rnd(51, i), r2 = rnd(52, i), t0 = 0.1 + r2 * 0.9, q = a - t0; if (q < 0 || q > 0.9) continue; g.globalAlpha = 1 - q / 0.9; g.fillStyle = i % 2 ? pal.l : '#ffffff'; g.fillRect(X + R((r1 - 0.5) * 110), Y - 190 + R(q * 150 + q * q * 120), 2, 2 + (i & 1)); } g.globalAlpha = 1; break;
      case 'wave': dust(g, sx(f.x), Y, a, 4, 61, 36, 0.6, D); dust(g, sx(f.x2), Y, a, 4, 62, 36, 0.6, D); break;
      case 'foot': dust(g, sx(f.x), Y, a, 8, 41, 40, 0.7, D); chips(g, pal, sx(f.x), Y, a, 6, 43, 60, 120, 0.6, f.d * 0.8);
        if (a < 0.12) { g.globalAlpha = 1 - a / 0.12; g.fillStyle = '#ffffff'; g.fillRect(sx(f.x) - R(a * 220), Y - 2, R(a * 440), 2); g.globalAlpha = 1; } break;
      case 'erupt': { const n = 9, W2 = COL.lungeW, H2 = COL.lungeH, k = a < 0.09 ? a / 0.09 : a < 0.55 ? 1 : Math.max(0, 1 - (a - 0.55) / 0.5);   /* glass spikes tear up out of the marked ground, hold a beat, and settle */
        for (let i = 0; i < n; i++) { const r1 = rnd(61, i), x0 = sx(f.x) + R(-W2 + (i + 0.5) * (2 * W2 / n) + (r1 - 0.5) * 4), h = R((12 + (H2 - 12) * (0.45 + 0.55 * rnd(62, i))) * k), w = 6 + (i & 1), ln = (r1 - 0.5) * 6; if (h < 2) continue;
          fillPoly(g, [[x0 - w / 2 - 1, Y], [x0 + ln, Y - h - 1], [x0 + w / 2 + 1, Y]], '#0a1c26'); fillPoly(g, [[x0 - w / 2, Y], [x0 + ln, Y - h], [x0, Y]], '#c8fff0'); fillPoly(g, [[x0, Y], [x0 + ln, Y - h], [x0 + w / 2, Y]], '#34908c'); g.fillStyle = '#ffffff'; g.fillRect(R(x0 + ln), Y - h, 1, 2); }
        if (a < 0.5) { dust(g, sx(f.x) - 20, Y, a, 4, 63, 28, 0.6, D); dust(g, sx(f.x) + 20, Y, a, 4, 64, 28, 0.6, D); chips(g, pal, sx(f.x), Y, a, 10, 65, 70, 190, 0.7, 0); }
        if (a < 0.1) lite(g, () => radial(g, sx(f.x), Y - 10, 40, '210,255,240', 0.6 * (1 - a / 0.1))); break; }
      case 'spear': { if (a > 1.15) break; const tt = c01(a / 0.07), x1 = sx(f.x), y1 = Y + R(f.y - S.G.floor), x0 = X + R(f.hx - e.x), y0 = Y + R(f.hy - S.G.floor), tx = x0 + (x1 - x0) * tt, ty = y0 + (y1 - y0) * tt, dl = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / dl, uy = (y1 - y0) / dl;
        const fade = a > 0.85 ? 1 - (a - 0.85) / 0.3 : 1; g.globalAlpha = fade;
        if (tt < 1) lite(g, () => { g.strokeStyle = 'rgba(220,255,245,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx - ux * 92, ty - uy * 92); g.lineTo(tx, ty); g.stroke(); g.lineWidth = 1; });   /* the streak of its flight */
        spearArt(g, R(tx - ux * 104), R(ty - uy * 104), R(tx), R(ty), pal, tt < 1 ? 1 : Math.max(0, 1 - (a - 0.07) / 0.3)); g.globalAlpha = 1;
        if (a >= 0.07 && a < 0.3) { const k = 1 - (a - 0.07) / 0.23; lite(g, () => radial(g, x1, y1, 22 + 16 * (1 - k), '255,255,235', 0.85 * k)); star(g, x1, y1, 4 + R(14 * k), k); }   /* the strike */
        if (a >= 0.07 && f.disc && a < 1) { const k = c01(1 - (a - 0.07) / 0.9); g.globalAlpha = k;   /* the disc, speared: cracks run across the polished face, glass flies off it */
          for (let i = 0; i < 6; i++) { const an = i * 1.0472 + 0.4, ll = 5 + 6 * rnd(66, i); g.strokeStyle = '#0a1c26'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 + Math.cos(an) * ll, y1 + Math.sin(an) * ll * 0.9); g.stroke(); g.fillStyle = '#ffffff'; g.fillRect(R(x1 + Math.cos(an) * ll * 0.5), R(y1 + Math.sin(an) * ll * 0.45), 1, 1); } g.globalAlpha = 1;
          if (a < 0.6) chips(g, pal, x1, y1, a - 0.07, 12, 67, 80, 90, 0.5, 0, ['#ffffff', '#d8f8ff', '#7ad0e8', '#ffd36b']); }
        if (a > 0.85 && a < 1.15) chips(g, pal, x1, y1, a - 0.85, 8, 68, 50, 60, 0.3, 0); break; }
      case 'settle': dust(g, sx(f.x), Y, a, 3, 71, 16, 0.55, D); dust(g, sx(f.x2), Y, a, 3, 72, 16, 0.55, D); break;
      case 'open': if (a < 0.45) chips(g, pal, X, Y - 134, a, 7, 81, 70, 80, 0.45, 0, ['#ffffff', '#dff8ff', pal.l]); break;
      case 'wake': dust(g, X - 40, Y, a, 5, 91, 40, 1.0, D); dust(g, X + 40, Y, a, 5, 92, 40, 1.0, D); chips(g, pal, X, Y - 150, a, 12, 93, 70, 30, 1.1, 0); break;
    } }
  g.globalAlpha = 1;
}
/* a baked arm/leg drawn in 2-row bands, each band slid sideways in proportion to its depth below `top` (the shoulder / the knee): an arm that REACHES, a foot that SCRAPES */
function drawSheared(g, img, white, x, y, sh, top, len, flash) {
  const sl = (im, a) => { if (a != null) g.globalAlpha = a; if (!sh) g.drawImage(im, x, y); else for (let r = 0; r < H0; r += 2) { const t = r < top ? 0 : Math.min(1, (r - top) / len); g.drawImage(im, 0, r, W0, 2, x + R(sh * Math.pow(t, 1.35)), y + r, W0, 2); } if (a != null) g.globalAlpha = 1; };
  sl(img); if (flash) sl(white, 0.7);
}
let SHEEN = null;
function sheen(g, core, ox, oy, now, col, a, speed) {   /* a band of light travelling through the trunk's glass (clipped to the baked body by destination-in) */
  if (!SHEEN) SHEEN = canvas(W0, H0, true); const [c, t] = SHEEN; t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, W0, H0);
  const bx = -50 + (((now * speed / 5.5) % 1) * (W0 + 100)), gr = t.createLinearGradient(bx - 26, 40, bx + 26, 66); gr.addColorStop(0, 'rgba(' + col + ',0)'); gr.addColorStop(0.5, 'rgba(' + col + ',1)'); gr.addColorStop(1, 'rgba(' + col + ',0)');
  t.fillStyle = gr; t.fillRect(0, 0, W0, H0); t.globalCompositeOperation = 'destination-in'; t.drawImage(core, 0, 0);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(c, ox, oy); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
/* THE COLOSSUS: the baked body, then its live cracks. e = the entity (mode/open/hurtT), S = the fight state, G = geom; the centre line is e.x, the floor G.floor */
export function drawBody(g, e, S, G, cx, cy, time, flash, pose) {
  const ph = phIdx(S.ph), pal = PAL[ph], X = R(e.x - cx), Y = R(G.floor - cy), now = S.t != null ? S.t : time, fc = e.face || -1;
  const cur = artBlend(S, e, pose || { lean: 0, bob: 0, footL: 0, footR: 0, armL: [0, 0], armR: [0, 0] }, now), A = S.art;
  /* (claude/glasssea2) THE POSE: the trunk leans (half at the hips) and bobs; a foot lifts; an arm swings out and up (a fist never under the floor). (claude/colossus3 art) smooth, sheared, blended */
  const sway = R(cur.lean * 0.6), bob = R(cur.bob), ox = X - CX + sway, oy = Y - FY + bob;
  const at = { armL: [ox - R(cur.aLx), Y - FY + Math.min(2, R(cur.bob + cur.aLy))], armR: [ox + R(cur.aRx), Y - FY + Math.min(2, R(cur.bob + cur.aRy))], legL: [X - CX, Y - FY - R(cur.footL)], legR: [X - CX, Y - FY - R(cur.footR)] };
  const SH = { armL: -cur.swL, armR: cur.swR, legL: -cur.fdL, legR: cur.fdR };
  const paint = (ph2, alpha) => {   /* the whole giant in one palette (a phase change paints two, one fading over the other) */
    if (alpha < 1) g.globalAlpha = alpha;
    for (const k of ['armL', 'armR', 'legL', 'legR']) { const L = bakePart(ph2, k), arm = k.startsWith('arm'); drawSheared(g, L, flash ? once('w' + ph2 + k, () => whiten(L)) : null, at[k][0], at[k][1], SH[k], arm ? FY - 150 : FY - 48, arm ? 150 : 48, flash); }
    const core = bakeCore(ph2); g.drawImage(core, ox, oy);
    if (flash) { g.globalAlpha = 0.7 * alpha; g.drawImage(once('corew' + ph2, () => whiten(core)), ox, oy); }   /* the hit flash: a white silhouette over it */
    g.globalAlpha = 1; };
  if (e.mode === 'phase') { const q = c01((now - A.t0) / COL.phaseT); paint(phIdx(S.ph - 1), 1); paint(ph, sst(q * 1.25)); } else paint(ph, 1);   /* DUSK -> NIGHT -> DAWN: the old glass is still there while the new light floods in */
  const core = bakeCore(ph), T = (x, y) => [X + sway + x, Y + bob + y];   /* centre-line relative (on the trunk) */
  const glow = (x, y, r, col, a) => { const q = T(x, y); lite(g, () => radial(g, q[0], q[1], r, col, a)); };
  const crack = (x, y, len, w, col, bright) => {   /* a jagged crack: a dark seam, with a lit core when it is open */
    const q = T(x, y), pts = [[0, 0], [w * 0.4, len * 0.25], [-w * 0.3, len * 0.5], [w * 0.5, len * 0.75], [0, len]]; g.fillStyle = '#050a14';
    for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; const steps = Math.max(1, R(Math.abs(b[1] - a[1]))); for (let s = 0; s <= steps; s++) { const t = s / steps; g.fillRect(R(q[0] + a[0] + (b[0] - a[0]) * t), R(q[1] - len / 2 + a[1] + (b[1] - a[1]) * t), bright ? 3 : 2, 1); } }
    if (bright) { g.fillStyle = col; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; const steps = Math.max(1, R(Math.abs(b[1] - a[1]))); for (let s = 0; s <= steps; s++) { const t = s / steps; g.fillRect(R(q[0] + a[0] + (b[0] - a[0]) * t) + 1, R(q[1] - len / 2 + a[1] + (b[1] - a[1]) * t), 1, 1); } } } };
  const pulse = 0.5 + 0.5 * Math.sin(time * 5), L = LIGHT[ph], open = e.mode === 'cracked' || e.mode === 'blazing' || e.mode === 'dazzled';
  /* THE LIGHT IN THE GLASS: it breathes (a slow glow in the chest), a band of light travels through the trunk, a glint now and then on a crown spike or a pauldron. Quiet while it is OPEN (the gold ring has the eye) */
  if (e.mode !== 'sleep' || cur.glow > 0.1) { const gl = open ? 0.06 : cur.glow; if (gl > 0.01) glow(0, -120, 34 + 22 * gl, L, 0.34 * gl); }
  if (!open && e.mode !== 'sleep') { sheen(g, core, ox, oy, now, L, 0.2 + 0.25 * cur.glow + 0.3 * cur.sun, 1);
    const slot = Math.floor(now / 0.8), ua = (now % 0.8) / 0.8, nG = e.mode === 'lanceTell' ? 3 : 1;
    for (let j = 0; j < nG; j++) { if (nG === 1 && (slot & 1)) break; const gp = GLINTS[Math.floor(rnd(slot, 3 + j * 7) * GLINTS.length)], q = T(gp[0], gp[1]); glint(g, q[0], q[1], Math.sin(ua * Math.PI) * (0.45 + 0.55 * Math.max(cur.sun, cur.glow)), nG > 1 ? '#fff6c8' : '#ffffff'); } }
  /* idle: a heel planting kicks a small puff (the toe it slid out settles back) */
  if (e.mode === 'idle' && now - A.t0 > 0.7) for (const [tp0, sd] of [[2.962, -1], [1.362, 1]]) { const n = Math.floor((now - tp0) / 3.2), tp = tp0 + n * 3.2, ag = now - tp; if (n >= 0 && ag >= 0 && ag < 0.5 && tp > A.t0 + 0.5) dust(g, X + sd * STOMP_FEET, Y, ag, 3, 5 + n % 7, 10, 0.5, DUST[ph]); }
  /* the veins glow: faint at dusk, strong at night, a rose shimmer at dawn */
  const night = S.ph === 2;
  if (night) { glow(0, -118, 46, '96,224,255', 0.18 + 0.1 * pulse); glow(0, -176, 20, '154,240,255', 0.3); }
  /* its EYES: two slits under the brow, lit as far as the pose says (asleep: shut), the highlight looking the way it faces */
  const eyeCol = pal.eye, ey = c01(cur.eye); for (const sd of [-1, 1]) { const q = T(9 * sd - 4, -176);
    if (ey < 0.98) { g.fillStyle = '#0a1c26'; g.fillRect(q[0], q[1], 8, ey < 0.05 ? 1 : 2); }
    if (ey >= 0.05) { g.globalAlpha = ey; g.fillStyle = eyeCol; g.fillRect(q[0], q[1], 8, 2); g.fillStyle = '#ffffff'; g.fillRect(q[0] + (fc < 0 ? 0 : 5), q[1], 3, 1); g.globalAlpha = 1; } }
  glow(0, -176, 22, night ? '120,230,255' : '255,240,180', (0.22 + 0.1 * pulse) * (0.15 + 0.85 * ey));
  /* THE KNEE CRACKS: gold while the leg purse lasts, glazed pale once it is spent (a pale seam with a white sheen) */
  const live = S.legPurse > 0;
  for (const sd of [-1, 1]) { crack(34 * sd, -52, 18, 5, live ? '#ffd36b' : '#c8d8e8', true); if (live) glow(34 * sd, -52, 22, '255,200,90', 0.28 + 0.12 * pulse); else { const q = T(34 * sd, -52); g.fillStyle = 'rgba(210,225,240,0.5)'; g.fillRect(q[0] - 7, q[1] - 10, 14, 20); } }
  /* THE CHEST CORE: dark and shut; THE SUN LANCE GATHERS in it (a disc growing over the whole windup, rays, the glass ringing, rings of light), then flares and fades as the bolt runs; cracked open it is a gold wound */
  const cored = e.mode === 'cracked', sun = cur.sun;
  if (sun > 0.02 && (e.mode === 'lanceTell' || e.mode === 'lance')) { const q = T(0, -122), r = 1 + R(11 * sun), flick = 0.85 + 0.15 * Math.sin(time * 30);
    glow(0, -122, 30 + 30 * sun, '255,236,170', (0.2 + 0.55 * sun) * flick);
    lite(g, () => { g.strokeStyle = 'rgba(255,240,190,' + (0.25 + 0.4 * sun) + ')'; for (let i = 0; i < 8; i++) { const an = now * 0.9 + i * Math.PI / 4, l0 = r + 2, l1 = r + 4 + 16 * sun * (i % 2 ? 1 : 0.6); g.beginPath(); g.moveTo(q[0] + Math.cos(an) * l0, q[1] + Math.sin(an) * l0); g.lineTo(q[0] + Math.cos(an) * l1, q[1] + Math.sin(an) * l1); g.stroke(); }
      if (e.mode === 'lanceTell') { const per = 0.62 - 0.34 * sun; for (let i = 0; i < 2; i++) { const u = ((now / per) + i * 0.5) % 1; g.globalAlpha = (1 - u) * 0.55 * sun; g.strokeStyle = '#fff0b0'; g.beginPath(); g.arc(q[0], q[1], 10 + u * 46, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1; } });
    disc(g, q[0], q[1], r + 1, '#ffd36b'); disc(g, q[0], q[1], Math.max(1, r - 1), '#fff0b0'); disc(g, q[0], q[1], Math.max(0, r - 4), '#ffffff'); }
  if (cored) { crack(-2, -122, 26, 8, '#ffd36b', true); crack(5, -118, 20, 6, '#fff6c8', true); glow(0, -122, 44, '255,200,90', 0.5 + 0.2 * pulse); const q = T(-12, -134); g.globalAlpha = 0.4; g.fillStyle = '#ffd36b'; g.fillRect(q[0], q[1], 24, 24); g.globalAlpha = 1; }
  else { const q = T(-2, -134); g.fillStyle = 'rgba(5,10,20,0.9)'; g.fillRect(q[0], q[1], 1, 6); g.fillRect(q[0] + 1, q[1] + 3, 1, 5); }
  /* THE SHOULDER CRACKS (night): a violet seam; blazing = a cyan-white fire */
  const blaze = e.mode === 'blazing';
  for (const sd of [-1, 1]) { if (S.ph === 2) { crack(44 * sd, -162, 18, 6, blaze ? '#ffffff' : '#a888ff', true); if (blaze) glow(44 * sd, -162, 30, '154,240,255', 0.6 + 0.2 * pulse); else glow(44 * sd, -162, 16, '154,120,255', 0.2); } else crack(44 * sd, -162, 16, 4, '#ffffff', false); }
  /* THE CROWN GEM: a sun-gem in the diadem; at dawn it burns, dazzled it is white */
  const gem = e.mode === 'dazzled'; { const q = T(0, -196), a = S.ph === 3; g.fillStyle = '#05080f'; g.fillRect(q[0] - 5, q[1] - 6, 10, 12); g.fillStyle = gem ? '#ffffff' : a ? '#ffd36b' : S.ph === 2 ? '#5a4aa8' : '#c8a028'; g.fillRect(q[0] - 4, q[1] - 5, 8, 10); g.fillStyle = gem ? '#ffffff' : '#fff6c8'; g.fillRect(q[0] - 3, q[1] - 4, 2, 4);
    if (gem || a) glow(0, -196, gem ? 40 : 24, '255,240,190', gem ? 0.9 : 0.45 + 0.15 * pulse); }
  if (e.mode === 'stompTell') { const q = T(-70, -2); g.fillStyle = '#ffd36b'; g.fillRect(q[0], q[1], 140, 2); }
  if (e.mode === 'crackTell') { const q = T(-4, -208); g.fillStyle = '#ffb050'; g.fillRect(q[0], q[1], 8, 8);   /* (claude/colossus3) THE CRACK LINE's tell (it replaced the swarm call) */
    const d = S.crack ? S.crack.dir : fc, lift = d < 0 ? cur.footL : cur.footR, fx = X + d * STOMP_FEET + R(d < 0 ? -cur.fdL : cur.fdR), kk = c01((now - A.t0) / 1.15);
    lite(g, () => radial(g, fx, Y - 3, 12 + 10 * kk, '255,176,80', 0.25 + 0.3 * kk));   /* the sole glows amber as it grinds; sparks scrape off the toe while it is low */
    if (lift < 7) for (let i = 0; i < 5; i++) { const ph0 = (now * 3.2 + i * 0.21) % 1; g.globalAlpha = 1 - ph0; g.fillStyle = i % 2 ? '#fff0c8' : '#ffb050'; g.fillRect(fx + d * (8 + R(ph0 * 16 + i * 3)), Y - 2 - R(ph0 * (10 + 6 * rnd(7, i))), 2, 1); } g.globalAlpha = 1; }
  /* THE SHRUG sheds glass from the pauldrons; THE SHAKE throws it off the whole body; the QUAKE's raised fists gather light; the SWEEP's arm sparks along the floor */
  if (e.mode === 'shardTell' || e.mode === 'shards' || e.mode === 'shake' || e.mode === 'shakeTell') { const many = e.mode === 'shake' ? 12 : e.mode === 'shakeTell' ? 6 : 8, spread = e.mode === 'shake' || e.mode === 'shakeTell' ? 70 : 52, y0 = e.mode === 'shake' || e.mode === 'shakeTell' ? -150 : -172;
    for (let i = 0; i < many; i++) { const u = (now * (e.mode === 'shake' ? 2.6 : 1.7) + i * 0.173) % 1, xx = (i % 2 ? 1 : -1) * (spread - 18 * rnd(i, 4) - (e.mode === 'shake' ? 50 * rnd(i, 9) : 0)), q = T(xx, y0 + R(u * u * 70)); g.globalAlpha = 1 - u * 0.8; g.fillStyle = i % 3 ? pal.l : '#ffffff'; g.fillRect(q[0], q[1], 2, 2 + (i & 1)); } g.globalAlpha = 1; }
  if (e.mode === 'quakeTell') { const k2 = c01((now - A.t0) / 0.9); for (const [kk, sdn] of [['armL', -1], ['armR', 1]]) lite(g, () => radial(g, at[kk][0] + CX + sdn * 79 + R(SH[kk]), at[kk][1] + FY - 22, 12 + 12 * k2, L, 0.15 + 0.5 * k2)); }
  if (e.mode === 'sweep' && S.sweep && S.sweep.live) { const sxp = X + R(S.sweep.x - e.x), dd = S.sweep.dir; for (let i = 0; i < 6; i++) { const u = (now * 4.2 + i * 0.19) % 1; g.globalAlpha = 1 - u; g.fillStyle = i % 2 ? '#ffffff' : pal.l; g.fillRect(sxp - dd * R(u * 12) , Y - 3 - R(u * (8 + 10 * rnd(3, i))), 2, 1 + (i & 1)); } g.globalAlpha = 1; }
  if (e.mode === 'sweepTell' && S.sweep) { const kk = S.sweep.dir < 0 ? 'armL' : 'armR', sdn = S.sweep.dir < 0 ? -1 : 1, u = c01((now - A.t0) / 0.75), dy = 10 + 120 * u; glint(g, at[kk][0] + CX + sdn * 75 + R(SH[kk] * Math.pow(dy / 150, 1.35)), at[kk][1] + FY - 150 + dy, Math.sin(u * Math.PI), '#fff6c8'); }   /* a gleam runs down the raised arm */
  drawActs(g, e, S, X, Y, sway, bob, at, SH, cur, A, now, pal, ph);
  drawFx(g, A, S, e, X, Y, now, pal, ph);
}
/* ================= (claude/colart, ART lane; claude/colossusrework left these on greybox) THE WALK, THE GAZE, THE SHARD LUNGE, THE BRAZIERS ================= */
const hot = (g, x, y, r, a, col) => lite(g, () => radial(g, x, y, r, col || '255,176,96', a));
const star = (g, x, y, len, a, col) => { if (a <= 0.02) return; g.globalAlpha = Math.min(1, a); g.fillStyle = col || '#fff6e0'; g.fillRect(x - len, y, len * 2 + 1, 1); g.fillRect(x, y - len, 1, len * 2 + 1); const q = R(len * 0.55); g.fillRect(x - q, y - q, 1, 1); g.fillRect(x + q, y - q, 1, 1); g.fillRect(x - q, y + q, 1, 1); g.fillRect(x + q, y + q, 1, 1); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.globalAlpha = 1; };
const fillPolyG = (g, pts) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
/* where a hand (the arm on side d) is on the screen this frame: the baked fist's centre carried by the pose (lean, bob, the arm's swing and its shear) */
const handOf = (d, X, Y, at, SH) => { const k = d < 0 ? 'armL' : 'armR'; return [at[k][0] + CX + d * 79 + R(SH[k] * 0.82), at[k][1] + FY - 22]; };
/* a glass SPEAR from its butt to its tip: a faceted shaft with a lit edge, a leaf head with a white tip and a bevel; a = 0..1 the glow of its charge */
function spearArt(g, bx, by, tx, ty, pal, a) {
  const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, hl = Math.min(17, L * 0.3), sx = tx - ux * hl, sy = ty - uy * hl;
  if (a > 0.02) hot(g, tx, ty, 14 + 16 * a, 0.2 + 0.5 * a, '190,255,235');
  line(g, bx, by, sx, sy, '#0a1c26', 5); line(g, bx, by, sx, sy, '#34908c', 3); line(g, bx - nx, by - ny, sx - nx, sy - ny, '#7adcc4', 1); line(g, bx + nx, by + ny, sx + nx, sy + ny, '#e8fff8', 1);   /* the shaft: dark outline, teal body, a lit edge */
  for (let i = 1; i < 5; i++) { const f = i / 5, qx = bx + (sx - bx) * f, qy = by + (sy - by) * f; g.fillStyle = i % 2 ? pal.l : '#ffffff'; g.fillRect(R(qx), R(qy), 1, 1); }   /* facet glints along it */
  fillPoly(g, [[sx + nx * 5.5, sy + ny * 5.5], [tx, ty], [sx - nx * 5.5, sy - ny * 5.5], [sx - ux * 4, sy - uy * 4]], '#0a1c26');   /* the leaf head */
  fillPoly(g, [[sx + nx * 4, sy + ny * 4], [tx - ux * 1.5, ty - uy * 1.5], [sx - nx * 4, sy - ny * 4], [sx - ux * 3, sy - uy * 3]], '#9ae8d0');
  fillPoly(g, [[sx + nx * 4, sy + ny * 4], [tx - ux * 1.5, ty - uy * 1.5], [sx, sy]], '#e8fff8');
  g.fillStyle = '#ffffff'; g.fillRect(R(tx - ux), R(ty - uy), 1, 1); g.fillStyle = pal.vein; g.fillRect(R(bx + (sx - bx) * 0.3), R(by + (sy - by) * 0.3), 1, 1);
}
/* the live, per-frame extras on the body: the stride's footfalls and scrapes, the gaze's eye flare, the spear in his hand */
function drawActs(g, e, S, X, Y, sway, bob, at, SH, cur, A, now, pal, ph) {
  const m = e.mode, W = S.walk;
  /* THE WALK: a footfall (a new W.n) kicks the dust of the foot that came down; the planted foot scrapes (sparks) as the weight passes over it; the tell shakes dust from both heels */
  if (m === 'walk' && W) { if (A.wId !== W.id) { A.wId = W.id; A.wN = W.n; }
    else if (W.n !== A.wN) { A.wN = W.n; A.fx.push({ k: 'foot', x: e.x + W.dir * (STOMP_FEET + 8), d: W.dir, t: now }); if (A.fx.length > 24) A.fx.shift(); }
    const u = c01(1 - W.stepT / COL.strideT); if (u < 0.3) { const fx = X + W.dir * (STOMP_FEET + 8) - W.dir * R(u * 12);
      for (let i = 0; i < 4; i++) { const k = (now * 5 + i * 0.27) % 1; g.globalAlpha = 1 - k; g.fillStyle = i % 2 ? '#fff0c8' : '#ffb050'; g.fillRect(fx + W.dir * R(k * 9 + i), Y - 2 - R(k * (6 + 4 * rnd(5, i))), 2, 1); } g.globalAlpha = 1; } }
  if (m === 'walkTell') for (const sd of [-1, 1]) { const k = ((now - A.t0) * 2.2 + (sd > 0 ? 0.5 : 0)) % 1; dust(g, X + sd * STOMP_FEET, Y, k * 0.7, 2, 17 + (sd > 0 ? 3 : 0), 12, 0.7, DUST[ph]); }
  /* THE GAZE: both eyes burn - a hot bloom, a star, rings that fall inward over the charge (the tell), a steady blaze while the sweep runs */
  if (m === 'gazeTell' || m === 'gaze') { const q = m === 'gaze' ? 1 : c01(1 - e.modeT / COL.gazeTell), fl = m === 'gaze' ? 0.88 + 0.12 * Math.sin(now * 41) : q * q * (3 - 2 * q);
    for (const sd of [-1, 1]) { const ex = X + sway + 9 * sd, ey = Y + bob - 175;
      hot(g, ex, ey, 9 + 20 * fl, 0.18 + 0.55 * fl); star(g, ex, ey, 3 + R(13 * fl), 0.35 + 0.65 * fl, m === 'gaze' ? '#fff6e0' : '#ffd8a0');
      g.fillStyle = '#ff9a5c'; g.fillRect(ex - 4, ey - 1, 8, 3); g.fillStyle = '#fff6e0'; g.fillRect(ex - 3, ey, 6, 1);
      if (m === 'gazeTell') for (let i = 0; i < 2; i++) { const k = ((now / 0.42) + i * 0.5) % 1; g.globalAlpha = k * 0.7 * q; g.strokeStyle = '#ffd8a0'; g.beginPath(); g.arc(ex, ey, 2 + (1 - k) * 24, 0, 6.2832); g.stroke(); g.globalAlpha = 1; } }
    hot(g, X + sway, Y + bob - 172, 38, 0.1 + 0.2 * fl); }
  /* THE SHARD LUNGE (wind-up): the spear, grown out of his fist - a glass shaft, tip up and back, then coming round onto its mark; trembling when it is ready.
     (the release - the flight, the strike, the eruption - is the 'spear' fx laid when the mode turns to lunge) */
  if (m === 'lungeTell' && S.lunge) { const Lg = S.lunge, d = Math.sign(Lg.x - e.x) || (e.face || -1), q = c01(1 - e.modeT / COL.lungeTell), H = handOf(d, X, Y, at, SH), grow = sst(q / 0.3);
    const ms = Lg.mirror >= 0 && S.mirrors[Lg.mirror], tx = X + R(Lg.x - e.x), ty = ms ? Y - 36 : Y - 6, ang0 = Math.atan2(ty - H[1], (tx - H[0]) * d), aUp = Math.atan2(-1, 0.55), a = aUp + (ang0 - aUp) * sst((q - 0.4) / 0.5),
      ux = Math.cos(a) * d, uy = Math.sin(a), len = 104 * grow, tr = q > 0.8 ? Math.sin(now * 70) * 0.8 : 0;
    A.lastHand = [H[0] - X, H[1] - Y];
    if (grow > 0.02) { spearArt(g, R(H[0] - ux * len * 0.35 + tr), R(H[1] - uy * len * 0.35), R(H[0] + ux * len * 0.65 + tr), R(H[1] + uy * len * 0.65), pal, q);
      g.fillStyle = pal.x; g.fillRect(R(H[0]) - 3, R(H[1]) - 3, 7, 7); g.fillStyle = pal.m; g.fillRect(R(H[0]) - 2, R(H[1]) - 2, 5, 5); g.fillStyle = pal.l; g.fillRect(R(H[0]) - 2, R(H[1]) - 2, 5, 1); }   /* his fist closes round the haft */
    if (q > 0.75) hot(g, R(H[0] + ux * len * 0.65), R(H[1] + uy * len * 0.65), 12 + 14 * (q - 0.75) * 4, 0.3, '190,255,235'); }
}
/* THE GAZE's SHADOWS: behind every disc a real shadow - a wedge of dark from the hood to the floor where the shade ends (a facing disc's reaches the wall) - and the faint line where
   his light grazes its edge; the dark on the glass at its foot. Drawn in the tell (a promise: pulsing) and while the sweep runs (solid). live: 0 tell, 1 sweep */
export function drawGazeShades(g, S, G, cx, cy, time, live, shadeLen) {
  const y = R(G.floor - cy), ex = G.cx;
  if (!live && S.gaze && S.art && S.art.cur) { const Z = S.gaze, c = S.art.cur, ox = R(G.cx - cx) + R(c.lean * 0.6), oy = y - 175 + R(c.bob); lite(g, () => { g.strokeStyle = 'rgba(255,190,120,' + (0.16 + 0.1 * Math.sin(time * 14)).toFixed(2) + ')'; g.beginPath(); g.moveTo(ox, oy); g.lineTo(R(Z.x - cx), y - 12); g.stroke(); }); }   /* the eyes sight along the line the sweep will run: a faint aim */
  for (const m of S.mirrors) { const sd = Math.sign(m.x - ex); if (!sd || Math.abs(m.x - ex) < 20) continue; const face = m.notch === 'face', far = face ? (sd < 0 ? G.x0 : G.x1) : m.x + sd * shadeLen(S, m),
      ax = R(m.x + sd * 3 - cx), bx = R(far - cx), top = y - 42; if (Math.max(ax, bx) < -4 || Math.min(ax, bx) > 460) continue;
    const gr = g.createLinearGradient(ax, 0, bx, 0), k = live ? 1 : 0.62 + 0.18 * Math.sin(time * 9);
    gr.addColorStop(0, 'rgba(10,4,32,' + (0.68 * k).toFixed(2) + ')'); gr.addColorStop(0.6, 'rgba(18,8,48,' + (0.5 * k).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(28,14,64,0)');
    g.fillStyle = gr; fillPolyG(g, [[ax, top], [ax, y], [bx, y]]);   /* the shadow volume: the disc's silhouette thrown to the floor */
    g.fillStyle = gr; g.fillRect(Math.min(ax, bx), y - 5, Math.abs(bx - ax), 5);   /* the dark lying on the glass */
    g.globalAlpha = 0.5 * k; g.strokeStyle = '#b8a8ff'; g.beginPath(); g.moveTo(ax + 0.5, top + 0.5); g.lineTo(bx + 0.5, y - 0.5); g.stroke(); g.globalAlpha = 1;   /* the lit edge of the shade */
    if (face) lite(g, () => radial(g, R(m.x - cx), y - 36, 17 + 3 * Math.sin(time * 7), '255,236,170', live ? 0.32 : 0.18 + 0.1 * Math.sin(time * 9))); }   /* a FACING disc shines: it is the one that CATCHES the gaze */
}
/* THE GAZE, live: a cone of burning light from his eyes to the spot on the floor, the spot itself (a white-hot bar in a bloom of heat, embers rising), the scorch it leaves behind it,
   and where a FACING disc catches it a glint (a starburst and a throw of sparks); a disc that only SHADES it takes the beam on its near side, dim */
export function drawGaze(g, e, S, G, cx, cy, time, gazeBlock, W) {
  const Z = S.gaze, A = S.art, cur = A && A.cur; if (!Z || !cur) return;
  const y = R(G.floor - cy), ex = R(G.cx - cx) + R(cur.lean * 0.6), ey = y - 175 + R(cur.bob), sx = R(Z.x - cx), b = gazeBlock(S, Z.x);
  /* the scorch it leaves: glowing slag cooling behind the spot (only where it was lit: never behind a disc's shade) */
  const t0 = Z.dir < 0 ? G.x1 - 6 : G.x0 + 6;
  for (let x = Z.x - Z.dir * 3; (x - t0) * Z.dir >= 0 && Math.abs(x - Z.x) < 170; x -= Z.dir * 5) { const ag = Math.abs(x - Z.x) / 170; if (gazeBlock(S, x)) continue; const q = R(x - cx); if (q < -6 || q > 440) continue;
    g.globalAlpha = (1 - ag) * 0.75; g.fillStyle = ag < 0.25 ? '#ffb050' : ag < 0.6 ? '#c8582c' : '#5a2a32'; g.fillRect(q, y - 2, 5, 2); g.fillStyle = '#0a0410'; g.fillRect(q, y - 1, 5, 1); }
  g.globalAlpha = 1;
  const eyes = [ex - 8, ex + 8];
  if (!b) {
    lite(g, () => { const gr = g.createLinearGradient(ex, ey, sx, y); gr.addColorStop(0, 'rgba(255,200,130,0.1)'); gr.addColorStop(0.7, 'rgba(255,190,110,0.32)'); gr.addColorStop(1, 'rgba(255,230,170,0.66)'); g.fillStyle = gr; fillPolyG(g, [[ex - 7, ey], [ex + 7, ey], [sx + W + 2, y], [sx - W - 2, y]]);
      g.strokeStyle = 'rgba(255,214,150,0.5)'; for (const q of eyes) { g.beginPath(); g.moveTo(q, ey); g.lineTo(sx + (q < ex ? -4 : 4), y - 1); g.stroke(); } });   /* the cone and the two eye-rays that make it */
    g.strokeStyle = 'rgba(255,250,230,0.55)'; g.beginPath(); g.moveTo(ex + 0.5, ey); g.lineTo(sx + 0.5, y - 1); g.stroke();
    lite(g, () => { g.save(); g.translate(sx, y - 1); g.scale(1, 0.28); const gr = g.createRadialGradient(0, 0, 2, 0, 0, 50); gr.addColorStop(0, 'rgba(255,200,120,0.8)'); gr.addColorStop(1, 'rgba(255,120,50,0)'); g.fillStyle = gr; g.fillRect(-50, -50, 100, 100); g.restore(); });   /* the heat on the glass */
    g.fillStyle = '#ff7a3c'; g.fillRect(sx - W - 1, y - 4, W * 2 + 2, 4); g.fillStyle = '#ffb870'; g.fillRect(sx - W + 1, y - 4, W * 2 - 2, 3); g.fillStyle = '#fff6e0'; g.fillRect(sx - W + 3, y - 3, W * 2 - 6, 2); g.fillStyle = '#ffffff'; g.fillRect(sx - 3, y - 3, 6, 1);   /* the burning spot */
    for (let i = 0; i < 7; i++) { const k = (time * 1.9 + i * 0.151) % 1; g.globalAlpha = 1 - k; g.fillStyle = i % 2 ? '#ffd890' : '#ff9a5c'; g.fillRect(sx + R((rnd(i, 3) - 0.5) * W * 2.2), y - 5 - R(k * 24), 1, 2); }   /* embers lift off it */
    g.globalAlpha = 1; star(g, sx, y - 3, 6, 0.5 + 0.3 * Math.sin(time * 33)); }
  else { const mx = R(b.m.x - cx), my = y - 36, caught = b.how === 'caught';
    lite(g, () => { const gr = g.createLinearGradient(ex, ey, mx, my); gr.addColorStop(0, 'rgba(255,200,130,0.06)'); gr.addColorStop(1, 'rgba(255,236,180,' + (caught ? 0.5 : 0.26) + ')'); g.fillStyle = gr; fillPolyG(g, [[ex - 7, ey], [ex + 7, ey], [mx + 8, my + 5], [mx - 8, my - 5]]); });
    g.strokeStyle = 'rgba(255,250,230,' + (caught ? 0.7 : 0.35) + ')'; g.beginPath(); g.moveTo(ex + 0.5, ey); g.lineTo(mx + 0.5, my); g.stroke();
    if (caught) { hot(g, mx, my, 26 + 6 * Math.sin(time * 30), 0.8, '255,240,190'); star(g, mx, my, 12 + R(3 * Math.sin(time * 25)), 1, '#fff6c8');
      for (let i = 0; i < 6; i++) { const k = (time * 2.4 + i * 0.17) % 1, an = -1.2 + i * 0.42 - (b.m.x < G.cx ? 0 : 0.6); g.globalAlpha = 1 - k; g.fillStyle = i % 2 ? '#ffffff' : '#ffd36b'; g.fillRect(mx + R(Math.cos(an) * (6 + k * 26)), my + R(Math.sin(an) * (6 + k * 26)), 2, 1); } g.globalAlpha = 1;   /* the glint thrown off the polished face */
      lite(g, () => { g.strokeStyle = 'rgba(255,236,170,0.45)'; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + (b.m.x < G.cx ? -1 : 1) * 40, my - 40); g.stroke(); }); }   /* and a stray bounce, wasted skyward */
    else hot(g, mx, my, 14, 0.3, '255,200,130'); }
}
/* THE BRAZIERS (the arena's four, Glass Sea fire): a bronze bowl on three legs on a glass plinth, glass lumps heaped on its coals, the flame tall; when its mirror is TO THE FIRE (st.lit) the flame
   leans into the disc (st.dir) and burns tall - the light that is thrown. st = { dir, lit } from src/glass-colossus-hands.js drawBack (setBraziers) */
const BRZ = new Map();
export function setBraziers(list) { BRZ.clear(); for (const [x, st] of list) BRZ.set(Math.round(x), st); }
export const brazierState = x => BRZ.get(Math.round(x)) || null;
export function drawBrazier(g, x, y, time, seed, st) {
  const B = { d: '#4a2e1a', m: '#8a5a2a', l: '#c89a4a', h: '#ffd36b' }, lit = !!(st && st.lit), dir = st ? st.dir : 0, hf = lit ? 1 : 0.7;
  /* the plinth: a fused-glass block, pale on top; the three legs, the stem, the bowl and its bands */
  g.fillStyle = '#175260'; g.fillRect(x - 11, y - 4, 22, 4); g.fillStyle = '#34908c'; g.fillRect(x - 11, y - 4, 22, 2); g.fillStyle = '#c8fff0'; g.fillRect(x - 10, y - 4, 20, 1); g.fillStyle = '#06202e'; g.fillRect(x - 12, y - 1, 24, 1);
  for (const sd of [-1, 1]) for (let i = 0; i < 12; i++) { const lx = x + sd * (3 + R(i * 0.5)); g.fillStyle = B.d; g.fillRect(lx, y - 5 - i, 2, 1); g.fillStyle = B.l; g.fillRect(lx + (sd > 0 ? 0 : 1), y - 5 - i, 1, 1); }
  g.fillStyle = B.d; g.fillRect(x - 1, y - 14, 3, 10); g.fillStyle = B.m; g.fillRect(x - 1, y - 14, 1, 10); g.fillStyle = B.l; g.fillRect(x - 1, y - 14, 1, 3);
  g.fillStyle = B.h; g.fillRect(x - 5, y - 10, 10, 1); g.fillStyle = B.d; g.fillRect(x - 5, y - 9, 10, 1);   /* the cross-ring */
  for (let i = 0; i < 6; i++) { const hw = R(9 - Math.abs(i - 2) * (i > 2 ? 1.2 : 0.4)); g.fillStyle = i === 0 ? B.h : i < 3 ? B.l : i < 5 ? B.m : B.d; g.fillRect(x - hw - 2, y - 21 + i, hw * 2 + 5, 1); }   /* the bowl */
  g.fillStyle = B.d; g.fillRect(x - 12, y - 22, 25, 1); g.fillStyle = B.h; g.fillRect(x - 11, y - 23, 23, 1); g.fillStyle = B.l; g.fillRect(x - 11, y - 22, 3, 1);   /* the rim, lit */
  /* the fuel: pale glass lumps over the embers, each glinting, and a molten glow in the bowl */
  g.fillStyle = '#7a2a10'; g.fillRect(x - 9, y - 24, 19, 2); g.fillStyle = '#ff6a20'; for (let i = 0; i < 7; i++) if ((i + R(time * 5 + seed)) % 2) g.fillRect(x - 8 + i * 3, y - 24, 2, 1);
  for (const [dx, w, h, col] of [[-8, 5, 3, '#7adcc4'], [-3, 4, 4, '#c8fff0'], [2, 5, 3, '#7adcc4'], [6, 3, 2, '#34908c']]) { g.fillStyle = '#0a1c26'; g.fillRect(x + dx - 1, y - 24 - h, w + 2, h + 1); g.fillStyle = col; g.fillRect(x + dx, y - 24 - h + 1, w, h - 1); g.fillStyle = '#ffffff'; g.fillRect(x + dx, y - 24 - h + 1, 1, 1); }
  /* the flame: three tongues (red, amber, white-hot), each swaying on its own beat, all leaning toward its mirror when lit; sparks above */
  const base = y - 26, top = (lit ? 25 : 16) * hf;
  for (let i = 0; i < 3; i++) { const sway = Math.sin(time * (5 + i) + seed * 1.3 + i * 2.1), hh = (top - i * 4.5) * (0.78 + 0.22 * Math.abs(Math.sin(time * 7.3 + i * 1.9 + seed))), w = (lit ? 9 : 7) - i * 2, lean = dir * (lit ? (3 + 4 * i) : 0.8) + sway * 1.2, cols = ['#ff6a2a', '#ffb050', '#fff2a0'];
    for (let r = 0; r < hh; r++) { const f = r / hh, ww = Math.max(1, R(w * (1 - f * f * 0.9))), lx = R(x - ww / 2 + lean * f * f); g.fillStyle = cols[i]; g.fillRect(lx, R(base - r), ww, 1); } }
  for (let i = 0; i < 5; i++) { const t = (time * (lit ? 1.5 : 0.9) + i * 0.2 + seed * 0.13) % 1; g.fillStyle = i % 2 ? '#ffd890' : '#ffb050'; g.fillRect(R(x - 5 + i * 2.5 + dir * t * (lit ? 14 : 3) + Math.sin(t * 6 + i) * 2), R(base - 10 - t * (lit ? 34 : 24)), 1, 1); }
  g.globalCompositeOperation = 'lighter'; const r0 = lit ? 60 : 40, pool = g.createRadialGradient(x, y, 2, x, y, r0); pool.addColorStop(0, 'rgba(255,170,80,' + (lit ? 0.46 : 0.32) + ')'); pool.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = pool; g.save(); g.translate(x, y); g.scale(1, 0.32); g.translate(-x, -y); g.fillRect(x - r0, y - r0, r0 * 2, r0 * 2); g.restore();
  const hg = g.createRadialGradient(x + dir * 3, base - 8, 1, x + dir * 3, base - 8, lit ? 30 : 20); hg.addColorStop(0, 'rgba(255,190,100,' + (lit ? 0.4 : 0.26) + ')'); hg.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = hg; g.fillRect(x - 40, base - 48, 80, 80); g.globalCompositeOperation = 'source-over';
}
/* TOO FAR FROM HIM: the mirror's throw dies a short way from its disc - a dim beam STUB that fades to nothing (motes drifting from its end), plus the dim run from the brazier into the disc.
   ph 2: the firelight, along the floor toward him; ph 3: the dawn, up toward his crown */
export function drawStub(g, m, G, cx, cy, time, ph) {
  const x = R(m.x - cx), y = R(G.floor - cy), sd = m.x < G.cx ? 1 : -1;
  if (ph === 2) { const fx = R(G.fires[m.i] - cx), x0 = x + sd * 6, y0 = y - 38; g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(255,150,60,0.14)'; g.lineWidth = 4; g.beginPath(); g.moveTo(fx, y - 24); g.lineTo(x - sd * 5, y - 38); g.stroke(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,200,130,0.35)'; g.beginPath(); g.moveTo(fx, y - 24); g.lineTo(x - sd * 5, y - 38); g.stroke();   /* brazier -> disc, dim */
    const gr = g.createLinearGradient(x0, 0, x0 + sd * 46, 0); gr.addColorStop(0, 'rgba(255,170,90,0.45)'); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0 - 2); g.lineTo(x0 + sd * 46, y - 3); g.lineTo(x0 + sd * 46, y); g.lineTo(x0, y0 + 2); g.closePath(); g.fill();
    g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 4; i++) { const k = (time * 0.8 + i * 0.25) % 1; g.globalAlpha = (1 - k) * 0.7; g.fillStyle = i % 2 ? '#ffd890' : '#ffb050'; g.fillRect(x0 + sd * R(30 + k * 18 + i * 3), y - 5 - R(k * 8 + (i % 2) * 3), 1, 1); } g.globalAlpha = 1; }
  else { const x0 = x, y0 = y - 42; g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x0, y0, x0 + sd * 22, y0 - 40); gr.addColorStop(0, 'rgba(255,240,190,0.5)'); gr.addColorStop(1, 'rgba(255,230,160,0)');
    g.strokeStyle = gr; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + sd * 22, y0 - 40); g.stroke(); g.lineWidth = 1; g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) { const k = (time * 0.7 + i * 0.25) % 1; g.globalAlpha = (1 - k) * 0.7; g.fillStyle = i % 2 ? '#fff6c8' : '#ffe08a'; g.fillRect(x0 + sd * R(14 + k * 14), y0 - R(26 + k * 14), 1, 1); } g.globalAlpha = 1; }
}
/* THE HOLDS: crystal ledges growing out of the body, glowing; they flash at the shake's tell */
export function drawHolds(g, e, S, G, cx, cy, time) {
  const tellShake = e && e.mode === 'shakeTell', pulse = 0.5 + 0.5 * Math.sin(time * 4), off = G.col != null ? R(G.cx - G.col * G.TS) : 0;   /* (claude/colart) the slabs glide with his centre: the tiles are re-laid a column (16 px) at a time, the DRAWING eases the rest */
  const paint = (l, i, kind) => { const x = R(l.l - cx) + off, y = R(l.y - cy), w = R(l.r - l.l), body = l.l < G.cx;
    const rows = ['#ffffff', '#c8fff0', '#7adcc4', '#7adcc4', '#34908c', '#175260'];   /* a polished slab, six rows thick: white-hot top, mint, teal, a dark underside */
    for (let r = 0; r < 6; r++) { g.fillStyle = rows[r]; g.fillRect(x + (r === 0 ? 1 : 0), y + r, w - (r === 0 ? 2 : 0), 1); }
    g.fillStyle = '#e6fff6'; for (let k = 6; k < w - 3; k += 9) g.fillRect(x + k, y + 2, 1, 3);   /* facet ticks */
    g.fillStyle = '#0a1c26'; g.fillRect(x, y + 6, w, 1); g.fillRect(x - 1, y + 1, 1, 5); g.fillRect(x + w, y + 1, 1, 5); g.fillRect(x + 1, y - 1, w - 2, 1);
    for (let k = 0; k < 3; k++) { const ix = x + 3 + R((w - 8) * k / 2), len = 3 + (k % 2) * 2; g.fillStyle = '#7adcc4'; g.fillRect(ix, y + 7, 2, len); g.fillStyle = '#ffffff'; g.fillRect(ix, y + 7 + len - 1, 1, 1); }   /* glass drips under the slab */
    const outer = body ? x : x + w, dir = body ? -1 : 1, tx = outer + (dir < 0 ? -5 : 0);   /* the free end: a big crystal tooth, lit, with a violet vein; the other end is inside the limb */
    g.fillStyle = '#34908c'; g.fillRect(tx, y + 2, 5, 6); g.fillStyle = '#7adcc4'; g.fillRect(tx + (dir < 0 ? 0 : 1), y + 1, 3, 6); g.fillStyle = '#e6fff6'; g.fillRect(tx + (dir < 0 ? 0 : 1), y, 2, 3); g.fillStyle = '#b89cff'; g.fillRect(tx + 2, y + 4, 1, 3);
    const k2 = tellShake ? 0.5 + 0.5 * Math.sin(time * 20) : 0.2 + 0.12 * pulse; g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, k2 + (tellShake ? 0.3 : 0)); const gr = g.createLinearGradient(0, y - 14, 0, y + 2); gr.addColorStop(0, 'rgba(255,214,110,0)'); gr.addColorStop(1, 'rgba(255,232,150,1)'); g.fillStyle = gr; g.fillRect(x - 2, y - 14, w + 4, 16); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
  G.knee.forEach((l, i) => paint(l, i)); G.hip.forEach((l, i) => paint(l, i)); G.shoulder.forEach((l, i) => paint(l, i));
}
/* a SHELF-MIRROR (the arena's two): a bronze hood on a post, a polished disc turned by its notch */
export function drawShelfMirror(g, m, G, cx, cy, time, bossPh) {
  const x = R(m.x - cx), y = R(G.floor - cy), left = m.x < G.cx, B = { d: '#4a2e1a', m: '#8a5a2a', l: '#c89a4a', h: '#ffd36b' };
  g.fillStyle = B.d; g.fillRect(x - 6, y - 4, 12, 4); g.fillStyle = B.m; g.fillRect(x - 6, y - 4, 12, 1); g.fillRect(x - 2, y - 32, 4, 29); g.fillStyle = B.l; g.fillRect(x - 2, y - 32, 1, 29);
  const hy = y - 36;
  /* the hood: a bronze bowl behind the disc, opening toward where it faces */
  g.fillStyle = B.d; g.fillRect(x - 9, hy - 6, 18, 12); g.fillStyle = B.m; g.fillRect(x - 8, hy - 6, 16, 2); g.fillStyle = B.l; g.fillRect(x - 8, hy - 6, 16, 1);
  const n = m.notch, glass = '#d8f8ff';
  if (n === 'face') { /* upright, facing the giant (its lance is thrown back): a tall oval */ const tip = left ? 1 : -1; for (let i = -8; i <= 8; i++) { const hh = R(Math.sqrt(Math.max(0, 1 - (i / 8) * (i / 8))) * 3); const xx = x + tip * (3 + hh); g.fillStyle = B.d; g.fillRect(xx - 1, hy + i, 1 + hh, 1); g.fillStyle = glass; g.fillRect(xx, hy + i, Math.max(1, hh), 1); } g.fillStyle = '#fff'; g.fillRect(x + tip * 4, hy - 3, 1, 3); }
  else if (n === 'fire') { const dir = left ? 1 : -1; for (let i = -8; i <= 8; i++) { const yy = hy + R(i * 0.5 * -dir), xx = x + i; g.fillStyle = B.d; g.fillRect(xx, yy - 1, 1, 3); g.fillStyle = '#ffd8a0'; g.fillRect(xx, yy, 1, 1); } }
  else { for (let i = -8; i <= 8; i++) { const hh = R((1 - (i / 8) * (i / 8)) * 2); g.fillStyle = B.d; g.fillRect(x + i, hy - hh - 1, 1, 2 * hh + 3); g.fillStyle = glass; g.fillRect(x + i, hy - hh, 1, 2 * hh + 1); } }
  g.fillStyle = B.h; g.fillRect(x - 1, hy - 1, 3, 3);
  /* the notch dial: three studs under the hood, the lit one is where it points */
  const ni = ['face', 'fire', 'sky'].indexOf(n); g.fillStyle = B.d; g.fillRect(x - 9, hy + 9, 18, 5); for (let i = 0; i < 3; i++) { g.fillStyle = i === ni ? '#fff0a0' : '#2a2a34'; g.fillRect(x - 7 + i * 6, hy + 10, 4, 3); }
}
/* THE FAR ONE for the horizon: the silhouette at 0.47 in one flat colour per hour (k 0 day .. 1 night), with a lit edge */
export function farSprite(k) {
  const v = Math.max(0, Math.min(4, R(k * 4)));
  return once('far' + v, () => { const s = 0.47, [c, g] = canvas(112, 108), ox = 56, oy = 106; const cols = ['#84b8b4', '#7a90b8', '#704c92', '#34346e', '#0a1430'], lit = ['#dff8f0', '#e8e8f4', '#ffc890', '#6a7ad0', '#2a4a88'];
    const fx = x => ox + x * s, fy = y => oy + y * s;
    for (const [, pts] of SHAPES) for (const side of [-1, 1]) { const P = side < 0 ? pts : mir(pts); fillPoly(g, P.map(([x, y]) => [fx(x), fy(y)]), cols[v]); }
    for (const [, pts] of SHAPES) { for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if (a[0] > -1 || b[0] > -1) continue; const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1; if ((dy / len) * -0.6 + (-dx / len) * -0.8 > 0.35) line(g, fx(a[0]), fy(a[1]), fx(b[0]), fy(b[1]), lit[v], 1); } }
    for (const [x, h] of [[-18, 14], [-11, 20], [-4, 24], [4, 24], [11, 20], [18, 14]]) fillPoly(g, [[fx(x - 2.5), fy(-192)], [fx(x), fy(-192 - h)], [fx(x + 2.5), fy(-192)]], cols[v]);
    return c; });
}
export function sheetItems() { return [bakeBody(0), bakeBody(1), bakeBody(2), farSprite(0), farSprite(2), farSprite(4)]; }
