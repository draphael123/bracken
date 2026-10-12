// tools/make-icons.mjs - THE GAME'S ICONS from one pixel B (claude/shipfix): a steel B with a red knight's plume on a dark ground, a gilt frame and
// bracken fronds at its foot - the hero palette, not a plain yellow letter. Writes favicon.ico (16 + 32, PNG-in-ICO) and icons/*.png (192, 512,
// maskable 512, apple-touch 180). No dependencies: its own PNG writer over zlib.   node tools/make-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url)), G = 32;
const C = { bg: '#0b1410', frame: '#e0b040', frameIn: '#5c3a1d', out: '#14101e', steel: '#c9d1dc', shade: '#7a8494', gold: '#ffd36b', plume: '#c9463d', plumeHi: '#e8695c', fern: '#8fd160', fernDk: '#4a7a30' };
const B = ['XXXXXXXX...', 'XXXXXXXXX..', 'XX....XXX..', 'XX.....XX..', 'XX....XXX..', 'XXXXXXXX...', 'XXXXXXXX...', 'XX....XXX..', 'XX.....XXX.', 'XX.....XXX.', 'XX....XXX..', 'XXXXXXXXX..', 'XXXXXXXX...'];
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const grid = Array.from({ length: G }, () => Array(G).fill(null));
const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < G && y < G) grid[y][x] = c; };
const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
rect(0, 0, G, G, C.bg);
for (let i = 1; i < G - 1; i++) for (const [x, y] of [[i, 1], [i, G - 2], [1, i], [G - 2, i]]) put(x, y, C.frame);
for (let i = 2; i < G - 2; i++) for (const [x, y] of [[i, 2], [i, G - 3], [2, i], [G - 3, i]]) put(x, y, C.frameIn);
const bx = 10, by = 8, ink = [];
B.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') ink.push([bx + i, by + j]); }));
const has = (x, y) => ink.some(([a, b]) => a === x && b === y);
for (const [x, y] of ink) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) if (!has(x + dx, y + dy)) put(x + dx, y + dy, C.out);
for (const [x, y] of ink) put(x, y, !has(x + 1, y) || !has(x, y + 1) ? C.shade : (x - bx < 1 || y - by < 1 ? C.gold : C.steel));
/* the plume on top of the B's bowl: three red pixels and a lit one */
rect(bx + 1, by - 3, 4, 2, C.plume); put(bx + 5, by - 3, C.plume); put(bx + 2, by - 4, C.plume); put(bx + 3, by - 4, C.plumeHi); put(bx + 1, by - 2, C.plumeHi);
for (let i = 5; i < 27; i += 3) { put(i, 25, C.fern); put(i + 1, 24, C.fern); put(i + 1, 25, C.fernDk); put(i, 26, C.fernDk); put(i + 2, 25, C.fernDk); }

/* the PNG */
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const o = Buffer.alloc(12 + d.length); o.writeUInt32BE(d.length, 0); o.write(t, 4, 'ascii'); d.copy(o, 8); o.writeUInt32BE(crc(o.subarray(4, 8 + d.length)), 8 + d.length); return o; };
function png(size, pad = 0) {   /* nearest-neighbour scale of the grid; pad: the fraction of the edge the art keeps clear (the maskable icon's safe zone) */
  const raw = Buffer.alloc((size * 3 + 1) * size), art = Math.round(size * (1 - 2 * pad)), off = Math.round(size * pad), bg = rgb(C.bg);
  for (let y = 0; y < size; y++) { raw[y * (size * 3 + 1)] = 0; for (let x = 0; x < size; x++) {
    const ax = x - off, ay = y - off, inArt = ax >= 0 && ay >= 0 && ax < art && ay < art, cell = inArt ? grid[Math.floor(ay * G / art)][Math.floor(ax * G / art)] : null, p = cell ? rgb(cell) : bg;
    raw.set(p, y * (size * 3 + 1) + 1 + x * 3); } }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(size, 0); ih.writeUInt32BE(size, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const ico = sizes => { const imgs = sizes.map(s => png(s)), head = Buffer.alloc(6 + 16 * sizes.length); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let off = head.length; imgs.forEach((im, i) => { const e = 6 + 16 * i; head[e] = sizes[i] % 256; head[e + 1] = sizes[i] % 256; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(24, e + 6); head.writeUInt32LE(im.length, e + 8); head.writeUInt32LE(off, e + 12); off += im.length; });
  return Buffer.concat([head, ...imgs]); };
writeFileSync(join(ROOT, 'favicon.ico'), ico([16, 32, 48]));
writeFileSync(join(ROOT, 'icons/icon-192.png'), png(192)); writeFileSync(join(ROOT, 'icons/icon-512.png'), png(512));
writeFileSync(join(ROOT, 'icons/icon-maskable-512.png'), png(512, 0.1)); writeFileSync(join(ROOT, 'icons/apple-touch-icon-180.png'), png(180));
writeFileSync(join(ROOT, 'icons/favicon-32.png'), png(32));
console.log('wrote favicon.ico (16/32/48), icons/icon-192, icon-512, icon-maskable-512, apple-touch-icon-180, favicon-32');
