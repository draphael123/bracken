// tools/harpy-anim-lib.mjs - node-only helpers for the HARPYANIM sheets/loops (claude/harpyanim). NO browser: tools/node-canvas.mjs + a rotation patch.
import { install, newCanvas } from './node-canvas.mjs';
export function setup() {
  install();
  const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d'));
  if (P.__rotPatched) return; P.__rotPatched = true;
  P.rotate = function (a) { const m = this.m, c = Math.cos(a), s = Math.sin(a); this.m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; };
  for (const k of ['beginPath', 'moveTo', 'lineTo', 'arc', 'closePath', 'fill', 'stroke', 'strokeRect']) P[k] = function () {};   /* (the live rings / cone are path strokes: not drawn in the sheets) */
  const draw0 = P.drawImage;
  P.drawImage = function (src, ...a) {
    const m = this.m; if (!(Math.abs(m[1]) > 1e-9 || Math.abs(m[2]) > 1e-9)) return draw0.call(this, src, ...a);
    let sx = 0, sy = 0, sw = src.width, sh = src.height, dx, dy, dw, dh;
    if (a.length === 2) { [dx, dy] = a; dw = sw; dh = sh; } else if (a.length === 4) { [dx, dy, dw, dh] = a; } else [sx, sy, sw, sh, dx, dy, dw, dh] = a;
    const sd = src._d; if (!sd) return;
    const cs = [[dx, dy], [dx + dw, dy], [dx, dy + dh], [dx + dw, dy + dh]].map(([x, y]) => this._xf(x, y));
    const x0 = Math.floor(Math.min(...cs.map(c => c[0]))), x1 = Math.ceil(Math.max(...cs.map(c => c[0]))), y0 = Math.floor(Math.min(...cs.map(c => c[1]))), y1 = Math.ceil(Math.max(...cs.map(c => c[1])));
    const det = m[0] * m[3] - m[1] * m[2], W = this.cv.width, H = this.cv.height;
    for (let py = Math.max(0, y0); py < Math.min(H, y1); py++) for (let pxx = Math.max(0, x0); pxx < Math.min(W, x1); pxx++) {
      const X = pxx + 0.5 - m[4], Y = py + 0.5 - m[5], ux = (m[3] * X - m[2] * Y) / det, uy = (-m[1] * X + m[0] * Y) / det;
      if (ux < dx || uy < dy || ux >= dx + dw || uy >= dy + dh) continue;
      const tx = Math.floor(sx + (ux - dx) / dw * sw), ty = Math.floor(sy + (uy - dy) / dh * sh); if (tx < 0 || ty < 0 || tx >= src.width || ty >= src.height) continue;
      const k = (ty * src.width + tx) * 4; if (sd[k + 3]) this._put(py * W + pxx, [sd[k], sd[k + 1], sd[k + 2], sd[k + 3]]); }
  };
}
/* a canvas -> RGBA scaled up S x (nearest) */
export function rgbaOf(c, S = 2) { const W = c.width * S, H = c.height * S, o = new Uint8Array(W * H * 4), d = c._d;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = ((y / S | 0) * c.width + (x / S | 0)) * 4, k = (y * W + x) * 4; o[k] = d[s]; o[k + 1] = d[s + 1]; o[k + 2] = d[s + 2]; o[k + 3] = 255; }
  return o; }
