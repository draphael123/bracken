// tools/redress2.mjs — the second redress (src/redraw/redress2.js) as a 320x180 scene per theme: sky (or the dark), far, mid, near, ground
// laid the way resolveTiles lays it, a ledge, the dressing. Checks the pieces against the game's sizes. usage: node tools/redress2.mjs
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const R = await import('../src/redraw/redress2.js');
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const MAP = ['....................', '....................', '....................', '....................', '....................',
  '...====.............', '.............######.', '###.......##########', '####################', '####################', '####################'];
const scenes = [], names = ['castle', 'undercrown', 'mage', 'monastery', 'shopWood', 'shopCrag', 'shopSea'];
for (const th of names) {
  const G = R.bakeRedressGround(th), sky = R.bakeRedressSky(th, 180), far = R.bakeRedressFar(th), mid = R.bakeRedressMid(th), near = R.bakeRedressNear(th), P = R.bakeRedressProps(th);
  ok(far.width === 320 && (far.height === 90 || far.height === 180) && mid.width === 480 && mid.height === 140 && near.width === 640 && near.height === 300 && (!sky || sky.height === 180)
    && (!G || (['00', '01', '10', '11'].every(k => G.top[k].length === 4) && G.fill.length === 4 && G.ledge.length === 3 && G.ledgeL && G.ledgeR)), `${th}: far ${far.width}x${far.height}, mid 480x140, near 640x300, sky ${sky ? '16x180' : 'none (indoors)'}, ground ${G ? 'SET2' : "the level's own"}`);
  const c = newCanvas(320, 180), g = c.getContext('2d'); g.fillStyle = '#0c0a10'; g.fillRect(0, 0, 320, 180);
  if (sky) for (let x = 0; x < 320; x += 16) g.drawImage(sky, x, 0);
  g.drawImage(far, 0, far.height === 180 ? 0 : 50); g.drawImage(mid, -60, 40); g.drawImage(near, -100, -120);
  const at = (x, y) => (x < 0 || x >= 20) ? '#' : (y < 0 ? '.' : MAP[y][x]); let r = 1;
  const Gd = G || R.bakeRedressGround('castle');                                             /* the mage and the monastery keep their own tiles: shown on castle stone for the scene */
  if (G) for (let y = 0; y < 11; y++) for (let x = 0; x < 20; x++) { const t = at(x, y), X = x * 16, Y = y * 16 + 4; r = (r * 37 + x * 7 + y * 13) % 97;
    if (t === '#') { const up = at(x, y - 1), eL = at(x - 1, y) === '.' ? 1 : 0, eR = at(x + 1, y) === '.' ? 1 : 0; g.drawImage(up !== '#' ? Gd.top[eL + '' + eR][r % 4] : (eL || eR) ? Gd.edge[eL + '' + eR][r % 2] : Gd.fill[r % 4], X, Y); }
    else if (t === '=') g.drawImage(at(x - 1, y) !== '=' ? Gd.ledgeL : at(x + 1, y) !== '=' ? Gd.ledgeR : Gd.ledge[r % 3], X, Y); }
  else { g.fillStyle = '#00000055'; g.fillRect(0, 124, 320, 56); }
  const props = Object.values(P); props.forEach((img, i) => g.drawImage(img, 60 + i * 40, 7 * 16 + 4 - img.height));
  scenes.push([th, c]);
}
const out = newCanvas(2 * 640 + 8, Math.ceil(scenes.length / 2) * 368), og = out.getContext('2d'); og.fillStyle = '#111'; og.fillRect(0, 0, out.width, out.height);
scenes.forEach(([, s], i) => og.drawImage(s, (i % 2) * 648, Math.floor(i / 2) * 368, 640, 360));
savePNG(out, new URL('../docs/redress2.png', import.meta.url));
console.log(bad ? `${bad} FAILED` : 'redress 2 ok'); process.exit(bad ? 1 : 0);
