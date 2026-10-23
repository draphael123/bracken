// sporewood2_mother.js - THE MOTHER CAP 2's BAKED FRAMES (claude/sporewood2art; B16: every ability has ITS OWN windup + release pose from her kit). The greybox drew the old sallow cap and
// stalk with rotate/scale tricks; here every pose is its own picture, painted once at the level load (src/mother-cap2.js picks the frame by her mode and how far into it she is):
//   idle      the plum cap closed over cream gills, the stalk root-barked, her eyes under the gills; a breath
//   lashTell  she HUNKERS: the cap dips, her roots rise off the floor like cobras with ember tips        lash     the roots flung flat along the floor to one side, the cap tilting after
//   crushTell the cap LIFTS off its stalk (a gap, the gills spread down) to be dropped              crush    the cap slammed back down, wide and squat, dust at the floor
//   bloomTell the gills FLARE and light violet, spore plumes streaming off the rim                    bloom    the gills let go: a spray of spores from the whole rim
//   broodTell the cap tips back and puffballs SWELL under the gills (pale lumps)                    brood    the lumps dropped: empty pockets, the cap tipping forward
//   witherTell a root-limb rises from her side, its tip blighted violet, her stalk leaning to the cap she means   wither   the limb slashed down, a cloud of blight
//   open      HER KNOT TORN: the crown split, the hot heart showing, the cap thrown back (2 frames, pulsing)        ward   the cap sealed and pearl-bright (the told ward)
//   phaseRise the second phase: she rises taller, her roots erupting round her, the gills lit            wake   up out of the floor
// Every pose has a P1 and a P2 picture; P2 wears the NET: foxfire veins down the stalk and across the cap, scars. The one glow is foxfire; gold stays the target (her knot's seam).
// frames(phase) -> { name: canvas } sized W x H with the foot at (AX, AY).   frameFor(e, pose, phase) -> { c, flip } for the mode / progress main draws.
import { canvas, mulberry, outline } from '../px.js';
import { PAL, GLOW, mix, hash } from './sporewood2_pal.js';

export const MW = 200, MH = 172, AX = 100, AY = 168;
const CAP = PAL[5].cap, DEEP = '#2a1636', HI = '#e8d0f0', VEIL = '#e8ddc0', VEILD = '#a89870';
const BARK = ['#1e1218', '#3c2a2e', '#5e4642', '#86685c', '#b09480'];
const memo = {};
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };

/* ---- HER FACE (claude/motherface): THE OLD MATRON IN THE STALK. A wrinkled bark-flesh face grown into the neck under the cap: heavy brows, deep-set FOXFIRE eyes (the wood's one glow), a long crooked nose
   ridge, a wide lipless mouth, the gills hanging beside it like hair. Every pose sets its expression (P.eye, gx/gy gaze, brow tilt, mouth, cheek puff or hollow, jaw drop, spray, sag); P2 (net) blazes the eyes,
   snarls the idle mouth and lays foxfire veins across the face. (fx, fy) = the plate's centre column and top row; the plate is 25 wide x 27 tall (more with a dropped jaw). */
const FLESH = ['#2c1a20', '#5c403e', '#8a6a5a', '#b49478', '#d6bc9c'], SOCK = '#0c060e', BONE = '#efe4c6', THROAT = '#3a0e26', TONGUE = ['#a83a58', '#d8647e', '#f4a0b4'];
function paintFace(g, P, fx, fy, net) {
  const sag = P.sag, jaw = P.jaw, ch = P.cheek, put = (x, y, c, w = 1, h = 1) => R(g, sag > 0 ? mix(c, '#2a1c1c', 0.35 * sag) : c, fx + x, fy + y, w, h);
  let eye = P.eye, mouth = P.mouth; if (net) { if (eye === 'open' || eye === 'wide') eye = 'blaze'; if (mouth === 'line') mouth = 'snarl'; }
  const plateH = 27 + jaw + Math.round(sag * 2), m0 = 21 + Math.round(sag * 2);
  const hwAt = r => Math.round((r <= 12 ? 12 : Math.max(6, 12 - (r - 12) * 0.45)) + (r >= 12 && r <= 23 ? ch * 2.2 : 0));
  /* the plate */
  for (let r = 0; r < plateH; r++) { const hw = r > 26 && jaw ? Math.max(5, hwAt(26) - (r - 26)) : hwAt(r);
    for (let x = -hw; x <= hw; x++) { const u = x / hw; let c = u < -0.4 ? FLESH[3] : u > 0.5 ? FLESH[1] : FLESH[2]; if (r < 2) c = FLESH[1]; if (Math.abs(x) === hw || r === plateH - 1) c = FLESH[0];
      else if (hash(x + 40, r) % 9 === 0) c = c === FLESH[3] ? FLESH[2] : c === FLESH[2] ? FLESH[1] : FLESH[0];
      if (ch < 0 && r >= 13 && r <= 22 && Math.abs(x) >= 5 && Math.abs(x) < hw) c = Math.abs(x) % 2 ? FLESH[0] : FLESH[1];   /* hollow cheeks */
      put(x, r, c); } }
  if (ch > 0) for (const s of [-1, 1]) { put(s * 8, 15, FLESH[4], 2, 2); put(s * 8 + (s > 0 ? 2 : -1), 17, FLESH[1], 1, 2); }
  /* wrinkles: the forehead, crow's feet, the lines from the nose to the mouth, the chin */
  for (const s of [-1, 1]) { for (let i = 3; i <= 9; i++) if (hash(i, s + 9) % 5) put(s * i, 2, FLESH[1]); for (let i = 4; i <= 7; i++) if (hash(i, s + 5) % 3) put(s * i, 3, FLESH[0]);
    put(s * 11, 9, FLESH[0]); put(s * 11, 11, FLESH[0]); put(s * 12, 10, FLESH[0]); for (let k = 0; k < 6; k++) put(s * (4 + Math.floor(k * 0.7)), 14 + k, FLESH[0]); put(s * 9, 24 + jaw, FLESH[1], 1, 2); }
  for (let i = -3; i <= 3; i++) if (hash(i, 4) % 2) put(i, plateH - 4, FLESH[1]);
  /* the nose: a long crooked ridge, lit on the left, bending right, a hooked tip */
  for (let r = 8; r <= 16; r++) { const cx = r < 12 ? 0 : r < 15 ? 1 : 2; put(cx - 1, r, FLESH[4]); put(cx, r, r > 11 ? FLESH[3] : FLESH[2]); put(cx + 1, r, FLESH[0]); }
  put(1, 17, FLESH[3], 4, 1); put(0, 17, FLESH[0]); put(3, 17, FLESH[0]); put(1, 18, FLESH[0], 4, 1); put(2, 18, SOCK); put(4, 18, SOCK);
  /* the brows: heavy shelves, tilted by P.brow (+ angry: the inner end drops; - worried / raised) */
  const lift = eye === 'up' ? -1 : 0;
  for (const s of [-1, 1]) for (let i = 0; i <= 8; i++) { const dy = Math.round(P.brow * (1.4 - i * 0.4)) + lift, y = 5 + dy, x = s * (3 + i); put(x, y - 1, FLESH[4]); put(x, y, FLESH[0], 1, 2 + (i < 6 ? 1 : 0)); }
  /* the eyes: dark sockets, foxfire in them */
  const bright = eye === 'blaze' || (net && eye !== 'shut' && eye !== 'dim' && eye !== 'out' && eye !== 'back'), gx = P.gx, gy = P.gy;
  for (const s of [-1, 1]) { const ex = s > 0 ? 4 : -9;
    put(ex - 1, 8, SOCK, 8, 5); put(ex, 13, FLESH[0], 6, 1);
    if (eye === 'shut') { put(ex, 11, FLESH[0], 6, 1); put(ex, 10, FLESH[1], 6, 1); if (P.brow >= 2) { put(s * 11, 8, FLESH[0]); put(s * 11, 12, FLESH[0]); } }
    else if (eye === 'dim') { put(ex + 2, 10, GLOW.lo, 2, 1); }
    else if (eye === 'out') { /* an empty socket */ }
    else if (eye === 'back') { put(ex, 9, '#a8bcae', 6, 3); put(ex, 9, '#6a8a82', 6, 1); put(ex + 1, 10, '#d8e8dc', 2, 1); put(ex + 4, 11, '#7a9a90', 1, 1); }
    else { const big = eye === 'wide' || eye === 'blaze', h = eye === 'slit' ? 1 : eye === 'narrow' ? 2 : big ? 5 : 3, y0 = big ? 8 : eye === 'slit' ? 11 : eye === 'narrow' ? 10 : 9;
      put(ex, y0, GLOW.mid, 6, h); if (h > 1) { put(ex, y0, GLOW.lo, 6, 1); put(ex + 1, y0 + 1, GLOW.c, 4, Math.max(1, h - 2)); }
      if (eye === 'up') put(ex, 11, GLOW.hi, 6, 1);
      const px = ex + 2 + Math.round((gx + 1) * 1), py = eye === 'up' ? 9 : eye === 'narrow' ? 10 : y0 + Math.min(h - 1, Math.max(0, Math.floor(h / 2) - 1 + (gy > 0 ? 1 : 0)));
      if (eye !== 'slit') put(px, py, SOCK, 2, Math.min(2, h)); else put(px + 1, 11, SOCK);
      put(px + (s > 0 ? 0 : 1), y0 + (h > 2 ? 1 : 0), GLOW.hi, 1, 1);
      if (bright) { put(ex, 13, GLOW.mid, 6, 1); put(ex + 1, 7, GLOW.lo, 4, 1); g.globalAlpha = 0.5; put(ex - 2, 8, GLOW.c, 1, 5); put(ex + 7, 8, GLOW.c, 1, 5); put(ex, 14, GLOW.c, 6, 1); g.globalAlpha = 1; } } }
  /* the mouth: wide, lipless */
  const teeth = (x0, x1, y, down) => { for (let x = x0; x <= x1; x++) if ((x & 1) === 0) put(x, y, BONE, 1, down); };
  if (mouth === 'line') { put(-6, m0, FLESH[0], 13, 1); put(-9, m0 + 1, FLESH[0], 3, 1); put(7, m0 + 1, FLESH[0], 3, 1); put(-5, m0 + 1, FLESH[1], 11, 1); for (const x of [-7, -3, 2, 6]) put(x, m0 - 1, FLESH[1]); }
  else if (mouth === 'bared' || mouth === 'snarl') { const tall = mouth === 'snarl' ? 5 : 3; put(-8, m0 - 1, FLESH[0], 17, 1); put(-9, m0 + 1, FLESH[0], 2, tall - 1); put(8, m0 + 1, FLESH[0], 2, tall - 1); put(-8, m0, SOCK, 17, tall); teeth(-7, 7, m0, 2); for (let x = -6; x <= 6; x += 2) put(x, m0 + tall - 1, BONE, 1, 1);
    if (mouth === 'snarl') for (const x of [-5, 5]) put(x, m0 + 2, BONE, 1, 2); put(-8, m0 + tall, FLESH[0], 17, 1); }
  else if (mouth === 'grit') { put(-8, m0 - 1, FLESH[0], 17, 1); put(-8, m0, BONE, 17, 3); for (let x = -8; x <= 8; x += 2) put(x, m0, FLESH[1], 1, 3); put(-8, m0 + 1, FLESH[3], 17, 1); put(-9, m0 + 1, FLESH[0], 1, 4); put(9, m0 + 1, FLESH[0], 1, 4); put(-8, m0 + 3, FLESH[0], 17, 1); }
  else if (mouth === 'gape') { const ry = 4 + Math.round(jaw * 0.9), rx = 8; for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx; dx <= rx; dx++) { const d = dx * dx / (rx * rx) + dy * dy / (ry * ry); if (d > 1) continue; put(dx, m0 + ry + dy - 1, d > 0.72 ? FLESH[0] : dy > 1 ? THROAT : SOCK); }
    for (let x = -6; x <= 6; x++) if ((x & 1) === 0) put(x, m0, BONE, 1, 2); put(-5, m0 + 2 * ry - 3, TONGUE[0], 11, 2); put(-3, m0 + 2 * ry - 3, TONGUE[1], 7, 1);
    for (let i = 0; i < 5; i++) put(-4 + i * 2, m0 + 3 + (i % 2) * 2, P.spray ? '#c9a0ff' : '#6a3a8a'); }
  else if (mouth === 'slack') { put(-6, m0, FLESH[0], 13, 1); put(-7, m0 + 1, SOCK, 15, 4); put(-6, m0 + 5, FLESH[0], 13, 1); put(-9, m0 + 3, FLESH[0], 2, 2); put(7, m0 + 3, FLESH[0], 2, 2); put(-4, m0 + 1, BONE, 2, 1); put(2, m0 + 1, BONE, 3, 1);
    if (P.tongue) { put(0, m0 + 3, TONGUE[1], 6, 2); put(1, m0 + 5, TONGUE[1], 5, P.tongue - 1); put(1, m0 + 5, TONGUE[2], 1, P.tongue - 1); put(2, m0 + 4 + P.tongue, TONGUE[0], 3, 1); put(4, m0 + 5 + P.tongue, '#7fe8c8', 1, 2); } }
  else if (mouth === 'sucked') { put(-2, m0 - 1, SOCK, 5, 5); put(-3, m0, SOCK, 7, 3); put(-1, m0 - 2, FLESH[0], 3, 1); put(-1, m0 + 4, FLESH[0], 3, 1); for (const s of [-1, 1]) { put(s * 5, m0 - 1, FLESH[0]); put(s * 5, m0 + 1, FLESH[0]); put(s * 6, m0, FLESH[0]); put(s * 4, m0 - 2, FLESH[0]); put(s * 4, m0 + 3, FLESH[0]); put(s * 7, m0 + 1, FLESH[1]); } }
  else if (mouth === 'wince') { put(-8, m0 - 1, FLESH[0], 17, 1); put(-8, m0, BONE, 17, 2); for (let x = -8; x <= 8; x += 2) put(x, m0, FLESH[1], 1, 2); put(-9, m0 + 1, FLESH[0], 2, 3); put(8, m0 + 1, FLESH[0], 2, 3); put(-8, m0 + 2, FLESH[0], 17, 1); }
  /* the spray out of the mouth (bloom / wither): puffs of lilac fanning down and out */
  if (P.spray > 0) { for (const s of [-1, 1]) for (let j = 0; j < 4; j++) { const rr = 2 + (j % 3), bx = fx + s * Math.round(3 + j * 5 * P.spray), by = fy + m0 + 7 + jaw + Math.round(j * 3 * P.spray); for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (dx * dx + dy * dy <= rr * rr) R(g, dx + dy < -rr * 0.5 ? '#efe6ff' : dx + dy > rr * 0.6 ? '#9a6ac8' : '#c9a0ff', bx + dx, by + dy, 1, 1); } for (let i = 0; i < 7; i++) R(g, i % 2 ? '#ffffff' : '#c9a0ff', fx - 18 + hash(i, 11) % 37, fy + m0 + 8 + hash(i, 13) % 12, 1, 1); }
  if (P.mouthPuff) { const rr = 4; for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (dx * dx + dy * dy <= rr * rr) R(g, dx + dy < -2 ? '#f6f2e2' : dx + dy > 2 ? '#8a8670' : '#d6d0bc', fx + dx, fy + m0 + 7 + jaw + dy, 1, 1); }
  /* the dazed swirl (knot open): two foxfire spirals circling her head */
  if (P.swirl) { const ph = P.swirl === -1 ? 0 : P.swirl; for (const s of [-1, 1]) for (let i = 0; i < 14; i++) { const a = i * 0.55 + ph * 6.28 * s, rr = 1 + i * 0.5; R(g, i > 9 ? GLOW.hi : i % 3 ? '#ffd36b' : GLOW.c, fx + s * 21 + Math.round(Math.cos(a) * rr), fy + 12 + Math.round(Math.sin(a) * rr * 0.8), 1, 1); } }
  /* P2: the net lays foxfire veins over her face */
  if (net && eye !== 'out' && eye !== 'dim') for (const [sx, sy, dir] of [[-10, 9, -1], [10, 9, 1], [-3, 2, -1], [4, 2, 1], [-8, 15, -1], [8, 15, 1], [0, 19, 1]]) { let x = sx, y = sy; for (let k = 0; k < 10; k++) { put(x, y, k % 3 ? GLOW.lo : GLOW.mid); if (k % 4 === 0) put(x + dir, y, GLOW.lo); x += dir * (hash(sx + k, sy) % 2); y += (k % 2); if (Math.abs(x) > 11 || y > plateH - 2) break; } }
}
/* the gills hang from the cap's rim down both sides of her face like hair: cream strands with a dark root, longer near her cheeks */
function paintFringe(g, P, lxAt, rimAt, domeW, gillD, capCx, stalkTop) {
  const sag = P.sag;
  for (const side of [-1, 1]) for (let j = 0; j < 6; j++) { const off = 14 + j * 2.6 + (j % 2), u = side * Math.min(0.92, off / domeW), y0 = rimAt(u) + Math.max(2, Math.round(gillD * 0.55)), len = 12 + hash(j, side + 3) % 8 + (j < 3 ? 9 : 0) + Math.round(sag * 5);
    for (let k = 0; k < len; k++) { const y = y0 + k, x = lxAt(y) + side * (Math.round(off) + Math.round(Math.sin(k * 0.33 + j) * 1.4) + (k > len * 0.6 ? 1 : 0)); R(g, k < 2 ? DEEP : k > len - 3 ? '#a89870' : k % 3 === 0 ? '#c8b898' : VEIL, x, y, 1, 1); if (j < 2 && k % 2) R(g, '#c8b898', x - side, y, 1, 1); } }
}
/* P: the pose's numbers. defaults = idle */
const D = { capDy: 0, capDx: 0, capSx: 1, capSy: 1, tilt: 0, gill: 0, glow: 0, lean: 0, sy: 1, roots: 0, rootDir: 0, rootGlow: 0, arm: 0, blight: 0, plumes: 0, puffs: 0, drop: 0, open: 0, shell: 0, rage: 0, dust: 0, shake: 0, low: 0, burst: 0, eye: 'open', gx: 0, gy: 0, brow: 0, mouth: 'line', cheek: 0, jaw: 0, spray: 0, sag: 0, swirl: 0, tongue: 0, tilt2: 0 };
function paint(Pin, net) {
  const P = { ...D, ...Pin }, [c, g] = canvas(MW, MH), r = mulberry(33);
  const stalkTop = AY - Math.round(78 * P.sy) + P.low, rimY = AY - 82 + P.capDy + P.low - Math.round((P.sy - 1) * 40), capCx = AX + P.capDx + P.shake + P.lean;
  const coil = y => P.tilt2 ? Math.round(P.tilt2 * Math.sin((AY - y) / 22)) : 0;
  const domeW = Math.round(64 * P.capSx), domeH = Math.round(40 * P.capSy), gillD = 6 + Math.round(12 * P.gill);
  const rimAt = u => rimY + Math.round(P.tilt * u * 0.5), topAt = u => rimAt(u) - Math.round(domeH * Math.sqrt(Math.max(0, 1 - u * u))) + Math.round(P.tilt * u * 0.5);
  const lxAt = y => AX + Math.round(P.lean * Math.pow(1 - Math.max(0, Math.min(1, (y - stalkTop) / Math.max(1, AY - stalkTop))), 1.5)) + coil(y);
  /* ---- ROOTS at the foot, behind the stalk ---- */
  for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, idx = i >> 1, lash = P.rootDir === side, len = (24 + idx * 11) * (lash ? 2.2 : 1) * (P.rootDir && !lash ? 0.7 : 1) * (P.low ? 0.9 : 1), arc = lash ? 3 + idx : 4 + idx * 2 + P.roots * (14 + idx * 7), th = 4 - (idx > 1 ? 1 : 0), n = Math.round(len);
    for (let k = 0; k < n; k++) { const t = k / n, x = AX + side * (8 + k), y = AY - 2 - Math.round(Math.sin(t * Math.PI * (P.roots > 0.3 && !lash ? 0.75 : 1)) * arc) + (P.roots > 0.3 && !lash ? Math.round(t * t * -arc * 0.6) : 0), w = Math.max(1, Math.round(th * (1 - t * 0.7)));
      R(g, t > 0.9 && (P.rootGlow || lash && P.rootDir) ? '#ff9a6b' : BARK[2], x, y - w + 1, 1, w); R(g, BARK[3], x, y - w + 1, 1, 1); R(g, BARK[0], x, y + 1, 1, 1);
      if (t > 0.94 && P.rootGlow) R(g, '#ffd36b', x, y - 1, 2, 1); } }
  /* ---- THE STALK: root-barked, leaning, a ruffled veil under the cap ---- */
  { const h = AY - stalkTop; for (let y = stalkTop; y <= AY; y++) { const t = (y - stalkTop) / h, lx = AX + Math.round(P.lean * Math.pow(1 - t, 1.5)) + coil(y), hw = 10 + Math.round(7 * t * t) + Math.round(5 * Math.max(0, 1 - t * 2.2)) + (y > AY - 12 ? Math.round((y - (AY - 12)) * 0.9) : 0), xl = lx - hw, wd = hw * 2 + 1;
      R(g, BARK[1], xl, y, wd, 1); R(g, BARK[3], xl, y, Math.max(2, wd >> 3), 1); R(g, BARK[4], xl + 1, y, 1, 1); R(g, BARK[0], xl + wd - Math.max(2, wd >> 3), y, Math.max(2, wd >> 3), 1);
      for (let f = 1; f < 4; f++) if (((y >> 2) + f * 3) % 5 !== 0) R(g, (hash(f, y >> 3) % 3) ? BARK[2] : BARK[0], xl + Math.round(wd * f / 4), y, 1, 1); }
    for (const [bx, by] of [[-6, 0.45], [5, 0.62], [-3, 0.8]]) { const y = Math.round(stalkTop + h * by), x = AX + Math.round(P.lean * Math.pow(1 - by, 1.5)) + bx; R(g, '#6a8a4a', x, y, 3, 2); R(g, '#9ac060', x, y, 1, 1); }   /* moss and a toadstool or two on her */
    const rx = AX + Math.round(P.lean), ry = stalkTop + 4; for (let k = -15; k <= 15; k++) { const dr = 3 + (hash(k, 9) % 3); R(g, VEIL, rx + k, ry, 1, 1); R(g, '#c8b898', rx + k, ry + 1, 1, dr - 1); R(g, VEILD, rx + k, ry + dr, 1, 1); } }   /* the ragged ring (the veil) */
  const faceY = stalkTop + 10 + P.jaw * 0;
  paintFace(g, P, lxAt(faceY + 12), faceY, net);
  /* ---- THE ARM (wither): a root-limb from her right flank up and out, its tip blighted ---- */
  if (P.arm > 0) { const k = P.arm, x0 = AX + 12, y0 = AY - 36, x1 = AX + 12 + Math.round(54 * k), y1 = AY - 36 - Math.round(46 * (1 - P.blight * 0.55) * k);
    for (let t = 0; t <= 1; t += 0.012) { const bx = x0 + (x1 - x0) * t + Math.sin(t * 3.4) * 4, by = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 14 * k, w = Math.max(2, Math.round(6 * (1 - t * 0.7)));
      R(g, BARK[2], bx, by, w, w); R(g, BARK[3], bx, by, 1, 1); if (t > 0.88) R(g, mix('#5a2a7a', '#c9a0ff', (t - 0.88) / 0.12), bx, by, w, w); }
    for (let i = 0; i < 7; i++) R(g, i % 2 ? '#c9a0ff' : '#7a3a9a', x1 - 5 + ((r() * 11) | 0), y1 - 5 + ((r() * 11) | 0), 1, 1); }
  /* ---- THE GILLS under the cap ---- */
  for (let x = -domeW + 2; x <= domeW - 2; x++) { const u = x / domeW, ry0 = rimAt(u), gd = Math.max(2, Math.round(gillD * Math.sqrt(Math.max(0.05, 1 - u * u * 0.8))));
    R(g, DEEP, capCx + x, ry0, 1, gd); if (x % 3 === 0 || x % 3 === -1) { const lit = P.glow > 0 && ((x >> 1) % 2 === 0); R(g, lit ? (P.glow > 0.6 ? '#f0d0ff' : '#c9a0ff') : (x % 6 === 0 ? VEIL : '#b8a888'), capCx + x, ry0, 1, Math.max(1, gd - 1)); if (lit) R(g, '#ffffff', capCx + x, ry0 + gd - 2, 1, 1); } }
  paintFringe(g, P, lxAt, rimAt, domeW, gillD, capCx, stalkTop);
  /* the puffballs swelling under the gills (brood) and their pockets once dropped */
  if (P.puffs > 0) for (const [px0, rr] of [[-38, 5], [-14, 6], [12, 6], [36, 5]]) { const rad = Math.round(rr * P.puffs), cx0 = capCx + px0, cy0 = rimAt(px0 / domeW) + gillD + rad - 1; if (rad < 1) continue;
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { if (dx * dx + dy * dy > rad * rad) continue; const lit = (-dx * 0.6 - dy * 0.8) / rad; R(g, lit > 0.4 ? '#f6f2e2' : lit > -0.2 ? '#d6d0bc' : '#8a8670', cx0 + dx, cy0 + dy, 1, 1); } R(g, '#6a5a48', cx0 - 1, cy0 - rad - 1, 3, 1); }
  if (P.drop > 0) for (const px0 of [-38, -14, 12, 36]) { const cx0 = capCx + px0, cy0 = rimAt(px0 / domeW) + gillD; R(g, '#8a8670', cx0 - 2, cy0, 5, 1); R(g, '#d6d0bc', cx0 - 1, cy0 + 1, 3, 1); R(g, DEEP, cx0 - 1, cy0 - 1, 3, 1); }
  /* ---- THE CAP ---- */
  const shellMix = (col) => P.shell > 0 ? mix(col, '#e8e0f4', 0.38 * P.shell) : col;
  for (let x = -domeW; x <= domeW; x++) { const u = x / domeW, top = topAt(u), bot = rimAt(u); if (bot <= top) continue;
    for (let y = top; y < bot; y++) { const t = (y - top) / Math.max(1, bot - top); let ci = t < 0.1 ? 3 : t < 0.38 ? 2 : t < 0.72 ? 1 : 0; const lit = u < -0.4 && t < 0.55 ? 1 : 0, shade = u > 0.55 ? -1 : 0; ci = Math.max(0, Math.min(3, ci + lit + shade));
      let col = ci === 3 ? HI : ci === 2 ? CAP[2] : ci === 1 ? CAP[1] : CAP[0]; if (t > 0.9) col = DEEP; if (((x + y) & 1) && Math.abs(t - [0.1, 0.38, 0.72][Math.min(2, ci)]) < 0.04) col = ci > 0 ? [DEEP, CAP[0], CAP[1], CAP[2]][ci] : col;
      R(g, shellMix(col), capCx + x, y, 1, 1); } }
  /* the spots: pale lilac, lit top-left */
  for (const [su, sv, sr] of [[-0.62, 0.45, 4.5], [-0.2, 0.28, 5.5], [0.3, 0.38, 5], [0.68, 0.62, 3.5], [-0.82, 0.72, 3], [0.05, 0.7, 4], [0.5, 0.15, 3], [-0.45, 0.78, 2.5]]) { const sx = capCx + Math.round(su * domeW), top = topAt(su), bot = rimAt(su), sy = top + Math.round((bot - top) * sv), rr = Math.round(sr * (1 - Math.abs(su) * 0.35));
    for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (dx * dx * 0.8 + dy * dy * 1.4 <= rr * rr) R(g, shellMix(dx + dy < -rr * 0.5 ? '#f4e6f4' : '#c8a8d4'), sx + dx, sy + dy, 1, 1); }
  /* the rim: a pale ragged veil */
  for (let x = -domeW; x <= domeW; x++) { const u = x / domeW, y = rimAt(u); R(g, VEIL, capCx + x, y - 1, 1, 1); if (hash(x, 21) % 3 === 0) R(g, VEILD, capCx + x, y, 1, 1 + (hash(x, 5) % 2)); }
  R(g, DEEP, capCx - domeW - 1, rimAt(-1) - 1, 1, 2); R(g, DEEP, capCx + domeW, rimAt(1) - 1, 1, 2);
  /* ---- PLUMES off the rim (bloom): puffs of the cap's own lilac gathering under each rim edge and drifting down, motes between ---- */
  if (P.plumes > 0) { const pl = P.plumes; for (const side of [-1, 1]) { for (let j = 0; j < 4; j++) { const t = j / 3, bx = capCx + side * Math.round(domeW * (0.45 + 0.5 * t)), by = rimAt(side * (0.45 + 0.5 * t)) + gillD + 3 + Math.round(j * 5 * pl) + (j % 2) * 3, rr = Math.max(2, Math.round((2 + (j % 3)) * (0.6 + 0.5 * pl)));
      for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (dx * dx + dy * dy <= rr * rr) R(g, dx + dy < -rr * 0.5 ? '#efe6ff' : dx + dy > rr * 0.6 ? '#9a6ac8' : '#c9a0ff', bx + dx, by + dy, 1, 1); }
    for (let i = 0; i < 6; i++) R(g, i % 2 ? '#ffffff' : '#c9a0ff', capCx + side * (domeW * 0.3 + hash(i, 3) % Math.round(domeW * 0.9)), rimAt(side * 0.6) + gillD + 10 + (hash(i, 7) % 24) * pl, 1, 1); } }
  /* ---- THE KNOT on the crown ---- */
  { const ky = topAt(0) + 3, kx = capCx; const w = 11 + Math.round(P.open * 5), h = 6 + Math.round(P.open * 2);
    for (let dy = -h; dy <= h; dy++) for (let dx = -w; dx <= w; dx++) { const d = (dx * dx) / (w * w) + (dy * dy) / (h * h); if (d > 1) continue; R(g, d > 0.8 ? BARK[0] : hash(dx, dy) % 5 < 2 ? BARK[3] : dy < -2 ? BARK[3] : BARK[2], kx + dx, ky + dy, 1, 1); }
    for (let k = -8; k <= 8; k += 4) R(g, BARK[0], kx + k, ky - 1, 1, 4);
    if (P.open <= 0) { R(g, '#ffd36b', kx - 5, ky - 6, 10, 1); R(g, '#fff1a8', kx - 2, ky - 6, 4, 1); R(g, GLOW.mid, kx, ky - 2, 1, 3); }
    else { const o = P.open; for (let dy = -h - 4; dy <= h + 3; dy++) { const ww = Math.round((w - 2 + Math.sin(dy * 0.8) * 2.5) * o * (1 - Math.abs(dy) / (h + 6) * 0.35)); for (let dx = -ww; dx <= ww; dx++) { const d2 = Math.abs(dx) / Math.max(1, ww); R(g, d2 < 0.35 ? '#fff6d0' : d2 < 0.7 ? '#ff9a7a' : '#c9463d', kx + dx, ky + dy - 2, 1, 1); } R(g, BARK[0], kx - ww - 1, ky + dy - 2, 1, 1); R(g, BARK[0], kx + ww + 1, ky + dy - 2, 1, 1); }
      for (let i = 0; i < 6; i++) { let x = kx + (i - 3) * 6, y = ky + 6; for (let k = 0; k < 10; k++) { R(g, DEEP, x, y + k, 1, 1); x += (hash(i + k, 3) % 3) - 1; } } } }
  /* ---- THE NET (P2): foxfire veins over the stalk and the cap, a crack or two ---- */
  if (net) { for (const [sx, dir] of [[-26, 1], [22, -1], [-6, 1], [34, -1]]) { let x = capCx + sx, y = topAt(sx / domeW) + 6; for (let k = 0; k < 26; k++) { R(g, GLOW.lo, x, y, 1, 1); if (k % 2 === 0) R(g, GLOW.c, x, y, 1, 1); x += dir * (hash(sx + k, 6) % 2); y += 1; if (y > rimAt(x / domeW)) break; } }
    for (const dx of [-8, 3, 11]) { let x = AX + P.lean * 0.4 + dx, y = stalkTop + 14; while (y < AY - 2) { R(g, GLOW.lo, x, y, 1, 1); R(g, GLOW.c, x, y, 1, 1); x += (hash(y, dx) % 3) - 1; x = Math.max(AX - 14, Math.min(AX + 14, x)); y++; if (hash(y, dx) % 9 === 0) y++; } } }
  /* ---- DUST (the crush's landing) ---- */
  if (P.dust > 0) for (let i = 0; i < 10; i++) { const side = i % 2 ? 1 : -1, x = AX + side * (30 + (i >> 1) * 11 * P.dust), y = AY - 2 - (hash(i, 2) % 5), rr = 2 + (i >> 2); R(g, '#9a8aa0', x - rr, y - rr, rr * 2, rr + 1); R(g, '#c8b8cc', x - rr, y - rr, rr, 1); }
  outline(c, '#120a18');
  return c;
}

/* THE POSES: [name, [params per frame]] - progress frames for the windups, two for each release. Body language (claude/motherface): she WINDS UP away from the blow (stalk leaning back, cap cocked back, squatting
   into the floor) and THROWS herself into it (stalk leaning hard to the attack side, the cap tilting like a head, a big squash). Face: see paintFace. */
const idleSet = (() => { const o = []; for (const b of [0, 1]) for (const look of [0, -1, 1]) o.push({ capDy: -b, gill: 0.1 * b, gx: look }); for (const b of [0, 1]) o.push({ capDy: -b, gill: 0.1 * b, eye: 'shut' }); return o; })();
const POSES = {
  idle: idleSet,
  lashTell: [{ capDy: 4, capSy: 0.96, roots: 0.5, low: 2, lean: -3, tilt: -3, gx: 1, eye: 'narrow', brow: 1, mouth: 'bared' }, { capDy: 8, capSy: 0.9, roots: 0.9, low: 4, lean: -7, tilt: -6, rootGlow: 1, gx: 1, eye: 'narrow', brow: 2, mouth: 'bared', tilt2: 1 }, { capDy: 12, capSy: 0.86, roots: 1, low: 6, lean: -11, tilt: -9, rootGlow: 1, shake: 1, gx: 1, eye: 'slit', brow: 2, mouth: 'snarl', tilt2: 2 }],
  lash: [{ capDy: 6, capSy: 0.9, capDx: 4, low: 2, lean: 15, tilt: 10, rootDir: 1, rootGlow: 1, gx: 1, eye: 'slit', brow: 2, mouth: 'snarl', tilt2: -2 }, { capDy: 3, capSy: 0.95, capDx: 2, low: 1, lean: 8, tilt: 5, rootDir: 1, rootGlow: 1, gx: 1, eye: 'narrow', brow: 1, mouth: 'bared' }],
  crushTell: [{ capDy: -9, gill: 0.4, sy: 1.04, eye: 'up', brow: -1, mouth: 'line' }, { capDy: -20, gill: 0.7, sy: 1.12, tilt: -2, eye: 'up', brow: -2, mouth: 'grit' }, { capDy: -32, gill: 1, sy: 1.2, tilt: -4, shake: 1, glow: 0.3, eye: 'up', brow: -2, mouth: 'grit' }],
  crush: [{ capDy: 12, capSx: 1.12, capSy: 0.78, sy: 0.93, dust: 0.5, gill: 0.2, eye: 'shut', brow: 2, mouth: 'grit', jaw: 0 }, { capDy: 7, capSx: 1.06, capSy: 0.88, sy: 0.97, dust: 1, eye: 'shut', brow: 2, mouth: 'wince' }],
  bloomTell: [{ capDy: -3, gill: 0.6, glow: 0.4, plumes: 0.4, capSx: 1.02, sy: 1.02, lean: -2, eye: 'wide', brow: -1, mouth: 'gape', jaw: 1, cheek: 0.5 }, { capDy: -6, gill: 0.9, glow: 0.7, plumes: 0.7, capSx: 1.06, sy: 1.06, lean: -4, eye: 'wide', brow: -1, mouth: 'gape', jaw: 3, cheek: 1 }, { capDy: -9, gill: 1, glow: 1, plumes: 1, capSx: 1.1, sy: 1.1, lean: -6, shake: 1, eye: 'wide', brow: -2, mouth: 'gape', jaw: 5, cheek: 1 }],
  bloom: [{ capDy: -3, gill: 1, glow: 1, plumes: 1.3, burst: 1, capSx: 1.05, lean: 5, sy: 1.04, eye: 'narrow', brow: 1, mouth: 'gape', jaw: 5, spray: 1, cheek: 0.3 }, { capDy: 0, gill: 0.5, glow: 0.4, plumes: 0.8, burst: 1, lean: 2, eye: 'narrow', brow: 0, mouth: 'gape', jaw: 3, spray: 0.8 }],
  broodTell: [{ capDy: -2, tilt: -4, gill: 0.6, puffs: 0.4, lean: -2, eye: 'open', gy: 1, brow: 0, mouth: 'gape', jaw: 1, cheek: 0.5 }, { capDy: -4, tilt: -8, gill: 0.9, puffs: 0.75, shake: 1, lean: -5, eye: 'open', gy: 1, brow: -1, mouth: 'gape', jaw: 3, cheek: 1 }, { capDy: -6, tilt: -12, gill: 1, puffs: 1, shake: 1, glow: 0.2, lean: -8, eye: 'wide', brow: -1, mouth: 'gape', jaw: 4, cheek: 1 }],
  brood: [{ capDy: 2, tilt: 6, gill: 0.8, drop: 1, lean: 5, eye: 'narrow', brow: 1, mouth: 'gape', jaw: 3, mouthPuff: 1, cheek: 0.4 }, { capDy: 1, tilt: 2, gill: 0.4, drop: 1, lean: 2, eye: 'open', brow: 0, mouth: 'slack', tongue: 0 }],
  witherTell: [{ lean: 3, arm: 0.45, blight: 0.3, sy: 0.99, eye: 'narrow', brow: 1, mouth: 'sucked', cheek: -0.5 }, { lean: 6, arm: 0.8, blight: 0.7, shake: 1, sy: 0.97, eye: 'slit', brow: 2, mouth: 'sucked', cheek: -1 }, { lean: 8, arm: 1, blight: 1, shake: 1, capDy: -2, sy: 0.95, eye: 'slit', brow: 2, mouth: 'sucked', cheek: -1 }],
  wither: [{ lean: 10, arm: 0.7, blight: 1, capDy: 2, plumes: 0.5, eye: 'wide', brow: 2, mouth: 'gape', jaw: 4, spray: 0.7 }, { lean: 4, arm: 0.3, blight: 1, eye: 'narrow', brow: 1, mouth: 'bared' }],
  open: [{ open: 1, tilt: -7, capDy: -3, gill: 0.7, capSx: 1.04, lean: -2, eye: 'back', brow: -2, mouth: 'slack', tongue: 6, jaw: 2, swirl: -1 }, { open: 0.85, tilt: -5, capDy: -1, gill: 0.8, capSx: 1.05, lean: -3, eye: 'back', brow: -2, mouth: 'slack', tongue: 5, jaw: 2, swirl: 0.5 }],
  ward: [{ shell: 1, gill: 0, eye: 'shut', brow: 2, mouth: 'wince' }],
  phaseRise: [{ sy: 1.06, roots: 1, gill: 0.5, glow: 0.6, shake: 1, capDy: -5, eye: 'blaze', brow: 2, mouth: 'gape', jaw: 4 }, { sy: 1.08, roots: 0.8, gill: 0.9, glow: 1, shake: -1, capDy: -7, eye: 'blaze', brow: 2, mouth: 'snarl' }],
  wake: [{ low: 14, capSy: 0.8, gill: 0, eye: 'shut', brow: 0, mouth: 'line' }, { low: 6, capSy: 0.92, gill: 0.2, eye: 'wide', brow: 1, mouth: 'bared' }],
  dead: [{ capDy: 2, capSy: 0.94, tilt: 3, eye: 'dim', brow: -2, mouth: 'slack', jaw: 1, sag: 0.3 }, { capDy: 6, capSy: 0.88, tilt: 6, lean: 2, eye: 'out', brow: -2, mouth: 'slack', jaw: 2, sag: 0.7, tongue: 3 }, { capDy: 12, capSy: 0.78, tilt: 8, lean: 3, low: 6, eye: 'out', brow: -2, mouth: 'slack', jaw: 2, sag: 1, tongue: 4 }],
};
export const canvasOf = (w, h) => canvas(w, h);
export const POSE_NAMES = Object.keys(POSES);
export function frames(phase) { const key = phase >= 2 ? 'p2' : 'p1';
  if (memo[key]) return memo[key]; const net = phase >= 2, out = {};
  for (const [name, list] of Object.entries(POSES)) out[name] = list.map(p => paint(p, net));
  return memo[key] = out; }
export function warm() { frames(1); frames(2); }
/* which picture: by her mode ('lashTell', 'lash', 'crushTell', ... 'open', 'phaseRise', 'wake', 'dead', 'idle' / walk / anything else), k = how far into it (0..1; for 'dead' the seconds since her death) and look = which side of her the hero is on (-1 / 0 / 1: her eyes follow) */
export function frameFor(e, kind, tell, k, phase, ward, time, look = 0) {
  const F = frames(phase), list = (n) => F[n] || F.idle;
  let name = kind, i = 0;
  if (kind === 'dead') { name = 'dead'; i = k < 0.5 ? 0 : k < 1.4 ? 1 : 2; }
  else if (kind === 'open') { name = 'open'; i = Math.floor(time * 5) % 2; }
  else if (ward > 0 && (kind === 'idle' || !F[kind])) { name = 'ward'; i = 0; }
  else if (kind === 'lash' || kind === 'crush' || kind === 'bloom' || kind === 'brood' || kind === 'wither') { name = kind; i = k < 0.45 ? 0 : 1; }
  else if (tell && F[kind + 'Tell']) { name = kind + 'Tell'; const n = F[name].length; i = Math.min(n - 1, Math.floor(k * n)); }
  else if (kind === 'phaseRise') { name = 'phaseRise'; i = Math.floor(time * 6) % 2; }
  else if (kind === 'wake') { name = 'wake'; i = k < 0.5 ? 0 : 1; }
  else { name = 'idle'; const b = Math.floor(time * 0.9) % 2; i = (time % 4.3) < 0.16 ? 6 + b : b * 3 + (look === 0 ? 0 : look < 0 ? 1 : 2); }
  const L = list(name); return L[Math.min(i, L.length - 1)];
}

/* THE BESTIARY / MAP PORTRAIT: her idle frame boxed down to 56 x 52 (area average, hard alpha), outlined; the foes' set shape */
export function bakeIcon() {
  const src = frames(1).idle[0], sg = src.getContext('2d'), sd = sg.getImageData(0, 0, src.width, src.height).data, x0 = 42, y0 = 40, sw = 116, sh = 108, ow = 56, oh = 52, [c, g] = canvas(ow, oh), img = g.createImageData(ow, oh), d = img.data;
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) { let r = 0, gg = 0, b = 0, a = 0, n = 0; const ax0 = x0 + Math.floor(x * sw / ow), ax1 = x0 + Math.max(Math.floor(x * sw / ow) + 1, Math.floor((x + 1) * sw / ow)), ay0 = y0 + Math.floor(y * sh / oh), ay1 = y0 + Math.max(Math.floor(y * sh / oh) + 1, Math.floor((y + 1) * sh / oh));
    for (let yy = ay0; yy < ay1; yy++) for (let xx = ax0; xx < ax1; xx++) { const i = (yy * src.width + xx) * 4; n++; if (sd[i + 3] > 20) { r += sd[i]; gg += sd[i + 1]; b += sd[i + 2]; a++; } }
    if (a * 2 >= n && a) { const o = (y * ow + x) * 4; d[o] = r / a; d[o + 1] = gg / a; d[o + 2] = b / a; d[o + 3] = 255; } }
  g.putImageData(img, 0, 0); outline(c, '#1b1626'); return { R: [c], L: [c], white: { R: [c], L: [c] }, ax: ow >> 1, ay: oh, w: 40, h: 40 };
}
