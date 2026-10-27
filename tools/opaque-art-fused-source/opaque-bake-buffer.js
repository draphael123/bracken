// Only for a fresh private CPU bake whose closed painter call graph uses fillStyle/fillRect.
// Geometry, painter order, seeded random calls and the returned canvas stay original.
const littleEndian = new Uint8Array(new Uint32Array([0x01020304]).buffer)[0] === 4;
export function beginOpaqueBake(g) {
  const fallback = { g, finish() {}, outline(c, color, original) { return original(c, color); }, get buffered() { return false; } };
  const native = fn => typeof fn === 'function' && /\[native code\]/.test(Function.prototype.toString.call(fn));
  const style = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'fillStyle');
  const w = g.canvas.width, h = g.canvas.height, m = g.getTransform(), a = g.getContextAttributes();
  if (!w || !h || w * h > 1048576 || !native(g.fillRect) || !native(g.putImageData) || !native(g.createImageData) || !native(style.set) ||
      !a.willReadFrequently || !a.alpha || a.colorSpace !== 'srgb' || (a.colorType && a.colorType !== 'unorm8') ||
      g.globalAlpha !== 1 || g.globalCompositeOperation !== 'source-over' || g.filter !== 'none' ||
      g.shadowBlur || g.shadowOffsetX || g.shadowOffsetY || g.shadowColor !== 'rgba(0, 0, 0, 0)' ||
      m.a !== 1 || m.b || m.c || m.d !== 1 || m.e || m.f) return fallback;
  const image = g.createImageData(w, h), pixels = new Uint32Array(image.data.buffer), colours = new Map();
  let buffered = true, last = '#000000', word = littleEndian ? 0xff000000 : 0x000000ff;
  function flush() { if (buffered) { g.putImageData(image, 0, 0); g.fillStyle = last; buffered = false; } }
  const context = {
    get fillStyle() { flush(); return g.fillStyle; },
    set fillStyle(c) {
      if (!buffered) { g.fillStyle = c; return; }
      let value = colours.get(c);
      if (value === undefined) {
        if (typeof c !== 'string' || !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) { flush(); g.fillStyle = c; return; }
        const s = c.length === 4 ? c.slice(1).split('').map(x => x + x).join('') : c.slice(1), n = parseInt(s, 16), r = n >>> 16, b = n & 255, green = (n >>> 8) & 255;
        value = littleEndian ? (0xff000000 | (b << 16) | (green << 8) | r) >>> 0 : ((r << 24) | (green << 16) | (b << 8) | 255) >>> 0;
        colours.set(c, value);
      }
      last = c; word = value;
    },
    fillRect(x, y, width, height) {
      if (!buffered) { g.fillRect(x, y, width, height); return; }
      if (![x, y, width, height].every(Number.isInteger)) { flush(); g.fillRect(x, y, width, height); return; }
      const x0 = Math.max(0, Math.min(x, x + width)), x1 = Math.min(w, Math.max(x, x + width));
      const y0 = Math.max(0, Math.min(y, y + height)), y1 = Math.min(h, Math.max(y, y + height));
      if (x1 <= x0 || y1 <= y0) return;
      for (let row = y0; row < y1; row++) pixels.fill(word, row * w + x0, row * w + x1);
    }
  };
  return { g: context, finish: flush,
    outline(c, color, original) {
      if (!buffered || typeof color !== 'string' || !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ||
          !native(g.setTransform) || !native(g.getImageData) || !native(g.fillRect) ||
          g.globalAlpha !== 1 || g.globalCompositeOperation !== 'source-over' || g.filter !== 'none' ||
          g.shadowBlur || g.shadowOffsetX || g.shadowOffsetY || g.shadowColor !== 'rgba(0, 0, 0, 0)') { flush(); return original(c, color); }
      g.setTransform(1, 0, 0, 1, 0, 0);
      const solid = new Uint8Array(w * h);
      for (let i = 0; i < solid.length; i++) solid[i] = pixels[i] !== 0 ? 1 : 0;
      context.fillStyle = color;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!solid[i] && ((x > 0 && solid[i - 1]) || (x < w - 1 && solid[i + 1]) || (y > 0 && solid[i - w]) || (y < h - 1 && solid[i + w]))) pixels[i] = word;
      }
      return c;
    }, get buffered() { return buffered; } };
}
