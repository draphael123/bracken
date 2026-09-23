/* tools/skins.mjs — NOTHING INDOORS GROWS GRASS. Node only: no page, no port, no Chrome.

   THE BUG CLASS. Three levels paint their own stone through `L.mage.skins` (the Folly, the Falling Tower, the
   Witchlight Stair). A solid cell that no skin claims does not fail, does not warn, and does not look obviously
   wrong in a screenshot of the wrong floor - it quietly falls through to the level's DEFAULT GROUND KIT and wears
   `palette.grass`. Green, indoors, two hundred rows up a stone tower.

   WHY IT IS A SWEEP AND NOT A LIST. Daniel reported exactly one of these on 2026-09-22 - "it looks like there's a
   grass mat to get to the carpet" - which was the parapet walk. Fixing the row he pointed at would have been a one
   line change and a lie: asserting the RULE instead found the crenellations the same day (12 more cells, on the very
   top of the tower, which nobody had ever noticed), and then 334 more the day after - the library's bookcases, the
   cistern's floor, and THE READING ROOM'S GALLERY, which is the floor you walk on when the room turns over.

   So this check exists to make the next one fail at a keystroke instead of in a screenshot. The levels it guards are
   discovered, not listed: any level that grows a skins table is covered the moment it does. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';

let checked = 0, cells = 0;
const report = [];

for (const lv of LEVELS) {
  let L;
  try { L = lv.build(); } catch { continue; }
  const skins = L.mage && L.mage.skins;
  if (!skins || !skins.length) continue;
  checked++;

  const claimed = (x, y) => skins.some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d);
  const rooms = L.interiors || [];
  const inRoom = (x, y) => rooms.some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
  /* INDOORS means: inside one of the level's own rooms, or above its sky row, where there is no ground to be the
     ground kit's excuse. Everything else in these levels is honestly outdoors and honestly grassy. */
  const indoor = (x, y) => inRoom(x, y) || (L.skyRow !== undefined && y <= L.skyRow + 1);

  const bare = [];
  for (let y = 0; y < L.H; y++) for (let x = 0; x < L.W; x++) {
    if (L.grid[y * L.W + x] !== T.SOLID) continue;
    cells++;
    if (indoor(x, y) && !claimed(x, y)) bare.push(x + ',' + y);
  }
  report.push('  ' + String(lv.id).padEnd(14) + String(skins.length).padStart(4) + ' skin rects, ' + (bare.length ? bare.length + ' BARE' : 'all indoor stone claimed'));
  assert.equal(bare.length, 0,
    lv.id + ': ' + bare.length + ' solid cells indoors wear no skin, so they paint with the default ground kit'
    + ' (palette.grass = ' + (L.palette && L.palette.grass) + ') - grass, indoors. First few: ' + bare.slice(0, 8).join('  '));
}

assert.ok(checked >= 3, 'only ' + checked + ' levels with a skins table were found: this check has stopped covering things it used to');
console.log(report.join('\n'));
console.log('ok  skins          ' + checked + ' levels paint their own stone, ' + cells.toLocaleString() + ' solid cells, and nothing indoors grows grass.');
