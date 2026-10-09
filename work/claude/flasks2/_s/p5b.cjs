require('./rep.cjs')('tools/boss-rates.mjs', rep => {
rep("const ways = opt('ways', 'practiced,first,built').split(','), prof = opt('profile', STANDARD), OUT = opt('out', '');",
 "const ways = opt('ways', 'practiced,first,built').split(','), prof = opt('profile', STANDARD), OUT = opt('out', ''), flasks = opt('flasks', process.env.BOSS_FLASKS || 'kit');   /* (claude/flasks2) kit: the campaign kit's flasks (B6); bare: one flask at 35% (the old rows) */");
rep("fights.push({ r, way, h, s, profile: prof });", "fights.push({ r, way, h, s, profile: prof, flasks });");
rep("BOSS RATES  profile ' + prof + '  ('", "BOSS RATES  profile ' + prof + '  flasks ' + flasks + '  ('");
});
