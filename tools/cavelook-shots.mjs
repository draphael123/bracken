// tools/cavelook-shots.mjs - THE SKYHOOK ARENA IN THE REAL PAGE, stills + frame time + backdrop contrast (claude/cavelook, 11-14). Not in the suite. One headless browser.
//   PORT=8660 node tools/cavelook-shots.mjs --out=DIR [--tag=new] [--perf=1]
// Jumps into the live Skyhook fight (switches ON as shipped), snaps the 320x180 buffer at x3: idle (HUD + bare), a pan across the arena, one still per boss move / lever tell,
// the backdrop's seam positions, and times sim+draw per frame. Same seed on both checkouts: run it from master and from the branch and compare.
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const arg = k => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : ''; };
const OUT = arg('out') || 'work/claude/cavelook', TAG = arg('tag') || 'x', PERF = arg('perf') !== '0';
mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 20261114 });
const RUN = `(async (perf) => {
  const lvm = await import('/src/level.js'), hlm = await import('/src/highlines.js'), BG = await import('/src/redraw/high_lines_back.js');
  const TS = 16, shots = {}, note = {}; BK.manualSimulation = true;
  const snap = (name, bare) => { const hud = BK.SET.hud; if (bare) BK.SET.hud = 'off'; BK.step(2); const c = document.createElement('canvas'); c.width = BK.view.VW * 3; c.height = BK.view.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); shots[name] = c.toDataURL('image/png'); if (bare) BK.SET.hud = hud; };
  const run = n => { for (let i = 0; i < n; i++) { BK.P.inv = 99; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
  note.keys = Object.keys(BK).filter(k => /cam|shake|zoom|view/i.test(k)).join(',');
  note.hlSwitch = !!hlm.HL_SWITCH; note.hash = (() => { const L = BK.L || {}; return L.W + 'x' + L.H; })();
  BK.setHero('knight'); BK.reset({ fresh: true }); BK.god = true; note.went = BK.bossJump.go('skyhook');
  let f = 0; for (; f < 1500 && !BK.bossActive; f++) { BK.P.inv = 99; BK.sim(1); if (f % 8 === 0) BK.step(1); }
  note.bossActive = !!BK.bossActive;
  const A = BK.L.arena; note.arena = { x0: A.x0, x1: A.x1, floor: A.floor };
  const sk = () => BK.enemies().find(e => e.t === 'skyhook' && e.alive);
  let P = BK.P; const clrk = () => { const k = BK.keys; k.left = k.right = k.up = k.down = k.jump = k.atk = false; };
  const stand = tx => { clrk(); P.x = tx * TS; P.y = A.floor; P.vx = P.vy = 0; P.ground = true; };
  /* the camera's real position, if the page tells us */
  const camNow = () => (BK.cam ? { x: BK.cam.x, y: BK.cam.y } : null);
  run(60); snap('a1-idle-hud'); snap('a2-idle-bare', true);
  note.cam = camNow();
  /* a pan across the arena (the camera is locked to its walls) */
  for (const tx of [9, 14, 20, 26, 32, 38]) { stand(tx); run(45); snap('p-' + String(tx).padStart(2, '0') + '-pan-hud'); if (tx === 9 || tx === 38) snap('p-' + tx + '-bare', true); }
  /* the fight: knight beside the west lever (the lever hook reads whoever waits there), every NEW mode of his snapped once */
  stand(11.5); const seen = new Set(), want = /^(perch|rideTell|ride|hookTell|dropTell|sweepTell|swingTell|cutTell|shoveTell|phaseTell|downed|rise|landed|climbTell)$/; let phase2 = false, n = 0;
  note.modes = [];
  for (f = 0; f < 3600 && n < 14; f++) { const s = sk(); if (!s) { run(1); continue; } if (f === 700 && !phase2) { s.hp = Math.floor(s.maxHp * 0.45); phase2 = true; }
    if (f % 600 === 599) { stand(f % 1200 === 599 ? 36.5 : 11.5); }
    const key = (s.phase || 1) + s.mode; if (want.test(s.mode) && !seen.has(key)) { seen.add(key); run(3); snap('f' + String(++n).padStart(2, '0') + '-p' + (s.phase || 1) + '-' + s.mode + '-hud'); note.modes.push(key + '@' + f + ' x' + Math.round(s.x / TS) + ' y' + Math.round(s.y / TS)); }
    run(1); }
  /* the lever tell: his tell as the lever hook marks (amber lever) - the ride mode above shows it; one more: a lever struck */
  /* floating text: a number in the arena */
  try { BK.number ? 0 : 0; } catch (e) {}
  /* THE BACKDROP ALONE, at the arena's camera and at the wrap seams: drawn straight from the module onto a canvas, with real mist/time */
  const cy = (note.cam && note.cam.y != null) ? note.cam.y : (A.floor - 120);
  const bc = document.createElement('canvas'); bc.width = 320; bc.height = 180; const bg = bc.getContext('2d'); bg.imageSmoothingEnabled = false;
  const back = (name, cx) => { bg.fillStyle = '#000'; bg.fillRect(0, 0, 320, 180); BG.drawBackdrop(bg, cx, cy, 320, 180, BK.L, 3, 0, true); const o = document.createElement('canvas'); o.width = 960; o.height = 540; const og = o.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(bc, 0, 0, 960, 540); shots[name] = o.toDataURL('image/png'); };
  const px = () => bg.getImageData(0, 0, 320, 180).data;
  const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const base = Math.round(A.x0 + 0); const stats = {};
  for (const [nm, cx] of [['c0', A.x0], ['c1', A.x0 + 96], ['c2', A.x0 + 192]]) { back('b-' + nm, cx); const d = px(); let mx = 0, sum = 0, hi = 0; const near = { rope: 0, red: 0, gold: 0, hero: 0 }; const col = (r, g, b, t) => { const q = t; return Math.abs(r - q[0]) + Math.abs(g - q[1]) + Math.abs(b - q[2]) < 90; };
    for (let i = 0; i < d.length; i += 4) { const l = lum(d[i], d[i + 1], d[i + 2]); mx = Math.max(mx, l); sum += l; if (l > 110) hi++; if (col(d[i], d[i + 1], d[i + 2], [200, 176, 136])) near.rope++; if (col(d[i], d[i + 1], d[i + 2], [255, 74, 42])) near.red++; if (col(d[i], d[i + 1], d[i + 2], [255, 211, 107])) near.gold++; if (col(d[i], d[i + 1], d[i + 2], [159, 173, 187])) near.hero++; }
    stats[nm] = { meanLum: +(sum / (d.length / 4)).toFixed(1), maxLum: Math.round(mx), pctLum110: +(hi / (d.length / 4) * 100).toFixed(2), pctNearRope: +(near.rope / 576).toFixed(2), pctNearRed: +(near.red / 576).toFixed(2), pctNearGold: +(near.gold / 576).toFixed(2) }; }
  note.backStats = stats;
  /* seam: find cx where the 0.3 layer wraps (640/0.3) and where the 0.55 layer wraps (640/0.55), draw either side; compare column difference across the seam */
  const seamRows = [];
  for (const [lab, per] of [['far0.3', 640 / 0.3], ['near0.55', 640 / 0.55]]) { for (const k of [1, 2]) { const c0 = Math.round(per * k); for (const dx of [-2, -1, 0, 1, 2]) { back('s-' + lab + '-' + k + '-' + (dx < 0 ? 'm' + -dx : 'p' + dx), c0 + dx); } } }
  /* seam metric: for every cx in a 2400 window, the sum of column-to-column luminance jump at the layer's seam column (screen x where tile edge lands) vs the median jump */
  const jumps = [];
  for (let cx = 0; cx < 2400; cx += 7) { bg.fillStyle = '#000'; bg.fillRect(0, 0, 320, 180); BG.drawBackdrop(bg, cx, cy, 320, 180, BK.L, 3, 0, false); const d = px(); let worst = 0, wx = -1; for (let x = 1; x < 320; x++) { let s = 0; for (let y = 0; y < 180; y++) { const a = (y * 320 + x) * 4, b = a - 4; s += Math.abs(lum(d[a], d[a + 1], d[a + 2]) - lum(d[b], d[b + 1], d[b + 2])); } if (s > worst) { worst = s; wx = x; } } jumps.push([cx, Math.round(worst), wx]); }
  const ws = jumps.map(j => j[1]).sort((a, b) => a - b); note.seam = { medianWorstColJump: ws[ws.length >> 1], maxWorstColJump: ws[ws.length - 1], top3: jumps.slice().sort((a, b) => b[1] - a[1]).slice(0, 3) };
  /* the bakes' own wrap seam: the column jump across the tile edge (col w-1 -> col 0) against the median column-to-column jump inside the tile */
  note.bake = {}; for (const [nm, fn] of [['station', BG.bakeStation], ['stationNear', BG.bakeStationNear]]) { if (!fn) continue; const c = fn(), w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data, jmp = (x0, x1) => { let s = 0; for (let y = 0; y < h; y++) { const p = (y * w + x0) * 4, q = (y * w + x1) * 4; s += Math.abs(lum(d[p], d[p + 1], d[p + 2]) - lum(d[q], d[q + 1], d[q + 2])); } return s; }; const js = []; for (let x = 0; x < w - 1; x++) js.push(jmp(x, x + 1)); js.sort((p, q) => p - q); note.bake[nm] = { w, h, seamJump: Math.round(jmp(w - 1, 0)), medianJump: Math.round(js[js.length >> 1]), p99Jump: Math.round(js[Math.floor(js.length * 0.99)]), maxJump: Math.round(js[js.length - 1]) }; }
  /* a shake in the arena: three frames of the real camera shake */
  BK.shakeCam(10); for (let i = 0; i < 3; i++) { BK.P.inv = 99; BK.sim(1); BK.step(1); snap('k' + (i + 1) + '-shake-hud'); }
  /* frame time in the arena: hero mid-floor, fight live, 360 frames sim+draw */
  if (perf) { const res = {}; for (const rep of [1, 2]) { stand(24); BK.SET.hud = 'minimal'; run(30); const ts = []; for (let i = 0; i < 360; i++) { const t = performance.now(); BK.P.inv = 99; BK.sim(1); BK.step(1); ts.push(performance.now() - t); } ts.sort((a, b) => a - b); res['r' + rep] = { p50: +ts[180].toFixed(2), p95: +ts[342].toFixed(2), max: +ts[359].toFixed(2) }; } note.perf = res; }
  /* THE REST OF THE LEVEL: the level hash and stills at other sections (each fresh, intro run out, foes cleared) - the same on master and the branch except where the cave backdrop fades in */
  { const idx = lvm.LEVELS.findIndex(l => l.id === 'highlines'), LAND = hlm.HL_DATA_SW.landings;
    const hash = () => { const L = BK.L; let h = 2166136261 >>> 0; const mix = q => { for (let i = 0; i < q.length; i++) { h ^= q.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } }; for (let i = 0; i < L.grid.length; i++) { h ^= L.grid[i]; h = Math.imul(h, 16777619) >>> 0; } mix(JSON.stringify([L.ents, L.landings, L.nets, L.checkpoints, L.secrets, L.exit, L.winch, L.points, L.lever, L.hopper, L.sections, L.unlocks, L.START, L.W, L.H, L.arena])); return (h >>> 0).toString(16); };
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.god = true; P = BK.P; BK.sim(5); run(330); for (const e of BK.enemies()) e.alive = false; note.levelHash = hash();
    for (const [nm, tx, li] of [['q1-yard-L2', 63, 2], ['q2-pylon-L12', 34, 12], ['q3-exam-L27', 74, 27], ['q4-cavemouth-L29', 5, 29]]) { clrk(); P.lk = null; P.x = tx * TS; P.y = LAND[li][1] * TS; P.vx = P.vy = 0; P.ground = true; run(40); snap(nm); } }
  return { shots, note }; })(${PERF})`;
let r;
try { r = await pg.evalp(RUN, 900000); } catch (e) { console.log('FAIL', String(e)); await pg.close(); process.exit(2); }
for (const [n, u] of Object.entries(r.shots)) writeFileSync(join(OUT, TAG + '-' + n + '.png'), Buffer.from(u.split(',')[1], 'base64'));
console.log(JSON.stringify(r.note, null, 1));
console.log('stills: ' + Object.keys(r.shots).length + '  console errors: ' + JSON.stringify(pg.errors));
writeFileSync(join(OUT, TAG + '-note.json'), JSON.stringify({ note: r.note, errors: pg.errors }, null, 1));
await pg.close(); process.exit(pg.errors.length ? 1 : 0);
