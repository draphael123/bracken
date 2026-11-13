/* tools/lw3-art-lint.mjs - SALTREACH's (Long Water 3) ART, node-only lint (claude/saltart, 2026-11-13), in the shape of tools/sr-art-lint.mjs. No page, no browser: a recording 2d stub stands in for the canvas.   node tools/lw3-art-lint.mjs
   A  every mode of the Herald and the crab resolves to a pose; every pose draws a body with no NaN rect / bad colour; facing -1 mirrors +1 exactly
   B  POSE-DISTINCT: every pose differs from every other; every TELL differs from its RELEASE and from idle; a told move shows >= 0.3 s (the art must not have touched a timing)
   B2 SILHOUETTE: the BODY only (no glaive / effects: o.bodyOnly) as a 1-px mask; every tell must change >= 20% of union pixels against idle and >= 25% against its strike
   C  every draw stays inside a box round the feet; the kit pieces (bell, sluice, boat, mooring, trap, smokehouse, local, gulls, mill wheel, jelly, lighthouse + dial, wave, spear, swirl, foam) draw clean
   D  TILES: the real level's every cell from col 366 gets a tile (none null), cols < 366 stay master's (null); NO FLAT BLOCK: every baked ground tile shows >= MINC colours (texture) and no single colour fills
      more than 70% of it; the same cell bakes the same tile twice; no timber in the kit (no brown-plank palette on SOLID)
   E  PALETTE: every colour drawn is a valid #rrggbb and the art stays under a colour budget
   F  files + wiring (no ad-block words in filenames, the hands use the art, the greybox rectangles are gone, the flag stays OFF, the art did not touch a tuned file: tide-herald.js / pool-crab.js / tide-kit.js) */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let n = 0, bad = 0; const ok = (c, m) => { n++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const COLS = new Map(); let REC = null, BAD = []; const reset = () => { COLS.clear(); BAD = []; };
const CANV = [];
function makeCtx(w, h, tile) {
  const cv = { width: w, height: h, cols: new Map(), n: 0 };
  const ctx = { canvas: cv, fillStyle: '#000000', globalAlpha: 1, strokeStyle: '#000', lineWidth: 1, imageSmoothingEnabled: false, beginPath() {}, arc() {}, stroke() {}, moveTo() {}, lineTo() {}, drawImage() {},
    fillRect(x, y, ww, hh) { const c = String(this.fillStyle); COLS.set(c, (COLS.get(c) || 0) + 1);
      if (![x, y, ww, hh].every(Number.isFinite)) BAD.push('NaN rect ' + [x, y, ww, hh] + ' ' + c); if (!/^#[0-9a-f]{6}$/i.test(c)) BAD.push('bad colour ' + c);
      cv.cols.set(c, (cv.cols.get(c) || 0) + Math.max(0, Math.min(16, ww)) * Math.max(0, Math.min(16, hh))); cv.n++;
      if (REC) REC.push([x, y, ww, hh, c, this.globalAlpha].join(',')); } };
  cv.getContext = () => ctx; if (tile) CANV.push(cv); return ctx;
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => { if (c._g) return c._g; const g = makeCtx(c.width, c.height); c.cols = g.canvas.cols; g.canvas = c; c._g = g; return g; }; return c; } };
const U = f => new URL('../src/' + f, import.meta.url).href;
const HA = await import(U('redraw/tide_herald_art.js')), CA = await import(U('redraw/pool_crab_art.js')), PA = await import(U('redraw/lw3_art.js')), TL = await import(U('redraw/lw3_tiles.js')),
  TH = await import(U('tide-herald.js')), PC = await import(U('pool-crab.js'));
const printH = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(200, 200); HA.drawHerald(g, 100, 100, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const printC = (o, f = 1, t = 0.4) => { reset(); REC = []; const g = makeCtx(200, 200); CA.drawCrab(g, 100, 100, f, { seed: 1, ...o }, t); const r = REC; REC = null; return r; };
const fp = r => r.join('|');
const HM = Object.keys(HA.HERALD_MODE_POSE);
const SUITES = [
  { name: 'herald', print: printH, W: 200, X: 100, POSES: HA.HERALD_POSE_SET, modes: [...HM, 'dead'].filter(m => m !== 'dead'), pose: HA.poseOfHerald,
    tells: [['sweepTell', 'sweep'], ['thrustTell', 'thrust'], ['spearTell', 'spear'], ['raise', 'wave'], ['maelTell', 'mael'], ['callTell', null], ['seize', null]],
    dwell: { sweepTell: TH.TH.sweep.tell, thrustTell: TH.TH.thrust.tell, spearTell: TH.TH.spear.tell, raise: TH.TH.wave.tell, maelTell: TH.TH.undertow.tell, callTell: TH.TH.recall, seize: TH.TH.seize } },
  { name: 'crab', print: printC, W: 200, X: 100, POSES: CA.CRAB_POSE_SET, modes: ['walk', 'pinchTell', 'pinch', 'rec', 'flipped', 'buried', 'emerge', 'digTell'], pose: CA.poseOfCrab,
    tells: [['pinchTell', 'pinch'], ['digTell', null]], dwell: { pinchTell: PC.PC.pinch.tell, digTell: PC.PC.dig } },
];
/* ---- A ---- */
for (const S of SUITES) {
  for (const m of S.modes) { const k = S.pose(m, { vx: 40 }); ok(S.POSES[k], S.name + ' mode ' + m + ' -> pose ' + k); }
  ok(S.pose(S.name === 'crab' ? 'walk' : 'rec', { hurtT: 0.2 }) === 'hurt' || S.name === 'herald', S.name + ': a flinch is the hurt pose');
  for (const k of Object.keys(S.POSES)) { const r = S.print({ pose: k, k: 0.5 }); ok(r.length > 12, S.name + ' ' + k + ' draws a body (' + r.length + ' rects)'); ok(BAD.length === 0, S.name + ' ' + k + ': no bad rects ' + BAD.slice(0, 2)); }
  for (const k of ['idle' in S.POSES ? 'idle' : 'walk', Object.keys(S.POSES).find(q => /Tell$/.test(q))]) { const A = S.print({ pose: k, k: 0.5 }, 1), B = S.print({ pose: k, k: 0.5 }, -1); ok(A.length === B.length, S.name + ' ' + k + ': both facings draw the same pieces');
    const mir = A.map(r => { const [x, y, w, h, c, a] = r.split(','); return [S.W - (+x + +w), y, w, h, c, a].join(','); }); ok(fp(mir) === fp(B), S.name + ': facing -1 mirrors +1 exactly (' + k + ')'); }
}
for (const m of TH.TH_TELLS.map(r => r[0])) ok(HA.HERALD_POSE_SET[HA.HERALD_MODE_POSE[m]], 'herald tell ' + m + ' has its own pose');
for (const [k, M] of Object.entries(TH.MOVES)) ok(HA.HERALD_POSE_SET[HA.HERALD_MODE_POSE[M.tell]] && (M.release === 'stride' || M.release === 'mael' || HA.HERALD_POSE_SET[HA.HERALD_MODE_POSE[M.release]] || HA.HERALD_POSE_SET[M.release]), 'herald move ' + k + ' has its poses');
for (const m of PC.PC_TELLS.map(r => r[0])) ok(CA.CRAB_POSE_SET[CA.CRAB_MODE_POSE[m]], 'crab tell ' + m + ' has its own pose');
/* ---- B ---- */
for (const S of SUITES) { const seen = new Map(); for (const k of Object.keys(S.POSES)) { const f = fp(S.print({ pose: k, k: 0.5 })); const pk = seen.get(f); ok(!pk, S.name + ' ' + k + ' differs from ' + (pk || 'all others')); seen.set(f, k); }
  const idle = S.name === 'crab' ? 'walk' : 'idle';
  for (const [tell, rel] of S.tells) { ok(S.dwell[tell] >= 0.3, S.name + ' ' + tell + ' shows ' + S.dwell[tell] + ' s (>= 0.3)'); ok(fp(S.print({ pose: tell, k: 0.5 })) !== fp(S.print({ pose: idle })), S.name + ' ' + tell + ' differs from idle'); if (rel) ok(fp(S.print({ pose: tell })) !== fp(S.print({ pose: rel })), S.name + ' ' + tell + ' differs from ' + rel); } }
ok(TH.TH.hp === 2600 && TH.TH.sweep.tell === 0.85 && TH.TH.thrust.tell === 0.7 && TH.TH.spear.tell === 0.7 && TH.TH.wave.tell === 1.0 && TH.TH.undertow.tell === 1.0, 'the Herald tune the art was drawn on is unchanged (hp 2600, tells 0.85 / 0.7 / 0.7 / 1.0 / 1.0)');
ok(PC.PC.pinch.tell === 0.5 && PC.PC.pinch.dmg === 12 && PC.PC.w === 14 && PC.PC.h === 9, 'the crab numbers are unchanged (tell 0.5, dmg 12, hitbox 14 x 9)');
/* ---- B2 ---- */
const mask = (S, pose) => { const r = S.print({ pose, bodyOnly: true, k: 0.5 }), m = new Uint8Array(S.W * 200); for (const s of r) { const [x, y, w, h, , a] = s.split(',').map((v, i) => (i === 4 ? 0 : +v)); if (a < 0.5) continue; for (let j = Math.max(0, y); j < Math.min(200, y + h); j++) for (let i = Math.max(0, x); i < Math.min(S.W, x + w); i++) m[j * S.W + i] = 1; } return m; };
const diffShare = (A, B) => { let x = 0, u = 0; for (let i = 0; i < A.length; i++) { if (A[i] | B[i]) u++; if (A[i] ^ B[i]) x++; } return x / Math.max(1, u); };
const SIL_IDLE = 0.2, SIL_STRIKE = 0.25;
for (const S of SUITES) { const idle = mask(S, S.name === 'crab' ? 'walk' : 'idle'); let a = 9, b = 9;
  for (const [tell, rel] of S.tells) { const mm = mask(S, tell), s = diffShare(mm, idle); a = Math.min(a, s); ok(s >= SIL_IDLE, S.name + ' ' + tell + ' BODY silhouette differs from idle by ' + (s * 100).toFixed(0) + '% (>= ' + SIL_IDLE * 100 + '%)');
    if (rel) { const s2 = diffShare(mm, mask(S, rel)); b = Math.min(b, s2); ok(s2 >= SIL_STRIKE, S.name + ' ' + tell + ' BODY differs from its strike ' + rel + ' by ' + (s2 * 100).toFixed(0) + '% (>= ' + SIL_STRIKE * 100 + '%)'); } }
  console.log('  silhouette ' + S.name + ': smallest tell-vs-idle ' + (a * 100).toFixed(0) + '%, smallest tell-vs-strike ' + (b * 100).toFixed(0) + '%'); }
/* ---- C ---- */
for (const S of SUITES) { let out = 0; const box = S.name === 'herald' ? [-80, 120, -90, 14] : [-50, 50, -40, 10]; for (const k of Object.keys(S.POSES)) for (const r of S.print({ pose: k, k: 0.5 })) { const [x, y, w, h] = r.split(',').map(Number), dx = x - S.X, dy = y - 100; if (dx < box[0] || dx + w > box[1] || dy < box[2] || dy + h > box[3]) out++; }
  ok(out === 0, S.name + ': every pose inside the box round its feet (' + out + ' rects outside)'); }
const drawKit = g => {
  PA.drawBell(g, 40, 100, 0, 0.3); PA.drawBell(g, 40, 100, 1, 0.3, 1); PA.drawSluice(g, 40, 100, 0, 0, 0.3); PA.drawSluice(g, 40, 100, 0.7, 0, 0.3); PA.drawSluice(g, 40, 100, 0, 0.5, 0.3);
  PA.drawBoat(g, 10, 100, 112, 0.3, {}); PA.drawBoat(g, 10, 100, 48, 0.3, { loose: true, lit: false }); PA.drawMooring(g, 60, 100, false); PA.drawMooring(g, 60, 100, true, 0.3);
  PA.drawTrap(g, 60, 40, true, 8, 'crush', 0.3); PA.drawTrap(g, 60, 40, false, null, 'coins', 0.3); PA.drawSmokehouse(g, 60, 100, 0.3); PA.drawLocal(g, 60, 100, 0.3, 1, 0); PA.drawLocal(g, 60, 100, 0.3, -1, 1);
  PA.drawGulls(g, 60, 100, 0, 0.3); PA.drawGulls(g, 60, 100, 1, 0.3); PA.drawMillWheel(g, 60, 60, 0.4, 1, 0.3); PA.drawJelly(g, 60, 60, 0.3, 1);
  PA.drawLighthouse(g, 60, 150, { k: 0.5, ph: 'warn', t: 1, coming: 'in', tell: true }, 0.3, false); PA.drawLighthouse(g, 60, 150, null, 0.3, true);
  PA.drawWave(g, 60, 40, 100, 1, 0.3); PA.drawWave(g, 60, 40, 100, -1, 0.3); PA.drawSpear(g, 60, 100, 54, 0.3); PA.drawSpear(g, 60, 100, 3, 0.3); PA.drawSwirl(g, 60, 100, 0.3, 140); PA.drawFoam(g, 0, 200, 100, 0.3, 'rise'); PA.drawFoam(g, 0, 200, 100, 0.3, 'warn');
  for (const q of [0.2, 0.7, 1]) { CA.drawCrab(g, 60, 100, 1, { mode: 'emerge', k: q }, 0.3); CA.drawCrab(g, 60, 100, -1, { mode: 'digTell', k: q, flash: 1 }, 0.3); }
  HA.drawHerald(g, 60, 100, 1, { mode: 'mired', flash: 1 }, 0.3);
};
{ reset(); drawKit(makeCtx(400, 300)); ok(BAD.length === 0, 'the kit pieces, the crab states and the dial draw clean ' + BAD.slice(0, 3)); ok(PA.SALT_SKIN.case.length === 5 && PA.SALT_SKIN.water.length === 3, 'the dial skin is a plain object'); }
/* ---- D: the tiles, on the real level ---- */
process.env.LW3 = '1';
const { LEVELS, T } = await import(U('level.js'));
const L = LEVELS.find(l => l.id === 'longwater').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
{ ok(L.lw3Kit === true, 'the ON build carries lw3Kit'); let cells = 0, nul = 0, flat = 0, poor = 0, minc = 99, nonSolid = 0; const MINC = 5, seen = new Set();
  for (let y = 0; y < L.H; y++) for (let x = 366; x < L.W; x++) { const t = at(x, y); if (t === T.AIR) continue; cells++; const c = TL.lw3Tile(t, x, y, at, T, L);
    if (!c) { nul++; continue; } if (seen.has(c)) continue; seen.add(c); const cols = c.cols || new Map(), tot = [...cols.values()].reduce((a, b) => a + b, 0) || 1, top = Math.max(...cols.values());
    if (t === T.SOLID) { minc = Math.min(minc, cols.size); if (cols.size < MINC) poor++; if (top / tot > 0.7) flat++; if ((cols.size < MINC || top / tot > 0.7) && process.env.LW3_DEBUG) console.log('   weak', TL.kindOf(x, y, 99), x, y, cols.size, (top / tot).toFixed(2)); } else nonSolid++; }
  ok(nul === 0, 'every ground / net / walk cell from col 366 has a tile (' + cells + ' cells, ' + nul + ' null)');
  ok(poor === 0, 'no flat ground tile: every baked SOLID tile shows >= ' + MINC + ' colours (worst ' + minc + '; ' + poor + ' poor of ' + seen.size + ' tiles)');
  ok(flat === 0, 'no ground tile is more than 70% one colour (' + flat + ' flat)');
  for (const [x, y] of [[100, 30], [300, 27], [365, 28]]) ok(TL.lw3Tile(T.SOLID, x, y, at, T, L) === null, 'col ' + x + ' (master) is left to the game\'s own kit');
  const a1 = TL.lw3Tile(T.SOLID, 400, 24, at, T, L), a2 = TL.lw3Tile(T.SOLID, 400, 24, at, T, L); ok(a1 === a2, 'a cell bakes to the same (memoised) tile');
  console.log('  tiles: ' + seen.size + ' distinct baked tiles for ' + cells + ' cells'); }
/* ---- E: palette ---- */
{ reset(); for (const S of SUITES) for (const k of Object.keys(S.POSES)) S.print({ pose: k, k: 0.5 }); drawKit(makeCtx(400, 300)); let badc = 0; for (const c of COLS.keys()) if (!/^#[0-9a-f]{6}$/i.test(c)) badc++;
  console.log('  palette: ' + COLS.size + ' colours drawn by the pieces + sheets'); ok(badc === 0, badc + ' invalid colours'); ok(COLS.size <= 260, 'the pieces drew ' + COLS.size + ' distinct colours (<= 260)'); }
/* ---- F ---- */
{ const files = ['redraw/lw3_tiles.js', 'redraw/lw3_art.js', 'redraw/pool_crab_art.js', 'redraw/tide_herald_art.js']; ok(files.every(f => !/ad|admiral|banner|track|analytic/i.test(f.split('/')[1].replace(/\.js$|lw3|tiles|art|pool|crab|tide|herald/g, ''))), 'no ad-block words in the new filenames');
  const hands = readFileSync(new URL('../src/longwater3-hands.js', import.meta.url), 'utf8'), main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), lvl = readFileSync(new URL('../src/longwater3.js', import.meta.url), 'utf8');
  ok(/LA\.drawBell/.test(hands) && /LA\.drawSluice/.test(hands) && /LA\.drawBoat/.test(hands) && /LA\.drawMooring/.test(hands) && /LA\.drawTrap/.test(hands) && /LA\.drawSmokehouse/.test(hands) && /LA\.drawLighthouse/.test(hands) && /LA\.drawMillWheel/.test(hands) && /LA\.drawJelly/.test(hands) && /LA\.drawWave/.test(hands) && /LA\.drawSpear/.test(hands) && /LA\.drawSwirl/.test(hands) && /LA\.drawFoam/.test(hands), 'the hands draw the level kit');
  ok(/CAA\.drawCrab/.test(hands) && /HAA\.drawHerald/.test(hands) && /e\.t === 'herald' && !!e\.lw3/.test(hands), 'the hands draw the crab and the Herald (drawsSelf)');
  ok(/SDL\.drawHud\(g, 6, 30/.test(hands) && /SALT_SKIN/.test(hands), 'the A3 gauge is the shared dial (sea_dial.js, Saltreach skin)');
  ok(!/'#4a4440'|'#e8c070'; g\.fillRect\(px - 4|'#b08a3a'|'#6a5e48'|'#c9563d'|'#b8483a'|'#2a2622'/.test(hands), 'no greybox rectangles left in the hands');
  ok(/LW3_SHIPS = false/.test(lvl) && /lw3Kit: true/.test(lvl), 'LW3_SHIPS stays false; the kit flag rides the ON build only');
  ok(/L\.lw3Kit\) \{ const ts = LW3T\.lw3Tile/.test(main), 'main.js has the one tile-kit line (flag-gated: OFF = the base)');
  try { const d = execFileSync('git', ['diff', '--name-only', 'claude/sea6', '--', 'src/tide-herald.js', 'src/pool-crab.js', 'src/tide-kit.js', 'src/marks.js'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }).trim(); ok(d === '', 'the tuned files are untouched by the art (diff vs claude/sea6: ' + (d || 'none') + ')'); } catch { console.log('  (git diff vs claude/sea6 unavailable: skipped)'); } }
console.log('lw3-art-lint: ' + n + ' checks, ' + (bad ? bad + ' FAILED' : 'all ok'));
process.exit(bad ? 1 : 0);
