// wicker_queen.js - THE WICKER QUEEN (claude/fair3, L3), in the fair's own style (src/redraw/fair_art.js: px.js primitives only, every frame faces RIGHT,
// L is the flip, one canvas for every frame, ax = the body's centre column, ay = the row under the lowest pixel, w/h = the hit box).
// A tall wicker effigy: a conical skirt of woven withies, a barrel of a torso caged in hoops, long arms of bundled rods with twig fingers, a woven head
// with two holes for eyes and a crown of wheat ears, maypole ribbons streaming from the crown. The weave is laid pixel by pixel over the body's own
// colour (a diagonal lattice of dark and light strands), so it reads as basketwork at any size; burning, the same lattice goes to char and ember.
//   0 STILL (frozen: arms stiff at her sides - what you see when you look at her) | 1,2 creep (leaning in, reaching, the hem trailing)
//   3 SICKLE TELL (the sickle up over her head, the eye holes burning red: the mummers' glow) | 4 the sickle swept low
//   5 LASH TELL (both arms up, the ribbons pulled taut) | 6 the lash (arms flung wide, the ribbons out) | 7 THE CROWNING (hands to the crown, the wheat lit gold)
//   8 CATCH (the hem takes fire, arms up) | 9,10 BURN (charred and burning, the cage open on an ember heart: the opening) | 11 flung back | 12 hurt | 13 dead (a heap)
import { canvas, px, rect, fillPoly, line, ellipse, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { WQ } from '../wicker-queen.js';

const W = 64, H = 92, CX = 28;
const C = { base: '#b08a4e', dark: '#6e5028', mid: '#a8834a', light: '#d8b878', char: '#7a4a2a', charD: '#2a1810', charM: '#5a3018', ember: '#ff8a30',
  wheat: '#e8c23a', wheatL: '#fff0a0', wheatD: '#a87a18', eye: '#120e14', red: '#ff2a1a', hot: '#fff4c8', iron: '#8a919c', ironL: '#e8eef4', haft: '#6a4a2a',
  f1: '#a01c10', f2: '#d84a14', f3: '#f08a28', f4: '#ffc850', smoke: '#5a5064' };
const RIB = ['#b8382c', '#e8c23a', '#3a7ab8', '#8fd160', '#c9a0ff', '#f4ead0'];
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/* THE WEAVE: every pixel of the body colour becomes basketwork - dark strands one way, light the other, the reed between */
function weave(c) {
  const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data, B = rgbOf(C.base), K = rgbOf(C.char);
  const put = (i, h) => { const [r, gg, b] = rgbOf(h); d[i] = r; d[i + 1] = gg; d[i + 2] = b; };
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (!d[i + 3]) continue;
    const isB = d[i] === B[0] && d[i + 1] === B[1] && d[i + 2] === B[2], isK = d[i] === K[0] && d[i + 1] === K[1] && d[i + 2] === K[2]; if (!isB && !isK) continue;
    const a = (x + y) % 4 === 0, b = (x - y + 400) % 4 === 0;
    if (isB) put(i, a ? C.dark : b ? C.light : C.mid); else put(i, a ? C.charD : b ? C.ember : C.charM); }
  g.putImageData(img, 0, 0); }
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const flameTongue = (g, x, y, h, w, k) => { fillPoly(g, [[x - w, y], [x - w + 1, y - h * 0.5], [x + (k & 1 ? 1 : -1), y - h], [x + w - 1, y - h * 0.5], [x + w, y]], C.f2);
  fillPoly(g, [[x - w + 1, y], [x, y - h * 0.7], [x + w - 1, y]], C.f3); px(g, x, y - Math.round(h * 0.4), C.f4); px(g, x, y - 1, C.f4); };

function drawQueen(g, f) {
  const still = f === 0, creep = f === 1 || f === 2, sTell = f === 3, sick = f === 4, lTell = f === 5, lash = f === 6, crown = f === 7, cat = f === 8, burn = f === 9 || f === 10, rise = f === 11, hurt = f === 12, dead = f === 13;
  const body = burn ? C.char : C.base;
  if (dead) {   /* A HEAP: burnt withies in a pile, the crown fallen on top, a ribbon or two, smoke */
    const by = H - 2; fillPoly(g, [[CX - 22, by], [CX - 14, by - 9], [CX - 2, by - 13], [CX + 10, by - 10], [CX + 22, by]], C.char);
    for (let i = 0; i < 9; i++) line(g, CX - 20 + i * 5, by - 1 - (i % 3) * 3, CX - 16 + i * 5, by - 8 - (i % 2) * 3, C.charD);
    for (let i = 0; i < 5; i++) { line(g, CX - 6 + i * 3, by - 13, CX - 7 + i * 3, by - 18 - (i % 2) * 2, C.wheatD); px(g, CX - 7 + i * 3, by - 19 - (i % 2) * 2, C.wheat); }
    rect(g, CX - 8, by - 13, 16, 2, C.wheatD); line(g, CX + 8, by - 12, CX + 24, by - 2, RIB[0]); line(g, CX - 10, by - 11, CX - 26, by - 1, RIB[2]);
    px(g, CX - 4, by - 6, C.ember); px(g, CX + 6, by - 4, C.ember); px(g, CX + 1, by - 8, C.f4);
    return; }
  const lean = creep ? 3 : sick ? 3 : rise ? -4 : hurt ? -2 : cat ? -1 : 0, hemShift = creep ? -3 : rise ? 3 : 0, bob = f === 2 ? 1 : 0;
  const waist = 52 + bob, hem = H - 2, top = 32 + bob;              // the skirt's waist, its hem; the torso's shoulders
  // -- the ribbons from the crown, streaming behind her (to the left), or pulled up / flung wide for the lash
  const hx = CX + 1 + lean, hy = 20 + bob;                            // the head's middle
  if (!lTell && !lash) for (let i = 0; i < 4; i++) { const sw = creep ? 4 : burn ? 2 : 1, ox = hx - 5, oy = hy - 5 + i;   /* each ribbon its own way, from behind the crown */
    const mx = ox - 6 - i * 4 - sw, my = oy + 6 + i * 5, ex = ox - 8 - i * 6 - sw * 2, ey = oy + 16 + i * 8; line(g, ox, oy, mx, my, RIB[i]); line(g, mx, my, ex, ey, RIB[i]); px(g, ex - 1, ey + 1, RIB[i]); }
  // -- the skirt: a tall cone of weave, its hem of rod-ends
  fillPoly(g, [[CX - 7 + lean, waist], [CX + 7 + lean, waist], [CX + 16 + hemShift, hem], [CX - 16 + hemShift, hem]], body);
  for (let x = CX - 16 + hemShift; x <= CX + 16 + hemShift; x += 2) px(g, x, hem + 1, burn ? C.charD : C.dark);
  for (const yy of [waist + 10, waist + 22]) { const t = (yy - waist) / (hem - waist), hw = Math.round(7 + 9 * t); line(g, CX - hw + lean + Math.round(hemShift * t), yy, CX + hw + lean + Math.round(hemShift * t), yy, burn ? C.charD : C.dark); }   // two hoops round the skirt
  // -- the torso: a caged barrel with three hoops; burning, it opens on an ember heart
  ellipse(g, CX + lean, top + 10, 8, 11, body);
  for (const yy of [top + 3, top + 10, top + 17]) line(g, CX - 7 + lean, yy, CX + 7 + lean, yy, burn ? C.charD : C.dark);
  if (burn || cat) { const k = f === 10 ? 1 : 0; ellipse(g, CX + lean, top + 10, burn ? 4 : 2, burn ? 6 : 3, C.f2); ellipse(g, CX + lean, top + 10 + k, burn ? 2 : 1, burn ? 4 : 2, C.f4); if (burn) { px(g, CX - 5 + lean, top + 6, C.eye); px(g, CX + 5 + lean, top + 13, C.eye); } }
  // -- the neck: a bound bundle
  rect(g, hx - 1, hy + 6, 3, top - hy - 5, burn ? C.charD : C.dark); px(g, hx, hy + 8, C.light);
  // -- the arms: bundled rods from the shoulders, twig fingers at the ends
  const sL = [CX - 7 + lean, top + 3], sR = [CX + 7 + lean, top + 3];
  const arm = (s, e, fingers = true) => { line(g, s[0], s[1], e[0], e[1], burn ? C.charM : C.dark, 2); line(g, s[0], s[1] - 1, e[0], e[1] - 1, burn ? C.char : C.light);
    if (fingers) for (const [dx, dy] of [[2, -2], [3, 0], [2, 2]]) line(g, e[0], e[1], e[0] + Math.sign(e[0] - s[0] || 1) * dx, e[1] + dy, burn ? C.charD : C.dark); };
  let aL, aR;
  if (still) { aL = [CX - 13, top + 20]; aR = [CX + 13, top + 20]; }
  else if (creep) { aL = [CX + 10 + lean, top + 12 - bob]; aR = [CX + 19 + lean, top + 8 + bob]; }
  else if (sTell) { aL = [CX - 12 + lean, top + 16]; aR = [CX + 4 + lean, top - 18]; }
  else if (sick) { aL = [CX - 10 + lean, top + 12]; aR = [CX + 22 + lean, top + 18]; }
  else if (lTell) { aL = [CX - 11, top - 20]; aR = [CX + 13, top - 20]; }
  else if (lash) { aL = [CX - 24, top + 2]; aR = [CX + 26, top + 2]; }
  else if (crown) { aL = [CX - 5 + lean, hy - 5]; aR = [CX + 7 + lean, hy - 5]; }
  else if (cat || burn) { const k = f === 10 ? 3 : 0; aL = [CX - 16, top - 10 + k]; aR = [CX + 17, top - 8 - k]; }
  else if (rise) { aL = [CX - 16 + lean, top + 4]; aR = [CX + 12 + lean, top - 6]; }
  else { aL = [CX - 14 + lean, top + 14]; aR = [CX + 10 + lean, top + 18]; }
  arm(sL, aL); arm(sR, aR, !sTell && !sick);
  // -- THE SICKLE: raised over her head for the tell, swept low for the blow
  if (sTell) { line(g, aR[0], aR[1] + 2, aR[0] - 1, aR[1] - 6, C.haft, 2); const bx = aR[0] - 1, by = aR[1] - 6;
    for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.0 + i * 0.09), x = Math.round(bx + 8 + Math.cos(a) * 9), y = Math.round(by + 1 + Math.sin(a) * 9); px(g, x, y, C.iron); px(g, x, y + 1, C.iron); px(g, x, y - 1, C.ironL); } }
  if (sick) { line(g, aR[0] - 3, aR[1] - 1, aR[0] + 2, aR[1] + 1, C.haft, 2); const bx = aR[0] + 2, by = aR[1] + 1;
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (-0.4 + i * 0.12), x = Math.round(bx + Math.cos(a) * 8), y = Math.round(by + 4 + Math.sin(a) * 8); px(g, x, y, C.iron); px(g, x + 1, y, C.ironL); }
    for (let i = 0; i < 3; i++) line(g, CX - 2 + i * 4, top + 26 + i * 3, CX + 14 + i * 4, top + 24 + i * 3, '#f4ead0'); }   // the sweep's streaks
  // -- the ribbons in the hands: pulled taut up for the tell, flung wide in the lash
  if (lTell) for (let i = 0; i < 3; i++) { line(g, aL[0] - i, aL[1], aL[0] - 3 - i * 2, 0, RIB[i]); line(g, aR[0] + i, aR[1], aR[0] + 3 + i * 2, 0, RIB[i + 3]); }
  if (lash) for (let i = 0; i < 3; i++) { line(g, aL[0], aL[1] + i * 2, 0, aL[1] + i * 4 - 2, RIB[i]); line(g, aR[0], aR[1] + i * 2, W - 1, aR[1] + i * 4 - 2, RIB[i + 3]); }
  // -- the head: a woven oval, two holes for eyes (red and white-hot for the sickle), a slit of a mouth
  ellipse(g, hx, hy, 5, 7, body);
  const hot = sTell || sick, ex = hx + 1;
  for (const dx of [0, 3]) { rect(g, ex + dx, hy - 2, 2, 2, hot ? C.red : burn ? C.ember : C.eye); if (hot) px(g, ex + dx, hy - 2, C.hot); }
  line(g, ex, hy + 3, ex + 3, hy + 3, burn ? C.charD : C.eye);
  // -- THE CROWN OF WHEAT: a plaited band and seven ears; lit gold for the crowning
  const cy0 = hy - 7, cg = crown ? C.wheatL : C.wheat;
  rect(g, hx - 5, cy0, 11, 2, burn ? C.f2 : C.wheatD); for (let x = hx - 5; x <= hx + 5; x += 2) px(g, x, cy0, cg);
  for (let i = 0; i < 7; i++) { const x = hx - 5 + i * 2 - (i > 3 ? 0 : 0), lean2 = (i - 3) * 0.6, h2 = 6 + (i % 2) * 2 + (i === 3 ? 2 : 0);
    const tx = Math.round(x + lean2 * 2), ty = cy0 - h2; line(g, x, cy0, tx, ty + 2, C.wheatD); rect(g, tx - 1, ty, 2, 3, cg); px(g, tx, ty - 1, crown ? C.hot : C.wheatL); }
  if (crown) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; px(g, Math.round(hx + Math.cos(a) * 11), Math.round(cy0 - 5 + Math.sin(a) * 7), C.wheatL); }
  // -- FIRE: the hem takes it (catch), all of her burns (burn); smoke for the throw-back
  if (cat) for (let i = 0; i < 6; i++) flameTongue(g, CX - 14 + i * 6 + hemShift, hem - 1, 6 + (i % 3) * 2, 2, i);
  if (burn) { const k = f === 10 ? 1 : 0; for (let i = 0; i < 7; i++) flameTongue(g, CX - 15 + i * 5, hem - 1 - (i % 2) * 6, 10 + ((i + k) % 3) * 4, 3, i + k);
    for (let i = 0; i < 4; i++) flameTongue(g, CX - 6 + i * 4 + lean, top + 8 - (i % 2) * 5, 7 + ((i + k) % 2) * 4, 2, i + k);
    flameTongue(g, hx - 3, cy0 - 1, 8 + k * 3, 2, k); flameTongue(g, hx + 3, cy0, 6 + (1 - k) * 3, 2, k + 1); }
  if (rise) for (let i = 0; i < 6; i++) px(g, CX - 10 + i * 4, hem - 8 - (i % 3) * 7, C.smoke);
}

export function bakeWickerQueen() {
  const R = [];
  for (let f = 0; f < 14; f++) { const [c, g] = canvas(W, H); drawQueen(g, f); weave(c); outline(c, OUT); R.push(settle(c)); }
  const L = R.map(c => flipX(c)), white = R.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax: CX, ay: H - 1, w: WQ.w, h: WQ.h };
}
