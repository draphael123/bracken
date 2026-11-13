import { DM } from './dirmoves.js';
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
    { from: 'scorpion', fromSkin: 'venomscorpion', to: 'scorpion', skin: 'firescorpion', every: 3, min: 3 },     /* scorpion 42%: the cisterns' own skins (fire and thirst already live here) for every third venom scorpion; no new kind, so the curve index holds (foevar3) */
    { from: 'scorpion', fromSkin: 'venomscorpion', to: 'scorpion', skin: 'thirstscorpion', every: 3, min: 2 },
  ],
  glasssea: [
    { from: 'scorpion', fromSkin: 'glassscorpion', to: 'scorpion', skin: 'firescorpion', every: 4, min: 3 },   /* heat glare: the fire scorpion (its hiss and its burning patch tell it) */
    { from: 'scorpion', fromSkin: 'glassscorpion', to: 'scorpion', skin: 'oilscorpion', every: 3, min: 2 },    /* and the oil scorpion (Well Town): skins of the one kind, so the curve index holds (foevar3) */
  ],
  ksar: [
    { from: 'slinger', fromSkin: 'wallslinger', to: 'raptor', every: 3, allow: ['ks'], min: 3 },     /* the falcons' bigger kin keep the walls (the one new kind here) */
    { from: 'cutthroat', fromSkin: 'ksarblade', to: 'shield', skin: 'shieldsentry', every: 4, allow: ['ks'], min: 3 },   /* a door-warden for a blade (threat 2 for 3): pays the raptor's kind term so the curve index holds (foevar3) */
  ],
  buriedcity: [
    { from: 'slinger', fromSkin: 'sandslinger', to: 'scorpion', skin: 'firescorpion', every: 3, x0: 225, min: 2 },     /* heat shimmer: fire scorpions on the sand (no new kind: the brass scorpion already lives here) */
    { from: 'ambusher', fromSkin: 'sanddrowned', to: 'scorpion', skin: 'brassscorpion', every: 3, min: 2 },
  ],
  sealedpyramid: [
    { from: 'mummy', to: 'construct', every: 3, min: 2 },                                            /* mummy 49%: the tomb's clockwork wardens */
    { from: 'mummy', to: 'ambusher', skin: 'sanddrowned', every: 2, min: 2 },                        /* the drowned under the tomb sand */
    { from: 'hound', fromSkin: 'jackal', to: 'vulture', every: 4, x1: 300, min: 2 },                 /* the outer court's carrion bird */
    { from: 'mummy', to: 'scorpion', skin: 'venomscorpion', every: 4, min: 2 },                      /* a tomb scorpion (the kind already lives here) */
  ],
  /* (claude/foevar2) THE WATER ROAD AND THE SHOW (foe-variety audit 11-10, lane F2): only foes the road has already introduced (one-new-foe stays green). Water-bound foes (eel, turtle, heron, feeler) are NOT placed: the
     cast pass cannot give them water (they want a builder), and the grindylow stays in its water. The crossbow is the archer's own slot (it is a perched shooter), the sworn sword a bargee's weight (3.5 for 3.5). */
  towpath: [
    { from: "archer", fromSkin: "watchman", drop: ["tp"], to: "crossbow", every: 6, min: 1 },        /* the watch's own bolt on one of the six watchman perches (Waymeet's crossbow, a perched shooter) */
    { from: "gaffer", fromSkin: "bargeman", drop: ["tp"], to: "runner", every: 2, min: 2 },        /* two squires for two bargemen (threat 1.5 for 3.5: pays the kind term so the curve index holds): his shout fetches the sworn swords already on this bank (the lesson of Waymeet) */
    { from: "gaffer", fromSkin: "bargeman", drop: ["tp"], to: "gaffer", skin: "riverrat", every: 3, min: 1 },   /* and a river rat for a bargeman: a skin of the one kind */
  ],
  canal: [
    { from: "gaffer", fromSkin: "bargeman", drop: ["canal"], to: "runner", every: 4, min: 2 },   /* three squires for three bargemen (1.5 for 3.5: pays the kind term so the curve holds): their shout fetches the rivermen already on the wharves */
    { from: "gaffer", fromSkin: "bargeman", drop: ["canal"], to: "gaffer", skin: "riverrat", every: 2, min: 3 },   /* a river rat for every other bargeman: skins of the one kind */
    { from: "snuffer", fromSkin: "lamplighter", drop: ["canal"], to: "lanternshade", every: 1, min: 3 },     /* the lamplit canal's ghost with a lantern for all three lamplighters (kind for kind: the curve index holds) */
  ],
  fair: [
    { from: "mummer", to: "haunt", every: 2, min: 3 },                                                /* the house of horrors */
    { from: "mummer", to: "armour", every: 3, min: 2 },                                      /* a tin-man in the hall of mirrors (3.5 for a mummer's 5: with the haunt, this pays the two kind terms so the curve index holds) */
    { from: "brute", fromSkin: "strongman", to: "armour", every: 3, min: 2 },                         /* a suit of armour for the strongman's act: 3.5 for 3.5 */
  ],
  kitchengate: [
    { from: 'sprig', to: 'thief', every: 3, min: 4 },          /* the larder thieves: five of the kitchen's fourteen plain sprigs */
    { from: 'rockgoblin', to: 'burngob', every: 2, min: 2 },    /* a cook already alight, in a kitchen: the first and the third rock-thrower */
    { from: 'sprig', to: 'sprig', skin: 'clubsprig', every: 2, min: 3 },               /* the crew with a stick, in a kitchen: skins of one kind (foevar3) */
    { from: 'hearthgob', to: 'archer', skin: 'firearcher', every: 3, allow: ['perch'], min: 2 },   /* a fire-bow for every third hearth goblin (3 -> 2): fire in a kitchen, told by its own arrow; the one new kind here */
  ],
  /* (claude/foevar3) THE SKY, THE KEEP AND THE TOWER (foe-variety audit 11-10, lane F3): rows below; the curve index of every level holds within +-2 (a new kind costs 3 index points, so each is paid for in threat) */
  rookery: [
    { from: 'harpy', to: 'kite', every: 1, x1: 120, allow: ['perch'], min: 2 },        /* goblin kites (pre-Queen) for the perched crag harpies: threat 1.5 for 2.5, which pays the kind term so the curve index holds. The roost and ride harpies keep their roles, and the two perched harpies by the first Shrieker (140) keep their dive (tools/rookery.mjs) */
    { from: 'harpy', to: 'kite', every: 1, x0: 160, allow: ['perch'], min: 3 },
    { from: 'crow', to: 'bat', every: 3, allow: ['perch'], min: 3 },                    /* a bat for every third crow: 1 for 1 */
  ],
  waymeet: [
    { from: 'hedgeknight', to: 'orderpaladin', every: 4, min: 2 },                      /* the order's men at the gates: the whole shield and the offered gleam (src/order-paladin.js; Waymeet is where its header puts them) */
    { from: 'hedgeknight', to: 'crossbow', every: 6, x0: 60, min: 1 },                          /* a bolt for a knight (3 for 4.5): with the paladins, the curve index holds */
  ],
  warcairn: [
    { from: 'soldier', to: 'orderpaladin', every: 5, min: 2 },                          /* two of the order's paladins stand with the keep's men (the parry window is the lesson) */
    { from: 'soldier', to: 'shield', every: 2, min: 2 },                                /* a shield for a spear: 2 for 3, which pays the paladins' kind term so the curve index holds */
    { from: 'soldier', to: 'javelin', every: 3, min: 1 },
  ],
  fallingtower: [
    { from: 'apprentice', to: 'topiary', every: 6, min: 3 },                            /* a hedge-beast that wandered in from the Stair (the one new kind here) */
    { from: 'armour', to: 'mimic', every: 2, x0: 30, min: 3 },                                  /* a mimic for every other suit east of the lab landing (2.5 for 3.5; the armour that stands under the lab pillar stays, tools/fallingtower4.mjs): pays the kind term so the curve index holds; the armour is still the level's second foe. Walkers only: the imps and brooms fly and tools/tower-flyers.mjs holds them to flat ground */
    { from: 'apprentice', to: 'zombie', every: 5, min: 3 },                           /* the drowned scholars of the library: 2 for 2.5 */
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
    { from: 'archer', to: 'archer', skin: 'rockarcher', every: 1, allow: ['perch'], min: 1 },   /* a sling for the bow that is left (fire archers are off-theme in a wooden village) */
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
/* (claude/dmlint, DIRMOVES lane 3) THE DIRECTION SWAPS: rows applied ONLY while DM.on (src/dirmoves.js, default false), so the live levels do not move until the flip.
   tools/dir-mix.mjs holds every act's level to one UP foe (wing / leap-swat), one DOWN (high guard / small) and one PLUNGE (plate / shell / helm / beast); a level that misses one
   swaps a plain kind of its own mix for a theme-fit one here (no new kinds). dy: tiles added to y (a flier is lifted off the floor it would stand on). */
export const DM_SWAPS = {
  underleaf: [{ from: 'sprig', to: 'wasp', every: 1, x0: 350, x1: 362, dy: -4, min: 1 }],   /* the grandmother's potion garden: a wasp over the yard's last sprig = THE UP answer (act I had none) */
  rookery: [{ from: 'fledgling', to: 'rockgoblin', every: 1, x1: 80, min: 1 }],             /* the gully floor: a crag rock-thrower (scree / spire / moor's own kind, before the Goblin Queen) for the fledgling = THE DOWN answer (sweep / plunge; the level had none) */
};
export const PLAIN_KEYS = new Set(['t', 'x', 'y', 'face', 'squad', 'garrison']);
export function castSwaps(L, id, report) {
  const rows = [...(CAST_SWAPS[id] || []), ...(DM.on ? DM_SWAPS[id] || [] : [])]; if (!rows.length || !L || !L.ents) return L;
  for (const r of rows) {
    const allow = (r.allow || []).concat(r.drop || [], r.fromSkin ? ["cnSkin"] : []);   /* (claude/foevar1) fromSkin: only foes in that reskin (and it may carry cnSkin); (claude/foevar2) drop: role objects (canal / tp) that are allowed on the foe and DELETED when it is swapped, so a watchman or bargee that becomes another foe keeps no stale role; the skin may sit on e.canal.cnSkin too */
    const skinOf = e => e.cnSkin || (e.canal && e.canal.cnSkin);
    const hits = L.ents.filter(e => e.t === r.from && (!r.fromSkin || skinOf(e) === r.fromSkin) && e.x >= (r.x0 ?? -1e9) && e.x <= (r.x1 ?? 1e9) && Object.keys(e).every(k => PLAIN_KEYS.has(k) || allow.includes(k))).sort((a, b) => a.x - b.x || a.y - b.y);
    let n = 0; hits.forEach((e, i) => { if (i % r.every === 0) { e.t = r.to; for (const k of r.drop || []) delete e[k]; if (r.skin) e.cnSkin = r.skin; else if (r.fromSkin) delete e.cnSkin; if (r.dy) e.y += r.dy; n++; } });
    if (report) report.push({ id, from: r.from, to: r.to, swapped: n, min: r.min || 1 });
  }
  return L;
}
