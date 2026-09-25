/* tools/burning-ambush-lab.mjs [reps=1] - THE BARN, measured (RULES Q4, docs/briefs/burning-village-rework.md §5): every hero through
   THE BURNING VILLAGE's ambush room with BK.ambushLab, played straight, against Q's 15-35 s window. Prints a row per run and a
   summary. Not in the suite: it is a measurement, and the suite's ambush-single and ambush-reach hold the room's shape. */
import { openPage } from './cdp.mjs';
const reps = +(process.argv[2] || 1), pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const o=await BK.ambushLab({levels:['burning'],heroes:['knight','warden','pyro','paladin','pirate','reaper'],reps:${reps}});return o.rows;})()`, 1800000);
  for (const x of r) console.log(JSON.stringify(x));
  const secs = r.filter(x => x.opened).map(x => x.secs).sort((a, b) => a - b);
  console.log('opened ' + secs.length + '/' + r.length + ', in 15-35 s: ' + r.filter(x => x.inTarget).length + ', median ' + (secs.length ? secs[secs.length >> 1] : null) + ' s, range ' + secs[0] + '-' + secs[secs.length - 1] + ' s');
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
