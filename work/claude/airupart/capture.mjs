// work/claude/airupart/capture.mjs <out.png> [key=airUp] [skin]  - a grid of every hero's pose frames (7 heroes x frames) at 4x, in the real baked sets.
// (the knight's baker uses rotate, which node-canvas refuses, so this runs in the page.)  usage: node work/claude/airupart/capture.mjs after.png
import { openPage } from '../../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const [out = 'grid.png', key = 'airUp', skin0 = ''] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{
    const skin = ${JSON.stringify(skin0)} || BKT.skinIds()[0], Z = 4, heroes = ['knight','warden','pyro','paladin','pirate','reaper','geomancer'];
    const sets = heroes.map(h => BKT.heroSet(skin, BKT.PROG.sword, false, h).R[${JSON.stringify(key)}]);
    const cw = Math.max(...sets.flat().map(c => c.width)), ch = Math.max(...sets.flat().map(c => c.height)), cols = Math.max(...sets.map(s => s.length));
    const cv = document.createElement('canvas'); cv.width = cols * (cw * Z + 8); cv.height = heroes.length * (ch * Z + 8);
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2b3550'; g.fillRect(0, 0, cv.width, cv.height);
    sets.forEach((fr, r) => fr.forEach((c, i) => { const x = i * (cw * Z + 8), y = r * (ch * Z + 8); g.fillStyle = '#39456a'; g.fillRect(x, y, cw * Z, ch * Z);
      g.fillStyle = '#4a5a30'; g.fillRect(x, y + (c.feet + 1) * Z, cw * Z, 2); g.drawImage(c, x, y, c.width * Z, c.height * Z); }));
    return cv.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', out);
} finally { pg.close(); }
