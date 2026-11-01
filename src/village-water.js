// village-water.js - THROW WATER (claude/burnvillage2, Daniel's brief approved 10-07 20:07, THE BURNING VILLAGE #1 + #2).
// The pure numbers of the village's water and what it does to THE PYROMANCER. The carrying, the flight and the splash stay main.js's
// (updateBuckets / stepBucketFlight / pourBucket, on src/throwables.js's CARRY & THROW), the told arc is src/carry-throw.js's.
//
// 1. TWO THROWABLES, ONE SYSTEM. THE BUCKET (heavy: a walk, a flat fast throw, a wide splash) and THE JUG (light: nearly a run, a
//    higher lob, a small splash) - rows in THROW_KIND (src/throwables.js) and KINDS (src/carry-throw.js), racks in the level
//    (src/burning-village.js: a `villagewell` with bucket: true; kind 'jug' is a jug shelf). Every one at rest is HIGHLIGHTED (A6): an
//    outline, a glint that sweeps it, and the take-me ring in reach; a first-use sign stands at the first rack of each kind.
//    SPLASH.r is how many tiles of HIS fire a landing puts out (fire-spread.js douse/quench).
// 2. THE PYROMANCER IS NEVER INVULNERABLE (B11/B13, Daniel: "some fire resistance is fine, but he takes real damage normally"). A hero's
//    blow lands whole (he is on src/boss-greed.js FULL_DAMAGE: no chip) - his fire resistance is the class's own: no burn takes on him
//    (main.js FIREPROOF). He still READS a run (the third light blow is turned, a heavy goes through: a duellist's guard, B11).
//    WATER STUNS HIM (B10's shared read: the gold ring and a timer bar over him): STUN.t seconds stood dripping, every blow x STUN.mul.
//    Then THE STEAM WARD (B3), told - a hiss, WARDED over him and a pale shell with its own bar - for WARD.t seconds: the water and the
//    blade both turned (clank, flash, the word), so a stun can never be chained into a lock. He fights on inside it.
//    OVERHEATED (his own opening, struck while he runs hot) he takes OVER.mul, as he always has.
export const SPLASH = { bucket: 2, jug: 1 };
/* (claude/pyroboss2, Daniel 11-01) THE PYROMANCER 2: what water does to him is the NEW KIT's now (src/pyro-boss.js waterOn / takeMul / readOf): water while he
   STOKES winds him (x2, then the told steam ward at 0.4 - B15, the old 0x is gone); water anywhere else takes his meter down, puts a raised ward out and
   throws a charge off. The old stun (STUN / WARD / OVER below) is kept only as the names the old reports cite. */
export { waterOn, takeMul as pyroMul, readOf as pyroRead } from './pyro-boss.js';
export const STUN = { t: 3.5, mul: 2 };   /* = pyro-boss WIND */
export const WARD = { t: 2.5 };           /* = pyro-boss STEAM */
export const OVER = { mul: 1.5 };         /* = pyro-boss OPEN_MUL */
