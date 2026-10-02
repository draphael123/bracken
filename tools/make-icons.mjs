// tools/make-icons.mjs - the installable app's icons (icons/*.png), drawn in code so the repo needs no art download.
//   node tools/make-icons.mjs        writes icon-192, icon-512, icon-maskable-512 and apple-touch-icon-180
// A pixel "B" in gold on the wood's dark green, framed like the title board; the maskable one keeps the letter inside the safe 80%.
import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = new URL('../icons/', import.meta.url);
const B = ['#####.', '##..##', '##..##', '#####.', '##..##', '##..##', '##..##', '#####.'];   // a 6x8 pixel B
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (t, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(t, 4, 'latin1'); d.copy(b, 8); b.writeUInt32BE(crc32(b.subarray(4, 8 + d.length)) >>> 0, 8 + d.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function draw(n, safe) {
  const px = Buffer.alloc(n * n * 4), set = (x, y, c) => { if (x < 0 || y < 0 || x >= n || y >= n) return; const i = (y * n + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
  const rect = (x0, y0, w, h, c) => { for (let y = Math.round(y0); y < Math.round(y0 + h); y++) for (let x = Math.round(x0); x < Math.round(x0 + w); x++) set(x, y, c); };
  // the night wood: a dark green with a lighter band of canopy low in the frame
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const k = y / n; set(x, y, [Math.round(11 + 10 * k), Math.round(20 + 26 * k), Math.round(16 + 12 * k)]); }
  const cell = Math.floor(n * (safe ? 0.5 : 0.62) / 8), lw = cell * 8, lx = cell * 6, x0 = Math.floor((n - lx) / 2), y0 = Math.floor((n - lw) / 2) - Math.floor(cell * 0.2);
  if (!safe) { const f = Math.round(n * 0.045); rect(f, f, n - 2 * f, f, [201, 178, 124]); rect(f, n - 2 * f, n - 2 * f, f, [201, 178, 124]); rect(f, f, f, n - 2 * f, [201, 178, 124]); rect(n - 2 * f, f, f, n - 2 * f, [201, 178, 124]); }
  // three ferns along the foot, a sword's worth of green
  for (let i = 0; i < 7; i++) rect(x0 + i * cell * 0.88 - cell * 0.1, y0 + lw + cell * 0.55 - (i % 3) * cell * 0.18, cell * 0.8, cell * 0.5 + (i % 3) * cell * 0.18, i % 2 ? [74, 128, 62] : [143, 209, 96]);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) if (B[r][c] === '#') { rect(x0 + c * cell + cell * 0.18, y0 + r * cell + cell * 0.18, cell, cell, [58, 34, 20]); }
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) if (B[r][c] === '#') { rect(x0 + c * cell, y0 + r * cell, cell, cell, [255, 211, 107]); if (r === 0 || (r > 0 && B[r - 1][c] !== '#')) rect(x0 + c * cell, y0 + r * cell, cell, Math.max(1, cell * 0.2), [255, 240, 170]); }
  return png(n, n, px);
}
mkdirSync(OUT, { recursive: true });
for (const [name, n, safe] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true], ['apple-touch-icon-180.png', 180, false]]) { writeFileSync(new URL(name, OUT), draw(n, safe)); console.log('wrote icons/' + name); }
