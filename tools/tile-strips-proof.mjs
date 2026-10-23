import { openPage } from './cdp.mjs';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const result = await pg.evalp(`(async () => {
    BK.manualSimulation = true;
    const { createTileStrips } = await import('/src/tile-strips.js'), { T } = await import('/src/level.js');
    const cache = createTileStrips(T, 2), make = color => {
      const c = document.createElement('canvas'); c.width = c.height = 16;
      const g = c.getContext('2d'); g.fillStyle = color; g.fillRect(0, 0, 16, 16); return c;
    };
    const images = Array.from({ length: 32 }, (_, i) => make('rgb(' + (i * 7) + ',80,140)'));
    const grid = Array(32).fill(T.SOLID), above = Array(32).fill(T.AIR);
    const cells = above.concat(grid), sprites = Array(32).fill(null).concat(images);
    const a = document.createElement('canvas'), b = document.createElement('canvas');
    a.width = b.width = 128; a.height = b.height = 32;
    const ga = a.getContext('2d'), gb = b.getContext('2d'); ga.imageSmoothingEnabled = gb.imageSmoothingEnabled = false;
    const lip = 'rgba(236,214,168,0.5)', lip2 = 'rgba(236,214,168,0.18)';
    const read = g => Array.from(g.getImageData(0, 0, 128, 32).data);
    const compare = () => {
      for (const g of [ga, gb]) { g.fillStyle = '#243146'; g.fillRect(0, 0, 128, 32); }
      for (let k = 0; k < 8; k++) {
        ga.drawImage(sprites[32 + k], k * 16, 5);
        if (cells[k] === T.AIR) { ga.fillStyle = lip; ga.fillRect(k * 16, 5, 16, 1); ga.fillStyle = lip2; ga.fillRect(k * 16, 6, 16, 1); }
      }
      const used = cache.draw(gb, sprites, cells, 32, 0, 1, 0, 5, lip, lip2);
      return { used, exact: JSON.stringify(read(ga)) === JSON.stringify(read(gb)) };
    };
    const cold = compare(), hit = compare();
    sprites[34] = make('#ab49e3'); const replaced = compare();
    cells[2] = T.SOLID; const changedAbove = compare();
    sprites[34].getContext('2d').fillStyle = '#f04020'; sprites[34].getContext('2d').fillRect(0, 0, 16, 16);
    cache.clear(); const invalidated = compare();
    sprites[34] = make('rgba(90,40,160,0.4)'); const translucentRejected = !cache.draw(gb, sprites, cells, 32, 0, 1, 0, 5, lip, lip2);
    ga.translate(0.5, 0); const transformRejected = !cache.canDraw(ga); ga.resetTransform();
    const identityAccepted = cache.canDraw(ga);
    sprites[34] = images[2];
    for (const col of [0, 8, 16, 24]) cache.draw(gb, sprites, cells, 32, col, 1, 0, 0, lip, lip2);
    const bytes = cache.bytes; cache.clear();
    return { cold, hit, replaced, changedAbove, invalidated, translucentRejected, transformRejected, identityAccepted, bytes, releasedBytes: cache.bytes };
  })()`);
  for (const key of ['cold', 'hit', 'replaced', 'changedAbove', 'invalidated']) assert.deepEqual(result[key], { used: true, exact: true }, key);
  for (const key of ['translucentRejected', 'transformRejected', 'identityAccepted']) assert.equal(result[key], true, key);
  assert.equal(result.bytes, 2 * 8 * 16 * 16 * 4); assert.equal(result.releasedBytes, 0);
  assert.deepEqual(pg.errors, []);
  mkdirSync('gate-data', { recursive: true });
  writeFileSync('gate-data/tile-strips-safety.json', JSON.stringify({ time: new Date().toISOString(), ...result }, null, 2) + '\n');
  console.log('PASS opaque tile strips: exact pixels, tile and lip invalidation, translucent/transform fallback, bounded cache');
} finally { await pg.close(); }
