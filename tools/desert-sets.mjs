// tools/desert-sets.mjs — every desert tile set (src/redraw/desert_sets.js) as a 320x180 scene at the game's buffer size: sky (or the
// dark), far, mid, a floor of top/fill, a stepped wall of wall tiles with the set's trim course, a one-way ledge, its props. Checks
// each set has the contract's pieces at the right sizes. Two scenes a row, x2, to docs/desert-sets.png. usage: node tools/desert-sets.mjs
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const S = await import('../src/redraw/desert_sets.js');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const scenes = [];
for (const [k, bake] of Object.entries(S.SETS)) {
  const s = bake(), sz = (a, w, h) => a.every(c => c.width === w && c.height === h);
  ok(s.top.length === 3 && s.fill.length === 3 && s.wall.length === 3 && s.ledge.length === 2 && s.trim.length === 2 && sz(s.top, 16, 16) && sz(s.fill, 16, 16) && sz(s.wall, 16, 16) && sz(s.trim, 16, 16) && sz(s.ledge, 16, 6)
    && (s.sky === null || (s.sky.width === 16 && s.sky.height === 180)) && s.far.width % 64 === 0 && s.mid.width % 64 === 0, `${k}: ${s.name}: tiles, ledge, trim, sky ${s.sky ? '16x180' : '(indoors)'}, far ${s.far.width}x${s.far.height}, mid ${s.mid.width}x${s.mid.height}`);
  const c = newCanvas(320, 180), g = c.getContext('2d');
  if (s.sky) for (let x = 0; x < 320; x += 16) g.drawImage(s.sky, x, 0); else { g.fillStyle = '#08070a'; g.fillRect(0, 0, 320, 180); }
  g.drawImage(s.far, -20, 144 - s.far.height); g.drawImage(s.far, 300, 144 - s.far.height); g.drawImage(s.mid, -60, 150 - s.mid.height); g.drawImage(s.mid, 260, 150 - s.mid.height);
  for (let i = 0; i < 20; i++) { const x = i * 16; g.drawImage(s.top[i % 3], x, 144); g.drawImage(s.fill[(i + 1) % 3], x, 160); g.drawImage(s.fill[(i + 2) % 3], x, 176); }
  // a stepped wall on the right: rows of wall with the trim course across its top row
  for (let r = 0; r < 5; r++) for (let x = 13 + (r > 2 ? 2 : 0); x < 20; x++) { const y = 144 - 16 * (r + 1); g.drawImage(r === 4 || (r === 2 && x < 15) ? s.trim[(x + r) % 2] : s.wall[(x * 3 + r) % 3], x * 16, y); }
  for (let x = 13; x < 20; x++) g.drawImage(s.top[x % 3], x * 16, 144 - 96);
  for (let x = 4; x < 8; x++) g.drawImage(s.ledge[x % 2], x * 16, 104);
  let px = 20; for (const [pk, p] of Object.entries(s.props)) { const img = Array.isArray(p) ? p[0] : p; if (pk === 'face') { g.drawImage(img, 128, 96); continue; } g.drawImage(img, px, 144 - img.height); px += img.width + 24; }
  scenes.push(c);
}
const out = newCanvas(2 * 320 * 2 + 12, Math.ceil(scenes.length / 2) * (180 * 2 + 12)), og = out.getContext('2d'); og.fillStyle = '#202020'; og.fillRect(0, 0, out.width, out.height);
scenes.forEach((c, i) => og.drawImage(c, (i % 2) * (640 + 12), Math.floor(i / 2) * (360 + 12), 640, 360));
savePNG(out, process.argv[2] || new URL('../docs/desert-sets.png', import.meta.url));
console.log(bad ? `${bad} FAILED` : 'all desert sets ok'); process.exit(bad ? 1 : 0);
