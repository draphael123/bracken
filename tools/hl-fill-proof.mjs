/* tools/hl-fill-proof.mjs - THE HIGH LINES' CAVE BACKDROP FILLS THE SCREEN (claude/cavefill, 2026-11-14; Daniel: "the backdrop doesn't fill the screen, it gets cut off", playing fullscreen). NODE ONLY, no page.
     node tools/hl-fill-proof.mjs                     the matrix: every view size the game can produce x camera extremes x shake margin: every pixel of the arena view must be covered by the cave backdrop
     node tools/hl-fill-proof.mjs --stills <outdir>   also writes PNG stills of three cases (clear colour = magenta, so a bare edge cannot hide)
   HLSRC=<path to another checkout's src> runs the same proof against that tree (master = the 'before').
   The view sizes are the game's own rule (main.js viewFor / party.js coopViewSize), re-stated here: 'close' is always 320x180; 'wide' (Camera: WIDE, and the zoomed boss view) is the display divided by one
   whole pixel-scale step out, capped 640x360; 'coop' is capped 400x225. A bare pixel anywhere in [-m, VW+m] x [-m, VH+m] (m = the shake margin) fails the run. The far peaks (the sky range) are NOT allowed to count. */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const SRC = process.env.HLSRC ? pathToFileURL(resolve(process.env.HLSRC) + '/').href : new URL('../src/', import.meta.url).href;
const argv = process.argv.slice(2), STILLS = argv.includes('--stills') ? argv[argv.indexOf('--stills') + 1] : null;
const hexRgb = c => { c = String(c); let m; if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16)]; if ((m = /^rgba?\((\d+),(\d+),(\d+)/.exec(c.replace(/\s/g, '')))) return [+m[1], +m[2], +m[3]]; return [255, 0, 255]; };
class Ctx {
  constructor(c) { this.canvas = c; this.fillStyle = '#000000'; this.globalAlpha = 1; this.imageSmoothingEnabled = false; this.ox = 0; this.oy = 0; this.skip = null; }
  get buf() { const c = this.canvas; if (!c._buf || c._buf.length !== c.width * c.height * 4) c._buf = new Uint8ClampedArray(c.width * c.height * 4); return c._buf; }
  fillRect(x, y, w, h) { const c = this.canvas, b = this.buf, [r, g, bl] = hexRgb(this.fillStyle), a = this.globalAlpha; x = Math.round(x) + this.ox; y = Math.round(y) + this.oy; w = Math.round(w); h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) { const o = (j * c.width + i) * 4, da = b[o + 3] / 255, oa = a + da * (1 - a);
      if (oa > 0) { b[o] = (r * a + b[o] * da * (1 - a)) / oa; b[o + 1] = (g * a + b[o + 1] * da * (1 - a)) / oa; b[o + 2] = (bl * a + b[o + 2] * da * (1 - a)) / oa; b[o + 3] = oa * 255; } } }
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) { if (arguments.length <= 5) { dx = sx; dy = sy; sx = 0; sy = 0; sw = img.width; sh = img.height; dw = sw; dh = sh; } if (img === this.skip) return; const s = img._buf, d = this.buf, c = this.canvas; if (!s) return;
    dx = Math.round(dx) + this.ox; dy = Math.round(dy) + this.oy;
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const X = dx + i, Y = dy + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue;
      const si = Math.min(img.width - 1, sx + Math.floor(i * sw / dw)), sj = Math.min(img.height - 1, sy + Math.floor(j * sh / dh)), so = (sj * img.width + si) * 4, o = (Y * c.width + X) * 4;
      const a = s[so + 3] / 255 * this.globalAlpha, da = d[o + 3] / 255, oa = a + da * (1 - a); if (oa > 0) { for (let k = 0; k < 3; k++) d[o + k] = (s[so + k] * a + d[o + k] * da * (1 - a)) / oa; d[o + 3] = oa * 255; } } }
  getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
}
for (const m of ['putImageData', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'fill', 'stroke', 'arc', 'ellipse', 'save', 'restore', 'setLineDash', 'clearRect', 'translate', 'scale', 'rotate']) Ctx.prototype[m] = function () {};
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => (c._g = c._g || new Ctx(c)); return c; } };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const HLB = await import(SRC + 'redraw/high_lines_back.js');
const HL = { H: 240 }, TS = 16, LH = 240;
/* ---- the game's view sizes ---- */
const viewClose = () => [320, 180];
const viewWide = (dw, dh) => { const S0 = Math.max(1, Math.floor(Math.min(dw / 320, dh / 180))), S1 = Math.max(1, Math.floor(S0 / 1.5)); return [Math.max(320, Math.min(640, Math.floor(dw / S1))), Math.max(180, Math.min(360, Math.floor(dh / S1)))]; };
const viewCoop = (dw, dh) => { const S0 = Math.max(1, Math.floor(Math.min(dw / 320, dh / 180))); if (S0 <= 1) return [Math.max(320, Math.min(400, Math.floor(dw))), Math.max(180, Math.min(225, Math.floor(dh)))]; const S1 = S0 - 1; return [Math.max(320, Math.min(400, Math.floor(dw / S1))), Math.max(180, Math.min(225, Math.floor(dh / S1)))]; };
const SCREENS = [['960x540 window', 960, 540], ['1280x720 window', 1280, 720], ['1280x800 window', 1280, 800], ['844x390 phone landscape', 844, 390], ['1920x1080 FULLSCREEN', 1920, 1080], ['1920x1200 FULLSCREEN 16:10', 1920, 1200],
  ['2560x1440 FULLSCREEN', 2560, 1440], ['2560x1080 FULLSCREEN ultrawide', 2560, 1080], ['1366x768 FULLSCREEN laptop', 1366, 768], ['1536x864 FULLSCREEN 125% scaling', 1536, 864], ['3440x1440 FULLSCREEN ultrawide', 3440, 1440], ['3840x2160 FULLSCREEN 4K', 3840, 2160]];
const CASES = []; for (const [nm, dw, dh] of SCREENS) for (const [mode, f] of [['close', viewClose], ['wide', viewWide], ['coop', viewCoop]]) { const [VW, VH] = f(dw, dh); CASES.push({ nm, mode, VW, VH }); }
const M = 16;   /* the shake margin (the camera shake / kick is capped at 8 px kick + 8 px shake) */
const ARENA = { rowTop: 30, rowFloor: 48 };
const camXs = VW => [...new Set([0, 128, 512, Math.max(0, 1280 - VW)])];
const camYs = VH => [...new Set([ARENA.rowTop * TS - 40, ARENA.rowTop * TS, 38 * TS, ARENA.rowFloor * TS - VH + 2 * TS, ARENA.rowFloor * TS - Math.round(VH * 0.6), 700, 768].map(v => Math.max(0, v)))];
function render(VW, VH, cx, cy, dYmode, bg) {
  const [c, g] = mk(VW + 2 * M, VH + 2 * M); g.ox = M; g.oy = M; g.skip = HLB.bakeFar();
  if (bg) { const [r, gg, b] = hexRgb(bg); const buf = g.buf; for (let i = 0; i < buf.length; i += 4) { buf[i] = r; buf[i + 1] = gg; buf[i + 2] = b; buf[i + 3] = 255; } }
  const dY = dYmode === 'zero' ? 0 : (LH * TS - VH) - cy;
  HLB.drawBackdrop(g, cx, cy, VW, VH, HL, 0.5, dY, true);
  return c;
}
let n = 0, bad = 0; const fails = [];
for (const k of CASES) for (const cx of camXs(k.VW)) for (const cy of camYs(k.VH)) for (const dm of ['real', 'zero']) {
  const c = render(k.VW, k.VH, cx, cy, dm), b = c._buf; let miss = 0, top = 0, bot = 0, left = 0, right = 0;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (b[(y * c.width + x) * 4 + 3] < 250) { miss++; if (y < M + 1) top++; if (y >= c.height - M - 1) bot++; if (x < M) left++; if (x >= c.width - M) right++; }
  n++; if (miss) { bad++; fails.push({ ...k, cx, cy, dm, miss, rows: miss / c.width, top, bot, left, right }); if (process.env.HLDIAG) console.log(JSON.stringify({ nm: k.nm, mode: k.mode, VH: k.VH, cx, cy, dm, miss, top, bot, left, right })); }
}
console.log('cave backdrop fill: ' + n + ' cases (' + CASES.length + ' view sizes x camera extremes x dY x shake margin ' + M + ' px): ' + (bad ? bad + ' BARE' : 'all covered'));
const byView = new Map(); for (const f of fails) { const key = f.nm + ' / ' + f.mode + ' -> ' + f.VW + 'x' + f.VH; const o = byView.get(key) || { cases: 0, worst: 0 }; o.cases++; o.worst = Math.max(o.worst, Math.round(f.rows)); byView.set(key, o); }
for (const [key, o] of byView) console.log('  BARE ' + key + ': ' + o.cases + ' cases, up to ~' + o.worst + ' bare px rows');
/* the ENTRY: as the camera climbs from the cave mouth's mountain into the arena (rows 62 -> 48) the mountain fades out under the station: the two layers together must leave nothing bare
   (expected alpha with both layers covering = sa + (1-sa)^2; a pixel under that lost one of them). Past about row 55 (cy 880) the mountain climb proper begins, where sky beside the massif is the design: asserted from the arena (row 48) down to row 54 (cy 864), where the station is still over half opaque. */
{ let en = 0, eb = 0; const ent = [];
  for (const k of CASES) for (const cy of [776, 800, 832, 864]) for (const cx of [0, 400, 1280 - k.VW]) { const sa = HLB.stationAlpha(cy), want = (sa + (1 - sa) * (1 - sa)) * 255 - 10, c = render(k.VW, k.VH, cx, cy, 'real'), b = c._buf; let bare = 0;
      for (let y = M; y < c.height - M; y++) for (const x of [M, M + 1, c.width - M - 2, c.width - M - 1]) if (b[(y * c.width + x) * 4 + 3] < want) bare++;
      for (let x = M; x < c.width - M; x++) for (const y of [c.height - M - 2, c.height - M - 1]) if (b[(y * c.width + x) * 4 + 3] < want) bare++;
      en++; if (bare) { eb++; ent.push(k.nm + '/' + k.mode + ' cy' + cy + ' cx' + cx + ' bare-edge-px ' + bare); } }
  console.log('entry transition (cave mouth -> station, ' + en + ' cases): ' + (eb ? eb + ' with a bare left/right/bottom edge' : 'no bare side or bottom edge')); for (const t of ent.slice(0, process.env.HLINFO ? 400 : 6)) console.log('  ' + t); if (eb && !process.env.HLINFO) bad++; }
const viewsSeen = new Set(CASES.map(k => k.VW + 'x' + k.VH)); console.log('distinct world views tested: ' + [...viewsSeen].join(' '));

if (STILLS) {
  mkdirSync(STILLS, { recursive: true });
  const crc = (() => { const t = new Uint32Array(256); for (let q = 0; q < 256; q++) { let c = q; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[q] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
  const png = (c, scale, file) => { const W = c.width * scale, H = c.height * scale, raw = Buffer.alloc((W * 4 + 1) * H), b = c._buf;
    for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const o = (Math.floor(y / scale) * c.width + Math.floor(x / scale)) * 4, p = y * (W * 4 + 1) + 1 + x * 4; raw[p] = b[o]; raw[p + 1] = b[o + 1]; raw[p + 2] = b[o + 2]; raw[p + 3] = 255; } }
    const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cc]); };
    const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
    writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); console.log('wrote ' + file); };
  const prefix = process.env.HLSRC ? 'before' : 'after';
  /* the reproducing case: 1536x864 / 1920x1080 / 1366x768 fullscreen, Camera WIDE; the camera at its top, middle and bottom extreme of the arena (the full 2*M margin is shown, the view is the inner rectangle) */
  for (const [nm, dw, dh] of [['1536x864', 1536, 864], ['1920x1080', 1920, 1080]]) { const [VW, VH] = viewWide(dw, dh);
    for (const [tag, cx, cy] of [['camtop', 0, ARENA.rowTop * TS - 40], ['cammid', 300, ARENA.rowFloor * TS - Math.round(VH * 0.6)], ['cambot', 640, 768]]) { if (nm === '1920x1080' && tag !== 'cammid') continue;
      png(render(VW, VH, cx, cy, 'real', '#ff00ff'), 2, STILLS + '/' + prefix + '-' + nm + '-wide-' + VW + 'x' + VH + '-' + tag + '.png'); } }
}
process.exitCode = bad ? 1 : 0;
