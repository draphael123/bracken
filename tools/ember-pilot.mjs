/* tools/ember-pilot.mjs [label] - THE EMBER WARD's pilot (claude/ember-ward): the PYROMANCER alone, one pinned seed, run BEFORE and
   AFTER a change to her ward or to the bot's use of it:
     1. STORMHOLD's QUEEN'S LANCE through BK.bossLab (src/lab.js), the duck pilot's settings (refill health, a 150 s cap, salt duck-1)
     2. a common-foe level, THE BURNING VILLAGE's ambush room (BK.ambushLab: the room played straight, health put back, what it took counted)
     3. THE STOCKADE through BK.fightLab: six foes with yellow blows (shoves, cuts, an archer's arrow and a crossbow's bolt) as ELITES
        (a plain one dies to her first two swings before it tells), one fight each, her health put back each frame (keepAlive)
   Prints one row per fight. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const label = process.argv[2] || 'run';
const FOES = ['shield', 'swornsword', 'archer', 'crossbow', 'hedgeknight', 'cutlass'];
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const o=await BK.bossLab({bosses:['storm'],heroes:['pyro'],healthMode:'refill',maxSecs:150,modes:true,salt:'duck-1'});
    return o.rows.map(r=>({h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,hitBy:r.hitBy}));})()`, 1800000);
  for (const x of r) console.log(label, 'lance', JSON.stringify(x));
  console.log(label, 'ward', JSON.stringify(await pg.evalp('window.BK.ember ? BK.ember().stats : null')));
  await pg.reload();
  const a = await pg.evalp(`(async()=>{BK.SET.speed=1;let seed=2024;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const o=await BK.ambushLab({levels:['burning'],heroes:['pyro'],reps:1});return o.rows;})()`, 1800000);
  for (const x of a) console.log(label, 'ambush', JSON.stringify(x));
  console.log(label, 'ward', JSON.stringify(await pg.evalp('window.BK.ember ? BK.ember().stats : null')));
  await pg.reload();
  const f = await pg.evalp(`(async()=>{BK.SET.speed=1;let seed=2024;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
    const o=await BK.fightLab({levels:['stockade'],heroes:['pyro'],foes:${JSON.stringify(FOES)},reps:1,keepAlive:true,elite:true});return o.rows;})()`, 1800000);
  let taken = 0, secs = 0;
  for (const x of f) { console.log(label, 'stockade', JSON.stringify(x)); if (!x.skipped) { taken += x.taken; secs += x.ttk || 0; } }
  console.log(label, 'stockade total taken', Math.round(taken), 'kill seconds', +secs.toFixed(1));
  console.log(label, 'ward', JSON.stringify(await pg.evalp('window.BK.ember ? BK.ember().stats : null')));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
