// tools/desert-ledge-art.mjs — THE DESERT DOES NOT STAND ON FELLED LOGS.
//
// Daniel, 2026-09-26, of THE SUNKEN CARAVAN: "it's good but uses wood platforms at a point. It should use sand platforms
// or more appropriate terrain." The level's 79 T.ONEWAY tiles and 13 T.PLANK tiles were drawn by main.js's one generic
// dispatch, which had no idea it was in a desert: 65 of the ONEWAY tiles (inside a tower or a house, L.masonry) came out
// as LEDGE_SETS.masonry - the castle's own grey coping stone, not the ruin's pale ashlar or the rock's warm strata - and
// the other 14 (THE GREAT RIBCAGE's spine, over nothing a ruin or a cliff claims) came out as TILE.log, the game's
// default felled-timber ledge used by every level with no palette of its own (RULES-LEVELS-AND-BOSSES, the "WOOD'S
// FELLED LOGS" note by main.js's ONEWAY dispatch).
//
// THE FIX (art only - not one tile moved, nothing about collision changed): L.ledgeKit = 'desert' (src/sunken-caravan.js,
// reusable by any other desert level) tells main.js to pick one of three kits PER TILE by where it actually sits:
//   inside L.masonry (a tower, a house, the caravanserai)  -> LEDGE_SETS.ruinLedge   (src/redraw/caravan_ruins.js)
//   against L.rockZones (the arch, the rim's overhang)     -> LEDGE_SETS.rockShelf   (src/redraw/desert.js)
//   neither (open sand)                                     -> LEDGE_SETS.sandLip    (src/redraw/desert.js)
// REAL TIMBER STAYS WOOD: the lead wagon's tipped bed, the sunk wagons' tops, the market stall's board and the trader's
// platform are actual built wood (L.timberPlanks, laid down by src/draft/sunken-caravan.js next to each T.PLANK run) and
// are excluded from the desert kit before it is even asked - RULES B9, it has to look like what it is.
//
// This loads THE SUNKEN CARAVAN for real (resolveTiles, as the game runs it) and asks of every ONEWAY/PLANK tile: is its
// drawn picture (by identity, not by eye - BK.tileArt() exposes TILE and LEDGE_SETS) the game's DEFAULT wood
// (TILE.log/logL/logR or TILE.plank/plankL/plankR)? That is only allowed inside L.timberPlanks. Everything else must be
// one of the three desert kits.
// PROVED RED FIRST (2026-09-26): before L.ledgeKit was set, all 79 ONEWAY and 13 PLANK failed this (65 ONEWAY drew the
// generic LEDGE_SETS.masonry, which is not TILE.log either - so the true count of "the level's own art" was 0 of 92).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
let out;
try {
  out = await pg.evalp(`(async()=>{
    const {LEVELS,T}=await import('/src/level.js');
    const i = LEVELS.findIndex(l=>l.id==='caravan');
    if (i < 0) return { err: 'no level with id caravan' };
    BK.load(i); BK.resolve();
    const L = BK.level, S = BK.tileSpr(), W = L.W, H = L.H, G = L.grid;
    const art = BK.tileArt ? BK.tileArt() : null;
    if (!art) return { err: 'BK.tileArt() is not exposed' };
    const { TILE, LEDGE_SETS } = art;
    const inRect = (zs, x, y) => (zs || []).some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);
    const isDefaultWood = s => s === TILE.logL || s === TILE.logR || TILE.log.includes(s) || s === TILE.plankL || s === TILE.plankR || TILE.plank.includes(s);
    const bad = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = G[y * W + x];
      if (t !== T.ONEWAY && t !== T.PLANK) continue;
      if (!isDefaultWood(S[y * W + x])) continue;
      if (inRect(L.timberPlanks, x, y)) continue;   // real timber: a wagon, a stall board, a platform - wood because it IS wood
      bad.push((t === T.ONEWAY ? 'ONEWAY' : 'PLANK') + '@' + x + ',' + y);
    }
    return { ledgeKit: L.ledgeKit, timber: (L.timberPlanks || []).length, bad };
  })()`, 60000);
  out.errors = pg.errors.slice(0, 5);
} finally { pg.close(); }

if (out.err) throw new Error(out.err);
if (out.errors.length) throw new Error('page errors: ' + JSON.stringify(out.errors));
assert.equal(out.ledgeKit, 'desert', "THE SUNKEN CARAVAN must set L.ledgeKit = 'desert'");
assert.deepEqual(out.bad, [], out.bad.length + ' ONEWAY/PLANK tile(s) draw the default wood art and are not real timber: ' + out.bad.slice(0, 20).join(' '));
console.log('desert-ledge-art: no ONEWAY/PLANK tile in THE SUNKEN CARAVAN draws the default plank art unless it is real timber (' + out.timber + ' timber tile(s) exempt)');
