// Metadata belongs only to the private, fresh, closed ART.bakeFG painter.
// The original intermediate foreground is rebuilt on every draw.
const bands = new WeakMap();
let closed = true, cropped = 0, fallbacks = 0;
const native = f => typeof f === 'function' && /\[native code\]/.test(Function.prototype.toString.call(f));
export function checkForegroundRows(g) {
  const p = HTMLCanvasElement.prototype, w = Object.getOwnPropertyDescriptor(p, 'width'), h = Object.getOwnPropertyDescriptor(p, 'height');
  if (![document.createElement, p.getContext, w.get, w.set, h.get, h.set, CanvasRenderingContext2D.prototype.drawImage, CanvasRenderingContext2D.prototype.getImageData, ...(g ? [g.drawImage, g.getTransform] : [])].every(native)) closed = false;
  return closed;
}
export function freshForegroundRows(build) {
  const eligible = checkForegroundRows(), c = build();
  if (!eligible || !c.width || !c.height || c.width * c.height > 1048576) return c;
  const g = c.getContext('2d'), a = g.getContextAttributes();
  if (!a.willReadFrequently || !a.alpha || a.colorSpace !== 'srgb' || (a.colorType && a.colorType !== 'unorm8') || g.isContextLost()) return c;
  const data = g.getImageData(0, 0, c.width, c.height).data, rows = [];
  for (let y = 0; y < c.height; y++) {
    let active = false;
    for (let x = 0; x < c.width; x++) if (data[(y * c.width + x) * 4 + 3]) { active = true; break; }
    if (active) { if (rows.length && rows.at(-1)[1] === y) rows.at(-1)[1]++; else rows.push([y, y + 1]); }
  }
  bands.set(c, {width:c.width, height:c.height, rows});
  return c;
}
export function drawForegroundRows(g, frame, c, y, width, height) {
  const b = bands.get(c), a = g.getContextAttributes(), t = g.getTransform();
  if (!closed || !b || b.width !== c.width || b.height !== c.height || !c.width || !c.height ||
      frame.width !== width || frame.height !== height || !Number.isInteger(y) || !native(g.drawImage) ||
      a.willReadFrequently || !a.alpha || a.colorSpace !== 'srgb' || (a.colorType && a.colorType !== 'unorm8') ||
      g.isContextLost() || g.globalCompositeOperation !== 'source-over' || g.globalAlpha !== 0.3 || g.imageSmoothingEnabled ||
      g.filter !== 'none' || g.shadowBlur !== 0 || g.shadowOffsetX !== 0 || g.shadowOffsetY !== 0 ||
      g.shadowColor !== 'rgba(0, 0, 0, 0)' || t.a !== 1 || t.b !== 0 || t.c !== 0 || t.d !== 1 ||
      !Number.isInteger(t.e) || !Number.isInteger(t.f)) { fallbacks++; g.drawImage(frame, 0, 0); return; }
  cropped++;
  for (const [start, end] of b.rows) {
    const top = Math.max(0, start + y), bottom = Math.min(height, end + y);
    if (bottom > top) g.drawImage(frame, 0, top, width, bottom - top, 0, top, width, bottom - top);
  }
}
export function foregroundRowsInfo() { return {closed,cropped,fallbacks}; }
