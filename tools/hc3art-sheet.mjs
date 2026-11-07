// tools/hc3art-sheet.mjs - HIGHCROWN 3 + THE GOBLIN PRINCESS art, rendered and linted in Node (claude/hc3art). NO browser.
//   node tools/hc3art-sheet.mjs [out.png]   -> contact sheet (default work/claude/lane-done/hc3art-sheet.png): the Princess's frames x2, her parts, the props, the battlements, the rooms.
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const GPA = await import('../src/redraw/goblin_princess_art.js');
const out = process.argv[2] || 'work/claude/lane-done/hc3art-sheet.png';
const bad = []; const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
const big = (list, o, s = 2) => { const sh = sheet(list, o), c = newCanvas(sh.width * s, sh.height * s); c.getContext('2d').drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
const P = GPA.bakeGoblinPrincess(); const sigs = P.R.map(sig);
P.R.forEach((c, i) => { if (c.width !== P.R[0].width || c.height !== P.R[0].height) bad.push('princess ' + i + ': size'); if (sigs[i].k < 250) bad.push('princess ' + i + ': barely drawn (' + sigs[i].k + ')'); });
if (P.R.length !== GPA.GP_FRAMES) bad.push('frames ' + P.R.length);
const seen = new Map(); sigs.forEach((s, i) => { if (seen.has(s.h)) bad.push('frame ' + i + ' draws the same as ' + seen.get(s.h)); else seen.set(s.h, i); });
P.white.R.forEach((c, i) => { if (sig(c).k !== sigs[i].k) bad.push('princess ' + i + ': flash silhouette differs'); });
for (const [a, b] of [['lungeTell', 'lunge'], ['flurryTell', 'flurry'], ['trinketTell', 'trinket'], ['fanTell', 'fan'], ['hopTell', 'hop'], ['tiaraTell', 'tiara'], ['stompTell', 'stomp']]) { const fa = GPA.gpFrame({ mode: a, anim: 0, vx: 0 }), fb = GPA.gpFrame({ mode: b, anim: 0, vx: 0 }); if (fa === fb) bad.push(a + ' wears the same frame as ' + b + ' (B16: windup != release)'); if (sigs[fa].h === sigs[fb].h) bad.push(a + '/' + b + ' frames draw identically'); }
for (const m of ['walk', 'recover', 'preen', 'perch', 'stand', 'hide', 'pinned', 'stunned', 'stagger', 'bolt', 'escape', 'sleep', 'tiaraWait']) { const f = GPA.gpFrame({ mode: m, anim: 0.3, vx: 80 }); if (!(f >= 0 && f < GPA.GP_FRAMES)) bad.push(m + ': frame ' + f + ' out of range'); }
const HA = await import('../src/redraw/hc3_art.js');
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g); if (!sig(c).k) bad.push('empty cell'); return c; };
const stoneFloor = (g, w, y) => { g.fillStyle = '#363949'; g.fillRect(0, y, w, 40); g.fillStyle = '#74788e'; g.fillRect(0, y, w, 1); };
const wall = (g, w, h) => { g.fillStyle = '#2a2d38'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { g.fillStyle = '#14151d'; g.fillRect(0, y + 9, w, 1); } };
const parts = [];
parts.push(['door shut / up / down', cell(150, 60, '#2a2d38', g => { HA.drawGuardDoor(g, 24, 54, 'shut'); HA.drawGuardDoor(g, 74, 54, 'up', 0.6, 0.3); HA.drawGuardDoor(g, 124, 54, 'down', 0, 0, 1); })]);
parts.push(['winch / bell / rope / hatch', cell(190, 80, '#2a2d38', g => { stoneFloor(g, 190, 70); HA.drawWinchBox(g, 18, 70, 50, 1, 2, 3, true, 0.1); HA.drawBellAt(g, 62, 4, 3, 1, 0.2); HA.drawRope(g, 100, 4, 70, 2, 0.3); HA.drawHatch(g, 138, 6, 0, 0); HA.drawHatch(g, 172, 6, 1, 0); })]);
parts.push(['murder hole loaded / spent / falling', cell(170, 90, '#2a2d38', g => { HA.drawMurderHole(g, { x: 20, y0: 10, loaded: true, chain: true, kick: { l: 40, r: 56, t: 40, b: 90 }, stone: null }, 0, 0, 0.3); HA.drawMurderHole(g, { x: 80, y0: 10, loaded: false, chain: false, stone: null }, 0, 0, 0.3); HA.drawMurderHole(g, { x: 130, y0: 10, loaded: false, chain: false, stone: { x: 130, y: 52 } }, 0, 0, 0.3); })]);
parts.push(['yard', cell(260, 50, '#1a1620', g => { stoneFloor(g, 260, 46); const oldS = HA.K.YARD; HA.K.YARD = [{ k: 'oven', col: 2, row: 46 / 16 }, { k: 'sacks', col: 7, row: 46 / 16 }, { k: 'rack', col: 10, row: 46 / 16 }, { k: 'trough', col: 14, row: 46 / 16 }]; HA.drawYard(g, 0, 0, 260, 0.2); HA.K.YARD = oldS; })]);
parts.push(['princess parts', cell(200, 50, '#2a1a3a', g => { GPA.drawGem(g, 10, 10, GPA.GPC.gem[0], 0.1, 0); GPA.drawGem(g, 24, 10, GPA.GPC.gem[1], 0.1, 1); GPA.drawTiaraFlying(g, 50, 12, 0.0, false); GPA.drawTiaraFlying(g, 70, 12, 0.05, false); GPA.drawTiaraFlying(g, 96, 12, 0.0, true); GPA.drawRipple(g, 130, 46, 0.1); GPA.drawFanGust(g, 150, 30, 1, 0.1); })]);
parts.push(['battlements walk', cell(640, 190, '#0c1226', g => { const cx = 527 * 16, cy = 22 * 16 - 150; HA.drawFar(g, cx, cy, 640, 190, 0); g.fillStyle = '#363949'; g.fillRect(0, 150, 640, 40); g.fillStyle = '#74788e'; g.fillRect(0, 150, 640, 1);
  HA.drawParapet(g, cx, cy, 640, 0); g.fillStyle = '#2a2d38'; g.fillRect((557 * 16 - cx), 0, 160, 150 - 8 * 16 + 8 * 16 - 0); HA.drawTowers(g, cx, cy, 640, 0.3);
  const T = HA.K.TOWERS[0]; HA.drawGuardDoor(g, T.door * 16 + 8 - cx, 150, 'up', 0.5, 0.2); HA.drawWinchBox(g, T.winch * 16 + 8 - cx, 150, T.door * 16 + 8 - cx, 0, 1, 3, true, 0); HA.drawBellAt(g, T.bell * 16 + 8 - cx, 150 - 50, 2, 0, 0); })]);
parts.push(['broken stretch', cell(300, 190, '#0c1226', g => { const cx = 570 * 16, cy = 22 * 16 - 150; HA.drawFar(g, cx, cy, 300, 190, 0); g.fillStyle = '#363949'; g.fillRect(0, 150, 90, 40); g.fillRect(200, 150, 100, 40); HA.drawParapet(g, cx, cy, 300, 0); HA.drawGapRubble(g, cx, cy, 0); })]);
parts.push(['bell tower top', cell(420, 130, '#0c1226', g => { const cx = 622 * 16 + 8, cy = 0; g.fillStyle = '#2a2d38'; g.fillRect(8, 32, 400, 98); HA.drawBellTowerTop(g, cx, cy, 420, 0.3); })]);
parts.push(['captains hall', cell(480, 160, '#000', g => { HA.paintRoom(g, 'royal', 0, 0, 480, 160, HA.K.CAPT, 10, 0); })]);
parts.push(['banquet hall', cell(480, 256, '#000', g => { HA.paintRoom(g, 'royal', 0, 0, 480, 256, HA.K.BANQ, 10, 0); })]);
for (const [n, c] of parts) { if (!sig(c).k) bad.push(n + ': nothing drawn'); }
const sheetItems = [...P.R.map(c => c), ...parts.map(p => p[1])];
savePNG(big(P.R, { maxW: 9 * 58 + 6, bg: '#2a1a3a', pad: 4 }, 2), out);
savePNG(sheet(parts.map(p => p[1]), { maxW: 1000, bg: '#14101c', pad: 6 }), out.replace('.png', '-world.png'));
console.log(bad.length ? 'ISSUES:\n' + bad.join('\n') : 'hc3art: all ok', '(' + P.R.length + ' frames) ->', out);
process.exit(bad.length ? 1 : 0);
