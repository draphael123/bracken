// work/claude/dk2-small-survey.mjs - THE SMALL-FOE LEDGER OVER EVERY BOSS: bossLab (refill, dice pinned) on every level with an
// arena, every hero, and each row's swings at small foes and how many met air (src/lab.js smallSwings / smallMissed).
//   node work/claude/dk2-small-survey.mjs       LEVELS=spore,kings HEROES=... MAXSECS=120 OUT=file.json
import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const heroes = (process.env.HEROES || 'knight,pyro,paladin,pirate,reaper,warden,geomancer').split(',');
const pg = await openPage({ audio: false, fonts: false });
const rows = [];
try {
  await pg.reload();
  const levels = process.env.LEVELS ? process.env.LEVELS.split(',') : await pg.evalp(`(async()=>{const m=await import('./src/level.js');return m.LEVELS.map(l=>l.id).filter(id=>!/^trial|^shop|custom/.test(id));})()`);
  for (const lv of levels) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const r=await BK.bossLab({bosses:[${JSON.stringify(lv)}],heroes:${JSON.stringify(heroes)},maxSecs:${+(process.env.MAXSECS || 120)}${process.env.SALT ? ',salt:' + JSON.stringify(process.env.SALT) : ''}});return r.rows.map(x=>({lvl:x.lvl,boss:x.boss,h:x.h,skipped:x.skipped,secs:x.secs,killed:x.killed,swings:x.swings,smallSwings:x.smallSwings,smallMissed:x.smallMissed}));})()`, 3600000);
    for (const x of r) { rows.push(x); if (!x.skipped) console.log(x.lvl.padEnd(12), x.boss.padEnd(12), x.h.padEnd(9), String(x.secs).padStart(6), x.killed ? 'kill' : 'FAIL', 'small', x.smallSwings, 'missed', x.smallMissed); }
    if (r.every(x => x.skipped)) console.log(lv.padEnd(12), 'skipped:', r[0].skipped);
    if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(rows, null, 1));
  }
  console.log('errors', JSON.stringify(pg.errors));
} finally { pg.close(); }
