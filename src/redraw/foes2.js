// draft
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(whiten), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const blank = (w, h) => Array.from({ length: h }, () => Array(w).fill('.'));
const stamp = (G, x, y, rows) => rows.forEach((r, j) => { const row = G[y + j]; if (!row) return; for (let i = 0; i < r.length; i++) { const k = r[i], xx = x + i; if (k === '.' || xx < 0 || xx >= row.length) continue; row[xx] = k === ' ' ? '.' : k; } });
const rowsOf = G => G.map(r => r.join(''));

// ---------- grub ----------
export function bakeGrub() {
  const P = { o: OUT, w: '#e6f4c8', b: '#a8c888', B: '#789a5e', u: '#56704a', y: '#eaff8a', Y: '#ffffe0', g: '#c8e070',
    k: '#f0cc80', h: '#c89048', H: '#7a4e26', m: '#3a2214', M: '#e8dcc0', l: '#3a2e22', a: '#c8ff3a', A: '#7ab820' };
  const q = rows => outline(fromGrid(rows, P, 1), OUT);
  const E = '................';
  const crawl1 = q([E, E, E, E,
    '...wwB.wwB.ww...',
    '..wbbbBbbbBbbkh.',
    '.wbbyygyYgybkhhh',
    'wbbyYYgYYYgbhhoH',
    'uBbbyygyyybBHhHm',
    '.ul.uu.uu.ul.mMa']);
  const crawl2 = q([E, E, E,
    '....wwB.wwB.....',
    '...wbbbBbbbBkh..',
    '..wbbyygyybkhhh.',
    '..bbyYYgYYgbhhoH',
    '..bbyYYgYYgbHhHm',
    '..uBbyygyybBuHmM',
    '...ul.uu.ul...a.']);
  const spit = q([
    '..........khhh..',
    '.........khhoHmM',
    '........bhhhHoa.',
    '.......wbHhHoo.a',
    '.......wbyHHmM..',
    '......wbyYgB....',
    '.....wbyYYgB...A',
    '...wwbgyYYgb....',
    '.wbbyygyyygB....',
    'uBul.uu.ul.u....']);
  return pack([crawl1, crawl2, spit], 8, 10, 14, 7);
}

// ---------- drone ----------
export function bakeDrone() {
  const P = { o: OUT, w: '#fbf6ff', t: '#e0d4ec', T: '#b4a4c8', L: '#9a88b4', v: '#8a64b4', V: '#4a2a6a', p: '#d88aa8', s: '#c8bcb0' };
  const q = rows => outline(fromGrid(rows, P, 1), OUT);
  const mid = q([
    '....wwtt....',
    '..wwttsttT..',
    '.wttttttttT.',
    '.wttLLttLLT.',
    '.ttto.ttotT.',
    '.tttttpttTT.',
    '.TTttttTTTT.',
    'vVvVvVvVvVvV',
    '.v.V.v.V.v..',
    '............']);
  return pack([mid, mid, mid, mid], 7, 11, 9, 7);
}

// ---------- great hound ----------
export function bakeGreatHound() {
  const P = { o: OUT, h: '#5a4a3a' };
  const q = rows => outline(fromGrid(rows, P, 1), OUT);
  const G = blank(40, 22); stamp(G, 4, 6, ['hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh']);
  const f = q(rowsOf(G));
  return pack([f, f, f, f, f, f, f], 21, 22, 30, 16);
}

// ---------- troll ----------
export function bakeTroll() {
  const P = { o: OUT, t: '#7a8272' };
  const q = rows => outline(fromGrid(rows, P, 1), OUT);
  const G = blank(28, 24); stamp(G, 4, 6, ['tttttttttttttt']);
  const f = q(rowsOf(G));
  return pack([f, f, f, f, f], 13, 25, 18, 21);
}
