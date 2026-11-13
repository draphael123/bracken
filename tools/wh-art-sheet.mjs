import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/whaleart/', import.meta.url));
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
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const X = Math.round(dx) + i, Y = Math.round(dy) + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; const si = Math.min(img.width - 1, sx + Math.floor(i * sw / dw)), sj = Math.min(img.height - 1, sy + Math.floor(j * sh / dh)), so = (sj * img.width + si) * 4, o = (Y * c.width + X) * 4;
      const a = s[so + 3] / 255 * this.globalAlpha, da = d[o + 3] / 255, oa = a + da * (1 - a); if (oa > 0) { for (let k = 0; k < 3; k++) d[o + k] = (s[so + k] * a + d[o + k] * da * (1 - a)) / oa; d[o + 3] = oa * 255; } } }
  getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; } putImageData() {} beginPath() {} moveTo() {} lineTo() {} closePath() {} fill() {} stroke() {} arc() {} ellipse() {} save() {} restore() {} setLineDash() {} createLinearGradient() { return { addColorStop() {} }; }
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

/* ---- a 3x5 label font (A-Z 0-9 . - / ( ) ) ---- */
const FONT = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '.': '000000000000010', '-': '000000111000000', '/': '001001010100100', ' ': '000000000000000', '(': '010100100100010', ')': '010001001001010', '+': '000010111010000' };
const label = (g, x, y, s, col = '#c9d8d0') => { g.fillStyle = col; let cx = x; for (const ch of String(s).toUpperCase()) { const m = FONT[ch] || FONT[' ']; for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(cx + (i % 3), y + Math.floor(i / 3), 1, 1); cx += 4; } };




//SHEETS - THE WHALE (claude/whaleart): the Gastric Polyp, the Parasite Queen, the level kit, composed rooms.   node tools/wh-art-sheet.mjs [outdir]
const BG = '#0e0a10', FLOOR = '#3a1a24', CELL = '#1c1018';
const PA = await import(new URL('../src/redraw/gastric_polyp_art.js', import.meta.url).href);
const QA = await import(new URL('../src/redraw/parasite_queen_art.js', import.meta.url).href);
const WA = await import(new URL('../src/redraw/whale_art.js', import.meta.url).href);
const KA = await import(new URL('../src/redraw/deep3_art.js', import.meta.url).href);
const blit = (dst, src, x, y) => { dst.drawImage(src, x, y); };

/* ---- the Polyp: every pose at 4x (faces!), windups gold ---- */
{ const keys = PA.poseNames(), cw = 56, ch = 52, cols = 5, rows = Math.ceil((keys.length + 3) / cols), [c, g] = mk(cw * cols, ch * rows, BG);
  const cellAt = i => [(i % cols) * cw, Math.floor(i / cols) * ch];
  keys.forEach((k, i) => { const [x0, y0] = cellAt(i); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 3, y0 + ch - 8, cw - 6, 8);
    PA.drawPolyp(g, x0 + 26, y0 + ch - 8, 1, { pose: k, seed: 1, h: k === 'polypSwell' ? 14 : k === 'polypShrink' ? 12 : undefined }, 0.3); label(g, x0 + 3, y0 + 3, k.replace('polyp', ''), /Wind$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  [0.0, 0.4, 0.8].forEach((kk, j) => { const [x0, y0] = cellAt(keys.length + j); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 3, y0 + ch - 8, cw - 6, 8); PA.drawPolypDead(g, x0 + 26, y0 + ch - 8, 1, kk, 0.3); label(g, x0 + 3, y0 + 3, 'fall ' + kk, '#c9d8d0'); });
  png(c, 4, 'wh-polyp-poses.png'); }
/* ---- the Polyp's face: out vs tell vs spit, drawn at 1x then shown at 8x ---- */
{ const [c, g] = mk(120, 40, BG); g.fillStyle = FLOOR; g.fillRect(0, 34, 120, 6); ['polypOut', 'polypSpitWind', 'polypSpit'].forEach((k, i) => PA.drawPolyp(g, 20 + i * 40, 34, 1, { pose: k, seed: 1 }, 0.3)); png(c, 8, 'wh-polyp-face.png'); }

/* ---- the Queen: every pose, 3x ---- */
function queenSheet(keys, name) {
  const cw = 130, ch = 92, cols = 5, rows = Math.ceil((keys.length + 4) / cols), [c, g] = mk(cw * cols, ch * rows, BG), cellAt = i => [(i % cols) * cw, Math.floor(i / cols) * ch];
  keys.forEach((k, i) => { const [x0, y0] = cellAt(i); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 3, y0 + ch - 10, cw - 6, 10);
    QA.drawQueen(g, x0 + 60, y0 + ch - 10, 1, { pose: k, phase: (k === 'qSkitIdle' || k === 'qSkitter' || k === 'qHop' || k === 'qStranded') ? 2 : 1, seed: 1 }, 0.3); label(g, x0 + 3, y0 + 3, k, /Wind$/.test(k) || k === 'qUproot' ? '#ffd36b' : '#c9d8d0'); });
  [0.0, 0.3, 0.6, 0.9].forEach((kk, j) => { const [x0, y0] = cellAt(keys.length + j); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 3, y0 + ch - 10, cw - 6, 10); QA.drawQueenDead(g, x0 + 60, y0 + ch - 10, 1, kk, 0.3); label(g, x0 + 3, y0 + 3, 'fall ' + kk, '#c9d8d0'); });
  png(c, 3, name); }
queenSheet(QA.poseNames(), 'wh-queen-poses.png');
/* the three phases side by side, then the tell of each told move */
{ const cw = 120, ch = 90, [c, g] = mk(cw * 4, ch * 2, BG);
  [['qIdle', 1], ['qSkitIdle', 2], ['qIdle', 3], ['qFlushed', 1]].forEach(([k, ph], i) => { g.fillStyle = CELL; g.fillRect(i * cw + 1, 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(i * cw + 3, ch - 10, cw - 6, 10); QA.drawQueen(g, i * cw + 56, ch - 10, 1, { pose: k, phase: ph, seed: 1 }, 0.3); label(g, i * cw + 3, 3, 'P' + ph + ' ' + k, '#c9d8d0'); });
  ['lash', 'spit', 'thrum', 'constrict'].forEach((mv, i) => { g.fillStyle = CELL; g.fillRect(i * cw + 1, ch + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(i * cw + 3, 2 * ch - 10, cw - 6, 10); QA.drawQueen(g, i * cw + 54, 2 * ch - 10, 1, { pose: QA.WINDS[mv][0], phase: 1, seed: 1 }, 0.3); label(g, i * cw + 3, ch + 3, mv + ' tell', '#ffd36b'); });
  png(c, 3, 'wh-queen-phases.png'); }
/* the Queen's face, big: idle / spit wind / wake */
{ const [c, g] = mk(230, 60, BG); g.fillStyle = FLOOR; g.fillRect(0, 54, 230, 6); ['qIdle', 'qSpitWind', 'qWake'].forEach((k, i) => QA.drawQueen(g, 34 + i * 76, 54, 1, { pose: k, seed: 1, still: true }, 0.3)); png(c, 5, 'wh-queen-face.png'); }

/* ---- the kit ---- */
{ const [c, g] = mk(470, 330, BG);
  label(g, 4, 3, 'nerve: idle / glow / flare / spent | membrane: shut / quiver / sealed / open | heart: rest / beat / fast | tongue | raft | lung');
  [{ glow: 0.55 }, { glow: 0.9 }, { glow: 1, flare: 0.5 }, { cool: 4, glow: 0.15 }].forEach((st, i) => { g.fillStyle = '#4a1a28'; g.fillRect(8 + i * 34, 28, 30, 6); WA.drawNerve(g, 23 + i * 34, 30, st, 0.3 + i * 0.1); });
  [{ kind: 'breath' }, { kind: 'breath', quiver: 1 }, { kind: 'sealed' }, { kind: 'sealed', open: true }].forEach((st, i) => { g.fillStyle = '#26121a'; g.fillRect(150 + i * 44, 14, 38, 100); WA.drawMembrane(g, 153 + i * 44, 18, 32, 92, st, 0.4); });
  [[0, 1], [1, 1], [0.8, 1.6]].forEach(([b, r], i) => { g.fillStyle = '#26121a'; g.fillRect(326 + i * 48, 4, 46, 100); WA.drawHeart(g, 349 + i * 48, 70, b, r, 0.3); });
  g.fillStyle = '#26121a'; g.fillRect(4, 44, 140, 54); WA.drawTongue(g, 10, 60, 64, 0.3); WA.drawTongue(g, 80, 70, 56, 0.9); WA.drawRaft(g, 14, 88, 56, 0.3); WA.drawRaft(g, 84, 88, 48, 0.8);
  g.fillStyle = '#26121a'; g.fillRect(4, 104, 200, 22); [1, 0.6, 0.2].forEach((f, i) => WA.drawLung(g, 8 + i * 66, 110, f, i === 2, 0.3));
  label(g, 4, 132, 'bile surface | flesh by section: maw / tongue / gullet / stomach / rib / heart');
  g.fillStyle = '#10181a'; g.fillRect(4, 140, 200, 40); WA.drawBile(g, 6, 202, 148, 30, 0.3);
  const sections = [['maw', 20], ['tongue', 60], ['gullet', 140], ['stomach', 200], ['rib', 280], ['heart', 340]];
  sections.forEach(([nm, tx0], i) => { const px = 4 + (i % 3) * 154, py = 188 + Math.floor(i / 3) * 70, [cc, gg] = mk(150, 66, '#08050a');
    const solid = (tx, ty) => { const lx = tx - tx0, ly = ty - 40; if (lx < 0 || lx >= 10) return false; return ly >= 3 || ly <= 0 || ((lx === 2 || lx === 3) && ly < 3); };
    WA.drawFleshTex(gg, tx0 * 16, 40 * 16, 0.3, 150, 66, solid, 400, 48); blit(g, cc, px, py); label(g, px + 2, py + 2, nm, '#ffe8ee'); });
  png(c, 3, 'wh-kit.png'); }
/* the Queen's floor pieces: lash tell / burst, thrum ridge, tendrils (tell, pull), eggs (fresh, ripe), crush floor (tell, heave), globs, the rings */
{ const [c, g] = mk(420, 130, BG); g.fillStyle = FLOOR; g.fillRect(0, 100, 420, 30); label(g, 4, 3, 'lash tell / lash | thrum ridges | tendrils tell / pull | eggs | crush tell / heave | globs | rings');
  QA.drawLash(g, 30, 100, 22, 30, 'tell', 0.3); QA.drawLash(g, 90, 100, 22, 30, 'rel', 0.3, 1); QA.drawThrumRing(g, 140, 100, 12, -1, 0.3); QA.drawThrumRing(g, 160, 100, 12, 1, 0.3);
  QA.drawTendril(g, 190, 70, 260, 90, 0, 0.3); QA.drawTendril(g, 190, 60, 260, 60, 1, 0.3); QA.drawEgg(g, 280, 100, 0.1, 0.3); QA.drawEgg(g, 300, 100, 0.9, 0.3);
  QA.drawCrushFloor(g, 320, 370, 100, 14, false, 0.3); QA.drawCrushFloor(g, 372, 416, 100, 14, true, 0.3); PA.drawGlob(g, 60, 30, 80, -40, 0.3); PA.drawGlob(g, 90, 30, 80, 40, 0.3, 'egg');
  KA.drawOpenRing(g, 140, 40, 22, 0.3); KA.drawWardRing(g, 200, 40, 22, 0.3);
  png(c, 3, 'wh-kit2.png'); }

/* ---- composed rooms: the tongue and teeth (maw), the stomach (polyps, bile), the heart chamber (the Queen) ---- */
{ const VW = 320, VH = 180, [c, g] = mk(VW * 3 + 8, VH, '#0a0508');
  const room = (tx0, build, ox) => { const [cc, gg] = mk(VW, VH, '#12080e');
    const solid = (tx, ty) => build.solid(tx - tx0, ty - 36);
    for (let j = 0; j < VH; j += 16) for (let i = 0; i < VW; i += 16) { gg.fillStyle = ((i / 16 + j / 16) & 1) ? '#1a0c12' : '#1c0e14'; gg.fillRect(i, j, 16, 16); }
    for (let ty = 36; ty < 48; ty++) for (let tx = tx0; tx < tx0 + 20; tx++) if (solid(tx, ty)) { gg.fillStyle = '#3a3a44'; gg.fillRect((tx - tx0) * 16, (ty - 36) * 16, 16, 16); }
    WA.drawFleshTex(gg, tx0 * 16, 36 * 16, 0.3, VW, VH, solid, 400, 48); build.draw(gg); blit(g, cc, ox, 0); };
  room(60, { solid: (lx, ly) => lx >= 0 && lx < 20 && (ly >= 6 || ly <= 1 || (lx === 14 && ly < 3)), draw: gg => {
    WA.drawBile(gg, 20, 130, 112, 40, 0.3); WA.drawRaft(gg, 50, 112, 48, 0.3); WA.drawTongue(gg, 140, 92, 64, 0.3);
    PA.drawPolyp(gg, 252, 96, -1, { mode: 'out', seed: 0.5 }, 0.3); PA.drawPolyp(gg, 280, 96, -1, { mode: 'in', seed: 0.5 }, 0.3);
    WA.drawNerve(gg, 20, 96, { glow: 0.7 }, 0.3); WA.drawMembrane(gg, 200, 24, 32, 72, { kind: 'breath' }, 0.3); WA.drawLung(gg, 130, 4, 0.7, false, 0.3); } }, 0);
  room(200, { solid: (lx, ly) => lx >= 0 && lx < 20 && (ly >= 6 || ly <= 0 || (lx >= 4 && lx <= 7 && ly >= 4)), draw: gg => {
    WA.drawBile(gg, 20, 250, 118, 40, 0.3); PA.drawPolyp(gg, 120, 96, 1, { mode: 'spitTell', seed: 0.5 }, 0.3); PA.drawPolyp(gg, 200, 96, -1, { mode: 'out', seed: 1.5 }, 0.3);
    PA.drawGlob(gg, 160, 50, 60, 120, 0.3); PA.drawPolyp(gg, 40, 96, 1, { mode: 'spit', seed: 0.2 }, 0.3); WA.drawNerve(gg, 280, 96, { flare: 0.4, glow: 1 }, 0.3); } }, VW + 4);
  room(340, { solid: (lx, ly) => lx >= 0 && lx < 20 && (ly >= 6 || ly <= 0), draw: gg => {
    WA.drawHeart(gg, 160, 52, 0.7, 1, 0.3); QA.drawQueen(gg, 160, 96, -1, { mode: 'idle', phase: 1, seed: 1 }, 0.3); QA.drawLash(gg, 60, 96, 22, 30, 'tell', 0.3); WA.drawNerve(gg, 20, 96, { glow: 0.8 }, 0.3);
    QA.drawQueen(gg, 270, 96, 1, { mode: 'spitTell', phase: 1, seed: 2 }, 0.3); WA.drawNerve(gg, 300, 96, { cool: 3 }, 0.3); } }, VW * 2 + 8);
  png(c, 2, 'wh-room.png'); }
