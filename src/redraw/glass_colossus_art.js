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
/* THE COLOSSUS: the baked body, then its live cracks. e = the entity (mode/open/hurtT), S = the fight state, G = geom; the centre line is e.x, the floor G.floor */
export function drawBody(g, e, S, G, cx, cy, time, flash, pose) {
  const ph = phIdx(S.ph), pal = PAL[ph], X = R(e.x - cx), Y = R(G.floor - cy), p = pose || { lean: 0, bob: 0, footL: 0, footR: 0, armL: [0, 0], armR: [0, 0] };
  /* (claude/glasssea2) THE POSE: the trunk leans (half at the hips) and bobs; a foot lifts; an arm swings out and up (a fist never under the floor) */
  const sway = R(p.lean * 0.6), ox = X - CX + sway, oy = Y - FY + p.bob;
  const at = { armL: [ox - p.armL[0], Y - FY + Math.min(2, p.bob + p.armL[1])], armR: [ox + p.armR[0], Y - FY + Math.min(2, p.bob + p.armR[1])], legL: [X - CX, Y - FY - p.footL], legR: [X - CX, Y - FY - p.footR] };
  for (const k of ['armL', 'armR', 'legL', 'legR']) { const L = bakePart(ph, k); g.drawImage(L, at[k][0], at[k][1]); if (flash) { g.globalAlpha = 0.7; g.drawImage(once('w' + ph + k, () => whiten(L)), at[k][0], at[k][1]); g.globalAlpha = 1; } }
  const core = bakeCore(ph); g.drawImage(core, ox, oy);
  if (flash) { g.globalAlpha = 0.7; g.drawImage(once('corew' + ph, () => whiten(core)), ox, oy); g.globalAlpha = 1; }   /* the hit flash: a white silhouette over it */
  const T = (x, y) => [X + sway + x, Y + p.bob + y];   /* centre-line relative (on the trunk) */
  const glow = (x, y, r, col, a) => { const q = T(x, y); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(q[0], q[1], 1, q[0], q[1], r); gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(q[0] - r, q[1] - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over'; };
  const crack = (x, y, len, w, col, bright) => {   /* a jagged crack: a dark seam, with a lit core when it is open */
    const q = T(x, y), pts = [[0, 0], [w * 0.4, len * 0.25], [-w * 0.3, len * 0.5], [w * 0.5, len * 0.75], [0, len]]; g.fillStyle = '#050a14';
    for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; const steps = Math.max(1, R(Math.abs(b[1] - a[1]))); for (let s = 0; s <= steps; s++) { const t = s / steps; g.fillRect(R(q[0] + a[0] + (b[0] - a[0]) * t), R(q[1] - len / 2 + a[1] + (b[1] - a[1]) * t), bright ? 3 : 2, 1); } }
    if (bright) { g.fillStyle = col; for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1]; const steps = Math.max(1, R(Math.abs(b[1] - a[1]))); for (let s = 0; s <= steps; s++) { const t = s / steps; g.fillRect(R(q[0] + a[0] + (b[0] - a[0]) * t) + 1, R(q[1] - len / 2 + a[1] + (b[1] - a[1]) * t), 1, 1); } } } };
  const pulse = 0.5 + 0.5 * Math.sin(time * 5);
  /* the veins glow: faint at dusk, strong at night, a rose shimmer at dawn */
  const night = S.ph === 2;
  if (night) { glow(0, -118, 46, '96,224,255', 0.18 + 0.1 * pulse); glow(0, -176, 20, '154,240,255', 0.3); }
  /* its EYES: two slits under the brow */
  const eyeCol = pal.eye; g.fillStyle = eyeCol; for (const sd of [-1, 1]) { const q = T(9 * sd - 4, -176); g.fillRect(q[0], q[1], 8, 2); g.fillStyle = '#ffffff'; g.fillRect(q[0] + (sd < 0 ? 4 : 1), q[1], 3, 1); g.fillStyle = eyeCol; }
  glow(0, -176, 22, night ? '120,230,255' : '255,240,180', 0.22 + 0.1 * pulse);
  /* THE KNEE CRACKS: gold while the leg purse lasts, glazed pale once it is spent (a pale seam with a white sheen) */
  const live = S.legPurse > 0;
  for (const sd of [-1, 1]) { crack(34 * sd, -52, 18, 5, live ? '#ffd36b' : '#c8d8e8', true); if (live) glow(34 * sd, -52, 22, '255,200,90', 0.28 + 0.12 * pulse); else { const q = T(34 * sd, -52); g.fillStyle = 'rgba(210,225,240,0.5)'; g.fillRect(q[0] - 7, q[1] - 10, 14, 20); } }
  /* THE CHEST CORE: dark and shut; the lance's light gathers in it before it fires; cracked open it is a gold wound */
  const cored = e.mode === 'cracked', tell = e.mode === 'lanceTell';
  if (tell) { const a = 0.45 + 0.5 * Math.sin(time * 18); glow(0, -122, 38, '255,236,170', a); const q = T(-9, -130); g.globalAlpha = a; g.fillStyle = '#fff6c8'; g.fillRect(q[0], q[1], 18, 18); g.globalAlpha = 1; }
  if (cored) { crack(-2, -122, 26, 8, '#ffd36b', true); crack(5, -118, 20, 6, '#fff6c8', true); glow(0, -122, 44, '255,200,90', 0.5 + 0.2 * pulse); const q = T(-12, -134); g.globalAlpha = 0.4; g.fillStyle = '#ffd36b'; g.fillRect(q[0], q[1], 24, 24); g.globalAlpha = 1; }
  else { const q = T(-2, -134); g.fillStyle = 'rgba(5,10,20,0.9)'; g.fillRect(q[0], q[1], 1, 6); g.fillRect(q[0] + 1, q[1] + 3, 1, 5); }
  /* THE SHOULDER CRACKS (night): a violet seam; blazing = a cyan-white fire */
  const blaze = e.mode === 'blazing';
  for (const sd of [-1, 1]) { if (S.ph === 2) { crack(44 * sd, -162, 18, 6, blaze ? '#ffffff' : '#a888ff', true); if (blaze) glow(44 * sd, -162, 30, '154,240,255', 0.6 + 0.2 * pulse); else glow(44 * sd, -162, 16, '154,120,255', 0.2); } else crack(44 * sd, -162, 16, 4, '#ffffff', false); }
  /* THE CROWN GEM: a sun-gem in the diadem; at dawn it burns, dazzled it is white */
  const gem = e.mode === 'dazzled'; { const q = T(0, -196), a = S.ph === 3; g.fillStyle = '#05080f'; g.fillRect(q[0] - 5, q[1] - 6, 10, 12); g.fillStyle = gem ? '#ffffff' : a ? '#ffd36b' : S.ph === 2 ? '#5a4aa8' : '#c8a028'; g.fillRect(q[0] - 4, q[1] - 5, 8, 10); g.fillStyle = gem ? '#ffffff' : '#fff6c8'; g.fillRect(q[0] - 3, q[1] - 4, 2, 4);
    if (gem || a) glow(0, -196, gem ? 40 : 24, '255,240,190', gem ? 0.9 : 0.45 + 0.15 * pulse); }
  if (e.mode === 'stompTell') { const q = T(-70, -2); g.fillStyle = '#ffd36b'; g.fillRect(q[0], q[1], 140, 2); }
  if (e.mode === 'crackTell') { const q = T(-4, -208); g.fillStyle = '#ffb050'; g.fillRect(q[0], q[1], 8, 8); }   /* (claude/colossus3) THE CRACK LINE's tell (it replaced the swarm call) */
}
/* THE HOLDS: crystal ledges growing out of the body, glowing; they flash at the shake's tell */
export function drawHolds(g, e, S, G, cx, cy, time) {
  const tellShake = e && e.mode === 'shakeTell', pulse = 0.5 + 0.5 * Math.sin(time * 4);
  const paint = (l, i, kind) => { const x = R(l.l - cx), y = R(l.y - cy), w = R(l.r - l.l), body = x < R(G.cx - cx);
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
