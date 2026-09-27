// tools/geomancer-pilots.mjs — THE GEOMANCER AGAINST THE LAB, BESIDE THE KNIGHT AND THE WARDEN. A report, not a gate (numbers from bots,
// ~21 runs would be needed to tune on them - see the memory rule): the fight lab against the common foes in the wood, the boss lab
// on the first bosses, and the playtest walker through three early levels as her. Writes docs/geomancer/pilots.json.
//   node tools/geomancer-pilots.mjs [fight,boss,walk]
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const WANT = (process.argv[2] || 'fight,boss,walk').split(',');
const pg = await openPage({ audio: false, fonts: false });
const FILE = join(ROOT, 'docs/geomancer/pilots.json'), out = existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : {};   /* each part run replaces only its own part */
try {
  const heroes = ['knight', 'warden', 'geomancer'];
  if (WANT.includes('fight')) out.fight = await pg.evalp(`(async()=>{const r=await BK.fightLab({heroes:${JSON.stringify(heroes)},levels:['wood'],reps:2,foes:['sprig','shield','swornsword','archer','hedgeknight']});
    return (r.rows||r).map(x=>({h:x.h,t:x.t,kills:x.kills,deaths:x.deaths,ttk:x.ttk,takenPct:x.takenPct,defends:x.defends}))})()`);
  if (WANT.includes('boss')) out.boss = await pg.evalp(`(async()=>{const r=await BK.bossLab({heroes:${JSON.stringify(heroes)},bosses:['wood','kings','spire'],maxSecs:120});
    return (r.rows||r).map(x=>({lvl:x.lvl,boss:x.boss,h:x.h,outcome:x.outcome,killed:x.killed,secs:x.secs,hpLeftPct:x.hpLeftPct,takenPerMin:x.takenPerMin,skipped:x.skipped}))})()`);
  /* the walk, as her AND as the knight on the same levels: a level the walker cannot finish as the knight either is the walker's, not hers */
  if (WANT.includes('walk')) { out.walk = {}; for (const h of (process.env.WALK_HEROES || 'geomancer,knight').split(',')) out.walk[h] = await pg.evalp(`(async()=>{const PT=await import('/src/playtest.js');BK.setHero('${h}');
    const rep=await PT.run(BK,{levels:['wood','marsh','stockade'],mode:'play',log:false});
    return rep.levels.map(l=>({id:l.id,stats:l.stats,findings:l.findings.filter(f=>f.sev<=2).map(f=>f.sev+' '+f.kind+': '+f.msg).slice(0,8)}))})()`); }
  out.errors = pg.errors;
  writeFileSync(FILE, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out).slice(0, 4000));
} finally { pg.close(); }
