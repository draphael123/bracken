// tools/geomancer-pilots.mjs — THE GEOMANCER AGAINST THE LAB, BESIDE THE KNIGHT AND THE WARDEN. A report, not a gate (numbers from bots,
// ~21 runs would be needed to tune on them - see the memory rule): the fight lab against the common foes in the wood, the boss lab
// on the first bosses, and the playtest walker through three early levels as her. Writes docs/geomancer/pilots.json.
//   node tools/geomancer-pilots.mjs [fight,boss,walk]
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const WANT = (process.argv[2] || 'fight,boss,walk').split(',');
const pg = await openPage({ audio: false, fonts: false });
const out = {};
try {
  const heroes = ['knight', 'warden', 'geomancer'];
  if (WANT.includes('fight')) out.fight = await pg.evalp(`(async()=>{const r=await BK.fightLab({heroes:${JSON.stringify(heroes)},levels:['wood'],reps:2,foes:['sprig','shield','swornsword','archer','hedgeknight']});
    return (r.rows||r).map(x=>({h:x.h,t:x.t,kills:x.kills,deaths:x.deaths,ttk:x.ttk,takenPct:x.takenPct,defends:x.defends}))})()`);
  if (WANT.includes('boss')) out.boss = await pg.evalp(`(async()=>{const r=await BK.bossLab({heroes:${JSON.stringify(heroes)},bosses:['wood','kings','spire'],maxSecs:120});
    return (r.rows||r).map(x=>({lvl:x.lvl,boss:x.boss,h:x.h,outcome:x.outcome,killed:x.killed,secs:x.secs,hpLeftPct:x.hpLeftPct,takenPerMin:x.takenPerMin,skipped:x.skipped}))})()`);
  if (WANT.includes('walk')) out.walk = await pg.evalp(`(async()=>{const PT=await import('/src/playtest.js');BK.setHero('geomancer');
    const rep=await PT.run(BK,{levels:['wood','marsh','stockade'],mode:'play',log:false});
    return rep.levels.map(l=>({id:l.id,stats:l.stats,findings:l.findings.map(f=>f.sev+' '+f.kind+': '+f.msg).slice(0,12)}))})()`);
  out.errors = pg.errors;
  writeFileSync(join(ROOT, 'docs/geomancer/pilots.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out).slice(0, 4000));
} finally { pg.close(); }
