import { LEVELS } from '../../../src/level.js';
import { levelHash } from '../../../tools/level-quality.mjs';
for (const id of ['rootway','skyroad','glasssea']) { const lv = LEVELS.find(l=>l.id===id); const L = lv.build(); const a = levelHash(lv); const rs=L.routeSupports; console.log(id, a, 'supports', rs&&rs.length); }
