import { patch } from './patch.mjs';
patch('src/level.js', [
  ["import { buildCaravan } from './sunken-caravan.js';", "import { buildCaravan } from './sunken-caravan.js';\nimport { lanceLookouts } from './lance-support.js';   /* THE QUEEN'S LANCE: the two end lookouts his bowmen come to (docs/briefs/lance-support.md) */"],
  ["  // the last span, from the seventh pier to the gatehouse. Without it the bridge stopped nine tiles",
   "  /* AND THE TWO ENDS (Daniel, 2026-09-25: \"some platforms to be available to jump on\"): the first pier and the last get a\n     lookout of their own, built like the five above, so a charge that runs you to either end of the bridge has something to\n     hop onto - and they are where his bowmen come down (src/lance-support.js) */\n  const lanceBows = lanceLookouts({ plat, ent }, P0, BY);\n  // the last span, from the seventh pier to the gatehouse. Without it the bridge stopped nine tiles"],
  ["wallL: 301, wallR: 429, boss: 'lance', music: 'musCastle', tint: '#6a7a9a', tintA: 0.10, fx: 'dust' },",
   "wallL: 301, wallR: 429, boss: 'lance', music: 'musCastle', tint: '#6a7a9a', tintA: 0.10, fx: 'dust', bows: lanceBows },"],
]);
