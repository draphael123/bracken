// tools/floaters.mjs — EVERY PROP THAT IS STANDING ON NOTHING.
//
// `tools/newlevel.mjs` catches a CREATURE in the air. Nothing caught a PROP in the air, and a banner on a
// spear hanging two tiles over the floor is the same bug with a quieter failure: it does not break the
// level, it just looks broken, and you only find it by walking past it. This walks past all of them.
//
// A prop is floating when the tile under its foot is empty AND nothing within a tile below it would hold
// it. Kinds that are MEANT to hang (a lamp on a chain, a window in a wall, a cobweb in a corner) are named
// in HANGS and skipped, and anything carrying `hang: true` says so for itself.
import { LEVELS } from '../src/level.js';

const T = { AIR: 0, SOLID: 1, ONEWAY: 2 };
const STAND = new Set([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

// what belongs in the air on purpose
const HANGS = new Set(['hallWindow', 'window', 'cobweb', 'rigging', 'lantern', 'chandelier', 'hangCage',
  'washing', 'sternWindows', 'gunport', 'grating', 'icicle', 'vine', 'rope', 'birdhouse', 'beehive',
  'bell', 'lamp',
  /* these brace, hang or float on purpose: a strut holds a ledge against the rock it is bolted to, an
     air bell is under water, a sail rag is on a yard, a boarding net is over the side */
  'strut', 'airBell', 'sailRag', 'boardingNet', 'bracket', 'ropeBeam', 'pillar']);

const args = process.argv.slice(2);
let bad = 0, checked = 0;

for (const lv of LEVELS) {
  if (args.length && !args.includes(lv.id)) continue;
  let R;
  try { R = lv.build(); } catch (e) { console.log('  ' + lv.id + ' will not build: ' + e.message); continue; }
  const { W, grid, ents } = R;
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y * W + x >= grid.length ? T.SOLID : grid[y * W + x]);
  const found = [];
  for (const e of ents) {
    if (e.t !== 'deco' && e.t !== 'torch' && e.t !== 'brazier') continue;
    if (e.hang || HANGS.has(e.kind)) continue;
    checked++;
    // its foot is the row it was placed on, so the tile UNDER it has to hold something up
    let held = false;
    for (let k = 1; k <= 2 && !held; k++) if (STAND.has(at(e.x, e.y + k))) held = true;
    if (!held) found.push((e.kind || e.t) + '@' + e.x + ',' + e.y);
  }
  if (found.length) { bad += found.length; console.log('  ' + lv.id.padEnd(10) + found.length + ' standing on nothing: ' + found.slice(0, 12).join(' ') + (found.length > 12 ? ' ...' : '')); }
}

console.log('\n' + checked + ' props checked. ' + (bad ? bad + ' are in the air.' : 'none are in the air.'));
process.exit(bad ? 1 : 0);
