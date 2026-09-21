// tools/node-canvas.mjs — enough of a 2D canvas to run the px.js-style bakers in Node, with no browser and no npm package.
// Supports what px.js and the pixel bakers use: fillStyle (#rgb, #rrggbb, rgb(), rgba()), fillRect, clearRect,
// getImageData/putImageData, drawImage (canvas sources; 3, 5 and 9 argument forms, nearest-neighbour), globalAlpha,
// globalCompositeOperation 'source-over' | 'source-in' | 'destination-out', translate/scale/setTransform/save/restore
// (axis-aligned only: enough for flipX). Paths, gradients and text are NOT supported and throw, so a baker that needs
// them is caught rather than rendered wrong.
// install() puts a `document` on globalThis; sheet() lays canvases out on a labelled-free contact sheet; savePNG() writes one.
import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';

function parseColor(c) {
  if (typeof c !== 'string') return [255, 0, 255, 255];
  if (c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = h.split('').map(k => k + k).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255]; }
  const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(',').map(s => parseFloat(s)); return [p[0], p[1], p[2], p.length > 3 ? Math.round(p[3] * 255) : 255]; }
  throw new Error('node-canvas: colour not supported: ' + c);
}
class Ctx {
  constructor(cv) { this.cv = cv; this.fillStyle = '#000'; this.strokeStyle = '#000'; this.globalAlpha = 1; this.globalCompositeOperation = 'source-over'; this.imageSmoothingEnabled = false; this.lineWidth = 1; this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; }
  get data() { return this.cv._d; }
  _put(i, [r, g, b, a]) {   // one pixel, composited
    const d = this.data, k = i * 4, op = this.globalCompositeOperation, sa = (a / 255) * this.globalAlpha;
    if (op === 'destination-out') { d[k + 3] = Math.round(d[k + 3] * (1 - sa)); return; }
    if (op === 'source-in') { const da = d[k + 3] / 255; d[k] = r; d[k + 1] = g; d[k + 2] = b; d[k + 3] = Math.round(255 * sa * da); return; }
    const da = d[k + 3] / 255, oa = sa + da * (1 - sa); if (oa <= 0) return;
    d[k] = Math.round((r * sa + d[k] * da * (1 - sa)) / oa); d[k + 1] = Math.round((g * sa + d[k + 1] * da * (1 - sa)) / oa); d[k + 2] = Math.round((b * sa + d[k + 2] * da * (1 - sa)) / oa); d[k + 3] = Math.round(oa * 255);
  }
  _xf(x, y) { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  _rect(x, y, w, h, fn) {
    const [ax, ay] = this._xf(x, y), [bx, by] = this._xf(x + w, y + h);
    const x0 = Math.round(Math.min(ax, bx)), x1 = Math.round(Math.max(ax, bx)), y0 = Math.round(Math.min(ay, by)), y1 = Math.round(Math.max(ay, by));
    const W = this.cv.width, H = this.cv.height;
    for (let j = Math.max(0, y0); j < Math.min(H, y1); j++) for (let i = Math.max(0, x0); i < Math.min(W, x1); i++) fn(j * W + i, i, j);
  }
  fillRect(x, y, w, h) { const c = parseColor(this.fillStyle); if (this.globalCompositeOperation === 'source-in') { const d = this.data, W = this.cv.width, H = this.cv.height; const [ax, ay] = this._xf(x, y), [bx, by] = this._xf(x + w, y + h);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const inside = i >= Math.min(ax, bx) && i < Math.max(ax, bx) && j >= Math.min(ay, by) && j < Math.max(ay, by); if (inside) this._put(j * W + i, c); else d[(j * W + i) * 4 + 3] = 0; } return; }
    this._rect(x, y, w, h, i => this._put(i, c)); }
  clearRect(x, y, w, h) { this._rect(x, y, w, h, i => { this.data.fill(0, i * 4, i * 4 + 4); }); }
  getImageData(x, y, w, h) { const out = new Uint8ClampedArray(w * h * 4), W = this.cv.width;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const sx = x + i, sy = y + j; if (sx < 0 || sy < 0 || sx >= W || sy >= this.cv.height) continue; out.set(this.data.subarray((sy * W + sx) * 4, (sy * W + sx) * 4 + 4), (j * w + i) * 4); }
    return { width: w, height: h, data: out }; }
  createImageData(w, h) { return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }; }
  putImageData(img, x, y) { const W = this.cv.width; for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) { const dx = x + i, dy = y + j; if (dx < 0 || dy < 0 || dx >= W || dy >= this.cv.height) continue; this.data.set(img.data.subarray((j * img.width + i) * 4, (j * img.width + i) * 4 + 4), (dy * W + dx) * 4); } }
  drawImage(src, ...a) {
    let sx = 0, sy = 0, sw = src.width, sh = src.height, dx, dy, dw, dh;
    if (a.length === 2) { [dx, dy] = a; dw = sw; dh = sh; } else if (a.length === 4) { [dx, dy, dw, dh] = a; } else [sx, sy, sw, sh, dx, dy, dw, dh] = a;
    const sd = src._d; if (!sd) return;
    this._rect(dx, dy, dw, dh, (i, px, py) => {
      // back through the transform to the destination rect, then to the source
      const m = this.m, det = m[0] * m[3] - m[1] * m[2], X = px + 0.5 - m[4], Y = py + 0.5 - m[5];
      const ux = (m[3] * X - m[2] * Y) / det, uy = (-m[1] * X + m[0] * Y) / det;
      const tx = Math.floor(sx + (ux - dx) / dw * sw), ty = Math.floor(sy + (uy - dy) / dh * sh);
      if (tx < 0 || ty < 0 || tx >= src.width || ty >= src.height) return;
      const k = (ty * src.width + tx) * 4; if (sd[k + 3]) this._put(i, [sd[k], sd[k + 1], sd[k + 2], sd[k + 3]]); });
  }
  translate(x, y) { const m = this.m; m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; }
  scale(a, b) { const m = this.m; m[0] *= a; m[1] *= a; m[2] *= b; m[3] *= b; }
  setTransform(a, b, c, d, e, f) { this.m = [a, b, c, d, e, f]; }
  resetTransform() { this.m = [1, 0, 0, 1, 0, 0]; }
  save() { this.stack.push({ m: [...this.m], fillStyle: this.fillStyle, globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation }); }
  restore() { const s = this.stack.pop(); if (s) Object.assign(this, s); }
}
for (const k of ['beginPath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'fill', 'stroke', 'closePath', 'quadraticCurveTo', 'bezierCurveTo', 'createLinearGradient', 'createRadialGradient', 'fillText', 'rotate', 'measureText'])
  Ctx.prototype[k] = function () { throw new Error('node-canvas: ' + k + ' is not supported (keep bakers to px.js primitives)'); };

class Canvas {
  constructor(w = 300, h = 150) { this._w = w; this._h = h; this._d = new Uint8ClampedArray(w * h * 4); this._g = null; }
  get width() { return this._w; } set width(v) { this._w = v | 0; this._d = new Uint8ClampedArray(this._w * this._h * 4); }
  get height() { return this._h; } set height(v) { this._h = v | 0; this._d = new Uint8ClampedArray(this._w * this._h * 4); }
  getContext() { return this._g || (this._g = new Ctx(this)); }
}
export function install() { globalThis.document = { createElement: t => { if (t !== 'canvas') throw new Error('node-canvas: only canvas'); return new Canvas(); } }; }
export const newCanvas = (w, h) => new Canvas(w, h);

/* lay canvases out left to right, wrapping at maxW, on a backdrop colour; returns a canvas */
export function sheet(items, { maxW = 640, pad = 4, bg = '#6fa3cf', scale = 1 } = {}) {
  items = items.filter(c => c && Number.isFinite(c.width) && c._d); let x = pad, y = pad, rowH = 0; const pos = [];
  for (const c of items) { if (!c) { pos.push(null); continue; } if (x + c.width + pad > maxW && x > pad) { x = pad; y += rowH + pad; rowH = 0; } pos.push([x, y]); x += c.width + pad; rowH = Math.max(rowH, c.height); }
  const W = maxW, H = y + rowH + pad, out = new Canvas(W, H), g = out.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  items.forEach((c, i) => { if (c && pos[i]) g.drawImage(c, pos[i][0], pos[i][1]); });
  if (scale === 1) return out;
  const big = new Canvas(W * scale, H * scale); big.getContext('2d').drawImage(out, 0, 0, W * scale, H * scale); return big;
}
export function savePNG(c, path) {
  const W = c.width, H = c.height, raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; Buffer.from(c._d.buffer, c._d.byteOffset + y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1); }
  const tab = []; for (let n = 0; n < 256; n++) { let k = n; for (let j = 0; j < 8; j++) k = k & 1 ? 0xedb88320 ^ (k >>> 1) : k >>> 1; tab[n] = k >>> 0; }
  const crc = b => { let k = 0xffffffff; for (const x of b) k = tab[(k ^ x) & 255] ^ (k >>> 8); return (k ^ 0xffffffff) >>> 0; };
  const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const k = Buffer.alloc(4); k.writeUInt32BE(crc(td)); return Buffer.concat([l, td, k]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
