// fire_mage_art.js - THE GOBLIN FIRE MAGE and THE CINDER ACOLYTE (claude/pyroboss2, GREYBOX for the art lane). Drawn on the monastery goblin mage's grid
// (src/redraw/monastery.js bakeGoblinMage: 16 px wide, feet on row 20, anchor 8,21, box 10x16) so every pick and hit box of the mage's machine holds -
// and with frames of their own for the fire kit (B16: every ability its own windup + release pose):
//   0 idle (staff upright, a small flame on its tip)   1-2 walk   3 THE LOB'S WINDUP (staff drawn back over the shoulder, the flame swelling)
//   4 THE RELEASE (staff flung forward, the tip empty)  5 (spare: the rune pose's slot - the staff raised)  6 hurt (hat/hood knocked, staff dropped)
//   7 THE FLAME WARD (staff planted, both hands out)    8 DOUSED (hunched, the staff a black stick smoking)   9 DEATH (folded, staff snapped: the corpse)   9 DEATH (folded, the staff snapped; the corpse's frame)
// THE GOBLIN FIRE MAGE: green goblin, a scorched red-brown robe with an ember hem, a pointed hat singed black at the brim, an iron-shod staff.
// THE CINDER ACOLYTE: a man - pale face under an ash-grey hood, an ash robe with an ember sash, the same staff (the theme-fit reskin past the Goblin Queen).
import { outline, flipX, whiten, fromGrid } from '../px.js';
import { OUT } from '../art.js';
import { domeSprite } from '../pyro-art.js';

const pack = (frames, ax, ay, w, h) => { const white = frames.map(c => whiten(c)); return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; };
const putRow = (rows, y, x, str) => { if (y < 0 || x < 0) return; while (rows.length <= y) rows.push(''); if (rows[y] === undefined) rows[y] = ''; rows[y] = rows[y].padEnd(x, '.'); rows[y] = rows[y].slice(0, x) + str + rows[y].slice(x + str.length); };

function bake(human) {
  /* g skin, G shade, p inner ear, e eye white, x pupil, t tooth; n/N/l robe body/dark/light; s/S ember trim; b brass; k/K staff wood/dark; i iron; f/F/w flame; h/H hat or hood */
  const P = human
    ? { g: '#e0b894', G: '#a87e5e', p: '#c89a7a', e: '#f3f0d2', x: '#1a1210', t: '#f3f0d2', n: '#6a6660', N: '#3a3834', l: '#8e8a82', s: '#d8481c', S: '#8a2a14', b: '#ffd36b', k: '#4a3a2e', K: '#2a2018', i: '#8a919c', f: '#ff9a3c', F: '#ffd36b', w: '#fff6c8', h: '#3a3834', H: '#5a5650', o: OUT }
    : { g: '#6faa4a', G: '#3f6e2c', p: '#d98a7a', e: '#f3f0d2', x: '#1a1210', t: '#f3f0d2', n: '#8a3a22', N: '#4a1c10', l: '#b0583a', s: '#ff6b2c', S: '#a8361a', b: '#ffd36b', k: '#4a3a2e', K: '#2a2018', i: '#8a919c', f: '#ff9a3c', F: '#ffd36b', w: '#fff6c8', h: '#2a1a14', H: '#5a2a1a', o: OUT };
  /* the head: the goblin has a pointed hat bent back and singed black at the brim (ember glints), a long ear with a pink inside, a hooked nose and two fangs; the man has a deep ash hood with a shadowed face, a straight nose and a close beard */
  const hat = human
    ? ['', '....hhhh', '...hHHHHh', '..hHHHHHHh', '..hHHhhHHh', '..hHhh..hHh']
    : ['.....h', '....hH', '...hNNH', '..hNnNnH', '.hhFhhFhhFhh', '.hhhhhhhhhhhh'];
  const head = human
    ? ['..hHhgggggGh', '..hhhgexgggg', '...hhgggggGg', '...hhGgGGGgg', '....hhGgGGh']
    : ['pp.gggggggg', '.ppgggeexggg', '..pggggggggGGG', '...gggGGtGgg', '....gGggggGg'];
  const body = ['....nnssnnnn', '...nlnnnnnnn', '...nlnnnnnnnn', '...nlnnnnnnnn', '...NNNNbbNNNN', '..nnlnnnnnnnnn', '..nnlnnnnnnnnn', '..NnlnnSnnSnnN', '..NsSsfSsSfsSN'];
  const feet = ['...GG...GG', '....GG.GG', '...GG....GG'];
  /* the staff: iron-shod foot, a wooden shaft, a three-clawed iron head holding the flame */
  const staffV = (rows, x, y0, y1, lit, big) => { for (let y = y0 + 1; y <= y1; y++) putRow(rows, y, x, y === y1 ? 'i' : 'k');
    putRow(rows, y0, x - 1, 'KkK'); putRow(rows, y0 + 1, x - 1, 'K.K');
    if (lit) { putRow(rows, y0 - 1, x, 'f'); if (big) { putRow(rows, y0 - 2, x - 1, 'fFf'); putRow(rows, y0 - 3, x - 1, 'fwf'); putRow(rows, y0 - 4, x, 'F'); putRow(rows, y0 - 1, x - 1, 'FwF'); } else { putRow(rows, y0 - 1, x - 1, 'fFf'); putRow(rows, y0 - 2, x, 'F'); } } };
  const frame = pose => {
    const rows = [...(pose === 6 || pose === 9 ? ['', '', '', '', '', human ? '..hHhh....hHh' : '..hhFhhhhhhhh'] : hat), ...head, ...body];
    if (pose === 6) { putRow(rows, 9, 9, human ? 'gGGg' : 'gGGgGGg'); putRow(rows, 18, 12, 'kkki'); putRow(rows, 10, 5, 'x'); }               /* HURT: knocked back, the eyes shut, the staff dropped at the feet */
    else if (pose === 9) {   /* DEATH: folded over, the hat off and singed, the staff snapped, a last wisp of smoke */
      for (let y = 11; y < 19; y++) rows[y] = (rows[y] || '').replace(/[ssfF]/g, 'S'); putRow(rows, 9, 4, 'GGGG'); putRow(rows, 17, 9, 'kkK'); putRow(rows, 18, 13, 'kK'); putRow(rows, 16, 12, 'K'); putRow(rows, 8, 10, 'xx'); }
    else if (pose === 3) {   /* THE LOB'S WINDUP: the staff drawn back over the shoulder, the flame on its tip swelling behind the head */
      for (let k = 0; k < 7; k++) putRow(rows, 12 - k, 4 - Math.floor(k / 2), 'k'); putRow(rows, 6, 0, 'KkK'); putRow(rows, 5, 0, 'fFf'); putRow(rows, 4, 0, 'FwF'); putRow(rows, 3, 1, 'F'); putRow(rows, 12, 5, 'g'); putRow(rows, 13, 12, 'g'); }
    else if (pose === 4) {   /* THE RELEASE: flung forward and out, the tip empty, a trail of sparks off it */
      for (let k = 0; k < 6; k++) putRow(rows, 12 - k, 11 + k, 'k'); putRow(rows, 12, 10, 'g'); putRow(rows, 6, 14, 'K'); putRow(rows, 5, 15, 'f'); putRow(rows, 7, 15, 'F'); putRow(rows, 4, 14, 'f'); }
    else if (pose === 5) { staffV(rows, 12, 3, 13, true, true); putRow(rows, 9, 11, 'g'); putRow(rows, 11, 11, 'g'); }                       /* the staff raised high (the rune's slot) */
    else if (pose === 7) {   /* THE FLAME WARD: the staff planted, both palms out, the tip blazing, the robe hem blown up */
      staffV(rows, 13, 6, 19, true, true); putRow(rows, 12, 11, 'ggg'); putRow(rows, 12, 0, 'ggg'); putRow(rows, 11, 0, 'F'); putRow(rows, 11, 15, 'F'); putRow(rows, 10, 1, 'f'); putRow(rows, 19, 0, 'f'); putRow(rows, 18, 14, 'f'); }
    else if (pose === 8) {   /* DOUSED: hunched, the hat limp and dripping, the staff a black smoking stick with a drip off the claw, a puddle of steam */
      rows.unshift(''); rows.length = Math.min(rows.length, 20); for (let y = 7; y <= 19; y++) putRow(rows, y, 13, 'x'); putRow(rows, 7, 12, 'KxK'); putRow(rows, 13, 12, 'g'); putRow(rows, 9, 3, 'U'); putRow(rows, 11, 8, 'U'); }
    else { staffV(rows, 13, 5, 19, true, false); putRow(rows, 13, 12, 'g'); }                                                              /* idle / walk: the staff upright in the near hand, a small flame */
    while (rows.length < 20) rows.push(''); rows.length = 20; rows.push(feet[pose === 1 ? 1 : pose === 2 ? 2 : 0]);
    return outline(fromGrid(rows.map(r => (r || '').padEnd(16, '.').slice(0, 16)), Object.assign({ U: '#6fa8dc' }, P), 1), OUT); };
  return pack([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(frame), 8, 21, 10, 16);
}
export const bakeGoblinFireMage = () => bake(false);
export const bakeCinderAcolyte = () => bake(true);
/* the frame for a fire skin by mode (main.js's gobmage frame pick asks this first) */
export function fireMageFrame(e) {
  if (e.alive === false) return 9;
  if (e.hurtT > 0 && e.mode !== 'flameWard' && e.mode !== 'doused') return 6;   /* knocked about, and it shows */
  if (e.mode === 'lobTell') return 3;
  if (e.mode === 'lob') return 4;
  if (e.mode === 'flameWard' || e.mode === 'spent') return 7;
  if (e.mode === 'doused') return 8;
  return Math.abs(e.vx) > 4 ? 1 + Math.floor(e.anim * 6) % 2 : 0;
}

/* ---------------------------------------------------------------- THE FIRE MAGE'S FIRE: the bolt, the burning patch, the ward, the steam, the water butt (claude/pyroboss2art) */
const FC = { out: '#1a0a04', dk: '#3a1408', rd: '#d8481c', or: '#ff6b2c', am: '#ff9a5c', yl: '#ffd36b', cr: '#fff6c8', wh: '#ffffff', sm: '#4a4038' };
const fh = n => { n = Math.imul(n ^ 61, 0x9e3779b1); n ^= n >>> 15; n = Math.imul(n, 0x85ebca6b); n ^= n >>> 13; return (n >>> 0) / 4294967296; };
const fpx = (g, x, y, col, a = 1) => { g.globalAlpha = a; g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); g.globalAlpha = 1; };
const fdisc = (g, cx, cy, r, col, a = 1) => { g.globalAlpha = a; g.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + 0.25)); g.fillRect(Math.round(cx) - w, Math.round(cy) + y, 2 * w + 1, 1); } g.globalAlpha = 1; };
/* THE FIRE BOLT in flight: a dark-rimmed ball (white core, yellow, orange skin) with a flame tail dragged back along its heading and sparks shed off it; (x, y) = its centre. */
export function drawBolt(g, x, y, vx, vy, time) {
  const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp, f = Math.floor(time * 16) % 3;
  fdisc(g, x, y, 7, FC.or, 0.2);
  for (let k = 11; k >= 1; k--) { const r = k < 3 ? 3 : k < 6 ? 2 : 1, t = k / 11, cx = x - ux * k * 1.5 + Math.round((fh(k * 7 + f) - 0.5) * 1.6), cy = y - uy * k * 1.5 + Math.round((fh(k * 5 + f) - 0.5) * 1.6);
    if (k > 5 && (k + f) % 2) continue; fdisc(g, cx, cy, r, t < 0.35 ? FC.am : t < 0.7 ? FC.or : FC.rd, 1 - t * 0.5); }
  fdisc(g, x, y, 4, FC.dk, 1); fdisc(g, x, y, 3, FC.or, 1); fdisc(g, x, y, 2, FC.yl, 1); fpx(g, x, y, FC.cr); fpx(g, x - 1, y - 1, FC.wh);
  for (let i = 0; i < 3; i++) fpx(g, x - ux * (6 + fh(i * 9 + f) * 10) + (fh(i * 3 + f) - 0.5) * 6, y - uy * (6 + fh(i * 9 + f) * 10) + (fh(i * 5 + f) - 0.5) * 6, i % 2 ? FC.yl : FC.cr);
}
/* THE BURNING PATCH: k = life left (1..0), time, w = width, fuel = 'grass' (a green rim of blades alight, tendrils reaching out along the ground and a brighter, taller fire),
   'thatch' (straw stalks, lit gold) or 'stone' (the plain scorch). Flames are 3-tone tongues with an outline and a flicker; it gutters low and dark at the end of its life. */
export function drawFirePatch(g, x, y, k, time, w = 28, fuel = 'stone') {
  const X = Math.round(x), Y = Math.round(y), full = Math.min(1, k * 2.2), h = 3 + Math.round(9 * full), W = w / 2 | 0, dying = k < 0.25, spread = fuel !== 'stone';
  g.globalAlpha = 0.2 + 0.1 * full; g.fillStyle = '#ff7a30'; for (let j = 0; j < h + 8; j++) { const u = (h + 7 - j) / (h + 8), hw = Math.round((W + 5) * Math.sqrt(1 - u * u)); g.fillRect(X - hw, Y - h - 7 + j, 2 * hw, 1); } g.globalAlpha = 1;                      /* the glow */
  g.fillStyle = FC.dk; g.fillRect(X - W - 1, Y - 1, w + 2, 2); g.fillStyle = '#1c0c08'; for (let i = -W; i < W; i += 2) g.fillRect(X + i, Y, 1, 1);          /* the char, flecked */
  if (spread) {
    const blade = fuel === 'grass' ? ['#3d6a24', '#6faa4a'] : ['#8a6a2a', '#e0b84a'];
    for (const s of [-1, 1]) for (let j = 1; j <= 5; j++) { const bx = X + s * (W + j * 2), on = j <= 2 + Math.floor(full * 3), hh = on ? 2 + (j % 2) : 3;                  /* the edge tendrils: the next blades taking the flame */
      g.fillStyle = blade[0]; g.fillRect(bx, Y - hh, 1, hh); g.fillStyle = blade[1]; g.fillRect(bx + 1, Y - hh + 1, 1, hh - 1);
      if (on && (j + Math.floor(time * 8)) % 2 === 0) { fpx(g, bx, Y - hh - 1, FC.or); fpx(g, bx, Y - hh - 2, FC.yl, 0.8); } } }
  const n = Math.max(4, Math.floor(w / 5));
  for (let i = 0; i < n; i++) { const fx = X - W + 2 + i * (w - 4) / (n - 1), ph = time * 9 + i * 1.7, fh2 = Math.max(2, Math.round((h - (i % 2) * 3 - (dying ? 3 : 0)) + Math.sin(ph) * 2)), fxr = Math.round(fx);
    for (let y2 = 0; y2 < fh2; y2++) { const t = y2 / fh2, hw = t < 0.3 ? 2 : t < 0.75 ? 1 : 0, sw = Math.round(Math.sin(ph + y2 * 0.4) * (t > 0.5 ? 1 : 0));
      g.fillStyle = FC.rd; g.fillRect(fxr - hw - 1 + sw, Y - 1 - y2, 2 * hw + 3, 1);
      g.fillStyle = t < 0.5 ? FC.or : FC.am; g.fillRect(fxr - hw + sw, Y - 1 - y2, 2 * hw + 1, 1);
      if (t < 0.6 && hw >= 1) { g.fillStyle = t < 0.3 ? FC.cr : FC.yl; g.fillRect(fxr + sw, Y - 1 - y2, 1, 1); } } }
  for (let i = 0; i < 4; i++) { const a = (time * 1.2 + i * 0.27) % 1; fpx(g, X - W + 3 + fh(i * 5) * (w - 6) + Math.sin(time * 4 + i) * 2, Y - h - 2 - a * 16, i % 2 ? FC.yl : FC.or, 1 - a); }   /* embers climbing */
  if (dying) for (let i = 0; i < 3; i++) { const a = (time * 0.9 + i / 3) % 1; fdisc(g, X - 6 + i * 6, Y - h - a * 12, 2, FC.sm, 0.4 * (1 - a)); }   /* smoke as it gutters */
}
/* THE GOBLIN'S FLAME WARD: a small dome (the pyromancer's dome art at the mage's size) with a wreath of tongues round the rim; (x, y) = the dome's centre, k = 0..1 through the ward,
   gut = the last blink (red, gaps, drooping tongues). */
export function drawMageWard(g, x, y, k, gut, time) {
  const R = 14 + Math.round(Math.min(1, k * 6) * 4), s = domeSprite(R, gut ? 'fade' : k < 0.12 ? 'beat' : 'hold', Math.floor(time * 14) % 4);
  g.drawImage(s, Math.round(x) - s.ox, Math.round(y) - s.oy);
  const n = 9; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + time * 1.5, hh = Math.round((gut ? 2 : 4) + Math.sin(time * 12 + i * 2) * 1.5);
    for (let j = 0; j < hh; j++) fpx(g, x + Math.cos(a) * (R + 1 + j), y + Math.sin(a) * (R + 1 + j), j > hh - 2 ? FC.rd : j > 0 ? FC.or : FC.yl, gut ? 0.6 : 0.95); }
}
/* THE STEAM OFF HIS DEAD STAFF while DOUSED: soft grey-white puffs in a pixel stack that widen as they climb, a hiss of water drops, a wet shine at his feet. (x, y) = his chest. */
export function drawDousedSteam(g, x, y, time) {
  for (let q = 0; q < 4; q++) { const k2 = (time * 0.8 + q / 4) % 1; fdisc(g, x + 6 + Math.sin(time * 3 + q * 2) * 2, y - 8 - k2 * 18, 1 + Math.round(k2 * 3), q & 1 ? '#d8dce4' : '#eef1f6', 0.7 * (1 - k2)); }
  for (let q = 0; q < 3; q++) { const k2 = (time * 1.4 + q * 0.31) % 1; fpx(g, x - 4 + q * 4, y - 6 + k2 * 14, '#9ad0ff', 1 - k2 * 0.7); }
  g.globalAlpha = 0.3; g.fillStyle = '#9ad0ff'; g.fillRect(x - 6, y + 10, 12, 1); g.globalAlpha = 1;
}
/* THE GOLD RING of a SPENT mage: a dithered gold ellipse with two ticks, pulsing (B10 shared read). */
export function drawSpentRing(g, x, y, time) {
  const pul = 0.5 + 0.5 * Math.sin(time * 10); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; if (i % 2 && pul < 0.4) continue; fpx(g, x + Math.cos(a) * 10, y + Math.sin(a) * 3, i % 7 === 0 ? FC.cr : FC.yl, 0.55 + 0.4 * pul); }
}
/* THE WATER BUTT (a rain barrel with its bucket beside it): the prop that is not in the burning village. (x, y) = its feet, ~16 wide; time for the water's glint and ripple.
   Dark-rimmed staves of two browns, two iron hoops, a lip with the water showing (bright blue, a moving glint), a wet streak down the side and a droplet from the pipe. */
export function drawWaterButt(g, x, y, time, bucket = true) {
  const X = Math.round(x), Y = Math.round(y), st = ['#3a2616', '#5a3a22', '#4a3018'];
  g.fillStyle = FC.out; g.fillRect(X - 9, Y - 19, 18, 19); g.fillRect(X - 8, Y - 20, 16, 1);
  for (let i = -7; i <= 6; i++) { g.fillStyle = st[(i + 8) % 3]; g.fillRect(X + i, Y - 18, 1, 17); }                           /* the staves, bulging at the middle */
  g.fillStyle = '#6a4a2c'; g.fillRect(X - 7, Y - 17, 1, 15); g.fillStyle = '#2a1a0c'; g.fillRect(X + 6, Y - 17, 1, 15);
  g.fillStyle = '#8a919c'; g.fillRect(X - 8, Y - 14, 16, 2); g.fillRect(X - 8, Y - 5, 16, 2); g.fillStyle = '#b8c0cc'; g.fillRect(X - 7, Y - 14, 14, 1); g.fillRect(X - 7, Y - 5, 14, 1);   /* iron hoops */
  g.fillStyle = FC.out; g.fillRect(X - 8, Y - 21, 16, 3); g.fillStyle = '#2c6a9a'; g.fillRect(X - 7, Y - 20, 14, 2); g.fillStyle = '#4a8ac0'; g.fillRect(X - 6, Y - 20, 12, 1);   /* the water at the lip */
  const gx = Math.round(((time * 0.6) % 1) * 9); g.fillStyle = '#ffffff'; g.fillRect(X - 5 + gx, Y - 20, 2, 1); g.fillStyle = '#bfe6f5'; g.fillRect(X - 5 + ((gx + 5) % 10), Y - 19, 1, 1);
  g.fillStyle = '#4a8ac0'; g.fillRect(X + 4, Y - 18, 1, 8); g.fillStyle = '#9ad0ff'; g.fillRect(X + 4, Y - 18, 1, 3);               /* the wet streak down the side */
  const dr = (time * 1.1) % 1; if (dr < 0.7) fpx(g, X + 4, Y - 10 + dr * 12, '#9ad0ff', 1 - dr);
  g.fillStyle = FC.out; g.fillRect(X - 7, Y - 1, 14, 1);
  if (bucket) { const bx = X + 13; g.fillStyle = FC.out; g.fillRect(bx - 4, Y - 7, 9, 7); g.fillStyle = '#6a4a2c'; g.fillRect(bx - 3, Y - 6, 7, 6); g.fillStyle = '#8a919c'; g.fillRect(bx - 3, Y - 5, 7, 1); g.fillRect(bx - 3, Y - 2, 7, 1); g.fillStyle = '#4a8ac0'; g.fillRect(bx - 3, Y - 7, 7, 1); g.fillStyle = '#8a919c'; g.fillRect(bx - 4, Y - 9, 1, 2); g.fillRect(bx + 4, Y - 9, 1, 2); g.fillRect(bx - 3, Y - 10, 7, 1); }
}
