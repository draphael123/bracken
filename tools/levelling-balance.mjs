// tools/levelling-balance.mjs — WHAT THE PASSIVES DO TO THE FIGHTS. Not in the suite (it is long): run it by hand after a change
// to when passives arrive. For each hero level asked (default 8,12,20) every hero is set to exactly that level with NO ability
// owned or slotted, so the only difference between two runs of this tool is which passives the level has switched on. It then
// runs BK.bossLab (every boss the lab knows, refill health) and BK.fightLab (the common foes) and writes one JSON.
//   node tools/levelling-balance.mjs [out.json] [8,12,20] [boss|fight|both]
import { openPage } from './cdp.mjs'; import { writeFileSync } from 'node:fs';
const out = process.argv[2] || 'levelling-balance.json', levels = (process.argv[3] || '8,12,20').split(',').map(Number), what = process.argv[4] || 'both';
const res = { levels, boss: {}, fight: {} };
for (const lv of levels) {
  const pg = await openPage({ audio: false, fonts: false });
  try {
    const setup = `const {xpFloor}=await import('/src/xp.js'),PR=await import('/src/progression.js');const P=BKT.PROG;for(const h of PR.HERO_IDS){P.xp[h]=xpFloor(${lv});P.skillOwned[h]={};P.loadouts[h]=[];}P.heroes={knight:true,pyro:true,paladin:true,pirate:true,reaper:true,warden:true};
      const on={};for(const h of PR.HERO_IDS)on[h]=PR.skillsFor(h).filter(n=>!n.active&&n.level<=${lv}).length;`;
    if (what !== 'fight') res.boss[lv] = await pg.evalp(`(async()=>{${setup}const r=await BK.bossLab({});return{on,rows:r.rows};})()`, 7200000);
    if (what !== 'boss') res.fight[lv] = await pg.evalp(`(async()=>{${setup}const r=await BK.fightLab({});return{on,rows:r.rows};})()`, 7200000);
  } finally { pg.close(); }
  writeFileSync(out, JSON.stringify(res));
  console.log('level ' + lv + ' done');
}
