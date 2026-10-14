// tools/pyramidart-cast-sheet.mjs - THE SEALED PYRAMID's cast, every frame, on one sheet (claude/pyramidart): `PORT=8872 node tools/spart-cast-sheet.mjs [key ...]` -> work/claude/shots/pyramidart/cast-<key>.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots/pyramidart'); mkdirSync(out, { recursive: true });
const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['tombskel', 'mummy'];
const K = +(process.env.K || 5);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const CAST = await import('/src/redraw/sealed_pyramid_cast.js'), MOM = await import('/src/redraw/sealed_pyramid_mother.js'); const mo = MOM.bakeMother();
    const sets = { mummy: CAST.bakeMummy(), mummywarden: CAST.bakeMummy('warden'), dartblower: CAST.bakeDartBlower(), jackal: CAST.bakeJackal(), scarab: CAST.bakeScarab(), mother: { R: MOM.POSE_NAMES.map(n => mo[n]), names: MOM.POSE_NAMES }, tombskel: CAST.bakeSkeleton() };
    const res = {}; for (const key of ${JSON.stringify(keys)}) { const s = sets[key], fr = s.R; const cw = fr[0].width, ch = fr[0].height, cols = Math.min(key === 'mother' ? 4 : 8, fr.length), rows = Math.ceil(fr.length / cols), k = key === 'mother' ? Math.max(2, ${K} - 2) : ${K};
      const c = document.createElement('canvas'); c.width = cols * (cw + 4) * k; c.height = rows * (ch + 12) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, c.width, c.height);
      fr.forEach((f, i) => { const x = (i % cols) * (cw + 4) * k, y = Math.floor(i / cols) * (ch + 12) * k; g.fillStyle = '#6a5a48'; g.fillRect(x + 2 * k, y + 2 * k, cw * k, ch * k); g.drawImage(f, x + 2 * k, y + 2 * k, cw * k, ch * k); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText((s.names ? s.names[i] : i), x + 4, y + ch * k + 12); });
      res[key] = c.toDataURL('image/png'); } return res; })()`);
  for (const [k, d] of Object.entries(r)) { writeFileSync(join(out, 'cast-' + k + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('cast-' + k + '.png'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
