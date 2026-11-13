import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/seaart2/', import.meta.url));
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
/* seaart2-sheet.mjs - node-rendered contact sheets for the sea art touch-up (claude/seaart2): crew + Sailor faces (big), the Sailor fused, his fall, the Queen's face, the whale backdrop + the rib rule. No browser. */
const BG = '#0e1a22';
const CA = await import(new URL('../src/redraw/drowned_crew_art.js', import.meta.url).href);
const QA = await import(new URL('../src/redraw/parasite_queen_art.js', import.meta.url).href);
const which = process.argv[3] || 'all';
if (which === 'all' || which === 'crew') {
  /* the five faces: a head-and-shoulders crop of each at 8x (every role, idle + a windup) */
  { const roles = [['cutlass', 'crewSwim'], ['cutlass', 'cutLungeWind'], ['shield', 'crewSwim'], ['harpoon', 'crewSwim'], ['heavy', 'crewSwim'], ['sailor', 'sailorIdle'], ['sailor', 'sailorMerge']], [c, g] = mk(roles.length * 56, 70, BG);
    roles.forEach(([r, p], i) => { const gg = mk(56, 70, BG)[1]; CA.drawCrew(gg, 28, 62, 1, { role: r, pose: p, still: true, seed: 1, stance: 'cutlass' }, 0.3); g.drawImage(gg.canvas, i * 56, 0); label(g, i * 56 + 2, 2, r + ' ' + p.replace(/^(crew|cut|sailor)/, ''), '#c9d8d0'); });
    png(c, 8, 'sa2-faces.png'); }
  { const [c, g] = mk(4 * 90, 130, BG); ['sailorIdle', 'sailorSwapWind', 'sailorStuck', 'sailorWard'].forEach((p, i) => { const gg = mk(90, 130, BG)[1]; CA.drawCrew(gg, 45, 118, 1, { role: 'sailor', pose: p, stance: ['cutlass', 'harpoon', 'anchor', 'shield'][i], seed: 3 }, 0.3 + i); g.drawImage(gg.canvas, i * 90, 0); label(g, i * 90 + 2, 2, p, '#c9d8d0'); });
    png(c, 5, 'sa2-sailor-fused.png'); }
  { const ks = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9], [c, g] = mk(ks.length * 80, 120, BG); ks.forEach((k, i) => { const gg = mk(80, 120, BG)[1]; CA.drawCrewDead(gg, 40, 108, 1, k, 0.4 + k, { role: 'sailor', stance: 'cutlass' }); g.drawImage(gg.canvas, i * 80, 0); label(g, i * 80 + 2, 2, 'FALL ' + k, '#c9d8d0'); });
    png(c, 4, 'sa2-sailor-fall.png'); }
}
if (which === 'all' || which === 'queen') {
  const ps = [['qIdle', 1], ['qSpitWind', 1], ['qSpitRel', 1], ['qLashWind', 1], ['qSkitIdle', 2], ['qWake', 1]], [c, g] = mk(ps.length * 100, 80, '#1a0c12');
  ps.forEach(([p, ph], i) => { const gg = mk(100, 80, '#1a0c12')[1]; QA.drawQueen(gg, 44, 68, 1, { pose: p, phase: ph, seed: 1 }, 0.4); g.drawImage(gg.canvas, i * 100, 0); label(g, i * 100 + 2, 2, p, '#c9d8d0'); });
  png(c, 7, 'sa2-queen-face.png');
}
if (which === 'all' || which === 'whale') {
  const WA = await import(new URL('../src/redraw/whale_art.js', import.meta.url).href);
  let WB = null; try { WB = await import(new URL('../src/redraw/whale_back.js', import.meta.url).href); } catch (e) { /* not yet */ }
  const VW = 320, VH = 180;
  /* the rib chamber: ribs (bone) a jump apart over the void, the ceiling flesh, shrine two's sill flesh; solid per src/whale.js's rows */
  const solid = (tx, ty) => { if (tx < 263 || tx > 322) return false; if (ty <= 14) return true; if (tx >= 314 && ty >= 32 && ty <= 43) return true; if (ty >= 44) return tx > 313 ? true : (WA.RIB_X0.some(x => tx >= x && tx <= x + 2) && ty <= 47); return WA.RIB_X0.some(x => tx >= x && tx <= x + 2) && ty >= 31; };
  const [c, g] = mk(VW * 2 + 6, VH, '#0a1218');
  for (const [i, back] of [[0, false], [1, true]]) { const gg = mk(VW, VH, '#0a1218')[1]; if (back && WB) WB.drawBackdrop(gg, 263 * 16 + 40 * i, 20 * 16, VW, VH, 1.3, 'rib'); WA.drawFleshTex(gg, 263 * 16 + 120, 22 * 16, 1.3, VW, VH, solid, 400, 48); g.drawImage(gg.canvas, i * (VW + 6), 0); label(g, i * (VW + 6) + 3, 3, back ? 'RIB CHAMBER WITH BACKDROP' : 'RIB CHAMBER RIBS ONLY BONE', '#ffffff'); }
  png(c, 3, 'sa2-rib-room.png');
  if (WB) { const secs = ['maw', 'tongue', 'gullet', 'stomach', 'rib', 'heart'], [c2, g2] = mk(3 * (VW + 4), 2 * (VH + 4), '#000'); secs.forEach((s, i) => { const gg = mk(VW, VH, '#000')[1]; WB.drawBackdrop(gg, ({ maw: 20, tongue: 90, gullet: 150, stomach: 215, rib: 285, heart: 350 })[s] * 16, 16 * 20, VW, VH, 2.1, s); g2.drawImage(gg.canvas, (i % 3) * (VW + 4), Math.floor(i / 3) * (VH + 4)); label(g2, (i % 3) * (VW + 4) + 3, Math.floor(i / 3) * (VH + 4) + 3, 'BACKDROP ' + s, '#ffffff'); });
    png(c2, 2, 'sa2-backdrops.png'); }
}
if (which === 'qhead') {
  const ps = ['qIdle', 'qSpitRel', 'qLashWind', 'qWake'], [c, g] = mk(ps.length * 48, 72, '#1a0c12');
  ps.forEach((p, i) => { const gg = mk(48, 72, "#1a0c12")[1]; QA.drawQueen(gg, -2, 76, 1, { pose: p, phase: 1, seed: 1 }, 0.4); g.drawImage(gg.canvas, i * 48, 0); label(g, i * 48 + 2, 2, p, '#c9d8d0'); });
  png(c, 14, 'sa2-queen-head.png');
}
