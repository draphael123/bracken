/* src/level-guard.js - A LEVEL INDEX OR ID THIS BUILD DOES NOT KNOW NEVER CRASHES A LOAD (claude/levelguard, 11-10).
   A newer build's save (or an older build's main.js beside a newer save, as in the batch155 rollback scare) can name a level this
   LEVELS array has not got: LEVELS[levelIndex] was undefined and the load, then drawWorld, threw. safeLevelIndex turns any want (an index,
   a level id, junk) into a VALID index: the want itself, else the last level the save knows (its map node / last wood), else the inn, else the
   first shop, else 0. It only READS the save: nothing is wiped, rewritten or dropped, so a newer build still reads every field it wrote. */
const ok = (levels, i) => Number.isInteger(i) && i >= 0 && i < levels.length && !!levels[i] && typeof levels[i].build === 'function';
const byId = (levels, id) => typeof id === 'string' ? levels.findIndex(l => l && l.id === id) : -1;
export function safeLevelIndex(levels, want, prog) {
  if (ok(levels, want)) return want;
  const w = byId(levels, want); if (ok(levels, w)) return w;   /* an id string */
  const p = prog && typeof prog === 'object' ? prog : {};
  for (const id of [p.lastLevelId, p.mapNodeId, p.lastLevel, p.lastWood]) { const k = byId(levels, id); if (ok(levels, k) && levels[k].id !== 'custom') return k; }
  for (const id of ['tavern', 'shop']) { const k = byId(levels, id); if (ok(levels, k)) return k; }
  return 0;
}
