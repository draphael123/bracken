/* src/cast-pass.js - THE CAST PASS's by-level foe swaps (claude/foecast, Daniel 11-02/11-05: "too many generic goblins; the interesting goblin types sit in one
   level"). Data only, no new foe code: the level's build() runs this over its finished ents (the last wrapper, like src/variety-pass.js and src/goblin-sweep.js), so
   the sprinkler's foes are seen and the hand-written builders - which other lanes are editing - are not touched.
   Each row: { from, to, every, x0, x1 } : of the PLAIN foes of kind `from` standing in columns [x0, x1], the first and then every Nth becomes `to`.
   "Plain" = an ent that carries no more than { t, x, y, face, squad, garrison }: an elite, a sleeper, a told lesson (answers), a fire archer, a cutter on a rope
   all keep their kind. Swaps are like-for-like in THREAT (src/threat.js), so a level keeps its curve (tools/curve.mjs). tools/foe-cast-lint.mjs holds every row to
   its promise: each row must find at least `min` targets, so a level that moves under it makes the lint say so instead of the swap quietly missing. */
/* (claude/foevariety) a row may also carry skin: a cnSkin to give the swapped foe (the archer variants and the club goblin, src/foe-variety.js), and allow: extra ent keys that
   do not change the foe's brain and so do not make it "not plain" (perch: an archer on a ledge keeps its ledge). */
export const CAST_SWAPS = {
  /* (claude/foevar1) THE DESERT'S CAST PASS (foe-variety audit 11-10, lane F1). Only foes the road has ALREADY introduced (tools/one-new-foe.mjs): the water-thief (Well Town), the fire / venom scorpion
     (Well Town, hands live on every level), the raptor (Red Gorge: the vulture's machine), the sand-drowned (Buried City). fromSkin picks a level's own reskin to thin; the swapped foe drops it. */
  caravan: [
    { from: 'cutthroat', to: 'scorpion', every: 4, min: 2 },                                          /* the first desert level has only the seven base foes: a claw for every fourth blade, threat 3 for 3 */
  ],
  underwell: [
    { from: 'scorpion', fromSkin: 'venomscorpion', to: 'waterthief', every: 3, min: 4 },             /* scorpion 42%: the wells' own thief (blue, Well Town) for every third venom scorpion */
  ],
  glasssea: [
    { from: 'scorpion', fromSkin: 'glassscorpion', to: 'scorpion', skin: 'firescorpion', every: 4, min: 3 },   /* heat glare: the fire scorpion (its hiss and its burning patch tell it) */
    { from: 'cutthroat', fromSkin: 'nighthunter', to: 'waterthief', every: 4, min: 2 },
    { from: 'vulture', to: 'raptor', every: 3, min: 2 },                                              /* the cliff bird over the glass: the vulture's machine, dmg 12 */
  ],
  ksar: [
    { from: 'slinger', fromSkin: 'wallslinger', to: 'raptor', every: 4, allow: ['ks'], min: 3 },     /* the falcons' bigger kin keep the walls */
    { from: 'cutthroat', fromSkin: 'ksarblade', to: 'waterthief', every: 4, allow: ['ks'], min: 3 },
    { from: 'cutthroat', fromSkin: 'ksarblade', to: 'scorpion', skin: 'firescorpion', every: 5, allow: ['ks'], min: 2 },   /* fire at the gates */
  ],
  buriedcity: [
    { from: 'slinger', fromSkin: 'sandslinger', to: 'raptor', every: 5, min: 2 },                    /* circling over the streets */
    { from: 'slinger', fromSkin: 'sandslinger', to: 'vulture', every: 4, min: 2 },
    { from: 'ambusher', fromSkin: 'sanddrowned', to: 'scorpion', skin: 'firescorpion', every: 4, min: 2 },
  ],
  sealedpyramid: [
    { from: 'mummy', to: 'construct', every: 3, min: 2 },                                            /* mummy 49%: the tomb's clockwork wardens */
    { from: 'mummy', to: 'ambusher', skin: 'sanddrowned', every: 2, min: 2 },                        /* the drowned under the tomb sand */
    { from: 'mummy', to: 'cutthroat', every: 2, min: 1 },                                            /* a tomb robber */
    { from: 'hound', fromSkin: 'jackal', to: 'vulture', every: 4, x1: 300, min: 2 },                 /* the outer court's carrion bird */
  ],
  kitchengate: [
    { from: 'sprig', to: 'thief', every: 3, min: 4 },          /* the larder thieves: five of the kitchen's fourteen plain sprigs */
    { from: 'rockgoblin', to: 'burngob', every: 2, min: 2 },    /* a cook already alight, in a kitchen: the first and the third rock-thrower */
  ],
  storm: [
    { from: 'sprig', to: 'thief', every: 2, x0: 100, min: 2 },        /* the Outer Works' sneaks */
    { from: 'archer', to: 'gobmage', every: 3, x0: 200, min: 3 },     /* a mage on the wall for every third bow: ranged for ranged */
    { from: 'pike', to: 'sapper', every: 3, x0: 300, min: 2 },        /* a bomber for every third pike on the east stretch */
  ],
  /* (claude/foevariety) THE DEMO LEVELS' POST-DEMO CAST (foecast's proposals, Daniel 11-05): the club goblin for the bare sprig, the archer variants for the plain bow, a few
     interesting goblins where the level's theme wants them. Variants are the archer's / sprig's own AI in a skin, so they are the same FOE FAMILY (one-new-foe counts the kind, not the skin). */
  fenroad: [
    { from: 'archer', to: 'archer', skin: 'venomarcher', every: 2, min: 2 },       /* the marsh's own poison, on the bow */
    { from: 'sprig', to: 'sprig', skin: 'clubsprig', every: 3, min: 4 },            /* the crew with a stick */
  ],
  stockade: [
    { from: 'archer', to: 'archer', skin: 'firearcher', every: 2, allow: ['perch'], min: 2 },   /* fire arrows at a wooden stockade */
    { from: 'archer', to: 'archer', skin: 'rockarcher', every: 2, allow: ['perch'], min: 1 },   /* stone-slingers on the tower tops */
    { from: 'sprig', to: 'sprig', skin: 'clubsprig', every: 1, min: 2 },
    { from: 'pike', to: 'sapper', every: 1, min: 2 },                                         /* a bomber for a spear: the same 3 */
  ],
  underleaf: [
    { from: 'archer', to: 'archer', skin: 'venomarcher', every: 1, min: 3 },
    { from: 'sprig', to: 'thief', every: 3, min: 5 },                                         /* the village's herb-thieves (its reskin gives them the village's look); snuffer stays the Hanging Village's own foe */
  ],
  palisadewood: [
    { from: 'archer', to: 'archer', skin: 'firearcher', every: 2, allow: ['perch'], min: 4 },
    { from: 'archer', to: 'archer', skin: 'rockarcher', every: 2, allow: ['perch'], min: 3 },
    { from: 'pike', to: 'sapper', every: 2, min: 4 },                                          /* the siege crew's powder */
    { from: 'sprig', to: 'sprig', skin: 'clubsprig', every: 1, allow: ['perch'], min: 2 },
  ],
  kings: [
    { from: 'archer', to: 'archer', skin: 'rockarcher', every: 2, allow: ['perch'], min: 2 },
    { from: 'sprig', to: 'sprig', skin: 'clubsprig', every: 2, min: 3 },
    { from: 'shield', to: 'sentry', every: 3, min: 2 },                                        /* the court's own door-wardens */
    { from: 'hound', to: 'thief', every: 2, min: 1 },
  ],
  hanging: [
    { from: 'sprig', to: 'thief', every: 3, min: 1 },               /* the village's thief, up in the boughs */
  ],
};
export const PLAIN_KEYS = new Set(['t', 'x', 'y', 'face', 'squad', 'garrison']);
export function castSwaps(L, id, report) {
  const rows = CAST_SWAPS[id]; if (!rows || !L || !L.ents) return L;
  for (const r of rows) {
    const allow = r.fromSkin ? (r.allow || []).concat('cnSkin') : (r.allow || []);   /* (claude/foevar1) fromSkin: only foes in that reskin (and it may carry cnSkin) */
    const hits = L.ents.filter(e => e.t === r.from && (!r.fromSkin || e.cnSkin === r.fromSkin) && e.x >= (r.x0 ?? -1e9) && e.x <= (r.x1 ?? 1e9) && Object.keys(e).every(k => PLAIN_KEYS.has(k) || allow.includes(k))).sort((a, b) => a.x - b.x || a.y - b.y);
    let n = 0; hits.forEach((e, i) => { if (i % r.every === 0) { e.t = r.to; if (r.skin) e.cnSkin = r.skin; else if (r.fromSkin) delete e.cnSkin; n++; } });
    if (report) report.push({ id, from: r.from, to: r.to, swapped: n, min: r.min || 1 });
  }
  return L;
}
