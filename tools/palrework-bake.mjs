// tools/palrework-bake.mjs - NODE ONLY (no browser, no puppeteer, no cdp): bakes the PALADIN's sheet through a tiny in-memory canvas shim, asserts every pose bakes
// without throwing, that the mace set and the foe (maul) set carry the same keys, and writes a PNG contact sheet (mace rows over maul rows) for a still check.
//   node tools/palrework-bake.mjs [out.png]
// claude/palrework. The shim covers what px.js / chars.js use for the knight rigs: fillRect, clearRect, drawImage, get/putImageData, translate/scale/save/restore, a scanline polygon fill.
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
const hexRGBA = s => { s = String(s); let m;
  if ((m = /^#([0-9a-f]{6})$/i.exec(s))) { const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255, 255]; }
  if ((m = /^#([0-9a-f]{3})$/i.exec(s))) { const t = m[1]; return [parseInt(t[0] + t[0], 16), parseInt(t[1] + t[1], 16), parseInt(t[2] + t[2], 16), 255]; }
  if ((m = /^rgba?\(([^)]+)\)/.exec(s))) { const p = m[1].split(',').map(Number); return [p[0] | 0, p[1] | 0, p[2] | 0, Math.round((p.length > 3 ? p[3] : 1) * 255)]; }
  return [0, 0, 0, 255]; };
class Ctx {
  constructor(c) { this.c = c; this.fillStyle = '#000'; this.strokeStyle = '#000'; this.globalAlpha = 1; this.m = { a: 1, d: 1, e: 0, f: 0 }; this.stack = []; this.path = []; this.imageSmoothingEnabled = false; this.globalCompositeOperation = 'source-over'; this.lineWidth = 1; }
  get data() { return this.c.data; }
  _set(x, y, rgba) { const c = this.c; if (x < 0 || y < 0 || x >= c.width || y >= c.height) return; const i = (y * c.width + x) * 4, d = c.data, a = rgba[3] / 255 * this.globalAlpha;
    if (a >= 0.999) { d[i] = rgba[0]; d[i + 1] = rgba[1]; d[i + 2] = rgba[2]; d[i + 3] = 255; } else if (a > 0) { const da = d[i + 3] / 255, oa = a + da * (1 - a); for (let k = 0; k < 3; k++) d[i + k] = Math.round((rgba[k] * a + d[i + k] * da * (1 - a)) / (oa || 1)); d[i + 3] = Math.round(oa * 255); } }
  save() { this.stack.push({ ...this.m }); } restore() { this.m = this.stack.pop() || this.m; }
  translate(x, y) { this.m.e += this.m.a * x; this.m.f += this.m.d * y; } scale(sx, sy) { this.m.a *= sx; this.m.d *= sy; } setTransform(a, b, c, d, e, f) { this.m = { a, d, e, f }; } rotate() { }
  fillRect(x, y, w, h) { const rgba = hexRGBA(this.fillStyle), M = this.m; let x0 = M.a * x + M.e, x1 = M.a * (x + w) + M.e, y0 = M.d * y + M.f, y1 = M.d * (y + h) + M.f; if (x1 < x0) [x0, x1] = [x1, x0]; if (y1 < y0) [y0, y1] = [y1, y0];
    for (let yy = Math.round(y0); yy < Math.round(y1); yy++) for (let xx = Math.round(x0); xx < Math.round(x1); xx++) this._set(xx, yy, rgba); }
  clearRect(x, y, w, h) { const M = this.m, c = this.c; for (let yy = Math.round(M.d * y + M.f); yy < Math.round(M.d * (y + h) + M.f); yy++) for (let xx = Math.round(M.a * x + M.e); xx < Math.round(M.a * (x + w) + M.e); xx++) if (xx >= 0 && yy >= 0 && xx < c.width && yy < c.height) { const i = (yy * c.width + xx) * 4; c.data[i] = c.data[i + 1] = c.data[i + 2] = c.data[i + 3] = 0; } }
  drawImage(src, dx = 0, dy = 0, dw, dh) { const M = this.m, w = dw ?? src.width, h = dh ?? src.height; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const sx = Math.floor(x * src.width / w), sy = Math.floor(y * src.height / h), i = (sy * src.width + sx) * 4, a = src.data[i + 3]; if (!a) continue;
      const tx = Math.round(M.a * (dx + x) + M.e - (M.a < 0 ? 1 : 0)), ty = Math.round(M.d * (dy + y) + M.f - (M.d < 0 ? 1 : 0)); this._set(tx, ty, [src.data[i], src.data[i + 1], src.data[i + 2], a]); } }
  getImageData(x, y, w, h) { const out = new Uint8ClampedArray(w * h * 4), c = this.c; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const sx = x + xx, sy = y + yy; if (sx < 0 || sy < 0 || sx >= c.width || sy >= c.height) continue; const i = (sy * c.width + sx) * 4, o = (yy * w + xx) * 4; for (let k = 0; k < 4; k++) out[o + k] = c.data[i + k]; } return { data: out, width: w, height: h }; }
  putImageData(img, x, y) { const c = this.c; for (let yy = 0; yy < img.height; yy++) for (let xx = 0; xx < img.width; xx++) { const tx = x + xx, ty = y + yy; if (tx < 0 || ty < 0 || tx >= c.width || ty >= c.height) continue; const i = (ty * c.width + tx) * 4, o = (yy * img.width + xx) * 4; for (let k = 0; k < 4; k++) c.data[i + k] = img.data[o + k]; } }
  beginPath() { this.path = []; this.cur = null; } moveTo(x, y) { this.cur = []; this.path.push(this.cur); this.cur.push([x, y]); } lineTo(x, y) { if (!this.cur) this.moveTo(x, y); else this.cur.push([x, y]); } closePath() { }
  quadraticCurveTo(cx, cy, x, y) { this.lineTo(x, y); } ellipse(cx, cy, rx, ry) { const pts = []; for (let i = 0; i < 24; i++) pts.push([cx + Math.cos(i / 24 * 6.2832) * rx, cy + Math.sin(i / 24 * 6.2832) * ry]); this.cur = pts; this.path.push(pts); } arc(cx, cy, r) { this.ellipse(cx, cy, r, r); }
  fill() { const rgba = hexRGBA(this.fillStyle), M = this.m; for (const poly of this.path) { if (poly.length < 3) continue; const P = poly.map(([x, y]) => [M.a * x + M.e, M.d * y + M.f]); const ys = P.map(p => p[1]); const y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
      for (let y = y0; y <= y1; y++) { const xs = []; for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length]; if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) xs.push(ax + (y + 0.5 - ay) / (by - ay) * (bx - ax)); } xs.sort((p, q) => p - q);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this._set(x, y, rgba); } } }
  stroke() { } createLinearGradient() { return { addColorStop() { } }; }
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1, _w: 0, _h: 0, data: new Uint8ClampedArray(4), ctx: null,
  getContext() { if (!this.ctx) { this.data = new Uint8ClampedArray(this.width * this.height * 4); this.ctx = new Ctx(this); } return this.ctx; } };
  let w = 1, h = 1; Object.defineProperty(c, 'width', { get: () => w, set: v => { w = v; c.ctx = null; } }); Object.defineProperty(c, 'height', { get: () => h, set: v => { h = v; c.ctx = null; } }); return c; } };
const C = await import('../src/chars.js'), HGm = await import('../src/holy-ground.js');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const mace = C.bakePaladin({}), maul = C.bakePaladin({}, false, true);
ok(HGm.PAL_MACE === true, 'PAL_MACE on');
const keys = Object.keys(mace.R); ok(keys.length > 40, 'baked ' + keys.length + ' pose keys');
ok(JSON.stringify(keys) === JSON.stringify(Object.keys(maul.R)), 'mace set and foe (maul) set carry the same pose keys');
const flat = f => Array.isArray(f) ? f : [f]; let frames = 0, empty = 0;
for (const k of keys) for (const f of flat(mace.R[k])) { frames++; const d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; if (!n) empty++; }
ok(empty === 0, frames + ' frames baked, ' + empty + ' empty');
// the mace differs from the maul (head and off hand) on the attack and the ward
const hash = f => { const d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data; let h = 0; for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) | 0; return h; };
for (const k of ['idle', 'atk', 'block', 'heavy', 'hurlH', 'dashAtk']) ok(hash(flat(mace.R[k])[0]) !== hash(flat(maul.R[k])[0]), 'pose ' + k + ' differs from the maul');
// (claude/palpose-d, Daniel 11-11 'clips with his body a lot') THE MACE IS HELD, NOT LAID OVER HIM: in the carried poses not one haft or grip-wrap pixel may sit on his torso
// (the tabard: body columns 11-20 (the front arm included), rows 12-16 of the 34x32 rig + the attack headroom, with a row's slack for the breath). Before this lane the haft crossed it in every one.
{ const HAFT = new Set(['122,78,44', '74,46,24', '138,90,52', '58,36,18']), carriedKeys = ['idle', 'run', 'jump', 'fall', 'land', 'takeoff', 'apex', 'hurt'];
  for (const k of carriedKeys) { let worst = 0; for (const f of flat(mace.R[k] || [])) { const top = f.height - 32, d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data; let n = 0;
      for (let y = top + 11; y <= top + 17; y++) for (let x = 11; x <= 20; x++) { const i = (y * f.width + x) * 4; if (d[i + 3] && HAFT.has(d[i] + ',' + d[i + 1] + ',' + d[i + 2])) n++; } worst = Math.max(worst, n); }
    ok(worst <= 1, k + ': no haft across the torso (worst frame ' + worst + ' px)'); } }
// THE HEAD LANDS WHERE THE BLOW DOES: each forward strike frame's drawn head centre (chars.js c.maceHead) within ~3 px of main.js attackBox reach - 3 (light 22, heavy 25, sweep 26)
{ const ax = mace.ax, want = { atk: [22, [2, 3]], atkB: [22, [1]], atkC: [22, [2]], heavy: [25, [1]], sweep: [26, [1, 2]] };
  for (const [k, [reach, idx]] of Object.entries(want)) for (const i of idx) { const f = flat(mace.R[k])[i], h = f && f.maceHead, front = h ? h[0] - ax + 3 : -99; ok(Math.abs(front - reach) <= 3, k + ' ' + i + ': drawn head front ' + front + ' vs reach ' + reach); } }
// contact sheet: for each pose key the first frame, mace row over maul row
const out = process.argv[2], pick = ['idle', 'run', 'jump', 'atk', 'atkB', 'atkC', 'air', 'heavy', 'block', 'cast', 'hurlH', 'smiteQ', 'radiance', 'sunfall', 'dashAtk', 'plunge', 'hurt', 'kneel', 'sanctify', 'wrath'].filter(k => mace.R[k]);
if (out) { const S = 3, cw = 34, ch = 56, W = pick.length * cw * S, H = ch * S * 2 + 8, px = new Uint8Array(W * H * 4); for (let i = 0; i < px.length; i += 4) { px[i] = 58; px[i + 1] = 66; px[i + 2] = 82; px[i + 3] = 255; }
  const put = (f, ox, oy) => { const d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data; for (let y = 0; y < f.height; y++) for (let x = 0; x < f.width; x++) { const i = (y * f.width + x) * 4; if (!d[i + 3]) continue; for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) { const X = ox + x * S + sx, Y = oy + y * S + sy; if (X >= W || Y >= H) continue; const o = (Y * W + X) * 4; px[o] = d[i]; px[o + 1] = d[i + 1]; px[o + 2] = d[i + 2]; px[o + 3] = 255; } } };
  pick.forEach((k, j) => { put(flat(mace.R[k])[0], j * cw * S, 0); put(flat(maul.R[k])[0], j * cw * S, ch * S + 8); });
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; } const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const b = Buffer.alloc(12 + d.length); b.writeUInt32BE(d.length, 0); b.write(t, 4); Buffer.from(d).copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length); return b; };
  const raw = Buffer.alloc((W * 4 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); console.log('wrote', out, W + 'x' + H, '(top row mace, bottom row foe maul):', pick.join(' ')); }
console.log(fails ? 'FAILED ' + fails : 'PASS'); process.exit(fails ? 1 : 0);
