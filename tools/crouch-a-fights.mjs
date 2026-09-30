/* tools/crouch-a-fights.mjs [label] - THE CROUCH TWISTS, PART A in plain fights (claude/croucha): BK.fightLab in BRACKEN WOOD, the knight,
   the warden and the freebooter against the wood's shieldbearer, badger (a yellow charge) and sprig, one fight each, the dice pinned,
   health put back each frame (keepAlive). Prints one row a fight and the crouch counters. Not in the suite. */
import { openPage } from './cdp.mjs';
const label = process.argv[2] || 'run';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const f = await pg.evalp(`(async()=>{BK.SET.speed=1;let seed=2024;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const o=await BK.fightLab({levels:['wood'],heroes:['knight','warden','pirate'],foes:['shield','badger','sprig'],reps:1,keepAlive:true});return o.rows;})()`, 1800000);
  let taken = 0, secs = 0;
  for (const x of f) { console.log(label, JSON.stringify(x)); if (!x.skipped) { taken += x.taken || 0; secs += x.ttk || 0; } }
  console.log(label, 'total taken', Math.round(taken), 'kill seconds', +secs.toFixed(1));
  console.log(label, 'crouch', JSON.stringify(await pg.evalp('window.BK.crouchA ? BK.crouchA().stats : null')));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
