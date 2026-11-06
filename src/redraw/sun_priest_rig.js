// src/redraw/sun_priest_rig.js - THE DESERT PRIEST'S OWN RIG (claude/priestart, 11-06). Drawn in code, the way the other heroes' rigs are.
// He was the Pyromancer's bake in an ivory palette (claude/desertpriest). He now has his own BODY under the same pose geometry:
//   * no cowl and no cage: a BARE HEAD in a lapis-and-gold striped nemes cloth with a diadem, a gold SUN-NIMBUS ring standing behind his head,
//   * a long ivory robe with a lapis tabard stripe down the front, a gold sash, a lapis-and-gold collar and a gold-banded hem (no ember hem),
//   * the staff tipped with a SUN-DISC (a gold ring round a white heart), its rays growing with `flame`/`flick`/`flare`,
//   * sleeves with gold cuffs, bronze hands, sandals.
// The geometry (feet, staff, arm, lean, trail...) is the Pyromancer's pyroFrame option set so every pose table that drives her drives him; chars.js
// bakePyro swaps pyroFrame for priestFrame while bakeSunPriest runs, and adds priestPoses() (his fifteen own poses) after pyroKitPoses.
import { canvas, px, line, outline } from '../px.js';
import { OUT } from '../art.js';

/* his letters (the pyro bake's letters, so palm/flare/sparks keep working): s S robe light/shade, r hi cream, y gold, k bronze face, v kohl, w W staff/sandal,
   plus G deep gold, L lapis, l light lapis, g mend green, d robe deep shade, i hi-ivory */
export const SUN_PAL = { s: '#f2ead8', S: '#cdbf9c', d: '#a89878', i: '#fffaf0', r: '#fff6c8', y: '#ffd36b', G: '#b8862a', k: '#cf9468', v: '#3a2a22', w: '#9a7a4a', W: '#6e5234',
  L: '#2a5fb0', l: '#6aa0e0', g: '#cdf08a', b: '#e8dcc0', B: '#a89878', o: OUT };

/* the head: 11 wide, 8 tall, face to the right (cols 4-7). 0 at rest, 1 streaming back (running), 2 blown up (falling, hurt, casting) */
const HEAD = [
  ['...LyLyL...', '..LyLyLyL..', '..yGGGGGGry', '.LyykkkkyL.', '.LyykvkvyL.', '.LyykkkkyL.', '.LLyykkkLy.', '..LyyLLyL..'],
  ['...LyLyL...', '..LyLyLyL..', '..yGGGGGGry', 'LLyykkkkyL.', 'yLyykvkvyL.', 'LyyykkkkyL.', 'LyLyykkkLy.', 'LyyLyLLyL..'],
  ['...LyLyL...', '..LyLyLyL..', '..yGGGGGGry', '.LyykkkkyL.', '.LyykvkvyL.', 'LyyykkkkyyL', '.LyyykkkLL.', '..LyyLLyLy.'],
];
const ringPts = (cx, cy, rx, ry, n, ks = ['y', 'r'], a0 = 0) => Array.from({ length: n }, (_, i) => { const t = a0 + i / n * Math.PI * 2; return [Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), ks[i % ks.length]]; });

export function priestFrame(o, env) {
  const { W, H, KP } = env;
  const { lean = 0, dy = 0, trail = 0, hemW = 11, bell = 0, feet = [[11, 18], [15, 18]], arm = null, arm2 = null,
    staff = null, cowl = 0, flick = 0, sit = 0, flare = null, palm = null, flame = null, sparks = null, top: headroom = 0, wide = 0 } = o;
  const [c, g] = canvas(W + wide, H + headroom); g.translate(0, headroom);
  const put = (x, y, k) => { if (KP[k]) px(g, Math.round(x), Math.round(y), KP[k]); };
  /* THE SUN-DISC STAFF: the shaft runs to a disc stood on its end. The disc's centre is 2.5 px back from the tip so a staff held to the top of the frame still shows all of it */
  const drawStaff = () => { if (!staff) return;
    const [x0, y0, x1, y1] = staff, ddx = x1 - x0, ddy = y1 - y0, dd = Math.hypot(ddx, ddy) || 1, vx = ddx / dd, vy = ddy / dd;
    const sx = x1 - vx * 2.5, sy = y1 - vy * 2.5;
    line(g, x0, y0 + dy, sx, sy + dy, KP.w, 2);
    const bx = x0 + vx * dd * 0.55, by = y0 + vy * dd * 0.55; put(bx, by + dy, 'y'); put(bx + (vy ? 1 : 0), by + dy + (vy ? 0 : 1), 'G');   /* the gold band on the shaft */
    const cx0 = Math.round(sx), cy0 = Math.round(sy) + dy;
    for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) { const h = Math.hypot(xx, yy); if (h > 2.6) continue;
      put(cx0 + xx, cy0 + yy, h > 1.6 ? (xx + yy > 1 ? 'G' : 'y') : (xx === 0 && yy === 0 ? 'i' : (flick ? 'r' : 'y'))); }
    put(cx0, cy0, 'i'); put(cx0 + 1, cy0, 'r'); put(cx0, cy0 - 1, 'r');
    const rays = flame !== null ? flame : (flick ? 2 : 1);   /* rest glow 0-4, else the tip ray and a flick */
    const R3 = [[0, -3], [3, 0], [-3, 0], [0, 3]], D3 = [[2, -2], [-2, -2], [2, 2], [-2, 2]];
    if (flame !== null || flick || flare) { for (let i = 0; i < Math.min(4, rays + 1); i++) put(cx0 + R3[i][0], cy0 + R3[i][1], i % 2 ? 'y' : 'r');
      if (rays >= 3) for (const [a, b] of D3) put(cx0 + a, cy0 + b, 'y'); if (rays >= 4) { put(cx0, cy0 - 4, 'r'); put(cx0 - 4, cy0, 'y'); put(cx0 + 4, cy0, 'y'); } }
    else put(cx0 + Math.round(vx * 3), cy0 + Math.round(vy * 3), 'y'); };
  if (staff && staff[4] === 'back') drawStaff();
  /* THE NIMBUS: a gold ring stood behind the head (squashed to fit the frame), brighter when the cowl-state is 2 */
  const top = 8 + sit, hx = 8 + lean, hy = top - 8 + dy, ncx = hx + 5.2, ncy = hy + 4;
  { const n = 22; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, x = Math.round(ncx + Math.cos(t) * 6.4), y = Math.round(ncy + Math.sin(t) * 4.2);
      put(x, y, (i + flick) % 3 === 0 || (cowl === 2 && i % 2) ? 'r' : (i % 2 ? 'y' : 'G')); }   /* (looks1) cast poses: half-bright only, no outer dot ring - it blobbed into the gold cloth */
}
  // sandals, under the hem
  for (const [fx, fy] of feet) { put(fx, fy + dy, 'W'); put(fx + 1, fy + dy, 'W'); put(fx + 1, fy + dy - 1, 'y'); }
  // the robe: shoulders to hem, flaring, leaning with the body and trailing behind it
  const hem = 17 - Math.round(bell / 2);
  for (let y = top; y <= hem; y++) {
    const t = (y - top) / Math.max(1, hem - top), w = Math.round(7 + (hemW + bell - 7) * Math.pow(t, 1.3)), cx = 13 + lean * (1 - t) - trail * t * t;
    const l = Math.round(cx - w / 2), r = l + w - 1, tab = Math.round(cx);
    for (let x = l; x <= r; x++) {
      let k = x === l ? 'S' : x === r ? 'd' : (x === tab - 3 && y > top + 3) || (x === tab + 3 && y > top + 3) ? 'S' : 's';
      if (y > top + 1 && y < hem && (x === tab || x === tab + 1)) k = x === tab ? 'L' : 'l';   /* the lapis tabard stripe */
      if (y === hem) k = (x + y) % 2 === 0 ? 'y' : 'G';                                       /* the gold-banded hem */
      else if (y === hem - 1 && !bell && x > l && x < r) k = (x + y) % 2 === 0 ? 's' : 'S';
      put(x, y + dy, k); }
    if (y === top + 4) for (let x = 10 + lean; x <= 16 + lean; x++) put(x, y + dy, x === 10 + lean || x === 16 + lean ? 'G' : 'y');   /* the gold sash */
    if (y === top + 5) { put(12 + lean, y + dy, 'G'); put(13 + lean, y + dy, 'y'); }
    if (y === top + 6) put(12 + lean, y + dy, 'y');
  }
  // the collar: lapis and gold over the shoulders
  for (let x = 10 + lean; x <= 16 + lean; x++) { put(x, top + dy, (x - lean) % 2 ? 'y' : 'L'); put(x, top + 1 + dy, x === 10 + lean || x === 16 + lean ? 'G' : (x - lean) % 2 ? 'l' : 'y'); }
  put(9 + lean, top + 1 + dy, 'd'); put(17 + lean, top + 1 + dy, 'd');
  // the head
  HEAD[cowl].forEach((row, yy) => { for (let xx = 0; xx < row.length; xx++) { const k = row[xx]; if (k !== '.') put(hx + xx, hy + yy, k === 'r' && flick ? 'i' : k); } });
  // sleeves: wide at the cuff, a gold cuff and a bronze hand at the end of each
  const sleeve = a => { if (!a) return; const [x0, y0, x1, y1] = a; line(g, x0, y0 + dy, x1, y1 + dy, KP.s, 2); put(x1, y1 + dy, 'y'); put(x1 + Math.sign(x1 - x0 || 1), y1 + dy, 'k'); };
  sleeve(arm2);
  if (!staff || staff[4] !== 'back') drawStaff();
  sleeve(arm);
  if (palm) { const [x, y] = palm; put(x, y + dy, 'i'); put(x + 1, y + dy, 'r'); put(x, y - 1 + dy, 'y'); put(x, y + 1 + dy, 'y'); put(x + 2, y + dy, flick ? 'r' : 'y'); put(x - 1, y + dy, 'y'); }
  if (flare) { const [x, y, big] = flare;
    const pts = big ? [[0, 0, 'i'], [1, 0, 'r'], [-1, 0, 'r'], [0, -1, 'r'], [0, 1, 'r'], [2, 0, 'y'], [-2, 0, 'y'], [0, -2, 'y'], [0, 2, 'y'], [3, 0, 'y'], [0, -3, 'y'], [0, 3, 'y'], [-3, 0, 'y'], [2, -2, 'y'], [-2, -2, 'y'], [2, 2, 'y'], [-2, 2, 'y'], [4, 0, 'r'], [0, -4, 'r'], [0, 4, 'r']]
      : [[0, 0, 'i'], [1, 0, 'r'], [-1, 0, 'r'], [0, -1, 'r'], [0, 1, 'r'], [2, 0, 'y'], [0, -2, 'y'], [0, 2, 'y'], [-2, 0, 'y']];
    for (const [ddx, ddy, k] of pts) put(x + ddx, y + ddy + dy, k); }
  if (sparks) for (const [x, y, k] of sparks) put(x, y + dy, k);   /* loose sparks, over everything */
  outline(c, OUT);
  if (staff) { const hd = arm ? [arm[2], arm[3] + dy] : [staff[0], staff[1] + dy]; c.wp = { p: [hd[0], hd[1] + headroom], t: [staff[2], staff[3] + dy + headroom] }; }
  c.feet = headroom + Math.max(...feet.map(f => f[1])) + dy;
  return c;
}

/* HIS OWN POSES (fifteen): the ten actives and the five verbs of the kit. `P` is the headroomed frame maker, `up` the idle staff. Beats are in src/hero-poses.js. */
export function priestPoses(F, up, P) {
  const wd = [[9, 18], [17, 18]], back = [9, 18, 10, 0, 'back'];
  /* SUN SHARD: the free palm lifted to the eye with a spark in it; then the arm thrown out level and the disc of light leaving it */
  F.spShard = [P({ lean: -1, sit: 1, staff: up(0, 1), arm: [16, 12, 17, 13], arm2: [11, 11, 15, 9], palm: [16, 8], cowl: 0 }),
    P({ lean: 2, trail: 2, feet: wd, staff: up(), arm: [16, 11, 17, 12], arm2: [12, 10, 22, 9], flare: [24, 9, false], cowl: 1, flick: 1, sparks: [[27, 9, 'r'], [26, 7, 'y'], [26, 11, 'y']] })];
  /* HALLOWED STEP: low and flat through the gap, the staff carried behind and the light streaming off the hem; and the pull-up with a ring of light at the feet */
  const tr = [[3, 17, 'r'], [1, 16, 'y'], [4, 14, 'r'], [0, 18, 'y'], [5, 19, 'y']];
  F.spStep = [P({ lean: 3, sit: 2, trail: 4, hemW: 13, feet: [[8, 18], [17, 18]], staff: [5, 16, 22, 8, 'back'], arm: [17, 11, 20, 12], cowl: 1, sparks: tr.slice(0, 3) }),
    P({ lean: 4, sit: 3, trail: 5, hemW: 14, feet: [[7, 18], [19, 18]], staff: [4, 17, 23, 9, 'back'], arm: [17, 12, 21, 12], cowl: 1, flick: 1, sparks: tr }),
    P({ lean: -2, sit: 1, trail: -1, hemW: 12, feet: [[10, 18], [16, 18]], staff: [15, 17, 20, 3], arm: [16, 11, 18, 11], cowl: 2, sparks: [[6, 19, 'y'], [20, 19, 'y'], [9, 20, 'r'], [17, 20, 'r']] })];
  /* SUN-LAMP: the free palm cupped, lifted high with the lamp lit in it; then down on a knee, setting it on the floor */
  F.spLamp = [P({ sit: 1, staff: up(0, 1), arm: [16, 12, 17, 13], arm2: [11, 11, 14, 8], palm: [15, 7], cowl: 0 }),
    P({ lean: 1, dy: -1, staff: up(0, -1), arm: [16, 10, 17, 11], arm2: [11, 10, 15, 3], palm: [16, 2], cowl: 2, flick: 1, sparks: [[16, -1, 'r'], [14, 0, 'y'], [18, 0, 'y'], [16, -3, 'y']] }),
    P({ sit: 3, hemW: 13, staff: up(0, 3), arm: [16, 14, 17, 15], arm2: [11, 13, 18, 17], palm: [19, 17], cowl: 0, sparks: [[21, 15, 'y'], [22, 17, 'r'], [20, 14, 'r']] })];
  /* DAWN WARD: down and drawn in, both sleeves crossed on the chest; then flung out wide and a ring of morning light going off round him */
  F.spWard = [P({ sit: 2, hemW: 12, staff: [9, 17, 10, 3, 'back'], arm: [16, 12, 12, 11], arm2: [11, 12, 15, 11], cowl: 0 }),
    P({ bell: 2, hemW: 14, lean: 1, feet: [[8, 18], [18, 18]], staff: [9, 17, 10, 3, 'back'], arm: [16, 10, 22, 8], arm2: [11, 10, 5, 8], palm: [23, 8], cowl: 2, flick: 1, sparks: ringPts(13, 9, 12, 9, 12) })];
  /* PILLAR OF NOON: the staff lifted overhead in both hands; then thrust out and up at the foe with the flare going off at the disc */
  F.spPillar = [P({ lean: -1, dy: -1, staff: [15, 10, 17, -6], arm: [16, 10, 16, 3], arm2: [11, 10, 15, 4], cowl: 2 }),
    P({ lean: 3, trail: 2, sit: 1, feet: [[8, 18], [18, 18]], staff: [13, 11, 28, 3], arm: [17, 10, 24, 6], arm2: [13, 10, 20, 8], cowl: 1, flare: [30, 2, true], flick: 1, sparks: [[31, 6, 'y'], [27, 0, 'r']] })];
  /* MERCY: the sleeves drawn in with the palms together; opened out and up with green-gold light rising; the settle */
  F.spMercy = [P({ sit: 1, staff: up(0, 1), arm: [16, 12, 14, 12], arm2: [11, 12, 13, 12], palm: [14, 11], cowl: 0 }),
    P({ bell: 1, staff: up(), arm: [16, 10, 20, 6], arm2: [11, 10, 7, 6], cowl: 2, sparks: [[10, 2, 'g'], [18, 1, 'g'], [14, -1, 'y'], [6, 4, 'g'], [22, 4, 'y'], [14, 3, 'g'], [12, -3, 'g']] }),
    P({ staff: up(), arm: [16, 11, 19, 9], arm2: [11, 11, 8, 9], cowl: 0, sparks: [[13, 6, 'g'], [10, 8, 'g'], [16, 7, 'y']] })];
  /* GLARE: the head and the sleeves drawn up; then the palm thrust flat at them with a white sun going off in it and the rays flung level */
  F.spGlare = [P({ lean: -2, staff: back, arm: [16, 10, 15, 6], arm2: [11, 10, 12, 7], cowl: 2 }),
    P({ lean: 3, trail: 3, feet: [[8, 18], [17, 18]], staff: [7, 18, 9, 2, 'back'], arm: [17, 10, 24, 9], arm2: [12, 10, 18, 9], flare: [26, 9, true], cowl: 2, flick: 1, sparks: [[29, 5, 'r'], [30, 9, 'y'], [29, 13, 'r'], [27, 3, 'y'], [27, 15, 'y'], [31, 7, 'y'], [31, 11, 'y']] }),
    P({ lean: 1, staff: up(), arm: [16, 10, 20, 9], arm2: [11, 10, 14, 11], cowl: 1, sparks: [[23, 8, 'r'], [24, 11, 'y']] })];
  /* SOLAR WIND: the staff taken back low; swept along the floor ahead with the wind of light streaming off the disc */
  F.spWind = [P({ lean: -2, sit: 1, staff: [4, 17, 17, 15, 'back'], arm: [15, 12, 12, 14], arm2: [11, 12, 9, 14], cowl: 1 }),
    P({ lean: 3, trail: 3, sit: 1, feet: [[8, 18], [17, 18]], staff: [11, 16, 28, 13], arm: [17, 12, 22, 14], arm2: [13, 12, 18, 14], cowl: 1, flick: 1, sparks: [[26, 11, 'y'], [29, 15, 'r'], [31, 12, 'y'], [30, 17, 'y'], [32, 14, 'r'], [24, 17, 'y']] })];
  /* HALO OF NOON: both sleeves raised round the head; lifted on the toes with a ring of sun stood over him; the settle with the ring held */
  F.spHalo = [P({ staff: up(), arm: [16, 10, 17, 3], arm2: [11, 10, 12, 3], cowl: 0 }),
    P({ dy: -1, bell: 1, staff: up(0, -1), arm: [16, 9, 18, 0], arm2: [11, 9, 9, 0], cowl: 2, flick: 1, sparks: ringPts(13, -7, 7, 4, 12) }),
    P({ staff: up(), arm: [16, 11, 18, 8], arm2: [11, 11, 9, 8], cowl: 2, sparks: ringPts(13, -5, 6, 3, 10, ['y', 'r', 'G']) })];
  /* THE BURNING EYE: the head thrown back and the free hand to the brow; the eye opening over him */
  F.spEye = [P({ lean: -2, staff: up(), arm: [16, 10, 17, 11], arm2: [11, 10, 14, 2], palm: [15, 1], cowl: 2 }),
    P({ lean: -1, staff: up(), arm: [16, 10, 17, 11], arm2: [11, 10, 14, 3], palm: [15, 2], cowl: 2, flick: 1, sparks: [[17, -4, 'y'], [13, -5, 'r'], [15, -7, 'r'], [10, -2, 'y'], [20, -2, 'y'], [15, -3, 'i']] })];
  /* THE SUNBEAM (hold X): braced wide and low, the staff levelled in both hands, the beam leaving the disc */
  F.spBeam = [P({ lean: 1, sit: 1, feet: wd, staff: [7, 12, 25, 11], arm: [17, 11, 21, 11], arm2: [12, 11, 16, 12], cowl: 0, flare: [26, 11, false] }),
    P({ lean: 1, sit: 1, trail: 1, feet: wd, staff: [7, 12, 25, 11], arm: [17, 11, 21, 11], arm2: [12, 11, 16, 12], cowl: 1, flick: 1, flare: [26, 11, true], sparks: [[9, 9, 'y'], [14, 8, 'r']] })];
  /* THE DISC (tap C): the staff stood level before him and the disc raised like a shield, a gold arc of light across it; and the settle */
  const shield = [[24, 4, 'y'], [25, 5, 'r'], [26, 7, 'y'], [26, 10, 'r'], [26, 13, 'y'], [25, 15, 'r'], [24, 16, 'y']];
  F.spDisc = [P({ lean: 1, feet: wd, staff: [21, 17, 21, 2], arm: [17, 10, 21, 10], arm2: [12, 11, 16, 11], cowl: 0, flick: 1, sparks: shield }),
    P({ lean: 1, feet: wd, staff: [21, 17, 21, 2], arm: [17, 10, 21, 10], arm2: [12, 11, 16, 11], cowl: 0, sparks: shield.filter((_, i) => i % 2 === 0) })];
  /* THE FLARE (hold C): drawn in over the chest; flung wide with the head back and a ring of the sun going off all round; the afterglow */
  F.spFlare = [P({ sit: 2, hemW: 12, staff: up(0, 2), arm: [16, 12, 15, 11], arm2: [11, 12, 13, 11], palm: [14, 10], cowl: 0 }),
    P({ dy: -1, bell: 3, hemW: 14, staff: back, arm: [16, 9, 23, 5], arm2: [11, 9, 4, 5], cowl: 2, flick: 1, flare: [24, 4, true], sparks: ringPts(13, 6, 13, 10, 14) }),
    P({ bell: 2, hemW: 13, staff: up(), arm: [16, 10, 20, 8], arm2: [11, 10, 8, 8], cowl: 2, sparks: ringPts(13, 6, 10, 8, 8) })];
  /* CONSECRATE (DOWN+C): down on both knees with the staff set in the ground ahead and the palm laid flat; the gold coming off along the floor */
  const gnd = [[5, 19, 'y'], [8, 20, 'r'], [11, 19, 'y'], [23, 19, 'y'], [26, 20, 'r'], [29, 19, 'y']];
  F.spConsec = [P({ sit: 3, hemW: 13, lean: 1, feet: [[9, 18], [17, 18]], staff: [21, 19, 21, 4], arm: [16, 13, 20, 12], arm2: [11, 13, 20, 14], cowl: 0 }),
    P({ sit: 4, hemW: 14, bell: 1, lean: 1, feet: [[8, 18], [18, 18]], staff: [21, 19, 21, 4], arm: [16, 14, 20, 13], arm2: [11, 14, 20, 15], cowl: 0, flick: 1, sparks: gnd })];
  /* SUNRISE (the ultimate): gathered low; up on the toes with the staff overhead in both hands and the whole sun standing behind him; held */
  F.spRise = [P({ sit: 2, hemW: 12, staff: up(0, 2), arm: [16, 12, 17, 13], arm2: [11, 12, 13, 13], cowl: 0 }),
    P({ dy: -2, bell: 3, hemW: 14, staff: [15, 8, 17, -8], arm: [16, 8, 17, -1], arm2: [11, 8, 16, 0], cowl: 2, flick: 1, sparks: [...ringPts(14, -3, 11, 9, 16), ...ringPts(14, -3, 7, 6, 10, ['r'])] }),
    P({ dy: -1, bell: 2, hemW: 13, staff: [15, 9, 17, -7], arm: [16, 9, 17, 0], arm2: [11, 9, 16, 1], cowl: 2, sparks: ringPts(14, -3, 11, 9, 16, ['y', 'G']) })];
}
