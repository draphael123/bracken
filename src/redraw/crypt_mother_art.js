// src/redraw/crypt_mother_art.js - THE CRYPT MOTHER (claude/silkart, the art pass over claude/silk's greybox; flag OFF). Rect-based (px.js), no paths: it draws in tools/node-canvas.mjs too.
// A huge crypt spider, side view, body centre at (ex, ey), facing `f`: a dark chitin abdomen with a SKULL MARK in bone-pale (the crypt), a grey-furred cephalothorax with a mask of
// eight eyes (two big), white fangs, eight jointed legs banded in silk. Every mode of the fight reads in the body (the POSE table in src/crypt-mother-hands.js is its data):
//   sleep (curled, legs tucked)      wake (rises, front legs up)       hang (dangles from her ANCHOR line)       climb (hauling home on her thread)
//   spitTell (abdomen tipped UP, spinneret out: the glob)   spit (abdomen snaps down)   pounceTell (coiled low, fangs out, a red hum)   pounce (legs thrown wide, falling)
//   landed (flat, legs splayed)   clutchTell / clutch (the abdomen swells sick green and pulses, a sac drops)   sweepTell (one front leg cocked back, high)   sweep (it is flung out along the strand)
//   fallen (ON HER BACK: the pale belly up, legs curled in, the soft amber spot - the OPEN read)   lament (P2: legs flung up, fangs wide, the whole body flaring)
import { px, rect, line, ellipse, circle } from '../px.js';
import { SA, strandLine } from './silk_art.js';

const R = Math.round;
const C = { chit: '#26263a', chitMid: '#383852', chitHi: '#5c5c7c', fur: '#a8a8c0', furLo: '#6e6e8a', bone: '#d8d0b8', boneLo: '#8a8470', eye: '#ff4a2a', eyeHi: '#ffe0a0', fang: '#f4efdc', fangLo: '#b8b098', band: '#cfcfe0', belly: '#9a9ab4', bellyLo: '#6e6e8c', sick: '#9ae67a', sickLo: '#4a8a4a', sickHi: '#dcffc8', out: '#08080e' };
const FLASH = Object.fromEntries(Object.keys(C).map(k => [k, '#ffffff']));

export function drawMother(g, ex, ey, pose, face, time, o = {}) {
  const P = pose || {}, f = face || 1, up = P.upside ? -1 : 1, K = o.flash ? FLASH : C;
  ex = R(ex); ey = R(ey);
  const X = x => ex + R(x * f), Y = y => ey + R(y * up);
  const dot = (x, y, c) => px(g, X(x), Y(y), c);
  const box = (x, y, w, h, c) => { const x0 = f > 0 ? X(x) : X(x + w - 1), y0 = up > 0 ? Y(y) : Y(y + h - 1); rect(g, x0, y0, w, h, c); };
  const seg = (x0, y0, x1, y1, c, hi) => { line(g, X(x0), Y(y0), X(x1), Y(y1), K.out, 3); line(g, X(x0), Y(y0), X(x1), Y(y1), c, 2); if (hi) line(g, X(x0), Y(y0) - 1 * up, X(x1), Y(y1) - 1 * up, hi); };
  const ell = (x, y, rx, ry, c) => ellipse(g, X(x), Y(y), rx, ry, c);
  const crouch = P.crouch ? 1 : 0, curl = P.curl ? 1 : 0, lift = P.lift || 0, spread = P.spread == null ? 24 : P.spread;
  const flare = P.pulse ? 0.5 + 0.5 * Math.sin(time * 10) : 0;
  const bodyDy = crouch ? 4 : curl ? 5 : 0, floor = 12 + (crouch ? -3 : 0) + (curl ? -4 : 0);
  /* ---------- the legs behind the body (the rear four), then the abdomen, then the front legs over ---------- */
  const legs = side => { for (let i = 0; i < 4; i++) {
    const sd = side * f, rootX = side * (3 + i * 2.5), rootY = -1 + i * 1 + bodyDy;
    const reach = (curl ? 7 : spread * 0.55) + 4 + i * (curl ? 1 : 5.5), kneeX = rootX + side * reach * 0.45, kneeY = rootY - (curl ? 4 : 11 + (3 - i) * 1.2) - (side === 1 ? lift * (i === 0 ? 1 : 0.35) : 0);
    let tipX = rootX + side * reach, tipY = floor + (i & 1);
    if (up < 0) { /* on her back: the legs curl up and in */ tipX = rootX + side * (3 + i * 3); tipY = -9 - i * 2 + (Math.floor(time * 5 + i * 1.7) & 1); }
    const col = i & 1 ? K.chit : K.chitMid;
    if (P.leg !== undefined && side === 1 && i === 0) { /* the SWEEP: the front leg flung out low along the strand (or cocked back and up while it is told) */
      const ext = P.leg > 0, endX = ext ? 8 + Math.abs(P.leg) * 1.1 : -2, endY = ext ? floor - 2 : -22;
      seg(rootX, rootY, rootX + (ext ? 14 : 3), ext ? rootY + 4 : -14, col, K.chitHi); seg(rootX + (ext ? 14 : 3), ext ? rootY + 4 : -14, endX, endY, K.chitMid, K.band); if (ext) { box(endX - 1, endY - 3, 3, 5, K.bone); }
      continue; }
    seg(rootX, rootY, kneeX, kneeY, col, K.chitHi); seg(kneeX, kneeY, tipX, tipY, K.chitMid, i & 1 ? K.band : K.chitHi);
    dot(kneeX, kneeY - 2, K.band); dot(kneeX + side, kneeY - 1, K.fur); dot((kneeX + tipX) / 2 + side, (kneeY + tipY) / 2, K.band);   /* the silk bands + hair at the joints */
    dot(tipX, tipY + 1, K.bone);
  } };
  legs(-1);   /* the rear legs first (the back of the body is -f) */
  /* ---------- the abdomen: dark, swollen, the SKULL MARK on its back ---------- */
  const ab = P.abd || 0, abY = -2 + bodyDy - ab * 0.5, sw = 1 + flare * 0.12;
  const abCol = flare > 0.55 ? K.sickLo : K.chit, abMid = flare > 0.55 ? K.sick : K.chitMid;
  ell(-12, abY, R(12 * sw), R(10 * sw), K.out); ell(-12, abY, R(11 * sw), R(9 * sw), abCol); ell(-13, abY - 1, R(9 * sw), R(7 * sw), abMid); ell(-15, abY - 3, 5, 3, K.chitHi);
  if (up > 0) { /* the skull on the dorsal: a pale dome, two dark sockets, a nose notch, a row of teeth */
    ell(-14, abY - 2, 5, 4, K.bone); box(-19, abY + 1, 10, 3, K.bone); box(-17, abY - 2, 3, 3, K.out); box(-13, abY - 2, 3, 3, K.out); dot(-15, abY + 1, K.out); dot(-14, abY + 1, K.out);
    for (let t = 0; t < 4; t++) dot(-18 + t * 2.5, abY + 3, t & 1 ? K.out : K.boneLo); dot(-12, abY - 5, K.fang); dot(-17, abY - 5, K.fang);
    for (let b = 0; b < 3; b++) box(-22 + b * 2, abY - 7 + b * 3, 1, 3, K.band);   /* silk banding down the flank */
  } else { /* THE BELLY, up: pale and soft, with the amber spot (the opening: x2) and the spinneret */
    ell(-12, abY, 8, 6, K.belly); ell(-12, abY, 5, 3, K.bellyLo); const pul = 0.5 + 0.5 * Math.sin(time * 8); ell(-12, abY, 3, 2, pul > 0.5 ? SA.amber : SA.amberLo); dot(-12, abY, SA.amberHi);
    for (let t = 0; t < 4; t++) box(-18 + t * 3, abY - 4, 1, 2, K.fur); }
  /* the spinneret at the abdomen's tail (and the thread it is spinning when told) */
  const spy = abY + (P.spin ? -2 : 4), spx = -22 - (P.spin ? 3 : 0); ell(spx, spy, 2, 2, K.chitMid); dot(spx - 1, spy, K.band);
  if (P.spin) { const glow = 0.5 + 0.5 * Math.sin(time * 14); for (let k = 0; k < 5; k++) dot(spx - 3 - k * 2, spy - k * (up > 0 ? 1 : -1), glow > 0.5 ? K.sickHi : K.sick); }
  if (P.pulse) { for (let k = 0; k < 3; k++) circle(g, X(-18 + k * 4), Y(abY + 6 + ((time * 14 + k * 5) % 9)), 1.4, K.sick); }   /* the clutch: eggs pushing through */
  /* ---------- the cephalothorax ---------- */
  const hy = bodyDy - 1 + (up < 0 ? 1 : 0);
  ell(7, hy, 9, 7, K.out); ell(7, hy, 8, 6, K.chitMid); ell(8, hy - 2, 6, 3, K.chitHi);
  for (let k = 0; k < 7; k++) dot(2 + k * 2, hy - 7 + (k & 1), K.fur); dot(10, hy - 7, K.furLo);   /* fur on the dome */
  const tell = !!(P.pulse || P.crouch || P.leg < 0 || P.spin) && (time * 8) % 2 < 1, eyeC = P.upside ? '#6a2a2a' : (tell || P.fang >= 3) ? K.eyeHi : K.eye;
  box(11, hy - 4, 3, 3, K.out); box(12, hy - 3, 2, 2, eyeC); box(7, hy - 4, 3, 3, K.out); box(8, hy - 3, 2, 2, eyeC);   /* the two big eyes */
  for (const [dx, dy] of [[5, -5], [13, -6], [9, -6], [14, -1]]) dot(dx, hy + dy, eyeC);   /* the small ones */
  /* chelicerae: two white fangs, longer as it commits; the mouth opens wide on the lament */
  const fl = (P.fang || 0), open = fl >= 4 ? 2 : 0;
  box(12 + open, hy + 2, 3, 3, K.chitHi); box(13 + open, hy + 5, 2, 2 + fl, K.fang); dot(13 + open, hy + 6 + fl, K.fangLo);
  box(9, hy + 2, 3, 3, K.chitMid); box(9, hy + 5, 2, 1 + fl, K.fang);
  if (fl >= 3) { dot(14 + open, hy + 8 + fl, K.sick); dot(14 + open, hy + 10 + fl, K.sickLo); }   /* venom beads when she is committed */
  legs(1);   /* the front legs over the body */
  if (P.upside) { /* the OPEN read: stars over her, an amber ring on the belly */
    for (let k = 0; k < 3; k++) dot(-12 + k * 12 + Math.floor(Math.sin(time * 8 + k) * 2), -17 - (k & 1) * 2, SA.amberHi);
    rect(g, ex - 18, ey - 15, 36, 1, al(SA.amber, 0.55)); }
}
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };

/* the anchor line she hangs from (knot -> her back) and the told shadow/thread of the pounce */
export function drawAnchorLine(g, kx, ky, bx, by) { strandLine(g, R(kx), R(ky), R(bx), R(by)); }
export function drawPounceShadow(g, x, floorY, hangY, time) { const on = (time * 10) % 2 < 1; rect(g, R(x) - 16, R(floorY) - 2, 32, 3, 'rgba(6,6,10,0.85)'); rect(g, R(x) - 11, R(floorY) - 3, 22, 1, 'rgba(6,6,10,0.6)');
  for (let yy = R(hangY); yy < R(floorY); yy++) px(g, R(x), yy, on && ((yy >> 1) & 1) ? '#ff4a2a' : (yy & 3 ? SA.silk : SA.silkLo)); }
/* a falling floor strand's told flash (P2): a red-white pulse along the strand's length */
export function drawStrandFlash(g, x0, x1, y, time) { if ((time * 8) % 2 < 1) { rect(g, R(x0), R(y), R(x1 - x0), 3, '#ff4a2a'); rect(g, R(x0), R(y) - 1, R(x1 - x0), 1, '#ffd0c0'); } else rect(g, R(x0), R(y), R(x1 - x0), 2, SA.silkMid); }
/* the sweep's told line along the floor */
export function drawSweepTell(g, x, floorY, reach, time) { rect(g, R(x) - reach, R(floorY) - 3, reach * 2, 2, (time * 8) % 2 < 1 ? '#ff4a2a' : '#ff9a5c'); }
