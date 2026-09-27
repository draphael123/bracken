import { patch } from './patch.mjs';
patch('src/lance-support.js', [
  ["// goes on a tower and a plain goblin archer drops onto the end lookout farther from you (two of his at most).",
   "// goes on a tower and a plain goblin archer drops onto the end lookout nearer you (never the one you are standing on;\n// two of his at most). NEARER, not farther: a foe more than 420 px from you is not updated at all (updateEnemies), and a\n// bowman at the far end of a 127-tile bridge would stand there frozen, which is no support."],
  [".sort((a, b) => Math.abs(mid(b) - P.x) - Math.abs(mid(a) - P.x));", ".sort((a, b) => Math.abs(mid(a) - P.x) - Math.abs(mid(b) - P.x));"],
]);
patch('docs/briefs/lance-support.md', [
  ["- **Which lookout:** the end one farther from you, unless one of his bowmen already holds it; never the one you stand on.",
   "- **Which lookout:** the end one nearer you, unless one of his bowmen already holds it; never the one you stand on.\n  (Nearer, not farther: a foe more than 420 px from you is not updated at all, and a bowman at the far end of the\n  bridge would stand there frozen.)"],
]);
