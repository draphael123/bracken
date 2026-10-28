// tools/ft3art-shots.mjs - FALLING TOWER 3 ART (claude/fallingtower3art): the chase rooms, the cracked pillars, his fall poses, the ladder and the core, rendered in
// NODE (tools/node-canvas.mjs, no browser) into work/ft3art/. Node renders are honest about construction and not about light: the page captures are the judge.
// usage: node tools/ft3art-shots.mjs [rooms|pillars|mage|all]      Not in the suite: pictures are for eyes.
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { ROOT } from './cdp.mjs';
install();
const FTW = await import('../src/redraw/fallen_tower.js'), CH = await import('../src/archmage-chase.js'), SUPm = await import('../src/tower-supports.js');
const out = join(ROOT, 'work/ft3art'); mkdirSync(out, { recursive: true });
const want = process.argv[2] || 'all', on = k => want === 'all' || want === k;
const big = (c, s) => { const b = newCanvas(c.width * s, c.height * s); b.getContext('2d').drawImage(c, 0, 0, c.width * s, c.height * s); return b; };
const skins = FTW.bakeFallenSkins(), ledge = FTW.bakeSlateLedge();
/* one room as the game shows it: the wall (dressed), then the footing over it: the two floor rows and the ledges */
function room(k, time = 0) {
  const R = k < CH.ROOMS.length ? CH.roomOf(k) : null, kind = R ? R.kind : 'dome', top = R ? R.top : CH.CORE.top, rows = R ? R.floor - R.top : CH.CORE.bot - CH.CORE.top;
  const w = (CH.CH.x1 - CH.CH.x0 + 1) * 16, h = rows * 16 + (R ? 32 : 0), c = newCanvas(w, h), g = c.getContext('2d');
  FTW.paintFallenRoom(g, kind, 0, 0, w, rows * 16, CH.CH.x0, top, time, null);
  const tile = (img, tx, ty) => g.drawImage(img, tx * 16, ty * 16);
  if (R) { for (let tx = 0; tx < 26; tx++) for (let ty = 0; ty < 2; ty++) tile(skins.fallen[(tx + ty) % 3], tx, rows + ty);
    for (const [x0, len, up] of R.ledges) for (let i = 0; i < len; i++) tile(ledge.ledge[i === 0 ? 0 : i === len - 1 ? 2 : 1], x0 - CH.CH.x0 + i, rows - up); }
  else for (let tx = 0; tx < 26; tx++) tile(skins.fallen[tx % 3], tx, rows - 1);
  return c;
}
if (on('rooms')) { for (let k = 0; k <= CH.ROOMS.length; k++) savePNG(big(room(k), 2), join(out, 'room-' + (k < CH.ROOMS.length ? CH.ROOMS[k].name.replace(/THE /, '').toLowerCase() : 'core') + '.png')); }
if (on('pillars')) { const m = await import('../src/redraw/tower_chase.js').catch(() => null); if (m && m.pillarSheet) savePNG(m.pillarSheet(newCanvas, SUPm.SUP), join(out, 'pillars.png')); }
if (on('mage')) { const m = await import('../src/redraw/lich.js'); const B = m.bakeUndeadMage(), F = m.UNDEADMAGE_F; savePNG(big(sheet([F.recoil, F.fall, F.crash, F.open, F.sunk].filter(v => v !== undefined).map(i => B.R[i]), { maxW: 600, bg: '#3a3a4a' }), 3), join(out, 'mage.png')); }
console.log('work/ft3art written');
