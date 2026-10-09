require('./rep.cjs')('tools/boss-run.mjs', rep => {
rep("import { campaignLevel, levelOverride } from './boss-level.mjs';",
 "import { campaignLevel, levelOverride } from './boss-level.mjs';\nimport { LEVELS } from '../src/level.js';\nimport { depthsOf } from '../src/campaign-order.js';\nimport { flaskKitAt, beatenBeforeIn } from '../src/campaign-kit.js';\n" +
 "/* (claude/flasks2, B6: bosses are tuned WITH the campaign kit's flasks) THE FLASKS A FIGHT CARRIES: 'kit' (the default) - the typical flask build at that\n" +
 "   point of the road (src/campaign-kit.js flaskKitAt: count, potency, QUICK DRAUGHT); 'bare' - one flask at 35%, what every boss row was measured with before\n" +
 "   (a fresh page's save). --flasks=bare|kit on boss-rates, or BOSS_FLASKS=bare. */\n" +
 "const DEPTH = depthsOf(LEVELS);\nexport const fightFlasks = (id, mode = process.env.BOSS_FLASKS || 'kit') => mode === 'bare' ? {} : flaskKitAt(id, DEPTH[id] ?? 1, beatenBeforeIn(LEVELS, id));");
rep("export function fightJs({ r, way, h, s, profile }, secs = 240) {\n  const [id, fl] = r.split(':'), lvl = levelOverride() ?? campaignLevel(id), built = way === 'built';",
 "export function fightJs({ r, way, h, s, profile, flasks }, secs = 240) {\n  const [id, fl] = r.split(':'), lvl = levelOverride() ?? campaignLevel(id), built = way === 'built', fk = fightFlasks(id, flasks), fkN = Object.keys(fk).filter(k => ['tonic', 'extra2', 'extra3'].includes(k)).length;");
rep("    BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const maxHp=BK.P.maxHp;",
 "    P0.flaskItems=${JSON.stringify(fk)};P0.flaskUp=${fkN};\n    BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();const maxHp=BK.P.maxHp,flasks0=BK.P.flasks,heal0=BK.flaskHealPct?BK.flaskHealPct():null;");
rep("    return {maxHp,kit,outcome:", "    return {maxHp,kit,flasks0,heal0,drank:r.health&&r.health.drinks,outcome:");
});
require('./rep.cjs')('tools/boss-rates.mjs', rep => {
rep("const ways = opt('ways', 'practiced,first,built').split(','), prof = opt('profile', STANDARD), OUT = opt('out', '');",
 "const ways = opt('ways', 'practiced,first,built').split(','), prof = opt('profile', STANDARD), OUT = opt('out', ''), flasks = opt('flasks', process.env.BOSS_FLASKS || 'kit');   /* (claude/flasks2) kit: the campaign kit's flasks (B6); bare: one flask at 35% (the old rows) */");
rep("fights.push({ r, way, h, s, profile: prof });", "fights.push({ r, way, h, s, profile: prof, flasks });");
rep("console.log('\nBOSS RATES  profile ' + prof + '  ('", "console.log('\nBOSS RATES  profile ' + prof + '  flasks ' + flasks + '  ('");
});
