// unburied_world.js — THE UNBURIED FIELD's own look (Daniel 2026-09-24: "it uses the forest theme/tiles ... it needs a
// graveyard theme, something similar to the level that is after Waymeet"). The level was built with no palette at all, so
// it fell through to the default kit: oaks, green turf, felled-log ledges and a blue day sky over a battle nobody buried.
//
// THE FAMILY IS THE HEXED FIELDS' GRAVEYARD (src/redraw/fields_world.js): the same pixel habits - tiled silhouettes rim-lit
// from the sky, fog lying in the hollows, dark low-contrast layers behind the play - and the same grave stones and wooden
// crosses on the ground (the level dresses with its fieldGrave). WHAT MAKES IT A DIFFERENT PLACE AT A GLANCE (F6):
//   - the hour: an EMBER DUSK (bruised violet over a smoke-red horizon), not the fields' cold blue night under a moon
//   - the horizon: a long ridge with a GHOST ARMY standing on it - ranks of pale figures, spears and old standards
//   - the wreckage: a snapped trebuchet, a siege tower gone over, pikes and lances left standing in the ground
//   - the ground: dead straw-coloured grass over dark peat with the battle's bones in it (boneSoil)
// Nothing here is interactive, so nothing wears a gameplay colour: the ghosts are a cold grey-white, never the fields' green.
//
// BACKGROUNDS (tiled horizontally, transparent above the silhouette)
//   bakeSkyUnburied(h)           1 x h    ember dusk
//   bakeFarUnburied(w, h, seed)  320x90   the ridge and the ghost army on it, fog along its foot. VH-90, x0.15
//   bakeMidUnburied(w, h, seed)  480x140  barrows and crosses, the broken trebuchet, the fallen tower, standards. VH-140, x0.3
//   bakeNearUnburied(w, h, seed) 640x300  pikes and lances left in the ground, torn pennants, a cart wheel. VH-300, x0.55
//   bakeNearLimbs(seed)          256x42   bare dead limbs over the lens (the near-lens band: no leaves on this field)
//   bakeFGUnburied(w, h, seed)   640xh    dead grass and snapped shafts along the bottom, drawn at 0.3 behind the actors
// DECO PROPS (anchor bottom-centre, bottom row = ground, dark OUT outline)
//   brokenSpears(v 0-2) 22x26 · stuckShield(v 0-1) 16x14 · fallenBanner() 34x12 · crookedCross(v 0-1) 13x20
//   siegeWreck() 50x30 · brokenPillar(v 0-1) 14x34 · oldStandard() 16x46
// GROUND
//   boneSoil(tiles, seed)        paints the field's dead into a share of the dirt tiles: ribs, a skull, a long bone, a helm
import { canvas, px, rect, fillPoly, line, circle, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';

const TAU = Math.PI * 2;
const hsh = (x, y, s = 0) => { let t = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) >>> 0; t = Math.imul(t ^ (t >>> 13), 1274126177); return ((t ^ (t >>> 16)) >>> 0) / 4294967296; };
const rgba = (rgb, a) => 'rgba(' + rgb + ',' + a.toFixed(3) + ')';
const wrapDo = (w, fn) => { for (const dx of [-w, 0, w]) fn(dx); };
function thick(g, x0, y0, x1, y1, th, colr) {
  const n = Math.max(1, Math.round(th));
  if (Math.abs(x1 - x0) < Math.abs(y1 - y0)) { for (let i = 0; i < n; i++) line(g, x0 - n / 2 + i + 0.5, y0, x1 - n / 2 + i + 0.5, y1, colr); }
  else line(g, x0, y0 - n / 2 + 0.5, x1, y1 - n / 2 + 0.5, colr, n);
}
/* a rim of sky light along the top edge of every silhouette; x wraps so a tiled layer keeps its seam */
function rimLight(c, top) {
  const g = c.getContext('2d'), w = c.width, h = c.height, d = g.getImageData(0, 0, w, h).data, marks = [];
  const op = (x, y) => d[(y * w + ((x + w) % w)) * 4 + 3] > 160;
  for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) if (op(x, y) && !op(x, y - 1)) marks.push(x, y);
  g.fillStyle = top; for (let i = 0; i < marks.length; i += 2) g.fillRect(marks[i], marks[i + 1], 1, 1);
  return c;
}
function gnarl(g, x, y, ang, len, th, depth, colr, rnd) {
  const bend = (rnd() - 0.5) * 0.7, mx = x + Math.cos(ang + bend) * len * 0.5, my = y + Math.sin(ang + bend) * len * 0.5;
  const x1 = mx + Math.cos(ang - bend * 0.6) * len * 0.5, y1 = my + Math.sin(ang - bend * 0.6) * len * 0.5;
  thick(g, x, y, mx, my, th, colr); thick(g, mx, my, x1, y1, Math.max(1, th - 0.7), colr);
  if (depth <= 0 || len < 5) return;
  const n = rnd() < 0.35 ? 3 : 2;
  for (let i = 0; i < n; i++) gnarl(g, x1, y1, ang + (i - (n - 1) / 2) * (0.5 + rnd() * 0.35) + (rnd() - 0.5) * 0.3, len * (0.55 + rnd() * 0.25), Math.max(1, th - 1), depth - 1, colr, rnd);
}

// ============================================================================================
// THE SKY: an ember dusk that never finishes going
// ============================================================================================
export function bakeSkyUnburied(h = 180) {
  const stops = [[0, [24, 18, 34]], [0.4, [52, 32, 54]], [0.7, [104, 50, 58]], [0.88, [150, 74, 62]], [1, [178, 102, 72]]];
  const [c, g] = canvas(1, h);
  for (let y = 0; y < h; y++) { const q = Math.round(y / Math.max(1, h - 1) * 10) / 10;
    let i = 0; while (i < stops.length - 2 && q > stops[i + 1][0]) i++;
    const [t0, a] = stops[i], [t1, b] = stops[i + 1], k = Math.max(0, Math.min(1, (q - t0) / (t1 - t0)));
    g.fillStyle = 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ')'; g.fillRect(0, y, 1, 1); }
  return c;
}

// ============================================================================================
// FAR: the ridge, and the army that is still standing on it
// ============================================================================================
const FF = { back: '#3a2636', backRim: '#6e3a3e', front: '#2a1c28', frontRim: '#502c34', ghost: '198,210,220', fog: '176,150,164' };
/* one of the dead in the ranks: a head, a body, a spear up past him. Pale, and not quite there. */
function ghostMan(g, x, base, a, spear, rnd) {
  const c = rgba(FF.ghost, a); rect(g, x, base - 5, 1, 4, c); px(g, x, base - 6, rgba(FF.ghost, Math.min(1, a + 0.12)));
  px(g, x - 1, base - 4, rgba(FF.ghost, a * 0.7));
  if (spear) { const lean = rnd() < 0.5 ? 0 : 1; for (let k = 6; k < 12; k++) px(g, x + 1 + (k > 9 ? lean : 0), base - k, rgba(FF.ghost, a * 0.8)); px(g, x + 1 + lean, base - 12, rgba(FF.ghost, Math.min(1, a + 0.2))); }
}
function ghostStandard(g, x, base, a, v) {
  const c = rgba(FF.ghost, a); rect(g, x, base - 16, 1, 16, c);
  if (v) { for (let y = 0; y < 4; y++) for (let k = 1; k < 6 - (y === 3 ? (x % 3) : 0); k++) px(g, x + k, base - 15 + y, rgba(FF.ghost, a * (0.55 + 0.1 * ((k + y) & 1)))); }
  else { rect(g, x - 3, base - 15, 7, 1, c); for (let y = 0; y < 5; y++) for (let k = -2; k <= 2; k++) if (!(y === 4 && (k & 1))) px(g, x + k, base - 14 + y, rgba(FF.ghost, a * 0.6)); }
}
export function bakeFarUnburied(w = 320, h = 90, seed = 1) {
  const rnd = mulberry(seed * 7919 + 29), U = x => x / w * TAU, ph = Array.from({ length: 6 }, () => rnd() * TAU);
  const yB = x => Math.round(40 + 4 * Math.sin(U(x) * 2 + ph[0]) + 2 * Math.sin(U(x) * 5 + ph[1]));
  const yF = x => Math.round(56 + 3 * Math.sin(U(x) * 3 + ph[2]) + 1.5 * Math.sin(U(x) * 7 + ph[3]));
  const [c, g] = canvas(w, h);
  // 1. the ridge
  const [cb, gb] = canvas(w, h);
  for (let x = 0; x < w; x++) rect(gb, x, yB(x), 1, h - yB(x), FF.back);
  rimLight(cb, FF.backRim);
  g.drawImage(cb, 0, 0);
  // the army on it: ranks along the whole crest, thinner in places, a standard every so often
  for (let x = 0; x < w; x += 2) { const band = 0.5 + 0.5 * Math.sin(U(x) * 3 + ph[4]); if (band < 0.18 || hsh(x, 1, seed) < 0.22) continue;
    const a = 0.16 + band * 0.2; ghostMan(g, x + ((hsh(x, 2, seed) * 2) | 0), yB(x) + 1, a, hsh(x, 3, seed) < 0.55, rnd); }
  for (let i = 0; i < 9; i++) { const x = Math.round((i + 0.3 + rnd() * 0.4) * w / 9); ghostStandard(g, x, yB(x) + 1, 0.34, i & 1); }
  // mist in the valley between the ridge and the near ground
  for (let x = 0; x < w; x++) { const a = Math.max(0, Math.sin(U(x) * 3 + ph[5])); if (a < 0.15) continue;
    const lv = a > 0.7 ? 0.2 : a > 0.4 ? 0.13 : 0.07; g.fillStyle = rgba(FF.fog, lv); g.fillRect(x, yF(x) - 7, 1, 4); g.fillStyle = rgba(FF.fog, lv * 0.5); g.fillRect(x, yF(x) - 11, 1, 4); }
  // 2. the near ground: low barrows, a cross on some of them
  const [cf, gf] = canvas(w, h);
  for (let x = 0; x < w; x++) rect(gf, x, yF(x), 1, h - yF(x), FF.front);
  for (let i = 0; i < 11; i++) { const x = rnd() * w, rx = 4 + rnd() * 5; wrapDo(w, dx => { for (let k = -rx; k <= rx; k++) { const hh = Math.round(Math.sqrt(Math.max(0, 1 - (k / rx) ** 2)) * 2.4); rect(gf, Math.round(x + dx + k), yF(Math.round(x + k + w) % w) - hh, 1, hh + 1, FF.front); } });
    if (rnd() < 0.6) { const cx = Math.round(x), cb2 = yF(cx % w) - 2, lean = rnd() < 0.5 ? -1 : 1; wrapDo(w, dx => { line(gf, cx + dx, cb2, cx + dx + lean, cb2 - 5, FF.front); line(gf, cx + dx - 1, cb2 - 3, cx + dx + 2, cb2 - 4, FF.front); }); } }
  rimLight(cf, FF.frontRim);
  g.drawImage(cf, 0, 0);
  for (let x = 0; x < w; x++) for (const [y0, hh, amp, f] of [[yF(x) - 3, 4, 0.12, 2], [70, 3, 0.08, 3]]) {
    const a = 0.5 + 0.5 * Math.sin(U(x) * f + ph[1] + y0 * 0.1); if (a < 0.3) continue; g.fillStyle = rgba(FF.fog, amp * (a > 0.7 ? 1 : 0.55)); g.fillRect(x, y0, 1, hh); }
  return c;
}

// ============================================================================================
// MID: the wreck of the battle itself
// ============================================================================================
const MF = { back: '#2c1e2a', backRim: '#4c2a36', front: '#20161e', frontRim: '#3c2430', deep: '#140e14', fog: '160,138,152', cloth: '#3a1a1e' };
function trebuchet(g, x, b, colr, deep) {
  fillPoly(g, [[x - 14, b + 1], [x - 11, b + 1], [x - 1, b - 30], [x - 3, b - 30]], colr);
  fillPoly(g, [[x + 14, b + 1], [x + 11, b + 1], [x + 1, b - 30], [x + 3, b - 30]], colr);
  rect(g, x - 16, b - 3, 32, 3, colr); rect(g, x - 9, b - 16, 18, 2, colr);
  circle(g, x, b - 30, 2, colr);
  thick(g, x, b - 30, x - 26, b - 46, 3, colr);                      /* the long arm, up at the sky */
  thick(g, x, b - 30, x + 8, b - 22, 3, colr); rect(g, x + 5, b - 22, 9, 8, colr); px(g, x + 9, b - 18, deep);   /* the short end and its box */
  line(g, x - 26, b - 46, x - 24, b - 36, colr); line(g, x - 24, b - 36, x - 20, b - 34, colr);   /* the sling, hanging slack */
}
function fallenTower(g, x, b, colr, deep) {
  const P = (u, v) => [x + u * Math.cos(-0.5) - v * Math.sin(-0.5), b - (u * Math.sin(-0.5) + v * Math.cos(-0.5)) * -1];
  const pts = [[0, 0], [58, 0], [58, 16], [0, 16]].map(([u, v]) => [x + u * 0.87 - v * 0.48 * -1, b - (u * 0.48 + v * 0.87)]);
  fillPoly(g, pts, colr);
  for (let u = 6; u < 56; u += 7) { const a = [x + u * 0.87, b - u * 0.48], d = [x + u * 0.87 + 16 * 0.48, b - u * 0.48 - 16 * 0.87]; line(g, a[0], a[1], d[0], d[1], deep); }
  fillPoly(g, [[x + 50, b - 26], [x + 60, b - 32], [x + 64, b - 20], [x + 56, b - 16]], deep);   /* its top deck, torn open */
  void P;
}
function standard(g, x, b, ht, colr, cloth, v) {
  thick(g, x, b + 1, x + (v ? 2 : -1), b - ht, 2, colr);
  const tx = x + (v ? 2 : -1), ty = b - ht;
  rect(g, tx - 4, ty + 1, 9, 1, colr);
  for (let y = 0; y < 12; y++) { const tear = y > 7 ? ((y * 3 + x) % 4) : 0; for (let k = -3 + tear; k <= 3 - (y > 9 ? 2 : 0); k++) px(g, tx + k + Math.round(Math.sin(y * 0.5) * 1), ty + 2 + y, cloth); }
}
function crossOn(g, x, b, colr) { const lean = ((x * 7) % 3) - 1; line(g, x, b, x + lean, b - 9, colr); line(g, x, b, x + lean + 1, b - 9, colr); line(g, x - 3, b - 6, x + 4, b - 7, colr); }
function crow(g, x, y, colr) { rect(g, x, y - 2, 3, 2, colr); px(g, x + 3, y - 3, colr); px(g, x + 3, y - 2, colr); px(g, x + 4, y - 2, colr); px(g, x - 1, y - 1, colr); px(g, x + 1, y, colr); }
export function bakeMidUnburied(w = 480, h = 140, seed = 1) {
  const rnd = mulberry(seed * 104729 + 97), U = x => x / w * TAU, ph = Array.from({ length: 6 }, () => rnd() * TAU);
  const gyB = x => Math.round(h - 40 + 4 * Math.sin(U(x) * 3 + ph[0]) + 2 * Math.sin(U(x) * 7 + ph[1]));
  const gyF = x => Math.round(h - 24 + 2 * Math.sin(U(x) * 2 + ph[2]) + 1.5 * Math.sin(U(x) * 5 + ph[3]));
  const [c, g] = canvas(w, h), [cb, gb] = canvas(w, h), [cf, gf] = canvas(w, h);
  // the back row: barrows with their crosses, the trebuchet, a dead tree, standards
  for (let x = 0; x < w; x++) rect(gb, x, gyB(x), 1, h - gyB(x), MF.back);
  for (let i = 0; i < 7; i++) { const x = Math.round(rnd() * w), rx = 10 + rnd() * 10; wrapDo(w, dx => { for (let k = -rx; k <= rx; k++) { const hh = Math.round(Math.sqrt(Math.max(0, 1 - (k / rx) ** 2)) * 5); rect(gb, Math.round(x + dx + k), gyB(((Math.round(x + k) % w) + w) % w) - hh, 1, hh + 1, MF.back); }
    for (let k = -rx + 3; k < rx - 2; k += 6) crossOn(gb, Math.round(x + dx + k), gyB(((Math.round(x + k) % w) + w) % w) - 4, MF.back); }); }
  { const x = Math.round(w * 0.3); wrapDo(w, dx => trebuchet(gb, x + dx, gyB(x), MF.back, MF.deep)); }
  { const x = Math.round(w * 0.78); wrapDo(w, dx => { const r2 = mulberry(77); thick(gb, x + dx, gyB(x) + 1, x + dx + 2, gyB(x) - 14, 4, MF.back); gnarl(gb, x + dx + 2, gyB(x) - 14, -Math.PI / 2 - 0.3, 14, 3, 3, MF.back, r2); gnarl(gb, x + dx + 2, gyB(x) - 10, -Math.PI / 2 + 0.9, 12, 2, 2, MF.back, r2); }); }
  for (const [fx, ht, v] of [[0.12, 34, 0], [0.55, 30, 1], [0.9, 38, 0]]) { const x = Math.round(w * fx); wrapDo(w, dx => standard(gb, x + dx, gyB(x), ht, MF.back, MF.back, v)); }
  rimLight(cb, MF.backRim);
  g.drawImage(cb, 0, 0);
  for (let y = 0; y < 14; y++) { g.fillStyle = rgba(MF.fog, 0.05 + y * 0.004); for (let x = 0; x < w; x++) if (hsh(x >> 2, y >> 1, 5) < 0.7) g.fillRect(x, gyB(x) + y - 4, 1, 1); }
  // the front row: the siege tower gone over, pikes left standing, a torn standard, crows
  for (let x = 0; x < w; x++) rect(gf, x, gyF(x), 1, h - gyF(x), MF.front);
  { const x = Math.round(w * 0.42); wrapDo(w, dx => fallenTower(gf, x + dx, gyF(x) + 1, MF.front, MF.deep)); }
  for (let i = 0; i < 26; i++) { const x = Math.round(rnd() * w), ln = 14 + rnd() * 18, a = -Math.PI / 2 + (rnd() - 0.5) * 0.9; wrapDo(w, dx => { const b = gyF(x) + 1; line(gf, x + dx, b, x + dx + Math.cos(a) * ln, b + Math.sin(a) * ln, MF.front); }); }
  for (const [fx, ht, v] of [[0.2, 44, 1], [0.68, 40, 0]]) { const x = Math.round(w * fx); wrapDo(w, dx => standard(gf, x + dx, gyF(x), ht, MF.front, MF.cloth, v)); }
  for (const fx of [0.06, 0.33, 0.61, 0.86]) { const x = Math.round(w * fx); wrapDo(w, dx => { crossOn(gf, x + dx, gyF(x), MF.front); crossOn(gf, x + dx + 9, gyF(x + 9), MF.front); }); }
  { const x = Math.round(w * 0.2); wrapDo(w, dx => { crow(gf, x + dx + 1, gyF(x) - 45, MF.front); }); }
  { const x = Math.round(w * 0.5); wrapDo(w, dx => { crow(gf, x + dx, gyF(x) - 9, MF.front); crow(gf, x + dx + 7, gyF(x) - 8, MF.front); }); }
  rimLight(cf, MF.frontRim);
  g.drawImage(cf, 0, 0);
  // the fog band along the bottom
  for (let y = h - 26; y < h; y++) { const t = (y - (h - 26)) / 26;
    for (let x = 0; x < w; x += 2) { const a = (0.05 + t * 0.2) * (0.65 + 0.35 * Math.sin(U(x) * 4 + y * 0.35 + ph[4])); g.fillStyle = rgba(MF.fog, a); g.fillRect(x, y, 2, 1); } }
  return c;
}

// ============================================================================================
// NEAR: what was left standing in the ground, close enough to see the rags on it
// ============================================================================================
const NF = { body: '#1a1218', lit: '#261a22', rim: '#34222c', cloth: '#2a1216', clothL: '#3a1a1e', iron: '#2c2a30', grass: '#1c1418' };
export function bakeNearUnburied(w = 640, h = 300, seed = 1) {
  const rnd = mulberry(seed * 15485863 + 11), [c, g] = canvas(w, h), base = h - 1;
  const pw = (x, y, cc) => px(g, ((Math.round(x) % w) + w) % w, Math.round(y), cc);
  // pikes and lances, driven in and left: long thin shafts at every angle, a few with a torn pennant still on them
  for (let i = 0; i < 9; i++) {
    const x = (i + 0.2 + rnd() * 0.6) * w / 9, ln = 110 + rnd() * 120, a = -Math.PI / 2 + (rnd() - 0.5) * 0.7, th = rnd() < 0.4 ? 3 : 2;
    const ex = x + Math.cos(a) * ln, ey = base + Math.sin(a) * ln;
    for (let t = 0; t <= ln; t++) { const X = x + Math.cos(a) * t, Y = base + Math.sin(a) * t; for (let k = 0; k < th; k++) pw(X + k, Y, k === 0 ? NF.lit : NF.body); }
    if (rnd() < 0.5) { for (let k = 0; k < 7; k++) { pw(ex + Math.cos(a) * k, ey + Math.sin(a) * k, NF.iron); pw(ex + Math.cos(a) * k + 1, ey + Math.sin(a) * k, NF.iron); } }   /* its head, the only metal the crows did not take */
    else { const sn = 6 + rnd() * 8; for (let k = 0; k < sn; k++) pw(ex + k * 0.8, ey + k * 0.9, NF.body); }                                                  /* snapped, the rest of it down in the grass */
    if (rnd() < 0.55) { const at = 0.72 + rnd() * 0.18, px0 = x + Math.cos(a) * ln * at, py0 = base + Math.sin(a) * ln * at, dir = rnd() < 0.5 ? 1 : -1;
      for (let y = 0; y < 22; y++) { const tear = y > 12 ? Math.round(hsh(i, y, seed) * 5) : 0; for (let k = 1; k < 13 - tear - (y >> 2); k++) pw(px0 + dir * k + Math.sin(y * 0.4 + k * 0.2) * 1.5, py0 + y, (k + y) % 5 === 0 ? NF.clothL : NF.cloth); } }
  }
  // a broken cart wheel leaning on nothing, and a helm on a stake
  { const cx = w * 0.64, cy = base - 22, r = 20; for (let k = 0; k < 64; k++) { const t = k / 64 * TAU; if (t > 4.3 && t < 5.1) continue; pw(cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.9, NF.body); pw(cx + Math.cos(t) * (r - 1), cy + Math.sin(t) * (r - 1) * 0.9, NF.body); pw(cx + Math.cos(t) * (r - 2), cy + Math.sin(t) * (r - 2) * 0.9, NF.lit); }
    for (let s = 0; s < 8; s++) { if (s === 5) continue; const t = s / 8 * TAU + 0.2; for (let k = 3; k < r - 1; k++) pw(cx + Math.cos(t) * k, cy + Math.sin(t) * k * 0.9, NF.body); } }
  { const x = w * 0.28; for (let y = base - 46; y <= base; y++) { pw(x, y, NF.body); pw(x + 1, y, NF.lit); } for (let y = 0; y < 9; y++) for (let k = -5; k <= 5; k++) if (k * k + (y - 6) * (y - 6) * 0.9 < 30 && !(y > 5 && Math.abs(k) < 2)) pw(x + k, base - 54 + y, y < 2 ? NF.rim : NF.body); }
  // dead grass along the bottom
  rect(g, 0, h - 5, w, 5, NF.grass);
  for (let x = 0; x < w; x += 2) { if (hsh(x, 1, seed) < 0.2) continue; const sh = 6 + hsh(x, 2, seed) * 16, lean = (hsh(x, 3, seed) - 0.5) * 0.6;
    for (let j = 0; j < sh; j++) pw(x + j * lean, base - j, NF.grass); }
  rimLight(c, NF.rim);
  return c;
}
/* OVERHEAD: nothing on this field has leaves. A dead limb over the lens, or open sky. */
export function bakeNearLimbs(seed, col, dark) {
  const rnd = mulberry(seed), [c, g] = canvas(256, 42);
  let x = -20;
  while (x < 276) {
    if (rnd() < 0.45) { x += 40 + ((rnd() * 50) | 0); continue; }
    const len = 40 + rnd() * 40;
    g.fillStyle = dark; g.fillRect(x, 0, len | 0, 3);
    const r2 = mulberry((rnd() * 1e6) | 0);
    for (let k = 0; k < 3; k++) gnarl(g, x + 6 + k * len / 3, 2, Math.PI / 2 + (r2() - 0.5) * 1.4, 10 + r2() * 12, 2, 2, k & 1 ? col : dark, r2);
    x += len + 12 + ((rnd() * 30) | 0);
  }
  return c;
}
/* THE STRIP ALONG THE BOTTOM, behind the actors at 0.3: dead grass, a snapped shaft now and then */
export function bakeFGUnburied(w, h, seed = 4) {
  const rnd = mulberry(seed * 31 + 7), [c, g] = canvas(w, h), D = '#241a16', M = '#3a2e22';
  for (let i = 0; i < w / 5; i++) { const x = (rnd() * w) | 0, hh = 4 + ((rnd() * 9) | 0); line(g, x, h, x + (rnd() < 0.5 ? -2 : 2), h - hh, rnd() < 0.5 ? D : M, 1); }
  for (let i = 0; i < w / 70; i++) { const x = rnd() * w, ln = 18 + rnd() * 16, a = -Math.PI / 2 + (rnd() - 0.5) * 1.1; line(g, x, h + 1, x + Math.cos(a) * ln, h + Math.sin(a) * ln, D, 2); }
  return c;
}

// ============================================================================================
// THE THINGS LEFT ON THE FIELD (deco: bottom row = ground)
// ============================================================================================
const WD = ['#2a2224', '#43373a', '#5e4f4a', '#7c6a5c', '#9c8a74'];     /* weathered wood (the fields' own ramp) */
const IR = ['#1c1c24', '#30303a', '#4a4a56', '#6c6c78', '#9494a0'];     /* iron */
const RU = ['#4a2a1e', '#74402a', '#9a5a36'];                          /* rust */
const CL = ['#3a1418', '#5e1e20', '#86302a', '#a84a38'];               /* the army's red, gone brown */
const BN = ['#8a826c', '#b8ae94', '#d8d0b8'];                          /* bone */
const SN = ['#2c2e36', '#44474f', '#5e626c', '#7e838c', '#a2a7ae'];     /* stone */
function shaft(g, x0, y0, x1, y1) { line(g, x0, y0, x1, y1, WD[3]); line(g, x0 + 1, y0, x1 + 1, y1, WD[1]); }
export function brokenSpears(v = 0) {
  const [c, g] = canvas(22, 26), b = 25;
  const sets = [[[4, 3, 0], [11, 0, 1], [17, 7, 0]], [[6, 1, 1], [14, 5, 0]], [[3, 9, 1], [9, 2, 0], [15, 4, 1], [19, 10, 0]]][v % 3];
  for (const [x, top, snapped] of sets) { const lean = (x - 11) * 0.25;
    shaft(g, x, b, x + lean, top + 2);
    if (snapped) { px(g, x + lean, top + 1, WD[4]); px(g, x + lean + 1, top, WD[2]); }
    else { fillPoly(g, [[x + lean - 1, top + 3], [x + lean + 2, top + 3], [x + lean + 0.5, top - 3]], IR[3]); px(g, x + lean, top, IR[4]); px(g, x + lean + 1, top + 2, IR[1]); } }
  rect(g, 1, b, 20, 1, '#3c3226');
  return outline(c, OUT);
}
export function stuckShield(v = 0) {
  const [c, g] = canvas(16, 14), b = 13;
  if (v % 2 === 0) {   /* a kite shield, point down in the earth, leaning */
    fillPoly(g, [[3, 1], [12, 2], [11, 8], [8, 13], [5, 12], [3, 7]], CL[1]);
    fillPoly(g, [[4, 2], [11, 3], [10, 7], [7, 11], [5, 10], [4, 6]], CL[2]);
    line(g, 7, 2, 7, 11, '#c9a24a'); line(g, 4, 5, 11, 5, '#c9a24a');
    px(g, 5, 3, CL[3]); px(g, 10, 9, CL[0]);
  } else {             /* a round one, fallen on its face against a stone */
    fillPoly(g, [[1, 13], [3, 7], [8, 5], [13, 7], [15, 13]], IR[2]);
    line(g, 3, 8, 13, 8, IR[3]); px(g, 8, 6, IR[4]); circle(g, 8, 10, 1.5, IR[1]);
    px(g, 5, 11, RU[1]); px(g, 12, 10, RU[2]);
  }
  rect(g, 1, b, 14, 1, '#3c3226');
  return outline(c, OUT);
}
export function fallenBanner() {
  const [c, g] = canvas(34, 12), b = 11;
  line(g, 1, b - 1, 32, b - 4, WD[3]); line(g, 1, b, 32, b - 3, WD[1]);
  fillPoly(g, [[30, b - 6], [33, b - 5], [32, b - 2]], '#c9a24a');                       /* the finial */
  fillPoly(g, [[20, b - 4], [29, b - 5], [30, b], [26, b + 1], [23, b - 1], [19, b + 1]], CL[1]);
  fillPoly(g, [[21, b - 4], [28, b - 5], [28, b - 2], [23, b - 2]], CL[2]);
  px(g, 25, b - 4, '#c9a24a'); px(g, 24, b - 3, '#c9a24a');
  for (let x = 4; x < 18; x += 3) px(g, x, b, '#3c3226');
  return outline(c, OUT);
}
export function crookedCross(v = 0) {
  const [c, g] = canvas(13, 20), b = 19, sh = y => Math.round((b - y) * (v ? -0.18 : 0.14));
  for (let y = 2; y <= b; y++) { px(g, 6 + sh(y), y, WD[3]); px(g, 7 + sh(y), y, WD[1]); }
  for (let x = 2; x <= 10; x++) { const y = 6 + Math.round((x - 2) * (v ? -0.1 : 0.14)); px(g, x + sh(y), y, WD[3]); px(g, x + sh(y), y + 1, WD[1]); }
  if (v) { const hx = 6 + sh(3); fillPoly(g, [[hx - 3, 5], [hx - 2, 1], [hx + 3, 1], [hx + 4, 5]], IR[2]); line(g, hx - 2, 3, hx + 3, 3, IR[0]); px(g, hx - 1, 1, IR[4]); }   /* a helm hung on it: somebody knew whose */
  else { px(g, 3 + sh(8), 9, '#6a5a7a'); px(g, 3 + sh(8), 10, '#5a4c6a'); }                                                                                        /* a rag tied on */
  for (let x = 1; x <= 11; x++) { const hh = Math.round(Math.sin((x - 0.5) / 11 * Math.PI) * 2); for (let y = b - hh; y <= b; y++) px(g, x, y, y === b - hh ? '#5e4a36' : '#44362a'); }
  return outline(c, OUT);
}
export function siegeWreck() {
  const [c, g] = canvas(50, 30), b = 29;
  thick(g, 2, b, 30, b - 20, 3, WD[2]); line(g, 2, b - 2, 30, b - 22, WD[4]);            /* the throwing arm, snapped and down */
  fillPoly(g, [[28, b - 24], [33, b - 20], [31, b - 17], [27, b - 21]], WD[1]);
  rect(g, 18, b - 4, 26, 4, WD[2]); rect(g, 18, b - 4, 26, 1, WD[3]);                     /* the base beam */
  thick(g, 22, b - 3, 30, b - 14, 2, WD[3]); thick(g, 40, b - 3, 34, b - 12, 2, WD[1]);   /* the A-frame, one leg gone */
  { const cx = 40, cy = b - 8, r = 7; for (let k = 0; k < 40; k++) { const t = k / 40 * TAU; if (t > 3.6 && t < 4.4) continue; px(g, cx + Math.cos(t) * r, cy + Math.sin(t) * r, k < 20 ? WD[3] : WD[1]); }
    for (let s = 0; s < 6; s++) { if (s === 4) continue; const t = s / 6 * TAU + 0.3; line(g, cx, cy, cx + Math.cos(t) * (r - 1), cy + Math.sin(t) * (r - 1), WD[2]); } rect(g, cx - 1, cy - 1, 2, 2, IR[2]); }
  rect(g, 6, b - 5, 8, 5, WD[1]); rect(g, 6, b - 5, 8, 1, WD[3]); px(g, 9, b - 3, IR[2]); px(g, 12, b - 2, IR[3]);   /* the counterweight box, split */
  for (const [x, y] of [[15, b], [46, b], [3, b]]) px(g, x, y, SN[3]);
  return outline(c, OUT);
}
export function brokenPillar(v = 0) {
  const [c, g] = canvas(14, 34), b = 33, top = v ? 12 : 4;
  for (let y = top; y <= b; y++) for (let x = 3; x <= 10; x++) { const f = (x - 3) % 3; px(g, x, y, x === 3 ? SN[4] : x === 10 ? SN[1] : f === 0 ? SN[2] : f === 1 ? SN[3] : SN[2]); }
  for (let x = 3; x <= 10; x++) { const bite = Math.round(Math.abs(Math.sin(x * 1.9 + v)) * 4); for (let y = top; y < top + bite; y++) g.clearRect(x, y, 1, 1); }   /* broken off, not cut */
  rect(g, 1, b - 3, 12, 4, SN[2]); rect(g, 1, b - 3, 12, 1, SN[3]); rect(g, 12, b - 2, 1, 3, SN[1]);
  if (!v) { rect(g, 2, top + 12, 10, 2, SN[3]); rect(g, 2, top + 13, 10, 1, SN[1]); }
  px(g, 5, b - 10, '#3e4a36'); px(g, 6, b - 9, '#3e4a36'); px(g, 8, b - 6, '#3e4a36');
  return outline(c, OUT);
}
export function oldStandard() {
  const [c, g] = canvas(16, 46), b = 45;
  for (let y = 3; y <= b; y++) { px(g, 4, y, WD[3]); px(g, 5, y, WD[1]); }
  rect(g, 1, 4, 9, 1, WD[3]); fillPoly(g, [[3, 3], [7, 3], [5, 0]], '#c9a24a');
  for (let y = 5; y < 26; y++) { const tear = y > 18 ? Math.round(hsh(y, 3, 1) * 4) : 0; for (let x = 5; x < 15 - tear; x++) px(g, x + (y > 12 && (x & 1) ? 0 : 0), y, (x + y) % 6 === 0 ? CL[0] : x < 7 ? CL[2] : CL[1]); }
  for (let y = 9; y < 15; y++) px(g, 10, y, '#c9a24a'); for (let x = 8; x < 13; x++) px(g, x, 11, '#c9a24a');   /* the order's cross, still on it */
  for (let x = 1; x <= 8; x++) px(g, x, b, '#3c3226');
  return outline(c, OUT);
}

// ============================================================================================
// THE GROUND: the dead are IN it, not only on it
// ============================================================================================
/* paints one of the field's bones into a share of the given dirt tiles (canvases, changed in place) - a rib cage, a skull,
   a long bone, a dented helm - so the earth under every trench and mound reads as a burial ground and not a garden */
export function boneSoil(tiles, seed = 5, share = 0.4) {
  const rnd = mulberry(seed * 131 + 3);
  tiles.forEach((c, i) => {
    if (rnd() > share) return; const g = c.getContext('2d'), k = (rnd() * 4) | 0, x = 2 + ((rnd() * 8) | 0), y = 3 + ((rnd() * 8) | 0);
    if (k === 0) { for (let r = 0; r < 3; r++) { px(g, x, y + r * 2, BN[1]); px(g, x + 1, y + r * 2 + 1, BN[0]); px(g, x + 2, y + r * 2 + 1, BN[0]); px(g, x + 3, y + r * 2, BN[1]); } px(g, x + 1, y, BN[2]); }   /* ribs */
    else if (k === 1) { rect(g, x, y, 4, 3, BN[1]); px(g, x, y, BN[2]); px(g, x + 1, y + 1, '#2a2020'); px(g, x + 3, y + 1, '#2a2020'); rect(g, x + 1, y + 3, 2, 1, BN[0]); }                        /* a skull */
    else if (k === 2) { rect(g, x, y, 6, 1, BN[1]); px(g, x - 1, y - 1, BN[2]); px(g, x - 1, y + 1, BN[0]); px(g, x + 6, y - 1, BN[2]); px(g, x + 6, y + 1, BN[0]); }                              /* a long bone */
    else { rect(g, x, y + 1, 5, 2, IR[2]); rect(g, x + 1, y, 3, 1, IR[3]); px(g, x + 2, y + 2, IR[0]); px(g, x + 4, y + 1, RU[1]); }                                                              /* a helm, dented */
    void i;
  });
}
