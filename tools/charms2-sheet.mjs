// tools/charms2-sheet.mjs - THE CHARM ICON SHEET, node only (claude/charms2): the six charms in the shop today (top row) and the eight new ones (bottom row),
// drawn by src/art.js bakeCharms through a tiny canvas stand-in (fillRect / getImageData: all px.js asks for), so no browser is started.
//   node tools/charms2-sheet.mjs [out.png]      (default work/claude/charms2-icons.png)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { deflateSync } from 'node:zlib';

/* ---- a canvas that keeps RGBA and does fillRect / getImageData / setTransform ---- */
const parse = c => { const m = /^#([0-9a-f]{6})$/i.exec(c); if (!m) throw new Error('colour ' + c); const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
class Ctx2D {
  constructor(c) { this.c = c; this.fillStyle = '#000000'; }
  setTransform() {}
  fillRect(x, y, w, h) { const [r, g, b] = parse(this.fillStyle), W = this.c.width, H = this.c.height, d = this.c.data;
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) { const o = (j * W + i) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255; } }
  getImageData(x, y, w, h) { return { data: this.c.data, width: w, height: h }; }
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1, data: null, getContext() { if (!this.data || this.data.length !== this.width * this.height * 4) this.data = new Uint8ClampedArray(this.width * this.height * 4); return this.ctx || (this.ctx = new Ctx2D(this)); } }; return c; } };

const ART = await import('../src/art.js');
const icons = ART.bakeCharms();
const BASE = ['lucky', 'iron', 'feather', 'heart', 'swift'], NEW = ['thorn', 'stone', 'hound', 'gambler', 'salt', 'quiet', 'lantern', 'pilgrim'];
for (const id of BASE.concat(NEW)) { const c = icons[id]; if (!c || c.width !== 10 || c.height !== 12) throw new Error('icon ' + id + ' missing or not 10x12'); c.getContext('2d'); }

/* ---- the sheet: 10x12 icons at x8 on a store-dark panel, base row then new row ---- */
const S = 8, CELL = 14 * S, PAD = 2 * S, cols = NEW.length, W = cols * CELL + PAD * 2, H = 2 * CELL + PAD * 2 + 4 * S;
const px = new Uint8Array(W * H * 4); for (let i = 0; i < W * H; i++) { px[i * 4] = 0x24; px[i * 4 + 1] = 0x1e; px[i * 4 + 2] = 0x32; px[i * 4 + 3] = 255; }
const blit = (c, ox, oy) => { c.getContext('2d'); const d = c.data; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const o = (y * c.width + x) * 4; if (!d[o + 3]) continue;
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const p = ((oy + y * S + j) * W + ox + x * S + i) * 4; px[p] = d[o]; px[p + 1] = d[o + 1]; px[p + 2] = d[o + 2]; px[p + 3] = 255; } } };
BASE.forEach((id, i) => blit(icons[id], PAD + i * CELL + 2 * S, PAD + 2 * S));
NEW.forEach((id, i) => blit(icons[id], PAD + i * CELL + 2 * S, PAD + CELL + 4 * S + 2 * S));

/* ---- PNG ---- */
const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(t), data]), cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([len, td, cc]); };
const raw = Buffer.alloc((W * 4 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const out = process.argv[2] || 'work/claude/charms2-icons.png'; mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('charms2-sheet: ' + (BASE.length + NEW.length) + ' icons -> ' + out + ' (' + W + 'x' + H + ')');
