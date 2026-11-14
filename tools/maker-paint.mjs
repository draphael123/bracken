// PAGE TOOL: launches headless Chrome
/* tools/maker-paint.mjs (claude/maker) - PAINTING IN THE MAKER behaves (Daniel 2026-11-09: "why do we only have one tile
   texture, why do slopes not load, and why does the terrain move oddly when I try placing things").
   1. PAINTING A TILE MOVES ONLY ITS OWN DRESSING: the trees, fences and tufts more than a column away stay where they were
      (resolveTiles read one dice stream left to right, so every click reshuffled everything to its right).
   2. A SLOPE PAINTED IN THE EDITOR IS DRAWN THERE (SLOPES_ON was only set by loadLevel, so slopes were invisible until PLAY).
   3. A GROUND MATERIAL draws in its own skin: a cobble cell's art is not the forest's grass.
   node tools/maker-paint.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(4), audio: false, seed: 4 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'); MKR.enter(); (await import('/src/maker-ui.js')).closePanel();
    const r = {}, pick = id => MKR.select(0, P.TILES.findIndex(t => t[1] === id));
    MKR.doc = MKR.blank(120, 28); MKR.mount();
    const dec = () => MKR.decor.map(d => (d.kind || d.k) + '@' + d.x + ',' + d.y);
    const A = dec(); pick(1); MKR.place(40, 19); MKR.place(41, 19); MKR.place(42, 19);
    const B = dec(), Bs = new Set(B), As = new Set(A), col = k => Math.floor(+k.split('@')[1].split(',')[0] / 16);
    r.dressing = A.length; r.movedFar = [...A.filter(k => !Bs.has(k)), ...B.filter(k => !As.has(k))].filter(k => col(k) < 39 || col(k) > 43);
    pick(20); MKR.place(60, 19); r.slopeDrawn = !!MKR.spr(60, 19);
    const mean = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let R = 0, G = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) { R += d[i]; G += d[i + 1]; n++; } return [R / n, G / n]; };   /* the mean red and green of a tile's art */
    pick('mat:cobble'); MKR.place(80, 19); MKR.place(81, 19); MKR.place(82, 19);
    pick(1); MKR.place(90, 19); MKR.place(91, 19); MKR.place(92, 19);   /* the same shape in the background's own ground, to compare like with like */
    const grass = MKR.spr(91, 19), cob = MKR.spr(81, 19), g0 = mean(grass), c0 = mean(cob);
    r.colourGap = Math.round(Math.abs(g0[0] - c0[0]) + Math.abs(g0[1] - c0[1])); r.matDifferent = grass !== cob && r.colourGap > 20;
    r.saved = JSON.stringify(P.terrainOf(MKR.doc).mat);
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  assert(r.dressing > 20, 'no dressing to watch');
  assert.deepEqual(r.movedFar, [], 'painting three tiles moved dressing far from them: ' + r.movedFar.join(' '));
  assert(r.slopeDrawn, 'a slope painted in the editor is not drawn');
  assert(r.matDifferent, 'a cobble cell is drawn like the grass: ' + JSON.stringify(r));
  assert(r.saved.includes('cobble'), 'the material is not in the saved terrain');
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-paint: painting moves only its own dressing, slopes draw in the editor, ground materials wear their own skin.');
} finally { pg.close(); }
