// tools/abbot-art.mjs - THE FALSE ABBOT's chapel art (claude/abbotart), rendered and linted in Node. No browser.
//   MON3=1 is set here. node tools/abbot-art.mjs [out-prefix] -> <prefix>-poses.png, -westfront.png, -chapel.png, -chapel-fallen.png, -fx.png
process.env.MON3 = '1';
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeFalseAbbot } = await import('../src/redraw/false_abbot.js');
const { bakeGoblinPriest } = await import('../src/redraw/monastery.js');
const bad = []; let n = 0; const out = process.argv[2];
const big = (c, s = 2) => { const o = newCanvas(c.width * s, c.height * s), g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width * s, c.height * s); return o; };
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
/* 1. the poses: 23 frames unchanged with the flag off, 27 with it; the four new ones are their own drawings */
const S0 = bakeFalseAbbot(), S = bakeFalseAbbot(true); n++;
if (S0.R.length !== 23) bad.push('flag off: ' + S0.R.length + ' frames, not 23');
if (S.R.length !== 27) bad.push('flag on: ' + S.R.length + ' frames, not 27');
for (let i = 0; i < 23; i++) { n++; if (sig(S.R[i]).h !== sig(S0.R[i]).h) bad.push('frame ' + i + ' changed by the m3 bake'); }
const seen = new Set(); for (let i = 23; i < 27; i++) { n++; const k = sig(S.R[i]); if (k.k < 400) bad.push('pose ' + i + ' barely drawn'); for (let j = 0; j < 23; j++) if (sig(S.R[j]).h === k.h) bad.push('pose ' + i + ' == frame ' + j); if (seen.has(k.h)) bad.push('pose ' + i + ' repeats'); seen.add(k.h);
  if (sig(S.white.R[i]).k !== k.k) bad.push('pose ' + i + ': flash silhouette differs'); if (S.R[i].width !== 80 || S.R[i].height !== 66) bad.push('pose ' + i + ': size'); }
if (out) savePNG(big(sheet([S.R[3], S.R[4], S.R[14], S.R[15], S.R[10], ...S.R.slice(23)], { maxW: 560, bg: '#6a5a44', pad: 4 }), 2), out + '-poses.png');
/* 2. the building, on the real level: tiles as flat stone / boards, then the art's two passes over them */
const { LEVELS, T } = await import('../src/level.js');
const AC = await import('../src/redraw/abbot_chapel_art.js');
const L = LEVELS.find(l => l.id === 'spire').build(), house = L.arena && L.arena.house, A = house && house.art, TS = 16;
if (!A) bad.push('no house.art'); else {
  const at = (x, y) => L.grid[y * L.W + x];
  const chk = (c, m) => { n++; if (!c) bad.push(m); };
  chk(A.corbels.length >= 8 && A.corbels.every(([x0, x1, y0]) => at(x0, y0) === T.SOLID && at(x1, y0) === T.SOLID), 'every corbel stands on solid tiles');
  chk(A.pews.every(([x, r]) => at(x, r) === T.ONEWAY && at(x + 2, r) === T.ONEWAY), 'the pews stand on their board steps');
  chk(at(A.altar[0], A.altar[1]) === T.SOLID && at(A.altar[0], A.altar[1] - 1) === T.AIR, 'the altar stands on the chapel floor');
  chk(A.piers.every(([x0, x1]) => at(x0, A.piersY[0]) === T.ONEWAY && at(x1, A.piersY[0]) === T.ONEWAY), "the piers hold the rood's boards");
  chk(at(A.rood[0], A.rood[2]) === T.ONEWAY && at(A.rood[1], A.rood[2]) === T.ONEWAY, 'the rood is laid');
  chk(A.hole[0] === house.collapse.hole[0] && A.hole[2] === house.collapse.hole[2] && JSON.stringify(A.rubble) === JSON.stringify(house.collapse.rubble), "the art's hole and rubble are the collapse's");
  chk(at(A.sill[0], A.sill[2]) === T.SOLID && at(A.sill[1], A.sill[2]) === T.SOLID, 'the sill is stone');
  chk(A.lancets.every(([tx, r, h]) => !A.corbels.some(([x0, x1, y]) => tx >= x0 - 1 && tx <= x1 + 1 && y + 2 > r && y < r + h) && !A.courses.some(c => c > r - 0.2 && c < r + h)), 'no lancet runs into a corbel or a string-course');
  const scene = (c0, c1, r0, r1, fallen, sc, label) => { const W = (c1 - c0 + 1) * TS, H = (r1 - r0 + 1) * TS, cv = newCanvas(W, H), g = cv.getContext('2d');
    g.fillStyle = '#8aa0c0'; g.fillRect(0, 0, W, H);
    const grid = L.grid.slice(), set = (x, y, t) => { grid[y * L.W + x] = t; };
    if (fallen) { for (let x = house.collapse.hole[0]; x <= house.collapse.hole[1]; x++) set(x, house.collapse.hole[2], T.AIR); for (const [a, b, y] of house.collapse.rubble) for (let x = a; x <= b; x++) set(x, y, T.ONEWAY); }
    g.fillStyle = '#2a2218'; g.fillRect((49 - c0) * TS, (5 - r0) * TS, 45 * TS, 25 * TS);   /* the interiors' dark (monastery.js draws the real monkTower / monkChapel) */
    g.fillStyle = '#3c342e'; g.fillRect((49 - c0) * TS, (20 - r0) * TS, 45 * TS, 10 * TS);
    const tile = (x, y) => grid[y * L.W + x];
    AC.drawBack(g, house, c0 * TS, r0 * TS, W, H, 0.4);
    for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) { const t = tile(x, y), X = (x - c0) * TS, Y = (y - r0) * TS;
      if (t === T.SOLID) { g.fillStyle = '#7a6e5a'; g.fillRect(X, Y, TS, TS); g.fillStyle = '#968a72'; g.fillRect(X, Y, TS, 1); g.fillStyle = '#4a4238'; g.fillRect(X + TS - 1, Y, 1, TS); g.fillRect(X, Y + TS - 1, TS, 1); }
      else if (t === T.ONEWAY) { g.fillStyle = '#8a6640'; g.fillRect(X, Y, TS, 4); g.fillStyle = '#b08a5c'; g.fillRect(X, Y, TS, 1); g.fillStyle = '#2e1e12'; g.fillRect(X, Y + 3, TS, 1); }
      else if (t === T.NET) { g.fillStyle = '#c8b088'; g.fillRect(X + 7, Y, 2, TS); } }
    AC.drawFront(g, house, c0 * TS, r0 * TS, W, H, 0.4, fallen);
    const Sx = bakeFalseAbbot(true), fr = Sx.R[fallen ? 24 : 16]; g.drawImage(fr, 74 * TS - c0 * TS - Sx.ax, 30 * TS - r0 * TS - fr.height);   /* him, for scale */
    for (const x of [51, 89]) { g.fillStyle = '#6a4a1e'; g.fillRect(x * TS - c0 * TS - 7, (30 - r0) * TS - 11, 15, 2); g.fillRect(x * TS - c0 * TS - 6, (30 - r0) * TS - 9, 13, 7); }   /* the cold braziers' bowls (main.js draws the real ones) */
    const d = cv.getContext('2d').getImageData(0, 0, W, H).data, colours = new Set(); for (let i = 0; i < d.length; i += 4) colours.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]);
    chk(colours.size > 40, label + ': painted (' + colours.size + ' colours)');
    return big(cv, sc); };
  const west = scene(14, 50, 3, 32, false, 2, 'west front'), chapel = scene(47, 96, 2, 32, false, 2, 'chapel'), gone = scene(47, 96, 2, 32, true, 2, 'chapel, floor gone');
  const fx = newCanvas(300, 90), fg = fx.getContext('2d'); fg.fillStyle = '#3c342e'; fg.fillRect(0, 0, 300, 90); fg.fillStyle = '#8a6640'; fg.fillRect(0, 70, 300, 4);
  AC.pealRing(fg, 60, 70, 1, 0.3); AC.pealRing(fg, 140, 70, -1, 0.3); for (const [x, k] of [[190, 0.1], [225, 0.5], [265, 1]]) { fg.fillStyle = '#6a4a1e'; fg.fillRect(x - 7, 59, 15, 2); fg.fillRect(x - 6, 61, 13, 7); AC.kindleFlare(fg, x, 70, k, 0.3); }
  chk(true, 'fx drawn');
  if (out) { savePNG(west, out + '-westfront.png'); savePNG(chapel, out + '-chapel.png'); savePNG(gone, out + '-chapel-fallen.png'); savePNG(big(fx, 3), out + '-fx.png'); }
}
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
