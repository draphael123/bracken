/* ITEM 4 (small fixes, 2026-09-24): the paladin's fight lab at hero levels 3-8 with REFLECTION at level 4 (as shipped on this
   branch) or at 7 (master), no abilities owned, so the only difference is which passives the level switches on.
   node work/claude/paladin-reflect-lab.mjs out.json 3,4,5 [before] [fight|boss]   Not in the suite. */
import { openPage } from '../../tools/cdp.mjs'; import { writeFileSync } from 'node:fs';
const out = process.argv[2], levels = process.argv[3].split(',').map(Number), before = process.argv[4] === 'before', what = process.argv[5] || 'fight';
const res = {};
for (const lv of levels) { const pg = await openPage({ audio: false, fonts: false });
  try { res[lv] = await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js'),PR=await import('/src/progression.js');const P=BKT.PROG;
      for(const h of PR.HERO_IDS){P.xp[h]=xpFloor(${lv});P.skillOwned[h]={};P.loadouts[h]=[];}P.heroes={knight:true,pyro:true,paladin:true,pirate:true,reaper:true,warden:true};
      ${before ? "PR.SKILLS.find(n=>n.id==='reflect'&&n.hero==='paladin').level=7;" : ''}
      const on=PR.skillsFor('paladin').filter(n=>!n.active&&n.level<=${lv}).map(n=>n.id);
      const r=await BK.${what === 'boss' ? 'bossLab' : 'fightLab'}({heroes:['paladin']});return{on,rows:r.rows};})()`, 7200000); }
  finally { pg.close(); }
  writeFileSync(out, JSON.stringify(res)); console.log('level ' + lv + ' done'); }
