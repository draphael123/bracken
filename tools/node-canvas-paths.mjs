// tools/node-canvas-paths.mjs - (claude/bc5art2) a SMALL path shim over tools/node-canvas.mjs, so the sheet tool can render art that uses paths: moveTo/lineTo/quadraticCurveTo/arc/rect/closePath, fill(),
// stroke() (1px lines), clip() (a polygon mask on every later fillRect/fill, restored by restore()) and gradients (linear/radial, evaluated per pixel). NODE ONLY: it exists for tools/bc5-art-sheet.mjs
// (the real hourglass is drawn with paths); the game's own canvas is the browser's. No transforms inside shimmed calls.
function parse(c) { if (typeof c !== 'string') return [255, 0, 255, 1]; if (c[0] === '#') { let h = c.slice(1); if (h.length === 3) h = h.split('').map(k => k + k).join(''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1]; }
  const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(',').map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; } return [255, 0, 255, 1]; }
const inPoly = (poly, x, y) => { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
export function withPaths(inner) {
  let path = [], cur = null, clip = null; const stack = [];
  const grad = (kind, a) => ({ kind, a, stops: [], addColorStop(t, c) { this.stops.push([t, parse(c)]); } });
  const gcol = (gr, x, y) => { let t = gr.kind === 'radial' ? (Math.hypot(x - gr.a[0], y - gr.a[1]) - gr.a[2]) / Math.max(0.001, gr.a[5] - gr.a[2]) : ((x - gr.a[0]) * (gr.a[2] - gr.a[0]) + (y - gr.a[1]) * (gr.a[3] - gr.a[1])) / Math.max(0.001, (gr.a[2] - gr.a[0]) ** 2 + (gr.a[3] - gr.a[1]) ** 2);
    t = Math.max(0, Math.min(1, t)); const s = gr.stops; if (!s.length) return null; if (t <= s[0][0]) return s[0][1]; for (let i = 1; i < s.length; i++) if (t <= s[i][0]) { const k = (t - s[i - 1][0]) / Math.max(0.001, s[i][0] - s[i - 1][0]), a = s[i - 1][1], b = s[i][1]; return a.map((v, q) => v + (b[q] - v) * k); } return s[s.length - 1][1]; };
  const px = (x, y, col) => { if (clip && !inPoly(clip, x + 0.5, y + 0.5)) return; if (col[3] <= 0) return; const fs = inner.fillStyle; inner.fillStyle = 'rgba(' + [col[0], col[1], col[2]].map(Math.round) + ',' + col[3] + ')'; inner.fillRect(x, y, 1, 1); inner.fillStyle = fs; };
  const rectFill = (x, y, w, h) => { const fs = inner.fillStyle; if (fs && typeof fs === 'object') { for (let j = Math.floor(y); j < Math.ceil(y + h); j++) for (let i = Math.floor(x); i < Math.ceil(x + w); i++) { const c = gcol(fs, i + 0.5, j + 0.5); if (c) px(i, j, c); } return; }
    if (!clip) return inner.fillRect(x, y, w, h); const c = parse(fs); for (let j = Math.round(y); j < Math.round(y + h); j++) for (let i = Math.round(x); i < Math.round(x + w); i++) px(i, j, c); };
  const o = {
    fillRect: rectFill,
    createLinearGradient: (x0, y0, x1, y1) => grad('linear', [x0, y0, x1, y1]), createRadialGradient: (x0, y0, r0, x1, y1, r1) => grad('radial', [x0, y0, r0, x1, y1, r1]),
    beginPath() { path = []; cur = null; }, closePath() { if (cur && cur.length) cur.push(cur[0]); }, rect(x, y, w, h) { path.push([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]); cur = null; },
    moveTo(x, y) { cur = [[x, y]]; path.push(cur); }, lineTo(x, y) { if (!cur) { cur = [[x, y]]; path.push(cur); } else cur.push([x, y]); },
    quadraticCurveTo(cx, cy, x, y) { const [x0, y0] = cur[cur.length - 1]; for (let i = 1; i <= 6; i++) { const t = i / 6; cur.push([(1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y]); } },
    arc(x, y, r, a0, a1) { cur = []; path.push(cur); const n = 28, span = Math.min(Math.abs(a1 - a0), 6.2832); for (let i = 0; i <= n; i++) { const a = a0 + span * i / n; cur.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } },
    fill() { const all = path.filter(p => p.length > 2); if (!all.length) return; let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of all) for (const [x, y] of p) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const saved = clip; for (let j = Math.floor(y0); j < Math.ceil(y1); j++) for (let i = Math.floor(x0); i < Math.ceil(x1); i++) if (all.some(p => inPoly(p, i + 0.5, j + 0.5))) { const fs = inner.fillStyle; px(i, j, typeof fs === 'object' ? (gcol(fs, i + 0.5, j + 0.5) || [0, 0, 0, 0]) : parse(fs)); } clip = saved; },
    stroke() { const c = parse(inner.strokeStyle); for (const p of path) for (let k = 1; k < p.length; k++) { const [ax, ay] = p[k - 1], [bx, by] = p[k], n = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)))); for (let i = 0; i <= n; i++) px(Math.floor(ax + (bx - ax) * i / n), Math.floor(ay + (by - ay) * i / n), c); } },
    clip() { const p = path.filter(q => q.length > 2); clip = p.length ? ((pts) => pts)(p[0]) : clip; },
    save() { stack.push(clip); inner.save(); }, restore() { clip = stack.length ? stack.pop() : null; inner.restore(); },
  };
  return new Proxy(inner, { get: (t, k) => (k in o ? o[k] : typeof t[k] === 'function' ? t[k].bind(t) : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
}
