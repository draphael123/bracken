/* tools/demo-teaser-pack.mjs - PACK THE END CARD'S REAL STILLS (claude/endcard3, Daniel 11-14: "Can they actually look more like the level?").
   Node only, no browser, no dependencies. Reads the raw 1:1 frames the page produced (PNG, the game's own buffer with the HUD and the hero left out), crops a 192x108 window,
   halves it to 96x54 (each 2x2 block keeps its most common colour, so the pixel art stays pixel art - no blur), cuts it to 64 colours (median cut) and writes the result into
   src/demo-teaser.js between the DATA-BEGIN / DATA-END markers as a palette string + base64 index bytes. Same input = same bytes.
   usage: node tools/demo-teaser-pack.mjs <rawDir>      (rawDir holds the raw-*.png files named in SPEC; the crop of each scene is SPEC too)
   HOW THE RAW FRAMES WERE TAKEN (headless, one browser): BK.load(level) + BK.start() + BK.sim(500) (the banner is gone), BK.enemies cleared, BK.hideHero = true, BK.SET.vignette = true, then
   BK.look(tx, ty) puts the camera on a tile and draws a frame (the hero is moved off the map first); a patched CanvasRenderingContext2D.createRadialGradient copies the buffer at the
   HUD block's vignette call, which is the world before any HUD. The Drake was taken the same way on its lab level (claude/draketune: its art and the caldera set, hover pose). */
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
/* id -> raw file, crop window (x, y) in the raw frame, and where the frame came from */
export const SPEC = [
  { id: 'desert', raw: 'raw-buriedcity-0.png', x: 72, y: 16, from: 'THE BURIED CITY, the road in at dusk (tile 12,21): the lookout tower, the pennant string, the dunes' },
  { id: 'crown', raw: 'raw-crown-1.png', x: 100, y: 12, from: 'HIGHCROWN, the great hall (tile 830,19): gilt pillars, chandeliers, the red banner' },
  { id: 'water', raw: 'raw-longwater-1.png', x: 20, y: 26, from: 'THE LONG WATER (tile 135,28): the pines, the falls, the flooded stacks at dusk' },
  { id: 'drake', raw: 'raw-drake-hover.png', x: 160, y: 96, from: 'THE FIRE DRAKE on its chain in the caldera (claude/draketune art, hover pose)' },
];
function decodePng(buf) {
  let p = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; } else if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 0; if (!bpp) throw new Error('png colour type ' + ct);
  const raw = inflateSync(Buffer.concat(idat)), st = w * bpp, out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(st);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (st + 1)], line = Buffer.from(raw.subarray(y * (st + 1) + 1, (y + 1) * (st + 1)));
    for (let i = 0; i < st; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += (pa <= pb && pa <= pc) ? a : pb <= pc ? b : c; }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; out[o] = line[x * bpp]; out[o + 1] = line[x * bpp + 1]; out[o + 2] = line[x * bpp + 2]; out[o + 3] = 255; }
    prev = line;
  }
  return { w, h, rgba: out };
}
const CW = 192, CH = 108;
/* crop 192x108 and halve: each 2x2 block keeps its commonest colour; a tie takes the colour nearest the block's mean */
function half(img, x0, y0) {
  const w = CW / 2, h = CH / 2, o = new Uint8Array(w * h * 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = [];
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const sx = Math.min(img.w - 1, Math.max(0, x0 + x * 2 + i)), sy = Math.min(img.h - 1, Math.max(0, y0 + y * 2 + j)), k = (sy * img.w + sx) * 4;
      px.push([img.rgba[k], img.rgba[k + 1], img.rgba[k + 2]]);
    }
    const mean = [0, 1, 2].map(c => (px[0][c] + px[1][c] + px[2][c] + px[3][c]) / 4), cnt = new Map();
    for (const p of px) { const k = p.join(','); cnt.set(k, (cnt.get(k) || 0) + 1); }
    let best = null, bs = -1e9;
    for (const [k, n] of cnt) { const p = k.split(',').map(Number), s = n * 1000 - Math.hypot(p[0] - mean[0], p[1] - mean[1], p[2] - mean[2]); if (s > bs) { bs = s; best = p; } }
    o.set(best, (y * w + x) * 3);
  }
  return { w, h, rgb: o };
}
function quant(img, n) {
  const cnt = new Map();
  for (let i = 0; i < img.w * img.h; i++) { const k = img.rgb[i * 3] + ',' + img.rgb[i * 3 + 1] + ',' + img.rgb[i * 3 + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  if (cnt.size <= n) return [...cnt.keys()].sort().map(k => k.split(',').map(Number));
  const boxes = [[...cnt].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, c]) => ({ p: k.split(',').map(Number), c }))];
  while (boxes.length < n) {
    let bi = -1, br = -1, bc = 0;
    boxes.forEach((b, i) => {
      if (b.length < 2) return; const tot = Math.sqrt(b.reduce((s, e) => s + e.c, 0));
      for (let c = 0; c < 3; c++) { const v = b.map(e => e.p[c]), r = (Math.max(...v) - Math.min(...v)) * tot; if (r > br) { br = r; bi = i; bc = c; } }
    });
    if (bi < 0) break;
    const b = boxes[bi].sort((a, z) => a.p[bc] - z.p[bc] || a.p[(bc + 1) % 3] - z.p[(bc + 1) % 3] || a.p[(bc + 2) % 3] - z.p[(bc + 2) % 3]), tot = b.reduce((s, e) => s + e.c, 0);
    let acc = 0, cut = 1; for (let i = 0; i < b.length - 1; i++) { acc += b[i].c; cut = i + 1; if (acc >= tot / 2) break; }
    boxes.splice(bi, 1, b.slice(0, cut), b.slice(cut));
  }
  return boxes.map(b => { const t = b.reduce((s, e) => s + e.c, 0); return [0, 1, 2].map(c => Math.round(b.reduce((s, e) => s + e.p[c] * e.c, 0) / t)); }).sort((a, z) => a[0] - z[0] || a[1] - z[1] || a[2] - z[2]);
}
export function pack(rawDir, spec) {
  const img = decodePng(readFileSync(join(rawDir, spec.raw))), h = half(img, spec.x, spec.y), pal = quant(h, 64), idx = new Uint8Array(h.w * h.h), memo = new Map();
  for (let i = 0; i < idx.length; i++) {
    const p = [h.rgb[i * 3], h.rgb[i * 3 + 1], h.rgb[i * 3 + 2]], k = p.join(','); let b = memo.get(k);
    if (b === undefined) { let bd = Infinity; b = 0; pal.forEach((q, j) => { const d = 2 * (p[0] - q[0]) ** 2 + 4 * (p[1] - q[1]) ** 2 + 3 * (p[2] - q[2]) ** 2; if (d < bd) { bd = d; b = j; } }); memo.set(k, b); }
    idx[i] = b;
  }
  return { w: h.w, h: h.h, pal: pal.map(c => c.map(v => v.toString(16).padStart(2, '0')).join('')).join(''), px: Buffer.from(idx).toString('base64') };
}
if (process.argv[2] && process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/demo-teaser-pack.mjs')) {
  const dir = process.argv[2], file = fileURLToPath(new URL('../src/demo-teaser.js', import.meta.url)); let src = readFileSync(file, 'utf8');
  const lines = SPEC.map(s => { const r = pack(dir, s); return '  /* ' + s.from + ' */\n  ' + s.id + ': { w: ' + r.w + ', h: ' + r.h + ", pal: '" + r.pal + "',\n    px: '" + r.px + "' },"; });
  const a = src.indexOf('/* DATA-BEGIN */'), b = src.indexOf('/* DATA-END */'); if (a < 0 || b < 0) throw new Error('markers missing in src/demo-teaser.js');
  src = src.slice(0, a) + '/* DATA-BEGIN */\nconst STILLS = {\n' + lines.join('\n') + '\n};\n' + src.slice(b); writeFileSync(file, src); console.log('packed', SPEC.map(s => s.id).join(', '));
}
