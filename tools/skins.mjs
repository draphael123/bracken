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

/* AND NOTHING FALLS THROUGH TO THE FOREST (Daniel 2026-09-24, THE UNBURIED FIELD: "it uses the forest theme/tiles ... it
   needs a graveyard theme"). The same bug class one level out: a level that names no palette does not fail, it paints
   with the DEFAULT KIT - src/art.js's green turf, the wood's felled-log ledges, its oaks, beehives and butterflies (dress
   'wood' is what main.js assumes when none is named), its leafy bough over the lens and a blue day sky. The wood is the
   one level that kit belongs to; `custom` is the parked editor's blank page. Everything else must say what it is. */
import { readFileSync } from 'node:fs';
import { DRESS } from '../src/level.js';
const FOREST_OWNS = new Set(['wood', 'custom']);
const bareKit = [];
for (const lv of LEVELS) { if (FOREST_OWNS.has(lv.id)) continue; let L; try { L = lv.build(); } catch { continue; }
  if (!L.palette || !L.palette.dress) bareKit.push(lv.id); }
assert.deepEqual(bareKit, [], 'these levels name no palette dress, so they paint with the forest kit: ' + bareKit.join(', '));
{ /* THE UNBURIED FIELD resolves its own look, and main.js has a branch for every name it asks for */
  const U = LEVELS.find(l => l.id === 'unburied').build(), P = U.palette || {}, MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  for (const k of ['sky', 'far', 'mid', 'near']) {
    assert.equal(P[k], 'unburied', "unburied: palette." + k + " is not its own ('" + P[k] + "'): it falls through to the default forest layer");
    assert.ok(MAIN.includes("pal." + k + " === 'unburied'"), "unburied: main.js has no branch for pal." + k + " === 'unburied', so the name resolves to the forest layer");
  }
  assert.equal(P.dress, 'battlefield', 'unburied: its dress is not the battlefield');
  assert.ok(P.grass && P.grass !== '#5aa33e' && P.dirt && P.dirt !== '#7a5230', 'unburied: its ground wears the forest turf (palette.grass/dirt unset)');
  assert.ok(P.boneSoil && MAIN.includes('pal.boneSoil'), 'unburied: the dead are not in its soil');
  assert.ok(P.ledges && P.ledges !== 'log', 'unburied: its ledges are the wood\'s felled logs');
  assert.ok((U.masonry || []).some(([a, b]) => a <= 320 && b >= 419), 'unburied: THE CHAPEL OF THE FALLEN ORDER is not laid in stone (L.masonry)');
  const kinds = new Set((DRESS.unburied || []).map(d => d[0]));
  for (const k of ['fieldGrave', 'crookedCross', 'brokenSpears', 'stuckShield', 'fallenBanner', 'bones']) assert.ok(kinds.has(k), 'unburied: its dressing has no ' + k);
  console.log('ok  forest kit     ' + (LEVELS.length - FOREST_OWNS.size) + ' levels name their own dress; THE UNBURIED FIELD resolves its own sky, layers, ground, ledges, chapel stone and dressing.');
}
{ /* NOTHING GROWS UNDER THE HILL, AND NOBODY WAS BURIED THERE IN A TRICORN (level review, 2026-09-24). The forest's root tile -
     wood-brown roots reaching down from the grass - was laid under every floor of the Burial Caverns and the Ore Road's mine,
     thirty to ninety rows underground; and the barrow's garrison stood up the drowned coast's bone corsairs, tricorns and striped
     shirts, in a hill crypt. main.js's belowGround() swaps the roots out; the sea's dead belong to a level dressed as the sea. */
  const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const m = MAIN.match(/function belowGround\(Lv\) \{[^\n]*\}/); assert.ok(m, 'cannot read belowGround out of src/main.js');
  const belowGround = new Function('return ' + m[0])();
  assert.ok(/below = belowGround\(L\)/.test(MAIN) && /if \(below\) TILE\.roots = TILE\.dirt\.slice\(0, 3\)/.test(MAIN), 'bakeAll does not take the root tile out of a level below the ground');
  const SEA_DEAD = new Set(['bonecorsair', 'tidemarauder']), SEA_SET = new Set(['ship', 'reef', 'shore', 'city']);
  const under = [], wrong = [];
  for (const lv of LEVELS) { let L; try { L = lv.build(); } catch { continue; } const p = L.palette || {};
    if (L.underground || L.oreRoad) { under.push(lv.id); assert.ok(belowGround(L), lv.id + ' is under the ground and still grows the forest\'s roots'); }
    if (!SEA_SET.has(p.set) && !SEA_SET.has(p.dress)) for (const e of L.ents) if (SEA_DEAD.has(e.t)) wrong.push(`${lv.id} ${e.t}@${e.x},${e.y}`); }
  assert.deepEqual(wrong, [], 'the sea\'s dead stand in a level that is not the sea: ' + wrong.join(' '));
  console.log('ok  under the hill ' + under.length + ' levels below the ground (' + under.join(', ') + ') grow no roots; the sea\'s dead stand only in the sea\'s levels.');
}

/* A ROOF'S PICTURE COVERS ITS ROOF. drawRoofs paints every house's roof (thatch, slate or tile) over the three rows above
   the house's front - (h.y0 - 3) to (h.y0 - 1) - and the tiles under that picture are what you walk on. If the slab a
   builder laid sits anywhere else, the picture hangs under it and the rows you stand on paint as the ground kit: THE
   BURNING VILLAGE laid its slabs two rows higher than its houses said, so every roof in the level was a strip of street
   cobble floating over a thatch that nobody could stand on (level review, 2026-09-25, the rooftops rework). Every level
   with houses: the three rows under the picture are solid across the house, and the row over them is not. */
{
  const bad = []; let roofs = 0;
  const SOLIDISH = new Set([T.SOLID, T.SOFT]);
  for (const lv of LEVELS) { let L; try { L = lv.build(); } catch { continue; }
    for (const h of L.houses || []) { roofs++; const top = h.y0 - 3, at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
      const holes = [], over = [];
      for (let x = h.x0; x <= h.x1; x++) { for (let y = top; y <= top + 2; y++) if (!SOLIDISH.has(at(x, y))) holes.push(x + ',' + y); if (SOLIDISH.has(at(x, top - 1))) over.push(x + ',' + (top - 1)); }
      if (holes.length || over.length) bad.push(lv.id + ' house ' + h.x0 + '-' + h.x1 + ': roof picture rows ' + top + '-' + (top + 2) + (holes.length ? ', open under it at ' + holes.slice(0, 3).join(' ') : '') + (over.length ? ', slab above it at ' + over.slice(0, 3).join(' ') : '')); } }
  if (bad.length) { console.log('FAIL roofs: ' + bad.length + ' of ' + roofs + ' houses whose roof picture does not sit on their slab\n  ' + bad.join('\n  ')); process.exitCode = 1; }
  else console.log('ok  roofs          ' + roofs + ' houses: every roof picture sits on the slab you stand on.');
}
