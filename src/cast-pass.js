/* src/cast-pass.js - THE CAST PASS's by-level foe swaps (claude/foecast, Daniel 11-02/11-05: "too many generic goblins; the interesting goblin types sit in one
   level"). Data only, no new foe code: the level's build() runs this over its finished ents (the last wrapper, like src/variety-pass.js and src/goblin-sweep.js), so
   the sprinkler's foes are seen and the hand-written builders - which other lanes are editing - are not touched.
   Each row: { from, to, every, x0, x1 } : of the PLAIN foes of kind `from` standing in columns [x0, x1], the first and then every Nth becomes `to`.
   "Plain" = an ent that carries no more than { t, x, y, face, squad, garrison }: an elite, a sleeper, a told lesson (answers), a fire archer, a cutter on a rope
   all keep their kind. Swaps are like-for-like in THREAT (src/threat.js), so a level keeps its curve (tools/curve.mjs). tools/foe-cast-lint.mjs holds every row to
   its promise: each row must find at least `min` targets, so a level that moves under it makes the lint say so instead of the swap quietly missing. */
export const CAST_SWAPS = {
  kitchengate: [
    { from: 'sprig', to: 'thief', every: 3, min: 4 },          /* the larder thieves: five of the kitchen's fourteen plain sprigs */
    { from: 'rockgoblin', to: 'burngob', every: 2, min: 2 },    /* a cook already alight, in a kitchen: the first and the third rock-thrower */
  ],
  storm: [
    { from: 'sprig', to: 'thief', every: 2, x0: 100, min: 2 },        /* the Outer Works' sneaks */
    { from: 'archer', to: 'gobmage', every: 3, x0: 200, min: 3 },     /* a mage on the wall for every third bow: ranged for ranged */
    { from: 'pike', to: 'sapper', every: 3, x0: 300, min: 2 },        /* a bomber for every third pike on the east stretch */
  ],
  scree: [
    { from: 'sprig', to: 'thief', every: 5, x0: 100, min: 2 },        /* cutpurses on the path */
  ],
  hanging: [
    { from: 'sprig', to: 'thief', every: 3, min: 1 },               /* the village's thief, up in the boughs */
  ],
};
export const PLAIN_KEYS = new Set(['t', 'x', 'y', 'face', 'squad', 'garrison']);
export function castSwaps(L, id, report) {
  const rows = CAST_SWAPS[id]; if (!rows || !L || !L.ents) return L;
  for (const r of rows) {
    const hits = L.ents.filter(e => e.t === r.from && e.x >= (r.x0 ?? -1e9) && e.x <= (r.x1 ?? 1e9) && Object.keys(e).every(k => PLAIN_KEYS.has(k))).sort((a, b) => a.x - b.x || a.y - b.y);
    let n = 0; hits.forEach((e, i) => { if (i % r.every === 0) { e.t = r.to; n++; } });
    if (report) report.push({ id, from: r.from, to: r.to, swapped: n, min: r.min || 1 });
  }
  return L;
}
