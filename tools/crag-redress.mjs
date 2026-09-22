// tools/crag-redress.mjs — the crag redress (src/redraw/crag_redress.js) as three 320x180 scenes, one per level, laid the way the game
// lays tiles (resolveTiles: a solid with air over it takes top[eL eR]; an open side takes edge; the rest fill), with the backdrops,
// a slab ledge, a mud pool and the dressing. Checks the pieces' shapes against the game's own sets. usage: node tools/crag-redress.mjs
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const C = await import('../src/redraw/crag_redress.js');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const MAP = [                                   // 20 x 11, '#' rock, '=' slab ledge, '~' mud, '.' air; the playfield's bottom rows
  '....................', '....................', '....................', '....................', '.............###....',
  '...====......######.', '..........#########.', '###.......##########', '####~~~~############', '####################', '####################'];
const scenes = [];
for (const th of ['scree', 'hanging', 'storm']) {
  const G = C.bakeCragGround(th), sky = C.bakeCragSky(th, 180), far = C.bakeCragFar(th), mid = C.bakeCragMid(th), near = C.bakeCragNear(th), P = C.bakeCragProps(th);
  const sz = (a, w, h) => a.every(c => c.width === w && c.height === h);
  ok(['00', '01', '10', '11'].every(k => G.top[k].length === 4 && sz(G.top[k], 16, 16)) && ['01', '10', '11'].every(k => G.edge[k].length === 2) && G.fill.length === 4 && G.silt.length === 3 && G.wet.length === 3 && G.ledge.length === 3 && G.ledgeL && G.ledgeR
    && far.width === 320 && far.height === 90 && mid.width === 480 && mid.height === 140 && near.width === 640 && near.height === 300 && sky.height === 180,
    `${th}: the game's SET2 ground shape, sky 16x180, far 320x90, mid 480x140, near 640x300`);
  const c = newCanvas(320, 180), g = c.getContext('2d');
  for (let x = 0; x < 320; x += 16) g.drawImage(sky, x, 0);
  g.drawImage(far, -30, 40); g.drawImage(far, 290, 40); g.drawImage(mid, -80, 50); g.drawImage(near, -140, -110);
  const at = (x, y) => (x < 0 || x >= 20) ? '#' : (y < 0 ? '.' : MAP[y][x]); let r = 1;
  for (let y = 0; y < 11; y++) for (let x = 0; x < 20; x++) { const t = at(x, y), X = x * 16, Y = y * 16 + 4; r = (r * 37 + x * 7 + y * 13) % 97;
    if (t === '#') { const up = at(x, y - 1), eL = at(x - 1, y) === '.' ? 1 : 0, eR = at(x + 1, y) === '.' ? 1 : 0;
      g.drawImage(up !== '#' && up !== '~' ? G.top[eL + '' + eR][r % 4] : (eL || eR) ? G.edge[eL + '' + eR][r % 2] : G.fill[r % 4], X, Y); }
    else if (t === '~') g.drawImage(G.wet[r % 3], X, Y);
    else if (t === '=') g.drawImage(at(x - 1, y) !== '=' ? G.ledgeL : at(x + 1, y) !== '=' ? G.ledgeR : G.ledge[r % 3], X, Y); }
  const on = (img, x, row) => g.drawImage(img, x, row * 16 + 4 - img.height);
  on(P.pine, 18, 7); on(P.tuft, 40, 7); on(P.boulder, 170, 6); on(P.flowers, 196, 6); on(P.cairn, 230, 4); on(th === 'storm' ? P.thorn : P.tuft, 262, 4); on(P.post, 300, 5); on(P.tuft, 118, 9); on(P.flowers, 150, 6);
  scenes.push(c);
}
const out = newCanvas(640 + 0, 3 * 360 + 16), og = out.getContext('2d'); og.fillStyle = '#111'; og.fillRect(0, 0, out.width, out.height);
scenes.forEach((s, i) => og.drawImage(s, 0, i * 368, 640, 360));
savePNG(out, new URL('../docs/crag-redress.png', import.meta.url));
console.log(bad ? `${bad} FAILED` : 'crag redress ok'); process.exit(bad ? 1 : 0);
