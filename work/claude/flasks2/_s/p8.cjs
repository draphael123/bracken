const P = require('./rep.cjs');
P('src/progression.js', rep => rep(" { id: 'tonic', name: 'RICH FLASK', what: 'A FLASK HEALS 45%, NOT 35%', minor: true },",
  " { id: 'tonic', name: 'SECOND DRAUGHT', what: 'A FLASK ALSO REFILLS YOUR STAMINA', minor: true },   /* (claude/flasks2, Daniel 10-09: RICH FLASK folded into the store's POTENCY tiers - the card is a non-heal flask perk now; a save that took RICH FLASK keeps this pick, same id) */"));
P('src/flasks2.js', rep => {
  rep("export const POTENCY = { base: 0.35, perk: 0.10 };   /* +35% of max health a flask; the card's RICH FLASK adds +10 on top of the store's tier */",
      "export const POTENCY = { base: 0.35, cap: 0.50 };   /* +35% of max health a flask; the store's tiers only, 50% at most (Daniel 10-09: the card's RICH FLASK is folded in - it is SECOND DRAUGHT now, stamina) */");
  rep("export const healPct = (prog, cardPerk = false) => tierHeal(prog) + (cardPerk ? POTENCY.perk : 0);", "export const healPct = prog => Math.min(POTENCY.cap, tierHeal(prog));");
  rep("export function kitLine(items, cardPerk = false) {", "export function kitLine(items) {");
  rep("Math.round(100 * healPct(p, cardPerk))", "Math.round(100 * healPct(p))");
  rep("The best one owned is the flask's heal; the level-up card's RICH FLASK\n//              (progression.js minor perk 'tonic') still adds its +10 on top.", "The best one owned is the flask's heal, 50% at most. (Daniel 10-09: the level-up\n//              card's RICH FLASK, minor perk 'tonic', is folded in: the card is SECOND DRAUGHT now - a flask also refills the stamina.)");
  rep("(the old RICH FLASK is the level-up card perk and stays one)", "(the old RICH FLASK card pick keeps its id: it is SECOND DRAUGHT now)");
});
P('src/main.js', rep => rep("const h = SV.flaskHeal(P.maxHp, F2.healPct(PROG, perk('tonic'))); P.hp = Math.min(P.maxHp, P.hp + h);",
  "const h = SV.flaskHeal(P.maxHp, F2.healPct(PROG)); P.hp = Math.min(P.maxHp, P.hp + h); if (perk('tonic')) P.st = P.maxSt;   /* SECOND DRAUGHT (the card, claude/flasks2 10-09): the swallow refills the stamina too */"));
P('src/main.js', rep => rep("flaskHealPct: () => F2.healPct(PROG, perk('tonic')),", "flaskHealPct: () => F2.healPct(PROG),"));
P('src/campaign-kit.js', rep => rep("DISTILLED once the Underwater Keep is beaten (45%); the card's RICH FLASK (+10, the typical L5 pick) on top", "DISTILLED once the Underwater Keep is beaten (45%); the store's tiers only (the card is SECOND DRAUGHT, stamina, since 10-09)"));
P('tools/flasks2.mjs', rep => {
  rep("assert.equal(F2.healPct({}), 0.35); assert.equal(Math.round(100 * F2.healPct({}, true)), 45, 'the card RICH FLASK adds 10');",
      "assert.equal(F2.healPct({}), 0.35); assert.equal(F2.POTENCY.cap, 0.50);   /* (Daniel 10-09: the store's tiers only - the card no longer heals) */\n  { const PR = await import('../src/progression.js'), c = PR.MINOR_PERKS.find(k => k.id === 'tonic'); assert.ok(c && c.name === 'SECOND DRAUGHT' && !/HEAL|%/.test(c.what), 'the old RICH FLASK card is not the non-heal SECOND DRAUGHT: ' + JSON.stringify(c)); }");
  rep("assert.equal(F2.healPct(own('rich', 'sunlight')), 0.50, 'the best one owned');", "assert.equal(F2.healPct(own('rich', 'sunlight')), 0.50, 'the best one owned'); assert.equal(F2.healPct(own('rich', 'distilled', 'sunlight')), 0.50, 'potency caps at 50%');");
  rep("o.std=swallow('');", "o.std=swallow('');o.card=swallow(\"BKT.PROG.card.knight=Object.assign({},BKT.PROG.card.knight,{ms:Object.assign({},(BKT.PROG.card.knight||{}).ms,{5:'tonic'})});BKT.setHeroLevel&&0;BK.P.st=1;\");o.cardSt=BK.P.st>=BK.P.maxSt-0.5;");
  rep("    ok(d.std.began && Math.abs(d.std.frames - want) <= 3,", "    ok(d.card.pct === d.std.pct && d.card.heal === d.std.heal, 'the SECOND DRAUGHT card changed the heal: ' + JSON.stringify([d.card, d.std]));\n    ok(d.cardSt, 'SECOND DRAUGHT did not refill the stamina');\n    ok(d.std.began && Math.abs(d.std.frames - want) <= 3,");
});
