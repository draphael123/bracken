// tools/title-mark-build.mjs - rebuilds assets/ui/title-mark.png from Daniel's logo (assets/ui/title-mark-original.webp, 11-08).
// The webp is an upscaled pixel-art picture whose grid is not perfectly even (blocks run ~12-14.5 px), so it is cut into cells of --cell source px (from the
// top-left of the logo), each cell takes the MOST COMMON colour in it (never an average: no new in-between colours), and the alpha is on/off.
// Decoding the webp needs ffmpeg on PATH (Node has no webp decoder); the PNG it writes is plain RGBA that the game loads.
// usage: node tools/title-mark-build.mjs [--cell 10] [--src path.webp] [--out path.png]
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const a = process.argv.slice(2), at = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const CELL = +at('--cell', 10), SRC = resolve(at('--src', join(ROOT, 'assets/ui/title-mark-original.webp'))), OUT = resolve(at('--out', join(ROOT, 'assets/ui/title-mark.png')));

export function decodeWebp(file) {
  const dir = mkdtempSync(join(tmpdir(), 'tm-')), raw = join(dir, 'raw.rgba');
  try {
    const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).toString().trim().split(',').map(Number);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-frames:v', '1', raw]);
    return { w: probe[0], h: probe[1], data: readFileSync(raw) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = b => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
export function encodePng(w, h, rgba) {
  const chunk = (t, d) => { const o = Buffer.alloc(12 + d.length); o.writeUInt32BE(d.length, 0); o.write(t, 4, 'latin1'); d.copy(o, 8); o.writeUInt32BE(crc(o.subarray(4, 8 + d.length)), 8 + d.length); return o; };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
export function cutMark(img, cell) {
  const { w: W, h: H, data } = img;
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] >= 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const cw = Math.ceil((x1 - x0 + 1) / cell), ch = Math.ceil((y1 - y0 + 1) / cell), out = Buffer.alloc(cw * ch * 4);
  for (let cy = 0; cy < ch; cy++) for (let cx = 0; cx < cw; cx++) {
    const votes = new Map(); let solid = 0, n = 0;
    const xa = Math.round(x0 + cx * cell), xb = Math.min(W, Math.round(x0 + (cx + 1) * cell)), ya = Math.round(y0 + cy * cell), yb = Math.min(H, Math.round(y0 + (cy + 1) * cell));
    for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) {
      const i = (y * W + x) * 4; n++; if (data[i + 3] < 128) continue; solid++;
      const k = (data[i] >> 4) << 8 | (data[i + 1] >> 4) << 4 | data[i + 2] >> 4, v = votes.get(k) || { c: 0, r: 0, g: 0, b: 0 }; v.c++; v.r += data[i]; v.g += data[i + 1]; v.b += data[i + 2]; votes.set(k, v);
    }
    if (solid * 2 < n) continue;   /* mostly empty: stays clear */
    let top = null; for (const v of votes.values()) if (!top || v.c > top.c) top = v;
    const o = (cy * cw + cx) * 4; out[o] = Math.round(top.r / top.c); out[o + 1] = Math.round(top.g / top.c); out[o + 2] = Math.round(top.b / top.c); out[o + 3] = 255;
  }
  return { w: cw, h: ch, rgba: out };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const m = cutMark(decodeWebp(SRC), CELL); writeFileSync(OUT, encodePng(m.w, m.h, m.rgba)); console.log('title-mark: ' + m.w + 'x' + m.h + ' (cell ' + CELL + ') -> ' + OUT);
}
