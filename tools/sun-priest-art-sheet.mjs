/* tools/sun-priest-art-sheet.mjs - THE DESERT PRIEST'S ART as PNG contact sheets, NODE ONLY (claude/priestart): a software raster with real pixel reads stands in for the canvas
   (outline() and whiten() read pixels back), so his rig can be LOOKED AT with no browser (the method of claude/hlart).   node tools/sun-priest-art-sheet.mjs [outdir]
   writes: rig.png (every baked key x3), poses.png (his fifteen own poses x4, every frame), compare.png (Pyromancer beside him), fx.png (beam, patch, lamp, eye, shard, pillar, flare, sunrise on a desert strip x3),
   icons.png (the ten active icons x6). Exits non-zero if a pose's beats do not match its frames or an icon is blank. */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/priestart-art/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const hexRgb = c => { c = String(c); let m; if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16), 1];
  if ((m = /^#([0-9a-f]{3})$/i.exec(c))) return [...m[1]].map(h => parseInt(h + h, 16)).concat(1);
  if ((m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/.exec(c))) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]]; return [255, 0, 255, 1]; };
class Ctx {
  constructor(c) { this.canvas = c; this.fillStyle = '#000000'; this.globalAlpha = 1; this.strokeStyle = '#000'; this.lineWidth = 1; this.imageSmoothingEnabled = false; this.globalCompositeOperation = 'source-over'; this.stack = []; }
  get buf() { const c = this.canvas; if (!c._buf || c._buf.length !== c.width * c.height * 4) c._buf = new Uint8ClampedArray(c.width * c.height * 4); return c._buf; }
  get m() { return this._m || (this._m = [1, 0, 0, 1, 0, 0]); }
  ap(x, y) { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  translate(x, y) { const m = this.m; m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; } scale(x, y) { const m = this.m; m[0] *= x; m[1] *= x; m[2] *= y; m[3] *= y; }
  rotate(t) { const m = this.m, c = Math.round(Math.cos(t) * 1e6) / 1e6, s = Math.round(Math.sin(t) * 1e6) / 1e6, [a, b, cc, d] = m; m[0] = a * c + cc * s; m[1] = b * c + d * s; m[2] = -a * s + cc * c; m[3] = -b * s + d * c; }
  setTransform(a, b, c, d, e, f) { this._m = [a, b, c, d, e, f]; }
  save() { this.stack.push([this.m.slice(), this.globalAlpha, this.fillStyle]); } restore() { const s = this.stack.pop(); if (s) { this._m = s[0]; this.globalAlpha = s[1]; this.fillStyle = s[2]; } }
  blend(o, r, g, bl, a) { const b = this.buf, da = b[o + 3] / 255;
    if (this.globalCompositeOperation === 'source-in') { if (da > 0) { b[o] = r; b[o + 1] = g; b[o + 2] = bl; b[o + 3] = da * a * 255; } else b[o + 3] = 0; return; }
    const oa = a + da * (1 - a); if (oa > 0) { b[o] = (r * a + b[o] * da * (1 - a)) / oa; b[o + 1] = (g * a + b[o + 1] * da * (1 - a)) / oa; b[o + 2] = (bl * a + b[o + 2] * da * (1 - a)) / oa; b[o + 3] = oa * 255; } }
  fillRect(x, y, w, h) { const c = this.canvas, [r, g, bl, fa] = hexRgb(this.fillStyle), a = this.globalAlpha * fa;
    const p = this.ap(x, y), q = this.ap(x + w, y + h); let x0 = Math.min(p[0], q[0]), x1 = Math.max(p[0], q[0]), y0 = Math.min(p[1], q[1]), y1 = Math.max(p[1], q[1]);
    x0 = Math.round(x0); x1 = Math.round(x1); y0 = Math.round(y0); y1 = Math.round(y1);
    for (let j = Math.max(0, y0); j < Math.min(c.height, y1); j++) for (let i = Math.max(0, x0); i < Math.min(c.width, x1); i++) this.blend((j * c.width + i) * 4, r, g, bl, a); }
  clearRect(x, y, w, h) { const c = this.canvas, b = this.buf; for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) b[(j * c.width + i) * 4 + 3] = 0; }
  drawImage(img, a, b, c2, d) { if (!img._buf) return; const s = img._buf, c = this.canvas; let dx = a, dy = b, dw = img.width, dh = img.height;
    if (arguments.length >= 5 && arguments.length < 9) { dw = c2; dh = d; } if (arguments.length === 9) throw new Error('9-arg drawImage unsupported'); if (dw !== img.width || dh !== img.height) throw new Error('scaled drawImage unsupported');
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const so = (j * img.width + i) * 4, al = s[so + 3] / 255 * this.globalAlpha; if (al <= 0) continue;
      const [fx, fy] = this.ap(dx + i + 0.5, dy + j + 0.5), X = Math.floor(fx + 1e-6), Y = Math.floor(fy + 1e-6);
      if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; this.blend((Y * c.width + X) * 4, s[so], s[so + 1], s[so + 2], al); } }
  getImageData(x, y, w, h) { const c = this.canvas, out = new Uint8ClampedArray(w * h * 4), b = this.buf; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = x + i, Y = y + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; for (let k = 0; k < 4; k++) out[(j * w + i) * 4 + k] = b[(Y * c.width + X) * 4 + k]; } return { data: out, width: w, height: h }; }
  putImageData(img, x, y) { const c = this.canvas, b = this.buf; for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) { const X = x + i, Y = y + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; for (let k = 0; k < 4; k++) b[(Y * c.width + X) * 4 + k] = img.data[(j * img.width + i) * 4 + k]; } }
  createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; }
  beginPath() {} moveTo() {} lineTo() {} closePath() {} fill() {} stroke() {} arc() {} ellipse() {} rect() {} clip() {} fillText() {} measureText() { return { width: 0 }; } createLinearGradient() { return { addColorStop() {} }; } createRadialGradient() { return { addColorStop() {} }; }
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => (c._g = c._g || new Ctx(c)); c.toDataURL = () => ''; return c; } };
const mk = (w, h, bg) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const crc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const v of b) c = t[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
function png(c, scale, name) {
  const W = c.width * scale, H = c.height * scale, raw = Buffer.alloc((W * 4 + 1) * H), b = c._buf || new Uint8ClampedArray(c.width * c.height * 4);
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const o = (Math.floor(y / scale) * c.width + Math.floor(x / scale)) * 4, p = y * (W * 4 + 1) + 1 + x * 4, a = b[o + 3] / 255;
    raw[p] = b[o] * a + 40 * (1 - a); raw[p + 1] = b[o + 1] * a + 36 * (1 - a); raw[p + 2] = b[o + 2] * a + 44 * (1 - a); raw[p + 3] = 255; } }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cc]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  writeFileSync(OUT + name, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); console.log('wrote ' + OUT + name + ' ' + W + 'x' + H);
}
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); };
const U = f => import(new URL('../src/' + f, import.meta.url).href);
const CH = await U('chars.js'), HP = await U('hero-poses.js'), FX = await U('redraw/sun_priest_fx.js'), IC = await U('redraw/sun_priest_icons.js'), PC = await U('progression-catalog.js');
const set = CH.bakeSunPriest(), pyro = CH.bakePyro({});
const BG = '#6f5a3c';   /* a desert dusk-brown so ivory and gold read as they will on the dunes */

/* ---- every baked key of his set ---- */
const keys = Object.keys(set.R), cell = 56, cols = 12;
{ const list = []; for (const k of keys) { const v = set.R[k]; (Array.isArray(v) ? v : [v]).forEach((f, i) => list.push([k + (Array.isArray(v) && v.length > 1 ? i : ''), f])); }
  const rows = Math.ceil(list.length / cols), [c, g] = mk(cell * cols, cell * rows, BG);
  list.forEach(([n, f], i) => { const x = (i % cols) * cell + 2, y = Math.floor(i / cols) * cell + 2; g.drawImage(f, x, y); });
  png(c, 3, 'rig.png'); console.log('keys ' + keys.length + ' frames ' + list.length); }

/* ---- his fifteen own poses, with the beat rule ---- */
const OWN = ['spShard', 'spStep', 'spLamp', 'spWard', 'spPillar', 'spMercy', 'spGlare', 'spWind', 'spHalo', 'spEye', 'spBeam', 'spDisc', 'spFlare', 'spConsec', 'spRise'];
{ const rows = OWN.length, cw = 64, ch = 74, [c, g] = mk(cw * 3, ch * rows, BG);
  OWN.forEach((k, r) => { const fr = set.R[k]; if (!Array.isArray(fr)) return fail(k + ' missing'); const beats = HP.POSE_BEATS[k]; if (!beats) fail(k + ' has no POSE_BEATS'); else if (beats.length !== fr.length - 1) fail(k + ' beats ' + beats.length + ' != frames-1 ' + (fr.length - 1));
    fr.forEach((f, i) => g.drawImage(f, i * cw + 0, r * ch + 0)); });
  png(c, 3, 'poses.png'); }

/* ---- the Pyromancer beside him: idle, run, atk, jump ---- */
{ const ks = ['idle', 'run', 'atk', 'atkB', 'jump', 'hurt', 'wall', 'storm'], [c, g] = mk(ks.length * 52, 2 * 58, BG);
  ks.forEach((k, i) => { const a = pyro.R[k], b = set.R[k]; g.drawImage(Array.isArray(a) ? a[Math.min(1, a.length - 1)] : a, i * 52, 0); g.drawImage(Array.isArray(b) ? b[Math.min(1, b.length - 1)] : b, i * 52, 58); });
  png(c, 4, 'compare.png'); }

/* ---- a close-up: six frames at x10 ---- */
{ const pick = [['idle', 0], ['run', 1], ['atk', 1], ['jump', 0], ['spBeam', 1], ['spFlare', 1]], [c, g] = mk(pick.length * 48, 58, '#d9b070'); pick.forEach(([k, i], n) => g.drawImage(set.R[k][i], n * 48, 0)); png(c, 10, 'closeup.png'); }

/* ---- the effects on a desert strip ---- */
{ const VW = 320, VH = 90, [c, g] = mk(VW, VH * 3, '#c79a5a');
  for (let s = 0; s < 3; s++) { g.fillStyle = s === 1 ? '#2a2236' : '#e6c27a'; g.fillRect(0, s * VH, VW, VH); g.fillStyle = s === 1 ? '#3a3050' : '#b88a4a'; g.fillRect(0, s * VH + 70, VW, 20); }
  const t = 0.3;
  FX.beam(g, { x0: 40, y0: 62, x1: 170, y1: 62 }, 0, 0, t, { wide: false });
  FX.beam(g, { x0: 40, y0: 62 + VH, x1: 200, y1: 62 + VH }, 0, 0, t, { wide: true });
  FX.beam(g, { up: true, x0: 262, y0: 70, x1: 262, y1: 14 }, 0, 0, t, {});
  FX.patch(g, { x0: 0, x1: 2, y: 4, t: 5, kind: 'consecrate' }, -150, 10, 16, t); FX.patch(g, { x0: 0, x1: 2, y: 4, t: 5, kind: 'sunfall' }, -190, -80, 16, t + 0.2);
  FX.lamp(g, { x: 200, y: 50 + VH, t: 9, r: 70 }, 0, 0, t); FX.lamp(g, { x: 230, y: 50 + VH * 2, t: 1.5, r: 70 }, 0, 0, t + 0.1);
  FX.shard(g, { x: 70, y: 40 + VH * 2, vx: 300 }, 0, 0, t); FX.shard(g, { x: 110, y: 40 + VH * 2, vx: -300 }, 0, 0, t + 0.05);
  FX.pillar(g, { x: 280, y: 70, t: 0.3 }, 0, 0, t); FX.pillar(g, { x: 240, y: 70 + VH, t: -0.1, life: 0.2 }, 0, 0, t);
  FX.eye(g, 60, 20 + VH * 2, { x: 130, y: 66 + VH * 2 }, t); FX.eye(g, 150, 20 + VH * 2, null, t);
  FX.flareBurst(g, 280, 40 + VH * 2, 0.05, 48); FX.flareBurst(g, 280, 50 + VH, 0.2, 48); FX.flareBurst(g, 220, 50 + VH * 2, 0.32, 48);
  FX.haloRing(g, 30, 30, t); FX.wardRing(g, 40, 60 + VH, t); FX.mend(g, 90, 70 + VH, t); FX.discShield(g, 260, 50 + VH * 2, 1, 0.08);
  FX.sunrise(g, VW, VH, t, 1);
  png(c, 3, 'fx.png'); }

/* ---- the ten icons ---- */
{ const ids = Object.keys(IC.SP_ICON_ROWS), actives = [...new Set(PC.SKILLS.filter(s => s.active && s.hero === 'sunpriest').map(s => s.id))], icons = IC.bakeIcons();
  for (const id of actives) if (!icons[id]) fail('no icon for ' + id); for (const id of ids) if (!actives.includes(id)) fail('icon ' + id + ' is not an active');
  const [c, g] = mk(14 * ids.length, 18, BG); ids.forEach((id, i) => { const ic = icons[id]; let n = 0; for (let k = 3; k < ic._buf.length; k += 4) if (ic._buf[k]) n++; if (n < 20) fail(id + ' icon blank'); g.drawImage(ic, i * 14 + 1, 2); });
  png(c, 8, 'icons.png'); console.log('icons ' + ids.length + ' of ' + actives.length + ' actives'); }
console.log(bad ? 'FAILED ' + bad : 'ART OK'); process.exit(bad ? 1 : 0);
