// theatre_props.js - THE MASKWRIGHT'S THEATRE's DRESSING and MACHINES, drawn (claude/theatreart). src/theatre-hands.js calls three things, once a frame:
//   drawScene(st, g, H, cx, cy, VW, VH, time)   behind the actors: the beams and pools, the painted flats and their TRACKS, the stage traps, the furniture, the gadgets
//                                               (limelights, rope-locks, winches, the prompt desk), the footlights, the strings, the boxes' audience, the glimpse, the curtain
//   drawMover(g, m, cx, cy, time)                a fly line's batten, its sandbag, the chandelier
//   drawFront(st, g, H, cx, cy, VW, VH, time, litAt)   OVER the actors: the light on whoever stands in a pool, and the hero's SEEN mark
// THE READABILITY RULES (the reviewer's notes): a gadget reads at a glance by its SILHOUETTE and its COLOUR - lamps are brass and cream, rope-locks iron
// with an orange lever, winches an iron drum with a crank, the prompt desk a lit desk; every fly line has its own COLOUR TAG on its lock, its batten and its
// sandbag, so which lock runs which line is never a guess; a flat's TRACK is drawn under it always and glows amber and runs chevrons the moment it is about
// to move; a trap is a hatch with hazard chevrons and pulses red before it drops; and a lamp's pool is a bright cream ellipse with a bright rim.
import { canvas, px, rect, line, fillPoly, circle, ellipse, outline, mulberry } from '../px.js';
import * as TR from '../theatre-rig.js';
import { TH } from './theatre_tiles.js';

const TS = 16;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const shadeHex = (h, k) => { const p = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); return '#' + p.map(v => Math.max(0, Math.min(255, Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k)))).toString(16).padStart(2, '0')).join(''); };

/* THE LINE COLOURS: A red, B blue, D gold, E green, G violet, H orange, CH (the chandelier) brass. Its lock, its batten and its sandbag wear it. */
export const LINECOL = { A: '#e05a4a', B: '#4a90e0', D: '#e6c440', E: '#5ccc6a', G: '#c070e8', H: '#ee8a3a', CH: '#f0d070' };
const lineCol = id => LINECOL[id] || '#e8e0c8';

// ------------------------------------------------------------ the painted scenes (a flat is a picture)
function sceneFlat(kind, w, h) {
  return once('flat' + kind + w + 'x' + h, () => { const [c, g] = canvas(w, h), r = mulberry(w * 31 + h + kind.length);
    const sky = (a, b) => { for (let y = 0; y < h; y++) { const t = y / h, p = [a, b].map(s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16))); rect(g, 0, y, w, 1, '#' + [0, 1, 2].map(k => Math.round(p[0][k] + (p[1][k] - p[0][k]) * t).toString(16).padStart(2, '0')).join('')); } };
    if (kind === 'forest') { sky('#1a2a4a', '#3a4a5a'); circle(g, w * 0.7, h * 0.2, Math.max(3, w * 0.08), '#f0e8c0'); circle(g, w * 0.7 + 1, h * 0.2 - 1, Math.max(2, w * 0.06), '#fff8dc');
      for (let layer = 0; layer < 3; layer++) { const col = ['#1a3a2a', '#123020', '#0a2014'][layer]; for (let x = -4 + layer * 5; x < w + 4; x += 9 + layer) { const th = h * (0.45 + 0.15 * r() + layer * 0.1), bx = x, by = h - layer * 2;
        fillPoly(g, [[bx - 6, by], [bx, by - th], [bx + 6, by]], col); fillPoly(g, [[bx - 5, by - th * 0.4], [bx, by - th * 0.9], [bx + 5, by - th * 0.4]], shadeHex(col, 0.1)); } } }
    else if (kind === 'castle') { sky('#3a2a4a', '#7a4a4a'); circle(g, w * 0.25, h * 0.22, Math.max(2, w * 0.07), '#f4e0b0');
      const tw = Math.max(8, w * 0.28); for (const [tx, th] of [[w * 0.05, h * 0.55], [w * 0.55, h * 0.72], [w * 0.36, h * 0.42]]) { rect(g, tx, h - th, tw, th, '#5a5a70'); rect(g, tx, h - th, tw, 2, '#8a8aa0'); for (let m = 0; m < tw; m += 4) rect(g, tx + m, h - th - 3, 2, 3, '#5a5a70'); rect(g, tx + tw * 0.4, h - th + 8, 3, 5, '#ffd36b'); for (let y = h - th + 4; y < h; y += 6) rect(g, tx, y, tw, 1, '#48485c'); }
      rect(g, w * 0.62, h * 0.12, 1, 10, '#3a2a2a'); fillPoly(g, [[w * 0.62 + 1, h * 0.12], [w * 0.62 + 7, h * 0.12 + 3], [w * 0.62 + 1, h * 0.12 + 6]], TH.ox3); }
    else if (kind === 'sea') { sky('#26365a', '#5a7a9a'); circle(g, w * 0.5, h * 0.3, Math.max(3, w * 0.09), '#f4e8c4');
      for (let row = 0; row < 5; row++) { const y0 = h * (0.5 + row * 0.11), col = ['#3a6a9a', '#2a5a8a', '#1e4a7a', '#163a66', '#0e2a54'][row]; rect(g, 0, y0, w, h - y0, col); for (let x = 0; x < w; x += 6) { px(g, x + (row * 3) % 6, y0, '#8ac0e8'); px(g, x + (row * 3) % 6 + 1, y0 - 1, '#5a90c0'); } }
      fillPoly(g, [[w * 0.2, h * 0.62], [w * 0.5, h * 0.62], [w * 0.44, h * 0.7], [w * 0.26, h * 0.7]], '#2a1a14'); rect(g, w * 0.34, h * 0.3, 1, h * 0.32, '#2a1a14'); fillPoly(g, [[w * 0.36, h * 0.32], [w * 0.5, h * 0.55], [w * 0.36, h * 0.55]], '#e8dcc0'); }
    else if (kind === 'door') { rect(g, 0, 0, w, h, '#46301f'); rect(g, 2, 3, w - 4, h - 6, '#5a3c26'); for (let y = 8; y < h - 4; y += 24) rect(g, 3, y, w - 6, 1, '#2e2018'); rect(g, w - 5, h * 0.5, 2, 3, TH.brass3); rect(g, 3, 5, w - 6, 8, '#1a1018'); circle(g, w / 2, 9, 2, '#e8e0d0'); }
    else if (kind === 'flags') { sky('#2a2a3a', '#4a4a54'); for (let y = 0; y < h; y += 8) for (let x = ((y >> 3) & 1) * 8; x < w; x += 16) rect(g, x, y, 15, 7, '#5a5a66'); }
    else if (kind === 'ground') { sky('#1a2a3a', '#26402a'); for (let x = 0; x < w; x += 3) { const th = 6 + ((r() * 6) | 0); rect(g, x, h - th, 2, th, ['#2a5a2a', '#1e4a22', '#3a6a30'][x % 3]); } }
    rect(g, 0, 0, w, 2, TH.wood3); rect(g, 0, h - 2, w, 2, TH.wood2); rect(g, 0, 0, 2, h, TH.wood2); rect(g, w - 2, 0, 2, h, TH.wood2); rect(g, 0, 0, w, 1, TH.wood4);   // the timber frame the canvas is stretched on
    for (let y = 8; y < h - 4; y += 24) { rect(g, 0, y, 3, 2, TH.iron3); rect(g, w - 3, y, 3, 2, TH.iron3); }
    return c; });
}

// ------------------------------------------------------------ gadget bakes
const barrel = () => once('barrel', () => { const [c, g] = canvas(16, 9);   // a limelight's body, facing right: hood, drum, lens ring
  rect(g, 0, 1, 3, 7, TH.iron1); rect(g, 3, 0, 9, 9, TH.brass1); rect(g, 3, 0, 9, 2, TH.brass3); rect(g, 3, 7, 9, 2, TH.brass0); rect(g, 6, 2, 1, 5, TH.brass0); rect(g, 12, 0, 3, 9, TH.iron2); rect(g, 12, 0, 3, 1, TH.iron4); rect(g, 12, 8, 3, 1, TH.iron0); rect(g, 15, 1, 1, 7, TH.iron3);
  return outline(c, '#0c0810'); });
const yoke = () => once('yoke', () => { const [c, g] = canvas(12, 12); rect(g, 5, 0, 2, 6, TH.iron2); rect(g, 2, 5, 8, 2, TH.iron2); rect(g, 2, 5, 8, 1, TH.iron4); rect(g, 2, 5, 2, 6, TH.iron1); rect(g, 8, 5, 2, 6, TH.iron1); return outline(c, '#0c0810'); });
const ropeLock = (lit) => once('rlock' + lit, () => { const [c, g] = canvas(14, 30);   // an iron rope-lock: a wall plate, a clamp on the line, an ORANGE lever (up = the line is out)
  rect(g, 3, 0, 8, 30, TH.iron1); rect(g, 3, 0, 1, 30, TH.iron3); rect(g, 10, 0, 1, 30, TH.iron0);
  rect(g, 6, 0, 2, 30, TH.rope); for (let y = 0; y < 30; y += 3) px(g, 6 + ((y >> 1) & 1), y, TH.ropeD);                 // the line running through
  rect(g, 1, 10, 12, 8, TH.iron2); rect(g, 1, 10, 12, 2, TH.iron4); rect(g, 1, 16, 12, 2, TH.iron0); px(g, 2, 14, TH.iron4); px(g, 11, 14, TH.iron4);
  if (lit) { rect(g, 9, 3, 2, 9, '#ff9a3c'); rect(g, 8, 1, 4, 3, '#ffcf70'); } else { rect(g, 9, 16, 2, 9, '#c86a1c'); rect(g, 8, 24, 4, 3, '#e08a30'); }   // the lever, up or down
  return outline(c, '#0c0810'); });
const winchBase = () => once('winch', () => { const [c, g] = canvas(20, 18);   // a hand winch: an iron drum on a stand, a cable, a crank
  rect(g, 2, 14, 16, 4, TH.iron1); rect(g, 2, 14, 16, 1, TH.iron3); rect(g, 4, 4, 12, 11, TH.iron2); rect(g, 4, 4, 12, 2, TH.iron4); rect(g, 4, 13, 12, 2, TH.iron0);
  for (let y = 6; y < 13; y += 2) rect(g, 5, y, 10, 1, TH.rope); rect(g, 8, 0, 4, 5, TH.iron1); px(g, 9, 1, TH.iron4); return outline(c, '#0c0810'); });
const desk = () => once('desk', () => { const [c, g] = canvas(24, 20);   // THE PROMPT DESK: a slanted desk, the prompt book, a brass lever, a signal lamp
  fillPoly(g, [[1, 8], [23, 8], [23, 19], [1, 19]], TH.wood2); rect(g, 1, 8, 22, 1, TH.wood5); rect(g, 1, 18, 22, 2, TH.wood0); rect(g, 3, 9, 8, 6, '#d8c8a0'); rect(g, 3, 9, 8, 1, '#fff'); for (let k = 0; k < 3; k++) rect(g, 4, 11 + k * 2, 6, 1, '#5a4a30');
  rect(g, 15, 10, 6, 2, TH.brass1); rect(g, 15, 10, 6, 1, TH.brass3); rect(g, 17, 3, 2, 8, TH.brass2); circle(g, 18, 3, 2, TH.brass3); rect(g, 12, 6, 1, 3, TH.iron2); return outline(c, '#0c0810'); });

// ------------------------------------------------------------ furniture (the deco kinds only this level uses)
const mirror = v => once('mirror' + v, () => { const [c, g] = canvas(26, 38);   // a dressing-room mirror ringed with bulbs
  rect(g, 2, 2, 22, 34, TH.wood2); rect(g, 2, 2, 22, 1, TH.wood5); rect(g, 2, 2, 1, 34, TH.wood3);
  rect(g, 5, 5, 16, 28, '#6a7a90'); for (let y = 6; y < 32; y++) rect(g, 6, y, 14, 1, y < 16 ? '#8a9ab0' : '#5a6a80'); rect(g, 7, 7, 2, 10, '#d8e8f4'); rect(g, 9, 8, 1, 4, '#fff'); rect(g, 15, 20, 3, 6, '#48586e');
  if (v) { circle(g, 13, 16, 4, '#5a4858'); rect(g, 10, 20, 6, 8, '#5a4858'); }   // and something in it that is not you
  for (let k = 0; k < 6; k++) { const by = 4 + k * 5.4; rect(g, 3, by | 0, 2, 2, '#fff2b0'); rect(g, 21, by | 0, 2, 2, '#fff2b0'); }
  for (let k = 0; k < 4; k++) { rect(g, 6 + k * 4, 3, 2, 2, '#fff2b0'); }
  rect(g, 0, 36, 26, 2, TH.wood1); return outline(c, '#0c0810'); });
const wardrobe = () => once('wardrobe', () => { const [c, g] = canvas(32, 42);
  rect(g, 1, 4, 30, 36, TH.wood2); rect(g, 1, 4, 30, 2, TH.wood4); rect(g, 0, 1, 32, 4, TH.wood3); rect(g, 0, 1, 32, 1, TH.brass2);
  rect(g, 4, 8, 11, 28, TH.wood3); rect(g, 17, 8, 11, 28, TH.wood3); rect(g, 15, 8, 2, 28, '#0a0608'); rect(g, 6, 10, 7, 24, TH.wood2); rect(g, 19, 10, 7, 24, TH.wood2);
  rect(g, 12, 20, 2, 4, TH.brass3); rect(g, 18, 20, 2, 4, TH.brass3); rect(g, 15, 9, 1, 26, '#000'); rect(g, 3, 40, 26, 2, TH.wood0); rect(g, 2, 38, 4, 3, TH.wood0); rect(g, 26, 38, 4, 3, TH.wood0);
  for (let k = 0; k < 3; k++) { px(g, 15, 14 + k * 8, '#c04048'); px(g, 16, 14 + k * 8, '#c04048'); }   // a sleeve caught in the door
  return outline(c, '#0c0810'); });
const seat = v => once('seat' + v, () => { const [c, g] = canvas(16, 22);   // a tip-up velvet seat with a brass arm and a number
  rect(g, 2, 2, 12, 12, TH.ox1); rect(g, 2, 2, 12, 2, TH.ox3); rect(g, 3, 4, 10, 1, TH.ox2); rect(g, 1, 3, 2, 11, TH.ox0); rect(g, 13, 3, 2, 11, TH.ox0);
  rect(g, 2, 14, 12, 5, TH.ox2); rect(g, 2, 14, 12, 2, TH.ox3); rect(g, 2, 18, 12, 1, TH.ox0); rect(g, 0, 12, 3, 2, TH.brass2); rect(g, 13, 12, 3, 2, TH.brass2); rect(g, 7, 6, 2, 2, TH.brass3);
  rect(g, 3, 19, 2, 3, TH.iron1); rect(g, 11, 19, 2, 3, TH.iron1); if (v) { rect(g, 4, 0, 8, 3, TH.ox0); px(g, 6, 0, TH.ox3); } return outline(c, '#0c0810'); });
const stand = v => once('stand' + v, () => { const [c, g] = canvas(20, 24);   // a music stand with a score, or one knocked askew
  if (v) { line(g, 6, 22, 12, 6, TH.iron2); rect(g, 8, 2, 10, 8, '#e8dcc0'); for (let k = 0; k < 4; k++) rect(g, 9, 3 + k * 2, 8, 1, '#4a3a30'); rect(g, 9, 21, 7, 1, TH.iron1); return outline(c, '#0c0810'); }
  rect(g, 9, 6, 2, 16, TH.iron2); rect(g, 9, 6, 1, 16, TH.iron4); rect(g, 4, 22, 12, 2, TH.iron1); rect(g, 4, 22, 12, 1, TH.iron3); fillPoly(g, [[3, 1], [17, 1], [16, 9], [4, 9]], '#e8dcc0'); rect(g, 3, 1, 14, 1, '#fff'); for (let k = 0; k < 3; k++) rect(g, 5, 3 + k * 2, 10, 1, '#4a3a30'); rect(g, 3, 9, 14, 2, TH.iron2); return outline(c, '#0c0810'); });
const rack = v => once('rack' + v, () => { const [c, g] = canvas(32, 36);   // a costume rail on two uprights
  rect(g, 1, 2, 2, 34, TH.iron2); rect(g, 29, 2, 2, 34, TH.iron2); rect(g, 0, 2, 32, 2, TH.iron3); rect(g, 0, 2, 32, 1, TH.iron4); rect(g, 0, 34, 6, 2, TH.iron1); rect(g, 26, 34, 6, 2, TH.iron1);
  const pal = v ? ['#6a3a5a', '#8a2a34', '#2a4a6a', '#8a6a1a', '#4a2a5a'] : ['#3a5a6a', '#8a2a34', '#4a6a2a', '#6a4a2a', '#7a1a2a'];
  for (let k = 0; k < 5; k++) { const x = 4 + k * 5, len = 16 + ((k * 7) % 6), col = pal[k]; rect(g, x, 4, 1, 2, TH.iron3); fillPoly(g, [[x - 2, 6], [x + 3, 6], [x + 4, 6 + len], [x - 3, 6 + len]], col); rect(g, x - 2, 6, 1, len, shadeHex(col, 0.2)); rect(g, x + 2, 6, 1, len, shadeHex(col, -0.3)); px(g, x, 10, TH.brass2); }
  return outline(c, '#0c0810'); });
const props = v => once('props' + v, () => { const [c, g] = canvas(30, 26);   // a prop hamper: a crown, a foil, a paper skull
  rect(g, 1, 12, 28, 14, TH.wood2); rect(g, 1, 12, 28, 2, TH.wood4); for (let x = 5; x < 28; x += 8) rect(g, x, 12, 1, 14, TH.wood1); rect(g, 1, 18, 28, 1, TH.iron2); rect(g, 13, 15, 4, 4, TH.brass2);
  if (v) { circle(g, 8, 9, 4, '#e8e0d0'); rect(g, 6, 8, 2, 2, '#1a1418'); rect(g, 9, 8, 2, 2, '#1a1418'); rect(g, 7, 12, 4, 1, '#e8e0d0'); line(g, 22, 12, 27, 1, TH.iron4); rect(g, 20, 11, 5, 1, TH.brass2); }
  else { fillPoly(g, [[6, 12], [8, 5], [11, 9], [14, 4], [17, 9], [20, 5], [22, 12]], TH.brass2); rect(g, 6, 11, 16, 2, TH.brass1); px(g, 14, 5, TH.ox3); px(g, 8, 6, '#4a90e0'); px(g, 20, 6, TH.ox3); }
  return outline(c, '#0c0810'); });

// ------------------------------------------------------------ the chandelier, and the sacks and battens
const chandelier = () => once('chand', () => { const [c, g] = canvas(66, 22);
  rect(g, 32, 0, 2, 5, TH.brass2); rect(g, 26, 5, 14, 3, TH.brass1); rect(g, 26, 5, 14, 1, TH.brass3);
  for (const [x0, x1, y] of [[4, 62, 12]]) { rect(g, x0, y, x1 - x0, 2, TH.brass2); rect(g, x0, y, x1 - x0, 1, TH.brass4); }
  fillPoly(g, [[6, 12], [33, 6], [60, 12], [33, 9]], TH.brass1); line(g, 33, 8, 20, 12, TH.brass2); line(g, 33, 8, 46, 12, TH.brass2);
  for (let x = 8; x <= 58; x += 10) { rect(g, x, 8, 2, 4, TH.cream); rect(g, x, 6, 2, 2, '#fff2b0'); px(g, x, 5, '#ffb050'); }               // the candle-bulbs
  for (let x = 6; x < 62; x += 4) { const len = 3 + ((x * 5) % 6); rect(g, x, 14, 1, len, '#cfe8ff'); px(g, x, 14 + len, '#ffffff'); if ((x >> 2) % 3 === 0) rect(g, x - 1, 14 + len - 1, 3, 2, '#9ac8f0'); }   // the crystal drops
  rect(g, 26, 14, 14, 4, TH.brass2); rect(g, 30, 18, 6, 3, '#cfe8ff'); px(g, 33, 21, '#fff');
  return outline(c, '#0c0810'); });
const sack = () => once('sack', () => { const [c, g] = canvas(30, 16);   // a canvas sandbag, tied at the neck, stencilled
  rect(g, 2, 3, 26, 12, '#a88a5a'); rect(g, 4, 2, 22, 2, '#c0a070'); rect(g, 2, 13, 26, 2, '#6e5634'); rect(g, 2, 3, 2, 12, '#8a6a3c'); rect(g, 26, 3, 2, 12, '#6a4e2a');
  for (let x = 6; x < 24; x += 5) { rect(g, x, 6, 1, 6, '#6e5634'); } rect(g, 9, 7, 3, 4, '#3a2c1e'); rect(g, 13, 7, 4, 1, '#3a2c1e'); rect(g, 13, 10, 4, 1, '#3a2c1e'); rect(g, 13, 7, 1, 4, '#3a2c1e'); rect(g, 19, 7, 2, 4, '#3a2c1e');
  rect(g, 12, 0, 6, 3, '#c0a070'); rect(g, 12, 2, 6, 1, TH.rope); return outline(c, '#0c0810'); });
const batten = () => once('batten', () => { const [c, g] = canvas(16, 6);
  rect(g, 0, 1, 16, 4, TH.iron2); rect(g, 0, 1, 16, 1, TH.iron4); rect(g, 0, 4, 16, 1, TH.iron0); rect(g, 0, 0, 2, 6, TH.brass2); rect(g, 14, 0, 2, 6, TH.brass2); return c; });

// ------------------------------------------------------------ THE MOVERS
export function drawMover(g, m, cx, cy, time) {
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy), w = m.w, top = Math.round(4 * TS - cy), col = lineCol(m.line);
  if (m.chandelier) { const ch = chandelier(), at = Math.round(x + w / 2 - ch.width / 2);
    g.fillStyle = TH.brass1; g.fillRect(Math.round(x + w / 2) - 1, top, 2, Math.max(0, y - top)); g.fillStyle = TH.brass3; g.fillRect(Math.round(x + w / 2), top, 1, Math.max(0, y - top));   // its chain, to the grid
    g.drawImage(ch, at, y - 6);
    glowAt(g, x + w / 2, y + 6, 70, '255,225,150', 0.16 + 0.04 * Math.sin(time * 3)); return; }
  // its two lines to the grid: hemp, twisted, in the line's own colour where they meet the load
  for (const lx of [x + 3, x + w - 4]) { g.fillStyle = TH.rope; g.fillRect(lx, top, 1, Math.max(0, y - top)); g.fillStyle = TH.ropeD; for (let yy = top + 1; yy < y; yy += 3) g.fillRect(lx, yy, 1, 1); }
  if (m.role === 'bag') { const sk = sack(); const n = Math.max(1, Math.round((w - 2) / 28)); for (let i = 0; i < n; i++) g.drawImage(sk, x + 1 + i * 0, y + m.h - 16 + 2 - (i ? 0 : 0), Math.min(w - 2, 30), 16);
    g.fillStyle = col; g.fillRect(x + Math.floor(w / 2) - 2, y + 2, 4, 3); return; }
  const bt = batten(); g.drawImage(bt, x, y, w, 6); g.fillStyle = col; g.fillRect(x + 2, y + 1, 4, 4); g.fillRect(x + w - 6, y + 1, 4, 4);                            // pipe batten, the line's colour on both ends
  g.fillStyle = TH.brass3; for (let k = 8; k < w - 8; k += 12) g.fillRect(x + k, y + 1, 4, 1);
}

// ------------------------------------------------------------ light
function glowAt(g, x, y, r, rgb, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
function drawLamp(g, st, pr, cx, cy, time, dt) {
  const s = st.spots[pr.spot]; if (!s) return; const x = Math.round(pr.x - cx), hy = Math.round(s.y - cy), fl = pr.flash > 0, p = TR.poolOf(s);
  const ax = Math.round(p.x - cx), ay = Math.round(p.y - 10 - cy), ang = Math.atan2(ay - hy, ax - x), left = Math.cos(ang) < 0;
  const yPx = Math.round(pr.y - cy);
  if (pr.hang) { g.fillStyle = TH.iron1; g.fillRect(x - 1, hy - 9, 2, 6); g.fillStyle = TH.iron3; g.fillRect(x - 3, hy - 10, 6, 2); g.fillStyle = TH.iron0; g.fillRect(x - 4, hy - 11, 8, 1); }   // hung from a clamp on the rail
  else { g.fillStyle = TH.iron1; g.fillRect(x - 1, hy + 5, 3, yPx - hy - 5); g.fillStyle = TH.iron3; g.fillRect(x - 1, hy + 5, 1, yPx - hy - 5); g.fillStyle = TH.iron2; g.fillRect(x - 6, yPx - 3, 13, 3); g.fillStyle = TH.iron4; g.fillRect(x - 6, yPx - 3, 13, 1); g.fillRect(x - 5, yPx - 6, 2, 3); g.fillRect(x + 4, yPx - 6, 2, 3); }   // a floor stand: pole and tripod
  g.drawImage(yoke(), x - 6, hy - 1);
  g.save(); g.translate(x, hy + 1); g.rotate(ang); if (left) g.scale(1, -1); g.translate(-4, -4); g.drawImage(barrel(), 0, 0); if (fl) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7; g.drawImage(barrel(), 0, 0); } g.restore();
  const lens = s.off ? '#4a4030' : s.clear ? '#ffffff' : '#c0a060';
  g.fillStyle = lens; g.fillRect(x + Math.round(Math.cos(ang) * 11) - 1, hy + Math.round(Math.sin(ang) * 11), 2, 2);
  if (!s.off && s.clear) glowAt(g, x + Math.cos(ang) * 12, hy + 1 + Math.sin(ang) * 12, 14, '255,242,176', 0.5);
  if (!pr.hang && !s.off) { g.fillStyle = s.clear ? TH.brass3 : TH.iron3; g.fillRect(x - 1, yPx - 11, 3, 2); }
  if (s.held) { g.fillStyle = '#ff6b4a'; g.fillRect(x + 4, hy - 4, 3, 3); }   // a lamp held on its cue by the prompt desk
}
function drawBeamsAndPools(g, st, cx, cy, VW, VH, time) {
  for (const s of st.spots) { if (s.off) continue; const p = TR.poolOf(s); if (p.x < cx - 90 || p.x > cx + VW + 90) continue;
    const lx = s.x - cx, ly = s.y - cy, px0 = p.x - cx, py0 = p.y - cy;
    if (s.clear) {
      const gr = g.createLinearGradient(lx, ly, px0, py0); gr.addColorStop(0, 'rgba(255,246,200,0.34)'); gr.addColorStop(1, 'rgba(255,236,160,0.12)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(lx - 2, ly - 1); g.lineTo(lx + 2, ly + 1); g.lineTo(px0 + p.r, py0); g.lineTo(px0 - p.r, py0); g.closePath(); g.fill();
      for (let k = 0; k < 7; k++) { const t2 = ((time * 0.12 + k * 0.143) % 1), bx = lx + (px0 - lx) * t2 + Math.sin(time * 1.7 + k * 2.1) * p.r * 0.4 * t2, by = ly + (py0 - ly) * t2; g.globalAlpha = 0.55 * (1 - Math.abs(t2 - 0.5) * 1.6); g.fillStyle = '#fffbe0'; g.fillRect(Math.round(bx), Math.round(by), 1, 1); } g.globalAlpha = 1;   // dust in the beam
      g.save(); g.translate(px0, py0 - 1); g.scale(1, 0.24); const pg = g.createRadialGradient(0, 0, 0, 0, 0, p.r); pg.addColorStop(0, 'rgba(255,250,220,0.75)'); pg.addColorStop(0.7, 'rgba(255,240,180,0.45)'); pg.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = pg; g.beginPath(); g.arc(0, 0, p.r, 0, Math.PI * 2); g.fill(); g.restore();   // the pool
      g.strokeStyle = 'rgba(255,248,210,' + (0.75 + 0.2 * Math.sin(time * 5)).toFixed(2) + ')'; g.lineWidth = 1; g.beginPath(); g.ellipse(px0, py0 - 1, p.r * 0.92, p.r * 0.2, 0, 0, Math.PI * 2); g.stroke();       // its bright rim
      g.fillStyle = '#fffbe0'; g.fillRect(Math.round(px0) - 3, Math.round(py0) - 2, 7, 1); g.fillRect(Math.round(px0), Math.round(py0) - 4, 1, 5);                                                                // the spike mark on the boards
    } else {   // a blocked beam: it stops at the scenery, and you can see where it was going
      g.globalAlpha = 0.55; g.strokeStyle = '#a08850'; g.setLineDash && g.setLineDash([2, 3]); g.beginPath(); g.moveTo(lx, ly); g.lineTo(px0, py0 - 12); g.stroke(); g.setLineDash && g.setLineDash([]); g.globalAlpha = 1; }
  }
}

// ------------------------------------------------------------ flats and their tracks
const FLAT_SCENE = ['forest', 'castle', 'sea'];
function drawFlats(g, st, cx, cy, VW, VH, time) {
  for (const f of st.flats) {
    const moving = f.warn || f.at !== f.to, cued = !!f.cue || !!f.acts, dir = Math.sign((f.to - f.at) || (f.b - f.a)) || 1;
    // ---- the TRACK, always under it; amber, chevron-running, when it is about to move ----
    if (f.axis === 'x') { const x0 = Math.min(f.a, f.b) * TS - cx, x1 = (Math.max(f.a, f.b) + f.w) * TS - cx, ty = (f.y1 + 1) * TS - cy; if (x1 < 0 || x0 > VW) continue;
      g.fillStyle = TH.iron0; g.fillRect(x0, ty - 2, x1 - x0, 3); g.fillStyle = TH.iron3; g.fillRect(x0, ty - 2, x1 - x0, 1); g.fillStyle = TH.wood1; for (let x = x0 + 2; x < x1; x += 8) g.fillRect(x, ty - 1, 4, 1);   // rails and sleepers
      if (cued && !moving) { g.fillStyle = 'rgba(255,190,60,0.5)'; for (let x = x0 + 4; x < x1; x += 12) g.fillRect(x, ty - 2, 4, 1); }
      if (moving) { const a = 0.55 + 0.45 * Math.sin(time * 18); g.globalAlpha = a; g.fillStyle = '#ffd36b'; g.fillRect(x0, ty - 3, x1 - x0, 2); g.globalAlpha = 0.3 * a; g.fillStyle = '#ffb040'; g.fillRect(x0, ty - 8, x1 - x0, 6); g.globalAlpha = 1;
        g.fillStyle = '#fff2b0'; const off = (time * 40 * dir) % 14; for (let x = x0 + ((off + 14) % 14); x < x1 - 4; x += 14) { g.fillRect(x, ty - 5, 1, 1); g.fillRect(x + dir, ty - 4, 1, 1); g.fillRect(x, ty - 3, 1, 1); if (dir < 0) { g.fillRect(x - 1, ty - 4, 1, 1); } } }
      if (cued) { const bx = x0 - 4, on = f.warn; g.fillStyle = TH.iron1; g.fillRect(bx, ty - 8, 4, 6); g.fillStyle = on && Math.floor(time * 10) % 2 ? '#ff5a3a' : '#7a3a20'; g.fillRect(bx + 1, ty - 7, 2, 2); }   // the cue lamp on the track's end
    } else { const yA = Math.min(f.a, f.b) * TS - cy, yB = (Math.max(f.a, f.b) + f.h) * TS - cy, lx = f.x0 * TS - cx, rx = (f.x1 + 1) * TS - cx; if (rx < 0 || lx > VW) continue;
      for (const gx of [lx + 1, rx - 2]) { g.fillStyle = TH.iron0; g.fillRect(gx, yA - 6, 2, yB - yA + 6); g.fillStyle = moving ? '#ffd36b' : TH.iron3; g.fillRect(gx, yA - 6, 1, yB - yA + 6); }
      if (moving) { g.globalAlpha = 0.25 + 0.25 * Math.sin(time * 18); g.fillStyle = '#ffb040'; g.fillRect(lx - 2, yA - 6, rx - lx + 4, 3); g.globalAlpha = 1; }
    }
    // ---- the flat itself ----
    const cells = TR.flatCells(f, f.at); if (!cells.length) continue;
    const x0 = Math.min(...cells.map(c => c[0])), x1 = Math.max(...cells.map(c => c[0])), y0 = Math.min(...cells.map(c => c[1])), y1 = Math.max(...cells.map(c => c[1]));
    const sx = x0 * TS - cx, sy = y0 * TS - cy, w = (x1 - x0 + 1) * TS, h = (y1 - y0 + 1) * TS; if (sx > VW || sx + w < 0 || sy > VH || sy + h < 0) continue;
    const nm = f.name || '';
    if (/shutter/.test(nm)) { const [a, b] = [0, 1]; void a; void b; g.save(); g.beginPath(); g.rect(sx, sy, w, h); g.clip(); for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) g.drawImage(wallBrick(((tx * 7 + ty * 13) % 3 + 3) % 3), tx * TS - cx, ty * TS - cy); g.restore(); continue; }   // painted as the wall it hides
    const scene = /door/.test(nm) && f.axis === 'y' ? 'door' : /ground row/.test(nm) ? 'ground' : /floor flat/.test(nm) ? 'flags' : /cloth/.test(nm) ? 'sea' : nm === 'the scene change' ? 'castle' : /wing/.test(nm) ? 'forest' : FLAT_SCENE[(x0 + y0) % 3];
    if (/cloth/.test(nm)) { drawCloth(g, sx, sy, w, h, time); continue; }
    g.drawImage(sceneFlat(scene, w, h), Math.round(sx), Math.round(sy));
    if (cued) { g.fillStyle = TH.brass3; g.fillRect(sx, sy, w, 1); g.fillRect(sx, sy + h - 1, w, 1); g.fillStyle = f.warn ? '#ff5a3a' : TH.brass2; g.fillRect(sx + w / 2 - 2, sy - 3, 4, 3); }   // gilt edging and a cue bulb on top: a flat that moves on a cue
    if (/floor flat/.test(nm)) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(sx, sy + 8, w, h - 8); }
    if (moving) { g.globalAlpha = 0.3 + 0.3 * Math.sin(time * 18); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(sx + 0.5, sy + 0.5, w - 1, h - 1); g.globalAlpha = 1; }
  }
}
const wallBrick = v => once('wbrick' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 131 + 5); rect(g, 0, 0, 16, 16, TH.void0);
  for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off; rect(g, x + 1, row * 4 + 1, 7, 3, r() < 0.2 ? TH.void2 : TH.void1); } } return c; });
function drawCloth(g, sx, sy, w, h, time) {   // THE CLOTH: a painted sea cloth flown in on lines, hem and all
  const cl = sceneFlat('sea', w, Math.max(h, 16)); g.save(); g.beginPath(); g.rect(sx, sy, w, h); g.clip(); g.drawImage(cl, Math.round(sx), Math.round(sy), w, h); g.restore();
  g.fillStyle = TH.brass2; g.fillRect(sx, sy, w, 2); g.fillStyle = TH.brass4; g.fillRect(sx, sy, w, 1); for (let x = sx + 4; x < sx + w; x += 20) { g.fillStyle = TH.rope; g.fillRect(x, sy - 60, 1, 60); }
  for (let x = sx; x < sx + w; x += 4) { g.fillStyle = '#1e4a7a'; g.fillRect(x, sy + h - 1, 2, 1 + ((Math.sin(time * 3 + x) > 0.5) ? 1 : 0)); }
}

// ------------------------------------------------------------ traps
function drawTraps(g, st, cx, cy, time) {
  for (const tr of st.traps) { const sx = tr.x0 * TS - cx, w = (tr.x1 - tr.x0 + 1) * TS, sy = tr.row * TS - cy; if (sx > 340 || sx + w < -20) continue;
    if (tr.state === 'warn') { const k = 0.5 + 0.5 * Math.sin(time * 20); g.globalAlpha = 0.28 + 0.3 * k; g.fillStyle = '#ff4a2a'; g.fillRect(sx, sy, w, 5); g.globalAlpha = 0.55 + 0.45 * k; g.fillStyle = '#ff6b4a'; g.fillRect(sx, sy, w, 1); g.fillRect(sx, sy, 2, 8); g.fillRect(sx + w - 2, sy, 2, 8);
      g.globalAlpha = 1; g.fillStyle = '#fff2b0'; for (let x = sx + 4; x < sx + w - 4; x += 8) g.fillRect(x + ((time * 30) | 0) % 8 - 4 + 4 * 0, sy - 3, 2, 2); }   // sparks over a hatch about to go
    else if (tr.state === 'open') { g.fillStyle = TH.void0; g.fillRect(sx, sy, w, 8); g.fillStyle = '#ffd36b'; g.fillRect(sx, sy, w, 1);
      g.fillStyle = TH.wood2; fillPoly(g, [[sx, sy + 1], [sx + 3, sy + 1], [sx + 2, sy + 9], [sx, sy + 9]], TH.wood2); fillPoly(g, [[sx + w, sy + 1], [sx + w - 3, sy + 1], [sx + w - 2, sy + 9], [sx + w, sy + 9]], TH.wood2);   // the leaves hanging from their hinges
      g.fillStyle = TH.brass3; g.fillRect(sx, sy, 2, 1); g.fillRect(sx + w - 2, sy, 2, 1); }
  }
}

// ------------------------------------------------------------ the curtain, the proscenium, the footlights
const foldCol = ['#5a1018', '#7a1a24', '#9a2a30', '#b8383e', '#9a2a30', '#7a1a24'];
function drawCurtain(g, st, cx, cy, VW, VH, time) {
  const [x0, x1, y0, y1] = st.show.curtain, k = Math.min(st.show.lift, 1 - (st.show.fall || 0)), sx = Math.round(x0 * TS - cx), w = (x1 - x0 + 1) * TS, full = (y1 - y0 + 1) * TS, sy = Math.round(y0 * TS - cy);
  if (sx > VW || sx + w < 0) return;
  const gather = 14, drop = Math.round(full * (1 - k));   // the curtain gathers UP: what is left of it hangs from the valance
  // the velvet: vertical folds, lit from the front, with the highlight moving a little as the cloth breathes
  if (drop > 0) { const bot = Math.min(drop, full);
    for (let x = 0; x < w; x += 4) { const X = sx + x; if (X > VW || X < -4) continue; const f = (((x >> 2) + ((Math.sin(time * 0.8 + x * 0.05) * 0.6) | 0)) % 6 + 6) % 6, hem = ((x >> 2) & 1) * 2;
      g.fillStyle = foldCol[f]; g.fillRect(X, sy, 4, bot + hem); g.fillStyle = foldCol[(f + 1) % 6]; g.fillRect(X + 3, sy, 1, bot + hem); }
    const gr = g.createLinearGradient(0, sy, 0, sy + bot); gr.addColorStop(0, 'rgba(20,0,8,0.5)'); gr.addColorStop(0.3, 'rgba(20,0,8,0)'); gr.addColorStop(1, 'rgba(255,120,120,0.12)'); g.fillStyle = gr; g.fillRect(sx, sy, w, bot);
    g.fillStyle = TH.brass2; g.fillRect(sx, sy + bot, w, 2); g.fillStyle = TH.brass4; g.fillRect(sx, sy + bot, w, 1);                                                    // the gold hem
    for (let x = 0; x < w; x += 6) { g.fillStyle = TH.brass1; g.fillRect(sx + x, sy + bot + 2, 1, 3 + ((x / 6) & 1)); g.fillStyle = TH.brass3; g.fillRect(sx + x, sy + bot + 5 + ((x / 6) & 1) - 1, 1, 1); }   // the fringe
  }
  // the valance and swags, always: the curtain gathered at the top when it is up
  const vh = gather; g.fillStyle = TH.ox0; g.fillRect(sx, sy - 2, w, vh + 2); g.fillStyle = TH.ox1; g.fillRect(sx, sy, w, vh - 2);
  for (let x = 0; x < w; x += 32) { fillPoly(g, [[sx + x, sy], [sx + x + 32, sy], [sx + x + 30, sy + vh - 2], [sx + x + 16, sy + vh + 4], [sx + x + 2, sy + vh - 2]], TH.ox2); fillPoly(g, [[sx + x + 2, sy + 1], [sx + x + 30, sy + 1], [sx + x + 28, sy + 4], [sx + x + 16, sy + vh + 1], [sx + x + 4, sy + 4]], TH.ox3);
    g.fillStyle = TH.brass2; g.fillRect(sx + x + 15, sy + vh + 4, 2, 4); g.fillStyle = TH.brass3; g.fillRect(sx + x + 14, sy + vh + 8, 4, 3); }
  g.fillStyle = TH.brass2; g.fillRect(sx, sy - 3, w, 2); g.fillStyle = TH.brass4; g.fillRect(sx, sy - 3, w, 1);
  // the proscenium: gilt pilasters down both edges, and lit above the stage so the red reads from the fly floor
  for (const px0 of [sx - 2, sx + w - 6]) { g.fillStyle = TH.brass0; g.fillRect(px0, sy - 3, 8, full + 3); g.fillStyle = TH.brass2; g.fillRect(px0 + 1, sy - 3, 2, full + 3); g.fillStyle = TH.brass4; g.fillRect(px0 + 1, sy - 3, 1, full + 3); g.fillStyle = TH.brass1; for (let y = sy + 8; y < sy + full; y += 12) g.fillRect(px0, y, 8, 2); }
  if (drop > full * 0.5) { g.save(); g.globalCompositeOperation = 'lighter'; glowAt(g, sx + w / 2, sy + 6, Math.min(240, w * 0.5), '255,60,60', 0.09); g.restore(); }
}
function drawFootlights(g, st, cx, cy, VW, time) {
  const [x0, x1, y0, y1] = st.show.curtain, y = (y1 + 1) * TS - cy - 4, on = st.show.on; if ((x0 * TS - cx) > VW + 20 || (x1 + 1) * TS - cx < -20) return;
  for (let x = x0 * TS + 8; x < (x1 + 1) * TS - 8; x += 24) { const X = Math.round(x - cx); if (X < -8 || X > VW + 8) continue;
    g.fillStyle = TH.brass1; g.fillRect(X - 4, y + 1, 9, 3); g.fillStyle = TH.brass3; g.fillRect(X - 4, y + 1, 9, 1); g.fillStyle = on ? '#fff2b0' : '#5a5040'; g.fillRect(X - 2, y - 1, 5, 2);
    if (on) { g.globalAlpha = 0.5 + 0.1 * Math.sin(time * 9 + x); glowAt(g, X, y - 2, 12, '255,220,140', 0.5); g.globalAlpha = 1; } }
}

// ------------------------------------------------------------ strings, the glimpse, the boxes' audience
function drawStrings(g, st, H, cx, cy, VW, time) {
  if (!st.show.on) return;
  for (const e of H.enemies()) { if (!e.alive || e.t !== 'mummer' || !e.cast) continue; const x = Math.round(e.x - cx), yT = Math.round(17 * TS - cy), yB = Math.round(e.y - (e.h || 22) - cy); if (x < -10 || x > VW + 10) continue;
    const hot = st.show.jerkE === e && st.show.jerkAt; g.globalAlpha = hot ? 0.6 + 0.4 * Math.sin(time * 30) : 0.34; g.fillStyle = hot ? '#ffffff' : '#e8e0d0'; g.fillRect(x - 3, yT, 1, yB - yT); g.fillRect(x + 3, yT, 1, yB - yT + 4); g.fillRect(x, yT, 1, yB - yT - 2);
    g.globalAlpha = 0.9; g.fillStyle = TH.iron2; g.fillRect(x - 5, yT - 1, 11, 2); g.globalAlpha = 1; }   // his strings, and the control bar they hang from
}
function drawGlimpse(g, st, cx, cy) {
  const D = st.data || {}; if (!(st.glimpse && st.glimpse.t > 0 && D.glimpse)) return; const G = D.glimpse, x = Math.round(G.x * TS - cx), y = Math.round(G.y * TS - cy), a = Math.min(1, st.glimpse.t / 0.6, (2.4 - st.glimpse.t) / 0.4);
  g.globalAlpha = 0.9 * a; g.fillStyle = '#0a060e'; fillPoly(g, [[x - 4, y], [x - 3, y - 26], [x + 3, y - 26], [x + 4, y]], '#0a060e'); g.fillRect(x - 3, y - 34, 7, 8); g.fillRect(x - 5, y - 38, 11, 2); g.fillRect(x - 3, y - 44, 7, 6);   // a long coat, a high hat
  g.fillRect(x - 16, y - 28, 33, 2); g.fillStyle = '#c8c0b0'; for (const d of [-14, -8, -2, 4, 10, 15]) g.fillRect(x + d, y - 26, 1, 24); g.fillStyle = '#ff4030'; g.fillRect(x - 2, y - 31, 2, 1); g.fillRect(x + 1, y - 31, 2, 1);   // the cross-bar in his hands, the strings
  g.fillStyle = '#e8e0d0'; g.fillRect(x - 1, y - 30, 3, 3); g.globalAlpha = 1;
}
function drawAudience(g, st, cx, cy, VW) {
  const D = st.data || {}, n = st.show.on ? 1 + (st.show.act || 1) : 1;
  for (const bx of D.boxes || []) { const bxx = Math.round(bx[0] * TS - cx), by = Math.round(bx[1] * TS - cy); if (bxx < -40 || bxx > VW + 60) continue;
    for (let i = 0; i < n; i++) { const x = bxx + 8 + i * 15, seed = i * 7 + bx[0], face = seed % 3;
      g.fillStyle = '#160c1c'; g.fillRect(x - 5, by - 10, 11, 10); g.fillStyle = '#241430'; g.fillRect(x - 5, by - 10, 3, 10);                                   // a shoulder in evening black
      g.fillStyle = '#e8e0d0'; g.fillRect(x - 3, by - 17, 7, 7); g.fillStyle = '#0a060e'; g.fillRect(x - 2, by - 15, 2, 2); g.fillRect(x + 1, by - 15, 2, 2); g.fillStyle = face === 0 ? TH.ox2 : face === 1 ? TH.brass2 : '#4a6ab0'; g.fillRect(x - 3, by - 17, 7, 1); g.fillRect(x - 1, by - 12, 3, 1);   // a porcelain mask
      if (st.show.on && (seed + ((st.clock * 2) | 0)) % 5 === 0) { g.fillStyle = TH.brass3; g.fillRect(x + 4, by - 15, 2, 2); }                                     // an opera glass catching the light
    }
    g.fillStyle = TH.brass2; g.fillRect(bxx, by, 64, 2); g.fillStyle = TH.ox1; g.fillRect(bxx + 1, by + 2, 62, 5); g.fillStyle = TH.brass1; g.fillRect(bxx, by + 7, 64, 1);   // the box front, over them
  }
}

// ------------------------------------------------------------ THE SCENE
const DECO = new Set(['mirror', 'wardrobe', 'seats', 'stands', 'rack', 'props']);
function drawDeco(g, e, x, y) {
  const v = e.v ? 1 : 0;
  if (e.kind === 'mirror') { const s = mirror(v); g.drawImage(s, x - 13, y - s.height + 2); glowAt(g, x, y - 20, 24, '255,220,150', 0.16); }
  else if (e.kind === 'wardrobe') { const s = wardrobe(); g.drawImage(s, x - 16, y - s.height + 1); }
  else if (e.kind === 'seats') { for (let k = 0; k < 3; k++) g.drawImage(seat(k === 1 ? v : 0), x - 24 + k * 16, y - 22); }
  else if (e.kind === 'stands') { const s = stand(v); g.drawImage(s, x - 10, y - s.height); }
  else if (e.kind === 'rack') { const s = rack(v); g.drawImage(s, x - 16, y - s.height + 1); }
  else if (e.kind === 'props') { const s = props(v); g.drawImage(s, x - 15, y - s.height + 1); }
}
export function drawScene(st, g, H, cx, cy, VW, VH, time) {
  const L = H.L();
  drawBeamsAndPools(g, st, cx, cy, VW, VH, time);
  drawFlats(g, st, cx, cy, VW, VH, time);
  drawTraps(g, st, cx, cy, time);
  for (const e of L.ents) { if (e.t !== 'deco' || !DECO.has(e.kind)) continue; const x = Math.round(e.x * TS + 8 - cx), y = Math.round((e.y + 1) * TS - cy); if (x < -50 || x > VW + 50 || y < -60 || y > VH + 60) continue; drawDeco(g, e, x, y); }
  for (const pr of st.props) { const x = Math.round(pr.x - cx), y = Math.round(pr.y - cy); if (x < -24 || x > VW + 24 || y < -50 || y > VH + 50) continue; const fl = pr.flash > 0;
    if (pr.t === 'spotlamp') drawLamp(g, st, pr, cx, cy, time);
    else if (pr.t === 'flylock') { const ln = pr.line !== undefined ? st.lines.find(l => l.id === pr.line) : null, f = pr.flat !== undefined ? st.flats[pr.flat] : null, out = ln ? ln.out : !!(f && f.to === f.b), col = ln ? lineCol(pr.line) : '#e8e0c8';
      g.drawImage(ropeLock(out), x - 7, y - 30); g.fillStyle = col; g.fillRect(x - 4, y - 25, 3, 5); g.fillRect(x + 2, y - 25, 3, 5); if (fl) { g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.fillRect(x - 6, y - 20, 12, 8); g.globalAlpha = 1; } }
    else if (pr.t === 'cuelever') { g.drawImage(desk(), x - 12, y - 20); g.fillStyle = st.show.hold ? '#ff6b4a' : '#8fd160'; g.fillRect(x + 6, y - 22, 3, 3); glowAt(g, x + 7, y - 20, 12, st.show.hold ? '255,107,74' : '143,209,96', 0.35); if (fl) { g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.fillRect(x - 10, y - 18, 20, 12); g.globalAlpha = 1; } }
    else { g.drawImage(winchBase(), x - 10, y - 18); const a = time * 3 + (st.flats[pr.flat] && st.flats[pr.flat].at !== st.flats[pr.flat].to ? time * 9 : 0); g.fillStyle = TH.brass3; g.fillRect(x + Math.round(Math.cos(a) * 6) - 1, y - 9 + Math.round(Math.sin(a) * 6), 3, 3); g.fillStyle = TH.iron4; g.fillRect(x - 1, y - 10, 2, 2); if (fl) { g.globalAlpha = 0.6; g.fillStyle = '#fff'; g.fillRect(x - 9, y - 17, 18, 16); g.globalAlpha = 1; } }
  }
  for (const sd of st.shadows) { const k = 1 - sd.t / 1.0, x = Math.round(sd.x - cx), y = Math.round(sd.y - cy); g.globalAlpha = 0.35 + 0.5 * k; g.fillStyle = '#1a0a10'; g.beginPath(); g.ellipse(x, y - 1, 6 + 9 * k, 2 + k, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(time * 16)); g.strokeStyle = '#ff4a2a'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 8 + 9 * k, 3 + k, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }   // the sandbag's shadow, ringed red
  for (const sk of st.sacks) { const x = Math.round(sk.x - cx), y = Math.round(sk.y - cy); g.fillStyle = TH.rope; g.fillRect(x, y - 64, 1, 50); g.drawImage(sack(), x - 12, y - 16, 24, 14); }
  drawFootlights(g, st, cx, cy, VW, time);
  drawStrings(g, st, H, cx, cy, VW, time);
  drawAudience(g, st, cx, cy, VW);
  drawGlimpse(g, st, cx, cy);
  drawCurtain(g, st, cx, cy, VW, VH, time);
}

// ------------------------------------------------------------ OVER THE ACTORS: the light on whoever stands in it
export function drawFront(st, g, H, cx, cy, VW, VH, time, litAt) {
  for (const s of st.spots) { if (s.off || !s.clear) continue; const p = TR.poolOf(s); if (p.x < cx - 80 || p.x > cx + VW + 80) continue;
    g.save(); g.globalCompositeOperation = 'lighter'; const px0 = p.x - cx, py0 = p.y - cy;   // the pool's light falls on the bodies in it, not only on the boards
    const pg = g.createRadialGradient(px0, py0 - 12, 0, px0, py0 - 12, p.r); pg.addColorStop(0, 'rgba(255,240,180,0.20)'); pg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = pg; g.fillRect(px0 - p.r, py0 - 36, p.r * 2, 40); g.restore(); }
  const P = H.hero();
  if (P && !P.dead && litAt(P.x, P.y)) {   // the hero is SEEN: a cream rim at his feet and a watching eye over his head
    const x = Math.round(P.x - cx), y = Math.round(P.y - cy), b = Math.sin(time * 6) * 1;
    g.save(); g.strokeStyle = 'rgba(255,248,210,0.9)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 12, 3, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    const ey = Math.round(y - (P.h || 22) - 12 + b);
    g.fillStyle = '#120a18'; g.fillRect(x - 7, ey - 4, 15, 9); g.fillStyle = TH.brass2; g.fillRect(x - 8, ey - 5, 17, 1); g.fillRect(x - 8, ey + 5, 17, 1); g.fillRect(x - 8, ey - 4, 1, 9); g.fillRect(x + 8, ey - 4, 1, 9);
    g.fillStyle = '#fff8dc'; g.fillRect(x - 5, ey - 1, 11, 3); g.fillRect(x - 3, ey - 2, 7, 5); g.fillStyle = '#c02a30'; g.fillRect(x - 1, ey - 1, 3, 3); g.fillStyle = '#000'; g.fillRect(x, ey, 1, 1);
    for (let k = -1; k <= 1; k++) { g.fillStyle = TH.brass3; g.fillRect(x + k * 4, ey - 8 - (k === 0 ? 1 : 0), 1, 2); }
  }
  for (const e of H.enemies()) { if (!e.alive || e.t !== 'mummer') continue; if (Math.abs(e.x - cx - VW / 2) > VW / 2 + 20) continue;
    if (litAt(e.x, e.y)) { const x = Math.round(e.x - cx), y = Math.round(e.y - cy); g.save(); g.strokeStyle = 'rgba(255,248,210,0.85)'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, 10, 2.5, 0, 0, Math.PI * 2); g.stroke(); g.restore();   // a caught mummer stands in a ring of light
      g.fillStyle = 'rgba(255,248,210,0.9)'; g.fillRect(x - 1, y - (e.h || 30) - 5, 3, 3); } }
}
