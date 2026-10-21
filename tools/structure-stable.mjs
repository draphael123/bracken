/* tools/structure-stable.mjs - a footing drawn by main.js's drawStructures must look the same wherever the CAMERA is (Daniel 10-21, THE UNBURIED FIELD:
   "this gets scrambled when you move" - the headstone cairn and the trestles were seeded from the box's screen x, so they re-dealt every frame the camera moved).
   Every 'ub' structure kind of the field is drawn into the same box at two screen offsets (the world box unmoved, only cx differs) and the two pictures must be identical.
   usage: node tools/structure-stable.mjs */
import { openPage } from './cdp.mjs';
const KINDS = ['ubtrestle', 'ubpier', 'ubpierCold', 'ubcart', 'ubprop', 'ubscaffold', 'ubheads'];
const pg = await openPage();
try {
  const bad = await pg.evalp(`(async () => {
    const M = await import('/src/redraw/unburied_sets.js'), out = [];
    const shot = (kind, l, seed) => { const c = document.createElement('canvas'); c.width = 400; c.height = 260; const g = c.getContext('2d');
      M.drawStructure(g, kind, l, l + 48, 20, 220, seed); return g.getImageData(0, 0, 400, 260).data; };
    for (const kind of ${JSON.stringify(KINDS)}) for (const seed of [102, 154]) {
      const a = shot(kind, 10, seed), b = shot(kind, 10 + 37, seed);   /* the camera moved 37 px: the same world box lands 37 px further right... */
      /* ...so a drawing that depends on nothing but the world is the same picture shifted: compare a's columns 10..58 with b's 47..95 */
      let diff = 0; for (let y = 0; y < 260; y++) for (let x = 0; x < 60; x++) for (let k = 0; k < 4; k++) if (a[(y * 400 + 6 + x) * 4 + k] !== b[(y * 400 + 43 + x) * 4 + k]) diff++;
      if (diff) out.push(kind + ' seed ' + seed + ': ' + diff + ' bytes differ');
    }
    return out; })()`);
  if (bad.length) { console.log('FAIL structure-stable: a footing is redrawn differently when the camera moves:\n  ' + bad.join('\n  ')); process.exitCode = 1; }
  else console.log('ok  structure-stable   every unburied footing kind draws the same picture at two camera offsets (no screen-seeded art)');
} finally { pg.close(); }
