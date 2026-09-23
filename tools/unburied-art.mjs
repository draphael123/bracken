// tools/unburied-art.mjs — THE UNBURIED FIELD's four creatures rendered in Node (src/unburied-foes.js), so their
// silhouettes can be looked at without a browser: docs/unburied-foes.png at 3x, one row per creature, every frame.
// Node renders are honest about construction and not about light (docs/AGENT-HANDOFF.md): play it as well.
// usage: node tools/unburied-art.mjs
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeAll } = await import('../src/unburied-foes.js');
const A = bakeAll(), scale = 3, rows = [];
for (const [k, S] of Object.entries(A)) {
  const bad = S.R.filter(c => c.width !== S.R[0].width || c.height !== S.R[0].height);
  console.log(k.padEnd(16), JSON.stringify({ frames: S.R.length, size: S.R[0].width + 'x' + S.R[0].height, ax: S.ax, ay: S.ay, box: S.w + 'x' + S.h, ragged: bad.length }));
  if (bad.length) { console.log('FAIL: ' + k + ' frames are not one size'); process.exit(1); }
  rows.push(sheet(S.R, { maxW: S.R.length * (S.R[0].width + 6) + 6, bg: '#4a3a3e', pad: 6 }));
}
const W = Math.max(...rows.map(r => r.width)), H = rows.reduce((s, r) => s + r.height, 0);
const out = newCanvas(W * scale, H * scale), g = out.getContext('2d'); g.fillStyle = '#4a3a3e'; g.fillRect(0, 0, out.width, out.height);
let y = 0; for (const r of rows) { g.drawImage(r, 0, 0, r.width, r.height, 0, y * scale, r.width * scale, r.height * scale); y += r.height; }
savePNG(out, new URL('../docs/unburied-foes.png', import.meta.url));
console.log('docs/unburied-foes.png written');
