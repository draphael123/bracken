/* tools/hero-hp.mjs - max hp of every hero at a campaign level (claude/oneshotcap; a measure). PORT=8905 node tools/hero-hp.mjs 3,5,12,...  -> JSON {level:{hero:maxHp}} */
import { openPage } from './cdp.mjs';
const lv = (process.argv[2] || '3').split(',').map(Number), pg = await openPage({ audio: false, fonts: false }), out = {};
try { await pg.reload(); const H = await pg.evalp(`(async()=>{const PR=await import('/src/progression.js');return PR.HERO_IDS;})()`);
  for (const n of lv) { out[n] = {}; for (const h of H) out[n][h] = await pg.evalp(`(async()=>{BK.manualSimulation=true;const P0=BKT.PROG;BKT.setHeroLevel(${JSON.stringify(h)},${n});P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[${JSON.stringify(h)}]={};P0.loadouts[${JSON.stringify(h)}]=[];if(P0.talents)P0.talents[${JSON.stringify(h)}]={};BK.setHero(${JSON.stringify(h)});BK.reset({fresh:true});BK.applyUpgrades();return BK.P.maxHp;})()`); } }
finally { pg.close(); }
console.log(JSON.stringify(out));
