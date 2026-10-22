// kingswood_props.js - THE KING'S HUNTING WOOD's props and machines, painted (claude/kingswood2art, Sonnet art pass). Art only: nothing here is a tile, an entity, a hitbox or a number.
//   THE ROYAL ROPE   a BOUGH (a bark limb that reaches in out of the canopy, leaves at its end) over EVERY pulley, the iron-bound PULLEY hung from it, the rope (a sagging line, light over dark),
//                    the PEG (a carved stake with an iron collar, the rope turned round it, the court's pennant on a mast; a gold target frame pulses round it while it holds: HIT THIS)
//   THE LOADS        the CAGE (iron hoops and bars, a gold-crowned roof plate, a ring; landed: dented, the door sprung, straw spilled), the LOG TRAP (bark-on log, iron bands with spikes, rope lashings
//                    and cut ends with rings; rolls - its bark turns), the LOG SPAN (a bundle of lashed logs, then a lashed plank bridge), the SPLIT LOG (two halves tumbling, chips)
//   THE PROCESSION   the BANNER BEARER's standard (a tall crimson standard with the court's crown, tasselled, swaying), the DRUMMER's drum and sticks (a ring goes out on every beat), the court's SIDE GATE
//                    (timber posts and lintel, two leaves that swing open when the court marches and shut behind it)
//   DECO             the court's banners (standing and hung), pennants, the hung cages, the toll post (src/redraw/kingswood_props.js decoOf feeds main.js's deco kinds)
// Every static picture is baked ONCE; a frame is a handful of drawImage calls and fills.
import { canvas, rect } from '../px.js';
import { hash } from './kingswood_tiles.js';

const R = Math.round, TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const f = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };

export const CREST = { red: '#a83a2a', redD: '#6a1e18', redL: '#d9583c', gold: '#e0b040', goldL: '#fff0a8', goldD: '#8a6a20', iron: '#4a4a54', ironL: '#9a9aa6', ironD: '#1e1e26', rope: '#c9a060', ropeD: '#6a4a24', wood: '#6a4424', woodL: '#a8723a', woodD: '#3a2412' };

/* a sagging rope: a dark line, a light line over it */
export function ropeLine(g, x0, y0, x1, y1, sag = 2) {
  const n = 6; let px0 = x0, py0 = y0;
  for (let i = 1; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag;
    g.strokeStyle = CREST.ropeD; g.lineWidth = 1; g.beginPath(); g.moveTo(px0 + 0.5, py0 + 1.5); g.lineTo(x + 0.5, y + 1.5); g.stroke();
    g.strokeStyle = CREST.rope; g.beginPath(); g.moveTo(px0 + 0.5, py0 + 0.5); g.lineTo(x + 0.5, y + 0.5); g.stroke(); px0 = x; py0 = y; }
}
const ropeStraight = (g, x0, y0, x1, y1) => { g.strokeStyle = CREST.ropeD; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + 1.5, y0); g.lineTo(x1 + 1.5, y1); g.stroke(); g.strokeStyle = CREST.rope; g.beginPath(); g.moveTo(x0 + 0.5, y0); g.lineTo(x1 + 0.5, y1); g.stroke(); };

/* ============================== THE BOUGH over every pulley ============================== */
const LEAF = ['#7a2a1a', '#a83a2a', '#c9463d', '#e07a30', '#f0a040'];
function leafClump(g, cx, cy, r, seed) {
  for (let i = 0; i < r * 3; i++) { const h = hash(seed, i), a = (h % 628) / 100, d = ((h >> 8) % 100) / 100 * r, x = cx + Math.cos(a) * d * 1.2, y = cy + Math.sin(a) * d * 0.7;
    f(g, LEAF[(h >> 16) % 3 + (y < cy - r * 0.2 ? 1 : 0)], x - 2, y - 1, 4, 3); }
  for (let i = 0; i < r; i++) { const h = hash(seed + 7, i); f(g, '#f6c060', cx + ((h % 100) / 100 - 0.5) * r * 2, cy - r * 0.4 + ((h >> 7) % 100) / 100 * r * 0.5, 2, 1); }
}
/* the limb: from a leaf mass up and to the side, bent down to the pulley and out past it, a short twig. py = the pulley's screen y, side = which way the leaves are */
export function drawBough(g, pxx, py, side, seed, time) {
  const rise = Math.min(py + 8, 70 + (seed % 3) * 12), run = side * (26 + (seed % 4) * 8);
  const topX = pxx + run, topY = py - rise;
  /* the slanting limb (thick at the top, thinning at the pulley): a stack of 2 px rows */
  for (let y = 0; y <= rise; y += 2) { const t = y / rise, x = pxx + run * (1 - t) * (1 - t * 0.15), w = 9 - t * 4;
    f(g, '#3a1c12', x - w / 2 - 1, py - rise + y, w + 2, 2); f(g, '#74382a', x - w / 2, py - rise + y, w, 2); f(g, '#c07644', x - w / 2, py - rise + y, 2, 2); if (y % 8 === 0) f(g, '#52241e', x + 1, py - rise + y, 2, 2); }
  /* the arm the pulley hangs under: a short horizontal beam of bark, a stub and a twig beyond */
  f(g, '#3a1c12', pxx - side * 18 - (side > 0 ? 0 : 18) + (side > 0 ? 0 : 0), py - 6, 36, 1);
  f(g, '#74382a', pxx - 18, py - 5, 36, 4); f(g, '#c07644', pxx - 18, py - 5, 36, 1); f(g, '#3a1c12', pxx - 18, py - 1, 36, 1); f(g, '#52241e', pxx - 8, py - 3, 3, 1); f(g, '#52241e', pxx + 9, py - 4, 2, 1);
  f(g, '#3a1c12', pxx - side * 18, py - 8, 3, 3); f(g, '#74382a', pxx - side * 18, py - 8, 2, 2); /* a broken twig */
  px(g, pxx - side * 20, py - 9, '#e07a30'); px(g, pxx - side * 21, py - 8, '#c9463d');
  /* the leaves at its end, stirring a little */
  const sw = Math.sin(time * 1.1 + seed) * 1; leafClump(g, topX + sw, topY, 16, seed);
  /* iron strap the pulley hangs from */
  f(g, '#1e1e26', pxx - 2, py - 1, 4, 4); f(g, '#9a9aa6', pxx - 2, py - 1, 4, 1);
}
/* THE PULLEY: an iron block on its strap, the sheave with spokes, a gold boss; the rope runs over it */
export function drawPulley(g, x, y, time) {
  f(g, '#1e1e26', x - 5, y + 2, 10, 9); f(g, '#4a4a54', x - 4, y + 3, 8, 7); f(g, '#9a9aa6', x - 4, y + 3, 8, 1);
  f(g, '#0e0e14', x - 3, y + 4, 6, 5); f(g, '#c9a060', x - 1, y + 4, 2, 5); f(g, '#c9a060', x - 3, y + 6, 6, 1);
  f(g, '#e0b040', x - 1, y + 6, 2, 1); f(g, '#9a9aa6', x - 5, y + 2, 1, 9);
}

/* ============================== THE PEG: the court's tie-off ============================== */
export function drawPeg(g, x, y, up, glint, time) {
  const W = CREST;
  /* the stake: carved post, an iron collar, a rounded cap with a gold ball */
  f(g, '#1e1208', x - 4, y - 21, 8, 21); f(g, W.wood, x - 3, y - 21, 6, 21); f(g, W.woodL, x - 3, y - 21, 2, 21); f(g, W.woodD, x + 1, y - 21, 2, 21);
  f(g, W.iron, x - 4, y - 17, 8, 3); f(g, W.ironL, x - 4, y - 17, 8, 1); f(g, W.ironD, x - 4, y - 15, 8, 1);
  f(g, W.iron, x - 4, y - 4, 8, 2); f(g, W.ironL, x - 4, y - 4, 8, 1);
  f(g, W.woodD, x - 3, y - 23, 6, 2); f(g, W.woodL, x - 2, y - 24, 4, 1); f(g, W.gold, x - 1, y - 26, 2, 3); f(g, W.goldL, x - 1, y - 26, 1, 1);
  /* the court's pennant on its mast */
  f(g, W.woodD, x, y - 40, 1, 14); const fl = Math.sin(time * 5 + x) > 0 ? 1 : 0;
  f(g, W.redD, x + 1, y - 39, 9 + fl, 6); f(g, W.red, x + 1, y - 39, 9 + fl, 4); f(g, W.gold, x + 1, y - 39, 9 + fl, 1); f(g, W.gold, x + 3, y - 36, 3, 1);
  f(g, '#0e0808', x + 8 + fl, y - 37, 2, 2);   /* the swallow-tail */
  if (up) {   /* the rope turned round it three times, a knot */
    for (const dy of [-14, -12, -10]) { f(g, W.ropeD, x - 4, dy + y + 1, 8, 1); f(g, W.rope, x - 4, dy + y, 8, 1); }
    f(g, W.rope, x - 5, y - 9, 2, 3); f(g, W.ropeD, x - 5, y - 7, 2, 1); f(g, W.rope, x + 3, y - 15, 2, 2);
  } else {    /* cut: the rope's end lies frayed at its foot, a coil on the ground */
    f(g, W.rope, x - 7, y - 2, 6, 2); f(g, W.ropeD, x - 7, y, 6, 1); f(g, W.rope, x + 4, y - 3, 4, 3); f(g, W.ropeD, x + 4, y, 4, 1); px(g, x - 8, y - 3, W.rope); px(g, x - 9, y - 2, W.rope); }
  if (glint) {   /* HIT THIS: a gold target frame round the post, breathing */
    const k = 0.5 + 0.5 * Math.sin(time * 4), a = 0.55 + 0.4 * k, o = 1 + Math.round(k * 2); g.globalAlpha = a;
    const x0 = x - 9 - o, x1 = x + 9 + o, y0 = y - 26 - o, y1 = y + 1 + o;
    for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { f(g, CREST.goldL, cx, cy, 1 + sx * 4 > 0 ? 5 : -5, 1); g.fillStyle = CREST.goldL; g.fillRect(sx > 0 ? cx : cx - 4, cy, 5, 1); g.fillRect(cx, sy > 0 ? cy : cy - 4, 1, 5); }
    g.globalAlpha = 1;
    if (Math.floor(time * 3) % 2) { f(g, '#fff6c8', x - 1, y - 30, 2, 2); px(g, x - 5, y - 19, '#fff6c8'); px(g, x + 4, y - 16, '#fff6c8'); } }
}

/* ============================== THE LOADS ============================== */
/* THE CAGE: 32 x 32, its foot on the bottom row; a ring on the roof. down = landed (dented, the door sprung, straw spilled) */
export function cageSprite(down) {
  return once('cage' + (down ? 'd' : 'u'), () => { const [c, g] = canvas(40, 38), W = CREST, ox = 4, oy = 4;
    const I = down ? ['#3a3438', '#5a5258', '#2a2428'] : [W.iron, W.ironL, W.ironD];
    /* inside: dark, a little straw and a bone */
    f(g, 'rgba(14,8,6,0.78)', ox + 2, oy + 6, 28, 22);
    f(g, '#a88a4a', ox + 5, oy + 25, 8, 2); f(g, '#c9aa5a', ox + 7, oy + 24, 5, 1); f(g, '#cdb88a', ox + 17, oy + 25, 6, 2); f(g, '#e8dcc0', ox + 18, oy + 24, 2, 1); f(g, '#e8dcc0', ox + 21, oy + 24, 2, 1);
    /* the roof plate: a low dome, the court's crown on it */
    f(g, I[2], ox, oy + 3, 32, 5); f(g, I[0], ox + 1, oy + 2, 30, 5); f(g, I[1], ox + 3, oy + 1, 26, 2); f(g, I[1], ox + 1, oy + 3, 30, 1);
    f(g, W.gold, ox + 12, oy + 4, 8, 2); f(g, W.goldL, ox + 12, oy + 4, 8, 1); f(g, W.gold, ox + 12, oy + 3, 2, 1); f(g, W.gold, ox + 15, oy + 2, 2, 2); f(g, W.gold, ox + 18, oy + 3, 2, 1);
    /* the ring and the chain link on top */
    f(g, I[2], ox + 13, oy - 4, 6, 6); f(g, I[0], ox + 14, oy - 3, 4, 4); f(g, 'rgba(0,0,0,0)', ox + 15, oy - 2, 2, 2); g.clearRect(ox + 15, oy - 2, 2, 2); f(g, I[1], ox + 13, oy - 4, 6, 1);
    /* bars: iron, a light left edge, every 4 px; the door (front-left) is picked out by a frame and a lock */
    for (let k = 0; k <= 7; k++) { const bx = ox + 1 + k * 4 + (k === 7 ? -1 : 0), dent = down && (k === 2 || k === 5) ? (k === 2 ? 1 : -1) : 0;
      f(g, I[2], bx + dent, oy + 7, 3, 22); f(g, I[0], bx + dent, oy + 7, 2, 22); f(g, I[1], bx + dent, oy + 7, 1, 22); }
    for (const hy of [8, 17, 26]) { f(g, I[2], ox, oy + hy, 32, 3); f(g, I[0], ox, oy + hy, 32, 2); f(g, I[1], ox, oy + hy, 32, 1); for (const rx of [2, 10, 20, 28]) px(g, ox + rx, oy + hy + 1, I[1]); }
    f(g, I[2], ox, oy + 28, 32, 4); f(g, I[0], ox + 1, oy + 29, 30, 2); f(g, I[1], ox, oy + 28, 32, 1);   /* the floor plate */
    for (const rx of [3, 11, 19, 27]) px(g, ox + rx, oy + 30, '#c0c0c8');
    if (down) { f(g, '#3a2412', ox + 20, oy + 9, 1, 18); f(g, W.gold, ox + 10, oy + 14, 0, 0); f(g, '#0a0608', ox + 13, oy + 10, 6, 16);   /* the door sprung wide: a dark gap */
      f(g, I[0], ox + 11, oy + 10, 2, 16); f(g, '#5a2a18', ox + 9, oy + 20, 3, 2); f(g, '#7a3a1a', ox + 24, oy + 14, 2, 3); }
    else { f(g, W.goldD, ox + 13, oy + 18, 6, 6); f(g, W.gold, ox + 13, oy + 18, 6, 1); f(g, W.gold, ox + 13, oy + 18, 1, 6); f(g, '#0e0808', ox + 15, oy + 20, 2, 3); }   /* a padlock */
    /* rust streaks */
    for (const [rx, ry, rl] of [[ox + 5, oy + 10, 6], [ox + 17, oy + 9, 8], [ox + 26, oy + 18, 5]]) f(g, '#7a3a1a', rx, ry, 1, rl);
    return c; });
}
/* the cage on its rope: ring at (x, top), body hung below it */
export function drawCage(g, x, b, down, time, swing = 0) {
  const c = cageSprite(!!down), sw = down ? 0 : Math.round(Math.sin(time * 1.3 + x) * swing);
  g.drawImage(c, R(x - 20 + sw), R(b - 36));
  if (down) { f(g, '#a88a4a', x - 18, b - 3, 5, 3); f(g, '#c9aa5a', x - 16, b - 4, 3, 1); f(g, '#a88a4a', x + 14, b - 2, 4, 2); }   /* straw spilled out */
}
/* THE LOG TRAP: w wide, 14 high, bark-on, iron bands with spikes, lashings at both ends, cut ends with rings. turn = bark phase while it rolls */
export function drawLog(g, cx, b, w, time, rolling, turn = 0) {
  const x0 = Math.round(cx - w / 2), H = 14, y0 = b - H;
  f(g, '#1a0e08', x0, y0 + 1, w, H - 1);
  f(g, '#5c3a1d', x0 + 1, y0 + 2, w - 2, H - 4);
  /* bark: ridges run along its length; rolling turns them (they slide over its belly) */
  const ph = Math.floor(turn) % 6;
  for (let r = 0; r < 4; r++) { const ry = y0 + 2 + ((r * 3 + ph) % (H - 4)); f(g, r % 2 ? '#3e2610' : '#8a5a32', x0 + 2, ry, w - 4, 1); }
  f(g, '#a8723a', x0 + 1, y0 + 2, w - 2, 2); f(g, '#3a2412', x0 + 1, b - 3, w - 2, 2);
  for (let k = 7; k < w - 7; k += 9) { const sh = (hash(k, 3) % 4); f(g, '#2e1a0c', x0 + k, y0 + 3 + sh, 3, 1); }
  /* iron bands with spikes, top and bottom */
  for (const bx of [R(w * 0.3), R(w * 0.7)]) { f(g, '#1e1e26', x0 + bx - 1, y0, 5, H); f(g, '#4a4a54', x0 + bx, y0, 3, H); f(g, '#9a9aa6', x0 + bx, y0, 1, H);
    f(g, '#c0c0c8', x0 + bx + 1, y0 - 3, 1, 3); f(g, '#9a9aa6', x0 + bx, y0 - 1, 3, 1); f(g, '#c0c0c8', x0 + bx + 1, b, 1, 2); }
  /* lashings at the ends and the ring the rope takes */
  for (const lx of [x0 + 4, x0 + w - 7]) { f(g, '#6a4a24', lx, y0 + 1, 3, H - 2); f(g, '#c9a060', lx, y0 + 1, 2, H - 2); for (let yy = y0 + 3; yy < b - 3; yy += 3) f(g, '#6a4a24', lx, yy, 3, 1); }
  f(g, '#9a9aa6', x0 + w / 2 - 2, y0 - 2, 4, 2); f(g, '#1e1e26', x0 + w / 2 - 1, y0 - 1, 2, 1);
  /* the cut ends: pale with rings */
  for (const [ex, dir] of [[x0 - 1, 1], [x0 + w - 3, -1]]) { f(g, '#1a0e08', ex, y0 + 2, 4, H - 3); f(g, '#e0c08a', ex + (dir > 0 ? 0 : 1), y0 + 3, 3, H - 5); f(g, '#a8723a', ex + 1, y0 + 5, 1, H - 9); px(g, ex + 1, y0 + 7, '#6a4220'); }
}
/* THE LOG SPAN: lashed logs. hanging = in the air on its slings; down = laid across the gap as a plank bridge (drawn from deck boards, cell by cell) */
export function drawSpanHang(g, cx, b, w, tileFn) {
  const x0 = R(cx - w / 2), y0 = b - TS + 2;
  for (let x = x0; x < x0 + w; x += TS) g.drawImage(tileFn(x === x0, x + TS >= x0 + w), x, y0 - 2);
  for (const lx of [x0 + 10, x0 + w / 2 - 2, x0 + w - 14]) { f(g, '#6a4a24', lx, y0 - 2, 4, 10); f(g, '#c9a060', lx, y0 - 2, 2, 10); for (let yy = y0; yy < y0 + 8; yy += 3) f(g, '#6a4a24', lx, yy, 4, 1); }
}
export function drawSpanDown(g, x0s, y0s, cells, tileFn) {
  for (let i = 0; i < cells; i++) g.drawImage(tileFn(i === 0, i === cells - 1), x0s + i * TS, y0s);
  /* rope rails: a post at each end and a line between, so the bridge reads as made */
  for (const px_ of [x0s + 3, x0s + cells * TS - 6]) { f(g, '#3a2412', px_, y0s - 10, 3, 10); f(g, '#8a5a32', px_, y0s - 10, 1, 10); f(g, '#c9a060', px_ - 1, y0s - 11, 5, 1); }
  ropeLine(g, x0s + 4, y0s - 9, x0s + cells * TS - 5, y0s - 9, 5);
}
/* THE SPLIT LOG: two halves going apart and down, chips; t in seconds since it split */
export function drawSplitLog(g, cx, b, w, t) {
  const k = Math.min(1, t / 0.7); if (k >= 1) return; g.globalAlpha = 1 - k * k;
  for (const dir of [-1, 1]) { const hw = Math.round(w / 2 - 2), x = cx + dir * (hw / 2 + 2 + k * 18), y = b - 7 + k * 8 + (k < 0.4 ? -Math.sin(k / 0.4 * Math.PI) * 6 : 0), rot = dir * k * 5;
    g.save(); g.translate(x, y); g.rotate(rot * 0.12);
    f(g, '#1a0e08', -hw / 2, -6, hw, 12); f(g, '#5c3a1d', -hw / 2 + 1, -5, hw - 2, 8); f(g, '#a8723a', -hw / 2 + 1, -5, hw - 2, 2); f(g, '#e0c08a', dir > 0 ? -hw / 2 : hw / 2 - 3, -4, 3, 9); f(g, '#8a5a32', -hw / 2 + 4, -1, hw - 8, 1); g.restore(); }
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI + 0.1, d = 6 + k * 26 + (i % 3) * 4; f(g, i % 2 ? '#c9a060' : '#8a5a32', cx + Math.cos(a) * d * (i % 2 ? -1 : 1), b - 6 - Math.sin(a) * d * 0.8 + k * k * 18, 2, 2); }
  g.globalAlpha = 1;
}

/* ============================== THE PROCESSION ============================== */
/* the BANNER BEARER's standard: a tall pole carried upright from the hand, a crossbar, a crimson standard (swallow-tailed) with the court's crown, gold fringe and tassels */
export function drawStandard(g, x, y, face, time, seed) {
  const px0 = x + face * 6, top = y - 54, sw = Math.sin(time * 2.2 + seed) * 2, W = CREST;
  f(g, '#1e1208', px0 - 1, top, 3, 54); f(g, W.wood, px0 - 1, top, 2, 54); f(g, W.woodL, px0 - 1, top, 1, 54);
  f(g, W.gold, px0 - 2, top - 3, 5, 3); f(g, W.goldL, px0 - 1, top - 4, 3, 1); f(g, W.gold, px0, top - 6, 1, 3);
  f(g, '#3a2412', px0 - 8, top + 3, 17, 2); f(g, W.gold, px0 - 9, top + 2, 2, 4); f(g, W.gold, px0 + 8, top + 2, 2, 4);
  const bx = Math.round(px0 - 7 + sw * 0.4);   /* the cloth hangs from the crossbar */
  f(g, W.redD, bx, top + 5, 15, 26); f(g, W.red, bx + 1, top + 5, 13, 24); f(g, W.redL, bx + 1, top + 5, 2, 24); f(g, W.gold, bx, top + 5, 15, 1); f(g, W.gold, bx, top + 29, 4, 1); f(g, W.gold, bx + 11, top + 29, 4, 1);
  f(g, '#0e0808', bx + 5, top + 29, 5, 3); f(g, W.red, bx + 4, top + 29, 1, 2); f(g, W.red, bx + 10, top + 29, 1, 2);   /* the swallow-tail notch */
  /* the crown on the cloth */
  f(g, W.gold, bx + 4, top + 13, 7, 4); f(g, W.goldL, bx + 4, top + 13, 7, 1); f(g, W.gold, bx + 4, top + 10, 1, 3); f(g, W.gold, bx + 7, top + 9, 1, 4); f(g, W.gold, bx + 10, top + 10, 1, 3); f(g, W.goldD, bx + 4, top + 16, 7, 1);
  f(g, W.gold, bx + 6, top + 20, 3, 3); f(g, W.goldD, bx + 7, top + 21, 1, 1);
  for (const tx of [px0 - 8, px0 + 8]) { f(g, W.gold, tx, top + 6, 1, 7); f(g, W.gold, tx - 1, top + 12, 3, 3); }   /* the tassels */
}
/* the DRUMMER's drum: a barrel drum slung at the belly, red with gold hoops and a pale skin; the sticks fall on the beat (u 0..1 through it), and a ring goes out on the hit */
export function drawDrum(g, x, y, face, u, time) {
  const dx = x + face * 5, dy = y - 10, hit = u < 0.22 ? 1 - u / 0.22 : 0, W = CREST;
  f(g, '#1e0e0a', dx - 6, dy - 1, 12, 11); f(g, W.redD, dx - 5, dy, 10, 9); f(g, W.red, dx - 5, dy + 1, 10, 6); f(g, W.redL, dx - 5, dy + 1, 2, 6);
  f(g, W.gold, dx - 5, dy + 1, 10, 1); f(g, W.gold, dx - 5, dy + 7, 10, 1); f(g, W.goldD, dx - 5, dy + 8, 10, 1);
  f(g, '#e8dcc0', dx - 5, dy - 2, 10, 3); f(g, '#fff6e0', dx - 4, dy - 2, 8, 1); f(g, '#b8a888', dx - 5, dy, 10, 1);
  f(g, W.ropeD, dx - 6, dy - 1, 1, 12);   /* the sling */
  /* sticks: one up and one down, swapping on the beat */
  const up = u > 0.5 ? 1 : 0, s1 = hit > 0 ? 0 : -7 - (up ? 2 : 0), s2 = hit > 0 ? -7 : 0;
  g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; g.beginPath(); g.moveTo(dx - 3, dy - 2); g.lineTo(dx - 5 - face, dy - 2 + s1 + (hit ? 6 : 0)); g.moveTo(dx + 3, dy - 2); g.lineTo(dx + 5 + face, dy - 2 + s2 + (hit ? 0 : 6) - 6); g.stroke();
  if (hit > 0) { g.globalAlpha = hit * 0.7; g.strokeStyle = '#ffe9a0'; for (let r = 0; r < 2; r++) { const rr = 7 + (1 - hit) * 12 + r * 4; g.beginPath(); g.arc(dx, dy + 3, rr, -0.9, 0.9 + Math.PI * 0 + 0.1); g.stroke(); g.beginPath(); g.arc(dx, dy + 3, rr, Math.PI - 0.9, Math.PI + 0.9); g.stroke(); } g.globalAlpha = 1; }
}
/* THE COURT'S SIDE GATE: two posts, a lintel, a dark way in; the two leaves swing open (open 0..1) as the court marches and shut behind it. foot = the road's y at the gate */
export function drawSideGate(g, x, foot, open, time) {
  const W = CREST, h = 5 * TS, w = 4 * TS, x0 = x - w / 2, top = foot - h;
  /* the way in: dark, with a far lamp */
  f(g, '#0a0608', x0 + 6, top + 8, w - 12, h - 8); const lg = g.createLinearGradient(0, top + 8, 0, foot); lg.addColorStop(0, 'rgba(60,24,10,0)'); lg.addColorStop(1, 'rgba(120,56,20,0.5)'); g.fillStyle = lg; g.fillRect(x0 + 6, top + 8, w - 12, h - 8);
  if (open > 0.3) { g.globalAlpha = 0.5 + 0.2 * Math.sin(time * 6); f(g, '#ffc474', x - 2, foot - 30, 4, 5); f(g, '#fff0a8', x - 1, foot - 29, 2, 2); g.globalAlpha = 1; }
  /* the leaves: each a plank door with iron straps, hinged on its post, swinging into the dark (they foreshorten as they open) */
  const lw = Math.round((w - 12) / 2 * (1 - open * 0.8));
  for (const dir of [-1, 1]) { const hx = dir < 0 ? x0 + 6 : x0 + w - 6, lx = dir < 0 ? hx : hx - lw;
    f(g, '#2a1a0c', lx, top + 8, lw, h - 8); f(g, '#6a4424', lx + 1, top + 9, lw - 2, h - 10); f(g, '#8a5a32', lx + 1, top + 9, lw - 2, 1);
    for (let k = 3; k < lw - 1; k += 5) f(g, '#3a2412', lx + k, top + 10, 1, h - 12);
    for (const sy of [14, 34, 56]) { f(g, '#3a3a42', lx, top + sy, lw, 3); f(g, '#9a9aa6', lx, top + sy, lw, 1); }
    f(g, '#c0c0c8', dir < 0 ? lx + lw - 3 : lx + 1, top + 38, 2, 2); }
  /* posts, lintel with the court's crown */
  for (const dir of [-1, 1]) { const px_ = dir < 0 ? x0 : x0 + w - 8; f(g, '#1e1208', px_, top, 8, h); f(g, W.wood, px_ + 1, top, 6, h); f(g, W.woodL, px_ + 1, top, 2, h); f(g, W.woodD, px_ + 5, top, 2, h);
    for (let yy = top + 6; yy < foot - 4; yy += 14) { f(g, W.iron, px_, yy, 8, 2); f(g, W.ironL, px_, yy, 8, 1); } f(g, W.gold, px_ + 2, top - 3, 4, 3); f(g, W.goldL, px_ + 2, top - 3, 4, 1); }
  f(g, '#1e1208', x0 - 4, top - 2, w + 8, 12); f(g, W.wood, x0 - 3, top - 1, w + 6, 10); f(g, W.woodL, x0 - 3, top - 1, w + 6, 2); f(g, W.woodD, x0 - 3, top + 6, w + 6, 3);
  f(g, W.gold, x - 6, top + 1, 12, 5); f(g, W.goldL, x - 6, top + 1, 12, 1); f(g, W.gold, x - 6, top - 3, 2, 4); f(g, W.gold, x - 1, top - 5, 2, 6); f(g, W.gold, x + 4, top - 3, 2, 4); f(g, W.goldD, x - 6, top + 5, 12, 1);
  for (const lx of [x0 - 3, x0 + w - 3]) { f(g, W.iron, lx, top - 1, 6, 10); f(g, W.ironL, lx, top - 1, 6, 1); }
}

/* ============================== DECO (main.js deco kinds for this level) ============================== */
function bakeBanner(v, hung) {
  return once('bn' + v + (hung ? 'h' : 's'), () => { const W = CREST, h = hung ? 52 : 74, [c, g] = canvas(26, h), cloth = v ? ['#1a3a22', '#2a5a34', '#4a8a4a'] : [W.redD, W.red, W.redL];
    const top = hung ? 0 : 0;
    if (hung) { f(g, '#3a2412', 1, 0, 24, 3); f(g, W.woodL, 1, 0, 24, 1); f(g, W.gold, 0, 0, 3, 3); f(g, W.gold, 23, 0, 3, 3); f(g, W.rope, 5, 3, 1, 3); f(g, W.rope, 20, 3, 1, 3); }
    else { f(g, '#1e1208', 12, 0, 3, h); f(g, W.wood, 12, 0, 2, h); f(g, W.woodL, 12, 0, 1, h); f(g, W.gold, 11, 0, 5, 3); f(g, W.goldL, 12, 0, 3, 1); f(g, '#3a2412', 2, 5, 22, 2); f(g, W.gold, 0, 4, 3, 4); f(g, W.gold, 23, 4, 3, 4); }
    const y0 = hung ? 6 : 8, bh = hung ? 40 : 52;
    f(g, cloth[0], 3, y0, 20, bh); f(g, cloth[1], 4, y0, 18, bh - 2); f(g, cloth[2], 4, y0, 3, bh - 2);
    for (let k = 0; k < 4; k++) f(g, cloth[0], 8 + k * 4, y0 + 2 + (k % 2) * 3, 1, bh - 8);   /* folds */
    f(g, W.gold, 3, y0, 20, 2); f(g, W.goldD, 3, y0 + 2, 20, 1); f(g, W.gold, 3, y0 + bh - 3, 20, 1);
    for (let k = 0; k < 3; k++) { f(g, '#0a0608', 3 + k * 7, y0 + bh - 2 + (k === 1 ? 0 : 0), 6, 2); }   /* the tail is cut in three tongues */
    g.clearRect(5, y0 + bh - 3, 3, 4); g.clearRect(12, y0 + bh - 3, 3, 4); g.clearRect(19, y0 + bh - 3, 3, 4);
    /* the emblem: the court's crown over a goblin's grin (v0), or antlers (v1) */
    const ey = y0 + 14 + (hung ? -2 : 4);
    if (!v) { f(g, W.gold, 8, ey, 10, 5); f(g, W.goldL, 8, ey, 10, 1); f(g, W.gold, 8, ey - 4, 2, 4); f(g, W.gold, 12, ey - 6, 2, 6); f(g, W.gold, 16, ey - 4, 2, 4); f(g, W.goldD, 8, ey + 4, 10, 1);
      f(g, '#1e0e0a', 9, ey + 8, 8, 8); f(g, W.goldL, 10, ey + 10, 2, 2); f(g, W.goldL, 14, ey + 10, 2, 2); f(g, W.goldL, 10, ey + 13, 6, 1); }
    else { for (const s of [-1, 1]) { for (let k = 0; k < 12; k++) f(g, W.gold, 13 + s * (2 + k * 0.5) - (s > 0 ? 0 : 1), ey - k * 1, 2, 1); f(g, W.gold, 13 + s * 6 - (s > 0 ? 0 : 1), ey - 7, 2, 4); f(g, W.gold, 13 + s * 3 - (s > 0 ? 0 : 1), ey - 3, 2, 3); }
      f(g, W.gold, 9, ey + 6, 8, 7); f(g, W.goldL, 9, ey + 6, 8, 1); f(g, '#0e2a14', 11, ey + 8, 2, 2); f(g, '#0e2a14', 14, ey + 8, 2, 2); }
    return [c, g]; })[0];
}
function bakePennant(frame) {
  return once('pn' + frame, () => { const W = CREST, [c, g] = canvas(22, 44), w = 11 + (frame % 2);
    f(g, '#1e1208', 3, 4, 3, 40); f(g, W.wood, 3, 4, 2, 40); f(g, W.woodL, 3, 4, 1, 40); f(g, W.gold, 2, 1, 5, 3); f(g, W.goldL, 3, 1, 3, 1); f(g, '#3a3a42', 2, 36, 5, 2);
    const wv = [0, 1, 0, -1][frame % 4];
    f(g, W.redD, 6, 6, w + 2, 12); f(g, W.red, 6, 6, w + 1, 9); f(g, W.redL, 6, 6, w + 1, 2); f(g, W.gold, 6, 6, w + 2, 1); f(g, W.gold, 8, 11, 4, 2);
    g.clearRect(6 + w - 1, 12 + wv, 3, 3); f(g, W.redD, 6 + w, 15, 2, 3);
    return c; })
}
function bakeHangCage() {
  return once('hcage', () => { const [c, g] = canvas(40, 62), W = CREST;
    for (let y = 0; y < 22; y += 3) { f(g, '#1e1e26', 19, y, 3, 2); f(g, '#9a9aa6', 20, y, 1, 2); f(g, '#4a4a54', 19, y + 2, 3, 1); }   /* the chain */
    g.drawImage(cageSprite(false), 0, 22 - 4); return c; });
}
function bakeTollPost(v) {
  return once('toll' + v, () => { const [c, g] = canvas(34, 40), W = CREST;
    f(g, '#1e1208', 3, 8, 5, 32); f(g, W.wood, 4, 8, 3, 32); f(g, W.woodL, 4, 8, 1, 32); f(g, '#1e1208', 26, 8, 5, 32); f(g, W.wood, 27, 8, 3, 32); f(g, W.woodL, 27, 8, 1, 32);
    for (let x = 6; x < 28; x += 6) { f(g, '#e8dcc0', x, 12, 3, 4); f(g, W.red, x + 3, 12, 3, 4); }   /* the barrier bar, striped */
    f(g, '#1e1208', 6, 11, 22, 1); f(g, '#1e1208', 6, 16, 22, 1);
    for (const x of [5, 28]) { f(g, '#c0c0c8', x, 2, 1, 6); f(g, '#9a9aa6', x - 1, 7, 3, 1); }   /* spikes on the post-heads */
    f(g, '#cdb88a', 14, 0, 7, 7); f(g, '#e8dcc0', 14, 0, 7, 2); f(g, '#1e1208', 15, 3, 2, 2); f(g, '#1e1208', 18, 3, 2, 2); f(g, '#1e1208', 16, 6, 3, 1);   /* a skull above the bar */
    f(g, W.gold, 11, 20, 12, 8); f(g, W.goldD, 11, 27, 12, 1); f(g, '#3a2412', 13, 22, 8, 1); f(g, '#3a2412', 13, 24, 6, 1);   /* a toll board */
    return c; });
}
/* main.js's deco switch asks: a sprite for these kinds on this level, as [canvas, stands, frames?], or null (the game's own prop) */
export function decoOf(e) {
  switch (e.kind) {
    case 'banner': return [bakeBanner((e.v || 0) % 2, !!e.hang), true];
    case 'gobPennant': { const fr = [0, 1, 2, 3].map(bakePennant); return [fr[0], true, fr]; }
    case 'hangCage': return e.hang ? [bakeHangCage(), true] : null;
    case 'warnPost': return [bakeTollPost(e.v || 0), true];
    default: return null; }
}
