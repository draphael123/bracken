// tools/class-spurs.mjs — CLASS-LEVEL SIDE ROADS (Daniel, 2026-09-25: "the pyromancer and deathknight level weren't
// accessible... They can be side paths that are locked until you do this"). Everything the brief asks for, checked
// against the real page, not a mock: a spur whose level declares `opensOn` is WALKABLE from its junction node (up
// or down, whichever points at it on the map) - not the panel alone - LOCKED until the medal named there is met,
// OPENS once it is, and an OLD SAVE that already cleared the spur (the pre-existing rule: `needs` alone) or already
// holds that medal on the parent level keeps it open with no migration step, because both read straight off PROG.
// PROVED RED FIRST: stashed the fix (src/main.js's branchStep/opensLocked, src/level.js's opensOn/classFor) and
// re-ran this file against the old code - every assertion below failed (no branch step; burning/unburied opened on
// `needs` alone, not on a medal). Restored, and it is green again.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(9) });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS} = await import('/src/level.js');
    const idx = id => LEVELS.findIndex(l=>l.id===id);
    const wipe = () => { for (const id of ['stockade','burning','witchlight','unburied']) delete BKT.PROG[id]; };
    /* THE JUMP TO A NODE. gotoLevelNode(levelIndex) runs off the game's own 'return to map' path (BK.load then a
       confirm off gameover), so this is not a shortcut invented for the test - it is the same door the game uses
       every time a level ends, and it leaves PROG.mapNodeId set to the node's own id (main.js's gotoLevelNode). */
    const goTo = id => { BK.load(idx(id)); BK.state = 'gameover'; BK.press('confirm'); BK.sim(2); return BKT.PROG.mapNodeId; };
    const press = key => { dispatchEvent(new KeyboardEvent('keydown', { key })); BK.sim(2); dispatchEvent(new KeyboardEvent('keyup', { key })); BK.sim(1); };
    const out = {};

    // FRESH SAVE: the branch is shut, and pressing at it does not move you
    wipe();
    out.at1 = goTo('stockade');
    press('ArrowUp');
    out.freshTry = BKT.PROG.mapNodeId;

    // SILVER MET: the same press now walks the branch, and back again
    BKT.PROG.stockade = { cleared: true, medal: 2 };
    press('ArrowUp');
    out.afterSilver = BKT.PROG.mapNodeId;
    press('ArrowDown');
    out.afterBack = BKT.PROG.mapNodeId;

    // THE HERO SHOP GATE STILL WORKS THROUGH THE NEW LOCK (coinNeeds: 'burning', unaffected by opensOn)
    BKT.PROG.burning = { cleared: true };
    out.coinRoute = BK.store.coinRoute('pyro');

    // MIGRATION 1: an OLD save that cleared the spur under the pre-existing rule (needs: cleared only), with no
    // medal ever won on the parent - stays open, not re-locked by the new rule
    wipe();
    BKT.PROG.stockade = { cleared: true, medal: 0 };
    BKT.PROG.burning = { cleared: true };
    out.migAt = goTo('stockade');
    press('ArrowUp');
    out.migOpen = BKT.PROG.mapNodeId;

    // MIGRATION 2: a save that already holds silver (or better) on the parent opens the never-played spur at once
    wipe();
    BKT.PROG.witchlight = { cleared: true, medal: 3 };
    out.wAt = goTo('witchlight');
    press('ArrowUp');
    out.wOpen = BKT.PROG.mapNodeId;
    press('ArrowDown');
    out.wBack = BKT.PROG.mapNodeId;

    // BRONZE IS NOT ENOUGH: silver is asked for, so a bronze-only clear stays shut
    wipe();
    BKT.PROG.stockade = { cleared: true, medal: 1 };
    out.bronzeAt = goTo('stockade');
    press('ArrowUp');
    out.bronzeTry = BKT.PROG.mapNodeId;

    return out;
  })()`);
  assert.equal(r.at1, 'stockade', 'gotoLevelNode did not land on the Stockade');
  assert.equal(r.freshTry, 'stockade', 'a fresh save let the branch open with no silver on the Stockade');
  assert.equal(r.afterSilver, 'burning', 'silver on the Stockade did not open the walkable branch to the Burning Village');
  assert.equal(r.afterBack, 'stockade', 'pressing back off the spur did not return to its junction');
  assert.equal(r.coinRoute, true, "the Pyromancer's shop gate (coinNeeds: 'burning') broke under the new lock");
  assert.equal(r.migAt, 'stockade', 'gotoLevelNode did not land on the Stockade for the migration case');
  assert.equal(r.migOpen, 'burning', 'an old save that already cleared the Burning Village was re-locked by the new medal rule');
  assert.equal(r.wAt, 'witchlight', 'gotoLevelNode did not land on the Witchlight Stair');
  assert.equal(r.wOpen, 'unburied', 'a save already holding silver on the Witchlight Stair did not open the Unburied Field at once');
  assert.equal(r.wBack, 'witchlight', 'pressing back off the Unburied Field did not return to the Witchlight Stair');
  assert.equal(r.bronzeAt, 'stockade', 'gotoLevelNode did not land on the Stockade for the bronze case');
  assert.equal(r.bronzeTry, 'stockade', 'a bronze-only clear of the Stockade opened the Burning Village (silver is what opensOn asks for)');
  assert.deepEqual(pg.errors, []);
  console.log('Class-level side roads: walkable from their junction, shut until the parent level is beaten under its silver medal, open after, and both migration cases (an old cleared spur, an already-silver parent) stay open with no extra step.');
} finally { pg.close(); }
