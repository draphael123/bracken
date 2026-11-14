/* tools/sky2art-sheet.mjs - SKYHOOK 2's ART as ONE PNG contact sheet, NODE ONLY (claude/sky2art, 11-14). No browser: the software raster of tools/hl-art-sheet.mjs (fillRect with alpha, drawImage of a baked
   layer) plus the two things this art needs - a translate/scale stack (his body draws mirrored) and a 3x5 pixel font for the words (ctx.text) - stands in for the canvas.
     node tools/sky2art-sheet.mjs [out.png]      (default ../scratch/lane-reports/sky2art/sheet.png)
   It builds the real HIGH LINES level (the cave-mouth backdrop of claude/cavelook, the tiles, the winch lines of the line kit), makes the real SKYHOOK 2 hands (src/skyhook2-hands.js, flag via ctx.sky2) and
   draws them in every state: the 3 levers x their states, Skyhook x his states, the 3 new attacks with their tells, an overview of the whole arena. Nothing is simulated beyond poking the fight's state. */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/sky2art/sheet.png', import.meta.url));
mkdirSync(dirname(OUT), { recursive: true });
const hexRgb = c => { c = String(c); let m; if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16)]; if ((m = /^rgba?\((\d+),(\d+),(\d+)/.exec(c.replace(/\s/g, '')))) return [+m[1], +m[2], +m[3]]; return [255, 0, 255]; };
/* ---- the 3x5 font ---- */
const GL = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '!': '010010010000010', '-': '000000111000000', ':': '000010000010000', '.': '000000000000010', '?': '110001010000010', '/': '001001010100100', '+': '000010111010000', '=': '000111000111000', '(': '001010010010001', ')': '100010010010100', ',': '000000000010100', '%': '101001010100101', '>': '100010001010100', '<': '001010100010001', "'": '010010000000000' };
class Ctx {
  constructor(c) { this.canvas = c; this.fillStyle = '#000000'; this.globalAlpha = 1; this.strokeStyle = '#000'; this.lineWidth = 1; this.imageSmoothingEnabled = false; this.tx = 0; this.ty = 0; this.sx = 1; this.stack = []; }
  get buf() { const c = this.canvas; if (!c._buf || c._buf.length !== c.width * c.height * 4) c._buf = new Uint8ClampedArray(c.width * c.height * 4); return c._buf; }
  save() { this.stack.push([this.tx, this.ty, this.sx]); } restore() { const s = this.stack.pop(); if (s) [this.tx, this.ty, this.sx] = s; }
  translate(x, y) { this.tx += this.sx * x; this.ty += y; } scale(sx) { this.sx *= sx < 0 ? -1 : 1; }
  fillRect(x, y, w, h) { const c = this.canvas, b = this.buf, [r, g, bl] = hexRgb(this.fillStyle), a = this.globalAlpha; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    if (this.sx < 0) { x = -x - w; } x += this.tx; y += this.ty;
    for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) { const o = (j * c.width + i) * 4, da = b[o + 3] / 255, oa = a + da * (1 - a);
      if (oa > 0) { b[o] = (r * a + b[o] * da * (1 - a)) / oa; b[o + 1] = (g * a + b[o + 1] * da * (1 - a)) / oa; b[o + 2] = (bl * a + b[o + 2] * da * (1 - a)) / oa; b[o + 3] = oa * 255; } } }
  clearRect(x, y, w, h) { const c = this.canvas, b = this.buf; for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) b[(j * c.width + i) * 4 + 3] = 0; }
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) { if (arguments.length <= 5) { dx = sx; dy = sy; sx = 0; sy = 0; sw = img.width; sh = img.height; dw = sw; dh = sh; } const s = img._buf, d = this.buf, c = this.canvas; if (!s) return;
    dx = Math.round(dx); dy = Math.round(dy);
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const X = dx + i, Y = dy + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; const si = Math.min(img.width - 1, sx + Math.floor(i * sw / dw)), sj = Math.min(img.height - 1, sy + Math.floor(j * sh / dh)), so = (sj * img.width + si) * 4, o = (Y * c.width + X) * 4;
      const a = s[so + 3] / 255 * this.globalAlpha, da = d[o + 3] / 255, oa = a + da * (1 - a); if (oa > 0) { for (let k = 0; k < 3; k++) d[o + k] = (s[so + k] * a + d[o + k] * da * (1 - a)) / oa; d[o + 3] = oa * 255; } } }
  getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; } putImageData() {} beginPath() {} moveTo() {} lineTo() {} closePath() {} fill() {} stroke() {} arc() {} ellipse() {} setLineDash() {} rotate() {} createLinearGradient() { return { addColorStop() {} }; }
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => (c._g = c._g || new Ctx(c)); return c; } };
const mk = (w, h, bg) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
function text(g, str, x, y, col, align = 'left', size = 5) { const k = size >= 8 ? 2 : 1, s = String(str).toUpperCase(), w = s.length * 4 * k - k; let px = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x); const keep = g.fillStyle, ka = g.globalAlpha;
  const sv = [g.tx, g.ty, g.sx]; g.fillStyle = col; g.globalAlpha = 1;
  for (const ch of s) { const gl = GL[ch]; if (gl) for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (gl[r * 3 + c] === '1') g.fillRect(px + c * k, Math.round(y) + r * k - 2 * k, k, k); px += 4 * k; }
  void sv; g.fillStyle = keep; g.globalAlpha = ka; }
const crc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
function png(c, name) {
  const W = c.width, H = c.height, raw = Buffer.alloc((W * 4 + 1) * H), b = c._buf;
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const o = (y * W + x) * 4, p = y * (W * 4 + 1) + 1 + x * 4, a = b[o + 3] / 255; raw[p] = b[o] * a + 20 * (1 - a); raw[p + 1] = b[o + 1] * a + 20 * (1 - a); raw[p + 2] = b[o + 2] * a + 20 * (1 - a); raw[p + 3] = 255; } }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cc]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  writeFileSync(name, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); console.log('wrote ' + name + ' ' + W + 'x' + H);
}
const U = f => import(new URL('../src/' + f, import.meta.url).href);
const HLT = await U('redraw/high_lines_tiles.js'), HLB = await U('redraw/high_lines_back.js'), HLA = await U('redraw/high_lines_art.js'), LKT = await U('line-kit.js');
const { LEVELS, T } = await U('level.js'); const SKH = await U('skyhook-hands.js'); const SK2 = await U('skyhook2.js');
const L = LEVELS.find(l => l.id === 'highlines').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const kit = LKT.lineInit(L), decor = []; HLT.dress(decor, L, at, T); HLA.dress(decor, L, at, T);
const A = L.arena, TS = 16, SK = SK2.SK;

/* ---- the real hands, poked into every state ---- */
let CUR = null, boss = null, active = true, TIME = 0.3;
const P = { x: A.x0 + 200, y: A.floor, hp: 100, dead: false, lk: null, ground: true, hurt: 0 };
const sfx = new Proxy({}, { get: () => () => {} });
const HL = { arena: A, h: L.H, w: L.W, W: L.W, grid: L.grid.slice() };
const hctx = { sky2: true, get L() { return HL; }, get players() { return [P]; }, get boss() { return boss; }, get bossActive() { return active; }, TS, EHP: { skyhook: 1500 }, sfx, hero: () => P, time: () => TIME, kit: () => kit,
  number: () => {}, text: (s, x, y, c, a, z) => text(CUR, s, x, y, c, a, z), burst: () => {}, sparks: () => {}, shake: () => {}, ring: () => {}, damagePlayer: () => 'hit', asPlayer: (p, fn) => fn(), upright: () => true,
  overlap: () => false, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 22, b: b.y }), hint: () => {} };
const Hh = SKH.makeSkyhookHands(hctx);
function fresh() { Hh.clear(); boss = Hh.spawnBoss({ x: 0, y: 0, alive: true }); active = true; const S = Hh.show(); return { S, G: S.G, e: boss, props: Hh.props() }; }
const lev = (w, id) => w.props.find(p => p.id === id);

/* ---- the scene: the real backdrop + tiles + lines, then the hands exactly as main.js calls them ---- */
function scene(g, cx, cy, VW, VH, time) {
  CUR = g; TIME = time; g.fillStyle = '#1e222c'; g.fillRect(0, 0, VW, VH);   /* below the baked cave (180 px) the sheet shows the dark throat, not sky */
  HLB.drawBackdrop(g, cx, cy, VW, VH, L, time, 0, true);
  for (let y = Math.max(0, Math.floor(cy / 16)); y <= Math.min(L.H - 1, Math.floor((cy + VH) / 16)); y++) for (let x = Math.max(0, Math.floor(cx / 16)); x <= Math.min(L.W - 1, Math.floor((cx + VW) / 16)); x++) { const t = at(x, y); if (t === T.AIR) continue; const s = HLT.hlTile(t, x, y, at, T, L); if (s) g.drawImage(s, x * 16 - cx, y * 16 - cy); }
  for (const s of L.routeSupports || []) HLT.drawGantry(g, s, cx, cy);
  for (const d of decor) if (d.x > cx - 120 && d.x < cx + VW && d.y > cy - 80 && d.y < cy + VH) g.drawImage(d.c, d.x - cx, d.y - cy);
  HLA.drawLines(g, kit, cx, cy, VW, VH, time, []);
}
function still(w, cam, time, o = {}) {
  const [cx, cy, VW, VH] = cam, [c, g] = mk(VW, VH); scene(g, cx, cy, VW, VH, time);
  for (const p of w.props) Hh.drawBoss(g, p, cx, cy, time);
  if (!o.noBoss) Hh.drawBoss(g, w.e, cx, cy, time);
  Hh.drawOver(g, cx, cy, time);
  if (o.hero) { const hx = o.hero[0] - cx, hy = o.hero[1] - cy; g.fillStyle = '#e07a30'; g.fillRect(hx - 4, hy - 22, 8, 22); g.fillStyle = '#f0e0c0'; g.fillRect(hx - 4, hy - 22, 8, 3); }   /* a 8 x 22 stand-in for a hero, for scale */
  return c;
}
const hang = (w, route, x, mode = 'ride') => { SK2.hangOn(w.e, w.S, route, x); w.e.mode = mode; w.e.modeT = 0.4; w.e.face = 1; };
const floorAt = (w, x, mode) => { w.e.x = x; w.e.y = w.G.floorY; w.e.mode = mode; w.e.modeT = 1.2; w.e.openT0 = 4; };
const crown = (w, side, mode = 'perch') => { w.S.side = side; SK2.atCrown(w.e, w.S); w.e.mode = mode; w.e.modeT = 0.5; w.e.face = side === 'W' ? 1 : -1; };

/* ---- the sheet ---- */
const SW = 1680, rows = []; let curY = 0;
const [sheet, sg] = mk(SW, 6400, '#14161c');
const put = (c, x, y, scale) => { const [cc, gg] = mk(c.width * scale, c.height * scale); gg.drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width * scale, c.height * scale); sg.drawImage(cc, x, y); };
const cap = (str, x, y, col = '#e8e0d0', size = 5, maxW = 190) => { const per = Math.floor(maxW / 8); let line = '', yy = y; for (const wd of String(str).split(' ')) { if ((line + ' ' + wd).trim().length > per) { text(sg, line, x, yy, col, 'left', 8); yy += 12; line = wd; } else line = (line + ' ' + wd).trim(); } text(sg, line, x, yy, col, 'left', 8); };
const marks = [];
const title = (str, sub) => { marks.push([curY, str]); curY += 6; cap(str, 8, curY + 8, '#ffd36b', 8); if (sub) cap(sub, 8 + (str.length * 8 + 16), curY + 8, '#8a98a8', 5); curY += 22; };

/* 0. the whole arena, mid-fight (he rides the LOW line, phase 2, the crane lit) */
title('SKYHOOK 2 - THE ARENA IN THE CAVE MOUTH', 'LOW LINE RIDE, PHASE 3, CRANE LIT, A HERO FOR SCALE (8 X 22)');
{ const w = fresh(); w.S.ph = 3; w.S.points = 'LOW'; hang(w, 'low', A.x0 + 280); w.e.face = -1; const cam = [A.x0 - 24, A.floor - 296, 560, 304];
  put(still(w, cam, 0.7, { hero: [A.x0 + 120, A.floor] }), 0, curY, 3); curY += 304 * 3 + 8; }

/* 1. the levers x their states */
title('THE THREE LEVERS - SILHOUETTE + LAMP GLYPH + STATE', 'POINTS = DIAMOND HEAD / WEIGHT = A-FRAME + BLOCK / CRANE = SPOKED WHEEL    RING = OPEN-SKY / SOLID = READY OR SET / CROSS = OFF / BARS = TOLD');
{ const cells = [
    ['POINTS', 'SKY (OUT OF REACH)', w => { hang(w, 'sky', A.x0 + 200); }],
    ['POINTS', 'LOW (SET)', w => { w.S.points = 'LOW'; hang(w, 'low', A.x0 + 250); }],
    ['POINTS', 'HE RE-HOOKS (HOLD IT)', w => { w.S.points = 'LOW'; w.e.mode = 'rehookTell'; w.e.modeT = 0.5; w.e.x = A.x0 + 120; w.e.y = A.floor - 90; }],
    ['POINTS', 'HELD', w => { w.S.points = 'LOW'; w.S.held = true; hang(w, 'low', A.x0 + 250); }],
    ['POINTS', 'LOW LINE CUT (LOCKED)', w => { w.S.lowCut = 4; hang(w, 'sky', A.x0 + 250); }],
    ['POINTS', 'STRUCK (THROWN)', w => { w.S.points = 'LOW'; hang(w, 'low', A.x0 + 250); lev(w, 'POINTS').swing = 0.3; }],
    ['WEIGHT', 'READY (HE IS LOW)', w => { w.S.points = 'LOW'; hang(w, 'low', A.x0 + 250); }],
    ['WEIGHT', 'STRUCK (BLOCK DROPS)', w => { w.S.weightT = 5; lev(w, 'WEIGHT').swing = 0.2; hang(w, 'low', A.x0 + 250); }],
    ['WEIGHT', 'SPENT (RE-HANGS 6 S)', w => { w.S.weightT = 5; hang(w, 'sky', A.x0 + 250); }],
    ['CRANE', 'DARK (PHASE 1-2)', w => { hang(w, 'sky', A.x0 + 250); }],
    ['CRANE', 'READY (PHASE 3)', w => { w.S.ph = 3; hang(w, 'sky', A.x0 + 250); }],
    ['CRANE', 'TELL: SKIP SWINGS', w => { w.S.ph = 3; w.S.skip.st = 'tell'; w.S.skip.t = 0.5; hang(w, 'sky', A.x0 + 250); }],
    ['CRANE', 'STRUCK', w => { w.S.ph = 3; lev(w, 'CRANE').swing = 0.3; hang(w, 'sky', A.x0 + 250); }],
    ['CRANE', 'ENRAGED: STRIKE TO HOLD', w => { w.S.ph = 3; w.S.enraged = true; hang(w, 'sky', A.x0 + 250); }],
    ['CRANE', 'SKIP HELD (BRAKE ON)', w => { w.S.ph = 3; w.S.enraged = true; w.S.skip.pauseT = 2; hang(w, 'sky', A.x0 + 250); }] ];
  const cw = 64, ch = 88, sc = 3, per = 8;
  cells.forEach(([id, lab, fn], i) => { const w = fresh(); fn(w); const l = w.G.levers.find(q => q.id === id), cam = [l.x - 32, A.floor - 82, cw, ch];
    const c = still(w, cam, 0.5 + (i % 3) * 0.1, { noBoss: true }); const x = (i % per) * (cw * sc + 6), y = curY + Math.floor(i / per) * (ch * sc + 40); put(c, x, y, sc); cap(lab, x, y + ch * sc + 8, '#c8d8e8', 5, cw * sc - 4); });
  curY += Math.ceil(cells.length / per) * (ch * sc + 40) + 6; }

/* 2. Skyhook x his states */
title('SKYHOOK - STATES (PALE COAT EDGE PARTS HIM FROM THE ROCK)', 'THE LIGHT RIM IS NEW; HIS POSES ARE THE GAME OWN');
{ const cells = [
    ['CROWN: OUT OF REACH', w => { crown(w, 'E'); }],
    ['SKY LINE: RING LAMP', w => { hang(w, 'sky', A.x0 + 250); w.e.face = -1; }],
    ['LOW LINE: SOLID LAMP', w => { w.S.points = 'LOW'; hang(w, 'low', A.x0 + 250); w.e.face = -1; }],
    ['DOWN: HIT HIM NOW (2X)', w => { floorAt(w, A.x0 + 215, 'downed'); w.e.face = 1; }],
    ['JARRED', w => { floorAt(w, A.x0 + 215, 'jarred'); w.e.face = 1; }],
    ['SMASHED BY THE SKIP', w => { floorAt(w, A.x0 + 215, 'smashed'); w.e.face = 1; }],
    ['WARDED (PHASE 2)', w => { w.S.ph = 2; w.S.ward = 1; w.S.points = 'LOW'; hang(w, 'low', A.x0 + 250); w.e.face = -1; }],
    ['RE-HOOKS POINTS 1.0 S', w => { w.S.points = 'LOW'; w.e.mode = 'rehookTell'; w.e.modeT = 0.45; w.e.x = A.x0 + 110; w.e.y = A.floor - 100; w.e.face = -1; w.S.hooks = []; }],
    ['CUTS THE LOW LINE 1.4 S', w => { w.S.ph = 2; w.S.points = 'LOW'; w.e.route = 'low'; w.e.x = A.x0 + 250; w.e.y = w.G.lowY + SK.hang; w.e.mode = 'frayTell'; w.e.modeT = 0.5; w.e.face = 1; }],
    ['ENRAGED', w => { w.S.ph = 3; w.S.enraged = true; crown(w, 'W', 'enrageTell'); }],
    ['COUNTERWEIGHT: WINDUP', w => { crown(w, 'W', 'cwTell'); }],
    ['COUNTERWEIGHT: LATCH THROWN', w => { crown(w, 'W', 'cw'); }],
    ['RIVETS: HAMMER RAISED', w => { crown(w, 'E', 'rivetTell'); }],
    ['RIVETS: HAMMERED', w => { crown(w, 'E', 'rivet'); }] ];
  const cw = 80, ch = 100, sc = 3, per = 7;
  cells.forEach(([lab, fn], i) => { const w = fresh(); fn(w); const e = w.e; const cam = [e.x - 40, e.y - 78, cw, ch], c = still(w, cam, 0.35 + i * 0.07);
    const x = (i % per) * (cw * sc + 6), y = curY + Math.floor(i / per) * (ch * sc + 40); put(c, x, y, sc); cap(lab, x, y + ch * sc + 8, '#c8d8e8', 5, cw * sc - 4); });
  curY += Math.ceil(cells.length / per) * (ch * sc + 40) + 6; }

/* 3. the new attacks, with their tells (YELLOW = a shield turns it, RED = it does not) */
title('THE NEW ATTACKS - TELL, RELEASE, AFTER', 'RED = NO BLOCK (COUNTERWEIGHT, SKIP, WHIP)   YELLOW = A SHIELD TURNS IT (RIVETS)');
{ const cw = 280, ch = 292, sc = 2, per = 3, W0 = A.x0 - 8;
  const cells = [
    ['A1 COUNTERWEIGHT: TELL 0.9 S (RED STREAK, LATCH LAMP, FOOT CIRCLE)', [W0, 540, cw, ch], w => { crown(w, 'W', 'cwTell'); w.S.cw = { side: 'W', st: 'tell', t: 0.5, key: 'a' }; }],
    ['A1: THE WEIGHT FALLS DOWN THE LINE', [W0, 540, cw, ch], w => { crown(w, 'W', 'cw'); w.S.cw = { side: 'W', st: 'fall', t: 0.15, key: 'a' }; }],
    ['A1: SLAM (SHOCK RING) THEN THE IRON STEP 4 S', [W0, 540, cw, ch], w => { crown(w, 'W', 'perch'); w.S.cw = { side: 'W', st: 'fall', t: 0.001, key: 'a' }; Hh.update(w.e, 0.016); w.e.mode = 'perch'; w.S.cw.t = 3.75; }],
    ['A2 RIVET RAIN: 5 TOLD DOTS (ALL ALIKE)', [A.x0 + 120, 480, cw, ch], w => { crown(w, 'E', 'rivetTell'); w.S.rivets = SK2.rivetDots(w.S, [{ x: A.x0 + 250, y: A.floor, alive: true }]); }],
    ['A2: HOT RIVETS FALLING FROM THE SKY LINE', [A.x0 + 120, 480, cw, ch], w => { crown(w, 'E', 'rivet'); w.S.rivets = SK2.rivetDots(w.S, [{ x: A.x0 + 250, y: A.floor, alive: true }]); w.S.rivets.forEach((r, i) => { r.st = 'fall'; r.t = 0.05 + i * 0.07; }); }],
    ['A2: IMPACT SPARKS (LANDED)', [A.x0 + 120, 480, cw, ch], w => { crown(w, 'E', 'rivet'); w.S.rivets = SK2.rivetDots(w.S, [{ x: A.x0 + 250, y: A.floor, alive: true }]); w.S.rivets.forEach((r, i) => { r.st = i < 3 ? 'done' : 'tell'; }); }],
    ['A3 / CRANE: THE SKIP TELL 1.0 S (RED ARC + GHOST TUB)', [A.x0 + 120, 476, cw + 40, ch], w => { w.S.ph = 3; w.S.skip.st = 'tell'; w.S.skip.t = 0.5; w.S.skip.dir = 1; hang(w, 'sky', A.x0 + 100); }],
    ['THE SKIP SWEEPS (TRAIL) - HE IS ON THE LOW LINE: SMASHED', [A.x0 + 120, 476, cw + 40, ch], w => { w.S.ph = 3; w.S.points = 'LOW'; w.S.skip.st = 'sweep'; w.S.skip.t = 0.5; w.S.skip.dir = 1; const q = SK2.skipAt(w.S, 0.45, 1); w.S.skip.x = q.x; w.S.skip.y = q.y; hang(w, 'low', A.x0 + 230); }],
    ['CRANE PAUSED (ENRAGED): THE SKIP HOLDS, BRAKE ON', [A.x0 + 120, 476, cw + 40, ch], w => { w.S.ph = 3; w.S.enraged = true; w.S.skip.pauseT = 2; hang(w, 'sky', A.x0 + 300); }],
    ['LINES: SKY (PENNANTS) / LOW (TAGS) / LOW CUT (GREY, FRAYED) + WHIP BAND', [A.x0 + 40, 476, cw + 40, ch], w => { w.S.ph = 2; w.S.lowCut = 4; w.S.points = 'SKY'; w.e.route = 'low'; w.e.mode = 'frayTell'; w.e.modeT = 0.2; w.e.x = A.x0 + 200; w.e.y = w.G.lowY + SK.hang; w.e.face = 1; }],
    ['SKY LINE SNAPPED BY THE SKIP (HE FALLS)', [A.x0 + 40, 476, cw + 40, ch], w => { w.S.ph = 3; w.S.skyCut = 5; w.e.mode = 'slip'; w.e.modeT = 0.3; w.e.x = A.x0 + 190; w.e.y = w.G.skyY + SK.hang + 50; w.e.face = 1; }],
    ['RUNAWAY SKIP (ENRAGED, SWEEPING)', [A.x0 + 120, 476, cw + 40, ch], w => { w.S.ph = 3; w.S.enraged = true; w.S.skip.st = 'sweep'; w.S.skip.t = 0.6; w.S.skip.dir = -1; const q = SK2.skipAt(w.S, 0.7, -1); w.S.skip.x = q.x; w.S.skip.y = q.y; hang(w, 'sky', A.x0 + 380); }] ];
  cells.forEach(([lab, cam, fn], i) => { const w = fresh(); fn(w);
    const c = still(w, cam, 0.6 + i * 0.05); /* the step is a runtime grid write: draw it through the hands' own world call */
    const x = (i % per) * (cam[2] * sc + 6), y = curY + Math.floor(i / per) * (cam[3] * sc + 40); put(c, x, y, sc); cap(lab, x, y + cam[3] * sc + 8, '#c8d8e8', 5, cam[2] * sc - 4); });
  curY += Math.ceil(cells.length / per) * (292 * sc + 40) + 6; }

const [out, og] = mk(SW, curY + 4); og.drawImage(sheet, 0, 0, SW, curY + 4, 0, 0, SW, curY + 4); png(out, OUT);
marks.push([curY, 'end']); const base = OUT.replace(/.png$/, ''); for (let i = 0; i < marks.length - 1; i++) { const [y0] = marks[i], [y1] = marks[i + 1], [pc, pg] = mk(SW, y1 - y0); pg.drawImage(sheet, 0, y0, SW, y1 - y0, 0, 0, SW, y1 - y0); png(pc, base + '-part' + (i + 1) + '.png'); }
console.log('done');
