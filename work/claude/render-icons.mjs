// work/claude/render-icons.mjs — the contact sheet for ART.bakeMapIcons(): every icon at 1x and 4x with its
// level's name under it, for Daniel to look at and veto BEFORE they're wired into the map. Not part of the
// check suite. usage: node work/claude/render-icons.mjs
import { install, newCanvas, savePNG } from '../../tools/node-canvas.mjs';
import * as ART from '../../src/art.js';
install();

// 5x7 dot-matrix font, A-Z + space + apostrophe, for THIS CONTACT SHEET ONLY (not shipped in the game)
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'], F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'], H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'], J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'], P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'], R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'], V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'], X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'], Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  APOS: ['00100', '00100', '00000', '00000', '00000', '00000', '00000'], SPACE: ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
function glyphFor(ch) { if (ch === ' ') return FONT.SPACE; if (ch === "'") return FONT.APOS; return FONT[ch] || FONT.SPACE; }
function textWidth(s, scale) { return s.length * 6 * scale - scale; }
function drawText(g, s, x, y, scale, col) {
  g.fillStyle = col; let cx = x;
  for (const ch of s) { const glyph = glyphFor(ch); for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (glyph[r][c] === '1') g.fillRect(cx + c * scale, y + r * scale, scale, scale); cx += 6 * scale; }
}

// every node currently on the map, id -> display name (matches NODES[].name in src/main.js)
const NODES = [
  ['wood', 'BRACKEN WOOD'], ['store', 'THE STORE'], ['marsh', 'MARSH WOOD'], ['stockade', 'THE STOCKADE'],
  ['burning', 'THE BURNING VILLAGE'], ['spore', 'SPOREWOOD'], ['kings', 'KINGSWOOD'], ['underleaf', 'UNDERLEAF'],
  ['scree', 'THE SCREE PATH'], ['hanging', 'THE HANGING VILLAGE'], ['highstore', 'THE HIGH STORE'], ['spire', 'THE SUNSPIRE'],
  ['moor', 'GALE MOOR'], ['storm', 'STORMHOLD'], ['oreroad', 'THE ORE ROAD'], ['crown', 'HIGHCROWN'], ['undercrown', 'THE UNDERCROWN'],
  ['longwater', 'THE LONG WATER'], ['reef', 'THE SHIPWRECK REEF'], ['chandler', 'THE CHANDLER'], ['flotilla', 'THE FLOTILLA'],
  ['hurricane', 'THE HURRICANE DECK'], ['lamplit', 'THE LAMPLIT STREET'], ['deep', 'THE DEEP'], ['keep', 'THE UNDERWATER KEEP'],
  ['causeway', 'THE DROWNED CAUSEWAY'], ['waymeet', 'WAYMEET'], ['fields', 'THE HEXED FIELDS'], ['burial', 'THE BURIAL CAVERNS'],
  ['witchlight', 'THE WITCHLIGHT STAIR'], ['mage', "THE MAGE'S FOLLY"], ['fallingtower', 'THE FALLING TOWER'], ['unburied', 'THE UNBURIED FIELD'],
];

const ICONS = ART.bakeMapIcons();
const missing = NODES.filter(([id]) => !ICONS[id]);
if (missing.length) { console.log('MISSING ICONS:', missing.map(m => m[0])); process.exit(1); }

const COLS = 6, CELL_W = 120, CELL_H = 100, PAD = 10;
const rows = Math.ceil(NODES.length / COLS);
const W = COLS * CELL_W + PAD * 2, H = rows * CELL_H + PAD * 2;
const canvas = newCanvas(W, H), g = canvas.getContext('2d');
g.fillStyle = '#1b1626'; g.fillRect(0, 0, W, H);

NODES.forEach(([id, name], i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x0 = PAD + col * CELL_W, y0 = PAD + row * CELL_H;
  g.fillStyle = '#3a2a18'; g.fillRect(x0 + 4, y0 + 4, CELL_W - 8, CELL_H - 34);
  const icon = ICONS[id]; // 9x9, outlined -> 11x11
  g.drawImage(icon, x0 + 8, y0 + 8, icon.width, icon.height);
  drawText(g, '1X', x0 + 8 + icon.width + 4, y0 + 8, 1, '#8a8378');
  const big = icon.width * 4;
  g.drawImage(icon, x0 + CELL_W - big - 10, y0 + 8, big, big);
  const words = name.split(' '); let line = '', lines = [];
  for (const w of words) { const t = line ? line + ' ' + w : w; if (textWidth(t, 1) > CELL_W - 12 && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  lines.forEach((l, li) => drawText(g, l, x0 + 6, y0 + CELL_H - 28 + li * 9, 1, '#e8dcc0'));
});

savePNG(canvas, new URL('../../docs/map-icons.png', import.meta.url));
console.log('wrote docs/map-icons.png', W, 'x', H, '-', NODES.length, 'icons');
