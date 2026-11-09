/* tools/ft5art-sheet.mjs - FALLING TOWER 5's ART rendered in Node, no browser (claude/ft5art; tools/node-canvas.mjs + a few path/rotate/clip/gradient additions of its own below).
   Runs EVERY painter in src/redraw/ft5_art.js over a spread of states (smoke: nothing throws, twice over gives the same pixels = deterministic) and writes sheets for eyes.
   Node renders are honest about construction and not about light: the page stills are the judge. Not in the suite.
   usage: node tools/ft5art-sheet.mjs [outDir]   (default: scratch/ft5art-node next to the repo's lanes folder) */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
globalThis.__FT5 = true;

/* ---- the Node canvas, taught what the art needs: rotate / transform, path fills and strokes, arcs, clip, linear gradients, strokeRect ---- */
const proto = Object.getPrototypeOf(newCanvas(1, 1).getContext());
const parse = c => { if (typeof c !== 'string') return [0, 0, 0, 255]; let m = c.match(/^#([0-9a-f]{3})$/i); if (m) return [...m[1]].map(h => parseInt(h + h, 16)).concat(255);
  m = c.match(/^#([0-9a-f]{6})$/i); if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)).concat(255);
  m = c.match(/rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(',').map(s => parseFloat(s)); return [p[0], p[1], p[2], p.length > 3 ? Math.round(p[3] * 255) : 255]; } throw new Error('colour ' + c); };
const put0 = proto._put, save0 = proto.save, restore0 = proto.restore, fill0 = proto.fillRect;
proto._put = function (i, c) { if (this._clip && !this._clip[i]) return; put0.call(this, i, c); };
proto.save = function () { (this._cs || (this._cs = [])).push(this._clip); save0.call(this); };
proto.restore = function () { restore0.call(this); this._clip = this._cs && this._cs.length ? this._cs.pop() : null; };
proto.rotate = function (a) { const m = this.m, c = Math.cos(a), s = Math.sin(a); this.m = [m[0] * c + m[2] * s, m[1] * c + m[3] * s, -m[0] * s + m[2] * c, -m[1] * s + m[3] * c, m[4], m[5]]; };
proto.transform = function (a, b, c, d, e, f) { const m = this.m; this.m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]; };
proto.setLineDash = function () {};
Object.defineProperty(proto, 'canvas', { get() { return this.cv; } });
proto.createLinearGradient = function (x0, y0, x1, y1) { return { x0, y0, x1, y1, stops: [], addColorStop(o, c) { this.stops.push([o, parse(c)]); } }; };
const gradAt = (G, x, y) => { const dx = G.x1 - G.x0, dy = G.y1 - G.y0, t = Math.max(0, Math.min(1, ((x - G.x0) * dx + (y - G.y0) * dy) / (dx * dx + dy * dy || 1)));
  let a = G.stops[0], b = G.stops[G.stops.length - 1]; for (let i = 1; i < G.stops.length; i++) if (t <= G.stops[i][0]) { a = G.stops[i - 1]; b = G.stops[i]; break; }
  const k = b[0] === a[0] ? 0 : (t - a[0]) / (b[0] - a[0]); return a[1].map((v, j) => v + (b[1][j] - v) * k); };
proto.fillRect = function (x, y, w, h) {
  const m = this.m, grad = typeof this.fillStyle === 'object';
  if (!grad && m[1] === 0 && m[2] === 0) return fill0.call(this, x, y, w, h);
  const W = this.cv.width, H = this.cv.height, cs = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([a, b]) => this._xf(a, b));
  const x0 = Math.max(0, Math.floor(Math.min(...cs.map(q => q[0])))), x1 = Math.min(W, Math.ceil(Math.max(...cs.map(q => q[0])))), y0 = Math.max(0, Math.floor(Math.min(...cs.map(q => q[1])))), y1 = Math.min(H, Math.ceil(Math.max(...cs.map(q => q[1]))));
  const det = m[0] * m[3] - m[1] * m[2], col = grad ? null : parse(this.fillStyle);
  for (let j = y0; j < y1; j++) for (let i = x0; i < x1; i++) { const X = i + 0.5 - m[4], Y = j + 0.5 - m[5], ux = (m[3] * X - m[2] * Y) / det, uy = (-m[1] * X + m[0] * Y) / det;
    if (ux < x || ux >= x + w || uy < y || uy >= y + h) continue; this._put(j * W + i, grad ? gradAt(this.fillStyle, ux, uy) : col); } };
proto.beginPath = function () { this._sub = []; };
proto.moveTo = function (x, y) { (this._sub || (this._sub = [])).push([this._xf(x, y)]); };
proto.lineTo = function (x, y) { const s = this._sub || (this._sub = []); if (!s.length) s.push([]); s[s.length - 1].push(this._xf(x, y)); };
proto.closePath = function () {};
proto.quadraticCurveTo = function (cx, cy, x, y) { const s = this._sub || (this._sub = []), poly = s[s.length - 1]; if (!poly || !poly.length) return this.lineTo(x, y); const [px0, py0] = this._inv(poly[poly.length - 1]); for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t; poly.push(this._xf(u * u * px0 + 2 * u * t * cx + t * t * x, u * u * py0 + 2 * u * t * cy + t * t * y)); } };
proto._inv = function ([X, Y]) { const m = this.m, det = m[0] * m[3] - m[1] * m[2], dx = X - m[4], dy = Y - m[5]; return [(m[3] * dx - m[2] * dy) / det, (-m[1] * dx + m[0] * dy) / det]; };
proto.arc = function (cx, cy, r, a0, a1) { const s = this._sub || (this._sub = []); const pts = []; const n = 28; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push(this._xf(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); } s.push(pts); };
proto.ellipse = function (cx, cy, rx, ry, rot, a0, a1) { const s = this._sub || (this._sub = []); const pts = []; for (let i = 0; i <= 28; i++) { const a = a0 + (a1 - a0) * i / 28; pts.push(this._xf(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry)); } s.push(pts); };
const mask = (g) => { const W = g.cv.width, H = g.cv.height, M = new Uint8Array(W * H); for (const poly of g._sub || []) { if (poly.length < 3) continue;
  let lo = Infinity, hi = -Infinity; for (const p of poly) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
  for (let j = Math.max(0, Math.floor(lo)); j < Math.min(H, Math.ceil(hi)); j++) { const sy = j + 0.5, xs = []; for (let k = 0; k < poly.length; k++) { const a = poly[k], b = poly[(k + 1) % poly.length]; if ((a[1] <= sy) !== (b[1] <= sy)) xs.push(a[0] + (sy - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((p, q) => p - q); for (let k = 0; k + 1 < xs.length; k += 2) for (let i = Math.max(0, Math.round(xs[k])); i < Math.min(W, Math.round(xs[k + 1])); i++) M[j * W + i] = 1; } } return M; };
proto.fill = function () { const M = mask(this), W = this.cv.width, c = parse(this.fillStyle); for (let i = 0; i < M.length; i++) if (M[i]) this._put(i, c); };
proto.clip = function () { const M = mask(this); if (this._clip) for (let i = 0; i < M.length; i++) M[i] &= this._clip[i]; this._clip = M; };
proto.stroke = function () { const c = parse(this.strokeStyle), W = this.cv.width, H = this.cv.height, lw = Math.max(1, Math.round(this.lineWidth || 1));
  for (const poly of this._sub || []) for (let k = 1; k < poly.length; k++) { const [ax, ay] = poly[k - 1], [bx, by] = poly[k], n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let t = 0; t <= n; t++) { const px = Math.round(ax + (bx - ax) * t / n - (lw - 1) / 2), py = Math.round(ay + (by - ay) * t / n - (lw - 1) / 2); for (let a = 0; a < lw; a++) for (let b = 0; b < lw; b++) { const X = px + a, Y = py + b; if (X >= 0 && Y >= 0 && X < W && Y < H) this._put(Y * W + X, c); } } } };
proto.strokeRect = function (x, y, w, h) { this.beginPath(); this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.lineTo(x, y); this.stroke(); };

const ART = await import('../src/redraw/ft5_art.js');
const FTW = await import('../src/redraw/fallen_tower.js');
const { LEVELS, T } = await import('../src/level.js');
const SF = await import('../src/spire-field.js');
const { FT5_ARENA } = await import('../src/tower-fall5.js');
const TS = 16, VW = 320, VH = 180;
const out = resolve(process.argv[2] || join(import.meta.dirname, '..', '..', 'scratch', 'ft5art-node')); mkdirSync(out, { recursive: true });
const cv = (w = VW, h = VH, bg = '#0a0e22') => { const c = newCanvas(w, h), g = c.getContext(); g.fillStyle = bg; g.fillRect(0, 0, w, h); return [c, g]; };
const hash = c => { let h = 0; for (let i = 0; i < c._d.length; i += 7) h = (h * 31 + c._d[i]) >>> 0; return h; };
const scenes = [];
const scene = (name, fn, w = VW, h = VH, bg) => { const run = () => { const [c, g] = cv(w, h, bg); fn(g, c); return c; }; const a = run(), b = run(); assert.equal(hash(a), hash(b), name + ': two draws of the same frame differ (not deterministic)'); scenes.push([name, a]); };

/* 1. HIS POISON: the sea (calm and told), the swell along the wall's front, a tide's surface up close */
scene('poison-sea', (g, c) => { g.fillStyle = '#0a0e22'; g.fillRect(0, 0, VW, 60); ART.paintPoison(g, 0, VW, 70, VH, 3.1, { phase: 400 }); ART.paintPoison(g, 0, VW, 150, VH, 3.1, { phase: 90, tell: true }); });
scene('poison-front', (g) => { g.fillStyle = '#16203a'; g.fillRect(0, 0, VW, VH); ART.paintPoisonFront(g, 200, 1, VH, 2.4); g.fillStyle = '#e8e4d0'; g.fillRect(215, 120, 6, 12); });
/* 2. THE CHUNKS: whole, then counting, per profile, over the tower's stone */
const SK = FTW.bakeFallenSkins(), SK5 = ART.skins();
scene('chunks', (g) => { const row = (y, kind, st, kk, t, cnt) => { const c0 = { x0: 1, x1: 6, row: 0, rows: 1, kind, t, count: cnt, st };
  for (let i = 0; i < 7; i++) g.drawImage(SK.fallen[i % 3], (1 + i) * TS, y); const r = ART.chunk(g, c0, 1 * TS, y, 6 * TS + 16, 2.2, st === 'count', kk); assert.ok(r >= 1, kind + ' painted nothing'); };
  row(10, 'teach', 'whole', 0, 0, 3); row(46, 'teach', 'count', 0.5, 1.5, 3); row(82, 'quick', 'count', 0.7, 0.4, 1.2); row(118, 'snap', 'whole', 0, 0, 0.7); row(150, 'snap', 'count', 0.9, 0.1, 0.7);
  assert.equal(ART.chunk(g, { x0: 0, x1: 1, row: 0, kind: 'deck' }, 0, 0, 32, 0, false, 0), 0, 'a non-FT5 chunk must be left to the default paint'); }, 140, VH);
/* 3. THE SLAB */
scene('slab', (g) => { for (const [i, st] of ['wait', 'tell', 'slide'].entries()) { const m = { x: 20 + i * 100, y: 40 + i * 4, w: 48, h: 8, st, t: 0.9, dir: 1, sx: 20, vx: 20, vy: 40 }; ART.paintSlab(g, m, 0, 0, 1.3); } ART.paintSlab(g, { x: 0, y: 4000, w: 48, h: 8, st: 'gone' }, 0, 0, 0); }, 300, 90);
/* 4. THE SKINS: spire slate, the lying wall, beside the tower's own */
scene('skins', (g) => { for (let k = 0; k < 3; k++) { g.drawImage(SK.fallen[k], 8 + k * 20, 8); g.drawImage(SK5.spire[k], 8 + k * 20, 32); g.drawImage(SK5.lying[k], 8 + k * 20, 56); } for (let x = 0; x < 6; x++) for (let y = 0; y < 3; y++) { g.drawImage(SK5.spire[(x + y) % 3], 80 + x * 16, 8 + y * 16); g.drawImage(SK5.lying[(x + y) % 3], 190 + x * 16, 8 + y * 16); } }, 300, 80);
/* 5. THE TIPPED HORIZON in a hole of the reading room, per act */
scene('windows', (g) => { for (const [i, tip] of [0, 5, 15, 30].entries()) { const c = newCanvas(160, 120); FTW.paintFallenRoom(c.getContext(), 'reading', 0, 0, 160, 120, 60 + i * 12, 100, 1.1, null, tip); g.drawImage(c, (i % 2) * 160, Math.floor(i / 2) * 90); } }, 320, 180);
/* 6. THE LEVEL, built with FT5 on: the arena, the run, the backdrop and pieces over real tiles */
const L = LEVELS.find(l => l.id === 'fallingtower').build(); const F = L.spireField, A = FT5_ARENA;
const tiles = (g, cx, cy) => { const skins = L.mage.skins; for (let ty = Math.floor(cy / TS); ty <= Math.ceil((cy + VH) / TS); ty++) for (let tx = Math.floor(cx / TS); tx <= Math.ceil((cx + VW) / TS); tx++) { const t = L.grid[ty * L.W + tx]; if (!t) continue;
  let set = SK.fallen; for (const [x0, x1, y0, y1, kind] of skins) if (tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1) set = kind === 'spire' ? SK5.spire : kind === 'lying' ? SK5.lying : kind === 'dune' ? SK.fallen : set;
  g.drawImage(set[(tx * 7 + ty * 3) % 3], tx * TS - cx, ty * TS - cy); if (L.grid[(ty - 1) * L.W + tx] === T.AIR) { g.fillStyle = 'rgba(236,224,255,0.55)'; g.fillRect(tx * TS - cx, ty * TS - cy, TS, 1); } } };
const arenaFrame = (name, rtFn, camX, camY, boss) => scene(name, (g) => { SF.spireReset(L, null); const R = F.rt; rtFn && rtFn(R); ART.drawBack(g, L, camX, camY, 4.0); tiles(g, camX, camY); ART.drawWorld(g, L, camX, camY, 4.0); SF.drawSpireField(g, L, camX, camY, 4.0, boss || null, null); }, VW, VH, '#0e1230');
const cxA = (A.x0 + 14) * TS, cyA = (A.runFloor - 14) * TS;
arenaFrame('arena-calm', null, cxA, cyA);
arenaFrame('arena-tide-tell', R => { R.tides[0] = { st: 'tell', t: 0.8 }; R.spires[0] = { st: 'tell', t: 0.6 }; }, cxA, cyA);
arenaFrame('arena-tide-high', R => { R.seaY = (A.sea - 8) * TS; R.spires[0] = { st: 'gone', t: 0 }; }, cxA, cyA);
arenaFrame('arena-buttress', R => { R.butt[2] = { st: 'up', t: 0 }; R.butt[4] = { st: 'down', t: 0 }; }, (A.x0 + 30) * TS, (A.runFloor - 22) * TS, { x: (A.x0 + 33) * TS, y: (A.runFloor - 16) * TS, alive: true, mode: 'hover', hp: 1 });
arenaFrame('arena-fade', R => { R.fade = { st: 'tell', t: 0.7 }; R.seaY = (A.sea - 8) * TS; R.rugs.set(0, { x: cxA + 160, y: cyA + 130 }); }, cxA, cyA);
{ const art0 = { goneAt: {} }; scene('spire-collapse', (g) => { SF.spireReset(L, null); const R = F.rt; R.spires[1] = { st: 'gone', t: 0 }; R.art = art0; art0.goneAt[1] = 3.0; ART.drawBack(g, L, cxA, cyA, 3.7); tiles(g, cxA, cyA); SF.drawSpireField(g, L, cxA, cyA, 3.7, null, null); }, VW, VH, '#0e1230'); }
/* the run and the bend, the shaft */
const cxR = 168 * TS, cyR = 48 * TS;
scene('run', (g) => { SF.spireReset(L, null); L.ft5.rt = undefined; ART.drawBack(g, L, cxR, cyR, 5.0); tiles(g, cxR, cyR); ART.drawWorld(g, L, cxR, cyR, 5.0); for (const c of L.crumbles) if (c.x0 >= 160 && c.x0 < 190) { const k = c.chain === 'run1' ? 0.6 : 0; ART.chunk(g, { ...c, st: 'count', t: 0.2 }, c.x0 * TS - cxR, c.row * TS - cyR, (c.x1 - c.x0 + 1) * TS, 5.0, k > 0, k); } }, VW, VH, '#0e1230');
{ const run = L.ft5.run; assert.ok(run.windows.length === 3 && run.buttresses.length === 3, 'the run changed shape: re-check drawRun'); }
/* pieces: told and done, over the tiles */
const pcx = (id) => { const p = L.ft5.pieces.find(q => q.id === id); return p; };
for (const [id, st, tl] of [['shelves', 'tell', 0.5], ['shelves', 'done', 0], ['dome', 'tell', 0.35], ['dome', 'done', 0], ['shear', 'tell', 1.0], ['bell', 'tell', 0.5], ['bell', 'done', 0], ['over', 'tell', 0.7]]) {
  const p = pcx(id), z = p.zone || (p.ledges ? [p.ledges[0][0], p.ledges[0][1], p.ledges[0][2], p.ledges[0][2]] : [0, 0, 0, 0]); const cxp = Math.round((z[0] + z[1]) / 2 * TS - VW / 2), cyp = Math.round((p.id === 'over' ? z[3] : z[3]) * TS - VH * 0.6);
  scene('piece-' + id + '-' + st, (g) => { const R = L.ft5.rt = { act: 0, roll: 0, kickT: 0, changed: new Map(), peeled: {}, breathed: {}, said: {}, pieces: Object.fromEntries(L.ft5.pieces.map(q => [q.id, { st: 'wait', t: 0 }])), art: { doneAt: { [id]: st === 'done' ? 3.0 : undefined } } };
    R.pieces[id] = { st, t: st === 'tell' ? (p.tell || 1) * (1 - tl) : 0 }; for (const q of p.lay || []) if (st === 'done') for (let x = q[0]; x <= q[1]; x++) L.grid[q[2] * L.W + x] = T.ONEWAY;
    tiles(g, cxp, cyp); ART.drawWorld(g, L, cxp, cyp, st === 'done' ? 3.3 : 4.0); }, VW, VH, '#0e1230'); }
/* the open hall: phase 2's sky, the void, and the Folly's lurch */
scene('open-hall', (g) => { g.fillStyle = '#0e0a22'; g.fillRect(0, 0, VW, 110); ART.openDress(g, 0, 0, 2.0, 110, VW); g.fillStyle = '#5a2a8a'; g.fillRect(0, 114, VW, 10); ART.abyss(g, { floor: 100 }, 0, 0, 2.0); }, VW, VH);
scene('lurch', (g) => { g.fillStyle = '#1a1830'; g.fillRect(0, 0, VW, VH); ART.lurch(g, 0.6, 2.0); }, VW, VH);
scene('tip-at', (g) => { assert.equal(ART.tipAt({}, 0, 0, 100, 100), 0, 'tipAt: no FT5 = 0'); assert.ok([5, 15, 30].includes(ART.tipAt(L, L.ft5.floors[0].X0 + 4, L.ft5.floors[0].top, 400, 400)), 'tipAt: Act I room'); }, 4, 4);

/* (claude/ft5fix) the realms, phase 2's hall and the shaft's far glow, through the game's own painters */
{ const MR = await import('../src/mage-realms.js'), SN = await import('../src/sanctum.js'), P2 = FT5_ARENA, F = L.spireField;
  const A2 = { ...L.arena, ...F.p2Arena, carpet: true, inPlace: true };
  for (const kind of ['fire', 'ice']) for (const cx of [A2.x0 + 400]) scene('realm-' + kind, (g) => { const e = { realm: { kind, i: 0, t: 3, A: A2, lit: [2, 5], ph: 'tell', holes: [3], ceil: kind === 'ice' ? 20 : 0, bites: [] } }; MR.drawRealm(g, e, A2, cx, A2.y0 - 40, 2.0); }, VW, VH);
  scene('p2-hall', (g) => { const cx = (A2.x0 + A2.x1) / 2 - VW / 2, cy = A2.floor - 130; SN.drawSanctum(g, L, A2, cx, cy, 2.0, SF.carpetBoxOf(A2)); }, VW, VH);
  scene('shaft-far', (g) => { g.fillStyle = '#10142a'; g.fillRect(0, 0, VW, VH); ART.paintPoisonGlow(g, VW, VH, 400, 2.0); }, VW, VH);
  scene('shaft-mid', (g) => { g.fillStyle = '#10142a'; g.fillRect(0, 0, VW, VH); ART.paintPoisonGlow(g, VW, VH, 200, 2.0); }, VW, VH);
  scene('shaft-near', (g) => { g.fillStyle = '#10142a'; g.fillRect(0, 0, VW, VH); ART.paintPoisonGlow(g, VW, VH, 40, 2.0); }, VW, VH);
  scene('shaft-in', (g) => { g.fillStyle = '#10142a'; g.fillRect(0, 0, VW, VH); ART.paintPoison(g, 0, VW, 120, VH, 2.0, { vw: VW, haze: 2 }); }, VW, VH); }
const names = scenes.map(s => s[0]);
const group = (list, file, opts) => savePNG(sheet(list.map(n => scenes.find(s => s[0] === n)[1]), opts), join(out, file));
group(['poison-sea', 'poison-front', 'chunks'], 'ft5art-node-poison-chunks.png', { scale: 2, maxW: 1400, pad: 8 });
group(['slab', 'skins', 'windows'], 'ft5art-node-slab-skins-windows.png', { scale: 2, maxW: 1400, pad: 8 });
group(['arena-calm', 'arena-tide-tell', 'arena-tide-high', 'arena-buttress', 'arena-fade', 'spire-collapse'], 'ft5art-node-arena.png', { scale: 2, maxW: 1400, pad: 8 });
group(['realm-fire', 'realm-ice', 'p2-hall'], 'ft5fix-node-realms-p2.png', { scale: 2, maxW: 1400, pad: 8 });
group(['shaft-far', 'shaft-mid', 'shaft-near', 'shaft-in'], 'ft5fix-node-shaft.png', { scale: 2, maxW: 1400, pad: 8 });
group(['run', 'open-hall', 'lurch'], 'ft5art-node-run-hall.png', { scale: 2, maxW: 1400, pad: 8 });
group(names.filter(n => n.startsWith('piece-')), 'ft5art-node-pieces.png', { scale: 2, maxW: 1400, pad: 8 });
console.log('ft5art-sheet ok: ' + names.length + ' scenes, deterministic, written to ' + out);
