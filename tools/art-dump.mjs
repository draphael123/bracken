/* tools/art-dump.mjs - SOFTWARE RASTER of the Act II transition art, NO BROWSER (claude/act2trart). Stubs document.createElement('canvas') with a tiny RGBA rasteriser (fillRect, drawImage, getImageData,
   linear/radial gradients, polygons, ellipses, translate) and writes PNG stills of the gate kits and the three scenes to a folder, so an art pass can be LOOKED AT from node alone.
   It also is a dry run: any throw / NaN in the art fails the run. Usage: node tools/art-dump.mjs <outDir> [gates|scenes|all]. Not part of check.mjs (it only needs node + zlib). */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const col = s => {
  if (typeof s !== 'string') return [0, 0, 0, 1];
  if (s[0] === '#') { const h = s.length === 4 ? s.slice(1).split('').map(c => c + c).join('') : s.slice(1); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; }
  const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 1]; const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
};
class Ctx {
  constructor(c) { this.c = c; this.d = new Uint8ClampedArray(c.width * c.height * 4); this.fillStyle = '#000'; this.globalAlpha = 1; this.tx = 0; this.ty = 0; this.stack = []; this.path = []; this.globalCompositeOperation = 'source-over'; this.imageSmoothingEnabled = false; }
  _blend(x, y, rgba, a) {
    const W = this.c.width, H = this.c.height; if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4, d = this.d, sa = a * rgba[3], da = d[i + 3] / 255;
    if (this.globalCompositeOperation === 'source-atop') { if (da <= 0) return; for (let k = 0; k < 3; k++) d[i + k] = rgba[k] * sa + d[i + k] * (1 - sa); return; }
    const oa = sa + da * (1 - sa); if (oa <= 0) return; for (let k = 0; k < 3; k++) d[i + k] = (rgba[k] * sa + d[i + k] * da * (1 - sa)) / oa; d[i + 3] = oa * 255;
  }
  _paint(x, y) { const f = this.fillStyle; if (f && typeof f === 'object') { this._blend(x, y, f.at(x - this.tx, y - this.ty), this.globalAlpha); } else this._blend(x, y, col(f), this.globalAlpha); }
  fillRect(x, y, w, h) { x = Math.round(x + this.tx); y = Math.round(y + this.ty); w = Math.round(w); h = Math.round(h); if (!(isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h))) throw new Error('NaN rect'); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this._paint(x + i - this.tx, y + j - this.ty); }
  clearRect() { this.d.fill(0); }
  save() { this.stack.push([this.tx, this.ty, this.globalAlpha, this.fillStyle, this.globalCompositeOperation]); }
  restore() { [this.tx, this.ty, this.globalAlpha, this.fillStyle, this.globalCompositeOperation] = this.stack.pop(); }
  translate(x, y) { this.tx += x; this.ty += y; } rotate() { /* stills ignore rotation */ } scale() {} setTransform() { this.tx = 0; this.ty = 0; }
  beginPath() { this.path = []; } moveTo(x, y) { this.path.push([x, y]); } lineTo(x, y) { this.path.push([x, y]); } closePath() {}
  ellipse(cx, cy, rx, ry) { this.path = []; for (let a = 0; a < 6.2832; a += 0.2) this.path.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  arc(cx, cy, r) { this.ellipse(cx, cy, r, r); }
  fill() { const p = this.path; if (p.length < 3) return; let y0 = Math.floor(Math.min(...p.map(q => q[1]))), y1 = Math.ceil(Math.max(...p.map(q => q[1])));
    for (let y = y0; y <= y1; y++) { const xs = []; for (let i = 0; i < p.length; i++) { const [ax, ay] = p[i], [bx, by] = p[(i + 1) % p.length]; if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) xs.push(ax + (y + 0.5 - ay) / (by - ay) * (bx - ax)); }
      xs.sort((a, b) => a - b); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this._paint(x, y); } }
  createLinearGradient(x0, y0, x1, y1) { const st = []; return { addColorStop: (k, c) => st.push([k, col(c)]), at: (x, y) => { const dx = x1 - x0, dy = y1 - y0, l = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l)); return interp(st, t); } }; }
  createRadialGradient(x0, y0, r0, x1, y1, r1) { const st = []; return { addColorStop: (k, c) => st.push([k, col(c)]), at: (x, y) => { const t = Math.max(0, Math.min(1, (Math.hypot(x - x1, y - y1) - r0) / Math.max(1e-6, r1 - r0))); return interp(st, t); } }; }
  drawImage(img, x, y, w, h) {
    if (!(isFinite(x) && isFinite(y))) throw new Error('NaN drawImage'); const s = img.getContext('2d'), sw = img.width, sh = img.height; x = Math.round(x + this.tx); y = Math.round(y + this.ty); const dw = w === undefined ? sw : w, dh = h === undefined ? sh : h;
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const si = ((Math.floor(j * sh / dh)) * sw + Math.floor(i * sw / dw)) * 4, a = s.d[si + 3] / 255; if (a > 0) this._blend(x + i, y + j, [s.d[si], s.d[si + 1], s.d[si + 2], a], this.globalAlpha); }
  }
  getImageData(x, y, w, h) { return { width: w, height: h, data: this.d }; } putImageData(img) { this.d.set(img.data); }
}
const interp = (st, t) => { st = st.slice().sort((a, b) => a[0] - b[0]); if (!st.length) return [0, 0, 0, 0]; if (t <= st[0][0]) return st[0][1]; for (let i = 1; i < st.length; i++) if (t <= st[i][0]) { const [k0, c0] = st[i - 1], [k1, c1] = st[i], u = (t - k0) / Math.max(1e-6, k1 - k0); return c0.map((v, j) => v + (c1[j] - v) * u); } return st[st.length - 1][1]; };
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => (c._g ||= new Ctx(c)); const orig = c.getContext; Object.defineProperty(c, 'width', { get() { return this._w || 1; }, set(v) { this._w = v; this._g = null; } }); Object.defineProperty(c, 'height', { get() { return this._h || 1; }, set(v) { this._h = v; this._g = null; } }); c.getContext = () => (c._g ||= new Ctx(c)); return c; } };
Object.defineProperty(Ctx.prototype, 'd', { get() { return this._d ||= new Uint8ClampedArray(this.c.width * this.c.height * 4); }, set(v) { this._d = v; } });

const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = b => { let c = -1; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (t, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(t, 4); data.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + data.length)), 8 + data.length); return b; };
export function png(c, scale = 2) {
  const g = c.getContext('2d'), W = c.width * scale, H = c.height * scale, raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const si = ((y / scale | 0) * c.width + (x / scale | 0)) * 4, o = y * (W * 4 + 1) + 1 + x * 4, a = g.d[si + 3] / 255; raw[o] = g.d[si] * a + 24 * (1 - a); raw[o + 1] = g.d[si + 1] * a + 20 * (1 - a); raw[o + 2] = g.d[si + 2] * a + 34 * (1 - a); raw[o + 3] = 255; } }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const out = process.argv[2], what = process.argv[3] || 'all';
if (!out) { console.error('usage: node tools/art-dump.mjs <outDir> [gates|scenes|all]'); process.exit(2); }
mkdirSync(out, { recursive: true });
const TRA = await import('../src/transitions-art.js');
const TRM = await import('../src/transitions.js');
const mkScreen = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const heroStub = g => (i, x, y) => { g.fillStyle = ['#c84a4a', '#4a7ac8', '#4ac86a', '#c8b04a'][i % 4]; g.fillRect(Math.round(x), Math.round(y) - 22, 10, 22); g.fillStyle = '#f0d0a8'; g.fillRect(Math.round(x) + 2, Math.round(y) - 26, 6, 5); };
const VW = 400, VH = 225;
let n = 0; const save = (name, c, sc = 2) => { writeFileSync(out + '/' + name + '.png', png(c, sc)); n++; };

if (what === 'gates' || what === 'all') {
  const kinds = ['pine', 'rope', 'bell', 'crumble', 'adit', 'arch', 'hatch', 'cairn', 'ledge'];
  for (const kind of kinds) for (const [label, t, opened] of [['shut', 0.0, false], ['open', 1.2, true]]) {
    const c = mkScreen(150, 150), g = c.getContext('2d'); g.fillStyle = '#4a5a6a'; g.fillRect(0, 0, 150, 150); g.fillStyle = '#3a342c'; g.fillRect(0, 118, 150, 32);
    const env = { g, VW: 150, VH: 150 };
    TRA.drawWayGate(env, { col: 4, rows: [3, 7], kind, w: 2 }, 0, 0, t, opened, 1.0, false);
    save('gate-' + kind + '-' + label, c, 3);
  }
}
if (what === 'scenes' || what === 'all') {
  const mk = (fn, name, ss, nHeroes = 3, reduce = false) => { for (const s of ss) { const c = mkScreen(VW, VH), g = c.getContext('2d'); const env = { g, VW, VH, time: s * 5.3, n: nHeroes, reduce, drawHero: heroStub(g), drawFerryman() {} }; fn(env, s); save(name + '-' + String(Math.round(s * 100)).padStart(3, '0') + (reduce ? '-reduce' : ''), c, 2); } };
  mk(TRA.drawDaylightScene, 'S1', [0.2, 0.5, 0.75, 1]); mk(TRA.drawDropScene, 'S2', [0.3, 0.55, 0.75, 0.95]); mk(TRA.drawDescentScene, 'S3', [0.15, 0.4, 0.7, 1]);
  for (const [f, nm] of [[TRA.drawDaylightScene, 'S1'], [TRA.drawDropScene, 'S2'], [TRA.drawDescentScene, 'S3']]) for (let r = 0; r < 2; r++) for (let k = 0; k <= 20; k++) for (const nh of [1, 4]) { const c = mkScreen(VW, VH), g = c.getContext('2d'); f({ g, VW, VH, time: k * 0.25, n: nh, reduce: !!r, drawHero: heroStub(g), drawFerryman() {} }, k / 20); }
  { const c = mkScreen(200, 100), g = c.getContext('2d'); g.fillStyle = '#5a6a70'; g.fillRect(0, 0, 200, 100); g.fillStyle = '#4a4034'; g.fillRect(0, 70, 200, 30); TRA.drawArrivalRaft({ g, VW: 200, VH: 100 }, 0, 0, 70, 1.0); save('raft-arrival', c, 3); }
}
console.log('art-dump: ' + n + ' stills in ' + out + ' (no throw, no NaN)');
