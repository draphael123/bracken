/* tools/hl-art-sheet.mjs - THE HIGH LINES' ART as PNG contact sheets, NODE ONLY (claude/hlart): a tiny software raster stands in for the canvas (fillRect with alpha, drawImage of a baked layer), so the art can be
   LOOKED AT with no browser (the method of tools/pf-art-sheet.mjs).   node tools/hl-art-sheet.mjs [outdir]
   writes: hookjack.png (every pose, x4), skyhook.png (every pose + trolley, hook, lever, rag, x3), tiles.png (the kit on the real level, x2), backdrop.png (the cave mouth at five heights, x2),
   scenes.png (composed stills: tiles + supports + dressing + lines + foes at 7 camera spots, x2), machinery.png (winch, points, post, hopper, cab, cage + ballast, grip, parted line, x3) */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/hl-art/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const hexRgb = c => { c = String(c); let m; if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16)]; if ((m = /^rgba?\((\d+),(\d+),(\d+)/.exec(c.replace(/\s/g, '')))) return [+m[1], +m[2], +m[3]]; return [255, 0, 255]; };
class Ctx {
  constructor(c) { this.canvas = c; this.fillStyle = '#000000'; this.globalAlpha = 1; this.strokeStyle = '#000'; this.lineWidth = 1; this.imageSmoothingEnabled = false; }
  get buf() { const c = this.canvas; if (!c._buf || c._buf.length !== c.width * c.height * 4) c._buf = new Uint8ClampedArray(c.width * c.height * 4); return c._buf; }
  fillRect(x, y, w, h) { const c = this.canvas, b = this.buf, [r, g, bl] = hexRgb(this.fillStyle), a = this.globalAlpha; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) { const o = (j * c.width + i) * 4, da = b[o + 3] / 255, oa = a + da * (1 - a);
      if (oa > 0) { b[o] = (r * a + b[o] * da * (1 - a)) / oa; b[o + 1] = (g * a + b[o + 1] * da * (1 - a)) / oa; b[o + 2] = (bl * a + b[o + 2] * da * (1 - a)) / oa; b[o + 3] = oa * 255; } } }
  clearRect(x, y, w, h) { const c = this.canvas, b = this.buf; for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) b[(j * c.width + i) * 4 + 3] = 0; }
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) { if (arguments.length <= 5) { dx = sx; dy = sy; sx = 0; sy = 0; sw = img.width; sh = img.height; dw = sw; dh = sh; } const s = img._buf, d = this.buf, c = this.canvas; if (!s) return;
    dx = Math.round(dx); dy = Math.round(dy);
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const X = dx + i, Y = dy + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; const si = Math.min(img.width - 1, sx + Math.floor(i * sw / dw)), sj = Math.min(img.height - 1, sy + Math.floor(j * sh / dh)), so = (sj * img.width + si) * 4, o = (Y * c.width + X) * 4;
      const a = s[so + 3] / 255 * this.globalAlpha, da = d[o + 3] / 255, oa = a + da * (1 - a); if (oa > 0) { for (let k = 0; k < 3; k++) d[o + k] = (s[so + k] * a + d[o + k] * da * (1 - a)) / oa; d[o + 3] = oa * 255; } } }
  getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; } putImageData() {} beginPath() {} moveTo() {} lineTo() {} closePath() {} fill() {} stroke() {} arc() {} ellipse() {} save() {} restore() {} setLineDash() {} translate() {} scale() {} rotate() {} createLinearGradient() { return { addColorStop() {} }; }
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => (c._g = c._g || new Ctx(c)); return c; } };
const mk = (w, h, bg) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const crc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
function png(c, scale, name) {
  const W = c.width * scale, H = c.height * scale, raw = Buffer.alloc((W * 4 + 1) * H), b = c._buf;
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const o = (Math.floor(y / scale) * c.width + Math.floor(x / scale)) * 4, p = y * (W * 4 + 1) + 1 + x * 4, a = b[o + 3] / 255; raw[p] = b[o] * a + 20 * (1 - a); raw[p + 1] = b[o + 1] * a + 20 * (1 - a); raw[p + 2] = b[o + 2] * a + 28 * (1 - a); raw[p + 3] = 255; } }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cc]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  writeFileSync(OUT + name, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); console.log('wrote ' + OUT + name + ' ' + W + 'x' + H);
}
const U = f => import(new URL('../src/' + f, import.meta.url).href);
const HLT = await U('redraw/high_lines_tiles.js'), HLB = await U('redraw/high_lines_back.js'), HLA = await U('redraw/high_lines_art.js'), CREW = await U('redraw/line_crew_art.js'), LKT = await U('line-kit.js');
const { LEVELS, T } = await U('level.js'); const SKH = await U('skyhook-hands.js');
const L = LEVELS.find(l => l.id === 'highlines').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const skyGrad = (g, VW, VH, a, b) => { const A = hexRgb('#' + a.map(v => v.toString(16).padStart(2, '0')).join('')), B = hexRgb('#' + b.map(v => v.toString(16).padStart(2, '0')).join('')); for (let y = 0; y < VH; y++) { g.fillStyle = '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * y / VH).toString(16).padStart(2, '0')).join(''); g.fillRect(0, y, VW, 1); } };
const kit = LKT.lineInit(L);

/* ---- the Hookjack: every pose, x4 ---- */
{ const list = CREW.HOOKJACK_POSES, cw = 56, ch = 52, cols = 7, rows = Math.ceil(list.length / cols), [c, g] = mk(cw * cols, ch * rows, '#5a6c84');
  const modeOf = { ride0: 'ride', ride1: 'ride', tell0: 'tell', tell1: 'tell', swipe: 'swipe', spin0: 'spin', spin1: 'spin', fall0: 'fall', fall1: 'fall', saw0: 'saw', saw1: 'saw', foot0: 'foot', foot1: 'foot', foot2: 'foot', foot3: 'foot' };
  list.forEach((n, i) => { const x = (i % cols) * cw + 26, y = Math.floor(i / cols) * ch + 46, k = +n.slice(-1) || 0, time = (n.startsWith('tell') ? (k ? 0.14 : 0.0) : n.startsWith('spin') ? (k ? 0.1 : 0.0) : n.startsWith('fall') ? (k ? 0.12 : 0.0) : n.startsWith('saw') ? (k ? 0.08 : 0.0) : 0.0);
    g.fillStyle = '#3a4658'; g.fillRect(i % cols * cw + 2, y, cw - 4, 2);
    const e = { x: x, y: y, face: 1, mode: modeOf[n], anim: n.startsWith('ride') ? k / 3 + 0.01 : n.startsWith('foot') ? (k + 0.1) / 5 : 0, sawT: 1.1, flash: 0 }; CREW.drawHookjack(g, e, 0, 0, time); });
  png(c, 4, 'hookjack.png'); }

/* ---- Skyhook: every pose ---- */
{ const P = SKH.POSE, list = Object.keys(P), cw = 76, ch = 76, cols = 7, rows = Math.ceil(list.length / cols), [c, g] = mk(cw * cols, ch * rows, '#4a5870');
  list.forEach((m, i) => { const x = (i % cols) * cw + 38, y = Math.floor(i / cols) * ch + 64; g.fillStyle = '#2a3446'; g.fillRect(i % cols * cw + 2, y, cw - 4, 2); if (P[m].grip || m === 'ride' || m === 'swing' || m === 'dropTell') CREW.drawSkyTrolley(g, x, y - 46, 1, 0.1);
    CREW.drawRiggerArt(g, P[m], false, 0.1, m === 'cutTell' || m === 'cut' || m === 'swingTell' || m === 'swing' ? 2 : 1, x, y, 1); });
  { const i = list.length, x0 = (i % cols) * cw + 8, y0 = Math.floor(i / cols) * ch;
    CREW.drawSkyHook(g, x0 + 12, y0 + 18, 1, 0.1); CREW.chainLine(g, x0 + 14, y0 + 18, x0 + 60, y0 + 10, 0); CREW.drawLeverArt(g, x0 + 24, y0 + 62, 0, false, false, 0); CREW.drawLeverArt(g, x0 + 54, y0 + 62, 1, true, true, 0.01); CREW.drawRag(g, x0 + 40, y0 + 30, 0.1); }
  png(c, 3, 'skyhook.png'); }

/* ---- the tile kit on the real level: five spans by zone, tiles + supports + dressing ---- */
const decor = []; HLT.dress(decor, L, at, T); HLA.dress(decor, L, at, T);
function scene(g, cx, cy, VW, VH, time = 0.2, o = {}) {
  const p = HLB.climbOf(cy, VH, L); skyGrad(g, VW, VH, [86, 112, 160], [196, 206, 222]);
  HLB.drawBackdrop(g, cx, cy, VW, VH, L, time, 0, true);
  for (let y = Math.max(0, Math.floor(cy / 16)); y <= Math.min(L.H - 1, Math.floor((cy + VH) / 16)); y++) for (let x = Math.max(0, Math.floor(cx / 16)); x <= Math.min(L.W - 1, Math.floor((cx + VW) / 16)); x++) { const t = at(x, y); if (t === T.AIR) continue; const s = HLT.hlTile(t, x, y, at, T, L); if (s) g.drawImage(s, x * 16 - cx, y * 16 - cy); else { g.fillStyle = '#ff00ff'; g.fillRect(x * 16 - cx, y * 16 - cy, 16, 16); } }
  for (const s of L.routeSupports || []) HLT.drawGantry(g, s, cx, cy);
  for (const d of decor) if (d.x > cx - 120 && d.x < cx + VW && d.y > cy - 80 && d.y < cy + VH) g.drawImage(d.c, d.x - cx, d.y - cy);
  HLA.drawLines(g, kit, cx, cy, VW, VH, time, o.riders || []);
  for (const e of L.ents) if (e.t === 'hookjack') { const z = e.line && kit.lines[e.line]; const x = e.x * 16 + 8; if (x < cx - 20 || x > cx + VW + 20) continue; const ride = z && e.role !== 'cutter'; const y = ride ? LKT.lineY(z, x) + 24 : (e.y + 1) * 16; CREW.drawHookjack(g, { x, y, face: e.dir || -1, mode: ride ? 'ride' : 'perch', anim: 0.2, sawT: 1, flash: 0 }, cx, cy, time); }
  for (const e of L.ents) if (e.t === 'check' || e.t === 'sign') { const x = e.x * 16 + 8 - cx, y = (e.y + 1) * 16 - cy; if (e.t === 'check') { g.fillStyle = '#e8c23a'; g.fillRect(x - 1, y - 18, 2, 18); g.fillStyle = '#d04040'; g.fillRect(x + 1, y - 18, 8, 6); } }
  if (o.arena) { const A = L.arena; for (const lv of A.levers) CREW.drawLeverArt(g, lv.x - cx, A.floor - cy, 0, true, o.now, time); const P = SKH.POSE; CREW.drawRiggerArt(g, P[o.pose || 'perch'], false, time, 1, A.perchE.x - cx, A.perchE.y - cy, -1);
    if (o.hl) { const hlz = A.line, x = (hlz.xa + hlz.xb) / 2; CREW.drawSkyTrolley(g, x - cx, hlz.ya - cy + 14 - 4, 1, time); CREW.drawRiggerArt(g, P.ride, false, time, 1, x - cx, hlz.ya - cy + 40 + 14 - 4 + 4, 1); } for (const sx of [A.line.xa + 120, A.line.xb - 120]) CREW.drawRag(g, sx - cx, A.line.ya - cy + 8, time); }
  g.fillStyle = '#e8d070'; g.fillRect(2, 2, 40, 6); g.fillStyle = '#000'; if (o.label) { /* label drawn by the sheet caption (no font): a bar width marks the climb */ g.fillStyle = '#ffffff'; g.fillRect(4, 4, Math.round(36 * p), 2); }
}
{ const spots = [[0, 14 * 16, 'foothold'], [0, 86 * 16 - 20, 'x'], [0, 0, 'x']]; void spots;
  const VW = 320, VH = 180, shots = [[0, 3500], [8, 3180], [150, 2780], [880, 2180], [0, 1790], [0, 1480], [300, 1150], [550, 850], [224, 598], [224, 598]];
  const names = shots.length, cols = 2, rows = Math.ceil(names / cols), [c, g] = mk(VW * cols, VH * rows, '#10131a');
  shots.forEach(([cx, cy], i) => { const [cc, gg] = mk(VW, VH); scene(gg, cx, cy, VW, VH, 0.2 + i * 0.37, i === 8 ? { arena: true } : i === 9 ? { arena: true, hl: true, pose: 'hookTell', now: true } : {}); g.drawImage(cc, (i % cols) * VW, Math.floor(i / cols) * VH); });
  png(c, 2, 'scenes.png'); }
{ const spans = [[0, 3560, 20, 15], [24, 3210, 20, 15], [8, 2800, 20, 15], [40, 1880, 20, 15], [0, 640, 20, 15]], VW = 320, VH = 240, [c, g] = mk(VW * 3, VH * 2, '#10131a');
  spans.forEach(([cx, cy], i) => { const [cc, gg] = mk(VW, VH); scene(gg, cx * 16, cy, VW, VH, 0.3); g.drawImage(cc, (i % 3) * VW, Math.floor(i / 3) * VH); }); png(c, 2, 'tiles.png'); }

/* ---- the backdrop at five heights (the cave mouth grows) ---- */
{ const VW = 320, VH = 180, hs = [0, 0.3, 0.6, 0.85, 1], [c, g] = mk(VW * 3, VH * 2, '#10131a');
  const ymax = L.H * 16 - VH; hs.forEach((p, i) => { const [cc, gg] = mk(VW, VH); skyGrad(gg, VW, VH, [86, 112, 160], [196, 206, 222]); HLB.drawBackdrop(gg, 600, Math.round((1 - p) * ymax), VW, VH, L, 0.5, 0, true); g.drawImage(cc, (i % 3) * VW, Math.floor(i / 3) * VH); });
  { const [cc, gg] = mk(VW, VH); gg.fillStyle = '#10131a'; gg.fillRect(0, 0, VW, VH); gg.drawImage(HLB.bakeMountain(), 0, 0, 320, 300, 0, 0, 213, 200); g.drawImage(cc, 2 * VW, VH); }
  png(c, 2, 'backdrop.png'); }

/* ---- the machinery, close: pieces out of the kit ---- */
{ const [c, g] = mk(360, 210, '#4c5c78'), time = 0.3;
  const sc = [['W1', 0, 3560], ['W3', 500, 3300]]; void sc;
  /* a bare stage: draw selected lines of the real kit around their ends */
  const part = (id, cx, cy, ox, oy) => { const [cc, gg] = mk(120, 100); skyGrad(gg, 120, 100, [86, 112, 160], [150, 166, 190]); const z = kit.lines[id]; HLA.drawLines(gg, { ...kit, list: [z], posts: [], cabs: [], weights: [], winds: [] }, cx, cy, 120, 100, time, id === 'W1' ? [{ id: 'W1', x: 100, haul: 0.3 }] : []); g.drawImage(cc, ox, oy); };
  part('W1', kit.lines.W1.x1 - 80, kit.lines.W1.y1 - 60, 0, 0); part('W3', kit.lines.W3.x1 - 30, kit.lines.W3.y1 - 56, 120, 0); part('F1', kit.lines.F1.x0 - 20, kit.lines.F1.y0 - 40, 240, 0);
  { const [cc, gg] = mk(120, 100); skyGrad(gg, 120, 100, [86, 112, 160], [150, 166, 190]); HLA.drawLines(gg, { ...kit, list: [], winds: [], cabs: [], weights: [] }, kit.posts.find(p => p.kind === 'hopper').x - 60, kit.posts.find(p => p.kind === 'hopper').y - 60, 120, 100, time); g.drawImage(cc, 0, 100); }
  { const z = kit.lines.GD, cab = kit.cabs[0]; const [cc, gg] = mk(120, 100); skyGrad(gg, 120, 100, [86, 112, 160], [150, 166, 190]); HLA.drawLines(gg, { ...kit, list: [z], posts: [], winds: [], weights: [] }, cab.x - 60, cab.hookY - 36, 120, 100, time); g.drawImage(cc, 120, 100); }
  { const [cc, gg] = mk(120, 100); skyGrad(gg, 120, 100, [86, 112, 160], [150, 166, 190]); const W = kit.weights[0], cx0 = W.d.a.x0 * 16 - 8, cy0 = W.d.a.top * 16 - 50; HLA.drawLines(gg, { ...kit, list: [], posts: [], cabs: [], winds: [] }, cx0, cy0, 120, 100, time); g.drawImage(cc, 240, 100); }
  png(c, 3, 'machinery.png'); }
console.log('done');
