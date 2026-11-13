import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/d3art/', import.meta.url));
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
const BG = '#0e1a22', FLOOR = '#26323a', CELL = '#142430';
const CA = await import(new URL('../src/redraw/drowned_crew_art.js', import.meta.url).href);
/* one sheet per crewman (every pose labelled, windups gold), 3x; a 1x strip of all of them */
function crewSheet(role, name) {
  const keys = CA.poseNames(role), cw = role === 'sailor' ? 150 : 100, ch = role === 'sailor' ? 120 : role === 'heavy' ? 84 : 64, cols = 6, n = keys.length + 4, rows = Math.ceil(n / cols), [c, g] = mk(cw * cols, ch * rows, BG);
  const cellAt = i => [(i % cols) * cw, Math.floor(i / cols) * ch], fy = ch - 8, fx = role === 'sailor' ? 70 : 46;
  keys.forEach((k, i) => { const [x0, y0] = cellAt(i); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + fy, cw - 8, 2);
    CA.drawCrew(g, x0 + fx, y0 + fy, 1, { role, stance: CA.stanceOfPose(k) || 'cutlass', pose: k, seed: 1 }, 0.3); label(g, x0 + 3, y0 + 3, k, /Wind$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  [0.0, 0.3, 0.6, 0.9].forEach((kk, j) => { const [x0, y0] = cellAt(keys.length + j); g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + fy, cw - 8, 2); CA.drawCrewDead(g, x0 + fx, y0 + fy, 1, kk, 0.3, { role }); label(g, x0 + 3, y0 + 3, 'fall ' + Math.round(kk * 100)); });
  png(c, 3, name); }
crewSheet('cutlass', 'd3-cutlass-poses.png'); crewSheet('shield', 'd3-shield-poses.png'); crewSheet('harpoon', 'd3-harpoon-poses.png'); crewSheet('heavy', 'd3-heavy-poses.png'); crewSheet('sailor', 'd3-sailor-poses.png');
/* the Sailor's four stances, idle + each windup/release */
{ const st = ['cutlass', 'shield', 'harpoon', 'anchor'], mv = { cutlass: ['cutLungeWind', 'cutLungeRel', 'cutFlurryWind', 'cutFlurryRel'], shield: ['shBashWind', 'shBashRel', 'shGuardWind', 'shGuardHold'], harpoon: ['hpThrowWind', 'hpThrowRel', 'hpReelWind', 'hpReelRel'], anchor: ['hvSlamWind', 'hvSlamRel', 'hvChargeWind', 'hvChargeRel'] }, cw = 150, ch = 120, [c, g] = mk(cw * 5, ch * 4, BG);
  st.forEach((sn, r) => ['sailorIdle', ...mv[sn]].forEach((k, i) => { const x0 = i * cw, y0 = r * ch; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + 112, cw - 8, 2); CA.drawCrew(g, x0 + 66, y0 + 112, 1, { role: 'sailor', stance: sn, pose: k, seed: 1 }, 0.3); label(g, x0 + 3, y0 + 3, sn + ' ' + k, /Wind$/.test(k) ? '#ffd36b' : '#c9d8d0'); }));
  png(c, 3, 'd3-sailor-stances.png'); }

/* ---- the level kit + the wall eel ---- */
const KA = await import(new URL('../src/redraw/deep3_art.js', import.meta.url).href);
{ const [c, g] = mk(440, 300, BG);
  label(g, 4, 3, 'cracked slab: whole / creak / thick (stone only) | settling stone: hang / tell / fall');
  const slab = (x, y, w, mode, so) => { g.fillStyle = '#2a343c'; g.fillRect(x, y, w, 16); g.fillStyle = '#566670'; g.fillRect(x, y, w, 2); KA.drawCrack(g, x, y, w, mode, 7, 0.3, so); };
  slab(6, 14, 64, 'whole', false); slab(76, 14, 64, 'creak', false); slab(146, 14, 64, 'whole', true);
  g.fillStyle = '#10202a'; g.fillRect(216, 12, 220, 70); KA.drawSettling(g, 224, 30, 32, 32, 12, 'hang', 0.3); KA.drawSettling(g, 288, 30, 32, 32, 12, 'tell', 0.3); KA.drawSettling(g, 352, 40, 32, 32, 12, 'fall', 0.3);
  label(g, 4, 90, 'rot: vent rest / tell / on, rot cloud, the pit'); for (const [i, s] of ['rest', 'tell', 'on'].entries()) { g.fillStyle = '#10202a'; g.fillRect(6 + i * 60, 98, 50, 56); KA.drawVent(g, 12 + i * 60, 108, 40, 1, s, 0.3); KA.drawRot(g, 6 + i * 60, 98, 40 + i * 60, 108, s, 0.3); }
  g.fillStyle = '#10202a'; g.fillRect(190, 98, 90, 56); KA.drawRot(g, 190, 120, 280, 154, 'on', 0.3, true); KA.drawRot(g, 290, 98, 340, 154, 'on', 0.6);
  label(g, 4, 162, 'old diving bell (empty / riding) | soul lantern 100 / 60 / 20 | rings: open, ward | harpoon shot, rope | wave');
  g.fillStyle = '#10202a'; g.fillRect(4, 170, 300, 124); KA.drawBell(g, 18, 262, 56, false, 0.3, 172); KA.drawBell(g, 100, 262, 56, true, 0.3, 172);
  [1, 0.6, 0.2].forEach((k, i) => KA.drawLantern(g, 200 + i * 30, 200, k, 0.3));
  KA.drawOpenRing(g, 236, 256, 22, 0.3); KA.drawWardRing(g, 284, 256, 22, 0.3);
  KA.drawHarpoonShot(g, 330, 190, 1, 0.2, 'throw'); KA.drawHarpoonShot(g, 380, 190, 1, 0, 'reel'); KA.drawRope(g, 322, 210, 410, 210, 0.3); KA.drawWave(g, 340, 260, 1, 0.3); KA.drawWave(g, 380, 260, 0.6, 0.5); KA.drawRubble(g, 398, 260, 30);
  png(c, 3, 'd3-kit.png'); }
{ const modes = [['hidden', 0], ['bubble', 0.04], ['strike', 0.6], ['strike', 1], ['hang', 1], ['back', 0.5]], [c, g] = mk(6 * 80, 3 * 70 + 10, BG);
  label(g, 4, 2, 'wall eel: side line (hidden bubble strike strike hang back) / down line / left wall');
  modes.forEach(([m, e], i) => { g.fillStyle = '#2a343c'; g.fillRect(i * 80 + 8, 12, 14, 56); KA.drawEel(g, i * 80 + 22, 40, 1, 0, e, m, 0.3 + i * 0.05, 48); });
  modes.forEach(([m, e], i) => { g.fillStyle = '#2a343c'; g.fillRect(i * 80 + 4, 82, 48, 12); KA.drawEel(g, i * 80 + 28, 94, 0, 1, e, m, 0.3 + i * 0.05, 30); });
  modes.forEach(([m, e], i) => { g.fillStyle = '#2a343c'; g.fillRect(i * 80 + 58, 152, 14, 56); KA.drawEel(g, i * 80 + 58, 180, -1, 0, e, m, 0.3 + i * 0.05, 48); });
  png(c, 4, 'd3-eel.png'); }
