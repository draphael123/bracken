/* ITEM 5 (small fixes, 2026-09-24): does a passive really change a boss fight? bossLab with the passive ON (its own level) and
   OFF (moved to 99), same hero level, `reps` different pinned rolls (bossLab opts.seed), nothing owned.
   node work/claude/passive-reps.mjs out.json hero passiveId level boss1,boss2 reps   Not in the suite. */
import { openPage } from '../../tools/cdp.mjs'; import { writeFileSync } from 'node:fs';
const [out, hero, id, lvS, bossS, repS] = process.argv.slice(2), lv = +lvS, bosses = bossS.split(','), reps = +(repS || 5);
const res = { hero, id, lv, bosses, reps, on: [], off: [] };
for (const mode of (process.env.MODES || 'on,off').split(',')) for (let r = +(process.env.FROM || 1); r <= reps; r++) { const pg = await openPage({ audio: false, fonts: false });
  try { const x = await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js'),PR=await import('/src/progression.js');const P=BKT.PROG;
      for(const h of PR.HERO_IDS){P.xp[h]=xpFloor(${lv});P.skillOwned[h]={};P.loadouts[h]=[];}P.heroes={knight:true,pyro:true,paladin:true,pirate:true,reaper:true,warden:true};
      ${mode === 'off' ? `PR.SKILLS.find(n=>n.id==='${id}'&&n.hero==='${hero}').level=99;` : ''}
      const r=await BK.bossLab({heroes:['${hero}'],${bosses[0]==='all'?'':'bosses:'+JSON.stringify(bosses)+','}seed:'rep${r}',nudge:${r-3}});return {tal:BKT.tal('${id}'),rows:r.rows};})()`, 7200000);
    res[mode].push(x); } finally { pg.close(); }
  writeFileSync(out, JSON.stringify(res)); console.log(mode, r); }
