/* tools/sr-art-sheet.mjs - SIREN ROCKS ART as PNG contact sheets, NODE ONLY (claude/srart): the software raster stands in for the canvas, so the art is LOOKED AT with no browser.
   node tools/sr-art-sheet.mjs [outdir]   writes sr-guard-poses, sr-queen-poses (every pose labelled by move: 3x plus a 1x strip), sr-pieces (the kit), sr-room (a composed mock) */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/srart/', import.meta.url));
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


//SHEETS
const GA = await import(new URL('../src/redraw/naga_guard_art.js', import.meta.url).href);
const BG = '#171428', FLOOR = '#2a2830', CELL = '#1f1a30';
/* the guard: every pose labelled (a windup label is gold), 3x; then a 1x strip */
function guardSheet() {
  const keys = Object.keys(GA.G_POSE_SET), cw = 132, ch = 64, cols = 5, rows = Math.ceil(keys.length / cols), [c, g] = mk(cw * cols, ch * (rows + 1), BG);
  keys.forEach((k, i) => { const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + 54, cw - 8, 2);
    GA.drawGuard(g, x0 + 76, y0 + 54, 1, { pose: k, seed: 1 }, 0.3); label(g, x0 + 3, y0 + 3, k, /Tell$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  [0.0, 0.3, 0.6, 0.9].forEach((kk, i) => { const x0 = (keys.length + i) % cols * cw, y0 = Math.floor((keys.length + i) / cols) * ch; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + 54, cw - 8, 2); GA.drawGuardDead(g, x0 + 76, y0 + 54, 1, kk, 0.3); label(g, x0 + 3, y0 + 3, 'dead ' + Math.round(kk * 100)); });
  png(c, 3, 'sr-guard-poses.png'); }
guardSheet();

const QA = await import(new URL('../src/redraw/naga_queen_art.js', import.meta.url).href);
function queenSheet() {
  const keys = Object.keys(QA.Q_POSE_SET).concat(['under']), cw = 180, ch = 84, cols = 4, rows = Math.ceil((keys.length + 4) / cols), [c, g] = mk(cw * cols, ch * rows, BG);
  const cellAt = i => [(i % cols) * cw, Math.floor(i / cols) * ch];
  keys.forEach((k, i) => { const [x0, y0] = cellAt(i); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + 74, cw - 8, 2);
    QA.drawQueen(g, x0 + 100, y0 + 74, 1, { pose: k, seed: 1 }, 0.3); label(g, x0 + 3, y0 + 3, k, /Tell$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  [0.0, 0.3, 0.6, 0.9].forEach((kk, j) => { const [x0, y0] = cellAt(keys.length + j); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + 74, cw - 8, 2); QA.drawQueenDead(g, x0 + 100, y0 + 74, 1, kk, 0.3); label(g, x0 + 3, y0 + 3, 'dead ' + Math.round(kk * 100)); });
  png(c, 3, 'sr-queen-poses.png'); }
queenSheet();
if (process.env.SR_FACES) { const [c, g] = mk(4 * 70, 70, CELL); ['idle', 'song', 'venomTell', 'hurt'].forEach((k, i) => { QA.drawQueen(g, i * 70 + 30, 62, 1, { pose: k, seed: 1 }, 0.3); }); png(c, 8, 'sr-faces-debug.png'); }

/* ---- 1x strips: every pose at game scale, one row each (the file is NOT magnified: open it at 100%) ---- */
function strip(mod, fn, keys, name, cw, ch, fy, fx) { const [c, g] = mk(cw * keys.length, ch, CELL); keys.forEach((k, i) => { g.fillStyle = FLOOR; g.fillRect(i * cw + 2, fy, cw - 4, 1); fn(g, i * cw + fx, fy, k); }); png(c, 1, name); }
strip(GA, (g, x, y, k) => GA.drawGuard(g, x, y, 1, { pose: k, seed: 1 }, 0.3), Object.keys(GA.G_POSE_SET), 'sr-guard-poses-1x.png', 76, 44, 40, 40);
strip(QA, (g, x, y, k) => QA.drawQueen(g, x, y, 1, { pose: k, seed: 1 }, 0.3), Object.keys(QA.Q_POSE_SET).concat(['under']), 'sr-queen-poses-1x.png', 112, 68, 64, 68);

/* ---- the kit ---- */
const SA = await import(new URL('../src/redraw/siren_rocks_art.js', import.meta.url).href), SD = await import(new URL('../src/redraw/sea_dial.js', import.meta.url).href);
{ const [c, g] = mk(420, 250, BG); label(g, 4, 3, 'singing stone: idle / hum 40 / hum 90 / song / struck 0.8 / struck 0.3 / silent / regrow');
  const states = [{ state: 'idle' }, { state: 'hum', glow: 0.4 }, { state: 'hum', glow: 0.8 }, { state: 'song', glow: 1, chip: true }, { state: 'idle', struck: 0.8 }, { state: 'idle', struck: 0.3 }, { state: 'silent' }, { state: 'regrow' }];
  states.forEach((s, i) => { const x0 = 6 + i * 50; g.fillStyle = CELL; g.fillRect(x0, 12, 46, 56); g.fillStyle = FLOOR; g.fillRect(x0, 62, 46, 6); SA.drawStone(g, x0 + 23, 62, s, 0.4); });
  label(g, 4, 74, 'song streaks: song tell / song bite / gust bite / blowhole quiet boom spout / pumice raft / tide bell calm + ringing');
  const mkF = (s, ph) => ({ f: { ring: [ph === 'tell' ? 4 : 9, 5, 3] }, s, ph }); g.fillStyle = '#10182a'; g.fillRect(4, 82, 200, 56);
  SA.drawSong(g, mkF(0, 'tell'), -110, 30, 0.7, 420, 'song'); SA.drawSong(g, mkF(1, 'on'), -20, 30, 0.7, 420, 'song'); SA.drawSong(g, { f: { ring: [18, 5, 3] }, s: 1, ph: 'on' }, 160, 30, 0.7, 420, 'gust');
  g.fillStyle = FLOOR; g.fillRect(212, 130, 200, 8); SA.drawBlowhole(g, 230, 130, 'quiet', 0.3); SA.drawBlowhole(g, 262, 130, 'boom', 0.3); SA.drawBlowhole(g, 300, 130, 'spout', 0.3, 40);
  SA.drawRaft(g, 330, 118, 48, 0.4); SA.drawBell(g, 396, 130, 0, 0.3); SA.drawBell(g, 360, 100, 0.8, 0.3);
  label(g, 4, 146, 'dial skin (pearl): world dial + HUD + lever');
  g.fillStyle = CELL; g.fillRect(4, 154, 190, 44); SD.drawDial(g, 24, 172, { k: 0.7, ph: 'high' }, 0.3, SA.SR_SKIN); SD.drawDial(g, 54, 172, { k: 0.4, ph: 'warn', t: 1.2, coming: 'in' }, 0.3, SA.SR_SKIN); SD.drawHud(g, 80, 160, { k: 0.5, ph: 'warn', t: 1, coming: 'in' }, 0.3, SA.SR_SKIN); SD.drawLever(g, 130, 196, { thrown: false }, 0.3, SA.SR_SKIN); SD.drawLever(g, 160, 196, { thrown: true }, 0.3, SA.SR_SKIN);
  label(g, 200, 146, 'dressing on rock lips'); g.fillStyle = '#10182a'; g.fillRect(200, 154, 216, 70);
  const solid = (tx, ty) => ty >= 9 && ty <= 11 || (ty === 8 && tx % 5 < 2);
  for (let ty = 0; ty < 15; ty++) for (let tx = 0; tx < 14; tx++) if (solid(tx + 12, ty)) { g.fillStyle = (tx + ty) & 1 ? '#2a2830' : '#262a34'; g.fillRect(200 + tx * 16, 154 - 112 + ty * 16, 16, 16); }
  SA.drawDressing(g, 12 * 16 - 200, 112 - 154 + 0, 0.3, 216, 70, solid, 410);
  png(c, 3, 'sr-pieces.png'); }

/* ---- a composed room: the wreck cove: rock tiles, the wreck, stones singing over the surf, a guard, a blowhole, the raft, the bell; and the Queen's spire in a second panel ---- */
{ const VW = 320, VH = 180, [c, g] = mk(VW * 2 + 4, VH, '#0e0c18'), solid = (tx, ty) => (ty >= 27 && tx >= 211 && tx <= 240) || (ty >= 28 && tx >= 199 && tx <= 202) || (ty >= 28 && tx <= 20) || (ty >= 24 && tx >= 190 && tx <= 191);
  const panel = (ox, bgc) => { g.fillStyle = bgc; g.fillRect(ox, 0, VW, VH); g.fillStyle = '#1b1528'; g.fillRect(ox, 0, VW, 60); g.globalAlpha = 0.25; g.fillStyle = '#4e4068'; for (let i = 0; i < 6; i++) g.fillRect(ox + i * 56, 40 + (i & 1) * 8, 40, 20); g.globalAlpha = 1; };
  /* panel 1: x from col 205 (cx = 205*16), camera y so that row 27 sits at y 120 */
  const cx = 205 * 16, cy = 27 * 16 - 120; panel(0, '#141626');
  for (let ty = 20; ty < 40; ty++) for (let tx = 205; tx < 226; tx++) { const x = tx * 16 - cx, y = ty * 16 - cy; if (solid(tx, ty)) { g.fillStyle = (tx + ty) & 1 ? '#2a2830' : '#262a34'; g.fillRect(x, y, 16, 16); if (!solid(tx, ty - 1)) { g.fillStyle = '#4a5a6e'; g.fillRect(x, y, 16, 2); g.fillStyle = '#6a7a8a'; g.fillRect(x + 1, y, 14, 1); } } }
  g.fillStyle = '#275e6c'; g.globalAlpha = 0.55; g.fillRect(0, 33 * 16 - cy - 20, VW, 80); g.globalAlpha = 1;
  SA.drawWreck(g, cx, cy, 0.3, VW); SA.drawDressing(g, cx, cy, 0.3, VW, VH, solid, 410);
  SA.drawStone(g, 214 * 16 + 8 - cx, 27 * 16 - cy, { state: 'song', glow: 1 }, 0.3); SA.drawSong(g, { f: { ring: [214, 24, 9] }, s: 1, ph: 'on' }, cx, cy, 0.5, VW, 'song');
  SA.drawStone(g, 219 * 16 + 8 - cx, 27 * 16 - cy, { state: 'silent' }, 0.3);
  GA.drawGuard(g, 224 * 16 - cx, 27 * 16 - cy, -1, { mode: 'spearTell', seed: 1 }, 0.3); GA.drawGuard(g, 207 * 16 - cx, 27 * 16 - cy, 1, { mode: 'coilTell', seed: 1 }, 0.3);
  SA.drawBlowhole(g, 210 * 16 - cx, 27 * 16 - cy, 'quiet', 0.3); SA.drawBell(g, 238 * 16 - cx + 8, 27 * 16 - cy, 0, 0.3); SA.drawRaft(g, 206 * 16 - cx + 20, 27 * 16 - cy + 28, 40, 0.3);
  SD.drawDial(g, 300, 96, { k: 0.6, ph: 'warn', t: 1.2, coming: 'in' }, 0.3, SA.SR_SKIN); SD.drawHud(g, 6, 30, { k: 0.6, ph: 'warn', t: 1, coming: 'in' }, 0.3, SA.SR_SKIN);
  /* panel 2: the spire */
  const ox = VW + 4; panel(ox, '#18142a'); g.fillStyle = '#2a2830'; g.fillRect(ox, 140, VW, 40); g.fillStyle = '#4a5a6e'; g.fillRect(ox, 140, VW, 2); g.fillStyle = '#342c4a'; g.fillRect(ox + 8, 112, 60, 28); g.fillRect(ox + 252, 112, 60, 28);
  g.save && g.save(); const sub = (x, y, f) => f(g, ox + x, y);
  SA.drawStone(g, ox + 40, 112, { state: 'song', glow: 1, arena: true, chip: true }, 0.3); SA.drawStone(g, ox + 282, 112, { state: 'hum', glow: 0.5 }, 0.3);
  QA.drawQueen(g, ox + 170, 140, -1, { mode: 'songTell', seed: 1 }, 0.3); SA.drawSong(g, { f: { ring: [0, 0, 0] }, s: 0, ph: 'off' }, 0, 0, 0, VW, 'song');
  png(c, 3, 'sr-room.png'); }
