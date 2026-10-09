require('./rep.cjs')('src/campaign-kit.js', rep => {
rep("import { FLASK } from './survival.js';", "import { FLASK } from './survival.js';\nimport * as F2 from './flasks2.js';");
rep("export const flaskUpAt = (id, d) => Math.min(FLASK.extraMax, Math.max(0, actOf(id, d).act - 1));\nexport const flasksAt = (id, d) => FLASK.base + flaskUpAt(id, d);",
  "export const flaskUpAtOld = (id, d) => Math.min(2, Math.max(0, actOf(id, d).act - 1));   /* (the survival2 rule, kept for the before/after tables) */\n" +
  "/* (claude/flasks2, Daniel 10-08) THE TYPICAL FLASK BUILD - the CAMPAIGN KIT's flasks, what B6 tunes every boss WITH (src/flasks2.js typicalFlaskKit):\n" +
  "     EXTRA FLASK I from depth 3, EXTRA FLASK II once the Goblin Queen (crown) is beaten  -> 1 flask to depth 2, 2 to Highcrown, 3 after it\n" +
  "     RICH DRAUGHT once the Stockade is beaten (40%), DISTILLED once the Underwater Keep is beaten (45%); the card's RICH FLASK (+10, the typical L5 pick) on top\n" +
  "     QUICK DRAUGHT from act II (0.5 s drink), SHRINE BLESSING from act III. The hidden three are never typical.\n" +
  "   beaten: the level ids cleared before this one (beatenBeforeIn). */\n" +
  "export const flaskKitAt = (id, d, beaten = []) => F2.typicalFlaskKit({ depth: d, beaten, act: actOf(id, d).act });\n" +
  "export const flaskUpAt = (id, d, beaten = []) => F2.countOf({ flaskItems: flaskKitAt(id, d, beaten) });\n" +
  "export const flasksAt = (id, d, beaten = []) => FLASK.base + flaskUpAt(id, d, beaten);");
rep("  P0.flaskUp = c.flaskUp ?? flaskUpAt(c.id, c.depth);   /* before the reset: BK.reset fills the flasks to flaskMax */",
  "  P0.flaskItems = { ...(c.flaskItems || flaskKitAt(c.id, c.depth, c.beaten || [])) }; P0.flaskUp = c.flaskUp ?? F2.countOf(P0);   /* before the reset: BK.reset fills the flasks to flaskMax (claude/flasks2: the typical flask build) */");
rep("tonics: tonicsAt(d), flaskUp: flaskUpAt(id, d), charm:", "tonics: tonicsAt(d), flaskItems: flaskKitAt(id, d, beatenBeforeIn(levels, id)), charm:");
});
require('./rep.cjs')('tools/level-jump.mjs', rep => {
rep("ok(k.flasks === k.flaskMax && k.flaskMax === flasksAt(id, d), id + ': flasks ' + k.flasks + '/' + k.flaskMax + ' want ' + flasksAt(id, d) + ' (survival2: 1 in act I, 2 from act II, 3 from act III)');",
  "ok(k.flasks === k.flaskMax && k.flaskMax === flasksAt(id, d, beatenBefore(id)), id + ': flasks ' + k.flasks + '/' + k.flaskMax + ' want ' + flasksAt(id, d, beatenBefore(id)) + ' (flasks2: the typical flask build - 1 to depth 2, 2 to Highcrown, 3 after it)');");
});
