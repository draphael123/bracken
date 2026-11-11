// tools/silk-art-draw.mjs (claude/silkart; node only): THE SILK UNDERCROFT's art draws. Every SOLID / ONEWAY / BOUNCER cell of the built level gets a tile (no magenta fallback), the
// sticky-wall and bridge cells get their own, the skins have the spider's 6 frames, the lurker draws in every mode, THE CRYPT MOTHER in every POSE (and flashed, left and right).
//   node tools/silk-art-draw.mjs
globalThis.__SK = true;
const { install, newCanvas } = await import('./node-canvas.mjs'); install();
const { LEVELS, T } = await import('../src/level.js');
const ART = await import('../src/redraw/silk_art.js'), CMA = await import('../src/redraw/crypt_mother_art.js');
const { POSE } = await import('../src/crypt-mother-hands.js');
let bad = 0; const ok = (c, m) => { if (!c) bad++; console.log((c ? 'ok   ' : 'FAIL ') + m); };
const L = LEVELS.find(l => l.id === 'silk').build(), W = L.W, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x]);
let n = 0, miss = 0, walls = 0, bridges = 0; const seen = new Set();
for (let y = 0; y < L.H; y++) for (let x = 0; x < W; x++) { const t = at(x, y); if (t !== T.SOLID && t !== T.ONEWAY && t !== T.BOUNCER) continue; n++; const c = ART.silkTile(t, x, y, at, T, L); if (!c) miss++; else seen.add(c); }
ok(n > 3000 && !miss, 'every solid / strand / taut-web cell has a tile: ' + n + ' cells, ' + miss + ' missing, ' + seen.size + ' distinct tiles baked');
for (const w of L.sk.walls) { const c = ART.silkTile(T.SOLID, w.x, w.y0, at, T, L); if (c) walls++; } ok(walls === L.sk.walls.length, 'sticky wall cells (SOLID only while whole) take the wall tile: ' + walls);
for (const a of L.sk.anchors) if (a.kind === 'bridge') { for (const [x, y] of a.hold.concat(a.ramp)) { if (ART.silkTile(T.ONEWAY, x, y, at, T, L)) bridges++; } ok(bridges === a.hold.length + a.ramp.length, 'the bridge (held and cut) cells take the bridge tile: ' + bridges); }
ok(ART.silkTile(T.SOLID, 5, 5, at, T, { ...L, silk: false }) === null, 'not the silk level: no tile');
const sk = ART.bakeSilkSkins(); ok(sk.skling.R.length === 6 && sk.skspitter.R.length === 6 && sk.skling.L.length === 6 && sk.skling.white.R.length === 6 && sk.skling.ax === 7 && sk.skling.ay === 9, 'spiderling + spitter: the spider\'s 6 frames, R / L / white, anchor (7, 9)');
const lit = c => { const d = c._d; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k; };
for (const m of ['hide', 'threadTell', 'drop', 'ground', 'biteTell', 'climb', 'fallen']) { const c = newCanvas(44, 44); ART.drawLurker(c.getContext('2d'), 22, 34, m, -1, 0.3, true); ok(lit(c) > 25, 'lurker ' + m + ' draws (' + lit(c) + ' px)'); }
const px = {}; for (const k of Object.keys(POSE)) { const c = newCanvas(120, 90); CMA.drawMother(c.getContext('2d'), 60, 50, POSE[k], k.length & 1 ? 1 : -1, 0.4); px[k] = lit(c); ok(px[k] > 300, 'Mother ' + k + ' draws (' + px[k] + ' px)'); }
{ const set = new Set(); for (const k of Object.keys(POSE)) { const c = newCanvas(120, 90); CMA.drawMother(c.getContext('2d'), 60, 50, POSE[k], 1, 0.4); set.add(Buffer.from(c._d).toString('base64')); } ok(set.size === Object.keys(POSE).length, 'every mode wears its own pose: ' + set.size + ' distinct of ' + Object.keys(POSE).length); }
{ const c = newCanvas(120, 90); CMA.drawMother(c.getContext('2d'), 60, 50, POSE.hang, 1, 0.4, { flash: true }); ok(lit(c) > 300, 'the hit flash draws'); }
{ const c = newCanvas(300, 200), g = c.getContext('2d'); ART.drawBackdrop(g, 400, 100, 300, 200, 1, L.sk); ART.drawSac(g, 20, 50, 'whole', 0.9, 0.1); ART.drawGoo(g, 10, 80, 40, 0.2); ART.drawGlob(g, 50, 50, 100, 20); ART.drawWallBurn(g, 100, 20, 48, 0.5, 0.3); ART.webShimmer(g, 0, 100, 64, 0.5); ART.drawSconce(g, 150, 100, 0.1); ART.drawTorch(g, 160, 100, 0.1, true); ART.drawCocoon(g, 170, 20); ART.drawCocoonSplat(g, 180, 100); ART.drawKnot(g, 60, 60, false, 0.2); ART.drawThread(g, 5, 0, 50, true, 0.1); ok(lit(c) > 3000, 'backdrop + props draw'); }
console.log(bad ? 'FAILED' : 'all ok'); process.exitCode = bad ? 1 : 0;
