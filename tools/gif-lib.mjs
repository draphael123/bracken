// tools/gif-lib.mjs - a dependency-free GIF89a encoder (the same one tools/warden-art-gif.mjs carries inline), exported so node-only sheet tools can write loops. NO browser.
import { Buffer } from 'node:buffer';

function lzw(idx, minBits) {   // GIF LZW
  const clear = 1 << minBits, eoi = clear + 1, bytes = []; let bits = 0, nb = 0, size = minBits + 1, next = eoi + 1, dict = new Map();
  const put = c => { bits |= c << nb; nb += size; while (nb >= 8) { bytes.push(bits & 255); bits >>= 8; nb -= 8; } };
  put(clear); let cur = idx[0];
  for (let i = 1; i < idx.length; i++) { const k = idx[i], key = cur * 4096 + k;
    if (dict.has(key)) cur = dict.get(key);
    else { put(cur); if (next < 4096) { dict.set(key, next++); if (next > (1 << size) && size < 12) size++; } else { put(clear); dict = new Map(); next = eoi + 1; size = minBits + 1; } cur = k; } }
  put(cur); put(eoi); if (nb > 0) bytes.push(bits & 255); return bytes;
}
export function gif(frames, w, h, delay) {   // frames: Uint8Array RGBA (w*h*4) each
  const pal = new Map(), q = v => v & 0xf8; let reduce = false;
  for (const f of frames) for (let i = 0; i < f.length; i += 4) { pal.set((f[i] << 16) | (f[i + 1] << 8) | f[i + 2], 0); if (pal.size > 255) { reduce = true; break; } }
  const key = (r, g, b) => reduce ? (q(r) << 16) | (q(g) << 8) | q(b) : (r << 16) | (g << 8) | b;
  const cols = new Map(); for (const f of frames) for (let i = 0; i < f.length; i += 4) { const k = key(f[i], f[i + 1], f[i + 2]); cols.set(k, (cols.get(k) || 0) + 1); }
  let list = [...cols.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 255); if (!list.length) list = [0];
  const index = new Map(list.map((c, i) => [c, i])), near = c => { let best = 0, bd = 1e9; const r = c >> 16, g = (c >> 8) & 255, b = c & 255;
    list.forEach((p, i) => { const d = (r - (p >> 16)) ** 2 + (g - ((p >> 8) & 255)) ** 2 + (b - (p & 255)) ** 2; if (d < bd) { bd = d; best = i; } }); return best; };
  const bitsN = Math.max(2, Math.ceil(Math.log2(list.length + 1))), tsize = 1 << bitsN;
  const b = [...Buffer.from('GIF89a'), w & 255, w >> 8, h & 255, h >> 8, 0x80 | (bitsN - 1), 0, 0];
  for (let i = 0; i < tsize; i++) { const c = list[i] ?? 0; b.push(c >> 16, (c >> 8) & 255, c & 255); }
  b.push(0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0'), 3, 1, 0, 0, 0);
  const cache = new Map();
  for (const f of frames) { const idx = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) { const k = key(f[i * 4], f[i * 4 + 1], f[i * 4 + 2]); let v = index.get(k); if (v === undefined) { v = cache.get(k); if (v === undefined) { v = near(k); cache.set(k, v); } } idx[i] = v; }
    b.push(0x21, 0xf9, 4, 0, delay & 255, delay >> 8, 0, 0, 0x2c, 0, 0, 0, 0, w & 255, w >> 8, h & 255, h >> 8, 0, bitsN);
    const data = lzw(idx, bitsN); for (let i = 0; i < data.length; i += 255) { const n = Math.min(255, data.length - i); b.push(n); for (let j = 0; j < n; j++) b.push(data[i + j]); } b.push(0); }
  b.push(0x3b); return Buffer.from(b);
}
