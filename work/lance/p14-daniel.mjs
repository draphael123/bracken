import { patch } from './patch.mjs';
patch('src/level.js', [
  ["  // the towers loose at you on the open spans\n  ent('archer', 322, BY - 1, { face: 1, fire: true }); ent('archer', 358, BY - 1, { face: -1, fire: true });\n  ent('rockgoblin', 394, BY - 1, { face: -1 }); ent('archer', 412, BY - 1, { face: -1, fire: true });",
   "  /* (THE THREE FIRE ARCHERS WENT, Daniel 2026-09-25: the bowmen HE calls to the end lookouts are his ranged support now, told\n     and at a pace - three more standing on the boards inside his walls made up to five bows at once. The rock goblin stays.) */\n  ent('rockgoblin', 394, BY - 1, { face: -1 });"],
]);
patch('src/main.js', [
  ["'INTO THE WATER', 'PUSHED BACK']);", "'INTO THE WATER', 'PUSHED BACK', \"THE QUEEN'S BOWS\"]);"],
]);
