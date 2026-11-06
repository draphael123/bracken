/* tools/pf-art-lint.mjs - THE PIRATE FLEET's ART, node-only lint (claude/pfart, 2026-11-05). No page, no browser, no real canvas: a recording 2d-context stub stands in for document.createElement('canvas').
     node tools/pf-art-lint.mjs
   A  the tile kit: every tile of the built level (SOLID/ONEWAY/PLANK/NET, every zone, bed, hull, yard, shroud) bakes to a 16x16 canvas; no NaN, no undefined colour; every colour is a literal of the kit
   B  the backdrop: sky, far, mid, near, fg bake (and draw with a stub g) with no bad colour, and every layer has its life lists
   C  the ship pieces: hull in all five zones, rig, far prize, longboat, winch (idle / ready / hauling), line, stump + chain, wreck, foam (every phase), crest, gauge, streaks (every skin, tell and bite)
   D  THE FREEBOOTER: every mode the boss can be in has its own pose; every TELL's pose differs from its RELEASE's and from his idle; every draw stays in a 90x80 box round his feet; both facings mirror
   E  palette discipline: distinct colours per module under a ceiling (a kit, not a rainbow)
   F  files: no ad-block words in the new filenames; the level carries pfKit and the 'pfleet' palette; main.js wires every hook */
import { readFileSync, readdirSync } from 'node:fs';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const URLS = f => new URL('../src/' + f, import.meta.url);

/* ---------- a recording canvas stub ---------- */
const COLS = new Map(), CALLS = [];
let REC = null;                                            /* when set, every fillRect is pushed here (a pose's fingerprint) */
let BAD = [];
function makeCtx(w, h) {
  const g = { canvas: { width: w, height: h }, fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1, lineWidth: 1, imageSmoothingEnabled: false, globalCompositeOperation: 'source-over',
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1);
      if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c);
      if (/undefined|NaN|null/.test(c)) BAD.push('bad colour ' + c);
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); },
    clearRect() {}, drawImage() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, arc() {}, ellipse() {}, save() {}, restore() {}, setLineDash() {},
    getImageData(x, y, ww, hh) { return { data: new Uint8ClampedArray(ww * hh * 4), width: ww, height: hh }; }, putImageData() {}, createLinearGradient() { return { addColorStop() {} }; } };
  return g;
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => { const g = makeCtx(c.width, c.height); g.canvas = c; return g; }; return c; } };
const lit = src => new Set([...readFileSync(src, 'utf8').matchAll(/'(#[0-9a-fA-F]{6})'/g)].map(m => m[1].toLowerCase()));
const FILES = { tiles: URLS('redraw/pirate_fleet_tiles.js'), back: URLS('redraw/pirate_fleet_back.js'), art: URLS('redraw/pirate_fleet_art.js'), fb: URLS('redraw/freebooter_art.js') };
const LIT = {}; for (const k in FILES) LIT[k] = lit(FILES[k]);
const allLit = new Set([...LIT.tiles, ...LIT.back, ...LIT.art, ...LIT.fb]);
const fromRgb = c => /^rgb\(/.test(c);
const reset = () => { COLS.clear(); BAD = []; };
const colourBad = (allowed) => [...COLS.keys()].filter(c => !fromRgb(c) && !/^rgba\(/.test(c) && !allowed.has(c.toLowerCase()));

const PFT = await import(FILES.tiles.href), PFB = await import(FILES.back.href), PFA = await import(FILES.art.href), FBA = await import(FILES.fb.href);
const { LEVELS, T } = await import(URLS('level.js').href);
const FBM = await import(URLS('freebooter-boss.js').href);
const row = LEVELS.find(l => l.id === 'piratefleet'), L = row.build();

// ---------- A. THE TILE KIT ----------
reset(); const kinds = {}; let tiles = 0;
const at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) { const t = at(x, y); if (t === T.AIR) continue;
  const c = PFT.pfTile(t, x, y, at, T, L); if (c) { tiles++; kinds[t] = (kinds[t] || 0) + 1; ok(c.width === 16 && c.height === 16, 'tile 16x16 at ' + x + ',' + y); } }
ok(tiles > 1000, 'the kit drew ' + tiles + ' cells'); ok(kinds[T.SOLID] > 500 && kinds[T.NET] > 20 && (kinds[T.ONEWAY] || 0) + (kinds[T.PLANK] || 0) > 3, 'solid / net / yard all present: ' + JSON.stringify(kinds));
ok(BAD.length === 0, 'tiles: no NaN rects or bad colours ' + BAD.slice(0, 3));
ok(colourBad(LIT.tiles).length === 0, 'tiles: every colour is a kit literal: ' + colourBad(LIT.tiles).slice(0, 4));
const tilesCols = COLS.size;
{ let z = new Set(); for (let x = 0; x < L.W; x += 3) z.add(PFT.zoneOf(x, 30)); ok(z.size === 5, 'five zones across the level: ' + [...z]); }
{ const at2 = () => T.AIR; ok(PFT.pfTile(T.SPIKE, 3, 3, at2, T, L) === null, 'a tile the kit does not own falls back to the game'); }
ok(PFT.pfTile(T.SOLID, 5, PFT.BED_ROW, (x, y) => (y < PFT.BED_ROW ? T.AIR : T.SOLID), T, L).width === 16, 'sea bed top bakes');

// ---------- B. THE BACKDROP ----------
reset();
const sky = PFB.bakeSky(180), far = PFB.bakeFar(), mid = PFB.bakeMid(), near = PFB.bakeNear(), fg = PFB.bakeFG(640, 180, 4);
ok(sky.width === 1 && sky.height === 180, 'sky is a 1x180 column'); ok(far.width === 640 && far.height === 150, 'far 640x150'); ok(mid.width === 640 && mid.height === 160, 'mid 640x160'); ok(near.width === 640 && near.height === 300, 'near 640x300'); ok(fg.width === 640 && fg.height === 180, 'fg 640x180');
ok(PFB.bakeFar() === far && PFB.bakeMid() === mid, 'layers bake once');
ok(far.life && far.life.flags.length >= 1 && far.life.gulls.length >= 3, 'far life: the red pennant and gulls'); ok(mid.life && mid.life.fires.length >= 2 && mid.life.lamps.length >= 6, 'mid life: a prize burning, lanterns lit'); ok(near.life && near.life.lamps.length >= 6, 'near life: gallery windows');
ok(BAD.length === 0, 'backdrop: no NaN rects or bad colours ' + BAD.slice(0, 3));
ok(colourBad(LIT.back).length === 0, 'backdrop: every colour is a literal: ' + colourBad(LIT.back).slice(0, 4));
const backCols = COLS.size;
{ const g = makeCtx(320, 180); for (const full of [true, false]) for (const cx of [0, 700, 3000]) for (const dY of [0, 200, 400]) { PFB.drawBackdrop(g, cx, 100, 320, 180, L, cx / 100, dY, full); PFB.drawNear(g, cx, 100, 320, 180, L, cx / 100, dY); }
  ok(BAD.length === 0, 'backdrop draws clean at 18 camera spots ' + BAD.slice(0, 3)); }

// ---------- C. THE SHIP PIECES ----------
reset(); const g = makeCtx(400, 300), TT = [0, 0.37, 1.9];
for (const zone of [0, 1, 2, 3, 4]) for (const w of [64, 96, 176, 208]) for (const o of [{}, { prize: true }, { boss: true, prize: true }]) PFA.drawSwellHull(g, 20, 100, w, { zone, depth: 14 + w % 17, seed: w, ...o });
for (const w of [64, 176, 240]) for (const t of TT) { PFA.drawRig(g, 10, 100, w, { sc: 1, seed: 3, t }); PFA.drawRig(g, 10, 100, w, { sc: 0.45, alpha: 0.6, boss: true, t }); PFA.drawFarPrize(g, 10, 100, w, 0.45, 0.6, t, { glint: true, boss: w === 240 }); }
for (const t of TT) { PFA.drawLongboat(g, 10, 100, 96, { t }); for (const st of [{}, { ready: true }, { hauling: true }]) PFA.drawWinch(g, 30, 100, t, st);
  for (const f of [0, 0.3, 1]) { PFA.drawLine(g, 10, 100, 200, 60, f, t); PFA.drawLine(g, 10, 100, 200, 60, f, t, { taut: true }); }
  for (const k of ['stump', 'chain']) for (const held of [false, true]) PFA.drawStump(g, 40, 100, k, t, held);
  PFA.drawWreck(g, 100, 100, t); for (const ph of ['warn', 'turn', 'rise']) PFA.drawFoam(g, 0, 300, 100, t, ph); PFA.drawCrest(g, 100, 100, 30, t);
  for (const gg of [{ k: 0.2, ph: 'low', tell: false, coming: null }, { k: 0.6, ph: 'warn', t: 0.5, tell: true, coming: 'in' }, { k: 1, ph: 'high', tell: false, coming: 'out' }]) PFA.drawGauge(g, 6, 30, gg, t);
  const flds = [{ f: { kind: 'current', box: [19, 31, 26, 40], dir: [-1, 0], strength: 36 }, s: 1, ph: 'on', dirK: 1 }, { f: { kind: 'current', box: [151, 31, 164, 40], dir: [1, 0], strength: 64 }, s: 0.6, ph: 'tell', dirK: -1 },
    { f: { kind: 'whirl', ring: [222, 37, 5], strength: 140 }, s: 1, ph: 'on', dirK: 1 }, { f: { kind: 'current', box: [323, 30, 338, 40], dir: [-1, 0], strength: 110 }, s: 1, ph: 'on', dirK: 1 }, { f: { kind: 'whirl', ring: [222, 37, 5] }, s: 0, ph: 'off', dirK: 1 }];
  for (const fs of flds) { PFA.drawStreaks(g, fs, fs.f.box ? fs.f.box[0] * 16 - 40 : 222 * 16 - 100, 480, t, 320); PFA.drawStreaks(g, fs, 0, 0, t, 320); } }
ok(BAD.length === 0, 'pieces: no NaN rects or bad colours ' + BAD.slice(0, 3));
ok(colourBad(new Set([...LIT.art, ...LIT.tiles])).length === 0, 'pieces: every colour is a literal: ' + colourBad(new Set([...LIT.art, ...LIT.tiles])).slice(0, 4));
const artCols = COLS.size;

// ---------- D. THE FREEBOOTER ----------
const modes = new Set(); const src = readFileSync(URLS('freebooter-boss.js'), 'utf8'); for (const m of src.matchAll(/setMode\(e, '([A-Za-z]+)'/g)) modes.add(m[1]);
for (const m of ['sleep', 'wake', 'walk', 'idle']) modes.add(m); for (const k in FBM.MOVES) { modes.add(FBM.MOVES[k].tell); modes.add(FBM.MOVES[k].release); }
const print = (mode, p, f = 1, t = 0.4, o = {}) => { reset(); REC = []; const gg = makeCtx(200, 200); FBA.drawFreebooter(gg, 100, 100, f, { mode, p, ...o }, t); const r = REC; REC = null; return r; };
const fp = r => r.join('|');
const sheet = {};
reset();
for (const m of modes) { const a = print(m, 0.3), b = print(m, 0.8); sheet[m] = fp(a); ok(a.length > 60, m + ' draws a body (' + a.length + ' rects)'); ok(BAD.length === 0, m + ': no bad rects ' + BAD.slice(0, 2));
  ok(colourBad(LIT.fb).length === 0, m + ': colours in his ramp ' + colourBad(LIT.fb).slice(0, 3)); }
const idle = sheet.idle;
for (const [k, M] of Object.entries(FBM.MOVES)) { ok(sheet[M.tell] !== sheet[M.release], k + ': windup pose differs from release pose'); ok(sheet[M.tell] !== idle, k + ': the tell is not his idle'); ok(sheet[M.release] !== idle, k + ': the release is not his idle'); }
ok(sheet.reload !== idle && sheet.stuck !== idle && sheet.reload !== sheet.stuck, 'the two OPEN poses (reload, stuck) are their own');
ok(fp(print('cuts', 0.1)) !== fp(print('cuts', 0.3)), 'cuts: alternating arcs (progress changes the pose)'); ok(fp(print('plungeTell', 0.5)) !== fp(print('plungeAir', 0.5)), 'plunge: tell vs dive differ');
ok(sheet.haulTell !== sheet.haulWait, 'haul: whirl vs hauling differ'); ok(sheet.boardTell !== sheet.boardAir, 'board: crouch vs leap differ');
ok(fp(print('pistolTell', 0.9)) !== fp(print('pistolTell', 0.1)), 'pistol tell animates as it levels');
/* the box round his feet: x -45..+45 and y -62..+16 at feet (100,100) */
let out = 0; for (const m of modes) for (const p of [0, 0.5, 1]) for (const f of [1, -1]) for (const r of print(m, p, f)) { const [x, y, w, h] = r.split(',').map(Number); if (x < 55 || x + w > 145 || y < 38 || y + h > 116) out++; }
ok(out === 0, 'every pose inside the box round his feet (' + out + ' rects outside)');
/* mirrored: facing -1 is facing +1 reflected about x = 100 */
{ const A = print('idle', 0, 1), B = print('idle', 0, -1); ok(A.length === B.length, 'both facings draw the same pieces'); const mir = A.map(r => { const [x, y, w, h, c, a] = r.split(','); return [200 - (+x + +w), y, w, h, c, a].join(','); }); ok(fp(mir) === fp(B), 'facing -1 mirrors facing +1 exactly'); }
{ reset(); const gg = makeCtx(300, 200); for (const k of [0, 0.3, 0.6, 1]) { FBA.drawDeadFreebooter(gg, 100, 100, 1, k, 0.2); FBA.drawFlashBall(gg, 100, 100, k, 0.2); } FBA.drawAimLine(gg, 0, 0, 90, 20, true, 0); FBA.drawAimLine(gg, 0, 0, 90, 20, false, 0); FBA.drawBallTrace(gg, 0, 0, 90, 20); FBA.drawPlungeMark(gg, 100, 100, 26, true, 0.2); FBA.drawPlungeMark(gg, 100, 100, 26, false, 0.2); FBA.drawFlag(gg, 20, 100, 1, 0.2); FBA.drawFlag(gg, 20, 100, 0, 0.2);
  ok(BAD.length === 0, 'death, flash, aim, trace, plunge mark and flag draw clean ' + BAD.slice(0, 2)); ok(fp(print('idle', 0)) !== '', 'ok'); }
const fbCols = new Set(); { reset(); for (const m of modes) print(m, 0.5); for (const c of COLS.keys()) fbCols.add(c); }

// ---------- E. PALETTE DISCIPLINE ----------
ok(LIT.tiles.size <= 130, 'tile kit palette ' + LIT.tiles.size + ' literals (<= 130)'); ok(LIT.back.size <= 110, 'backdrop palette ' + LIT.back.size + ' literals (<= 110)');
ok(LIT.art.size <= 110, 'ship pieces palette ' + LIT.art.size + ' literals (<= 110)'); ok(LIT.fb.size <= 110, 'Freebooter palette ' + LIT.fb.size + ' literals (<= 110)');
ok(fbCols.size <= 70, 'Freebooter draws in ' + fbCols.size + ' colours (<= 70)');
ok(tilesCols <= 120, 'tile kit baked ' + tilesCols + ' distinct colours'); ok(backCols <= 160, 'backdrop baked ' + backCols + ' distinct colours (+ the sky ramp)'); ok(artCols <= 190, 'ship pieces drew ' + artCols + ' distinct colours');

// ---------- F. FILES AND WIRING ----------
const newFiles = ['redraw/pirate_fleet_tiles.js', 'redraw/pirate_fleet_back.js', 'redraw/pirate_fleet_art.js', 'redraw/freebooter_art.js'];
for (const f of newFiles) ok(!/(^|[^a-z])(ad|admiral|banner|track|pixel|promo)([^a-z]|$)/i.test(f.split('/').pop().replace(/\.js$/, '').replace(/_/g, ' ')), 'no ad-block word in ' + f);
ok(L.pfKit === true && L.palette.sky === 'pfleet' && L.palette.fg === 'pfleet', 'level: pfKit + pfleet palette');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
for (const hook of ['PFT.pfTile(', 'PFB.drawBackdrop(', 'PFB.drawNear(', 'PFB.bakeFG(', 'PFB.bakeSky(', "pal.far === 'pfleet'", "pal.mid === 'pfleet'"]) ok(main.includes(hook), 'main.js wires ' + hook);
const hands = readFileSync(new URL('../src/pirate-fleet-hands.js', import.meta.url), 'utf8'), fbh = readFileSync(new URL('../src/freebooter-hands.js', import.meta.url), 'utf8');
for (const k of ['drawSwellHull', 'drawRig', 'drawFarPrize', 'drawLongboat', 'drawWinch', 'drawLine', 'drawStump', 'drawWreck', 'drawFoam', 'drawCrest', 'drawGauge', 'drawStreaks']) ok(hands.includes('PFA.' + k) || fbh.includes('PFA.' + k), 'a hands file draws ' + k);
for (const k of ['drawFreebooter', 'drawDeadFreebooter', 'drawFlashBall', 'drawAimLine', 'drawBallTrace', 'drawPlungeMark']) ok(fbh.includes('FBA.' + k), 'freebooter-hands draws ' + k);
ok(!/hullCol|deckCol/.test(hands) && !fbh.includes("GREYBOX poses"), 'no greybox rectangles left in the hands');
console.log('pf-art-lint: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok') + '  (tile cells ' + tiles + ', modes ' + modes.size + ')');
process.exit(bad ? 1 : 0);
