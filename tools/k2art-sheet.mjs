/* tools/k2art-sheet.mjs - KEEP 2 ART as PNG contact sheets, NODE ONLY (claude/k2art): the software raster of tools/pf-art-sheet.mjs stands in for the canvas, so the art is LOOKED AT with no browser.
   node tools/k2art-sheet.mjs [outdir]   writes k2-poses-wet / k2-poses-dry (every king pose labelled by move), k2-poses-special (cursed, shell, curse progress, his fall, trident), k2-pieces, k2-room (a composed mock) */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/k2art/', import.meta.url));
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

const KA = await import(new URL('../src/redraw/drowned_king2_art.js', import.meta.url).href), K2A = await import(new URL('../src/redraw/keep2_art.js', import.meta.url).href), SD = await import(new URL('../src/redraw/sea_dial.js', import.meta.url).href);
const BG = '#0e2a2e', FLOOR = '#2a4a46', CELL = '#12363a';
const PROG = { shellTell: 0.7, curse: 0.6, wake: 0.8, prongTell: 0.8, decreeTell: 0.8 };

/* ---- the king: every pose, labelled (a windup label is gold) ---- */
function kingSheet(dry, name) {
  const keys = Object.keys(KA.K2_POSE_SET), cw = 92, ch = 84, cols = 8, rows = Math.ceil(keys.length / cols), [c, g] = mk(cw * cols, ch * rows, BG);
  keys.forEach((k, i) => { const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2);
    const fx = x0 + 44, fy = y0 + 66; if (dry) { g.fillStyle = FLOOR; g.fillRect(x0 + 8, fy, cw - 16, 2); }
    KA.drawKing2(g, fx, fy, 1, { pose: k, dry, aim: k.startsWith('hurl') ? -12 : -4, trAng: 0, k: PROG[k] ?? 0.5, seed: 1, vx: 0 }, 0.3);
    label(g, x0 + 3, y0 + 3, k, /Tell$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  png(c, 3, name); }
kingSheet(false, 'k2b-poses-wet.png'); kingSheet(true, 'k2b-poses-dry.png');

/* ---- the specials: cursed model, the shell, the curse's progress, his fall, the trident ---- */
{ const cw = 96, ch = 84, cols = 8, [c, g] = mk(cw * cols, ch * 4, BG); let n = 0;
  const cell = (lab, f) => { const x0 = (n % cols) * cw, y0 = Math.floor(n / cols) * ch; n++; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); label(g, x0 + 3, y0 + 3, lab); f(x0 + 46, y0 + 68); };
  const king = (pose, o = {}) => (x, y) => { if (o.dry) { g.fillStyle = FLOOR; g.fillRect(x - 36, y, 72, 2); } KA.drawKing2(g, x, y, 1, { pose, dry: !!o.dry, aim: -4, k: o.k ?? 0.5, seed: 1, ...o }, 0.3); };
  for (const [lab, p] of [['cursed idle', 'idle'], ['cursed thrust', 'thrust'], ['cursed grasp', 'graspTell'], ['cursed leech', 'leechTell'], ['cursed prong', 'prongTell'], ['cursed hurt', 'hurt'], ['cursed open', 'open'], ['cursed beached', 'beached']]) cell(lab, king(p, { cursed: true, dry: p === 'beached' || p === 'open' }));
  for (const [lab, o] of [['shell 30', { pose: 'shellTell', k: 0.3 }], ['shell 60', { pose: 'shellTell', k: 0.6 }], ['shell 100', { pose: 'shellTell', k: 1 }], ['shell on idle', { pose: 'idle', shell: true }], ['shell on thrust', { pose: 'thrust', shell: true }], ['shell split OPEN', { pose: 'idle', shellOpenT: 1.5 }], ['shell dry', { pose: 'idle', shell: true, dry: true }], ['dry walk', { pose: 'idle', dry: true, vx: 40 }]]) cell(lab, king(o.pose, o));
  for (const kq of [0, 0.25, 0.5, 0.75, 1]) cell('curse ' + Math.round(kq * 100), king('curse', { k: kq }));
  cell('flash', king('idle', { flashT: 1 })); cell('hurt flash', king('hurt', {})); cell('sleep', king('sleep', { dry: true }));
  for (const kq of [0, 0.2, 0.4, 0.6, 0.8, 1]) cell('dead ' + Math.round(kq * 100), (x, y) => { g.fillStyle = FLOOR; g.fillRect(x - 40, y, 80, 2); KA.drawDeadKing2(g, x, y, 1, kq, 0.3); });
  cell('dead cursed', (x, y) => { g.fillStyle = FLOOR; g.fillRect(x - 40, y, 80, 2); KA.drawDeadKing2(g, x, y, 1, 1, 0.3, { cursed: true }); });
  for (const [lab, o] of [['trident', {}], ['cursed trident', { cursed: true }], ['split 40', { split: 0.4 }], ['split 100', { split: 1, cursed: true }]]) cell(lab, (x, y) => K2A.drawTrident2(g, x - 18, y - 30, -20, 6, { ...o, glint: true, tm: 0.1 }));
  png(c, 3, 'k2b-poses-special.png'); }

/* ---- the pieces ---- */
{ const [c, g] = mk(520, 300, BG); label(g, 4, 3, 'levers + A3 dial: brass / verdigris / flesh (lever idle, thrown, mid-throw)');
  ['brass', 'verdigris', 'flesh'].forEach((sk, i) => { const x0 = 10 + i * 168; g.fillStyle = CELL; g.fillRect(x0 - 4, 12, 160, 78); g.fillStyle = FLOOR; g.fillRect(x0 - 2, 80, 156, 2);
    SD.drawLever(g, x0 + 14, 80, { thrown: false, swing: 0 }, 0.3, sk); SD.drawLever(g, x0 + 44, 80, { thrown: true, swing: 0 }, 0.3, sk); SD.drawLever(g, x0 + 74, 80, { thrown: true, swing: 0.5 }, 0.3, sk);
    SD.drawDial(g, x0 + 100, 54, { k: 0.75, ph: 'high', coming: null }, 0.3, sk); SD.drawDial(g, x0 + 126, 54, { k: 0.3, ph: 'warn', t: 1.2, coming: 'in' }, 0.3, sk);
    SD.drawDial(g, x0 + 100, 30, { k: 0.05, ph: 'low', coming: 'out' }, 0.3, sk); SD.drawDial(g, x0 + 126, 30, { k: 0.6, ph: 'warn', t: 0.2, coming: 'in', tell: true }, 0.3, sk);
    SD.drawHud(g, x0 + 142, 18, { k: 0.5, ph: 'warn', t: 1, coming: 'in' }, 0.3, sk); });
  label(g, 4, 98, 'floodgate frames flooded / drained, portcullis shut / half / pinned, decree + under-gate reads');
  K2A.drawFloodgate(g, 40, 130, 70, { k: 1, t: 0.3 }); K2A.drawFloodgate(g, 80, 130, 70, { k: 0, t: 0.3 });
  K2A.drawPortcullis(g, 130, 112, 190, { k: 1, t: 0.3 }); K2A.drawPortcullis(g, 160, 112, 190, { k: 0.5, t: 0.3 }); K2A.drawPortcullis(g, 190, 112, 190, { k: 1, t: 0.3, pin: true });
  K2A.drawGateHint(g, 225, 112, 190, 'decree', 0.3); K2A.drawGateHint(g, 245, 112, 190, 'under', 0.3);
  label(g, 262, 98, 'trident flight / stuck / prong / leech');
  K2A.drawTridentFlight(g, 300, 130, 100, -20, 0.3); K2A.drawTridentStuck(g, 360, 130, 100, 10, 0.3, { ring: true }); K2A.drawProng(g, 410, 130, 100, 20, 0.3); K2A.drawProng(g, 440, 150, -60, 80, 0.3); K2A.drawLeechLine(g, 275, 160, 360, 180, 0.3);
  label(g, 4, 200, 'grasp told / live; flooded-room dressing');
  g.fillStyle = FLOOR; g.fillRect(4, 244, 120, 2); K2A.drawGrasp(g, 8, 62, 244, false, 0.3); K2A.drawGrasp(g, 66, 120, 244, true, 0.3);
  g.fillStyle = '#1a3236'; g.fillRect(130, 208, 380, 40); g.fillStyle = FLOOR; g.fillRect(130, 248, 380, 4); K2A.drawDressing(g, 130, 0, 380, 130, 510, 208, 248, 0.5, {});
  png(c, 3, 'k2b-pieces.png'); }

/* ---- a composed throne room: mid-thrust at you, the gate half down, both levers + dials, floodgate frames, dressing, the stuck trident ---- */
{ const VW = 320, VH = 180, [c, g] = mk(VW, VH, '#0a2428'); for (let y = 0; y < VH; y += 16) for (let x = 0; x < VW; x += 16) { g.fillStyle = ((x + y) / 16) & 1 ? '#16363a' : '#1a3c40'; g.fillRect(x, y, 16, 16); g.fillStyle = '#0e2a2e'; g.fillRect(x, y + 15, 16, 1); g.fillRect(x + 15, y, 1, 16); }
  g.fillStyle = '#0e2a2e'; g.fillRect(0, 0, VW, 28); g.fillStyle = '#2a4a46'; g.fillRect(0, 150, VW, 30); g.fillStyle = '#3a5a56'; g.fillRect(0, 150, VW, 2);
  K2A.drawDressing(g, 0, 0, VW, 0, VW, 28, 150, 0.5, {});
  g.globalAlpha = 0.2; g.fillStyle = '#7ff0e0'; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
  K2A.drawPortcullis(g, 160, 28, 150, { k: 0.45, t: 0.3 });
  SD.drawLever(g, 40, 150, { thrown: false, swing: 0, near: true }, 0.3, 'verdigris'); SD.drawDial(g, 62, 126, { k: 1, ph: 'high' }, 0.3, 'verdigris'); SD.drawLever(g, 282, 150, { thrown: true, swing: 0 }, 0.3, 'verdigris'); SD.drawDial(g, 262, 126, { k: 1, ph: 'high' }, 0.3, 'verdigris');
  K2A.drawFloodgate(g, 12, 88, 62, { k: 1, t: 0.3 }); K2A.drawFloodgate(g, 308, 88, 62, { k: 1, t: 0.3 });
  KA.drawKing2(g, 112, 128, 1, { pose: 'thrust', aim: -4, k: 0.5, seed: 1 }, 0.3);
  KA.drawKing2(g, 232, 150, -1, { pose: 'sweepTell', dry: true, aim: 0, k: 0.5, seed: 1 }, 0.3);
  K2A.drawTridentStuck(g, 300, 60, 100, 30, 0.3, { ring: true });
  png(c, 3, 'k2b-room.png'); }

/* ---- BEFORE / AFTER (claude/sea4): node tools/k2art-sheet.mjs outdir --before=path/to/old-drowned_king2_art.js : old vs new idle + 3 tells, 1x game scale (rows 1-2: wet, dry) and 4x (rows 3-4, wet) ---- */
{ const arg = process.argv.find(a => a.startsWith('--before=')); if (arg) {
  const OLD = await import((await import('node:url')).pathToFileURL(arg.slice(9)).href), poses = ['idle', 'thrustTell', 'sweepTell', 'hurlTell'], CW = 100, CH = 80;
  const [c, g] = mk(CW * 16, CH * 2 + 10 + 2 * CH * 4, BG);
  const cell = (mod, pose, dry) => { const [sc, sg] = mk(CW, CH, CELL); if (dry) { sg.fillStyle = FLOOR; sg.fillRect(8, 66, CW - 16, 2); } mod.drawKing2(sg, 50, 66, 1, { pose, dry, aim: pose.startsWith('hurl') ? -12 : -4, trAng: 0, k: 0.5, seed: 1, vx: 0 }, 0.3); return sc; };
  [false, true].forEach((dry, r) => poses.forEach((p, i) => { [OLD, KA].forEach((mod, j) => { const x0 = (i * 2 + j) * CW, y0 = r * CH; g.drawImage(cell(mod, p, dry), x0, y0); label(g, x0 + 3, y0 + 3, (j ? 'new ' : 'old ') + p, j ? '#ffd36b' : '#c9d8d0'); }); }));
  [OLD, KA].forEach((mod, j) => poses.forEach((p, i) => { const sc = cell(mod, p, false), x0 = i * CW * 4, y0 = CH * 2 + 10 + j * CH * 4; g.drawImage(sc, 0, 0, CW, CH, x0, y0, CW * 4, CH * 4); label(g, x0 + 3, y0 + 3, (j ? 'new ' : 'old ') + p + ' 4x', j ? '#ffd36b' : '#c9d8d0'); }));
  png(c, 1, 'k2b-before-after.png'); } }
